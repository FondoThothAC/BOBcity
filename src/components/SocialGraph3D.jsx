import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Network, 
  Search, 
  Sliders, 
  Filter,
  Brain,
  Cpu,
  Layers,
  Box,
  User,
  Building,
  Smartphone,
  Bot
} from 'lucide-react';

import ForceGraph2D from 'react-force-graph-2d';
import ForceGraph3D from 'react-force-graph-3d';

// Funciones generadoras de datos (Mock Data estilo Palantir Ontology)
const generateGraphData = () => {
  const nodes = [];
  const links = [];
  
  const types = ['Persona', 'Empresa', 'Telefono', 'Bot'];
  
  // Nodos Centrales (Targets)
  nodes.push({ id: 'target_1', name: 'Julio "El Patrón" C.', type: 'Persona', risk: 0.9, sector: 'Política' });
  nodes.push({ id: 'target_2', name: 'Inmobiliaria Fantasma SA', type: 'Empresa', risk: 0.85, sector: 'Comercial' });
  nodes.push({ id: 'target_3', name: '@bot_network_lead', type: 'Bot', risk: 0.95, sector: 'Digital' });
  nodes.push({ id: 'target_4', name: '+52 662 123 4567', type: 'Telefono', risk: 0.6, sector: 'Comunicaciones' });

  // Crear red aleatoria alrededor de los targets
  for (let i = 0; i < 80; i++) {
    const isBot = Math.random() < 0.15;
    const type = isBot ? 'Bot' : types[Math.floor(Math.random() * (types.length - 1))];
    const risk = isBot ? (0.7 + Math.random() * 0.3) : Math.random() * 0.5;
    
    nodes.push({
      id: `node_${i}`,
      name: type === 'Persona' ? `Ciudadano ${i}` : type === 'Empresa' ? `Comercio ${i}` : type === 'Bot' ? `@cuenta_falsa_${i}` : `+52 662 000 ${1000+i}`,
      type: type,
      risk: parseFloat(risk.toFixed(2)),
      sector: 'General'
    });
  }

  // Enlaces de Targets a Nodos
  for (let i = 0; i < 40; i++) {
    links.push({
      source: `target_${Math.floor(Math.random() * 4) + 1}`,
      target: `node_${Math.floor(Math.random() * 80)}`,
      relation: ['Accionista', 'Familiar', 'Transfirió a', 'Llamó a', 'Retuiteó a'][Math.floor(Math.random() * 5)]
    });
  }

  // Enlaces de Nodos a Nodos
  for (let i = 0; i < 50; i++) {
    links.push({
      source: `node_${Math.floor(Math.random() * 80)}`,
      target: `node_${Math.floor(Math.random() * 80)}`,
      relation: ['Llamó a', 'Compañero', 'Conexión IP'][Math.floor(Math.random() * 3)]
    });
  }

  return { nodes, links };
};

export default function SocialGraph3D() {
  const containerRef = useRef(null);
  
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [viewMode, setViewMode] = useState('2D'); // '2D' or '3D'
  
  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [minRisk, setMinRisk] = useState(0.0);
  const [selectedNode, setSelectedNode] = useState(null);
  const [gnnStatus, setGnnStatus] = useState('idle');
  const [gnnLogs, setGnnLogs] = useState([]);

  useEffect(() => {
    setGraphData(generateGraphData());
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: 500
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getNodeColor = (node) => {
    if (selectedNode && selectedNode.id === node.id) return '#ffffff';
    if (node.type === 'Bot') return '#ef4444'; // Red
    if (node.type === 'Persona') return '#3b82f6'; // Blue
    if (node.type === 'Empresa') return '#f59e0b'; // Amber
    if (node.type === 'Telefono') return '#10b981'; // Emerald
    return '#94a3b8';
  };

  const getNodeSize = (node) => {
    let size = node.risk > 0.8 ? 8 : 4;
    if (selectedNode && selectedNode.id === node.id) size += 4;
    return size;
  };

  // Filtrado de Nodos
  const filteredData = useMemo(() => {
    const filteredNodes = graphData.nodes.filter(node => {
      const matchSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase()) || node.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRisk = node.risk >= minRisk;
      return matchSearch && matchRisk;
    });

    const nodeIds = new Set(filteredNodes.map(n => n.id));

    const filteredLinks = graphData.links.filter(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      return nodeIds.has(sourceId) && nodeIds.has(targetId);
    });

    return { nodes: filteredNodes, links: filteredLinks };
  }, [graphData, searchQuery, minRisk]);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    window.dispatchEvent(new CustomEvent('civic-toast', {
      detail: { message: `Investigando entidad: ${node.name} (${node.type})`, type: 'info' }
    }));
  }, []);

  // Simulación de GNN (Pipeline)
  const runGnnPipeline = () => {
    setGnnStatus('running');
    setGnnLogs([]);
    
    const steps = [
      { text: "🛰️ Invocando GraphSAGE de 3 capas local...", wait: 600 },
      { text: "📊 Cargando topología de relaciones y co-apariciones...", wait: 1200 },
      { text: "🔍 Analizando patrones anómalos (Umbral de similitud > 0.85)...", wait: 2000 },
      { text: "⚙️ Corriendo CommunityAwareGCN...", wait: 2800 },
      { text: "🛡️ Clasificación terminada: Se detectaron redes de bots y flujos ilícitos.", wait: 3500 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setGnnLogs(prev => [...prev, step.text]);
        if (idx === steps.length - 1) {
          setGnnStatus('done');
          setMinRisk(0.5); // Auto filter
          window.dispatchEvent(new CustomEvent('civic-toast', {
            detail: { message: "GNN Pipeline: Clasificación completada con éxito.", type: "success" }
          }));
        }
      }, step.wait);
    });
  };

  // Obtener conexiones directas del nodo seleccionado
  const getDirectConnections = () => {
    if (!selectedNode) return [];
    return filteredData.links.filter(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return sourceId === selectedNode.id || targetId === selectedNode.id;
    }).map(l => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const isSource = sourceId === selectedNode.id;
      const otherNodeId = isSource ? (typeof l.target === 'object' ? l.target.id : l.target) : sourceId;
      const otherNode = filteredData.nodes.find(n => n.id === otherNodeId);
      return { relation: l.relation, otherNode, direction: isSource ? 'out' : 'in' };
    }).filter(c => c.otherNode);
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(15, 23, 42, 0.45)', padding: '2rem' }}>
      
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Network size={24} className="neon-icon" style={{ color: 'var(--neon-purple)' }} />
            Object Explorer (Link Analysis)
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Topología de grafos interactiva estilo Palantir. Inspección profunda de entidades, flujos financieros y redes operativas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* 2D / 3D Switch */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '0.2rem', border: '1px solid var(--border-glass)' }}>
            <button 
              onClick={() => setViewMode('2D')}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', background: viewMode === '2D' ? 'var(--neon-blue)' : 'transparent', color: viewMode === '2D' ? '#fff' : 'var(--text-secondary)', fontWeight: viewMode === '2D' ? 'bold' : 'normal', transition: 'all 0.2s' }}
            >
              <Layers size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> 2D
            </button>
            <button 
              onClick={() => setViewMode('3D')}
              style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', background: viewMode === '3D' ? 'var(--neon-purple)' : 'transparent', color: viewMode === '3D' ? '#fff' : 'var(--text-secondary)', fontWeight: viewMode === '3D' ? 'bold' : 'normal', transition: 'all 0.2s' }}
            >
              <Box size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> 3D
            </button>
          </div>

          <button 
            onClick={runGnnPipeline} 
            disabled={gnnStatus === 'running'}
            className="btn-premium"
            style={{ 
              background: 'linear-gradient(135deg, var(--neon-purple) 0%, #6d28d9 100%)',
              boxShadow: '0 0 12px rgba(139, 92, 246, 0.3)',
              padding: '0.5rem 1rem',
              fontSize: '0.8rem',
              opacity: gnnStatus === 'running' ? 0.6 : 1
            }}
          >
            <Brain size={16} style={{ marginRight: '6px', verticalAlign: 'middle', display: 'inline' }} />
            Ejecutar Clasificador GNN
          </button>
        </div>
      </div>

      {/* Main visualizer area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', minHeight: '500px' }} className="responsive-grid">
        
        {/* Left Side: Force Graph Container */}
        <div ref={containerRef} style={{ border: '1px solid var(--border-glass)', borderRadius: '12px', background: '#050811', overflow: 'hidden', position: 'relative' }}>
          {filteredData.nodes.length > 0 ? (
            viewMode === '2D' ? (
              <ForceGraph2D
                width={dimensions.width}
                height={dimensions.height}
                graphData={filteredData}
                nodeLabel="name"
                nodeColor={getNodeColor}
                nodeRelSize={4}
                nodeVal={getNodeSize}
                linkColor={() => 'rgba(255,255,255,0.1)'}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                onNodeClick={handleNodeClick}
                backgroundColor="#050811"
              />
            ) : (
              <ForceGraph3D
                width={dimensions.width}
                height={dimensions.height}
                graphData={filteredData}
                nodeLabel="name"
                nodeColor={getNodeColor}
                nodeResolution={16}
                nodeVal={getNodeSize}
                linkColor={() => 'rgba(255,255,255,0.1)'}
                linkDirectionalArrowLength={3.5}
                linkDirectionalArrowRelPos={1}
                onNodeClick={handleNodeClick}
                backgroundColor="#050811"
              />
            )
          ) : (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
               No hay nodos que coincidan con los filtros.
             </div>
          )}

          {/* Ontología Leyenda Rápida */}
          <div style={{ position: 'absolute', bottom: '15px', left: '15px', display: 'flex', flexDirection: 'column', gap: '0.4rem', background: 'rgba(0,0,0,0.6)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.65rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }}></div> Persona</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }}></div> Empresa</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }}></div> Teléfono</div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }}></div> Bot / Riesgo Alto</div>
          </div>
        </div>

        {/* Right Side: Object Explorer Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Node Details Card */}
          <div className="inner-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px', flex: '1' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <Sliders size={16} style={{ color: 'var(--neon-blue)' }} />
              Inspector de Entidad
            </h3>

            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '800', color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {selectedNode.type === 'Persona' && <User size={16} style={{ color: '#3b82f6' }} />}
                    {selectedNode.type === 'Empresa' && <Building size={16} style={{ color: '#f59e0b' }} />}
                    {selectedNode.type === 'Telefono' && <Smartphone size={16} style={{ color: '#10b981' }} />}
                    {selectedNode.type === 'Bot' && <Bot size={16} style={{ color: '#ef4444' }} />}
                    {selectedNode.name}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Clase / Tipo:</span>
                    <strong style={{ color: '#fff', fontSize: '0.85rem' }}>{selectedNode.type}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem', textTransform: 'uppercase' }}>Nivel de Riesgo:</span>
                    <strong style={{ color: selectedNode.risk > 0.75 ? 'var(--neon-rose)' : selectedNode.risk > 0.4 ? 'var(--neon-amber)' : 'var(--neon-emerald)', fontSize: '0.85rem' }}>
                      {(selectedNode.risk * 100).toFixed(1)}%
                    </strong>
                  </div>
                </div>

                {/* Vínculos Directos */}
                <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '0.6rem', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Vínculos Directos Detectados:</span>
                  
                  <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: '4px' }}>
                    {getDirectConnections().map((conn, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.4rem', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{conn.direction === 'out' ? '→' : '←'}</span>
                        <span style={{ color: 'var(--neon-purple)', fontWeight: 'bold' }}>{conn.relation}</span>
                        <span 
                          style={{ color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}
                          onClick={() => handleNodeClick(conn.otherNode)}
                        >
                          {conn.otherNode.name}
                        </span>
                      </div>
                    ))}
                    {getDirectConnections().length === 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontStyle: 'italic' }}>Sin vínculos directos en el grafo actual.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '2rem 0' }}>
                Haz clic en cualquier nodo del grafo para desplegar su ficha de inteligencia y vínculos.
              </div>
            )}
          </div>

          {/* Configuration / Filtering Card */}
          <div className="inner-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <Filter size={16} style={{ color: 'var(--neon-purple)' }} />
              Filtros Topológicos
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem' }}>
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Buscar Entidad:</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Ej. Inmobiliaria o Julio..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="premium-input"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem 0.4rem 1.8rem', width: '100%' }}
                  />
                  <Search size={12} style={{ position: 'absolute', left: '8px', top: '11px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <span>Nivel de Riesgo Mínimo:</span>
                  <strong style={{ color: minRisk > 0.6 ? 'var(--neon-rose)' : 'var(--text-primary)' }}>&gt;= {(minRisk*100).toFixed(0)}%</strong>
                </div>
                <input 
                  type="range" 
                  min="0.0" 
                  max="0.95" 
                  step="0.05" 
                  value={minRisk}
                  onChange={(e) => setMinRisk(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--neon-rose)' }}
                />
              </div>
            </div>
          </div>

          {/* GNN Status console logs */}
          <div style={{ background: '#020408', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.65rem', maxHeight: '110px', overflowY: 'auto' }}>
            <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Cpu size={10} />
              GNN PIPELINE EXECUTION LOGS
            </div>
            
            {gnnLogs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes('✅') ? 'var(--neon-emerald)' : log.includes('🛡️') ? 'var(--neon-rose)' : 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {log}
              </div>
            ))}
            {gnnLogs.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '0.5rem 0' }}>
                Esperando ejecución de clasificador GNN...
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
