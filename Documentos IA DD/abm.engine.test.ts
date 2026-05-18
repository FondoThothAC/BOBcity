/**
 * TDD — Test Driven Development
 * CivicPulse / CívicaOS
 * Capa: Motor ABM (Agentes, Felicidad, Opinión, Voto)
 *
 * Ejecutar: npx vitest run tdd/abm.engine.test.ts
 *
 * Filosofía TDD aplicada:
 *   Red   → escribir el test que falla
 *   Green → escribir el mínimo código que lo pasa
 *   Refactor → limpiar sin romper tests
 */

import { describe, it, expect, beforeEach } from "vitest";

// ─── Interfaces del dominio (mínimas para que compilen los tests) ──────────────
interface AgentProfile {
  id: string;
  sector: "comerciante" | "estudiante" | "obrero";
  ingreso: number;       // 0–1 normalizado
  edad: number;
  satisfaccion: number;  // 0–1
  intencionVoto: number; // 0–1 (0 = oposición, 1 = gobierno)
  opinion: number;       // Deffuant-Weisbuch: 0–1
}

interface Politica {
  nombre: string;
  impactoIngreso: number;       // delta normalizado, puede ser negativo
  impactoServicios: number;
  impactoSeguridad: number;
}

interface ResultadoSimulacion {
  felicidadPromedio: number;
  intencionVotoGobierno: number;
  agentesActualizados: AgentProfile[];
  ciclos: number;
}

// ─── Funciones bajo prueba (stubs vacíos — TDD: se implementan DESPUÉS) ────────
// Estas funciones deben existir en src/engine/abm.engine.ts

declare function calcularFelicidad(agente: AgentProfile): number;
declare function actualizarOpinion(
  agente: AgentProfile,
  vecino: AgentProfile,
  mu: number
): AgentProfile;
declare function aplicarPolitica(
  agentes: AgentProfile[],
  politica: Politica
): AgentProfile[];
declare function simularCiclos(
  agentes: AgentProfile[],
  politica: Politica,
  ciclos: number
): ResultadoSimulacion;
declare function calcularProbabilidadVoto(agentes: AgentProfile[]): number;

// ─── Suite 1: Modelo de Felicidad Colectiva ────────────────────────────────────
describe("TDD › Motor ABM › calcularFelicidad()", () => {
  let agente: AgentProfile;

  beforeEach(() => {
    agente = {
      id: "A001",
      sector: "obrero",
      ingreso: 0.5,
      edad: 35,
      satisfaccion: 0.6,
      intencionVoto: 0.5,
      opinion: 0.5,
    };
  });

  it("debe retornar un número entre 0 y 1", () => {
    const h = calcularFelicidad(agente);
    expect(h).toBeGreaterThanOrEqual(0);
    expect(h).toBeLessThanOrEqual(1);
  });

  it("agente con ingreso y satisfacción máximos → felicidad cerca de 1", () => {
    agente.ingreso = 1;
    agente.satisfaccion = 1;
    expect(calcularFelicidad(agente)).toBeGreaterThan(0.85);
  });

  it("agente con ingreso y satisfacción mínimos → felicidad cerca de 0", () => {
    agente.ingreso = 0;
    agente.satisfaccion = 0;
    expect(calcularFelicidad(agente)).toBeLessThan(0.15);
  });

  it("comerciante pesa ingreso con mayor factor que obrero", () => {
    const obrero: AgentProfile = { ...agente, sector: "obrero", ingreso: 0.3 };
    const comerciante: AgentProfile = {
      ...agente,
      sector: "comerciante",
      ingreso: 0.3,
    };
    // Hipótesis: comerciante es más sensible a cambios de ingreso
    const deltaObrero = calcularFelicidad({ ...obrero, ingreso: 0.6 }) - calcularFelicidad(obrero);
    const deltaComercio = calcularFelicidad({ ...comerciante, ingreso: 0.6 }) - calcularFelicidad(comerciante);
    expect(deltaComercio).toBeGreaterThan(deltaObrero);
  });
});

// ─── Suite 2: Dinámica de Opinión Deffuant-Weisbuch ───────────────────────────
describe("TDD › Motor ABM › actualizarOpinion()", () => {
  it("si |opinión_A - opinión_B| < epsilon, opiniones convergen", () => {
    const A: AgentProfile = {
      id: "A",
      sector: "estudiante",
      ingreso: 0.4,
      edad: 22,
      satisfaccion: 0.5,
      intencionVoto: 0.5,
      opinion: 0.3,
    };
    const B: AgentProfile = { ...A, id: "B", opinion: 0.45 };
    const mu = 0.3; // factor de convergencia
    const resultado = actualizarOpinion(A, B, mu);
    // Opinión de A debe moverse hacia B
    expect(resultado.opinion).toBeGreaterThan(A.opinion);
    expect(resultado.opinion).toBeLessThanOrEqual(B.opinion);
  });

  it("si |opinión_A - opinión_B| >= epsilon, opiniones NO cambian", () => {
    const A: AgentProfile = {
      id: "A",
      sector: "comerciante",
      ingreso: 0.6,
      edad: 45,
      satisfaccion: 0.4,
      intencionVoto: 0.4,
      opinion: 0.1,
    };
    const B: AgentProfile = { ...A, id: "B", opinion: 0.9 };
    const mu = 0.3;
    const resultado = actualizarOpinion(A, B, mu);
    expect(resultado.opinion).toBe(A.opinion);
  });

  it("la opinión actualizada nunca sale del rango [0, 1]", () => {
    const A: AgentProfile = {
      id: "A",
      sector: "obrero",
      ingreso: 0.2,
      edad: 50,
      satisfaccion: 0.3,
      intencionVoto: 0.3,
      opinion: 0.05,
    };
    const B: AgentProfile = { ...A, id: "B", opinion: 0.1 };
    const resultado = actualizarOpinion(A, B, 0.5);
    expect(resultado.opinion).toBeGreaterThanOrEqual(0);
    expect(resultado.opinion).toBeLessThanOrEqual(1);
  });
});

// ─── Suite 3: Aplicación de Políticas Públicas ────────────────────────────────
describe("TDD › Motor ABM › aplicarPolitica()", () => {
  const agentes: AgentProfile[] = [
    {
      id: "E001",
      sector: "estudiante",
      ingreso: 0.3,
      edad: 21,
      satisfaccion: 0.4,
      intencionVoto: 0.4,
      opinion: 0.4,
    },
    {
      id: "C001",
      sector: "comerciante",
      ingreso: 0.6,
      edad: 40,
      satisfaccion: 0.6,
      intencionVoto: 0.6,
      opinion: 0.6,
    },
  ];

  const subsidioTransporte: Politica = {
    nombre: "Subsidio transporte estudiantil",
    impactoIngreso: 0.05,
    impactoServicios: 0.1,
    impactoSeguridad: 0,
  };

  it("debe retornar el mismo número de agentes que la entrada", () => {
    const resultado = aplicarPolitica(agentes, subsidioTransporte);
    expect(resultado.length).toBe(agentes.length);
  });

  it("política de subsidio sube satisfacción de estudiantes", () => {
    const resultado = aplicarPolitica(agentes, subsidioTransporte);
    const estudiante = resultado.find((a) => a.sector === "estudiante")!;
    const original = agentes.find((a) => a.sector === "estudiante")!;
    expect(estudiante.satisfaccion).toBeGreaterThan(original.satisfaccion);
  });

  it("impacto negativo de ingreso baja la satisfacción", () => {
    const impuestoCarbon: Politica = {
      nombre: "Impuesto al carbono 5%",
      impactoIngreso: -0.08,
      impactoServicios: 0.02,
      impactoSeguridad: 0,
    };
    const resultado = aplicarPolitica(agentes, impuestoCarbon);
    const comerciante = resultado.find((a) => a.sector === "comerciante")!;
    const original = agentes.find((a) => a.sector === "comerciante")!;
    expect(comerciante.satisfaccion).toBeLessThan(original.satisfaccion);
  });

  it("satisfacción siempre queda en rango [0, 1] después de política extrema", () => {
    const politicaExtrema: Politica = {
      nombre: "Política extrema test",
      impactoIngreso: -1.0,
      impactoServicios: -1.0,
      impactoSeguridad: -1.0,
    };
    const resultado = aplicarPolitica(agentes, politicaExtrema);
    resultado.forEach((a) => {
      expect(a.satisfaccion).toBeGreaterThanOrEqual(0);
      expect(a.satisfaccion).toBeLessThanOrEqual(1);
    });
  });
});

// ─── Suite 4: Simulación de Ciclos Completos ──────────────────────────────────
describe("TDD › Motor ABM › simularCiclos()", () => {
  const poblacion: AgentProfile[] = Array.from({ length: 100 }, (_, i) => ({
    id: `AGT-${i}`,
    sector: i % 3 === 0 ? "comerciante" : i % 3 === 1 ? "estudiante" : "obrero",
    ingreso: Math.random(),
    edad: 20 + Math.floor(Math.random() * 45),
    satisfaccion: Math.random(),
    intencionVoto: Math.random(),
    opinion: Math.random(),
  }));

  const politica: Politica = {
    nombre: "Corredor Pyme Centro D9",
    impactoIngreso: 0.07,
    impactoServicios: 0.05,
    impactoSeguridad: 0.02,
  };

  it("retorna estructura completa de ResultadoSimulacion", () => {
    const r = simularCiclos(poblacion, politica, 10);
    expect(r).toHaveProperty("felicidadPromedio");
    expect(r).toHaveProperty("intencionVotoGobierno");
    expect(r).toHaveProperty("agentesActualizados");
    expect(r).toHaveProperty("ciclos");
  });

  it("felicidadPromedio está entre 0 y 1", () => {
    const r = simularCiclos(poblacion, politica, 10);
    expect(r.felicidadPromedio).toBeGreaterThanOrEqual(0);
    expect(r.felicidadPromedio).toBeLessThanOrEqual(1);
  });

  it("100 ciclos con política positiva → mayor felicidad que 1 ciclo", () => {
    const r1 = simularCiclos(poblacion, politica, 1);
    const r100 = simularCiclos(poblacion, politica, 100);
    expect(r100.felicidadPromedio).toBeGreaterThan(r1.felicidadPromedio);
  });

  it("número de ciclos reportado coincide con los solicitados", () => {
    const r = simularCiclos(poblacion, politica, 25);
    expect(r.ciclos).toBe(25);
  });
});

// ─── Suite 5: Predictor de Intención de Voto (Logit Softmax) ─────────────────
describe("TDD › Motor ABM › calcularProbabilidadVoto()", () => {
  it("retorna valor entre 0 y 1", () => {
    const agentes: AgentProfile[] = [
      {
        id: "V1",
        sector: "obrero",
        ingreso: 0.4,
        edad: 38,
        satisfaccion: 0.5,
        intencionVoto: 0.6,
        opinion: 0.6,
      },
    ];
    const prob = calcularProbabilidadVoto(agentes);
    expect(prob).toBeGreaterThanOrEqual(0);
    expect(prob).toBeLessThanOrEqual(1);
  });

  it("población con intencionVoto alta → probabilidad > 0.5", () => {
    const agentes = Array.from({ length: 50 }, (_, i) => ({
      id: `V${i}`,
      sector: "obrero" as const,
      ingreso: 0.6,
      edad: 35,
      satisfaccion: 0.7,
      intencionVoto: 0.8,
      opinion: 0.7,
    }));
    expect(calcularProbabilidadVoto(agentes)).toBeGreaterThan(0.5);
  });

  it("población dividida 50/50 → probabilidad cerca de 0.5", () => {
    const agentes = Array.from({ length: 100 }, (_, i) => ({
      id: `V${i}`,
      sector: "estudiante" as const,
      ingreso: 0.5,
      edad: 25,
      satisfaccion: 0.5,
      intencionVoto: i < 50 ? 0.2 : 0.8,
      opinion: 0.5,
    }));
    const prob = calcularProbabilidadVoto(agentes);
    expect(prob).toBeGreaterThan(0.4);
    expect(prob).toBeLessThan(0.6);
  });
});
