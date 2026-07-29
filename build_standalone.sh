#!/bin/bash
# ==============================================================================
# Script de Compilación de Binario Autónomo (Standalone) - CívicaOS Engine Go
# Genera ejecutables nativos sin dependencias para Linux VPS, Windows y macOS.
# ==============================================================================

set -e

echo "=== Compilando CívicaOS Engine Go (Bare-Metal Standalone) ==="

mkdir -p engine-go/dist

cd engine-go

# 1. Compilación para Linux (VPS Ubuntu)
echo "Compilando binario para Linux (VPS)..."
GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o dist/civicaos-engine-linux-amd64 main.go || echo "Go no está instalado localmente, omitiendo compilación binaria inmediata."

# 2. Compilación para Windows (Cliente final 0 dependencias)
echo "Compilando binario para Windows (.exe)..."
GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -ldflags="-s -w" -o dist/civicaos-engine-windows-amd64.exe main.go || true

# 3. Compilación para macOS Apple Silicon
echo "Compilando binario para macOS (ARM64)..."
GOOS=darwin GOARCH=arm64 CGO_ENABLED=0 go build -ldflags="-s -w" -o dist/civicaos-engine-darwin-arm64 main.go || true

cd ..

echo "✅ Proceso de compilación standalone finalizado."
