"""
seed_data.py — Script de inicialización de datos de prueba via ORM de Django.

Carga servicios, vehículos, conductores y un usuario administrador inicial.
Uso: .\venv\Scripts\python manage.py shell < seed_data.py
  o: .\venv\Scripts\python seed_data.py  (modo standalone)
"""
import os
import sys
import django
from pathlib import Path

# Forzar salida UTF-8 en Windows para evitar errores de codificacion
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')


# ── Configurar entorno Django (necesario si se ejecuta standalone) ────────────
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

# ── Importar modelos ──────────────────────────────────────────────────────────
from decimal import Decimal
from usuarios.models import Usuario
from operaciones.models import Conductor, Servicio, Vehiculo, Reserva

print("=" * 60)
print("  SEED DE DATOS — Multiservicios Grijalva")
print("=" * 60)

# ─────────────────────────────────────────────────────────────────────────────
# 1. USUARIO ADMINISTRADOR
# ─────────────────────────────────────────────────────────────────────────────
print("\n[1/4] Creando usuario administrador...")
admin, created = Usuario.objects.get_or_create(
    email='admin@grijalva.pe',
    defaults={
        'username': 'admin_grijalva',
        'nombre_completo': 'Administrador Grijalva',
        'telefono': '987654321',
        'rol': Usuario.Rol.ADMINISTRADOR,
        'is_staff': True,
        'is_superuser': True,
    }
)
if created:
    admin.set_password('Admin2026!')
    admin.save()
    print("   ✅  Administrador creado: admin@grijalva.pe / Admin2026!")
else:
    print("   ℹ️   Administrador ya existe.")

# Usuario cliente de prueba
cliente, created = Usuario.objects.get_or_create(
    email='rony@correo.com',
    defaults={
        'username': 'rony_cliente',
        'nombre_completo': 'Rony Meléndez',
        'telefono': '912345678',
        'rol': Usuario.Rol.CLIENTE,
    }
)
if created:
    cliente.set_password('Cliente2026!')
    cliente.save()
    print("   ✅  Cliente creado: rony@correo.com / Cliente2026!")
else:
    print("   ℹ️   Cliente ya existe.")

# ─────────────────────────────────────────────────────────────────────────────
# 2. SERVICIOS
# ─────────────────────────────────────────────────────────────────────────────
print("\n[2/4] Creando servicios...")
servicios_data = [
    {
        'nombre': 'Transporte Turístico',
        'descripcion': 'Traslados cómodos a centros arqueológicos, museos, playas y paseos recreacionales en Lima y provincias.',
        'tarifa_referencial': Decimal('250.00'),
    },
    {
        'nombre': 'Transporte de Personal',
        'descripcion': 'Servicio diario de ida y vuelta para trabajadores de empresas privadas e industrias. Puntualidad garantizada.',
        'tarifa_referencial': Decimal('200.00'),
    },
    {
        'nombre': 'Transporte Escolar',
        'descripcion': 'Movilidad escolar segura y confiable con conductores profesionales y auxiliares de servicio.',
        'tarifa_referencial': Decimal('180.00'),
    },
    {
        'nombre': 'Traslados al Aeropuerto',
        'descripcion': 'Recojo y traslado al Aeropuerto Internacional Jorge Chávez con espacio amplio para equipaje.',
        'tarifa_referencial': Decimal('120.00'),
    },
    {
        'nombre': 'Viajes Nacionales',
        'descripcion': 'Excursiones y viajes interprovinciales a nivel nacional para familias, grupos y delegaciones.',
        'tarifa_referencial': Decimal('600.00'),
    },
]

for data in servicios_data:
    obj, created = Servicio.objects.get_or_create(nombre=data['nombre'], defaults=data)
    estado = "✅  Creado" if created else "ℹ️   Ya existe"
    print(f"   {estado}: {obj.nombre}")

# ─────────────────────────────────────────────────────────────────────────────
# 3. VEHÍCULOS
# ─────────────────────────────────────────────────────────────────────────────
print("\n[3/4] Creando vehículos...")
vehiculos_data = [
    {'placa': 'F3G-852', 'modelo': 'Hyundai H350 (Van)',                 'capacidad': 15, 'anio': 2022, 'estado': Vehiculo.Estado.DISPONIBLE},
    {'placa': 'B5D-961', 'modelo': 'Toyota Hiace (Minivan)',             'capacidad': 12, 'anio': 2023, 'estado': Vehiculo.Estado.DISPONIBLE},
    {'placa': 'A4P-741', 'modelo': 'Mercedes-Benz Sprinter (Minibús)',   'capacidad': 20, 'anio': 2021, 'estado': Vehiculo.Estado.DISPONIBLE},
    {'placa': 'X7C-159', 'modelo': 'Scania K410 (Bus Interprovincial)',  'capacidad': 45, 'anio': 2020, 'estado': Vehiculo.Estado.MANTENIMIENTO},
]

for data in vehiculos_data:
    obj, created = Vehiculo.objects.get_or_create(placa=data['placa'], defaults=data)
    estado = "✅  Creado" if created else "ℹ️   Ya existe"
    print(f"   {estado}: {obj.placa} — {obj.modelo}")

# ─────────────────────────────────────────────────────────────────────────────
# 4. CONDUCTORES
# ─────────────────────────────────────────────────────────────────────────────
print("\n[4/4] Creando conductores...")
conductores_data = [
    {'nombre': 'Carlos Mendoza',  'licencia': 'A-IIIc-987654', 'telefono': '987654321', 'estado': Conductor.Estado.DISPONIBLE},
    {'nombre': 'José Flores',     'licencia': 'A-IIIa-123456', 'telefono': '951847263', 'estado': Conductor.Estado.DISPONIBLE},
    {'nombre': 'Manuel Quispe',   'licencia': 'A-IIb-789012',  'telefono': '963258741', 'estado': Conductor.Estado.DISPONIBLE},
    {'nombre': 'Ana Huamán',      'licencia': 'A-IIIc-345678', 'telefono': '921753654', 'estado': Conductor.Estado.EN_RUTA},
]

for data in conductores_data:
    obj, created = Conductor.objects.get_or_create(licencia=data['licencia'], defaults=data)
    estado = "✅  Creado" if created else "ℹ️   Ya existe"
    print(f"   {estado}: {obj.nombre} — Lic: {obj.licencia}")

# ─────────────────────────────────────────────────────────────────────────────
# RESUMEN FINAL
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  SEED COMPLETADO")
print("-" * 60)
print(f"  Usuarios:    {Usuario.objects.count()}")
print(f"  Servicios:   {Servicio.objects.count()}")
print(f"  Vehículos:   {Vehiculo.objects.count()}")
print(f"  Conductores: {Conductor.objects.count()}")
print(f"  Reservas:    {Reserva.objects.count()}")
print("=" * 60)
print("\n  ✅  Panel Admin disponible en: http://127.0.0.1:8000/admin/")
print("      Email:    admin@grijalva.pe")
print("      Password: Admin2026!")
print("=" * 60)
