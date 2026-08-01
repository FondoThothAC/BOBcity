// Package config gestiona las variables de entorno y configuración global de CívicaOS Engine.
package config

import (
	"os"
	"path/filepath"

	"github.com/joho/godotenv"
)

// Config almacena las variables de configuración del servidor Go.
type Config struct {
	Port          string
	JWTSecret     string
	AdminPassword string
	VaultDir      string
	EntitiesDir   string
}

// LoadConfig carga las variables del archivo .env o establece valores por defecto seguros.
func LoadConfig() *Config {
	// Intentar cargar .env si existe
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "thoth_deeptech_secret_2026"
	}

	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = "thoth2026"
	}

	// Determinar ruta de civicaos-vault relativa a la raíz
	cwd, _ := os.Getwd()
	vaultDir := filepath.Join(cwd, "..", "civicaos-vault")
	if _, err := os.Stat(vaultDir); os.IsNotExist(err) {
		vaultDir = filepath.Join(cwd, "civicaos-vault")
	}

	entitiesDir := filepath.Join(vaultDir, "entities")
	_ = os.MkdirAll(entitiesDir, 0755)

	return &Config{
		Port:          port,
		JWTSecret:     jwtSecret,
		AdminPassword: adminPassword,
		VaultDir:      vaultDir,
		EntitiesDir:   entitiesDir,
	}
}
