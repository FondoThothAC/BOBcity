@echo off
:: start_services.bat - Levantar todos los servicios locales en Windows
:: SDD / ADD: Zero-Trust Local Orchestrator launcher for Windows

title Ecosistema Local CivicPulse / CivicaOS

echo ========================================================
echo === Iniciando Ecosistema Local CivicPulse / CivicaOS ===
echo ========================================================
echo.

:: 1. Verificar dependencias
echo [1/4] Verificando dependencias locales...
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Python no esta instalado. Instala Python 3 para correr el simulador ABM.
    pause
    exit /b 1
)
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js/npm no esta instalado. Instala Node.js para el panel frontend.
    pause
    exit /b 1
)
echo.

:: 2. Levantar el Motor de Simulación (Python)
echo [2/4] Iniciando Servidor de Simulación Matematica (Port 5001)...
cd simulation
start /B python api_server.py > ..\simulation_server.log 2>&1
cd ..
echo ✅ Servidor de Simulacion iniciado en segundo plano.
echo.

:: 3. Levantar el Servidor de Desarrollo React (Vite)
echo [3/4] Iniciando Servidor Frontend React/Vite (Port 3335)...
start /B npm run dev > vite_server.log 2>&1
echo ✅ Servidor Frontend iniciado en segundo plano.
echo.

:: 4. Instrucción de Modelos IA en Ollama
echo [4/4] Directiva de Modelos de Inteligencia Artificial (Ollama):
echo    Para cargar y actualizar los modelos locales, abre una consola de comandos y corre:
echo    👉 ollama pull qwen2.5:14b   (Modelo de lenguaje recomendado para Hermosillo)
echo    👉 ollama pull llama3:8b      (Modelo secundario de velocidad)
echo.
echo ========================================================
echo 🚀 ¡Todos los servicios han sido levantados!
echo    👉 Acceso al Panel Frontend: http://localhost:3335
echo    👉 Acceso al Motor Python:   http://localhost:5001
echo ========================================================
echo.
echo Deja esta ventana abierta. Presiona [Ctrl+C] dos veces para apagar todos los servicios.
echo.

:: Keep script alive and print simulation logs
tail -f simulation_server.log 2>nul || powershell -Command "Get-Content -Path 'simulation_server.log' -Wait"
