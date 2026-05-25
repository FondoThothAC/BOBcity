# simulation/population_scaler.py
# MDD: Algoritmo de ponderación demográfica para escalamiento 1 a 1 de Agentes.

import math
import random

def calculate_agent_weight_and_kpis(agent_id, home_section, sector):
    """
    Calcula cuántas personas del mundo real representa este agente (peso),
    basado heurísticamente en la densidad y varianza socioeconómica de su sección/AGEB.
    
    Además inicializa los KPIs macro-económicos extendidos.
    """
    # Simularemos la densidad basándonos en el ID de la sección (1 a 12 en el prototipo)
    sec_id = int(home_section)
    
    # Supongamos que las secciones del centro (ej. 5, 6, 7) tienen alta densidad pero menos varianza.
    # Las secciones de la periferia tienen menos densidad pero alta varianza (desigualdad).
    if sec_id in [5, 6, 7]:
        density_factor = 0.8  # Alta densidad
        variance_factor = 0.2 # Baja varianza
    elif sec_id in [1, 2, 11, 12]:
        density_factor = 0.3  # Baja densidad
        variance_factor = 0.9 # Alta varianza
    else:
        density_factor = 0.5
        variance_factor = 0.5
        
    # Peso Base: 1 agente representa a 10 personas por defecto.
    base_weight = 10
    
    # Si hay alta varianza, necesitamos más agentes para representar el área (menor peso por agente).
    # Si hay mucha densidad y poca varianza, un solo agente puede representar a muchos (mayor peso).
    # weight_multiplier = density / (variance + 0.1)
    weight_multiplier = density_factor / (variance_factor + 0.1)
    
    final_weight = max(1, int(base_weight * weight_multiplier))
    
    # === INICIALIZACIÓN DE KPIs EXTENDIDOS ===
    # 1. Estrés Económico (Basado en sector y varianza)
    base_econ_stress = 40.0
    if sector == 'joven':
        base_econ_stress = 60.0 + random.uniform(-10.0, 20.0)
    elif sector == 'comerciante':
        base_econ_stress = 45.0 + random.uniform(-20.0, 15.0)
    elif sector == 'asalariado':
        base_econ_stress = 50.0 + random.uniform(-15.0, 15.0)
        
    # Si hay mucha varianza en la zona, el estrés puede dispararse aleatoriamente
    if variance_factor > 0.6 and random.random() < 0.3:
        base_econ_stress += random.uniform(10.0, 30.0)
        
    # 2. Aprobación Gubernamental (Inversamente proporcional al estrés inicial)
    # Por defecto, arranca neutral o ligado a su condición económica
    base_gov_approval = max(0.0, min(100.0, 100.0 - (base_econ_stress * 0.8)))

    return {
        "weight": final_weight,
        "base_economic_stress": max(0.0, min(100.0, base_econ_stress)),
        "base_government_approval": base_gov_approval
    }
