from ninja import Router, Query
from ninja.pagination import paginate
from ninja_jwt.authentication import JWTAuth
from ninja.errors import HttpError
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from uuid import UUID
from django.db import IntegrityError

from usuarios.schemas import (
    UsuarioInSchema, UsuarioOutSchema, UsuarioFilterSchema, BulkUsuarioIdsSchema
)

usuarios_admin_router = Router(auth=JWTAuth())
Usuario = get_user_model()

def check_admin_or_superuser(request):
    """Verifica si el usuario es superuser o tiene rol ADMINISTRADOR"""
    if not (request.user.is_superuser or getattr(request.user, 'rol', '') == 'ADMIN'):
        raise HttpError(403, "No tienes permisos suficientes para realizar esta acción.")

@usuarios_admin_router.get("/", tags=["Admin", "Usuarios"], response=list[UsuarioOutSchema])
@paginate
def listar_usuarios(request, filters: UsuarioFilterSchema = Query(...)):
    qs = Usuario.objects.all().order_by('nombre_completo')
    qs = filters.filter(qs)
    return qs

@usuarios_admin_router.post("/", tags=["Admin", "Usuarios"], response={201: UsuarioOutSchema})
def crear_usuario(request, payload: UsuarioInSchema):
    check_admin_or_superuser(request)
    
    password = payload.password or 'Grijalva2026*'
    
    try:
        usuario = Usuario.objects.create_user(
            email=payload.email,
            username=payload.username,
            password=password,
            nombre_completo=payload.nombre_completo,
            telefono=payload.telefono,
            rol=payload.rol,
            is_active=payload.is_active if payload.is_active is not None else True
        )
    except IntegrityError:
        raise HttpError(400, "El correo electrónico o username ya están registrados.")
        
    return 201, usuario

@usuarios_admin_router.get("/{usuario_id}/", tags=["Admin", "Usuarios"], response={200: UsuarioOutSchema})
def obtener_usuario(request, usuario_id: UUID):
    return get_object_or_404(Usuario, id=usuario_id)

@usuarios_admin_router.put("/{usuario_id}/", tags=["Admin", "Usuarios"], response={200: UsuarioOutSchema})
def actualizar_usuario(request, usuario_id: UUID, payload: UsuarioInSchema):
    check_admin_or_superuser(request)
    usuario = get_object_or_404(Usuario, id=usuario_id)
    
    # Prevenir que un admin se quite sus propios permisos por error
    if str(usuario.id) == str(request.user.id) and payload.rol != 'ADMIN' and getattr(request.user, 'rol', '') == 'ADMIN':
        raise HttpError(400, "No puedes quitarte el rol de Administrador a ti mismo.")
        
    usuario.email = payload.email
    usuario.username = payload.username
    usuario.nombre_completo = payload.nombre_completo
    usuario.telefono = payload.telefono
    usuario.rol = payload.rol
    
    if payload.is_active is not None:
        usuario.is_active = payload.is_active
        
    if payload.password:
        usuario.set_password(payload.password)
        
    try:
        usuario.save()
    except IntegrityError:
        raise HttpError(400, "El correo electrónico o username ya están registrados por otro usuario.")
        
    return 200, usuario

@usuarios_admin_router.delete("/{usuario_id}/", tags=["Admin", "Usuarios"])
def eliminar_usuario(request, usuario_id: UUID):
    check_admin_or_superuser(request)
    if str(request.user.id) == str(usuario_id):
        raise HttpError(400, "No puedes eliminarte a ti mismo.")
        
    usuario = get_object_or_404(Usuario, id=usuario_id)
    usuario.delete()  # Hace borrado lógico según el modelo Usuario
    return {"success": True, "message": "Usuario eliminado lógicamente"}

@usuarios_admin_router.delete("/bulk/delete/", tags=["Admin", "Usuarios", "Bulk"])
def bulk_delete_usuarios(request, payload: BulkUsuarioIdsSchema):
    check_admin_or_superuser(request)
    
    if request.user.id in payload.ids:
        raise HttpError(400, "No puedes eliminarte a ti mismo en una acción masiva.")
        
    # El delete masivo ejecuta el borrado lógico ya que el queryset de Usuario está sobrescrito
    Usuario.objects.filter(id__in=payload.ids).delete()
    return {"success": True, "message": f"{len(payload.ids)} usuarios eliminados lógicamente"}
