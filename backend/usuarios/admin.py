from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """
    Panel de administración para el modelo de Usuario personalizado.
    Extiende UserAdmin para conservar el comportamiento de gestión de contraseñas.
    """

    # ── Columnas visibles en el listado ──────────────────────────────────────
    list_display = ('email', 'nombre_completo', 'rol', 'telefono', 'is_active', 'created_at')
    list_display_links = ('email', 'nombre_completo')

    # ── Filtros laterales ─────────────────────────────────────────────────────
    list_filter = ('rol', 'is_active', 'created_at')

    # ── Búsqueda por texto ────────────────────────────────────────────────────
    search_fields = ('email', 'username', 'nombre_completo', 'telefono')

    # ── Orden por defecto ─────────────────────────────────────────────────────
    ordering = ('nombre_completo',)

    # ── Campos de solo lectura en el detalle ─────────────────────────────────
    readonly_fields = ('id', 'created_at', 'updated_at', 'deleted_at', 'last_login', 'date_joined')

    # ── Secciones del formulario de edición ───────────────────────────────────
    fieldsets = (
        ('Credenciales de Acceso', {
            'fields': ('id', 'username', 'email', 'password')
        }),
        ('Información Personal', {
            'fields': ('nombre_completo', 'telefono', 'rol')
        }),
        ('Permisos del Sistema', {
            'classes': ('collapse',),
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Auditoría', {
            'classes': ('collapse',),
            'fields': ('created_at', 'updated_at', 'deleted_at', 'last_login', 'date_joined')
        }),
    )

    # ── Secciones del formulario de creación ──────────────────────────────────
    add_fieldsets = (
        ('Crear Usuario', {
            'classes': ('wide',),
            'fields': ('username', 'email', 'nombre_completo', 'telefono', 'rol', 'password1', 'password2')
        }),
    )
