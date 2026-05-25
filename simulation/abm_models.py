# simulation/abm_models.py
# MDD: Model-Driven Development - Mathematical Opinion Dynamics Engine
# PDD: Cadenas de Markov Ocultas (HMM) + Monte Carlo + SDE para Ingeniería Social

import numpy as np
import random
import copy
import math
from typing import List, Dict, Any, Optional

# =====================================================================
# CONSTANTES DEL MOTOR DE INGENIERÍA SOCIAL
# =====================================================================

# Estados Mentales del Ciudadano (Cadena de Markov Oculta)
MENTAL_STATES = ['satisfecho', 'preocupado', 'frustrado', 'radicalizado']

# Matriz de Transición Base (probabilidades de pasar de un estado a otro)
# Filas = Estado Actual, Columnas = Siguiente Estado
# [satisfecho, preocupado, frustrado, radicalizado]
BASE_TRANSITION_MATRIX = np.array([
    [0.70, 0.25, 0.04, 0.01],  # satisfecho    -> mayormente se queda satisfecho
    [0.15, 0.55, 0.25, 0.05],  # preocupado    -> tiende a quedarse o empeorar
    [0.05, 0.20, 0.55, 0.20],  # frustrado     -> difícil de recuperar
    [0.02, 0.08, 0.30, 0.60],  # radicalizado  -> muy persistente
])

# Nombres narrativos para la generación de historias (Roy's Life)
NOMBRES_MASCULINOS = ['Carlos', 'Miguel', 'José', 'Juan', 'Pedro', 'Roberto', 'Fernando', 'Diego', 'Alejandro', 'Ricardo']
NOMBRES_FEMENINOS = ['María', 'Ana', 'Guadalupe', 'Rosa', 'Carmen', 'Sofía', 'Valentina', 'Lucía', 'Isabella', 'Elena']
APELLIDOS = ['López', 'García', 'Hernández', 'Martínez', 'González', 'Rodríguez', 'Pérez', 'Sánchez', 'Ramírez', 'Torres']
COLONIAS = ['Palo Verde', 'Centro', 'Las Quintas', 'Villa de Seris', 'Olivares', 'Sahuaro', 'Balderrama', 'El Choyal', 'Loma Linda', 'Bachoco']

class CitizenAgent:
    def __init__(self, agent_id: int, sector: str, initial_opinion: float, epsilon: float, mu: float):
        self.agent_id = agent_id
        self.sector = sector                  # 'joven' | 'comerciante' | 'asalariado'
        self.opinion = initial_opinion        # Continuous scale [0, 1]
        self.epsilon = epsilon                # Bounded confidence threshold
        self.mu = mu                          # Convergence speed
        self.history = [initial_opinion]

    def update_deffuant_weisbuch(self, other: 'CitizenAgent'):
        """
        Pairwise opinion convergence rule (Deffuant-Weisbuch)
        If opinions are within epsilon threshold, move towards each other by mu
        """
        diff = abs(self.opinion - other.opinion)
        if diff < self.epsilon:
            step = self.mu * (other.opinion - self.opinion)
            self.opinion += step
            other.opinion -= step
            
            # Ensure constraints stay bounds [0, 1]
            self.opinion = max(0.0, min(1.0, self.opinion))
            other.opinion = max(0.0, min(1.0, other.opinion))
            
        self.history.append(self.opinion)

    def update_hegselmann_krause(self, all_agents: List['CitizenAgent']):
        """
        Synchronous aggregate convergence rule (Hegselmann-Krause)
        Agent takes the average of all opinions currently within its epsilon confidence radius
        """
        neighbors = [
            a for a in all_agents 
            if abs(a.opinion - self.opinion) <= self.epsilon
        ]
        
        if neighbors:
            avg_op = np.mean([n.opinion for n in neighbors])
            self.opinion = max(0.0, min(1.0, float(avg_op)))
            
        self.history.append(self.opinion)


class CivicSimulationModel:
    def __init__(self, N: int = 500, epsilon: float = 0.3, mu: float = 0.4, model_type: str = "HK"):
        self.num_agents = N
        self.epsilon = epsilon
        self.mu = mu
        self.model_type = model_type  # "DW" | "HK"
        self.agents: List[CitizenAgent] = []
        self._initialize_population()

    def _initialize_population(self):
        """
        Calibrated initialization modeling a polarized bimodal Hermosillo community
        50% hold left-leaning / cautious opinions, 50% right-leaning / proactive opinions
        """
        sectors = ['joven', 'comerciante', 'asalariado']
        for i in range(self.num_agents):
            sector = random.choice(sectors)
            
            # Socioeconomic biased epsilon tuning (DDD / BDD rules)
            # 'joven' is more open-minded (larger epsilon), 'comerciante' is more resistant
            eps_modifier = 0.05 if sector == 'joven' else (-0.05 if sector == 'comerciante' else 0.0)
            eps = max(0.1, min(0.6, self.epsilon + eps_modifier))
            
            # Bimodal split
            if random.random() < 0.5:
                opinion = random.uniform(0.1, 0.4)
            else:
                opinion = random.uniform(0.6, 0.9)
                
            self.agents.append(CitizenAgent(i, sector, opinion, eps, self.mu))

    def step(self):
        """
        Executes one time step step of the simulation
        """
        if self.model_type == "HK":
            # Sychronous update
            # We copy original opinions first to compute next state synchronously
            prev_opinions = [a.opinion for a in self.agents]
            for i, agent in enumerate(self.agents):
                agent.update_hegselmann_krause(self.agents)
        else:
            # Asynchronous Deffuant-Weisbuch updates
            # Perform N pairwise comparisons per step to give all agents a chance to interact
            for _ in range(self.num_agents):
                a1, a2 = random.sample(self.agents, 2)
                a1.update_deffuant_weisbuch(a2)

    def run_simulation(self, steps: int = 20) -> Dict[str, Any]:
        """
        Runs the simulation for a number of steps and extracts results
        """
        for _ in range(steps):
            self.step()

        # Compile final stats
        opinions = [a.opinion for a in self.agents]
        sectors_data = {
            'joven': [a.opinion for a in self.agents if a.sector == 'joven'],
            'comerciante': [a.opinion for a in self.agents if a.sector == 'comerciante'],
            'asalariado': [a.opinion for a in self.agents if a.sector == 'asalariado']
        }

        # Mathematical Logit vote calculation based on final average opinion
        avg_opinion = float(np.mean(opinions))
        # Simple Logit probability: P = exp(V) / (1 + exp(V)), V is utility mapped from opinion
        voter_utility = 3.0 * (avg_opinion - 0.5) # Scale utility around center opinion
        vote_probability = float(np.exp(voter_utility) / (1.0 + np.exp(voter_utility)))

        return {
            "model_type": self.model_type,
            "steps_run": steps,
            "global_metrics": {
                "average_opinion": avg_opinion,
                "variance": float(np.var(opinions)),
                "vote_probability_softmax": vote_probability
            },
            "sector_metrics": {
                name: {"average_opinion": float(np.mean(ops)), "variance": float(np.var(ops))}
                for name, ops in sectors_data.items() if ops
            },
            "final_opinions": opinions
        }


class GISSandboxModel:
    """
    Modelo de Simulación Espacial (Sandbox GIS) para Hermosillo u otras ciudades.
    MDD / DDD: Calcula el impacto de obras viales (cierres), puentes e infraestructuras de agua
    en las poblaciones sintéticas geolocalizadas.
    PDD: Integra Cadenas de Markov Ocultas (HMM) para estados mentales de los ciudadanos.
    """
    def __init__(self, lat: float, lon: float, num_agents: int = 500, policies: dict = None):
        self.lat = lat
        self.lon = lon
        self.num_agents = num_agents
        self.agents = []
        self.active_macro_events = []
        self.policies = policies or {"taxes": 12.0, "security": 60.0, "subsidy": 30.0}
        self.tick = 0  # Contador de iteraciones temporales del mundo
        self.history = []  # Historial de métricas por tick para gráficos de divergencia
        self._fetch_macro_shocks()
        self._initialize_population()

    def _fetch_macro_shocks(self):
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "scrapers"))
        try:
            from macro_events_ingestor import get_latest_macro_events
            self.active_macro_events = get_latest_macro_events()
        except ImportError:
            self.active_macro_events = []

    def _initialize_population(self):
        import random
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from population_scaler import calculate_agent_weight_and_kpis
        
        # Usar semilla para mantener consistencia física-temporal
        r = random.Random(42)
        
        for i in range(self.num_agents):
            sector = r.choice(['joven', 'comerciante', 'asalariado'])
            
            # Coordenadas de residencia (hogar) en Hermosillo
            d_lat_home = r.uniform(-0.025, 0.025)
            d_lon_home = r.uniform(-0.025, 0.025)
            home_coords = (self.lat + d_lat_home, self.lon + d_lon_home)
            
            # Coordenadas de trabajo
            d_lat_work = r.uniform(-0.025, 0.025)
            d_lon_work = r.uniform(-0.025, 0.025)
            work_coords = (self.lat + d_lat_work, self.lon + d_lon_work)
            
            # Asignar sección electoral en base al grid de 3x4 (secciones '0001' a '0012')
            # correlacionado con mock GeoJSON en api_server.py
            home_sec_idx = int((d_lat_home + 0.025) / 0.017) * 4 + int((d_lon_home + 0.025) / 0.013)
            home_sec_idx = max(0, min(11, home_sec_idx))
            home_section = f"{(home_sec_idx + 1):04d}"
            
            work_sec_idx = int((d_lat_work + 0.025) / 0.017) * 4 + int((d_lon_work + 0.025) / 0.013)
            work_sec_idx = max(0, min(11, work_sec_idx))
            work_section = f"{(work_sec_idx + 1):04d}"
            
            # Ruta de secciones cruzadas en el trayecto
            route_sections = sorted(list({home_section, work_section}))
            if len(route_sections) == 1:
                sec_id = int(home_section)
                inter_sec = f"{((sec_id % 12) + 1):04d}"
                route_sections.append(inter_sec)
                
            base_water_pain = r.uniform(30.0, 80.0)
            dist_home_work = self._haversine(home_coords, work_coords)
            base_transit_pain = min(90.0, 20.0 + dist_home_work * 12.0 + r.uniform(0.0, 15.0))
            
            # Integrar Population Scaler
            scaler_data = calculate_agent_weight_and_kpis(i, home_section, sector)
            
            # Generar identidad narrativa para Roy's Life
            genero = r.choice(['M', 'F'])
            nombre = r.choice(NOMBRES_MASCULINOS if genero == 'M' else NOMBRES_FEMENINOS)
            apellido = r.choice(APELLIDOS)
            edad = r.randint(18, 72)
            colonia = r.choice(COLONIAS)
            
            self.agents.append({
                "agent_id": i,
                "sector": sector,
                "home_coords": home_coords,
                "work_coords": work_coords,
                "home_section": home_section,
                "work_section": work_section,
                "route_sections": route_sections,
                "base_water_pain": base_water_pain,
                "base_transit_pain": base_transit_pain,
                "water_pain": base_water_pain,
                "transit_pain": base_transit_pain,
                "happiness": 50.0,
                "weight": scaler_data["weight"],
                "base_economic_stress": scaler_data["base_economic_stress"],
                "economic_stress": scaler_data["base_economic_stress"],
                "base_government_approval": scaler_data["base_government_approval"],
                "government_approval": scaler_data["base_government_approval"],
                "frustration": 0.0,
                "vote_intention": "Morena",
                # --- HMM: Estado Mental (Cadena de Markov Oculta) ---
                "mental_state": "satisfecho",
                "mental_state_history": ["satisfecho"],
                # --- Roy's Life: Identidad Narrativa ---
                "nombre": nombre,
                "apellido": apellido,
                "edad": edad,
                "genero": genero,
                "colonia": colonia,
                "diario": []  # Entradas narrativas generadas por tick
            })

    def _haversine(self, c1, c2):
        import math
        lat1, lon1 = c1
        lat2, lon2 = c2
        R = 6371.0  # Radio de la Tierra en kilómetros
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def update_simulation(self, structures: list, policies: dict = None):
        """
        Recalcula los dolores e índices de felicidad basados en las estructuras colocadas y políticas activas
        """
        if policies:
            self.policies.update(policies)
            
        wells = [s for s in structures if s.get("type") == "well"]
        closures = [s for s in structures if s.get("type") == "closure"]
        bridges = [s for s in structures if s.get("type") == "bridge"]
        
        # Parámetros de políticas del gobierno
        taxes_val = float(self.policies.get("taxes", 12.0))
        security_val = float(self.policies.get("security", 60.0))
        subsidy_val = float(self.policies.get("subsidy", 30.0))
        
        # Diferenciales respecto al baseline estándar
        tax_diff = taxes_val - 12.0
        subsidy_diff = subsidy_val - 30.0
        security_diff = security_val - 60.0
        
        # Conjunto de secciones viales cerradas
        closed_sections = set(str(c.get("section", "")) for c in closures if c.get("section"))
        
        for agent in self.agents:
            # 1. Recalcular dolor de agua (Pozos + Subsidios de agua)
            agent_home = agent["home_coords"]
            water_served = False
            for well in wells:
                well_coords = (float(well["lat"]), float(well["lng"]))
                dist = self._haversine(agent_home, well_coords)
                # Radio de cobertura: 1.5 km
                if dist <= 1.5:
                    water_served = True
                    break
            
            if water_served:
                # Si tiene pozo físico, el dolor es mínimo
                agent["water_pain"] = max(0.0, agent["base_water_pain"] * 0.15)
            else:
                # Si no tiene pozo, el subsidio alivia parte del dolor
                subsidy_mitigation = subsidy_diff * 0.8
                agent["water_pain"] = max(0.0, min(100.0, agent["base_water_pain"] - subsidy_mitigation))
                
            # 2. Recalcular dolor de tránsito (Cierres y Puentes)
            transit_penalty = 0.0
            for sec in agent["route_sections"]:
                if sec in closed_sections:
                    transit_penalty += 35.0  # Embotellamiento
                    
            bridge_discount = 0.0
            if bridges:
                route_center = ((agent["home_coords"][0] + agent["work_coords"][0]) / 2.0,
                                (agent["home_coords"][1] + agent["work_coords"][1]) / 2.0)
                for bridge in bridges:
                    bridge_coords = (float(bridge["lat"]), float(bridge["lng"]))
                    dist_to_bridge = self._haversine(route_center, bridge_coords)
                    if dist_to_bridge <= 2.5:
                        bridge_discount = max(bridge_discount, 20.0)
            
            agent["transit_pain"] = max(5.0, min(100.0, agent["base_transit_pain"] + transit_penalty - bridge_discount))
            
            # --- SHOCKS MACROECONÓMICOS OSINT ---
            macro_econ_penalty = 0.0
            macro_gov_penalty = 0.0
            for evt in self.active_macro_events:
                # Si el impacto es negativo, aumenta el estrés/dolor. Si es positivo, lo reduce.
                urgency_multiplier = max(0.2, 1.0 - (evt.get("eta_months", 12) / 24.0))
                shock_val = evt.get("impact_score", 0.0) * urgency_multiplier * -1.0
                
                if evt.get("category") == "Economía":
                    macro_econ_penalty += shock_val
                elif evt.get("category") == "Sociopolítica":
                    macro_gov_penalty += shock_val
            
            # 3. Recalcular KPIs extendidos (Frustración, Economía, Gobierno)
            # La seguridad y la policía mitigan la frustración del entorno urbano
            security_frust_relief = security_diff * 0.25
            agent["frustration"] = max(0.0, min(100.0, (agent["transit_pain"] * 0.6) + (agent["water_pain"] * 0.4) - security_frust_relief))
            
            # El estrés económico se agrava por el dolor de tránsito, shocks macro, y el diferencial de impuestos (taxes)
            # Los comerciantes y asalariados sufren más el alza de impuestos (multiplier)
            tax_multiplier = 1.8 if agent["sector"] in ("comerciante", "asalariado") else 1.0
            econ_penalty = transit_penalty * 0.2
            agent["economic_stress"] = max(0.0, min(100.0, agent["base_economic_stress"] + econ_penalty + macro_econ_penalty + (tax_diff * tax_multiplier * 1.5)))
            
            # Aprobación de Gobierno cae si la frustración sube, si hay shocks OSINT, si suben los impuestos,
            # pero sube si hay más presupuesto de seguridad o subsidio de agua
            frustration_impact = agent["frustration"] * 0.7
            tax_approval_impact = tax_diff * 1.2
            security_approval_bonus = security_diff * 0.5
            subsidy_approval_bonus = subsidy_diff * 0.3
            
            agent["government_approval"] = max(0.0, min(100.0, (
                agent["base_government_approval"] 
                - frustration_impact 
                - macro_gov_penalty 
                - tax_approval_impact
                + bridge_discount 
                + security_approval_bonus 
                + subsidy_approval_bonus
                + (40.0 if water_served else 0.0)
            )))
            
            # 4. Recalcular felicidad y preferencia electoral
            avg_pain = (agent["water_pain"] + agent["transit_pain"] + agent["economic_stress"]) / 3.0
            agent["happiness"] = max(0.0, min(100.0, 100.0 - avg_pain + (agent["government_approval"] * 0.2)))
            
            if agent["government_approval"] > 50.0 and agent["happiness"] > 45.0:
                agent["vote_intention"] = "Morena"
            else:
                agent["vote_intention"] = "Oposición"
            
            # 5. CADENA DE MARKOV OCULTA (HMM): Transición de Estado Mental
            self._update_mental_state(agent)

    def get_metrics(self) -> dict:
        """
        Calcula y retorna las métricas agregadas globales y por sección electoral
        """
        import numpy as np
        
        happiness_list = [a["happiness"] * a["weight"] for a in self.agents]
        water_pain_list = [a["water_pain"] * a["weight"] for a in self.agents]
        transit_pain_list = [a["transit_pain"] * a["weight"] for a in self.agents]
        frustration_list = [a["frustration"] * a["weight"] for a in self.agents]
        econ_stress_list = [a["economic_stress"] * a["weight"] for a in self.agents]
        gov_approval_list = [a["government_approval"] * a["weight"] for a in self.agents]
        
        total_population = sum(a["weight"] for a in self.agents)
        vote_morena = sum(a["weight"] for a in self.agents if a["vote_intention"] == "Morena")
        vote_oposion = sum(a["weight"] for a in self.agents if a["vote_intention"] == "Oposición")
        
        global_metrics = {
            "avg_happiness": float(np.sum(happiness_list) / total_population) if total_population else 50.0,
            "avg_water_pain": float(np.sum(water_pain_list) / total_population) if total_population else 40.0,
            "avg_transit_pain": float(np.sum(transit_pain_list) / total_population) if total_population else 30.0,
            "avg_frustration": float(np.sum(frustration_list) / total_population) if total_population else 30.0,
            "avg_economic_stress": float(np.sum(econ_stress_list) / total_population) if total_population else 45.0,
            "avg_gov_approval": float(np.sum(gov_approval_list) / total_population) if total_population else 50.0,
            "total_simulated_population": total_population,
            "macro_events_count": len(self.active_macro_events),
            "vote_share": {
                "Morena": (vote_morena / total_population * 100.0) if total_population else 50.0,
                "Oposición": (vote_oposion / total_population * 100.0) if total_population else 50.0
            }
        }
        
        section_metrics = {}
        for s_idx in range(1, 13):
            sec_id = f"{s_idx:04d}"
            sec_agents = [a for a in self.agents if a["home_section"] == sec_id]
            if sec_agents:
                sec_happiness = [a["happiness"] * a["weight"] for a in sec_agents]
                sec_water = [a["water_pain"] * a["weight"] for a in sec_agents]
                sec_transit = [a["transit_pain"] * a["weight"] for a in sec_agents]
                sec_frust = [a["frustration"] * a["weight"] for a in sec_agents]
                sec_gov = [a["government_approval"] * a["weight"] for a in sec_agents]
                sec_econ = [a["economic_stress"] * a["weight"] for a in sec_agents]
                
                sec_pop = sum(a["weight"] for a in sec_agents)
                sec_morena = sum(a["weight"] for a in sec_agents if a["vote_intention"] == "Morena")
                
                section_metrics[sec_id] = {
                    "avg_happiness": float(np.sum(sec_happiness) / sec_pop),
                    "avg_water_pain": float(np.sum(sec_water) / sec_pop),
                    "avg_transit_pain": float(np.sum(sec_transit) / sec_pop),
                    "avg_frustration": float(np.sum(sec_frust) / sec_pop),
                    "avg_gov_approval": float(np.sum(sec_gov) / sec_pop),
                    "avg_economic_stress": float(np.sum(sec_econ) / sec_pop),
                    "simulated_population": sec_pop,
                    "militants_percent": {
                        "MORENA": int(sec_morena / sec_pop * 100.0),
                        "PAN": int((sec_pop - sec_morena) * 0.6 / sec_pop * 100.0),
                        "PRI": int((sec_pop - sec_morena) * 0.2 / sec_pop * 100.0),
                        "MC": int((sec_pop - sec_morena) * 0.2 / sec_pop * 100.0)
                    }
                }
            else:
                section_metrics[sec_id] = {
                    "avg_happiness": 50.0,
                    "avg_water_pain": 40.0,
                    "avg_transit_pain": 30.0,
                    "avg_frustration": 30.0,
                    "avg_gov_approval": 50.0,
                    "avg_economic_stress": 45.0,
                    "simulated_population": 0,
                    "militants_percent": {"MORENA": 40, "PAN": 30, "PRI": 15, "MC": 15}
                }
                
        sample_agents = []
        for a in self.agents[:100]:
            sample_agents.append({
                "agent_id": a["agent_id"],
                "sector": a["sector"],
                "home_coords": list(a["home_coords"]),
                "work_coords": list(a["work_coords"]),
                "home_section": a["home_section"],
                "work_section": a["work_section"],
                "water_pain": a["water_pain"],
                "transit_pain": a["transit_pain"],
                "frustration": a["frustration"],
                "economic_stress": a["economic_stress"],
                "government_approval": a["government_approval"],
                "weight": a["weight"],
                "happiness": a["happiness"],
                "vote_intention": a["vote_intention"]
            })
            
        return {
            "global_metrics": global_metrics,
            "section_metrics": section_metrics,
            "sample_agents": sample_agents,
            "active_macro_events": self.active_macro_events,
            "tick": self.tick
        }

    def _update_mental_state(self, agent: dict):
        """
        PDD/HMM: Actualiza el estado mental del agente usando Cadenas de Markov Ocultas.
        La matriz de transición se modifica dinámicamente por las condiciones del agente.
        """
        current_idx = MENTAL_STATES.index(agent["mental_state"])
        
        # Copiar la matriz base y modificarla según las condiciones del agente
        transition = BASE_TRANSITION_MATRIX[current_idx].copy()
        
        # Factores que ACELERAN la radicalización (empujan hacia la derecha de la cadena)
        if agent["happiness"] < 30:
            # Muy infeliz: mayor probabilidad de empeorar
            transition[3] += 0.15  # Más probabilidad de radicalización
            transition[2] += 0.10  # Más probabilidad de frustración
            transition[0] -= 0.20  # Menos probabilidad de estar satisfecho
        
        if agent["economic_stress"] > 70:
            transition[2] += 0.12
            transition[3] += 0.08
            transition[0] -= 0.15
        
        if agent["water_pain"] > 60:
            transition[2] += 0.08
            transition[0] -= 0.08
        
        # Factores que RECUPERAN al agente (empujan hacia la izquierda)
        if agent["government_approval"] > 65:
            transition[0] += 0.15
            transition[3] -= 0.10
        
        if agent["happiness"] > 70:
            transition[0] += 0.20
            transition[2] -= 0.10
            transition[3] -= 0.08
        
        # Normalizar para que sumen 1.0
        transition = np.clip(transition, 0.01, 1.0)
        transition /= transition.sum()
        
        # Transición estocástica (lanzamiento de dado probabilístico)
        new_state_idx = np.random.choice(len(MENTAL_STATES), p=transition)
        agent["mental_state"] = MENTAL_STATES[new_state_idx]
        agent["mental_state_history"].append(agent["mental_state"])

    def advance_tick(self, structures: list, policies: dict = None):
        """
        Avanza un tick temporal completo del mundo.
        Ejecuta update_simulation + guarda historial para gráficos de divergencia.
        """
        self.tick += 1
        self.update_simulation(structures, policies)
        
        # Guardar snapshot de métricas para el historial de divergencia
        metrics = self.get_metrics()
        self.history.append({
            "tick": self.tick,
            "avg_happiness": metrics["global_metrics"]["avg_happiness"],
            "avg_frustration": metrics["global_metrics"]["avg_frustration"],
            "avg_economic_stress": metrics["global_metrics"]["avg_economic_stress"],
            "avg_gov_approval": metrics["global_metrics"]["avg_gov_approval"],
            "vote_morena_pct": metrics["global_metrics"]["vote_share"]["Morena"],
            # Distribución de estados mentales (HMM)
            "mental_distribution": self._get_mental_distribution()
        })
        return metrics

    def _get_mental_distribution(self) -> dict:
        """Calcula la distribución porcentual de estados mentales en toda la población."""
        total = len(self.agents)
        if total == 0:
            return {s: 0.0 for s in MENTAL_STATES}
        counts = {s: 0 for s in MENTAL_STATES}
        for a in self.agents:
            counts[a["mental_state"]] = counts.get(a["mental_state"], 0) + 1
        return {s: round(counts[s] / total * 100.0, 1) for s in MENTAL_STATES}

    def get_agent_profile(self, agent_id: int) -> Optional[dict]:
        """
        Roy's Life: Retorna el perfil completo de un agente para la ficha narrativa.
        """
        for a in self.agents:
            if a["agent_id"] == agent_id:
                return {
                    "agent_id": a["agent_id"],
                    "nombre": a.get("nombre", f"Agente #{agent_id}"),
                    "apellido": a.get("apellido", ""),
                    "edad": a.get("edad", 30),
                    "genero": a.get("genero", "M"),
                    "sector": a["sector"],
                    "colonia": a.get("colonia", "Centro"),
                    "home_section": a["home_section"],
                    "happiness": round(a["happiness"], 1),
                    "water_pain": round(a["water_pain"], 1),
                    "transit_pain": round(a["transit_pain"], 1),
                    "economic_stress": round(a["economic_stress"], 1),
                    "frustration": round(a["frustration"], 1),
                    "government_approval": round(a["government_approval"], 1),
                    "mental_state": a["mental_state"],
                    "mental_state_history": a.get("mental_state_history", []),
                    "vote_intention": a["vote_intention"],
                    "diario": a.get("diario", [])
                }
        return None

    def clone(self) -> 'GISSandboxModel':
        """
        Clona el estado completo del modelo para crear un universo paralelo.
        El nuevo universo es una copia exacta del momento actual, divergiendo desde aquí.
        """
        cloned = GISSandboxModel.__new__(GISSandboxModel)
        cloned.lat = self.lat
        cloned.lon = self.lon
        cloned.num_agents = self.num_agents
        cloned.agents = copy.deepcopy(self.agents)
        cloned.active_macro_events = copy.deepcopy(self.active_macro_events)
        cloned.policies = copy.deepcopy(self.policies)
        cloned.tick = self.tick
        cloned.history = copy.deepcopy(self.history)
        return cloned


# =====================================================================
# MOTOR DE MONTE CARLO PARA CONVERGENCIA DE MULTIVERSOS
# =====================================================================

def run_monte_carlo_divergence(base_model: GISSandboxModel, structures: list,
                                policy_variants: list, num_ticks: int = 30,
                                num_runs: int = 50) -> dict:
    """
    PDD: Ejecuta N simulaciones de Monte Carlo partiendo del mismo estado base
    con pequeñas variaciones de ruido estadístico para encontrar el 'Camino Crítico'.
    
    Retorna la distribución de resultados para que el Admin vea:
    'En el X% de los futuros, esta política funcionó.'
    """
    results = []
    
    for run_idx in range(num_runs):
        # Clonar el modelo base para esta corrida
        universe = base_model.clone()
        
        # Aplicar la variante de política con ruido aleatorio
        noisy_policies = {}
        for key, val in (policy_variants[0] if policy_variants else universe.policies).items():
            # Ruido gaussiano del ±5% para simular incertidumbre
            noise = np.random.normal(0, float(val) * 0.05)
            noisy_policies[key] = max(0.0, float(val) + noise)
        
        # Ejecutar N ticks de simulación
        for t in range(num_ticks):
            universe.advance_tick(structures, noisy_policies)
        
        # Recolectar el resultado final
        final_metrics = universe.get_metrics()
        mental_dist = universe._get_mental_distribution()
        
        results.append({
            "run_id": run_idx,
            "final_happiness": final_metrics["global_metrics"]["avg_happiness"],
            "final_frustration": final_metrics["global_metrics"]["avg_frustration"],
            "final_vote_morena": final_metrics["global_metrics"]["vote_share"]["Morena"],
            "radicalizado_pct": mental_dist.get("radicalizado", 0.0),
            "frustrado_pct": mental_dist.get("frustrado", 0.0)
        })
    
    # Calcular estadísticas de convergencia
    happiness_values = [r["final_happiness"] for r in results]
    radical_values = [r["radicalizado_pct"] for r in results]
    vote_values = [r["final_vote_morena"] for r in results]
    
    # Porcentaje de futuros donde la política "funcionó" (felicidad > 50 Y radicalización < 15%)
    success_count = sum(1 for r in results if r["final_happiness"] > 50 and r["radicalizado_pct"] < 15)
    
    return {
        "num_runs": num_runs,
        "num_ticks": num_ticks,
        "success_rate_pct": round(success_count / num_runs * 100.0, 1),
        "happiness_mean": round(float(np.mean(happiness_values)), 1),
        "happiness_std": round(float(np.std(happiness_values)), 1),
        "radicalization_mean_pct": round(float(np.mean(radical_values)), 1),
        "vote_morena_mean_pct": round(float(np.mean(vote_values)), 1),
        "convergence_summary": f"En el {round(success_count / num_runs * 100.0)}% de los {num_runs} futuros simulados, esta política mantuvo la estabilidad social.",
        "individual_runs": results[:10]  # Solo los primeros 10 para no saturar la respuesta
    }

