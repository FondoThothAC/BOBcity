# ATDD - Pruebas de Aceptación Dirigidas por Ejemplos
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 1.0.0
**Fecha:** 2026-05-18
**Autor:** MiniMax Agent
**Estado:** Especificación Oficial

---

## 1. Introducción a las Pruebas de Aceptación en CívicaOS

### 1.1 Propósito del Documento

Las Pruebas de Aceptación Dirigidas por Ejemplos (Acceptance Test-Driven Development) en CívicaOS representan el puente final entre los requisitos de negocio y la verificación técnica del sistema. Este documento establece los criterios de aceptación basados en ejemplos concretos y medibles que demuestran que el sistema cumple con las expectativas del usuario. A diferencia de las pruebas unitarias que verifican componentes individuales, las pruebas de aceptación validan flujos de usuario completos desde la perspectiva del cliente, incluyendo la integración con sistemas externos como INE, INEGI y Open Business Plan.

### 1.2 Estructura de los Criterios de Aceptación

Cada criterio de aceptación en cívicaOS sigue una estructura de tres componentes: el escenario de ejemplo que describe una situación real del usuario, las condiciones de satisfacción que definen cuándo el criterio se considera cumpliendo, y las métricas de verificación que permiten validar objetivamente el cumplimiento. Esta estructura asegura que todos los stakeholders tengan una comprensión común de lo que significa "completado" para cada feature del sistema.

---

## 2. Características Críticas y Criterios de Aceptación

### 2.1 Aceptación: Consola de Orquestación Funcional

**Historia de Usuario:**
Como estratega político, quiero que el sistema orqueste automáticamente el análisis de datos cívicos para generar recomendaciones sin intervención manual, de manera que pueda tomar decisiones informadas en tiempo real.

**Criterios de Aceptación:**

| ID | Escenario | Dado | Cuando | Entonces | Verificable por |
|----|-----------|------|--------|----------|-----------------|
| AC-ORCH-001 | Análisis completo exitoso | Tengo acceso a la consola con permisos de análisis, los servicios externos están operativos y el modelo de IA está disponible | Ingreso la consulta "Analizar crisis de agua en Hermosillo D8" y presiono "Ejecutar Análisis" | El sistema muestra progreso de 0% a 100% en el indicador visual, la consola de logs muestra actividad de todos los agentes (DataCollector, Analyzer, Simulator, Recommender, Integrator), y después de máximo 60 segundos se muestra el panel de resultados con resumen ejecutivo y 3 recomendaciones priorizadas | Usuario final puede verificar visualmente |
| AC-ORCH-002 | Visualización de flujo de agentes | El análisis está en ejecución | Los agentes procesan sus tareas | Cada agente muestra un indicador visual de estado: color gris (idle), azul pulsante (procesando), verde (completado), rojo (error), con animación de pulso durante procesamiento y tooltip mostrando tiempo de ejecución | Usuario final puede verificar visualmente |
| AC-ORCH-003 | Logs de auditoría generados | El análisis completa exitosamente | El usuario hace scroll en la consola de logs | Los logs muestran timestamps con formato ISO 8601, nombres de agentes, acciones realizadas, datos accedidos (con conteo de registros), hashes SHA-256 de verificación, y marcas de cumplimiento normativo (GDPR/LGPD) | Administrador puede verificar en log viewer |
| AC-ORCH-004 | Terminal con scroll automático | El análisis está en ejecución | Se generan nuevas líneas de log | La consola hace scroll automático al último log visible, el usuario puede hacer scroll manual hacia arriba, y al hacer scroll manual aparece botón "Ir al final" que regresa al log más reciente | Usuario final puede verificar interactuando |
| AC-ORCH-005 | Exportación a OBP exitosa | El análisis ha completado y tengo resultados visibles | Hago clic en "Exportar a Open Business Plan" | El modal muestra estado de transferencia con indicador de progreso, cuando completa muestra mensaje de éxito con ID de proyecto OBP, y el botón de "Ver en OBP" abre el proyecto en nueva pestaña | Usuario final puede verificar creando proyecto real |

**Métricas de Aceptación:**
- Tiempo de respuesta del análisis completo: < 60 segundos para consultas estándar, < 180 segundos para consultas complejas
- Disponibilidad de logs: 100% de las acciones quedan registradas
- Tasa de exportación exitosa a OBP: > 95% en condiciones normales, > 80% en condiciones de falla parcial
- Satisfacción del usuario con la interfaz: NPS > 50 (medido en testing de usuario)

### 2.2 Aceptación: Motor de Simulación ABM Operativo

**Historia de Usuario:**
Como analista de políticas públicas, quiero simular el impacto de intervenciones gubernamentales antes de implementarlas, para validar que las políticas propuestas generarán los resultados esperados sin efectos secundarios no anticipados.

**Criterios de Aceptación:**

| ID | Escenario | Dado | Cuando | Entonces | Verificable por |
|----|-----------|------|--------|----------|-----------------|
| AC-ABM-001 | Simulación de política única | Tengo el módulo de simulador abierto con gemelo digital de 10,000 agentes cargado | Selecciono la política "Subsidio a transporte público" con presupuesto de $50M MXN y presiono "Ejecutar Simulación" | La visualización muestra una línea de tendencia para cada métrica (felicidad, PIB, empleo) durante 10 años, los valores de impacto se muestran en el panel lateral (ejemplo: +12% felicidad, +1.5% PIB, -0.8% empleo), y el intervalo de confianza se muestra como área sombreada alrededor de la línea | Analista puede verificar números contra modelo matemático |
| AC-ABM-002 | Comparación de políticas | Tengo el módulo de simulador abierto con políticas base cargadas | Selecciono 3 políticas y presiono "Comparar" | La visualización muestra 3 líneas paralelas (una por política) con diferentes colores, la leyenda identifica cada política, y la tabla resumen muestra ranking de efectividad con métricas comparativas | Analista puede comparar visualmente |
| AC-ABM-003 | Detección de efectos secundarios | Estoy ejecutando una simulación | Se detecta impacto negativo no anticipado en algún sector | El sistema muestra alerta amarilla con icono de warning, el texto describe el efecto secundario (ejemplo: "Impacto negativo en sector privado: +1.2% desempleo"), y las recomendaciones incluyen propuestas de mitigación | Analista puede verificar que alerta aparece |
| AC-ABM-004 | Trayectoria temporal detallada | La simulación ha completado | Hago clic en "Ver detalle" del año 5 | La visualización muestra el estado del gemelo digital en el año 5: distribución de felicidad por percentiles, breakdown del PIB por sector, mapa de intención de voto por zona geográfica, y métricas demográficas comparadas con año 0 | Analista puede verificar datos granulares |
| AC-ABM-005 | Reproducibilidad de resultados | Ejecuto la misma simulación dos veces con idénticos parámetros | La segunda ejecución completa | Los resultados numéricos difieren en menos del 0.1%, las visualizaciones son prácticamente idénticas, y el log indica que se usó la misma semilla aleatoria | Sistema automatizado puede verificar |
| AC-ABM-006 | Límite de presupuesto respetado | Tengo una política con presupuesto mayor al límite | Ejecuto la simulación | El sistema muestra mensaje "Presupuesto excede límite de $80M. Escalando implementación." y genera roadmap con fases que respetan el presupuesto máximo | Analista puede verificar fases |

**Métricas de Aceptación:**
- Tiempo de simulación de 10,000 agentes por 10 años: < 30 segundos
- Precisión de predicción vs. histórico: > 85% para políticas similares
- Detección de efectos secundarios: 100% de efectos con impacto > 0.5% se reportan
- Reproducibilidad: coeficiente de variación < 0.1% en múltiples ejecuciones

### 2.3 Aceptación: Predictor Electoral Funcional

**Historia de Usuario:**
Como científico de datos políticos, quiero predecir resultados electorales con intervalos de confianza claros, para asesorar a candidatos y partidos sobre estrategias de campaña efectivas.

**Criterios de Aceptación:**

| ID | Escenario | Dado | Cuando | Entonces | Verificable por |
|----|-----------|------|--------|----------|-----------------|
| AC-PRED-001 | Predicción de elección municipal | Tengo acceso al módulo predictor con datos históricos cargados (2018-2024) | Selecciono "Predecir: Hermosillo 2027" y ejecuto predicción | La visualización muestra histograma de intención de voto con porcentajes por candidato, el intervalo de confianza muestra ±4% alrededor de cada predicción, y el panel muestra confianza del modelo (ejemplo: 83%) con factores principales | Data scientist puede verificar metodología |
| AC-PRED-002 | Comparación de candidatos | La predicción ha completado | Hago clic en "Comparar candidatos" | La visualización muestra gráfico radar con 6 dimensiones (economía, seguridad, educación, salud, infraestructura, experiencia) para cada candidato, y los colores diferencian claramente cada perfil | Usuario puede comparar perfiles visualmente |
| AC-PRED-003 | Análisis de swing districts | Tengo acceso a datos de múltiples distritos | Selecciono "Análisis de swing districts" para Sonora | La visualización muestra mapa con distritos coloreados: verde (seguro gobiernista), rojo (seguro oposición), amarillo (swing), y la tabla lista los 4 swing districts con diferencia de intención de voto | Analista político puede usar para strategy |
| AC-PRED-004 | Simulación de escenarios | La predicción base ha completado | Selecciono "Simular: Impacto de escándalo" y configuro escenario | La visualización muestra curva de intención de voto antes/después del evento, los días clave muestran valores puntuales, y la recuperación gradual se proyecta hasta día 180 | Analista puede verificar impacto |

**Métricas de Aceptación:**
- Accuracy de predicción vs. resultados reales (backtesting): > 85% para elecciones municipales con datos completos
- Tiempo de cálculo de predicción: < 30 segundos para análisis de distrito único
- Cobertura de factores considerados: mínimo 15 variables predictivas
- Actualización de modelo con nuevos datos: proceso completo < 5 minutos

### 2.4 Aceptación: Mapa de Calor de Puntos de Dolor

**Historia de Usuario:**
Como desarrollador de políticas, quiero visualizar geográficamente los problemas de los ciudadanos con diferentes capas de información, para priorizar intervenciones basadas en intensidad y afectación poblacional.

**Criterios de Aceptación:**

| ID | Escenario | Dado | Cuando | Entonces | Verificable por |
|----|-----------|------|--------|----------|-----------------|
| AC-MAP-001 | Visualización de heat map | Tengo acceso al módulo de mapas con datos cargados | Selecciono categoría "Seguridad" y umbral de intensidad > 40 | El mapa muestra los 18 distritos coloreados según escala de calor (rojo = alta intensidad, verde = baja), los popup al hacer hover muestran detalles (nombre distrito, intensidad, afectados, tendencia), y la leyenda muestra la escala de colores con valores numéricos | Desarrollador puede priorizar intervenciones |
| AC-MAP-002 | Filtro por intensidad | El heat map está visible | Muevo el slider de intensidad mínima de 40 a 70 | Los distritos con intensidad < 70 desaparecen del mapa, solo D8 y D3 permanecen visibles, y el contador muestra "2 de 18 distritos visibles" | Usuario puede filtrar efectivamente |
| AC-MAP-003 | Drill-down a zona | El heat map distrital está visible | Hago clic en D8 para zoom | El mapa hace zoom a nivel de zonas (8 zonas en D8), los límites de zonas se muestran con bordes, y los colores reflejan intensidad a nivel de zona | Usuario puede explorar granularmente |
| AC-MAP-004 | Puntos de dolor individuales | Estoy zoomed a nivel de zona | Hago clic en el marcador de punto de dolor | El popup muestra información detallada: nombre, categoría, intensidad (0-100), población afectada (número), veces reportado (último mes), y botón "Analizar" que iniciaOrchestrator | Usuario puede investigar problemas específicos |
| AC-MAP-005 | Comparación de categorías | Estoy en vista de mapa | Selecciono "Ver: Comparar categorías" y elijo [Seguridad, Agua, Economía] | El mapa muestra 3 paneles apilados o lado a lado, cada panel tiene su propia escala de colores, y la leyenda indica qué panel corresponde a cada categoría | Usuario puede identificar problemas cross-category |

**Métricas de Aceptación:**
- Tiempo de renderizado del mapa: < 2 segundos para 18 distritos con datos completos
- Precisión de datos: sincronización con fuente cada 24 horas
- Interactividad: todas las interacciones respond en < 100ms
- Cobertura geográfica: 100% de los distritos de Sonora mapeados

### 2.5 Aceptación: Integración con Open Business Plan

**Historia de Usuario:**
Como director de proyecto, quiero que las recomendaciones de cívicaOS se conviertan automáticamente en planes de negocio ejecutables en Open Business Plan, para acortar el tiempo entre análisis y ejecución.

**Criterios de Aceptación:**

| ID | Escenario | Dado | Cuando | Entonces | Verificable por |
|----|-----------|------|--------|----------|-----------------|
| AC-OBP-001 | Exportación exitosa | Tengo resultados de análisis con 3+ recomendaciones generadas | Hago clic en "Exportar a Open Business Plan" | El modal muestra flujo de estados: "Preparando payload...", "Conectando con OBP...", "Transferencia en progreso...", "Completado", cuando termina muestra ID de proyecto (ejemplo: "OBP-2026-001") y botón "Ver en OBP" | Usuario puede verificar en OBP real |
| AC-OBP-002 | Payload correctamente transformado | La exportación está en proceso | El sistema transforma datos | Los campos de cívicaOS se mapean correctamente a OBP: pain_points → problem_statement, recommendations → solutions, budget_estimate → initial_budget, timeline_months → duration_months | Data engineer puede verificar mapping |
| AC-OBP-003 | Manejo de conexión fallida | La API de OBP no responde | Hago clic en "Exportar a Open Business Plan" | El modal muestra error: "Conexión fallida. OBP no disponible", botón "Reintentar" está disponible, y el sistema hace hasta 3 reintentos automáticos con backoff | Usuario puede continuar con reintento |
| AC-OBP-004 | Exportación con datos parciales | El análisis se ejecutó con datos incompletos | Hago clic en "Exportar a Open Business Plan" | El modal muestra warning: "Datos incompletos. Confianza: 72%. ¿Continuar?", el checkbox "Acepto" permite proceder, y el proyecto OBP incluye disclaimer | Usuario puede decidir |

**Métricas de Aceptación:**
- Tasa de exportación exitosa en condiciones normales: > 95%
- Tiempo de exportación: < 30 segundos
- Manejo de fallos: 100% de los errores tienen mensaje claro y opción de reintento
- Trazabilidad: 100% de los proyectos OBP tienen referencia en cívicaOS

---

## 3. Escenarios de Aceptación de Usuario Final

### 3.1 Escenario: Usuario Administrador - Configuración del Sistema

**Persona:** Roberto Celis - Administrador de cívicaOS

**Contexto:** Roberto está configurando el sistema por primera vez después de la instalación. Debe conectar los servicios externos (INE, INEGI) y verificar que el modelo de IA responde correctamente.

**Pasos de Aceptación:**

1. Dado que Roberto está en la pantalla de configuración
2. Cuando ingresa las credenciales de API del INE
3. Entonces el sistema muestra "Conexión exitosa" con timestamp
4. Y los endpoints disponibles se listan (resultados electorales, distritos)

5. Cuando ingresa las credenciales de API del INEGI
6. Entonces el sistema muestra "Conexión exitosa"
7. Y los indicadores disponibles se listan (censo, demografía, economía)

8. Cuando hace clic en "Probar modelo de IA"
9. Entonces el sistema muestra respuesta de Ollama en < 5 segundos
10. Y el modelo identificado se muestra (ejemplo: "Qwen 2.5 72B")

11. Cuando hace clic en "Guardar configuración"
12. Entonces el sistema muestra "Configuración guardada"
13. Y el badge de estado cambia a "Sistema listo"

**Criterio de Éxito:** Roberto puede completar la configuración en < 15 minutos sin ayuda del equipo técnico. Los servicios externos responden correctamente. El modelo de IA genera respuestas coherentes.

### 3.2 Escenario: Usuario Analista - Análisis de Crisis de Agua

**Persona:** María López - Analista de políticas públicas

**Contexto:** María necesita analizar la crisis de agua en el distrito D8 de Hermosillo para preparar un informe para el alcalde.

**Pasos de Aceptación:**

1. Dado que María está autenticada en cívicaOS con rol Analista
2. Cuando navega a la sección "Orquestador OpenClaw"
3. Entonces ve las iniciativas preconfiguradas: "Crisis de Agua D8", "Movilidad Estudiantil D6", "Corredor Pyme Centro D9"

4. Cuando selecciona "Crisis de Agua D8" y hace clic en "Ejecutar Análisis"
5. Entonces el diagrama de flujo muestra los 6 agentes procesando secuencialmente
6. Y la consola de logs muestra el progreso en tiempo real
7. Y después de ~45 segundos todos los agentes muestran estado "Completado"

8. Cuando el análisis completa
9. Entonces ve el panel de resultados con: Resumen Ejecutivo (3 párrafos), Puntos de Dolor Identificados (8 con intensidades), Simulación de Políticas (3 escenarios), Recomendaciones (4 priorizadas)

10. Cuando hace clic en el botón "Ver Plan de Ataque"
11. Entonces ve el plan estructurado: Resumen de Recomendaciones, Estimación de Presupuesto ($45M MXN), Roadmap de 3 fases (18 meses)

12. Cuando hace clic en "Exportar a Open Business Plan"
13. Entonces ve el modal de exportación con progreso
14. Y al completar puede hacer clic en "Ver en OBP" que abre el proyecto

**Criterio de Éxito:** María obtiene un informe completo y estructurado en < 2 minutos de trabajo manual. El informe contiene toda la información necesaria para presentar al alcalde. La exportación a OBP funciona correctamente.

### 3.3 Escenario: Usuario científico de Datos - Predicción Electoral

**Persona:** Dr. Juan Hernández - Científico de datos políticos

**Contexto:** Juan necesita predecir los resultados de las próximas elecciones municipales para asesorar a un partido político.

**Pasos de Aceptación:**

1. Dado que Juan está en el módulo de "Predictor Electoral"
2. Cuando selecciona "Hermosillo 2027" del dropdown de elecciones
3. Entonces ve la lista de candidatos detectados con sus perfiles

4. Cuando hace clic en "Ejecutar Predicción"
5. Entonces ve el gráfico de radar comparativo de candidatos
6. Y el histograma de intención de voto actualizado
7. Y los intervalos de confianza de predicción visibles

8. Cuando hace clic en "Análisis de Swing Districts"
9. Entonces ve el mapa de Sonora con colores para cada tipo de distrito
10. Y la lista de 4 swing districts con detalles de diferencia de intención

11. Cuando selecciona "D3" de los swing districts
12. Entonces ve el análisis detallado: "D3: 48.2% vs 47.8% (diferencia: 0.4%)"
13. Y la recomendación de inversión sugerida

**Criterio de Éxito:** Juan puede generar predicciones con intervalos de confianza claros en < 30 segundos. El modelo usa al menos 15 variables predictivas. La predicción se alinea con el histórico electoral conocido.

---

## 4. Checklist de Aceptación para Release

### 4.1 Checklist Funcional

| Item | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| F-001 | Consola deOrchestrator carga sin errores | ☐ | |
| F-002 | Visualización de flujo de agentes es correcta | ☐ | |
| F-003 | Terminal muestra logs en tiempo real | ☐ | |
| F-004 | Audit logs se generan con hashes correctos | ☐ | |
| F-005 | ABM simulator genera resultados reproducibles | ☐ | |
| F-006 | Comparación de políticas funciona | ☐ | |
| F-007 | Detección de efectos secundarios muestra alertas | ☐ | |
| F-008 | Predictor electoral genera predicciones | ☐ | |
| F-009 | Radar de candidatos muestra 6 dimensiones | ☐ | |
| F-010 | Mapa de calor carga con datos correctos | ☐ | |
| F-011 | Drill-down a zona funciona | ☐ | |
| F-012 | Exportación a OBP completa exitosamente | ☐ | |
| F-013 | Manejo de errores muestra mensajes claros | ☐ | |

### 4.2 Checklist de Rendimiento

| Item | Descripción | Target | Estado |
|------|-------------|--------|--------|
| P-001 | Tiempo de carga de consola | < 3s | ☐ |
| P-002 | Tiempo de análisis completo | < 60s | ☐ |
| P-003 | Tiempo de simulación ABM | < 30s | ☐ |
| P-004 | Tiempo de predicción electoral | < 30s | ☐ |
| P-005 | Tiempo de renderizado de mapa | < 2s | ☐ |
| P-006 | Uso de memoria en idle | < 2GB | ☐ |

### 4.3 Checklist de Seguridad

| Item | Descripción | Estado | Notas |
|------|-------------|--------|-------|
| S-001 | Logs de auditoría se generan con hashes SHA-256 | ☐ | |
| S-002 | Datos sensibles no se exponen en logs | ☐ | |
| S-003 | Comunicación con OBP usa mTLS | ☐ | |
| S-004 | Tokens de API no se exponen en frontend | ☐ | |

---

## 5. Criterios de Aceptación — CositasApp Marketplace Multi-Nivel

### 5.1 Aceptación: POS Táctil con Mesas de Restaurante

**Historia de Usuario:**
Como dueño de un restaurante o puesto de comida, quiero un punto de venta táctil que me permita gestionar múltiples mesas simultáneamente y cobrar con diferentes métodos de pago para agilizar mi operación.

**Criterios de Aceptación:**

| ID | Escenario | Dado | Cuando | Entonces | Verificable por |
|----|-----------|------|--------|----------|-----------------|
| AC-POS-001 | Apertura de mesa | Tengo el POS abierto con mesas habilitadas | Selecciono Mesa 2 | Se abre una cuenta nueva para Mesa 2 con ícono visual de "ocupada" | Usuario verifica visualmente |
| AC-POS-002 | Multi-mesa simultánea | Tengo Mesa 1 y Mesa 2 abiertas | Cambio entre mesas | Cada mesa conserva sus ítems y subtotal sin pérdida | Cajero verifica datos |
| AC-POS-003 | Cobro con PayPal | Mesa con $155 de consumo | Selecciono PayPal como método de pago | Se muestra simulador de autorización, al confirmar la mesa se libera | Cajero completa flujo |
| AC-POS-004 | Ticket por WhatsApp | Venta completada | Presiono "Compartir por WhatsApp" | Se abre WhatsApp con el detalle de ítems, precios y total | Cajero verifica mensaje |

### 5.2 Aceptación: Contabilidad NIF México

| ID | Escenario | Dado | Cuando | Entonces | Verificable por |
|----|-----------|------|--------|----------|-----------------|
| AC-NIF-001 | Estado de Resultados B-3 | Tengo 50+ transacciones del mes | Abro pestaña "Estado de Resultados" | Se muestran: Ingresos Netos, Costo de Ventas, Utilidad Bruta, Gastos, Utilidad Neta | Contador verifica |
| AC-NIF-002 | Flujos de Efectivo B-2 | Transacciones clasificadas | Abro pestaña "Flujos de Efectivo" | Clasificación correcta en Operación, Inversión y Financiamiento | Contador verifica |
| AC-NIF-003 | Valuación NIF C-4 | Inventario con compras a diferentes costos | Abro sección Almacén | Costo unitario promedio ponderado calculado y mostrado | Contador verifica fórmula |

### 5.3 Aceptación: Sistema de 10 Niveles

| ID | Escenario | Dado | Cuando | Entonces | Verificable por |
|----|-----------|------|--------|----------|-----------------|
| AC-LVL-001 | Invitado sin acceso | roleLevel = 1 | Intento acceder al POS | ModuleGuard muestra "Función bloqueada. Nivel mínimo: 2.5" | Usuario ve mensaje |
| AC-LVL-002 | Vendedor Independiente | roleLevel = 4 | Accedo a Inventario, POS y B2B | Los 3 módulos cargan correctamente | Vendedor opera sin error |
| AC-LVL-003 | Admin con todos los accesos | roleLevel = 7 | Accedo a cualquier sección | Todos los módulos están habilitados | Admin verifica cada sección |

### 5.4 Checklist de Aceptación CositasApp

| Item | Descripción | Estado |
|------|-------------|--------|
| CS-001 | Feed social carga publicaciones | ☐ |
| CS-002 | Login con Google y Email/Password funciona | ☐ |
| CS-003 | Carrito multi-tienda opera correctamente | ☐ |
| CS-004 | POS táctil gestiona mesas y cobra | ☐ |
| CS-005 | Contabilidad NIF muestra B-3 y B-2 | ☐ |
| CS-006 | Inventario calcula NIF C-4 | ☐ |
| CS-007 | Odoo ERP sincroniza catálogo | ☐ |
| CS-008 | Bob Bot responde preguntas | ☐ |
| CS-009 | Mapa Leaflet muestra tiendas | ☐ |
| CS-010 | Dashboard repartidor funciona | ☐ |
| CS-011 | Sistema de niveles bloquea/desbloquea | ☐ |
| CS-012 | Chat en tiempo real opera | ☐ |

---

*Documento ATDD actualizado: 2026-05-23*  
*Próxima revisión programada: 2026-06-23*