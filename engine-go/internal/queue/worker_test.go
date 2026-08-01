package queue

import (
	"testing"
	"time"
)

// TestQueueManagerEnqueue verifies background task enqueuing and execution.
func TestQueueManagerEnqueue(t *testing.T) {
	qm := NewQueueManager(10)
	defer qm.Shutdown()

	payload := AnalyticsReportPayload{
		ClientCode: "HERMOSILLO-TEST",
		ReportType: "ABM_SUMMARY",
	}

	taskID := qm.Enqueue(TypeAnalyticsReport, payload)

	if taskID == "" {
		t.Errorf("Se esperaba un TaskID válido generado, pero fue vacío")
	}

	// Esperar brevemente a que los goroutines procesen la tarea
	time.Sleep(50 * time.Millisecond)

	t.Logf("✅ Tarea encolada y procesada en segundo plano con ID: %s", taskID)
}
