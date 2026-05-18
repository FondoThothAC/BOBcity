#!/usr/bin/env bash
# ==============================================================================
# 🚀 CÍVICAOS: AUTOMATED REFERENCE REPOSITORIES CLONER
# ==============================================================================
# Objective: Automatically clones high-fidelity multi-agent orchestrator frameworks
# (OpenSwarm, openclaw, NemoClaw) to serve as local references.
#
# Execution: Run on your local host system (requires internet access).
# ==============================================================================

set -e

REF_DIR="/Volumes/SSD1TB/plataforma/docs/references"

echo "======================================================================"
echo "📡 Initiating reference repositories cloning in:"
echo "   $REF_DIR"
echo "======================================================================"

# Ensure target directory exists
mkdir -p "$REF_DIR"
cd "$REF_DIR"

# 1. Clone VRSEN / OpenSwarm
if [ ! -d "OpenSwarm" ]; then
  echo "📥 Cloning VRSEN / OpenSwarm..."
  git clone https://github.com/VRSEN/OpenSwarm.git
else
  echo "✅ OpenSwarm directory already exists. Skipping."
fi

# 2. Clone openclaw / openclaw
if [ ! -d "openclaw" ]; then
  echo "📥 Cloning openclaw / openclaw..."
  git clone https://github.com/openclaw/openclaw.git
else
  echo "✅ openclaw directory already exists. Skipping."
fi

# 3. Clone NVIDIA / NemoClaw
if [ ! -d "NemoClaw" ]; then
  echo "📥 Cloning NVIDIA / NemoClaw..."
  git clone https://github.com/NVIDIA/NemoClaw.git
else
  echo "✅ NemoClaw directory already exists. Skipping."
fi

echo "======================================================================"
echo "🎉 ALL REFERENCE REPOSITORIES SECURED SUCCESSFULLY!"
echo "You can now inspect OpenSwarm, openclaw, and NemoClaw locally."
echo "======================================================================"
