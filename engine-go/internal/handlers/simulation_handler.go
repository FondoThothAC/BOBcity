package handlers

import (
	"civicaos-engine-go/internal/simulation"

	"github.com/gofiber/fiber/v2"
)

// SimulationHandler gestiona las peticiones de simulación ABM y predicción Monte Carlo.
type SimulationHandler struct{}

// NewSimulationHandler crea una nueva instancia del manejador de simulación.
func NewSimulationHandler() *SimulationHandler {
	return &SimulationHandler{}
}

// RunABM ejecuta la simulación sociológica Hegselmann-Krause y devuelve métricas.
func (h *SimulationHandler) RunABM(c *fiber.Ctx) error {
	var params simulation.ABMParams
	if err := c.BodyParser(&params); err != nil {
		// Asignar parámetros por defecto si el cuerpo está vacío o es parcial
		params = simulation.ABMParams{
			AgentsCount:     200,
			Epsilon:         0.2,
			Iterations:      10,
			PolicyTransport: 5.0,
			PolicyWater:     5.0,
			PolicySecurity:  5.0,
		}
	}

	result := simulation.RunHegselmannKrause(params)
	return c.JSON(result)
}

// PredictMonteCarlo ejecuta la simulación de escenarios electorales Monte Carlo.
func (h *SimulationHandler) PredictMonteCarlo(c *fiber.Ctx) error {
	var params simulation.PredictParams
	if err := c.BodyParser(&params); err != nil {
		params = simulation.PredictParams{
			CandidateA:  "Candidato A",
			CandidateB:  "Candidato B",
			Simulations: 1000,
		}
	}

	result := simulation.MonteCarloPredict(params)
	return c.JSON(result)
}
