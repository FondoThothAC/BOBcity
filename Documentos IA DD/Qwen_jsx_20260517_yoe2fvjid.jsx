// src/components/OrchestratorConsole.jsx
// UxDD: Accessibility-first, keyboard navigation, ARIA labels
// CDD: Component isolation, props validation, error boundaries

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, Sparkles, ShieldCheck, Send, Loader2 } from 'lucide-react';
import { useEventBus } from '../events/EventBus'; // EDD: Pub/Sub hook
import { validateWithZod } from '../utils/zod-validator'; // MDD: Runtime validation
import { AgentNode } from './swarm/AgentNode'; // CDD: Sub-component
import { AuditLogTable } from './audit/AuditLogTable'; // CDD + ADD: Security UI
import { OBPExportModal } from './integration/OBPExportModal'; // CDD: Integration component
import { useLocalAudit } from '../hooks/useLocalAudit'; // ADD: Local-first logging

export const OrchestratorConsole = React.memo(({ 
  onExportSuccess, 
  onError 
}) => {
  // UxDD: State management with accessibility in mind
  const [selectedInitiative, setSelectedInitiative] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [swarmState, setSwarmState] = useState('idle'); // 'idle' | 'running' | 'completed' | 'error'
  const [logs, setLogs] = useState([]);
  const [auditEntries, setAuditEntries] = useState([]);
  const [showOBPModal, setShowOBPModal] = useState(false);
  
  // EDD: Subscribe to agent events
  const eventBus = useEventBus();
  const { addAuditEntry } = useLocalAudit(); // ADD: Local audit hook
  
  // CDD: Refs for cleanup (prevents memory leaks)
  const swarmIntervalRef = useRef(null);
  const terminalRef = useRef(null);

  // UxDD: Auto-scroll terminal with smooth behavior
  const appendLog = useCallback((message, type = 'info') => {
    setLogs(prev => {
      const newLog = { 
        id: crypto.randomUUID(), 
        timestamp: new Date().toISOString(), 
        message, 
        type,
        ariaLabel: `${type}: ${message}` // UxDD: Screen reader support
      };
      return [...prev.slice(-99), newLog]; // Keep last 100 logs (performance)
    });
    
    // Auto-scroll with requestAnimationFrame for smooth UX
    requestAnimationFrame(() => {
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    });
  }, []);

  // EDD: Handle agent messages via event bus
  useEffect(() => {
    const unsubscribe = eventBus.subscribe('agent:message', (payload) => {
      appendLog(`[${payload.sender}] ${payload.eventType}: ${JSON.stringify(payload.payload)}`, payload.eventType);
      
      // ADD: Log to local audit trail with cryptographic hash
      if (payload.eventType === 'audit_log') {
        addAuditEntry({
          action: payload.payload.action,
          hash: payload.payload.hash,
          compliantWith: ['LGPD', 'GDPR-local']
        });
      }
    });
    
    return () => unsubscribe(); // Cleanup on unmount (CDD)
  }, [eventBus, appendLog, addAuditEntry]);

  // BDD: Execute workflow with validation gates
  const executeSwarm = useCallback(async () => {
    if (!selectedInitiative && !customPrompt.trim()) {
      onError?.('Debes seleccionar una iniciativa o escribir una consulta');
      return;
    }

    setSwarmState('running');
    appendLog('🚀 Iniciando Orquestador OpenClaw...', 'system');
    
    // ADD: Generate audit entry for workflow start
    const startHash = await crypto.subtle.digest('SHA-256', 
      new TextEncoder().encode(`${selectedInitiative?.id || customPrompt}`)
    );
    addAuditEntry({
      action: 'swarm_execution_started',
      hash: `sha256:${Array.from(new Uint8Array(startHash)).map(b => b.toString(16).padStart(2, '0')).join('')}`,
      compliantWith: ['LGPD', 'GDPR-local']
    });

    // Simular flujo de agentes (reemplazar con llamada real a OpenClaw)
    const agents = ['orchestrator', 'data_collector', 'profile_builder', 'simulator', 'policy_designer', 'report_writer', 'qa_validator'];
    
    for (const agent of agents) {
      appendLog(`🔹 Agente "${agent}" procesando...`, 'agent');
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400)); // Simular latencia local
      appendLog(`✅ ${agent} completado`, 'success');
    }

    setSwarmState('completed');
    appendLog('🎯 Flujo completado. Resultados listos para revisión.', 'system');
    
    // UxDD: Announce completion for screen readers
    if (typeof window !== 'undefined' && window.announcer) {
      window.announcer.speak('Análisis completado. Revisa las recomendaciones.');
    }
  }, [selectedInitiative, customPrompt, appendLog, addAuditEntry, onError]);

  // CDD: Cleanup intervals on unmount (prevents memory leaks)
  useEffect(() => {
    return () => {
      if (swarmIntervalRef.current) {
        clearInterval(swarmIntervalRef.current);
      }
    };
  }, []);

  // UxDD: Keyboard shortcuts for power users
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && swarmState === 'idle') {
        e.preventDefault();
        executeSwarm();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [executeSwarm, swarmState]);

  return (
    <div className="orchestrator-console" role="region" aria-label="Consola de Orquestación OpenClaw">
      {/* Header con UxDD: Clear hierarchy, ARIA landmarks */}
      <header className="console-header">
        <h2 className="sr-only">Panel de Orquestación de Agentes</h2>
        <div className="header-actions">
          <button 
            onClick={() => setShowOBPModal(true)}
            disabled={swarmState !== 'completed'}
            aria-disabled={swarmState !== 'completed'}
            className="btn-export"
          >
            <Sparkles className="icon" aria-hidden="true" />
            Exportar a Open Business Plan
          </button>
        </div>
      </header>

      {/* Main Grid: UxDD - Responsive, accessible layout */}
      <div className="console-grid">
        {/* Panel Izquierdo: Selección de Iniciativas */}
        <section className="initiatives-panel" aria-labelledby="initiatives-title">
          <h3 id="initiatives-title">Iniciativas Cívicas</h3>
          <div className="initiative-list" role="listbox" aria-label="Casos preconfigurados">
            {['Crisis de Agua en Palo Verde - D8', 'Plan de Movilidad Estudiantil - D6', 'Corredor Comercial Pyme Centro - D9'].map((title, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedInitiative({ id: `init-${idx}`, title })}
                className={`initiative-card ${selectedInitiative?.id === `init-${idx}` ? 'active' : ''}`}
                role="option"
                aria-selected={selectedInitiative?.id === `init-${idx}`}
              >
                <span className="card-title">{title}</span>
                <span className="card-meta">Hermosillo, Sonora</span>
              </button>
            ))}
          </div>
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="O escribe tu propia consulta cívica..."
            className="custom-prompt"
            aria-label="Consulta personalizada"
            rows={3}
          />
        </section>

        {/* Panel Central: Visualizador del Swarm (CDD + UxDD) */}
        <section className="swarm-visualizer" aria-labelledby="swarm-title">
          <h3 id="swarm-title" className="sr-only">Diagrama de Flujo de Agentes</h3>
          <div className="agent-flow" role="graph" aria-label="Flujo de procesamiento multi-agente">
            {['orchestrator', 'data_collector', 'profile_builder', 'simulator', 'policy_designer', 'report_writer', 'qa_validator'].map((agent, idx) => (
              <AgentNode
                key={agent}
                agent={agent}
                status={swarmState === 'running' ? 'active' : swarmState === 'completed' ? 'success' : 'idle'}
                delay={idx * 100} // Staggered animation
              />
            ))}
          </div>
        </section>

        {/* Panel Derecho: Terminal + Auditoría (ADD + UxDD) */}
        <section className="terminal-audit-panel">
          {/* Terminal de Inferencia */}
          <div className="terminal-window" role="log" aria-live="polite" aria-label="Consola de inferencia local">
            <div className="terminal-header">
              <Terminal size={14} aria-hidden="true" />
              <span>ollama run qwen2.5:14b --local</span>
              <ShieldCheck size={14} className="secure-badge" aria-label="Procesamiento local seguro" />
            </div>
            <div className="terminal-body" ref={terminalRef}>
              {logs.map((log) => (
                <div 
                  key={log.id} 
                  className={`log-line ${log.type}`}
                  role="listitem"
                  aria-label={log.ariaLabel}
                >
                  <span className="timestamp">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className="message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Registro de Auditoría Local (ADD: Security UI) */}
          <AuditLogTable entries={auditEntries} />
        </section>
      </div>

      {/* Footer: Controles de Ejecución (UxDD: Clear affordances) */}
      <footer className="console-footer">
        <button
          onClick={executeSwarm}
          disabled={swarmState === 'running'}
          className="btn-execute"
          aria-busy={swarmState === 'running'}
        >
          {swarmState === 'running' ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Ejecutando Enjambre...
            </>
          ) : (
            <>
              <Send aria-hidden="true" />
              Ejecutar Flujo de Agentes (Ctrl+Enter)
            </>
          )}
        </button>
        <button 
          onClick={() => { setLogs([]); setSwarmState('idle'); }}
          className="btn-reset"
          aria-label="Reiniciar consola"
        >
          Reset
        </button>
      </footer>

      {/* Modal de Exportación a OBP (CDD + EDD) */}
      {showOBPModal && (
        <OBPExportModal
          onClose={() => setShowOBPModal(false)}
          onExportSuccess={(payload) => {
            onExportSuccess?.(payload);
            setShowOBPModal(false);
          }}
          payload={{
            initiative: selectedInitiative || { title: customPrompt },
            timestamp: new Date().toISOString(),
            auditHash: auditEntries[auditEntries.length - 1]?.hash || 'pending'
          }}
        />
      )}
    </div>
  );
});

OrchestratorConsole.displayName = 'OrchestratorConsole';
export default OrchestratorConsole;