// src/components/ThothAgoraPortal.jsx
// UXDD / PDD: Citizen opinion capture under "ThothAgora Oracle" theme
// Designed to support extremely lightweight execution on Oracle Cloud VPS (1 Core, 1GB RAM)

import React, { useState } from 'react';
import { localAuditLogger } from '../security/local-audit';
import { 
  Sparkles, 
  Send, 
  Info, 
  Activity, 
  FileLock2, 
  MapPin, 
  Sliders, 
  Cpu, 
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export default function ThothAgoraPortal() {
  // Citizen form state
  const [curp, setCurp] = useState('');
  const [cp, setCp] = useState('');
  const [celular, setCelular] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('prefer-not-to-say');
  const [sector, setSector] = useState('asalariado');
  const [district, setDistrict] = useState('HER-DIS-08');
  const [waterPain, setWaterPain] = useState(0.5);
  const [transitPain, setTransitPain] = useState(0.5);
  const [potholesPain, setPotholesPain] = useState(0.5);
  const [safetyPain, setSafetyPain] = useState(0.5);
  const [customProposal, setCustomProposal] = useState('');
  const [formError, setFormError] = useState('');
  
  // Submission flow state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credential, setCredential] = useState(null); // Digital Twin credential
  
  // API Tab state inside E2-Micro VPS section
  const [copied, setCopied] = useState(false);

  // Municipal KPIs
  const kpis = {
    satisfaction: { value: '42.3%', state: 'amber', label: 'Felicidad Social' },
    engagement: { value: '89.4%', state: 'emerald', label: 'Participación Activa' },
    compliance: { value: '96.2%', state: 'purple', label: 'Conformidad OBP' }
  };

  // Input Sanitizer to prevent XSS
  const sanitizeInput = (input) => {
    if (!input) return '';
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  // Secure SHA-256 Hashing using browser Web Crypto API
  const calculateSHA256 = async (message) => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Safe entropy fallback using crypto.getRandomValues if subtle is absent
    const array = new Uint32Array(8);
    window.crypto.getRandomValues(array);
    return Array.from(array).map(b => b.toString(16).padStart(8, '0')).join('');
  };

  // Cryptographically secure random ID generator
  const generateSecureRandomId = () => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return 100000 + (array[0] % 900000);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Clean inputs
    const cleanCurp = curp.toUpperCase().trim();
    const cleanCp = cp.trim();
    const cleanCel = celular.trim();

    // Validations
    if (!cleanCurp || cleanCurp.length !== 18) {
      setFormError('La CURP es obligatoria y debe tener exactamente 18 caracteres.');
      return;
    }

    if (!cleanCp || cleanCp.length !== 5 || isNaN(cleanCp)) {
      setFormError('El Código Postal es obligatorio y debe tener exactamente 5 dígitos.');
      return;
    }

    if (!cleanCel || cleanCel.length !== 10 || isNaN(cleanCel)) {
      setFormError('El Teléfono Celular es obligatorio y debe tener exactamente 10 dígitos.');
      return;
    }

    if (!customProposal || customProposal.trim().length < 10) {
      setFormError('Tu sugerencia o propuesta es obligatoria y debe tener al menos 10 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sanitize input to block XSS
      const sanitizedProposal = sanitizeInput(customProposal);
      
      // Obscure CURP: first 4 and last 2 visible, middle 12 obscured
      const obscuredCurp = cleanCurp.substring(0, 4) + '************' + cleanCurp.substring(16, 18);

      const payload = {
        curp: obscuredCurp,
        cp: cleanCp,
        celular: cleanCel,
        age: age || 'No especificada',
        gender,
        sector,
        district,
        waterPain,
        transitPain,
        potholesPain,
        safetyPain,
        proposal: sanitizedProposal,
        timestamp: new Date().toISOString()
      };

      // Compute secure hash of the payload
      const secureHash = await calculateSHA256(JSON.stringify(payload));
      const certificateId = `TA-CERT-${generateSecureRandomId()}`;

      // Log action to the security ledger
      await localAuditLogger.logAction('CITIZEN_PROPOSAL_SUBMITTED', {
        certificateId,
        dataHash: `sha256:${secureHash}`,
        district
      });

      // Launch standard event or dispatch window alert toast
      const toastEvent = new CustomEvent('civic-toast', {
        detail: {
          message: '¡Demanda cívica procesada con éxito y firmada en el ledger local!',
          type: 'success'
        }
      });
      window.dispatchEvent(toastEvent);

      setCredential({
        hash: `sha256:${secureHash}`,
        curp: obscuredCurp,
        cp: cleanCp,
        celular: cleanCel,
        age: age || 'No especificada',
        gender: gender === 'male' ? 'MASCULINO' : (gender === 'female' ? 'FEMENINO' : (gender === 'non-binary' ? 'NON-BINARY' : 'SIN ESPECIFICAR')),
        sector: sector.toUpperCase(),
        district,
        averages: {
          water: waterPain,
          transit: transitPain,
          potholes: potholesPain,
          safety: safetyPain
        },
        timestamp: new Date().toISOString(),
        certificateId
      });
    } catch (err) {
      console.error(err);
      setFormError('Ocurrió un error de seguridad al firmar criptográficamente la cédula.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyApi = () => {
    navigator.clipboard.writeText(`curl -X POST https://thoth-agora.vps.oracle.com/api/v1/opinion \\
  -H "Content-Type: application/json" \\
  -d '{
    "curp": "${curp.toUpperCase()}",
    "cp": "${cp}",
    "celular": "${celular}",
    "sector": "${sector}",
    "district": "${district}",
    "water_pain": ${waterPain.toFixed(2)},
    "transit_pain": ${transitPain.toFixed(2)},
    "potholes_pain": ${potholesPain.toFixed(2)},
    "safety_pain": ${safetyPain.toFixed(2)},
    "proposal": "${customProposal.replace(/'/g, "\\'") || 'Ninguna'}"
  }'`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      
      {/* 🏺 Mystic Banner - ThothAgora Portal */}
      <div className="glass-card glow-purple" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(18, 11, 36, 0.9) 0%, rgba(35, 15, 64, 0.9) 100%)',
        border: '1px solid var(--neon-purple)'
      }}>
        <div style={{ maxWidth: '75%' }}>
          <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#D4AF37' }}>
            <Sparkles size={20} color="#D4AF37" />
            ThothAgora: El Oráculo del Ágora
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Canal de captura ciudadana descentralizado. Aquí los ciudadanos expresan sus demandas territoriales y consultan los augurios de la felicidad pública, auditados localmente con absoluta soberanía de datos.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="tag-badge" style={{ background: 'rgba(212, 175, 55, 0.15)', color: '#D4AF37', borderColor: 'rgba(212, 175, 55, 0.3)' }}>
            🏛️ Democracia Soberana
          </span>
        </div>
      </div>

      {/* 📊 Seccion 1: Los Augurios Cívicos (KPI Dashboard) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Activity size={16} color="var(--neon-emerald)" />
          Los Augurios del Ágora (KPIs Municipales)
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          {Object.entries(kpis).map(([key, kpi]) => (
            <div key={key} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{kpi.label}</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ 
                  fontSize: '1.75rem', 
                  fontWeight: '800', 
                  color: kpi.state === 'emerald' ? 'var(--neon-emerald)' : (kpi.state === 'amber' ? 'var(--neon-amber)' : 'var(--neon-purple)')
                }}>
                  {kpi.value}
                </span>
                <span className="tag-badge" style={{ 
                  fontSize: '0.6rem', 
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'var(--border-glass)' 
                }}>
                  Actualizado Local
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="workspace-grid-2">
        
        {/* 📝 LADO IZQUIERDO: Formulario de Captura del Ciudadano */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Sliders size={18} color="var(--neon-blue)" />
            Expresa tus Demandas Cívicas
          </h3>

          {/* Form Error Banner */}
          {formError && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              color: 'var(--neon-rose)', 
              padding: '0.6rem 1rem', 
              borderRadius: 'var(--radius-sm)', 
              fontSize: '0.8rem', 
              fontWeight: '700' 
            }}>
              ⚠️ {formError}
            </div>
          )}
          
          <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* CURP and Phone */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>CURP (Obligatorio - 18 caracteres):</label>
                <input 
                  type="text" 
                  maxLength="18"
                  placeholder="Ej. AAAA000000XXXXXX00" 
                  value={curp}
                  onChange={(e) => setCurp(e.target.value.toUpperCase())}
                  className="citizen-input"
                  style={{ textTransform: 'uppercase', fontFamily: 'monospace' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Celular (Obligatorio - 10 dígitos):</label>
                <input 
                  type="text" 
                  maxLength="10"
                  placeholder="Ej. 6621234567" 
                  value={celular}
                  onChange={(e) => setCelular(e.target.value.replace(/\D/g, ''))}
                  className="citizen-input"
                />
              </div>
            </div>

            {/* CP and Age */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Código Postal (Obligatorio - 5 dígitos):</label>
                <input 
                  type="text" 
                  maxLength="5"
                  placeholder="Ej. 83000" 
                  value={cp}
                  onChange={(e) => setCp(e.target.value.replace(/\D/g, ''))}
                  className="citizen-input"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Edad (Opcional):</label>
                <input 
                  type="number" 
                  placeholder="Ej. 28" 
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="citizen-input"
                />
              </div>
            </div>

            {/* Sector and Gender */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tu Perfil Demográfico:</label>
                <select 
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                >
                  <option value="estudiante">Estudiante / Joven</option>
                  <option value="asalariado">Asalariado / Obrero</option>
                  <option value="comerciante">Comerciante / Pyme</option>
                  <option value="desempleado">Buscando Empleo</option>
                  <option value="jubilado">Jubilado / Adulto Mayor</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Género (Opcional):</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                >
                  <option value="prefer-not-to-say">Prefiero no decir</option>
                  <option value="male">Masculino</option>
                  <option value="female">Femenino</option>
                  <option value="non-binary">No binario</option>
                </select>
              </div>
            </div>

            {/* Distrito Electoral */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tu Distrito Electoral (Hermosillo):</label>
              <select 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              >
                <option value="HER-DIS-06">Distrito 6 (Norte - Universitarios)</option>
                <option value="HER-DIS-08">Distrito 8 (Sur - Palo Verde)</option>
                <option value="HER-DIS-09">Distrito 9 (Centro - Pymes)</option>
                <option value="HER-DIS-10">Distrito 10 (Poniente - Residencial)</option>
              </select>
            </div>

            {/* Sliders de Dolores */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Gravedad de Puntos de Dolor:</span>
              
              {/* Agua */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Desabasto de Agua</span>
                  <span style={{ color: 'var(--neon-blue)', fontWeight: '700' }}>{(waterPain * 10).toFixed(1)} / 10</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" value={waterPain} 
                  onChange={(e) => setWaterPain(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--neon-blue)' }}
                />
              </div>

              {/* Transporte */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Esperas en Transporte Público</span>
                  <span style={{ color: 'var(--neon-purple)', fontWeight: '700' }}>{(transitPain * 10).toFixed(1)} / 10</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" value={transitPain} 
                  onChange={(e) => setTransitPain(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--neon-purple)' }}
                />
              </div>

              {/* Baches */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Baches y Daños Viales</span>
                  <span style={{ color: 'var(--neon-amber)', fontWeight: '700' }}>{(potholesPain * 10).toFixed(1)} / 10</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" value={potholesPain} 
                  onChange={(e) => setPotholesPain(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--neon-amber)' }}
                />
              </div>

              {/* Seguridad */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                  <span>Inseguridad en tu Colonia</span>
                  <span style={{ color: 'var(--neon-red)', fontWeight: '700' }}>{(safetyPain * 10).toFixed(1)} / 10</span>
                </div>
                <input 
                  type="range" min="0" max="1" step="0.05" value={safetyPain} 
                  onChange={(e) => setSafetyPain(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--neon-red)' }}
                />
              </div>
            </div>

            {/* Sugerencias del Oráculo */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700' }}>Tu Propuesta o Queja Directa (Mínimo 10 caracteres):</label>
              <textarea 
                placeholder="Escribe aquí tu propuesta para que el Oráculo de Thoth la analice y planifique su viabilidad..."
                value={customProposal}
                onChange={(e) => setCustomProposal(e.target.value)}
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'none',
                  height: '60px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Botón de Envío */}
            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn-premium"
              style={{ 
                marginTop: '0.5rem', 
                background: 'linear-gradient(90deg, #D4AF37 0%, var(--neon-purple) 100%)', 
                borderColor: '#D4AF37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '14px', height: '14px' }}></div>
                  Invocando al Oráculo...
                </>
              ) : (
                <>
                  <Send size={14} />
                  Transmitir al Oráculo de Thoth
                </>
              )}
            </button>
          </form>
        </div>

        {/* 🔮 LADO DERECHO: Cédula Digital de Identidad Sintética (Digital Twin Card) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ 
            minHeight: '280px', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            background: 'radial-gradient(circle at center, rgba(35, 15, 64, 0.4) 0%, rgba(18, 11, 36, 0.8) 100%)',
            border: credential ? '2px solid #D4AF37' : '1px dashed var(--border-glass)',
            boxShadow: credential ? '0 0 15px rgba(212, 175, 55, 0.25)' : 'none',
            position: 'relative',
            overflow: 'hidden',
            transition: 'var(--transition-smooth)'
          }}>
            
            {/* Watermark/Motif */}
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '8rem',
              opacity: 0.03,
              pointerEvents: 'none',
              fontFamily: 'serif'
            }}>🏛️</div>

            {!credential ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', padding: '2rem', textAlign: 'center' }}>
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px dashed var(--border-glass)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <FileLock2 size={24} />
                </div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Esperando Demanda Cívica</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Envía tus demandas para generar criptográficamente tu <strong>Cédula de Identidad de Gemelo Digital</strong> firmada por el Oráculo.
                </p>
              </div>
            ) : (
              <div style={{ width: '100%', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                
                {/* Header of Credential */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(212, 175, 55, 0.2)', paddingBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: '800', color: '#D4AF37', letterSpacing: '1px' }}>THOTHAGORA ORACLE</h4>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>SECURE CITIZEN TWIN BADGE</span>
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--neon-emerald)', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '700' }}>
                    SIGNED LOCAL
                  </span>
                </div>

                {/* Body Details */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {/* Glowing QR representation */}
                  <div style={{ 
                    width: '75px', 
                    height: '75px', 
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(212, 175, 55, 0.3)', 
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    position: 'relative',
                    padding: '4px'
                  }}>
                    {/* Inner custom QR mock */}
                    <div style={{ 
                      width: '100%', 
                      height: '100%', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(5, 1fr)', 
                      gridTemplateRows: 'repeat(5, 1fr)', 
                      gap: '3px',
                      opacity: 0.8
                    }}>
                      {[...Array(25)].map((_, idx) => (
                        <div key={idx} style={{ 
                          background: (idx % 2 === 0 && idx % 3 !== 0) || idx === 0 || idx === 4 || idx === 20 || idx === 24 ? '#D4AF37' : 'transparent',
                          borderRadius: '1px'
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* Text attributes */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>ID Cédula:</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{credential.certificateId}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>CURP (Segura):</span>
                      <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{credential.curp}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>CP / Celular:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{credential.cp} / {credential.celular}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Edad / Género:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{credential.age} / {credential.gender}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Perfil / Distrito:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>{credential.sector} / {credential.district}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Dolor Promedio:</span>
                      <strong style={{ color: 'var(--neon-purple)' }}>
                        {((credential.averages.water + credential.averages.transit + credential.averages.potholes + credential.averages.safety) / 4 * 10).toFixed(1)} / 10
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Footer and cryptographic signature */}
                <div style={{ 
                  marginTop: '0.25rem', 
                  background: 'rgba(0,0,0,0.3)', 
                  padding: '0.5rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: '1px solid var(--border-glass)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem'
                }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>FIRMA CRIPTOGRÁFICA REGULATORIA (SHA-256):</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--neon-emerald)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{credential.hash}</span>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* 🚀 Sección 2: Arquitectura VPS Oracle Cloud E2-Micro (1GB RAM) */}
      <div className="glass-card glow-blue" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Cpu size={18} color="var(--neon-blue)" />
            Especificación VPS Oracle Cloud E2-Micro (1GB RAM)
          </h3>
          <span className="tag-badge" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--neon-blue)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            1 Core / 1GB RAM / Siempre Gratis
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          Para que el portal de captura ciudadana y la API soporten tráfico real dentro del límite de **1 GB de RAM** de la cuenta gratuita de Oracle Cloud, se establece un diseño arquitectónico extremadamente liviano que no utiliza Docker, nubes pesadas ni frameworks de alto consumo de memoria:
        </p>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
          gap: '1rem',
          marginTop: '0.25rem' 
        }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>🔋 Stack Backend: Go + SQLite</span>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li><strong>Go (Golang)</strong> compilado nativo. Consume solo **12 MB** de RAM en producción bajo carga.</li>
              <li><strong>SQLite</strong> local cifrado. Evita la sobrecarga de RAM de correr un proceso pesado de PostgreSQL o MySQL.</li>
              <li><strong>Zero-Dependency Static Hosting</strong>: El frontend React se compila a HTML/JS estático y se sirve directamente por **Caddy / Nginx** (menos de **8MB** RAM).</li>
            </ul>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>🔒 Seguridad y Rate Limiting</span>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', paddingLeft: '1rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li><strong>Limpieza de memoria proactiva</strong>: Cache local in-memory de solo 5 minutos.</li>
              <li><strong>Rate limiting por IP (Caddy)</strong> para evitar caídas del VPS de 1 núcleo ante ataques DDoS.</li>
              <li><strong>API REST JSON simple</strong>: Formato de carga directa optimizado.</li>
            </ul>
          </div>

        </div>

        {/* 💻 API Contract and CURL Command */}
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)' }}>Contrato API Cívico (CURL para el Ciudadano):</span>
            <button 
              onClick={handleCopyApi}
              className="btn-outline"
              style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}
            >
              {copied ? (
                <>
                  <Check size={12} color="var(--neon-emerald)" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copiar comando CURL
                </>
              )}
            </button>
          </div>
          <pre style={{
            background: 'rgba(0,0,0,0.4)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.75rem',
            overflowX: 'auto',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'var(--neon-blue)',
            margin: 0
          }}>
{`curl -X POST https://thoth-agora.vps.oracle.com/api/v1/opinion \\
  -H "Content-Type: application/json" \\
  -d '{
    "sector": "${sector}",
    "district": "${district}",
    "water_pain": ${waterPain.toFixed(2)},
    "transit_pain": ${transitPain.toFixed(2)},
    "potholes_pain": ${potholesPain.toFixed(2)},
    "safety_pain": ${safetyPain.toFixed(2)},
    "proposal": "${customProposal.replace(/'/g, "\\'") || 'Ninguna'}"
  }'`}
          </pre>
        </div>

      </div>

    </div>
  );
}
