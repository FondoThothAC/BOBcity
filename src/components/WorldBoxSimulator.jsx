// src/components/WorldBoxSimulator.jsx
// UXDD / CDD: Simulador Micro-Social Interactivo en Canvas Isométrico (Estilo WorldBox)
// Comentarios y textos en español neutro premium.

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, Plus, Shield, Droplet, Construction, HelpCircle, RotateCw, Layers } from 'lucide-react';
import GartnerRadar from './GartnerRadar';

const WorldBoxSimulator = ({ pythonApiUrl = 'http://localhost:5001' }) => {
  // Estados de control de simulación
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 5x
  const [rotation, setRotation] = useState(0); // 0 = 0°, 1 = 90°, 2 = 180°, 3 = 270°
  const [viewMode, setViewMode] = useState('voto'); // 'voto' | 'aprobacion' | 'estres'
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [toolActive, setToolActive] = useState(null); // 'well' | 'closure' | 'bridge'
  const [structures, setStructures] = useState([
    { id: 1, type: 'well', lat: 29.0729, lng: -110.9559, section: '0001', name: 'Pozo Central' }
  ]);
  const [globalMetrics, setGlobalMetrics] = useState({
    avg_happiness: 55.4,
    avg_water_pain: 42.1,
    avg_transit_pain: 35.8,
    vote_share: { Morena: 52.3, Oposición: 47.7 }
  });
  
  // Sliders de gobernanza municipal
  const [taxes, setTaxes] = useState(12); // Pct de impuestos
  const [securityBudget, setSecurityBudget] = useState(60); // Pct presupuesto seguridad
  const [waterSubsidy, setWaterSubsidy] = useState(30); // Pct subsidio agua
  
  // OSINT Radar Events
  const [macroEvents, setMacroEvents] = useState([]);

  // --- Estados del Gestor de Multiversos ---
  const [timelines, setTimelines] = useState([]);
  const [activeTimeline, setActiveTimeline] = useState('realidad_base');
  const [newTimelineName, setNewTimelineName] = useState('');
  const [agentComparison, setAgentComparison] = useState(null);
  
  const [logs, setLogs] = useState([
    '🤖 Consola del Simulador Iniciada.',
    '📊 Datos del INEGI y DERFE integrados para Sonora.',
    '🏠 500 Agentes micro-sociales cargados en sus residencias.',
    '🚗 Rutas de casa-trabajo trazadas por sección electoral.'
  ]);

  const canvasRef = useRef(null);
  const [agents, setAgents] = useState([]);
  const requestRef = useRef();
  
  // Agregar log a la consola integrada
  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  // 1. Obtener la simulación inicial y actualizar al cambiar estructuras/parámetros
  const fetchSimulation = async (
    updatedStructures = structures, 
    updatedTaxes = taxes, 
    updatedSecurity = securityBudget, 
    updatedSubsidy = waterSubsidy, 
    currentTimeline = activeTimeline
  ) => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/gis-sandbox/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ciudad: 'hermosillo',
          timeline_id: currentTimeline,
          structures: updatedStructures,
          policies: {
            taxes: updatedTaxes,
            security: updatedSecurity,
            subsidy: updatedSubsidy
          }
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setGlobalMetrics(data.results.global_metrics);
        if (data.results.active_macro_events) {
          setMacroEvents(data.results.active_macro_events);
        }
        
        // Inicializar agentes o actualizar sus estados
        const rawAgents = data.results.sample_agents || [];
        const processedAgents = rawAgents.map((agent, index) => {
          const homeCoords = agent.home_coords;
          return {
            ...agent,
            progress: Math.random(),
            direction: Math.random() > 0.5 ? 1 : -1,
            speed: 0.002 + Math.random() * 0.003,
            current_lat: homeCoords[0],
            current_lng: homeCoords[1]
          };
        });
        setAgents(processedAgents);
      }
      
      // Sincronizar timelines y detalles individuales
      fetchTimelines();
      
      if (selectedAgent) {
        fetchAgentComparison(selectedAgent.agent_id);
      }
    } catch (e) {
      console.error("Error fetching simulation metrics", e);
    }
  };

  const fetchTimelines = async () => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/multiverse/timelines`);
      const data = await res.json();
      if (data.status === 'success') {
        setTimelines(data.timelines);
      }
    } catch (e) {
      console.error("Error fetching timelines", e);
    }
  };

  const fetchAgentComparison = async (agentId) => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/multiverse/agent-comparison?agent_id=${agentId}`);
      const data = await res.json();
      if (data.status === 'success') {
        setAgentComparison(data.comparison);
      }
    } catch (e) {
      console.error("Error fetching agent comparison", e);
    }
  };

  const handleTimelineChange = (timelineId) => {
    setActiveTimeline(timelineId);
    const targetTimeline = timelines.find(t => t.id === timelineId);
    if (targetTimeline && targetTimeline.policies) {
      const p = targetTimeline.policies;
      setTaxes(p.taxes || 12);
      setSecurityBudget(p.security || 60);
      setWaterSubsidy(p.subsidy || 30);
      addLog(`Multiverso: Cambiado al universo '${targetTimeline.name}'.`);
      fetchSimulation(structures, p.taxes || 12, p.security || 60, p.subsidy || 30, timelineId);
    } else {
      fetchSimulation(structures, taxes, securityBudget, waterSubsidy, timelineId);
    }
  };

  const handleCreateTimeline = async (e) => {
    e.preventDefault();
    if (!newTimelineName.trim()) return;
    
    const timelineId = newTimelineName.trim().toLowerCase().replace(/\s+/g, '_');
    
    try {
      const res = await fetch(`${pythonApiUrl}/api/multiverse/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeline_id: timelineId,
          base_timeline_id: activeTimeline,
          policies: {
            taxes,
            security: securityBudget,
            subsidy: waterSubsidy
          }
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        addLog(`Multiverso: Creado nuevo universo '${newTimelineName}' clonado de '${activeTimeline}'.`);
        setNewTimelineName('');
        handleTimelineChange(timelineId);
      }
    } catch (e) {
      console.error("Error creating timeline", e);
    }
  };

  const handleDeleteTimeline = async (timelineId) => {
    if (timelineId === 'realidad_base') return;
    try {
      const res = await fetch(`${pythonApiUrl}/api/multiverse/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeline_id: timelineId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        addLog(`Multiverso: Eliminado universo '${timelineId}'.`);
        if (activeTimeline === timelineId) {
          handleTimelineChange('realidad_base');
        } else {
          fetchTimelines();
        }
      }
    } catch (e) {
      console.error("Error deleting timeline", e);
    }
  };

  useEffect(() => {
    fetchSimulation(structures, taxes, securityBudget, waterSubsidy, activeTimeline);
  }, []);

  // Al colocar una estructura
  const handlePlaceStructure = (type, lat, lng, section) => {
    const newStructure = {
      id: Date.now(),
      type,
      lat,
      lng,
      section: section || '0001',
      name: type === 'well' ? 'Pozo Nuevo' : (type === 'bridge' ? 'Puente Nuevo' : 'Obra Vial')
    };
    const newStructures = [...structures, newStructure];
    setStructures(newStructures);
    fetchSimulation(newStructures, taxes, securityBudget, waterSubsidy, activeTimeline);
    setToolActive(null);
    addLog(`Obras: Colocada nueva infraestructura: ${newStructure.name} en lat: ${lat.toFixed(4)}, lng: ${lng.toFixed(4)}`);
  };

  // Ajustes de políticas (sliders)
  const handlePolicyChange = (type, value) => {
    let nextTaxes = taxes;
    let nextSecurity = securityBudget;
    let nextSubsidy = waterSubsidy;

    if (type === 'taxes') {
      setTaxes(value);
      nextTaxes = value;
    } else if (type === 'security') {
      setSecurityBudget(value);
      nextSecurity = value;
    } else if (type === 'subsidy') {
      setWaterSubsidy(value);
      nextSubsidy = value;
    }

    fetchSimulation(structures, nextTaxes, nextSecurity, nextSubsidy, activeTimeline);
  };

  // Ciclo de animación del Canvas Isométrico
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Dimensiones de pantalla
    let width = canvas.width = canvas.parentElement.clientWidth;
    let height = canvas.height = 420;

    // Centro del canvas
    const cx = width / 2;
    const cy = height / 2 - 20;

    // Configuración isométrica
    const tileWidth = 32;
    const tileHeight = 16;
    const gridSize = 12; // Rejilla 12x12

    // Transformación de coordenadas 2D a Isométrica con soporte de rotación
    const toIso = (x, y, z = 0) => {
      let rx = x;
      let ry = y;
      if (rotation === 1) { rx = y; ry = gridSize - 1 - x; }
      else if (rotation === 2) { rx = gridSize - 1 - x; ry = gridSize - 1 - y; }
      else if (rotation === 3) { rx = gridSize - 1 - y; ry = x; }

      const isoX = cx + (rx - ry) * tileWidth;
      const isoY = cy + (rx + ry) * tileHeight - z;
      return { x: isoX, y: isoY };
    };

    // Transformación inversa: Isométrica a 2D con soporte de rotación
    const fromIso = (isoX, isoY) => {
      const dx = isoX - cx;
      const dy = isoY - cy;
      const rx = (dx / tileWidth + dy / tileHeight) / 2;
      const ry = (dy / tileHeight - dx / tileWidth) / 2;
      
      let x = rx;
      let y = ry;
      if (rotation === 1) { x = gridSize - 1 - ry; y = rx; }
      else if (rotation === 2) { x = gridSize - 1 - rx; y = gridSize - 1 - ry; }
      else if (rotation === 3) { x = ry; y = gridSize - 1 - rx; }
      return { x, y };
    };

    // Coordenadas geográficas límites de Hermosillo para mapeo
    const mapBounds = {
      minLat: 29.04,
      maxLat: 29.10,
      minLng: -110.99,
      maxLng: -110.92
    };

    // Convertir Coordenadas Geográficas (Lat/Lng) a Grid 2D del Canvas [0, gridSize]
    const geoToGrid = (lat, lng) => {
      const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * gridSize;
      const y = ((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * gridSize;
      return {
        x: Math.max(0, Math.min(gridSize - 1, x)),
        y: Math.max(0, Math.min(gridSize - 1, y))
      };
    };

    let lastTime = 0;

    const animate = (time) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Dibujar el fondo / cielo o cuadrícula base oscura
      ctx.fillStyle = '#0a0d16';
      ctx.fillRect(0, 0, width, height);

      // 2. Dibujar Terreno Isométrico (Tiles)
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          // Determinar relieve / elevación base
          let z = 0;
          let color = '#151e33'; // Gris oscuro base (ciudad)
          
          // Simular un río cruzando de forma isométrica (Hermosillo Río)
          const isRiver = Math.abs(x - y) <= 1 && y > 2 && y < gridSize - 2;
          if (isRiver) {
            color = '#0e2d5c'; // Azul agua
            z = -4;
          } else if ((x + y) % 4 === 0) {
            // Elevación de colinas o cerro de la campana
            z = 4;
            color = '#1e2942';
          }
          
          const pt = toIso(x, y, z);

          // Dibujar el rombo isométrico
          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y - tileHeight);
          ctx.lineTo(pt.x + tileWidth, pt.y);
          ctx.lineTo(pt.x, pt.y + tileHeight);
          ctx.lineTo(pt.x - tileWidth, pt.y);
          ctx.closePath();
          
          ctx.fillStyle = color;
          ctx.fill();
          
          // Borde del rombo
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // 2.5 Dibujar Etiquetas de Referencia Geográfica (Landmarks)
      const landmarks = [
        { gridX: 6, gridY: 6, name: "📍 Centro", color: "rgba(212, 175, 55, 0.85)" },
        { gridX: 2, gridY: 2, name: "📍 Norte (La Caridad)", color: "rgba(0, 255, 231, 0.75)" },
        { gridX: 10, gridY: 10, name: "📍 Sur (Palo Verde)", color: "rgba(155, 107, 255, 0.75)" },
        { gridX: 3, gridY: 9, name: "🌊 Río Sonora", color: "rgba(56, 189, 248, 0.75)" }
      ];

      landmarks.forEach(lm => {
        const pt = toIso(lm.gridX, lm.gridY, 6);
        ctx.fillStyle = lm.color;
        ctx.font = 'bold 9px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(lm.name, pt.x, pt.y);
      });
      ctx.textAlign = 'left'; // reset

      // 3. Dibujar Estructuras Colocadas (Wells, Bridges, Closures)
      structures.forEach(struct => {
        const gridPos = geoToGrid(struct.lat, struct.lng);
        const pt = toIso(gridPos.x, gridPos.y);

        if (struct.type === 'well') {
          // Torre de agua isométrica (Cilindro azul/gris)
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y - 15, 6, 3, 0, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = '#0ea5e9';
          ctx.fillRect(pt.x - 6, pt.y - 15, 12, 15);
          
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y, 6, 3, 0, 0, 2 * Math.PI);
          ctx.fill();
          
          // Etiqueta
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '8px monospace';
          ctx.fillText("💧 Pozo", pt.x - 12, pt.y - 20);
        } 
        else if (struct.type === 'closure') {
          // Barrera roja 3D
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(pt.x - 10, pt.y);
          ctx.lineTo(pt.x + 10, pt.y);
          ctx.stroke();
          
          ctx.fillStyle = '#ef4444';
          ctx.font = '8px monospace';
          ctx.fillText("⚠️ Obra", pt.x - 12, pt.y - 10);
        }
        else if (struct.type === 'bridge') {
          // Puente en arco
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 10, Math.PI, 0);
          ctx.stroke();
          
          ctx.fillStyle = '#34d399';
          ctx.font = '8px monospace';
          ctx.fillText("🌉 Puente", pt.x - 18, pt.y - 15);
        }
      });

      // 4. Actualizar y Dibujar Agentes (Pequeños avatares)
      if (agents.length > 0) {
        agents.forEach((agent, index) => {
          // Actualizar movimiento de ida y vuelta
          if (isRunning) {
            const stepSpeed = agent.speed * speed;
            agent.progress += stepSpeed * agent.direction;
            if (agent.progress >= 1.0) {
              agent.progress = 1.0;
              agent.direction = -1; // Regresar a casa
            } else if (agent.progress <= 0.0) {
              agent.progress = 0.0;
              agent.direction = 1; // Ir al trabajo
            }
          }

          // Interpolación de coordenadas geográficas
          const lat = agent.home_coords[0] + (agent.work_coords[0] - agent.home_coords[0]) * agent.progress;
          const lng = agent.home_coords[1] + (agent.work_coords[1] - agent.home_coords[1]) * agent.progress;
          
          agent.current_lat = lat;
          agent.current_lng = lng;

          const gridPos = geoToGrid(lat, lng);
          const pt = toIso(gridPos.x, gridPos.y, 2);

          // Color según el Modo de Vista activo
          let agentColor = '#38bdf8'; // fallback
          if (viewMode === 'voto') {
            const isGov = agent.vote_intention === "Morena";
            agentColor = isGov ? '#10b981' : '#f97316'; // Verde (Morena) o Naranja (Oposición)
          } else if (viewMode === 'aprobacion') {
            const approval = agent.government_approval || 50;
            if (approval > 70) agentColor = '#10b981'; // Alta Aprobación (Verde)
            else if (approval > 40) agentColor = '#eab308'; // Media (Amarillo)
            else agentColor = '#ef4444'; // Baja (Rojo)
          } else if (viewMode === 'estres') {
            const stress = agent.economic_stress || 50;
            if (stress > 65) agentColor = '#ef4444'; // Alto Estrés (Rojo)
            else if (stress > 35) agentColor = '#f97316'; // Moderado (Naranja)
            else agentColor = '#10b981'; // Bajo (Verde)
          }

          // Dibujar cuerpo del agente (radio dinámico basado en peso poblacional)
          const agentRadius = Math.max(2, Math.min(6, (agent.weight || 10) / 4));
          ctx.fillStyle = agentColor;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, agentRadius, 0, 2 * Math.PI);
          ctx.fill();

          // Sombra neon del agente
          ctx.strokeStyle = agentColor + '66';
          ctx.lineWidth = agentRadius > 3 ? 2 : 1;
          ctx.stroke();

          // Dibujar emoji temporal de frustración sobre la cabeza si su felicidad es crítica
          if (agent.government_approval < 40 && Math.sin(time * 0.005 + index) > 0.8) {
            ctx.fillStyle = '#ef4444';
            ctx.font = '10px sans-serif';
            ctx.fillText("😡", pt.x - 5, pt.y - (agentRadius + 5));
          } else if (agent.government_approval > 75 && Math.sin(time * 0.005 + index) > 0.9) {
            ctx.fillStyle = '#10b981';
            ctx.font = '10px sans-serif';
            ctx.fillText("😊", pt.x - 5, pt.y - (agentRadius + 5));
          }
        });
      }

      // Dibujar cursor de la herramienta activa si pasa por el canvas
      if (toolActive) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '10px monospace';
        ctx.fillText(`🔧 Herramienta: Colocar ${toolActive.toUpperCase()}`, 10, 20);
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [agents, isRunning, speed, structures, toolActive, rotation, viewMode]);

  // Click en el Canvas para colocar estructuras o seleccionar agentes
  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const cx = canvas.width / 2;
    const cy = canvas.height / 2 - 20;
    const tileWidth = 32;
    const tileHeight = 16;
    const gridSize = 12;

    const toIso = (x, y, z = 0) => {
      let rx = x;
      let ry = y;
      if (rotation === 1) { rx = y; ry = gridSize - 1 - x; }
      else if (rotation === 2) { rx = gridSize - 1 - x; ry = gridSize - 1 - y; }
      else if (rotation === 3) { rx = gridSize - 1 - y; ry = x; }
      return {
        x: cx + (rx - ry) * tileWidth,
        y: cy + (rx + ry) * tileHeight - z
      };
    };

    const mapBounds = {
      minLat: 29.04,
      maxLat: 29.10,
      minLng: -110.99,
      maxLng: -110.92
    };

    const geoToGrid = (lat, lng) => {
      return {
        x: ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * gridSize,
        y: ((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * gridSize
      };
    };

    // Si hay herramienta activa, mapear y colocar con soporte de rotación
    if (toolActive) {
      const dx = clickX - cx;
      const dy = clickY - cy;
      const rx = (dx / tileWidth + dy / tileHeight) / 2;
      const ry = (dy / tileHeight - dx / tileWidth) / 2;
      
      let x = rx;
      let y = ry;
      if (rotation === 1) { x = gridSize - 1 - ry; y = rx; }
      else if (rotation === 2) { x = gridSize - 1 - rx; y = gridSize - 1 - ry; }
      else if (rotation === 3) { x = ry; y = gridSize - 1 - rx; }
      
      const clampX = Math.max(0, Math.min(gridSize - 1, x));
      const clampY = Math.max(0, Math.min(gridSize - 1, y));
      
      const lng = mapBounds.minLng + (clampX / gridSize) * (mapBounds.maxLng - mapBounds.minLng);
      const lat = mapBounds.minLat + (clampY / gridSize) * (mapBounds.maxLat - mapBounds.minLat);
      const randomSection = `000${Math.floor(Math.random() * 9) + 1}`;
      
      handlePlaceStructure(toolActive, lat, lng, randomSection);
      return;
    }

    // Si no hay herramienta activa, buscar agente más cercano para desplegar detalles
    let closestAgent = null;
    let minDist = 25; // Radio máximo de click en píxeles

    agents.forEach(agent => {
      const gridPos = geoToGrid(agent.current_lat, agent.current_lng);
      const pt = toIso(gridPos.x, gridPos.y, 2);
      const dist = Math.hypot(clickX - pt.x, clickY - pt.y);
      if (dist < minDist) {
        minDist = dist;
        closestAgent = agent;
      }
    });

    if (closestAgent) {
      setSelectedAgent(closestAgent);
      fetchAgentComparison(closestAgent.agent_id);
      addLog(`Auditoría: Seleccionado grupo #${closestAgent.agent_id} (${closestAgent.sector}) - Representa: ${closestAgent.weight || 10} habs.`);
    } else {
      setSelectedAgent(null);
      setAgentComparison(null);
    }
  };

  const handleReset = () => {
    setStructures([]);
    fetchSimulation([], taxes, securityBudget, waterSubsidy, activeTimeline);
    addLog('Simulador restablecido a condiciones iniciales.');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-[#030712] min-height-screen text-slate-100 font-sans">
      
      {/* 1. Panel de Visualización del Canvas (Videojuego ABM) */}
      <div className="flex-1 bg-[#090d16] border border-[#1e293b]/60 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
        <div className="p-4 bg-[#0f172a]/70 border-b border-[#1e293b]/50 flex justify-between items-center backdrop-blur-md">
          <div>
            <h2 className="text-lg font-semibold text-[#38bdf8] flex items-center gap-2">
              🎮 Simulador Táctico: Sonora Sandbox (Hermosillo)
            </h2>
            <p className="text-xs text-slate-400">
              Visualización a nivel micro de agentes transitando entre hogares (casa) y zonas de trabajo
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Controles de reproducción */}
            <button 
              onClick={() => setIsRunning(!isRunning)} 
              className={`p-2 rounded-lg transition ${isRunning ? 'bg-[#0f172a] hover:bg-[#ef4444]/20 text-[#ef4444]' : 'bg-[#10b981]/20 hover:bg-[#10b981]/30 text-[#10b981]'}`}
              title={isRunning ? 'Pausar Simulación' : 'Iniciar Simulación'}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
            </button>
            
            <button 
              onClick={() => {
                fetchSimulation();
                addLog('Simulador forzado a recalcular correlaciones...');
              }} 
              className="p-2 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-[#38bdf8] transition"
              title="Sincronizar Datos"
            >
              <RefreshCw size={16} />
            </button>

            {/* Rotación */}
            <button 
              onClick={() => setRotation(prev => (prev + 1) % 4)} 
              className="p-2 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-[#D4AF37] transition flex items-center gap-1"
              title="Rotar Vista 90°"
            >
              <RotateCw size={14} />
              <span className="text-[10px] font-bold">Rotar</span>
            </button>

            {/* Selector de Modo de Vista */}
            <div className="flex items-center bg-[#0f172a] border border-[#1e293b] rounded-lg p-0.5">
              <button 
                onClick={() => setViewMode('voto')}
                className={`text-[10px] font-bold px-2 py-1 rounded transition ${viewMode === 'voto' ? 'bg-[#38bdf8]/20 text-[#38bdf8]' : 'text-slate-400 hover:text-slate-200'}`}
                title="Mostrar intención de voto (Morena vs Oposición)"
              >
                Voto
              </button>
              <button 
                onClick={() => setViewMode('aprobacion')}
                className={`text-[10px] font-bold px-2 py-1 rounded transition ${viewMode === 'aprobacion' ? 'bg-[#10b981]/20 text-[#10b981]' : 'text-slate-400 hover:text-slate-200'}`}
                title="Mostrar aprobación de gobierno"
              >
                Aprobación
              </button>
              <button 
                onClick={() => setViewMode('estres')}
                className={`text-[10px] font-bold px-2 py-1 rounded transition ${viewMode === 'estres' ? 'bg-[#ef4444]/20 text-[#ef4444]' : 'text-slate-400 hover:text-slate-200'}`}
                title="Mostrar estrés económico"
              >
                Estrés
              </button>
            </div>

            {/* Velocidad */}
            <select 
              value={speed} 
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="bg-[#0f172a] text-xs text-[#38bdf8] border border-[#1e293b] rounded-lg px-2 py-1 outline-none"
            >
              <option value={1}>Speed: 1x</option>
              <option value={2}>Speed: 2x</option>
              <option value={5}>Speed: 5x (Max)</option>
            </select>
          </div>
        </div>

        {/* Canvas Isométrico Interactivo */}
        <div className="relative flex-1 bg-[#0a0d16] cursor-crosshair">
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick}
            className="block w-full h-[420px]"
          />

          {/* Leyenda Dinámica Flotante (Thoth-Tech Style) */}
          <div className="absolute top-4 right-4 bg-[#0b0f19]/95 border border-[#D4AF37]/35 p-3 rounded-xl backdrop-blur-lg shadow-xl text-[10px] flex flex-col gap-2 max-w-[190px] z-20">
            <span className="font-bold text-[#D4AF37] uppercase tracking-wider border-b border-[#D4AF37]/20 pb-1.5 flex items-center gap-1.5 font-mono">
              <Layers size={11} /> Simbología
            </span>
            {viewMode === 'voto' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span>Voto Gobierno (Morena)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
                  <span>Voto Oposición</span>
                </div>
              </div>
            )}
            {viewMode === 'aprobacion' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span>Aprobación Alta (&gt;70%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#eab308] shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
                  <span>Aprobación Media (40%-70%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                  <span>Aprobación Crítica (&lt;40%)</span>
                </div>
              </div>
            )}
            {viewMode === 'estres' && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
                  <span>Estrés Alto (&gt;65%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_6px_rgba(249,115,22,0.5)]" />
                  <span>Estrés Moderado (35%-65%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                  <span>Estrés Bajo (&lt;35%)</span>
                </div>
              </div>
            )}
            <div className="border-t border-slate-800/80 pt-1.5 mt-0.5 text-slate-400 flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span>🟢</span>
                <span>Tamaño = Peso de Población</span>
              </div>
              <div className="flex items-center gap-1">
                <span>😡 / 😊</span>
                <span>Ánimo Extremo en vivo</span>
              </div>
              <div className="flex items-center gap-1 border-t border-slate-800/50 pt-1 mt-0.5 text-slate-500 font-mono text-[8px]">
                <span>Noroeste = Top de Rejilla</span>
              </div>
            </div>
          </div>

          {/* Menú de Herramientas para colocar en mapa */}
          <div className="absolute bottom-4 left-4 flex gap-2 bg-[#0b0f19]/90 border border-[#1e293b]/80 p-2 rounded-xl backdrop-blur-lg shadow-xl z-20">
            <button 
              onClick={() => setToolActive(toolActive === 'well' ? null : 'well')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${toolActive === 'well' ? 'bg-[#0284c7] text-white font-bold' : 'bg-[#0f172a] hover:bg-[#1e293b] text-slate-300'}`}
            >
              <Droplet size={14} /> Colocar Pozo
            </button>
            <button 
              onClick={() => setToolActive(toolActive === 'closure' ? null : 'closure')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${toolActive === 'closure' ? 'bg-[#ef4444] text-white font-bold' : 'bg-[#0f172a] hover:bg-[#1e293b] text-slate-300'}`}
            >
              <Construction size={14} /> Obras Viales
            </button>
            <button 
              onClick={() => setToolActive(toolActive === 'bridge' ? null : 'bridge')}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${toolActive === 'bridge' ? 'bg-[#10b981] text-white font-bold' : 'bg-[#0f172a] hover:bg-[#1e293b] text-slate-300'}`}
            >
              <Plus size={14} /> Puente 3D
            </button>
          </div>

          <button 
            onClick={handleReset} 
            className="absolute bottom-4 right-4 text-xs bg-[#0f172a] hover:bg-[#ef4444]/20 hover:text-[#ef4444] text-slate-400 border border-[#1e293b] px-3 py-1.5 rounded-lg transition z-20"
          >
            Limpiar Obras
          </button>
        </div>

        {/* Consola integrada en tiempo real */}
        <div className="bg-[#04060b] border-t border-[#1e293b]/50 p-4 font-mono text-[11px] h-[120px] overflow-y-auto">
          <div className="text-slate-500 mb-1 flex items-center justify-between border-b border-[#1e293b]/30 pb-1">
            <span>📟 EVENTOS SIMULADOS EN TIEMPO REAL</span>
            <span>Estable: Sonora 1.0</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className={`py-0.5 ${i === 0 ? 'text-[#38bdf8] font-bold' : 'text-slate-400'}`}>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Barra de Herramientas y Mapeo de Políticas */}
      <div className="w-full lg:w-[360px] flex flex-col gap-6">

        {/* 🌀 Gestor de Multiversos (Líneas Temporales Divergentes) */}
        <div className="bg-[#090d16] border border-[#1e293b]/60 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-[#1e293b] pb-2 flex items-center justify-between">
            <span>🌀 Gestor de Multiversos</span>
            <span className="text-[10px] bg-[#38bdf8]/10 text-[#38bdf8] px-2 py-0.5 rounded-full font-mono font-bold">
              {timelines.length} Hilos
            </span>
          </h3>

          <div className="flex flex-col gap-2">
            <span className="text-[10px] text-slate-500 font-bold block">SELECCIÓN DE LÍNEA TEMPORAL</span>
            <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
              {timelines.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => handleTimelineChange(t.id)}
                  className={`flex flex-col p-2.5 rounded-xl border cursor-pointer transition ${activeTimeline === t.id ? 'bg-[#38bdf8]/10 border-[#38bdf8] text-white shadow-[0_0_12px_rgba(56,189,248,0.15)]' : 'bg-[#0b0f19] border-[#1e293b]/40 text-slate-400 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5">
                      {t.id === 'realidad_base' ? '🌐' : '🌀'} {t.name}
                    </span>
                    {t.id !== 'realidad_base' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTimeline(t.id);
                        }}
                        className="text-slate-500 hover:text-red-400 text-xs px-1 transition"
                        title="Eliminar línea temporal"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 block">
                    Felicidad: <span className="text-[#10b981] font-bold">{t.global_metrics?.avg_happiness?.toFixed(1)}%</span> | Aprob: <span className="text-[#38bdf8] font-bold">{t.global_metrics?.avg_gov_approval?.toFixed(1)}%</span>
                  </span>
                  
                  {/* Pequeña barra visual de felicidad comparativa */}
                  <div className="w-full bg-slate-800/40 h-1 rounded-full overflow-hidden mt-1.5 flex">
                    <div className="bg-[#10b981] h-full" style={{ width: `${t.global_metrics?.avg_happiness || 50}%` }} />
                    <div className="bg-slate-700 h-full flex-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleCreateTimeline} className="flex gap-2 border-t border-[#1e293b]/30 pt-3">
            <input 
              type="text" 
              placeholder="Nombre del nuevo universo..."
              value={newTimelineName}
              onChange={(e) => setNewTimelineName(e.target.value)}
              className="bg-[#0b0f19] text-xs border border-[#1e293b]/50 rounded-lg px-2.5 py-1.5 outline-none flex-1 focus:border-[#38bdf8] text-slate-200"
            />
            <button 
              type="submit"
              className="bg-[#38bdf8]/20 hover:bg-[#38bdf8]/35 text-[#38bdf8] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#38bdf8]/30 transition flex items-center gap-1 shrink-0"
            >
              Clonar
            </button>
          </form>
        </div>
        
        {/* Métricas Globales en tiempo real */}
        <div className="bg-[#090d16] border border-[#1e293b]/60 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-[#1e293b] pb-2">
            📈 Indicadores del Mundo
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0b0f19] p-3 border border-[#1e293b]/40 rounded-xl">
              <span className="text-[10px] text-slate-500 block">FELICIDAD PROMEDIO</span>
              <span className="text-xl font-bold text-[#10b981]">
                {globalMetrics.avg_happiness?.toFixed(1)}%
              </span>
            </div>
            
            <div className="bg-[#0b0f19] p-3 border border-[#1e293b]/40 rounded-xl">
              <span className="text-[10px] text-slate-500 block">INTENCIÓN DE VOTO (GOB)</span>
              <span className="text-xl font-bold text-[#38bdf8]">
                {globalMetrics.vote_share?.Morena?.toFixed(1)}%
              </span>
            </div>

            <div className="bg-[#0b0f19] p-3 border border-[#1e293b]/40 rounded-xl">
              <span className="text-[10px] text-slate-500 block">DOLOR DE AGUA</span>
              <span className="text-lg font-semibold text-[#f97316]">
                {globalMetrics.avg_water_pain?.toFixed(1)}%
              </span>
            </div>

            <div className="bg-[#0b0f19] p-3 border border-[#1e293b]/40 rounded-xl">
              <span className="text-[10px] text-slate-500 block">APROBACIÓN GOBIERNO</span>
              <span className={`text-lg font-semibold ${(globalMetrics.avg_gov_approval || 50) > 50 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                {(globalMetrics.avg_gov_approval || 50).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Sliders de gobernanza municipal */}
        <div className="bg-[#090d16] border border-[#1e293b]/60 p-5 rounded-2xl shadow-xl flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-[#1e293b] pb-2">
            ⚙️ Leyes y Políticas Municipales
          </h3>
          
          {/* Sliders */}
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Impuestos Municipales</span>
                <span className="text-[#38bdf8] font-mono">{taxes}%</span>
              </div>
              <input 
                type="range" 
                min={5} 
                max={25} 
                value={taxes} 
                onChange={(e) => handlePolicyChange('taxes', Number(e.target.value))}
                className="w-full h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Impacta el PIB municipal y la tasa de pobreza extrema
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Presupuesto de Seguridad</span>
                <span className="text-[#38bdf8] font-mono">{securityBudget}%</span>
              </div>
              <input 
                type="range" 
                min={20} 
                max={95} 
                value={securityBudget} 
                onChange={(e) => handlePolicyChange('security', Number(e.target.value))}
                className="w-full h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Despliega patrullas y mitiga la tasa de delincuencia
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Subsidio Hidráulico</span>
                <span className="text-[#38bdf8] font-mono">{waterSubsidy}%</span>
              </div>
              <input 
                type="range" 
                min={10} 
                max={80} 
                value={waterSubsidy} 
                onChange={(e) => handlePolicyChange('subsidy', Number(e.target.value))}
                className="w-full h-1 bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#38bdf8]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Mitiga el dolor de agua de zonas marginadas
              </span>
            </div>
          </div>
        </div>

        {/* Panel de Detalles del Agente Seleccionado */}
        <div className="bg-[#090d16] border border-[#1e293b]/60 p-5 rounded-2xl shadow-xl flex-1 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider border-b border-[#1e293b] pb-2">
            🕵️ Perfil del Ciudadano
          </h3>
          
          {selectedAgent ? (
            <div className="flex flex-col gap-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Ciudadano ID:</span>
                <span className="font-semibold text-[#38bdf8]">#{selectedAgent.agent_id}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Población Representada:</span>
                <span className="font-semibold text-slate-200">{selectedAgent.weight || 10} personas</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Sector Social:</span>
                <span className="font-semibold text-slate-200 capitalize">{selectedAgent.sector}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Dolor de Tránsito:</span>
                <span className={`font-semibold ${selectedAgent.transit_pain > 60 ? 'text-[#ef4444]' : 'text-slate-300'}`}>
                  {selectedAgent.transit_pain?.toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Frustración Social:</span>
                <span className={`font-semibold ${(selectedAgent.frustration || 0) > 60 ? 'text-[#ef4444]' : 'text-[#f97316]'}`}>
                  {(selectedAgent.frustration || 0).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Estrés Económico:</span>
                <span className={`font-semibold ${(selectedAgent.economic_stress || 50) > 60 ? 'text-[#ef4444]' : 'text-slate-300'}`}>
                  {(selectedAgent.economic_stress || 50).toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-[#1e293b]/40 pt-2.5">
                <span className="text-slate-400">Aprobación de Gobierno:</span>
                <span className={`text-sm font-bold ${(selectedAgent.government_approval || 50) > 50 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {(selectedAgent.government_approval || 50).toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Preferencia Voto:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedAgent.vote_intention === 'Morena' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f97316]/20 text-[#f97316]'}`}>
                  {selectedAgent.vote_intention === 'Morena' ? 'GOBIERNO' : 'OPOSICIÓN'}
                </span>
              </div>

              {/* 🧬 El Destino de Roy (Comparativa de Multiversos) */}
              {agentComparison && Object.keys(agentComparison).length > 1 && (
                <div className="border-t border-[#1e293b]/40 pt-3.5 mt-1.5 flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">🧬 El Destino de Roy:</span>
                  <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                    {Object.values(agentComparison).map(c => (
                      <div key={c.timeline_id} className="bg-[#0b0f19] p-2 border border-[#1e293b]/30 rounded-xl flex flex-col gap-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-300">
                            {c.timeline_id === activeTimeline ? '⭐ ' : ''}{c.timeline_name}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${c.vote_intention === 'Morena' ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-[#f97316]/20 text-[#f97316]'}`}>
                            {c.vote_intention === 'Morena' ? 'GOBIERNO' : 'OPOSICIÓN'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-400">
                          <div>Fel: <span className="text-[#10b981] font-bold font-mono">{c.happiness?.toFixed(0)}%</span></div>
                          <div>Estrés: <span className="text-[#ef4444] font-bold font-mono">{c.economic_stress?.toFixed(0)}%</span></div>
                          <div>Aprob: <span className="text-[#38bdf8] font-bold font-mono">{c.government_approval?.toFixed(0)}%</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-500 text-center py-8 text-xs flex flex-col items-center gap-2">
              <HelpCircle size={28} className="text-slate-600" />
              <span>Da clic sobre algún agente (punto de color) en el canvas isométrico para auditar sus condiciones de vida.</span>
            </div>
          )}
        </div>

        {/* 3. Panel OSINT: Gartner Radar */}
        <GartnerRadar events={macroEvents} />

      </div>

    </div>
  );
};

export default WorldBoxSimulator;
