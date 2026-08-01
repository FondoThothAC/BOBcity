package osintengine

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// UsernameSiteConfig define los endpoints de verificación de nombres de usuario.
type UsernameSiteConfig struct {
	SiteName string
	URLFormat string
}

// UsernameReconScraper implementa el módulo de rastreo de usuarios nativo en Go.
type UsernameReconScraper struct {
	sites []UsernameSiteConfig
}

// NewUsernameReconScraper instancia el rastreador de nombres de usuario.
func NewUsernameReconScraper() *UsernameReconScraper {
	return &UsernameReconScraper{
		sites: []UsernameSiteConfig{
			{SiteName: "GitHub", URLFormat: "https://github.com/%s"},
			{SiteName: "GitLab", URLFormat: "https://gitlab.com/%s"},
			{SiteName: "DockerHub", URLFormat: "https://hub.docker.com/u/%s"},
			{SiteName: "Dev.to", URLFormat: "https://dev.to/%s"},
			{SiteName: "Medium", URLFormat: "https://medium.com/@%s"},
			{SiteName: "Pinterest", URLFormat: "https://www.pinterest.com/%s/"},
		},
	}
}

func (s *UsernameReconScraper) Name() string {
	return "UsernameReconNativeGo"
}

func (s *UsernameReconScraper) Category() TargetType {
	return TargetTypeUsername
}

// Execute realiza comprobaciones HTTP concurrentes sin bloquear hilos.
func (s *UsernameReconScraper) Execute(ctx context.Context, target string) ([]OSINTMatch, error) {
	client := &http.Client{Timeout: 3 * time.Second}
	matchChan := make(chan OSINTMatch, len(s.sites))
	var wg sync.WaitGroup

	for _, site := range s.sites {
		wg.Add(1)
		go func(cfg UsernameSiteConfig) {
			defer wg.Done()
			profileURL := fmt.Sprintf(cfg.URLFormat, target)
			req, err := http.NewRequestWithContext(ctx, "GET", profileURL, nil)
			if err != nil {
				return
			}
			req.Header.Set("User-Agent", "Mozilla/5.0 (CívicaOS OSINT Engine Go)")

			resp, err := client.Do(req)
			if err == nil {
				defer resp.Body.Close()
				if resp.StatusCode == http.StatusOK {
					matchChan <- OSINTMatch{
						Category:   string(TargetTypeUsername),
						Source:     cfg.SiteName,
						URL:        profileURL,
						Confidence: 0.95,
						Metadata: map[string]string{
							"status_code": "200",
						},
					}
				}
			}
		}(site)
	}

	wg.Wait()
	close(matchChan)

	matches := make([]OSINTMatch, 0)
	for m := range matchChan {
		matches = append(matches, m)
	}

	return matches, nil
}
