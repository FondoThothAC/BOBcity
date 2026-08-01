// Package ipnetwork implementa OSINT para IPs y redes.
package ipnetwork

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"net/http"
	"strings"
	"time"
)

// IPResult resultado de investigación de IP
type IPResult struct {
	IP         string            `json:"ip"`
	Hostname   string            `json:"hostname,omitempty"`
	City       string            `json:"city,omitempty"`
	Region     string            `json:"region,omitempty"`
	Country    string            `json:"country,omitempty"`
	Loc        string            `json:"location,omitempty"`
	Org        string            `json:"org,omitempty"`
	ASN        string            `json:"asn,omitempty"`
	ASNOrg     string            `json:"asn_org,omitempty"`
	ISP        string            `json:"isp,omitempty"`
	ReverseDNS string            `json:"reverse_dns,omitempty"`
	Ports      []PortInfo        `json:"open_ports,omitempty"`
	Metadata   map[string]string `json:"metadata,omitempty"`
}

type PortInfo struct {
	Port     int    `json:"port"`
	Protocol string `json:"protocol"`
	Service  string `json:"service"`
	Banner   string `json:"banner,omitempty"`
}

// Scraper interfaz
type Scraper interface {
	Name() string
	Lookup(ctx context.Context, ip string) (*IPResult, error)
}

// Engine motor de IP/Network OSINT
type Engine struct {
	scrapers []Scraper
}

func NewEngine() *Engine {
	e := &Engine{
		scrapers: make([]Scraper, 0),
	}
	e.Register(&IPInfoScraper{})
	e.Register(&IPAPIScraper{})
	e.Register(&AbuseIPDBScraper{})
	e.Register(&BannersScraper{})
	return e
}

func (e *Engine) Register(s Scraper) {
	e.scrapers = append(e.scrapers, s)
}

func (e *Engine) Lookup(ctx context.Context, ip string) *IPResult {
	result := &IPResult{
		IP:       ip,
		Metadata: make(map[string]string),
	}

	// Validate IP
	if net.ParseIP(ip) == nil {
		result.Metadata["error"] = "invalid IP address"
		return result
	}

	// Reverse DNS
	names, err := net.LookupAddr(ip)
	if err == nil && len(names) > 0 {
		result.ReverseDNS = strings.TrimSuffix(names[0], ".")
	}

	for _, s := range e.scrapers {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Lookup(ctx, ip)
		if err == nil && partial != nil {
			mergeIPResults(result, partial)
		}
	}

	return result
}

func mergeIPResults(dst, src *IPResult) {
	if src.Hostname != "" {
		dst.Hostname = src.Hostname
	}
	if src.City != "" {
		dst.City = src.City
	}
	if src.Region != "" {
		dst.Region = src.Region
	}
	if src.Country != "" {
		dst.Country = src.Country
	}
	if src.Loc != "" {
		dst.Loc = src.Loc
	}
	if src.Org != "" {
		dst.Org = src.Org
	}
	if src.ASN != "" {
		dst.ASN = src.ASN
	}
	if src.ASNOrg != "" {
		dst.ASNOrg = src.ASNOrg
	}
	if src.ISP != "" {
		dst.ISP = src.ISP
	}
	dst.Ports = append(dst.Ports, src.Ports...)
	for k, v := range src.Metadata {
		dst.Metadata[k] = v
	}
}

// --- IPinfo.io Scraper ---
type IPInfoScraper struct{}

func (s *IPInfoScraper) Name() string { return "IPinfo" }

func (s *IPInfoScraper) Lookup(ctx context.Context, ip string) (*IPResult, error) {
	url := fmt.Sprintf("https://ipinfo.io/%s/json", ip)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "osint-go-engine/1.0")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		IP      string `json:"ip"`
		Hostname string `json:"hostname"`
		City    string `json:"city"`
		Region  string `json:"region"`
		Country string `json:"country"`
		Loc     string `json:"loc"`
		Org     string `json:"org"`
		Postal  string `json:"postal"`
		Timezone string `json:"timezone"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 5000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return &IPResult{
		IP:       data.IP,
		Hostname: data.Hostname,
		City:     data.City,
		Region:   data.Region,
		Country:  data.Country,
		Loc:      data.Loc,
		Org:      data.Org,
		Metadata: map[string]string{
			"postal":   data.Postal,
			"timezone": data.Timezone,
		},
	}, nil
}

// --- ip-api.com Scraper ---
type IPAPIScraper struct{}

func (s *IPAPIScraper) Name() string { return "IP-API" }

func (s *IPAPIScraper) Lookup(ctx context.Context, ip string) (*IPResult, error) {
	url := fmt.Sprintf("http://ip-api.com/json/%s?fields=status,message,country,regionName,city,isp,org,as,hostname,reverse,mobile,proxy,hosting", ip)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		Status  string `json:"status"`
		Country string `json:"country"`
		Region  string `json:"regionName"`
		City    string `json:"city"`
		ISP     string `json:"isp"`
		Org     string `json:"org"`
		AS      string `json:"as"`
		Hostname string `json:"hostname"`
		Reverse string `json:"reverse"`
		Mobile  bool   `json:"mobile"`
		Proxy   bool   `json:"proxy"`
		Hosting bool   `json:"hosting"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 5000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	if data.Status != "success" {
		return nil, fmt.Errorf("ip-api failed")
	}

	return &IPResult{
		IP:       ip,
		Hostname: data.Hostname,
		City:     data.City,
		Region:   data.Region,
		Country:  data.Country,
		Org:      data.Org,
		ASN:      data.AS,
		ISP:      data.ISP,
		ReverseDNS: data.Reverse,
		Metadata: map[string]string{
			"mobile":  fmt.Sprintf("%t", data.Mobile),
			"proxy":   fmt.Sprintf("%t", data.Proxy),
			"hosting": fmt.Sprintf("%t", data.Hosting),
		},
	}, nil
}

// --- AbuseIPDB Scraper (requiere API key) ---
type AbuseIPDBScraper struct{}

func (s *AbuseIPDBScraper) Name() string { return "AbuseIPDB" }

func (s *AbuseIPDBScraper) Lookup(ctx context.Context, ip string) (*IPResult, error) {
	// Requires ABUSEIPDB_API_KEY env var
	return &IPResult{
		IP:       ip,
		Metadata: map[string]string{
			"note": "Requires ABUSEIPDB_API_KEY environment variable",
		},
	}, nil
}

// --- Banner Grabbing ---
type BannersScraper struct{}

func (s *BannersScraper) Name() string { return "Banners" }

func (s *BannersScraper) Lookup(ctx context.Context, ip string) (*IPResult, error) {
	result := &IPResult{
		IP:       ip,
		Metadata: make(map[string]string),
	}

	// Check common ports
	ports := []int{21, 22, 25, 53, 80, 443, 8080, 8443}
	for _, port := range ports {
		select {
		case <-ctx.Done():
			return result, ctx.Err()
		default:
		}

		addr := fmt.Sprintf("%s:%d", ip, port)
		conn, err := net.DialTimeout("tcp", addr, 2*time.Second)
		if err != nil {
			continue
		}
		conn.Close()

		service := guessService(port)
		result.Ports = append(result.Ports, PortInfo{
			Port:     port,
			Protocol: "tcp",
			Service:  service,
		})
	}

	result.Metadata["ports_scanned"] = fmt.Sprintf("%d", len(ports))
	result.Metadata["ports_open"] = fmt.Sprintf("%d", len(result.Ports))

	return result, nil
}

func guessService(port int) string {
	services := map[int]string{
		21: "ftp", 22: "ssh", 25: "smtp", 53: "dns",
		80: "http", 443: "https", 8080: "http-alt", 8443: "https-alt",
	}
	if s, ok := services[port]; ok {
		return s
	}
	return "unknown"
}
