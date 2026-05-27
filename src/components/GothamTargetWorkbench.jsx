// src/components/GothamTargetWorkbench.jsx
// CDD / UXDD / IDD: Motor Ontológico de Vínculos Criminales con Vista Georreferenciada y Capas Territoriales
import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Target, Search, AlertTriangle, ShieldAlert, Cpu, Layers, Map as MapIcon, Network } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Popup, Marker, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import { MUNICIPAL_CPS, getInterlockingPolygon } from '../models/dataModel';

export default function GothamTargetWorkbench() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [viewMode, setViewMode] = useState('graph'); // 'graph' | 'map'
  const [showCpLayer, setShowCpLayer] = useState(true);
  const [showElectoralLayer, setShowElectoralLayer] = useState(false);
  const [electoralGeoJson, setElectoralGeoJson] = useState(null);
  const [loadingElectoral, setLoadingElectoral] = useState(false);
  const fgRef = useRef();

  // Cargar Grafo Ontológico
  useEffect(() => {
    const pythonApiUrl = window.location.port ? `http://${window.location.hostname}:5001` : `${window.location.protocol}//${window.location.hostname}`;
    fetch(`${pythonApiUrl}/api/gotham/network-graph`)
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setGraphData(data.graph);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching Gotham graph:", err);
        setLoading(false);
      });
  }, []);

  // Cargar Secciones Electorales del INE
  useEffect(() => {
    if (showElectoralLayer && !electoralGeoJson) {
      setLoadingElectoral(true);
      const pythonApiUrl = window.location.port ? `http://${window.location.hostname}:5001` : `${window.location.protocol}//${window.location.hostname}`;
      fetch(`${pythonApiUrl}/api/secciones?estado=26&ciudad=hermosillo`)
        .then(r => r.json())
        .then(data => {
          if (data && data.features) {
            setElectoralGeoJson(data);
          }
          setLoadingElectoral(false);
        })
        .catch(err => {
          console.warn("Error cargando secciones electorales del INE:", err);
          setLoadingElectoral(false);
        });
    }
  }, [showElectoralLayer, electoralGeoJson]);

  // Colores para los nodos del grafo
  const getNodeColor = (node) => {
    if (node.type === 'Person') return '#ff1744'; // Rojo para sospechosos
    if (node.type === 'Vehicle') return '#00e676'; // Verde
    if (node.type === 'Location') return '#2979ff'; // Azul
    if (node.type === 'Financial') return '#ffea00'; // Amarillo
    if (node.type === 'Event') return '#d500f9'; // Morado
    return '#ffffff';
  };

  // Emojis y estilos para los marcadores de mapa
  const nodeIcons = React.useMemo(() => {
    if (typeof window === 'undefined') return {};
    return {
      Person: L.divIcon({
        html: '<div style="font-size: 22px; filter: drop-shadow(0 0 6px #ff1744); cursor: pointer;">👤</div>',
        className: 'custom-node-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      Vehicle: L.divIcon({
        html: '<div style="font-size: 22px; filter: drop-shadow(0 0 6px #00e676); cursor: pointer;">🚙</div>',
        className: 'custom-node-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      Location: L.divIcon({
        html: '<div style="font-size: 22px; filter: drop-shadow(0 0 6px #2979ff); cursor: pointer;">🏭</div>',
        className: 'custom-node-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      Financial: L.divIcon({
        html: '<div style="font-size: 22px; filter: drop-shadow(0 0 6px #ffea00); cursor: pointer;">💰</div>',
        className: 'custom-node-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      Event: L.divIcon({
        html: '<div style="font-size: 22px; filter: drop-shadow(0 0 6px #d500f9); cursor: pointer;">🚨</div>',
        className: 'custom-node-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      }),
      Default: L.divIcon({
        html: '<div style="font-size: 22px; filter: drop-shadow(0 0 6px #ffffff); cursor: pointer;">⚪</div>',
        className: 'custom-node-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      })
    };
  }, []);

  // Coordenadas georreferenciadas de Hermosillo para las entidades de Anubis
  const getCoordinates = (node) => {
    if (node.id === "Direccion_X") return [29.0820, -110.9580]; // Bodega Culiacán
    if (node.id === "Evento_1") return [29.0650, -110.9420]; // Reunión Detectada
    if (node.id === "Persona_A") return [29.0790, -110.9620]; // El Patrón
    if (node.id === "Vehiculo_1") return [29.0680, -110.9500]; // Jeep Cherokee
    if (node.id === "Persona_B") return [29.0740, -110.9480]; // Funcionario Y
    if (node.id === "Persona_C") return [29.0760, -110.9520]; // Operador Táctico
    
    // Distribución determinista procedimental si hay nuevos nodos
    const hash = node.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const latOffset = ((hash % 100) - 50) * 0.0004;
    const lngOffset = (((hash >> 2) % 100) - 50) * 0.0004;
    return [29.0729 + latOffset, -110.9559 + lngOffset];
  };

  // Preparar Polígonos de Códigos Postales de Hermosillo
  const cpPolygons = React.useMemo(() => {
    return Object.values(MUNICIPAL_CPS["HERMOSILLO"] || {}).map((cp, idx) => {
      const polygonCoords = getInterlockingPolygon(cp.coords, 0.02, idx, 5);
      return {
        id: cp.id || `cp-${idx}`,
        name: cp.name || `CP ${cp.id}`,
        coords: polygonCoords
      };
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      
      {/* Header Panel */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-rose)', fontSize: '1.2rem', textTransform: 'uppercase' }}>
            <Target size={20} />
            Target Workbench (Ontology Engine)
          </h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Agente Cazador Anubis: Descubrimiento de Grafos de Corrupción y Patrones Criminales
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Selector de Vista (Grafo / Mapa) */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.5)', padding: '0.2rem', borderRadius: '6px', border: '1px solid var(--border-glass)' }}>
            <button
              onClick={() => setViewMode('graph')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: viewMode === 'graph' ? 'var(--neon-rose)' : 'transparent',
                color: viewMode === 'graph' ? 'black' : 'var(--text-secondary)',
                fontWeight: '800', fontSize: '0.72rem', transition: 'all 0.2s'
              }}
            >
              <Network size={14} /> Grafo Relaciones
            </button>
            <button
              onClick={() => setViewMode('map')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.4rem 0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: viewMode === 'map' ? 'var(--neon-rose)' : 'transparent',
                color: viewMode === 'map' ? 'black' : 'var(--text-secondary)',
                fontWeight: '800', fontSize: '0.72rem', transition: 'all 0.2s'
              }}
            >
              <MapIcon size={14} /> Mapa Inteligencia
            </button>
          </div>

          <div className="citizen-input" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.6rem', width: '250px' }}>
            <Search size={14} color="var(--text-secondary)" />
            <input 
              type="text" 
              placeholder="Buscar Entidad (Nombre, Placa, Cuenta)..." 
              style={{ background: 'transparent', border: 'none', color: '#fff', width: '100%', outline: 'none', fontSize: '0.8rem' }}
            />
          </div>
          
          <button className="btn-premium glow-pulse" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
            <Cpu size={14} />
            Auto-Descubrir Vínculos
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector */}
      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: '520px', flexWrap: 'wrap' }}>
        
        {/* Force Graph / Map Canvas */}
        <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative', minWidth: '400px', minHeight: '500px' }}>
          {loading ? (
            <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--neon-blue)', fontSize: '1rem' }}>
              Analizando Mangueras de Datos OSINT...
            </div>
          ) : viewMode === 'graph' ? (
            <ForceGraph2D
              ref={fgRef}
              width={800} // Vite/CSS ajustará esto dinámicamente si es necesario
              height={500}
              graphData={graphData}
              nodeLabel="label"
              nodeColor={getNodeColor}
              nodeRelSize={6}
              linkColor={() => 'rgba(255,255,255,0.2)'}
              linkWidth={2}
              linkDirectionalParticles={2}
              linkDirectionalParticleSpeed={d => d.value * 0.005}
              onNodeClick={(node) => {
                setSelectedNode(node);
                fgRef.current.centerAt(node.x, node.y, 1000);
                fgRef.current.zoom(4, 2000);
              }}
              backgroundColor="rgba(8, 15, 30, 0.4)"
            />
          ) : (
            <div style={{ width: '100%', height: '100%', minHeight: '500px', position: 'relative' }}>
              <MapContainer 
                center={[29.0729, -110.9559]} 
                zoom={13} 
                style={{ height: '100%', width: '100%', minHeight: '500px' }}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {/* Capa de Códigos Postales (CP) */}
                {showCpLayer && cpPolygons.map((cp) => (
                  <Polygon
                    key={cp.id}
                    positions={cp.coords}
                    pathOptions={{
                      color: 'var(--neon-blue)',
                      weight: 1.5,
                      fillColor: 'var(--neon-blue)',
                      fillOpacity: 0.06
                    }}
                  >
                    <Popup>
                      <div style={{ color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}>
                        <strong>Código Postal:</strong> {cp.name}
                      </div>
                    </Popup>
                  </Polygon>
                ))}

                {/* Capa de Secciones Electorales (INE) */}
                {showElectoralLayer && electoralGeoJson && (
                  <GeoJSON
                    data={electoralGeoJson}
                    style={() => ({
                      color: '#eab308',
                      weight: 1.2,
                      fillColor: '#eab308',
                      fillOpacity: 0.04
                    })}
                    onEachFeature={(feature, layer) => {
                      const props = feature.properties || {};
                      const seccionNum = props.seccion || props.SECCION || 'N/A';
                      layer.bindPopup(
                        `<div style="color: #fff; font-size: 11px; font-family: monospace;">
                           <strong>Sección Electoral (INE):</strong> ${seccionNum}
                         </div>`
                      );
                    }}
                  />
                )}

                {/* Marcadores de Entidades Anubis */}
                {graphData.nodes.map((node) => {
                  const coords = getCoordinates(node);
                  const icon = nodeIcons[node.type] || nodeIcons.Default;
                  return (
                    <Marker 
                      key={node.id} 
                      position={coords} 
                      icon={icon}
                      eventHandlers={{
                        click: () => setSelectedNode(node)
                      }}
                    >
                      <Popup>
                        <div style={{ color: '#fff', background: 'rgba(8, 15, 30, 0.95)', padding: '5px', borderRadius: '4px', fontSize: '11px', fontFamily: 'sans-serif' }}>
                          <strong style={{ color: getNodeColor(node) }}>{node.label}</strong>
                          <br />
                          Tipo: {node.type}
                          <br />
                          Peligro: {(node.risk * 100).toFixed(1)}%
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Control de Capas Flotante */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                zIndex: 1000,
                background: 'rgba(10, 15, 30, 0.85)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border-glass)',
                padding: '0.6rem',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                fontFamily: 'sans-serif'
              }}>
                <div style={{ fontSize: '0.65rem', fontWeight: '800', color: 'white', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Layers size={11} color="var(--neon-rose)" />
                  INTERCALAR CAPAS
                </div>
                
                <button
                  onClick={() => setShowCpLayer(!showCpLayer)}
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.35rem 0.5rem',
                    border: '1px solid',
                    borderColor: showCpLayer ? 'var(--neon-blue)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    background: showCpLayer ? 'rgba(0, 229, 255, 0.1)' : 'rgba(0,0,0,0.2)',
                    color: showCpLayer ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: '700',
                    textAlign: 'left'
                  }}
                >
                  ✉️ Códigos Postales (CP)
                </button>
                
                <button
                  onClick={() => setShowElectoralLayer(!showElectoralLayer)}
                  style={{
                    fontSize: '0.65rem',
                    padding: '0.35rem 0.5rem',
                    border: '1px solid',
                    borderColor: showElectoralLayer ? '#eab308' : 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    background: showElectoralLayer ? 'rgba(234, 179, 8, 0.1)' : 'rgba(0,0,0,0.2)',
                    color: showElectoralLayer ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: '700',
                    textAlign: 'left'
                  }}
                >
                  🗺️ Secciones INE {loadingElectoral && '...'}
                </button>
              </div>
            </div>
          )}

          {/* Leyenda inferior */}
          {viewMode === 'graph' && (
            <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px' }}>
              <span style={{ fontSize: '0.65rem', color: '#ff1744' }}>● Persona</span>
              <span style={{ fontSize: '0.65rem', color: '#00e676' }}>● Vehículo</span>
              <span style={{ fontSize: '0.65rem', color: '#2979ff' }}>● Ubicación</span>
              <span style={{ fontSize: '0.65rem', color: '#ffea00' }}>● Financiero</span>
            </div>
          )}
        </div>

        {/* Node Inspector Panel */}
        <div className="glass-card" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '250px' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'white', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
            Inspector de Entidad
          </h3>

          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getNodeColor(selectedNode) }}></div>
                <h4 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>{selectedNode.label}</h4>
              </div>
              
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>ID Ontológico:</span>
                <span style={{ color: 'var(--neon-blue)', fontFamily: 'monospace' }}>{selectedNode.id}</span>
              </div>
              <div style={{ display: 'flex', justifycontent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Clase (Tipo):</span>
                <span style={{ color: 'white' }}>{selectedNode.type}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score de Riesgo (IA):</span>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  <div style={{ width: `${selectedNode.risk * 100}%`, height: '100%', background: selectedNode.risk > 0.8 ? '#ff1744' : '#ffea00', borderRadius: '4px' }}></div>
                </div>
                <span style={{ fontSize: '0.65rem', alignSelf: 'flex-end', color: selectedNode.risk > 0.8 ? '#ff1744' : '#ffea00' }}>
                  {(selectedNode.risk * 100).toFixed(1)}% Peligro
                </span>
              </div>

              {selectedNode.risk > 0.8 && (
                <div style={{ background: 'rgba(255,23,68,0.1)', border: '1px dashed #ff1744', padding: '0.5rem', borderRadius: '6px', display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <AlertTriangle size={16} color="#ff1744" style={{ flexShrink: 0 }} />
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#ff1744' }}>
                    Esta entidad tiene fuertes vínculos con anomalías criminales en la línea temporal base. Recomienda vigilancia satelital.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', textAlign: 'center', gap: '1rem' }}>
              <ShieldAlert size={32} />
              <p style={{ fontSize: '0.8rem' }}>Haz clic en un nodo del grafo o marcador de mapa para inspeccionar sus vínculos y grado de riesgo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
