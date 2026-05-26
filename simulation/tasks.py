import time
from celery_app import app
import random

@app.task(bind=True)
def scrape_intel_data(self, target_domain):
    """
    Simula la extracción de inteligencia OSINT (ej. radares, vuelos, cámaras)
    Esta tarea correrá en el background sin bloquear la API principal.
    """
    print(f"[OSINT-WORKER] Iniciando recolección de datos en: {target_domain}...")
    
    # Simula un retraso de red
    time.sleep(random.uniform(2.0, 5.0))
    
    # Simula recolección exitosa
    extracted_records = random.randint(50, 1500)
    
    print(f"[OSINT-WORKER] Finalizado. {extracted_records} registros extraídos de {target_domain}.")
    
    return {
        "status": "success",
        "domain": target_domain,
        "records_extracted": extracted_records,
        "timestamp": time.time()
    }
