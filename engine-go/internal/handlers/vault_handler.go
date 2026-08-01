package handlers

import (
	"os"
	"path/filepath"
	"strings"

	"civicaos-engine-go/internal/config"

	"github.com/gofiber/fiber/v2"
)

// VaultHandler maneja el acceso y edición del Vault de Inteligencia Cívica.
type VaultHandler struct {
	cfg *config.Config
}

// NewVaultHandler crea una nueva instancia del controlador del Vault.
func NewVaultHandler(cfg *config.Config) *VaultHandler {
	return &VaultHandler{cfg: cfg}
}

// EntityFile representa un reporte almacenado en el Vault.
type EntityFile struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Size int64  `json:"size"`
}

// ListEntities devuelve la lista de archivos markdown en civicaos-vault/entities.
func (h *VaultHandler) ListEntities(c *fiber.Ctx) error {
	files, err := os.ReadDir(h.cfg.EntitiesDir)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al leer el directorio del Vault",
		})
	}

	var entities []EntityFile
	for _, f := range files {
		if !f.IsDir() && strings.HasSuffix(f.Name(), ".md") {
			info, err := f.Info()
			size := int64(0)
			if err == nil {
				size = info.Size()
			}
			entities = append(entities, EntityFile{
				Name: strings.TrimSuffix(f.Name(), ".md"),
				Path: f.Name(),
				Size: size,
			})
		}
	}

	if entities == nil {
		entities = []EntityFile{}
	}

	return c.JSON(entities)
}

// GetEntity content devuelve el contenido del reporte markdown.
func (h *VaultHandler) GetEntity(c *fiber.Ctx) error {
	name := c.Params("name")
	if name == "" || strings.Contains(name, "..") || strings.Contains(name, "/") || strings.Contains(name, "\\") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nombre de entidad inválido o intento de path traversal",
		})
	}

	if !strings.HasSuffix(name, ".md") {
		name += ".md"
	}

	targetPath := filepath.Join(h.cfg.EntitiesDir, name)
	content, err := os.ReadFile(targetPath)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Entidad no encontrada en el Vault",
		})
	}

	return c.JSON(fiber.Map{
		"name":    name,
		"content": string(content),
	})
}

// SaveEntity creates or updates an entity file.
type SaveEntityRequest struct {
	Name    string `json:"name"`
	Content string `json:"content"`
}

func (h *VaultHandler) SaveEntity(c *fiber.Ctx) error {
	var req SaveEntityRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Solicitud inválida",
		})
	}

	if req.Name == "" || strings.Contains(req.Name, "..") || strings.Contains(req.Name, "/") || strings.Contains(req.Name, "\\") {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Nombre de entidad inválido",
		})
	}

	fileName := req.Name
	if !strings.HasSuffix(fileName, ".md") {
		fileName += ".md"
	}

	targetPath := filepath.Join(h.cfg.EntitiesDir, fileName)
	if err := os.WriteFile(targetPath, []byte(req.Content), 0644); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al guardar la entidad en el Vault",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Entidad guardada con éxito en el Vault",
	})
}
