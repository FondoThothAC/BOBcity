import logoFondoThoth from '../assets/logo_fondo_thoth.png';
import './Footer.css';

/**
 * Footer — Pie de página con información de contacto, redes sociales y aviso legal.
 */
export default function Footer() {
  const anioActual = new Date().getFullYear();

  return (
    <footer id="contacto" className="footer-section">
      <div className="section-divider"></div>
      <div className="container footer-grid">

        {/* Columna: Logo y descripción */}
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <img src={logoFondoThoth} alt="Logo Fondo Thoth" className="footer-logo-img" />
            <span>Fondo Thoth A.C.</span>
          </div>
          <p>
            Asociación Civil dedicada a impulsar la innovación cívica, el emprendimiento
            y la creatividad desde Hermosillo, Sonora.
          </p>
        </div>

        {/* Columna: Navegación rápida */}
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
            <li><a href="#">Laboratorio de Prototipos</a></li>
          </ul>
        </div>

        {/* Columna: Contacto */}
        <div className="footer-col">
          <h4>Contacto</h4>
          <ul className="footer-contact">
            <li>
              <span className="contact-icon">📧</span>
              <a href="mailto:contacto@fondothoth.com">contacto@fondothoth.com</a>
            </li>
            <li>
              <span className="contact-icon">📍</span>
              <span>Hermosillo, Sonora, México</span>
            </li>
            <li>
              <span className="contact-icon">🌐</span>
              <a href="https://www.fondothoth.com">www.fondothoth.com</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        <p>© {anioActual} Fondo Thoth A.C. Todos los derechos reservados.</p>
        <p className="footer-powered">
          Impulsado con 𓂀 y tecnología de punta
        </p>
      </div>
    </footer>
  );
}
