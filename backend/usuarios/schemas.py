from ninja import ModelSchema, FilterSchema, Schema
from typing import Optional, List
from pydantic import Field
from uuid import UUID
from django.contrib.auth import get_user_model

Usuario = get_user_model()

class UsuarioInSchema(ModelSchema):
    password: Optional[str] = None

    class Meta:
        model = Usuario
        fields = ['username', 'email', 'nombre_completo', 'telefono', 'rol', 'is_active']

class UsuarioOutSchema(ModelSchema):
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'nombre_completo', 'telefono', 'rol', 'is_active', 'created_at']

class UsuarioFilterSchema(FilterSchema):
    q: Optional[str] = Field(None, q=['nombre_completo__icontains', 'email__icontains', 'username__icontains'])
    rol: Optional[str] = None
    is_active: Optional[bool] = None

class BulkUsuarioIdsSchema(Schema):
    ids: List[UUID]
