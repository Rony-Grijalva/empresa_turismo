from ninja import Router, Query
from ninja.pagination import paginate
from ninja_jwt.authentication import JWTAuth
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from uuid import UUID
import uuid
from datetime import date, datetime, timedelta

from operaciones.models import Reserva, Vehiculo, MensajeContacto, Servicio, Conductor
from operaciones.schemas import (
    ReservaOutSchema, ReservaEstadoUpdateSchema, ReservaInSchema, ReservaFilterSchema,
    VehiculoInSchema, VehiculoOutSchema, VehiculoFilterSchema,
    ConductorInSchema, ConductorOutSchema, ConductorFilterSchema,
    ServicioInSchema, ServicioOutSchema, ServicioFilterSchema,
    MensajeContactoOutSchema, MensajeContactoFilterSchema, MensajeLeidoUpdateSchema,
    BulkIdsSchema, BulkIntIdsSchema, AsignarRutaSchema,
    MantenimientoInSchema, CalculoCombustibleInSchema, CalculoCombustibleOutSchema
)

admin_router = Router(auth=JWTAuth())

def check_admin_or_superuser(request):
    """Verifica si el usuario es superuser o tiene rol ADMINISTRADOR"""
    if not (request.user.is_superuser or getattr(request.user, 'rol', '') == 'ADMIN'):
        raise HttpError(403, "No tienes permisos suficientes para realizar esta acción.")

# ==========================================
# DASHBOARD STATS
# ==========================================
@admin_router.get("/dashboard/stats/", tags=["Admin", "Dashboard"])
def get_dashboard_stats(request):
    from django.utils.timezone import now
    from django.db.models import Sum, F
    
    today = date.today()
    reservas_mes = Reserva.objects.filter(fecha_hora_inicio__year=today.year, fecha_hora_inicio__month=today.month)
    
    total_reservas = reservas_mes.count()
    ingresos = reservas_mes.filter(estado_reserva__in=[Reserva.EstadoReserva.CONFIRMADA, Reserva.EstadoReserva.COMPLETADA]).aggregate(total=Sum('tarifa_final'))['total'] or 0
    vehiculos_activos = Vehiculo.objects.exclude(estado__in=[Vehiculo.Estado.MANTENIMIENTO, Vehiculo.Estado.NO_DISPONIBLE]).count()
    mantenimientos_pendientes = Vehiculo.objects.filter(kilometraje_actual__gte=F('kilometraje_base') + F('frecuencia_mantenimiento_km')).count()
    
    return {
        "total_reservas": total_reservas,
        "ingresos_estimados": float(ingresos),
        "vehiculos_activos": vehiculos_activos,
        "mantenimientos_pendientes": mantenimientos_pendientes
    }

@admin_router.get("/dashboard/chart/", tags=["Admin", "Dashboard"])
def get_dashboard_chart(request):
    from django.db.models import Count
    from django.db.models.functions import TruncDate
    
    today = date.today()
    start_date = today - timedelta(days=6)
    
    qs = Reserva.objects.filter(fecha_hora_inicio__date__range=[start_date, today])\
        .annotate(date=TruncDate('fecha_hora_inicio'))\
        .values('date')\
        .annotate(total=Count('id'))\
        .order_by('date')
        
    data_dict = {str(d['date'])[:10]: d['total'] for d in qs}
    
    chart_data = []
    for i in range(7):
        current_date = start_date + timedelta(days=i)
        chart_data.append({
            "name": current_date.strftime("%d/%m"),
            "reservas": data_dict.get(str(current_date), 0)
        })
        
    return chart_data

# ==========================================
# REPORTES
# ==========================================
@admin_router.get("/reportes/reservas-csv/", tags=["Admin", "Reportes"])
def export_reservas_csv(request):
    from django.http import HttpResponse
    import csv
    
    today = date.today()
    reservas = Reserva.objects.select_related('vehiculo', 'conductor').filter(
        fecha_hora_inicio__year=today.year, 
        fecha_hora_inicio__month=today.month
    ).order_by('-fecha_hora_inicio')
    
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = f'attachment; filename="reservas_{today.strftime("%Y_%m")}.csv"'
    
    writer = csv.writer(response)
    writer.writerow(['ID', 'Cliente', 'Teléfono', 'Fecha Servicio', 'Vehículo', 'Conductor', 'Estado', 'Tarifa'])
    
    for r in reservas:
        vehiculo_str = f"{r.vehiculo.placa} ({r.vehiculo.marca})" if r.vehiculo else "Sin asignar"
        conductor_str = r.conductor.nombre if r.conductor else "Sin asignar"
        writer.writerow([
            r.codigo_reserva,
            r.cliente_nombre,
            r.cliente_telefono or '',
            r.fecha_hora_inicio.strftime("%d/%m/%Y %H:%M"),
            vehiculo_str,
            conductor_str,
            r.estado_reserva,
            r.tarifa_final
        ])
        
    return response

# ==========================================
# RESERVAS
# ==========================================
@admin_router.get("/reservas/", tags=["Admin", "Reservas"], response=list[ReservaOutSchema])
@paginate
def admin_listar_reservas(request, filters: ReservaFilterSchema = Query(...)):
    qs = Reserva.objects.select_related('cliente', 'servicio').all().order_by('-fecha_hora_inicio', '-created_at')
    qs = filters.filter(qs)
    return qs

@admin_router.post("/reservas/", tags=["Admin", "Reservas"], response={201: ReservaOutSchema})
def admin_crear_reserva(request, payload: ReservaInSchema):
    cliente_admin = request.user
    codigo = f"MG-{str(uuid.uuid4().int)[:6]}"
    
    reserva = Reserva.objects.create(
        codigo_reserva=codigo,
        cliente=cliente_admin,
        cliente_nombre=payload.cliente_nombre,
        cliente_correo=payload.cliente_correo,
        cliente_telefono=payload.cliente_telefono,
        servicio_id=payload.servicio_id,
        vehiculo_id=payload.vehiculo_id,
        conductor_id=payload.conductor_id,
        fecha_hora_inicio=payload.fecha_hora_inicio,
        fecha_hora_fin=payload.fecha_hora_fin,
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

@admin_router.get("/calendario/", tags=["Admin", "Calendario"])
def admin_calendario_flota(request):
    reservas = Reserva.objects.filter(
        estado_reserva__in=[Reserva.EstadoReserva.PENDIENTE, Reserva.EstadoReserva.CONFIRMADA, Reserva.EstadoReserva.EN_CURSO]
    ).select_related('vehiculo')
    
    eventos = []
    for r in reservas:
        if r.vehiculo:
            eventos.append({
                "id": str(r.id),
                "title": f"[{r.codigo_reserva}] {r.cliente_nombre}",
                "start": r.fecha_hora_inicio.isoformat(),
                "end": r.fecha_hora_fin.isoformat(),
                "resourceId": str(r.vehiculo.id)
            })
    return eventos

@admin_router.get("/reservas/{reserva_id}/", tags=["Admin", "Reservas"], response={200: ReservaOutSchema})
def admin_obtener_reserva(request, reserva_id: UUID):
    return get_object_or_404(Reserva, id=reserva_id)

@admin_router.put("/reservas/{reserva_id}/estado", tags=["Admin", "Reservas"], response={200: ReservaOutSchema})
def admin_actualizar_estado_reserva(request, reserva_id: UUID, payload: ReservaEstadoUpdateSchema):
    reserva = get_object_or_404(Reserva, id=reserva_id)
    
    if payload.estado_reserva == Reserva.EstadoReserva.CONFIRMADA:
        if not reserva.vehiculo or not reserva.conductor:
            raise HttpError(400, "Error: No se puede confirmar una reserva sin un vehículo y conductor asignados (BR-07)")
    
    # Si pasa a completada, actualizar kilometraje del vehículo
    if payload.estado_reserva == Reserva.EstadoReserva.COMPLETADA and payload.kilometraje_final is not None:
        if reserva.vehiculo:
            vehiculo = reserva.vehiculo
            vehiculo.kilometraje_actual = max(vehiculo.kilometraje_actual, payload.kilometraje_final)
            vehiculo.save(update_fields=['kilometraje_actual'])
            
    reserva.estado_reserva = payload.estado_reserva
    reserva.save(update_fields=['estado_reserva'])
    
    return 200, reserva

@admin_router.put("/reservas/{reserva_id}/", tags=["Admin", "Reservas"], response={200: ReservaOutSchema})
def admin_actualizar_reserva(request, reserva_id: UUID, payload: ReservaInSchema):
    reserva = get_object_or_404(Reserva, id=reserva_id)
    
    if payload.estado_reserva == Reserva.EstadoReserva.CONFIRMADA:
        if not payload.vehiculo_id or not payload.conductor_id:
            raise HttpError(400, "Error: No se puede confirmar una reserva sin un vehículo y conductor asignados (BR-07)")
            
    
    reserva.cliente_nombre = payload.cliente_nombre
    reserva.cliente_correo = payload.cliente_correo
    reserva.cliente_telefono = payload.cliente_telefono
    reserva.servicio_id = payload.servicio_id
    reserva.vehiculo_id = payload.vehiculo_id
    reserva.conductor_id = payload.conductor_id
    reserva.fecha_hora_inicio = payload.fecha_hora_inicio
    reserva.fecha_hora_fin = payload.fecha_hora_fin
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
    
    # Interceptar COMPLETADA para kilometraje
    if reserva.estado_reserva == Reserva.EstadoReserva.COMPLETADA and reserva.vehiculo and payload.kilometraje_final:
        if payload.kilometraje_final > reserva.vehiculo.kilometraje_actual:
            reserva.vehiculo.kilometraje_actual = payload.kilometraje_final
            reserva.vehiculo.save()
            
    return 200, reserva


@admin_router.delete("/reservas/{reserva_id}/", tags=["Admin", "Reservas"])
def admin_eliminar_reserva(request, reserva_id: UUID):
    check_admin_or_superuser(request)
    reserva = get_object_or_404(Reserva, id=reserva_id)
    reserva.delete()
    return {"success": True, "message": "Reserva eliminada correctamente"}

# ==========================================
# RUTAS (ASIGNACIÓN)
# ==========================================
@admin_router.post("/rutas/asignar/", tags=["Admin", "Rutas"], response={200: ReservaOutSchema})
def asignar_ruta(request, payload: AsignarRutaSchema):
    """Asigna un vehículo y un conductor a una reserva (ruta) específica."""
    reserva = get_object_or_404(Reserva, id=payload.reserva_id)
    vehiculo = get_object_or_404(Vehiculo, id=payload.vehiculo_id)
    conductor = get_object_or_404(Conductor, id=payload.conductor_id)
    
    # BR-03: Bloqueo Preventivo por Mantenimiento
    if (vehiculo.kilometraje_actual - vehiculo.kilometraje_base) > 10000:
        raise HttpError(400, "Error: El vehículo requiere mantenimiento preventivo y no puede ser asignado (BR-03)")
        
    # BR-02 / RDm-01 (Aforo MTC): la cantidad de pasajeros no puede superar el
    # número de asientos (capacidad) declarado en la tarjeta de propiedad del vehículo.
    if reserva.cantidad_pasajeros and vehiculo.capacidad:
        if reserva.cantidad_pasajeros > vehiculo.capacidad:
            raise HttpError(400, "Error: La cantidad de pasajeros supera el aforo (asientos) del vehículo seleccionado (RDm-01 / BR-02)")
            
    # BR-01: Prevención de Solapamiento
    from django.db.models import Q
    overlapping = Reserva.objects.filter(
        vehiculo=vehiculo,
        estado_reserva__in=[Reserva.EstadoReserva.PENDIENTE, Reserva.EstadoReserva.CONFIRMADA]
    ).filter(
        Q(fecha_hora_inicio__lt=reserva.fecha_hora_fin, fecha_hora_fin__gt=reserva.fecha_hora_inicio)
    ).exclude(id=reserva.id).exists()
    
    if overlapping:
        raise HttpError(400, "Error: El vehículo ya se encuentra asignado a otra ruta en ese horario (BR-01)")
    
    reserva.vehiculo = vehiculo
    reserva.conductor = conductor
    if reserva.estado_reserva == Reserva.EstadoReserva.PENDIENTE:
        reserva.estado_reserva = Reserva.EstadoReserva.CONFIRMADA
    reserva.save()
    
    return 200, reserva

@admin_router.post("/rutas/calcular-combustible/", tags=["Admin", "Rutas"], response={200: CalculoCombustibleOutSchema})
def calcular_combustible_endpoint(request, payload: CalculoCombustibleInSchema):
    from operaciones.services import calcular_costo_combustible
    costo = calcular_costo_combustible(
        distancia_km=payload.distancia_km,
        consumo_vehiculo_km_por_litro=payload.consumo_vehiculo_km_por_litro,
        precio_combustible_por_litro=payload.precio_combustible_por_litro
    )
    return 200, {"costo_estimado": costo}

# ==========================================
# MANTENIMIENTOS
# ==========================================
@admin_router.post("/mantenimientos/", tags=["Admin", "Mantenimientos"])
def registrar_mantenimiento(request, payload: MantenimientoInSchema):
    from operaciones.models import Mantenimiento
    mantenimiento = Mantenimiento.objects.create(**payload.dict())
    
    # Actualizar kilometraje del vehículo
    vehiculo = mantenimiento.vehiculo
    vehiculo.kilometraje_actual = max(vehiculo.kilometraje_actual, mantenimiento.kilometraje_realizado)
    vehiculo.kilometraje_base = mantenimiento.kilometraje_realizado
    vehiculo.save()
    
    return 201, {"success": True, "message": "Mantenimiento registrado y kilometraje actualizado"}

@admin_router.delete("/reservas/bulk/delete/", tags=["Admin", "Reservas", "Bulk"])
def bulk_delete_reservas(request, payload: BulkIdsSchema):
    check_admin_or_superuser(request)
    Reserva.objects.filter(id__in=payload.ids).delete()
    return {"success": True, "message": f"{len(payload.ids)} reservas eliminadas"}

# ==========================================
# VEHICULOS
# ==========================================
@admin_router.get("/vehiculos/", tags=["Admin", "Vehículos"], response=list[VehiculoOutSchema])
@paginate
def listar_vehiculos(request, filters: VehiculoFilterSchema = Query(...)):
    qs = Vehiculo.objects.all().order_by('placa')
    qs = filters.filter(qs)
    return qs

@admin_router.post("/vehiculos/", tags=["Admin", "Vehículos"], response={201: VehiculoOutSchema})
def crear_vehiculo(request, payload: VehiculoInSchema):
    vehiculo = Vehiculo.objects.create(**payload.dict())
    return 201, vehiculo

@admin_router.get("/vehiculos/{vehiculo_id}/", tags=["Admin", "Vehículos"], response={200: VehiculoOutSchema})
def obtener_vehiculo(request, vehiculo_id: UUID):
    return get_object_or_404(Vehiculo, id=vehiculo_id)

@admin_router.put("/vehiculos/{vehiculo_id}/", tags=["Admin", "Vehículos"], response={200: VehiculoOutSchema})
def actualizar_vehiculo(request, vehiculo_id: UUID, payload: VehiculoInSchema):
    vehiculo = get_object_or_404(Vehiculo, id=vehiculo_id)
    for attr, value in payload.dict().items():
        setattr(vehiculo, attr, value)
    vehiculo.kilometraje_base = payload.kilometraje_base
    vehiculo.save()
    return 200, vehiculo

@admin_router.delete("/vehiculos/{vehiculo_id}/", tags=["Admin", "Vehículos"])
def eliminar_vehiculo(request, vehiculo_id: UUID):
    check_admin_or_superuser(request)
    vehiculo = get_object_or_404(Vehiculo, id=vehiculo_id)
    vehiculo.delete()
    return {"success": True, "message": "Vehículo eliminado"}

@admin_router.delete("/vehiculos/bulk/delete/", tags=["Admin", "Vehículos", "Bulk"])
def bulk_delete_vehiculos(request, payload: BulkIdsSchema):
    check_admin_or_superuser(request)
    Vehiculo.objects.filter(id__in=payload.ids).delete()
    return {"success": True, "message": f"{len(payload.ids)} vehículos eliminados"}

# ==========================================
# CONDUCTORES
# ==========================================
@admin_router.get("/conductores/", tags=["Admin", "Conductores"], response=list[ConductorOutSchema])
@paginate
def listar_conductores(request, filters: ConductorFilterSchema = Query(...)):
    qs = Conductor.objects.all().order_by('nombre')
    qs = filters.filter(qs)
    return qs

@admin_router.post("/conductores/", tags=["Admin", "Conductores"], response={201: ConductorOutSchema})
def crear_conductor(request, payload: ConductorInSchema):
    conductor = Conductor.objects.create(**payload.dict())
    return 201, conductor

@admin_router.get("/conductores/{conductor_id}/", tags=["Admin", "Conductores"], response={200: ConductorOutSchema})
def obtener_conductor(request, conductor_id: UUID):
    return get_object_or_404(Conductor, id=conductor_id)

@admin_router.put("/conductores/{conductor_id}/", tags=["Admin", "Conductores"], response={200: ConductorOutSchema})
def actualizar_conductor(request, conductor_id: UUID, payload: ConductorInSchema):
    conductor = get_object_or_404(Conductor, id=conductor_id)
    for attr, value in payload.dict().items():
        setattr(conductor, attr, value)
    conductor.save()
    return 200, conductor

@admin_router.delete("/conductores/{conductor_id}/", tags=["Admin", "Conductores"])
def eliminar_conductor(request, conductor_id: UUID):
    check_admin_or_superuser(request)
    conductor = get_object_or_404(Conductor, id=conductor_id)
    conductor.delete()
    return {"success": True, "message": "Conductor eliminado"}

@admin_router.delete("/conductores/bulk/delete/", tags=["Admin", "Conductores", "Bulk"])
def bulk_delete_conductores(request, payload: BulkIdsSchema):
    check_admin_or_superuser(request)
    Conductor.objects.filter(id__in=payload.ids).delete()
    return {"success": True, "message": f"{len(payload.ids)} conductores eliminados"}

# ==========================================
# SERVICIOS
# ==========================================
@admin_router.get("/servicios/", tags=["Admin", "Servicios"], response=list[ServicioOutSchema])
@paginate
def listar_servicios_admin(request, filters: ServicioFilterSchema = Query(...)):
    qs = Servicio.objects.all().order_by('nombre')
    qs = filters.filter(qs)
    return qs

@admin_router.post("/servicios/", tags=["Admin", "Servicios"], response={201: ServicioOutSchema})
def crear_servicio(request, payload: ServicioInSchema):
    servicio = Servicio.objects.create(**payload.dict())
    return 201, servicio

@admin_router.get("/servicios/{servicio_id}/", tags=["Admin", "Servicios"], response={200: ServicioOutSchema})
def obtener_servicio(request, servicio_id: UUID):
    return get_object_or_404(Servicio, id=servicio_id)

@admin_router.put("/servicios/{servicio_id}/", tags=["Admin", "Servicios"], response={200: ServicioOutSchema})
def actualizar_servicio(request, servicio_id: UUID, payload: ServicioInSchema):
    servicio = get_object_or_404(Servicio, id=servicio_id)
    for attr, value in payload.dict().items():
        setattr(servicio, attr, value)
    servicio.save()
    return 200, servicio

@admin_router.delete("/servicios/{servicio_id}/", tags=["Admin", "Servicios"])
def eliminar_servicio(request, servicio_id: UUID):
    check_admin_or_superuser(request)
    servicio = get_object_or_404(Servicio, id=servicio_id)
    servicio.delete()
    return {"success": True, "message": "Servicio eliminado"}

@admin_router.delete("/servicios/bulk/delete/", tags=["Admin", "Servicios", "Bulk"])
def bulk_delete_servicios(request, payload: BulkIdsSchema):
    check_admin_or_superuser(request)
    Servicio.objects.filter(id__in=payload.ids).delete()
    return {"success": True, "message": f"{len(payload.ids)} servicios eliminados"}

# ==========================================
# MENSAJES DE CONTACTO
# ==========================================
@admin_router.get("/mensajes/", tags=["Admin", "Mensajes"], response=list[MensajeContactoOutSchema])
@paginate
def listar_mensajes(request, filters: MensajeContactoFilterSchema = Query(...)):
    qs = MensajeContacto.objects.all().order_by('-fecha_creacion')
    qs = filters.filter(qs)
    return qs

@admin_router.get("/mensajes/{mensaje_id}/", tags=["Admin", "Mensajes"], response={200: MensajeContactoOutSchema})
def obtener_mensaje(request, mensaje_id: int):
    return get_object_or_404(MensajeContacto, id=mensaje_id)

@admin_router.put("/mensajes/{mensaje_id}/leido", tags=["Admin", "Mensajes"], response={200: MensajeContactoOutSchema})
def actualizar_estado_mensaje(request, mensaje_id: int, payload: MensajeLeidoUpdateSchema):
    mensaje = get_object_or_404(MensajeContacto, id=mensaje_id)
    mensaje.leido = payload.leido
    mensaje.save()
    return 200, mensaje

@admin_router.delete("/mensajes/{mensaje_id}/", tags=["Admin", "Mensajes"])
def eliminar_mensaje(request, mensaje_id: int):
    check_admin_or_superuser(request)
    mensaje = get_object_or_404(MensajeContacto, id=mensaje_id)
    mensaje.delete()  # Este es un hard delete porque MensajeContacto no usa BaseModel
    return {"success": True, "message": "Mensaje eliminado"}

@admin_router.post("/mensajes/bulk/read/", tags=["Admin", "Mensajes", "Bulk"])
def bulk_read_mensajes(request, payload: BulkIntIdsSchema):
    MensajeContacto.objects.filter(id__in=payload.ids).update(leido=True)
    return {"success": True, "message": f"{len(payload.ids)} mensajes marcados como leídos"}

@admin_router.delete("/mensajes/bulk/delete/", tags=["Admin", "Mensajes", "Bulk"])
def bulk_delete_mensajes(request, payload: BulkIntIdsSchema):
    check_admin_or_superuser(request)
    MensajeContacto.objects.filter(id__in=payload.ids).delete()
    return {"success": True, "message": f"{len(payload.ids)} mensajes eliminados"}

# ==========================================
# MANTENIMIENTOS
# ==========================================
@admin_router.post("/mantenimientos/", tags=["Admin", "Mantenimientos"])
def crear_mantenimiento(request, payload: MantenimientoInSchema):
    mantenimiento = Mantenimiento.objects.create(**payload.dict())
    
    # Interceptar creación para actualizar kilometraje del vehículo
    vehiculo = mantenimiento.vehiculo
    vehiculo.kilometraje_base = mantenimiento.kilometraje_realizado
    if mantenimiento.kilometraje_realizado > vehiculo.kilometraje_actual:
        vehiculo.kilometraje_actual = mantenimiento.kilometraje_realizado
    vehiculo.save()
    
    return 201, {"id": str(mantenimiento.id)}

# ==========================================
# ENDPOINTS AUXILIARES PARA FORMULARIOS (Lookups)
# ==========================================
@admin_router.get("/lookups/servicios", tags=["Admin", "Lookups"])
def get_servicios_lookup(request):
    return [{"id": str(s.id), "nombre": s.nombre} for s in Servicio.objects.filter(activo=True)]

@admin_router.get("/lookups/vehiculos", tags=["Admin", "Lookups"])
def get_vehiculos_lookup(request, inicio: str = None, fin: str = None, reserva_id: str = None):
    # Siempre excluir vehículos en mantenimiento
    vehiculos = Vehiculo.objects.exclude(estado=Vehiculo.Estado.MANTENIMIENTO)

    if inicio and fin:
        from django.db.models import Q
        ocupados_qs = Reserva.objects.filter(
            estado_reserva__in=[Reserva.EstadoReserva.PENDIENTE, Reserva.EstadoReserva.CONFIRMADA, Reserva.EstadoReserva.EN_CURSO],
            vehiculo__isnull=False
        ).filter(
            Q(fecha_hora_inicio__lt=fin, fecha_hora_fin__gt=inicio)
        )
        if reserva_id:
            ocupados_qs = ocupados_qs.exclude(id=reserva_id)
            
        vehiculos_ocupados = ocupados_qs.values_list('vehiculo_id', flat=True)
        vehiculos = vehiculos.exclude(id__in=vehiculos_ocupados)
    
    return [{
        "id": str(v.id), 
        "nombre": f"{v.placa} - {v.marca} {v.modelo}",
        "estado": v.estado,
        "placa": v.placa,
        "marca": v.marca,
        "modelo": v.modelo
    } for v in vehiculos]

@admin_router.get("/lookups/conductores", tags=["Admin", "Lookups"])
def get_conductores_lookup(request, inicio: str = None, fin: str = None, reserva_id: str = None):
    # Siempre excluir conductores globalmente NO_DISPONIBLES
    conductores = Conductor.objects.exclude(estado=Conductor.Estado.NO_DISPONIBLE)

    if inicio and fin:
        from django.db.models import Q
        ocupados_qs = Reserva.objects.filter(
            estado_reserva__in=[Reserva.EstadoReserva.PENDIENTE, Reserva.EstadoReserva.CONFIRMADA, Reserva.EstadoReserva.EN_CURSO],
            conductor__isnull=False
        ).filter(
            Q(fecha_hora_inicio__lt=fin, fecha_hora_fin__gt=inicio)
        )
        if reserva_id:
            ocupados_qs = ocupados_qs.exclude(id=reserva_id)
            
        conductores_ocupados = ocupados_qs.values_list('conductor_id', flat=True)
        conductores = conductores.exclude(id__in=conductores_ocupados)
    
    return [{"id": str(c.id), "nombre": c.nombre} for c in conductores]

@admin_router.get("/lookups/clientes", tags=["Admin", "Lookups"])
def get_clientes_lookup(request):
    User = get_user_model()
    # Listamos clientes (generalmente no admins)
    return [{"id": str(u.id), "nombre": u.get_full_name() or u.email} for u in User.objects.all()]
