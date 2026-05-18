#!/bin/bash
# deploy-tier1.sh - Despliegue optimizado para Mac Mini M4 16GB
# ADD: Security hardening, SDD: Performance tuning

set -euo pipefail

echo "🔐 CivicPulse Tier-1 Local Deployment (Mac Mini M4)"

# 1. Verificar dependencias
command -v ollama >/dev/null 2>&1 || { echo "❌ ollama no instalado"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "❌ docker no instalado"; exit 1; }

# 2. Pull de modelos optimizados para Apple Silicon
echo "📥 Descargando modelos quantizados (Q4_K_M para 16GB RAM)..."
ollama pull qwen2.5:14b-q4_k_m  # ~8GB VRAM usage
ollama pull nomic-embed-text:latest  # Para RAG local

# 3. Iniciar servicios locales (Docker Compose)
echo "🐳 Iniciando stack local..."
docker compose -f docker-compose.tier1.yml up -d

# 4. Esperar salud de servicios
echo "⏳ Esperando servicios..."
until curl -s http://localhost:11434/api/tags | grep -q qwen2.5; do
  sleep 2
done
echo "✅ Ollama listo"

# 5. Iniciar frontend en modo producción local
echo "⚡ Compilando frontend (Vite + React)..."
npm run build
npm run preview -- --port 3335 &

# 6. Generar certificado mTLS local para OBP integration (ADD)
echo "🔑 Generando certificados locales para mTLS..."
mkdir -p ./certs/local
openssl req -x509 -newkey rsa:2048 -keyout ./certs/local/key.pem \
  -out ./certs/local/cert.pem -days 365 -nodes \
  -subj "/C=MX/ST=Sonora/L=Hermosillo/O=CivicPulse/CN=localhost"

# 7. Mostrar información de acceso
echo ""
echo "🎉 CivicPulse Tier-1 listo en:"
echo "   Frontend: http://localhost:3335"
echo "   Ollama API: http://localhost:11434"
echo "   OBP Webhook (mTLS): https://localhost:8443/obp-webhook"
echo ""
echo "🔐 Auditoría local activada. Logs en: ./data/audit/"
echo "💡 Tip: Usa Ctrl+Enter en la consola para ejecutar flujos rápidos"