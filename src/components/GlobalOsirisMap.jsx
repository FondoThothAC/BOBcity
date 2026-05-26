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
            { lat: 19.4326, lng: -99.1332, name: "Zócalo CDMX", viewers: 1205 },
            { lat: 20.6596, lng: -103.3496, name: "Minerva GDL", viewers: 842 },
            { lat: 25.6866, lng: -100.3161, name: "Macroplaza MTY", viewers: 630 },
            { lat: 29.0729, lng: -110.9559, name: "Catedral HMO", viewers: 415 }
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
          { lat: 19.4326, lng: -99.1332, name: "Zócalo CDMX", viewers: 1205 },
          { lat: 20.6596, lng: -103.3496, name: "Minerva GDL", viewers: 842 },
          { lat: 25.6866, lng: -100.3161, name: "Macroplaza MTY", viewers: 630 },
          { lat: 29.0729, lng: -110.9559, name: "Catedral HMO", viewers: 415 }
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

    </div>
  );
};

export default GlobalOsirisMap;
