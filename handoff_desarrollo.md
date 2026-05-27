# Documento de Traspaso de Desarrollo (Handoff) - CívicaOS Engine
**Última Actualización:** 2026-05-26 (Hora local: 17:52)
**Estado del Repositorio:** Sincronizado, compilando al 100% sin advertencias.

Este documento sirve para que cualquier desarrollador humano u otra IA (Gemini, Claude, Qwen, Perplexity, etc.) pueda retomar el desarrollo en cualquier ordenador de forma limpia y transparente.

---

## 1. Arquitectura y Stack Tecnológico
- **Frontend:** React 18 + Vite (Javascript moderno, sin compilaciones pesadas).
- **Diseño Visual:** CSS Vanilla premium con la paleta de diseño **Thoth Aurum** (Obsidianas, Oros y Cianos). *Nota: Evitar Tailwind CSS a menos que se indique explícitamente.*
- **Mapas / GIS:** `react-leaflet` (2D interactivo) y `react-globe.gl` con Three.js (3D orbital).
- **Backend de Simulación:** Python API Server (`simulation/api_server.py`) que procesa telemetría, agentes sintéticos y cálculo de probabilidades electorales (Softmax).

---

## 2. Cambios Clave Fielmente Implementados (Sesión Actual)

### A. Limpieza de Predictor y Creación de Macro-Simulador N-Way
- **Predictor Original:** Se revirtió [PredictorEngine.jsx](file:///Volumes/SSD1TB/plataforma/src/components/PredictorEngine.jsx) a su estado original de laboratorio Head-to-Head puro (enfrentamiento 1v1).
- **Nueva Pestaña N-Way:** Se creó el componente [MacroSimulator.jsx](file:///Volumes/SSD1TB/plataforma/src/components/MacroSimulator.jsx) para simular escenarios masivos con N candidatos simultáneos utilizando el modelo matemático Softmax. Se integró exitosamente al menú lateral de `App.jsx`.

### B. Migración de Sandbox WorldBox (Isometric Canvas ➔ GIS Leaflet)
- **Eliminación del Isometric Canvas:** Se descartó el renderizado procedural Canvas isométrico en [WorldBoxSimulator.jsx](file:///Volumes/SSD1TB/plataforma/src/components/WorldBoxSimulator.jsx).
- **Integración de Leaflet:** Se introdujo `<MapContainer>` con tiles oscuros de alto contraste (CartoDB Dark).
- **Buscador de Municipios de Todo el País:** Añadido un input con autocompletado en la cabecera que lee los ~2,500 municipios de México desde [electoral_scenarios.json](file:///Volumes/SSD1TB/plataforma/src/data/electoral_scenarios.json).
- **Geocodificador Nominatim:** Al seleccionar un municipio, el sistema consulta dinámicamente a la API de **Nominatim (OpenStreetMap)** para obtener la latitud/longitud real y hace un zoom/fly-to a la zona.
- **Agentes Animados reales:** Los agentes sintéticos son renderizados como marcadores dinámicos que oscilan a 60 fps en las calles de la ciudad seleccionada.
- **Construcción Táctica:** Las herramientas de colocación de pozos y obras viales capturan las coordenadas `lat` y `lng` precisas del mapa interactivo al hacer clic.

### C. Habilitación de Streams de Video en Vivo (CCTV Feeds)
- **Corrección de Bugs en Webcams:**
  - En el globo 3D de [GlobalOsirisMap.jsx](file:///Volumes/SSD1TB/plataforma/src/components/GlobalOsirisMap.jsx) y [UnifiedCommandCenter.jsx](file:///Volumes/SSD1TB/plataforma/src/components/UnifiedCommandCenter.jsx), los datos de las webcams perdían sus propiedades debido a un error de propagación (`...w` omitido en el mapeo). Esto fue solucionado.
  - Se añadió la lógica `onCustomLayerClick` y un panel modal flotante para reproducir streams de YouTube/CCTV dentro del globo 3D.
  - Se inyectó la propiedad `stream_url` a las cámaras generadas localmente en el mapa de calor [PainPointsMap.jsx](file:///Volumes/SSD1TB/plataforma/src/components/PainPointsMap.jsx), resolviendo el estado de carga indefinido `CONECTANDO AL SATÉLITE...`.
  - Se configuró la transmisión oficial en vivo solicitada por el usuario (`https://www.youtube.com/embed/WzWkB-WADB4?autoplay=1&mute=1`) como el feed activo de la cámara del Zócalo/Plaza Cívica.

---

## 3. Instrucciones de Ejecución Local
1. **Lanzar Backend Python:**
   ```bash
   # En la raíz o carpeta simulation
   python simulation/api_server.py
   ```
2. **Lanzar Frontend React (Vite):**
   ```bash
   npm run dev
   ```
3. **Validación de Código:**
   ```bash
   npm run build
   ```

---

## 4. Próximos Pasos Sugeridos para la Siguiente IA/Developer
1. **Cache de Coordenadas Municipales:** Para evitar la dependencia al 100% de la API externa de Nominatim durante las búsquedas frecuentes de municipios, se podría pre-cargar o cachear un listado de coordenadas lat/lng en `electoral_scenarios.json` para los municipios más importantes de México.
2. **Mapas de Dolor (Cruce de Datos):** Conectar las herramientas de construcción colocada en el Sandbox directamente con la tabla de "Cruce de Datos" de INEGI en los mapas de dolor para que las obras viales reduzcan dinámicamente la queja de tránsito del municipio en tiempo real.
3. **Soporte de Alturas 3D:** Si el usuario proporciona un API Token de Mapbox, se puede migrar la vista de Leaflet 2D a Mapbox GL JS 3D para activar la extrusión de edificios en tiempo real al hacer zoom.
