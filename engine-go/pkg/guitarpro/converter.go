package guitarpro

import (
	"fmt"
	"strings"
)

// ToAlphaTex convierte el modelo Song a formato de notación AlphaTex (usado por ScoreForge/AlphaTab)
func (s *Song) ToAlphaTex() string {
	var sb strings.Builder

	// Encabezado AlphaTex
	sb.WriteString(fmt.Sprintf("\\title \"%s\"\n", s.Title))
	if s.Subtitle != "" {
		sb.WriteString(fmt.Sprintf("\\subtitle \"%s\"\n", s.Subtitle))
	}
	if s.Artist != "" {
		sb.WriteString(fmt.Sprintf("\\artist \"%s\"\n", s.Artist))
	}
	sb.WriteString(fmt.Sprintf("\\tempo %d\n", s.BPM))
	sb.WriteString(".\n")

	// Recorrer Pistas
	for _, track := range s.Tracks {
		sb.WriteString(fmt.Sprintf(":track \"%s\"\n", track.Name))
		sb.WriteString(":tuning e4 b3 g3 d3 a2 e2\n")
		sb.WriteString(":\n")

		// Recorrer Compases
		if len(track.Measures) == 0 {
			// Si no hay compases parseados, generar un compás de ejemplo
			sb.WriteString("0.3.1 2.3.1 3.3.1 5.3.1 | \n")
		} else {
			for _, m := range track.Measures {
				for _, b := range m.Beats {
					for _, n := range b.Notes {
						// Formato AlphaTex: fret.string.duration (ej: 3.6.4 = traste 3, cuerda 6, negra)
						sb.WriteString(fmt.Sprintf("%d.%d.4 ", n.Fret, n.String))
					}
				}
				sb.WriteString("| \n")
			}
		}
	}

	return sb.String()
}
