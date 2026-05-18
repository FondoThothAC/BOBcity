# Database Schema - CivicPulse

## PostgreSQL + PostGIS Schema

```sql
-- Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgvector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: territorios
-- ============================================
CREATE TABLE territorios (
    id VARCHAR(10) PRIMARY KEY,              -- CVEGEO o clave INE
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('distrito', 'municipio', 'entidad')),
    nombre VARCHAR(100) NOT NULL,
    padre_id VARCHAR(10) REFERENCES territorios(id),
    geometria GEOMETRY(Polygon, 4326),       -- WGS84
    poblacion_total INTEGER NOT NULL DEFAULT 0,

    -- Indicadores INEGI
    pobreza_pct DECIMAL(5,2),
    analfabetismo_pct DECIMAL(5,2),
    ingreso_medio_mensual DECIMAL(10,2),
    tasa_homicidios DECIMAL(5,2),             -- por 100k
    desercion_escolar_pct DECIMAL(5,2),
    conectividad_internet_pct DECIMAL(5,2),

    -- Electoral
    ultimo_ganador_partido VARCHAR(50),
    ultimo_margen_victoria_pct DECIMAL(5,2),
    volatilidad_historica DECIMAL(5,2),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_territorios_tipo ON territorios(tipo);
CREATE INDEX idx_territorios_padre ON territorios(padre_id);
CREATE INDEX idx_territorios_geometria ON territorios USING GIST(geometria);

-- ============================================
-- TABLA: agentes_sector
-- ============================================
CREATE TABLE agentes_sector (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    territorio_id VARCHAR(10) NOT NULL REFERENCES territorios(id),
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('comerciante_autoempleado', 'joven_gig', 'asalariado_media')),

    poblacion_sintetica INTEGER NOT NULL DEFAULT 1000,

    -- Atributos base
    ingreso_promedio DECIMAL(10,2) NOT NULL DEFAULT 15000,
    educacion_promedio DECIMAL(4,1) NOT NULL DEFAULT 12.0,
    edad_promedio DECIMAL(4,1) NOT NULL DEFAULT 35.0,
    felicidad_base DECIMAL(5,2) NOT NULL DEFAULT 50.0 CHECK (felicidad_base BETWEEN 0 AND 100),
    confianza_institucional DECIMAL(5,2) NOT NULL DEFAULT 50.0 CHECK (confianza_institucional BETWEEN 0 AND 100),

    -- Prioridades (deben sumar ~100)
    prioridad_seguridad DECIMAL(5,2) NOT NULL DEFAULT 20.0,
    prioridad_economia DECIMAL(5,2) NOT NULL DEFAULT 20.0,
    prioridad_empleo DECIMAL(5,2) NOT NULL DEFAULT 20.0,
    prioridad_transporte DECIMAL(5,2) NOT NULL DEFAULT 20.0,
    prioridad_salud DECIMAL(5,2) NOT NULL DEFAULT 20.0,

    -- Estado dinámico
    felicidad_actual DECIMAL(5,2) NOT NULL DEFAULT 50.0,
    confianza_actual DECIMAL(5,2) NOT NULL DEFAULT 50.0,
    ingreso_actual DECIMAL(10,2) NOT NULL DEFAULT 15000,
    intencion_voto JSONB DEFAULT '{}',
    estado VARCHAR(20) DEFAULT 'normal' CHECK (estado IN ('normal', 'crisis_social')),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agentes_territorio ON agentes_sector(territorio_id);
CREATE INDEX idx_agentes_tipo ON agentes_sector(tipo);

-- ============================================
-- TABLA: candidatos
-- ============================================
CREATE TABLE candidatos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    territorio_id VARCHAR(10) NOT NULL REFERENCES territorios(id),
    cargo VARCHAR(20) NOT NULL CHECK (cargo IN ('presidente_mun', 'gobernador', 'diputado_fed')),
    partido VARCHAR(50) NOT NULL,
    genero CHAR(1) CHECK (genero IN ('M', 'F')),
    edad INTEGER NOT NULL CHECK (edad BETWEEN 18 AND 100),
    nivel_educativo INTEGER CHECK (nivel_educativo IN (1, 2, 3)),
    anos_experiencia_publica INTEGER DEFAULT 0,
    anos_experiencia_privada INTEGER DEFAULT 0,
    experiencia_seguridad BOOLEAN DEFAULT FALSE,
    es_incumbente BOOLEAN DEFAULT FALSE,

    -- Scores calculados
    score_perfil DECIMAL(5,2) DEFAULT 0,
    score_propuesta DECIMAL(5,2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_candidatos_territorio ON candidatos(territorio_id);
CREATE INDEX idx_candidatos_partido ON candidatos(partido);

-- ============================================
-- TABLA: propuestas
-- ============================================
CREATE TABLE propuestas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    candidato_id UUID NOT NULL REFERENCES candidatos(id) ON DELETE CASCADE,
    tema VARCHAR(20) NOT NULL CHECK (tema IN ('seguridad', 'economia', 'empleo', 'transporte', 'salud', 'corrupcion')),
    peso DECIMAL(3,2) NOT NULL CHECK (peso BETWEEN 0 AND 1),
    especificidad DECIMAL(3,2) NOT NULL CHECK (especificidad BETWEEN 0 AND 1),
    sentimiento DECIMAL(3,2) NOT NULL CHECK (sentimiento BETWEEN -1 AND 1),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_propuestas_candidato ON propuestas(candidato_id);

-- ============================================
-- TABLA: politicas_publicas
-- ============================================
CREATE TABLE politicas_publicas (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(20) CHECK (tipo IN ('subsidio', 'impuesto', 'regulacion', 'infraestructura', 'programa_social')),
    parametros JSONB DEFAULT '{}',

    -- Impacto por sector (almacenado como JSON para flexibilidad)
    impacto_por_sector JSONB NOT NULL DEFAULT '{}',

    temas_atendidos VARCHAR(20)[] DEFAULT '{}',
    horizonte_anios INTEGER DEFAULT 5,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLA: simulaciones
-- ============================================
CREATE TABLE simulaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    territorio_id VARCHAR(10) NOT NULL REFERENCES territorios(id),
    estado VARCHAR(20) NOT NULL DEFAULT 'iniciada' CHECK (estado IN ('iniciada', 'en_progreso', 'completada', 'fallida')),
    horizon_meses INTEGER NOT NULL DEFAULT 120,
    progreso INTEGER DEFAULT 0 CHECK (progreso BETWEEN 0 AND 100),
    mes_actual INTEGER DEFAULT 0,

    -- Configuración
    politicas_aplicadas VARCHAR(50)[] DEFAULT '{}',
    sectores_incluidos VARCHAR(30)[] DEFAULT '{}',
    semilla_aleatoria INTEGER,

    -- Resultados (almacenados al completar)
    resultados JSONB,
    costo_total DECIMAL(15,2),
    roi_social DECIMAL(5,2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_simulaciones_territorio ON simulaciones(territorio_id);
CREATE INDEX idx_simulaciones_estado ON simulaciones(estado);

-- ============================================
-- TABLA: resultados_electorales_historicos
-- ============================================
CREATE TABLE resultados_electorales_historicos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    territorio_id VARCHAR(10) NOT NULL REFERENCES territorios(id),
    ciclo INTEGER NOT NULL,
    candidato_id UUID REFERENCES candidatos(id),
    partido VARCHAR(50) NOT NULL,
    votos_pct DECIMAL(5,2) NOT NULL,
    es_ganador BOOLEAN DEFAULT FALSE,
    margen_victoria_pct DECIMAL(5,2),

    -- Contexto al momento de la elección
    contexto JSONB,

    UNIQUE(territorio_id, ciclo, candidato_id)
);

CREATE INDEX idx_resultados_territorio_ciclo ON resultados_electorales_historicos(territorio_id, ciclo);

-- ============================================
-- TABLA: event_store (Event Sourcing)
-- ============================================
CREATE TABLE event_store (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload JSONB NOT NULL,
    metadata JSONB,
    event_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    sequence_number BIGSERIAL
);

CREATE INDEX idx_event_store_aggregate ON event_store(aggregate_id);
CREATE INDEX idx_event_store_type ON event_store(event_type);
CREATE INDEX idx_event_store_sequence ON event_store(sequence_number);

-- ============================================
-- TABLA: audit_ledger
-- ============================================
CREATE TABLE audit_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flujo_id VARCHAR(100) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    operation VARCHAR(100) NOT NULL,
    agent_id VARCHAR(50) NOT NULL,
    data_hash VARCHAR(64) NOT NULL,
    previous_hash VARCHAR(64),
    compliance VARCHAR(10)[] DEFAULT '{}',
    data_classification VARCHAR(20) CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted')),
    sensitive_data_accessed BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_ledger_flujo ON audit_ledger(flujo_id);
CREATE INDEX idx_ledger_timestamp ON audit_ledger(timestamp);

-- ============================================
-- TABLA: embeddings (para NLP)
-- ============================================
CREATE TABLE embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_type VARCHAR(50) NOT NULL,  -- 'propuesta', 'noticia', 'encuesta'
    source_id VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(768),              -- dimensión del modelo de embeddings
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- ============================================
-- VISTAS MATERIALIZADAS
-- ============================================

CREATE MATERIALIZED VIEW mv_resumen_territorio AS
SELECT 
    t.id,
    t.nombre,
    t.tipo,
    t.poblacion_total,
    t.pobreza_pct,
    t.tasa_homicidios,
    COUNT(DISTINCT a.id) as num_agentes,
    AVG(a.felicidad_actual) as felicidad_promedio,
    AVG(a.confianza_actual) as confianza_promedio,
    MAX(r.ciclo) as ultimo_ciclo_electoral
FROM territorios t
LEFT JOIN agentes_sector a ON t.id = a.territorio_id
LEFT JOIN resultados_electorales_historicos r ON t.id = r.territorio_id
GROUP BY t.id, t.nombre, t.tipo, t.poblacion_total, t.pobreza_pct, t.tasa_homicidios;

CREATE UNIQUE INDEX idx_mv_resumen_territorio ON mv_resumen_territorio(id);

-- Trigger para actualizar vista materializada
CREATE OR REPLACE FUNCTION refresh_mv_resumen_territorio()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_resumen_territorio;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_mv
AFTER INSERT OR UPDATE OR DELETE ON agentes_sector
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_mv_resumen_territorio();
```
