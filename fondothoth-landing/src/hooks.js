import { useState, useEffect } from 'react';

/**
 * Hook personalizado para detectar cuando un elemento entra al viewport.
 * Activa la clase 'visible' para animaciones de scroll.
 */
export function useScrollReveal() {
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Observar todos los elementos con clases de animación
    const elementos = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .scale-in');
    elementos.forEach((el) => observador.observe(el));

    return () => observador.disconnect();
  }, []);
}

/**
 * Hook para detectar scroll y activar el estilo de la navbar.
 */
export function useScrollDetect(umbral = 50) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const manejarScroll = () => setScrolled(window.scrollY > umbral);
    window.addEventListener('scroll', manejarScroll, { passive: true });
    return () => window.removeEventListener('scroll', manejarScroll);
  }, [umbral]);

  return scrolled;
}

/**
 * Hook para contador animado (conteo incremental).
 */
export function useContador(objetivo, duracion = 2000, iniciar = false) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (!iniciar) return;

    let inicio = null;
    const paso = (timestamp) => {
      if (!inicio) inicio = timestamp;
      const progreso = Math.min((timestamp - inicio) / duracion, 1);
      // Easing: deceleración cúbica
      const eased = 1 - Math.pow(1 - progreso, 3);
      setValor(Math.floor(eased * objetivo));
      if (progreso < 1) requestAnimationFrame(paso);
    };

    requestAnimationFrame(paso);
  }, [objetivo, duracion, iniciar]);

  return valor;
}
