# simulation/tests/test_webcams.py
# MDD / TDD: Script de verificación y test para las webcams scrapeadas de México
# Todos los comentarios de código en español neutro premium.

import json
import urllib.request
import urllib.error
import re
import sys

def test_webcams_availability():
    json_path = '/Volumes/SSD1TB/plataforma/src/data/mexico_webcams.json'
    
    if not json_path:
        print("[TEST ERROR] La ruta del JSON no está definida.")
        sys.exit(1)
        
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            cams = json.load(f)
    except FileNotFoundError:
        print(f"[TEST ERROR] No se encontró el archivo de cámaras en: {json_path}")
        sys.exit(1)
        
    print(f"=== Iniciando Test de Disponibilidad para {len(cams)} cámaras ===")
    
    invalid_cams = []
    valid_count = 0
    
    # Probar un subconjunto o todas las cámaras para verificar su estado en YouTube
    for idx, cam in enumerate(cams):
        vid_id = cam['id'].replace('mex-', '')
        embed_url = f"https://www.youtube.com/embed/{vid_id}"
        
        req = urllib.request.Request(embed_url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                html = response.read().decode('utf-8')
                
                # YouTube coloca ciertas variables cuando el video es inválido o se ha eliminado
                # Buscamos cadenas como 'UNPLAYABLE' o 'video no disponible'
                is_available = True
                if "UNPLAYABLE" in html or "Video no disponible" in html or "isPlayable\":false" in html:
                    is_available = False
                    
                if is_available:
                    print(f"  [✓] Cámara {idx+1}/{len(cams)}: {cam['name']} (ID: {vid_id}) - DISPONIBLE")
                    valid_count += 1
                else:
                    print(f"  [✗] Cámara {idx+1}/{len(cams)}: {cam['name']} (ID: {vid_id}) - FUERA DE SERVICIO (DRM/Baja)")
                    invalid_cams.append(cam)
        except urllib.error.URLError as e:
            print(f"  [✗] Cámara {idx+1}/{len(cams)}: {cam['name']} (ID: {vid_id}) - ERROR DE RED ({e.reason})")
            invalid_cams.append(cam)
        except Exception as e:
            print(f"  [✗] Cámara {idx+1}/{len(cams)}: {cam['name']} (ID: {vid_id}) - ERROR ({str(e)})")
            invalid_cams.append(cam)

    print("\n=== RESUMEN DEL TEST ===")
    print(f"  Cámaras Válidas: {valid_count}")
    print(f"  Cámaras Inválidas/Offline: {len(invalid_cams)}")
    
    # Si hay cámaras inválidas, eliminarlas del archivo json para limpiar el feed de CívicaOS
    if invalid_cams:
        print("\n🧹 Limpiando cámaras inválidas del catálogo de CívicaOS...")
        cleaned_cams = [c for c in cams if c not in invalid_cams]
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(cleaned_cams, f, indent=2, ensure_ascii=False)
        print(f"  Catálogo actualizado con {len(cleaned_cams)} cámaras limpias y verificadas.")
        
    return len(invalid_cams) == 0

if __name__ == "__main__":
    success = test_webcams_availability()
    sys.exit(0 if success else 1)
