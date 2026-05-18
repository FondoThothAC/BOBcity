# /src/nlp/sentiment_analyzer.py
"""
Analizador de sentimiento para texto en español mexicano.
Utiliza modelos SaBERT y RoBERTa fine-tuned para español, ejecutados 100% local.
"""

import torch
import numpy as np
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    pipeline,
)
from typing import List, Dict, Optional, Literal
from pathlib import Path
import hashlib
import json
from datetime import datetime

from .config import MODEL_CONFIGS, MODELS_DIR, DEVICE
from .preprocessing import MexicanSpanishPreprocessor

SentimentLabel = Literal["positivo", "negativo", "neutral"]


class SentimentAnalyzer:
    """
    Analizador de sentimiento para español mexicano.
    
    Modelos disponibles:
    - SaBERT: BERT fine-tuned en 11,500 tweets españoles (85.5% accuracy)
    - RoBERTa-es: RoBERTa entrenado en ~58M tweets
    
    Uso:
        analyzer = SentimentAnalyzer(model="sabert")
        resultado = analyzer.analyze("La nueva política de agua está funcionando bien")
        # {'label': 'positivo', 'confidence': 0.89, 'scores': {...}}
    """
    
    def __init__(
        self,
        model: Literal["sabert", "roberta"] = "sabert",
        cache_dir: Optional[Path] = None,
    ):
        self.model_name = model
        self.cache_dir = cache_dir or MODELS_DIR / "sentiment" / model
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        
        self.preprocessor = MexicanSpanishPreprocessor()
        self.model = None
        self.tokenizer = None
        self._load_model()
    
    def _load_model(self):
        """Carga el modelo en local. Primero busca en cache, luego descarga de HuggingFace."""
        if self.model_name == "sabert":
            model_id = MODEL_CONFIGS["sentiment_sabert"].huggingface_id
        else:
            model_id = MODEL_CONFIGS["sentiment_roberta"].huggingface_id
        
        print(f"🔄 Cargando modelo {model_id} en {DEVICE}...")
        
        self.tokenizer = AutoTokenizer.from_pretrained(
            model_id,
            cache_dir=str(self.cache_dir),
        )
        self.model = AutoModelForSequenceClassification.from_pretrained(
            model_id,
            cache_dir=str(self.cache_dir),
        )
        self.model.to(DEVICE)
        self.model.eval()
        
        print(f"✅ Modelo cargado: {model_id}")
    
    def analyze(
        self,
        text: str,
        threshold: float = 0.5,
        return_scores: bool = True,
    ) -> Dict:
        """
        Analiza el sentimiento de un texto.
        
        Args:
            text: Texto en español a analizar.
            threshold: Umbral de confianza (0-1). Scores debajo se marcan 'neutral'.
            return_scores: Si es True, incluye los scores detallados.
        
        Returns:
            Dict con 'label', 'confidence', 'scores', 'audit_hash'.
        """
        # Preprocesar
        cleaned = self.preprocessor.clean(text)
        
        # Tokenizar
        inputs = self.tokenizer(
            cleaned,
            return_tensors="pt",
            padding=True,
            truncation=True,
            max_length=128,
        ).to(DEVICE)
        
        # Inferir
        with torch.no_grad():
            outputs = self.model(**inputs)
            logits = outputs.logits
            probabilities = torch.softmax(logits, dim=1).squeeze().cpu().numpy()
        
        # Determinar etiqueta
        predicted_class = int(np.argmax(probabilities))
        max_prob = float(probabilities[predicted_class])
        
        # Mapeo de clases (depende del modelo)
        if self.model_name == "sabert":
            # SaBERT: 0=negativo, 1=positivo
            label = "positivo" if predicted_class == 1 else "negativo"
            if max_prob < threshold:
                label = "neutral"
            scores = {
                "negativo": float(probabilities[0]),
                "positivo": float(probabilities[1]),
            }
        else:
            # RoBERTa: 0=negativo, 1=neutral, 2=positivo
            labels = ["negativo", "neutral", "positivo"]
            label = labels[predicted_class]
            if max_prob < threshold:
                label = "neutral"
            scores = {labels[i]: float(p) for i, p in enumerate(probabilities)}
        
        result = {
            "label": label,
            "confidence": max_prob,
            "scores": scores,
            "text_length": len(cleaned),
            "audit_hash": self._generate_audit_hash(cleaned, label, max_prob),
            "timestamp": datetime.now().isoformat(),
        }
        
        return result
    
    def analyze_batch(
        self,
        texts: List[str],
        threshold: float = 0.5,
    ) -> List[Dict]:
        """Analiza sentimiento para un lote de textos."""
        return [self.analyze(t, threshold) for t in texts]
    
    def analyze_with_metadata(
        self,
        texts: List[str],
        metadata: List[Dict],
        consent_ids: List[str],
    ) -> List[Dict]:
        """
        Analiza textos con metadatos de auditoría y consentimiento.
        
        Args:
            texts: Textos a analizar.
            metadata: Lista de dicts con 'user_id', 'source', 'timestamp'.
            consent_ids: IDs de consentimiento verificados.
        
        Returns:
            Resultados con trazabilidad completa.
        """
        results = []
        for text, meta, consent in zip(texts, metadata, consent_ids):
            result = self.analyze(text)
            result["metadata"] = meta
            result["consent_id"] = consent
            result["consent_verified"] = self._verify_consent(consent)
            results.append(result)
        
        return results
    
    def _generate_audit_hash(self, text: str, label: str, confidence: float) -> str:
        """Genera hash SHA-256 para auditoría inmutable."""
        payload = f"{text[:100]}|{label}|{confidence:.4f}|{datetime.now().isoformat()}"
        return hashlib.sha256(payload.encode()).hexdigest()[:16]
    
    def _verify_consent(self, consent_id: str) -> bool:
        """Verifica que el consentimiento esté registrado (mock)."""
        # En producción: consultar base de datos de consentimientos
        return consent_id.startswith("CONSENT_")


# ============================================================
# EJEMPLO DE USO
# ============================================================
if __name__ == "__main__":
    analyzer = SentimentAnalyzer(model="roberta")
    
    textos = [
        "Excelente trabajo del gobierno municipal con las nuevas ciclovías",
        "Otra vez sin agua en la colonia, esto es un desastre total",
        "Mañana hay reunión de vecinos en el parque central",
    ]
    
    for texto in textos:
        resultado = analyzer.analyze(texto)
        print(f"\n📝 Texto: {texto}")
        print(f"   Sentimiento: {resultado['label']} ({resultado['confidence']:.2%})")
        print(f"   Scores: {resultado['scores']}")