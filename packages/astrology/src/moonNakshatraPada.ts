import type { ChartData, KundliData, PlanetPosition } from '@pridicta/types';
import type { ChartRenderMoonPhase } from './chartLayout';

export type MoonNakshatraPadaInsight = {
  evidence: string[];
  moonNakshatra?: string;
  moonPhase: ChartRenderMoonPhase;
  moonPhaseLabel: string;
  moonPhaseMeaning: string;
  moonSign?: string;
  pada?: number;
  padaMeaning?: string;
  summary: string;
};

export const PADA_MEANINGS: Record<number, string> = {
  1: 'Pada 1 begins the star energy. It usually shows instinct, initiative, and the first push of that Nakshatra.',
  2: 'Pada 2 makes the star more practical. It often shows resources, stability, habits, and material handling.',
  3: 'Pada 3 makes the star more expressive. It often shows communication, learning, adjustment, and relationships.',
  4: 'Pada 4 completes the star energy. It often shows emotion, depth, inner processing, and the final expression of the Nakshatra.',
};

export const MOON_PHASE_MEANINGS: Record<
  Exclude<ChartRenderMoonPhase, 'unknown'>,
  { label: string; meaning: string }
> = {
  dark: {
    label: 'Dark Moon',
    meaning:
      'The Moon is close to Amavasya. In simple words, the mind may work more privately and needs quiet renewal.',
  },
  full: {
    label: 'Full Moon',
    meaning:
      'The Moon is close to full brightness. In simple words, feelings and visibility can become stronger.',
  },
  waning: {
    label: 'Waning Moon',
    meaning:
      'The Moon light is decreasing. In simple words, the mind may process, release, and simplify.',
  },
  waxing: {
    label: 'Waxing Moon',
    meaning:
      'The Moon light is increasing. In simple words, the mind may build, respond, and move outward.',
  },
};

export function getMoonPhaseLabel(phase: ChartRenderMoonPhase): string {
  return phase === 'unknown' ? 'Moon phase pending' : MOON_PHASE_MEANINGS[phase].label;
}

export function getMoonPhaseMeaning(phase: ChartRenderMoonPhase): string {
  return phase === 'unknown'
    ? 'Moon phase needs both Sun and Moon positions.'
    : MOON_PHASE_MEANINGS[phase].meaning;
}

export function getPadaMeaning(pada?: number): string | undefined {
  return pada ? PADA_MEANINGS[pada] : undefined;
}

export function buildChartMoonNakshatraPadaInsight(
  chart: ChartData,
  moonPhase: ChartRenderMoonPhase = getMoonPhaseFromPlanets(chart.planetDistribution),
): MoonNakshatraPadaInsight | undefined {
  const moon = findMoon(chart.planetDistribution);
  if (!moon) {
    return undefined;
  }

  return buildMoonNakshatraPadaInsight({
    moon,
    moonPhase,
  });
}

export function buildKundliMoonNakshatraPadaInsight(
  kundli: KundliData,
): MoonNakshatraPadaInsight {
  const moon = findMoon(kundli.planets);
  const chart = kundli.charts.D1;
  const phase = chart ? getMoonPhaseFromPlanets(chart.planetDistribution) : 'unknown';

  return buildMoonNakshatraPadaInsight({
    fallbackNakshatra: kundli.nakshatra,
    fallbackSign: kundli.moonSign,
    moon,
    moonPhase: phase,
  });
}

function buildMoonNakshatraPadaInsight({
  fallbackNakshatra,
  fallbackSign,
  moon,
  moonPhase,
}: {
  fallbackNakshatra?: string;
  fallbackSign?: string;
  moon?: PlanetPosition;
  moonPhase: ChartRenderMoonPhase;
}): MoonNakshatraPadaInsight {
  const moonNakshatra = moon?.nakshatra ?? fallbackNakshatra;
  const moonSign = moon?.sign ?? fallbackSign;
  const pada = moon?.pada;
  const phaseLabel = getMoonPhaseLabel(moonPhase);
  const padaMeaning = getPadaMeaning(pada);
  const birthStar = moonNakshatra
    ? `${moonNakshatra}${pada ? ` pada ${pada}` : ''}`
    : 'birth star pending';

  return {
    evidence: [
      moonSign ? `Moon sign: ${moonSign}` : 'Moon sign pending',
      moonNakshatra ? `Birth star: ${birthStar}` : 'Birth star pending',
      `Moon phase: ${phaseLabel}`,
      ...(padaMeaning ? [padaMeaning] : []),
    ],
    moonNakshatra,
    moonPhase,
    moonPhaseLabel: phaseLabel,
    moonPhaseMeaning: getMoonPhaseMeaning(moonPhase),
    moonSign,
    pada,
    padaMeaning,
    summary: `${phaseLabel} with ${birthStar}. ${padaMeaning ?? getMoonPhaseMeaning(moonPhase)}`,
  };
}

function findMoon(planets: PlanetPosition[]): PlanetPosition | undefined {
  return planets.find(planet => planet.name === 'Moon');
}

function getMoonPhaseFromPlanets(planets: PlanetPosition[]): ChartRenderMoonPhase {
  const moon = planets.find(planet => planet.name === 'Moon');
  const sun = planets.find(planet => planet.name === 'Sun');

  if (!moon || !sun) {
    return 'unknown';
  }

  const separation =
    (moon.absoluteLongitude - sun.absoluteLongitude + 360) % 360;

  if (separation <= 12 || separation >= 348) {
    return 'dark';
  }

  if (separation >= 168 && separation <= 192) {
    return 'full';
  }

  return separation > 0 && separation < 180 ? 'waxing' : 'waning';
}
