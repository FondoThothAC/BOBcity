package handlers

import (
	"civicaos-engine-go/pkg/guitarpro"
	"github.com/gofiber/fiber/v2"
)

// GuitarHandler gestiona la conversión y procesamiento de tablaturas GuitarPro en Go.
type GuitarHandler struct{}

func NewGuitarHandler() *GuitarHandler {
	return &GuitarHandler{}
}

// AutoTabRequest estructura la petición para convertir notas MIDI a tablatura
type AutoTabRequest struct {
	Pitches      []int   `json:"pitches"`       // Lista de notas MIDI (ej. [60, 64, 67])
	Tuning       []int   `json:"tuning"`        // Afinación opcional
	PreferLow    bool    `json:"prefer_low"`    // Preferir trastes bajos
}

// ConvertToTab procesa notas MIDI y devuelve la posición física óptima en el diapasón
func (h *GuitarHandler) ConvertToTab(c *fiber.Ctx) error {
	var req AutoTabRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Cuerpo de petición inválido"})
	}

	config := guitarpro.AutoTabConfig{
		Tuning:         req.Tuning,
		PreferLowFrets: req.PreferLow,
	}
	engine := guitarpro.NewAutoTabEngine(config)

	beat := engine.ConvertPitchesToBeat(req.Pitches, 0, 1.0)

	return c.JSON(fiber.Map{
		"status": "success",
		"beat":   beat,
	})
}

// ParseGP3 sube un archivo binario GP3/GP4 y lo convierte automáticamente a notación AlphaTex/ScoreForge
func (h *GuitarHandler) ParseGP3(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("file")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Archivo no proporcionado"})
	}

	file, err := fileHeader.Open()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Error abriendo archivo"})
	}
	defer file.Close()

	parser := guitarpro.NewGP3Parser(file)
	song, err := parser.Parse()
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}

	alphaTex := song.ToAlphaTex()

	return c.JSON(fiber.Map{
		"status":   "success",
		"song":     song,
		"alphatex": alphaTex,
	})
}
