// src/utils/macroSimulatorData.js
/**
 * Genera datos deterministas para comparativa N-Way usando semilla estable.
 * Separa probabilidad de victoria, voto estimado y spread para claridad UX.
 */
export function generateMacroSimData(candidates, seed = "CIVICA_OS_2026") {
  // Hash simple determinístico para evitar resultados aleatorios en cada render
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return candidates.map((c, i) => {
    const base = ((hash * (i + 1)) % 1000) / 10;
    const volatility = (base * 0.15);
    const estimatedVote = Math.max(0, Math.min(100, base));
    const winProbability = Math.max(0, Math.min(100, estimatedVote - volatility));
    const spread = estimatedVote - winProbability;

    return {
      id: c.id,
      name: c.name,
      estimatedVote: parseFloat(estimatedVote.toFixed(2)),
      winProbability: parseFloat(winProbability.toFixed(2)),
      spread: parseFloat(spread.toFixed(2)),
      riskLevel: winProbability < 30 ? "alto" : winProbability < 60 ? "medio" : "bajo"
    };
  });
}
