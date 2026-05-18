# C4 Model - Context Diagram (Nivel 1)

## Sistema: CivicPulse / CívicaOS

```
                    ┌─────────────────────────────────────┐
                    │         Ciudadano / Votante          │
                    │  (Participa en encuestas, consulta   │
                    │   mapas de calor, propone ideas)       │
                    └──────────────┬──────────────────────┘
                                   │ HTTPS
                                   ▼
┌──────────────┐          ┌─────────────────────────────────────┐          ┌──────────────┐
│   INE /      │          │         CIVICPULSE / CÍVICAOS        │          │  Open        │
│   INEGI      │◄────────►│                                      │◄────────►│  Business    │
│  (Datos      │  ETL     │  ┌─────────┐ ┌─────────┐ ┌────────┐ │  mTLS    │  Plan        │
│   oficiales) │  seguro  │  │ Civic   │ │ Civic   │ │ Civic  │ │  JSON    │  (Soluciones │
└──────────────┘          │  │ Data    │ │ Simul.  │ │ Predic.│ │          │   ejecutables│
                          │  └─────────┘ └─────────┘ └────────┘ │          └──────────────┘
┌──────────────┐          │                                      │
│  Redes       │          │  ┌─────────┐ ┌─────────┐           │
│  Sociales /  │◄────────►│  │ Civic   │ │ Civic   │           │
│  Medios      │  NLP     │  │ Orch.   │ │ Secur.  │           │
│  (Sentimiento)│         │  └─────────┘ └─────────┘           │
└──────────────┘          └─────────────────────────────────────┘
                                   ▲
                                   │ gRPC / mTLS
                    ┌──────────────┴──────────────────────┐
                    │      Estratega Político /           │
                    │      Inversor Tech Cívica           │
                    │  (Consulta predictor, simula        │
                    │   escenarios, exporta a OBP)         │
                    └─────────────────────────────────────┘
```

## Actores y Sistemas Externos

| Actor/Sistema | Descripción | Tecnología de Interfaz |
|---------------|-------------|----------------------|
| **Ciudadano** | Usuario final que participa y consulta | Web/Mobile App (React) |
| **Estratega** | Usuario de negocio que toma decisiones | Dashboard premium + API |
| **INE** | Fuente de datos electorales oficiales | ETL batch, CSV/JSON descargas |
| **INEGI** | Fuente de datos sociodemográficos | API REST (datos abiertos) |
| **SESNSP** | Fuente de datos de seguridad | ETL batch |
| **Redes Sociales** | Sentimiento ciudadano en tiempo real | Scraping ético + NLP |
| **Open Business Plan** | Sistema externo de planes ejecutivos | API REST con mTLS |

## Casos de Uso Principales

1. **UC-01**: Ciudadano reporta punto de dolor → Sistema georreferencia y categoriza
2. **UC-02**: Estratega consulta mapa de calor → Sistema visualiza datos agregados
3. **UC-03**: Estratega simula política pública → Sistema corre ABM y proyecta impacto
4. **UC-04**: Estratega evalúa candidato → Sistema predice probabilidad electoral
5. **UC-05**: Estratega genera informe completo → Orquestador coordina 6 agentes
6. **UC-06**: Sistema exporta a OBP → Payload JSON con mTLS
