// Package geolocation implementa geolocalización OSINT para IPs y coordenadas.
package geolocation

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// GeoResult resultado de geolocalización
type GeoResult struct {
	IP        string            `json:"ip,omitempty"`
	Latitude  float64           `json:"latitude"`
	Longitude float64           `json:"longitude"`
	City      string            `json:"city,omitempty"`
	Region    string            `json:"region,omitempty"`
	Country   string            `json:"country,omitempty"`
	Timezone  string            `json:"timezone,omitempty"`
	ISP       string            `json:"isp,omitempty"`
	ASN       string            `json:"asn,omitempty"`
	Accuracy  int               `json:"accuracy_km,omitempty"`
	Metadata  map[string]string `json:"metadata,omitempty"`
}

type Scraper interface {
	Name() string
	Geolocate(ctx context.Context, query string) (*GeoResult, error)
}

type Engine struct {
	scrapers []Scraper
}

func NewEngine() *Engine {
	e := &Engine{
		scrapers: make([]Scraper, 0),
	}
	e.Register(&IPGeolocationScraper{})
	e.Register(&CoordinapeScraper{})
	return e
}

func (e *Engine) Register(s Scraper) {
	e.scrapers = append(e.scrapers, s)
}

func (e *Engine) Geolocate(ctx context.Context, query string) *GeoResult {
	for _, s := range e.scrapers {
		select {
		case <-ctx.Done():
			return nil
		default:
		}
		result, err := s.Geolocate(ctx, query)
		if err == nil && result != nil {
			return result
		}
	}
	return &GeoResult{Metadata: map[string]string{"error": "no results"}}
}

// --- IP Geolocation ---
type IPGeolocationScraper struct{}

func (s *IPGeolocationScraper) Name() string { return "IPGeo" }

func (s *IPGeolocationScraper) Geolocate(ctx context.Context, query string) (*GeoResult, error) {
	url := fmt.Sprintf("https://ipapi.co/%s/json/", query)
	req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)

	client := &http.Client{Timeout: 8 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var data struct {
		IP        string  `json:"ip"`
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
		City      string  `json:"city"`
		Region    string  `json:"region"`
		Country   string  `json:"country_name"`
		Timezone  string  `json:"timezone"`
		Org       string  `json:"org"`
	}

	body, _ := io.ReadAll(io.LimitReader(resp.Body, 5000))
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	return &GeoResult{
		IP:        data.IP,
		Latitude:  data.Latitude,
		Longitude: data.Longitude,
		City:      data.City,
		Region:    data.Region,
		Country:   data.Country,
		Timezone:  data.Timezone,
		ISP:       data.Org,
		Accuracy:  100,
		Metadata:  map[string]string{"source": "ipapi.co"},
	}, nil
}

// --- Coordinape (coordenadas directas) ---
type CoordinapeScraper struct{}

func (s *CoordinapeScraper) Name() string { return "Coordinates" }

func (s *CoordinapeScraper) Geolocate(ctx context.Context, query string) (*GeoResult, error) {
	// Parse "lat,lon" format
	var lat, lon float64
	n, _ := fmt.Sscanf(query, "%f,%f", &lat, &lon)
	if n != 2 {
		return nil, fmt.Errorf("not coordinates")
	}

	return &GeoResult{
		Latitude:  lat,
		Longitude: lon,
		Metadata:  map[string]string{"source": "direct_coordinates"},
	}, nil
}
