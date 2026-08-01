package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"
)


// QueueManager gestiona la ejecución concurrente de tareas en segundo plano.
type QueueManager struct {
	tasksChan chan TaskItem
	wg        sync.WaitGroup
	quit      chan struct{}
}

// TaskItem envuelve una tarea encolada con su identificador y datos.
type TaskItem struct {
	ID        string
	Type      string
	Payload   []byte
	CreatedAt time.Time
}

// NewQueueManager crea e inicializa un motor de colas ultra-ligero en Go.
func NewQueueManager(bufferSize int) *QueueManager {
	if bufferSize <= 0 {
		bufferSize = 100
	}
	qm := &QueueManager{
		tasksChan: make(chan TaskItem, bufferSize),
		quit:      make(chan struct{}),
	}
	qm.startWorkers(4) // 4 trabajadores concurrentes
	return qm
}

// startWorkers inicia los goroutines trabajadores que procesan la cola en segundo plano.
func (qm *QueueManager) startWorkers(count int) {
	for i := 0; i < count; i++ {
		qm.wg.Add(1)
		go func(workerID int) {
			defer qm.wg.Done()
			for {
				select {
				case task, ok := <-qm.tasksChan:
					if !ok {
						return
					}
					qm.processTask(workerID, task)
				case <-qm.quit:
					return
				}
			}
		}(i)
	}
}

// processTask ejecuta el handler correspondiente según el tipo de tarea.
func (qm *QueueManager) processTask(workerID int, task TaskItem) {
	ctx := context.Background()
	var err error
	var res *TaskResult

	switch task.Type {
	case TypeAnalyticsReport:
		res, err = ProcessAnalyticsReportHandler(ctx, task.Payload)
	case TypeVaultSync:
		res, err = ProcessVaultSyncHandler(ctx, task.Payload)
	default:
		log.Printf("⚠️ [Worker %d] Tarea no reconocida: %s", workerID, task.Type)
		return
	}

	if err != nil {
		log.Printf("❌ [Worker %d] Error ejecutando tarea %s: %v", workerID, task.ID, err)
	} else if res != nil {
		log.Printf("✅ [Worker %d] Tarea %s completada: %s", workerID, task.ID, res.Details)
	}
}

// Enqueue agrega una nueva tarea a la cola asíncrona de Go.
func (qm *QueueManager) Enqueue(taskType string, payloadData interface{}) string {
	payload, _ := json.Marshal(payloadData)
	taskID := fmt.Sprintf("task_%d", time.Now().UnixNano())

	item := TaskItem{
		ID:        taskID,
		Type:      taskType,
		Payload:   payload,
		CreatedAt: time.Now(),
	}

	select {
	case qm.tasksChan <- item:
		log.Printf("📥 [Queue] Tarea %s encolada (Tipo: %s)", taskID, taskType)
	default:
		log.Printf("⚠️ [Queue] Cola llena, ejecutando tarea %s inmediatamente", taskID)
		go qm.processTask(0, item)
	}

	return taskID
}

// Shutdown detiene de manera segura los trabajadores esperando que terminen las tareas pendientes.
func (qm *QueueManager) Shutdown() {
	close(qm.quit)
	close(qm.tasksChan)
	qm.wg.Wait()
	log.Println("🛑 QueueManager de Go detenido limpiamente.")
}
