// Package webfingerprint implementa detección de tecnologías web (Wappalyzer-style).
package webfingerprint

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// TechResult resultado de fingerprinting web
type TechResult struct {
	URL         string            `json:"url"`
	Technologies []TechInfo       `json:"technologies,omitempty"`
	Headers     map[string]string `json:"headers,omitempty"`
	Cookies     []string          `json:"cookies,omitempty"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

type TechInfo struct {
	Name     string `json:"name"`
	Category string `json:"category"` // cms, framework, language, server, analytics, etc
	Version  string `json:"version,omitempty"`
	Confidence int  `json:"confidence"` // 0-100
}

type Scanner interface {
	Name() string
	Scan(ctx context.Context, url string) (*TechResult, error)
}

type Engine struct {
	scanners []Scanner
}

func NewEngine() *Engine {
	e := &Engine{
		scanners: make([]Scanner, 0),
	}
	e.Register(&HeaderAnalyzer{})
	e.Register(&HTMLAnalyzer{})
	e.Register(&CookieAnalyzer{})
	return e
}

func (e *Engine) Register(s Scanner) {
	e.scanners = append(e.scanners, s)
}

func (e *Engine) Scan(ctx context.Context, url string) *TechResult {
	result := &TechResult{
		URL:      url,
		Headers:  make(map[string]string),
		Metadata: make(map[string]string),
	}

	client := &http.Client{Timeout: 10 * time.Second, CheckRedirect: func(r *http.Request, via []*http.Request) error {
		if len(via) >= 5 {
			return fmt.Errorf("too many redirects")
		}
		return nil
	}}

	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36")

	resp, err := client.Do(req)
	if err != nil {
		result.Metadata["error"] = err.Error()
		return result
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 500000))
	bodyStr := string(body)

	// Capture headers
	for key := range resp.Header {
		result.Headers[key] = resp.Header.Get(key)
	}

	// Capture cookies
	for _, cookie := range resp.Cookies() {
		result.Cookies = append(result.Cookies, cookie.Name)
	}

	result.Metadata["status_code"] = fmt.Sprintf("%d", resp.StatusCode)
	result.Metadata["content_length"] = fmt.Sprintf("%d", len(body))

	// Run all scanners
	for _, s := range e.scanners {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Scan(ctx, url)
		if err == nil && partial != nil {
			result.Technologies = append(result.Technologies, partial.Technologies...)
		}
	}

	// Inline analysis
	detectFromHTML(bodyStr, result)
	detectFromHeaders(resp.Header, result)

	return result
}

// --- Header Analyzer ---
type HeaderAnalyzer struct{}

func (s *HeaderAnalyzer) Name() string { return "HeaderAnalyzer" }

func (s *HeaderAnalyzer) Scan(ctx context.Context, url string) (*TechResult, error) {
	return &TechResult{}, nil
}

// --- HTML Analyzer ---
type HTMLAnalyzer struct{}

func (s *HTMLAnalyzer) Name() string { return "HTMLAnalyzer" }

func (s *HTMLAnalyzer) Scan(ctx context.Context, url string) (*TechResult, error) {
	return &TechResult{}, nil
}

// --- Cookie Analyzer ---
type CookieAnalyzer struct{}

func (s *CookieAnalyzer) Name() string { return "CookieAnalyzer" }

func (s *CookieAnalyzer) Scan(ctx context.Context, url string) (*TechResult, error) {
	return &TechResult{}, nil
}

// detectFromHTML detecta tecnologías del HTML
func detectFromHTML(html string, result *TechResult) {
	detections := []struct {
		Pattern  string
		Name     string
		Category string
	}{
		{`(?i)wordpress`, "WordPress", "cms"},
		{`(?i)drupal`, "Drupal", "cms"},
		{`(?i)joomla`, "Joomla", "cms"},
		{`(?i)shopify`, "Shopify", "ecommerce"},
		{`(?i)woocommerce`, "WooCommerce", "ecommerce"},
		{`(?i)react`, "React", "framework"},
		{`(?i)vue\.js|vuejs`, "Vue.js", "framework"},
		{`(?i)angular`, "Angular", "framework"},
		{`(?i)next\.js|nextjs`, "Next.js", "framework"},
		{`(?i)nuxt`, "Nuxt.js", "framework"},
		{`(?i)jquery`, "jQuery", "library"},
		{`(?i)bootstrap`, "Bootstrap", "framework"},
		{`(?i)tailwind`, "Tailwind CSS", "css_framework"},
		{`(?i)google-analytics|gtag|ga\.js`, "Google Analytics", "analytics"},
		{`(?i)gtm\.js|googletagmanager`, "Google Tag Manager", "analytics"},
		{`(?i)facebook.*pixel|fbevents`, "Facebook Pixel", "analytics"},
		{`(?i)hotjar`, "Hotjar", "analytics"},
		{`(?i)cloudflare`, "Cloudflare", "cdn"},
		{`(?i)netlify`, "Netlify", "hosting"},
		{`(?i)vercel`, "Vercel", "hosting"},
		{`(?i)firebase`, "Firebase", "backend"},
		{`(?i)supabase`, "Supabase", "backend"},
		{`(?i)stripe`, "Stripe", "payment"},
		{`(?i)recaptcha`, "reCAPTCHA", "security"},
		{`(?i)hCaptcha`, "hCaptcha", "security"},
		{`(?i)turnstile`, "Cloudflare Turnstile", "security"},
	}

	for _, d := range detections {
		re := regexp.MustCompile(d.Pattern)
		if re.MatchString(html) {
			result.Technologies = append(result.Technologies, TechInfo{
				Name:       d.Name,
				Category:   d.Category,
				Confidence: 80,
			})
		}
	}

	// Detect generator meta tag
	if idx := strings.Index(html, `<meta name="generator"`); idx > 0 {
		end := strings.Index(html[idx:], `/>`)
		if end > 0 {
			genTag := html[idx : idx+end]
			if contentIdx := strings.Index(genTag, `content="`); contentIdx > 0 {
				contentEnd := strings.Index(genTag[contentIdx+9:], `"`)
				if contentEnd > 0 {
					gen := genTag[contentIdx+9 : contentIdx+9+contentEnd]
					result.Technologies = append(result.Technologies, TechInfo{
						Name:       gen,
						Category:   "cms",
						Confidence: 100,
					})
				}
			}
		}
	}
}

// detectFromHeaders detecta tecnologías de headers HTTP
func detectFromHeaders(headers http.Header, result *TechResult) {
	server := headers.Get("Server")
	if server != "" {
		result.Technologies = append(result.Technologies, TechInfo{
			Name:       server,
			Category:   "server",
			Confidence: 100,
		})
	}

	poweredBy := headers.Get("X-Powered-By")
	if poweredBy != "" {
		result.Technologies = append(result.Technologies, TechInfo{
			Name:       poweredBy,
			Category:   "language",
			Confidence: 100,
		})
	}

	// Detect CDN
	xServedBy := headers.Get("X-Served-By")
	if xServedBy != "" {
		result.Technologies = append(result.Technologies, TechInfo{
			Name:       "Varnish",
			Category:   "cdn",
			Confidence: 90,
		})
	}

	// Detect framework
	xAspNet := headers.Get("X-AspNet-Version")
	if xAspNet != "" {
		result.Technologies = append(result.Technologies, TechInfo{
			Name:       "ASP.NET",
			Category:   "framework",
			Version:    xAspNet,
			Confidence: 100,
		})
	}
}
