#!/usr/bin/env python3
# test_abm_engine.py - TDD Suite para Motor ABM
# Ejecutar: pytest test_abm_engine.py -v --cov=civicpulse.abm

import pytest
import numpy as np
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class ImpactoPolitica:
    felicidadDelta: float = 0.0
    ingresoDeltaPct: float = 0.0
    empleoDeltaPct: float = 0.0
    confianzaDelta: float = 0.0
    costoPresupuestalPerCapita: float = 0.0

class AgenteSector:
    def __init__(self, tipo: str, felicidadBase: float, confianzaInstitucional: float = 50.0,
                 ingresoPromedio: float = 15000, poblacionSintetica: int = 1000):
        self.tipo = tipo
        self.felicidadBase = felicidadBase
        self.felicidadActual = felicidadBase
        self.confianzaInstitucional = confianzaInstitucional
        self.confianzaActual = confianzaInstitucional
        self.ingresoPromedio = ingresoPromedio
        self.ingresoActual = ingresoPromedio
        self.poblacionSintetica = poblacionSintetica
        self.estado = 'normal'

    def aplicar_impacto(self, impacto: ImpactoPolitica, progreso: float, eficacia: float):
        self.felicidadActual += impacto.felicidadDelta * progreso * eficacia
        self.felicidadActual = max(0, min(100, self.felicidadActual))

        self.ingresoActual *= (1 + impacto.ingresoDeltaPct * progreso * eficacia)
        self.confianzaActual += impacto.confianzaDelta * progreso * eficacia
        self.confianzaActual = max(0, min(100, self.confianzaActual))

    def aplicar_erosion_anual(self):
        self.confianzaActual *= 0.98

    def aplicar_contagio(self, vecinos: List['AgenteSector']):
        if not vecinos:
            return
        felicidad_vecinos = np.mean([v.felicidadActual for v in vecinos])
        self.felicidadActual += 0.05 * (felicidad_vecinos - self.felicidadActual)
        self.felicidadActual = max(0, min(100, self.felicidadActual))

    def step_mensual(self):
        if self.felicidadActual < 30:
            self.estado = 'crisis_social'
            self.confianzaActual *= 0.80
        else:
            self.estado = 'normal'

class TestAgenteSector:
    def test_inicializacion(self):
        a = AgenteSector('joven_gig', 45, 30)
        assert a.felicidadActual == 45
        assert 0 <= a.confianzaActual <= 100

    def test_aplicar_impacto(self):
        a = AgenteSector('comerciante', 50)
        imp = ImpactoPolitica(felicidadDelta=12, ingresoDeltaPct=0.05, confianzaDelta=8)
        a.aplicar_impacto(imp, 1.0, 0.8)
        assert a.felicidadActual == pytest.approx(59.6, 0.1)

    def test_felicidad_clamp_100(self):
        a = AgenteSector('asalariado', 95)
        imp = ImpactoPolitica(felicidadDelta=20)
        a.aplicar_impacto(imp, 1.0, 1.0)
        assert a.felicidadActual == 100

    def test_erosion_anual(self):
        a = AgenteSector('joven_gig', 50, 50)
        a.aplicar_erosion_anual()
        assert a.confianzaActual == pytest.approx(49.0, 0.1)

    def test_contagio(self):
        a = AgenteSector('comerciante', 80)
        b = AgenteSector('asalariado', 40)
        a.aplicar_contagio([b])
        assert a.felicidadActual < 80
        assert a.felicidadActual > 60

    def test_crisis_social(self):
        a = AgenteSector('joven_gig', 35, 40)
        for _ in range(6):
            a.step_mensual()
        if a.felicidadActual < 30:
            assert a.estado == 'crisis_social'

if __name__ == '__main__':
    pytest.main([__file__, '-v'])
