package osint

import (
	"context"
	"os"
	"testing"
)

// TestIsTargetSafe verifica la sanitización de nombres de usuario y dominios.
func TestIsTargetSafe(t *testing.T) {
	validTargets := []string{"hermosillo_user", "target-123", "admin@domain.com"}
	for _, target := range validTargets {
		if !IsTargetSafe(target) {
			t.Errorf("Target '%s' debería ser válido", target)
		}
	}

	invalidTargets := []string{"target; rm -rf /", "target && cat /etc/passwd", "user|ls", ""}
	for _, target := range invalidTargets {
		if IsTargetSafe(target) {
			t.Errorf("Target malicioso '%s' debería ser rechazado por la sanitización", target)
		}
	}
}

// TestRunOSINTTool verifica la ejecución e ingesta de reportes en el Vault.
func TestRunOSINTTool(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "vault_test")
	if err != nil {
		t.Fatalf("Error al crear directorio temporal: %v", err)
	}
	defer os.RemoveAll(tempDir)

	ctx := context.Background()
	req := OSINTRequest{
		Tool:   "sherlock",
		Target: "test_civit_target",
	}

	res, err := RunOSINTTool(ctx, req, tempDir)
	if err != nil {
		t.Fatalf("Error en la ejecución de la herramienta OSINT: %v", err)
	}

	if res.Status != "completed" {
		t.Errorf("Esperado estado 'completed', obtenido %s", res.Status)
	}

	if res.ReportPath == "" {
		t.Errorf("Se esperaba una ruta válida del reporte en el Vault")
	}

	t.Logf("✅ Prueba de despachador OSINT en Go completada con éxito. Reporte: %s", res.ReportPath)
}
