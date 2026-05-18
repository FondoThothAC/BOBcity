// src/components/MasterConsole.jsx
// Master Administrative Console - Exclusive for CívicaOS Admins

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  Users, 
  Terminal, 
  TrendingUp, 
  Activity, 
  Copy, 
  Check, 
  Plus, 
  Trash2,
  Lock,
  Globe,
  Settings,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { themes } from '../themeManager';
import OrchestratorConsole from './OrchestratorConsole';

export default function MasterConsole({ clients, onAddClient, onDeleteClient, onUpdateClient }) {
  const [activeSubTab, setActiveSubTab] = useState('clients');
  const [isCalibrating, setIsCalibrating] = useState(null);
  
  // Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientCode, setNewClientCode] = useState('');
  const [newClientRegion, setNewClientRegion] = useState('');
  const [newClientPop, setNewClientPop] = useState(75000);
  const [newClientTheme, setNewClientTheme] = useState('glass-classic');

  // Copy State
  const [copiedCode, setCopiedCode] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newClientName || !newClientCode || !newClientRegion) return;

    onAddClient({
      id: Date.now().toString(),
      name: newClientName,
      code: newClientCode.toUpperCase().trim(),
      region: newClientRegion,
      population: parseInt(newClientPop) || 50000,
      themeId: newClientTheme,
      active: true
    });

    // Reset Form
    setNewClientName('');
    setNewClientCode('');
    setNewClientRegion('');
    setNewClientPop(75000);
    setNewClientTheme('glass-classic');
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 👑 Master Header */}
      <div className="glass-card glow-blue" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(8, 15, 30, 0.9) 0%, rgba(15, 30, 60, 0.9) 100%)',
        border: '1px solid var(--neon-blue)'
      }}>
        <div style={{ maxWidth: '80%' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff' }}>
            <ShieldAlert size={22} color="var(--neon-rose)" />
            CívicaOS Engine: Tablero Master Administrativo
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Consola centralizada para aprovisionamiento de clientes de marca blanca, orquestación cognitiva de agentes de IA y analíticas globales de facturación.
          </p>
        </div>
        <div>
          <span className="tag-badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--neon-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            👑 Modo Super-Admin
          </span>
        </div>
      </div>

      {/* Sub-tabs menu */}
      <div className="segment-selector">
        <button 
          className={`segment-btn ${activeSubTab === 'clients' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('clients')}
        >
          <Users size={14} style={{ marginRight: '0.35rem' }} />
          Aprovisionamiento y Clientes
        </button>
        <button 
          className={`segment-btn ${activeSubTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('metrics')}
        >
          <TrendingUp size={14} style={{ marginRight: '0.35rem' }} />
          Métricas y Facturación
        </button>
        <button 
          className={`segment-btn ${activeSubTab === 'openclaw' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('openclaw')}
        >
          <Terminal size={14} style={{ marginRight: '0.35rem' }} />
          Orquestador Swarm OpenClaw
        </button>
        <button 
          className={`segment-btn ${activeSubTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('pipeline')}
          style={{ borderColor: clients.filter(c => c.phase === 1).length > 0 ? 'rgba(239, 68, 68, 0.25)' : '' }}
        >
          <Clock size={14} style={{ marginRight: '0.35rem' }} />
          Cola de Aprobaciones
          {clients.filter(c => c.phase === 1).length > 0 && (
            <span style={{ 
              marginLeft: '0.4rem', 
              background: 'var(--neon-rose)', 
              color: 'black', 
              fontSize: '0.6rem', 
              fontWeight: '800', 
              padding: '0.1rem 0.35rem', 
              borderRadius: '10px' 
            }}>
              {clients.filter(c => c.phase === 1).length}
            </span>
          )}
        </button>
      </div>

      {/* Dynamic Content */}
      {activeSubTab === 'clients' && (
        <div className="workspace-grid-2">
          
          {/* LADO IZQUIERDO: Formulario de Creación de Clientes */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
              <UserPlus size={18} color="var(--neon-blue)" />
              Dar de Alta Nuevo Cliente
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Nombre del Cliente / Campaña:</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Gobierno de Hermosillo" 
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required
                    className="citizen-input"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Código de Acceso Exclusivo:</label>
                  <input 
                    type="text" 
                    placeholder="Ej. HER-DIS-08" 
                    value={newClientCode}
                    onChange={(e) => setNewClientCode(e.target.value)}
                    required
                    className="citizen-input"
                    style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Región o Municipio:</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Hermosillo, Sonora" 
                    value={newClientRegion}
                    onChange={(e) => setNewClientRegion(e.target.value)}
                    required
                    className="citizen-input"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Tamaño de Población Sintética:</label>
                  <select 
                    value={newClientPop} 
                    onChange={(e) => setNewClientPop(e.target.value)}
                    className="citizen-input"
                  >
                    <option value="25000">25,000 agentes (Ligero - Rápido)</option>
                    <option value="75000">75,000 agentes (Recomendado - 100%)</option>
                    <option value="150000">150,000 agentes (Profundo - Tier 2)</option>
                    <option value="500000">500,000 agentes (Masivo - Tier 3)</option>
                  </select>
                </div>
              </div>

              {/* Tema de Marca Blanca */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Asignar UI/UX Premium (Ocultar Proveedor):</label>
                
                <div className="theme-card-grid">
                  {Object.entries(themes).map(([id, theme]) => {
                    // Extract colors for visual indicator
                    const accentColor = theme.variables['--accent-color'];
                    const appBg = theme.variables['--bg-app'].includes('gradient') ? '#0c0721' : theme.variables['--bg-app'];
                    
                    return (
                      <div 
                        key={id}
                        className={`theme-card-option ${newClientTheme === id ? 'active' : ''}`}
                        onClick={() => setNewClientTheme(id)}
                        title={theme.description}
                      >
                        <div style={{ 
                          width: '100%', 
                          height: '24px', 
                          borderRadius: '4px', 
                          background: appBg, 
                          border: `1px solid ${accentColor}`,
                          marginBottom: '0.4rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: accentColor }}></div>
                        </div>
                        <span style={{ fontSize: '0.65rem' }}>{theme.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-premium"
                style={{ 
                  marginTop: '1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem' 
                }}
              >
                <Plus size={16} />
                Aprovisionar Cliente e inyectar en Base
              </button>
            </form>
          </div>

          {/* LADO DERECHO: Lista de Clientes Activos */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
              <Globe size={18} color="var(--neon-emerald)" />
              Clientes Activos y Conexiones
            </h3>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              A continuación se listan los códigos de marca blanca actualmente aprovisionados en CívicaOS:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '0.2rem' }}>
              {clients.map((client) => {
                const isCustom = client.id !== '1' && client.id !== '2' && client.id !== '3';
                return (
                  <div 
                    key={client.id}
                    className="glass-card"
                    style={{ 
                      padding: '1rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.2)',
                      borderColor: client.code === 'CIVICAOS-MASTER' ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-glass)'
                    }}
                  >
                    <div>
                      <h4 style={{ fontSize: '0.85rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {client.name}
                        {client.code === 'CIVICAOS-MASTER' && (
                          <span style={{ fontSize: '0.55rem', background: 'rgba(239,68,68,0.2)', color: 'var(--neon-rose)', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>MASTER</span>
                        )}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <span>📍 {client.region}</span>
                        <span>•</span>
                        <span>👥 {client.population.toLocaleString()}</span>
                        <span>•</span>
                        <span style={{ color: 'var(--neon-blue)', fontWeight: '700' }}>🎨 {themes[client.themeId]?.name || client.themeId}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <div 
                        style={{ 
                          fontFamily: 'monospace', 
                          background: 'rgba(0,0,0,0.4)', 
                          padding: '0.3rem 0.6rem', 
                          borderRadius: '4px', 
                          fontSize: '0.75rem', 
                          border: '1px solid var(--border-glass)',
                          color: 'var(--neon-emerald)',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        {client.code}
                        <button 
                          onClick={() => handleCopy(client.code)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          {copiedCode === client.code ? <Check size={12} color="var(--neon-emerald)" /> : <Copy size={12} />}
                        </button>
                      </div>

                      {isCustom && (
                        <button 
                          onClick={() => onDeleteClient(client.id)}
                          style={{ 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            border: '1px solid rgba(239, 68, 68, 0.2)', 
                            borderRadius: '4px', 
                            padding: '0.3rem', 
                            cursor: 'pointer', 
                            color: 'var(--neon-rose)' 
                          }}
                          title="Eliminar cliente"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {activeSubTab === 'metrics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* PREMIUM SaaS METRICS GRID */}
          <div className="stats-grid">
            <div className="glass-card glow-blue stat-item">
              <div className="stat-header">
                <span>Ingreso Total Mensual</span>
                <TrendingUp size={16} color="var(--neon-emerald)" />
              </div>
              <span className="stat-value">$2.4M MXN</span>
              <span className="stat-trend trend-up">▲ +18.4% este mes</span>
            </div>

            <div className="glass-card stat-item">
              <div className="stat-header">
                <span>Proyectado Anual (SaaS)</span>
                <TrendingUp size={16} color="var(--neon-blue)" />
              </div>
              <span className="stat-value">$28.8M MXN</span>
              <span className="stat-trend trend-up">▲ 100% de retención</span>
            </div>

            <div className="glass-card stat-item">
              <div className="stat-header">
                <span>Clientes Activos SaaS</span>
                <Users size={16} color="var(--neon-purple)" />
              </div>
              <span className="stat-value">9 Activos</span>
              <span className="stat-trend trend-stable">▲ 2 en onboarding</span>
            </div>

            <div className="glass-card stat-item">
              <div className="stat-header">
                <span>Costo API / Tokens IA</span>
                <Settings size={16} color="var(--neon-emerald)" />
              </div>
              <span className="stat-value">$0 MXN</span>
              <span className="stat-trend trend-up">▼ 100% Local-First</span>
            </div>
          </div>

          {/* SaaS BILLING & PACKAGES TABLE */}
          <div className="glass-card glow-purple" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--neon-purple)" />
              SaaS Billing · Paquetes y Facturación por Proyecto
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Facturación asignada a las marcas blancas locales de CívicaOS Engine (ThothAgora).
            </p>
            <div style={{ overflowX: 'auto', marginTop: '0.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Proyecto / Campaña</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Paquete</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Valor Licencia (MXN)</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Fase / Estatus</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Próximo Cobro</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { code: 'MOR-SON-2026', plan: 'ORO', amount: '$15,500,000', phase: 'Entrega 2', phaseColor: 'var(--neon-blue)', due: 'Jun 01', planColor: 'var(--neon-purple)' },
                    { code: 'HER-DIS-08', plan: 'PLATA', amount: '$900,000', phase: 'Activo', phaseColor: 'var(--neon-emerald)', due: 'May 28', planColor: 'var(--neon-blue)' },
                    { code: 'GDL-DIS-03', plan: 'PLATA', amount: '$900,000', phase: 'Pendiente', phaseColor: 'var(--neon-amber)', due: '—', planColor: 'var(--neon-blue)' },
                    { code: 'HER-MUN-01', plan: 'BRONCE', amount: '$900,000', phase: 'Configuración', phaseColor: 'var(--neon-blue)', due: 'Jun 15', planColor: 'var(--text-secondary)' },
                  ].map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                      <td style={{ padding: '0.75rem 0.5rem', fontWeight: '700' }}>{row.code}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: '800', 
                          background: 'rgba(255,255,255,0.03)', 
                          color: row.planColor, 
                          padding: '0.2rem 0.4rem', 
                          borderRadius: '4px',
                          border: `1px solid ${row.planColor}22`
                        }}>
                          {row.plan}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace' }}>{row.amount}</td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          background: 'rgba(255,255,255,0.02)', 
                          color: row.phaseColor, 
                          padding: '0.2rem 0.4rem', 
                          borderRadius: '4px',
                          border: `1px solid ${row.phaseColor}22`
                        }}>
                          {row.phase}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{row.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 📊 Pure CSS Simulated Traffic Charts */}
          <div className="workspace-grid-2">
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'white' }}>Distribución de Consumo por Cliente (Últimos 30 días)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {[
                  { name: 'Gobierno de Hermosillo', code: 'HER-DIS-08', value: 65, color: 'var(--neon-blue)' },
                  { name: 'Campaña Claudia Rivera', code: 'MORENA-SONORA-2026', value: 20, color: 'var(--neon-purple)' },
                  { name: 'Campaña Manuel Astiazarán', code: 'PAN-HERMOSILLO', value: 12, color: 'var(--neon-amber)' },
                  { name: 'Otros Canales / APIs libres', code: 'API-PUBLIC', value: 3, color: 'var(--neon-emerald)' }
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span><strong>{item.name}</strong> ({item.code})</span>
                      <strong>{item.value}%</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${item.value}%`, height: '100%', background: item.color, borderRadius: '10px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: 'white' }}>Estado de Servidor y Rate Limiters</h3>
              
              <ul className="info-list" style={{ marginTop: '0.5rem' }}>
                <li className="info-row">
                  <span>SQLite DB Space</span>
                  <span style={{ color: 'var(--neon-emerald)' }}>4.2 MB / Saludable</span>
                </li>
                <li className="info-row">
                  <span>Memory Usage (Consola local)</span>
                  <span style={{ color: 'var(--neon-emerald)' }}>12.1 MB active</span>
                </li>
                <li className="info-row">
                  <span>Caddy Reverse Proxy Cache</span>
                  <span style={{ color: 'var(--neon-blue)' }}>99.2% hit rate</span>
                </li>
                <li className="info-row">
                  <span>OpenClaw Core Status</span>
                  <span style={{ color: 'var(--neon-emerald)' }}>Connected (Ollama local)</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'openclaw' && (
        <div className="glass-card" style={{ padding: '0.5rem' }}>
          <OrchestratorConsole />
        </div>
      )}

      {activeSubTab === 'pipeline' && (
        <div className="glass-card scale-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} color="var(--neon-rose)" />
                Cola de Aprobación de Campañas (Onboarding Pipeline)
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Verifica los pagos de licencias y aprueba la calibración de gemelos digitales para clientes en onboarding.
              </p>
            </div>
            <span className="tag-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--neon-rose)' }}>
              {clients.filter(c => c.phase === 1).length} pendientes
            </span>
          </div>

          {clients.filter(c => c.phase === 1).length === 0 ? (
            <div style={{ 
              padding: '3rem', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '1rem',
              background: 'rgba(0,0,0,0.1)',
              borderRadius: '8px',
              border: '1px dashed var(--border-glass)'
            }}>
              <ShieldCheck size={36} color="var(--neon-emerald)" />
              <div>
                <h4 style={{ fontSize: '0.9rem', color: 'white', fontWeight: '700' }}>Sin solicitudes pendientes</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Todos los clientes activos en CívicaOS ya completaron su onboarding y pago.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {clients.filter(c => c.phase === 1).map((client) => {
                const accentColor = themes[client.themeId]?.variables['--accent-color'] || 'var(--neon-blue)';
                return (
                  <div 
                    key={client.id}
                    className="glass-card scale-in"
                    style={{ 
                      padding: '1.5rem', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      background: 'rgba(0,0,0,0.2)',
                      borderLeft: `4px solid ${accentColor}`
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'white' }}>{client.name}</h4>
                        <span style={{ fontSize: '0.6rem', background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.35rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                          {client.code}
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        <span>📍 Región: <strong>{client.region}</strong></span>
                        <span>•</span>
                        <span>👥 Censo: <strong>{client.population.toLocaleString()} agentes</strong></span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: accentColor }}></span>
                          Tema: <strong>{themes[client.themeId]?.name}</strong>
                        </span>
                      </div>

                      {/* Status row */}
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.7rem' }}>
                        <span style={{ 
                          color: client.subscription && client.subscription !== 'none' ? 'var(--neon-emerald)' : 'var(--neon-rose)', 
                          fontWeight: '700',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          Plan: {client.subscription ? client.subscription.toUpperCase() : 'NINGUNO'}
                        </span>
                        <span style={{ 
                          color: client.paymentVerified ? 'var(--neon-emerald)' : 'var(--neon-rose)', 
                          fontWeight: '700',
                          background: 'rgba(255,255,255,0.04)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px'
                        }}>
                          Pago: {client.paymentVerified ? '✓ VERIFICADO' : '⏳ PENDIENTE'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {!client.paymentVerified ? (
                        <button 
                          className="btn-premium"
                          onClick={() => onUpdateClient({ ...client, paymentVerified: true })}
                          style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}
                        >
                          Verificar Transacción
                        </button>
                      ) : (
                        <button 
                          className="btn-premium glow-pulse"
                          onClick={() => {
                            setIsCalibrating(client.id);
                            setTimeout(() => {
                              onUpdateClient({ 
                                ...client, 
                                phase: 2, 
                                active: true 
                              });
                              setIsCalibrating(null);
                            }, 2000);
                          }}
                          disabled={isCalibrating === client.id}
                          style={{ 
                            fontSize: '0.75rem', 
                            padding: '0.5rem 1rem',
                            background: 'linear-gradient(135deg, var(--neon-emerald) 0%, #10b981 100%)',
                            color: 'black',
                            fontWeight: '800'
                          }}
                        >
                          {isCalibrating === client.id ? 'Calibrando Censo IA...' : 'Aprobar & Calibrar Gemelo'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
