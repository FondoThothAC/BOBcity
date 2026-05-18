# /src/data/inegi/config.py
"""
Configuración central para el módulo INEGI.
Todos los datos se procesan 100% en local, sin llamadas externas
más allá de la descarga inicial desde las APIs oficiales.
"""

import os
from pathlib import Path

# Token INEGI (obtener en https://www.inegi.org.mx/servicios/api_indicadores.html)
INEGI_TOKEN = os.getenv("INEGI_TOKEN", "tu-token-aqui")

# Sistema de coordenadas para México (Cónica Conforme de Lambert)
CRS_MEXICO = "EPSG:6372"
CRS_WGS84 = "EPSG:4326"

# Rutas locales (todo on-premise)
BASE_DIR = Path("/Volumes/SSD1TB/plataforma/data/inegi")
CACHE_DIR = BASE_DIR / "cache"
EXPORT_DIR = BASE_DIR / "exports"
SHAPEFILES_DIR = CACHE_DIR / "shapefiles"
CENSUS_DIR = CACHE_DIR / "census_2020"

# URLs base de descarga
MARCO_GEOESTADISTICO_URL = "https://www.inegi.org.mx/contenidos/productos/prod_serv/contenidos/espanol/bvinegi/productos/geografia/marcogeo/"
CENSUS_2020_URL = "https://www.inegi.org.mx/contenidos/programas/ccpv/2020/datosabiertos/"
API_INDICADORES_URL = "https://www.inegi.org.mx/app/api/indicadores/desarrolladores/jsonxml/"
API_DENUE_URL = "https://www.inegi.org.mx/app/api/denue/v2/consulta/"

# Claves de indicadores relevantes para CivicPulse
INDICADORES_CLAVE = {
    "pobreza": "1002000022",          # Pobreza multidimensional
    "desempleo": "1002000013",         # Tasa de desocupación
    "homicidios": "1002000045",        # Tasa de homicidios (proxy)
    "educacion": "1002000028",         # Escolaridad promedio
    "salud": "1002000031",             # Acceso a servicios de salud
    "agua": "1002000052",              # Viviendas con acceso a agua potable
    "informalidad": "1002000019",      # Tasa de informalidad laboral
    "internet": "1002000061",          # Hogares con internet
}

# Niveles geográficos
NIVEL_NACIONAL = "00"
NIVEL_ENTIDAD = "01"  # + clave entidad (2 dígitos)
NIVEL_MUNICIPIO = "02"  # + clave municipio (3 dígitos)

# Crear estructura de directorios
for directory in [CACHE_DIR, EXPORT_DIR, SHAPEFILES_DIR, CENSUS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)