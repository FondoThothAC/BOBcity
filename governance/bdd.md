# 📋 Gobernanza BDD: Especificaciones de Comportamiento (Gherkin)

Este documento contiene los escenarios de aceptación y comportamiento esperados para el orquestador **OpenClaw** y la plataforma **CivicPulse**. Sirven como base para las suites de pruebas Cypress/Playwright y Jest.

---

## 1. Escenario Principal: Simulación Cívica y Plan de Acción (UxDD / PDD)

```gherkin
Feature: Simulación de Iniciativas Cívicas en Hermosillo
  Como estratega gubernamental u organizador cívico
  Quiero simular el impacto social de una política pública
  Para generar un plan de acción viable y exportarlo a Open Business Plan

  Scenario: Ejecución exitosa de enjambre de agentes locales
    Given el usuario navega a la pestaña "Orquestador OpenClaw"
    And selecciona la iniciativa "Crisis de Agua en Palo Verde - D8"
    When hace clic en el botón "Ejecutar Flujo de Agentes"
    Then el orquestador inicia la inferencia local de Ollama (Qwen2.5)
    And la topología de red muestra de manera interactiva la activación secuencial de los agentes:
      | Agent Node      | Expected Action |
      | orchestrator    | Inicialización  |
      | data_collector  | Consulta INEGI  |
      | profile_builder | Análisis        |
      | simulator       | ABM Dinámica    |
      | policy_designer | Recomendaciones |
      | obp_connector   | Exportación     |
    And la terminal de logs muestra salidas paso a paso en tiempo real
    And el libro de auditoría criptográfica registra hashes inmutables por cada agente completado
    And se despliega la tarjeta "Plan de Ataque y Desarrollo" con presupuesto y fases
    And el botón "Exportar a Open Business Plan" está activo
```

---

## 2. Escenario: Integración Directa Local-First (CDD / SDD)

```gherkin
Feature: Integración mTLS con Open Business Plan (OBP)
  Como administrador del sistema CivicPulse
  Quiero transferir la recomendación del enjambre a OBP de forma segura
  Para evitar fugas de datos y acelerar el plan de negocios

  Scenario: Inyección segura de payload
    Given un flujo de simulación completado exitosamente
    And el modal "Exportar a OBP" está abierto
    When el usuario confirma la exportación local
    Then la aplicación realiza un canal seguro mTLS a http://localhost:8443/obp-webhook
    And se muestra un indicador de carga reactivo "Transfiriendo a OBP..."
    And el servidor recibe el JSON con estructura validada por Zod
    And se muestra el mensaje de confirmación "¡Integración Exitosa!"
    And el log de auditoría local almacena el identificador de sesión y hash del payload
```

---

## 3. Escenario: Garantía de Privacidad y Cumplimiento (SDD)

```gherkin
Feature: Privacidad Absoluta Zero-Trust (Local-First)
  Como ciudadano o regulador de datos
  Quiero asegurar que la información demográfica no salga del hardware local
  Para cumplir estrictamente con la LGPD y el Reglamento General de Protección de Datos

  Scenario: Detección y bloqueo de transmisiones externas
    Given datos demográficos locales cargados en la memoria del navegador
    When ejecuto un flujo de simulación de 10,000 agentes sintéticos
    Then no se debe emitir ninguna solicitud de red HTTP/HTTPS externa (fuera de localhost)
    And los logs criptográficos deben certificar cumplimiento "LGPD-Local"
    And las bases vectoriales locales e índices demográficos permanecen cifrados en reposo
```
