# BDD - Especificación de Desarrollo Dirigido por Comportamiento (Behavior-Driven Development)
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 0.5.0  
**Fecha:** 2026-05-18  
**Autor:** Antigravity Agent  
**Estado:** Especificación Oficial  

---

## 1. Introducción al BDD en CívicaOS

El Desarrollo Dirigido por Comportamiento (Behavior-Driven Development) en CívicaOS se centra en definir el comportamiento del sistema desde la perspectiva del usuario y los stakeholders del negocio. Este enfoque utiliza el lenguaje Gherkin para describir escenarios de negocio en términos de características, condiciones y resultados esperados. El objetivo es crear un puente efectivo entre los requisitos técnicos y la comprensión del negocio, permitiendo que todos los involucrados en el proyecto —desde desarrolladores hasta gerentes de producto y clientes— puedan colaborar efectivamente en la definición del sistema.

### Framework y Herramientas:
Para la implementación del BDD en CívicaOS, se utilizará Cucumber.js como framework principal de escritura y ejecución de características (features) en Gherkin. Las pruebas escritas en Gherkin servirán simultáneamente como documentación viva del sistema y como especificaciones ejecutables que garantizan que la implementación cumple con los requisitos definidos.

---

## 2. Estructura de Características (Features)

### 2.1 Feature: Orquestación de Análisis Cívico

**Narrativa:**  
Como estratega político,  
necesito que el sistema orqueste automáticamente el análisis de datos cívicos  
para generar recomendaciones accionables sin necesidad de comprender los detalles técnicos subyacentes.

**Contexto Común (Background):**  
Dado que estoy autenticado en el sistema cívicaOS  
Y tengo permisos de análisis para el distrito seleccionado  
Y los servicios de datos externos (INE, INEGI) están disponibles  
Y el modelo de IA local (Ollama) está ejecutándose correctamente  

**Escenario: Análisis exitoso de crisis de agua**  
Dado que estoy en la consola del orquestador de cívicaOS  
Cuando ingreso la consulta "Analizar crisis de agua en Hermosillo D8"  
Entonces el sistema muestra un mensaje de "Iniciando análisis..." con progreso inicial  
And el indicador del agente DataCollector muestra estado "Procesando"  
Cuando los datos del INE se recolectan exitosamente  
Entonces el log muestra "Datos INE recibidos: 15,000 registros"  
And el indicador del agente Analyzer muestra estado "Procesando"  
Cuando el análisis de patrones geográficos se completa  
Entonces el log muestra "Puntos de dolor identificados: 23"  
And el indicador del agente Simulator muestra estado "Procesando"  
Cuando la simulación de políticas se ejecuta  
Entonces el log muestra "Simulación completada: 3 escenarios evaluados"  
And el indicador del agente Recommender muestra estado "Procesando"  
Cuando las recomendaciones se generan  
Entonces el log muestra "Recomendaciones generadas: Plan de Acción listo"  
And el indicador del agente Integrator muestra estado "Procesando"  
Cuando la integración con Open Business Plan se completa  
Entonces el log muestra "Exportación exitosa: Proyecto OBP-2026-001 creado"  
And todos los indicadores de agentes muestran estado "Completado"  
And el panel de resultados muestra el resumen ejecutivo con 3 recomendaciones priorizadas  
And el botón "Ver Plan de Ataque" está habilitado  

**Escenario: Análisis con datos parciales**  
Dado que los servicios del INE están disponibles pero el servicio de INEGI tiene timeout  
Cuando ingreso la consulta "Analizar problema de transporte en D6"  
Entonces el sistema muestra el warning "Datos INEGI no disponibles, usando fuentes alternativas" en la consola  
And el análisis continúa con los datos disponibles del INE  
Cuando el proceso se completa  
Entonces el sistema muestra "Análisis completado con datos parciales" con confianza reducida al 72%  
And las recomendaciones incluyen el descargo de responsabilidad "Basado en datos parciales (INE únicamente)"  

**Escenario: Fallo de modelo de IA**  
Dado que el modelo Qwen 2.5 72B no está disponible  
Cuando ingreso cualquier consulta de análisis  
Entonces el sistema muestra el error "Modelo de IA no disponible. Iniciando fallback a DeepSeek-R1" en la consola  
And el indicador del modelo muestra "DeepSeek-R1 (Fallback)"  
Cuando el análisis se completa usando el modelo alternativo  
Entonces el sistema muestra "Análisis completado usando modelo alternativo"  
And el reporte incluye la nota "Procesado con DeepSeek-R1 (Calidad Reducida)"  

**Escenario: Timeout de consulta**  
Dado que la consulta es muy compleja por abarcar múltiples distritos y 5 años de datos  
Cuando ingreso la consulta "Análisis comparativo de seguridad: D3, D4, D5, D7 (2019-2024)"  
Entonces el sistema muestra "Consulta compleja detectada. Tiempo estimado: 8 minutos" con opciones de continuar o simplificar  
Cuando selecciono "Continuar"  
Entonces el progreso muestra "Tiempo transcurrido: 5/8 minutos" con opción de cancelar  
Cuando se alcanza el timeout de 8 minutos  
Entonces el sistema cancela el análisis y muestra "Consulta cancelada por timeout. Sugerencia: reducir alcance a 2 distritos"  

---

### 2.2 Feature: Simulación de Políticas con Gemelo Digital

**Narrativa:**  
Como analista de políticas públicas,  
necesito simular el impacto de diferentes intervenciones gubernamentales antes de implementarlas  
para proyectar resultados a corto, mediano y largo plazo, detectando efectos secundarios no intencionados.

**Contexto Común (Background):**  
Dado que tengo acceso al módulo de simulador ABM de cívicaOS  
Y existe un gemelo digital de la población de Hermosillo con 10,000 agentes  
Y las políticas base de referencia están cargadas en el sistema  

**Escenario: Simulación de política de infraestructura hídrica**  
Dado que estoy en el módulo de simulador  
Cuando selecciono la política "Construcción de planta desaladora" con un presupuesto de $150 millones MXN  
Entonces el sistema muestra la vista previa de efectos estimando +15% felicidad, +2.3% PIB, -0.5% desempleo  
And proyecta +8% de intención de voto para candidatos con perfil "development_focus"  
Cuando ejecuto la simulación  
Entonces la visualización muestra la trayectoria de felicidad de 10 años en curva ascendente estabilizada en el año 7  
And la visualización muestra la proyección de PIB con un incremento gradual del 2.3% acumulado  
And la visualización muestra la intención de voto con una desviación hacia el candidato de desarrollo del 8%  
Cuando la simulación se completa  
Entonces el panel de resultados muestra "Confianza: 87%" y la nota "Basado en modelo ABM con 10,000 agentes sintéticos"  

**Escenario: Comparación de políticas alternativas**  
Dado que estoy en el módulo de simulador con 3 políticas cargadas  
Cuando selecciono "Comparar: [Política A, Política B, Política C]"  
Entonces el sistema genera 3 escenarios paralelos sobre el mismo gemelo digital  
And la visualización muestra un gráfico comparativo con curvas superpuestas de felicidad, PIB y empleo  
Cuando la comparación se completa  
Entonces la tabla de resumen muestra el ranking: "1. Política B (mejor relación costo/impacto)", "2. Política A (mayor impacto social)", "3. Política C (menor riesgo)"  

**Escenario: Detección de efectos secundarios**  
Dado que selecciono la política "Subsidio a transporte público" con presupuesto de $50 millones MXN  
Cuando la simulación proyecta que el desempleo en el sector privado aumentará +1.2% como efecto secundario  
Entonces el sistema muestra la alerta amarilla "Efecto secundario detectado: impacto negativo en sector privado"  
And las recomendaciones finales sugieren la mitigación: "Programa de reconversión laboral paralelo"  

**Escenario: Simulación con restricciones de presupuesto**  
Dado que configuro la política "Sistema de vigilancia completa" con un costo de $200 millones MXN  
And el límite de presupuesto actual del municipio es de $80 millones MXN  
Cuando inicio la simulación  
Entonces el sistema notifica "Presupuesto insuficiente. Escalando implementación a 5 años en fases"  
And la visualización muestra fases de implementación con hitos anuales detallados  
Cuando la simulación finaliza  
Entonces el sistema muestra "Implementación escalada: años 1-2 (fase 1: $30M), años 3-4 (fase 2: $30M), año 5 (fase 3: $20M)"  

**Escenario: Simulación de acoplamientos físicos y caos social no lineal**  
Dado que estoy en el módulo de simulador del gemelo digital  
Cuando configuro la "Radiación Solar Directa" a 900 W/m²  
And configuro la "Presión de Tandeo Hídrico" a 20%  
And ejecuto la simulación por 1 año  
Entonces la simulación proyecta que la "Desintegración y Polarización Social" supera el 80%  
And el "Riesgo de Vandalismo / Disturbios" se dispara exponencialmente superando el 95% debido al acoplamiento de doble bucle no lineal (Ajuste B)  
And el "Historial de Corridas y Simulaciones Archivadas" registra de forma exitosa la corrida "SIM-HIST-02" para consulta  

**Escenario: Entrevista cognitiva conversacional con un ciudadano sintético**  
Dado que he seleccionado al agente sintético individual "Agente 2" en el micro-inspector  
Cuando selecciono la pregunta "💧 ¿Cómo te afecta el tandeo y la presión hidráulica en tu manzana?"  
And hago clic en el botón "Entrevistar"  
Entonces el sistema muestra un indicador de carga conversacional "Consultando cognición del agente..."  
And tras 1.2 segundos muestra la respuesta del ciudadano sintético formateada en itálica  
And la respuesta contiene expresiones típicas de Sonora como "¡Qué bárbaro con este calorón!"  
And la respuesta detalla la presión exacta en PSI del predio del agente adaptada de forma condicional  

---

### 2.3 Feature: Predicción Electoral por Distrito

**Narrativa:**  
Como científico de datos políticos,  
necesito predecir resultados electorales con alta precisión para diferentes escenarios  
para analizar perfiles de candidatos y generar predicciones con intervalos de confianza realistas.

**Contexto Común (Background):**  
Dado que tengo acceso al módulo de predictor electoral de cívicaOS  
Y los datos históricos de las elecciones de 2018, 2021 y 2024 están cargados  
Y los perfiles de candidatos actuales están disponibles  

**Escenario: Predicción de elecciones municipales**  
Dado que estoy en el módulo predictor  
Cuando selecciono "Predecir: Elecciones Hermosillo 2027"  
Entonces el sistema identifica a los candidatos: "Perfil A (economic_reformer), Perfil B (social_defender), Perfil C (establishment)"  
And la visualización de radar muestra las dimensiones de cada perfil (economía, seguridad, educación, salud, infraestructura)  
Cuando ejecuto la predicción con el estado de opinión actual  
Entonces la visualización muestra el histograma de intención de voto: "Candidato A: 42%, Candidato B: 31%, Candidato C: 27%"  
And el intervalo de confianza muestra "Margen de error: ±4%"  
Cuando la predicción se refina agregando los pesos históricos  
Entonces el panel muestra "Confianza del modelo: 83%" indicando "Basado en 3 elecciones históricas y 15 variables"  

**Escenario: Análisis de swing districts**  
Dado que selecciono la opción "Análisis de swing districts: Sonora"  
Cuando el sistema procesa los 18 distritos del estado  
Entonces la clasificación muestra: "Distritos seguros: 12", "Swing districts: 4 (D3, D5, D9, D11)", "Distritos de oposición seguros: 2"  
And para los swing districts muestra el detalle: "D3: 48.2% incumbente vs 47.8% retador (diferencia: 0.4%)"  
And la recomendación estratégica indica: "Swing district D3: inversión recomendada de $2M MXN para flip"  

**Escenario: Impacto de escándalo en predicción**  
Dado que la predicción base para el Candidato A es de 45% de intención de voto  
Cuando simulo un escándalo de corrupción para el Candidato A en el día t+30  
Entonces la visualización muestra una curva de intención de voto con un declive abrupto al 32% en el día 30  
And la recuperación muestra una trayectoria gradual pero incompleta al 38% en el día 180  
Cuando la simulación completa  
Entonces el sistema muestra "Impacto estimado: -7% puntos (30 días), afectación permanente de -3% en la base electoral"  

---

### 2.4 Feature: Mapa de Calor de Puntos de Dolor

**Narrativa:**  
Como desarrollador de políticas,  
necesito visualizar geográficamente los problemas de los ciudadanos  
para priorizar intervenciones con base en mapas de calor de alta resolución.

**Contexto Común (Background):**  
Dado que tengo acceso al módulo de mapas de cívicaOS  
Y los datos del INE, INEGI y encuestas locales están sincronizados  
Y los límites geográficos de los distritos están cargados  

**Escenario: Visualización de heat map de seguridad**  
Dado que estoy en el módulo de mapas  
Cuando selecciono "Ver: Heat map de seguridad" con un filtro de intensidad superior a 40  
Entonces el mapa colorea los 18 distritos en escala desde rojo (D8: 95) hasta verde (D1: 22)  
When hago clic en el distrito D8  
Entonces el popup muestra los detalles: "Seguridad D8: intensidad 95, 12,500 afectados, tendencia: +8% mensual"  
Cuando aplico el filtro temporal "Último mes"  
Entonces el mapa se actualiza con datos recientes mostrando "Tendencia D8: +12% vs mes anterior"  
Cuando guardo la vista actual  
Entonces el sistema confirma "Vista guardada: Heat map seguridad D8 foco (2026-05-18)"  

**Escenario: Comparación de categorías**  
Dado que estoy en el módulo de mapas  
Cuando selecciono "Comparar categorías: [Seguridad, Agua, Economía]" en vista de cuadrícula  
Entonces el mapa muestra 3 paneles simultáneos con mapas de calor individuales  
And la leyenda general muestra el impacto de afectados por categoría  
Cuando paso el cursor sobre el distrito D8  
Entonces el tooltip muestra la severidad asociada: "D8: Seguridad(95), Agua(88), Economía(72)"  
And el sistema genera la tabla resumen priorizando: "Zona Norte D8: #1 Seguridad, #2 Agua; Zona Centro D2: #1 Economía, #2 Transporte"  

**Escenario: Drill-down a zona específica**  
Dado que estoy visualizando el mapa a nivel de distritos  
Cuando hago clic sobre el distrito D8  
Entonces el mapa hace un zoom dinámico mostrando las 8 zonas granulares de D8 con su calor correspondiente  
Cuando selecciono la zona "Palo Verde" de la lista de resultados  
Entonces el mapa dibuja los límites específicos de la zona con marcadores para puntos de dolor individuales  
Cuando selecciono un marcador de punto de dolor  
Entonces el popup detalla: "Problema: Fallas en red hídrica", "Intensidad: 98", "Afectados: 3,200 hogares"  
And el botón "Analizar" se habilita para iniciar el flujo de orquestación de ese dolor  

---

### 2.5 Feature: Integración con Open Business Plan

**Narrativa:**  
Como director de proyecto,  
necesito exportar las recomendaciones de CívicaOS a Open Business Plan  
para generar planes de negocio estructurados, roadmaps y estimación de presupuestos.

**Contexto Común (Background):**  
Dado que tengo acceso a la consola de orquestación  
Y la sesión de análisis del Swarm ha finalizado con éxito  
Y la conexión local con Open Business Plan está configurada  

**Escenario: Exportación exitosa de iniciativa**  
Dado que el análisis del problema "Crisis de agua D8" ha generado 3 recomendaciones  
Cuando hago clic en "Exportar a Open Business Plan"  
Entonces el modal muestra el progreso "Preparando payload..." seguido de "Conectando con OBP (mTLS)..."  
Cuando la conexión cifrada se establece  
Entonces muestra la barra de progreso "Transferencia en progreso..."  
Cuando la transferencia se completa con éxito  
Entonces el modal muestra "Proyecto creado: OBP-2026-001" con indicador de éxito  
Cuando selecciono "Ver en OBP"  
Entonces se abre una pestaña nueva con el plan de negocios en OBP conteniendo el roadmap de 3 fases y presupuesto de $45M MXN  

**Escenario: Reintento en caso de fallo de conexión**  
Dado que la conexión con el servidor local de OBP no está disponible  
Cuando hago clic en "Exportar a Open Business Plan"  
Entonces el sistema interrumpe el flujo y muestra "Conexión fallida. OBP no disponible" con la opción de "Reintentar"  
Cuando selecciono "Reintentar"  
Entonces el sistema realiza 3 intentos automáticos con backoff exponencial (5s, 15s, 45s)  
Cuando la conexión se restablece en el tercer intento  
Entonces el sistema notifica "Conexión establecida" y procesa la exportación de forma normal  

**Escenario: Payload con datos parciales**  
Dado que el análisis cívico se realizó con datos incompletos (INE únicamente, sin censo de INEGI)  
Cuando selecciono "Exportar a Open Business Plan"  
Entonces el modal muestra la advertencia "Exportando con datos incompletos. Confianza reducida: 72%"  
And solicita la confirmación mediante un checkbox "Aceptar y continuar"  
Cuando marco la confirmación y continúo  
Entonces la exportación finaliza y añade al plan en OBP la anotación "Basado en datos parciales (INE únicamente). Se sugiere complementar con INEGI"  

---

## 3. Definición de Pasos (Step Definitions)

### 3.1 Pasos de Contexto (Givens)
*   `estoy autenticado en el sistema cívicaOS`: Verifica la sesión de usuario activa y la validez del token local.
*   `tengo permisos de análisis para el distrito seleccionado`: Valida las ACL del rol de usuario en la base transaccional.
*   `los servicios de datos externos están disponibles`: Realiza pings de diagnóstico con respuesta HTTP 200 en los mocks/conectores de INE e INEGI.
*   `el modelo de IA local está ejecutándose correctamente`: Verifica que Ollama responde a peticiones de inferencia con latencia inferior al umbral.
*   `existe un gemelo digital de la población`: Valida que la colección de agentes sintéticos esté inicializada en DuckDB.

### 3.2 Pasos de Acción (Whens)
*   `ingreso la consulta [texto]`: Pasa el texto libre a la API del orquestador.
*   `selecciono la política [nombre]`: Carga la configuración del set de políticas en el ABM Engine.
*   `ejecuto la simulación`: Inicializa el bucle de iteración del ABM.
*   `hago clic en [botón]`: Captura el evento del ratón y actualiza el estado de la vista de React.
*   `selecciono [opción] de la lista`: Actualiza los filtros activos del componente.

### 3.3 Pasos de Validación (Thens)
*   `el sistema muestra [mensaje]`: Busca el nodo DOM con el texto correspondiente.
*   `el indicador del agente muestra estado [estado]`: Comprueba las clases CSS del componente del agente.
*   `el log muestra [texto]`: Verifica la inserción en tiempo real del registro en la consola monoespaciada.
*   `la visualización muestra [elemento]`: Valida que los gráficos de Recharts o mapas Leaflet se hayan renderizado correctamente con datos.
*   `el botón [nombre] está [estado]`: Comprueba el atributo `disabled` o la interactividad del botón.

---

## 4. Escenarios Parametrizados (Scenario Outlines)

### 4.1 Outline: Análisis por Categoría de Problema

```gherkin
Scenario Outline: Análisis de diferentes categorías de problemas ciudadanos
  Given estoy en la consola del orquestador de cívicaOS
  When ingreso la consulta "<mensaje_inicial>"
  Then el sistema debe identificar un dolor de tipo "<dolor_esperado>"
  And el dolor debe tener una intensidad mínima de "<intensidad_minima>"

  Examples:
    | mensaje_inicial            | dolor_esperado            | intensidad_minima |
    | "Analizar seguridad en D8" | Robo/Homicidio            | 60                |
    | "Analizar agua en D6"      | Falta de agua             | 55                |
    | "Analizar economía en D4"  | Desempleo                 | 50                |
    | "Analizar transporte en D2"| Tráfico/Transporte público| 45                |
    | "Analizar salud en D9"     | Hospitales/Medicinas      | 70                |
    | "Analizar educación en D5" | Escuelas/Calidad          | 65                |
    | "Analizar corrupción en D7"| Gobierno/Transparencia    | 80                |
```

### 4.2 Outline: Simulación de Políticas por Tipo

```gherkin
Scenario Outline: Simulación de impacto de políticas públicas
  Given estoy en el módulo de simulador con gemelo digital
  When selecciono la política "<tipo_politica>"
  Then el simulador proyecta el efecto principal "<efecto_principal>"
  And detecta la alerta de efecto secundario "<efecto_secundario>"

  Examples:
    | tipo_politica     | efecto_principal             | efecto_secundario      |
    | "Infraestructura" | "+Felicidad, +PIB"           | "+Empleo en obra"      |
    | "Social"          | "+Felicidad, +Educación"     | "-Presupuesto local"   |
    | "Seguridad"       | "+Felicidad, -Miedo"         | "+Confianza comercial" |
    | "Ambiental"       | "+Salud, +Medioambiente"     | "-Producción industrial"|
```

---

## 5. Etiquetas (Tags) y Organización de Ejecución

El conjunto de pruebas BDD de CívicaOS está catalogado mediante etiquetas para facilitar la ejecución segmentada en el flujo de integración continua:

*   `@critical`: Escenarios clave de la consola del orquestador. Se ejecutan automáticamente en cada confirmación (commit).
*   `@regression`: Flujo completo que cubre simulaciones ABM y predicciones. Se ejecuta de forma obligatoria antes de cada lanzamiento formal (release).
*   `@integration`: Pruebas que validan la conexión local real con las APIs de INE, INEGI u Open Business Plan. Requiere entornos locales activos y certificados mTLS válidos.
*   `@mock`: Escenarios rápidos de visualización UI que utilizan datos locales inyectados de simulación (no requiere backend activo).
*   `@cositas`: Escenarios del marketplace CositasApp que requieren Firebase Emulator activo.

---

## 6. Features de CositasApp — Marketplace Social Multi-Nivel

### 6.1 Feature: Flujo de Compra Completo

**Narrativa:**  
Como comprador (Nivel 2),  
necesito navegar el feed, explorar tiendas, agregar productos al carrito y completar mi pedido  
para recibir mis productos en casa o recogerlos en tienda.

**Escenario: Compra exitosa con confirmación WhatsApp**  
Dado que estoy autenticado como Comprador (Nivel 2)  
Y existe la tienda "Tacos El Güero" con 5 productos publicados  
Cuando navego al feed y selecciono la tienda "Tacos El Güero"  
Entonces veo el catálogo con los 5 productos disponibles con precios en MXN  
Cuando agrego "3 Tacos de Asada" ($45) y "1 Refresco" ($25) al carrito  
Entonces el ícono del carrito muestra "2 ítems" y el total "$70.00"  
Cuando procedo al checkout y selecciono "Pago por WhatsApp"  
Entonces se genera un mensaje de WhatsApp con el resumen: "3x Tacos de Asada ($45), 1x Refresco ($25) — Total: $70.00"  
And se crea una orden en Firestore con estado "pendiente"  
And el vendedor recibe notificación de nuevo pedido  

**Escenario: Compra con puntos de lealtad**  
Dado que tengo 500 puntos de lealtad acumulados (equivalente a $50 MXN de descuento)  
Y mi carrito tiene un total de $120  
Cuando aplico mis puntos de lealtad en el checkout  
Entonces el total se reduce a $70 y los puntos se descuentan de mi saldo  

### 6.2 Feature: Punto de Venta Táctil con Mesas

**Narrativa:**  
Como cajero POS (Nivel 2.5),  
necesito operar el punto de venta con soporte para mesas de restaurante  
para gestionar múltiples cuentas simultáneamente y cobrar con diferentes métodos de pago.

**Escenario: Gestión completa de mesa de restaurante**  
Dado que estoy en el POS táctil con las mesas habilitadas  
Cuando selecciono "Mesa 2" del panel de mesas  
Entonces se abre una cuenta nueva para Mesa 2 con estado "Abierta"  
Cuando agrego "2 Enchiladas" ($80) y "1 Agua de Horchata" ($30)  
Entonces el subtotal de Mesa 2 muestra "$110.00"  
Cuando cambio a "Mostrador" para atender otro cliente  
Entonces la cuenta de Mesa 2 se guarda automáticamente  
Cuando regreso a "Mesa 2" y agrego "1 Postre de Flan" ($45)  
Entonces el subtotal actualizado muestra "$155.00"  
Cuando el cliente pide la cuenta y selecciono "Cobrar con PayPal"  
Entonces se muestra el simulador de autorización PayPal  
And al confirmar, la mesa se libera y queda disponible para nuevos clientes  
And se genera un ticket compartible por WhatsApp  

### 6.3 Feature: Progresión de Niveles del Vendedor

**Narrativa:**  
Como vendedor en crecimiento,  
necesito que el sistema desbloquee funcionalidades conforme mi negocio crece  
para acceder a herramientas más avanzadas sin pagar licencias adicionales.

```gherkin
Scenario Outline: Verificación de desbloqueo de funcionalidades por nivel
  Given estoy autenticado con roleLevel <nivel>
  When accedo a la sección "<seccion>"
  Then el módulo debe estar "<estado>"

  Examples:
    | nivel | seccion             | estado       |
    | 1     | Feed Social         | Habilitado   |
    | 1     | Punto de Venta      | Bloqueado    |
    | 2     | Carrito de Compras  | Habilitado   |
    | 2.5   | Punto de Venta      | Habilitado   |
    | 2.6   | Gestión de Almacén  | Habilitado   |
    | 2.8   | Panel de Entregas   | Habilitado   |
    | 3     | Publicar Productos  | Habilitado   |
    | 4     | Compras B2B         | Habilitado   |
    | 5     | Contabilidad NIF    | Habilitado   |
    | 6     | Ventas B2B          | Habilitado   |
    | 7     | Panel Admin         | Habilitado   |
```

### 6.4 Feature: Bob Bot — Asistente de IA

**Narrativa:**  
Como usuario de la plataforma,  
necesito un asistente inteligente que responda mis preguntas sobre el marketplace  
para obtener ayuda sin esperar a soporte humano.

**Escenario: Consulta con Gemini API activa**  
Dado que tengo una clave API de Google AI Studio configurada en mi perfil  
Y estoy viendo una publicación del feed sobre "Promoción de Tacos 2x1"  
Cuando le pregunto a Bob "¿Cuál es el horario de esta promoción?"  
Entonces Bob muestra un indicador de carga "Consultando Bob Bot..."  
And tras 1-3 segundos muestra la respuesta contextualizada en español  
And la respuesta incluye información relevante del post  

**Escenario: Fallback algorítmico sin API**  
Dado que no tengo clave API de Gemini configurada  
Cuando le pregunto a Bob "¿Cómo puedo publicar un producto?"  
Entonces Bob responde con su motor algorítmico local  
And la respuesta contiene instrucciones útiles predefinidas  
And no se muestra ningún error de API al usuario  

### 6.5 Feature: Dashboard de Repartidor

**Narrativa:**  
Como repartidor (Nivel 2.8),  
necesito ver los pedidos asignados en un mapa en vivo  
para optimizar mis rutas de entrega y actualizar el estado de cada pedido.

**Escenario: Flujo de entrega completo**  
Dado que estoy autenticado como repartidor con 3 pedidos asignados  
Cuando abro el Dashboard de Entregas  
Entonces veo los 3 pedidos listados con dirección, productos y monto  
And el mapa Leaflet muestra los 3 puntos de entrega marcados  
Cuando selecciono el pedido #001 y presiono "En camino"  
Entonces el estado cambia a "En tránsito" y el comprador recibe notificación  
Cuando llego al destino y presiono "Entregado"  
Entonces el pedido se marca como completado en Firestore  
And mi comisión se calcula y registra automáticamente  

---

*Documento BDD actualizado: 2026-05-23*  
*Próxima revisión programada: 2026-06-23*  