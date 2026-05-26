import logoFondoThoth from '../assets/logo_fondo_thoth.png';
import './Footer.css';

/**
 * Footer — Pie de página con contacto, redes sociales y créditos.
 * Estética deeptech + egipcia + mexicana: jeroglificos decorativos,
 * iconos de redes circulares con glow cian.
 */
export default function Footer() {
  const anioActual = new Date().getFullYear();

  /* Redes sociales de Fondo Thoth */
  const redes = [
    { href: 'https://twitter.com/fondothoth',    icon: '𝕏',  label: 'Twitter / X' },
    { href: 'https://instagram.com/fondothoth',  icon: '◎',  label: 'Instagram' },
    { href: 'https://facebook.com/fondothoth',   icon: 'f',  label: 'Facebook' },
    { href: 'https://linkedin.com/company/fondothoth', icon: 'in', label: 'LinkedIn' },
    { href: 'https://t.me/fondothoth',           icon: '✈',  label: 'Telegram' },
  ];

  return (
    <footer id="contacto" className="footer-section">
      <div className="container footer-grid">

        {/* Columna: Marca */}
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <img src={logoFondoThoth} alt="Logo Fondo Thoth AC" className="footer-logo-img" />
            <span>FONDO THOTH A.C.</span>
          </div>
          <p>
            Asociación Civil dedicada a impulsar la innovación cívica, el emprendimiento
            y la creatividad desde Hermosillo, Sonora.
            DeepTech · Arte · Ciencia · México.
          </p>
          {/* Redes sociales */}
          <div className="footer-social">
            {redes.map((r) => (
              <a
                key={r.label}
                href={r.href}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label={r.label}
                title={r.label}
              >
                {r.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Columna: Navegación */}
        <div className="footer-col">
          <h4>Navegación</h4>
          <ul>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#nosotros">Nosotros</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#proyectos">Proyectos</a></li>
            <li><a href="#donaciones">Donaciones</a></li>
          </ul>
        </div>

        {/* Columna: Proyectos */}
        <div className="footer-col">
          <h4>Proyectos</h4>
          <ul>
            <li><a href="http://129.146.213.8" target="_blank" rel="noopener noreferrer">CivicaOS</a></li>
            <li><a href="#">CSTAS App</a></li>
            <li><a href="#">Open Business Plan</a></li>
            <li><a href="#">Lab de Prototipos</a></li>
          </ul>
        </div>

        {/* Columna: Contacto */}
        <div className="footer-col">
          <h4>Contacto</h4>
          <ul className="footer-contact">
            <li>
              <span className="contact-icon">𓂀</span>
              <a href="mailto:contacto@fondothoth.com">contacto@fondothoth.com</a>
            </li>
            <li>
              <span className="contact-icon">◆</span>
              <span>Hermosillo, Sonora, México</span>
            </li>
            <li>
              <span className="contact-icon">🌐</span>
              <a href="https://www.fondothoth.com" target="_blank" rel="noopener noreferrer">
                www.fondothoth.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="container footer-bottom">
        <p>© {anioActual} Fondo Thoth A.C. Todos los derechos reservados.</p>
        <p className="footer-powered">Construido con 𓁹 y tecnología de frontera</p>
      </div>
    </footer>
  );
}
