# simulation/scrapers/webcams_mexico_scraper.py
# MDD / SDD: Scraper autónomo para Webcams de México (YouTube Streams)
# Todos los comentarios de código en español neutro premium.

import urllib.request
import re
import json
import os

def scrape_mexico_webcams():
    url = 'https://www.youtube.com/@webcamsdemexico/streams'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    
    print("[WebcamsMexico-Scraper] Iniciando extracción de transmisiones de Webcams de México...")
    try:
        with urllib.request.urlopen(req, timeout=12) as response:
            html = response.read().decode('utf-8')
            
        idx = html.find('var ytInitialData = ')
        if idx == -1:
            print("[WebcamsMexico-Scraper] Error: No se encontró ytInitialData en el HTML de YouTube.")
            return False
            
        json_start = idx + len('var ytInitialData = ')
        open_braces = 0
        json_str = ''
        for i in range(json_start, len(html)):
            char = html[i]
            if char == '{':
                open_braces += 1
            elif char == '}':
                open_braces -= 1
                if open_braces == 0:
                    json_str = html[json_start:i+1]
                    break
                    
        data = json.loads(json_str)
        renderers = []
        
        # Búsqueda recursiva de lockupViewModel en la estructura de ytInitialData
        def search_dict(d):
            if isinstance(d, dict):
                if 'lockupViewModel' in d:
                    renderers.append(d['lockupViewModel'])
                for k, v in d.items():
                    search_dict(v)
            elif isinstance(d, list):
                for item in d:
                    search_dict(item)
                    
        search_dict(data)
        
        cams = []
        seen_vids = set()
        
        # Coordenadas aproximadas para los lugares más comunes que transmite Webcams de México
        coords_map = {
            "zócalo": (19.4326, -99.1332),
            "zocalo": (19.4326, -99.1332),
            "popocatépetl": (19.0224, -98.6278),
            "popocatepetl": (19.0224, -98.6278),
            "monterrey": (25.6866, -100.3161),
            "guadalajara": (20.6597, -103.3496),
            "puerto vallarta": (20.6534, -105.2253),
            "cabo san lucas": (22.8905, -109.9167),
            "cancún": (21.1619, -86.8515),
            "cancun": (21.1619, -86.8515),
            "mazatlán": (23.2494, -106.4111),
            "mazatlan": (23.2494, -106.4111),
            "acapulco": (16.8531, -99.8237),
            "tijuana": (32.5149, -117.0382),
            "veracruz": (19.1738, -96.1342),
            "puebla": (19.0413, -98.2062),
            "san miguel de allende": (20.9137, -100.7436),
            "colima": (19.2433, -103.7256),
            "ixtapa": (17.6685, -101.6025),
            "cozumel": (20.4230, -86.9223)
        }
        
        for r in renderers:
            try:
                vid = r.get('contentId')
                title_obj = r.get('metadata', {}).get('lockupMetadataViewModel', {}).get('title', {})
                title = title_obj.get('content', '')
                
                if vid and title and vid not in seen_vids:
                    seen_vids.add(vid)
                    
                    # Determinar coordenadas aproximadas basándose en el título
                    lat, lng = 19.4326, -99.1332 # CDMX por defecto
                    matched_city = "México"
                    
                    title_lower = title.lower()
                    for city, coords in coords_map.items():
                        if city in title_lower:
                            lat, lng = coords
                            matched_city = city.title()
                            break
                            
                    cams.append({
                        "id": f"mex-{vid}",
                        "name": title.split(" | ")[0].split(" - ")[0][:100],
                        "lat": lat,
                        "lng": lng,
                        "city": matched_city,
                        "stream_url": f"https://www.youtube.com/embed/{vid}?autoplay=1&mute=1",
                        "status": "live",
                        "source": "Webcams de México",
                        "viewers": 1500 # Valor estimado simulado
                    })
            except Exception as e:
                print(f"[WebcamsMexico-Scraper] Error parseando renderer: {e}")
                continue
                
        # Guardar en la ruta de datos del frontend
        output_path = '/Volumes/SSD1TB/plataforma/src/data/mexico_webcams.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(cams, f, indent=2, ensure_ascii=False)
            
        print(f"[WebcamsMexico-Scraper] Éxito. Guardadas {len(cams)} cámaras activas en {output_path}")
        return True
        
    except Exception as e:
        print(f"[WebcamsMexico-Scraper] Error crítico durante el scraping: {e}")
        return False

if __name__ == "__main__":
    scrape_mexico_webcams()
