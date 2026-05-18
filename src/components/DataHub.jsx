import React, { useState } from 'react';
import { Database, Download, Key, Sparkles, Code, Check } from 'lucide-react';

export default function DataHub() {
  const [apiKey, setApiKey] = useState("cp_live_80faac02081046d08b870994ee26c0fb");
  const [copied, setCopied] = useState(false);

  const generateNewKey = () => {
    const chars = "abcdef0123456789";
    let newKey = "cp_live_";
    for (let i = 0; i < 32; i++) {
      newKey += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(newKey);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mockApiResponse = `{
  "status": "success",
  "data": {
    "region": "Hermosillo, Sonora",
    "district": "D8_SUR",
    "synthetic_population_size": 45000,
    "metrics": {
      "average_happiness": 46.2,
      "primary_pain_point": "water_access",
      "pain_intensity_score": 82.5
    },
    "vote_share_projection": {
      "incumbent_social_party": 51.4,
      "opposition_market_party": 48.6,
      "undecided_volatiles": 12.3
    }
  }
}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Pitch Header */}
      <div className="glass-card glow-blue">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={18} color="var(--neon-blue)" />
          CivicPulse Data Marketplace & APIs
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Comercializa inteligencia cívica mediante censos sintéticos de alta fidelidad, reportes de volatilidad electoral y APIs en tiempo real para inversores y consultores políticos, 100% calibrados con privacidad diferencial.
        </p>
      </div>

      {/* Planes de Suscripción */}
      <div className="workspace-grid-3">
        
        {/* Plan Básico */}
        <div className="plan-card">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Académico / ONG</h3>
            <div style={{ margin: '1rem 0' }}>
              <span style={{ fontSize: '2rem', fontWeight: '800' }}>$0</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> / Siempre libre</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Para investigadores sociales y proyectos comunitarios sin fines de lucro.
            </p>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Estadísticas municipales agregadas</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Acceso a mapas de calor de dolor básicos</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Reporte anual de cumplimiento</li>
            </ul>
          </div>
          <button className="btn-outline" style={{ marginTop: '2rem', width: '100%', padding: '0.6rem' }}>Plan Actual</button>
        </div>

        {/* Plan Profesional */}
        <div className="plan-card featured">
          <span className="plan-badge">MÁS POPULAR</span>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--neon-purple)' }}>Consultor Pro</h3>
            <div style={{ margin: '1rem 0' }}>
              <span style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>$250</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}> / Mes</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Ideal para estrategas políticos, encuestadores y consultorías de marketing electoral.
            </p>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Sandbox ABM ilimitado</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Predictor Electoral Head-to-Head</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Descarga de Censos Sintéticos</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Acceso a API REST (SocioSim)</li>
            </ul>
          </div>
          <button className="btn-premium" style={{ marginTop: '2rem', width: '100%', padding: '0.6rem' }}>Adquirir Licencia</button>
        </div>

        {/* Plan Enterprise */}
        <div className="plan-card">
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Inversores / Gobiernos</h3>
            <div style={{ margin: '1rem 0' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: '800' }}>Personalizado</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Estructura dedicada para secretarías estatales, fondos de capital e inversores cívicos.
            </p>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Servidor dedicado de Gemelos Sociales</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Calibración con microdatos del INEGI</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Auditoría de políticas a la medida</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Check size={12} color="var(--neon-emerald)" /> Soporte 24/7 y SLAs dedicados</li>
            </ul>
          </div>
          <button className="btn-outline" style={{ marginTop: '2rem', width: '100%', padding: '0.6rem' }}>Contactar Ventas</button>
        </div>

      </div>

      {/* API Console Developer Hub */}
      <div className="workspace-grid-2">
        
        {/* API Credentials */}
        <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key size={18} color="var(--neon-blue)" />
            Consola del Desarrollador
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Integra el gemelo digital en tus propios pipelines de datos. Genera claves API seguras para realizar consultas automáticas del modelo predictivo y censos sintéticos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Tu Clave API (Live)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                readOnly
                value={apiKey} 
                style={{ 
                  flex: 1, 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid var(--border-glass)', 
                  padding: '0.6rem 1rem', 
                  borderRadius: 'var(--radius-sm)', 
                  color: 'var(--neon-emerald)', 
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
              <button className="btn-outline" style={{ padding: '0 1rem', fontSize: '0.8rem' }} onClick={copyToClipboard}>
                {copied ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', justifycontent: 'center', gap: '0.5rem', width: 'fit-content', padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={generateNewKey}>
            <Sparkles size={14} color="var(--neon-blue)" />
            Generar Nueva Clave API
          </button>
        </div>

        {/* JSON Preview Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code size={18} color="var(--neon-purple)" />
            Respuesta del Endpoint Simulado
          </h3>

          <div style={{ 
            background: '#040711', 
            border: '1px solid var(--border-glass)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            color: '#a9b2c3',
            overflowX: 'auto',
            maxHeight: '260px'
          }}>
            <pre>{mockApiResponse}</pre>
          </div>
        </div>

      </div>

    </div>
  );
}
