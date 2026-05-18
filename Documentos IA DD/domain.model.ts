/**
 * DDD — Domain Driven Design
 * CivicPulse / CívicaOS
 * Capa: Modelo de Dominio Cívico
 *
 * Lenguaje Ubicuo (Ubiquitous Language) para CivicPulse:
 *   Iniciativa Cívica  → problema ciudadano estructurado para análisis
 *   Punto de Dolor     → manifestación georreferenciada de una necesidad no cubierta
 *   Gemelo Digital     → población sintética con capacidad de simulación
 *   Agente Sintético   → ciudadano virtual con perfil sociodemográfico
 *   Escenario          → combinación de política + población + tiempo simulado
 *   Reporte de Pulso   → artefacto de salida del análisis completo
 *   Predicción Electoral → estimación de probabilidad de victoria con intervalo de confianza
 */

// ══════════════════════════════════════════════════════════════════════════════
// VALUE OBJECTS
// ══════════════════════════════════════════════════════════════════════════════

/** Coordenada geográfica inmutable */
export class Coordenada {
  constructor(
    public readonly latitud: number,
    public readonly longitud: number
  ) {
    if (latitud < -90 || latitud > 90)
      throw new Error(`Latitud inválida: ${latitud}`);
    if (longitud < -180 || longitud > 180)
      throw new Error(`Longitud inválida: ${longitud}`);
    Object.freeze(this);
  }

  distanciaKm(otra: Coordenada): number {
    const R = 6371;
    const dLat = ((otra.latitud - this.latitud) * Math.PI) / 180;
    const dLon = ((otra.longitud - this.longitud) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((this.latitud * Math.PI) / 180) *
        Math.cos((otra.latitud * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  toString(): string {
    return `(${this.latitud.toFixed(6)}, ${this.longitud.toFixed(6)})`;
  }
}

/** Período de análisis con validación temporal */
export class PeriodoAnalisis {
  constructor(
    public readonly inicio: Date,
    public readonly fin: Date
  ) {
    if (fin <= inicio)
      throw new Error("La fecha de fin debe ser posterior al inicio");
    Object.freeze(this);
  }

  get duracionDias(): number {
    return Math.ceil(
      (this.fin.getTime() - this.inicio.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
}

/** Score de probabilidad electoral con intervalo de confianza */
export class ProbabilidadElectoral {
  constructor(
    public readonly valor: number,         // 0–1
    public readonly margenError: number,   // ± porcentual
    public readonly nivelConfianza: number // típicamente 0.95
  ) {
    if (valor < 0 || valor > 1)
      throw new Error(`Probabilidad fuera de rango: ${valor}`);
    if (margenError < 0 || margenError > 1)
      throw new Error(`Margen de error inválido: ${margenError}`);
    Object.freeze(this);
  }

  get limiteInferior(): number {
    return Math.max(0, this.valor - this.margenError);
  }

  get limiteSuperior(): number {
    return Math.min(1, this.valor + this.margenError);
  }

  esCercano(): boolean {
    return this.valor > 0.45 && this.valor < 0.55;
  }

  toString(): string {
    return `${(this.valor * 100).toFixed(1)}% ± ${(this.margenError * 100).toFixed(1)}%`;
  }
}

/** Nivel de hardware donde corre el análisis */
export class NivelHardware {
  static readonly NIVEL_1 = new NivelHardware("Mac Mini M4", 1000, 16);
  static readonly NIVEL_2 = new NivelHardware("DGX Spark", 10000, 128);
  static readonly NIVEL_3 = new NivelHardware("H100 Server", 100000, 640);

  private constructor(
    public readonly nombre: string,
    public readonly maxAgentes: number,
    public readonly memoriaGB: number
  ) {
    Object.freeze(this);
  }

  soportaPoblacion(tamano: number): boolean {
    return tamano <= this.maxAgentes;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// ENTITIES
// ══════════════════════════════════════════════════════════════════════════════

/** Punto de dolor ciudadano con georreferencia */
export class PuntoDeDolor {
  readonly id: string;
  private _intensidad: number; // 0–1

  constructor(
    id: string,
    public readonly tipo: "seguridad" | "agua" | "economia" | "transporte" | "salud" | "educacion",
    public readonly ubicacion: Coordenada,
    public readonly colonia: string,
    intensidad: number,
    public readonly fechaReporte: Date
  ) {
    this.id = id;
    if (intensidad < 0 || intensidad > 1)
      throw new Error("Intensidad debe estar entre 0 y 1");
    this._intensidad = intensidad;
  }

  get intensidad(): number {
    return this._intensidad;
  }

  actualizarIntensidad(nuevaIntensidad: number): void {
    if (nuevaIntensidad < 0 || nuevaIntensidad > 1)
      throw new Error("Intensidad inválida");
    this._intensidad = nuevaIntensidad;
  }

  esCritico(): boolean {
    return this._intensidad >= 0.75;
  }
}

/** Perfil de candidato electoral */
export class PerfilCandidato {
  readonly id: string;

  constructor(
    id: string,
    public readonly nombre: string,
    public readonly edad: number,
    public readonly genero: "M" | "F" | "NB",
    public readonly sectorExperiencia: string,
    public readonly aniosExperienciaGobierno: number,
    public readonly propuestasClaves: string[],
    public readonly nivelEducativo: "licenciatura" | "maestria" | "doctorado"
  ) {
    this.id = id;
    if (edad < 18 || edad > 120)
      throw new Error(`Edad inválida: ${edad}`);
    if (propuestasClaves.length < 1)
      throw new Error("Un candidato debe tener al menos una propuesta");
  }

  get tieneExperienciaGobierno(): boolean {
    return this.aniosExperienciaGobierno > 0;
  }

  get esPerfilAtipico(): boolean {
    return (
      this.aniosExperienciaGobierno > 30 ||
      this.propuestasClaves.length > 20 ||
      this.edad < 21
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AGGREGATES
// ══════════════════════════════════════════════════════════════════════════════

/** Aggregate Root: Iniciativa Cívica */
export class IniciativaCivica {
  private readonly _eventos: DomainEvent[] = [];
  private _estado: "borrador" | "en_analisis" | "completada" | "exportada" = "borrador";

  constructor(
    public readonly id: string,
    public readonly titulo: string,
    public readonly distritoClave: string,  // ej: "D8-HERMOSILLO"
    public readonly municipio: string,
    public readonly createdAt: Date = new Date()
  ) {
    if (!distritoClave.match(/^D\d{1,3}-[A-Z]+/))
      throw new Error(`Clave de distrito inválida: ${distritoClave}`);
  }

  get estado() {
    return this._estado;
  }

  get eventos(): readonly DomainEvent[] {
    return this._eventos;
  }

  iniciarAnalisis(nivel: NivelHardware): void {
    if (this._estado !== "borrador")
      throw new Error(`No se puede iniciar análisis en estado: ${this._estado}`);
    this._estado = "en_analisis";
    this._eventos.push(new AnalisisIniciado(this.id, nivel, new Date()));
  }

  completarAnalisis(reporte: ReporteDePulso): void {
    if (this._estado !== "en_analisis")
      throw new Error("El análisis no está en progreso");
    this._estado = "completada";
    this._eventos.push(new AnalisisCompletado(this.id, reporte.id, new Date()));
  }

  exportarAOBP(payloadId: string): void {
    if (this._estado !== "completada")
      throw new Error("La iniciativa debe estar completada antes de exportar");
    this._estado = "exportada";
    this._eventos.push(new ExportadaAOpenBusinessPlan(this.id, payloadId, new Date()));
  }

  clearEventos(): void {
    this._eventos.length = 0;
  }
}

/** Aggregate Root: Gemelo Digital Social */
export class GemeloDijitalSocial {
  private readonly _agentes: AgenteS sintetico[] = [];
  private _version: number = 0;

  constructor(
    public readonly id: string,
    public readonly municipio: string,
    public readonly nivel: NivelHardware
  ) {}

  get agentes(): readonly AgenteS intetico[] {
    return this._agentes;
  }

  get version(): number {
    return this._version;
  }

  poblarDesdeCenso(agentes: AgenteSintetico[]): void {
    if (agentes.length > this.nivel.maxAgentes)
      throw new Error(
        `Hardware ${this.nivel.nombre} no soporta ${agentes.length} agentes (max: ${this.nivel.maxAgentes})`
      );
    this._agentes.push(...agentes);
    this._version++;
  }

  aplicarPolitica(politica: PoliticaPublica): ResultadoEscenario {
    if (this._agentes.length === 0)
      throw new Error("El gemelo debe estar poblado antes de aplicar políticas");

    const agentesActualizados = this._agentes.map((agente) =>
      agente.reaccionarA(politica)
    );

    const felicidadPromedio =
      agentesActualizados.reduce((sum, a) => sum + a.felicidad, 0) /
      agentesActualizados.length;

    const intencionVotoGobierno =
      agentesActualizados.reduce((sum, a) => sum + a.intencionVoto, 0) /
      agentesActualizados.length;

    this._version++;

    return new ResultadoEscenario(
      politica.nombre,
      felicidadPromedio,
      intencionVotoGobierno,
      agentesActualizados.length
    );
  }
}

/** Aggregate Root: Reporte de Pulso (output principal) */
export class ReporteDePulso {
  constructor(
    public readonly id: string,
    public readonly iniciativaId: string,
    public readonly fechaGeneracion: Date,
    public readonly puntosDeDolor: PuntoDeDolor[],
    public readonly resultadoEscenario: ResultadoEscenario,
    public readonly prediccionElectoral?: PrediccionElectoral,
    public readonly auditLog: AuditEntry[] = []
  ) {}

  get esCritico(): boolean {
    return this.puntosDeDolor.some((p) => p.esCritico());
  }

  toOBPPayload(): OBPPayload {
    return {
      version: "2.5.12",
      iniciativa_id: this.iniciativaId,
      fecha: this.fechaGeneracion.toISOString(),
      diagnostico: {
        puntos_dolor: this.puntosDeDolor.map((p) => ({
          tipo: p.tipo,
          intensidad: p.intensidad,
          colonia: p.colonia,
        })),
        felicidad_promedio: this.resultadoEscenario.felicidadPromedio,
        intencion_voto_gobierno: this.resultadoEscenario.intencionVotoGobierno,
      },
      prediccion_electoral: this.prediccionElectoral
        ? {
            candidato_a: this.prediccionElectoral.candidatoA.toString(),
            candidato_b: this.prediccionElectoral.candidatoB.toString(),
          }
        : null,
      auditoria: {
        total_entradas: this.auditLog.length,
        local_only: this.auditLog.every((e) => e.esLocal),
      },
    };
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DOMAIN EVENTS
// ══════════════════════════════════════════════════════════════════════════════

abstract class DomainEvent {
  abstract readonly tipo: string;
  constructor(
    public readonly agregadoId: string,
    public readonly ocurrioEn: Date
  ) {}
}

export class AnalisisIniciado extends DomainEvent {
  readonly tipo = "ANALISIS_INICIADO";
  constructor(
    id: string,
    public readonly nivel: NivelHardware,
    fecha: Date
  ) {
    super(id, fecha);
  }
}

export class AnalisisCompletado extends DomainEvent {
  readonly tipo = "ANALISIS_COMPLETADO";
  constructor(id: string, public readonly reporteId: string, fecha: Date) {
    super(id, fecha);
  }
}

export class ExportadaAOpenBusinessPlan extends DomainEvent {
  readonly tipo = "EXPORTADA_A_OBP";
  constructor(id: string, public readonly payloadId: string, fecha: Date) {
    super(id, fecha);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// REPOSITORIES (interfaces — implementación en infraestructura)
// ══════════════════════════════════════════════════════════════════════════════

export interface IIniciativaCivicaRepository {
  save(iniciativa: IniciativaCivica): Promise<void>;
  findById(id: string): Promise<IniciativaCivica | null>;
  findByDistrito(distritoClave: string): Promise<IniciativaCivica[]>;
  findByEstado(estado: string): Promise<IniciativaCivica[]>;
}

export interface IGemeloDijitalRepository {
  save(gemelo: GemeloDijitalSocial): Promise<void>;
  findByMunicipio(municipio: string): Promise<GemeloDijitalSocial | null>;
}

export interface IReporteDePulsoRepository {
  save(reporte: ReporteDePulso): Promise<void>;
  findByIniciativa(iniciativaId: string): Promise<ReporteDePulso[]>;
  findUltimo(municipio: string): Promise<ReporteDePulso | null>;
}

// ══════════════════════════════════════════════════════════════════════════════
// SUPPORTING TYPES (sin lógica de negocio, soporte estructural)
// ══════════════════════════════════════════════════════════════════════════════

export interface AgenteSintetico {
  id: string;
  sector: "comerciante" | "estudiante" | "obrero";
  ingreso: number;
  edad: number;
  felicidad: number;
  intencionVoto: number;
  opinion: number;
  reaccionarA(politica: PoliticaPublica): AgenteSintetico;
}

export interface PoliticaPublica {
  nombre: string;
  impactoIngreso: number;
  impactoServicios: number;
  impactoSeguridad: number;
}

export class ResultadoEscenario {
  constructor(
    public readonly nombrePolitica: string,
    public readonly felicidadPromedio: number,
    public readonly intencionVotoGobierno: number,
    public readonly totalAgentes: number
  ) {}
}

export interface PrediccionElectoral {
  candidatoA: ProbabilidadElectoral;
  candidatoB: ProbabilidadElectoral;
  factorDominante: string;
}

export interface AuditEntry {
  timestamp: Date;
  agente: string;
  accion: string;
  hashSHA256: string;
  esLocal: boolean;
}

export interface OBPPayload {
  version: string;
  iniciativa_id: string;
  fecha: string;
  diagnostico: object;
  prediccion_electoral: object | null;
  auditoria: object;
}
