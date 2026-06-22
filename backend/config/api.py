from ninja import NinjaAPI

from operaciones.api import router as operaciones_router

api = NinjaAPI(
    title="API de Multiservicios Grijalva",
    version="1.0.0",
    description="API REST para el Sistema de Gestión de Reservas de Transporte"
)

api.add_router("/operaciones/", operaciones_router)

@api.get("/salud/", tags=["Salud"])
def salud(request):
    """
    Endpoint de comprobación de estado de la API.
    """
    return {
        "estado": "operacional",
        "mensaje": "El backend de Django está funcionando correctamente con Django Ninja."
    }
