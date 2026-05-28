// src/components/ApiDataHubMonitor.jsx
// Panel de control de Mangueras de Datos (Firehoses) y APIs OSINT

import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, RefreshCw, Server, AlertCircle, Camera, Plane, Activity, Satellite, ShieldAlert } from 'lucide-react';
import mexicoWebcams from '../data/mexico_webcams.json';

const apiSources = [
  { id: 'cctv-mex', name: 'CCTV SCT (México)', type: 'Video stream', icon: <Camera size={16}/>, expectedDelay: 'Real-time', source: 'Gobierno MX', status: 'online', lat_lng: true },
  { id: 'cctv-webcams', name: 'Webcams de México (Scraped)', type: 'Imágenes', icon: <Camera size={16}/>, expectedDelay: '1 min', source: 'Webcams.travel', status: 'online', lat_lng: true },
  { id: 'opensky', name: 'OpenSky Network', type: 'Vuelos LEO', icon: <Plane size={16}/>, expectedDelay: '10s', source: 'OpenSky', status: 'online', lat_lng: true },
  { id: 'usgs', name: 'USGS Sismos', type: 'Geológico', icon: <Activity size={16}/>, expectedDelay: '5 min', source: 'USGS', status: 'online', lat_lng: true },
  { id: 'nasa-firms', name: 'NASA FIRMS', type: 'Incendios', icon: <AlertCircle size={16}/>, expectedDelay: '1 hr', source: 'NASA', status: 'degraded', lat_lng: true },
  { id: 'n2yo', name: 'N2YO Satélites', type: 'Orbital', icon: <Satellite size={16}/>, expectedDelay: 'Real-time', source: 'N2YO', status: 'offline', lat_lng: true },
  { id: 'conflict', name: 'ACLED Conflictos', type: 'Geopolítico', icon: <ShieldAlert size={16}/>, expectedDelay: 'Diario', source: 'ACLED', status: 'online', lat_lng: true }
];

const ApiDataHubMonitor = () => {
  const [apis, setApis] = useState(apiSources);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simular chequeo de pings a las APIs
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setApis(apis.map(api => {
        if (api.id === 'n2yo') return { ...api, status: Math.random() > 0.5 ? 'online' : 'offline' };
        if (api.id === 'nasa-firms') return { ...api, status: Math.random() > 0.7 ? 'degraded' : 'online' };
        return api;
      }));
      setIsRefreshing(false);
    }, 1500);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'online': return '#00e676';
      case 'degraded': return '#ffea00';
      case 'offline': return '#ff1744';
      default: return '#8892a4';
    }
  };

  const activeCount = apis.filter(a => a.status === 'online').length;
  const totalCount = apis.length;
  const healthPercent = Math.round((activeCount / totalCount) * 100);

  // Seleccionar 4 cámaras reales e interesantes de los datos scrapeados de Webcams de México
  const displayCams = React.useMemo(() => {
    if (!mexicoWebcams || mexicoWebcams.length === 0) return [];
    
    // Obtener cámaras variadas
    const targets = ["popocatepetl", "reforma", "acapulco", "zocalo"];
    const selected = [];
    
    targets.forEach(target => {
      const found = mexicoWebcams.find(c => c.name.toLowerCase().includes(target) || c.city.toLowerCase().includes(target));
      if (found && !selected.find(s => s.id === found.id)) {
        selected.push(found);
      }
    });

    // Rellenar con las primeras si no encontramos suficientes
    while (selected.length < 4 && selected.length < mexicoWebcams.length) {
      const next = mexicoWebcams.find(c => !selected.find(s => s.id === c.id));
      if (next) selected.push(next);
      else break;
    }
    return selected;
  }, []);

  return (
    <div className="glass-card" style={{ padding: '1.5rem', color: '#e2e8f0', borderRadius: '12px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Database size={24} color="var(--neon-cyan)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--neon-cyan)', textTransform: 'uppercase' }}>DataHub API Monitor</h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mangueras de datos OSINT y Telemetría Global</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.3)', padding: '0.4rem 0.8rem', borderRadius: '6px' }}>
            <Server size={14} color={healthPercent === 100 ? '#00e676' : '#ffea00'} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>System Health: {healthPercent}%</span>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{ 
              background: 'transparent', border: '1px solid var(--neon-blue)', color: 'var(--neon-blue)', 
              borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
              opacity: isRefreshing ? 0.5 : 1
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
            PING ALL
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {apis.map(api => (
          <div key={api.id} style={{ 
            background: 'rgba(8,15,30,0.6)', border: `1px solid ${getStatusColor(api.status)}33`, 
            borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontWeight: 600 }}>
                {api.icon}
                {api.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: getStatusColor(api.status), textTransform: 'uppercase', fontWeight: 800 }}>
                {api.status === 'offline' ? <WifiOff size={12}/> : <Wifi size={12}/>}
                {api.status}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Fuente:</span> <span style={{ color: '#fff' }}>{api.source}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tipo de Dato:</span> <span style={{ color: '#fff' }}>{api.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Latencia Esperada:</span> <span style={{ color: '#fff' }}>{api.expectedDelay}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Geolocalizado:</span> <span style={{ color: api.lat_lng ? '#00e676' : '#ffea00' }}>{api.lat_lng ? 'SÍ (Lat/Lng)' : 'NO'}</span>
              </div>
            </div>

            {api.status === 'degraded' && (
              <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'rgba(255,234,0,0.1)', border: '1px dashed #ffea00', borderRadius: '4px', fontSize: '0.65rem', color: '#ffea00' }}>
                ⚠️ Retrasos detectados en la recepción de paquetes.
              </div>
            )}
            {api.status === 'offline' && (
              <div style={{ marginTop: '0.5rem', padding: '0.4rem', background: 'rgba(255,23,68,0.1)', border: '1px dashed #ff1744', borderRadius: '4px', fontSize: '0.65rem', color: '#ff1744' }}>
                🚨 Conexión rechazada. Motor de simulación usando datos cacheados.
              </div>
            )}
          </div>
        ))}
      </div>

      {/* SECCIÓN DE CCTV EN VIVO */}
      <div style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Camera size={18} color="var(--neon-emerald)" />
            Cámaras Scrapeadas en Vivo — Webcams de México
          </h3>
          <button className="btn-premium" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--neon-emerald)', color: 'var(--neon-emerald)' }}>
            + Añadir Stream
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {displayCams.map((cam, idx) => (
            <div key={cam.id} style={{ 
              background: 'rgba(0,0,0,0.5)', 
              border: idx === 0 ? '1px solid var(--neon-emerald)' : '1px solid var(--border-glass)', 
              borderRadius: '8px', 
              overflow: 'hidden',
              boxShadow: idx === 0 ? '0 0 10px rgba(16,185,129,0.2)' : 'none'
            }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                <iframe 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  src={cam.stream_url} 
                  title={cam.name} 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
              <div style={{ padding: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: idx === 0 ? 'rgba(16,185,129,0.1)' : 'transparent' }}>
                <div>
                  <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 'bold', display: 'block' }}>{cam.name}</span>
                  <span style={{ color: '#00e676', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                    <div className="pulse-dot" style={{ background: '#00e676', width: '6px', height: '6px', borderRadius: '50%' }}></div>
                    EN VIVO | {cam.city} (MX)
                  </span>
                </div>
                <button style={{ 
                  background: idx === 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)', 
                  color: idx === 0 ? 'var(--neon-emerald)' : 'var(--neon-blue)', 
                  border: idx === 0 ? '1px solid var(--neon-emerald)' : '1px solid var(--neon-blue)', 
                  padding: '0.3rem 0.6rem', 
                  borderRadius: '4px', 
                  fontSize: '0.7rem', 
                  cursor: 'pointer' 
                }}>
                  {idx === 0 ? 'Recon. Facial (Activo)' : 'Capturar & Analizar'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Visor de Logs de CrewAI */}
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(5, 5, 10, 0.8)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '8px', fontFamily: 'monospace' }}>
          <h4 style={{ color: 'var(--neon-purple)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={14} /> CrewAI Task Status Log
          </h4>
          <div style={{ height: '120px', overflowY: 'auto', fontSize: '0.75rem', color: '#a5b4fc', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <div><span style={{color: '#8b5cf6'}}>[SYS]</span> Esperando triggers de captura de los feeds de video...</div>
            {/* Logs se irán agregando aquí vía socket o polling */}
          </div>
        </div>
      </div>

    </div>
  );
};

export default ApiDataHubMonitor;
