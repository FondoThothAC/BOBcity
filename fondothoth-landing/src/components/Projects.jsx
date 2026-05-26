import { useState, useEffect } from 'react';
import { fetchPublicData } from '../services/api';
import './Projects.css';

/**
 * Projects — Muestra los proyectos activos. Consume la API si está disponible,
 * o hace fallback a los datos locales.
 */
export default function Projects() {
  const [proyectos, setProyectos] = useState([]);
  const [activo, setActivo] = useState(0);

  const fallbackProjects = [
    {
      title: 'CivicaOS / CivicPulse',
      description: 'Gemelo digital social y plataforma de consultoría electoral. Simula el comportamiento ciudadano a nivel sección electoral, intención de voto y predicciones analíticas mediante modelos ABM y redes de agentes impulsados por IA.',
      link: 'http://129.146.213.8',
      estado: 'En Producción',
      icono: '🏛️',
      acento: 'cyan',
      tags: ['React', 'Python', 'ABM', 'Softmax', 'Consultoría Electoral'],
    },
    {
      title: 'Cositas App (CSTAS)',
      description: 'Marketplace de siguiente generación con funcionalidad integrada de neobank: pagos P2P, créditos comunitarios, y un ecosistema de comercio local.',
      link: 'https://ftapps-e4c6b.web.app',
      estado: 'En Desarrollo',
      icono: '🛒',
      acento: 'purple',
      tags: ['React Native', 'Node.js', 'Stripe', 'Fintech'],
    }
  ];

  useEffect(() => {
    const loadProjects = async () => {
      const data = await fetchPublicData();
      if (data && data.projects && data.projects.length > 0) {
        setProyectos(data.projects);
      } else {
        setProyectos(fallbackProjects);
      }
    };
    loadProjects();
  }, []);

  if (proyectos.length === 0) return null;

  return (
    <section id="proyectos" className="section projects-section">
      <div className="grid-bg"></div>
      <div className="container">
        <h2 className="section-title fade-in">
          Proyectos <span className="accent-cyan">Activos</span>
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
              className={`projects-tab ${activo === i ? 'active' : ''} projects-tab--${p.acento || 'cyan'}`}
              onClick={() => setActivo(i)}
            >
              <span className="tab-icon">{p.icono || '⬡'}</span>
              <span className="tab-name">{p.title}</span>
            </button>
          ))}
        </div>

        {/* Detalle del proyecto activo */}
        <div className={`glass-card project-detail project-detail--${proyectos[activo].acento || 'cyan'} scale-in visible`} key={activo}>
          <div className="project-detail-header">
            <div>
              <span className={`badge badge-${proyectos[activo].acento || 'cyan'}`}>
                {proyectos[activo].estado || 'Activo'}
              </span>
              <h3>{proyectos[activo].title}</h3>
            </div>
            <span className="project-icon-large">{proyectos[activo].icono || '⬡'}</span>
          </div>

          <p className="project-description">{proyectos[activo].description}</p>

          <div className="project-tech">
            {proyectos[activo].tags?.map((t, j) => (
              <span key={j} className="project-tech-tag">{t}</span>
            ))}
          </div>

          {proyectos[activo].link && proyectos[activo].link !== '#' && (
            <a
              href={proyectos[activo].link}
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
