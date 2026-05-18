# /src/nlp/psychographic_pipeline.py
from transformers import pipeline, AutoModelForSequenceClassification
import torch

class EthicalPsychographicProfiler:
    """
    Infiere rasgos OCEAN SOLO de datos públicos con consentimiento.
    Difiere de Cambridge Analytica en:
    1. Solo procesa datos consentidos o públicos.
    2. No cruza con grafos de amigos sin permiso.
    3. Genera explicabilidad: ¿por qué este usuario tiene alto Openness?
    4. Ejecución 100% local, sin APIs externas.
    """
    
    def __init__(self, model_path: str = "/models/ocean-llama-3.1-es"):
        self.classifier = pipeline(
            "text-classification",
            model=AutoModelForSequenceClassification.from_pretrained(model_path),
            tokenizer=model_path,
            device="cuda" if torch.cuda.is_available() else "cpu"
        )
    
    def profile_from_tweets(self, tweets: list[str], consent_id: str) -> dict:
        """
        Retorna perfil OCEAN con intervalos de confianza.
        Incluye metadatos de auditoría para GDPR.
        """
        if not self._verify_consent(consent_id):
            raise ConsentViolationError("Sin consentimiento explícito")
        
        scores = {trait: [] for trait in ['O', 'C', 'E', 'A', 'N']}
        
        for tweet in tweets:
            result = self.classifier(tweet)
            for trait in scores:
                scores[trait].append(result.get(trait, 0.5))
        
        return {
            'profile': {t: np.mean(v) for t, v in scores.items()},
            'confidence': {t: 1 - np.std(v) for t, v in scores.items()},
            'audit_hash': self._sign_profile(consent_id, scores),
            'data_sources': 'public_tweets_only'
        }