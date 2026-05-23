import { useState } from 'react';
import './Projects.css';

/**
 * Projects — Carousel manual de los proyectos activos principales.
 * Cada proyecto enlaza a su subsitio o descripción expandida.
 */
export default function Projects() {
  const proyectos = [
    {
      nombre: 'CivicaOS / CivicPulse',
      descripcion: 'Gemelo digital social y plataforma de consultoría electoral. Simula el comportamiento ciudadano a nivel sección electoral, intención de voto y predicciones analíticas mediante modelos ABM y redes de agentes impulsados por IA.',
      url: 'http://129.146.213.8',
      estado: 'En Producción',
      icono: '🏛️',
      acento: 'cyan',
      tech: ['React', 'Python', 'ABM', 'Softmax', 'Consultoría Electoral'],
    },
    {
      nombre: 'Cositas App (CSTAS)',
      descripcion: 'Marketplace de siguiente generación con funcionalidad integrada de neobank: pagos P2P, créditos comunitarios, y un ecosistema de comercio local.',
      url: 'https://ftapps-e4c6b.web.app',
      estado: 'En Desarrollo',
      icono: '🛒',
      acento: 'purple',
      tech: ['React Native', 'Node.js', 'Stripe', 'Fintech'],
    },
    {
      nombre: 'Open Business Plan',
      descripcion: 'Plataforma de generación de planes de negocio profesionales asistidos por IA. Modelos financieros predictivos, análisis de mercado automatizado y exportación a PDF ejecutivo.',
      url: '#',
      estado: 'En Desarrollo',
      icono: '📊',
      acento: 'gold',
      tech: ['IA Generativa', 'PDF', 'Análisis Financiero'],
    },
  ];

  const [activo, setActivo] = useState(0);

  return (
    <section id="proyectos" className="section projects-section">
      <div className="grid-bg"></div>
      <div className="container">
        <h2 className="section-title fade-in">
          Proyectos <span>Activos</span>
        </h2>
        <p className="section-subtitle fade-in">
          Plataformas tecnológicas propias que estamos construyendo para transformar
          comunidades, comercio y gobierno.
        </p>

        {/* Navegación de tabs */}
        <div className="projects-tabs fade-in">
          {proyectos.map((p, i) => (
            <button
              key={i}
              className={`projects-tab ${activo === i ? 'active' : ''} projects-tab--${p.acento}`}
              onClick={() => setActivo(i)}
            >
              <span className="tab-icon">{p.icono}</span>
              <span className="tab-name">{p.nombre}</span>
            </button>
          ))}
        </div>

        {/* Detalle del proyecto activo */}
        <div className={`glass-card project-detail project-detail--${proyectos[activo].acento} scale-in visible`} key={activo}>
          <div className="project-detail-header">
            <div>
              <span className={`badge badge-${proyectos[activo].acento}`}>
                {proyectos[activo].estado}
              </span>
              <h3>{proyectos[activo].nombre}</h3>
            </div>
            <span className="project-icon-large">{proyectos[activo].icono}</span>
          </div>

          <p className="project-description">{proyectos[activo].descripcion}</p>

          <div className="project-tech">
            {proyectos[activo].tech.map((t, j) => (
              <span key={j} className="project-tech-tag">{t}</span>
            ))}
          </div>

          {proyectos[activo].url !== '#' && (
            <a
              href={proyectos[activo].url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ marginTop: '1.5rem' }}
            >
              Ver Plataforma →
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
