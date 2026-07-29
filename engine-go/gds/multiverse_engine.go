package gds

import (
	"context"
	"math/rand"
	"sync"
	"time"
)

// TimelineResult representa la convergencia de un mundo/posibilidad en la simulación.
type TimelineResult struct {
	TimelineID       int       `json:"timeline_id"`
	PolicyVariant    string    `json:"policy_variant"`
	HappinessIndex   float32   `json:"happiness_index"`
	ElectoralSuccess float32   `json:"electoral_success"`
	SocialChaosRisk  float32   `json:"social_chaos_risk"`
	ExecutionTimeMs  int64     `json:"execution_time_ms"`
}

// MultiverseEngine coordina la simulación masiva paralelizada estilo Doctor Strange / Emergence World.
type MultiverseEngine struct {
	WorkerPoolSize int
	batchPool      sync.Pool
}

// NewMultiverseEngine crea un motor de simulación asignando pools reutilizables de memoria.
func NewMultiverseEngine(numWorkers int) *MultiverseEngine {
	return &MultiverseEngine{
		WorkerPoolSize: numWorkers,
		batchPool: sync.Pool{
			New: func() interface{} {
				return NewAgentBatchDOD(1000)
			},
		},
	}
}

// ExplorePossibilities simula N mundos o escenarios concurrentemente sobre goroutines.
func (m *MultiverseEngine) ExplorePossibilities(ctx context.Context, numTimelines int, policyBase string) []TimelineResult {
	results := make([]TimelineResult, numTimelines)
	var wg sync.WaitGroup
	semaphore := make(chan struct{}, m.WorkerPoolSize)

	for i := 0; i < numTimelines; i++ {
		wg.Add(1)
		semaphore <- struct{}{}

		go func(timelineID int) {
			defer wg.Done()
			defer func() { <-semaphore }()

			startTime := time.Now()

			// Reutilizar bloque de memoria contigua desde el sync.Pool (Zero Allocation)
			batch := m.batchPool.Get().(*AgentBatchDOD)
			defer m.batchPool.Put(batch)

			// Simulación Monte Carlo del impacto social
			r := rand.New(rand.NewSource(time.Now().UnixNano() + int64(timelineID)))
			
			var totalHappiness float32
			for a := 0; a < batch.Count; a++ {
				// Simular perturbación de políticas sobre la matriz DOD
				noise := float32(r.NormFloat64() * 0.05)
				baseVal := batch.GetParameter(a, 0) + noise
				batch.SetParameter(a, 0, baseVal)

				sentiment := float32(0.5) + baseVal*0.2
				if sentiment > 1.0 {
					sentiment = 1.0
				}
				totalHappiness += sentiment
			}

			avgHappiness := totalHappiness / float32(batch.Count)
			electoralProb := avgHappiness * 0.85
			chaosRisk := (1.0 - avgHappiness) * 0.3

			results[timelineID] = TimelineResult{
				TimelineID:       timelineID,
				PolicyVariant:    policyBase,
				HappinessIndex:   avgHappiness,
				ElectoralSuccess: electoralProb,
				SocialChaosRisk:  chaosRisk,
				ExecutionTimeMs:  time.Since(startTime).Milliseconds(),
			}
		}(i)
	}

	wg.Wait()
	return results
}
