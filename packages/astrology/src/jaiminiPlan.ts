import type {
  ChartData,
  JaiminiCalculationStatus,
  JaiminiCharaDashaPeriod,
  JaiminiCharaKaraka,
  JaiminiKarakaRole,
  JaiminiPadaReference,
  JaiminiPlan,
  JaiminiSignAspect,
  JaiminiSoulChartReference,
  KundliData,
  PlanetPosition,
} from '@pridicta/types';
import { buildKarakamshaChart, buildSwamsaChart } from './jaiminiSoulCharts';

const SIGN_ORDER = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const CHARA_KARAKA_ROLES: JaiminiKarakaRole[] = [
  'Atmakaraka',
  'Amatyakaraka',
  'Bhratrikaraka',
  'Matrikaraka',
  'Putrakaraka',
  'Gnatikaraka',
  'Darakaraka',
];

const CLASSICAL_KARAKA_PLANETS = new Set([
  'Moon',
  'Sun',
  'Mars',
  'Jupiter',
  'Venus',
  'Saturn',
  'Mercury',
]);

const SIGN_LORDS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter',
};

const SIGN_DIGNITIES: Record<string, { debilitated: string; exalted: string }> = {
  Jupiter: { debilitated: 'Capricorn', exalted: 'Cancer' },
  Mars: { debilitated: 'Cancer', exalted: 'Capricorn' },
  Mercury: { debilitated: 'Pisces', exalted: 'Virgo' },
  Moon: { debilitated: 'Scorpio', exalted: 'Taurus' },
  Saturn: { debilitated: 'Aries', exalted: 'Libra' },
  Sun: { debilitated: 'Libra', exalted: 'Aries' },
  Venus: { debilitated: 'Virgo', exalted: 'Pisces' },
};

export type ComposeJaiminiPlanOptions = {
  asOfDate?: string;
};

export function composeJaiminiPlan(
  kundli?: KundliData,
  options: ComposeJaiminiPlanOptions = {},
): JaiminiPlan {
  if (!kundli) {
    return buildPendingJaiminiPlan('Create or select a Kundli before Jaimini can calculate its evidence.');
  }

  const evidenceWarnings: string[] = [];
  const charaKarakas = buildCharaKarakas(kundli, evidenceWarnings);
  const atmakaraka = charaKarakas.find(item => item.role === 'Atmakaraka');
  const amatyakaraka = charaKarakas.find(item => item.role === 'Amatyakaraka');
  const darakaraka = charaKarakas.find(item => item.role === 'Darakaraka');
  const swamsa = buildSoulChartReference('Swamsa', buildSwamsaChart(kundli));
  const karakamsha = buildSoulChartReference('Karakamsha', buildKarakamshaChart(kundli));
  const arudhaLagna = buildPadaReference(kundli, 1);
  const upapadaLagna = buildPadaReference(kundli, 12);
  const jaiminiAspects = buildJaiminiSignAspects(kundli);
  const charaDashaTimeline = buildCharaDashaTimeline(kundli, evidenceWarnings);
  const currentCharaDasha = resolveCurrentCharaDasha(
    kundli,
    charaDashaTimeline,
    options.asOfDate,
  );

  if (charaKarakas.length < CHARA_KARAKA_ROLES.length) {
    evidenceWarnings.push('Chara Karaka order is partial because fewer than seven classical grahas were available.');
  }

  if (swamsa.calculationStatus !== 'ready') {
    evidenceWarnings.push('Swamsa is pending because verified Navamsa evidence is not available.');
  }

  if (karakamsha.calculationStatus !== 'ready') {
    evidenceWarnings.push('Karakamsha is pending because Atmakaraka/Navamsa evidence is not available.');
  }

  if (!currentCharaDasha) {
    evidenceWarnings.push('Current Chara Dasha chapter is pending because birth date or timeline evidence is incomplete.');
  }

  const calculationStatus = resolveCalculationStatus({
    arudhaLagna,
    charaDashaTimeline,
    charaKarakas,
    currentCharaDasha,
    karakamsha,
    swamsa,
    upapadaLagna,
  });

  return {
    arudhaLagna,
    atmakaraka,
    amatyakaraka,
    calculationStatus,
    charaDashaTimeline,
    charaKarakas,
    contractVersion: 'jaimini-phase-2-v1',
    currentCharaDasha,
    darakaraka,
    evidenceWarnings: Array.from(new Set(evidenceWarnings)),
    freeInsight: buildFreeInsight({
      arudhaLagna,
      atmakaraka,
      currentCharaDasha,
      darakaraka,
    }),
    jaiminiAspects,
    karakamsha,
    premiumInsight: buildPremiumInsight({
      amatyakaraka,
      arudhaLagna,
      atmakaraka,
      currentCharaDasha,
      darakaraka,
      upapadaLagna,
    }),
    swamsa,
    upapadaLagna,
  };
}

export function buildCharaKarakas(
  kundli: KundliData,
  evidenceWarnings: string[] = [],
): JaiminiCharaKaraka[] {
  const candidates = kundli.planets
    .filter(planet => CLASSICAL_KARAKA_PLANETS.has(planet.name))
    .sort((first, second) => {
      const degreeDifference = second.degree - first.degree;
      if (Math.abs(degreeDifference) > 0.0001) {
        return degreeDifference;
      }

      evidenceWarnings.push(
        `Chara Karaka tie detected near ${first.degree.toFixed(2)} degrees for ${first.name} and ${second.name}; absolute longitude was used only as a deterministic tie-breaker.`,
      );
      return second.absoluteLongitude - first.absoluteLongitude;
    });

  return candidates.slice(0, CHARA_KARAKA_ROLES.length).map((planet, index) =>
    buildKaraka(planet, CHARA_KARAKA_ROLES[index] ?? 'Darakaraka'),
  );
}

export function buildJaiminiSignAspects(kundli: KundliData): JaiminiSignAspect[] {
  return SIGN_ORDER.map(sign => {
    const aspectedSigns = resolveJaiminiAspectedSigns(sign);
    return {
      aspectedPlanets: aspectedSigns.flatMap(aspectedSign =>
        planetsInSign(kundli, aspectedSign).map(planet => planet.name),
      ),
      aspectedSigns,
      fromSign: sign,
      planetsInSign: planetsInSign(kundli, sign).map(planet => planet.name),
      signNature: getSignNature(sign),
    };
  });
}

export function buildCharaDashaTimeline(
  kundli: KundliData,
  evidenceWarnings: string[] = [],
): JaiminiCharaDashaPeriod[] {
  const lagnaIndex = signIndex(kundli.lagna);
  if (lagnaIndex < 0) {
    evidenceWarnings.push('Chara Dasha timeline is pending because Lagna sign is not recognized.');
    return [];
  }

  let startAge = 0;
  return Array.from({ length: 12 }, (_, offset) => {
    const sign = SIGN_ORDER[(lagnaIndex + offset) % 12] ?? kundli.lagna;
    const signLord = SIGN_LORDS[sign] ?? 'Unknown';
    const years = resolveCharaDashaYears(kundli, sign, evidenceWarnings);
    const period: JaiminiCharaDashaPeriod = {
      calculationRule:
        'Phase 2 baseline Chara Dasha: Lagna-sign sequence with sign-lord distance years; later variant audits may refine sub-periods.',
      endAge: roundAge(startAge + years),
      evidence: [
        `Dasha sign: ${sign}.`,
        `Sign lord: ${signLord}.`,
        `Years assigned from sign-lord distance: ${years}.`,
      ],
      order: offset + 1,
      sign,
      signLord,
      startAge: roundAge(startAge),
      years,
    };
    startAge += years;
    return period;
  });
}

function buildPendingJaiminiPlan(reason: string): JaiminiPlan {
  const pendingPada = (sourceHouse: number): JaiminiPadaReference => ({
    calculationStatus: 'pending',
    evidence: [reason],
    rule: 'Pending until a Kundli is available.',
    sourceHouse,
  });

  const pendingChart = (source: string): JaiminiSoulChartReference => ({
    calculationStatus: 'pending',
    evidence: [reason],
    source,
  });

  return {
    arudhaLagna: pendingPada(1),
    calculationStatus: 'pending',
    charaDashaTimeline: [],
    charaKarakas: [],
    contractVersion: 'jaimini-phase-2-v1',
    evidenceWarnings: [reason],
    freeInsight: 'Jaimini calculation is pending until a Kundli is available.',
    jaiminiAspects: [],
    karakamsha: pendingChart('Karakamsha requires Atmakaraka and Navamsa evidence.'),
    premiumInsight: 'Premium Jaimini depth unlocks only after the deterministic Jaimini contract is ready.',
    swamsa: pendingChart('Swamsa requires Navamsa evidence.'),
    upapadaLagna: pendingPada(12),
  };
}

function buildKaraka(
  planet: PlanetPosition,
  role: JaiminiKarakaRole,
): JaiminiCharaKaraka {
  return {
    absoluteLongitude: planet.absoluteLongitude,
    chartContext: `${planet.name} in ${planet.sign}, house ${planet.house}, ${planet.degree.toFixed(2)} degrees.`,
    degree: roundDegree(planet.degree),
    dignity: getDignity(planet),
    house: planet.house,
    nakshatra: planet.nakshatra,
    pada: planet.pada,
    planet: planet.name,
    retrograde: planet.retrograde,
    role,
    sign: planet.sign,
  };
}

function buildSoulChartReference(
  source: string,
  chart: ChartData | undefined,
): JaiminiSoulChartReference {
  if (!chart?.supported || !chart.ascendantSign) {
    return {
      calculationStatus: 'pending',
      evidence: [`${source} needs verified Navamsa chart evidence.`],
      source,
    };
  }

  return {
    ascendantSign: chart.ascendantSign,
    calculationStatus: 'ready',
    chart,
    evidence: [
      `${source} ascendant reference: ${chart.ascendantSign}.`,
      `${source} uses ${chart.planetDistribution.length} Navamsa planet placements.`,
    ],
    source,
  };
}

function buildPadaReference(kundli: KundliData, sourceHouse: number): JaiminiPadaReference {
  const house = kundli.houses.find(item => item.house === sourceHouse);
  const sourceSign = house?.sign;
  const sourceLord = house?.lord ?? (sourceSign ? SIGN_LORDS[sourceSign] : undefined);
  const lordPlanet = sourceLord ? findPlanet(kundli, sourceLord) : undefined;

  if (!house || !sourceSign || !sourceLord || !lordPlanet) {
    return {
      calculationStatus: 'pending',
      evidence: [`House ${sourceHouse} sign/lord evidence is incomplete.`],
      rule: 'Pada requires source house sign, source lord, and source-lord house.',
      sourceHouse,
      sourceLord,
      sourceSign,
    };
  }

  const distance = houseDistance(sourceHouse, lordPlanet.house);
  let padaHouse = normalizeHouse(lordPlanet.house + distance);
  const seventhFromSource = normalizeHouse(sourceHouse + 6);

  if (padaHouse === sourceHouse || padaHouse === seventhFromSource) {
    padaHouse = normalizeHouse(lordPlanet.house + 9);
  }

  const padaSign = kundli.houses.find(item => item.house === padaHouse)?.sign ??
    SIGN_ORDER[(signIndex(kundli.lagna) + padaHouse - 1) % 12];

  return {
    calculationStatus: padaSign ? 'ready' : 'partial',
    evidence: [
      `Source house ${sourceHouse}: ${sourceSign}.`,
      `${sourceSign} lord ${sourceLord} occupies house ${lordPlanet.house}, ${lordPlanet.sign}.`,
      `Pada resolves to house ${padaHouse}${padaSign ? `, ${padaSign}` : ''}.`,
    ],
    padaHouse,
    padaSign,
    rule:
      'Pada formula: count from source house to its lord, count the same distance from the lord; if the result repeats the source or seventh, use tenth from the lord.',
    sourceHouse,
    sourceLord,
    sourceSign,
  };
}

function resolveJaiminiAspectedSigns(sign: string): string[] {
  const nature = getSignNature(sign);
  const index = signIndex(sign);

  if (index < 0) {
    return [];
  }

  if (nature === 'dual') {
    return SIGN_ORDER.filter(candidate => getSignNature(candidate) === 'dual' && candidate !== sign);
  }

  if (nature === 'movable') {
    const adjacentFixed = SIGN_ORDER[(index + 1) % 12];
    return SIGN_ORDER.filter(
      candidate => getSignNature(candidate) === 'fixed' && candidate !== adjacentFixed,
    );
  }

  const adjacentMovable = SIGN_ORDER[(index + 11) % 12];
  return SIGN_ORDER.filter(
    candidate => getSignNature(candidate) === 'movable' && candidate !== adjacentMovable,
  );
}

function resolveCharaDashaYears(
  kundli: KundliData,
  sign: string,
  evidenceWarnings: string[],
): number {
  const signLord = SIGN_LORDS[sign];
  const signLordPlanet = signLord ? findPlanet(kundli, signLord) : undefined;
  const fromIndex = signIndex(sign);
  const toIndex = signLordPlanet ? signIndex(signLordPlanet.sign) : -1;

  if (!signLord || !signLordPlanet || fromIndex < 0 || toIndex < 0) {
    evidenceWarnings.push(`Chara Dasha years for ${sign} used fallback because sign-lord evidence is incomplete.`);
    return 7;
  }

  const distance = (toIndex - fromIndex + 12) % 12;
  return distance === 0 ? 12 : distance;
}

function resolveCurrentCharaDasha(
  kundli: KundliData,
  timeline: JaiminiCharaDashaPeriod[],
  asOfDate?: string,
): JaiminiCharaDashaPeriod | undefined {
  const age = calculateAge(kundli.birthDetails.date, asOfDate ?? new Date().toISOString().slice(0, 10));
  if (age === undefined) {
    return undefined;
  }

  return timeline.find(period => age >= period.startAge && age < period.endAge) ??
    timeline[timeline.length - 1];
}

function calculateAge(birthDate: string, asOfDate: string): number | undefined {
  const birth = new Date(`${birthDate}T00:00:00Z`);
  const asOf = new Date(`${asOfDate}T00:00:00Z`);

  if (Number.isNaN(birth.getTime()) || Number.isNaN(asOf.getTime()) || asOf < birth) {
    return undefined;
  }

  const yearMs = 365.2425 * 24 * 60 * 60 * 1000;
  return (asOf.getTime() - birth.getTime()) / yearMs;
}

function resolveCalculationStatus({
  arudhaLagna,
  charaDashaTimeline,
  charaKarakas,
  currentCharaDasha,
  karakamsha,
  swamsa,
  upapadaLagna,
}: {
  arudhaLagna: JaiminiPadaReference;
  charaDashaTimeline: JaiminiCharaDashaPeriod[];
  charaKarakas: JaiminiCharaKaraka[];
  currentCharaDasha?: JaiminiCharaDashaPeriod;
  karakamsha: JaiminiSoulChartReference;
  swamsa: JaiminiSoulChartReference;
  upapadaLagna: JaiminiPadaReference;
}): JaiminiCalculationStatus {
  if (!charaKarakas.length) {
    return 'pending';
  }

  const allReady =
    charaKarakas.length === CHARA_KARAKA_ROLES.length &&
    arudhaLagna.calculationStatus === 'ready' &&
    upapadaLagna.calculationStatus === 'ready' &&
    swamsa.calculationStatus === 'ready' &&
    karakamsha.calculationStatus === 'ready' &&
    charaDashaTimeline.length === 12 &&
    Boolean(currentCharaDasha);

  return allReady ? 'ready' : 'partial';
}

function buildFreeInsight({
  arudhaLagna,
  atmakaraka,
  currentCharaDasha,
  darakaraka,
}: {
  arudhaLagna: JaiminiPadaReference;
  atmakaraka?: JaiminiCharaKaraka;
  currentCharaDasha?: JaiminiCharaDashaPeriod;
  darakaraka?: JaiminiCharaKaraka;
}): string {
  if (!atmakaraka) {
    return 'Jaimini is pending because the Chara Karaka order is not complete.';
  }

  return [
    `${atmakaraka.planet} is the Atmakaraka, anchoring the soul-role evidence in ${atmakaraka.sign}.`,
    arudhaLagna.padaSign
      ? `Arudha Lagna points the visible identity lens toward ${arudhaLagna.padaSign}.`
      : 'Arudha Lagna is pending.',
    darakaraka
      ? `${darakaraka.planet} is the Darakaraka, so relationship mirror evidence is available.`
      : 'Darakaraka is pending.',
    currentCharaDasha
      ? `The current baseline Chara Dasha chapter is ${currentCharaDasha.sign}.`
      : 'Current Chara Dasha is pending.',
  ].join(' ');
}

function buildPremiumInsight({
  amatyakaraka,
  arudhaLagna,
  atmakaraka,
  currentCharaDasha,
  darakaraka,
  upapadaLagna,
}: {
  amatyakaraka?: JaiminiCharaKaraka;
  arudhaLagna: JaiminiPadaReference;
  atmakaraka?: JaiminiCharaKaraka;
  currentCharaDasha?: JaiminiCharaDashaPeriod;
  darakaraka?: JaiminiCharaKaraka;
  upapadaLagna: JaiminiPadaReference;
}): string {
  const parts = [
    atmakaraka
      ? `Premium Jaimini can read ${atmakaraka.planet} Atmakaraka through house ${atmakaraka.house}, ${atmakaraka.sign}, ${atmakaraka.nakshatra} pada ${atmakaraka.pada}.`
      : 'Premium Jaimini waits for Atmakaraka evidence.',
    amatyakaraka
      ? `${amatyakaraka.planet} Amatyakaraka supplies career-direction evidence.`
      : 'Amatyakaraka is pending.',
    darakaraka
      ? `${darakaraka.planet} Darakaraka supplies relationship-mirror evidence.`
      : 'Darakaraka is pending.',
    arudhaLagna.padaSign
      ? `Arudha Lagna ${arudhaLagna.padaSign} and Upapada ${upapadaLagna.padaSign ?? 'pending'} frame visibility and partnership evidence.`
      : 'Arudha/Upapada evidence is pending.',
    currentCharaDasha
      ? `Current Chara Dasha evidence starts from ${currentCharaDasha.sign}, age ${currentCharaDasha.startAge}-${currentCharaDasha.endAge}.`
      : 'Current Chara Dasha is pending.',
  ];

  return parts.join(' ');
}

function getDignity(planet: PlanetPosition): 'debilitated' | 'exalted' | 'neutral' {
  const dignity = SIGN_DIGNITIES[planet.name];
  if (dignity?.exalted === planet.sign) {
    return 'exalted';
  }

  if (dignity?.debilitated === planet.sign) {
    return 'debilitated';
  }

  return 'neutral';
}

function getSignNature(sign: string): 'dual' | 'fixed' | 'movable' {
  if (['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(sign)) {
    return 'movable';
  }

  if (['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(sign)) {
    return 'fixed';
  }

  return 'dual';
}

function planetsInSign(kundli: KundliData, sign: string): PlanetPosition[] {
  return kundli.planets.filter(planet => planet.sign === sign);
}

function findPlanet(kundli: KundliData, planetName: string): PlanetPosition | undefined {
  return kundli.planets.find(planet => planet.name === planetName);
}

function houseDistance(fromHouse: number, toHouse: number): number {
  return (toHouse - fromHouse + 12) % 12;
}

function normalizeHouse(house: number): number {
  return ((house - 1 + 12) % 12) + 1;
}

function signIndex(sign: string): number {
  return SIGN_ORDER.indexOf(sign);
}

function roundAge(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundDegree(value: number): number {
  return Math.round(value * 100) / 100;
}
