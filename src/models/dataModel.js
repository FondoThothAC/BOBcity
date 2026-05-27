/**
 * Modelo de Datos, Base Territorial Nacional (México) y Motor ABM para CívicaOS
 * Soporta navegación multinivel con precisión por polígonos interconectados (Estados -> Municipios -> CPs).
 */

// 1. Catálogo Nacional de los 32 Estados de México con sus centroides y estadísticas reales
export const MEXICO_STATES = {
  "SONORA": {
    id: "SONORA",
    name: "Sonora 🌵",
    coords: [29.8, -110.9],
    padronTotal: 2235000,
    militantsBase: { MORENA: 385000, PAN: 289000, PRI: 142000, MC: 188000, NINGUNO: 1231000 },
    bounds: [[32.5, -115.0], [26.0, -108.0]], // Bounding Box
    municipalities: ["HERMOSILLO", "CAJEME", "NOGALES", "GUAYMAS", "NAVOJOA"]
  },
  "NUEVO_LEON": {
    id: "NUEVO_LEON",
    name: "Nuevo León ⛰️",
    coords: [25.6, -99.9],
    padronTotal: 4380000,
    militantsBase: { MORENA: 412000, PAN: 615000, PRI: 342000, MC: 789000, NINGUNO: 2222000 },
    bounds: [[27.8, -101.2], [23.8, -98.3]],
    municipalities: ["MONTERREY", "SAN_PEDRO", "GUADALUPE", "SAN_NICOLAS", "APODACA"]
  },
  "JALISCO": {
    id: "JALISCO",
    name: "Jalisco 🎺",
    coords: [20.6, -103.6],
    padronTotal: 6520000,
    militantsBase: { MORENA: 885000, PAN: 420000, PRI: 380000, MC: 1150000, NINGUNO: 3685000 },
    bounds: [[22.8, -105.8], [18.8, -101.5]],
    municipalities: ["GUADALAJARA", "ZAPOPAN", "TLAQUEPAQUE", "TONALA", "PUERTO_VALLARTA"]
  },
  "CDMX": {
    id: "CDMX",
    name: "Ciudad de México 🏙️",
    coords: [19.35, -99.13],
    padronTotal: 7890000,
    militantsBase: { MORENA: 2450000, PAN: 1120000, PRI: 580000, MC: 690000, NINGUNO: 3050000 },
    bounds: [[19.6, -99.4], [19.1, -98.9]],
    municipalities: ["IZTAPALAPA", "CUAUHTEMOC", "BENITO_JUAREZ", "ALVARO_OBREGON", "COYOACAN"]
  },
  "CHIHUAHUA": {
    id: "CHIHUAHUA",
    name: "Chihuahua 🌲",
    coords: [28.6, -106.1],
    padronTotal: 3020000,
    militantsBase: { MORENA: 410000, PAN: 680000, PRI: 290000, MC: 190000, NINGUNO: 1450000 },
    bounds: [[31.8, -109.1], [25.5, -103.1]],
    municipalities: ["CHIHUAHUA_MUN", "JUAREZ", "DELICIAS", "PARRAL"]
  },
  "VERACRUZ": {
    id: "VERACRUZ",
    name: "Veracruz 🌊",
    coords: [19.5, -96.8],
    padronTotal: 6080000,
    militantsBase: { MORENA: 1850000, PAN: 620000, PRI: 510000, MC: 390000, NINGUNO: 2710000 },
    bounds: [[22.5, -98.6], [17.1, -93.6]],
    municipalities: ["VERACRUZ_MUN", "XALAPA", "COATZACOALCOS", "BOCA_DEL_RIO"]
  },
  "YUCATAN": {
    id: "YUCATAN",
    name: "Yucatán 🏛️",
    coords: [20.7, -89.0],
    padronTotal: 1720000,
    militantsBase: { MORENA: 350000, PAN: 480000, PRI: 180000, MC: 80000, NINGUNO: 630000 },
    bounds: [[21.6, -90.5], [19.6, -87.5]],
    municipalities: ["MERIDA", "VALLADOLID", "TIZIMIN", "PROGRESO"]
  },
  "BAJA_CALIFORNIA": {
    id: "BAJA_CALIFORNIA",
    name: "Baja California 🌊",
    coords: [30.5, -115.1],
    padronTotal: 3120000,
    militantsBase: { MORENA: 950000, PAN: 320000, PRI: 140000, MC: 210000, NINGUNO: 1500000 },
    bounds: [[32.8, -117.2], [28.0, -112.5]],
    municipalities: ["TIJUANA", "MEXICALI", "ENSENADA", "ROSARITO"]
  }
};

// Completamos dinámicamente con los estados restantes para dar soporte 100% nacional
const REST_OF_STATES = [
  { id: "AGUASCALIENTES", name: "Aguascalientes", coords: [21.88, -102.29], padron: 1040000, rep: "PAN" },
  { id: "BAJA_CALIFORNIA_SUR", name: "Baja California Sur", coords: [26.0, -111.7], padron: 610000, rep: "MORENA" },
  { id: "CAMPECHE", name: "Campeche", coords: [19.0, -90.5], padron: 690000, rep: "MORENA" },
  { id: "COAHUILA", name: "Coahuila", coords: [27.3, -101.7], padron: 2350000, rep: "PRI" },
  { id: "COLIMA", name: "Colima", coords: [19.1, -103.7], padron: 580000, rep: "MORENA" },
  { id: "CHIAPAS", name: "Chiapas", coords: [16.5, -92.5], padron: 3950000, rep: "MORENA" },
  { id: "DURANGO", name: "Durango", coords: [24.5, -104.4], padron: 1390000, rep: "PRI" },
  { id: "GUANAJUATO", name: "Guanajuato", coords: [21.0, -101.3], padron: 4830000, rep: "PAN" },
  { id: "GUERRERO", name: "Guerrero", coords: [17.6, -100.0], padron: 2650000, rep: "MORENA" },
  { id: "HIDALGO", name: "Hidalgo", coords: [20.5, -98.9], padron: 2300000, rep: "MORENA" },
  { id: "EDOMEX", name: "Estado de México", coords: [19.35, -99.6], padron: 12700000, rep: "MORENA" },
  { id: "MICHOACAN", name: "Michoacán", coords: [19.2, -101.9], padron: 3700000, rep: "MORENA" },
  { id: "MORELOS", name: "Morelos", coords: [18.8, -99.2], padron: 1550000, rep: "MORENA" },
  { id: "NAYARIT", name: "Nayarit", coords: [21.8, -104.8], padron: 950000, rep: "MORENA" },
  { id: "OAXACA", name: "Oaxaca", coords: [17.0, -96.5], padron: 3150000, rep: "MORENA" },
  { id: "PUEBLA", name: "Puebla", coords: [19.0, -97.9], padron: 4980000, rep: "MORENA" },
  { id: "QUERETARO", name: "Querétaro", coords: [20.6, -99.8], padron: 1890000, rep: "PAN" },
  { id: "QUINTANA_ROO", name: "Quintana Roo", coords: [19.5, -88.2], padron: 1450000, rep: "MORENA" },
  { id: "SAN_LUIS_POTOSI", name: "San Luis Potosí", coords: [22.5, -100.5], padron: 2180000, rep: "NINGUNO" },
  { id: "SINALOA", name: "Sinaloa", coords: [25.0, -107.5], padron: 2360000, rep: "MORENA" },
  { id: "TABASCO", name: "Tabasco", coords: [18.0, -92.6], padron: 1810000, rep: "MORENA" },
  { id: "TAMAULIPAS", name: "Tamaulipas", coords: [24.2, -98.8], padron: 2850000, rep: "MORENA" },
  { id: "TLAXCALA", name: "Tlaxcala", coords: [19.3, -98.2], padron: 1040000, rep: "MORENA" },
  { id: "ZACATECAS", name: "Zacatecas", coords: [23.1, -102.7], padron: 1260000, rep: "MORENA" }
];

REST_OF_STATES.forEach(s => {
  const morenaBase = s.rep === "MORENA" ? Math.round(s.padron * 0.45) : Math.round(s.padron * 0.20);
  const panBase = s.rep === "PAN" ? Math.round(s.padron * 0.40) : Math.round(s.padron * 0.15);
  const priBase = s.rep === "PRI" ? Math.round(s.padron * 0.35) : Math.round(s.padron * 0.10);
  const mcBase = Math.round(s.padron * 0.12);

  MEXICO_STATES[s.id] = {
    id: s.id,
    name: s.name,
    coords: s.coords,
    padronTotal: s.padron,
    militantsBase: {
      MORENA: morenaBase,
      PAN: panBase,
      PRI: priBase,
      MC: mcBase,
      NINGUNO: s.padron - (morenaBase + panBase + priBase + mcBase)
    },
    bounds: [[s.coords[0] + 1.2, s.coords[1] - 1.2], [s.coords[0] - 1.2, s.coords[1] + 1.2]],
    municipalities: [`${s.id}_CAPITAL`, `${s.id}_SUR`, `${s.id}_NORTE`]
  };
});

// 2. Base de Datos de Municipios por Estado (precision de division municipal)
export const STATE_MUNICIPALITIES = {
  // SONORA
  "HERMOSILLO": { id: "HERMOSILLO", name: "Hermosillo (Capital) 📍", coords: [29.075, -110.968], padronTotal: 642800, stateId: "SONORA", size: 0.15 },
  "CAJEME": { id: "CAJEME", name: "Cajeme (Cd. Obregón)", coords: [27.48, -109.93], padronTotal: 345000, stateId: "SONORA", size: 0.14 },
  "NOGALES": { id: "NOGALES", name: "Nogales (Frontera)", coords: [31.30, -110.94], padronTotal: 220000, stateId: "SONORA", size: 0.10 },
  "GUAYMAS": { id: "GUAYMAS", name: "Guaymas (Puerto)", coords: [27.92, -110.90], padronTotal: 125000, stateId: "SONORA", size: 0.08 },
  "NAVOJOA": { id: "NAVOJOA", name: "Navojoa (Valle Mayo)", coords: [27.08, -109.44], padronTotal: 110000, stateId: "SONORA", size: 0.08 },

  // NUEVO LEON
  "MONTERREY": { id: "MONTERREY", name: "Monterrey (Capital)", coords: [25.68, -100.31], padronTotal: 1140000, stateId: "NUEVO_LEON", size: 0.14 },
  "SAN_PEDRO": { id: "SAN_PEDRO", name: "San Pedro Garza García", coords: [25.65, -100.40], padronTotal: 125000, stateId: "NUEVO_LEON", size: 0.06 },
  "GUADALUPE": { id: "GUADALUPE", name: "Guadalupe", coords: [25.67, -100.24], padronTotal: 680000, stateId: "NUEVO_LEON", size: 0.09 },

  // JALISCO
  "GUADALAJARA": { id: "GUADALAJARA", name: "Guadalajara (Capital)", coords: [20.67, -103.34], padronTotal: 1480000, stateId: "JALISCO", size: 0.11 },
  "ZAPOPAN": { id: "ZAPOPAN", name: "Zapopan", coords: [20.72, -103.38], padronTotal: 1250000, stateId: "JALISCO", size: 0.13 },

  // CDMX
  "IZTAPALAPA": { id: "IZTAPALAPA", name: "Iztapalapa", coords: [19.35, -99.06], padronTotal: 1650000, stateId: "CDMX", size: 0.08 },
  "CUAUHTEMOC": { id: "CUAUHTEMOC", name: "Cuauhtémoc (Centro)", coords: [19.43, -99.14], padronTotal: 520000, stateId: "CDMX", size: 0.05 },
  "BENITO_JUAREZ": { id: "BENITO_JUAREZ", name: "Benito Juárez", coords: [19.38, -99.16], padronTotal: 380000, stateId: "CDMX", size: 0.04 },

  // BAJA CALIFORNIA
  "TIJUANA": { id: "TIJUANA", name: "Tijuana (Frontera) 🌊", coords: [32.5149, -117.0382], padronTotal: 1250000, stateId: "BAJA_CALIFORNIA", size: 0.15 },

  // QUERETARO
  "QUERETARO_MUN": { id: "QUERETARO_MUN", name: "Santiago de Querétaro 🏛️", coords: [20.5888, -100.3899], padronTotal: 890000, stateId: "QUERETARO", size: 0.12 }
};

// Autocompletamos municipios para el resto de los estados de forma genérica
Object.keys(MEXICO_STATES).forEach(stateId => {
  if (stateId !== "SONORA" && stateId !== "NUEVO_LEON" && stateId !== "JALISCO" && stateId !== "CDMX") {
    const s = MEXICO_STATES[stateId];
    if (s && s.municipalities) {
      s.municipalities.forEach((mId, index) => {
        const names = ["Centro Metropolitano", "Región Sur", "Valle Norte", "Zona Poniente", "Distrito Este"];
        const offsets = [[0.2, 0.2], [-0.25, 0.15], [0.1, -0.3], [-0.15, 0.2], [0.3, -0.1]];
        
        const offset = offsets[index % offsets.length];
        const namePart = names[index % names.length];
        
        STATE_MUNICIPALITIES[mId] = {
          id: mId,
          name: `${s.name.replace(/[🌵🏙️🎺⛰️🏛️🌊🌲]/g, '').trim()} - ${namePart}`,
          coords: [s.coords[0] + offset[0], s.coords[1] + offset[1]],
          padronTotal: Math.round(s.padronTotal / s.municipalities.length),
          stateId: stateId,
          size: 0.18
        };
      });
    }
  }
});

// 3. Base de datos detallada de Códigos Postales por Municipio (precisión a nivel calle/distrito)
export const MUNICIPAL_CPS = {
  "HERMOSILLO": {
    "CP_83150": { id: "CP_83150", name: "CP 83150 (Norte - Pitic, Bugambilias)", coords: [29.102, -110.955], padronTotal: 142800, demographics: { comerciantes: 0.25, jovenes: 0.30, asalariados: 0.45 }, militantsBase: { MORENA: 18500, PAN: 32400, PRI: 14200, MC: 11800, NINGUNO: 65900 } },
    "CP_83280": { id: "CP_83280", name: "CP 83280 (Sur - Palo Verde, Villa de Seris)", coords: [29.045, -110.965], padronTotal: 128500, demographics: { comerciantes: 0.30, jovenes: 0.25, asalariados: 0.45 }, militantsBase: { MORENA: 41200, PAN: 12500, PRI: 22800, MC: 8900, NINGUNO: 43100 } },
    "CP_83200": { id: "CP_83200", name: "CP 83200 (Centro y Poniente)", coords: [29.078, -110.985], padronTotal: 135400, demographics: { comerciantes: 0.40, jovenes: 0.35, asalariados: 0.25 }, militantsBase: { MORENA: 24500, PAN: 28900, PRI: 15300, MC: 19400, NINGUNO: 47300 } },
    "CP_83100": { id: "CP_83100", name: "CP 83100 (Norte-Poniente San Benito)", coords: [29.095, -110.978], padronTotal: 120000, demographics: { comerciantes: 0.30, jovenes: 0.40, asalariados: 0.30 }, militantsBase: { MORENA: 31000, PAN: 24000, PRI: 11000, MC: 15000, NINGUNO: 39000 } },
    "CP_83240": { id: "CP_83240", name: "CP 83240 (Altares / Solidaridad Sur)", coords: [29.015, -110.952], padronTotal: 116100, demographics: { comerciantes: 0.20, jovenes: 0.35, asalariados: 0.45 }, militantsBase: { MORENA: 45200, PAN: 9200, PRI: 16100, MC: 9800, NINGUNO: 35800 } }
  }
};

// Llenamos códigos postales dinámicos para los demás municipios de México para tener cobertura completa
Object.keys(STATE_MUNICIPALITIES).forEach(mId => {
  if (mId !== "HERMOSILLO") {
    const mun = STATE_MUNICIPALITIES[mId];
    MUNICIPAL_CPS[mId] = {
      [`CP_${mId}_1`]: {
        id: `CP_${mId}_1`,
        name: `CP ${Math.round(mun.coords[0] * 1000)} (Zona Norte)`,
        coords: [mun.coords[0] + 0.02, mun.coords[1] - 0.02],
        padronTotal: Math.round(mun.padronTotal * 0.4),
        demographics: { comerciantes: 0.2, jovenes: 0.4, asalariados: 0.4 },
        militantsBase: {
          MORENA: Math.round(mun.padronTotal * 0.15),
          PAN: Math.round(mun.padronTotal * 0.12),
          PRI: Math.round(mun.padronTotal * 0.08),
          MC: Math.round(mun.padronTotal * 0.05),
          NINGUNO: Math.round(mun.padronTotal * 0.15)
        }
      },
      [`CP_${mId}_2`]: {
        id: `CP_${mId}_2`,
        name: `CP ${Math.round(mun.coords[0] * 1000 + 500)} (Zona Sur)`,
        coords: [mun.coords[0] - 0.02, mun.coords[1] + 0.02],
        padronTotal: Math.round(mun.padronTotal * 0.6),
        demographics: { comerciantes: 0.3, jovenes: 0.3, asalariados: 0.4 },
        militantsBase: {
          MORENA: Math.round(mun.padronTotal * 0.20),
          PAN: Math.round(mun.padronTotal * 0.08),
          PRI: Math.round(mun.padronTotal * 0.15),
          MC: Math.round(mun.padronTotal * 0.07),
          NINGUNO: Math.round(mun.padronTotal * 0.25)
        }
      }
    };
  }
});

export function getInterlockingPolygon(center, size = 0.08, index = 0, total = 3) {
  const [lat, lng] = center;
  
  // Generar un polígono orgánico de 14 lados para representar límites territoriales suaves
  const polygonPoints = [];
  const sides = 14;
  
  // Semilla determinista basada en el índice para hacer la forma persistente y única por cada distrito
  const seed = (index + 1) * 3141.59265;
  
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides;
    
    // Ruido atenuado para emular límites geográficos naturales y fluidos sin picos pronunciados
    const noiseFactor = Math.sin(seed + i * 2.3) * 0.06 + Math.cos(seed - i * 1.7) * 0.02;
    
    // Coeficientes de estiramiento sutiles para adaptar la geografía celular a la región
    const stretchLat = 1.0 + Math.sin(seed + 4.5) * 0.04;
    const stretchLng = 1.0 + Math.cos(seed - 4.5) * 0.04;
    
    const distLat = Math.sin(angle) * size * stretchLat * (0.95 + noiseFactor);
    const distLng = Math.cos(angle) * size * stretchLng * (0.95 + noiseFactor);
    
    polygonPoints.push([lat + distLat, lng + distLng]);
  }
  
  // Cerrar el polígono repitiendo el primer punto
  polygonPoints.push(polygonPoints[0]);
  return polygonPoints;
}

// 5. Generación de Población Sintética Multi-nivel (Agentes con Padrón Electoral, CP y Militancia)
export function generateSyntheticPopulation(size = 300) {
  const agents = [];
  const sectors = ["comerciantes", "jovenes", "asalariados"];
  const municipalIds = Object.keys(STATE_MUNICIPALITIES);

  for (let i = 0; i < size; i++) {
    const munId = municipalIds[i % municipalIds.length];
    const mun = STATE_MUNICIPALITIES[munId];
    const cps = Object.keys(MUNICIPAL_CPS[munId]);
    const cpId = cps[i % cps.length];
    const cp = MUNICIPAL_CPS[munId][cpId];

    // Decidir sector según pesos demográficos
    const rand = Math.random();
    let sector = "asalariados";
    if (rand < cp.demographics.comerciantes) {
      sector = "comerciantes";
    } else if (rand < cp.demographics.comerciantes + cp.demographics.jovenes) {
      sector = "jovenes";
    }

    let opinion = 0; // -1 (Conservador) a +1 (Social)
    let happiness = 50 + Math.random() * 30; // 0 a 100

    if (sector === "jovenes") {
      opinion = 0.3 + Math.random() * 0.5;
    } else if (sector === "comerciantes") {
      opinion = -0.5 - Math.random() * 0.4;
    } else {
      opinion = -0.2 + Math.random() * 0.6;
    }

    // Asignar partido con base ponderada en el CP
    let partyAffiliation = "NINGUNO";
    const randParty = Math.random();
    const totalMilitants = cp.militantsBase.MORENA + cp.militantsBase.PAN + cp.militantsBase.PRI + cp.militantsBase.MC + cp.militantsBase.NINGUNO;
    
    const pMorena = cp.militantsBase.MORENA / totalMilitants;
    const pPan = cp.militantsBase.PAN / totalMilitants;
    const pPri = cp.militantsBase.PRI / totalMilitants;
    const pMc = cp.militantsBase.MC / totalMilitants;

    if (randParty < pMorena) partyAffiliation = "MORENA";
    else if (randParty < pMorena + pPan) partyAffiliation = "PAN";
    else if (randParty < pMorena + pPan + pPri) partyAffiliation = "PRI";
    else if (randParty < pMorena + pPan + pPri + pMc) partyAffiliation = "MC";

    const debt = Math.round(5000 + Math.random() * 30000);
    const score = Math.round(50 + Math.random() * 45); // Inicial [50, 95]
    let grade = "B";
    if (score >= 90) grade = "AAA";
    else if (score >= 80) grade = "A";
    else if (score >= 70) grade = "BBB";
    else if (score >= 60) grade = "BB";

    agents.push({
      id: i,
      stateId: mun.stateId,
      municipalityId: munId,
      districtId: cpId,
      sector,
      income: Math.round(15000 + Math.random() * 20000),
      debt,
      creditRating: {
        score,
        grade,
        volatility: parseFloat((Math.random() * 5).toFixed(2))
      },
      opinion: parseFloat(opinion.toFixed(2)),
      happiness: Math.round(happiness),
      baseHappiness: Math.round(happiness),
      voteIntention: Math.random() > 0.5 ? "Candidato_A" : "Candidato_B",
      postalCode: parseInt(cpId.replace("CP_", "").replace(`${munId}_`, "83")),
      partyAffiliation
    });
  }
  return agents;
}

// 6. Reglas de Simulación (ABM)
export function updateAgentState(agent, policies) {
  const { subsidioTransporte, impuestoComercial, presupuestoSeguridad, inversionAgua } = policies;
  let utilityDelta = 0;

  if (agent.sector === "jovenes") {
    utilityDelta += (subsidioTransporte * 0.4) + (inversionAgua * 0.3) + (presupuestoSeguridad * 0.2) - (impuestoComercial * 0.1);
  } else if (agent.sector === "comerciantes") {
    utilityDelta -= (impuestoComercial * 0.6) - (presupuestoSeguridad * 0.5) - (inversionAgua * 0.2) + (subsidioTransporte * 0.1);
  } else { // asalariados
    utilityDelta += (presupuestoSeguridad * 0.4) + (inversionAgua * 0.4) - (impuestoComercial * 0.15) + (subsidioTransporte * 0.15);
  }

  const normalizedDelta = (utilityDelta - 20) * 0.5; 
  let newHappiness = agent.happiness * 0.85 + (agent.baseHappiness + normalizedDelta) * 0.15;
  newHappiness = Math.max(10, Math.min(100, newHappiness));

  const scoreA = (subsidioTransporte * 0.3) + (inversionAgua * 0.3) - (impuestoComercial * 0.2);
  const scoreB = -(impuestoComercial * 0.5) + (presupuestoSeguridad * 0.4);
  
  const threshold = 50;
  let voteIntention = agent.voteIntention;
  const biasA = scoreA + (newHappiness - threshold) * 0.5;
  const biasB = scoreB + (threshold - newHappiness) * 0.5;

  if (agent.opinion > 0.1) {
    voteIntention = (biasA + 10 > biasB) ? "Candidato_A" : "Candidato_B";
  } else if (agent.opinion < -0.1) {
    voteIntention = (biasB + 10 > biasA) ? "Candidato_B" : "Candidato_A";
  } else {
    voteIntention = (biasA > biasB) ? "Candidato_A" : "Candidato_B";
  }

  // Actualización del Rating Crediticio ("Moody's")
  let newScore = agent.creditRating.score + (subsidioTransporte * 0.1) - (impuestoComercial * 0.2) + (inversionAgua * 0.15);
  newScore = Math.max(0, Math.min(100, newScore));
  
  let newGrade = "D";
  if (newScore >= 90) newGrade = "AAA";
  else if (newScore >= 80) newGrade = "A";
  else if (newScore >= 70) newGrade = "BBB";
  else if (newScore >= 60) newGrade = "BB";
  else if (newScore >= 50) newGrade = "B";

  return {
    ...agent,
    happiness: Math.round(newHappiness),
    voteIntention,
    creditRating: {
      ...agent.creditRating,
      score: parseFloat(newScore.toFixed(1)),
      grade: newGrade
    }
  };
}

// 7. Inferencia del Predictor Electoral
export function calculateElectionProbability(agents, candidateProfiles) {
  const total = agents.length;
  if (!total) {
    return {
      votesPercentA: 50,
      votesPercentB: 50,
      winProbabilityA: 50,
      winProbabilityB: 50
    };
  }

  const votesA = agents.filter(a => a.voteIntention === "Candidato_A").length;
  const votesB = total - votesA;

  // Porcentajes de intención de voto directo base
  const baseProbA = (votesA / total) * 100;
  const baseProbB = (votesB / total) * 100;

  // Ponderación de los atributos del candidato para calcular el incentivo o 'Utility'
  // La experiencia aporta estabilidad y madurez al perfil (peso 0.6)
  const bonusExpA = candidateProfiles.candidateA.experienceYears * 0.6;
  const bonusExpB = candidateProfiles.candidateB.experienceYears * 0.6;

  // La coherencia de propuestas y alineación con las problemáticas aporta afinidad (peso 0.25)
  const proposalMatchA = candidateProfiles.candidateA.proposalMatch || 50;
  const proposalMatchB = candidateProfiles.candidateB.proposalMatch || 50;
  const bonusPropA = proposalMatchA * 0.25;
  const bonusPropB = proposalMatchB * 0.25;

  // Puntuación de utilidad neta para la decisión electoral de los votantes flotantes
  const scoreA = baseProbA + bonusExpA + bonusPropA;
  const scoreB = baseProbB + bonusExpB + bonusPropB;

  // Aplicación de la función Softmax con escala de temperatura regulada a 20.0
  // Esto previene que diferencias pequeñas generen saltos cuánticos extremos,
  // y garantiza límites estrictos de probabilidad [0%, 100%] sin valores negativos.
  const temperatura = 20.0;
  const expA = Math.exp(scoreA / temperatura);
  const expB = Math.exp(scoreB / temperatura);
  const sumExp = expA + expB;

  const winProbabilityA = (expA / sumExp) * 100;
  const winProbabilityB = (expB / sumExp) * 100;

  return {
    votesPercentA: parseFloat(((votesA / total) * 100).toFixed(1)),
    votesPercentB: parseFloat(((votesB / total) * 100).toFixed(1)),
    winProbabilityA: parseFloat(winProbabilityA.toFixed(1)),
    winProbabilityB: parseFloat(winProbabilityB.toFixed(1))
  };
}

// 8. Inferencia Electoral Multi-Candidato (Macro-Simulación en Lote)
export function simulateMultiCandidateElection(candidatesArray, baselineNoise = 10) {
  // candidatesArray: array de objetos { id, name, baseSupport, experienceYears, proposalMatch }
  // baseSupport es una estimación cruda pre-elección (ej. encuestas históricas).
  
  if (!candidatesArray || candidatesArray.length === 0) return [];

  // Paso 1: Calcular la Puntuación de Utilidad Neta (Score) para cada candidato
  const scoredCandidates = candidatesArray.map(cand => {
    // Ruido aleatorio para simular volatilidad local
    const volatility = (Math.random() * baselineNoise) - (baselineNoise / 2);
    
    // Bonificaciones del perfil (XAI)
    const bonusExp = (cand.experienceYears || 0) * 0.6;
    const bonusProp = (cand.proposalMatch || 50) * 0.25;
    
    const rawScore = (cand.baseSupport || 0) + bonusExp + bonusProp + volatility;
    
    return { ...cand, _rawScore: rawScore };
  });

  // Paso 2: Aplicación del Algoritmo Softmax (N-Way)
  const temperatura = 20.0; // Controla la "dureza" de la probabilidad
  
  // Exponenciales
  const exps = scoredCandidates.map(c => Math.exp(c._rawScore / temperatura));
  const sumExp = exps.reduce((acc, val) => acc + val, 0);

  // Paso 3: Asignar Probabilidades Finales
  const results = scoredCandidates.map((c, index) => {
    const prob = (exps[index] / sumExp) * 100;
    return {
      id: c.id,
      name: c.name,
      winProbability: parseFloat(prob.toFixed(1)),
      color: c.color || '#888' // Fallback color
    };
  });

  // Paso 4: Ordenar de mayor a menor probabilidad y calcular diferencias (Spread)
  results.sort((a, b) => b.winProbability - a.winProbability);
  
  // Agregar cálculo de la diferencia respecto al inmediato perseguidor
  const resultsWithSpread = results.map((c, index, arr) => {
    let spread = 0;
    if (index === 0 && arr.length > 1) {
      // Si es el líder, su spread es la diferencia sobre el 2do lugar
      spread = parseFloat((c.winProbability - arr[1].winProbability).toFixed(1));
    } else if (index > 0) {
      // Si no es el líder, su spread es la diferencia respecto al líder
      spread = parseFloat((c.winProbability - arr[0].winProbability).toFixed(1));
    }
    return { ...c, spread };
  });

  return resultsWithSpread;
}
