from ninja import Schema, ModelSchema
from typing import Optional, List
from datetime import date, time
from pydantic import Field
from decimal import Decimal
from uuid import UUID

from operaciones.models import Reserva, Servicio, Vehiculo, Conductor

class ReservaCreateSchema(Schema):
    servicio_id: UUID
    fecha_servicio: date
    hora_servicio: time
    cantidad_pasajeros: int = Field(..., gt=0)
    origen: str
    destino: str
    notas: Optional[str] = None

class ReservaOutSchema(ModelSchema):
    cliente_nombre: str
    servicio_nombre: str
    whatsapp_link: str

    class Meta:
        model = Reserva
        fields = [
            'id', 'codigo_reserva', 'fecha_servicio', 'hora_servicio', 
            'cantidad_pasajeros', 'origen', 'destino', 'tarifa_final', 
            'estado_reserva', 'estado_pago', 'metodo_pago_registro', 
            'notas', 'created_at'
        ]

    @staticmethod
    def resolve_cliente_nombre(obj):
        return obj.cliente.get_full_name() or obj.cliente.email

    @staticmethod
    def resolve_servicio_nombre(obj):
        return obj.servicio.nombre

    @staticmethod
    def resolve_whatsapp_link(obj):
        import urllib.parse
        # El número puede venir de una configuración, por ahora usamos un placeholder
        numero_whatsapp = "51999999999"
        
        # Tarifa referencial de servicio en la reserva actual
        tarifa_ref = obj.servicio.tarifa_referencial
        
        texto_base = (
            f"Hola, solicito cotizar la reserva {obj.codigo_reserva} "
            f"para el servicio de {obj.servicio.nombre}. "
            f"Precio base referencial: S/. {tarifa_ref}. "
            f"Fecha: {obj.fecha_servicio}."
        )
        
        texto_url = urllib.parse.quote(texto_base)
        return f"https://wa.me/{numero_whatsapp}?text={texto_url}"

class ReservaAdminUpdateSchema(Schema):
    tarifa_final: Decimal
    vehiculo_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None
    estado_reserva: str
    estado_pago: Optional[str] = None
    metodo_pago_registro: Optional[str] = None

class MensajeContactoIn(Schema):
    nombre: str
    email: str
    telefono: Optional[str] = None
    asunto: str
    mensaje: str

class ReservaEstadoUpdateSchema(Schema):
    estado_reserva: str

class ReservaInSchema(Schema):
    cliente_id: int
    servicio_id: UUID
    vehiculo_id: Optional[UUID] = None
    conductor_id: Optional[UUID] = None
    fecha_servicio: date
    hora_servicio: time
    cantidad_pasajeros: int
    origen: str
    destino: str
    tarifa_final: Decimal
    estado_reserva: str
    estado_pago: Optional[str] = None
    metodo_pago_registro: Optional[str] = None
    notas: Optional[str] = None
