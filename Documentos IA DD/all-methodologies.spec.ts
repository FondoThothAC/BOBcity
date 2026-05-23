/**
 * ════════════════════════════════════════════════════════════════
 * SDD — Specification Driven Development
 * CivicPulse / CívicaOS
 * Archivo de especificaciones formales del sistema
 * ════════════════════════════════════════════════════════════════
 *
 * Las especificaciones son la única fuente de verdad.
 * El código se deriva de ellas, nunca al revés.
 */

// sdd/system.spec.ts

export const CIVICPULSE_SPEC = {
  version: "1.0.0",
  sistema: "CivicPulse / CívicaOS",
  descripcion:
    "Plataforma de Inteligencia Cívica con Gemelo Digital Social y Predictor Electoral",

  modulos: {
    orquestador: {
      nombre: "OpenClaw Orchestrator",
      agentes: [
        "SuperAgent",
        "DataCollector",
        "Analyzer",
        "Simulator",
        "Recommender",
        "Integrator",
        "ReportWriter",
        "AuditAgent",
        "SelfImprover",
      ],
      modelo_primario: {
        nivel_1: "mistral:7b",
        nivel_2: "qwen2.5:72b",
        nivel_3: "llama3.3:70b",
      },
      modelo_codigo: "qwen2.5-coder:32b",
      tiempo_max_ciclo_segundos: { nivel_1: 120, nivel_2: 60, nivel_3: 90 },
    },

    abm: {
      framework: "Mesa (Python) / custom TS port",
      modelos_matematicos: {
        opinion: "Deffuant-Weisbuch (epsilon=0.3, mu=0.5, acoplamiento caosSocial e incertidumbre)",
        felicidad: "H = w_ingreso * ingreso + w_serv * servicios + w_seg * seguridad - GiniPenalty - WaterStressPenalty",
        voto: "MNL Softmax sobre utilidades de agente",
      },
      sectores_agentes: ["comerciante", "estudiante", "obrero"],
      capacidad_por_nivel: {
        nivel_1: 1_000,
        nivel_2: 10_000,
        nivel_3: 100_000,
      },
      matriz_parametros_gds: {
        factores_fisicos: ["radiacionSolar", "presionHidrica", "albedoSuperficial", "evapotranspiracion", "humedadRelativa"],
        caos_y_dinamica_social: ["caosSocial", "incertidumbre", "polarizacion", "propagacionRumores", "densidadConectividad"],
        demografia_y_economia: ["cohesionEducativa", "insercionLaboral", "coeficienteGini", "densidadPoblacional", "ahorroLiquidez"],
        entorno_politico_y_medios: ["votoBasal", "confianzaGobierno", "toleranciaCorrupcion", "exposicionMedios", "resilienciaElectoral"]
      }
    },

    predictor_electoral: {
      modelo: "XGBoost + Regresión Multinivel",
      fuentes_datos: ["INE PREP 2018", "INE PREP 2021", "INE PREP 2024"],
      features: [
        "experiencia_gobierno_anios",
        "sector_candidato",
        "propuestas_seguridad_score",
        "indice_pobreza_distrito",
        "tasa_homicidio_distrito",
        "sentimiento_redes_score",
      ],
      output: "ProbabilidadElectoral con intervalo de confianza al 95%",
    },

    privacidad: {
      paradigma: "Local-First",
      tecnicas: ["Pseudo-anonimización", "Hash SHA-256", "Audit Log inmutable"],
      fase_2: ["ZKP (Zero-Knowledge Proofs)", "Privacidad Diferencial"],
      datos_que_salen: ["Solo payload anonimizado a OBP con consentimiento explícito"],
    },
    arquitectura_niveles: {
      nivel_1_ciudadano: {
        nombre: "Portal de Captura Cívica (ThothAgora)",
        acceso: "Público General / Anonimato Seguro",
        tecnicas: ["Hash SHA-256 local", "Sanitización XSS", "Captura de Metadatos Silenciosa (Anti-Bot)"]
      },
      nivel_2_cliente: {
        nombre: "Consola Estratégica (Marca Blanca)",
        acceso: "SaaS Clientes (Lectura de Gemelos y Decisiones)",
        restricciones: ["Solo Lectura de Simulaciones ABM", "Solicitudes de Variaciones Escritas Facturadas a $4,800 MXN"]
      },
      nivel_3_agente: {
        nombre: "Consola Operativa y de Calibración",
        acceso: "Operadores y Analistas Internos (Full Control)",
        tecnicas: ["Ejecución de Sandbox ABM", "Auditoría de Ingesta y Dispositivo", "Detección y Filtrado de Botnets por GNN"]
      }
    },
  },

  integracion_obp: {
    protocolo: "mTLS local",
    version_api: "2.5.12.3",
    formato: "JSON",
    webhook: "https://obp.internal/api/v2/ingest",
    payload_schema: {
      version: "string",
      iniciativa_id: "string",
      fecha: "ISO8601",
      diagnostico: "DiagnosticoSchema",
      prediccion_electoral: "PrediccionSchema | null",
      auditoria: "AuditoriaSchema",
    },
  },

  hardware_tiers: [
    {
      nivel: 1,
      hardware: "Mac Mini M4",
      ram_gb: 16,
      modelo: "mistral:7b",
      max_agentes: 1_000,
      costo_usd: 800,
      cliente: "municipio_pequeno",
    },
    {
      nivel: 2,
      hardware: "NVIDIA DGX Spark",
      ram_gb: 128,
      modelo: "qwen2.5:72b",
      max_agentes: 10_000,
      costo_usd: 3_500,
      cliente: "estado_partido_mediano",
    },
    {
      nivel: 3,
      hardware: "4x NVIDIA H100/H200",
      ram_gb: 640,
      modelo: "llama3.3:70b",
      max_agentes: 100_000,
      costo_usd: 180_000,
      cliente: "gobierno_estatal_nacional",
    },
  ],
} as const;

// ─── Tests de especificación ──────────────────────────────────────────────────
import { describe, it, expect } from "vitest";

describe("SDD › Validación de Especificaciones del Sistema", () => {
  it("todos los niveles tienen max_agentes creciente", () => {
    const tiers = CIVICPULSE_SPEC.hardware_tiers;
    for (let i = 1; i < tiers.length; i++) {
      expect(tiers[i].max_agentes).toBeGreaterThan(tiers[i - 1].max_agentes);
    }
  });

  it("todos los agentes del orquestador están definidos", () => {
    const agentes = CIVICPULSE_SPEC.modulos.orquestador.agentes;
    expect(agentes.length).toBeGreaterThanOrEqual(8);
    expect(agentes).toContain("SuperAgent");
    expect(agentes).toContain("ReportWriter");
    expect(agentes).toContain("AuditAgent");
  });

  it("predictor incluye al menos 5 features", () => {
    const features = CIVICPULSE_SPEC.modulos.predictor_electoral.features;
    expect(features.length).toBeGreaterThanOrEqual(5);
  });

  it("privacidad local-first: ZKP es upgrade de fase 2, no fase 1", () => {
    const priv = CIVICPULSE_SPEC.modulos.privacidad;
    expect(priv.tecnicas).not.toContain("ZKP");
    expect(priv.fase_2).toContain("ZKP (Zero-Knowledge Proofs)");
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * MDD — Model Driven Development
 * Modelos formales del sistema: JSON Schema + tipos TypeScript generados
 * ════════════════════════════════════════════════════════════════
 */

// mdd/schemas.ts — Schemas JSON del modelo de datos

export const AGENTE_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://civicpulse.mx/schemas/agente-sintetico",
  title: "AgenteSintetico",
  type: "object",
  required: ["id", "sector", "ingreso", "edad", "felicidad", "intencionVoto", "opinion", "postalCode", "partyAffiliation"],
  properties: {
    id: { type: "string", pattern: "^AGT-[0-9]+$" },
    sector: { type: "string", enum: ["comerciante", "estudiante", "obrero", "jovenes", "comerciantes", "asalariados"] },
    ingreso: { type: "number", minimum: 0, maximum: 1 },
    edad: { type: "integer", minimum: 18, maximum: 100 },
    felicidad: { type: "number", minimum: 0, maximum: 1 },
    intencionVoto: { type: "number", minimum: 0, maximum: 1 },
    opinion: { type: "number", minimum: 0, maximum: 1 },
    postalCode: { type: "integer", minimum: 83000, maximum: 83999 },
    partyAffiliation: { type: "string", enum: ["MORENA", "PAN", "PRI", "MC", "NINGUNO"] }
  },
  additionalProperties: false,
};

export const OBP_PAYLOAD_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  $id: "https://civicpulse.mx/schemas/obp-payload",
  title: "OBPPayload",
  type: "object",
  required: ["version", "iniciativa_id", "fecha", "diagnostico", "auditoria"],
  properties: {
    version: { type: "string", pattern: "^\\d+\\.\\d+\\.\\d+$" },
    iniciativa_id: { type: "string", format: "uuid" },
    fecha: { type: "string", format: "date-time" },
    diagnostico: {
      type: "object",
      required: ["puntos_dolor", "felicidad_promedio", "intencion_voto_gobierno"],
    },
    prediccion_electoral: { oneOf: [{ type: "object" }, { type: "null" }] },
    auditoria: {
      type: "object",
      required: ["total_entradas", "local_only"],
      properties: {
        local_only: { type: "boolean", const: true },
      },
    },
  },
};

export const ELECTORAL_CATALOG_SPEC = {
  total_scenarios: 3454,
  distritos_federales: 298,
  distritos_locales: 679,
  municipios: 2477,
  source_file: "src/data/electoral_scenarios.json"
};

// Validación de schemas MDD
describe("MDD › Validación de Schemas JSON", () => {
  it("schema AgenteSintetico tiene todos los campos requeridos", () => {
    const required = AGENTE_SCHEMA.required;
    expect(required).toContain("sector");
    expect(required).toContain("intencionVoto");
    expect(required).toContain("opinion");
    expect(required).toContain("postalCode");
    expect(required).toContain("partyAffiliation");
  });

  it("schema OBP requiere local_only = true en auditoría", () => {
    const auditoria = OBP_PAYLOAD_SCHEMA.properties.auditoria;
    expect(auditoria.properties.local_only.const).toBe(true);
  });

  it("AgenteSintetico.ingreso está limitado entre 0 y 1", () => {
    const ingreso = AGENTE_SCHEMA.properties.ingreso;
    expect(ingreso.minimum).toBe(0);
    expect(ingreso.maximum).toBe(1);
  });

  it("catálogo electoral contiene exactamente los escenarios nacionales configurados", () => {
    expect(ELECTORAL_CATALOG_SPEC.total_scenarios).toBe(3454);
    expect(ELECTORAL_CATALOG_SPEC.distritos_federales).toBe(298);
    expect(ELECTORAL_CATALOG_SPEC.distritos_locales).toBe(679);
    expect(ELECTORAL_CATALOG_SPEC.municipios).toBe(2477);
  });

  it("schema AgenteSintetico incluye código postal y militancia partidista válidos", () => {
    const partyEnum = AGENTE_SCHEMA.properties.partyAffiliation.enum;
    expect(partyEnum).toContain("MORENA");
    expect(partyEnum).toContain("PAN");
    expect(partyEnum).toContain("PRI");
    expect(partyEnum).toContain("MC");
    expect(partyEnum).toContain("NINGUNO");
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * IDD — Interface Driven Development
 * Contratos de interfaces entre agentes y capas del sistema
 * ════════════════════════════════════════════════════════════════
 */

// idd/contracts.ts

export interface IAgente {
  readonly id: string;
  readonly nombre: string;
  readonly estado: "idle" | "processing" | "success" | "error";
  ejecutar(input: unknown): Promise<AgentOutput>;
  onCompletado(callback: (output: AgentOutput) => void): void;
}

export interface AgentOutput {
  agenteId: string;
  resultado: unknown;
  duracionMs: number;
  hashAudit: string;
  timestamp: Date;
  esLocal: boolean;
}

export interface IOrquestador {
  registrarAgente(agente: IAgente): void;
  ejecutarFlujo(iniciativaId: string): Promise<OrchestratorResult>;
  obtenerEstado(iniciativaId: string): OrchestratorState;
  cancelar(iniciativaId: string): void;
}

export interface OrchestratorResult {
  iniciativaId: string;
  duracionTotalMs: number;
  agentesEjecutados: string[];
  reporteId: string;
  exitoso: boolean;
  errores: string[];
}

export interface OrchestratorState {
  iniciativaId: string;
  agenteActual: string;
  progreso: number;      // 0–100
  iniciado: Date;
  estimadoFin?: Date;
}

export interface IModeloLenguaje {
  generar(prompt: string, opciones?: GenerarOpciones): Promise<string>;
  estaDisponible(): Promise<boolean>;
  obtenerModelo(): string;
}

export interface GenerarOpciones {
  temperatura?: number;
  maxTokens?: number;
  sistemaPrompt?: string;
}

export interface IOBPConnector {
  exportar(payload: unknown): Promise<ExportResult>;
  verificarConexion(): Promise<boolean>;
  obtenerVersion(): Promise<string>;
}

export interface ExportResult {
  exitoso: boolean;
  obpJobId?: string;
  hashTransferencia: string;
  timestamp: Date;
}

// Tests de contratos IDD
describe("IDD › Contratos de Interfaz", () => {
  it("IAgente define todos los métodos necesarios para orquestación", () => {
    const metodos: (keyof IAgente)[] = ["ejecutar", "onCompletado"];
    const propiedades: (keyof IAgente)[] = ["id", "nombre", "estado"];
    expect(metodos.length).toBeGreaterThan(0);
    expect(propiedades.length).toBeGreaterThan(0);
  });

  it("AgentOutput incluye hash de auditoría y flag local", () => {
    const output: AgentOutput = {
      agenteId: "DataCollector",
      resultado: {},
      duracionMs: 1500,
      hashAudit: "a".repeat(64),
      timestamp: new Date(),
      esLocal: true,
    };
    expect(output.esLocal).toBe(true);
    expect(output.hashAudit.length).toBe(64);
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * ADD — Architecture Driven Development
 * Decisiones de arquitectura documentadas (ADRs)
 * ════════════════════════════════════════════════════════════════
 */

// add/adr.ts — Architecture Decision Records

export const ADRS = [
  {
    id: "ADR-001",
    titulo: "Local-First sobre Cloud-First para procesamiento de datos",
    estado: "aceptado",
    contexto:
      "Los datos ciudadanos del INE/INEGI contienen información sensible. La normativa LGPD/GDPR impone restricciones sobre transferencia de datos personales.",
    decision:
      "Todo procesamiento de datos ciudadanos ocurre en el hardware del cliente (Nivel 1/2/3). Solo payloads anonimizados salen del dispositivo con consentimiento explícito.",
    consecuencias: {
      positivas: ["Cumplimiento regulatorio automático", "Sin costos de API cloud", "Privacidad garantizada por diseño"],
      negativas: ["Mayor costo de hardware inicial", "Actualizaciones de modelos requieren descarga local"],
    },
  },
  {
    id: "ADR-002",
    titulo: "OpenSwarm sobre framework propietario para orquestación de agentes",
    estado: "aceptado",
    contexto:
      "Se necesita un sistema multi-agente que pueda distribuir tareas análisis, simulación y reporte entre agentes especializados.",
    decision:
      "Usar OpenSwarm (open source) con NemoClaw/OpenClaw como orquestador. Permite auto-mejora, extensibilidad y zero vendor lock-in.",
    consecuencias: {
      positivas: ["Gratuito", "Extensible", "Comunidad activa"],
      negativas: ["Requiere configuración manual de skills", "Documentación en evolución"],
    },
  },
  {
    id: "ADR-003",
    titulo: "ZKP como upgrade de Fase 2, no requisito del MVP",
    estado: "aceptado",
    contexto:
      "Zero-Knowledge Proofs ofrecen privacidad máxima pero requieren bibliotecas especializadas (snarkjs, circom) con curva de aprendizaje alta.",
    decision:
      "MVP usa pseudo-anonimización + SHA-256. ZKP se implementa en Fase 2 como upgrade opcional para clientes con requisitos de cumplimiento avanzado.",
    consecuencias: {
      positivas: ["MVP más rápido", "Menor complejidad técnica inicial"],
      negativas: ["Nivel de privacidad del MVP inferior al estado del arte"],
    },
  },
  {
    id: "ADR-004",
    titulo: "XGBoost + Regresión Multinivel para predictor electoral",
    estado: "aceptado",
    contexto:
      "Los datos electorales mexicanos tienen estructura jerárquica (votos → distritos → estados). Se necesita un modelo que capture relaciones no lineales y efectos contextuales.",
    decision:
      "Combinar XGBoost para capturar interacciones no lineales con regresión multinivel para efectos de contexto territorial. Validar con PREP 2018/2021/2024.",
    consecuencias: {
      positivas: ["Alta precisión en contextos similares", "Interpretable"],
      negativas: ["Requiere datos históricos de calidad", "Calibración periódica necesaria"],
    },
  },
] as const;

describe("ADD › Validación de Architecture Decision Records", () => {
  it("todos los ADRs tienen estado definido", () => {
    ADRS.forEach((adr) => expect(adr.estado).toBeTruthy());
  });

  it("ADR-001 establece local-first como decisión aceptada", () => {
    const adr1 = ADRS.find((a) => a.id === "ADR-001");
    expect(adr1?.estado).toBe("aceptado");
    expect(adr1?.decision).toContain("consentimiento explícito");
  });

  it("ADR-003 confirma ZKP es fase 2", () => {
    const adr3 = ADRS.find((a) => a.id === "ADR-003");
    expect(adr3?.decision).toContain("Fase 2");
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * EDD — Event Driven Development
 * Eventos del sistema, suscriptores y handlers
 * ════════════════════════════════════════════════════════════════
 */

// edd/events.ts

export type CivicPulseEvent =
  | { tipo: "ANALISIS_INICIADO"; iniciativaId: string; nivel: number; ts: number }
  | { tipo: "AGENTE_COMPLETADO"; agenteId: string; duracionMs: number; ts: number }
  | { tipo: "SIMULACION_LISTA"; escenarioId: string; felicidad: number; ts: number }
  | { tipo: "REPORTE_GENERADO"; reporteId: string; iniciativaId: string; ts: number }
  | { tipo: "OBP_EXPORTADO"; payloadId: string; consentimiento: true; ts: number }
  | { tipo: "ERROR_AGENTE"; agenteId: string; error: string; ts: number };

export interface IEventBus {
  publish(evento: CivicPulseEvent): void;
  subscribe(tipo: CivicPulseEvent["tipo"], handler: (e: CivicPulseEvent) => void): () => void;
  history(): CivicPulseEvent[];
}

export function crearEventBusLocal(): IEventBus {
  const handlers = new Map<string, Array<(e: CivicPulseEvent) => void>>();
  const historial: CivicPulseEvent[] = [];

  return {
    publish(evento) {
      historial.push(evento);
      (handlers.get(evento.tipo) ?? []).forEach((h) => h(evento));
    },
    subscribe(tipo, handler) {
      if (!handlers.has(tipo)) handlers.set(tipo, []);
      handlers.get(tipo)!.push(handler);
      return () => {
        const arr = handlers.get(tipo) ?? [];
        const idx = arr.indexOf(handler);
        if (idx > -1) arr.splice(idx, 1);
      };
    },
    history: () => [...historial],
  };
}

describe("EDD › Event Bus Local", () => {
  it("publicar evento lo agrega al historial", () => {
    const bus = crearEventBusLocal();
    bus.publish({ tipo: "ANALISIS_INICIADO", iniciativaId: "INI-001", nivel: 1, ts: Date.now() });
    expect(bus.history().length).toBe(1);
    expect(bus.history()[0].tipo).toBe("ANALISIS_INICIADO");
  });

  it("suscriptor recibe evento de su tipo", () => {
    const bus = crearEventBusLocal();
    let recibido = false;
    bus.subscribe("REPORTE_GENERADO", () => { recibido = true; });
    bus.publish({ tipo: "REPORTE_GENERADO", reporteId: "R1", iniciativaId: "I1", ts: Date.now() });
    expect(recibido).toBe(true);
  });

  it("suscriptor NO recibe eventos de otro tipo", () => {
    const bus = crearEventBusLocal();
    let recibido = false;
    bus.subscribe("OBP_EXPORTADO", () => { recibido = true; });
    bus.publish({ tipo: "ANALISIS_INICIADO", iniciativaId: "I1", nivel: 1, ts: Date.now() });
    expect(recibido).toBe(false);
  });

  it("unsuscribir detiene la recepción de eventos", () => {
    const bus = crearEventBusLocal();
    let contador = 0;
    const off = bus.subscribe("AGENTE_COMPLETADO", () => { contador++; });
    bus.publish({ tipo: "AGENTE_COMPLETADO", agenteId: "A1", duracionMs: 100, ts: Date.now() });
    off();
    bus.publish({ tipo: "AGENTE_COMPLETADO", agenteId: "A1", duracionMs: 100, ts: Date.now() });
    expect(contador).toBe(1);
  });

  it("OBP_EXPORTADO siempre requiere consentimiento=true en el tipo", () => {
    const evento: CivicPulseEvent = {
      tipo: "OBP_EXPORTADO",
      payloadId: "P1",
      consentimiento: true,  // forzado por tipo
      ts: Date.now(),
    };
    expect(evento.consentimiento).toBe(true);
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * CDD — Component Driven Development
 * Especificación de componentes UI de CivicPulse
 * ════════════════════════════════════════════════════════════════
 */

// cdd/components.spec.ts

export const COMPONENT_SPECS = {
  OrchestratorConsole: {
    props: {
      iniciativas: "IniciativaCivica[]",
      onEjecutar: "(id: string) => void",
      onExportar: "(reporteId: string) => void",
      nivel: "NivelHardware",
    },
    estados: ["idle", "ejecutando", "completado", "error"],
    testIds: [
      "orquestador-panel",
      "lista-iniciativas",
      "btn-ejecutar",
      "terminal-logs",
      "audit-log",
      "reporte-final",
      "btn-exportar",
      "modal-obp",
    ],
    accesibilidad: {
      rol: "region",
      ariaLabel: "Consola de orquestación OpenClaw",
      navegableConTeclado: true,
    },
  },

  PainPointsMap: {
    props: {
      puntosDeDolor: "PuntoDeDolor[]",
      filtros: "string[]",
      onClickZona: "(colonia: string) => void",
    },
    estados: ["cargando", "listo", "sin_datos"],
    testIds: ["mapa-calor", "filtros-panel", "leyenda"],
    accesibilidad: {
      rol: "img",
      ariaLabel: "Mapa de calor de puntos de dolor ciudadano en Hermosillo",
      navegableConTeclado: false,
      descripcionAlternativa: true,
    },
  },

  PredictorEngine: {
    props: {
      distritoClave: "string",
      onCalcular: "(a: PerfilCandidato, b: PerfilCandidato) => void",
    },
    estados: ["configurando", "calculando", "resultado"],
    testIds: [
      "panel-candidato-a",
      "panel-candidato-b",
      "btn-calcular",
      "resultado-predictor",
      "margen-error",
      "factor-dominante",
    ],
  },

  MasterConsole: {
    props: {
      clients: "Client[]",
      onAddClient: "(c: Client) => void",
      onDeleteClient: "(id: string) => void",
      onUpdateClient: "(c: Client) => void",
    },
    estados: ["clients", "metrics", "openclaw", "pipeline"],
    testIds: [
      "btn-aprovisionar",
      "buscador-escenarios",
      "lista-clientes-activos",
      "tabla-facturacion"
    ],
    buscador_escenarios: {
      capacidad_minima_escenarios: 3000,
      autocompletado_activo: true
    }
  },
} as const;

describe("CDD › Especificación de Componentes UI", () => {
  it("OrchestratorConsole tiene todos los data-testid requeridos definidos", () => {
    const ids = COMPONENT_SPECS.OrchestratorConsole.testIds;
    expect(ids).toContain("terminal-logs");
    expect(ids).toContain("audit-log");
    expect(ids).toContain("modal-obp");
  });

  it("PainPointsMap tiene configuración de accesibilidad para mapa no navegable", () => {
    const a11y = COMPONENT_SPECS.PainPointsMap.accesibilidad;
    expect(a11y.navegableConTeclado).toBe(false);
    expect(a11y.descripcionAlternativa).toBe(true);
  });

  it("PredictorEngine incluye margen-error como testId obligatorio", () => {
    expect(COMPONENT_SPECS.PredictorEngine.testIds).toContain("margen-error");
  });

  it("MasterConsole tiene buscador táctico con capacidad >3,000 escenarios", () => {
    expect(COMPONENT_SPECS.MasterConsole.buscador_escenarios.capacidad_minima_escenarios).toBeGreaterThanOrEqual(3000);
    expect(COMPONENT_SPECS.MasterConsole.buscador_escenarios.autocompletado_activo).toBe(true);
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * PDD — Performance Driven Development
 * Benchmarks y presupuesto de rendimiento por nivel de hardware
 * ════════════════════════════════════════════════════════════════
 */

// pdd/performance.spec.ts

export const PERFORMANCE_BUDGET = {
  nivel_1: {
    hardware: "Mac Mini M4 16GB",
    ttfr_segundos: 180,           // Time To First Report
    max_agentes: 1_000,
    tokens_por_segundo_min: 15,   // Mistral 7B en M4
    ram_uso_max_pct: 80,
  },
  nivel_2: {
    hardware: "DGX Spark",
    ttfr_segundos: 60,
    max_agentes: 10_000,
    tokens_por_segundo_min: 80,   // Qwen 72B en Spark
    ram_uso_max_pct: 70,
  },
  nivel_3: {
    hardware: "H100 Server",
    ttfr_segundos: 90,
    max_agentes: 100_000,
    tokens_por_segundo_min: 200,  // Llama 405B en H100
    ram_uso_max_pct: 75,
  },
} as const;

describe("PDD › Presupuesto de Rendimiento", () => {
  it("TTFR es mayor en Nivel 1 que en Nivel 2", () => {
    expect(PERFORMANCE_BUDGET.nivel_1.ttfr_segundos).toBeGreaterThan(
      PERFORMANCE_BUDGET.nivel_2.ttfr_segundos
    );
  });

  it("max_agentes escala al menos 10x entre niveles consecutivos", () => {
    const n = PERFORMANCE_BUDGET;
    expect(n.nivel_2.max_agentes / n.nivel_1.max_agentes).toBeGreaterThanOrEqual(10);
    expect(n.nivel_3.max_agentes / n.nivel_2.max_agentes).toBeGreaterThanOrEqual(10);
  });

  it("tokens_por_segundo_min es suficiente para análisis en tiempo real", () => {
    // Un análisis típico genera ~2000 tokens. Con 15 t/s ≈ 133s en Nivel 1 (dentro del TTFR)
    const tokensAnalisis = 2_000;
    const tpsNivel1 = PERFORMANCE_BUDGET.nivel_1.tokens_por_segundo_min;
    const tiempoEstimado = tokensAnalisis / tpsNivel1;
    expect(tiempoEstimado).toBeLessThan(PERFORMANCE_BUDGET.nivel_1.ttfr_segundos);
  });

  it("uso de RAM nunca debe superar el 80% en ningún nivel", () => {
    Object.values(PERFORMANCE_BUDGET).forEach((nivel) => {
      expect(nivel.ram_uso_max_pct).toBeLessThanOrEqual(80);
    });
  });
});

/**
 * ════════════════════════════════════════════════════════════════
 * UXDD — User Experience Driven Development
 * Especificaciones de experiencia de usuario por persona
 * ════════════════════════════════════════════════════════════════
 */

// uxdd/ux.spec.ts

export const PERSONAS = {
  funcionario_municipal: {
    nombre: "Ing. Claudia Morales",
    rol: "Directora de Desarrollo Social, Municipio de Hermosillo",
    objetivos: [
      "Obtener diagnóstico de su colonia en < 5 minutos",
      "Entender el mapa sin capacitación técnica",
      "Compartir reporte con el presidente municipal",
    ],
    frustraciones: [
      "Reportes que requieren estadísticos para interpretar",
      "Sistemas que envían datos a la nube sin avisar",
      "Interfaces que parecen de hospital",
    ],
    criterios_exito: {
      tiempo_primer_reporte_min: 5,
      clics_para_exportar: 3,
      requiere_capacitacion: false,
    },
  },

  consultor_politico: {
    nombre: "Lic. Marco Espinoza",
    rol: "Consultor de campaña, Partido X Sonora",
    objetivos: [
      "Comparar probabilidad de candidatos en D8 vs D6",
      "Identificar propuestas que suben intención de voto",
      "Exportar análisis a cliente (candidato) en PDF",
    ],
    frustraciones: [
      "Modelos que no explican por qué predicen algo",
      "Datos que parecen inventados sin fuente",
      "Interfaz que no proyecta profesionalismo ante el candidato",
    ],
    criterios_exito: {
      tiempo_comparacion_candidatos_min: 2,
      fuentes_visibles: true,
      exporta_pdf: true,
    },
  },

  ciudadano_hermosillo: {
    nombre: "Sra. Patricia Ochoa",
    rol: "Vendedora, Colonia Palo Verde",
    objetivos: [
      "Reportar problema de agua sin revelar su nombre",
      "Ver si el gobierno respondió a su reporte anterior",
      "Entender qué propuestas impactan su colonia",
    ],
    frustraciones: [
      "Formularios que piden demasiados datos personales",
      "No saber si alguien leyó su reporte",
      "Lenguaje técnico que no entiende",
    ],
    criterios_exito: {
      anonimidad_garantizada: true,
      confirmacion_reporte: true,
      nivel_lectura_max: "6to grado",
    },
  },
};

export const UX_JOURNEYS = {
  funcionario_primer_reporte: {
    persona: "funcionario_municipal",
    pasos: [
      { paso: 1, accion: "Abre CivicPulse en Mac Mini de oficina", duracion_seg: 5 },
      { paso: 2, accion: "Selecciona 'Crisis de Agua - D8' del panel", duracion_seg: 10 },
      { paso: 3, accion: "Hace clic en Ejecutar", duracion_seg: 2 },
      { paso: 4, accion: "Observa progreso de agentes en tiempo real", duracion_seg: 120 },
      { paso: 5, accion: "Lee el reporte y el mapa de calor", duracion_seg: 60 },
      { paso: 6, accion: "Hace clic en Exportar PDF", duracion_seg: 5 },
    ],
    duracion_total_seg: 202,
    punto_critico: "paso_4 — si tarda más de 3 minutos el usuario pierde confianza",
  },
};

describe("UXDD › Especificaciones de Experiencia de Usuario", () => {
  it("el journey del funcionario dura menos de 5 minutos", () => {
    const journey = UX_JOURNEYS.funcionario_primer_reporte;
    expect(journey.duracion_total_seg).toBeLessThan(300);
  });

  it("ciudadana tiene garantía de anonimidad como criterio de éxito", () => {
    expect(PERSONAS.ciudadano_hermosillo.criterios_exito.anonimidad_garantizada).toBe(true);
  });

  it("consultor puede comparar candidatos en menos de 2 minutos", () => {
    expect(PERSONAS.consultor_politico.criterios_exito.tiempo_comparacion_candidatos_min).toBeLessThanOrEqual(2);
  });

  it("funcionario NO requiere capacitación técnica", () => {
    expect(PERSONAS.funcionario_municipal.criterios_exito.requiere_capacitacion).toBe(false);
  });

  it("todas las personas tienen al menos 2 frustraciones documentadas", () => {
    Object.values(PERSONAS).forEach((persona) => {
      expect(persona.frustraciones.length).toBeGreaterThanOrEqual(2);
    });
  });
});
