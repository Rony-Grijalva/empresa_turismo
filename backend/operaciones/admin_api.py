from ninja import Router
from ninja_jwt.authentication import JWTAuth
from operaciones.models import Reserva, Vehiculo, MensajeContacto
from operaciones.schemas import ReservaOutSchema, ReservaEstadoUpdateSchema, ReservaInSchema
from django.shortcuts import get_object_or_404
from ninja.errors import HttpError
from uuid import UUID

admin_router = Router(auth=JWTAuth())

@admin_router.get("/stats/", tags=["Admin"])
def get_dashboard_stats(request):
    """
    Retorna métricas clave para el dashboard administrativo.
    """
    total_reservas = Reserva.objects.count()
    reservas_pendientes = Reserva.objects.filter(estado_reserva=Reserva.EstadoReserva.PENDIENTE).count()
    total_vehiculos = Vehiculo.objects.count()
    total_mensajes = MensajeContacto.objects.count()

    return {
        "reservas": {
            "total": total_reservas,
            "pendientes": reservas_pendientes
        },
        "vehiculos": total_vehiculos,
        "mensajes": total_mensajes
    }

@admin_router.get("/reservas/", tags=["Admin", "Reservas"], response=list[ReservaOutSchema])
def admin_listar_reservas(request):
    """
    Lista todas las reservas ordenadas por fecha reciente.
    """
    return Reserva.objects.all().order_by('-created_at')

from django.contrib.auth import get_user_model
import uuid

@admin_router.post("/reservas/", tags=["Admin", "Reservas"], response={201: ReservaOutSchema})
def admin_crear_reserva(request, payload: ReservaInSchema):
    """
    Crea una nueva reserva manualmente desde el panel de administración.
    """
    User = get_user_model()
    cliente = get_object_or_404(User, id=payload.cliente_id)
    
    codigo = f"MG-{str(uuid.uuid4().int)[:6]}"
    
    reserva = Reserva.objects.create(
        codigo_reserva=codigo,
        cliente=cliente,
        servicio_id=payload.servicio_id,
        vehiculo_id=payload.vehiculo_id,
        conductor_id=payload.conductor_id,
        fecha_servicio=payload.fecha_servicio,
        hora_servicio=payload.hora_servicio,
        cantidad_pasajeros=payload.cantidad_pasajeros,
        origen=payload.origen,
        destino=payload.destino,
        tarifa_final=payload.tarifa_final,
        estado_reserva=payload.estado_reserva,
        estado_pago=payload.estado_pago or Reserva.EstadoPago.PENDIENTE,
        metodo_pago_registro=payload.metodo_pago_registro,
        notas=payload.notas
    )
    return 201, reserva

@admin_router.put("/reservas/{reserva_id}/", tags=["Admin", "Reservas"], response={200: ReservaOutSchema})
def admin_actualizar_reserva(request, reserva_id: UUID, payload: ReservaInSchema):
    """
    Actualiza completamente una reserva existente.
    """
    reserva = get_object_or_404(Reserva, id=reserva_id)
    
    User = get_user_model()
    cliente = get_object_or_404(User, id=payload.cliente_id)
    
    reserva.cliente = cliente
    reserva.servicio_id = payload.servicio_id
    reserva.vehiculo_id = payload.vehiculo_id
    reserva.conductor_id = payload.conductor_id
    reserva.fecha_servicio = payload.fecha_servicio
    reserva.hora_servicio = payload.hora_servicio
    reserva.cantidad_pasajeros = payload.cantidad_pasajeros
    reserva.origen = payload.origen
    reserva.destino = payload.destino
    reserva.tarifa_final = payload.tarifa_final
    reserva.estado_reserva = payload.estado_reserva
    
    if payload.estado_pago:
        reserva.estado_pago = payload.estado_pago
    if payload.metodo_pago_registro:
        reserva.metodo_pago_registro = payload.metodo_pago_registro
    if payload.notas is not None:
        reserva.notas = payload.notas
        
    reserva.save()
    return 200, reserva

@admin_router.put("/reservas/{reserva_id}/estado", tags=["Admin", "Reservas"], response={200: ReservaOutSchema})
def admin_actualizar_estado_reserva(request, reserva_id: UUID, payload: ReservaEstadoUpdateSchema):
    """
    Permite actualizar rápidamente solo el estado de una reserva.
    """
    reserva = get_object_or_404(Reserva, id=reserva_id)
    reserva.estado_reserva = payload.estado_reserva
    reserva.save()
    return 200, reserva

@admin_router.delete("/reservas/{reserva_id}/", tags=["Admin", "Reservas"])
def admin_eliminar_reserva(request, reserva_id: UUID):
    """
    Elimina una reserva (Solo superusuario).
    """
    if not request.user.is_superuser:
        raise HttpError(403, "Solo los superusuarios pueden eliminar reservas.")
    
    reserva = get_object_or_404(Reserva, id=reserva_id)
    reserva.delete()
    return {"success": True, "message": "Reserva eliminada"}

# ENDPOINTS AUXILIARES PARA FORMULARIOS (Lookups)
from operaciones.models import Servicio, Conductor

@admin_router.get("/lookups/servicios", tags=["Admin", "Lookups"])
def get_servicios_lookup(request):
    return [{"id": str(s.id), "nombre": s.nombre} for s in Servicio.objects.filter(activo=True)]

@admin_router.get("/lookups/vehiculos", tags=["Admin", "Lookups"])
def get_vehiculos_lookup(request):
    return [{"id": str(v.id), "nombre": f"{v.placa} - {v.modelo}"} for v in Vehiculo.objects.all()]

@admin_router.get("/lookups/conductores", tags=["Admin", "Lookups"])
def get_conductores_lookup(request):
    return [{"id": str(c.id), "nombre": c.nombre} for c in Conductor.objects.all()]

@admin_router.get("/lookups/clientes", tags=["Admin", "Lookups"])
def get_clientes_lookup(request):
    User = get_user_model()
    # Para simplificar, listamos a todos o filtramos por clientes (is_staff=False)
    return [{"id": u.id, "nombre": u.get_full_name() or u.email} for u in User.objects.all()]
