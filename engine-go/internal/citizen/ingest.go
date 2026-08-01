// Package citizen implementa la ingesta de demandas cívicas y la generación de firmas criptográficas de Gemelos Digitales.
package citizen

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// IngestRequest representa los datos de entrada recibidos del portal ThothAgora.
type IngestRequest struct {
	CURP     string `json:"curp"`
	ZipCode  string `json:"zip_code"`
	Phone    string `json:"phone"`
	Proposal string `json:"proposal"`
}

// IngestResult almacena el resultado anonimizado y la firma criptográfica generada.
type IngestResult struct {
	Success       bool    `json:"success"`
	ObscuredCURP  string  `json:"obscured_curp"`
	Signature     string  `json:"signature"`
	ProposalID    string  `json:"proposal_id"`
	Timestamp     string  `json:"timestamp"`
	ExecutionTime float64 `json:"execution_time_ms"`
}

const saltSecret = "THOTH_DIGITAL_TWIN_SALT_2026"

// ObscureCURP oscurece la CURP protegiendo la identidad del ciudadano (ej. ABCD123456HDFR09 -> ABCD************09).
func ObscureCURP(curp string) string {
	curp = strings.TrimSpace(curp)
	if len(curp) < 6 {
		return "XXXX************XX"
	}
	prefix := curp[:4]
	suffix := curp[len(curp)-2:]
	return fmt.Sprintf("%s************%s", prefix, suffix)
}

// GenerateHolographicSignature genera un hash SHA-256 único e inmutable para el Gemelo Digital.
func GenerateHolographicSignature(curp, zipCode, proposal string) string {
	rawString := fmt.Sprintf("%s:%s:%s:%s", curp, zipCode, proposal, saltSecret)
	hash := sha256.Sum256([]byte(rawString))
	return hex.EncodeToString(hash[:])
}

// ProcessIngest procesa la demanda cívica, la anonimiza, firma criptográficamente y la persiste en el Vault.
func ProcessIngest(req IngestRequest, entitiesDir string) (*IngestResult, error) {
	startTime := time.Now()

	if strings.TrimSpace(req.Proposal) == "" {
		return nil, fmt.Errorf("la propuesta o demanda cívica no puede estar vacía")
	}

	obscured := ObscureCURP(req.CURP)
	signature := GenerateHolographicSignature(req.CURP, req.ZipCode, req.Proposal)
	timestampStr := time.Now().Format(time.RFC3339)
	proposalID := fmt.Sprintf("prop_%d", time.Now().UnixNano())

	// Persistir propuesta en el Vault como reporte Markdown anonimizado
	mdContent := fmt.Sprintf("# Gemelo Digital - Propuesta Cívica (%s)\n\n"+
		"**CURP Anonimizada:** %s\n"+
		"**Código Postal:** %s\n"+
		"**Firma Holográfica SHA-256:** `%s`\n"+
		"**Fecha de Registró:** %s\n\n"+
		"## Demanda Ciudadana:\n%s\n",
		proposalID, obscured, req.ZipCode, signature, timestampStr, req.Proposal)

	targetFile := filepath.Join(entitiesDir, fmt.Sprintf("%s.md", proposalID))
	_ = os.WriteFile(targetFile, []byte(mdContent), 0644)

	execTime := float64(time.Since(startTime).Microseconds()) / 1000.0

	return &IngestResult{
		Success:       true,
		ObscuredCURP:  obscured,
		Signature:     signature,
		ProposalID:    proposalID,
		Timestamp:     timestampStr,
		ExecutionTime: execTime,
	}, nil
}
