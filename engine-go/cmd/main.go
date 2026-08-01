// Package main es el punto de entrada principal del motor CívicaOS Engine en Go.
package main

import (
	"log"

	"civicaos-engine-go/internal/config"
	"civicaos-engine-go/internal/handlers"
	"civicaos-engine-go/internal/middleware"
	"civicaos-engine-go/internal/static"
	"civicaos-engine-go/internal/ws"

	"github.com/gofiber/websocket/v2"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Cargar configuración de entorno
	cfg := config.LoadConfig()

	// Iniciar WebSocket hub para streaming en tiempo real
	hub := ws.NewHub()
	go hub.Run()
	log.Printf("[WS] Hub WebSocket iniciado para streaming de logs OSINT")

	// Crear aplicación de Go Fiber
	app := fiber.New(fiber.Config{
		AppName:      "CívicaOS Engine Go v2.0",
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

	// Instanciar manejadores (con WebSocket hub para OSINT)
	authH := handlers.NewAuthHandler(cfg)
	vaultH := handlers.NewVaultHandler(cfg)
	simH := handlers.NewSimulationHandler()
	aiH := handlers.NewAIHandler()
	osintH := handlers.NewOSINTHandler(cfg, hub)
	citizenH := handlers.NewCitizenHandler(cfg)
	guitarH := handlers.NewGuitarHandler()

	// Rutas Públicas
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":           "ok",
			"engine":           "Go Fiber",
			"version":          "2.0.0",
			"ws_clients":       hub.GetClientCount(),
			"osint_engines":    7,
			"tools_registered": "Sherlock, Subfinder, Amass, Gobuster, Gitleaks, PhoneInfoga, Harvester",
		})
	})

	// WebSocket endpoint para logs en tiempo real
	app.Get("/ws/logs", websocket.New(ws.HandleWebSocket(hub)))

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

	// OSINT API - Herramientas y Investigación
	osintGroup := api.Group("/osint")
	osintGroup.Get("/tools", osintH.GetTools)
	osintGroup.Get("/scan/:id", osintH.GetScanStatus)

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

	log.Printf("🚀 Servidor CívicaOS Engine (Go) v2.0 iniciado en el puerto :%s", cfg.Port)
	log.Printf("📡 WebSocket disponible en ws://%s:%s/ws/logs", "localhost", cfg.Port)
	log.Printf("🔧 Herramientas OSINT nativas: Sherlock(300+), Subfinder, Amass, Gobuster, Gitleaks, PhoneInfoga, Harvester")

	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatalf("Error al iniciar servidor de Go: %v", err)
	}
}
