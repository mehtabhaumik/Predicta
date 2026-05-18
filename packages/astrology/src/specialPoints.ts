import type { PlanetPosition } from '@pridicta/types';

export type SpecialPointKind = 'modern' | 'sensitive' | 'upagraha';

export type SpecialPointMetadata = {
  caution: string;
  displayName: string;
  groupLabel: string;
  howToUse: string;
  kind: SpecialPointKind;
  simpleMeaning: string;
};

export const SPECIAL_POINT_METADATA: Record<string, SpecialPointMetadata> = {
  Dhuma: {
    caution: 'Do not judge this alone. Use it to spot where clarity needs extra effort.',
    displayName: 'Dhuma',
    groupLabel: 'Sun-derived sensitive point',
    howToUse:
      'Read it as smoke or pressure around the house, then confirm with classical planets, dasha, and practical facts.',
    kind: 'sensitive',
    simpleMeaning: 'heat, smoke, pressure, obscurity, and hidden friction',
  },
  Gulika: {
    caution: 'Treat this as a maturity signal, not a fear label.',
    displayName: 'Gulika',
    groupLabel: 'Saturn-linked upagraha',
    howToUse:
      'Use it to identify the house where patience, duty, humility, and cleaner choices matter more.',
    kind: 'upagraha',
    simpleMeaning: 'karmic pressure, discipline, difficult residue, and extra maturity',
  },
  Indrachapa: {
    caution: 'Use this only as a supporting refinement.',
    displayName: 'Indrachapa',
    groupLabel: 'Sun-derived sensitive point',
    howToUse:
      'Read it as projection, appearance, or desire that needs grounding through facts and humility.',
    kind: 'sensitive',
    simpleMeaning: 'desire, projection, atmosphere, and misleading appearances',
  },
  Mandi: {
    caution: 'Do not make harsh predictions from Mandi alone.',
    displayName: 'Mandi',
    groupLabel: 'Saturn-linked upagraha',
    howToUse:
      'Use it to identify where delay, heaviness, and humility need careful handling.',
    kind: 'upagraha',
    simpleMeaning: 'karmic heaviness, delay, caution, and humility lessons',
  },
  Neptune: {
    caution: 'Modern outer planets refine the story; they do not replace Jyotish foundations.',
    displayName: 'Neptune',
    groupLabel: 'Modern outer planet',
    howToUse:
      'Use it to understand imagination, devotion, confusion, spiritual longing, and blurred boundaries.',
    kind: 'modern',
    simpleMeaning: 'imagination, devotion, confusion, subtle sensitivity, and spiritual longing',
  },
  Parivesha: {
    caution: 'Use this only as a supporting refinement.',
    displayName: 'Parivesha',
    groupLabel: 'Sun-derived sensitive point',
    howToUse:
      'Read it as enclosure, protection, boundary, or containment around the house it occupies.',
    kind: 'sensitive',
    simpleMeaning: 'enclosure, protection, boundaries, and contained patterns',
  },
  Pluto: {
    caution: 'Modern outer planets refine the story; they do not replace Jyotish foundations.',
    displayName: 'Pluto',
    groupLabel: 'Modern outer planet',
    howToUse:
      'Use it to understand pressure, power, buried intensity, transformation, and rebirth themes.',
    kind: 'modern',
    simpleMeaning: 'deep pressure, power, transformation, buried intensity, and rebirth',
  },
  Upaketu: {
    caution: 'Use this only as a supporting refinement.',
    displayName: 'Upaketu',
    groupLabel: 'Sun-derived sensitive point',
    howToUse:
      'Read it as Ketu-like detachment, simplification, separation, and spiritual correction.',
    kind: 'sensitive',
    simpleMeaning: 'detachment, simplification, separation, and subtle correction',
  },
  Uranus: {
    caution: 'Modern outer planets refine the story; they do not replace Jyotish foundations.',
    displayName: 'Uranus',
    groupLabel: 'Modern outer planet',
    howToUse:
      'Use it to understand sudden change, innovation, disruption, independence, and unusual breaks.',
    kind: 'modern',
    simpleMeaning: 'sudden change, innovation, disruption, independence, and unusual breaks',
  },
  Vyatipata: {
    caution: 'Use this only as a supporting refinement.',
    displayName: 'Vyatipata',
    groupLabel: 'Sun-derived sensitive point',
    howToUse:
      'Read it as reversal, imbalance, or extreme movement that needs moderation.',
    kind: 'sensitive',
    simpleMeaning: 'reversal, imbalance, unexpected turns, and avoiding extremes',
  },
};

export function isSpecialPoint(planet: PlanetPosition): boolean {
  return (
    planet.kind === 'modern' ||
    planet.kind === 'sensitive' ||
    planet.kind === 'upagraha' ||
    SPECIAL_POINT_METADATA[planet.name] !== undefined
  );
}

export function getSpecialPointMetadata(
  planet: PlanetPosition | string,
): SpecialPointMetadata | undefined {
  const name = typeof planet === 'string' ? planet : planet.name;
  return SPECIAL_POINT_METADATA[name];
}

export function getSpecialPointMeaning(planet: PlanetPosition): string {
  return (
    planet.simpleMeaning ??
    getSpecialPointMetadata(planet)?.simpleMeaning ??
    'supporting chart refinement'
  );
}
