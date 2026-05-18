# /src/data/inegi/geo_loader.py
"""
Carga y procesamiento de datos geoespaciales del INEGI.
Inspirado en las guías de Geoinformática (CentroGeo) y la librería INEGIpy.
Ref: https://centrogeo.github.io/libro-geoinformatica/parte_1/05_intro_geopandas.html
"""

import geopandas as gpd
import pandas as pd
import requests
from pathlib import Path
from typing import Optional, Literal
import zipfile
import io

from .config import (
    SHAPEFILES_DIR, EXPORT_DIR, CRS_MEXICO, CRS_WGS84,
    MARCO_GEOESTADISTICO_URL, CENSUS_2020_URL
)

# Niveles del Marco Geoestadístico
NivelGeo = Literal["estatal", "municipal", "ageb", "manzana"]

# URLs de shapefiles (versión 2024)
SHAPEFILE_URLS = {
    "estatal": f"{MARCO_GEOESTADISTICO_URL}889463842674_s.zip",
    "municipal": f"{MARCO_GEOESTADISTICO_URL}889463842675_s.zip",
    "ageb": f"{MARCO_GEOESTADISTICO_URL}889463842676_s.zip",
}


class INEGIGeoLoader:
    """
    Carga, cachea y normaliza shapefiles del Marco Geoestadístico del INEGI.
    
    Uso:
        loader = INEGIGeoLoader()
        sonora_municipios = loader.cargar_municipios(entidad="26")
        hermosillo_agebs = loader.cargar_agebs(entidad="26", municipio="030")
    """
    
    def __init__(self, use_cache: bool = True):
        self.use_cache = use_cache
        self._ensure_cache_dirs()
    
    def _ensure_cache_dirs(self):
        SHAPEFILES_DIR.mkdir(parents=True, exist_ok=True)
    
    def _download_and_cache(self, nivel: NivelGeo) -> Path:
        """Descarga el shapefile si no está en cache local."""
        cache_file = SHAPEFILES_DIR / f"marco_geoestadistico_{nivel}.zip"
        
        if self.use_cache and cache_file.exists():
            return cache_file
        
        url = SHAPEFILE_URLS.get(nivel)
        if not url:
            raise ValueError(f"Nivel '{nivel}' no disponible. Use: {list(SHAPEFILE_URLS.keys())}")
        
        print(f"⬇️  Descargando Marco Geoestadístico nivel {nivel}...")
        response = requests.get(url, timeout=600)
        response.raise_for_status()
        
        with open(cache_file, 'wb') as f:
            f.write(response.content)
        print(f"✅ Guardado en {cache_file}")
        return cache_file
    
    def cargar_municipios(self, entidad: Optional[str] = None) -> gpd.GeoDataFrame:
        """
        Carga polígonos municipales.
        
        Args:
            entidad: Clave de entidad (2 dígitos), ej. '26' para Sonora.
                     Si es None, carga todo México.
        
        Returns:
            GeoDataFrame con columnas: CVE_ENT, CVE_MUN, NOM_MUN, geometry
        """
        cache_file = self._download_and_cache("municipal")
        
        # Leer shapefile desde el zip
        gdf = gpd.read_file(f"zip://{cache_file}")
        
        # Normalizar CRS
        if gdf.crs is None:
            gdf = gdf.set_crs(CRS_MEXICO)
        gdf = gdf.to_crs(CRS_WGS84)
        
        # Filtrar por entidad
        if entidad:
            gdf = gdf[gdf['CVE_ENT'] == entidad].copy()
        
        # Crear clave compuesta para joins
        gdf['CVEGEO_MUN'] = gdf['CVE_ENT'] + gdf['CVE_MUN']
        
        print(f"📊 Cargados {len(gdf)} municipios")
        return gdf
    
    def cargar_agebs(self, entidad: str, municipio: Optional[str] = None) -> gpd.GeoDataFrame:
        """
        Carga polígonos AGEB (Área Geoestadística Básica).
        Las AGEBs son la unidad mínima del Marco Geoestadístico.
        
        Args:
            entidad: Clave de entidad (2 dígitos).
            municipio: Clave de municipio (3 dígitos). Si es None, toda la entidad.
        
        Returns:
            GeoDataFrame con columnas: CVE_ENT, CVE_MUN, CVE_AGEB, geometry
        """
        cache_file = self._download_and_cache("ageb")
        
        gdf = gpd.read_file(f"zip://{cache_file}")
        
        if gdf.crs is None:
            gdf = gdf.set_crs(CRS_MEXICO)
        gdf = gdf.to_crs(CRS_WGS84)
        
        # Filtros
        gdf = gdf[gdf['CVE_ENT'] == entidad]
        if municipio:
            gdf = gdf[gdf['CVE_MUN'] == municipio]
        
        gdf['CVEGEO_AGEB'] = gdf['CVE_ENT'] + gdf['CVE_MUN'] + gdf['CVE_AGEB']
        
        print(f"📊 Cargadas {len(gdf)} AGEBs")
        return gdf
    
    def exportar_geojson(self, gdf: gpd.GeoDataFrame, nombre: str) -> Path:
        """Exporta un GeoDataFrame a GeoJSON para consumo del frontend GIS."""
        output_path = EXPORT_DIR / f"{nombre}.geojson"
        gdf.to_file(output_path, driver="GeoJSON")
        print(f"💾 Exportado: {output_path}")
        return output_path


# ============================================================
# EJEMPLO DE USO: Hermosillo completo
# ============================================================
if __name__ == "__main__":
    loader = INEGIGeoLoader()
    
    # 1. Cargar municipios de Sonora
    sonora = loader.cargar_municipios(entidad="26")
    
    # 2. Filtrar solo Hermosillo (CVE_MUN = '030')
    hermosillo_poligono = sonora[sonora['CVE_MUN'] == '030']
    
    # 3. Cargar AGEBs de Hermosillo
    hermosillo_agebs = loader.cargar_agebs(entidad="26", municipio="030")
    
    # 4. Exportar para el frontend GIS
    loader.exportar_geojson(hermosillo_poligono, "hermosillo_municipio")
    loader.exportar_geojson(hermosillo_agebs, "hermosillo_agebs")
    
    # 5. Estadísticas rápidas
    print(f"Superficie total: {hermosillo_poligono.area.sum() / 1e6:.2f} km²")
    print(f"AGEBs totales: {len(hermosillo_agebs)}")