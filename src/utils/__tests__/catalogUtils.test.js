// src/utils/__tests__/catalogUtils.test.js
import { describe, it, expect } from "vitest";
import { normalizeStr, searchMunicipalities, validateStreamUrl } from "../catalogUtils";

describe("catalogUtils", () => {
  it("normaliza acentos y mayúsculas", () => {
    expect(normalizeStr("México")).toBe("mexico");
  });

  it("filtra catálogo sin errores de tipo", () => {
    const cat = [{ id: 1, name: "Hermosillo", state: "Sonora" }];
    expect(searchMunicipalities("hermos", cat)).toHaveLength(1);
    expect(() => searchMunicipalities("a", "invalid")).toThrow(TypeError);
  });

  it("valida URLs de stream", () => {
    expect(validateStreamUrl("https://www.youtube.com/embed/WzWkB")).toBeNull(); // Plantilla vacía
    expect(validateStreamUrl("https://live.example.com/feed123")).toBeTruthy();
    expect(validateStreamUrl(123)).toBeNull();
  });
});
