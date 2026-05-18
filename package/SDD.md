# SDD - Documento de Diseño de Software
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 1.0.0
**Fecha:** 2026-05-18
**Autor:** MiniMax Agent
**Estado:** Especificación正式

---

## 1. Introducción

### 1.1 Propósito del Documento

El Documento de Diseño de Software (SDD) establece la arquitectura técnica y las decisiones de diseño que guiarán la implementación de CívicaOS. Este documento traduce los requisitos funcionales y no funcionales en una estructura de software coherente, definiendo los módulos principales, sus responsabilidades, las interfaces entre ellos, y los patrones de diseño que se aplicarán. El objetivo es proporcionar una guía técnica clara que permita a los desarrolladores implementar el sistema de manera consistente y mantenible.

### 1.2 Alcance del Sistema

El alcance de cívicaOS abarca el desarrollo de una plataforma web completa con backend de orquestación de agentes de IA. El sistema incluye un frontend en React con TypeScript que proporciona la interfaz de usuario para el análisis cívico, la simulación de políticas y la predicción electoral. El backend se implementa como una colección de servicios Node.js que gestionan la lógica de negocio, la comunicación con modelos de IA locales a través de Ollama, y la integración con APIs externas como INE, INEGI y Open Business Plan.

### 1.3 Definiciones, Acrónimos y Abreviaturas

Para asegurar una comprensión común, definimos los siguientes términos técnicos utilizados en este documento. ABM significa Agent-Based Modeling (Modelado Basado en Agentes), una técnica de simulación que modela las acciones e interacciones de agentes autónomos para evaluar su efecto en el sistema global. API significa Application Programming Interface, el conjunto de definiciones y protocolos para construir aplicaciones de software. DTO significa Data Transfer Object, un objeto que transporta datos entre procesos. ETL significa Extract, Transform, Load, el proceso de integración de datos. GUI significa Graphical User Interface, la interfaz visual del usuario. ORM significa Object-Relational Mapping, una técnica de programación para convertir entre sistemas de bases de datos y modelos de objetos. REST significa Representational State Transfer, un estilo arquitectónico para servicios web.

---

## 2. Diseño de Arquitectura

### 2.1 Visión General de la Arquitectura

La arquitectura de cívicaOS sigue el patrón de arquitectura hexagonal (también conocida como Ports and Adapters) combinada con una arquitectura de microservicios ligeros. Esta aproximación permite una separación clara de preocupaciones, donde la lógica de dominio permanece independiente de las tecnologías externas, facilitando las pruebas y el mantenimiento a largo plazo.

La arquitectura se organiza en tres capas principales: la capa de presentación que contiene el frontend en React con sus componentes UI y estado global, la capa de aplicación que implementa los servicios de negocio y la orquestación de agentes, y la capa de datos que gestiona la persistencia en PostgreSQL, el almacén vectorial en Qdrant, y la comunicación con servicios externos.

### 2.2 Diagrama de Arquitectura de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CAPA DE PRESENTACIÓN                                │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND (React + TypeScript)                    │   │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │   │
│  │  │ PainPoints│ │    ABM    │ │ Predictor│ │ Analytics│ │   Data    │  │   │
│  │  │   Map     │ │ Simulator │ │  Engine  │ │Dashboard │ │   Hub     │  │   │
│  │  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘  │   │
│  │        └─────────────┴─────────────┴─────────────┴─────────────┘        │   │
│  │                                 │                                         │   │
│  │                    ┌────────────┴────────────┐                          │   │
│  │                    │   OrchestratorConsole   │                          │   │
│  │                    │   (Consola Interactiva)  │                          │   │
│  │                    └────────────┬────────────┘                          │   │
│  └──────────────────────────────┼──────────────────────────────────────────┘   │
│                                 │                                              │
├────────────────────────────────┼────────────────────────────────────────────────┤
│                              CAPA DE APLICACIÓN                                 │
├────────────────────────────────┼────────────────────────────────────────────────┤
│                                 │                                              │
│  ┌─────────────────────────────┴─────────────────────────────────────────┐   │
│  │                    ORCHESTRATOR SERVICE                               │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │ Super   │  │ Data    │  │Analyzer │  │Simulator│  │Recommender│  │   │
│  │  │ Agent   │  │Collector│  │         │  │         │  │          │    │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘    │   │
│  │       │            │            │            │            │          │   │
│  │       └────────────┴────────────┴────────────┴────────────┘          │   │
│  │                              │                                           │   │
│  │                    ┌─────────┴─────────┐                               │   │
│  │                    │  AGENT COORDINATOR │                               │   │
│  │                    │  (Message Broker)   │                               │   │
│  │                    └─────────┬─────────┘                               │   │
│  └─────────────────────────────┼───────────────────────────────────────────┘   │
│                                │                                               │
│  ┌─────────────────────────────┼───────────────────────────────────────────┐   │
│  │                    INTEGRATION SERVICE                                  │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐        │   │
│  │  │   INE      │ │   INEGI    │ │   OBP      │ │   Ollama   │        │   │
│  │  │   Client   │ │   Client   │ │   Client   │ │   Client   │        │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘        │   │
│  └─────────────────────────────┼───────────────────────────────────────────┘   │
│                                │                                               │
├────────────────────────────────┼────────────────────────────────────────────────┤
│                              CAPA DE DATOS                                      │
├────────────────────────────────┼────────────────────────────────────────────────┤
│                                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ PostgreSQL   │  │   Qdrant     │  │    Redis     │  │   DuckDB     │     │
│  │ + pgvector   │  │  (Vectors)   │  │   (Cache)    │  │   (OLAP)     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Responsabilidades de Cada Capa

La capa de presentación es responsable de renderizar la interfaz de usuario y manejar las interacciones del usuario. Esta capa recibe las acciones del usuario, las transforma en llamadas al backend a través de la API REST, y renderiza las respuestas de manera visual. Los componentes de esta capa no contienen lógica de negocio; su única responsabilidad es la presentación de datos y la captura de eventos de usuario.

La capa de aplicación implementa toda la lógica de negocio del sistema. Esta capa contiene los servicios de orquestación que coordinan el trabajo de los agentes de IA, los transformadores de datos que mapean entre formatos externos e internos, y los validadores que aseguran que los datos cumplen con las reglas de negocio. Esta capa es completamente independiente de la tecnología de presentación y de la tecnología de persistencia, lo que permite cambios en cualquiera de ellas sin afectar la lógica de negocio.

La capa de datos es responsable de la persistencia de información y la comunicación con sistemas externos. Esta capa contiene los repositorios que abstraen el acceso a las bases de datos, los clientes de API que gestionan la comunicación con servicios externos, y los adaptadores que transforman los datos entre los formatos utilizados por cívicaOS y los formatos de los sistemas externos.

---

## 3. Diseño de Módulos

### 3.1 Módulo de Orquestación de Agentes

El módulo de orquestación constituye el núcleo del sistema, gestionando el flujo de trabajo entre los diferentes agentes especializados. Este módulo implementa el patrón de diseño Command donde cada tarea se representa como un comando que puede ser ejecutado, monitoreado y revertido. El orquestador recibe consultas del frontend, las descompone en subtareas, las distribuye a los agentes apropiados, y compila los resultados parciales en una respuesta coherente.

El diseño interno del orquestador sigue el patrón Observer para notificar al frontend sobre el progreso de las tareas. Cada agente emite eventos de progreso que el orquestador traduce en actualizaciones de estado visibles para el usuario. El orquestador también implementa el patrón Circuit Breaker para manejar fallos de manera elegante, deteniendo la ejecución de tareas dependientes cuando un agente falla y proporcionando mensajes de error claros.

```typescript
// src/services/orchestrator/AgentOrchestrator.ts

export interface AgentTask {
  id: string;
  agentType: AgentType;
  input: TaskInput;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: TaskResult;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export type AgentType =
  | 'SUPER_AGENT'
  | 'DATA_COLLECTOR'
  | 'ANALYZER'
  | 'SIMULATOR'
  | 'RECOMMENDER'
  | 'INTEGRATOR'
  | 'REPORT_WRITER';

export class AgentOrchestrator {
  private taskQueue: AgentTask[] = [];
  private activeTasks: Map<string, AgentTask> = new Map();
  private eventEmitter: EventEmitter;
  private agentPool: Map<AgentType, Agent>;
  private circuitBreaker: CircuitBreaker;

  constructor(config: OrchestratorConfig) {
    this.eventEmitter = new EventEmitter();
    this.agentPool = this.initializeAgentPool(config);
    this.circuitBreaker = new CircuitBreaker(config.circuitBreaker);
  }

  public async orchestrate(query: UserQuery): Promise<OrchestrationResult> {
    const taskId = this.generateTaskId();
    const decomposition = this.decomposeQuery(query);

    this.eventEmitter.emit('orchestration:started', { taskId, query });

    try {
      for (const subtask of decomposition) {
        await this.executeSubtask(subtask);
      }

      const result = this.compileResults(taskId);
      this.eventEmitter.emit('orchestration:completed', { taskId, result });

      return result;
    } catch (error) {
      this.eventEmitter.emit('orchestration:failed', { taskId, error });
      throw error;
    }
  }

  private async executeSubtask(subtask: Subtask): Promise<void> {
    const agent = this.agentPool.get(subtask.agentType);
    if (!agent) {
      throw new Error(`Agent not found: ${subtask.agentType}`);
    }

    if (this.circuitBreaker.isOpen(subtask.agentType)) {
      throw new Error(`Circuit breaker open for ${subtask.agentType}`);
    }

    try {
      this.activeTasks.set(subtask.id, { ...subtask, status: 'processing' });
      this.eventEmitter.emit('task:started', subtask);

      const result = await agent.execute(subtask.input);
      this.activeTasks.set(subtask.id, {
        ...subtask,
        status: 'completed',
        result,
        endTime: new Date(),
      });

      this.eventEmitter.emit('task:completed', { subtaskId: subtask.id, result });
      this.circuitBreaker.recordSuccess(subtask.agentType);
    } catch (error) {
      this.activeTasks.set(subtask.id, {
        ...subtask,
        status: 'failed',
        error: error.message,
        endTime: new Date(),
      });

      this.eventEmitter.emit('task:failed', { subtaskId: subtask.id, error });
      this.circuitBreaker.recordFailure(subtask.agentType);
    }
  }

  private decomposeQuery(query: UserQuery): Subtask[] {
    const agent = this.agentPool.get('SUPER_AGENT');
    return agent.decompose(query);
  }

  private compileResults(taskId: string): OrchestrationResult {
    const tasks = Array.from(this.activeTasks.values()).filter(
      (t) => t.status === 'completed'
    );
    return {
      taskId,
      summary: this.generateSummary(tasks),
      recommendations: this.extractRecommendations(tasks),
      auditLog: this.generateAuditLog(tasks),
    };
  }
}
```

### 3.2 Módulo de Motor ABM

El módulo del motor de simulación basado en agentes implementa el modelo Deffuant-Weisbuch de dinámica de opiniones junto con métricas de felicidad colectiva y predicción de intención de voto basada en el modelo Logit Multinomial. Este módulo es responsable de la generación de población sintética, la simulación de políticas públicas, y el cálculo de trayectorias temporales.

El diseño del motor ABM sigue el patrón Strategy para permitir diferentes modelos de comportamiento de agentes. Cada estrategia define cómo los agentes interactúan, cómo actualizan sus opiniones, y cómo responden a las políticas simuladas. El motor también implementa el patrón Observer para notificar sobre eventos de simulación, permitiendo que el frontend visualice el progreso en tiempo real.

```typescript
// src/services/abm/ABMEngine.ts

export interface Agent {
  id: string;
  sector: AgentSector;
  attributes: AgentAttributes;
  opinions: Map<string, number>;
  happiness: number;
  votingIntention?: string;
}

export interface PolicyIntervention {
  id: string;
  name: string;
  effects: PolicyEffects;
  cost: number;
}

export interface PolicyEffects {
  happinessDelta: number;
  gdpImpact: number;
  employmentImpact: number;
  opinionShift: Map<string, number>;
}

export interface SimulationConfig {
  populationSize: number;
  timeHorizonYears: number;
  iterations: number;
  convergenceThreshold: number;
  randomSeed?: number;
}

export class ABMEngine {
  private agents: Agent[] = [];
  private config: SimulationConfig;
  private currentYear: number = 0;
  private trajectory: SimulationSnapshot[] = [];
  private opinionModel: OpinionModel;
  private votingModel: VotingModel;

  constructor(config: SimulationConfig) {
    this.config = config;
    this.opinionModel = new DeffuantWeisbuchModel(config.convergenceThreshold);
    this.votingModel = new LogitVotingModel();
    this.initializePopulation();
  }

  private initializePopulation(): void {
    const sectorDistribution = this.getSectorDistribution();
    for (const [sector, count] of sectorDistribution) {
      for (let i = 0; i < count; i++) {
        this.agents.push(this.createAgent(sector));
      }
    }
  }

  public async runSimulation(policies: PolicyIntervention[]): Promise<SimulationResult> {
    this.trajectory = [];
    this.currentYear = 0;

    this.trajectory.push(this.captureSnapshot('Baseline'));

    for (let year = 1; year <= this.config.timeHorizonYears; year++) {
      this.currentYear = year;
      await this.simulateYear(policies);
      this.trajectory.push(this.captureSnapshot(`Year ${year}`));
    }

    return this.generateResult(policies);
  }

  private async simulateYear(policies: PolicyIntervention[]): Promise<void> {
    for (const policy of policies) {
      this.applyPolicy(policy);
    }

    for (let iteration = 0; iteration < this.config.iterations; iteration++) {
      this.opinionModel.evolve(this.agents);
    }

    this.updateHappiness();
    this.updateVotingIntention();
  }

  private applyPolicy(policy: PolicyIntervention): void {
    for (const agent of this.agents) {
      if (this.isAgentAffected(agent, policy)) {
        agent.happiness += policy.effects.happinessDelta;

        for (const [opinionKey, shift] of policy.effects.opinionShift) {
          const current = agent.opinions.get(opinionKey) || 0;
          agent.opinions.set(opinionKey, current + shift);
        }
      }
    }
  }

  private updateHappiness(): void {
    for (const agent of this.agents) {
      agent.happiness = Math.max(
        0,
        Math.min(100, this.calculateHappiness(agent))
      );
    }
  }

  private updateVotingIntention(): void {
    const candidates = this.getCandidates();
    for (const agent of this.agents) {
      agent.votingIntention = this.votingModel.predict(agent, candidates);
    }
  }

  private calculateHappiness(agent: Agent): number {
    const baseHappiness = 50;
    const economicFactor = agent.attributes.incomeLevel * 20;
    const socialFactor = agent.attributes.civicEngagement * 15;
    const opinionFactor = this.calculateOpinionSatisfaction(agent) * 15;

    return baseHappiness + economicFactor + socialFactor + opinionFactor;
  }

  private captureSnapshot(label: string): SimulationSnapshot {
    const happinessDistribution = this.calculateHappinessDistribution();
    const gdpEstimate = this.calculateGDPEstimate();
    const employmentRate = this.calculateEmploymentRate();
    const voteDistribution = this.calculateVoteDistribution();

    return {
      year: this.currentYear,
      label,
      metrics: {
        avgHappiness: happinessDistribution.mean,
        happinessPercentiles: happinessDistribution.percentiles,
        gdp: gdpEstimate,
        unemployment: 1 - employmentRate,
        voteIntention: voteDistribution,
      },
    };
  }

  private generateResult(policies: PolicyIntervention[]): SimulationResult {
    return {
      config: this.config,
      trajectory: this.trajectory,
      outcomes: {
        expectedHappinessGain: this.calculateTotalHappinessGain(),
        expectedGDPGrowth: this.calculateGDPGrowth(),
        expectedElectoralImpact: this.calculateElectoralImpact(),
        riskFactors: this.identifyRiskFactors(),
      },
    };
  }
}
```

### 3.3 Módulo de Integración Externa

El módulo de integración externa proporciona clientes para los servicios externos: INE para datos electorales, INEGI para datos censales y demográficos, Open Business Plan para la exportación de proyectos, y Ollama para la inferencia de modelos de IA. Cada cliente implementa el patrón Adapter para normalizar las interfaces de los servicios externos al formato interno de cívicaOS.

El diseño incluye manejo de errores robusto con reintentos automáticos y backoff exponencial, cacheo de respuestas para reducir llamadas a APIs externas, y rate limiting para evitar exceder los límites de uso establecidos por los servicios externos. Los clientes también implementan circuit breakers para manejar fallos temporales de manera elegante.

```typescript
// src/services/integration/clients/INIClient.ts

export class INIClient {
  private baseUrl: string;
  private apiKey: string;
  private httpClient: AxiosInstance;
  private cache: LRUCache<string, any>;
  private circuitBreaker: CircuitBreaker;

  constructor(config: INIClientConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.cache = new LRUCache({ max: 1000, ttl: 3600000 });
    this.circuitBreaker = new CircuitBreaker({
      failureThreshold: 5,
      resetTimeout: 60000,
    });

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  public async getElectoralResults(
    districtId: string,
    year?: number
  ): Promise<ElectoralResult[]> {
    const cacheKey = `ine:results:${districtId}:${year || 'latest'}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    if (this.circuitBreaker.isOpen()) {
      throw new ServiceUnavailableError('INE service temporarily unavailable');
    }

    try {
      const response = await this.httpClient.get(`/elections/results`, {
        params: {
          district_id: districtId,
          year: year || this.getLatestElectionYear(),
        },
      });

      const results = this.transformResponse(response.data);
      this.cache.set(cacheKey, results);

      this.circuitBreaker.recordSuccess();
      return results;
    } catch (error) {
      this.circuitBreaker.recordFailure();

      if (error.response?.status === 404) {
        throw new ResourceNotFoundError(`District ${districtId} not found in INE`);
      }

      if (error.response?.status === 401) {
        throw new AuthenticationError('Invalid INE API credentials');
      }

      throw new ExternalServiceError('INE', error.message);
    }
  }

  private transformResponse(data: any): ElectoralResult[] {
    return data.resultados.map((item: any) => ({
      candidateId: item.id_candidato,
      candidateName: item.nombre_candidato,
      party: item.partido,
      votes: item.votos,
      percentage: item.porcentaje,
      elected: item.electo,
    }));
  }
}
```

---

## 4. Diseño de Base de Datos

### 4.1 Esquema de PostgreSQL

El esquema de base de datos de cívicaOS está diseñado para soportar tanto el almacenamiento de datos estructurados como la búsqueda vectorial a través de la extensión pgvector de PostgreSQL. La estructura normalizada minimiza la redundancia mientras mantiene el rendimiento para consultas complejas.

```sql
-- Esquema de entidades geográficas
CREATE TABLE geographic_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('country', 'state', 'municipality', 'district', 'zone')),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    parent_id UUID REFERENCES geographic_entities(id),
    coordinates_lat DECIMAL(10, 8),
    coordinates_lng DECIMAL(11, 8),
    boundary_geojson JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_geo_type ON geographic_entities(entity_type);
CREATE INDEX idx_geo_parent ON geographic_entities(parent_id);
CREATE INDEX idx_geo_code ON geographic_entities(code);

-- Tabla de puntos de dolor
CREATE TABLE pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_id UUID NOT NULL REFERENCES geographic_entities(id),
    category VARCHAR(50) NOT NULL CHECK (category IN ('security', 'water', 'economy', 'transport', 'health', 'education', 'corruption')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    intensity DECIMAL(5, 2) NOT NULL CHECK (intensity >= 0 AND intensity <= 100),
    probability DECIMAL(4, 3) NOT NULL CHECK (probability >= 0 AND probability <= 1),
    affected_population INTEGER,
    economic_impact DECIMAL(15, 2),
    source VARCHAR(30) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pain_entity ON pain_points(entity_id);
CREATE INDEX idx_pain_category ON pain_points(category);
CREATE INDEX idx_pain_intensity ON pain_points(intensity DESC);

-- Tabla de candidatos
CREATE TABLE candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    party VARCHAR(100),
    district_id UUID REFERENCES geographic_entities(id),
    profile_type VARCHAR(50) NOT NULL,
    political_positions JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de elecciones históricas
CREATE TABLE electoral_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_type VARCHAR(30) NOT NULL,
    year INTEGER NOT NULL,
    district_id UUID NOT NULL REFERENCES geographic_entities(id),
    candidate_id UUID NOT NULL REFERENCES candidates(id),
    votes INTEGER NOT NULL,
    percentage DECIMAL(5, 2) NOT NULL,
    result VARCHAR(10) NOT NULL CHECK (result IN ('win', 'lose')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_history_district_year ON electoral_history(district_id, year DESC);

-- Tabla de políticas públicas
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    target_sectors VARCHAR(50)[] NOT NULL,
    effects JSONB NOT NULL,
    cost DECIMAL(15, 2),
    implementation_difficulty VARCHAR(10) CHECK (implementation_difficulty IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de simulaciones
CREATE TABLE simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    config JSONB NOT NULL,
    population_size INTEGER,
    time_horizon INTEGER,
    trajectory JSONB,
    outcomes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Extensión pgvector para embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabla para embeddings de conocimiento
CREATE TABLE knowledge_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1024) NOT NULL,
    payload JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_embeddings_vector ON knowledge_embeddings USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_embeddings_collection ON knowledge_embeddings(collection_name);
```

### 4.2 Modelo de Datos Vectoriales en Qdrant

Para la memoria persistente de los agentes y la búsqueda semántica de conocimiento, cívicaOS utiliza Qdrant como almacén vectorial. Las colecciones están diseñadas para soportar diferentes casos de uso: conocimiento histórico de puntos de dolor, patrones electorales, y efectividad de políticas públicas.

```typescript
// src/services/vector/QdrantService.ts

export interface CollectionConfig {
  name: string;
  description: string;
  vectorSize: number;
  distance: 'Cosine' | 'Dot' | 'Euclid';
  payloadSchema: Record<string, PayloadSchemaType>;
}

export const COLLECTIONS: Record<string, CollectionConfig> = {
  pain_points_knowledge: {
    name: 'pain_points_knowledge',
    description: 'Base de conocimiento de puntos de dolor históricos',
    vectorSize: 1024,
    distance: 'Cosine',
    payloadSchema: {
      category: { type: 'keyword' },
      district: { type: 'keyword' },
      intensity: { type: 'float' },
      resolution_status: { type: 'keyword' },
      effective_solutions: { type: 'text[]' },
    },
  },
  electoral_patterns: {
    name: 'electoral_patterns',
    description: 'Patrones electorales históricos',
    vectorSize: 1024,
    distance: 'Cosine',
    payloadSchema: {
      district: { type: 'keyword' },
      year: { type: 'integer' },
      winning_profile: { type: 'text' },
      key_factors: { type: 'text[]' },
      predictors: { type: 'float[]' },
    },
  },
  policy_effectiveness: {
    name: 'policy_effectiveness',
    description: 'Efectividad de políticas públicas',
    vectorSize: 1024,
    distance: 'Cosine',
    payloadSchema: {
      policy_category: { type: 'keyword' },
      outcomes: { type: 'float[]' },
      context_factors: { type: 'text[]' },
      replicability_score: { type: 'float' },
    },
  },
};

export class QdrantService {
  private client: QdrantClient;
  private embeddingService: EmbeddingService;

  constructor(config: QdrantConfig) {
    this.client = new QdrantClient({ url: config.url });
    this.embeddingService = new EmbeddingService();
  }

  public async initializeCollections(): Promise<void> {
    for (const collection of Object.values(COLLECTIONS)) {
      const exists = await this.collectionExists(collection.name);

      if (!exists) {
        await this.createCollection(collection);
      }
    }
  }

  public async searchSimilar(
    collectionName: string,
    query: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    const queryVector = await this.embeddingService.generateEmbedding(query);

    const results = await this.client.search(collectionName, {
      vector: queryVector,
      limit,
      with_payload: true,
    });

    return results.map((r) => ({
      id: r.id as string,
      score: r.score,
      payload: r.payload,
    }));
  }

  public async storeEmbedding(
    collectionName: string,
    content: string,
    payload: Record<string, any>
  ): Promise<string> {
    const vector = await this.embeddingService.generateEmbedding(content);
    const id = generateUUID();

    await this.client.upsert(collectionName, {
      points: [
        {
          id,
          vector,
          payload: {
            content,
            ...payload,
            created_at: new Date().toISOString(),
          },
        },
      ],
    });

    return id;
  }
}
```

---

## 5. Diseño de APIs

### 5.1 API REST del Orchestrator

La API del orquestador proporciona endpoints para iniciar análisis, consultar estado de procesos, y obtener resultados. El diseño sigue los principios REST con recursos bien definidos y operaciones idempotentes cuando es posible.

```yaml
openapi: 3.0.0
info:
  title: CívicaOS Orchestrator API
  version: 1.0.0
  description: API para orquestación de análisis cívico multi-agente

servers:
  - url: http://localhost:3001/api/v1
    description: Servidor de desarrollo

paths:
  /orchestrate:
    post:
      summary: Iniciar nuevo análisis orquestado
      operationId: startOrchestration
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/OrchestrationRequest'
      responses:
        '202':
          description: Análisis iniciado exitosamente
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrchestrationResponse'
        '400':
          description: Solicitud inválida
        '500':
          description: Error interno del servidor

  /orchestrate/{jobId}:
    get:
      summary: Consultar estado de análisis
      operationId: getOrchestrationStatus
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Estado del análisis
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrchestrationStatus'
        '404':
          description: Análisis no encontrado

  /orchestrate/{jobId}/results:
    get:
      summary: Obtener resultados de análisis completado
      operationId: getOrchestrationResults
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Resultados del análisis
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/OrchestrationResult'
        '202':
          description: Análisis aún en proceso
        '404':
          description: Análisis no encontrado

  /orchestrate/{jobId}/cancel:
    post:
      summary: Cancelar análisis en proceso
      operationId: cancelOrchestration
      parameters:
        - name: jobId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Análisis cancelado exitosamente
        '400':
          description: Análisis no puede ser cancelado
        '404':
          description: Análisis no encontrado

components:
  schemas:
    OrchestrationRequest:
      type: object
      required:
        - query
      properties:
        query:
          type: string
          description: Consulta de análisis en lenguaje natural
        context:
          type: object
          properties:
            district:
              type: string
            city:
              type: string
            state:
              type: string
        options:
          type: object
          properties:
            depth:
              type: string
              enum: [full, partial]
            include_simulations:
              type: boolean
            export_to_obp:
              type: boolean

    OrchestrationResponse:
      type: object
      properties:
        job_id:
          type: string
        status:
          type: string
          enum: [PROCESSING]
        progress:
          type: number
        current_agent:
          type: string

    OrchestrationStatus:
      type: object
      properties:
        job_id:
          type: string
        status:
          type: string
          enum: [PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED]
        progress:
          type: number
        current_agent:
          type: string
        agents_status:
          type: object
          additionalProperties:
            type: string
        started_at:
          type: string
          format: date-time
        estimated_completion:
          type: string
          format: date-time

    OrchestrationResult:
      type: object
      properties:
        job_id:
          type: string
        summary:
          type: string
        pain_points:
          type: array
          items:
            $ref: '#/components/schemas/PainPoint'
        recommendations:
          type: array
          items:
            $ref: '#/components/schemas/Recommendation'
        simulations:
          type: array
          items:
            $ref: '#/components/schemas/SimulationSummary'
        obp_export_status:
          type: string
        confidence_score:
          type: number
        audit_log:
          type: array
          items:
            $ref: '#/components/schemas/AuditEntry'
```

---

## 6. Patrones de Diseño Aplicados

### 6.1 Resumen de Patrones Utilizados

CívicaOS aplica un conjunto de patrones de diseño para resolver problemas recurrentes de arquitectura y garantizar la mantenibilidad del código a largo plazo. El patrón Repository se utiliza para abstraer el acceso a datos, permitiendo que la lógica de negocio trabaje con interfaces limpias sin conocer los detalles de implementación de la base de datos. El patrón Factory se aplica en la creación de agentes, donde cada tipo de agente tiene su propia factory que knows how inicializarlo con la configuración correcta.

El patrón Strategy se utiliza extensivamente para permitir diferentes comportamientos intercambiables: el modelo de opiniones en el ABM, los algoritmos de clustering para análisis geográfico, y los métodos de scoring para recomendaciones. El patrón Observer permite que los componentes del sistema se suscriban a eventos de otros componentes, decoupling la producción de eventos del consumo. El patrón Circuit Breaker protege contra fallos en cascada al detener temporalmente las llamadas a servicios que están experimentando problemas.

El patrón Adapter normaliza las interfaces de los servicios externos, transformando las respuestas heterogéneas de INE, INEGI y OBP en un formato común que la lógica de negocio puede procesar sin conocer los detalles de cada servicio. El patrón Unit of Work agrupa múltiples operaciones de base de datos en transacciones atómicas, asegurando la consistencia de los datos incluso cuando occuren errores parciales.

---

*Documento SDD actualizado: 2026-05-18*
*Próxima revisión programada: 2026-06-18*