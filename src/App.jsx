import React, { useState, useEffect, lazy, Suspense } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Play, 
  Vote, 
  Database, 
  Smile, 
  Sparkles,
  MapPin,
  Menu,
  X,
  Terminal,
  ShieldAlert,
  Network,
  BookOpen,
  Award,
  Target,
  Globe,
  Users
} from 'lucide-react';

const DashboardOverview = lazy(() => import('./components/DashboardOverview'));
const PainPointsMap = lazy(() => import('./components/PainPointsMap'));
const ABMSimulator = lazy(() => import('./components/ABMSimulator'));
const PredictorEngine = lazy(() => import('./components/PredictorEngine'));
const DataHub = lazy(() => import('./components/DataHub'));
const OrchestratorConsole = lazy(() => import('./components/OrchestratorConsole'));
const ThothAgoraPortal = lazy(() => import('./components/ThothAgoraPortal'));
const MasterConsole = lazy(() => import('./components/MasterConsole'));
const ClientOnboarding = lazy(() => import('./components/ClientOnboarding'));
const SocialGraph3D = lazy(() => import('./components/SocialGraph3D'));
const SyntoWiki = lazy(() => import('./components/SyntoWiki'));
const UnifiedCommandCenter = lazy(() => import('./components/UnifiedCommandCenter'));
const GDSMegaVisualizer = lazy(() => import('./components/GDSMegaVisualizer'));
const GDSMicroSimulator = lazy(() => import('./components/GDSMicroSimulator'));
const ImplementationPlan = lazy(() => import('./components/ImplementationPlan'));
const AgentRawView = lazy(() => import('./components/AgentRawView'));
const WorldBoxSimulator = lazy(() => import('./components/WorldBoxSimulator'));
const HunterDashboard = lazy(() => import('./components/HunterDashboard'));
const MultiverseAdmin = lazy(() => import('./components/MultiverseAdmin'));
const GlobalOsirisMap = lazy(() => import('./components/GlobalOsirisMap'));
const GothamTargetWorkbench = lazy(() => import('./components/GothamTargetWorkbench'));
const MacroSimulator = lazy(() => import('./components/MacroSimulator'));
const RatingsDashboard = lazy(() => import('./components/RatingsDashboard'));

import { applyTheme } from './themeManager';

import { 
  generateSyntheticPopulation, 
  calculateElectionProbability 
} from './models/dataModel';

export default function App() {
  // Authentication & Session State
  const [authStatus, setAuthStatus] = useState('lobby'); // 'lobby', 'locked-client', 'locked-master', 'client', 'master', 'public-citizen'
  const [clientCodeInput, setClientCodeInput] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [activeClient, setActiveClient] = useState(null);

  // --- PREMIUM UX UPGRADE: TOAST NOTIFICATIONS & ONLINE STATUS & KEYBOARD NAVIGATION ---
  const [toasts, setToasts] = useState([]);
  const [apiOnline, setApiOnline] = useState(false);

  // 1. Toast Notification Listener
  useEffect(() => {
    const handleToastEvent = (e) => {
      const { message, type = 'success' } = e.detail || {};
      if (!message) return;
      const newToast = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type
      };
      setToasts(prev => [...prev, newToast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('civic-toast', handleToastEvent);
    return () => window.removeEventListener('civic-toast', handleToastEvent);
  }, []);

  // 2. Verificación Activa del Estado del Servidor (Cero Confianza, Primero Local)
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:5001`, { method: 'GET' });
        setApiOnline(res.ok);
      } catch (err) {
        setApiOnline(false);
      }
    };

    checkApiStatus();
    const interval = setInterval(checkApiStatus, 15000);
    return () => clearInterval(interval);
  }, []);
  // 3. Keyboard Shortcuts Navigation (Ctrl + 1..9, Ctrl + 0)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        let num = null;
        if (e.key === '0') {
          num = 10;
        } else if (!isNaN(e.key)) {
          num = parseInt(e.key);
        }

        if (num !== null && num >= 1 && num <= 10) {
          e.preventDefault();
          if (authStatus === 'master') {
            const tabs = ['master-panel', 'overview', 'map', 'simulator', 'gds-mega', 'gds-micro', 'predictor', 'data-hub', 'swarm', 'social-graph', 'synto-wiki', 'citizen-portal'];
            const targetTab = tabs[num - 1];
            if (targetTab) {
              setActiveTab(targetTab);
              window.dispatchEvent(new CustomEvent('civic-toast', {
                detail: {
                  message: `Navegación por teclado: Pestaña [${targetTab.toUpperCase()}] activa.`,
                  type: 'info'
                }
              }));
            }
          } else if (authStatus === 'client') {
            const tabs = ['overview', 'map', 'simulator', 'gds-mega', 'gds-micro', 'predictor', 'data-hub', 'swarm', 'social-graph', 'synto-wiki', 'citizen-portal'];
            const targetTab = tabs[num - 1];
            if (targetTab) {
              setActiveTab(targetTab);
              window.dispatchEvent(new CustomEvent('civic-toast', {
                detail: {
                  message: `Navegación por teclado: Pestaña [${targetTab.toUpperCase()}] activa.`,
                  type: 'info'
                }
              }));
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authStatus]);
  // ------------------------------------------------------------------------------------
  
  // Clients List (Dynamic White-Labeling)
  const [clients, setClients] = useState([
    // Nivel 1: Distritos
    { id: '1', name: 'Gobierno de Hermosillo D8', code: 'HER-DIS-08', region: 'Hermosillo, Sonora', level: 'Distrito Local', office: 'Diputación Local (D8 - Palo Verde)', population: 75000, themeId: 'glass-classic', active: true, phase: 2, subscription: 'gold', paymentVerified: true },
    { id: '2', name: 'Campaña Federal D05 Sonora', code: 'SONORA-FED-05', region: 'Hermosillo, Sonora', level: 'Distrito Federal', office: 'Diputación Federal (Distrito 5)', population: 120000, themeId: 'sunset-gold', active: true, phase: 2, subscription: 'silver', paymentVerified: true },
    
    // Nivel 2: Municipios
    { id: '3', name: 'Municipio de Nogales', code: 'NOGALES-ALCALDIA', region: 'Nogales, Sonora', level: 'Municipio', office: 'Alcaldía (Presidente Municipal)', population: 260000, themeId: 'cyber-neon', active: true, phase: 2, subscription: 'gold', paymentVerified: true },
    { id: '4', name: 'Campaña Municipio Cajeme', code: 'CAJEME-PENDIENTE', region: 'Ciudad Obregón, Sonora', level: 'Municipio', office: 'Alcaldía (Presidente Municipal)', population: 430000, themeId: 'royal-corporate', active: false, phase: 1, subscription: 'none', paymentVerified: false },
    
    // Nivel 3: Estados
    { id: '5', name: 'Gubernatura de Sonora 2027', code: 'SONORA-GUBERNATURA', region: 'Sonora, México', level: 'Estado', office: 'Gubernatura del Estado', population: 2900000, themeId: 'emerald-glass', active: true, phase: 2, subscription: 'platinum', paymentVerified: true },
    { id: '6', name: 'Fórmula al Senado Sonora', code: 'SONORA-SENADO', region: 'Sonora, México', level: 'Estado', office: 'Senaduría de la República', population: 2900000, themeId: 'rose-glow', active: true, phase: 2, subscription: 'gold', paymentVerified: true },
    
    // Nivel 4: Nacional
    { id: '7', name: 'Presidencia de México 2030', code: 'MEXICO-PRESIDENCIA', region: 'México (Nacional)', level: 'Nacional', office: 'Presidencia de la República', population: 128000000, themeId: 'glass-classic', active: true, phase: 2, subscription: 'platinum', paymentVerified: true },
    
    // Nivel 5: Internacional
    { id: '8', name: 'Alcaldía Mayor de Bogotá', code: 'BOGOTA-ALCALDIA', region: 'Bogotá, Colombia', level: 'Internacional (Municipio)', office: 'Alcaldía Mayor', population: 8000000, themeId: 'royal-corporate', active: true, phase: 2, subscription: 'gold', paymentVerified: true },
    { id: '9', name: 'Gobernación de Buenos Aires', code: 'ARG-BA-GOB', region: 'Buenos Aires, Argentina', level: 'Internacional (Estado)', office: 'Gobernación de Provincia', population: 17500000, themeId: 'cyber-neon', active: true, phase: 2, subscription: 'platinum', paymentVerified: true },
    
    // Master Console
    { id: 'master', name: 'Admin Master', code: 'CIVICAOS-MASTER', region: 'Global', level: 'Global', office: 'Orquestación General', population: 150000000, themeId: 'glass-classic', active: true, phase: 2, subscription: 'gold', paymentVerified: true }
  ]);

  const [activeTab, setActiveTab] = useState('overview');
  
  // Inicializar población sintética activa (150 agentes sintéticos de Hermosillo)
  const [agents, setAgents] = useState(() => generateSyntheticPopulation(150));
  
  // Parámetros globales de políticas (Sliders de control)
  const [policies, setPolicies] = useState({
    subsidioTransporte: 50,
    impuestoComercial: 30,
    presupuestoSeguridad: 60,
    inversionAgua: 50
  });

  // Perfiles por defecto para el predictor electoral
  const [candidateA, setCandidateA] = useState({
    name: "Lic. Claudia Rivera (Morena/Social)",
    experienceYears: 12,
    gender: "Femenino",
    proposalMatch: 82
  });

  const [candidateB, setCandidateB] = useState({
    name: "Ing. Manuel Astiazarán (PAN/Conservador)",
    experienceYears: 8,
    gender: "Masculino",
    proposalMatch: 74
  });

  const [electionResult, setElectionResult] = useState({
    votesPercentA: 52,
    votesPercentB: 48,
    winProbabilityA: 65,
    winProbabilityB: 35
  });

  // Re-calcular resultados electorales globales cuando cambien los agentes o perfiles
  useEffect(() => {
    const res = calculateElectionProbability(agents, { candidateA, candidateB });
    setElectionResult(res);
  }, [agents, candidateA, candidateB]);

  // 🧭 HTML5 History Browser Routing Engine
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      if (path === '/master' || path === '/admin') {
        setAuthStatus(prev => (prev === 'master' ? 'master' : 'locked-master'));
      } else if (path === '/citizen' || path === '/ciudadano' || path === '/participar') {
        setAuthStatus('public-citizen');
        applyTheme('quantum-indigo');
      } else if (path === '/client' || path === '/cliente') {
        setAuthStatus(prev => (prev === 'client' ? 'client' : 'locked-client'));
      } else if (path === '/agent' || path === '/agente') {
        setAuthStatus(prev => (prev === 'agent' ? 'agent' : 'locked-agent'));
      } else {
        setAuthStatus('lobby');
        applyTheme('glass-classic');
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  // Client Dynamic Handlers
  const handleAddClient = (newClient) => {
    setClients([...clients, {
      ...newClient,
      phase: 1, // Newly provisioned clients start in Onboarding Fase 1!
      subscription: 'none',
      paymentVerified: false
    }]);
  };

  const handleDeleteClient = (id) => {
    setClients(clients.filter(c => c.id !== id));
  };

  const handleUpdateClient = (updatedClient) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c));
    
    // Dynamically update the active client state if they are logged in and get updated (e.g. approved by master)
    setActiveClient(prevActive => {
      if (prevActive && prevActive.id === updatedClient.id) {
        return updatedClient;
      }
      return prevActive;
    });
  };

  const navigateTo = (path, newStatus) => {
    window.history.pushState({}, '', path);
    setAuthStatus(newStatus);
    if (newStatus === 'public-citizen') {
      applyTheme('quantum-indigo');
    } else if (newStatus === 'lobby' || newStatus === 'locked-client' || newStatus === 'locked-master' || newStatus === 'locked-agent') {
      applyTheme('glass-classic');
    }
  };

  const handleClientLogin = (e) => {
    e.preventDefault();
    const code = clientCodeInput.toUpperCase().trim();
    
    // Support multiple alias codes to unlock the master console easily!
    const isMasterCode = (
      code === 'CIVICAOS-MASTER' || 
      code === 'MASTER' || 
      code === 'CIVICAOS_MASTER' || 
      code === 'ADMIN' || 
      code === 'CIVICAOS-ADMIN'
    );

    const isAgentCode = (
      code === 'CIVICAOS-AGENT' ||
      code === 'AGENT' ||
      code === 'AGENTE' ||
      code === 'CIVICAOS-AGENTE'
    );

    if (isMasterCode) {
      setIsShaking(false);
      const masterClient = clients.find(c => c.id === 'master') || { themeId: 'glass-classic' };
      setActiveClient(masterClient);
      applyTheme(masterClient.themeId);
      window.history.pushState({}, '', '/master');
      setAuthStatus('master');
      setActiveTab('master-panel');
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: '🔓 Consola Master desbloqueada con éxito.', type: 'success' }
      }));
      return;
    }

    if (isAgentCode) {
      setIsShaking(false);
      const agentClient = clients.find(c => c.id === '1') || { themeId: 'glass-classic' };
      setActiveClient(agentClient);
      applyTheme('quantum-indigo');
      window.history.pushState({}, '', '/agent');
      setAuthStatus('agent');
      setActiveTab('overview');
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: '🔓 Consola de Agente desbloqueada con éxito.', type: 'success' }
      }));
      return;
    }

    const foundClient = clients.find(c => c.code === code);
    if (foundClient) {
      setIsShaking(false);
      setActiveClient(foundClient);
      applyTheme(foundClient.themeId);

      if (foundClient.id === 'master') {
        window.history.pushState({}, '', '/master');
        setAuthStatus('master');
        setActiveTab('master-panel');
        window.dispatchEvent(new CustomEvent('civic-toast', {
          detail: { message: '🔓 Consola Master desbloqueada con éxito.', type: 'success' }
        }));
      } else {
        window.history.pushState({}, '', '/client');
        setAuthStatus('client');
        setActiveTab('overview');
        window.dispatchEvent(new CustomEvent('civic-toast', {
          detail: { message: `🔓 Gemelo Digital de ${foundClient.name} activo.`, type: 'success' }
        }));
      }
    } else {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: '❌ Clave de seguridad incorrecta.', type: 'warning' }
      }));
    }
  };

  const handlePublicCitizenAccess = () => {
    navigateTo('/citizen', 'public-citizen');
    setActiveTab('thothagora');
  };

  const handleLogout = () => {
    navigateTo('/', 'lobby');
    setClientCodeInput('');
    setActiveClient(null);
  };

  // 🚪 RENDER MODE: Locked Master Code Page (/master path)
  if (authStatus === 'locked-master') {
    return (
      <div className="login-wrapper">
        <div className="bg-glow glow-top-left" style={{ background: '#ef4444' }}></div>
        <div className="bg-glow glow-bottom-right" style={{ background: '#b91c1c' }}></div>

        <div className={`login-card scale-in ${isShaking ? 'shake' : ''}`} style={{ borderColor: 'rgba(239, 68, 68, 0.25)' }}>
          
          <div className="logo-container">
            <div className="logo-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={28} color="var(--neon-rose)" />
            </div>
            <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Consola Master</h1>
            <p className="subtitle">Consola de Aprovisionamiento e IA de CívicaOS Engine</p>
          </div>

          <form onSubmit={handleClientLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-section">
              <label className="input-label" style={{ color: 'var(--neon-rose)' }}>Clave Maestra de Seguridad</label>
              <input 
                type="password" 
                placeholder="Ingresa la clave maestra (ej. CIVICAOS-MASTER)"
                value={clientCodeInput}
                onChange={(e) => setClientCodeInput(e.target.value)}
                className="premium-input"
                style={{ textAlign: 'center', letterSpacing: '2px', fontFamily: 'monospace', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                required
              />
            </div>

            <button type="submit" className="btn-primary glow-pulse" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
              Iniciar Consola Master
            </button>
          </form>

          <div className="divider">
            <span>ó</span>
          </div>

          <button 
            className="btn-secondary" 
            onClick={() => navigateTo('/', 'lobby')}
          >
            ← Volver al Portal General
          </button>

        </div>
      </div>
    );
  }

  // 🚪 RENDER MODE: Locked Agent Console Page (/agent)
  if (authStatus === 'locked-agent') {
    return (
      <div className="login-wrapper">
        <div className="bg-glow glow-top-left" style={{ background: '#8b5cf6' }}></div>
        <div className="bg-glow glow-bottom-right" style={{ background: '#ec4899' }}></div>

        <div className={`login-card scale-in ${isShaking ? 'shake' : ''}`} style={{ borderColor: 'rgba(139, 92, 246, 0.25)' }}>
          <div className="logo-container">
            <div className="logo-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Terminal size={28} color="var(--neon-purple)" />
            </div>
            <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Consola de Agentes</h1>
            <p className="subtitle">Procesamiento de Datos Crudos, GNN y Sandbox ABM</p>
          </div>

          <form onSubmit={handleClientLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-section">
              <label className="input-label" style={{ color: 'var(--neon-purple)' }}>Clave Operativa de Agente</label>
              <input 
                type="password" 
                placeholder="Ingresa tu clave de agente (ej. CIVICAOS-AGENT)"
                value={clientCodeInput}
                onChange={(e) => setClientCodeInput(e.target.value)}
                className="premium-input"
                style={{ textAlign: 'center', letterSpacing: '2px', fontFamily: 'monospace', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                required
              />
            </div>

            <button type="submit" className="btn-primary glow-pulse" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' }}>
              Iniciar Consola de Agente
            </button>
          </form>

          <div className="divider">
            <span>ó</span>
          </div>

          <button 
            className="btn-secondary" 
            onClick={() => navigateTo('/', 'lobby')}
          >
            ← Volver al Portal General
          </button>
        </div>
      </div>
    );
  }

  // 🚪 RENDER MODE: Locked Client Portal Page (/client)
  if (authStatus === 'locked-client') {
    return (
      <div className="login-wrapper">
        <div className="bg-glow glow-top-left" style={{ background: '#3b82f6' }}></div>
        <div className="bg-glow glow-bottom-right" style={{ background: '#8b5cf6' }}></div>

        <div className={`login-card scale-in ${isShaking ? 'shake' : ''}`} style={{ borderColor: 'rgba(59, 130, 246, 0.25)' }}>
          <div className="logo-container">
            <div className="logo-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LayoutDashboard size={28} color="var(--neon-blue)" />
            </div>
            <h1 className="gradient-text" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Consola del Cliente</h1>
            <p className="subtitle">Acceso Estratégico y Gemelos Digitales de Gobernanza</p>
          </div>

          <form onSubmit={handleClientLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="input-section">
              <label className="input-label" style={{ color: 'var(--neon-blue)' }}>Código de Marca Blanca</label>
              <input 
                type="password" 
                placeholder="Ingresa tu código (ej. HER-DIS-08)"
                value={clientCodeInput}
                onChange={(e) => setClientCodeInput(e.target.value)}
                className="premium-input"
                style={{ textAlign: 'center', letterSpacing: '2px', fontFamily: 'monospace', borderColor: 'rgba(59, 130, 246, 0.3)' }}
                required
              />
            </div>

            <button type="submit" className="btn-primary glow-pulse" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
              Desbloquear Gemelo Digital
            </button>
          </form>

          <div className="divider">
            <span>ó</span>
          </div>

          <button 
            className="btn-secondary" 
            onClick={() => navigateTo('/', 'lobby')}
          >
            ← Volver al Portal General
          </button>
        </div>
      </div>
    );
  }

  // 🚪 RENDER MODE: Lobby SaaS Entry Hub (/)
  if (authStatus === 'lobby') {
    return (
      <div className="login-wrapper" style={{ overflowY: 'auto', padding: '2rem 1rem' }}>
        <div className="bg-glow glow-top-left" style={{ width: '600px', height: '600px', background: 'rgba(139, 92, 246, 0.18)' }}></div>
        <div className="bg-glow glow-bottom-right" style={{ width: '600px', height: '600px', background: 'rgba(59, 130, 246, 0.18)' }}></div>

        <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '3rem', alignItems: 'center', animation: 'scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          
          <div style={{ textAlign: 'center', maxWidth: '650px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))', 
              width: '64px', 
              height: '64px', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              boxShadow: 'var(--shadow-neon-blue)', 
              margin: '0 auto 1.5rem',
              color: 'white'
            }}>
              <Sparkles size={36} />
            </div>
            <h1 style={{ 
              fontFamily: 'Outfit', 
              fontSize: '3rem', 
              fontWeight: '900', 
              lineHeight: '1.15', 
              background: 'linear-gradient(to right, #ffffff, #cbd5e1)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent', 
              backgroundClip: 'text',
              letterSpacing: '-0.04em',
              marginBottom: '0.75rem' 
            }}>
              CívicaOS Engine
            </h1>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.5' 
            }}>
              Plataforma de Inteligencia Cívica, Gemelos Digitales de la Sociedad y Modelado Social Predictivo.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '1.5rem', 
            width: '100%' 
          }}>
            
            {/* Column 1: Citizen Portal */}
            <div className="glass-card glow-emerald" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '340px',
              background: 'rgba(10, 20, 20, 0.4)',
              borderColor: 'rgba(16, 185, 129, 0.15)',
              padding: '2.25rem 2rem'
            }}>
              <div>
                <div style={{ 
                  background: 'rgba(16, 185, 129, 0.1)', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <Sparkles size={24} color="var(--neon-emerald)" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem' }}>Portal Ciudadano</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-emerald)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>ThothAgora (Nivel 1)</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Canal público seguro y anónimo para enviar propuestas y demandas territoriales con firmas criptográficas soberanas.
                </p>
              </div>
              <button 
                onClick={handlePublicCitizenAccess}
                className="btn-premium"
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
                  marginTop: '2rem'
                }}
              >
                Ingresar al Portal
              </button>
            </div>

            {/* Column 2: Client Portal */}
            <div className="glass-card glow-blue" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '340px',
              background: 'rgba(10, 15, 30, 0.4)',
              borderColor: 'rgba(59, 130, 246, 0.15)',
              padding: '2.25rem 2rem'
            }}>
              <div>
                <div style={{ 
                  background: 'rgba(59, 130, 246, 0.1)', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(59, 130, 246, 0.25)'
                }}>
                  <LayoutDashboard size={24} color="var(--neon-blue)" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem' }}>Consola del Cliente</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-blue)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Estratégico (Nivel 2)</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Análisis predictivo de opinión, mapas de calor GIS distritales de dolor social y planes de acción de solo lectura.
                </p>
              </div>
              <button 
                onClick={() => navigateTo('/client', 'locked-client')}
                className="btn-premium"
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
                  marginTop: '2rem'
                }}
              >
                Acceso Clientes
              </button>
            </div>

            {/* Column 3: Agent Portal */}
            <div className="glass-card glow-purple" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '340px',
              background: 'rgba(15, 10, 30, 0.4)',
              borderColor: 'rgba(139, 92, 246, 0.15)',
              padding: '2.25rem 2rem'
            }}>
              <div>
                <div style={{ 
                  background: 'rgba(139, 92, 246, 0.1)', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(139, 92, 246, 0.25)'
                }}>
                  <Terminal size={24} color="var(--neon-purple)" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem' }}>Consola de Agentes</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-purple)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Operacional (Nivel 3)</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Sandbox ABM, simulación libre multi-agente, logs de Swarm, calibración GNN y auditoría de datos crudos sin filtrar.
                </p>
              </div>
              <button 
                onClick={() => navigateTo('/agent', 'locked-agent')}
                className="btn-premium"
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)',
                  marginTop: '2rem'
                }}
              >
                Acceso Agentes
              </button>
            </div>

            {/* Column 4: Master Portal */}
            <div className="glass-card glow-rose" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              minHeight: '340px',
              background: 'rgba(25, 10, 15, 0.4)',
              borderColor: 'rgba(239, 68, 68, 0.15)',
              padding: '2.25rem 2rem'
            }}>
              <div>
                <div style={{ 
                  background: 'rgba(239, 68, 68, 0.1)', 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(239, 68, 68, 0.25)'
                }}>
                  <ShieldAlert size={24} color="var(--neon-rose)" />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '0.25rem' }}>Consola Maestra</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-rose)', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: '1rem' }}>Orquestación Global (Nivel 0)</span>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Aprovisionamiento de marcas blancas, facturación SaaS local y administración central de licencias de distrito.
                </p>
              </div>
              <button 
                onClick={() => navigateTo('/master', 'locked-master')}
                className="btn-premium"
                style={{ 
                  width: '100%', 
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  boxShadow: '0 0 15px rgba(239, 68, 68, 0.3)',
                  marginTop: '2rem'
                }}
              >
                Consola de Administración
              </button>
            </div>

          </div>

          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '1.5rem', fontFamily: 'monospace' }}>
            CívicaOS Engine v1.0.0 · Local-First Resilient Architecture · 100% GDPR Compliant
          </div>

        </div>
      </div>
    );
  }

  // 🚪 RENDER MODE: Public Citizen Fullscreen View
  if (authStatus === 'public-citizen') {
    return (
      <div style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-app)', padding: '2rem', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          
          {/* Top minimal citizen header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="brand-icon" style={{ width: '36px', height: '36px' }}><Sparkles size={20} /></div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>ThothAgora Portal</h2>
                <span style={{ fontSize: '0.65rem', color: 'var(--neon-emerald)', fontWeight: '700' }}>DEMOCRACIA Y PARTICIPACIÓN CIUDADANA</span>
              </div>
            </div>

            <button 
              className="btn-outline"
              onClick={handleLogout}
              style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', borderColor: 'var(--border-glass)' }}
            >
              ← Volver al Portal General
            </button>
          </div>

          <ThothAgoraPortal />

        </div>
      </div>
    );
  }

  // 🚪 RENDER MODE: Client Onboarding View (Fase 1)
  if (authStatus === 'client' && activeClient?.phase === 1) {
    return (
      <ClientOnboarding 
        client={activeClient}
        onUpdateClient={handleUpdateClient}
        onLogout={handleLogout}
      />
    );
  }

  // Dynamic Tab definitions based on role permissions (3 Layers of CívicaOS)
  const getSidebarTabs = () => {
    if (authStatus === 'client') {
      return [
        { id: 'overview', label: 'Resumen Ejecutivo', icon: <LayoutDashboard size={20} /> },
        { id: 'map', label: 'Mapas de Dolor (GIS)', icon: <Map size={20} /> },
        { id: 'social-graph', label: 'Grafo Social 3D', icon: <Network size={20} /> },
        { id: 'synto-wiki', label: 'Obsidian LLM Wiki', icon: <BookOpen size={20} /> },
        { id: 'implementation-plan', label: 'Plan de Acción (+1024)', icon: <Award size={20} /> },
        { id: 'ratings', label: 'Oráculo Moody\'s', icon: <Activity size={20} /> }
      ];
    }

    const tabs = [];
    if (authStatus === 'master') {
      tabs.push({ 
        id: 'master-panel', 
        label: 'Tablero Master', 
        icon: <ShieldAlert size={20} color="var(--neon-rose)" />,
        style: { borderColor: 'rgba(239, 68, 68, 0.2)', background: activeTab === 'master-panel' ? 'rgba(239, 68, 68, 0.15)' : '' }
      });
    }

    tabs.push(
      { id: 'overview', label: 'Resumen Ejecutivo', icon: <LayoutDashboard size={20} /> },
      { id: 'map', label: 'Mapas de Dolor (GIS)', icon: <Map size={20} /> },
      { id: 'simulator', label: 'Sandbox ABM', icon: <Play size={20} /> },
      { id: 'worldbox', label: 'Simulador WorldBox', icon: <Play size={20} color="var(--neon-emerald)" /> },
      { id: 'multiverso', label: 'Multiverso Admin', icon: <Sparkles size={20} color="var(--neon-cyan)" /> },
      { id: 'osiris-global', label: 'Globo Osiris 3D', icon: <Globe size={20} color="var(--neon-emerald)" /> },
      { 
        id: 'gds-mega', 
        label: 'Gemelo GDS-MEGA', 
        icon: <Database size={20} />, 
        style: { 
          borderColor: activeTab === 'gds-mega' ? 'var(--neon-purple)' : '', 
          background: activeTab === 'gds-mega' ? 'rgba(127, 29, 219, 0.15)' : '' 
        } 
      },
      { 
        id: 'gds-micro', 
        label: 'Gemelo Micro (LLM Local)', 
        icon: <Sparkles size={20} />, 
        style: { 
          borderColor: activeTab === 'gds-micro' ? 'var(--neon-purple)' : '', 
          background: activeTab === 'gds-micro' ? 'rgba(127, 29, 219, 0.15)' : '' 
        } 
      },
      { id: 'predictor', label: 'Predictor Electoral', icon: <Vote size={20} /> },
      { id: 'macro-simulator', label: 'Macro-Simulador N-Way', icon: <Users size={20} color="var(--neon-emerald)" /> },
      { id: 'data-hub', label: 'Data Hub & APIs', icon: <Database size={20} /> },
      { id: 'swarm', label: 'Swarm OpenClaw', icon: <Terminal size={20} /> },
      { id: 'social-graph', label: 'Grafo Social 3D & GNN', icon: <Network size={20} /> },
      { id: 'synto-wiki', label: 'Obsidian LLM Wiki', icon: <BookOpen size={20} /> },
      { id: 'osint-hunter', label: 'Agente El Cazador (OSINT)', icon: <Terminal size={20} color="#10B981" /> },
      { id: 'ratings', label: 'Oráculo Moody\'s', icon: <Activity size={20} /> },
      { id: 'anubis-target', label: 'Anubis Target Workbench', icon: <Target size={20} color="var(--neon-rose)" /> },
      { id: 'citizen-portal', label: 'Portal Ciudadano', icon: <Smile size={20} /> },
      { id: 'agent-raw', label: 'Datos Crudos & Bots', icon: <Terminal size={20} color="var(--neon-purple)" /> }
    );
    return tabs;
  };

  // 🚪 RENDER MODE: Client or Master Authenticated View
  return (
    <div className="app-container">
      
      {/* Sidebar of White-Label Client / Admin */}
      <aside className="sidebar">
        <div>
          <div className="brand">
            <div className="brand-icon">
              {authStatus === 'master' ? <ShieldAlert size={24} color="white" /> : <Sparkles size={24} />}
            </div>
            <div>
              <span className="brand-name">{authStatus === 'master' ? 'CívicaOS Engine' : activeClient?.name || 'CivicPulse'}</span>
              <span className="brand-sub">
                {authStatus === 'master' ? 'SUPER-ADMIN PORTAL' : 
                 authStatus === 'agent' ? 'CONSOLA DE AGENTE' : 'GEMELO DIGITAL ACTIVO'}
              </span>
            </div>
          </div>

          <nav className="nav-links">
            {getSidebarTabs().map((tab) => (
              <div 
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={tab.style}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with session context */}
        <div className="sidebar-footer" style={{ flexDirection: 'column', gap: '1.25rem', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="user-avatar" style={{ 
              background: authStatus === 'master' ? 'linear-gradient(135deg, #7f1d1d, #ef4444)' : 
                         authStatus === 'agent' ? 'linear-gradient(135deg, var(--neon-purple), var(--neon-indigo))' :
                         'linear-gradient(135deg, var(--neon-purple), var(--neon-pink))' 
            }}>
              {authStatus === 'master' ? 'AD' : authStatus === 'agent' ? 'AG' : 'RC'}
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700' }}>
                {authStatus === 'master' ? 'Super Administrador' : authStatus === 'agent' ? 'Agente de Campo' : 'Roberto Celis'}
              </h4>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                {authStatus === 'master' ? 'CívicaOS Master' : authStatus === 'agent' ? 'Operador Nivel 3' : activeClient?.name || 'Estratega Principal'}
              </span>
            </div>
          </div>
          
          {/* Dynamic Server Status Indicator (Zero-Trust Local-First) */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.65rem', 
            background: apiOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: '1px solid',
            borderColor: apiOnline ? 'var(--neon-emerald)' : 'var(--neon-rose)',
            padding: '0.35rem 0.6rem',
            borderRadius: '4px',
            color: apiOnline ? 'var(--neon-emerald)' : 'var(--neon-rose)',
            fontWeight: '700',
            transition: 'var(--transition-smooth)'
          }}>
            <span style={{ 
              width: '6px', 
              height: '6px', 
              borderRadius: '50%', 
              background: apiOnline ? 'var(--neon-emerald)' : 'var(--neon-rose)',
              boxShadow: apiOnline ? '0 0 8px var(--neon-emerald)' : '0 0 8px var(--neon-rose)',
              display: 'inline-block' 
            }}></span>
            <span>{apiOnline ? 'ZERO-TRUST CONECTADO (REAL)' : 'LOCAL-FIRST DESCONECTADO (MOCK)'}</span>
          </div>

          <button 
            className="btn-outline" 
            onClick={handleLogout}
            style={{ padding: '0.45rem', fontSize: '0.75rem', width: '100%', borderColor: 'var(--border-glass)' }}
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-workspace">
        
        {/* Header Status Bar */}
        <header className="top-bar">
          <div className="top-bar-title">
            <h1>
              {activeTab === 'master-panel' && "Consola de Aprovisionamiento e IA"}
              {activeTab === 'overview' && "Tablero de Inteligencia Social"}
              {activeTab === 'map' && "Mapa Georeferenciado de Dolores"}
              {activeTab === 'simulator' && "Simulador Basado en Agentes (ABM)"}
              {activeTab === 'worldbox' && "Simulador Sandbox (WorldBox)"}
              {activeTab === 'gds-mega' && "Visualizador GDS-MEGA (1,024 KPIs)"}
              {activeTab === 'gds-micro' && "Simulador GDS-Micro (LLM Local)"}
              {activeTab === 'predictor' && "Predictor Electoral Head-to-Head"}
              {activeTab === 'macro-simulator' && "Macro-Simulador: Percepción Masiva"}
              {activeTab === 'data-hub' && "Data Hub & APIs de Inferencia"}
              {activeTab === 'swarm' && "Enjambre Cognitivo OpenClaw"}
              {activeTab === 'social-graph' && "Detección de Bots y Coordinación GNN"}
              {activeTab === 'synto-wiki' && "Cerebro Digital & Synto LLM Wiki"}
              {activeTab === 'osint-hunter' && "Dashboard Autónomo OSINT 'El Cazador'"}
              {activeTab === 'anubis-target' && "Anubis Target Workbench (Ontología)"}
              {activeTab === 'citizen-portal' && "ThothAgora • Portal de Participación Ciudadana"}
              {activeTab === 'implementation-plan' && "Plan de Acción Territorial Integrado"}
              {activeTab === 'agent-raw' && "Consola de Datos Crudos e Ingesta"}
              {activeTab === 'ratings' && "Oráculo Moody's: Calificaciones y Riesgo"}
            </h1>
            <p>
              {activeTab === 'master-panel' && "Administrar marcas blancas, facturación simulada e inferencias."}
              {activeTab === 'overview' && `Indicadores de bienestar, seguridad y abasto en ${activeClient?.region || 'Hermosillo'}.`}
              {activeTab === 'map' && "Visualizando capas de calor de insatisfacción ciudadana."}
              {activeTab === 'simulator' && "Prueba políticas y simula dinámicas de opinión."}
              {activeTab === 'worldbox' && "Aplica leyes de gobernación local y observa el enjambre de agentes en tiempo real."}
              {activeTab === 'osiris-global' && "Centro de Comando Unificado OSINT, radar LEO y visor geográfico."}
              {activeTab === 'gds-mega' && "Visualización profunda del Gemelo Digital Social a micro y macro escala."}
              {activeTab === 'gds-micro' && "Inferencia cognitiva del gemelo digital usando modelos pequeños locales."}
              {activeTab === 'predictor' && "Probabilidad de victoria basada en perfiles y propuestas (Laboratorio)."}
              {activeTab === 'macro-simulator' && "Análisis N-Way Softmax de 2 a 6 candidatos con cálculo de Spreads a escala nacional."}
              {activeTab === 'data-hub' && "Comercializar censos sintéticos, descargar datasets y gestionar claves API de desarrollador."}
              {activeTab === 'swarm' && "Logs del orquestador cognitivo, auditoría y exportación a OBP."}
              {activeTab === 'social-graph' && "Análisis de cuentas automatizadas, amplificación y topología social 3D."}
              {activeTab === 'synto-wiki' && "Consultar la base de conocimiento local, notas Obsidian y logs de Claude Brain."}
              {activeTab === 'osint-hunter' && "Monitor en tiempo real del escaneo OSINT y rotación de proxys libres."}
              {activeTab === 'anubis-target' && "Motor Ontológico de Vínculos Criminales estilo Palantir Gotham."}
              {activeTab === 'citizen-portal' && "Simulador y vista previa interactiva del portal ciudadano ThothAgora para registrar opiniones cívicas."}
              {activeTab === 'implementation-plan' && "Recomendaciones de políticas y obras públicas basadas en +1024 factores."}
              {activeTab === 'agent-raw' && "Ingesta en tiempo real, geolocalización, metadatos y detección de botnets por GNN."}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span className="tag-badge">
              <MapPin size={12} />
              {activeClient?.region || 'Hermosillo, Sonora'}
            </span>
            <span className="tag-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--neon-blue)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              Gemelo Digital Activo
            </span>
          </div>
        </header>

        {/* Load component based on active tab */}
        <section style={{ flex: 1 }}>
          <Suspense fallback={<div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--neon-blue)', fontSize: '1.2rem' }}>Inicializando CívicaOS...</div>}>
          {activeTab === 'master-panel' && (
            <MasterConsole 
              clients={clients}
              onAddClient={handleAddClient}
              onDeleteClient={handleDeleteClient}
              onUpdateClient={handleUpdateClient}
            />
          )}
          {activeTab === 'overview' && (
            <DashboardOverview 
              agents={agents} 
              electionResult={electionResult} 
              policies={policies}
            />
          )}
          {activeTab === 'map' && (
            <PainPointsMap 
              agents={agents} 
            />
          )}
          {activeTab === 'simulator' && (
            <ABMSimulator 
              agents={agents} 
              setAgents={setAgents} 
              policies={policies} 
              setPolicies={setPolicies} 
            />
          )}
          {activeTab === 'worldbox' && (
            <WorldBoxSimulator />
          )}
          {activeTab === 'multiverso' && (
            <MultiverseAdmin />
          )}
          {activeTab === 'osiris-global' && (
            <UnifiedCommandCenter agents={agents} clients={clients} />
          )}
          {activeTab === 'gds-mega' && (
            <GDSMegaVisualizer 
              agents={agents}
              setAgents={setAgents}
            />
          )}
          {activeTab === 'gds-micro' && (
            <GDSMicroSimulator />
          )}
          {activeTab === 'predictor' && (
            <PredictorEngine 
              agents={agents} 
            />
          )}
          {activeTab === 'macro-simulator' && (
            <MacroSimulator />
          )}
          {activeTab === 'data-hub' && (
            <DataHub />
          )}
          {activeTab === 'swarm' && (
            <OrchestratorConsole />
          )}
          {activeTab === 'social-graph' && (
            <SocialGraph3D agents={agents} />
          )}
          {activeTab === 'synto-wiki' && (
            <SyntoWiki />
          )}
          {activeTab === 'osint-hunter' && (
            <HunterDashboard />
          )}
          {activeTab === 'anubis-target' && (
            <GothamTargetWorkbench />
          )}
          {activeTab === 'citizen-portal' && (
            <ThothAgoraPortal />
          )}
          {activeTab === 'implementation-plan' && (
            <ImplementationPlan activeClient={activeClient} />
          )}
          {activeTab === 'agent-raw' && (
            <Suspense fallback={<div className="loading-state">Desplegando Data Cruda...</div>}>
              <AgentRawView />
            </Suspense>
          )}

          {activeTab === 'ratings' && (
            <Suspense fallback={<div className="loading-state">Invocando a Ammit (Oráculo Moody's)...</div>}>
              <RatingsDashboard agents={agents} />
            </Suspense>
          )}
          </Suspense>
        </section>

      </main>

      {/* --- GLASSMORPHISM TOAST NOTIFICATIONS CONTAINER --- */}
      <div style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => (
          <div key={toast.id} style={{
            pointerEvents: 'auto',
            background: toast.type === 'success' 
              ? 'rgba(16, 185, 129, 0.15)' 
              : toast.type === 'warning' 
                ? 'rgba(245, 158, 11, 0.15)' 
                : 'rgba(59, 130, 246, 0.15)',
            backdropFilter: 'blur(12px)',
            border: '1px solid',
            borderColor: toast.type === 'success' 
              ? 'var(--neon-emerald)' 
              : toast.type === 'warning' 
                ? 'var(--neon-amber)' 
                : 'var(--neon-blue)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
            borderRadius: '8px',
            padding: '0.75rem 1.25rem',
            color: '#ffffff',
            fontSize: '0.8rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minWidth: '280px',
            maxWidth: '380px',
            animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <span>
              {toast.type === 'success' && '🟢'}
              {toast.type === 'warning' && '🟡'}
              {toast.type === 'info' && '🔵'}
            </span>
            <div style={{ flex: 1 }}>{toast.message}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
