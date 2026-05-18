import React, { useState, useRef, useEffect } from 'react';
import { Play, Send, ShieldCheck, Database, TerminalSquare } from 'lucide-react';

export default function OrchestratorConsole() {
    const = useState('idle');
    const [logs, setLogs] = useState();
    const [activeNode, setActiveNode] = useState(null);
    const = useState(false);
    
    // Prevención de fugas de memoria (Memory Leak fix)
    const swarmIntervalRef = useRef(null);

    const simulatedLogs = [
        "[Orchestrator] Recibiendo caso: Crisis de Agua en Palo Verde - D8",
        " Extrayendo base demográfica y encuestas de Hermosillo...",
        "[Analyzer] Procesando puntos de dolor ciudadano con Qwen2.5-Coder...",
        " Ejecutando modelo ABM (Deffuant-Weisbuch) en NVIDIA DGX Spark...",
        " Simulación completada. Felicidad +12%, Probabilidad de Voto +8%.",
        " Estructurando estrategia de mitigación y presupuesto...",
        "[Integrator] Empaquetando payload JSON para Open Business Plan."
    ];

    const executeSwarm = () => {
        if (swarmIntervalRef.current) clearInterval(swarmIntervalRef.current);
        setStatus('processing');
        setLogs();
        let step = 0;

        swarmIntervalRef.current = setInterval(() => {
            if (step < simulatedLogs.length) {
                const currentLog = simulatedLogs[step];
                if (!currentLog) return null; // Type-safe guard
                setLogs(prev => [...prev, currentLog]);
                setActiveNode(step);
                step++;
            } else {
                clearInterval(swarmIntervalRef.current);
                setStatus('success');
                setActiveNode(null);
            }
        }, 800);
    };

    useEffect(() => {
        return () => {
            if (swarmIntervalRef.current) clearInterval(swarmIntervalRef.current);
        };
    },);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-extrabold flex items-center gap-2">
                    <TerminalSquare className="text-violet-400" /> Consola de Orquestación Swarm
                </h2>
                <p className="text-slate-400 text-sm">Ejecución y telemetría de agentes NemoClaw local-first.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl flex flex-col space-y-4">
                    <div className="flex gap-2">
                        <select className="flex-1 bg-[#0d0d17] border border-white/5 rounded-xl px-4 py-2 text-slate-200 focus:outline-none">
                            <option>Crisis de Agua en Palo Verde - D8</option>
                            <option>Plan de Movilidad Estudiantil - D6</option>
                            <option>Corredor Comercial Pyme Centro - D9</option>
                        </select>
                        <button
                            onClick={executeSwarm}
                            className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                        >
                            <Play size={16} /> Ejecutar
                        </button>
                    </div>

                    <div className="flex-1 bg-black/80 rounded-xl p-4 font-mono text-xs text-emerald-400 border border-white/5 h-64 overflow-y-auto">
                        <div className="opacity-50 mb-2">NVIDIA OpenShell v2.0 - Local Inference Mode</div>
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">{log}</div>
                        ))}
                        {status === 'processing' && <div className="animate-pulse">_</div>}
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl space-y-6 flex flex-col justify-between">
                    <div>
                        <h3 className="font-display font-bold text-lg border-b border-white/5 pb-2">Topología del Enjambre</h3>
                        <div className="flex flex-wrap gap-3 items-center justify-center py-4">
                            {.map((node, i) => (
                                <div key={node} className={`px-3 py-1.5 rounded-full border ${activeNode === i? 'border-violet-400 bg-violet-400/20 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'border-white/10 bg-white/5'} transition-all duration-300`}>
                                    <span className="text-xs font-bold text-slate-300">{node}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <h4 className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1"><ShieldCheck size={14}/> Ledger de Auditoría Local</h4>
                        <div className="text-[10px] font-mono text-slate-500 truncate space-y-1">
                            <div> {new Date().toISOString()}</div>
                            <div> Cumplimiento Zero-Trust validado.</div>
                            <div> 8f434346648f6b96df89dda901c5176b10a6d83961</div>
                        </div>
                    </div>

                    {status === 'success' && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all animate-in fade-in"
                        >
                            <Send size={18} /> Exportar a Open Business Plan
                        </button>
                    )}
                </div>
            </div>

            {/* Modal de Transición */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="glass-panel p-8 rounded-2xl max-w-sm w-full text-center space-y-4 border border-emerald-500/30">
                        <Database className="mx-auto text-emerald-400 h-12 w-12 animate-pulse" />
                        <h2 className="text-xl font-bold text-white">Transfiriendo a OBP</h2>
                        <p className="text-sm text-slate-400">Inyectando payload JSON local al webhook de Open Business Plan...</p>
                        <button onClick={() => setShowModal(false)} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}