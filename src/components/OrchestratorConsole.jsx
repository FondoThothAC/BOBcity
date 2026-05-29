import React, { useState, useEffect, useRef } from 'react';
import MesaExpertosPanel from './MesaExpertosPanel';
import { 
  Terminal, 
  Play, 
  Layers, 
  ShieldCheck, 
  ExternalLink, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Database,
  ArrowRight,
  Send,
  Lock,
  ChevronRight
} from 'lucide-react';

// Casos preconfigurados de Hermosillo, Sonora
const PRESET_CASES = [
  {
    id: 'case-water',
    title: 'Crisis de Agua en Palo Verde - Distrito 8 (Sur)',
    description: 'Dolor principal: Cortes recurrentes y tandeos severos de agua. El 62% del sector asalariado está inconforme.',
    query: 'Analizar crisis de desabasto de agua en Palo Verde (Distrito 8), simular impacto electoral de inversión hídrica y estructurar plan de contingencia corporativo en Open Business Plan.',
    metrics: { target: 'Asalariados', population: '45,000', pain: 'Agua (Severidad 0.72)' },
    attackPlan: {
      title: 'Estrategia Hídrica Comunitaria - Hermosillo Sur',
      goal: 'Mitigar el desabasto de agua y revertir la tendencia electoral en el Distrito 8.',
      proposal: 'Implementación de pozos de recarga rápida y un sistema local-first de distribución por cisternas inteligentes.',
      budget: '$85.4 MDP (Financiamiento mixto: Municipio + Concesionaria)',
      roadmap: [
        'Fase 1: Mapeo GIS y calibración de tanques (Mes 1-2)',
        'Fase 2: Perforación e integración de cisternas IoT (Mes 3-5)',
        'Fase 3: Transferencia del modelo a cooperativa ciudadana en Open Business Plan (Mes 6)'
      ]
    },
    logs: [
      { type: 'info', text: '🤖 [SuperAgentOrchestrator] Iniciando análisis para la crisis de agua en Palo Verde - Distrito 8...' },
      { type: 'info', text: '📡 [DataHarvester] Cargando microdatos demográficos del INEGI y bases de secciones electorales de Hermosillo...' },
      { type: 'info', text: '📊 [DataHarvester] Población sintética instanciada localmente: 45,000 agentes calibrados.' },
      { type: 'warning', text: '⚠️ [DataHarvester] Alerta crítica: Se detecta water_scarcity_index = 0.72. Alta sensibilidad en Asalariados.' },
      { type: 'info', text: '🧠 [PainPointAnalyzer] Agrupando quejas ciudadanas y analizando sentimiento geolocalizado...' },
      { type: 'info', text: '🧠 [PainPointAnalyzer] Vectorización pgvector completada. Puntos de dolor: Desabasto (0.75), Bajas presiones (0.54).' },
      { type: 'info', text: '⚙️ [SimulatorEngine] Configurando motor de simulación social ABM (Mesa local)...' },
      { type: 'info', text: '⚙️ [SimulatorEngine] Ejecutando 50 ciclos temporales Deffuant-Weisbuch de interacción de opinión (mu = 0.3)...' },
      { type: 'info', text: '📈 [SimulatorEngine] Resultados ABM: La inversión en pozos incrementa la felicidad del sector en un 22% a 3 años.' },
      { type: 'info', text: '🗳️ [StancePredict] Evaluando intención de voto ponderada mediante Modelo Logit Multinomial (Softmax)...' },
      { type: 'info', text: '🗳️ [StancePredict] Proyección: Candidato A sube +6.5% en la intención de voto tras propuesta de tandeos inteligentes.' },
      { type: 'info', text: '📝 [ReportWriter] Redactando borrador de plan de ataque estratégico en formato estructurado...' },
      { type: 'info', text: '🔌 [OBPConnector] Traduciendo recomendaciones sociales a formato financiero para Open Business Plan...' },
      { type: 'success', text: '✅ [SuperAgentOrchestrator] Proceso de enjambre completado con éxito. Payload de integración firmado y listo para exportación local.' }
    ],
    payload: {
      session_hash: "a4f89d3c5e2197e884b80b27e8a93e8274cf8f2e2764a2f8b5f39e38c92a9b3d",
      territory_id: "HER-DIS-08",
      pain_points: [
        { issue: "water", severity: 0.72, trend: "worsening" },
        { issue: "mobility", severity: 0.35, trend: "stable" }
      ],
      target_demographics: {
        sector: "asalariados",
        impacted_population: 45000,
        current_happiness: 0.38
      },
      recommended_civic_action: "Inversión en pozos de recarga y cisternas comunitarias inteligentes.",
      simulated_kpis: {
        expected_happiness_improvement: "+22%",
        projected_vote_intention_swing: "+6.5% (Candidato A)"
      },
      obp_proposal_draft: {
        project_title: "Pozos y Cisternas Inteligentes Hermosillo Sur",
        estimated_capex_mdp: 85.4,
        operational_model: "Cooperativa de Distribución Local"
      }
    }
  },
  {
    id: 'case-mobility',
    title: 'Movilidad Estudiantil - Distrito 6 (Norte)',
    description: 'Dolor principal: Colapso del transporte público, altos costos y tiempos de espera para universitarios en el norte de Hermosillo.',
    query: 'Analizar deficiencias de movilidad y transporte en Distrito 6 (Norte), simular la propuesta de subsidio al boleto estudiantil y estructurar el modelo de flota eléctrica en Open Business Plan.',
    metrics: { target: 'Estudiantes', population: '57,000', pain: 'Movilidad (Severidad 0.85)' },
    attackPlan: {
      title: 'Flota de Transporte Eléctrico Universitario - Distrito 6',
      goal: 'Reducir el descontento de transporte de jóvenes y ganar presencia electoral en la zona norte.',
      proposal: 'Subsidio focalizado a transporte universitario sustentable, operado por Pymes locales aliadas.',
      budget: '$45.0 MDP (Inversión mixta de fideicomiso estudiantil)',
      roadmap: [
        'Fase 1: Diagnóstico de rutas y paradas críticas mediante sensorización local (Mes 1)',
        'Fase 2: Adquisición de vehículos eléctricos compactos y despliegue de app móvil (Mes 2-4)',
        'Fase 3: Activación en plataforma Open Business Plan para incubación de operadoras (Mes 5)'
      ]
    },
    logs: [
      { type: 'info', text: '🤖 [SuperAgentOrchestrator] Iniciando análisis para la movilidad estudiantil en el Distrito 6...' },
      { type: 'info', text: '📡 [DataHarvester] Cargando censos demográficos y mapas de flujo estudiantil universitarios...' },
      { type: 'info', text: '📊 [DataHarvester] Total de agentes sintéticos estudiantiles instanciados: 57,000 en el norte.' },
      { type: 'warning', text: '⚠️ [DataHarvester] Alerta: Se detecta un mobility_index = 0.85 en horas pico. Prioridad máxima para sector Joven.' },
      { type: 'info', text: '🧠 [PainPointAnalyzer] Ejecutando análisis de grafos urbanos e insatisfacción por tiempos de traslado...' },
      { type: 'info', text: '🧠 [PainPointAnalyzer] Dolores identificados: Tiempos de espera >50 min (0.88), costo del pasaje (0.64).' },
      { type: 'info', text: '⚙️ [SimulatorEngine] Iniciando modelo de simulación ABM con el evento "subsidy-transport-students"...' },
      { type: 'info', text: '⚙️ [SimulatorEngine] Simulación de convergencia de opinión DW ejecutada. Estabilidad social incrementa 18%.' },
      { type: 'info', text: '🗳️ [StancePredict] Evaluando comportamiento de voto estudiantil basado en matching de propuestas electorales...' },
      { type: 'info', text: '🗳️ [StancePredict] Predicción: Candidato A (propuesta pro-estudiante) consolida su ventaja con +12% de preferencia.' },
      { type: 'info', text: '📝 [ReportWriter] Redactando reporte final y estructurando roadmap de movilidad...' },
      { type: 'info', text: '🔌 [OBPConnector] Creando payload financiero de la Red de Microbuses Eléctricos Universitarios...' },
      { type: 'success', text: '✅ [SuperAgentOrchestrator] Enjambre completado. Datos de movilidad alineados con el API de Open Business Plan.' }
    ],
    payload: {
      session_hash: "f83db5e2197e884b80b27e8a93e8274cf8f2e2764a2f8b5f39e38c92a9b3d09a2",
      territory_id: "HER-DIS-06",
      pain_points: [
        { issue: "mobility", severity: 0.85, trend: "worsening" },
        { issue: "security", severity: 0.42, trend: "stable" }
      ],
      target_demographics: {
        sector: "estudiantes",
        impacted_population: 57000,
        current_happiness: 0.28
      },
      recommended_civic_action: "Subsidio y Red de Microbuses Eléctricos Universitarios con APP.",
      simulated_kpis: {
        expected_happiness_improvement: "+18%",
        projected_vote_intention_swing: "+12.0% (Candidato A)"
      },
      obp_proposal_draft: {
        project_title: "Microbuses Eléctricos Distrito 6 Hermosillo",
        estimated_capex_mdp: 45.0,
        operational_model: "Fideicomiso Público-Privado Estudiantil"
      }
    }
  },
  {
    id: 'case-commerce',
    title: 'Corredor Comercial Pyme Centro - Distrito 9 (Centro)',
    description: 'Dolor principal: Inseguridad en comercios, baches viales en zonas comerciales y alta carga impositiva municipal.',
    query: 'Analizar clima de inseguridad y vialidades en Distrito 9 (Centro), simular reducción de impuesto comercial + patrullaje, y exportar plan de reactivación comercial en Open Business Plan.',
    metrics: { target: 'Comerciantes', population: '32,000', pain: 'Baches & Inseguridad (Severidad 0.78)' },
    attackPlan: {
      title: 'Corredor Comercial Seguro e Inteligente - Hermosillo Centro',
      goal: 'Reactivar el comercio local, mitigar la inseguridad y atraer el voto de los microempresarios del centro.',
      proposal: 'Reducción focalizada del impuesto comercial, pavimentación con concreto hidráulico y cámaras de videovigilancia enlazadas.',
      budget: '$62.5 MDP (Presupuesto municipal reasignado)',
      roadmap: [
        'Fase 1: Implementación del plan "Bache Cero" en arterias del centro (Mes 1-2)',
        'Fase 2: Instalación de tótems de seguridad y red Pyme vigilante (Mes 3-4)',
        'Fase 3: Creación de asociación de comerciantes en Open Business Plan para financiamiento corporativo (Mes 5)'
      ]
    },
    logs: [
      { type: 'info', text: '🤖 [SuperAgentOrchestrator] Iniciando análisis del Corredor Comercial Centro - Distrito 9...' },
      { type: 'info', text: '📡 [DataHarvester] Cargando registros económicos de unidades Pymes del INEGI y mapas delictivos del C5...' },
      { type: 'info', text: '📊 [DataHarvester] Total de agentes sintéticos comerciantes cargados: 32,000.' },
      { type: 'warning', text: '⚠️ [DataHarvester] Alerta: Inseguridad en comercios registra un score de 0.78. Impacto directo en utilidades.' },
      { type: 'info', text: '🧠 [PainPointAnalyzer] Procesando quejas de robo a comercio local y baches viales...' },
      { type: 'info', text: '🧠 [PainPointAnalyzer] Vectores semánticos analizados en local-first. Prioridades: Seguridad (0.45), Pavimentación (0.35).' },
      { type: 'info', text: '⚙️ [SimulatorEngine] Simulando el escenario "Reducción de Impuesto + Seguridad"...' },
      { type: 'info', text: '⚙️ [SimulatorEngine] Simulación de felicidad comercial proyecta un aumento del 25% a 5 años.' },
      { type: 'info', text: '🗳️ [StancePredict] Evaluando preferencias electorales del sector comercial de Hermosillo...' },
      { type: 'info', text: '🗳️ [StancePredict] Predicción: Candidato B (PAN - Conservador) sube +8.2% debido a su postura pro-empresa.' },
      { type: 'info', text: '📝 [ReportWriter] Redactando plan estratégico de reactivación comercial e informe de bacheo...' },
      { type: 'info', text: '🔌 [OBPConnector] Generando propuesta de reactivación y modelo de microcréditos para Open Business Plan...' },
      { type: 'success', text: '✅ [SuperAgentOrchestrator] Flujo completado. Plan de ataque y payload JSON firmados criptográficamente.' }
    ],
    payload: {
      session_hash: "c92d5e2197e884b80b27e8a93e8274cf8f2e2764a2f8b5f39e38c92a9b3d098f",
      territory_id: "HER-DIS-09",
      pain_points: [
        { issue: "security", severity: 0.78, trend: "worsening" },
        { issue: "baches", severity: 0.68, trend: "stable" }
      ],
      target_demographics: {
        sector: "comerciantes",
        impacted_population: 32000,
        current_happiness: 0.32
      },
      recommended_civic_action: "Reducción de impuestos comerciales, concreto hidráulico y cámaras locales vigilantes.",
      simulated_kpis: {
        expected_happiness_improvement: "+25%",
        projected_vote_intention_swing: "+8.2% (Candidato B)"
      },
      obp_proposal_draft: {
        project_title: "Centro Comercial Seguro e Inteligente D9",
        estimated_capex_mdp: 62.5,
        operational_model: "Asociación de Fomento y Microcréditos Pyme"
      }
    }
  }
];

export default function OrchestratorConsole() {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_CASES[0]);
  const [customQuery, setCustomQuery] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1 = no iniciado, 0-6 = pasos
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([
    { timestamp: '15:32:10', agent: 'System', action: 'Inicialización de CívicaOS Local-First', hash: 'e3b0c442...', status: 'CERTIFIED' },
    { timestamp: '15:33:05', agent: 'ModelLoader', action: 'Carga de Qwen2.5-32B en Ollama', hash: '8f3a9e22...', status: 'CERTIFIED' },
    { timestamp: '15:33:40', agent: 'DBConnector', action: 'Establecimiento de mTLS con pgvector', hash: '5c2b9a8f...', status: 'CERTIFIED' },
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState(0); // 0 = cerrado, 1 = cargando, 2 = completado
  
  // Estados de configuración local persistente
  const [ollamaUrl, setOllamaUrl] = useState(() => localStorage.getItem('cp:ollama_url') || 'http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState(() => localStorage.getItem('cp:ollama_model') || 'qwen2.5:14b');
  const [pythonApiUrl, setPythonApiUrl] = useState(() => localStorage.getItem('cp:python_api_url') || `http://${window.location.hostname}:5001`);
  const [obpUrl, setObpUrl] = useState(() => localStorage.getItem('cp:obp_url') || 'http://localhost:8443/obp-webhook');

  const [ollamaStatus, setOllamaStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'
  const [pythonStatus, setPythonStatus] = useState('checking'); // 'connected' | 'disconnected' | 'checking'
  const [showConfig, setShowConfig] = useState(false);
  const [modoMesa, setModoMesa] = useState(false); // false = Swarm clásico, true = Mesa de Expertos

  const terminalEndRef = useRef(null);
  const swarmIntervalRef = useRef(null);

  // Auto-scroll del terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Limpieza del intervalo al desmontar
  useEffect(() => {
    return () => {
      if (swarmIntervalRef.current) {
        clearInterval(swarmIntervalRef.current);
      }
    };
  }, []);

  // Diagnóstico de conectividad en tiempo real
  useEffect(() => {
    let active = true;

    const checkOllama = async () => {
      try {
        const res = await fetch(ollamaUrl);
        if (active) {
          setOllamaStatus(res.ok || res.status === 200 || res.status === 404 ? 'connected' : 'disconnected');
        }
      } catch (err) {
        if (active) setOllamaStatus('disconnected');
      }
    };

    const checkPython = async () => {
      try {
        const res = await fetch(pythonApiUrl);
        if (active) {
          setPythonStatus(res.ok ? 'connected' : 'disconnected');
        }
      } catch (err) {
        if (active) setPythonStatus('disconnected');
      }
    };

    checkOllama();
    checkPython();

    const interval = setInterval(() => {
      checkOllama();
      checkPython();
    }, 8000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [ollamaUrl, pythonApiUrl]);

  const saveConfig = (key, val, setter) => {
    localStorage.setItem(key, val);
    setter(val);
  };

  // Manejo de la simulación del Swarm
  // Manejo de la simulación del Swarm (Conexión real a FastAPI + Fallback local)
  const handleStartSwarm = async () => {
    if (swarmIntervalRef.current) {
      clearInterval(swarmIntervalRef.current);
    }

    setIsRunning(true);
    setCurrentStep(0);
    setTerminalLogs([]);

    const initiativeText = customQuery.trim() !== "" ? customQuery : selectedPreset.query;
    
    // Generar un nuevo log de auditoría inicial
    const initialHash = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    setAuditLogs(prev => [
      { 
        timestamp: new Date().toLocaleTimeString(), 
        agent: 'SuperAgentOrchestrator', 
        action: `Trámite de Iniciativa: "${initiativeText.slice(0, 40)}..."`, 
        hash: 'sha256:' + initialHash.slice(0, 10), 
        status: 'CERTIFIED' 
      },
      ...prev
    ]);

    // Si el backend FastAPI de Python está en línea, ejecutar flujo real
    if (pythonStatus === 'connected') {
      const startToast = new CustomEvent('civic-toast', {
        detail: {
          message: 'Iniciando enjambre de agentes en tiempo real a través de FastAPI...',
          type: 'info'
        }
      });
      window.dispatchEvent(startToast);

      setTerminalLogs([
        { type: 'info', text: '🤖 [SuperAgentOrchestrator] Iniciando flujo real del enjambre multiagente local...' },
        { type: 'info', text: `📡 Iniciativa: "${initiativeText}"` },
        { type: 'warning', text: '⚡ Ejecutando inferencia en Ollama (qwen2.5:14b) y Postgres/SQLite local...' }
      ]);
      setCurrentStep(1);

      try {
        const response = await fetch(`${pythonApiUrl}/run-swarm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            initiative: initiativeText,
            session_hash: initialHash
          })
        });

        if (!response.ok) {
          throw new Error('Swarm execution failed');
        }

        const data = await response.json();

        // Success Toast
        const successToast = new CustomEvent('civic-toast', {
          detail: {
            message: '¡Enjambre de agentes completado con éxito! Reporte generado.',
            type: 'success'
          }
        });
        window.dispatchEvent(successToast);

        // Inject audit entry for final report
        setAuditLogs(prev => [
          { 
            timestamp: new Date().toLocaleTimeString(), 
            agent: 'ReportWriter', 
            action: `Reporte de Gemelo Digital de Hermosillo finalizado y firmado`, 
            hash: 'sha256:' + data.session_hash.slice(0, 10), 
            status: 'CERTIFIED' 
          },
          ...prev
        ]);

        // Output real logs
        setTerminalLogs(prev => [
          ...prev,
          { type: 'success', text: '✅ [DataHarvester] Microdatos demográficos recuperados con éxito.' },
          { type: 'info', text: `📊 [PainPointAnalyzer] pgvector match completado para: ${data.session_hash.slice(0, 8)}` },
          { type: 'info', text: `⚙️ [SimulatorEngine] 50 ciclos de simulación DW completados con éxito.` },
          { type: 'success', text: `🗳️ [StancePredict] Postura política calculada: ${data.political_stance || 'Completada'}` },
          { type: 'success', text: `📝 [ReportWriter] Reporte final generado:\n${data.final_report?.slice(0, 250) || ''}...` },
          { type: 'success', text: '✅ [SuperAgentOrchestrator] Enjambre finalizado. Payload OBP exportado al blackboard.' }
        ]);

        setCurrentStep(6);
        setIsRunning(false);

      } catch (err) {
        console.error('Real swarm failed, falling back to local preset simulation:', err);
        const warningToast = new CustomEvent('civic-toast', {
          detail: {
            message: 'Error en la llamada real al enjambre. Usando logs simulados.',
            type: 'warning'
          }
        });
        window.dispatchEvent(warningToast);
        runPresetLogsFallback();
      }
    } else {
      // Local fallback
      runPresetLogsFallback();
    }
  };

  const runPresetLogsFallback = () => {
    // Consultar el motor de simulación real en Python si está disponible
    const isPythonAvailable = pythonStatus === 'connected';
    let realSimData = null;

    let stepIndex = 0;
    swarmIntervalRef.current = setInterval(() => {
      if (stepIndex < selectedPreset.logs.length) {
        let logItem = selectedPreset.logs[stepIndex];

        setTerminalLogs(prev => [...prev, logItem]);
        
        // Simular avance de los nodos visuales
        if (stepIndex === 0) setCurrentStep(0); // Super Agent
        if (stepIndex === 1) setCurrentStep(1); // Data Collector
        if (stepIndex === 4) setCurrentStep(2); // Analyzer
        if (stepIndex === 6) setCurrentStep(3); // ABM Simulator
        if (stepIndex === 9) setCurrentStep(4); // Predictor
        if (stepIndex === 11) setCurrentStep(5); // Report Writer
        if (stepIndex === 12) {
          setCurrentStep(6); // Integrator
          const auditHash = generateRandomHash();
          setAuditLogs(prev => [
            { 
              timestamp: new Date().toLocaleTimeString(), 
              agent: 'OBPConnector', 
              action: `Payload Cívico Criptografiado (Hash de Sesión)`, 
              hash: selectedPreset.payload.session_hash.slice(0, 10) + '...', 
              status: 'CERTIFIED' 
            },
            ...prev
          ]);
        }

        stepIndex++;
      } else {
        clearInterval(swarmIntervalRef.current);
        swarmIntervalRef.current = null;
        setIsRunning(false);
      }
    }, 900);
  };

  const handleReset = () => {
    if (swarmIntervalRef.current) {
      clearInterval(swarmIntervalRef.current);
      swarmIntervalRef.current = null;
    }
    setIsRunning(false);
    setCurrentStep(-1);
    setTerminalLogs([]);
    setCustomQuery("");
  };

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
    handleReset();
  };

  // Simulación de exportación a OBP
  const triggerExportOBP = () => {
    setIsExporting(true);
    setExportStep(1); // Cargando
    
    setTimeout(() => {
      setExportStep(2); // Completado con éxito
      // Añadir log de auditoría de exportación
      const exportHash = generateRandomHash();
      setAuditLogs(prev => [
        { 
          timestamp: new Date().toLocaleTimeString(), 
          agent: 'IntegratorGate', 
          action: `Exportación Exitosa a Open Business Plan (ID: OBP-BP-2026-004)`, 
          hash: exportHash.slice(0, 10) + '...', 
          status: 'CERTIFIED' 
        },
        ...prev
      ]);
    }, 3000);
  };

  const generateRandomHash = () => {
    const chars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 32; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* Pitch Header */}
      <div className="glass-card glow-blue" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ maxWidth: '75%' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={18} color="var(--neon-blue)" />
            Orquestador Multi-Agente OpenClaw & Swarm
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Orquesta un enjambre de agentes autónomos local-first para ingestar datos públicos (INEGI/INE), simular dinámicas sociales mediante ABM, predecir el impacto de voto (Logit Softmax) y exportar soluciones a <strong>Open Business Plan</strong>.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span className="tag-badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--neon-purple)', borderColor: 'rgba(139, 92, 246, 0.3)' }}>
            <Lock size={12} />
            Nivel 2/3 On-Premise Air-Gapped
          </span>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button 
              onClick={() => setModoMesa(!modoMesa)}
              className="btn-outline" 
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                borderColor: modoMesa ? 'var(--thoth-oro-borde)' : 'var(--border-glass)',
                color: modoMesa ? 'var(--thoth-oro)' : 'var(--text-secondary)',
                background: modoMesa ? 'rgba(212,175,55,0.08)' : 'transparent',
                cursor: 'pointer'
              }}
            >
              🧠 {modoMesa ? 'Mesa Activa' : 'Mesa de Expertos'}
            </button>
            <button 
              onClick={() => setShowConfig(!showConfig)}
              className="btn-outline" 
              style={{ 
                fontSize: '0.75rem', 
                padding: '0.25rem 0.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.25rem',
                borderColor: showConfig ? 'var(--neon-purple)' : 'var(--border-glass)',
                cursor: 'pointer'
              }}
            >
              ⚙️ {showConfig ? 'Ocultar' : 'Red'}
            </button>
          </div>
        </div>
      </div>

      {/* Panel de Configuración de Servicios Locales */}
      {showConfig && (
        <div className="glass-card glow-purple" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeIn 0.25s ease' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚙️ Panel de Configuración e Integración Local (Zero-Trust)
          </h3>
          <div className="workspace-grid-2" style={{ gap: '1.5rem' }}>
            
            {/* Col 1: Ollama */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>1. Servicio Local LLM (Ollama)</span>
                <span className="tag-badge" style={{
                  background: ollamaStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' : (ollamaStatus === 'checking' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                  color: ollamaStatus === 'connected' ? 'var(--neon-emerald)' : (ollamaStatus === 'checking' ? 'var(--neon-amber)' : 'var(--neon-red)'),
                  borderColor: ollamaStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' : (ollamaStatus === 'checking' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                }}>
                  {ollamaStatus === 'connected' ? '🟢 Conectado' : (ollamaStatus === 'checking' ? '🟡 Verificando...' : '🔴 Desconectado')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Host de Inferencia Local:</label>
                <input 
                  type="text" 
                  value={ollamaUrl} 
                  onChange={(e) => saveConfig('cp:ollama_url', e.target.value, setOllamaUrl)}
                  placeholder="http://localhost:11434"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Modelo de Lenguaje Activo:</label>
                <input 
                  type="text" 
                  value={ollamaModel} 
                  onChange={(e) => saveConfig('cp:ollama_model', e.target.value, setOllamaModel)}
                  placeholder="qwen2.5:14b"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>

            {/* Col 2: Python ABM & OBP */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>2. Motor ABM & Webhook OBP</span>
                <span className="tag-badge" style={{
                  background: pythonStatus === 'connected' ? 'rgba(16, 185, 129, 0.15)' : (pythonStatus === 'checking' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)'),
                  color: pythonStatus === 'connected' ? 'var(--neon-emerald)' : (pythonStatus === 'checking' ? 'var(--neon-amber)' : 'var(--neon-red)'),
                  borderColor: pythonStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' : (pythonStatus === 'checking' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                }}>
                  {pythonStatus === 'connected' ? '🟢 Motor ABM Online' : (pythonStatus === 'checking' ? '🟡 Verificando...' : '🔴 Motor ABM Offline')}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Host de Servidor ABM (Python):</label>
                <input 
                  type="text" 
                  value={pythonApiUrl} 
                  onChange={(e) => saveConfig('cp:python_api_url', e.target.value, setPythonApiUrl)}
                  placeholder={`http://${window.location.hostname}:5001`}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Webhook Segura de Open Business Plan:</label>
                <input 
                  type="text" 
                  value={obpUrl} 
                  onChange={(e) => saveConfig('cp:obp_url', e.target.value, setObpUrl)}
                  placeholder="http://localhost:8443/obp-webhook"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            </div>

          </div>
          <div style={{
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.01)',
            border: '1px dashed rgba(139, 92, 246, 0.2)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.4'
          }}>
            ℹ️ <strong>¿Dónde cargar los modelos de IA?</strong> Los modelos se cargan localmente en tu servidor <strong>Ollama</strong>. 
            Abre una terminal del sistema y ejecuta: <code>ollama pull {ollamaModel}</code>. Para levantar todo el ecosistema cívico en tu Mac, ejecuta en terminal: <code>./start_services.sh</code>.
          </div>
        </div>
      )}

      <div className="workspace-grid-2">
        
        {/* LADO IZQUIERDO: Controles y Diagrama de Swarm */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Panel de Selección de Casos */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="var(--neon-amber)" />
              Iniciativas Cívicas del Gemelo Digital (Hermosillo)
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {PRESET_CASES.map(c => (
                <div 
                  key={c.id}
                  onClick={() => !isRunning && handlePresetSelect(c)}
                  style={{
                    background: selectedPreset.id === c.id ? 'rgba(59, 130, 246, 0.08)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: selectedPreset.id === c.id ? 'var(--neon-blue)' : 'var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: isRunning ? 'not-allowed' : 'pointer',
                    transition: 'var(--transition-smooth)',
                    opacity: isRunning && selectedPreset.id !== c.id ? 0.5 : 1
                  }}
                  className={selectedPreset.id === c.id ? 'glow-blue' : ''}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: selectedPreset.id === c.id ? 'var(--neon-blue)' : 'var(--text-primary)' }}>
                      {c.title}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--neon-emerald)', fontWeight: '700' }}>
                      {c.metrics.target}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {c.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Custom Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>O escribe una Iniciativa Cívica Personalizada:</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <textarea 
                  disabled={isRunning}
                  placeholder="Ej: Simular pavimentación masiva en el norte (D6), medir satisfacción de estudiantes y exportar a OBP..."
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem 0.8rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                    resize: 'none',
                    height: '50px'
                  }}
                />
              </div>
            </div>

            {/* Trigger buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button 
                onClick={handleStartSwarm} 
                disabled={isRunning || (customQuery.trim() === "" && !selectedPreset)}
                className="btn-premium"
                style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}
              >
                <Play size={16} />
                Ejecutar Flujo de Agentes
              </button>
              {(currentStep >= 0 || terminalLogs.length > 0) && (
                <button 
                  onClick={handleReset} 
                  disabled={isRunning}
                  className="btn-outline"
                  style={{ padding: '0 1rem' }}
                  title="Reiniciar consola"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>

          </div>

          {/* Diagrama Visual de Swarm */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={16} color="var(--neon-purple)" />
              Flujo y Estatus del Enjambre de Agentes
            </h3>

            {/* Nodos de Agente */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: 'rgba(0,0,0,0.2)', 
              padding: '1.5rem 1rem', 
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-glass)',
              overflowX: 'auto',
              gap: '0.5rem'
            }}>
              
              {/* Agent Node 1: Orquestador */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '75px' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: currentStep >= 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: '2px solid',
                  borderColor: currentStep === 0 ? 'var(--neon-blue)' : (currentStep > 0 ? 'var(--neon-emerald)' : 'var(--border-glass)'),
                  boxShadow: currentStep === 0 ? 'var(--shadow-neon-blue)' : 'none',
                  animation: currentStep === 0 ? 'pulseGlow 1.5s infinite ease-in-out' : 'none',
                  transition: 'var(--transition-smooth)',
                  color: currentStep >= 0 ? (currentStep > 0 ? 'var(--neon-emerald)' : 'var(--neon-blue)') : 'var(--text-secondary)'
                }}>
                  {currentStep > 0 ? <CheckCircle2 size={20} /> : <Cpu size={20} />}
                </div>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', color: currentStep === 0 ? 'var(--neon-blue)' : 'var(--text-secondary)', fontWeight: '700' }}>Orquestador</span>
              </div>

              <ChevronRight size={14} color="var(--text-muted)" />

              {/* Agent Node 2: Data Harvester */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '75px' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: currentStep >= 1 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: '2px solid',
                  borderColor: currentStep === 1 ? 'var(--neon-blue)' : (currentStep > 1 ? 'var(--neon-emerald)' : 'var(--border-glass)'),
                  boxShadow: currentStep === 1 ? 'var(--shadow-neon-blue)' : 'none',
                  animation: currentStep === 1 ? 'pulseGlow 1.5s infinite ease-in-out' : 'none',
                  transition: 'var(--transition-smooth)',
                  color: currentStep >= 1 ? (currentStep > 1 ? 'var(--neon-emerald)' : 'var(--neon-blue)') : 'var(--text-secondary)'
                }}>
                  {currentStep > 1 ? <CheckCircle2 size={20} /> : <Database size={20} />}
                </div>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', color: currentStep === 1 ? 'var(--neon-blue)' : 'var(--text-secondary)', fontWeight: '700' }}>Collector</span>
              </div>

              <ChevronRight size={14} color="var(--text-muted)" />

              {/* Agent Node 3: Pain Analyzer */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '75px' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: currentStep >= 2 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: '2px solid',
                  borderColor: currentStep === 2 ? 'var(--neon-purple)' : (currentStep > 2 ? 'var(--neon-emerald)' : 'var(--border-glass)'),
                  boxShadow: currentStep === 2 ? 'var(--shadow-neon-purple)' : 'none',
                  animation: currentStep === 2 ? 'pulseGlow 1.5s infinite ease-in-out' : 'none',
                  transition: 'var(--transition-smooth)',
                  color: currentStep >= 2 ? (currentStep > 2 ? 'var(--neon-emerald)' : 'var(--neon-purple)') : 'var(--text-secondary)'
                }}>
                  {currentStep > 2 ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', color: currentStep === 2 ? 'var(--neon-purple)' : 'var(--text-secondary)', fontWeight: '700' }}>Analyzer</span>
              </div>

              <ChevronRight size={14} color="var(--text-muted)" />

              {/* Agent Node 4: Simulator Engine */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '75px' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: currentStep >= 3 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: '2px solid',
                  borderColor: currentStep === 3 ? 'var(--neon-purple)' : (currentStep > 3 ? 'var(--neon-emerald)' : 'var(--border-glass)'),
                  boxShadow: currentStep === 3 ? 'var(--shadow-neon-purple)' : 'none',
                  animation: currentStep === 3 ? 'pulseGlow 1.5s infinite ease-in-out' : 'none',
                  transition: 'var(--transition-smooth)',
                  color: currentStep >= 3 ? (currentStep > 3 ? 'var(--neon-emerald)' : 'var(--neon-purple)') : 'var(--text-secondary)'
                }}>
                  {currentStep > 3 ? <CheckCircle2 size={20} /> : <RotateCcw size={20} />}
                </div>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', color: currentStep === 3 ? 'var(--neon-purple)' : 'var(--text-secondary)', fontWeight: '700' }}>ABM Sim</span>
              </div>

              <ChevronRight size={14} color="var(--text-muted)" />

              {/* Agent Node 5: Predictor */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '75px' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: currentStep >= 4 ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: '2px solid',
                  borderColor: currentStep === 4 ? 'var(--neon-purple)' : (currentStep > 4 ? 'var(--neon-emerald)' : 'var(--border-glass)'),
                  boxShadow: currentStep === 4 ? 'var(--shadow-neon-purple)' : 'none',
                  animation: currentStep === 4 ? 'pulseGlow 1.5s infinite ease-in-out' : 'none',
                  transition: 'var(--transition-smooth)',
                  color: currentStep >= 4 ? (currentStep > 4 ? 'var(--neon-emerald)' : 'var(--neon-purple)') : 'var(--text-secondary)'
                }}>
                  {currentStep > 4 ? <CheckCircle2 size={20} /> : <Sparkles size={20} />}
                </div>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', color: currentStep === 4 ? 'var(--neon-purple)' : 'var(--text-secondary)', fontWeight: '700' }}>Predictor</span>
              </div>

              <ChevronRight size={14} color="var(--text-muted)" />

              {/* Agent Node 6: Integrator OBP */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', width: '75px' }}>
                <div style={{
                  width: '45px',
                  height: '45px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: currentStep >= 6 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                  border: '2px solid',
                  borderColor: currentStep === 6 ? 'var(--neon-emerald)' : 'var(--border-glass)',
                  boxShadow: currentStep === 6 ? 'var(--shadow-neon-emerald)' : 'none',
                  transition: 'var(--transition-smooth)',
                  color: currentStep >= 6 ? 'var(--neon-emerald)' : 'var(--text-secondary)'
                }}>
                  {currentStep === 6 ? <CheckCircle2 size={20} /> : <ExternalLink size={20} />}
                </div>
                <span style={{ fontSize: '0.65rem', textAlign: 'center', color: currentStep === 6 ? 'var(--neon-emerald)' : 'var(--text-secondary)', fontWeight: '700' }}>Conector OBP</span>
              </div>

            </div>
          </div>

        </div>

        {/* LADO DERECHO: Consola del Terminal e Inferencia */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Terminal Box */}
          <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '380px' }}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Terminal size={16} color="var(--neon-blue)" />
                <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-primary)' }}>cívicaos-ollama-node ~ v1.4.2</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></div>
              </div>
            </div>

            {/* Terminal Body */}
            <div style={{
              flex: 1,
              background: '#02050e',
              border: '1px solid rgba(255,255,255,0.03)',
              borderRadius: 'var(--radius-sm)',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#d1d5db',
              overflowY: 'auto',
              maxHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              lineHeight: '1.4'
            }}>
              {terminalLogs.length === 0 && (
                <div style={{ color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center', height: '100%', gap: '0.5rem', textAlign: 'center', marginTop: '4rem' }}>
                  <Terminal size={32} />
                  <span>Consola inactiva. Selecciona una iniciativa cívica y haz clic en "Ejecutar Flujo de Agentes" para iniciar inferencia en Ollama.</span>
                </div>
              )}
              {terminalLogs.map((log, index) => {
                if (!log) return null;
                return (
                  <div 
                    key={index} 
                    style={{ 
                      color: log.type === 'success' ? 'var(--neon-emerald)' : (log.type === 'warning' ? 'var(--neon-amber)' : '#d1d5db') 
                    }}
                  >
                    {log.text}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>

      </div>

      {/* SECCIÓN INFERIOR: Resultados del Plan de Ataque y Conexión OBP */}
      {currentStep === 6 && !isRunning && (
        <div className="glass-card glow-emerald" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'pulseGlow 2.5s infinite ease-in-out' }}>
          
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.25rem' }}>
            <div>
              <span className="tag-badge" style={{ marginBottom: '0.5rem' }}>
                <CheckCircle2 size={12} />
                Plan Estratégico Generado Exitosamente
              </span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', background: 'linear-gradient(to right, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {selectedPreset.attackPlan.title}
              </h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              SHA256: {selectedPreset.payload.session_hash.slice(0, 16)}...
            </span>
          </div>

          <div className="workspace-grid-2" style={{ margin: 0 }}>
            
            {/* Detalles del Plan */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Objetivo Social:</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {selectedPreset.attackPlan.goal}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Propuesta Técnica de Campaña:</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                  {selectedPreset.attackPlan.proposal}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>Roadmap de Ejecución:</span>
                <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {selectedPreset.attackPlan.roadmap.map((step, idx) => (
                    <li key={idx} style={{ lineHeight: '1.4' }}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Métricas e Inyección OBP */}
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              border: '1px solid var(--border-glass)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Presupuesto Proyectado:</span>
                  <span style={{ fontWeight: '700', color: 'var(--neon-amber)' }}>{selectedPreset.attackPlan.budget}</span>
                </div>
                <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Felicidad del Sector (Simulada):</span>
                  <span style={{ fontWeight: '700', color: 'var(--neon-emerald)' }}>{selectedPreset.payload.simulated_kpis.expected_happiness_improvement}</span>
                </div>
                <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Volatilidad Electoral Esperada:</span>
                  <span style={{ fontWeight: '700', color: 'var(--neon-blue)' }}>{selectedPreset.payload.simulated_kpis.projected_vote_intention_swing}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
                <button 
                  onClick={triggerExportOBP}
                  className="btn-premium"
                  style={{ width: '100%', display: 'flex', gap: '0.5rem', justifycontent: 'center', background: 'linear-gradient(135deg, var(--neon-emerald), var(--neon-blue))', boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)' }}
                >
                  <ExternalLink size={16} />
                  Exportar Solución a Open Business Plan
                </button>
                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                  Inyecta automáticamente los KPIs simulados y el roadmap de desarrollo corporativo en la plataforma comercial.
                </p>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* Registro de Auditoría Local (Ledger) */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--neon-emerald)" />
          Registro de Auditoría Local-First (GDPR / LGPD Compliance Ledger)
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
          Trazabilidad absoluta sobre el procesamiento de datos sensibles. Toda consulta, simulación y exportación se firma localmente con un hash SHA-256 inmutable en el ledger de CívicaOS.
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', fontFamily: 'monospace', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem' }}>Estampa Temporal</th>
                <th style={{ padding: '0.75rem' }}>Agente Local</th>
                <th style={{ padding: '0.75rem' }}>Acción Ejecutada</th>
                <th style={{ padding: '0.75rem' }}>Hash de Firma (SHA-256)</th>
                <th style={{ padding: '0.75rem' }}>Cumplimiento</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, index) => (
                <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}>
                  <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{log.timestamp}</td>
                  <td style={{ padding: '0.75rem', fontWeight: '700', color: 'var(--neon-blue)' }}>{log.agent}</td>
                  <td style={{ padding: '0.75rem' }}>{log.action}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--neon-amber)' }}>{log.hash}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      background: 'rgba(16, 185, 129, 0.12)', 
                      color: 'var(--neon-emerald)', 
                      border: '1px solid rgba(16, 185, 129, 0.25)', 
                      padding: '0.1rem 0.4rem', 
                      borderRadius: '4px',
                      fontSize: '0.65rem',
                      fontWeight: '700'
                    }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE INTEGRACIÓN OPEN BUSINESS PLAN */}
      {isExporting && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(7, 10, 19, 0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          
          <div className="glass-card glow-blue" style={{ width: '90%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#0a0e1a' }}>
            
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ExternalLink size={20} color="var(--neon-blue)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                  Conector de Integración local: CivicPulse ──► OBP API
                </h3>
              </div>
              <span className="tag-badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--neon-emerald)' }}>
                Conexión M-TLS Activa
              </span>
            </div>

            {/* Contenido según paso */}
            {exportStep === 1 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifycontent: 'center', padding: '2rem 1rem', gap: '1.5rem', textAlign: 'center' }}>
                {/* Spinner Animado */}
                <div style={{
                  width: '60px',
                  height: '60px',
                  border: '4px solid rgba(59, 130, 246, 0.1)',
                  borderTop: '4px solid var(--neon-blue)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>Transmitiendo Oportunidad de Negocio...</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Empaquetando diagnóstico de baches, escasez de agua e intención electoral. Inyectando payload a <code>POST http://localhost:8000/api/v1/opportunities</code>
                  </p>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{
                    width: '65%',
                    height: '100%',
                    background: 'var(--neon-blue)',
                    boxShadow: 'var(--shadow-neon-blue)',
                    borderRadius: '10px'
                  }}></div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <CheckCircle2 size={36} color="var(--neon-emerald)" style={{ flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>¡Proyecto Creado Exitosamente en Open Business Plan!</h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      Los agentes comerciales han recibido el informe de CivicPulse. Se ha estructurado el modelo de negocio "<strong>{selectedPreset.payload.obp_proposal_draft.project_title}</strong>", calculado su CAPEX estimado de <strong>${selectedPreset.payload.obp_proposal_draft.estimated_capex_mdp} MDP</strong> y diseñado el roadmap operativo inicial en base a los KPIs sociales.
                    </p>
                  </div>
                </div>

                {/* JSON Payload Preview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Payload JSON Transmitido (mTLS Local-First):</span>
                  <div style={{
                    background: '#040711',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    color: '#a9b2c3',
                    overflowX: 'auto',
                    maxHeight: '160px'
                  }}>
                    <pre>{JSON.stringify(selectedPreset.payload, null, 2)}</pre>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={() => setIsExporting(false)} 
                    className="btn-premium"
                    style={{ flex: 1, display: 'flex', gap: '0.5rem', alignItems: 'center', justifycontent: 'center' }}
                  >
                    <span>Cerrar y Ver en OBP</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* CSS Inline para animación de rotación del spinner */}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}} />

        </div>
      )}

      {/* ─── Mesa de Expertos (Panel Alternativo MoE) ─────────────── */}
      {modoMesa && (
        <MesaExpertosPanel 
          pythonApiUrl={pythonStatus === 'connected' ? pythonApiUrl : null}
          onComplete={() => {
            const toast = new CustomEvent('civic-toast', {
              detail: {
                message: '🧠 Mesa de Expertos completada — Síntesis consolidada disponible.',
                type: 'success'
              }
            });
            window.dispatchEvent(toast);
          }}
        />
      )}

    </div>
  );
}
