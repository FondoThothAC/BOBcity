# simulation/gds_micro_agent.py
# MDD / PDD: WorldBox-style multi-dimensional dynamic simulation backend

import urllib.request
import urllib.error
import json
from typing import Dict, Any

OLLAMA_API_URL = "http://localhost:11434/api/chat"

def get_system_prompt(temp: int, agua: int, subsidio: float, prev_state: Dict[str, Any]) -> str:
    """Generates a structured system prompt for SLMs to evolve the world state."""
    return f"""Eres el motor de evolución temporal GDS-Micro (Estilo WorldBox) para la simulación cívica de Hermosillo, Sonora.
Tu función es calcular el estado de 5 dimensiones sociales para el SIGUIENTE mes a partir del estado anterior y las variables del entorno actuales.

Variables de control del entorno actuales:
- Temperatura: {temp}°C (Ola de calor severa si > 40°C)
- Presión de agua: {agua}% (Crisis hídrica si < 50%)
- Subsidio de luz CFE: {subsidio}$/kWh (Déficit si < 1.40)

Estado del mes anterior:
- Economía: {prev_state.get('economia', 60)}%
- Educación: {prev_state.get('educacion', 65)}%
- Seguridad: {prev_state.get('seguridad', 70)}%
- Salud: {prev_state.get('salud', 65)}%
- Preferencia Electoral: {prev_state.get('voto', 'Morena')}

INSTRUCCIONES DE DISEÑO:
1. Las dimensiones deben evolucionar de forma coherente. Si la temperatura es extrema (45°C) y no hay agua, la Salud decae drásticamente y la Seguridad (violencia) empeora (baja el porcentaje de Seguridad).
2. La Economía se ve afectada por el costo de luz si el subsidio es deficiente.
3. La Educación crece lentamente (+1% o +2%) si la Seguridad es alta (>70%) y el clima es templado, pero decae si hay crisis.
4. Redacta una "cronica" de una sola frase corta en español con acento norteño/sonorense que describa el evento más importante de este mes.

Devuelve ÚNICAMENTE un objeto JSON válido con este formato exacto, sin markdown ni explicaciones:
{{
  "economia": (1-100),
  "educacion": (1-100),
  "seguridad": (1-100),
  "salud": (1-100),
  "voto": "Morena" o "Oposición",
  "cronica": "Breve frase sonorense descriptiva del mes."
}}
"""

def get_heuristic_fallback(temp: int, agua: int, subsidio: float, prev_state: Dict[str, Any]) -> Dict[str, Any]:
    """Mathematical simulation coupling for non-linear feedback loop fallback."""
    # Read previous states
    eco = prev_state.get('economia', 60)
    edu = prev_state.get('educacion', 65)
    seg = prev_state.get('seguridad', 70)
    sal = prev_state.get('salud', 65)
    
    # 1. Calculate environmental factors
    heat_stress = max(0, temp - 38)
    water_deficit = max(0, 50 - agua)
    subsidy_deficit = max(0, 1.40 - subsidio)
    
    # 2. Evolve dimensions
    # Economy
    eco_delta = - (heat_stress * 0.8) - (subsidy_deficit * 18) + (subsidio > 1.80 and 5 or 0)
    eco = max(10, min(99, int(eco + eco_delta)))
    
    # Health
    sal_delta = - (heat_stress * 1.5) - (water_deficit * 0.6)
    sal = max(10, min(99, int(sal + sal_delta)))
    
    # Security (Violencia)
    # Strong non-linear coupling: drops heavily if health or economy are critically low
    seg_delta = - (water_deficit * 0.5)
    if sal < 40:
        seg_delta -= 6
    if eco < 40:
        seg_delta -= 5
    seg = max(5, min(99, int(seg + seg_delta)))
    
    # Education
    # Gradual increase if stable and safe, otherwise decays
    if seg > 65 and temp < 40 and agua > 60:
        edu_delta = 1.5
    else:
        edu_delta = - (heat_stress * 0.3) - (seg < 50 and 2 or 0)
    edu = max(10, min(99, int(edu + edu_delta)))
    
    # 3. Determine overall happiness and electoral preference
    overall_bienestar = int((eco + edu + seg + sal) / 4)
    voto = "Morena" if overall_bienestar > 50 else "Oposición"
    
    # 4. Generate chronic narrative event based on critical threshold
    if heat_stress > 5 and seg < 55:
        cronica = f"¡Qué calorón de {temp}°C! La escasez desató disturbios en Palo Verde, la seguridad está de la patada."
    elif water_deficit > 15:
        cronica = "El tandeo de agua no da abasto, los tinacos están secos y la gente ya anda muy inquieta."
    elif subsidy_deficit > 0.3:
        cronica = "Con este recibo de luz tan caro por la falta de subsidio, la economía familiar anda tronada."
    elif temp > 43:
        cronica = f"Pico de calor extremo de {temp}°C a la sombra. Los hospitales reportan golpes de calor por doquier."
    elif eco > 75 and seg > 75:
        cronica = "Se respira tranquilidad por Hermosillo, con buena economía y las calles tranquilas."
    else:
        cronica = "Ahí va el mes pasando con el calor norteño de siempre, la gente resistiendo con temple."
        
    return {
        "economia": eco,
        "educacion": edu,
        "seguridad": seg,
        "salud": sal,
        "voto": voto,
        "cronica": cronica,
        "fallback": True
    }

def run_micro_simulation(model_name: str, temp: int, agua: int, subsidio: float, prev_state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates the next step in the WorldBox sandbox using Ollama or fallback.
    """
    system_prompt = get_system_prompt(temp, agua, subsidio, prev_state)
    
    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Genera el siguiente paso de evolución en JSON."}
        ],
        "options": {
            "temperature": 0.2,
            "top_p": 0.95
        },
        "stream": False
    }
    
    try:
        req = urllib.request.Request(
            OLLAMA_API_URL,
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            content = res_data["message"]["content"].strip()
            
            # Extract JSON block if model wrapped it
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            parsed = json.loads(content)
            
            return {
                "economia": int(parsed.get("economia", 50)),
                "educacion": int(parsed.get("educacion", 50)),
                "seguridad": int(parsed.get("seguridad", 50)),
                "salud": int(parsed.get("salud", 50)),
                "voto": str(parsed.get("voto", "Oposición")),
                "cronica": str(parsed.get("cronica", "Evolución registrada.")),
                "fallback": False
            }
            
    except Exception as e:
        print(f"⚠️ [WorldBox Heuristic Fallback]: Ollama or parsing exception: {str(e)}")
        return get_heuristic_fallback(temp, agua, subsidio, prev_state)
