// Package static gestiona el servicio de activos de producción compilados del Frontend React en Go.
package static

import (
	"os"
	"path/filepath"

	"github.com/gofiber/fiber/v2"
)

// SetupStaticRoutes configura el servicio de activos estáticos del Frontend con SPA Fallback para React Router.
func SetupStaticRoutes(app *fiber.App) {
	cwd, _ := os.Getwd()
	distDir := filepath.Join(cwd, "limpia", "dist")
	if _, err := os.Stat(distDir); os.IsNotExist(err) {
		distDir = filepath.Join(cwd, "..", "limpia", "dist")
	}
	if _, err := os.Stat(distDir); os.IsNotExist(err) {
		distDir = filepath.Join(cwd, "dist")
	}

	// Servir archivos estáticos del empaquetado de producción de Vite
	app.Static("/", distDir, fiber.Static{
		Compress:  true,
		ByteRange: true,
		Browse:    false,
		Index:     "index.html",
	})

	// SPA Fallback: redirigir cualquier ruta desconocida (que no sea API) a index.html
	app.Use(func(c *fiber.Ctx) error {
		// Evitar redirigir rutas de la API a index.html
		path := c.Path()
		if len(path) >= 4 && path[:4] == "/api" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Endpoint de API no encontrado",
			})
		}

		indexPath := filepath.Join(distDir, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			return c.SendFile(indexPath)
		}

		return c.Status(fiber.StatusNotFound).SendString("Página no encontrada")
	})
}
