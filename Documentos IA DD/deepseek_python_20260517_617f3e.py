# /src/data/inegi/spatial_joins.py
"""
Cruce espacial (spatial join) entre capas electorales y datos sociodemográficos.
Permite asignar indicadores de pobreza, educación, etc. a cada sección electoral.
"""

import geopandas as gpd
import pandas as pd
from .geo_loader import INEGIGeoLoader
from .indicators_api import INEGIIndicatorsAPI


class ElectoralDemographicJoiner:
    """
    Realiza spatial joins entre geometrías electorales y datos INEGI.
    
    Uso:
        joiner = ElectoralDemographicJoiner()
        secciones_enriquecidas = joiner.join_secciones_con_agebs(
            secciones_gdf, entidad="26", municipio="030"
        )
    """
    
    def __init__(self):
        self.geo_loader = INEGIGeoLoader()
        self.indicators_api = INEGIIndicatorsAPI()
    
    def join_secciones_con_agebs(
        self,
        secciones_electorales: gpd.GeoDataFrame,
        entidad: str,
        municipio: str,
    ) -> gpd.GeoDataFrame:
        """
        Asigna datos demográficos de AGEB a cada sección electoral.
        
        Método: intersección espacial ponderada por área.
        Si una sección cubre parcialmente varias AGEBs, se ponderan los indicadores.
        """
        # Cargar AGEBs
        agebs = self.geo_loader.cargar_agebs(entidad=entidad, municipio=municipio)
        
        # Asegurar mismo CRS
        secciones_electorales = secciones_electorales.to_crs(agebs.crs)
        
        # Spatial join: intersección
        joined = gpd.overlay(secciones_electorales, agebs, how="intersection")
        
        # Calcular área de cada fragmento
        joined["area_fragmento"] = joined.geometry.area
        
        # Ponderar por área dentro de cada sección
        joined["peso"] = joined.groupby("seccion_id")["area_fragmento"].transform(
            lambda x: x / x.sum()
        )
        
        # Agregar indicadores ponderados
        # (Asume que las AGEBs tienen columnas de indicadores)
        columnas_indicadores = [
            "poblacion_total", "viviendas", "grado_promedio_escolar",
            "poblacion_economicamente_activa"
        ]
        
        resultado = joined.groupby("seccion_id").apply(
            lambda g: pd.Series({
                col: (g[col] * g["peso"]).sum()
                for col in columnas_indicadores
                if col in g.columns
            })
        ).reset_index()
        
        # Merge con geometría original de secciones
        resultado_gdf = secciones_electorales.merge(resultado, on="seccion_id")
        
        print(f"✅ Spatial join completado: {len(resultado_gdf)} secciones enriquecidas")
        return resultado_gdf
    
    def build_pain_point_index(
        self,
        gdf: gpd.GeoDataFrame,
        indicadores: dict[str, str],
    ) -> gpd.GeoDataFrame:
        """
        Calcula índice compuesto de puntos de dolor (0-100) por sección.
        
        Args:
            gdf: GeoDataFrame con columnas de indicadores.
            indicadores: Mapeo nombre_columna -> tipo_dolor.
        
        Returns:
            GeoDataFrame con columna 'pain_index' y 'pain_type'.
        """
        for col, tipo in indicadores.items():
            if col in gdf.columns:
                # Normalizar a 0-100 (invertido: más problema = más dolor)
                gdf[f"pain_{tipo}"] = (
                    (gdf[col] - gdf[col].min()) /
                    (gdf[col].max() - gdf[col].min()) * 100
                )
        
        return gdf