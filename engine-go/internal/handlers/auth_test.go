package handlers

import (
	"bytes"
	"encoding/json"
	"net/http/httptest"
	"testing"

	"civicaos-engine-go/internal/config"
	"civicaos-engine-go/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

// TestAuthHandlerLogin valida el flujo de inicio de sesión del Administrador.
func TestAuthHandlerLogin(t *testing.T) {
	cfg := &config.Config{
		Port:          "3001",
		JWTSecret:     "test_secret",
		AdminPassword: "test_password",
	}

	app := fiber.New()
	authH := NewAuthHandler(cfg)

	app.Post("/api/auth/login", authH.Login)

	// Caso 1: Login con credenciales válidas
	bodyValid, _ := json.Marshal(map[string]string{
		"username": "admin",
		"password": "test_password",
	})
	reqValid := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(bodyValid))
	reqValid.Header.Set("Content-Type", "application/json")

	respValid, err := app.Test(reqValid)
	if err != nil {
		t.Fatalf("Error en petición HTTP: %v", err)
	}

	if respValid.StatusCode != 200 {
		t.Errorf("Esperado código HTTP 200, obtenido %d", respValid.StatusCode)
	}

	// Caso 2: Login con contraseña incorrecta
	bodyInvalid, _ := json.Marshal(map[string]string{
		"username": "admin",
		"password": "wrong_password",
	})
	reqInvalid := httptest.NewRequest("POST", "/api/auth/login", bytes.NewReader(bodyInvalid))
	reqInvalid.Header.Set("Content-Type", "application/json")

	respInvalid, err := app.Test(reqInvalid)
	if err != nil {
		t.Fatalf("Error en petición HTTP: %v", err)
	}

	if respInvalid.StatusCode != 401 {
		t.Errorf("Esperado código HTTP 401 para credenciales inválidas, obtenido %d", respInvalid.StatusCode)
	}
}

// TestJWTMiddleware valida la interceptación de peticiones no autorizadas.
func TestJWTMiddleware(t *testing.T) {
	secret := "test_secret_key"
	app := fiber.New()

	app.Use("/protected", middleware.JWTMiddleware(secret))
	app.Get("/protected", func(c *fiber.Ctx) error {
		return c.SendString("Acceso Concedido")
	})

	// Caso 1: Petición sin token
	reqNoToken := httptest.NewRequest("GET", "/protected", nil)
	respNoToken, _ := app.Test(reqNoToken)
	if respNoToken.StatusCode != 401 {
		t.Errorf("Esperado HTTP 401 sin token, obtenido %d", respNoToken.StatusCode)
	}

	// Caso 2: Petición con token válido
	token, _ := middleware.GenerateToken("admin", "master", secret)
	reqToken := httptest.NewRequest("GET", "/protected", nil)
	reqToken.Header.Set("Authorization", "Bearer "+token)

	respToken, _ := app.Test(reqToken)
	if respToken.StatusCode != 200 {
		t.Errorf("Esperado HTTP 200 con token válido, obtenido %d", respToken.StatusCode)
	}
}
