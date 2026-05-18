# SPEC.md - CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

## Versión: 1.0.0
## Fecha: 2026-05-18
## Autor: MiniMax Agent

---

## 1. Visión General del Proyecto

**Nombre del Proyecto**: CívicaOS (Sistema Operativo de Inteligencia Cívica)

**Misión**: Proporcionar una plataforma integral de análisis cívico que permita a gobiernos, partidos políticos y organizaciones гражданские visualizar problemas ciudadanos, simular políticas públicas mediante gemelos digitales sociales y predecir resultados electorales mediante modelos de IA locales y on-premise.

**Valor Diferenciador**: OPERACIÓN 100% LOCAL - Sin datos sensibles en la nube. Cumplimiento normativo GDPR/LGPD integrado. Orquestación multi-agente open-source.

---

## 2. Arquitectura de Hardware (Tiers de Despliegue)

### Tier 1: Edge Computing (Prototyping y Demos)
```
┌─────────────────────────────────────────────────────────────┐
│ HARDWARE: Apple Mac Mini M4 (16GB RAM, 256GB SSD)           │
│ COSTO ESTIMADO: $599 USD                                   │
│ USO: Prototyping, demos, equipos pequeños (<5 usuarios)    │
├─────────────────────────────────────────────────────────────┤
│ Capacidad de Inference:                                    │
│ - Qwen 2.5 7B en ~4GB VRAM (32GB total)                   │
│ - DeepSeek-R1 1.5B (ultraligero)                           │
│ - Throughput: ~15 tokens/segundo                           │
├─────────────────────────────────────────────────────────────┤
│ Electricidad: ~5-10 USD/mes (150W peak)                    │
│ Mantenimiento: $200/año                                    │
└─────────────────────────────────────────────────────────────┘
```

### Tier 2: Workstation (Equipos de Desarrollo/Testing)
```
┌─────────────────────────────────────────────────────────────┐
│ HARDWARE: NVIDIA DGX Spark (32GB VRAM, 128GB RAM)           │
│ COSTO ESTIMADO: $3,500 USD                                 │
│ USO: Desarrollo, testing, equipos medianos (5-20 usuarios) │
├─────────────────────────────────────────────────────────────┤
│ Capacidad de Inference:                                    │
│ - Qwen 2.5 72B en ~48GB VRAM (requiere quantización Q4)    │
│ - DeepSeek-R1 70B (requiere quantización Q4)                │
│ - Throughput: ~25-40 tokens/segundo                         │
│ - Fine-tuning de modelos custom                            │
├─────────────────────────────────────────────────────────────┤
│ Electricidad: ~50-100 USD/mes (400W peak)                  │
│ Mantenimiento: $1,000/año                                   │
└─────────────────────────────────────────────────────────────┘
```

### Tier 3: Data Center (Producción Completa)
```
┌─────────────────────────────────────────────────────────────┐
│ HARDWARE: 4x NVIDIA H100/H200 (80GB VRAM cada una)         │
│ COSTO ESTIMADO: $400,000+ USD (configuración modular)      │
│ USO: Producción, inference masivo, training de modelos      │
├─────────────────────────────────────────────────────────────┤
│ Capacidad de Inference:                                    │
│ - Qwen 2.5 72B en paralelo (batching optimizado)          │
│ - DeepSeek-R1 70B en paralelo                              │
│ - Throughput: ~200+ tokens/segundo                          │
│ - Training de modelos custom cívicos                       │
│ - Simulación ABM a escala (1M+ agentes)                   │
├─────────────────────────────────────────────────────────────┤
│ Electricidad: ~2,000-5,000 USD/mes                         │
│ Mantenimiento: $20,000/año                                 │
│ Cooling: Sistemas de refrigeración dedicados               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Stack Tecnológico Open Source

### 3.1 Capa de Orquestación de Agentes

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPENCLAW / NEMOCLAW                         │
│  Framework de Orquestación Multi-Agente                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   SUPER AGENTE                           │   │
│  │  "Coordinador General - Analiza y delega"               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                 │
│         ┌────────────────────┼────────────────────┐          │
│         ▼                    ▼                    ▼          │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐   │
│  │ DATA        │      │ ANALYZER   │      │ SIMULATOR  │   │
│  │ COLLECTOR   │      │             │      │            │   │
│  └─────────────┘      └─────────────┘      └─────────────┘   │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐   │
│  │ REPORT      │      │ RECOMMENDER │      │ INTEGRATOR  │   │
│  │ WRITER      │      │             │      │             │   │
│  └─────────────┘      └─────────────┘      └─────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Características:                                               │
│ - Comunicación asíncrona entre agentes                        │
│ - Estado compartido via Vector DB (Qdrant)                     │
│ - Logs de auditoría inmutables                                │
│ - mTLS para comunicación interna                              │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Modelos de IA Locales (Ollama/LM Studio)

```
┌─────────────────────────────────────────────────────────────────┐
│                    MODELOS LOCALES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  MODELO PRINCIPAL (Para tareas generales):                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Qwen 2.5 72B                                           │   │
│  │ • Multilingual (Español excelente)                     │   │
│  │ • Reasoning complejo                                  │   │
│  │ • Context window: 32K tokens                           │   │
│  │ • Tamaño: ~42GB (Q4 quantization)                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  MODELO DE RAZONAMIENTO (Para análisis profundo):             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ DeepSeek-R1 70B                                        │   │
│  │ • Razonamiento paso a paso (Chain-of-Thought)          │   │
│  │ • Análisis de patrones complejos                       │   │
│  │ • Context window: 128K tokens                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  MODELOS LIGEROS (Para inferencia rápida):                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ • Qwen 2.5 7B (tareas simples, velocidad)             │   │
│  │ • DeepSeek-R1 1.5B (classificación, embeddings)       │   │
│  │ • Mistral 7B (balance costo/rendimiento)              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ EMBEDDINGS (Para RAG y similitud semántica):                   │
│ • BGE-M3 (multilingual, 1024 dims)                            │
│ • sentence-transformers (all-MiniLM-L6-v2, 384 dims)          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Capa de Datos

```
┌─────────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  VECTOR DATABASE (Memoria de Agentes):                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Qdrant (Recomendado)                                   │   │
│  │ • API REST nativa                                       │   │
│  │ • Filtering avanzado                                    │   │
│  │ • Quantización de vectores                              │   │
│  │ • HA clustering                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  BASE DE DATOS RELACIONAL (Datos estructurados):              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PostgreSQL 16 + pgvector                               │   │
│  │ • Datos INE/INEGI                                      │   │
│  │ • Census sintéticos                                    │   │
│  │ • Resultados electorales                               │   │
│  │ • Vectores de embeddings                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  DATA WAREHOUSE (Análisis OLAP):                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ DuckDB                                                  │   │
│  │ • Consultas analíticas rápidas                         │   │
│  │ • Lectura de Parquet                                   │   │
│  │ • Integración con Arrow                                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  FORMATOS DE INTERCAMBIO:                                      │
│  • Apache Arrow (parquet)                                      │
│  • JSON/JSONL (APIs)                                          │
│  • Protobuf (comunicación interna)                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Arquitectura de Agentes Multi-Nivel

### 4.1 Super Agente (Orquestador)

```yaml
SuperAgente:
  Rol: "Coordinador General del Sistema"
  Responsabilidades:
    - Analizar consulta del usuario
    - Descomponer tareas en subtareas
    - Delegar a agentes especializados
    - Coordinar flujo de datos entre agentes
    - Gestionar estado global del sistema
    - Compilar resultados finales

  Herramientas:
    - Orchestrator API (comunicación inter-agente)
    - Context Manager (memoria compartida)
    - Task Dispatcher (distribución de trabajo)

  Modelos:
    - Qwen 2.5 72B (coordinación general)
    - DeepSeek-R1 70B (razonamiento complejo)
```

### 4.2 Agente Data Collector

```yaml
DataCollector:
  Rol: "Recolector de Datos Cívicos"
  Responsabilidades:
    - Conexión con APIs INE (elecciones, distritos)
    - Conexión con APIs INEGI (censo, indicadores)
    - Web scraping de fuentes públicas (noticias, redes)
    - Normalización de datos
    - Almacenamiento en PostgreSQL/pgvector

  Herramientas:
    - INE API Client
    - INEGI API Client
    - Web Scraper (Playwright/Cheerio)
    - Data Normalizer
    - Vector Embedder (BGE-M3)

  Modelos:
    - Qwen 2.5 7B (extracción simple)
    - DeepSeek-R1 1.5B (clasificación rápida)

  Skills:
    - civic_data_collector
    - inegi_scraper
    - ine_connector
```

### 4.3 Agente Analyzer

```yaml
Analyzer:
  Rol: "Analizador de Puntos de Dolor"
  Responsabilidades:
    - Procesamiento de datos recolectados
    - Identificación de patrones geográficos
    - Clasificación de problemas ciudadanos
    - Generación de heat maps
    - Cálculo de probabilidades de impacto

  Herramientas:
    - Pain Point Classifier
    - GeoSpatial Analyzer
    - Heat Map Generator
    - Probability Calculator
    - Trend Analyzer

  Modelos:
    - Qwen 2.5 72B (análisis profundo)
    - DeepSeek-R1 70B (razonamiento de patrones)

  Skills:
    - pain_point_analyzer
    - geo_pattern_recognizer
    - probability_engine
```

### 4.4 Agente Simulator

```yaml
Simulator:
  Rol: "Motor de Simulación ABM"
  Responsabilidades:
    - Generación de población sintética
    - Ejecución de simulaciones de políticas
    - Cálculo de trayectorias temporales
    - Análisis de impacto (felicidad, PIB, empleo)
    - Proyecciones de intención de voto

  Herramientas:
    - ABM Engine (Agent-Based Modeling)
    - Policy Simulator
    - GDP Calculator
    - Happiness Index Tracker
    - Vote Intention Tracker

  Modelos:
    - DeepSeek-R1 70B (simulación de escenarios)
    - Qwen 2.5 72B (análisis de resultados)

  Skills:
    - abm_simulator
    - policy_impact_calculator
    - trajectory_predictor
```

### 4.5 Agente Recommender

```yaml
Recommender:
  Rol: "Generador de Recomendaciones"
  Responsabilidades:
    - Análisis de mejores prácticas históricas
    - Generación de planes de acción priorizados
    - Estimación de presupuestos
    - Creación de roadmaps
    - Identificación de riesgos y mitigaciones

  Herramientas:
    - Best Practices DB (Qdrant)
    - Priority Analyzer
    - Budget Estimator
    - Roadmap Generator
    - Risk Identifier

  Modelos:
    - Qwen 2.5 72B (recomendaciones estratégicas)
    - DeepSeek-R1 70B (análisis de riesgos)

  Skills:
    - recommendation_engine
    - priority_planner
    - risk_analyzer
```

### 4.6 Agente Integrator

```yaml
Integrator:
  Rol: "Integrador con Open Business Plan"
  Responsabilidades:
    - Transformación de datos al formato OBP
    - Comunicación con API de Open Business Plan
    - Validación de payload
    - Gestión de respuestas y errores
    - Coordinación de exportación final

  Herramientas:
    - OBP API Client
    - Payload Transformer
    - Data Validator
    - Error Handler

  Modelos:
    - Qwen 2.5 72B (transformación de datos)
    - Qwen 2.5 7B (validación rápida)

  Skills:
    - openbusinessplan_connector
    - payload_transformer
    - api_integrator
```

### 4.7 Agente Report Writer

```yaml
ReportWriter:
  Rol: "Generador de Informes Ejecutivos"
  Responsabilidades:
    - Síntesis de resultados de todos los agentes
    - Generación de informes ejecutivos
    - Creación de visualizaciones (gráficos, mapas)
    - Exportación a PDF/HTML
    - Generación de assets multimedia

  Herramientas:
    - Document Synthesizer
    - Chart Generator (Recharts)
    - PDF Exporter
    - Asset Generator

  Modelos:
    - Qwen 2.5 72B (síntesis de informes)
    - DeepSeek-R1 70B (análisis contextual)

  Skills:
    - report_generator
    - document_synthesizer
    - asset_creator
```

---

## 5. Contratos de API Inter-Agente

### 5.1 Formato de Mensajes JSON

```json
// Mensaje base para comunicación entre agentes
{
  "message_id": "uuid-v4",
  "timestamp": "2026-05-18T10:30:00Z",
  "sender": "SuperAgente",
  "receiver": "DataCollector",
  "message_type": "REQUEST|RESPONSE|ERROR|EVENT",
  "payload": {
    "action": "collect_district_data",
    "parameters": {
      "district_id": "D8",
      "data_sources": ["INE", "INEGI"],
      "date_range": {
        "start": "2024-01-01",
        "end": "2026-05-18"
      }
    },
    "context": {
      "user_id": "user-123",
      "session_id": "session-456",
      "priority": "HIGH"
    }
  },
  "metadata": {
    "model_used": "qwen2.5-72b",
    "tokens_processed": 1500,
    "processing_time_ms": 2300
  }
}
```

### 5.2 API de Orquestación

```yaml
POST /api/v1/orchestrate
  Request:
    Body:
      {
        "query": "Análisis de crisis de agua en Hermosillo D8",
        "context": {
          "district": "D8",
          "city": "Hermosillo",
          "state": "Sonora"
        },
        "options": {
          "depth": "full|partial",
          "include_simulations": true,
          "export_to_obp": true
        }
      }
  Response:
    Body:
      {
        "job_id": "job-789",
        "status": "PROCESSING",
        "progress": 0.25,
        "current_agent": "Analyzer"
      }

GET /api/v1/orchestrate/{job_id}
  Response:
    Body:
      {
        "job_id": "job-789",
        "status": "COMPLETED",
        "result": {
          "summary": "Análisis completado",
          "pain_points": [...],
          "recommendations": [...],
          "simulations": [...],
          "obp_export_status": "SUCCESS"
        },
        "audit_log": [...]
      }
```

### 5.3 API de Datos INE/INEGI

```yaml
GET /api/v1/ine/districts/{district_id}/results
  Response:
    Body:
      {
        "district_id": "D8",
        "election_year": 2024,
        "results": [
          {
            "candidate": "Candidatura A",
            "party": "Partido X",
            "votes": 45000,
            "percentage": 0.45
          }
        ]
      }

GET /api/v1/inegi/census/{district_id}
  Response:
    Body:
      {
        "district_id": "D8",
        "population": 85000,
        "demographics": {
          "age_distribution": {...},
          "economic_indicators": {...},
          "education_level": {...}
        }
      }
```

### 5.4 API de Open Business Plan Integration

```yaml
POST /api/v1/obp/export
  Headers:
    Authorization: Bearer {OBP_API_KEY}
    Content-Type: application/json
    X-Local-Transfer: true  # Indica transferencia local mTLS
  Request:
    Body:
      {
        "source": "civicpulse",
        "initiative_id": "INIT-2026-001",
        "data": {
          "problem_statement": "Crisis de agua en D8",
          "pain_points": [...],
          "recommendations": [...],
          "budget_estimate": 15000000,
          "timeline_months": 18,
          "stakeholders": [...]
        },
        "metadata": {
          "generated_at": "2026-05-18T10:30:00Z",
          "confidence_score": 0.87,
          "audit_hash": "sha256-abc123"
        }
      }
  Response:
    Body:
      {
        "export_id": "EXP-2026-001",
        "obp_project_id": "OBP-12345",
        "status": "CREATED",
        "roadmap_url": "https://obp.local/projects/OBP-12345/roadmap"
      }
```

---

## 6. Modelo de Datos Completo

### 6.1 Entidades Principales

```typescript
// src/models/dataModel.ts

interface GeographicEntity {
  id: string;
  type: 'country' | 'state' | 'municipality' | 'district' | 'zone';
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  boundaries?: GeoJSON.Polygon;
  parent_id?: string;
}

interface PainPoint {
  id: string;
  entity_id: string;
  category: PainCategory;
  title: string;
  description: string;
  intensity: number; // 0-100
  probability: number; // 0-1
  affected_population: number;
  economic_impact?: number;
  source: 'inegi' | 'ine' | 'survey' | 'social_media' | 'aggregated';
  timestamp: Date;
  metadata: Record<string, any>;
}

interface CandidateProfile {
  id: string;
  name: string;
  party: string;
  district_id: string;
  profile_type: 'economic_reformer' | 'social_defender' | 'security_strong' | 'development_focus' | 'establishment';
  policy_positions: Record<string, number>; // -1 to 1
  historical_performance?: {
    elections_won: number;
    promises_fulfilled: number;
    total_promises: number;
  };
  electoral_history: {
    year: number;
    votes: number;
    percentage: number;
    result: 'win' | 'lose';
  }[];
}

interface Agent {
  id: string;
  sector: AgentSector;
  attributes: {
    age: number;
    income_level: number; // 0-1
    education_level: number; // 0-1
    political_leaning: number; // -1 to 1
    issue_priorities: Record<PainCategory, number>;
  };
  opinions: Record<string, number>; // current opinions on issues
  happiness: number; // 0-100
  voting_intention?: string; // candidate_id or null
  behavior_patterns: {
    media_consumption: number;
    civic_engagement: number;
    protest_tendency: number;
  };
}

interface PolicyIntervention {
  id: string;
  name: string;
  description: string;
  category: PolicyCategory;
  target_sectors: AgentSector[];
  effects: {
    happiness_delta: number;
    gdp_impact: number;
    employment_impact: number;
    environment_impact?: number;
    timeframe_years: number;
  };
  cost: number;
  implementation_difficulty: 'low' | 'medium' | 'high';
}

interface SimulationResult {
  id: string;
  policy_id: string;
  simulation_params: {
    population_size: number;
    time_horizon_years: number;
    iterations: number;
  };
  trajectory: {
    year: number;
    metrics: {
      avg_happiness: number;
      gdp: number;
      unemployment: number;
      vote_intention: Record<string, number>;
    };
  }[];
  outcomes: {
    expected_happiness_gain: number;
    expected_gdp_growth: number;
    expected_electoral_impact: Record<string, number>;
    risk_factors: string[];
  };
}
```

### 6.2 Colecciones de Vector Database (Qdrant)

```json
{
  "collections": [
    {
      "name": "pain_points_knowledge",
      "description": "Base de conocimiento de puntos de dolor históricos",
      "vector_size": 1024,
      "payload_schema": {
        "category": "keyword",
        "district": "keyword",
        "intensity": "float",
        "resolution_status": "keyword",
        "effective_solutions": "text[]"
      }
    },
    {
      "name": "electoral_patterns",
      "description": "Patrones electorales históricos",
      "vector_size": 1024,
      "payload_schema": {
        "district": "keyword",
        "year": "integer",
        "winning_profile": "text",
        "key_factors": "text[]",
        "predictors": "float[]"
      }
    },
    {
      "name": "policy_effectiveness",
      "description": "Efectividad de políticas públicas",
      "vector_size": 1024,
      "payload_schema": {
        "policy_category": "keyword",
        "outcomes": "float[]",
        "context_factors": "text[]",
        "replicability_score": "float"
      }
    }
  ]
}
```

---

## 7. Flujo de Usuario End-to-End

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO COMPLETO DE USUARIO                          │
└─────────────────────────────────────────────────────────────────────────────┘

[USUARIO]
    │
    │ 1. "Quiero analizar la crisis de agua en Hermosillo D8"
    │
    ▼
[FRONTEND: CivicPulse Web App]
    │
    │ 2. Envía query al Orchestrator API
    │
    ▼
[SUPER AGENTE]
    │
    │ 3. Analiza y descompone en tareas
    │
    ├──────────────────┬──────────────────┬──────────────────┐
    ▼                  ▼                  ▼                  ▼
[DATA COLLECTOR]  [ANALYZER]       [SIMULATOR]        [RECOMMENDER]
    │                  │                  │                  │
    │ 4a. Recolecta    │ 4b. Procesa       │ 4c. Simula       │ 4d. Genera
    │ datos INE/INEGI  │ patrones de      │ políticas con   │ recomendaciones
    │                  │ dolor             │ ABM             │
    │                  │                   │                  │
    ▼                  ▼                  ▼                  ▼
[POSTGRESQL/      [HEAT MAP]      [SIMULATION        [PLAN DE
 QDRANT]          GENERATOR]      RESULTS]            ACCIÓN]
    │                  │                  │                  │
    └──────────────────┴──────────────────┴──────────────────┘
                                    │
                                    ▼
                        [REPORT WRITER]
                                    │
                                    │ 5. Genera informe
                                    │
                                    ▼
[FRONTEND: Dashboard]
    │
    │ 6. Muestra resultados al usuario
    │
    ▼
[USUARIO]
    │
    │ 7. "¿Exportar a Open Business Plan?"
    │
    ▼
[INTEGRATOR + OBP API]
    │
    │ 8. Transforma y envía payload
    │
    ▼
[OPEN BUSINESS PLAN]
    │
    │ 9. Genera roadmap ejecutable
    │
    ▼
[USUARIO]
    │
    └─► Recibe solución completa con plan de ataque
```

---

## 8. Seguridad y Cumplimiento Normativo

### 8.1 Auditoría Local (Local Audit Logs)

```typescript
interface AuditLog {
  id: string;
  timestamp: Date;
  action: string;
  agent_id: string;
  user_id?: string;
  data_accessed: {
    type: 'INE' | 'INEGI' | 'USER_DATA' | 'INTERNAL';
    records: number;
  };
  cryptographic_hash: string; // SHA-256 de los datos procesados
  compliance_flags: ('GDPR' | 'LGPD' | 'INE_PRIVACY' | 'LOCAL_ONLY')[];
  session_id: string;
}
```

### 8.2 Transferencia Local (mTLS)

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMUNICACIÓN LOCAL                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [CivicPulse] <─────── mTLS Local ───────> [Open Business Plan]│
│                                                                 │
│  • Certificados autofirmados locales                           │
│  • Sin datos saliendo a internet                               │
│  • Cifrado end-to-end                                         │
│  • Validación de identidad de servicios                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Roadmap de Implementación

### Fase 1: MVP (Meses 1-3)
- [ ] Orchestrator básico con 3 agentes
- [ ] Data Collector INE/INEGI
- [ ] Pain Points Map funcional
- [ ] Dashboard de análisis básico

### Fase 2: Simulación (Meses 4-6)
- [ ] ABM Engine completo
- [ ] Simulator con 1,000+ agentes
- [ ] Policy impact calculator
- [ ] Electoral predictor

### Fase 3: Integración (Meses 7-9)
- [ ] Open Business Plan connector
- [ ] Report generator completo
- [ ] PDF export
- [ ] Multi-tenant support

### Fase 4: Escalamiento (Meses 10-12)
- [ ] Fine-tuning de modelos custom
- [ ] Optimización para H100
- [ ] API pública
- [ ] Documentation completa

---

## 10. Métricas de Éxito

| Métrica | Objetivo | Medición |
|---------|----------|----------|
| Tiempo de respuesta | < 30s para análisis completo | Logs de orquestación |
| Accuracy de predicción | > 85% vs resultados reales | Backtesting electoral |
| Satisfacción de usuario | NPS > 50 | Encuestas post-análisis |
| Tasa de conversión OBP | > 30% de análisis → exportación | Funnel analytics |
| Uptime del sistema | > 99.5% | Monitoring |
| Latencia de inferencia | < 5s por query | Ollama metrics |

---

*Documento actualizado: 2026-05-18*
*Versión: 1.0.0*