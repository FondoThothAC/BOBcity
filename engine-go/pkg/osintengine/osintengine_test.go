package osintengine

import (
	"context"
	"testing"
)

// TestEngineScanTargetUsername valida la ejecución del motor OSINT concurrente para nombres de usuario.
func TestEngineScanTargetUsername(t *testing.T) {
	engine := NewEngine()
	ctx := context.Background()

	report := engine.ScanTarget(ctx, "octocat", TargetTypeUsername)

	if report.Target != "octocat" {
		t.Errorf("Esperado objetivo 'octocat', obtenido '%s'", report.Target)
	}

	if report.ExecutionTimeMs <= 0 {
		t.Errorf("El tiempo de ejecución debe ser mayor a 0ms")
	}

	t.Logf("✅ Escaneo OSINT de usuario en Go completado en %.2f ms (Coincidencias: %d)", report.ExecutionTimeMs, report.MatchesCount)
}

// TestEngineScanTargetDomain valida el escaneo pasivo de dominios.
func TestEngineScanTargetDomain(t *testing.T) {
	engine := NewEngine()
	ctx := context.Background()

	report := engine.ScanTarget(ctx, "github.com", TargetTypeDomain)

	if report.Target != "github.com" {
		t.Errorf("Esperado objetivo 'github.com', obtenido '%s'", report.Target)
	}

	t.Logf("✅ Escaneo OSINT de dominio en Go completado en %.2f ms (Coincidencias: %d)", report.ExecutionTimeMs, report.MatchesCount)
}
