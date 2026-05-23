import logoCositas from '../assets/logocositas.png';
import logoFondoThoth from '../assets/logo_fondo_thoth.jpg';
import './Sponsors.css';

/**
 * Sponsors — Grid animado de patrocinadores y aliados corporativos históricos.
 * Muestra los logotipos vectoriales de Comercio Cuántico, KYTC, Woolfo, BOB City
 * y los logos cargados de Cositas App y Fondo Thoth.
 */
export default function Sponsors() {
  const patrocinadores = [
    {
      nombre: 'Comercio Cuántico',
      type: 'svg',
      render: () => (
        <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sponsor-logo-svg">
          <path d="M10 20L22 8L34 20L22 32L10 20Z" stroke="#00f5d4" strokeWidth="2" fill="rgba(0, 245, 212, 0.05)"/>
          <circle cx="22" cy="20" r="3" fill="#00f5d4"/>
          <text x="44" y="24" fill="#f1f5f9" fontSize="9" fontFamily="var(--font-heading)" fontWeight="800" letterSpacing="0.05em">CUÁNTICO</text>
        </svg>
      )
    },
    {
      nombre: 'KYTC Software',
      type: 'svg',
      render: () => (
        <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sponsor-logo-svg">
          <path d="M12 10V30H17V20L25 30H31L22 19L30 10H24L17 17V10H12Z" fill="#7b2cbf"/>
          <text x="38" y="24" fill="#f1f5f9" fontSize="12" fontFamily="var(--font-heading)" fontWeight="900" letterSpacing="0.08em">KYTC</text>
        </svg>
      )
    },
    {
      nombre: 'Woolfo Systems',
      type: 'svg',
      render: () => (
        <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sponsor-logo-svg">
          <path d="M10 12L18 8L26 15L18 32L10 12Z" stroke="#c4a97a" strokeWidth="2" fill="rgba(196, 169, 122, 0.05)"/>
          <path d="M26 12L18 8L26 15" stroke="#c4a97a" strokeWidth="2"/>
          <text x="36" y="24" fill="#f1f5f9" fontSize="10" fontFamily="var(--font-heading)" fontWeight="800" letterSpacing="0.05em">WOOLFO</text>
        </svg>
      )
    },
    {
      nombre: 'BOB City',
      type: 'svg',
      render: () => (
        <svg viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="sponsor-logo-svg">
          <rect x="10" y="14" width="5" height="14" fill="#00f5d4" opacity="0.6"/>
          <rect x="17" y="8" width="5" height="20" fill="#7b2cbf"/>
          <rect x="24" y="16" width="5" height="12" fill="#c4a97a" opacity="0.8"/>
          <text x="36" y="24" fill="#f1f5f9" fontSize="10" fontFamily="var(--font-heading)" fontWeight="800" letterSpacing="0.05em">BOB CITY</text>
        </svg>
      )
    },
    {
      nombre: 'Cositas App',
      type: 'img',
      src: logoCositas
    },
    {
      nombre: 'Fondo Thoth A.C.',
      type: 'img',
      src: logoFondoThoth
    }
  ];

  return (
    <section className="section sponsors-section">
      <div className="container">
        <h2 className="section-title fade-in">
          Aliados <span>Estratégicos</span>
        </h2>
        <p className="section-subtitle fade-in">
          Organizaciones y empresas aliadas que impulsan la transformación a través de nuestras iniciativas.
        </p>

        <div className="sponsors-grid">
          {patrocinadores.map((p, i) => (
            <div
              key={i}
              className="glass-card sponsor-card fade-in"
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="sponsor-logo-container">
                {p.type === 'svg' ? (
                  p.render()
                ) : (
                  <img src={p.src} alt={p.nombre} className="sponsor-logo-img" />
                )}
              </div>
              <span className="sponsor-name">{p.nombre}</span>
            </div>
          ))}
        </div>

        <p className="sponsors-cta fade-in">
          ¿Tu organización quiere sumarse como patrocinador? {' '}
          <a href="#contacto">Contáctanos →</a>
        </p>
      </div>
    </section>
  );
}
