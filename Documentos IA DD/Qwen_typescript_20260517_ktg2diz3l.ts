// src/domain/entities/civic.ts (DDD: Aggregate Root)
import { z } from 'zod';

export const DistrictSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2),
  state: z.enum(['sonora', 'jalisco', 'cdmx', /* ... */]),
  population: z.number().int().positive(),
  socioeconomicIndex: z.number().min(0).max(100),
  painPoints: z.array(z.object({
    category: z.enum(['security', 'water', 'economy', 'transport', 'health']),
    intensity: z.number().min(0).max(1),
    geoCoordinates: z.tuple([z.number(), z.number()]) // [lat, lng]
  })),
  historicalResults: z.array(z.object({
    electionYear: z.number(),
    winnerParty: z.string(),
    voteShare: z.number().min(0).max(1),
    turnout: z.number().min(0).max(1)
  }))
});
export type District = z.infer<typeof DistrictSchema>;

export const CandidateProfileSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  party: z.string(),
  demographic: z.object({
    age: z.number().int(),
    gender: z.enum(['M', 'F', 'NB']),
    educationLevel: z.enum(['highschool', 'bachelor', 'master', 'phd'])
  }),
  experience: z.object({
    publicSectorYears: z.number().int().min(0),
    privateSectorYears: z.number().int().min(0),
    priorElectedRoles: z.array(z.string())
  }),
  proposalThemes: z.record(z.number()), // { "security": 0.8, "economy": 0.3, ... }
  sentimentScore: z.number().min(-1).max(1)
});
export type CandidateProfile = z.infer<typeof CandidateProfileSchema>;