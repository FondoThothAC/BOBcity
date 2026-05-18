# C4 Model - Container Diagram (Nivel 2)

## Containers dentro de CivicPulse

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CIVICPULSE / CÍVICAOS                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        Frontend (React + Vite)                       │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │    │
│  │  │ Dashboard    │ │ PainPoints   │ │ ABM Sandbox  │ │ Predictor │ │    │
│  │  │ Principal    │ │ Map (Leaflet)│ │ Simulator    │ │ Engine    │ │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │    │
│  │  │ Orquestador  │ │ Ledger Audit │ │ OBP Export   │              │    │
│  │  │ Console      │ │ Viewer       │ │ Modal        │              │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │ HTTPS/WebSocket                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     API Gateway (Kong / Nginx)                       │    │
│  │         Auth (JWT), Rate Limiting, mTLS termination                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │ gRPC / REST                            │
│                    ┌───────────────┼───────────────┐                        │
│                    ▼               ▼               ▼                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐            │
│  │  Civic Data       │ │  Civic Simul.   │ │  Civic Predic.  │            │
│  │  Service          │ │  Service        │ │  Service        │            │
│  │  (Python/FastAPI) │ │  (Python/FastAPI)│ │  (Python/FastAPI)│           │
│  │                   │ │                 │ │                 │            │
│  │  • ETL INE/INEGI │ │  • ABM Engine   │ │  • XGBoost      │            │
│  │  • NLP Pipeline  │ │  • Mesa/AgentPy │ │  • Sentiment ML │            │
│  │  • Data Cleaning │ │  • Synthetic Pop│ │  • Explainability│           │
│  └─────────┬─────────┘ └─────────┬───────┘ └─────────┬───────┘            │
│            │                     │                   │                    │
│            ▼                     ▼                   ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     Data Layer                                      │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌───────────┐ │   │
│  │  │ PostgreSQL   │ │ PostGIS      │ │ Redis        │ │ pgvector  │ │   │
│  │  │ (Datos       │ │ (Datos       │ │ (Cache /     │ │ (Embeddings│ │   │
│  │  │  estructurados)│  espaciales)  │ │  Colas)      │ │  textos)  │ │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └───────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  Orquestador (CrewAI / AutoGen)                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │   │
│  │  │Super    │ │Data     │ │Analyzer │ │Simulator│ │Recomm.  │   │   │
│  │  │Agent    │ │Collector│ │         │ │         │ │         │   │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │   │
│  │  ┌─────────┐ ┌─────────┐                                         │   │
│  │  │Integrator│ │Report   │                                         │   │
│  │  │(OBP)    │ │Writer   │                                         │   │
│  │  └─────────┘ └─────────┘                                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  LLM Inference Layer (vLLM / Ollama)                │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │   │
│  │  │ Qwen 2.5 7B  │ │ Qwen 72B     │ │ Nemotron-3   │              │   │
│  │  │ (NLP ligero) │ │ (Razonam.)   │ │ (Code/Agent) │              │   │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │   │
│  │  Tier 1: Mac Mini M4 16GB  |  Tier 2: DGX Spark  |  Tier 3: H100 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Decisiones Arquitectónicas (ADRs)

### ADR-001: Separación en microservicios vs monolito
- **Decisión**: Monolito modular para MVP, migrar a microservicios en Fase 2
- **Razón**: Velocidad de desarrollo, despliegue simple, equipo pequeño
- **Consecuencia**: Escalabilidad limitada, pero suficiente para 10-50 clientes

### ADR-002: PostgreSQL + PostGIS vs base de datos especializada
- **Decisión**: PostgreSQL con extensiones (PostGIS, pgvector)
- **Razón**: Una sola base de datos para todo reduce complejidad operativa
- **Consecuencia**: Límite en escalabilidad de embeddings, pero manejable con particionamiento

### ADR-003: Python FastAPI vs Node.js para backend
- **Decisión**: Python FastAPI para todo el backend
- **Razón**: Ecosistema ML/AI maduro, ABM en Python, equipo con expertise Python
- **Consecuencia**: Frontend en JS/TS, backend en Python = dos lenguajes

### ADR-004: vLLM vs Ollama para inferencia local
- **Decisión**: vLLM en producción (Tier 2/3), Ollama en desarrollo (Tier 1)
- **Razón**: vLLM = throughput, Ollama = simplicidad
- **Consecuencia**: Configuración dual, pero separación clara por tier

### ADR-005: CrewAI vs AutoGen para orquestación
- **Decisión**: CrewAI para flujos estructurados (informes), AutoGen para discusión
- **Razón**: CrewAI = producción de documentos, AutoGen = exploración creativa
- **Consecuencia**: Dos frameworks de agentes, pero roles bien definidos
