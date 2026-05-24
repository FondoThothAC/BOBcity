# simulation/gds_micro_agent.py
# MDD / ADD: Micro-scale cognitive simulation using Local SLMs (1B/2B parameters)

import urllib.request
import urllib.error
import json
from typing import Dict, Any

OLLAMA_API_URL = "http://localhost:11434/api/chat"

def get_system_prompt(temp: int, agua: int, subsidio: float) -> str:
    """Generates a structured, few-shot optimized system prompt for small models."""
    return f"""Eres el gemelo digital de un ciudadano sintético de Hermosillo, Sonora.
Analizas tu entorno y respondes estrictamente con un JSON estructurado.

Variables actuales del entorno:
- Temperatura: {temp}°C (Crítico si es mayor a 40°C)
- Presión de agua: {agua}% (Bajo si es menor a 50%)
- Subsidio de luz: {subsidio}$/kWh (Déficit si es menor a $1.40)

INSTRUCCIONES CRÍTICAS:
Responde ÚNICAMENTE con un objeto JSON válido con el siguiente formato exacto. No agregues introducciones, comentarios ni bloques de código markdown como ```json.

Formato JSON esperado:
{{
  "bienestar": 55,
  "opinion": "Frase corta y representativa en español sonorense con acento norteño",
  "voto": "Morena" o "Oposición"
}}

Ejemplos:
1. Si temp=45, agua=20, subsidio=0.90:
{{
  "bienestar": 15,
  "opinion": "¡Qué bárbaro con este calorón y sin gota de agua! Y el recibo de la luz va a llegar carísimo, oiga.",
  "voto": "Oposición"
}}

2. Si temp=28, agua=90, subsidio=2.00:
{{
  "bienestar": 85,
  "opinion": "Pues todo marcha a gusto por acá, con buena presión en la llave y fresco el clima.",
  "voto": "Morena"
}}
"""

def get_heuristic_fallback(temp: int, agua: int, subsidio: float) -> Dict[str, Any]:
    """Generates a smart, deterministic fallback when Ollama is offline."""
    # Basic math model (First principles)
    bienestar = 70
    
    # Heat stress
    if temp > 40:
        bienestar -= (temp - 40) * 4
    elif temp < 20:
        bienestar -= (20 - temp) * 1
        
    # Water stress
    if agua < 50:
        bienestar -= (50 - agua) * 0.8
        
    # Electricity subsidy
    if subsidio < 1.40:
        bienestar -= (1.40 - subsidio) * 20
        
    bienestar = max(5, min(95, int(bienestar)))
    
    # Determine vote based on bienestar
    voto = "Morena" if bienestar > 50 else "Oposición"
    
    # Generate sonorense opinion text based on variables
    if temp > 42 and agua < 40:
        opinion = f"¡No se puede vivir a {temp}°C sin agua en la llave! Es una reverenda burla por acá en el distrito."
    elif subsidio < 1.10:
        opinion = f"El subsidio de luz está por los suelos, nos va a comer vivos el recibo de la CFE este mes."
    elif bienestar > 75:
        opinion = "La verdad está muy tranquilo todo por acá, con buena agua y clima llevadero."
    else:
        opinion = "Ahí la llevamos pasándola con el calorón norteño, esperando que no se vaya la luz."
        
    return {
        "bienestar": bienestar,
        "opinion": opinion,
        "voto": voto,
        "fallback": True
    }

def run_micro_simulation(model_name: str, temp: int, agua: int, subsidio: float) -> Dict[str, Any]:
    """
    Calls local Ollama with a 1B/2B parameter model for fast cognitive inference.
    Falls back to a deterministic heuristic if Ollama is offline.
    """
    system_prompt = get_system_prompt(temp, agua, subsidio)
    
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Analiza tu situación actual en Hermosillo y responde en formato JSON."}
        ],
        "options": {
            "temperature": 0.3, # Low temperature to prevent hallucinations in small models
            "top_p": 0.9
        },
        "stream": False
    }
    
    try:
        req = urllib.request.Request(
            OLLAMA_API_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=8) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            content = res_data["message"]["content"].strip()
            
            # Clean content if the model wrapped it in markdown code blocks
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            # Attempt to parse the JSON output from the model
            parsed = json.loads(content)
            
            # Basic schema assurance
            return {
                "bienestar": int(parsed.get("bienestar", 50)),
                "opinion": str(parsed.get("opinion", "Ahí la llevamos.")),
                "voto": str(parsed.get("voto", "Oposición")),
                "fallback": False
            }
            
    except (urllib.error.URLError, json.JSONDecodeError, KeyError, ValueError, Exception) as e:
        # Fallback to local heuristic if Ollama offline, timeout, or model output invalid
        print(f"⚠️ [GDS-Micro Fallback Active]: Ollama offline or parse error: {str(e)}")
        return get_heuristic_fallback(temp, agua, subsidio)
