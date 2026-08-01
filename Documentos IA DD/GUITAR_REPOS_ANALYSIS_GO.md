# 🎸 Análisis de Repositorios de Guitarra y Transcripción a Go

Este documento contiene el análisis comparativo de los 8 repositorios de transcripción musical, editores de tablaturas y reconocedores de audio descargados en `/Volumes/SSD1TB/plataforma/repos_guitarra/`, así como la arquitectura del nuevo paquete nativo en Go **`pkg/guitarpro`**.

---

## 📋 1. Inventario y Análisis de los 8 Repositorios

| Repositorio | Lenguaje | Funciones Clave Identificadas | Estrategia de Transcripción a Go |
| :--- | :--- | :--- | :--- |
| **`helge17/tuxguitar`** | Java | Editor multitrack de tablaturas, decodificación binaria de GP3, GP4, GP5, GPX, renderizado de notación en pantalla, motor de sintetizador MIDI. | Reescritura de modelos binarios en `pkg/guitarpro/gp3.go` y `reader.go`. |
| **`musescore/MuseScore`** | C++ | Parser industrial de notación musical, importación de MusicXML, MIDI, GuitarPro (GP3-GP7), motor de renderizado armónico. | Adaptación de estructuras de compases, tempos y firmas de tiempo en `pkg/guitarpro/models.go`. |
| **`perlence/pyguitarpro`** | Python | Librería limpia para manipulación de estructuras binarias de GuitarPro 3/4/5. | Transcripción directa de la especificación de bytes a `pkg/guitarpro/reader.go`. |
| **`agourlay/ruxguitar`** | Rust | Parser ultrarrápido sin GC de archivos GP3, GP4, GP5, GP6, GP7. | Algoritmo de descompresión y lectura binaria paralela reflejado en Go Goroutines. |
| **`slundi/guitarpro`** | Rust | Workspace Rust para procesamiento de tablaturas y servidor web de notación. | Integración con el handler `guitar_handler.go` en Go Fiber. |
| **`webprofusion/autotablature`** | Python / C++ | Estimación automática de posiciones de cuerdas y trastes a partir de señales de audio/MIDI. | Implementación del algoritmo de optimización física en `pkg/guitarpro/autotab.go`. |
| **`SahilMadan-zz/GuitarProTabsAndroid`** | Java | Visualizador móvil de tablaturas en diapasón de guitarra. | Conversión de posiciones de diapasón a componentes React (`Fretboard.tsx`). |
| **`otnemrasordep/gp-classical-guitar`** | Python / Data | Corpus de tablaturas de guitarra clásica y tabulación polifónica. | Plantillas de demostración integradas en `scoreforge/src/components/library/LibraryView.tsx`. |

---

## 💻 2. Código Implementado en Go (`pkg/guitarpro`)

1. **`models.go`**: Estructuras de datos para `Song`, `Track`, `Header`, `Measure`, `Beat`, `Note` y `Position`.
2. **`reader.go`**: Lector binario (`BinaryReader`) para decodificar tipos primitivos, enteros little-endian y cadenas con formato Pascal de archivos `.gp3`/`.gp4`/`.gp5`.
3. **`gp3.go`**: Decodificador binario de versiones GuitarPro v3 y v4.
4. **`autotab.go`**: Motor de asignación de notas MIDI a cuerdas (1-6) y trastes (0-24) minimizando el salto de mano en el diapasón.
5. **`converter.go`**: Generador de notación AlphaTex para renderizado instantáneo en `ScoreForge`.
6. **`guitar_handler.go`**: Endpoints REST HTTP (`/api/v1/guitar/convert-tab` y `/api/v1/guitar/parse-gp`).

---

## 🧪 3. Verificación de Pruebas Unitarias
El paquete se verificó mediante pruebas unitarias validando la óptima asignación de notas (ej. Nota Do4 MIDI 60 -> Cuerda 2, Traste 1) y la generación correcta de cadenas AlphaTex.
