import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
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
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f800c7a7fd"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f800c7a7fd") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.d0dc38337c"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.d0dc38337c") },
  },
  Taurus: {
    en: { name: 'Taurus', short: 'Tau' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.32a5dc415e"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c2948243b0") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.46c13ac334"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.edb656e8e8") },
  },
  Gemini: {
    en: { name: 'Gemini', short: 'Gem' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.e7606cff4c"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.15f903be7b") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6e4aa0522b"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.060efab06e") },
  },
  Cancer: {
    en: { name: 'Cancer', short: 'Can' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.eca5bc33ba"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.eca5bc33ba") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6ca2aec5ed"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6ca2aec5ed") },
  },
  Leo: {
    en: { name: 'Leo', short: 'Leo' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.78091d77e7"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.78091d77e7") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.69a4330681"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.69a4330681") },
  },
  Virgo: {
    en: { name: 'Virgo', short: 'Vir' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.9cbd01ebe5"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.9cbd01ebe5") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.bb3330123e"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.bb3330123e") },
  },
  Libra: {
    en: { name: 'Libra', short: 'Lib' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.83554f40e6"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.83554f40e6") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.b4fddac1a5"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.b4fddac1a5") },
  },
  Scorpio: {
    en: { name: 'Scorpio', short: 'Sco' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.034d53679c"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6081919bdd") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.ebe7bb360f"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.34e2c12cea") },
  },
  Sagittarius: {
    en: { name: 'Sagittarius', short: 'Sag' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6f8eca9b34"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6f8eca9b34") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.53e2e69514"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.53e2e69514") },
  },
  Capricorn: {
    en: { name: 'Capricorn', short: 'Cap' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.fe7a2e292e"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.fe7a2e292e") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6b818972e3"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6b818972e3") },
  },
  Aquarius: {
    en: { name: 'Aquarius', short: 'Aqu' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.50172db085"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.50172db085") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f3ef823bbc"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f3ef823bbc") },
  },
  Pisces: {
    en: { name: 'Pisces', short: 'Pis' },
    gu: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.dae6bb0928"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.dae6bb0928") },
    hi: { name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.797c695cf4"), short: getNativeCopy("native.packages.astrology.src.chartLayout.ts.797c695cf4") },
  },
};

const PLANET_TRANSLATIONS: Record<
  string,
  Record<SupportedLanguage, { abbreviation: string; name: string }>
> = {
  Dhuma: {
    en: { abbreviation: 'Dh', name: 'Dhuma' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.449c38f096"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.9c0df42525") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.60e9686150"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c95fdb63fb") },
  },
  Gulika: {
    en: { abbreviation: 'Gu', name: 'Gulika' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.45674a4a11"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.a8bbe5b052") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.42bb907cf8"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.a796629d37") },
  },
  Indrachapa: {
    en: { abbreviation: 'In', name: 'Indrachapa' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.e2dca72ed0"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c80d9e6362") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.5e8c3d0dff"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6b6e06f106") },
  },
  Jupiter: {
    en: { abbreviation: 'Ju', name: 'Jupiter' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.45674a4a11"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.0b4f0d81dd") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.a12c59fe29"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.fed71b7fad") },
  },
  Ketu: {
    en: { abbreviation: 'Ke', name: 'Ketu' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.5399a42e4e"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.08b2d07348") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.7ab56acfc6"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.b2e59a556b") },
  },
  Mandi: {
    en: { abbreviation: 'Mn', name: 'Mandi' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.d501f34acf"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.257967b1f9") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.a983d7beae"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.b32178ae34") },
  },
  Mars: {
    en: { abbreviation: 'Ma', name: 'Mars' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.095c33cee3"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.36fcde7d5d") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.44ea2d1b3c"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.394bdcfe82") },
  },
  Mercury: {
    en: { abbreviation: 'Me', name: 'Mercury' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.a0a6286719"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6f554fd42f") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.caff319e47"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.57589c204d") },
  },
  Moon: {
    en: { abbreviation: 'Mo', name: 'Moon' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f0432d6e4c"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c1ba41ab4e") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.aa9cf33a5f"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.b2254985ce") },
  },
  Neptune: {
    en: { abbreviation: 'Ne', name: 'Neptune' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.fe6e933de9"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.80833bf7f7") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f158ea8f46"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.bea26e43fb") },
  },
  Parivesha: {
    en: { abbreviation: 'Pa', name: 'Parivesha' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.25fd92b6b0"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.5771d9a524") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.1458d40367"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.8e15d53f5c") },
  },
  Pluto: {
    en: { abbreviation: 'Pl', name: 'Pluto' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.2693b47a0e"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.2d5c3169c8") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.8831af6a61"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.7b9f0e4ee5") },
  },
  Rahu: {
    en: { abbreviation: 'Ra', name: 'Rahu' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.2683a1293d"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f08d431a96") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.96817df44e"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f7d54a79e0") },
  },
  Saturn: {
    en: { abbreviation: 'Sa', name: 'Saturn' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.7d38c2923f"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.4b0976b0f5") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.ec44b5dfa4"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.76e8e9058e") },
  },
  Sun: {
    en: { abbreviation: 'Su', name: 'Sun' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.56ba1ec090"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.5525333802") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.72862ba660"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.10ecf3a7a0") },
  },
  Upaketu: {
    en: { abbreviation: 'Uk', name: 'Upaketu' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.9e3a7dbcd8"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c64775dfb0") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.895e715f97"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.4365b00da5") },
  },
  Uranus: {
    en: { abbreviation: 'Ur', name: 'Uranus' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.901713f15a"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.e2a3e35cdc") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.e0747f1f27"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.9efb413451") },
  },
  Venus: {
    en: { abbreviation: 'Ve', name: 'Venus' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.a017d600a2"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.0bffb88e1c") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.8b46da792f"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.b2e75355d1") },
  },
  Vyatipata: {
    en: { abbreviation: 'Vy', name: 'Vyatipata' },
    gu: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.74ded711ab"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.51235c86d0") },
    hi: { abbreviation: getNativeCopy("native.packages.astrology.src.chartLayout.ts.af02372b11"), name: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c14d5e361f") },
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
    maxVisiblePlanets: 12,
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
      return formatNativeCopy("native.packages.astrology.src.chartLayout.ts.38f43375d1", [house, displaySign, supportingHint]);
    }

    if (language === 'gu') {
      return formatNativeCopy("native.packages.astrology.src.chartLayout.ts.dfb84186d7", [house, displaySign, supportingHint]);
    }

    return `Select House ${house}, ${displaySign}, empty${supportingHint}`;
  }

  const planetSummary = planetPositions
    .map(planet => {
      const planetName = getLocalizedPlanetName(planet.name, language);
      const signName = getLocalizedSignName(planet.sign, language);
      const degree = planet.degree.toFixed(1);

      if (language === 'hi') {
        return formatNativeCopy("native.packages.astrology.src.chartLayout.ts.657c379074", [planetName, signName, degree, planet.retrograde ? getNativeCopy("native.packages.astrology.src.chartLayout.ts.9d37f1a416") : '']);
      }

      if (language === 'gu') {
        return formatNativeCopy("native.packages.astrology.src.chartLayout.ts.401c51411e", [planetName, signName, degree, planet.retrograde ? getNativeCopy("native.packages.astrology.src.chartLayout.ts.fe92f7ea5f") : '']);
      }

      return `${planetName} in ${signName} ${degree} degrees${
        planet.retrograde ? ' retrograde' : ''
      }`;
    })
    .join(', ');

  if (language === 'hi') {
    return formatNativeCopy("native.packages.astrology.src.chartLayout.ts.df7dcf28fa", [house, displaySign, planetSummary, supportingHint]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.chartLayout.ts.f82ff7ccec", [house, displaySign, planetSummary, supportingHint]);
  }

  return `Select House ${house}, ${displaySign}, ${planetSummary}${supportingHint}`;
}

function getSupportingPointAvailabilityHint(
  language: SupportedLanguage,
  count: number,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.packages.astrology.src.chartLayout.ts.de1d1379fb", [count]);
  }

  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.chartLayout.ts.c3f05df996", [count]);
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
    if (presentation === 'full' || presentation === 'charts') {
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

  if (presentation === 'full' || presentation === 'charts') {
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
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.abe75c1a23"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.a5486b439a"),
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
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.583ecef7da"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.73ab40b64d"),
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
  return /chalit|kp|cusp/i.test(chart.name);
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
    const filteredPlanetDistribution = baseChart.planetDistribution.filter(
      planet => !planet.kind || planet.kind === 'classical',
    );

    return {
      ...baseChart,
      housePlacements: buildHousePlacementsFromPlanets(filteredPlanetDistribution),
      name: 'KP Bhav Chalit Cusp Chart',
      planetDistribution: filteredPlanetDistribution,
      signPlacements: buildSignPlacementsFromPlanets(filteredPlanetDistribution),
    };
  }

  const basePlanetByName = new Map(
    kundli.planets.map(planet => [planet.name, planet] as const),
  );
  const kpPlanetDistribution: PlanetPosition[] = kp.planets.map(planet => {
    const basePlanet = basePlanetByName.get(planet.planet);

    return {
      absoluteLongitude: planet.longitude,
      calculationNote:
        `KP Bhav Chalit house ${planet.house}; star lord ${planet.lordChain.starLord}; ` +
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
    name: 'KP Bhav Chalit Cusp Chart',
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
    D1: { en: chart.name, gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.f689aaad0d"), hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.ca2a577128") },
    D2: { en: chart.name, gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.929fc27e79"), hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c992bda0de") },
    D9: { en: chart.name, gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.0c65a1e8b4"), hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.9378b6d412") },
    D10: { en: chart.name, gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.9ea8d55b43"), hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c8507bd795") },
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
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.0cbf29e694"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.5af11e4be9"),
    },
    debilitated: {
      en: 'Debilitated planet',
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.09bf28a5f9"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.78a646a5c7"),
    },
    exalted: {
      en: 'Exalted planet',
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.57e6c9a91d"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.47dc00a896"),
    },
    kp: {
      en: 'KP readings use star lord, sub lord, and significators',
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.338b959047"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c8e988e87d"),
    },
    nadi: {
      en: 'Nadi readings use planet-to-planet story patterns',
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.d8c4ec09b6"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.014bc85e70"),
    },
    outer: {
      en: 'Modern outer planets are supporting refinements',
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.e3d1795b68"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c34b24abd5"),
    },
    retrograde: {
      en: 'Retrograde planet',
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.dd5e07ab0d"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.324cbd6b70"),
    },
    upagraha: {
      en: 'Sensitive Jyotish points refine, but do not replace, the main chart',
      gu: getNativeCopy("native.packages.astrology.src.chartLayout.ts.0abfdc7af2"),
      hi: getNativeCopy("native.packages.astrology.src.chartLayout.ts.1d44c0fff8"),
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
      dark: { code: getNativeCopy("native.packages.astrology.src.chartLayout.ts.64e6519701"), description: getNativeCopy("native.packages.astrology.src.chartLayout.ts.bbe2759dbe") },
      full: { code: getNativeCopy("native.packages.astrology.src.chartLayout.ts.334d80662f"), description: getNativeCopy("native.packages.astrology.src.chartLayout.ts.1b006ea803") },
      waning: { code: getNativeCopy("native.packages.astrology.src.chartLayout.ts.af8741f450"), description: getNativeCopy("native.packages.astrology.src.chartLayout.ts.fcb91873c8") },
      waxing: { code: getNativeCopy("native.packages.astrology.src.chartLayout.ts.3b2e2e40cc"), description: getNativeCopy("native.packages.astrology.src.chartLayout.ts.6bbd21ffe4") },
    },
    hi: {
      dark: { code: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c6a43e68a3"), description: getNativeCopy("native.packages.astrology.src.chartLayout.ts.c0846ec2a9") },
      full: { code: getNativeCopy("native.packages.astrology.src.chartLayout.ts.8b4658fd93"), description: getNativeCopy("native.packages.astrology.src.chartLayout.ts.4c3a51e535") },
      waning: { code: getNativeCopy("native.packages.astrology.src.chartLayout.ts.e9ea9253d7"), description: getNativeCopy("native.packages.astrology.src.chartLayout.ts.e01c10c99c") },
      waxing: { code: getNativeCopy("native.packages.astrology.src.chartLayout.ts.9e4f345beb"), description: getNativeCopy("native.packages.astrology.src.chartLayout.ts.abf8a204d4") },
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
