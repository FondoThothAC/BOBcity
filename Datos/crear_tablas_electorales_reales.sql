-- crear_tablas_electorales_reales.sql
-- CívicaOS Engine - Infraestructura de Base de Datos Electorales Reales
-- MDD / EDD: Definición de esquemas de datos del INE/DERFE y padrones de partidos políticos.

-- Habilitar extensión PostGIS si aún no está activa
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Tabla de Padrón y Lista Nominal desglosada por Sexo (a nivel de Sección Electoral)
CREATE TABLE IF NOT EXISTS derfe_padron_nominal_sexo (
    id SERIAL PRIMARY KEY,
    clave_entidad INT NOT NULL,
    nombre_entidad VARCHAR(100) NOT NULL,
    clave_distrito INT NOT NULL,
    cabecera_distrital VARCHAR(255),
    clave_municipio INT NOT NULL,
    nombre_municipio VARCHAR(255) NOT NULL,
    seccion INT NOT NULL,
    padron_hombres INT DEFAULT 0,
    padron_mujeres INT DEFAULT 0,
    padron_no_binario INT DEFAULT 0,
    padron_electoral INT DEFAULT 0,
    lista_hombres INT DEFAULT 0,
    lista_mujeres INT DEFAULT 0,
    lista_no_binario INT DEFAULT 0,
    lista_nominal INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice único y de búsqueda para evitar duplicados en la importación por sección
CREATE UNIQUE INDEX IF NOT EXISTS idx_derfe_sexo_unicidad ON derfe_padron_nominal_sexo(clave_entidad, clave_municipio, seccion);
CREATE INDEX IF NOT EXISTS idx_derfe_sexo_ent ON derfe_padron_nominal_sexo(clave_entidad);
CREATE INDEX IF NOT EXISTS idx_derfe_sexo_mun ON derfe_padron_nominal_sexo(clave_entidad, clave_municipio);
CREATE INDEX IF NOT EXISTS idx_derfe_sexo_sec ON derfe_padron_nominal_sexo(seccion);

-- 2. Tabla de Padrón y Lista Nominal desglosada por Edad y Sexo (a nivel de Sección Electoral)
CREATE TABLE IF NOT EXISTS derfe_padron_nominal_edad (
    id SERIAL PRIMARY KEY,
    clave_entidad INT NOT NULL,
    nombre_entidad VARCHAR(100) NOT NULL,
    clave_distrito INT NOT NULL,
    cabecera_distrital VARCHAR(255),
    clave_municipio INT NOT NULL,
    nombre_municipio VARCHAR(255) NOT NULL,
    seccion INT NOT NULL,
    padron_hombres INT DEFAULT 0,
    padron_mujeres INT DEFAULT 0,
    padron_no_binario INT DEFAULT 0,
    padron_electoral INT DEFAULT 0,
    lista_hombres INT DEFAULT 0,
    lista_mujeres INT DEFAULT 0,
    lista_no_binario INT DEFAULT 0,
    lista_nominal INT DEFAULT 0,
    
    -- Padrón por rangos de edad
    padron_18_hombres INT DEFAULT 0, padron_18_mujeres INT DEFAULT 0, padron_18_nobinario INT DEFAULT 0,
    padron_19_hombres INT DEFAULT 0, padron_19_mujeres INT DEFAULT 0, padron_19_nobinario INT DEFAULT 0,
    padron_20_24_hombres INT DEFAULT 0, padron_20_24_mujeres INT DEFAULT 0, padron_20_24_nobinario INT DEFAULT 0,
    padron_25_29_hombres INT DEFAULT 0, padron_25_29_mujeres INT DEFAULT 0, padron_25_29_nobinario INT DEFAULT 0,
    padron_30_34_hombres INT DEFAULT 0, padron_30_34_mujeres INT DEFAULT 0, padron_30_34_nobinario INT DEFAULT 0,
    padron_35_39_hombres INT DEFAULT 0, padron_35_39_mujeres INT DEFAULT 0, padron_35_39_nobinario INT DEFAULT 0,
    padron_40_44_hombres INT DEFAULT 0, padron_40_44_mujeres INT DEFAULT 0, padron_40_44_nobinario INT DEFAULT 0,
    padron_45_49_hombres INT DEFAULT 0, padron_45_49_mujeres INT DEFAULT 0, padron_45_49_nobinario INT DEFAULT 0,
    padron_50_54_hombres INT DEFAULT 0, padron_50_54_mujeres INT DEFAULT 0, padron_50_54_nobinario INT DEFAULT 0,
    padron_55_59_hombres INT DEFAULT 0, padron_55_59_mujeres INT DEFAULT 0, padron_55_59_nobinario INT DEFAULT 0,
    padron_60_64_hombres INT DEFAULT 0, padron_60_64_mujeres INT DEFAULT 0, padron_60_64_nobinario INT DEFAULT 0,
    padron_65_mas_hombres INT DEFAULT 0, padron_65_mas_mujeres INT DEFAULT 0, padron_65_mas_nobinario INT DEFAULT 0,

    -- Lista nominal por rangos de edad
    lista_18_hombres INT DEFAULT 0, lista_18_mujeres INT DEFAULT 0, lista_18_nobinario INT DEFAULT 0,
    lista_19_hombres INT DEFAULT 0, lista_19_mujeres INT DEFAULT 0, lista_19_nobinario INT DEFAULT 0,
    lista_20_24_hombres INT DEFAULT 0, lista_20_24_mujeres INT DEFAULT 0, lista_20_24_nobinario INT DEFAULT 0,
    lista_25_29_hombres INT DEFAULT 0, lista_25_29_mujeres INT DEFAULT 0, lista_25_29_nobinario INT DEFAULT 0,
    lista_30_34_hombres INT DEFAULT 0, lista_30_34_mujeres INT DEFAULT 0, lista_30_34_nobinario INT DEFAULT 0,
    lista_35_39_hombres INT DEFAULT 0, lista_35_39_mujeres INT DEFAULT 0, lista_35_39_nobinario INT DEFAULT 0,
    lista_40_44_hombres INT DEFAULT 0, lista_40_44_mujeres INT DEFAULT 0, lista_40_44_nobinario INT DEFAULT 0,
    lista_45_49_hombres INT DEFAULT 0, lista_45_49_mujeres INT DEFAULT 0, lista_45_49_nobinario INT DEFAULT 0,
    lista_50_54_hombres INT DEFAULT 0, lista_50_54_mujeres INT DEFAULT 0, lista_50_54_nobinario INT DEFAULT 0,
    lista_55_59_hombres INT DEFAULT 0, lista_55_59_mujeres INT DEFAULT 0, lista_55_59_nobinario INT DEFAULT 0,
    lista_60_64_hombres INT DEFAULT 0, lista_60_64_mujeres INT DEFAULT 0, lista_60_64_nobinario INT DEFAULT 0,
    lista_65_mas_hombres INT DEFAULT 0, lista_65_mas_mujeres INT DEFAULT 0, lista_65_mas_nobinario INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_derfe_edad_unicidad ON derfe_padron_nominal_edad(clave_entidad, clave_municipio, seccion);
CREATE INDEX IF NOT EXISTS idx_derfe_edad_ent ON derfe_padron_nominal_edad(clave_entidad);
CREATE INDEX IF NOT EXISTS idx_derfe_edad_mun ON derfe_padron_nominal_edad(clave_entidad, clave_municipio);

-- 3. Tabla de Padrón y Lista Nominal desglosada por Entidad de Origen / Nacimiento (a nivel de Sección Electoral)
CREATE TABLE IF NOT EXISTS derfe_padron_nominal_origen (
    id SERIAL PRIMARY KEY,
    clave_entidad INT NOT NULL,
    nombre_entidad VARCHAR(100) NOT NULL,
    clave_distrito INT NOT NULL,
    cabecera_distrital VARCHAR(255),
    clave_municipio INT NOT NULL,
    nombre_municipio VARCHAR(255) NOT NULL,
    seccion INT NOT NULL,
    
    -- Columnas de desglose de origen (padrón y lista nominal por estado)
    pad_desglose JSONB DEFAULT '{}'::jsonb, -- Almacena origen del padrón en formato JSON para simplificar columnas
    ln_desglose JSONB DEFAULT '{}'::jsonb,  -- Almacena origen de la lista nominal en formato JSON
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_derfe_origen_unicidad ON derfe_padron_nominal_origen(clave_entidad, clave_municipio, seccion);
CREATE INDEX IF NOT EXISTS idx_derfe_origen_ent ON derfe_padron_nominal_origen(clave_entidad);

-- 4. Tabla para almacenar militantes de partidos políticos
CREATE TABLE IF NOT EXISTS partidos_militantes (
    id SERIAL PRIMARY KEY,
    partido VARCHAR(20) NOT NULL,
    entidad VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100),
    apellido_materno VARCHAR(100),
    nombre VARCHAR(150) NOT NULL,
    fecha_afiliacion DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices optimizados para búsquedas rápidas por nombre, partido y entidad
CREATE INDEX IF NOT EXISTS idx_militantes_partido_ent ON partidos_militantes(partido, entidad);
CREATE INDEX IF NOT EXISTS idx_militantes_nombre_completo ON partidos_militantes(apellido_paterno, apellido_materno, nombre);
CREATE INDEX IF NOT EXISTS idx_militantes_fecha ON partidos_militantes(fecha_afiliacion);
