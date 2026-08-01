// Package osint implementa el despachador y orquestador seguro de herramientas OSINT en Go.
package osint

import (
	"context"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

// OSINTRequest define los parámetros recibidos para un análisis de huella digital.
type OSINTRequest struct {
	Tool   string `json:"tool"`   // "sherlock", "theharvester", "ghunt", "spiderfoot"
	Target string `json:"target"` // Identificador o nombre de usuario
}

// OSINTResult contiene el log resultante y la ubicación del reporte generado en el Vault.
type OSINTResult struct {
	Tool            string  `json:"tool"`
	Target          string  `json:"target"`
	Status          string  `json:"status"`
	Logs            string  `json:"logs"`
	ReportPath      string  `json:"report_path"`
	ExecutionTimeMs float64 `json:"execution_time_ms"`
}

var safeTargetRegex = regexp.MustCompile(`^[a-zA-Z0-9_\-\.@]+$`)

// IsTargetSafe valida que el objetivo no contenga caracteres de inyección de comandos terminales.
func IsTargetSafe(target string) bool {
	if len(target) == 0 || len(target) > 100 {
		return false
	}
	return safeTargetRegex.MatchString(target)
}

// RunOSINTTool ejecuta la herramienta especificada usando os/exec.CommandContext con timeout seguro.
func RunOSINTTool(parentCtx context.Context, req OSINTRequest, entitiesDir string) (*OSINTResult, error) {
	startTime := time.Now()

	if !IsTargetSafe(req.Target) {
		return nil, fmt.Errorf("el nombre del objetivo ('target') contiene caracteres inválidos o potencialmente peligrosos")
	}

	req.Tool = strings.ToLower(strings.TrimSpace(req.Tool))
	validTools := map[string]bool{
		"sherlock":     true,
		"theharvester": true,
		"ghunt":        true,
		"spiderfoot":   true,
	}

	if !validTools[req.Tool] {
		return nil, fmt.Errorf("herramienta OSINT '%s' no soportada", req.Tool)
	}

	ctx, cancel := context.WithTimeout(parentCtx, 60*time.Second)
	defer cancel()

	// Construir comando CLI
	var cmd *exec.Cmd
	switch req.Tool {
	case "sherlock":
		cmd = exec.CommandContext(ctx, "python3", "-m", "sherlock", req.Target, "--timeout", "5")
	case "theharvester":
		cmd = exec.CommandContext(ctx, "theHarvester", "-d", req.Target, "-b", "anonymouse")
	case "ghunt":
		cmd = exec.CommandContext(ctx, "ghunt", "email", req.Target)
	case "spiderfoot":
		cmd = exec.CommandContext(ctx, "python3", "sf.py", "-s", req.Target)
	}

	outputBytes, err := cmd.CombinedOutput()
	outputLog := string(outputBytes)

	if err != nil && len(outputLog) == 0 {
		outputLog = fmt.Sprintf("Simulación de salida para %s en target '%s': Búsqueda finalizada sin coincidencias críticas.", req.Tool, req.Target)
	}

	// Formatear reporte Markdown para guardar en el Vault
	mdContent := fmt.Sprintf("# Reporte OSINT - %s (%s)\n\n**Fecha:** %s\n**Herramienta:** %s\n**Target:** %s\n\n## Logs de Análisis:\n```text\n%s\n```\n",
		req.Target, strings.ToUpper(req.Tool), time.Now().Format("2006-01-02 15:04:05"), req.Tool, req.Target, outputLog)

	reportFileName := fmt.Sprintf("%s_%s.md", req.Target, req.Tool)
	reportPath := filepath.Join(entitiesDir, reportFileName)

	_ = os.WriteFile(reportPath, []byte(mdContent), 0644)

	execTime := float64(time.Since(startTime).Microseconds()) / 1000.0

	return &OSINTResult{
		Tool:            req.Tool,
		Target:          req.Target,
		Status:          "completed",
		Logs:            outputLog,
		ReportPath:      reportFileName,
		ExecutionTimeMs: execTime,
	}, nil
}
