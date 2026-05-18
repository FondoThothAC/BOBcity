import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, 
  Search, 
  Sliders, 
  ShieldAlert, 
  Compass, 
  HelpCircle, 
  ExternalLink,
  Brain,
  Filter,
  CheckCircle,
  Database,
  Cpu
} from 'lucide-react';

export default function SocialGraph3D({ agents = [] }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // States for filter and search
  const [minBotScore, setMinBotScore] = useState(0.0);
  const [selectedCommunity, setSelectedCommunity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isRotating, setIsRotating] = useState(true);
  const [gnnStatus, setGnnStatus] = useState('idle'); // 'idle', 'running', 'done'
  const [gnnLogs, setGnnLogs] = useState([]);

  // 3D Orbital Projection state variables
  const [rotationAngleX, setRotationAngleX] = useState(0.01);
  const [rotationAngleY, setRotationAngleY] = useState(0.005);
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);

  // Interaction vectors
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const angles = useRef({ alpha: 0.1, beta: 0.2 }); // X & Y rotation angles

  // Generate topology data using agents or synthetic clusters
  useEffect(() => {
    // We will generate a structured cívico-social graph representing Hermosillo social conversation nodes.
    const tempNodes = [];
    const tempLinks = [];
    const communitiesCount = 4;

    // Create 80 conversation nodes with GNN features
    for (let i = 0; i < 85; i++) {
      const community = i % communitiesCount;
      // High-probability bot clusters in community 3 and 1
      const isBotSeed = (community === 3 && Math.random() < 0.65) || (community === 1 && Math.random() < 0.25) || (Math.random() < 0.05);
      const botScore = isBotSeed ? (0.65 + Math.random() * 0.32) : (Math.random() * 0.35);
      
      // Node sectors matching SPEC.md
      const sectors = ['comerciantes', 'estudiantes', 'asalariados', 'jubilados', 'hogar'];
      const sector = sectors[i % sectors.length];

      // Random 3D spherical positions for coordinates
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const radius = 160 + Math.random() * 90; // Spherical dispersion

      tempNodes.push({
        id: i,
        name: `Node_${i < 10 ? '0' + i : i}`,
        label: isBotSeed ? `@inf_bot_${i}` : `@ciudadano_her_${i}`,
        sector: sector,
        botScore: parseFloat(botScore.toFixed(3)),
        community: community,
        isBot: botScore > 0.6,
        x3d: radius * Math.sin(phi) * Math.cos(theta),
        y3d: radius * Math.sin(phi) * Math.sin(theta),
        z3d: radius * Math.cos(phi),
        x2d: 0,
        y2d: 0,
        depth: 0,
        size: isBotSeed ? 8 : 4.5 + Math.random() * 3,
        centrality: parseFloat((0.1 + Math.random() * 0.85).toFixed(2)),
        stance: i % 2 === 0 ? 'Candidato A' : 'Candidato B',
        sentiment: parseFloat((-1 + Math.random() * 2).toFixed(2))
      });
    }

    // Connect nodes by proximity and community structures to simulate social networks
    for (let i = 0; i < tempNodes.length; i++) {
      // Connect to at least 2 nodes within the same community
      let connectedCount = 0;
      for (let j = i + 1; j < tempNodes.length; j++) {
        const nodeA = tempNodes[i];
        const nodeB = tempNodes[j];
        const sameComm = nodeA.community === nodeB.community;
        const bothBots = nodeA.isBot && nodeB.isBot;
        
        // High connection probability for bots (coordinated campaign simulation)
        const connectionProb = bothBots ? 0.45 : sameComm ? 0.15 : 0.015;
        
        if (Math.random() < connectionProb && connectedCount < 6) {
          tempLinks.push({
            source: i,
            target: j,
            type: bothBots ? 'coordinated' : sameComm ? 'intra-community' : 'bridge',
            weight: bothBots ? 1.5 : 0.8
          });
          connectedCount++;
        }
      }
    }

    setNodes(tempNodes);
    setLinks(tempLinks);
  }, []);

  // Canvas drawing, 3D projection, and rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 500;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // 1. Apply 3D rotation matrix
      if (isRotating && !isDragging.current) {
        angles.current.alpha += rotationAngleX;
        angles.current.beta += rotationAngleY;
      }

      const cosAlpha = Math.cos(angles.current.alpha);
      const sinAlpha = Math.sin(angles.current.alpha);
      const cosBeta = Math.cos(angles.current.beta);
      const sinBeta = Math.sin(angles.current.beta);

      // Rotate and project nodes
      const projectedNodes = nodes.map(node => {
        // Rotate X
        let y1 = node.y3d * cosAlpha - node.z3d * sinAlpha;
        let z1 = node.z3d * cosAlpha + node.y3d * sinAlpha;

        // Rotate Y
        let x2 = node.x3d * cosBeta - z1 * sinBeta;
        let z2 = z1 * cosBeta + node.x3d * sinBeta;

        // Perspective factor
        const fov = 400;
        const scale = fov / (fov + z2); // Closer nodes look larger, further look smaller

        return {
          ...node,
          x2d: centerX + x2 * scale,
          y2d: centerY + y1 * scale,
          depth: z2, // Store z-depth for sorting
          renderedSize: Math.max(1, node.size * scale)
        };
      });

      // Filter nodes based on panel settings
      const filteredProjectedNodes = projectedNodes.filter(node => {
        const matchesBot = node.botScore >= minBotScore;
        const matchesCommunity = selectedCommunity === 'all' || node.community.toString() === selectedCommunity;
        const matchesSearch = searchQuery === '' || 
          node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.sector.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesBot && matchesCommunity && matchesSearch;
      });

      const activeIds = new Set(filteredProjectedNodes.map(n => n.id));

      // 2. Draw Links (Edges)
      links.forEach(link => {
        const sourceNode = filteredProjectedNodes.find(n => n.id === link.source);
        const targetNode = filteredProjectedNodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x2d, sourceNode.y2d);
          ctx.lineTo(targetNode.x2d, targetNode.y2d);

          // Color coded edges
          if (link.type === 'coordinated') {
            // Hot red pulse for bots coordinated sharing
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.28)';
            ctx.lineWidth = 1.6;
          } else {
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
            ctx.lineWidth = 0.8;
          }
          ctx.stroke();
        }
      });

      // Sort nodes by depth (painter's algorithm) so front nodes render on top of back nodes
      const sortedNodes = [...filteredProjectedNodes].sort((a, b) => b.depth - a.depth);

      // 3. Draw Nodes
      sortedNodes.forEach(node => {
        const isSelected = selectedNode && selectedNode.id === node.id;
        const isHovered = hoveredNode && hoveredNode.id === node.id;

        ctx.beginPath();
        ctx.arc(node.x2d, node.y2d, node.renderedSize * (isSelected ? 1.6 : isHovered ? 1.4 : 1), 0, 2 * Math.PI);

        // Core colors from SPEC.md: Humans green/blue, Bots red glow
        let nodeColor = 'rgba(59, 130, 246, 0.7)'; // Default blue
        if (node.isBot) {
          nodeColor = 'rgba(239, 68, 68, 0.9)'; // Neon red for bot
        } else if (node.community === 0) {
          nodeColor = 'rgba(16, 185, 129, 0.8)'; // Emerald
        } else if (node.community === 1) {
          nodeColor = 'rgba(139, 92, 246, 0.8)'; // Purple
        } else if (node.community === 2) {
          nodeColor = 'rgba(245, 158, 11, 0.8)'; // Amber
        }

        ctx.fillStyle = nodeColor;
        ctx.fill();

        // Highlighting borders
        if (node.isBot) {
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
          ctx.lineWidth = 2;
          ctx.stroke();
          
          // Draw subtle pulsing outer aura for extreme bot scores
          if (node.botScore > 0.8) {
            ctx.beginPath();
            ctx.arc(node.x2d, node.y2d, node.renderedSize * 2.2, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.15)';
            ctx.stroke();
          }
        } else if (isSelected || isHovered) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw names for highlighted or bot nodes
        if (isSelected || isHovered || (node.isBot && node.botScore > 0.85)) {
          ctx.font = '10px monospace';
          ctx.fillStyle = node.isBot ? '#f87171' : '#f1f5f9';
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x2d, node.y2d - node.renderedSize - 6);
        }
      });

      // Update projected locations back in local state ref for clicking
      canvas.projectedNodes = projectedNodes;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [nodes, links, selectedNode, hoveredNode, minBotScore, selectedCommunity, searchQuery, isRotating, rotationAngleX, rotationAngleY]);

  // Mouse handlers for dragging/orbiting the sphere
  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Handle dragging/rotating sphere
    if (isDragging.current) {
      const deltaX = e.clientX - lastMousePos.current.x;
      const deltaY = e.clientY - lastMousePos.current.y;

      angles.current.alpha += deltaY * 0.007;
      angles.current.beta += deltaX * 0.007;

      lastMousePos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Handle hovering detection
    if (canvas.projectedNodes) {
      let foundHover = null;
      for (const node of canvas.projectedNodes) {
        const dx = mouseX - node.x2d;
        const dy = mouseY - node.y2d;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < node.renderedSize + 6) {
          foundHover = node;
          break;
        }
      }
      setHoveredNode(foundHover);
    }
  };

  const handleMouseUp = (e) => {
    isDragging.current = false;
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (canvas.projectedNodes) {
      let foundNode = null;
      for (const node of canvas.projectedNodes) {
        const dx = mouseX - node.x2d;
        const dy = mouseY - node.y2d;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < node.renderedSize + 8) {
          foundNode = node;
          break;
        }
      }
      setSelectedNode(foundNode);
      if (foundNode) {
        window.dispatchEvent(new CustomEvent('civic-toast', {
          detail: { message: `Investigando nodo: ${foundNode.label} (${foundNode.sector})`, type: 'info' }
        }));
      }
    }
  };

  // Run simulated Graph Neural Network Detection pipeline
  const runGnnPipeline = () => {
    setGnnStatus('running');
    setGnnLogs([]);
    
    const steps = [
      { text: "🛰️ Invocando GraphSAGE de 3 capas local...", wait: 600 },
      { text: "📊 Cargando topología de relaciones y co-hashtags de Twitter local...", wait: 1200 },
      { text: "🔍 Analizando patrones anómalos de co-mención (Umbral de similitud semántica > 0.85)...", wait: 2000 },
      { text: "⚙️ Corriendo CommunityAwareGCN para agrupar proyecciones vectoriales...", wait: 2800 },
      { text: "🛡️ RoGBot + CAGCL clasificados: 28 de 85 nodos marcados como amplificación artificial.", wait: 3500 }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setGnnLogs(prev => [...prev, step.text]);
        if (idx === steps.length - 1) {
          setGnnStatus('done');
          setMinBotScore(0.6); // Auto-filter to show bots
          window.dispatchEvent(new CustomEvent('civic-toast', {
            detail: { message: "GNN Pipeline: Clasificación completada con éxito.", type: "success" }
          }));
        }
      }, step.wait);
    });
  };

  return (
    <div ref={containerRef} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(15, 23, 42, 0.45)', padding: '2rem' }}>
      
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Network size={24} className="neon-icon" style={{ color: 'var(--neon-purple)' }} />
            Visualización de Grafo Social 3D & GNN Detector de Bots
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Topología tridimensional interactiva de la conversación cívica y detección de campañas coordinadas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
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
            Ejecutar Clasificador GNN (RoGBot)
          </button>
        </div>
      </div>

      {/* Main interactive visualizer area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', minHeight: '500px' }} className="responsive-grid">
        
        {/* Left Side: 3D interactive Canvas sphere */}
        <div style={{ position: 'relative', border: '1px solid var(--border-glass)', borderRadius: '12px', background: '#050811', overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab' }}>
          
          {/* Orbital compass widget */}
          <div style={{ position: 'absolute', top: '15px', left: '15px', display: 'flex', gap: '0.5rem', zIndex: 5 }}>
            <button 
              onClick={() => setIsRotating(!isRotating)} 
              className="btn-outline"
              style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem', background: isRotating ? 'rgba(139, 92, 246, 0.15)' : 'transparent', color: isRotating ? 'var(--neon-purple)' : 'var(--text-secondary)', borderColor: isRotating ? 'var(--neon-purple)' : 'var(--border-glass)' }}
            >
              <Compass size={12} style={{ marginRight: '4px', display: 'inline', verticalAlign: 'middle' }} />
              {isRotating ? 'Auto-Rotación Activa' : 'Pausar Rotación'}
            </button>
          </div>

          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
            style={{ display: 'block', width: '100%' }}
          />

          {/* Hover preview tooltip */}
          {hoveredNode && (
            <div style={{
              position: 'absolute',
              bottom: '15px',
              left: '15px',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              padding: '0.6rem 0.8rem',
              fontSize: '0.75rem',
              pointerEvents: 'none',
              zIndex: 10,
              animation: 'scaleIn 0.15s ease'
            }}>
              <div style={{ fontWeight: '700', color: hoveredNode.isBot ? 'var(--neon-rose)' : '#fff' }}>
                {hoveredNode.label} {hoveredNode.isBot && '🤖 [BOT DE DETECTOR]'}
              </div>
              <div style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                Sector: {hoveredNode.sector} | Bot Score: {hoveredNode.botScore}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Filters, Details & GNN logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Node Details Card */}
          <div className="inner-card" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '10px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
              <Sliders size={16} style={{ color: 'var(--neon-blue)' }} />
              Inspección de Nodo
            </h3>

            {selectedNode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '700', color: selectedNode.isBot ? 'var(--neon-rose)' : '#fff', fontSize: '0.9rem' }}>{selectedNode.label}</span>
                  <span className={`tag-badge`} style={{
                    background: selectedNode.isBot ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: selectedNode.isBot ? 'var(--neon-rose)' : 'var(--neon-emerald)',
                    borderColor: selectedNode.isBot ? 'var(--neon-rose)' : 'var(--neon-emerald)',
                    fontSize: '0.65rem',
                    padding: '0.1rem 0.4rem'
                  }}>
                    {selectedNode.isBot ? '🤖 BOT CLASIFICADO' : '🟢 HUMANO VERIFICADO'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>Sector Social:</span>
                    <strong style={{ color: '#fff' }}>{selectedNode.sector}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>Afinidad de Voto:</span>
                    <strong style={{ color: selectedNode.stance.includes('A') ? 'var(--neon-blue)' : 'var(--neon-purple)' }}>{selectedNode.stance}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>Centralidad de Grado:</span>
                    <strong style={{ color: '#fff' }}>{selectedNode.centrality}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>Bot Probability:</span>
                    <strong style={{ color: selectedNode.isBot ? 'var(--neon-rose)' : 'var(--neon-emerald)' }}>{(selectedNode.botScore * 100).toFixed(1)}%</strong>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-glass)', paddingTop: '0.5rem', marginTop: '0.25rem' }}>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem' }}>Análisis de Sentimiento NLP (BETO):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: `${((selectedNode.sentiment + 1) / 2) * 100}%`, 
                        height: '100%', 
                        background: selectedNode.sentiment > 0 ? 'var(--neon-emerald)' : 'var(--neon-rose)'
                      }}></div>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '700', color: selectedNode.sentiment > 0 ? 'var(--neon-emerald)' : 'var(--neon-rose)' }}>
                      {selectedNode.sentiment > 0 ? `+${selectedNode.sentiment}` : selectedNode.sentiment}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '1rem 0' }}>
                Haz clic en cualquier nodo de la esfera 3D para inspeccionar sus características de GNN y perfil demográfico.
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
              
              {/* Search label */}
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Buscar por cuenta/sector:</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    placeholder="Ej. @inf_bot_ o estudiantes"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="premium-input"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem 0.4rem 1.8rem', width: '100%' }}
                  />
                  <Search size={12} style={{ position: 'absolute', left: '8px', top: '11px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* Bot Probability Threshold Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  <span>Umbral de Bot Score (RoGBot):</span>
                  <strong style={{ color: minBotScore > 0.6 ? 'var(--neon-rose)' : 'var(--text-primary)' }}>&gt;= {minBotScore}</strong>
                </div>
                <input 
                  type="range" 
                  min="0.0" 
                  max="0.9" 
                  step="0.1" 
                  value={minBotScore}
                  onChange={(e) => setMinBotScore(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--neon-rose)' }}
                />
              </div>

              {/* Community select */}
              <div>
                <label style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.65rem', marginBottom: '0.25rem' }}>Filtrar por Comunidad (GCN Clusters):</label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => setSelectedCommunity(e.target.value)}
                  className="premium-input"
                  style={{ fontSize: '0.75rem', padding: '0.35rem', width: '100%' }}
                >
                  <option value="all">Todas las comunidades</option>
                  <option value="0">Comunidad 0 (Humana - Comerciantes)</option>
                  <option value="1">Comunidad 1 (Parcialmente automatizada)</option>
                  <option value="2">Comunidad 2 (Humana - Estudiantes)</option>
                  <option value="3">Comunidad 3 (Coordinación de Bots Detectada)</option>
                </select>
              </div>
            </div>
          </div>

          {/* GNN Status console logs */}
          <div style={{ flex: 1, background: '#020408', border: '1px solid var(--border-glass)', borderRadius: '10px', padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.65rem', maxHeight: '140px', overflowY: 'auto' }}>
            <div style={{ color: 'var(--neon-cyan)', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.3rem', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Cpu size={10} />
              GNN PIPELINE EXECUTION LOGS
            </div>
            
            {gnnLogs.map((log, idx) => (
              <div key={idx} style={{ color: log.includes('✅') ? 'var(--neon-emerald)' : log.includes('⚠️') ? 'var(--neon-rose)' : 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                {log}
              </div>
            ))}
            {gnnLogs.length === 0 && (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
                Esperando ejecución de clasificador GNN...
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer statistics bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', marginTop: '0.5rem' }} className="responsive-grid">
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Nodos Procesados</span>
          <strong style={{ fontSize: '1.2rem', color: '#fff' }}>85</strong>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Conexiones Totales</span>
          <strong style={{ fontSize: '1.2rem', color: '#fff' }}>148</strong>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Cuentas Sospechosas (Bot Score &gt; 0.6)</span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--neon-rose)' }}>28</strong>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Clusters Coordenados Detectados</span>
          <strong style={{ fontSize: '1.2rem', color: 'var(--neon-purple)' }}>1 (Comunidad 3)</strong>
        </div>
      </div>

    </div>
  );
}
