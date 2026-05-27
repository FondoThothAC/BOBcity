import { useState, useEffect, useCallback } from "react";
import { eventBus } from "../events/EventBus";

const CACHE_KEY = "civica_geojson_v1";
const SOURCES = [
  { id: "local_api", url: "http://127.0.0.1:5001/api/estados" },
  { id: "git_mirror", url: "/data/estados_fallback.geojson" },
  { id: "procedural", url: null }, // generado in-browser
];

/**
 * Carga GeoJSON con tolerancia a fallos en cascada (UXDD §1.1).
 * Niveles: API local (puerto 5001) → Repo Git espejo → Fallback procedural.
 */
export function useGeoJSON(level = "estados") {
  const [data, setData] = useState(null);
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const emit = useCallback((type, payload) => {
    eventBus.publish({
      sender: "geo-loader",
      eventType: type,
      payload: { level, ...payload },
    });
  }, [level]);

  const generateProcedural = useCallback(() => {
    // Fallback mínimo in-browser: rectángulos alrededor de centroides conocidos
    const centroids = [
      { name: "Sonora", lat: 29.07, lng: -110.95 },
      { name: "Ciudad de México", lat: 19.34, lng: -99.17 },
      { name: "Jalisco", lat: 20.67, lng: -103.34 },
      { name: "Nuevo León", lat: 25.59, lng: -99.99 },
      { name: "Puebla", lat: 19.06, lng: -97.76 },
      { name: "Veracruz", lat: 19.44, lng: -96.38 },
      { name: "Guanajuato", lat: 21.02, lng: -101.26 },
      { name: "Yucatán", lat: 20.74, lng: -89.08 },
    ];
    return {
      type: "FeatureCollection",
      features: centroids.map(c => ({
        type: "Feature",
        properties: { name: c.name, centroid: { lat: c.lat, lng: c.lng } },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [c.lng - 1.5, c.lat - 1.5], [c.lng + 1.5, c.lat - 1.5],
            [c.lng + 1.5, c.lat + 1.5], [c.lng - 1.5, c.lat + 1.5],
            [c.lng - 1.5, c.lat - 1.5],
          ]],
        },
      })),
      _meta: { source: "procedural_browser", generated_at: new Date().toISOString() },
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadGeoData = async () => {
      setLoading(true);
      // 1) Intentar caché local primero (offline-first estricto)
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (!cancelled) {
            setData(parsed);
            setSource("cache");
            emit("AGENT_COMPLETED", { message: "GeoJSON cargado desde caché local" });
            setLoading(false);
            return;
          }
        }
      } catch { /* caché corrupta, continuar */ }

      // 2) Cascada de fuentes remotas
      for (const src of SOURCES) {
        if (cancelled) return;
        try {
          if (!src.url) {
            const proc = generateProcedural();
            setData(proc);
            setSource(src.id);
            localStorage.setItem(CACHE_KEY, JSON.stringify(proc));
            emit("AGENT_COMPLETED", { message: `GeoJSON generado proceduralmente (${src.id})` });
            break;
          }
          emit("AGENT_PROGRESS", { progress: 0.3, message: `Consultando ${src.id}...` });
          const res = await fetch(src.url, { signal: AbortSignal.timeout(3000) });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          if (!cancelled) {
            setData(json);
            setSource(src.id);
            localStorage.setItem(CACHE_KEY, JSON.stringify(json));
            emit("AGENT_COMPLETED", { message: `GeoJSON cargado desde ${src.id}`, hash: json._meta?.sha256 });
            break;
          }
        } catch (err) {
          console.warn(`[useGeoJSON] ${src.id} falló:`, err.message);
          emit("AGENT_FAILED", { error: `${src.id}: ${err.message}` });
          if (src === SOURCES[SOURCES.length - 1]) {
            const proc = generateProcedural();
            setData(proc);
            setSource("procedural_fallback");
            setError("Todas las fuentes primarias fallaron; usando fallback procedural.");
          }
        }
      }
      if (!cancelled) {
        setLoading(false);
      }
    };
    
    loadGeoData();
    return () => { cancelled = true; };
  }, [level, emit, generateProcedural]);

  return { data, source, error, loading };
}
