import { useState, useEffect } from 'react';
import { fetchPublicData } from '../services/api';
import './Events.css';

/**
 * Events — Timeline vertical de próximos eventos y hackathones.
 * Consume la API si está disponible, o hace fallback a los datos locales.
 */
export default function Events() {
  const [eventos, setEventos] = useState([]);

  const fallbackEvents = [
    {
      fecha: 'Junio 2026',
      titulo: 'Hackathon Cívico Hermosillo',
      descripcion: 'Competencia de 48 horas enfocada en soluciones tecnológicas para la gestión hídrica del Río Sonora y zonas áridas del noroeste.',
      tipo: 'Hackathon',
      acento: 'cyan',
    },
    {
      fecha: 'Julio 2026',
      titulo: 'Lanzamiento CSTAS App Beta',
      descripcion: 'Apertura de la versión beta del marketplace + neobank para la comunidad de Hermosillo. Invitación a early adopters y comercios locales.',
      tipo: 'Lanzamiento',
      acento: 'purple',
    },
    {
      fecha: 'Agosto 2026',
      titulo: 'Foro de Innovación Electoral',
      descripcion: 'Presentación de CivicaOS ante consultoras políticas, académicos y medios. Demos en vivo del gemelo digital social con datos reales.',
      tipo: 'Foro',
      acento: 'gold',
    },
    {
      fecha: 'Octubre 2026',
      titulo: 'Noche de Arte & Tecnología',
      descripcion: 'Evento cultural que fusiona instalaciones artísticas interactivas con demos de IA generativa, música en vivo y networking.',
      tipo: 'Evento Cultural',
      acento: 'cyan',
    },
  ];

  useEffect(() => {
    const loadEvents = async () => {
      const data = await fetchPublicData();
      if (data && data.posts && data.posts.length > 0) {
        // Filtrar posts de tipo 'event'
        const eventPosts = data.posts.filter(p => p.type === 'event');
        
        if (eventPosts.length > 0) {
          const mapped = eventPosts.map((p, i) => {
            const acentos = ['cyan', 'purple', 'gold'];
            return {
              fecha: p.date,
              titulo: p.title,
              descripcion: p.content,
              tipo: p.eventType || 'Evento',
              acento: p.acento || acentos[i % acentos.length],
            };
          });
          setEventos(mapped);
        } else {
          setEventos(fallbackEvents);
        }
      } else {
        setEventos(fallbackEvents);
      }
    };
    loadEvents();
  }, []);

  return (
    <section className="section events-section">
      <div className="container">
        <h2 className="section-title fade-in">
          Próximos <span>Eventos</span>
        </h2>
        <p className="section-subtitle fade-in">
          Hackathones, foros y experiencias donde la tecnología se encuentra con la comunidad.
        </p>

        <div className="events-timeline">
          {eventos.map((e, i) => (
            <div
              key={i}
              className={`events-item events-item--${e.acento} fade-in-left`}
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <div className="events-dot"></div>
              <div className="glass-card events-card">
                <div className="events-header">
                  <span className={`badge badge-${e.acento}`}>{e.tipo}</span>
                  <span className="events-fecha">{e.fecha}</span>
                </div>
                <h3>{e.titulo}</h3>
                <p>{e.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
