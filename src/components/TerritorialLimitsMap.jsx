import React, { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, GeoJSON, useMap } from "react-leaflet";
import { Layers, Map as MapIcon, Info, Users, BarChart2 } from "lucide-react";
import electoralScenarios from "../data/electoral_scenarios.json";
import catalogMunicipios from "../data/municipios_catalogo.json";
import { MEXICO_STATES, getInterlockingPolygon } from "../models/dataModel";

// Detalle de colores de los partidos reales de México
const PARTY_COLORS = {
  MORENA: "#8b2635",
  PAN: "#1d4ed8",
  PRI: "#15803d",
  MC: "#ea580c",
  PVEM: "#16a34a",
  PT: "#dc2626",
  PRD: "#eab308",
  IND: "#4b5563"
};

// Sesgos estatales históricos para cálculo consistente
const REGIONAL_BIASES = {
  "aguascalientes": { PAN: 16, MORENA: -12, PRI: 2 },
  "baja california": { MORENA: 8, PAN: -2, PRI: -3, MC: 2 },
  "baja california sur": { MORENA: 10, PAN: -5, PRI: -3 },
  "campeche": { MORENA: 12, PAN: -8, PRI: -4, MC: 8 },
  "chiapas": { MORENA: 22, PVEM: 12, PAN: -14, PRI: -8 },
  "chihuahua": { PAN: 18, MORENA: -10, PRI: 4 },
  "ciudad de méxico": { MORENA: 10, PAN: 6, PRI: -6, MC: 2, PRD: 3 },
  "coahuila": { PRI: 22, PAN: 4, MORENA: -12 },
  "colima": { MORENA: 8, PAN: -2, PRI: 2 },
  "durango": { PRI: 16, PAN: 4, MORENA: -8 },
  "estado de méxico": { MORENA: 8, PRI: 6, PAN: 2 },
  "guanajuato": { PAN: 26, MORENA: -20, PRI: -2, MC: -2 },
  "guerrero": { MORENA: 22, PRI: -6, PAN: -14, PRD: 5 },
  "hidalgo": { MORENA: 14, PRI: 8, PAN: -6 },
  "jalisco": { MC: 26, MORENA: 6, PAN: -12, PRI: -8 },
  "michoacán": { MORENA: 8, PRD: 8, PRI: 2, PAN: -2 },
  "morelos": { MORENA: 10, PAN: -2, PRI: -2 },
  "nayarit": { MORENA: 8, PAN: -4, PRI: -4 },
  "nuevo león": { MC: 24, PAN: 12, PRI: 4, MORENA: -16 },
  "oaxaca": { MORENA: 18, PRD: 3, PRI: -6, PAN: -10 },
  "puebla": { MORENA: 10, PAN: 2, PRI: -2 },
  "querétaro": { PAN: 24, MORENA: -14, PRI: -2 },
  "quintana roo": { MORENA: 16, PVEM: 6, PAN: -6 },
  "san luis potosí": { PVEM: 26, MORENA: 4, PAN: -8, PRI: -5 },
  "sinaloa": { MORENA: 14, PRI: 4, PAN: -4 },
  "sonora": { MORENA: 12, MC: 4, PAN: 2, PRI: -2 },
  "tabasco": { MORENA: 36, PAN: -20, PRI: -10, PVEM: 3 },
  "tamaulipas": { MORENA: 10, PAN: 4, PRI: -3 },
  "tlaxcala": { MORENA: 12, PAN: -6, PRI: -4 },
  "veracruz": { MORENA: 12, PAN: 4, PRI: 2 },
  "yucatán": { PAN: 12, MORENA: 8, PRI: -6 },
  "zacatecas": { MORENA: 12, PRI: 4, PAN: -4 }
};

// Ruido determinista estable para evitar Math.random() en renderizado
function getDeterministicNoise(string, party) {
  const str = string + party;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ((Math.abs(hash) % 40) - 20) / 10; // Rango [-2%, +2%]
}

// Resolución de coordenadas de municipio
function getMunicipalityCenter(muniName, stateName, muniCode) {
  if (!muniName) {
    // Si no hay municipio seleccionado, buscar el centro del estado
    const stateEntry = Object.values(MEXICO_STATES).find(s => 
      s.name.toLowerCase().includes(stateName.toLowerCase()) ||
      stateName.toLowerCase().includes(s.name.toLowerCase())
    );
    return stateEntry ? stateEntry.coords : [23.6345, -102.5528];
  }

  // Buscar en el catálogo estático
  const found = catalogMunicipios.find(m => 
    m.name.toLowerCase().includes(muniName.toLowerCase()) || 
    muniName.toLowerCase().includes(m.name.toLowerCase())
  );
  if (found) return [found.lat, found.lng];

  // Resolver con base en el estado
  const stateEntry = Object.values(MEXICO_STATES).find(s => 
    s.name.toLowerCase().includes(stateName.toLowerCase()) ||
    stateName.toLowerCase().includes(s.name.toLowerCase())
  );
  const baseCoords = stateEntry ? stateEntry.coords : [23.6345, -102.5528];

  // Aplicar dispersión determinista
  const str = muniCode || muniName;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((Math.abs(hash) % 100) - 50) * 0.007;
  const lngOffset = (((Math.abs(hash) >> 2) % 100) - 50) * 0.007;

  return [baseCoords[0] + latOffset, baseCoords[1] + lngOffset];
}

// Componente para recentrar el mapa suavemente
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

export default function TerritorialLimitsMap() {
  const [filters, setFilters] = useState({ state: "Sonora", municipality: "Todos" });
  const [mapCenter, setMapCenter] = useState([29.0729, -110.9559]);
  const [mapZoom, setMapZoom] = useState(12);

  // Toggles de Capas
  const [showCpLayer, setShowCpLayer] = useState(true);
  const [showSatLayer, setShowSatLayer] = useState(false);
  const [showInegiEntidades, setShowInegiEntidades] = useState(false);
  const [showInegiMunicipios, setShowInegiMunicipios] = useState(false);
  const [showIneSecciones, setShowIneSecciones] = useState(false);
  const [showIneDistLocal, setShowIneDistLocal] = useState(false);
  const [showIneDistFed, setShowIneDistFed] = useState(false);

  // Almacenamiento de archivos GeoJSON cargados bajo demanda
  const [geoData, setGeoData] = useState({
    entidades: null,
    municipios: null,
    secciones: null,
    distritoLocal: null,
    distritoFed: null
  });

  // Catálogos dinámicos
  const statesList = useMemo(() => {
    const unique = [...new Set(electoralScenarios.map(d => d.state))].filter(Boolean);
    return unique.map(s => ({ id: s, name: s })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const municipalitiesList = useMemo(() => {
    const munis = electoralScenarios.filter(d => d.state === filters.state && d.level === "Municipio");
    return munis.map(m => {
      let displayName = m.name.replace(/^Alcaldía\s*\/\s*Municipio\s*de\s*/i, "");
      return { id: m.code, name: displayName, raw: m };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [filters.state]);

  const selectedMuniName = useMemo(() => {
    if (filters.municipality === "Todos") return "";
    const m = municipalitiesList.find(x => x.id === filters.municipality);
    return m ? m.name : "";
  }, [filters.municipality, municipalitiesList]);

  // Carga asíncrona de archivos GeoJSON locales
  useEffect(() => {
    const loadLayer = async (key, file) => {
      if (!geoData[key]) {
         try {
           const res = await fetch(`/data/geojson/${file}`);
           if (!res.ok) return;
           const data = await res.json();
           setGeoData(prev => ({ ...prev, [key]: data }));
         } catch(e) {
           console.warn(`Error cargando GeoJSON ${file}:`, e);
         }
      }
    };
    if (showInegiEntidades) loadLayer('entidades', 'ENTIDAD.geojson');
    if (showInegiMunicipios) loadLayer('municipios', 'MUNICIPIO.geojson');
    if (showIneSecciones) loadLayer('secciones', 'SECCION.geojson');
    if (showIneDistLocal) loadLayer('distritoLocal', 'DISTRITO_LOCAL.geojson');
    if (showIneDistFed) loadLayer('distritoFed', 'DISTRITO_FEDERAL.geojson');
  }, [showInegiEntidades, showInegiMunicipios, showIneSecciones, showIneDistLocal, showIneDistFed, geoData]);

  // Recalcular el centro geográfico cuando cambie el estado o el municipio
  useEffect(() => {
    const center = getMunicipalityCenter(selectedMuniName, filters.state, filters.municipality);
    setMapCenter(center);
    setMapZoom(filters.municipality === "Todos" ? 8 : 12);
  }, [filters.state, filters.municipality, selectedMuniName]);

  // Cálculo consolidado de la ficha técnica territorial y electoral
  const territorialStats = useMemo(() => {
    let weights = { comerciante: 0.3, joven: 0.3, obrero: 0.4 };
    let population = 100000;
    let locationCode = filters.state;

    if (filters.municipality === "Todos") {
      const munis = electoralScenarios.filter(d => d.state === filters.state && d.level === "Municipio");
      if (munis.length > 0) {
        population = munis.reduce((acc, m) => acc + m.population, 0);
        const count = munis.length;
        weights = {
          comerciante: munis.reduce((acc, m) => acc + (m.weights.comerciante || 0), 0) / count,
          joven: munis.reduce((acc, m) => acc + (m.weights.joven || 0), 0) / count,
          obrero: munis.reduce((acc, m) => acc + (m.weights.obrero || 0), 0) / count
        };
      }
    } else {
      const muni = electoralScenarios.find(d => d.code === filters.municipality);
      if (muni) {
        population = muni.population;
        weights = muni.weights;
        locationCode = muni.code;
      }
    }

    // Calcular preferencias electorales deterministas y realistas de partidos
    const parties = ["MORENA", "PAN", "PRI", "MC", "PVEM", "PT", "PRD", "IND"];
    const baseSupport = { MORENA: 36, PAN: 18, PRI: 10, MC: 11, PVEM: 5, PT: 4, PRD: 2, IND: 4 };
    const stateKey = filters.state.toLowerCase();
    const stateBias = REGIONAL_BIASES[stateKey] || {};

    let rawSupports = {};
    let sumSupports = 0;

    parties.forEach(p => {
      const base = baseSupport[p];
      const bias = stateBias[p] || 0;

      let demo = 0;
      if (p === "MC") demo += 15 * (weights.joven || 0.3);
      if (p === "MORENA") {
        demo += 5 * (weights.joven || 0.3);
        demo += 10 * (weights.obrero || 0.4);
      }
      if (p === "PAN") {
        demo += 12 * (weights.comerciante || 0.3);
        demo -= 5 * (weights.joven || 0.3);
      }
      if (p === "PRI") {
        demo += 5 * (weights.obrero || 0.4);
        demo += 2 * (weights.comerciante || 0.3);
      }

      const noise = getDeterministicNoise(locationCode, p);
      let val = base + bias + demo + noise;
      if (val < 0.5) val = 0.5;

      rawSupports[p] = val;
      sumSupports += val;
    });

    const voteShares = parties.map(p => ({
      party: p,
      percentage: (rawSupports[p] / sumSupports) * 100
    })).sort((a, b) => b.percentage - a.percentage);

    return {
      population,
      weights,
      voteShares
    };
  }, [filters.state, filters.municipality]);

  // Generación de Códigos Postales procedimentales alrededor del centroide
  const cpPolygons = useMemo(() => {
    const cps = [
      { id: "CP_1", name: "Sector CP Norte", offset: [0.012, -0.012] },
      { id: "CP_2", name: "Sector CP Centro", offset: [0, 0] },
      { id: "CP_3", name: "Sector CP Sur", offset: [-0.012, 0.012] }
    ];

    return cps.map((cp, idx) => {
      const cpCenter = [mapCenter[0] + cp.offset[0], mapCenter[1] + cp.offset[1]];
      const coords = getInterlockingPolygon(cpCenter, 0.012, idx, 3);
      return {
        id: `${filters.municipality}_${cp.id}`,
        name: cp.name,
        coords
      };
    });
  }, [mapCenter, filters.municipality]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", gap: "1rem" }}>
      
      {/* Header Panel */}
      <div className="glass-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--neon-cyan)", fontSize: "1.2rem", textTransform: "uppercase" }}>
            <MapIcon size={20} />
            Visor GIS de Límites Territoriales y Códigos Postales (CP)
          </h2>
          <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            Análisis multinivel de divisiones municipales, distritos electorales del INE y cartografía de INEGI a nivel nacional.
          </p>
        </div>

        {/* Controles de Selección de Territorio */}
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap" }}>
          <select 
            value={filters.state} 
            onChange={e => setFilters(f => ({...f, state: e.target.value, municipality: "Todos"}))} 
            style={{ background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid var(--border-glass)", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem" }}
          >
            {statesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          
          <select 
            value={filters.municipality} 
            onChange={e => setFilters(f => ({...f, municipality: e.target.value}))} 
            style={{ background: "rgba(0,0,0,0.5)", color: "#fff", border: "1px solid var(--border-glass)", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.8rem" }}
          >
            <option value="Todos">Todos los Municipios</option>
            {municipalitiesList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>

      {/* Grid de Mapa e Inspector */}
      <div style={{ display: "flex", gap: "1rem", flex: 1, minHeight: "550px", flexWrap: "wrap" }}>
        
        {/* Leaflet Map Canvas */}
        <div className="glass-card" style={{ flex: 1, padding: 0, overflow: "hidden", position: "relative", minWidth: "400px", minHeight: "500px" }}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: "100%", width: "100%", minHeight: "500px" }}>
            {showSatLayer ? (
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              />
            ) : (
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />
            )}
            
            <RecenterMap center={mapCenter} zoom={mapZoom} />

            {/* Capa de Códigos Postales procedimentales */}
            {showCpLayer && cpPolygons.map((cp) => (
              <Polygon
                key={cp.id}
                positions={cp.coords}
                pathOptions={{
                  color: "var(--neon-cyan)",
                  weight: 1.5,
                  fillColor: "var(--neon-cyan)",
                  fillOpacity: 0.07
                }}
              >
                <Popup>
                  <div style={{ color: "#fff", fontSize: "11px", fontFamily: "monospace" }}>
                    <strong>Capa de Códigos Postales:</strong>
                    <br />
                    {cp.name}
                    <br />
                    <span>Límite Geográfico Celular</span>
                  </div>
                </Popup>
              </Polygon>
            ))}

            {/* GeoJSON Layers (INEGI, INE) cargadas de forma diferida */}
            {showInegiEntidades && geoData.entidades && (
              <GeoJSON data={geoData.entidades} style={{ color: "#00e5ff", weight: 1.8, fillOpacity: 0.05 }} />
            )}
            {showInegiMunicipios && geoData.municipios && (
              <GeoJSON data={geoData.municipios} style={{ color: "#b388ff", weight: 1.2, fillOpacity: 0.04 }} />
            )}
            {showIneSecciones && geoData.secciones && (
              <GeoJSON data={geoData.secciones} style={{ color: "#ffea00", weight: 0.8, fillOpacity: 0.04 }} />
            )}
            {showIneDistLocal && geoData.distritoLocal && (
              <GeoJSON data={geoData.distritoLocal} style={{ color: "#00e676", weight: 1.5, fillOpacity: 0.05 }} />
            )}
            {showIneDistFed && geoData.distritoFed && (
              <GeoJSON data={geoData.distritoFed} style={{ color: "#ff1744", weight: 1.5, fillOpacity: 0.05 }} />
            )}
          </MapContainer>

          {/* Control de Capas Flotante */}
          <div style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            zIndex: 1000,
            background: "rgba(10, 15, 30, 0.85)",
            backdropFilter: "blur(12px)",
            border: "1px solid var(--border-glass)",
            padding: "0.6rem",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "0.4rem",
            boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
          }}>
            <div style={{ fontSize: "0.65rem", fontWeight: "800", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.3rem", display: "flex", alignItems: "center", gap: "0.25rem", textTransform: "uppercase" }}>
              <Layers size={11} color="var(--neon-cyan)" />
              Intercalación de Capas
            </div>
            
            <button
              onClick={() => setShowCpLayer(!showCpLayer)}
              style={{
                fontSize: "0.65rem", padding: "0.35rem 0.5rem", border: "1px solid",
                borderColor: showCpLayer ? "var(--neon-cyan)" : "rgba(255,255,255,0.05)", borderRadius: "4px",
                background: showCpLayer ? "rgba(0, 229, 255, 0.1)" : "rgba(0,0,0,0.2)",
                color: showCpLayer ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "700", textAlign: "left"
              }}
            >
              ✉️ Limites Postales (CP)
            </button>
            
            <button
              onClick={() => setShowSatLayer(!showSatLayer)}
              style={{
                fontSize: "0.65rem", padding: "0.35rem 0.5rem", border: "1px solid",
                borderColor: showSatLayer ? "#00e676" : "rgba(255,255,255,0.05)", borderRadius: "4px",
                background: showSatLayer ? "rgba(0, 230, 118, 0.1)" : "rgba(0,0,0,0.2)",
                color: showSatLayer ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "700", textAlign: "left"
              }}
            >
              Satélite Satelital
            </button>
            
            <button
              onClick={() => setShowInegiEntidades(!showInegiEntidades)}
              style={{
                fontSize: "0.65rem", padding: "0.35rem 0.5rem", border: "1px solid",
                borderColor: showInegiEntidades ? "#00e5ff" : "rgba(255,255,255,0.05)", borderRadius: "4px",
                background: showInegiEntidades ? "rgba(0, 229, 255, 0.1)" : "rgba(0,0,0,0.2)",
                color: showInegiEntidades ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "700", textAlign: "left"
              }}
            >
              📍 INEGI - Entidades {showInegiEntidades && !geoData.entidades ? "..." : ""}
            </button>
            
            <button
              onClick={() => setShowInegiMunicipios(!showInegiMunicipios)}
              style={{
                fontSize: "0.65rem", padding: "0.35rem 0.5rem", border: "1px solid",
                borderColor: showInegiMunicipios ? "#b388ff" : "rgba(255,255,255,0.05)", borderRadius: "4px",
                background: showInegiMunicipios ? "rgba(179, 136, 255, 0.1)" : "rgba(0,0,0,0.2)",
                color: showInegiMunicipios ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "700", textAlign: "left"
              }}
            >
              📍 INEGI - Municipios {showInegiMunicipios && !geoData.municipios ? "..." : ""}
            </button>
            
            <button
              onClick={() => setShowIneSecciones(!showIneSecciones)}
              style={{
                fontSize: "0.65rem", padding: "0.35rem 0.5rem", border: "1px solid",
                borderColor: showIneSecciones ? "#ffea00" : "rgba(255,255,255,0.05)", borderRadius: "4px",
                background: showIneSecciones ? "rgba(255, 234, 0, 0.1)" : "rgba(0,0,0,0.2)",
                color: showIneSecciones ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "700", textAlign: "left"
              }}
            >
              🗺️ INE - Secciones Electorales {showIneSecciones && !geoData.secciones ? "..." : ""}
            </button>
            
            <button
              onClick={() => setShowIneDistLocal(!showIneDistLocal)}
              style={{
                fontSize: "0.65rem", padding: "0.35rem 0.5rem", border: "1px solid",
                borderColor: showIneDistLocal ? "#00e676" : "rgba(255,255,255,0.05)", borderRadius: "4px",
                background: showIneDistLocal ? "rgba(0, 230, 118, 0.1)" : "rgba(0,0,0,0.2)",
                color: showIneDistLocal ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "700", textAlign: "left"
              }}
            >
              🗺️ INE - Distrito Local {showIneDistLocal && !geoData.distritoLocal ? "..." : ""}
            </button>
            
            <button
              onClick={() => setShowIneDistFed(!showIneDistFed)}
              style={{
                fontSize: "0.65rem", padding: "0.35rem 0.5rem", border: "1px solid",
                borderColor: showIneDistFed ? "#ff1744" : "rgba(255,255,255,0.05)", borderRadius: "4px",
                background: showIneDistFed ? "rgba(255, 23, 68, 0.1)" : "rgba(0,0,0,0.2)",
                color: showIneDistFed ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "700", textAlign: "left"
              }}
            >
              🗺️ INE - Distrito Federal {showIneDistFed && !geoData.distritoFed ? "..." : ""}
            </button>
          </div>
        </div>

        {/* Inspector Panel */}
        <div className="glass-card" style={{ width: "320px", display: "flex", flexDirection: "column", gap: "1rem", minWidth: "280px", padding: "1.2rem" }}>
          
          {/* Información del Territorio */}
          <div>
            <h3 style={{ fontSize: "0.95rem", color: "white", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem", margin: "0 0 0.8rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Info size={16} color="var(--neon-cyan)" />
              Ficha del Territorio
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.78rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Estado:</span>
                <span style={{ color: "#fff", fontWeight: "600" }}>{filters.state}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Municipio:</span>
                <span style={{ color: "#fff", fontWeight: "600" }}>
                  {filters.municipality === "Todos" ? "Todos los municipios" : selectedMuniName}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Población Total:</span>
                <span style={{ color: "var(--neon-cyan)", fontWeight: "700" }}>
                  {territorialStats.population.toLocaleString()} habs
                </span>
              </div>
            </div>
          </div>

          {/* Demografía */}
          <div>
            <h3 style={{ fontSize: "0.95rem", color: "white", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem", margin: "0 0 0.8rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Users size={16} color="var(--neon-cyan)" />
              Pesos Demográficos
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.75rem" }}>
              {/* Jóvenes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Jóvenes</span>
                  <span style={{ color: "#fff" }}>{(territorialStats.weights.joven * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
                  <div style={{ width: `${territorialStats.weights.joven * 100}%`, height: "100%", background: "#38bdf8", borderRadius: "3px" }}></div>
                </div>
              </div>

              {/* Comerciantes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Comerciantes</span>
                  <span style={{ color: "#fff" }}>{(territorialStats.weights.comerciante * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
                  <div style={{ width: `${territorialStats.weights.comerciante * 100}%`, height: "100%", background: "#f59e0b", borderRadius: "3px" }}></div>
                </div>
              </div>

              {/* Obreros */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-secondary)" }}>Obreros / Asalariados</span>
                  <span style={{ color: "#fff" }}>{(territorialStats.weights.obrero * 100).toFixed(1)}%</span>
                </div>
                <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px" }}>
                  <div style={{ width: `${territorialStats.weights.obrero * 100}%`, height: "100%", background: "#ef4444", borderRadius: "3px" }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Preferencias Electorales Estimadas */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h3 style={{ fontSize: "0.95rem", color: "white", borderBottom: "1px solid var(--border-glass)", paddingBottom: "0.5rem", margin: "0 0 0.8rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <BarChart2 size={16} color="var(--neon-cyan)" />
              Fuerza de Partidos (Estimada)
            </h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", flex: 1, maxHeight: "250px" }}>
              {territorialStats.voteShares.map((item) => (
                <div key={item.party} style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.72rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#fff", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: PARTY_COLORS[item.party] }}></span>
                      {item.party}
                    </span>
                    <span style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px" }}>
                    <div style={{ width: `${item.percentage}%`, height: "100%", background: PARTY_COLORS[item.party], borderRadius: "2px" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
