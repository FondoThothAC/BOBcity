-- create_inegi_tables.sql
-- CívicaOS Engine - Infraestructura de Base de Datos Geoespacial

-- Habilitar extensión PostGIS si aún no está activa (por seguridad)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Tabla para almacenar los establecimientos del DENUE (Directorio Económico)
CREATE TABLE IF NOT EXISTS inegi_denue (
    id SERIAL PRIMARY KEY,
    id_establecimiento VARCHAR(20) UNIQUE,
    nombre VARCHAR(255),
    razon_social VARCHAR(255),
    clase_actividad VARCHAR(255), -- Código SCIAN
    estrato_personal VARCHAR(100), -- Rango de tamaño de personal
    calle VARCHAR(255),
    colonia VARCHAR(255),
    codigo_postal VARCHAR(10),
    estado VARCHAR(5),
    municipio VARCHAR(10),
    ageb VARCHAR(10),
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices de optimización para DENUE
CREATE INDEX IF NOT EXISTS idx_inegi_denue_geom ON inegi_denue USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_inegi_denue_clase ON inegi_denue(clase_actividad);
CREATE INDEX IF NOT EXISTS idx_inegi_denue_estado ON inegi_denue(estado);
CREATE INDEX IF NOT EXISTS idx_inegi_denue_mun ON inegi_denue(municipio);

-- 2. Tabla para almacenar variables socioeconómicas por AGEB (Censo de Población y Vivienda 2020)
CREATE TABLE IF NOT EXISTS inegi_censo_demografia (
    id SERIAL PRIMARY KEY,
    clave_ageb VARCHAR(20) UNIQUE, -- concatenación: estado + municipio + localidad + ageb
    estado VARCHAR(5),
    municipio VARCHAR(10),
    localidad VARCHAR(10),
    ageb VARCHAR(10),
    poblacion_total INTEGER DEFAULT 0,
    poblacion_masculina INTEGER DEFAULT 0,
    poblacion_femenina INTEGER DEFAULT 0,
    poblacion_18_mas INTEGER DEFAULT 0,
    poblacion_economicamente_activa INTEGER DEFAULT 0,
    poblacion_discapacidad INTEGER DEFAULT 0,
    promedio_escolaridad DOUBLE PRECISION DEFAULT 0.0,
    total_viviendas_habitadas INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices de optimización para Censo
CREATE INDEX IF NOT EXISTS idx_inegi_censo_ageb ON inegi_censo_demografia(clave_ageb);
CREATE INDEX IF NOT EXISTS idx_inegi_censo_estado ON inegi_censo_demografia(estado);
CREATE INDEX IF NOT EXISTS idx_inegi_censo_mun ON inegi_censo_demografia(municipio);
