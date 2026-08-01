// Package automation implementa frameworks de automatización OSINT en Go.
package automation

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

// ReconResult resultado de un escaneo automatizado
type ReconResult struct {
	Target      string            `json:"target"`
	TargetType  string            `json:"target_type"`
	StartTime   time.Time         `json:"start_time"`
	EndTime     time.Time         `json:"end_time"`
	DurationMs  float64           `json:"duration_ms"`
	Sections    []ReconSection    `json:"sections,omitempty"`
	Metadata    map[string]string `json:"metadata,omitempty"`
}

type ReconSection struct {
	Name    string      `json:"name"`
	Status  string      `json:"status"` // ok, error, skipped
	Results interface{} `json:"results,omitempty"`
	Error   string      `json:"error,omitempty"`
}

type Scanner interface {
	Name() string
	Run(ctx context.Context, target string) (*ReconSection, error)
}

// FullRecon motor de reconocimiento completo
type FullRecon struct {
	scanners []Scanner
}

func NewFullRecon() *FullRecon {
	f := &FullRecon{
		scanners: make([]Scanner, 0),
	}
	f.Register(&PortScanner{})
	f.Register(&HTTPProbe{})
	f.Register(&DNSScraper{})
	f.Register(&HeaderGrabber{})
	f.Register(&TechnologyDetector{})
	return f
}

func (f *FullRecon) Register(s Scanner) {
	f.scanners = append(f.scanners, s)
}

// Run ejecuta todos los scanners en paralelo
func (f *FullRecon) Run(ctx context.Context, target string) *ReconResult {
	result := &ReconResult{
		Target:     target,
		StartTime:  time.Now(),
		Metadata:   make(map[string]string),
	}

	var mu sync.Mutex
	var wg sync.WaitGroup

	for _, s := range f.scanners {
		wg.Add(1)
		go func(scanner Scanner) {
			defer wg.Done()
			select {
			case <-ctx.Done():
				return
			default:
			}

			section, err := scanner.Run(ctx, target)
			mu.Lock()
			defer mu.Unlock()

			if err != nil {
				result.Sections = append(result.Sections, ReconSection{
					Name:   scanner.Name(),
					Status: "error",
					Error:  err.Error(),
				})
			} else if section != nil {
				section.Status = "ok"
				result.Sections = append(result.Sections, *section)
			}
		}(s)
	}

	wg.Wait()
	result.EndTime = time.Now()
	result.DurationMs = float64(result.EndTime.Sub(result.StartTime).Microseconds()) / 1000.0
	result.Metadata["total_sections"] = fmt.Sprintf("%d", len(result.Sections))

	return result
}

// --- Port Scanner ---
type PortScanner struct{}

func (s *PortScanner) Name() string { return "PortScan" }

func (s *PortScanner) Run(ctx context.Context, target string) (*ReconSection, error) {
	// Resolve hostname first
	ips, err := net.LookupHost(target)
	if err == nil && len(ips) > 0 {
		target = ips[0]
	}

	commonPorts := []int{
		21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143,
		443, 445, 993, 995, 1723, 3306, 3389, 5900, 8080, 8443,
	}

	type portResult struct {
		Port   int    `json:"port"`
		State  string `json:"state"`
		Service string `json:"service"`
	}

	results := []portResult{}
	timeout := 1 * time.Second

	for _, port := range commonPorts {
		select {
		case <-ctx.Done():
			return &ReconSection{Name: "PortScan", Results: results}, ctx.Err()
		default:
		}

		addr := fmt.Sprintf("%s:%d", target, port)
		conn, err := net.DialTimeout("tcp", addr, timeout)
		if err != nil {
			continue
		}
		conn.Close()

		results = append(results, portResult{
			Port:    port,
			State:   "open",
			Service: guessPortService(port),
		})
	}

	return &ReconSection{
		Name:    "PortScan",
		Results: results,
	}, nil
}

func guessPortService(port int) string {
	services := map[int]string{
		21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp",
		53: "dns", 80: "http", 110: "pop3", 111: "rpcbind",
		135: "msrpc", 139: "netbios", 143: "imap",
		443: "https", 445: "smb", 993: "imaps", 995: "pop3s",
		1723: "pptp", 3306: "mysql", 3389: "rdp",
		5900: "vnc", 8080: "http-alt", 8443: "https-alt",
	}
	if s, ok := services[port]; ok {
		return s
	}
	return "unknown"
}

// --- HTTP Probe ---
type HTTPProbe struct{}

func (s *HTTPProbe) Name() string { return "HTTPProbe" }

func (s *HTTPProbe) Run(ctx context.Context, target string) (*ReconSection, error) {
	urls := []string{
		fmt.Sprintf("https://%s", target),
		fmt.Sprintf("http://%s", target),
		fmt.Sprintf("http://%s:8080", target),
	}

	type httpResult struct {
		URL        string `json:"url"`
		StatusCode int    `json:"status_code"`
		Redirect   string `json:"redirect,omitempty"`
		Title      string `json:"title,omitempty"`
	}

	results := []httpResult{}
	client := &http.Client{
		Timeout: 5 * time.Second,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 3 {
				return fmt.Errorf("too many redirects")
			}
			return nil
		},
	}

	for _, url := range urls {
		select {
		case <-ctx.Done():
			return &ReconSection{Name: "HTTPProbe", Results: results}, ctx.Err()
		default:
		}

		req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
		req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; ReconGo/1.0)")

		resp, err := client.Do(req)
		if err != nil {
			continue
		}
		resp.Body.Close()

		r := httpResult{
			URL:        url,
			StatusCode: resp.StatusCode,
		}

		if resp.StatusCode >= 300 && resp.StatusCode < 400 {
			r.Redirect = resp.Header.Get("Location")
		}

		results = append(results, r)
	}

	return &ReconSection{
		Name:    "HTTPProbe",
		Results: results,
	}, nil
}

// --- DNS Scraper ---
type DNScraper struct{}

func (s *DNScraper) Name() string { return "DNS" }

func (s *DNScraper) Run(ctx context.Context, target string) (*ReconSection, error) {
	type dnsResult struct {
		Type  string `json:"type"`
		Value string `json:"value"`
	}

	results := []dnsResult{}

	// A records
	if ips, err := net.LookupHost(target); err == nil {
		for _, ip := range ips {
			results = append(results, dnsResult{Type: "A", Value: ip})
		}
	}

	// CNAME
	if cname, err := net.LookupCNAME(target); err == nil && cname != "" {
		results = append(results, dnsResult{Type: "CNAME", Value: cname})
	}

	// MX
	if mxRecords, err := net.LookupMX(target); err == nil {
		for _, mx := range mxRecords {
			results = append(results, dnsResult{Type: "MX", Value: fmt.Sprintf("%s (priority %d)", mx.Host, mx.Pref)})
		}
	}

	// NS
	if nsRecords, err := net.LookupNS(target); err == nil {
		for _, ns := range nsRecords {
			results = append(results, dnsResult{Type: "NS", Value: ns.Host})
		}
	}

	// TXT
	if txtRecords, err := net.LookupTXT(target); err == nil {
		for _, txt := range txtRecords {
			results = append(results, dnsResult{Type: "TXT", Value: txt})
		}
	}

	return &ReconSection{
		Name:    "DNS",
		Results: results,
	}, nil
}

// --- Header Grabber ---
type HeaderGrabber struct{}

func (s *HeaderGrabber) Name() string { return "Headers" }

func (s *HeaderGrabber) Run(ctx context.Context, target string) (*ReconSection, error) {
	url := fmt.Sprintf("https://%s", target)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; ReconGo/1.0)")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		// Try HTTP
		url = fmt.Sprintf("http://%s", target)
		req, _ = http.NewRequestWithContext(ctx, "GET", url, nil)
		req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; ReconGo/1.0)")
		resp, err = client.Do(req)
		if err != nil {
			return nil, err
		}
	}
	defer resp.Body.Close()

	headers := make(map[string]string)
	for key := range resp.Header {
		headers[key] = resp.Header.Get(key)
	}

	return &ReconSection{
		Name:    "Headers",
		Results: headers,
	}, nil
}

// --- Technology Detector ---
type TechnologyDetector struct{}

func (s *TechnologyDetector) Name() string { return "Technologies" }

func (s *TechnologyDetector) Run(ctx context.Context, target string) (*ReconSection, error) {
	url := fmt.Sprintf("https://%s", target)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; ReconGo/1.0)")

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	techs := []string{}

	server := resp.Header.Get("Server")
	if server != "" {
		techs = append(techs, "Server: "+server)
	}

	poweredBy := resp.Header.Get("X-Powered-By")
	if poweredBy != "" {
		techs = append(techs, "X-Powered-By: "+poweredBy)
	}

	// Security headers
	secHeaders := []string{
		"Strict-Transport-Security",
		"Content-Security-Policy",
		"X-Frame-Options",
		"X-Content-Type-Options",
	}

	for _, h := range secHeaders {
		if resp.Header.Get(h) != "" {
			techs = append(techs, "Security: "+h)
		}
	}

	return &ReconSection{
		Name:    "Technologies",
		Results: techs,
	}, nil
}
