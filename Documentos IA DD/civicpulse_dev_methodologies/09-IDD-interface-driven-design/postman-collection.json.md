# Postman Collection - CivicPulse API

```json
{
  "info": {
    "name": "CivicPulse API v1",
    "description": "Collection for testing CivicPulse API endpoints",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "item": [
    {
      "name": "Territorios",
      "item": [
        {
          "name": "List Territories",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": {
              "raw": "{{base_url}}/territorios?tipo=municipio&limit=20",
              "host": ["{{base_url}}"],
              "path": ["territorios"],
              "query": [
                {"key": "tipo", "value": "municipio"},
                {"key": "limit", "value": "20"}
              ]
            }
          }
        },
        {
          "name": "Get Territory Detail",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": {
              "raw": "{{base_url}}/territorios/26-019",
              "host": ["{{base_url}}"],
              "path": ["territorios", "26-019"]
            }
          }
        }
      ]
    },
    {
      "name": "Simulación ABM",
      "item": [
        {
          "name": "Start Simulation",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "url": {
              "raw": "{{base_url}}/simulacion",
              "host": ["{{base_url}}"],
              "path": ["simulacion"]
            },
            "body": {
              "mode": "raw",
              "raw": "{
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
}"
            }
          }
        },
        {
          "name": "Get Simulation Status",
          "request": {
            "method": "GET",
            "header": [{"key": "Authorization", "value": "Bearer {{jwt_token}}"}],
            "url": {
              "raw": "{{base_url}}/simulacion/{{simulation_id}}/status",
              "host": ["{{base_url}}"],
              "path": ["simulacion", "{{simulation_id}}", "status"]
            }
          }
        }
      ]
    },
    {
      "name": "Predictor Electoral",
      "item": [
        {
          "name": "Predict Victory",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "url": {
              "raw": "{{base_url}}/predictor/victoria",
              "host": ["{{base_url}}"],
              "path": ["predictor", "victoria"]
            },
            "body": {
              "mode": "raw",
              "raw": "{
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
      }
    ]
  },
  "contexto": {
    "tasaHomicidios": 18.5,
    "pobrezaPct": 32.1,
    "desempleoPct": 8.3
  }
}"
            }
          }
        }
      ]
    },
    {
      "name": "Orquestador",
      "item": [
        {
          "name": "Execute Flow",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "url": {
              "raw": "{{base_url}}/orquestador/ejecutar",
              "host": ["{{base_url}}"],
              "path": ["orquestador", "ejecutar"]
            },
            "body": {
              "mode": "raw",
              "raw": "{
  "iniciativa": {
    "tipo": "predefinida",
    "id": "crisis-agua-d8"
  },
  "configuracion": {
    "tierHardware": 2,
    "modeloLLM": "qwen-72b",
    "maxTiempoSegundos": 300,
    "incluirAuditoria": true
  }
}"
            }
          }
        },
        {
          "name": "Get Logs (SSE)",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Accept", "value": "text/event-stream"}
            ],
            "url": {
              "raw": "{{base_url}}/orquestador/{{flujo_id}}/logs",
              "host": ["{{base_url}}"],
              "path": ["orquestador", "{{flujo_id}}", "logs"]
            }
          }
        }
      ]
    },
    {
      "name": "OBP Integration",
      "item": [
        {
          "name": "Export to OBP",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"},
              {"key": "Content-Type", "value": "application/json"}
            ],
            "url": {
              "raw": "{{base_url}}/obp/export",
              "host": ["{{base_url}}"],
              "path": ["obp", "export"]
            },
            "body": {
              "mode": "raw",
              "raw": "{
  "flujoId": "{{flujo_id}}",
  "formato": "json",
  "incluirAnexos": true
}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {"key": "base_url", "value": "https://api.civicpulse.local/v1"},
    {"key": "jwt_token", "value": "your-jwt-token-here"},
    {"key": "simulation_id", "value": ""},
    {"key": "flujo_id", "value": ""}
  ]
}
```
