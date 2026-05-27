import React, { useState, useMemo } from "react";
import { generateMacroSimData } from "../utils/macroSimulatorData";

const MOCK_CANDIDATES = [
  { id: "C1", name: "Alianza Progresista", party: "MORENA" },
  { id: "C2", name: "Frente Ciudadano", party: "PAN" },
  { id: "C3", name: "Movimiento Regional", party: "PRI" },
  { id: "C4", name: "Alternativa Sonora", party: "MC" },
  { id: "C5", name: "Voz Popular", party: "IND" }
];

export default function MacroSimulator({ seed = "CIVICA_OS_2026" }) {
  const [filters, setFilters] = useState({ state: "Sonora", type: "Municipal", risk: "all" });
  const [expanded, setExpanded] = useState(false);

  const data = useMemo(() => {
    const base = generateMacroSimData(MOCK_CANDIDATES, seed);
    if (filters.risk !== "all") return base.filter(d => d.riskLevel === filters.risk);
    return base;
  }, [filters, seed]);

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <h2 style={{ fontFamily: "var(--font-heading)", margin: "0 0 15px" }}>🗳️ Comparativa N-Way (Softmax)</h2>
      
      <div style={{ display: "flex", gap: 10, marginBottom: 15, flexWrap: "wrap" }}>
        {["state", "type", "risk"].map(key => (
          <select key={key} value={filters[key]} onChange={e => setFilters(f => ({...f, [key]: e.target.value}))} style={{ background: "#1e293b", color: "#fff", border: "1px solid var(--border-subtle)", padding: 6, borderRadius: 4 }}>
            {key === "state" && (
              <>
                <option value="Sonora">Sonora</option>
                <option value="CDMX">CDMX</option>
              </>
            )}
            {key === "type" && (
              <>
                <option value="Municipal">Municipal</option>
                <option value="Estatal">Estatal</option>
                <option value="Federal">Federal</option>
              </>
            )}
            {key === "risk" && (
              <>
                <option value="all">Todos</option>
                <option value="alto">Alto Riesgo</option>
                <option value="medio">Medio</option>
                <option value="bajo">Bajo</option>
              </>
            )}
          </select>
        ))}
      </div>

      <table className="civica-table">
        <thead>
          <tr>
            <th>Candidato / Partido</th>
            <th>Voto Estimado (%)</th>
            <th>Prob. Victoria (%)</th>
            <th>Spread</th>
            <th>Nivel de Riesgo</th>
          </tr>
        </thead>
        <tbody>
          {data?.map(d => (
            <tr key={d.id}>
              <td>{d.name} <span style={{ color: "#64748b", fontSize: 12 }}>({MOCK_CANDIDATES.find(c=>c.id===d.id)?.party})</span></td>
              <td style={{ color: "var(--accent-cyan)" }}>{d.estimatedVote}%</td>
              <td>{d.winProbability}%</td>
              <td>{d.spread > 0 ? `+${d.spread}` : d.spread}%</td>
              <td><span className={`badge ${d.riskLevel === "bajo" ? "badge-live" : d.riskLevel === "medio" ? "badge-offline" : "badge-offline"}`}>{d.riskLevel.toUpperCase()}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <button onClick={() => setExpanded(!expanded)} style={{ marginTop: 12, background: "transparent", border: "1px solid var(--accent-cyan)", color: "var(--accent-cyan)", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}>
        {expanded ? "▲ Ocultar detalles técnicos" : "▼ Expandir matriz de correlación"}
      </button>
      {expanded && (
        <pre style={{ marginTop: 10, background: "#0f172a", padding: 10, borderRadius: 6, overflowX: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "#a1a1aa" }}>
          {JSON.stringify({ seed, filters, data, note: "Semilla determinística activa. Sin Math.random() en render." }, null, 2)}
        </pre>
      )}
    </div>
  );
}
