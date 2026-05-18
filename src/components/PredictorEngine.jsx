import React, { useState, useEffect } from 'react';
import { calculateElectionProbability } from '../models/dataModel';
import { Shield, Award, Landmark, HelpCircle, CheckCircle } from 'lucide-react';

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

  // Contar votos por distrito
  const getVotesByDistrict = () => {
    const d6 = agents.filter(a => a.districtId === "D6_NORTE");
    const d8 = agents.filter(a => a.districtId === "D8_SUR");
    const d9 = agents.filter(a => a.districtId === "D9_CENTRO");

    const voteShare = (list) => {
      const vA = list.filter(a => a.voteIntention === "Candidato_A").length;
      return list.length === 0 ? 50 : Math.round((vA / list.length) * 100);
    };

    return [
      { id: "D6", name: "Distrito 6 (Norte)", A: voteShare(d6), B: 100 - voteShare(d6) },
      { id: "D8", name: "Distrito 8 (Sur)", A: voteShare(d8), B: 100 - voteShare(d8) },
      { id: "D9", name: "Distrito 9 (Centro)", A: voteShare(d9), B: 100 - voteShare(d9) }
    ];
  };

  const districtVotes = getVotesByDistrict();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Selector de Perfiles del Candidato */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Landmark size={18} color="var(--neon-blue)" />
          Configurador de Perfiles de Candidatos (Head-to-Head)
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          El motor predictivo de CivicPulse cruza la demografía territorial con los atributos individuales del candidato para modelar su viabilidad electoral.
        </p>

        <div className="workspace-grid-1-1">
          
          {/* Perfil A */}
          <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(59, 130, 246, 0.15)' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--neon-blue)', marginBottom: '1rem', fontWeight: '700' }}>Candidato A (Incumbente / Línea Social)</h3>
            
            <div className="slider-group">
              <div className="slider-label">
                <span>Años de Experiencia en Gobierno</span>
                <span>{candidateA.experienceYears} Años</span>
              </div>
              <input 
                type="range" 
                className="premium-slider" 
                min="0" 
                max="25" 
                value={candidateA.experienceYears}
                onChange={(e) => setCandidateA({ ...candidateA, experienceYears: parseInt(e.target.value) })}
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Coherencia Discurso (Propuestas)</span>
                <span>{candidateA.proposalMatch}%</span>
              </div>
              <input 
                type="range" 
                className="premium-slider" 
                min="40" 
                max="100" 
                value={candidateA.proposalMatch}
                onChange={(e) => setCandidateA({ ...candidateA, proposalMatch: parseInt(e.target.value) })}
              />
            </div>
          </div>

          {/* Perfil B */}
          <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
            <h3 style={{ fontSize: '0.95rem', color: 'var(--neon-rose)', marginBottom: '1rem', fontWeight: '700' }}>Candidato B (Oposición / Línea Comercial)</h3>
            
            <div className="slider-group">
              <div className="slider-label">
                <span>Años de Experiencia en Gobierno</span>
                <span>{candidateB.experienceYears} Años</span>
              </div>
              <input 
                type="range" 
                className="premium-slider" 
                min="0" 
                max="25" 
                value={candidateB.experienceYears}
                onChange={(e) => setCandidateB({ ...candidateB, experienceYears: parseInt(e.target.value) })}
              />
            </div>

            <div className="slider-group">
              <div className="slider-label">
                <span>Coherencia Discurso (Propuestas)</span>
                <span>{candidateB.proposalMatch}%</span>
              </div>
              <input 
                type="range" 
                className="premium-slider" 
                min="40" 
                max="100" 
                value={candidateB.proposalMatch}
                onChange={(e) => setCandidateB({ ...candidateB, proposalMatch: parseInt(e.target.value) })}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Duel Arena (Enfrentamiento y Probabilidades) */}
      <div className="duel-card">
        
        {/* Lado A */}
        <div className="duel-side">
          <div className="candidate-avatar blue">👩‍💼</div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{candidateA.name}</h3>
          
          <div style={{ marginTop: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Intención de Voto Directa</span>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--neon-blue)' }}>{electionResult.votesPercentA}%</div>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Probabilidad Victoria: {electionResult.winProbabilityA}%</span>
          </div>
        </div>

        {/* VS */}
        <div className="duel-vs">VS</div>

        {/* Lado B */}
        <div className="duel-side">
          <div className="candidate-avatar red">👨‍💼</div>
          <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{candidateB.name}</h3>
          
          <div style={{ marginTop: '1rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Intención de Voto Directa</span>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--neon-rose)' }}>{electionResult.votesPercentB}%</div>
          </div>

          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem 1rem', borderRadius: '50px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Probabilidad Victoria: {electionResult.winProbabilityB}%</span>
          </div>
        </div>

      </div>

      {/* Rationale de IA & Desglose por Distrito */}
      <div className="workspace-grid-2">
        
        {/* Rationale Explicable (XAI) */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={16} color="var(--neon-emerald)" />
            Análisis de Causalidad Electorales (¿Por qué gana?)
          </h3>

          <div className="info-list">
            <div className="info-row" style={{ display: 'block', paddingBottom: '1rem' }}>
              <strong style={{ color: 'var(--neon-blue)', fontSize: '0.85rem' }}>Fortaleza Territorial del Candidato A:</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Lidera principalmente en los sectores de Jóvenes y Hogares Asalariados debido a la satisfacción con las políticas de subsidios e inversión en la red de agua. Su ventaja es muy fuerte en el Distrito 8 (Sur).
              </p>
            </div>

            <div className="info-row" style={{ display: 'block', paddingBottom: '1rem' }}>
              <strong style={{ color: 'var(--neon-rose)', fontSize: '0.85rem' }}>Fortaleza Territorial del Candidato B:</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Consolida el voto del sector de Pequeños Comerciantes. Resuena fuertemente su discurso contra los incrementos al impuesto comercial, liderando en el Distrito 9 (Centro) y secciones del Distrito 6 (Pitic).
              </p>
            </div>

            <div className="info-row" style={{ display: 'block', paddingBottom: '0.5rem' }}>
              <strong style={{ color: 'var(--neon-amber)', fontSize: '0.85rem' }}>Punto de Inflexión (Margen Estrecho):</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Si el presupuesto de seguridad aumenta más del 70%, el Candidato B pierde su principal argumento temático, provocando un flujo de votantes independientes hacia el Candidato A.
              </p>
            </div>
          </div>
        </div>

        {/* Desglose por Distrito de Hermosillo */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Desglose por Distrito Electoral</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {districtVotes.map((district) => (
              <div key={district.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600' }}>
                  <span>{district.name}</span>
                  <span>A: {district.A}% | B: {district.B}%</span>
                </div>
                {/* Bar Stacked */}
                <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                  <div style={{ width: `${district.A}%`, background: 'var(--neon-blue)' }}></div>
                  <div style={{ width: `${district.B}%`, background: 'var(--neon-rose)' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
