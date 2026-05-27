#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
shp2postgis.py — CívicaOS Engine
Convierte Shapefiles del INE/INEGI a tablas PostGIS listas para consumo vía API.

Uso:
    python shp2postgis.py --host localhost --db civicaos --user civica \
        --password civica123 --shp ./secciones_ine.shp --tabla secciones_electorales

Requisitos:
    pip install psycopg2-binary pyshp

El script:
    1. Lee geometrías y atributos del .shp
    2. Crea la tabla en PostGIS con SRID 4326
    3. Inserta polígonos reales (MULTIPOLYGON) con índice GIST
    4. Agrega columnas para cruces: lista_nominal, poblacion_total, etc.
"""

import argparse
import shapefile
import psycopg2
from psycopg2.extras import execute_values
import sys


def conectar_postgres(host, port, db, user, password):
    conn = psycopg2.connect(
        host=host, port=port, dbname=db, user=user, password=password
    )
    conn.autocommit = False
    return conn


def crear_tabla_secciones(cur, tabla):
    cur.execute(f"""
        CREATE TABLE IF NOT EXISTS {tabla} (
            id SERIAL PRIMARY KEY,
            id_seccion VARCHAR(20),
            distrito VARCHAR(10),
            estado VARCHAR(5),
            municipio VARCHAR(10),
            seccion_ine VARCHAR(10),
            lista_nominal INTEGER DEFAULT 0,
            poblacion_total INTEGER DEFAULT 0,
            poblacion_18_mas INTEGER DEFAULT 0,
            codigo_postal VARCHAR(10),
            indice_dolor FLOAT DEFAULT 0,
            indice_economico FLOAT DEFAULT 0,
            geom GEOMETRY(MULTIPOLYGON, 4326),
            created_at TIMESTAMP DEFAULT NOW()
        );
    """)
    cur.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{tabla}_geom ON {tabla} USING GIST(geom);
    """)
    cur.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{tabla}_estado ON {tabla}(estado);
    """)
    cur.execute(f"""
        CREATE INDEX IF NOT EXISTS idx_{tabla}_seccion ON {tabla}(id_seccion);
    """)


def shp_a_wkt_multipolygon(shape):
    """Convierte una shape de pyshp a WKT MULTIPOLYGON."""
    # pyshp shape.shapeType: 5 = Polygon, 15 = PolygonZ, etc.
    parts = shape.parts
    points = shape.points
    if not parts:
        parts = [0]
    parts.append(len(points))

    polygons = []
    for i in range(len(parts) - 1):
        ring = points[parts[i]:parts[i+1]]
        if len(ring) < 3:
            continue
        # Cerrar ring
        if ring[0] != ring[-1]:
            ring.append(ring[0])
        coord_str = ','.join([f"{x} {y}" for x, y in ring])
        polygons.append(f"(({coord_str}))")

    if not polygons:
        return None
    return f"MULTIPOLYGON({','.join(polygons)})"


def inferir_campos(record, field_names):
    """Intenta mapear campos comunes del INE/INEGI a nuestra tabla."""
    mapeo = {}
    lower_fields = [f.lower() for f in field_names]

    # Mapeos posibles del INE
    posibles = {
        'id_seccion': ['seccion', 'sección', 'clave_seccion', 'id_seccion', 'seccion_ine'],
        'distrito': ['distrito', 'distrito_federal', 'dto', 'id_distrito'],
        'estado': ['estado', 'entidad', 'cve_ent', 'cvee'],
        'municipio': ['municipio', 'muni', 'cve_mun', 'cvemun'],
    }

    for nuestro, posibles_ine in posibles.items():
        for p in posibles_ine:
            if p in lower_fields:
                mapeo[nuestro] = field_names[lower_fields.index(p)]
                break
    return mapeo


def procesar_shp(conn, ruta_shp, tabla):
    print(f"📂 Leyendo Shapefile: {ruta_shp}")
    sf = shapefile.Reader(ruta_shp, encoding='latin-1')
    field_names = [f[0] for f in sf.fields[1:]]  # [0] es DeletionFlag
    print(f"   Campos detectados: {field_names}")

    mapeo = inferir_campos(None, field_names)
    print(f"   Mapeo inferido: {mapeo}")

    registros = []
    for i, sr in enumerate(sf.shapeRecords()):
        shape = sr.shape
        record = sr.record

        wkt = shp_a_wkt_multipolygon(shape)
        if not wkt:
            continue

        # Extraer valores según mapeo
        def get(campo):
            if campo in mapeo:
                idx = field_names.index(mapeo[campo])
                val = record[idx]
                if val is None or val == '':
                    return None
                return str(val).strip()
            return None

        id_seccion = get('id_seccion') or f"SEC_{i:05d}"
        distrito   = get('distrito') or '0'
        estado     = get('estado') or '00'
        municipio  = get('municipio') or '000'

        registros.append((id_seccion, distrito, estado, municipio, wkt))

        if i % 500 == 0 and i > 0:
            print(f"   Procesados {i} registros...")

    print(f"✅ Total geometrías válidas: {len(registros)}")

    with conn.cursor() as cur:
        crear_tabla_secciones(cur, tabla)

        sql = f"""
            INSERT INTO {tabla} (id_seccion, distrito, estado, municipio, geom)
            VALUES %s
            ON CONFLICT DO NOTHING;
        """
        # Como usamos id SERIAL, no hay conflicto útil a menos que pongamos UNIQUE(id_seccion)
        # Mejor insertar directo
        sql = f"""
            INSERT INTO {tabla} (id_seccion, distrito, estado, municipio, geom)
            VALUES %s;
        """

        # Preparar valores con ST_GeomFromText
        valores = []
        for id_sec, dist, edo, mun, wkt in registros:
            valores.append((id_sec, dist, edo, mun, f"SRID=4326;{wkt}"))

        # Usamos execute_values pero con ST_GeomFromText
        template = f"(%s, %s, %s, %s, ST_GeomFromText(%s, 4326))"
        execute_values(cur, f"INSERT INTO {tabla} (id_seccion, distrito, estado, municipio, geom) VALUES %s", valores, template=template, page_size=500)

        conn.commit()

    print(f"🚀 {len(registros)} polígonos insertados en '{tabla}'")
    print(f"   PostGIS listo para: SELECT ST_AsGeoJSON(geom) FROM {tabla};")


def main():
    parser = argparse.ArgumentParser(description="Carga SHP del INE a PostGIS")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", default="5432")
    parser.add_argument("--db", required=True)
    parser.add_argument("--user", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--shp", required=True, help="Ruta al .shp")
    parser.add_argument("--tabla", default="secciones_electorales")
    args = parser.parse_args()

    conn = conectar_postgres(args.host, args.port, args.db, args.user, args.password)
    print("🐘 Conectado a PostgreSQL/PostGIS")

    # Verificar PostGIS
    with conn.cursor() as cur:
        cur.execute("SELECT PostGIS_Version();")
        version = cur.fetchone()[0]
        print(f"   PostGIS version: {version}")

    procesar_shp(conn, args.shp, args.tabla)
    conn.close()
    print("🏁 Listo. Tu API ya puede servir GeoJSON real.")


if __name__ == "__main__":
    main()
