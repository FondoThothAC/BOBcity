package handlers

import (
	"civicaos-engine-go/internal/config"
	"civicaos-engine-go/internal/osint"

	"github.com/gofiber/fiber/v2"
)

// OSINTHandler maneja la ejecución segura de análisis OSINT desde el panel web.
type OSINTHandler struct {
	cfg *config.Config
}

// NewOSINTHandler crea una nueva instancia del controlador OSINT.
func NewOSINTHandler(cfg *config.Config) *OSINTHandler {
	return &OSINTHandler{cfg: cfg}
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
// Recibe un prompt natural y procesa la investigación dependiendo del nivel (1=Instantáneo, 2=Interactivo, 3=Profundo).
func (h *OSINTHandler) InvestigateTarget(c *fiber.Ctx) error {
	type AgentRequest struct {
		Prompt string `json:"prompt"`
		Tier   int    `json:"tier"` // 1: Scout, 2: Interactive, 3: Deep
	}

	var req AgentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cuerpo inválido"})
	}

	if req.Tier < 1 || req.Tier > 3 {
		req.Tier = 1 // Default to Tier 1
	}

	// TODO: Integrar aquí la extracción de entidades con Ollama local y la instanciación de osintengine.NewEngine().
	// Por ahora devolvemos el mock de orquestación inicial para validar el frontend.
	return c.JSON(fiber.Map{
		"status": "investigation_started",
		"tier":   req.Tier,
		"target_prompt": req.Prompt,
		"message": "El Agente Multi-Nivel ha recibido el objetivo y el motor nativo de Go está orquestando las herramientas.",
		"estimated_time_seconds": map[int]int{1: 5, 2: 120, 3: 3600}[req.Tier],
	})
}
