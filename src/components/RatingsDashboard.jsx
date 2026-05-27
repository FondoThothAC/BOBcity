import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, TrendingUp, TrendingDown, DollarSign, CloudRain, Users, AlertTriangle } from 'lucide-react';

export default function RatingsDashboard({ agents = [] }) {
  const [globalRating, setGlobalRating] = useState({ score: 0, grade: "D" });
  const [stats, setStats] = useState({
    financial: 0,
    social: 0,
    environmental: 0,
    volatility: 0
  });

  useEffect(() => {
    if (agents && agents.length > 0) {
      let totalScore = 0;
      let totalFin = 0;
      let totalSoc = 0;
      let totalEnv = 0;
      let totalVol = 0;
      
      let validAgents = 0;

      agents.forEach(agent => {
        if (agent.creditRating) {
          totalScore += agent.creditRating.score || 0;
          totalVol += agent.creditRating.volatility || 0;
          validAgents++;
        }
      });

      if (validAgents > 0) {
        const avgScore = totalScore / validAgents;
        let grade = "D";
        if (avgScore >= 90) grade = "AAA";
        else if (avgScore >= 80) grade = "A";
        else if (avgScore >= 70) grade = "BBB";
        else if (avgScore >= 60) grade = "BB";
        else if (avgScore >= 50) grade = "B";

        setGlobalRating({ score: avgScore.toFixed(1), grade });
        
        // Simular factores derivados de la media
        setStats({
          financial: (avgScore * 0.8).toFixed(1),
          social: (avgScore * 0.9).toFixed(1),
          environmental: (100 - avgScore * 0.5).toFixed(1),
          volatility: (totalVol / validAgents).toFixed(2)
        });
      }
    }
  }, [agents]);

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'AAA': return '#10b981'; // Emerald
      case 'A': return '#3b82f6'; // Blue
      case 'BBB': return '#f59e0b'; // Amber
      case 'BB': return '#f97316'; // Orange
      case 'B': return '#ef4444'; // Red
      default: return '#9ca3af'; // Gray
    }
  };

  const gradeColor = getGradeColor(globalRating.grade);

  return (
    <div className="glass-card scale-in" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Activity color={gradeColor} /> Oráculo de Calificaciones Crediticias
          </h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Calificación "Moody's" de Riesgo y Salud Financiera del Distrito
          </p>
        </div>
        
        <div style={{ background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '8px', border: `1px solid ${gradeColor}`, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Grado Actual</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: gradeColor }}>{globalRating.grade}</div>
          </div>
          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score Base</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'white' }}>{globalRating.score}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <DollarSign size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Salud Financiera</span>
          </div>
          <div style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{stats.financial}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <Users size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Cohesión Social</span>
          </div>
          <div style={{ fontSize: '1.4rem', color: 'white', fontWeight: 'bold' }}>{stats.social}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <CloudRain size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Estrés Ambiental</span>
          </div>
          <div style={{ fontSize: '1.4rem', color: 'var(--neon-emerald)', fontWeight: 'bold' }}>{stats.environmental}</div>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <AlertTriangle size={16} /> <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>Volatilidad</span>
          </div>
          <div style={{ fontSize: '1.4rem', color: 'var(--neon-rose)', fontWeight: 'bold' }}>{stats.volatility}</div>
        </div>

      </div>

      <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <ShieldAlert color="var(--neon-emerald)" />
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--neon-emerald)' }}>Diagnóstico del Oráculo</h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {globalRating.score >= 80 
              ? "Las condiciones son óptimas. El riesgo crediticio es mínimo y la cohesión social es fuerte. Excelente oportunidad para inversión." 
              : globalRating.score >= 60 
              ? "Condiciones estables con riesgo moderado. Se recomienda monitorear la volatilidad ambiental y social antes de grandes movimientos." 
              : "Alerta de alto riesgo. Los indicadores financieros y sociales muestran estrés. Se recomienda cautela e intervención inmediata."}
          </p>
        </div>
      </div>
    </div>
  );
}
