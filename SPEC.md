# 🏗️ SPEC.md: Especificación Arquitectónica - CivicPulse & CívicaOS Engine

## 1. Introducción y Visión General

**CivicPulse (potenciado por CívicaOS)** es una plataforma de **Inteligencia Cívica, Gemelos Digitales de la Sociedad y Modelado Social Predictivo**. A diferencia de los métodos estáticos de encuestas, CivicPulse utiliza **Modelado Basado en Agentes (ABM)** y **Población Sintética** local-first para simular escenarios políticos, económicos y sociales. 

La plataforma cierra el ciclo de toma de decisiones conectándose de manera bidireccional con **Open Business Plan (OBP)**, transformando diagnósticos sociales complejos en planes de negocio y roadmaps de ejecución corporativa y gubernamental completamente viables.

---

## 2. Niveles de Hardware y Despliegue On-Premise

La plataforma está diseñada bajo un principio estricto de **privacidad absoluta y zero-trust**, lo que implica que el procesamiento sensible de intención de voto y datos de INEGI se ejecuta **100% en local**. El sistema se escala a través de tres niveles (tiers) de hardware:

### Nivel 1: Edge / Desarrollo (Mac Mini M4 16GB)
*   **Caso de Uso**: Desarrollo local, pruebas de concepto (PoC), demostraciones interactivas y pequeños municipios o consultoras independientes.
*   **Inferencia local**: Modelos compactos cuantizados en formato GGUF mediante `llama.cpp` o `Ollama`, o nativos con `MLX` en Apple Silicon.
*   **Modelos recomendados**: `Qwen2.5-7B-Coder`, `Llama-3.1-8B-Instruct (Q4_K_M)`, `Phi-3-mini`.
*   **Simulación**: ABM ligero con hasta 10,000 agentes virtuales y horizonte de 3 años.
*   **Tiempo de procesamiento**: 20 a 40 minutos por reporte analítico completo.

### Nivel 2: Estación de Trabajo AI (NVIDIA DGX Spark / Custom GPU Server)
*   **Caso de Uso**: Oficinas técnicas estatales, partidos políticos medianos y think-tanks de planeación de políticas públicas regionales.
*   **Inferencia local**: Modelos medianos/grandes mediante servidores de inferencia eficientes (`vLLM`, `TensorRT-LLM`).
*   **Modelos recomendados**: `Llama-3.3-70B-Instruct (quantized)`, `Qwen2.5-32B-Instruct`, `Mistral-Large-2 (INT4)`.
*   **Simulación**: ABM de mediana escala con hasta 500,000 agentes y horizonte de 10 años.
*   **Tiempo de procesamiento**: 15 a 45 minutos por ciclo completo.

### Nivel 3: Cluster de Datacenter (4x-8x NVIDIA H100/H200 Server)
*   **Caso de Uso**: Gobiernos federales, grandes corporativos, agencias nacionales de estadística o clusters centralizados dedicados.
*   **Inferencia local**: Modelos fundacionales masivos corriendo en precisión nativa (`BF16`/`FP16`) en clusters distribuidos con `vLLM` y orquestación con `Ray`.
*   **Modelos recomendados**: `Llama-3.1-405B-Instruct`, `Mixtral-8x22B`, `NVIDIA Nemotron-3 Super 120B`.
*   **Simulación**: Gemelos digitales nacionales completos de 5 millones a 30 millones de agentes en tiempo real con paralelismo masivo.
*   **Tiempo de procesamiento**: Menos de 5 minutos por simulación profunda.

---

## 3. Metodologías de Desarrollo del Enjambre (Omni-Driven AI Swarm)

Para automatizar la producción de software de grado empresarial, el enjambre de agentes adopta disciplinas específicas de desarrollo de software:

```
[Prompt Inicial / Ingestión] 
          │
          ▼
   PDD (Prompt-Driven) ──► Generación y drafting inicial
          │
          ▼
   DDD (Domain-Driven) ──► Mapeo en Bounded Contexts y Entidades
          │
          ▼
   BDD (Behavior-Driven) ─► Redacción de escenarios legibles (Given/When/Then)
          │
          ▼
   TDD (Test-Driven) ────► Creación automática de tests unitarios antes del código
          │
          ▼
   EDD (Event-Driven) ───► Orquestación reactiva y asincrónica en el bus
          │
          ▼
  UXDD (User-Experience) ─► Explicabilidad (XAI) y renderizado en Dashboard
```

*   **DDD (Domain-Driven Design)**: Columna vertebral. Limita contextos como `ElectoralContext`, `ABMContext`, `ReportContext` y `OBPIntegrationContext`.
*   **BDD (Behavior-Driven Development)**: Define los criterios de aceptación social. Ejemplo:
    ```gherkin
    Scenario: Aplicación de Subsidio Universitario
      Given el distrito "HER-DIS-08" con descontento de movilidad de 0.70
      When se activa el evento de política "subsidy-transport-students"
      Then la felicidad del sector "estudiantes" debe aumentar al menos 15%
      And la intención de voto hacia el Candidato A debe incrementar
    ```
*   **TDD (Test-Driven Development)**: El agente de QA autogenera archivos de prueba en Python (`pytest`) antes de ejecutar el motor ABM para prevenir alucinaciones de cálculo y fallos de código.

---

## 4. Diseño del Enjambre de Agentes (OpenSwarm & NemoClaw)

El sistema opera mediante un framework multi-agente robusto de ejecución `always-on` y aislado (*sandboxed*), apalancando la arquitectura de **NVIDIA NemoClaw** y **OpenClaw** con los siguientes roles especializados:

```
                 ┌─────────────────────────────┐
                 │  SUPER AGENTE ORQUESTADOR   │
                 └──────────────┬──────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│ DataHarvester │       │ SimulatorABM  │       │ StancePredict │
│ Ingestión de  │       │ Motor Mesa de │       │ Modelo Softmax│
│ INEGI / INE   │       │ simulación    │       │ de voto (XAI) │
└───────┬───────┘       └───────┬───────┘       └───────┬───────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ ReportWriter  │
                        │ Genera PDF e  │
                        │ informes      │
                        └───────┬───────┘
                                │
                                ▼
                        ┌───────────────┐
                        │ OBPConnector  │
                        │ Envía payload │
                        │ JSON a OBP    │
                        └───────────────┘
```

1.  **Super Agente Orquestador**: Analiza la iniciativa cívica ingresada por el usuario y divide el trabajo en flujos de tareas secuenciales y en paralelo.
2.  **Agente DataHarvester**: Extrae bases de datos locales (censos del INEGI, históricos electorales del INE/IEE). Ejecuta procesos ETL robustos.
3.  **Agente SimulatorABM**: Escribe los archivos de reglas del ABM en Python (`Mesa`/`AgentPy`) y los ejecuta localmente, devolviendo trayectorias de felicidad a 1, 5 y 10 años.
4.  **Agente StancePredict**: Calcula la intención electoral mediante un modelo probabilístico Logit Multinomial. Aporta explicabilidad.
5.  **Agente ReportWriter**: Traduce las métricas complejas en reportes estructurados en Markdown y PDFs ejecutivos con gráficos y roadmaps.
6.  **Agente OBPConnector**: Traduce el "Plan de Ataque" en una oportunidad de negocio estructurada para inyectar a *Open Business Plan* vía Webhook.

---

## 5. Modelado Matemático del ABMSimulator

Para asegurar que las simulaciones tengan coherencia científica y matemática real y no actúen como meras animaciones frontend, se implementan tres modelos formales:

### A. Dinámica de Opinión: Modelo Deffuant-Weisbuch (Confianza Acotada)
En cada ciclo temporal $t$, se simula la interacción interpersonal e ideológica de pares de agentes $a$ y $b$ pertenecientes al mismo territorio. Si su distancia ideológica está por debajo de un umbral de tolerancia individual $d_a$, sus posturas convergen:

$$\text{Si } |\theta_a(t) - \theta_b(t)| < d_a \implies$$
$$\theta_a(t+1) = \theta_a(t) + \mu (\theta_b(t) - \theta_a(t))$$
$$\theta_b(t+1) = \theta_b(t) + \mu (\theta_a(t) - \theta_b(t))$$

Donde $\theta \in [0, 1]$ es el score de ideología del agente, $d_a \in [0.1, 0.4]$ es el umbral de confianza, y $\mu \in (0, 0.5]$ es el parámetro de compromiso (convergencia acelerada, por defecto $0.3$).

### B. Índice de Satisfacción Colectiva (Felicidad del Votante)
La felicidad individual del agente $a$ en el tiempo $t$ ($F_a(t)$) es una función lineal inversa de la brecha ponderada entre la gravedad de los problemas de su distrito ($P_k(t)$) y el peso de importancia que le asigna a cada dolencia ($w_{a, k}$):

$$F_a(t) = 1.0 - \sum_{k \in \text{PainPoints}} w_{a, k} \cdot P_k(t)$$

Donde $\sum_{k} w_{a, k} = 1.0$ y $P_k(t) \in [0, 1]$ representa los indicadores de escasez de agua, baches, delincuencia o falta de transporte. Las políticas públicas reducen $P_k(t)$, elevando el índice de felicidad.

### C. Elección de Voto: Modelo Logit Multinomial (Softmax)
La utilidad determinista $V_{ac}$ que el agente $a$ percibe al votar por el candidato $c$ se calcula ponderando las promesas del candidato contra las dolencias del ciudadano, ajustado por cercanía ideológica y carisma:

$$V_{ac} = \beta_{\text{char}} \cdot \text{charisma}_c - \beta_{\text{ideo}} \cdot |\theta_a - \theta_c| + \sum_{k \in \text{PainPoints}} w_{a, k} \cdot \text{stance}_{c, k}$$

Donde $\text{stance}_{c, k}$ es la efectividad propuesta por el candidato $c$ ante el dolor $k$, y $\beta$ representa los coeficientes de sensibilidad.
Asumiendo que los componentes de perturbación aleatoria son i.i.d. Gumbel, la probabilidad $P_{ac}$ de votar por el candidato $c$ dentro del conjunto de candidatos $C$ se define mediante la función Softmax:

$$P_{ac} = \frac{e^{V_{ac}}}{\sum_{j \in C} e^{V_{aj}}}$$

---

## 6. Esquema de Datos Mínimo (MVP Schemas)

Los contratos de datos estructuran la información geográfica, individual y política:

### A. Territorio (`Territory.json`)
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Territory",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "name": { "type": "string" },
    "level": { "type": "string", "enum": ["state", "municipality", "district"] },
    "parent_id": { "type": ["string", "null"] },
    "demographics": {
      "type": "object",
      "properties": {
        "total_population": { "type": "integer" },
        "weights": {
          "type": "object",
          "properties": {
            "comerciantes": { "type": "number" },
            "estudiantes": { "type": "number" },
            "obreros": { "type": "number" }
          },
          "required": ["comerciantes", "estudiantes", "obreros"]
        }
      },
      "required": ["total_population", "weights"]
    },
    "baselines": {
      "type": "object",
      "properties": {
        "baches": { "type": "number", "minimum": 0, "maximum": 1 },
        "water": { "type": "number", "minimum": 0, "maximum": 1 },
        "security": { "type": "number", "minimum": 0, "maximum": 1 },
        "mobility": { "type": "number", "minimum": 0, "maximum": 1 }
      },
      "required": ["baches", "water", "security", "mobility"]
    }
  },
  "required": ["id", "name", "level", "demographics", "baselines"]
}
```

---

## 7. Integración con Open Business Plan (API Contracts)

La conexión entre el diagnóstico sociopolítico de **CivicPulse** y el desarrollo operativo de **Open Business Plan** se realiza de forma bidireccional mediante APIs locales de zero-trust.

### API de Salida: CivicPulse ──► Open Business Plan

*   **Endpoint**: `POST http://localhost:8000/api/v1/opportunities`
*   **Tránsito**: El orquestador empaqueta el descontento detectado y simulación exitosa en un payload estructurado para que OBP genere la solución de negocio.
*   **Payload JSON**:
```json
{
  "session_hash": "a4f89d3c5e2197e884b80b27e8a93e8274cf8f2e2764a2f8b5f39e38c92a9b3d",
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
  "recommended_civic_action": "Subsidio de Transporte Universitario y pavimentación del eje vial tecnológico.",
  "simulated_kpis": {
    "expected_happiness_improvement": "+22%",
    "projected_vote_intention_swing_candidato_A": "+6.5%"
  }
}
```

### API de Entrada: Open Business Plan ──► CivicPulse

*   **Endpoint**: `POST http://localhost:3335/api/v1/feedback`
*   **Tránsito**: OBP responde con el plan financiero y operativo y solicita al simulador ABM una re-evaluación del ROI social a 5 años.
*   **Payload JSON**:
```json
{
  "plan_id": "OBP-BP-2026-004",
  "original_session_hash": "a4f89d3c5e2197e884b80b27e8a93e8274cf8f2e2764a2f8b5f39e38c92a9b3d",
  "business_proposal": {
    "title": "Red de Microbuses Eléctricos Universitarios Inteligentes",
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

## 8. Mecanismo de Automejora Supervisada y MLOps Local

Para evitar la degradación del sistema (*drift*) y sesgos ideológicos, se implementa una tubería de automejora estructurada local:

1.  **Registro de Predicciones**: Cada simulación electoral se firma digitalmente y se guarda junto a la matriz de baselines en la base PostgreSQL local.
2.  **Reality Gap Calculation**: Al publicarse resultados oficiales de elecciones reales (PREP/INEGI), un agente de background (`SelfImprovementAgent`) calcula el error sistemático (desviación media cuadrática):
    $$MSE = \frac{1}{|C|} \sum_{c \in C} (P_{\text{predicted}, c} - P_{\text{actual}, c})^2$$
3.  **Calibración de Hiperparámetros**: El agente optimiza los coeficientes $\beta_{\text{char}}$ y $\beta_{\text{ideo}}$ mediante optimización bayesiana local (`Optuna`) contra un dataset de control cerrado.
4.  **Generación de LoRA**: En servidores Tier 3, si el error supera el umbral del 3.5%, se dispara un fine-tuning con adapters LoRA sobre el modelo `Llama-3.3-70B` usando microdatos locales anonimizados.
5.  **Aprobación Humana**: El modelo recalibrado entra a un ambiente de *staging*. El ebanista técnico (Roberto Celis) debe firmar digitalmente la aprobación en el panel de control antes de promocionarlo a producción.

---

## 9. Ámbito del MVP (Hermosillo, Sonora)

El primer despliegue funcional se parametriza bajo la geografía y problemáticas reales de **Hermosillo, Sonora**:
*   **Distrito 6 (Norte - Universidades & Maquilas)**: Sensibilidad alta a movilidad e inflación del impuesto comercial.
*   **Distrito 8 (Sur - Palo Verde)**: Crisis hídrica recurrente (tandeos severos). Foco de descontento social.
*   **Distrito 9 (Centro - Comercio Central)**: Puntos de dolor por baches y delincuencia en comercios locales.
*   **Candidato A (Morena/Social)**: Enfoque en subsidios y programas directos.
*   **Candidato B (PAN/Conservador)**: Enfoque en inversión en infraestructura y reducción fiscal comercial.

---

## 10. ThothAgora: Portal Ciudadano y Arquitectura VPS E2-Micro (1GB RAM)

### A. Visión y Naming (ThothAgora: El Oráculo del Ágora)
Para descentralizar la recolección de microdatos del Gemelo Digital y democratizar el acceso del ciudadano a los Augurios del Ágora (KPIs de felicidad), se crea la interfaz **ThothAgora**. El nombre fusiona la sabiduría del dios egipcio de la escritura y matemáticas (Thoth) con la asamblea cívica de la democracia griega (Ágora), actuando como un oráculo transparente de predicción social.

### B. Restricciones y Arquitectura para Servidor Ultra-Ligero (Oracle Cloud Free Tier)
El portal de captura ciudadana de ThothAgora está diseñado para ser alojado de manera sumamente barata o gratuita en un **VPS de Oracle Cloud (AMD E2-Micro, 1 Núcleo, 1 GB de RAM, 45-50 MB/s I/O)**.
Para asegurar un rendimiento impecable bajo carga con solo 1GB de RAM, la arquitectura descarta contenedores Docker y frameworks pesados, aplicando las siguientes directivas físicas:

```mermaid
graph TD
    Client[Navegador del Ciudadano] -- HTTPS / JSON --► CaddyServer[Caddy Web Server / 8MB RAM]
    CaddyServer -- Proxy local / Caching --► GoAPI[Go Compilado Nativo / 12MB RAM]
    GoAPI -- SQLite Read/Write / 2MB RAM --► SQLite[(SQLite DB File / Local-First)]
    CaddyServer -- Static Files Serving --► ReactStatic[React Frontend Compilado / Estático]
```

1. **Stack de Producción de Ultra-Bajo Consumo**:
   - **Caddy Web Server**: Actúan como proxy inverso TLS y servidor de archivos estáticos. Consume menos de **8 MB** de RAM (en lugar de Nginx o Apache que consumen más).
   - **Backend en Go (Golang)**: El servicio API se compila a un binario estático nativo y monolítico de unos 15MB. Utiliza `go-chi` o `fiber` y consume solo **10-12 MB** de memoria RAM activa en producción.
   - **Base de Datos SQLite**: La base de datos es un archivo local cifrado mediante SQLite. Evita la sobrecarga masiva de memoria de un servidor de base de datos relacional tradicional (como PostgreSQL o MySQL que requieren al menos **150-250 MB** de RAM para el pool de conexiones).

2. **Mitigación y Rate-Limiting**:
   - **IP-Based Rate Limiting**: Limitación en Caddy de un máximo de 10 peticiones POST por minuto por IP para prevenir ataques de denegación de servicio que ahoguen el procesador de un solo núcleo.
   - **Cache Agresiva en Lecturas**: Los KPIs municipales e indicadores agregados de felicidad se cachean en memoria en el servidor Go por 5 minutos, evitando lecturas directas a disco SQLite en consultas recurrentes.

### C. Contrato del Endpoint de Ingesta Cívica
La API recibe las opiniones y ponderaciones de dolor de los ciudadanos en formato JSON estructurado:

- **Endpoint**: `POST /api/v1/opinion`
- **Payload Contract**:
```json
{
  "sector": "asalariado",
  "district": "HER-DIS-08",
  "water_pain": 0.85,
  "transit_pain": 0.50,
  "potholes_pain": 0.30,
  "safety_pain": 0.65,
  "proposal": "Pavimentación urgente de la calzada de Palo Verde y regularización del tandeo de agua los fines de semana."
}
```

- **Respuesta de Aceptación (Status 201 Created)**:
```json
{
  "status": "success",
  "certificate_id": "TA-CERT-859302",
  "hash": "sha256:thoth_agora_9f41bc19e3...b712",
  "timestamp": "2026-05-18T00:05:00Z"
}
```
