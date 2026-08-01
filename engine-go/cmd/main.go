// Package main es el punto de entrada principal del motor CívicaOS Engine en Go.
package main

import (
	"log"

	"civicaos-engine-go/internal/config"
	"civicaos-engine-go/internal/handlers"
	"civicaos-engine-go/internal/middleware"
	"civicaos-engine-go/internal/static"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Cargar configuración de entorno
	cfg := config.LoadConfig()

	// Crear aplicación de Go Fiber
	app := fiber.New(fiber.Config{
		AppName:      "CívicaOS Engine Go v1.0",
		ServerHeader: "Fiber/CivicaOS",
	})

	// Middlewares globales
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${latency} ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Instanciar manejadores
	authH := handlers.NewAuthHandler(cfg)
	vaultH := handlers.NewVaultHandler(cfg)
	simH := handlers.NewSimulationHandler()
	aiH := handlers.NewAIHandler()
	osintH := handlers.NewOSINTHandler(cfg)
	citizenH := handlers.NewCitizenHandler(cfg)
	guitarH := handlers.NewGuitarHandler()

	// Rutas Públicas
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"engine":  "Go Fiber",
			"version": "1.0.0",
		})
	})

	// Compatibilidad con frontend legado
	app.Post("/run-simulation", simH.RunABM)
	app.Post("/run-swarm", aiH.RunSwarm)

	api := app.Group("/api")
	authGroup := api.Group("/auth")
	authGroup.Post("/login", authH.Login)

	// Rutas públicas de simulación, IA e Ingesta Cívica
	simGroup := api.Group("/simulation")
	simGroup.Post("/run", simH.RunABM)
	simGroup.Post("/predict", simH.PredictMonteCarlo)

	aiGroup := api.Group("/ai")
	aiGroup.Post("/swarm", aiH.RunSwarm)

	citizenGroup := api.Group("/citizen")
	citizenGroup.Post("/ingest", citizenH.IngestProposal)
	citizenGroup.Post("/proposal", citizenH.IngestProposal)

	guitarGroup := api.Group("/v1/guitar")
	guitarGroup.Post("/convert-tab", guitarH.ConvertToTab)
	guitarGroup.Post("/parse-gp", guitarH.ParseGP3)

	// Rutas Protegidas (JWT Middleware)
	protected := api.Group("")
	protected.Use(middleware.JWTMiddleware(cfg.JWTSecret))

	protected.Get("/auth/me", authH.Me)
	protected.Get("/vault/entities", vaultH.ListEntities)
	protected.Get("/vault/entities/:name", vaultH.GetEntity)
	protected.Post("/vault/entities", vaultH.SaveEntity)
	protected.Post("/osint/run", osintH.RunTool)
	protected.Post("/v1/agent/investigate", osintH.InvestigateTarget)

	// Servidor de activos estáticos del Frontend (SPA Fallback)
	static.SetupStaticRoutes(app)

	log.Printf("🚀 Servidor CívicaOS Engine (Go) iniciado en el puerto :%s", cfg.Port)
	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("Error al iniciar servidor de Go: %v", err)
	}
}





