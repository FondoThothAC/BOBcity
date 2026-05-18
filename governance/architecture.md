# 🛡️ Gobernanza de Arquitectura: Zero-Trust Local-First

Este documento formaliza las directivas de infraestructura y topología de red para garantizar resiliencia, privacidad absoluta y escalabilidad del ecosistema **CivicPulse**.

---

## 1. Niveles de Despliegue (Hardware Tiers)

El sistema soporta una escala elástica distribuida dependiente de hardware local dedicado:

| Tier | Configuración Física | Alcance de Cómputo | Uso Recomendado |
| :--- | :--- | :--- | :--- |
| **Tier 1** | Mac mini M4 (16GB - 128GB RAM) | Inferencia ligera (Llama-3-8B), consultas SQL locales, renderizado de mapas. | Prototipado, desarrollo rápido local y demostraciones en campo. |
| **Tier 2** | NVIDIA DGX Spark / Workstation (RTX 4090) | Modelos medianos (Qwen2.5-14B/32B), simulación ABM municipal con hasta 50,000 agentes sintéticos. | Equipos de planeación de mediano tamaño y secretarías municipales. |
| **Tier 3** | Servidores Dedicados 4x/8x NVIDIA H100/H200 | Simulación completa a nivel estatal (100k+ agentes), fine-tuning local de modelos de lenguaje, inferencia paralela. | Centros de cómputo dedicados de gobiernos estatales y grandes corporativos. |
| **Tier 4** | Cluster Kubernetes On-Premise | Escalado masivo horizontal de agentes NemoClaw mediante colas NATS/Redis distribuidas. | Despliegue gubernamental federal con redundancia y alta disponibilidad. |

---

## 2. Directivas de Privacidad y Zero-Trust (Local-First)

1.  **Aislamiento Total**: Ningún script o componente de CivicPulse tiene permitido realizar llamadas API externas a nubes públicas (AWS, OpenAI, Anthropic, etc.) sin aprobación humana previa en el archivo de gobernanza.
2.  **Validación de Entradas (MDD)**: Toda información externa que ingrese a la red local (ej. nuevas encuestas, archivos CSV de INEGI) debe validarse estrictamente contra esquemas de Zod antes de ser consumida por el enjambre.
3.  **Cifrado en Reposo**: Las bases de datos vectoriales locales (DuckDB/pgvector) que contienen datos geoespaciales sensibles de Hermosillo deben estar cifradas mediante algoritmos de clave AES-256 local.
4.  **Canal mTLS Local para OBP**: La exportación de datos entre **CivicPulse** y **Open Business Plan** se realiza mediante canales TLS mutuos locales (mTLS) certificados por llaves locales generadas en el orquestador, evitando que el payload sea expuesto en texto plano en la red corporativa.

---

## 3. Gobernanza de Explicabilidad (XDD - Explainability-Driven Development)

El software cívico y de toma de decisiones gubernamentales no puede operar como una "caja negra". Establecemos las siguientes reglas obligatorias de explicabilidad:

*   **Trazabilidad de Inferencia**: Todo resultado arrojado por el enjambre de agentes debe incluir el historial de los agentes y modelos (Ollama/Nemotron) involucrados en su deducción.
*   **SHAP/Feature Importance**: El predictor electoral debe desglosar las 3 principales variables que explican los porcentajes de victoria de forma entendible para analistas no técnicos (ej. *Índice Socioeconómico, Puntos de Dolor de Agua, Sentimiento Digital*).
*   **Visibilidad de Confianza**: Los reportes y dashboards deben mostrar claramente el indicador de confianza estadística del modelo predictivo ($R^2$ o intervalos de confianza) en lugar de un único valor absoluto.
