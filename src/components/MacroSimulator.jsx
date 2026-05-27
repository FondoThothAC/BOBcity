import React, { useState, useEffect } from 'react';
import { simulateMultiCandidateElection } from '../models/dataModel';
import { Shield, TrendingUp, AlertTriangle, Users } from 'lucide-react';

export default function MacroSimulator() {
  const [macroRaces, setMacroRaces] = useState([]);
  const [isSimulatingMacro, setIsSimulatingMacro] = useState(false);
  const [summary, setSummary] = useState(null);

  // Paleta de partidos comunes para colores de UI
  const PARTIDOS = [
    { id: 'MORENA', name: 'Oficialismo (4T)', baseColor: '#7f1d1d' }, // Guinda
    { id: 'PAN', name: 'Oposición Conservadora', baseColor: '#1e3a8a' }, // Azul
    { id: 'MC', name: 'Movimiento Naranja', baseColor: '#d97706' }, // Naranja
    { id: 'PRI', name: 'Oposición Tradicional', baseColor: '#166534' }, // Verde Bandera
    { id: 'PVEM', name: 'Coalición Verde', baseColor: '#84cc16' }, // Verde Claro
    { id: 'IND', name: 'Candidatura Independiente', baseColor: '#6b7280' } // Gris
  ];

  const generateMassiveCatalog = () => {
    const types = ["Alcaldía", "Senaduría", "Diputación Fed.", "Diputación Loc."];
    const states = ["Sonora", "Nuevo León", "Jalisco", "Edomex", "Veracruz", "CDMX", "Chihuahua"];
    const catalog = [];
    
    // Generar 200 contiendas de muestra
    for(let i=1; i<=200; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const isCritical = Math.random() > 0.85; // 15% son críticas
      
      // Decidir cuántos candidatos compiten (entre 2 y 6)
      const numCandidates = Math.floor(Math.random() * 5) + 2; 
      
      const candidatesArray = [];
      const usedParties = new Set();
      
      // Asegurarnos de que siempre esté Oficialismo y la principal Oposición
      let availableParties = [...PARTIDOS];
      
      for(let j=0; j<numCandidates; j++) {
        // Seleccionar partido único
        const pIndex = Math.floor(Math.random() * availableParties.length);
        const party = availableParties[pIndex];
        availableParties.splice(pIndex, 1); // Remover para no repetir
        
        candidatesArray.push({
          id: `${party.id}_${i}`,
          name: party.name,
          color: party.baseColor,
          // Encuesta base simulada (10 a 40 puntos base antes de modelar utilidades)
          baseSupport: Math.floor(Math.random() * 30) + 10, 
          experienceYears: Math.floor(Math.random() * 20),
          proposalMatch: Math.floor(Math.random() * 60) + 40
        });
      }
      
      catalog.push({
        id: `RACE_MACRO_${i}`,
        title: `${type} - Dto/Mpio ${i} (${state})`,
        isCritical,
        candidates: candidatesArray,
        results: null, // Se llena con la simulación
        riskLevel: 'PENDING'
      });
    }
    setMacroRaces(catalog);
  };

  useEffect(() => {
    generateMassiveCatalog();
  }, []);

  const runMacroSimulation = () => {
    setIsSimulatingMacro(true);
    
    setTimeout(() => {
      let seguroCount = 0;
      let tossUpCount = 0;
      let lossCount = 0;

      const simulatedRaces = macroRaces.map(race => {
        // Ejecutamos el modelo multi-candidato Softmax
        const results = simulateMultiCandidateElection(race.candidates, 15);
        
        // Identificar al líder y su ventaja
        const leader = results[0];
        const isOficialismoLeading = leader.name.includes("Oficialismo");
        const spread = leader.spread; // Ej. 4.5
        
        // Clasificación de Riesgo basada en el margen de victoria (spread)
        let riskLevel = "SEGURO";
        if (!isOficialismoLeading && spread > 5) {
          riskLevel = "PERDIDA_INMINENTE";
          lossCount++;
        } else if (!isOficialismoLeading && spread <= 5) {
          riskLevel = "TOSS_UP"; // Oposición lidera pero por poco
          tossUpCount++;
        } else if (isOficialismoLeading && spread <= 5) {
          riskLevel = "TOSS_UP"; // Oficialismo lidera pero por empate técnico
          tossUpCount++;
        } else {
          riskLevel = "SEGURO"; // Oficialismo lidera cómodamente
          seguroCount++;
        }
        
        return { ...race, results, riskLevel, leader };
      });
      
      // Ordenamiento Táctico: 
      // 1. Pérdidas inminentes
      // 2. Toss-Up (empatados)
      // 3. Seguros
      simulatedRaces.sort((a, b) => {
        const riskOrder = { "PERDIDA_INMINENTE": 1, "TOSS_UP": 2, "SEGURO": 3 };
        return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
      });

      setMacroRaces(simulatedRaces);
      setSummary({ seguro: seguroCount, tossUp: tossUpCount, loss: lossCount, total: simulatedRaces.length });
      setIsSimulatingMacro(false);
      
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: `Macro-Simulación completada. ${tossUpCount} distritos en empate técnico.`, type: "warning" }
      }));
    }, 1200);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="glass-card" style={{ padding: '2rem', borderTop: '2px solid var(--neon-emerald)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Shield size={24} className="neon-icon" style={{ color: 'var(--neon-emerald)' }} />
              Macro-Simulador: Percepción Ciudadana Masiva
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: '700px' }}>
              Procesa en paralelo la intención de voto para múltiples entidades usando el modelo N-Way Softmax. 
              Mide la fragmentación del voto entre 2 a 6 candidatos reales y extrae el diferencial de puntos (Spread) del líder para detectar empates técnicos (Toss-Ups) al instante.
            </p>
          </div>
          
          <button 
            onClick={runMacroSimulation} 
            disabled={isSimulatingMacro}
            className="btn-premium"
            style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
              opacity: isSimulatingMacro ? 0.6 : 1,
              padding: '0.8rem 1.5rem',
              fontSize: '0.95rem'
            }}
          >
            {isSimulatingMacro ? "Procesando Lote Nacional..." : "Ejecutar Macro-Simulación (200 Entidades)"}
          </button>
        </div>

        {/* Resumen Táctico (Sólo visible si ya se simuló) */}
        {summary && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--neon-emerald)' }}>{summary.seguro}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Dominio Seguro</div>
            </div>
            
            <div style={{ flex: 1, minWidth: '200px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--neon-amber)' }}>{summary.tossUp}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Toss-Up (Empate Técnico)</div>
            </div>

            <div style={{ flex: 1, minWidth: '200px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '1.25rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--neon-rose)' }}>{summary.loss}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Pérdida Proyectada</div>
            </div>
          </div>
        )}
      </div>

      {/* Data Grid Tabla */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ 
          background: 'rgba(0,0,0,0.4)', 
          overflowX: 'auto',
          maxHeight: '600px',
          overflowY: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', position: 'sticky', top: 0, backdropFilter: 'blur(10px)', zIndex: 10 }}>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', width: '25%' }}>Entidad Electoral</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', width: '45%' }}>Radiografía Multi-Candidato (N-Way Softmax)</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', width: '15%' }}>Líder y Margen (Spread)</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', width: '15%' }}>Estatus Táctico</th>
              </tr>
            </thead>
            <tbody>
              {macroRaces.map((race) => (
                <tr key={race.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                  
                  {/* Columna: Entidad */}
                  <td style={{ padding: '1.25rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      {race.isCritical ? 
                        <AlertTriangle size={16} color="var(--neon-amber)" /> : 
                        <Users size={16} color="var(--text-muted)" />
                      }
                      <span style={{ fontWeight: '700', color: '#fff' }}>{race.title}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem', marginLeft: '1.7rem' }}>
                      {race.candidates.length} candidaturas locales
                    </div>
                  </td>
                  
                  {/* Columna: Radiografía Múltiple (Barras apiladas o lista) */}
                  <td style={{ padding: '1.25rem 1rem' }}>
                    {race.results ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {/* Barras Visuales de fragmentación */}
                        <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                          {race.results.map(c => (
                            <div key={c.id} style={{ width: `${c.winProbability}%`, background: c.color, borderRight: '1px solid rgba(0,0,0,0.5)' }}></div>
                          ))}
                        </div>
                        {/* Leyenda pequeña */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', fontSize: '0.7rem' }}>
                          {race.results.slice(0,3).map((c, i) => (
                            <span key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', opacity: i===0 ? 1 : 0.7 }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color }}></span>
                              <strong style={{ color: '#fff' }}>{c.winProbability}%</strong> {c.name.split(' ')[0]}
                            </span>
                          ))}
                          {race.results.length > 3 && <span style={{ color: 'var(--text-muted)' }}>+ {race.results.length - 3} más</span>}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Requiere simulación para modelar a {race.candidates.length} candidatos...</span>
                    )}
                  </td>
                  
                  {/* Columna: Spread / Diferencia */}
                  <td style={{ padding: '1.25rem 1rem' }}>
                     {race.results && race.leader ? (
                       <div>
                         <div style={{ fontWeight: '800', color: race.leader.color, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                           {race.leader.spread > 0 ? `+${race.leader.spread} pts` : `${race.leader.spread} pts`}
                         </div>
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                           Diferencia de <strong>{race.leader.name.split(' ')[0]}</strong> sobre el segundo lugar.
                         </div>
                       </div>
                     ) : (
                       <span style={{ color: 'var(--text-muted)' }}>-</span>
                     )}
                  </td>

                  {/* Columna: Estatus Táctico */}
                  <td style={{ padding: '1.25rem 1rem' }}>
                    {race.results && (
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.35rem 0.6rem', 
                        borderRadius: '6px', 
                        fontSize: '0.7rem', 
                        fontWeight: '800',
                        letterSpacing: '0.05em',
                        background: race.riskLevel === 'SEGURO' ? 'rgba(16, 185, 129, 0.15)' : race.riskLevel === 'TOSS_UP' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: race.riskLevel === 'SEGURO' ? 'var(--neon-emerald)' : race.riskLevel === 'TOSS_UP' ? 'var(--neon-amber)' : 'var(--neon-rose)',
                        border: '1px solid',
                        borderColor: race.riskLevel === 'SEGURO' ? 'rgba(16, 185, 129, 0.3)' : race.riskLevel === 'TOSS_UP' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                      }}>
                        {race.riskLevel === 'SEGURO' ? '🟢 SEGURO' : race.riskLevel === 'TOSS_UP' ? '🟡 TOSS-UP' : '🔴 PÉRDIDA'}
                      </span>
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
