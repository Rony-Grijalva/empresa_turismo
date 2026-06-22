from django.contrib import admin
from .models import Conductor, Reserva, Servicio, Vehiculo


# ─────────────────────────────────────────────────────────────────────────────
# Admin: Vehiculo
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Vehiculo)
class VehiculoAdmin(admin.ModelAdmin):
    list_display = ('placa', 'modelo', 'capacidad', 'anio', 'estado', 'created_at')
    list_display_links = ('placa', 'modelo')
    list_filter = ('estado', 'anio')
    search_fields = ('placa', 'modelo')
    ordering = ('placa',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'deleted_at')
    fieldsets = (
        ('Datos del Vehículo', {
            'fields': ('id', 'placa', 'modelo', 'capacidad', 'anio', 'estado')
        }),
        ('Auditoría', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at', 'deleted_at')
        }),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Admin: Conductor
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Conductor)
class ConductorAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'licencia', 'telefono', 'estado', 'created_at')
    list_display_links = ('nombre', 'licencia')
    list_filter = ('estado',)
    search_fields = ('nombre', 'licencia', 'telefono')
    ordering = ('nombre',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'deleted_at')
    fieldsets = (
        ('Datos del Conductor', {
            'fields': ('id', 'nombre', 'licencia', 'telefono', 'estado')
        }),
        ('Auditoría', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at', 'deleted_at')
        }),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Admin: Servicio
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'tarifa_referencial', 'activo', 'created_at')
    list_display_links = ('nombre',)
    list_filter = ('activo',)
    search_fields = ('nombre', 'descripcion')
    ordering = ('nombre',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'deleted_at')
    fieldsets = (
        ('Datos del Servicio', {
            'fields': ('id', 'nombre', 'descripcion', 'tarifa_referencial', 'activo')
        }),
        ('Auditoría', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at', 'deleted_at')
        }),
    )


# ─────────────────────────────────────────────────────────────────────────────
# Inline: permite ver asignaciones futuras desde el detalle de una reserva
# ─────────────────────────────────────────────────────────────────────────────

class ReservaVehiculoConductorInline(admin.StackedInline):
    """Muestra vehículo y conductor asignados de forma integrada en la Reserva."""
    model = Reserva
    fields = ('vehiculo', 'conductor')
    extra = 0
    can_delete = False
    verbose_name_plural = 'Asignación de Recursos'


# ─────────────────────────────────────────────────────────────────────────────
# Admin: Reserva
# ─────────────────────────────────────────────────────────────────────────────

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = (
        'codigo_reserva',
        'cliente',
        'servicio',
        'fecha_servicio',
        'hora_servicio',
        'cantidad_pasajeros',
        'vehiculo',
        'conductor',
        'estado_reserva',
        'tarifa_final',
    )
    list_display_links = ('codigo_reserva',)
    list_filter = ('estado_reserva', 'fecha_servicio', 'servicio')
    search_fields = (
        'codigo_reserva',
        'cliente__email',
        'cliente__nombre_completo',
        'vehiculo__placa',
        'conductor__nombre',
        'origen',
        'destino',
    )
    ordering = ('-fecha_servicio',)
    date_hierarchy = 'fecha_servicio'
    autocomplete_fields = ('cliente', 'servicio', 'vehiculo', 'conductor')
    readonly_fields = ('id', 'created_at', 'updated_at', 'deleted_at')
    fieldsets = (
        ('Identificación', {
            'fields': ('id', 'codigo_reserva', 'estado_reserva')
        }),
        ('Partes Involucradas', {
            'fields': ('cliente', 'servicio')
        }),
        ('Detalles del Viaje', {
            'fields': ('fecha_servicio', 'hora_servicio', 'cantidad_pasajeros', 'origen', 'destino', 'tarifa_final')
        }),
        ('Recursos Asignados', {
            'fields': ('vehiculo', 'conductor')
        }),
        ('Notas', {
            'classes': ('collapse',),
            'fields': ('notas',)
        }),
        ('Auditoría', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at', 'deleted_at')
        }),
    )
