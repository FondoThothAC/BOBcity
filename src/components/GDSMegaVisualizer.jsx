// src/components/GDSMegaVisualizer.jsx
// Premium GDS-MEGA 1024-Parameter Ontology Visualizer
// Conforms to Google Research First-Principles & Mechanism Design methodology

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  User, 
  MapPin, 
  Sliders, 
  Activity, 
  Flame, 
  Database, 
  TrendingUp, 
  Heart, 
  ShieldAlert, 
  AlertTriangle,
  RotateCcw,
  Zap,
  Droplet,
  Compass,
  CheckCircle2,
  HelpCircle,
  Edit2,
  Save,
  Network,
  Play,
  Pause,
  Download
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';

export default function GDSMegaVisualizer({ agents, setAgents }) {
  // 1. Core State
  const [selectedAgentId, setSelectedAgentId] = useState(agents[0]?.id || '');
  const [activeDomain, setActiveDomain] = useState('DEM_ADV');
  const [isEditingAgent, setIsEditingAgent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 2. Sandbox (First Principles & Mechanism Design) Controls
  const [sandboxTemp, setSandboxTemp] = useState(32); // Default July Temp: 32C
  const [sandboxSubsidio, setSandboxSubsidio] = useState(1.40); // CFE subsidy index
  const [sandboxInversionAgua, setSandboxInversionAgua] = useState(30); // MD USD
  const [sandboxRadiacion, setSandboxRadiacion] = useState(600); // W/m^2 solar radiation
  const [sandboxPresionAgua, setSandboxPresionAgua] = useState(80); // % water pressure
  const [appliedMechanisms, setAppliedMechanisms] = useState({
    solarSubsidio: false,
    flatTarif: false,
    waterVouchers: false
  });

  // 2.5. Emergence Town & Multi-Year Evolution States
  const [timeScale, setTimeScale] = useState('1year'); // '1year' | '5years' | '10years'
  const [currentStep, setCurrentStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [evolutionHistory, setEvolutionHistory] = useState([]);
  const [archivedSimulations, setArchivedSimulations] = useState([
    {
      id: "SIM-HIST-01",
      timestamp: "2026-05-17 22:45",
      name: "Hermosillo Histórico - Censo INEGI 2020",
      scale: "1 Año - Mensual",
      params: { temp: 28, subsidio: 1.80, water: 25, radiacion: 450, presion: 85 },
      interventions: { solar: "No", flat: "No", waterV: "No" },
      results: { happiness: 65, descontento: 22, incidents: 18 },
      history: [
        { label: 'Mes 1', bienestar: 65, apagones: 15, disturbios: 10, polarizacion: 45 },
        { label: 'Mes 3', bienestar: 64, apagones: 16, disturbios: 11, polarizacion: 46 },
        { label: 'Mes 6', bienestar: 63, apagones: 15, disturbios: 12, polarizacion: 48 },
        { label: 'Mes 9', bienestar: 64, apagones: 14, disturbios: 11, polarizacion: 47 },
        { label: 'Mes 12', bienestar: 65, apagones: 13, disturbios: 10, polarizacion: 45 }
      ]
    },
    {
      id: "SIM-HIST-02",
      timestamp: "2026-05-18 01:10",
      name: "Simulación Colapso Autónomo (Sin Contención)",
      scale: "10 Años - Anual",
      params: { temp: 48, subsidio: 0.90, water: 12, radiacion: 950, presion: 20 },
      interventions: { solar: "No", flat: "No", waterV: "No" },
      results: { happiness: 12, descontento: 88, incidents: 92 },
      history: [
        { label: 'Año 1', bienestar: 45, apagones: 30, disturbios: 25, polarizacion: 50 },
        { label: 'Año 3', bienestar: 35, apagones: 45, disturbios: 42, polarizacion: 60 },
        { label: 'Año 5', bienestar: 25, apagones: 65, disturbios: 60, polarizacion: 75 },
        { label: 'Año 8', bienestar: 18, apagones: 80, disturbios: 78, polarizacion: 88 },
        { label: 'Año 10', bienestar: 10, apagones: 95, disturbios: 92, polarizacion: 98 }
      ]
    }
  ]);

  // Local agent edit states
  const [editIncome, setEditIncome] = useState(0);
  const [editWaterPain, setEditWaterPain] = useState(0);
  const [editTransitPain, setEditTransitPain] = useState(0);
  const [editSafetyPain, setEditSafetyPain] = useState(0);

  // Selected agent object
  const selectedAgent = agents.find(a => a.id === selectedAgentId) || agents[0];

  // 3. Real-world Baseline profiles (INEGI, CFE, CONAGUA)
  const baselines = {
    inegi: {
      name: "Censo INEGI 2020",
      temp: 28,
      subsidio: 1.80,
      inversion: 25,
      desc: "Línea base histórica según datos del Censo de Población y Vivienda INEGI."
    },
    cfeSummer: {
      name: "CFE Subsidio Verano",
      temp: 42,
      subsidio: 2.20,
      inversion: 35,
      desc: "Simulación de pico térmico con tarifa 1F activa y subsidio federal en Hermosillo."
    },
    conaguaHeatwave: {
      name: "Ola de Calor Extrema",
      temp: 48,
      subsidio: 0.90,
      inversion: 12,
      desc: "Ola de calor récord de 48°C con baja presión hídrica y recortes de transformadores."
    }
  };

  const loadBaseline = (key) => {
    const base = baselines[key];
    setSandboxTemp(base.temp);
    setSandboxSubsidio(base.subsidio);
    setSandboxInversionAgua(base.inversion);

    const toastEvent = new CustomEvent('civic-toast', {
      detail: {
        message: `Línea Base [${base.name}] cargada con éxito.`,
        type: 'info'
      }
    });
    window.dispatchEvent(toastEvent);
  };

  // Sync editing fields with selected agent
  useEffect(() => {
    if (selectedAgent) {
      setEditIncome(selectedAgent.income || 14500);
      setEditWaterPain(selectedAgent.waterPain !== undefined ? selectedAgent.waterPain : 0.5);
      setEditTransitPain(selectedAgent.transitPain !== undefined ? selectedAgent.transitPain : 0.4);
      setEditSafetyPain(selectedAgent.safetyPain !== undefined ? selectedAgent.safetyPain : 0.6);
    }
  }, [selectedAgentId]);

  // Macro-Domains Definition (GDS-MEGA 10 Macro-Domains)
  const macroDomains = [
    { id: 'DEM_ADV', name: 'DEM_ADV: Demografía Avanzada', icon: User, color: 'var(--neon-blue)', params: 100 },
    { id: 'ECO_DOM', name: 'ECO_DOM: Economía Doméstica', icon: TrendingUp, color: 'var(--neon-emerald)', params: 100 },
    { id: 'ECO_MAC', name: 'ECO_MAC: Macroeconomía y Pymes', icon: Database, color: 'var(--neon-purple)', params: 100 },
    { id: 'NET_DIG', name: 'NET_DIG: Redes y Cámaras de Eco', icon: Network, color: 'var(--neon-pink)', params: 100 },
    { id: 'POL_CIV', name: 'POL_CIV: Preferencia e Historial Cívico', icon: Sparkles, color: 'var(--neon-amber)', params: 100 },
    { id: 'SEG_PUB', name: 'SEG_PUB: Seguridad y Exposición', icon: ShieldAlert, color: 'var(--neon-rose)', params: 100 },
    { id: 'CLI_ENV', name: 'CLI_ENV: Clima y Ecosistema', icon: Flame, color: '#f97316', params: 100 },
    { id: 'INF_ENG', name: 'INF_ENG: Infraestructura y Servicios', icon: Zap, color: '#eab308', params: 100 },
    { id: 'WEL_PSY', name: 'WEL_PSY: Salud y Psicología Social', icon: Heart, color: '#ec4899', params: 100 },
    { id: 'EDU_CAP', name: 'EDU_CAP: Educación y Capital Humano', icon: Compass, color: '#06b6d4', params: 124 }
  ];

  // Domain details to mock GDS-MEGA 5 subdomains for each macro-domain
  const subDomains = {
    DEM_ADV: [
      { id: 'DEM_01', name: 'Identidad y Género', defaultVal: '98%', status: 'Normal' },
      { id: 'DEM_02', name: 'Longevidad y Edad', defaultVal: 'Hermosillo Prom. 31 años', status: 'Normal' },
      { id: 'DEM_03', name: 'Parentesco y Composición', defaultVal: '3.6 personas/hogar', status: 'Normal' },
      { id: 'DEM_04', name: 'Migración y Flujos', defaultVal: '+1.8% anual', status: 'Normal' },
      { id: 'DEM_05', name: 'Diversidad Etnocultural', defaultVal: '0.45 Gini etnicidad', status: 'Normal' }
    ],
    ECO_DOM: [
      { id: 'ECO_01', name: 'Ingresos y Remesas', defaultVal: '$14,500/mes prom.', status: 'Normal' },
      { id: 'ECO_02', name: 'Gastos Fijos y Renta', defaultVal: '42% del ingreso', status: 'Alerta' },
      { id: 'ECO_03', name: 'Crédito y Deuda', defaultVal: '65% endeudamiento', status: 'Crítico' },
      { id: 'ECO_04', name: 'Tasa de Ahorros', defaultVal: '3.2% remanente', status: 'Alerta' },
      { id: 'ECO_05', name: 'Vulnerabilidad Alimentaria', defaultVal: '14.2% rezago', status: 'Normal' }
    ],
    NET_DIG: [
      { id: 'NET_01', name: 'Algoritmos y TikTok Index', defaultVal: '78 min/día prom.', status: 'Alerta' },
      { id: 'NET_02', name: 'Centralidad Grafo Social', defaultVal: '0.045 centralidad', status: 'Normal' },
      { id: 'NET_03', name: 'Fake News Ingesta', defaultVal: '34% credibilidad', status: 'Crítico' },
      { id: 'NET_04', name: 'Cámara de Eco Político', defaultVal: '84% polarización', status: 'Crítico' },
      { id: 'NET_05', name: 'Adopción IA y Automatización', defaultVal: '12% riesgo laboral', status: 'Normal' }
    ]
  };

  // Helper for status colors
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Normal': return { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--neon-emerald)', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'Alerta': return { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--neon-amber)', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'Crítico': return { background: 'rgba(239, 68, 68, 0.1)', color: 'var(--neon-rose)', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default: return { background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' };
    }
  };

  // 4. Dynamic First-Principles Engine Calculation
  const calculateDynamicMetrics = () => {
    // Basic First Principles math matching GDS_MEGA_SCHEMA.md
    let macroHappiness = 60.5;
    let incidentRate = 18.2;
    let energyDescontento = 22.5;

    // Effect of Temperature (First principles heat stress)
    if (sandboxTemp > 38) {
      macroHappiness -= (sandboxTemp - 38) * 2.5;
      energyDescontento += (sandboxTemp - 38) * 4.5;
    } else if (sandboxTemp < 20) {
      macroHappiness -= (20 - sandboxTemp) * 0.5;
    }

    // Effect of CFE Subsidies
    const subDiff = 1.80 - sandboxSubsidio;
    macroHappiness -= subDiff * 15;
    energyDescontento += subDiff * 25;

    // Effect of Water Investment
    if (sandboxInversionAgua < 20) {
      macroHappiness -= (20 - sandboxInversionAgua) * 1.8;
      incidentRate += (20 - sandboxInversionAgua) * 2.2;
    } else {
      macroHappiness += (sandboxInversionAgua - 20) * 0.4;
    }

    // New variables: Solar Radiation & Water Pressure
    const radFactor = sandboxRadiacion / 600;
    
    // Solar efficiency modifiers
    if (appliedMechanisms.solarSubsidio) {
      macroHappiness += 8 * radFactor;
      energyDescontento -= 18 * radFactor;
    } else if (sandboxRadiacion > 700) {
      // Heat/thermal stress without panels
      macroHappiness -= (sandboxRadiacion - 700) * 0.03;
      energyDescontento += (sandboxRadiacion - 700) * 0.05;
    }

    // Water pressure flow tandeo modifiers
    if (sandboxPresionAgua < 60) {
      macroHappiness -= (60 - sandboxPresionAgua) * 0.6;
      incidentRate += (60 - sandboxPresionAgua) * 0.8;
    } else if (sandboxPresionAgua > 80) {
      macroHappiness += (sandboxPresionAgua - 80) * 0.15;
    }

    // Other mechanisms modifiers
    if (appliedMechanisms.flatTarif) {
      macroHappiness += 5;
      energyDescontento -= 12;
    }
    if (appliedMechanisms.waterVouchers) {
      macroHappiness += 7;
      incidentRate -= 10;
    }

    // Bounds checking
    macroHappiness = Math.max(5, Math.min(99, Math.round(macroHappiness)));
    energyDescontento = Math.max(5, Math.min(99, Math.round(energyDescontento)));
    incidentRate = Math.max(2, Math.min(95, Math.round(incidentRate)));

    // Electoral intent logit proxy
    const votesMorena = Math.max(10, Math.min(90, Math.round(macroHappiness * 0.7 + (appliedMechanisms.solarSubsidio ? 5 : 0) - (sandboxTemp > 45 ? 12 : 0))));
    const votesOpposition = 100 - votesMorena;

    return {
      happiness: macroHappiness,
      descontento: energyDescontento,
      incidents: incidentRate,
      votesMorena,
      votesOpposition
    };
  };

  const metrics = calculateDynamicMetrics();

  // 4.5. Emergence & Multi-Year Evolution Simulator Engine
  const generateEvolutionData = (temp, subsidio, water, radiacion, presion, mechanisms, scale) => {
    const stepsCount = scale === '1year' ? 12 : (scale === '5years' ? 5 : 10);
    const labelPrefix = scale === '1year' ? 'Mes' : 'Año';
    const data = [];

    // Initial base state based on currently selected values
    let currentHappiness = metrics.happiness;
    let baseApagones = metrics.incidents * 0.8;
    let baseDisturbios = metrics.incidents * 0.7;
    let basePolarizacion = 45;

    for (let step = 1; step <= stepsCount; step++) {
      // Cumulative effects over time
      let heatStress = Math.max(0, temp - 38) * 1.5;
      let subsidyGap = Math.max(0, 1.80 - subsidio) * 8;
      let waterDeficit = Math.max(0, 20 - water) * 1.2;
      let pressureDeficit = Math.max(0, 70 - presion) * 0.8;

      // Interventions mitigations
      const radFactor = radiacion / 600;
      let solarMitigation = mechanisms.solarSubsidio ? (0.85 * radFactor) : 0.0;
      let tariffMitigation = mechanisms.flatTarif ? 0.75 : 0.0;
      let waterMitigation = mechanisms.waterVouchers ? 0.80 : 0.0;

      // 1. Grid Blackout Risk: Compounds over time under heat stress (thermal cumulative overload)
      let apagonesVal = baseApagones + (heatStress * 2.8 * step * (1 - solarMitigation));
      if (temp > 45 && !mechanisms.solarSubsidio) {
        apagonesVal += step * 3.5; // Exponential cascade if heatwave is extreme
      }
      apagonesVal = Math.max(2, Math.min(99, Math.round(apagonesVal)));

      // 2. Riot/Disturbios/Vandalism Risk: Triggers if water/electricity is in chronic deficit
      let disturbiosVal = baseDisturbios + (waterDeficit * 2.5 * step * (1 - waterMitigation)) + (subsidyGap * 1.5 * step * (1 - tariffMitigation)) + (pressureDeficit * 2.2 * step);
      if (apagonesVal > 50) {
        disturbiosVal += (apagonesVal - 50) * 0.8; // Grid failure triggers urban arson risk
      }

      // Estimate initial polarization to capture ambient social tension
      let polarizacionVal = basePolarizacion + (step * 2.5) + (disturbiosVal * 0.3) - (mechanisms.solarSubsidio || mechanisms.flatTarif ? step * 0.8 : 0);
      polarizacionVal = Math.max(10, Math.min(99, Math.round(polarizacionVal)));

      // Non-linear feedback loop coupling: If polarization exceeds 80%, it triggers a massive spike in vandalism/urban rage (1.8x)
      if (polarizacionVal > 80) {
        disturbiosVal += (polarizacionVal - 80) * 1.8;
      }
      disturbiosVal = Math.max(1, Math.min(98, Math.round(disturbiosVal)));

      // Re-update polarization to reflect the amplified vandalism/arson spike
      polarizacionVal = basePolarizacion + (step * 2.5) + (disturbiosVal * 0.3) - (mechanisms.solarSubsidio || mechanisms.flatTarif ? step * 0.8 : 0);
      polarizacionVal = Math.max(10, Math.min(99, Math.round(polarizacionVal)));

      // 4. Stabilized Collective Happiness: Decays due to the other stress parameters
      let happinessVal = currentHappiness - (apagonesVal * 0.2) - (disturbiosVal * 0.25) - (polarizacionVal * 0.1) + (mechanisms.solarSubsidio ? 6 : 0) + (mechanisms.waterVouchers ? 4 : 0);
      happinessVal = Math.max(5, Math.min(99, Math.round(happinessVal)));

      data.push({
        label: `${labelPrefix} ${step}`,
        bienestar: happinessVal,
        apagones: apagonesVal,
        disturbios: disturbiosVal,
        polarizacion: polarizacionVal
      });
    }

    return data;
  };

  // Sync evolution history when sliders or scales change
  useEffect(() => {
    const history = generateEvolutionData(sandboxTemp, sandboxSubsidio, sandboxInversionAgua, sandboxRadiacion, sandboxPresionAgua, appliedMechanisms, timeScale);
    setEvolutionHistory(history);
    setCurrentStep(history.length); // Prefill completely
  }, [sandboxTemp, sandboxSubsidio, sandboxInversionAgua, sandboxRadiacion, sandboxPresionAgua, appliedMechanisms, timeScale]);

  // Handle Playback Loop Animation
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= evolutionHistory.length) {
            setIsSimulating(false);
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, 550);
    }
    return () => clearInterval(interval);
  }, [isSimulating, evolutionHistory]);

  const startAnimatedSimulation = () => {
    setCurrentStep(1);
    setIsSimulating(true);
  };

  const archiveCurrentSimulation = () => {
    const runId = `SIM-HIST-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    // Get last step values for overall results
    const lastStep = evolutionHistory[evolutionHistory.length - 1] || { bienestar: 50, apagones: 10, disturbios: 10 };

    const newRun = {
      id: runId,
      timestamp: formattedDate,
      name: `Simulación Hermosillo (Temp ${sandboxTemp}°C, Agua $${sandboxInversionAgua}M)`,
      scale: timeScale === '1year' ? "1 Año - Mensual" : (timeScale === '5years' ? "5 Años - Anual" : "10 Años - Anual"),
      params: { temp: sandboxTemp, subsidio: sandboxSubsidio, water: sandboxInversionAgua, radiacion: sandboxRadiacion, presion: sandboxPresionAgua },
      interventions: {
        solar: appliedMechanisms.solarSubsidio ? "Sí" : "No",
        flat: appliedMechanisms.flatTarif ? "Sí" : "No",
        waterV: appliedMechanisms.waterVouchers ? "Sí" : "No"
      },
      results: {
        happiness: lastStep.bienestar,
        descontento: lastStep.apagones,
        incidents: lastStep.disturbios
      },
      history: [...evolutionHistory]
    };

    setArchivedSimulations([newRun, ...archivedSimulations]);

    const toastEvent = new CustomEvent('civic-toast', {
      detail: {
        message: `💾 Simulación [${runId}] archivada con éxito para consulta histórica.`,
        type: 'success'
      }
    });
    window.dispatchEvent(toastEvent);
  };

  const loadArchivedSimulation = (run) => {
    setSandboxTemp(run.params.temp);
    setSandboxSubsidio(run.params.subsidio);
    setSandboxInversionAgua(run.params.water);
    setSandboxRadiacion(run.params.radiacion || 600);
    setSandboxPresionAgua(run.params.presion || 80);
    setAppliedMechanisms({
      solarSubsidio: run.interventions.solar === "Sí",
      flatTarif: run.interventions.flat === "Sí",
      waterVouchers: run.interventions.waterV === "Sí"
    });
    setTimeScale(run.scale.includes("1 Año") ? "1year" : (run.scale.includes("5 Años") ? "5years" : "10years"));
    setEvolutionHistory(run.history);
    setCurrentStep(run.history.length);

    const toastEvent = new CustomEvent('civic-toast', {
      detail: {
        message: `📥 Ejecución histórica [${run.id}] cargada y restaurada en los controles.`,
        type: 'info'
      }
    });
    window.dispatchEvent(toastEvent);
  };

  // Slice history based on active playback step to draw the graph step-by-step
  const visibleHistory = evolutionHistory.slice(0, currentStep);

  // Slider color depending on normal bounds
  const getTempSliderColor = (val) => {
    if (val <= 35) return 'var(--neon-emerald)'; // Green normal
    if (val <= 42) return 'var(--neon-amber)'; // Amber warming
    return 'var(--neon-rose)'; // Red heat stress
  };

  const getSubsidioSliderColor = (val) => {
    if (val >= 1.6) return 'var(--neon-emerald)'; // Green good subsidy
    if (val >= 1.0) return 'var(--neon-amber)'; // Amber minimal subsidy
    return 'var(--neon-rose)'; // Red no subsidy
  };

  const getWaterSliderColor = (val) => {
    if (val >= 25) return 'var(--neon-emerald)'; // Green normal
    if (val >= 15) return 'var(--neon-amber)'; // Amber caution
    return 'var(--neon-rose)'; // Red deficit
  };

  const getRadiacionSliderColor = (val) => {
    if (val <= 500) return 'var(--neon-emerald)'; // Low radiation
    if (val <= 800) return 'var(--neon-amber)'; // Mid-to-high summer sun
    return 'var(--neon-rose)'; // Extreme UV hazard
  };

  const getPresionSliderColor = (val) => {
    if (val >= 70) return 'var(--neon-emerald)'; // Solid flow pressure
    if (val >= 50) return 'var(--neon-amber)'; // Low flow warning
    return 'var(--neon-rose)'; // Critical tandeo deficit
  };

  // Micro-level edit agent persistence
  const saveAgentEdits = () => {
    const updatedAgents = agents.map(a => {
      if (a.id === selectedAgent.id) {
        return {
          ...a,
          income: editIncome,
          waterPain: editWaterPain,
          transitPain: editTransitPain,
          safetyPain: editSafetyPain,
          // Propagate change to happiness
          happiness: Math.round(100 - (editWaterPain + editTransitPain + editSafetyPain) / 3 * 100)
        };
      }
      return a;
    });

    setAgents(updatedAgents);
    setIsEditingAgent(false);

    const toastEvent = new CustomEvent('civic-toast', {
      detail: {
        message: `Agente Sintético [${selectedAgent.id}] guardado y recalculado. Macro-promedios actualizados.`,
        type: 'success'
      }
    });
    window.dispatchEvent(toastEvent);
  };

  // Geohash visual grid simulator (representing spatial 5x5m mapping)
  const getGeohashPoints = (geohash) => {
    if (!geohash) return [];
    // Seeded random points generation based on geohash string to create persistent visual maps
    const points = [];
    let seed = geohash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < 9; i++) {
      seed = (seed * 9301 + 49297) % 233280;
      const x = 10 + (seed % 80);
      seed = (seed * 9301 + 49297) % 233280;
      const y = 10 + (seed % 80);
      points.push({ x, y, id: i });
    }
    return points;
  };

  const geohashGridPoints = getGeohashPoints(selectedAgent?.geohash_residence || 'd5fp7y4w3');

  // Cognitive Biases definitions for selected agent
  const getCognitiveBiases = (agent) => {
    // Generate simulated cognitive biases based on agent ID / characteristics
    let seed = agent ? agent.id.toString().split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) : 100;
    const lcg = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    return [
      { subject: 'Confirmación', A: Math.round(lcg() * 100) },
      { subject: 'Efecto Arrastre', A: Math.round(lcg() * 100) },
      { subject: 'Aversión Pérdida', A: Math.round(lcg() * 100) },
      { subject: 'Anclaje', A: Math.round(lcg() * 100) },
      { subject: 'Disponibilidad', A: Math.round(lcg() * 100) },
      { subject: 'Optimismo', A: Math.round(lcg() * 100) },
      { subject: 'Efecto Halo', A: Math.round(lcg() * 100) },
      { subject: 'Proyección', A: Math.round(lcg() * 100) }
    ];
  };

  const biasData = getCognitiveBiases(selectedAgent);

  // Historical memory events
  const historicalEvents = [
    { title: "Apagón CFE Crítico (Ola de Calor)", date: "Julio 2025", desc: "45°C sin electricidad por 18 horas. Resentimiento alto.", type: "severe", impact: -24 },
    { title: "Daño de Suspensión por Bache", date: "Octubre 2025", desc: "Bache profundo en el Geohash de Trabajo. Inseguridad vial.", type: "mild", impact: -12 },
    { title: "Subsidio de Transporte Recibido", date: "Diciembre 2025", desc: "Apoyo mensual a jóvenes. Aceptación positiva del gobierno.", type: "good", impact: 15 },
    { title: "Racionamiento de Agua Potable", date: "Febrero 2026", desc: "Corte de agua por baja presión en el sector Sur.", type: "severe", impact: -18 }
  ];

  // Filtering agents list
  const filteredAgents = agents.filter(a => {
    const q = searchQuery.toLowerCase();
    return a.id.toString().toLowerCase().includes(q) || 
           (a.sector && a.sector.toLowerCase().includes(q));
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 🔮 Top Banner: GDS-MEGA Engine Context */}
      <div className="glass-card glow-purple" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(20, 10, 45, 0.9) 0%, rgba(35, 12, 60, 0.9) 100%)',
        border: '1px solid var(--neon-purple)',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '80%' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#D4AF37' }}>
            <Sparkles size={24} color="#D4AF37" />
            Gemelo Digital Social Mega-Escala (1,024 KPIs)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Inferencia y toma de decisiones basada en <strong>Primeros Principios microeconómicos</strong> y <strong>Diseño de Mecanismos reguladores</strong>. Mapea la población sintética de Hermosillo con precisión geográfica de Geohash-9 e historiales de memorias episódicas.
          </p>
        </div>
        <div>
          <span className="tag-badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)', fontWeight: '700' }}>
            🤖 Multi-Agent 2026 Engine
          </span>
        </div>
      </div>

      {/* 📊 SECTION 1: SANDBOX DE DISEÑO DE MECANISMOS Y PRIMEROS PRINCIPIOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sliders size={18} color="var(--neon-emerald)" />
            Sandbox de Mecanismos y Restricciones Físicas (Ola de Calor 2026)
          </h3>
          
          {/* Baseline Presets */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {Object.entries(baselines).map(([key, base]) => (
              <button 
                key={key} 
                className="btn-outline" 
                onClick={() => loadBaseline(key)}
                style={{ fontSize: '0.7rem', padding: '0.35rem 0.6rem', borderColor: 'var(--border-glass)', cursor: 'pointer' }}
                title={base.desc}
              >
                📥 {base.name}
              </button>
            ))}
          </div>
        </div>

        <div className="workspace-grid-3" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1.5rem' }}>
          
          {/* Sliders de Restricciones del Entorno (Física y Macroeconomía) */}
          <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              Restricciones de Primeros Principios
            </h4>

            {/* Temperatura */}
            <div className="slider-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🌡️ Temperatura Ambiente (°C)
                  <span 
                    title="INEGI/CONAGUA: Temperatura de diseño crítico para el desabasto y demanda eléctrica en Sonora. Rango Normal de diseño: 25C a 38C." 
                    style={{ cursor: 'help', color: 'var(--text-muted)' }}
                  >
                    <HelpCircle size={12} />
                  </span>
                </span>
                <span style={{ color: getTempSliderColor(sandboxTemp) }}>{sandboxTemp}°C</span>
              </div>
              <input 
                type="range" 
                min="15" 
                max="50" 
                value={sandboxTemp}
                onChange={(e) => setSandboxTemp(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: getTempSliderColor(sandboxTemp) }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {sandboxTemp > 42 ? '🔴 Ola de calor extrema (Inferencia: transformadores sobrecargados, cortes de red).' : (sandboxTemp > 38 ? '🟡 Alerta de calor (Aumento exponencial de consumo de aire).' : '🟢 Rango normal/diseño estable.')}
              </span>
            </div>

            {/* Subsidio CFE */}
            <div className="slider-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ⚡ Factor de Subsidio CFE ($/kWh)
                  <span 
                    title="CFE Tarifa 1F: Subsidio de Verano que amortigua el presupuesto familiar contra recibos excesivos." 
                    style={{ cursor: 'help', color: 'var(--text-muted)' }}
                  >
                    <HelpCircle size={12} />
                  </span>
                </span>
                <span style={{ color: getSubsidioSliderColor(sandboxSubsidio) }}>${sandboxSubsidio.toFixed(2)}/kWh</span>
              </div>
              <input 
                type="range" 
                min="0.50" 
                max="3.00" 
                step="0.05"
                value={sandboxSubsidio}
                onChange={(e) => setSandboxSubsidio(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: getSubsidioSliderColor(sandboxSubsidio) }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {sandboxSubsidio < 1.00 ? '🔴 Subsidio insuficiente (Afectación severa al ingreso neto familiar).' : '🟢 Subsidio robusto (Alta amortiguación de gastos fijos).'}
              </span>
            </div>

            {/* Inversion Agua */}
            <div className="slider-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  💧 Presupuesto Red Hídrica (MD USD)
                  <span 
                    title="Inversión anual en acueductos, bombas y tandeos de Hermosillo. Evita recortes en el Sur (D8)." 
                    style={{ cursor: 'help', color: 'var(--text-muted)' }}
                  >
                    <HelpCircle size={12} />
                  </span>
                </span>
                <span style={{ color: getWaterSliderColor(sandboxInversionAgua) }}>${sandboxInversionAgua}M USD</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="50" 
                value={sandboxInversionAgua}
                onChange={(e) => setSandboxInversionAgua(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: getWaterSliderColor(sandboxInversionAgua) }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {sandboxInversionAgua < 18 ? '🔴 Déficit hídrico (Tandeos activos, bajan presiones en D8).' : '🟢 Infraestructura asegurada y estable.'}
              </span>
            </div>

            {/* Radiación Solar */}
            <div className="slider-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  ☀️ Radiación Solar Directa (W/m²)
                  <span 
                    title="Estación Climatológica: Intensidad de irradiancia solar en Sonora. Julio experimenta picos de hasta 950 W/m²." 
                    style={{ cursor: 'help', color: 'var(--text-muted)' }}
                  >
                    <HelpCircle size={12} />
                  </span>
                </span>
                <span style={{ color: getRadiacionSliderColor(sandboxRadiacion) }}>{sandboxRadiacion} W/m²</span>
              </div>
              <input 
                type="range" 
                min="100" 
                max="1000" 
                step="50"
                value={sandboxRadiacion}
                onChange={(e) => setSandboxRadiacion(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: getRadiacionSliderColor(sandboxRadiacion) }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {sandboxRadiacion > 800 ? '🔴 Radiación extrema (Estruendo térmico, acelera sobrecarga).' : (sandboxRadiacion > 500 ? '🟡 Radiación estival (Óptima generación para paneles solares).' : '🟢 Radiación moderada/invierno.')}
              </span>
            </div>

            {/* Presión de Tandeo */}
            <div className="slider-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  🚰 Presión de Tandeo Hídrico (%)
                  <span 
                    title="CONAGUA/Agua de Hermosillo: Presión promedio de flujo en red. Menos de 50% causa desabasto local severo en predios." 
                    style={{ cursor: 'help', color: 'var(--text-muted)' }}
                  >
                    <HelpCircle size={12} />
                  </span>
                </span>
                <span style={{ color: getPresionSliderColor(sandboxPresionAgua) }}>{sandboxPresionAgua}% ({Math.round(sandboxPresionAgua * 0.8)} PSI)</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5"
                value={sandboxPresionAgua}
                onChange={(e) => setSandboxPresionAgua(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: getPresionSliderColor(sandboxPresionAgua) }}
              />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                {sandboxPresionAgua < 50 ? '🔴 Presión crítica (Tandeos duros y desabasto micro-predio).' : (sandboxPresionAgua < 70 ? '🟡 Presión baja (Flujo intermitente en geohashes del Sur).' : '🟢 Flujo y presiones óptimas en red.')}
              </span>
            </div>

          </div>

          {/* Diseño de Mecanismos (Acciones Regulatorias sobre los Agentes) */}
          <div className="glass-card glow-purple" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              Mecanismos Incentivadores (Reglas)
            </h4>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
              Modifica las reglas del juego e inyecta incentivos microeconómicos para aliviar los cuellos de botella:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {/* Solar Panels Mechanism */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                fontSize: '0.75rem', 
                background: appliedMechanisms.solarSubsidio ? 'rgba(127, 29, 219, 0.1)' : 'rgba(0,0,0,0.2)',
                border: '1px solid',
                borderColor: appliedMechanisms.solarSubsidio ? 'var(--neon-purple)' : 'var(--border-glass)',
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}>
                <input 
                  type="checkbox" 
                  checked={appliedMechanisms.solarSubsidio}
                  onChange={(e) => setAppliedMechanisms({ ...appliedMechanisms, solarSubsidio: e.target.checked })}
                  style={{ accentColor: 'var(--neon-purple)' }}
                />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>☀️ Paneles Solares Masivos</strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Aísla el consumo térmico. ROI Social: +8% Felicidad.</span>
                </div>
              </label>

              {/* Flat Electric Tariff */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                fontSize: '0.75rem', 
                background: appliedMechanisms.flatTarif ? 'rgba(127, 29, 219, 0.1)' : 'rgba(0,0,0,0.2)',
                border: '1px solid',
                borderColor: appliedMechanisms.flatTarif ? 'var(--neon-purple)' : 'var(--border-glass)',
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}>
                <input 
                  type="checkbox" 
                  checked={appliedMechanisms.flatTarif}
                  onChange={(e) => setAppliedMechanisms({ ...appliedMechanisms, flatTarif: e.target.checked })}
                  style={{ accentColor: 'var(--neon-purple)' }}
                />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>⚡ Tarifa Plana CFE Verano</strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Fija el gasto CFE en $600/mes. Evita picos de cobro.</span>
                </div>
              </label>

              {/* Water Vouchers */}
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.6rem', 
                fontSize: '0.75rem', 
                background: appliedMechanisms.waterVouchers ? 'rgba(127, 29, 219, 0.1)' : 'rgba(0,0,0,0.2)',
                border: '1px solid',
                borderColor: appliedMechanisms.waterVouchers ? 'var(--neon-purple)' : 'var(--border-glass)',
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}>
                <input 
                  type="checkbox" 
                  checked={appliedMechanisms.waterVouchers}
                  onChange={(e) => setAppliedMechanisms({ ...appliedMechanisms, waterVouchers: e.target.checked })}
                  style={{ accentColor: 'var(--neon-purple)' }}
                />
                <div>
                  <strong style={{ display: 'block', color: 'var(--text-primary)' }}>💧 Vouchers de Pipas Gratuitas</strong>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Mecanismo de mitigación en Geohash-8 (D8).</span>
                </div>
              </label>

            </div>
          </div>

          {/* Resultados de Inferencia Predictiva Global */}
          <div className="glass-card glow-emerald" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
              Impacto Predictivo Agregado
            </h4>

            {/* KPI 1: Felicidad GDS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Felicidad Social:</span>
              <span style={{ fontSize: '1.35rem', fontWeight: '900', color: metrics.happiness > 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)' }}>
                {metrics.happiness}%
              </span>
            </div>

            {/* KPI 2: Descontento CFE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Descontento Energético:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: metrics.descontento > 40 ? 'var(--neon-rose)' : 'var(--neon-emerald)' }}>
                {metrics.descontento}%
              </span>
            </div>

            {/* KPI 3: Incidentes / Protesta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Propensión a la Protesta:</span>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: metrics.incidents > 35 ? 'var(--neon-amber)' : 'var(--neon-emerald)' }}>
                {metrics.incidents}%
              </span>
            </div>

            {/* Election logit bar representation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Previsión de Voto (Logit Multinomial):</span>
              
              <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${metrics.votesMorena}%`, background: 'var(--neon-rose)', transition: 'width 0.3s ease' }} title={`Partido Incumbente: ${metrics.votesMorena}%`} />
                <div style={{ width: `${metrics.votesOpposition}%`, background: 'var(--neon-blue)', transition: 'width 0.3s ease' }} title={`Partido Oposición: ${metrics.votesOpposition}%`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span>Incumbente: {metrics.votesMorena}%</span>
                <span>Oposición: {metrics.votesOpposition}%</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 🧬 SECTION 1.5: MOTOR DE EMERGENCIA Y EVOLUCIÓN TEMPORAL (EMERGENCE TOWN) */}
      <div className="glass-card glow-rose" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        background: 'linear-gradient(135deg, rgba(30, 10, 20, 0.65) 0%, rgba(15, 10, 30, 0.75) 100%)',
        padding: '1.5rem'
      }}>
        
        {/* Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
            <Flame size={20} color="var(--neon-rose)" />
            Motor de Emergencia y Evolución (Emergence Town Simulator)
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Escala Temporal:</span>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
              <button 
                onClick={() => { setTimeScale('1year'); }}
                style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', border: 'none', background: timeScale === '1year' ? 'var(--neon-purple)' : 'transparent', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
              >
                1 Año (Mensual)
              </button>
              <button 
                onClick={() => { setTimeScale('5years'); }}
                style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', border: 'none', background: timeScale === '5years' ? 'var(--neon-purple)' : 'transparent', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
              >
                5 Años (Anual)
              </button>
              <button 
                onClick={() => { setTimeScale('10years'); }}
                style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem', border: 'none', background: timeScale === '10years' ? 'var(--neon-purple)' : 'transparent', color: 'var(--text-primary)', borderRadius: '4px', cursor: 'pointer' }}
              >
                10 Años (Anual)
              </button>
            </div>
          </div>
        </div>

        {/* Two-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem' }}>
          
          {/* Left Column: Playback Controls and Active Emergency Risk Meters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* Playback Action Buttons */}
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)' }}>Controles del Simulador</span>
                <span style={{ 
                  fontSize: '0.6rem', 
                  padding: '0.15rem 0.4rem', 
                  borderRadius: '4px',
                  background: isSimulating ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.1)',
                  color: isSimulating ? 'var(--neon-rose)' : 'var(--neon-emerald)',
                  border: '1px solid',
                  borderColor: isSimulating ? 'var(--neon-rose)' : 'var(--neon-emerald)'
                }}>
                  {isSimulating ? "⚡ Evolución Activa" : "💤 Inactivo/Pausado"}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button 
                  onClick={startAnimatedSimulation} 
                  disabled={isSimulating}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.5rem 0.85rem', cursor: isSimulating ? 'not-allowed' : 'pointer', background: isSimulating ? 'rgba(255,255,255,0.05)' : 'var(--neon-purple)', color: 'var(--text-primary)', border: 'none', borderRadius: '4px', flex: 1 }}
                >
                  <Play size={12} fill="currentColor" />
                  Iniciar
                </button>
                <button 
                  onClick={() => setIsSimulating(false)} 
                  disabled={!isSimulating}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.5rem 0.85rem', cursor: !isSimulating ? 'not-allowed' : 'pointer', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '4px', flex: 1 }}
                >
                  <Pause size={12} fill="currentColor" />
                  Pausar
                </button>
                <button 
                  onClick={() => { setIsSimulating(false); setCurrentStep(0); }}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', padding: '0.5rem 0.6rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '4px' }}
                  title="Reiniciar Simulación"
                >
                  <RotateCcw size={12} />
                  Reiniciar
                </button>
              </div>

              {/* Progress Slider */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  <span>Progreso de Simulación:</span>
                  <strong>{currentStep} de {evolutionHistory.length} {timeScale === '1year' ? 'Meses' : 'Años'}</strong>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--neon-purple) 0%, var(--neon-rose) 100%)', 
                    width: `${evolutionHistory.length ? (currentStep / evolutionHistory.length) * 100 : 0}%`,
                    transition: 'width 0.2s ease-out'
                  }} />
                </div>
              </div>
            </div>

            {/* Active Risk Meters (Latest Visible step values) */}
            {(() => {
              const currentData = visibleHistory[visibleHistory.length - 1] || evolutionHistory[evolutionHistory.length - 1] || { bienestar: 60, apagones: 10, disturbios: 10, polarizacion: 45 };
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    🚨 Comportamientos Emergentes Críticos
                  </h4>

                  {/* Risk 1: Urban Arson/Riot Risk */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                        🔥 Vandalismo y Fuego Urbano (Arson Risk)
                      </span>
                      <strong style={{ color: currentData.disturbios > 50 ? 'var(--neon-rose)' : 'var(--neon-emerald)' }}>
                        {currentData.disturbios}%
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ 
                        height: '100%', 
                        background: currentData.disturbios > 50 ? 'var(--neon-rose)' : 'var(--neon-emerald)', 
                        width: `${currentData.disturbios}%`,
                        transition: 'width 0.3s ease-out'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {currentData.disturbios > 60 
                        ? "🔴 ALTA EMERGENCIA: Clima extremo y desabasto desatan vandalismo y robos." 
                        : "🟢 Estable: Los mecanismos de contención amortiguan el descontento."}
                    </span>
                  </div>

                  {/* Risk 2: Grid Collapse Shutdown */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                        ⚡ Colapso de Red Eléctrica (Grid Shutdown)
                      </span>
                      <strong style={{ color: currentData.apagones > 45 ? 'var(--neon-rose)' : 'var(--neon-emerald)' }}>
                        {currentData.apagones}%
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ 
                        height: '100%', 
                        background: currentData.apagones > 45 ? 'var(--neon-rose)' : 'var(--neon-emerald)', 
                        width: `${currentData.apagones}%`,
                        transition: 'width 0.3s ease-out'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {currentData.apagones > 50 
                        ? "🔴 APAGÓN EN CASCADA: Transformadores quemados por calor. Cortes forzados." 
                        : "🟢 Estable: Demanda eléctrica soportada con paneles solares."}
                    </span>
                  </div>

                  {/* Risk 3: Social Decay */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)', fontWeight: '700' }}>
                        🔮 Desintegración y Polarización (Social Decay)
                      </span>
                      <strong style={{ color: currentData.polarizacion > 65 ? 'var(--neon-amber)' : 'var(--neon-emerald)' }}>
                        {currentData.polarizacion}%
                      </strong>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.02)' }}>
                      <div style={{ 
                        height: '100%', 
                        background: currentData.polarizacion > 65 ? 'var(--neon-rose)' : 'var(--neon-emerald)', 
                        width: `${currentData.polarizacion}%`,
                        transition: 'width 0.3s ease-out'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                      {currentData.polarizacion > 70 
                        ? "🟡 ALTO SESGO: Cámaras de eco consolidadas y fractura del tejido cívico." 
                        : "🟢 Cohesión cívica estable: Confianza gubernamental preservada."}
                    </span>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Right Column: Interactive Recharts Graph and Preserved Runs Archive Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            {/* The Plot: Dynamic Evolution Line Graph */}
            <div className="glass-card" style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-glass)', borderRadius: '8px', height: '240px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Activity size={12} color="var(--neon-purple)" />
                  Curva de Trayectoria Temporal Dinámica
                </span>
                
                {/* Save Archive Button */}
                <button 
                  onClick={archiveCurrentSimulation}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', padding: '0.25rem 0.5rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-glass)', borderRadius: '4px' }}
                >
                  <Save size={10} />
                  💾 Guardar Corrida
                </button>
              </div>

              {visibleHistory.length === 0 ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '180px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                  ⚠️ Presiona "Iniciar Evolución" para visualizar la trayectoria en tiempo real.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="90%">
                  <AreaChart data={visibleHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHappiness" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-emerald)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--neon-emerald)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorApagones" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-rose)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--neon-rose)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDisturbios" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--neon-rose)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--neon-rose)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={9} />
                    <YAxis stroke="var(--text-muted)" fontSize={9} domain={[0, 100]} />
                    <RechartsTooltip contentStyle={{ background: 'rgba(15, 10, 30, 0.95)', border: '1px solid var(--neon-purple)', borderRadius: '6px', fontSize: '10px', color: 'var(--text-primary)' }} />
                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '5px' }} />
                    <Area type="monotone" name="Felicidad Colectiva" dataKey="bienestar" stroke="var(--neon-emerald)" strokeWidth={2} fillOpacity={1} fill="url(#colorHappiness)" />
                    <Area type="monotone" name="Riesgo Apagón" dataKey="apagones" stroke="var(--neon-rose)" strokeWidth={2} fillOpacity={1} fill="url(#colorApagones)" />
                    <Area type="monotone" name="Riesgo Vandalismo" dataKey="disturbios" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorDisturbios)" />
                    <Line type="monotone" name="Polarización GDS" dataKey="polarizacion" stroke="var(--neon-purple)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Preserved Runs Archive Table (Preserved runs logger) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                📂 Historial de Corridas y Simulaciones Archivadas
              </span>

              <div style={{ 
                maxHeight: '120px', 
                overflowY: 'auto', 
                background: 'rgba(0,0,0,0.3)', 
                border: '1px solid var(--border-glass)', 
                borderRadius: '6px', 
                fontSize: '0.65rem' 
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '0.35rem 0.5rem' }}>Fecha/Corrida</th>
                      <th style={{ padding: '0.35rem 0.5rem' }}>Escala</th>
                      <th style={{ padding: '0.35rem 0.5rem' }}>Entorno</th>
                      <th style={{ padding: '0.35rem 0.5rem' }}>Intervenciones</th>
                      <th style={{ padding: '0.35rem 0.5rem' }}>Resultado Final</th>
                      <th style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {archivedSimulations.map((run) => (
                      <tr key={run.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '0.35rem 0.5rem', fontWeight: '700' }}>
                          <span style={{ color: 'var(--neon-purple)', display: 'block', fontSize: '0.55rem' }}>{run.id}</span>
                          {run.name}
                        </td>
                        <td style={{ padding: '0.35rem 0.5rem', color: 'var(--text-secondary)' }}>{run.scale}</td>
                        <td style={{ padding: '0.35rem 0.5rem', color: 'var(--text-secondary)' }}>
                          🌡️{run.params.temp}°C · 💧${run.params.water}M
                        </td>
                        <td style={{ padding: '0.35rem 0.5rem' }}>
                          <span style={{ color: run.interventions.solar === 'Sí' ? 'var(--neon-emerald)' : 'var(--text-muted)' }}>☀️{run.interventions.solar}</span> · 
                          <span style={{ color: run.interventions.waterV === 'Sí' ? 'var(--neon-emerald)' : 'var(--text-muted)' }}> 💧{run.interventions.waterV}</span>
                        </td>
                        <td style={{ padding: '0.35rem 0.5rem' }}>
                          <span style={{ color: run.results.happiness > 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)' }}>
                            😊{run.results.happiness}% Fel
                          </span> · 
                          <span style={{ color: run.results.descontento > 45 ? 'var(--neon-rose)' : 'var(--neon-emerald)' }}>
                            🚨{run.results.descontento}% Apagón
                          </span>
                        </td>
                        <td style={{ padding: '0.35rem 0.5rem', textAlign: 'center' }}>
                          <button 
                            onClick={() => loadArchivedSimulation(run)}
                            style={{ padding: '0.2rem 0.4rem', fontSize: '0.55rem', cursor: 'pointer', background: 'transparent', border: '1px solid var(--neon-blue)', borderRadius: '3px', color: 'var(--neon-blue)' }}
                          >
                            📥 Cargar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 📊 SECTION 2: MAPA ONTOLÓGICO GDS-MEGA DE LOS 10 DOMINIOS (1,024 VARIABLES) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', margin: 0 }}>
          <Database size={18} color="var(--neon-purple)" />
          Matriz Ontológica de Parámetros GDS-MEGA (10 Dominios × 100 Variables)
        </h3>

        {/* Horizontal Navigation of Macro-Domains */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
          gap: '0.75rem' 
        }}>
          {macroDomains.map((dom) => {
            const Icon = dom.icon;
            const isActive = activeDomain === dom.id;
            return (
              <div 
                key={dom.id} 
                onClick={() => setActiveDomain(dom.id)}
                style={{ 
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(127, 29, 219, 0.15)' : 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid',
                  borderColor: isActive ? dom.color : 'var(--border-glass)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'var(--transition-smooth)',
                  boxShadow: isActive ? `0 0 10px ${dom.color}25` : 'none'
                }}
              >
                <div style={{ 
                  background: `rgba(255,255,255,0.03)`, 
                  color: dom.color, 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '6px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Icon size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>{dom.id}</h4>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{dom.params} Variables</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Macro-Domain Sub-Domains (Deep Spec details) */}
        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          border: '1px solid var(--border-glass)', 
          borderRadius: '8px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--neon-blue)', margin: 0 }}>
            🔎 Vista Detallada de Parámetros: {macroDomains.find(d => d.id === activeDomain)?.name}
          </h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>
            Mapeando 20 variables por cada uno de los 5 sub-dominios correspondientes. Los datos baselines sugeridos de INEGI/Censos se calibran localmente:
          </p>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
            marginTop: '0.5rem' 
          }}>
            {(subDomains[activeDomain] || subDomains['DEM_ADV']).map((sub, i) => (
              <div 
                key={sub.id} 
                className="glass-card" 
                style={{ 
                  padding: '0.85rem', 
                  background: 'rgba(255,255,255,0.01)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '700' }}>{sub.id}</span>
                  <span 
                    className="tag-badge" 
                    style={{ 
                      fontSize: '0.55rem', 
                      padding: '0.1rem 0.3rem', 
                      ...getStatusBadgeStyle(sub.status)
                    }}
                  >
                    {sub.status}
                  </span>
                </div>
                <strong style={{ fontSize: '0.75rem', color: 'var(--text-primary)' }}>{sub.name}</strong>
                <div style={{ 
                  marginTop: '0.25rem', 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '0.4rem', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  color: 'var(--neon-emerald)',
                  fontFamily: 'monospace',
                  textAlign: 'center' 
                }}>
                  {sub.defaultVal}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 📊 SECTION 3: EXPLORADOR Y EDITOR MICRO DE AGENTES SINTÉTICOS */}
      <div className="workspace-grid-2" style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem' }}>
        
        {/* Left Side: Agent List Search */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}>
            <User size={18} color="var(--neon-blue)" />
            Población Sintética (Hermosillo)
          </h3>

          <div style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Buscar agente o estrato..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="premium-input"
              style={{ width: '100%', paddingRight: '2rem' }}
            />
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.5rem', 
            maxHeight: '380px', 
            overflowY: 'auto',
            paddingRight: '0.25rem' 
          }}>
            {filteredAgents.map((a) => {
              const isSelected = a.id === selectedAgentId;
              return (
                <div 
                  key={a.id} 
                  onClick={() => setSelectedAgentId(a.id)}
                  style={{ 
                    padding: '0.65rem 0.85rem',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'rgba(255,255,255,0.01)',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--neon-blue)' : 'var(--border-glass)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: isSelected ? 'var(--neon-blue)' : 'var(--text-primary)' }}>
                      👤 {a.id}
                    </span>
                    <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                      {a.sector === 'jovenes' ? '🎓 Jóvenes' : (a.sector === 'comerciantes' ? '🏬 Comerciante' : 'asalariados' ? '⚙️ Asalariado' : 'Vecino')} · D8
                    </span>
                  </div>
                  
                  <span style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: '700', 
                    color: a.happiness > 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)' 
                  }}>
                    {a.happiness}% Fel.
                  </span>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Deep Agent Vector Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
            
            {/* Header / Agent Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--neon-blue)', margin: 0 }}>
                  Inspector de Gemelo Digital: {selectedAgent?.id}
                </h4>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  Clase de Objeto: <code>MegaSyntheticAgent</code> · Vector de Estado Calibrado
                </span>
              </div>

              {/* Edit toggle button */}
              <button 
                className="btn-outline" 
                onClick={() => setIsEditingAgent(!isEditingAgent)}
                style={{ fontSize: '0.7rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
              >
                {isEditingAgent ? (
                  <>
                    <RotateCcw size={12} />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Edit2 size={12} />
                    Editar Micro
                  </>
                )}
              </button>
            </div>

            {/* Two column inspector details */}
            <div className="workspace-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              {/* Left Column: Demographics, Income and Geohash-9 Micro Map */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                
                {/* Micro Details Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Geohash Residencia:</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>d5fp7y4w3</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Geohash Trabajo:</span>
                    <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>d5fp7y48</strong>
                  </div>
                  
                  {isEditingAgent ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--neon-blue)', fontWeight: '700' }}>EDITAR PARÁMETROS MICRO</span>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                          <span>Ingreso Mensual ($)</span>
                          <strong>${editIncome}</strong>
                        </div>
                        <input type="range" min="4000" max="45000" step="500" value={editIncome} onChange={e => setEditIncome(parseInt(e.target.value))} style={{ width: '100%', accentColor: 'var(--neon-blue)' }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                          <span>Dolor Agua</span>
                          <strong>{(editWaterPain * 10).toFixed(1)}</strong>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" value={editWaterPain} onChange={e => setEditWaterPain(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--neon-blue)' }} />
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem' }}>
                          <span>Dolor Vialidades</span>
                          <strong>{(editTransitPain * 10).toFixed(1)}</strong>
                        </div>
                        <input type="range" min="0" max="1" step="0.05" value={editTransitPain} onChange={e => setEditTransitPain(parseFloat(e.target.value))} style={{ width: '100%', accentColor: 'var(--neon-blue)' }} />
                      </div>

                      <button 
                        className="btn-premium" 
                        onClick={saveAgentEdits}
                        style={{ fontSize: '0.7rem', padding: '0.35rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                      >
                        <Save size={12} />
                        Guardar y Propagar
                      </button>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Ingreso Mensual:</span>
                        <strong style={{ color: 'var(--text-primary)' }}>${selectedAgent?.income || 14500} MXN</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Felicidad Individual:</span>
                        <strong style={{ color: selectedAgent?.happiness > 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)' }}>{selectedAgent?.happiness}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Radiación Local (Predio):</span>
                        <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                          {Math.round(sandboxRadiacion + (selectedAgent?.id * 5 % 15 - 7))} W/m²
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Presión Hidráulica (Predio):</span>
                        <strong style={{ color: Math.round(sandboxPresionAgua - (selectedAgent?.id * 3 % 10)) >= 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)', fontFamily: 'monospace' }}>
                          {Math.max(5, Math.round(sandboxPresionAgua - (selectedAgent?.id * 3 % 10)))}% ({Math.round(Math.max(5, sandboxPresionAgua - (selectedAgent?.id * 3 % 10)) * 0.8)} PSI)
                        </strong>
                      </div>
                    </>
                  )}
                </div>

                {/* Micro-Map Geohash-9 grid mapping representation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} color="var(--neon-rose)" />
                    Geohash-9 Micro-Predio (Cuadrante 4.7m × 4.7m)
                  </span>

                  <div style={{ 
                    height: '110px', 
                    background: 'radial-gradient(circle, rgba(10,20,30,0.8) 0%, rgba(5,10,15,0.95) 100%)', 
                    borderRadius: '8px', 
                    border: '1px solid var(--border-glass)',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Micro-Grid lines */}
                    <div style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
                      backgroundSize: '15px 15px'
                    }} />

                    {/* Residencia Center Marker */}
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'var(--neon-rose)',
                      boxShadow: '0 0 10px var(--neon-rose)',
                      zIndex: 5,
                      position: 'relative'
                    }}>
                      {/* Pulse effect */}
                      <div style={{
                        position: 'absolute',
                        top: '-6px',
                        left: '-6px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '1px solid var(--neon-rose)',
                        opacity: 0.5,
                        animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
                      }} />
                    </div>

                    {/* Surrounding simulated neighborhood elements */}
                    {geohashGridPoints.map((pt) => (
                      <div 
                        key={pt.id} 
                        style={{
                          position: 'absolute',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.25)',
                          left: `${pt.x}%`,
                          top: `${pt.y}%`
                        }} 
                      />
                    ))}

                    <span style={{ position: 'absolute', bottom: '5px', right: '8px', fontSize: '0.55rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                      HER-SEC-08 // RESIDENCE GRID
                    </span>
                  </div>
                </div>

              </div>

              {/* Right Column: 8-D Cognitive Bias Radar Chart */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Compass size={12} color="var(--neon-blue)" />
                  Vector de Sesgo Cognitivo (Inferencia Radar 8-D)
                </span>

                <div style={{ width: '100%', height: '190px', background: 'rgba(0,0,0,0.15)', borderRadius: '8px', border: '1px solid var(--border-glass)', padding: '5px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={biasData}>
                      <PolarGrid stroke="rgba(255,255,255,0.06)" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        stroke="var(--text-secondary)" 
                        tick={{ fontSize: 7, fill: 'var(--text-secondary)' }}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 100]} 
                        tick={{ fontSize: 6, fill: 'var(--text-secondary)' }}
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <Radar 
                        name="Citizen Vector" 
                        dataKey="A" 
                        stroke="var(--neon-blue)" 
                        fill="var(--neon-blue)" 
                        fillOpacity={0.25} 
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Timeline of episodic memories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>
                📜 Memoria Episódica Reciente (Recuerdos del Agente)
              </span>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                gap: '0.75rem' 
              }}>
                {historicalEvents.map((evt, i) => (
                  <div 
                    key={i} 
                    style={{ 
                      padding: '0.65rem', 
                      background: 'rgba(0,0,0,0.25)', 
                      borderRadius: '6px', 
                      border: '1px solid var(--border-glass)',
                      fontSize: '0.7rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '800', color: evt.impact > 0 ? 'var(--neon-emerald)' : 'var(--neon-rose)' }}>
                        {evt.title}
                      </span>
                      <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>{evt.date}</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.65rem', lineHeight: '1.2' }}>{evt.desc}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', marginTop: '0.25rem', borderTop: '1px dashed rgba(255,255,255,0.05)', paddingTop: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Decaimiento: γ = 0.05</span>
                      <strong style={{ color: evt.impact > 0 ? 'var(--neon-emerald)' : 'var(--neon-rose)' }}>
                        Impacto: {evt.impact > 0 ? '+' : ''}{evt.impact}
                      </strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
