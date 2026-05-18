import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, Smile, AlertTriangle, Vote, TrendingUp, ShieldAlert, Award } from 'lucide-react';

export default function DashboardOverview({ agents, electionResult, policies }) {
  // Calcular métricas dinámicas a partir de la población sintética activa
  const totalAgents = agents.length;
  const avgHappiness = Math.round(agents.reduce((acc, curr) => acc + curr.happiness, 0) / totalAgents);
  
  // Contar dolores por sector
  const jovenesHappiness = Math.round(agents.filter(a => a.sector === "jovenes").reduce((acc, curr) => acc + curr.happiness, 0) / agents.filter(a => a.sector === "jovenes").length);
  const comerciantesHappiness = Math.round(agents.filter(a => a.sector === "comerciantes").reduce((acc, curr) => acc + curr.happiness, 0) / agents.filter(a => a.sector === "comerciantes").length);
  const asalariadosHappiness = Math.round(agents.filter(a => a.sector === "asalariados").reduce((acc, curr) => acc + curr.happiness, 0) / agents.filter(a => a.sector === "asalariados").length);

  const chartData = [
    { name: 'Jóvenes', 'Felicidad': jovenesHappiness, 'Pref. Social': 75 },
    { name: 'Comerciantes', 'Felicidad': comerciantesHappiness, 'Pref. Social': 28 },
    { name: 'Asalariados', 'Felicidad': asalariadosHappiness, 'Pref. Social': 54 }
  ];

  // Datos históricos simulados de Hermosillo para mostrar la tendencia
  const trendData = [
    { year: '2021', 'Confianza Cívica': 42, 'Participación': 51 },
    { year: '2022', 'Confianza Cívica': 45, 'Participación': 53 },
    { year: '2023', 'Confianza Cívica': 49, 'Participación': 58 },
    { year: '2024 (Hist.)', 'Confianza Cívica': 54, 'Participación': 62 },
    { year: '2026 (Sim.)', 'Confianza Cívica': avgHappiness, 'Participación': 65 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Grid de KPIs Superiores con Efecto Glass */}
      <div className="stats-grid">
        
        <div className="glass-card glow-blue">
          <div className="stat-item">
            <div className="stat-header">
              <span>Población Sintética (Hermosillo)</span>
              <Users size={18} color="var(--neon-blue)" />
            </div>
            <div className="stat-value">{totalAgents * 500}</div>
            <div className="stat-trend trend-up">
              <TrendingUp size={12} />
              <span>Representación del 100% de secciones</span>
            </div>
          </div>
        </div>

        <div className="glass-card glow-emerald">
          <div className="stat-item">
            <div className="stat-header">
              <span>Felicidad Promedio (Índice Cívico)</span>
              <Smile size={18} color="var(--neon-emerald)" />
            </div>
            <div className="stat-value">{avgHappiness}%</div>
            <div className="stat-trend" style={{ color: avgHappiness > 55 ? 'var(--neon-emerald)' : 'var(--neon-rose)' }}>
              <span>{avgHappiness > 55 ? 'Clima de Gobernabilidad Óptimo' : 'Tensión Social Detectada'}</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--neon-amber)' }}>
          <div className="stat-item">
            <div className="stat-header">
              <span>Punto de Dolor Principal</span>
              <AlertTriangle size={18} color="var(--neon-amber)" />
            </div>
            <div className="stat-value" style={{ fontSize: '1.25rem', marginTop: '0.5rem', fontWeight: '800' }}>
              {policies.inversionAgua < 40 ? 'Abasto de Agua (Crítico)' : 'Inseguridad Distrital'}
            </div>
            <div className="stat-trend trend-stable" style={{ marginTop: '0.9rem' }}>
              <span>Afecta al 62% del Distrito 8 (Sur)</span>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ borderLeft: '4px solid var(--neon-purple)' }}>
          <div className="stat-item">
            <div className="stat-header">
              <span>Clima Electoral Estimado</span>
              <Vote size={18} color="var(--neon-purple)" />
            </div>
            <div className="stat-value" style={{ fontSize: '1.6rem', marginTop: '0.2rem' }}>
              A: {electionResult.winProbabilityA}% vs B: {electionResult.winProbabilityB}%
            </div>
            <div className="stat-trend trend-up">
              <span>Probabilidad ponderada de victoria</span>
            </div>
          </div>
        </div>

      </div>

      {/* Grid de Gráficos Principales */}
      <div className="workspace-grid-2">
        
        {/* Gráfico de Sectores y Felicidad */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="var(--neon-emerald)" />
            Felicidad y Preferencia Social por Sector Social
          </h2>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis stroke="var(--text-secondary)" dataKey="name" />
                <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'var(--border-glass)' }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />
                <Bar dataKey="Felicidad" fill="var(--neon-emerald)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pref. Social" fill="var(--neon-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alertas Críticas & Decisiones */}
        <div className="glass-card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="var(--neon-rose)" />
            Alertas del Gemelo Digital
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--neon-rose)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span>⚠️ CRISIS DE AGUA DETECTADA</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Distrito 8 (Sur - Palo Verde) reporta cortes recurrentes. La felicidad del sector Asalariados en la zona disminuyó un 12%.
              </p>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--neon-amber)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span>⚡ ALERTA ELECTORAL</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                El descontento comercial en el Centro (D9) por incrementos al impuesto comercial empuja un 5% de indecisos hacia el Candidato B.
              </p>
            </div>

            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--neon-emerald)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                <span>💡 RECOMENDACIÓN DE IA</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Implementar "Subsidio de Transporte" aumenta la felicidad de los jóvenes un 18% y mitiga tensión en D6.
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* Gráfico de Evolución Histórica / Tendencia */}
      <div className="glass-card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Evolución Temporal de Confianza Cívica y Participación Electoral</h2>
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConfianza" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--neon-blue)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--neon-blue)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorParticipacion" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--neon-purple)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--neon-purple)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis stroke="var(--text-secondary)" dataKey="year" />
              <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'var(--border-glass)' }}
              />
              <Area type="monotone" dataKey="Confianza Cívica" stroke="var(--neon-blue)" fillOpacity={1} fill="url(#colorConfianza)" strokeWidth={2} />
              <Area type="monotone" dataKey="Participación" stroke="var(--neon-purple)" fillOpacity={1} fill="url(#colorParticipacion)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
