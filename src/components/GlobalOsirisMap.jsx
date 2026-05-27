// src/components/GlobalOsirisMap.jsx
// UXDD / IDD: Vista Global OSINT (Estilo LeoLabs / Osiris AI)
// Comentarios y textos en español neutro premium.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { Activity, ShieldAlert, Zap, Globe as GlobeIcon, Crosshair, Map, Navigation, Wifi, Video } from 'lucide-react';

const GlobalOsirisMap = ({ pythonApiUrl = 'http://localhost:5001', height = '85vh' }) => {
  const globeRef = useRef();
  const containerRef = useRef();
  const [globeHeight, setGlobeHeight] = useState(400);
  const [pulseData, setPulseData] = useState({ conflicts: [], disasters: [], satellites: [], webcams: [] });
  const [isLive, setIsLive] = useState(true);
  const [activeWebcam, setActiveWebcam] = useState(null);
  
  // Efectos visuales de rotación al inicializar
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ altitude: 2.5 });
    }
  }, [globeHeight]);

  // Ajuste dinámico del tamaño del globo al contenedor
  useEffect(() => {
    if (containerRef.current) {
      const updateHeight = () => {
        setGlobeHeight(containerRef.current.clientHeight || 400);
      };
      updateHeight();
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [height]);

  // Polling del backend para telemetría
  const fetchPulse = useCallback(async () => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/osiris/global-pulse`);
      const data = await res.json();
      if (data.status === 'success') {
        // Simulamos algunas webcams si el backend no las envía aún
        if (!data.data.webcams) {
          data.data.webcams = [
            { lat: 19.4326, lng: -99.1332, name: "Zócalo CDMX", viewers: 1205, stream_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Traffic_in_Mexico_City.webm" },
            { lat: 20.6596, lng: -103.3496, name: "Minerva GDL", viewers: 842, stream_url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Guadalajara_Jalisco_M%C3%A9xico_2021.webm" },
            { lat: 25.6866, lng: -100.3161, name: "Macroplaza MTY", viewers: 630, stream_url: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Monterrey_Traffic_Timelapse.webm" },
            { lat: 29.0729, lng: -110.9559, name: "Catedral HMO", viewers: 415, stream_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Traffic_in_Mexico_City.webm" } // Fallback
          ];
        }
        setPulseData(data.data);
      }
    } catch (e) {
      console.warn("Fallo al conectar con el Motor Osiris Backend, usando datos simulados de respaldo", e);
      // Datos simulados premium de respaldo en español neutro premium
      setPulseData({
        conflicts: [
          { lat: 19.4326, lng: -99.1332, label: "CDMX: Centro Cívico" },
          { lat: 25.6866, lng: -100.3161, label: "MTY: Macroplaza" },
          { lat: 29.0729, lng: -110.9559, label: "HMO: Catedral" }
        ],
        disasters: [],
        satellites: [
          { lat: 19.43, lng: -99.13, alt: 0.2 },
          { lat: 20.66, lng: -103.35, alt: 0.15 },
          { lat: 25.69, lng: -100.32, alt: 0.3 },
          { lat: 29.07, lng: -110.96, alt: 0.25 },
          { lat: 21.16, lng: -86.85, alt: 0.18 },
          { lat: 17.06, lng: -96.72, alt: 0.22 },
          { lat: 32.62, lng: -115.45, alt: 0.28 },
          { lat: 22.15, lng: -100.98, alt: 0.19 },
          { lat: 24.14, lng: -110.31, alt: 0.35 },
          { lat: 18.85, lng: -97.10, alt: 0.16 },
          { lat: 14.50, lng: -90.50, alt: 0.21 },
          { lat: 8.50, lng: -80.50, alt: 0.24 }
        ],
        webcams: [
          { lat: 19.4326, lng: -99.1332, name: "Zócalo CDMX", viewers: 1205, stream_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Traffic_in_Mexico_City.webm" },
          { lat: 20.6596, lng: -103.3496, name: "Minerva GDL", viewers: 842, stream_url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Guadalajara_Jalisco_M%C3%A9xico_2021.webm" },
          { lat: 25.6866, lng: -100.3161, name: "Macroplaza MTY", viewers: 630, stream_url: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Monterrey_Traffic_Timelapse.webm" },
          { lat: 29.0729, lng: -110.9559, name: "Catedral HMO", viewers: 415, stream_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Traffic_in_Mexico_City.webm" }
        ]
      });
    }
  }, [pythonApiUrl]);

  useEffect(() => {
    fetchPulse();
    let interval;
    if (isLive) {
      interval = setInterval(fetchPulse, 3000); // Polling cada 3 segundos
    }
    return () => clearInterval(interval);
  }, [isLive, fetchPulse]);

  // Transformar datos para Globe.gl
  const arcsData = pulseData.conflicts.map((c, i) => ({
    startLat: c.lat,
    startLng: c.lng,
    endLat: c.lat + (Math.random() - 0.5) * 10, // Simular red táctica
    endLng: c.lng + (Math.random() - 0.5) * 10,
    color: ['rgba(255, 0, 0, 0.8)', 'rgba(255, 87, 34, 0.2)'],
    label: c.label
  }));

  const ringsData = pulseData.disasters.map(d => ({
    lat: d.lat,
    lng: d.lng,
    maxR: d.magnitude * 2,
    propagationSpeed: 1.5,
    repeatPeriod: 1000
  }));

  const labelsData = pulseData.conflicts.map(c => ({
    lat: c.lat,
    lng: c.lng,
    text: c.label,
    size: 0.5,
    dotRadius: 0.2,
    color: '#ff1744'
  }));

  // Satélites orbitales
  const customLayerData = (pulseData.satellites || []).map(s => ({
    lat: s.lat,
    lng: s.lng,
    alt: s.alt,
    size: 0.04,
    color: '#00e5ff',
    type: 'satellite'
  }));

  // Webcams (Agregadas a custom layer también)
  const webcamsData = (pulseData.webcams || []).map(w => ({
    ...w,
    lat: w.lat,
    lng: w.lng,
    alt: 0.01,
    size: 0.06,
    color: '#ffff00',
    type: 'webcam'
  }));
  
  const combinedCustomLayer = [...customLayerData, ...webcamsData];

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: height, borderRadius: '12px', overflow: 'hidden', background: '#050810' }}>
      
      {/* Contenedor principal del Globo 3D */}
      <Globe
        ref={globeRef}
        height={globeHeight}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Estilo de respaldo futurista (para casos sin internet o CDN lento)
        globeColor="rgba(10, 25, 50, 0.5)"
        showAtmosphere={true}
        atmosphereColor="var(--neon-emerald)"
        atmosphereAltitude={0.15}
        
        // Arcos (Conflictos/Tensiones)
        arcsData={arcsData}
        arcColor="color"
        arcDashLength={0.4}
        arcDashGap={0.2}
        arcDashAnimateTime={1500}
        
        // Anillos (Sismos/Desastres)
        ringsData={ringsData}
        ringColor={() => t => `rgba(255,100,50,${1-t})`}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"

        // Etiquetas (Nombres de Zonas Calientes)
        labelsData={labelsData}
        labelLat="lat"
        labelLng="lng"
        labelText="text"
        labelSize="size"
        labelDotRadius="dotRadius"
        labelColor="color"
        labelResolution={2}

        // Satélites LEO y Webcams (Custom Layer)
        customLayerData={combinedCustomLayer}
        customThreeObject={d => {
          if (d.type === 'webcam') {
            return new THREE.Mesh(
              new THREE.BoxGeometry(d.size, d.size, d.size),
              new THREE.MeshBasicMaterial({ color: d.color, wireframe: true })
            );
          }
          return new THREE.Mesh(
            new THREE.SphereGeometry(d.size),
            new THREE.MeshBasicMaterial({ color: d.color })
          );
        }}
        customThreeObjectUpdate={(obj, d) => {
          if (globeRef.current) {
            try {
              const coords = globeRef.current.getCoords(d.lat, d.lng, d.alt);
              if (coords) {
                Object.assign(obj.position, coords);
              }
            } catch (err) {
              console.warn("Fallo al obtener coordenadas 3D para objeto orbital", err);
            }
          }
        }}
        onCustomLayerClick={(d) => {
          if (d.type === 'webcam') {
            setActiveWebcam(d);
          }
        }}
      />

      {/* Glassmorphism UI - Overlay Izquierdo */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px',
        background: 'rgba(10, 15, 30, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 229, 255, 0.2)',
        borderRadius: '12px',
        padding: '20px',
        width: '320px',
        color: '#e2e8f0',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(0, 229, 255, 0.2)', paddingBottom: '12px', marginBottom: '12px' }}>
          <GlobeIcon color="#00e5ff" size={24} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#00e5ff', textTransform: 'uppercase', letterSpacing: '1px' }}>OSIRIS Global</h2>
            <div style={{ fontSize: '0.65rem', color: '#8892a4', textTransform: 'uppercase' }}>Inteligencia Planetaria LEO</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLive ? '#00e676' : '#ff5252', boxShadow: `0 0 8px ${isLive ? '#00e676' : '#ff5252'}` }} />
            {isLive ? 'STREAMING ACTIVO' : 'SISTEMA PAUSADO'}
          </div>
          <button 
            onClick={() => setIsLive(!isLive)}
            style={{
              background: 'transparent', border: '1px solid #00e5ff', color: '#00e5ff', borderRadius: '4px',
              padding: '4px 8px', fontSize: '0.65rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {isLive ? 'PAUSAR' : 'REANUDAR'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ff1744' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8892a4', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={12} color="#ff1744"/> Zonas de Conflicto</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{pulseData.conflicts.length}</span>
            </div>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ff5722' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8892a4', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Activity size={12} color="#ff5722"/> Anomalías Sísmicas</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{pulseData.disasters.length}</span>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #00e5ff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8892a4', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wifi size={12} color="#00e5ff"/> Satélites LEO Activos</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{pulseData.satellites.length}</span>
            </div>
          </div>
          
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ffff00' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#8892a4', marginBottom: '4px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Video size={12} color="#ffff00"/> Red Webcams (CCTV)</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{pulseData.webcams ? pulseData.webcams.length : 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Crosshair UI Centro */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', opacity: 0.3 }}>
        <Crosshair size={48} color="#00e5ff" strokeWidth={1} />
      </div>

      {/* Visor de Webcam Activa en OSIRIS 3D */}
      {activeWebcam && (
        <div className="glass-card scale-in" style={{ 
          position: 'absolute', top: '20px', right: '20px', zIndex: 1000,
          width: '320px', background: 'rgba(5, 8, 15, 0.95)', border: '1px solid rgba(255, 255, 0, 0.4)',
          borderRadius: '12px', padding: '15px', color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,0,0.2)', paddingBottom: '6px' }}>
            <h4 style={{ color: '#ffff00', margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Video size={14} /> {activeWebcam.name}
            </h4>
            <button onClick={() => setActiveWebcam(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px', outline: 'none' }}>&times;</button>
          </div>
          
          {activeWebcam.stream_url ? (
            <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '6px', overflow: 'hidden', marginBottom: '8px', background: '#000' }}>
              {activeWebcam.stream_url.includes('youtube') ? (
                <iframe 
                  src={activeWebcam.stream_url} 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  style={{ filter: 'grayscale(80%) sepia(40%) hue-rotate(80deg) contrast(120%)' }}
                ></iframe>
              ) : (
                <>
                  <video 
                    src={activeWebcam.stream_url} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%) sepia(100%) hue-rotate(80deg) brightness(1.2) contrast(150%)' }}
                  />
                  {/* Overlay estilo OSINT CCTV */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'repeating-linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1) 1px, transparent 1px, transparent 3px)', pointerEvents: 'none' }}></div>
                  <div style={{ position: 'absolute', top: '5px', left: '5px', color: '#00e676', fontSize: '0.6rem', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    REC • {new Date().toISOString().split('T')[1].substring(0, 8)}
                  </div>
                  <div style={{ position: 'absolute', bottom: '5px', right: '5px', color: '#00e676', fontSize: '0.6rem', fontFamily: 'monospace' }}>
                    CAM_ID: {Math.floor(Math.random() * 9000) + 1000}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ width: '100%', height: '180px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8892a4', marginBottom: '8px', fontSize: '0.8rem' }}>
              CONECTANDO CON EL FEED OSINT...
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#8892a4' }}>
            <span>Espectadores: <strong style={{ color: '#00e676' }}>{activeWebcam.viewers}</strong></span>
            <span style={{ color: '#00e676', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00e676', display: 'inline-block', boxShadow: '0 0 6px #00e676' }}></span>
              TRANSMISIÓN EN VIVO
            </span>
          </div>
        </div>
      )}

    </div>
  );
};

export default GlobalOsirisMap;
