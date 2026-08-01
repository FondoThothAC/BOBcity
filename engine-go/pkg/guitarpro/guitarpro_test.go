package guitarpro

import (
	"strings"
	"testing"
)

func TestAutoTabEngine(t *testing.T) {
	config := AutoTabConfig{
		Tuning:         []int{64, 59, 55, 50, 45, 40}, // E Standard
		MaxFretReach:   4,
		PreferLowFrets: true,
	}
	engine := NewAutoTabEngine(config)

	// Probar nota C4 (MIDI 60) -> Debería mapear a Cuerda 2 (B3), Traste 1
	pos := engine.OptimalPosition(60, 0)
	if pos.String != 2 || pos.Fret != 1 {
		t.Errorf("Esperado Cuerda 2, Traste 1 para C4 (60), pero obtenido Cuerda %d, Traste %d", pos.String, pos.Fret)
	}

	// Probar acorde C Mayor (MIDI 60, 64, 67)
	beat := engine.ConvertPitchesToBeat([]int{60, 64, 67}, 0, 1.0)
	if len(beat.Notes) != 3 {
		t.Fatalf("Esperadas 3 notas en el pulso, pero se obtuvieron %d", len(beat.Notes))
	}
}

func TestConverterAlphaTex(t *testing.T) {
	song := &Song{
		Title:  "Test Metal Riff",
		Artist: "Go Engine",
		BPM:    140,
		Tracks: []Track{
			{
				Name: "Guitar 1",
				Measures: []Measure{
					{
						Number: 1,
						Beats: []Beat{
							{
								Start:    0,
								Duration: 0.5,
								Notes: []Note{
									{String: 6, Fret: 0, Pitch: 40},
									{String: 6, Fret: 3, Pitch: 43},
									{String: 6, Fret: 5, Pitch: 45},
								},
							},
						},
					},
				},
			},
		},
	}

	alphaTex := song.ToAlphaTex()
	if !strings.Contains(alphaTex, "\\title \"Test Metal Riff\"") {
		t.Errorf("AlphaTex no contiene el título correcto: %s", alphaTex)
	}
	if !strings.Contains(alphaTex, "0.6.4 3.6.4 5.6.4") {
		t.Errorf("AlphaTex no contiene las notas tabuladas esperadas: %s", alphaTex)
	}
}
