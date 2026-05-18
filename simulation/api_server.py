# simulation/api_server.py
# MDD / ADD: Zero-Dependency Local API & Static Web Server for CivicPulse

import json
import hashlib
import time
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

# Resilient Portable Import with Mock Fallback for testing environments
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
        else:
            self.send_response(404)
            self._set_cors_headers()
            self.end_headers()

def run_server(port=5001):
    server_address = ('127.0.0.1', port)
    httpd = HTTPServer(server_address, SimulationAPIHandler)
    print(f"🚀 CivicPulse Consolidated Server (GUI + APIs) running locally on port {port}...")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping simulation server.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
