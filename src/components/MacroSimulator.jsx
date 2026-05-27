import React, { useState, useMemo } from "react";
import electoralScenarios from "../data/electoral_scenarios.json";

// Configuración detallada de colores y nombres de los partidos reales de México
const PARTY_DETAILS = {
  MORENA: { name: "Movimiento Regeneración Nacional", color: "#8b2635", alliance: "Sigamos Haciendo Historia" },
  PAN: { name: "Partido Acción Nacional", color: "#1d4ed8", alliance: "Fuerza y Corazón por México" },
  PRI: { name: "Partido Revolucionario Institucional", color: "#15803d", alliance: "Fuerza y Corazón por México" },
  MC: { name: "Movimiento Ciudadano", color: "#ea580c", alliance: "Independiente" },
  PVEM: { name: "Partido Verde Ecologista de México", color: "#16a34a", alliance: "Sigamos Haciendo Historia" },
  PT: { name: "Partido del Trabajo", color: "#dc2626", alliance: "Sigamos Haciendo Historia" },
  PRD: { name: "Partido de la Revolución Democrática", color: "#eab308", alliance: "Fuerza y Corazón por México" },
  IND: { name: "Candidatura Independiente / Otros", color: "#4b5563", alliance: "Independiente" }
};

// Sesgos regionales reales basados en tendencias electorales históricas de México
const REGIONAL_BIASES = {
  "aguascalientes": { PAN: 16, MORENA: -12, PRI: 2 },
  "baja california": { MORENA: 8, PAN: -2, PRI: -3, MC: 2 },
  "baja california sur": { MORENA: 10, PAN: -5, PRI: -3 },
  "campeche": { MORENA: 12, PAN: -8, PRI: -4, MC: 8 },
  "chiapas": { MORENA: 22, PVEM: 12, PAN: -14, PRI: -8 },
  "chihuahua": { PAN: 18, MORENA: -10, PRI: 4 },
  "ciudad de méxico": { MORENA: 10, PAN: 6, PRI: -6, MC: 2, PRD: 3 },
  "coahuila": { PRI: 22, PAN: 4, MORENA: -12 },
  "colima": { MORENA: 8, PAN: -2, PRI: 2 },
  "durango": { PRI: 16, PAN: 4, MORENA: -8 },
  "estado de méxico": { MORENA: 8, PRI: 6, PAN: 2 },
  "guanajuato": { PAN: 26, MORENA: -20, PRI: -2, MC: -2 },
  "guerrero": { MORENA: 22, PRI: -6, PAN: -14, PRD: 5 },
  "hidalgo": { MORENA: 14, PRI: 8, PAN: -6 },
  "jalisco": { MC: 26, MORENA: 6, PAN: -12, PRI: -8 },
  "michoacán": { MORENA: 8, PRD: 8, PRI: 2, PAN: -2 },
  "morelos": { MORENA: 10, PAN: -2, PRI: -2 },
  "nayarit": { MORENA: 8, PAN: -4, PRI: -4 },
  "nuevo león": { MC: 24, PAN: 12, PRI: 4, MORENA: -16 },
  "oaxaca": { MORENA: 18, PRD: 3, PRI: -6, PAN: -10 },
  "puebla": { MORENA: 10, PAN: 2, PRI: -2 },
  "querétaro": { PAN: 24, MORENA: -14, PRI: -2 },
  "quintana roo": { MORENA: 16, PVEM: 6, PAN: -6 },
  "san luis potosí": { PVEM: 26, MORENA: 4, PAN: -8, PRI: -5 },
  "sinaloa": { MORENA: 14, PRI: 4, PAN: -4 },
  "sonora": { MORENA: 12, MC: 4, PAN: 2, PRI: -2 },
  "tabasco": { MORENA: 36, PAN: -20, PRI: -10, PVEM: 3 },
  "tamaulipas": { MORENA: 10, PAN: 4, PRI: -3 },
  "tlaxcala": { MORENA: 12, PAN: -6, PRI: -4 },
  "veracruz": { MORENA: 12, PAN: 4, PRI: 2 },
  "yucatán": { PAN: 12, MORENA: 8, PRI: -6 },
  "zacatecas": { MORENA: 12, PRI: 4, PAN: -4 }
};

// Generador de ruido pseudo-aleatorio estable (determinista) para simular variabilidad local real por municipio
function getDeterministicNoise(string, party) {
  const str = string + party;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ((Math.abs(hash) % 60) - 30) / 10; // Rango [-3%, +3%]
}

export default function MacroSimulator({ seed = "CIVICA_OS_2026" }) {
  const [filters, setFilters] = useState({ 
    state: "Sonora", 
    type: "Municipal", 
    risk: "all", 
    municipality: "Todos" 
  });
  const [expanded, setExpanded] = useState(false);

  // Obtener la lista única de los 32 estados a partir de electoral_scenarios.json
  const statesList = useMemo(() => {
    const unique = [...new Set(electoralScenarios.map(d => d.state))].filter(Boolean);
    return unique.map(s => ({ id: s, name: s })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  // Obtener la lista de municipios correspondientes al estado seleccionado
  const municipalitiesList = useMemo(() => {
    const munis = electoralScenarios.filter(d => d.state === filters.state && d.level === "Municipio");
    return munis.map(m => {
      // Limpiar prefijos redundantes
      let displayName = m.name.replace(/^Alcaldía\s*\/\s*Municipio\s*de\s*/i, "");
      return { id: m.code, name: displayName, raw: m };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [filters.state]);

  // Motor electoral de Macro-Simulador N-Way Softmax
  const data = useMemo(() => {
    // 1. Obtener demografía (weights) consolidada del estado o específica del municipio
    let weights = { comerciante: 0.3, joven: 0.3, obrero: 0.4 };
    let population = 100000;
    let locationCode = filters.state;

    if (filters.municipality === "Todos") {
      // Promediar pesos de todos los municipios del estado
      const munis = electoralScenarios.filter(d => d.state === filters.state && d.level === "Municipio");
      if (munis.length > 0) {
        population = munis.reduce((acc, m) => acc + m.population, 0);
        const count = munis.length;
        weights = {
          comerciante: munis.reduce((acc, m) => acc + (m.weights.comerciante || 0), 0) / count,
          joven: munis.reduce((acc, m) => acc + (m.weights.joven || 0), 0) / count,
          obrero: munis.reduce((acc, m) => acc + (m.weights.obrero || 0), 0) / count
        };
      }
    } else {
      // Cargar datos del municipio seleccionado
      const muni = electoralScenarios.find(d => d.code === filters.municipality);
      if (muni) {
        population = muni.population;
        weights = muni.weights;
        locationCode = muni.code;
      }
    }

    // Base nacional de voto de partidos políticos de México
    const parties = ["MORENA", "PAN", "PRI", "MC", "PVEM", "PT", "PRD", "IND"];
    const baseSupport = { MORENA: 36, PAN: 18, PRI: 10, MC: 11, PVEM: 5, PT: 4, PRD: 2, IND: 4 };

    // Sesgo estatal
    const stateKey = filters.state.toLowerCase();
    const stateBias = REGIONAL_BIASES[stateKey] || {};

    let rawSupports = {};
    let sumSupports = 0;

    parties.forEach(p => {
      const base = baseSupport[p];
      const bias = stateBias[p] || 0;

      // Impacto demográfico
      let demo = 0;
      if (p === "MC") demo += 16 * (weights.joven || 0.3);
      if (p === "MORENA") {
        demo += 6 * (weights.joven || 0.3);
        demo += 12 * (weights.obrero || 0.4);
      }
      if (p === "PAN") {
        demo += 14 * (weights.comerciante || 0.3);
        demo -= 6 * (weights.joven || 0.3);
      }
      if (p === "PRI") {
        demo += 6 * (weights.obrero || 0.4);
        demo += 3 * (weights.comerciante || 0.3);
      }

      // Sesgo según el nivel de la elección
      let levelBias = 0;
      if (filters.type === "Federal") {
        if (p === "MORENA") levelBias += 3;
        if (p === "PAN" || p === "PRI") levelBias -= 1;
      } else if (filters.type === "Municipal") {
        if (p === "IND") levelBias += 5;
        if (p === "MORENA") levelBias -= 2;
      }

      // Volatilidad determinista local
      const noise = getDeterministicNoise(locationCode + seed, p);

      let val = base + bias + demo + levelBias + noise;
      if (val < 0.5) val = 0.5; // Umbral mínimo del 0.5%
      rawSupports[p] = val;
      sumSupports += val;
    });

    // Normalizar a 100% y aplicar N-Way Softmax para probabilidad de victoria
    const results = parties.map(p => {
      const estimatedVote = (rawSupports[p] / sumSupports) * 100;
      return {
        id: p,
        party: p,
        estimatedVote
      };
    });

    // Función Softmax con temperatura regulada para la victoria
    const temp = 7.0;
    const exps = results.map(r => Math.exp(r.estimatedVote / temp));
    const sumExp = exps.reduce((acc, v) => acc + v, 0);

    const withProb = results.map((r, idx) => ({
      ...r,
      winProbability: (exps[idx] / sumExp) * 100
    }));

    // Ordenar de mayor a menor intención de voto
    withProb.sort((a, b) => b.estimatedVote - a.estimatedVote);

    // Calcular spread y nivel de riesgo
    const formatted = withProb.map((c, idx, arr) => {
      let spread = 0;
      if (idx === 0) {
        spread = arr.length > 1 ? c.estimatedVote - arr[1].estimatedVote : 0;
      } else {
        spread = c.estimatedVote - arr[0].estimatedVote;
      }

      return {
        id: c.id,
        party: c.party,
        name: PARTY_DETAILS[c.party].name,
        estimatedVote: parseFloat(c.estimatedVote.toFixed(2)),
        winProbability: parseFloat(c.winProbability.toFixed(2)),
        spread: parseFloat(spread.toFixed(2)),
        riskLevel: ""
      };
    });

    // Determinar la competitividad (Riesgo) de la elección basándose en el margen del líder
    const leadSpread = formatted[0].spread;
    const electionRisk = leadSpread < 4.0 ? "alto" : leadSpread < 10.0 ? "medio" : "bajo";

    const finalData = formatted.map(f => ({
      ...f,
      riskLevel: electionRisk
    }));

    if (filters.risk !== "all") {
      return finalData.filter(d => d.riskLevel === filters.risk);
    }
    return finalData;
  }, [filters, seed]);

  return (
    <div className="glass-panel" style={{ padding: 20 }}>
      <h2 style={{ fontFamily: "var(--font-heading)", margin: "0 0 15px", color: "var(--neon-cyan)" }}>🗳️ Macro-Simulador Electoral N-Way (Softmax)</h2>
      
      <div style={{ display: "flex", gap: 10, marginBottom: 15, flexWrap: "wrap" }}>
        {/* Selector de Estado */}
        <select 
          value={filters.state} 
          onChange={e => setFilters(f => ({...f, state: e.target.value, municipality: "Todos"}))} 
          style={{ background: "#1e293b", color: "#fff", border: "1px solid var(--border-subtle)", padding: 8, borderRadius: 6 }}
        >
          {statesList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        
        {/* Selector de Municipio */}
        <select 
          value={filters.municipality} 
          onChange={e => setFilters(f => ({...f, municipality: e.target.value}))} 
          style={{ background: "#1e293b", color: "#fff", border: "1px solid var(--border-subtle)", padding: 8, borderRadius: 6 }}
        >
          <option value="Todos">Todos los Municipios</option>
          {municipalitiesList.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        {/* Nivel y Competitividad */}
        {["type", "risk"].map(key => (
          <select 
            key={key} 
            value={filters[key]} 
            onChange={e => setFilters(f => ({...f, [key]: e.target.value}))} 
            style={{ background: "#1e293b", color: "#fff", border: "1px solid var(--border-subtle)", padding: 8, borderRadius: 6 }}
          >
            {key === "type" && (
              <>
                <option value="Municipal">Nivel Municipal (Alcaldía)</option>
                <option value="Estatal">Nivel Estatal (Gubernatura)</option>
                <option value="Federal">Nivel Federal (Presidencial)</option>
              </>
            )}
            {key === "risk" && (
              <>
                <option value="all">Competitividad: Todas</option>
                <option value="alto">Alto Riesgo (Muy Cerrada)</option>
                <option value="medio">Medio (Ventaja Moderada)</option>
                <option value="bajo">Bajo (Líder Consolidado)</option>
              </>
            )}
          </select>
        ))}
      </div>

      <table className="civica-table">
        <thead>
          <tr>
            <th>Partido Político / Coalición</th>
            <th>Voto Estimado (%)</th>
            <th>Prob. Victoria (%)</th>
            <th>Spread (vs Líder)</th>
            <th>Competitividad Local</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map(d => (
              <tr key={d.id}>
                <td>
                  <span style={{ color: PARTY_DETAILS[d.party]?.color || '#888', marginRight: 8, fontSize: "1.2rem" }}>●</span>
                  <b>{d.name}</b> 
                  <span style={{ color: "#64748b", fontSize: 11, marginLeft: 6 }}>({d.party})</span>
                  <div style={{ fontSize: 10, color: "#94a3b8", paddingLeft: 18 }}>{PARTY_DETAILS[d.party]?.alliance}</div>
                </td>
                <td style={{ color: "var(--accent-cyan)", fontWeight: "700" }}>{d.estimatedVote}%</td>
                <td style={{ fontWeight: "700" }}>{d.winProbability}%</td>
                <td style={{ color: d.spread > 0 ? "var(--accent-emerald)" : "#94a3b8" }}>
                  {d.spread > 0 ? `+${d.spread}` : `${d.spread}`}%
                </td>
                <td>
                  <span className={`badge ${d.riskLevel === "bajo" ? "badge-live" : d.riskLevel === "medio" ? "badge-offline" : "badge-offline"}`} style={{
                    borderColor: d.riskLevel === "bajo" ? "#10b981" : d.riskLevel === "medio" ? "#f59e0b" : "#ef4444",
                    color: d.riskLevel === "bajo" ? "#10b981" : d.riskLevel === "medio" ? "#f59e0b" : "#ef4444"
                  }}>
                    {d.riskLevel === "bajo" ? "Baja Competencia" : d.riskLevel === "medio" ? "Competida" : "Altamente Cerrada"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", color: "#64748b" }}>
                Sin resultados bajo este filtro de competitividad.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <button 
        onClick={() => setExpanded(!expanded)} 
        style={{ marginTop: 12, background: "transparent", border: "1px solid var(--accent-cyan)", color: "var(--accent-cyan)", padding: "6px 12px", borderRadius: 6, cursor: "pointer", transition: "all 0.2s" }}
      >
        {expanded ? "▲ Ocultar detalles técnicos" : "▼ Expandir matriz de correlación"}
      </button>
      {expanded && (
        <pre style={{ marginTop: 10, background: "#0f172a", padding: 10, borderRadius: 6, overflowX: "auto", fontSize: 11, fontFamily: "var(--font-mono)", color: "#a1a1aa" }}>
          {JSON.stringify({ seed, filters, resultsCount: data.length, data, note: "Motor Softmax calibrado a nivel nacional. Sin Math.random() en render para consistencia." }, null, 2)}
        </pre>
      )}
    </div>
  );
}
