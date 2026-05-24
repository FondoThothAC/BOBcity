#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# simulation/db_setup.py
# MDD/EDD: Inicialización de la base de datos PostgreSQL local para Cívica OS

import psycopg2
import json
import random

def get_connection():
    return psycopg2.connect(
        host="localhost",
        port="5432",
        dbname="civicaos",
        user="robertoeduardocelisrobles"
    )

def create_tables(conn):
    with conn.cursor() as cur:
        # 1. Tabla de Perfiles Electorales e Históricos (1995-2024)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS candidatos_elecciones (
                id SERIAL PRIMARY KEY,
                estado VARCHAR(50) NOT NULL,
                municipio VARCHAR(100) NOT NULL,
                municipio_id VARCHAR(6) NOT NULL, -- Código INEGI (ej. 26019)
                anio INTEGER NOT NULL,
                partido_ganador VARCHAR(50) NOT NULL,
                nombre_ganador VARCHAR(200) NOT NULL,
                genero VARCHAR(20) NOT NULL,
                escolaridad VARCHAR(100) NOT NULL,
                estatura_cm NUMERIC(5,2),
                tez_color VARCHAR(50),
                propuestas JSONB DEFAULT '[]'::jsonb,
                propuestas_cumplidas JSONB DEFAULT '[]'::jsonb,
                medio_difusion VARCHAR(100), -- 'redes_sociales', 'campo', 'hibrido'
                margen_victoria_pct NUMERIC(5,2) NOT NULL,
                participacion_pct NUMERIC(5,2) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # 2. Tabla de Variables Históricas (1000+ Variables Socioeconómicas y Urbanas)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS valores_municipales_anuales (
                municipio_id VARCHAR(6),
                anio INTEGER,
                pobreza_extrema_pct NUMERIC(5,2),
                pobreza_moderada_pct NUMERIC(5,2),
                calles_pavimentadas_pct NUMERIC(5,2),
                transporte_publico_cobertura NUMERIC(5,2),
                alumbrado_publico_pct NUMERIC(5,2),
                cobertura_internet_pct NUMERIC(5,2),
                tasa_criminalidad NUMERIC(8,2), -- Homicidios/Delitos por 100k hab
                pib_municipal NUMERIC(15,2),
                presupuesto_shcp_mxn NUMERIC(15,2),
                PRIMARY KEY (municipio_id, anio)
            );
        """)

        # 3. Tabla de Correlaciones y Tendencias Predichas
        cur.execute("""
            CREATE TABLE IF NOT EXISTS correlaciones_variables (
                id SERIAL PRIMARY KEY,
                municipio_id VARCHAR(6),
                variable_x VARCHAR(100),
                variable_y VARCHAR(100),
                coeficiente_correlacion NUMERIC(5,2),
                p_valor NUMERIC(6,4),
                descripcion TEXT,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        conn.commit()
        print("Tablas creadas correctamente en PostgreSQL.")

def seed_data(conn):
    # Catálogo de ganadores históricos realistas (Hermosillo 26019, Cajeme 26018, Nogales 26043)
    candidatos_data = [
        # Hermosillo (26019)
        ("Sonora", "Hermosillo", "26019", 1997, "PAN", "Jorge Valencia Juillerat", "Masculino", "Licenciatura", 178, "Clara", ["Mejorar alumbrado", "Pavimentación"], ["Mejorar alumbrado"], "campo", 5.2, 58.1),
        ("Sonora", "Hermosillo", "26019", 2000, "PAN", "Francisco Búrquez Valenzuela", "Masculino", "Maestría", 182, "Clara", ["Modernizar Hermosillo", "Inversión hidráulica"], ["Inversión hidráulica"], "campo", 12.4, 61.2),
        ("Sonora", "Hermosillo", "26019", 2003, "PRI", "María Dolores del Río Sánchez", "Femenino", "Licenciatura", 165, "Clara", ["Apoyo social", "Transporte"], ["Apoyo social"], "campo", 3.1, 52.4),
        ("Sonora", "Hermosillo", "26019", 2006, "PRI", "Ernesto Gándara Camou", "Masculino", "Maestría", 192, "Media", ["Hermosillo Seguro", "Infraestructura vial"], ["Infraestructura vial"], "campo", 4.8, 49.3),
        ("Sonora", "Hermosillo", "26019", 2009, "PAN", "Javier Gándara Magaña", "Masculino", "Licenciatura", 180, "Clara", ["Agua para Hermosillo", "Pavimentación total"], ["Agua para Hermosillo"], "hibrido", 8.2, 51.5),
        ("Sonora", "Hermosillo", "26019", 2012, "PAN", "Alejandro López Caballero", "Masculino", "Licenciatura", 175, "Media", ["Crecimiento económico", "Fomento deportivo"], ["Fomento deportivo"], "hibrido", 6.5, 54.0),
        ("Sonora", "Hermosillo", "26019", 2015, "PRI", "Manuel Ignacio Acosta Gutiérrez", "Masculino", "Licenciatura", 185, "Media-Oscura", ["Hermosillo Limpio", "Seguridad 24/7"], [], "hibrido", 3.9, 52.1),
        ("Sonora", "Hermosillo", "26019", 2018, "MORENA", "Célida López Cárdenas", "Femenino", "Licenciatura", 170, "Clara", ["Combate a la corrupción", "Bacheo intensivo"], ["Combate a la corrupción"], "redes_sociales", 9.5, 58.7),
        ("Sonora", "Hermosillo", "26019", 2021, "PAN-PRI", "Antonio Astiazarán Gutiérrez", "Masculino", "Maestría", 178, "Clara", ["Hermosillo Solar", "Patrullas Eléctricas"], ["Patrullas Eléctricas", "Hermosillo Solar"], "redes_sociales", 2.1, 48.6),
        ("Sonora", "Hermosillo", "26019", 2024, "PAN-PRI", "Antonio Astiazarán Gutiérrez", "Masculino", "Maestría", 178, "Clara", ["Doble de pavimentación", "Presupuesto participativo digital"], ["Presupuesto participativo digital"], "redes_sociales", 5.8, 54.2),
        
        # Cajeme (26018)
        ("Sonora", "Cajeme", "26018", 2015, "PRI", "Faustino Félix Chávez", "Masculino", "Licenciatura", 176, "Clara", ["Apoyo agrícola", "Seguridad"], ["Apoyo agrícola"], "hibrido", 4.2, 47.5),
        ("Sonora", "Cajeme", "26018", 2018, "MORENA", "Sergio Pablo Mariscal Alvarado", "Masculino", "Maestría", 174, "Media", ["Transformación social", "Drenaje pluvial"], [], "hibrido", 14.1, 52.3),
        ("Sonora", "Cajeme", "26018", 2021, "MORENA", "Carlos Javier Lamarque Cano", "Masculino", "Licenciatura", 172, "Media", ["Paz para Cajeme", "Reparación de vialidades"], ["Reparación de vialidades"], "redes_sociales", 18.2, 41.2),
        ("Sonora", "Cajeme", "26018", 2024, "MORENA", "Carlos Javier Lamarque Cano", "Masculino", "Licenciatura", 172, "Media", ["Segundo piso de seguridad", "Agua potable"], [], "redes_sociales", 11.5, 46.8)
    ]
    
    with conn.cursor() as cur:
        # Limpiar datos previos
        cur.execute("TRUNCATE TABLE candidatos_elecciones RESTART IDENTITY;")
        cur.execute("TRUNCATE TABLE valores_municipales_anuales;")
        
        for cand in candidatos_data:
            cur.execute("""
                INSERT INTO candidatos_elecciones (
                    estado, municipio, municipio_id, anio, partido_ganador, nombre_ganador,
                    genero, escolaridad, estatura_cm, tez_color, propuestas, propuestas_cumplidas,
                    medio_difusion, margen_victoria_pct, participacion_pct
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
            """, (
                cand[0], cand[1], cand[2], cand[3], cand[4], cand[5], cand[6], cand[7], cand[8], cand[9],
                json.dumps(cand[10]), json.dumps(cand[11]), cand[12], cand[13], cand[14]
            ))
        
        # Generar series de tiempo socioeconómicas (1995-2024) para Hermosillo y Cajeme
        muns = ["26019", "26018"]
        for mun in muns:
            # Baseline para tendencias
            base_pob_ext = 8.5 if mun == "26019" else 12.0
            base_pob_mod = 25.0 if mun == "26019" else 30.0
            base_pav = 40.0 if mun == "26019" else 35.0
            base_trans = 60.0 if mun == "26019" else 50.0
            base_alum = 75.0 if mun == "26019" else 65.0
            base_internet = 2.0 if mun == "26019" else 1.0
            base_crim = 200.0 if mun == "26019" else 250.0
            base_pib = 12000.0 if mun == "26019" else 9000.0
            base_pres = 400.0 if mun == "26019" else 300.0
            
            for index, anio in enumerate(range(1995, 2025)):
                # Simular tendencias lógicas realistas:
                # - El internet sube drásticamente a partir de los 2000
                # - La pavimentación mejora lentamente
                # - La criminalidad tiene repuntes en 2010 y 2019
                # - La pobreza disminuye ligeramente
                pct_avance = index / 30.0
                
                pob_ext = max(1.5, base_pob_ext - (pct_avance * 5.0) + random.uniform(-0.5, 0.5))
                pob_mod = max(10.0, base_pob_mod - (pct_avance * 8.0) + random.uniform(-1.0, 1.0))
                pav = min(98.0, base_pav + (pct_avance * 45.0) + random.uniform(-2.0, 2.0))
                trans = min(95.0, base_trans + (pct_avance * 25.0) + random.uniform(-3.0, 3.0))
                alum = min(99.0, base_alum + (pct_avance * 20.0) + random.uniform(-1.0, 1.0))
                
                # Crecimiento exponencial de internet
                internet = min(92.0, base_internet + (pct_avance ** 2 * 80.0) + random.uniform(-1.0, 1.0))
                
                # Pico de violencia en 2019-2022
                factor_crim = 1.0
                if 2010 <= anio <= 2013:
                    factor_crim = 1.4
                elif 2019 <= anio <= 2022:
                    factor_crim = 2.1
                crim = max(50.0, (base_crim * factor_crim) + random.uniform(-20.0, 20.0))
                
                pib = base_pib * (1.025 ** index) * random.uniform(0.98, 1.02)
                pres = base_pres * (1.03 ** index) * random.uniform(0.97, 1.03)
                
                cur.execute("""
                    INSERT INTO valores_municipales_anuales (
                        municipio_id, anio, pobreza_extrema_pct, pobreza_moderada_pct,
                        calles_pavimentadas_pct, transporte_publico_cobertura,
                        alumbrado_publico_pct, cobertura_internet_pct, tasa_criminalidad,
                        pib_municipal, presupuesto_shcp_mxn
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s);
                """, (
                    mun, anio, pob_ext, pob_mod, pav, trans, alum, internet, crim, pib, pres
                ))
                
        conn.commit()
        print("Datos históricos y series de tiempo de variables sembrados correctamente.")

if __name__ == "__main__":
    try:
        conn = get_connection()
        create_tables(conn)
        seed_data(conn)
        conn.close()
        print("Configuración completa.")
    except Exception as e:
        print(f"Error de base de datos: {e}")
