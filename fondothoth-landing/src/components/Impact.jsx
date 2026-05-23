import { useState, useEffect, useRef } from 'react';
import { useContador } from '../hooks';
import './Impact.css';

/**
 * Impact — Contadores animados con métricas de impacto de Fondo Thoth.
 * Se activan al entrar al viewport.
 */
export default function Impact() {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );

    if (ref.current) observador.observe(ref.current);
    return () => observador.disconnect();
  }, []);

  const metricas = [
    { objetivo: 6, sufijo: '', label: 'Verticales de Servicio', icono: '◆' },
    { objetivo: 300, sufijo: '+', label: 'Secciones Electorales Mapeadas', icono: '📍' },
    { objetivo: 15, sufijo: '+', label: 'Proyectos en Desarrollo', icono: '🚀' },
    { objetivo: 50, sufijo: 'K+', label: 'Líneas de Código', icono: '💻' },
  ];

  return (
    <section id="impacto" className="section impact-section" ref={ref}>
      <div className="container">
        <h2 className="section-title fade-in">
          Nuestro <span>Impacto</span>
        </h2>
        <p className="section-subtitle fade-in">
          Números que reflejan nuestro compromiso con la innovación y la transformación social.
        </p>

        <div className="impact-grid">
          {metricas.map((m, i) => (
            <ContadorTarjeta key={i} metrica={m} iniciar={visible} delay={i * 0.15} />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Subcomponente: tarjeta individual de métrica con contador animado.
 */
function ContadorTarjeta({ metrica, iniciar, delay }) {
  const valor = useContador(metrica.objetivo, 2000, iniciar);

  return (
    <div className="glass-card impact-card fade-in" style={{ transitionDelay: `${delay}s` }}>
      <div className="impact-icon">{metrica.icono}</div>
      <div className="impact-number">
        {valor}{metrica.sufijo}
      </div>
      <div className="impact-label">{metrica.label}</div>
    </div>
  );
}
