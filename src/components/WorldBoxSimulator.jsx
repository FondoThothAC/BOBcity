// src/components/WorldBoxSimulator.jsx
// UXDD / CDD: Simulador Macro/Micro en Mapa GIS Real interactivo.
// Comentarios y textos en español neutro premium.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, RefreshCw, Layers, Droplet, Construction, Search, MapPin, X, Activity } from 'lucide-react';
import { MapContainer, TileLayer, Marker, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import electoralScenarios from '../data/electoral_scenarios.json';

// Helper Component para el centrado de cámara
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true, duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

// Helper Component para registro de clics de infraestructura
function MapClickEvents({ toolActive, onPlaceStructure }) {
  useMapEvents({
    click(e) {
      if (toolActive) {
        onPlaceStructure(toolActive, e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Íconos de infraestructura con brillos de color (Thoth style)
const customIcons = {
  well: L.divIcon({
    html: '<div style="font-size: 22px; filter: drop-shadow(0 0 8px var(--neon-blue)); cursor: pointer;">💧</div>',
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }),
  closure: L.divIcon({
    html: '<div style="font-size: 22px; filter: drop-shadow(0 0 8px var(--neon-rose)); cursor: pointer;">🚧</div>',
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  }),
  bridge: L.divIcon({
    html: '<div style="font-size: 22px; filter: drop-shadow(0 0 8px var(--neon-emerald)); cursor: pointer;">🌉</div>',
    className: 'custom-div-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  })
};

export default function WorldBoxSimulator({ pythonApiUrl = 'http://localhost:5001' }) {
  // --- Estados Core ---
  const [isRunning, setIsRunning] = useState(true);
  const [viewMode, setViewMode] = useState('voto'); // 'voto' | 'aprobacion' | 'estres'
  const [activeTimeline, setActiveTimeline] = useState('realidad_base');
  
  // --- Estado de Localización GIS ---
  const [mapCenter, setMapCenter] = useState([29.0729, -110.9559]); // Hermosillo
  const [mapZoom, setMapZoom] = useState(13);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCityLabel, setSelectedCityLabel] = useState("Hermosillo, Sonora");

  // --- Estado de Simulación y Entidades ---
  const [agents, setAgents] = useState([]);
  const [structures, setStructures] = useState([
    { id: 1, type: 'well', lat: 29.0729, lng: -110.9559, name: 'Pozo Central' }
  ]);
  const [toolActive, setToolActive] = useState(null); // 'well' | 'closure'
  const [globalMetrics, setGlobalMetrics] = useState({
    avg_happiness: 58.6, avg_water_pain: 39.2, avg_transit_pain: 34.1, vote_share: { Morena: 51.4, Oposición: 48.6 }
  });
  
  // --- Políticas (Sliders) ---
  const [taxes, setTaxes] = useState(12);
  const [securityBudget, setSecurityBudget] = useState(60);
  const [waterSubsidy, setWaterSubsidy] = useState(30);

  // --- Consola de Registros ---
  const [logs, setLogs] = useState([
    '🌍 Motor de Georreferenciación GIS Activado.',
    '🤖 Simulador Sandbox migrado a Leaflet 2D.',
    '🏠 Sistema listo para generar agentes micro-sociales.',
  ]);

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 30)]);
  };

  // 1. Cargar municipios de electoral_scenarios.json
  const allMunicipalities = useMemo(() => {
    if (!electoralScenarios) return [];
    return electoralScenarios
      .filter(item => item.level === "Municipio")
      .map(item => ({
        id: item.code,
        name: item.name.replace("Alcaldía / Municipio de ", ""),
        stateName: item.state,
        searchKey: `${item.name} ${item.state}`.toLowerCase()
      }));
  }, []);

  const filteredMunicipalities = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return allMunicipalities
      .filter(m => m.searchKey.includes(term))
      .slice(0, 8);
  }, [searchTerm, allMunicipalities]);

  // 2. Geocodificación Automática Nominatim
  const handleSelectCity = async (cityObj) => {
    setSearchTerm("");
    setShowSearchDropdown(false);
    setSelectedCityLabel(`${cityObj.name}, ${cityObj.stateName}`);
    addLog(`🔍 Buscando coordenadas para ${cityObj.name}, ${cityObj.stateName}...`);

    try {
      const query = `${cityObj.name}, ${cityObj.stateName}, Mexico`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        setMapZoom(13);
        addLog(`📍 Geolocalizado en Lat ${lat.toFixed(4)}, Lng ${lon.toFixed(4)}`);
        
        // Resetear estructuras al viajar de ciudad
        setStructures([]);
        
        // Disparar recálculo
        fetchSimulation([], taxes, securityBudget, waterSubsidy, activeTimeline, [lat, lon]);
      } else {
        addLog(`⚠️ Coordenadas no encontradas para ${cityObj.name}.`);
      }
    } catch (err) {
      console.error(err);
      addLog(`❌ Error en geocodificador Nominatim.`);
    }
  };

  // 3. Obtener Simulación desde Backend Python
  const fetchSimulation = async (
    updatedStructures = structures, 
    updatedTaxes = taxes, 
    updatedSecurity = securityBudget, 
    updatedSubsidy = waterSubsidy, 
    currentTimeline = activeTimeline,
    centerCoords = mapCenter
  ) => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/gis-sandbox/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciudad: "dynamic_gis_city",
          timeline_id: currentTimeline,
          structures: updatedStructures,
          policies: { taxes: updatedTaxes, security: updatedSecurity, subsidy: updatedSubsidy }
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setGlobalMetrics(data.results.global_metrics);
        
        const baseLat = centerCoords[0];
        const baseLng = centerCoords[1];
        const rawAgents = data.results.sample_agents || [];
        
        // Asignar coordenadas dinámicas en base al centro geográfico de la búsqueda
        const localizedAgents = rawAgents.map((agent) => {
          const latJitterHome = (Math.random() - 0.5) * 0.04;
          const lngJitterHome = (Math.random() - 0.5) * 0.04;
          const latJitterWork = (Math.random() - 0.5) * 0.04;
          const lngJitterWork = (Math.random() - 0.5) * 0.04;
          
          return {
            ...agent,
            home_coords: [baseLat + latJitterHome, baseLng + lngJitterHome],
            work_coords: [baseLat + latJitterWork, baseLng + lngJitterWork],
            progress: Math.random(),
            direction: Math.random() > 0.5 ? 1 : -1,
            speed: 0.001 + Math.random() * 0.002,
          };
        });
        
        setAgents(localizedAgents);
        addLog(`👥 Generados ${localizedAgents.length} agentes en la nueva región GIS.`);
      }
    } catch (e) {
      console.warn("Fallo al conectar con el backend, usando generación local de respaldo", e);
      // Fallback local robusto
      const baseLat = centerCoords[0];
      const baseLng = centerCoords[1];
      const fallbackAgents = Array.from({ length: 80 }).map((_, idx) => {
        const latJitterHome = (Math.random() - 0.5) * 0.03;
        const lngJitterHome = (Math.random() - 0.5) * 0.03;
        const latJitterWork = (Math.random() - 0.5) * 0.03;
        const lngJitterWork = (Math.random() - 0.5) * 0.03;
        return {
          agent_id: idx,
          weight: 5 + Math.random() * 15,
          vote_intention: Math.random() > 0.52 ? "Morena" : "Oposición",
          government_approval: 30 + Math.random() * 60,
          economic_stress: 20 + Math.random() * 60,
          home_coords: [baseLat + latJitterHome, baseLng + lngJitterHome],
          work_coords: [baseLat + latJitterWork, baseLng + lngJitterWork],
          progress: Math.random(),
          direction: Math.random() > 0.5 ? 1 : -1,
          speed: 0.001 + Math.random() * 0.002,
        };
      });
      setAgents(fallbackAgents);
      addLog(`👥 Generados ${fallbackAgents.length} agentes locales (Modo Desconectado).`);
    }
  };

  // Inicializar simulación
  useEffect(() => {
    fetchSimulation();
    // eslint-disable-next-line
  }, []);

  // Bucle de Animación de Agentes
  useEffect(() => {
    let animationFrameId;
    let lastTime = performance.now();

    const renderLoop = (time) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      if (isRunning && agents.length > 0) {
        setAgents((prevAgents) => 
          prevAgents.map(agent => {
            let nextProgress = agent.progress + (agent.speed * agent.direction * (deltaTime / 16));
            let nextDirection = agent.direction;
            
            if (nextProgress >= 1.0) {
              nextProgress = 1.0;
              nextDirection = -1;
            } else if (nextProgress <= 0.0) {
              nextProgress = 0.0;
              nextDirection = 1;
            }

            const lat = agent.home_coords[0] + (agent.work_coords[0] - agent.home_coords[0]) * nextProgress;
            const lng = agent.home_coords[1] + (agent.work_coords[1] - agent.home_coords[1]) * nextProgress;
            
            return { ...agent, progress: nextProgress, direction: nextDirection, current_lat: lat, current_lng: lng };
          })
        );
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRunning, agents.length]);

  const handlePlaceStructure = (type, lat, lng) => {
    const newStructure = {
      id: Date.now(), type, lat, lng, 
      name: type === 'well' ? 'Pozo Nuevo' : 'Obra Vial'
    };
    const newStructures = [...structures, newStructure];
    setStructures(newStructures);
    fetchSimulation(newStructures, taxes, securityBudget, waterSubsidy, activeTimeline, mapCenter);
    setToolActive(null);
    addLog(`🏗️ Colocado ${newStructure.name} en Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`);
  };

  // Colores de los agentes según el modo visual seleccionado
  const getAgentColor = (agent) => {
    if (viewMode === 'voto') {
      return agent.vote_intention === "Morena" ? 'var(--neon-emerald)' : 'var(--neon-blue)';
    }
    if (viewMode === 'aprobacion') {
      const ap = agent.government_approval || 50;
      return ap > 70 ? 'var(--neon-emerald)' : ap > 45 ? 'var(--neon-amber)' : 'var(--neon-rose)';
    }
    if (viewMode === 'estres') {
      const st = agent.economic_stress || 50;
      return st > 60 ? 'var(--neon-rose)' : st > 35 ? 'var(--neon-amber)' : 'var(--neon-emerald)';
    }
    return 'var(--neon-blue)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', fontFamily: "'Space Grotesk', sans-serif" }}>
      
      {/* Contenedor del Título y Panel Superior de Búsqueda */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '0.05em' }}>
              <Layers size={20} color="var(--thoth-oro)" />
              SANDBOX GIS: GEMELO DIGITAL TAC-MAP
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <MapPin size={12} color="var(--neon-blue)" />
              <span>Municipio Activo:</span>
              <strong style={{ color: 'white' }}>{selectedCityLabel}</strong>
            </div>
          </div>

          {/* Autocompletado del Municipio */}
          <div style={{ position: 'relative', width: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(5, 6, 15, 0.95)', border: '1px solid var(--border-glass)', borderRadius: '4px', padding: '0.4rem 0.6rem' }}>
              <Search size={14} color="var(--text-secondary)" />
              <input 
                type="text"
                placeholder="Buscar municipio en México..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchDropdown(true);
                }}
                onFocus={() => setShowSearchDropdown(true)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.75rem', marginLeft: '0.5rem', width: '100%' }}
              />
              {searchTerm && (
                <X size={14} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={() => {setSearchTerm(""); setShowSearchDropdown(false);}} />
              )}
            </div>

            {/* Lista Desplegable de Resultados */}
            {showSearchDropdown && filteredMunicipalities.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'rgba(8, 10, 22, 0.98)', border: '1px solid var(--border-glass)', borderRadius: '4px', overflow: 'hidden', zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
                {filteredMunicipalities.map(city => (
                  <div 
                    key={city.id} 
                    onClick={() => handleSelectCity(city)}
                    style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--neon-blue)' }}>{city.name}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{city.stateName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controles de Simulación */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={() => setIsRunning(!isRunning)}
              style={{ background: isRunning ? 'rgba(255, 71, 87, 0.15)' : 'rgba(0, 245, 160, 0.15)', border: `1px solid ${isRunning ? 'var(--thoth-rojo)' : 'var(--thoth-jade)'}`, color: isRunning ? 'var(--thoth-rojo)' : 'var(--thoth-jade)', padding: '0.4rem 0.8rem', borderRadius: '3px', fontSize: '0.7rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              {isRunning ? <Pause size={12} /> : <Play size={12} />}
              {isRunning ? 'PAUSAR' : 'REANUDAR'}
            </button>

            <div className="tab-buttons" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', padding: '2px', borderRadius: '4px' }}>
              <button 
                onClick={() => setViewMode('voto')}
                style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '3px', cursor: 'pointer', background: viewMode === 'voto' ? 'var(--neon-blue)' : 'transparent', color: viewMode === 'voto' ? 'black' : 'white', fontWeight: '800' }}
              >
                Voto
              </button>
              <button 
                onClick={() => setViewMode('aprobacion')}
                style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '3px', cursor: 'pointer', background: viewMode === 'aprobacion' ? 'var(--neon-emerald)' : 'transparent', color: viewMode === 'aprobacion' ? 'black' : 'white', fontWeight: '800' }}
              >
                Aprobación
              </button>
              <button 
                onClick={() => setViewMode('estres')}
                style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', border: 'none', borderRadius: '3px', cursor: 'pointer', background: viewMode === 'estres' ? 'var(--neon-rose)' : 'transparent', color: viewMode === 'estres' ? 'black' : 'white', fontWeight: '800' }}
              >
                Estrés
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Grid del Mapa y Panel de Métricas */}
      <div className="workspace-grid-2" style={{ marginTop: '0.2rem' }}>
        
        {/* Contenedor del Mapa Leaflet */}
        <div style={{ position: 'relative', border: '1px solid var(--border-glass)', borderRadius: '6px', overflow: 'hidden' }}>
          
          {/* Flotante de Herramientas */}
          <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', zIndex: 1000, background: 'rgba(10, 12, 24, 0.9)', border: '1px solid var(--border-glass)', padding: '0.5rem', borderRadius: '4px', backdropFilter: 'blur(8px)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.55rem', fontWeight: '800', color: 'var(--text-secondary)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.2rem' }}>GIS TACTICAL TOOLS</span>
            <button 
              onClick={() => setToolActive(toolActive === 'well' ? null : 'well')}
              style={{ background: toolActive === 'well' ? 'var(--neon-blue)' : 'rgba(255,255,255,0.02)', color: toolActive === 'well' ? 'black' : 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Droplet size={11} /> Pozo Agua
            </button>
            <button 
              onClick={() => setToolActive(toolActive === 'closure' ? null : 'closure')}
              style={{ background: toolActive === 'closure' ? 'var(--neon-rose)' : 'rgba(255,255,255,0.02)', color: toolActive === 'closure' ? 'black' : 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '3px', fontSize: '0.65rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Construction size={11} /> Cierre Vial
            </button>
          </div>

          {/* Wrapper con altura explícita para Leaflet */}
          <div className="map-container" style={{ height: '520px', width: '100%', position: 'relative' }}>
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ width: '100%', height: '100%', background: '#06070f' }}
              zoomControl={true}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
              
              <ChangeMapView center={mapCenter} zoom={mapZoom} />
              <MapClickEvents toolActive={toolActive} onPlaceStructure={handlePlaceStructure} />

              {/* Agentes */}
              {agents.map((agent) => {
                if (!agent.current_lat || !agent.current_lng) return null;
                const color = getAgentColor(agent);
                const radius = Math.max(3.5, Math.min(8, (agent.weight || 10) / 2.5)); 
                
                return (
                  <CircleMarker
                    key={agent.agent_id}
                    center={[agent.current_lat, agent.current_lng]}
                    radius={radius}
                    pathOptions={{
                      fillColor: color,
                      fillOpacity: 0.85,
                      color: '#ffffff',
                      weight: 1.2
                    }}
                  />
                );
              })}

              {/* Obras */}
              {structures.map((s) => (
                <Marker 
                  key={s.id} 
                  position={[s.lat, s.lng]}
                  icon={customIcons[s.type] || customIcons.well}
                />
              ))}
            </MapContainer>
          </div>

          {/* Toast / Alerta de Clic */}
          {toolActive && (
            <div style={{ position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'var(--thoth-oro)', color: 'black', fontWeight: '800', px: '1rem', py: '0.4rem', borderRadius: '20px', fontSize: '0.7rem', boxShadow: '0 0 15px rgba(212, 175, 55, 0.6)', animation: 'pulse 1.5s infinite', padding: '0.4rem 1rem' }}>
              ⚠️ HAZ CLIC EN EL MAPA PARA COLOCAR {toolActive === 'well' ? 'EL POZO' : 'EL CIERRE VIAL'}
            </div>
          )}
        </div>

        {/* Panel Derecho - KPIs y Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Métricas del Ecosistema */}
          <div className="glass-card" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
              <Activity size={14} color="var(--thoth-oro)" />
              MÉTRICAS DEL ECOSISTEMA
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  <span>Voto Morena</span>
                  <span style={{ color: 'var(--neon-emerald)', fontWeight: '800' }}>{globalMetrics.vote_share.Morena}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--neon-emerald)', width: `${globalMetrics.vote_share.Morena}%` }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  <span>Voto Oposición</span>
                  <span style={{ color: 'var(--neon-blue)', fontWeight: '800' }}>{globalMetrics.vote_share.Oposición}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--neon-blue)', width: `${globalMetrics.vote_share.Oposición}%` }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  <span>Estrés Hídrico</span>
                  <span style={{ color: 'var(--neon-amber)', fontWeight: '800' }}>{globalMetrics.avg_water_pain.toFixed(1)}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'var(--neon-amber)', width: `${globalMetrics.avg_water_pain}%` }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
                  <span>Aprobación Promedio</span>
                  <span style={{ color: 'white', fontWeight: '800' }}>{globalMetrics.avg_happiness.toFixed(1)}%</span>
                </div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'white', width: `${globalMetrics.avg_happiness}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Consola de Logs */}
          <div className="glass-card" style={{ padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: '260px' }}>
            <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', fontFamily: 'monospace', fontSize: '0.62rem', fontWeight: '800', color: 'var(--thoth-oro)', letterSpacing: '0.05em' }}>
              &gt; TELEMETRÍA_SISTEMA
            </div>
            
            <div style={{ padding: '0.8rem', overflowY: 'auto', flex: 1, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: '#05060f' }}>
              {logs.map((log, idx) => (
                <div key={idx} style={{ color: 'var(--text-secondary)', borderLeft: '2px solid rgba(212,175,55,0.15)', paddingLeft: '0.4rem' }}>
                  <span style={{ color: 'var(--neon-blue)', marginRight: '0.35rem' }}>⚡</span>
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
