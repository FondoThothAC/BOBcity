# /src/data/inegi/indicators_api.py
"""
Cliente para la API del Banco de Indicadores del INEGI.
Documentación oficial: https://www.inegi.org.mx/servicios/api_indicadores.html

Permite consultar indicadores a nivel nacional, estatal y municipal.
"""

import pandas as pd
import requests
from typing import Optional, Literal
from datetime import datetime

from .config import INEGI_TOKEN, API_INDICADORES_URL, INDICADORES_CLAVE

FormatoRespuesta = Literal["json", "xml"]
NivelGeografico = Literal["00", "01", "02"]  # nacional, estatal, municipal


class INEGIIndicatorsAPI:
    """
    Cliente para la API de Indicadores del INEGI.
    
    Uso:
        api = INEGIIndicatorsAPI(token="...")
        desempleo_sonora = api.consultar_serie(
            indicador="desempleo",
            area_geografica="26",       # Sonora
            nivel="01",                  # estatal
            serie_historica=True
        )
    """
    
    def __init__(self, token: Optional[str] = None):
        self.token = token or INEGI_TOKEN
        self.base_url = API_INDICADORES_URL
        self._cache: dict = {}
    
    def consultar_serie(
        self,
        indicador: str,
        area_geografica: str = "00",
        nivel: NivelGeografico = "01",
        serie_historica: bool = True,
        formato: FormatoRespuesta = "json",
        idioma: str = "es",
    ) -> pd.DataFrame:
        """
        Consulta un indicador económico/sociodemográfico.
        
        Args:
            indicador: Clave del indicador (ver INDICADORES_CLAVE) o nombre amigable.
            area_geografica: Clave del área (ej. '26' para Sonora, '26030' para Hermosillo).
            nivel: '00' nacional, '01' estatal, '02' municipal.
            serie_historica: Si True, trae toda la serie. Si False, solo el último dato.
        
        Returns:
            DataFrame con columnas: fecha, valor, indicador, area
        """
        # Resolver nombre amigable a clave
        clave_indicador = INDICADORES_CLAVE.get(indicador, indicador)
        
        # Construir URL según especificación oficial
        url = (
            f"{self.base_url}/INDICATOR/{clave_indicador}"
            f"/{idioma}/{area_geografica}/{nivel}"
            f"/{'false' if serie_historica else 'true'}"
            f"/BIE/2.0/{self.token}"
        )
        
        # Verificar cache
        cache_key = f"{clave_indicador}_{area_geografica}_{nivel}_{serie_historica}"
        if cache_key in self._cache:
            return self._cache[cache_key]
        
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        if formato == "json":
            data = response.json()
            df = self._parse_json_response(data)
        else:
            df = self._parse_xml_response(response.text)
        
        # Cachear
        self._cache[cache_key] = df
        
        print(f"📊 Indicador '{indicador}' ({area_geografica}): {len(df)} observaciones")
        return df
    
    def _parse_json_response(self, data: dict) -> pd.DataFrame:
        """Parsea la respuesta JSON de la API a un DataFrame limpio."""
        series = data.get("Series", [])
        if not series:
            return pd.DataFrame()
        
        records = []
        for serie in series:
            indicador = serie.get("INDICADOR", "")
            for obs in serie.get("OBSERVATIONS", []):
                records.append({
                    "fecha": obs.get("TIME_PERIOD"),
                    "valor": float(obs.get("OBS_VALUE", 0)),
                    "indicador": indicador,
                })
        
        df = pd.DataFrame(records)
        if not df.empty:
            df["fecha"] = pd.to_datetime(df["fecha"])
            df = df.sort_values("fecha")
        
        return df
    
    def consultar_multiples_indicadores(
        self,
        area_geografica: str,
        nivel: NivelGeografico = "02",
    ) -> pd.DataFrame:
        """
        Consulta todos los indicadores clave de CivicPulse para un área.
        
        Args:
            area_geografica: Clave del municipio o entidad.
            nivel: '02' para municipio.
        
        Returns:
            DataFrame pivoteado con indicadores como columnas.
        """
        resultados = {}
        
        for nombre, clave in INDICADORES_CLAVE.items():
            try:
                df = self.consultar_serie(
                    indicador=clave,
                    area_geografica=area_geografica,
                    nivel=nivel,
                    serie_historica=False  # Solo dato más reciente
                )
                if not df.empty:
                    resultados[nombre] = df["valor"].iloc[0]
            except Exception as e:
                print(f"⚠️  No se pudo obtener '{nombre}': {e}")
                resultados[nombre] = None
        
        return pd.DataFrame([resultados])


# ============================================================
# EJEMPLO DE USO: Indicadores de Hermosillo
# ============================================================
if __name__ == "__main__":
    api = INEGIIndicatorsAPI()
    
    # Consultar desempleo en Sonora (entidad '26')
    desempleo = api.consultar_serie(
        indicador="desempleo",
        area_geografica="26",
        nivel="01",
        serie_historica=True
    )
    print(desempleo.head())
    
    # Consultar todos los indicadores para Hermosillo (municipio '26030')
    perfil_hermosillo = api.consultar_multiples_indicadores(
        area_geografica="26030",
        nivel="02"
    )
    print("\n📊 Perfil de Hermosillo:")
    print(perfil_hermosillo.T.to_string())