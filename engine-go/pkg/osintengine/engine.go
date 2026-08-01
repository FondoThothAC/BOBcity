// Package osintengine implementa el motor unificado de inteligencia OSINT nativo en Go.
package osintengine

import (
	"context"
	"sync"
	"time"
)

// TargetType define la categoría del objetivo de investigación.
type TargetType string

const (
	TargetTypeUsername TargetType = "username"
	TargetTypeEmail    TargetType = "email"
	TargetTypeDomain   TargetType = "domain"
	TargetTypeIP       TargetType = "ip"
)

// OSINTMatch representa una coincidencia individual encontrada por un módulo de escaneo.
type OSINTMatch struct {
	Category   string            `json:"category"`
	Source     string            `json:"source"`
	URL        string            `json:"url,omitempty"`
	Confidence float64           `json:"confidence"`
	Metadata   map[string]string `json:"metadata,omitempty"`
}

// OSINTReport almacena el expediente consolidado generado por el motor de Go.
type OSINTReport struct {
	Target          string       `json:"target"`
	Type            TargetType   `json:"target_type"`
	ExecutionTimeMs float64      `json:"execution_time_ms"`
	MatchesCount    int          `json:"matches_count"`
	Matches         []OSINTMatch `json:"matches"`
}

// Scraper defines la interfaz estandarizada que debe implementar cualquier módulo OSINT en Go.
type Scraper interface {
	Name() string
	Category() TargetType
	Execute(ctx context.Context, target string) ([]OSINTMatch, error)
}

// Engine orquesta la ejecución paralela y multihilo de los scrapers nativos en Go.
type Engine struct {
	scrapers []Scraper
}

// NewEngine crea una nueva instancia del motor unificado OSINT.
func NewEngine() *Engine {
	e := &Engine{
		scrapers: make([]Scraper, 0),
	}
	// Registrar módulos nativos por defecto
	e.RegisterScraper(NewUsernameReconScraper())
	e.RegisterScraper(NewDomainReconScraper())
	return e
}

// RegisterScraper agrega un nuevo módulo de escaneo al motor.
func (e *Engine) RegisterScraper(s Scraper) {
	e.scrapers = append(e.scrapers, s)
}

// ScanTarget ejecuta en paralelo todos los scrapers compatibles con el objetivo especificado.
func (e *Engine) ScanTarget(ctx context.Context, target string, targetType TargetType) OSINTReport {
	startTime := time.Now()

	matchesChan := make(chan []OSINTMatch, len(e.scrapers))
	var wg sync.WaitGroup

	for _, s := range e.scrapers {
		if s.Category() == targetType || targetType == "" {
			wg.Add(1)
			go func(scraper Scraper) {
				defer wg.Done()
				matches, err := scraper.Execute(ctx, target)
				if err == nil && len(matches) > 0 {
					matchesChan <- matches
				}
			}(s)
		}
	}

	wg.Wait()
	close(matchesChan)

	allMatches := make([]OSINTMatch, 0)
	for matches := range matchesChan {
		allMatches = append(allMatches, matches...)
	}

	execTime := float64(time.Since(startTime).Microseconds()) / 1000.0

	return OSINTReport{
		Target:          target,
		Type:            targetType,
		ExecutionTimeMs: execTime,
		MatchesCount:    len(allMatches),
		Matches:         allMatches,
	}
}
