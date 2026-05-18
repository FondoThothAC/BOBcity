# UXDD - Documento de Diseño de Experiencia de Usuario (User Experience Design Document)
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 1.0.0  
**Fecha:** 2026-05-18  
**Autor:** Antigravity Agent  
**Estado:** Especificación Oficial  

---

## 1. Principios de Diseño UX/UI y Estética Premium

Para CívicaOS, la experiencia de usuario (UX) y el diseño visual de la interfaz (UI) no son simples agregados estéticos, sino componentes funcionales críticos. Una plataforma que maneja grandes volúmenes de datos demográficos y electorales complejos corre el riesgo de abrumar cognitivamente al usuario. Por ello, el diseño se rige por la filosofía de **Estética Premium ("Rich Aesthetics")** e interfaces dinámicas y responsivas.

### Directrices y Principios de Diseño:
1. **Modo Oscuro Inmersivo por Defecto:** Reduce la fatiga visual durante sesiones prolongadas de análisis y simulación, además de proyectar una estética moderna, seria y de alta tecnología. Se utiliza una paleta de fondo Slate/Zinc profunda y elegante.
2. **Glassmorphism y Profundidad Visual:** Las tarjetas y paneles flotantes de la consola utilizan fondos translúcidos (`backdrop-filter: blur()`) y micro-bordes brillantes. Esto crea una sensación de capas tridimensionales estructuradas sin saturar la pantalla.
3. **Jerarquía Visual y Tipografía Curada:** Se utiliza la fuente **Outfit** de Google Fonts para títulos e indicadores numéricos de alto impacto (dando un aspecto premium y moderno), combinada con **Inter** para textos de lectura general y fuentes monoespaciadas para la consola de logs.
4. **Retroalimentación Dinámica (Micro-Animaciones):** Las interacciones físicas con sliders, popups de mapas o botones de exportación disparan transiciones fluidas de 150-300ms, haciendo que la interfaz se sienta "viva" y responda inmediatamente a las intenciones del usuario.

---

## 2. Mapa de Navegación e Flujos de Usuario (User Flows)

El flujo de usuario principal está optimizado para completarse con el menor número de clics posible, manteniendo al estratega en un único espacio de trabajo cohesivo.

```mermaid
graph TD
    Login[Pantalla de Acceso Local] --> Dashboard[Dashboard Overview]
    Dashboard --> Console[Consola del Orquestador]
    
    subgraph Consola del Orquestador (Ciclo de Análisis)
        Console -->|1. Ingresa Consulta| SwarmProgress[Visualización de Enjambre]
        SwarmProgress -->|2. Identifica Severidad| HeatMap[Mapa de Calor Leaflet]
        HeatMap -->|3. Prueba Intervenciones| ABMSim[Simulador ABM - Sliders]
        ABMSim -->|4. Evalúa Viabilidad| PredEngine[Predictor Electoral]
    end
    
    PredEngine -->|5. Exportar| OBPModal[Modal mTLS OBP]
    OBPModal -->|Éxito| OBPLaunch[Abrir Proyecto en Open Business Plan]
```

### Detalle del Flujo de Intervención:
1. **Punto de Partida:** Sofía ingresa al Dashboard y observa que la felicidad promedio en Hermosillo Sur (Distrito 8) ha caído un 15%.
2. **Consulta en la Consola:** Escribe en la consola: *"Analizar descontento y problemas en D8 Palo Verde"*. El Swarm se activa y renderiza los logs.
3. **Exploración del Mapa:** El mapa de calor resalta la zona de Palo Verde en rojo brillante (Severidad 98, categoría: **Agua**). Sofía hace clic y ve que hay 12,500 personas afectadas por tandeos e interrupciones del servicio.
4. **Simulación de Políticas:** Sofía abre el simulador ABM integrado. Incrementa el slider de *Inversión en Infraestructura de Agua* al 85% y disminuye levemente el de *Impuestos Comerciales*. Observa en el gráfico Recharts cómo la felicidad de los comerciantes y asalariados sube a 78 puntos en 3 años.
5. **Evaluación de Intención de Voto:** Ve que la intención de voto para el Candidato A (social/incumbente) aumenta en un 8.2%, asegurando el distrito.
6. **Exportación a Negocio:** Hace clic en *"Exportar a Open Business Plan"*. El modal ejecuta el intercambio seguro por mTLS y crea el proyecto `OBP-2026-001` para iniciar la licitación y ejecución de la planta potabilizadora.

---

## 3. Guía de Estilos de la Interfaz (Styleguide)

### 3.1 Paleta de Colores (Mapeo HSL)
La paleta está inspirada en interfaces científicas avanzadas y dashboards de alto rendimiento:

* **Fondo de la Aplicación (Deep Canvas):** `hsl(222, 47%, 7%)` (Slate 950 muy profundo)
* **Fondo de Tarjetas Translúcidas (Glass):** `rgba(15, 23, 42, 0.65)` con desenfoque de 12px
* **Borde Sutil por Defecto:** `rgba(255, 255, 255, 0.08)`
* **Acento Primario (Esmeralda):** `hsl(142, 70%, 45%)` (Representa éxito, progreso y estado activo de agentes)
* **Acento Secundario (Cian):** `hsl(188, 86%, 53%)` (Representa datos, simulaciones y conectores externos)
* **Alertas y Warnings (Ámbar):** `hsl(37, 95%, 52%)` (Para timeouts de APIs o datos parciales)
* **Errores (Coral/Rojo):** `hsl(0, 84%, 60%)` (Para fallos críticos de agentes o Ollama offline)

### 3.2 Escala Tipográfica
* **Títulos Principales / KPIs:** Google Fonts **Outfit** - Semibold, tamaños 24px - 36px, `tracking-wide` (espaciado elegante).
* **Subtítulos y Cabeceras de Tarjetas:** **Outfit** - Medium, tamaños 18px - 20px.
* **Textos de Lectura / Inputs:** Google Fonts **Inter** - Regular, tamaño 14px (óptimo para legibilidad y densidad de información).
* **Consola de Eventos y Logs:** Fira Code o JetBrains Mono - tamaños 11px - 12px.

### 3.3 Iconografía (Lucide React)
Se asocian iconos específicos para identificar componentes de forma intuitiva:
* `Play`: Disparar orquestación / simulación.
* `Cpu`: Agentes del Swarm / Ollama local.
* `MapPin`: Geodistritos de Hermosillo.
* `Droplet`: Puntos de dolor de Agua.
* `ShieldAlert`: Puntos de dolor de Seguridad.
* `TrendingUp`: Gráficos de proyección de la simulación.
* `FileSpreadsheet`: Exportación a Open Business Plan.

---

## 4. Representación de la Interfaz (Wireframes & Mockups)

A continuación se presenta un wireframe conceptual detallado de la consola central y el espacio de trabajo de CívicaOS en formato estructurado:

```
+------------------------------------------------------------------------------------------------------------------------------------+
|  CívicaOS  [ Swarm Console ]  [ Map View ]  [ ABM Simulator ]  [ Electoral Predictor ]                 [ API: OK ]  [ OBP: CONNECTED ]  |
+------------------------------------------------------------------------------------------------------------------------------------+
|  +--------------------------------------------------------------------+  +------------------------------------------------------+  |
|  |  CONSOLA DEL ORQUESTADOR MULTI-AGENTE                              |  |  MAPA DE CALOR INTERACTIVO (HERMOSILLO)               |  |
|  |  Consulta: [ Analizar crisis de agua en Hermosillo D8            ] |  |  +------------------------------------------------+  |  |
|  |  [ INICIAR ANÁLISIS DE SWARM ]              [ Mocks: Off ]         |  |  |  [+] [D6 Norte - Bugambilias (Felicidad: 68)]      |  |  |
|  |                                                                    |  |  |  [-]                                               |  |  |
|  |  Enjambre de IA (Estado de Procesamiento)                          |  |  |      /=============\                               |  |  |
|  |  [x] DataCollector      --> [ COMPLETADO ] 100% (INE/INEGI local)  |  |  |     /  D6_NORTE     \                              |  |  |
|  |  [x] PainPointAnalyzer  --> [ COMPLETADO ] 100% (Water severity:98)|  |  |    /                 \                             |  |  |
|  |  [o] ABMSimulator       --> [ PROCESANDO ]  70% (Proyección 10a)   |  |  |   |   D9_CENTRO       |                            |  |  |
|  |  [ ] RecommendationGen  --> [ ESPERANDO  ]                             |  |  |   |                   |                            |  |  |
|  |  [ ] OBPIntegrator      --> [ ESPERANDO  ]                             |  |  |    \                 /   /=============\          |  |  |
|  |                                                                    |  |  |     \   D8_SUR      /   /   D8_SUR     \         |  |  |
|  |  Registro del Swarm (Log de Eventos)                               |  |  |      \=============/   /   (Severidad:98) \        |  |  |
|  |  +--------------------------------------------------------------+  |  |  |                       \=================/        |  |  |
|  |  | [17:38:11] [Console] -> AGENT_STARTED: data-collector        |  |  |  +------------------------------------------------+  |  |
|  |  | [17:38:13] [Collector] -> 15,000 registros demográficos OK.  |  |  +------------------------------------------------------+  |
|  |  | [17:38:14] [Analyzer] -> Búsqueda semántica Qdrant completada.|  |  +------------------------------------------------------+  |
|  |  | [17:38:16] [ABMSimulator] -> Inicializando 300 agentes...    |  |  |  SIMULADOR ABM (POLÍTICAS PÚBLICAS Y PROYECCIÓN 10 AÑOS) |  |
|  |  +--------------------------------------------------------------+  |  |  Sliders de Políticas:                               |  |
|  |                                                                    |  |  - Inversión en Agua:       [==========o     ] 75%   |  |
|  |  Severidad de Dolores Agrupada                                     |  |  - Presupuesto Seguridad:   [=======o        ] 50%   |  |
|  |  - Agua:       [========================================] 98% (D8)  |  |  - Subsidio Transporte:    [====o           ] 30%   |  |
|  |  - Seguridad:  [===========================] 65% (D8 / D9)          |  |  - Impuesto Comercial:     [==o             ] 15%   |  |
|  |  - Economía:   [=================] 42% (D9)                        |  |                                                      |  |
|  |                                                                    |  |  Proyección de Bienestar Colectivo:                  |  |
|  |  [ VER PLAN DE ATAQUE Y RECOMENDACIONES ]                          |  |  Felicidad (%) 100 |          _--^-                  |  |
|  |                                                                    |  |                 50 |      _--~                       |  |
|  |  [ EXPORTAR PROPUESTA A OPEN BUSINESS PLAN ]                        |  |                  0 +------------------------            |  |
|  |                                                                    |  |                     Año 1    Año 5   Año 10          |  |
|  +--------------------------------------------------------------------+  +------------------------------------------------------+  |
+------------------------------------------------------------------------------------------------------------------------------------+
```

### 4.1 Consola de Restricciones Físicas y de Primeros Principios

Para elevar la fidelidad táctil y el realismo en el modelado del entorno estival de Sonora, la sección de **Restricciones de Primeros Principios** en la interfaz se estructuró con 5 controles deslizantes ("sliders") de alta densidad visual con colorización dinámica condicional (HSL tailored neon colors):

1. **🌡️ Temperatura Ambiente (°C):** Rango $15 \text{ a } 50^\circ\text{C}$.
   * *Código de Color:* Verde normal ($\le 35^\circ\text{C}$), Ámbar de calentamiento ($\le 42^\circ\text{C}$), Coral neón en ola de calor extrema ($> 42^\circ\text{C}$).
2. **⚡ Factor de Subsidio CFE ($/kWh):** Rango $\$0.50 \text{ a } \$3.00$.
   * *Código de Color:* Verde subsidio robusto ($\ge \$1.60$), Ámbar amortiguación mínima ($\ge \$1.00$), Coral de desamparo financiero ($< \$1.00$).
3. **💧 Presupuesto Red Hídrica (MD USD):** Rango $\$5\text{M a } \$50\text{M}$.
   * *Código de Color:* Verde normal ($\ge \$25\text{M}$), Ámbar de cautela ($\ge \$15\text{M}$), Coral de déficit crítico ($< \$15\text{M}$).
4. **☀️ Radiación Solar Directa (W/m²):** Rango $100 \text{ a } 1000 \text{ W/m}^2$.
   * *Código de Color:* Verde generación confortable ($\le 500 \text{ W/m}^2$), Ámbar Sonora estival ($\le 800 \text{ W/m}^2$), Coral de estruendo térmico y radiación extrema ($> 800 \text{ W/m}^2$).
5. **🚰 Presión de Tandeo Hídrico (%):** Rango $10\% \text{ a } 100\%$ ($8 \text{ a } 80 \text{ PSI}$).
   * *Código de Color:* Verde flujo óptimo ($\ge 70\%$), Ámbar flujo intermitente ($\ge 50\%$), Coral de desabasto micro-predio ($< 50\%$).

### 4.2 Indicadores Micro-Geográficos del Ciudadano (Inspector de Agentes)
Cuando el usuario selecciona un agente sintético individual, el panel de detalles demográficos (Micro-Inspector) despliega información física en tiempo real acoplada al entorno geográfico del predio del agente:
* **Radiación Local (Predio):** Irradiancia local ajustada por sombreado geográfico local de Geohash-9 ($\text{sandboxRadiacion} \pm \Delta_{local} \text{ W/m}^2$).
* **Presión Hidráulica (Predio):** Presión calculada de flujo en PSI y porcentaje al final de la manzana o bloque de distribución urbana ($\text{sandboxPresionAgua} - \Delta_{geohash\_drop}\%$).

### 4.3 Panel de Entrevista Cognitiva y Chat de Agente (Ajuste C)
El Micro-Inspector incorpora una consola conversacional interactiva para entrevistar a los ciudadanos sintéticos y evaluar la percepción subjetiva de las crisis ambientales e infraestructurales:
* **Estructura del Componente:**
  - **Encabezado Neon:** Título de sección con icono `MessageSquare` (`hsl(188, 86%, 53%)`) y subtítulo monoespaciado que indica el LLM local (`Qwen-2.5-72B`).
  - **Selector de Preguntas Frecuentes:** Dropdown premium con opciones pre-programadas para interrogar sobre la presión de agua, tarifas de luz de la CFE, apoyo a movilizaciones y cortes de bulevar.
  - **Input Dinámico:** Input de texto visible únicamente cuando se selecciona "Pregunta personalizada", permitiendo un interrogatorio libre.
  - **Botón Táctil "Entrevistar":** Dispara una animación de carga conectando con la cognición simulada.
* **Estilo del Globo de Respuesta:**
  - **Fondo:** Translúcido profundo (`rgba(0,0,0,0.4)`) con borde izquierdo acentuado en color cian neón de 3px.
  - **Tipografía de Respuesta:** Cita en itálica en fuente **Inter** para diferenciar la voz del ciudadano sintético del texto técnico del sistema.
  - **Persona e Idioma:** Respuestas calibradas con modismos hermosillenses ("calorón", "tinaco", "de la patada", "truenan", "de veras", "oiga") y condicionales lógicos que adaptan el discurso del agente según su felicidad, su ingreso mensual ($), la presión de agua (PSI) y la radiación real en su predio geohash.

---

*Documento UXDD actualizado: 2026-05-18*  
*Próxima revisión programada: 2026-06-18*  
