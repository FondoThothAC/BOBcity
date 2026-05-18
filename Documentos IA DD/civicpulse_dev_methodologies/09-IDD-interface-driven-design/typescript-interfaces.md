# TypeScript Interface Definitions

## Core Domain Interfaces

```typescript
// src/types/territorio.ts

export interface Territorio {
  id: string;              // CVEGEO o clave INE
  tipo: 'distrito' | 'municipio' | 'entidad';
  nombre: string;
  padreId: string;
  geometria: GeoJSON.Polygon;
  poblacionTotal: number;
  indicadores: IndicadoresTerritorio;
  historicoElectoral: ResultadoElectoral[];
}

export interface IndicadoresTerritorio {
  pobrezaPct: number;
  analfabetismoPct: number;
  ingresoMedioMensual: number;
  tasaHomicidios: number;
  desercionEscolarPct: number;
  conectividadInternetPct: number;
}

export interface ResultadoElectoral {
  ciclo: number;
  ganador: string;
  votosPct: number;
  margenVictoriaPct: number;
}
```

```typescript
// src/types/agente.ts

export type TipoAgente = 'comerciante_autoempleado' | 'joven_gig' | 'asalariado_media';

export interface AgenteSector {
  id: string;
  territorioId: string;
  tipo: TipoAgente;
  poblacionSintetica: number;

  // Atributos base
  ingresoPromedio: number;
  educacionPromedio: number;
  edadPromedio: number;
  felicidadBase: number;
  confianzaInstitucional: number;

  // Prioridades (suman ~100)
  prioridadSeguridad: number;
  prioridadEconomia: number;
  prioridadEmpleo: number;
  prioridadTransporte: number;
  prioridadSalud: number;

  // Estado dinámico
  felicidadActual: number;
  confianzaActual: number;
  ingresoActual: number;
  intencionVoto: Record<string, number>;
  estado: 'normal' | 'crisis_social';
}

export interface ImpactoPolitica {
  felicidadDelta: number;
  ingresoDeltaPct: number;
  empleoDeltaPct: number;
  confianzaDelta: number;
  costoPresupuestalPerCapita: number;
}
```

```typescript
// src/types/candidato.ts

export type CargoElectoral = 'presidente_mun' | 'gobernador' | 'diputado_fed';
export type NivelEducativo = 1 | 2 | 3;
export type Genero = 'M' | 'F';
export type TemaPropuesta = 'seguridad' | 'economia' | 'empleo' | 'transporte' | 'salud' | 'corrupcion';

export interface Candidato {
  id: string;
  nombre: string;
  territorioId: string;
  cargo: CargoElectoral;
  partido: string;
  genero: Genero;
  edad: number;
  nivelEducativo: NivelEducativo;
  anosExperienciaPublica: number;
  anosExperienciaPrivada: number;
  experienciaSeguridad: boolean;
  esIncumbente: boolean;
  propuestas: PropuestaVector[];

  // Scores calculados
  scorePerfil: number;
  scorePropuesta: number;
}

export interface PropuestaVector {
  tema: TemaPropuesta;
  peso: number;            // 0-1
  especificidad: number;   // 0-1
  sentimiento: number;     // -1 a +1
}
```

```typescript
// src/types/simulacion.ts

export interface ConfiguracionSimulacion {
  territorioId: string;
  horizonMeses: number;
  politicas: Politica[];
  configuracion: {
    sectores: TipoAgente[];
    semillaAleatoria?: number;
  };
}

export interface Politica {
  id: string;
  nombre: string;
  parametros: Record<string, number | string>;
  impactoPorSector: Partial<Record<TipoAgente, ImpactoPolitica>>;
}

export interface ResultadoSimulacion {
  simulacionId: string;
  estado: 'iniciada' | 'en_progreso' | 'completada' | 'fallida';
  progreso: number;
  mesActual: number;
  resultados: {
    estadosFinales: AgenteSector[];
    proyeccionElectoral: Record<string, number>;
    costoTotal: number;
    roiSocial: number;
  };
}
```

```typescript
// src/types/predictor.ts

export interface RequestPrediccion {
  territorioId: string;
  cargo: CargoElectoral;
  candidato: CandidatoInput;
  contexto: ContextoTerritorial;
}

export interface CandidatoInput {
  nombre: string;
  genero: Genero;
  edad: number;
  nivelEducativo: NivelEducativo;
  anosExperienciaPublica: number;
  anosExperienciaPrivada: number;
  experienciaSeguridad: boolean;
  esIncumbente: boolean;
  partido: string;
  propuestas: PropuestaVector[];
}

export interface ContextoTerritorial {
  tasaHomicidios: number;
  pobrezaPct: number;
  desempleoPct: number;
}

export interface ResponsePrediccion {
  probabilidadVictoria: number;
  votosEsperadosPct: number;
  intervaloConfianza: [number, number];
  drivers: DriverPrediccion[];
  advertencias: string[];
}

export interface DriverPrediccion {
  id: string;
  descripcion: string;
  contribucion: number;  // 0-1
  impacto: string;         // human readable
}
```

```typescript
// src/types/orquestador.ts

export type EstadoAgente = 'idle' | 'activo' | 'completado' | 'error';

export interface AgenteOrquestador {
  id: string;
  nombre: string;
  estado: EstadoAgente;
  progreso: number;
  timestampInicio?: string;
  timestampFin?: string;
}

export interface ConfiguracionFlujo {
  iniciativa: {
    tipo: 'predefinida' | 'personalizada';
    id?: string;
    promptPersonalizado?: string;
  };
  configuracion: {
    tierHardware: 1 | 2 | 3;
    modeloLLM: string;
    maxTiempoSegundos: number;
    incluirAuditoria: boolean;
  };
}

export interface ResultadoFlujo {
  flujoId: string;
  estado: 'ejecutando' | 'completado' | 'fallido';
  agentes: AgenteOrquestador[];
  resultado?: {
    recomendaciones: string[];
    presupuestoEstimado: number;
    roadmap: FaseRoadmap[];
  };
}

export interface FaseRoadmap {
  fase: number;
  nombre: string;
  duracionMeses: number;
  presupuesto: number;
  entregables: string[];
}
```

```typescript
// src/types/audit.ts

export interface LedgerEntry {
  timestamp: string;
  operation: string;
  agentId: string;
  dataHash: string;
  previousHash: string;
  compliance: ('GDPR' | 'LGPD' | 'ISO27001')[];
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  sensitiveDataAccessed: boolean;
}

export interface AuditLog {
  id: string;
  flujoId: string;
  entries: LedgerEntry[];
  verified: boolean;
}
```
