# TDD - Especificación de Desarrollo Dirigido por Pruebas
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 1.0.0
**Fecha:** 2026-05-18
**Autor:** MiniMax Agent
**Estado:** Especificación正式

---

## 1. Introducción al TDD en CívicaOS

### 1.1 Propósito del Documento

Este documento establece la estrategia de Desarrollo Dirigido por Pruebas (Test-Driven Development) para el proyecto CívicaOS. El enfoque TDD garantizará que cada componente del sistema pase por un ciclo de desarrollo robusto: primero se escriben las pruebas, luego se implementa el código para satisfacer dichas pruebas, y finalmente se refactoriza para optimizar la calidad. Este proceso iterativo asegurará la robustez del sistema de orquestación multi-agente, la integración con APIs externas (INE, INEGI, Open Business Plan), y la precisión de los modelos predictivos de análisis cívico.

### 1.2 Alcance del TDD

El alcance del TDD abarca todos los componentes críticos del sistema: la capa de orquestación de agentes que coordina el flujo de trabajo entre el Recolector de Datos, el Analizador de Puntos de Dolor, el Simulador ABM, el Generador de Recomendaciones, el Integrador de Open Business Plan y el Generador de Informes. También se incluyen las pruebas de integración con las APIs externas del INE e INEGI, la validación de los modelos de predicción electoral, las pruebas de rendimiento para la simulación de gemelos digitales sociales con más de 1.000 agentes, y la verificación de la seguridad en la comunicación mTLS local. Cada módulo deberá tener una cobertura de pruebas mínima del 90% para considerarse producido.

### 1.3 Herramientas y Framework de Pruebas

El framework de pruebas seleccionado para cívicaOS es Jest como suite principal para pruebas unitarias y de integración del frontend en React, complementado con React Testing Library para pruebas de componentes de interfaz de usuario. Para las pruebas de backend y servicios Node.js se utilizará Mocha con Chai para aserciones, y para las pruebas de extremo a extremo (E2E) se empleará Playwright. Para las pruebas de carga y rendimiento se utilizará k6, y para la verificación de contratos de API se empleará Pact para diseñar contratos entre servicios. La cobertura de código se medirá con Istanbul/NYC para garantizar que se alcance el umbral mínimo establecido.

---

## 2. Estrategia de Pruebas por Capa

### 2.1 Pruebas de Capa de Datos (Data Layer Tests)

Las pruebas de la capa de datos verifican la correcta manipulación de información en PostgreSQL con extensión pgvector, la operación del almacén vectorial Qdrant, y la integridad de los formatos de datos parquet. Los casos de prueba incluyen: prueba de conexión a PostgreSQL y verificación de pgvector habilitado, donde se valida que la extensión pgvector esté correctamente instalada y que los índices HNSW funcionen para búsquedas de similitud vectorial. Se prueba la inserción de registros de entidades geográficas con sus coordenadas y metadatos asociados, verificando que la búsqueda por radio desde un punto central devuelva las entidades correctas dentro del radio especificado.

También se verifica el funcionamiento correcto de las consultas de similitud vectorial con umbrales de similaridad ajustables, donde se inserta un vector de embedding, se realiza una búsqueda de los 5 vecinos más cercanos, y se verifica que los resultados cumplan con el umbral de similaridad definido. Las pruebas de migración de esquemas aseguran que los scripts de migración alteren correctamente la estructura de la base de datos sin pérdida de datos. La prueba de backup y restore verifica que los procedimientos de respaldo permitan recuperar los datos completos y consistentes. Para la integración con DuckDB se verifica que las consultas OLAP ejecuten correctamente sobre archivos parquet y devuelvan los resultados esperados en tiempos inferiores a los umbrales establecidos.

### 2.2 Pruebas de Capa de Modelos de IA (AI/ML Layer Tests)

Las pruebas de la capa de modelos de IA verifican el funcionamiento correcto de los modelos locales ejecutados a través de Ollama. El caso de prueba de inferencia de modelo verifica que Qwen 2.5 72B responda correctamente a consultas en español con tiempos de respuesta menores a los umbrales definidos, y que las respuestas sean coherentes con el contexto proporcionado. La prueba de clasificación de puntos de dolor envía un texto descriptivo de un problema ciudadano y verifica que el modelo clasifique correctamente en una de las categorías predefinidas (seguridad, agua, economía, transporte, salud, educación, corrupción).

La prueba de generación de embeddings verifica que el modelo BGE-M3 genere vectores de dimensión 1024 para textos de entrada, y que vectores de textos similares tengan una mayor similaridad cosine que vectores de textos diferentes. La prueba de rotación de modelos verifica que el sistema pueda cambiar entre modelos (Qwen, DeepSeek, Mistral) sin interrupciones, y que las respuestas sean consistentes con el modelo seleccionado. Se incluyen pruebas de manejo de errores donde modelos no disponibles o con tiempo de espera agotado generen respuestas apropiadas sin bloquear el sistema. Las pruebas de cuantización verifican que los modelos en formato Q4 funcionen correctamente con uso de memoria menor al de los modelos en formato completo.

### 2.3 Pruebas de Agentes (Agent Layer Tests)

Las pruebas de la capa de agentes verifican el comportamiento individual y colectivo de cada agente del sistema de orquestación. El caso de prueba del Agente Recolector de Datos incluye verificación de conexión exitosa con API del INE mediante credenciales válidas, manejo correcto de respuestas de error con códigos HTTP 401 y 403, procesamiento de respuestas JSON y transformación a entidades del modelo de datos, almacenamiento correcto en PostgreSQL con todos los campos requeridos, y funcionamiento del caché con resultados válidos para consultas repetidas.

El Agente Analizador de Puntos de Dolor se prueba mediante verificación de clasificación correcta de texto libre en categorías predefinidas, cálculo preciso de intensidad y probabilidad basada en palabras clave, generación de mapas de calor con valores de intensidad correctos, y ordenamiento por severidad con los puntos de dolor más críticos primero. El Agente Simulador ABM se verifica con pruebas de generación de población sintética con distribución demográfica especificada, ejecución de simulación con políticas específicas y resultados reproducibles, cálculo correcto de trayectorias temporales de felicidad, PIB y empleo, y predicción de intención de voto con distribución porcentual coherente.

El Agente Generador de Recomendaciones se prueba verificando la generación de planes de acción priorizados con criterios claros, estimación de presupuestos con rangos proporcionales al alcance, identificación correcta de riesgos y propuestas de mitigación, y generación de roadmaps con fases temporales lógicas. El Agente Integrador de Open Business Plan verifica la transformación correcta del payload al formato OBP, comunicación exitosa con la API de OBP con manejo de errores robusto, validación de respuestas y mapeo a entidades cívicaOS, y manejo de escenarios de timeout y reintento automático.

### 2.4 Pruebas de Integración (Integration Tests)

Las pruebas de integración verifican el flujo completo de datos entre componentes del sistema. El flujo de análisis completo simula una consulta de usuario que pasa por todos los agentes: el orquestador recibe la consulta, la descompone en tareas, las distribuye a los agentes especializados, y compila los resultados finales en un informe coherente. Se verifica que el tiempo total del proceso completo sea menor al umbral establecido y que todos los datos intermedios se almacenen correctamente para auditoría.

La prueba de integración INE-INEGI-Analizador verifica el flujo de datos desde las APIs externas hasta el análisis de puntos de dolor, confirmando que los datos demográficos del INEGI se combinen correctamente con los resultados electorales del INE para generar patrones geográficos significativos. La prueba de integración ABM-Simulador verifica que los resultados de la simulación de políticas se traduzcan correctamente en predicciones de intención de voto, y que las trayectorias temporales sean coherentes con los parámetros de entrada.

La prueba de integración OBP verifica el flujo completo de exportación: desde la generación de recomendaciones en cívicaOS, pasando por la transformación de payload, hasta la creación de un proyecto en Open Business Plan, y la recuperación del roadmap generado. Se verifica que el identificador de proyecto OBP se almacene correctamente en cívicaOS para referencia futura. La prueba de integración de auditoría verifica que todos los eventos del sistema generen registros de auditoría con hashes criptográficos, y que estos registros sean consultables y verificables.

---

## 3. Casos de Prueba Detallados

### 3.1 Pruebas Unitarias del Orquestador

| ID de Prueba | Descripción | Entrada | Salida Esperada | Criterio de Aceptación |
|--------------|-------------|---------|-----------------|------------------------|
| ORCH-001 | Inicialización del orquestador | Configuración vacía | Instancia de Orquestador con estado IDLE | Orquestador creado sin errores |
| ORCH-002 | Recepción de consulta válida | Query de análisis de distrito | Mensaje de REQUEST enviado a DataCollector | Mensaje con estructura JSON correcta |
| ORCH-003 | Descomposición de tarea compleja | Query que requiere múltiples agentes | Lista de subtareas identificadas | Todas las subtareas tienen dependencias resueltas |
| ORCH-004 | Manejo de timeout de agente | Mensaje de agente con timeout excedido | Reintento automático con mensaje de warning | Máximo 3 reintentos antes de falla |
| ORCH-005 | Compilación de resultados parciales | Resultados de 3 de 5 agentes completados | Estado parcial con progreso | Progreso refleja exactamente 60% |
| ORCH-006 | Finalización exitosa | Todos los agentes completados | Resultado final con resumen | Resumen contiene todas las secciones requeridas |
| ORCH-007 | Manejo de error crítico de agente | Error fatal en Analyzer | Estado de ERROR con mensaje descriptivo | Error propagate correctamente al usuario |
| ORCH-008 | Recuperación de sesión | Sesión previa con estado incompleto | Restauración del estado y continuación | Sesión restaurada sin pérdida de datos |

### 3.2 Pruebas Unitarias del ABM Engine

| ID de Prueba | Descripción | Entrada | Salida Esperada | Criterio de Aceptación |
|--------------|-------------|---------|-----------------|------------------------|
| ABM-001 | Generación de población sintética | 1000 agentes, distribución demográfica | Array de 1000 agentes con atributos | Total de agentes = 1000, sum de proporciones = 1.0 |
| ABM-002 | Aplicación de política simple | 1 política con efecto happiness +10 | Cambio en felicidad promedio | Aumento promedio >= 8 puntos |
| ABM-003 | Aplicación de política con副作用 | 1 política con efecto negative no identificado | Warning y ajuste automático | Sistema estable con mensaje de alerta |
| ABM-004 | Simulación de 10 años | Población base, horizonte de 10 años | Trayectoria anual de métricas | 10 puntos de datos por métrica |
| ABM-005 | Convergencia de opiniones | Gemelo digital con 100 iteraciones | Estabilización de opiniones | Varianza de opiniones < umbral |
| ABM-006 | Predicción de intención de voto | Distribución de perfiles al final de simulación | Porcentajes por candidato | Suma de porcentajes = 100% |
| ABM-007 | Validación de reproducibilidad | Misma semilla, misma config, 2 ejecuciones | Resultados idénticos | Diferencia máxima < 0.001% |
| ABM-008 | Manejo de límite de memoria | Población de 1M agentes | Error gracefully manejado | Mensaje claro y no crash |

### 3.3 Pruebas Unitarias de APIs Externas

| ID de Prueba | Descripción | Entrada | Salida Esperada | Criterio de Aceptación |
|--------------|-------------|---------|-----------------|------------------------|
| API-INE-001 | Consulta de resultados electorales | ID de distrito válido, año 2024 | JSON con candidatos y porcentajes | Estructura válida con todos los campos |
| API-INE-002 | Consulta con distrito inválido | ID de distrito inexistente | Error con código 404 y mensaje claro | Error maneja correctamente |
| API-INE-003 | Autenticación fallida | Credenciales inválidas | Error 401 con mensaje | No exponer detalles de credenciales |
| API-INEGI-001 | Consulta de datos censales | ID de municipio, año 2020 | JSON con demographics | Datos con estructura esperada |
| API-INEGI-002 | Consulta masiva de indicadores | Lista de 50 indicadores | Array de resultados | Todos los indicadores consultados |
| API-INEGI-003 | Timeout de API | API no responde por 30s | Reintento automático y fallback | No perder datos, mensaje de warning |
| API-OBP-001 | Creación de proyecto | Payload de iniciativa cívica | ID de proyecto OBP | Proyecto creado y accesible |
| API-OBP-002 | Consulta de roadmap | ID de proyecto OBP | URL de roadmap | URL accesible dentro de timeout |

---

## 4. Plan de Ejecución de Pruebas

### 4.1 Fases de Ejecución

La ejecución de pruebas se divide en cuatro fases secuenciales que permiten una validación progresiva del sistema. La Fase 1 de Pruebas Unitarias tiene una duración estimada de 2 días y abarca todas las pruebas unitarias de componentes individuales. Los criterios de pase incluyen: 100% de pruebas ejecutadas, 0 fallos, cobertura de código >= 90%. El entorno requerido es local con base de datos de pruebas limpia. La Fase 2 de Pruebas de Integración tiene una duración estimada de 3 días y verifica la comunicación entre componentes y servicios externos. Los criterios de pase incluyen: 100% de flujos de integración exitosos, tiempos de respuesta dentro de umbrales, datos consistentes entre servicios. El entorno requerido es staging con APIs mock.

La Fase 3 de Pruebas de Rendimiento tiene una duración estimada de 2 días y verifica el comportamiento bajo carga y estrés del sistema. Los criterios de pase incluyen: throughput mínimo de 10 consultas concurrentes, latencia P95 < 5 segundos, uso de memoria estable. El entorno requerido es staging con carga simulada. La Fase 4 de Pruebas de Aceptación tiene una duración estimada de 2 días y verifica los flujos de usuario completos según criterios de negocio. Los criterios de pase incluyen: escenarios de usuario principales exitosos, satisfacción de criterios de aceptación definidos con el cliente. El entorno requerido es staging o producción controlada.

### 4.2 Entornos de Pruebas

El entorno de pruebas local (Local) se configura en la máquina del desarrollador con Docker Compose ejecutando PostgreSQL, Qdrant, Ollama y Redis. Este entorno permite pruebas unitarias y de integración rápidas sin dependencias externas. Los datos son de prueba y se resetean frecuentemente. El entorno de pruebas de staging (Staging) se configura en un servidor dedicado que replica el entorno de producción con la configuración Tier 1 (Mac Mini M4). Este entorno permite pruebas de rendimiento y aceptación con datos realistas anonimizados. Las APIs externas se conectan a sandboxes de INE/INEGI. El entorno de producción (Production) se utiliza únicamente para pruebas de smoke después de deployments, verificando funcionalidad básica sin ejecutar suite completa.

### 4.3 Criteria de Gate para Despliegue

Para poder proceder a producción, todas las fases de pruebas deben completar exitosamente con los siguientes criterios mínimos: cobertura de código >= 90% en módulos críticos, 0 fallos en pruebas críticas (ORCH, ABM, API-OBP), tiempo de respuesta P95 < 5 segundos para consultas de análisis, y aprobación manual del Product Owner para features con criterios de aceptación complejos.

---

## 5. Automatización de Pruebas

### 5.1 Pipeline de CI/CD

El pipeline de integración continua está configurado para ejecutarse automáticamente en cada commit y pull request. El Stage 1 de validación lint y tipos ejecuta ESLint y TypeScript compiler, con un umbral de 0 errores para continuar. El Stage 2 de pruebas unitarias ejecuta Jest con cobertura, donde el umbral mínimo es 90% de cobertura y 0 tests fallidos. El Stage 3 de pruebas de integración ejecuta el subconjunto de pruebas de integración relacionado con los cambios del commit, con timeout de 10 minutos máximo. El Stage 4 de build de imagen Docker asegura que la aplicación compile y la imagen se construya correctamente. El Stage 5 de análisis de seguridad ejecuta Snyk y Trivy para detectar vulnerabilidades conocidas.

### 5.2 Scripts de Ejecución

Los scripts de ejecución de pruebas están diseñados para cubrir diferentes escenarios y niveles de prueba. El script npm test ejecuta la suite completa de pruebas unitarias con reporte de cobertura. El script npm run test:watch activa el modo de vigilancia que ejecuta pruebas automáticamente al detectar cambios en archivos relacionados. El script npm run test:e2e ejecuta las pruebas de extremo a extremo con Playwright, requiriendo que el servidor de desarrollo esté ejecutándose. El script npm run test:integration ejecuta las pruebas de integración en el entorno de staging, con前提 de que las APIs mock estén disponibles. El script npm run test:perf ejecuta las pruebas de rendimiento con k6, generando un reporte HTML de métricas.

### 5.3 Métricas y Reporting

El dashboard de calidad de código muestra en tiempo real el estado de las pruebas, la cobertura por módulo, y las tendencias históricas de calidad. Las alertas automatizadas se configuran para notificar al equipo cuando la cobertura cae por debajo del umbral, cuando pruebas críticas fallan, o cuando se detectan regresiones de rendimiento. El reporte semanal de calidad incluye análisis de tendencias, debts técnicos identificados, y recomendaciones de mejora.

---

## 6. Mantenimiento de Pruebas

### 6.1 Actualización de Pruebas

Las pruebas se actualizan automáticamente cuando el código base cambia de maneras que afectan su validez. Cuando se agrega una nueva feature, el desarrollador debe escribir las pruebas antes o simultáneamente con la implementación. Cuando se modifica una feature existente, las pruebas afectadas deben actualizarse para reflejar el nuevo comportamiento esperado. Cuando se depreca una feature, las pruebas asociadas se marcan como deprecated pero no se eliminan inmediatamente para preservar el historial.

### 6.2 Deuda Técnica de Pruebas

La deuda técnica de pruebas se monitorea y gestiona activamente. Pruebas flaky (no determinísticas) se priorizan para corrección inmediata, ya que erosionan la confianza en la suite de pruebas. Pruebas obsoletas que ya no reflejan el comportamiento del sistema se revisan y actualizan o eliminan. Coverage gaps identificados se documentan en tickets de seguimiento con priorización basada en criticidad del módulo.

---

*Documento TDD actualizado: 2026-05-18*
*Próxima revisión programada: 2026-06-18*