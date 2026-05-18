# Step Definitions Template (Python + Behave)

# features/steps/mapa_steps.py
from behave import given, when, then
from civicpulse.testing import TestClient

@given('el territorio "{territorio}" está cargado en el sistema')
def step_cargar_territorio(context, territorio):
    context.client = TestClient()
    context.territorio = territorio
    response = context.client.post("/api/v1/territorio/load", 
                                   json={"nombre": territorio})
    assert response.status_code == 200

@when('selecciono el filtro "{categoria}"')
def step_seleccionar_filtro(context, categoria):
    context.response = context.client.get(f"/api/v1/mapa/capa?categoria={categoria}")

@then('el mapa debe mostrar solo capas de {categoria}')
def step_verificar_capas(context, categoria):
    data = context.response.json()
    assert all(capa['categoria'] == categoria for capa in data['capas'])

@then('las zonas con tasa de homicidios >{umbral} deben aparecer en rojo intenso')
def step_verificar_color_rojo(context, umbral):
    data = context.response.json()
    zonas_criticas = [z for z in data['zonas'] if z['tasaHomicidios'] > float(umbral)]
    assert all(z['color'] == '#FF0000' for z in zonas_criticas)

# features/steps/abm_steps.py
@given('la felicidad base del sector "{sector}" es {valor}')
def step_felicidad_base(context, sector, valor):
    context.sim = ABMSimulator()
    context.sim.inicializar_sector(sector, felicidadBase=int(valor))

@when('aplico la política "{politica}"')
def step_aplicar_politica(context, politica):
    context.sim.aplicar_politica(politica)

@then('tras {meses} meses la felicidad debe aumentar >{delta} puntos')
def step_verificar_felicidad(context, meses, delta):
    context.sim.step(meses=int(meses))
    sector = context.sim.get_sector('joven_gig')
    assert sector.felicidadActual > sector.felicidadBase + int(delta)

# features/steps/predictor_steps.py
@given('el distrito tiene tasa de homicidios {tasa} por 100k')
def step_tasa_homicidios(context, tasa):
    context.contexto = {"tasaHomicidios": float(tasa)}

@given('mi candidato tiene "{atributo}" = {valor}')
def step_atributo_candidato(context, atributo, valor):
    if not hasattr(context, 'candidato'):
        context.candidato = {}
    context.candidato[atributo] = valor.lower() == 'true' if valor in ['true', 'false'] else valor

@when('solicito predicción de victoria')
def step_solicitar_prediccion(context):
    payload = {
        "territorioId": context.territorio_id,
        "candidato": context.candidato,
        "contexto": context.contexto
    }
    context.response = context.client.post("/api/v1/predict/victoria", json=payload)

@then('la probabilidad debe ser >{umbral}%')
def step_verificar_probabilidad(context, umbral):
    data = context.response.json()
    assert data['probabilidadVictoria'] > float(umbral) / 100

@then('el driver principal debe ser "{driver}"')
def step_verificar_driver(context, driver):
    data = context.response.json()
    assert data['drivers'][0]['id'] == driver
