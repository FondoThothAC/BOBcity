# C4 Model - Component Diagram: Orquestador OpenClaw

## Componentes del Orquestador

```
┌─────────────────────────────────────────────────────────────────┐
│                    Orquestador OpenClaw                          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              SwarmOrchestrator (Core)                  │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │    │
│  │  │ Task Queue   │ │ State Machine│ │ Event Bus    │ │    │
│  │  │ (Redis)      │ │ (LangGraph)  │ │ (gRPC)       │ │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Agent Registry & Skills                   │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │    │
│  │  │ Skill Loader │ │ Skill Validator│ │ Skill Sandbox│   │    │
│  │  │ (JSON/YAML)  │ │ (Schema check)│ │ (WASM/Docker)│   │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Specialized Agents                          │    │
│  │                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │ SuperAgent  │  │ DataCollector│  │ Analyzer    │     │    │
│  │  │ (Router)    │  │ (Scraper/API)│  │ (NLP/Stats) │     │    │
│  │  │             │  │             │  │             │     │    │
│  │  │ • Route task│  │ • INE/INEGI │  │ • Clustering│     │    │
│  │  │ • Delegate  │  │ • Social    │  │ • Sentiment │     │    │
│  │  │ • Monitor   │  │ • Sensors   │  │ • Trends    │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │    │
│  │                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │ Simulator   │  │ Recommender │  │ Integrator  │     │    │
│  │  │ (ABM)       │  │ (Strategy)  │  │ (OBP)       │     │    │
│  │  │             │  │             │  │             │     │    │
│  │  │ • Mesa/ABM  │  │ • Scoring   │  │ • mTLS      │     │    │
│  │  │ • What-if   │  │ • Ranking   │  │ • Payload   │     │    │
│  │  │ • Projection│  │ • Roadmap   │  │ • Confirm   │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │    │
│  │                                                          │    │
│  │  ┌─────────────┐                                         │    │
│  │  │ ReportWriter│                                         │    │
│  │  │ (Markdown/  │                                         │    │
│  │  │  PDF gen)   │                                         │    │
│  │  └─────────────┘                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Audit & Compliance Layer                    │    │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐     │    │
│  │  │ Ledger       │ │ Privacy      │ │ Compliance   │     │    │
│  │  │ (SHA-256)    │ │ (Differential)│ │ (GDPR/LGPD)  │     │    │
│  │  └──────────────┘ └──────────────┘ └──────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Flujo de Datos entre Agentes

```
SuperAgent → DataCollector: "Recolecta datos de seguridad en Hermosillo D8"
DataCollector → Analyzer: "Dataset crudo: 15k registros de SESNSP"
Analyzer → Simulator: "Tendencia: +23% homicidios, cluster: jóvenes 18-25"
Simulator → Recommender: "Impacto simulado: política X reduce 12% en 3 años"
Recommender → Integrator: "Top 3 propuestas con ROI político >70%"
Integrator → OBP: "Payload JSON: plan de seguridad con budget $45M"
ReportWriter → User: "Informe PDF completo con gráficas y roadmap"
```

## Interfaces entre Componentes

| Origen | Destino | Protocolo | Payload | Frecuencia |
|--------|---------|-----------|---------|------------|
| SuperAgent | DataCollector | gRPC | TaskDefinition | On-demand |
| DataCollector | PostgreSQL | SQL | RawData | Batch |
| Analyzer | Redis | Pub/Sub | AnalysisResult | Real-time |
| Simulator | ABM Engine | gRPC | SimulationConfig | On-demand |
| Recommender | ReportWriter | gRPC | RecommendationSet | On-demand |
| Integrator | OBP API | mTLS+JSON | BusinessPlanPayload | On-demand |
| All Agents | Ledger | Async | AuditEntry | Every operation |
