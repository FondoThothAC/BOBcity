import { useState } from 'react';
import { useScrollDetect } from '../hooks';
import logoFondoThoth from '../assets/logo_fondo_thoth.png';
import './Navbar.css';

/**
 * Navbar — Barra de navegación fija con glassmorphism futurista.
 * Tema oscuro fijo (deeptech + egipcio + mexicano).
 * Incluye ojo de Horus, menú hamburguesa y CTA de donación.
 */
export default function Navbar() {
  const scrolled = useScrollDetect(50);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const enlaces = [
    { id: 'nosotros',   label: 'Nosotros' },
    { id: 'servicios',  label: 'Servicios' },
    { id: 'proyectos',  label: 'Proyectos' },
    { id: 'propuestas', label: 'Iniciativas' },
    { id: 'impacto',    label: 'Impacto' },
    { id: 'donaciones', label: 'Donaciones' },
    { id: 'contacto',   label: 'Contacto' },
  ];

  const scrollHacia = (id) => {
    setMenuAbierto(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="navbar-inner">
        {/* Logo */}
        <a
          href="#inicio"
          className="navbar-logo"
          onClick={() => scrollHacia('inicio')}
        >
          <div className="logo-eye">𓁹</div>
          <img src={logoFondoThoth} alt="Logo Fondo Thoth AC" className="logo-img" />
          <span className="logo-text">FONDO <span className="logo-accent">THOTH</span></span>
        </a>

        {/* Menú de navegación */}
        <ul className={`navbar-links ${menuAbierto ? 'open' : ''}`}>
          {enlaces.map((e) => (
            <li key={e.id}>
              <a
                href={`#${e.id}`}
                onClick={(ev) => { ev.preventDefault(); scrollHacia(e.id); }}
              >
                {e.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="#donaciones"
              id="navbar-donar-btn"
              className="btn btn-primary navbar-cta"
              onClick={(ev) => { ev.preventDefault(); scrollHacia('donaciones'); }}
            >
              Donar Ahora
            </a>
          </li>
        </ul>

        {/* Hamburguesa para móvil */}
        <button
          className={`menu-toggle ${menuAbierto ? 'active' : ''}`}
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuAbierto}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </nav>
  );
}
