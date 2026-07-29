package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"civicaos-engine-go/gds"
	"civicaos-engine-go/scrapers"
)

func main() {
	log.Println("=========================================================")
	log.Println(" CívicaOS - Motor Multiverso Bare-Metal (Go Engine v1.0) ")
	log.Println(" Arquitectura: Data-Oriented Design & Zero-Allocation   ")
	log.Println("=========================================================")

	engine := gds.NewMultiverseEngine(16) // 16 trabajadores concurrentes
	scraperEngine := scrapers.NewScraperEngine()

	// Endpoint 1: Healthcheck
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{
			"status":  "ok",
			"engine":  "civicaos-engine-go",
			"version": "1.0.0",
		})
	})

	// Endpoint 2: Explorador Multiverso (Doctor Strange / Emergence World Simulator)
	http.HandleFunc("/api/v1/multiverse/explore", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		numTimelinesStr := r.URL.Query().Get("timelines")
		numTimelines := 100
		if val, err := strconv.Atoi(numTimelinesStr); err == nil && val > 0 {
			numTimelines = val
		}

		policyBase := r.URL.Query().Get("policy")
		if policyBase == "" {
			policyBase = "Subsidio Transporte + Infraestructura Hídrica"
		}

		ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
		defer cancel()

		startTime := time.Now()
		timelines := engine.ExplorePossibilities(ctx, numTimelines, policyBase)
		duration := time.Since(startTime)

		response := map[string]interface{}{
			"policy_base":      policyBase,
			"timelines_count":  len(timelines),
			"total_duration_ms": duration.Milliseconds(),
			"results":          timelines,
		}

		json.NewEncoder(w).Encode(response)
	})

	// Endpoint 3: Agregador de Scrapers CCTV / OSINT en Go
	http.HandleFunc("/api/v1/scrapers/aggregate", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")

		sampleTargets := []scrapers.ScrapingTarget{
			{ID: "cctv_hermosillo_01", URL: "https://httpbin.org/status/200", Type: "cctv"},
			{ID: "cctv_palo_verde_08", URL: "https://httpbin.org/status/200", Type: "cctv"},
			{ID: "osint_twitter_feed", URL: "https://httpbin.org/status/200", Type: "osint"},
		}

		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()

		results := scraperEngine.FetchBatch(ctx, sampleTargets)
		json.NewEncoder(w).Encode(results)
	})

	port := "8085"
	fmt.Printf("[civicaos-engine-go] Escuchando peticiones en http://localhost:%s\n", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatalf("Error crítico al iniciar servidor Go: %v", err)
	}
}
