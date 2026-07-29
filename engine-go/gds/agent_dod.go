package gds

// Estructura DOD (Data-Oriented Design) para el Gemelo Digital Social (GDS-MEGA).
// Se alinean los 1024 parámetros dinámicos por agente sintético en arreglos planos
// de memoria contigua para optimizar el acceso a la caché L1/L2/L3 de la CPU.

const NumParameters = 1024

// AgentBatchDOD representa un bloque de N agentes organizados como Structure of Arrays (SoA).
// Esto evita la fragmentación de punteros y maximiza la velocidad de iteración.
type AgentBatchDOD struct {
	Count      int
	AgentIDs   []uint64
	// Matriz de parámetros plana: Parameters[agente_idx * 1024 + param_idx]
	Parameters []float32
	// Estado de sentimiento consolidado (0.0 a 1.0)
	Sentiment  []float32
	// Geohash Nivel 9 de ubicación (5x5m)
	Geohashes  []uint64
}

// NewAgentBatchDOD instancia un bloque contiguo de agentes de forma eficiente.
func NewAgentBatchDOD(capacity int) *AgentBatchDOD {
	return &AgentBatchDOD{
		Count:      capacity,
		AgentIDs:   make([]uint64, capacity),
		Parameters: make([]float32, capacity*NumParameters),
		Sentiment:  make([]float32, capacity),
		Geohashes:  make([]uint64, capacity),
	}
}

// GetParameter obtiene un parámetro específico de un agente sin alocaciones dinámicas.
func (b *AgentBatchDOD) GetParameter(agentIdx, paramIdx int) float32 {
	return b.Parameters[agentIdx*NumParameters+paramIdx]
}

// SetParameter establece un parámetro específico para un agente sintético.
func (b *AgentBatchDOD) SetParameter(agentIdx, paramIdx int, val float32) {
	b.Parameters[agentIdx*NumParameters+paramIdx] = val
}
