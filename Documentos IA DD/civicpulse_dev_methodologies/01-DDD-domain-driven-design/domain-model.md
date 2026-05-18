# Domain Model - Entities & Value Objects

## Entities (Identidad mutable a través del tiempo)

### Territorio
```typescript
interface Territorio {
  id: string;              // CVEGEO (INEGI) o clave INE
  tipo: 'distrito' | 'municipio' | 'entidad';
  nombre: string;
  padreId: string;         // jerarquía: distrito → municipio → entidad
  geometria: GeoJSON;
  poblacionTotal: number;
  // Indicadores INEGI
  pobrezaPct: number;
  analfabetismoPct: number;
  ingresoMedioMensual: number;
  tasaHomicidios: number;
  desercionEscolarPct: number;
  conectividadInternetPct: number;
  // Electoral
  ultimoGanadorPartido: string;
  ultimoMargenVictoriaPct: number;
  volatilidadHistorica: number;
}
```

### AgenteSector (Entity dentro de Territorio)
```typescript
interface AgenteSector {
  id: string;
  territorioId: string;
  tipo: 'comerciante_autoempleado' | 'joven_gig' | 'asalariado_media';
  poblacionSintetica: number;
  // Atributos promedio
  ingresoPromedio: number;
  educacionPromedio: number;
  edadPromedio: number;
  felicidadBase: number;        // 0-100
  confianzaInstitucional: number; // 0-100
  // Pesos de prioridad (suma ~100)
  prioridadSeguridad: number;
  prioridadEconomia: number;
  prioridadEmpleo: number;
  prioridadTransporte: number;
  prioridadSalud: number;
  // Estado dinámico (mutable)
  felicidadActual: number;
  confianzaActual: number;
  ingresoActual: number;
  intencionVoto: Record<string, number>;
}
```

### Candidato
```typescript
interface Candidato {
  id: string;
  nombre: string;
  territorioId: string;
  cargo: 'presidente_mun' | 'gobernador' | 'diputado_fed';
  partido: string;
  genero: 'M' | 'F';
  edad: number;
  nivelEducativo: 1 | 2 | 3;
  anosExperienciaPublica: number;
  anosExperienciaPrivada: number;
  experienciaSeguridad: boolean;
  esIncumbente: boolean;
  propuestas: PropuestaVector[];
  // Calculados
  scorePerfil: number;
  scorePropuesta: number;
}
```

### FlujoOrquestado
```typescript
interface FlujoOrquestado {
  id: string;
  nombre: string;
  estado: 'idle' | 'ejecutando' | 'completado' | 'fallido';
  agentes: AgenteEspecializado[];
  configuracion: ConfiguracionSwarm;
  logs: LogEjecucion[];
  ledger: LedgerAuditoria[];
  timestampInicio: Date;
  timestampFin: Date;
}
```

## Value Objects (Inmutables, sin identidad propia)

### PropuestaVector
```typescript
interface PropuestaVector {
  tema: 'seguridad' | 'economia' | 'empleo' | 'transporte' | 'salud' | 'corrupcion';
  peso: number;            // 0-1 frecuencia relativa
  especificidad: number;   // 0=vaga, 1=con métricas
  sentimiento: number;     // -1 a +1
}
```

### ConfiguracionSwarm
```typescript
interface ConfiguracionSwarm {
  maxAgentesConcurrentes: number;
  timeoutPorAgente: number;
  modeloLLM: 'qwen-72b' | 'deepseek-r1' | 'nemotron-3';
  tierHardware: 1 | 2 | 3;
  modoPrivacidad: 'local-only' | 'hybrid-anon';
}
```

### LedgerAuditoria
```typescript
interface LedgerAuditoria {
  timestamp: string;
  operacion: string;
  agenteId: string;
  datosHash: string;       // SHA-256
  nivelRiesgo: 'bajo' | 'medio' | 'alto';
  conformidad: ('GDPR' | 'LGPD' | 'ISO27001')[];
}
```

### ImpactoPolitica
```typescript
interface ImpactoPolitica {
  felicidadDelta: number;
  ingresoDeltaPct: number;
  empleoDeltaPct: number;
  confianzaDelta: number;
  costoPresupuestalPerCapita: number;
}
```
