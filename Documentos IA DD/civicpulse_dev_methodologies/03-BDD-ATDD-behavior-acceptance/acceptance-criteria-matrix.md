# Acceptance Criteria Matrix - CivicPulse MVP

## Criterios de Aceptación por Módulo

### Módulo: Dashboard Principal
| ID | Criterio | Prioridad | Método Verificación |
|----|----------|-----------|---------------------|
| AC-DASH-01 | Carga inicial <3s | Must | Lighthouse performance audit |
| AC-DASH-02 | Indicadores macro actualizados en tiempo real | Must | Test WebSocket / polling |
| AC-DASH-03 | Diseño responsive (mobile/desktop) | Must | Chrome DevTools device emulation |
| AC-DASH-04 | Modo oscuro por defecto | Should | Visual regression test |

### Módulo: Mapa de Puntos de Dolor
| ID | Criterio | Prioridad | Método Verificación |
|----|----------|-----------|---------------------|
| AC-MAP-01 | Renderizado de 5 capas simultáneas <2s | Must | Cypress/Playwright timer |
| AC-MAP-02 | Precisión geográfica ±50m | Must | Comparación contra Google Maps |
| AC-MAP-03 | Tooltip con datos al hover <200ms | Must | Performance profiling |
| AC-MAP-04 | Exportar capa a GeoJSON/CSV | Should | File download + schema validation |

### Módulo: ABM Simulator
| ID | Criterio | Prioridad | Método Verificación |
|----|----------|-----------|---------------------|
| AC-ABM-01 | Simulación 10 años en <5s | Must | pytest benchmark |
| AC-ABM-02 | Reproducir histórico 2024 con <5% error | Must | Comparación datos INE |
| AC-ABM-03 | 3 sectores poblacionales mínimo | Must | Unit test count |
| AC-ABM-04 | Slider de política actualiza gráficas en <500ms | Should | React Testing Library |

### Módulo: Predictor Electoral
| ID | Criterio | Prioridad | Método Verificación |
|----|----------|-----------|---------------------|
| AC-PRED-01 | Probabilidad de victoria 0-1 | Must | Schema validation |
| AC-PRED-02 | Explicabilidad (top 3 drivers) | Must | Unit test response structure |
| AC-PRED-03 | Intervalo de confianza válido | Must | Math assertion |
| AC-PRED-04 | API responde <500ms | Must | k6 load test |

### Módulo: Orquestador OpenClaw
| ID | Criterio | Prioridad | Método Verificación |
|----|----------|-----------|---------------------|
| AC-ORCH-01 | 6 agentes ejecutan secuencialmente | Must | Integration test |
| AC-ORCH-02 | Ledger auditoría con SHA-256 por paso | Must | Hash verification |
| AC-ORCH-03 | Exportación OBP con mTLS | Must | SSL handshake test |
| AC-ORCH-04 | Timeout por agente <300s | Must | Timeout assertion |
| AC-ORCH-05 | Reset limpia intervalos y memoria | Must | Memory leak test (Chrome DevTools) |

### Módulo: Seguridad y Privacidad
| ID | Criterio | Prioridad | Método Verificación |
|----|----------|-----------|---------------------|
| AC-SEC-01 | Datos INE/INEGI nunca salen de Tier 2+ | Must | Network traffic analysis (Wireshark) |
| AC-SEC-02 | Consentimiento granular funcional | Must | E2E test formulario |
| AC-SEC-03 | Anonimización diferencial en zonas <1000 hab | Must | Statistical test epsilon |
| AC-SEC-04 | Logs sin datos sensibles (nivel INFO) | Must | Log grep audit |
| AC-SEC-05 | mTLS en conexión OBP | Must | SSL Labs scan |
