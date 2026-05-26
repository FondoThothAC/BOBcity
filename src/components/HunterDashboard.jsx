import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, 
  Terminal, 
  ShieldAlert, 
  Activity, 
  Globe, 
  Crosshair, 
  Clock, 
  CheckCircle,
  Database,
  Search,
  Network
} from 'lucide-react';

export default function HunterDashboard() {
  const [logs, setLogs] = useState([
    "[SYSTEM] Inicializando Agente Autónomo 'El Cazador' v3.4.1",
    "[PROXY] Cargando pool de proxies libres (Zmap, Nitter, Tor nodes)...",
    "[SYSTEM] Proxy Health: 98% (450/455 Activos). Status: GREEN.",
    "[OSINT] Escuchando Radar Macro-Eventos..."
  ]);
  
  const [huntQueue, setHuntQueue] = useState([
    { id: 1, name: "Marcus Chen", type: "Person", priority: "High", status: "ENRICHING", progress: 68 },
    { id: 2, name: "Quantum Tech Corp.", type: "Organization", priority: "Med", status: "SCRAPING", progress: 42 },
    { id: 3, name: "Cipher Solutions", type: "Organization", priority: "Med", status: "QUEUED", progress: 0 }
  ]);

  const [activeTarget, setActiveTarget] = useState(huntQueue[0]);

  // Mock Graph Data matching the generated image
  const [graphData, setGraphData] = useState({
    nodes: [
      { id: '1', name: 'M. Chen (TARGET 1)', val: 20, color: '#10B981', group: 1 },
      { id: '2', name: 'Quantum Tech Corp.', val: 15, color: '#3B82F6', group: 2 },
      { id: '3', name: 'Datacorp Inc.', val: 10, color: '#8B5CF6', group: 2 },
      { id: '4', name: 'J. Albright', val: 8, color: '#10B981', group: 1 },
      { id: '5', name: 'Cipher Solutions', val: 10, color: '#3B82F6', group: 2 },
      { id: '6', name: 'K. Tanaka', val: 8, color: '#10B981', group: 1 },
      { id: '7', name: 'R. Vance', val: 8, color: '#10B981', group: 1 }
    ],
    links: [
      { source: '1', target: '2', name: 'EMPLOYED_BY' },
      { source: '1', target: '3', name: 'LINKEDIN_CONNECTION' },
      { source: '1', target: '4', name: 'LINKEDIN_CONNECTION' },
      { source: '1', target: '5', name: 'ALIAS: tanaka_k' },
      { source: '1', target: '6', name: 'ALIAS: tanaeka_k' },
      { source: '1', target: '7', name: 'LINKEDIN_CONNECTION' },
      { source: '2', target: '5', name: 'PARTNERSHIP' }
    ]
  });

  const fgRef = useRef();

  // Simular live scraping logs
  useEffect(() => {
    const interval = setInterval(() => {
      const newLogs = [
        `[${new Date().toLocaleTimeString()}] <EL CAZADOR> Initializing Sherlock scan for m.chen...`,
        `[${new Date().toLocaleTimeString()}] [Sherlock] Found user m.chen on: Twitter, GitHub, Reddit...`,
        `[${new Date().toLocaleTimeString()}] [theHarvester] Extracting from quantumtech.com...`,
        `[${new Date().toLocaleTimeString()}] [theHarvester] 12 email addresses harvested for Quantum Tech...`
      ];
      const randomLog = newLogs[Math.floor(Math.random() * newLogs.length)];
      setLogs(prev => {
        const next = [...prev, randomLog];
        return next.length > 15 ? next.slice(next.length - 15) : next;
      });
      
      // Animar un poco el progreso
      setHuntQueue(prev => prev.map(t => {
        if (t.status === 'ENRICHING' || t.status === 'SCRAPING') {
          const newProg = Math.min(100, t.progress + Math.floor(Math.random() * 5));
          if (newProg === 100) t.status = 'COMPLETED';
          return { ...t, progress: newProg };
        }
        return t;
      }));

    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gridAutoRows: 'min-content',
      gap: '1.5rem',
      minHeight: '85vh',
      padding: '1rem',
      fontFamily: '"Outfit", sans-serif',
      color: '#E2E8F0',
      background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)'
    }}>

      {/* HEADER: Span 3 cols */}
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16, 185, 129, 0.2)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
            <Crosshair color="#10B981" size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', margin: 0, color: '#10B981', letterSpacing: '2px' }}>EL CAZADOR | OSINT AUTONOMOUS AGENT</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#94A3B8', marginTop: '0.2rem' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></span>
              SYSTEM ONLINE | AGENT ACTIVE | v3.4.1
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ color: '#94A3B8' }}>CPU: 28%</span>
            <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{ width: '28%', height: '100%', background: '#10B981', borderRadius: '2px' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ color: '#94A3B8' }}>NET: 1.2 GB/s</span>
            <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{ width: '75%', height: '100%', background: '#3B82F6', borderRadius: '2px' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ color: '#94A3B8' }}>DATA: 4 TB</span>
            <div style={{ width: '100px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
              <div style={{ width: '90%', height: '100%', background: '#8B5CF6', borderRadius: '2px' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: TARGET OVERVIEW */}
      <div style={{ gridColumn: '1 / 2', gridRow: '2 / 3', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '1.2rem', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1rem', color: '#10B981', margin: 0, borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={16} /> TARGET OVERVIEW
        </h3>
        
        <div style={{ marginTop: '0.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{activeTarget.name.toUpperCase()}</h2>
          <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>(TARGET {activeTarget.id})</span>
        </div>

        <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div><strong style={{ color: '#10B981' }}>Aliases:</strong><br/>m.chen1993, marcuschen</div>
          <div><strong style={{ color: '#10B981' }}>Socials:</strong><br/>quantum_hq@rg, marcuschen</div>
          <div><strong style={{ color: '#10B981' }}>Risk Level:</strong>
            <div style={{ width: '100%', height: '8px', background: 'linear-gradient(90deg, #10B981 0%, #EAB308 50%, #EF4444 100%)', borderRadius: '4px', marginTop: '0.2rem', position: 'relative' }}>
              <div style={{ position: 'absolute', left: '75%', top: '-2px', width: '4px', height: '12px', background: 'white', borderRadius: '2px' }}></div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <h4 style={{ fontSize: '0.85rem', color: '#10B981', marginBottom: '0.5rem' }}>Raw Data Extract:</h4>
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontFamily: 'monospace', color: '#94A3B8' }}>
            {"{"} <br/>
            &nbsp;&nbsp;"email": "m.chen@quantum.com",<br/>
            &nbsp;&nbsp;"pwned": true,<br/>
            &nbsp;&nbsp;"breaches": ["LinkedIn 2012", "Canva"]<br/>
            {"}"}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: GRAPH AND PROXY */}
      <div style={{ gridColumn: '2 / 3', gridRow: '2 / 3', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Proxy Health */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(10px)', display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1rem', color: '#10B981', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Globe size={16} /> PROXY HEALTH & IP ROTATION
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div><strong style={{ color: '#94A3B8' }}>STATUS:</strong> <span style={{ color: '#10B981' }}>GREEN - ALL OK</span></div>
              <div><strong style={{ color: '#94A3B8' }}>CURRENT IP:</strong> 185.122.45.19 (NL)</div>
              <div><strong style={{ color: '#94A3B8' }}>ROTATION:</strong> 5 MINS (Next in 2:48)</div>
              <div><strong style={{ color: '#94A3B8' }}>PROXIES:</strong> 450/455 ACTIVE</div>
            </div>
          </div>
          {/* Faux Map Visual */}
          <div style={{ width: '200px', height: '100px', background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
             {/* Some fake nodes on map */}
             <div style={{ position: 'absolute', top: '30%', left: '20%', width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></div>
             <div style={{ position: 'absolute', top: '40%', left: '50%', width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></div>
             <div style={{ position: 'absolute', top: '60%', left: '70%', width: '6px', height: '6px', background: '#10B981', borderRadius: '50%', boxShadow: '0 0 10px #10B981' }}></div>
             <div style={{ position: 'absolute', top: '45%', left: '80%', width: '6px', height: '6px', background: '#EF4444', borderRadius: '50%', boxShadow: '0 0 10px #EF4444' }}></div>
          </div>
        </div>

        {/* Network Graph */}
        <div style={{ flex: 1, background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '1rem', backdropFilter: 'blur(10px)', position: 'relative', overflow: 'hidden' }}>
          <h3 style={{ fontSize: '1rem', color: '#10B981', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'absolute', zIndex: 10 }}>
            <Network size={16} /> TARGET NETWORK GRAPH
          </h3>
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, textAlign: 'right', fontSize: '0.85rem', color: '#94A3B8' }}>
            Nodes: 147<br/>
            Edges: 389<br/>
            Depth: 5
          </div>
          
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <svg width="100%" height="100%" viewBox="0 0 600 350" style={{ cursor: 'crosshair' }}>
              {/* Edges */}
              <line x1="300" y1="175" x2="450" y2="100" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" />
              <line x1="300" y1="175" x2="200" y2="120" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" />
              <line x1="300" y1="175" x2="500" y2="175" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" />
              <line x1="300" y1="175" x2="400" y2="280" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" />
              <line x1="300" y1="175" x2="250" y2="260" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" />
              <line x1="450" y1="100" x2="400" y2="280" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1" strokeDasharray="4 4"/>
              
              {/* Nodes */}
              {/* Center Target */}
              <circle cx="300" cy="175" r="25" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
              <circle cx="300" cy="175" r="15" fill="#10B981" />
              <text x="300" y="215" fill="#10B981" fontSize="12" textAnchor="middle" fontWeight="bold">M. Chen (TARGET 1)</text>
              
              {/* Quantum Tech */}
              <circle cx="450" cy="100" r="20" fill="#3B82F6" fillOpacity="0.2" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="450" cy="100" r="10" fill="#3B82F6" />
              <text x="450" y="135" fill="#3B82F6" fontSize="11" textAnchor="middle">Quantum Tech Corp.</text>
              <text x="375" y="125" fill="#94A3B8" fontSize="9" textAnchor="middle" transform="rotate(-25 375 125)">EMPLOYED_BY</text>
              
              {/* Datacorp */}
              <circle cx="200" cy="120" r="18" fill="#8B5CF6" fillOpacity="0.2" stroke="#8B5CF6" strokeWidth="2" />
              <circle cx="200" cy="120" r="8" fill="#8B5CF6" />
              <text x="200" y="150" fill="#8B5CF6" fontSize="11" textAnchor="middle">Datacorp Inc.</text>
              
              {/* J Albright */}
              <circle cx="500" cy="175" r="14" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
              <circle cx="500" cy="175" r="6" fill="#10B981" />
              <text x="500" y="200" fill="#E2E8F0" fontSize="11" textAnchor="middle">J. Albright</text>
              
              {/* K Tanaka */}
              <circle cx="400" cy="280" r="16" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
              <circle cx="400" cy="280" r="8" fill="#10B981" />
              <text x="400" y="310" fill="#E2E8F0" fontSize="11" textAnchor="middle">K. Tanaka</text>
              <text x="350" y="220" fill="#94A3B8" fontSize="9" textAnchor="middle" transform="rotate(45 350 220)">ALIAS: tanaka_k</text>

              {/* R Vance */}
              <circle cx="250" cy="260" r="14" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="2" />
              <circle cx="250" cy="260" r="6" fill="#10B981" />
              <text x="250" y="285" fill="#E2E8F0" fontSize="11" textAnchor="middle">R. Vance</text>
            </svg>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: HUNT QUEUE */}
      <div style={{ gridColumn: '3 / 4', gridRow: '2 / 3', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '12px', padding: '1.2rem', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', color: '#10B981', margin: 0, borderBottom: '1px solid rgba(16,185,129,0.2)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Target size={16} /> HUNT QUEUE</div>
          <span style={{ fontSize: '0.75rem', color: '#10B981' }}>Status: Active</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
          {huntQueue.map(target => (
            <div 
              key={target.id}
              onClick={() => setActiveTarget(target)}
              style={{ 
                background: activeTarget.id === target.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0,0,0,0.3)', 
                border: `1px solid ${activeTarget.id === target.id ? '#10B981' : 'rgba(255,255,255,0.1)'}`, 
                borderRadius: '8px', 
                padding: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem', color: 'white' }}>{target.name}</strong>
                <span style={{ color: target.priority === 'High' ? '#EF4444' : '#EAB308', fontWeight: 'bold' }}>
                  {target.priority === 'High' ? 'H' : 'M'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '0.5rem' }}>
                PRIORITY: <span style={{ color: target.priority === 'High' ? '#EF4444' : '#EAB308' }}>{target.priority.toUpperCase()}</span> | STATUS: {target.status} - {target.progress}%
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                <div style={{ width: `${target.progress}%`, height: '100%', background: target.progress === 100 ? '#3B82F6' : '#10B981', borderRadius: '2px', transition: 'width 1s ease' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM SPAN: LIVE LOGS */}
      <div style={{ gridColumn: '1 / -1', gridRow: '3 / 4', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ fontSize: '1rem', color: '#10B981', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Terminal size={16} /> LIVE SCRAPING LOGS
        </h3>
        <div style={{ flex: 1, overflowY: 'auto', background: '#020617', padding: '1rem', borderRadius: '8px', fontFamily: '"Fira Code", monospace', fontSize: '0.85rem', color: '#34D399', border: '1px solid rgba(255,255,255,0.05)' }}>
          {logs.map((log, i) => (
            <div key={i} style={{ marginBottom: '0.25rem', whiteSpace: 'pre-wrap' }}>{log}</div>
          ))}
        </div>
      </div>
      
    </div>
  );
}
