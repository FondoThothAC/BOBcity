// Package queue gestiona las tareas asíncronas distribuidas y trabajadores en segundo plano de CívicaOS Engine.
package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"
)

// Constantes con los nombres identificadores de las tareas asíncronas
const (
	TypeAnalyticsReport = "task:analytics_report"
	TypeVaultSync       = "task:vault_sync"
	TypeCleanupLogs     = "task:cleanup_logs"
)

// AnalyticsReportPayload contiene los datos requeridos para generar un reporte en segundo plano.
type AnalyticsReportPayload struct {
	ClientCode string `json:"client_code"`
	ReportType string `json:"report_type"`
}

// VaultSyncPayload define los datos para sincronizar archivos del Vault.
type VaultSyncPayload struct {
	EntityName string `json:"entity_name"`
	Action     string `json:"action"`
}

// TaskResult representa la respuesta del procesamiento de una tarea asíncrona.
type TaskResult struct {
	TaskID      string    `json:"task_id"`
	Type        string    `json:"type"`
	Status      string    `json:"status"`
	ExecutedAt  time.Time `json:"executed_at"`
	Details     string    `json:"details"`
}

// ProcessAnalyticsReportHandler procesa la generación asíncrona de reportes.
func ProcessAnalyticsReportHandler(ctx context.Context, payload []byte) (*TaskResult, error) {
	var p AnalyticsReportPayload
	if err := json.Unmarshal(payload, &p); err != nil {
		return nil, fmt.Errorf("error al decodificar payload de reporte: %v", err)
	}

	log.Printf("⚙️ [Go Worker] Procesando reporte de analítica para el cliente: %s (Tipo: %s)", p.ClientCode, p.ReportType)
	
	// Simular procesamiento computacional sin bloquear el servidor HTTP
	time.Sleep(10 * time.Millisecond)

	return &TaskResult{
		Type:       TypeAnalyticsReport,
		Status:     "completed",
		ExecutedAt: time.Now(),
		Details:    fmt.Sprintf("Reporte generado exitosamente para %s", p.ClientCode),
	}, nil
}

// ProcessVaultSyncHandler procesa la sincronización asíncrona de entidades del Vault.
func ProcessVaultSyncHandler(ctx context.Context, payload []byte) (*TaskResult, error) {
	var p VaultSyncPayload
	if err := json.Unmarshal(payload, &p); err != nil {
		return nil, fmt.Errorf("error al decodificar payload de Vault: %v", err)
	}

	log.Printf("⚙️ [Go Worker] Sincronizando entidad Vault: %s (Acción: %s)", p.EntityName, p.Action)

	return &TaskResult{
		Type:       TypeVaultSync,
		Status:     "completed",
		ExecutedAt: time.Now(),
		Details:    fmt.Sprintf("Entidad %s sincronizada correctamente", p.EntityName),
	}, nil
}
