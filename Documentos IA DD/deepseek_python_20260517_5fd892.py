# /src/nlp/config.py
"""
Configuración central del pipeline NLP.
Todos los modelos se descargan una vez y se ejecutan 100% en local.
"""

import os
from pathlib import Path
from dataclasses import dataclass

BASE_DIR = Path("/Volumes/SSD1TB/plataforma/src/nlp")
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"

# Crear directorios
for d in [MODELS_DIR, DATA_DIR]:
    d.mkdir(parents=True, exist_ok=True)


@dataclass
class NLPModelConfig:
    """Configuración de un modelo NLP."""
    huggingface_id: str
    local_path: Path
    task: str  # "sentiment", "topic", "ner", "psychographic"
    description: str


# Modelos recomendados para español mexicano
MODEL_CONFIGS = {
    # Análisis de Sentimiento
    "sentiment_sabert": NLPModelConfig(
        huggingface_id="VerificadoProfesional/SaBERT-Spanish-Sentiment-Analysis",
        local_path=MODELS_DIR / "sentiment" / "sabert",
        task="sentiment",
        description="SaBERT: BERT fine-tuned para análisis de sentimiento en tweets en español. "
                     "85.5% accuracy. Entrenado en 11,500 tweets. Ref: UBA thesis project.",
    ),
    "sentiment_roberta": NLPModelConfig(
        huggingface_id="Manauu17/roberta_sentiments_es",
        local_path=MODELS_DIR / "sentiment" / "roberta_es",
        task="sentiment",
        description="RoBERTa-base entrenado en ~58M tweets, fine-tuned para sentimiento en español. "
                     "Soporta 3 clases: Negativo, Neutral, Positivo.",
    ),
    
    # Clasificación de variedad de español (detecta español mexicano)
    "variety_cereal": NLPModelConfig(
        huggingface_id="cristinae/cereal",
        local_path=MODELS_DIR / "variety" / "cereal",
        task="classification",
        description="CEREAL: Clasificador de variedades de español (MX, ES, AR, CL). "
                     "Basado en XLM-RoBERTa large. Ref: España-Bonet & Barrón-Cedeño, NAACL 2024.",
    ),
    
    # NER para español
    "ner_spanish": NLPModelConfig(
        huggingface_id="mrm8488/bert-spanish-cased-finetuned-ner",
        local_path=MODELS_DIR / "ner" / "bert_spanish_ner",
        task="ner",
        description="BERT español fine-tuned para Named Entity Recognition. "
                     "Detecta personas, organizaciones, ubicaciones.",
    ),
    
    # Modelo base para fine-tuning de temas políticos mexicanos
    "beto_base": NLPModelConfig(
        huggingface_id="dccuchile/bert-base-spanish-wwm-uncased",
        local_path=MODELS_DIR / "base" / "beto",
        task="base",
        description="BETO: BERT pre-entrenado en corpus español masivo por DCC UChile. "
                     "Base recomendada para fine-tuning de tareas específicas.",
    ),
}

# Temas políticos mexicanos para clasificación
TOPICS_MEXICO = [
    "seguridad",
    "economia",
    "empleo",
    "educacion",
    "salud",
    "agua",
    "transporte",
    "corrupcion",
    "medio_ambiente",
    "vivienda",
    "migracion",
    "derechos_humanos",
    "energia",
    "agricultura",
    "tecnologia",
    "otro",
]

# Rasgos OCEAN (Big Five) para perfilado psicográfico
OCEAN_TRAITS = {
    "O": "Apertura a la experiencia (Openness)",
    "C": "Responsabilidad (Conscientiousness)",
    "E": "Extraversión (Extraversion)",
    "A": "Amabilidad (Agreeableness)",
    "N": "Neuroticismo (Neuroticism)",
}

# Configuración de dispositivo
import torch
DEVICE = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
print(f"🔧 Dispositivo NLP: {DEVICE}")