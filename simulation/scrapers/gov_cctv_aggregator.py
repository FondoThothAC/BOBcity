#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
CívicaOS - Government CCTV Aggregator
Este script extrae feeds en vivo de cámaras de tráfico públicas (Open Data)
de diversas entidades gubernamentales internacionales (ej. TfL Londres)
y estandariza los resultados al formato requerido por UnifiedCommandCenter.
"""

import json
import os
import aiohttp
import asyncio
import random
from pathlib import Path

# Configuración de Rutas
BASE_DIR = Path(__file__).resolve().parent.parent.parent
OUTPUT_FILE = BASE_DIR / "src" / "data" / "gov_webcams.json"

async def fetch_tfl_jamcams(session):
    """
    Extrae las cámaras públicas de tráfico de Londres (TfL).
    Normalmente provee cerca de 900+ cámaras en vivo (archivos MP4 que se actualizan).
    """
    print("🌍 Extrayendo cámaras de TfL (Transport for London)...")
    url = "https://api.tfl.gov.uk/Place/Type/JamCam"
    cameras = []
    
    try:
        async with session.get(url, timeout=15) as response:
            if response.status == 200:
                data = await response.json()
                for item in data:
                    lat = item.get("lat")
                    lng = item.get("lon")
                    name = item.get("commonName", "TfL CCTV")
                    
                    # Extraer videoUrl de las propiedades adicionales
                    video_url = None
                    for prop in item.get("additionalProperties", []):
                        if prop.get("key") == "videoUrl":
                            video_url = prop.get("value")
                            break
                    
                    if lat and lng and video_url:
                        cameras.append({
                            "id": f"tfl_{item.get('id', random.randint(1000, 99999))}",
                            "name": f"LND - {name}",
                            "city": "London",
                            "country": "UK",
                            "lat": lat,
                            "lng": lng,
                            "stream_url": video_url,
                            "viewers": random.randint(15, 300),
                            "source": "TfL Open Data API"
                        })
                print(f"✅ TfL: {len(cameras)} cámaras obtenidas con éxito.")
            else:
                print(f"❌ Error al consultar TfL. Código HTTP: {response.status}")
    except Exception as e:
        print(f"❌ Excepción en scraper de TfL: {e}")
        
    return cameras

async def main():
    print("🚀 Iniciando Motor de Agregación de Cámaras Gubernamentales...")
    all_cameras = []
    
    async with aiohttp.ClientSession() as session:
        # Aquí se pueden encadenar más funciones asíncronas para NYC DOT, Caltrans, etc.
        tfl_cams = await fetch_tfl_jamcams(session)
        all_cameras.extend(tfl_cams)
        
    print(f"📊 Total de cámaras globales recolectadas: {len(all_cameras)}")
    
    # Asegurar que el directorio exista
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    
    # Escribir el JSON de salida
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_cameras, f, indent=2, ensure_ascii=False)
        
    print(f"💾 Archivo guardado exitosamente en: {OUTPUT_FILE}")

if __name__ == "__main__":
    asyncio.run(main())
