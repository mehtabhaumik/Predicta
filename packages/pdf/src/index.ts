import reportLabelTranslations from './translations/reportLabels.json';
import type {
  ChartData,
  ChartType,
  DecisionMemo,
  HouseData,
  KundliData,
  PDFMode,
  PlanetPosition,
  SupportedLanguage,
  SignatureAnalysisModel,
  TrustProfile,
} from '@pridicta/types';
import { buildTrustProfile } from '@pridicta/config/trust';
import { translateUiText } from '@pridicta/config/uiTranslations';
import {
  buildChartRenderModel,
  composeChartInsight,
  composeChalitBhavKpFoundation,
  composeAdvancedJyotishCoverage,
  buildKundliMoonNakshatraPadaInsight,
  composeHolisticDailyGuidance,
  composeHolisticReadingRooms,
  composeMahadashaIntelligence,
  composeNadiJyotishPlan,
  composeNumerologyFoundationModel,
  composePersonalPanchangLayer,
  composePurusharthaLifeBalance,
  composeSadeSatiIntelligence,
  composeSadhanaRemedyPath,
  composeSignatureAnalysisModel,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
  type ChartRenderLegendItem,
  type ChartRenderMoonPhase,
  type ChartRenderPlanet,
  type ChartRenderSchool,
  type ChartRenderTheme,
} from '@pridicta/astrology';

export type PdfSection = {
  title: string;
  eyebrow: string;
  body: string;
  bullets: string[];
  evidence: string[];
  confidence?: 'low' | 'medium' | 'high';
  decisionWindows?: PdfDecisionWindow[];
  evidenceTable?: PdfEvidenceRow[];
  tier?: 'free' | 'premium';
};

export type PdfEvidenceRow = {
  factor: string;
  observation: string;
  confidence: 'low' | 'medium' | 'high';
  implication: string;
};

export type PdfDecisionWindow = {
  label: string;
  window: string;
  confidence: 'low' | 'medium' | 'high';
  guidance: string;
  evidence: string[];
};

export type PdfReportFocus =
  | 'CAREER'
  | 'COMPATIBILITY'
  | 'DASHA'
  | 'KP'
  | 'KUNDLI'
  | 'MARRIAGE'
  | 'NADI'
  | 'NUMEROLOGY'
  | 'REMEDIES'
  | 'SADESATI'
  | 'SIGNATURE'
  | 'VEDIC'
  | 'WEALTH';

export type PdfComposition = {
  chartSnapshots: PdfChartSnapshot[];
  cover: {
    title: string;
    subtitle: string;
    metadata: string[];
  };
  dossierVersion: '2.0';
  executiveSummary: {
    headline: string;
    keySignals: string[];
    confidence: 'low' | 'medium' | 'high';
  };
  footer: string;
  language: SupportedLanguage;
  mode: PDFMode;
  sections: PdfSection[];
  summary: string;
  trustProfile: TrustProfile;
  watermark: string;
};

export type PdfChartSnapshot = {
  chartName: string;
  displayChartName: string;
  chartType: ChartType;
  cells: PdfChartSnapshotCell[];
  legend: ChartRenderLegendItem[];
  moonNakshatraPada?: {
    moonNakshatra?: string;
    moonPhaseLabel: string;
    pada?: number;
    padaMeaning?: string;
  };
  moonPhase: ChartRenderMoonPhase;
  school: ChartRenderSchool;
  theme: ChartRenderTheme;
};

export type PdfChartSnapshotCell = {
  house?: number;
  hiddenPlanetCount: number;
  labelDensity: 'compact' | 'normal' | 'stacked';
  maxVisiblePlanets: number;
  planetGlyphSize: 'compact' | 'full';
  planets: ChartRenderPlanet[];
  displaySign: string;
  displaySignShort: string;
  sign: string;
  signGlyph: string;
  signNumber: number;
  showPlanetDegrees: boolean;
  showPlanetSign: boolean;
  showPlanetStatusMarks: boolean;
};

const BENEFICS = new Set(['Jupiter', 'Venus', 'Mercury', 'Moon']);
const PRESSURE_PLANETS = new Set(['Saturn', 'Mars', 'Rahu', 'Ketu', 'Sun']);
const OWN_SIGNS: Record<string, string[]> = {
  Jupiter: ['Sagittarius', 'Pisces'],
  Mars: ['Aries', 'Scorpio'],
  Mercury: ['Gemini', 'Virgo'],
  Moon: ['Cancer'],
  Saturn: ['Capricorn', 'Aquarius'],
  Sun: ['Leo'],
  Venus: ['Taurus', 'Libra'],
};
const EXALTATION_SIGNS: Record<string, string> = {
  Jupiter: 'Cancer',
  Mars: 'Capricorn',
  Mercury: 'Virgo',
  Moon: 'Taurus',
  Saturn: 'Libra',
  Sun: 'Aries',
  Venus: 'Pisces',
};
const DEBILITATION_SIGNS: Record<string, string> = {
  Jupiter: 'Capricorn',
  Mars: 'Cancer',
  Mercury: 'Pisces',
  Moon: 'Scorpio',
  Saturn: 'Aries',
  Sun: 'Libra',
  Venus: 'Virgo',
};

export function composeReportSections({
  decisionMemo,
  kundli,
  language = 'en',
  mode,
  reportFocus = 'KUNDLI',
  signatureAnalysis,
}: {
  kundli?: KundliData;
  language?: SupportedLanguage;
  mode: PDFMode;
  decisionMemo?: DecisionMemo;
  reportFocus?: PdfReportFocus;
  signatureAnalysis?: SignatureAnalysisModel;
}): PdfComposition {
  if (!kundli) {
    return composeEmptyReport(mode, language);
  }

  const chartTypes = getReportChartTypes(kundli, mode, reportFocus);
  const chartSnapshots = buildPdfChartSnapshots(kundli, chartTypes, language);
  const sections = buildReportSectionSet(
    kundli,
    chartTypes,
    mode,
    language,
    reportFocus,
    decisionMemo,
    signatureAnalysis,
  );

  const polishedSections = sections.map(section => enrichSection(section, mode));
  const trustProfile = buildTrustProfile({
    evidence: polishedSections.flatMap(section => section.evidence).slice(0, 8),
    kundli,
    language,
    limitations: [
      ...(kundli.rectification?.needsRectification
        ? ['Birth-time rectification is recommended before trusting fine timing.']
        : []),
      'Predictions are evidence-weighted guidance, not guaranteed outcomes.',
    ],
    query: decisionMemo?.question,
    surface: 'report',
  });

  return {
    chartSnapshots,
    cover: {
      metadata: [
        `${kundli.birthDetails.date} at ${kundli.birthDetails.time}`,
        ...(kundli.birthDetails.timeConfidence === 'rectified'
          ? [
              `Rectified time used; original entered time: ${kundli.birthDetails.originalTime ?? 'not recorded'}`,
            ]
          : []),
        ...(kundli.editHistory?.length
          ? [`Edited ${kundli.editHistory.length} time${kundli.editHistory.length === 1 ? '' : 's'}; latest saved details are used`]
          : []),
        kundli.birthDetails.place,
        `${kundli.lagna} Lagna | ${kundli.moonSign} Moon | ${kundli.nakshatra}`,
      ],
      subtitle: `Personal Vedic Astrology Dossier for ${kundli.birthDetails.name}`,
      title: 'PREDICTA',
    },
    dossierVersion: '2.0',
    executiveSummary: localizeExecutiveSummary(
      buildDossierExecutiveSummary(kundli, mode),
      language,
    ),
    footer: 'A Predicta promise by Bhaumik Mehta | Chart-backed Jyotish guidance with clear safety boundaries | © 2026',
    language,
    mode,
    sections: localizeSections(polishedSections, language),
    summary: buildOneLineSummary(kundli),
    trustProfile,
    watermark: 'PREDICTA',
  };
}

function buildDecisionMemoSection(memo: DecisionMemo): PdfSection {
  return {
    body: `${memo.headline}. Predicta treats this as a structured decision memo, not an absolute prediction. The state is ${memo.state}, with area classified as ${memo.area}.`,
    bullets: [
      `Question: ${memo.question}`,
      `Short answer: ${memo.shortAnswer}`,
      `Timing: ${memo.timing}`,
      `Risk: ${memo.risk}`,
      `Next action: ${memo.nextAction}`,
      memo.safetyNote ? `Safety: ${memo.safetyNote}` : '',
    ].filter(Boolean),
    evidence: memo.evidence.map(
      item => `${item.title}: ${item.observation} ${item.interpretation}`,
    ),
    evidenceTable: memo.evidence.map(item => ({
      confidence: item.weight === 'neutral' ? 'medium' : item.weight === 'mixed' ? 'medium' : item.weight === 'supportive' ? 'high' : 'medium',
      factor: item.title,
      implication: item.interpretation,
      observation: item.observation,
    })),
    eyebrow: 'DECISION ORACLE',
    tier: 'premium',
    title: 'Decision memo export',
  };
}

function buildReportSectionSet(
  kundli: KundliData,
  chartTypes: ChartType[],
  mode: PDFMode,
  language: SupportedLanguage,
  reportFocus: PdfReportFocus,
  decisionMemo?: DecisionMemo,
  signatureAnalysis?: SignatureAnalysisModel,
): PdfSection[] {
  const focusSections = buildRoomSpecificReportSections(
    kundli,
    mode,
    reportFocus,
    signatureAnalysis,
  );
  const essentialSections = uniqueReportSections([
    ...focusSections,
    buildExecutiveSummary(kundli, mode),
    buildHolisticReportSynthesisSection(kundli, mode),
    buildBirthAndCalculationSection(kundli),
    buildChartSynthesisSection(kundli, chartTypes, mode, language),
    buildNumerologyReportSection(kundli, mode),
    buildSignatureReportSection(signatureAnalysis, mode),
    buildPlanetaryStrengthSection(kundli, mode),
    buildDashaSection(kundli, mode),
    buildTransitSection(kundli, mode),
    buildRectificationSection(kundli),
    buildGuidanceSection(kundli, mode),
    buildRemedySection(kundli),
    buildLimitationsSection(kundli, mode),
  ]);

  if (mode === 'FREE') {
    return essentialSections;
  }

  return uniqueReportSections([
    ...focusSections,
    buildExecutiveSummary(kundli, mode),
    buildHolisticReportSynthesisSection(kundli, mode),
    buildBirthAndCalculationSection(kundli),
    buildChartSynthesisSection(kundli, chartTypes, mode, language),
    buildBhavChalitSection(kundli, mode),
    buildKpFoundationSection(kundli, mode),
    buildNadiJyotishPlanSection(kundli, mode),
    buildNumerologyReportSection(kundli, mode),
    buildSignatureReportSection(signatureAnalysis, mode),
    buildSignatureNumerologySynthesisSection(kundli, signatureAnalysis),
    buildPlanetaryStrengthSection(kundli, mode),
    buildDashaSection(kundli, mode),
    buildTimelineSection(kundli, mode),
    buildTransitSection(kundli, mode),
    buildYearlyHoroscopeSection(kundli, mode),
    buildRectificationSection(kundli),
    buildAshtakavargaSection(kundli),
    buildYogaSection(kundli, mode),
    buildAdvancedJyotishCoverageSection(kundli, mode),
    buildAreaSection(kundli, 'Career', ['D1', 'D10'], [10, 6, 11], ['Saturn', 'Sun', 'Mercury', 'Jupiter']),
    buildAreaSection(kundli, 'Relationship', ['D1', 'D9'], [7, 2, 11], ['Venus', 'Jupiter', 'Moon']),
    buildAreaSection(kundli, 'Wealth', ['D1', 'D2'], [2, 9, 11], ['Jupiter', 'Venus', 'Mercury']),
    buildAreaSection(kundli, 'Wellbeing', ['D1', 'D30'], [1, 6, 8, 12], ['Moon', 'Saturn', 'Mars']),
    buildAreaSection(kundli, 'Spiritual Practice', ['D1', 'D20'], [9, 12], ['Jupiter', 'Ketu', 'Moon']),
    buildFullJyotishCoverageSection(kundli, mode),
    buildGuidanceSection(kundli, mode),
    ...(decisionMemo ? [buildDecisionMemoSection(decisionMemo)] : []),
    buildRemedySection(kundli),
    buildLimitationsSection(kundli, mode),
  ].filter((section): section is PdfSection => Boolean(section)));
}

function uniqueReportSections(sections: PdfSection[]): PdfSection[] {
  const seen = new Set<string>();

  return sections.filter(section => {
    const key = `${section.eyebrow}:${section.title}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function buildRoomSpecificReportSections(
  kundli: KundliData,
  mode: PDFMode,
  reportFocus: PdfReportFocus,
  signatureAnalysis?: SignatureAnalysisModel,
): PdfSection[] {
  switch (reportFocus) {
    case 'VEDIC':
    case 'KUNDLI':
    case 'CAREER':
    case 'COMPATIBILITY':
    case 'DASHA':
    case 'MARRIAGE':
    case 'REMEDIES':
    case 'SADESATI':
    case 'WEALTH':
      return [buildVedicPredictaReportSection(kundli, mode, reportFocus)];
    case 'KP':
      return [buildKpFoundationSection(kundli, mode)];
    case 'NADI':
      return [buildNadiJyotishPlanSection(kundli, mode)];
    case 'NUMEROLOGY':
      return [buildNumerologyReportSection(kundli, mode)];
    case 'SIGNATURE':
      return [
        buildSignatureReportSection(signatureAnalysis, mode),
        ...(mode === 'PREMIUM'
          ? [buildSignatureNumerologySynthesisSection(kundli, signatureAnalysis)]
          : []),
      ].filter((section): section is PdfSection => Boolean(section));
    default:
      return [buildVedicPredictaReportSection(kundli, mode, 'KUNDLI')];
  }
}

function buildVedicPredictaReportSection(
  kundli: KundliData,
  mode: PDFMode,
  reportFocus: PdfReportFocus,
): PdfSection {
  const dasha = kundli.dasha.current;
  const focusMap: Partial<
    Record<
      PdfReportFocus,
      {
        charts: ChartType[];
        houses: number[];
        planets: string[];
        title: string;
        userOutcome: string;
      }
    >
  > = {
    CAREER: {
      charts: ['D1', 'D10'],
      houses: [6, 10, 11],
      planets: ['Saturn', 'Sun', 'Mercury', 'Jupiter'],
      title: 'Vedic career report proof',
      userOutcome: 'career direction, job timing, public work, and professional pressure',
    },
    COMPATIBILITY: {
      charts: ['D1', 'D9'],
      houses: [2, 7, 11],
      planets: ['Venus', 'Jupiter', 'Moon'],
      title: 'Vedic compatibility report proof',
      userOutcome: 'relationship maturity, compatibility discussion, and family decision support',
    },
    DASHA: {
      charts: ['D1'],
      houses: [1, 5, 9, 10],
      planets: [dasha.mahadasha, dasha.antardasha],
      title: 'Vedic dasha life map proof',
      userOutcome: 'life chapter timing, active periods, and next planning windows',
    },
    KUNDLI: {
      charts: ['D1', 'D9', 'D10'],
      houses: [1, 5, 9, 10],
      planets: [dasha.mahadasha, dasha.antardasha, 'Jupiter', 'Saturn'],
      title: 'Vedic Predicta report proof',
      userOutcome: 'whole-chart understanding without mixing KP, Nadi, Numerology, or Signature methods',
    },
    MARRIAGE: {
      charts: ['D1', 'D9'],
      houses: [2, 7, 11],
      planets: ['Venus', 'Jupiter', 'Moon'],
      title: 'Vedic marriage report proof',
      userOutcome: 'marriage maturity, relationship timing, spouse patterns, and gentle cautions',
    },
    REMEDIES: {
      charts: ['D1'],
      houses: kundli.ashtakavarga.weakestHouses.slice(0, 4) as number[],
      planets: [dasha.mahadasha, dasha.antardasha, 'Saturn', 'Ketu'],
      title: 'Vedic remedy report proof',
      userOutcome: 'karma-based remedies, conduct correction, service, mantra, and weekly practice',
    },
    SADESATI: {
      charts: ['D1'],
      houses: [1, 4, 8, 10, 12],
      planets: ['Saturn', 'Moon'],
      title: 'Vedic Sade Sati report proof',
      userOutcome: 'Saturn pressure, discipline, responsibility, and fear-free planning',
    },
    VEDIC: {
      charts: ['D1', 'D9', 'D10'],
      houses: [1, 5, 9, 10],
      planets: [dasha.mahadasha, dasha.antardasha, 'Jupiter', 'Saturn'],
      title: 'Vedic Predicta report proof',
      userOutcome: 'D1, varga charts, dasha, gochar, remedies, and holistic life balance',
    },
    WEALTH: {
      charts: ['D1', 'D2'],
      houses: [2, 9, 11],
      planets: ['Jupiter', 'Venus', 'Mercury', 'Saturn'],
      title: 'Vedic wealth report proof',
      userOutcome: 'income, savings, gains, discipline, and financial timing',
    },
  };
  const focus = focusMap[reportFocus] ?? focusMap.KUNDLI;
  const chartLines =
    focus?.charts
      .map(chartType => chartSummary(kundli, chartType))
      .filter(Boolean) ?? [];
  const houseLines = (focus?.houses ?? [])
    .slice()
    .sort((first, second) => first - second)
    .map(houseNumber => houseSummary(kundli, houseNumber));
  const planetLines = uniqueValues(focus?.planets ?? [])
    .map(name => findPlanet(kundli, name))
    .filter((planet): planet is PlanetPosition => Boolean(planet))
    .map(planet => planetaryLine(planet));

  return {
    body:
      'This report is prepared inside Vedic Predicta. It uses Parashari Jyotish evidence first: D1, relevant varga charts, dasha, gochar, house strength, safe remedies, and holistic context. KP, Nadi, Numerology, and Signature stay separate unless the user chooses a synthesis.',
    bullets: [
      `Outcome: ${focus?.userOutcome ?? 'whole-chart understanding'}.`,
      `Active timing: ${dasha.mahadasha} Mahadasha and ${dasha.antardasha} Antardasha until ${dasha.endDate}.`,
      ...chartLines.slice(0, mode === 'PREMIUM' ? 5 : 2),
      ...houseLines.slice(0, mode === 'PREMIUM' ? 6 : 3),
      ...planetLines.slice(0, mode === 'PREMIUM' ? 6 : 3),
      mode === 'PREMIUM'
        ? 'Premium Vedic depth adds more varga checks, timing windows, evidence tables, and remedy planning.'
        : 'Free Vedic depth gives a useful chart-backed answer and keeps deeper timing for Premium.',
    ],
    evidence: [
      `Vedic method only: D1/Varga, dasha, gochar, house strength, and remedies.`,
      `Relevant charts: ${(focus?.charts ?? ['D1']).join(', ')}.`,
      `Relevant houses: ${(focus?.houses ?? []).slice().sort((first, second) => first - second).join(', ') || 'whole chart'}.`,
      `Relevant planets: ${uniqueValues(focus?.planets ?? []).join(', ') || 'current dasha lords'}.`,
    ],
    evidenceTable: [
      {
        confidence: 'high',
        factor: 'Method boundary',
        implication: 'The report stays in Vedic Predicta unless the user explicitly chooses another specialist world.',
        observation: 'Parashari D1, varga, dasha, gochar, remedy, and holistic layers are the source of proof.',
      },
      {
        confidence: 'high',
        factor: 'Timing',
        implication: 'The current dasha frames how the report should be read now.',
        observation: `${dasha.mahadasha}/${dasha.antardasha} until ${dasha.endDate}.`,
      },
      {
        confidence: 'medium',
        factor: 'Focus proof',
        implication: focus?.userOutcome ?? 'Whole chart reading remains primary.',
        observation: [
          ...(focus?.charts ?? []).map(chart => `${chart}`),
          ...(focus?.houses ?? []).map(houseNumber => `house ${houseNumber}`),
        ].join(', '),
      },
    ],
    eyebrow: 'VEDIC PREDICTA',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: focus?.title ?? 'Vedic Predicta report proof',
  };
}

function buildBhavChalitSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const foundation = composeChalitBhavKpFoundation(kundli, { depth: mode });
  const bhav = foundation.bhavChalit;
  const targetHouse = (item: (typeof bhav.shifts)[number]) =>
    'chalitHouse' in item ? item.chalitHouse : item.bhavHouse;

  return {
    body:
      'Parashari Chalit is included as a house-delivery refinement layer. It keeps the planet sign from D1 Rashi and shows which bhava receives the planet result. KP cusp/sub-lord judgement is kept separately.',
    bullets: [
      mode === 'PREMIUM'
        ? bhav.premiumSynthesis ?? bhav.freeInsight
        : bhav.freeInsight,
      `Shifted planets included: ${bhav.shifts.length}.`,
      `Cusps included: ${bhav.cusps.length}.`,
      ...bhav.shifts
        .slice(0, mode === 'PREMIUM' ? 9 : 4)
        .map(
          item =>
            `${item.planet}: D1 house ${item.rashiHouse} to Chalit house ${targetHouse(item)}.`,
        ),
    ],
    evidence: bhav.evidence,
    evidenceTable: bhav.shifts.slice(0, mode === 'PREMIUM' ? 9 : 4).map(item => ({
      confidence: 'medium',
      factor: `${item.planet} Chalit shift`,
      implication: `House emphasis moves toward Chalit house ${targetHouse(item)}; sign dignity remains ${item.rashiSign}.`,
      observation: `D1 house ${item.rashiHouse} to Chalit house ${targetHouse(item)}.`,
    })),
    eyebrow: 'CHALIT',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title:
      mode === 'PREMIUM'
        ? 'Parashari Chalit house refinement'
        : 'Chalit useful insight',
  };
}

function buildKpFoundationSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const foundation = composeChalitBhavKpFoundation(kundli, { depth: mode });
  const kp = foundation.kp;

  return {
    body:
      'KP is kept as a separate Krishnamurti Paddhati section. It uses cusps, star lords, sub lords, significators, and ruling planets for event-oriented analysis. It is not blended casually with Parashari chart synthesis.',
    bullets: [
      mode === 'PREMIUM' ? kp.premiumSynthesis ?? kp.freeInsight : kp.freeInsight,
      `KP cusps included: ${kp.cusps.length}.`,
      `KP significators included: ${kp.significators.length}.`,
      kp.rulingPlanets
        ? `Ruling planets: day ${kp.rulingPlanets.dayLord}, Moon star ${kp.rulingPlanets.moonStarLord}, Lagna sub ${kp.rulingPlanets.lagnaSubLord}.`
        : 'Ruling planets pending.',
      ...kp.significators
        .slice(0, mode === 'PREMIUM' ? 9 : 4)
        .map(
          item =>
            `${item.planet}: signifies houses ${item.signifiesHouses.join(', ') || 'pending'} (${item.strength}).`,
        ),
    ],
    evidence: kp.evidence,
    evidenceTable: kp.cusps.slice(0, mode === 'PREMIUM' ? 12 : 4).map(cusp => ({
      confidence: 'medium',
      factor: `KP cusp ${cusp.house}`,
      implication: `Sub lord ${cusp.lordChain.subLord} becomes important for house ${cusp.house} event judgment.`,
      observation: `${cusp.sign} ${cusp.degree.toFixed(2)}°, star lord ${cusp.lordChain.starLord}, sub lord ${cusp.lordChain.subLord}.`,
    })),
    eyebrow: 'KP PREDICTA',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title:
      mode === 'PREMIUM'
        ? 'KP horoscope cusp and significator foundation'
        : 'KP horoscope useful insight',
  };
}

function composeEmptyReport(mode: PDFMode, language: SupportedLanguage): PdfComposition {
  return {
    chartSnapshots: [],
    cover: {
      metadata: ['Generate a kundli to unlock chart-derived synthesis'],
      subtitle: 'Personal Vedic Astrology Dossier',
      title: 'PREDICTA',
    },
    dossierVersion: '2.0',
    executiveSummary: localizeExecutiveSummary({
      confidence: 'low',
      headline: 'Generate a kundli to unlock a real intelligence dossier.',
      keySignals: [
        'All available charts, dasha, transits, remedies, and confidence labels appear after calculation.',
      ],
    }, language),
    footer: 'A Predicta promise by Bhaumik Mehta | Chart-backed Jyotish guidance with clear safety boundaries | © 2026',
    language,
    mode,
    sections: [
      {
        body: 'A report generated without kundli data can only show the structure. Once a calculated kundli is active, every section is composed from planets, houses, divisional charts, dasha, yogas, and ashtakavarga.',
        bullets: [
          'Free reports include an essential chart-backed reading with useful, simple insight.',
          'Premium reports add complete chart coverage, detailed synthesis, timing, remedies, and evidence tables.',
        ],
        evidence: ['No kundli is active in this preview.'],
        confidence: 'low',
        evidenceTable: [
          {
            confidence: 'low',
            factor: 'Kundli details',
            implication: 'Create a Kundli before reading report conclusions.',
            observation: 'No chart data is active.',
          },
        ],
        eyebrow: 'REPORT STRUCTURE',
        tier: 'free',
        title: 'Chart-derived report preview',
      },
    ],
    summary: 'Create a Kundli before report synthesis.',
    trustProfile: buildTrustProfile({
      evidence: [],
      language,
      limitations: ['No kundli is active, so Predicta cannot produce chart-backed conclusions.'],
      surface: 'report',
    }),
    watermark: 'PREDICTA',
  };
}

function buildDossierExecutiveSummary(
  kundli: KundliData,
  mode: PDFMode,
): PdfComposition['executiveSummary'] {
  const current = kundli.dasha.current;
  const confidence = kundli.rectification?.needsRectification
    ? 'medium'
    : kundli.birthDetails.isTimeApproximate
      ? 'medium'
      : 'high';

  return {
    confidence,
    headline: `${kundli.birthDetails.name} is in a ${current.mahadasha}/${current.antardasha} operating cycle with strongest support in houses ${kundli.ashtakavarga.strongestHouses.slice(0, 3).join(', ')}.`,
    keySignals: [
      `${kundli.lagna} Lagna, ${kundli.moonSign} Moon, ${kundli.nakshatra} nakshatra.`,
      `Correction zones: houses ${kundli.ashtakavarga.weakestHouses.slice(0, 3).join(', ')}.`,
      `Holistic spine: daily rhythm, life balance, timing, and karma-based remedy are synthesized before area reports.`,
      `${mode === 'PREMIUM' ? 'Premium dossier includes detailed area intelligence, evidence tables, timing, and remedies.' : 'Free dossier includes essential chart-backed insight and honest limits.'}`,
    ],
  };
}

function enrichSection(section: PdfSection, mode: PDFMode): PdfSection {
  const premiumOnly = [
    'Decision memo export',
  ].includes(section.title);
  const tier = section.tier ?? (premiumOnly ? 'premium' : 'free');

  return {
    ...section,
    confidence: section.confidence ?? inferSectionConfidence(section),
    evidenceTable:
      section.evidenceTable ??
      section.evidence.slice(0, mode === 'PREMIUM' ? 6 : 3).map(item => ({
        confidence: inferSectionConfidence(section),
        factor: section.eyebrow,
        implication: item,
        observation: item,
      })),
    tier,
  };
}

function inferSectionConfidence(section: PdfSection): 'low' | 'medium' | 'high' {
  const text = `${section.body} ${section.bullets.join(' ')} ${section.evidence.join(' ')}`.toLowerCase();

  if (text.includes('missing') || text.includes('not available') || text.includes('approximate')) {
    return 'medium';
  }

  if (text.includes('no kundli') || text.includes('pending')) {
    return 'low';
  }

  return 'high';
}

function buildExecutiveSummary(kundli: KundliData, mode: PDFMode): PdfSection {
  const current = kundli.dasha.current;
  const strongest = kundli.ashtakavarga.strongestHouses.join(', ');
  const weakest = kundli.ashtakavarga.weakestHouses.join(', ');
  const moonRhythm = buildKundliMoonNakshatraPadaInsight(kundli);

  return {
    body: `${kundli.birthDetails.name}'s report begins with ${kundli.lagna} Lagna, ${kundli.moonSign} Moon, ${kundli.nakshatra} nakshatra, and ${moonRhythm.moonPhaseLabel}. The active timing is ${current.mahadasha} Mahadasha with ${current.antardasha} Antardasha, so the report reads both the natal promise and the period currently delivering results.`,
    bullets: [
      `Strongest ashtakavarga support: houses ${strongest}.`,
      `Correction zones: houses ${weakest}.`,
      `Moon rhythm: ${moonRhythm.summary}`,
      `${mode === 'PREMIUM' ? 'Premium mode adds detailed synthesis, timing windows, remedies, and evidence tables.' : 'Free mode gives the essential chart-backed reading without the full deep report.'}`,
    ],
    evidence: [
      `Lagna: ${kundli.lagna}`,
      `Moon: ${kundli.moonSign}, ${kundli.nakshatra}${moonRhythm.pada ? ` pada ${moonRhythm.pada}` : ''}, ${moonRhythm.moonPhaseLabel}`,
      `Current dasha: ${current.mahadasha}/${current.antardasha}`,
    ],
    evidenceTable: [
      {
        confidence: 'high',
        factor: 'Identity spine',
        implication: 'Use Lagna and Moon together before area-specific advice.',
        observation: `${kundli.lagna} Lagna with ${kundli.moonSign} Moon.`,
      },
      {
        confidence: 'high',
        factor: 'Timing layer',
        implication: 'Current period should frame decisions and report priorities.',
        observation: `${current.mahadasha}/${current.antardasha} until ${current.endDate}.`,
      },
      {
        confidence: 'high',
        factor: 'Strength distribution',
        implication: 'Support and correction zones are explicitly separated.',
        observation: `Strong houses ${strongest}; care houses ${weakest}.`,
      },
    ],
    eyebrow: 'SYNTHESIS',
    tier: 'free',
    title: 'Executive summary',
  };
}

function buildHolisticReportSynthesisSection(
  kundli: KundliData,
  mode: PDFMode,
): PdfSection {
  const daily = composeHolisticDailyGuidance(kundli);
  const panchang = composePersonalPanchangLayer(kundli);
  const purushartha = composePurusharthaLifeBalance(kundli);
  const sadhana = composeSadhanaRemedyPath(kundli);
  const rooms = composeHolisticReadingRooms(kundli);
  const featuredRoom = rooms.featuredRoom;
  const activeStage =
    sadhana.stages.find(stage => stage.status === 'active' || stage.status === 'review') ??
    sadhana.stages[0] ??
    {
      cadence: 'Daily',
      caution: 'Keep the practice simple and safe.',
      completionTarget: 'Do one clean action today.',
      id: 'conduct' as const,
      label: 'Conduct',
      practice: 'Correct one behavior before adding any ritual.',
      sequence: 1,
      status: 'active' as const,
      whyItWorks: 'Daily conduct keeps remedies grounded.',
    };
  const reportDepth =
    mode === 'PREMIUM'
      ? 'Premium turns this into a full report spine: daily rhythm, life aim balance, timing room, sadhana path, remedy tracking, and evidence rows.'
      : 'Free gives the useful spine first: what today asks, which life aim is active, and what practice keeps the reading grounded.';

  return {
    body:
      'This section joins the report into one human reading. Predicta reads the chart through today, life balance, timing, and karma-based remedy before moving into detailed chart sections.',
    bullets: [
      daily.headline,
      `Daily rhythm: morning - ${daily.morningPractice}; midday - ${daily.middayCheck}; evening - ${daily.eveningReview}`,
      `Life balance: ${purushartha.dominant.label} leads now; ${purushartha.needsCare.label} needs steadier care.`,
      `Personal Panchang: ${panchang.weekdayLord} day, ${panchang.tithi}, Moon rhythm ${panchang.moonNakshatra}.`,
      `Sadhana: ${activeStage.label} - ${activeStage.practice}`,
      `Featured room: ${featuredRoom.title} - ${featuredRoom.primaryFocus}`,
      `Remedy direction: ${daily.remedy}`,
      reportDepth,
    ],
    decisionWindows: [
      {
        confidence: 'medium',
        evidence: daily.evidence.slice(0, 3),
        guidance: daily.bestAction,
        label: 'Today action',
        window: daily.date,
      },
      {
        confidence: 'medium',
        evidence: purushartha.dominant.chartEvidence.slice(0, 3),
        guidance: purushartha.dominant.practicalGuidance,
        label: `${purushartha.dominant.label} focus`,
        window: 'Current chart emphasis',
      },
      ...(mode === 'PREMIUM'
        ? [
            {
              confidence: 'medium' as const,
              evidence: featuredRoom.evidence.slice(0, 3),
              guidance: featuredRoom.practice,
              label: featuredRoom.title,
              window: 'Report practice window',
            },
          ]
        : []),
    ],
    evidence: [
      ...daily.evidence.slice(0, 4),
      ...purushartha.dominant.chartEvidence.slice(0, 2),
      ...featuredRoom.evidence.slice(0, 2),
      sadhana.planetReason,
      ...daily.guardrails.slice(0, 2),
    ],
    evidenceTable: [
      {
        confidence: 'medium',
        factor: 'Daily rhythm',
        implication: daily.bestAction,
        observation: daily.headline,
      },
      {
        confidence: 'high',
        factor: 'Purushartha balance',
        implication: purushartha.dominant.practicalGuidance,
        observation: `${purushartha.dominant.label} ${purushartha.dominant.score}%; ${purushartha.needsCare.label} ${purushartha.needsCare.score}%.`,
      },
      {
        confidence: 'medium',
        factor: 'Panchang',
        implication: panchang.personalRemedy,
        observation: `${panchang.weekday}, ${panchang.weekdayLord}, ${panchang.tithi}, ${panchang.moonNakshatra}.`,
      },
      {
        confidence: 'medium',
        factor: 'Sadhana path',
        implication: activeStage.practice,
        observation: `${activeStage.label}: ${activeStage.cadence}; ${activeStage.completionTarget}`,
      },
      ...(mode === 'PREMIUM'
        ? [
            {
              confidence: 'medium' as const,
              factor: featuredRoom.title,
              implication: featuredRoom.remedy,
              observation: featuredRoom.proofChips.join(', '),
            },
          ]
        : []),
    ],
    eyebrow: 'HOLISTIC SYNTHESIS',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title:
      mode === 'PREMIUM'
        ? 'Holistic report synthesis'
        : 'Holistic useful report spine',
  };
}

function buildBirthAndCalculationSection(kundli: KundliData): PdfSection {
  return {
    body: 'This report uses the stored birth details and a consistent Vedic calculation method. This matters because Vedic readings are sensitive to birth time, place, ayanamsa, and how Rahu-Ketu are treated.',
    bullets: [
      `Name: ${kundli.birthDetails.name}`,
      `Birth: ${kundli.birthDetails.date} at ${kundli.birthDetails.time}`,
      ...(kundli.birthDetails.timeConfidence === 'rectified'
        ? [
            `Birth time status: rectified probable time. Original entered time: ${kundli.birthDetails.originalTime ?? 'not recorded'}.`,
          ]
        : []),
      ...(kundli.editHistory?.length
        ? [
            `Edit history: latest change was ${kundli.editHistory[0]?.fieldsChanged.join(', ') || 'birth details'} on ${formatPdfDate(kundli.editHistory[0]?.editedAt ?? '')}. Earlier details are retained for reference.`,
          ]
        : []),
      `Place: ${kundli.birthDetails.place}`,
      `Timezone: ${kundli.birthDetails.timezone}`,
      `Chart method: ${kundli.calculationMeta.ayanamsa}; houses: ${kundli.calculationMeta.houseSystem}; Rahu-Ketu: ${kundli.calculationMeta.nodeType}`,
    ],
    evidence: [
      `Birth time was converted for the selected place and timezone.`,
      `The same calculation method is used across chart, chat, and report.`,
    ],
    eyebrow: 'FOUNDATION',
    title: 'Birth and calculation foundation',
  };
}

function buildChartSynthesisSection(
  kundli: KundliData,
  chartTypes: ChartType[],
  mode: PDFMode,
  language: SupportedLanguage = 'en',
): PdfSection {
  const hasPremiumAccess = mode === 'PREMIUM';
  const chartSnapshots = buildPdfChartSnapshots(kundli, chartTypes, language);
  const supported = chartTypes.flatMap(chartType => {
    const chart = kundli.charts[chartType];
    if (!chart) {
      return [`${chartType}: this chart is not part of this Kundli report.`];
    }
    const insight = composeChartInsight({ chart, hasPremiumAccess, kundli });
    const snapshot = chartSnapshots.find(item => item.chartType === chartType);

    return buildReportChartNarrative({
      chartType,
      hasPremiumAccess,
      insight,
      snapshot,
    });
  });
  const unsupported = chartTypes
    .filter(chartType => kundli.charts[chartType] && !kundli.charts[chartType].supported)
    .map(
      chartType =>
        `${chartType}: ${
          kundli.charts[chartType].unsupportedReason ??
          'Predicta is still reviewing this chart before using it for guidance.'
        }`,
    );

  return {
    body: mode === 'PREMIUM'
      ? 'Every chart now opens with human meaning first. Premium then adds timing windows, contradictions, cross-chart synthesis, remedies, and a technical appendix without making the reading feel mechanical.'
      : 'Free report explains what each chart is trying to say in life before it drops into proof. The user gets real understanding first, not a wall of astrological mechanics.',
    bullets: supported,
    evidence: [
      `Charts included in this report: ${chartTypes.join(', ')}.`,
      `Technical appendix uses the same North Indian chart model used in the app: ${chartSnapshots.map(item => item.chartType).join(', ') || 'none'}.`,
      `Chart themes included: ${uniqueValues(chartSnapshots.map(item => item.theme)).join(', ') || 'none'}.`,
      unsupported.length
        ? `Charts still in careful-reading mode: ${unsupported.join(' ')}`
        : 'All charts present in this Kundli are supported.',
    ],
    eyebrow: 'CHART SYNTHESIS',
    title: mode === 'PREMIUM'
      ? 'What the charts are saying with premium depth'
      : 'What the charts are saying',
  };
}

function buildReportChartNarrative({
  chartType,
  hasPremiumAccess,
  insight,
  snapshot,
}: {
  chartType: ChartType;
  hasPremiumAccess: boolean;
  insight: ReturnType<typeof composeChartInsight>;
  snapshot?: PdfChartSnapshot;
}): string[] {
  const freeLine = `Free understanding: ${insight.currentGuidance}`;
  const premiumLine = hasPremiumAccess
    ? insight.premiumInsight
      ? `Premium depth: ${insight.premiumInsight.headline}`
      : `Premium depth: ${insight.premiumDeepDive[0] ?? 'Premium adds timing, contradiction handling, and deeper synthesis.'}`
    : undefined;

  const timingLine = hasPremiumAccess
    ? insight.premiumInsight?.timingWindows[0]
    : insight.freeInsights[0];
  const appendixLine = snapshot
    ? `Technical appendix: ${formatSnapshotOccupiedHouses(snapshot)}`
    : `${chartType} technical appendix appears after chart preparation.`;
  const moonLine = snapshot?.moonNakshatraPada
    ? `${chartType} Moon rhythm: ${snapshot.moonNakshatraPada.moonPhaseLabel}; birth star ${snapshot.moonNakshatraPada.moonNakshatra}${
        snapshot.moonNakshatraPada.pada
          ? ` pada ${snapshot.moonNakshatraPada.pada}`
          : ''
      }.`
    : undefined;

  return [
    `${chartType} ${insight.title} governs: ${insight.governs}`,
    `${chartType} is saying: ${insight.whatItSays}`,
    `${chartType} key insight: ${insight.mainStrength}`,
    freeLine,
    ...(premiumLine ? [premiumLine] : []),
    ...(timingLine ? [`${chartType} timing or next step: ${timingLine}`] : []),
    appendixLine,
    ...(moonLine ? [moonLine] : []),
  ];
}

function buildPdfChartSnapshots(
  kundli: KundliData,
  chartTypes: ChartType[],
  language: SupportedLanguage = 'en',
): PdfChartSnapshot[] {
  return chartTypes.flatMap(chartType => {
    const chart = kundli.charts[chartType];

    if (!chart?.supported) {
      return [];
    }

    const model = buildChartRenderModel({
      birthDetails: kundli.birthDetails,
      chart,
      language,
      presentation: 'report',
    });

    return [
      {
        cells: model.cells.map(cell => ({
          house: cell.house,
          hiddenPlanetCount: cell.hiddenPlanetCount,
          labelDensity: cell.labelDensity,
          maxVisiblePlanets: cell.maxVisiblePlanets,
          planetGlyphSize: cell.planetGlyphSize,
          planets: cell.renderPlanets.map(planet => ({
            ...planet,
            degreeLabel: planet.degreeLabel,
            displayName: planet.displayName,
            status: planet.status,
          })),
          displaySign: cell.displaySign,
          displaySignShort: cell.displaySignShort,
          sign: cell.sign,
          signGlyph: cell.signGlyph,
          signNumber: cell.signNumber,
          showPlanetDegrees: cell.showPlanetDegrees,
          showPlanetSign: cell.showPlanetSign,
          showPlanetStatusMarks: cell.showPlanetStatusMarks,
        })),
        chartName: model.chartName,
        displayChartName: model.displayChartName,
        chartType: model.chartType,
        legend: model.legend,
        moonNakshatraPada: model.moonNakshatraPada
          ? {
              moonNakshatra: model.moonNakshatraPada.moonNakshatra,
              moonPhaseLabel: model.moonNakshatraPada.moonPhaseLabel,
              pada: model.moonNakshatraPada.pada,
              padaMeaning: model.moonNakshatraPada.padaMeaning,
            }
          : undefined,
        moonPhase: model.moonPhase,
        school: model.school,
        theme: model.theme,
      },
    ];
  });
}

function formatSnapshotOccupiedHouses(snapshot: PdfChartSnapshot): string {
  const occupied = snapshot.cells
    .filter(cell => cell.planets.length)
    .map(
      cell =>
        `house ${cell.house ?? '-'} sign ${cell.signNumber} ${cell.sign}: ${cell.planets
          .map(planet => formatSnapshotPlanet(planet))
          .join(', ')}`,
    );

  return occupied.length ? occupied.join('; ') : 'no occupied houses shown';
}

function formatSnapshotPlanet(
  planet: PdfChartSnapshotCell['planets'][number],
): string {
  const status = [
    planet.status.retrograde ? 'R' : '',
    planet.status.exalted ? 'E' : '',
    planet.status.debilitated ? 'D' : '',
    planet.status.combust ? 'C' : '',
  ]
    .filter(Boolean)
    .join('');

  return `${planet.displayName ?? planet.name} ${planet.degreeLabel}${status ? ` ${status}` : ''}`;
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildPlanetaryStrengthSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const classicalPlanets = kundli.planets.filter(
    planet => !planet.kind || planet.kind === 'classical',
  );
  const refinements = kundli.planets.filter(
    planet => planet.kind && planet.kind !== 'classical',
  );
  const planets =
    mode === 'PREMIUM'
      ? [...classicalPlanets, ...refinements]
      : classicalPlanets.slice(0, 7);
  const bullets = planets.map(planet => {
    const dignity = planetDignity(planet);
    const refinement =
      planet.kind && planet.kind !== 'classical'
        ? ` ${planet.simpleMeaning ?? 'Use as a supporting refinement, not the main judgement.'}`
        : '';
    return `${planet.name}: ${planet.sign} house ${planet.house}, ${planet.nakshatra} pada ${planet.pada}, ${dignity}${planet.retrograde ? ', retrograde' : ''}.${refinement}`;
  });

  return {
    body: mode === 'PREMIUM'
      ? 'Planetary strength is read through sign, house, nakshatra, dignity, and retrogression. Premium reports also include modern outer planets and sensitive Jyotish points as supporting refinements, while keeping classical planets as the main judgement.'
      : 'Planetary strength is read through sign, house, nakshatra, dignity, and retrogression. Free reports keep this section focused on the main classical planets.',
    bullets,
    evidence: [
      `Supportive dignity count: ${planets.filter(planet => ['exalted', 'own sign'].includes(planetDignity(planet))).length}`,
      `Challenging dignity count: ${planets.filter(planet => planetDignity(planet) === 'debilitated').length}`,
      `Supporting refinement points included: ${mode === 'PREMIUM' ? refinements.length : 0}`,
    ],
    eyebrow: 'PLANETS',
    title: 'Planetary condition and strength',
  };
}

function buildDashaSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const intelligence = composeMahadashaIntelligence(kundli, { depth: mode });
  const current = intelligence.current;
  const windows = intelligence.timingWindows.slice(
    0,
    mode === 'PREMIUM' ? 5 : 2,
  );
  const bullets =
    mode === 'PREMIUM'
      ? [
          current.simpleMeaning,
          current.premiumSynthesis ?? current.freeInsight,
          ...intelligence.antardashas
            .filter(item => item.status === 'current' || item.status === 'upcoming')
            .slice(0, 5)
            .map(item => `${item.title}: ${item.timing} - ${item.theme}`),
          ...intelligence.pratyantardashas
            .filter(item => item.status === 'current' || item.status === 'upcoming')
            .slice(0, 3)
            .map(item => `${item.title}: ${item.timing} - ${item.practicalGuidance}`),
        ]
      : [
          current.simpleMeaning,
          current.freeInsight,
          ...intelligence.antardashas
            .filter(item => item.status === 'current' || item.status === 'upcoming')
            .slice(0, 2)
            .map(item => `${item.title}: ${item.timing} - ${item.practicalGuidance}`),
        ];

  return {
    body: `${current.mahadasha}/${current.antardasha} is the active timing chapter from ${current.startDate} to ${current.endDate}. Free reports include useful dasha insight; Premium reports expand the same chart proof into Antardasha, Pratyantardasha, remedies, and timing windows.`,
    bullets,
    evidence: [
      `Current period: ${current.mahadasha}/${current.antardasha}`,
      `Mahadasha evidence factors included: ${current.evidence.length}`,
      `Timing windows included: ${windows.length}`,
    ],
    decisionWindows: windows.map(item => ({
      confidence: current.confidence,
      evidence: item.evidence.slice(0, 3).map(evidence => evidence.observation),
      guidance: item.practicalGuidance,
      label: item.title,
      window: item.timing,
    })),
    eyebrow: 'TIMING',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title:
      mode === 'PREMIUM'
        ? 'Mahadasha intelligence and sub-period timing'
        : 'Current dasha and useful timing insight',
  };
}

function buildTimelineSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const events = (kundli.lifeTimeline ?? []).slice(0, mode === 'PREMIUM' ? 10 : 5);

  return {
    body: 'The timeline joins dasha periods, important transits, rectification notes, and remedy practices into one planning view.',
    bullets: events.length
      ? events.map(event => `${event.title}: ${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''} - ${event.summary}`)
      : ['Timeline insights will appear once Predicta prepares this layer from the saved birth profile.'],
    evidence: [`Timeline events included: ${events.length}.`],
    decisionWindows: events.slice(0, mode === 'PREMIUM' ? 5 : 2).map(event => ({
      confidence: event.confidence,
      evidence: [
        event.planets.length ? `Planets: ${event.planets.join(', ')}.` : 'No linked planet list.',
        event.houses.length ? `Houses: ${event.houses.join(', ')}.` : 'No linked house list.',
      ],
      guidance: event.kind === 'rectification'
        ? 'Avoid fine timing until confidence improves.'
        : 'Use this as a planning window, then verify through dasha and practical constraints.',
      label: event.title,
      window: `${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''}`,
    })),
    eyebrow: 'TIMELINE',
    title: 'Life timeline and planning windows',
  };
}

function buildTransitSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const transits = (kundli.transits ?? []).slice(0, mode === 'PREMIUM' ? 10 : 5);
  const sadeSati = composeSadeSatiIntelligence(kundli, { depth: mode });
  const gochar = composeTransitGocharIntelligence(kundli, { depth: mode });
  const sadeSatiBullets =
    mode === 'PREMIUM'
      ? [
          `${sadeSati.phaseLabel}: ${sadeSati.summary}`,
          sadeSati.premiumSynthesis ?? sadeSati.freeInsight,
          ...sadeSati.windows
            .filter(item => item.status === 'current' || item.status === 'upcoming')
            .slice(0, 3)
            .map(
              item =>
                `${item.title}: ${formatPdfDate(item.startDate)} to ${formatPdfDate(item.endDate)} - ${item.guidance}`,
            ),
        ]
      : [
          `${sadeSati.phaseLabel}: ${sadeSati.freeInsight}`,
          `Saturn from Moon: house ${sadeSati.houseFromMoon}; Saturn from Lagna: house ${sadeSati.houseFromLagna}.`,
        ];

  return {
    body: 'Transit insights compare current planetary movement from both Lagna and Moon. Sade Sati is included here because Saturn must be read from Moon sign before turning pressure into practical guidance.',
    bullets: transits.length
      ? [
          gochar.snapshotSummary,
          gochar.dashaOverlay,
          ...sadeSatiBullets,
          ...gochar.monthlyCards
            .slice(0, mode === 'PREMIUM' ? 6 : 2)
            .map(
              card =>
                `${card.monthLabel}: ${card.title} - ${card.guidance}`,
            ),
          ...transits.map(
            transit =>
              `${transit.planet} in ${transit.sign} house ${transit.houseFromLagna} from Lagna and ${transit.houseFromMoon} from Moon: ${transit.summary}`,
          ),
        ]
      : ['Transit insights will appear once Predicta prepares this layer from the saved birth profile.'],
    evidence: [
      `Gochar tone: ${gochar.dominantWeight}; current transit insights: ${gochar.planetInsights.length}.`,
      `Sade Sati status: ${sadeSati.phaseLabel}; active: ${sadeSati.active ? 'yes' : 'no'}.`,
      transits[0]?.calculatedAt
        ? `Transits calculated at ${transits[0].calculatedAt}.`
        : 'No transit timestamp available.',
    ],
    decisionWindows: transits.slice(0, mode === 'PREMIUM' ? 5 : 2).map(transit => ({
      confidence: transit.weight === 'supportive' ? 'high' : transit.weight === 'mixed' ? 'medium' : 'medium',
      evidence: [
        `${transit.planet} in ${transit.sign}.`,
        `House ${transit.houseFromLagna} from Lagna and ${transit.houseFromMoon} from Moon.`,
      ],
      guidance: transit.weight === 'supportive'
        ? 'Use this weather for visible progress, asks, and repair.'
        : 'Keep decisions slower and confirm facts before acting.',
      label: `${transit.planet} ${transit.weight} transit`,
      window: transit.calculatedAt,
    })),
    eyebrow: 'TRANSITS',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: 'Current transit weather and Sade Sati',
  };
}

function buildYearlyHoroscopeSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const yearly = composeYearlyHoroscopeVarshaphal(kundli, { depth: mode });
  const signalBullets = [
    ...yearly.supportSignals.slice(0, mode === 'PREMIUM' ? 4 : 2),
    ...yearly.cautionSignals.slice(0, mode === 'PREMIUM' ? 4 : 1),
  ].map(signal => `${signal.title}: ${signal.interpretation}`);

  return {
    body:
      'Yearly horoscope uses the annual solar-return map as a one-year planning layer. Predicta reads it with D1, dasha, and Gochar so the year does not become a generic sun-sign forecast.',
    bullets: [
      `Solar year ${yearly.yearLabel}: ${formatPdfDate(yearly.solarYearStart)} to ${formatPdfDate(yearly.solarYearEnd)}.`,
      `Varsha Lagna: ${yearly.varshaLagna}. Muntha: house ${yearly.munthaHouse} in ${yearly.munthaSign}, ruled by ${yearly.munthaLord}.`,
      yearly.freeInsight,
      ...(mode === 'PREMIUM' && yearly.premiumSynthesis
        ? [yearly.premiumSynthesis]
        : []),
      ...signalBullets,
      ...yearly.monthlyCards
        .slice(0, mode === 'PREMIUM' ? 6 : 2)
        .map(card => `${card.monthLabel}: ${card.title} - ${card.guidance}`),
    ],
    decisionWindows: yearly.monthlyCards
      .slice(0, mode === 'PREMIUM' ? 6 : 2)
      .map(card => ({
        confidence: card.confidence,
        evidence: [
          `Focus areas: ${card.focusAreas.join(', ')}.`,
          yearly.dashaOverlay,
        ],
        guidance: card.guidance,
        label: card.title,
        window: card.monthLabel,
      })),
    evidence: [
      `Varsha Lagna: ${yearly.varshaLagna}.`,
      `Muntha: house ${yearly.munthaHouse}, sign ${yearly.munthaSign}, lord ${yearly.munthaLord}.`,
      yearly.gocharOverlay,
      ...yearly.limitations.slice(0, 2),
    ],
    eyebrow: 'YEARLY',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: 'Yearly horoscope and Varshaphal',
  };
}

function buildRectificationSection(kundli: KundliData): PdfSection {
  const rectification = kundli.rectification;

  return {
    body: rectification?.needsRectification
      ? 'Birth time rectification is recommended before relying heavily on fine house timing or divisional chart micro-judgments.'
      : 'Birth time looks stable enough for standard report synthesis, while still deserving normal verification.',
    bullets: [
      ...(rectification?.reasons ?? ['Birth-time confidence details were not included with this Kundli.']),
      ...(rectification?.questions ?? []).map(question => `Check: ${question}`),
      rectification?.needsRectification
        ? 'Use broad D1 themes and dasha chapters with confidence. Keep D9/D10 fine timing conservative.'
        : 'D1 and core divisional synthesis can be read normally. Exact event dates still need caution.',
    ],
    evidence: rectification
      ? [
          `Ascendant degree: ${rectification.ascendantDegree}.`,
          `Rectification confidence: ${rectification.confidence}.`,
        ]
      : ['Birth-time confidence details were not included with this Kundli.'],
    confidence: rectification?.confidence ?? 'medium',
    evidenceTable: [
      {
        confidence: rectification?.confidence ?? 'medium',
        factor: 'Birth time confidence',
        implication: rectification?.needsRectification
          ? 'Fine divisional timing should stay conservative.'
          : 'Broad D1 and core divisional synthesis can be used normally.',
        observation: rectification
          ? `Needs rectification: ${rectification.needsRectification ? 'yes' : 'no'}; ascendant degree ${rectification.ascendantDegree}.`
          : 'Birth-time confidence details were not included with this Kundli.',
      },
    ],
    eyebrow: 'RECTIFICATION',
    title: 'Birth time confidence',
  };
}

function buildAshtakavargaSection(kundli: KundliData): PdfSection {
  const strongest = kundli.ashtakavarga.strongestHouses;
  const weakest = kundli.ashtakavarga.weakestHouses;

  return {
    body: 'Ashtakavarga is used as a strength distribution layer. It does not replace chart judgment, but it helps separate areas where repeated effort receives support from areas requiring more disciplined correction.',
    bullets: [
      `Total SAV bindus: ${kundli.ashtakavarga.totalScore}.`,
      `Strongest houses: ${strongest.join(', ')}.`,
      `Weakest houses: ${weakest.join(', ')}.`,
      `Highest sign scores: ${rankSav(kundli).slice(0, 3).join('; ')}.`,
    ],
    evidence: [
      `BAV/SAV available for ${Object.keys(kundli.ashtakavarga.bav).join(', ')}.`,
    ],
    eyebrow: 'ASHTAKAVARGA',
    title: 'Strength distribution',
  };
}

function buildYogaSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const yogas = kundli.yogas.slice(0, mode === 'PREMIUM' ? kundli.yogas.length : 3);

  return {
    body: 'Yogas are included as interpreted patterns, not as isolated labels. Their practical value depends on strength, house context, and current dasha activation.',
    bullets: yogas.map(yoga => `${yoga.name} (${yoga.strength}): ${yoga.meaning}`),
    evidence: [`Yoga patterns included: ${yogas.length}.`],
    eyebrow: 'YOGAS',
    title: 'Recognized chart patterns',
  };
}

function buildAdvancedJyotishCoverageSection(
  kundli: KundliData,
  mode: PDFMode,
): PdfSection {
  const coverage = composeAdvancedJyotishCoverage(kundli, { depth: mode });
  const patterns = coverage.yogaDoshaInsights
    .slice(0, mode === 'PREMIUM' ? 8 : 4)
    .map(item => `${item.name} (${item.strength}): ${item.summary}`);
  const ashtaka = coverage.ashtakavargaDetail
    .slice(0, mode === 'PREMIUM' ? 12 : 4)
    .map(item => `House ${item.house}: ${item.score} bindus, ${item.tone} - ${item.guidance}`);
  const subtlePoints = coverage.microPointIntelligence?.points
    .slice(0, mode === 'PREMIUM' ? 10 : 3)
    .map(
      point =>
        `${point.name}: house ${point.house}, ${point.sign}, ${point.nakshatra} pada ${point.pada} - ${point.simpleMeaning ?? point.howToUse}`,
    ) ?? [];

  return {
    body:
      mode === 'PREMIUM'
        ? 'Advanced coverage keeps every major Jyotish feature available while turning deeper chart details into useful synthesis, tables, and planning guidance.'
        : 'Advanced coverage is generous in free mode: you see the major Jyotish areas with simple insight, while detailed scoring and tables stay in Premium.',
    bullets: [
      `Modules covered: ${coverage.moduleRegistry.map(item => item.simpleName).join(', ')}.`,
      `Nakshatra: ${coverage.nakshatraInsight.moonNakshatra} pada ${coverage.nakshatraInsight.pada}, lord ${coverage.nakshatraInsight.lord}.`,
      coverage.nakshatraInsight.simpleInsight,
      `Subtle point rule: ${coverage.microPointIntelligence?.rule ?? 'Classical planets remain primary.'}`,
      ...subtlePoints,
      ...patterns,
      ...ashtaka,
      `Panchang/Muhurta: ${coverage.panchangMuhurta.simpleGuidance}`,
      `Compatibility: ${coverage.compatibility.summary}`,
      `Prashna: ${coverage.prashna.summary}`,
      ...coverage.safeRemedies.slice(0, mode === 'PREMIUM' ? 3 : 2),
    ],
    evidence: [
      coverage.freePolicy,
      coverage.premiumPolicy,
      coverage.microPointIntelligence?.freePolicy ?? 'Subtle points stay supportive.',
      ...coverage.limitations,
    ],
    eyebrow: 'ADVANCED',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: 'Advanced Jyotish coverage',
  };
}

function buildNadiJyotishPlanSection(
  kundli: KundliData,
  mode: PDFMode,
): PdfSection {
  const plan = composeNadiJyotishPlan(kundli, { depth: mode });
  const patterns = plan.patterns
    .slice(0, mode === 'PREMIUM' ? 8 : 3)
    .map(pattern =>
      mode === 'PREMIUM' && pattern.premiumDetail
        ? `${pattern.title}: ${pattern.premiumDetail}`
        : `${pattern.title}: ${pattern.freeInsight}`,
    );
  const activations = plan.activations
    .slice(0, mode === 'PREMIUM' ? 5 : 2)
    .map(item => `${item.title}: ${item.trigger}. ${item.guidance}`);

  return {
    body:
      mode === 'PREMIUM'
        ? 'Premium Nadi stays in its own reading lane: planetary story links, karaka themes, validation questions, and timing activations. It does not claim palm-leaf manuscript access.'
        : 'Free reports include the Nadi reading room and useful preview, while full Nadi-style sequencing, validation depth, and timing activation stay Premium.',
    bullets: [
      plan.schoolBoundary,
      plan.methodSummary,
      plan.freePreview,
      ...patterns,
      ...activations,
      ...plan.validationQuestions.slice(0, mode === 'PREMIUM' ? 4 : 2),
    ],
    evidence: [
      ...plan.guardrails,
      ...plan.limitations,
      plan.premiumUnlock,
    ],
    eyebrow: 'NADI',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: 'Nadi Predicta premium plan',
  };
}

function buildNumerologyReportSection(
  kundli: KundliData,
  mode: PDFMode,
): PdfSection {
  const profile =
    kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
  const isPremium = mode === 'PREMIUM';

  if (profile.status !== 'ready') {
    return {
      body:
        'Numerology needs the user name and birth date before it can prepare a number profile.',
      bullets: [
        'Add the full name and birth date to calculate name number, birth number, destiny number, and personal timing.',
        'Numerology stays separate from Parashari, KP, and Nadi unless the user asks for synthesis.',
      ],
      confidence: 'low',
      evidence: profile.evidence,
      eyebrow: 'NUMEROLOGY',
      tier: 'free',
      title: 'Numerology profile',
    };
  }

  const numberLines = [
    `Name number ${profile.nameNumber.root} (${profile.nameNumber.label}): ${profile.nameNumber.simpleMeaning}.`,
    `Birth number ${profile.birthNumber.root} (${profile.birthNumber.label}): ${profile.birthNumber.simpleMeaning}.`,
    `Destiny number ${profile.destinyNumber.root} (${profile.destinyNumber.label}): ${profile.destinyNumber.simpleMeaning}.`,
    `Current rhythm: personal year ${profile.personalYear.root}, month ${profile.personalMonth.root}, day ${profile.personalDay.root}.`,
  ];
  const premiumLines = isPremium
    ? [
        `Name method: ${profile.method.nameNumber}. Normalized name: ${profile.normalizedName}. Compound name value: ${profile.nameNumber.compound}.`,
        `Cycle detail: year ${profile.personalYear.label}, month ${profile.personalMonth.label}, day ${profile.personalDay.label}.`,
        'Premium depth uses this for name spelling comparison, compatibility numbers, monthly rhythm, and report-ready synthesis.',
      ]
    : [
        'Free depth keeps this as a useful number profile. Premium adds spelling comparison, compatibility numbers, and a timing map.',
      ];

  return {
    body:
      'Numerology is included as its own Predicta room. It reads name rhythm and birth-date numbers without casually mixing Parashari, KP, or Nadi methods.',
    bullets: [
      profile.summary,
      ...numberLines,
      `Strengths: ${profile.strengths.slice(0, isPremium ? 6 : 3).join(', ') || 'waiting for number emphasis'}.`,
      `Care points: ${profile.cautions.slice(0, isPremium ? 5 : 3).join(', ') || 'keep the reading practical and balanced'}.`,
      profile.guidance,
      ...premiumLines,
    ],
    confidence: 'medium',
    evidence: [
      ...profile.evidence,
      ...profile.limitations,
    ],
    evidenceTable: [
      {
        confidence: 'medium',
        factor: 'Name number',
        implication: 'Shows how the name projects into the world.',
        observation: `${profile.nameNumber.root} ${profile.nameNumber.label}; compound ${profile.nameNumber.compound}.`,
      },
      {
        confidence: 'medium',
        factor: 'Birth number',
        implication: 'Shows instinctive style and natural response pattern.',
        observation: `${profile.birthNumber.root} ${profile.birthNumber.label}; birth date ${profile.birthDate}.`,
      },
      {
        confidence: 'medium',
        factor: 'Destiny number',
        implication: 'Shows the longer life direction in numerology.',
        observation: `${profile.destinyNumber.root} ${profile.destinyNumber.label}.`,
      },
      {
        confidence: 'medium',
        factor: 'Personal timing',
        implication: 'Frames the current number rhythm without replacing real-world judgement.',
        observation: `Year ${profile.personalYear.root}, month ${profile.personalMonth.root}, day ${profile.personalDay.root} for ${profile.targetDate}.`,
      },
    ],
    eyebrow: 'NUMEROLOGY',
    tier: isPremium ? 'premium' : 'free',
    title: isPremium
      ? 'Numerology Predicta number synthesis'
      : 'Numerology useful insight',
  };
}

function buildSignatureReportSection(
  signatureAnalysis: SignatureAnalysisModel | undefined,
  mode: PDFMode,
): PdfSection {
  const model =
    signatureAnalysis ?? composeSignatureAnalysisModel({ inputSource: 'manual-observation' });
  const isPremium = mode === 'PREMIUM';

  if (model.status !== 'ready') {
    return {
      body:
        'Signature Predicta can be added after the user uploads, draws, or confirms a recent natural signature. It stays separate from Kundli, KP, Nadi, and Numerology unless the user asks for synthesis.',
      bullets: [
        'Add one clear signature or confirm visible traits such as pressure, slant, baseline, size, spacing, and legibility.',
        'The reading is reflective guidance about self-expression, not identity verification or handwriting forensics.',
        'Premium reports can compare Signature with Numerology after both profiles are ready.',
      ],
      confidence: 'low',
      evidence: [
        ...model.evidence,
        ...model.safetyBoundaries.slice(0, 2),
      ],
      eyebrow: 'SIGNATURE',
      tier: 'free',
      title: 'Signature Predicta preview',
    };
  }

  const traitLines = model.observedTraits
    .slice(0, isPremium ? 8 : 4)
    .map(
      trait =>
        `${trait.label}: ${trait.value} (${trait.confidence} confidence).`,
    );
  const cardLines = model.interpretationCards
    .slice(0, isPremium ? 6 : 3)
    .map(card => `${card.title}: ${card.plainMeaning}.`);
  const practiceLines = model.practicePrompts.slice(0, isPremium ? 5 : 2);

  return {
    body: isPremium
      ? 'Premium Signature Predicta reads confirmed visual traits as a self-expression layer, then turns them into practical improvement guidance while keeping clear safety boundaries.'
      : 'Signature Predicta gives a useful reading of confirmed visual traits in plain language, without making fixed character claims or identity claims.',
    bullets: [
      model.summary,
      ...traitLines,
      ...cardLines,
      `Strengths: ${model.strengths.slice(0, isPremium ? 7 : 4).join(', ') || 'waiting for confirmed traits'}.`,
      `Care points: ${model.cautions.slice(0, isPremium ? 5 : 2).join(', ') || 'keep the reading gentle and practical'}.`,
      ...practiceLines,
      ...(isPremium
        ? [
            'Premium depth can compare repeated signatures, name rhythm, and optional Numerology + Signature synthesis.',
          ]
        : [
            'Paid depth adds trait comparison, improvement plan, and optional Numerology + Signature synthesis.',
          ]),
    ],
    confidence: 'medium',
    evidence: [
      ...model.evidence,
      ...model.limitations,
      ...model.safetyBoundaries.slice(0, 3),
    ],
    evidenceTable: model.interpretationCards
      .slice(0, isPremium ? 8 : 4)
      .map(card => ({
        confidence: card.key === 'legibility' && card.plainMeaning.includes('protected')
          ? 'medium'
          : 'medium',
        factor: card.title,
        implication: card.caution,
        observation: `${card.plainMeaning}. ${card.evidence.join(' ')}`,
      })),
    eyebrow: 'SIGNATURE',
    tier: isPremium ? 'premium' : 'free',
    title: isPremium
      ? 'Signature Predicta premium synthesis'
      : 'Signature useful insight',
  };
}

function buildSignatureNumerologySynthesisSection(
  kundli: KundliData,
  signatureAnalysis?: SignatureAnalysisModel,
): PdfSection | undefined {
  if (signatureAnalysis?.status !== 'ready') {
    return undefined;
  }

  const numerology =
    kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
  if (numerology.status !== 'ready') {
    return undefined;
  }

  const topSignatureTraits = signatureAnalysis.observedTraits
    .slice(0, 4)
    .map(trait => `${trait.label} ${trait.value}`);
  const numberLines = [
    `Name number ${numerology.nameNumber.root} (${numerology.nameNumber.label}) shows the name's public rhythm.`,
    `Birth number ${numerology.birthNumber.root} (${numerology.birthNumber.label}) shows instinctive response style.`,
    `Destiny number ${numerology.destinyNumber.root} (${numerology.destinyNumber.label}) shows the longer number direction.`,
  ];

  return {
    body:
      'This optional premium synthesis compares two separate layers: Numerology reads name and date rhythm, while Signature Predicta reads visible self-expression traits. It does not blend methods casually or treat either layer as proof of identity.',
    bullets: [
      numerology.summary,
      signatureAnalysis.summary,
      ...numberLines,
      `Signature traits compared: ${topSignatureTraits.join(', ') || 'waiting for confirmed traits'}.`,
      `Shared strengths to develop: ${[
        ...numerology.strengths.slice(0, 3),
        ...signatureAnalysis.strengths.slice(0, 3),
      ].join(', ')}.`,
      `Practice: ${signatureAnalysis.practicePrompts[0] ?? 'Use a natural signature practice and review how it feels.'}`,
      'Keep this as reflective guidance; real-world decisions still need practical judgment.',
    ],
    confidence: 'medium',
    evidence: [
      ...numerology.evidence.slice(0, 4),
      ...signatureAnalysis.evidence.slice(0, 4),
      'Synthesis is optional and compares patterns only after both layers are available.',
      ...signatureAnalysis.safetyBoundaries.slice(0, 2),
    ],
    evidenceTable: [
      {
        confidence: 'medium',
        factor: 'Name rhythm',
        implication: numerology.nameNumber.simpleMeaning,
        observation: `Name number ${numerology.nameNumber.root}, compound ${numerology.nameNumber.compound}.`,
      },
      {
        confidence: 'medium',
        factor: 'Birth rhythm',
        implication: numerology.birthNumber.simpleMeaning,
        observation: `Birth number ${numerology.birthNumber.root}; destiny number ${numerology.destinyNumber.root}.`,
      },
      {
        confidence: 'medium',
        factor: 'Signature expression',
        implication:
          signatureAnalysis.cautions[0] ??
          'Use signature traits as soft reflection, not a fixed judgment.',
        observation: topSignatureTraits.join(', ') || signatureAnalysis.summary,
      },
      {
        confidence: 'medium',
        factor: 'Boundary',
        implication: 'The report keeps Numerology and Signature as separate methods before comparison.',
        observation: 'No identity, legal, medical, hiring, or certainty claims.',
      },
    ],
    eyebrow: 'SIGNATURE + NUMEROLOGY',
    tier: 'premium',
    title: 'Numerology + Signature synthesis',
  };
}

function buildAreaSection(
  kundli: KundliData,
  title: string,
  charts: ChartType[],
  houses: number[],
  planets: string[],
): PdfSection {
  const chartBullets = charts.map(chartType => chartSummary(kundli, chartType)).filter(Boolean);
  const houseBullets = houses.map(houseNumber => houseSummary(kundli, houseNumber));
  const planetBullets = planets
    .map(name => findPlanet(kundli, name))
    .filter((planet): planet is PlanetPosition => Boolean(planet))
    .map(planet => `${planet.name} contributes from ${planet.sign} house ${planet.house} with ${planetDignity(planet)} dignity.`);
  const pressure = houses.flatMap(houseNumber => house(kundli, houseNumber)?.planets ?? []).filter(planet => PRESSURE_PLANETS.has(planet));
  const support = houses.flatMap(houseNumber => house(kundli, houseNumber)?.planets ?? []).filter(planet => BENEFICS.has(planet));

  return {
    body: `${title} is synthesized through relevant houses, planets, and divisional charts. The report weighs support and pressure together instead of giving a one-line prediction.`,
    bullets: [...houseBullets, ...planetBullets, ...chartBullets].slice(0, 9),
    confidence: chartBullets.length >= charts.length ? 'high' : 'medium',
    evidence: [
      `Supportive planets in relevant houses: ${support.length ? support.join(', ') : 'none'}.`,
      `Pressure planets in relevant houses: ${pressure.length ? pressure.join(', ') : 'none'}.`,
    ],
    evidenceTable: [
      {
        confidence: 'high',
        factor: `${title} houses`,
        implication: 'House condition anchors the area before prediction language.',
        observation: houseBullets.slice(0, 3).join(' '),
      },
      {
        confidence: planetBullets.length ? 'high' : 'medium',
        factor: `${title} planets`,
        implication: 'Planetary condition shows how the area behaves under current timing.',
        observation: planetBullets.slice(0, 3).join(' ') || 'Relevant planet placements not found in primary list.',
      },
      {
        confidence: chartBullets.length ? 'high' : 'medium',
        factor: `${title} divisional checks`,
        implication: 'Divisional charts add depth only when supported.',
        observation: chartBullets.slice(0, 2).join(' '),
      },
    ],
    eyebrow: title.toUpperCase(),
    tier: 'free',
    title,
  };
}

function buildFullJyotishCoverageSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const chartTypes = getReportChartTypes(kundli, mode);
  const supported = chartTypes.filter(chartType => kundli.charts[chartType]?.supported);
  const unsupported = chartTypes.filter(
    chartType => kundli.charts[chartType] && !kundli.charts[chartType].supported,
  );
  const dasha = kundli.dasha.current;
  const sadeSati = composeSadeSatiIntelligence(kundli, { depth: mode });
  const hasChalit = 'chalit' in kundli && Boolean((kundli as Record<string, unknown>).chalit);
  const hasBhav = 'bhav' in kundli && Boolean((kundli as Record<string, unknown>).bhav);
  const hasKp = 'kp' in kundli && Boolean((kundli as Record<string, unknown>).kp);

  return {
    body: mode === 'PREMIUM'
      ? 'Premium does not unlock hidden charts; it unlocks deeper reading of the same Jyotish areas with timing, cross-checking, and evidence tables.'
      : 'Free reports show the available astrology clearly and explain it simply. Sections that need more chart preparation are marked in a calm, transparent way.',
    bullets: [
      `Available charts included: ${chartTypes.join(', ')}.`,
      `Mahadasha/Antardasha included: ${dasha.mahadasha}/${dasha.antardasha} from ${dasha.startDate} to ${dasha.endDate}.`,
      `Ashtakavarga included: total SAV ${kundli.ashtakavarga.totalScore}, strongest houses ${kundli.ashtakavarga.strongestHouses.join(', ')}.`,
      `Transits included: ${(kundli.transits ?? []).length ? `${kundli.transits?.length} current transit records.` : 'available after transit preparation.'}`,
      `Yearly horoscope: ${kundli.yearlyHoroscope ? `${kundli.yearlyHoroscope.yearLabel} Varshaphal foundation included.` : 'available after yearly preparation.'}`,
      `Yogas/doshas included: ${kundli.yogas.length ? `${kundli.yogas.length} recognized patterns.` : 'no recognized patterns in this Kundli.'}`,
      `Remedies included: ${(kundli.remedies ?? []).length ? `${kundli.remedies?.length} remedy practices.` : 'available after remedy preparation.'}`,
      `Sade Sati: derived from Saturn transit and Moon sign (${sadeSati.phaseLabel}).`,
      `Bhav/Chalit: ${hasBhav || hasChalit ? 'included.' : 'available after house refinement preparation.'}`,
      `KP horoscope: ${hasKp ? 'included.' : 'available after KP preparation.'}`,
    ],
    evidence: [
      `Ready charts: ${supported.join(', ') || 'none'}.`,
      `Charts kept out of guidance for now: ${unsupported.length ? unsupported.join(', ') : 'none'}.`,
      'Predicta separates prepared chart evidence from areas that need more confirmation.',
    ],
    eyebrow: 'FULL COVERAGE',
    title: 'Jyotish coverage checklist',
  };
}

function buildGuidanceSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const current = kundli.dasha.current;
  const maha = findPlanet(kundli, current.mahadasha);
  const weakHouses = kundli.ashtakavarga.weakestHouses;

  return {
    body: 'Guidance is tied to chart evidence: current dasha, weak houses, and repeated pressure signatures. Remedies are kept practical and non-fearful.',
    bullets: [
      maha ? `Work with ${current.mahadasha} through the discipline of house ${maha.house}: ${houseMeaning(maha.house)}.` : `Work consciously with the ${current.mahadasha} period through steadiness and clean commitments.`,
      `Protect weakest houses ${weakHouses.join(', ')} through routine, restraint, and honest review.`,
      `Use simple mantra, prayer, silence, or service as consistency practices rather than panic remedies.`,
      mode === 'PREMIUM' ? 'Review the detailed chart sections before making irreversible timing decisions.' : 'Upgrade depth is most useful when you need area-by-area timing, remedies, and advanced synthesis.',
    ],
    evidence: [
      `Dasha: ${current.mahadasha}/${current.antardasha}`,
      `Weakest ashtakavarga houses: ${weakHouses.join(', ')}`,
    ],
    eyebrow: 'GUIDANCE',
    title: 'Practical guidance and remedies',
  };
}

function buildRemedySection(kundli: KundliData): PdfSection {
  const remedies = kundli.remedies ?? [];

  return {
    body: 'Remedies are practical correction practices tied to timing, weaker houses, and confidence limits. They are intentionally non-fearful and non-exploitative.',
    bullets: remedies.length
      ? remedies.map(
          remedy =>
            `${remedy.title}: ${remedy.practice} Cadence: ${remedy.cadence}. Review after 4 completions or 30 days; stop or simplify if it creates fear or avoidance.`,
        )
      : ['Remedy insights will appear once Predicta prepares this layer from the saved birth profile.'],
    evidence: remedies.map(
      remedy =>
        `${remedy.id}: ${remedy.rationale} Planets ${remedy.linkedPlanets.join(', ') || 'none'}, houses ${remedy.linkedHouses.join(', ') || 'none'}. Caution: ${remedy.caution}`,
    ),
    eyebrow: 'REMEDIES',
    title: 'Remedy plan',
  };
}

function buildLimitationsSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const unsupported = Object.entries(kundli.charts)
    .filter(([, chart]) => !chart.supported)
    .map(([chartType]) => chartType);
  const limitations = [
    kundli.birthDetails.isTimeApproximate
      ? kundli.birthDetails.timeConfidence === 'rectified'
        ? `Birth time is a probable rectified time. Original entered time: ${kundli.birthDetails.originalTime ?? 'not recorded'}. Fine timing still needs caution.`
        : 'Birth time is marked approximate, so house and divisional chart judgments need caution.'
      : 'Birth time is treated as exact because it is not marked approximate.',
    unsupported.length
      ? `Vargas needing more confirmation are listed without interpretation: ${unsupported.join(', ')}.`
      : 'All registered charts in this Kundli are supported.',
    mode === 'FREE'
      ? 'Free reports include essential chart-backed insight, while premium adds complete coverage, detailed synthesis, and timing.'
      : 'Premium reports add depth, timing, and evidence tables but still avoid guaranteed outcomes.',
  ];

  return {
    body: 'A trustworthy report should name its limits. This protects the user from false certainty and keeps the reading grounded.',
    bullets: limitations,
    evidence: [
      `Birth details were checked before this report was prepared.`,
      `Report prepared at: ${kundli.calculationMeta.calculatedAt}`,
    ],
    eyebrow: 'TRUST',
    title: 'Limits and confidence',
  };
}

function buildOneLineSummary(kundli: KundliData): string {
  return `${kundli.lagna} Lagna, ${kundli.moonSign} Moon, ${kundli.nakshatra} nakshatra, currently in ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`;
}

function chartSummary(kundli: KundliData, chartType: ChartType): string {
  const chart = kundli.charts[chartType];
  if (!chart) {
    return `${chartType}: this chart is not part of this Kundli report.`;
  }
  if (!chart.supported) {
    return `${chartType}: kept to a lighter explanation because ${
      chart.unsupportedReason ??
      'the full chart evidence needs confirmation'
    }.`;
  }

  const snapshot = buildPdfChartSnapshots(kundli, [chartType])[0];
  const occupied = snapshot ? formatSnapshotOccupiedHouses(snapshot) : occupiedHouses(chart);

  return `${chartType} ${chart.name}: ${chart.ascendantSign} ascendant; occupied houses ${occupied}.`;
}

function getReportChartTypes(
  kundli: KundliData,
  mode: PDFMode,
  reportFocus: PdfReportFocus = 'KUNDLI',
): ChartType[] {
  const chartTypes = (Object.keys(kundli.charts) as ChartType[]).sort(compareChartType);

  if (mode === 'PREMIUM') {
    return prioritizeChartTypes(chartTypes, reportFocus);
  }

  const freeChartTypes = new Set<ChartType>(getFreeChartTypesForFocus(reportFocus));
  const availableFreeCharts = chartTypes.filter(chartType => freeChartTypes.has(chartType));

  return availableFreeCharts.length ? availableFreeCharts : chartTypes.slice(0, 3);
}

function prioritizeChartTypes(
  chartTypes: ChartType[],
  reportFocus: PdfReportFocus,
): ChartType[] {
  const priority = getFreeChartTypesForFocus(reportFocus);

  return [
    ...priority.filter(chartType => chartTypes.includes(chartType)),
    ...chartTypes.filter(chartType => !priority.includes(chartType)),
  ];
}

function getFreeChartTypesForFocus(reportFocus: PdfReportFocus): ChartType[] {
  switch (reportFocus) {
    case 'CAREER':
      return ['D1', 'D10'];
    case 'COMPATIBILITY':
    case 'MARRIAGE':
      return ['D1', 'D9'];
    case 'WEALTH':
      return ['D1', 'D2'];
    case 'KP':
    case 'NADI':
    case 'NUMEROLOGY':
    case 'REMEDIES':
    case 'SADESATI':
    case 'SIGNATURE':
      return ['D1'];
    case 'DASHA':
    case 'KUNDLI':
    case 'VEDIC':
    default:
      return ['D1', 'D9', 'D10'];
  }
}

function compareChartType(a: ChartType, b: ChartType): number {
  return chartTypeNumber(a) - chartTypeNumber(b);
}

function chartTypeNumber(chartType: ChartType): number {
  return Number(chartType.replace('D', '')) || 0;
}

function occupiedHouses(chart: ChartData): string {
  const occupied = Object.entries(chart.housePlacements)
    .map(([houseNumber, planets]) => [houseNumber, filterReportPlanetNames(planets)] as const)
    .filter(([, planets]) => planets.length)
    .map(([houseNumber, planets]) => `${houseNumber} (${planets.join(', ')})`);

  return occupied.length ? occupied.join('; ') : 'none';
}

function planetaryLine(planet: PlanetPosition): string {
  return `${planet.name} in ${planet.sign} house ${planet.house}, ${planet.nakshatra} pada ${planet.pada}`;
}

function houseSummary(kundli: KundliData, houseNumber: number): string {
  const item = house(kundli, houseNumber);
  if (!item) {
    return `House ${houseNumber}: this house detail is not part of this Kundli report.`;
  }

  const sav = houseSav(kundli, item);
  const planets = filterReportPlanetNames(item.planets);
  return `House ${houseNumber}: ${item.sign}, lord ${item.lord}, planets ${planets.length ? planets.join(', ') : 'none'}${sav === undefined ? '' : `, SAV ${sav}`}; ${houseMeaning(houseNumber)}.`;
}

function filterReportPlanetNames(planets: string[]): string[] {
  const hidden = new Set([
    'Uranus',
    'Neptune',
    'Pluto',
    'Dhuma',
    'Vyatipata',
    'Parivesha',
    'Indrachapa',
    'Upaketu',
    'Gulika',
    'Mandi',
  ]);

  return planets.filter(name => !hidden.has(name));
}

function house(kundli: KundliData, houseNumber: number): HouseData | undefined {
  return kundli.houses.find(item => item.house === houseNumber);
}

function houseSav(kundli: KundliData, item: HouseData): number | undefined {
  const signs = [
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
  const index = signs.indexOf(item.sign);
  return index >= 0 ? kundli.ashtakavarga.sav[index] : undefined;
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(planet => planet.name === name);
}

function planetDignity(planet: PlanetPosition): string {
  if (EXALTATION_SIGNS[planet.name] === planet.sign) {
    return 'exalted';
  }
  if (DEBILITATION_SIGNS[planet.name] === planet.sign) {
    return 'debilitated';
  }
  if (OWN_SIGNS[planet.name]?.includes(planet.sign)) {
    return 'own sign';
  }
  return 'ordinary';
}

function rankSav(kundli: KundliData): string[] {
  return kundli.houses
    .map(item => ({
      house: item.house,
      score: houseSav(kundli, item) ?? 0,
      sign: item.sign,
    }))
    .sort((first, second) => second.score - first.score)
    .map(item => `House ${item.house} ${item.sign}: ${item.score}`);
}

function houseMeaning(houseNumber: number): string {
  const meanings: Record<number, string> = {
    1: 'body, temperament, vitality, and self-direction',
    2: 'wealth storage, speech, family resources, and values',
    3: 'courage, initiative, siblings, and effort',
    4: 'home, property, emotional ground, and inner stability',
    5: 'intelligence, creativity, children, and merit',
    6: 'work pressure, service, health correction, and competition',
    7: 'partnership, marriage, clients, and negotiation',
    8: 'sudden changes, vulnerability, longevity themes, and hidden pressure',
    9: 'dharma, teachers, fortune, and grace',
    10: 'career, authority, public work, and contribution',
    11: 'gains, networks, income, and fulfilled ambitions',
    12: 'retreat, sleep, expenses, foreign lands, and release',
  };

  return meanings[houseNumber] ?? 'house theme';
}

export const reportInternals = {
  chartSummary,
  houseSummary,
  planetaryLine,
};

function localizeSections(
  sections: PdfSection[],
  language: SupportedLanguage,
): PdfSection[] {
  if (language === 'en') {
    return sections;
  }

  return sections.map(section => ({
    ...section,
    body: translateUiText(section.body, language),
    bullets: section.bullets.map(item => translateUiText(item, language)),
    eyebrow: localizeSectionEyebrow(section.eyebrow, language),
    evidence: section.evidence.map(item => translateUiText(item, language)),
    evidenceTable: section.evidenceTable?.map(row => ({
      ...row,
      factor: translateUiText(row.factor, language),
      implication: translateUiText(row.implication, language),
      observation: translateUiText(row.observation, language),
    })),
    title: localizeSectionTitle(section.title, language),
  }));
}

function localizeExecutiveSummary(
  summary: PdfComposition['executiveSummary'],
  language: SupportedLanguage,
): PdfComposition['executiveSummary'] {
  if (language === 'en') {
    return summary;
  }

  return {
    ...summary,
    headline: translateUiText(summary.headline, language),
    keySignals: summary.keySignals.map(signal => translateUiText(signal, language)),
  };
}

function formatPdfDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

function localizeSectionTitle(title: string, language: SupportedLanguage): string {
  const titleMap: Record<string, { gu: string; hi: string }> =
    reportLabelTranslations.titleMap;
  const mapped = titleMap[title];

  return mapped ? (language === 'gu' ? mapped.gu : mapped.hi) : title;
}

function localizeSectionEyebrow(
  eyebrow: string,
  language: SupportedLanguage,
): string {
  const eyebrowMap: Record<string, { gu: string; hi: string }> =
    reportLabelTranslations.eyebrowMap;
  const mapped = eyebrowMap[eyebrow];

  return mapped ? (language === 'gu' ? mapped.gu : mapped.hi) : eyebrow;
}
