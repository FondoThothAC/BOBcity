#!/bin/bash
# start_services.sh - Levantar todos los servicios locales de CivicPulse
# SDD / ADD: Zero-Trust Local Orchestrator launcher

# Color formatting for terminal outputs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Iniciando Ecosistema Local CivicPulse / CívicaOS ===${NC}"

# 1. Validar requerimientos
echo -e "${YELLOW}[1/5] Verificando dependencias locales y Entorno Virtual...${NC}"
command -v python3 >/dev/null 2>&1 || { echo -e "${RED}❌ python3 no está instalado. Instálalo para correr el simulador ABM.${NC}"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo -e "${RED}❌ npm no está instalado. Instala Node.js para el panel frontend.${NC}"; exit 1; }

if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creando entorno virtual de Python (venv)...${NC}"
    python3 -m venv venv
fi

echo -e "${YELLOW}Instalando dependencias de Python (Celery, Flower, etc)...${NC}"
source venv/bin/activate
pip install -q celery "celery[sqlalchemy]" flower


# 2. Levantar el Motor de Simulación (Python)
echo -e "${YELLOW}[2/5] Iniciando Servidor de Simulación Matemática (Port 5001)...${NC}"
cd simulation
python3 api_server.py > ../simulation_server.log 2>&1 &
SIM_PID=$!
echo -e "${GREEN}✅ Servidor de Simulación iniciado (PID: $SIM_PID)${NC}"

# 3. Levantar Celery Worker y Flower Monitor
echo -e "${YELLOW}[3/5] Iniciando Tareas Distribuidas (Celery) y Monitor (Flower en Port 5555)...${NC}"
celery -A celery_app worker --loglevel=info > ../celery_worker.log 2>&1 &
CELERY_PID=$!
celery -A celery_app flower --port=5555 > ../flower_monitor.log 2>&1 &
FLOWER_PID=$!
cd ..
echo -e "${GREEN}✅ Trabajador Celery iniciado (PID: $CELERY_PID)${NC}"
echo -e "${GREEN}✅ Monitor Flower iniciado (PID: $FLOWER_PID)${NC}"

# 4. Levantar el Servidor de Desarrollo React (Vite)
echo -e "${YELLOW}[4/5] Iniciando Servidor Frontend React/Vite (Port 3335)...${NC}"
npm run dev > vite_server.log 2>&1 &
VITE_PID=$!
echo -e "${GREEN}✅ Servidor Frontend iniciado en segundo plano (PID: $VITE_PID)${NC}"

# 5. Instrucción de Modelos IA en Ollama
echo -e "${YELLOW}[5/5] Directiva de Modelos de Inteligencia Artificial (Ollama):${NC}"
echo -e "   Para cargar y actualizar los modelos locales, abre una terminal y corre:"
echo -e "   ${BLUE}ollama pull qwen2.5:14b${NC}   (Modelo de lenguaje recomendado para Hermosillo)"
echo -e "   ${BLUE}ollama pull llama3:8b${NC}      (Modelo secundario de velocidad)"
echo -e ""

# Guardar PIDs para apagar limpiamente
echo -e "${GREEN}🚀 ¡Todos los servicios han sido levantados!${NC}"
echo -e "   👉 Acceso al Panel Frontend: ${BLUE}http://localhost:3335${NC}"
echo -e "   👉 Acceso al Motor Python:   ${BLUE}http://localhost:5001${NC}"
echo -e "   👉 Acceso al Monitor Flower: ${BLUE}http://localhost:5555${NC}"
echo ""
echo -e "Presiona ${RED}[Ctrl+C]${NC} para apagar todos los servicios y limpiar procesos."

# Catch terminate signals to kill background tasks
cleanup() {
    echo -e "\n${RED}🛑 Apagando servicios locales y liberando puertos...${NC}"
    kill $SIM_PID >/dev/null 2>&1 || true
    kill $CELERY_PID >/dev/null 2>&1 || true
    kill $FLOWER_PID >/dev/null 2>&1 || true
    kill $VITE_PID >/dev/null 2>&1 || true
    rm -f simulation_server.log vite_server.log celery_worker.log flower_monitor.log
    deactivate >/dev/null 2>&1 || true
    echo -e "${GREEN}✅ Puertos liberados. ¡Hasta luego!${NC}"
    exit 0
}

trap cleanup INT TERM

# Keep script running to monitor logs
tail -f simulation_server.log
