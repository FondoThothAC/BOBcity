// src/components/GDSMicroSimulator.jsx
// Premium WorldBox-Style Sandbox God-Simulator for CívicaOS Engine
// Simulates 5 dimensions (Economy, Education, Security, Health, Vote) over time with hot inputs

import React, { useState, useEffect, useRef } from 'react';
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
  Pause,
  RotateCcw,
  SkipForward,
  TrendingUp,
  Shield,
  BookOpen,
  Heart
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function GDSMicroSimulator() {
  // 1. Parámetros del Entorno (Sliders en Caliente)
  const [model, setModel] = useState('qwen2.5:1.5b');
  const [temp, setTemp] = useState(32);
  const [agua, setAgua] = useState(80);
  const [subsidio, setSubsidio] = useState(1.40);
  
  // 2. Control de Loop de Simulación (WorldBox Playback)
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(0);
  const [speed, setSpeed] = useState(1500); // ms por mes
  const [history, setHistory] = useState([]);
  
  // 3. Estados de Carga
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Referencia para la terminal de crónicas (scroll automático)
  const terminalEndRef = useRef(null);

  // Calibración de etiquetas dinámicas
  const getTempLabel = (t) => {
    if (t > 40) return { label: 'Ola de Calor Extrema', color: 'var(--neon-rose)' };
    if (t > 32) return { label: 'Cálido Verano', color: 'var(--neon-amber)' };
    return { label: 'Templado Estable', color: 'var(--neon-emerald)' };
  };

  const getAguaLabel = (a) => {
    if (a < 40) return { label: 'Crisis de Tandeo Crítica', color: 'var(--neon-rose)' };
    if (a < 70) return { label: 'Flujo Bajo Advertencia', color: 'var(--neon-amber)' };
    return { label: 'Presión Óptima', color: 'var(--neon-emerald)' };
  };

  const getSubsidioLabel = (s) => {
    if (s < 1.20) return { label: 'Déficit Tarifario CFE', color: 'var(--neon-rose)' };
    if (s < 1.80) return { label: 'Subsidio Estándar', color: 'var(--neon-amber)' };
    return { label: 'Subsidio Excelente', color: 'var(--neon-emerald)' };
  };

  // Efecto para auto-scroll en la crónica
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  // Loop principal de la simulación
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        simulateNextMonth();
      }, speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMonth, temp, agua, subsidio, model, history, speed]);

  // Función para avanzar un mes y calcular evolución
  const simulateNextMonth = async () => {
    // Límite de la simulación: 12 meses
    if (currentMonth >= 12) {
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Obtener estado anterior
    const prev_state = history.length > 0 
      ? history[history.length - 1] 
      : { economia: 60, educacion: 65, seguridad: 70, salud: 65, voto: 'Morena' };

    try {
      const pythonApiUrl = window.location.port ? `http://${window.location.hostname}:5001` : `${window.location.protocol}//${window.location.hostname}`;
      const response = await fetch(`${pythonApiUrl}/api/gds-micro/simulate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temp,
          agua,
          subsidio,
          prev_state
        })
      });

      if (!response.ok) {
        throw new Error('Sin conexión con el servidor API local de simulación.');
      }

      const data = await response.json();
      if (data.status === 'success') {
        const nextMonthNum = currentMonth + 1;
        const newRecord = {
          month: `Mes ${nextMonthNum}`,
          ...data.results
        };
        setHistory(prev => [...prev, newRecord]);
        setCurrentMonth(nextMonthNum);
      } else {
        throw new Error(data.message || 'Error en el motor evolutivo.');
      }
    } catch (err) {
      setError(err.message);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  const resetWorld = () => {
    setIsPlaying(false);
    setCurrentMonth(0);
    setHistory([]);
    setError(null);
    setTemp(32);
    setAgua(80);
    setSubsidio(1.40);
  };

  // Último registro obtenido
  const currentData = history[history.length - 1] || { economia: 60, educacion: 65, seguridad: 70, salud: 65, voto: 'Morena', cronica: 'El mundo está listo. Define las condiciones en los sliders y presiona Iniciar.' };

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
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#D4AF37' }}>
            <Cpu size={24} color="#D4AF37" />
            Sandbox Cívico Evolutivo (Estilo WorldBox / LLM Local 1B-2B)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Gobierna el entorno y altera las condiciones en tiempo real mientras la simulación corre paso a paso. Observa cómo la <strong>Economía</strong>, <strong>Educación</strong>, <strong>Seguridad</strong>, <strong>Salud</strong> y <strong>Preferencia de Voto</strong> evolucionan e interactúan de forma no lineal.
          </p>
        </div>
        <div>
          <span className="tag-badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)', fontWeight: '700' }}>
            🌍 Sandbox Activo: Mes {currentMonth} / 12
          </span>
        </div>
      </div>

      <div className="workspace-grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.2fr', gap: '1.5rem' }}>
        
        {/* Columna 1: Sliders de Parámetros en Caliente */}
        <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sliders size={16} color="var(--neon-blue)" />
              Controles en Caliente (Gobernador)
            </h4>
          </div>

          {/* Selector de Modelo Local */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Modelo de Lenguaje Local
            </label>
            <select 
              value={model} 
              onChange={(e) => setModel(e.target.value)}
              className="premium-input"
              style={{ width: '100%', background: 'rgba(0,0,0,0.3)', color: '#ffffff', border: '1px solid var(--border-glass)', padding: '0.4rem', borderRadius: '6px', fontSize: '0.75rem' }}
            >
              <option value="qwen2.5:1.5b">Qwen 2.5 1.5B (Estructurado)</option>
              <option value="llama3.2:1b">Llama 3.2 1B (Ligero)</option>
            </select>
          </div>

          {/* Slider: Temperatura */}
          <div className="slider-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)' }}>
                <Flame size={12} color="var(--neon-rose)" />
                Temperatura Ambiente
              </span>
              <span style={{ color: tempStatus.color, fontSize: '0.7rem' }}>{temp}°C</span>
            </div>
            <input 
              type="range" 
              min="15" 
              max="50" 
              value={temp}
              onChange={(e) => setTemp(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: tempStatus.color }}
            />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{tempStatus.label}</span>
          </div>

          {/* Slider: Presión de Agua */}
          <div className="slider-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)' }}>
                <Droplet size={12} color="var(--neon-blue)" />
                Presión de Agua
              </span>
              <span style={{ color: aguaStatus.color, fontSize: '0.7rem' }}>{agua}%</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={agua}
              onChange={(e) => setAgua(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: aguaStatus.color }}
            />
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{aguaStatus.label}</span>
          </div>

          {/* Slider: Subsidio de Luz CFE */}
          <div className="slider-group" style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-primary)' }}>
                <Zap size={12} color="var(--neon-amber)" />
                Subsidio CFE ($/kWh)
              </span>
              <span style={{ color: subsidioStatus.color, fontSize: '0.7rem' }}>${subsidio.toFixed(2)}</span>
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
            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{subsidioStatus.label}</span>
          </div>
        </div>

        {/* Columna 2: Gráfico de Dimensiones y Controles de Loop */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.25rem' }}>
          
          {/* Controles de Simulación (WorldBox Play/Pause/Paso/Velocidad) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)' }}>Reloj del Mundo</span>
              <span style={{ 
                fontSize: '0.55rem', 
                padding: '0.15rem 0.4rem', 
                borderRadius: '4px',
                background: isPlaying ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255,255,255,0.05)',
                color: isPlaying ? '#D4AF37' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: isPlaying ? '#D4AF37' : 'var(--border-glass)'
              }}>
                {isPlaying ? "▶️ CORRIENDO" : "⏸️ EN PAUSA"}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                disabled={currentMonth >= 12 || isLoading}
                className="btn-primary"
                style={{ 
                  flex: 1, 
                  fontSize: '0.7rem', 
                  padding: '0.45rem', 
                  background: isPlaying ? 'var(--neon-rose)' : 'var(--neon-purple)', 
                  border: 'none', 
                  cursor: (currentMonth >= 12 || isLoading) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem'
                }}
              >
                {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                {isPlaying ? 'Pausar' : 'Iniciar'}
              </button>

              <button 
                onClick={simulateNextMonth} 
                disabled={isPlaying || currentMonth >= 12 || isLoading}
                className="btn-outline"
                style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.45rem', 
                  borderColor: 'var(--border-glass)',
                  cursor: (isPlaying || currentMonth >= 12 || isLoading) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.25rem'
                }}
                title="Avanzar 1 Mes"
              >
                <SkipForward size={10} />
                Paso
              </button>

              <button 
                onClick={resetWorld} 
                className="btn-outline"
                style={{ fontSize: '0.7rem', padding: '0.45rem', borderColor: 'var(--border-glass)', cursor: 'pointer' }}
                title="Reiniciar Simulación"
              >
                <RotateCcw size={10} />
                Reiniciar
              </button>
            </div>

            {/* Velocidad */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Frecuencia de ciclo:</span>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                <button onClick={() => setSpeed(2500)} style={{ border: 'none', padding: '2px 4px', fontSize: '0.55rem', borderRadius: '3px', background: speed === 2500 ? 'var(--neon-blue)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}>Lento</button>
                <button onClick={() => setSpeed(1500)} style={{ border: 'none', padding: '2px 4px', fontSize: '0.55rem', borderRadius: '3px', background: speed === 1500 ? 'var(--neon-blue)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}>Normal</button>
                <button onClick={() => setSpeed(600)} style={{ border: 'none', padding: '2px 4px', fontSize: '0.55rem', borderRadius: '3px', background: speed === 600 ? 'var(--neon-blue)' : 'rgba(255,255,255,0.05)', color: '#fff', cursor: 'pointer' }}>Rápido</button>
              </div>
            </div>
          </div>

          {/* Gráfico de Evolución Multidimensional */}
          <div style={{ height: '220px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '0.5rem', border: '1px solid var(--border-glass)' }}>
            {history.length === 0 ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '0.7rem', textAlign: 'center' }}>
                ⚠️ Simulación en Mes 0.<br />Presiona "Iniciar" para comenzar a graficar la evolución.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={8} />
                  <YAxis stroke="var(--text-muted)" fontSize={8} domain={[0, 100]} />
                  <RechartsTooltip contentStyle={{ background: 'rgba(15, 10, 30, 0.95)', border: '1px solid var(--neon-purple)', borderRadius: '6px', fontSize: '9px', color: 'var(--text-primary)' }} />
                  <Legend wrapperStyle={{ fontSize: '8px', paddingTop: '4px' }} />
                  <Line type="monotone" name="Economía" dataKey="economia" stroke="var(--neon-emerald)" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" name="Educación" dataKey="educacion" stroke="var(--neon-blue)" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" name="Seguridad" dataKey="seguridad" stroke="var(--neon-purple)" strokeWidth={1.5} dot={false} />
                  <Line type="monotone" name="Salud" dataKey="salud" stroke="var(--neon-pink)" strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Columna 3: Crónicas del Mundo y Preferencia Electoral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Crónica en Vivo Terminal */}
          <div className="glass-card" style={{ 
            background: 'rgba(5, 5, 10, 0.95)', 
            border: '1px solid var(--border-glass)',
            borderRadius: '8px', 
            padding: '1rem',
            fontFamily: 'monospace',
            height: '200px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#D4AF37', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Terminal size={12} />
                CRÓNICA DEL MUNDO EN VIVO
              </span>
              {isLoading && <span className="cargador" style={{ width: '8px', height: '8px', border: '1.5px solid var(--neon-purple)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }}></span>}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.7rem', paddingRight: '0.25rem' }}>
              {history.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)', padding: '1rem 0' }}>
                  &gt; Servidor en espera.<br />
                  &gt; Modos: qwen2.5 (local), llama3.2 (local).<br />
                  &gt; Presiona Iniciar para arrancar la simulación...
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '0.3rem' }}>
                    <span style={{ color: '#D4AF37' }}>[{h.month}]</span>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>
                      eco:{h.economia}% | edu:{h.educacion}% | seg:{h.seguridad}% | sal:{h.salud}%
                    </span>
                    <p style={{ margin: '0.2rem 0 0', color: 'var(--neon-emerald)', fontStyle: 'italic', paddingLeft: '0.5rem' }}>
                      "{h.cronica}"
                    </p>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Reporte de Estado y Preferencia Electoral en este ciclo */}
          <div className="glass-card glow-emerald" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.4rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Vote size={14} color="var(--neon-emerald)" />
              Voto y Bienestar Acumulado
            </h4>

            {/* Promedio Bienestar */}
            {(() => {
              const prom = Math.round((currentData.economia + currentData.educacion + currentData.seguridad + currentData.salud) / 4);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700' }}>
                    <span>Bienestar Promedio del Mundo:</span>
                    <span style={{ color: prom > 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)' }}>{prom}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      background: prom > 50 ? 'var(--neon-emerald)' : 'var(--neon-rose)',
                      width: `${prom}%`,
                      transition: 'width 0.3s ease-out'
                    }} />
                  </div>
                </div>
              );
            })()}

            {/* Preferencia Electoral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: '700' }}>
                <span>Preferencia de Voto Actual:</span>
                <span style={{ color: currentData.voto === 'Morena' ? 'var(--neon-rose)' : 'var(--neon-blue)' }}>
                  {currentData.voto}
                </span>
              </div>
              
              <div style={{ display: 'flex', height: '10px', borderRadius: '3px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
                {currentData.voto === 'Morena' ? (
                  <div style={{ width: '100%', background: 'var(--neon-rose)', transition: 'width 0.3s ease' }} />
                ) : (
                  <div style={{ width: '100%', background: 'var(--neon-blue)', transition: 'width 0.3s ease' }} />
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                <span>Incumbente (Morena)</span>
                <span>Oposición (Conservador)</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
