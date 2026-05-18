# Security Architecture - CivicPulse

## Zero Trust Architecture Principles

### 1. Never Trust, Always Verify
- Cada solicitud, incluso interna, requiere autenticación
- Tokens JWT con tiempo de vida máximo 15 minutos
- Refresh tokens rotan en cada uso

### 2. Least Privilege Access
- Roles:
  - `ciudadano`: Solo lectura de datos agregados, encuestas
  - `analista`: Lectura + simulación ABM, no exportación
  - `estratega`: Todo lo anterior + predictor + exportación OBP
  - `admin`: Gestión de usuarios, no acceso a datos crudos
  - `devops`: Infraestructura, no acceso a datos de negocio

### 3. Assume Breach
- Segmentación de red: Frontend / API / Data / ML en VLANs separadas
- Honeypots en red interna
- Respuesta automática: bloqueo de IP + alerta SIEM

## Encryption Strategy

### En Tránsito (In Transit)
| Ruta | Protocolo | Cipher Suite |
|------|-----------|--------------|
| Cliente → Frontend | HTTPS | TLS 1.3 + AES-256-GCM |
| Frontend → API | HTTPS | TLS 1.3 + CHACHA20-POLY1305 |
| API → Database | TLS | TLS 1.3 + AES-256-GCM |
| API → OBP | mTLS | Mutual TLS 1.3 + Ed25519 |
| Tier 2 → Tier 3 | VPN/IPSec | AES-256-GCM + SHA-384 |

### En Reposo (At Rest)
| Dato | Método | Key Management |
|------|--------|----------------|
| Datos INE/INEGI crudos | AES-256-GCM | HSM (Hardware Security Module) |
| Perfiles de candidatos | AES-256-GCM + campo-level encryption | HashiCorp Vault |
| Logs de auditoría | Firmado Ed25519 | Clave privada en HSM |
| Backups | AES-256-GCM + compresión | Claves rotadas mensualmente |

## Privacy-Enhancing Technologies (PETs)

### 1. Differential Privacy
```python
# Implementación para mapas de calor
import numpy as np

def add_laplace_noise(value, epsilon=1.0, sensitivity=1.0):
    scale = sensitivity / epsilon
    noise = np.random.laplace(0, scale)
    return value + noise

# Uso: antes de enviar datos agregados al frontend
poblacion_real = 847
poblacion_anonima = add_laplace_noise(poblacion_real, epsilon=0.5)
```

### 2. Zero-Knowledge Proofs (ZKP) - Fase 2
- Ciudadano prueba que es mayor de edad sin revelar fecha exacta
- Ciudadano prueba residencia en territorio sin revelar dirección exacta
- Implementación: zk-SNARKs con circom/snarkjs

### 3. Synthetic Data Generation
- Datos censales reales → modelo generativo → población sintética
- Garantiza privacidad absoluta (no hay individuos reales)
- Valida que distribuciones marginales coincidan con reales (KS-test)

## Incident Response Plan

### Fases
1. **Detección**: SIEM alerta + honeypot trigger
2. **Contención**: Aislar segmento de red afectado
3. **Eradicación**: Eliminar vector de ataque
4. **Recuperación**: Restaurar desde backup firmado
5. **Lecciones**: Post-mortem en 48h, actualizar threat model
