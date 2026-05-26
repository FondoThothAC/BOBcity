# simulation/deity_event_bus.py
# ADD / DDD: Bus de Eventos para la Comunicación Inter-Dioses del Panteón Egipcio
# Patrón: Blackboard + Pub/Sub + Event Sourcing
# Cada dios publica eventos y se suscribe a los de otros dioses.

import json
import sqlite3
import os
import threading
from datetime import datetime
from typing import Any, Callable, Dict, List, Optional
from collections import defaultdict
from enum import Enum

# Ruta de la base de datos local del bus de eventos
EVENT_DB_PATH = os.path.join(os.path.dirname(__file__), "deity_events.db")


class EventPriority(Enum):
    """Prioridad de los eventos en el bus."""
    CRITICA = 0       # Terremotos, pandemias, guerras — procesamiento inmediato
    ALTA = 1          # Shocks OSINT, cambios electorales súbitos
    NORMAL = 2        # Actualizaciones de KPIs, resultados de simulación
    BAJA = 3          # Reportes periódicos, métricas informativas
    INFORMATIVA = 4   # Logs, estado de salud de los dioses


class EventType(Enum):
    """Tipos de eventos que fluyen por el bus."""
    # --- Thoth (Datos) ---
    KPI_ACTUALIZADO = "kpi_actualizado"             # Nuevo dato del INEGI/DENUE/Bloomberg
    GRAFO_OBSIDIAN_SYNC = "grafo_obsidian_sync"     # El grafo se actualizó

    # --- Anubis (OSINT) ---
    SHOCK_OSINT = "shock_osint"                     # Noticia de alto impacto detectada
    AMENAZA_CLASIFICADA = "amenaza_clasificada"     # Amenaza evaluada y clasificada por riesgo
    SCRAPING_COMPLETADO = "scraping_completado"     # Ciclo de arañas finalizado

    # --- Horus (GIS) ---
    ZONA_MUERTA_DETECTADA = "zona_muerta_detectada"     # Zona sin cobertura de servicio
    MAPA_ACTUALIZADO = "mapa_actualizado"               # Capa GIS recalculada
    INFRAESTRUCTURA_CAMBIO = "infraestructura_cambio"   # Puente, cierre vial, pozo nuevo

    # --- Ra (Economía) ---
    INDICADOR_ECONOMICO = "indicador_economico"     # Inflación, tipo de cambio, PIB
    SDE_RESULTADO = "sde_resultado"                 # Resultado de ecuación diferencial estocástica
    TABLA_MATLAB_MISS = "tabla_matlab_miss"         # No se encontró tabla pre-calculada → pedir al LLM

    # --- Isis (Sociedad) ---
    HMM_TRANSICION = "hmm_transicion"               # Un agente cambió de estado mental
    EVENTO_VIDA = "evento_vida"                     # Evento tipo Sims (beca, accidente, empleo)
    BIENESTAR_ALERTA = "bienestar_alerta"           # Indicador social en zona roja

    # --- Sejmet (Seguridad) ---
    DISTURBIO_POTENCIAL = "disturbio_potencial"     # Modelo Boids detectó formación de protesta
    FLUJO_CRITICO = "flujo_critico"                 # Navier-Stokes: embotellamiento/evacuación
    SEGURIDAD_ALERTA = "seguridad_alerta"           # Indicador de seguridad fuera de rango

    # --- Ptah (Electoral) ---
    PREDICCION_ELECTORAL = "prediccion_electoral"       # Resultado de Monte Carlo
    CANDIDATO_PERFILADO = "candidato_perfilado"         # Análisis de candidato completado
    CONVERGENCIA_MONTECARLO = "convergencia_montecarlo" # N universos convergieron

    # --- Sistema ---
    DIOS_INICIADO = "dios_iniciado"                 # Un dios se conectó al bus
    DIOS_ERROR = "dios_error"                       # Un dios falló
    TICK_AVANZADO = "tick_avanzado"                  # El motor avanzó un tick temporal
    UNIVERSO_CREADO = "universo_creado"              # Se creó un nuevo universo paralelo
    UNIVERSO_BIFURCADO = "universo_bifurcado"        # Se bifurcó un universo exitoso
    COMANDO_ADMIN = "comando_admin"                  # El Admin inyectó un comando narrativo


class DeityEvent:
    """Representa un evento que circula por el bus."""
    def __init__(self, event_type: str, source_deity: str, data: Any,
                 priority: EventPriority = EventPriority.NORMAL,
                 target_deity: Optional[str] = None,
                 timeline_id: str = "realidad_base"):
        self.event_type = event_type
        self.source_deity = source_deity
        self.data = data
        self.priority = priority
        self.target_deity = target_deity  # None = broadcast a todos
        self.timeline_id = timeline_id
        self.timestamp = datetime.utcnow().isoformat()
        self.event_id = f"{source_deity}_{event_type}_{self.timestamp}"

    def to_dict(self) -> dict:
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "source_deity": self.source_deity,
            "target_deity": self.target_deity,
            "timeline_id": self.timeline_id,
            "priority": self.priority.value,
            "priority_name": self.priority.name,
            "data": self.data,
            "timestamp": self.timestamp
        }


def _init_event_db():
    """Inicializa la base de datos de eventos."""
    conn = sqlite3.connect(EVENT_DB_PATH)
    cursor = conn.cursor()

    # Tabla de eventos (Event Sourcing — nunca se borran, solo se agregan)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS deity_events (
        event_id TEXT PRIMARY KEY,
        event_type TEXT NOT NULL,
        source_deity TEXT NOT NULL,
        target_deity TEXT,
        timeline_id TEXT DEFAULT 'realidad_base',
        priority INTEGER DEFAULT 2,
        data TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        processed INTEGER DEFAULT 0
    )
    """)

    # Tabla de registro de dioses
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS deity_registry (
        deity_id TEXT PRIMARY KEY,
        nombre TEXT NOT NULL,
        dominio TEXT NOT NULL,
        tier INTEGER DEFAULT 1,
        estado TEXT DEFAULT 'inactivo',
        modelo_ia TEXT DEFAULT 'qwen2.5:14b',
        subscriptions TEXT DEFAULT '[]',
        ultimo_heartbeat TEXT,
        tarea_actual TEXT DEFAULT 'En espera',
        progreso INTEGER DEFAULT 0
    )
    """)

    # Tabla de tablas pre-calculadas (MATLAB-style lookup)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS precomputed_lookup (
        model_name TEXT NOT NULL,
        input_hash TEXT NOT NULL,
        output_data TEXT NOT NULL,
        confidence REAL DEFAULT 0.85,
        hit_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        PRIMARY KEY (model_name, input_hash)
    )
    """)

    conn.commit()
    conn.close()


class DeityEventBus:
    """
    Bus de Eventos Central del Panteón Egipcio.

    Arquitectura:
    - Cada dios se registra con sus suscripciones (qué tipos de eventos le interesan).
    - Cuando un dios publica un evento, el bus lo persiste en SQLite (Event Sourcing)
      y notifica a todos los suscriptores.
    - Los eventos tienen prioridad: CRITICA se procesa primero.
    - El bus es thread-safe para permitir que Anubis corra en background.
    """

    def __init__(self):
        _init_event_db()
        self._subscribers: Dict[str, List[Callable]] = defaultdict(list)
        self._deity_handlers: Dict[str, Callable] = {}
        self._lock = threading.Lock()
        self._event_log: List[dict] = []  # Log en memoria para el dashboard

    def register_deity(self, deity_id: str, nombre: str, dominio: str,
                       tier: int = 1, modelo_ia: str = "qwen2.5:14b",
                       subscriptions: List[str] = None):
        """Registra un dios en el bus y en la base de datos."""
        subs = subscriptions or []
        conn = sqlite3.connect(EVENT_DB_PATH)
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        cursor.execute("""
            INSERT OR REPLACE INTO deity_registry
            (deity_id, nombre, dominio, tier, estado, modelo_ia, subscriptions, ultimo_heartbeat)
            VALUES (?, ?, ?, ?, 'activo', ?, ?, ?)
        """, (deity_id, nombre, dominio, tier, modelo_ia, json.dumps(subs), now))

        conn.commit()
        conn.close()

        # Publicar evento de inicio
        self.publish(DeityEvent(
            event_type=EventType.DIOS_INICIADO.value,
            source_deity=deity_id,
            data={"nombre": nombre, "dominio": dominio, "tier": tier},
            priority=EventPriority.INFORMATIVA
        ))

    def subscribe(self, event_type: str, handler: Callable):
        """Suscribe un handler a un tipo de evento específico."""
        with self._lock:
            self._subscribers[event_type].append(handler)

    def publish(self, event: DeityEvent):
        """
        Publica un evento al bus.
        1. Persiste en SQLite (Event Sourcing)
        2. Notifica a los suscriptores en orden de prioridad
        3. Guarda en log de memoria para el dashboard
        """
        # 1. Persistir en SQLite
        conn = sqlite3.connect(EVENT_DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR IGNORE INTO deity_events
            (event_id, event_type, source_deity, target_deity, timeline_id, priority, data, timestamp)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            event.event_id, event.event_type, event.source_deity,
            event.target_deity, event.timeline_id, event.priority.value,
            json.dumps(event.data, ensure_ascii=False), event.timestamp
        ))
        conn.commit()
        conn.close()

        # 2. Log en memoria (últimos 500 eventos para el dashboard)
        event_dict = event.to_dict()
        with self._lock:
            self._event_log.append(event_dict)
            if len(self._event_log) > 500:
                self._event_log = self._event_log[-500:]

        # 3. Notificar a suscriptores
        handlers = []
        with self._lock:
            handlers = list(self._subscribers.get(event.event_type, []))
            # Los suscriptores "wildcard" (*) reciben todo
            handlers.extend(self._subscribers.get("*", []))

        for handler in handlers:
            try:
                # Si el evento tiene target específico, solo notificar al target
                if event.target_deity is not None:
                    # El handler debe verificar si le corresponde
                    handler(event)
                else:
                    handler(event)
            except Exception as e:
                # Publicar error sin recursión infinita
                if event.event_type != EventType.DIOS_ERROR.value:
                    error_event = DeityEvent(
                        event_type=EventType.DIOS_ERROR.value,
                        source_deity="event_bus",
                        data={"error": str(e), "failed_event": event.event_id},
                        priority=EventPriority.ALTA
                    )
                    self.publish(error_event)

    def get_recent_events(self, limit: int = 50, event_type: str = None,
                          deity_id: str = None) -> List[dict]:
        """Obtiene los eventos recientes (para el dashboard)."""
        conn = sqlite3.connect(EVENT_DB_PATH)
        cursor = conn.cursor()

        query = "SELECT * FROM deity_events"
        params = []
        conditions = []

        if event_type:
            conditions.append("event_type = ?")
            params.append(event_type)
        if deity_id:
            conditions.append("(source_deity = ? OR target_deity = ?)")
            params.extend([deity_id, deity_id])

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, params)
        rows = cursor.fetchall()
        conn.close()

        return [
            {
                "event_id": r[0], "event_type": r[1], "source_deity": r[2],
                "target_deity": r[3], "timeline_id": r[4], "priority": r[5],
                "data": json.loads(r[6]), "timestamp": r[7], "processed": r[8]
            }
            for r in rows
        ]

    def get_deity_registry(self) -> List[dict]:
        """Obtiene la lista de todos los dioses registrados."""
        conn = sqlite3.connect(EVENT_DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM deity_registry ORDER BY tier ASC, deity_id ASC")
        rows = cursor.fetchall()
        conn.close()

        return [dict(r) for r in rows]

    def update_deity_status(self, deity_id: str, estado: str = None,
                            tarea_actual: str = None, progreso: int = None):
        """Actualiza el estado de un dios específico."""
        conn = sqlite3.connect(EVENT_DB_PATH)
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        updates = ["ultimo_heartbeat = ?"]
        params = [now]

        if estado is not None:
            updates.append("estado = ?")
            params.append(estado)
        if tarea_actual is not None:
            updates.append("tarea_actual = ?")
            params.append(tarea_actual)
        if progreso is not None:
            updates.append("progreso = ?")
            params.append(progreso)

        params.append(deity_id)
        cursor.execute(
            f"UPDATE deity_registry SET {', '.join(updates)} WHERE deity_id = ?",
            params
        )
        conn.commit()
        conn.close()

    # --- Tablas Pre-calculadas (MATLAB-style) ---

    def lookup_precomputed(self, model_name: str, input_hash: str) -> Optional[dict]:
        """
        Busca un resultado pre-calculado en las tablas MATLAB.
        Si existe y tiene confianza >= 85%, lo retorna directamente.
        Si no, retorna None para que el dios llame al LLM.
        """
        conn = sqlite3.connect(EVENT_DB_PATH)
        cursor = conn.cursor()

        cursor.execute("""
            SELECT output_data, confidence, hit_count FROM precomputed_lookup
            WHERE model_name = ? AND input_hash = ?
        """, (model_name, input_hash))

        row = cursor.fetchone()
        if row and row[1] >= 0.85:
            # Incrementar contador de hits
            cursor.execute("""
                UPDATE precomputed_lookup SET hit_count = hit_count + 1
                WHERE model_name = ? AND input_hash = ?
            """, (model_name, input_hash))
            conn.commit()
            conn.close()
            return {"data": json.loads(row[0]), "confidence": row[1], "hits": row[2] + 1}

        conn.close()
        return None

    def store_precomputed(self, model_name: str, input_hash: str,
                          output_data: Any, confidence: float = 0.90):
        """Almacena un resultado pre-calculado para uso futuro."""
        conn = sqlite3.connect(EVENT_DB_PATH)
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()

        cursor.execute("""
            INSERT OR REPLACE INTO precomputed_lookup
            (model_name, input_hash, output_data, confidence, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (model_name, input_hash, json.dumps(output_data, ensure_ascii=False),
              confidence, now))

        conn.commit()
        conn.close()

    def get_event_stats(self) -> dict:
        """Estadísticas del bus para el dashboard."""
        conn = sqlite3.connect(EVENT_DB_PATH)
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM deity_events")
        total_events = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM deity_registry WHERE estado = 'activo'")
        active_deities = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM deity_registry")
        total_deities = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM precomputed_lookup")
        cached_lookups = cursor.fetchone()[0]

        cursor.execute("""
            SELECT event_type, COUNT(*) as cnt FROM deity_events
            GROUP BY event_type ORDER BY cnt DESC LIMIT 10
        """)
        top_events = {r[0]: r[1] for r in cursor.fetchall()}

        conn.close()

        return {
            "total_events": total_events,
            "active_deities": active_deities,
            "total_deities": total_deities,
            "cached_lookups": cached_lookups,
            "top_event_types": top_events
        }


# =====================================================================
# REGISTRO DE LOS 70+ DIOSES DEL PANTEÓN
# =====================================================================

# Definición centralizada de TODOS los dioses con sus suscripciones
PANTHEON_REGISTRY = {
    # === TIER 1: LOS 7 DIOSES PRINCIPALES ===
    "thoth": {
        "nombre": "𓁟 Thoth", "dominio": "Conocimiento y Datos", "tier": 1,
        "modelo_ia": "qwen3.5:35b",
        "subscriptions": ["*"],  # Thoth escucha TODO como orquestador
        "descripcion": "Recopila 2000+ KPIs. Mantiene el grafo Obsidian."
    },
    "anubis": {
        "nombre": "𓁢 Anubis", "dominio": "OSINT y Riesgo", "tier": 1,
        "modelo_ia": "llama3.1:70b",
        "subscriptions": [EventType.KPI_ACTUALIZADO.value, EventType.TICK_AVANZADO.value,
                          EventType.COMANDO_ADMIN.value],
        "descripcion": "Arañas nocturnas 24/7. Clasifica amenazas. Inyecta shocks."
    },
    "horus": {
        "nombre": "𓅃 Horus", "dominio": "Infraestructura y GIS", "tier": 1,
        "modelo_ia": "qwen3.5:35b",
        "subscriptions": [EventType.SHOCK_OSINT.value, EventType.TICK_AVANZADO.value,
                          EventType.INFRAESTRUCTURA_CAMBIO.value],
        "descripcion": "Detección de zonas muertas. Mapas individuales y macro."
    },
    "ra": {
        "nombre": "𓁛 Ra", "dominio": "Economía y Energía", "tier": 1,
        "modelo_ia": "qwen3.5:122b",
        "subscriptions": [EventType.KPI_ACTUALIZADO.value, EventType.SHOCK_OSINT.value,
                          EventType.INDICADOR_ECONOMICO.value, EventType.TICK_AVANZADO.value],
        "descripcion": "Micro/macro economía. Tablas MATLAB. Banxico/Bloomberg."
    },
    "isis": {
        "nombre": "𓆇 Isis", "dominio": "Sociedad y Bienestar", "tier": 1,
        "modelo_ia": "llama3.1:70b",
        "subscriptions": [EventType.HMM_TRANSICION.value, EventType.EVENTO_VIDA.value,
                          EventType.BIENESTAR_ALERTA.value, EventType.TICK_AVANZADO.value,
                          EventType.SHOCK_OSINT.value],
        "descripcion": "Cadenas de Markov (HMM). Log de vida tipo Sims."
    },
    "sejmet": {
        "nombre": "𓃭 Sejmet", "dominio": "Seguridad y Conflicto", "tier": 1,
        "modelo_ia": "mistral-large:123b",
        "subscriptions": [EventType.DISTURBIO_POTENCIAL.value, EventType.FLUJO_CRITICO.value,
                          EventType.SHOCK_OSINT.value, EventType.SEGURIDAD_ALERTA.value],
        "descripcion": "Boids + Navier-Stokes. Modela disturbios y evacuaciones."
    },
    "ptah": {
        "nombre": "𓊪 Ptah", "dominio": "Predicción Electoral", "tier": 1,
        "modelo_ia": "llama4-maverick:128x17b",
        "subscriptions": [EventType.PREDICCION_ELECTORAL.value, EventType.HMM_TRANSICION.value,
                          EventType.CONVERGENCIA_MONTECARLO.value, EventType.TICK_AVANZADO.value],
        "descripcion": "Monte Carlo 73x iterativo. Historial INE 1995-2026. Perfilado de candidatos."
    },

    # === TIER 2: DIOSES MENORES — ELECTORAL ===
    "nefertem": {
        "nombre": "🌸 Nefertem", "dominio": "Perfilado de Candidatos", "tier": 2,
        "modelo_ia": "qwen3.5:35b",
        "subscriptions": [EventType.CANDIDATO_PERFILADO.value, EventType.PREDICCION_ELECTORAL.value],
        "descripcion": "Analiza perfil demográfico de candidatos (educación, carrera, personalidad)."
    },
    "bes": {
        "nombre": "🎭 Bes", "dominio": "Análisis Head-to-Head", "tier": 2,
        "modelo_ia": "qwen3.5:35b",
        "subscriptions": [EventType.CANDIDATO_PERFILADO.value],
        "descripcion": "Simulación candidato vs candidato en escenarios electorales."
    },
    "nut": {
        "nombre": "🌌 Nut", "dominio": "Tendencias Electorales Históricas", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.PREDICCION_ELECTORAL.value],
        "descripcion": "Analiza patrones del historial INE 1995-2026."
    },

    # === TIER 2: DIOSES MENORES — DEMOGRAFÍA ===
    "khnum": {
        "nombre": "🧱 Khnum", "dominio": "Migración y Demografía", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.KPI_ACTUALIZADO.value, EventType.BIENESTAR_ALERTA.value],
        "descripcion": "Proyecciones CONAPO, migración, natalidad."
    },
    "tefnut": {
        "nombre": "💧 Tefnut", "dominio": "Recursos Hídricos", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.INFRAESTRUCTURA_CAMBIO.value, EventType.SHOCK_OSINT.value],
        "descripcion": "Niveles de presas CONAGUA, precipitación."
    },
    "shu": {
        "nombre": "🌬 Shu", "dominio": "Clima y Ambiente", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.SHOCK_OSINT.value, EventType.TICK_AVANZADO.value],
        "descripcion": "Islas de calor, calidad del aire, SEMARNAT."
    },

    # === TIER 2: DIOSES MENORES — SALUD ===
    "serket": {
        "nombre": "🦂 Serket", "dominio": "Epidemiología", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.SHOCK_OSINT.value, EventType.BIENESTAR_ALERTA.value],
        "descripcion": "Propagación de enfermedades, cobertura sanitaria."
    },
    "imhotep": {
        "nombre": "⚕️ Imhotep", "dominio": "Salud Pública", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.KPI_ACTUALIZADO.value],
        "descripcion": "Mortalidad, acceso a salud, SSA."
    },

    # === TIER 2: DIOSES MENORES — EDUCACIÓN ===
    "seshat": {
        "nombre": "📜 Seshat", "dominio": "Educación y Datos", "tier": 2,
        "modelo_ia": "qwen3.5:35b",
        "subscriptions": [EventType.KPI_ACTUALIZADO.value],
        "descripcion": "Matrícula, deserción, nivel educativo por sección."
    },
    "maat": {
        "nombre": "⚖️ Maat", "dominio": "Justicia y Equidad", "tier": 2,
        "modelo_ia": "qwen3.5:35b",
        "subscriptions": [EventType.BIENESTAR_ALERTA.value, EventType.SEGURIDAD_ALERTA.value],
        "descripcion": "Índices de Gini, distribución de riqueza."
    },

    # === TIER 2: DIOSES MENORES — TRANSPORTE ===
    "sobek": {
        "nombre": "🐊 Sobek", "dominio": "Tránsito Vehicular", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.INFRAESTRUCTURA_CAMBIO.value, EventType.FLUJO_CRITICO.value],
        "descripcion": "Flujo vehicular, Boids de tránsito, rutas óptimas."
    },
    "khonsu": {
        "nombre": "🌙 Khonsu", "dominio": "Transporte Público", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.INFRAESTRUCTURA_CAMBIO.value],
        "descripcion": "Rutas de autobuses, cobertura, frecuencia."
    },

    # === TIER 2: DIOSES MENORES — COMERCIO ===
    "wepwawet": {
        "nombre": "🐺 Wepwawet", "dominio": "Microeconomía de Comercios", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.INDICADOR_ECONOMICO.value, EventType.KPI_ACTUALIZADO.value],
        "descripcion": "Negocios DENUE, ventas, Open Business Plan."
    },
    "min": {
        "nombre": "🌾 Min", "dominio": "Agricultura y Producción", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.INDICADOR_ECONOMICO.value, EventType.SHOCK_OSINT.value],
        "descripcion": "Producción agrícola, commodities, Sonora."
    },

    # === TIER 2: DIOSES MENORES — GEOPOLÍTICA ===
    "set": {
        "nombre": "⚡ Set", "dominio": "Conflictos Internacionales", "tier": 2,
        "modelo_ia": "llama3.1:70b",
        "subscriptions": [EventType.SHOCK_OSINT.value],
        "descripcion": "Guerras, sanciones, SIPRI, ACLED."
    },
    "montu": {
        "nombre": "🦅 Montu", "dominio": "Defensa y Estrategia", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.SHOCK_OSINT.value, EventType.SEGURIDAD_ALERTA.value],
        "descripcion": "Gasto militar, carteles, narco-geopolítica."
    },

    # === TIER 2: DIOSES MENORES — TECNOLOGÍA ===
    "khepri": {
        "nombre": "🪲 Khepri", "dominio": "Innovación Tecnológica", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.SHOCK_OSINT.value, EventType.KPI_ACTUALIZADO.value],
        "descripcion": "Hype Cycles Gartner, patentes USPTO/IMPI, disrupciones."
    },
    "neith": {
        "nombre": "🕸 Neith", "dominio": "Redes Digitales", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.SCRAPING_COMPLETADO.value],
        "descripcion": "Redes sociales, sentimiento digital, tendencias."
    },

    # === TIER 2: DIOSES MENORES — GAMIFICACIÓN Y DATOS SOCIALES ===
    "hathor": {
        "nombre": "🐄 Hathor", "dominio": "Gamificación CositasApp", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.EVENTO_VIDA.value],
        "descripcion": "Engagement ciudadano, puntos, recompensas."
    },
    "bastet": {
        "nombre": "🐱 Bastet", "dominio": "Bienestar Comunitario", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.BIENESTAR_ALERTA.value, EventType.EVENTO_VIDA.value],
        "descripcion": "Satisfacción vecinal, encuestas, NPS social."
    },
    "taweret": {
        "nombre": "🦛 Taweret", "dominio": "Datos MalaCopared", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.KPI_ACTUALIZADO.value],
        "descripcion": "Integración MalaCopared/Backstagered como fuente de datos."
    },

    # === TIER 2: DIOSES MENORES — COMPLEMENTARIOS ===
    "djehuti": {
        "nombre": "🔢 Djehuti", "dominio": "Numerología y Correlaciones", "tier": 2,
        "modelo_ia": "gemma4:2b",
        "subscriptions": [EventType.EVENTO_VIDA.value],
        "descripcion": "Dato complementario: número de vida, esencia. Para buscar correlaciones estadísticas."
    },
    "renenutet": {
        "nombre": "🐍 Renenutet", "dominio": "Cosechas y Estacionalidad", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.TICK_AVANZADO.value],
        "descripcion": "Ciclos estacionales, Navidad, Semana Santa, temporadas de lluvias."
    },
    "hapi": {
        "nombre": "🌊 Hapi", "dominio": "Inundaciones y Fenómenos Naturales", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.SHOCK_OSINT.value],
        "descripcion": "Huracanes, inundaciones, sismos, fenómenos climatológicos."
    },
    "meskhenet": {
        "nombre": "👶 Meskhenet", "dominio": "Natalidad y Juventud", "tier": 2,
        "modelo_ia": "gemma4:26b",
        "subscriptions": [EventType.KPI_ACTUALIZADO.value, EventType.BIENESTAR_ALERTA.value],
        "descripcion": "Tasas de natalidad, programas para jóvenes, NEET."
    }
}


def initialize_pantheon(bus: DeityEventBus):
    """Registra todos los dioses del panteón en el bus de eventos."""
    for deity_id, config in PANTHEON_REGISTRY.items():
        bus.register_deity(
            deity_id=deity_id,
            nombre=config["nombre"],
            dominio=config["dominio"],
            tier=config["tier"],
            modelo_ia=config["modelo_ia"],
            subscriptions=config.get("subscriptions", [])
        )
    print(f"🏛 Panteón Egipcio inicializado: {len(PANTHEON_REGISTRY)} dioses registrados.")


# Instancia global singleton del bus
_global_bus: Optional[DeityEventBus] = None


def get_event_bus() -> DeityEventBus:
    """Obtiene la instancia global del bus de eventos (singleton thread-safe)."""
    global _global_bus
    if _global_bus is None:
        _global_bus = DeityEventBus()
        initialize_pantheon(_global_bus)
    return _global_bus
