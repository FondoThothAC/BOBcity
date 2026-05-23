# DDD - Diseño Dirigido por el Dominio
## CívicaOS: Sistema de Inteligencia Cívica Multi-Nivel

**Versión:** 1.0.0
**Fecha:** 2026-05-18
**Autor:** MiniMax Agent
**Estado:** Especificación Oficial

---

## 1. Modelo de Dominio de CívicaOS

### 1.1 Contexto Delimitado: Inteligencia Cívica

El dominio de cívicaOS se centra en la inteligencia cívica, un campo que combina la ciencia política, la sociología computacional y la analítica de datos para comprender y predecir el comportamiento de los ciudadanos en contextos electorales y de políticas públicas. Este dominio tiene sus propios conceptos fundamentales, reglas de negocio y lenguaje ubicuo que deben reflejarse en el código para mantener la coherencia entre los diferentes componentes del sistema.

El contexto delimitado de Inteligencia Cívica abarca todo lo relacionado con el análisis de problemas ciudadanos, la simulación de políticas públicas y la predicción de resultados electorales. Este contexto se comunica con contextos externos limitados a través de interfaces bien definidas, específicamente los adaptadores para los servicios del INE e INEGI que proporcionan datos demográficos y electorales, y el contexto de Open Business Plan que recibe las recomendaciones generadas para su conversión en proyectos ejecutables.

### 1.2 Entidades del Dominio

#### Entidad: PainPoint (Punto de Dolor)

El punto de dolor representa un problema específico que afecta a los ciudadanos en una ubicación geográfica determinada. Esta es la entidad central del dominio, ya que todo el sistema gira en torno a la identificación, análisis y resolución de estos puntos de dolor.

```typescript
// src/domain/entities/PainPoint.ts

import { Entity } from '../../shared/kernel/Entity';
import { DomainEvent } from '../../shared/kernel/DomainEvent';
import { Guard } from '../../shared/kernel/Guard';

export type PainCategory =
  | 'security'
  | 'water'
  | 'economy'
  | 'transport'
  | 'health'
  | 'education'
  | 'corruption';

export interface PainPointProps {
  id: string;
  entityId: string;
  category: PainCategory;
  title: string;
  description: string;
  intensity: number;
  probability: number;
  affectedPopulation: number;
  economicImpact?: number;
  source: 'inegi' | 'ine' | 'survey' | 'social_media' | 'aggregated';
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class PainPoint extends Entity<PainPointProps> {
  private constructor(props: PainPointProps) {
    super(props);
  }

  public static create(props: Omit<PainPointProps, 'id' | 'createdAt' | 'updatedAt'>): PainPoint {
    Guard.againstEmptyString(props.title, 'PainPoint title');
    Guard.againstNumberOutOfRange(props.intensity, 0, 100, 'PainPoint intensity');
    Guard.againstNumberOutOfRange(props.probability, 0, 1, 'PainPoint probability');

    return new PainPoint({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static reconstitute(props: PainPointProps): PainPoint {
    return new PainPoint(props);
  }

  get category(): PainCategory {
    return this.props.category;
  }

  get intensity(): number {
    return this.props.intensity;
  }

  get severityScore(): number {
    return (this.props.intensity * this.props.probability * this.props.affectedPopulation) / 10000;
  }

  public escalate(newIntensity: number): void {
    this.props.intensity = Math.max(this.props.intensity, newIntensity);
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new DomainEvent('PainPointEscalated', {
        painPointId: this.id,
        oldIntensity: this.props.intensity,
        newIntensity,
        timestamp: new Date(),
      })
    );
  }

  public resolve(): void {
    this.props.intensity = 0;
    this.props.updatedAt = new Date();

    this.addDomainEvent(
      new DomainEvent('PainPointResolved', {
        painPointId: this.id,
        resolutionDate: new Date(),
      })
    );
  }
}
```

#### Entidad: GeographicEntity (Entidad Geográfica)

La entidad geográfica representa cualquier nível de división territorial del sistema político mexicano, desde el país completo hasta zonas específicas dentro de un distrito. Esta entidad proporciona el contexto espacial para todos los demás análisis del sistema.

```typescript
// src/domain/entities/GeographicEntity.ts

export type GeoEntityType = 'country' | 'state' | 'municipality' | 'district' | 'zone';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoBoundary {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][];
}

export interface GeographicEntityProps {
  id: string;
  entityType: GeoEntityType;
  name: string;
  code: string;
  parentId?: string;
  coordinates: Coordinates;
  boundary?: GeoBoundary;
  metadata: Record<string, unknown>;
}

export class GeographicEntity extends Entity<GeographicEntityProps> {
  private constructor(props: GeographicEntityProps) {
    super(props);
  }

  public static create(props: Omit<GeographicEntityProps, 'id'>): GeographicEntity {
    return new GeographicEntity({
      ...props,
      id: crypto.randomUUID(),
    });
  }

  public static reconstitute(props: GeographicEntityProps): GeographicEntity {
    return new GeographicEntity(props);
  }

  public isDescendantOf(ancestorId: string): boolean {
    if (this.props.parentId === ancestorId) {
      return true;
    }
    return false;
  }

  public getAncestors(): string[] {
    const ancestors: string[] = [];
    let current = this.props.parentId;

    while (current) {
      ancestors.push(current);
      current = this.getParentId();
    }

    return ancestors;
  }

  public containsCoordinate(lat: number, lng: number): boolean {
    if (!this.props.boundary) {
      return this.isWithinRadius(lat, lng);
    }
    return this.pointInPolygon(lat, lng, this.props.boundary.coordinates[0]);
  }

  private getParentId(): string | undefined {
    return this.props.parentId;
  }

  private isWithinRadius(lat: number, lng: number): boolean {
    const distance = this.calculateDistance(
      lat,
      lng,
      this.props.coordinates.lat,
      this.props.coordinates.lng
    );
    return distance <= 5;
  }

  private pointInPolygon(point: number[], polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0], yi = polygon[i][1];
      const xj = polygon[j][0], yj = polygon[j][1];

      if (((yi > point[1]) !== (yj > point[1])) &&
          (point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
```

#### Entidad: Candidate (Candidato)

La entidad candidato representa a una persona que participa o ha participado en procesos electorales. El candidato tiene un perfil político que define sus posiciones en diferentes temas, y un historial electoral que permite hacer predicciones sobre su desempeño futuro.

```typescript
// src/domain/entities/Candidate.ts

export type CandidateProfileType =
  | 'economic_reformer'
  | 'social_defender'
  | 'security_strong'
  | 'development_focus'
  | 'establishment';

export interface PoliticalPosition {
  topic: string;
  score: number;
}

export interface ElectoralResult {
  year: number;
  votes: number;
  percentage: number;
  result: 'win' | 'lose';
}

export interface CandidateProps {
  id: string;
  name: string;
  party: string;
  districtId: string;
  profileType: CandidateProfileType;
  politicalPositions: PoliticalPosition[];
  historicalPerformance?: {
    electionsWon: number;
    promisesFulfilled: number;
    totalPromises: number;
  };
  electoralHistory: ElectoralResult[];
  createdAt: Date;
  updatedAt: Date;
}

export class Candidate extends Entity<CandidateProps> {
  private constructor(props: CandidateProps) {
    super(props);
  }

  public static create(props: Omit<CandidateProps, 'id' | 'createdAt' | 'updatedAt'>): Candidate {
    return new Candidate({
      ...props,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static reconstitute(props: CandidateProps): Candidate {
    return new Candidate(props);
  }

  get winRate(): number {
    if (this.props.electoralHistory.length === 0) return 0;
    const wins = this.props.electoralHistory.filter(r => r.result === 'win').length;
    return wins / this.props.electoralHistory.length;
  }

  get averageVoteShare(): number {
    if (this.props.electoralHistory.length === 0) return 0;
    const total = this.props.electoralHistory.reduce((sum, r) => sum + r.percentage, 0);
    return total / this.props.electoralHistory.length;
  }

  get promiseFulfillmentRate(): number | null {
    if (!this.props.historicalPerformance) return null;
    const { promisesFulfilled, totalPromises } = this.props.historicalPerformance;
    return totalPromises > 0 ? promisesFulfilled / totalPromises : 0;
  }

  public getPositionScore(topic: string): number | null {
    const position = this.props.politicalPositions.find(p => p.topic === topic);
    return position?.score ?? null;
  }

  public getSimilarityWith(other: Candidate): number {
    let sumSquaredDiff = 0;
    let topicsCompared = 0;

    for (const position of this.props.politicalPositions) {
      const otherPosition = other.getPositionScore(position.topic);
      if (otherPosition !== null) {
        sumSquaredDiff += Math.pow(position.score - otherPosition, 2);
        topicsCompared++;
      }
    }

    if (topicsCompared === 0) return 0;

    const avgSquaredDiff = sumSquaredDiff / topicsCompared;
    return 1 - Math.sqrt(avgSquaredDiff) / 2;
  }
}
```

---

## 2. Agregados del Dominio

### 2.1 Agregado: Simulation (Simulación)

El agregado de simulación encapsula toda la información relacionada con una simulación de políticas públicas utilizando el motor ABM. Este agregado mantiene la consistencia de los datos relacionados con la simulación, incluyendo la configuración, los parámetros de población, las políticas evaluadas, la trayectoria de resultados y los análisis de impacto.

```typescript
// src/domain/aggregates/Simulation.ts

import { Entity } from '../../shared/kernel/Entity';
import { ValueObject } from '../../shared/kernel/ValueObject';
import { Guard } from '../../shared/kernel/Guard';

interface SimulationConfigProps {
  populationSize: number;
  timeHorizonYears: number;
  iterations: number;
  convergenceThreshold: number;
  randomSeed?: number;
}

interface TrajectoryPointProps {
  year: number;
  avgHappiness: number;
  happinessPercentiles: { p25: number; p50: number; p75: number };
  gdp: number;
  unemployment: number;
  voteDistribution: Record<string, number>;
}

interface SimulationOutcomeProps {
  expectedHappinessGain: number;
  expectedGDPGrowth: number;
  expectedElectoralImpact: Record<string, number>;
  riskFactors: string[];
  confidenceScore: number;
}

export class SimulationConfig extends ValueObject<SimulationConfigProps> {
  private constructor(props: SimulationConfigProps) {
    super(props);
  }

  public static create(props: SimulationConfigProps): SimulationConfig {
    Guard.againstNumberOutOfRange(props.populationSize, 100, 1000000, 'Population size');
    Guard.againstNumberOutOfRange(props.timeHorizonYears, 1, 50, 'Time horizon');
    Guard.againstNumberOutOfRange(props.convergenceThreshold, 0.001, 1, 'Convergence threshold');

    return new SimulationConfig(props);
  }

  get populationSize(): number {
    return this.props.populationSize;
  }

  get timeHorizonYears(): number {
    return this.props.timeHorizonYears;
  }
}

export class TrajectoryPoint extends ValueObject<TrajectoryPointProps> {
  private constructor(props: TrajectoryPointProps) {
    super(props);
  }

  public static create(props: TrajectoryPointProps): TrajectoryPoint {
    return new TrajectoryPoint(props);
  }

  get year(): number {
    return this.props.year;
  }

  get socialProgressIndex(): number {
    return (this.props.avgHappiness * 0.4) + ((100 - this.props.unemployment) * 0.3) + ((this.props.gdp / 1000000) * 0.3);
  }
}

export class SimulationOutcome extends ValueObject<SimulationOutcomeProps> {
  private constructor(props: SimulationOutcomeProps) {
    super(props);
  }

  public static create(props: SimulationOutcomeProps): SimulationOutcome {
    Guard.againstNumberOutOfRange(props.confidenceScore, 0, 1, 'Confidence score');

    return new SimulationOutcome(props);
  }

  get overallViability(): 'high' | 'medium' | 'low' {
    const riskScore = this.props.riskFactors.length * 0.1;
    const viabilityScore = this.props.confidenceScore - riskScore;

    if (viabilityScore >= 0.7) return 'high';
    if (viabilityScore >= 0.4) return 'medium';
    return 'low';
  }
}

interface SimulationProps {
  id: string;
  name: string;
  config: SimulationConfigProps;
  policies: string[];
  trajectory: TrajectoryPointProps[];
  outcomes: SimulationOutcomeProps;
  createdAt: Date;
  completedAt?: Date;
}

export class Simulation extends Entity<SimulationProps> {
  private constructor(props: SimulationProps) {
    super(props);
  }

  public static create(
    name: string,
    config: SimulationConfigProps,
    policies: string[]
  ): Simulation {
    Guard.againstEmptyString(name, 'Simulation name');

    return new Simulation({
      id: crypto.randomUUID(),
      name,
      config,
      policies,
      trajectory: [],
      outcomes: {
        expectedHappinessGain: 0,
        expectedGDPGrowth: 0,
        expectedElectoralImpact: {},
        riskFactors: [],
        confidenceScore: 0,
      },
      createdAt: new Date(),
    });
  }

  public addTrajectoryPoint(point: TrajectoryPointProps): void {
    this.props.trajectory.push(point);
    this.addDomainEvent('TrajectoryPointAdded', { simulationId: this.id, point });
  }

  public complete(outcomes: SimulationOutcomeProps): void {
    this.props.outcomes = outcomes;
    this.props.completedAt = new Date();
    this.addDomainEvent('SimulationCompleted', { simulationId: this.id, outcomes });
  }

  get isComplete(): boolean {
    return this.props.completedAt !== undefined;
  }

  get duration(): number | null {
    if (!this.props.completedAt) return null;
    return this.props.completedAt.getTime() - this.props.createdAt.getTime();
  }

  public getImpactAtYear(year: number): TrajectoryPointProps | null {
    return this.props.trajectory.find(p => p.year === year) ?? null;
  }

  public compareWith(other: Simulation): number {
    const myHappiness = this.getFinalHappiness();
    const otherHappiness = other.getFinalHappiness();
    return myHappiness - otherHappiness;
  }

  private getFinalHappiness(): number {
    const finalPoint = this.props.trajectory[this.props.trajectory.length - 1];
    return finalPoint?.avgHappiness ?? 0;
  }
}
```

---

## 3. Servicios de Dominio

### 3.1 Servicio: PainPointAnalysisService

Este servicio de dominio encapsula la lógica de negocio para el análisis de puntos de dolor, incluyendo la agregación de datos de múltiples fuentes, el cálculo de intensidades ponderadas, y la generación de heat maps geográficos.

```typescript
// src/domain/services/PainPointAnalysisService.ts

import { PainPoint, PainCategory } from '../entities/PainPoint';
import { GeographicEntity } from '../entities/GeographicEntity';

export interface PainPointAnalysis {
  totalPainPoints: number;
  categoryDistribution: Record<PainCategory, number>;
  averageIntensity: number;
  topPainPoints: PainPoint[];
  geographicClusters: GeoCluster[];
}

export interface GeoCluster {
  centroid: { lat: number; lng: number };
  entities: GeographicEntity[];
  dominantCategory: PainCategory;
  combinedIntensity: number;
}

export class PainPointAnalysisService {
  analyze(painPoints: PainPoint[], entities: GeographicEntity[]): PainPointAnalysis {
    const categoryDistribution = this.calculateCategoryDistribution(painPoints);
    const averageIntensity = this.calculateAverageIntensity(painPoints);
    const topPainPoints = this.getTopPainPoints(painPoints, 10);
    const geographicClusters = this.identifyGeographicClusters(painPoints, entities);

    return {
      totalPainPoints: painPoints.length,
      categoryDistribution,
      averageIntensity,
      topPainPoints,
      geographicClusters,
    };
  }

  private calculateCategoryDistribution(painPoints: PainPoint[]): Record<PainCategory, number> {
    const distribution: Record<PainCategory, number> = {
      security: 0,
      water: 0,
      economy: 0,
      transport: 0,
      health: 0,
      education: 0,
      corruption: 0,
    };

    for (const painPoint of painPoints) {
      distribution[painPoint.category]++;
    }

    return distribution;
  }

  private calculateAverageIntensity(painPoints: PainPoint[]): number {
    if (painPoints.length === 0) return 0;

    const sum = painPoints.reduce((acc, pp) => acc + pp.intensity, 0);
    return sum / painPoints.length;
  }

  private getTopPainPoints(painPoints: PainPoint[], limit: number): PainPoint[] {
    return [...painPoints]
      .sort((a, b) => b.severityScore - a.severityScore)
      .slice(0, limit);
  }

  private identifyGeographicClusters(
    painPoints: PainPoint[],
    entities: GeographicEntity[]
  ): GeoCluster[] {
    const entityMap = new Map<string, GeographicEntity>();
    for (const entity of entities) {
      entityMap.set(entity.id, entity);
    }

    const clustersByCategory = new Map<PainCategory, PainPoint[]>();

    for (const painPoint of painPoints) {
      const categoryPoints = clustersByCategory.get(painPoint.category) || [];
      categoryPoints.push(painPoint);
      clustersByCategory.set(painPoint.category, categoryPoints);
    }

    const clusters: GeoCluster[] = [];

    for (const [category, points] of clustersByCategory) {
      if (points.length < 3) continue;

      const centroid = this.calculateCentroid(points, entityMap);
      const relatedEntities = this.findRelatedEntities(points, entityMap);
      const combinedIntensity = points.reduce((sum, pp) => sum + pp.intensity, 0) / points.length;

      clusters.push({
        centroid,
        entities: relatedEntities,
        dominantCategory: category,
        combinedIntensity,
      });
    }

    return clusters.sort((a, b) => b.combinedIntensity - a.combinedIntensity);
  }

  private calculateCentroid(
    points: PainPoint[],
    entityMap: Map<string, GeographicEntity>
  ): { lat: number; lng: number } {
    let sumLat = 0;
    let sumLng = 0;
    let count = 0;

    for (const point of points) {
      const entity = entityMap.get(point.props.entityId);
      if (entity) {
        sumLat += entity.props.coordinates.lat;
        sumLng += entity.props.coordinates.lng;
        count++;
      }
    }

    return count > 0
      ? { lat: sumLat / count, lng: sumLng / count }
      : { lat: 0, lng: 0 };
  }

  private findRelatedEntities(
    points: PainPoint[],
    entityMap: Map<string, GeographicEntity>
  ): GeographicEntity[] {
    const entityIds = new Set(points.map(p => p.props.entityId));
    return Array.from(entityIds)
      .map(id => entityMap.get(id))
      .filter((e): e is GeographicEntity => e !== undefined);
  }
}
```

### 3.2 Servicio: ElectoralPredictionService

Este servicio de dominio encapsula la lógica para predecir resultados electorales basándose en perfiles de candidatos, datos demográficos y tendencias históricas.

```typescript
// src/domain/services/ElectoralPredictionService.ts

import { Candidate } from '../entities/Candidate';
import { GeographicEntity } from '../entities/GeographicEntity';

export interface ElectoralPrediction {
  candidateId: string;
  estimatedVoteShare: number;
  confidenceInterval: { lower: number; upper: number };
  keyFactors: string[];
  recommendation: 'strong_candidate' | 'contender' | 'underdog';
}

export interface SwingDistrictAnalysis {
  districtId: string;
  marginDifference: number;
  leadingCandidate: string;
  predictedWinner: string;
  recommendedStrategy: string;
  investmentEstimate: number;
}

export class ElectoralPredictionService {
  predictElection(
    candidates: Candidate[],
    district: GeographicEntity,
    historicalData: { year: number; winner: string; margin: number }[]
  ): ElectoralPrediction[] {
    const predictions: ElectoralPrediction[] = [];

    for (const candidate of candidates) {
      const baseSupport = this.calculateBaseSupport(candidate, district);
      const trendFactor = this.calculateTrendFactor(candidate, historicalData);
      const demographicFactor = this.calculateDemographicFactor(candidate, district);

      const estimatedShare = Math.min(1, Math.max(0, baseSupport * trendFactor * demographicFactor));
      const confidenceInterval = this.calculateConfidenceInterval(estimatedShare, candidates.length);

      predictions.push({
        candidateId: candidate.id,
        estimatedVoteShare: estimatedShare,
        confidenceInterval,
        keyFactors: this.identifyKeyFactors(candidate, district),
        recommendation: this.determineRecommendation(estimatedShare),
      });
    }

    return predictions.sort((a, b) => b.estimatedVoteShare - a.estimatedVoteShare);
  }

  analyzeSwingDistricts(
    predictions: ElectoralPrediction[],
    districts: GeographicEntity[]
  ): SwingDistrictAnalysis[] {
    const swingDistricts: SwingDistrictAnalysis[] = [];

    for (const district of districts) {
      const districtPredictions = predictions.filter(p =>
        p.estimatedVoteShare < 0.55 && p.estimatedVoteShare > 0.35
      );

      if (districtPredictions.length >= 2) {
        const sorted = [...districtPredictions].sort((a, b) => b.estimatedVoteShare - a.estimatedVoteShare);
        const top = sorted[0];
        const second = sorted[1];
        const margin = (top.estimatedVoteShare - second.estimatedVoteShare) * 100;

        if (margin < 5) {
          swingDistricts.push({
            districtId: district.id,
            marginDifference: margin,
            leadingCandidate: top.candidateId,
            predictedWinner: top.estimatedVoteShare > 0.5 ? top.candidateId : 'too_close_to_call',
            recommendedStrategy: this.recommendStrategy(margin),
            investmentEstimate: this.estimateInvestment(margin),
          });
        }
      }
    }

    return swingDistricts.sort((a, b) => a.marginDifference - b.marginDifference);
  }

  private calculateBaseSupport(candidate: Candidate, district: GeographicEntity): number {
    const profileScores: Record<string, number> = {
      economic_reformer: 0.25,
      social_defender: 0.25,
      security_strong: 0.20,
      development_focus: 0.20,
      establishment: 0.10,
    };

    const baseSupport = candidate.winRate * 0.4 +
                       (candidate.averageVoteShare / 100) * 0.4 +
                       (profileScores[candidate.props.profileType] || 0.1);

    return Math.min(0.7, Math.max(0.1, baseSupport));
  }

  private calculateTrendFactor(
    candidate: Candidate,
    historicalData: { year: number; winner: string; margin: number }[]
  ): number {
    if (historicalData.length < 2) return 1.0;

    const candidateRaces = historicalData.filter(h => h.winner === candidate.id);
    if (candidateRaces.length < 2) return 1.0;

    const recentMargin = candidateRaces[candidateRaces.length - 1].margin;
    const olderMargin = candidateRaces[candidateRaces.length - 2].margin;

    const trend = (recentMargin - olderMargin) / olderMargin;

    return 1 + (trend * 0.2);
  }

  private calculateDemographicFactor(candidate: Candidate, district: GeographicEntity): number {
    const demographics = district.props.metadata?.demographics as Record<string, number> | undefined;
    if (!demographics) return 1.0;

    const profileFactor: Record<string, number> = {
      economic_reformer: demographics.business_owners || 0.2,
      social_defender: demographics.public_sector_workers || 0.2,
      security_strong: demographics.family_oriented || 0.3,
      development_focus: demographics.young_professionals || 0.25,
      establishment: demographics.traditional_voters || 0.25,
    };

    return 0.9 + ((profileFactor[candidate.props.profileType] || 0.2) * 0.5);
  }

  private calculateConfidenceInterval(
    estimate: number,
    candidateCount: number
  ): { lower: number; upper: number } {
    const uncertainty = 0.05 + (0.02 * (candidateCount - 1));
    return {
      lower: Math.max(0, estimate - uncertainty),
      upper: Math.min(1, estimate + uncertainty),
    };
  }

  private identifyKeyFactors(candidate: Candidate, district: GeographicEntity): string[] {
    const factors: string[] = [];

    if (candidate.winRate > 0.6) {
      factors.push('Alto índice de victorias electorales previas');
    }

    if (candidate.promiseFulfillmentRate !== null && candidate.promiseFulfillmentRate > 0.7) {
      factors.push('Alto cumplimiento de promesas (' + Math.round(candidate.promiseFulfillmentRate * 100) + '%)');
    }

    const topPosition = this.getTopPosition(candidate);
    if (topPosition) {
      factors.push('Fuerte en tema: ' + topPosition.topic);
    }

    return factors;
  }

  private getTopPosition(candidate: Candidate): { topic: string; score: number } | null {
    if (candidate.props.politicalPositions.length === 0) return null;

    return [...candidate.props.politicalPositions]
      .sort((a, b) => Math.abs(b.score) - Math.abs(a.score))[0];
  }

  private determineRecommendation(estimate: number): 'strong_candidate' | 'contender' | 'underdog' {
    if (estimate >= 0.45) return 'strong_candidate';
    if (estimate >= 0.30) return 'contender';
    return 'underdog';
  }

  private recommendStrategy(margin: number): string {
    if (margin < 1) return 'Campaña de alta intensidad, mensajes personalizados';
    if (margin < 3) return 'Enfoque en diferenciación de políticas';
    return 'Defensa de posición, consolidar base';
  }

  private estimateInvestment(margin: number): number {
    const baseInvestment = 1000000;
    const multiplier = margin < 1 ? 2.0 : margin < 3 ? 1.5 : 1.0;
    return Math.round(baseInvestment * multiplier);
  }
}
```

---

## 4. Eventos de Dominio

### 4.1 Catalogo de Eventos

El sistema de eventos de dominio permite que los diferentes componentes de cívicaOS se comuniquen de manera desacoplada a través de eventos que reflejan cambios significativos en el estado del dominio. Cada evento lleva información contextual que permite a los suscriptores tomar decisiones informadas.

```typescript
// src/domain/events/DomainEvents.ts

export type DomainEventType =
  | 'PainPointCreated'
  | 'PainPointEscalated'
  | 'PainPointResolved'
  | 'SimulationStarted'
  | 'SimulationCompleted'
  | 'PredictionGenerated'
  | 'RecommendationCreated'
  | 'OBPExportInitiated'
  | 'OBPExportCompleted'
  | 'AuditLogEntryCreated';

export interface DomainEvent {
  type: DomainEventType;
  occurredOn: Date;
  payload: Record<string, unknown>;
}

export interface PainPointCreatedEvent extends DomainEvent {
  type: 'PainPointCreated';
  payload: {
    painPointId: string;
    category: string;
    entityId: string;
    intensity: number;
  };
}

export interface SimulationCompletedEvent extends DomainEvent {
  type: 'SimulationCompleted';
  payload: {
    simulationId: string;
    outcomes: {
      expectedHappinessGain: number;
      expectedGDPGrowth: number;
      confidenceScore: number;
    };
    duration: number;
  };
}

export interface OBPExportCompletedEvent extends DomainEvent {
  type: 'OBPExportCompleted';
  payload: {
    exportId: string;
    obpProjectId: string;
    success: boolean;
    errorMessage?: string;
  };
}
```

---

## 5. Objetos de Valor

### 5.1 Money (Moneda)

El objeto de valor Money representa cantidades monetarias de manera segura, incluyendo la moneda y evitando problemas de precisión flotante.

```typescript
// src/domain/valueObjects/Money.ts

import { ValueObject } from '../../shared/kernel/ValueObject';

export type Currency = 'MXN' | 'USD' | 'EUR';

export interface MoneyProps {
  amount: number;
  currency: Currency;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  public static create(amount: number, currency: Currency = 'MXN'): Money {
    const roundedAmount = Math.round(amount * 100) / 100;
    return new Money({ amount: roundedAmount, currency });
  }

  public static zero(currency: Currency = 'MXN'): Money {
    return new Money({ amount: 0, currency });
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): Currency {
    return this.props.currency;
  }

  public add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money({
      amount: this.props.amount + other.props.amount,
      currency: this.props.currency,
    });
  }

  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money({
      amount: this.props.amount - other.props.amount,
      currency: this.props.currency,
    });
  }

  public multiply(factor: number): Money {
    return new Money({
      amount: this.props.amount * factor,
      currency: this.props.currency,
    });
  }

  public format(): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: this.props.currency,
    }).format(this.props.amount);
  }

  private ensureSameCurrency(other: Money): void {
    if (this.props.currency !== other.props.currency) {
      throw new Error('Cannot operate on Money with different currencies');
    }
  }
}
```

### 5.2 DateRange (Rango de Fechas)

El objeto de valor DateRange representa un período de tiempo con validación de consistencia.

```typescript
// src/domain/valueObjects/DateRange.ts

import { ValueObject } from '../../shared/kernel/ValueObject';

export interface DateRangeProps {
  startDate: Date;
  endDate: Date;
}

export class DateRange extends ValueObject<DateRangeProps> {
  private constructor(props: DateRangeProps) {
    super(props);
  }

  public static create(startDate: Date, endDate: Date): DateRange {
    if (endDate < startDate) {
      throw new Error('End date must be after start date');
    }
    return new DateRange({ startDate, endDate });
  }

  public static current(): DateRange {
    const now = new Date();
    return new DateRange({
      startDate: new Date(now.getFullYear(), 0, 1),
      endDate: now,
    });
  }

  public static lastNMonths(months: number): DateRange {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    return new DateRange({ startDate: start, endDate: end });
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date {
    return this.props.endDate;
  }

  get durationInDays(): number {
    const diffTime = this.props.endDate.getTime() - this.props.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public contains(date: Date): boolean {
    return date >= this.props.startDate && date <= this.props.endDate;
  }

  public overlaps(other: DateRange): boolean {
    return this.props.startDate <= other.props.endDate && this.props.endDate >= other.props.startDate;
  }
}
```

---

## 6. Mapeo del Gemelo Digital Social a Mega-Escala (GDS-MEGA 1024)

En la evolución de CívicaOS de 2026, el Contexto Delimitado de **Inteligencia Cívica** integra el **Gemelo Digital Social (GDS)** a través de una ontología de **1024 variables** estructurada bajo patrones de DDD y acoplada a través de Value Objects de alta granularidad.

### 6.1 Mapeo de Entidades y Objetos de Valor en GDS-MEGA

El vector de 1024 parámetros del Agente Sintético se organiza bajo los siguientes conceptos del dominio:

*   **SyntheticAgent (Aggregate Root):** El agente que encapsula los vectores de decisión, memoria y preferencias.
*   **GeohashValue (Value Object):** Mapeo espacial de alta precisión (`Geohash-9` residencial y `Geohash-8` de entorno laboral).
*   **EpisodicMemory (Value Object):** Array histórico de eventos de choque (`HIST_UTILITIES` de cortes de luz/agua, `SEG_02` victimización, etc.) con decaimiento temporal.
*   **CognitiveBiasVector (Value Object):** Vector de 8 dimensiones que codifica predisposiciones heurísticas del agente (confirmación, arrastre, etc.).
*   **AlgorithmicExposure (Value Object):** Modulación de consumo en redes digitales (`TikTok`, `WhatsApp`, `X`, `Meta`).

### 6.2 Catálogo de KPIs y Métricas Dinámicas de Dominio

El GDS-MEGA expone un conjunto integrado de KPIs de Dominio para alimentar la interfaz **ThothAgora** y el oráculo predictivo:

1.  **Índice de Felicidad Individual ($H_{i,t}$):**
    *   *Fórmula en Dominio:* $H_{i,t} = \omega_1 \cdot \text{Vulnerabilidad} + \omega_2 \cdot \text{Inflación} + \omega_3 \cdot \text{Servicios} + \omega_4 \cdot \text{Seguridad}$.
    *   *Categoría:* Bienestar Cívico Global.
2.  **Radio de Confianza Dialógica ($\epsilon_{i,t}$):**
    *   *Fórmula en Dominio:* $\epsilon_{i,t} = \epsilon_0 + \alpha \cdot \text{Educación} - \beta \cdot \text{Polarización}$.
    *   *Categoría:* Dinámica de Opinión y Cámaras de Eco.
3.  **Probabilidad Electoral Softmax ($P(V_{i,t} = K)$):**
    *   *Fórmula en Dominio:* Logit Multinomial basado en coincidencia ideológica, felicidad e influencia clientelar.
    *   *Calibración del Algoritmo (2026-05-19):*
        Para evitar probabilidades fuera del rango $[0, 100]\%$ o valores indeterminados ante bonificaciones extremas de campaña (como experiencia o compatibilidad de propuestas), se implementa un modelo Softmax con temperatura $T = 20.0$:
        $$P(V_i) = \frac{e^{S_i / T}}{\sum_{j} e^{S_j / T}}$$
        Donde el score de utilidad del candidato $S_i$ se calcula como:
        $$S_i = \text{felicidad} \cdot 0.2 + \text{afinidad} \cdot 0.3 + \text{experiencia} \cdot 0.2 + \text{proposalMatch} \cdot 0.3$$
    *   *Categoría:* Oráculo Predictivo de Voto.

---

*Documento DDD actualizado con arquitectura GDS-MEGA y calibración Logit Softmax: 2026-05-19*
*Próxima revisión programada: 2026-06-18*