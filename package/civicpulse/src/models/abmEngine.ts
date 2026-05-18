// ============================================================
// CivicPulse - Agent-Based Model (ABM) Simulation Engine
// ============================================================
// Motor de simulación basado en agentes para el Gemelo Digital Social
// Inspirado en PolicySpace, UrbanSim y frameworks ABM académicos

import type { Agent, AgentSector, PolicyIntervention, SimulationResult, CandidateProfile } from './dataModel';

// ============================================================
// Configuración del Motor ABM
// ============================================================

interface ABMConfig {
  populationSize: number;
  simulationSteps: number; // meses
  convergenceThreshold: number;
  randomSeed: number;
}

const DEFAULT_CONFIG: ABMConfig = {
  populationSize: 1000,
  simulationSteps: 120, // 10 años
  convergenceThreshold: 0.01,
  randomSeed: 42
};

// ============================================================
// Generación de Población Sintética
// ============================================================

function generateSyntheticPopulation(
  size: number,
  config: ABMConfig = DEFAULT_CONFIG
): Agent[] {
  const agents: Agent[] = [];

  // Distribución sectorial basada en datos demográficos de Hermosillo/Sonora
  const sectorDistribution: Record<AgentSector, number> = {
    small_business: 0.22,      // 22% - comerciantes y autoempleados
    young_professional: 0.18,  // 18% - jóvenes universitarios/profesionales
    industrial_worker: 0.25,   // 25% - trabajadores industriales/maquiladoras
    student: 0.15,             // 15% - estudiantes
    retiree: 0.20             // 20% - jubilados y pensionados
  };

  const sectors = Object.keys(sectorDistribution) as AgentSector[];

  for (let i = 0; i < size; i++) {
    // Seleccionar sector basado en distribución
    const sector = weightedRandomSelect(sectors, Object.values(sectorDistribution));

    const agent = createAgent(i.toString(), sector);
    agents.push(agent);
  }

  return agents;
}

function createAgent(id: string, sector: AgentSector): Agent {
  const baseAttributes = getSectorBaseAttributes(sector);

  return {
    id,
    sector,

    // Demografía
    age: baseAttributes.age + Math.floor(Math.random() * baseAttributes.ageRange),
    income: baseAttributes.income * (0.7 + Math.random() * 0.6), // ±30% variación
    education: baseAttributes.education + Math.floor(Math.random() * baseAttributes.educationRange),

    // Político
    partyAffiliation: randomPartyAffiliation(),
    voteIntention: null,
    politicalEngagement: Math.random() * 100,

    // Bienestar
    happiness: 40 + Math.random() * 30, // Base happiness 40-70
    satisfaction: 40 + Math.random() * 30,

    // Ubicación (coordenadas ficticias en Hermosillo)
    coordinates: [
      29.05 + Math.random() * 0.1,
      -110.90 + Math.random() * 0.15
    ],
    districtId: `district_${Math.floor(Math.random() * 8) + 1}`,

    // Sensibilidad a políticas
    sensitivity: baseAttributes.sensitivity
  };
}

function getSectorBaseAttributes(sector: AgentSector): {
  age: number;
  ageRange: number;
  income: number;
  education: number;
  educationRange: number;
  sensitivity: Agent['sensitivity'];
} {
  switch (sector) {
    case 'small_business':
      return {
        age: 45,
        ageRange: 20,
        income: 15000,
        education: 12,
        educationRange: 4,
        sensitivity: { tax: 0.8, subsidy: 0.7, security: 0.6, education: 0.3, health: 0.4 }
      };
    case 'young_professional':
      return {
        age: 28,
        ageRange: 10,
        income: 12000,
        education: 16,
        educationRange: 4,
        sensitivity: { tax: 0.4, subsidy: 0.5, security: 0.7, education: 0.6, health: 0.5 }
      };
    case 'industrial_worker':
      return {
        age: 35,
        ageRange: 20,
        income: 8000,
        education: 9,
        educationRange: 3,
        sensitivity: { tax: 0.3, subsidy: 0.8, security: 0.5, education: 0.4, health: 0.7 }
      };
    case 'student':
      return {
        age: 22,
        ageRange: 8,
        income: 3000,
        education: 14,
        educationRange: 4,
        sensitivity: { tax: 0.2, subsidy: 0.9, security: 0.6, education: 0.9, health: 0.5 }
      };
    case 'retiree':
      return {
        age: 65,
        ageRange: 15,
        income: 6000,
        education: 10,
        educationRange: 6,
        sensitivity: { tax: 0.5, subsidy: 0.9, security: 0.8, education: 0.2, health: 0.9 }
      };
  }
}

function randomPartyAffiliation(): string | null {
  const parties = ['MORENA', 'PAN', 'PRI', 'PRD', 'PVEM', 'PT', 'MC', 'NA', null];
  const weights = [0.35, 0.20, 0.12, 0.05, 0.05, 0.08, 0.08, 0.07, 0.0];

  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < parties.length - 1; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return parties[i];
    }
  }

  return null; // Independiente o sin afiliación
}

function weightedRandomSelect<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

// ============================================================
// Ejecución de Simulación ABM
// ============================================================

export function runABMSimulation(
  agents: Agent[],
  policy: PolicyIntervention,
  years: 1 | 5 | 10
): SimulationResult {
  const steps = years * 12; // Convertir años a meses
  const gdpTrajectory: number[] = [100]; // PIB base indexado
  const unemploymentTrajectory: number[] = [5.2]; // Tasa de desempleo inicial %
  const happinessTrajectory: number[] = [];
  const voteIntentionTrajectory: Record<string, number[]> = {
    'MORENA': [35],
    'PAN': [22],
    'PRI': [12],
    'Other': [31]
  };

  // Calcular impacto base de la política
  const policyImpact = calculatePolicyImpact(policy, agents);

  // Estado actual de agentes
  let currentAgents = JSON.parse(JSON.stringify(agents)) as Agent[];

  // Simular cada paso temporal
  for (let step = 1; step <= steps; step++) {
    // Aplicar efectos de la política
    currentAgents = applyPolicyEffects(currentAgents, policy, policyImpact, step);

    // Calcular métricas agregadas
    const avgHappiness = currentAgents.reduce((sum, a) => sum + a.happiness, 0) / currentAgents.length;
    happinessTrajectory.push(avgHappiness);

    // Simular evolución del PIB (crecimiento base + impacto de política)
    const baseGrowth = 0.02 / 12; // ~2% anual
    const policyEffect = policyImpact.gdpEffect / 100 * (1 / steps);
    const gdpChange = 1 + baseGrowth + policyEffect;
    gdpTrajectory.push(gdpTrajectory[gdpTrajectory.length - 1] * gdpChange);

    // Simular evolución del desempleo
    const unemploymentChange = policyImpact.unemploymentEffect / 100 * (1 / steps);
    const newUnemployment = unemploymentTrajectory[unemploymentTrajectory.length - 1] + unemploymentChange;
    unemploymentTrajectory.push(Math.max(0, Math.min(20, newUnemployment)));

    // Actualizar intención de voto basada en felicidad y satisfacción
    updateVoteIntention(currentAgents, voteIntentionTrajectory);

    // Registrar cada 12 pasos (año completo)
    if (step % 12 === 0) {
      for (const party of Object.keys(voteIntentionTrajectory)) {
        if (step / 12 > 1) {
          // Los datos se registran en la estructura existente
        }
      }
    }
  }

  // Calcular impacto por sector
  const sectorImpact = calculateSectorImpact(agents, currentAgents);

  return {
    timeHorizon: years,
    policyId: policy.id,
    metrics: {
      gdp: gdpTrajectory,
      unemployment: unemploymentTrajectory,
      happiness: happinessTrajectory,
      voteIntention: voteIntentionTrajectory
    },
    sectorImpact
  };
}

interface PolicyImpactResult {
  gdpEffect: number;        // Cambio porcentual en PIB
  unemploymentEffect: number; // Cambio en tasa de desempleo (puntos porcentuales)
  happinessEffect: number;  // Cambio en felicidad promedio
  sectorEffects: Record<AgentSector, number>;
}

function calculatePolicyImpact(policy: PolicyIntervention, agents: Agent[]): PolicyImpactResult {
  const sectorCounts: Record<AgentSector, number> = {
    small_business: 0,
    young_professional: 0,
    industrial_worker: 0,
    student: 0,
    retiree: 0
  };

  for (const agent of agents) {
    sectorCounts[agent.sector]++;
  }

  let gdpEffect = 0;
  let unemploymentEffect = 0;
  let happinessEffect = 0;
  const sectorEffects: Record<AgentSector, number> = {
    small_business: 0,
    young_professional: 0,
    industrial_worker: 0,
    student: 0,
    retiree: 0
  };

  switch (policy.type) {
    case 'tax':
      // Impuestos afectan inversamente a la felicidad y directamente al PIB
      const taxRate = (policy.parameters.rate || 0.1) * 100;
      gdpEffect = -taxRate * 0.5;
      unemploymentEffect = taxRate * 0.3;
      happinessEffect = -taxRate * 0.8;

      for (const sector of policy.affectedSectors) {
        sectorEffects[sector] = -taxRate * 0.8;
      }
      break;

    case 'subsidy':
      // Subsidios tienen efecto positivo
      const subsidyAmount = policy.parameters.amount || 1000;
      gdpEffect = subsidyAmount * 0.001;
      unemploymentEffect = -subsidyAmount * 0.0001;
      happinessEffect = subsidyAmount * 0.002;

      for (const sector of policy.affectedSectors) {
        sectorEffects[sector] = subsidyAmount * 0.003;
      }
      break;

    case 'security':
      // Inversión en seguridad mejora felicidad y reduce crimen
      const securityInvestment = policy.parameters.investment || 100;
      gdpEffect = securityInvestment * 0.002;
      unemploymentEffect = -securityInvestment * 0.001;
      happinessEffect = securityInvestment * 0.005;

      for (const sector of policy.affectedSectors) {
        sectorEffects[sector] = securityInvestment * 0.004;
      }
      break;

    case 'infrastructure':
      // Infraestructura tiene efectos de largo plazo
      const infraInvestment = policy.parameters.investment || 100;
      gdpEffect = infraInvestment * 0.003;
      unemploymentEffect = infraInvestment * 0.002; // Empleos temporales
      happinessEffect = infraInvestment * 0.003;

      for (const sector of policy.affectedSectors) {
        sectorEffects[sector] = infraInvestment * 0.002;
      }
      break;

    case 'social':
      // Programas sociales tienen efecto directo en felicidad
      const socialSpend = policy.parameters.spend || 100;
      gdpEffect = socialSpend * 0.001;
      unemploymentEffect = -socialSpend * 0.0005;
      happinessEffect = socialSpend * 0.004;

      for (const sector of policy.affectedSectors) {
        sectorEffects[sector] = socialSpend * 0.003;
      }
      break;
  }

  return {
    gdpEffect,
    unemploymentEffect,
    happinessEffect,
    sectorEffects
  };
}

function applyPolicyEffects(
  agents: Agent[],
  policy: PolicyIntervention,
  impact: PolicyImpactResult,
  step: number
): Agent[] {
  // Factor de decaimiento para políticas temporales
  const decayFactor = policy.duration > 0
    ? Math.max(0.3, 1 - (step / policy.duration) * 0.7)
    : 1;

  return agents.map(agent => {
    const newAgent = { ...agent };

    // Verificar si el agente es afectado por la política
    const isAffected = policy.affectedSectors.includes(agent.sector);

    if (isAffected) {
      const sectorImpact = impact.sectorEffects[agent.sector] * decayFactor;

      // Aplicar efecto a felicidad
      const sensitivityKey = policy.type === 'security' ? 'security'
        : policy.type === 'education' ? 'education'
        : policy.type === 'health' ? 'health'
        : policy.type === 'tax' ? 'tax'
        : 'subsidy';

      const sensitivity = agent.sensitivity[sensitivityKey];
      const happinessChange = sectorImpact * sensitivity * (0.5 + Math.random());

      newAgent.happiness = Math.max(0, Math.min(100, agent.happiness + happinessChange));
      newAgent.satisfaction = Math.max(0, Math.min(100, agent.satisfaction + happinessChange * 0.8));

      // Ajustar ingreso según efectos de política
      if (policy.type === 'subsidy') {
        const incomeChange = (policy.parameters.amount || 1000) * 0.01 * sensitivity;
        newAgent.income += incomeChange;
      } else if (policy.type === 'tax') {
        const incomeChange = agent.income * (policy.parameters.rate || 0.1) * 0.3 * sensitivity;
        newAgent.income -= incomeChange;
      }
    }

    // Actualizar afiliación política basada en satisfacción
    if (newAgent.satisfaction > 70 && Math.random() < 0.05) {
      // Agente puede cambiar afinidad si está muy satisfecho
      newAgent.partyAffiliation = randomPartyAffiliation();
    } else if (newAgent.satisfaction < 30 && Math.random() < 0.1) {
      // Insatisfacción puede llevar a cambio de partido o independiente
      if (Math.random() < 0.5) {
        newAgent.partyAffiliation = null; // Independiente
      }
    }

    return newAgent;
  });
}

function updateVoteIntention(
  agents: Agent[],
  trajectory: Record<string, number[]>
): void {
  const partyVotes: Record<string, number> = {};

  for (const agent of agents) {
    if (agent.voteIntention) {
      partyVotes[agent.voteIntention] = (partyVotes[agent.voteIntention] || 0) + 1;
    } else if (agent.partyAffiliation) {
      partyVotes[agent.partyAffiliation] = (partyVotes[agent.partyAffiliation] || 0) + 1;
    } else {
      partyVotes['Other'] = (partyVotes['Other'] || 0) + 1;
    }
  }

  const total = agents.length;
  for (const party of Object.keys(trajectory)) {
    const votes = partyVotes[party] || 0;
    const percentage = (votes / total) * 100;
    trajectory[party].push(percentage);
  }
}

function calculateSectorImpact(
  initialAgents: Agent[],
  finalAgents: Agent[]
): SimulationResult['sectorImpact'] {
  const sectors = Object.keys(initialAgents[0].sensitivity) as AgentSector[];

  const impact: Record<AgentSector, {
    happinessChange: number;
    incomeChange: number;
    employmentChange: number;
  }> = {} as Record<AgentSector, { happinessChange: number; incomeChange: number; employmentChange: number }>;

  for (const sector of sectors) {
    const initial = initialAgents.filter(a => a.sector === sector);
    const final = finalAgents.filter(a => a.sector === sector);

    const avgInitialHappiness = initial.reduce((sum, a) => sum + a.happiness, 0) / initial.length;
    const avgFinalHappiness = final.reduce((sum, a) => sum + a.happiness, 0) / final.length;

    const avgInitialIncome = initial.reduce((sum, a) => sum + a.income, 0) / initial.length;
    const avgFinalIncome = final.reduce((sum, a) => sum + a.income, 0) / final.length;

    impact[sector] = {
      happinessChange: avgFinalHappiness - avgInitialHappiness,
      incomeChange: avgFinalIncome - avgInitialIncome,
      employmentChange: 0 // Simplificado por ahora
    };
  }

  return impact as SimulationResult['sectorImpact'];
}

// ============================================================
// Predictor Electoral
// ============================================================

export function calculateWinProbability(
  candidate: CandidateProfile,
  districtData: {
    povertyRate: number;
    violenceRate: number;
    educationLevel: number;
    unemploymentRate: number;
    indigenousPopulation: number;
  }
): { probability: number; confidence: [number, number]; factors: { name: string; contribution: number }[] } {
  let score = 50; // Base score
  const factors: { name: string; contribution: number }[] = [];

  // Factor 1: Experiencia en gobierno
  if (candidate.experience.government > 5) {
    const contribution = 8;
    score += contribution;
    factors.push({ name: 'Experiencia gubernamental', contribution });
  }

  // Factor 2: Experiencia en seguridad en distritos violentos
  if (districtData.violenceRate > 15 && candidate.hasSecurityBackground) {
    const contribution = 12.3;
    score += contribution;
    factors.push({ name: 'Experiencia en seguridad (distrito violento)', contribution });
  }

  // Factor 3: Lenguas indígenas en distritos con alta población indígena
  if (districtData.indigenousPopulation > 40 && candidate.speaksIndigenous) {
    const contribution = 8.7;
    score += contribution;
    factors.push({ name: 'Dominio de lenguas originarias', contribution });
  }

  // Factor 4: Educación universitaria (efecto variable según contexto)
  if (districtData.educationLevel < 0.5) {
    // En distritos con baja educación, ser universitario puede no ayudar
    const contribution = -2;
    score += contribution;
    factors.push({ name: 'Educación universitaria (efecto negativo en contexto bajo)', contribution });
  } else {
    const contribution = 5;
    score += contribution;
    factors.push({ name: 'Educación universitaria', contribution });
  }

  // Factor 5: Pertenencia a partido dominante
  if (candidate.party === 'MORENA') {
    const contribution = 5;
    score += contribution;
    factors.push({ name: 'Afiliación a partido dominante', contribution });
  }

  // Factor 6: Efecto de incumbencia
  if (candidate.incumbent) {
    const contribution = 7;
    score += contribution;
    factors.push({ name: 'Efecto de incumbencia', contribution });
  }

  // Factor 7: Juventud (ventaja variable según contexto)
  if (candidate.age < 35) {
    const contribution = 3;
    score += contribution;
    factors.push({ name: 'Perfil joven', contribution });
  }

  // Factor 8: Lealtad partidista
  const contributionLoyalty = candidate.partyLoyalty / 20;
  score += contributionLoyalty;
  factors.push({ name: 'Lealtad partidista', contribution: contributionLoyalty });

  // Factor 9: Contexto económico negativo puede beneficiar candidatos de cambio
  if (districtData.povertyRate > 0.4) {
    const contribution = candidate.profileType === 'young_rebel' || candidate.profileType === 'rights_lawyer' ? 8 : 2;
    score += contribution;
    factors.push({ name: 'Perfil de cambio en contexto de pobreza', contribution });
  }

  // Factor 10: Desempleo alto - candidatos con propuestas económicas fuertes
  if (districtData.unemploymentRate > 8) {
    if (candidate.proposalKeywords.includes('empleo') || candidate.proposalKeywords.includes('economía')) {
      const contribution = 6;
      score += contribution;
      factors.push({ name: 'Propuestas de empleo (distrito con alto desempleo)', contribution });
    }
  }

  // Normalizar score a probabilidad
  const probability = Math.max(5, Math.min(95, score));

  // Calcular intervalo de confianza
  const baseUncertainty = 15;
  const confidence: [number, number] = [
    Math.max(0, probability - baseUncertainty),
    Math.min(100, probability + baseUncertainty)
  ];

  // Ordenar factores por contribución
  factors.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  return { probability, confidence, factors };
}

// ============================================================
// Head-to-Head Comparison
// ============================================================

export function compareCandidates(
  candidate1: CandidateProfile,
  candidate2: CandidateProfile,
  districtData: {
    povertyRate: number;
    violenceRate: number;
    educationLevel: number;
    unemploymentRate: number;
    indigenousPopulation: number;
  }
): {
  winner: CandidateProfile;
  margin: number;
  analysis: string;
} {
  const result1 = calculateWinProbability(candidate1, districtData);
  const result2 = calculateWinProbability(candidate2, districtData);

  const winner = result1.probability > result2.probability ? candidate1 : candidate2;
  const margin = Math.abs(result1.probability - result2.probability);

  let analysis = '';

  if (margin > 20) {
    analysis = `${winner.name} tiene una ventaja significativa debido a factores demográficos y contextuales más favorables en este distrito.`;
  } else if (margin > 10) {
    analysis = `${winner.name} lidera, pero la competencia sigue siendo cerrada. Factores como la кампания local podrían cambiar el resultado.`;
  } else {
    analysis = 'La carrera está extremadamente cerrada. Cualquier factor pequeño podría determinar al ganador. Se recomienda monitorear de cerca.';
  }

  return { winner, margin, analysis };
}

// ============================================================
// Utility Exports
// ============================================================

export { generateSyntheticPopulation, DEFAULT_CONFIG };
export type { ABMConfig, PolicyImpactResult };