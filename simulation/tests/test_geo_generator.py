# simulation/tests/test_geo_generator.py
from geo_generator import generate_states_geojson

def test_genera_32_estados():
    gj = generate_states_geojson()
    assert gj["type"] == "FeatureCollection"
    assert len(gj["features"]) == 32

def test_determinista():
    a = generate_states_geojson("seed_A")
    b = generate_states_geojson("seed_A")
    assert a["_meta"]["sha256"] == b["_meta"]["sha256"]

def test_poligonos_cerrados():
    gj = generate_states_geojson()
    for f in gj["features"]:
        ring = f["geometry"]["coordinates"][0]
        assert ring[0] == ring[-1], f"Polígono de {f['properties']['name']} no cerrado"
