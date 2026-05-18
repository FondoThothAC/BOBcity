#!/usr/bin/env python3
# civic_gis_engine.py - Motor GIS real para CivicPulse

import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point, Polygon
from h3 import h3
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
import seaborn as sns
from typing import Dict, List, Tuple, Optional
import json
from datetime import datetime

class CivicGISEngine:
    """
    Motor GIS para analisis politico a nivel precintal/seccional
    """

    def __init__(self, data_dir: str = "data/gis/"):
        self.data_dir = data_dir
        self.secciones_ine = None
        self.manzanas_inegi = None
        self.agenb = None
        self.hex_grid = None
        self.voter_data = None
        self._load_base_layers()

    def _load_base_layers(self):
        """Carga capas base cartograficas"""
        try:
            self.secciones_ine = gpd.read_file(f"{self.data_dir}/ine_secciones_2024.shp")
            self.manzanas_inegi = gpd.read_file(f"{self.data_dir}/manzanas_inegi.shp")
            self.agenb = gpd.read_file(f"{self.data_dir}/ageb_inegi.shp")
            print("Capas base cargadas exitosamente")
        except Exception as e:
            print(f"Advertencia: No se pudieron cargar capas base: {e}")
            print("Creando capas sinteticas para desarrollo...")
            self._create_synthetic_layers()

    def _create_synthetic_layers(self):
        """Crea capas sinteticas para desarrollo sin datos reales"""
        n_secciones = 50
        np.random.seed(42)

        # Bounding box aproximado de Hermosillo
        min_lon, max_lon = -111.2, -110.8
        min_lat, max_lat = 29.0, 29.3

        secciones = []
        for i in range(n_secciones):
            lon = np.random.uniform(min_lon, max_lon)
            lat = np.random.uniform(min_lat, max_lat)
            size = 0.02

            geom = Polygon([
                (lon, lat), (lon + size, lat), 
                (lon + size, lat + size), (lon, lat + size)
            ])

            secciones.append({
                'id': f'26-019-{i+1:03d}',
                'distrito_local': np.random.randint(1, 8),
                'distrito_federal': np.random.randint(1, 3),
                'lista_nominal': np.random.randint(500, 3000),
                'geometry': geom
            })

        self.secciones_ine = gpd.GeoDataFrame(secciones, crs='EPSG:4326')

    def create_hexagon_grid(self, resolution: int = 8) -> gpd.GeoDataFrame:
        """
        Crea grid hexagonal H3 para microtargeting
        Resolution 8 = ~0.74 km2 (ideal para colonias urbanas)
        Resolution 9 = ~0.10 km2 (ideal para manzanas)
        """
        if self.secciones_ine is None:
            raise ValueError("Capas base no cargadas")

        hexagons = set()
        for geom in self.secciones_ine.geometry:
            hexagons.update(h3.polyfill(geom.__geo_interface__, resolution))

        hex_data = []
        for h in hexagons:
            boundary = h3.h3_to_geo_boundary(h, geo_json=True)
            hex_data.append({
                'h3_index': h,
                'geometry': Polygon(boundary['coordinates'][0])
            })

        self.hex_grid = gpd.GeoDataFrame(hex_data, crs='EPSG:4326')
        print(f"Grid hexagonal creado: {len(hexagons)} celdas")
        return self.hex_grid

    def load_voter_data(self, voter_file: str) -> pd.DataFrame:
        """
        Carga microdatos de lista nominal (anonymized)
        Formato esperado: CSV con columnas:
        seccion_id, genero, edad, escolaridad, lat, lon, voto_2018, voto_2021, voto_2024
        """
        self.voter_data = pd.read_csv(voter_file)

        # Convertir a GeoDataFrame
        geometry = [Point(xy) for xy in zip(self.voter_data.lon, self.voter_data.lat)]
        self.voter_data = gpd.GeoDataFrame(
            self.voter_data, geometry=geometry, crs='EPSG:4326'
        )

        print(f"Datos de votantes cargados: {len(self.voter_data)} registros")
        return self.voter_data

    def generate_synthetic_voters(self, n_voters: int = 50000) -> gpd.GeoDataFrame:
        """
        Genera poblacion sintetica de votantes para desarrollo
        """
        if self.secciones_ine is None:
            raise ValueError("Capas base no cargadas")

        np.random.seed(42)
        voters = []

        for _, seccion in self.secciones_ine.iterrows():
            n = int(seccion['lista_nominal'] * (n_voters / self.secciones_ine['lista_nominal'].sum()))

            # Generar puntos aleatorios dentro de la seccion
            bounds = seccion.geometry.bounds
            for _ in range(n):
                lon = np.random.uniform(bounds[0], bounds[2])
                lat = np.random.uniform(bounds[1], bounds[3])

                # Verificar que esta dentro del poligono
                point = Point(lon, lat)
                if seccion.geometry.contains(point):
                    voters.append({
                        'seccion_id': seccion['id'],
                        'genero': np.random.choice(['M', 'F'], p=[0.48, 0.52]),
                        'edad': int(np.random.normal(38, 15)),
                        'escolaridad': np.random.choice(
                            ['primaria', 'secundaria', 'prepa', 'universidad', 'posgrado'],
                            p=[0.15, 0.25, 0.30, 0.25, 0.05]
                        ),
                        'ingreso_mensual': max(3000, int(np.random.lognormal(9.5, 0.8))),
                        'geometry': point,
                        'voto_2024': np.random.choice(
                            ['MORENA', 'PAN', 'MC', 'PRI', 'NULO', 'ABSTENCION'],
                            p=[0.45, 0.25, 0.12, 0.08, 0.05, 0.05]
                        )
                    })

        self.voter_data = gpd.GeoDataFrame(voters, crs='EPSG:4326')
        print(f"Poblacion sintetica generada: {len(voters)} votantes")
        return self.voter_data

    def enrich_hexagons(self) -> gpd.GeoDataFrame:
        """
        Enriquece grid hexagonal con datos sociodemograficos
        """
        if self.hex_grid is None:
            self.create_hexagon_grid()

        if self.voter_data is None:
            raise ValueError("Datos de votantes no cargados")

        # Spatial join: asignar votantes a hexagonos
        joined = gpd.sjoin(self.voter_data, self.hex_grid, predicate='within')

        # Agregar metricas por hexagono
        hex_stats = joined.groupby('h3_index').agg({
            'genero': 'count',
            'edad': 'mean',
            'ingreso_mensual': 'mean',
            'voto_2024': lambda x: (x == 'MORENA').mean()
        }).rename(columns={
            'genero': 'voter_count',
            'edad': 'avg_age',
            'ingreso_mensual': 'avg_income',
            'voto_2024': 'morena_support'
        })

        # Merge de vuelta al grid
        self.hex_grid = self.hex_grid.merge(hex_stats, left_on='h3_index', right_index=True, how='left')

        # Calcular indice de vulnerabilidad civica
        self.hex_grid['vulnerability_index'] = (
            (1 - self.hex_grid['avg_income'] / self.hex_grid['avg_income'].max()) * 0.4 +
            (self.hex_grid['avg_age'] / 100) * 0.2 +
            (1 - self.hex_grid['morena_support']) * 0.4
        )

        return self.hex_grid

    def identify_swing_hexagons(self, threshold: float = 0.15) -> gpd.GeoDataFrame:
        """
        Identifica hexagonos "swing" donde el voto puede cambiar
        """
        if 'morena_support' not in self.hex_grid.columns:
            self.enrich_hexagons()

        # Swing = apoyo entre 35% y 65% (no dominado por ningun partido)
        swing = self.hex_grid[
            (self.hex_grid['morena_support'] > 0.35) & 
            (self.hex_grid['morena_support'] < 0.65) &
            (self.hex_grid['voter_count'] > 100)
        ].copy()

        swing['swing_potential'] = 1 - abs(swing['morena_support'] - 0.5) * 2
        swing['priority_score'] = swing['swing_potential'] * swing['voter_count'] / 1000

        return swing.sort_values('priority_score', ascending=False)

    def render_heatmap(self, metric: str = 'vulnerability_index', 
                      cmap_name: str = 'RdYlGn_r', figsize: Tuple = (14, 10)):
        """
        Renderiza mapa de calor con estilo CivicPulse
        """
        fig, ax = plt.subplots(figsize=figsize)

        # Fondo oscuro
        ax.set_facecolor('#0a0e17')
        fig.patch.set_facecolor('#0a0e17')

        # Capa base: limites de secciones
        if self.secciones_ine is not None:
            self.secciones_ine.boundary.plot(
                ax=ax, color='white', linewidth=0.3, alpha=0.2
            )

        # Heatmap de hexagonos
        if self.hex_grid is not None and metric in self.hex_grid.columns:
            self.hex_grid.plot(
                ax=ax,
                column=metric,
                cmap=cmap_name,
                alpha=0.8,
                legend=True,
                legend_kwds={
                    'label': metric.replace('_', ' ').title(),
                    'shrink': 0.6,
                    'fraction': 0.046
                }
            )

        # Overlay: hexagonos swing destacados
        swing = self.identify_swing_hexagons()
        if len(swing) > 0:
            swing.boundary.plot(ax=ax, color='#3b82f6', linewidth=1.5, alpha=0.8)

            # Anotar top 5
            for idx, row in swing.head(5).iterrows():
                centroid = row.geometry.centroid
                ax.annotate(
                    f"#{idx+1}\n{row['voter_count']:.0f} votantes",
                    (centroid.x, centroid.y),
                    color='white', fontsize=8, ha='center',
                    bbox=dict(boxstyle='round,pad=0.3', facecolor='#1f2937', alpha=0.8)
                )

        ax.set_title(
            f'CivicPulse GIS - {metric.replace("_", " ").title()}',
            fontsize=16, color='white', pad=20
        )
        ax.set_xlabel('Longitud', color='gray')
        ax.set_ylabel('Latitud', color='gray')
        ax.tick_params(colors='gray')

        plt.tight_layout()
        return fig

    def export_geojson(self, layer: gpd.GeoDataFrame, filename: str):
        """Exporta capa a GeoJSON para Leaflet/Mapbox"""
        layer.to_file(filename, driver='GeoJSON')
        print(f"Exportado: {filename}")

    def get_precinct_profile(self, seccion_id: str) -> Dict:
        """
        Genera perfil completo de una seccion electoral
        """
        seccion = self.secciones_ine[self.secciones_ine['id'] == seccion_id]
        voters = self.voter_data[self.voter_data['seccion_id'] == seccion_id]

        if len(voters) == 0:
            return {"error": "No hay datos para esta seccion"}

        return {
            "seccion_id": seccion_id,
            "lista_nominal": seccion['lista_nominal'].values[0],
            "voters_analyzed": len(voters),
            "demografia": {
                "genero": voters['genero'].value_counts().to_dict(),
                "edad_promedio": voters['edad'].mean(),
                "edad_mediana": voters['edad'].median(),
                "escolaridad": voters['escolaridad'].value_counts().to_dict()
            },
            "economia": {
                "ingreso_promedio": voters['ingreso_mensual'].mean(),
                "ingreso_mediana": voters['ingreso_mensual'].median(),
                "pobreza_estimada": (voters['ingreso_mensual'] < 5000).mean()
            },
            "politica": {
                "voto_2024": voters['voto_2024'].value_counts(normalize=True).to_dict(),
                "volatilidad": voters['voto_2024'].value_counts(normalize=True).std()
            }
        }


if __name__ == '__main__':
    # Ejemplo de uso
    engine = CivicGISEngine()

    # Generar datos sinteticos
    engine.generate_synthetic_voters(n_voters=25000)

    # Crear grid y enriquecer
    engine.create_hexagon_grid(resolution=8)
    engine.enrich_hexagons()

    # Identificar zonas swing
    swing_zones = engine.identify_swing_hexagons()
    print(f"Zonas swing identificadas: {len(swing_zones)}")
    print(swing_zones[['h3_index', 'voter_count', 'morena_support', 'swing_potential', 'priority_score']].head())

    # Renderizar mapa
    fig = engine.render_heatmap(metric='vulnerability_index')
    plt.savefig('civic_heatmap.png', dpi=150, bbox_inches='tight', facecolor='#0a0e17')
    print("Mapa guardado: civic_heatmap.png")
