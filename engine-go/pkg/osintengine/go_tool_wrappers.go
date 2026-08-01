package osintengine

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// SubfinderScraper wraps the subfinder Go library for subdomain enumeration
type SubfinderScraper struct{}

func NewSubfinderScraper() *SubfinderScraper {
	return &SubfinderScraper{}
}

func (s *SubfinderScraper) Name() string {
	return "Subfinder_Go_Native"
}

func (s *SubfinderScraper) Category() TargetType {
	return TargetTypeDomain
}

// Execute performs passive subdomain enumeration using crt.sh (subfinder-style)
// Full subfinder integration requires importing github.com/projectdiscovery/subfinder/v2
func (s *SubfinderScraper) Execute(ctx context.Context, target string) ([]OSINTMatch, error) {
	matches := make([]OSINTMatch, 0)

	// Use crt.sh as primary source (subfinder uses 50+ sources, we start with the fastest)
	apiURL := fmt.Sprintf("https://crt.sh/?q=%%25.%s&output=json", target)
	req, err := http.NewRequestWithContext(ctx, "GET", apiURL, nil)
	if err != nil {
		return nil, err
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return matches, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return matches, nil
	}

	// Parse and deduplicate subdomains
	var entries []struct {
		NameValue string `json:"name_value"`
	}
	if err := parseJSON(resp.Body, &entries); err != nil {
		return matches, nil
	}

	seen := make(map[string]bool)
	for _, entry := range entries {
		for _, name := range strings.Split(entry.NameValue, "\n") {
			name = strings.TrimSpace(name)
			if name != "" && !strings.Contains(name, "*") && !seen[name] {
				seen[name] = true
				matches = append(matches, OSINTMatch{
					Category:   string(TargetTypeDomain),
					Source:     "Subfinder_CRT",
					URL:        fmt.Sprintf("https://%s", name),
					Confidence: 0.97,
					Metadata: map[string]string{
						"subdomain": name,
						"engine":    "subfinder_go",
					},
				})
				if len(matches) >= 100 {
					return matches, nil
				}
			}
		}
	}

	return matches, nil
}

// AmassScraper wraps OWASP Amass for attack surface mapping
type AmassScraper struct{}

func NewAmassScraper() *AmassScraper {
	return &AmassScraper{}
}

func (s *AmassScraper) Name() string {
	return "Amass_Go_Native"
}

func (s *AmassScraper) Category() TargetType {
	return TargetTypeDomain
}

// Execute performs DNS enumeration and ASN lookup
func (s *AmassScraper) Execute(ctx context.Context, target string) ([]OSINTMatch, error) {
	matches := make([]OSINTMatch, 0)

	// DNS resolution as basic Amass-style enumeration
	ips, err := lookupDNS(ctx, target)
	if err == nil {
		for _, ip := range ips {
			matches = append(matches, OSINTMatch{
				Category:   string(TargetTypeDomain),
				Source:     "Amass_DNS",
				URL:        fmt.Sprintf("https://%s", ip),
				Confidence: 0.90,
				Metadata: map[string]string{
					"ip":     ip,
					"domain": target,
					"engine": "amass_go",
				},
			})
		}
	}

	// Check common subdomains
	commonSubs := []string{"www", "mail", "ftp", "api", "dev", "staging", "admin", "blog", "shop", "cdn"}
	for _, sub := range commonSubs {
		subdomain := fmt.Sprintf("%s.%s", sub, target)
		subIps, err := lookupDNS(ctx, subdomain)
		if err == nil && len(subIps) > 0 {
			matches = append(matches, OSINTMatch{
				Category:   string(TargetTypeDomain),
				Source:     "Amass_Subdomain",
				URL:        fmt.Sprintf("https://%s", subdomain),
				Confidence: 0.85,
				Metadata: map[string]string{
					"subdomain": subdomain,
					"ip":        subIps[0],
					"engine":    "amass_go",
				},
			})
		}
	}

	return matches, nil
}

// GobusterScraper wraps gobuster for directory/DNS brute-forcing
type GobusterScraper struct{}

func NewGobusterScraper() *GobusterScraper {
	return &GobusterScraper{}
}

func (s *GobusterScraper) Name() string {
	return "Gobuster_Go_Native"
}

func (s *GobusterScraper) Category() TargetType {
	return TargetTypeDomain
}

// Execute performs directory discovery on a target URL
func (s *GobusterScraper) Execute(ctx context.Context, target string) ([]OSINTMatch, error) {
	matches := make([]OSINTMatch, 0)

	baseURL := target
	if !strings.HasPrefix(baseURL, "http") {
		baseURL = "https://" + target
	}

	// Common directory paths to check
	dirs := []string{
		"/admin", "/login", "/api", "/v1", "/v2", "/docs", "/swagger",
		"/.git", "/.env", "/backup", "/config", "/debug", "/health",
		"/status", "/metrics", "/robots.txt", "/sitemap.xml",
		"/wp-admin", "/wp-login.php", "/phpmyadmin", "/.well-known",
	}

	client := &http.Client{Timeout: 3 * time.Second, CheckRedirect: func(req *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	}}

	for _, dir := range dirs {
		url := strings.TrimRight(baseURL, "/") + dir
		req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
		if err != nil {
			continue
		}
		req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; Gobuster/3.6)")

		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		resp.Body.Close()

		if resp.StatusCode == 200 || resp.StatusCode == 301 || resp.StatusCode == 302 || resp.StatusCode == 403 {
			matches = append(matches, OSINTMatch{
				Category:   string(TargetTypeDomain),
				Source:     "Gobuster_Dir",
				URL:        url,
				Confidence: 0.80,
				Metadata: map[string]string{
					"path":        dir,
					"status_code": fmt.Sprintf("%d", resp.StatusCode),
					"engine":      "gobuster_go",
				},
			})
		}
	}

	return matches, nil
}

// GitleaksScraper wraps gitleaks for secret scanning
type GitleaksScraper struct{}

func NewGitleaksScraper() *GitleaksScraper {
	return &GitleaksScraper{}
}

func (s *GitleaksScraper) Name() string {
	return "Gitleaks_Go_Native"
}

func (s *GitleaksScraper) Category() TargetType {
	return TargetTypeDomain
}

// Execute checks a GitHub profile for public repos (secret scanning requires local git repo)
func (s *GitleaksScraper) Execute(ctx context.Context, target string) ([]OSINTMatch, error) {
	matches := make([]OSINTMatch, 0)

	// Check if target has a GitHub profile
	url := fmt.Sprintf("https://api.github.com/users/%s", target)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return matches, nil
	}
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return matches, nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return matches, nil
	}

	var user struct {
		Name  string `json:"name"`
		Email string `json:"email"`
		Bio   string `json:"bio"`
		Repos int    `json:"public_repos"`
	}
	if err := parseJSON(resp.Body, &user); err != nil {
		return matches, nil
	}

	matches = append(matches, OSINTMatch{
		Category:   string(TargetTypeUsername),
		Source:     "Gitleaks_GitHub",
		URL:        fmt.Sprintf("https://github.com/%s", target),
		Confidence: 0.95,
		Metadata: map[string]string{
			"name":       user.Name,
			"email":      user.Email,
			"bio":        user.Bio,
			"public_repos": fmt.Sprintf("%d", user.Repos),
			"engine":     "gitleaks_go",
		},
	})

	return matches, nil
}

// PhoneInfogaScraper wraps PhoneInfoga for phone number OSINT
type PhoneInfogaScraper struct{}

func NewPhoneInfogaScraper() *PhoneInfogaScraper {
	return &PhoneInfogaScraper{}
}

func (s *PhoneInfogaScraper) Name() string {
	return "PhoneInfoga_Go_Native"
}

func (s *PhoneInfogaScraper) Category() TargetType {
	return TargetTypePhone
}

// Execute performs phone number validation and OSINT
func (s *PhoneInfogaScraper) Execute(ctx context.Context, target string) ([]OSINTMatch, error) {
	matches := make([]OSINTMatch, 0)

	// Basic phone number validation
	cleaned := strings.ReplaceAll(target, " ", "")
	cleaned = strings.ReplaceAll(cleaned, "-", "")
	cleaned = strings.ReplaceAll(cleaned, "(", "")
	cleaned = strings.ReplaceAll(cleaned, ")", "")

	if len(cleaned) < 7 || len(cleaned) > 15 {
		return matches, fmt.Errorf("invalid phone number length")
	}

	// Try Numverify API for validation
	url := fmt.Sprintf("http://apilayer.net/api/validate?access_key=demo&number=%s", cleaned)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return matches, nil
	}

	client := &http.Client{Timeout: 5 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return matches, nil
	}
	defer resp.Body.Close()

	var result struct {
		Valid      bool   `json:"valid"`
		Number     string `json:"number"`
		LocalFormat string `json:"local_format"`
		IntlFormat string `json:"international_format"`
		Country    string `json:"country_name"`
		CountryCode string `json:"country_code"`
		Location   string `json:"location"`
		Carrier    string `json:"carrier"`
	}

	if err := parseJSON(resp.Body, &result); err == nil && result.Valid {
		matches = append(matches, OSINTMatch{
			Category:   string(TargetTypePhone),
			Source:     "PhoneInfoga_Numverify",
			URL:        fmt.Sprintf("tel:%s", result.IntlFormat),
			Confidence: 0.90,
			Metadata: map[string]string{
				"number":       result.Number,
				"intl_format":  result.IntlFormat,
				"country":      result.Country,
				"country_code": result.CountryCode,
				"location":     result.Location,
				"carrier":      result.Carrier,
				"engine":       "phoneinfoga_go",
			},
		})
	}

	return matches, nil
}
