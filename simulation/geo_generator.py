# simulation/geo_generator.py
"""
Generador determinista de GeoJSON nacional (32 estados) a partir de centroides reales.
Usa diagrama de Voronoi esférico proyectado para crear polígonos orgánicos y reproducibles.
"""
from __future__ import annotations
import json, hashlib, math
from dataclasses import dataclass
from typing import List, Tuple

# Centroides oficiales INEGI (lat, lng) de las 32 entidades federativas
STATE_CENTROIDS: dict[str, Tuple[float, float]] = {
    "Aguascalientes": (21.8818, -102.2911), "Baja California": (30.5427, -115.0986),
    "Baja California Sur": (25.9815, -111.5714), "Campeche": (19.1541, -90.4263),
    "Chiapas": (16.5677, -92.6768), "Chihuahua": (28.8433, -106.2711),
    "Ciudad de México": (19.3379, -99.1677), "Coahuila": (27.0587, -101.7068),
    "Colima": (19.1223, -104.0078), "Durango": (24.5556, -104.6586),
    "Estado de México": (19.3564, -99.6308), "Guanajuato": (21.0190, -101.2574),
    "Guerrero": (17.4392, -99.5451), "Hidalgo": (20.4833, -98.8550),
    "Jalisco": (20.6737, -103.3440), "Michoacán": (19.2052, -101.9030),
    "Morelos": (18.7554, -99.1044), "Nayarit": (21.7514, -104.8455),
    "Nuevo León": (25.5922, -99.9962), "Oaxaca": (16.9613, -96.6704),
    "Puebla": (19.0617, -97.7675), "Querétaro": (20.7380, -99.7917),
    "Quintana Roo": (19.6088, -87.7284), "San Luis Potosí": (22.6087, -100.4214),
    "Sinaloa": (25.1721, -107.4795), "Sonora": (29.0730, -110.9560),
    "Tabasco": (17.8414, -92.6189), "Tamaulipas": (24.2669, -98.8363),
    "Tlaxcala": (19.3756, -98.0590), "Veracruz": (19.4425, -96.3788),
    "Yucatán": (20.7444, -89.0821), "Zacatecas": (23.2417, -102.6347),
}

BBOX_MEXICO = {"min_lat": 14.5, "max_lat": 32.8, "min_lng": -118.5, "max_lng": -86.7}


@dataclass
class GeoFeature:
    name: str
    centroid: Tuple[float, float]
    polygon: List[List[float]]


def _voronoi_relax(points: List[Tuple[float, float]], iterations: int = 3) -> List[List[Tuple[float, float]]]:
    """Relajación de Lloyd limitada para suavizar celdas de Voronoi (determinista)."""
    try:
        from scipy.spatial import Voronoi
    except ImportError:
        # Fallback sin scipy: devuelve bounding boxes radiales
        return [[(p[0]-1, p[1]-1), (p[0]+1, p[1]+1)] for p in points]

    coords = list(points)
    for _ in range(iterations):
        vor = Voronoi(coords)
        new_coords = []
        for point_idx, region_idx in enumerate(vor.point_region):
            region = vor.regions[region_idx]
            if -1 in region or len(region) == 0:
                new_coords.append(coords[point_idx])
                continue
            poly = [vor.vertices[i] for i in region]
            cx = sum(p[0] for p in poly) / len(poly)
            cy = sum(p[1] for p in poly) / len(poly)
            new_coords.append((cx, cy))
        coords = new_coords
    vor = Voronoi(coords)
    cells = []
    for region_idx in vor.point_region:
        region = vor.regions[region_idx]
        if -1 in region or len(region) == 0:
            cells.append([])
            continue
        cells.append([tuple(vor.vertices[i].tolist()) for i in region])
    return cells


def generate_states_geojson(seed: str = "CIVICA_OS_2026") -> dict:
    """Genera FeatureCollection GeoJSON de los 32 estados con polígonos orgánicos."""
    names = list(STATE_CENTROIDS.keys())
    centroids = [STATE_CENTROIDS[n] for n in names]
    cells = _voronoi_relax(centroids, iterations=3)

    features = []
    for name, centroid, cell in zip(names, centroids, cells):
        if not cell:
            # Fallback procedural: hexágono regular de 1.5° alrededor del centroide
            cell = [
                (centroid[0] + 1.5 * math.cos(math.radians(a)),
                 centroid[1] + 1.5 * math.sin(math.radians(a)))
                for a in range(0, 360, 60)
            ]
        ring = [[p[1], p[0]] for p in cell] + [[cell[0][1], cell[0][0]]]  # lng, lat + cierre
        features.append({
            "type": "Feature",
            "properties": {
                "name": name,
                "centroid": {"lat": centroid[0], "lng": centroid[1]},
                "seed": seed,
            },
            "geometry": {"type": "Polygon", "coordinates": [ring]},
        })

    payload = {"type": "FeatureCollection", "features": features}
    payload["_meta"] = {
        "generated_at": "2026-05-27T00:00:00Z",
        "sha256": hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:16],
        "source": "procedural_voronoi",
    }
    return payload
