# Plan de Implementación: Motor de Emergencia y Evolución Temporal (Emergence Town)

El usuario desea incorporar una sección de **Comportamientos Emergentes y Evolución Temporal** inspirada en simulaciones autónomas de agentes (como Project Sid de Altera o Stanford AI Town, donde los agentes sin control caen en colapso, vandalismo y sobrecarga de servicios). Dado que **CívicaOS** es una plataforma de gobernanza activa, la simulación **no es completamente autónoma/descontrolada**; aplicamos restricciones físicas y diseño de mecanismos para estabilizar la evolución del sistema.

Agregaremos un panel premium llamado **"Motor de Emergencia y Evolución (Emergence Town Simulator)"** en el visualizador **GDS-MEGA** que permitirá simular y visualizar la evolución del gemelo digital mes a mes.

---

## User Review Required

> [!IMPORTANT]
> **Interacciones en Tiempo Real:** 
> Diseñaremos un simulador temporal animado paso a paso (de 1 a 12 meses) que recalculará dinámicamente las curvas de evolución y los riesgos emergentes al cambiar los sliders físicos (Temperatura, Subsidio, Inversión) o al habilitar mecanismos de intervención (Paneles solares, Tarifa Plana, Pipas).
> Esto permitirá contrastar visualmente el "Colapso Descontrolado (Sin Parámetros/Intervenciones)" contra la "Estabilidad Diseñada (Con CívicaOS)".

---

## Open Questions

1. **¿Prefieres que la simulación de 12 meses corra de manera automática con un temporizador (*Play/Pause*) en el frontend, o que solo avance paso a paso de forma manual?** (Por defecto, propondremos un botón **"Ejecutar Evolución Animada (12 Meses)"** que simula el avance mes a mes con un temporizador dinámico de React, junto con la opción de avanzar manualmente).

---

## Proposed Changes

### [GDS-MEGA Visualizer Component]

#### [MODIFY] [GDSMegaVisualizer.jsx](file:///Volumes/SSD1TB/plataforma/src/components/GDSMegaVisualizer.jsx)
Implementaremos las siguientes sub-secciones dentro de la pestaña `gds-mega`:

1. **Simulador de Evolución Temporal (12 Meses):**
   - Añadir controles de simulación: Botón **"▶️ Iniciar Evolución Animada"**, **"⏸️ Pausar"** y **"🔄 Reiniciar Simulación"**.
   - Estado local de `currentMonth` (rango de 1 a 12) y `evolutionHistory` (array de métricas mes a mes).
2. **Gráfico de Evolución de Comportamientos Emergentes (Recharts Area/Line Chart):**
   - Un gráfico combinado que muestra la trayectoria temporal de:
     - **Riesgo de Vandalismo y Fuego Urbano (Arson/Delictivo):** Escala de 0% a 100%. Spikes si el calor supera 42°C y el subsidio o agua están en déficit.
     - **Riesgo de Apagón / Paro de Red (Shutdown):** Spikes si la temperatura supera 45°C sin paneles solares habilitados.
     - **Índice de Polarización y Desconfianza (Social Decay):** Aumenta progresivamente con el estrés si las cámaras de eco están activas.
     - **Felicidad Social Contenida:** El amortiguador del sistema.
3. **Indicadores de Contención por Mecanismo:**
   - Panel que explica con precisión matemática cómo cada checkbox de mecanismo (Paneles Solares, Tarifa Plana, Vouchers de Agua) mitiga la pendiente de colapso y aplana la curva de riesgo en la evolución.

### Tier 3 — Hardware Masivo (1-4x Bizon G9000 / ~640GB a 2.5TB VRAM)
- **Mundos paralelos:** 50-200 simultáneos (hasta 5,000+ con 4x Bizon)
- **Modelos IA en FP16 sin cuantizar y APIs Open/Privadas Potentes:**
  - **Llama 3.1 70B (FP16):** El "Caballo de Batalla" — procesamiento de agentes en tiempo real.
  - **Llama 3.1 400B:** El "Estratega Master" — análisis macroeconómico profundo distribuido.
  - **DeepSeek-V3 / DeepSeek-R1 (671B MoE, open-weights):** El "Razonador Sistémico" — razonamiento lógico avanzado y calibración fina de enjambres cívicos.
  - **GLM-4 / GLM-4-9B (Zhipu AI):** El "Matemático Estructurado" — optimizado para llamadas a herramientas (function calling) y estructuración tabular.
  - **Kimi / Moonshot AI (Ultra-contexto):** El "Lector Histórico" — lectura de expedientes cívicos gigantescos sin pérdida de contexto.
  - **MiniMax-Text (Modelos narrativos):** El "Generador Narrativo" — construcción de crónicas realistas sobre el multiverso.
  - **Qwen 3.5 122B:** El "Matemático" — KPIs tabulares y probabilidades de impacto social.
  - **Mistral Large 123B / Mistral Medium 3.5 128B:** El "Simulador de Multitudes" — decisiones heterogéneas a gran escala.
  - **Llama 4 Maverick 128x17B:** El "Oráculo Paralelo" — inferencia masiva de miles de agentes simultáneos usando MoE de 128 expertos.
- **Velocidad:** x1 a x10,000 (un año simulado ≈ 30 segundos a 5 minutos)
- **Monte Carlo:** 200+ realidades alternas bifurcadas simultáneamente

### Requisitos Físicos del Servidor (Tier 3)
- **Espacio:** Cuarto dedicado de mínimo 3x3m con piso falso antiestático
- **Refrigeración:** Sistema de enfriamiento líquido (loop cerrado) + A/C industrial 24/7 (~5,000W TDP por Bizon)
- **Electricidad:** Circuito dedicado de 220V/50A con UPS de respaldo (≥10kVA)
- **Red:** Conexión de fibra óptica simétrica ≥1Gbps (ideal 10Gbps entre nodos)
- **CPU auxiliar:** AMD EPYC 9004 o Intel Xeon W-3400 (mínimo 64 cores para orquestación)

---

## 2. Fuentes de Datos Masivas (Nacionales e Internacionales)

### Fuentes Nacionales (México)
| Fuente | Tipo de Datos | Frecuencia |
|---|---|---|
| **INEGI** | Censos, ENIGH, ENOE, PIB estatal, IPC | Trimestral/Anual |
| **DENUE** | Directorio de comercios y empresas georeferenciados | Mensual |
| **DERFE/INE** | Padrón electoral, secciones, historial desde 1995 | Electoral |
| **Banxico** | Tasas de interés, inflación, tipo de cambio, M1/M2 | Diario |
| **CONEVAL** | Líneas de pobreza, carencias sociales, Gini | Bianual |
| **CONAPO** | Proyecciones demográficas, migración, natalidad | Anual |
| **SEMARNAT/CONAGUA** | Niveles de presas, precipitación, calidad del aire | Diario |
| **SNSP** | Incidencia delictiva, denuncias, percepción de inseguridad | Mensual |

### Fuentes Internacionales
| Fuente | Tipo de Datos | Uso en CívicaOS |
|---|---|---|
| **BID (Banco Interamericano)** | Índices de desarrollo LAC, financiamiento | Benchmark regional |
| **Banco Mundial** | PIB per cápita, IDH, Doing Business, Gini global | Comparativas internacionales |
| **FMI** | Perspectivas económicas mundiales, deuda soberana | Shocks macro globales |
| **Bloomberg / Yahoo Finance** | Mercados bursátiles, commodities, divisas | Impacto económico en tiempo real |
| **Investing.com** | Indicadores técnicos, calendario económico | Eventos planificados |
| **McKinsey Global Institute** | Reportes de tendencias, automatización, productividad | Escenarios a largo plazo |
| **Gartner** | Hype Cycles tecnológicos, adopción digital | Impacto de nuevas tecnologías |
| **El Economista / TechCrunch** | Noticias de impacto económico y tecnológico | OSINT en tiempo real |
| **Oficina de Patentes (USPTO/IMPI)** | Nuevas tecnologías, adquisiciones de empresas | Disrupciones tecnológicas |
| **SIPRI / ACLED** | Conflictos armados, gasto militar global | Geopolítica y shocks |
| **Reuters / AP** | Guerras, pandemias, cierre de Canal de Suez, huelgas | Eventos de cisne negro |
| **JP Morgan Research** | Tendencias de mercados, reportes de deuda, commodities | Shocks micro y macroeconómicos, pronósticos |
| **LinkedIn Economic Graph** | Movilidad laboral, desempleo por sector, habilidades demandadas | Simulación de migración de talento y desempleo |
| **TechCrunch / Crunchbase** | Fondos de inversión, startups, valuación tecnológica | Mapeo de disrupciones y tracción sectorial |
| **Bloomberg Terminal API** | Datos históricos e intradiarios de macroeconomía global | Alimentación continua del motor Ra |
| **World Economic Forum** | Informes de competitividad global y riesgos globales | Escenarios mundiales de mediano plazo |

---

## Verification Plan

### Automated Tests
* Ejecutar la compilación de producción con Vite (`npm run build`) para verificar que no haya colisiones de tipos ni fallos en Recharts.

### Manual Verification
1. Abrir el navegador en `http://localhost:3335/client` e ingresar al panel **Gemelo GDS-MEGA**.
2. Presionar **"Iniciar Evolución Animada"** y verificar que la línea de tiempo avance mes a mes hasta el mes 12.
3. Aumentar la temperatura a 48°C (Ola de Calor) sin intervenciones y observar cómo las líneas de riesgo (Vandalismo, Apagón) se disparan hacia el colapso.
4. Habilitar **"Paneles Solares Masivos"** e iniciar la evolución de nuevo; comprobar que la curva de riesgo de apagón se aplana y la felicidad social se estabiliza.
