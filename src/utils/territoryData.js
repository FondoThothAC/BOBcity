import electoralScenarios from "../data/electoral_scenarios.json";
import catalogMunicipios from "../data/municipios_catalogo.json";
import { MEXICO_STATES } from "../models/dataModel";
import { normalizeStr } from "./catalogUtils";

export function cleanTerritoryName(name = "") {
  return String(name)
    .replace(/^Alcald[ií]a\s*\/\s*Municipio\s*de\s*/i, "")
    .replace(/^Municipio\s*de\s*/i, "")
    .replace(/^Alcald[ií]a\s*de\s*/i, "")
    .trim();
}

export function territoryKey(value = "") {
  return normalizeStr(String(value)).replace(/\s+/g, "_").toUpperCase();
}

function getStateEntry(stateName = "") {
  const wanted = normalizeStr(stateName);
  return Object.values(MEXICO_STATES).find((state) => {
    const cleanModelName = normalizeStr(String(state.name).replace(/[^\p{L}\p{N}\s]/gu, ""));
    return cleanModelName === wanted || normalizeStr(state.id).replace(/_/g, " ") === wanted;
  });
}

function stableOffset(seed = "", amplitude = 0.72) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const lat = (((Math.abs(hash) % 200) - 100) / 100) * amplitude;
  const lng = ((((Math.abs(hash) >> 3) % 200) - 100) / 100) * amplitude;
  return [lat, lng];
}

export function getStateCenter(stateName = "") {
  const state = getStateEntry(stateName);
  return state?.coords || [23.6345, -102.5528];
}

export function getMunicipalityCenter(municipality = {}) {
  const muniName = cleanTerritoryName(municipality.name || municipality.municipality || "");
  const stateName = municipality.state || "";
  const found = catalogMunicipios.find((item) => (
    normalizeStr(item.name) === normalizeStr(muniName)
    && normalizeStr(item.state) === normalizeStr(stateName)
  ));

  if (found?.lat && found?.lng) return [Number(found.lat), Number(found.lng)];

  const [baseLat, baseLng] = getStateCenter(stateName);
  const [latOffset, lngOffset] = stableOffset(`${stateName}:${muniName}:${municipality.code || municipality.id || ""}`);
  return [baseLat + latOffset, baseLng + lngOffset];
}

export function getStatesList() {
  return [...new Set(electoralScenarios.map((d) => d.state))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "es"))
    .map((state) => ({ id: state, name: state, coords: getStateCenter(state) }));
}

export function getMunicipalitiesByState(stateName) {
  return electoralScenarios
    .filter((d) => d.state === stateName && d.level === "Municipio")
    .map((m) => ({
      id: m.code,
      code: m.code,
      name: cleanTerritoryName(m.name),
      state: m.state,
      lat: getMunicipalityCenter(m)[0],
      lng: getMunicipalityCenter(m)[1],
      coords: getMunicipalityCenter(m),
      population: Number(m.population) || 0,
      weights: m.weights || {},
      raw: m
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function getNationalMunicipalityCatalog() {
  return getStatesList().flatMap((state) => getMunicipalitiesByState(state.name));
}
