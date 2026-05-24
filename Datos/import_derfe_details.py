#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Datos/import_derfe_details.py
# MDD / PDD: Ingestor de datos reales de la DERFE a nivel de sección electoral en PostgreSQL.

import os
import pandas as pd
import numpy as np
import psycopg2
from psycopg2.extras import execute_values
from psycopg2.extensions import register_adapter, AsIs
import json
import time
import sys

# Registrar adaptadores para que psycopg2 pueda procesar tipos de datos de numpy directamente
register_adapter(np.int64, AsIs)
register_adapter(np.int32, AsIs)
register_adapter(np.float64, AsIs)
register_adapter(np.float32, AsIs)

# Configuración de base de datos y archivos
DB_NAME = "civicaos"
DB_USER = "robertoeduardocelisrobles"
DB_HOST = "localhost"
DATOS_DIR = "/Volumes/SSD1TB/plataforma/Datos"

FILE_SEXO = os.path.join(DATOS_DIR, "DatosAbiertos-derfe-pdln_edms_sexo_20260507.xlsx")
FILE_EDAD = os.path.join(DATOS_DIR, "DatosAbiertos-derfe-pdln_edms_re_20260507.xlsx")
FILE_ORIGEN = os.path.join(DATOS_DIR, "DatosAbiertos-derfe-pdln_edms_eo_20260507.xlsx")

def conectar_db():
    return psycopg2.connect(dbname=DB_NAME, user=DB_USER, host=DB_HOST)

def limpiar_nombre_columna(col):
    return str(col).replace('\n', ' ').replace('\r', ' ').strip()

def filtrar_y_limpiar_df(df, columnas_base):
    # Intentar convertir las columnas numéricas clave
    for col in columnas_base:
        if col in df.columns:
            # Convertir a numérico y forzar errores a NaN
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
    # Eliminar filas donde alguna de las columnas clave sea NaN
    df = df.dropna(subset=columnas_base)
    
    # Convertir a tipos enteros correspondientes
    for col in columnas_base:
        if col in df.columns:
            df[col] = df[col].astype(int)
            
    return df

def importar_tabla_sexo(conn):
    print("\n📊 1/3. Procesando Padrón y Lista Nominal por Sexo...")
    if not os.path.exists(FILE_SEXO):
        print(f"❌ Archivo no encontrado: {FILE_SEXO}")
        return

    start_time = time.time()
    
    # Leer excel
    print("   📖 Cargando archivo excel en memoria...")
    df = pd.read_excel(FILE_SEXO)
    
    # Limpiar columnas
    df.columns = [limpiar_nombre_columna(col) for col in df.columns]
    
    # Mapear nombres de columnas
    mapeo_columnas = {
        'CLAVE ENTIDAD': 'clave_entidad',
        'NOMBRE ENTIDAD': 'nombre_entidad',
        'CLAVE DISTRITO': 'clave_distrito',
        'CABECERA DISTRITAL': 'cabecera_distrital',
        'CLAVE MUNICIPIO': 'clave_municipio',
        'NOMBRE MUNICIPIO': 'nombre_municipio',
        'SECCION': 'seccion',
        'PADRON HOMBRES': 'padron_hombres',
        'PADRON MUJERES': 'padron_mujeres',
        'PADRON NO BINARIO': 'padron_no_binario',
        'PADRON ELECTORAL': 'padron_electoral',
        'LISTA HOMBRES': 'lista_hombres',
        'LISTA MUJERES': 'lista_mujeres',
        'LISTA NO BINARIO': 'lista_no_binario',
        'LISTA NOMINAL': 'lista_nominal'
    }
    
    # Renombrar columnas
    df = df.rename(columns=mapeo_columnas)
    
    # Limpiar y filtrar filas no válidas ("TOTALES")
    columnas_clave = ['clave_entidad', 'clave_distrito', 'clave_municipio', 'seccion']
    df = filtrar_y_limpiar_df(df, columnas_clave)
    
    # Asegurarnos de que el resto de las columnas sean numéricas y rellenar con 0
    columnas_numericas = ['padron_hombres', 'padron_mujeres', 'padron_no_binario', 'padron_electoral',
                          'lista_hombres', 'lista_mujeres', 'lista_no_binario', 'lista_nominal']
    for col in columnas_numericas:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
    
    columnas_db = list(mapeo_columnas.values())
    df = df[columnas_db]
    
    # Truncar tabla antes de importar
    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE derfe_padron_nominal_sexo RESTART IDENTITY;")
        conn.commit()
        
    registros = [tuple(x) for x in df.to_numpy()]
    print(f"   ⚡ Insertando {len(registros)} registros por sección a PostgreSQL...")
    
    # Insertar por lotes
    with conn.cursor() as cur:
        query = f"""
            INSERT INTO derfe_padron_nominal_sexo ({", ".join(columnas_db)})
            VALUES %s
            ON CONFLICT (clave_entidad, clave_municipio, seccion) DO NOTHING
        """
        execute_values(cur, query, registros, page_size=1000)
        conn.commit()
        
    duration = time.time() - start_time
    print(f"   ✅ Sección Sexo completada con éxito en {duration:.2f} segundos. {len(registros)} registros cargados.")

def importar_tabla_edad(conn):
    print("\n📊 2/3. Procesando Padrón y Lista Nominal por Rangos de Edad...")
    if not os.path.exists(FILE_EDAD):
        print(f"❌ Archivo no encontrado: {FILE_EDAD}")
        return

    start_time = time.time()
    
    # Leer excel
    print("   📖 Cargando archivo excel en memoria (este proceso puede tardar un poco debido al tamaño)...")
    df = pd.read_excel(FILE_EDAD)
    
    # Limpiar columnas
    df.columns = [limpiar_nombre_columna(col) for col in df.columns]
    
    # Definir mapeo base
    mapeo_base = {
        'CLAVE ENTIDAD': 'clave_entidad',
        'NOMBRE ENTIDAD': 'nombre_entidad',
        'CLAVE DISTRITO': 'clave_distrito',
        'CABECERA DISTRITAL': 'cabecera_distrital',
        'CLAVE MUNICIPIO': 'clave_municipio',
        'NOMBRE MUNICIPIO': 'nombre_municipio',
        'SECCION': 'seccion',
        'PADRON HOMBRES': 'padron_hombres',
        'PADRON MUJERES': 'padron_mujeres',
        'PADRON NO BINARIO': 'padron_no_binario',
        'PADRON ELECTORAL': 'padron_electoral',
        'LISTA HOMBRES': 'lista_hombres',
        'LISTA MUJERES': 'lista_mujeres',
        'LISTA NO BINARIO': 'lista_no_binario',
        'LISTA NOMINAL': 'lista_nominal'
    }
    
    # Mapear y renombrar de forma flexible el resto de columnas de edad
    rename_dict = {}
    for col in df.columns:
        col_clean = col.strip()
        if col_clean in mapeo_base:
            rename_dict[col] = mapeo_base[col_clean]
        else:
            col_db = col_clean.lower().replace('_y_mas_', '_mas_').replace('_nobinario', '_nobinario')
            rename_dict[col] = col_db

    df = df.rename(columns=rename_dict)
    
    # Limpiar y filtrar filas no válidas ("TOTALES")
    columnas_clave = ['clave_entidad', 'clave_distrito', 'clave_municipio', 'seccion']
    df = filtrar_y_limpiar_df(df, columnas_clave)
    
    columnas_tabla = [
        'clave_entidad', 'nombre_entidad', 'clave_distrito', 'cabecera_distrital',
        'clave_municipio', 'nombre_municipio', 'seccion', 'padron_hombres', 'padron_mujeres',
        'padron_no_binario', 'padron_electoral', 'lista_hombres', 'lista_mujeres',
        'lista_no_binario', 'lista_nominal',
        
        # Padrón edades
        'padron_18_hombres', 'padron_18_mujeres', 'padron_18_nobinario',
        'padron_19_hombres', 'padron_19_mujeres', 'padron_19_nobinario',
        'padron_20_24_hombres', 'padron_20_24_mujeres', 'padron_20_24_nobinario',
        'padron_25_29_hombres', 'padron_25_29_mujeres', 'padron_25_29_nobinario',
        'padron_30_34_hombres', 'padron_30_34_mujeres', 'padron_30_34_nobinario',
        'padron_35_39_hombres', 'padron_35_39_mujeres', 'padron_35_39_nobinario',
        'padron_40_44_hombres', 'padron_40_44_mujeres', 'padron_40_44_nobinario',
        'padron_45_49_hombres', 'padron_45_49_mujeres', 'padron_45_49_nobinario',
        'padron_50_54_hombres', 'padron_50_54_mujeres', 'padron_50_54_nobinario',
        'padron_55_59_hombres', 'padron_55_59_mujeres', 'padron_55_59_nobinario',
        'padron_60_64_hombres', 'padron_60_64_mujeres', 'padron_60_64_nobinario',
        'padron_65_mas_hombres', 'padron_65_mas_mujeres', 'padron_65_mas_nobinario',
        
        # Lista nominal edades
        'lista_18_hombres', 'lista_18_mujeres', 'lista_18_nobinario',
        'lista_19_hombres', 'lista_19_mujeres', 'lista_19_nobinario',
        'lista_20_24_hombres', 'lista_20_24_mujeres', 'lista_20_24_nobinario',
        'lista_25_29_hombres', 'lista_25_29_mujeres', 'lista_25_29_nobinario',
        'lista_30_34_hombres', 'lista_30_34_mujeres', 'lista_30_34_nobinario',
        'lista_35_39_hombres', 'lista_35_39_mujeres', 'lista_35_39_nobinario',
        'lista_40_44_hombres', 'lista_40_44_mujeres', 'lista_40_44_nobinario',
        'lista_45_49_hombres', 'lista_45_49_mujeres', 'lista_45_49_nobinario',
        'lista_50_54_hombres', 'lista_50_54_mujeres', 'lista_50_54_nobinario',
        'lista_55_59_hombres', 'lista_55_59_mujeres', 'lista_55_59_nobinario',
        'lista_60_64_hombres', 'lista_60_64_mujeres', 'lista_60_64_nobinario',
        'lista_65_mas_hombres', 'lista_65_mas_mujeres', 'lista_65_mas_nobinario'
    ]
    
    # Rellenar con 0 si alguna columna requerida en la base de datos no está en el excel
    for col in columnas_tabla:
        if col not in df.columns:
            df[col] = 0
        else:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
            
    df = df[columnas_tabla]
    
    # Truncar tabla antes de importar
    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE derfe_padron_nominal_edad RESTART IDENTITY;")
        conn.commit()
        
    registros = [tuple(x) for x in df.to_numpy()]
    print(f"   ⚡ Insertando {len(registros)} registros con desglose de edad a PostgreSQL...")
    
    with conn.cursor() as cur:
        query = f"""
            INSERT INTO derfe_padron_nominal_edad ({", ".join(columnas_tabla)})
            VALUES %s
            ON CONFLICT (clave_entidad, clave_municipio, seccion) DO NOTHING
        """
        execute_values(cur, query, registros, page_size=1000)
        conn.commit()
        
    duration = time.time() - start_time
    print(f"   ✅ Sección Edad completada en {duration:.2f} segundos. {len(registros)} registros cargados.")

def importar_tabla_origen(conn):
    print("\n📊 3/3. Procesando Padrón y Lista Nominal por Entidad de Origen...")
    if not os.path.exists(FILE_ORIGEN):
        print(f"❌ Archivo no encontrado: {FILE_ORIGEN}")
        return

    start_time = time.time()
    
    print("   📖 Cargando archivo excel en memoria...")
    df = pd.read_excel(FILE_ORIGEN)
    
    df.columns = [limpiar_nombre_columna(col) for col in df.columns]
    
    # Renombrar columnas clave para limpieza uniforme
    mapeo_columnas = {
        'CLAVE ENTIDAD': 'clave_entidad',
        'NOMBRE ENTIDAD': 'nombre_entidad',
        'CLAVE DISTRITO': 'clave_distrito',
        'CABECERA DISTRITAL': 'cabecera_distrital',
        'CLAVE MUNICIPIO': 'clave_municipio',
        'NOMBRE MUNICIPIO': 'nombre_municipio',
        'SECCION': 'seccion'
    }
    df = df.rename(columns=mapeo_columnas)
    
    # Limpiar y filtrar filas no válidas ("TOTALES")
    columnas_clave = ['clave_entidad', 'clave_distrito', 'clave_municipio', 'seccion']
    df = filtrar_y_limpiar_df(df, columnas_clave)
    
    # Truncar tabla antes de importar
    with conn.cursor() as cur:
        cur.execute("TRUNCATE TABLE derfe_padron_nominal_origen RESTART IDENTITY;")
        conn.commit()
        
    # Identificar desgloses
    col_padron = [c for c in df.columns if c.startswith("PAD_")]
    col_lista = [c for c in df.columns if c.startswith("LN_")]
    
    # Convertir desgloses a numéricos
    for col in col_padron + col_lista:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0).astype(int)
        
    print(f"   ⚡ Agrupando datos en formato JSON e insertando...")
    
    # Procesar filas e insertarlas
    batch = []
    batch_size = 1000
    
    for idx, row in df.iterrows():
        clave_ent = int(row['clave_entidad'])
        nombre_ent = str(row['nombre_entidad'])
        clave_dist = int(row['clave_distrito'])
        cabecera_dist = str(row['cabecera_distrital'])
        clave_mun = int(row['clave_municipio'])
        nombre_mun = str(row['nombre_municipio'])
        seccion = int(row['seccion'])
        
        # Desglose del padrón
        pad_desglose = {c.replace("PAD_", ""): int(row[c]) for c in col_padron if int(row[c]) > 0}
        # Desglose de la lista nominal
        ln_desglose = {c.replace("LN_", ""): int(row[c]) for c in col_lista if int(row[c]) > 0}
        
        batch.append((
            clave_ent, nombre_ent, clave_dist, cabecera_dist,
            clave_mun, nombre_mun, seccion,
            json.dumps(pad_desglose), json.dumps(ln_desglose)
        ))
        
        if len(batch) >= batch_size:
            with conn.cursor() as cur:
                execute_values(
                    cur,
                    "INSERT INTO derfe_padron_nominal_origen (clave_entidad, nombre_entidad, clave_distrito, cabecera_distrital, clave_municipio, nombre_municipio, seccion, pad_desglose, ln_desglose) VALUES %s ON CONFLICT (clave_entidad, clave_municipio, seccion) DO NOTHING",
                    batch,
                    page_size=batch_size
                )
                conn.commit()
            batch = []
            
    if batch:
        with conn.cursor() as cur:
            execute_values(
                cur,
                "INSERT INTO derfe_padron_nominal_origen (clave_entidad, nombre_entidad, clave_distrito, cabecera_distrital, clave_municipio, nombre_municipio, seccion, pad_desglose, ln_desglose) VALUES %s ON CONFLICT (clave_entidad, clave_municipio, seccion) DO NOTHING",
                batch,
                page_size=len(batch)
            )
            conn.commit()
            
    duration = time.time() - start_time
    print(f"   ✅ Sección Origen completada en {duration:.2f} segundos. {len(df)} registros cargados.")

def main():
    try:
        conn = conectar_db()
        print("🐘 Conectado a PostgreSQL para iniciar ingesta DERFE.")
        
        importar_tabla_sexo(conn)
        importar_tabla_edad(conn)
        importar_tabla_origen(conn)
        
        conn.close()
        print("\n🎉 ¡Ingesta de datos detallados de la DERFE completada con éxito! 🎉")
    except Exception as e:
        print(f"\n❌ Error durante el procesamiento: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
