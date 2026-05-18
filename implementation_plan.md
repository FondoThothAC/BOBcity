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

---

## Verification Plan

### Automated Tests
* Ejecutar la compilación de producción con Vite (`npm run build`) para verificar que no haya colisiones de tipos ni fallos en Recharts.

### Manual Verification
1. Abrir el navegador en `http://localhost:3335/client` e ingresar al panel **Gemelo GDS-MEGA**.
2. Presionar **"Iniciar Evolución Animada"** y verificar que la línea de tiempo avance mes a mes hasta el mes 12.
3. Aumentar la temperatura a 48°C (Ola de Calor) sin intervenciones y observar cómo las líneas de riesgo (Vandalismo, Apagón) se disparan hacia el colapso.
4. Habilitar **"Paneles Solares Masivos"** e iniciar la evolución de nuevo; comprobar que la curva de riesgo de apagón se aplana y la felicidad social se estabiliza.
