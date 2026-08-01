package ai

import (
	"context"
	"testing"
)

// TestExecuteSwarm valida la orquestación concurrente de agentes sintéticos de IA.
func TestExecuteSwarm(t *testing.T) {
	ctx := context.Background()
	req := SwarmRequest{
		Prompt:      "Análisis de transporte público y movilidad cívica",
		Model:       "qwen2.5:14b",
		AgentsCount: 3,
	}

	result := ExecuteSwarm(ctx, req)

	if len(result.AgentDetails) != 3 {
		t.Errorf("Se esperaban 3 respuestas de agentes, se obtuvieron %d", len(result.AgentDetails))
	}

	if result.Consensus == "" {
		t.Errorf("El resumen de consenso no debe estar vacío")
	}

	if result.ExecutionTimeMs <= 0 {
		t.Errorf("El tiempo de ejecución debe ser mayor a 0ms")
	}

	t.Logf("✅ Swarm AI con 3 agentes ejecutado en %.2f ms (Modelo: %s)", result.ExecutionTimeMs, result.ModelUsed)
}
