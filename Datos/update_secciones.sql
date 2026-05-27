-- update_secciones.sql
-- CívicaOS Engine - Agregador Espacial Geo-Económico

-- 1. Crear tabla de indicadores consolidados por sección electoral
CREATE TABLE IF NOT EXISTS secciones_indicadores (
    id_seccion VARCHAR(20) PRIMARY KEY,
    estado VARCHAR(5),
    municipio VARCHAR(10),
    seccion_ine VARCHAR(10),
    total_establecimientos INTEGER DEFAULT 0,
    comercios_retail INTEGER DEFAULT 0,
    servicios_alimentos INTEGER DEFAULT 0,
    manufactura INTEGER DEFAULT 0,
    poblacion_estimada INTEGER DEFAULT 0,
    promedio_escolaridad DOUBLE PRECISION DEFAULT 0.0,
    poblacion_activa INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para búsquedas analíticas rápidas
CREATE INDEX IF NOT EXISTS idx_sec_ind_estado ON secciones_indicadores(estado);
CREATE INDEX IF NOT EXISTS idx_sec_ind_mun ON secciones_indicadores(municipio);

-- 2. Limpiar tabla antes de poblar
TRUNCATE TABLE secciones_indicadores;

-- 3. Poblar la tabla de indicadores combinando cruces espaciales y estadísticas del Censo y DENUE
INSERT INTO secciones_indicadores (
    id_seccion, estado, municipio, seccion_ine,
    total_establecimientos, comercios_retail, servicios_alimentos, manufactura,
    poblacion_estimada, promedio_escolaridad, poblacion_activa
)
WITH 
-- A. Mapeo espacial de establecimientos a secciones electorales
establecimientos_por_seccion AS (
    SELECT 
        s.id_seccion,
        COUNT(d.id) as total_estab,
        COUNT(CASE WHEN d.clase_actividad LIKE '43%' OR d.clase_actividad LIKE '46%' THEN 1 END) as retail,
        COUNT(CASE WHEN d.clase_actividad LIKE '72%' THEN 1 END) as alimentos,
        COUNT(CASE WHEN d.clase_actividad LIKE '31%' OR d.clase_actividad LIKE '32%' OR d.clase_actividad LIKE '33%' THEN 1 END) as manuf
    FROM secciones_electorales s
    LEFT JOIN inegi_denue d ON ST_Contains(s.geom, d.geom)
    GROUP BY s.id_seccion
),

-- B. Mapeo de correspondencia Sección-AGEB basado en la densidad de establecimientos
seccion_ageb_mapping AS (
    SELECT 
        s.id_seccion,
        s.estado,
        d.ageb,
        d.municipio as cve_mun,
        COUNT(*) as weight,
        ROW_NUMBER() OVER(PARTITION BY s.id_seccion ORDER BY COUNT(*) DESC) as rn
    FROM secciones_electorales s
    JOIN inegi_denue d ON ST_Contains(s.geom, d.geom)
    GROUP BY s.id_seccion, s.estado, d.ageb, d.municipio
),

-- C. Asignar el AGEB dominante a cada sección electoral para extraer su demografía
seccion_ageb_dominante AS (
    SELECT id_seccion, estado, ageb, cve_mun
    FROM seccion_ageb_mapping
    WHERE rn = 1
),

-- D. Demografía asociada por AGEB dominante
demografia_por_seccion AS (
    SELECT 
        sad.id_seccion,
        c.poblacion_total,
        c.poblacion_economicamente_activa as pea,
        c.promedio_escolaridad
    FROM seccion_ageb_dominante sad
    JOIN inegi_censo_demografia c 
      ON c.estado = sad.estado 
     AND c.municipio = sad.cve_mun 
     AND c.ageb = sad.ageb
),

-- E. Promedios municipales como fallback (imputación) para secciones sin establecimientos o AGEBs dominantes
promedios_municipales AS (
    SELECT 
        estado,
        municipio,
        AVG(poblacion_total)::INTEGER as avg_pob,
        AVG(poblacion_economicamente_activa)::INTEGER as avg_pea,
        AVG(promedio_escolaridad) as avg_esc
    FROM inegi_censo_demografia
    GROUP BY estado, municipio
)

SELECT DISTINCT ON (s.id_seccion)
    s.id_seccion,
    s.estado,
    s.municipio,
    s.seccion_ine,
    COALESCE(e.total_estab, 0) as total_establecimientos,
    COALESCE(e.retail, 0) as comercios_retail,
    COALESCE(e.alimentos, 0) as servicios_alimentos,
    COALESCE(e.manuf, 0) as manufactura,
    -- Demografía: intentar AGEB dominante, si no tiene caer en promedio municipal, si no en población base
    COALESCE(d.poblacion_total, pm.avg_pob, s.poblacion_total, 1200) as poblacion_estimada,
    COALESCE(d.promedio_escolaridad, pm.avg_esc, 8.8) as promedio_escolaridad,
    COALESCE(d.pea, pm.avg_pea, (s.poblacion_total * 0.45)::INTEGER, 500) as poblacion_activa
FROM secciones_electorales s
LEFT JOIN establecimientos_por_seccion e ON e.id_seccion = s.id_seccion
LEFT JOIN seccion_ageb_dominante sad ON sad.id_seccion = s.id_seccion
LEFT JOIN demografia_por_seccion d ON d.id_seccion = s.id_seccion
LEFT JOIN promedios_municipales pm ON pm.estado = s.estado AND pm.municipio = s.municipio
ORDER BY s.id_seccion, s.id;
