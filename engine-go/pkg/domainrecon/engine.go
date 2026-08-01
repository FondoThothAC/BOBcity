// Package domainrecon implementa reconocimiento completo de dominios.
package domainrecon

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

// DomainResult resultado completo de recon de dominio
type DomainResult struct {
	Domain      string            `json:"domain"`
	IPs         []string          `json:"ips,omitempty"`
	CNAMEs      []string          `json:"cnames,omitempty"`
	MXRecords   []string          `mx_records,omitempty"`
	NSRecords   []string          `ns_records,omitempty"`
	TXTRecords  []string          `txt_records,omitempty"`
	SOA         string            `json:"soa,omitempty"`
	Whois       *WhoisInfo        `json:"whois,omitempty"`
	Subdomains  []SubdomainInfo   `json:"subdomains,omitempty"`
	TechStack   []string          `json:"tech_stack,omitempty"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

type WhoisInfo struct {
	Registrar    string `json:"registrar"`
	Registration string `json:"registration_date"`
	Expiration   string `json:"expiration_date"`
	NameServers  string `json:"name_servers"`
	Status       string `json:"status"`
}

type SubdomainInfo struct {
	Subdomain string `json:"subdomain"`
	IP        string `json:"ip"`
	Type      string `json:"type"` // A, CNAME, MX
}

// Scraper interfaz
type Scraper interface {
	Name() string
	Scan(ctx context.Context, domain string) (*DomainResult, error)
}

// Engine motor de reconocimiento
type Engine struct {
	scrapers []Scraper
}

func NewEngine() *Engine {
	e := &Engine{
		scrapers: make([]Scraper, 0),
	}
	e.Register(&DNSFullScraper{})
	e.Register(&WhoisScraper{})
	e.Register(&CertificateTransparency{})
	e.Register(&HTTPHeadersScraper{})
	return e
}

func (e *Engine) Register(s Scraper) {
	e.scrapers = append(e.scrapers, s)
}

func (e *Engine) Scan(ctx context.Context, domain string) *DomainResult {
	result := &DomainResult{
		Domain:   domain,
		Metadata: make(map[string]string),
	}

	for _, s := range e.scrapers {
		select {
		case <-ctx.Done():
			return result
		default:
		}
		partial, err := s.Scan(ctx, domain)
		if err == nil && partial != nil {
			mergeResults(result, partial)
		}
	}

	return result
}

func mergeResults(dst, src *DomainResult) {
	dst.IPs = appendIfMissing(dst.IPs, src.IPs)
	dst.CNAMEs = appendIfMissing(dst.CNAMEs, src.CNAMEs)
	dst.MXRecords = appendIfMissing(dst.MXRecords, src.MXRecords)
	dst.NSRecords = appendIfMissing(dst.NSRecords, src.NSRecords)
	dst.TXTRecords = appendIfMissing(dst.TXTRecords, src.TXTRecords)
	dst.Subdomains = append(dst.Subdomains, src.Subdomains...)
	dst.TechStack = appendIfMissing(dst.TechStack, src.TechStack)
	if src.Whois != nil {
		dst.Whois = src.Whois
	}
	if src.SOA != "" {
		dst.SOA = src.SOA
	}
	for k, v := range src.Metadata {
		dst.Metadata[k] = v
	}
}

func appendIfMissing(dst []string, src []string) []string {
	seen := make(map[string]bool)
	for _, s := range dst {
		seen[s] = true
	}
	for _, s := range src {
		if !seen[s] {
			dst = append(dst, s)
		}
	}
	return dst
}

// --- DNS Full Scraper ---
type DNSFullScraper struct{}

func (s *DNSFullScraper) Name() string { return "DNS_Full" }

func (s *DNSFullScraper) Scan(ctx context.Context, domain string) (*DomainResult, error) {
	result := &DomainResult{Domain: domain, Metadata: make(map[string]string)}

	// A records
	ips, err := net.LookupHost(domain)
	if err == nil {
		result.IPs = ips
	}

	// CNAME
	cnames, _ := net.LookupCNAME(domain)
	if cnames != "" {
		result.CNAMEs = []string{cnames}
	}

	// MX records
	mxRecords, err := net.LookupMX(domain)
	if err == nil {
		for _, mx := range mxRecords {
			result.MXRecords = append(result.MXRecords, fmt.Sprintf("%s (priority %d)", mx.Host, mx.Pref))
		}
	}

	// NS records
	nsRecords, err := net.LookupNS(domain)
	if err == nil {
		for _, ns := range nsRecords {
			result.NSRecords = append(result.NSRecords, ns.Host)
		}
	}

	// TXT records
	txtRecords, err := net.LookupTXT(domain)
	if err == nil {
		result.TXTRecords = txtRecords
	}

	// Reverse DNS for each IP
	for _, ip := range result.IPs {
		names, _ := net.LookupAddr(ip)
		for _, name := range names {
			result.Metadata["reverse_"+ip] = strings.TrimSuffix(name, ".")
		}
	}

	return result, nil
}

// --- WHOIS Scraper (usa API pública) ---
type WhoisScraper struct{}

func (s *WhoisScraper) Name() string { return "Whois" }

func (s *WhoisScraper) Scan(ctx context.Context, domain string) (*DomainResult, error) {
	url := fmt.Sprintf("https://rdap.org/domain/%s", domain)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("RDAP returned %d", resp.StatusCode)
	}

	var data struct {
		Handle      string `json:"handle"`
		Name        string `json:"ldhName"`
		Status      []string `json:"status"`
		Events      []struct {
			EventAction string `json:"eventAction"`
			EventDate   string `json:"eventDate"`
		} `json:"events"`
		Entities []struct {
			Roles []string `json:"roles"`
			VCARD []struct {
				Type string   `json:"type"`
				Val  []string `json:"value"`
			} `json:"vcardArray"`
		} `json:"entities"`
		Nameservers []struct {
			LDHName string `json:"ldhName"`
		} `json:"nameservers"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 50000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	whois := &WhoisInfo{
		Status: strings.Join(data.Status, ", "),
	}

	for _, event := range data.Events {
		switch event.EventAction {
		case "registration":
			whois.Registration = event.EventDate
		case "expiration":
			whois.Expiration = event.EventDate
		}
	}

	for _, entity := range data.Entities {
		for _, role := range entity.Roles {
			if role == "registrar" {
				for _, v := range entity.VCARD {
					if v.Type == "fn" && len(v.Val) > 0 {
						whois.Registrar = v.Val[0]
					}
				}
			}
		}
	}

	var nsNames []string
	for _, ns := range data.Nameservers {
		nsNames = append(nsNames, ns.LDHName)
	}
	whois.NameServers = strings.Join(nsNames, ", ")

	return &DomainResult{
		Domain: domain,
		Whois:  whois,
	}, nil
}

// --- Certificate Transparency Scraper ---
type CertificateTransparency struct{}

func (s *CertificateTransparency) Name() string { return "CertTransparency" }

func (s *CertificateTransparency) Scan(ctx context.Context, domain string) (*DomainResult, error) {
	url := fmt.Sprintf("https://crt.sh/?q=%%25.%s&output=json", domain)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var entries []struct {
		NameValue string `json:"name_value"`
		IssuerName string `json:"issuer_name"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 200000))
	if err := json.Unmarshal(body, &entries); err != nil {
		return nil, err
	}

	result := &DomainResult{
		Domain:   domain,
		Metadata: make(map[string]string),
	}

	seen := make(map[string]bool)
	for _, entry := range entries {
		for _, name := range strings.Split(entry.NameValue, "\n") {
			name = strings.TrimSpace(name)
			if name != "" && !strings.Contains(name, "*") && !seen[name] {
				seen[name] = true
				result.Subdomains = append(result.Subdomains, SubdomainInfo{
					Subdomain: name,
					Type:      "cert_transparency",
				})
			}
		}
	}

	result.Metadata["total_certs"] = fmt.Sprintf("%d", len(entries))
	result.Metadata["unique_subdomains"] = fmt.Sprintf("%d", len(result.Subdomains))

	return result, nil
}

// --- HTTP Headers Scraper (tech detection) ---
type HTTPHeadersScraper struct{}

func (s *HTTPHeadersScraper) Name() string { return "HTTPHeaders" }

func (s *HTTPHeadersScraper) Scan(ctx context.Context, domain string) (*DomainResult, error) {
	url := fmt.Sprintf("https://%s", domain)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; OSINT-Go/1.0)")

	client := &http.Client{Timeout: 8 * time.Second, CheckRedirect: func(r *http.Request, via []*http.Request) error {
		if len(via) >= 3 {
			return fmt.Errorf("too many redirects")
		}
		return nil
	}}

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	result := &DomainResult{
		Domain:   domain,
		Metadata: make(map[string]string),
	}

	// Detect technology from headers
	server := resp.Header.Get("Server")
	if server != "" {
		result.TechStack = append(result.TechStack, "Server: "+server)
		result.Metadata["server"] = server
	}

	poweredBy := resp.Header.Get("X-Powered-By")
	if poweredBy != "" {
		result.TechStack = append(result.TechStack, "PoweredBy: "+poweredBy)
		result.Metadata["x_powered_by"] = poweredBy
	}

	// Security headers detection
	secHeaders := []string{
		"Strict-Transport-Security",
		"Content-Security-Policy",
		"X-Frame-Options",
		"X-Content-Type-Options",
		"X-XSS-Protection",
		"Referrer-Policy",
		"Permissions-Policy",
	}

	for _, h := range secHeaders {
		if val := resp.Header.Get(h); val != "" {
			result.Metadata["security_"+h] = "present"
		}
	}

	result.Metadata["status_code"] = fmt.Sprintf("%d", resp.StatusCode)
	result.Metadata["content_type"] = resp.Header.Get("Content-Type")

	return result, nil
}
