import './About.css';

/**
 * About — Sección "Quiénes Somos" con misión, visión y valores.
 * Estilo: glassmorphism con iconografía egipcia estilizada.
 */
export default function About() {
  const pilares = [
    {
      icono: '𓁹',
      titulo: 'Visión',
      descripcion: 'Ser el referente nacional en innovación cívica, conectando tecnología de punta con impacto social medible para transformar comunidades.',
      acento: 'cyan',
    },
    {
      icono: '𓂋',
      titulo: 'Misión',
      descripcion: 'Impulsar la participación ciudadana, el emprendimiento y la creatividad mediante plataformas inteligentes, consultoría estratégica y formación de talento.',
      acento: 'purple',
    },
    {
      icono: '𓃭',
      titulo: 'Valores',
      descripcion: 'Transparencia radical, innovación sin límites, equidad social, respeto por la ciencia y el arte como motores del progreso humano.',
      acento: 'gold',
    },
  ];

  return (
    <section id="nosotros" className="section about-section">
      <div className="grid-bg"></div>
      <div className="container">
        <h2 className="section-title fade-in">
          Quiénes <span>Somos</span>
        </h2>
        <p className="section-subtitle fade-in">
          Fondo Thoth A.C. es una Asociación Civil multidisciplinaria con sede en Hermosillo, Sonora, 
          que fusiona inteligencia artificial, diseño y estrategia para generar impacto cívico real.
        </p>

        <div className="about-grid">
          {pilares.map((p, i) => (
            <div key={i} className={`glass-card about-card about-card--${p.acento} fade-in`} style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className={`about-icon about-icon--${p.acento}`}>
                {p.icono}
              </div>
              <h3>{p.titulo}</h3>
              <p>{p.descripcion}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
