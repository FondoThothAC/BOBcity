# /scripts/setup_inegi_nlp.sh
#!/bin/bash
# Script de instalación de dependencias para INEGI + NLP

echo "🔧 Instalando dependencias para INEGI + NLP..."

# INEGI
pip install geopandas pandas numpy requests shapely pyproj
pip install inegipy  # Librería comunitaria para APIs INEGI

# NLP
pip install transformers torch sentencepiece
pip install spacy
python -m spacy download es_core_news_lg

# Utilidades
pip install python-dotenv tqdm

echo "✅ Dependencias instaladas"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configurar token INEGI en archivo .env:"
echo "   INEGI_TOKEN=tu-token-aqui"
echo ""
echo "2. Ejecutar tests:"
echo "   cd /Volumes/SSD1TB/plataforma"
echo "   python -m pytest src/data/inegi/tests/"
echo "   python -m pytest src/nlp/tests/"
echo ""
echo "3. Probar pipeline completo:"
echo "   python -m src.nlp.civicpulse_nlp_pipeline"
echo "   python -m src.orchestrator.data_collector_skill"