from typing import Optional
from decimal import Decimal

# RQ-03: Calcular el costo estimado de combustible
def calcular_costo_combustible(distancia_km: float, consumo_vehiculo_km_por_litro: float, precio_combustible_por_litro: float) -> Decimal:
    """
    Calcula el costo estimado de combustible para una ruta.
    
    :param distancia_km: Distancia total de la ruta en kilómetros.
    :param consumo_vehiculo_km_por_litro: Rendimiento del vehículo (km recorridos por 1 litro de combustible).
    :param precio_combustible_por_litro: Precio de un litro de combustible.
    :return: Costo total estimado en formato Decimal.
    """
    if consumo_vehiculo_km_por_litro <= 0:
        return Decimal('0.00')
    
    litros_necesarios = distancia_km / consumo_vehiculo_km_por_litro
    costo_total = litros_necesarios * precio_combustible_por_litro
    
    return Decimal(str(round(costo_total, 2)))

# RQ-04 y RQ-05: Verificar mantenimiento preventivo
def verificar_mantenimiento(vehiculo) -> bool:
    """
    Verifica si un vehículo requiere mantenimiento preventivo.
    Se requiere mantenimiento si la diferencia entre el kilometraje actual y
    el del último mantenimiento es mayor o igual a 10,000 km.
    
    :param vehiculo: Instancia del modelo Vehiculo.
    :return: True si requiere mantenimiento, False en caso contrario.
    """
    diferencia = vehiculo.kilometraje_actual - vehiculo.kilometraje_base
    if diferencia >= 10000:
        return True
    return False
