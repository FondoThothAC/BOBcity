# /src/nlp/civicpulse_nlp_pipeline.py
"""
Pipeline NLP integrado para CivicPulse.
Orquesta todos los módulos: preprocesamiento, sentimiento, temas,
entidades y perfilado psicográfico.
"""

import json
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
import hashlib

from .preprocessing import MexicanSpanishPreprocessor
from .sentiment_analyzer import SentimentAnalyzer
from .topic_classifier import TopicClassifier
from .config import EXPORT_DIR


class CivicPulseNLPPipeline:
    """
    Pipeline NLP completo para CivicPulse.
    
    Flujo:
    1. Preprocesamiento de texto mexicano
    2. Análisis de sentimiento
    3. Clasificación de temas políticos
    4. Agregación para mapas de calor y puntos de dolor
    
    Uso:
        nlp = CivicPulseNLPPipeline()
        resultados = nlp.process_social_media_batch(tweets, metadata)
    """
    
    def __init__(self):
        self.preprocessor = MexicanSpanishPreprocessor(normalize_regionalisms=True)
        self.sentiment = SentimentAnalyzer(model="roberta")
        self.topic = TopicClassifier()
    
    def process_social_media_batch(
        self,
        texts: List[str],
        metadata: List[Dict],
        consent_ids: Optional[List[str]] = None,
    ) -> Dict:
        """
        Procesa un lote de textos de redes sociales.
        
        Args:
            texts: Lista de textos (tweets, posts, comentarios).
            metadata: Lista de dicts con 'user_id', 'source', 'location', 'timestamp'.
            consent_ids: IDs de consentimiento verificados.
        
        Returns:
            Dict con resultados agregados, listo para GIS y ABM.
        """
        if consent_ids is None:
            consent_ids = [f"PUBLIC_{i}" for i in range(len(texts))]
        
        # 1. Preprocesar
        cleaned = self.preprocessor.clean_batch(texts)
        
        # 2. Analizar sentimiento
        sentiment_results = self.sentiment.analyze_with_metadata(
            cleaned, metadata, consent_ids
        )
        
        # 3. Clasificar temas
        topic_results = self.topic.classify_batch(cleaned, min_confidence=0.25)
        
        # 4. Agregar por ubicación
        geo_aggregation = self._aggregate_by_location(
            sentiment_results, topic_results, metadata
        )
        
        # 5. Construir resultado final
        result = {
            "timestamp": datetime.now().isoformat(),
            "total_texts": len(texts),
            "sentiment_distribution": {
                "positivo": sum(1 for r in sentiment_results if r["label"] == "positivo"),
                "negativo": sum(1 for r in sentiment_results if r["label"] == "negativo"),
                "neutral": sum(1 for r in sentiment_results if r["label"] == "neutral"),
            },
            "top_topics": self._get_top_topics(topic_results),
            "geo_aggregation": geo_aggregation,
            "audit": {
                "pipeline_hash": self._generate_pipeline_hash(cleaned),
                "model_versions": {
                    "sentiment": "roberta_sentiments_es",
                    "topic": "bert-base-spanish-wwm-cased-xnli",
                },
                "privacy_mode": "local_only",
                "consent_verified": all(
                    r.get("consent_verified", False) for r in sentiment_results
                ),
            },
        }
        
        return result
    
    def _aggregate_by_location(
        self,
        sentiment_results: List[Dict],
        topic_results: List[List[Dict]],
        metadata: List[Dict],
    ) -> Dict[str, Dict]:
        """Agrega resultados por ubicación geográfica."""
        geo_data: Dict[str, Dict] = {}
        
        for sent, topics, meta in zip(sentiment_results, topic_results, metadata):
            location = meta.get("location", "desconocido")
            
            if location not in geo_data:
                geo_data[location] = {
                    "count": 0,
                    "sentiment_score": 0.0,
                    "topics": {},
                }
            
            geo_data[location]["count"] += 1
            
            # Score de sentimiento acumulado
            sent_score = sent.get("confidence", 0.5)
            if sent["label"] == "negativo":
                sent_score *= -1
            geo_data[location]["sentiment_score"] += sent_score
            
            # Acumular temas
            for t in topics:
                topic_name = t["topic"]
                if topic_name not in geo_data[location]["topics"]:
                    geo_data[location]["topics"][topic_name] = []
                geo_data[location]["topics"][topic_name].append(t["confidence"])
        
        # Normalizar
        for loc in geo_data:
            count = geo_data[loc]["count"]
            geo_data[loc]["sentiment_score"] /= count
            
            # Promediar scores de temas
            geo_data[loc]["topics"] = {
                t: sum(scores) / len(scores)
                for t, scores in geo_data[loc]["topics"].items()
            }
        
        return geo_data
    
    def _get_top_topics(self, topic_results: List[List[Dict]], top_n: int = 5) -> List[Dict]:
        """Obtiene los temas más mencionados."""
        topic_counts: Dict[str, float] = {}
        
        for topics in topic_results:
            for t in topics:
                topic_counts[t["topic"]] = topic_counts.get(t["topic"], 0) + t["confidence"]
        
        sorted_topics = sorted(topic_counts.items(), key=lambda x: x[1], reverse=True)
        return [{"topic": t, "intensity": round(s, 4)} for t, s in sorted_topics[:top_n]]
    
    def _generate_pipeline_hash(self, texts: List[str]) -> str:
        """Genera hash del pipeline para auditoría."""
        payload = "".join(t[:50] for t in texts[:10])
        return hashlib.sha256(payload.encode()).hexdigest()[:16]
    
    def export_for_gis(self, result: Dict, filepath: Optional[Path] = None) -> Path:
        """Exporta resultados para consumo del frontend GIS."""
        if filepath is None:
            filepath = EXPORT_DIR / f"nlp_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"💾 Resultados NLP exportados: {filepath}")
        return filepath


# ============================================================
# EJEMPLO DE USO COMPLETO
# ============================================================
if __name__ == "__main__":
    nlp = CivicPulseNLPPipeline()
    
    # Simular tweets de Hermosillo
    tweets = [
        "Otra vez sin agua en Palo Verde, el gobierno no hace nada",
        "Excelente el nuevo programa de becas para estudiantes universitarios",
        "La inseguridad está terrible en la colonia Centro, necesitamos más patrullaje",
        "Las nuevas rutas de camión ayudan mucho a los estudiantes",
        "No hay medicinas en el centro de salud, esto es un desastre",
    ]
    
    metadata = [
        {"user_id": "U1", "source": "twitter", "location": "Palo_Verde", "timestamp": "2026-05-17T10:00:00"},
        {"user_id": "U2", "source": "twitter", "location": "Centro", "timestamp": "2026-05-17T10:05:00"},
        {"user_id": "U3", "source": "twitter", "location": "Centro", "timestamp": "2026-05-17T10:10:00"},
        {"user_id": "U4", "source": "twitter", "location": "Universidad", "timestamp": "2026-05-17T10:15:00"},
        {"user_id": "U5", "source": "twitter", "location": "Palo_Verde", "timestamp": "2026-05-17T10:20:00"},
    ]
    
    resultados = nlp.process_social_media_batch(tweets, metadata)
    
    print("\n📊 RESULTADOS NLP:")
    print(f"   Total textos: {resultados['total_texts']}")
    print(f"   Sentimiento: {resultados['sentiment_distribution']}")
    print(f"   Temas principales: {resultados['top_topics']}")
    print(f"\n📍 Agregación geográfica:")
    for loc, data in resultados["geo_aggregation"].items():
        print(f"   {loc}: score={data['sentiment_score']:.2f}, temas={list(data['topics'].keys())[:3]}")