// src/utils/__tests__/geoPolygons.test.js
import { describe, it, expect } from "vitest";
import { getInterlockingPolygon, municipalitiesToGeoJSON } from "../geoPolygons";

describe("geoPolygons", () => {
  it("genera polígono cerrado de 14 lados + vértice de cierre", () => {
    const ring = getInterlockingPolygon([29.07, -110.95], 14, 0.08, 42);
    expect(ring).toHaveLength(15);
    expect(ring[0]).toEqual(ring[14]);
  });

  it("es determinista: misma semilla → mismo polígono", () => {
    const a = getInterlockingPolygon([19.34, -99.17], 14, 0.08, 7);
    const b = getInterlockingPolygon([19.34, -99.17], 14, 0.08, 7);
    expect(a).toEqual(b);
  });

  it("semillas distintas producen polígonos distintos", () => {
    const a = getInterlockingPolygon([19.34, -99.17], 14, 0.08, 7);
    const b = getInterlockingPolygon([19.34, -99.17], 14, 0.08, 8);
    expect(a).not.toEqual(b);
  });

  it("rechaza entradas inválidas", () => {
    expect(() => getInterlockingPolygon("bad")).toThrow(TypeError);
  });
});
