import { useState, useEffect } from 'react';
import { fetchPublicData } from '../services/api';
import './SocialFeed.css';

/**
 * SocialFeed — Componente que muestra las publicaciones de Instagram, Facebook y Anuncios.
 * Consume la API si está disponible, o hace fallback a los datos locales.
 */
export default function SocialFeed() {
  const [posts, setPosts] = useState([]);

  const fallbackPosts = [
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

  useEffect(() => {
    const loadPosts = async () => {
      const data = await fetchPublicData();
      if (data && data.posts && data.posts.length > 0) {
        // Mapear posts del backend al formato que espera la UI
        const mapped = data.posts
          .filter(p => p.type !== 'event') // Los eventos van en la timeline de eventos
          .map(p => {
            const isInstagram = p.type === 'instagram';
            const isFacebook = p.type === 'facebook';
            
            let red = 'instagram';
            let imagenBg = 'linear-gradient(135deg, #00f5e4 0%, #7b2cbf 100%)'; // Deeptech default gradient
            let emoji = '𓁹'; // Eye of Horus default

            if (isFacebook) {
              red = 'facebook';
              imagenBg = 'linear-gradient(135deg, #1877f2 0%, #0056b3 100%)';
              emoji = '📘';
            } else if (isInstagram) {
              red = 'instagram';
              imagenBg = 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)';
              emoji = '📷';
            } else if (p.type === 'news') {
              red = 'news';
              imagenBg = 'linear-gradient(135deg, #d4af37 0%, #7b2cbf 100%)';
              emoji = '📰';
            } else if (p.type === 'announcement') {
              red = 'announcement';
              imagenBg = 'linear-gradient(135deg, #00f5e4 0%, #04030d 100%)';
              emoji = '📢';
            }

            return {
              red,
              imagenBg,
              emoji: p.emoji || emoji,
              titulo: p.title,
              texto: p.content,
              likes: p.likes || 0,
              comentarios: p.comentarios || 0,
              fecha: p.date,
              enlace: p.link || '#'
            };
          });
        
        if (mapped.length > 0) {
          setPosts(mapped);
        } else {
          setPosts(fallbackPosts);
        }
      } else {
        setPosts(fallbackPosts);
      }
    };
    loadPosts();
  }, []);

  return (
    <section id="social" className="section social-feed-section">
      <div className="container">
        <h2 className="section-title fade-in">
          Actividad en <span>Redes Sociales & Novedades</span>
        </h2>
        <p className="section-subtitle fade-in">
          Sigue el pulso diario de nuestra comunidad. Publicaciones, anuncios y eventos de Fondo Thoth en tiempo real.
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
                  {post.red === 'instagram' ? '📷 Instagram' : 
                   post.red === 'facebook' ? '📘 Facebook' : 
                   post.red === 'news' ? '📰 Noticia' : '📢 Anuncio'}
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
                {post.enlace && post.enlace !== '#' && (
                  <a 
                    href={post.enlace} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-link"
                  >
                    Ver publicación →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
