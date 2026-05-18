// src/components/ClientOnboarding.jsx
// Client Onboarding View - Fase 1 (Onboarding / Pago / Pendiente de Aprobación)

import React, { useState } from 'react';
import { 
  Sparkles, 
  CreditCard, 
  MapPin, 
  Palette, 
  Check, 
  Clock, 
  ShieldCheck, 
  LogOut,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { themes, applyTheme } from '../themeManager';

export default function ClientOnboarding({ client, onUpdateClient, onLogout }) {
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState(client.subscription !== 'none' ? client.subscription : 'none');
  const [selectedTheme, setSelectedTheme] = useState(client.themeId);
  const [regionName, setRegionName] = useState(client.region);
  const [popSize, setPopSize] = useState(client.population);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleThemeChange = (themeId) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
  };

  const handleSaveOnboarding = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onUpdateClient({
        ...client,
        region: regionName,
        population: popSize,
        themeId: selectedTheme,
        subscription: selectedPlan,
        // Update client status so it notifies the master operator
        onboardingSubmitted: true 
      });
      setIsSubmitting(false);
      setStep(4);
    }, 1200);
  };

  return (
    <div className="login-wrapper" style={{ overflowY: 'auto', padding: '3rem 1rem' }}>
      
      {/* Decorative glows adapted to theme accent */}
      <div className="bg-glow glow-top-left" style={{ background: 'var(--accent-color)', opacity: 0.15 }}></div>
      <div className="bg-glow glow-bottom-right" style={{ background: 'var(--neon-purple)', opacity: 0.1 }}></div>

      <div className="glass-card scale-in" style={{ 
        maxWidth: '750px', 
        width: '100%', 
        padding: '2.5rem', 
        borderRadius: '16px',
        border: '1px solid var(--border-glass)',
        background: 'rgba(15, 15, 25, 0.65)'
      }}>
        
        {/* Onboarding Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '1.6rem', marginBottom: '0.25rem' }}>Configuración de Campaña</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Cliente: <strong style={{ color: 'white' }}>{client.name}</strong> • Código: <code style={{ color: 'var(--accent-color)' }}>{client.code}</code>
            </p>
          </div>
          <button 
            className="btn-outline" 
            onClick={onLogout}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              fontSize: '0.75rem', 
              padding: '0.5rem 0.8rem', 
              borderColor: 'rgba(255,255,255,0.1)'
            }}
          >
            <LogOut size={12} />
            Salir
          </button>
        </div>

        {/* Wizard Steps indicator */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '2.5rem' }}>
          {[
            { nr: 1, label: '📍 Geografía', icon: MapPin },
            { nr: 2, label: '🎨 Marca Blanca', icon: Palette },
            { nr: 3, label: '💳 Licencia', icon: CreditCard },
            { nr: 4, label: '⏳ Aprobación', icon: Clock }
          ].map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.nr;
            const isActive = step === s.nr;
            return (
              <div 
                key={s.nr} 
                style={{ 
                  flex: 1, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  opacity: isActive || isCompleted ? 1 : 0.4 
                }}
              >
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: isCompleted ? 'var(--neon-emerald)' : isActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.05)',
                  border: isActive ? '1px solid var(--accent-color)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted || isActive ? 'black' : 'white',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  transition: 'all 0.3s ease'
                }}>
                  {isCompleted ? <Check size={16} color="black" strokeWidth={3} /> : <Icon size={14} color={isActive ? 'black' : 'white'} />}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: isActive ? '800' : '400', color: isActive ? 'var(--accent-color)' : 'var(--text-muted)' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step 1: Geography & Demographics */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="scale-in">
            <h3 style={{ fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="var(--accent-color)" />
              Definición de Jurisdicción y Electorado
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Ingresa el municipio o distrito electoral donde se desplegará tu gemelo digital predictivo. La inteligencia artificial calibrará el censo sociológico en base a este territorio.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>MUNICIPIO O DISTRITO:</label>
                <input 
                  type="text" 
                  value={regionName} 
                  onChange={(e) => setRegionName(e.target.value)} 
                  className="citizen-input"
                  placeholder="Ej. Nogales, Sonora"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>TAMAÑO MUESTRAL DEL CENSO SINTÉTICO:</label>
                <select 
                  value={popSize} 
                  onChange={(e) => setPopSize(parseInt(e.target.value))} 
                  className="citizen-input"
                >
                  <option value={25000}>25,000 agentes sintéticos (Ligero)</option>
                  <option value={50000}>50,000 agentes sintéticos (Estándar)</option>
                  <option value={75000}>75,000 agentes sintéticos (Recomendado)</option>
                  <option value={150000}>150,000 agentes sintéticos (Tier Oro)</option>
                </select>
              </div>
            </div>

            <button 
              className="btn-primary" 
              onClick={() => setStep(2)} 
              disabled={!regionName}
              style={{ marginTop: '1.5rem', alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              Continuar a Marca Blanca
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Step 2: White Label Customization */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="scale-in">
            <h3 style={{ fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={18} color="var(--accent-color)" />
              Personalización e Inyección de Marca Blanca
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Selecciona una de nuestras 10 identidades de diseño premium. Las CSS properties se inyectarán en caliente, ocultando por completo las siglas del motor principal para proteger a tu proveedor tecnológico.
            </p>

            <div className="theme-card-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', maxHeight: '280px', overflowY: 'auto', padding: '0.25rem' }}>
              {Object.entries(themes).map(([id, theme]) => {
                const accentColor = theme.variables['--accent-color'];
                const appBg = theme.variables['--bg-app'].includes('gradient') ? '#0c0721' : theme.variables['--bg-app'];
                
                return (
                  <div 
                    key={id}
                    className={`theme-card-option ${selectedTheme === id ? 'active' : ''}`}
                    onClick={() => handleThemeChange(id)}
                    style={{ 
                      padding: '0.6rem',
                      background: 'rgba(0,0,0,0.3)',
                      borderColor: selectedTheme === id ? 'var(--accent-color)' : 'rgba(255,255,255,0.06)'
                    }}
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
                    <span style={{ fontSize: '0.65rem', fontWeight: selectedTheme === id ? '700' : '400' }}>{theme.name}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className="btn-outline" onClick={() => setStep(1)} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                Atrás
              </button>
              <button 
                className="btn-primary" 
                onClick={() => setStep(3)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                Continuar a Licencia
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Subscription & Licensing */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="scale-in">
            <h3 style={{ fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={18} color="var(--accent-color)" />
              Suscripción de Licencia CívicaOS
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Selecciona tu plan de simulación electoral y gemelos cognitivos. El pago se procesa bajo token seguro.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                { id: 'bronze', name: 'Plan Bronce', price: '$1,500', agents: '25k agentes', desc: 'Simulador básico ABM y 100 consultas Swarm.' },
                { id: 'silver', name: 'Plan Plata', price: '$3,000', agents: '75k agentes', desc: 'Análisis GIS, Predictor Electoral y 500 consultas.' },
                { id: 'gold', name: 'Plan Oro', price: '$5,000', agents: '150k agentes', desc: 'Swarms OpenClaw ilimitados y gemelos en tiempo real.' }
              ].map((p) => {
                const isSelected = selectedPlan === p.id;
                return (
                  <div 
                    key={p.id}
                    onClick={() => handleSelectPlan(p.id)}
                    style={{ 
                      padding: '1.25rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.06)',
                      background: isSelected ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0,0,0,0.2)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isSelected && (
                      <span style={{ 
                        position: 'absolute', 
                        top: '-10px', 
                        right: '10px', 
                        background: 'var(--accent-color)', 
                        color: 'black', 
                        fontSize: '0.55rem', 
                        fontWeight: '800', 
                        padding: '0.1rem 0.4rem', 
                        borderRadius: '10px' 
                      }}>SELECCIONADO</span>
                    )}
                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-secondary)' }}>{p.name}</span>
                    <h4 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'white' }}>{p.price}<span style={{ fontSize: '0.75rem', fontWeight: '400', color: 'var(--text-muted)' }}>/mes</span></h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--neon-emerald)', fontWeight: '700' }}>👥 {p.agents}</span>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.desc}</p>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button className="btn-outline" onClick={() => setStep(2)} style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                Atrás
              </button>
              
              <button 
                className="btn-primary glow-pulse" 
                onClick={handleSaveOnboarding}
                disabled={selectedPlan === 'none' || isSubmitting}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, var(--accent-color), var(--neon-purple))',
                  color: 'black',
                  fontWeight: '800'
                }}
              >
                {isSubmitting ? 'Procesando Transacción...' : 'Pagar Suscripción y Enviar'}
                {!isSubmitting && <Sparkles size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Pending Operator Activation */}
        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center', textAlign: 'center' }} className="scale-in">
            
            <div style={{ 
              width: '64px', 
              height: '64px', 
              borderRadius: '50%', 
              background: 'rgba(212, 175, 55, 0.1)', 
              border: '1px solid #D4AF37', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: '0.5rem'
            }}>
              <Clock size={32} color="#D4AF37" className="glow-pulse" />
            </div>

            <h3 style={{ fontSize: '1.2rem', color: 'white' }}>⏳ Suscripción Recibida y Pendiente</h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '500px', lineHeight: 1.5 }}>
              ¡Tu suscripción al plan <strong style={{ color: 'white' }}>{selectedPlan.toUpperCase()}</strong> ha sido registrada exitosamente!
            </p>

            <div className="glass-card" style={{ 
              padding: '1.25rem', 
              maxWidth: '550px', 
              background: 'rgba(255, 255, 255, 0.02)', 
              borderColor: 'rgba(212, 175, 55, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              alignItems: 'flex-start',
              textAlign: 'left'
            }}>
              <h4 style={{ fontSize: '0.8rem', fontWeight: '800', color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} color="#D4AF37" />
                Pipeline de Activación de Campaña:
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neon-emerald)' }}>
                  <span>✓ 1. Registro de Campaña y Códigos</span>
                  <strong>Completado</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neon-emerald)' }}>
                  <span>✓ 2. Personalización de UI/UX Premium</span>
                  <strong>Tema Inyectado</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--neon-emerald)' }}>
                  <span>✓ 3. Pago y Registro de Licencia</span>
                  <strong>Transacción Simulada</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#D4AF37' }}>
                  <span>⏳ 4. Aprobación y Validación del Agente CívicaOS</span>
                  <strong>En cola de revisión</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                  <span>🔒 5. Calibración del Gemelo Digital (75k agentes)</span>
                  <strong>Esperando aprobación</strong>
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '480px', marginTop: '0.5rem' }}>
              Para agilizar la activación de tu cuenta de demostración en local, abre una pestaña en tu navegador en <code>/master</code> (ingresa con <code>CIVICAOS-MASTER</code>) y aprueba el pago de tu cuenta en la sección "Cola de Aprobaciones".
            </p>

            <button 
              className="btn-outline" 
              onClick={onLogout}
              style={{ marginTop: '1rem', width: '200px', borderColor: 'rgba(255,255,255,0.1)' }}
            >
              Cerrar Sesión
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
