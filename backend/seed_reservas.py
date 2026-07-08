"""
seed_reservas.py — Genera reservas de ejemplo para poblar el Dashboard.

Crea reservas a lo largo del mes en curso, con una mezcla de estados
(confirmadas, completadas, pendientes) y recursos asignados, de modo que el
panel administrativo muestre "cuántos viajes" y "cuánto dinero ingresa"
(coherente con el testimonio del cliente).

Idempotente: borra las reservas de demo previas (marca en cliente_correo) y
las vuelve a crear. Uso:  .\venv\Scripts\python seed_reservas.py
"""
import os
import sys
import django
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta

if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.utils import timezone
from operaciones.models import Reserva, Servicio, Vehiculo, Conductor

MARCA_DEMO = "@demo.local"

print("=" * 60)
print("  SEED DE RESERVAS — Dashboard Multiservicios Grijalva")
print("=" * 60)

# Limpiar reservas de demo previas (borrado FÍSICO) para poder re-ejecutar
borradas = Reserva.objects.filter(cliente_correo__endswith=MARCA_DEMO).hard_delete()
print(f"\nReservas de demo previas eliminadas: {borradas[0]}")

servicios = list(Servicio.objects.all())
vehiculos = list(Vehiculo.objects.exclude(estado=Vehiculo.Estado.MANTENIMIENTO))
conductores = list(Conductor.objects.exclude(estado=Conductor.Estado.NO_DISPONIBLE))

if not (servicios and vehiculos and conductores):
    print("⚠️  Faltan datos base (servicios/vehículos/conductores). Ejecuta primero seed_data.py")
    sys.exit(1)

ahora = timezone.now()
anio, mes = ahora.year, ahora.month

# (dia_del_mes, hora, servicio_idx, estado, pasajeros)
E = Reserva.EstadoReserva
plantilla = [
    (2,  8,  0, E.COMPLETADA, 10),
    (3,  7,  1, E.COMPLETADA, 12),
    (5,  9,  2, E.COMPLETADA, 8),
    (7,  6,  3, E.COMPLETADA, 3),
    (9,  8,  0, E.CONFIRMADA, 14),
    (11, 7,  1, E.CONFIRMADA, 11),
    (14, 10, 4, E.CONFIRMADA, 20),
    (16, 8,  2, E.CONFIRMADA, 6),
    (18, 9,  0, E.PENDIENTE,  9),
    (21, 7,  3, E.PENDIENTE,  4),
    (23, 8,  1, E.CONFIRMADA, 10),
    (25, 6,  4, E.COMPLETADA, 18),
    (27, 9,  2, E.PENDIENTE,  7),
    (28, 8,  0, E.CONFIRMADA, 12),
]

clientes = [
    "Comercial Andina SAC", "Colegio San Marcos", "Turismo Perú Tours",
    "Minera Los Andes", "Familia Rodríguez", "Hotel Costa del Sol",
    "Universidad Continental", "Corporación Textil SAC",
]

# Continuar la numeración desde el máximo correlativo real (incluye soft-deleted,
# porque la restricción UNIQUE de codigo_reserva es a nivel de base de datos).
prefijo = f"MG-{anio}-"
suf = []
for c in Reserva.all_objects.filter(codigo_reserva__startswith=prefijo).values_list('codigo_reserva', flat=True):
    try:
        suf.append(int(c.rsplit('-', 1)[1]))
    except (ValueError, IndexError):
        pass
base = max(suf) if suf else 0
creadas = 0

for i, (dia, hora, sidx, estado, pax) in enumerate(plantilla):
    servicio = servicios[sidx % len(servicios)]
    inicio = timezone.make_aware(datetime(anio, mes, dia, hora, 0))
    fin = inicio + timedelta(hours=4)
    base += 1
    codigo = f"MG-{anio}-{base:04d}"

    asignar = estado in (E.CONFIRMADA, E.COMPLETADA)
    reserva = Reserva.objects.create(
        codigo_reserva=codigo,
        cliente=None,
        cliente_nombre=clientes[i % len(clientes)],
        cliente_correo=f"cliente{i+1}{MARCA_DEMO}",
        cliente_telefono=f"9{(80000000 + i*111111) % 100000000:08d}",
        servicio=servicio,
        vehiculo=vehiculos[i % len(vehiculos)] if asignar else None,
        conductor=conductores[i % len(conductores)] if asignar else None,
        fecha_hora_inicio=inicio,
        fecha_hora_fin=fin,
        cantidad_pasajeros=pax,
        origen="Lima",
        destino=["Cusco", "Paracas", "Huaraz", "Ica", "Nazca"][i % 5],
        tarifa_final=servicio.tarifa_referencial,
        estado_reserva=estado,
        estado_pago=Reserva.EstadoPago.PAGADO if estado == E.COMPLETADA else Reserva.EstadoPago.PENDIENTE,
        notas="Reserva de demostración",
    )
    creadas += 1
    print(f"  ✅ {codigo}  {inicio.strftime('%d/%m %H:%M')}  {estado:<11} S/{reserva.tarifa_final}  {reserva.cliente_nombre}")

# Resumen tipo dashboard
from django.db.models import Sum
delmes = Reserva.objects.filter(fecha_hora_inicio__year=anio, fecha_hora_inicio__month=mes)
ingresos = delmes.filter(estado_reserva__in=[E.CONFIRMADA, E.COMPLETADA]).aggregate(t=Sum('tarifa_final'))['t'] or 0

print("\n" + "=" * 60)
print(f"  Reservas creadas: {creadas}")
print(f"  Total reservas del mes ({mes:02d}/{anio}): {delmes.count()}")
print(f"  Ingresos estimados del mes (confirmadas+completadas): S/ {ingresos}")
print("=" * 60)
