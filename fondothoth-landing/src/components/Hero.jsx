import './Hero.css';

/**
 * Hero — Sección principal con animación de fondo, título impactante y CTAs.
 * Incluye orbe decorativo animado y partículas de fondo.
 */
export default function Hero() {
  return (
    <section id="inicio" className="hero-section">
      {/* Orbe de fondo animado */}
      <div className="hero-orb hero-orb--1"></div>
      <div className="hero-orb hero-orb--2"></div>
      <div className="hero-orb hero-orb--3"></div>

      {/* Grid de fondo */}
      <div className="grid-bg"></div>

      <div className="hero-content">
        <div className="hero-badge badge badge-cyan">
          <span>◆</span> Asociación Civil · Hermosillo, Sonora
        </div>

        <h1 className="hero-title">
          Construimos el{' '}
          <span className="hero-gradient-text">futuro cívico</span>
          <br />
          con tecnología e inteligencia artificial
        </h1>

        <p className="hero-subtitle">
          Somos una organización multidisciplinaria que impulsa la transformación social
          a través de gemelos digitales, desarrollo de software, consultoría electoral,
          arte, deporte y ciencia.
        </p>

        <div className="hero-ctas">
          <a href="#servicios" className="btn btn-primary btn-lg">
            Explorar Servicios
            <span className="btn-arrow">→</span>
          </a>
          <a href="#donaciones" className="btn btn-gold btn-lg">
            Apoyar la Causa
            <span className="btn-arrow">♡</span>
          </a>
        </div>

        {/* Estadísticas rápidas */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">6+</span>
            <span className="hero-stat-label">Verticales de Servicio</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-number">AI</span>
            <span className="hero-stat-label">Infraestructura H100</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-number">MX</span>
            <span className="hero-stat-label">Impacto Nacional</span>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="hero-scroll-indicator">
        <div className="scroll-line"></div>
        <span>Descubre más</span>
      </div>
    </section>
  );
}
