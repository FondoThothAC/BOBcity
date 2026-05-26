import './Hero.css';

/**
 * Hero — Sección principal de impacto máximo.
 * Estética: DeepTech + Egipcio + Mexicano + Futurista oscuro.
 * Incluye pirámide holográfica SVG, ojo de Horus, scan line de datos,
 * jeroglificos decorativos y estadísticas en glassmorphism.
 */
export default function Hero() {
  return (
    <section id="inicio" className="hero-section">
      {/* Scan line de datos animada */}
      <div className="hero-scan" />

      {/* Jeroglificos sutiles en la parte superior */}
      <div className="hero-hieroglyphs" aria-hidden="true">
        𓂀 𓃭 𓆣 𓁹 𓆙 𓂋 𓇌 𓊽 𓋴 𓌳 𓍯 𓎛 𓏏 𓐍
      </div>

      {/* Orbes de energía cuántica */}
      <div className="hero-orb hero-orb--1" />
      <div className="hero-orb hero-orb--2" />
      <div className="hero-orb hero-orb--3" />

      {/* Grid de fondo con patrón de datos */}
      <div className="grid-bg" />

      {/* Pirámide holográfica SVG de fondo */}
      <svg
        className="hero-pyramid-svg"
        viewBox="0 0 900 550"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Pirámide principal */}
        <polygon
          points="450,20 20,540 880,540"
          stroke="url(#pyramidGrad)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        {/* Capas horizontales de la pirámide */}
        <line x1="155" y1="200" x2="745" y2="200" stroke="url(#pyramidGrad)" strokeWidth="0.8" opacity="0.4" />
        <line x1="260" y1="320" x2="640" y2="320" stroke="url(#pyramidGrad)" strokeWidth="0.8" opacity="0.4" />
        <line x1="340" y1="410" x2="560" y2="410" stroke="url(#pyramidGrad)" strokeWidth="0.8" opacity="0.4" />
        <line x1="395" y1="475" x2="505" y2="475" stroke="url(#pyramidGrad)" strokeWidth="0.8" opacity="0.4" />
        {/* Vértice central */}
        <circle cx="450" cy="20" r="4" fill="#00f5e4" opacity="0.8" />
        <circle cx="450" cy="20" r="12" stroke="#00f5e4" strokeWidth="0.8" fill="none" opacity="0.3" />

        {/* Definiciones de gradientes */}
        <defs>
          <linearGradient id="pyramidGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#00f5e4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#d4af37" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#7b2fbe" stopOpacity="0.8" />
          </linearGradient>
        </defs>
      </svg>

      {/* ===== Contenido principal ===== */}
      <div className="hero-content">
        {/* Badge de ubicación */}
        <div className="hero-badge">
          <span className="badge badge-gold">
            ◆ Asociación Civil · Hermosillo, Sonora · México
          </span>
        </div>

        {/* Ojo de Horus / Logo central animado */}
        <div className="hero-eye-container">
          <div className="hero-eye-ring">
            <span className="hero-eye-icon" role="img" aria-label="Ojo de Horus — símbolo de Fondo Thoth">
              𓁹
            </span>
          </div>
        </div>

        {/* Título principal */}
        <h1 className="hero-title">
          <span className="hero-title-line1">Fondo Thoth</span>
          <span className="hero-title-main">DEEPTECH</span>
          <span className="hero-title-sub">Innovación · Arte · Ciencia · México</span>
        </h1>

        {/* Tagline */}
        <p className="hero-tagline">
          Construimos el futuro cívico con <strong>inteligencia artificial</strong>,
          gemelos digitales y tecnología de frontera.
          Somos artistas, científicos y constructores mexicanos.
        </p>

        {/* Botones de acción */}
        <div className="hero-ctas">
          <a href="#servicios" className="btn btn-primary btn-lg">
            Explorar Servicios
            <span className="btn-arrow">→</span>
          </a>
          <a href="#proyectos" className="btn btn-ghost btn-lg">
            Ver Proyectos
            <span className="btn-arrow">⬡</span>
          </a>
          <a href="#donaciones" className="btn btn-gold btn-lg">
            Apoyar la Causa
            <span className="btn-arrow">♡</span>
          </a>
        </div>

        {/* Estadísticas en glassmorphism */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-number">6+</span>
            <span className="hero-stat-label">Verticales</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-number">AI</span>
            <span className="hero-stat-label">Infraestructura H100</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-number">MX</span>
            <span className="hero-stat-label">Impacto Nacional</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-number">𓂀</span>
            <span className="hero-stat-label">Desde Hermosillo</span>
          </div>
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="hero-scroll-indicator">
        <div className="scroll-line" />
        <span>Descubre más</span>
      </div>
    </section>
  );
}
