from django.db import models
from django.conf import settings
from django.utils import timezone
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
        NO_DISPONIBLE = 'NO_DISPONIBLE', 'No Disponible'
        MANTENIMIENTO = 'MANTENIMIENTO', 'En Mantenimiento'

    placa = models.CharField(
        max_length=10,
        unique=True,
        verbose_name='Placa'
    )
    marca = models.CharField(
        max_length=50,
        verbose_name='Marca',
        default='Desconocida'
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
    tipo_vehiculo = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='Tipo de Vehículo'
    )
    capacidad_carga = models.FloatField(
        verbose_name='Capacidad de Carga (kg)',
        default=0.0
    )
    kilometraje_actual = models.IntegerField(
        verbose_name='Kilometraje Actual',
        default=0
    )
    kilometraje_base = models.IntegerField(
        verbose_name='Kilometraje Base',
        default=0
    )
    frecuencia_mantenimiento_km = models.IntegerField(
        verbose_name='Frecuencia de Mantenimiento (km)',
        default=5000
    )
    detalles = models.TextField(
        blank=True,
        null=True,
        verbose_name='Detalles'
    )

    class Meta:
        db_table = 'vehiculos'
        verbose_name = 'Vehículo'
        verbose_name_plural = 'Vehículos'
        ordering = ['placa']

    def __str__(self):
        return f'{self.placa} — {self.marca} {self.modelo} ({self.get_estado_display()})'

    def save(self, *args, **kwargs):
        if not self.pk and self.kilometraje_base == 0:
            self.kilometraje_base = self.kilometraje_actual
        super().save(*args, **kwargs)


# ─────────────────────────────────────────────────────────────────────────────
# Modelo: Mantenimiento
# ─────────────────────────────────────────────────────────────────────────────

class Mantenimiento(BaseModel):
    """
    Registro de mantenimientos preventivos y correctivos de los vehículos.
    """
    vehiculo = models.ForeignKey(
        Vehiculo,
        on_delete=models.CASCADE,
        related_name='mantenimientos',
        verbose_name='Vehículo'
    )
    kilometraje_realizado = models.IntegerField(
        verbose_name='Kilometraje al Mantenimiento'
    )
    fecha = models.DateField(
        verbose_name='Fecha de Mantenimiento'
    )
    descripcion = models.TextField(
        verbose_name='Descripción de Tareas'
    )
    costo = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name='Costo Total'
    )

    class Meta:
        db_table = 'mantenimientos'
        verbose_name = 'Mantenimiento'
        verbose_name_plural = 'Mantenimientos'
        ordering = ['-fecha']

    def __str__(self):
        return f'Mantenimiento {self.vehiculo.placa} - {self.fecha}'


# ─────────────────────────────────────────────────────────────────────────────
# Modelo: Conductor
# ─────────────────────────────────────────────────────────────────────────────

class Conductor(BaseModel):
    """
    Representa a los conductores de la empresa.
    """

    class Estado(models.TextChoices):
        DISPONIBLE = 'DISPONIBLE', 'Disponible'
        NO_DISPONIBLE = 'NO_DISPONIBLE', 'No Disponible'

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
        on_delete=models.SET_NULL,          # null=True
        null=True,
        blank=True,
        related_name='reservas',
        verbose_name='Usuario Admin (Creador)'
    )
    
    # ── Datos del Cliente (Desacoplados) ──────────────────────────────────────
    cliente_nombre = models.CharField(
        max_length=200,
        default='Cliente Web',
        verbose_name='Nombre del Cliente'
    )
    cliente_correo = models.EmailField(
        default='sin@correo.com',
        verbose_name='Correo del Cliente'
    )
    cliente_telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Teléfono del Cliente'
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
    fecha_hora_inicio = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        verbose_name='Fecha y Hora de Inicio'
    )
    fecha_hora_fin = models.DateTimeField(
        default=timezone.now,
        db_index=True,
        verbose_name='Fecha y Hora de Fin'
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
        ordering = ['-fecha_hora_inicio', '-created_at']

    def __str__(self):
        return f'[{self.codigo_reserva}] {self.cliente_nombre} — {self.fecha_hora_inicio.strftime("%d/%m/%Y %H:%M")} ({self.get_estado_reserva_display()})'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # BR: Bloqueo Global Estricto
        if self.vehiculo:
            if self.estado_reserva in [self.EstadoReserva.CONFIRMADA, self.EstadoReserva.EN_CURSO]:
                self.vehiculo.estado = 'NO_DISPONIBLE'
            elif self.estado_reserva in [self.EstadoReserva.COMPLETADA, self.EstadoReserva.CANCELADA, self.EstadoReserva.RECHAZADA]:
                self.vehiculo.estado = 'DISPONIBLE'
            self.vehiculo.save(update_fields=['estado'])
            
        if self.conductor:
            if self.estado_reserva in [self.EstadoReserva.CONFIRMADA, self.EstadoReserva.EN_CURSO]:
                self.conductor.estado = 'NO_DISPONIBLE'
            elif self.estado_reserva in [self.EstadoReserva.COMPLETADA, self.EstadoReserva.CANCELADA, self.EstadoReserva.RECHAZADA]:
                self.conductor.estado = 'DISPONIBLE'
            self.conductor.save(update_fields=['estado'])

# ─────────────────────────────────────────────────────────────────────────────
# Modelo: MensajeContacto
# ─────────────────────────────────────────────────────────────────────────────

class MensajeContacto(models.Model):
    nombre = models.CharField(max_length=100, verbose_name='Nombre')
    email = models.EmailField(verbose_name='Correo Electrónico')
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name='Teléfono')
    asunto = models.CharField(max_length=200, verbose_name='Asunto')
    mensaje = models.TextField(verbose_name='Mensaje')
    leido = models.BooleanField(default=False, verbose_name='Leído')
    fecha_creacion = models.DateTimeField(auto_now_add=True, verbose_name='Fecha de Creación')

    class Meta:
        db_table = 'mensajes_contacto'
        verbose_name = 'Mensaje de Contacto'
        verbose_name_plural = 'Mensajes de Contacto'
        ordering = ['-fecha_creacion']

    def __str__(self):
        return f'{self.nombre} - {self.asunto}'
