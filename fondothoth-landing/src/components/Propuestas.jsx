import './Propuestas.css';

/**
 * Propuestas — Sección que muestra los proyectos de recaudación y propuestas de impacto social
 * independientes de CivicaOS y Cositas App.
 */
export default function Propuestas() {
  const propuestas = [
    {
      titulo: 'Sonora Hardware Hub',
      subtitulo: 'Laboratorio de Prototipos Físicos',
      descripcion: 'Equipamiento de manufactura aditiva avanzada, impresión 3D industrial, fresado CNC y diseño de circuitos impresos (PCBs). Ayudamos a inventores, emprendedores y estudiantes a materializar hardware real.',
      impacto: 'Desarrollo Industrial / Emprendimiento',
      icono: '🔧',
      acento: 'cyan',
      accion: 'Patrocinar Equipamiento'
    },
    {
      titulo: 'Proyecto BioData Sonora',
      subtitulo: 'Inteligencia Artificial para el Agro',
      descripcion: 'Modelos de Visión Artificial que procesan datos multiespectrales de satélite y sensores locales para predecir sequías, optimizar el uso de agua y detectar plagas en el Valle de Hermosillo.',
      impacto: 'AgroTech / Sustentabilidad',
      icono: '🌾',
      acento: 'gold',
      accion: 'Financiar Investigación'
    },
    {
      titulo: 'Proyecto EcoRuta Hermosillo',
      subtitulo: 'Movilidad y Logística Limpia',
      descripcion: 'Modelado y simulación de trayectorias urbanas para empresas de transporte locales. Diseñamos algoritmos de optimización de flotas para reducir costos operativos y certificar la reducción de huella de carbono.',
      impacto: 'Movilidad Urbana / Medio Ambiente',
      icono: '🚛',
      acento: 'purple',
      accion: 'Certificar Flota'
    },
    {
      titulo: 'Thoth Academy AI',
      subtitulo: 'Capacitación e Inclusión Digital',
      descripcion: 'Bootcamps intensivos de desarrollo de software e inteligencia artificial dirigidos a jóvenes de comunidades vulnerables de Sonora. Formamos talento calificado con enfoque en empleabilidad remota.',
      impacto: 'Educación / Talento Tecnológico',
      icono: '🎓',
      acento: 'cyan',
      accion: 'Becar Estudiante'
    },
    {
      titulo: 'Sonora ArtTech & Management',
      subtitulo: 'Fusiones de Arte, Ciencia y Tecnología',
      descripcion: 'Representación, management y mentoría para artistas y creadores locales. Impulsamos proyectos híbridos que combinan artes plásticas con inteligencia artificial generativa y galerías de realidad virtual.',
      impacto: 'Cultura / Economía Creativa',
      icono: '🎨',
      acento: 'gold',
      accion: 'Apoyar Creadores'
    }
  ];

  const scrollToDonations = () => {
    const el = document.getElementById('donaciones');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="propuestas" className="section propuestas-section">
      <div className="grid-bg"></div>
      <div className="container">
        <h2 className="section-title fade-in">
          Propuestas e <span>Iniciativas de Impacto</span>
        </h2>
        <p className="section-subtitle fade-in">
          Ejes de desarrollo y proyectos de ciencia, sustentabilidad y cultura financiados a través de nuestro programa de aportaciones.
        </p>

        <div className="propuestas-grid">
          {propuestas.map((p, i) => (
            <div 
              key={i} 
              className={`glass-card propuesta-card propuesta-card--${p.acento} fade-in`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="propuesta-icon-wrapper">
                <span className="propuesta-icon">{p.icono}</span>
              </div>
              <div className="propuesta-header">
                <h3>{p.titulo}</h3>
                <span className="propuesta-subtitle">{p.subtitulo}</span>
              </div>
              <p className="propuesta-desc">{p.descripcion}</p>
              <div className="propuesta-footer">
                <div className="propuesta-impacto">
                  <span className="impacto-label">Impacto:</span>
                  <span className="impacto-val">{p.impacto}</span>
                </div>
                <button 
                  className={`btn ${p.acento === 'gold' ? 'btn-gold' : 'btn-secondary'} propuesta-btn`}
                  onClick={scrollToDonations}
                >
                  {p.accion} →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
