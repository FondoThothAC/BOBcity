// src/components/MultiverseAdmin.jsx
// UXDD / CDD: Dashboard Administrador del Multiverso con Roy's Life y Dioses IA
// Comentarios y textos en español neutro premium.

import React, { useState, useEffect, useCallback } from 'react';
import {
  Globe, Plus, Trash2, Copy, Play, Pause, FastForward,
  User, Brain, Shield, Droplet, TrendingUp, TrendingDown,
  Activity, Eye, Zap, AlertTriangle, ChevronRight, RefreshCw,
  BookOpen, Skull, Heart, Flame, Star, Sun
} from 'lucide-react';

// Colores de estados mentales (HMM)
const MENTAL_COLORS = {
  satisfecho: '#00e676',
  preocupado: '#ffc107',
  frustrado: '#ff5722',
  radicalizado: '#d50000'
};

// Iconos de los dioses egipcios
const DEITY_ICONS = {
  thoth: '𓁟', anubis: '𓁢', horus: '𓅃',
  ra: '𓁛', isis: '𓆇', sejmet: '𓃭', ptah: '𓊪'
};

const MultiverseAdmin = ({ pythonApiUrl = 'http://localhost:5001' }) => {
  // === ESTADOS ===
  const [timelines, setTimelines] = useState([]);
  const [activeTimeline, setActiveTimeline] = useState('realidad_base');
  const [deities, setDeities] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [roysLifeData, setRoysLifeData] = useState(null);
  const [mentalDistribution, setMentalDistribution] = useState(null);
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1);
  const [newTimelineName, setNewTimelineName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [logs, setLogs] = useState([
    '🌀 Motor de Multiversos inicializado.',
    '𓁟 Thoth: Conectado al Data Lake PostgreSQL.',
    '𓁢 Anubis: Arañas OSINT en modo nocturno.',
    '𓅃 Horus: Mapa GIS calibrado para Hermosillo.'
  ]);

  const addLog = (msg) => {
    const ts = new Date().toLocaleTimeString();
    setLogs(prev => [`[${ts}] ${msg}`, ...prev.slice(0, 99)]);
  };

  // === FETCHERS ===
  const fetchTimelines = useCallback(async () => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/multiverse/timelines`);
      const data = await res.json();
      if (data.status === 'success') setTimelines(data.timelines);
    } catch (e) { /* sin conexión */ }
  }, [pythonApiUrl]);

  const fetchDeities = useCallback(async () => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/deities/status`);
      const data = await res.json();
      if (data.status === 'success') setDeities(data.deities);
    } catch (e) { /* sin conexión: usar fallback */ }
  }, [pythonApiUrl]);

  const fetchMentalDistribution = useCallback(async (tlId) => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/multiverse/mental-distribution?timeline_id=${tlId}`);
      const data = await res.json();
      if (data.status === 'success') setMentalDistribution(data);
    } catch (e) { /* sin conexión */ }
  }, [pythonApiUrl]);

  const fetchRoysLife = useCallback(async (agentId, tlId) => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/multiverse/roys-life?agent_id=${agentId}&timeline_id=${tlId}`);
      const data = await res.json();
      if (data.status === 'success') setRoysLifeData(data);
    } catch (e) { /* sin conexión */ }
  }, [pythonApiUrl]);

  useEffect(() => {
    fetchTimelines();
    fetchDeities();
    fetchMentalDistribution('realidad_base');
    // Seleccionar agente #42 por defecto para mostrar Roy's Life
    fetchRoysLife(42, 'realidad_base');
  }, [fetchTimelines, fetchDeities, fetchMentalDistribution, fetchRoysLife]);

  // === HANDLERS ===
  const handleCreateTimeline = async () => {
    if (!newTimelineName.trim()) return;
    const id = newTimelineName.trim().toLowerCase().replace(/\s+/g, '_');
    try {
      await fetch(`${pythonApiUrl}/api/gis-sandbox/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ciudad: 'hermosillo', timeline_id: id, structures: [], policies: { taxes: 12, security: 60, subsidy: 30 } })
      });
      addLog(`🌀 Universo "${newTimelineName}" creado exitosamente.`);
      setNewTimelineName('');
      setShowCreateModal(false);
      fetchTimelines();
    } catch (e) {
      addLog(`❌ Error al crear universo: ${e.message}`);
    }
  };

  const handleSelectAgent = (agentId) => {
    setSelectedAgent(agentId);
    fetchRoysLife(agentId, activeTimeline);
  };

  // === ESTILOS ===
  const styles = {
    container: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr 340px',
      gridTemplateRows: 'auto 1fr auto',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1526 40%, #111b2e 100%)',
      color: '#e0e6ed',
      fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      overflow: 'hidden'
    },
    topBar: {
      gridColumn: '1 / -1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      background: 'rgba(10, 14, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(0, 229, 255, 0.12)',
      zIndex: 10
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '1.15rem',
      fontWeight: 700,
      color: '#00e5ff',
      letterSpacing: '0.5px'
    },
    navTabs: {
      display: 'flex',
      gap: '4px'
    },
    navTab: (active) => ({
      padding: '7px 16px',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: active ? 600 : 400,
      color: active ? '#0a0e1a' : '#8892a4',
      background: active ? 'linear-gradient(135deg, #00e5ff, #00b8d4)' : 'transparent',
      border: active ? 'none' : '1px solid rgba(136,146,164,0.15)',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }),
    leftPanel: {
      gridRow: '2 / 4',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      overflowY: 'auto',
      borderRight: '1px solid rgba(0, 229, 255, 0.08)'
    },
    sectionTitle: {
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '1.2px',
      color: '#00e5ff',
      marginBottom: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    timelineCard: (isActive) => ({
      background: isActive
        ? 'linear-gradient(135deg, rgba(0,229,255,0.12) 0%, rgba(0,184,212,0.06) 100%)'
        : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isActive ? 'rgba(0,229,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
      borderRadius: '10px',
      padding: '10px 12px',
      cursor: 'pointer',
      transition: 'all 0.25s ease',
      position: 'relative'
    }),
    sparkline: (color = '#00e5ff') => ({
      width: '100%',
      height: '28px',
      background: `linear-gradient(to right, ${color}11, ${color}22)`,
      borderRadius: '4px',
      marginTop: '6px',
      display: 'flex',
      alignItems: 'flex-end',
      gap: '1px',
      padding: '2px'
    }),
    centerPanel: {
      gridRow: '2',
      display: 'flex',
      flexDirection: 'column',
      padding: '12px',
      gap: '12px',
      overflow: 'hidden'
    },
    worldCanvas: {
      flex: 1,
      background: 'linear-gradient(145deg, rgba(13,21,38,0.9) 0%, rgba(10,14,26,0.95) 100%)',
      border: '1px solid rgba(0,229,255,0.1)',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '300px'
    },
    mentalBar: {
      display: 'flex',
      height: '8px',
      borderRadius: '4px',
      overflow: 'hidden',
      width: '100%'
    },
    rightPanel: {
      gridRow: '2 / 4',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      overflowY: 'auto',
      borderLeft: '1px solid rgba(0,229,255,0.08)'
    },
    roysCard: {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,215,0,0.15)',
      borderRadius: '12px',
      padding: '14px'
    },
    metricBar: (value, color) => ({
      height: '6px',
      borderRadius: '3px',
      background: `linear-gradient(to right, ${color}, ${color}88)`,
      width: `${Math.min(100, Math.max(2, value))}%`,
      transition: 'width 0.5s ease'
    }),
    bottomPanel: {
      gridColumn: '2',
      display: 'flex',
      gap: '6px',
      padding: '8px 12px',
      overflowX: 'auto',
      borderTop: '1px solid rgba(0,229,255,0.08)'
    },
    deityChip: (estado) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 10px',
      borderRadius: '8px',
      fontSize: '0.7rem',
      background: estado === 'activo'
        ? 'rgba(0,230,118,0.08)'
        : 'rgba(255,193,7,0.08)',
      border: `1px solid ${estado === 'activo' ? 'rgba(0,230,118,0.25)' : 'rgba(255,193,7,0.25)'}`,
      whiteSpace: 'nowrap',
      minWidth: 'fit-content'
    }),
    badge: (color) => ({
      display: 'inline-block',
      padding: '1px 6px',
      borderRadius: '4px',
      fontSize: '0.6rem',
      fontWeight: 700,
      background: `${color}22`,
      color: color,
      textTransform: 'uppercase'
    }),
    btn: (variant = 'primary') => ({
      padding: '6px 12px',
      borderRadius: '7px',
      fontSize: '0.75rem',
      fontWeight: 600,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      transition: 'all 0.2s',
      ...(variant === 'primary'
        ? { background: 'linear-gradient(135deg, #00e5ff, #00b8d4)', color: '#0a0e1a' }
        : variant === 'danger'
        ? { background: 'rgba(213,0,0,0.15)', color: '#ff5252', border: '1px solid rgba(213,0,0,0.3)' }
        : { background: 'rgba(255,255,255,0.06)', color: '#8892a4', border: '1px solid rgba(255,255,255,0.1)' }
      )
    }),
    logConsole: {
      maxHeight: '120px',
      overflowY: 'auto',
      padding: '8px',
      background: 'rgba(0,0,0,0.3)',
      borderRadius: '8px',
      fontSize: '0.65rem',
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      color: '#64ffda',
      lineHeight: 1.5
    }
  };

  // === RENDER ===
  const profile = roysLifeData?.profile;
  const comparison = roysLifeData?.multiverse_comparison || {};

  return (
    <div style={styles.container}>
      {/* ====== BARRA SUPERIOR ====== */}
      <div style={styles.topBar}>
        <div style={styles.logo}>
          <Globe size={20} /> CívicaOS — Multiverso
        </div>
        <div style={styles.navTabs}>
          {['War Room', 'Multiverso', 'OSINT', 'Electoral', 'Economía', 'Agentes IA'].map((tab, i) => (
            <button key={tab} style={styles.navTab(i === 1)} onClick={() => {}}>
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button style={styles.btn(isSimRunning ? 'ghost' : 'primary')}
            onClick={() => { setIsSimRunning(!isSimRunning); addLog(isSimRunning ? '⏸ Simulación pausada.' : '▶️ Simulación reanudada.'); }}>
            {isSimRunning ? <Pause size={14} /> : <Play size={14} />}
            {isSimRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <select
            value={simSpeed}
            onChange={(e) => setSimSpeed(Number(e.target.value))}
            style={{ background: 'rgba(255,255,255,0.06)', color: '#e0e6ed', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '4px 8px', fontSize: '0.75rem' }}
          >
            <option value={1}>x1</option>
            <option value={5}>x5</option>
            <option value={10}>x10</option>
            <option value={100}>x100</option>
            <option value={1000}>x1000</option>
          </select>
        </div>
      </div>

      {/* ====== PANEL IZQUIERDO: MULTIVERSE MANAGER ====== */}
      <div style={styles.leftPanel}>
        <div>
          <div style={styles.sectionTitle}><Globe size={12} /> Gestor de Multiversos</div>
          <button style={{ ...styles.btn('primary'), width: '100%', justifyContent: 'center', marginBottom: '8px' }}
            onClick={() => setShowCreateModal(true)}>
            <Plus size={14} /> Crear Universo
          </button>

          {showCreateModal && (
            <div style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '8px', padding: '10px', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="Nombre del universo..."
                value={newTimelineName}
                onChange={(e) => setNewTimelineName(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid rgba(0,229,255,0.2)', background: 'rgba(0,0,0,0.3)', color: '#e0e6ed', fontSize: '0.78rem', marginBottom: '6px', boxSizing: 'border-box' }}
              />
              <div style={{ display: 'flex', gap: '6px' }}>
                <button style={styles.btn('primary')} onClick={handleCreateTimeline}>Crear</button>
                <button style={styles.btn('ghost')} onClick={() => setShowCreateModal(false)}>Cancelar</button>
              </div>
            </div>
          )}

          {timelines.map((tl) => (
            <div
              key={tl.id}
              style={styles.timelineCard(tl.id === activeTimeline)}
              onClick={() => { setActiveTimeline(tl.id); fetchMentalDistribution(tl.id); addLog(`👁 Observando: ${tl.name}`); }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: tl.id === activeTimeline ? '#00e5ff' : '#c0c8d4' }}>
                  {tl.name}
                </span>
                {tl.id !== 'realidad_base' && (
                  <button style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer', padding: '2px' }}
                    onClick={(e) => { e.stopPropagation(); addLog(`💀 Universo "${tl.name}" destruido.`); }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', fontSize: '0.65rem', color: '#8892a4' }}>
                <span>😊 {tl.global_metrics?.avg_happiness?.toFixed(1) || '—'}%</span>
                <span>📊 {tl.global_metrics?.vote_share?.Morena?.toFixed(1) || '—'}%</span>
              </div>
              {/* Mini sparkline simulada */}
              <div style={styles.sparkline(tl.id === activeTimeline ? '#00e5ff' : '#546e7a')}>
                {Array.from({ length: 20 }, (_, i) => {
                  const h = 5 + Math.sin(i * 0.5 + (tl.global_metrics?.avg_happiness || 50) * 0.1) * 10 + Math.random() * 4;
                  return <div key={i} style={{ flex: 1, height: `${h}px`, background: tl.id === activeTimeline ? '#00e5ff' : '#546e7a', borderRadius: '1px', opacity: 0.7 }} />;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Distribución de Estados Mentales (HMM) */}
        <div>
          <div style={styles.sectionTitle}><Brain size={12} /> Estados Mentales (HMM)</div>
          {mentalDistribution && (
            <>
              <div style={styles.mentalBar}>
                {Object.entries(mentalDistribution.mental_distribution || {}).map(([state, pct]) => (
                  <div key={state} style={{ width: `${pct}%`, background: MENTAL_COLORS[state], transition: 'width 0.5s ease' }} title={`${state}: ${pct}%`} />
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', marginTop: '6px' }}>
                {Object.entries(mentalDistribution.mental_distribution || {}).map(([state, pct]) => (
                  <div key={state} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.65rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: MENTAL_COLORS[state] }} />
                    <span style={{ color: '#8892a4', textTransform: 'capitalize' }}>{state}</span>
                    <span style={{ color: MENTAL_COLORS[state], fontWeight: 600 }}>{pct}%</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.6rem', color: '#546e7a', marginTop: '4px' }}>
                Tick: {mentalDistribution.tick || 0}
              </div>
            </>
          )}
        </div>

        {/* Log de la Consola */}
        <div>
          <div style={styles.sectionTitle}><Activity size={12} /> Bitácora del Sistema</div>
          <div style={styles.logConsole}>
            {logs.map((log, i) => <div key={i}>{log}</div>)}
          </div>
        </div>
      </div>

      {/* ====== PANEL CENTRAL: CANVAS WORLDBOX ====== */}
      <div style={styles.centerPanel}>
        <div style={styles.worldCanvas}>
          {/* Cuadrícula isométrica de la ciudad */}
          <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gridTemplateRows: 'repeat(4, 1fr)', gap: '2px', padding: '12px' }}>
            {Array.from({ length: 24 }, (_, i) => {
              const agentCount = 8 + (i * 7) % 20;
              const avgHappiness = 30 + ((i * 13) % 50);
              const hue = avgHappiness > 60 ? 150 : avgHappiness > 40 ? 50 : 0;
              return (
                <div
                  key={i}
                  style={{
                    background: `hsla(${hue}, 70%, 30%, 0.25)`,
                    border: `1px solid hsla(${hue}, 60%, 40%, 0.2)`,
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onClick={() => handleSelectAgent(i)}
                >
                  <span style={{ fontSize: '0.6rem', color: '#8892a4' }}>AGEB {(i + 1).toString().padStart(4, '0')}</span>
                  <div style={{ display: 'flex', gap: '2px', marginTop: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Array.from({ length: Math.min(agentCount, 12) }, (_, j) => {
                      const agentHappiness = 20 + ((i * 7 + j * 13) % 60);
                      const color = agentHappiness > 60 ? '#00e676' : agentHappiness > 40 ? '#ffc107' : agentHappiness > 25 ? '#ff5722' : '#d50000';
                      return (
                        <div
                          key={j}
                          style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            background: color, boxShadow: `0 0 4px ${color}`,
                            cursor: 'pointer', transition: 'transform 0.2s'
                          }}
                          onClick={(e) => { e.stopPropagation(); handleSelectAgent(i * 4 + j); }}
                          title={`Agente #${i * 4 + j}`}
                        />
                      );
                    })}
                  </div>
                  <span style={{ fontSize: '0.55rem', color: `hsl(${hue}, 60%, 60%)`, marginTop: '2px' }}>
                    😊 {avgHappiness}%
                  </span>
                </div>
              );
            })}
          </div>
          {/* Overlay con nombre del universo activo */}
          <div style={{
            position: 'absolute', top: '8px', left: '12px',
            background: 'rgba(0,229,255,0.1)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0,229,255,0.2)', borderRadius: '8px',
            padding: '4px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#00e5ff'
          }}>
            🌀 {timelines.find(t => t.id === activeTimeline)?.name || activeTimeline}
          </div>
        </div>
      </div>

      {/* ====== PANEL DERECHO: ROY'S LIFE ====== */}
      <div style={styles.rightPanel}>
        <div style={styles.sectionTitle}><BookOpen size={12} /> La Vida de Roy</div>

        {profile ? (
          <div style={styles.roysCard}>
            {/* Encabezado del agente */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #00e5ff33, #ffd60033)',
                border: '2px solid rgba(0,229,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem'
              }}>
                {profile.genero === 'F' ? '👩' : '👨'}
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffd600' }}>
                  {profile.nombre} {profile.apellido}
                </div>
                <div style={{ fontSize: '0.68rem', color: '#8892a4' }}>
                  Agente #{profile.agent_id} · {profile.edad} años · {profile.sector} · {profile.colonia}
                </div>
              </div>
            </div>

            {/* Estado Mental Actual */}
            <div style={{ marginBottom: '10px' }}>
              <span style={{
                ...styles.badge(MENTAL_COLORS[profile.mental_state] || '#fff'),
                fontSize: '0.68rem', padding: '2px 8px'
              }}>
                {profile.mental_state}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#8892a4', marginLeft: '6px' }}>
                Voto: {profile.vote_intention}
              </span>
            </div>

            {/* Barras de KPIs */}
            {[
              { label: 'Felicidad', value: profile.happiness, color: '#00e676', icon: <Heart size={10} /> },
              { label: 'Estrés Económico', value: profile.economic_stress, color: '#ff5722', icon: <TrendingDown size={10} /> },
              { label: 'Frustración', value: profile.frustration, color: '#ffc107', icon: <Flame size={10} /> },
              { label: 'Aprobación Gob.', value: profile.government_approval, color: '#2979ff', icon: <Star size={10} /> },
              { label: 'Dolor Hídrico', value: profile.water_pain, color: '#00bcd4', icon: <Droplet size={10} /> }
            ].map(({ label, value, color, icon }) => (
              <div key={label} style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#8892a4', marginBottom: '2px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>{icon} {label}</span>
                  <span style={{ color, fontWeight: 600 }}>{value}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                  <div style={styles.metricBar(value, color)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...styles.roysCard, textAlign: 'center', color: '#546e7a', fontSize: '0.78rem', padding: '30px' }}>
            <User size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
            <div>Haz clic en un agente del mapa para ver su vida.</div>
          </div>
        )}

        {/* Comparación Multiversal */}
        {Object.keys(comparison).length > 0 && (
          <div>
            <div style={styles.sectionTitle}><Globe size={12} /> Comparación entre Universos</div>
            {Object.entries(comparison).map(([tlId, data]) => (
              <div key={tlId} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px', padding: '8px 10px', marginBottom: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#b0bec5' }}>{data.timeline_name}</span>
                  <span style={styles.badge(MENTAL_COLORS[data.mental_state] || '#fff')}>
                    {data.mental_state}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.63rem', color: '#8892a4' }}>
                  <span>😊 {data.happiness?.toFixed(1)}%</span>
                  <span>📉 {data.economic_stress?.toFixed(1)}%</span>
                  <span>🗳 {data.vote_intention}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selector Rápido de Agentes */}
        <div>
          <div style={styles.sectionTitle}><Eye size={12} /> Selección Rápida</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {[0, 10, 20, 30, 42, 50, 60, 75, 90, 99].map(id => (
              <button
                key={id}
                style={{
                  ...styles.btn(selectedAgent === id ? 'primary' : 'ghost'),
                  padding: '3px 8px', fontSize: '0.65rem'
                }}
                onClick={() => handleSelectAgent(id)}
              >
                #{id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ====== BARRA INFERIOR: DIOSES IA ====== */}
      <div style={styles.bottomPanel}>
        {deities.map((d) => (
          <div key={d.id} style={styles.deityChip(d.estado)}>
            <span style={{ fontSize: '1rem' }}>{DEITY_ICONS[d.id] || '⚡'}</span>
            <div>
              <div style={{ fontWeight: 600, color: d.estado === 'activo' ? '#00e676' : '#ffc107' }}>
                {d.nombre?.replace(/𓁟|𓁢|𓅃|𓁛|𓆇|𓃭|𓊪/g, '').trim()}
              </div>
              <div style={{ fontSize: '0.58rem', color: '#8892a4', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {d.tarea_actual}
              </div>
            </div>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: `conic-gradient(${d.estado === 'activo' ? '#00e676' : '#ffc107'} ${d.progreso}%, transparent ${d.progreso}%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.55rem', fontWeight: 700, color: '#e0e6ed'
            }}>
              {d.progreso}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiverseAdmin;
