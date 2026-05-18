#!/usr/bin/env python3
# seed_hermosillo.py - Datos iniciales para MVP Hermosillo

import psycopg2
from psycopg2.extras import RealDictCursor

def seed_territorios(conn):
    with conn.cursor() as cur:
        # Entidad: Sonora
        cur.execute('''
            INSERT INTO territorios (id, tipo, nombre, padre_id, poblacion_total,
                pobreza_pct, analfabetismo_pct, ingreso_medio_mensual,
                tasa_homicidios, desercion_escolar_pct, conectividad_internet_pct,
                ultimo_ganador_partido, ultimo_margen_victoria_pct, volatilidad_historica)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                nombre = EXCLUDED.nombre,
                poblacion_total = EXCLUDED.poblacion_total
        ''', ('26', 'entidad', 'Sonora', None, 2942000, 
              28.5, 3.2, 18500, 25.3, 8.5, 72.0,
              'MORENA', 8.2, 15.3))

        # Municipio: Hermosillo
        cur.execute('''
            INSERT INTO territorios (id, tipo, nombre, padre_id, poblacion_total,
                pobreza_pct, analfabetismo_pct, ingreso_medio_mensual,
                tasa_homicidios, desercion_escolar_pct, conectividad_internet_pct,
                ultimo_ganador_partido, ultimo_margen_victoria_pct, volatilidad_historica)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                nombre = EXCLUDED.nombre,
                poblacion_total = EXCLUDED.poblacion_total
        ''', ('26-019', 'municipio', 'Hermosillo', '26', 936263,
              28.5, 3.2, 18500, 18.3, 12.1, 78.5,
              'MORENA', 5.3, 12.7))

        conn.commit()
        print("Territorios seeded")

def seed_agentes(conn):
    with conn.cursor() as cur:
        # Sector 1: Comerciantes / Autoempleados
        cur.execute('''
            INSERT INTO agentes_sector (
                territorio_id, tipo, poblacion_sintetica,
                ingreso_promedio, educacion_promedio, edad_promedio,
                felicidad_base, confianza_institucional,
                prioridad_seguridad, prioridad_economia, prioridad_empleo,
                prioridad_transporte, prioridad_salud,
                felicidad_actual, confianza_actual, ingreso_actual
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', ('26-019', 'comerciante_autoempleado', 85000,
              12000, 10.5, 42.0,
              52.0, 45.0,
              30.0, 35.0, 15.0, 10.0, 10.0,
              52.0, 45.0, 12000))

        # Sector 2: Jovenes / Gig economy
        cur.execute('''
            INSERT INTO agentes_sector (
                territorio_id, tipo, poblacion_sintetica,
                ingreso_promedio, educacion_promedio, edad_promedio,
                felicidad_base, confianza_institucional,
                prioridad_seguridad, prioridad_economia, prioridad_empleo,
                prioridad_transporte, prioridad_salud,
                felicidad_actual, confianza_actual, ingreso_actual
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', ('26-019', 'joven_gig', 65000,
              8500, 14.2, 24.0,
              45.0, 30.0,
              25.0, 20.0, 35.0, 15.0, 5.0,
              45.0, 30.0, 8500))

        # Sector 3: Asalariados media/baja
        cur.execute('''
            INSERT INTO agentes_sector (
                territorio_id, tipo, poblacion_sintetica,
                ingreso_promedio, educacion_promedio, edad_promedio,
                felicidad_base, confianza_institucional,
                prioridad_seguridad, prioridad_economia, prioridad_empleo,
                prioridad_transporte, prioridad_salud,
                felicidad_actual, confianza_actual, ingreso_actual
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ''', ('26-019', 'asalariado_media', 120000,
              18500, 12.8, 38.0,
              58.0, 55.0,
              20.0, 25.0, 20.0, 15.0, 20.0,
              58.0, 55.0, 18500))

        conn.commit()
        print("Agentes seeded")

def seed_politicas(conn):
    with conn.cursor() as cur:
        cur.execute('''
            INSERT INTO politicas_publicas (id, nombre, descripcion, tipo, parametros, impacto_por_sector, temas_atendidos, horizonte_anios)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        ''', (
            'subsidio-transporte-001',
            'Subsidio Transporte Estudiantil',
            'Subsidio mensual de $500 MXN para estudiantes de bachillerato y universidad',
            'subsidio',
            '{"monto_mensual": 500, "beneficiarios": 15000, "duracion_meses": 36}',
            '{"joven_gig": {"felicidadDelta": 15, "ingresoDeltaPct": 0.03, "empleoDeltaPct": 0.02, "confianzaDelta": 8, "costoPresupuestalPerCapita": 500}, "comerciante_autoempleado": {"felicidadDelta": 5, "ingresoDeltaPct": 0.01, "empleoDeltaPct": 0.0, "confianzaDelta": 3, "costoPresupuestalPerCapita": 100}, "asalariado_media": {"felicidadDelta": 2, "ingresoDeltaPct": 0.0, "empleoDeltaPct": 0.0, "confianzaDelta": 2, "costoPresupuestalPerCapita": 50}}',
            '{"transporte", "empleo"}',
            3
        ))

        cur.execute('''
            INSERT INTO politicas_publicas (id, nombre, descripcion, tipo, parametros, impacto_por_sector, temas_atendidos, horizonte_anios)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        ''', (
            'programa-seguridad-001',
            'Programa de Seguridad Vecinal',
            'Instalacion de camaras y patrullaje comunitario en colonias prioritarias',
            'programa_social',
            '{"cameras": 500, "patrols_per_week": 20, "duration_months": 24}',
            '{"comerciante_autoempleado": {"felicidadDelta": 12, "ingresoDeltaPct": 0.05, "empleoDeltaPct": 0.0, "confianzaDelta": 15, "costoPresupuestalPerCapita": 800}, "joven_gig": {"felicidadDelta": 10, "ingresoDeltaPct": 0.02, "empleoDeltaPct": 0.01, "confianzaDelta": 12, "costoPresupuestalPerCapita": 800}, "asalariado_media": {"felicidadDelta": 8, "ingresoDeltaPct": 0.01, "empleoDeltaPct": 0.0, "confianzaDelta": 10, "costoPresupuestalPerCapita": 800}}',
            '{"seguridad"}',
            5
        ))

        conn.commit()
        print("Politicas seeded")

if __name__ == '__main__':
    conn = psycopg2.connect("dbname=civicpulse user=postgres password=postgres host=localhost")

    try:
        seed_territorios(conn)
        seed_agentes(conn)
        seed_politicas(conn)
        print("Seed complete for Hermosillo MVP")
    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
    finally:
        conn.close()
