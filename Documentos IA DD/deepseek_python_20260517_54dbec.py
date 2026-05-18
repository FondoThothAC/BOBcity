# /src/nlp/topic_classifier.py
"""
Clasificador de temas políticos mexicanos usando zero-shot classification.
Utiliza modelos BETO/BERT para clasificar textos en temas como seguridad,
economía, educación, etc. sin necesidad de datos etiquetados manualmente.
"""

import torch
import numpy as np
from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
from typing import List, Dict, Optional
from pathlib import Path
from datetime import datetime
import hashlib

from .config import MODELS_DIR, TOPICS_MEXICO, DEVICE
from .preprocessing import MexicanSpanishPreprocessor


class TopicClassifier:
    """
    Clasificador zero-shot de temas políticos para español mexicano.
    
    Uso:
        classifier = TopicClassifier()
        temas = classifier.classify("Aumentaron los homicidios en la colonia Centro")
        # [{'topic': 'seguridad', 'confidence': 0.92}, ...]
    """
    
    def __init__(
        self,
        model_id: str = "Recognai/bert-base-spanish-wwm-cased-xnli",
        cache_dir: Optional[Path] = None,
    ):
        self.model_id = model_id
        self.cache_dir = cache_dir or MODELS_DIR / "topic"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.preprocessor = MexicanSpanishPreprocessor()
        self.classifier = None
        self._load_model()
    
    def _load_model(self):
        """Carga el pipeline zero-shot classification."""
        print(f"🔄 Cargando zero-shot classifier {self.model_id}...")
        
        self.classifier = pipeline(
            "zero-shot-classification",
            model=self.model_id,
            tokenizer=self.model_id,
            device=0 if DEVICE == "cuda" else -1,
            cache_dir=str(self.cache_dir),
        )
        
        print("✅ Clasificador de temas listo")
    
    def classify(
        self,
        text: str,
        candidate_topics: Optional[List[str]] = None,
        multi_label: bool = True,
    ) -> List[Dict]:
        """
        Clasifica un texto en uno o varios temas políticos.
        
        Args:
            text: Texto en español a clasificar.
            candidate_topics: Lista de temas candidatos. Default: TOPICS_MEXICO.
            multi_label: Si True, puede asignar múltiples temas.
        
        Returns:
            Lista de dicts con 'topic' y 'confidence', ordenados por confianza.
        """
        if candidate_topics is None:
            candidate_topics = TOPICS_MEXICO
        
        cleaned = self.preprocessor.clean(text)
        
        result = self.classifier(
            cleaned,
            candidate_topics,
            multi_label=multi_label,
        )
        
        topics = [
            {"topic": label, "confidence": round(score, 4)}
            for label, score in zip(result["labels"], result["scores"])
        ]
        
        return topics
    
    def classify_batch(
        self,
        texts: List[str],
        min_confidence: float = 0.3,
    ) -> List[List[Dict]]:
        """Clasifica un lote de textos, filtrando por confianza mínima."""
        results = []
        for text in texts:
            topics = self.classify(text)
            filtered = [t for t in topics if t["confidence"] >= min_confidence]
            results.append(filtered)
        return results
    
    def aggregate_by_topic(
        self,
        texts: List[str],
        min_confidence: float = 0.3,
    ) -> Dict[str, float]:
        """
        Agrega textos por tema, calculando intensidad promedio por tema.
        Útil para construir mapas de calor de "puntos de dolor".
        """
        topic_scores: Dict[str, list] = {t: [] for t in TOPICS_MEXICO}
        
        for text in texts:
            topics = self.classify(text)
            for t in topics:
                if t["confidence"] >= min_confidence:
                    topic_scores[t["topic"]].append(t["confidence"])
        
        return {
            topic: np.mean(scores) if scores else 0.0
            for topic, scores in topic_scores.items()
        }
    
    def detect_emerging_topics(
        self,
        texts_actual: List[str],
        texts_historico: List[str],
        threshold: float = 0.2,
    ) -> List[Dict]:
        """
        Detecta temas emergentes comparando distribución actual vs histórica.
        
        Returns:
            Lista de temas con cambio significativo en frecuencia.
        """
        actual_dist = self.aggregate_by_topic(texts_actual)
        historico_dist = self.aggregate_by_topic(texts_historico)
        
        emergentes = []
        for topic in TOPICS_MEXICO:
            cambio = actual_dist[topic] - historico_dist[topic]
            if abs(cambio) > threshold:
                emergentes.append({
                    "topic": topic,
                    "cambio": round(cambio, 4),
                    "actual": round(actual_dist[topic], 4),
                    "historico": round(historico_dist[topic], 4),
                    "tendencia": "alza" if cambio > 0 else "baja",
                })
        
        emergentes.sort(key=lambda x: abs(x["cambio"]), reverse=True)
        return emergentes


# ============================================================
# EJEMPLO DE USO
# ============================================================
if __name__ == "__main__":
    classifier = TopicClassifier()
    
    textos_prueba = [
        "Hubo tres ejecuciones en la colonia Palo Verde esta madrugada",
        "El nuevo programa de becas está ayudando a muchos estudiantes",
        "No hay medicinas en el centro de salud desde hace semanas",
        "La obra del acueducto lleva 8 meses retrasada",
    ]
    
    for texto in textos_prueba:
        temas = classifier.classify(texto)
        top_tema = temas[0]
        print(f"\n📝 {texto[:80]}...")
        print(f"   Tema principal: {top_tema['topic']} ({top_tema['confidence']:.2%})")