import './Services.css';

/**
 * Services — 6 tarjetas interactivas representando las verticales de Fondo Thoth.
 * Cada tarjeta tiene hover con borde animado y enlace descriptivo.
 */
export default function Services() {
  const servicios = [
    {
      icono: '🧠',
      titulo: 'Consultoría Cívica & Electoral',
      descripcion: 'Gemelos digitales sociales, encuestas de opinión, branding político y consultoría estratégica con IA para campañas y gobernanza.',
      tags: ['CivicaOS', 'ABM', 'Softmax'],
      acento: 'cyan',
    },
    {
      icono: '💼',
      titulo: 'Negocios & Fintech',
      descripcion: 'Planes de negocio profesionales con modelos financieros IA, marketplace CSTAS con funcionalidad de neobank y consultoría empresarial.',
      tags: ['Open Business Plan', 'CSTAS App'],
      acento: 'purple',
    },
    {
      icono: '⚙️',
      titulo: 'Desarrollo Tecnológico',
      descripcion: 'Software a medida, prototipado industrial, infraestructura de IA con clústeres DGX Spark y GPU H100 para procesamiento masivo.',
      tags: ['Full-Stack', 'IA', 'H100'],
      acento: 'cyan',
    },
    {
      icono: '🎨',
      titulo: 'Arte, Cultura & Deportes',
      descripcion: 'Management de artistas, organización de eventos culturales y deportivos, branding creativo y producción audiovisual.',
      tags: ['Branding', 'Eventos', 'Management'],
      acento: 'gold',
    },
    {
      icono: '🎓',
      titulo: 'Talento & Educación',
      descripcion: 'Hackathones para descubrir talento, programas de becas y mentorías, laboratorio de innovación abierta para jóvenes emprendedores.',
      tags: ['Hackathones', 'Becas', 'Innovación'],
      acento: 'purple',
    },
    {
      icono: '❤️',
      titulo: 'Impacto Social & Donaciones',
      descripcion: 'Crowdfunding cívico transparente, membresías escalonadas, patrocinios corporativos y programa "Adopta una Sección Electoral".',
      tags: ['Donaciones', 'Transparencia', 'Cívico'],
      acento: 'gold',
    },
  ];

  return (
    <section id="servicios" className="section services-section">
      <div className="container">
        <h2 className="section-title fade-in">
          Nuestros <span>Servicios</span>
        </h2>
        <p className="section-subtitle fade-in">
          Seis verticales de alto impacto que convergen en un ecosistema integrado de innovación,
          tecnología y transformación social.
        </p>

        <div className="services-grid">
          {servicios.map((s, i) => (
            <div
              key={i}
              className={`glass-card service-card service-card--${s.acento} fade-in`}
              style={{ transitionDelay: `${i * 0.1}s` }}
            >
              <div className="service-icon">{s.icono}</div>
              <h3>{s.titulo}</h3>
              <p>{s.descripcion}</p>
              <div className="service-tags">
                {s.tags.map((tag, j) => (
                  <span key={j} className={`badge badge-${s.acento}`}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
