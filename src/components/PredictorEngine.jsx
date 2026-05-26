import React, { useState, useEffect } from 'react';
import { calculateElectionProbability } from '../models/dataModel';
import { Shield, Award, Landmark, HelpCircle, CheckCircle, TrendingUp, User, Vote } from 'lucide-react';

export default function PredictorEngine({ agents }) {
  // Parámetros de los candidatos configurables
  const [candidateA, setCandidateA] = useState({
    name: "Lic. Claudia Rivera (Morena/Social)",
    experienceYears: 12,
    gender: "Femenino",
    proposalMatch: 82 // Coherencia cívica
  });

  const [candidateB, setCandidateB] = useState({
    name: "Ing. Manuel Astiazarán (PAN/Conservador)",
    experienceYears: 8,
    gender: "Masculino",
    proposalMatch: 74
  });

  const [electionResult, setElectionResult] = useState({
    votesPercentA: 52,
    votesPercentB: 48,
    winProbabilityA: 65,
    winProbabilityB: 35
  });

  // Re-calcular la probabilidad electoral cada vez que cambien los perfiles o los agentes
  useEffect(() => {
    const result = calculateElectionProbability(agents, { candidateA, candidateB });
    setElectionResult(result);
  }, [candidateA, candidateB, agents]);

  // Contar votos reales por distrito (mapeados desde los códigos postales de la población sintética de Hermosillo)
  const getVotesByDistrict = () => {
    // Si no hay agentes, regresamos distritos simulados por defecto
    if (!agents || agents.length === 0) {
      return [
        { id: "D6", name: "Distrito 6 (Norte - Pitic)", A: 50, B: 50 },
        { id: "D8", name: "Distrito 8 (Sur - Palo Verde)", A: 50, B: 50 },
        { id: "D9", name: "Distrito 9 (Poniente y Centro)", A: 50, B: 50 }
      ];
    }

    const d6 = agents.filter(a => a.districtId === "CP_83150" || a.districtId === "CP_83100");
    const d8 = agents.filter(a => a.districtId === "CP_83280" || a.districtId === "CP_83240");
    const d9 = agents.filter(a => a.districtId === "CP_83200");

    const voteShare = (list) => {
      if (list.length === 0) return 50;
      const vA = list.filter(a => a.voteIntention === "Candidato_A").length;
      return Math.round((vA / list.length) * 100);
    };

    return [
      { id: "D6", name: "Distrito 6 (Norte - Pitic y San Benito)", A: voteShare(d6), B: 100 - voteShare(d6) },
      { id: "D8", name: "Distrito 8 (Sur - Palo Verde y Altares)", A: voteShare(d8), B: 100 - voteShare(d8) },
      { id: "D9", name: "Distrito 9 (Poniente y Centro Histórico)", A: voteShare(d9), B: 100 - voteShare(d9) }
    ];
  };

  const districtVotes = getVotesByDistrict();
  
  // ==========================================
  // LÓGICA DE MACRO-SIMULACIÓN (TABLERO MASIVO)
  // ==========================================
  const [macroRaces, setMacroRaces] = useState([]);
  const [isSimulatingMacro, setIsSimulatingMacro] = useState(false);

  // Generador de contiendas simuladas (Senadurías, Alcaldías, Diputaciones)
  const generateMassiveCatalog = () => {
    const types = ["Alcaldía", "Senaduría", "Diputación Fed.", "Diputación Loc."];
    const states = ["Sonora", "Nuevo León", "Jalisco", "Edomex", "Veracruz", "CDMX"];
    const catalog = [];
    
    // Generar 125 contiendas de muestra (para no congelar el navegador, aunque representa miles)
    for(let i=1; i<=125; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const state = states[Math.floor(Math.random() * states.length)];
      const isCritical = Math.random() > 0.8;
      
      catalog.push({
        id: `RACE_${i}`,
        title: `${type} - Distrito/Mpio ${i} (${state})`,
        isCritical,
        // Asignamos atributos base aleatorios a los candidatos en esta región
        candidateA: { name: "Incumbente Oficial", experienceYears: Math.floor(Math.random()*15)+2, proposalMatch: Math.floor(Math.random()*40)+40 },
        candidateB: { name: "Oposición Unida", experienceYears: Math.floor(Math.random()*15)+2, proposalMatch: Math.floor(Math.random()*40)+40 },
        // Resultados se llenan al simular
        result: null 
      });
    }
    setMacroRaces(catalog);
  };

  useEffect(() => {
    generateMassiveCatalog();
  }, []);

  const runMacroSimulation = () => {
    setIsSimulatingMacro(true);
    
    // Simular retraso para efecto dramático / batch processing feeling
    setTimeout(() => {
      const simulatedRaces = macroRaces.map(race => {
        // Ejecutamos el motor base para cada contienda en paralelo (aprovechando los agentes locales)
        const res = calculateElectionProbability(agents, { candidateA: race.candidateA, candidateB: race.candidateB });
        
        // Clasificar nivel de riesgo para el Incumbente
        let riskLevel = "SEGURO";
        if (res.winProbabilityA < 45) riskLevel = "PERDIDA_INMINENTE";
        else if (res.winProbabilityA <= 55) riskLevel = "TOSS_UP"; // Competitivo/Volátil
        
        return { ...race, result: res, riskLevel };
      });
      
      // Ordenar: primero los Toss-Up y Pérdidas Críticas
      simulatedRaces.sort((a, b) => {
        if (a.riskLevel === b.riskLevel) return 0;
        if (a.riskLevel === "PERDIDA_INMINENTE") return -1;
        if (b.riskLevel === "PERDIDA_INMINENTE") return 1;
        if (a.riskLevel === "TOSS_UP") return -1;
        return 1;
      });

      setMacroRaces(simulatedRaces);
      setIsSimulatingMacro(false);
      
      window.dispatchEvent(new CustomEvent('civic-toast', {
        detail: { message: "Macro-Simulación completada en 125 contiendas clave.", type: "success" }
      }));
    }, 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Selector de Perfiles del Candidato */}
      <div className="glass-card glow-purple" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '800', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Landmark size={22} className="neon-icon" style={{ color: 'var(--neon-purple)' }} />
          Configurador de Perfiles Electorales (Duelo Cara a Cara)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.75rem' }}>
          Ajusta la experiencia ejecutiva y la solidez ideológica de las candidaturas para calibrar el comportamiento del modelo matemático en tiempo real.
        </p>

        <div className="workspace-grid-1-1" style={{ gap: '1.5rem' }}>
          
          {/* Perfil Candidato A */}
          <div style={{ 
            background: 'rgba(59, 130, 246, 0.03)', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: '1px solid rgba(59, 130, 246, 0.15)',
            boxShadow: 'inset 0 0 15px rgba(59, 130, 246, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.2rem' }}>👩‍💼</span>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--neon-blue)', fontWeight: '800', margin: 0 }}>
                Incumbente / Línea Social
              </h3>
            </div>
            
            <div className="slider-group" style={{ marginBottom: '1.25rem' }}>
              <div className="slider-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Experiencia Gubernamental</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{candidateA.experienceYears} Años</span>
              </div>
              <input 
                type="range" 
                className="premium-slider" 
                min="0" 
                max="25" 
                value={candidateA.experienceYears}
                onChange={(e) => setCandidateA({ ...candidateA, experienceYears: parseInt(e.target.value) })}
                style={{ accentColor: 'var(--neon-blue)', width: '100%' }}
              />
            </div>

            <div className="slider-group">
              <div className="slider-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Coherencia Discurso (Propuestas)</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{candidateA.proposalMatch}%</span>
              </div>
              <input 
                type="range" 
                className="premium-slider" 
                min="40" 
                max="100" 
                value={candidateA.proposalMatch}
                onChange={(e) => setCandidateA({ ...candidateA, proposalMatch: parseInt(e.target.value) })}
                style={{ accentColor: 'var(--neon-blue)', width: '100%' }}
              />
            </div>
          </div>

          {/* Perfil Candidato B */}
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.03)', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: '1px solid rgba(239, 68, 68, 0.15)',
            boxShadow: 'inset 0 0 15px rgba(239, 68, 68, 0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '1.2rem' }}>👨‍💼</span>
              <h3 style={{ fontSize: '0.95rem', color: 'var(--neon-rose)', fontWeight: '800', margin: 0 }}>
                Oposición / Línea Comercial
              </h3>
            </div>
            
            <div className="slider-group" style={{ marginBottom: '1.25rem' }}>
              <div className="slider-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Experiencia Gubernamental</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{candidateB.experienceYears} Años</span>
              </div>
              <input 
                type="range" 
                className="premium-slider" 
                min="0" 
                max="25" 
                value={candidateB.experienceYears}
                onChange={(e) => setCandidateB({ ...candidateB, experienceYears: parseInt(e.target.value) })}
                style={{ accentColor: 'var(--neon-rose)', width: '100%' }}
              />
            </div>

            <div className="slider-group">
              <div className="slider-label" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                <span>Coherencia Discurso (Propuestas)</span>
                <span style={{ color: '#fff', fontWeight: 'bold' }}>{candidateB.proposalMatch}%</span>
              </div>
              <input 
                type="range" 
                className="premium-slider" 
                min="40" 
                max="100" 
                value={candidateB.proposalMatch}
                onChange={(e) => setCandidateB({ ...candidateB, proposalMatch: parseInt(e.target.value) })}
                style={{ accentColor: 'var(--neon-rose)', width: '100%' }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Arena de Duelo (Enfrentamiento y Probabilidades) */}
      <div className="duel-card" style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.65) 0%, rgba(30, 41, 59, 0.45) 100%)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-glass)',
        padding: '2.5rem 2rem',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Lado A */}
        <div className="duel-side" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', width: '40%', textAlign: 'center' }}>
          <div className="candidate-avatar blue" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', border: '2px solid var(--neon-blue)', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>👩‍💼</div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: 0 }}>{candidateA.name}</h3>
          
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voto Directo Real</span>
            <div style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--neon-blue)', textShadow: '0 0 10px rgba(59,130,246,0.3)' }}>{electionResult.votesPercentA}%</div>
          </div>

          <div style={{ 
            background: 'rgba(59, 130, 246, 0.08)', 
            padding: '0.4rem 1.2rem', 
            borderRadius: '50px', 
            border: '1px solid rgba(59, 130, 246, 0.25)',
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.1)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={14} style={{ color: 'var(--neon-blue)' }} />
              Probabilidad Victoria: {electionResult.winProbabilityA}%
            </span>
          </div>
        </div>

        {/* VS */}
        <div className="duel-vs" style={{ 
          fontSize: '1.4rem', 
          fontWeight: '900', 
          background: 'linear-gradient(135deg, var(--neon-blue) 0%, var(--neon-rose) 100%)', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          padding: '0.8rem', 
          borderRadius: '50%',
          border: '1px solid var(--border-glass)',
          backgroundClip: 'text',
          boxShadow: '0 0 15px rgba(255, 255, 255, 0.05)',
          zIndex: 2
        }}>VS</div>

        {/* Lado B */}
        <div className="duel-side" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', width: '40%', textAlign: 'center' }}>
          <div className="candidate-avatar red" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.2rem', border: '2px solid var(--neon-rose)', boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)' }}>👨‍💼</div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fff', margin: 0 }}>{candidateB.name}</h3>
          
          <div style={{ marginTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Voto Directo Real</span>
            <div style={{ fontSize: '2.8rem', fontWeight: '900', color: 'var(--neon-rose)', textShadow: '0 0 10px rgba(239,68,68,0.3)' }}>{electionResult.votesPercentB}%</div>
          </div>

          <div style={{ 
            background: 'rgba(239, 68, 68, 0.08)', 
            padding: '0.4rem 1.2rem', 
            borderRadius: '50px', 
            border: '1px solid rgba(239, 68, 68, 0.25)',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.1)'
          }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <TrendingUp size={14} style={{ color: 'var(--neon-rose)' }} />
              Probabilidad Victoria: {electionResult.winProbabilityB}%
            </span>
          </div>
        </div>

      </div>

      {/* Rationale de IA & Desglose por Distrito */}
      <div className="workspace-grid-2" style={{ gap: '1.5rem' }}>
        
        {/* Rationale Explicable (XAI) */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} color="var(--neon-emerald)" />
            Causalidades Electorales Proyectadas
          </h3>

          <div className="info-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ color: 'var(--neon-blue)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Fortaleza Territorial del Incumbente (A):</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', margin: 0 }}>
                Lidera principalmente en los sectores de Jóvenes y Hogares Asalariados debido a la satisfacción con las políticas de subsidios e inversión en la red de agua. Su ventaja es muy sólida en el Distrito 8 (Sur).
              </p>
            </div>

            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <strong style={{ color: 'var(--neon-rose)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Fortaleza Territorial de la Oposición (B):</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', margin: 0 }}>
                Consolida el voto del sector de Pequeños Comerciantes. Resuena fuertemente su discurso contra los incrementos al impuesto comercial, liderando en el Distrito 9 (Centro) y secciones del Distrito 6 (Pitic).
              </p>
            </div>

            <div>
              <strong style={{ color: 'var(--neon-amber)', fontSize: '0.85rem', display: 'block', marginBottom: '0.2rem' }}>Efecto de la Experiencia y Propuestas (XAI):</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4', margin: 0 }}>
                La variación de los atributos del candidato simula un ajuste de la ponderación psicológica de los electores indecisos. Una mayor coherencia ideológica (discurso) estabiliza la simpatía del CP e incrementa el voto leal.
              </p>
            </div>
          </div>
        </div>

        {/* Desglose por Distrito de Hermosillo */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Vote size={18} style={{ color: 'var(--neon-blue)' }} />
            Desglose de Preferencias por Distrito Real
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            {districtVotes.map((district) => (
              <div key={district.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '700' }}>
                  <span style={{ color: '#fff' }}>{district.name}</span>
                  <span>
                    <strong style={{ color: 'var(--neon-blue)' }}>A: {district.A}%</strong> | <strong style={{ color: 'var(--neon-rose)' }}>B: {district.B}%</strong>
                  </span>
                </div>
                {/* Bar Stacked */}
                <div style={{ display: 'flex', height: '12px', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ 
                    width: `${district.A}%`, 
                    background: 'linear-gradient(90deg, #1e3a8a 0%, var(--neon-blue) 100%)',
                    transition: 'width 0.4s ease'
                  }}></div>
                  <div style={{ 
                    width: `${district.B}%`, 
                    background: 'linear-gradient(90deg, var(--neon-rose) 0%, #7f1d1d 100%)',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ==============================================
          TABLERO MASIVO (MACRO-SIMULADOR ELECTORAL)
          ============================================== */}
      <div className="glass-card" style={{ padding: '2rem', borderTop: '2px solid var(--neon-purple)', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Shield size={22} className="neon-icon" style={{ color: 'var(--neon-emerald)' }} />
              Tablero de Riesgo Electoral (Macro-Simulación)
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Procesamiento en lote (Batch) de cientos de Senadurías, Alcaldías y Diputaciones usando el modelo ABM.
            </p>
          </div>
          
          <button 
            onClick={runMacroSimulation} 
            disabled={isSimulatingMacro}
            className="btn-premium"
            style={{ 
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
              opacity: isSimulatingMacro ? 0.6 : 1
            }}
          >
            {isSimulatingMacro ? "Simulando en Lote..." : "Ejecutar Macro-Simulación Masiva"}
          </button>
        </div>

        {/* Data Grid Tabla */}
        <div style={{ 
          background: 'rgba(0,0,0,0.4)', 
          border: '1px solid var(--border-glass)', 
          borderRadius: '12px',
          overflowX: 'auto',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)', position: 'sticky', top: 0, backdropFilter: 'blur(10px)', zIndex: 10 }}>
              <tr>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Contienda Electoral</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Probabilidad de Victoria (Incumbente)</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Estatus / Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {macroRaces.map((race) => (
                <tr key={race.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {race.isCritical && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-amber)', display: 'inline-block', boxShadow: '0 0 8px var(--neon-amber)' }}></span>}
                      <span style={{ fontWeight: '700', color: '#fff' }}>{race.title}</span>
                    </div>
                  </td>
                  
                  <td style={{ padding: '1rem' }}>
                    {race.result ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '40px', fontWeight: 'bold', color: race.result.winProbabilityA > 50 ? 'var(--neon-blue)' : 'var(--neon-rose)' }}>
                          {race.result.winProbabilityA}%
                        </span>
                        {/* Progress Bar Mini */}
                        <div style={{ width: '100px', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${race.result.winProbabilityA}%`, height: '100%', background: race.result.winProbabilityA > 50 ? 'var(--neon-blue)' : 'var(--neon-rose)' }}></div>
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Esperando simulación...</span>
                    )}
                  </td>
                  
                  <td style={{ padding: '1rem' }}>
                    {race.result && (
                      <span style={{ 
                        padding: '0.25rem 0.6rem', 
                        borderRadius: '4px', 
                        fontSize: '0.7rem', 
                        fontWeight: '700',
                        letterSpacing: '0.05em',
                        background: race.riskLevel === 'SEGURO' ? 'rgba(16, 185, 129, 0.15)' : race.riskLevel === 'TOSS_UP' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: race.riskLevel === 'SEGURO' ? 'var(--neon-emerald)' : race.riskLevel === 'TOSS_UP' ? 'var(--neon-amber)' : 'var(--neon-rose)',
                        border: '1px solid',
                        borderColor: race.riskLevel === 'SEGURO' ? 'rgba(16, 185, 129, 0.3)' : race.riskLevel === 'TOSS_UP' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                      }}>
                        {race.riskLevel === 'SEGURO' ? '🟢 DOMINIO SEGURO' : race.riskLevel === 'TOSS_UP' ? '🟡 TOSS-UP (VOLÁTIL)' : '🔴 RIESGO DE PÉRDIDA'}
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
