# simulation/scrapers/osint_harvester_agent.py
# MDD / SDD: Autonomous OSINT Harvester Agent

import os
import json
import time
from datetime import datetime
from macro_events_ingestor import get_latest_macro_events

VAULT_DIR = "/Volumes/SSD1TB/plataforma/civicaos-vault"
PROCESSED_EVENTS_LOG = os.path.join(VAULT_DIR, ".processed_events.json")

def ensure_vault():
    os.makedirs(os.path.join(VAULT_DIR, "entities"), exist_ok=True)
    os.makedirs(os.path.join(VAULT_DIR, "sources"), exist_ok=True)
    if not os.path.exists(PROCESSED_EVENTS_LOG):
        with open(PROCESSED_EVENTS_LOG, "w") as f:
            json.dump([], f)

def get_processed_events():
    with open(PROCESSED_EVENTS_LOG, "r") as f:
        return json.load(f)

def mark_as_processed(event_id):
    processed = get_processed_events()
    processed.append(event_id)
    with open(PROCESSED_EVENTS_LOG, "w") as f:
        json.dump(processed, f)

def simulate_osint_tools(event):
    """
    Simula la ejecución de herramientas como Sherlock, theHarvester y GHunt
    para extraer entidades relevantes (empresas, políticos) de una noticia.
    """
    print(f"[OSINT Agent] Analizando evento: {event['title']}")
    
    # Simulación de extracción de entidades basada en la categoría
    entity = {
        "name": "Sujeto Desconocido",
        "type": "entity_profile",
        "tags": ["osint", event["category"].lower()],
        "sherlock_hits": [],
        "emails_leaked": 0
    }
    
    if "Tecnolog" in event["category"] or "semiconductor" in event["title"].lower():
        entity["name"] = "TechCorp Global"
        entity["sherlock_hits"] = ["github/techcorpglobal", "twitter/techcorp"]
        entity["emails_leaked"] = 14
    elif "reforma" in event["title"].lower() or "polític" in event["category"].lower():
        entity["name"] = "Congreso Local"
        entity["sherlock_hits"] = ["facebook/congreso", "instagram/congreso_oficial"]
        entity["emails_leaked"] = 3
    elif "gasolina" in event["title"].lower() or "escasez" in event["title"].lower():
        entity["name"] = "Sindicato de Transportistas"
        entity["sherlock_hits"] = ["twitter/sindicato_transporte"]
        entity["emails_leaked"] = 45
    else:
        entity["name"] = "Organización Observada"
        entity["sherlock_hits"] = ["linkedin/org_observada"]
        
    return entity

def generate_markdown_note(event, entity):
    """
    Genera un archivo Markdown en formato Obsidian con frontmatter YAML.
    """
    date_str = datetime.now().strftime("%Y-%m-%d")
    safe_name = entity["name"].lower().replace(" ", "_")
    filename = f"{safe_name}.md"
    filepath = os.path.join(VAULT_DIR, "entities", filename)
    
    frontmatter = f"""---
created: {date_str}
type: {entity["type"]}
status: active
confidence: 0.85
tags: {json.dumps(entity["tags"])}
source_event_id: {event["id"]}
---"""

    content = f"""{frontmatter}

# Perfil de Inteligencia: {entity["name"]}

Este documento fue generado automáticamente por el **Agente Recolector OSINT**, disparado por la detección de un evento macro de categoría '{event["category"]}'.

## 📡 Evento Detonante
- **Titular:** {event["title"]}
- **Fuente:** {event["source"]}
- **Impacto Calculado:** {event["impact_score"]:.2f}

## 🔍 Resultados de OSINT Pipeline

### 👤 Sherlock (Redes Sociales)
Se ejecutó `sherlock {safe_name}` detectando presencia en las siguientes redes:
{chr(10).join(['- ' + hit for hit in entity["sherlock_hits"]])}

### 📧 theHarvester (Fugas de Correo)
Se ejecutó `theHarvester -d {safe_name}.com -b all`.
- **Correos expuestos en la Dark Web / Brechas:** {entity["emails_leaked"]} cuentas encontradas.

## 🤖 Análisis Táctico
El modelo predice que las acciones de **{entity["name"]}** madurarán en un lapso de **{event["eta_months"]} meses**. Su huella digital sugiere actividad reciente que se correlaciona con la anomalía detectada.

*Se recomienda que el Orquestador despliegue agentes de interacción (GHunt/Social) para profundizar en las quejas públicas de esta entidad.*
"""
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
        
    print(f"[OSINT Agent] Nota de inteligencia creada: {filepath}")

def run_harvest():
    ensure_vault()
    events = get_latest_macro_events()
    processed = get_processed_events()
    
    harvested_count = 0
    for evt in events:
        if evt["id"] not in processed:
            # 1. Simular la extracción de inteligencia usando herramientas locales
            entity = simulate_osint_tools(evt)
            # 2. Redactar y guardar la nota Markdown
            generate_markdown_note(evt, entity)
            # 3. Marcar como procesado
            mark_as_processed(evt["id"])
            harvested_count += 1
            
    if harvested_count > 0:
        print(f"[OSINT Agent] Recolección completada. {harvested_count} notas generadas en el Vault.")
    else:
        print("[OSINT Agent] Ningún evento nuevo para cazar.")

if __name__ == "__main__":
    run_harvest()
