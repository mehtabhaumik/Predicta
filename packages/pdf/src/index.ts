import reportLabelTranslations from './translations/reportLabels.json';
import type {
  ChartData,
  ChartInsightProfile,
  ChartType,
  DecisionMemo,
  HouseData,
  KundliData,
  PDFMode,
  PlanetPosition,
  SupportedLanguage,
  SignatureAnalysisModel,
  TrustProfile,
  VedicIntelligenceContract,
  VedicIntelligenceSection,
  VedicMahadashaPhalaBlock,
} from '@pridicta/types';
import { buildTrustProfile } from '@pridicta/config/trust';
import { translateUiText } from '@pridicta/config/uiTranslations';
import {
  buildParashariChalitChart,
  buildKarakamshaChart,
  buildChartRenderModel,
  buildSchoolPreviewChart,
  buildSwamsaChart,
  composeChartInsight,
  composeChalitBhavKpFoundation,
  composeAdvancedJyotishCoverage,
  buildKundliMoonNakshatraPadaInsight,
  composeHolisticDailyGuidance,
  composeHolisticReadingRooms,
  composeLifeAtlasReport,
  composeMahadashaIntelligence,
  composeNadiJyotishPlan,
  composeNumerologyFoundationModel,
  composePersonalPanchangLayer,
  composePurusharthaLifeBalance,
  composeSadeSatiIntelligence,
  composeSadhanaRemedyPath,
  composeSignatureAnalysisModel,
  composeTransitGocharIntelligence,
  composeVedicIntelligenceContract,
  composeYearlyHoroscopeVarshaphal,
  getVedicFocusChartLabel,
  LIFE_ATLAS_SIGNATURE_ENRICHMENT_INVITE,
  VEDIC_FOCUS_CHART_ORDER,
  type ChartRenderLegendItem,
  type ChartRenderMoonPhase,
  type ChartRenderPlanet,
  type ChartRenderSchool,
  type ChartRenderTheme,
  type VedicFocusChartRole,
} from '@pridicta/astrology';

type PdfChartRole = ChartType | 'MOON' | 'SWAMSA' | 'KARAKAMSHA' | 'CHALIT' | 'KP' | 'NADI';

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
  | 'LIFE_ATLAS'
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
    birthMomentSignature: string[];
    birthPlace: string;
    birthTime: string;
    dateOfBirth: string;
    descriptor: string;
    title: string;
    preparationLine: string;
    reportType: string;
    subjectName: string;
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
  houseWisePlanetRows: PdfHouseWisePlanetRow[];
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
  chartRole: PdfChartRole;
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

export type PdfHouseWisePlanetRow = {
  combust: string;
  debilitation: string;
  degree: string;
  dignity: string;
  exaltation: string;
  graha: string;
  house: string;
  nakshatraPada: string;
  retrograde: string;
  sign: string;
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
const CLASSICAL_GRAHA_ORDER = [
  'Sun',
  'Moon',
  'Mars',
  'Mercury',
  'Jupiter',
  'Venus',
  'Saturn',
  'Rahu',
  'Ketu',
];
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
  const chartSnapshots = buildPdfChartSnapshots(kundli, chartTypes, language, reportFocus);
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
    cover: buildReportCover(kundli, reportFocus, mode, signatureAnalysis),
    dossierVersion: '2.0',
    executiveSummary: localizeExecutiveSummary(
      buildDossierExecutiveSummary(kundli, mode, reportFocus, signatureAnalysis),
      language,
    ),
    footer: 'Prepared by Predicta @2026',
    houseWisePlanetRows: shouldIncludeHouseWisePlanetRows(reportFocus)
      ? buildPdfHouseWisePlanetRows(kundli, language)
      : [],
    language,
    mode,
    sections: localizeSections(polishedSections, language),
    summary: buildOneLineSummary(kundli, reportFocus, signatureAnalysis),
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

  if (reportFocus === 'LIFE_ATLAS') {
    return uniqueReportSections([
      ...focusSections,
      ...(decisionMemo ? [buildDecisionMemoSection(decisionMemo)] : []),
    ].filter((section): section is PdfSection => Boolean(section)));
  }

  if (reportFocus === 'KP') {
    return uniqueReportSections([
      ...focusSections,
      ...(decisionMemo ? [buildDecisionMemoSection(decisionMemo)] : []),
    ].filter((section): section is PdfSection => Boolean(section)));
  }

  if (reportFocus === 'NADI') {
    return uniqueReportSections([
      ...focusSections,
      ...(decisionMemo ? [buildDecisionMemoSection(decisionMemo)] : []),
    ].filter((section): section is PdfSection => Boolean(section)));
  }

  if (reportFocus === 'NUMEROLOGY') {
    return uniqueReportSections([
      ...focusSections,
      ...(decisionMemo ? [buildDecisionMemoSection(decisionMemo)] : []),
    ].filter((section): section is PdfSection => Boolean(section)));
  }

  if (reportFocus === 'SIGNATURE') {
    return uniqueReportSections([
      ...focusSections,
      buildFocusedSchoolTrustSection(kundli, mode, reportFocus),
      ...(decisionMemo ? [buildDecisionMemoSection(decisionMemo)] : []),
    ].filter((section): section is PdfSection => Boolean(section)));
  }

  const vedicAreaSections = [
    buildAreaSection(kundli, 'Career', ['D1', 'D10'], [10, 6, 11], ['Saturn', 'Sun', 'Mercury', 'Jupiter']),
    buildAreaSection(kundli, 'Relationship', ['D1', 'D9'], [7, 2, 11], ['Venus', 'Jupiter', 'Moon']),
    buildAreaSection(kundli, 'Wealth', ['D1', 'D2'], [2, 9, 11], ['Jupiter', 'Venus', 'Mercury']),
  ];

  const vedicCore = [
    ...buildVedicReportStructureSections(kundli, chartTypes, mode, language),
    ...focusSections,
    buildExecutiveSummary(kundli, mode),
    buildHolisticReportSynthesisSection(kundli, mode),
    buildPlanetaryStrengthSection(kundli, mode),
    buildTransitSection(kundli, mode),
    ...vedicAreaSections,
    buildRectificationSection(kundli),
    buildGuidanceSection(kundli, mode),
    buildLimitationsSection(kundli, mode),
    buildRemedySection(kundli),
  ];

  if (mode === 'FREE') {
    return uniqueReportSections(vedicCore.filter((section): section is PdfSection => Boolean(section)));
  }

  return uniqueReportSections([
    ...vedicCore,
    buildBhavChalitSection(kundli, mode),
    buildTimelineSection(kundli, mode),
    buildYearlyHoroscopeSection(kundli, mode),
    buildAshtakavargaSection(kundli),
    buildYogaSection(kundli, mode),
    buildAdvancedJyotishCoverageSection(kundli, mode),
    buildAreaSection(kundli, 'Wellbeing', ['D1', 'D30'], [1, 6, 8, 12], ['Moon', 'Saturn', 'Mars']),
    buildAreaSection(kundli, 'Spiritual Practice', ['D1', 'D20'], [9, 12], ['Jupiter', 'Ketu', 'Moon']),
    buildFullJyotishCoverageSection(kundli, mode),
    ...(decisionMemo ? [buildDecisionMemoSection(decisionMemo)] : []),
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
      return buildKpReportSections(kundli, mode);
    case 'LIFE_ATLAS':
      return buildLifeAtlasReportSections(kundli, mode, signatureAnalysis);
    case 'NADI':
      return buildNadiReportSections(kundli, mode);
    case 'NUMEROLOGY':
      return buildNumerologyReportSections(kundli, mode);
    case 'SIGNATURE':
      return [
        buildSignatureReportSection(signatureAnalysis, mode),
      ].filter((section): section is PdfSection => Boolean(section));
    default:
      return [buildVedicPredictaReportSection(kundli, mode, 'KUNDLI')];
  }
}

function buildFocusedSchoolTrustSection(
  kundli: KundliData,
  mode: PDFMode,
  reportFocus: Extract<PdfReportFocus, 'KP' | 'NADI' | 'NUMEROLOGY' | 'SIGNATURE'>,
): PdfSection {
  const copy: Record<typeof reportFocus, {
    boundary: string;
    freeDepth: string;
    premiumDepth: string;
    readiness: string;
    title: string;
  }> = {
    KP: {
      boundary:
        'KP Predicta reports stay event-first: cusps, star lords, sub lords, sub-sub lords where available, significators, ruling planets, dasha support, and transit trigger windows. They do not become Vedic personality reports.',
      freeDepth:
        'Free KP gives useful promise, blocker, and timing-readiness insight.',
      premiumDepth:
        'Premium KP adds full event proof, cusp/sub-lord chain, significator hierarchy, ruling planets, dasha/transit support, confidence, and limitations.',
      readiness:
        'Ready when a calculated Kundli is active; sharper judgment requires a specific event question.',
      title: 'KP report boundary and readiness',
    },
    NADI: {
      boundary:
        'Nadi Predicta reports use planetary story links, karaka themes, karmic patterns, Rahu/Ketu axis, validation questions, and activation timing. They do not use KP cusp logic and do not claim palm-leaf manuscript access.',
      freeDepth:
        'Free Nadi gives a useful story-thread preview, gift, caution, validation prompts, and gentle guidance.',
      premiumDepth:
        'Premium Nadi adds deeper sequencing, validation-based deepening, activation windows, and practices.',
      readiness:
        'Ready when a calculated Kundli is active; deeper Nadi reading should ask validation questions before strong timing.',
      title: 'Nadi report boundary and readiness',
    },
    NUMEROLOGY: {
      boundary:
        'Numerology Predicta reports use name/date number rhythm, name number, birth number, destiny or life-path number, personal cycles, repeated/missing number patterns, and name refinement. They do not include Kundli judgement unless a future synthesis lane explicitly says so.',
      freeDepth:
        'Free Numerology gives core numbers, simple meaning, current cycle, strengths, cautions, and practical guidance.',
      premiumDepth:
        'Premium Numerology adds detailed interpretation, timing calendar, compatibility, and name-spelling or brand-name comparison.',
      readiness:
        'Ready when a saved name and birth date are available from the active profile.',
      title: 'Numerology report boundary and readiness',
    },
    SIGNATURE: {
      boundary:
        'Signature Predicta reports use confirmed signature traits only: size, slant, pressure, baseline, spacing, legibility, rhythm, underline/flourish, consistency, self-expression summary, and improvement guidance. They do not include Numerology or Vedic synthesis unless a future synthesis lane explicitly says so.',
      freeDepth:
        'Free Signature gives reflective visible-trait insight with privacy and safety framing.',
      premiumDepth:
        'Premium Signature adds multi-sample comparison, before/after guidance, and a signature refinement plan.',
      readiness:
        'Ready only when a signature sample or confirmed manual-observation state exists.',
      title: 'Signature report boundary and readiness',
    },
  };
  const selected = copy[reportFocus];

  return {
    body: selected.boundary,
    bullets: [
      `Readiness: ${selected.readiness}`,
      `Free/basic: ${selected.freeDepth}`,
      `Premium/paid: ${selected.premiumDepth}`,
      `Active profile: ${kundli.birthDetails.name}.`,
      mode === 'PREMIUM'
        ? 'This report uses paid depth without crossing into another school.'
        : 'This report remains useful in free depth without looking cheap or incomplete.',
    ],
    confidence: 'high',
    evidence: [
      `Selected report focus: ${reportFocus}.`,
      selected.boundary,
      `Birth profile used only for this school's required inputs: ${kundli.birthDetails.date}, ${kundli.birthDetails.time}, ${kundli.birthDetails.place}.`,
    ],
    evidenceTable: [
      {
        confidence: 'high',
        factor: 'School boundary',
        implication: 'The PDF composition must not import another school lane by default.',
        observation: selected.boundary,
      },
      {
        confidence: 'medium',
        factor: 'Readiness',
        implication: selected.readiness,
        observation: `Active report focus is ${reportFocus}.`,
      },
    ],
    eyebrow: 'SCHOOL BOUNDARY',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: selected.title,
  };
}

function buildLifeAtlasReportSections(
  kundli: KundliData,
  mode: PDFMode,
  signatureAnalysis?: SignatureAnalysisModel,
): PdfSection[] {
  const atlas = composeLifeAtlasReport(kundli, {
    depth: mode,
    signatureAnalysis,
  });
  const narrativeSections = atlas.sections.map(section => ({
      body: section.body,
      bullets: section.bullets,
      confidence: atlas.status === 'ready' ? 'high' as const : 'low' as const,
      evidence: section.evidence,
      evidenceTable: [] satisfies PdfEvidenceRow[],
      eyebrow:
        section.id === 'how-predicta-built-this-reading'
          ? 'LIFE ATLAS APPENDIX'
          : 'LIFE ATLAS',
      tier: section.tier,
      title: section.title,
    }));

  if (mode !== 'PREMIUM') {
    return narrativeSections;
  }

  return [
    ...narrativeSections,
    {
      body:
        'This appendix keeps the source map honest without turning the main Life Atlas into a technical school report.',
      bullets: [
        ...atlas.evidenceLayers
          .filter(layer => layer.status === 'ready')
          .map(layer => `${layer.label}: ${layer.role}`),
        signatureAnalysis?.status === 'ready'
          ? 'Signature: confirmed visible traits were used only as optional expression enrichment.'
          : LIFE_ATLAS_SIGNATURE_ENRICHMENT_INVITE,
      ],
      confidence: 'high',
      evidence: [
        'Predicta Life Atlas is the approved all-school synthesis report path.',
        ...atlas.evidenceLayers.map(layer => `${layer.label}: ${layer.summary}`),
        ...atlas.limitations,
      ],
      evidenceTable: atlas.evidenceLayers.map(layer => ({
        confidence:
          layer.status === 'ready'
          ? 'high' as const
          : layer.status === 'optional'
            ? 'medium' as const
            : 'low' as const,
        factor: layer.label,
        implication: layer.role,
        observation: layer.summary,
      })),
      eyebrow: 'LIFE ATLAS APPENDIX',
      tier: 'premium',
      title: 'How Predicta Built This Reading',
    },
  ];
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
      'This report is prepared inside Vedic Predicta. It uses Parashari Jyotish evidence first: D1, relevant varga charts, dasha, gochar, house strength, safe remedies, and holistic context. KP, Nadi, Numerology, and Signature stay separate unless a future approved synthesis report explicitly says so.',
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

function buildKpReportSections(kundli: KundliData, mode: PDFMode): PdfSection[] {
  const foundation = composeChalitBhavKpFoundation(kundli, { depth: mode });
  const kp = foundation.kp;
  const eventHouses = uniqueValues(
    kp.significators
      .flatMap(item => item.signifiesHouses)
      .filter(house => house >= 1 && house <= 12)
      .slice(0, mode === 'PREMIUM' ? 8 : 4)
      .map(String),
  );
  const triggerWindows = kundli.transits?.slice(0, mode === 'PREMIUM' ? 4 : 2) ?? [];
  const judgement = kp.eventJudgement;
  const ruling = kp.rulingPlanets;
  const currentDasha = `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`;
  const selectedQuestion = 'General KP event-readiness';
  const eventHouseText = eventHouses.join(', ') || 'choose an exact event to lock houses';
  const carrierRows = judgement.eventCarriers.slice(0, mode === 'PREMIUM' ? 6 : 3).map(carrier => ({
    confidence: carrier.role === 'carrier' ? 'high' as const : carrier.role === 'supporter' ? 'medium' as const : 'low' as const,
    factor: `${carrier.planet} (${carrier.role})`,
    implication: carrier.reason,
    observation: carrier.reason,
  }));
  const cuspRows = kp.cusps.slice(0, mode === 'PREMIUM' ? 12 : 6).map(cusp => ({
    confidence: 'medium' as const,
    factor: `Cusp ${cusp.house}`,
    implication: `House ${cusp.house} judgement depends on sub lord ${cusp.lordChain.subLord}; use it only for an event that actually belongs to this house.`,
    observation: `${cusp.sign} ${cusp.degree.toFixed(2)}°, star ${cusp.lordChain.starLord}, sub ${cusp.lordChain.subLord}, sub-sub ${cusp.lordChain.subSubLord}.`,
  }));
  const significatorRows = kp.significators.slice(0, mode === 'PREMIUM' ? 9 : 4).map(item => ({
    confidence: item.strength === 'A' ? 'high' as const : item.strength === 'B' ? 'medium' as const : 'low' as const,
    factor: `${item.planet} (${item.strength})`,
    implication: item.simpleMeaning,
    observation: `Carries houses ${item.signifiesHouses.join(', ') || 'pending'}; occupied ${item.occupiedHouse ?? 'none'}; owns ${item.ownedHouses.join(', ') || 'none'}.`,
  }));
  const verdictRows: PdfEvidenceRow[] = [
    {
      confidence: judgement.confidence === 'clear' ? 'high' : judgement.confidence === 'partial' ? 'medium' : 'low',
      factor: 'Verdict',
      implication: judgement.plainLanguage,
      observation: judgement.verdictLabel,
    },
    {
      confidence: 'medium',
      factor: 'Promise',
      implication: judgement.promise,
      observation: judgement.eventVerdictCompass.promise,
    },
    {
      confidence: judgement.timingReadinessState === 'ready' ? 'high' : judgement.timingReadinessState === 'partial' ? 'medium' : 'low',
      factor: 'Timing readiness',
      implication: judgement.timingReadiness,
      observation: judgement.eventVerdictCompass.timing,
    },
    {
      confidence: 'low',
      factor: 'Main caution',
      implication: judgement.mainBlock,
      observation: judgement.eventVerdictCompass.block,
    },
  ];

  const sections: PdfSection[] = [
    {
      body:
        `${selectedQuestion}: KP is currently reading this as "${judgement.verdictLabel}". This is not a personality reading and not a Parashari chart interpretation; it is an event-readiness answer based on cusps, sub lords, significators, ruling planets, and timing support. For a final yes/no style answer, the user must choose one exact event and time window.`,
      bullets: [
        `Plain answer: ${judgement.plainLanguage}`,
        `Promise: ${judgement.promise}`,
        `Block/caution: ${judgement.mainBlock}`,
        `Timing: ${judgement.timingReadiness}`,
        `Next question: ${judgement.nextQuestion}`,
      ],
      confidence: judgement.confidence === 'clear' ? 'high' : judgement.confidence === 'partial' ? 'medium' : 'low',
      evidence: [
        `Selected event question: ${selectedQuestion}.`,
        `Verdict: ${judgement.verdictLabel}.`,
        `Relevant event houses: ${eventHouseText}.`,
        ...judgement.proofPath,
      ],
      evidenceTable: verdictRows,
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: 'KP Event Verdict',
    },
    {
      body:
        `The KP proof path is intentionally simple: define the event, identify the event houses, inspect the main cusp and sub lord, then check which planets carry the event and whether timing agrees. Without that sequence, KP becomes noise. In this report the useful houses surfaced so far are ${eventHouseText}.`,
      bullets: [
        `Question-to-proof path: ${judgement.questionToProofPath.join(' -> ')}.`,
        `Decision point: ${judgement.decisionPoint}`,
        `Event carriers shown: ${judgement.eventCarriers.length || 0}.`,
        mode === 'PREMIUM'
          ? 'Premium keeps the full chain visible: cusps, sub lords, significators, ruling planets, dasha, and trigger windows.'
          : 'Free keeps the proof readable and asks for a sharper event before stronger timing claims.',
      ],
      confidence: 'medium',
      evidence: judgement.proofPath,
      evidenceTable: carrierRows.length ? carrierRows : undefined,
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: 'Question-to-Proof Path',
    },
    {
      body:
        'The KP chart in this report is a Bhav Chalit / cusp-oriented KP chart. Read the houses as event delivery zones, not as a Parashari personality map. A planet is useful here only when it carries the event houses and its sub-lord chain supports the question being judged.',
      bullets: [
        `KP cusps available: ${kp.cusps.length}.`,
        `KP significators available: ${kp.significators.length}.`,
        `Dasha support: ${currentDasha} is treated as timing support only.`,
        ruling
          ? `Ruling planets: day ${ruling.dayLord}, Moon star ${ruling.moonStarLord}, Lagna sub ${ruling.lagnaSubLord}.`
          : 'Ruling planets pending.',
      ],
      confidence: kp.cusps.length ? 'high' : 'low',
      evidence: [
        ...kp.evidence,
        `Dasha support: ${currentDasha}.`,
        `Transit triggers included: ${triggerWindows.length}.`,
      ],
      evidenceTable: cuspRows,
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: 'KP Cusp and Sub-Lord Proof',
    },
    {
      body:
        mode === 'PREMIUM'
          ? kp.premiumSynthesis ?? kp.freeInsight
          : kp.freeInsight,
      bullets: [
        ...kp.significators
          .slice(0, mode === 'PREMIUM' ? 5 : 3)
          .map(item => `${item.planet}: carries houses ${item.signifiesHouses.join(', ') || 'pending'} with ${item.strength} strength.`),
        mode === 'PREMIUM'
          ? 'Premium reads the hierarchy as carrier, supporter, blocker, then checks timing before stating likelihood.'
          : 'Free shows the top carriers without pretending the full event proof is complete.',
      ],
      confidence: kp.significators.length ? 'medium' : 'low',
      evidence: kp.significators.map(
        item => `${item.planet}: ${item.simpleMeaning}`,
      ),
      evidenceTable: significatorRows,
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: mode === 'PREMIUM' ? 'Significator Hierarchy' : 'Main Event Carriers',
    },
  ];

  if (mode === 'PREMIUM') {
    sections.push({
      body:
        'Premium KP timing does not promise a date from one factor. It checks whether dasha, ruling planets, and transit triggers repeat the same event houses. If they do, timing becomes usable; if they do not, the event may be delayed or require a sharper question.',
      bullets: [
        `Dasha support: ${currentDasha}.`,
        ruling
          ? `Ruling planet chain: day ${ruling.dayLord}, Moon sign ${ruling.moonSignLord}, Moon star ${ruling.moonStarLord}, Moon sub ${ruling.moonSubLord}, Lagna sign ${ruling.lagnaSignLord}, Lagna star ${ruling.lagnaStarLord}, Lagna sub ${ruling.lagnaSubLord}.`
          : 'Ruling planet chain pending.',
        triggerWindows.length
          ? `Transit triggers: ${triggerWindows.map(transit => `${transit.planet} in ${transit.sign}`).join('; ')}.`
          : 'Transit trigger windows pending.',
        'Final premium likelihood must remain event-specific and evidence-weighted.',
      ],
      confidence: ruling ? 'medium' : 'low',
      evidence: [
        `Timing readiness: ${judgement.timingReadiness}.`,
        `Timing readiness state: ${judgement.timingReadinessState}.`,
        `Trigger windows: ${triggerWindows.length}.`,
      ],
      evidenceTable: [
        {
          confidence: ruling ? 'medium' : 'low',
          factor: 'Ruling planets',
          implication: ruling
            ? 'Ruling planets are available for timing cross-check, but must repeat the selected event houses before a strong date window is claimed.'
            : 'Ruling planets are not ready, so timing must stay cautious.',
          observation: ruling
            ? `Day ${ruling.dayLord}; Moon star ${ruling.moonStarLord}; Lagna sub ${ruling.lagnaSubLord}.`
            : 'Pending.',
        },
        {
          confidence: 'medium',
          factor: 'Dasha support',
          implication: 'Dasha is used as timing support, not as a Vedic personality chapter.',
          observation: currentDasha,
        },
      ],
      eyebrow: 'KP PREDICTA',
      tier: 'premium',
      title: 'Ruling Planets and Timing Support',
    });
  }

  sections.push({
    body:
      'KP report boundary: this report stays inside Krishnamurti Paddhati. It may use birth data and dasha as timing inputs, but it does not import Parashari personality reading, Navamsa interpretation, remedies, panchang storytelling, Numerology, Nadi, or Signature analysis.',
    bullets: [
      'Best for: career event, marriage timing, property, money, litigation, travel, admission, job change, or one clearly stated custom event.',
      'Not enough for: broad life purpose, general personality, or mixed-school synthesis.',
      'Use one exact question and one time window for the next KP reading.',
    ],
    confidence: 'high',
    evidence: [
      'School boundary: KP only.',
      'D1/D9 Parashari chart pages are intentionally excluded from KP report output.',
      'KP chart remains included as the cusp-oriented report chart.',
    ],
    evidenceTable: [
      {
        confidence: 'high',
        factor: 'Method boundary',
        implication: 'The report must remain event-first and KP-only.',
        observation: 'KP cusps, sub lords, significators, ruling planets, dasha support, and trigger windows.',
      },
      {
        confidence: 'medium',
        factor: 'Question clarity',
        implication: 'A sharper event question unlocks stronger likelihood and timing.',
        observation: judgement.questionClarityState,
      },
    ],
    eyebrow: 'KP PREDICTA',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: 'KP Method Boundary',
  });

  return sections;
}

function composeEmptyReport(mode: PDFMode, language: SupportedLanguage): PdfComposition {
  return {
    chartSnapshots: [],
    cover: {
      birthMomentSignature: [],
      birthPlace: 'Birth place pending',
      birthTime: 'Birth time pending',
      dateOfBirth: 'Birth date pending',
      descriptor: 'A Predicta Vedic Intelligence Report',
      metadata: ['Generate a kundli to unlock chart-derived synthesis'],
      preparationLine: 'Prepared after birth chart, panchang, dasha, and classical Jyotish data are available',
      reportType: mode === 'PREMIUM' ? 'Premium Vedic Report' : 'Free Kundli Report',
      subjectName: 'Predicta User',
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
    footer: 'Prepared by Predicta @2026',
    houseWisePlanetRows: [],
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

function buildReportCover(
  kundli: KundliData,
  reportFocus: PdfReportFocus,
  mode: PDFMode,
  signatureAnalysis?: SignatureAnalysisModel,
): PdfComposition['cover'] {
  const birthLine = `${kundli.birthDetails.date} at ${kundli.birthDetails.time}`;
  const rectificationLine =
    kundli.birthDetails.timeConfidence === 'rectified'
      ? `Rectified time used; original entered time: ${kundli.birthDetails.originalTime ?? 'not recorded'}`
      : undefined;
  const editLine = kundli.editHistory?.length
    ? `Edited ${kundli.editHistory.length} time${kundli.editHistory.length === 1 ? '' : 's'}; latest saved details are used`
    : undefined;
  const baseMetadata = [
    birthLine,
    rectificationLine,
    editLine,
    kundli.birthDetails.place,
  ].filter((item): item is string => Boolean(item));
  const baseCover = buildBaseCoverIdentity(kundli, reportFocus, mode);

  if (reportFocus === 'KP') {
    const kp = composeChalitBhavKpFoundation(kundli, { depth: 'FREE' }).kp;
    return {
      ...baseCover,
      birthMomentSignature: [
        `Verdict: ${kp.eventJudgement.verdictLabel}`,
        `Timing: ${kp.eventJudgement.timingReadinessState}`,
        `KP cusps: ${kp.cusps.length}`,
      ],
      descriptor: 'A Predicta KP Event Answer Report',
      metadata: [
        ...baseMetadata,
        `KP cusps ${kp.cusps.length} | significators ${kp.significators.length}`,
      ],
      preparationLine:
        'Prepared with KP cusps, star lords, sub lords, significators, ruling planets, dasha timing support, and event-readiness proof',
      subtitle: `KP Predicta Event Report for ${kundli.birthDetails.name}`,
      title: 'PREDICTA',
    };
  }

  if (reportFocus === 'NADI') {
    const plan = composeNadiJyotishPlan(kundli, { depth: 'FREE' });
    return {
      ...baseCover,
      birthMomentSignature: [
        `Story: ${compactReportPhrase(plan.storyLens.strongestThread, 48)}`,
        `Axis: Rahu/Ketu`,
        `Validation: ${plan.validationStatus}`,
      ],
      descriptor: 'A Predicta Nadi Karmic Story Report',
      metadata: [
        ...baseMetadata,
        `Nadi story patterns ${plan.patterns.length} | validation questions ${plan.validationQuestions.length}`,
      ],
      preparationLine:
        'Prepared with Nadi-style planetary story links, Rahu/Ketu axis, validation questions, and activation timing',
      reportType: mode === 'PREMIUM' ? 'Premium Nadi Karmic Story Report' : 'Free Nadi Karmic Story Report',
      subtitle: `Nadi Predicta Karmic Story Report for ${kundli.birthDetails.name}`,
      title: 'PREDICTA',
    };
  }

  if (reportFocus === 'NUMEROLOGY') {
    const profile =
      kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
    return {
      ...baseCover,
      birthMomentSignature:
        profile.status === 'ready'
          ? [
              `Name: ${profile.nameNumber.root}`,
              `Birth: ${profile.birthNumber.root}`,
              `Destiny: ${profile.destinyNumber.root}`,
              `Today: ${profile.personalDay.root}`,
            ]
          : ['Name and birth date required'],
      descriptor: 'A Predicta Numerology Number Identity Report',
      metadata: [
        ...baseMetadata.slice(0, 3),
        profile.status === 'ready'
          ? `Name ${profile.nameNumber.root} | Birth ${profile.birthNumber.root} | Destiny ${profile.destinyNumber.root}`
          : 'Name and birth date required for Numerology profile',
      ],
      preparationLine:
        profile.status === 'ready'
          ? 'Prepared with name rhythm, birth code, destiny number, personal cycle timing, missing/repeated number pattern, and number identity guidance'
          : 'Prepared after name and birth-date number inputs are available',
      reportType: mode === 'PREMIUM' ? 'Premium Numerology Number Identity Report' : 'Free Numerology Number Identity Report',
      subtitle: `Numerology Predicta Number Report for ${kundli.birthDetails.name}`,
      title: 'PREDICTA',
    };
  }

  if (reportFocus === 'SIGNATURE') {
    return {
      ...baseCover,
      metadata: [
        kundli.birthDetails.name,
        'Confirmed visible signature traits only',
        'Reflective guidance, not forensic handwriting analysis',
      ],
      subtitle: `Signature Predicta Reflection Report for ${kundli.birthDetails.name}`,
      title: 'PREDICTA',
    };
  }

  if (reportFocus === 'LIFE_ATLAS') {
    const atlas = composeLifeAtlasReport(kundli, { depth: mode, signatureAnalysis });
    const signatureLine = signatureAnalysis?.status === 'ready'
      ? 'Signature: confirmed expression layer'
      : 'Signature: optional enrichment only';

    return {
      ...baseCover,
      birthMomentSignature: [
        `Hidden Thread: ${compactReportPhrase(atlas.hiddenThread, 48)}`,
        `Current Chapter: ${compactReportPhrase(atlas.currentFocus, 48)}`,
        signatureLine,
      ],
      descriptor: 'A Predicta Life Atlas Synthesis Report',
      metadata: [
        ...baseMetadata.slice(0, 3),
        'Core inputs: Vedic, KP, Nadi, and Numerology',
        signatureLine,
      ],
      preparationLine:
        signatureAnalysis?.status === 'ready'
          ? 'Prepared from your birth profile, timing rhythm, number pattern, and confirmed expression signals'
          : 'Prepared from your birth profile, timing rhythm, and number pattern',
      reportType: mode === 'PREMIUM' ? 'Premium Predicta Life Atlas' : 'Free Predicta Life Atlas',
      subtitle: `Predicta Life Atlas for ${kundli.birthDetails.name}`,
      title: 'PREDICTA',
    };
  }

  return {
    ...baseCover,
    metadata: [
      ...baseMetadata,
      `${kundli.lagna} Lagna | ${kundli.moonSign} Moon | ${kundli.nakshatra}`,
    ],
    subtitle: `Personal Vedic Astrology Dossier for ${kundli.birthDetails.name}`,
    title: 'PREDICTA',
  };
}

function compactReportPhrase(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').replace(/^The hidden thread is this:\s*/i, '').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}…`;
}

function buildBaseCoverIdentity(
  kundli: KundliData,
  reportFocus: PdfReportFocus,
  mode: PDFMode,
): Omit<PdfComposition['cover'], 'metadata' | 'subtitle'> {
  const focusLabel = getCoverReportFocusLabel(reportFocus);
  const currentDasha = kundli.dasha?.current?.mahadasha;
  const moonPada = kundli.planets.find(planet => planet.name === 'Moon')?.pada;
  const birthMomentSignature = [
    kundli.nakshatra
      ? `Moon: ${kundli.nakshatra}${moonPada ? ` Pada ${moonPada}` : ''}`
      : undefined,
    kundli.lagna ? `Lagna: ${kundli.lagna}` : undefined,
    currentDasha ? `Current Dasha: ${currentDasha}` : undefined,
  ].filter((item): item is string => Boolean(item));

  return {
    birthMomentSignature,
    birthPlace: kundli.birthDetails.place,
    birthTime: kundli.birthDetails.time,
    dateOfBirth: kundli.birthDetails.date,
    descriptor: `A Predicta ${focusLabel} Intelligence Report`,
    preparationLine: 'Prepared with birth chart, panchang, dasha, and classical Jyotish analysis',
    reportType: `${mode === 'PREMIUM' ? 'Premium' : 'Free'} ${focusLabel} Report`,
    subjectName: kundli.birthDetails.name,
    title: 'PREDICTA',
  };
}

function getCoverReportFocusLabel(reportFocus: PdfReportFocus): string {
  switch (reportFocus) {
    case 'KP':
      return 'KP';
    case 'NADI':
      return 'Nadi';
    case 'NUMEROLOGY':
      return 'Numerology';
    case 'SIGNATURE':
      return 'Signature';
    case 'LIFE_ATLAS':
      return 'Life Atlas';
    case 'CAREER':
      return 'Career';
    case 'COMPATIBILITY':
      return 'Compatibility';
    case 'DASHA':
      return 'Dasha';
    case 'MARRIAGE':
      return 'Marriage';
    case 'REMEDIES':
      return 'Remedies';
    case 'SADESATI':
      return 'Sade Sati';
    case 'VEDIC':
    case 'KUNDLI':
    case 'WEALTH':
    default:
      return reportFocus === 'WEALTH' ? 'Wealth' : 'Vedic';
  }
}

function buildDossierExecutiveSummary(
  kundli: KundliData,
  mode: PDFMode,
  reportFocus: PdfReportFocus = 'KUNDLI',
  signatureAnalysis?: SignatureAnalysisModel,
): PdfComposition['executiveSummary'] {
  const current = kundli.dasha.current;
  const confidence = kundli.rectification?.needsRectification
    ? 'medium'
      : kundli.birthDetails.isTimeApproximate
        ? 'medium'
        : 'high';

  if (reportFocus === 'KP') {
    const kp = composeChalitBhavKpFoundation(kundli, { depth: mode }).kp;
    const judgement = kp.eventJudgement;
    return {
      confidence,
      headline: `${kundli.birthDetails.name}'s KP report starts with an event-readiness verdict, then shows the KP chart, cusp/sub-lord proof, significators, ruling planets, and timing support.`,
      keySignals: [
        `Current KP verdict: ${judgement.verdictLabel}. ${judgement.plainLanguage}`,
        `Question state: ${judgement.questionClarityState}; ask one exact event and time window for a final likelihood.`,
        `Timing readiness: ${judgement.timingReadiness}`,
        `KP cusps available: ${kp.cusps.length}; significators available: ${kp.significators.length}.`,
        kp.rulingPlanets
          ? `Ruling planets: day ${kp.rulingPlanets.dayLord}, Moon star ${kp.rulingPlanets.moonStarLord}, Lagna sub ${kp.rulingPlanets.lagnaSubLord}.`
          : 'Ruling planets are pending.',
        `${mode === 'PREMIUM' ? 'Premium KP adds full cusp chain, hierarchy, timing cross-check, and proof appendix.' : 'Free KP gives the verdict compass, main carriers, and next question without becoming a Vedic report.'}`,
      ],
    };
  }

  if (reportFocus === 'NADI') {
    const plan = composeNadiJyotishPlan(kundli, { depth: mode });
    return {
      confidence,
      headline: `${kundli.birthDetails.name}'s Nadi report starts with the strongest karmic story thread, then validates the Rahu/Ketu axis, repeating lesson, activation windows, and next practice.`,
      keySignals: [
        `Strongest thread: ${plan.storyLens.strongestThread}`,
        `Hidden pattern: ${plan.storyLens.hiddenPatternSentence}`,
        `Rahu/Ketu axis: ${plan.rahuKetuAxis.pullsForward} ${plan.rahuKetuAxis.learningToRelease}`,
        `Validation bridge: ${plan.validationStatus}; ${plan.validationQuestions.length} questions available before deeper timing.`,
        mode === 'PREMIUM'
          ? 'Premium Nadi adds the fuller story map, activation windows, validation-based deepening, and practices.'
          : 'Free Nadi gives the main story, gift, caution, validation bridge, and next practice without becoming a Vedic report.',
      ],
    };
  }

  if (reportFocus === 'NUMEROLOGY') {
    const profile =
      kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
    const dashboard = profile.identityDashboard;
    return {
      confidence: profile.status === 'ready' ? 'medium' : 'low',
      headline:
        profile.status === 'ready'
          ? `${kundli.birthDetails.name}'s Numerology report starts with the Number Signature, then reads name rhythm, birth code, current cycle, missing/repeated numbers, and practical life guidance without Kundli judgement.`
          : `${kundli.birthDetails.name}'s Numerology report is pending name and birth-date readiness.`,
      keySignals:
        profile.status === 'ready'
          ? [
              `Number Signature: name ${profile.nameNumber.root}, birth ${profile.birthNumber.root}, destiny ${profile.destinyNumber.root}, personal day ${profile.personalDay.root}.`,
              `Life theme: ${dashboard.lifeThemeSentence}`,
              `Current cycle: lean into ${dashboard.currentCycleLeanInto}; avoid ${dashboard.currentCycleAvoid}.`,
              `Missing/repeated grid: repeated ${dashboard.repeatedNumbers.join(', ') || 'none'}; missing ${dashboard.missingNumbers.join(', ') || 'none'}.`,
              `${mode === 'PREMIUM' ? 'Premium Numerology adds name scanner, fit score, name refinement, compatibility, full year timeline, and calculation appendix.' : 'Free Numerology gives the number identity, current cycle, strengths, cautions, and next action without becoming a Vedic report.'}`,
            ]
          : [
              'Numerology needs a stored name and birth date.',
              'No Kundli judgement is mixed into this report lane.',
            ],
    };
  }

  if (reportFocus === 'SIGNATURE') {
    const model =
      signatureAnalysis ?? composeSignatureAnalysisModel({ inputSource: 'manual-observation' });
    return {
      confidence: model.status === 'ready' ? 'medium' : 'low',
      headline:
        model.status === 'ready'
          ? `${kundli.birthDetails.name}'s Signature report reads confirmed visible traits as reflective self-expression guidance, not prediction or forensic proof.`
          : `${kundli.birthDetails.name}'s Signature report is pending a signature sample or confirmed visible observations.`,
      keySignals:
        model.status === 'ready'
          ? [
              `Confirmed traits: ${model.observedTraits.length}.`,
              model.summary,
              'Signature Predicta does not make hard fixed-personality, identity, legal, medical, hiring, or prediction claims.',
              `${mode === 'PREMIUM' ? 'Premium Signature adds trait comparison, before/after guidance, and refinement planning.' : 'Free Signature gives reflective visible-trait insight.'}`,
            ]
          : [
              'Signature sample or manual observation is required.',
              'No Numerology or Vedic synthesis is mixed into this Signature lane.',
            ],
    };
  }

  if (reportFocus === 'LIFE_ATLAS') {
    const atlas = composeLifeAtlasReport(kundli, {
      depth: mode,
      signatureAnalysis,
    });

    return {
      confidence,
      headline: `${kundli.birthDetails.name}'s Predicta Life Atlas turns birth profile, timing rhythm, number pattern, and life signals into one non-technical story about journey, soul purpose, current chapter, gifts, lessons, and next steps.`,
      keySignals: [
        atlas.synthesisFraming,
        atlas.hiddenThread,
        atlas.currentFocus,
        atlas.signatureNote,
        mode === 'PREMIUM'
          ? 'Premium Life Atlas adds deeper synthesis, karmic pattern map, integration practices, and a memorable closing letter.'
          : 'This Life Atlas stays useful with a clear soul portrait, current focus, gifts, lessons, and closing guidance.',
      ],
    };
  }

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
      ? 'Premium turns this into a full report spine: daily rhythm, life aim balance, timing room, sadhana path reference, and evidence rows.'
      : 'Free gives the useful spine first: what today asks, which life aim is active, and what practice keeps the reading grounded.';

  return {
    body:
      'This section joins the report into one human reading. Predicta reads the chart through today, life balance, timing, and one light supporting practice reference before moving into detailed chart sections.',
    bullets: [
      daily.headline,
      `Daily rhythm: morning - ${daily.morningPractice}; midday - ${daily.middayCheck}; evening - ${daily.eveningReview}`,
      `Life balance: ${purushartha.dominant.label} leads now; ${purushartha.needsCare.label} needs steadier care.`,
      `Personal Panchang: ${panchang.weekdayLord} day, ${panchang.tithi}, Moon rhythm ${panchang.moonNakshatra}.`,
      `Sadhana: ${activeStage.label} - ${activeStage.practice}`,
      `Featured room: ${featuredRoom.title} - ${featuredRoom.primaryFocus}`,
      `Supporting practice reference: ${daily.remedy}`,
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
      ? 'Every chart now opens with a direct life prediction first. Premium then adds evidence, timing windows, contradiction handling, cross-chart synthesis, and a compact appendix without making the reading feel mechanical.'
      : 'Free report explains what each chart is pointing toward in life before it drops into proof. The user gets a useful prediction first, not a wall of astrological mechanics.',
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

function buildVedicIntelligencePackagingSections(
  kundli: KundliData,
  mode: PDFMode,
): PdfSection[] {
  const intelligence = composeVedicIntelligenceContract({
    depth: mode === 'PREMIUM' ? 'PREMIUM' : 'FREE',
    kundli,
  });

  return [
    buildVedicSnapshotReportSection(intelligence, mode),
    buildMoonChartReportSection(intelligence, mode),
    buildMahadashaPhalaReportSection(intelligence, mode),
    ...buildHouseWisePlanetTableSections(intelligence, mode),
    ...buildFriendshipTableSections(intelligence, mode),
    buildBeneficMaleficReportSection(intelligence, mode),
    ...buildChalitTableReportSections(intelligence, mode),
    buildClassicalVedicReportSection(intelligence.panchang, 'PANCHANG', 'Panchang', mode),
    buildClassicalVedicReportSection(intelligence.samsa, 'SAMSA', 'Samsa', mode),
    buildClassicalVedicReportSection(
      intelligence.ghatakFavorable,
      'GHATAK / FAVORABLE',
      'Ghatak and favorable factors',
      mode,
    ),
    buildClassicalVedicReportSection(intelligence.swamsa, 'SWAMSA', 'Swamsa chart', mode),
    buildClassicalVedicReportSection(intelligence.karakamsha, 'KARAKAMSHA', 'Karakamsha', mode),
    buildClassicalVedicReportSection(intelligence.ashtakavarga, 'ASHTAKAVARGA', 'Ashtakavarga', mode),
    buildClassicalVedicReportSection(
      intelligence.prastarashtakavarga,
      'PRASTARASHTAKAVARGA',
      'Prastarashtakavarga',
      mode,
    ),
    buildClassicalVedicReportSection(
      intelligence.avakhadaChakra,
      'AVAKHADA',
      'Avakhada chakra',
      mode,
    ),
  ];
}

function buildVedicReportStructureSections(
  kundli: KundliData,
  chartTypes: ChartType[],
  mode: PDFMode,
  language: SupportedLanguage,
): PdfSection[] {
  const intelligence = composeVedicIntelligenceContract({
    depth: mode === 'PREMIUM' ? 'PREMIUM' : 'FREE',
    kundli,
  });

  return [
    // Phase 5 order lock: cover is handled by the renderer; sections begin with Birth Snapshot.
    buildBirthAndCalculationSection(kundli),
    buildVedicSnapshotReportSection(intelligence, mode),
    buildClassicalVedicReportSection(intelligence.panchang, 'PANCHANG', 'Panchang', mode),
    buildClassicalVedicReportSection(
      intelligence.avakhadaChakra,
      'AVAKHADA',
      'Avakhada chakra',
      mode,
    ),
    buildClassicalVedicReportSection(
      intelligence.ghatakFavorable,
      'GHATAK / FAVORABLE',
      'Ghatak and favorable factors',
      mode,
    ),
    buildCoreChartInterpretationSection(kundli, chartTypes, intelligence, mode, language),
    ...buildHouseWisePlanetTableSections(intelligence, mode),
    buildBeneficMaleficReportSection(intelligence, mode),
    buildMahadashaPhalaReportSection(intelligence, mode),
    ...buildFriendshipTableSections(intelligence, mode),
    ...buildChalitTableReportSections(intelligence, mode),
    buildClassicalVedicReportSection(intelligence.samsa, 'SAMSA', 'Samsa', mode),
    buildClassicalVedicReportSection(intelligence.swamsa, 'SWAMSA', 'Swamsa chart', mode),
    buildClassicalVedicReportSection(intelligence.karakamsha, 'KARAKAMSHA', 'Karakamsha', mode),
    buildClassicalVedicReportSection(intelligence.ashtakavarga, 'ASHTAKAVARGA', 'Ashtakavarga', mode),
    buildClassicalVedicReportSection(
      intelligence.prastarashtakavarga,
      'PRASTARASHTAKAVARGA',
      'Prastarashtakavarga',
      mode,
    ),
    ...(mode === 'PREMIUM'
      ? buildPremiumVargaInterpretationSections(kundli, chartTypes, mode, language)
      : []),
  ];
}

function buildCoreChartInterpretationSection(
  kundli: KundliData,
  chartTypes: ChartType[],
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
  language: SupportedLanguage,
): PdfSection {
  const snapshots = buildPdfChartSnapshots(kundli, chartTypes, language, 'KUNDLI');
  const snapshotByRole = new Map<PdfChartRole, PdfChartSnapshot>(
    snapshots.map(snapshot => [snapshot.chartRole, snapshot]),
  );
  const chalitChart = buildParashariChalitChart(kundli);
  const coreEntries: Array<{
    chart?: ChartData;
    label: string;
    profile?: ChartInsightProfile;
    role: PdfChartRole;
  }> = [
    {
      chart: kundli.charts.D1,
      label: 'D1/Rashi',
      role: 'D1',
    },
    {
      chart: intelligence.moonChart.chart,
      label: 'Moon/Chandra Lagna',
      profile: 'moon',
      role: 'MOON',
    },
    {
      chart: kundli.charts.D9,
      label: 'D9/Navamsa',
      role: 'D9',
    },
    {
      chart: kundli.charts.D10,
      label: 'D10/Dashamsa',
      role: 'D10',
    },
    {
      chart: chalitChart,
      label: 'Chalit',
      profile: 'chalit',
      role: 'CHALIT',
    },
  ];
  const bullets = coreEntries.map(entry => {
    if (!entry.chart?.supported) {
      return `${entry.label}: chart evidence is pending, so Predicta does not invent a prediction for this layer.`;
    }

    const insight = composeChartInsight({
      chart: entry.chart,
      hasPremiumAccess: mode === 'PREMIUM',
      kundli,
      profile: entry.profile,
    });
    const premiumLine =
      mode === 'PREMIUM'
        ? ` Premium depth: ${insight.premiumInsight?.headline ?? insight.premiumDeepDive[0] ?? 'deeper evidence, timing, and contradiction handling are applied.'}`
        : '';

    return `${entry.label}: ${compactPdfText(insight.whatItSays, 210)} ${compactPdfText(insight.currentGuidance, 150)}${premiumLine}`;
  });

  return {
    body:
      'Core charts come first because the user needs the main prediction before tables. Predicta reads D1, Moon, D9, D10, and Chalit in a fixed order, then uses later sections as evidence.',
    bullets,
    evidence: [
      'Approved focus chart order: D1/Rashi -> Moon/Chandra Lagna -> D9/Navamsa -> D10/Dashamsa -> Chalit.',
      `Chart pages generated before interpretation: ${snapshots.map(snapshot => snapshot.chartRole).join(', ') || 'none'}.`,
      `Core chart snapshots available: ${coreEntries.filter(entry => snapshotByRole.has(entry.role)).map(entry => entry.label).join(', ') || 'none'}.`,
    ],
    evidenceTable: coreEntries.map(entry => {
      const insight = entry.chart?.supported
        ? composeChartInsight({
            chart: entry.chart,
            hasPremiumAccess: mode === 'PREMIUM',
            kundli,
            profile: entry.profile,
          })
        : undefined;

      return {
        confidence: entry.chart?.supported ? 'high' : 'low',
        factor: entry.label,
        implication: insight
          ? compactPdfText(insight.currentGuidance, 150)
          : 'Do not invent a prediction until this chart is calculated.',
        observation: insight
          ? compactPdfText(insight.whatItSays, 150)
          : `${entry.role} chart snapshot pending or unavailable.`,
      };
    }),
    eyebrow: 'CORE CHARTS FIRST',
    title: mode === 'PREMIUM'
      ? 'Core chart interpretation with premium depth'
      : 'Core chart interpretation',
  };
}

function buildPremiumVargaInterpretationSections(
  kundli: KundliData,
  chartTypes: ChartType[],
  mode: PDFMode,
  language: SupportedLanguage,
): PdfSection[] {
  const premiumVargas = chartTypes.filter(
    chartType => !['D1', 'D9', 'D10'].includes(chartType),
  );
  const chunks = chunkArray(premiumVargas, 4);

  return ensureAtLeastOneChunk(chunks).flatMap((chunk, index) => {
    if (!chunk.length) {
      return [];
    }

    return [{
      body:
        index === 0
          ? 'Premium vargas remain available as detailed predictive lenses, but they are grouped after core charts, evidence tables, Mahadasha Phala, and classical tables so the report does not feel scattered.'
          : 'Continuation of premium varga interpretation, kept in readable groups instead of crowding the page.',
      bullets: chunk.map(chartType => {
        const chart = kundli.charts[chartType];
        const insight = chart
          ? composeChartInsight({
              chart,
              hasPremiumAccess: true,
              kundli,
            })
          : undefined;

        return insight
          ? `${chartType}: ${compactPdfText(insight.whatItSays, 190)} Premium reading: ${compactPdfText(insight.premiumInsight?.headline ?? insight.premiumDeepDive[0] ?? insight.currentGuidance, 150)}`
          : `${chartType}: chart evidence is pending, so this varga is not interpreted as a prediction yet.`;
      }),
      evidence: [
        `Premium vargas in this group: ${chunk.join(', ')}.`,
        `Language context for chart labels: ${language}.`,
        'D1 remains the anchor; premium vargas refine a topic instead of replacing the root chart.',
      ],
      eyebrow: 'PREMIUM VARGAS',
      tier: 'premium' as const,
      title: index === 0
        ? 'Premium varga predictive sections'
        : `Premium varga predictive sections (continued ${index + 1})`,
    }];
  });
}

function buildVedicSnapshotReportSection(
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection {
  const snapshot = intelligence.snapshot;

  return {
    body:
      `${snapshot.explanation} ${vedicSectionMeaning(snapshot, mode)}`,
    bullets: [
      `Lagna ${snapshot.lagna}; Moon ${snapshot.moonSign}; Nakshatra ${snapshot.nakshatra}.`,
      `Current dasha: ${snapshot.currentDasha}.`,
      `Strongest houses: ${snapshot.strongestHouses.join(', ') || 'pending'}. Weakest houses: ${snapshot.weakestHouses.join(', ') || 'pending'}.`,
      `Chart order: ${intelligence.chartOrder.map(item => item.title).join(' -> ') || 'pending'}.`,
    ],
    evidence: [
      `Contract generated for ${intelligence.ownerName} at ${intelligence.generatedAt}.`,
      `Graha labels available: ${intelligence.grahaVisualMetadata.map(item => item.displayLabel).join(', ')}.`,
      ...sectionEvidence(snapshot),
    ],
    eyebrow: 'VEDIC INTELLIGENCE CONTRACT',
    title: 'Vedic snapshot',
  };
}

function buildMoonChartReportSection(
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection {
  const moonChart = intelligence.moonChart;

  return {
    body: `${moonChart.explanation} ${vedicSectionMeaning(moonChart, mode)}`,
    bullets: [
      `Moon chart status: ${moonChart.status === 'ready' ? 'ready and required' : 'pending'}.`,
      `Chart order remains fixed: Lagna/Rashi D1 first, Moon/Chandra Lagna second, Navamsa D9 third, then other vargas.`,
      `Moon chart reference: Chandra Lagna from ${intelligence.snapshot.moonSign} Moon.`,
      moonChart.limitations[0] ?? 'Moon chart is read as an emotional and lived-experience lens, not a replacement for Lagna.',
    ],
    evidence: sectionEvidence(moonChart),
    eyebrow: 'MOON CHART',
    title: 'Moon Chart / Chandra Lagna Chart',
  };
}

function buildMahadashaPhalaReportSection(
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection {
  const mahadasha = intelligence.mahadashaPhala;
  const currentBlocks = [
    mahadasha.currentEntireMahadasha,
    mahadasha.currentMahadashaAntardasha,
    mahadasha.currentMahadashaAntardashaPratyantardasha,
  ];
  const pastBlocks = mahadasha.pastMahadashas.slice(0, mode === 'PREMIUM' ? 6 : 3);
  const blockText = (block: VedicMahadashaPhalaBlock) =>
    `${block.title} (${block.period}): ${compactPdfText(mode === 'PREMIUM' ? block.premiumAnalysis : block.freeInsight, 170)}`;

  return {
    body:
      `${mahadasha.explanation} Past Mahadashas are summarized at Mahadasha level only; they do not expand into Antardasha or Pratyantardasha drill-down.`,
    bullets: [
      ...currentBlocks.map(blockText),
      pastBlocks.length
        ? `Past Mahadasha summaries: ${pastBlocks.map(block => block.title).join(', ')}.`
        : 'Past Mahadasha summaries will appear when the dasha timeline exposes completed periods.',
    ],
    evidence: [
      ...sectionEvidence(mahadasha),
      mahadasha.pratyantardashaCaution,
      ...(mode === 'PREMIUM'
        ? ['Premium keeps the current Pratyantardasha to one careful paragraph because the layer is too fine to overstate.']
        : ['Free keeps the current Pratyantardasha practical and concise.']),
    ],
    evidenceTable: [
      ...currentBlocks.map(block => mahadashaBlockToEvidenceRow(block, mode)),
      ...pastBlocks.slice(0, 1).map(block => mahadashaBlockToEvidenceRow(block, mode)),
    ],
    eyebrow: 'MAHADASHA PHALA',
    title: 'Mahadasha Phala and Meaning',
  };
}

function buildHouseWisePlanetTableSections(
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection[] {
  const section = intelligence.houseWisePlacements;
  const rows = section.rows;
  const chunks = chunkArray(rows, 4);

  return ensureAtLeastOneChunk(chunks).map((chunk, index) => ({
    body:
      index === 0
        ? `${section.explanation} ${vedicSectionMeaning(section, mode)}`
        : 'Continuation of the same house-wise planet table, kept in readable row blocks so no planet is hidden or cramped.',
    bullets: index === 0
      ? [
          `Rows included: ${rows.length}.`,
          'Each row keeps house, sign, degree, nakshatra, retrograde, combustion, exaltation, debilitation, and dignity visible.',
          section.limitations[0] ?? 'Combustion and dignity are read conservatively with visible chart data.',
        ]
      : [`Rows ${index * 4 + 1}-${index * 4 + chunk.length} of ${rows.length}.`],
    evidence: sectionEvidence(section),
    evidenceTable: chunk.map(row => ({
      confidence: 'high' as const,
      factor: row.planet,
      observation: `House ${row.house}; ${row.sign} ${formatDegree(row.degree)}; ${row.nakshatra} pada ${row.pada}.`,
      implication: [
        row.dignity,
        row.retrograde ? 'retrograde' : 'direct',
        row.combust ? 'combust' : 'not combust',
        row.exalted ? 'exalted' : '',
        row.debilitated ? 'debilitated' : '',
      ].filter(Boolean).join('; '),
    })),
    eyebrow: 'HOUSE-WISE TABLE',
    title: index === 0 ? 'House-wise planet table' : `House-wise planet table (continued ${index + 1})`,
  }));
}

function buildFriendshipTableSections(
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection[] {
  const section = intelligence.friendshipTable;
  const rows = section.rows;
  const chunks = chunkArray(rows, 4);

  return ensureAtLeastOneChunk(chunks).map((chunk, index) => ({
    body:
      index === 0
        ? `${section.explanation} ${vedicSectionMeaning(section, mode)}`
        : 'Continuation of the planet friendship table, split into readable blocks instead of a dense wall.',
    bullets: index === 0
      ? [
          `Rows included: ${rows.length}.`,
          'Natural, temporary, and compound relationship language is kept separate so the report does not over-simplify compatibility between grahas.',
          section.limitations[0] ?? 'Relationship status is evidence, not a single final judgement.',
        ]
      : [`Rows ${index * 4 + 1}-${index * 4 + chunk.length} of ${rows.length}.`],
    evidence: sectionEvidence(section),
    evidenceTable: chunk.map(row => ({
      confidence: 'medium' as const,
      factor: row.fromPlanet,
      observation: `Compound friends: ${summarizeRelationMap(row.compoundRelationships, 'friend')}; compound enemies: ${summarizeRelationMap(row.compoundRelationships, 'enemy')}.`,
      implication: row.interpretation,
    })),
    eyebrow: 'FRIENDSHIP TABLE',
    title: index === 0 ? 'Planet friendship table' : `Planet friendship table (continued ${index + 1})`,
  }));
}

function buildBeneficMaleficReportSection(
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection {
  const section = intelligence.beneficMalefic;

  return {
    body: `${section.explanation} ${vedicSectionMeaning(section, mode)}`,
    bullets: [
      `Natural benefics: ${section.naturalBenefics.join(', ') || 'pending'}.`,
      `Natural malefics: ${section.naturalMalefics.join(', ') || 'pending'}.`,
      `Functional benefics for this Lagna: ${section.functionalBenefics.join(', ') || 'pending'}.`,
      `Functional malefics for this Lagna: ${section.functionalMalefics.join(', ') || 'pending'}.`,
    ],
    evidence: sectionEvidence(section),
    evidenceTable: [
      {
        confidence: section.status === 'ready' ? 'high' : 'low',
        factor: 'Natural benefics',
        observation: section.naturalBenefics.join(', ') || 'pending',
        implication: 'Shows generally supportive graha nature before Lagna-specific ownership is applied.',
      },
      {
        confidence: section.status === 'ready' ? 'high' : 'low',
        factor: 'Natural malefics',
        observation: section.naturalMalefics.join(', ') || 'pending',
        implication: 'Shows generally sharper graha nature before Lagna-specific ownership is applied.',
      },
      {
        confidence: section.status === 'ready' ? 'medium' : 'low',
        factor: 'Functional benefics',
        observation: section.functionalBenefics.join(', ') || 'pending',
        implication: 'Shows planets that tend to support this specific Lagna by house ownership.',
      },
      {
        confidence: section.status === 'ready' ? 'medium' : 'low',
        factor: 'Functional malefics',
        observation: section.functionalMalefics.join(', ') || 'pending',
        implication: 'Shows planets that need more care for this specific Lagna by house ownership.',
      },
    ],
    eyebrow: 'BENEFIC / MALEFIC',
    title: 'Benefics and malefics',
  };
}

function buildChalitTableReportSections(
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection[] {
  const section = intelligence.chalitTable;
  const rows = section.rows;
  const chunks = chunkArray(rows, 4);

  return ensureAtLeastOneChunk(chunks).map((chunk, index) => ({
    body:
      index === 0
        ? `${section.explanation} ${vedicSectionMeaning(section, mode)}`
        : 'Continuation of the Chalit table, split into readable row blocks.',
    bullets: index === 0
      ? [
          `Rows included: ${rows.length}.`,
          `${rows.filter(row => row.shifted).length} planets shift house in the Chalit layer.`,
          section.limitations[0] ?? 'Chalit is used as a house-strength refinement, not as a replacement for Rashi chart identity.',
        ]
      : [`Rows ${index * 4 + 1}-${index * 4 + chunk.length} of ${rows.length}.`],
    evidence: sectionEvidence(section),
    evidenceTable: chunk.map(row => ({
      confidence: 'medium' as const,
      factor: row.planet,
      observation: `Rashi house ${row.rashiHouse} (${row.rashiSign}) -> Chalit house ${row.chalitHouse}.`,
      implication: row.shifted
        ? `House emphasis shifts ${row.shiftDirection}; read the planet through both Rashi and Chalit context.`
        : 'House emphasis stays stable between Rashi and Chalit.',
    })),
    eyebrow: 'CHALIT TABLE',
    title: index === 0 ? 'Chalit table' : `Chalit table (continued ${index + 1})`,
  }));
}

function buildClassicalVedicReportSection(
  section: VedicIntelligenceSection,
  eyebrow: string,
  title: string,
  mode: PDFMode,
): PdfSection {
  return {
    body: `${section.explanation} ${vedicSectionMeaning(section, mode)}`,
    bullets: uniqueValues([
      `Status: ${section.status}.`,
      section.status === 'ready' ? section.freeInsight : section.limitations[0] ?? 'This layer is pending verified calculation data.',
      ...(mode === 'PREMIUM'
        ? [section.premiumAnalysis]
        : ['Free includes the useful meaning and honest calculation boundary without turning this into a technical wall.']),
      section.limitations[0] ?? 'No additional limitation is listed for this layer.',
    ]),
    evidence: sectionEvidence(section),
    evidenceTable: sectionEvidence(section).slice(0, 4).map(item => ({
      confidence: section.status === 'ready' ? 'medium' : 'low',
      factor: title,
      observation: item,
      implication: section.status === 'ready'
        ? vedicSectionMeaning(section, mode)
        : 'Predicta shows the boundary instead of inventing unsupported detail.',
    })),
    eyebrow,
    title,
  };
}

function mahadashaBlockToEvidenceRow(
  block: VedicMahadashaPhalaBlock,
  mode: PDFMode,
): PdfEvidenceRow {
  return {
    confidence: block.limitations.length ? 'medium' : 'high',
    factor: block.title,
    observation: block.period,
    implication: compactPdfText(mode === 'PREMIUM' ? block.premiumAnalysis : block.freeInsight, 130),
  };
}

function vedicSectionMeaning(
  section: VedicIntelligenceSection,
  mode: PDFMode,
): string {
  if (section.status !== 'ready') {
    return section.limitations[0] ?? 'Predicta marks this layer pending until verified data is available.';
  }

  return mode === 'PREMIUM' ? section.premiumAnalysis : section.freeInsight;
}

function sectionEvidence(section: VedicIntelligenceSection): string[] {
  const evidence = section.evidence.map(item => `${item.source}: ${item.observation}`);

  return evidence.length ? evidence : section.limitations;
}

function summarizeRelationMap(
  relations: Record<string, 'enemy' | 'friend' | 'neutral' | 'pending'>,
  relation: 'enemy' | 'friend' | 'neutral' | 'pending',
): string {
  const matches = Object.entries(relations)
    .filter(([, value]) => value === relation)
    .map(([planet]) => planet);

  return matches.length ? matches.join(', ') : 'none';
}

function formatDegree(degree: number): string {
  return `${Number.isFinite(degree) ? degree.toFixed(2) : '0.00'}deg`;
}

function compactPdfText(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
}

function ensureAtLeastOneChunk<T>(chunks: T[][]): T[][] {
  return chunks.length ? chunks : [[]];
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
  const freeLine = insight.currentGuidance;
  const premiumLine = hasPremiumAccess
    ? insight.premiumInsight
      ? `Premium prediction depth: ${insight.premiumInsight.headline}`
      : `Premium prediction depth: ${insight.premiumDeepDive[0] ?? 'Premium adds timing, contradiction handling, and deeper synthesis.'}`
    : undefined;

  const timingLine = hasPremiumAccess
    ? insight.premiumInsight?.timingWindows[0]
    : insight.freeInsights[0];
  const appendixLine = snapshot
    ? `Evidence appendix: ${formatSnapshotOccupiedHouses(snapshot)}`
    : `${chartType} evidence appendix appears after chart preparation.`;
  const moonLine = snapshot?.moonNakshatraPada
    ? `${chartType} Moon rhythm: ${snapshot.moonNakshatraPada.moonPhaseLabel}; birth star ${snapshot.moonNakshatraPada.moonNakshatra}${
        snapshot.moonNakshatraPada.pada
          ? ` pada ${snapshot.moonNakshatraPada.pada}`
          : ''
      }.`
    : undefined;

  return [
    `${chartType} prediction: ${insight.whatItSays}`,
    `${chartType} support: ${insight.mainStrength}`,
    `${chartType} pressure: ${insight.mainChallenge}`,
    `${chartType} practical action: ${freeLine}`,
    ...(premiumLine ? [premiumLine] : []),
    ...(timingLine ? [`${chartType} timing or next step: ${timingLine}`] : []),
    `${chartType} evidence anchor: ${insight.governs}`,
    `${chartType} evidence appendix: ${appendixLine}`,
    ...(moonLine ? [moonLine] : []),
  ];
}

function buildPdfChartSnapshots(
  kundli: KundliData,
  chartTypes: ChartType[],
  language: SupportedLanguage = 'en',
  reportFocus: PdfReportFocus = 'KUNDLI',
): PdfChartSnapshot[] {
  const includeVedicFocusCharts = shouldIncludeMoonChart(reportFocus);
  const kpChart = reportFocus === 'KP' ? buildSchoolPreviewChart(kundli, 'KP') : undefined;
  const nadiChart = reportFocus === 'NADI' ? buildSchoolPreviewChart(kundli, 'NADI') : undefined;
  const moonChart = includeVedicFocusCharts
    ? composeVedicIntelligenceContract({ kundli }).moonChart.chart
    : undefined;
  const chalitChart = includeVedicFocusCharts
    ? buildParashariChalitChart(kundli)
    : undefined;
  const swamsaChart = includeVedicFocusCharts ? buildSwamsaChart(kundli) : undefined;
  const karakamshaChart = includeVedicFocusCharts ? buildKarakamshaChart(kundli) : undefined;
  const chartByRole = new Map<PdfChartRole, ChartData>();

  for (const chartType of chartTypes) {
    const chart = kundli.charts[chartType];

    if (chart?.supported) {
      chartByRole.set(chartType, chart);
    }
  }

  if (kpChart?.supported) {
    chartByRole.set('KP', kpChart);
  }

  if (nadiChart?.supported) {
    chartByRole.set('NADI', nadiChart);
  }

  if (moonChart?.supported) {
    chartByRole.set('MOON', moonChart);
  }

  if (chalitChart?.supported) {
    chartByRole.set('CHALIT', chalitChart);
  }

  if (swamsaChart?.supported) {
    chartByRole.set('SWAMSA', swamsaChart);
  }

  if (karakamshaChart?.supported) {
    chartByRole.set('KARAKAMSHA', karakamshaChart);
  }

  const orderedRoles: PdfChartRole[] = reportFocus === 'KP'
    ? ['KP']
    : reportFocus === 'NADI'
      ? ['NADI']
    : includeVedicFocusCharts
    ? [
        ...VEDIC_FOCUS_CHART_ORDER,
        'SWAMSA',
        'KARAKAMSHA',
        ...chartTypes.filter(chartType => !isVedicFocusChartType(chartType)),
      ]
    : chartTypes;
  const seenRoles = new Set<PdfChartRole>();
  const chartEntries = orderedRoles.flatMap(role => {
    if (seenRoles.has(role)) {
      return [];
    }

    seenRoles.add(role);
    const chart = chartByRole.get(role);

    return chart?.supported ? [{ chart, role }] : [];
  });

  return chartEntries.map(({ chart, role }) => {
    const plateChart = filterReportChartForMainPlate(chart);
    const model = buildChartRenderModel({
      birthDetails: kundli.birthDetails,
      chart: plateChart,
      language,
      presentation: 'full',
    });

    return {
      cells: model.cells.map(cell => ({
        house: cell.house,
        hiddenPlanetCount: 0,
        labelDensity: cell.labelDensity,
        maxVisiblePlanets: Math.max(cell.maxVisiblePlanets, cell.renderPlanets.length),
        planetGlyphSize: cell.planetGlyphSize,
        planets: cell.renderPlanets.map(planet => ({
          ...planet,
          degreeLabel: planet.degreeLabel,
          displayName: formatPdfGrahaName(planet.name, language),
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
      chartName: plateChart.name,
      chartRole: role,
      chartType: model.chartType,
      displayChartName: getReportChartDisplayName(role, model.displayChartName, language),
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
    };
  });
}

function getReportChartDisplayName(
  role: PdfChartRole,
  fallback: string,
  language: SupportedLanguage,
): string {
  if (role === 'KP') {
    return 'KP Bhav Chalit Cusp Chart';
  }

  if (role === 'NADI') {
    return 'Nadi Story Anchor Chart';
  }

  if (isVedicFocusChartRole(role)) {
    return getVedicFocusChartLabel(role, language);
  }

  if (role === 'SWAMSA') {
    return 'Swamsa Chart';
  }

  if (role === 'KARAKAMSHA') {
    return 'Karakamsha Chart';
  }

  return fallback;
}

function isVedicFocusChartRole(
  role: PdfChartRole,
): role is VedicFocusChartRole {
  return role === 'D1' || role === 'MOON' || role === 'D9' || role === 'D10' || role === 'CHALIT';
}

function isVedicFocusChartType(chartType: ChartType): boolean {
  return chartType === 'D1' || chartType === 'D9' || chartType === 'D10';
}

function filterReportChartForMainPlate(chart: ChartData): ChartData {
  const planetDistribution = chart.planetDistribution.filter(planet =>
    isClassicalGraha(planet.name),
  );

  return {
    ...chart,
    housePlacements: buildReportHousePlacementsFromPlanets(planetDistribution),
    planetDistribution,
    signPlacements: buildReportSignPlacementsFromPlanets(planetDistribution),
  };
}

function buildReportHousePlacementsFromPlanets(
  planets: PlanetPosition[],
): Record<number, string[]> {
  return planets.reduce<Record<number, string[]>>((placements, planet) => {
    placements[planet.house] = [...(placements[planet.house] ?? []), planet.name];
    return placements;
  }, {});
}

function buildReportSignPlacementsFromPlanets(
  planets: PlanetPosition[],
): Record<string, string[]> {
  return planets.reduce<Record<string, string[]>>((placements, planet) => {
    placements[planet.sign] = [...(placements[planet.sign] ?? []), planet.name];
    return placements;
  }, {});
}

function buildPdfHouseWisePlanetRows(
  kundli: KundliData,
  language: SupportedLanguage,
): PdfHouseWisePlanetRow[] {
  const d1 = kundli.charts.D1;

  if (!d1?.supported) {
    return [];
  }

  const model = buildChartRenderModel({
    birthDetails: kundli.birthDetails,
    chart: d1,
    language,
    presentation: 'full',
  });
  const planets = model.cells.flatMap(cell =>
    cell.renderPlanets
      .filter(planet => isClassicalGraha(planet.name))
      .map(planet => ({
        cell,
        planet,
      })),
  );

  return planets
    .sort((first, second) => (first.cell.house ?? 0) - (second.cell.house ?? 0) || first.planet.position.degree - second.planet.position.degree)
    .map(({ cell, planet }) => ({
      combust: planet.status.combust ? 'Yes' : 'No',
      debilitation: planet.status.debilitated ? 'Yes' : 'No',
      degree: planet.degreeLabel,
      dignity: planetDignity(planet.position),
      exaltation: planet.status.exalted ? 'Yes' : 'No',
      graha: formatPdfGrahaName(planet.name, language),
      house: String(cell.house ?? planet.position.house),
      nakshatraPada: `${planet.nakshatra} pada ${planet.pada}`,
      retrograde: planet.status.retrograde ? 'Yes' : 'No',
      sign: planet.displaySign,
    }));
}

function shouldIncludeMoonChart(reportFocus: PdfReportFocus): boolean {
  return !['KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'].includes(reportFocus);
}

function shouldIncludeHouseWisePlanetRows(reportFocus: PdfReportFocus): boolean {
  return !['KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'].includes(reportFocus);
}

function isClassicalGraha(name: string): boolean {
  return CLASSICAL_GRAHA_ORDER.includes(name);
}

function formatPdfGrahaName(
  name: string,
  language: SupportedLanguage,
): string {
  const names: Record<string, Record<SupportedLanguage, string>> = {
    Jupiter: { en: 'Jupiter', gu: 'Guru', hi: 'Brahaspati' },
    Ketu: { en: 'Ketu', gu: 'Ketu', hi: 'Ketu' },
    Mars: { en: 'Mars', gu: 'Mangal', hi: 'Mangal' },
    Mercury: { en: 'Mercury', gu: 'Budh', hi: 'Budh' },
    Moon: { en: 'Moon', gu: 'Chandra', hi: 'Chandra' },
    Rahu: { en: 'Rahu', gu: 'Rahu', hi: 'Rahu' },
    Saturn: { en: 'Saturn', gu: 'Shani', hi: 'Shani' },
    Sun: { en: 'Sun', gu: 'Surya', hi: 'Surya' },
    Venus: { en: 'Venus', gu: 'Shukra', hi: 'Shukra' },
  };

  return names[name]?.[language] ?? name;
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

function buildNadiReportSections(
  kundli: KundliData,
  mode: PDFMode,
): PdfSection[] {
  const plan = composeNadiJyotishPlan(kundli, { depth: mode });
  const isPremium = mode === 'PREMIUM';
  const patternLimit = isPremium ? 8 : 3;
  const activationLimit = isPremium ? 5 : 2;
  const validationLimit = isPremium ? 5 : 3;
  const patternRows = plan.patterns.slice(0, patternLimit).map(pattern => ({
    confidence: pattern.confidence,
    factor: pattern.title,
    implication: isPremium && pattern.premiumDetail ? pattern.premiumDetail : pattern.freeInsight,
    observation: pattern.observation,
  }));
  const activationRows = plan.activations.slice(0, activationLimit).map(activation => ({
    confidence: 'medium' as const,
    factor: activation.title,
    implication: isPremium && activation.premiumDetail ? activation.premiumDetail : activation.guidance,
    observation: `${activation.timing}: ${activation.trigger}`,
  }));
  const storyMapBullets = plan.patterns
    .slice(0, patternLimit)
    .map(pattern => `${pattern.title}: ${isPremium && pattern.premiumDetail ? pattern.premiumDetail : pattern.freeInsight}`);
  const validationQuestions = plan.validationQuestions.slice(0, validationLimit);

  const sections: PdfSection[] = [
    {
      body:
        `${plan.storyLens.strongestThread} This report reads the pattern as a living karmic story: the gift, the loop, the current lesson, and the practice that helps you move with more freedom.`,
      bullets: [
        `Hidden pattern sentence: ${plan.storyLens.hiddenPatternSentence}`,
        `Gift inside the pattern: ${plan.digest.giftInsidePattern}`,
        `Current lesson: ${plan.storyLens.activeLesson}`,
        `Shadow loop to watch: ${plan.storyLens.stuckPoint}`,
        `Next practice: ${plan.digest.nextPractice}`,
      ],
      confidence: plan.patterns.length ? 'medium' : 'low',
      evidence: [
        plan.freePreview,
        ...plan.storyLens.evidencePath,
        `Story evidence availability: ${plan.digest.storyEvidenceAvailability}.`,
      ],
      evidenceTable: [
        {
          confidence: 'medium',
          factor: 'Strongest story thread',
          implication: plan.storyLens.strongestThread,
          observation: plan.digest.activeStoryFocus,
        },
        {
          confidence: 'medium',
          factor: 'Gift',
          implication: plan.digest.giftInsidePattern,
          observation: plan.storyLens.shiftThatHelps,
        },
        {
          confidence: 'medium',
          factor: 'Lesson',
          implication: plan.storyLens.activeLesson,
          observation: plan.storyLens.repeatingPattern,
        },
      ],
      eyebrow: 'NADI',
      tier: isPremium ? 'premium' : 'free',
      title: 'Nadi Strongest Story Thread',
    },
    {
      body:
        `The Rahu-Ketu axis shows the pull of growth and the pattern that needs release. Here, the forward pull is ${plan.rahuKetuAxis.pullsForward.toLowerCase()} The release work is ${plan.rahuKetuAxis.learningToRelease.toLowerCase()}`,
      bullets: [
        `Pulls forward: ${plan.rahuKetuAxis.pullsForward}`,
        `Learning to release: ${plan.rahuKetuAxis.learningToRelease}`,
        `When it becomes louder: ${plan.rahuKetuAxis.becomesLouder}`,
        `Balance practice: ${plan.rahuKetuAxis.balancePractice}`,
      ],
      confidence: 'medium',
      evidence: [plan.digest.rahuKetuAxisSummary],
      evidenceTable: [
        {
          confidence: 'medium',
          factor: 'Forward pull',
          implication: plan.rahuKetuAxis.pullsForward,
          observation: 'Rahu side of the story axis.',
        },
        {
          confidence: 'medium',
          factor: 'Release work',
          implication: plan.rahuKetuAxis.learningToRelease,
          observation: 'Ketu side of the story axis.',
        },
        {
          confidence: 'medium',
          factor: 'Balance',
          implication: plan.rahuKetuAxis.balancePractice,
          observation: plan.rahuKetuAxis.becomesLouder,
        },
      ],
      eyebrow: 'NADI',
      tier: isPremium ? 'premium' : 'free',
      title: 'Rahu-Ketu Axis Card',
    },
    {
      body:
        `Nadi becomes useful when the story turns into a practice. The repeating pattern is ${plan.storyLens.repeatingPattern.toLowerCase()} The current lesson is ${plan.storyLens.activeLesson.toLowerCase()} The next practice is ${plan.rahuKetuAxis.balancePractice.toLowerCase()}`,
      bullets: [
        `Past Pattern -> Current Lesson -> Next Practice: ${plan.storyLens.repeatingPattern} -> ${plan.storyLens.activeLesson} -> ${plan.rahuKetuAxis.balancePractice}`,
        `Shift that helps: ${plan.storyLens.shiftThatHelps}`,
        `Activation summary: ${plan.storyLens.activationSummary}`,
        `Validation bridge: ${plan.storyLens.validationBridge}`,
      ],
      confidence: 'medium',
      evidence: [
        ...plan.digest.activationWindows.slice(0, activationLimit),
        'Past-pattern clues stay validation-led before deeper timing is stated.',
      ],
      evidenceTable: activationRows.length ? activationRows : undefined,
      eyebrow: 'NADI',
      tier: isPremium ? 'premium' : 'free',
      title: 'Past Pattern -> Current Lesson -> Next Practice',
    },
    {
      body:
        'Nadi should not pretend too early. The validation bridge asks a few direct questions so the reading can deepen from recognition instead of guessing. Answer what feels true, reject what does not, and let the next reading become sharper.',
      bullets: [
        `Validation status: ${plan.validationStatus}.`,
        ...validationQuestions.map(question => `Validation question: ${question}`),
        isPremium
          ? 'Premium uses validation answers to deepen story sequencing and activation timing.'
          : 'Free gives enough questions to test the story before upgrading into deeper sequencing.',
      ],
      confidence: plan.validationStatus === 'confirmed' ? 'high' : plan.validationStatus === 'partially-confirmed' ? 'medium' : 'low',
      evidence: [
        `Validation questions included: ${plan.validationQuestions.length}.`,
        plan.storyLens.validationBridge,
      ],
      evidenceTable: validationQuestions.map((question, index) => ({
        confidence: 'medium' as const,
        factor: `Question ${index + 1}`,
        implication: 'Use the answer to confirm, soften, or redirect the Nadi story before stronger timing.',
        observation: question,
      })),
      eyebrow: 'NADI',
      tier: isPremium ? 'premium' : 'free',
      title: 'Validation Bridge',
    },
  ];

  if (isPremium) {
    sections.push(
      {
        body:
          plan.premiumSynthesis ??
          'Premium Nadi turns the story map into a fuller sequence: which pattern is strongest, which planet links carry it, where it activates, and which practice keeps it constructive.',
        bullets: [
          `Planetary story map: ${plan.patterns.slice(0, 6).map(pattern => pattern.title).join('; ') || 'pending'}.`,
          `Karaka links: ${uniqueValues(plan.patterns.flatMap(pattern => pattern.planets)).join(', ') || 'pending'}.`,
          `Repeated life themes: ${uniqueValues(plan.patterns.flatMap(pattern => pattern.lifeAreas)).slice(0, 8).join(', ') || 'pending'}.`,
          ...storyMapBullets.slice(0, 5),
        ],
        confidence: plan.patterns.length ? 'medium' : 'low',
        evidence: [
          ...(plan.methodSummary ? [plan.methodSummary] : []),
          `Story patterns available: ${plan.patterns.length}.`,
          `Story Evidence Appendix: planetary story map, karaka links, validation status ${plan.validationStatus}, activation windows, and limitations are kept after the main reading.`,
        ],
        evidenceTable: patternRows,
        eyebrow: 'NADI',
        tier: 'premium',
        title: 'Planetary Story Map',
      },
      {
        body:
          'Activation windows are not fixed fate. They show when the story may become louder, when choices matter more, and where a practical response can keep the pattern from turning into pressure.',
        bullets: [
          ...plan.activations.slice(0, activationLimit).map(activation =>
            `${activation.title}: ${activation.timing}. ${activation.guidance}`,
          ),
          'Premium keeps activation timing evidence-weighted and avoids promising exact fate.',
        ],
        confidence: plan.activations.length ? 'medium' : 'low',
        evidence: [
          `Dasha/transit activation count: ${plan.activations.length}.`,
          ...plan.digest.activationWindows.slice(0, activationLimit),
        ],
        evidenceTable: activationRows,
        eyebrow: 'NADI',
        tier: 'premium',
        title: 'Activation Windows',
      },
    );
  }

  sections.push({
    body:
      'Nadi Method Boundary: this report stays inside Nadi-style planetary story intelligence. It does not become a KP cusp judgment, a Parashari personality report, Numerology, Signature analysis, or Life Atlas synthesis.',
    bullets: [
      'Best for: karmic patterns, repeated life themes, relationship mirrors, validation questions, activation periods, and gentle practices.',
      'Not for: unsupported palm-leaf manuscript claims, one-line fatalism, or technical Vedic chart dumping.',
      'A Nadi story should be validated through lived recognition before deeper timing is treated as strong.',
    ],
    confidence: 'high',
    evidence: [
      'School boundary: Nadi only.',
      'D1/D9 Parashari chart pages are intentionally excluded from Nadi report output.',
      'Nadi chart remains included as the story-anchor report chart.',
      'It does not claim palm-leaf manuscript access.',
      'Predicta does not claim access to real palm-leaf manuscripts or private lineage records.',
      ...plan.guardrails,
      ...plan.limitations,
    ],
    evidenceTable: [
      {
        confidence: 'high',
        factor: 'Method boundary',
        implication: 'Keep the main report as karmic story, validation, activation, and practice.',
        observation: 'Nadi-style planetary story links, Rahu/Ketu axis, validation questions, and activation timing.',
      },
      {
        confidence: 'high',
        factor: 'Source boundary',
        implication: 'The report must not claim palm-leaf manuscript access.',
        observation: 'Symbolic Nadi-style reading only.',
      },
    ],
    eyebrow: 'NADI',
    tier: isPremium ? 'premium' : 'free',
    title: 'Nadi Method Boundary',
  });

  return sections;
}

function buildNumerologyReportSections(
  kundli: KundliData,
  mode: PDFMode,
): PdfSection[] {
  const profile =
    kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
  const isPremium = mode === 'PREMIUM';

  if (profile.status !== 'ready') {
    return [{
      body:
        'Numerology needs the user name and birth date before it can prepare a number profile.',
      bullets: [
        'Add the full name and birth date to calculate name number, birth number, destiny number, and personal timing.',
        'Numerology stays separate from Parashari, KP, and Nadi unless a future approved synthesis report explicitly says so.',
      ],
      confidence: 'low',
      evidence: profile.evidence,
      eyebrow: 'NUMEROLOGY',
      tier: 'free',
      title: 'Numerology profile',
    }];
  }

  const dashboard = profile.identityDashboard;
  const timelinePreview = dashboard.personalYearTimeline
    .slice(0, isPremium ? 12 : 4)
    .map(month => `${month.monthLabel}: ${month.keyword} ${month.cycleNumber}. ${month.guidance}`);
  const mandalaRows: PdfEvidenceRow[] = dashboard.mandalaNodes.slice(0, 6).map(node => ({
    confidence: 'medium',
    factor: `Personal Number Mandala: ${node.label}`,
    implication: node.shortMeaning,
    observation: `${node.number} ${node.keyword}.`,
  }));
  const frequencyRows: PdfEvidenceRow[] = dashboard.frequencyMap.map(cell => ({
    confidence: cell.tone === 'missing' ? 'low' : 'medium',
    factor: `Number ${cell.number}`,
    implication: cell.insight,
    observation: `${cell.count} occurrence${cell.count === 1 ? '' : 's'}; ${cell.tone}; ${cell.keyword}.`,
  }));
  const sections: PdfSection[] = [
    {
      body:
        `${dashboard.lifeThemeSentence} Your Number Signature is a Numerology-only dossier and a practical identity map: how the name projects, how the birth date responds, what the destiny number keeps asking you to express, and what the current cycle wants from you now. Best Use Of This Cycle: ${dashboard.bestUseOfCurrentCycle}`,
      bullets: [
        `Life Theme Sentence: ${dashboard.lifeThemeSentence}`,
        `Best Use Of This Cycle: ${dashboard.bestUseOfCurrentCycle}`,
        `Name number ${profile.nameNumber.root} (${profile.nameNumber.label}): ${profile.nameNumber.simpleMeaning}.`,
        `Birth number ${profile.birthNumber.root} (${profile.birthNumber.label}): ${profile.birthNumber.simpleMeaning}.`,
        `Destiny number ${profile.destinyNumber.root} (${profile.destinyNumber.label}): ${profile.destinyNumber.simpleMeaning}.`,
        `Today: personal year ${profile.personalYear.root}, month ${profile.personalMonth.root}, day ${profile.personalDay.root}.`,
      ],
      confidence: 'medium',
      evidence: [
        profile.summary,
        dashboard.reportSummary,
        'It reads name rhythm and birth-date numbers without casually mixing other schools.',
        'Numerology-only: no Parashari charts, KP cusps, Nadi story links, or Signature traits are mixed into this report.',
      ],
      evidenceTable: mandalaRows,
      eyebrow: 'NUMEROLOGY',
      tier: isPremium ? 'premium' : 'free',
      title: 'Your Number Signature',
    },
    {
      body:
        `Name Rhythm: ${dashboard.nameStrength} ${dashboard.firstLetterInfluence} This is the public sound of the name, not a permanent life verdict. Use it to understand how the name rhythm supports steadiness, expression, and visibility.`,
      bullets: [
        `Name Energy Scanner: ${dashboard.nameScanner.reducedExpression}.`,
        `Normalized name: ${dashboard.nameScanner.normalizedName}.`,
        `Compound ${profile.nameNumber.compound} reduces to root ${profile.nameNumber.root}.`,
        `Method: ${profile.method.nameNumber}.`,
      ],
      confidence: 'medium',
      evidence: [
        dashboard.calculationNote,
        `Letters scanned: ${dashboard.nameScanner.steps.map(step => `${step.letter}:${step.value}`).join(', ') || 'pending'}.`,
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
          factor: 'First letter influence',
          implication: dashboard.firstLetterInfluence,
          observation: dashboard.nameScanner.normalizedName.charAt(0) || 'pending',
        },
      ],
      eyebrow: 'NUMEROLOGY',
      tier: isPremium ? 'premium' : 'free',
      title: 'Name Rhythm and Energy Scanner',
    },
    {
      body:
        `Birth Code: ${dashboard.maturityDirection} Birth and destiny numbers are read as the instinctive response pattern and the longer direction, so the report can move from number definition into usable life guidance.`,
      bullets: [
        `Birth number ${profile.birthNumber.root}: ${profile.birthNumber.simpleMeaning}.`,
        `Destiny number ${profile.destinyNumber.root}: ${profile.destinyNumber.simpleMeaning}.`,
        `Maturity direction: ${dashboard.maturityDirection}`,
        `Strengths to use: ${profile.strengths.slice(0, isPremium ? 6 : 3).join(', ') || 'steady application'}.`,
      ],
      confidence: 'medium',
      evidence: profile.evidence,
      evidenceTable: [
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
      ],
      eyebrow: 'NUMEROLOGY',
      tier: isPremium ? 'premium' : 'free',
      title: 'Birth Code and Destiny Direction',
    },
    {
      body:
        `Current Cycle: lean into ${dashboard.currentCycleLeanInto.toLowerCase()} Avoid ${dashboard.currentCycleAvoid.toLowerCase()} This turns the personal year, month, and day into one practical rhythm instead of three disconnected numbers.`,
      bullets: [
        `Personal year ${profile.personalYear.root}: ${profile.personalYear.simpleMeaning}.`,
        `Personal month ${profile.personalMonth.root}: ${profile.personalMonth.simpleMeaning}.`,
        `Personal day ${profile.personalDay.root}: ${profile.personalDay.simpleMeaning}.`,
        `Next action: ${dashboard.bestUseOfCurrentCycle}`,
      ],
      confidence: 'medium',
      evidence: [`Target date: ${profile.targetDate}.`, `Timing method: ${profile.method.personalCycles}.`],
      evidenceTable: [
        {
          confidence: 'medium',
          factor: 'Personal year',
          implication: profile.personalYear.simpleMeaning,
          observation: `${profile.personalYear.root} ${profile.personalYear.label}.`,
        },
        {
          confidence: 'medium',
          factor: 'Personal month',
          implication: profile.personalMonth.simpleMeaning,
          observation: `${profile.personalMonth.root} ${profile.personalMonth.label}.`,
        },
        {
          confidence: 'medium',
          factor: 'Personal day',
          implication: profile.personalDay.simpleMeaning,
          observation: `${profile.personalDay.root} ${profile.personalDay.label}.`,
        },
      ],
      eyebrow: 'NUMEROLOGY',
      tier: isPremium ? 'premium' : 'free',
      title: 'Current Cycle Action Plan',
    },
    {
      body:
        `Missing / Repeated Number Grid: repeated ${dashboard.repeatedNumbers.join(', ') || 'none'}; missing ${dashboard.missingNumbers.join(', ') || 'none'}. This is not a fear score. It shows where the name/date pattern is louder and where conscious practice may help.`,
      bullets: [
        `Repeated numbers: ${dashboard.repeatedNumbers.length ? dashboard.repeatedNumbers.join(', ') : 'no strong repeat detected yet'}.`,
        `Strong numbers: ${dashboard.strongNumbers.length ? dashboard.strongNumbers.join(', ') : 'balanced emphasis'}.`,
        `Missing numbers: ${dashboard.missingNumbers.length ? dashboard.missingNumbers.join(', ') : 'all core digits appear at least once'}.`,
        'Use missing numbers as practice cues, not as warnings.',
      ],
      confidence: 'medium',
      evidence: [
        'Missing / Repeated Number Pattern is included as a Numerology-only number grid.',
        `Missing/repeated grid calculated from available name and birth-date digits: repeated ${dashboard.repeatedNumbers.join(', ') || 'none'}, missing ${dashboard.missingNumbers.join(', ') || 'none'}.`,
      ],
      evidenceTable: frequencyRows,
      eyebrow: 'NUMEROLOGY',
      tier: isPremium ? 'premium' : 'free',
      title: 'Missing / Repeated Number Grid',
    },
    {
      body:
        `This is where the numbers become useful: ${dashboard.freeInsight} The report keeps the guidance practical across work, relationships, money, and self-expression instead of forcing the user to decode raw numerology terms.`,
      bullets: [
        `Strengths: ${profile.strengths.slice(0, isPremium ? 6 : 3).join(', ') || 'steady application'}.`,
        `Care points: ${profile.cautions.slice(0, isPremium ? 5 : 3).join(', ') || 'keep the reading practical and balanced'}.`,
        `Work and money: use the current cycle through ${dashboard.currentCycleLeanInto}.`,
        `Relationships and self-expression: watch ${dashboard.currentCycleAvoid}.`,
        profile.guidance,
      ],
      confidence: 'medium',
      evidence: [
        ...profile.limitations,
        'Name fit and compatibility are confidence-framed reflective tools, not guarantees or pressure to change a name.',
      ],
      eyebrow: 'NUMEROLOGY',
      tier: isPremium ? 'premium' : 'free',
      title: 'Strengths, Cautions, and Life Areas',
    },
  ];

  if (isPremium) {
    sections.push(
      {
        body:
          `Name Fit Score: ${dashboard.nameRefinement.currentNameFit.summary} Treat this as a refinement lens, not a fear tactic. A name can be supported, adjusted, or compared only when the user wants that work.`,
        bullets: [
          `Current name alignment: ${dashboard.nameRefinement.currentNameFit.score}/100.`,
          `Expression ${dashboard.nameRefinement.currentNameFit.expression}; stability ${dashboard.nameRefinement.currentNameFit.stability}; public rhythm ${dashboard.nameRefinement.currentNameFit.publicRhythm}; destiny support ${dashboard.nameRefinement.currentNameFit.destinySupport}.`,
          `Name Refinement: ${dashboard.nameRefinement.comparisonNote}`,
          `Suggested inputs: ${dashboard.nameRefinement.suggestedInputs.join(', ') || 'current name, public name, brand name, baby name, or business name'}.`,
        ],
        confidence: dashboard.nameRefinement.currentNameFit.confidence,
        evidence: dashboard.nameRefinement.currentNameFit.limitations,
        eyebrow: 'NUMEROLOGY',
        tier: 'premium',
        title: 'Name Fit Score and Refinement',
      },
      {
        body:
          `Compatibility Lens: ${dashboard.compatibilityLens.howToWorkBetter} This remains a number-rhythm comparison, not a verdict on love, business, or success.`,
        bullets: [
          `Support zones: ${dashboard.compatibilityLens.supportZones.join(', ') || 'pending another person/name input'}.`,
          `Friction zones: ${dashboard.compatibilityLens.frictionZones.join(', ') || 'pending another person/name input'}.`,
          `Supportive toolkit: ${dashboard.supportiveToolkit.framing}`,
          `Colors: ${dashboard.supportiveToolkit.colors.join(', ') || 'pending'}; days: ${dashboard.supportiveToolkit.days.join(', ') || 'pending'}; numbers: ${dashboard.supportiveToolkit.numbers.join(', ') || 'pending'}.`,
          `Affirmation: ${dashboard.supportiveToolkit.affirmation}`,
        ],
        confidence: dashboard.compatibilityLens.confidence,
        evidence: [
          ...dashboard.compatibilityLens.limitations,
          ...dashboard.nameRefinement.limitations,
        ],
        eyebrow: 'NUMEROLOGY',
        tier: 'premium',
        title: 'Compatibility and Supportive Toolkit',
      },
      {
        body:
          `Personal Year Timeline: ${timelinePreview.join(' ')} This is the 12-month rhythm map so the user can plan with the current number weather instead of treating timing as vague.`,
        bullets: timelinePreview,
        confidence: 'medium',
        evidence: [`Personal year timeline months: ${dashboard.personalYearTimeline.length}.`],
        evidenceTable: dashboard.personalYearTimeline.slice(0, 12).map(month => ({
          confidence: 'medium' as const,
          factor: month.monthLabel,
          implication: month.guidance,
          observation: `${month.cycleNumber} ${month.keyword}.`,
        })),
        eyebrow: 'NUMEROLOGY',
        tier: 'premium',
        title: 'Personal Year Timeline',
      },
      {
        body:
          `How Predicta calculated your numbers: ${dashboard.calculationNote} This appendix keeps proof separate from the main reading so the report stays easy to read.`,
        bullets: [
          `Name number method: ${profile.method.nameNumber}.`,
          `Birth number method: ${profile.method.birthNumber}.`,
          `Destiny number method: ${profile.method.destinyNumber}.`,
          `Personal cycles method: ${profile.method.personalCycles}.`,
        ],
        confidence: 'high',
      evidence: [
        ...profile.evidence,
        ...profile.limitations,
        'How Predicta calculated your numbers is kept in the Numerology calculation appendix.',
      ],
        eyebrow: 'NUMEROLOGY',
        tier: 'premium',
        title: 'Calculation Appendix',
      },
    );
  }

  sections.push({
    body:
      'Numerology Method Boundary: this report stays inside name and birth-date number analysis. It does not import Kundli judgement, KP event proof, Nadi karmic story links, Signature traits, or Life Atlas synthesis.',
    bullets: [
      'Use this report for number identity, name rhythm, current personal cycles, missing/repeated patterns, and practical alignment.',
      'Do not use it as a guarantee of success, a warning to change names out of fear, or a replacement for real-world judgement.',
      isPremium
        ? 'Premium adds deeper name refinement, compatibility, timing, and calculation proof while staying Numerology-only.'
        : 'Free gives the core number identity and action plan; premium adds deeper comparison and timing maps.',
    ],
    confidence: 'high',
    evidence: [
      'School boundary: Numerology only.',
      'D1/D9 Parashari chart pages are intentionally excluded from Numerology report output.',
      'Vedic graha placement tables are intentionally excluded from Numerology report output.',
      'Numerology chart atmosphere notes are intentionally excluded from Numerology report output.',
    ],
    eyebrow: 'NUMEROLOGY',
    tier: isPremium ? 'premium' : 'free',
    title: 'Numerology Method Boundary',
  });

  return sections;
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
        'Signature Predicta can be added after the user uploads, draws, or confirms a recent natural signature. It stays separate from Kundli, KP, Nadi, and Numerology unless a future approved synthesis report explicitly says so.',
      bullets: [
        'Add one clear signature or confirm visible traits such as pressure, slant, baseline, size, spacing, and legibility.',
        'The reading is reflective guidance about self-expression, not identity verification or handwriting forensics.',
        'Predicta does not store your signature image. It stays only in this session so we can prepare your reading. If you close this tab or leave the session, you may need to re-upload or re-draw it.',
        'What this can and cannot tell you: it can reflect visible expression cues; it cannot verify identity, diagnose, predict, or provide forensic proof.',
        'Premium reports can compare multiple signature samples and provide a refinement plan, but they do not mix Numerology or Vedic synthesis in this lane.',
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
      model.privacy.reportCopy,
      model.summary,
      ...traitLines,
      ...cardLines,
      `What this can and cannot tell you: ${model.canAndCannotTellYou.join(' ')}`,
      `Strengths: ${model.strengths.slice(0, isPremium ? 7 : 4).join(', ') || 'waiting for confirmed traits'}.`,
      `Care points: ${model.cautions.slice(0, isPremium ? 5 : 2).join(', ') || 'keep the reading gentle and practical'}.`,
      ...practiceLines,
      ...(isPremium
        ? [
            'Premium depth can compare repeated signatures, show before/after expression shifts, and build a signature refinement plan.',
          ]
        : [
            'Paid depth adds trait comparison, improvement plan, and refinement guidance without mixing Numerology or Vedic synthesis.',
          ]),
    ],
    confidence: 'medium',
    evidence: [
      model.privacy.reportCopy,
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
  const areaMeaning = buildAreaUserMeaning(kundli, title, houses, support, pressure);
  const strongestHouse = houses
    .map(houseNumber => ({ houseNumber, score: houseSavByNumber(kundli, houseNumber) ?? 0 }))
    .sort((first, second) => second.score - first.score)[0]?.houseNumber;
  const weakestHouse = houses
    .map(houseNumber => ({ houseNumber, score: houseSavByNumber(kundli, houseNumber) ?? 0 }))
    .sort((first, second) => first.score - second.score)[0]?.houseNumber;

  return {
    body: areaMeaning,
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
        implication: strongestHouse
          ? `Lean into house ${strongestHouse}: ${houseMeaning(strongestHouse)}.`
          : areaMeaning,
        observation: houseBullets.slice(0, 3).join(' '),
      },
      {
        confidence: planetBullets.length ? 'high' : 'medium',
        factor: `${title} planets`,
        implication: support.length
          ? `Support comes through ${support.join(', ')}; use it deliberately instead of waiting for luck.`
          : `This area needs steady action more than passive expectation.`,
        observation: planetBullets.slice(0, 3).join(' ') || 'Relevant planet placements not found in primary list.',
      },
      {
        confidence: chartBullets.length ? 'high' : 'medium',
        factor: `${title} divisional checks`,
        implication: weakestHouse
          ? `Protect house ${weakestHouse}: ${houseMeaning(weakestHouse)}.`
          : 'Use the divisional chart as confirmation, not as a detached second opinion.',
        observation: chartBullets.slice(0, 2).join(' '),
      },
    ],
    eyebrow: title.toUpperCase(),
    tier: 'free',
    title,
  };
}

function buildAreaUserMeaning(
  kundli: KundliData,
  title: string,
  houses: number[],
  support: string[],
  pressure: string[],
): string {
  const supportText = support.length
    ? `${support.join(', ')} give this area usable support`
    : 'this area grows through consistency rather than easy support';
  const pressureText = pressure.length
    ? `${pressure.join(', ')} show where impatience or pressure must be handled cleanly`
    : 'the main caution is not to overcomplicate what is already workable';
  const strongHouse = houses
    .map(houseNumber => ({ houseNumber, score: houseSavByNumber(kundli, houseNumber) ?? 0 }))
    .sort((first, second) => second.score - first.score)[0]?.houseNumber;

  const areaOpeners: Record<string, string> = {
    Career:
      'Career improves when visibility becomes useful, disciplined, and measurable; do not chase recognition before the role is clear.',
    Relationship:
      'Relationships ask for maturity, cleaner speech, and steadier negotiation; the chart favors bonds that can handle responsibility.',
    Wealth:
      'Wealth grows through networks, disciplined speech, and cleaner money habits; avoid shortcuts that disturb family or savings stability.',
    Wellbeing:
      'Wellbeing improves when routines become non-negotiable and emotional reactions are slowed before they become decisions.',
    'Spiritual Practice':
      'Spiritual practice works best when it becomes simple, repeatable, and tied to conduct rather than fear-based ritual.',
  };

  return `${areaOpeners[title] ?? `${title} becomes stronger when the chart support is turned into practical choices.`} ${supportText}; ${pressureText}. ${
    strongHouse ? `The strongest practical doorway is house ${strongHouse}, so start with ${houseMeaning(strongHouse)}.` : ''
  }`.trim();
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
    body: 'Guidance is tied to chart evidence: current dasha, weak houses, and repeated pressure signatures. Full remedy guidance is intentionally kept for the single consolidated remedy/action plan at the end.',
    bullets: [
      maha ? `Work with ${current.mahadasha} through the discipline of house ${maha.house}: ${houseMeaning(maha.house)}.` : `Work consciously with the ${current.mahadasha} period through steadiness and clean commitments.`,
      `Protect weakest houses ${weakHouses.join(', ')} through routine, restraint, and honest review.`,
      'Supporting practice reference only: use consistency, service, silence, or prayer as grounding habits until the final remedy/action plan lists the full practices.',
      mode === 'PREMIUM' ? 'Review the detailed chart sections before making irreversible timing decisions.' : 'Upgrade depth is most useful when you need area-by-area timing, evidence, and advanced synthesis.',
    ],
    evidence: [
      `Dasha: ${current.mahadasha}/${current.antardasha}`,
      `Weakest ashtakavarga houses: ${weakHouses.join(', ')}`,
    ],
    eyebrow: 'GUIDANCE',
    title: 'Practical next steps',
  };
}

function buildRemedySection(kundli: KundliData): PdfSection {
  const remedies = kundli.remedies ?? [];

  return {
    body: 'This is the only full remedy/action plan in the report. Remedies are practical correction practices tied to timing, weaker houses, and confidence limits. They are intentionally non-fearful and non-exploitative.',
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
    title: 'Consolidated remedy/action plan',
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

function buildOneLineSummary(
  kundli: KundliData,
  reportFocus: PdfReportFocus = 'KUNDLI',
  signatureAnalysis?: SignatureAnalysisModel,
): string {
  if (reportFocus === 'KP') {
    const kp = composeChalitBhavKpFoundation(kundli, { depth: 'FREE' }).kp;
    return `KP Predicta: ${kp.eventJudgement.verdictLabel}. ${kp.eventJudgement.plainLanguage}`;
  }

  if (reportFocus === 'NADI') {
    const plan = composeNadiJyotishPlan(kundli, { depth: 'FREE' });
    return `Nadi Predicta report with ${plan.patterns.length} planetary story patterns, validation questions, Rahu/Ketu axis checks, and no palm-leaf manuscript claim.`;
  }

  if (reportFocus === 'NUMEROLOGY') {
    const profile =
      kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
    return profile.status === 'ready'
      ? `Numerology Predicta report for ${profile.name}: name ${profile.nameNumber.root}, birth ${profile.birthNumber.root}, destiny ${profile.destinyNumber.root}, personal year ${profile.personalYear.root}.`
      : 'Numerology Predicta report pending name and birth-date readiness.';
  }

  if (reportFocus === 'SIGNATURE') {
    const model =
      signatureAnalysis ?? composeSignatureAnalysisModel({ inputSource: 'manual-observation' });
    return model.status === 'ready'
      ? `Signature Predicta report with ${model.observedTraits.length} confirmed visible traits and reflective self-expression guidance.`
      : 'Signature Predicta report pending a signature sample or confirmed visible observations.';
  }

  if (reportFocus === 'LIFE_ATLAS') {
    const atlas = composeLifeAtlasReport(kundli, {
      depth: 'FREE',
      signatureAnalysis,
    });
    return `Predicta Life Atlas: ${atlas.lifeThemeSentence} ${atlas.signatureNote}`;
  }

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
  if (reportFocus === 'LIFE_ATLAS' || reportFocus === 'KP' || reportFocus === 'NUMEROLOGY') {
    return [];
  }

  if (reportFocus === 'NADI') {
    return [];
  }

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
    case 'LIFE_ATLAS':
    case 'NADI':
    case 'NUMEROLOGY':
      return [];
    case 'CAREER':
      return ['D1', 'D9', 'D10'];
    case 'COMPATIBILITY':
    case 'MARRIAGE':
      return ['D1', 'D9'];
    case 'WEALTH':
      return ['D1', 'D9', 'D2'];
    case 'REMEDIES':
    case 'SADESATI':
      return ['D1', 'D9'];
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

function houseSavByNumber(kundli: KundliData, houseNumber: number): number | undefined {
  const item = house(kundli, houseNumber);

  return item ? houseSav(kundli, item) : undefined;
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
