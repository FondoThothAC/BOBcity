# Event Catalog - CivicPulse Event-Driven Architecture

## Event Topology

```
┌─────────────────────────────────────────────────────────────────┐
│                     Event Bus (Redis Pub/Sub + Streams)          │
│                                                                  │
│  Topic: civic.data.raw          ──► DataCollector, ETL         │
│  Topic: civic.data.processed    ──► Analyzer, Storage            │
│  Topic: civic.analysis.complete ──► Simulator, Predictor         │
│  Topic: civic.sim.result        ──► Recommender, Dashboard       │
│  Topic: civic.recommendation    ──► Integrator, ReportWriter   │
│  Topic: civic.obp.export       ──► OBP Integration               │
│  Topic: civic.audit.ledger    ──► Security, Compliance           │
│  Topic: civic.alert.critical    ──► All subscribers (broadcast)  │
└─────────────────────────────────────────────────────────────────┘
```

## Event Schema Registry (Avro-like JSON Schema)

### Event: civic.data.raw.collected
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "RawDataCollected",
  "type": "object",
  "required": ["eventId", "timestamp", "source", "territorioId", "payload"],
  "properties": {
    "eventId": {"type": "string", "format": "uuid"},
    "timestamp": {"type": "string", "format": "date-time"},
    "source": {"type": "string", "enum": ["INE", "INEGI", "SESNSP", "SOCIAL", "SURVEY"]},
    "territorioId": {"type": "string", "pattern": "^\d{2}-\d{3}$"},
    "payload": {
      "type": "object",
      "properties": {
        "dataType": {"type": "string"},
        "recordsCount": {"type": "integer", "minimum": 1},
        "checksum": {"type": "string", "pattern": "^[a-f0-9]{64}$"},
        "sensitive": {"type": "boolean"}
      }
    },
    "metadata": {
      "tier": {"type": "integer", "minimum": 1, "maximum": 3},
      "privacyLevel": {"type": "string", "enum": ["public", "aggregated", "sensitive", "restricted"]}
    }
  }
}
```

### Event: civic.simulation.completed
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "SimulationCompleted",
  "type": "object",
  "required": ["eventId", "simulationId", "status", "results"],
  "properties": {
    "eventId": {"type": "string", "format": "uuid"},
    "simulationId": {"type": "string"},
    "timestamp": {"type": "string", "format": "date-time"},
    "status": {"type": "string", "enum": ["success", "partial", "failed"]},
    "territorioId": {"type": "string"},
    "horizonMonths": {"type": "integer"},
    "results": {
      "type": "object",
      "properties": {
        "finalStates": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "sectorType": {"type": "string"},
              "felicidad": {"type": "number"},
              "confianza": {"type": "number"},
              "ingreso": {"type": "number"}
            }
          }
        },
        "electoralProjection": {
          "type": "object",
          "additionalProperties": {"type": "number"}
        },
        "costoTotal": {"type": "number"},
        "roiSocial": {"type": "number"}
      }
    }
  }
}
```

## Event Flow Diagrams

### Flow 1: Encuesta Ciudadana → Mapa de Calor
```
[ Ciudadano envia encuesta ]
         │
         ▼
[ civic.data.raw.collected ]
         │
         ▼
[ DataCollector valida y enriquece ]
         │
         ▼
[ civic.data.processed ]
         │
         ▼
[ Analyzer: NLP + Clustering ]
         │
         ▼
[ civic.analysis.complete ]
         │
         ▼
[ PostGIS: Actualiza capa geografica ]
         │
         ▼
[ civic.alert.critical ] ──► Dashboard actualiza mapa
```

### Flow 2: Simulacion de Politica Publica
```
[ Estratega selecciona politica en sandbox ]
         │
         ▼
[ civic.simulation.requested ]
         │
         ▼
[ Simulator: Inicializa ABM con config actual ]
         │
         ▼
[ civic.simulation.step ] (cada mes simulado)
         │
         ▼
[ Simulator: Aplica reglas, actualiza agentes ]
         │
         ▼
[ civic.simulation.step ] ... (loop 120 veces para 10 anos)
         │
         ▼
[ civic.simulation.completed ]
         │
         ▼
[ Recommender: Analiza resultados, genera insights ]
         │
         ▼
[ civic.recommendation.generated ]
         │
         ▼
[ Dashboard: Renderiza graficas + proyeccion electoral ]
```

## Event Sourcing vs CQRS

### Decision: Event Sourcing para Ledger de Auditoria
- **Por que**: Inmutabilidad completa, replay de operaciones, compliance
- **Implementacion**: PostgreSQL con tabla `events` append-only
- **Snapshot**: Cada 1000 eventos para performance

### Decision: CQRS para Dashboard y Mapas
- **Por que**: Lecturas frecuentes, escrituras esporadicas
- **Read Model**: PostgreSQL materialized views + Redis cache
- **Write Model**: Event store + proyeccion async
