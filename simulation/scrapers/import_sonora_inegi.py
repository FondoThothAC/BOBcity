#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# simulation/scrapers/import_sonora_inegi.py
# MDD / PDD: Ingesta de datos reales del INEGI para el Estado de Sonora (Hermosillo)

import os
import csv
import urllib.request
import zipfile
import psycopg2
from psycopg2.extras import execute_values
import sys
import time
import shutil

# Configuración
DB_NAME = "civicaos"
DB_USER = "robertoeduardocelisrobles"
DB_HOST = "localhost"
STATE_CODE = "26" # Sonora

BASE_DIR = "/Volumes/SSD1TB/plataforma/data_lake/raw/inegi_sonora"
URL_DENUE = f"https://www.inegi.org.mx/contenidos/masiva/denue/denue_{STATE_CODE}_csv.zip"
URL_CENSO = f"https://www.inegi.org.mx/contenidos/programas/ccpv/2020/datosabiertos/ageb_manzana/ageb_mza_urbana_{STATE_CODE}_cpv2020_csv.zip"

def conectar_db():
    return psycopg2.connect(dbname=DB_NAME, user=DB_USER, host=DB_HOST)

def reportar_progreso(block_num, block_size, total_size):
    read_so_far = block_num * block_size
    if total_size > 0:
        percent = min(100, (read_so_far * 100) // total_size)
        sys.stdout.write(f"\r      ⚡ Descargando: {percent}% ({read_so_far // 1024} KB de {total_size // 1024} KB)")
        sys.stdout.flush()
    else:
        sys.stdout.write(f"\r      ⚡ Descargando: {read_so_far // 1024} KB...")
        sys.stdout.flush()

def descargar_url(url, dest_path):
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response, open(dest_path, 'wb') as out_file:
            total_size = int(response.info().get('Content-Length', 0))
            block_size = 1024 * 16
            block_num = 0
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                out_file.write(buffer)
                block_num += 1
                reportar_progreso(block_num, block_size, total_size)
        print(f"\n      ✅ Descarga completada.")
        return True
    except Exception as e:
        print(f"\n      ❌ Error al descargar: {e}")
        return False

def extraer_zip(zip_path, extract_to):
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        print(f"      ✅ Extracción completada.")
        return True
    except Exception as e:
        print(f"      ❌ Error al extraer: {e}")
        return False

def limpiar_float(val):
    if not val:
        return 0.0
    val_str = str(val).strip()
    if val_str in ('*', 'N/D', 'N.D.', ''):
        return 0.0
    try:
        return float(val_str)
    except ValueError:
        return 0.0

def limpiar_entero(val):
    if not val:
        return 0
    val_str = str(val).strip()
    if val_str in ('*', 'N/D', 'N.D.', ''):
        return 0
    try:
        return int(float(val_str))
    except ValueError:
        return 0

def importar_denue(cur, path_csv):
    print("   🐘 Importando establecimientos del DENUE a PostGIS...")
    valores = []
    batch_size = 3000
    insertados = 0
    
    with open(path_csv, 'r', encoding='latin-1') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                id_estab = row.get('id')
                nombre = row.get('nom_estab', '')[:255]
                razon = row.get('raz_social', '')[:255]
                clase = row.get('codigo_act', '')[:10]
                estrato = row.get('per_ocu', '')[:100]
                calle = row.get('nom_vial', '')[:255]
                colonia = row.get('nomb_asent', '')[:255]
                cp = row.get('cod_postal', '')[:10]
                estado = str(row.get('cve_ent', '')).zfill(2)
                municipio = str(row.get('cve_mun', '')).zfill(3)
                ageb = str(row.get('ageb', '')).strip()[:10]
                
                lat = limpiar_float(row.get('latitud'))
                lon = limpiar_float(row.get('longitud'))

                if lat == 0.0 or lon == 0.0 or not estado:
                    continue

                valores.append((
                    id_estab, nombre, razon, clase, estrato,
                    calle, colonia, cp, estado, municipio, ageb, lat, lon
                ))
            except Exception:
                continue

            if len(valores) >= batch_size:
                insertar_lote_denue(cur, valores)
                insertados += len(valores)
                valores = []

        if valores:
            insertar_lote_denue(cur, valores)
            insertados += len(valores)
            
    return insertados

def insertar_lote_denue(cur, valores):
    template = "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))"
    valores_formateados = [v + (v[12], v[11]) for v in valores]
    execute_values(
        cur,
        "INSERT INTO inegi_denue (id_establecimiento, nombre, razon_social, clase_actividad, estrato_personal, calle, colonia, codigo_postal, estado, municipio, ageb, latitud, longitud, geom) VALUES %s ON CONFLICT (id_establecimiento) DO NOTHING",
        valores_formateados,
        template=template,
        page_size=len(valores)
    )

def importar_censo(cur, path_csv):
    print("   🐘 Importando demografía del Censo a PostgreSQL...")
    valores = []
    batch_size = 1000
    insertados = 0

    with open(path_csv, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                entidad = str(row.get('ENTIDAD', '')).zfill(2)
                mun = str(row.get('MUN', '')).zfill(3)
                loc = str(row.get('LOC', '')).zfill(4)
                ageb = str(row.get('AGEB', '')).zfill(4)
                mza = str(row.get('MZA', '')).zfill(3)

                if mza != '000' or ageb == '0000' or loc == '0000' or not entidad:
                    continue

                clave_ageb = f"{entidad}{mun}{loc}{ageb}"
                
                pobtot = limpiar_entero(row.get('POBTOT'))
                pobmas = limpiar_entero(row.get('POBMAS'))
                pobfem = limpiar_entero(row.get('POBFEM'))
                pob18 = limpiar_entero(row.get('P_18YMAS'))
                pea = limpiar_entero(row.get('PEA'))
                discapacidad = limpiar_entero(row.get('PCON_DISC'))
                escolaridad = limpiar_float(row.get('GRAPROES'))
                viviendas = limpiar_entero(row.get('TVIVHAB'))

                valores.append((
                    clave_ageb, entidad, mun, loc, ageb,
                    pobtot, pobmas, pobfem, pob18, pea, discapacidad, escolaridad, viviendas
                ))
            except Exception:
                continue

            if len(valores) >= batch_size:
                insertar_lote_censo(cur, valores)
                insertados += len(valores)
                valores = []

        if valores:
            insertar_lote_censo(cur, valores)
            insertados += len(valores)
            
    return insertados

def insertar_lote_censo(cur, valores):
    execute_values(
        cur,
        "INSERT INTO inegi_censo_demografia (clave_ageb, estado, municipio, localidad, ageb, poblacion_total, poblacion_masculina, poblacion_femenina, poblacion_18_mas, poblacion_economicamente_activa, poblacion_discapacidad, promedio_escolaridad, total_viviendas_habitadas) VALUES %s ON CONFLICT (clave_ageb) DO NOTHING",
        valores,
        page_size=len(valores)
    )

def main():
    print("=== CívicaOS: Pipeline de Ingesta Sonora (INEGI) ===")
    print(f"📁 Carpeta temporal: {BASE_DIR}")
    
    os.makedirs(BASE_DIR, exist_ok=True)
    zip_denue = os.path.join(BASE_DIR, "denue.zip")
    zip_censo = os.path.join(BASE_DIR, "censo.zip")

    try:
        conn = conectar_db()
        print("🐘 Conectado con éxito a PostgreSQL.")
    except Exception as e:
        print(f"❌ Error al conectar a la base de datos: {e}")
        return

    # Descargar DENUE
    print("\n🌐 Descargando DENUE de Sonora desde INEGI...")
    if descargar_url(URL_DENUE, zip_denue):
        print("📦 Extrayendo archivos...")
        if extraer_zip(zip_denue, BASE_DIR):
            csv_path = None
            conjunto_path = os.path.join(BASE_DIR, "conjunto_de_datos")
            if os.path.exists(conjunto_path):
                for file in os.listdir(conjunto_path):
                    if file.endswith(".csv"):
                        csv_path = os.path.join(conjunto_path, file)
                        break
            if not csv_path:
                for root, dirs, files in os.walk(BASE_DIR):
                    for file in files:
                        if file.endswith(".csv") and "denue" in file.lower():
                            csv_path = os.path.join(root, file)
                            break
            
            if csv_path:
                with conn.cursor() as cur:
                    # Limpiar previos de Sonora
                    cur.execute("DELETE FROM inegi_denue WHERE estado = %s", (STATE_CODE,))
                    n_inserted = importar_denue(cur, csv_path)
                    conn.commit()
                    print(f"✅ Se importaron {n_inserted} establecimientos comerciales reales de Sonora.")
            else:
                print("❌ No se encontró el CSV del DENUE.")

    # Descargar Censo
    print("\n🌐 Descargando Censo 2020 por AGEB de Sonora desde INEGI...")
    if descargar_url(URL_CENSO, zip_censo):
        print("📦 Extrayendo archivos...")
        if extraer_zip(zip_censo, BASE_DIR):
            csv_path = None
            for root, dirs, files in os.walk(BASE_DIR):
                for file in files:
                    if file.endswith(".csv") and "ageb_urbana" in file.lower():
                        csv_path = os.path.join(root, file)
                        break
            
            if csv_path:
                with conn.cursor() as cur:
                    # Limpiar previos de Sonora
                    cur.execute("DELETE FROM inegi_censo_demografia WHERE estado = %s", (STATE_CODE,))
                    n_inserted = importar_censo(cur, csv_path)
                    conn.commit()
                    print(f"✅ Se importaron {n_inserted} registros de AGEBs urbanas de Sonora.")
            else:
                print("❌ No se encontró el CSV del Censo.")

    # Limpiar temporales
    print("\n🧹 Limpiando archivos temporales...")
    shutil.rmtree(BASE_DIR)
    conn.close()
    print("🎉 ¡Ingesta de datos de Sonora completada con éxito!")

if __name__ == "__main__":
    main()
