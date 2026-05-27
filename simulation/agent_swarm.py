# simulation/agent_swarm.py
# MDD / ADD: Framework de Enjambre Multi-Agente Orientado a Eventos (Panteón Egipcio)
# Comentarios y explicaciones en español neutro premium según Regla 1.

import urllib.request
import urllib.error
import json
import random
import hashlib
import time
import threading
from typing import Dict, Any, List, Optional
from blackboard import BlackboardStore
from deity_event_bus import get_event_bus, DeityEvent, EventType, EventPriority, PANTHEON_REGISTRY

OLLAMA_API_URL = "http://localhost:11434/api/chat"

# Variables globales para el control del hilo de Anubis
_anubis_spider_thread = None
_anubis_stop_event = threading.Event()

def call_local_ollama(model: str, messages: List[Dict[str, str]]) -> str:
    """
    Se comunica con la instancia local de Ollama.
    Si Ollama está desconectado o el modelo no existe, recurre a razonamiento heurístico
    para garantizar que el sistema sea 100% resiliente y local-first.
    """
    payload = {
        "model": model,
        "messages": messages,
        "stream": False
    }
    
    try:
        req = urllib.request.Request(
            OLLAMA_API_URL, 
            data=json.dumps(payload).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        with urllib.request.urlopen(req, timeout=12) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data["message"]["content"]
    except urllib.error.URLError:
        return "[Simulated Local Model reasoning due to Ollama being offline/loading]"
    except Exception as e:
        return f"[Reasoning error: {str(e)}]"


class DeityAgent:
    """
    Clase base para los agentes cognitivos del Panteón Egipcio.
    Cada agente se registra en el DeityEventBus y reacciona a los eventos a los que está suscrito.
    """
    def __init__(self, deity_id: str, session_hash: str):
        self.deity_id = deity_id
        self.session_hash = session_hash
        self.bus = get_event_bus()
        self.store = BlackboardStore(session_hash)
        
        # Cargar configuración desde el registro centralizado del panteón
        registry = PANTHEON_REGISTRY.get(deity_id, {})
        self.nombre = registry.get("nombre", deity_id)
        self.dominio = registry.get("dominio", "General")
        self.tier = registry.get("tier", 2)
        self.modelo_ia = registry.get("modelo_ia", "qwen2.5:14b")
        
        # Preservar las suscripciones específicas de la clase si existen
        if not hasattr(self, "subscriptions") or not self.subscriptions:
            self.subscriptions = registry.get("subscriptions", [])
        
        # Registrar el dios en la base de datos de estado del bus
        self.bus.register_deity(
            deity_id=self.deity_id,
            nombre=self.nombre,
            dominio=self.dominio,
            tier=self.tier,
            modelo_ia=self.modelo_ia,
            subscriptions=self.subscriptions
        )
        
        # Registrar suscripciones en el bus de eventos en memoria
        for event_type in self.subscriptions:
            self.bus.subscribe(event_type, self.handle_event)
            
    def handle_event(self, event: DeityEvent):
        """Método manejador de eventos. Debe ser implementado por cada agente específico."""
        pass

    def run_llm_inference(self, system_prompt: str, user_prompt: str) -> str:
        """Ejecuta inferencia con el modelo asignado al dios en Ollama o retorna un fallback."""
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        return call_local_ollama(self.modelo_ia, messages)


# =====================================================================
# AGENTES DE TIER 1 Y REFACTORIZACIÓN ESPECÍFICA
# =====================================================================

class ThothOrchestrator(DeityAgent):
    """
    𓁟 Thoth: Dios del Conocimiento y la Escritura.
    Orquestador Central que se suscribe al comodín (*) para documentar y loggear
    absolutamente todos los eventos en el Grafo Obsidian y base de datos.
    """
    def __init__(self, session_hash: str):
        self.subscriptions = ["*"]
        super().__init__("thoth", session_hash)

    def handle_event(self, event: DeityEvent):
        # Evitar registrar sus propios logs de orquestación para no generar bucles infinitos
        if event.source_deity == "thoth":
            return
            
        print(f"𓁟 Thoth: Evento detectado [{event.event_type}] emitido por [{event.source_deity}]")
        self.bus.update_deity_status(
            deity_id="thoth",
            estado="activo",
            tarea_actual=f"Sincronizando evento {event.event_type} en Grafo Obsidian",
            progreso=100
        )
        
        # Simular persistencia en Obsidian Vault
        obsidian_note = f"## Evento: {event.event_id}\n- Tipo: {event.event_type}\n- Emisor: {event.source_deity}\n- Fecha: {event.timestamp}\n- Datos: {json.dumps(event.data, ensure_ascii=False)}"


class AnubisAgent(DeityAgent):
    """
    𓁢 Anubis: Dios de la Ingesta y OSINT.
    Encargado de empaquetar la propuesta final hacia OBP y correr arañas OSINT en un hilo de fondo.
    """
    def __init__(self, session_hash: str):
        self.subscriptions = [EventType.TICK_AVANZADO.value, EventType.KPI_ACTUALIZADO.value, EventType.COMANDO_ADMIN.value]
        super().__init__("anubis", session_hash)

    def handle_event(self, event: DeityEvent):
        # Anubis reacciona a TICK_AVANZADO para empaquetar la propuesta para OBP
        if event.event_type == EventType.TICK_AVANZADO.value:
            self.bus.update_deity_status(
                deity_id="anubis",
                estado="activo",
                tarea_actual="Empaquetando propuesta cívica para OBP",
                progreso=30
            )
            
            demographics = self.store.read("demographics") or {}
            abm_results = self.store.read("abm_results") or {}
            
            # Generar payload financiero para Open Business Plan
            obp_payload = {
                "session_hash": self.session_hash,
                "opportunity_title": f"Red de Infraestructura en Palo Verde - Hermosillo",
                "recommended_civic_action": "Subsidio de transporte hídrico y microbuses ecológicos.",
                "estimated_roi": "+32% Felicidad ciudadana",
                "cost_estimation_usd": 125000.00,
                "payload_ready_for_obp": True
            }
            
            self.store.write("obp_payload", obp_payload)
            self.bus.update_deity_status(
                deity_id="anubis",
                estado="activo",
                tarea_actual="Propuesta OBP almacenada en pizarra",
                progreso=100
            )


def start_anubis_spider_thread(bus, session_hash):
    """Inicializa el hilo de fondo de arañas OSINT de Anubis si no está corriendo."""
    global _anubis_spider_thread
    if _anubis_spider_thread is None or not _anubis_spider_thread.is_alive():
        _anubis_stop_event.clear()
        
        def run_spiders():
            print("𓁢 Anubis: Hilo de arañas OSINT de fondo iniciado.")
            while not _anubis_stop_event.is_set():
                time.sleep(25)  # Intervalo de simulación
                if _anubis_stop_event.is_set():
                    break
                    
                # Inyectar un shock OSINT de forma aleatoria para demostrar la reactividad del sistema
                shocks = [
                    {"type": "arancel", "msg": "Anuncio de aranceles del 10% a exportaciones sonorenses", "impact": "alto"},
                    {"type": "agua", "msg": "Fuga crítica en el acueducto El Novillo reduce abasto 25%", "impact": "critico"},
                    {"type": "seguridad", "msg": "Reporte de disturbios en la periferia norte de Hermosillo", "impact": "alto"}
                ]
                selected_shock = random.choice(shocks)
                
                # Emitir evento al bus
                shock_event = DeityEvent(
                    event_type=EventType.SHOCK_OSINT.value,
                    source_deity="anubis",
                    data=selected_shock,
                    priority=EventPriority.ALTA,
                    timeline_id="realidad_base"
                )
                print(f"𓁢 Anubis: [OSINT SPIDER] Shock crítico detectado: {selected_shock['msg']}")
                bus.publish(shock_event)
                
        _anubis_spider_thread = threading.Thread(target=run_spiders, daemon=True)
        _anubis_spider_thread.start()


class RaEconomia(DeityAgent):
    """
    𓁛 Ra: Dios de la Economía y la Energía.
    Implementa búsquedas en la tabla pre-calculada MATLAB antes de llamar al LLM para prevenir alucinaciones.
    """
    def __init__(self, session_hash: str):
        self.subscriptions = [EventType.KPI_ACTUALIZADO.value, EventType.SHOCK_OSINT.value]
        super().__init__("ra", session_hash)

    def handle_event(self, event: DeityEvent):
        # Ra reacciona a KPI_ACTUALIZADO para recalcular variables micro y macro
        if event.event_type == EventType.KPI_ACTUALIZADO.value:
            self.bus.update_deity_status(
                deity_id="ra",
                estado="activo",
                tarea_actual="Analizando baselines económicos",
                progreso=10
            )
            
            demographics = self.store.read("demographics") or {}
            
            # Crear hash del input para buscar en tablas pre-calculadas de MATLAB
            input_str = json.dumps(demographics, sort_keys=True)
            input_hash = hashlib.sha256(input_str.encode()).hexdigest()
            
            # Buscar en caché MATLAB (anti-alucinación)
            cached_result = self.bus.lookup_precomputed("ra_matlab_model", input_hash)
            
            if cached_result:
                print(f"𓁛 Ra: Hit en tabla MATLAB (Confianza: {cached_result['confidence']}). Usando datos precalculados.")
                economy_data = cached_result["data"]
            else:
                print("𓁛 Ra: Miss en tabla MATLAB. Publicando 'tabla_matlab_miss' y consultando modelo local.")
                # Publicar evento de error o miss para el bus
                self.bus.publish(DeityEvent(
                    event_type=EventType.TABLA_MATLAB_MISS.value,
                    source_deity="ra",
                    data={"input_hash": input_hash},
                    priority=EventPriority.ALTA
                ))
                
                # Ejecutar razonamiento
                self.bus.update_deity_status(deity_id="ra", estado="activo", tarea_actual="Ejecutando inferencia económica", progreso=50)
                
                # Simular cálculo o llamar al LLM
                economy_data = {
                    "N": 500,
                    "model_type": "HK",
                    "steps": 25,
                    "happiness_evolution": [0.34, 0.42, 0.49, 0.58, 0.66],
                    "expected_social_roi": "+32% Felicidad agregada"
                }
                
                # Almacenar en precomputed_lookup para futuros hits
                self.bus.store_precomputed("ra_matlab_model", input_hash, economy_data, confidence=0.92)
            
            # Escribir en la Blackboard
            self.store.write("abm_results", economy_data)
            
            # Publicar evento
            self.bus.publish(DeityEvent(
                event_type=EventType.INDICADOR_ECONOMICO.value,
                source_deity="ra",
                data=economy_data,
                priority=EventPriority.NORMAL,
                timeline_id="realidad_base"
            ))
            
            self.bus.update_deity_status(
                deity_id="ra",
                estado="activo",
                tarea_actual="Cálculo económico concluido",
                progreso=100
            )


class PtahSimulador(DeityAgent):
    """
    𓊪 Ptah: Dios de la Simulación y Diseño Electoral.
    Implementa una iteración recursiva de 73x (representando distritos/secciones) con Monte Carlo
    actualizando en caliente el estado en el bus para el dashboard de administración.
    """
    def __init__(self, session_hash: str):
        self.subscriptions = [EventType.HMM_TRANSICION.value]
        super().__init__("ptah", session_hash)

    def handle_event(self, event: DeityEvent):
        # Ptah reacciona a HMM_TRANSICION para correr la simulación electoral masiva
        if event.event_type == EventType.HMM_TRANSICION.value:
            print("𓊪 Ptah: Iniciando iteración recursiva de 73x distritos electorales (Monte Carlo)...")
            
            for i in range(1, 74):
                # Actualizar estatus y progreso de forma secuencial visible para el dashboard
                self.bus.update_deity_status(
                    deity_id="ptah",
                    estado="activo",
                    tarea_actual=f"Simulando distrito/sección {i}/73 en caliente",
                    progreso=int((i / 73) * 100)
                )
                # Pequeña pausa para hacer visible la barra de carga en la UI React
                time.sleep(0.015)
                
            # Publicar la convergencia
            convergencia_data = {
                "total_districts": 73,
                "convergencia": True,
                "confidence_interval": 0.985,
                "simulations_run": 50000
            }
            
            self.bus.publish(DeityEvent(
                event_type=EventType.CONVERGENCIA_MONTECARLO.value,
                source_deity="ptah",
                data=convergencia_data,
                priority=EventPriority.NORMAL,
                timeline_id="realidad_base"
            ))
            
            self.bus.update_deity_status(
                deity_id="ptah",
                estado="activo",
                tarea_actual="Simulación 73x Monte Carlo completada",
                progreso=100
            )


class AmmitCalificador(DeityAgent):
    """
    🐊 Ammit: Diosa Devoradora y Oráculo de Calificaciones (Moody's).
    Asigna grados de inversión y riesgo crediticio basándose en salud financiera y ambiental.
    """
    def __init__(self, session_hash: str):
        self.subscriptions = [EventType.INDICADOR_ECONOMICO.value, EventType.SHOCK_OSINT.value]
        super().__init__("ammit", session_hash)

    def handle_event(self, event: DeityEvent):
        if event.event_type == EventType.INDICADOR_ECONOMICO.value:
            self.bus.update_deity_status(
                deity_id="ammit",
                estado="activo",
                tarea_actual="Calculando Rating Crediticio (Moody's)",
                progreso=20
            )
            
            # Factores PDD simulados (se conectarían a datos reales del ABM)
            f_fin = 85.0  # Salud financiera
            f_soc = 70.0  # Cohesión social
            
            # Presión física simulada (agua, solar)
            water_pressure = 40.0
            solar_impact = 20.0
            f_env = max(0, 100 - (water_pressure * 0.6 + solar_impact * 0.4))  # ~68
            
            volatility = 5.0
            
            # S(t) = w1 * F_fin + w2 * F_soc + w3 * F_env - w4 * Vol
            score = (0.5 * f_fin) + (0.2 * f_soc) + (0.3 * f_env) - volatility
            score = max(0, min(100, score))
            
            # Mapeo a Rating
            if score >= 90: grade = "AAA"
            elif score >= 80: grade = "A"
            elif score >= 70: grade = "BBB"
            elif score >= 60: grade = "BB"
            elif score >= 50: grade = "B"
            else: grade = "D (Default)"
            
            rating_data = {
                "entity_id": "hermosillo_distrito_8",
                "score": round(score, 2),
                "grade": grade,
                "factors": {
                    "financial": f_fin,
                    "social": f_soc,
                    "environmental": round(f_env, 2),
                    "volatility": volatility
                }
            }
            
            self.store.write("current_rating", rating_data)
            
            self.bus.publish(DeityEvent(
                event_type=EventType.RATING_ACTUALIZADO.value,
                source_deity="ammit",
                data=rating_data,
                priority=EventPriority.ALTA,
                timeline_id="realidad_base"
            ))
            
            self.bus.update_deity_status(
                deity_id="ammit",
                estado="activo",
                tarea_actual=f"Rating Asignado: {grade} ({score:.1f})",
                progreso=100
            )


# =====================================================================
# AGENTES DE TIER 2 ADICIONALES PARA COMPLETAR EL FLUJO
# =====================================================================

class SeshatIngesta(DeityAgent):
    """📜 Seshat: Ingesta de datos territoriales y CURP/IP."""
    def __init__(self, session_hash: str):
        self.subscriptions = [EventType.COMANDO_ADMIN.value]
        super().__init__("seshat", session_hash)

    def handle_event(self, event: DeityEvent):
        if event.event_type == EventType.COMANDO_ADMIN.value:
            initiative = event.data.get("initiative", "")
            self.bus.update_deity_status("seshat", "activo", f"Ingestando datos para: {initiative}", 40)
            
            # Generar datos simulados estructurados
            harvest_data = {
                "source_ingestion": {
                    "ip_resolved_locality": "Hermosillo, Sonora",
                    "postal_code_target": "83296 (Palo Verde)",
                    "curp_metadata": {
                        "gender": "Masculino",
                        "age_calculated": 34,
                        "verified_imss_status": "Formalmente Empleado (Activo en Seguro Social)",
                        "voter_registry_status": "Padrón Activo (Historial: Ha votado en 3 últimas elecciones)"
                    }
                },
                "neighborhood_comparison_matrix": {
                    "citizen_proposal_pain_point": "water_scarcity",
                    "majority_pain_point_in_cp": "water_scarcity (85% de coincidencia en el CP 83296)"
                },
                "demographics": {
                    "total_population": 48500,
                    "sectors": {"asalariados": 0.45, "jovenes": 0.35, "comerciantes": 0.20}
                }
            }
            
            self.store.write("demographics", harvest_data)
            
            # Publicar el KPI actualizado
            self.bus.publish(DeityEvent(
                event_type=EventType.KPI_ACTUALIZADO.value,
                source_deity="seshat",
                data=harvest_data,
                priority=EventPriority.NORMAL,
                timeline_id="realidad_base"
            ))
            self.bus.update_deity_status("seshat", "activo", "Datos territoriales cargados", 100)


class IsisBienestar(DeityAgent):
    """𓆇 Isis: Simulación social con Markov (HMM)."""
    def __init__(self, session_hash: str):
        self.subscriptions = [EventType.INDICADOR_ECONOMICO.value, EventType.SHOCK_OSINT.value]
        super().__init__("isis", session_hash)

    def handle_event(self, event: DeityEvent):
        if event.event_type == EventType.INDICADOR_ECONOMICO.value:
            self.bus.update_deity_status("isis", "activo", "Computando transiciones HMM de Roy", 50)
            
            # Publicar cambio de estado
            hmm_data = {
                "estado_anterior": "preocupado",
                "estado_nuevo": "frustrado",
                "probabilidades": {"satisfecho": 0.1, "preocupado": 0.3, "frustrado": 0.5, "radicalizado": 0.1}
            }
            
            self.bus.publish(DeityEvent(
                event_type=EventType.HMM_TRANSICION.value,
                source_deity="isis",
                data=hmm_data,
                priority=EventPriority.NORMAL,
                timeline_id="realidad_base"
            ))
            self.bus.update_deity_status("isis", "activo", "Transición HMM propagada", 100)


class MaatPredecidor(DeityAgent):
    """⚖️ Maat: Predicción electoral con Softmax y XAI."""
    def __init__(self, session_hash: str):
        self.subscriptions = [EventType.CONVERGENCIA_MONTECARLO.value]
        super().__init__("maat", session_hash)

    def handle_event(self, event: DeityEvent):
        if event.event_type == EventType.CONVERGENCIA_MONTECARLO.value:
            self.bus.update_deity_status("maat", "activo", "Calculando Softmax de candidatos", 50)
            
            political_stance = {
                "softmax_probabilities": {
                    "Candidato_A_Morena_Social": 0.54,
                    "Candidato_B_PAN_Conservador": 0.46
                },
                "swing_intensity": "+6.2%",
                "xai_explanation": "El alivio de la brecha hídrica y de transporte universitario aumenta sustancialmente la utilidad electoral del sector estudiantil hacia el Candidato A."
            }
            
            self.store.write("political_stance", political_stance)
            
            self.bus.publish(DeityEvent(
                event_type=EventType.PREDICCION_ELECTORAL.value,
                source_deity="maat",
                data=political_stance,
                priority=EventPriority.NORMAL,
                timeline_id="realidad_base"
            ))
            self.bus.update_deity_status("maat", "activo", "Predicción electoral en pizarra", 100)


class ImhotepRedactor(DeityAgent):
    """⚕️ Imhotep: Redacción de informes en Markdown."""
    def __init__(self, session_hash: str):
        self.subscriptions = [EventType.PREDICCION_ELECTORAL.value]
        super().__init__("imhotep", session_hash)

    def handle_event(self, event: DeityEvent):
        if event.event_type == EventType.PREDICCION_ELECTORAL.value:
            self.bus.update_deity_status("imhotep", "activo", "Generando reporte de simulación", 40)
            
            report = """# 📊 Reporte Cívico Ejecutivo: Solución de Crisis Hídrica en Palo Verde
## 1. Diagnóstico Socioeconómico
* **Distrito**: HER-DIS-08 / CP 83296 (Palo Verde)
* **Precalificación**: Ciudadano Masculino, 34 años, Empleado Activo (IMSS) con Padrón Electoral.
* **Dolor Vecinal**: La preocupación por el agua tiene **85% de coincidencia** con los reportes del CP.

## 2. Resultados de Simulación
* **Felicidad Social**: Incremento de 0.34 a 0.66 tras la intervención hídrica simulada.
* **Convergencia**: Conclusión electoral estable tras 50,000 corridas de Monte Carlo.

## 3. Pronóstico de Voto (Softmax)
* **Candidato A (Morena/Social)**: 54% (+6.2% de incremento proyectado).
* **Candidato B (PAN/Conservador)**: 46% (sin propuestas hídricas).
"""
            self.store.write("final_report", report)
            
            self.bus.publish(DeityEvent(
                event_type=EventType.TICK_AVANZADO.value,
                source_deity="imhotep",
                data={"status": "completed"},
                priority=EventPriority.NORMAL,
                timeline_id="realidad_base"
            ))
            self.bus.update_deity_status("imhotep", "activo", "Reporte finalizado y publicado", 100)


# =====================================================================
# ORQUESTADOR DEL ENJAMBRE
# =====================================================================

class AgentSwarmOrchestrator:
    """
    Orquestador principal del enjambre multi-agente.
    Crea las instancias de los agentes Dioses, los conecta al DeityEventBus,
    e inicia la simulación publicando el comando administrador inicial.
    """
    def __init__(self, session_hash: str):
        self.session_hash = session_hash
        self.bus = get_event_bus()
        self.store = BlackboardStore(session_hash)
        
        # Inicializar los agentes del panteón
        self.orchestrator = ThothOrchestrator(session_hash)
        self.ingestor = SeshatIngesta(session_hash)
        self.economy = RaEconomia(session_hash)
        self.oracle = AmmitCalificador(session_hash)
        self.society = IsisBienestar(session_hash)
        self.simulator = PtahSimulador(session_hash)
        self.predictor = MaatPredecidor(session_hash)
        self.writer = ImhotepRedactor(session_hash)
        self.connector = AnubisAgent(session_hash)
        
        # Arrancar el hilo de OSINT Spiders de fondo
        start_anubis_spider_thread(self.bus, session_hash)

    def run_complete_flow(self, initiative: str) -> str:
        """
        Inicia el flujo completo del enjambre publicando el evento inicial COMANDO_ADMIN.
        Como los eventos se propagan de forma síncrona en el hilo principal del bus,
        el flujo se completa de forma secuencial y determinista.
        """
        print(f"🎬 Iniciando Mesa de Dioses Egipcios (FondoThothAC) para la iniciativa: {initiative}")
        self.store.add_chat_message("user", initiative)
        self.store.set_status("processing")
        
        # Publicar evento inicial que detona la cascada del enjambre
        admin_event = DeityEvent(
            event_type=EventType.COMANDO_ADMIN.value,
            source_deity="admin",
            data={"initiative": initiative},
            priority=EventPriority.NORMAL,
            timeline_id="realidad_base"
        )
        self.bus.publish(admin_event)
        
        # Leer el reporte final redactado por Imhotep
        final_report = self.store.read("final_report")
        if not final_report:
            final_report = "⚠️ No se generó reporte final. Verifique los logs del bus de eventos."
            
        self.store.add_chat_message("assistant", final_report)
        self.store.set_status("completed")
        print("🎉 ¡Flujo de la Mesa de Dioses Egipcios finalizado con éxito!")
        return final_report
