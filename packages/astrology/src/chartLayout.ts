import type {
  BirthDetails,
  ChartData,
  KundliData,
  PlanetPosition,
  SupportedLanguage,
} from '@pridicta/types';
import type { MoonNakshatraPadaInsight } from './moonNakshatraPada';
import { buildChartMoonNakshatraPadaInsight, getPadaMeaning } from './moonNakshatraPada';
import { isSpecialPoint } from './specialPoints';

export type ChartRenderSchool = 'KP' | 'NADI' | 'PARASHARI';

export type ChartRenderMoonPhase = 'dark' | 'full' | 'unknown' | 'waning' | 'waxing';

export type ChartRenderPlanetStatus = {
  combust: boolean;
  debilitated: boolean;
  exalted: boolean;
  retrograde: boolean;
};

export type ChartRenderPlanet = {
  abbreviation: string;
  degreeLabel: string;
  displayAbbreviation: string;
  displayLabel: string;
  displayName: string;
  displaySign: string;
  key: string;
  label: string;
  name: string;
  nakshatra: string;
  pada: number;
  padaMeaning?: string;
  position: PlanetPosition;
  sign: string;
  status: ChartRenderPlanetStatus;
};

export type ChartCell = {
  displaySign: string;
  displaySignShort: string;
  key: string;
  sign: string;
  signGlyph: string;
  signNumber: number;
  signShort: string;
  house?: number;
  planets: string[];
  planetPositions: PlanetPosition[];
  row: number;
  col: number;
  x: number;
  y: number;
};

export type ChartRenderCell = ChartCell & {
  ariaLabel: string;
  hasManyPlanets: boolean;
  hiddenPlanetCount: number;
  labelDensity: 'compact' | 'normal' | 'stacked';
  maxVisiblePlanets: number;
  planetGlyphSize: 'compact' | 'full';
  showPlanetDegrees: boolean;
  showPlanetSign: boolean;
  showPlanetStatusMarks: boolean;
  renderPlanets: ChartRenderPlanet[];
  supportingPoints: PlanetPosition[];
};

export type ChartRenderLegendItem = {
  code: string;
  description: string;
  tone: 'caution' | 'neutral' | 'support';
};

export type ChartRenderTheme =
  | 'afternoon'
  | 'morning'
  | 'night'
  | 'sunrise'
  | 'sunset'
  | 'unknown';

export type ChartRenderPresentation =
  | 'charts'
  | 'chat'
  | 'creation'
  | 'full'
  | 'landing'
  | 'library'
  | 'main'
  | 'report';

export type ChartRenderModel = {
  cells: ChartRenderCell[];
  chartName: string;
  displayChartName: string;
  chartType: ChartData['chartType'];
  geometry: 'north-indian';
  language: SupportedLanguage;
  legend: ChartRenderLegendItem[];
  moonPhase: ChartRenderMoonPhase;
  moonNakshatraPada?: MoonNakshatraPadaInsight;
  presentation: ChartRenderPresentation;
  school: ChartRenderSchool;
  theme: ChartRenderTheme;
};

export type BuildChartRenderModelOptions = {
  birthDetails?: BirthDetails;
  chart: ChartData;
  language?: SupportedLanguage;
  presentation?: ChartRenderPresentation;
  school?: ChartRenderSchool;
};

const SIGNS = [
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
] as const;

const SIGN_SHORT: Record<string, string> = {
  Aries: 'Ari',
  Taurus: 'Tau',
  Gemini: 'Gem',
  Cancer: 'Can',
  Leo: 'Leo',
  Virgo: 'Vir',
  Libra: 'Lib',
  Scorpio: 'Sco',
  Sagittarius: 'Sag',
  Capricorn: 'Cap',
  Aquarius: 'Aqu',
  Pisces: 'Pis',
};

const SIGN_TRANSLATIONS: Record<
  string,
  Record<SupportedLanguage, { name: string; short: string }>
> = {
  Aries: {
    en: { name: 'Aries', short: 'Ari' },
    gu: { name: 'મેષ', short: 'મેષ' },
    hi: { name: 'मेष', short: 'मेष' },
  },
  Taurus: {
    en: { name: 'Taurus', short: 'Tau' },
    gu: { name: 'વૃષભ', short: 'વૃષ' },
    hi: { name: 'वृषभ', short: 'वृष' },
  },
  Gemini: {
    en: { name: 'Gemini', short: 'Gem' },
    gu: { name: 'મિથુન', short: 'મિથુ' },
    hi: { name: 'मिथुन', short: 'मिथु' },
  },
  Cancer: {
    en: { name: 'Cancer', short: 'Can' },
    gu: { name: 'કર્ક', short: 'કર્ક' },
    hi: { name: 'कर्क', short: 'कर्क' },
  },
  Leo: {
    en: { name: 'Leo', short: 'Leo' },
    gu: { name: 'સિંહ', short: 'સિંહ' },
    hi: { name: 'सिंह', short: 'सिंह' },
  },
  Virgo: {
    en: { name: 'Virgo', short: 'Vir' },
    gu: { name: 'કન્યા', short: 'કન્યા' },
    hi: { name: 'कन्या', short: 'कन्या' },
  },
  Libra: {
    en: { name: 'Libra', short: 'Lib' },
    gu: { name: 'તુલા', short: 'તુલા' },
    hi: { name: 'तुला', short: 'तुला' },
  },
  Scorpio: {
    en: { name: 'Scorpio', short: 'Sco' },
    gu: { name: 'વૃશ્ચિક', short: 'વૃશ્ચિ' },
    hi: { name: 'वृश्चिक', short: 'वृश्चि' },
  },
  Sagittarius: {
    en: { name: 'Sagittarius', short: 'Sag' },
    gu: { name: 'ધનુ', short: 'ધનુ' },
    hi: { name: 'धनु', short: 'धनु' },
  },
  Capricorn: {
    en: { name: 'Capricorn', short: 'Cap' },
    gu: { name: 'મકર', short: 'મકર' },
    hi: { name: 'मकर', short: 'मकर' },
  },
  Aquarius: {
    en: { name: 'Aquarius', short: 'Aqu' },
    gu: { name: 'કુંભ', short: 'કુંભ' },
    hi: { name: 'कुंभ', short: 'कुंभ' },
  },
  Pisces: {
    en: { name: 'Pisces', short: 'Pis' },
    gu: { name: 'મીન', short: 'મીન' },
    hi: { name: 'मीन', short: 'मीन' },
  },
};

const PLANET_TRANSLATIONS: Record<
  string,
  Record<SupportedLanguage, { abbreviation: string; name: string }>
> = {
  Dhuma: {
    en: { abbreviation: 'Dh', name: 'Dhuma' },
    gu: { abbreviation: 'ધૂ', name: 'ધૂમ' },
    hi: { abbreviation: 'धू', name: 'धूम' },
  },
  Gulika: {
    en: { abbreviation: 'Gu', name: 'Gulika' },
    gu: { abbreviation: 'ગુ', name: 'ગુલિક' },
    hi: { abbreviation: 'गु', name: 'गुलिक' },
  },
  Indrachapa: {
    en: { abbreviation: 'In', name: 'Indrachapa' },
    gu: { abbreviation: 'ઇ', name: 'ઇન્દ્રચાપ' },
    hi: { abbreviation: 'इ', name: 'इन्द्रचाप' },
  },
  Jupiter: {
    en: { abbreviation: 'Ju', name: 'Jupiter' },
    gu: { abbreviation: 'ગુ', name: 'ગુરુ' },
    hi: { abbreviation: 'बृ', name: 'बृहस्पति' },
  },
  Ketu: {
    en: { abbreviation: 'Ke', name: 'Ketu' },
    gu: { abbreviation: 'કે', name: 'કેતુ' },
    hi: { abbreviation: 'के', name: 'केतु' },
  },
  Mandi: {
    en: { abbreviation: 'Mn', name: 'Mandi' },
    gu: { abbreviation: 'મા', name: 'માંડી' },
    hi: { abbreviation: 'मा', name: 'मांडी' },
  },
  Mars: {
    en: { abbreviation: 'Ma', name: 'Mars' },
    gu: { abbreviation: 'મં', name: 'મંગળ' },
    hi: { abbreviation: 'मं', name: 'मंगल' },
  },
  Mercury: {
    en: { abbreviation: 'Me', name: 'Mercury' },
    gu: { abbreviation: 'બુ', name: 'બુધ' },
    hi: { abbreviation: 'बु', name: 'बुध' },
  },
  Moon: {
    en: { abbreviation: 'Mo', name: 'Moon' },
    gu: { abbreviation: 'ચં', name: 'ચંદ્ર' },
    hi: { abbreviation: 'चं', name: 'चंद्र' },
  },
  Neptune: {
    en: { abbreviation: 'Ne', name: 'Neptune' },
    gu: { abbreviation: 'ને', name: 'નેપ્ચ્યુન' },
    hi: { abbreviation: 'ने', name: 'नेपच्यून' },
  },
  Parivesha: {
    en: { abbreviation: 'Pa', name: 'Parivesha' },
    gu: { abbreviation: 'પ', name: 'પરિવેષ' },
    hi: { abbreviation: 'प', name: 'परिवेष' },
  },
  Pluto: {
    en: { abbreviation: 'Pl', name: 'Pluto' },
    gu: { abbreviation: 'પ્લૂ', name: 'પ્લૂટો' },
    hi: { abbreviation: 'प्लू', name: 'प्लूटो' },
  },
  Rahu: {
    en: { abbreviation: 'Ra', name: 'Rahu' },
    gu: { abbreviation: 'રા', name: 'રાહુ' },
    hi: { abbreviation: 'रा', name: 'राहु' },
  },
  Saturn: {
    en: { abbreviation: 'Sa', name: 'Saturn' },
    gu: { abbreviation: 'શ', name: 'શનિ' },
    hi: { abbreviation: 'श', name: 'शनि' },
  },
  Sun: {
    en: { abbreviation: 'Su', name: 'Sun' },
    gu: { abbreviation: 'સૂ', name: 'સૂર્ય' },
    hi: { abbreviation: 'सू', name: 'सूर्य' },
  },
  Upaketu: {
    en: { abbreviation: 'Uk', name: 'Upaketu' },
    gu: { abbreviation: 'ઉ', name: 'ઉપકેતુ' },
    hi: { abbreviation: 'उ', name: 'उपकेतु' },
  },
  Uranus: {
    en: { abbreviation: 'Ur', name: 'Uranus' },
    gu: { abbreviation: 'યુ', name: 'યુરેનસ' },
    hi: { abbreviation: 'यू', name: 'यूरेनस' },
  },
  Venus: {
    en: { abbreviation: 'Ve', name: 'Venus' },
    gu: { abbreviation: 'શુ', name: 'શુક્ર' },
    hi: { abbreviation: 'शु', name: 'शुक्र' },
  },
  Vyatipata: {
    en: { abbreviation: 'Vy', name: 'Vyatipata' },
    gu: { abbreviation: 'વ્ય', name: 'વ્યતીપાત' },
    hi: { abbreviation: 'व्य', name: 'व्यतीपात' },
  },
};

const SIGN_GLYPHS: Record<string, string> = {
  Aries: '♈',
  Taurus: '♉',
  Gemini: '♊',
  Cancer: '♋',
  Leo: '♌',
  Virgo: '♍',
  Libra: '♎',
  Scorpio: '♏',
  Sagittarius: '♐',
  Capricorn: '♑',
  Aquarius: '♒',
  Pisces: '♓',
};

type ChartSurfacePreset = {
  compactHouses: number[];
  labelDensityThresholds: {
    compact: number;
    stacked: number;
  };
  maxVisiblePlanets: number;
  planetGlyphSize: 'compact' | 'full';
  showPlanetDegrees: boolean;
  showPlanetSign: boolean;
  showPlanetStatusMarks: boolean;
};

const CHART_SURFACE_PRESETS: Record<ChartRenderPresentation, ChartSurfacePreset> = {
  charts: {
    compactHouses: [2, 3, 5, 6, 8, 9, 11, 12],
    labelDensityThresholds: {
      compact: 2,
      stacked: 4,
    },
    maxVisiblePlanets: 7,
    planetGlyphSize: 'full',
    showPlanetDegrees: true,
    showPlanetSign: false,
    showPlanetStatusMarks: true,
  },
  chat: {
    compactHouses: [2, 3, 4, 5, 6, 8, 9, 10, 11, 12],
    labelDensityThresholds: {
      compact: 1,
      stacked: 2,
    },
    maxVisiblePlanets: 1,
    planetGlyphSize: 'compact',
    showPlanetDegrees: false,
    showPlanetSign: false,
    showPlanetStatusMarks: false,
  },
  creation: {
    compactHouses: [2, 3, 5, 6, 8, 9, 11, 12],
    labelDensityThresholds: {
      compact: 2,
      stacked: 4,
    },
    maxVisiblePlanets: 7,
    planetGlyphSize: 'full',
    showPlanetDegrees: true,
    showPlanetSign: false,
    showPlanetStatusMarks: true,
  },
  full: {
    compactHouses: [2, 3, 5, 6, 8, 9, 11, 12],
    labelDensityThresholds: {
      compact: 2,
      stacked: 5,
    },
    maxVisiblePlanets: 7,
    planetGlyphSize: 'full',
    showPlanetDegrees: true,
    showPlanetSign: false,
    showPlanetStatusMarks: true,
  },
  landing: {
    compactHouses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    labelDensityThresholds: {
      compact: 1,
      stacked: 2,
    },
    maxVisiblePlanets: 1,
    planetGlyphSize: 'compact',
    showPlanetDegrees: false,
    showPlanetSign: false,
    showPlanetStatusMarks: false,
  },
  library: {
    compactHouses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    labelDensityThresholds: {
      compact: 1,
      stacked: 2,
    },
    maxVisiblePlanets: 1,
    planetGlyphSize: 'compact',
    showPlanetDegrees: false,
    showPlanetSign: false,
    showPlanetStatusMarks: false,
  },
  main: {
    compactHouses: [2, 3, 5, 6, 8, 9, 11, 12],
    labelDensityThresholds: {
      compact: 2,
      stacked: 4,
    },
    maxVisiblePlanets: 7,
    planetGlyphSize: 'full',
    showPlanetDegrees: true,
    showPlanetSign: false,
    showPlanetStatusMarks: true,
  },
  report: {
    compactHouses: [2, 3, 5, 6, 8, 9, 11, 12],
    labelDensityThresholds: {
      compact: 2,
      stacked: 4,
    },
    maxVisiblePlanets: 7,
    planetGlyphSize: 'compact',
    showPlanetDegrees: true,
    showPlanetSign: false,
    showPlanetStatusMarks: true,
  },
};

export function getChartSurfacePreset(
  presentation: ChartRenderPresentation,
): ChartSurfacePreset {
  return CHART_SURFACE_PRESETS[presentation];
}

const PLANET_DIGNITIES: Record<string, { debilitated: string; exalted: string }> = {
  Jupiter: { debilitated: 'Capricorn', exalted: 'Cancer' },
  Mars: { debilitated: 'Cancer', exalted: 'Capricorn' },
  Mercury: { debilitated: 'Pisces', exalted: 'Virgo' },
  Moon: { debilitated: 'Scorpio', exalted: 'Taurus' },
  Saturn: { debilitated: 'Aries', exalted: 'Libra' },
  Sun: { debilitated: 'Libra', exalted: 'Aries' },
  Venus: { debilitated: 'Virgo', exalted: 'Pisces' },
};

const COMBUSTION_ORBS: Record<string, number> = {
  Jupiter: 11,
  Mars: 17,
  Mercury: 14,
  Moon: 12,
  Saturn: 15,
  Venus: 10,
};

export const NORTH_INDIAN_HOUSE_POSITIONS: Record<
  number,
  { col: number; row: number; x: number; y: number }
> = {
  1: { col: 2, row: 0, x: 50, y: 25 },
  2: { col: 1, row: 0, x: 25, y: 12.5 },
  3: { col: 0, row: 1, x: 12.5, y: 25 },
  4: { col: 0, row: 2, x: 25, y: 50 },
  5: { col: 0, row: 3, x: 12.5, y: 75 },
  6: { col: 1, row: 4, x: 25, y: 87.5 },
  7: { col: 2, row: 4, x: 50, y: 75 },
  8: { col: 3, row: 4, x: 75, y: 87.5 },
  9: { col: 4, row: 3, x: 87.5, y: 75 },
  10: { col: 4, row: 2, x: 75, y: 50 },
  11: { col: 4, row: 1, x: 87.5, y: 25 },
  12: { col: 3, row: 0, x: 75, y: 12.5 },
};

export const NORTH_INDIAN_CHART_LINE_PATHS = [
  'M0 0 H100 V100 H0 Z',
  'M0 0 L100 100',
  'M100 0 L0 100',
  'M50 0 L100 50 L50 100 L0 50 Z',
] as const;

export const NORTH_INDIAN_HOUSE_HIT_ORDER = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
] as const;

export const NORTH_INDIAN_HOUSE_POLYGONS: Record<
  number,
  Array<readonly [number, number]>
> = {
  1: [
    [50, 0],
    [75, 25],
    [50, 50],
    [25, 25],
  ],
  2: [
    [0, 0],
    [50, 0],
    [25, 25],
  ],
  3: [
    [0, 0],
    [25, 25],
    [0, 50],
  ],
  4: [
    [0, 50],
    [25, 25],
    [50, 50],
    [25, 75],
  ],
  5: [
    [0, 50],
    [25, 75],
    [0, 100],
  ],
  6: [
    [0, 100],
    [25, 75],
    [50, 100],
  ],
  7: [
    [50, 100],
    [25, 75],
    [50, 50],
    [75, 75],
  ],
  8: [
    [50, 100],
    [75, 75],
    [100, 100],
  ],
  9: [
    [100, 100],
    [75, 75],
    [100, 50],
  ],
  10: [
    [100, 50],
    [75, 25],
    [50, 50],
    [75, 75],
  ],
  11: [
    [100, 0],
    [100, 50],
    [75, 25],
  ],
  12: [
    [50, 0],
    [100, 0],
    [75, 25],
  ],
};

export function buildNorthIndianChartCells(
  chart: ChartData,
  language: SupportedLanguage = 'en',
): ChartCell[] {
  return buildChartRenderModel({ chart, language }).cells.map(
    ({
      ariaLabel: _ariaLabel,
      hasManyPlanets: _hasManyPlanets,
      labelDensity: _labelDensity,
      renderPlanets: _renderPlanets,
      ...cell
    }) => cell,
  );
}

export function buildChartRenderModel({
  birthDetails,
  chart,
  language = 'en',
  presentation = 'main',
  school = detectChartRenderSchool(chart),
}: BuildChartRenderModelOptions): ChartRenderModel {
  const surfacePreset = getChartSurfacePreset(presentation);
  const ascendantIndex = SIGNS.indexOf(chart.ascendantSign as (typeof SIGNS)[number]);
  const useExplicitHouse = isHouseDeliveryChart(chart) || school === 'KP';
  const planetsByHouse = chart.planetDistribution.reduce<Record<number, PlanetPosition[]>>(
    (current, planet) => {
      const house = useExplicitHouse
        ? planet.house
        : deriveHouseFromSign(planet.sign, ascendantIndex) ?? planet.house;

      current[house] = [...(current[house] ?? []), planet].sort(
        (first, second) => first.degree - second.degree,
      );
      return current;
    },
    {},
  );

  const moonPhase = getMoonPhase(chart);
  const cells = Array.from({ length: 12 }, (_, index): ChartRenderCell => {
    const house = index + 1;
    const sign =
      ascendantIndex >= 0
        ? SIGNS[(ascendantIndex + index) % SIGNS.length]
        : SIGNS[index];
    const position = NORTH_INDIAN_HOUSE_POSITIONS[house];
    const planetPositions = planetsByHouse[house] ?? [];
    const supportingPoints = planetPositions.filter(planet =>
      shouldHideSupportingPoint({
        planet,
        presentation,
      }),
    );
    const visiblePlanetPositions = planetPositions.filter(
      planet => !supportingPoints.includes(planet),
    );
    const labelDensity = getCellLabelDensity(
      house,
      visiblePlanetPositions.length,
      presentation,
    );
    const cellDisplay = deriveCellPresentationSettings(
      presentation,
      labelDensity,
      surfacePreset,
    );
    const displayPlanetPositions = prioritizePlanetPositionsForDisplay(
      visiblePlanetPositions,
      cellDisplay.maxVisiblePlanets,
    );
    const planets =
      displayPlanetPositions.length > 0
        ? displayPlanetPositions.map(planet => planet.name)
        : planetPositions.length === 0
          ? chart.housePlacements[house] ?? chart.signPlacements[sign] ?? []
          : [];
    const renderPlanets = displayPlanetPositions.map(planet =>
      buildChartRenderPlanet(planet, chart, language),
    );
    return {
      ariaLabel: buildChartCellAriaLabel({
        house,
        language,
        planetPositions: visiblePlanetPositions,
        supportingPointCount: supportingPoints.length,
        sign,
      }),
      col: position.col,
      hasManyPlanets: renderPlanets.length >= 3,
      hiddenPlanetCount: Math.max(
        0,
        renderPlanets.length - cellDisplay.maxVisiblePlanets + supportingPoints.length,
      ),
      house,
      key: `house-${house}`,
      labelDensity,
      maxVisiblePlanets: cellDisplay.maxVisiblePlanets,
      planetGlyphSize: cellDisplay.planetGlyphSize,
      planetPositions: visiblePlanetPositions,
      planets,
      renderPlanets,
      row: position.row,
      sign,
      showPlanetDegrees: cellDisplay.showPlanetDegrees,
      showPlanetSign: cellDisplay.showPlanetSign,
      showPlanetStatusMarks: cellDisplay.showPlanetStatusMarks,
      supportingPoints,
      displaySign: getLocalizedSignName(sign, language),
      signGlyph: SIGN_GLYPHS[sign],
      signNumber: SIGNS.indexOf(sign as (typeof SIGNS)[number]) + 1,
      signShort: SIGN_SHORT[sign],
      displaySignShort: getLocalizedSignShort(sign, language),
      x: position.x,
      y: position.y,
    };
  });

  return {
    cells,
    chartName: chart.name,
    displayChartName: getLocalizedChartName(chart, language),
    chartType: chart.chartType,
    geometry: 'north-indian',
    language,
    legend: buildChartLegend(cells, moonPhase, school, language),
    moonPhase,
    moonNakshatraPada: buildChartMoonNakshatraPadaInsight(chart, moonPhase),
    presentation,
    school,
    theme: getChartRenderTheme(birthDetails?.time),
  };
}

function buildChartRenderPlanet(
  planet: PlanetPosition,
  chart: ChartData,
  language: SupportedLanguage,
): ChartRenderPlanet {
  const dignity = PLANET_DIGNITIES[planet.name];
  const sun = chart.planetDistribution.find(item => item.name === 'Sun');
  const combustionOrb = COMBUSTION_ORBS[planet.name];
  const isNode = planet.name === 'Rahu' || planet.name === 'Ketu';
  const combust =
    planet.name !== 'Sun' &&
    !isNode &&
    sun !== undefined &&
    combustionOrb !== undefined &&
    getAngularSeparation(planet.absoluteLongitude, sun.absoluteLongitude) <=
      combustionOrb;

  const displayName = getLocalizedPlanetName(planet.name, language);
  const displaySign = getLocalizedSignName(planet.sign, language);

  return {
    abbreviation: getPlanetAbbreviation(planet.name),
    degreeLabel: `${planet.degree.toFixed(1)}°`,
    displayAbbreviation: getLocalizedPlanetAbbreviation(planet.name, language),
    displayLabel: `${displayName} ${planet.degree.toFixed(1)}°`,
    displayName,
    displaySign,
    key: `${planet.name}-${planet.sign}-${planet.degree.toFixed(3)}`,
    label: `${planet.name} ${planet.degree.toFixed(1)}°`,
    name: planet.name,
    nakshatra: planet.nakshatra,
    pada: planet.pada,
    padaMeaning: getPadaMeaning(planet.pada),
    position: planet,
    sign: planet.sign,
    status: {
      combust,
      debilitated: dignity?.debilitated === planet.sign,
      exalted: dignity?.exalted === planet.sign,
      retrograde: planet.retrograde,
    },
  };
}

function getAngularSeparation(first: number, second: number): number {
  return Math.abs(((first - second + 540) % 360) - 180);
}

function buildChartCellAriaLabel({
  house,
  language,
  planetPositions,
  supportingPointCount = 0,
  sign,
}: {
  house: number;
  language: SupportedLanguage;
  planetPositions: PlanetPosition[];
  supportingPointCount?: number;
  sign: string;
}): string {
  const displaySign = getLocalizedSignName(sign, language);
  const supportingHint =
    supportingPointCount > 0
      ? getSupportingPointAvailabilityHint(language, supportingPointCount)
      : '';

  if (!planetPositions.length) {
    if (language === 'hi') {
      return `भाव ${house} चुनें, ${displaySign}, खाली${supportingHint}`;
    }

    if (language === 'gu') {
      return `ભાવ ${house} પસંદ કરો, ${displaySign}, ખાલી${supportingHint}`;
    }

    return `Select House ${house}, ${displaySign}, empty${supportingHint}`;
  }

  const planetSummary = planetPositions
    .map(planet => {
      const planetName = getLocalizedPlanetName(planet.name, language);
      const signName = getLocalizedSignName(planet.sign, language);
      const degree = planet.degree.toFixed(1);

      if (language === 'hi') {
        return `${planetName} ${signName} में ${degree} डिग्री${
          planet.retrograde ? ' वक्री' : ''
        }`;
      }

      if (language === 'gu') {
        return `${planetName} ${signName} માં ${degree} ડિગ્રી${
          planet.retrograde ? ' વક્રી' : ''
        }`;
      }

      return `${planetName} in ${signName} ${degree} degrees${
        planet.retrograde ? ' retrograde' : ''
      }`;
    })
    .join(', ');

  if (language === 'hi') {
    return `भाव ${house} चुनें, ${displaySign}, ${planetSummary}${supportingHint}`;
  }

  if (language === 'gu') {
    return `ભાવ ${house} પસંદ કરો, ${displaySign}, ${planetSummary}${supportingHint}`;
  }

  return `Select House ${house}, ${displaySign}, ${planetSummary}${supportingHint}`;
}

function getSupportingPointAvailabilityHint(
  language: SupportedLanguage,
  count: number,
): string {
  if (language === 'hi') {
    return `, ${count} सहायक सूक्ष्म बिंदु उपलब्ध`;
  }

  if (language === 'gu') {
    return `, ${count} સહાયક સૂક્ષ્મ બિંદુ ઉપલબ્ધ`;
  }

  return `, ${count} supporting refinement${count === 1 ? '' : 's'} available`;
}

function getCellLabelDensity(
  house: number,
  planetCount: number,
  presentation: ChartRenderPresentation,
): ChartRenderCell['labelDensity'] {
  const preset = getChartSurfacePreset(presentation);

  if (planetCount >= preset.labelDensityThresholds.stacked) {
    return 'stacked';
  }

  if (
    planetCount >= preset.labelDensityThresholds.compact ||
    preset.compactHouses.includes(house)
  ) {
    return 'compact';
  }

  return 'normal';
}

function deriveCellPresentationSettings(
  presentation: ChartRenderPresentation,
  labelDensity: ChartRenderCell['labelDensity'],
  preset: ChartSurfacePreset,
): Pick<
  ChartRenderCell,
  | 'maxVisiblePlanets'
  | 'planetGlyphSize'
  | 'showPlanetDegrees'
  | 'showPlanetSign'
  | 'showPlanetStatusMarks'
> {
  if (labelDensity === 'normal') {
    return {
      maxVisiblePlanets: preset.maxVisiblePlanets,
      planetGlyphSize: preset.planetGlyphSize,
      showPlanetDegrees: preset.showPlanetDegrees,
      showPlanetSign: preset.showPlanetSign,
      showPlanetStatusMarks: preset.showPlanetStatusMarks,
    };
  }

  if (labelDensity === 'compact') {
    if (presentation === 'full') {
      return {
        maxVisiblePlanets: preset.maxVisiblePlanets,
        planetGlyphSize: 'compact',
        showPlanetDegrees: true,
        showPlanetSign: false,
        showPlanetStatusMarks: true,
      };
    }

    return {
      maxVisiblePlanets:
        presentation === 'main' ||
        presentation === 'charts' ||
        presentation === 'creation' ||
        presentation === 'report'
          ? Math.min(3, preset.maxVisiblePlanets)
          : Math.min(1, preset.maxVisiblePlanets),
      planetGlyphSize: 'compact',
      showPlanetDegrees: false,
      showPlanetSign: false,
      showPlanetStatusMarks: false,
    };
  }

  if (presentation === 'full') {
    return {
      maxVisiblePlanets: preset.maxVisiblePlanets,
      planetGlyphSize: 'compact',
      showPlanetDegrees: true,
      showPlanetSign: false,
      showPlanetStatusMarks: true,
    };
  }

  return {
    maxVisiblePlanets:
      presentation === 'main' ||
      presentation === 'charts' ||
      presentation === 'creation' ||
      presentation === 'report'
        ? Math.min(2, preset.maxVisiblePlanets)
        : presentation === 'library'
          ? Math.min(1, preset.maxVisiblePlanets)
          : 1,
    planetGlyphSize: 'compact',
    showPlanetDegrees: false,
    showPlanetSign: false,
    showPlanetStatusMarks: false,
  };
}

function prioritizePlanetPositionsForDisplay(
  planetPositions: PlanetPosition[],
  maxVisiblePlanets: number,
): PlanetPosition[] {
  if (planetPositions.length <= maxVisiblePlanets) {
    return planetPositions;
  }

  return [...planetPositions].sort((first, second) => {
    const priorityDifference =
      getPlanetDisplayPriority(first) - getPlanetDisplayPriority(second);

    if (priorityDifference !== 0) {
      return priorityDifference;
    }

    return first.degree - second.degree;
  });
}

function getPlanetDisplayPriority(planet: PlanetPosition): number {
  if (planet.name === 'Rahu' || planet.name === 'Ketu') {
    return 0;
  }

  if (planet.name === 'Sun' || planet.name === 'Moon') {
    return 1;
  }

  if (planet.kind === 'modern' || planet.kind === 'sensitive' || planet.kind === 'upagraha') {
    return 3;
  }

  return 2;
}

function buildChartLegend(
  cells: ChartRenderCell[],
  moonPhase: ChartRenderMoonPhase,
  school: ChartRenderSchool,
  language: SupportedLanguage,
): ChartRenderLegendItem[] {
  const hasRetrograde = cells.some(cell =>
    cell.renderPlanets.some(planet => planet.status.retrograde),
  );
  const hasExalted = cells.some(cell =>
    cell.renderPlanets.some(planet => planet.status.exalted),
  );
  const hasDebilitated = cells.some(cell =>
    cell.renderPlanets.some(planet => planet.status.debilitated),
  );
  const hasCombust = cells.some(cell =>
    cell.renderPlanets.some(planet => planet.status.combust),
  );
  const hasModernRefinements = cells.some(cell =>
    cell.planetPositions.some(planet => planet.kind === 'modern'),
  );
  const hasSensitiveRefinements = cells.some(cell =>
    cell.planetPositions.some(
      planet => planet.kind === 'sensitive' || planet.kind === 'upagraha',
    ),
  );
  const legend: ChartRenderLegendItem[] = [];

  if (hasRetrograde) {
    legend.push({
      code: 'R',
      description: getLocalizedLegendText('retrograde', language),
      tone: 'caution',
    });
  }

  if (hasExalted) {
    legend.push({
      code: 'E',
      description: getLocalizedLegendText('exalted', language),
      tone: 'support',
    });
  }

  if (hasDebilitated) {
    legend.push({
      code: 'D',
      description: getLocalizedLegendText('debilitated', language),
      tone: 'caution',
    });
  }

  if (hasCombust) {
    legend.push({
      code: 'C',
      description: getLocalizedLegendText('combust', language),
      tone: 'caution',
    });
  }

  if (moonPhase !== 'unknown') {
    const moonLabels = getLocalizedMoonLegendLabels(language);
    const localizedMoonLabels: Record<Exclude<ChartRenderMoonPhase, 'unknown'>, ChartRenderLegendItem> = {
      dark: {
        code: moonLabels.dark.code,
        description: moonLabels.dark.description,
        tone: 'neutral',
      },
      full: {
        code: moonLabels.full.code,
        description: moonLabels.full.description,
        tone: 'neutral',
      },
      waning: {
        code: moonLabels.waning.code,
        description: moonLabels.waning.description,
        tone: 'neutral',
      },
      waxing: {
        code: moonLabels.waxing.code,
        description: moonLabels.waxing.description,
        tone: 'neutral',
      },
    };

    legend.push({
      ...localizedMoonLabels[moonPhase],
    });
  }

  if (hasModernRefinements) {
    const outerCodeByLanguage: Record<SupportedLanguage, string> = {
      en: 'Outer',
      gu: 'બાહ્ય',
      hi: 'बाहरी',
    };
    legend.push({
      code: outerCodeByLanguage[language] ?? outerCodeByLanguage.en,
      description: getLocalizedLegendText('outer', language),
      tone: 'neutral',
    });
  }

  if (hasSensitiveRefinements) {
    const upagrahaCodeByLanguage: Record<SupportedLanguage, string> = {
      en: 'Upagraha',
      gu: 'ઉપગ્રહ',
      hi: 'उपग्रह',
    };
    legend.push({
      code: upagrahaCodeByLanguage[language] ?? upagrahaCodeByLanguage.en,
      description: getLocalizedLegendText('upagraha', language),
      tone: 'neutral',
    });
  }

  if (school === 'KP') {
    legend.push({
      code: 'KP',
      description: getLocalizedLegendText('kp', language),
      tone: 'neutral',
    });
  }

  if (school === 'NADI') {
    legend.push({
      code: 'Nadi',
      description: getLocalizedLegendText('nadi', language),
      tone: 'neutral',
    });
  }

  return legend;
}

export function getChartRenderTheme(time?: string): ChartRenderTheme {
  const minutes = parseBirthTimeToMinutes(time);

  if (minutes === undefined) {
    return 'unknown';
  }

  if (minutes >= 5 * 60 && minutes < 8 * 60) {
    return 'sunrise';
  }

  if (minutes >= 8 * 60 && minutes < 12 * 60) {
    return 'morning';
  }

  if (minutes >= 12 * 60 && minutes < 17 * 60) {
    return 'afternoon';
  }

  if (minutes >= 17 * 60 && minutes < 19 * 60) {
    return 'sunset';
  }

  return 'night';
}

function parseBirthTimeToMinutes(time?: string): number | undefined {
  if (!time) {
    return undefined;
  }

  const clean = time.trim().toLowerCase();
  const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);

  if (!match) {
    return undefined;
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2] ?? '0');
  const meridiem = match[3];

  if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes > 59) {
    return undefined;
  }

  if (meridiem === 'pm' && hours < 12) {
    hours += 12;
  }

  if (meridiem === 'am' && hours === 12) {
    hours = 0;
  }

  if (hours > 23) {
    return undefined;
  }

  return hours * 60 + minutes;
}

function detectChartRenderSchool(chart: ChartData): ChartRenderSchool {
  if (/kp/i.test(chart.name)) {
    return 'KP';
  }

  if (/nadi/i.test(chart.name)) {
    return 'NADI';
  }

  return 'PARASHARI';
}

function deriveHouseFromSign(sign: string, ascendantIndex: number): number | undefined {
  const planetSignIndex = SIGNS.indexOf(sign as (typeof SIGNS)[number]);

  if (ascendantIndex < 0 || planetSignIndex < 0) {
    return undefined;
  }

  return ((planetSignIndex - ascendantIndex + 12) % 12) + 1;
}

function isHouseDeliveryChart(chart: ChartData): boolean {
  return /chalit/i.test(chart.name);
}

function shouldHideSupportingPoint({
  planet,
  presentation,
}: {
  planet: PlanetPosition;
  presentation: ChartRenderPresentation;
}): boolean {
  if (presentation === 'full') {
    return false;
  }

  if (!planet.kind || planet.kind === 'classical') {
    return false;
  }

  return planet.kind === 'modern' || isSpecialPoint(planet);
}

export function buildSchoolPreviewChart(
  kundli: KundliData,
  school: ChartRenderSchool,
): ChartData | undefined {
  const d1Chart = kundli.charts.D1;

  if (!d1Chart?.supported) {
    return undefined;
  }

  if (school === 'KP') {
    return buildKpPreviewChart(kundli, d1Chart);
  }

  if (school === 'NADI') {
    return buildNadiPreviewChart(d1Chart);
  }

  return d1Chart;
}

function buildKpPreviewChart(
  kundli: KundliData,
  baseChart: ChartData,
): ChartData {
  const kp = kundli.kp;

  if (!kp?.planets?.length) {
    return buildNadiPreviewChart({
      ...baseChart,
      name: 'KP Horoscope',
    });
  }

  const basePlanetByName = new Map(
    kundli.planets.map(planet => [planet.name, planet] as const),
  );
  const kpPlanetDistribution: PlanetPosition[] = kp.planets.map(planet => {
    const basePlanet = basePlanetByName.get(planet.planet);

    return {
      absoluteLongitude: planet.longitude,
      calculationNote:
        `KP house ${planet.house}; star lord ${planet.lordChain.starLord}; ` +
        `sub lord ${planet.lordChain.subLord}.`,
      degree: planet.degree,
      house: planet.house,
      kind: basePlanet?.kind ?? 'classical',
      nakshatra: basePlanet?.nakshatra ?? planet.lordChain.nakshatra,
      name: planet.planet,
      pada: basePlanet?.pada ?? 0,
      retrograde: planet.retrograde,
      sign: planet.sign,
      simpleMeaning: basePlanet?.simpleMeaning,
    };
  });

  return {
    ascendantSign: kp.cusps.find(cusp => cusp.house === 1)?.sign ?? baseChart.ascendantSign,
    chartType: 'D1',
    housePlacements: buildHousePlacementsFromPlanets(kpPlanetDistribution),
    name: 'KP Horoscope',
    planetDistribution: kpPlanetDistribution,
    signPlacements: buildSignPlacementsFromPlanets(kpPlanetDistribution),
    supported: true,
  };
}

function buildNadiPreviewChart(baseChart: ChartData): ChartData {
  const filteredPlanetDistribution = baseChart.planetDistribution.filter(
    planet => !planet.kind || planet.kind === 'classical',
  );

  return {
    ...baseChart,
    housePlacements: buildHousePlacementsFromPlanets(filteredPlanetDistribution),
    name: 'Nadi Chart Anchor',
    planetDistribution: filteredPlanetDistribution,
    signPlacements: buildSignPlacementsFromPlanets(filteredPlanetDistribution),
  };
}

function buildHousePlacementsFromPlanets(
  planets: PlanetPosition[],
): Record<number, string[]> {
  return planets.reduce<Record<number, string[]>>((current, planet) => {
    current[planet.house] = [...(current[planet.house] ?? []), planet.name];
    return current;
  }, {});
}

function buildSignPlacementsFromPlanets(
  planets: PlanetPosition[],
): Record<string, string[]> {
  return planets.reduce<Record<string, string[]>>((current, planet) => {
    current[planet.sign] = [...(current[planet.sign] ?? []), planet.name];
    return current;
  }, {});
}

export function findNorthIndianHouseAtPoint(
  x: number,
  y: number,
): number | undefined {
  for (const house of NORTH_INDIAN_HOUSE_HIT_ORDER) {
    if (isPointInNorthIndianHouse(x, y, house)) {
      return house;
    }
  }

  return undefined;
}

export function isPointInNorthIndianHouse(
  x: number,
  y: number,
  house: number,
): boolean {
  return isPointInPolygon(x, y, NORTH_INDIAN_HOUSE_POLYGONS[house] ?? []);
}

function isPointInPolygon(
  x: number,
  y: number,
  polygon: Array<readonly [number, number]>,
): boolean {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function getPlanetAbbreviation(planet: string): string {
  return (
    {
      Jupiter: 'Ju',
      Ketu: 'Ke',
      Mars: 'Ma',
      Mercury: 'Me',
      Moon: 'Mo',
      Mandi: 'Mn',
      Neptune: 'Ne',
      Pluto: 'Pl',
      Rahu: 'Ra',
      Saturn: 'Sa',
      Sun: 'Su',
      Uranus: 'Ur',
      Venus: 'Ve',
      Dhuma: 'Dh',
      Indrachapa: 'In',
      Parivesha: 'Pa',
      Upaketu: 'Uk',
      Vyatipata: 'Vy',
      Gulika: 'Gu',
    }[planet] ?? planet.slice(0, 2)
  );
}

export function getLocalizedPlanetName(
  planet: string,
  language: SupportedLanguage = 'en',
): string {
  return PLANET_TRANSLATIONS[planet]?.[language]?.name ?? planet;
}

export function getLocalizedPlanetAbbreviation(
  planet: string,
  language: SupportedLanguage = 'en',
): string {
  return (
    PLANET_TRANSLATIONS[planet]?.[language]?.abbreviation ??
    getPlanetAbbreviation(planet)
  );
}

export function getLocalizedSignName(
  sign: string,
  language: SupportedLanguage = 'en',
): string {
  return SIGN_TRANSLATIONS[sign]?.[language]?.name ?? sign;
}

export function getLocalizedSignShort(
  sign: string,
  language: SupportedLanguage = 'en',
): string {
  return SIGN_TRANSLATIONS[sign]?.[language]?.short ?? SIGN_SHORT[sign] ?? sign;
}

function getLocalizedChartName(
  chart: ChartData,
  language: SupportedLanguage,
): string {
  const baseNames: Partial<Record<ChartData['chartType'], Record<SupportedLanguage, string>>> = {
    D1: { en: chart.name, gu: 'રાશિ ચાર્ટ', hi: 'राशि चार्ट' },
    D2: { en: chart.name, gu: 'હોરા ચાર્ટ', hi: 'होरा चार्ट' },
    D9: { en: chart.name, gu: 'નવાંશ ચાર્ટ', hi: 'नवांश चार्ट' },
    D10: { en: chart.name, gu: 'દશાંશ ચાર્ટ', hi: 'दशांश चार्ट' },
  };

  return baseNames[chart.chartType]?.[language] ?? chart.name;
}

function getLocalizedLegendText(
  key:
    | 'combust'
    | 'debilitated'
    | 'exalted'
    | 'kp'
    | 'nadi'
    | 'outer'
    | 'retrograde'
    | 'upagraha',
  language: SupportedLanguage,
): string {
  const labels: Record<typeof key, Record<SupportedLanguage, string>> = {
    combust: {
      en: 'Combust planet',
      gu: 'અસ્ત ગ્રહ',
      hi: 'अस्त ग्रह',
    },
    debilitated: {
      en: 'Debilitated planet',
      gu: 'નીચ ગ્રહ',
      hi: 'नीच ग्रह',
    },
    exalted: {
      en: 'Exalted planet',
      gu: 'ઉચ્ચ ગ્રહ',
      hi: 'उच्च ग्रह',
    },
    kp: {
      en: 'KP readings use star lord, sub lord, and significators',
      gu: 'KP વાંચન નક્ષત્ર સ્વામી, સબ લોર્ડ અને સંકેતકોથી થાય છે',
      hi: 'KP पढ़ाई नक्षत्र स्वामी, सब लॉर्ड और संकेतकों से होती है',
    },
    nadi: {
      en: 'Nadi readings use planet-to-planet story patterns',
      gu: 'નાડી વાંચન ગ્રહથી ગ્રહ વચ્ચેના જીવન પેટર્નને જુએ છે',
      hi: 'नाड़ी पढ़ाई ग्रह से ग्रह के जीवन पैटर्न को देखती है',
    },
    outer: {
      en: 'Modern outer planets are supporting refinements',
      gu: 'આધુનિક બાહ્ય ગ્રહો સહાયક સુધારો આપે છે',
      hi: 'आधुनिक बाहरी ग्रह सहायक सुधार देते हैं',
    },
    retrograde: {
      en: 'Retrograde planet',
      gu: 'વક્રી ગ્રહ',
      hi: 'वक्री ग्रह',
    },
    upagraha: {
      en: 'Sensitive Jyotish points refine, but do not replace, the main chart',
      gu: 'ઉપગ્રહ મુખ્ય ચાર્ટને બદલે નથી, ફક્ત વાંચનને વધુ સૂક્ષ્મ બનાવે છે',
      hi: 'उपग्रह मुख्य चार्ट को बदलते नहीं, केवल पढ़ाई को और सूक्ष्म बनाते हैं',
    },
  };

  return labels[key][language] ?? labels[key].en;
}

function getLocalizedMoonLegendLabels(
  language: SupportedLanguage,
): Record<Exclude<ChartRenderMoonPhase, 'unknown'>, { code: string; description: string }> {
  const labels: Record<
    SupportedLanguage,
    Record<Exclude<ChartRenderMoonPhase, 'unknown'>, { code: string; description: string }>
  > = {
    en: {
      dark: { code: 'Dark Moon', description: 'Moon is near Amavasya' },
      full: { code: 'Full Moon', description: 'Moon is near full brightness' },
      waning: { code: 'Waning Moon', description: 'Moon light is decreasing' },
      waxing: { code: 'Waxing Moon', description: 'Moon light is increasing' },
    },
    gu: {
      dark: { code: 'અમાસ ચંદ્ર', description: 'ચંદ્ર અમાસ પાસે છે' },
      full: { code: 'પૂર્ણિમા ચંદ્ર', description: 'ચંદ્ર પૂર્ણ પ્રકાશ પાસે છે' },
      waning: { code: 'ઘટતો ચંદ્ર', description: 'ચંદ્રનો પ્રકાશ ઘટી રહ્યો છે' },
      waxing: { code: 'વધતો ચંદ્ર', description: 'ચંદ્રનો પ્રકાશ વધી રહ્યો છે' },
    },
    hi: {
      dark: { code: 'अमावस्या चंद्र', description: 'चंद्र अमावस्या के पास है' },
      full: { code: 'पूर्णिमा चंद्र', description: 'चंद्र पूर्ण प्रकाश के पास है' },
      waning: { code: 'घटता चंद्र', description: 'चंद्र की रोशनी घट रही है' },
      waxing: { code: 'बढ़ता चंद्र', description: 'चंद्र की रोशनी बढ़ रही है' },
    },
  };

  return labels[language] ?? labels.en;
}

export function getMoonPhase(chart: ChartData): ChartRenderMoonPhase {
  const moon = chart.planetDistribution.find(planet => planet.name === 'Moon');
  const sun = chart.planetDistribution.find(planet => planet.name === 'Sun');

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

export function buildParashariChalitChart(
  kundli?: KundliData,
): ChartData | undefined {
  if (!kundli?.chalit || kundli.chalit.status !== 'ready') {
    return undefined;
  }

  const placements = kundli.chalit.planetPlacements;
  const planetDistribution = placements
    .map(placement => {
      const planet = kundli.planets.find(item => item.name === placement.planet);

      if (!planet) {
        return undefined;
      }

      return {
        ...planet,
        house: placement.chalitHouse,
        sign: placement.rashiSign,
      };
    })
    .filter(Boolean) as PlanetPosition[];
  const signPlacements = Object.fromEntries(SIGNS.map(sign => [sign, [] as string[]]));
  const housePlacements = Object.fromEntries(
    Array.from({ length: 12 }, (_, index) => [index + 1, [] as string[]]),
  ) as Record<number, string[]>;

  for (const planet of planetDistribution) {
    signPlacements[planet.sign]?.push(planet.name);
    housePlacements[planet.house]?.push(planet.name);
  }

  return {
    ascendantSign: kundli.lagna,
    chartType: 'D1',
    housePlacements,
    name: 'Chalit Chart',
    planetDistribution,
    signPlacements,
    supported: true,
  };
}

export function findHouseCell(cells: ChartCell[], house?: number): ChartCell | undefined {
  return cells.find(cell => cell.house === house);
}

export function findPlanetCell(
  cells: ChartCell[],
  planet?: string,
): ChartCell | undefined {
  if (!planet) {
    return undefined;
  }

  return cells.find(cell => cell.planets.includes(planet));
}
