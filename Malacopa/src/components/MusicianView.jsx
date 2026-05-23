/* ============================================================================
   Malacopa - Vista del Colaborador / Músico en el Escenario (React)
   ============================================================================
   Muestra la agenda del músico, la playlist ordenada con tonalidades en vivo
   y el mapa interactivo (Leaflet) para llegar a la locación del show.
   ============================================================================ */

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Calendar, MapPin, Music, Play, CheckCircle2, Info } from 'lucide-react';

// Corrección de íconos por defecto de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Recintos simulados con coordenadas reales de Hermosillo
const SHOWS_ASIGNADOS = [
  {
    id: 'show_1',
    titulo: 'Concierto del Sol',
    artista: 'Fractos Show',
    fecha: '2026-06-15',
    hora: '21:00',
    venue: 'Foro del Sol, Hermosillo',
    lat: 29.0762, 
    lng: -110.9612, // Coordenadas aprox Foro del Sol Hermosillo
    notasLogistica: 'Llegada de músicos para soundcheck a las 17:00 hs. Traer cables de repuesto.'
  },
  {
    id: 'show_2',
    titulo: 'Show Privado: Boda Sofía y Carlos',
    artista: 'Fractos Show',
    fecha: '2026-06-25',
    hora: '19:30',
    venue: 'Quinta La Ruina, Hermosillo',
    lat: 29.0881, 
    lng: -110.9501, // Coordenadas aprox La Ruina Hermosillo
    notasLogistica: 'Acceso por calle trasera para descarga. Vestimenta formal oscura.'
  }
];

export default function MusicianView() {
  const [shows, setShows] = useState(SHOWS_ASIGNADOS);
  const [selectedShow, setSelectedShow] = useState(SHOWS_ASIGNADOS[0]);
  const [setlist, setSetlist] = useState([]);
  const [cancionesTocadas, setCancionesTocadas] = useState({});

  // Cargar setlist desde localStorage
  useEffect(() => {
    try {
      const storedSetlist = localStorage.getItem('malacopa_setlist');
      if (storedSetlist) {
        setSetlist(JSON.parse(storedSetlist));
      }
    } catch (e) {
      console.error(e);
    }

    // Inyectar el CSS de Leaflet si no está ya cargado en el documento
    const linkId = 'leaflet-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
  }, []);

  const toggleTocada = (songId) => {
    setCancionesTocadas((prev) => ({
      ...prev,
      [songId]: !prev[songId]
    }));
  };

  return (
    <div className="grid-dashboard">
      {/* Panel Izquierdo: Shows y Logística */}
      <div className="panel-lateral">
        <div className="tarjeta-premium">
          <h3>Mis Presentaciones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
            {shows.map((s) => (
              <div 
                key={s.id} 
                onClick={() => setSelectedShow(s)}
                className="efecto-glass"
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  border: selectedShow.id === s.id ? '1px solid var(--color-neon-cian)' : '1px solid var(--color-borde-glass)',
                  background: selectedShow.id === s.id ? 'rgba(0, 243, 255, 0.05)' : 'none',
                  transition: 'var(--transicion-suave)'
                }}
              >
                <h4 style={{ fontSize: '15px' }}>{s.titulo}</h4>
                <div style={{ fontSize: '12px', color: 'var(--color-texto-secundario)', marginTop: '4px' }}>
                  🗓️ {s.fecha} - {s.hora} hs
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-texto-apagado)', marginTop: '2px' }}>
                  📍 {s.venue}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle y Logística */}
        {selectedShow && (
          <div className="tarjeta-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3>Logística del Show</h3>
            <div style={{ fontSize: '13.5px', color: 'var(--color-texto-secundario)', lineHeight: '1.4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--color-neon-magenta)' }}>
                <Info size={16} />
                <strong>Instrucciones:</strong>
              </div>
              <p>{selectedShow.notesLogistica}</p>
            </div>
            
            {/* Mapa Interactivo Leaflet */}
            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--color-texto-apagado)', display: 'block', marginBottom: '6px' }}>
                Cómo Llegar (Recinto del Show):
              </span>
              <div className="contenedor-mapa">
                <MapContainer 
                  center={[selectedShow.lat, selectedShow.lng]} 
                  zoom={14} 
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={[selectedShow.lat, selectedShow.lng]}>
                    <Popup>
                      <strong>{selectedShow.titulo}</strong><br />
                      {selectedShow.venue}
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Derecho: Playlist interactivo en Escenario */}
      <div className="panel-contenido">
        <div className="tarjeta-premium">
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center' }}>
            <div>
              <span className="badge-neon badge-cian">Modo Escenario Activo</span>
              <h3 style={{ marginTop: '6px' }}>Playlist / Setlist en Vivo</h3>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-texto-secundario)' }}>
              Progreso: {Object.values(cancionesTocadas).filter(Boolean).length} / {setlist.length}
            </div>
          </div>

          {setlist.length === 0 ? (
            <p style={{ color: 'var(--color-texto-secundario)', marginTop: '20px' }}>
              No hay canciones en el setlist actual. Configúralas en el Dashboard de Artista.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
              {setlist.map((song) => {
                const tocada = !!cancionesTocadas[song.id];
                return (
                  <div 
                    key={song.id} 
                    onClick={() => toggleTocada(song.id)}
                    className="setlist-item"
                    style={{
                      cursor: 'pointer',
                      borderLeft: tocada ? '4px solid var(--color-neon-magenta)' : '4px solid var(--color-neon-cian)',
                      opacity: tocada ? 0.6 : 1,
                      textDecoration: tocada ? 'line-through' : 'none',
                      transition: 'var(--transicion-suave)',
                      background: tocada ? 'rgba(255, 0, 127, 0.02)' : 'rgba(255, 255, 255, 0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: tocada ? 'var(--color-neon-magenta)' : 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {tocada ? <CheckCircle2 size={14} color="#fff" /> : <Play size={12} color="var(--color-neon-cian)" />}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px' }}>{song.orden}. {song.titulo}</h4>
                        <span className="badge-neon badge-morado" style={{ fontSize: '9px', padding: '1px 5px', marginTop: '2px' }}>
                          {song.tono}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--color-texto-secundario)', marginLeft: '8px' }}>
                          {song.notas}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
