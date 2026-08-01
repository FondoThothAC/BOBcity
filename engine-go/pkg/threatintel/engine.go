// Package threatintel implementa threat intelligence OSINT.
package threatintel

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// ThreatResult resultado de threat intelligence
type ThreatResult struct {
	Target      string            `json:"target"`
	TargetType  string            `json:"target_type"` // ip, domain, hash, url
	ThreatLevel string            `json:"threat_level"` // clean, suspicious, malicious
	Score       float64           `json:"score"` // 0-100
	Engines     []EngineResult    `json:"engines,omitempty"`
	Malware     []MalwareInfo     `json:"malware,omitempty"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

type EngineResult struct {
	Engine string `json:"engine"`
	Result string `json:"result"` // clean, malicious, suspicious
	Score  int    `json:"score"`
}

type MalwareInfo struct {
	Name       string `json:"name"`
	Type       string `json:"type"`
	Detection  string `json:"detection"`
}

type Scraper interface {
	Name() string
	Lookup(ctx context.Context, target, targetType string) (*ThreatResult, error)
}

type Engine struct {
	scrapers []Scraper
}

func NewEngine() *Engine {
	e := &Engine{
		scrapers: make([]Scraper, 0),
	}
	e.Register(&VirusTotalScraper{})
	e.Register(&OTXScraper{})
	e.Register(&URLhausScraper{})
	e.Register(&ThreatFoxScraper{})
	return e
}

func (e *Engine) Register(s Scraper) {
	e.scrapers = append(e.scrapers, s)
}

func (e *Engine) Lookup(ctx context.Context, target, targetType string) *ThreatResult {
	result := &ThreatResult{
		Target:     target,
		TargetType: targetType,
		Metadata:   make(map[string]string),
	}

	for _, s := range e.scrapers {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Lookup(ctx, target, targetType)
		if err == nil && partial != nil {
			result.Engines = append(result.Engines, partial.Engines...)
			result.Malware = append(result.Malware, partial.Malware...)
		}
	}

	// Calculate overall threat level
	result.Score, result.ThreatLevel = calculateThreatLevel(result.Engines)
	return result
}

func calculateThreatLevel(engines []EngineResult) (float64, string) {
	if len(engines) == 0 {
		return 0, "unknown"
	}
	total := 0
	for _, e := range engines {
		total += e.Score
	}
	avg := float64(total) / float64(len(engines))

	switch {
	case avg >= 70:
		return avg, "malicious"
	case avg >= 40:
		return avg, "suspicious"
	default:
		return avg, "clean"
	}
}

// --- VirusTotal Scraper (requiere API key) ---
type VirusTotalScraper struct{}

func (s *VirusTotalScraper) Name() string { return "VirusTotal" }

func (s *VirusTotalScraper) Lookup(ctx context.Context, target, targetType string) (*ThreatResult, error) {
	// Requires VIRUSTOTAL_API_KEY env var
	return &ThreatResult{
		Target: target,
		Metadata: map[string]string{
			"note": "Requires VIRUSTOTAL_API_KEY environment variable",
		},
	}, nil
}

// --- AlienVault OTX Scraper ---
type OTXScraper struct{}

func (s *OTXScraper) Name() string { return "OTX" }

func (s *OTXScraper) Lookup(ctx context.Context, target, targetType string) (*ThreatResult, error) {
	var url string
	switch targetType {
	case "ip":
		url = fmt.Sprintf("https://otx.alienvault.com/api/v1/indicators/IPv4/%s/general", target)
	case "domain":
		url = fmt.Sprintf("https://otx.alienvault.com/api/v1/indicators/domain/%s/general", target)
	case "hash":
		url = fmt.Sprintf("https://otx.alienvault.com/api/v1/indicators/file/%s/general", target)
	default:
		return nil, fmt.Errorf("unsupported type: %s", targetType)
	}

	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("X-OTX-API-KEY", "free")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("OTX returned %d", resp.StatusCode)
	}

	var data struct {
		PulseCount  int `json:"pulse_count"`
		Reputation  int `json:"reputation"`
		Analysis    struct {
			Sandbox []struct {
				ComputerName string `json:"computer_name"`
				ProcessName  string `json:"process_name"`
			} `json:"sandbox"`
		} `json:"analysis"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 20000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	result := &ThreatResult{
		Target:     target,
		TargetType: targetType,
		Metadata:   make(map[string]string),
	}

	result.Engines = append(result.Engines, EngineResult{
		Engine: "OTX",
		Score:  data.Reputation,
	})

	result.Metadata["pulse_count"] = fmt.Sprintf("%d", data.PulseCount)
	result.Metadata["reputation"] = fmt.Sprintf("%d", data.Reputation)

	return result, nil
}

// --- URLhaus Scraper ---
type URLhausScraper struct{}

func (s *URLhausScraper) Name() string { return "URLhaus" }

func (s *URLhausScraper) Lookup(ctx context.Context, target, targetType string) (*ThreatResult, error) {
	if targetType != "url" && targetType != "domain" {
		return nil, fmt.Errorf("URLhaus only supports url/domain")
	}

	url := "https://urlhaus-api.abuse.ch/v1/url/"
	req, _ := http.NewRequestWithContext(ctx, "POST", url, nil)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		QueriesStatus int `json:"queries_status"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 10000))
	json.Unmarshal(body, &data)

	return &ThreatResult{
		Target:     target,
		TargetType: targetType,
		Metadata:   map[string]string{"source": "urlhaus"},
	}, nil
}

// --- ThreatFox Scraper ---
type ThreatFoxScraper struct{}

func (s *ThreatFoxScraper) Name() string { return "ThreatFox" }

func (s *ThreatFoxScraper) Lookup(ctx context.Context, target, targetType string) (*ThreatResult, error) {
	url := "https://threatfox-api.abuse.ch/api/v1/"
	payload := fmt.Sprintf(`{"query": "search_ioc", "search_term": "%s"}`, target)
	req, _ := http.NewRequestWithContext(ctx, "POST", url, strings.NewReader(payload))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		QueryStatus string `json:"query_status"`
		Data        []struct {
			IOC        string `json:"ioc"`
			ThreatType string `json:"threat_type"`
			Malware    string `json:"malware"`
			Confidence int    `json:"confidence_level"`
		} `json:"data"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 20000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	result := &ThreatResult{
		Target:     target,
		TargetType: targetType,
		Metadata:   make(map[string]string),
	}

	if data.QueryStatus == "ok" && len(data.Data) > 0 {
		for _, d := range data.Data {
			result.Malware = append(result.Malware, MalwareInfo{
				Name:      d.Malware,
				Type:      d.ThreatType,
				Detection: fmt.Sprintf("%d%%", d.Confidence),
			})
		}
		result.Engines = append(result.Engines, EngineResult{
			Engine: "ThreatFox",
			Result: "malicious",
			Score:  80,
		})
	}

	return result, nil
}
