// src/components/WorldBoxSimulator.jsx
// UXDD / CDD: Simulador Macro/Micro en Mapa GIS Real interactivo.
// Comentarios y textos en español neutro premium.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, RefreshCw, Layers, Droplet, Construction, Search, MapPin, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, CircleMarker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import electoralScenarios from '../data/electoral_scenarios.json';

// Helper Component para el manejo dinámico de la cámara de Leaflet
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true, duration: 1.5 });
    }
  }, [center, zoom, map]);
  return null;
}

// Helper Component para registrar clics del usuario en el mapa y colocar infraestructura
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

// Íconos personalizados de infraestructura GIS
const customIcons = {
  well: L.divIcon({
    html: '<div style="font-size: 20px; filter: drop-shadow(0 0 6px var(--neon-blue));">💧</div>',
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }),
  closure: L.divIcon({
    html: '<div style="font-size: 20px; filter: drop-shadow(0 0 6px var(--neon-rose));">🚧</div>',
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  }),
  bridge: L.divIcon({
    html: '<div style="font-size: 20px; filter: drop-shadow(0 0 6px var(--neon-emerald));">🌉</div>',
    className: 'custom-div-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
};

export default function WorldBoxSimulator({ pythonApiUrl = 'http://localhost:5001' }) {
  // --- Estados Core ---
  const [isRunning, setIsRunning] = useState(true);
  const [viewMode, setViewMode] = useState('voto'); // 'voto' | 'aprobacion' | 'estres'
  const [activeTimeline, setActiveTimeline] = useState('realidad_base');
  
  // --- Estado de Localización GIS ---
  const [mapCenter, setMapCenter] = useState([29.0729, -110.9559]); // Hermosillo Default
  const [mapZoom, setMapZoom] = useState(13);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [selectedCityLabel, setSelectedCityLabel] = useState("Hermosillo, Sonora");

  // --- Estado de Simulación y Entidades ---
  const [agents, setAgents] = useState([]);
  const [structures, setStructures] = useState([
    { id: 1, type: 'well', lat: 29.0729, lng: -110.9559, name: 'Pozo Central' }
  ]);
  const [toolActive, setToolActive] = useState(null); // 'well' | 'closure' | 'bridge'
  const [globalMetrics, setGlobalMetrics] = useState({
    avg_happiness: 55.4, avg_water_pain: 42.1, avg_transit_pain: 35.8, vote_share: { Morena: 52.3, Oposición: 47.7 }
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
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // 1. Extraer lista universal de Municipios desde electoral_scenarios.json
  const allMunicipalities = useMemo(() => {
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
      .slice(0, 10);
  }, [searchTerm, allMunicipalities]);

  // 2. Búsqueda y Geocodificación Automática de la Ciudad
  const handleSelectCity = async (cityObj) => {
    setSearchTerm("");
    setShowSearchDropdown(false);
    setSelectedCityLabel(`${cityObj.name}, ${cityObj.stateName}`);
    addLog(`🔍 Geolocalizando: ${cityObj.name}, ${cityObj.stateName}...`);

    try {
      // Usar Nominatim (OpenStreetMap) para obtener coordenadas reales
      const query = `${cityObj.name}, ${cityObj.stateName}, Mexico`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);
        setMapZoom(13);
        addLog(`📍 Coordenadas encontradas: Lat ${lat.toFixed(4)}, Lng ${lon.toFixed(4)}`);
        
        // Reiniciar estructuras al cambiar de ciudad
        setStructures([]);
        
        // Disparar simulación para la nueva área
        fetchSimulation([], taxes, securityBudget, waterSubsidy, activeTimeline, [lat, lon]);
      } else {
        addLog(`⚠️ No se encontraron coordenadas precisas para ${cityObj.name}.`);
      }
    } catch (err) {
      console.error("Geocoding failed", err);
      addLog(`❌ Fallo en geocodificación para ${cityObj.name}.`);
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
      // Como el backend espera "hermosillo", si no pasamos ciudad conocida usa un fallback,
      // pero para fines de renderizado generaremos agentes radialmente alrededor del centro.
      const res = await fetch(`${pythonApiUrl}/api/gis-sandbox/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciudad: "dynamic_gis_city", // Pasamos modo generico
          timeline_id: currentTimeline,
          structures: updatedStructures,
          policies: { taxes: updatedTaxes, security: updatedSecurity, subsidy: updatedSubsidy }
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        setGlobalMetrics(data.results.global_metrics);
        
        // El backend devuelve agentes, PERO los vamos a reposicionar artificialmente
        // alrededor del centro actual (centerCoords) para que encajen en el mapa elegido.
        const baseLat = centerCoords[0];
        const baseLng = centerCoords[1];
        
        const rawAgents = data.results.sample_agents || [];
        const localizedAgents = rawAgents.map((agent) => {
          // Dispersión aleatoria en un radio de ~4km (0.04 grados)
          const latJitterHome = (Math.random() - 0.5) * 0.08;
          const lngJitterHome = (Math.random() - 0.5) * 0.08;
          const latJitterWork = (Math.random() - 0.5) * 0.08;
          const lngJitterWork = (Math.random() - 0.5) * 0.08;
          
          return {
            ...agent,
            home_coords: [baseLat + latJitterHome, baseLng + lngJitterHome],
            work_coords: [baseLat + latJitterWork, baseLng + lngJitterWork],
            progress: Math.random(),
            direction: Math.random() > 0.5 ? 1 : -1,
            speed: 0.002 + Math.random() * 0.004,
          };
        });
        
        setAgents(localizedAgents);
        addLog(`👥 Generados ${localizedAgents.length} agentes sintéticos en el área georreferenciada.`);
      }
    } catch (e) {
      console.error("Error fetching simulation metrics", e);
    }
  };

  // Inicialización de la simulación
  useEffect(() => {
    fetchSimulation();
    // eslint-disable-next-line
  }, []);

  // Bucle de Animación de Agentes (Ticker)
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

            // Interpolación lineal entre casa y trabajo
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
      name: type === 'well' ? 'Pozo Nuevo' : (type === 'bridge' ? 'Puente' : 'Obra Vial')
    };
    const newStructures = [...structures, newStructure];
    setStructures(newStructures);
    fetchSimulation(newStructures, taxes, securityBudget, waterSubsidy, activeTimeline, mapCenter);
    setToolActive(null);
    addLog(`🏗️ Colocada estructura: ${newStructure.name} en lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}`);
  };

  // Determinación de color del marcador según ViewMode
  const getAgentColor = (agent) => {
    if (viewMode === 'voto') {
      return agent.vote_intention === "Morena" ? '#10b981' : '#f97316';
    }
    if (viewMode === 'aprobacion') {
      const ap = agent.government_approval || 50;
      return ap > 70 ? '#10b981' : ap > 40 ? '#eab308' : '#ef4444';
    }
    if (viewMode === 'estres') {
      const st = agent.economic_stress || 50;
      return st > 65 ? '#ef4444' : st > 35 ? '#f97316' : '#10b981';
    }
    return '#38bdf8';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-[#030712] min-height-screen text-slate-100 font-sans">
      
      {/* Columna Principal - MAPA GIS */}
      <div className="flex-1 flex flex-col gap-4">
        
        {/* Cabecera del Mapa y Buscador */}
        <div className="bg-[#090d16] border border-[#1e293b]/60 rounded-2xl shadow-xl flex flex-col p-4 relative z-50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[#00e5ff] flex items-center gap-2">
                🌍 Sandbox GIS: Gemelo Digital Táctico
              </h2>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <MapPin size={12} /> {selectedCityLabel}
              </p>
            </div>
            
            {/* Buscador Universal de Municipios */}
            <div className="relative w-full md:w-80">
              <div className="flex items-center bg-[#0f172a] border border-[#1e293b] rounded-lg px-3 py-2">
                <Search size={16} className="text-slate-400" />
                <input 
                  type="text"
                  placeholder="Buscar cualquier municipio de México..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="bg-transparent border-none outline-none text-sm text-slate-200 ml-2 w-full"
                />
                {searchTerm && <X size={16} className="text-slate-500 cursor-pointer hover:text-white" onClick={() => {setSearchTerm(""); setShowSearchDropdown(false);}} />}
              </div>
              
              {/* Dropdown de Resultados */}
              {showSearchDropdown && filteredMunicipalities.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#0f172a] border border-[#1e293b] rounded-lg shadow-2xl max-h-60 overflow-y-auto z-[60]">
                  {filteredMunicipalities.map(city => (
                    <div 
                      key={city.id} 
                      onClick={() => handleSelectCity(city)}
                      className="px-4 py-3 hover:bg-[#1e293b] cursor-pointer border-b border-[#1e293b]/50 transition-colors"
                    >
                      <div className="text-sm font-bold text-[#00e5ff]">{city.name}</div>
                      <div className="text-xs text-slate-400">{city.stateName}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Controles de Capas y Play/Pause */}
            <div className="flex items-center gap-3">
              <button onClick={() => setIsRunning(!isRunning)} className={`p-2 rounded-lg transition ${isRunning ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#10b981]/20 text-[#10b981]'}`} title={isRunning ? 'Pausar Simulación' : 'Iniciar Simulación'}>
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
              </button>
              
              <div className="flex items-center bg-[#0f172a] border border-[#1e293b] rounded-lg p-0.5">
                <button onClick={() => setViewMode('voto')} className={`text-[10px] font-bold px-3 py-1.5 rounded transition ${viewMode === 'voto' ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'text-slate-400 hover:text-slate-200'}`}>Voto</button>
                <button onClick={() => setViewMode('aprobacion')} className={`text-[10px] font-bold px-3 py-1.5 rounded transition ${viewMode === 'aprobacion' ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-slate-400 hover:text-slate-200'}`}>Aprobación</button>
                <button onClick={() => setViewMode('estres')} className={`text-[10px] font-bold px-3 py-1.5 rounded transition ${viewMode === 'estres' ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'text-slate-400 hover:text-slate-200'}`}>Estrés</button>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENEDOR DEL MAPA LEAFLET */}
        <div className="flex-1 min-h-[500px] bg-[#0a0d16] border border-[#1e293b]/60 rounded-2xl overflow-hidden shadow-2xl relative z-0">
          
          {/* Herramientas Constructivas Flotantes */}
          <div className="absolute bottom-6 left-6 z-[400] flex flex-col gap-2 bg-[#0b0f19]/90 border border-[#1e293b] p-2 rounded-xl backdrop-blur-md shadow-2xl">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider text-center mb-1 border-b border-[#1e293b] pb-1">Herramientas GIS</span>
            <button 
              onClick={() => setToolActive(toolActive === 'well' ? null : 'well')}
              className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition ${toolActive === 'well' ? 'bg-[#0284c7] text-white' : 'hover:bg-[#1e293b] text-slate-300'}`}
            >
              <Droplet size={14} /> Pozo Agua
            </button>
            <button 
              onClick={() => setToolActive(toolActive === 'closure' ? null : 'closure')}
              className={`flex items-center gap-2 text-xs px-4 py-2 rounded-lg transition ${toolActive === 'closure' ? 'bg-[#ef4444] text-white' : 'hover:bg-[#1e293b] text-slate-300'}`}
            >
              <Construction size={14} /> Cierre Vial
            </button>
          </div>

          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ width: '100%', height: '100%', background: '#090d16' }}
            zoomControl={false}
          >
            {/* TileLayer Oscuro de CartoDB - Alta tecnología estética */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            <ChangeMapView center={mapCenter} zoom={mapZoom} />
            <MapClickEvents toolActive={toolActive} onPlaceStructure={handlePlaceStructure} />

            {/* Renderizado de Agentes Animados */}
            {agents.map((agent) => {
              if (!agent.current_lat || !agent.current_lng) return null;
              const color = getAgentColor(agent);
              // Tamaño de avatar basado en su peso poblacional
              const radius = Math.max(3, Math.min(8, (agent.weight || 10) / 3)); 
              
              return (
                <CircleMarker
                  key={agent.agent_id}
                  center={[agent.current_lat, agent.current_lng]}
                  radius={radius}
                  pathOptions={{
                    fillColor: color,
                    fillOpacity: 0.85,
                    color: '#ffffff', // Borde blanco
                    weight: 1.5
                  }}
                />
              );
            })}

            {/* Renderizado de Infraestructura */}
            {structures.map((s) => (
              <Marker 
                key={s.id} 
                position={[s.lat, s.lng]}
                icon={customIcons[s.type] || customIcons.well}
              />
            ))}
          </MapContainer>

          {/* Toast / Indicador de Herramienta Activa */}
          {toolActive && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[400] bg-[#00e5ff] text-black font-bold px-4 py-2 rounded-full shadow-[0_0_15px_rgba(0,229,255,0.6)] animate-pulse text-sm">
              Selecciona un punto en el mapa para colocar {toolActive === 'well' ? 'Agua' : 'Obra'}
            </div>
          )}
        </div>
      </div>

      {/* Panel Lateral: Consola y KPI's */}
      <div className="w-full lg:w-[320px] flex flex-col gap-4">
        {/* KPI Panel */}
        <div className="bg-[#090d16] border border-[#1e293b]/60 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
          <h3 className="font-bold text-[#00e5ff] border-b border-[#1e293b]/50 pb-2 flex items-center gap-2">
            <Layers size={16} /> Estado del Ecosistema
          </h3>
          
          <div className="flex flex-col gap-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Intención Voto (Morena)</span>
                <span className="font-bold text-white">{globalMetrics.vote_share.Morena}%</span>
              </div>
              <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#059669] to-[#10b981]" style={{ width: `${globalMetrics.vote_share.Morena}%` }} />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Estrés Hídrico Promedio</span>
                <span className="font-bold text-white">{globalMetrics.avg_water_pain.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#d97706] to-[#fbbf24]" style={{ width: `${globalMetrics.avg_water_pain}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Consola de Registros */}
        <div className="bg-[#090d16] border border-[#1e293b]/60 p-0 rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden min-h-[250px]">
          <div className="p-3 bg-[#0f172a] border-b border-[#1e293b] font-mono text-xs text-[#00e5ff] tracking-widest font-bold">
            &gt; SYSTEM_LOGS
          </div>
          <div className="p-4 overflow-y-auto flex-1 font-mono text-[11px] leading-relaxed flex flex-col gap-2">
            {logs.map((l, idx) => (
              <div key={idx} className="text-slate-300 opacity-90 border-l-2 border-[#1e293b] pl-2">
                <span className="text-[#38bdf8] mr-2">➜</span>{l}
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
}
