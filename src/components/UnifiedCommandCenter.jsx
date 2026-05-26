import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Globe from 'react-globe.gl';
import * as THREE from 'three';
import { Activity, ShieldAlert, Zap, Globe as GlobeIcon, Map as MapIcon, Crosshair, Navigation, Wifi, Video, Layers, Search, Eye } from 'lucide-react';
import PainPointsMap from './PainPointsMap';
import municipiosCatalogo from '../data/municipios_catalogo.json';
import { themes } from '../themeManager';

// UXDD / IDD: Unified OSINT Command Center
// Comentarios y textos en español neutro premium.

export default function UnifiedCommandCenter({ agents, clients }) {
  const globeRef = useRef();
  const containerRef = useRef();
  
  // View Modes: '3D_ORBITAL', '2D_TACTICAL'
  const [viewMode, setViewMode] = useState('3D_ORBITAL');
  
  // Layer Toggles
  const [layers, setLayers] = useState({
    satellites: true,
    webcams: true,
    conflictRadar: true,
    seismic: true
  });

  // Global Pulse Data (Simulated for now, ready for IntelSky)
  const [pulseData, setPulseData] = useState({ conflicts: [], disasters: [], satellites: [], webcams: [] });
  const [isLive, setIsLive] = useState(true);

  // Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // Active Webcam popup in 3D Mode
  const [activeWebcam, setActiveWebcam] = useState(null);

  const pythonApiUrl = 'http://localhost:5001';

  // Fetch telemetry
  const fetchPulse = useCallback(async () => {
    try {
      const res = await fetch(`${pythonApiUrl}/api/osiris/global-pulse`);
      const data = await res.json();
      if (data.status === 'success') {
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
      console.warn("Fallo al conectar con Osiris Backend. Usando simulador offline.");
      setPulseData({
        conflicts: [
          { lat: 19.4326, lng: -99.1332, label: "CDMX: Tensión Social" },
          { lat: 25.6866, lng: -100.3161, label: "MTY: Congestión Vial" },
          { lat: 29.0729, lng: -110.9559, label: "HMO: Sequía Moderada" }
        ],
        disasters: [],
        satellites: Array(15).fill().map(() => ({ lat: (Math.random() - 0.5) * 120, lng: (Math.random() - 0.5) * 360, alt: 0.15 + Math.random() * 0.2 })),
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
    if (isLive && viewMode === '3D_ORBITAL') {
      interval = setInterval(fetchPulse, 3000);
    }
    return () => clearInterval(interval);
  }, [isLive, fetchPulse, viewMode]);

  // Initial 3D Rotation
  useEffect(() => {
    if (viewMode === '3D_ORBITAL' && globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      globeRef.current.pointOfView({ altitude: 2.5 });
    }
  }, [viewMode]);

  // Handle Location Search
  const filteredMunicipalities = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    return municipiosCatalogo
      .filter(m => m.name.toLowerCase().includes(term) || m.state.toLowerCase().includes(term))
      .slice(0, 8);
  }, [searchTerm]);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setSearchTerm(loc.name);
    setShowDropdown(false);

    if (viewMode === '3D_ORBITAL') {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = false;
        // Animación de vuelo cinemático a la ciudad seleccionada
        globeRef.current.pointOfView({ lat: loc.lat, lng: loc.lng, altitude: 0.3 }, 2500);
      }
    } else {
      // In 2D tactical mode, PainPointsMap handles its own center via props or context.
      // For now, if we switch modes, it's captured. 
      // Si se requiere vuelo dinámico en 2D, se envía la coordenada al PainPointsMap (requiere modificar props del hijo).
    }
  };

  const toggleLayer = (layerKey) => {
    setLayers(prev => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  // Globe Data Preparation
  const arcsData = layers.conflictRadar ? pulseData.conflicts.map(c => ({
    startLat: c.lat,
    startLng: c.lng,
    endLat: c.lat + (Math.random() - 0.5) * 5,
    endLng: c.lng + (Math.random() - 0.5) * 5,
    color: ['rgba(255, 0, 0, 0.8)', 'rgba(255, 87, 34, 0.2)'],
    label: c.label
  })) : [];

  const ringsData = layers.seismic ? pulseData.disasters.map(d => ({
    lat: d.lat,
    lng: d.lng,
    maxR: d.magnitude * 2,
    propagationSpeed: 1.5,
    repeatPeriod: 1000
  })) : [];

  const customLayerData = [];
  if (layers.satellites) {
    customLayerData.push(...(pulseData.satellites || []).map(s => ({
      lat: s.lat, lng: s.lng, alt: s.alt, size: 0.04, color: '#00e5ff', type: 'satellite'
    })));
  }
  if (layers.webcams) {
    customLayerData.push(...(pulseData.webcams || []).map(w => ({
      ...w, lat: w.lat, lng: w.lng, alt: 0.01, size: 0.06, color: '#ffff00', type: 'webcam'
    })));
  }

  return (
    <div className="glass-card scale-in" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
      
      {/* Top Navigation / Status Bar */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1rem', borderBottom: '1px solid var(--border-glass)',
        background: 'rgba(5, 8, 15, 0.9)', zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <ShieldAlert size={24} color="var(--neon-emerald)" />
          <div>
            <h2 style={{ fontSize: '1.2rem', color: 'white', margin: 0, letterSpacing: '1px' }}>OSIRIS-C COMMAND CENTER</h2>
            <div style={{ fontSize: '0.65rem', color: 'var(--neon-emerald)', textTransform: 'uppercase' }}>Sistema Nervioso Planetario Unificado</div>
          </div>
        </div>

        {/* Universal Search Bar */}
        <div style={{ position: 'relative', width: '350px' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--neon-blue)', borderRadius: '6px', padding: '0.4rem 0.8rem' }}>
            <Search size={16} color="var(--neon-blue)" style={{ marginRight: '0.5rem' }} />
            <input 
              type="text"
              placeholder="Buscar entre 2,478 municipios..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(e.target.value.length > 0);
              }}
              onFocus={() => { if(searchTerm.length > 0) setShowDropdown(true); }}
              style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%', fontSize: '0.8rem' }}
            />
          </div>

          {showDropdown && filteredMunicipalities.length > 0 && (
            <div className="glass-card" style={{ 
              position: 'absolute', top: '110%', left: 0, width: '100%', zIndex: 999,
              background: 'rgba(10, 15, 30, 0.95)', border: '1px solid var(--neon-blue)', maxHeight: '300px', overflowY: 'auto'
            }}>
              {filteredMunicipalities.map((loc) => (
                <div 
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  style={{ padding: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: '0.8rem', color: 'white', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontWeight: '700' }}>{loc.name}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{loc.state}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.3rem', borderRadius: '8px' }}>
          <button 
            onClick={() => setViewMode('3D_ORBITAL')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: viewMode === '3D_ORBITAL' ? 'var(--neon-blue)' : 'transparent',
              color: viewMode === '3D_ORBITAL' ? 'black' : 'var(--text-secondary)',
              fontWeight: '700', fontSize: '0.8rem', transition: 'all 0.3s'
            }}
          >
            <GlobeIcon size={16} /> Orbital 3D
          </button>
          <button 
            onClick={() => setViewMode('2D_TACTICAL')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              padding: '0.5rem 1rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
              background: viewMode === '2D_TACTICAL' ? 'var(--neon-emerald)' : 'transparent',
              color: viewMode === '2D_TACTICAL' ? 'black' : 'var(--text-secondary)',
              fontWeight: '700', fontSize: '0.8rem', transition: 'all 0.3s'
            }}
          >
            <MapIcon size={16} /> Táctico 2D
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex' }}>
        
        {/* Layer Controls Sidebar */}
        <div style={{ 
          width: '280px', background: 'rgba(10, 15, 30, 0.8)', borderRight: '1px solid var(--border-glass)',
          display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem', zIndex: 10, backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ fontSize: '0.85rem', color: 'white', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={16} color="var(--neon-purple)" /> Control de Capas
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            
            <div onClick={() => toggleLayer('satellites')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '6px', borderLeft: layers.satellites ? '3px solid #00e5ff' : '3px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Wifi size={16} color={layers.satellites ? "#00e5ff" : "var(--text-muted)"} />
                <span style={{ fontSize: '0.8rem', color: layers.satellites ? 'white' : 'var(--text-muted)' }}>Red LEO (Satélites)</span>
              </div>
              <div style={{ width: '32px', height: '16px', borderRadius: '10px', background: layers.satellites ? '#00e5ff' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2px', left: layers.satellites ? '18px' : '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'black', transition: 'all 0.2s' }} />
              </div>
            </div>

            <div onClick={() => toggleLayer('webcams')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '6px', borderLeft: layers.webcams ? '3px solid #ffff00' : '3px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Video size={16} color={layers.webcams ? "#ffff00" : "var(--text-muted)"} />
                <span style={{ fontSize: '0.8rem', color: layers.webcams ? 'white' : 'var(--text-muted)' }}>Red CCTV (Cámaras)</span>
              </div>
              <div style={{ width: '32px', height: '16px', borderRadius: '10px', background: layers.webcams ? '#ffff00' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2px', left: layers.webcams ? '18px' : '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'black', transition: 'all 0.2s' }} />
              </div>
            </div>

            <div onClick={() => toggleLayer('conflictRadar')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '6px', borderLeft: layers.conflictRadar ? '3px solid #ff1744' : '3px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Crosshair size={16} color={layers.conflictRadar ? "#ff1744" : "var(--text-muted)"} />
                <span style={{ fontSize: '0.8rem', color: layers.conflictRadar ? 'white' : 'var(--text-muted)' }}>Radar de Conflictos</span>
              </div>
              <div style={{ width: '32px', height: '16px', borderRadius: '10px', background: layers.conflictRadar ? '#ff1744' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2px', left: layers.conflictRadar ? '18px' : '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'black', transition: 'all 0.2s' }} />
              </div>
            </div>

            <div onClick={() => toggleLayer('seismic')} style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.4)', padding: '0.8rem', borderRadius: '6px', borderLeft: layers.seismic ? '3px solid #ff5722' : '3px solid transparent', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Activity size={16} color={layers.seismic ? "#ff5722" : "var(--text-muted)"} />
                <span style={{ fontSize: '0.8rem', color: layers.seismic ? 'white' : 'var(--text-muted)' }}>Anomalías Físicas</span>
              </div>
              <div style={{ width: '32px', height: '16px', borderRadius: '10px', background: layers.seismic ? '#ff5722' : 'rgba(255,255,255,0.1)', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '2px', left: layers.seismic ? '18px' : '2px', width: '12px', height: '12px', borderRadius: '50%', background: 'black', transition: 'all 0.2s' }} />
              </div>
            </div>

          </div>

          <div style={{ marginTop: 'auto', background: 'rgba(0, 229, 255, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
            <h4 style={{ fontSize: '0.75rem', color: 'var(--neon-blue)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={14} /> Telemetría Global
            </h4>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Satélites:</span> <strong style={{ color: 'white' }}>{pulseData.satellites.length}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total Webcams:</span> <strong style={{ color: 'white' }}>{pulseData.webcams.length}</strong></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Puntos Críticos:</span> <strong style={{ color: 'white' }}>{pulseData.conflicts.length}</strong></div>
            </div>
          </div>
        </div>

        {/* Map Viewport */}
        <div style={{ flex: 1, position: 'relative', background: '#02050A' }}>
          {viewMode === '3D_ORBITAL' ? (
            <Globe
              ref={globeRef}
              globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
              backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
              globeColor="rgba(10, 25, 50, 0.5)"
              showAtmosphere={true}
              atmosphereColor="var(--neon-emerald)"
              atmosphereAltitude={0.15}
              
              arcsData={arcsData}
              arcColor="color"
              arcDashLength={0.4}
              arcDashGap={0.2}
              arcDashAnimateTime={1500}
              
              ringsData={ringsData}
              ringColor={() => t => `rgba(255,100,50,${1-t})`}
              ringMaxRadius="maxR"
              ringPropagationSpeed="propagationSpeed"
              ringRepeatPeriod="1000"

              labelsData={layers.conflictRadar ? pulseData.conflicts.map(c => ({ lat: c.lat, lng: c.lng, text: c.label, size: 0.5, dotRadius: 0.2, color: '#ff1744' })) : []}
              labelLat="lat" labelLng="lng" labelText="text" labelSize="size" labelDotRadius="dotRadius" labelColor="color"
              labelResolution={2}

              customLayerData={customLayerData}
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
                    if (coords) Object.assign(obj.position, coords);
                  } catch (err) {}
                }
              }}
              onCustomLayerClick={(d) => {
                if (d.type === 'webcam') {
                  setActiveWebcam(d);
                }
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%' }}>
              <PainPointsMap agents={agents} externalCenter={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : null} />
            </div>
          )}

          {/* Crosshair Overlay in 3D */}
          {viewMode === '3D_ORBITAL' && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none', opacity: 0.2 }}>
              <Crosshair size={48} color="#00e5ff" strokeWidth={1} />
            </div>
          )}

          {/* Active Webcam Overlay in 3D Mode */}
          {viewMode === '3D_ORBITAL' && activeWebcam && (
            <div className="glass-card scale-in" style={{ 
              position: 'absolute', top: '16px', right: '16px', zIndex: 1000,
              width: '320px', background: 'rgba(5, 8, 15, 0.95)', border: '1px solid rgba(255, 255, 0, 0.4)',
              borderRadius: '8px', padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ color: '#ffff00', margin: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Video size={14} /> {activeWebcam.name}
                </h4>
                <button onClick={() => setActiveWebcam(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem', padding: '0 4px' }}>&times;</button>
              </div>
              
              {activeWebcam.stream_url ? (
                <div style={{ width: '100%', height: '180px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                  <iframe 
                    src={activeWebcam.stream_url} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div style={{ width: '100%', height: '180px', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  SIN SEÑAL
                </div>
              )}

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Espectadores: <span style={{ color: '#10b981', fontWeight: 'bold' }}>{activeWebcam.viewers}</span> | Estado: <span style={{ color: '#00e676' }}>● EN VIVO</span>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
