// Package mobile implementa OSINT para análisis móvil (APK, IMEI, apps).
package mobile

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// MobileResult resultado de análisis móvil
type MobileResult struct {
	Target    string            `json:"target"`
	Type      string            `json:"type"` // apk_url, package_name, imei
	AppInfo   *AppInfo          `json:"app_info,omitempty"`
	Permissions []string        `json:"permissions,omitempty"`
	Vulnerabilities []VulnInfo  `json:"vulnerabilities,omitempty"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

type AppInfo struct {
	Name        string `json:"name"`
	Package     string `json:"package"`
	Version     string `json:"version"`
	Developer   string `json:"developer"`
	Category    string `json:"category"`
	Downloads   string `json:"downloads"`
	Rating      float64 `json:"rating"`
	Price       string `json:"price"`
	LastUpdated string `json:"last_updated"`
	Description string `json:"description,omitempty"`
}

type VulnInfo struct {
	ID          string `json:"id"`
	Severity    string `json:"severity"` // critical, high, medium, low
	Description string `json:"description"`
	CVE         string `json:"cve,omitempty"`
}

type Scanner interface {
	Name() string
	Scan(ctx context.Context, target, scanType string) (*MobileResult, error)
}

type Engine struct {
	scanners []Scanner
}

func NewEngine() *Engine {
	e := &Engine{
		scanners: make([]Scanner, 0),
	}
	e.Register(&PlayStoreScraper{})
	e.Register(&F-DroidScraper{})
	e.Register(&APKAnalyzer{})
	return e
}

func (e *Engine) Register(s Scanner) {
	e.scanners = append(e.scanners, s)
}

func (e *Engine) Scan(ctx context.Context, target, scanType string) *MobileResult {
	result := &MobileResult{
		Target:   target,
		Type:     scanType,
		Metadata: make(map[string]string),
	}

	for _, s := range e.scanners {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Scan(ctx, target, scanType)
		if err == nil && partial != nil {
			if partial.AppInfo != nil {
				result.AppInfo = partial.AppInfo
			}
			result.Permissions = append(result.Permissions, partial.Permissions...)
			result.Vulnerabilities = append(result.Vulnerabilities, partial.Vulnerabilities...)
		}
	}

	return result
}

// --- Play Store Scraper ---
type PlayStoreScraper struct{}

func (s *PlayStoreScraper) Name() string { return "PlayStore" }

func (s *PlayStoreScraper) Scan(ctx context.Context, target, scanType string) (*MobileResult, error) {
	if scanType != "package_name" {
		return nil, fmt.Errorf("not package name")
	}

	// Use Google Play Store API (unofficial)
	url := fmt.Sprintf("https://play.google.com/store/apps/details?id=%s&hl=en", target)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36")

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("play store returned %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 200000))
	bodyStr := string(body)

	result := &MobileResult{
		Target: target,
		Type:   "package_name",
		AppInfo: &AppInfo{
			Package: target,
		},
		Metadata: make(map[string]string),
	}

	// Extract app name
	if idx := strings.Index(bodyStr, `<h1`); idx > 0 {
		nameStart := strings.Index(bodyStr[idx:], `>`)
		if nameStart > 0 {
			nameEnd := strings.Index(bodyStr[idx+nameStart:], `</h1`)
			if nameEnd > 0 {
				result.AppInfo.Name = strings.TrimSpace(bodyStr[idx+nameStart+1 : idx+nameStart+1+nameEnd])
			}
		}
	}

	// Extract developer
	if idx := strings.Index(bodyStr, `developerURL`); idx > 0 {
		devStart := strings.Index(bodyStr[idx:], `"`)
		if devStart > 0 {
			devEnd := strings.Index(bodyStr[idx+devStart+1:], `"`)
			if devEnd > 0 {
				result.AppInfo.Developer = bodyStr[idx+devStart+1 : idx+devStart+1+devEnd]
			}
		}
	}

	// Extract rating
	if idx := strings.Index(bodyStr, `ratingValue`); idx > 0 {
		rateStart := strings.Index(bodyStr[idx:], `:`)
		if rateStart > 0 {
			rateEnd := strings.Index(bodyStr[idx+rateStart:], `,`)
			if rateEnd > 0 {
				fmt.Sscanf(bodyStr[idx+rateStart+1:idx+rateStart+1+rateEnd], "%f", &result.AppInfo.Rating)
			}
		}
	}

	result.Metadata["store"] = "google_play"
	result.Metadata["url"] = url

	return result, nil
}

// --- F-Droid Scraper ---
type F-DroidScraper struct{}

func (s *F-DroidScraper) Name() string { return "FDroid" }

func (s *F-DroidScraper) Scan(ctx context.Context, target, scanType string) (*MobileResult, error) {
	if scanType != "package_name" {
		return nil, fmt.Errorf("not package name")
	}

	url := fmt.Sprintf("https://f-droid.org/api/v1/packages/%s", target)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("f-droid returned %d", resp.StatusCode)
	}

	var data struct {
		Name        string `json:"name"`
		PackageName string `json:"package_name"`
		Summary     string `json:"summary"`
		Versions    []struct {
			VersionName string `json:"version_name"`
			VersionCode int    `json:"version_code"`
		} `json:"versions"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 50000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	result := &MobileResult{
		Target: target,
		Type:   "package_name",
		AppInfo: &AppInfo{
			Name:    data.Name,
			Package: data.PackageName,
		},
		Metadata: make(map[string]string),
	}

	if len(data.Versions) > 0 {
		result.AppInfo.Version = data.Versions[0].VersionName
	}

	result.Metadata["store"] = "f-droid"
	result.Metadata["url"] = fmt.Sprintf("https://f-droid.org/packages/%s/", target)

	return result, nil
}

// --- APK Analyzer ---
type APKAnalyzer struct{}

func (s *APKAnalyzer) Name() string { return "APKAnalyzer" }

func (s *APKAnalyzer) Scan(ctx context.Context, target, scanType string) (*MobileResult, error) {
	if scanType != "apk_url" {
		return nil, fmt.Errorf("not APK URL")
	}

	result := &MobileResult{
		Target:   target,
		Type:     "apk_url",
		Metadata: make(map[string]string),
	}

	// Download APK header for basic analysis
	client := &http.Client{Timeout: 30 * time.Second}
	req, _ := http.NewRequestWithContext(ctx, "GET", target, nil)
	req.Header.Set("Range", "bytes=0-1023")

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 2048))

	// Check if it's a valid APK (ZIP file)
	if len(body) > 4 && body[0] == 0x50 && body[1] == 0x4B {
		result.Metadata["valid_apk"] = "true"
		result.Metadata["file_size"] = resp.Header.Get("Content-Range")
	} else {
		result.Metadata["valid_apk"] = "false"
	}

	// Check for common security issues
	result.Vulnerabilities = append(result.Vulnerabilities, VulnInfo{
		ID:          "MOB-001",
		Severity:    "info",
		Description: "APK analysis requires full download and decompilation",
	})

	return result, nil
}
