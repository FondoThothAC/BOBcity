import { useState } from 'react';
import './Donations.css';

/**
 * Donations — Sección de donaciones con membresías escalonadas
 * y programa "Adopta una Sección Electoral".
 */
export default function Donations() {
  const [seleccion, setSeleccion] = useState(null);

  const niveles = [
    {
      nombre: 'Bronce',
      precio: '$100',
      periodo: '/mes',
      icono: '🥉',
      color: 'gold',
      beneficios: [
        'Newsletter mensual premium',
        'Acceso a reportes cívicos públicos',
        'Mención en comunidad de impulsores',
      ],
    },
    {
      nombre: 'Plata',
      precio: '$500',
      periodo: '/mes',
      icono: '🥈',
      color: 'cyan',
      popular: true,
      beneficios: [
        'Todo lo de Bronce',
        'Acceso a dashboards de CivicPulse',
        'Invitaciones a eventos exclusivos',
        'Badge digital de impulsor cívico',
      ],
    },
    {
      nombre: 'Oro',
      precio: '$2,000',
      periodo: '/mes',
      icono: '🥇',
      color: 'purple',
      beneficios: [
        'Todo lo de Plata',
        'Consultoría personalizada mensual',
        'Logo en la página de patrocinadores',
        'Acceso anticipado a nuevos proyectos',
        'Reporte trimestral de impacto',
      ],
    },
  ];

  return (
    <section id="donaciones" className="section donations-section">
      <div className="grid-bg"></div>
      <div className="container">
        <h2 className="section-title fade-in">
          Tu peso <span>Tiene Peso</span>
        </h2>
        <p className="section-subtitle fade-in">
          Bajo esta iniciativa de Fondo Thoth A.C., tu aportación impulsa la innovación cívica, la ciencia abierta y el talento joven de Hermosillo. Cada recurso se transforma en tecnología de impacto real.
        </p>

        {/* Tarjetas de membresía */}
        <div className="donations-grid">
          {niveles.map((n, i) => (
            <div
              key={i}
              className={`glass-card donation-card donation-card--${n.color} ${n.popular ? 'donation-card--popular' : ''} fade-in`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              {n.popular && <div className="popular-badge">Más Popular</div>}
              <div className="donation-icon">{n.icono}</div>
              <h3>{n.nombre}</h3>
              <div className="donation-price">
                {n.precio}<span className="donation-period">{n.periodo}</span>
              </div>
              <ul className="donation-benefits">
                {n.beneficios.map((b, j) => (
                  <li key={j}>
                    <span className="check">✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <button
                className={`btn ${n.popular ? 'btn-primary' : 'btn-secondary'} donation-btn`}
                onClick={() => setSeleccion(n)}
              >
                Seleccionar {n.nombre}
              </button>
            </div>
          ))}
        </div>

        {/* Sección especial: Adopta una Sección Electoral */}
        <div className="glass-card adopta-section fade-in">
          <div className="adopta-content">
            <div className="adopta-badge badge badge-gold">
              <span>🗳️</span> Programa Especial
            </div>
            <h3>Adopta una Sección Electoral</h3>
            <p>
              "Adopta" una sección electoral específica con una donación única. Tu contribución
              financia la recolección de datos de calidad de vida, propuestas ciudadanas y
              simulaciones de impacto para esa zona. Recibirás reportes trimestrales con
              los avances reales de tu sección adoptada.
            </p>
            <div className="adopta-ctas">
              <button 
                className="btn btn-gold"
                onClick={() => setSeleccion({ nombre: 'Adopción de Sección (Estándar)', precio: '$500', periodo: ' (Pago Único)', icono: '🗳️' })}
              >
                Adoptar por $500 MXN
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSeleccion({ nombre: 'Adopción de Sección (Destacada)', precio: '$2,000', periodo: ' (Pago Único)', icono: '🗳️' })}
              >
                Adoptar por $2,000 MXN
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setSeleccion({ nombre: 'Adopción de Sección (Patrocinador)', precio: '$5,000', periodo: ' (Pago Único)', icono: '🗳️' })}
              >
                Adoptar por $5,000 MXN
              </button>
            </div>
          </div>
        </div>

        {/* Donación libre */}
        <div className="donation-libre fade-in">
          <p>¿Prefieres un monto personalizado?</p>
          <a href="mailto:contacto@fondothoth.com" className="btn btn-secondary">
            Donar Monto Libre →
          </a>
        </div>

        {seleccion && (
          <div className="donation-modal-overlay" onClick={() => setSeleccion(null)}>
            <div className="glass-card donation-modal animate-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-modal-btn" onClick={() => setSeleccion(null)}>×</button>
              <h3>Apoya como Miembro <span>{seleccion.nombre}</span></h3>
              <p className="modal-description">
                Estás a punto de suscribirte a la membresía <strong>{seleccion.nombre}</strong> por <strong>{seleccion.precio} MXN{seleccion.periodo}</strong>.
              </p>
              
              <div className="payment-methods-selector">
                <p className="selector-title">Selecciona tu método de pago:</p>
                <div className="payment-options">
                  <label className="payment-option-card">
                    <input type="radio" name="payment-method" value="stripe" defaultChecked />
                    <div className="option-content">
                      <span className="payment-icon">💳</span>
                      <span className="payment-name">Stripe / Tarjeta</span>
                    </div>
                  </label>
                  
                  <label className="payment-option-card">
                    <input type="radio" name="payment-method" value="paypal" />
                    <div className="option-content">
                      <span className="payment-icon">🅿️</span>
                      <span className="payment-name">PayPal</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="btn btn-primary btn-pay" 
                  onClick={() => {
                    alert(`Simulación de pago iniciada para membresía ${seleccion.nombre}. ¡Gracias por tu apoyo a Fondo Thoth A.C.!`);
                    setSeleccion(null);
                  }}
                >
                  Procesar Pago Seguro
                </button>
                <button className="btn btn-secondary" onClick={() => setSeleccion(null)}>
                  Cancelar
                </button>
              </div>
              <p className="payment-security-notice">
                🔒 Transacciones seguras encriptadas de extremo a extremo.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
