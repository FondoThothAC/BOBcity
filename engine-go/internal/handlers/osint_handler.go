package handlers

import (
	"civicaos-engine-go/internal/config"
	"civicaos-engine-go/internal/osint"
	"civicaos-engine-go/internal/ws"
	"civicaos-engine-go/pkg/osintengine"

	"github.com/gofiber/fiber/v2"
)

// OSINTHandler maneja la ejecución segura de análisis OSINT desde el panel web.
type OSINTHandler struct {
	cfg *config.Config
	hub *ws.Hub
}

// NewOSINTHandler crea una nueva instancia del controlador OSINT.
func NewOSINTHandler(cfg *config.Config, hub *ws.Hub) *OSINTHandler {
	return &OSINTHandler{cfg: cfg, hub: hub}
}

// RunTool procesa la solicitud de ejecución de una herramienta OSINT.
func (h *OSINTHandler) RunTool(c *fiber.Ctx) error {
	var req osint.OSINTRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cuerpo de solicitud inválido",
		})
	}

	if !osint.IsTargetSafe(req.Target) {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "El identificador del objetivo contiene caracteres no válidos o inseguros",
		})
	}

	result, err := osint.RunOSINTTool(c.Context(), req, h.cfg.EntitiesDir)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(result)
}

// InvestigateTarget es el endpoint del Agente de Inteligencia Multi-Nivel.
// Ejecuta el motor Go nativo con streaming de logs en tiempo real via WebSocket.
func (h *OSINTHandler) InvestigateTarget(c *fiber.Ctx) error {
	type AgentRequest struct {
		Prompt     string `json:"prompt"`
		Tier       int    `json:"tier"`
		TargetType string `json:"target_type,omitempty"`
	}

	var req AgentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cuerpo inválido"})
	}

	if req.Tier < 1 || req.Tier > 3 {
		req.Tier = 1
	}

	// Broadcast: investigation starting
	if h.hub != nil {
		h.hub.BroadcastLog("engine", "info", "Agente Multi-Nivel activado - Tier "+string(rune(req.Tier+'0')))
	}

	// Crear motor con streaming de logs al WebSocket
	var engine *osintengine.EngineWithLogs
	if h.hub != nil {
		engine = osintengine.NewEngineWithLogs(h.hub.LogCallback())
	} else {
		engine = osintengine.NewEngineWithLogs(nil)
	}

	// Ejecutar escaneo en goroutine para no bloquear la respuesta HTTP
	go func() {
		ctx := c.Context()
		report := engine.ScanTargetWithLogs(ctx, req.Prompt, osintengine.TargetType(req.TargetType))

		// Broadcast: scan complete
		if h.hub != nil {
			h.hub.BroadcastScanComplete(report.Target, report.MatchesCount, report.ExecutionTimeMs)
		}
	}()

	// Respuesta inmediata al frontend
	tierEstimates := map[int]int{1: 5, 2: 120, 3: 3600}
	return c.JSON(fiber.Map{
		"status":  "investigation_started",
		"tier":    req.Tier,
		"target":  req.Prompt,
		"message": "Investigación en curso - los resultados se transmiten por WebSocket",
		"ws_endpoint": "/ws/logs",
		"estimated_time_seconds": tierEstimates[req.Tier],
		"engines_active": []string{
			"Sherlock_Go (300+ sitios)",
			"Subfinder_Go (crt.sh)",
			"Amass_Go (DNS/ASN)",
			"Gobuster_Go (Directorios)",
			"Gitleaks_Go (Secrets)",
			"PhoneInfoga_Go (Teléfonos)",
			"Harvester_Go (Emails)",
		},
	})
}

// GetTools retorna la lista de herramientas disponibles
func (h *OSINTHandler) GetTools(c *fiber.Ctx) error {
	tools := []fiber.Map{
		{"id": "sherlock", "name": "Sherlock Go", "category": "username", "description": "Enumera 300+ sitios web para un usuario", "engine": "go_native", "status": "active"},
		{"id": "subfinder", "name": "Subfinder Go", "category": "domain", "description": "Enumeración pasiva de subdominios vía crt.sh", "engine": "go_native", "status": "active"},
		{"id": "amass", "name": "Amass Go", "category": "domain", "description": "Resolución DNS y mapeo ASN", "engine": "go_native", "status": "active"},
		{"id": "gobuster", "name": "Gobuster Go", "category": "domain", "description": "Descubrimiento de directorios y rutas", "engine": "go_native", "status": "active"},
		{"id": "gitleaks", "name": "Gitleaks Go", "category": "username", "description": "Escaneo de secretos en GitHub", "engine": "go_native", "status": "active"},
		{"id": "phoneinfoga", "name": "PhoneInfoga Go", "category": "phone", "description": "OSINT sobre números de teléfono", "engine": "go_native", "status": "active"},
		{"id": "harvester", "name": "Harvester Go", "category": "email", "description": "Extracción de emails vía crt.sh", "engine": "go_native", "status": "active"},
		{"id": "ghunt", "name": "GHunt", "category": "email", "description": "Investigación de cuentas Google", "engine": "python", "status": "active"},
		{"id": "spiderfoot", "name": "SpiderFoot", "category": "multi", "description": "Automatización OSINT completa", "engine": "python", "status": "active"},
	}
	return c.JSON(fiber.Map{"tools": tools, "total": len(tools)})
}

// GetScanStatus retorna el estado de un escaneo en curso
func (h *OSINTHandler) GetScanStatus(c *fiber.Ctx) error {
	scanID := c.Params("id")
	return c.JSON(fiber.Map{
		"scan_id": scanID,
		"status":  "running",
		"ws_logs": "/ws/logs",
	})
}
