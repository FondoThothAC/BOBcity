package guitarpro

import "time"

// Song representa la estructura completa de un documento de GuitarPro / ScoreForge
type Song struct {
	Title        string   `json:"title"`
	Subtitle     string   `json:"subtitle"`
	Artist       string   `json:"artist"`
	Album        string   `json:"album"`
	Author       string   `json:"author"`
	Copyright    string   `json:"copyright"`
	TablatureBy  string   `json:"tablature_by"`
	Instructions string   `json:"instructions"`
	Notice       []string `json:"notice"`
	BPM          int      `json:"bpm"`
	Key          int      `json:"key"` // Tonalidad (0 = C Major)
	Tracks       []Track  `json:"tracks"`
	Measures     []Header `json:"measures"`
}

// Header define la firma de tiempo y metrónomo de un compás
type Header struct {
	Number        int  `json:"number"`
	Numerator     int  `json:"numerator"`   // Ej. 4 en 4/4
	Denominator   int  `json:"denominator font-mono"` // Ej. 4 en 4/4
	IsRepeatStart bool `json:"is_repeat_start"`
	RepeatCount   int  `json:"repeat_count"`
}

// Track representa un instrumento o pista en la tablatura
type Track struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	Instrument string    `json:"instrument"`
	Color      string    `json:"color"`
	IsMuted    bool      `json:"is_muted"`
	IsSolo     bool      `json:"is_solo"`
	IsPercussion bool    `json:"is_percussion"`
	Strings    []int     `json:"strings"` // Afinación de cuerdas en tonos MIDI (ej. [64, 59, 55, 50, 45, 40] para E Std)
	Frets      int       `json:"frets"`   // Cantidad de trastes (ej. 24)
	Measures   []Measure `json:"measures"`
}

// Measure es la división de un compás para una pista específica
type Measure struct {
	Number int    `json:"number"`
	Beats  []Beat `json:"beats"`
}

// Beat representa un pulso o tiempo dentro del compás
type Beat struct {
	Start    float64 `json:"start"`    // Tiempo en pulsos/segundos
	Duration float64 `json:"duration"` // Duración (1 = negra, 0.5 = corchea)
	Text     string  `json:"text,omitempty"`
	Notes    []Note  `json:"notes"`
}

// Note representa una nota individual tocada en una cuerda/traste
type Note struct {
	String    int  `json:"string"`    // Número de cuerda (1 a 6)
	Fret      int  `json:"fret"`      // Traste (0 a 24)
	Pitch     int  `json:"pitch"`     // Nota MIDI (ej. 60 = Do central)
	Velocity  int  `json:"velocity"`  // Dinámica/Volumen (0 a 127)
	IsTied    bool `json:"is_tied"`   // Nota ligada
	IsDead    bool `json:"is_dead"`   // Traste ahogado (X)
	IsGhost   bool `json:"is_ghost"`  // Nota fantasma ()
	IsHammer  bool `json:"is_hammer"` // Hammer-on / Pull-off
	IsSlide   bool `json:"is_slide"`  // Slide/Deslizamiento
	IsVibrato bool `json:"is_vibrato"`// Vibrato
	IsBend    bool `json:"is_bend"`   // Bend
	BendValue int  `json:"bend_value,omitempty"`
}

// AutoTabConfig configura el motor de conversión de notas MIDI/Frecuencias a trastes de guitarra
type AutoTabConfig struct {
	Tuning          []int `json:"tuning"`           // Afinación estándar o personalizada
	MaxFretReach    int   `json:"max_fret_reach"`   // Distancia máxima de trastes para estiramiento de mano (ej. 4)
	PreferLowFrets  bool  `json:"prefer_low_frets"` // Preferir primeras posiciones (trastes 0-5)
	PreferOpenStrings bool `json:"prefer_open_strings"`
}
