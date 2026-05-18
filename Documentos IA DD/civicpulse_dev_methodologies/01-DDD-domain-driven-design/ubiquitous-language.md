# Ubiquitous Language - CívicaOS / CivicPulse

## Core Domain: Civic Intelligence & Electoral Prediction

| Término (Español) | Término (Inglés) | Definición | Contexto |
|-------------------|------------------|------------|----------|
| **Territorio** | Territory | Unidad geográfica electoral con atributos sociodemográficos | DDD, ABM, Predictor |
| **Agente Sector** | Sector Agent | Meta-agente representativo de un segmento poblacional | ABM |
| **Población Sintética** | Synthetic Population | Conjunto de agentes virtuales derivados de datos censales | ABM, Privacy |
| **Punto de Dolor** | Pain Point | Necesidad ciudadana prioritaria detectada por NLP/clustering | Analytics |
| **Gemelo Digital Social** | Social Digital Twin | Modelo ABM calibrado del tejido social territorial | Simulation |
| **Predictor Electoral** | Electoral Predictor | Motor ML que estima probabilidad de victoria | ML, Analytics |
| **Matriz de Perfiles** | Profile Matrix | Cuantificación de atributos de candidatos | Data Model |
| **Intención de Voto** | Vote Intention | Probabilidad de preferencia electoral de un agente | ABM, Predictor |
| **Política Pública** | Public Policy | Intervención simulable con parámetros de impacto | ABM, Simulation |
| **Auditoría de Promesas** | Promise Audit | Comparación post-electoral entre propuestas y acciones | Governance |
| **Orquestador** | Orchestrator | Super-agente que coordina flujos multi-agente | Agent System |
| **Skill** | Skill | Capacidad especializada ejecutable por un agente | Agent System |
| **Enjambre** | Swarm | Conjunto de agentes especializados en ejecución concurrente | Agent System |
| **Ledger de Auditoría** | Audit Ledger | Registro inmutable de operaciones con hash criptográfico | Security |
| **Open Business Plan** | OBP | Sistema externo de generación de planes ejecutivos | Integration |

## Bounded Contexts

1. **CivicData** (Datos Cívicos): Ingesta, limpieza, anonimización de datos INE/INEGI
2. **CivicSimulation** (Simulación Cívica): Motor ABM, gemelo digital, escenarios what-if
3. **CivicPrediction** (Predicción Cívica): ML, análisis de sentimiento, predictor electoral
4. **CivicOrchestration** (Orquestación Cívica): Multi-agentes, skills, flujos automáticos
5. **CivicIntegration** (Integración Cívica): APIs, exportación a OBP, interoperabilidad
6. **CivicSecurity** (Seguridad Cívica): Privacidad diferencial, ZKP, auditoría, mTLS

## Aggregates

### Aggregate: TerritorioElectoral
- **Root Entity**: Territorio
- **Value Objects**: CoordenadasGeo, IndicadorSocial, IndicadorEconomico
- **Entities Child**: AgenteSector, ResultadoHistorico
- **Invariants**: 
  - CVEGEO debe ser válido INEGI
  - Indicadores sociodemográficos deben sumar coherencia demográfica
  - No puede existir sin al menos un AgenteSector

### Aggregate: Candidatura
- **Root Entity**: Candidato
- **Value Objects**: PropuestaVector, PerfilScore, Trayectoria
- **Entities Child**: Propuesta, ResultadoElectoral
- **Invariants**:
  - Debe tener territorio asignado
  - Score de propuesta calculado por NLP (0-100)
  - No puede competir en dos territorios simultáneos

### Aggregate: SimulacionSocial
- **Root Entity**: Escenario
- **Value Objects**: ConfiguracionPolitica, HorizonteTemporal
- **Entities Child**: EstadoAgente, PoliticaAplicada
- **Invariants**:
  - Horizonte máximo 50 años (límite computacional)
  - Al menos 3 sectores poblacionales
  - Estado inicial validado contra datos INEGI

### Aggregate: Orquestacion
- **Root Entity**: FlujoOrquestado
- **Value Objects**: ConfiguracionSwarm, SkillManifest
- **Entities Child**: AgenteEspecializado, LogEjecucion, LedgerAuditoria
- **Invariants**:
  - Cada ejecución genera LedgerAuditoria inmutable
  - Skills deben estar en registry válido
  - Timeout máximo por agente: 300 segundos
