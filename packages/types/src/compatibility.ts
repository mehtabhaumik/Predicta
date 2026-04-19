import type { CalculationMeta, KundliData } from './astrology';

export type CompatibilityDepth = 'FREE' | 'FULL';

export type CompatibilityInput = {
  primaryKundli: KundliData;
  partnerKundli: KundliData;
  generatedAt?: string;
  hasFullAccess: boolean;
};

export type CompatibilityPartnerSummary = {
  kundliId: string;
  name: string;
  lagna: string;
  moonSign: string;
  nakshatra: string;
  currentDasha: string;
};

export type CompatibilityKootaScore = {
  name: string;
  score?: number;
  maxScore: number;
  available: boolean;
  note: string;
};

export type AshtakootaSummary = {
  available: boolean;
  totalScore?: number;
  maxScore: 36;
  kootas: CompatibilityKootaScore[];
  unavailableReason?: string;
};

export type CompatibilitySection = {
  title: string;
  summary: string;
  indicators: string[];
};

export type CompatibilityReport = {
  id: string;
  pairKey: string;
  cacheKey: string;
  depth: CompatibilityDepth;
  generatedAt: string;
  primary: CompatibilityPartnerSummary;
  partner: CompatibilityPartnerSummary;
  summary: string;
  ashtakoota: AshtakootaSummary;
  emotionalCompatibility: CompatibilitySection;
  communicationPattern: CompatibilitySection;
  familyLifeIndicators: CompatibilitySection;
  timingConsiderations: CompatibilitySection;
  cautionAreas: CompatibilitySection;
  practicalGuidance: CompatibilitySection;
  premiumSectionsLocked: boolean;
  calculationMeta: {
    primary: Pick<CalculationMeta, 'inputHash' | 'ayanamsa' | 'houseSystem'>;
    partner: Pick<CalculationMeta, 'inputHash' | 'ayanamsa' | 'houseSystem'>;
  };
};

export type CompatibilityAccess = {
  canViewFullReport: boolean;
  depth: CompatibilityDepth;
  message: string;
};
