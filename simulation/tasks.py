import time
import json
import urllib.request
import urllib.error
import os
from celery_app import app

CACHE_FILE = os.path.join(os.path.dirname(__file__), 'osint_cache.json')

@app.task(bind=True)
def scrape_osint_earthquakes(self):
    """
    Tarea de Celery en background que extrae sismos en tiempo real del USGS
    y los guarda en osint_cache.json para que el API Server los lea instantáneamente.
    """
    target_domain = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson"
    print(f"[OSINT-BEAT] Extrayendo anomalías globales de: {target_domain}...")
    
    try:
        req = urllib.request.Request(target_domain, headers={'User-Agent': 'CivicaOS-Background-Worker/1.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            
        # Parse geojson features to Osiris satellite/anomaly format
        features = data.get('features', [])
        anomalies = []
        
        for f in features:
            coords = f['geometry']['coordinates'] # [longitude, latitude, depth]
            props = f['properties']
            
            anomalies.append({
                "lat": coords[1],
                "lng": coords[0],
                "alt": coords[2] / 1000.0 if len(coords) > 2 else 0.1, # depth mapped to alt
                "name": props.get('place', 'Anomalía Desconocida'),
                "magnitude": props.get('mag', 0),
                "type": "earthquake",
                "time": props.get('time', int(time.time()*1000))
            })
            
        # Write to local cache
        cache_data = {
            "timestamp": time.time(),
            "source": "USGS_Earthquakes",
            "count": len(anomalies),
            "data": anomalies
        }
        
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False)
            
        print(f"[OSINT-BEAT] Exito! {len(anomalies)} anomalías cacheadas localmente.")
        
        return {"status": "success", "count": len(anomalies)}
        
    except Exception as e:
        print(f"[OSINT-BEAT] ERROR falló la extracción: {str(e)}")
        return {"status": "error", "error": str(e)}

