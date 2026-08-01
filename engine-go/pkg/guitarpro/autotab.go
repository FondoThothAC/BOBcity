package guitarpro

import (
	"math"
)

// AutoTabEngine calcula automáticamente la posición óptima de cuerdas y trastes a partir de notas MIDI
type AutoTabEngine struct {
	config AutoTabConfig
}

func NewAutoTabEngine(config AutoTabConfig) *AutoTabEngine {
	if len(config.Tuning) == 0 {
		// Afinación Estándar por defecto: E4 (64), B3 (59), G3 (55), D3 (50), A2 (45), E2 (40)
		config.Tuning = []int{64, 59, 55, 50, 45, 40}
	}
	if config.MaxFretReach == 0 {
		config.MaxFretReach = 4
	}
	return &AutoTabEngine{config: config}
}

// Position representa la cuerda (1 a 6) y el traste (0 a 24) para una nota dada
type Position struct {
	String int `json:"string"`
	Fret   int `json:"fret"`
}

// FindPossiblePositions encuentra todas las formas físicas de tocar una nota MIDI dada la afinación
func (e *AutoTabEngine) FindPossiblePositions(pitch int) []Position {
	positions := make([]Position, 0)

	for strIdx, openPitch := range e.config.Tuning {
		fret := pitch - openPitch
		// Verificar si el traste está dentro del diapasón físico de la guitarra (trastes 0 a 24)
		if fret >= 0 && fret <= 24 {
			stringNum := strIdx + 1 // Cuerda 1 es la más aguda (E4)
			positions = append(positions, Position{
				String: stringNum,
				Fret:   fret,
			})
		}
	}

	return positions
}

// OptimalPosition elige la mejor cuerda y traste minimizando saltos bruscos en el diapasón
func (e *AutoTabEngine) OptimalPosition(pitch int, lastFret int) Position {
	possible := e.FindPossiblePositions(pitch)
	if len(possible) == 0 {
		return Position{String: 1, Fret: 0}
	}

	bestPos := possible[0]
	minCost := math.MaxFloat64

	for _, pos := range possible {
		// Costo 1: Distancia al traste previo
		fretDiff := math.Abs(float64(pos.Fret - lastFret))
		cost := fretDiff

		// Costo 2: Preferencia de trastes bajos si está habilitado
		if e.config.PreferLowFrets {
			cost += float64(pos.Fret) * 0.2
		}

		// Costo 3: Preferir cuerdas al aire (traste 0)
		if pos.Fret == 0 && e.config.PreferOpenStrings {
			cost -= 2.0
		}

		if cost < minCost {
			minCost = cost
			bestPos = pos
		}
	}

	return bestPos
}

// ConvertPitchesToBeat asigna notas MIDI a un pulso con sus mejores posiciones físicas
func (e *AutoTabEngine) ConvertPitchesToBeat(pitches []int, start float64, duration float64) Beat {
	beat := Beat{
		Start:    start,
		Duration: duration,
		Notes:    make([]Note, 0),
	}

	lastFret := 5 // Posición inicial de la mano en traste 5
	for _, pitch := range pitches {
		pos := e.OptimalPosition(pitch, lastFret)
		lastFret = pos.Fret

		beat.Notes = append(beat.Notes, Note{
			String:   pos.String,
			Fret:     pos.Fret,
			Pitch:    pitch,
			Velocity: 100,
		})
	}

	return beat
}
