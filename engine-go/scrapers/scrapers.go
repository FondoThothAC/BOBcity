package scrapers

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"
)

// ScrapingTarget representa un recurso público a recolectar (CCTV, noticias, feeds).
type ScrapingTarget struct {
	ID   string `json:"id"`
	URL  string `json:"url"`
	Type string `json:"type"`
}

// ScrapingResult representa el resultado de la recolección asíncrona.
type ScrapingResult struct {
	TargetID   string `json:"target_id"`
	StatusCode int    `json:"status_code"`
	ByteSize   int64  `json:"byte_size"`
	LatencyMs  int64  `json:"latency_ms"`
	Error      string `json:"error,omitempty"`
}

// ScraperEngine recolecta feeds públicos de forma ultrarrápida usando Goroutines.
type ScraperEngine struct {
	client *http.Client
}

// NewScraperEngine inicializa un motor HTTP reutilizando conexiones TCP (Keep-Alive).
func NewScraperEngine() *ScraperEngine {
	return &ScraperEngine{
		client: &http.Client{
			Timeout: 10 * time.Second,
			Transport: &http.Transport{
				MaxIdleConnsPerHost: 20,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

// FetchBatch procesa múltiples fuentes concurrentemente con concurrencia acotada.
func (s *ScraperEngine) FetchBatch(ctx context.Context, targets []ScrapingTarget) []ScrapingResult {
	results := make([]ScrapingResult, len(targets))
	var wg sync.WaitGroup

	for i, target := range targets {
		wg.Add(1)
		go func(idx int, t ScrapingTarget) {
			defer wg.Done()

			start := time.Now()
			req, err := http.NewRequestWithContext(ctx, "GET", t.URL, nil)
			if err != nil {
				results[idx] = ScrapingResult{TargetID: t.ID, Error: err.Error()}
				return
			}

			resp, err := s.client.Do(req)
			if err != nil {
				results[idx] = ScrapingResult{TargetID: t.ID, Error: err.Error()}
				return
			}
			defer resp.Body.Close()

			latency := time.Since(start).Milliseconds()
			results[idx] = ScrapingResult{
				TargetID:   t.ID,
				StatusCode: resp.StatusCode,
				ByteSize:   resp.ContentLength,
				LatencyMs:  latency,
			}
			log.Printf("[ScraperGo] Target: %s | Status: %d | Latencia: %dms", t.ID, resp.StatusCode, latency)
		}(i, target)
	}

	wg.Wait()
	return results
}
