from ninja import NinjaAPI

from ninja_jwt.controller import NinjaJWTDefaultController
from ninja_extra import NinjaExtraAPI

from operaciones.api import router as operaciones_router
from operaciones.admin_api import admin_router
from usuarios.admin_api import usuarios_admin_router

api = NinjaExtraAPI(
    title="API de Multiservicios Grijalva",
    version="1.0.0",
    description="API REST para el Sistema de Gestión de Reservas de Transporte"
)

api.register_controllers(NinjaJWTDefaultController)

api.add_router("/operaciones/", operaciones_router)
api.add_router("/admin/", admin_router)
api.add_router("/admin/usuarios/", usuarios_admin_router)

@api.get("/salud/", tags=["Salud"])
def salud(request):
    """
    Endpoint de comprobación de estado de la API.
    """
    return {
        "estado": "operacional",
        "mensaje": "El backend de Django está funcionando correctamente con Django Ninja."
    }
