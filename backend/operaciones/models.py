from django.db import models
from django.conf import settings
from config.base_models import BaseModel


# ─────────────────────────────────────────────────────────────────────────────
# Modelo: Vehiculo
# ─────────────────────────────────────────────────────────────────────────────

class Vehiculo(BaseModel):
    """
    Representa las unidades de la flota de Multiservicios Grijalva.
    """

    class Estado(models.TextChoices):
        DISPONIBLE = 'DISPONIBLE', 'Disponible'
        EN_RUTA = 'EN_RUTA', 'En Ruta'
        MANTENIMIENTO = 'MANTENIMIENTO', 'En Mantenimiento'

    placa = models.CharField(
        max_length=10,
        unique=True,
        verbose_name='Placa'
    )
    modelo = models.CharField(
        max_length=100,
        verbose_name='Modelo'
    )
    capacidad = models.IntegerField(
        verbose_name='Capacidad (pasajeros)'
    )
    anio = models.IntegerField(
        verbose_name='Año de Fabricación'
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.DISPONIBLE,
        db_index=True,
        verbose_name='Estado'
    )

    class Meta:
        db_table = 'vehiculos'
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Vehículos'
        ordering = ['placa']

    def __str__(self):
        return f'{self.placa} — {self.modelo} ({self.get_estado_display()})'


# ─────────────────────────────────────────────────────────────────────────────
# Modelo: Conductor
# ─────────────────────────────────────────────────────────────────────────────

class Conductor(BaseModel):
    """
    Representa a los conductores de la empresa.
    """

    class Estado(models.TextChoices):
        DISPONIBLE = 'DISPONIBLE', 'Disponible'
        EN_RUTA = 'EN_RUTA', 'En Ruta'
        MANTENIMIENTO = 'MANTENIMIENTO', 'No Disponible'

    nombre = models.CharField(
        max_length=100,
        verbose_name='Nombre Completo'
    )
    licencia = models.CharField(
        max_length=30,
        unique=True,
        verbose_name='N.° de Licencia'
    )
    telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Teléfono'
    )
    estado = models.CharField(
        max_length=20,
        choices=Estado.choices,
        default=Estado.DISPONIBLE,
        db_index=True,
        verbose_name='Estado'
    )

    class Meta:
        db_table = 'conductores'
        verbose_name = 'Conductor'
        verbose_name_plural = 'Conductores'
        ordering = ['nombre']

    def __str__(self):
        return f'{self.nombre} — Lic: {self.licencia} ({self.get_estado_display()})'


# ─────────────────────────────────────────────────────────────────────────────
# Modelo: Servicio
# ─────────────────────────────────────────────────────────────────────────────

class Servicio(BaseModel):
    """
    Catálogo de servicios ofrecidos por la empresa.
    """
    nombre = models.CharField(
        max_length=100,
        verbose_name='Nombre del Servicio'
    )
    descripcion = models.TextField(
        blank=True,
        null=True,
        verbose_name='Descripción'
    )
    tarifa_referencial = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Tarifa Referencial (S/)'
    )
    activo = models.BooleanField(
        default=True,
        db_index=True,
        verbose_name='¿Servicio Activo?'
    )

    class Meta:
        db_table = 'servicios'
        verbose_name = 'Servicio'
        verbose_name_plural = 'Servicios'
        ordering = ['nombre']

    def __str__(self):
        estado_str = 'Activo' if self.activo else 'Inactivo'
        return f'{self.nombre} — S/ {self.tarifa_referencial} [{estado_str}]'


# ─────────────────────────────────────────────────────────────────────────────
# Modelo: Reserva
# ─────────────────────────────────────────────────────────────────────────────

class Reserva(BaseModel):
    """
    Modelo central del sistema. Registra cada solicitud de transporte.
    Relaciona al cliente, el servicio solicitado, el vehículo y el conductor
    asignados, con un código de reserva único para trazabilidad.
    """

    class EstadoReserva(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        CONFIRMADA = 'CONFIRMADA', 'Confirmada'
        EN_CURSO = 'EN_CURSO', 'En Curso'
        COMPLETADA = 'COMPLETADA', 'Completada'
        RECHAZADA = 'RECHAZADA', 'Rechazada'
        CANCELADA = 'CANCELADA', 'Cancelada'

    # ── Código único de reserva ───────────────────────────────────────────────
    codigo_reserva = models.CharField(
        max_length=20,
        unique=True,
        db_index=True,
        verbose_name='Código de Reserva'
    )

    # ── Relaciones ────────────────────────────────────────────────────────────
    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,           # No eliminar el usuario si tiene reservas
        related_name='reservas',
        verbose_name='Cliente'
    )
    servicio = models.ForeignKey(
        Servicio,
        on_delete=models.PROTECT,           # No eliminar el servicio si tiene reservas
        related_name='reservas',
        verbose_name='Servicio'
    )
    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.SET_NULL,          # La reserva sobrevive si se retira el vehículo
        null=True,
        blank=True,
        related_name='reservas',
        verbose_name='Vehículo Asignado'
    )
    conductor = models.ForeignKey(
        Conductor,
        on_delete=models.SET_NULL,          # La reserva sobrevive si el conductor se desactiva
        null=True,
        blank=True,
        related_name='reservas',
        verbose_name='Conductor Asignado'
    )

    # ── Detalles del servicio ─────────────────────────────────────────────────
    fecha_servicio = models.DateField(
        db_index=True,
        verbose_name='Fecha del Servicio'
    )
    hora_servicio = models.TimeField(
        verbose_name='Hora del Servicio'
    )
    cantidad_pasajeros = models.PositiveIntegerField(
        verbose_name='N.° de Pasajeros'
    )
    origen = models.CharField(
        max_length=255,
        verbose_name='Punto de Recojo'
    )
    destino = models.CharField(
        max_length=255,
        verbose_name='Destino'
    )
    tarifa_final = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Tarifa Final (S/)'
    )
    estado_reserva = models.CharField(
        max_length=15,
        choices=EstadoReserva.choices,
        default=EstadoReserva.PENDIENTE,
        db_index=True,
        verbose_name='Estado de la Reserva'
    )

    class EstadoPago(models.TextChoices):
        PENDIENTE = 'PENDIENTE', 'Pendiente'
        PAGADO = 'PAGADO', 'Pagado'

    class MetodoPago(models.TextChoices):
        EFECTIVO = 'EFECTIVO', 'Efectivo'
        TRANSFERENCIA = 'TRANSFERENCIA', 'Transferencia'
        YAPE = 'YAPE', 'Yape'
        PLIN = 'PLIN', 'Plin'

    estado_pago = models.CharField(
        max_length=15,
        choices=EstadoPago.choices,
        default=EstadoPago.PENDIENTE,
        verbose_name='Estado de Pago'
    )
    metodo_pago_registro = models.CharField(
        max_length=20,
        choices=MetodoPago.choices,
        blank=True,
        null=True,
        verbose_name='Método de Pago'
    )
    notas = models.TextField(
        blank=True,
        null=True,
        verbose_name='Notas Adicionales'
    )

    class Meta:
        db_table = 'reservas'
        verbose_name = 'Reserva'
        verbose_name_plural = 'Reservas'
        ordering = ['-fecha_servicio', '-created_at']

    def __str__(self):
        return f'[{self.codigo_reserva}] {self.cliente} → {self.servicio} ({self.get_estado_reserva_display()})'
