from django.core.management.base import BaseCommand
from operaciones.models import Servicio, Vehiculo

class Command(BaseCommand):
    help = 'Puebla la base de datos con Servicios y Vehículos maestros para Multiservicios Grijalva'

    def handle(self, *args, **options):
        # 1. Inyectar Servicios
        servicios_data = [
            {"nombre": "Transporte Turístico", "tarifa_referencial": 150.00},
            {"nombre": "Traslado de Personal", "tarifa_referencial": 200.00},
            {"nombre": "Traslados al Aeropuerto", "tarifa_referencial": 100.00},
        ]
        
        self.stdout.write("Inyectando Servicios...")
        for s in servicios_data:
            obj, created = Servicio.objects.get_or_create(
                nombre=s["nombre"],
                defaults={"tarifa_referencial": s["tarifa_referencial"], "activo": True}
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  + Creado: {obj.nombre}'))
            else:
                self.stdout.write(f'  = Existente: {obj.nombre}')

        # 2. Inyectar Vehículos
        vehiculos_data = [
            {"placa": "COA-001", "modelo": "Toyota Coaster", "capacidad": 25, "anio": 2022},
            {"placa": "HYU-002", "modelo": "Hyundai Coaster (County)", "capacidad": 25, "anio": 2023},
            {"placa": "HIA-003", "modelo": "Toyota Hiace", "capacidad": 15, "anio": 2024},
            {"placa": "HIL-004", "modelo": "Toyota Hilux", "capacidad": 4, "anio": 2024},
        ]

        self.stdout.write("\nInyectando Vehículos de Flota...")
        for v in vehiculos_data:
            obj, created = Vehiculo.objects.get_or_create(
                placa=v["placa"],
                defaults={
                    "modelo": v["modelo"],
                    "capacidad": v["capacidad"],
                    "anio": v["anio"],
                    "estado": Vehiculo.Estado.DISPONIBLE
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'  + Creado: {obj.placa} ({obj.modelo})'))
            else:
                self.stdout.write(f'  = Existente: {obj.placa} ({obj.modelo})')

        self.stdout.write(self.style.SUCCESS('\n¡Semilla inyectada correctamente! La BD está lista para pruebas E2E.'))
