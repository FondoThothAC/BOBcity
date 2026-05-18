# /src/orchestrator/data_collector_skill.py
"""
Skill del Agente Data Collector para CivicPulse.
Integra INEGI + NLP en un solo flujo de recolección de datos.
"""

from pathlib import Path
from datetime import datetime
import json

from src.data.inegi.geo_loader import INEGIGeoLoader
from src.data.inegi.indicators_api import INEGIIndicatorsAPI
from src.data.inegi.population_synthetic import SyntheticPopulationBuilder
from src.nlp.civicpulse_nlp_pipeline import CivicPulseNLPPipeline


class DataCollectorSkill:
    """
    Skill del agente Data Collector.
    
    Responsabilidades:
    1. Cargar datos geoespaciales del INEGI
    2. Consultar indicadores sociodemográficos
    3. Construir población sintética
    4. Procesar textos de redes sociales con NLP
    5. Exportar todo para consumo del Orquestador
    """
    
    def __init__(self, municipio: str = "26030", entidad: str = "26"):
        self.municipio = municipio
        self.entidad = entidad
        self.geo = INEGIGeoLoader()
        self.indicators = INEGIIndicatorsAPI()
        self.population = SyntheticPopulationBuilder(municipio_clave=municipio)
        self.nlp = CivicPulseNLPPipeline()
    
    def execute_full_collection(
        self,
        social_texts: list[str] = None,
        social_metadata: list[dict] = None,
    ) -> dict:
        """
        Ejecuta la recolección completa de datos para un municipio.
        
        Returns:
            Dict con todas las capas de datos, listo para el Analyzer.
        """
        print(f"🔍 Iniciando recolección para municipio {self.municipio}...")
        
        result = {
            "municipio": self.municipio,
            "entidad": self.entidad,
            "timestamp": datetime.now().isoformat(),
            "capas": {},
        }
        
        # Capa 1: Geoespacial
        print("🗺️  Cargando datos geoespaciales...")
        result["capas"]["geo"] = {
            "municipios": self.geo.cargar_municipios(entidad=self.entidad).to_json(),
            "agebs": self.geo.cargar_agebs(
                entidad=self.entidad,
                municipio=self.municipio[-3:]
            ).to_json(),
        }
        
        # Capa 2: Indicadores
        print("📊 Consultando indicadores INEGI...")
        result["capas"]["indicadores"] = self.indicators.consultar_multiples_indicadores(
            area_geografica=self.municipio,
            nivel="02",
        ).to_dict()
        
        # Capa 3: Población sintética
        print("👥 Construyendo población sintética...")
        pop = self.population.build_from_census(n_agents=10000)
        result["capas"]["poblacion_sintetica"] = pop.to_dict(orient="records")
        
        # Capa 4: NLP
        if social_texts and social_metadata:
            print("🧠 Procesando textos con NLP...")
            result["capas"]["nlp"] = self.nlp.process_social_media_batch(
                social_texts, social_metadata
            )
        
        print("✅ Recolección completa")
        return result
    
    def export_for_orchestrator(self, data: dict, output_dir: Path = None):
        """Exporta datos en formato para el Orquestador."""
        if output_dir is None:
            output_dir = Path("/Volumes/SSD1TB/plataforma/data/collected")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filepath = output_dir / f"collection_{self.municipio}_{timestamp}.json"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"💾 Datos exportados: {filepath}")
        return filepath