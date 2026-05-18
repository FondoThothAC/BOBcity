# BDD — Behavior Driven Development
# CivicPulse / CívicaOS
# Framework: Cucumber + Playwright
# Ejecutar: npx cucumber-js features/civicpulse/
#
# Filosofía BDD:
#   Lenguaje ubicuo compartido entre negocio, ciudadanía y desarrollo.
#   Cada escenario describe un comportamiento observable del sistema,
#   no una implementación interna.

# ══════════════════════════════════════════════════════════════════
# FEATURE 1: Orquestador OpenClaw — Flujo de Análisis Cívico
# ══════════════════════════════════════════════════════════════════
Feature: Orquestador OpenClaw ejecuta análisis cívico multi-agente
  Como estratega político o funcionario municipal
  Quiero lanzar un flujo de análisis sobre una iniciativa cívica
  Para recibir un diagnóstico y plan de acción basado en datos reales

  Background:
    Given el sistema CivicPulse está corriendo localmente en el puerto 3335
    And los modelos Ollama están disponibles (Qwen2.5 o Mistral 7B)
    And los datos del INE y INEGI para Hermosillo, Sonora están cargados

  Scenario: Análisis exitoso de crisis de agua en Palo Verde D8
    Given el usuario selecciona la iniciativa "Crisis de Agua en Palo Verde - D8"
    When el usuario hace clic en "Ejecutar Flujo de Agentes"
    Then el agente "Data Collector" debe completarse en menos de 30 segundos
    And el agente "Analyzer" debe detectar al menos 3 puntos de dolor georreferenciados
    And el agente "Simulator" debe generar un escenario ABM con 1000+ agentes sintéticos
    And el reporte final debe incluir una sección "Recomendaciones de Política"
    And el registro de auditoría local debe mostrar un hash SHA-256 único

  Scenario: Análisis de movilidad estudiantil en Distrito 6
    Given el usuario escribe en el campo de texto "Subsidio de transporte universitario D6"
    When el usuario hace clic en "Ejecutar Flujo de Agentes"
    Then el simulador ABM debe proyectar impacto a 1, 5 y 10 años
    And la intención de voto proyectada debe cambiar al menos 5 puntos porcentuales
    And el sistema debe sugerir conexión con "Open Business Plan" al finalizar

  Scenario: El sistema rechaza prompts sin datos territoriales suficientes
    Given el usuario escribe "analizar México completo en tiempo real"
    When el usuario hace clic en "Ejecutar Flujo de Agentes"
    Then el sistema debe mostrar advertencia "Datos insuficientes para resolución nacional en Nivel 1"
    And debe sugerir reducir el alcance a municipio o distrito
    And el flujo no debe iniciar la simulación ABM

  Scenario Outline: Tiempos de respuesta por nivel de hardware
    Given el sistema está ejecutándose en hardware "<nivel>"
    And la iniciativa tiene "<agentes>" agentes sintéticos
    When el flujo completo de orquestación se ejecuta
    Then el tiempo total debe ser menor a "<tiempo_max>" segundos

    Examples:
      | nivel         | agentes | tiempo_max |
      | Mac Mini M4   | 1000    | 120        |
      | DGX Spark     | 10000   | 60         |
      | H100 Server   | 100000  | 90         |

# ══════════════════════════════════════════════════════════════════
# FEATURE 2: Mapa de Calor de Puntos de Dolor Ciudadano
# ══════════════════════════════════════════════════════════════════
Feature: Mapa de calor muestra distribución territorial del descontento
  Como analista cívico
  Quiero visualizar en un mapa interactivo dónde se concentran los problemas ciudadanos
  Para priorizar intervenciones políticas con evidencia geográfica

  Scenario: Visualización de capa de seguridad en Hermosillo
    Given el usuario está en la sección "Mapas de Dolor"
    When el usuario activa el filtro "Seguridad"
    Then el mapa debe mostrar zonas en rojo con intensidad proporcional a los reportes
    And al hacer clic en una zona debe mostrar el número de reportes y principales quejas
    And debe existir al menos una zona de alta densidad en el área centro-norte

  Scenario: Superposición de múltiples capas de dolor
    Given el usuario activa los filtros "Agua" y "Economía" simultáneamente
    When el mapa se actualiza
    Then las zonas con ambos problemas deben mostrarse con un color diferente (intersección)
    And el sistema debe mostrar un índice de correlación entre capas

  Scenario: Exportación de datos del mapa
    Given hay datos de puntos de dolor cargados para al menos 3 colonias
    When el usuario hace clic en "Exportar datos GeoJSON"
    Then debe descargarse un archivo válido en formato GeoJSON
    And el archivo debe incluir propiedades: colonia, tipo_dolor, intensidad, fecha

# ══════════════════════════════════════════════════════════════════
# FEATURE 3: Predictor Electoral
# ══════════════════════════════════════════════════════════════════
Feature: Predictor Electoral calcula probabilidad de victoria por perfil y distrito
  Como consultor político o inversor en tecnología cívica
  Quiero simular un duelo entre candidatos en un distrito específico
  Para evaluar viabilidad electoral con base en datos históricos

  Scenario: Duelo entre perfiles contrastantes en Distrito 8 Hermosillo
    Given el usuario crea un candidato "A" con sector "seguridad pública" y experiencia "8 años gobierno"
    And el usuario crea un candidato "B" con sector "empresarial" y experiencia "sin cargo previo"
    And el distrito seleccionado es "D8 - Palo Verde / Modelo"
    When el usuario ejecuta "Calcular probabilidad de victoria"
    Then el sistema debe mostrar un porcentaje de probabilidad para cada candidato
    And la suma de probabilidades de A y B debe ser 100%
    And debe mostrarse el factor dominante que determina el resultado

  Scenario: Predictor usa datos históricos del PREP para calibrar modelo
    Given el sistema tiene cargados los resultados del PREP 2021 y 2024 para Sonora
    When el predictor calcula probabilidades para el D8
    Then el modelo debe reportar su margen de error estimado
    And debe mostrar los 3 factores contextuales más influyentes del distrito

  Scenario: Alerta cuando un candidato tiene perfil sin precedente histórico
    Given el usuario crea un candidato con todos los atributos en valores extremos
    When el sistema calcula la probabilidad
    Then debe mostrar una advertencia "Perfil atípico: baja confianza estadística"
    And debe mostrar el intervalo de confianza del resultado

# ══════════════════════════════════════════════════════════════════
# FEATURE 4: Auditoría Local y Privacidad
# ══════════════════════════════════════════════════════════════════
Feature: Sistema garantiza privacidad local-first y auditoría transparente
  Como ciudadano o regulador
  Quiero verificar que mis datos no salen del dispositivo local
  Para confiar en que el sistema respeta la normativa LGPD/GDPR

  Scenario: Todos los registros de inferencia quedan en el audit log local
    Given el usuario ejecuta un flujo de análisis completo
    When el análisis termina
    Then el registro de auditoría debe contener al menos 6 entradas (una por agente)
    And cada entrada debe tener: timestamp, agente, acción, hash_SHA256, estado_local=true
    And ningún registro debe mostrar llamadas a APIs externas durante el proceso

  Scenario: Hash criptográfico es único e irrepetible por sesión
    Given el usuario ejecuta el mismo análisis dos veces
    When se comparan los registros de auditoría de ambas sesiones
    Then los hashes SHA-256 deben ser diferentes en cada sesión
    And el timestamp debe reflejar el tiempo real de procesamiento

  Scenario: Exportación a Open Business Plan es explícita y consentida
    Given el análisis ha finalizado y el reporte está listo
    When el usuario hace clic en "Exportar a Open Business Plan"
    Then debe mostrarse un modal con el contenido exacto del payload JSON a enviar
    And el usuario debe confirmar explícitamente antes de la transferencia
    And el audit log debe registrar el evento de exportación con consentimiento=true
