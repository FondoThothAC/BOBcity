// src/components/GothamTargetWorkbench.jsx
import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Target, Search, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export default function GothamTargetWorkbench() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const fgRef = useRef();

  useEffect(() => {
    fetch('http://localhost:8000/api/gotham/network-graph')
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

  const getNodeColor = (node) => {
    if (node.type === 'Person') return '#ff1744'; // Red for suspects
    if (node.type === 'Vehicle') return '#00e676'; // Green
    if (node.type === 'Location') return '#2979ff'; // Blue
    if (node.type === 'Financial') return '#ffea00'; // Yellow
    if (node.type === 'Event') return '#d500f9'; // Purple
    return '#ffffff';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem' }}>
      
      {/* Header Panel */}
      <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--neon-rose)', fontSize: '1.2rem', textTransform: 'uppercase' }}>
            <Target size={20} />
            Target Workbench (Ontology Engine)
          </h2>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Agente Cazador Anubis: Descubrimiento de Grafos de Corrupción y Patrones Criminales
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: '500px' }}>
        
        {/* Force Graph Canvas */}
        <div className="glass-card" style={{ flex: 1, padding: 0, overflow: 'hidden', position: 'relative' }}>
          {loading ? (
            <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'var(--neon-blue)' }}>
              Analizando Mangueras de Datos...
            </div>
          ) : (
            <ForceGraph2D
              ref={fgRef}
              width={800} // This will be overriden by CSS/resize observer ideally, hardcoded for simplicity
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
                // Center camera on node
                fgRef.current.centerAt(node.x, node.y, 1000);
                fgRef.current.zoom(4, 2000);
              }}
              backgroundColor="rgba(8, 15, 30, 0.4)"
            />
          )}
          <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: '#ff1744' }}>● Persona</span>
            <span style={{ fontSize: '0.65rem', color: '#00e676' }}>● Vehículo</span>
            <span style={{ fontSize: '0.65rem', color: '#2979ff' }}>● Ubicación</span>
            <span style={{ fontSize: '0.65rem', color: '#ffea00' }}>● Financiero</span>
          </div>
        </div>

        {/* Node Inspector Panel */}
        <div className="glass-card" style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'white', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
            Inspector de Entidad
          </h3>

          {selectedNode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: getNodeColor(selectedNode) }}></div>
                <h4 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>{selectedNode.label}</h4>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>ID Ontológico:</span>
                <span style={{ color: 'var(--neon-blue)', fontFamily: 'monospace' }}>{selectedNode.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
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
              <p style={{ fontSize: '0.8rem' }}>Haz clic en un nodo del grafo para inspeccionar sus vínculos y grado de riesgo.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
