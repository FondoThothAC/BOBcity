package osintengine

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net"
	"time"
)

// parseJSON reads from an io.Reader and unmarshals into target
func parseJSON(r io.Reader, target interface{}) error {
	body, err := io.ReadAll(r)
	if err != nil {
		return err
	}
	return json.Unmarshal(body, target)
}

// lookupDNS performs DNS resolution for a domain
func lookupDNS(ctx context.Context, domain string) ([]string, error) {
	resolver := &net.Resolver{}
	ips, err := resolver.LookupHost(ctx, domain)
	if err != nil {
		return nil, err
	}
	return ips, nil
}

// detectTargetType automatically determines the type of a target string
func detectTargetType(input string) TargetType {
	// Email pattern
	for i, c := range input {
		if c == '@' && i > 0 && i < len(input)-1 {
			return TargetTypeEmail
		}
	}

	// IP pattern
	if net.ParseIP(input) != nil {
		return TargetTypeIP
	}

	// Phone pattern (starts with + or has country code)
	if len(input) > 6 && (input[0] == '+' || (len(input) >= 10 && isNumeric(input))) {
		return TargetTypePhone
	}

	// Domain pattern (contains dot and TLD)
	if containsDot(input) && !containsSpace(input) {
		return TargetTypeDomain
	}

	// Default: username
	return TargetTypeUsername
}

func isNumeric(s string) bool {
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return len(s) > 0
}

func containsDot(s string) bool {
	for _, c := range s {
		if c == '.' {
			return true
		}
	}
	return false
}

func containsSpace(s string) bool {
	for _, c := range s {
		if c == ' ' {
			return true
		}
	}
	return false
}

// LogCallback is called for real-time log streaming during tool execution
type LogCallback func(tool, level, message string)

// EngineWithLogs extends Engine with log streaming support
type EngineWithLogs struct {
	*Engine
	logCallback LogCallback
}

// NewEngineWithLogs creates an engine with log streaming support
func NewEngineWithLogs(callback LogCallback) *EngineWithLogs {
	return &EngineWithLogs{
		Engine:      NewEngine(),
		logCallback: callback,
	}
}

// ScanTargetWithLogs executes all scrapers with real-time log streaming
func (e *EngineWithLogs) ScanTargetWithLogs(ctx context.Context, target string, targetType TargetType) OSINTReport {
	startTime := time.Now()

	if targetType == "" {
		targetType = detectTargetType(target)
	}

	if e.logCallback != nil {
		e.logCallback("engine", "info", fmt.Sprintf("Starting investigation: %s (type: %s)", target, targetType))
		e.logCallback("engine", "info", fmt.Sprintf("Registered scrapers: %d", len(e.scrapers)))
	}

	matchesChan := make(chan []OSINTMatch, len(e.scrapers))

	for _, s := range e.scrapers {
		if s.Category() == targetType || targetType == "" {
			go func(scraper Scraper) {
				name := scraper.Name()
				if e.logCallback != nil {
					e.logCallback(name, "info", fmt.Sprintf("Starting %s on target: %s", name, target))
				}

				matches, err := scraper.Execute(ctx, target)
				if err != nil {
					if e.logCallback != nil {
						e.logCallback(name, "error", fmt.Sprintf("Error: %v", err))
					}
					return
				}

				if e.logCallback != nil {
					e.logCallback(name, "info", fmt.Sprintf("Completed: found %d matches", len(matches)))
				}

				if len(matches) > 0 {
					matchesChan <- matches
				}
			}(s)
		}
	}

	// Wait with context timeout
	done := make(chan struct{})
	go func() {
		// Simple wait - in production use errgroup
		time.Sleep(30 * time.Second)
		close(done)
	}()

	select {
	case <-done:
	case <-ctx.Done():
	}

	close(matchesChan)

	allMatches := make([]OSINTMatch, 0)
	for matches := range matchesChan {
		allMatches = append(allMatches, matches...)
	}

	execTime := float64(time.Since(startTime).Microseconds()) / 1000.0

	if e.logCallback != nil {
		e.logCallback("engine", "info", fmt.Sprintf("Investigation complete: %d total matches in %.1fms", len(allMatches), execTime))
	}

	return OSINTReport{
		Target:          target,
		Type:            targetType,
		ExecutionTimeMs: execTime,
		MatchesCount:    len(allMatches),
		Matches:         allMatches,
	}
}
