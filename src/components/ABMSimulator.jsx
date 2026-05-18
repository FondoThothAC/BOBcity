import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Play, RotateCcw, HelpCircle, User, ArrowRight } from 'lucide-react';
import { updateAgentState } from '../models/dataModel';

export default function ABMSimulator({ agents, setAgents, policies, setPolicies }) {
  const [history, setHistory] = useState([
    { year: 'Inicial', 'Jóvenes': 65, 'Comerciantes': 58, 'Asalariados': 60 }
  ]);
  const [simulationYear, setSimulationYear] = useState(2026);
  const [logs, setLogs] = useState([
    "💡 Gemelo social inicializado con 150 agentes sintéticos en Hermosillo.",
    "📢 Proyecta políticas públicas ajustando los deslizadores de la izquierda."
  ]);

  // Al cambiar los deslizadores, actualizar inmediatamente el estado de los agentes sintéticos
  useEffect(() => {
    const updated = agents.map(agent => updateAgentState(agent, policies));
    setAgents(updated);
  }, [policies]);

  const [isSimulatingApi, setIsSimulatingApi] = useState(false);

  // Ejecutar un ciclo anual completo (Simulación temporal de largo plazo conectada a FastAPI)
  const runSimulationStep = async () => {
    const nextYear = simulationYear + 1;
    setSimulationYear(nextYear);
    setIsSimulatingApi(true);

    try {
      const response = await fetch('http://localhost:5001/run-simulation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          N: agents.length || 150,
          epsilon: 0.3,
          mu: (policies.subsidioTransporte + policies.inversionAgua) / 200 || 0.4,
          steps: 5,
          model_type: 'HK',
          policies: policies
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error');
      }

      const data = await response.json();
      
      // Dispatch toast of success
      const toastEvent = new CustomEvent('civic-toast', {
        detail: {
          message: `¡Simulación ejecutada en motor Python! ROI: ${data.expected_social_roi || '+24%'}`,
          type: 'success'
        }
      });
      window.dispatchEvent(toastEvent);

      // Use the simulation values from Python to influence our agents' happiness!
      const evolution = data.happiness_evolution;
      const factor = evolution ? evolution[evolution.length - 1] * 100 : 65;

      // Update agents locally with the calculated impact
      const updatedAgents = agents.map(agent => {
        let baseChange = (factor - 50) / 2;
        if (agent.sector === "jovenes") baseChange += (policies.subsidioTransporte - 50) / 5;
        if (agent.sector === "comerciantes") baseChange += (50 - policies.impuestoComercial) / 5;
        if (agent.sector === "asalariados") baseChange += (policies.inversionAgua - 50) / 5;

        const newHappiness = Math.max(0, Math.min(100, Math.round(agent.happiness + baseChange)));
        return { ...agent, happiness: newHappiness };
      });
      setAgents(updatedAgents);

      // Recalculate averages for chart
      const jovenes = Math.round(updatedAgents.filter(a => a.sector === "jovenes").reduce((acc, curr) => acc + curr.happiness, 0) / updatedAgents.filter(a => a.sector === "jovenes").length);
      const comerciantes = Math.round(updatedAgents.filter(a => a.sector === "comerciantes").reduce((acc, curr) => acc + curr.happiness, 0) / updatedAgents.filter(a => a.sector === "comerciantes").length);
      const asalariados = Math.round(updatedAgents.filter(a => a.sector === "asalariados").reduce((acc, curr) => acc + curr.happiness, 0) / updatedAgents.filter(a => a.sector === "asalariados").length);

      setHistory(prev => [
        ...prev,
        { year: `${nextYear} (Real API)`, 'Jóvenes': jovenes, 'Comerciantes': comerciantes, 'Asalariados': asalariados }
      ]);

      setLogs(prev => [
        `🌐 Servidor API Python (${nextYear}): 'Simulación completada en motor backend. ROI Social: ${data.expected_social_roi || '+24% Felicidad'}'`,
        ...prev
      ].slice(0, 8));

    } catch (err) {
      console.warn('API server offline, falling back to local simulation:', err);

      // Dispatch toast warning
      const warningEvent = new CustomEvent('civic-toast', {
        detail: {
          message: 'Servidor API fuera de línea. Corriendo simulación local resiliente.',
          type: 'warning'
        }
      });
      window.dispatchEvent(warningEvent);

      // Local fallback logic
      const updatedAgents = agents.map(agent => updateAgentState(agent, policies));
      setAgents(updatedAgents);

      const jovenes = Math.round(updatedAgents.filter(a => a.sector === "jovenes").reduce((acc, curr) => acc + curr.happiness, 0) / updatedAgents.filter(a => a.sector === "jovenes").length);
      const comerciantes = Math.round(updatedAgents.filter(a => a.sector === "comerciantes").reduce((acc, curr) => acc + curr.happiness, 0) / updatedAgents.filter(a => a.sector === "comerciantes").length);
      const asalariados = Math.round(updatedAgents.filter(a => a.sector === "asalariados").reduce((acc, curr) => acc + curr.happiness, 0) / updatedAgents.filter(a => a.sector === "asalariados").length);

      setHistory(prev => [
        ...prev,
        { year: `${nextYear} (Local)`, 'Jóvenes': jovenes, 'Comerciantes': comerciantes, 'Asalariados': asalariados }
      ]);

      const newLogs = [];
      if (policies.impuestoComercial > 60) {
        newLogs.push(`🏬 Comerciantes (${nextYear}): 'El impuesto comercial del ${policies.impuestoComercial}% nos asfixia. Consideramos cerrar locales.'`);
      } else if (policies.impuestoComercial < 25) {
        newLogs.push(`🏬 Comerciantes (${nextYear}): 'Bajo impuesto comercial nos permite reinvertir. Clima comercial positivo.'`);
      }

      if (policies.subsidioTransporte > 65) {
        newLogs.push(`🎓 Jóvenes (${nextYear}): '¡El subsidio de transporte del ${policies.subsidioTransporte}% es genial! Ayuda mucho a llegar a la UNISON.'`);
      } else if (policies.subsidioTransporte < 30) {
        newLogs.push(`🎓 Jóvenes (${nextYear}): 'Poco apoyo al transporte. La deserción por costos de traslado es un riesgo.'`);
      }

      if (policies.inversionAgua < 40) {
        newLogs.push(`🔴 Alerta Hídrica (${nextYear}): Las reservas de agua siguen bajando en el sur. Malestar vecinal creciente.`);
      } else {
        newLogs.push(`💧 Infraestructura (${nextYear}): La inversión en agua mejora la presión en D8_SUR. Quejas disminuyeron.`);
      }

      setLogs(prev => [newLogs[Math.floor(Math.random() * newLogs.length)], ...prev].slice(0, 8));
    } finally {
      setIsSimulatingApi(false);
    }
  };

  // Resetear la simulación
  const resetSimulation = () => {
    setSimulationYear(2026);
    setPolicies({
      subsidioTransporte: 50,
      impuestoComercial: 30,
      presupuestoSeguridad: 60,
      inversionAgua: 50
    });
    setHistory([{ year: 'Inicial', 'Jóvenes': 65, 'Comerciantes': 58, 'Asalariados': 60 }]);
    setLogs(["💡 Gemelo social restaurado. Simulador listo."]);
  };

  const getSliderColor = (val) => {
    if (val < 35) return "var(--neon-rose)";
    if (val < 65) return "var(--neon-blue)";
    return "var(--neon-emerald)";
  };

  return (
    <div className="workspace-grid-2">
      
      {/* Controles de Políticas Públicas (Izquierda) */}
      <div className="glass-card glow-blue">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Play size={18} color="var(--neon-blue)" />
          Parámetros de Políticas Públicas
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Inyecta reformas y observa el impacto inmediato en el bienestar social y la intención de voto de los agentes sintéticos.
        </p>

        {/* Sliders */}
        <div className="slider-group">
          <div className="slider-label">
            <span>Subsidio Transporte Jóvenes</span>
            <span style={{ color: getSliderColor(policies.subsidioTransporte) }}>{policies.subsidioTransporte}%</span>
          </div>
          <input 
            type="range" 
            className="premium-slider" 
            value={policies.subsidioTransporte} 
            onChange={(e) => setPolicies({ ...policies, subsidioTransporte: parseInt(e.target.value) })}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Impuesto Comercial (Pymes)</span>
            <span style={{ color: getSliderColor(100 - policies.impuestoComercial) }}>{policies.impuestoComercial}%</span>
          </div>
          <input 
            type="range" 
            className="premium-slider" 
            value={policies.impuestoComercial} 
            onChange={(e) => setPolicies({ ...policies, impuestoComercial: parseInt(e.target.value) })}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Presupuesto Seguridad Distrital</span>
            <span style={{ color: getSliderColor(policies.presupuestoSeguridad) }}>{policies.presupuestoSeguridad}%</span>
          </div>
          <input 
            type="range" 
            className="premium-slider" 
            value={policies.presupuestoSeguridad} 
            onChange={(e) => setPolicies({ ...policies, presupuestoSeguridad: parseInt(e.target.value) })}
          />
        </div>

        <div className="slider-group">
          <div className="slider-label">
            <span>Inversión en Red de Agua</span>
            <span style={{ color: getSliderColor(policies.inversionAgua) }}>{policies.inversionAgua}%</span>
          </div>
          <input 
            type="range" 
            className="premium-slider" 
            value={policies.inversionAgua} 
            onChange={(e) => setPolicies({ ...policies, inversionAgua: parseInt(e.target.value) })}
          />
        </div>

        {/* Acciones de Simulación */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn-premium" 
            onClick={runSimulationStep}
            style={{ flex: 1 }}
          >
            <Play size={16} />
            Simular Año {simulationYear + 1}
          </button>
          
          <button 
            className="btn-outline" 
            onClick={resetSimulation}
            style={{ padding: '0.8rem 1rem' }}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Gráfica de Simulación y Feedback Cualitativo (Derecha) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Curvas de Felicidad */}
        <div className="glass-card glow-emerald">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            Evolución de Felicidad (Gemelo Social)
          </h2>
          
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis stroke="var(--text-secondary)" dataKey="year" />
                <YAxis stroke="var(--text-secondary)" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderColor: 'var(--border-glass)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="Jóvenes" stroke="var(--neon-blue)" strokeWidth={2.5} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="Comerciantes" stroke="var(--neon-amber)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="Asalariados" stroke="var(--neon-emerald)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mensajes y Reacciones en Tiempo Real */}
        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={16} color="var(--neon-purple)" />
            Reacciones de la Población Sintética
          </h3>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.75rem', 
            maxHeight: '180px', 
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }}>
            {logs.map((log, index) => (
              <div 
                key={index}
                style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.5rem', 
                  fontSize: '0.8rem',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255,255,255,0.02)',
                  color: 'var(--text-secondary)'
                }}
              >
                <ArrowRight size={12} style={{ marginTop: '3px', flexShrink: 0, color: 'var(--neon-purple)' }} />
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
