from ninja import Router
from django.shortcuts import get_object_or_404
from django.http import Http404
from datetime import date
import uuid
from uuid import UUID

from operaciones.models import Reserva, Servicio, Vehiculo, Conductor, MensajeContacto
from operaciones.schemas import ReservaCreateSchema, ReservaOutSchema, ReservaAdminUpdateSchema, Schema, ModelSchema, MensajeContactoIn

class ServicioOutSchema(ModelSchema):
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion', 'tarifa_referencial', 'activo']

router = Router(tags=["Operaciones"])

@router.get("/servicios", response=list[ServicioOutSchema])
def listar_servicios(request):
    """
    Lista los servicios activos disponibles para reserva.
    """
    return Servicio.objects.filter(activo=True)

@router.post("/reservas", response={201: ReservaOutSchema})
def crear_reserva(request, payload: ReservaCreateSchema):
    """
    Crea una nueva reserva desde la web.
    La tarifa referencial se asigna como tarifa final provisional.
    """
    # Tarifa referencial pasa a tarifa final temporalmente
    
    servicio = get_object_or_404(Servicio, id=payload.servicio_id)

    # Generar código único básico, e.g. MG-XXXX
    codigo = f"MG-{str(uuid.uuid4().int)[:6]}"
    
    reserva = Reserva.objects.create(
        codigo_reserva=codigo,
        cliente=None,  # No vinculamos usuario auth
        cliente_nombre=payload.cliente_nombre,
        cliente_correo=payload.cliente_correo,
        cliente_telefono=payload.cliente_telefono,
        servicio=servicio,
        fecha_hora_inicio=payload.fecha_hora_inicio,
        fecha_hora_fin=payload.fecha_hora_fin,
        cantidad_pasajeros=payload.cantidad_pasajeros,
        origen=payload.origen,
        destino=payload.destino,
        tarifa_final=servicio.tarifa_referencial,
        estado_reserva=Reserva.EstadoReserva.PENDIENTE,
        notas=payload.notas
    )

    return 201, reserva

@router.put("/reservas/{reserva_id}/admin", response={200: ReservaOutSchema})
def admin_actualizar_reserva(request, reserva_id: UUID, payload: ReservaAdminUpdateSchema):
    """
    Endpoint para el administrador. Permite cerrar la tarifa final,
    asignar recursos y confirmar la reserva.
    Aplica regla: Un vehículo/conductor no puede estar en dos reservas el mismo día.
    """
    # idealmente: if not request.user.is_staff: raise HttpError(403, "Forbidden")
    
    reserva = get_object_or_404(Reserva, id=reserva_id)

    # Validar bloqueo de recursos por solapamiento
    from django.db.models import Q
    
    if payload.vehiculo_id:
        reservas_mismo_vehiculo = Reserva.objects.filter(
            vehiculo_id=payload.vehiculo_id
        ).filter(
            Q(fecha_hora_inicio__lt=reserva.fecha_hora_fin, fecha_hora_fin__gt=reserva.fecha_hora_inicio)
        ).exclude(id=reserva.id).exclude(
            estado_reserva__in=[Reserva.EstadoReserva.CANCELADA, Reserva.EstadoReserva.RECHAZADA]
        )
        if reservas_mismo_vehiculo.exists():
            raise HttpError(400, "El vehículo seleccionado ya está reservado para este horario.")

    if payload.conductor_id:
        reservas_mismo_conductor = Reserva.objects.filter(
            conductor_id=payload.conductor_id
        ).filter(
            Q(fecha_hora_inicio__lt=reserva.fecha_hora_fin, fecha_hora_fin__gt=reserva.fecha_hora_inicio)
        ).exclude(id=reserva.id).exclude(
            estado_reserva__in=[Reserva.EstadoReserva.CANCELADA, Reserva.EstadoReserva.RECHAZADA]
        )
        if reservas_mismo_conductor.exists():
            raise HttpError(400, "El conductor seleccionado ya está reservado para este horario.")

    # Actualizar la reserva
    reserva.tarifa_final = payload.tarifa_final
    reserva.estado_reserva = payload.estado_reserva
    
    if payload.estado_pago:
        reserva.estado_pago = payload.estado_pago
    if payload.metodo_pago_registro:
        reserva.metodo_pago_registro = payload.metodo_pago_registro

    if payload.vehiculo_id:
        reserva.vehiculo_id = payload.vehiculo_id
    if payload.conductor_id:
        reserva.conductor_id = payload.conductor_id

    reserva.save()
    
    return 200, reserva

@router.get("/reservas", response=list[ReservaOutSchema])
def listar_reservas(request):
    """
    Lista las reservas. (Filtro por usuario si aplica)
    """
    if request.user.is_staff:
        reservas = Reserva.objects.all()
    elif request.user.is_authenticated:
        reservas = Reserva.objects.filter(cliente=request.user)
    else:
        # fallback for testing
        reservas = Reserva.objects.all()
    
    return reservas

@router.post("/contacto/", response={200: dict})
def recibir_contacto(request, payload: MensajeContactoIn):
    """
    Recibe los datos del formulario de contacto y los guarda en la base de datos.
    """
    MensajeContacto.objects.create(
        nombre=payload.nombre,
        email=payload.email,
        telefono=payload.telefono,
        asunto=payload.asunto,
        mensaje=payload.mensaje
    )
    return {"success": True, "message": "Mensaje enviado"}
