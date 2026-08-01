// Package socialmedia implementa scraping OSINT para redes sociales.
package socialmedia

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// SocialMatch representa un hallazgo en redes sociales
type SocialMatch struct {
	Platform  string            `json:"platform"`
	Username  string            `json:"username"`
	URL       string            `json:"url"`
	ProfileURL string           `json:"profile_url"`
	Bio       string            `json:"bio,omitempty"`
	Followers int               `json:"followers,omitempty"`
	Status    string            `json:"status"` // found, not_found, error
	Metadata  map[string]string `json:"metadata,omitempty"`
}

// Scraper es la interfaz para scrapers de redes sociales
type Scraper interface {
	Name() string
	Platform() string
	CheckUsername(ctx context.Context, username string) (*SocialMatch, error)
}

// Engine orquesta múltiples scrapers de redes sociales
type Engine struct {
	scrapers []Scraper
}

// NewEngine crea un motor con todos los scrapers de redes sociales
func NewEngine() *Engine {
	e := &Engine{
		scrapers: make([]Scraper, 0),
	}
	// Scrapers que no requieren API key (usan HTTP directo)
	e.Register(&InstagramScraper{})
	e.Register(&TwitterScraper{})
	e.Register(&TikTokScraper{})
	e.Register(&GitHubSocialScraper{})
	e.Register(&RedditScraper{})
	e.Register(&PinterestScraper{})
	return e
}

// Register agrega un scraper al motor
func (e *Engine) Register(s Scraper) {
	e.scrapers = append(e.scrapers, s)
}

// CheckAll verifica un usuario en todas las plataformas
func (e *Engine) CheckAll(ctx context.Context, username string) []SocialMatch {
	results := make([]SocialMatch, 0, len(e.scrapers))
	for _, s := range e.scrapers {
		select {
		case <-ctx.Done():
			return results
		default:
		}
		match, err := s.CheckUsername(ctx, username)
		if err != nil {
			continue
		}
		if match != nil {
			results = append(results, *match)
		}
	}
	return results
}

// --- Instagram Scraper ---
type InstagramScraper struct{}

func (s *InstagramScraper) Name() string       { return "Instagram" }
func (s *InstagramScraper) Platform() string   { return "instagram" }

func (s *InstagramScraper) CheckUsername(ctx context.Context, username string) (*SocialMatch, error) {
	url := fmt.Sprintf("https://www.instagram.com/%s/", username)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

	client := &http.Client{Timeout: 8 * time.Second, CheckRedirect: func(r *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	}}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	match := &SocialMatch{
		Platform: "instagram",
		Username: username,
		URL:      url,
		Status:   "not_found",
		Metadata: make(map[string]string),
	}

	if resp.StatusCode == 200 {
		match.Status = "found"
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 50000))
		bodyStr := string(body)

		// Extract bio from meta description
		if idx := strings.Index(bodyStr, `"description":"`); idx > 0 {
			end := strings.Index(bodyStr[idx+15:], `"`)
			if end > 0 {
				match.Bio = bodyStr[idx+15 : idx+15+end]
			}
		}
		// Extract follower count
		if idx := strings.Index(bodyStr, `"edge_followed_by":{"count":`); idx > 0 {
			end := strings.Index(bodyStr[idx+27:], `}`)
			if end > 0 {
				match.Metadata["followers"] = bodyStr[idx+27 : idx+27+end]
			}
		}
		match.ProfileURL = fmt.Sprintf("https://www.instagram.com/%s/", username)
	} else if resp.StatusCode == 302 || resp.StatusCode == 404 {
		match.Status = "not_found"
	} else if resp.StatusCode == 429 {
		match.Status = "rate_limited"
	}

	return match, nil
}

// --- Twitter/X Scraper ---
type TwitterScraper struct{}

func (s *TwitterScraper) Name() string       { return "Twitter/X" }
func (s *TwitterScraper) Platform() string   { return "twitter" }

func (s *TwitterScraper) CheckUsername(ctx context.Context, username string) (*SocialMatch, error) {
	url := fmt.Sprintf("https://x.com/%s", username)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

	client := &http.Client{Timeout: 8 * time.Second, CheckRedirect: func(r *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	}}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	match := &SocialMatch{
		Platform: "twitter",
		Username: username,
		URL:      url,
		Status:   "not_found",
		Metadata: make(map[string]string),
	}

	if resp.StatusCode == 200 {
		match.Status = "found"
		match.ProfileURL = url
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 50000))
		bodyStr := string(body)
		if idx := strings.Index(bodyStr, `"description":"`); idx > 0 {
			end := strings.Index(bodyStr[idx+15:], `"`)
			if end > 0 {
				match.Bio = bodyStr[idx+15 : idx+15+end]
			}
		}
	}

	return match, nil
}

// --- TikTok Scraper ---
type TikTokScraper struct{}

func (s *TikTokScraper) Name() string       { return "TikTok" }
func (s *TikTokScraper) Platform() string   { return "tiktok" }

func (s *TikTokScraper) CheckUsername(ctx context.Context, username string) (*SocialMatch, error) {
	url := fmt.Sprintf("https://www.tiktok.com/@%s", username)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

	client := &http.Client{Timeout: 8 * time.Second, CheckRedirect: func(r *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	}}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	match := &SocialMatch{
		Platform: "tiktok",
		Username: username,
		URL:      url,
		Status:   "not_found",
		Metadata: make(map[string]string),
	}

	if resp.StatusCode == 200 {
		match.Status = "found"
		match.ProfileURL = url
		body, _ := io.ReadAll(io.LimitReader(resp.Body, 50000))
		bodyStr := string(body)
		if idx := strings.Index(bodyStr, `"description":"`); idx > 0 {
			end := strings.Index(bodyStr[idx+15:], `"`)
			if end > 0 {
				match.Bio = bodyStr[idx+15 : idx+15+end]
			}
		}
	}

	return match, nil
}

// --- GitHub Social Scraper ---
type GitHubSocialScraper struct{}

func (s *GitHubSocialScraper) Name() string       { return "GitHub" }
func (s *GitHubSocialScraper) Platform() string   { return "github" }

func (s *GitHubSocialScraper) CheckUsername(ctx context.Context, username string) (*SocialMatch, error) {
	url := fmt.Sprintf("https://api.github.com/users/%s", username)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	match := &SocialMatch{
		Platform: "github",
		Username: username,
		URL:      fmt.Sprintf("https://github.com/%s", username),
		Status:   "not_found",
		Metadata: make(map[string]string),
	}

	if resp.StatusCode == 200 {
		var user struct {
			Name        string `json:"name"`
			Bio         string `json:"bio"`
			Followers   int    `json:"followers"`
			PublicRepos int    `json:"public_repos"`
			Email       string `json:"email"`
			Location    string `json:"location"`
			Blog        string `json:"blog"`
		}
		json.NewDecoder(resp.Body).Decode(&user)

		match.Status = "found"
		match.Bio = user.Bio
		match.ProfileURL = fmt.Sprintf("https://github.com/%s", username)
		match.Followers = user.Followers
		match.Metadata["name"] = user.Name
		match.Metadata["email"] = user.Email
		match.Metadata["location"] = user.Location
		match.Metadata["blog"] = user.Blog
		match.Metadata["public_repos"] = fmt.Sprintf("%d", user.PublicRepos)
	}

	return match, nil
}

// --- Reddit Scraper ---
type RedditScraper struct{}

func (s *RedditScraper) Name() string       { return "Reddit" }
func (s *RedditScraper) Platform() string   { return "reddit" }

func (s *RedditScraper) CheckUsername(ctx context.Context, username string) (*SocialMatch, error) {
	url := fmt.Sprintf("https://www.reddit.com/user/%s/about.json", username)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; OSINT-Go/1.0)")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	match := &SocialMatch{
		Platform: "reddit",
		Username: username,
		URL:      fmt.Sprintf("https://www.reddit.com/user/%s", username),
		Status:   "not_found",
		Metadata: make(map[string]string),
	}

	if resp.StatusCode == 200 {
		var data struct {
			Data struct {
				Name        string `json:"name"`
				Subreddit   string `json:"subreddit"`
				IconImg     string `json:"icon_img"`
				TotalKarma  int    `json:"total_karma"`
				CreatedUTC  float64 `json:"created_utc"`
			} `json:"data"`
		}
		json.NewDecoder(resp.Body).Decode(&data)

		match.Status = "found"
		match.ProfileURL = fmt.Sprintf("https://www.reddit.com/user/%s", username)
		match.Metadata["karma"] = fmt.Sprintf("%d", data.Data.TotalKarma)
		match.Metadata["subreddit"] = data.Data.Subreddit
	}

	return match, nil
}

// --- Pinterest Scraper ---
type PinterestScraper struct{}

func (s *PinterestScraper) Name() string       { return "Pinterest" }
func (s *PinterestScraper) Platform() string   { return "pinterest" }

func (s *PinterestScraper) CheckUsername(ctx context.Context, username string) (*SocialMatch, error) {
	url := fmt.Sprintf("https://www.pinterest.com/%s/", username)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

	client := &http.Client{Timeout: 8 * time.Second, CheckRedirect: func(r *http.Request, via []*http.Request) error {
		return http.ErrUseLastResponse
	}}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	match := &SocialMatch{
		Platform: "pinterest",
		Username: username,
		URL:      url,
		Status:   "not_found",
		Metadata: make(map[string]string),
	}

	if resp.StatusCode == 200 {
		match.Status = "found"
		match.ProfileURL = url
	}

	return match, nil
}
