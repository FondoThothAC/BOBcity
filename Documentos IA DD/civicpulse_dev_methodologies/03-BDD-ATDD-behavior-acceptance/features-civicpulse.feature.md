# BDD / ATDD Feature Files - CivicPulse

## Feature 1: Mapa de Puntos de Dolor
```gherkin
Feature: Visualización de Mapa de Calor de Puntos de Dolor
  Como estratega político
  Quiero ver geográficamente los sectores críticos de mi territorio
  Para priorizar intervenciones y ajustar propuestas de campaña

  Background:
    Given el territorio "Hermosillo, Sonora" está cargado en el sistema
    And los datos INEGI/ENCIG están sincronizados

  @ui @mapa @mvp
  Scenario: Filtrar puntos de dolor por categoría
    Given estoy en el dashboard principal
    When selecciono el filtro "Seguridad"
    Then el mapa debe mostrar solo capas de seguridad
    And las zonas con tasa de homicidios >15 deben aparecer en rojo intenso
    And el tooltip debe mostrar "Colonia: Palo Verde | Homicidios: 23.4 | Prioridad: CRÍTICA"

  @ui @mapa @mvp
  Scenario: Superposición de múltiples capas
    Given estoy viendo la capa "Seguridad"
    When activo la capa "Economía"
    Then ambas capas deben renderizarse con transparencia
    And las zonas con alta seguridad + baja economía deben mostrar gradiente naranja

  @api @performance
  Scenario: Carga de mapa bajo 2 segundos
    When solicito el mapa con 5 capas activas
    Then la respuesta debe completarse en menos de 2000ms
    And el payload GeoJSON no debe exceder 2MB
```

## Feature 2: Simulación ABM
```gherkin
Feature: Sandbox de Simulación de Políticas Públicas
  Como analista de políticas públicas
  Quiero simular el impacto de una propuesta antes de implementarla
  Para estimar costos, beneficios y efectos electorales

  Background:
    Given el Gemelo Digital de "Hermosillo" está calibrado con datos 2024
    And la simulación tiene 3 sectores poblacionales activos

  @simulacion @abm @mvp
  Scenario: Simular subsidio al transporte estudiantil
    Given la felicidad base del sector "joven_gig" es 45
    When aplico la política "Subsidio Transporte Estudiantil"
    And configuro horizonte a 5 años
    Then tras 12 meses la felicidad debe aumentar >10 puntos
    And tras 60 meses el costo acumulado debe ser ~$120M MXN
    And la intención de voto hacia el partido proponente debe subir >5%

  @simulacion @abm @regresion
  Scenario: Calibración contra histórico 2024
    Given cargo configuración histórica de elección 2024
    When ejecuto simulación hasta mes de elección
    Then el ganador predicho debe coincidir con resultado histórico
    And el margen de error debe ser <5%

  @simulacion @abm @edge
  Scenario: Crisis social por felicidad sostenida baja
    Given configuro política que reduce felicidad -5 mensual
    When ejecuto 10 meses consecutivos
    Then al mes 6 el sistema debe activar alerta "Crisis Social"
    And la confianza institucional debe caer >20%
    And el voto nulo/abstención debe incrementarse >15%
```

## Feature 3: Predictor Electoral
```gherkin
Feature: Predicción de Probabilidad Electoral
  Como director de campaña
  Quiero evaluar la viabilidad de mi candidato en un distrito específico
  Para optimizar asignación de recursos y mensajes

  Background:
    Given el modelo predictivo está entrenado con datos 2018-2024
    And el territorio tiene variables sociodemográficas actualizadas

  @predictor @ml @mvp
  Scenario: Evaluar candidato con experiencia en seguridad en distrito violento
    Given el distrito tiene tasa de homicidios 18.5 por 100k
    And mi candidato tiene "experienciaSeguridad" = true
    When solicito predicción de victoria
    Then la probabilidad debe ser >60%
    And el driver principal debe ser "experienciaSeguridad_x_tasaHomicidios"
    And el sistema debe explicar: "+12.3% por match seguridad-contexto"

  @predictor @ml @mvp
  Scenario: Penalización por incumbencia en zonas de pobreza alta
    Given el distrito tiene pobreza >40%
    And mi candidato es incumbente
    When solicito predicción de victoria
    Then la probabilidad debe aplicar factor 0.85
    And la explicación debe incluir "Efecto castigo incumbente en contexto pobreza"

  @predictor @ml @explainability
  Scenario: Transparencia en predicción (XAI)
    Given solicito predicción para cualquier candidato
    Then el resultado debe incluir desglose porcentual de drivers
    And la suma de contribuciones debe ser 100%
    And debe haber un gráfico de importancia de variables
```

## Feature 4: Orquestador Multi-Agente
```gherkin
Feature: Orquestación de Flujos Multi-Agente
  Como usuario de CivicPulse
  Quiero que el sistema coordine automáticamente agentes especializados
  Para generar informes completos sin intervención manual

  Background:
    Given el Orquestador OpenClaw está en estado "idle"
    And los 6 agentes especializados están registrados

  @orquestador @swarm @mvp
  Scenario: Ejecutar flujo completo de análisis cívico
    Given selecciono la iniciativa "Crisis de Agua en Palo Verde - D8"
    When presiono "Ejecutar Flujo de Agentes"
    Then el Super Agente debe activarse
    And secuencialmente debe ejecutarse: Collector → Analyzer → Simulator → Recommender → Integrator
    And cada agente debe completarse en <60 segundos
    And el ledger de auditoría debe registrar cada paso con hash SHA-256

  @orquestador @swarm @obp
  Scenario: Exportar a Open Business Plan
    Given el flujo de agentes completó con éxito
    When presiono "Exportar a Open Business Plan"
    Then debe generarse payload JSON válido
    And la conexión mTLS debe validarse
    And OBP debe confirmar recepción con planId generado
    And el modal debe mostrar "Roadmap de 3 fases creado exitosamente"

  @orquestador @swarm @privacidad
  Scenario: Auditoría local-first de privacidad
    Given ejecuto cualquier flujo de agentes
    When el flujo accede a datos de INEGI
    Then el ledger debe marcar "datosSensibles: true"
    And debe aparecer sello de conformidad "LGPD" y "GDPR"
    And los datos crudos NO deben aparecer en logs de nivel INFO
```

## Feature 5: Privacidad y Seguridad Local-First
```gherkin
Feature: Protección de Datos Electorales y Cívicos
  Como ciudadano y operador del sistema
  Quiero garantizar que mis datos sensibles nunca salgan del entorno local
  Para cumplir con normativas y proteger la democracia

  @seguridad @privacidad @critico
  Scenario: Procesamiento local de datos INE
    Given cargo datos de resultados electorales a nivel precintal
    When el sistema procesa estos datos
    Then todo el procesamiento debe ocurrir en Tier 2 o 3
    And ningún dato individual debe enviarse a APIs de terceros
    And el hash de auditoría debe certificar procesamiento local

  @seguridad @privacidad @critico
  Scenario: Consentimiento granular del ciudadano
    Given un ciudadano registra su perfil
    When configura preferencias de privacidad
    Then solo los datos autorizados deben usarse para análisis
    And los datos no autorizados deben quedar encriptados en reposo
    And el ciudadano debe poder revocar consentimiento en cualquier momento

  @seguridad @privacidad @critico
  Scenario: Anonimización diferencial en mapas de calor
    Given genero un mapa de calor de ingresos por colonia
    When el mapa tiene <1000 habitantes en una zona
    Then el sistema debe aplicar ruido Laplaciano (ε ≤ 1.0)
    And debe mostrar advertencia: "Datos anonimizados - puede haber variación"
```
