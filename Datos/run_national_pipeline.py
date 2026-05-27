#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
run_national_pipeline.py — CívicaOS Engine
Script orquestador para ejecutar la descarga, extracción, ingesta y limpieza secuencial
de los 32 estados de México del INEGI (DENUE y Censo 2020), manteniendo un bajo consumo de disco.
"""

import os
import urllib.request
import zipfile
import csv
import psycopg2
from psycopg2.extras import execute_values
import sys
import time
import shutil
import argparse

# Configuración de base de datos y directorios
DB_NAME = "civicaos"
DB_USER = "robertoeduardocelisrobles"
DB_HOST = "localhost"
BASE_DIR = "/Volumes/SSD1TB/plataforma/Datos/INEGI_Nacional"

# URLs de descarga del INEGI
URL_DENUE_TEMPLATE = "https://www.inegi.org.mx/contenidos/masiva/denue/denue_{state}_csv.zip"
URL_CENSO_TEMPLATE = "https://www.inegi.org.mx/contenidos/programas/ccpv/2020/datosabiertos/ageb_manzana/ageb_mza_urbana_{state}_cpv2020_csv.zip"

def reportar_progreso(block_num, block_size, total_size, ent):
    read_so_far = block_num * block_size
    if total_size > 0:
        percent = min(100, (read_so_far * 100) // total_size)
        sys.stdout.write(f"\r      ⚡ Descargando [{ent}]: {percent}% ({read_so_far // 1024} KB de {total_size // 1024} KB)")
        sys.stdout.flush()
    else:
        sys.stdout.write(f"\r      ⚡ Descargando [{ent}]: {read_so_far // 1024} KB...")
        sys.stdout.flush()

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

def descargar_url(url, dest_path, ent):
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
                reportar_progreso(block_num, block_size, total_size, ent)
        print(f"\n      ✅ Descarga completada.")
        return True
    except Exception as e:
        print(f"\n      ❌ Error al descargar: {e}")
        return False

def extraer_zip(zip_path, extract_to):
    try:
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_to)
        return True
    except Exception as e:
        print(f"      ❌ Error al extraer: {e}")
        return False

def importar_denue_state(cur, path_csv):
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

def _importar_censo_state_with_encoding(cur, path_csv, encoding):
    valores = []
    batch_size = 1000
    insertados = 0

    with open(path_csv, 'r', encoding=encoding) as f:
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

def importar_censo_state(cur, path_csv):
    try:
        return _importar_censo_state_with_encoding(cur, path_csv, 'utf-8-sig')
    except UnicodeDecodeError:
        print("      ⚠️ Error UTF-8. Reintentando con latin-1...")
        return _importar_censo_state_with_encoding(cur, path_csv, 'latin-1')

def insertar_lote_censo(cur, valores):
    execute_values(
        cur,
        "INSERT INTO inegi_censo_demografia (clave_ageb, estado, municipio, localidad, ageb, poblacion_total, poblacion_masculina, poblacion_femenina, poblacion_18_mas, poblacion_economicamente_activa, poblacion_discapacidad, promedio_escolaridad, total_viviendas_habitadas) VALUES %s ON CONFLICT (clave_ageb) DO NOTHING",
        valores,
        page_size=len(valores)
    )

def main():
    parser = argparse.ArgumentParser(description="Pipeline de Ingesta Nacional INEGI")
    parser.add_argument("--resume", action="store_true", help="Reanudar el proceso desde el último estado incompleto")
    parser.add_argument("--start-state", type=int, default=None, help="Estado inicial desde el cual comenzar (1-32)")
    parser.add_argument("--states", type=str, default=None, help="Lista de estados específicos a procesar (claves de 2 dígitos separadas por coma, ej: 24,26)")
    args = parser.parse_args()

    print("=== CívicaOS Engine: Pipeline de Ingesta Nacional INEGI ===")
    print(f"📁 Directorio de trabajo temporal: {BASE_DIR}")
    
    os.makedirs(BASE_DIR, exist_ok=True)
    
    try:
        conn = psycopg2.connect(dbname=DB_NAME, user=DB_USER, host=DB_HOST)
        conn.autocommit = False
        print("🐘 Conexión exitosa a PostgreSQL 17.")
    except Exception as e:
        print(f"❌ Error al conectar a la base de datos: {e}")
        return

    states_to_process = []
    
    # Determinar qué estados se procesarán
    if args.states:
        states_to_process = [s.strip().zfill(2) for s in args.states.split(',')]
        print(f"🎯 Estados objetivo especificados: {states_to_process}")
        
        # Limpiar datos previos únicamente para los estados especificados
        print(f"🧹 Limpiando registros previos para los estados especificados: {states_to_process}...")
        with conn.cursor() as cur:
            for s_str in states_to_process:
                cur.execute("DELETE FROM inegi_denue WHERE estado = %s", (s_str,))
                cur.execute("DELETE FROM inegi_censo_demografia WHERE estado = %s", (s_str,))
            conn.commit()
    elif args.resume or args.start_state is not None:
        start_state_num = 1
        if args.start_state is not None:
            if 1 <= args.start_state <= 32:
                start_state_num = args.start_state
                print(f"🔄 Se especificó iniciar desde el estado: {start_state_num:02d}")
            else:
                print("❌ El estado inicial debe estar entre 1 y 32.")
                conn.close()
                return
        else:
            # Auto-detectar primer estado incompleto
            print("🔍 Buscando el último estado procesado exitosamente...")
            with conn.cursor() as cur:
                first_incomplete = 1
                for s in range(1, 33):
                    s_str = f"{s:02d}"
                    cur.execute("SELECT count(*) FROM inegi_denue WHERE estado = %s", (s_str,))
                    count_denue = cur.fetchone()[0]
                    cur.execute("SELECT count(*) FROM inegi_censo_demografia WHERE estado = %s", (s_str,))
                    count_censo = cur.fetchone()[0]
                    if count_denue > 0 and count_censo > 0:
                        continue
                    else:
                        first_incomplete = s
                        break
                start_state_num = first_incomplete
            print(f"🔄 Auto-detección: Reanudando desde el estado: {start_state_num:02d}")

        # Limpiar datos parciales del estado de inicio si ya existen en la BD
        start_state_str = f"{start_state_num:02d}"
        print(f"🧹 Limpiando registros parciales de la entidad {start_state_str} en la base de datos...")
        with conn.cursor() as cur:
            cur.execute("DELETE FROM inegi_denue WHERE estado = %s", (start_state_str,))
            cur.execute("DELETE FROM inegi_censo_demografia WHERE estado = %s", (start_state_str,))
            conn.commit()
            
        states_to_process = [f"{s:02d}" for s in range(start_state_num, 33)]
    else:
        # Limpiar tablas a nivel nacional para arrancar fresco (comportamiento por defecto)
        print("\n🧹 Limpiando tablas de datos anteriores para ingesta nacional fresh...")
        with conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE inegi_denue CASCADE;")
            cur.execute("TRUNCATE TABLE inegi_censo_demografia CASCADE;")
            conn.commit()
        states_to_process = [f"{s:02d}" for s in range(1, 33)]

    # Calcular cuántos registros ya tenemos en total (para reportes acumulados)
    total_denue = 0
    total_censo = 0
    with conn.cursor() as cur:
        cur.execute("SELECT count(*) FROM inegi_denue;")
        total_denue = cur.fetchone()[0]
        cur.execute("SELECT count(*) FROM inegi_censo_demografia;")
        total_censo = cur.fetchone()[0]
        print(f"📊 Registros actuales en BD: DENUE: {total_denue}, Censo: {total_censo}")

    for state_str in states_to_process:
        print(f"\n==================================================")
        print(f"🚩 PROCESANDO ESTADO [{state_str}]...")
        print(f"==================================================")
        
        state_temp_dir = os.path.join(BASE_DIR, state_str)
        os.makedirs(state_temp_dir, exist_ok=True)
        
        # 1. Rutas de archivos
        zip_denue = os.path.join(state_temp_dir, "denue.zip")
        zip_censo = os.path.join(state_temp_dir, "censo.zip")
        
        # 2. Descargar DENUE
        url_denue = URL_DENUE_TEMPLATE.format(state=state_str)
        print(f"   📥 Descargando DENUE...")
        if descargar_url(url_denue, zip_denue, state_str):
            print(f"   📦 Extrayendo DENUE...")
            if extraer_zip(zip_denue, state_temp_dir):
                # Localizar archivo CSV extraído
                csv_path = None
                # DENUE extrae carpeta conjunto_de_datos con un CSV
                conjunto_path = os.path.join(state_temp_dir, "conjunto_de_datos")
                if os.path.exists(conjunto_path):
                    for file in os.listdir(conjunto_path):
                        if file.endswith(".csv"):
                            csv_path = os.path.join(conjunto_path, file)
                            break
                if not csv_path:
                    # Buscar recursivamente en el directorio extraído
                    for root, dirs, files in os.walk(state_temp_dir):
                        for file in files:
                            if file.endswith(".csv") and "denue" in file.lower():
                                csv_path = os.path.join(root, file)
                                break
                
                if csv_path:
                    print(f"   🐘 Insertando establecimientos del DENUE a PostGIS...")
                    with conn.cursor() as cur:
                        n_inserted = importar_denue_state(cur, csv_path)
                        conn.commit()
                        total_denue += n_inserted
                        print(f"   ✅ Se insertaron {n_inserted} comercios de la entidad {state_str}.")
                else:
                    print("   ⚠️ No se localizó el archivo CSV de DENUE extraído.")
        
        # 3. Descargar Censo 2020 AGEB
        url_censo = URL_CENSO_TEMPLATE.format(state=state_str)
        print(f"   📥 Descargando Censo...")
        if descargar_url(url_censo, zip_censo, state_str):
            print(f"   📦 Extrayendo Censo...")
            if extraer_zip(zip_censo, state_temp_dir):
                csv_path = None
                # El censo se extrae en una carpeta o directamente conjunto_de_datos_ageb...
                for root, dirs, files in os.walk(state_temp_dir):
                    for file in files:
                        if file.endswith(".csv") and "ageb_urbana" in file.lower():
                            csv_path = os.path.join(root, file)
                            break
                
                if csv_path:
                    print(f"   🐘 Insertando demografía del Censo a PostgreSQL...")
                    with conn.cursor() as cur:
                        n_inserted = importar_censo_state(cur, csv_path)
                        conn.commit()
                        total_censo += n_inserted
                        print(f"   ✅ Se insertaron {n_inserted} AGEBs de la entidad {state_str}.")
                else:
                    print("   ⚠️ No se localizó el archivo CSV del Censo extraído.")

        # 4. Limpieza del directorio del estado para no llenar el SSD
        print(f"   🧹 Limpiando archivos temporales del estado {state_str}...")
        try:
            shutil.rmtree(state_temp_dir)
        except Exception as e:
            print(f"   ⚠️ Error al limpiar archivos temporales: {e}")

    # 5. Ejecutar la agregación espacial nacional para actualizar todas las secciones
    print("\n==================================================")
    print("🌍 EJECUTANDO AGREGACIÓN ESPACIAL NACIONAL (PostGIS)...")
    print("==================================================")
    
    start_agg = time.time()
    path_update_sql = "/Volumes/SSD1TB/plataforma/Datos/update_secciones.sql"
    if os.path.exists(path_update_sql):
        try:
            with open(path_update_sql, 'r') as sql_file:
                sql_script = sql_file.read()
            with conn.cursor() as cur:
                cur.execute(sql_script)
                conn.commit()
            duration_agg = time.time() - start_agg
            print(f"✅ Agregación espacial nacional completada con éxito en {duration_agg:.2f} segundos.")
        except Exception as e:
            print(f"❌ Error al ejecutar agregación espacial: {e}")
    else:
        print("⚠️ No se localizó el archivo update_secciones.sql.")

    conn.close()
    print(f"\n🎉 ¡PROCESO NACIONAL COMPLETADO CON ÉXITO! 🎉")
    print(f"🚀 Establecimientos económicos totales en PostGIS: {total_denue}")
    print(f"📊 AGEBs demográficas totales integradas: {total_censo}")
    
    # Limpiar el directorio base temporal
    try:
        shutil.rmtree(BASE_DIR)
    except Exception:
        pass

if __name__ == "__main__":
    main()
