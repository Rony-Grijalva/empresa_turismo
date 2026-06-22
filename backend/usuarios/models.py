import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone

class UsuarioQuerySet(models.QuerySet):
    def delete(self):
        return super().update(deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

    def active(self):
        return self.filter(deleted_at__isnull=True)

class UsuarioManager(BaseUserManager):
    def get_queryset(self):
        return UsuarioQuerySet(self.model, using=self._db).active()

    def all_with_deleted(self):
        return UsuarioQuerySet(self.model, using=self._db)

    def create_user(self, email, username=None, password=None, **extra_fields):
        if not email:
            raise ValueError('El usuario debe tener un correo electrónico')
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username=None, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('rol', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


# ─────────────────────────────────────────────────────────────────────────────
# Modelo de Usuario Personalizado
# ─────────────────────────────────────────────────────────────────────────────

class Usuario(AbstractUser):
    """
    Modelo de usuario personalizado que extiende AbstractUser de Django.
    Añade campos de negocio (rol, telefono, nombre_completo) y soporte para
    Soft Delete con campo de auditoría deleted_at.
    """

    class Rol(models.TextChoices):
        ADMINISTRADOR = 'ADMIN', 'Administrador'
        CLIENTE = 'CLIENTE', 'Cliente'

    # UUID como llave primaria para mayor seguridad
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name='ID'
    )
    # Django ya provee: username, email, password, first_name, last_name, is_active, etc.
    # Ampliamos con campos de negocio propios:
    nombre_completo = models.CharField(
        max_length=150,
        blank=True,
        verbose_name='Nombre Completo'
    )
    telefono = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        verbose_name='Teléfono'
    )
    rol = models.CharField(
        max_length=10,
        choices=Rol.choices,
        default=Rol.CLIENTE,
        db_index=True,
        verbose_name='Rol'
    )
    email = models.EmailField(
        unique=True,
        verbose_name='Correo Electrónico'
    )

    # ── Auditoría ────────────────────────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Creado el')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='Actualizado el')
    deleted_at = models.DateTimeField(
        null=True,
        blank=True,
        db_index=True,
        verbose_name='Eliminado el'
    )

    # Manager por defecto filtra registros activos
    objects = UsuarioManager()
    all_objects = models.Manager()

    USERNAME_FIELD = 'email'
    # username sigue siendo obligatorio para AbstractUser, así que lo dejamos
    # pero el login principal será por email
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'usuarios'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['nombre_completo']

    def __str__(self):
        return f'{self.nombre_completo or self.username} [{self.get_rol_display()}]'

    @property
    def is_admin(self):
        return self.rol == self.Rol.ADMINISTRADOR

    @property
    def is_cliente(self):
        return self.rol == self.Rol.CLIENTE

    def delete(self, using=None, keep_parents=False):
        """Borrado lógico: marca deleted_at y desactiva el usuario."""
        self.deleted_at = timezone.now()
        self.is_active = False
        self.save(using=using)

    def hard_delete(self, using=None, keep_parents=False):
        """Borrado físico definitivo."""
        super().delete(using=using, keep_parents=keep_parents)
