package citizen

import (
	"os"
	"testing"
)

// TestObscureCURP verifica el enmascaramiento seguro de la CURP.
func TestObscureCURP(t *testing.T) {
	curp := "ABCD123456HDFR09"
	obscured := ObscureCURP(curp)

	expected := "ABCD************09"
	if obscured != expected {
		t.Errorf("Esperado '%s', obtenido '%s'", expected, obscured)
	}
}

// TestGenerateHolographicSignature verifica la generación determinista de hash SHA-256.
func TestGenerateHolographicSignature(t *testing.T) {
	sig1 := GenerateHolographicSignature("ABCD123456HDFR09", "83000", "Pavimentación de calle")
	sig2 := GenerateHolographicSignature("ABCD123456HDFR09", "83000", "Pavimentación de calle")

	if sig1 != sig2 {
		t.Errorf("Las firmas holográficas deberían ser idénticas para la misma entrada")
	}

	if len(sig1) != 64 {
		t.Errorf("Se esperaba un hash SHA-256 hexadecimal de 64 caracteres, obtenido %d", len(sig1))
	}
}

// TestProcessIngest verifica la persistencia y respuesta cívica en Go.
func TestProcessIngest(t *testing.T) {
	tempDir, err := os.MkdirTemp("", "vault_ingest_test")
	if err != nil {
		t.Fatalf("Error creando directorio temporal: %v", err)
	}
	defer os.RemoveAll(tempDir)

	req := IngestRequest{
		CURP:     "ABCD123456HDFR09",
		ZipCode:  "83000",
		Proposal: "Instalación de paneles solares cívicos",
	}

	res, err := ProcessIngest(req, tempDir)
	if err != nil {
		t.Fatalf("Error procesando ingesta cívica: %v", err)
	}

	if !res.Success {
		t.Errorf("Se esperaba resultado positivo en la ingesta cívica")
	}

	if res.ObscuredCURP != "ABCD************09" {
		t.Errorf("CURP obscura incorrecta: %s", res.ObscuredCURP)
	}

	t.Logf("✅ Ingesta cívica procesada en %.2f ms (Firma SHA-256: %s)", res.ExecutionTime, res.Signature)
}
