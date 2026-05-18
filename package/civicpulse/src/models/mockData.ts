// ============================================================
// CivicPulse - Mock Data for Hermosillo, Sonora
// ============================================================
// Datos de demostración para el MVP de alta fidelidad

import type {
  PainPoint,
  CandidateProfile,
  ElectoralResult,
  GeographicEntity,
  KPIDashboard,
  DataPackage,
  SubscriptionTier
} from './dataModel';
import { HERMOSILLO_CENTER } from './dataModel';

// ============================================================
// Geographic Entities - Hermosillo Districts
// ============================================================

export const HERMOSILLO_DISTRICTS: GeographicEntity[] = [
  { id: 'district_1', type: 'district', name: 'Distrito 1 - Centro', parentId: 'hermosillo', coordinates: [29.0729, -110.9535], population: 125000 },
  { id: 'district_2', type: 'district', name: 'Distrito 2 - Norte', parentId: 'hermosillo', coordinates: [29.0950, -110.9450], population: 98000 },
  { id: 'district_3', type: 'district', name: 'Distrito 3 - Sur', parentId: 'hermosillo', coordinates: [29.0450, -110.9600], population: 110000 },
  { id: 'district_4', type: 'district', name: 'Distrito 4 - Poniente', parentId: 'hermosillo', coordinates: [29.0700, -111.0000], population: 145000 },
  { id: 'district_5', type: 'district', name: 'Distrito 5 - Kiel', parentId: 'hermosillo', coordinates: [29.0550, -110.9300], population: 87000 },
  { id: 'district_6', type: 'district', name: 'Distrito 6 - Cache', parentId: 'hermosillo', coordinates: [29.0900, -110.9700], population: 92000 },
  { id: 'district_7', type: 'district', name: 'Distrito 7 - El Realito', parentId: 'hermosillo', coordinates: [29.0400, -110.9200], population: 78000 },
  { id: 'district_8', type: 'district', name: 'Distrito 8 - Balderrama', parentId: 'hermosillo', coordinates: [29.0650, -110.9200], population: 105000 }
];

export const HERMOSILLO_MUNICIPALITY: GeographicEntity = {
  id: 'hermosillo',
  type: 'municipality',
  name: 'Hermosillo',
  parentId: 'sonora',
  coordinates: HERMOSILLO_CENTER,
  population: 936950
};

export const SONORA_STATE: GeographicEntity = {
  id: 'sonora',
  type: 'state',
  name: 'Sonora',
  parentId: 'mexico',
  coordinates: [29.2975, -110.3306],
  population: 2976125
};

// ============================================================
// Pain Points - Citizens Reports
// ============================================================

export const PAIN_POINTS: PainPoint[] = [
  // Seguridad - Mayor concentración en zona norte y Kiel
  {
    id: 'pp_001',
    category: 'security',
    intensity: 85,
    coordinates: [29.0950, -110.9450],
    description: 'Robos frecuentes en colonia Elitech y zona comercial de la 33',
    source: 'citizen_report',
    timestamp: new Date('2024-11-15'),
    municipalityId: 'hermosillo',
    districtId: 'district_2'
  },
  {
    id: 'pp_002',
    category: 'security',
    intensity: 78,
    coordinates: [29.0580, -110.9280],
    description: 'Inseguridad nocturna en sector Kiel - pocos vigilancia',
    source: 'social_media',
    timestamp: new Date('2024-11-20'),
    municipalityId: 'hermosillo',
    districtId: 'district_5'
  },
  {
    id: 'pp_003',
    category: 'security',
    intensity: 72,
    coordinates: [29.0420, -110.9250],
    description: 'Asaltos a usuarios de transporte público en ruta al sur',
    source: 'survey',
    timestamp: new Date('2024-10-28'),
    municipalityId: 'hermosillo',
    districtId: 'district_7'
  },

  // Agua - Problema crónico en el sur
  {
    id: 'pp_004',
    category: 'water',
    intensity: 92,
    coordinates: [29.0400, -110.9600],
    description: 'Falta de agua potable por más de 72 horas en sector Ejido',
    source: 'official',
    timestamp: new Date('2024-11-10'),
    municipalityId: 'hermosillo',
    districtId: 'district_3'
  },
  {
    id: 'pp_005',
    category: 'water',
    intensity: 88,
    coordinates: [29.0380, -110.9150],
    description: 'Tandeo irregular en colonia El Realito - solo 2 horas al día',
    source: 'citizen_report',
    timestamp: new Date('2024-11-18'),
    municipalityId: 'hermosillo',
    districtId: 'district_7'
  },
  {
    id: 'pp_006',
    category: 'water',
    intensity: 65,
    coordinates: [29.0720, -110.9980],
    description: 'Fugas constantes en red de agua del sector Poniente',
    source: 'citizen_report',
    timestamp: new Date('2024-10-05'),
    municipalityId: 'hermosillo',
    districtId: 'district_4'
  },

  // Economía - Comercios en zona centro
  {
    id: 'pp_007',
    category: 'economy',
    intensity: 76,
    coordinates: [29.0700, -110.9500],
    description: 'Cierre de negocios locales por competencia de malls',
    source: 'citizen_report',
    timestamp: new Date('2024-11-22'),
    municipalityId: 'hermosillo',
    districtId: 'district_1'
  },
  {
    id: 'pp_008',
    category: 'economy',
    intensity: 70,
    coordinates: [29.0650, -110.9180],
    description: 'Despidos en industria maquiladora de zona Balderrama',
    source: 'social_media',
    timestamp: new Date('2024-11-25'),
    municipalityId: 'hermosillo',
    districtId: 'district_8'
  },
  {
    id: 'pp_009',
    category: 'economy',
    intensity: 68,
    coordinates: [29.0930, -110.9680],
    description: 'Falta de créditos para pequeños comerciantes',
    source: 'survey',
    timestamp: new Date('2024-10-15'),
    municipalityId: 'hermosillo',
    districtId: 'district_6'
  },

  // Transporte - Rutas deficientes en zonas nuevas
  {
    id: 'pp_010',
    category: 'transport',
    intensity: 82,
    coordinates: [29.0680, -110.9100],
    description: 'No hay ruta de transporte público en zona en desarrollo',
    source: 'citizen_report',
    timestamp: new Date('2024-11-12'),
    municipalityId: 'hermosillo',
    districtId: 'district_8'
  },
  {
    id: 'pp_011',
    category: 'transport',
    intensity: 75,
    coordinates: [29.0450, -110.9350],
    description: 'Unidades de transporte público en mal estado',
    source: 'survey',
    timestamp: new Date('2024-10-20'),
    municipalityId: 'hermosillo',
    districtId: 'district_7'
  },
  {
    id: 'pp_012',
    category: 'transport',
    intensity: 60,
    coordinates: [29.0880, -110.9500],
    description: 'Congestionamiento vial en hora pico en Blvd. Kino',
    source: 'official',
    timestamp: new Date('2024-09-30'),
    municipalityId: 'hermosillo',
    districtId: 'district_2'
  },

  // Educación - Zonas rurales
  {
    id: 'pp_013',
    category: 'education',
    intensity: 74,
    coordinates: [29.0350, -110.9750],
    description: 'Escasez de espacios en preparatorias del sur',
    source: 'survey',
    timestamp: new Date('2024-11-05'),
    municipalityId: 'hermosillo',
    districtId: 'district_3'
  },
  {
    id: 'pp_014',
    category: 'education',
    intensity: 68,
    coordinates: [29.0500, -110.9850],
    description: 'Falta de computadoras en escuelas públicas de básica',
    source: 'citizen_report',
    timestamp: new Date('2024-10-25'),
    municipalityId: 'hermosillo',
    districtId: 'district_3'
  },

  // Salud - Infraestructura insuficiente
  {
    id: 'pp_015',
    category: 'health',
    intensity: 79,
    coordinates: [29.0550, -110.9320],
    description: 'Hospital público saturado en zona Kiel',
    source: 'citizen_report',
    timestamp: new Date('2024-11-14'),
    municipalityId: 'hermosillo',
    districtId: 'district_5'
  },
  {
    id: 'pp_016',
    category: 'health',
    intensity: 71,
    coordinates: [29.0800, -110.9600],
    description: 'Falta de clínica ISSSTEGON en sector norte',
    source: 'survey',
    timestamp: new Date('2024-10-18'),
    municipalityId: 'hermosillo',
    districtId: 'district_2'
  },

  // Corrupción - Gobierno local
  {
    id: 'pp_017',
    category: 'corruption',
    intensity: 77,
    coordinates: [29.0729, -110.9535],
    description: 'Denuncia ciudadana sobre otorgamiento irregular de permisos',
    source: 'citizen_report',
    timestamp: new Date('2024-11-08'),
    municipalityId: 'hermosillo',
    districtId: 'district_1'
  },
  {
    id: 'pp_018',
    category: 'corruption',
    intensity: 65,
    coordinates: [29.0600, -110.9400],
    description: 'Percepción de lento trámites en obras públicas',
    source: 'survey',
    timestamp: new Date('2024-09-22'),
    municipalityId: 'hermosillo',
    districtId: 'district_1'
  }
];

// ============================================================
// Candidate Profiles - Mock Electoral Data
// ============================================================

export const MOCK_CANDIDATES: CandidateProfile[] = [
  {
    id: 'cand_001',
    name: 'María del Rosario López Félix',
    party: 'MORENA',
    coalition: 'Juntos Hacemos Historia',
    gender: 'female',
    age: 52,
    education: 'master',

    experience: {
      government: 12,
      private_sector: 5,
      academia: 3,
      activism: 8
    },

    hasSecurityBackground: false,
    speaksIndigenous: false,
    profileType: 'loyal_official',
    proposalKeywords: ['seguridad', 'agua', 'empleo', 'pobreza'],
    proposalSentiment: 0.7,
    partyLoyalty: 85,
    incumbent: true,
    districtId: 'district_1',
    municipalityId: 'hermosillo',
    stateId: 'sonora'
  },
  {
    id: 'cand_002',
    name: 'Carlos Alberto Gámez López',
    party: 'PAN',
    coalition: 'Va por Sonora',
    gender: 'male',
    age: 45,
    education: 'bachelor',

    experience: {
      government: 3,
      private_sector: 15,
      academia: 0,
      activism: 2
    },

    hasSecurityBackground: true,
    speaksIndigenous: false,
    profileType: 'pragmatic_business',
    proposalKeywords: ['economía', 'inversión', 'empleo', 'seguridad'],
    proposalSentiment: 0.6,
    partyLoyalty: 70,
    incumbent: false,
    districtId: 'district_2',
    municipalityId: 'hermosillo',
    stateId: 'sonora'
  },
  {
    id: 'cand_003',
    name: 'Ana Lucía Jiménez Torres',
    party: 'PRI',
    coalition: 'Juntos Hacemos Historia',
    gender: 'female',
    age: 38,
    education: 'doctorate',

    experience: {
      government: 6,
      private_sector: 2,
      academia: 10,
      activism: 4
    },

    hasSecurityBackground: false,
    speaksIndigenous: true,
    profileType: 'technocrat',
    proposalKeywords: ['educación', 'tecnología', 'innovación', 'jóvenes'],
    proposalSentiment: 0.8,
    partyLoyalty: 55,
    incumbent: false,
    districtId: 'district_3',
    municipalityId: 'hermosillo',
    stateId: 'sonora'
  },
  {
    id: 'cand_004',
    name: 'Jorge Miguel Hernández Morales',
    party: 'MC',
    gender: 'male',
    age: 29,
    education: 'bachelor',

    experience: {
      government: 1,
      private_sector: 4,
      academia: 0,
      activism: 6
    },

    hasSecurityBackground: false,
    speaksIndigenous: false,
    profileType: 'young_rebel',
    proposalKeywords: ['transparencia', 'juventud', 'transporte', 'medio ambiente'],
    proposalSentiment: 0.75,
    partyLoyalty: 40,
    incumbent: false,
    districtId: 'district_4',
    municipalityId: 'hermosillo',
    stateId: 'sonora'
  },
  {
    id: 'cand_005',
    name: 'Rosa María Flores Quiñonez',
    party: 'MORENA',
    gender: 'female',
    age: 55,
    education: 'bachelor',

    experience: {
      government: 8,
      private_sector: 3,
      academia: 1,
      activism: 10
    },

    hasSecurityBackground: true,
    speaksIndigenous: false,
    profileType: 'rights_lawyer',
    proposalKeywords: ['seguridad', 'mujer', 'justicia', 'derechos humanos'],
    proposalSentiment: 0.65,
    partyLoyalty: 80,
    incumbent: false,
    districtId: 'district_5',
    municipalityId: 'hermosillo',
    stateId: 'sonora'
  },
  {
    id: 'cand_006',
    name: 'Pedro Antonio Ruiz Sánchez',
    party: 'PVEM',
    gender: 'male',
    age: 62,
    education: 'master',

    experience: {
      government: 20,
      private_sector: 8,
      academia: 5,
      activism: 3
    },

    hasSecurityBackground: false,
    speaksIndigenous: false,
    profileType: 'veteran_political',
    proposalKeywords: ['medio ambiente', 'desarrollo sostenible', 'agua', 'energía'],
    proposalSentiment: 0.7,
    partyLoyalty: 90,
    incumbent: true,
    districtId: 'district_6',
    municipalityId: 'hermosillo',
    stateId: 'sonora'
  }
];

// ============================================================
// Electoral History - Historical Results
// ============================================================

export const ELECTORAL_HISTORY: ElectoralResult[] = [
  {
    electionId: 'elec_2024_pres',
    electionType: 'presidential',
    date: new Date('2024-06-02'),
    stateId: 'sonora',
    municipalityId: 'hermosillo',
    results: [
      { candidateId: 'claudia_sheinbaum', candidateName: 'Claudia Sheinbaum Pardo', party: 'MORENA', votes: 285420, percentage: 58.2 },
      { candidateId: 'xochitl_galvez', candidateName: 'Xóchitl Gálvez Ruiz', party: 'PAN', votes: 156890, percentage: 32.1 },
      { candidateId: 'mayoria_guerra', candidateName: 'Jorge Máyorga Guerra', party: 'MC', votes: 48020, percentage: 9.7 }
    ],
    turnout: 72.5,
    winner: 'claudia_sheinbaum',
    margin: 26.1
  },
  {
    electionId: 'elec_2024_gub',
    electionType: 'gubernatorial',
    date: new Date('2024-06-02'),
    stateId: 'sonora',
    municipalityId: 'hermosillo',
    results: [
      { candidateId: 'alfonso', candidateName: 'Alfonso Durón Montes', party: 'MORENA', votes: 252340, percentage: 51.8 },
      { candidateId: 'imeldf', candidateName: 'Imelda D. Fuentes', party: 'PAN', votes: 189560, percentage: 38.9 },
      { candidateId: 'pedro_mc', candidateName: 'Pedro Jiménez', party: 'MC', votes: 45670, percentage: 9.3 }
    ],
    turnout: 71.2,
    winner: 'alfonso',
    margin: 12.9
  },
  {
    electionId: 'elec_2021_mun',
    electionType: 'municipal',
    date: new Date('2021-06-06'),
    stateId: 'sonora',
    municipalityId: 'hermosillo',
    results: [
      { candidateId: 'malula', candidateName: 'María del Rosario López Félix', party: 'MORENA', votes: 178450, percentage: 47.3 },
      { candidateId: 'lopera', candidateName: 'Antonio Lopera García', party: 'PAN', votes: 142890, percentage: 37.9 },
      { candidateId: 'Otros', candidateName: 'Otros candidatos', party: 'Other', votes: 56120, percentage: 14.8 }
    ],
    turnout: 65.8,
    winner: 'malula',
    margin: 9.4
  },
  {
    electionId: 'elec_2018_pres',
    electionType: 'presidential',
    date: new Date('2018-07-01'),
    stateId: 'sonora',
    municipalityId: 'hermosillo',
    results: [
      { candidateId: 'amlo', candidateName: 'Andrés Manuel López Obrador', party: 'MORENA', votes: 245670, percentage: 51.2 },
      { candidateId: 'meade', candidateName: 'José Antonio Meade Kuribreña', party: 'PRI', votes: 132450, percentage: 27.6 },
      { candidateId: 'anaya', candidateName: 'Ricardo Anaya Cortés', party: 'PAN', votes: 89230, percentage: 18.6 },
      { candidateId: 'bronco', candidateName: 'Jaime Rodríguez Calderón', party: 'MC', votes: 12100, percentage: 2.6 }
    ],
    turnout: 68.4,
    winner: 'amlo',
    margin: 23.6
  }
];

// ============================================================
// District Context Data (for predictions)
// ============================================================

export const DISTRICT_CONTEXT: Record<string, {
  povertyRate: number;
  violenceRate: number;
  educationLevel: number;
  unemploymentRate: number;
  indigenousPopulation: number;
}> = {
  'district_1': { povertyRate: 0.28, violenceRate: 12, educationLevel: 0.65, unemploymentRate: 4.5, indigenousPopulation: 5 },
  'district_2': { povertyRate: 0.35, violenceRate: 22, educationLevel: 0.55, unemploymentRate: 6.2, indigenousPopulation: 8 },
  'district_3': { povertyRate: 0.42, violenceRate: 15, educationLevel: 0.48, unemploymentRate: 7.8, indigenousPopulation: 12 },
  'district_4': { povertyRate: 0.30, violenceRate: 10, educationLevel: 0.58, unemploymentRate: 5.1, indigenousPopulation: 6 },
  'district_5': { povertyRate: 0.38, violenceRate: 18, educationLevel: 0.52, unemploymentRate: 6.8, indigenousPopulation: 10 },
  'district_6': { povertyRate: 0.25, violenceRate: 8, educationLevel: 0.70, unemploymentRate: 4.0, indigenousPopulation: 4 },
  'district_7': { povertyRate: 0.48, violenceRate: 16, educationLevel: 0.40, unemploymentRate: 9.2, indigenousPopulation: 18 },
  'district_8': { povertyRate: 0.32, violenceRate: 14, educationLevel: 0.54, unemploymentRate: 5.8, indigenousPopulation: 9 }
};

// ============================================================
// KPI Dashboard Data
// ============================================================

export const KPI_DASHBOARD: KPIDashboard = {
  overview: {
    totalPainPoints: PAIN_POINTS.length,
    painPointGrowth: 12.5, // percentage increase
    activeProposals: 47,
    citizenEngagement: 2834
  },
  categories: [
    { category: 'security', count: 3, trend: 'up', intensity: 82 },
    { category: 'water', count: 3, trend: 'up', intensity: 82 },
    { category: 'economy', count: 3, trend: 'stable', intensity: 71 },
    { category: 'transport', count: 3, trend: 'down', intensity: 72 },
    { category: 'education', count: 2, trend: 'stable', intensity: 71 },
    { category: 'health', count: 2, trend: 'stable', intensity: 75 },
    { category: 'corruption', count: 2, trend: 'down', intensity: 71 }
  ],
  geographic: [
    { stateId: 'sonora', painLevel: 75, topIssue: 'security' }
  ],
  electoral: {
    nextElection: new Date('2027-06-01'),
    daysUntil: 380,
    predictedTurnout: 68.5,
    leadingCandidate: 'María del Rosario López Félix (MORENA)'
  }
};

// ============================================================
// Data Packages for Monetization
// ============================================================

export const DATA_PACKAGES: DataPackage[] = [
  {
    id: 'pkg_001',
    name: 'Censo Básico Hermosillo',
    description: 'Datos demográficos fundamentales del municipio de Hermosillo a nivel colonia',
    category: 'census',
    dataLevel: 'municipal',
    includes: ['población por edad', 'nivel educativo', 'ingresos por hogar', 'empleo'],
    price: 2999,
    billingCycle: 'one_time',
    formats: ['csv', 'json', 'xlsx'],
    refreshRate: 'monthly'
  },
  {
    id: 'pkg_002',
    name: 'Análisis Electoral Sonora 2018-2024',
    description: 'Histórico completo de resultados electorales por distrito y municipio',
    category: 'electoral',
    dataLevel: 'state',
    includes: ['resultados por candidato', 'participación ciudadana', 'tendencias', 'mapas GEOJSON'],
    price: 5999,
    billingCycle: 'one_time',
    formats: ['csv', 'json', 'xlsx'],
    refreshRate: 'monthly'
  },
  {
    id: 'pkg_003',
    name: 'Predictor Electoral Premium',
    description: 'API de predicción electoral con modelos de IA y datos actualizados',
    category: 'predictive',
    dataLevel: 'national',
    includes: ['probabilidades de victoria', 'análisis de factores', 'comparativas head-to-head'],
    price: 19999,
    billingCycle: 'monthly',
    formats: ['json'],
    refreshRate: 'realtime'
  },
  {
    id: 'pkg_004',
    name: 'Indicadores Económicos Regionales',
    description: 'KPIs económicos y sociales a nivel municipal y distrital',
    category: 'economic',
    dataLevel: 'municipal',
    includes: ['pobreza multidimensional', 'desempleo', 'crecimiento PIB local', 'inflación'],
    price: 4499,
    billingCycle: 'monthly',
    formats: ['csv', 'json'],
    refreshRate: 'weekly'
  }
];

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'tier_basic',
    name: 'Básico',
    price: 999,
    features: [
      'Acceso a dashboard público',
      '3 mapas de calor al mes',
      'Datos demográficos básicos',
      'Soporte por email'
    ],
    dataAccess: ['census']
  },
  {
    id: 'tier_professional',
    name: 'Profesional',
    price: 4999,
    features: [
      'Todo lo del plan Básico',
      'Mapas de calor ilimitados',
      'Datos electorales históricos',
      'Exportación CSV/JSON',
      'Soporte prioritario'
    ],
    dataAccess: ['census', 'electoral', 'economic']
  },
  {
    id: 'tier_enterprise',
    name: 'Empresarial',
    price: 19999,
    features: [
      'Todo lo del plan Profesional',
      'API de predicciones en tiempo real',
      'Gemelo Digital Social completo',
      'Simulador ABM personalizado',
      'Consultoría dedicada',
      'SLA 99.9%'
    ],
    dataAccess: ['census', 'electoral', 'economic', 'predictive', 'social']
  }
];

// ============================================================
// Policy Interventions for Simulation
// ============================================================

export const SAMPLE_POLICIES: PolicyIntervention[] = [
  {
    id: 'pol_001',
    name: 'Subsidio de Transporte para Estudiantes',
    type: 'subsidy',
    parameters: { amount: 500, coverage: 0.3 },
    affectedSectors: ['student', 'young_professional'],
    duration: 24,
    cost: 15000000
  },
  {
    id: 'pol_002',
    name: 'Impuesto al Carbono del 5%',
    type: 'tax',
    parameters: { rate: 0.05 },
    affectedSectors: ['small_business', 'industrial_worker'],
    duration: 60,
    cost: 0
  },
  {
    id: 'pol_003',
    name: 'Programa Integral de Seguridad',
    type: 'security',
    parameters: { investment: 100, cameras: 200, patrol_units: 50 },
    affectedSectors: ['small_business', 'industrial_worker', 'young_professional', 'retiree'],
    duration: 36,
    cost: 50000000
  },
  {
    id: 'pol_004',
    name: 'Becas Universitarias para el Sur',
    type: 'social',
    parameters: { spend: 200, coverage: 0.25, target: 'education' },
    affectedSectors: ['student', 'young_professional'],
    duration: 48,
    cost: 25000000
  }
];