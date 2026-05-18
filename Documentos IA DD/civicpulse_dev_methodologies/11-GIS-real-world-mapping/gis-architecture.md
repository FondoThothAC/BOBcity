# GIS Real-World Mapping - CivicPulse

## Data Sources for Mexican Political GIS

| Layer | Source | Format | Update Frequency | License |
|-------|--------|--------|-----------------|---------|
| **INE Secciones Electorales** | INE (Cartografia Electoral) | Shapefile/GeoJSON | Per electoral cycle | Public Domain |
| **INEGI Marco Geoestadistico** | INEGI | Shapefile/GeoJSON | Annual | Open Data |
| **Municipios/Localidades** | INEGI | Shapefile | Decennial + updates | Open Data |
| **Manzanas Urbanas** | INEGI | Shapefile | 5-yearly | Open Data |
| **AGEB (Areas Geoestadisticas)** | INEGI | Shapefile | 5-yearly | Open Data |
| **Vialidades** | INEGI / OpenStreetMap | Shapefile/OSM | Continuous | ODbL |
| **Uso de Suelo** | INEGI / CONABIO | Raster/Shapefile | Annual | Open |
| **Densidad Poblacional** | INEGI (Censo) | CSV + GeoJSON | Decennial | Open |
| **SESNSP Delitos** | Secretariado Ejecutivo | CSV (geocoded) | Monthly | Open |
| **Encuesta ENIGH** | INEGI | CSV (with location keys) | Annual | Open |
| **Redes Sociales Geolocalizadas** | Twitter/X API, Facebook | JSON/CSV | Real-time | API Terms |

## Geocoding Strategy

### Address -> Coordinates
```python
# Pipeline de geocodificacion para datos electorales
import geopandas as gpd
from shapely.geometry import Point

class MexicanGeocoder:
    def __init__(self):
        self.inegi_marco = gpd.read_file('data/inegi_marco_geoestadistico.shp')
        self.secciones_ine = gpd.read_file('data/ine_secciones.shp')

    def geocode_voter_address(self, calle, numero, colonia, cp, municipio, estado):
        # Geocodifica direccion de votante mexicano
        # Retorna: (lat, lon, seccion_electoral, agenb_id, precision)
        direccion_norm = self._normalize(calle, numero, colonia, cp)
        vialidad = self._match_vialidad(direccion_norm, municipio, estado)
        manzana = self._nearest_manzana(vialidad.geometry)
        seccion = self._seccion_from_manzana(manzana)

        return {
            'coordinates': (vialidad.lat, vialidad.lon),
            'seccion_electoral': seccion.id,
            'distrito_local': seccion.distrito_local,
            'distrito_federal': seccion.distrito_federal,
            'agenb_id': manzana.agenb_id,
            'precision': vialidad.confidence
        }
```

## Precinct-Level Microtargeting

### Hexagonal Binning (como Utah AGRC)
```python
import geopandas as gpd
import numpy as np
from h3 import h3

def create_hexagon_grid(territorio_gdf, resolution=8):
    # Crea grid hexagonal H3 para microtargeting
    # Resolution 8 = ~0.74 km2 por hexagono (ideal para colonias)
    hexagons = set()
    for geom in territorio_gdf.geometry:
        hexagons.update(h3.polyfill(geom.__geo_interface__, resolution))

    hex_gdf = gpd.GeoDataFrame(
        {'h3_index': list(hexagons)},
        geometry=[h3.h3_to_geo_boundary(h, geo_json=True) for h in hexagons],
        crs='EPSG:4326'
    )
    return hex_gdf
```

## Heatmap Generation

### Multi-Layer Heatmap Engine
```python
class CivicHeatmapEngine:
    def __init__(self, gdf_base):
        self.gdf = gdf_base
        self.layers = {}

    def add_layer(self, name, data_column, color_scheme, normalization='linear'):
        schemes = {
            'security': {'low': '#10b981', 'mid': '#f59e0b', 'high': '#ef4444'},
            'economy': {'low': '#ef4444', 'mid': '#f59e0b', 'high': '#10b981'},
        }
        self.layers[name] = {
            'column': data_column,
            'colors': schemes[color_scheme],
            'normalization': normalization
        }

    def render(self, layers_active, opacity=0.7, figsize=(14, 10)):
        fig, ax = plt.subplots(figsize=figsize)
        self.gdf.boundary.plot(ax=ax, color='white', linewidth=0.5, alpha=0.3)

        for layer_name in layers_active:
            layer = self.layers[layer_name]
            cmap = self._create_civic_cmap(layer['colors'])
            self.gdf.plot(ax=ax, column=layer['column'], cmap=cmap, alpha=opacity, legend=True)

        ax.set_facecolor('#0a0e17')
        fig.patch.set_facecolor('#0a0e17')
        return fig
```
