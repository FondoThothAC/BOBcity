package simulation

import (
	"testing"
)

// TestRunHegselmannKrause verifica que la simulación de opinión ABM converja y reporte métricas.
func TestRunHegselmannKrause(t *testing.T) {
	params := ABMParams{
		AgentsCount:     100,
		Epsilon:         0.25,
		Iterations:      10,
		PolicyTransport: 10.0,
		PolicyWater:     10.0,
		PolicySecurity:  10.0,
	}

	result := RunHegselmannKrause(params)

	if len(result.History) != 10 {
		t.Errorf("Esperado historial de 10 pasos, obtenido %d", len(result.History))
	}

	if len(result.FinalAgents) != 100 {
		t.Errorf("Esperado 100 agentes finales, obtenido %d", len(result.FinalAgents))
	}

	if result.ExecutionTimeMs <= 0 {
		t.Errorf("El tiempo de ejecución debe ser mayor a 0ms")
	}

	t.Logf("✅ Simulación ABM de 100 agentes completada en %.2f ms", result.ExecutionTimeMs)
}

// TestMonteCarloPredict verifica la ejecución en paralelo del predictor Monte Carlo.
func TestMonteCarloPredict(t *testing.T) {
	params := PredictParams{
		CandidateA:  "Candidato X",
		CandidateB:  "Candidato Y",
		Simulations: 1000,
	}

	result := MonteCarloPredict(params)

	totalProb := result.WinProbabilityA + result.WinProbabilityB + result.TieProbability
	if totalProb < 99.9 || totalProb > 100.1 {
		t.Errorf("La suma de probabilidades debe ser 100%%, obtenida %.2f%%", totalProb)
	}

	if result.TotalSims < 800 {
		t.Errorf("Se esperaban al menos 800 simulaciones procesadas, obtenidas %d", result.TotalSims)
	}

	t.Logf("✅ Predictor Monte Carlo de 1,000 iteraciones completado en %.2f ms", result.ExecutionTimeMs)
}
