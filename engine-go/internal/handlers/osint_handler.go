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
