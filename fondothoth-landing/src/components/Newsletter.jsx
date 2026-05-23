import { useState } from 'react';
import './Newsletter.css';

/**
 * Newsletter — Formulario de suscripción premium con validación básica.
 */
export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setEnviado(true);
      // En producción: conectar a un servicio como Mailchimp, Resend, etc.
      setTimeout(() => setEnviado(false), 5000);
      setEmail('');
    }
  };

  return (
    <section className="section newsletter-section">
      <div className="container">
        <div className="glass-card newsletter-card fade-in">
          <div className="newsletter-content">
            <div className="newsletter-icon">📬</div>
            <h2>
              Mantente <span style={{
                background: 'linear-gradient(135deg, var(--color-cyan), var(--color-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Conectado</span>
            </h2>
            <p>
              Recibe reportes cívicos, noticias de proyectos, convocatorias a hackathones
              e invitaciones a eventos. Sin spam, solo impacto.
            </p>

            <form className="newsletter-form" onSubmit={manejarEnvio}>
              <div className="newsletter-input-group">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="newsletter-input"
                  id="newsletter-email"
                />
                <button type="submit" className="btn btn-primary newsletter-btn">
                  {enviado ? '✓ ¡Suscrito!' : 'Suscribirse'}
                </button>
              </div>
            </form>

            <p className="newsletter-disclaimer">
              Respetamos tu privacidad. Puedes darte de baja en cualquier momento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
