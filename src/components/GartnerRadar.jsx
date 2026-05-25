// src/components/GartnerRadar.jsx
// UXDD / CDD: Radar Polar interactivo estilo Gartner Hype Cycle para trazar eventos OSINT

import React, { useEffect, useRef, useState } from 'react';

const GartnerRadar = ({ events = [] }) => {
  const canvasRef = useRef(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Colores para categorías (Impacto temático)
  const categoryColors = {
    "Economía": "#ef4444",      // Rojo
    "Tecnología": "#3b82f6",    // Azul
    "Sociopolítica": "#f59e0b", // Naranja
    "Global": "#8b5cf6"         // Morado
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const width = canvas.width = canvas.parentElement.clientWidth;
    const height = canvas.height = 320; // Fixed height para encajar en el panel lateral
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) - 20;

    // Dibujar el fondo del Radar (Anillos concéntricos de tiempo)
    ctx.clearRect(0, 0, width, height);
    
    // Configuración de los anillos (0-1 año, 1-3 años, 3-6 años)
    const rings = [
      { radius: maxRadius * 0.3, color: '#facc15', label: 'Ahora (0-1 año)', bg: '#facc1520' },
      { radius: maxRadius * 0.6, color: '#94a3b8', label: '1-3 años', bg: '#94a3b810' },
      { radius: maxRadius * 0.9, color: '#475569', label: '3-6 años', bg: '#47556910' }
    ];

    // Dibujar de afuera hacia adentro para rellenar
    [...rings].reverse().forEach(ring => {
      ctx.beginPath();
      ctx.arc(cx, cy, ring.radius, 0, 2 * Math.PI);
      ctx.fillStyle = ring.bg;
      ctx.fill();
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Etiquetas de tiempo (cuadrante superior derecho)
      ctx.fillStyle = ring.color;
      ctx.font = '10px sans-serif';
      ctx.fillText(ring.label, cx + 5, cy - ring.radius + 15);
    });

    // Dividir en 3 o 4 secciones (Categorías)
    const catKeys = Object.keys(categoryColors);
    catKeys.forEach((cat, idx) => {
      const angle = (idx * 2 * Math.PI) / catKeys.length;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + maxRadius * Math.cos(angle), cy + maxRadius * Math.sin(angle));
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Título de la sección en el borde
      const labelAngle = angle + (Math.PI / catKeys.length);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 11px sans-serif';
      const lx = cx + (maxRadius + 10) * Math.cos(labelAngle) - 20;
      const ly = cy + (maxRadius + 10) * Math.sin(labelAngle);
      ctx.fillText(cat, lx, ly);
    });

    // Dibujar los eventos
    events.forEach(evt => {
      // evt.radar_distance: 1.0 (centro) a 0.1 (borde)
      // evt.radar_angle: grados 0-360
      const r = (1.1 - evt.radar_distance) * maxRadius * 0.9; 
      const theta = (evt.radar_angle * Math.PI) / 180;
      
      const px = cx + r * Math.cos(theta);
      const py = cy + r * Math.sin(theta);
      
      // Guardamos la posición en el objeto para el click handler
      evt.px = px;
      evt.py = py;

      const baseColor = categoryColors[evt.category] || "#cbd5e1";
      
      // Tamaño basado en la gravedad/impacto absoluto
      const absImpact = Math.abs(evt.impact_score || 2);
      const pointSize = Math.max(4, Math.min(10, absImpact + 2));

      // Resplandor
      ctx.beginPath();
      ctx.arc(px, py, pointSize + 3, 0, 2 * Math.PI);
      ctx.fillStyle = baseColor + '40';
      ctx.fill();

      // Punto central
      ctx.beginPath();
      ctx.arc(px, py, pointSize, 0, 2 * Math.PI);
      ctx.fillStyle = baseColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Seleccionado
      if (selectedEvent && selectedEvent.id === evt.id) {
        ctx.beginPath();
        ctx.arc(px, py, pointSize + 6, 0, 2 * Math.PI);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });

  }, [events, selectedEvent]);

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clicked = null;
    let minDist = 15;

    events.forEach(evt => {
      if (evt.px && evt.py) {
        const dist = Math.hypot(evt.px - x, evt.py - y);
        if (dist < minDist) {
          minDist = dist;
          clicked = evt;
        }
      }
    });
    
    setSelectedEvent(clicked);
  };

  return (
    <div className="flex flex-col bg-[#090d16] border border-[#1e293b]/60 rounded-2xl shadow-xl overflow-hidden mt-6">
      <div className="p-3 border-b border-[#1e293b] bg-[#0f172a]">
        <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center justify-between">
          📡 Radar OSINT (Macro-Eventos)
          <span className="text-xs bg-[#10b981]/20 text-[#10b981] px-2 py-0.5 rounded-full">
            Live Feed
          </span>
        </h3>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          onClick={handleCanvasClick}
          className="w-full cursor-crosshair bg-[#050811]"
        />
        
        {/* Panel de detalles flotante interno o debajo */}
        {selectedEvent && (
          <div className="absolute top-2 right-2 w-48 bg-[#0f172a]/95 border border-[#1e293b] rounded-lg p-3 shadow-2xl backdrop-blur-md">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase`} style={{ backgroundColor: categoryColors[selectedEvent.category] + '30', color: categoryColors[selectedEvent.category] }}>
                {selectedEvent.category}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
            </div>
            <p className="text-xs font-semibold text-white leading-tight mb-2">
              {selectedEvent.title}
            </p>
            <div className="text-[10px] text-slate-400 flex flex-col gap-1">
              <div className="flex justify-between">
                <span>Fuente:</span> <span className="text-slate-200">{selectedEvent.source}</span>
              </div>
              <div className="flex justify-between">
                <span>Impacto:</span> 
                <span className={selectedEvent.impact_score < 0 ? 'text-[#ef4444]' : 'text-[#10b981]'}>
                  {selectedEvent.impact_score > 0 ? '+' : ''}{selectedEvent.impact_score.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>ETA Estimado:</span> <span className="text-slate-200">{selectedEvent.eta_months} meses</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GartnerRadar;
