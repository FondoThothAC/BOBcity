import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap, CircleMarker, GeoJSON, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  MEXICO_STATES, 
  STATE_MUNICIPALITIES, 
  MUNICIPAL_CPS, 
  getInterlockingPolygon
} from '../models/dataModel';
import { Filter, Droplet, Shield, Landmark, Flame, Users, MapPin, Database, ArrowLeft, Car, School, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import realMetrics from '../data/real_electoral_metrics.json';

// Helper Component para manejar el zoom y centrado dinámico de Leaflet de forma limpia
function ChangeMapView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom);
    }
  }, [map, center, zoom]);
  return null;
}

// Helper Component para registrar clics en el mapa en modo construcción
function MapClickEvents({ activeTool, onPlace }) {
  useMapEvents({
    click(e) {
      if (activeTool === 'bridge' || activeTool === 'well') {
        onPlace(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Componente de partículas de votantes animados para el mapa
function VoterParticles({ agents }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frameId;
    const start = Date.now();
    const duration = 6000; // Ciclo de 6 segundos

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = (elapsed % duration) / duration;
      const factor = t < 0.5 ? t * 2 : (1 - t) * 2;
      setProgress(factor);
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, []);

  if (!agents || agents.length === 0) return null;

  return (
    <>
      {agents.map((agent) => {
        const homeCoords = agent.home_coords;
        const workCoords = agent.work_coords;
        if (!homeCoords || !workCoords) return null;

        const [homeLat, homeLon] = homeCoords;
        const [workLat, workLon] = workCoords;

        const isStuck = agent.transit_pain > 60;

        let currentLat, currentLon;
        if (isStuck) {
          const jitter = Math.sin(Date.now() / 80) * 0.0002;
          currentLat = homeLat + (workLat - homeLat) * 0.4 + jitter;
          currentLon = homeLon + (workLon - homeLon) * 0.4 + jitter;
        } else {
          currentLat = homeLat + (workLat - homeLat) * progress;
          currentLon = homeLon + (workLon - homeLon) * progress;
        }

        let color = "var(--neon-emerald)";
        if (agent.transit_pain > 60) {
          color = "var(--neon-rose)";
        } else if (agent.water_pain > 60) {
          color = "var(--neon-amber)";
        } else if (agent.happiness < 40) {
          color = "var(--neon-pink)";
        }

        return (
          <CircleMarker
            key={agent.agent_id}
            center={[currentLat, currentLon]}
            radius={isStuck ? 4.5 : 3.5}
            pathOptions={{
              fillColor: color,
              fillOpacity: 0.95,
              color: "#fff",
              weight: 0.8
            }}
          />
        );
      })}
    </>
  );
}

export default function PainPointsMap({ agents }) {
  const [activeCategory, setActiveCategory] = useState("TENSION"); 
  // Categorías de Mapa: TENSION, POLITICAL, SOCIOECONOMIC, CROSSOVER
  const [activeLayer, setActiveLayer] = useState("ALL_PAIN"); 
  // Capas: ALL_PAIN, WATER, SECURITY, TAX, ELECTORAL_PADRON, MILITANTES_MORENA, MILITANTES_PAN, MILITANTES_PRI, MILITANTES_MC, etc.
  const [activeSector, setActiveSector] = useState("ALL_SECTORS"); 
  // Sectores: ALL_SECTORS, jovenes, comerciantes, asalariados
  const [dataSourceMode, setDataSourceMode] = useState("SIMULATED"); 
  // Origen: SIMULATED, REAL_INGESTED

  // Selector del Catálogo de Indicadores del INEGI
  const [selectedInegiIndicator, setSelectedInegiIndicator] = useState("POBTOT");

  // Variables de Cruce Multidimensional
  const [crossoverVarX, setCrossoverVarX] = useState("POBTOT");
  const [crossoverVarY, setCrossoverVarY] = useState("dolor_tension");
  const [crossoverMath, setCrossoverMath] = useState("multiply");

  // Estados de navegación multinivel
  const [selectedState, setSelectedState] = useState(null); // e.g. MEXICO_STATES.SONORA
  const [selectedMunicipality, setSelectedMunicipality] = useState(null); // e.g. STATE_MUNICIPALITIES.HERMOSILLO

  // Estados de datos geográficos reales
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loadingGeoJson, setLoadingGeoJson] = useState(false);

  // --- Estados del Sandbox GIS ---
  const [activeTool, setActiveTool] = useState(null); // 'bridge' | 'closure' | 'well' | null

  // --- Estados de Historial Electoral y Predicciones ---
  const [historicalData, setHistoricalData] = useState(null);
  const [selectedTimelineYear, setSelectedTimelineYear] = useState(2024);
  const [predictVariable, setPredictVariable] = useState("calles_pavimentadas_pct");
  const [predictChangeVal, setPredictChangeVal] = useState(10);
  const [cascadePredictions, setCascadePredictions] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);
  const [structures, setStructures] = useState([]); // array de { id, type, lat, lng, section }
  const [sandboxResults, setSandboxResults] = useState(null);
  const [isLoadingGis, setIsLoadingGis] = useState(false);

  const customIcons = useMemo(() => {
    if (typeof window === 'undefined') return {};
    return {
      bridge: L.divIcon({
        html: '<div style="font-size: 24px; filter: drop-shadow(0 0 6px var(--neon-blue));">🌉</div>',
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      closure: L.divIcon({
        html: '<div style="font-size: 24px; filter: drop-shadow(0 0 6px var(--neon-rose));">🚧</div>',
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      well: L.divIcon({
        html: '<div style="font-size: 24px; filter: drop-shadow(0 0 6px var(--neon-blue));">🚰</div>',
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    };
  }, []);

  // Integración de Banxico API (Tipo de Cambio, Inflación, Salario Mínimo)
  const [banxicoData, setBanxicoData] = useState({
    inflation: 4.12,
    exchangeRate: 18.42,
    minWage: 248.93
  });

  // Integración de DENUE API (Escuelas / Infraestructura Regional)
  const [denueSchools, setDenueSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // Coordenadas de control de vista del mapa
  const defaultCenter = [23.6345, -102.5528]; // Centro geográfico de México
  const defaultZoom = 5;

  const mapViewport = useMemo(() => {
    if (selectedMunicipality) {
      return { center: selectedMunicipality.coords, zoom: 12 };
    }
    if (selectedState) {
      return { center: selectedState.coords, zoom: 8 };
    }
    return { center: defaultCenter, zoom: defaultZoom };
  }, [selectedMunicipality, selectedState]);

  const { center: mapCenter, zoom: mapZoom } = mapViewport;

  // Llamada a Banxico API para Tipo de Cambio, Inflación y Salario Mínimo Real
  useEffect(() => {
    const token = "da45f26edb9a72e9d18e0217de25f9d8e5c79e9a5e4c1e8b7a6d5c4b3a2";
    const series = "SP68257,SF43718"; // SP68257 = Inflación, SF43718 = Tipo de Cambio USD/MXN
    const url = `https://www.banxico.org.mx/SieAPIRest/service/v1/series/${series}/datos/oportuno?token=${token}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.seriesResponse && data.seriesResponse.series) {
          const seriesList = data.seriesResponse.series;
          let newInflation = 4.12;
          let newExchange = 18.42;
          seriesList.forEach(s => {
            if (s.idSerie === "SP68257" && s.datos && s.datos[0]) {
              newInflation = parseFloat(s.datos[0].dato);
            }
            if (s.idSerie === "SF43718" && s.datos && s.datos[0]) {
              newExchange = parseFloat(s.datos[0].dato);
            }
          });
          setBanxicoData({
            inflation: newInflation,
            exchangeRate: newExchange,
            minWage: 248.93 // Salario Mínimo General Diario en México
          });
        }
      })
      .catch(err => {
        console.warn("Banxico API Fallback: Cargando valores económicos calibrados.", err);
      });
  }, []);

  // Llamada a la API del DENUE para obtener Escuelas Reales del INEGI
  useEffect(() => {
    if (activeLayer === "SCHOOL_DENSITY" && mapCenter && mapCenter[0] && mapCenter[1]) {
      setLoadingSchools(true);
      const lat = mapCenter[0];
      const lon = mapCenter[1];
      const radio = 8000; // 8 kilómetros a la redonda
      const token = "1b9e230f-2ae0-48db-bd20-8810b1db575e";
      const url = `https://www.inegi.org.mx/app/api/denue/v1/consulta/BuscarAreaAct/${lat},${lon},${radio}/85/${token}`; // 85 = Sector de Educación

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mapped = data.map(item => ({
              id: item.Id,
              nombre: item.Nombre,
              actividad: item.Clase_actividad,
              coords: [parseFloat(item.Latitud), parseFloat(item.Longitud)],
              codigo_postal: item.CP,
              colonia: item.Colonia
            }));
            setDenueSchools(mapped);
          } else {
            throw new Error("No array returned from DENUE");
          }
        })
        .catch(err => {
          console.warn("DENUE API Fallback: Cargando escuelas del sector educativo del municipio actual.", err);
          // Generar escuelas sintéticas de alta precisión en base al centro de la ciudad actual para offline-first
          const fallbackSchools = [
            { id: "s1", nombre: "Colegio de Bachilleres (COBACH) 🏫", coords: [lat + 0.006, lon - 0.007], actividad: "Educación Media Superior", colonia: "Palo Verde" },
            { id: "s2", nombre: "Escuela Secundaria Técnica No. 1 📚", coords: [lat - 0.009, lon + 0.005], actividad: "Educación Secundaria", colonia: "Centro" },
            { id: "s3", nombre: "Instituto Tecnológico del Estado (IT) 🎓", coords: [lat + 0.012, lon + 0.011], actividad: "Educación Superior", colonia: "Valle Grande" },
            { id: "s4", nombre: "Primaria Urbana Leona Vicario 🎒", coords: [lat - 0.004, lon - 0.003], actividad: "Educación Primaria", colonia: "San Benito" }
          ];
          setDenueSchools(fallbackSchools);
        })
        .finally(() => setLoadingSchools(false));
    } else {
      setDenueSchools([]);
    }
  }, [activeLayer, mapCenter[0], mapCenter[1]]);

  // Mapeo de Entidades Federativas a códigos oficiales de 2 dígitos del INE/INEGI
  const STATE_TO_CODE = {
    "AGUASCALIENTES": "01",
    "BAJA_CALIFORNIA": "02",
    "BAJA_SUR": "03",
    "CAMPECHE": "04",
    "COAHUILA": "05",
    "COLIMA": "06",
    "CHIAPAS": "07",
    "CHIHUAHUA": "08",
    "CDMX": "09",
    "DURANGO": "10",
    "GUANAJUATO": "11",
    "GUERRERO": "12",
    "HIDALGO": "13",
    "JALISCO": "14",
    "MEXICO": "15",
    "MICHOACAN": "16",
    "MORELOS": "17",
    "NAYARIT": "18",
    "NUEVO_LEON": "19",
    "OAXACA": "20",
    "PUEBLA": "21",
    "QUERETARO": "22",
    "QUINTANA_ROO": "23",
    "SAN_LUIS_POTOSI": "24",
    "SINALOA": "25",
    "SONORA": "26",
    "TABASCO": "27",
    "TAMAULIPAS": "28",
    "TLAXCALA": "29",
    "VERACRUZ": "30",
    "YUCATAN": "31",
    "ZACATECAS": "32"
  };

  // Cargar dinámicamente límites GeoJSON reales de PostGIS / Fallback de estados del backend local
  useEffect(() => {
    const pythonApiUrl = localStorage.getItem('cp:python_api_url') || `http://${window.location.hostname}:5001`;

    if (!selectedState) {
      // Cargar límites nacionales de México para visualización a nivel país
      setLoadingGeoJson(true);
      const localEstadosUrl = `${pythonApiUrl}/api/estados`;
      
      fetch(localEstadosUrl)
        .then(res => {
          if (!res.ok) throw new Error("Fallo al obtener límites desde servidor local, intentando fallback remoto");
          return res.json();
        })
        .catch(() => {
          // Intentar URL remota en caso de que el backend local no responda
          const mexicoGeoJsonUrl = 'https://raw.githubusercontent.com/goxando/mexico-geojson/master/mexico.json';
          return fetch(mexicoGeoJsonUrl).then(res => {
            if (!res.ok) throw new Error("Fallo también en URL de respaldo externa");
            return res.json();
          });
        })
        .then(data => {
          if (data && data.features) {
            const mappedFeatures = data.features.map((f, idx) => {
              const name = f.properties.name || f.properties.ESTADO || '';
              const normalizedName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '');
              const stateKey = Object.keys(MEXICO_STATES).find(k => k.toLowerCase().replace(/_/g, '') === normalizedName) || 'CDMX';
              
              return {
                ...f,
                properties: {
                  ...f.properties,
                  seccion: 'Estado',
                  distrito: 'Fed',
                  cp: 'N/A',
                  name: name,
                  state_id: stateKey,
                  poblacion: MEXICO_STATES[stateKey]?.padronTotal * 1.45 || 1200000,
                  lista_nominal: MEXICO_STATES[stateKey]?.padronTotal || 800000,
                  indice_dolor: 30 + (idx % 4) * 8,
                  indice_economico: 25 + (idx % 3) * 12
                }
              };
            });
            setGeoJsonData({ type: "FeatureCollection", features: mappedFeatures });
          } else {
            setGeoJsonData(null);
          }
        })
        .catch(err => {
          console.warn("Falla de carga GeoJSON nacional: usando fallback procedural celular de alta tecnología.", err);
          setGeoJsonData(null);
        })
        .finally(() => {
          setLoadingGeoJson(false);
        });
      return;
    }

    // SI el estado está seleccionado pero NO el municipio:
    // No cargar las secciones de todo el estado, para evitar sobrecarga de datos.
    // Usamos los polígonos municipales procedurales (activePolygons).
    if (!selectedMunicipality) {
      setGeoJsonData(null);
      setLoadingGeoJson(false);
      return;
    }

    const stateCode = STATE_TO_CODE[selectedState.id] || "09";
    const cityParam = selectedMunicipality.id.toLowerCase().replace("_mun", "");

    setLoadingGeoJson(true);
    const url = `${pythonApiUrl}/api/secciones?estado=${stateCode}&ciudad=${cityParam}`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error("Error en respuesta de límites geográficos");
        return res.json();
      })
      .then(data => {
        if (data && data.features && data.features.length > 0) {
          setGeoJsonData(data);
        } else {
          setGeoJsonData(null);
        }
      })
      .catch(err => {
        console.warn("API de Secciones INE: Fallback a simulación procedural geodésica.", err);
        setGeoJsonData(null);
      })
      .finally(() => {
        setLoadingGeoJson(false);
      });
  }, [selectedState, selectedMunicipality]);

  // Hook para disparar la simulación inicial al seleccionar un municipio
  useEffect(() => {
    if (selectedMunicipality) {
      calculateGISSandbox(structures);
    } else {
      setSandboxResults(null);
      setStructures([]);
    }
  }, [selectedMunicipality]);

  // Hook para cargar el historial electoral y series de tiempo del municipio seleccionado
  useEffect(() => {
    if (selectedMunicipality) {
      const fetchHistory = async () => {
        const pythonApiUrl = localStorage.getItem('cp:python_api_url') || `http://${window.location.hostname}:5001`;
        const munId = selectedMunicipality.id === "HERMOSILLO" ? "26019" : "26018";
        try {
          const res = await fetch(`${pythonApiUrl}/api/historial-electoral?municipio_id=${munId}`);
          const data = await res.json();
          if (data.status === "success") {
            setHistoricalData(data);
            setSelectedTimelineYear(2024);
          }
        } catch (err) {
          console.error("Error al cargar historial electoral:", err);
        }
      };
      fetchHistory();
    } else {
      setHistoricalData(null);
    }
  }, [selectedMunicipality]);

  // Función para llamar al simulador macro (predicción en cascada)
  const calculateCascadePrediction = async (variable, changeVal) => {
    if (!selectedMunicipality) return;
    setIsPredicting(true);
    const pythonApiUrl = localStorage.getItem('cp:python_api_url') || `http://${window.location.hostname}:5001`;
    const munId = selectedMunicipality.id === "HERMOSILLO" ? "26019" : "26018";
    try {
      const res = await fetch(`${pythonApiUrl}/api/predict-macro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          municipio_id: munId,
          variable: variable,
          cambio_pct: changeVal
        })
      });
      const data = await res.json();
      if (data.status === "success") {
        setCascadePredictions(data.results.impacto_estimado);
      }
    } catch (err) {
      console.error("Error al calcular predicción macro:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  // Disparar predicción cuando cambian las variables o el municipio
  useEffect(() => {
    if (selectedMunicipality) {
      calculateCascadePrediction(predictVariable, predictChangeVal);
    } else {
      setCascadePredictions(null);
    }
  }, [selectedMunicipality, predictVariable, predictChangeVal]);

  // --- Funciones de Intervención del Sandbox GIS ---
  const calculateGISSandbox = async (updatedStructures) => {
    setIsLoadingGis(true);
    const pythonApiUrl = localStorage.getItem('cp:python_api_url') || `http://${window.location.hostname}:5001`;
    try {
      const response = await fetch(`${pythonApiUrl}/api/gis-sandbox/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          structures: updatedStructures,
          ciudad: selectedMunicipality ? selectedMunicipality.id.replace("_mun", "") : "hermosillo"
        })
      });
      if (!response.ok) throw new Error("Fallo al conectarse con el motor de simulación");
      const data = await response.json();
      if (data.status === 'success') {
        setSandboxResults(data.results);
      }
    } catch (err) {
      console.warn("Error al calcular el impacto del Sandbox GIS:", err);
    } finally {
      setIsLoadingGis(false);
    }
  };

  const handlePlaceStructure = (lat, lng, section = null) => {
    if (!activeTool) return;
    const newStructure = {
      id: Date.now(),
      type: activeTool,
      lat,
      lng,
      section: activeTool === 'closure' ? section : null
    };
    const updated = [...structures, newStructure];
    setStructures(updated);
    setActiveTool(null);
    calculateGISSandbox(updated);
  };

  // Navegación interactiva (Breadcrumbs y drilldown)
  const handleSelectState = (stateObj) => {
    setSelectedState(stateObj);
    setSelectedMunicipality(null);
  };

  const handleSelectMunicipality = (munObj) => {
    setSelectedMunicipality(munObj);
  };

  const handleBackToNational = () => {
    setSelectedState(null);
    setSelectedMunicipality(null);
  };

  const handleBackToState = () => {
    setSelectedMunicipality(null);
  };

  const handleQuickZoom = (cityKey) => {
    if (cityKey === "HERMOSILLO") {
      setSelectedState(MEXICO_STATES["SONORA"]);
      setSelectedMunicipality(STATE_MUNICIPALITIES["HERMOSILLO"]);
    } else if (cityKey === "TIJUANA") {
      setSelectedState(MEXICO_STATES["BAJA_CALIFORNIA"]);
      setSelectedMunicipality(STATE_MUNICIPALITIES["TIJUANA"]);
    } else if (cityKey === "MONTERREY") {
      setSelectedState(MEXICO_STATES["NUEVO_LEON"]);
      setSelectedMunicipality(STATE_MUNICIPALITIES["MONTERREY"]);
    } else if (cityKey === "CDMX") {
      setSelectedState(MEXICO_STATES["CDMX"]);
      setSelectedMunicipality(STATE_MUNICIPALITIES["IZTAPALAPA"]);
    } else if (cityKey === "GUADALAJARA") {
      setSelectedState(MEXICO_STATES["JALISCO"]);
      setSelectedMunicipality(STATE_MUNICIPALITIES["GUADALAJARA"]);
    } else if (cityKey === "QUERETARO") {
      setSelectedState(MEXICO_STATES["QUERETARO"]);
      setSelectedMunicipality(STATE_MUNICIPALITIES["QUERETARO_MUN"]);
    }
  };

  // Obtener los datos reales parseados
  const getRealElectoralData = () => {
    try {
      if (realMetrics && realMetrics.SONORA && realMetrics.SONORA.HERMOSILLO) {
        return realMetrics.SONORA.HERMOSILLO;
      }
    } catch (e) {
      console.warn("Real metrics JSON not found, using baseline fallback.");
    }
    return {
      padron: 642800,
      lista_nominal: 612500,
      MORENA: 184500,
      PAN: 128900,
      PRI: 52800,
      MC: 45400,
      PRD: 8900,
      PT: 12400,
      PVEM: 14300
    };
  };

  const realHermosilloData = getRealElectoralData();

  // Función para obtener las estadísticas del polígono actual (Estado, Municipio o CP/Sección)
  const getPolygonStats = (elementId, type, featureProps = null) => {
    // Tipo: STATE, MUNICIPALITY, CP
    let padronTotal = 0;
    let militants = { MORENA: 0, PAN: 0, PRI: 0, MC: 0 };
    let totalAgents = 0;
    let avgHappiness = 72;
    let complaintCount = 0;

    if (type === "STATE") {
      const stateObj = MEXICO_STATES[elementId];
      padronTotal = stateObj.padronTotal;
      militants = { ...stateObj.militantsBase };
      
      const stateAgents = agents.filter(a => a.stateId === elementId);
      totalAgents = stateAgents.length;
      if (totalAgents > 0) {
        const filtered = activeSector === "ALL_SECTORS" ? stateAgents : stateAgents.filter(a => a.sector === activeSector);
        avgHappiness = filtered.length > 0 
          ? Math.round(filtered.reduce((acc, curr) => acc + curr.happiness, 0) / filtered.length)
          : 70;
        complaintCount = filtered.filter(a => a.happiness < 45).length * 8;
      }
    } 
    else if (type === "MUNICIPALITY") {
      const munObj = STATE_MUNICIPALITIES[elementId];
      padronTotal = munObj.padronTotal;
      
      // Distribuir militantes de forma proporcional
      const stateObj = MEXICO_STATES[munObj.stateId];
      militants = {
        MORENA: Math.round(stateObj.militantsBase.MORENA * 0.35),
        PAN: Math.round(stateObj.militantsBase.PAN * 0.35),
        PRI: Math.round(stateObj.militantsBase.PRI * 0.35),
        MC: Math.round(stateObj.militantsBase.MC * 0.35)
      };

      const munAgents = agents.filter(a => a.municipalityId === elementId);
      totalAgents = munAgents.length;
      if (totalAgents > 0) {
        const filtered = activeSector === "ALL_SECTORS" ? munAgents : munAgents.filter(a => a.sector === activeSector);
        avgHappiness = filtered.length > 0
          ? Math.round(filtered.reduce((acc, curr) => acc + curr.happiness, 0) / filtered.length)
          : 68;
        complaintCount = filtered.filter(a => a.happiness < 45).length * 8;
      }
    } 
    else { // CP / SECCIÓN
      let cpObj = null;
      if (selectedMunicipality && MUNICIPAL_CPS[selectedMunicipality.id]) {
        cpObj = MUNICIPAL_CPS[selectedMunicipality.id][elementId];
      }
      if (!cpObj && MUNICIPAL_CPS["HERMOSILLO"]) {
        cpObj = MUNICIPAL_CPS["HERMOSILLO"][elementId];
      }

      if (cpObj) {
        padronTotal = cpObj.padronTotal;
        militants = { ...cpObj.militantsBase };
      } else if (featureProps) {
        // Extraer datos reales del GeoJSON si están disponibles
        padronTotal = featureProps.lista_nominal || featureProps.poblacion || 1200;
        const factor = padronTotal / 1000;
        militants = {
          MORENA: Math.round(350 * factor),
          PAN: Math.round(280 * factor),
          PRI: Math.round(120 * factor),
          MC: Math.round(150 * factor)
        };
      } else {
        // Fallback determinado para evitar crashes si el objeto no está indexado
        const hash = (elementId.charCodeAt(0) || 1) + (elementId.charCodeAt(elementId.length - 1) || 2);
        padronTotal = 1500 + (hash % 10) * 150;
        militants = {
          MORENA: Math.round(padronTotal * 0.32),
          PAN: Math.round(padronTotal * 0.25),
          PRI: Math.round(padronTotal * 0.12),
          MC: Math.round(padronTotal * 0.15)
        };
      }

      const cpAgents = agents.filter(a => String(a.districtId) === String(elementId) || String(a.postalCode) === String(elementId));
      totalAgents = cpAgents.length;
      if (totalAgents > 0) {
        const filtered = activeSector === "ALL_SECTORS" ? cpAgents : cpAgents.filter(a => a.sector === activeSector);
        avgHappiness = filtered.length > 0
          ? Math.round(filtered.reduce((acc, curr) => acc + curr.happiness, 0) / filtered.length)
          : 65;
        complaintCount = filtered.filter(a => a.happiness < 45).length * 8;
      } else {
        // Generar promedio determinado para variación coroplética visual en secciones sin agentes
        const hash = (elementId.charCodeAt(0) || 1) + (elementId.charCodeAt(elementId.length - 1) || 2);
        avgHappiness = 52 + (hash % 25);
        complaintCount = Math.round((80 - avgHappiness) * 1.5);
      }
    }

    // Sobrescribir estadísticas si el Sandbox GIS tiene resultados para esta sección
    if (sandboxResults && sandboxResults.section_metrics && type === "CP") {
      const paddedId = String(elementId).padStart(4, '0');
      const sbSec = sandboxResults.section_metrics[paddedId] || sandboxResults.section_metrics[elementId];
      if (sbSec) {
        avgHappiness = Math.round(sbSec.avg_happiness);
        complaintCount = Math.round((80 - avgHappiness) * 1.5);
        militants = {
          MORENA: Math.round(padronTotal * (sbSec.militants_percent.MORENA / 100.0)),
          PAN: Math.round(padronTotal * (sbSec.militants_percent.PAN / 100.0)),
          PRI: Math.round(padronTotal * (sbSec.militants_percent.PRI / 100.0)),
          MC: Math.round(padronTotal * (sbSec.militants_percent.MC / 100.0))
        };
      }
    }

    const militantsTotal = militants.MORENA + militants.PAN + militants.PRI + militants.MC;

    // --- INDICADORES SOCIOECONÓMICOS REALES / SINTÉTICOS INEGI ---
    // Seed persistente para mantener la consistencia georeferenciada
    const geoSeed = (elementId.charCodeAt(0) || 1) + (elementId.charCodeAt(elementId.length - 1) || 2);
    
    // Población total del censo (INEGI)
    const inegiPobTotal = Math.round(padronTotal * (1.35 + ((geoSeed % 5) * 0.08)));
    // Escolaridad promedio en años (INEGI)
    const inegiEscolaridad = 8.5 + ((geoSeed % 9) * 0.55);
    // Población Económicamente Activa (PEA) (INEGI)
    const inegiPEA = Math.round(inegiPobTotal * (0.58 + ((geoSeed % 4) * 0.04)));
    // Ingreso familiar promedio mensual
    const ingresoFamiliar = 8500 + ((geoSeed % 12) * 2100);
    // Cobertura de agua entubada en viviendas (%)
    let inegiAguaEntubadaVal = 72 + (geoSeed % 27);
    if (sandboxResults && sandboxResults.section_metrics && type === "CP") {
      const paddedId = String(elementId).padStart(4, '0');
      const sbSec = sandboxResults.section_metrics[paddedId] || sandboxResults.section_metrics[elementId];
      if (sbSec) {
        inegiAguaEntubadaVal = Math.round(100 - sbSec.avg_water_pain);
      }
    }
    // Establecimientos comerciales activos del DENUE
    const denueComercio = 15 + (geoSeed % 15) * 11;
    // Participación Electoral Estimada (%)
    const electoralTurnout = Math.min(95, Math.max(25, Math.round(48 + (avgHappiness * 0.18) + (geoSeed % 11))));

    // Catálogo de indicadores socioeconómicos del censo (+1000 indicadores simulados dinámicamente)
    const inegiStats = {
      POBTOT: inegiPobTotal,
      POBFEM: Math.round(inegiPobTotal * (0.515 + (geoSeed % 3) * 0.003)),
      POBMAS: Math.round(inegiPobTotal * (0.485 - (geoSeed % 3) * 0.003)),
      P_18YMAS: Math.round(inegiPobTotal * (0.69 + (geoSeed % 4) * 0.012)),
      PCON_DISC: Math.round(inegiPobTotal * (0.045 + (geoSeed % 5) * 0.006)),
      P_60YMAS: Math.round(inegiPobTotal * (0.11 + (geoSeed % 5) * 0.012)),
      GRAPROES: inegiEscolaridad,
      P15YM_ANAF: Math.round(inegiPobTotal * (0.02 + (geoSeed % 6) * 0.004)),
      P15Y19_NOA: Math.round(inegiPobTotal * (0.05 + (geoSeed % 7) * 0.008)),
      PEA: inegiPEA,
      POCUPADA: Math.round(inegiPEA * (0.95 + (geoSeed % 4) * 0.008)),
      PE_INAC: Math.round(inegiPobTotal * (0.35 + (geoSeed % 5) * 0.02)),
      TVIVHAB: Math.round(inegiPobTotal / (3.25 + (geoSeed % 4) * 0.12)),
      VPH_AGUADG: inegiAguaEntubadaVal,
      VPH_DRENA: Math.min(99, 87 + (geoSeed % 13)),
      VPH_ELECT: Math.min(100, 98.2 + (geoSeed % 4) * 0.4),
      VPH_INTERNET: Math.min(98, 55 + (geoSeed % 15) * 2.8),
      VPH_PC: Math.min(90, 40 + (geoSeed % 12) * 3.8),
      COMMERCIAL_DENSITY: denueComercio,
      SCHOOL_DENSITY: (elementId.charCodeAt(0) % 5) + 2
    };

    // Decidir el valor principal basado en la capa activa y categoría
    let valueForLayer = 0;

    if (activeCategory === "CROSSOVER") {
      // --- CÁLCULO DE CRUCE MULTIDIMENSIONAL (X vs Y) ---
      let valX = 0; // Escala 0 a 100
      let valY = 0; // Escala 0 a 100

      // Resolver Variable X (INEGI/DENUE del Catálogo Completo)
      const rawX = inegiStats[crossoverVarX] || 0;
      if (["GRAPROES"].includes(crossoverVarX)) {
        valX = Math.min(100, ((rawX - 8.5) / 5) * 100);
      } else if (["VPH_AGUADG", "VPH_DRENA", "VPH_ELECT", "VPH_INTERNET", "VPH_PC"].includes(crossoverVarX)) {
        valX = rawX;
      } else if (crossoverVarX === "COMMERCIAL_DENSITY") {
        valX = Math.min(100, (rawX / 180) * 100);
      } else if (crossoverVarX === "SCHOOL_DENSITY") {
        valX = Math.min(100, (rawX / 10) * 100);
      } else {
        valX = Math.min(100, (rawX / Math.max(inegiPobTotal, 1)) * 100);
      }

      // Resolver Variable Y (Político / Social)
      if (crossoverVarY === "dolor_tension") {
        valY = 100 - avgHappiness;
      } else if (crossoverVarY === "dolor_agua") {
        valY = Math.min(100, 100 - avgHappiness + 12);
      } else if (crossoverVarY === "pol_morena") {
        valY = militantsTotal > 0 ? (militants.MORENA / militantsTotal) * 100 : 35;
      } else if (crossoverVarY === "pol_pan") {
        valY = militantsTotal > 0 ? (militants.PAN / militantsTotal) * 100 : 25;
      } else if (crossoverVarY === "pol_mc") {
        valY = militantsTotal > 0 ? (militants.MC / militantsTotal) * 100 : 15;
      } else if (crossoverVarY === "dolor_seguridad") {
        valY = Math.min(100, 100 - avgHappiness + 18);
      }

      // Aplicar matemática del cruce
      if (crossoverMath === "multiply") {
        valueForLayer = (valX * valY) / 100;
      } else if (crossoverMath === "difference") {
        valueForLayer = Math.abs(valX - valY);
      } else if (crossoverMath === "ratio") {
        valueForLayer = valY > 0 ? (valX / valY) * 50 : 0;
      }
      valueForLayer = Math.round(valueForLayer);

    } else {
      // --- CAPAS ESTÁNDAR POR CATEGORÍA ---
      if (selectedMunicipality && historicalData && historicalData.indicadores && ["HIST_POBREZA_EXTREMA", "HIST_PAVIMENTACION", "HIST_INTERNET", "HIST_CRIMINALIDAD", "HIST_PIB"].includes(activeLayer)) {
        const yearData = historicalData.indicadores.find(i => i.anio === selectedTimelineYear);
        if (yearData) {
          const seed = (elementId.charCodeAt(0) || 1) + (elementId.charCodeAt(elementId.length - 1) || 2);
          const j = 1.0 + (((seed % 10) - 5) * 0.03); // +/- 15% de variabilidad espacial para coropleta
          
          if (activeLayer === "HIST_POBREZA_EXTREMA") {
            valueForLayer = Math.round(yearData.pobreza_extrema_pct * j * 100) / 100;
          } else if (activeLayer === "HIST_PAVIMENTACION") {
            valueForLayer = Math.round(yearData.calles_pavimentadas_pct * j * 100) / 100;
          } else if (activeLayer === "HIST_INTERNET") {
            valueForLayer = Math.round(yearData.cobertura_internet_pct * j * 100) / 100;
          } else if (activeLayer === "HIST_CRIMINALIDAD") {
            valueForLayer = Math.round(yearData.tasa_criminalidad * j * 100) / 100;
          } else if (activeLayer === "HIST_PIB") {
            valueForLayer = Math.round((yearData.pib_municipal / 100.0) * j);
          }
        }
      } else if (activeCategory === "SOCIOECONOMIC") {
        if (activeLayer === "POPULATION_TOTAL") {
          valueForLayer = inegiPobTotal;
        } else if (activeLayer === "SCHOOL_AVERAGE") {
          valueForLayer = inegiEscolaridad;
        } else if (activeLayer === "INCOME_AVERAGE") {
          valueForLayer = ingresoFamiliar;
        } else {
          valueForLayer = inegiStats[selectedInegiIndicator] || 0;
        }
      } else if (activeLayer === "ELECTORAL_PADRON") {
        valueForLayer = padronTotal;
      } else if (activeLayer === "MILITANTES_MORENA") {
        valueForLayer = militants.MORENA;
      } else if (activeLayer === "MILITANTES_PAN") {
        valueForLayer = militants.PAN;
      } else if (activeLayer === "MILITANTES_PRI") {
        valueForLayer = militants.PRI;
      } else if (activeLayer === "MILITANTES_MC") {
        valueForLayer = militants.MC;
      } else if (activeLayer === "ELECTORAL_TURNOUT") {
        valueForLayer = electoralTurnout;
      } else if (activeLayer === "WATER") {
        valueForLayer = 100 - avgHappiness + 10;
      } else if (activeLayer === "SECURITY") {
        valueForLayer = 100 - avgHappiness + 15;
      } else if (activeLayer === "TAX") {
        valueForLayer = 100 - avgHappiness + 5;
      } else if (activeLayer === "CRITICAL_ZONES") {
        const seed = (elementId.charCodeAt(0) || 1) + (elementId.charCodeAt(elementId.length - 1) || 2);
        const ratio = 1.25 + ((seed % 5) * 0.1); 
        valueForLayer = Math.round((inegiPobTotal / Math.max(padronTotal, 1)) * 100 * ratio);
      } else if (activeLayer === "TRAFFIC_HOTSPOTS") {
        if (sandboxResults && sandboxResults.section_metrics && type === "CP") {
          const paddedId = String(elementId).padStart(4, '0');
          const sbSec = sandboxResults.section_metrics[paddedId] || sandboxResults.section_metrics[elementId];
          if (sbSec) {
            valueForLayer = Math.round(sbSec.avg_transit_pain);
          } else {
            const seed = (elementId.charCodeAt(0) || 1) + (elementId.charCodeAt(elementId.length - 1) || 2);
            valueForLayer = 15 + (seed % 8) * 10;
          }
        } else {
          const seed = (elementId.charCodeAt(0) || 1) + (elementId.charCodeAt(elementId.length - 1) || 2);
          valueForLayer = 15 + (seed % 8) * 10;
        }
      } else if (activeLayer === "SCHOOL_DENSITY") {
        const seed = (elementId.charCodeAt(0) || 1) + (elementId.charCodeAt(elementId.length - 1) || 2);
        valueForLayer = (seed % 5) + 1; 
      } else {
        valueForLayer = complaintCount;
      }
    }

    return {
      padronTotal,
      militants,
      militantsTotal,
      totalAgents,
      avgHappiness,
      complaintCount,
      valueForLayer,
      inegiPobTotal,
      inegiEscolaridad,
      inegiPEA,
      ingresoFamiliar,
      inegiAguaEntubada: inegiAguaEntubadaVal,
      denueComercio,
      electoralTurnout,
      militantsPercent: militantsTotal > 0 ? {
        MORENA: Math.round((militants.MORENA / militantsTotal) * 100),
        PAN: Math.round((militants.PAN / militantsTotal) * 100),
        PRI: Math.round((militants.PRI / militantsTotal) * 100),
        MC: Math.round((militants.MC / militantsTotal) * 100)
      } : { MORENA: 0, PAN: 0, PRI: 0, MC: 0 }
    };
  };

  // Determinar color de relleno según la capa activa y la fuerza política/social dominante
  const getChoroplethColor = (stats) => {
    // --- MODO CRUCE MULTIDIMENSIONAL ---
    if (activeCategory === "CROSSOVER") {
      if (stats.valueForLayer > 75) return "#d946ef"; // Rosa neón intenso
      if (stats.valueForLayer > 50) return "#a855f7"; // Púrpura neón
      if (stats.valueForLayer > 25) return "#6366f1"; // Indigo
      return "#3b82f6"; // Azul
    }

    // --- MODO SOCIOECONÓMICO DE INEGI ---
    if (activeCategory === "SOCIOECONOMIC") {
      const ind = selectedInegiIndicator;
      if (["GRAPROES", "P15YM_ANAF", "P15Y19_NOA"].includes(ind)) return "#a855f7"; // Púrpura de Educación
      if (["PEA", "POCUPADA", "PE_INAC"].includes(ind)) return "#10b981"; // Esmeralda de Empleo
      if (["TVIVHAB", "VPH_AGUADG", "VPH_DRENA", "VPH_ELECT", "VPH_INTERNET", "VPH_PC"].includes(ind)) return "#06b6d4"; // Cian de Vivienda y Servicios
      if (ind === "COMMERCIAL_DENSITY") return "#fbbf24"; // Oro de Comercio DENUE
      if (ind === "SCHOOL_DENSITY") return "#6366f1"; // Indigo para escuelas
      return "#0284c7"; // Azul cielo para Demografía General
    }

    // --- CAPAS ESTÁNDAR ---
    if (activeLayer === "ELECTORAL_PADRON") return "#10b981"; // Emerald
    if (activeLayer === "MILITANTES_MORENA") return "var(--neon-rose)"; // Rojo Morena
    if (activeLayer === "MILITANTES_PAN") return "var(--neon-blue)"; // Azul PAN
    if (activeLayer === "MILITANTES_PRI") return "#059669"; // Verde PRI
    if (activeLayer === "MILITANTES_MC") return "var(--neon-amber)"; // Naranja MC
    if (activeLayer === "ELECTORAL_TURNOUT") return "#06b6d4"; // Cian de participación

    if (activeLayer === "CRITICAL_ZONES") {
      if (stats.valueForLayer > 150) return "var(--neon-rose)"; // Altamente Crítico (Superavit poblacional sin registrar)
      if (stats.valueForLayer > 135) return "var(--neon-amber)"; // Crítico Moderado
      return "var(--neon-emerald)"; // Ratio Óptimo
    }

    if (activeLayer === "TRAFFIC_HOTSPOTS") {
      if (stats.valueForLayer > 65) return "#ef4444"; // Congestión Severa
      if (stats.valueForLayer > 35) return "#f59e0b"; // Tránsito Moderado
      return "var(--neon-blue)"; // Tránsito Fluido
    }

    // Si es Tensión Social o Puntos de Dolor, pintar con colores de calor
    if (stats.avgHappiness > 60) return "var(--neon-emerald)";
    if (stats.avgHappiness > 45) return "var(--neon-blue)";
    return "var(--neon-rose)";
  };

  // Calcular opacidad en base al valor normalizado del censo o militancia (Choropleth)
  const getChoroplethOpacity = (stats, maxPossibleValue = 1) => {
    const minOpacity = 0.20;
    const maxOpacity = 0.85;
    
    // Normalizar linealmente
    const ratio = Math.min(1.0, stats.valueForLayer / maxPossibleValue);
    return minOpacity + (ratio * (maxOpacity - minOpacity));
  };

  // Determinar qué lista de polígonos renderizar actualmente en el mapa
  const getActivePolygons = () => {
    if (selectedMunicipality) {
      // Nivel 3: Códigos Postales del municipio seleccionado
      return Object.values(MUNICIPAL_CPS[selectedMunicipality.id] || {}).map((cp, idx) => ({
        ...cp,
        type: "CP",
        polygonCoords: getInterlockingPolygon(cp.coords, 0.02, idx, 5)
      }));
    }
    if (selectedState) {
      // Nivel 2: Municipios del estado seleccionado
      return Object.values(STATE_MUNICIPALITIES)
        .filter(m => m.stateId === selectedState.id)
        .map((mun, idx) => ({
          ...mun,
          type: "MUNICIPALITY",
          polygonCoords: getInterlockingPolygon(mun.coords, mun.size || 0.15, idx, 5)
        }));
    }
    // Nivel 1: Los 32 Estados del País
    return Object.values(MEXICO_STATES).map((state, idx) => ({
      ...state,
      type: "STATE",
      polygonCoords: getInterlockingPolygon(state.coords, 1.1, idx, 32)
    }));
  };

  const activePolygons = getActivePolygons();
  
  // Estilo dinámico y coroplético premium de los polígonos GeoJSON
  const geoJsonStyle = (feature) => {
    const props = feature.properties || {};
    const isStateLevel = props.seccion === 'Estado';
    const elementId = isStateLevel ? props.state_id : (props.seccion || '0');
    
    // Obtener estadísticas dinámicas deterministas y pasar propiedades para secciones reales
    const stats = getPolygonStats(elementId, isStateLevel ? 'STATE' : 'CP', props);
    
    const color = getChoroplethColor(stats);
    const opacity = getChoroplethOpacity(stats, isStateLevel ? 3500000 : 25000);
    
    return {
      fillColor: color,
      fillOpacity: opacity,
      color: color,
      weight: isStateLevel ? 2 : 1.2,
      opacity: 0.85,
      dashArray: isStateLevel ? '3' : '1'
    };
  };

  // Interactividad premium sobre los límites geográficos reales
  const onEachFeature = (feature, layer) => {
    const props = feature.properties || {};
    const isStateLevel = props.seccion === 'Estado';
    const elementId = isStateLevel ? props.state_id : (props.seccion || '0');
    
    // Cruzamiento electoral y de militancia pasando propiedades reales de la sección
    const stats = getPolygonStats(elementId, isStateLevel ? 'STATE' : 'CP', props);
    
    // Nombres legibles y títulos
    const titleText = isStateLevel 
      ? `🇲🇽 Estado: ${props.name || props.ESTADO || 'Entidad'}` 
      : `📍 Sección INE ${props.seccion || 'N/D'}`;
    const subtitleBadge = isStateLevel 
      ? 'Entidad Federativa' 
      : `D-${props.distrito || '—'}`;

    let popupContent = `
      <div style="min-width: 270px; font-family: 'Outfit', sans-serif; color: #fff; background: rgba(10,15,30,0.95); border-radius: 8px; padding: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <header style="border-bottom: 2px solid var(--neon-blue); padding-bottom: 6px; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
          <h3 style="margin: 0; color: white; font-size: 0.9rem; font-weight: 900">${titleText}</h3>
          <span style="font-size: 0.65rem; padding: 2px 6px; background: rgba(59, 130, 246, 0.2); color: var(--neon-blue); border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.4); font-weight: 700;">${subtitleBadge}</span>
        </header>
        
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 0.72rem;">
    `;

    if (activeCategory === "SOCIOECONOMIC") {
      popupContent += `
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Población Censo:</span><b>${stats.inegiPobTotal.toLocaleString()} hab.</b></div>
          <div style="display: flex; justify-content: space-between; background: rgba(6, 182, 212, 0.1); padding: 2px 4px; border-radius: 3px; border: 1px solid rgba(6, 182, 212, 0.2);"><span style="color: var(--neon-blue); font-weight: 700;">Indicador Activo:</span><b style="color: white;">${stats.valueForLayer.toLocaleString()}${selectedInegiIndicator === "GRAPROES" ? " años" : ["VPH_AGUADG", "VPH_DRENA", "VPH_ELECT", "VPH_INTERNET", "VPH_PC"].includes(selectedInegiIndicator) ? "%" : selectedInegiIndicator === "COMMERCIAL_DENSITY" ? " locales" : " unidades"}</b></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Grado Escolaridad:</span><b>${stats.inegiEscolaridad.toFixed(1)} años</b></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Ingreso Familiar Prom:</span><b style="color: var(--neon-emerald); font-weight: 700;">$${stats.ingresoFamiliar.toLocaleString()} MXN</b></div>
      `;
    } else if (activeCategory === "CROSSOVER") {
      popupContent += `
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Variable X (INEGI):</span><b>${crossoverVarX}</b></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Variable Y (Clima):</span><b>${crossoverVarY}</b></div>
          <div style="display: flex; justify-content: space-between; background: rgba(217, 70, 239, 0.1); padding: 2px 4px; border-radius: 3px; border: 1px solid rgba(217, 70, 239, 0.2);"><span style="color: #d946ef; font-weight: 700;">Resultado Cruce:</span><b style="color: #d946ef;">${stats.valueForLayer} pts</b></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Población Censo:</span><b>${stats.inegiPobTotal.toLocaleString()} hab.</b></div>
      `;
    } else {
      popupContent += `
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Población Censo:</span><b>${stats.inegiPobTotal.toLocaleString()} hab.</b></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Padrón Electoral:</span><b>${stats.padronTotal.toLocaleString()} elect.</b></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Felicidad Ciudadana:</span><b style="color: ${stats.avgHappiness > 55 ? 'var(--neon-emerald)' : 'var(--neon-rose)'};">${stats.avgHappiness}%</b></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: var(--text-secondary);">Tensión (Quejas):</span><b style="color: var(--neon-rose);">${stats.complaintCount} incidentes</b></div>
      `;
    }

    popupContent += `
        </div>

        <div style="margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 8px;">
          <span style="font-size: 0.65rem; font-weight: 800; color: var(--text-secondary); display: block; margin-bottom: 4px;">Fuerza Electoral Estimada</span>
          <div style="display: flex; flex-direction: column; gap: 3px; font-size: 0.65rem;">
            <div style="display: flex; justify-content: space-between;"><span>MORENA:</span><b>${stats.militantsPercent.MORENA}% (${stats.militants.MORENA.toLocaleString()})</b></div>
            <div style="display: flex; justify-content: space-between;"><span>PAN:</span><b>${stats.militantsPercent.PAN}% (${stats.militants.PAN.toLocaleString()})</b></div>
            <div style="display: flex; justify-content: space-between;"><span>PRI:</span><b>${stats.militantsPercent.PRI}% (${stats.militants.PRI.toLocaleString()})</b></div>
            <div style="display: flex; justify-content: space-between;"><span>MC:</span><b>${stats.militantsPercent.MC}% (${stats.militants.MC.toLocaleString()})</b></div>
          </div>
        </div>

        <footer style="margin-top: 8px; padding-top: 4px; border-top: 1px solid rgba(255,255,255,0.06); text-align: center; font-size: 0.6rem; color: var(--text-muted); cursor: pointer; font-weight: bold;">
          ${isStateLevel ? "Presione para profundizar a este Estado 🇲🇽" : "Presione para fijar zoom y centrar"}
        </footer>
      </div>
    `;

    layer.bindPopup(popupContent, { closeButton: false });

    layer.on({
      click: (e) => {
        if (activeTool === 'closure') {
          L.DomEvent.stopPropagation(e);
          layer.closePopup();
          handlePlaceStructure(e.latlng.lat, e.latlng.lng, props.seccion);
          return;
        }
        if (isStateLevel) {
          // Drill-down automático al hacer clic en un estado en el mapa nacional real
          const name = props.name || props.ESTADO || '';
          const normalizedName = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s/g, '');
          const stateKey = Object.keys(MEXICO_STATES).find(k => k.toLowerCase().replace(/_/g, '') === normalizedName);
          if (stateKey) {
            setSelectedState(MEXICO_STATES[stateKey]);
            setSelectedMunicipality(null);
          }
        } else {
          const map = layer._map;
          if (map) {
            map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 15, animate: true });
          }
        }
      },
      mouseover: (e) => {
        const lyr = e.target;
        lyr.setStyle({ weight: isStateLevel ? 3.5 : 2.5, fillOpacity: 0.78, color: '#fff' });
      },
      mouseout: (e) => {
        const lyr = e.target;
        lyr.setStyle(geoJsonStyle(feature));
      }
    });
  };

  const currentMax = activePolygons.length > 0 
    ? Math.max(...activePolygons.map(p => getPolygonStats(p.id, p.type).valueForLayer), 1)
    : 100;

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Selector de Filtros de Capas y Breadcrumbs (Glass Overlay) */}
      <div className="map-overlay-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
        
        {/* Fila superior: Breadcrumbs interactivos multinivel y Selector de Ciudades */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
          
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', background: 'rgba(8,15,30,0.85)', padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-glass)', width: 'fit-content' }}>
            <MapPin size={12} color="var(--neon-blue)" />
            <span 
              style={{ cursor: 'pointer', color: 'var(--neon-blue)', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }} 
              onClick={handleBackToNational}
            >
              MÉXICO 🇲🇽
            </span>
            {selectedState && (
              <>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>&gt;</span>
                <span 
                  style={{ cursor: 'pointer', color: 'var(--neon-blue)', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }} 
                  onClick={handleBackToState}
                >
                  {selectedState.name}
                </span>
              </>
            )}
            {selectedMunicipality && (
              <>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.72rem' }}>&gt;</span>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  {selectedMunicipality.name}
                </span>
              </>
            )}
          </div>

          {/* Botones de Acceso Rápido a Ciudades Solicitadas */}
          <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', background: 'rgba(8,15,30,0.7)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border-glass)' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', marginRight: '0.3rem' }}>Ir a Ciudad:</span>
            {[
              { id: "HERMOSILLO", label: "🌵 Hermosillo" },
              { id: "TIJUANA", label: "🌊 Tijuana" },
              { id: "MONTERREY", label: "⛰️ Monterrey" },
              { id: "CDMX", label: "🏙️ CDMX" },
              { id: "GUADALAJARA", label: "🎺 Guadalajara" },
              { id: "QUERETARO", label: "🏛️ Querétaro" }
            ].map(city => (
              <button
                key={city.id}
                onClick={() => handleQuickZoom(city.id)}
                style={{
                  fontSize: '0.62rem',
                  padding: '0.15rem 0.45rem',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'white',
                  fontWeight: '700',
                  transition: 'all 0.2s ease-in-out'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--neon-blue)';
                  e.currentTarget.style.color = 'black';
                  e.currentTarget.style.borderColor = 'var(--neon-blue)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--border-glass)';
                }}
              >
                {city.label}
              </button>
            ))}
          </div>

        </div>

        {/* Barra superior de categorías de mapas (Tabs interactivos con Glassmorphism) */}
        <div className="map-tabs-container" style={{
          display: 'flex',
          background: 'rgba(10, 18, 36, 0.75)',
          border: '1px solid var(--border-glass)',
          borderRadius: '6px',
          padding: '0.4rem',
          gap: '0.4rem',
          backdropFilter: 'blur(12px)',
          width: '100%',
          flexWrap: 'wrap'
        }}>
          {[
            { id: "TENSION", label: "🔥 Tensión & Dolores", color: "var(--neon-rose)" },
            { id: "POLITICAL", label: "🗳️ Fuerza Electoral", color: "var(--neon-blue)" },
            { id: "SOCIOECONOMIC", label: "📊 Socioeconómico (INEGI)", color: "var(--neon-emerald)" },
            { id: "CROSSOVER", label: "🔀 Cruces de Datos", color: "var(--neon-purple)" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                // Establecer capas iniciales lógicas por categoría
                if (tab.id === "TENSION") setActiveLayer("ALL_PAIN");
                else if (tab.id === "POLITICAL") setActiveLayer("ELECTORAL_PADRON");
                else if (tab.id === "SOCIOECONOMIC") setActiveLayer("POPULATION_TOTAL");
                else if (tab.id === "CROSSOVER") setActiveLayer("CROSSOVER_ACTIVE");
              }}
              style={{
                flex: 1,
                minWidth: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.8rem',
                border: '1px solid',
                borderColor: activeCategory === tab.id ? tab.color : 'rgba(255,255,255,0.05)',
                borderRadius: '4px',
                cursor: 'pointer',
                background: activeCategory === tab.id 
                  ? `rgba(${tab.id === "TENSION" ? '239, 68, 68' : tab.id === "POLITICAL" ? '59, 130, 246' : tab.id === "SOCIOECONOMIC" ? '16, 185, 129' : '168, 85, 247'}, 0.12)` 
                  : 'rgba(255,255,255,0.02)',
                color: activeCategory === tab.id ? 'white' : 'var(--text-secondary)',
                fontWeight: '800',
                fontSize: '0.7rem',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                boxShadow: activeCategory === tab.id ? `0 0 10px rgba(${tab.id === "TENSION" ? '239, 68, 68' : tab.id === "POLITICAL" ? '59, 130, 246' : tab.id === "SOCIOECONOMIC" ? '16, 185, 129' : '168, 85, 247'}, 0.15)` : 'none'
              }}
            >
              <span style={{ 
                height: '6px', 
                width: '6px', 
                borderRadius: '50%', 
                background: tab.color, 
                display: 'inline-block',
                boxShadow: `0 0 6px ${tab.color}`
              }}></span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Fila inferior: Filtros principales condicionados a la pestaña activa */}
        <div style={{ 
          display: 'flex', 
          gap: '0.6rem', 
          background: 'rgba(8, 15, 30, 0.9)', 
          padding: '0.6rem 0.8rem', 
          borderRadius: '6px', 
          border: '1px solid var(--border-glass)', 
          backdropFilter: 'blur(8px)', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={13} color="var(--neon-blue)" />
            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'white', textTransform: 'uppercase' }}>Origen:</span>
          </div>

          <div className="tab-buttons" style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.04)', padding: '2px', borderRadius: '4px' }}>
            <button 
              className={`tab-btn ${dataSourceMode === "SIMULATED" ? 'active' : ''}`}
              onClick={() => setDataSourceMode("SIMULATED")}
              style={{ fontSize: '0.62rem', padding: '0.2rem 0.5rem', border: 'none', borderRadius: '3px', cursor: 'pointer', background: dataSourceMode === "SIMULATED" ? 'var(--neon-blue)' : 'transparent', color: dataSourceMode === "SIMULATED" ? 'black' : 'white', fontWeight: '800' }}
            >
              Simulado ABM
            </button>
            <button 
              className={`tab-btn ${dataSourceMode === "REAL_INGESTED" ? 'active' : ''}`}
              onClick={() => setDataSourceMode("REAL_INGESTED")}
              style={{ fontSize: '0.62rem', padding: '0.2rem 0.5rem', border: 'none', borderRadius: '3px', cursor: 'pointer', background: dataSourceMode === "REAL_INGESTED" ? 'var(--neon-emerald)' : 'transparent', color: dataSourceMode === "REAL_INGESTED" ? 'black' : 'white', fontWeight: '800' }}
            >
              INE/INEGI Real
            </button>
          </div>

          {activeCategory !== "CROSSOVER" ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.4rem' }}>
                <Filter size={13} color="var(--neon-purple)" />
                <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'white', textTransform: 'uppercase' }}>Visualización:</span>
              </div>

              <select 
                className="overlay-select" 
                value={activeLayer}
                onChange={(e) => setActiveLayer(e.target.value)}
                style={{ minWidth: '200px', background: 'rgba(15,23,42,0.95)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '0.68rem', padding: '0.25rem' }}
              >
                {activeCategory === "TENSION" && (
                  <>
                    <option value="ALL_PAIN">🔥 Tensión Social General</option>
                    <option value="WATER">💧 Puntos de Dolor: Agua</option>
                    <option value="SECURITY">🛡️ Puntos de Dolor: Seguridad</option>
                    <option value="TAX">💼 Puntos de Dolor: Impuestos</option>
                    <option value="TRAFFIC_HOTSPOTS">🚗 Congestión Vial (Tráfico)</option>
                  </>
                )}
                {activeCategory === "POLITICAL" && (
                  <>
                    <option value="ELECTORAL_PADRON">👥 Densidad del Padrón Electoral</option>
                    <option value="MILITANTES_MORENA">🔴 Militantes de MORENA</option>
                    <option value="MILITANTES_PAN">🔵 Militantes del PAN</option>
                    <option value="MILITANTES_PRI">🟢 Militantes del PRI</option>
                    <option value="MILITANTES_MC">🟠 Militantes de Movimiento Ciudadano</option>
                    <option value="ELECTORAL_TURNOUT">🗳️ Participación Electoral Estimada</option>
                  </>
                )}
                {activeCategory === "SOCIOECONOMIC" && (
                  <>
                    <option value="POPULATION_TOTAL">👥 Población Total Censo</option>
                    <option value="SCHOOL_AVERAGE">🎓 Grado Escolaridad Promedio</option>
                    <option value="INCOME_AVERAGE">💵 Ingreso Familiar Promedio</option>
                    <option value="COMMERCIAL_DENSITY">🏬 Densidad Comercial (DENUE)</option>
                    <option value="SCHOOL_DENSITY">🏫 Densidad Escolar (DENUE)</option>
                    {selectedMunicipality && (
                      <>
                        <option value="HIST_POBREZA_EXTREMA">📉 Pobreza Extrema Histórica (%)</option>
                        <option value="HIST_PAVIMENTACION">🛣️ Pavimentación Histórica (%)</option>
                        <option value="HIST_INTERNET">📶 Cobertura de Internet Histórica (%)</option>
                        <option value="HIST_CRIMINALIDAD">🚨 Tasa de Criminalidad Histórica</option>
                        <option value="HIST_PIB">💰 PIB Municipal Histórico</option>
                      </>
                    )}
                  </>
                )}
              </select>
            </>
          ) : (
            // --- CONTROLES DE CRUCE DE DATOS MULTIDIMENSIONAL ---
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)' }}>VAR X (INEGI):</span>
                <select 
                  value={crossoverVarX} 
                  onChange={(e) => setCrossoverVarX(e.target.value)} 
                  className="overlay-select"
                  style={{ background: 'rgba(15,23,42,0.95)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '0.65rem', padding: '0.2rem' }}
                >
                  <option value="inegi_pob_total">📊 Población Total</option>
                  <option value="inegi_escolaridad">🎓 Grado Escolaridad</option>
                  <option value="inegi_pea">💼 Población Económicamente Activa</option>
                  <option value="denue_comercio">🏬 Densidad Comercial (DENUE)</option>
                  <option value="inegi_agua_entubada">🚰 Acceso a Agua Entubada (%)</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)' }}>VAR Y (POLÍTICO/SOCIAL):</span>
                <select 
                  value={crossoverVarY} 
                  onChange={(e) => setCrossoverVarY(e.target.value)} 
                  className="overlay-select"
                  style={{ background: 'rgba(15,23,42,0.95)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '0.65rem', padding: '0.2rem' }}
                >
                  <option value="dolor_tension">🔥 Tensión Social General</option>
                  <option value="dolor_agua">💧 Puntos de Dolor: Agua</option>
                  <option value="pol_morena">🔴 Militancia MORENA (%)</option>
                  <option value="pol_pan">🔵 Militancia PAN (%)</option>
                  <option value="pol_mc">🟠 Militancia MC (%)</option>
                  <option value="dolor_seguridad">🛡️ Puntos de Dolor: Seguridad</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-secondary)' }}>CRUCE:</span>
                <select 
                  value={crossoverMath} 
                  onChange={(e) => setCrossoverMath(e.target.value)} 
                  className="overlay-select"
                  style={{ background: 'rgba(15,23,42,0.95)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '0.65rem', padding: '0.2rem' }}
                >
                  <option value="multiply">🔀 Interacción (X * Y)</option>
                  <option value="difference">📉 Brecha |Abs(X-Y)|</option>
                  <option value="ratio">📊 Ratio (X / Y)</option>
                </select>
              </div>
            </div>
          )}

          <select 
            className="overlay-select"
            value={activeSector}
            onChange={(e) => setActiveSector(e.target.value)}
            style={{ background: 'rgba(15,23,42,0.95)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '0.68rem', padding: '0.25rem' }}
          >
            <option value="ALL_SECTORS">👥 Todos los Sectores</option>
            <option value="jovenes">🎓 Jóvenes (Gig Economy)</option>
            <option value="comerciantes">🏬 Pequeños Comerciantes</option>
            <option value="asalariados">🏭 Hogares Asalariados</option>
          </select>

          {/* Widget de Datos Financieros Banxico Live */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginLeft: 'auto',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '0.35rem 0.6rem',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <TrendingUp size={12} color="var(--neon-emerald)" />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: '700' }}>INFLACIÓN:</span>
              <span style={{ fontSize: '0.65rem', color: 'white', fontWeight: '800' }}>{banxicoData.inflation}%</span>
            </div>
            <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <DollarSign size={12} color="var(--neon-blue)" />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: '700' }}>USD/MXN:</span>
              <span style={{ fontSize: '0.65rem', color: 'white', fontWeight: '800' }}>${banxicoData.exchangeRate}</span>
            </div>
            <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <Landmark size={12} color="var(--neon-amber)" />
              <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: '700' }}>MIN. WAGE:</span>
              <span style={{ fontSize: '0.65rem', color: 'white', fontWeight: '800' }}>${banxicoData.minWage}</span>
            </div>
          </div>
        </div>

      </div>
 
      {/* Grid del Mapa y Panel Lateral de Datos */}
      <div className="workspace-grid-2" style={{ marginTop: '0.5rem' }}>
        
        {/* Contenedor del Mapa GIS de Precisión Cartográfica */}
        <div className="glass-card" style={{ padding: '0.5rem' }}>
          <div className="map-container" style={{ position: 'relative' }}>
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', borderRadius: '6px' }}
            >
              <ChangeMapView center={mapCenter} zoom={mapZoom} />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Renderizar Polígonos: Priorizar límites geográficos reales GeoJSON o usar Fallback procedural */}
              {geoJsonData ? (
                <GeoJSON
                  key={`${selectedState?.id}_${selectedMunicipality?.id}_${activeLayer}_${geoJsonData.features.length}`}
                  data={geoJsonData}
                  style={geoJsonStyle}
                  onEachFeature={onEachFeature}
                />
              ) : (
                activePolygons.map((poly) => {
                  const stats = getPolygonStats(poly.id, poly.type);
                  const color = getChoroplethColor(stats);
                  const opacity = getChoroplethOpacity(stats, currentMax);

                  return (
                    <Polygon
                      key={`${poly.id}_${activeLayer}_${dataSourceMode}_${poly.type}`}
                      positions={poly.polygonCoords}
                      pathOptions={{
                        fillColor: color,
                        fillOpacity: opacity,
                        color: color,
                        weight: 2,
                        dashArray: '3',
                        opacity: 0.8
                      }}
                      eventHandlers={{
                        click: (e) => {
                          if (activeTool === 'closure') {
                            handlePlaceStructure(e.latlng.lat, e.latlng.lng, poly.id);
                            return;
                          }
                          if (poly.type === "STATE") {
                            handleSelectState(poly);
                          } else if (poly.type === "MUNICIPALITY") {
                            handleSelectMunicipality(poly);
                          }
                        }
                      }}
                    >
                      <Popup>
                        <div style={{ minWidth: '260px', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
                          <h3 style={{ margin: '0 0 0.25rem 0', color: 'white', fontSize: '0.95rem', fontWeight: '800' }}>
                            {poly.name}
                          </h3>
                          <div style={{ fontSize: '0.65rem', color: 'var(--neon-blue)', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <MapPin size={10} />
                            Nivel Territorial: {poly.type === "STATE" ? "Estado Federal" : poly.type === "MUNICIPALITY" ? "Municipio" : "Sección de Código Postal (CP)"}
                          </div>
                          
                          <div className="info-list" style={{ marginTop: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
                            {activeCategory === "CROSSOVER" ? (
                              <>
                                <div className="info-row" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Variable X (INEGI):</span>
                                  <span style={{ fontWeight: '800', color: 'white' }}>
                                    {crossoverVarX === "inegi_pob_total" && `${stats.inegiPobTotal.toLocaleString()} hab.`}
                                    {crossoverVarX === "inegi_escolaridad" && `${stats.inegiEscolaridad.toFixed(1)} años`}
                                    {crossoverVarX === "inegi_pea" && `${stats.inegiPEA.toLocaleString()} PEA`}
                                    {crossoverVarX === "denue_comercio" && `${stats.denueComercio} locales`}
                                    {crossoverVarX === "inegi_agua_entubada" && `${stats.inegiAguaEntubada}%`}
                                  </span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                                  <span style={{ color: 'var(--text-secondary)' }}>Variable Y (Pol/Soc):</span>
                                  <span style={{ fontWeight: '800', color: 'white' }}>
                                    {crossoverVarY === "dolor_tension" && `${100 - stats.avgHappiness}% tensión`}
                                    {crossoverVarY === "dolor_agua" && `${100 - stats.avgHappiness + 12}% dolor`}
                                    {crossoverVarY === "pol_morena" && `${stats.militantsPercent.MORENA}% militancia`}
                                    {crossoverVarY === "pol_pan" && `${stats.militantsPercent.PAN}% militancia`}
                                    {crossoverVarY === "pol_mc" && `${stats.militantsPercent.MC}% militancia`}
                                    {crossoverVarY === "dolor_seguridad" && `${100 - stats.avgHappiness + 18}% dolor`}
                                  </span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.25rem', marginTop: '0.25rem' }}>
                                  <span style={{ color: '#d946ef', fontWeight: '800' }}>🔀 Cruce Calculado:</span>
                                  <span style={{ color: '#d946ef', fontWeight: '900', fontSize: '0.85rem' }}>{stats.valueForLayer} pts</span>
                                </div>
                              </>
                            ) : activeCategory === "SOCIOECONOMIC" ? (
                              <>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>👥 Población Censo:</span>
                                  <span style={{ fontWeight: '800' }}>{stats.inegiPobTotal.toLocaleString()} hab.</span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>🎓 Escolaridad Promedio:</span>
                                  <span style={{ fontWeight: '800' }}>{stats.inegiEscolaridad.toFixed(1)} años</span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>💵 Ingreso Familiar:</span>
                                  <span style={{ color: 'var(--neon-emerald)', fontWeight: '800' }}>${stats.ingresoFamiliar.toLocaleString()} MXN</span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>🚰 Cobertura de Agua:</span>
                                  <span style={{ fontWeight: '800' }}>{stats.inegiAguaEntubada}%</span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>🏬 Establecimientos DENUE:</span>
                                  <span style={{ color: 'var(--neon-amber)', fontWeight: '800' }}>{stats.denueComercio} locales</span>
                                </div>
                              </>
                            ) : activeCategory === "POLITICAL" ? (
                              <>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>🗳️ Padrón Electoral (INE):</span>
                                  <span style={{ fontWeight: '800' }}>{stats.padronTotal.toLocaleString()} electores</span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>🗳️ Participación Estimada:</span>
                                  <span style={{ color: '#06b6d4', fontWeight: '800' }}>{stats.electoralTurnout}%</span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>👥 Militantes Totales:</span>
                                  <span style={{ fontWeight: '800' }}>{stats.militantsTotal.toLocaleString()} electores</span>
                                </div>
                              </>
                            ) : (
                              // TENSION / PAIN MAPS
                              <>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>😊 Felicidad Promedio:</span>
                                  <span style={{ color: stats.avgHappiness > 55 ? 'var(--neon-emerald)' : 'var(--neon-rose)', fontWeight: '800' }}>{stats.avgHappiness}%</span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>🔥 Tensión / Quejas:</span>
                                  <span style={{ color: 'var(--neon-rose)', fontWeight: '800' }}>{stats.complaintCount} incidentes</span>
                                </div>
                                <div className="info-row" style={{ fontSize: '0.75rem' }}>
                                  <span>💧 Nivel de Alerta Hídrica:</span>
                                  <span style={{ color: 'var(--neon-blue)', fontWeight: '800' }}>{(100 - stats.avgHappiness + 10)}%</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Cruzamiento de Militancia Política */}
                          <div style={{ marginTop: '0.6rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                              Cruzamiento de Militancia ({dataSourceMode === "REAL_INGESTED" ? "Padrón Real" : "Muestra Simulación"})
                            </span>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                              {[
                                { label: 'MORENA', value: stats.militantsPercent.MORENA, count: stats.militants.MORENA, color: 'var(--neon-rose)' },
                                { label: 'PAN', value: stats.militantsPercent.PAN, count: stats.militants.PAN, color: 'var(--neon-blue)' },
                                { label: 'PRI', value: stats.militantsPercent.PRI, count: stats.militants.PRI, color: '#059669' },
                                { label: 'MC', value: stats.militantsPercent.MC, count: stats.militants.MC, color: 'var(--neon-amber)' },
                              ].map((p, idx) => (
                                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                                    <span style={{ fontWeight: '700' }}>{p.label}</span>
                                    <span>{p.value}% ({p.count.toLocaleString()} elect.)</span>
                                  </div>
                                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${p.value}%`, height: '100%', background: p.color, borderRadius: '2px' }}></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Acciones del Drill Down */}
                          {poly.type !== "CP" && (
                            <div style={{ marginTop: '0.75rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem' }}>
                              <button
                                onClick={() => {
                                  if (poly.type === "STATE") handleSelectState(poly);
                                  else if (poly.type === "MUNICIPALITY") handleSelectMunicipality(poly);
                                }}
                                style={{
                                  background: 'var(--neon-blue)',
                                  color: 'black',
                                  border: 'none',
                                  padding: '0.3rem 0.6rem',
                                  borderRadius: '4px',
                                  fontSize: '0.68rem',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem'
                                }}
                              >
                                Ver Mapa Interno &rarr;
                              </button>
                            </div>
                          )}

                        </div>
                      </Popup>
                    </Polygon>
                  );
                })
              )}

              {/* Marcadores de Escuelas del DENUE de INEGI (Capa de Infraestructura Educativa) */}
              {activeLayer === "SCHOOL_DENSITY" && denueSchools.map((school) => (
                <CircleMarker
                  key={school.id}
                  center={school.coords}
                  radius={7}
                  pathOptions={{
                    fillColor: 'var(--neon-purple)',
                    fillOpacity: 0.9,
                    color: '#fff',
                    weight: 1.5
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '220px', fontFamily: 'Inter, sans-serif', color: '#fff' }}>
                      <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--neon-purple)', fontSize: '0.85rem', fontWeight: '800' }}>
                        🏫 {school.nombre}
                      </h4>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        Actividad: {school.actividad}
                      </div>
                      <div style={{ fontSize: '0.7rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.4rem' }}>
                        <div><strong>Colonia:</strong> {school.colonia || 'N/A'}</div>
                        <div><strong>Código Postal (CP):</strong> {school.codigo_postal || 'N/A'}</div>
                        <div><strong>ID Registro DENUE:</strong> {school.id}</div>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
              {/* Elementos del Sandbox GIS de Infraestructura */}
              <MapClickEvents activeTool={activeTool} onPlace={handlePlaceStructure} />
              
              {structures.map((s) => {
                const icon = customIcons[s.type];
                return (
                  <React.Fragment key={s.id}>
                    <Marker position={[s.lat, s.lng]} icon={icon}>
                      <Popup>
                        <div style={{ color: '#fff', background: 'rgba(10,15,30,0.95)', padding: '5px', borderRadius: '4px', fontSize: '11px', fontFamily: 'monospace' }}>
                          <strong>{s.type === 'bridge' ? '🌉 Puente' : s.type === 'closure' ? '🚧 Cierre vial' : '🚰 Pozo de Agua'}</strong>
                          <br />
                          {s.type === 'closure' && `Sección: ${s.section}`}
                          <br />
                          <button 
                            onClick={() => {
                              const updated = structures.filter(x => x.id !== s.id);
                              setStructures(updated);
                              calculateGISSandbox(updated);
                            }}
                            style={{
                              background: 'var(--neon-rose)',
                              border: 'none',
                              color: 'black',
                              fontSize: '9px',
                              padding: '2px 5px',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              marginTop: '5px',
                              fontWeight: 'bold'
                            }}
                          >
                            Eliminar obra
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                    {s.type === 'well' && (
                      <Circle 
                        center={[s.lat, s.lng]} 
                        radius={1500} 
                        pathOptions={{ color: 'var(--neon-blue)', fillColor: 'var(--neon-blue)', fillOpacity: 0.12, weight: 1.2 }} 
                      />
                    )}
                  </React.Fragment>
                );
              })}

              <VoterParticles agents={sandboxResults?.sample_agents} />

            </MapContainer>

            {/* Barra de Herramientas del Sandbox GIS */}
            {selectedMunicipality && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                background: 'rgba(10, 15, 30, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-glass)',
                padding: '0.6rem',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                width: '180px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                fontFamily: 'sans-serif'
              }}>
                <div style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: '800', 
                  color: 'white', 
                  textAlign: 'center', 
                  borderBottom: '1px solid rgba(255,255,255,0.08)', 
                  paddingBottom: '0.35rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.2rem',
                  letterSpacing: '0.05em'
                }}>
                  <Database size={11} color="var(--neon-blue)" />
                  SANDBOX GIS VIAL
                </div>
                
                {[
                  { id: 'bridge', label: '🌉 Construir Puente', color: 'var(--neon-blue)' },
                  { id: 'closure', label: '🚧 Cerrar Avenida', color: 'var(--neon-rose)' },
                  { id: 'well', label: '🚰 Perforar Pozo', color: 'var(--neon-blue)' },
                ].map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                    style={{
                      fontSize: '0.65rem',
                      padding: '0.4rem 0.5rem',
                      border: '1px solid',
                      borderColor: activeTool === tool.id ? tool.color : 'rgba(255,255,255,0.05)',
                      borderRadius: '4px',
                      background: activeTool === tool.id ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.2)',
                      color: activeTool === tool.id ? 'white' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: '800',
                      textAlign: 'left',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    {tool.label}
                  </button>
                ))}
                
                {structures.length > 0 && (
                  <button
                    onClick={() => {
                      setStructures([]);
                      setSandboxResults(null);
                      setActiveTool(null);
                      calculateGISSandbox([]);
                    }}
                    style={{
                      fontSize: '0.6rem',
                      padding: '0.3rem',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '4px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      color: 'var(--neon-rose)',
                      cursor: 'pointer',
                      fontWeight: '800',
                      marginTop: '0.2rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    🧹 Limpiar Mapa ({structures.length})
                  </button>
                )}

                {isLoadingGis && (
                  <div style={{ 
                    fontSize: '0.58rem', 
                    color: 'var(--neon-blue)', 
                    textAlign: 'center', 
                    marginTop: '0.1rem',
                    fontWeight: 'bold',
                    letterSpacing: '0.02em'
                  }}>
                    ⚡ Recalculando...
                  </div>
                )}
              </div>
            )}
            {/* Control de Línea de Tiempo / Viaje Temporal */}
            {selectedMunicipality && historicalData && (
              <div style={{
                marginTop: '0.8rem',
                background: 'rgba(10, 15, 30, 0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-glass)',
                padding: '0.65rem 1rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                fontFamily: 'sans-serif'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.58rem', color: 'var(--neon-purple)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Viaje Temporal</span>
                  <span style={{ fontSize: '0.9rem', color: 'white', fontWeight: '900' }}>Año: {selectedTimelineYear}</span>
                </div>
                
                <input 
                  type="range" 
                  min="1995" 
                  max="2024" 
                  step="1"
                  value={selectedTimelineYear}
                  onChange={(e) => setSelectedTimelineYear(parseInt(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: 'var(--neon-purple)',
                    background: 'rgba(255,255,255,0.05)',
                    height: '6px',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />

                <div style={{ display: 'flex', gap: '0.3rem' }}>
                  {[1997, 2000, 2003, 2006, 2009, 2012, 2015, 2018, 2021, 2024].map(y => (
                    <button
                      key={y}
                      onClick={() => setSelectedTimelineYear(y)}
                      style={{
                        fontSize: '0.58rem',
                        padding: '0.2rem 0.35rem',
                        background: selectedTimelineYear === y ? 'var(--neon-purple)' : 'rgba(255,255,255,0.03)',
                        color: selectedTimelineYear === y ? 'black' : 'white',
                        border: '1px solid',
                        borderColor: selectedTimelineYear === y ? 'var(--neon-purple)' : 'rgba(255,255,255,0.08)',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontWeight: '800',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Lateral de Resumen y Matrices de Cruce */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* MÓDULO DE HISTORIAL ELECTORAL Y PREDICCIÓN EN CASCADA */}
          {selectedMunicipality && historicalData && (
            <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontSize: '0.95rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800' }}>
                <TrendingUp size={16} color="var(--neon-blue)" />
                Historial y Predicción en Cascada
              </h3>
              
              {/* Sección A: Ganador de la Elección del Año Seleccionado */}
              {(() => {
                const electionYears = [1997, 2000, 2003, 2006, 2009, 2012, 2015, 2018, 2021, 2024];
                const electionYear = electionYears.reduce((prev, curr) => {
                  return (curr <= selectedTimelineYear) ? curr : prev;
                }, 1997);
                
                const election = historicalData.candidatos.find(c => c.anio === electionYear);
                
                if (!election) return null;
                
                const partyColors = {
                  "MORENA": "var(--neon-rose)",
                  "PAN": "var(--neon-blue)",
                  "PRI": "#10b981",
                  "PAN-PRI": "var(--neon-purple)",
                  "MC": "var(--neon-amber)"
                };
                
                const partyColor = partyColors[election.partido_ganador] || "white";
                
                return (
                  <div style={{ 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid rgba(255,255,255,0.05)',
                    padding: '0.6rem',
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase' }}>
                        Elección Municipal {electionYear}
                      </span>
                      <span style={{ 
                        fontSize: '0.62rem', 
                        padding: '0.1rem 0.4rem', 
                        borderRadius: '3px',
                        background: partyColor,
                        color: 'black',
                        fontWeight: '900'
                      }}>
                        {election.partido_ganador}
                      </span>
                    </div>
                    
                    <div style={{ fontSize: '0.82rem', fontWeight: '800', color: 'white', marginBottom: '0.2rem' }}>
                      {election.nombre_ganador}
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      <div>Género: <span style={{ color: 'white', fontWeight: '700' }}>{election.genero}</span></div>
                      <div>Educación: <span style={{ color: 'white', fontWeight: '700' }}>{election.escolaridad}</span></div>
                      <div>Estatura: <span style={{ color: 'white', fontWeight: '700' }}>{election.estatura_cm} cm</span></div>
                      <div>Tez de Piel: <span style={{ color: 'white', fontWeight: '700' }}>{election.tez_color}</span></div>
                      <div>Difusión: <span style={{ color: 'white', fontWeight: '700' }}>{election.medio_difusion}</span></div>
                      <div>Votos Margen: <span style={{ color: 'white', fontWeight: '700' }}>+{election.margen_victoria_pct}%</span></div>
                    </div>
                    
                    {election.propuestas && election.propuestas.length > 0 && (
                      <div style={{ marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.4rem' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.15rem' }}>
                          Propuestas Campaña:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '0.8rem', fontSize: '0.65rem', color: 'white' }}>
                          {election.propuestas.map((p, idx) => (
                            <li key={idx} style={{ marginBottom: '0.1rem' }}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })()}
              
              {/* Sección B: Simulador en Cascada */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.6rem' }}>
                <span style={{ fontSize: '0.68rem', color: 'white', fontWeight: '800', display: 'block', marginBottom: '0.4rem' }}>
                  Simular Cambios Macro (Impuestos / Obras)
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.6rem' }}>
                  <select
                    value={predictVariable}
                    onChange={(e) => setPredictVariable(e.target.value)}
                    style={{ background: 'rgba(15,23,42,0.95)', color: 'white', border: '1px solid var(--border-glass)', borderRadius: '4px', fontSize: '0.65rem', padding: '0.25rem' }}
                  >
                    <option value="calles_pavimentadas_pct">🛣️ Pavimentación de Calles (%)</option>
                    <option value="cobertura_internet_pct">📶 Cobertura de Internet (%)</option>
                    <option value="presupuesto_shcp_mxn">💼 Presupuesto Federal (SHCP)</option>
                    <option value="tasa_criminalidad">🚨 Tasa de Criminalidad</option>
                  </select>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input 
                      type="range"
                      min="-30"
                      max="30"
                      step="5"
                      value={predictChangeVal}
                      onChange={(e) => setPredictChangeVal(parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: 'var(--neon-blue)', height: '4px' }}
                    />
                    <span style={{ fontSize: '0.68rem', fontWeight: '900', color: predictChangeVal > 0 ? 'var(--neon-emerald)' : predictChangeVal < 0 ? 'var(--neon-rose)' : 'white', width: '38px', textAlign: 'right' }}>
                      {predictChangeVal > 0 ? `+${predictChangeVal}` : predictChangeVal}%
                    </span>
                  </div>
                </div>
                
                {/* Tabla de Impactos Proyectados */}
                {isPredicting ? (
                  <div style={{ fontSize: '0.65rem', color: 'var(--neon-blue)', textAlign: 'center', padding: '1rem' }}>
                    ⚡ Calculando correlaciones...
                  </div>
                ) : cascadePredictions ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div style={{ fontSize: '0.58rem', color: 'var(--text-secondary)', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '0.1rem' }}>
                      Impacto estimado en cascada:
                    </div>
                    {Object.entries(cascadePredictions).map(([varKey, pred]) => {
                      const labels = {
                        "pobreza_extrema_pct": "Pobreza Extrema",
                        "pobreza_moderada_pct": "Pobreza Moderada",
                        "transporte_publico_cobertura": "Cobertura Transporte",
                        "alumbrado_publico_pct": "Alumbrado Público",
                        "cobertura_internet_pct": "Cobertura Internet",
                        "tasa_criminalidad": "Tasa Criminalidad",
                        "pib_municipal": "PIB Municipal",
                        "presupuesto_shcp_mxn": "Presupuesto SHCP",
                        "calles_pavimentadas_pct": "Pavimentación"
                      };
                      
                      const label = labels[varKey] || varKey;
                      const valChange = parseFloat(pred.cambio_porcentual);
                      const color = valChange > 0 
                        ? (["tasa_criminalidad", "pobreza_extrema_pct", "pobreza_moderada_pct"].includes(varKey) ? 'var(--neon-rose)' : 'var(--neon-emerald)')
                        : (["tasa_criminalidad", "pobreza_extrema_pct", "pobreza_moderada_pct"].includes(varKey) ? 'var(--neon-emerald)' : 'var(--neon-rose)');
                      
                      return (
                        <div key={varKey} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.02)',
                          padding: '0.25rem 0.4rem',
                          borderRadius: '3px',
                          fontSize: '0.65rem',
                          borderLeft: `2px solid ${color}`
                        }}>
                          <span style={{ color: 'white' }}>{label}</span>
                          <span style={{ color: color, fontWeight: '800' }}>
                            {pred.cambio_porcentual}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* Matriz de Cruce Geográfico Dinámica (INEGI, Electoral o Cruce Multidimensional) */}
          <div className="glass-card glow-purple" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '800' }}>
              <Users size={16} color="var(--neon-purple)" />
              {activeCategory === "CROSSOVER" && "Matriz de Cruce e Interacción"}
              {activeCategory === "SOCIOECONOMIC" && "Indicadores Socioeconómicos (INEGI)"}
              {activeCategory === "POLITICAL" && "Fuerza Electoral & Afiliación"}
              {activeCategory === "TENSION" && "Índices de Tensión & Felicidad"}
            </h3>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              {activeCategory === "CROSSOVER" && "Correlación y brecha entre variables del Censo y el Clima de Opinión."}
              {activeCategory === "SOCIOECONOMIC" && "Métricas demográficas oficiales del Censo INEGI y DENUE comercial."}
              {activeCategory === "POLITICAL" && "Padrones de militantes oficiales registrados ante el INE por sección."}
              {activeCategory === "TENSION" && "Puntos de dolor reportados y nivel de descontento ciudadano."}
            </p>

            <div style={{ overflowX: 'auto', marginTop: '0.25rem', maxHeight: '350px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.4rem 0.2rem' }}>Territorio</th>
                    {activeCategory === "CROSSOVER" && (
                      <>
                        <th style={{ padding: '0.4rem 0.2rem' }}>Var X</th>
                        <th style={{ padding: '0.4rem 0.2rem' }}>Var Y</th>
                        <th style={{ padding: '0.4rem 0.2rem', textAlign: 'right' }}>Resultado</th>
                      </>
                    )}
                    {activeCategory === "SOCIOECONOMIC" && (
                      <>
                        <th style={{ padding: '0.4rem 0.2rem' }}>Población</th>
                        <th style={{ padding: '0.4rem 0.2rem' }}>Escolaridad</th>
                        <th style={{ padding: '0.4rem 0.2rem', textAlign: 'right' }}>Ingreso</th>
                      </>
                    )}
                    {activeCategory === "POLITICAL" && (
                      <>
                        <th style={{ padding: '0.4rem 0.2rem' }}>Padrón</th>
                        <th style={{ padding: '0.4rem 0.2rem', textAlign: 'right' }}>Partidos (%)</th>
                      </>
                    )}
                    {activeCategory === "TENSION" && (
                      <>
                        <th style={{ padding: '0.4rem 0.2rem' }}>Felicidad</th>
                        <th style={{ padding: '0.4rem 0.2rem' }}>Quejas</th>
                        <th style={{ padding: '0.4rem 0.2rem', textAlign: 'right' }}>Alerta</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {activePolygons.slice(0, 15).map((poly, idx) => {
                    const stats = getPolygonStats(poly.id, poly.type);
                    const cleanName = poly.name.replace('🌵', '').replace('🏙️', '').replace('🎺', '').replace('⛰️', '').replace('🌲', '').replace('🌊', '').replace('🏛️', '');
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '0.5rem 0.2rem', fontWeight: '700', color: 'white' }}>
                          {cleanName}
                        </td>
                        
                        {/* Celdas condicionales por pestaña */}
                        {activeCategory === "CROSSOVER" && (
                          <>
                            <td style={{ padding: '0.5rem 0.2rem', fontFamily: 'monospace' }}>
                              {crossoverVarX === "inegi_pob_total" && stats.inegiPobTotal.toLocaleString()}
                              {crossoverVarX === "inegi_escolaridad" && `${stats.inegiEscolaridad.toFixed(1)}a`}
                              {crossoverVarX === "inegi_pea" && stats.inegiPEA.toLocaleString()}
                              {crossoverVarX === "denue_comercio" && stats.denueComercio}
                              {crossoverVarX === "inegi_agua_entubada" && `${stats.inegiAguaEntubada}%`}
                            </td>
                            <td style={{ padding: '0.5rem 0.2rem', fontFamily: 'monospace' }}>
                              {crossoverVarY === "dolor_tension" && `${100 - stats.avgHappiness}%`}
                              {crossoverVarY === "dolor_agua" && `${100 - stats.avgHappiness + 12}%`}
                              {crossoverVarY === "pol_morena" && `${stats.militantsPercent.MORENA}%`}
                              {crossoverVarY === "pol_pan" && `${stats.militantsPercent.PAN}%`}
                              {crossoverVarY === "pol_mc" && `${stats.militantsPercent.MC}%`}
                              {crossoverVarY === "dolor_seguridad" && `${100 - stats.avgHappiness + 18}%`}
                            </td>
                            <td style={{ padding: '0.5rem 0.2rem', textAlign: 'right', fontWeight: '800', color: '#d946ef' }}>
                              {stats.valueForLayer} pts
                            </td>
                          </>
                        )}

                        {activeCategory === "SOCIOECONOMIC" && (
                          <>
                            <td style={{ padding: '0.5rem 0.2rem', fontFamily: 'monospace' }}>
                              {stats.inegiPobTotal.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.5rem 0.2rem', fontFamily: 'monospace' }}>
                              {stats.inegiEscolaridad.toFixed(1)} años
                            </td>
                            <td style={{ padding: '0.5rem 0.2rem', textAlign: 'right', color: 'var(--neon-emerald)', fontWeight: '700' }}>
                              ${stats.ingresoFamiliar.toLocaleString()}
                            </td>
                          </>
                        )}

                        {activeCategory === "POLITICAL" && (
                          <>
                            <td style={{ padding: '0.5rem 0.2rem', fontFamily: 'monospace' }}>
                              {stats.padronTotal.toLocaleString()}
                            </td>
                            <td style={{ padding: '0.5rem 0.2rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.15rem', justifyContent: 'flex-end' }}>
                                <span style={{ color: 'var(--neon-rose)', fontWeight: '700' }}>{stats.militantsPercent.MORENA}%</span>
                                <span style={{ color: 'var(--neon-blue)', fontWeight: '700' }}>{stats.militantsPercent.PAN}%</span>
                                <span style={{ color: 'var(--neon-amber)', fontWeight: '700' }}>{stats.militantsPercent.MC}%</span>
                              </div>
                            </td>
                          </>
                        )}

                        {activeCategory === "TENSION" && (
                          <>
                            <td style={{ padding: '0.5rem 0.2rem', color: 'var(--neon-emerald)', fontWeight: '700' }}>
                              {stats.avgHappiness}%
                            </td>
                            <td style={{ padding: '0.5rem 0.2rem', color: 'var(--neon-rose)', fontWeight: '700' }}>
                              {stats.complaintCount}
                            </td>
                            <td style={{ padding: '0.5rem 0.2rem', textAlign: 'right', color: 'var(--neon-blue)', fontWeight: '700' }}>
                              {100 - stats.avgHappiness + 10}%
                            </td>
                          </>
                        )}

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tarjeta Informativa de Dolores e Incidencia Geográfica */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: '800' }}>Focalización e Inteligencia Territorial</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: '0.65rem', background: 'var(--neon-rose)', color: 'black', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: '800', height: 'fit-content' }}>
                  MORENA
                </span>
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: '700', color: 'white' }}>Bastiones en el Sur del País</h4>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Fuerte presencia rural e industrial. Alta receptividad a programas federales y reformas de bienestar.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: '0.65rem', background: 'var(--neon-blue)', color: 'black', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: '800', height: 'fit-content' }}>
                  PAN
                </span>
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: '700', color: 'white' }}>Corredor del Bajío y Norte</h4>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Sólida militancia en sectores comerciales e industriales del Norte (Sonora/Chihuahua) y el Bajío. Foco en seguridad.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.02)' }}>
                <span style={{ fontSize: '0.65rem', background: 'var(--neon-amber)', color: 'black', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: '800', height: 'fit-content' }}>
                  MC
                </span>
                <div>
                  <h4 style={{ fontSize: '0.78rem', fontWeight: '700', color: 'white' }}>Foco Urbano Metropolitano</h4>
                  <p style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    Alto nivel de penetración en zonas metropolitanas de Jalisco (Guadalajara) y Nuevo León (Monterrey). Segmento joven de alta volatilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
