import uuid
from django.db import models
from django.utils import timezone

class SoftDeleteQuerySet(models.QuerySet):
    """
    QuerySet personalizado para soportar borrado lógico (Soft Delete) en operaciones por lote.
    """
    def delete(self):
        return super().update(deleted_at=timezone.now())

    def hard_delete(self):
        return super().delete()

    def active(self):
        return self.filter(deleted_at__isnull=True)

class SoftDeleteManager(models.Manager):
    """
    Manager por defecto que filtra los registros eliminados lógicamente.
    """
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).active()

    def all_with_deleted(self):
        return SoftDeleteQuerySet(self.model, using=self._db)

class BaseModel(models.Model):
    """
    Clase base abstracta para todos los modelos del sistema.
    Proporciona UUIDs como llaves primarias y campos de auditoría con Soft Delete.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Fecha de Creación")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Fecha de Actualización")
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True, verbose_name="Fecha de Eliminación")

    objects = SoftDeleteManager()
    all_objects = models.Manager()  # Permite acceder a todos los registros incluyendo eliminados

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        """
        Sobrescribe el borrado físico para realizar un borrado lógico.
        """
        self.deleted_at = timezone.now()
        self.save(using=using)

    def hard_delete(self, using=None, keep_parents=False):
        """
        Realiza un borrado físico definitivo del registro en la base de datos.
        """
        super().delete(using=using, keep_parents=keep_parents)
