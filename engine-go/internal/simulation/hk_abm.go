// Package simulation implementa los modelos matemáticos y simulaciones sociales del CívicaOS Engine en Go.
package simulation

import (
	"math"
	"math/rand"
	"sync"
	"time"
)

// Agent representa un agente sintético dentro de la población de simulación.
type Agent struct {
	ID             int     `json:"id"`
	Opinion        float64 `json:"opinion"`         // Postura política/social entre 0.0 y 1.0
	TransportPain  float64 `json:"transport_pain"`  // Inconformidad por transporte
	WaterPain      float64 `json:"water_pain"`      // Inconformidad por servicios de agua
	SecurityPain   float64 `json:"security_pain"`   // Inconformidad por seguridad pública
	Satisfaction   float64 `json:"satisfaction"`    // Nivel global de satisfacción [0.0, 1.0]
}

// ABMParams define los parámetros de entrada para la simulación Hegselmann-Krause.
type ABMParams struct {
	AgentsCount     int     `json:"agents_count"`
	Epsilon         float64 `json:"epsilon"`          // Umbral de tolerancia acotada (ej. 0.2)
	Iterations      int     `json:"iterations"`       // Número de pasos de tiempo (ej. 15)
	PolicyTransport float64 `json:"policy_transport"` // Inversión/subsidio en transporte
	PolicyWater     float64 `json:"policy_water"`     // Inversión en infraestructura hídrica
	PolicySecurity  float64 `json:"policy_security"`  // Inversión en seguridad pública
}

// StepResult almacena la métrica consolidada de cada iteración de tiempo.
type StepResult struct {
	Step               int       `json:"step"`
	AverageOpinion     float64   `json:"average_opinion"`
	AverageSatisfaction float64  `json:"average_satisfaction"`
	Opinions           []float64 `json:"opinions"`
}

// ABMResult contiene los resultados totales de la simulación.
type ABMResult struct {
	ExecutionTimeMs float64      `json:"execution_time_ms"`
	InitialPain     float64      `json:"initial_pain"`
	FinalPain       float64      `json:"final_pain"`
	PainReductionPct float64     `json:"pain_reduction_pct"`
	History         []StepResult `json:"history"`
	FinalAgents     []Agent      `json:"final_agents"`
}

// RunHegselmannKrause ejecuta el modelo de simulación de opinión acotada usando goroutines y concurrencia.
func RunHegselmannKrause(params ABMParams) ABMResult {
	startTime := time.Now()

	if params.AgentsCount <= 0 {
		params.AgentsCount = 200
	}
	if params.Epsilon <= 0 {
		params.Epsilon = 0.2
	}
	if params.Iterations <= 0 {
		params.Iterations = 10
	}

	r := rand.New(rand.NewSource(time.Now().UnixNano()))

	// 1. Inicializar la población de agentes sintéticos
	agents := make([]Agent, params.AgentsCount)
	totalInitialPain := 0.0

	for i := 0; i < params.AgentsCount; i++ {
		tPain := math.Max(0, r.Float64()*100.0-params.PolicyTransport*2.0)
		wPain := math.Max(0, r.Float64()*100.0-params.PolicyWater*2.0)
		sPain := math.Max(0, r.Float64()*100.0-params.PolicySecurity*2.0)

		initialPain := (tPain + wPain + sPain) / 3.0
		totalInitialPain += initialPain

		agents[i] = Agent{
			ID:             i,
			Opinion:        r.Float64(), // Postura aleatoria inicial entre 0 y 1
			TransportPain:  tPain,
			WaterPain:      wPain,
			SecurityPain:   sPain,
			Satisfaction:   math.Max(0, 1.0-(initialPain/100.0)),
		}
	}

	avgInitialPain := totalInitialPain / float64(params.AgentsCount)
	history := make([]StepResult, 0, params.Iterations)

	// 2. Bucle de iteraciones del modelo HK
	for step := 0; step < params.Iterations; step++ {
		nextOpinions := make([]float64, params.AgentsCount)

		// Paralelizar la actualización de opiniones usando Goroutines y WaitGroup
		var wg sync.WaitGroup
		numWorkers := 8
		chunkSize := (params.AgentsCount + numWorkers - 1) / numWorkers

		for w := 0; w < numWorkers; w++ {
			start := w * chunkSize
			end := start + chunkSize
			if start >= params.AgentsCount {
				break
			}
			if end > params.AgentsCount {
				end = params.AgentsCount
			}

			wg.Add(1)
			go func(startIndex, endIndex int) {
				defer wg.Done()
				for i := startIndex; i < endIndex; i++ {
					sumOpinions := 0.0
					countNeighbors := 0

					for j := 0; j < params.AgentsCount; j++ {
						diff := math.Abs(agents[i].Opinion - agents[j].Opinion)
						if diff <= params.Epsilon {
							sumOpinions += agents[j].Opinion
							countNeighbors++
						}
					}

					if countNeighbors > 0 {
						nextOpinions[i] = sumOpinions / float64(countNeighbors)
					} else {
						nextOpinions[i] = agents[i].Opinion
					}
				}
			}(start, end)
		}

		wg.Wait()

		// Actualizar opiniones e inspeccionar promedios
		sumOp := 0.0
		sumSat := 0.0
		opinionsSnapshot := make([]float64, params.AgentsCount)

		for i := 0; i < params.AgentsCount; i++ {
			agents[i].Opinion = nextOpinions[i]
			opinionsSnapshot[i] = nextOpinions[i]
			sumOp += nextOpinions[i]
			sumSat += agents[i].Satisfaction
		}

		history = append(history, StepResult{
			Step:               step + 1,
			AverageOpinion:     sumOp / float64(params.AgentsCount),
			AverageSatisfaction: sumSat / float64(params.AgentsCount),
			Opinions:           opinionsSnapshot,
		})
	}

	// 3. Calcular dolor final y porcentaje de reducción
	totalFinalPain := 0.0
	for i := 0; i < params.AgentsCount; i++ {
		finalAgentPain := (agents[i].TransportPain + agents[i].WaterPain + agents[i].SecurityPain) / 3.0
		totalFinalPain += finalAgentPain
	}
	avgFinalPain := totalFinalPain / float64(params.AgentsCount)

	painReductionPct := 0.0
	if avgInitialPain > 0 {
		painReductionPct = ((avgInitialPain - avgFinalPain) / avgInitialPain) * 100.0
	}

	execTime := float64(time.Since(startTime).Microseconds()) / 1000.0

	return ABMResult{
		ExecutionTimeMs:  execTime,
		InitialPain:      avgInitialPain,
		FinalPain:        avgFinalPain,
		PainReductionPct: painReductionPct,
		History:          history,
		FinalAgents:      agents,
	}
}
