from ninja import Schema, ModelSchema, FilterSchema
from typing import Optional, List
from datetime import date, time, datetime
from pydantic import Field
from decimal import Decimal
from uuid import UUID

from operaciones.models import Reserva, Servicio, Vehiculo, Conductor, MensajeContacto

class ReservaCreateSchema(Schema):
    servicio_id: UUID
    cliente_nombre: str
    cliente_correo: str
    cliente_telefono: Optional[str] = None
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    cantidad_pasajeros: int = Field(..., gt=0)
    origen: str
    destino: str
    notas: Optional[str] = None

class ReservaOutSchema(ModelSchema):
    cliente_nombre: Optional[str] = None
    cliente_correo: Optional[str] = None
    cliente_telefono: Optional[str] = None
    servicio_nombre: Optional[str] = None
    whatsapp_link: Optional[str] = None
    vehiculo_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None
    servicio_id: Optional[UUID] = None
    vehiculo_nombre: Optional[str] = None
    conductor_nombre: Optional[str] = None

    class Meta:
        model = Reserva
        fields = [
            'id', 'codigo_reserva', 'cliente_nombre', 'cliente_correo', 'cliente_telefono', 'fecha_hora_inicio', 'fecha_hora_fin', 
            'cantidad_pasajeros', 'origen', 'destino', 'tarifa_final', 
            'estado_reserva', 'estado_pago', 'metodo_pago_registro', 
            'notas', 'created_at'
        ]

    @staticmethod
    def resolve_servicio_nombre(obj):
        try:
            return obj.servicio.nombre if hasattr(obj, 'servicio') and obj.servicio else None
        except Exception:
            return None

    @staticmethod
    def resolve_whatsapp_link(obj):
        try:
            import urllib.parse
            numero_whatsapp = "51999999999"
            
            tarifa_ref = obj.servicio.tarifa_referencial if hasattr(obj, 'servicio') and obj.servicio else 0
            nombre_servicio = obj.servicio.nombre if hasattr(obj, 'servicio') and obj.servicio else "Servicio"
            fecha = obj.fecha_hora_inicio.strftime('%Y-%m-%d %H:%M') if getattr(obj, 'fecha_hora_inicio', None) else "Por definir"
            
            texto_base = (
                f"Hola, solicito cotizar la reserva {obj.codigo_reserva} "
                f"para el servicio de {nombre_servicio}. "
                f"Precio base referencial: S/. {tarifa_ref}. "
                f"Fecha: {fecha}."
            )
            
            texto_url = urllib.parse.quote(texto_base)
            return f"https://wa.me/{numero_whatsapp}?text={texto_url}"
        except Exception:
            return None

    @staticmethod
    def resolve_vehiculo_nombre(obj):
        if not obj.vehiculo:
            return None
        return f"{obj.vehiculo.placa} - {obj.vehiculo.marca} {obj.vehiculo.modelo}"

    @staticmethod
    def resolve_conductor_nombre(obj):
        return obj.conductor.nombre if obj.conductor else None

class ReservaAdminUpdateSchema(Schema):
    tarifa_final: Decimal
    vehiculo_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None
    estado_reserva: str
    estado_pago: Optional[str] = None
    metodo_pago_registro: Optional[str] = None
    kilometraje_final: Optional[int] = None

class ReservaEstadoUpdateSchema(Schema):
    estado_reserva: str
    kilometraje_final: Optional[int] = None

class MensajeContactoIn(Schema):
    nombre: str
    email: str
    telefono: Optional[str] = None
    asunto: str
    mensaje: str


class ReservaInSchema(Schema):
    cliente_nombre: str
    cliente_correo: str
    cliente_telefono: Optional[str] = None
    servicio_id: UUID
    vehiculo_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    cantidad_pasajeros: int
    origen: str
    destino: str
    tarifa_final: Decimal
    estado_reserva: str
    estado_pago: Optional[str] = None
    metodo_pago_registro: Optional[str] = None
    notas: Optional[str] = None



class ServicioFilterSchema(FilterSchema):
    q: Optional[str] = Field(None, q='nombre__icontains')
    activo: Optional[bool] = None

class VehiculoInSchema(ModelSchema):
    kilometraje_base: int = 0
    class Meta:
        model = Vehiculo
        fields = ['placa', 'marca', 'modelo', 'capacidad', 'anio', 'estado', 'tipo_vehiculo', 'capacidad_carga', 'kilometraje_actual', 'kilometraje_base', 'frecuencia_mantenimiento_km', 'detalles']

class VehiculoOutSchema(ModelSchema):
    requiere_mantenimiento: bool = False
    reservas_activas: List[dict] = []
    class Meta:
        model = Vehiculo
        fields = ['id', 'placa', 'marca', 'modelo', 'capacidad', 'anio', 'estado', 'tipo_vehiculo', 'capacidad_carga', 'kilometraje_actual', 'kilometraje_base', 'frecuencia_mantenimiento_km', 'detalles', 'created_at']
    @staticmethod
    def resolve_requiere_mantenimiento(obj):
        return False
    @staticmethod
    def resolve_reservas_activas(obj):
        return []

class VehiculoFilterSchema(FilterSchema):
    q: Optional[str] = Field(None, q='placa__icontains')
    estado: Optional[str] = None

class ConductorInSchema(ModelSchema):
    class Meta:
        model = Conductor
        fields = ['nombre', 'licencia', 'telefono', 'estado']

class ConductorOutSchema(ModelSchema):
    class Meta:
        model = Conductor
        fields = ['id', 'nombre', 'licencia', 'telefono', 'estado', 'created_at']

class ConductorFilterSchema(FilterSchema):
    q: Optional[str] = Field(None, q='nombre__icontains')
    estado: Optional[str] = None

class BulkIdsSchema(Schema):
    ids: List[UUID]

class BulkIntIdsSchema(Schema):
    ids: List[int]

class MantenimientoInSchema(Schema):
    vehiculo_id: UUID
    fecha: date
    kilometraje_realizado: int
    costo: Decimal
    descripcion: str

class ReservaFilterSchema(FilterSchema):
    q: Optional[str] = Field(None, q='codigo_reserva__icontains')
    estado: Optional[str] = None

class ServicioOutSchema(ModelSchema):
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion', 'tarifa_referencial', 'activo']

class ServicioInSchema(ModelSchema):
    class Meta:
        model = Servicio
        fields = ['nombre', 'descripcion', 'tarifa_referencial', 'activo']

class MensajeContactoOutSchema(ModelSchema):
    class Meta:
        model = MensajeContacto
        fields = ['id', 'nombre', 'email', 'telefono', 'asunto', 'mensaje', 'leido', 'fecha_creacion']

class MensajeContactoFilterSchema(FilterSchema):
    q: Optional[str] = Field(None, q='nombre__icontains')
    leido: Optional[bool] = None

class MensajeLeidoUpdateSchema(Schema):
    leido: bool

class AsignarRutaSchema(Schema):
    vehiculo_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None

class CalculoCombustibleInSchema(Schema):
    distancia_km: float
    consumo_vehiculo_km_por_litro: float
    precio_combustible_por_litro: float

class CalculoCombustibleOutSchema(Schema):
    costo_estimado: float
