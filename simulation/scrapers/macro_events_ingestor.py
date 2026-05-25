# simulation/scrapers/macro_events_ingestor.py
# MDD / SDD: OSINT Macro Events Ingestor via RSS and LLM Semantic Scoring

import json
import random
import time
from datetime import datetime

# En un entorno de producción, esto llamaría a ollama via `requests.post('http://localhost:11434/api/generate')`
# Para esta implementación iterativa, mockeamos el motor semántico para garantizar cero bloqueos.

class MacroEventsIngestor:
    def __init__(self):
        self.sources = [
            "http://rss.cnn.com/rss/money_latest.rss",
            "https://feeds.bbci.co.uk/news/world/rss.xml",
            "https://finance.yahoo.com/news/rssindex"
        ]
        
    def _fetch_mock_rss(self):
        """Simula la descarga de titulares de fuentes RSS"""
        return [
            {"title": "La Reserva Federal eleva las tasas de interés al nivel más alto en 20 años", "source": "CNN Money"},
            {"title": "Escasez global de semiconductores impacta ensambladoras en el norte de México", "source": "Yahoo Finance"},
            {"title": "Aprobada nueva reforma laboral que reduce horas de jornada semanal", "source": "RT News"},
            {"title": "Startup tecnológica anuncia modelo de IA generativa ultrarrápido", "source": "TechCrunch"},
            {"title": "Protestas masivas por el aumento del costo de la gasolina a nivel nacional", "source": "BBC World"}
        ]
        
    def _semantic_llm_scoring(self, text):
        """
        Simula el procesamiento de un LLM local (Ollama/Qwen) extrayendo:
        1. Categoría (Tecnología, Economía, Política, Social)
        2. Impacto (-10 a +10, negativo aumenta estrés, positivo lo baja)
        3. ETA de Maduración en meses (Para el Radar Gartner)
        4. Distancia (1.0 = Centro/Inmediato, 0.1 = Lejano/Borde)
        """
        text_lower = text.lower()
        
        # Heurísticas básicas imitando un prompt
        category = "General"
        impact = 0.0
        eta_months = 12
        
        if "tasa" in text_lower or "inflación" in text_lower or "escasez" in text_lower or "gasolina" in text_lower:
            category = "Economía"
            impact = -7.5 # Aumenta estrés económico
            eta_months = random.randint(0, 3)
            
        elif "tecnolog" in text_lower or "ia" in text_lower or "semiconductor" in text_lower:
            category = "Tecnología"
            impact = 4.0 # Mejora productividad a largo plazo
            eta_months = random.randint(12, 36)
            
        elif "protesta" in text_lower or "laboral" in text_lower or "reforma" in text_lower:
            category = "Sociopolítica"
            impact = -4.0 # Aumenta frustración temporal
            eta_months = random.randint(1, 6)
            
        else:
            category = "Global"
            impact = random.uniform(-3.0, 3.0)
            eta_months = random.randint(6, 24)
            
        # Distancia para el radar Gartner: 0 meses = 1.0 (centro), 36 meses = 0.0 (borde)
        distance = max(0.1, 1.0 - (eta_months / 36.0))
        # Ángulo aleatorio dentro del cuadrante de su categoría
        quadrants = {
            "Economía": (0, 90),
            "Tecnología": (90, 180),
            "Sociopolítica": (180, 270),
            "Global": (270, 360)
        }
        angle = random.uniform(quadrants[category][0], quadrants[category][1])
            
        return {
            "category": category,
            "impact_score": impact,
            "eta_months": eta_months,
            "radar_distance": distance,
            "radar_angle": angle
        }

    def fetch_and_process_events(self):
        """Pipeline principal que obtiene noticias, las parsea y las califica"""
        raw_news = self._fetch_mock_rss()
        processed_events = []
        
        for news in raw_news:
            scoring = self._semantic_llm_scoring(news["title"])
            event = {
                "id": str(time.time()).replace('.', '')[-6:] + str(random.randint(10,99)),
                "title": news["title"],
                "source": news["source"],
                "timestamp": datetime.now().isoformat(),
                **scoring
            }
            processed_events.append(event)
            
        return processed_events

# Singleton expose para uso global
_ingestor_instance = MacroEventsIngestor()

def get_latest_macro_events():
    return _ingestor_instance.fetch_and_process_events()

if __name__ == "__main__":
    print(json.dumps(get_latest_macro_events(), indent=2, ensure_ascii=False))
