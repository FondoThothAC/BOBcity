# Domain Events Catalog

## Events within CivicSimulation Context

### SimulacionIniciada
```json
{
  "eventId": "evt-sim-001",
  "aggregateId": "sim-hermosillo-2027",
  "type": "SimulacionIniciada",
  "timestamp": "2026-05-17T10:00:00Z",
  "payload": {
    "territorioId": "26-019",
    "horizonteAnios": 10,
    "politicasAplicadas": ["subsidio-transporte-001"],
    "poblacionTotalAgentes": 945000
  }
}
```

### EstadoAgenteActualizado
```json
{
  "eventId": "evt-sim-002",
  "aggregateId": "sim-hermosillo-2027",
  "type": "EstadoAgenteActualizado",
  "timestamp": "2026-05-17T10:01:00Z",
  "payload": {
    "agenteSectorId": "sec-joven-gig-001",
    "mesSimulacion": 6,
    "felicidadAnterior": 45,
    "felicidadNueva": 52,
    "delta": 7,
    "causa": "aplicacion_politica_subsidio_transporte"
  }
}
```

### EscenarioElectoralProyectado
```json
{
  "eventId": "evt-sim-003",
  "aggregateId": "sim-hermosillo-2027",
  "type": "EscenarioElectoralProyectado",
  "timestamp": "2026-05-17T10:05:00Z",
  "payload": {
    "candidatoId": "cand-001",
    "probabilidadVictoria": 0.67,
    "votosEsperadosPct": 43.2,
    "intervaloConfianza": [38.5, 47.9],
    "driversPrincipales": ["experiencia_seguridad", "match_propuesta_jovenes"]
  }
}
```

## Events within CivicOrchestration Context

### FlujoAgenteIniciado
```json
{
  "eventId": "evt-orch-001",
  "aggregateId": "flujo-obp-001",
  "type": "FlujoAgenteIniciado",
  "timestamp": "2026-05-17T11:00:00Z",
  "payload": {
    "flujoId": "flujo-obp-001",
    "agenteId": "agent-collector",
    "skillInvocado": "collect_civic_data",
    "tierAsignado": 2
  }
}
```

### SkillEjecutado
```json
{
  "eventId": "evt-orch-002",
  "aggregateId": "flujo-obp-001",
  "type": "SkillEjecutado",
  "timestamp": "2026-05-17T11:02:00Z",
  "payload": {
    "agenteId": "agent-analyzer",
    "skill": "analyze_pain_points",
    "inputTokens": 2048,
    "outputTokens": 512,
    "modeloUsado": "qwen-72b-local",
    "tiempoEjecucionMs": 3400,
    "resultadoHash": "a3f5c2..."
  }
}
```

### LedgerAuditoriaGenerado
```json
{
  "eventId": "evt-sec-001",
  "aggregateId": "flujo-obp-001",
  "type": "LedgerAuditoriaGenerado",
  "timestamp": "2026-05-17T11:05:00Z",
  "payload": {
    "ledgerId": "led-001",
    "hashOperacion": "sha256:9f86d0...",
    "conformidad": ["GDPR", "LGPD"],
    "datosSensibles": false,
    "nivelRiesgo": "bajo"
  }
}
```

### ExportacionOBPCompletada
```json
{
  "eventId": "evt-int-001",
  "aggregateId": "flujo-obp-001",
  "type": "ExportacionOBPCompletada",
  "timestamp": "2026-05-17T11:06:00Z",
  "payload": {
    "flujoId": "flujo-obp-001",
    "obpPlanId": "bp-2027-001",
    "payloadSizeBytes": 45032,
    "mtlsValidado": true,
    "endpoint": "https://obp.local/api/v2.5.12.3/ingest"
  }
}
```
