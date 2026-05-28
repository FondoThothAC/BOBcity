import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon, CircleMarker, useMap, useMapEvents } from "react-leaflet";
import { searchMunicipalities } from "../utils/catalogUtils";
import { getInterlockingPolygon } from "../utils/geoPolygons";
import { getNationalMunicipalityCatalog } from "../utils/territoryData";
import { eventBus } from "../events/EventBus";

const MODE_LABELS = {
  pan: "Navegar",
  well: "Pozo hidrico",
  bridge: "Cruce urbano",
  closure: "Cierre vial"
};

function createAgents(center, count = 180, seed = "worldbox") {
  let hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const next = () => {
    hash = (hash * 1664525 + 1013904223) % 4294967296;
    return hash / 4294967296;
  };
  return Array.from({ length: count }, (_, i) => ({
    id: `ag-${i}`,
    lat: center[0] + (next() - 0.5) * 0.055,
    lng: center[1] + (next() - 0.5) * 0.055,
    happiness: 55 + next() * 28,
    type: ["asalariado", "comerciante", "joven"][i % 3]
  }));
}

function useAgentLoop(agentsRef, { speed = 1, running = true }) {
  const [tick, setTick] = useState(0);
  const rafRef = useRef();
  const lastUpdateRef = useRef(0);

  const frame = useCallback((timestamp) => {
    if (running) {
      const agents = agentsRef.current;
      agents.forEach((a, idx) => {
        const phase = (timestamp / 900) + idx;
        a.lat += Math.sin(phase * 0.71) * speed * 0.000025;
        a.lng += Math.cos(phase * 0.53) * speed * 0.000025;
        a.happiness = Math.max(0, Math.min(100, a.happiness + Math.sin(phase) * 0.05 * speed));
      });
    }

    if (timestamp - lastUpdateRef.current >= 100) {
      setTick(t => t + 1);
      lastUpdateRef.current = timestamp;
    }
    rafRef.current = requestAnimationFrame(frame);
  }, [speed, running, agentsRef]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frame]);

  return tick;
}

// Componente para recentrar el mapa cuando cambia la búsqueda
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

// Componente secundario para capturar eventos de click en el mapa en modo colocación de infraestructura
function MapEventsHelper({ onClick }) {
  useMapEvents({
    click(e) {
      onClick(e);
    }
  });
  return null;
}

export function WorldBoxSimulator({ catalog, initialCenter = [29.073, -110.956] }) {
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(12);
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState({ id: "default-hermosillo", name: "Hermosillo", state: "Sonora", coords: initialCenter });
  const [policies, setPolicies] = useState({ agua: 70, seguridad: 50, impuesto: 20, subsidio: 40 });
  const [infrastructure, setInfrastructure] = useState([]);
  const [mode, setMode] = useState("pan"); // pan | well | bridge | closure
  const [layers, setLayers] = useState({ satellite: false, cps: true, agents: true, infra: true, grid: true, inegi: false, ine: false });
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [simDate, setSimDate] = useState(new Date("2026-01-01T12:00:00"));

  const municipalities = useMemo(() => {
    if (catalog && catalog.length > 0) return catalog;
    return getNationalMunicipalityCatalog();
  }, [catalog]);

  const searchResults = useMemo(() => searchMunicipalities(query, municipalities, 12), [query, municipalities]);
  const agentsRef = useRef(createAgents(initialCenter, 180, "Hermosillo"));
  useAgentLoop(agentsRef, { speed, running });

  useEffect(() => {
    if (!running) return undefined;
    const interval = setInterval(() => {
      setSimDate(prev => new Date(prev.getTime() + speed * 24 * 60 * 60 * 1000));
    }, 850);
    return () => clearInterval(interval);
  }, [running, speed]);

  // Cálculo del bienestar global
  const avgHappiness = useMemo(() => {
    const base = 60 + (policies.agua * 0.15) + (policies.seguridad * 0.1) - (policies.impuesto * 0.2) + (policies.subsidio * 0.05);
    return Math.min(100, Math.max(0, base + (infrastructure.length * 2.5)));
  }, [policies, infrastructure]);

  useEffect(() => {
    eventBus.publish({
      sender: 'worldbox', 
      eventType: 'AGENT_PROGRESS',
      payload: { progress: 0.85, message: `Simulación ABM actualizada. Bienestar social: ${avgHappiness.toFixed(1)}%` }
    });
  }, [avgHappiness]);

  const selectCity = useCallback((city) => {
    const coords = city.coords || [city.lat, city.lng];
    setSelectedCity({ ...city, coords });
    setCenter(coords);
    setZoom(12);
    setQuery(`${city.name}, ${city.state}`);
    agentsRef.current = createAgents(coords, 180, `${city.state}:${city.name}:${city.id}`);
    setInfrastructure([]);
  }, []);

  const handleMapClick = useCallback((e) => {
    if (mode === "pan") return;
    const { lat, lng } = e.latlng;
    setInfrastructure(prev => [...prev, { id: Date.now(), type: mode, lat, lng }]);
    eventBus.publish({
      sender: 'worldbox',
      eventType: 'AGENT_COMPLETED',
      payload: { message: `Infraestructura táctica (${mode === "well" ? "Pozo Hídrico" : mode === "bridge" ? "Cruce Urbano" : "Bloqueo Policial"}) desplegada en [${lat.toFixed(4)}, ${lng.toFixed(4)}]` }
    });
    setMode("pan");
  }, [mode]);

  const cpPolygons = useMemo(() => {
    const base = selectedCity?.coords || center;
    return Array.from({ length: 6 }, (_, idx) => {
      const row = Math.floor(idx / 3) - 0.5;
      const col = (idx % 3) - 1;
      const cpCenter = [base[0] + row * 0.025, base[1] + col * 0.03];
      return {
        id: `cp-${idx}`,
        cp: `${83000 + idx * 7}`,
        coords: getInterlockingPolygon(cpCenter, 12, 0.014, idx + 4)
      };
    });
  }, [selectedCity, center]);

  return (
    <div className="glass-panel" style={{ height: "85vh", display: "flex", flexDirection: "column", padding: 15 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            value={query}
            placeholder={`Buscar entre ${municipalities.length.toLocaleString("es-MX")} municipios reales...`}
            style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", padding: 8, borderRadius: 6, color: "#fff" }}
            onChange={e => setQuery(e.target.value)}
          />
          {query && searchResults.length > 0 && (
            <div className="glass-panel" style={{ position: "absolute", left: 0, right: 0, top: 38, zIndex: 800, maxHeight: 260, overflowY: "auto", padding: 6 }}>
              {searchResults.map(city => (
                <button
                  key={city.id}
                  onClick={() => selectCity(city)}
                  style={{ width: "100%", textAlign: "left", background: "transparent", border: "none", color: "#fff", padding: "8px 10px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <b>{city.name}</b> <span style={{ color: "#94a3b8" }}>{city.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#94a3b8", minWidth: 210 }}>
          <b style={{ color: "var(--accent-cyan)" }}>{selectedCity.name}</b><br />
          {selectedCity.state} · {simDate.toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "2-digit" })}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {Object.keys(MODE_LABELS).map(m => (
            <button 
              key={m} 
              onClick={() => setMode(m)} 
              style={{ 
                background: mode === m ? "var(--accent-cyan)" : "#334155", 
                border: "none", 
                padding: "6px 12px", 
                borderRadius: 4, 
                cursor: "pointer", 
                color: "#fff",
                transition: "background 0.2s"
              }}
              title={MODE_LABELS[m]}
            >
              {m === "pan" ? "Mapa" : m === "well" ? "Agua" : m === "bridge" ? "Cruce" : "Cierre"}
            </button>
          ))}
        </div>
        
        {/* Controles de Capas */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 6 }}>
          <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Capas:</span>
          {Object.entries({ satellite: 'Sat', inegi: 'INEGI (DENUE)', ine: 'INE (Secc)', cps: 'CPs' }).map(([key, label]) => (
            <label key={key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: layers[key] ? "var(--neon-cyan)" : "#fff", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                checked={layers[key]} 
                onChange={() => setLayers(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{ accentColor: "var(--neon-cyan)", cursor: "pointer" }}
              />
              {label}
            </label>
          ))}
        </div>

        <button onClick={() => setRunning(v => !v)} style={{ background: running ? "var(--alert-coral)" : "var(--accent-emerald)", border: "none", color: "#020617", padding: "7px 12px", borderRadius: 4, fontWeight: 800, cursor: "pointer" }}>
          {running ? "Pausar" : "Iniciar"}
        </button>
        <select value={speed} onChange={e => setSpeed(Number(e.target.value))} style={{ background: "#1e293b", color: "#fff", border: "1px solid var(--border-subtle)", padding: 7, borderRadius: 4 }}>
          <option value={1}>x1</option>
          <option value={3}>x3</option>
          <option value={7}>x7</option>
          <option value={30}>x30</option>
        </select>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: avgHappiness > 70 ? "var(--accent-emerald)" : avgHappiness > 40 ? "var(--alert-amber)" : "var(--alert-coral)" }}>
          Bienestar: {avgHappiness.toFixed(1)}%
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", borderRadius: 8, overflow: "hidden", border: layers.satellite ? '2px solid var(--neon-emerald)' : 'none' }}>
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer 
            url={layers.satellite 
              ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
              : (simDate.getHours() >= 6 && simDate.getHours() <= 18 
                  ? "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
                  : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png")} 
          />
          <RecenterMap center={center} zoom={zoom} />
          <MapEventsHelper onClick={handleMapClick} />

          {layers.inegi && (
            <Polygon positions={getInterlockingPolygon(center, 15, 0.04, 88)} pathOptions={{ color: "#ff007f", weight: 2, opacity: 0.8, fillOpacity: 0.1, dashArray: "5,5" }}>
              <Popup>Unidades Económicas INEGI (DENUE) simuladas</Popup>
            </Polygon>
          )}

          {layers.ine && (
            <Polygon positions={getInterlockingPolygon(center, 16, 0.06, 42)} pathOptions={{ color: "#8b5cf6", weight: 2, opacity: 0.8, fillOpacity: 0.1 }}>
              <Popup>Secciones Electorales (INE) simuladas</Popup>
            </Polygon>
          )}

          {layers.grid && (
            <Polygon positions={getInterlockingPolygon(center, 18, 0.09, 21)} pathOptions={{ color: "#00e5ff", weight: 1, opacity: 0.65, fillOpacity: 0.04 }}>
              <Popup>Zona municipal de simulación: {selectedCity.name}</Popup>
            </Polygon>
          )}
          {layers.cps && cpPolygons.map(poly => (
            <Polygon key={poly.id} positions={poly.coords} pathOptions={{ color: "#facc15", weight: 1, opacity: 0.85, fillOpacity: 0.08 }}>
              <Popup>CP operativo {poly.cp}</Popup>
            </Polygon>
          ))}
          
          {layers.agents && agentsRef.current.slice(0, 120).map(a => (
            <CircleMarker key={`${a.id}-${a.lat.toFixed(5)}`} center={[a.lat, a.lng]} radius={4} pathOptions={{ color: a.type === "joven" ? "#22d3ee" : a.type === "comerciante" ? "#facc15" : "#34d399", fillOpacity: 0.75, weight: 1 }}>
              <Popup>
                <div style={{ color: "#fff", fontFamily: "sans-serif", fontSize: 12 }}>
                  <b style={{ textTransform: "capitalize" }}>{a.type}</b>
                  <br />
                  Felicidad: {a.happiness.toFixed(1)}%
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {layers.infra && infrastructure.map(i => (
            <Marker key={i.id} position={[i.lat, i.lng]}>
              <Popup>
                <div style={{ color: "#fff", fontFamily: "sans-serif", fontSize: 12 }}>
                  <b>{i.type === "well" ? "Pozo Hídrico" : i.type === "bridge" ? "Cruce Urbano" : "Bloqueo Policial"}</b>
                  <br />
                  Infraestructura táctica activa.
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div style={{ position: "absolute", top: 10, right: 10, zIndex: 500, display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {Object.entries({ satellite: "Sat", cps: "CP", grid: "Municipio", agents: "Agentes", infra: "Infra" }).map(([key, label]) => (
            <button key={key} onClick={() => setLayers(prev => ({ ...prev, [key]: !prev[key] }))} style={{ background: layers[key] ? "rgba(0,229,255,0.9)" : "rgba(15,23,42,0.9)", border: "1px solid rgba(255,255,255,0.18)", color: layers[key] ? "#020617" : "#cbd5e1", borderRadius: 4, padding: "5px 8px", fontSize: 11, cursor: "pointer", fontWeight: 800 }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {Object.entries(policies).map(([key, val]) => (
          <label key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase" }}>{key} ({val}%)</span>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={val} 
              onChange={e => setPolicies(p => ({...p, [key]: +e.target.value}))} 
              className="control-slider" 
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export default WorldBoxSimulator;
