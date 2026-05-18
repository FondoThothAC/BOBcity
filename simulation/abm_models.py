# simulation/abm_models.py
# MDD: Model-Driven Development - Mathematical Opinion Dynamics Engine

import numpy as np
import random
from typing import List, Dict, Any

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
