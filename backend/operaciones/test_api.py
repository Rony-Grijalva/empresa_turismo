"""
Pruebas automatizadas de la API de Operaciones (RD-07).

Cubren el flujo público de reservas y una regla de dominio:
  - RF-01  Listado de servicios (solo activos)
  - RF-02/RF-04  Registro de reserva y generación de código MG-AAAA-NNNN
  - RF-05  Envío de correo de confirmación
  - RF-08  Consulta de estado por código de seguimiento
  - RDm-02 Prevención de cruce de horarios (mismo vehículo)

Ejecutar:  .\venv\Scripts\python -m pytest -v
"""
import pytest
from decimal import Decimal
from datetime import timedelta

from django.utils import timezone
from django.core import mail
from ninja.testing import TestClient

from operaciones.api import router
from operaciones.models import Servicio, Reserva, Vehiculo, Conductor

client = TestClient(router)


@pytest.fixture
def servicio(db):
    return Servicio.objects.create(
        nombre="Transporte Turístico",
        descripcion="Servicio de prueba",
        tarifa_referencial=Decimal("250.00"),
        activo=True,
    )


def _payload(servicio, pasajeros=4):
    inicio = timezone.now() + timedelta(days=1)
    return {
        "servicio_id": str(servicio.id),
        "cliente_nombre": "Cliente Test",
        "cliente_correo": "test@correo.com",
        "cliente_telefono": "999888777",
        "fecha_hora_inicio": inicio.isoformat(),
        "fecha_hora_fin": (inicio + timedelta(hours=3)).isoformat(),
        "cantidad_pasajeros": pasajeros,
        "origen": "Lima",
        "destino": "Cusco",
        "notas": "",
    }


def test_listar_servicios_solo_activos(db):
    """RF-01: el catálogo público expone únicamente servicios activos."""
    Servicio.objects.create(nombre="Activo", tarifa_referencial=Decimal("100.00"), activo=True)
    Servicio.objects.create(nombre="Inactivo", tarifa_referencial=Decimal("100.00"), activo=False)

    resp = client.get("/servicios")
    assert resp.status_code == 200
    nombres = [s["nombre"] for s in resp.json()]
    assert "Activo" in nombres
    assert "Inactivo" not in nombres


def test_crear_reserva_genera_codigo_correlativo(servicio):
    """RF-02/RF-04: cada reserva obtiene un código MG-AAAA-NNNN correlativo."""
    anio = timezone.now().year

    r1 = client.post("/reservas", json=_payload(servicio))
    r2 = client.post("/reservas", json=_payload(servicio))
    assert r1.status_code == 201 and r2.status_code == 201

    assert r1.json()["codigo_reserva"] == f"MG-{anio}-0001"
    assert r2.json()["codigo_reserva"] == f"MG-{anio}-0002"


def test_crear_reserva_envia_correo_confirmacion(servicio):
    """RF-05: al registrar la reserva se envía el correo con el código."""
    resp = client.post("/reservas", json=_payload(servicio))
    codigo = resp.json()["codigo_reserva"]

    assert len(mail.outbox) == 1
    assert codigo in mail.outbox[0].body
    assert mail.outbox[0].to == ["test@correo.com"]


def test_seguimiento_encuentra_reserva_y_404(servicio):
    """RF-08: la consulta por código devuelve la reserva o 404 si no existe."""
    codigo = client.post("/reservas", json=_payload(servicio)).json()["codigo_reserva"]

    ok = client.get(f"/reservas/seguimiento/{codigo}")
    assert ok.status_code == 200
    assert ok.json()["codigo_reserva"] == codigo

    nf = client.get("/reservas/seguimiento/MG-9999-9999")
    assert nf.status_code == 404


def test_regla_cruce_de_horarios_mismo_vehiculo(servicio):
    """RDm-02: no se puede asignar un vehículo que ya tiene una reserva solapada."""
    inicio = timezone.now() + timedelta(days=2)
    vehiculo = Vehiculo.objects.create(
        placa="TST-001", marca="Toyota", modelo="Hiace", capacidad=12, anio=2022,
        estado=Vehiculo.Estado.DISPONIBLE,
    )

    def nueva_reserva(codigo):
        return Reserva.objects.create(
            codigo_reserva=codigo, cliente_nombre="X", cliente_correo="x@x.com",
            servicio=servicio, fecha_hora_inicio=inicio,
            fecha_hora_fin=inicio + timedelta(hours=4), cantidad_pasajeros=5,
            origen="A", destino="B", tarifa_final=Decimal("250.00"),
            estado_reserva=Reserva.EstadoReserva.CONFIRMADA,
        )

    reserva_a = nueva_reserva("MG-TEST-0001")
    reserva_a.vehiculo = vehiculo
    reserva_a.save()

    reserva_b = nueva_reserva("MG-TEST-0002")  # se solapa en el mismo horario

    resp = client.put(
        f"/reservas/{reserva_b.id}/admin",
        json={
            "tarifa_final": "250.00",
            "estado_reserva": "CONFIRMADA",
            "vehiculo_id": str(vehiculo.id),
        },
    )
    assert resp.status_code == 400  # bloqueado por solapamiento (y valida el fix de HttpError)
