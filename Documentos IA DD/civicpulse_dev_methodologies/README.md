# CívicaOS / CivicPulse - Development Methodologies Package

## Package Contents

This package contains the complete development methodology artifacts for the CivicPulse platform, covering all 12 "DD" approaches requested plus GIS and SNA modules:

| # | Methodology | Directory | Key Artifacts |
|---|-------------|-----------|---------------|
| 01 | **DDD** - Domain-Driven Design | `01-DDD-domain-driven-design/` | Ubiquitous Language, Domain Model, Events |
| 02 | **TDD** - Test-Driven Development | `02-TDD-test-driven-development/` | Test Suites, ABM Tests, Security Tests |
| 03 | **BDD/ATDD** - Behavior/Acceptance Test-Driven | `03-BDD-ATDD-behavior-acceptance/` | Gherkin Features, Step Definitions, Acceptance Matrix |
| 04 | **SDD** - Security-Driven Design | `04-SDD-security-driven-design/` | Threat Model (STRIDE), Security Architecture, Privacy Tests |
| 05 | **ADD** - Architecture-Driven Design | `05-ADD-architecture-driven-design/` | C4 Model (Context, Container, Component), ADRs |
| 06 | **EDD** - Event-Driven Design | `06-EDD-event-driven-design/` | Event Catalog, Event Store, Event Flows |
| 07 | **UXDD** - UX-Driven Design | `07-UXDD-ux-driven-design/` | Personas, Journey Maps, Wireframes, Design System |
| 08 | **CDD** - Component-Driven Design | `08-CDD-component-driven-design/` | Component Inventory, Storybook Stories, Templates |
| 09 | **IDD** - Interface-Driven Design | `09-IDD-interface-driven-design/` | OpenAPI Contracts, TypeScript Interfaces, Postman Collection |
| 10 | **MDD** - Model-Driven Development | `10-MDD-model-driven-development/` | DB Schema, Migrations, Seed Data |
| 11 | **GIS** - Real-World GIS Mapping | `11-GIS-real-world-mapping/` | INE/INEGI Integration, Hexagonal Binning, Heatmap Engine |
| 12 | **SNA** - Social Network Analysis | `12-SNA-social-network-analysis/` | CIVIC Model (ethical OCEAN), Community Detection, Bot Detection |

## Quick Start

1. **Database Setup**: Run `10-MDD-model-driven-development/migration_initial.py` then `seed_hermosillo.py`
2. **API Testing**: Import `09-IDD-interface-driven-design/postman-collection.json.md` into Postman
3. **Run Tests**: Execute `02-TDD-test-driven-development/test_abm_engine.py` with pytest
4. **UI Development**: Reference `08-CDD-component-driven-design/component-templates.md` for React components
5. **GIS Analysis**: Run `11-GIS-real-world-mapping/civic_gis_engine.py` for precinct-level mapping
6. **Network Analysis**: Run `12-SNA-social-network-analysis/civic_sna_engine.py` for community detection

## Architecture Overview

```
Ciudadano/Estratega/Inversor
        |
        v
┌─────────────────────────────────────┐
│  React Frontend (Glassmorphism UI)   │
│  ├── Dashboard + Mapa de Calor       │
│  ├── ABM Sandbox Simulator           │
│  ├── Predictor Electoral             │
│  └── Orquestador OpenClaw            │
└─────────────────────────────────────┘
        | HTTPS/WebSocket
        v
┌─────────────────────────────────────┐
│  FastAPI Backend (Python)            │
│  ├── CivicData (ETL INE/INEGI)      │
│  ├── CivicSimulation (ABM Engine)   │
│  ├── CivicPrediction (XGBoost/ML)  │
│  ├── CivicOrchestration (CrewAI)    │
│  ├── CivicGIS (PostGIS + H3)        │
│  ├── CivicSNA (NetworkX + Louvain)  │
│  └── CivicIntegration (OBP/mTLS)     │
└─────────────────────────────────────┘
        | gRPC/REST
        v
┌─────────────────────────────────────┐
│  Data Layer                          │
│  ├── PostgreSQL + PostGIS            │
│  ├── Redis (Cache/Queues)            │
│  └── pgvector (Embeddings)           │
└─────────────────────────────────────┘
        | mTLS
        v
┌─────────────────────────────────────┐
│  Open Business Plan (External)       │
│  └── Planes ejecutivos generados     │
└─────────────────────────────────────┘
```

## Hardware Tiers

| Tier | Hardware | Use Case |
|------|----------|----------|
| 1 | Mac Mini M4 16GB | Development, UI, models <=7B, small GIS |
| 2 | NVIDIA DGX Spark | ABM simulation, models 27-72B, SNA medium graphs |
| 3 | 4x-8x H100/H200 | Training, national scale ABM, large SNA graphs |

## Ethical Framework: CivicPulse vs Cambridge Analytica

| Aspect | Cambridge Analytica | CivicPulse |
|--------|-------------------|------------|
| **Data Collection** | Non-consensual (87M Facebook users) | Explicit granular consent |
| **Psychographic Model** | OCEAN (Big Five) inferred from likes | CIVIC (Community, Interest, Values, Influence, Connection) |
| **Targeting** | Microtargeting for manipulation | Macrotargeting for public policy |
| **Transparency** | Dark posts, hidden from public | Public audit ledger, open algorithms |
| **Privacy** | None | Differential privacy (ε≤1.0), k-anonymity |
| **Purpose** | Electoral manipulation | Democratic empowerment |

## License

All artifacts are provided as reference implementation for the CivicPulse project.

Generated: 2026-05-17
Version: MVP-v1.1
