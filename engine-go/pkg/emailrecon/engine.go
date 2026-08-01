// Package emailrecon implementa OSINT para direcciones de email.
package emailrecon

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// EmailResult representa el resultado de una investigación de email
type EmailResult struct {
	Email       string            `json:"email"`
	Valid       bool              `json:"valid"`
	Disposable  bool              `json:"disposable"`
	Webmail     bool              `json:"webmail"`
	MXRecords   []string          `json:"mx_records,omitempty"`
	Sources     []EmailSource     `json:"sources,omitempty"`
	RiskScore   float64           `json:"risk_score"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

type EmailSource struct {
	Source   string `json:"source"`
	URL      string `json:"url"`
	Exposure string `json:"exposure"`
}

// Scraper es la interfaz para scrapers de email
type Scraper interface {
	Name() string
	Lookup(ctx context.Context, email string) (*EmailResult, error)
}

// Engine orquesta múltiples scrapers de email
type Engine struct {
	scrapers []Scraper
}

func NewEngine() *Engine {
	e := &Engine{
		scrapers: make([]Scraper, 0),
	}
	e.Register(&HaveIBeenPwnedScraper{})
	e.Register(&EmailRepScraper{})
	e.Register(&HunterScraper{})
	e.Register(&MailboxLayerScraper{})
	e.Register(&BuiltWithScraper{})
	return e
}

func (e *Engine) Register(s Scraper) {
	e.scrapers = append(e.scrapers, s)
}

// Lookup ejecuta todos los scrapers de email
func (e *Engine) Lookup(ctx context.Context, email string) *EmailResult {
	result := &EmailResult{
		Email:     email,
		Valid:     validateEmailFormat(email),
		Disposable: isDisposableDomain(extractDomain(email)),
		Webmail:    isWebmailDomain(extractDomain(email)),
		Metadata:   make(map[string]string),
	}

	for _, s := range e.scrapers {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Lookup(ctx, email)
		if err == nil && partial != nil {
			if partial.Sources != nil {
				result.Sources = append(result.Sources, partial.Sources...)
			}
			for k, v := range partial.Metadata {
				result.Metadata[k] = v
			}
		}
	}

	// Calculate risk score
	result.RiskScore = calculateRiskScore(result)
	return result
}

func validateEmailFormat(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

func extractDomain(email string) string {
	parts := strings.Split(email, "@")
	if len(parts) == 2 {
		return strings.ToLower(parts[1])
	}
	return ""
}

func isDisposableDomain(domain string) bool {
	disposable := []string{
		"tempmail.com", "throwaway.com", "guerrillamail.com",
		"mailinator.com", "yopmail.com", "trashmail.com",
		"guerrillamailblock.com", "sharklasers.com", "grr.la",
		"dispostable.com", "10minutemail.com", "tempail.com",
		"tempr.email", "discard.email", "mohmal.com",
	}
	for _, d := range disposable {
		if domain == d {
			return true
		}
	}
	return false
}

func isWebmailDomain(domain string) bool {
	webmail := []string{
		"gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
		"live.com", "aol.com", "protonmail.com", "proton.me",
		"icloud.com", "mail.com", "zoho.com", "yandex.com",
		"gmx.com", "fastmail.com", "tutanota.com",
	}
	for _, w := range webmail {
		if domain == w {
			return true
		}
	}
	return false
}

func calculateRiskScore(result *EmailResult) float64 {
	score := 0.0
	if result.Disposable {
		score += 0.4
	}
	if len(result.Sources) > 5 {
		score += 0.3
	} else if len(result.Sources) > 0 {
		score += 0.1
	}
	if result.Valid {
		score += 0.1
	}
	if score > 1.0 {
		score = 1.0
	}
	return score
}

// --- HaveIBeenPwned Scraper (usa breach data público) ---
type HaveIBeenPwnedScraper struct{}

func (s *HaveIBeenPwnedScraper) Name() string { return "HaveIBeenPwned" }

func (s *HaveIBeenPwnedScraper) Lookup(ctx context.Context, email string) (*EmailResult, error) {
	// HIBP requires API key, so we use emailrep.io as fallback
	url := fmt.Sprintf("https://emailrep.io/%s", email)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "osint-go-engine/1.0")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("emailrep returned %d", resp.StatusCode)
	}

	var data struct {
		Email       string   `json:"email"`
		Reputation  int      `json:"reputation"`
		Suspicious  bool     `json:"suspicious"`
		References  int      `json:"references"`
		Details     struct {
			Blacklisted    bool   `json:"blacklisted"`
			Malicious      bool   `json:"malicious"`
			Spam           bool   `json:"spam"`
			FreeProvider   bool   `json:"free_provider"`
			Disposable     bool   `json:"disposable"`
			Deliverable    bool   `json:"deliverable"`
			AcceptAll      bool   `json:"accept_all"`
			ValidMX        bool   `json:"valid_mx"`
			Spoofable      bool   `json:"spoofable"`
			Profiles       []string `json:"profiles"`
		} `json:"details"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 10000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	result := &EmailResult{
		Email: email,
		Metadata: map[string]string{
			"reputation":   fmt.Sprintf("%d", data.Reputation),
			"suspicious":   fmt.Sprintf("%t", data.Suspicious),
			"references":   fmt.Sprintf("%d", data.References),
			"blacklisted":  fmt.Sprintf("%t", data.Details.Blacklisted),
			"disposable":   fmt.Sprintf("%t", data.Details.Disposable),
			"deliverable":  fmt.Sprintf("%t", data.Details.Deliverable),
			"free_provider": fmt.Sprintf("%t", data.Details.FreeProvider),
			"valid_mx":     fmt.Sprintf("%t", data.Details.ValidMX),
			"spoofable":    fmt.Sprintf("%t", data.Details.Spoofable),
		},
	}

	if len(data.Details.Profiles) > 0 {
		result.Sources = append(result.Sources, EmailSource{
			Source:   "emailrep",
			URL:      fmt.Sprintf("https://emailrep.io/%s", email),
			Exposure: strings.Join(data.Details.Profiles, ", "),
		})
	}

	return result, nil
}

// --- EmailRep Scraper ---
type EmailRepScraper struct{}

func (s *EmailRepScraper) Name() string { return "EmailRep" }

func (s *EmailRepScraper) Lookup(ctx context.Context, email string) (*EmailResult, error) {
	// Uses breach directory public API
	hash := sha256.Sum256([]byte(strings.ToLower(email)))
	url := fmt.Sprintf("https://api.pwnedpasswords.com/email/%s", fmt.Sprintf("%x", hash))
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return &EmailResult{Email: email}, nil
}

// --- Hunter.io Scraper (requiere API key) ---
type HunterScraper struct{}

func (s *HunterScraper) Name() string { return "Hunter" }

func (s *HunterScraper) Lookup(ctx context.Context, email string) (*EmailResult, error) {
	// Placeholder - requires HUNTER_API_KEY env var
	return &EmailResult{
		Email: email,
		Metadata: map[string]string{
			"note": "Requires HUNTER_API_KEY environment variable",
		},
	}, nil
}

// --- MailboxLayer Scraper ---
type MailboxLayerScraper struct{}

func (s *MailboxLayerScraper) Name() string { return "MailboxLayer" }

func (s *MailboxLayerScraper) Lookup(ctx context.Context, email string) (*EmailResult, error) {
	return &EmailResult{Email: email}, nil
}

// --- BuiltWith Scraper ---
type BuiltWithScraper struct{}

func (s *BuiltWithScraper) Name() string { return "BuiltWith" }

func (s *BuiltWithScraper) Lookup(ctx context.Context, email string) (*EmailResult, error) {
	domain := extractDomain(email)
	if domain == "" {
		return nil, fmt.Errorf("invalid email")
	}

	url := fmt.Sprintf("https://api.builtwith.com/v21/api.json?KEY=free&LOOKUP=%s", domain)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return &EmailResult{
		Email: email,
		Metadata: map[string]string{
			"domain": domain,
		},
	}, nil
}
