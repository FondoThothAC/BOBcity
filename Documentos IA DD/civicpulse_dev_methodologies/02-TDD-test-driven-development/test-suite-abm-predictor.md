# ABM Engine Test Suite

## Test Strategy
- Framework: pytest (Python) + pytest-asyncio
- Coverage target: >85% para motor de simulación
- Fixtures: Datos sintéticos de Hermosillo precargados

## Unit Tests

### test_agente_sector.py
```python
import pytest
from civicpulse.abm import AgenteSector, ImpactoPolitica

class TestAgenteSector:

    def test_inicializacion_felicidad_en_rango(self):
        agente = AgenteSector(
            tipo='joven_gig',
            felicidadBase=45,
            confianzaInstitucional=30
        )
        assert 0 <= agente.felicidadActual <= 100
        assert 0 <= agente.confianzaActual <= 100

    def test_aplicar_impacto_politica_actualiza_estado(self):
        agente = AgenteSector(tipo='comerciante', felicidadBase=50)
        impacto = ImpactoPolitica(
            felicidadDelta=+12,
            ingresoDeltaPct=0.05,
            confianzaDelta=+8
        )
        agente.aplicar_impacto(impacto, progreso=1.0, eficacia=0.8)

        assert agente.felicidadActual == pytest.approx(59.6, 0.1)  # 50 + 12*0.8
        assert agente.ingresoActual == pytest.approx(1.04, 0.01)   # 1.0 * 1.05*0.8

    def test_felicidad_no_excede_100(self):
        agente = AgenteSector(tipo='asalariado', felicidadBase=95)
        impacto = ImpactoPolitica(felicidadDelta=+20)
        agente.aplicar_impacto(impacto, progreso=1.0, eficacia=1.0)
        assert agente.felicidadActual == 100

    def test_erosion_confianza_anual(self):
        agente = AgenteSector(tipo='joven_gig', confianzaInstitucional=50)
        agente.aplicar_erosion_anual()
        assert agente.confianzaActual == pytest.approx(49.0, 0.1)  # 50 * 0.98

    def test_efecto_contagio_felicidad_vecinos(self):
        agente_a = AgenteSector(tipo='comerciante', felicidadBase=80)
        agente_b = AgenteSector(tipo='asalariado', felicidadBase=40)

        agente_a.aplicar_contagio([agente_b])
        # agente_a debería bajar ligeramente hacia promedio
        assert agente_a.felicidadActual < 80
        assert agente_a.felicidadActual > 60  # promedio es 60

    def test_crisis_social_activa_bajo_30(self):
        agente = AgenteSector(tipo='joven_gig', felicidadBase=35, confianzaInstitucional=40)
        for _ in range(6):  # 6 meses
            agente.step_mensual()

        if agente.felicidadActual < 30:
            assert agente.estado == 'crisis_social'
            assert agente.confianzaActual <= 20  # -20% colapso
```

### test_simulador_abm.py
```python
import pytest
from civicpulse.abm import ABMSimulator, Politica

class TestABMSimulator:

    def test_simulacion_10_anios_completa(self):
        sim = ABMSimulator(territorio_id='26-019')
        sim.inicializar_sectores(['comerciante', 'joven_gig', 'asalariado'])

        politica = Politica(
            nombre='Subsidio Transporte',
            impactoPorSector={
                'joven_gig': ImpactoPolitica(felicidadDelta=15, ingresoDeltaPct=0.03),
                'comerciante': ImpactoPolitica(felicidadDelta=5, ingresoDeltaPct=0.01),
                'asalariado': ImpactoPolitica(felicidadDelta=2, ingresoDeltaPct=0.0)
            }
        )
        sim.agregar_politica(politica)
        sim.step(meses=120)  # 10 años

        assert sim.tiempo == 120
        assert len(sim.historial) == 120
        assert sim.proyectar_resultado_electoral() is not None

    def test_proyeccion_electoral_suma_100_pct(self):
        sim = ABMSimulator(territorio_id='26-019')
        sim.inicializar_sectores(['comerciante', 'joven_gig', 'asalariado'])
        sim.agregar_candidatos(['cand-pan', 'cand-morena', 'cand-mc'])
        sim.step(meses=12)

        resultados = sim.proyectar_resultado_electoral()
        total = sum(resultados.values())
        assert total == pytest.approx(1.0, 0.001)

    def test_inercia_politica_no_instantanea(self):
        sim = ABMSimulator(territorio_id='26-019')
        sim.inicializar_sectores(['joven_gig'])

        politica = Politica(
            nombre='Impuesto Carbono',
            horizonteAnios=5,
            impactoPorSector={'joven_gig': ImpactoPolitica(felicidadDelta=-20)}
        )
        sim.agregar_politica(politica)

        # Mes 1: apenas empieza
        sim.step(meses=1)
        agente = sim.sectores[0]
        # Impacto parcial: 1/60 meses * inercia
        assert agente.felicidadActual > 30  # No baja todo de golpe

    def test_simulacion_reproduce_historico(self):
        # Test de calibración: la simulación debe reproducir elección 2024 conocida
        sim = ABMSimulator(territorio_id='26-019')
        sim.cargar_configuracion_historica(2024)
        sim.step(meses=6)  # Simulación hasta elección

        resultado = sim.proyectar_resultado_electoral()
        ganador_real = 'MORENA'  # dato conocido
        ganador_predicho = max(resultado, key=resultado.get)

        assert ganador_predicho == ganador_real
        assert abs(resultado[ganador_predicho] - 0.48) < 0.05  # margen 5%
```

## Integration Tests

### test_api_predictor.py
```python
import pytest
from fastapi.testclient import TestClient
from civicpulse.api import app

client = TestClient(app)

class TestPredictorAPI:

    def test_predict_victoria_valid_payload(self):
        payload = {
            "territorioId": "26-019",
            "candidato": {
                "edad": 45,
                "genero": "F",
                "nivelEducativo": 2,
                "experienciaSeguridad": True,
                "esIncumbente": False,
                "propuestas": [
                    {"tema": "seguridad", "peso": 0.4, "especificidad": 0.8}
                ]
            },
            "contexto": {
                "tasaHomicidios": 18.5,
                "pobrezaPct": 32.1
            }
        }

        response = client.post("/api/v1/predict/victoria", json=payload)
        assert response.status_code == 200
        data = response.json()

        assert 0 <= data["probabilidadVictoria"] <= 1
        assert len(data["drivers"]) > 0
        assert data["intervaloConfianza"][0] < data["intervaloConfianza"][1]

    def test_predict_requiere_territorio(self):
        response = client.post("/api/v1/predict/victoria", json={})
        assert response.status_code == 422

    def test_explainability_top_drivers(self):
        payload = {
            "territorioId": "26-019",
            "candidato": {"edad": 50, "experienciaSeguridad": True},
            "contexto": {"tasaHomicidios": 25}
        }

        response = client.post("/api/v1/predict/explain", json=payload)
        data = response.json()

        assert "experienciaSeguridad_x_tasaHomicidios" in str(data["drivers"])
        assert data["contribucionPerfil"] + data["contribucionContexto"] + data["contribucionDinamica"] == pytest.approx(1.0, 0.01)
```

## Performance Tests

### test_performance_abm.py
```python
import pytest
import time
from civicpulse.abm import ABMSimulator

class TestPerformance:

    def test_simulacion_10_anios_under_5s(self):
        sim = ABMSimulator(territorio_id='26-019')
        sim.inicializar_sectores(['comerciante', 'joven_gig', 'asalariado'])

        start = time.time()
        sim.step(meses=120)
        elapsed = time.time() - start

        assert elapsed < 5.0  # MVP: 10 años en <5 segundos

    def test_predictor_api_under_500ms(self):
        import time
        start = time.time()
        response = client.post("/api/v1/predict/victoria", json=VALID_PAYLOAD)
        elapsed = (time.time() - start) * 1000

        assert response.status_code == 200
        assert elapsed < 500  # API debe responder en <500ms
```
