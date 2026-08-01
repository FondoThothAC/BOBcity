package osintengine

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// SiteData represents the configuration for a single site to check.
type SiteData struct {
	Name         string
	URLMain      string
	URL          string
	ErrorType    string // "status_code", "message"
	ErrorMessage string // Message to look for if ErrorType == "message"
}

// SherlockScraper is the native Go implementation of Sherlock
type SherlockScraper struct {
	sites []SiteData
}

// NewSherlockScraper creates a new instance of SherlockScraper
func NewSherlockScraper() *SherlockScraper {
	// A small sample of the 300+ sites Sherlock checks.
	// In a full deployment, this would be loaded from a large data.json file.
	return &SherlockScraper{
		sites: []SiteData{
			{Name: "GitHub", URLMain: "https://github.com/", URL: "https://github.com/%s", ErrorType: "status_code"},
			{Name: "GitLab", URLMain: "https://gitlab.com/", URL: "https://gitlab.com/%s", ErrorType: "status_code"},
			{Name: "DockerHub", URLMain: "https://hub.docker.com/", URL: "https://hub.docker.com/v2/users/%s", ErrorType: "status_code"},
			{Name: "Dev.to", URLMain: "https://dev.to/", URL: "https://dev.to/%s", ErrorType: "status_code"},
			{Name: "Medium", URLMain: "https://medium.com/", URL: "https://medium.com/@%s", ErrorType: "status_code"},
			{Name: "Pinterest", URLMain: "https://www.pinterest.com/", URL: "https://www.pinterest.com/%s/", ErrorType: "status_code"},
			{Name: "Instagram", URLMain: "https://www.instagram.com/", URL: "https://www.instagram.com/%s/", ErrorType: "status_code"},
			{Name: "Reddit", URLMain: "https://www.reddit.com/", URL: "https://www.reddit.com/user/%s/about.json", ErrorType: "status_code"},
			{Name: "X", URLMain: "https://x.com/", URL: "https://x.com/%s", ErrorType: "status_code"},
			{Name: "TikTok", URLMain: "https://www.tiktok.com/", URL: "https://www.tiktok.com/@%s", ErrorType: "status_code"},
		},
	}
}

func (s *SherlockScraper) Name() string {
	return "Sherlock_Go_Native"
}

func (s *SherlockScraper) Category() TargetType {
	return TargetTypeUsername
}

// Execute performs high-speed concurrent HTTP checks across all configured sites.
func (s *SherlockScraper) Execute(ctx context.Context, target string) ([]OSINTMatch, error) {
	// Use a highly optimized HTTP client for mass concurrent requests
	transport := &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 10,
		IdleConnTimeout:     10 * time.Second,
	}
	client := &http.Client{
		Timeout:   5 * time.Second,
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			// Don't follow redirects by default for strict status_code checks
			return http.ErrUseLastResponse
		},
	}

	matchChan := make(chan OSINTMatch, len(s.sites))
	var wg sync.WaitGroup

	// Use a worker pool or bounded concurrency if sites count > 500
	// For ~400 sites, raw goroutines are fine.
	for _, site := range s.sites {
		wg.Add(1)
		go func(cfg SiteData) {
			defer wg.Done()
			profileURL := fmt.Sprintf(cfg.URL, target)
			
			req, err := http.NewRequestWithContext(ctx, "GET", profileURL, nil)
			if err != nil {
				return
			}
			
			// Spoof headers to avoid basic blocks
			req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
			req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8")
			req.Header.Set("Accept-Language", "en-US,en;q=0.5")

			resp, err := client.Do(req)
			if err != nil {
				return
			}
			defer resp.Body.Close()

			// Simple status code check logic (extendable to check body content)
			if resp.StatusCode == http.StatusOK {
				matchChan <- OSINTMatch{
					Category:   string(TargetTypeUsername),
					Source:     cfg.Name,
					URL:        fmt.Sprintf(cfg.URLMain, target), // Using Main URL + Target for cleaner output
					Confidence: 0.95,
					Metadata: map[string]string{
						"status_code": "200",
						"engine":      "sherlock_go",
					},
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
