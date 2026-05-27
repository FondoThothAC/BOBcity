// src/utils/catalogUtils.js
/**
 * Normaliza strings para búsqueda insensible a acentos, mayúsculas y espacios.
 */
export const normalizeStr = (str) => 
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/**
 * Busca municipios en catálogo local con límite y validación de entrada.
 * Prioriza coordenadas locales; Nominatim se delega al caller si `coords` es null.
 */
export function searchMunicipalities(query, catalog, limit = 50) {
  if (!Array.isArray(catalog)) throw new TypeError("El catálogo debe ser un array.");
  if (limit < 1 || limit > 200) throw new RangeError("El límite debe estar entre 1 y 200.");
  
  const q = normalizeStr(query || "");
  return catalog
    .filter(m => normalizeStr(m.name).includes(q) || normalizeStr(m.state).includes(q))
    .slice(0, limit);
}

/**
 * Valida y normaliza una URL de stream. Retorna null si es inválida o genérica.
 */
export function validateStreamUrl(url) {
  if (!url || typeof url !== "string") return null;
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    if (parsed.hostname === "www.youtube.com" && parsed.pathname === "/embed/") return null; // Plantilla vacía
    return url;
  } catch { return null; }
}
