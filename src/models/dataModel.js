/**
 * Modelo de Datos y Motor ABM para CivicPulse
 * Aterrizado al caso de estudio: Hermosillo, Sonora.
 */

// 1. Definición de Distritos Electorales de Hermosillo
export const HERMOSILLO_DISTRICTS = {
  "D6_NORTE": {
    id: "D6_NORTE",
    name: "Distrito 6 (Norte - Pitic, Bugambilias)",
    coords: [29.102, -110.955], // Lat, Lng aproximados
    demographics: { comerciantes: 0.25, jovenes: 0.30, asalariados: 0.45 },
    averageIncome: 28500, // Pesos mensuales prom
    waterAccess: 0.85, // 85% cobertura sin tandeos
    securityRating: 0.65 // Media-alta
  },
  "D8_SUR": {
    id: "D8_SUR",
    name: "Distrito 8 (Sur - Palo Verde, Villa de Seris)",
    coords: [29.045, -110.965],
    demographics: { comerciantes: 0.30, jovenes: 0.25, asalariados: 0.45 },
    averageIncome: 14200,
    waterAccess: 0.50, // 50% con tandeos fuertes
    securityRating: 0.35 // Problemas graves
  },
  "D9_CENTRO": {
    id: "D9_CENTRO",
    name: "Distrito 9 (Centro y Poniente)",
    coords: [29.078, -110.985],
    demographics: { comerciantes: 0.40, jovenes: 0.35, asalariados: 0.25 },
    averageIncome: 19800,
    waterAccess: 0.70,
    securityRating: 0.50
  }
};

// 2. Generación de Población Sintética (Agentes)
export function generateSyntheticPopulation(size = 300) {
  const agents = [];
  const sectors = ["comerciantes", "jovenes", "asalariados"];
  const districtIds = Object.keys(HERMOSILLO_DISTRICTS);

  for (let i = 0; i < size; i++) {
    // Asignar distrito con distribución equilibrada
    const districtId = districtIds[i % districtIds.length];
    const district = HERMOSILLO_DISTRICTS[districtId];
    
    // Decidir sector según pesos demográficos del distrito
    const rand = Math.random();
    let sector = "asalariados";
    if (rand < district.demographics.comerciantes) {
      sector = "comerciantes";
    } else if (rand < district.demographics.comerciantes + district.demographics.jovenes) {
      sector = "jovenes";
    }

    // Inicializar atributos basados en sector y distrito
    let income = district.averageIncome * (0.6 + Math.random() * 0.8);
    let opinion = 0; // -1 (Conservador/Pro-Mercado) a +1 (Social/Pro-Estado)
    let happiness = 50 + Math.random() * 30; // 0 a 100

    if (sector === "jovenes") {
      opinion = 0.3 + Math.random() * 0.5; // Tienden más a lo social/izquierdas
      income = income * 0.7; // Ingresos menores en gig economy
    } else if (sector === "comerciantes") {
      opinion = -0.5 - Math.random() * 0.4; // Muy pro-mercado y reducción de impuestos
    } else {
      opinion = -0.2 + Math.random() * 0.6; // Asalariados, más centristas
    }

    agents.push({
      id: i,
      districtId,
      sector,
      income: Math.round(income),
      opinion: parseFloat(opinion.toFixed(2)),
      happiness: Math.round(happiness),
      baseHappiness: Math.round(happiness),
      voteIntention: Math.random() > 0.5 ? "Candidato_A" : "Candidato_B"
    });
  }
  return agents;
}

// 3. Reglas de Simulación (ABM)
// Traduce el estado actual de las políticas en Utilidad, Felicidad e Intención de Voto
export function updateAgentState(agent, policies) {
  // Políticas del Slider (valores de 0 a 100)
  const { subsidioTransporte, impuestoComercial, presupuestoSeguridad, inversionAgua } = policies;
  
  let utilityDelta = 0;

  // REGLAS DE UTILIDAD ESPECÍFICAS POR SECTOR
  if (agent.sector === "jovenes") {
    // Jóvenes se benefician enormemente del subsidio de transporte y acceso al agua.
    // Les afecta poco el impuesto comercial directo.
    utilityDelta += (subsidioTransporte * 0.4);
    utilityDelta += (inversionAgua * 0.3);
    utilityDelta += (presupuestoSeguridad * 0.2);
    utilityDelta -= (impuestoComercial * 0.1); // Costo indirecto
  } else if (agent.sector === "comerciantes") {
    // Comerciantes odian el impuesto comercial, pero aman la seguridad pública y el agua para sus negocios.
    utilityDelta -= (impuestoComercial * 0.6);
    utilityDelta += (presupuestoSeguridad * 0.5);
    utilityDelta += (inversionAgua * 0.2);
    utilityDelta -= (subsidioTransporte * 0.1); // Ven esto como gasto innecesario
  } else if (agent.sector === "asalariados") {
    // Asalariados quieren seguridad, agua limpia y son neutros en impuestos, pero les asusta la inflación (alto gasto)
    utilityDelta += (presupuestoSeguridad * 0.4);
    utilityDelta += (inversionAgua * 0.4);
    utilityDelta -= (impuestoComercial * 0.15); // Afecta precios de consumo
    utilityDelta += (subsidioTransporte * 0.15); // Ayuda a sus hijos estudiantes
  }

  // Normalizar el delta de utilidad para que esté en un rango controlable (-25 a 25)
  const normalizedDelta = (utilityDelta - 20) * 0.5; 

  // Nueva Felicidad (Fórmula de media móvil para simular inercia emocional)
  let newHappiness = agent.happiness * 0.85 + (agent.baseHappiness + normalizedDelta) * 0.15;
  newHappiness = Math.max(10, Math.min(100, newHappiness)); // Acotar entre 10 y 100

  // REGLAS DE INTENCIÓN DE VOTO
  // Candidato A (Incumbente/Social): Prioriza subsidios, agua e inversión, pero cobra impuestos.
  // Candidato B (Oposición/Conservador): Prioriza reducción de impuestos y seguridad de mano dura.
  
  // Calcular la "Afinidad Ideológica" de cada candidato para el agente
  const scoreA = (subsidioTransporte * 0.3) + (inversionAgua * 0.3) - (impuestoComercial * 0.2);
  const scoreB = -(impuestoComercial * 0.5) + (presupuestoSeguridad * 0.4);

  // La intención de voto se ve afectada por:
  // 1. Su afinidad con las propuestas.
  // 2. Su nivel de felicidad actual (Si es feliz y las cosas van bien, tiende a apoyar al Incumbente A; si está enojado, vota por B).
  const threshold = 50;
  let voteIntention = agent.voteIntention;

  const biasA = scoreA + (newHappiness - threshold) * 0.5;
  const biasB = scoreB + (threshold - newHappiness) * 0.5;

  if (agent.opinion > 0.1) {
    // Sesgo pro-social
    voteIntention = (biasA + 10 > biasB) ? "Candidato_A" : "Candidato_B";
  } else if (agent.opinion < -0.1) {
    // Sesgo pro-mercado
    voteIntention = (biasB + 10 > biasA) ? "Candidato_B" : "Candidato_A";
  } else {
    // Independiente / Volátil
    voteIntention = (biasA > biasB) ? "Candidato_A" : "Candidato_B";
  }

  return {
    ...agent,
    happiness: Math.round(newHappiness),
    voteIntention
  };
}

// 4. Inferencia del Predictor Electoral
// Calcula las probabilidades de éxito basadas en el estado acumulado de los agentes
export function calculateElectionProbability(agents, candidateProfiles) {
  // candidateProfiles contiene el "matching" de perfiles históricos
  const total = agents.length;
  const votesA = agents.filter(a => a.voteIntention === "Candidato_A").length;
  const votesB = total - votesA;

  // Probabilidad base es la intención de voto directa
  let baseProbA = (votesA / total) * 100;
  let baseProbB = (votesB / total) * 100;

  // Ajustes de Perfil (Basado en el historial electoral de México, ej: experiencia y congruencia de plataforma)
  // Candidate A: Alta experiencia ejecutiva municipal (+)
  // Candidate B: Menos experiencia política (-), pero fuerte apoyo en sectores comerciales
  const bonusA = candidateProfiles.candidateA.experienceYears * 0.5;
  const bonusB = candidateProfiles.candidateB.experienceYears * 0.5;

  let finalProbA = baseProbA + bonusA - bonusB;
  let finalProbB = baseProbB + bonusB - bonusA;

  // Ajustar a rango 0-100%
  const sum = finalProbA + finalProbB;
  finalProbA = (finalProbA / sum) * 100;
  finalProbB = (finalProbB / sum) * 100;

  return {
    votesPercentA: parseFloat(((votesA / total) * 100).toFixed(1)),
    votesPercentB: parseFloat(((votesB / total) * 100).toFixed(1)),
    winProbabilityA: parseFloat(finalProbA.toFixed(1)),
    winProbabilityB: parseFloat(finalProbB.toFixed(1))
  };
}
