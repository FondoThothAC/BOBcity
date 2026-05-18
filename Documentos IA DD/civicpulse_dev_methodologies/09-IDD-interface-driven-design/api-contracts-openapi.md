# API Contracts - CivicPulse (OpenAPI 3.0)

## Base URL
- Development: `https://api.civicpulse.local/v1`
- Staging: `https://api-staging.civicpulse.io/v1`
- Production: `https://api.civicpulse.io/v1`

## Authentication
All endpoints require Bearer token (JWT) except `/health` and `/docs`.
```
Authorization: Bearer <jwt_token>
```

## Common Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-05-17T10:00:00Z",
    "requestId": "req-uuid",
    "version": "v1.2.3"
  },
  "error": null
}
```

## Error Format
```json
{
  "success": false,
  "data": null,
  "meta": { ... },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid territory ID format",
    "details": [
      { "field": "territorioId", "issue": "Must match pattern ^\d{2}-\d{3}$" }
    ]
  }
}
```

---

## Endpoints

### Territorios

#### GET /territorios
Listar territorios disponibles.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| tipo | string | No | Filter by type: `distrito`, `municipio`, `entidad` |
| entidadId | string | No | Filter by parent entity |
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Items per page (default: 20, max: 100) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "26-019",
        "tipo": "municipio",
        "nombre": "Hermosillo",
        "entidadId": "26",
        "nombreEntidad": "Sonora",
        "poblacion": 936263,
        "indicadores": {
          "pobrezaPct": 28.5,
          "tasaHomicidios": 18.3,
          "desercionEscolarPct": 12.1
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2460,
      "pages": 123
    }
  }
}
```

#### GET /territorios/{id}
Obtener detalle de un territorio.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | CVEGEO or INE key |

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "26-019",
    "tipo": "municipio",
    "nombre": "Hermosillo",
    "geometria": { "type": "Polygon", "coordinates": [...] },
    "indicadores": { ... },
    "historicoElectoral": [
      {
        "ciclo": 2024,
        "ganador": "MORENA",
        "votosPct": 48.2,
        "margen": 5.3
      }
    ]
  }
}
```

---

### Simulación ABM

#### POST /simulacion
Iniciar una simulación ABM.

**Request Body:**
```json
{
  "territorioId": "26-019",
  "horizonMeses": 120,
  "politicas": [
    {
      "id": "subsidio-transporte-001",
      "nombre": "Subsidio Transporte Estudiantil",
      "parametros": {
        "montoMensual": 500,
        "beneficiarios": 15000,
        "duracionMeses": 36
      }
    }
  ],
  "configuracion": {
    "sectores": ["comerciante", "joven_gig", "asalariado"],
    "semillaAleatoria": 42
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "simulacionId": "sim-uuid",
    "estado": "iniciada",
    "urlSeguimiento": "/simulacion/sim-uuid/status",
    "estimacionTiempoSegundos": 45
  }
}
```

#### GET /simulacion/{id}/status
Consultar estado de simulación.

**Response:**
```json
{
  "success": true,
  "data": {
    "simulacionId": "sim-uuid",
    "estado": "completada",  // iniciada | en_progreso | completada | fallida
    "progreso": 100,
    "mesActual": 120,
    "resultados": {
      "estadosFinales": [
        {
          "sector": "joven_gig",
          "felicidad": 58.3,
          "confianza": 42.1,
          "ingresoPromedio": 18500
        }
      ],
      "proyeccionElectoral": {
        "MORENA": 0.43,
        "PAN": 0.28,
        "MC": 0.15
      },
      "costoTotal": 120000000,
      "roiSocial": 0.78
    }
  }
}
```

---

### Predictor Electoral

#### POST /predictor/victoria
Predecir probabilidad de victoria electoral.

**Request Body:**
```json
{
  "territorioId": "26-019",
  "cargo": "gobernador",
  "candidato": {
    "nombre": "María González",
    "genero": "F",
    "edad": 45,
    "nivelEducativo": 2,
    "anosExperienciaPublica": 12,
    "anosExperienciaPrivada": 5,
    "experienciaSeguridad": true,
    "esIncumbente": false,
    "partido": "MORENA",
    "propuestas": [
      {
        "tema": "seguridad",
        "peso": 0.35,
        "especificidad": 0.8,
        "sentimiento": 0.2
      },
      {
        "tema": "economia",
        "peso": 0.25,
        "especificidad": 0.6,
        "sentimiento": 0.5
      }
    ]
  },
  "contexto": {
    "tasaHomicidios": 18.5,
    "pobrezaPct": 32.1,
    "desempleoPct": 8.3
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "probabilidadVictoria": 0.67,
    "votosEsperadosPct": 43.2,
    "intervaloConfianza": [38.5, 47.9],
    "drivers": [
      {
        "id": "experienciaSeguridad_x_tasaHomicidios",
        "descripcion": "Experiencia en seguridad en distrito violento",
        "contribucion": 0.35,
        "impacto": "+12.3%"
      },
      {
        "id": "matchPropuestaJovenes",
        "descripcion": "Match propuesta con prioridad sector joven",
        "contribucion": 0.28,
        "impacto": "+8.7%"
      },
      {
        "id": "perfilEducativo",
        "descripcion": "Nivel educativo vs analfabetismo territorial",
        "contribucion": 0.15,
        "impacto": "+4.2%"
      }
    ],
    "advertencias": [
      "Incumbente del mismo partido tiene aprobación baja (32%)"
    ]
  }
}
```

#### POST /predictor/explain
Obtener explicabilidad detallada de una predicción.

**Request Body:** Same as /predictor/victoria

**Response:**
```json
{
  "success": true,
  "data": {
    "contribucionPerfil": 0.40,
    "contribucionContexto": 0.35,
    "contribucionDinamica": 0.25,
    "shapValues": [
      {"feature": "experienciaSeguridad", "value": 0.15},
      {"feature": "tasaHomicidios", "value": -0.08},
      {"feature": "matchSeguridad", "value": 0.22}
    ],
    "counterfactuals": [
      "Si candidato NO tuviera experiencia en seguridad: probabilidad = 52%",
      "Si tasa de homicidios fuera <10: probabilidad = 58%"
    ]
  }
}
```

---

### Orquestador

#### POST /orquestador/ejecutar
Ejecutar flujo multi-agente.

**Request Body:**
```json
{
  "iniciativa": {
    "tipo": "predefinida",  // predefinida | personalizada
    "id": "crisis-agua-d8",
    "promptPersonalizado": null
  },
  "configuracion": {
    "tierHardware": 2,
    "modeloLLM": "qwen-72b",
    "maxTiempoSegundos": 300,
    "incluirAuditoria": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "flujoId": "flujo-uuid",
    "estado": "ejecutando",
    "agentes": [
      {"id": "super", "estado": "completado", "progreso": 100},
      {"id": "collector", "estado": "completado", "progreso": 100},
      {"id": "analyzer", "estado": "activo", "progreso": 67}
    ],
    "logsUrl": "/orquestador/flujo-uuid/logs",
    "ledgerUrl": "/orquestador/flujo-uuid/ledger"
  }
}
```

#### GET /orquestador/{flujoId}/logs
Obtener logs en tiempo real (SSE - Server-Sent Events).

**Headers:**
```
Accept: text/event-stream
```

**Event Stream:**
```
event: log
data: {"timestamp":"10:00:15","agent":"Analyzer","message":"Clustering complete","type":"success"}

event: progress
data: {"agent":"Analyzer","progreso":75}

event: complete
data: {"flujoId":"flujo-uuid","estado":"completado"}
```

---

### Open Business Plan Integration

#### POST /obp/export
Exportar resultado a Open Business Plan.

**Request Body:**
```json
{
  "flujoId": "flujo-uuid",
  "formato": "json",  // json | pdf | markdown
  "incluirAnexos": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "obpPlanId": "bp-2027-001",
    "urlConfirmacion": "https://obp.local/plans/bp-2027-001",
    "payloadResumen": {
      "titulo": "Plan de Intervención Cívica - Hermosillo D8",
      "presupuestoTotal": 45200000,
      "horizonteMeses": 36,
      "fases": [
        {"fase": 1, "nombre": "Diagnóstico y movilización", "duracion": 3, "presupuesto": 5000000},
        {"fase": 2, "nombre": "Implementación infraestructura", "duracion": 18, "presupuesto": 35000000},
        {"fase": 3, "nombre": "Evaluación y escalamiento", "duracion": 15, "presupuesto": 5200000}
      ]
    }
  }
}
```

---

### Webhooks

#### POST /webhooks/obp/confirmacion
Webhook para confirmaciones de OBP.

**Request Body:**
```json
{
  "obpPlanId": "bp-2027-001",
  "estado": "aceptado",  // aceptado | rechazado | modificado
  "comentarios": "Presupuesto ajustado -15%",
  "timestamp": "2026-05-17T11:30:00Z",
  "firma": "hmac-sha256=..."
}
```

**Response:**
```json
{"success": true}
```
