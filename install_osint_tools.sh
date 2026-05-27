#!/bin/bash
# ==============================================================================
# 🛠️ OSINT Tools Installation Script for CivicaOS
# ==============================================================================
# Este script instala las herramientas OSINT del framework:
# - Sherlock: Búsqueda de usernames en redes sociales
# - theHarvester: Extracción de emails y subdominios
# - GHunt: Investigación de cuentas Google
# - SpiderFoot: Automatización de recolección OSINT
# ==============================================================================

set -e

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🕵️  CivicaOS - OSINT Tools Installer                ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${CYAN}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si estamos en el directorio correcto
if [ ! -d "$PWD" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

# Crear directorio para herramientas OSINT
OSINT_DIR="$PWD/osint_tools"
mkdir -p "$OSINT_DIR"
print_status "Directorio de herramientas creado: $OSINT_DIR"

# ==============================================================================
# 1. INSTALAR SHERLOCK
# ==============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Instalando Sherlock..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "$OSINT_DIR/sherlock" ]; then
    print_warning "Sherlock ya está instalado. Actualizando..."
    cd "$OSINT_DIR/sherlock"
    git pull
else
    cd "$OSINT_DIR"
    git clone https://github.com/sherlock-project/sherlock.git
fi

cd "$OSINT_DIR/sherlock"
pip3 install -e . --quiet
print_success "Sherlock instalado correctamente"
print_status "Ubicación: $OSINT_DIR/sherlock"
print_status "Uso: python3 -m sherlock_project <username>"

# ==============================================================================
# 2. INSTALAR THEHARVESTER
# ==============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📧 Instalando theHarvester..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "$OSINT_DIR/theHarvester" ]; then
    print_warning "theHarvester ya está instalado. Actualizando..."
    cd "$OSINT_DIR/theHarvester"
    git pull
else
    cd "$OSINT_DIR"
    git clone https://github.com/laramies/theHarvester.git
fi

cd "$OSINT_DIR/theHarvester"
pip3 install -e . --quiet
print_success "theHarvester instalado correctamente"
print_status "Ubicación: $OSINT_DIR/theHarvester"
print_status "Uso: theharvester -d <domain> -b all"

# ==============================================================================
# 3. INSTALAR GHUNT
# ==============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Instalando GHunt..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "$OSINT_DIR/GHunt" ]; then
    print_warning "GHunt ya está instalado. Actualizando..."
    cd "$OSINT_DIR/GHunt"
    git pull
else
    cd "$OSINT_DIR"
    git clone https://github.com/mxrch/GHunt.git
fi

cd "$OSINT_DIR/GHunt"
pip3 install -e . --quiet
print_success "GHunt instalado correctamente"
print_status "Ubicación: $OSINT_DIR/GHunt"
print_status "Uso: python3 ghunt.py -e <email>"
print_warning "⚠️  GHunt requiere cookies de Google autenticadas para funcionar completamente"
print_status "Lee la documentación: https://github.com/mxrch/GHunt#authentication"

# ==============================================================================
# 4. INSTALAR SPIDERFOOT (OPCIONAL)
# ==============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🕷️  Instalando SpiderFoot..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "$OSINT_DIR/spiderfoot" ]; then
    print_warning "SpiderFoot ya está instalado. Actualizando..."
    cd "$OSINT_DIR/spiderfoot"
    git pull
else
    cd "$OSINT_DIR"
    git clone https://github.com/smicallef/spiderfoot.git
fi

cd "$OSINT_DIR/spiderfoot"
pip3 install -r requirements.txt --quiet
print_success "SpiderFoot instalado correctamente"
print_status "Ubicación: $OSINT_DIR/spiderfoot"
print_status "Uso: python3 sf.py -l 127.0.0.1:5001 (para interfaz web)"

# ==============================================================================
# 5. CREAR SCRIPT DE VERIFICACIÓN
# ==============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Creando script de verificación..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cat > "$OSINT_DIR/check_osint_tools.sh" << 'EOF'
#!/bin/bash
# Script para verificar el estado de las herramientas OSINT

echo "╔══════════════════════════════════════════════════════════╗"
echo "║     🔍 OSINT Tools Status Check                          ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

OSINT_DIR="\$PWD/osint_tools"

# Verificar Sherlock
if [ -d "$OSINT_DIR/sherlock/sherlock_project" ]; then
    echo "✅ Sherlock: INSTALADO"
    cd "$OSINT_DIR/sherlock" && python3 -m sherlock_project --version 2>/dev/null || echo "   Versión: disponible"
else
    echo "❌ Sherlock: NO INSTALADO"
fi

# Verificar theHarvester
if command -v theharvester &> /dev/null || [ -d "$OSINT_DIR/theHarvester/theHarvester" ]; then
    echo "✅ theHarvester: INSTALADO"
else
    echo "❌ theHarvester: NO INSTALADO"
fi

# Verificar GHunt
if command -v ghunt &> /dev/null || [ -d "$OSINT_DIR/GHunt/ghunt" ]; then
    echo "✅ GHunt: INSTALADO"
else
    echo "❌ GHunt: NO INSTALADO"
fi

# Verificar SpiderFoot
if [ -f "$OSINT_DIR/spiderfoot/sf.py" ]; then
    echo "✅ SpiderFoot: INSTALADO"
else
    echo "❌ SpiderFoot: NO INSTALADO"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Para más información visita: https://osintframework.com"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
EOF

chmod +x "$OSINT_DIR/check_osint_tools.sh"
print_success "Script de verificación creado: $OSINT_DIR/check_osint_tools.sh"

# ==============================================================================
# RESUMEN FINAL
# ==============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║            ✅ INSTALACIÓN COMPLETADA                     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "📁 Directorio de instalación: $OSINT_DIR"
echo ""
echo "🛠️ Herramientas instaladas:"
echo "   • Sherlock     → Búsqueda de usernames en redes sociales"
echo "   • theHarvester → Extracción de emails y subdominios"
echo "   • GHunt        → Investigación de cuentas Google"
echo "   • SpiderFoot   → Automatización de recolección OSINT"
echo ""
echo "📋 Para verificar el estado de las herramientas:"
echo "   $OSINT_DIR/check_osint_tools.sh"
echo ""
echo "🔗 Referencia: https://osintframework.com"
echo ""
print_warning "⚠️  NOTA: Algunas herramientas requieren configuración adicional"
print_warning "   (ej. GHunt necesita cookies de Google autenticadas)"
echo ""
print_success "¡Listo! Ahora actualiza el dashboard para reflejar el estado EN LÍNEA"
