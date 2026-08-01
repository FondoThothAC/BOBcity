// Package handlers implementa los controladores HTTP para las rutas de CívicaOS Engine.
package handlers

import (
	"civicaos-engine-go/internal/config"
	"civicaos-engine-go/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

// LoginRequest representa la carga útil esperada en la autenticación.
type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// AuthHandler maneja la autenticación y validación de usuarios.
type AuthHandler struct {
	cfg *config.Config
}

// NewAuthHandler crea una nueva instancia del manejador de autenticación.
func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{cfg: cfg}
}

// Login procesa la solicitud de inicio de sesión y retorna un JWT.
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Cuerpo de solicitud inválido",
		})
	}

	// Validar usuario y contraseña (compatibilidad con Node.js server.js)
	if req.Username != "admin" || req.Password != h.cfg.AdminPassword {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Credenciales inválidas",
		})
	}

	// Generar Token JWT
	token, err := middleware.GenerateToken(req.Username, "master", h.cfg.JWTSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error al generar token de sesión",
		})
	}

	return c.JSON(fiber.Map{
		"token": token,
		"user": fiber.Map{
			"username": req.Username,
			"role":     "master",
		},
	})
}

// Me retorna los detalles de la sesión del usuario actualmente autenticado.
func (h *AuthHandler) Me(c *fiber.Ctx) error {
	username := c.Locals("username")
	role := c.Locals("role")

	return c.JSON(fiber.Map{
		"authenticated": true,
		"username":      username,
		"role":          role,
	})
}
