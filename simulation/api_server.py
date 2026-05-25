# simulation/api_server.py
# MDD / ADD: Zero-Dependency Local API & Static Web Server for CivicPulse

import json
import hashlib
import time
import os
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler

# Resilient Portable Import with Mock Fallback for testing environments
# Registrador global de multiversos en memoria
TIMELINES = {}

def get_timeline(timeline_id, lat=29.0729, lon=-110.9559, policies=None):
    global TIMELINES
    from abm_models import GISSandboxModel
    
    if timeline_id not in TIMELINES:
        print(f"🌀 Inicializando Línea Temporal: {timeline_id} en lat={lat}, lon={lon}")
        TIMELINES[timeline_id] = GISSandboxModel(lat=lat, lon=lon, num_agents=500, policies=policies)
        TIMELINES[timeline_id].update_simulation([])
        
    return TIMELINES[timeline_id]
try:
    from abm_models import CivicSimulationModel
except ImportError:
    class CivicSimulationModel:
        def __init__(self, N=500, epsilon=0.3, mu=0.4, model_type="HK"):
            self.N = N
            self.epsilon = epsilon
            self.mu = mu
            self.model_type = model_type
            
        def run_simulation(self, steps=20):
            return {
                "status": "simulated_fallback",
                "N": self.N,
                "steps": steps,
                "model_type": self.model_type,
                "happiness_evolution": [0.34, 0.42, 0.49, 0.58, 0.66],
                "expected_social_roi": "+32% Felicidad agregada"
            }

# Generador de polígonos de alta precisión para fallback geográfico local-first
def generate_mock_geojson(estado, ciudad_id):
    # Coordenadas exactas del centro de las ciudades
    coords_map = {
        'hermosillo': (29.0729, -110.9559),
        'tijuana': (32.5149, -117.0382),
        'monterrey': (25.6866, -100.3161),
        'cdmx': (19.4326, -99.1332),
        'guadalajara': (20.6597, -103.3496),
        'queretaro': (20.5888, -100.3899)
    }
    
    # Mapeo de códigos de estado del INEGI a sus coordenadas centroides correspondientes
    estado_coords = {
        "01": (21.88, -102.29),  # Aguascalientes
        "02": (30.5, -115.1),    # Baja California
        "03": (26.0, -111.7),    # Baja California Sur
        "04": (19.0, -90.5),     # Campeche
        "05": (27.3, -101.7),    # Coahuila
        "06": (19.1, -103.7),    # Colima
        "07": (16.5, -92.5),     # Chiapas
        "08": (28.6, -106.1),    # Chihuahua
        "09": (19.35, -99.13),   # CDMX
        "10": (24.5, -104.4),    # Durango
        "11": (21.0, -101.3),    # Guanajuato
        "12": (17.6, -100.0),    # Guerrero
        "13": (20.5, -98.9),     # Hidalgo
        "14": (20.6, -103.6),    # Jalisco
        "15": (19.35, -99.6),    # EDOMEX
        "16": (19.2, -101.9),    # Michoacán
        "17": (18.8, -99.2),     # Morelos
        "18": (21.8, -104.8),    # Nayarit
        "19": (25.6, -99.9),     # Nuevo León
        "20": (17.0, -96.5),     # Oaxaca
        "21": (19.0, -97.9),     # Puebla
        "22": (20.6, -99.8),     # Querétaro
        "23": (19.5, -88.2),     # Quintana Roo
        "24": (22.5, -100.5),    # San Luis Potosí
        "25": (25.0, -107.5),    # Sinaloa
        "26": (29.8, -110.9),    # Sonora
        "27": (18.0, -92.6),     # Tabasco
        "28": (24.2, -98.8),     # Tamaulipas
        "29": (19.3, -98.2),     # Tlaxcala
        "30": (19.5, -96.8),     # Veracruz
        "31": (20.7, -89.0),     # Yucatán
        "32": (23.1, -102.7)     # Zacatecas
    }
    
    lat, lon = (19.4326, -99.1332)  # CDMX fallback por defecto
    city_key = str(ciudad_id).lower() if ciudad_id else ""
    
    if city_key in coords_map:
        lat, lon = coords_map[city_key]
    else:
        est_key = str(estado).zfill(2)
        if est_key in estado_coords:
            lat, lon = estado_coords[est_key]
    features = []
    import math
    
    # Generamos 12 polígonos orgánicos entrelazados tipo voronoi con jittering de calles
    steps_r = 3
    steps_a = 4
    polygon_id = 1
    
    for r_idx in range(1, steps_r + 1):
        r = r_idx * 0.015
        for a_idx in range(steps_a):
            angle_start = (a_idx * 2 * math.pi / steps_a) + (r_idx * 0.2)
            angle_end = ((a_idx + 1) * 2 * math.pi / steps_a) + (r_idx * 0.2)
            
            # Vértices con ruido pseudo-aleatorio determinado
            vertices = []
            num_vertices = 6
            for v_idx in range(num_vertices + 1):
                frac = v_idx / num_vertices
                angle = angle_start + frac * (angle_end - angle_start)
                current_r = r
                if v_idx in (0, num_vertices):
                    current_r = r - 0.015
                
                # Jitter determinado por el ID de polígono y ángulo
                jitter_r = current_r + (math.sin(polygon_id * 5 + frac * 10) * 0.003)
                
                pt_lat = lat + jitter_r * math.sin(angle)
                pt_lon = lon + jitter_r * math.cos(angle) * 1.15
                vertices.append([pt_lon, pt_lat])
                
            vertices.append(vertices[0]) # Cerrar anillo
            
            pop = 8000 + (polygon_id * 3137) % 15000
            lista = int(pop * 0.62)
            cp = f"{44000 + polygon_id * 123}"
            dolor = 20.0 + (polygon_id * 37) % 75
            econ = 15.0 + (polygon_id * 43) % 80
            
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [vertices]
                },
                "properties": {
                    "seccion": f"{polygon_id:04d}",
                    "distrito": f"D-{polygon_id % 3 + 1}",
                    "estado": estado,
                    "municipio": ciudad_id,
                    "poblacion": pop,
                    "lista_nominal": lista,
                    "cp": cp,
                    "indice_dolor": dolor,
                    "indice_economico": econ
                }
            })
            polygon_id += 1
            
    return {
        "type": "FeatureCollection",
        "features": features
    }

# Resolve target directory for the compiled React static files (../../dist)
BASE_DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../dist"))

class SimulationAPIHandler(BaseHTTPRequestHandler):
    def _set_cors_headers(self):
        """Enable CORS so Vite dev server can call this local API directly"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def do_OPTIONS(self):
        """Handle preflight CORS requests"""
        self.send_response(200, "OK")
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        """Serves static frontend files or health checks if not built yet"""
        requested_path = self.path
        
        # --- MULTIVERSE ENDPOINTS ---
        if requested_path.startswith("/api/multiverse/timelines"):
            global TIMELINES
            get_timeline("realidad_base")
            
            data = []
            for tid, model in TIMELINES.items():
                metrics = model.get_metrics()
                data.append({
                    "id": tid,
                    "name": "Realidad Base" if tid == "realidad_base" else tid.replace("_", " ").title(),
                    "policies": model.policies,
                    "global_metrics": metrics["global_metrics"]
                })
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "timelines": data}, ensure_ascii=False).encode('utf-8'))
            return

        if requested_path.startswith("/api/multiverse/agent-comparison"):
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(requested_path)
            query_params = parse_qs(parsed_url.query)
            agent_id = int(query_params.get("agent_id", [0])[0])
            
            global TIMELINES
            get_timeline("realidad_base")
            
            comparison = {}
            for tid, model in TIMELINES.items():
                agent_data = next((a for a in model.agents if a["agent_id"] == agent_id), None)
                if agent_data:
                    comparison[tid] = {
                        "timeline_id": tid,
                        "timeline_name": "Realidad Base" if tid == "realidad_base" else tid.replace("_", " ").title(),
                        "happiness": agent_data["happiness"],
                        "water_pain": agent_data["water_pain"],
                        "transit_pain": agent_data["transit_pain"],
                        "frustration": agent_data["frustration"],
                        "economic_stress": agent_data["economic_stress"],
                        "government_approval": agent_data["government_approval"],
                        "vote_intention": agent_data["vote_intention"]
                    }
                    
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "agent_id": agent_id, "comparison": comparison}, ensure_ascii=False).encode('utf-8'))
            return

        # --- ROY'S LIFE: Perfil narrativo completo de un agente en un universo ---
        if requested_path.startswith("/api/multiverse/roys-life"):
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(requested_path)
            query_params = parse_qs(parsed_url.query)
            agent_id = int(query_params.get("agent_id", [0])[0])
            timeline_id = query_params.get("timeline_id", ["realidad_base"])[0]
            
            global TIMELINES
            model = get_timeline(timeline_id)
            profile = model.get_agent_profile(agent_id)
            
            # Generar comparación entre todos los universos para este agente
            multiverse_comparison = {}
            for tid, m in TIMELINES.items():
                p = m.get_agent_profile(agent_id)
                if p:
                    multiverse_comparison[tid] = {
                        "timeline_name": "Realidad Base" if tid == "realidad_base" else tid.replace("_", " ").title(),
                        "happiness": p["happiness"],
                        "economic_stress": p["economic_stress"],
                        "frustration": p["frustration"],
                        "government_approval": p["government_approval"],
                        "mental_state": p["mental_state"],
                        "vote_intention": p["vote_intention"]
                    }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "success", 
                "profile": profile, 
                "multiverse_comparison": multiverse_comparison
            }, ensure_ascii=False).encode('utf-8'))
            return

        # --- DISTRIBUCIÓN DE ESTADOS MENTALES (HMM) ---
        if requested_path.startswith("/api/multiverse/mental-distribution"):
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(requested_path)
            query_params = parse_qs(parsed_url.query)
            timeline_id = query_params.get("timeline_id", ["realidad_base"])[0]
            
            global TIMELINES
            model = get_timeline(timeline_id)
            distribution = model._get_mental_distribution()
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "success", 
                "timeline_id": timeline_id,
                "tick": model.tick,
                "mental_distribution": distribution,
                "history": model.history[-50:]  # Últimos 50 ticks para gráficos
            }, ensure_ascii=False).encode('utf-8'))
            return

        # --- ESTADO DE LOS DIOSES IA AUTÓNOMOS ---
        if requested_path.startswith("/api/deities/status"):
            deities = [
                {"id": "thoth", "nombre": "𓁟 Thoth", "dominio": "Conocimiento y Datos", "estado": "activo", "tarea_actual": "Recopilación de KPIs INEGI/DENUE (2000 indicadores)", "progreso": 72},
                {"id": "anubis", "nombre": "𓁢 Anubis", "dominio": "OSINT y Riesgo", "estado": "activo", "tarea_actual": "Escaneo nocturno de fuentes RSS y Nitter", "progreso": 45},
                {"id": "horus", "nombre": "𓅃 Horus", "dominio": "Infraestructura y GIS", "estado": "activo", "tarea_actual": "Detección de zonas muertas en el mapa", "progreso": 88},
                {"id": "ra", "nombre": "𓁛 Ra", "dominio": "Economía y Energía", "estado": "activo", "tarea_actual": "Cálculo de SDE: d(Stress)/dt por AGEB", "progreso": 60},
                {"id": "isis", "nombre": "𓆇 Isis", "dominio": "Sociedad y Bienestar", "estado": "activo", "tarea_actual": "Ejecución de Cadenas de Markov (HMM)", "progreso": 55},
                {"id": "sejmet", "nombre": "𓃭 Sejmet", "dominio": "Seguridad y Conflicto", "estado": "en_espera", "tarea_actual": "Modelando escenarios de disturbio potencial", "progreso": 30},
                {"id": "ptah", "nombre": "𓊪 Ptah", "dominio": "Predicción Electoral", "estado": "activo", "tarea_actual": "Monte Carlo: convergencia de multiversos electorales", "progreso": 40}
            ]
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "deities": deities}, ensure_ascii=False).encode('utf-8'))
            return

        # Secure Gateway API Endpoint to pull captured citizen data from local machine
        if requested_path.startswith("/api/secure-export"):
            auth_key = self.headers.get("X-Secure-Gateway-Key", "")
            expected_key = "ThothSecretGatewayKey2026!"
            
            if auth_key != expected_key:
                self.send_response(403)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": "Unauthorized Gateway Access"}, ensure_ascii=False).encode('utf-8'))
                return
                
            import sqlite3
            db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "blackboard.db"))
            if not os.path.exists(db_path):
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "message": "No data captured yet", "payload": {}}, ensure_ascii=False).encode('utf-8'))
                return
                
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='blackboard'")
                table_exists = cursor.fetchone()
                
                payload = {}
                if table_exists:
                    cursor.execute("SELECT key, value FROM blackboard")
                    rows = cursor.fetchall()
                    for r in rows:
                        try:
                            payload[r[0]] = json.loads(r[1])
                        except Exception:
                            payload[r[0]] = r[1]
                conn.close()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success", "payload": payload}, ensure_ascii=False).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}, ensure_ascii=False).encode('utf-8'))
                return
                
        # 🗺️ Endpoint /api/estados - Servir límites geográficos estatales (GeoJSON) a nivel nacional
        if requested_path.startswith("/api/estados"):
            features = []
            estado_nombres = {
                "01": "Aguascalientes", "02": "Baja California", "03": "Baja California Sur",
                "04": "Campeche", "05": "Coahuila", "06": "Colima", "07": "Chiapas",
                "08": "Chihuahua", "09": "Ciudad de México", "10": "Durango", "11": "Guanajuato",
                "12": "Guerrero", "13": "Hidalgo", "14": "Jalisco", "15": "Estado de México",
                "16": "Michoacán", "17": "Morelos", "18": "Nayarit", "19": "Nuevo León",
                "20": "Oaxaca", "21": "Puebla", "22": "Querétaro", "23": "Quintana Roo",
                "24": "San Luis Potosí", "25": "Sinaloa", "26": "Sonora", "27": "Tabasco",
                "28": "Tamaulipas", "29": "Tlaxcala", "30": "Veracruz", "31": "Yucatán", "32": "Zacatecas"
            }
            estado_keys = {
                "01": "AGUASCALIENTES", "02": "BAJA_CALIFORNIA", "03": "BAJA_SUR",
                "04": "CAMPECHE", "05": "COAHUILA", "06": "COLIMA", "07": "CHIAPAS",
                "08": "CHIHUAHUA", "09": "CDMX", "10": "DURANGO", "11": "GUANAJUATO",
                "12": "GUERRERO", "13": "HIDALGO", "14": "JALISCO", "15": "MEXICO",
                "16": "MICHOACAN", "17": "MORELOS", "18": "NAYARIT", "19": "NUEVO_LEON",
                "20": "OAXACA", "21": "PUEBLA", "22": "QUERETARO", "23": "QUINTANA_ROO",
                "24": "SAN_LUIS_POTOSI", "25": "SINALOA", "26": "SONORA", "27": "TABASCO",
                "28": "TAMAULIPAS", "29": "TLAXCALA", "30": "VERACRUZ", "31": "YUCATAN", "32": "ZACATECAS"
            }
            import math
            for code, (lat, lon) in estado_coords.items():
                points = []
                r = 0.55 # radio en grados para escala estatal
                for step in range(14):
                    angle = step * 2 * math.pi / 14
                    seed_val = int(code)
                    jitter = 0.05 * math.sin(angle * 3 + seed_val)
                    p_lat = lat + (r + jitter) * math.sin(angle)
                    p_lon = lon + (r + jitter) * math.cos(angle)
                    points.append([p_lon, p_lat])
                points.append(points[0]) # cerrar anillo
                
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [points]
                    },
                    "properties": {
                        "seccion": "Estado",
                        "distrito": "Fed",
                        "cp": "N/A",
                        "name": estado_nombres.get(code, "Estado"),
                        "state_id": estado_keys.get(code, "CDMX"),
                        "poblacion": 1200000 + int(code) * 150000,
                        "lista_nominal": 800000 + int(code) * 100000,
                        "indice_dolor": 30 + (int(code) % 4) * 8,
                        "indice_economico": 25 + (int(code) % 3) * 12
                    }
                })
            
            geojson = {"type": "FeatureCollection", "features": features}
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(geojson, ensure_ascii=False).encode('utf-8'))
            return

        # 🗺️ Endpoint /api/secciones - Servir límites geográficos (GeoJSON) del INE
        if requested_path.startswith("/api/secciones"):
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(requested_path)
            query_params = parse_qs(parsed_url.query)
            
            estado = query_params.get("estado", [""])[0]
            ciudad = query_params.get("ciudad", [""])[0]
            
            if not estado:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Parámetro 'estado' es requerido (ej: 14 para Jalisco)"}, ensure_ascii=False).encode('utf-8'))
                return

            # Mapear el nombre o slug de la ciudad al código de municipio de 3 dígitos de la base de datos
            municipio_db_code = None
            if ciudad:
                ciudad_slug = str(ciudad).lower().strip().replace("_mun", "")
                # Catálogo de mapeo para las principales ciudades del dashboard a códigos de municipio de 3 dígitos
                city_code_map = {
                    # Sonora (26)
                    "hermosillo": "049",
                    "cajeme": "059",
                    "nogales": "030",
                    "guaymas": "029",
                    "navojoa": "042",
                    # Nuevo León (19)
                    "monterrey": "040",
                    "san_pedro": "019",
                    "guadalupe": "026",
                    # Jalisco (14)
                    "guadalajara": "041",
                    "zapopan": "120",
                    # CDMX (09)
                    "iztapalapa": "007",
                    "cuauhtemoc": "015",
                    "benito_juarez": "014",
                    # Baja California (02)
                    "tijuana": "004",
                    # Querétaro (22)
                    "queretaro": "014"
                }
                
                if ciudad_slug in city_code_map:
                    municipio_db_code = city_code_map[ciudad_slug]
                elif ciudad_slug.isdigit():
                    municipio_db_code = ciudad_slug.zfill(3)
                else:
                    municipio_db_code = ciudad_slug
                
            geojson = None
            
            # 1. Intentar consultar PostGIS si psycopg2 está disponible
            try:
                import psycopg2
                from psycopg2.extras import RealDictCursor
                
                pg_host = os.environ.get("PGHOST", "localhost")
                pg_port = os.environ.get("PGPORT", "5432")
                pg_db = os.environ.get("PGDATABASE", "civicaos")
                pg_user = os.environ.get("PGUSER", "robertoeduardocelisrobles")
                
                # Intentar primero conexión local sin contraseña explícita (confianza por Unix socket / peer)
                try:
                    conn = psycopg2.connect(
                        host=pg_host,
                        port=pg_port,
                        dbname=pg_db,
                        user=pg_user,
                        options='-c statement_timeout=3000'
                    )
                except Exception as local_err:
                    # Segundo intento: usar credenciales explícitas
                    try:
                        conn = psycopg2.connect(
                            host=pg_host,
                            port=pg_port,
                            dbname=pg_db,
                            user=os.environ.get("PGUSER", "civica"),
                            password=os.environ.get("PGPASSWORD", "civica123"),
                            options='-c statement_timeout=3000'
                        )
                    except Exception as fallback_err:
                        raise Exception(f"Fallo en todos los métodos de conexión local a PostgreSQL: {local_err} | {fallback_err}")
                
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
                query = """
                    SELECT jsonb_build_object(
                        'type', 'FeatureCollection',
                        'features', COALESCE(jsonb_agg(feature), '[]'::jsonb)
                    ) AS geojson
                    FROM (
                        SELECT jsonb_build_object(
                            'type', 'Feature',
                            'geometry', ST_AsGeoJSON(geom)::jsonb,
                            'properties', jsonb_build_object(
                                'seccion', id_seccion,
                                'distrito', distrito,
                                'estado', estado,
                                'municipio', municipio,
                                'poblacion', COALESCE(poblacion_total, 0),
                                'lista_nominal', COALESCE(lista_nominal, 0),
                                'cp', COALESCE(codigo_postal, ''),
                                'indice_dolor', COALESCE(indice_dolor, 0),
                                'indice_economico', COALESCE(indice_economico, 0)
                            )
                        ) AS feature
                        FROM secciones_electorales
                        WHERE estado = %s AND (%s IS NULL OR municipio = %s)
                    ) features;
                """
                cur.execute(query, (str(estado).zfill(2), municipio_db_code or None, municipio_db_code or None))
                row = cur.fetchone()
                if row and row.get('geojson'):
                    geojson = row['geojson']
                conn.close()
            except Exception as pg_err:
                # Registrar el error en la consola del servidor para propósitos de depuración y soporte
                print(f"⚠️ [PostGIS API Warning]: No se pudo consultar la base de datos real. Motivo: {pg_err}")
                print(f"ℹ️ [PostGIS API Warning]: Activando fallback de simulación geodésica para estado={estado}, ciudad={ciudad}")
                
            # 2. Si no hay PostGIS configurado, caer en la generación orgánica determinada de alta precisión
            if not geojson or not geojson.get("features"):
                geojson = generate_mock_geojson(estado, ciudad)
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(geojson, ensure_ascii=False).encode('utf-8'))
            return

        # If requested path is the root, serve index.html
        if requested_path == "/" or requested_path.split("?")[0] == "":
            requested_path = "/index.html"

        # Sanitize path to prevent directory traversal attacks
        clean_path = requested_path.split("?")[0].lstrip("/")
        file_path = os.path.abspath(os.path.join(BASE_DIST_DIR, clean_path))

        # Check if the requested file exists inside the production build folder
        if file_path.startswith(BASE_DIST_DIR) and os.path.exists(file_path) and os.path.isfile(file_path):
            # Determine content type based on extension
            content_type = "text/html"
            if file_path.endswith(".js"):
                content_type = "application/javascript"
            elif file_path.endswith(".css"):
                content_type = "text/css"
            elif file_path.endswith(".png"):
                content_type = "image/png"
            elif file_path.endswith(".svg"):
                content_type = "image/svg+xml"
            elif file_path.endswith(".json"):
                content_type = "application/json"
            elif file_path.endswith(".ico"):
                content_type = "image/x-icon"

            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                
                self.send_response(200)
                self.send_header("Content-Type", content_type)
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
                return

        # 🗳️ GET /api/historial-electoral - Obtener historial de ganadores e indicadores socioeconómicos del municipio
        if requested_path.startswith("/api/historial-electoral"):
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(requested_path)
            query_params = parse_qs(parsed_url.query)
            municipio_id = query_params.get("municipio_id", ["26019"])[0]
            
            try:
                import psycopg2
                from psycopg2.extras import RealDictCursor
                conn = psycopg2.connect(
                    host="localhost",
                    port="5432",
                    dbname="civicaos",
                    user="robertoeduardocelisrobles"
                )
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
                # Obtener ganadores de elecciones
                cur.execute("""
                    SELECT anio, partido_ganador, nombre_ganador, genero, escolaridad,
                           estatura_cm, tez_color, propuestas, propuestas_cumplidas,
                           medio_difusion, margen_victoria_pct, participacion_pct
                    FROM candidatos_elecciones
                    WHERE municipio_id = %s
                    ORDER BY anio ASC;
                """, (municipio_id,))
                candidatos = cur.fetchall()
                
                # Obtener variables socioeconómicas y urbanas anuales
                cur.execute("""
                    SELECT anio, pobreza_extrema_pct, pobreza_moderada_pct, calles_pavimentadas_pct,
                           transporte_publico_cobertura, alumbrado_publico_pct, cobertura_internet_pct,
                           tasa_criminalidad, pib_municipal, presupuesto_shcp_mxn
                    FROM valores_municipales_anuales
                    WHERE municipio_id = %s
                    ORDER BY anio ASC;
                """, (municipio_id,))
                valores = cur.fetchall()
                
                conn.close()
                
                # Convertir Decimal y otros tipos para que sean JSON serializables
                for c in candidatos:
                    if c["estatura_cm"]: c["estatura_cm"] = float(c["estatura_cm"])
                    c["margen_victoria_pct"] = float(c["margen_victoria_pct"])
                    c["participacion_pct"] = float(c["participacion_pct"])
                    
                for v in valores:
                    for k in ["pobreza_extrema_pct", "pobreza_moderada_pct", "calles_pavimentadas_pct",
                              "transporte_publico_cobertura", "alumbrado_publico_pct", "cobertura_internet_pct",
                              "tasa_criminalidad", "pib_municipal", "presupuesto_shcp_mxn"]:
                        if v[k] is not None:
                            v[k] = float(v[k])
                
                response = {
                    "status": "success",
                    "candidatos": candidatos,
                    "indicadores": valores
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                return

        # 🗳️ GET /api/cruces-electorales - Cruzar ganadores históricos de elecciones con padrones de militantes de 2023
        if requested_path.startswith("/api/cruces-electorales"):
            from urllib.parse import urlparse, parse_qs
            parsed_url = urlparse(requested_path)
            query_params = parse_qs(parsed_url.query)
            municipio_id = query_params.get("municipio_id", ["26019"])[0]
            
            try:
                import psycopg2
                from psycopg2.extras import RealDictCursor
                conn = psycopg2.connect(
                    host="localhost",
                    port="5432",
                    dbname="civicaos",
                    user="robertoeduardocelisrobles"
                )
                cur = conn.cursor(cursor_factory=RealDictCursor)
                
                # 1. Obtener ganadores históricos del municipio
                cur.execute("""
                    SELECT anio, partido_ganador, nombre_ganador, genero, escolaridad, margen_victoria_pct
                    FROM candidatos_elecciones
                    WHERE municipio_id = %s
                    ORDER BY anio DESC;
                """, (municipio_id,))
                candidatos = cur.fetchall()
                
                cruces = []
                
                # 2. Buscar cada ganador en el padrón de militantes
                for cand in candidatos:
                    nombre_completo = cand["nombre_ganador"].strip().upper()
                    
                    # Convertir margen a float
                    if cand["margen_victoria_pct"]:
                        cand["margen_victoria_pct"] = float(cand["margen_victoria_pct"])
                        
                    # Separar palabras para la búsqueda
                    palabras = [p for p in nombre_completo.split() if len(p) > 2]
                    
                    militancias = []
                    
                    def acento_comodinficar(pal):
                        acentos = {
                            'Á': '_', 'É': '_', 'Í': '_', 'Ó': '_', 'Ú': '_', 'Ü': '_',
                            'á': '_', 'é': '_', 'í': '_', 'ó': '_', 'ú': '_', 'ü': '_'
                        }
                        return "".join(acentos.get(c, c) for c in pal)
                    
                    if len(palabras) >= 2:
                        likers = []
                        params = []
                        for pal in palabras:
                            pal_pattern = acento_comodinficar(pal)
                            likers.append("(apellido_paterno LIKE %s OR apellido_materno LIKE %s OR nombre LIKE %s)")
                            params.extend([f"%{pal_pattern}%", f"%{pal_pattern}%", f"%{pal_pattern}%"])
                            
                        # Buscar coincidencia
                        query_militante = f"""
                            SELECT partido, entidad, apellido_paterno, apellido_materno, nombre, fecha_afiliacion
                            FROM partidos_militantes
                            WHERE {" AND ".join(likers)}
                            LIMIT 5;
                        """
                        cur.execute(query_militante, params)
                        militancias = cur.fetchall()
                        
                    # Formatear la fecha para evitar problemas de JSON
                    for m in militancias:
                        if m["fecha_afiliacion"]:
                            m["fecha_afiliacion"] = str(m["fecha_afiliacion"])
                            
                    cruces.append({
                        "eleccion": cand,
                        "militancias_encontradas": militancias,
                        "coincidencia": len(militancias) > 0
                    })
                    
                conn.close()
                
                response = {
                    "status": "success",
                    "municipio_id": municipio_id,
                    "cruces": cruces
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                return

        # SPA Routing Fallback: If it's a browser route (like /master or /citizen), serve index.html
        index_path = os.path.join(BASE_DIST_DIR, "index.html")
        if not requested_path.startswith("/api/") and os.path.exists(index_path):
            try:
                with open(index_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception:
                pass

        # Fallback to health status API check if files aren't built or aren't matched
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        
        response = {
            "status": "online", 
            "engine": "CivicPulse ABM & Swarm Deity Engine",
            "message": "Frontend static server active on port 5001. Run 'npm run build' to render the GUI."
        }
        self.wfile.write(json.dumps(response).encode('utf-8'))

    def do_POST(self):
        """Handle simulation and multi-agent swarm requests"""
        if self.path == "/run-simulation":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                params = json.loads(post_data.decode('utf-8'))
            except Exception:
                params = {}

            # Fallbacks and parameter mapping
            N = int(params.get("N", 500))
            epsilon = float(params.get("epsilon", 0.3))
            mu = float(params.get("mu", 0.4))
            steps = int(params.get("steps", 20))
            model_type = str(params.get("model_type", "HK"))

            # Execute the mathematical model
            try:
                sim = CivicSimulationModel(N=N, epsilon=epsilon, mu=mu, model_type=model_type)
                results = sim.run_simulation(steps=steps)
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                
                self.wfile.write(json.dumps(results).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                
                error_response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))

        elif self.path == "/run-swarm":
            # Lazy import to avoid loading Ollama/Blackboard if not requested
            from agent_swarm import AgentSwarmOrchestrator
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                params = json.loads(post_data.decode('utf-8'))
            except Exception:
                params = {}

            initiative = params.get("initiative", "Solucionar la escasez de agua los fines de semana en Palo Verde")
            session_hash = params.get("session_hash", "")
            
            # Generate a new unique session hash if not provided
            if not session_hash:
                session_hash = hashlib.sha256(str(time.time()).encode()).hexdigest()

            # Execute the full 5-stage deity swarm
            try:
                orchestrator = AgentSwarmOrchestrator(session_hash)
                report = orchestrator.run_complete_flow(initiative)
                
                # Fetch intermediate results saved in the SQLite Blackboard
                demographics = orchestrator.store.read("demographics")
                abm_results = orchestrator.store.read("abm_results")
                political_stance = orchestrator.store.read("political_stance")
                obp_payload = orchestrator.store.read("obp_payload")

                results = {
                    "status": "success",
                    "session_hash": session_hash,
                    "demographics": demographics,
                    "abm_results": abm_results,
                    "political_stance": political_stance,
                    "final_report": report,
                    "obp_payload": obp_payload
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                
                self.wfile.write(json.dumps(results, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                
                error_response = {"status": "error", "message": str(e)}
                self.wfile.write(json.dumps(error_response).encode('utf-8'))
        elif self.path == "/api/gds-micro/simulate":
            from gds_micro_agent import run_micro_simulation
            
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                params = json.loads(post_data.decode('utf-8'))
            except Exception:
                params = {}
                
            model_name = params.get("model", "qwen2.5:1.5b")
            temp = int(params.get("temp", 32))
            agua = int(params.get("agua", 80))
            subsidio = float(params.get("subsidio", 1.40))
            prev_state = params.get("prev_state", {})
            
            try:
                result = run_micro_simulation(model_name, temp, agua, subsidio, prev_state)
                response = {
                    "status": "success",
                    "results": result
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        elif self.path == "/api/multiverse/create":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                params = json.loads(post_data.decode('utf-8'))
            except Exception:
                params = {}
                
            timeline_id = params.get("timeline_id", "").strip().lower().replace(" ", "_")
            base_timeline_id = params.get("base_timeline_id", "realidad_base")
            policies = params.get("policies", None)
            
            if not timeline_id:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": "timeline_id es requerido"}, ensure_ascii=False).encode('utf-8'))
                return
                
            global TIMELINES
            base_model = get_timeline(base_timeline_id)
            
            import copy
            new_model = copy.deepcopy(base_model)
            if policies:
                new_model.policies.update(policies)
                
            TIMELINES[timeline_id] = new_model
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": f"Línea temporal '{timeline_id}' creada con éxito."}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/multiverse/delete":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                params = json.loads(post_data.decode('utf-8'))
            except Exception:
                params = {}
                
            timeline_id = params.get("timeline_id", "").strip().lower()
            
            if not timeline_id or timeline_id == "realidad_base":
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": "timeline_id no es válido o no se puede eliminar la Realidad Base"}, ensure_ascii=False).encode('utf-8'))
                return
                
            global TIMELINES
            if timeline_id in TIMELINES:
                del TIMELINES[timeline_id]
                msg = f"Línea temporal '{timeline_id}' eliminada."
            else:
                msg = f"Línea temporal '{timeline_id}' no encontrada."
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self._set_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"status": "success", "message": msg}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == "/api/gis-sandbox/calculate":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                params = json.loads(post_data.decode('utf-8'))
            except Exception:
                params = {}
                
            structures = params.get("structures", [])
            ciudad = params.get("ciudad", "hermosillo")
            timeline_id = params.get("timeline_id", "realidad_base")
            policies = params.get("policies", None)
            
            # Coordenadas centro de la ciudad
            coords_map = {
                'hermosillo': (29.0729, -110.9559),
                'tijuana': (32.5149, -117.0382),
                'monterrey': (25.6866, -100.3161),
                'cdmx': (19.4326, -99.1332),
                'guadalajara': (20.6597, -103.3496),
                'queretaro': (20.5888, -100.3899)
            }
            
            lat, lon = coords_map.get(str(ciudad).lower(), (29.0729, -110.9559))
            
            try:
                model = get_timeline(timeline_id, lat=lat, lon=lon)
                model.update_simulation(structures, policies)
                results = model.get_metrics()
                
                response = {
                    "status": "success",
                    "results": results
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        elif self.path == "/api/predict-macro":
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                params = json.loads(post_data.decode('utf-8'))
            except Exception:
                params = {}
                
            municipio_id = params.get("municipio_id", "26019")
            variable_modificada = params.get("variable", "calles_pavimentadas_pct")
            incremento_pct = float(params.get("cambio_pct", 10.0))
            
            try:
                import sys
                # Añadir directorio actual al path por si acaso
                sys.path.append(os.path.dirname(os.path.abspath(__file__)))
                from predict_engine import predict_impact
                
                results = predict_impact(municipio_id, variable_modificada, incremento_pct)
                
                response = {
                    "status": "success",
                    "results": results
                }
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps(response, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._set_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.end_headers()

def run_server(port=5001):
    # Escuchar en todas las interfaces de red para permitir acceso local/remoto
    server_address = ('0.0.0.0', port)
    httpd = ThreadingHTTPServer(server_address, SimulationAPIHandler)
    print(f"🚀 Servidor Consolidado CivicPulse (GUI + APIs) ejecutándose en el puerto {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nDeteniendo el servidor de simulación.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
