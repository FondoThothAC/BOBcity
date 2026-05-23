import { useState, useEffect } from 'react';
import { useScrollDetect } from '../hooks';
import logoFondoThoth from '../assets/logo_fondo_thoth.png';
import './Navbar.css';

/**
 * Navbar — Barra de navegación fija con efecto glassmorphism al hacer scroll.
 * Incluye menú hamburguesa para dispositivos móviles y toggle de tema claro/oscuro.
 */
export default function Navbar() {
  const scrolled = useScrollDetect(50);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [tema, setTema] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  // Efecto para sincronizar la clase CSS del documento con el tema seleccionado
  useEffect(() => {
    document.documentElement.className = tema + '-theme';
  }, [tema]);

  const toggleTema = () => {
    const nuevoTema = tema === 'dark' ? 'light' : 'dark';
    setTema(nuevoTema);
    localStorage.setItem('theme', nuevoTema);
  };

  const enlaces = [
    { id: 'inicio', label: 'Inicio' },
    { id: 'nosotros', label: 'Nosotros' },
    { id: 'servicios', label: 'Servicios' },
    { id: 'proyectos', label: 'Proyectos' },
    { id: 'propuestas', label: 'Iniciativas' },
    { id: 'impacto', label: 'Impacto' },
    { id: 'donaciones', label: 'Donaciones' },
    { id: 'contacto', label: 'Contacto' },
  ];

  const scrollHacia = (id) => {
    setMenuAbierto(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Navegación principal">
      <div className="navbar-inner">
        <a href="#inicio" className="navbar-logo" onClick={() => scrollHacia('inicio')}>
          <img src={logoFondoThoth} alt="Logo Fondo Thoth" className="logo-img" />
          <span>Fondo Thoth</span>
        </a>

        <ul className={`navbar-links ${menuAbierto ? 'open' : ''}`}>
          {enlaces.map((e) => (
            <li key={e.id}>
              <a href={`#${e.id}`} onClick={(ev) => { ev.preventDefault(); scrollHacia(e.id); }}>
                {e.label}
              </a>
            </li>
          ))}
          <li className="theme-toggle-li">
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTema}
              aria-label="Cambiar tema de color"
            >
              {tema === 'dark' ? '☀️ Claro' : '🌙 Oscuro'}
            </button>
          </li>
          <li>
            <a
              href="#donaciones"
              className="btn btn-primary navbar-cta"
              onClick={(ev) => { ev.preventDefault(); scrollHacia('donaciones'); }}
            >
              Donar Ahora
            </a>
          </li>
        </ul>

        <button
          className="menu-toggle"
          onClick={() => setMenuAbierto(!menuAbierto)}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuAbierto}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
