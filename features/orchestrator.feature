# features/orchestrator.feature
# language: es
Característica: Orquestación de Soluciones Cívicas en CívicaOS
  Como estratega o analista político del municipio
  Quiero simular el enjambre de agentes locales
  Para predecir el impacto de políticas de agua y transporte y exportar planes a OBP

  Escenario: Ejecución de flujo de agentes para crisis de agua en Palo Verde
    Dado que el usuario abre la plataforma CivicPulse
    Y navega a la pestaña "Orquestador OpenClaw"
    Cuando selecciona la iniciativa "Crisis de Agua en Palo Verde - D8"
    Y presiona el botón "Ejecutar Flujo de Agentes"
    Entonces el orquestador activa secuencialmente los nodos de agentes:
      | Agent Node      |
      | orchestrator    |
      | data_collector  |
      | profile_builder |
      | simulator       |
      | policy_designer |
      | obp_connector   |
    Y la terminal muestra logs de inferencia asíncronos
    And el ledger de auditoría genera hashes SHA-256 válidos para cada nodo completado
    Y se muestra la recomendación de fases del "Plan de Ataque"
    Y el botón "Exportar a Open Business Plan" queda disponible
