// src/components/GDSMicroSimulator.jsx
// Premium GDS-Micro Simulator Component using local SLM models (1B/2B parameters)
// Integrates with local Ollama APIs and follows first-principles cognitive design

import React, { useState } from 'react';
import { 
  Sliders, 
  Cpu, 
  Smile, 
  Flame, 
  Droplet, 
  Zap, 
  Terminal, 
  Vote, 
  Activity, 
  HelpCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export default function GDSMicroSimulator() {
  // 1. Estados de Parámetros
  const [model, setModel] = useState('qwen2.5:1.5b');
  const [temp, setTemp] = useState(32);
  const [agua, setAgua] = useState(80);
  const [subsidio, setSubsidio] = useState(1.40);
  
  // 2. Estados del Backend
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // 3. Calibración de etiquetas dinámicas (Heurísticas en UI)
  const getTempLabel = (t) => {
    if (t > 40) return { label: 'Ola de Calor Extrema', color: 'var(--neon-rose)' };
    if (t > 32) return { label: 'Cálido Sonora', color: 'var(--neon-amber)' };
    return { label: 'Templado Estable', color: 'var(--neon-emerald)' };
  };

  const getAguaLabel = (a) => {
    if (a < 40) return { label: 'Crisis de Tandeo Crítica', color: 'var(--neon-rose)' };
    if (a < 70) return { label: 'Flujo Bajo Advertencia', color: 'var(--neon-amber)' };
    return { label: 'Presión Óptima', color: 'var(--neon-emerald)' };
  };

  const getSubsidioLabel = (s) => {
    if (s < 1.20) return { label: 'Déficit Tarifario Alto', color: 'var(--neon-rose)' };
    if (s < 1.80) return { label: 'Subsidio Estándar CFE', color: 'var(--neon-amber)' };
    return { label: 'Subsidio Excelente (Verano)', color: 'var(--neon-emerald)' };
  };

  // 4. Invocación de API de Inferencia Local
  const runSimulation = async () => {
    setIsLoading(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch(`http://${window.location.hostname}:5001/api/gds-micro/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temp,
          agua,
          subsidio
        })
      });

      if (!response.ok) {
        throw new Error('No se pudo establecer conexión con el servidor API local de simulación.');
      }

      const data = await response.json();
      if (data.status === 'success') {
        setResults(data.results);
      } else {
        throw new Error(data.message || 'Error desconocido en el motor de simulación.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Restablecer controles
  const resetSimulation = () => {
    setTemp(32);
    setAgua(80);
    setSubsidio(1.40);
    setResults(null);
    setError(null);
  };

  const tempStatus = getTempLabel(temp);
  const aguaStatus = getAguaLabel(agua);
  const subsidioStatus = getSubsidioLabel(subsidio);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 🔮 Contexto de la Aplicación y Presentación */}
      <div className="glass-card glow-purple" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(20, 10, 45, 0.9) 0%, rgba(35, 12, 60, 0.9) 100%)',
        border: '1px solid var(--neon-purple)',
        padding: '1.5rem 2rem'
      }}>
        <div style={{ maxWidth: '80%' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#7c3aed' }}>
            <Cpu size={24} color="var(--neon-purple)" />
            Gemelo Digital Cognitivo Micro (Modelos Locales 1B / 2B)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Simula las respuestas y el bienestar de un ciudadano sintético de Hermosillo utilizando modelos de lenguaje ultraligeros de 1B y 2B de parámetros corriendo de forma 100% gratuita y privada en tu Ollama local.
          </p>
        </div>
        <div>
          <span className="tag-badge" style={{ background: 'rgba(124, 58, 237, 0.15)', color: 'var(--neon-purple)', borderColor: 'rgba(124, 58, 237, 0.3)', fontWeight: '700' }}>
            ⚡ 100% Local-First Offline
          </span>
        </div>
      </div>

      <div className="workspace-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* Columna Izquierda: Sliders de Variables del Entorno */}
        <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
              <Sliders size={18} color="var(--neon-blue)" />
              Configuración de Variables Ambientales
            </h3>
            <button 
              onClick={resetSimulation}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}
              title="Restablecer Valores Predeterminados"
            >
              <RotateCcw size={12} />
              Reiniciar
            </button>
          </div>

          {/* Selector de Modelo Local */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              🤖 Modelo de Lenguaje Local (Ollama)
            </label>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              className="premium-input"
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#ffffff', border: '1px solid var(--border-glass)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}
            >
              <option value="qwen2.5:1.5b">Qwen 2.5 1.5B (Recomendado - Excelente estructurando)</option>
              <option value="llama3.2:1b">Llama 3.2 1B (Ultra Rápido y liviano)</option>
            </select>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              Asegúrate de que Ollama esté encendido y el modelo descargado en tu sistema local.
            </span>
          </div>

          {/* Slider: Temperatura */}
          <div className="slider-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)' }}>
                <Flame size={14} color="var(--neon-rose)" />
                Temperatura Ambiente (°C)
              </span>
              <span style={{ color: tempStatus.color }}>{temp}% ({tempStatus.label})</span>
            </div>
            <input 
              type="range" 
              min="15" 
              max="50" 
              value={temp}
              onChange={(e) => setTemp(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: tempStatus.color }}
            />
          </div>

          {/* Slider: Presión de Agua */}
          <div className="slider-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)' }}>
                <Droplet size={14} color="var(--neon-blue)" />
                Presión de Agua (%)
              </span>
              <span style={{ color: aguaStatus.color }}>{agua}% ({aguaStatus.label})</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={agua}
              onChange={(e) => setAgua(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: aguaStatus.color }}
            />
          </div>

          {/* Slider: Subsidio de Luz CFE */}
          <div className="slider-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-primary)' }}>
                <Zap size={14} color="var(--neon-amber)" />
                Factor de Subsidio CFE ($/kWh)
              </span>
              <span style={{ color: subsidioStatus.color }}>${subsidio.toFixed(2)}/kWh ({subsidioStatus.label})</span>
            </div>
            <input 
              type="range" 
              min="0.50" 
              max="3.00" 
              step="0.05"
              value={subsidio}
              onChange={(e) => setSubsidio(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: subsidioStatus.color }}
            />
          </div>

          {/* Botón Lanzador de Simulación */}
          <button 
            onClick={runSimulation}
            disabled={isLoading}
            className="btn-primary glow-pulse"
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-purple) 100%)',
              marginTop: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? (
              <>
                <span className="loader" style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>
                <span>Procesando Inferencia Local...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Simular Comportamiento con SLM</span>
              </>
            )}
          </button>
        </div>

        {/* Columna Derecha: Consola Terminal y Resultados Proyectados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Consola Terminal Cognitiva */}
          <div className="glass-card" style={{ 
            background: 'rgba(5, 5, 10, 0.95)', 
            border: '1px solid var(--border-glass)',
            borderRadius: '8px', 
            padding: '1.25rem',
            fontFamily: 'monospace',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--neon-purple)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Terminal size={12} />
                CONSOLE_LOG: INFERENCIA COGNITIVA DEL AGENTE
              </span>
              <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)' }}>
                STATUS: {isLoading ? 'SIMULATING...' : (results ? 'COMPLETE' : 'READY')}
              </span>
            </div>

            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '120px', color: 'var(--neon-purple)', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', border: '3px solid var(--neon-purple)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                <span style={{ fontSize: '0.75rem' }}>[Ollama: {model}] Procesando razonamiento en local...</span>
              </div>
            )}

            {error && (
              <div style={{ color: 'var(--neon-rose)', fontSize: '0.75rem', padding: '1rem 0' }}>
                &gt; Error: {error}
              </div>
            )}

            {!isLoading && !error && !results && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', padding: '2rem 0', textAlign: 'center' }}>
                &gt; Esperando ejecución de la simulación cívica...<br />
                Ajusta las variables y haz clic en "Simular" para recibir el veredicto del modelo local.
              </div>
            )}

            {results && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem', color: '#ffffff', padding: '0.5rem 0' }}>
                <div>
                  <span style={{ color: 'var(--neon-blue)' }}>&gt; Modelo Utilizado:</span> {model}
                </div>
                <div>
                  <span style={{ color: 'var(--neon-blue)' }}>&gt; Razonamiento del Gemelo:</span> 
                  <p style={{ fontStyle: 'italic', color: 'var(--neon-emerald)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '4px', borderLeft: '3px solid var(--neon-emerald)', margin: '0.5rem 0 0' }}>
                    "{results.opinion}"
                  </p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                  <span>Motor: {results.fallback ? 'FALLBACK DE HILADO ESTÁNDAR (OLLAMA OFFLINE)' : 'LLM LOCAL DIRECTO'}</span>
                  <span>100% Soberano</span>
                </div>
              </div>
            )}
          </div>

          {/* Resultados Proyectados de la Simulación */}
          <div className="glass-card glow-emerald" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={16} color="var(--neon-emerald)" />
              Impacto Social y Político Estimado
            </h3>

            {/* Bienestar General */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                <span>Bienestar del Gemelo Digital:</span>
                <strong style={{ color: results ? (results.bienestar > 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)') : 'var(--text-secondary)' }}>
                  {results ? `${results.bienestar}%` : '--'}
                </strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: results ? (results.bienestar > 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)') : 'rgba(255,255,255,0.08)',
                  width: results ? `${results.bienestar}%` : '0%',
                  transition: 'width 0.4s ease-out'
                }} />
              </div>
            </div>

            {/* Intención de Voto Proyectada */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '700' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Vote size={14} />
                  Preferencia Electoral Proyectada:
                </span>
                <strong style={{ color: results ? (results.voto === 'Morena' ? 'var(--neon-rose)' : 'var(--neon-blue)') : 'var(--text-secondary)' }}>
                  {results ? results.voto : '--'}
                </strong>
              </div>
              <div style={{ display: 'flex', height: '14px', borderRadius: '4px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                {results ? (
                  results.voto === 'Morena' ? (
                    <div style={{ width: '100%', background: 'var(--neon-rose)', transition: 'width 0.3s ease' }} title="Incumbente: 100%" />
                  ) : (
                    <div style={{ width: '100%', background: 'var(--neon-blue)', transition: 'width 0.3s ease' }} title="Oposición: 100%" />
                  )
                ) : (
                  <div style={{ width: '0%', background: 'transparent' }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span>Incumbente (Morena/Social)</span>
                <span>Oposición (Conservador/PAN)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
