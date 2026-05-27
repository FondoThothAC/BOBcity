import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { searchMunicipalities } from "../utils/catalogUtils";
import { eventBus } from "../events/EventBus";

// Hook personalizado para mover a los agentes de forma fluida y actualizar React de manera controlada (throttled)
function useAgentLoop(agentsRef, speed = 1) {
  const [tick, setTick] = useState(0);
  const rafRef = useRef();
  const lastUpdateRef = useRef(0);

  const frame = useCallback((timestamp) => {
    const agents = agentsRef.current;
    agents.forEach(a => {
      // Movimiento errático browniano para simular flujo de personas en la ciudad
      a.lat += (Math.random() - 0.5) * speed * 0.0003;
      a.lng += (Math.random() - 0.5) * speed * 0.0003;
      a.happiness = Math.max(0, Math.min(100, a.happiness + (Math.random() - 0.5) * 0.4));
    });

    // Actualizamos el estado de React máximo una vez cada 100ms para evitar lag en Leaflet
    if (timestamp - lastUpdateRef.current >= 100) {
      setTick(t => t + 1);
      lastUpdateRef.current = timestamp;
    }
    rafRef.current = requestAnimationFrame(frame);
  }, [speed, agentsRef]);

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
  const [policies, setPolicies] = useState({ agua: 70, seguridad: 50, impuesto: 20, subsidio: 40 });
  const [infrastructure, setInfrastructure] = useState([]);
  const [mode, setMode] = useState("pan"); // pan | well | bridge | closure

  // Catálogo local offline
  const municipalities = useMemo(() => catalog || [], [catalog]);
  
  // Referencia mutable de agentes locales inicializada alrededor del centroide
  const agentsRef = useRef(Array.from({ length: 150 }, (_, i) => ({
    id: `ag-${i}`, 
    lat: initialCenter[0] + (Math.random() - 0.5) * 0.04,
    lng: initialCenter[1] + (Math.random() - 0.5) * 0.04, 
    happiness: 60 + Math.random() * 20, 
    type: ["asalariado", "comerciante", "joven"][i % 3]
  })));

  // Hook para actualizar la posición en bucle
  useAgentLoop(agentsRef, 1.5);

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

  return (
    <div className="glass-panel" style={{ height: "85vh", display: "flex", flexDirection: "column", padding: 15 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "center" }}>
        <input 
          type="text" 
          placeholder="Buscar municipio (ej: Hermosillo, Cajeme, Tijuana)..."
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
              title={m === "pan" ? "Navegar" : m === "well" ? "Colocar Pozo de Agua" : m === "bridge" ? "Colocar Cruce de Conexión" : "Colocar Bloqueo de Tráfico"}
            >
              {m === "pan" ? "🗺️" : m === "well" ? "💧" : m === "bridge" ? "🌉" : "🚧"}
            </button>
          ))}
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.1rem", color: avgHappiness > 70 ? "var(--accent-emerald)" : avgHappiness > 40 ? "var(--alert-amber)" : "var(--alert-coral)" }}>
          Bienestar: {avgHappiness.toFixed(1)}%
        </div>
      </div>

      <div style={{ flex: 1, position: "relative", borderRadius: 8, overflow: "hidden" }}>
        <MapContainer center={center} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <RecenterMap center={center} zoom={zoom} />
          <MapEventsHelper onClick={handleMapClick} />
          
          {agentsRef.current.slice(0, 75).map(a => (
            <Marker key={a.id} position={[a.lat, a.lng]}>
              <Popup>
                <div style={{ color: "#fff", fontFamily: "sans-serif", fontSize: 12 }}>
                  <b style={{ textTransform: "capitalize" }}>{a.type}</b>
                  <br />
                  Felicidad: {a.happiness.toFixed(1)}%
                </div>
              </Popup>
            </Marker>
          ))}
          {infrastructure.map(i => (
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
