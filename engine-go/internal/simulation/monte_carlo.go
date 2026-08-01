package simulation

import (
	"math/rand"
	"sync"
	"time"
)

// PredictParams define las variables de simulación electoral Monte Carlo.
type PredictParams struct {
	CandidateA  string `json:"candidate_a"`
	CandidateB  string `json:"candidate_b"`
	Simulations int    `json:"simulations"`
}

// PredictResult almacena las probabilidades proyectadas de triunfo.
type PredictResult struct {
	CandidateA      string  `json:"candidate_a"`
	CandidateB      string  `json:"candidate_b"`
	WinProbabilityA float64 `json:"win_probability_a"`
	WinProbabilityB float64 `json:"win_probability_b"`
	TieProbability  float64 `json:"tie_probability"`
	ExecutionTimeMs float64 `json:"execution_time_ms"`
	TotalSims       int     `json:"total_simulations"`
}

// MonteCarloPredict ejecuta 1,000+ iteraciones electorales paralelas usando goroutines.
func MonteCarloPredict(params PredictParams) PredictResult {
	startTime := time.Now()

	if params.CandidateA == "" {
		params.CandidateA = "Candidato A"
	}
	if params.CandidateB == "" {
		params.CandidateB = "Candidato B"
	}
	if params.Simulations <= 0 {
		params.Simulations = 1000
	}

	numWorkers := 8
	simsPerWorker := params.Simulations / numWorkers

	var winsA, winsB, ties int64
	var mu sync.Mutex
	var wg sync.WaitGroup

	for w := 0; w < numWorkers; w++ {
		wg.Add(1)
		go func(workerID int) {
			defer wg.Done()
			localR := rand.New(rand.NewSource(time.Now().UnixNano() + int64(workerID*1000)))

			localA := 0
			localB := 0
			localTies := 0

			for i := 0; i < simsPerWorker; i++ {
				// Simular votación con ruido estocástico gaussiano
				baseA := 48.5 + (localR.NormFloat64() * 3.5)
				baseB := 47.0 + (localR.NormFloat64() * 3.5)

				if baseA > baseB {
					localA++
				} else if baseB > baseA {
					localB++
				} else {
					localTies++
				}
			}

			mu.Lock()
			winsA += int64(localA)
			winsB += int64(localB)
			ties += int64(localTies)
			mu.Unlock()
		}(w)
	}

	wg.Wait()

	totalProcessed := float64(numWorkers * simsPerWorker)
	probA := (float64(winsA) / totalProcessed) * 100.0
	probB := (float64(winsB) / totalProcessed) * 100.0
	probTie := (float64(ties) / totalProcessed) * 100.0

	execTime := float64(time.Since(startTime).Microseconds()) / 1000.0

	return PredictResult{
		CandidateA:      params.CandidateA,
		CandidateB:      params.CandidateB,
		WinProbabilityA: probA,
		WinProbabilityB: probB,
		TieProbability:  probTie,
		ExecutionTimeMs: execTime,
		TotalSims:       int(totalProcessed),
	}
}
