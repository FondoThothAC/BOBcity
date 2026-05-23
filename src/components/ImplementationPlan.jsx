// src/components/ImplementationPlan.jsx
// CDD / UXDD: Nivel 2 Client Plan Visualizer - Solo Lectura con +1024 Factores y Solicitar Simulación
import React, { useState } from 'react';
import { 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Users, 
  Award,
  AlertTriangle,
  FileCheck2,
  Lock
} from 'lucide-react';

export default function ImplementationPlan({ activeClient }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [requestText, setRequestText] = useState('');
  const [requested, setRequested] = useState(false);

  const handleSendRequest = (e) => {
    e.preventDefault();
    if (!requestText.trim()) return;
    
    setRequested(true);
    setTimeout(() => {
      setModalOpen(false);
      // Dispatch a premium toast
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: {
          message: '💸 Solicitud registrada. Cargo de $4,800 MXN añadido a Factura CIVICAOS-BIL-2026. Procesando en Nivel 3.',
          type: 'warning'
        }
      }));
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 🔮 Header Banner */}
      <div className="glass-card glow-amber" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(20, 15, 5, 0.9) 0%, rgba(30, 20, 10, 0.9) 100%)',
        border: '1px solid var(--neon-amber)'
      }}>
        <div style={{ maxWidth: '75%' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--neon-amber)' }}>
            <Sparkles size={20} />
            Plan de Acción Territorial Integrado (+1024 Factores Contextuales)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Recomendaciones estructuradas de políticas y obras públicas optimizadas mediante simulación de gemelos sociales a microescala. Basado en el censo del distrito e indicadores demográficos, económicos e históricos.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="tag-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--neon-amber)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            Nivel 2 • Solo Lectura VIP
          </span>
        </div>
      </div>

      {/* 📊 Factores y Diagnóstico del Distrito */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Territorio Activo</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-blue)' }}>
            {activeClient?.region || 'Hermosillo D8 (Palo Verde)'}
          </span>
        </div>
        
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Factores Cruzados</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-purple)' }}>
            1,024 Variables Socioeconómicas
          </span>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Dolor Principal</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-rose)' }}>
            Agua (7.8) y Empleo (6.9)
          </span>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nivel Socio-Educativo</span>
          <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--neon-emerald)' }}>
            Medio-Bajo / Técnico (68%)
          </span>
        </div>
      </div>

      {/* 🚀 Los Pilares del Plan */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Layers size={16} color="var(--neon-amber)" />
          Pilares Estratégicos Recomendados (Optimización de Recursos)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Pilar 1 */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--neon-emerald)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                  Pilar A: Red Local de Cooperativas de Empleo Hídrico
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-emerald)', fontWeight: '700' }}>VIABILIDAD OPERATIVA: 87% | IMPACTO ELECTORAL: +6.4%</span>
              </div>
              <span className="tag-badge" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--neon-emerald)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                Agua + Empleo
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              El análisis cruzado detecta que en el Distrito 8 (Palo Verde) coexisten un alto desempleo en el sector técnico/operativo y un fuerte dolor social por desabasto y fugas de agua. Se recomienda financiar cooperativas locales de plomería y reparación comunitaria. Combina el dolor #1 con empleo local directo para perfiles de escolaridad media-baja.
            </p>
          </div>

          {/* Pilar 2 */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--neon-purple)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                  Pilar B: Subsidios de Transporte Hacia Zonas de Empleo Industrial
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-purple)', fontWeight: '700' }}>VIABILIDAD OPERATIVA: 74% | IMPACTO ELECTORAL: +4.2%</span>
              </div>
              <span className="tag-badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--neon-purple)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                Movilidad + Economía
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              El 42% de la población activa del sector Palo Verde trabaja en la zona industrial norte de Hermosillo. Con tiempos de espera promedio de transporte de 52 minutos, se recomienda un programa de transporte corporativo subsidiado con salidas express en horas pico (06:00 - 08:00).
            </p>
          </div>

          {/* Pilar 3 */}
          <div className="glass-card" style={{ borderLeft: '4px solid var(--neon-blue)', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#fff' }}>
                  Pilar C: Digitalización de Micro-PyMEs y Comercio Informal
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--neon-blue)', fontWeight: '700' }}>VIABILIDAD OPERATIVA: 82% | IMPACTO ELECTORAL: +5.1%</span>
              </div>
              <span className="tag-badge" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--neon-blue)', borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                Comercio Local
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              El autoempleo e informalidad representan el 35% del ingreso en Palo Verde. Proporcionar kits de cobro digital (celular, lector de tarjetas, y capacitación básica de 2 horas) maximizará el consumo local sin fricción bancaria formal, reduciendo la vulnerabilidad económica familiar en un 18%.
            </p>
          </div>

        </div>
      </div>

      {/* 📊 Proyección de Impacto Social (Solo Lectura) */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={16} color="var(--neon-emerald)" />
          Proyecciones de Impacto (Periodo: 18 meses)
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-emerald)' }}>+32.0%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>ÍNDICE DE FELICIDAD SOCIAL</div>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-blue)' }}>-24.5%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>TENSIÓN SOCIAL / DELINCUENCIA</div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--neon-amber)' }}>+8.0%</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>APROBACIÓN DE GOBIERNO / INTENCIÓN DE VOTO</div>
          </div>
        </div>
      </div>

      {/* 🔒 Caja de Monetización y Restricción de Simulación */}
      <div className="glass-card" style={{ 
        background: 'linear-gradient(135deg, rgba(30, 20, 45, 0.4) 0%, rgba(15, 10, 25, 0.8) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        gap: '1rem'
      }}>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          borderRadius: '50%', 
          background: 'rgba(139, 92, 246, 0.1)', 
          border: '1px solid rgba(139, 92, 246, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--neon-purple)',
          boxShadow: '0 0 15px rgba(139, 92, 246, 0.15)'
        }}>
          <Lock size={22} />
        </div>
        
        <div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#fff', marginBottom: '0.35rem' }}>
            Simulador en Caliente Restringido para Clientes
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '560px', lineHeight: '1.4' }}>
            Tu suscripción **Plata/Oro** te otorga acceso de **solo lectura** a los informes oficiales. Para preservar la integridad del Gemelo Digital y garantizar análisis metodológicos validados, las simulaciones libres están bloqueadas.
          </p>
        </div>

        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          padding: '0.5rem 1rem', 
          borderRadius: '20px', 
          fontSize: '0.75rem', 
          fontFamily: 'monospace',
          border: '1px solid var(--border-glass)',
          color: 'var(--neon-amber)'
        }}>
          Simulación Personalizada con Otros Parámetros: $4,800 MXN / escenario
        </div>

        <button 
          onClick={() => setModalOpen(true)}
          className="btn-premium"
          style={{ 
            background: 'linear-gradient(90deg, var(--neon-purple) 0%, var(--neon-pink) 100%)',
            borderColor: 'var(--neon-purple)',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.3)'
          }}
        >
          ✨ Solicitar Nueva Simulación Escrita
        </button>
      </div>

      {/* 🚪 Modal de Solicitud */}
      {modalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(3, 2, 10, 0.85)',
          backdropFilter: 'blur(10px)',
          zIndex: 9999,
          display: 'grid',
          placeItems: 'center',
          animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <div className="glass-card" style={{ 
            maxWidth: '500px', 
            width: '90%', 
            padding: '2rem',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 25px rgba(139, 92, 246, 0.15)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', marginBottom: '0.5rem', color: '#fff' }}>
              ✨ Solicitar Simulación a la Medida
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
              Describe las variaciones de políticas que deseas evaluar (ej: "Subir presupuesto de agua al 80% y reducir baches al 20% en Palo Verde"). Un agente cognitivo de Nivel 3 ejecutará el pipeline completo.
            </p>

            <form onSubmit={handleSendRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Detalle del Escenario a Proyectar:</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Ej: Quiero simular el impacto electoral si duplicamos la inversión en agua y creamos un subsidio directo de empleo a mujeres menores de 35 años en el distrito 8..."
                  value={requestText}
                  onChange={(e) => setRequestText(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.6rem',
                    fontSize: '0.8rem',
                    color: '#fff',
                    fontFamily: 'inherit',
                    resize: 'none',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ 
                background: 'rgba(245, 158, 11, 0.08)', 
                border: '1px solid rgba(245, 158, 11, 0.2)',
                padding: '0.75rem', 
                borderRadius: '6px',
                fontSize: '0.75rem',
                color: 'var(--neon-amber)'
              }}>
                <strong>💳 Cargo Automático de Aprovisionamiento:</strong><br />
                <span>Costo: $4,800.00 MXN + IVA</span><br />
                <small style={{ color: 'var(--text-secondary)' }}>Se agregará a tu factura corriente. Tiempo de entrega: 12 horas.</small>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => setModalOpen(false)}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={requested}
                  className="btn-premium"
                  style={{ 
                    background: 'linear-gradient(90deg, var(--neon-purple) 0%, var(--neon-pink) 100%)',
                    borderColor: 'var(--neon-purple)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem'
                  }}
                >
                  {requested ? 'Registrando...' : 'Confirmar y Facturar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
