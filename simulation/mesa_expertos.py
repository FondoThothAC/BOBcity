# simulation/mesa_expertos.py
# MoE (Mezcla de Expertos) — Orquestación Multi-Agente Local con Ollama
# PDD: Gestión de memoria con swap secuencial para Mac 16GB
# ADD: Arquitectura de agentes con roles especializados y blackboard compartido

"""
Mesa de Expertos IA Local — Motor de Orquestación MoE
=====================================================
Orquesta múltiples agentes LLM especializados usando modelos Ollama locales,
agrupando tareas por modelo para minimizar swaps de memoria.

Modelos soportados:
  - qwen3.5:4b-mlx  (4.0 GB) → Rápido, razonamiento lógico, datos estructurados
  - gemma4:e4b-mlx   (9.6 GB) → Profundo, análisis cualitativo, redacción

Flujo secuencial optimizado (solo 2 swaps por consulta):
  [Router + Analista] → SWAP → [Estratega + Redactor] → SWAP → [Sintetizador]
"""

import json
import time
import hashlib
from typing import Optional

# URL base de Ollama (configurable por variable de entorno)
import os
OLLAMA_BASE_URL = os.environ.get("OLLAMA_URL", "http://localhost:11434")

# ─── Configuración de Roles de Expertos ───────────────────────────────────────

EXPERTOS = {
    "router": {
        "nombre": "Clasificador Thoth",
        "modelo": "qwen3.5:4b-mlx",
        "emoji": "🧠",
        "system_prompt": (
            "Eres el Clasificador Thoth de CívicaOS, un orquestador experto. "
            "Tu tarea es analizar la consulta del usuario y generar un plan de ejecución. "
            "Responde ÚNICAMENTE en JSON válido con esta estructura:\n"
            '{"plan": [{"agente": "analista", "tarea": "..."}, {"agente": "estratega", "tarea": "..."}, '
            '{"agente": "redactor", "tarea": "..."}], "contexto_clave": "...", "prioridad": "alta|media|baja"}'
        ),
        "temperatura": 0.3,
        "max_tokens": 600,
    },
    "analista": {
        "nombre": "Analista de Microdatos",
        "modelo": "qwen3.5:4b-mlx",
        "emoji": "📊",
        "system_prompt": (
            "Eres un analista de datos especializado en demografía mexicana (INEGI, INE, CONEVAL). "
            "Extraes métricas cuantitativas, identificas patrones estadísticos y generas insights "
            "basados en datos duros. Siempre incluye cifras específicas, porcentajes y tendencias. "
            "Responde de forma estructurada con secciones: DATOS CLAVE, ANÁLISIS, MÉTRICAS."
        ),
        "temperatura": 0.4,
        "max_tokens": 1500,
    },
    "estratega": {
        "nombre": "Estratega Político-Social",
        "modelo": "gemma4:e4b-mlx",
        "emoji": "🗳️",
        "system_prompt": (
            "Eres un estratega político-social de alto nivel. Analizas correlaciones entre inversión "
            "pública, satisfacción ciudadana e intención de voto. Consideras factores como la teoría "
            "de opinión de Deffuant-Weisbuch, dinámica de redes sociales, y el modelo logístico multinomial "
            "de preferencia electoral. Genera recomendaciones accionables con estimaciones de impacto."
        ),
        "temperatura": 0.6,
        "max_tokens": 2000,
    },
    "redactor": {
        "nombre": "Redactor Ejecutivo",
        "modelo": "gemma4:e4b-mlx",
        "emoji": "📝",
        "system_prompt": (
            "Eres un redactor ejecutivo premium de CívicaOS. Generas reportes estructurados, "
            "planes de acción y narrativas persuasivas para tomadores de decisiones. "
            "Tu estilo es conciso, profesional y orientado a resultados. Usa formato con "
            "secciones claras: RESUMEN EJECUTIVO, HALLAZGOS, RECOMENDACIONES, SIGUIENTE PASO."
        ),
        "temperatura": 0.7,
        "max_tokens": 3000,
    },
    "sintetizador": {
        "nombre": "Sintetizador Final",
        "modelo": "qwen3.5:4b-mlx",
        "emoji": "🔄",
        "system_prompt": (
            "Eres el sintetizador final de la Mesa de Expertos de CívicaOS. "
            "Recibes las respuestas de múltiples expertos (Analista, Estratega, Redactor) "
            "y generas una respuesta consolidada en JSON con esta estructura:\n"
            '{"resumen": "...", "kpis": [{"nombre": "...", "valor": "...", "tendencia": "..."}], '
            '"plan_accion": ["..."], "confianza_global": 0.0, "expertos_consultados": [...]}'
        ),
        "temperatura": 0.2,
        "max_tokens": 1200,
    },
}


# ─── Funciones de Comunicación con Ollama ─────────────────────────────────────

def _hacer_peticion_ollama(modelo, system_prompt, user_prompt, temperatura=0.5, max_tokens=1500):
    """
    Envía una petición de inferencia a Ollama via HTTP nativo.
    Retorna el texto de respuesta o un mensaje de error.
    
    Usa urllib para evitar dependencia de 'requests'.
    """
    import urllib.request
    import urllib.error

    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": modelo,
        "prompt": user_prompt,
        "system": system_prompt,
        "stream": False,
        "options": {
            "temperature": temperatura,
            "num_predict": max_tokens,
        },
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    inicio = time.time()
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            duracion = round(time.time() - inicio, 2)
            return {
                "texto": body.get("response", ""),
                "modelo": body.get("model", modelo),
                "duracion_seg": duracion,
                "tokens_eval": body.get("eval_count", 0),
                "exito": True,
            }
    except urllib.error.URLError as e:
        return {
            "texto": f"[ERROR] No se pudo conectar con Ollama ({OLLAMA_BASE_URL}): {e}",
            "modelo": modelo,
            "duracion_seg": round(time.time() - inicio, 2),
            "tokens_eval": 0,
            "exito": False,
        }
    except Exception as e:
        return {
            "texto": f"[ERROR] Fallo inesperado en inferencia: {e}",
            "modelo": modelo,
            "duracion_seg": round(time.time() - inicio, 2),
            "tokens_eval": 0,
            "exito": False,
        }


def _liberar_modelo(modelo):
    """
    Envía una petición con keep_alive=0 para forzar la descarga del modelo
    de la memoria RAM/VRAM, liberando recursos para el siguiente modelo.
    """
    import urllib.request
    import urllib.error

    url = f"{OLLAMA_BASE_URL}/api/generate"
    payload = {
        "model": modelo,
        "prompt": "",
        "keep_alive": 0,
    }

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resp.read()
        print(f"🔓 [MesaExpertos] Modelo '{modelo}' liberado de memoria.")
        return True
    except Exception as e:
        print(f"⚠️ [MesaExpertos] No se pudo liberar modelo '{modelo}': {e}")
        return False


def _verificar_modelos_disponibles():
    """
    Consulta Ollama para verificar qué modelos están instalados localmente.
    Retorna una lista de nombres de modelos disponibles.
    """
    import urllib.request
    import urllib.error

    url = f"{OLLAMA_BASE_URL}/api/tags"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=10) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            modelos = [m.get("name", "") for m in body.get("models", [])]
            return modelos
    except Exception:
        return []


# ─── Orquestador Principal de la Mesa de Expertos ─────────────────────────────

def ejecutar_mesa_de_expertos(consulta, contexto="", modo="profundo"):
    """
    Ejecuta la Mesa de Expertos completa con swap secuencial inteligente.
    
    Modos disponibles:
      - "rapido":   Solo usa qwen3.5:4b-mlx (sin swap, respuesta rápida)
      - "profundo": Usa ambos modelos con swap (mejor calidad)
      - "debate":   Los expertos pueden refutar al otro (máxima calidad, más lento)
    
    Retorna un dict con:
      - fases: lista de resultados por fase/agente
      - sintesis: respuesta consolidada final
      - meta: metadatos de ejecución (tiempos, swaps, tokens)
    """
    session_id = hashlib.sha256(f"{consulta}{time.time()}".encode()).hexdigest()[:16]
    inicio_global = time.time()
    
    fases = []
    blackboard = {
        "consulta_original": consulta,
        "contexto": contexto,
        "modo": modo,
    }

    # ─── Verificar modelos disponibles ─────────────────────────────────
    modelos_disponibles = _verificar_modelos_disponibles()
    modelo_rapido = EXPERTOS["router"]["modelo"]
    modelo_profundo = EXPERTOS["estratega"]["modelo"]

    tiene_rapido = any(modelo_rapido in m for m in modelos_disponibles)
    tiene_profundo = any(modelo_profundo in m for m in modelos_disponibles)

    if not tiene_rapido and not tiene_profundo:
        return {
            "session_id": session_id,
            "error": f"No se encontraron modelos en Ollama. Modelos buscados: {modelo_rapido}, {modelo_profundo}. Disponibles: {modelos_disponibles}",
            "fases": [],
            "sintesis": None,
            "meta": {"duracion_total_seg": 0, "swaps": 0},
        }

    # Si no tiene el modelo profundo, forzar modo rápido
    if not tiene_profundo and modo in ("profundo", "debate"):
        modo = "rapido"
        blackboard["modo_forzado"] = f"Modo cambiado a 'rapido' porque el modelo '{modelo_profundo}' no está disponible."

    num_swaps = 0

    # ═══════════════════════════════════════════════════════════════════
    # FASE 1: ROUTER (qwen3.5:4b-mlx) — Clasificación y planificación
    # ═══════════════════════════════════════════════════════════════════
    print(f"\n🧠 [Fase 1] Router — Clasificando consulta...")
    cfg_router = EXPERTOS["router"]
    res_router = _hacer_peticion_ollama(
        modelo=cfg_router["modelo"],
        system_prompt=cfg_router["system_prompt"],
        user_prompt=f"Consulta del usuario: {consulta}\n\nContexto adicional: {contexto or 'Ninguno'}",
        temperatura=cfg_router["temperatura"],
        max_tokens=cfg_router["max_tokens"],
    )
    fases.append({
        "fase": 1,
        "agente": "router",
        "nombre": cfg_router["nombre"],
        "emoji": cfg_router["emoji"],
        "modelo": cfg_router["modelo"],
        "resultado": res_router,
    })
    blackboard["plan_router"] = res_router.get("texto", "")

    # ═══════════════════════════════════════════════════════════════════
    # FASE 2: ANALISTA (qwen3.5:4b-mlx) — Mismo modelo, sin swap
    # ═══════════════════════════════════════════════════════════════════
    print(f"📊 [Fase 2] Analista — Procesando datos...")
    cfg_analista = EXPERTOS["analista"]
    prompt_analista = (
        f"Consulta principal: {consulta}\n\n"
        f"Plan del clasificador: {blackboard['plan_router']}\n\n"
        f"Contexto: {contexto or 'Ninguno'}\n\n"
        "Genera un análisis cuantitativo detallado con métricas específicas."
    )
    res_analista = _hacer_peticion_ollama(
        modelo=cfg_analista["modelo"],
        system_prompt=cfg_analista["system_prompt"],
        user_prompt=prompt_analista,
        temperatura=cfg_analista["temperatura"],
        max_tokens=cfg_analista["max_tokens"],
    )
    fases.append({
        "fase": 2,
        "agente": "analista",
        "nombre": cfg_analista["nombre"],
        "emoji": cfg_analista["emoji"],
        "modelo": cfg_analista["modelo"],
        "resultado": res_analista,
    })
    blackboard["analisis_datos"] = res_analista.get("texto", "")

    if modo in ("profundo", "debate"):
        # ═══════════════════════════════════════════════════════════════
        # SWAP 1: Liberar qwen3.5 → Cargar gemma4:e4b-mlx
        # ═══════════════════════════════════════════════════════════════
        print(f"🔄 [SWAP 1] Liberando {modelo_rapido} → Cargando {modelo_profundo}...")
        swap1_inicio = time.time()
        _liberar_modelo(modelo_rapido)
        num_swaps += 1
        swap1_duracion = round(time.time() - swap1_inicio, 2)
        fases.append({
            "fase": 2.5,
            "agente": "swap",
            "nombre": "Swap de Modelo",
            "emoji": "🔄",
            "modelo": f"{modelo_rapido} → {modelo_profundo}",
            "resultado": {
                "texto": f"Modelo cambiado exitosamente ({swap1_duracion}s)",
                "duracion_seg": swap1_duracion,
                "exito": True,
            },
        })

        # ═══════════════════════════════════════════════════════════════
        # FASE 3: ESTRATEGA (gemma4:e4b-mlx) — Análisis profundo
        # ═══════════════════════════════════════════════════════════════
        print(f"🗳️ [Fase 3] Estratega — Análisis político-social profundo...")
        cfg_estratega = EXPERTOS["estratega"]
        prompt_estratega = (
            f"Consulta original: {consulta}\n\n"
            f"Análisis cuantitativo del Analista de Datos:\n{blackboard['analisis_datos']}\n\n"
            "Con base en estos datos, genera un análisis estratégico político-social con "
            "recomendaciones de impacto electoral y bienestar ciudadano."
        )
        res_estratega = _hacer_peticion_ollama(
            modelo=cfg_estratega["modelo"],
            system_prompt=cfg_estratega["system_prompt"],
            user_prompt=prompt_estratega,
            temperatura=cfg_estratega["temperatura"],
            max_tokens=cfg_estratega["max_tokens"],
        )
        fases.append({
            "fase": 3,
            "agente": "estratega",
            "nombre": cfg_estratega["nombre"],
            "emoji": cfg_estratega["emoji"],
            "modelo": cfg_estratega["modelo"],
            "resultado": res_estratega,
        })
        blackboard["estrategia"] = res_estratega.get("texto", "")

        # ═══════════════════════════════════════════════════════════════
        # FASE 4: REDACTOR (gemma4:e4b-mlx) — Mismo modelo, sin swap
        # ═══════════════════════════════════════════════════════════════
        print(f"📝 [Fase 4] Redactor — Generando reporte ejecutivo...")
        cfg_redactor = EXPERTOS["redactor"]
        prompt_redactor = (
            f"Consulta original: {consulta}\n\n"
            f"=== Análisis de Datos ===\n{blackboard['analisis_datos']}\n\n"
            f"=== Estrategia Política ===\n{blackboard['estrategia']}\n\n"
            "Redacta un reporte ejecutivo premium consolidando estos hallazgos."
        )
        res_redactor = _hacer_peticion_ollama(
            modelo=cfg_redactor["modelo"],
            system_prompt=cfg_redactor["system_prompt"],
            user_prompt=prompt_redactor,
            temperatura=cfg_redactor["temperatura"],
            max_tokens=cfg_redactor["max_tokens"],
        )
        fases.append({
            "fase": 4,
            "agente": "redactor",
            "nombre": cfg_redactor["nombre"],
            "emoji": cfg_redactor["emoji"],
            "modelo": cfg_redactor["modelo"],
            "resultado": res_redactor,
        })
        blackboard["reporte"] = res_redactor.get("texto", "")

        # ═══════════════════════════════════════════════════════════════
        # SWAP 2: Liberar gemma4 → Cargar qwen3.5 para síntesis
        # ═══════════════════════════════════════════════════════════════
        print(f"🔄 [SWAP 2] Liberando {modelo_profundo} → Cargando {modelo_rapido}...")
        swap2_inicio = time.time()
        _liberar_modelo(modelo_profundo)
        num_swaps += 1
        swap2_duracion = round(time.time() - swap2_inicio, 2)
        fases.append({
            "fase": 4.5,
            "agente": "swap",
            "nombre": "Swap de Modelo",
            "emoji": "🔄",
            "modelo": f"{modelo_profundo} → {modelo_rapido}",
            "resultado": {
                "texto": f"Modelo cambiado exitosamente ({swap2_duracion}s)",
                "duracion_seg": swap2_duracion,
                "exito": True,
            },
        })

    # ═══════════════════════════════════════════════════════════════════
    # FASE 5: SINTETIZADOR (qwen3.5:4b-mlx) — Consolidación final
    # ═══════════════════════════════════════════════════════════════════
    print(f"🔄 [Fase 5] Sintetizador — Consolidando respuesta final...")
    cfg_sintesis = EXPERTOS["sintetizador"]
    
    # Preparar contexto de todos los expertos
    contexto_expertos = f"Consulta: {consulta}\n\n"
    contexto_expertos += f"=== Análisis de Datos (Analista) ===\n{blackboard.get('analisis_datos', 'No disponible')}\n\n"
    if modo in ("profundo", "debate"):
        contexto_expertos += f"=== Estrategia (Estratega) ===\n{blackboard.get('estrategia', 'No disponible')}\n\n"
        contexto_expertos += f"=== Reporte (Redactor) ===\n{blackboard.get('reporte', 'No disponible')}\n\n"
    contexto_expertos += "Consolida todo en un JSON estructurado con resumen, KPIs y plan de acción."

    res_sintesis = _hacer_peticion_ollama(
        modelo=cfg_sintesis["modelo"],
        system_prompt=cfg_sintesis["system_prompt"],
        user_prompt=contexto_expertos,
        temperatura=cfg_sintesis["temperatura"],
        max_tokens=cfg_sintesis["max_tokens"],
    )
    fases.append({
        "fase": 5,
        "agente": "sintetizador",
        "nombre": cfg_sintesis["nombre"],
        "emoji": cfg_sintesis["emoji"],
        "modelo": cfg_sintesis["modelo"],
        "resultado": res_sintesis,
    })

    duracion_total = round(time.time() - inicio_global, 2)
    tokens_totales = sum(f["resultado"].get("tokens_eval", 0) for f in fases if f["agente"] != "swap")

    print(f"\n✅ [MesaExpertos] Completada en {duracion_total}s | {num_swaps} swaps | {tokens_totales} tokens totales")

    return {
        "session_id": session_id,
        "fases": fases,
        "sintesis": res_sintesis.get("texto", ""),
        "meta": {
            "duracion_total_seg": duracion_total,
            "swaps": num_swaps,
            "tokens_totales": tokens_totales,
            "modo": modo,
            "modelos_usados": list(set(
                f["modelo"] for f in fases if f["agente"] != "swap"
            )),
        },
    }


# ─── Endpoint HTTP para integrar con el API Server existente ──────────────────

def handle_mesa_expertos_request(request_body):
    """
    Punto de entrada HTTP. Recibe un dict con:
      - query: consulta del usuario
      - context: contexto adicional (opcional)
      - mode: "rapido" | "profundo" | "debate"
    
    Retorna un dict JSON serializable con el resultado completo.
    """
    consulta = request_body.get("query", "")
    contexto = request_body.get("context", "")
    modo = request_body.get("mode", "profundo")

    if not consulta.strip():
        return {
            "status": "error",
            "message": "La consulta no puede estar vacía.",
        }

    resultado = ejecutar_mesa_de_expertos(consulta, contexto, modo)
    return {
        "status": "success",
        "data": resultado,
    }


# ─── Ejecución directa para pruebas ──────────────────────────────────────────

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 Mesa de Expertos — Prueba de Ejecución Directa")
    print("=" * 60)
    
    # Verificar modelos disponibles
    modelos = _verificar_modelos_disponibles()
    print(f"\n📋 Modelos disponibles en Ollama: {modelos or 'Ninguno (¿Ollama está corriendo?)'}")
    
    if modelos:
        resultado = ejecutar_mesa_de_expertos(
            consulta="Analizar crisis de desabasto de agua en Palo Verde (Distrito 8 de Hermosillo)",
            contexto="Población afectada: 45,000 asalariados. Severidad del dolor: 0.72",
            modo="rapido"  # Usar modo rápido para prueba rápida
        )
        print(f"\n📦 Resultado:\n{json.dumps(resultado, indent=2, ensure_ascii=False)[:2000]}...")
    else:
        print("\n⚠️ Ollama no está corriendo o no tiene modelos instalados.")
        print("   Ejecuta: ollama pull qwen3.5:4b-mlx && ollama pull gemma4:e4b-mlx")
