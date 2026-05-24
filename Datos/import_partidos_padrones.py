#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# Datos/import_partidos_padrones.py
# MDD / PDD: Ingestor de padrones nacionales de partidos políticos de 2023 en PostgreSQL.

import os
import pandas as pd
import psycopg2
import io
import time
import sys

# Configuración de base de datos y archivos
DB_NAME = "civicaos"
DB_USER = "robertoeduardocelisrobles"
DB_HOST = "localhost"
DATOS_DIR = "/Volumes/SSD1TB/plataforma/Datos"

PARTIDOS_FILES = {
    "PAN": "PADRON_PAN_2023-1.xlsx",
    "MORENA": "PADRON_MORENA_2023.xlsx",
    "PRI": "PADRON_PRI_2023.xlsx",
    "MC": "PADRON_MC_2023.xlsx",
    "PRD": "PADRON_PRD_2023.xlsx",
    "PT": "PADRON_PT_2023.xlsx",
    "PVEM": "PADRON_PVEM_2023.xlsx"
}

def conectar_db():
    return psycopg2.connect(dbname=DB_NAME, user=DB_USER, host=DB_HOST)

def limpiar_fecha(val):
    if pd.isna(val) or val == "":
        return None
    try:
        # Intentar convertir a datetime y luego a string YYYY-MM-DD
        dt = pd.to_datetime(val, errors='coerce')
        if pd.isna(dt):
            return None
        return dt.strftime('%Y-%m-%d')
    except Exception:
        return None

def importar_padron_partido(conn, partido, filename):
    filepath = os.path.join(DATOS_DIR, filename)
    print(f"\n📂 Procesando padrón del partido: {partido} ({filename})...")
    
    if not os.path.exists(filepath):
        print(f"   ⚠️ Archivo no localizado: {filepath}. Omitiendo...")
        return
        
    start_time = time.time()
    
    # 1. Cargar archivo omitiendo las primeras 8 filas vacías/encabezado
    print("   📖 Leyendo archivo excel...")
    df = pd.read_excel(filepath, skiprows=8)
    
    # Limpiar nombres de columnas
    df.columns = [str(c).strip() for c in df.columns]
    print(f"   Columnas leídas: {list(df.columns)}")
    
    # Columnas esperadas: ENTIDAD, APELLIDO PATERNO, APELLIDO MATERNO, NOMBRE, FECHA DE AFILIACIÓN
    column_mapping = {
        'ENTIDAD': 'entidad',
        'APELLIDO PATERNO': 'apellido_paterno',
        'APELLIDO MATERNO': 'apellido_materno',
        'NOMBRE': 'nombre',
        'FECHA DE AFILIACIÓN': 'fecha_afiliacion'
    }
    
    # Renombrar si existen las columnas
    df = df.rename(columns=column_mapping)
    
    # Asegurarnos de que las columnas existan
    required_cols = ['entidad', 'apellido_paterno', 'apellido_materno', 'nombre', 'fecha_afiliacion']
    for col in required_cols:
        if col not in df.columns:
            df[col] = ""
            
    df = df[required_cols]
    
    # Eliminar registros donde el nombre esté vacío
    df = df.dropna(subset=['nombre'])
    
    # Inyectar la columna del partido
    df['partido'] = partido
    
    # 2. Limpieza de datos
    print("   🧹 Limpiando y formateando datos...")
    df['entidad'] = df['entidad'].fillna("DESCONOCIDA").astype(str).str.strip().str.upper()
    df['apellido_paterno'] = df['apellido_paterno'].fillna("").astype(str).str.strip().str.upper()
    df['apellido_materno'] = df['apellido_materno'].fillna("").astype(str).str.strip().str.upper()
    df['nombre'] = df['nombre'].fillna("").astype(str).str.strip().str.upper()
    
    # Formatear la fecha
    df['fecha_afiliacion'] = df['fecha_afiliacion'].apply(limpiar_fecha)
    
    # 3. Importación masiva usando COPY a PostgreSQL (el método más rápido)
    print("   🐘 Preparando buffer para COPY masivo...")
    
    # Reordenar columnas para que coincidan con la estructura de la base de datos
    # partidos_militantes: partido, entidad, apellido_paterno, apellido_materno, nombre, fecha_afiliacion
    df_db = df[['partido', 'entidad', 'apellido_paterno', 'apellido_materno', 'nombre', 'fecha_afiliacion']]
    
    # Crear buffer en memoria
    output = io.StringIO()
    # Escribir como CSV delimitado por tabuladores, rellenando nulos con \N (formato nulo de postgres)
    df_db.to_csv(output, sep='\t', header=False, index=False, na_rep='\\N')
    output.seek(0)
    
    print(f"   ⚡ Insertando {len(df_db)} registros vía COPY...")
    with conn.cursor() as cur:
        # Usar COPY para una carga ultra rápida
        cur.copy_from(
            output, 
            'partidos_militantes', 
            columns=('partido', 'entidad', 'apellido_paterno', 'apellido_materno', 'nombre', 'fecha_afiliacion'),
            null='\\N'
        )
        conn.commit()
        
    duration = time.time() - start_time
    print(f"   ✅ Partido {partido} completado en {duration:.2f} segundos. {len(df_db)} militantes importados.")

def main():
    try:
        conn = conectar_db()
        print("🐘 Conectado a PostgreSQL para iniciar ingesta de padrones de partidos.")
        
        # Limpiar tabla de militantes previa para evitar duplicar
        with conn.cursor() as cur:
            print("🧹 Limpiando tabla partidos_militantes antes de iniciar ingesta...")
            cur.execute("TRUNCATE TABLE partidos_militantes RESTART IDENTITY;")
            conn.commit()
            
        for partido, filename in PARTIDOS_FILES.items():
            try:
                importar_padron_partido(conn, partido, filename)
            except Exception as pe:
                print(f"❌ Error al procesar partido {partido}: {pe}", file=sys.stderr)
                # Continuar con el siguiente partido si uno falla
                continue
                
        conn.close()
        print("\n🎉 ¡Ingesta de todos los padrones de partidos políticos completada con éxito! 🎉")
    except Exception as e:
        print(f"\n❌ Error general en la ingesta de partidos: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
