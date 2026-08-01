package handlers

import (
	"civicaos-engine-go/internal/ai"

	"github.com/gofiber/fiber/v2"
)

// AIHandler gestiona las solicitudes de enjambre de agentes de Inteligencia Artificial.
type AIHandler struct{}

// NewAIHandler crea una nueva instancia del manejador de IA.
func NewAIHandler() *AIHandler {
	return &AIHandler{}
}

// RunSwarm procesa las peticiones del Swarm Cognitivo concurrente.
func (h *AIHandler) RunSwarm(c *fiber.Ctx) error {
	var req ai.SwarmRequest
	if err := c.BodyParser(&req); err != nil || req.Prompt == "" {
		req.Prompt = "Evaluación de descontento social e infraestructura cívica municipal"
	}

	result := ai.ExecuteSwarm(c.Context(), req)
	return c.JSON(result)
}
