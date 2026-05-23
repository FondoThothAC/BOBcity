// src/components/AgentRawView.jsx
// CDD / UXDD: Nivel 3 Agent raw citizen data portal, anti-bot GNN scores, and execution console.
import React, { useState } from 'react';
import { 
  Sparkles, 
  Terminal, 
  ShieldAlert, 
  MapPin, 
  Activity, 
  Cpu, 
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Compass
} from 'lucide-react';

export default function AgentRawView({ clients = [] }) {
  const [selectedClientCode, setSelectedClientCode] = useState(clients[0]?.code || 'HER-DIS-08');
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [showConsoleModal, setShowConsoleModal] = useState(false);
  const [filterTerm, setFilterTerm] = useState('');

  const selectedClient = clients.find(c => c.code === selectedClientCode) || clients[0] || {
    name: 'Gobierno de Hermosillo D8',
    code: 'HER-DIS-08',
    region: 'Hermosillo, Sonora',
    level: 'Distrito Local',
    office: 'Diputación Local',
    population: 75000
  };

  // Static high-fidelity mock data representing raw citizen capture (Nivel 1 ThothAgora) with anti-bot geolocalización metadata
  const rawSubmissions = [
    {
      id: 'RAW-83201',
      cp: '83205',
      colonia: 'Palo Verde',
      ip: '189.203.44.12',
      device: 'Safari / iOS (iPhone 14)',
      gps: '29.0435, -110.9621 (±12m)',
      painAverage: '7.5',
      botScore: '0.02',
      isBot: false,
      proposal: 'No hay nada de agua por la tarde. El servicio se corta a las 2 pm y regresa hasta la medianoche en la colonia Palo Verde.',
      timestamp: '2026-05-18T19:42:15Z'
    },
    {
      id: 'RAW-83202',
      cp: '83200',
      colonia: 'Centro',
      ip: '45.33.112.5',
      device: 'Headless Chrome / Linux (Proxy Tor)',
      gps: '29.0801, -110.9500 (±250m)',
      painAverage: '9.8',
      botScore: '0.98',
      isBot: true,
      proposal: 'BUY BITCOIN FAST - HTTP://SCAM-SPAM-ATTACK.NET/OFFER - BEST REWARDS NOW',
      timestamp: '2026-05-18T19:40:02Z'
    },
    {
      id: 'RAW-83203',
      cp: '83208',
      colonia: 'Sahuaro',
      ip: '189.155.82.115',
      device: 'Chrome / Android (Samsung S23)',
      gps: '29.0911, -110.9942 (±8m)',
      painAverage: '6.2',
      botScore: '0.11',
      isBot: false,
      proposal: 'Los baches en la calle Solidaridad son enormes, ya dañaron la suspensión de tres carros de mis vecinos esta semana.',
      timestamp: '2026-05-18T19:35:40Z'
    },
    {
      id: 'RAW-83204',
      cp: '83200',
      colonia: 'Centro',
      ip: '45.33.112.9',
      device: 'Headless Chrome / Linux (Proxy Tor)',
      gps: '29.0801, -110.9500 (±250m)',
      painAverage: '10.0',
      botScore: '0.99',
      isBot: true,
      proposal: 'SPAM CAMPAIGN ATTACK 5493 - REDIRECT TRAFFIC TO MUNICIPAL SITE',
      timestamp: '2026-05-18T19:34:11Z'
    },
    {
      id: 'RAW-83205',
      cp: '83290',
      colonia: 'Proyecto Río Sonora',
      ip: '201.175.99.82',
      device: 'Edge / Windows 11 (Desktop)',
      gps: '29.0620, -110.9555 (±5m)',
      painAverage: '5.0',
      botScore: '0.04',
      isBot: false,
      proposal: 'Sugerimos un corredor verde y ciclovías integradas en el canal del Río Sonora para conectar con la zona del centro de negocios.',
      timestamp: '2026-05-18T19:30:22Z'
    }
  ];

  const handleRunPipeline = () => {
    setShowConsoleModal(true);
    setPipelineRunning(true);
    setTerminalLogs([]);

    const steps = [
      `⚡ [NIVEL 3] Iniciando pipeline de validación cívica OpenClaw para [${selectedClient.code}]...`,
      `🔍 Cargando gemelo social de ${selectedClient.name} (${selectedClient.level}) en ${selectedClient.region}...`,
      `👥 Inicializando modelo de población de ${selectedClient.population.toLocaleString()} agentes virtuales...`,
      '🤖 Ejecutando GNN (Graph Neural Network) para detección de botnets y astroturfing...',
      '🚨 Bot detectado en IP 45.33.112.5 (Score: 0.98). Estado: Silenciado.',
      '🚨 Bot detectado en IP 45.33.112.9 (Score: 0.99). Estado: Silenciado.',
      '✨ 3 registros humanos validados con éxito.',
      `🧬 Alimentando población sintética del Sandbox ABM con demandas de cargo [${selectedClient.office}]...`,
      '⚙️ Ejecutando 1,500 iteraciones del motor Deffuant-Weisbuch de evolución social...',
      '🧠 Analizando correlaciones cruzadas de +1024 factores demográficos...',
      '📝 Generando planes de acción estructurados en Markdown...',
      '💾 Guardando compilación final en sqlite database local...',
      `🚀 Publicando Plan de Acción optimizado al Dashboard del Cliente (Nivel 2) [${selectedClient.code}] con éxito.`,
      `✅ Proceso finalizado. El Gemelo Digital de ${selectedClient.region} ha sido calibrado.`
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, step]);
        if (idx === steps.length - 1) {
          setPipelineRunning(false);
        }
      }, (idx + 1) * 600);
    });
  };

  const filtered = rawSubmissions.filter(sub => 
    sub.colonia.toLowerCase().includes(filterTerm.toLowerCase()) ||
    sub.proposal.toLowerCase().includes(filterTerm.toLowerCase()) ||
    sub.id.toLowerCase().includes(filterTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 🏺 Header Banner */}
      <div className="glass-card glow-purple" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(15, 10, 30, 0.9) 0%, rgba(20, 15, 45, 0.9) 100%)',
        border: '1px solid var(--neon-purple)'
      }}>
        <div style={{ maxWidth: '75%' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--neon-purple)' }}>
            <Terminal size={20} />
            Consola de Datos Crudos y Detección GNN Anti-Bot (Nivel 3)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Consola operativa para agentes y analistas de CivicPulse. Aquí se auditan los metadatos técnicos crudos capturados invisibles (IP, dispositivo, geolocalización) y se ejecuta el pipeline cognitivo hacia el Nivel 2.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={handleRunPipeline}
            className="btn-premium"
            style={{ 
              background: 'linear-gradient(90deg, var(--neon-purple) 0%, var(--neon-blue) 100%)',
              borderColor: 'var(--neon-purple)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem'
            }}
          >
            <Cpu size={14} />
            Ejecutar Pipeline Completo
          </button>
        </div>
      </div>

      {/* 🏷️ Selector de Campaña / Proyecto (Auditoría Global) */}
      <div className="glass-card scale-in" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.25rem',
        borderLeft: '4px solid var(--neon-purple)',
        background: 'rgba(15, 10, 30, 0.45)',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>🔎 Auditar Proyecto de Campaña Activa:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
            <span className="tag-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--neon-purple)', borderColor: 'rgba(139, 92, 246, 0.2)', textTransform: 'uppercase', fontSize: '0.65rem' }}>
              {selectedClient.level || 'Distrito Local'}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: '800' }}>
              {selectedClient.name} • {selectedClient.office || 'Diputación Local'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              ({selectedClient.region} • 👥 {selectedClient.population?.toLocaleString() || '75,000'} censo simulado)
            </span>
          </div>
        </div>

        <div>
          <select
            value={selectedClientCode}
            onChange={(e) => setSelectedClientCode(e.target.value)}
            className="citizen-input"
            style={{ 
              minWidth: '280px', 
              fontFamily: 'var(--ff-mono)', 
              fontSize: '0.75rem',
              background: 'rgba(0,0,0,0.5)',
              borderColor: 'var(--neon-purple)',
              color: '#fff',
              outline: 'none'
            }}
          >
            {clients.length === 0 ? (
              <option value="HER-DIS-08">[HER-DIS-08] Gobierno de Hermosillo D8</option>
            ) : (
              clients.map(c => (
                <option key={c.id} value={c.code}>
                  [{c.code}] {c.name} ({c.level || 'Distrito Local'})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* 📊 Métricas Operativas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
          <div style={{ color: 'var(--neon-blue)' }}><Activity size={24} /></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Total Registros Ingeridos</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fff' }}>5 Recibidos</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
          <div style={{ color: 'var(--neon-rose)' }}><ShieldAlert size={24} /></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Ataques de Botnets Mitigados</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-rose)' }}>2 Detectados</span>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem' }}>
          <div style={{ color: 'var(--neon-emerald)' }}><Compass size={24} /></div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Tasa Anti-Bot GNN</span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-emerald)' }}>99.8% Efectividad</span>
          </div>
        </div>
      </div>

      {/* 🔍 Buscador y Filtros */}
      <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          placeholder="Buscar por ID, colonia o texto de la propuesta..." 
          value={filterTerm}
          onChange={(e) => setFilterTerm(e.target.value)}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontSize: '0.85rem',
            flex: 1
          }}
        />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          Mostrando {filtered.length} de {rawSubmissions.length}
        </span>
      </div>

      {/* 📝 Tabla de Datos Crudos Ingeridos */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                <th style={{ padding: '1rem' }}>ID & Fecha</th>
                <th style={{ padding: '1rem' }}>Ubicación & IP</th>
                <th style={{ padding: '1rem' }}>Firma de Dispositivo</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Prob. Bot GNN</th>
                <th style={{ padding: '1rem' }}>Sugerencia / Demanda Cruda</th>
                <th style={{ padding: '1rem', textTransform: 'uppercase' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub) => (
                <tr key={sub.id} style={{ 
                  borderBottom: '1px solid var(--border-glass)',
                  background: sub.isBot ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                  transition: 'var(--transition-smooth)'
                }}>
                  <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                    <strong style={{ display: 'block', color: 'var(--neon-blue)', fontFamily: 'monospace' }}>{sub.id}</strong>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{new Date(sub.timestamp).toLocaleTimeString()}</span>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '700' }}>
                      <MapPin size={12} color="var(--neon-rose)" />
                      {sub.colonia}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', fontFamily: 'monospace', marginTop: '0.2rem' }}>IP: {sub.ip}</span>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'top', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'block', fontSize: '0.75rem' }}>{sub.device}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--neon-purple)', fontFamily: 'monospace' }}>GPS: {sub.gps}</span>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'top', textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      fontWeight: '800',
                      color: sub.isBot ? 'var(--neon-rose)' : 'var(--neon-emerald)',
                      background: sub.isBot ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {sub.botScore}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'top', maxWidth: '300px', lineHeight: '1.4', color: sub.isBot ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {sub.proposal}
                  </td>
                  <td style={{ padding: '1rem', verticalAlign: 'top' }}>
                    {sub.isBot ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--neon-rose)', fontWeight: '700', fontSize: '0.7rem' }}>
                        <XCircle size={14} />
                        SILENCIADO
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--neon-emerald)', fontWeight: '700', fontSize: '0.7rem' }}>
                        <CheckCircle size={14} />
                        CENSO ACTIVO
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚪 Modal de Consola de Simulación */}
      {showConsoleModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 2, 10, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'grid',
          placeItems: 'center'
        }}>
          <div className="glass-card" style={{ 
            maxWidth: '650px', 
            width: '90%', 
            padding: '2rem',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 25px rgba(139, 92, 246, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                <Terminal size={18} color="var(--neon-purple)" />
                Consola del Pipeline Cognitivo (Nivel 3)
              </h3>
              {pipelineRunning && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--neon-blue)' }}>
                  <RefreshCw size={12} className="spin" />
                  Ejecutando...
                </div>
              )}
            </div>

            {/* Terminal Window mock */}
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '1rem',
              height: '300px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#a7f3d0',
              lineHeight: '1.4'
            }}>
              {terminalLogs.map((log, idx) => (
                <div key={idx} style={{ 
                  color: log.includes('🚨') ? 'var(--neon-rose)' : 
                         log.includes('✅') || log.includes('✨') ? 'var(--neon-emerald)' : 
                         log.includes('⚡') ? 'var(--neon-purple)' : '#a7f3d0'
                }}>
                  {log}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                className="btn-outline" 
                disabled={pipelineRunning}
                onClick={() => setShowConsoleModal(false)}
                style={{ padding: '0.5rem 1.25rem', fontSize: '0.8rem' }}
              >
                Cerrar Consola
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
