#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
download_inegi_data.py — CívicaOS Engine
Automatiza la descarga y extracción de datos geoespaciales y demográficos del INEGI
para el estado de San Luis Potosí (Clave 24).
"""

import os
import urllib.request
import zipfile
import sys

# Configuración de rutas y URLs
DEST_DIR = "/Volumes/SSD1TB/plataforma/Datos/INEGI"
URL_DENUE = "https://www.inegi.org.mx/contenidos/masiva/denue/denue_24_csv.zip"
URL_CENSO = "https://www.inegi.org.mx/contenidos/programas/ccpv/2020/datosabiertos/ageb_manzana/ageb_mza_urbana_24_cpv2020_csv.zip"

def reportar_progreso(block_num, block_size, total_size):
    read_so_far = block_num * block_size
    if total_size > 0:
        percent = min(100, (read_so_far * 100) // total_size)
        sys.stdout.write(f"\r   ⚡ Descargando: {percent}% ({read_so_far // 1024} KB de {total_size // 1024} KB)")
        sys.stdout.flush()
    else:
        sys.stdout.write(f"\r   ⚡ Descargando: {read_so_far // 1024} KB...")
        sys.stdout.flush()

def descargar_y_extraer(url, nombre_zip):
    print(f"\n🌐 Descargando desde: {url}")
    zip_path = os.path.join(DEST_DIR, nombre_zip)
    
    # Descargar archivo
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response, open(zip_path, 'wb') as out_file:
            total_size = int(response.info().get('Content-Length', 0))
            block_size = 1024 * 8
            block_num = 0
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                out_file.write(buffer)
                block_num += 1
                reportar_progreso(block_num, block_size, total_size)
        print(f"\n✅ Descarga completada: {nombre_zip}")
    except Exception as e:
        print(f"\n❌ Error al descargar {nombre_zip}: {e}")
        return False

    # Extraer archivo
    print(f"📦 Extrayendo {nombre_zip}...")
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(DEST_DIR)
        print(f"✅ Extracción exitosa en: {DEST_DIR}")
        os.remove(zip_path) # Eliminar zip para liberar espacio
        return True
    except Exception as e:
        print(f"❌ Error al extraer {nombre_zip}: {e}")
        return False

def main():
    print("=== CívicaOS INEGI Data Downloader ===")
    print(f"Directorio de destino: {DEST_DIR}")
    
    if not os.path.exists(DEST_DIR):
        print(f"🛠️ Creando directorio de destino...")
        os.makedirs(DEST_DIR, exist_ok=True)
        
    # 1. Descargar DENUE
    descargar_y_extraer(URL_DENUE, "denue_24.zip")
    
    # 2. Descargar Censo
    descargar_y_extraer(URL_CENSO, "censo_24.zip")
    
    print("\n🚀 Proceso de obtención de datos del INEGI completado.")

if __name__ == "__main__":
    main()
