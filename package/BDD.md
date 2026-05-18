# BDD - Especificación de Desarrollo Dirigido por Comportamiento
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 1.0.0
**Fecha:** 2026-05-18
**Autor:** MiniMax Agent
**Estado:** Especificación正式

---

## 1. Introducción al BDD en CívicaOS

### 1.1 Propósito del Documento

El Desarrollo Dirigido por Comportamiento (Behavior-Driven Development) en CívicaOS se centra en definir el comportamiento del sistema desde la perspectiva del usuario y los stakeholders del negocio. Este enfoque utiliza el lenguaje Gherkin para describir escenarios de negocio en términos de características, condiciones y resultados esperados. El objetivo es crear un puente efectivo entre los requisitos técnicos y la comprensión del negocio, permitiendo que todos los involucrados en el proyecto —desde desarrolladores hasta gerentes de producto y clientes— puedan colaborar efectivamente en la definición del sistema.

### 1.2 Framework y Herramientas

Para la implementación del BDD en CívicaOS, se utilizará Cucumber.js como framework principal de escritura y ejecución de características (features) en Gherkin. Este framework permite traducir los requisitos de negocio en pruebas automatizadas ejecutables, facilitando la validación continua del comportamiento del sistema. Las pruebas escritas en Gherkin servirán simultáneamente como documentación viva del sistema y como especificaciones ejecutables que garantizan que la implementación cumple con los requisitos definidos.

---

## 2. Estructura de Características (Features)

### 2.1 Feature: Orquestación de Análisis Cívico

**Narrativa:**
Como estratega político, necesito que el sistema orqueste automáticamente el análisis de datos cívicos para generar recomendaciones actionable sin necesidad de comprender los detalles técnicos subyacentes. El sistema debe coordinar múltiples agentes de IA para recolectar datos, analizar patrones, simular políticas y generar recomendaciones, todo de manera transparente y auditable localmente.

**Background:**
Dado que estoy autenticado en el sistema cívicaOS
Y tengo permisos de análisis para el distrito seleccionado
Y los servicios de datos externos (INE, INEGI) están disponibles
Y el modelo de IA local (Ollama) está ejecutándose correctamente

**Scenario: Análisis exitoso de crisis de agua**
Comenzaré con el escenario de análisis exitoso donde el usuario solicita un análisis de crisis de agua. Dado que estoy en la consola del orquestador de cívicaOS, cuando ingreso la consulta "Analizar crisis de agua en Hermosillo D8", entonces el sistema muestra un mensaje de "Iniciando análisis..." con progreso inicial, y el indicador del agente DataCollector muestra estado "Procesando". Cuando los datos del INE se recolectan exitosamente, entonces el log muestra "Datos INE recibidos: 15,000 registros" y el indicador del agente Analyzer muestra estado "Procesando". Cuando el análisis de patrones geográficos se completa, entonces el log muestra "Puntos de dolor identificados: 23" y el indicador del agente Simulator muestra estado "Procesando". Cuando la simulación de políticas se ejecuta, entonces el log muestra "Simulación completada: 3 escenarios evaluados" y el indicador del agente Recommender muestra estado "Procesando". Cuando las recomendaciones se generan, entonces el log muestra "Recomendaciones generadas: Plan de Acción listo" y el indicador del agente Integrator muestra estado "Procesando". Cuando la integración con Open Business Plan se completa, entonces el log muestra "Exportación exitosa: Proyecto OBP-2026-001 creado" y todos los indicadores de agentes muestran estado "Completado". Entonces el panel de resultados muestra el resumen ejecutivo con 3 recomendaciones priorizadas y el botón "Ver Plan de Ataque" está habilitado.

**Scenario: Análisis con datos parciales**
Este escenario aborda la situación donde algunos datos externos no están disponibles. Dado que los servicios del INE están disponibles pero el servicio de INEGI tiene timeout, cuando ingreso la consulta "Analizar problema de transporte en D6", entonces el sistema muestra warning "Datos INEGI no disponibles, usando fuentes alternativas" en la consola, y el análisis continúa con los datos disponibles del INE. Cuando el proceso completa, entonces el sistema muestra "Análisis completado con datos parciales" con confianza reducida a 72%, y las recomendaciones incluyen disclaimer "Basado en datos parciales (INE únicamente)".

**Scenario: Fallo de modelo de IA**
Este escenario verifica el comportamiento cuando el modelo de IA local falla. Dado que el modelo Qwen 2.5 72B no está disponible, cuando ingreso cualquier consulta de análisis, entonces el sistema muestra error "Modelo de IA no disponible. Iniciando fallback a DeepSeek-R1" en la consola, y el indicador del modelo muestra "DeepSeek-R1 (Fallback)". Cuando el análisis completa usando el modelo fallback, entonces el sistema muestra "Análisis completado usando modelo alternativo" y el reporte incluye nota "Procesado con DeepSeek-R1 (QA: reducida)".

**Scenario: Timeout de consulta**
Este escenario verifica el manejo de consultas que exceden el tiempo límite. Dado que la consulta es muy compleja (múltiples distritos, 5 años de datos), cuando ingreso la consulta "Análisis comparativo de seguridad: D3, D4, D5, D7 (2019-2024)", entonces el sistema muestra "Consulta compleja detectada. Tiempo estimado: 8 minutos" con opción de continuar o simplificar, y cuando selecciono "Continuar", el progreso muestra "Tiempo transcurrido: 5/8 minutos" con opción de cancelar. Cuando se alcanza el timeout de 8 minutos, el sistema muestra "Consulta cancelada por timeout. Sugerencia: reducir scope a 2 distritos".

### 2.2 Feature: Simulación de Políticas con Gemelo Digital

**Narrativa:**
Como analista de políticas públicas, necesito simular el impacto de diferentes intervenciones gubernamentales antes de implementarlas. El sistema debe crear un gemelo digital de la población afectada, aplicar políticas de prueba, y proyectar resultados a corto, mediano y largo plazo, incluyendo efectos secundarios no intencionales.

**Background:**
Dado que tengo acceso al módulo de simulador ABM de cívicaOS
Y existe un gemelo digital de la población de Hermosillo con 10,000 agentes
Y las políticas base de referencia están cargadas en el sistema

**Scenario: Simulación de política de infraestructura hídrica**
Comenzaré con el escenario de simulación de infraestructura hídrica. Dado que estoy en el módulo de simulador, cuando selecciono la política "Construcción de planta desaladora" con presupuesto de $150 millones MXN, entonces el sistema muestra la vista previa de efectos: +15% felicidad, +2.3% PIB, -0.5% desempleo, +8% intención de voto para candidato con perfil "development_focus". Cuando ejecuto la simulación, la visualización muestra la trayectoria de felicidad durante 10 años con curva ascendente estabilizándose en año 7, la visualización muestra la proyección de PIB con incremento gradual de 2.3% acumulado, y la visualización muestra la intención de voto con desviación hacia candidato development del 8%. Cuando la simulación completa, entonces el panel de resultados muestra "Confianza: 87%" con disclaimer "Basado en modelo ABM con 10,000 agentes sintéticos".

**Scenario: Comparación de políticas alternativas**
Este escenario permite comparar múltiples políticas simultáneamente. Dado que estoy en el módulo de simulador con 3 políticas cargadas, cuando selecciono "Comparar: [Política A, Política B, Política C]", entonces el sistema genera 3 escenarios paralelos con el mismo gemelo digital, y la visualización muestra gráfico comparativo con líneas paralelas de felicidad, GDP, empleo. Cuando la comparación completa, entonces la tabla de resumen muestra ranking: "1. Política B (mejor relación costo/impacto)", "2. Política A (mayor impacto social)", "3. Política C (menor riesgo)".

**Scenario: Detección de efectos secundarios**
Este escenario verifica que el sistema detecte impactos negativos no deseados. Dado que ejecuto la política "Subsidio a transporte público" con presupuesto de $50 millones MXN, cuando la simulación muestra que el desempleo en sector privado aumenta +1.2% como efecto secundario, entonces el sistema muestra alerta amarilla "Efecto secundario detectado: impacto negativo en sector privado", y las recomendaciones incluyen "Mitigación sugerida: programa de reconversión laboral paralelo".

**Scenario: Simulación con restricciones de presupuesto**
Este escenario verifica el ajuste automático cuando el presupuesto es insuficiente. Dado que ejecuto la política "Sistema de vigilancia completa" con presupuesto de $200 millones MXN pero el límite es $80 millones MXN, cuando la simulación inicia, el sistema muestra "Presupuesto insuficiente. Escalando implementación a 5 años con fases", y la visualización muestra fases de implementación con hitos anuales. Cuando la simulación completa, el sistema muestra "Implementación escalada: años 1-2 (fase 1: $30M), años 3-4 (fase 2: $30M), año 5 (fase 3: $20M)".

### 2.3 Feature: Predicción Electoral por Distrito

**Narrativa:**
Como científico de datos políticos, necesito predecir resultados electorales con alta precisión para diferentes escenarios. El sistema debe analizar perfiles históricos de candidatos ganadores, combinar datos demográficos y económicos, y generar predicciones con intervalos de confianza que reflejen la incertidumbre inherente a las proyecciones políticas.

**Background:**
Dado que tengo acceso al módulo de predictor electoral de cívicaOS
Y los datos históricos de elecciones 2018, 2021, 2024 están cargados
Y los perfiles de candidatos actuales están disponibles

**Scenario: Predicción de elecciones municipales**
Comenzaré con el escenario de predicción de elecciones municipales. Dado que estoy en el módulo predictor, cuando selecciono "Predecir: Elecciones Hermosillo 2027", entonces el sistema muestra análisis de candidatos: "3 candidatos detectados: Perfil A (economic_reformer), Perfil B (social_defender), Perfil C (establishment)", y la visualización del radar muestra perfil de cada candidato con dimensiones: economía, seguridad, educación, salud, infraestructura. Cuando ejecuto la predicción con datos actuales, entonces la visualización muestra histograma de intención de voto: "Candidato A: 42%, Candidato B: 31%, Candidato C: 27%", y la置信区间 muestra "Margen de error: ±4%". Cuando la predicción refine con histórico, entonces el panel muestra "Confianza del modelo: 83%" con explicación "Basado en 3 elecciones históricas y 15 variables predictivas".

**Scenario: Análisis de swing districts**
Este escenario identifica distritos con resultados indecisos. Dado que ejecuto "Análisis de swing districts: Sonora", cuando el sistema procesa los 18 distritos de Sonora, entonces la clasificación muestra "Distritos seguros: 12", "Swing districts: 4 (D3, D5, D9, D11)", "Distritos seguros para oposición: 2". Para los swing districts, el sistema muestra detalle: "D3: 48.2% incumbent vs 47.8% challenger (diferencia: 0.4%)", y la recomendación muestra "Swing district D3: inversión recomendada de $2M MXN para flip".

**Scenario: Impacto de escándalo en predicción**
Este escenario simula el impacto de eventos externos en las predicciones. Dado que estoy en el módulo predictor con predicción actual de "Candidato A: 45%", cuando simulo un escándalo de corrupción para Candidato A en "t+30 días", entonces la visualización muestra curva de intención de voto con decline abrupto a 32% en día 30, y la recuperación muestra trayectoria gradual pero incompleta a 38% en día 180. Cuando la simulación completa, el sistema muestra "Impacto estimado: -7% puntos (30 días), recuperación parcial (-3% permanent)".

### 2.4 Feature: Mapa de Calor de Puntos de Dolor

**Narrativa:**
Como desarrollador de políticas, necesito visualizar geográficamente los problemas de los ciudadanos para priorizar intervenciones. El sistema debe agregar datos de múltiples fuentes, calcular intensidades ponderadas por impacto poblacional, y mostrar un mapa interactivo con drill-down hasta nivel de zona específica.

**Background:**
Dado que tengo acceso al módulo de mapas de cívicaOS
Y los datos de INE, INEGI y encuestas están sincronizados
Y los límites geográficos de distritos están cargados

**Scenario: Visualización de heat map de seguridad**
Comenzaré con el escenario de visualización de seguridad. Dado que estoy en el módulo de mapas, cuando selecciono "Ver: Heat map de seguridad" con umbral de intensidad > 40, entonces el mapa muestra 18 distritos coloreados por intensidad: escala de rojo (D8: 95, D3: 87) a verde (D1: 22, D7: 31), y el popup de D8 muestra detalles: "Seguridad D8: intensidad 95, 12,500 afectados, tendencia: +8% mensual". Cuando aplico filtro temporal "Último mes", el mapa actualiza con datos más recientes y muestra "Tendencia D8: +12% vs mes anterior". Cuando guardo la vista, el sistema muestra "Vista guardada: Heat map seguridad D8 foco (2026-05-18)".

**Scenario: Comparación de categorías**
Este escenario permite comparar múltiples categorías de problemas. Dado que estoy en el módulo de mapas, cuando selecciono "Comparar categorías: [Seguridad, Agua, Economía]" en vista de grid, entonces el mapa muestra 3 paneles simultáneos con heat maps por categoría, y la leyenda muestra "Seguridad: afecta 45K personas, Agua: afecta 38K personas, Economía: afecta 52K personas". Cuando hago hover sobre D8, el tooltip muestra "D8: Seguridad(95), Agua(88), Economía(72)". Cuando identifico el problema más crítico por zona, el sistema muestra tabla: "Zona Norte D8: #1 Seguridad, #2 Agua; Zona Centro D2: #1 Economía, #2 Transporte".

**Scenario: Drill-down a zona específica**
Este escenario permite explorar hasta nivel de zona. Dado que estoy en el mapa con vista distrital, cuando hago clic en D8, el mapa hace zoom a nivel de zonas (8 zonas en D8) con heat map granular. Cuando selecciono "Zona Palo Verde" de la lista, el mapa muestra límites de la zona con puntos de dolor individuales como marcadores. Cuando hago clic en un marcador, el popup muestra: "Punto de Dolor: Fallas en red hídrica", "Intensidad: 98", "Afectados: 3,200 hogares", "Reported: 847 veces (último mes)", y el botón "Analizar" inicia flujo deOrchestrator para este punto específico.

### 2.5 Feature: Integración con Open Business Plan

**Narrativa:**
Como director de proyecto, necesito que las recomendaciones de cívicaOS se conviertan automáticamente en planes de negocio ejecutables. El sistema debe exportar los datos estructurados a Open Business Plan, generar un roadmap con fases, presupuestos y métricas, y mantener trazabilidad entre el análisis cívico y la solución empresarial.

**Background:**
Dado que tengo acceso a la consola del orquestador
Y la sesión de análisis ha completado exitosamente
Y la conexión con Open Business Plan está configurada

**Scenario: Exportación exitosa de iniciativa**
Comenzaré con el escenario de exportación exitosa. Dado que tengo resultados de análisis de "Crisis de agua D8" con 3 recomendaciones, cuando hago clic en el botón "Exportar a Open Business Plan", entonces el modal muestra estado "Preparando payload..." con spinner, y cuando el payload está listo, el modal muestra "Conectando con OBP (local mTLS)..." con ícono de candado. Cuando la conexión establece, el modal muestra "Transferencia en progreso..." con barra de progreso, y cuando la transferencia completa, el modal muestra "Proyecto creado: OBP-2026-001" con badge de success verde. Cuando hago clic en "Ver en OBP", el sistema abre nueva pestaña con el proyecto en Open Business Plan mostrando: "Nombre: Iniciativa hídrica D8", "Roadmap: 3 fases (18 meses)", "Presupuesto: $45M MXN", "Métricas: 5 KPIs definidos".

**Scenario: Reintento en caso de fallo de conexión**
Este escenario maneja fallos de conectividad. Dado que la conexión con OBP falla (servidor no disponible), cuando hago clic en "Exportar a Open Business Plan", entonces el modal muestra error: "Conexión fallida. OBP no disponible en este momento" con botón "Reintentar" y opción "Guardar para después". Cuando selecciono "Reintentar", el sistema hace 3 intentos con backoff exponencial (5s, 15s, 45s). Cuando la conexión se recupera en el tercer intento, el modal muestra "Conexión exitosa" y continúa con la exportación.

**Scenario: Payload con datos parciales**
Este escenario maneja exportaciones con información incompleta. Dado que el análisis se ejecutó con datos parciales (sin INEGI), cuando hago clic en "Exportar a Open Business Plan", entonces el modal muestra warning: "Exportando con datos incompletos. Confianza: 72%" con checkbox "Aceptar y continuar". Cuando acepto, la exportación procede y el proyecto OBP incluye disclaimer: "Análisis basado en datos parciales (INE únicamente). Recomendación: complementar con datos INEGI".

---

## 3. Definición de Pasos (Step Definitions)

### 3.1 Pasos Comunes de Given

Los pasos de preparación (Given) establecen el contexto inicial para cada escenario. El paso "estoy autenticado en el sistema cívicaOS" verifica que el usuario tiene sesión activa con token válido. El paso "tengo permisos de análisis para el distrito seleccionado" verifica que el rol del usuario incluye permisos de lectura y análisis para el distrito específico. El paso "los servicios de datos externos están disponibles" hace ping a cada servicio externo (INE, INEGI) y verifica que respondan con código 200. El paso "el modelo de IA local está ejecutándose correctamente" verifica que Ollama responde a solicitudes de inferencia con latencia aceptable. El paso "existe un gemelo digital de la población" verifica que la colección de agentes está cargada en memoria con el tamaño correcto.

### 3.2 Pasos Comunes de When

Los pasos de acción (When) describen las interacciones del usuario con el sistema. El paso "ingreso la consulta [texto]" captura el texto de consulta y lo envía al Orchestrator API. El paso "selecciono la política [nombre]" carga la política desde la base de datos y prepara los parámetros de simulación. El paso "ejecuto la simulación" inicia el engine ABM con los parámetros configurados. El paso "hago clic en [botón]" simula el click del usuario y captura el evento para validación. El paso "selecciono [opción] de la lista" captura la selección y actualiza el estado del componente. El paso "aplico filtro [tipo]" modifica la vista actual según los criterios de filtro especificados.

### 3.3 Pasos Comunes de Then

Los pasos de validación (Then) verifican que el comportamiento del sistema coincide con las expectativas. El paso "el sistema muestra [mensaje]" verifica que el mensaje aparece en la interfaz dentro del timeout de 5 segundos. El paso "el indicador del agente muestra estado [estado]" verifica que el agente correspondiente tiene el estado visual correcto (idle, procesando, completado, error). El paso "el log muestra [texto]" verifica que el texto aparece en la consola de logs con timestamp válido. El paso "la visualización muestra [elemento]" verifica que el gráfico o mapa renderiza correctamente con los datos esperados. El paso "el botón [nombre] está [estado]" verifica que el botón existe y tiene el estado enabled/disabled correcto.

---

## 4. Scenario Outlines (Escenarios Parametrizados)

### 4.1 Outline: Análisis por Categoría de Problema

Este scenario outline permite probar múltiples categorías de problemas con el mismo flujo.

| Categoría | Mensaje Inicial | Punto de Dolor Esperado | Intensidad Mínima |
|-----------|-----------------|------------------------|-------------------|
| Seguridad | "Analizar seguridad en D8" | Robo/Homicidio | 60 |
| Agua | "Analizar agua en D6" | Falta de agua | 55 |
| Economía | "Analizar economía en D4" | Desempleo | 50 |
| Transporte | "Analizar transporte en D2" | Traffic/Transporte público | 45 |
| Salud | "Analizar salud en D9" | Hospitales/Medicinas | 70 |
| Educación | "Analizar educación en D5" | Escuelas/Calidad | 65 |
| Corrupción | "Analizar corrupción en D7" | Gobierno/Limpieza | 80 |

### 4.2 Outline: Simulación de Políticas por Tipo

| Tipo de Política | Efecto Principal | Efecto Secundario Esperado |
|-----------------|------------------|---------------------------|
| Infraestructura | +Felicidad, +PIB | +Empleo |
| Social | +Felicidad, +Educación | -Presupuesto |
| Seguridad | +Felicidad, -Miedo | +Seguridad empresarial |
| Ambiental | +Salud, +Medioambiente | -Producción industrial |

### 4.3 Outline: Predicción Electoral por Perfil de Candidato

| Perfil de Candidato | Fortalezas | Debilidades | Base Esperada |
|--------------------|------------|-------------|---------------|
| economic_reformer | Economía, Empleo | Seguridad | PyMEs, Industriales |
| social_defender | Educación, Salud | Economía | Maestros, Doctores |
| security_strong | Seguridad, Orden | Sociales | Familia, Negocios |
| development_focus | Infraestructura | Ambientales | Construcción, Inmob. |
| establishment | Experiencia | Corrupción | Burócratas, Trad. |

---

## 5. Etiquetas (Tags) y Organización

### 5.1 Tags de Categorización

Las pruebas BDD se organizan mediante etiquetas que permiten ejecutar subconjuntos específicos. La etiqueta @critical marca pruebas de flujos principales sin los cuales el sistema no es usable, y estas pruebas se ejecutan en cada commit. La etiqueta @regression marca pruebas que verifican que cambios no rompen funcionalidad existente, y se ejecutan antes de cada release. La etiqueta @slow marca pruebas que toman más de 30 segundos, y se ejecutan solo en pipeline nocturno. La etiqueta @integration marca pruebas que requieren servicios externos, y se ejecutan solo en entorno de staging. La etiqueta @mock marca pruebas que usan datos simulados, y se ejecutan en todos los entornos.

### 5.2 Ejemplo de Feature con Tags

```gherkin
@critical @integration
Feature: Orquestación de Análisis Cívico
  Como estratega político, necesito que el sistema orqueste
  automáticamente el análisis de datos cívicos...
```

---

*Documento BDD actualizado: 2026-05-18*
*Próxima revisión programada: 2026-06-18*