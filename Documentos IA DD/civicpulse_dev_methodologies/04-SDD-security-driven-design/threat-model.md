# Threat Model - CivicPulse / CívicaOS

## STRIDE Analysis

### S - Spoofing (Suplantación)
| Amenaza | Vector | Mitigación | Prioridad |
|---------|--------|------------|-----------|
| Suplantación de ciudadano en encuesta | Bots, cuentas falsas | Verificación INE (hash anónimo) + CAPTCHA adaptativo | Crítico |
| Suplantación de agente en orquestador | API key comprometida | mTLS + JWT con rotación cada 24h | Crítico |
| Suplantación de endpoint OBP | DNS hijacking | Certificate pinning + mTLS bidireccional | Alto |

### T - Tampering (Manipulación)
| Amenaza | Vector | Mitigación | Prioridad |
|---------|--------|------------|-----------|
| Alteración de resultados electorales históricos | Acceso a base de datos | Ledger inmutable (hash chain) + backups firmados | Crítico |
| Manipulación de parámetros ABM | Inyección de código | Input validation + sandboxing (WebAssembly) | Alto |
| Modificación de predicción en tránsito | MITM | TLS 1.3 + certificate transparency | Alto |

### R - Repudiation (Repudio)
| Amenaza | Vector | Mitigación | Prioridad |
|---------|--------|------------|-----------|
| Negación de operación por agente | Logs insuficientes | Ledger auditoría con firma digital + timestamp NTP | Crítico |
| Negación de consentimiento por ciudadano | Falta de evidencia | Consentimiento firmado digitalmente + almacenado en vault | Alto |

### I - Information Disclosure (Divulgación)
| Amenaza | Vector | Mitigación | Prioridad |
|---------|--------|------------|-----------|
| Re-identificación en mapas de calor | Datos agregados con pocos individuos | Privacidad diferencial (ε ≤ 1.0) + k-anonimato (k≥5) | Crítico |
| Fuga de perfiles de candidatos | Brecha en base de datos | Encriptación AES-256 en reposo + RBAC estricto | Crítico |
| Exposición de intención de voto individual | Correlación de datos | Agregación sectorial + nunca almacenar voto individual | Crítico |

### D - Denial of Service (Negación de Servicio)
| Amenaza | Vector | Mitigación | Prioridad |
|---------|--------|------------|-----------|
| Saturación de API predictor | DDoS | Rate limiting (100 req/min) + Cloudflare/captive | Alto |
| Bloqueo de simulación ABM | Recursos computacionales | Timeouts + colas Redis + circuit breaker | Medio |

### E - Elevation of Privilege (Escalación de Privilegios)
| Amenaza | Vector | Mitigación | Prioridad |
|---------|--------|------------|-----------|
| Usuario normal accede a datos crudos INE | RBAC mal configurado | Principio mínimo privilegio + MFA obligatorio | Crítico |
| Agente malicioso en swarm | Skill no validado | Registry de skills firmado + sandbox por agente | Alto |

## Data Flow Diagram (DFD) - Nivel 0

```
[ Ciudadano ] --(encuesta)--> [ CivicPulse Frontend ] --(HTTPS)--> [ API Gateway ]
                                                                    |
                                                                    v
[ INE/INEGI ] --(ETL seguro)--> [ Data Lake Tier 2 ] <--(mTLS)--> [ Backend Services ]
                                                                    |
                                                                    v
[ OBP ] <--(mTLS + JSON)--> [ Integration Service ] <--(gRPC)--> [ Orquestador ]
                                                                    |
                                                                    v
                                                          [ ABM Engine | Predictor | NLP ]
```

## Trust Boundaries

1. **Boundary: Internet → DMZ**
   - TLS 1.3 obligatorio
   - WAF (Web Application Firewall)
   - Rate limiting por IP

2. **Boundary: DMZ → Tier 2 (Procesamiento)**
   - mTLS con certificados cortos (24h)
   - JWT con claims de territorio y rol
   - No datos sensibles en logs

3. **Boundary: Tier 2 → Tier 3 (Data Center)**
   - VPN dedicada o red privada física
   - Acceso solo por bastion host
   - Monitoreo 24/7 con SIEM

4. **Boundary: CivicPulse → OBP**
   - mTLS bidireccional
   - Payload encriptado con clave compartida
   - Webhook con HMAC-SHA256
