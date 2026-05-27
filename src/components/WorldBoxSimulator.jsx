import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { searchMunicipalities } from "../utils/catalogUtils";
import { eventBus } from "../events/EventBus";

// Hook para loop de animación sin re-renders costosos
function useAgentLoop(agentsRef, speed = 1) {
  const rafRef = useRef();
  const frame = useCallback(() => {
    const agents = agentsRef.current;
    agents.forEach(a => {
      a.lat += (Math.random() - 0.5) * speed * 0.001;
      a.lng += (Math.random() - 0.5) * speed * 0.001;
      a.happiness = Math.max(0, Math.min(100, a.happiness + (Math.random() - 0.5) * 0.2));
    });
    rafRef.current = requestAnimationFrame(frame);
  }, [speed]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [frame]);
}

export function WorldBoxSimulator({ catalog, initialCenter = [29.073, -110.956] }) {
  const [center, setCenter] = useState(initialCenter);
  const [zoom, setZoom] = useState(12);
  const [policies, setPolicies] = useState({ water: 70, security: 50, tax: 20, subsidy: 40 });
  const [infrastructure, setInfrastructure] = useState([]);
  const [mode, setMode] = useState("pan"); // pan | well | bridge | closure
  const mapRef = useRef(null);

  // Catálogo offline-first + coords locales
  const municipalities = useMemo(() => catalog || [], [catalog]);
  
  // Referencia mutable para 60fps sin setState
  const agentsRef = useRef(Array.from({ length: 150 }, (_, i) => ({
    id: `ag-${i}`, lat: center[0] + (Math.random() - 0.5) * 0.05,
    lng: center[1] + (Math.random() - 0.5) * 0.05, happiness: 60 + Math.random() * 20, type: ["asalariado", "comerciante", "joven"][i % 3]
  })));
  useAgentLoop(agentsRef, 2);

  // Impacto de políticas (cálculo ligero para UI)
  const avgHappiness = useMemo(() => {
    const base = 60 + (policies.water * 0.15) + (policies.security * 0.1) - (policies.tax * 0.2) + (policies.subsidy * 0.05);
    return Math.min(100, Math.max(0, base + (infrastructure.length * 2.5)));
  }, [policies, infrastructure]);

  useEffect(() => {
    eventBus.publish({
      sender: 'worldbox', eventType: 'AGENT_PROGRESS',
      payload: { progress: 0.75, message: `Simulación ABM actualizada. Felicidad global: ${avgHappiness.toFixed(1)}%` }
    });
  }, [avgHappiness]);

  const handleMapClick = useCallback((e) => {
    if (mode === "pan") return;
    const { lat, lng } = e.latlng;
    setInfrastructure(prev => [...prev, { id: Date.now(), type: mode, lat, lng }]);
    eventBus.publish({
      sender: 'worldbox',
      eventType: 'AGENT_COMPLETED',
      payload: { message: `Infraestructura ${mode} colocada en [${lat.toFixed(4)}, ${lng.toFixed(4)}]` }
    });
    setMode("pan");
  }, [mode]);

  return (
    <div className="glass-panel" style={{ height: "85vh", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
        <input type="text" placeholder="Buscar municipio (ej: Cajeme, Hermosillo, Juárez)..."
          style={{ flex: 1, background: "rgba(0,0,0,0.3)", border: "1px solid var(--border-subtle)", padding: 8, borderRadius: 6, color: "#fff" }}
          onChange={e => {
            const res = searchMunicipalities(e.target.value, municipalities, 5);
            if (res[0]?.coords) {
              setCenter(res[0].coords);
              setZoom(11);
            }
          }}
        />
        <div style={{ display: "flex", gap: 6 }}>
          {["pan", "well", "bridge", "closure"].map(m => (
            <button key={m} onClick={() => setMode(m)} style={{ background: mode === m ? "var(--accent-cyan)" : "#334155", border: "none", padding: "6px 10px", borderRadius: 4, cursor: "pointer", color: "#fff" }}>
              {m === "pan" ? "🗺️" : m === "well" ? "💧" : m === "bridge" ? "🌉" : "🚧"}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: avgHappiness > 70 ? "var(--accent-emerald)" : avgHappiness > 40 ? "var(--alert-amber)" : "var(--alert-coral)" }}>
          Bienestar: {avgHappiness.toFixed(1)}%
        </div>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }} onClick={handleMapClick}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {agentsRef.current.slice(0, 50).map(a => (
            <Marker key={a.id} position={[a.lat, a.lng]}>
              <Popup><b>{a.type}</b> | Felicidad: {a.happiness.toFixed(1)}</Popup>
            </Marker>
          ))}
          {infrastructure.map(i => (
            <Marker key={i.id} position={[i.lat, i.lng]}>
              <Popup>{i.type.toUpperCase()} - Infraestructura táctica</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {Object.entries(policies).map(([key, val]) => (
          <label key={key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{key.toUpperCase()} ({val}%)</span>
            <input type="range" min="0" max="100" value={val} onChange={e => setPolicies(p => ({...p, [key]: +e.target.value}))} className="control-slider" />
          </label>
        ))}
      </div>
    </div>
  );
}
