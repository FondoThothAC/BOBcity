// ============================================================
// CivicPulse - Data Models & Types
// ============================================================

// Geographic hierarchy: Country -> State -> Municipality -> District -> Precinct

export interface GeographicEntity {
  id: string;
  type: 'country' | 'state' | 'municipality' | 'district' | 'precinct';
  name: string;
  parentId?: string;
  coordinates?: [number, number]; // [lat, lng]
  population?: number;
}

export interface PainPoint {
  id: string;
  category: 'security' | 'water' | 'economy' | 'transport' | 'health' | 'education' | 'corruption';
  intensity: number; // 0-100
  coordinates: [number, number];
  description: string;
  source: 'citizen_report' | 'social_media' | 'official' | 'survey';
  timestamp: Date;
  municipalityId: string;
  districtId?: string;
}

export interface HeatMapLayer {
  category: PainPoint['category'];
  opacity: number;
  radius: number;
  enabled: boolean;
}

// ============================================================
// Candidate & Profile Models
// ============================================================

export interface CandidateProfile {
  id: string;
  name: string;
  party: string;
  coalition?: string;
  gender: 'male' | 'female' | 'other';
  age: number;
  education: 'high_school' | 'bachelor' | 'master' | 'doctorate';

  // Professional background
  experience: {
    government: number; // years
    private_sector: number;
    academia: number;
    activism: number;
  };

  // Security-related experience
  hasSecurityBackground: boolean;

  // Speaking indigenous languages
  speaksIndigenous: boolean;

  // Profile tags
  profileType: 'loyal_official' | 'young_rebel' | 'pragmatic_business' | 'rights_lawyer' | 'technocrat' | 'veteran_political';

  // Proposal keywords
  proposalKeywords: string[];

  // Sentiment scores (-1 to 1)
  proposalSentiment: number;

  // Political affiliation
  partyLoyalty: number; // 0-100
  incumbent: boolean;

  // Geographic context
  districtId: string;
  municipalityId: string;
  stateId: string;
}

export interface CandidateMatchResult {
  candidate: CandidateProfile;
  winProbability: number;
  confidenceInterval: [number, number];
  factors: {
    name: string;
    contribution: number; // percentage
  }[];
}

// ============================================================
// Agent-Based Model (ABM) Types
// ============================================================

export type AgentSector = 'small_business' | 'young_professional' | 'industrial_worker' | 'student' | 'retiree';

export interface Agent {
  id: string;
  sector: AgentSector;

  // Demographics
  age: number;
  income: number; // monthly pesos
  education: number; // years

  // Political
  partyAffiliation: string | null;
  voteIntention: string | null;
  politicalEngagement: number; // 0-100

  // Well-being
  happiness: number; // 0-100
  satisfaction: number; // 0-100

  // Location
  coordinates: [number, number];
  districtId: string;

  // Reactions to policies
  sensitivity: {
    tax: number;
    subsidy: number;
    security: number;
    education: number;
    health: number;
  };
}

export interface PolicyIntervention {
  id: string;
  name: string;
  type: 'tax' | 'subsidy' | 'security' | 'infrastructure' | 'social';

  parameters: {
    [key: string]: number;
  };

  affectedSectors: AgentSector[];

  duration: number; // months
  cost: number; // pesos
}

export interface SimulationResult {
  timeHorizon: 1 | 5 | 10; // years
  policyId: string;

  metrics: {
    gdp: number[];
    unemployment: number[];
    happiness: number[];
    voteIntention: { [party: string]: number[] };
  };

  sectorImpact: {
    [sector in AgentSector]: {
      happinessChange: number;
      incomeChange: number;
      employmentChange: number;
    };
  };
}

// ============================================================
// Electoral & Historical Data
// ============================================================

export interface ElectoralResult {
  electionId: string;
  electionType: 'presidential' | 'gubernatorial' | 'municipal' | 'district';
  date: Date;

  stateId: string;
  municipalityId: string;
  districtId?: string;

  results: {
    candidateId: string;
    candidateName: string;
    party: string;
    votes: number;
    percentage: number;
  }[];

  turnout: number;
  winner: string;
  margin: number; // percentage points
}

export interface HistoricalAnalysis {
  entityId: string;
  entityType: GeographicEntity['type'];

  volatilityIndex: number;
  incumbentTurnoverRate: number;

  winningProfiles: CandidateProfile[];
  commonPatterns: string[];

  keyFactors: {
    factor: string;
    correlationWithWin: number;
  }[];
}

// ============================================================
// Analytics & KPIs
// ============================================================

export interface KPIDashboard {
  overview: {
    totalPainPoints: number;
    painPointGrowth: number; // percentage
    activeProposals: number;
    citizenEngagement: number;
  };

  categories: {
    category: PainPoint['category'];
    count: number;
    trend: 'up' | 'down' | 'stable';
    intensity: number;
  }[];

  geographic: {
    stateId: string;
    painLevel: number;
    topIssue: PainPoint['category'];
  }[];

  electoral: {
    nextElection: Date;
    daysUntil: number;
    predictedTurnout: number;
    leadingCandidate: string;
  };
}

// ============================================================
// Data Hub & Monetization
// ============================================================

export interface DataPackage {
  id: string;
  name: string;
  description: string;

  category: 'census' | 'electoral' | 'economic' | 'social' | 'predictive';

  dataLevel: 'national' | 'state' | 'municipal' | 'district';

  includes: string[];

  price: number;
  billingCycle: 'one_time' | 'monthly' | 'yearly';

  formats: ['csv', 'json', 'xlsx'];

  refreshRate: 'realtime' | 'daily' | 'weekly' | 'monthly';
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  dataAccess: DataPackage['category'][];
}

// ============================================================
// Constants
// ============================================================

export const PAIN_CATEGORIES: PainPoint['category'][] = [
  'security',
  'water',
  'economy',
  'transport',
  'health',
  'education',
  'corruption'
];

export const CATEGORY_LABELS: Record<PainPoint['category'], string> = {
  security: 'Seguridad',
  water: 'Agua',
  economy: 'Economía',
  transport: 'Transporte',
  health: 'Salud',
  education: 'Educación',
  corruption: 'Corrupción'
};

export const CATEGORY_COLORS: Record<PainPoint['category'], string> = {
  security: '#ef4444',    // red
  water: '#3b82f6',       // blue
  economy: '#22c55e',     // green
  transport: '#f59e0b',    // amber
  health: '#ec4899',      // pink
  education: '#8b5cf6',   // purple
  corruption: '#6b7280'  // gray
};

export const SECTOR_LABELS: Record<AgentSector, string> = {
  small_business: 'Pequeños Comerciantes',
  young_professional: 'Jóvenes Profesionales',
  industrial_worker: 'Obreros Industriales',
  student: 'Estudiantes',
  retiree: 'Jubilados'
};

export const HERMOSILLO_CENTER: [number, number] = [29.0729, -110.9535];
export const HERMOSILLO_BOUNDS = {
  north: 29.15,
  south: 28.95,
  east: -110.75,
  west: -111.10
};