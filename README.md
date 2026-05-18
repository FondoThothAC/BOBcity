# 🏛️ CivicPulse & CívicaOS Engine

**Plataforma de Inteligencia Cívica, Gemelos Digitales de la Sociedad y Modelado Social Predictivo**

[![Versión](https://img.shields.io/badge/versión-0.5.0-blue.svg)](https://github.com/civicpulse/engine)
[![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1.4-ff6b6b.svg)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776ab.svg)](https://python.org/)

---

## 📋 Tabla de Contenidos

- [Visión General](#-visión-general)
- [Características Principales](#-características-principales)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Niveles de Hardware](#-niveles-de-hardware)
- [Instalación Rápida](#-instalación-rápida)
- [Uso y Navegación](#-uso-y-navegación)
- [Componentes del Dashboard](#-componentes-del-dashboard)
- [API Endpoints](#-api-endpoints)
- [Metodologías de Desarrollo](#-metodologías-de-desarrollo)
- [Modelos Matemáticos](#-modelos-matemáticos)
- [Integración con Open Business Plan](#-integración-con-open-business-plan)
- [Despliegue en VPS](#-despliegue-en-vps)
- [Documentación Adicional](#-documentación-adicional)
- [Licencia](#-licencia)

---

## 👁️ Visión General

**CivicPulse** (potenciado por **CívicaOS Engine**) es una plataforma revolucionaria que transforma la toma de decisiones gubernamentales y corporativas mediante:

- 🔮 **Gemelos Digitales de la Sociedad**: Población sintética hiperrealista que replica el comportamiento cívico
- 🤖 **Modelado Basado en Agentes (ABM)**: Simulaciones predictivas de escenarios políticos, económicos y sociales
- 🧠 **Swarm de IA Multimodelo**: Orquestación de agentes cognitivos especializados (NemoClaw/OpenSwarm)
- 📊 **Analytics en Tiempo Real**: Dashboards ejecutivos con KPIs de felicidad, descontento e intención de voto
- 🔗 **Integración Bidireccional con OBP**: Conexión directa con Open Business Plan para convertir diagnósticos en planes de acción

A diferencia de las encuestas estáticas tradicionales, CivicPulse cierra el ciclo completo: **diagnóstico → simulación → predicción → plan de ejecución**.

---

## ✨ Características Principales

### 🎯 Para Gobiernos y Candidatos
- **Predicción Electoral**: Modelos Logit Multinomial con explicabilidad (XAI)
- **Mapas de Calor GIS**: Visualización geoespacial de dolores ciudadanos por distrito
- **Sandbox de Políticas Públicas**: Simula impacto de subsidios, infraestructura y programas sociales
- **Marca Blanca Premium**: 10 plantillas visuales personalizables para cada campaña

### 🏢 Para Corporativos y Think-Tanks
- **ROI Social**: Calcula retorno de inversión en bienestar comunitario
- **Análisis de Riesgo**: Detecta puntos de tensión social antes de que escalen
- **Roadmap Ejecutivo**: Genera planes de acción con horizonte a 1, 5 y 10 años

### 👥 Para Ciudadanos (ThothAgora)
- **Captura Anónima Segura**: Ingesta de propuestas con CURP y firma criptográfica SHA-256
- **Transparencia Radical**: Acceso público a augurios del ágora (KPIs agregados)
- **Zero-Knowledge Privacy**: Los datos sensibles nunca salen del dispositivo local

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React + Vite)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Master     │  │   Client     │  │   Citizen    │      │
│  │   Console    │  │  Dashboard   │  │  ThothAgora  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │ HTTP/REST API
┌────────────────────────────┼─────────────────────────────────┐
│                    BACKEND (Python FastAPI)                  │
│                            │                                 │
│  ┌─────────────────────────▼─────────────────────────┐      │
│  │           Agente Orquestador (Swarm)              │      │
│  └─────────────────────┬─────────────────────────────┘      │
│                        │                                    │
│    ┌───────────────────┼───────────────────┐               │
│    ▼                   ▼                   ▼               │
│ ┌──────┐          ┌──────────┐        ┌──────────┐        │
│ │ Data │          │ Simulator│        │ Stance   │        │
│ │Harvest│          │   ABM   │        │Predict   │        │
│ └──────┘          └──────────┘        └──────────┘        │
│                        │                                    │
│                        ▼                                    │
│              ┌─────────────────┐                           │
│              │  PostgreSQL DB  │                           │
│              │  (Local First)  │                           │
│              └─────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|------------|-----------|
| **Frontend** | React 18 + Vite | SPA reactiva con routing dinámico |
| **UI Components** | Lucide React + Recharts | Iconografía y visualización de datos |
| **Mapas** | Leaflet + React-Leaflet | GIS interactivo de distritos electorales |
| **Backend** | Python 3.10+ | Servidor API unificado |
| **Simulación** | Mesa / AgentPy | Motor ABM personalizado |
| **IA Local** | Ollama / llama.cpp | Inferencia de modelos GGUF cuantizados |
| **Base de Datos** | SQLite / PostgreSQL | Almacenamiento local zero-trust |
| **Seguridad** | SHA-256 + Sal Criptográfica | Firmas holográficas de datos ciudadanos |

---

## 💻 Niveles de Hardware

CivicPulse está diseñado para escalar desde laptops personales hasta clusters de datacenter:

### Nivel 1: Edge / Desarrollo (Mac Mini M4 16GB)
- **Caso de Uso**: PoC, demos, municipios pequeños (<10k habitantes)
- **Modelos**: `Qwen2.5-7B`, `Llama-3.1-8B-Instruct (Q4_K_M)`
- **Agentes**: Hasta 10,000 agentes sintéticos
- **Tiempo**: 20-40 min por reporte completo

### Nivel 2: Estación de Trabajo AI (NVIDIA DGX / GPU Server)
- **Caso de Uso**: Gobiernos estatales, partidos medianos, think-tanks
- **Modelos**: `Llama-3.3-70B (quantized)`, `Qwen2.5-32B`
- **Agentes**: Hasta 500,000 agentes
- **Tiempo**: 15-45 min por ciclo

### Nivel 3: Cluster Datacenter (4x-8x NVIDIA H100/H200)
- **Caso de Uso**: Gobiernos federales, agencias nacionales
- **Modelos**: `Llama-3.1-405B`, `Mixtral-8x22B` (precisión nativa)
- **Agentes**: 5M - 30M de agentes en tiempo real
- **Tiempo**: <5 min por simulación profunda

---

## 🚀 Instalación Rápida

### Prerrequisitos
- Node.js 18+ y npm
- Python 3.10+
- Git

### Paso 1: Clonar Repositorio
```bash
git clone https://github.com/civicpulse/engine.git
cd engine
```

### Paso 2: Instalar Dependencias Frontend
```bash
npm install
```

### Paso 3: Configurar Entorno Python
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install fastapi uvicorn mesa agentpy pandas numpy
```

### Paso 4: Iniciar Servicios
```bash
# Terminal 1: Backend API
python simulation/api_server.py

# Terminal 2: Frontend Dev Server
npm run dev
```

### Paso 5: Acceder a la Plataforma
- **Portal SaaS**: http://localhost:5173/
- **Consola Master**: http://localhost:5173/master (clave: `CIVICAOS-MASTER`)
- **Dashboard Cliente**: http://localhost:5173/client
- **Portal Ciudadano**: http://localhost:5173/citizen

---

## 🧭 Uso y Navegación

### Sistema de Enrutamiento

La aplicación segrega estrictamente tres mundos de acceso:

| Ruta | Rol | Acceso | Propósito |
|------|-----|--------|-----------|
| `/` | Visitante | Libre | Portal SaaS de presentación |
| `/master` | Administrador | Clave maestra | Provisionamiento, billing, logs Swarm |
| `/client` | Cliente | Código marca blanca | Dashboard analítico privado |
| `/citizen` | Ciudadano | Sin autenticación | Captura anónima ThothAgora |

### Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + 1` | Ir a Dashboard Overview |
| `Ctrl + 2` | Abrir Mapa de Dolores (GIS) |
| `Ctrl + 3` | Lanzar Simulador ABM |
| `Ctrl + 4` | Activar Predictor Electoral |
| `Ctrl + 5` | Mostrar Gemelo GDS-MEGA |
| `Ctrl + 6` | Ver Gráfica Social 3D |

---

## 📊 Componentes del Dashboard

### DashboardOverview.jsx
**Resumen ejecutivo de KPIs críticos**
- Población sintética total (escalada ×500 para representación real)
- Índice de Felicidad Promedio por sector (jóvenes, comerciantes, asalariados)
- Punto de dolor principal detectado (agua, seguridad, movilidad, baches)
- Probabilidad de victoria electoral (Candidato A vs B)
- Alertas críticas con recomendaciones de IA

### PainPointsMap.jsx
**Mapa interactivo GIS de distritos**
- Heatmap de dolores por sección electoral
- Capas superponibles: agua, seguridad, movilidad, economía
- Drill-down a nivel micro-predio (Geohash-9: 4.7m × 4.7m)

### ABMSimulator.jsx
**Sandbox de políticas públicas**
- Sliders interactivos: subsidio transporte, inversión en agua, seguridad
- Modelo Hegselmann-Krause de dinámica de opinión
- Proyección temporal a 1, 5 y 10 años

### PredictorEngine.jsx
**Comparador electoral head-to-head**
- Modelo Logit Multinomial con función Softmax
- Explicabilidad (XAI): desglose de utilidad por candidato
- Escenarios "What-If" en tiempo real

### GDSMegaVisualizer.jsx
**Gemelo digital de ultra-alta resolución (1024 parámetros)**
- Editor micro de agentes sintéticos individuales
- Radar de sesgos cognitivos (8 dimensiones psicológicas)
- Línea de tiempo de memorias episódicas (eventos urbanos traumáticos)
- Mecanismos de intervención masiva (paneles solares, tarifas planas, vouchers)

### ThothAgoraPortal.jsx
**Portal de ingesta ciudadana**
- Formulario seguro con validación de CURP
- Obscuramiento automático (`XXXX************XX`)
- Firma criptográfica SHA-256 con sal local
- Zero-knowledge: los datos crudos nunca abandonan el dispositivo

---

## 🔌 API Endpoints

### API de Salida: CivicPulse → Open Business Plan

**Endpoint**: `POST http://localhost:8000/api/v1/opportunities`

**Payload**:
```json
{
  "session_hash": "a4f89d3c5e2197e884b80b27e8a93e8274cf8f2e...",
  "timestamp": "2026-05-17T22:30:00Z",
  "territory_id": "HER-DIS-08",
  "pain_points": [
    { "issue": "water", "severity": 0.72, "trend": "worsening" },
    { "issue": "mobility", "severity": 0.85, "trend": "stable" }
  ],
  "target_demographics": {
    "sector": "estudiantes",
    "impacted_population": 57000,
    "current_happiness": 0.34
  },
  "recommended_civic_action": "Subsidio de Transporte Universitario...",
  "simulated_kpis": {
    "expected_happiness_improvement": "+22%",
    "projected_vote_intention_swing_candidato_A": "+6.5%"
  }
}
```

### API de Entrada: Open Business Plan → CivicPulse

**Endpoint**: `POST http://localhost:3335/api/v1/feedback`

**Payload**:
```json
{
  "plan_id": "OBP-BP-2026-004",
  "original_session_hash": "a4f89d3c5e2197e884b80b27e8a93e8274cf8f2e...",
  "business_proposal": {
    "title": "Red de Microbuses Eléctricos Universitarios",
    "capex_mdp": 85.4,
    "opex_anual_mdp": 12.0,
    "implementation_time_months": 8,
    "jobs_created": 140
  },
  "simulation_request": {
    "variables": {
      "mobility_reduction": -0.45,
      "water_impact": 0.0
    },
    "horizon_years": 5
  }
}
```

---

## 🧪 Metodologías de Desarrollo

El enjambre de agentes adopta disciplinas específicas de desarrollo de software:

```
[Prompt Inicial] 
       │
       ▼
 PDD (Prompt-Driven) ──► Generación inicial
       │
       ▼
 DDD (Domain-Driven) ──► Bounded Contexts y Entidades
       │
       ▼
 BDD (Behavior-Driven) ─► Escenarios Given/When/Then
       │
       ▼
 TDD (Test-Driven) ────► Tests unitarios antes del código
       │
       ▼
 EDD (Event-Driven) ───► Orquestación reactiva asíncrona
       │
       ▼
UXDD (User-Experience) ─► Explicabilidad (XAI) y renderizado
```

### Ejemplo BDD (Gherkin)
```gherkin
Scenario: Aplicación de Subsidio Universitario
  Given el distrito "HER-DIS-08" con descontento de movilidad de 0.70
  When se activa el evento de política "subsidy-transport-students"
  Then la felicidad del sector "estudiantes" debe aumentar al menos 15%
  And la intención de voto hacia el Candidato A debe incrementar
```

---

## 📐 Modelos Matemáticos

### A. Dinámica de Opinión: Deffuant-Weisbuch (Confianza Acotada)

Si la distancia ideológica entre dos agentes $a$ y $b$ está por debajo del umbral de tolerancia $d_a$:

$$\text{Si } |\theta_a(t) - \theta_b(t)| < d_a \implies$$
$$\theta_a(t+1) = \theta_a(t) + \mu (\theta_b(t) - \theta_a(t))$$
$$\theta_b(t+1) = \theta_b(t) + \mu (\theta_a(t) - \theta_b(t))$$

Donde:
- $\theta \in [0, 1]$: score de ideología
- $d_a \in [0.1, 0.4]$: umbral de confianza
- $\mu \in (0, 0.5]$: parámetro de compromiso (default: 0.3)

### B. Índice de Satisfacción Colectiva (Felicidad)

$$F_a(t) = 1.0 - \sum_{k \in \text{PainPoints}} w_{a, k} \cdot P_k(t)$$

Donde:
- $w_{a, k}$: peso de importancia del dolor $k$ para el agente $a$
- $P_k(t) \in [0, 1]$: severidad del dolor (agua, baches, seguridad, movilidad)

### C. Elección de Voto: Logit Multinomial (Softmax)

Utilidad determinista del agente $a$ para el candidato $c$:

$$V_{ac} = \beta_{\text{char}} \cdot \text{charisma}_c - \beta_{\text{ideo}} \cdot |\theta_a - \theta_c| + \sum_{k} w_{a, k} \cdot \text{stance}_{c, k}$$

Probabilidad de voto:

$$P_{ac} = \frac{e^{V_{ac}}}{\sum_{j \in C} e^{V_{aj}}}$$

---

## 🔗 Integración con Open Business Plan

CivicPulse y OBP forman un ciclo virtuoso:

1. **Diagnóstico**: CivicPulse detecta dolores y simula soluciones
2. **Oportunidad**: Envía payload estructurado a OBP vía webhook
3. **Plan de Negocio**: OBP genera capex, opex, timeline y KPIs financieros
4. **Validación**: CivicPulse re-simula el ROI social a 5 años
5. **Ejecución**: Roadmap operativo listo para implementación

---

## ☁️ Despliegue en VPS

### Oracle Cloud Free Tier (E2-Micro: 1GB RAM)

Para el portal ciudadano **ThothAgora**, se recomienda arquitectura ligera sin Docker:

```bash
# Sincronizar fuentes locales al VPS
rsync -av --delete -e 'ssh -i "clave.pem"' \
  --exclude 'node_modules' --exclude '.git' \
  /local/plataforma/ ubuntu@IP_VPS:/home/ubuntu/plataforma/

# Ejecutar instalador remoto
ssh -i "clave.pem" ubuntu@IP_VPS << 'EOF'
  sudo mkdir -p /opt/plataforma
  sudo rsync -av /home/ubuntu/plataforma/ /opt/plataforma/
  sudo chmod +x /opt/plataforma/deploy_ubuntu.sh
  sudo bash /opt/plataforma/deploy_ubuntu.sh
EOF
```

### Scripts de Automatización

- `deploy_ubuntu.sh`: Instalador automático para Ubuntu/Debian
- `git_sync.sh`: Sincronización bidireccional local-nube
- `cleanup_vps.sh`: Limpieza de logs y caché en VPS

---

## 📚 Documentación Adicional

| Documento | Descripción |
|-----------|-------------|
| [SPEC.md](SPEC.md) | Especificación arquitectónica completa |
| [DEVELOPER_DOCUMENTATION.md](DEVELOPER_DOCUMENTATION.md) | Mapa de arquitectura y flujos de datos |
| [walkthrough.md](walkthrough.md) | Demostración del visualizador GDS-MEGA |
| [implementation_plan.md](implementation_plan.md) | Roadmap de implementación MVP Hermosillo |
| [governance/](governance/) | Decisiones de arquitectura y BDD/DDD |
| [features/](features/) | Historias de usuario en Gherkin |

---

## 🎯 MVP: Hermosillo, Sonora

El primer despliegue funcional está parametrizado para **Hermosillo, Sonora**:

| Distrito | Perfil | Dolores Críticos |
|----------|--------|------------------|
| **Distrito 6 (Norte)** | Universidades & Maquilas | Movilidad, inflación comercial |
| **Distrito 8 (Sur - Palo Verde)** | Zona residencial popular | Crisis hídrica (tandeos severos) |
| **Distrito 9 (Centro)** | Comercio histórico | Baches, delincuencia comercial |

**Candidatos Simulados**:
- **Candidato A (Morena/Social)**: Subsidios directos, programas sociales
- **Candidato B (PAN/Conservador)**: Infraestructura, reducción fiscal

---

## 🛡️ Seguridad y Privacidad

- **Local-First**: Todo el procesamiento sensible ocurre en el dispositivo del usuario
- **Zero-Trust**: No hay transmisión de datos crudos a servidores externos
- **Criptografía**: Firmas SHA-256 con sal única por sesión
- **Anonimización**: CURP obscurecida en logs y bases de datos
- **GDPR-Compliant**: Derecho al olvido implementado a nivel de agente sintético

---

## 🤝 Contribuir

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Convenciones de Código
- **Frontend**: ESLint + Prettier (configuración incluida)
- **Backend**: Black + Flake8 para Python
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Ver archivo [LICENSE](LICENSE) para detalles.

---

## 📞 Contacto

- **Sitio Web**: https://civicpulse.io
- **Email**: contacto@civicpulse.io
- **Twitter**: [@CivicPulseIO](https://twitter.com/CivicPulseIO)

---

<div align="center">

**CivicPulse & CívicaOS Engine**  
*Transformando datos cívicos en gobernanza inteligente*

Hecho con ❤️ para la democracia del siglo XXI

</div>
