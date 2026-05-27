#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
import_inegi_data.py — CívicaOS Engine
Importador de datos de alto rendimiento para el DENUE y Censo de Población de INEGI en PostGIS.
"""

import os
import csv
import psycopg2
from psycopg2.extras import execute_values
import sys
import time

# Configuración de base de datos y archivos
DB_NAME = "civicaos"
DB_USER = "robertoeduardocelisrobles"
DB_HOST = "localhost"

PATH_DENUE = "/Volumes/SSD1TB/plataforma/Datos/INEGI/conjunto_de_datos/denue_inegi_24_.csv"
PATH_CENSO = "/Volumes/SSD1TB/plataforma/Datos/INEGI/ageb_mza_urbana_24_cpv2020/conjunto_de_datos/conjunto_de_datos_ageb_urbana_24_cpv2020.csv"

def conectar_db():
    return psycopg2.connect(dbname=DB_NAME, user=DB_USER, host=DB_HOST)

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

def importar_denue(conn):
    print("\n🏗️ Iniciando importación de establecimientos del DENUE...")
    if not os.path.exists(PATH_DENUE):
        print(f"❌ No se encontró el archivo del DENUE en: {PATH_DENUE}")
        return

    start_time = time.time()
    valores = []
    batch_size = 2000
    insertados = 0

    # Truncar tabla antes de insertar
    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE inegi_denue CASCADE;")
        conn.commit()

    with open(PATH_DENUE, 'r', encoding='latin-1') as f:
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
                estado = str(row.get('cve_ent', '24')).zfill(2)
                municipio = str(row.get('cve_mun', '001')).zfill(3)
                ageb = str(row.get('ageb', '')).strip()[:10]
                
                lat = limpiar_float(row.get('latitud'))
                lon = limpiar_float(row.get('longitud'))

                # Validar coordenadas
                if lat == 0.0 or lon == 0.0:
                    continue

                valores.append((
                    id_estab, nombre, razon, clase, estrato,
                    calle, colonia, cp, estado, municipio, ageb, lat, lon
                ))
            except Exception as e:
                continue

            if len(valores) >= batch_size:
                insertar_lote_denue(conn, valores)
                insertados += len(valores)
                valores = []
                print(f"   ⚡ [{insertados}] establecimientos económicos cargados en PostGIS...")

        if valores:
            insertar_lote_denue(conn, valores)
            insertados += len(valores)

    duration = time.time() - start_time
    print(f"✅ DENUE completado en {duration:.2f} segundos. total: {insertados} establecimientos.")

def insertar_lote_denue(conn, valores):
    with conn.cursor() as cur:
        template = "(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, ST_SetSRID(ST_MakePoint(%s, %s), 4326))"
        # Ajustamos el template para mapear los 13 valores en la tupla y las coordenadas para ST_MakePoint
        # Los parámetros son: id_establecimiento, nombre, razon_social, clase_actividad, estrato_personal, calle, colonia, codigo_postal, estado, municipio, ageb, latitud, longitud, ST_MakePoint(longitud, latitud)
        valores_formateados = [v + (v[12], v[11]) for v in valores] # agregamos lon, lat al final para el punto
        
        execute_values(
            cur,
            "INSERT INTO inegi_denue (id_establecimiento, nombre, razon_social, clase_actividad, estrato_personal, calle, colonia, codigo_postal, estado, municipio, ageb, latitud, longitud, geom) VALUES %s",
            valores_formateados,
            template=template,
            page_size=len(valores)
        )
        conn.commit()

def importar_censo(conn):
    print("\n📊 Iniciando importación de demografía del Censo 2020 por AGEB...")
    if not os.path.exists(PATH_CENSO):
        print(f"❌ No se encontró el archivo del Censo en: {PATH_CENSO}")
        return

    start_time = time.time()
    valores = []
    batch_size = 1000
    insertados = 0

    # Truncar tabla antes de insertar
    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE inegi_censo_demografia CASCADE;")
        conn.commit()

    with open(PATH_CENSO, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                entidad = str(row.get('ENTIDAD', '24')).zfill(2)
                mun = str(row.get('MUN', '001')).zfill(3)
                loc = str(row.get('LOC', '0001')).zfill(4)
                ageb = str(row.get('AGEB', '0000')).zfill(4)
                mza = str(row.get('MZA', '000')).zfill(3)

                # Filtrar únicamente resúmenes a nivel AGEB urbana (MZA == '000' y AGEB != '0000')
                if mza != '000' or ageb == '0000' or loc == '0000':
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
            except Exception as e:
                continue

            if len(valores) >= batch_size:
                insertar_lote_censo(conn, valores)
                insertados += len(valores)
                valores = []
                print(f"   ⚡ [{insertados}] registros demográficos de AGEBs cargados...")

        if valores:
            insertar_lote_censo(conn, valores)
            insertados += len(valores)

    duration = time.time() - start_time
    print(f"✅ Censo completado en {duration:.2f} segundos. total: {insertados} AGEBs registradas.")

def insertar_lote_censo(conn, valores):
    with conn.cursor() as cur:
        execute_values(
            cur,
            "INSERT INTO inegi_censo_demografia (clave_ageb, estado, municipio, localidad, ageb, poblacion_total, poblacion_masculina, poblacion_femenina, poblacion_18_mas, poblacion_economicamente_activa, poblacion_discapacidad, promedio_escolaridad, total_viviendas_habitadas) VALUES %s",
            valores,
            page_size=len(valores)
        )
        conn.commit()

def main():
    try:
        conn = conectar_db()
        print("🐘 Conectado con éxito a PostgreSQL 17 en el disco externo SSD")
        
        # 1. Importar DENUE
        importar_denue(conn)
        
        # 2. Importar Censo
        importar_censo(conn)
        
        conn.close()
        print("\n🎉 ¡Todos los datos piloto del INEGI han sido importados con éxito a la base de datos geoespacial!")
    except Exception as e:
        print(f"\n❌ Error durante la importación: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
