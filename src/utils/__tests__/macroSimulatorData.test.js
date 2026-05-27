// src/utils/__tests__/macroSimulatorData.test.js
import { describe, it, expect } from "vitest";
import { generateMacroSimData } from "../macroSimulatorData";

describe("macroSimulatorData", () => {
  it("genera resultados idénticos con misma semilla", () => {
    const cands = [{ id: "A", name: "Candidato 1" }, { id: "B", name: "Candidato 2" }];
    const run1 = generateMacroSimData(cands);
    const run2 = generateMacroSimData(cands);
    expect(run1).toEqual(run2);
    expect(run1.every(r => typeof r.winProbability === "number")).toBe(true);
  });
});
