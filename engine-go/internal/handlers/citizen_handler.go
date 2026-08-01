package handlers

import (
	"civicaos-engine-go/internal/citizen"
	"civicaos-engine-go/internal/config"

	"github.com/gofiber/fiber/v2"
)

// CitizenHandler maneja los endpoints de ingesta cívica del portal ThothAgora.
type CitizenHandler struct {
	cfg *config.Config
}

// NewCitizenHandler crea una nueva instancia del controlador cívico.
func NewCitizenHandler(cfg *config.Config) *CitizenHandler {
	return &CitizenHandler{cfg: cfg}
}

// IngestProposal procesa la ingesta de propuestas cívicas anonimizadas.
func (h *CitizenHandler) IngestProposal(c *fiber.Ctx) error {
	var req citizen.IngestRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cuerpo de solicitud cívica inválido",
		})
	}

	result, err := citizen.ProcessIngest(req, h.cfg.EntitiesDir)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(result)
}
