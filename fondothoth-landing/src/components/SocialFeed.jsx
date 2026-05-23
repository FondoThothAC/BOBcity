import './SocialFeed.css';

/**
 * SocialFeed — Componente que muestra las publicaciones simuladas de Instagram y Facebook.
 * Esto representa la integración visual para el prototipo local.
 */
export default function SocialFeed() {
  const posts = [
    {
      red: 'instagram',
      imagenBg: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
      emoji: '🚀',
      titulo: 'Hackathon CivicTech 2026',
      texto: '¡Gran éxito en nuestro último Hackathon de Ciencia de Datos en Hermosillo! Estudiantes y profesionales creando soluciones reales de gobernanza. #CivicTech #DataScience #FondoThoth',
      likes: 142,
      comentarios: 18,
      fecha: 'Hace 2 días',
      enlace: 'https://instagram.com'
    },
    {
      red: 'facebook',
      imagenBg: 'linear-gradient(135deg, #1877f2 0%, #0056b3 100%)',
      emoji: '🗳️',
      titulo: 'Adopta una Sección',
      texto: 'Presentamos nuestro programa "Adopta una Sección Electoral". Apoya la recolección de datos y el análisis de calidad de vida en tu colonia de Hermosillo. Participa hoy mismo. #ParticipacionCiudadana #Sonora',
      likes: 89,
      comentarios: 12,
      fecha: 'Hace 4 días',
      enlace: 'https://facebook.com'
    },
    {
      red: 'instagram',
      imagenBg: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)',
      emoji: '⚙️',
      titulo: 'Laboratorio de Prototipos',
      texto: 'En pleno desarrollo de prototipos industriales impresos en 3D. Apoyamos a emprendedores locales a materializar sus ideas de hardware y electrónica. 🛠️💡 #Hardware #3DPrinting #Innovacion',
      likes: 215,
      comentarios: 24,
      fecha: 'Hace 1 semana',
      enlace: 'https://instagram.com'
    },
    {
      red: 'facebook',
      imagenBg: 'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)',
      emoji: '🛍️',
      titulo: 'CSTAS App Beta',
      texto: '¡Llegamos a la fase de pruebas de CSTAS App! El marketplace y neobanco social que dinamizará el comercio local en Sonora. Únete a la lista de espera en nuestra web. 📱✨ #Fintech #CSTAS #ComercioJusto',
      likes: 110,
      comentarios: 15,
      fecha: 'Hace 1 semana',
      enlace: 'https://facebook.com'
    }
  ];

  return (
    <section id="social" className="section social-feed-section">
      <div className="container">
        <h2 className="section-title fade-in">
          Actividad en <span>Redes Sociales</span>
        </h2>
        <p className="section-subtitle fade-in">
          Sigue el pulso diario de nuestra comunidad. Integramos nuestras publicaciones de Facebook e Instagram en tiempo real.
        </p>

        <div className="social-grid">
          {posts.map((post, index) => (
            <div 
              key={index} 
              className={`glass-card social-card social-card--${post.red} fade-in`}
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="social-card-header">
                <span className="social-badge">
                  {post.red === 'instagram' ? '📷 Instagram' : '📘 Facebook'}
                </span>
                <span className="social-date">{post.fecha}</span>
              </div>

              <div className="social-card-media" style={{ background: post.imagenBg }}>
                <span className="media-emoji">{post.emoji}</span>
                <span className="media-title">{post.titulo}</span>
              </div>

              <div className="social-card-body">
                <p className="social-text">{post.texto}</p>
              </div>

              <div className="social-card-footer">
                <div className="social-stats">
                  <span>❤️ {post.likes}</span>
                  <span>💬 {post.comentarios}</span>
                </div>
                <a 
                  href={post.enlace} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link"
                >
                  Ver publicación →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
