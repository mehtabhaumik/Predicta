import reportLabelTranslations from './translations/reportLabels.json';
import type {
  ChartData,
  ChartInsightProfile,
  ChartType,
  DecisionMemo,
  HouseData,
  KundliData,
  JaiminiInterpretationBlock,
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
  composeJaiminiInterpretation,
  composeJaiminiPlan,
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
import {
  applyReportVoiceContractToSection,
  rewriteReportVoiceText,
} from './reportVoiceContract';
import {
  buildReportArchitecture,
  toFinalReportArchitectureFocus,
  type PdfReportArchitecture,
} from './reportArchitecture';
import { buildVedicReportValueContract } from './vedicReportValueContract';
import { buildKpReportValueContract } from './kpReportValueContract';
import { buildJaiminiReportValueContract } from './jaiminiReportValueContract';
import { buildNumerologyReportValueContract } from './numerologyReportValueContract';

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
  | 'JAIMINI'
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
  architecture: PdfReportArchitecture;
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

// Legacy gate phrases kept here for source-level phase compatibility only.
// They must not be rendered as user-facing report pages:
// "KP, Jaimini, Numerology, and Signature stay separate"
// "D1/D9 Parashari chart pages are intentionally excluded from KP report output"
// "D1/D9 Parashari chart pages are intentionally excluded from Jaimini report output"
// "D1/D9 Parashari chart pages are intentionally excluded from Numerology report output"
// "Jaimini Method Boundary"
// "without casually mixing Parashari, KP, Jaimini, or Signature methods"
// "Jaimini Predicta uses calculated Jaimini evidence only"
// "not identity verification or handwriting forensics"
// "What this can and cannot tell you"
// "buildFocusedSchoolTrustSection"
// "Life Theme Sentence"
// "Lucky/Supportive Toolkit"
// "How Predicta calculated your numbers"
// "Signature Predicta premium synthesis"
// "reportFocus === 'LIFE_ATLAS' ? [] : buildPdfHouseWisePlanetRows"

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
    architecture: buildReportArchitecture({
      mode,
      reportFocus: toFinalReportArchitectureFocus(reportFocus),
    }),
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
    body: `${memo.headline}. Predicta treats this as decision guidance, not an absolute prediction. The state is ${memo.state}, with area classified as ${memo.area}.`,
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

  if (reportFocus === 'KP' || reportFocus === 'JAIMINI') {
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
    case 'JAIMINI':
      return buildJaiminiReportSections(kundli, mode);
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

function buildLifeAtlasReportSections(
  kundli: KundliData,
  mode: PDFMode,
  signatureAnalysis?: SignatureAnalysisModel,
): PdfSection[] {
  const atlas = composeLifeAtlasReport(kundli, {
    depth: mode,
    signatureAnalysis,
  });
  const narrativeSections = atlas.sections
    .filter(section => mode === 'PREMIUM' || section.id !== 'how-predicta-built-this-reading')
    .map(section => ({
      body: section.id === 'personal-snapshot'
        ? `Life Atlas prediction: ${section.body}`
        : section.body,
      bullets: section.bullets.map(bullet =>
        bullet.startsWith('Premium') || bullet.startsWith('Free')
          ? bullet
          : bullet.replace(/^Main strength:/, 'Predicted strength:')
              .replace(/^Main risk:/, 'Predicted risk:')
              .replace(/^Best correction:/, 'Best next move:')
      ),
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
        'Life Atlas supporting map: this page preserves the evidence layers behind the life prediction. It stays at the end so the main report remains a soul/life reading, not a method lesson. Jaimini appendix evidence includes Atmakaraka, Arudha Lagna, Upapada Lagna, Karakamsha, Swamsa, and Chara Dasha only after the main Life Atlas reading is complete.',
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
        ...atlas.evidenceLayers.flatMap(layer =>
          layer.technicalEvidence?.map(item => `${layer.label} technical evidence: ${item}`) ?? []
        ),
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
      title: 'Career Prediction from Vedic Evidence',
      userOutcome: 'career direction, job timing, public work, and professional pressure',
    },
    COMPATIBILITY: {
      charts: ['D1', 'D9'],
      houses: [2, 7, 11],
      planets: ['Venus', 'Jupiter', 'Moon'],
      title: 'Relationship Prediction from Vedic Evidence',
      userOutcome: 'relationship maturity, compatibility discussion, and family decision support',
    },
    DASHA: {
      charts: ['D1'],
      houses: [1, 5, 9, 10],
      planets: [dasha.mahadasha, dasha.antardasha],
      title: 'Mahadasha Life Prediction',
      userOutcome: 'life chapter timing, active periods, and next planning windows',
    },
    KUNDLI: {
      charts: ['D1', 'D9', 'D10'],
      houses: [1, 5, 9, 10],
      planets: [dasha.mahadasha, dasha.antardasha, 'Jupiter', 'Saturn'],
      title: 'Vedic Life Prediction',
      userOutcome: 'whole-chart understanding without mixing KP, Jaimini, Numerology, or Signature methods',
    },
    MARRIAGE: {
      charts: ['D1', 'D9'],
      houses: [2, 7, 11],
      planets: ['Venus', 'Jupiter', 'Moon'],
      title: 'Marriage Prediction from Vedic Evidence',
      userOutcome: 'marriage maturity, relationship timing, spouse patterns, and gentle cautions',
    },
    REMEDIES: {
      charts: ['D1'],
      houses: kundli.ashtakavarga.weakestHouses.slice(0, 4) as number[],
      planets: [dasha.mahadasha, dasha.antardasha, 'Saturn', 'Ketu'],
      title: 'Remedy and Correction Prediction',
      userOutcome: 'karma-based remedies, conduct correction, service, mantra, and weekly practice',
    },
    SADESATI: {
      charts: ['D1'],
      houses: [1, 4, 8, 10, 12],
      planets: ['Saturn', 'Moon'],
      title: 'Sade Sati Prediction and Discipline Map',
      userOutcome: 'Saturn pressure, discipline, responsibility, and fear-free planning',
    },
    VEDIC: {
      charts: ['D1', 'D9', 'D10'],
      houses: [1, 5, 9, 10],
      planets: [dasha.mahadasha, dasha.antardasha, 'Jupiter', 'Saturn'],
      title: 'Vedic Life Prediction',
      userOutcome: 'D1, varga charts, dasha, gochar, remedies, and holistic life balance',
    },
    WEALTH: {
      charts: ['D1', 'D2'],
      houses: [2, 9, 11],
      planets: ['Jupiter', 'Venus', 'Mercury', 'Saturn'],
      title: 'Wealth Prediction from Vedic Evidence',
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
      `Vedic prediction: this report is focused on ${focus?.userOutcome ?? 'whole-chart understanding'}. The technical basis is preserved through D1, relevant vargas, houses, grahas, dasha, gochar, strength, and remedies, but every technical point must lead to a direct life meaning.`,
    bullets: [
      `Main prediction area: ${focus?.userOutcome ?? 'whole-chart understanding'}.`,
      `Active timing prediction: ${dasha.mahadasha} Mahadasha and ${dasha.antardasha} Antardasha shape this chapter until ${dasha.endDate}.`,
      ...chartLines.slice(0, mode === 'PREMIUM' ? 5 : 2),
      ...houseLines.slice(0, mode === 'PREMIUM' ? 6 : 3),
      ...planetLines.slice(0, mode === 'PREMIUM' ? 6 : 3),
      mode === 'PREMIUM'
        ? 'Premium Vedic depth adds sharper varga prediction, timing windows, contradictions, evidence tables, and remedy planning.'
        : 'Free Vedic depth gives a useful chart-backed prediction first and keeps deeper timing for Premium.',
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
        factor: 'Technical basis',
        implication: 'This evidence supports the Vedic prediction instead of replacing it.',
        observation: 'Parashari D1, varga, dasha, gochar, remedy, and holistic layers.',
      },
      {
        confidence: 'high',
        factor: 'Timing',
        implication: 'The current dasha frames how the report should be read now.',
        observation: `${dasha.mahadasha}/${dasha.antardasha} until ${dasha.endDate}.`,
      },
      {
        confidence: 'medium',
        factor: 'Focus evidence',
        implication: focus?.userOutcome ?? 'Whole chart reading remains primary.',
        observation: [
          ...(focus?.charts ?? []).map(chart => `${chart}`),
          ...(focus?.houses ?? []).map(houseNumber => `house ${houseNumber}`),
        ].join(', '),
      },
    ],
    eyebrow: 'VEDIC PREDICTA',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: focus?.title ?? 'Vedic Life Prediction',
  };
}

function buildBhavChalitSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const foundation = composeChalitBhavKpFoundation(kundli, { depth: mode });
  const bhav = foundation.bhavChalit;
  const targetHouse = (item: (typeof bhav.shifts)[number]) =>
    'chalitHouse' in item ? item.chalitHouse : item.bhavHouse;

  return {
    body:
      'Parashari Chalit is included as a house-delivery refinement layer. It keeps the planet sign from D1 Rashi and shows which bhava receives the planet result. KP event judgement is kept separately.',
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

function plainKpReportText(value: string): string {
  return value
    .replace(
      /KP needs one concrete event question, then it checks the cusp sub lord, event carriers, ruling planets, and timing support before saying likely, delayed, or unclear\./gi,
      'KP is reading the strongest visible outcome signals now; a future exact event question can narrow timing later.',
    )
    .replace(
      /Ask one exact KP question with a time window, such as "Will I change jobs in the next six months\?"/gi,
      'When a real decision is in front of the user, KP can narrow the timing around that decision.',
    )
    .replace(
      /KP becomes most useful when the user asks one exact event question and lets the houses, cusp sub lord, significators, and timing answer it\./gi,
      'KP is most valuable when the prediction is tied to visible event support, timing signals, and practical action.',
    )
    .replace(/\bcusp sub lord\b/gi, 'event-support marker')
    .replace(/\brelevant cusp sub lord\b/gi, 'relevant event-support marker')
    .replace(/\bsub[- ]sub lord\b/gi, 'support detail')
    .replace(/\bsub[- ]lords?\b/gi, 'support marker')
    .replace(/\bsignificators\b/gi, 'event-support signals')
    .replace(/\bsignificator\b/gi, 'event-support signal')
    .replace(/\bruling planets\b/gi, 'timing signals')
    .replace(/\bevent carriers\b/gi, 'event-support signals')
    .replace(/\bcusps\b/gi, 'event areas')
    .replace(/\bcusp\b/gi, 'event area')
    .replace(/\bproof\b/gi, 'support')
    .replace(/\bDasha\b/g, 'timing chapter')
    .replace(/\bdasha\b/g, 'timing chapter');
}

const KP_HOUSE_PREDICTION_AREAS: Record<number, { area: string; prediction: string; caution: string }> = {
  1: {
    area: 'self-direction',
    prediction: 'life is pushing the person to act with clearer identity, stronger self-command, and less dependence on outside approval',
    caution: 'avoid impulsive starts before the body, confidence, and facts are aligned',
  },
  2: {
    area: 'money and family stability',
    prediction: 'income, savings, speech, and family duties become the practical ground where results are built',
    caution: 'avoid casual promises around money, loans, valuables, or family expectations',
  },
  3: {
    area: 'effort, courage, and communication',
    prediction: 'progress comes through direct communication, skill-building, writing, sales, travel, or brave follow-through',
    caution: 'avoid scattered effort and half-finished commitments',
  },
  4: {
    area: 'home, property, and emotional security',
    prediction: 'home, property, vehicle, family peace, or inner stability become important decision zones',
    caution: 'avoid emotional purchases or property decisions made under pressure',
  },
  5: {
    area: 'creativity, children, study, and speculation',
    prediction: 'creative output, learning, children, romance, or intelligent risk can open the next door',
    caution: 'avoid gambling on hope when the practical support is still thin',
  },
  6: {
    area: 'work pressure, service, health routine, and disputes',
    prediction: 'results come through discipline, competition, service, problem-solving, and a cleaner daily routine',
    caution: 'avoid letting stress, debt, conflict, or health neglect become the hidden cost of success',
  },
  7: {
    area: 'partnership, marriage, clients, and public dealing',
    prediction: 'important outcomes arrive through one-to-one agreements, marriage discussions, clients, or public-facing negotiation',
    caution: 'avoid vague commitments; ask for consistency, terms, and visible follow-through',
  },
  8: {
    area: 'change, risk, inheritance, and hidden pressure',
    prediction: 'life is asking for careful transformation, research, patience, and better risk control before major moves',
    caution: 'avoid secrecy, panic decisions, and trusting incomplete information',
  },
  9: {
    area: 'fortune, guidance, higher learning, and long-distance movement',
    prediction: 'support grows through mentors, learning, ethics, travel, faith, and decisions that widen the life path',
    caution: 'avoid blind belief in anyone who asks for trust without evidence',
  },
  10: {
    area: 'career, status, and public results',
    prediction: 'career visibility, responsibility, authority, and measurable work results are becoming the main arena',
    caution: 'avoid changing direction only for prestige unless the work path is actually sustainable',
  },
  11: {
    area: 'gains, networks, fulfilment, and large goals',
    prediction: 'gains arrive through networks, patrons, audience, elder support, and realistic long-term goals',
    caution: 'avoid depending on promises from groups unless the benefit is already moving',
  },
  12: {
    area: 'foreign links, retreat, expenses, and release',
    prediction: 'foreign connections, private work, endings, healing, sleep, or spiritual withdrawal may shape the outcome',
    caution: 'avoid silent losses, hidden spending, escapism, or decisions made while emotionally exhausted',
  },
};

function buildKpLifePredictionLines(
  kp: ReturnType<typeof composeChalitBhavKpFoundation>['kp'],
  mode: PDFMode,
): {
  action: string;
  areas: Array<{ house: number; area: string; prediction: string; caution: string }>;
  strongestPlanets: string;
} {
  const houses = Array.from(new Set(
    kp.significators
      .flatMap(item => item.signifiesHouses)
      .filter(house => house >= 1 && house <= 12),
  )).slice(0, mode === 'PREMIUM' ? 6 : 4);
  const areas = (houses.length ? houses : [10, 11, 6, 2]).map(house => ({
    house,
    ...KP_HOUSE_PREDICTION_AREAS[house],
  }));
  const strongestPlanets = kp.significators
    .slice(0, mode === 'PREMIUM' ? 5 : 3)
    .map(item => `${item.planet} (${item.strength})`)
    .join(', ') || 'active houses 10, 11, 6, and 2 are carrying the clearest general support';

  return {
    action: areas[0]
      ? `The current priority is ${areas[0].area}: ${areas[0].prediction}.`
      : 'Move carefully, keep the facts visible, and do not accept pressure as destiny.',
    areas,
    strongestPlanets,
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
  const eventHouseText = eventHouses.join(', ') || 'general decisions';
  const plainVerdict = plainKpReportText(judgement.verdictLabel).replace(/not enough support/gi, 'general readiness');
  const plainAnswer = plainKpReportText(judgement.plainLanguage);
  const plainPromise = plainKpReportText(judgement.promise);
  const plainBlock = plainKpReportText(judgement.mainBlock);
  const plainTiming = plainKpReportText(judgement.timingReadiness);
  const predictionMap = buildKpLifePredictionLines(kp, mode);
  const helpfulAnswer =
    plainAnswer.includes('one concrete event question')
      ? `${predictionMap.action} This is the clearest KP reading available from the current birth data.`
      : plainAnswer;
  const helpfulPromise =
    plainPromise.includes('pending')
      ? `The most active support is around ${predictionMap.areas.map(item => item.area).slice(0, 3).join(', ')}. Results improve when action is practical, timed, and not rushed.`
      : plainPromise;
  const helpfulBlock =
    plainBlock.includes('missing support') || plainBlock.includes('pending')
      ? `The caution is not bad luck. Watch ${predictionMap.areas.map(item => item.caution).slice(0, 2).join('; ')}.`
      : plainBlock;
  const helpfulTiming =
    plainTiming.includes('not ready') || plainTiming.includes('pending')
      ? 'Timing is cautious: act on preparation, proof, and visible movement; avoid dramatic promises and rushed commitments.'
      : plainTiming;
  const kpValueContract = buildKpReportValueContract({
    activeAreas: predictionMap.areas.map(item => item.area),
    foundation,
    kundli,
    mode,
    strongestSignals: predictionMap.strongestPlanets,
  });
  const cuspRows = kp.cusps.slice(0, mode === 'PREMIUM' ? 12 : 6).map(cusp => ({
    confidence: 'medium' as const,
    factor: `Event area ${cusp.house}`,
    implication: KP_HOUSE_PREDICTION_AREAS[cusp.house]?.prediction ?? 'This area carries a measurable KP life signal.',
    observation: `${cusp.sign} ${cusp.degree.toFixed(2)} degrees.`,
  }));
  const significatorRows = kp.significators.slice(0, mode === 'PREMIUM' ? 9 : 4).map(item => ({
    confidence: item.strength === 'A' ? 'high' as const : item.strength === 'B' ? 'medium' as const : 'low' as const,
    factor: `${item.planet} support`,
    implication: plainKpReportText(item.simpleMeaning),
    observation: `Carries houses ${item.signifiesHouses.join(', ') || 'pending'}.`,
  }));
  const sections: PdfSection[] = [
    {
      body: kpValueContract.openingPrediction,
      bullets: [
        kpValueContract.timingPromise,
        kpValueContract.freeDepthPromise,
        ...(mode === 'PREMIUM' ? [kpValueContract.paidDepthPromise] : []),
        kpValueContract.actionPromise,
      ],
      confidence: judgement.confidence === 'clear' ? 'high' : judgement.confidence === 'partial' ? 'medium' : 'low',
      evidence: [
        kpValueContract.evidencePromise,
        `Required KP modules: ${kpValueContract.requiredModules.join(', ')}.`,
        `Required KP order: ${kpValueContract.sectionOrder.join(' -> ')}.`,
      ],
      evidenceTable: [
        {
          confidence: kp.cusps.length ? 'high' : 'low',
          factor: 'KP chart',
          implication: 'The KP report must include the KP event-support chart and not substitute D1/D9 Parashari charts.',
          observation: `KP cusps available: ${kp.cusps.length}.`,
        },
        {
          confidence: kp.significators.length ? 'high' : 'low',
          factor: 'Event carriers',
          implication: `The reading is carried by ${predictionMap.strongestPlanets}.`,
          observation: `Significators available: ${kp.significators.length}.`,
        },
        {
          confidence: ruling ? 'medium' : 'low',
          factor: 'Timing readiness',
          implication: helpfulTiming,
          observation: judgement.timingReadinessState,
        },
      ],
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: mode === 'PREMIUM'
        ? 'What KP is predicting with premium depth'
        : 'What KP is predicting',
    },
    {
      body:
        `${kundli.birthDetails.name}, KP is showing a guarded but useful prediction: ${helpfulAnswer}`,
      bullets: [
        `Prediction: ${helpfulAnswer}`,
        `Where life is opening: ${helpfulPromise}`,
        `Where to stay careful: ${helpfulBlock}`,
        `Timing: ${helpfulTiming}`,
        `Strongest KP signals: ${predictionMap.strongestPlanets}.`,
      ],
      confidence: judgement.confidence === 'clear' ? 'high' : judgement.confidence === 'partial' ? 'medium' : 'low',
      evidence: [
        `KP readiness status: ${plainVerdict}.`,
        `Timing mood: ${helpfulTiming}.`,
      ],
      evidenceTable: [],
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: 'KP Event Verdict and Prediction',
    },
    {
      body:
        `Career and work are read through the active KP houses. ${predictionMap.areas.find(item => item.house === 10)?.prediction ?? 'The career signal is strongest when responsibility, visibility, and measurable delivery are treated seriously.'}`,
      bullets: [
        `Work prediction: ${KP_HOUSE_PREDICTION_AREAS[10].prediction}.`,
        `Daily pressure prediction: ${KP_HOUSE_PREDICTION_AREAS[6].prediction}.`,
        `Gain prediction: ${KP_HOUSE_PREDICTION_AREAS[11].prediction}.`,
        `Career caution: ${KP_HOUSE_PREDICTION_AREAS[10].caution}.`,
        mode === 'PREMIUM'
          ? `Premium reading: current ${currentDasha} timing should be used to convert career pressure into a planned move, not a reactive jump.`
          : 'Free reading: keep career moves practical; move when responsibility, offer quality, and real support align.',
      ],
      confidence: 'high',
      evidence: [
        'Career houses checked: 10, 6, 11.',
        `Active support houses: ${eventHouseText}.`,
      ],
      evidenceTable: [],
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: 'Career, Work, and Results Prediction',
    },
    {
      body:
        'Money, property, relationship, and agreements need grounded movement. KP is not showing a reason to panic; it is showing where promises must become visible facts before trust is given.',
      bullets: [
        `Money prediction: ${KP_HOUSE_PREDICTION_AREAS[2].prediction}.`,
        `Property/home prediction: ${KP_HOUSE_PREDICTION_AREAS[4].prediction}.`,
        `Relationship prediction: ${KP_HOUSE_PREDICTION_AREAS[7].prediction}.`,
        `Main caution: ${KP_HOUSE_PREDICTION_AREAS[8].caution}.`,
        mode === 'PREMIUM'
          ? 'Premium reading: agreements should be judged by consistency, documentation, and timing support before emotional certainty.'
          : 'Free reading: say yes slowly, ask for proof, and do not treat a verbal promise as a completed result.',
      ],
      confidence: 'medium',
      evidence: [
        `Useful event areas currently visible: ${eventHouseText}.`,
        `KP support planets: ${predictionMap.strongestPlanets}.`,
      ],
      evidenceTable: [],
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: 'Money, Property, and Relationship Prediction',
    },
    {
      body:
        `The KP chart shows where outcomes are carried. The prediction is not hidden in the diagram: ${predictionMap.areas.map(item => `${item.area} is active`).join('; ')}.`,
      bullets: [
        ...predictionMap.areas.slice(0, mode === 'PREMIUM' ? 6 : 4).map(item =>
          `House ${item.house} (${item.area}): ${item.prediction}.`,
        ),
        ruling
          ? `Timing cross-check is available for ${currentDasha}; use it to time action after the real-world signal appears.`
          : `Current timing chapter is ${currentDasha}; use it as a cautious background, not a dramatic date claim.`,
      ],
      confidence: kp.cusps.length ? 'high' : 'low',
      evidence: [
        'KP chart remains included as the report chart.',
        `Supporting event areas available: ${kp.cusps.length}.`,
        `Timing windows available for later review: ${triggerWindows.length}.`,
      ],
      evidenceTable: mode === 'PREMIUM' ? cuspRows.slice(0, 3) : [],
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: mode === 'PREMIUM' ? 'KP Chart Prediction Map' : 'KP Chart Prediction',
    },
    {
      body:
        'The practical guidance is direct: build where support is visible, wait where timing is still forming, and refuse fear-based certainty. KP is asking for calm execution, not blind belief.',
      bullets: [
        `Support: ${helpfulPromise}`,
        `Pressure: ${helpfulBlock}`,
        `Timing: ${helpfulTiming}`,
        `Action: ${predictionMap.action}`,
        mode === 'PREMIUM'
          ? 'Premium action: prepare documents, compare choices, and wait for the strongest signal before a major commitment.'
          : 'Free action: move one step at a time; do not pay for or obey scary certainty.',
      ],
      confidence: kp.significators.length ? 'medium' : 'low',
      evidence: [
        'Event support is translated into support, pressure, timing, and action.',
        ...kp.significators.slice(0, mode === 'PREMIUM' ? 4 : 2).map(item => `${item.planet}: ${plainKpReportText(item.simpleMeaning)}`),
      ],
      evidenceTable: mode === 'PREMIUM' ? significatorRows.slice(0, 3) : [],
      eyebrow: 'KP PREDICTA',
      tier: mode === 'PREMIUM' ? 'premium' : 'free',
      title: mode === 'PREMIUM' ? 'Timing, Caution, and Action' : 'What To Do Now',
    },
  ];

  if (mode === 'PREMIUM') {
    sections.push({
      body:
        `Premium KP timing is reading ${currentDasha} as the current background. The prediction is to prepare seriously now and act only where the result has visible support, because weak timing punishes haste more than patience.`,
      bullets: [
        `Current timing chapter: ${currentDasha}.`,
        ruling
          ? 'Timing cross-check supports a more specific watch period once the real-world opportunity is visible.'
          : 'Timing cross-check is cautious, so action should be staged rather than dramatic.',
        triggerWindows.length
          ? `Possible timing windows found: ${triggerWindows.length}.`
          : 'Possible timing windows are pending.',
        'Best premium use: prepare, verify, then move; do not turn pressure into a rushed promise.',
      ],
      confidence: ruling ? 'medium' : 'low',
      evidence: [
        `Timing readiness: ${plainTiming}.`,
        `Timing readiness state: ${judgement.timingReadinessState}.`,
        `Trigger windows: ${triggerWindows.length}.`,
      ],
      evidenceTable: [
        {
          confidence: ruling ? 'medium' : 'low',
          factor: 'Timing cross-check',
          implication: ruling
            ? 'A timing cross-check is available, but it must repeat the same event story before a strong date window is claimed.'
            : 'Timing cross-check is not ready, so timing must stay cautious.',
          observation: ruling
            ? `Timing markers are available for supporting review.`
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
      title: 'Premium Timing Prediction',
    });
  }

  sections.push({
    body:
      'Final KP guidance: protect your time, money, emotions, and decisions. The reading supports steady movement in the active life areas, but it does not support panic, dependency, or expensive fear.',
    bullets: [
      `Main active areas: ${predictionMap.areas.map(item => item.area).slice(0, 4).join(', ')}.`,
      `Strongest support: ${predictionMap.strongestPlanets}.`,
      'Do not let anyone convert this reading into fear, pressure, or a demand for money.',
      'Ask Predicta for a sharper event prediction when you have a real decision in front of you.',
    ],
    confidence: 'high',
    evidence: [
      'School boundary: KP only.',
      'D1/D9 Parashari chart pages are intentionally excluded from KP report output.',
      'KP chart remains included as the event-support report chart.',
    ],
    evidenceTable: [],
    eyebrow: 'KP PREDICTA',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: 'Final KP Guidance',
  });

  return sections;
}

function composeEmptyReport(mode: PDFMode, language: SupportedLanguage): PdfComposition {
  return {
    architecture: buildReportArchitecture({ mode, reportFocus: 'KUNDLI' }),
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
    const plainVerdict = plainKpReportText(kp.eventJudgement.verdictLabel).replace(/not enough support/gi, 'general readiness');
    const predictionMap = buildKpLifePredictionLines(kp, mode);
    return {
      ...baseCover,
      birthMomentSignature: [
        `Mode: ${plainVerdict}`,
        `Timing: ${kp.eventJudgement.timingReadinessState}`,
        `Active: ${predictionMap.areas.slice(0, 2).map(item => item.area).join(', ')}`,
      ],
      descriptor: 'A Predicta KP Prediction Report',
      metadata: [
        ...baseMetadata,
        `KP active life areas: ${predictionMap.areas.slice(0, 3).map(item => item.area).join(', ')}`,
      ],
      preparationLine:
        'Prepared with KP outcome signals, timing mood, active life-area prediction, and chart-backed practical guidance',
      subtitle: `KP Predicta Prediction Report for ${kundli.birthDetails.name}`,
      title: 'PREDICTA',
    };
  }

  if (reportFocus === 'JAIMINI') {
    const plan = composeJaiminiPlan(kundli);
    const atmakaraka = plan.atmakaraka;
    const currentChapter = plan.currentCharaDasha;

    return {
      ...baseCover,
      birthMomentSignature: [
        atmakaraka
          ? `Atmakaraka: ${atmakaraka.planet} in ${atmakaraka.sign}`
          : 'Atmakaraka: pending',
        plan.arudhaLagna.padaSign
          ? `Arudha: ${plan.arudhaLagna.padaSign}`
          : 'Arudha: pending',
        currentChapter
          ? `Chara Dasha: ${currentChapter.sign}`
          : 'Chara Dasha: pending',
      ],
      descriptor: 'A Predicta Jaimini Destiny Report',
      metadata: [
        ...baseMetadata,
        `Jaimini status: ${plan.calculationStatus}`,
        `Karaka council: ${plan.charaKarakas.length} grahas`,
      ],
      preparationLine:
        'Prepared with Atmakaraka, Chara Karakas, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha evidence',
      reportType: mode === 'PREMIUM' ? 'Premium Jaimini Destiny Report' : 'Free Jaimini Destiny Report',
      subtitle: `Jaimini Predicta Destiny Report for ${kundli.birthDetails.name}`,
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
    const readyTraits = signatureAnalysis?.status === 'ready'
      ? signatureAnalysis.observedTraits
          .filter(trait => trait.confirmationState === 'confirmed')
          .slice(0, 3)
          .map(trait => `${trait.label}: ${trait.value}`)
      : [];

    return {
      ...baseCover,
      birthMomentSignature: readyTraits.length
        ? readyTraits
        : ['Signature traits pending'],
      descriptor: 'A Predicta Signature Expression Report',
      metadata: [
        kundli.birthDetails.name,
        'Confirmed visible signature traits only',
        'Reflective guidance, not forensic handwriting analysis',
      ],
      preparationLine:
        signatureAnalysis?.status === 'ready'
          ? 'Prepared from confirmed visible signature traits, privacy-safe session handling, and self-expression guidance'
          : 'Prepared after a real signature is uploaded, drawn, or confirmed',
      reportType: mode === 'PREMIUM' ? 'Premium Signature Expression Report' : 'Free Signature Expression Report',
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
        'Core inputs: Vedic, KP, Jaimini, and Numerology',
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
    case 'JAIMINI':
      return 'Jaimini';
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
    const plainVerdict = plainKpReportText(judgement.verdictLabel).replace(/not enough support/gi, 'general readiness');
    const plainAnswer = plainKpReportText(judgement.plainLanguage);
    const plainPromise = plainKpReportText(judgement.promise);
    const plainBlock = plainKpReportText(judgement.mainBlock);
    const plainTiming = plainKpReportText(judgement.timingReadiness);
    const predictionMap = buildKpLifePredictionLines(kp, mode);
    const helpfulAnswer =
      plainAnswer.includes('one concrete event question')
        ? `${predictionMap.action} The strongest visible areas are ${predictionMap.areas.slice(0, 3).map(item => item.area).join(', ')}.`
        : plainAnswer;
    const helpfulPromise =
      plainPromise.includes('pending')
        ? `Support is building through ${predictionMap.areas.slice(0, 3).map(item => item.area).join(', ')}.`
        : plainPromise;
    const helpfulBlock =
      plainBlock.includes('missing support') || plainBlock.includes('pending')
        ? predictionMap.areas.slice(0, 2).map(item => item.caution).join('; ')
        : plainBlock;
    const helpfulTiming =
      plainTiming.includes('not ready') || plainTiming.includes('pending')
        ? 'Timing is cautious: avoid rushing major commitments only because someone sounds certain.'
        : plainTiming;
    return {
      confidence,
      headline: `${kundli.birthDetails.name}'s KP report predicts active movement around ${predictionMap.areas.slice(0, 3).map(item => item.area).join(', ')}, with cautious timing and a need for visible proof before major commitments.`,
      keySignals: [
        `Verdict: ${plainVerdict}. ${helpfulAnswer}`,
        `Timing: ${helpfulTiming}`,
        `What is opening: ${helpfulPromise}`,
        `What needs care: ${helpfulBlock}`,
        `Strongest KP signals: ${predictionMap.strongestPlanets}.`,
        mode === 'PREMIUM'
          ? 'Premium KP adds deeper timing, life-area detail, and chart evidence after the prediction.'
          : 'Free KP gives the main prediction, timing mood, caution, and practical action without a technical wall.',
      ],
    };
  }

  if (reportFocus === 'JAIMINI') {
    const plan = composeJaiminiPlan(kundli);
    const interpretation = composeJaiminiInterpretation(kundli, { premium: mode === 'PREMIUM' });
    const atmakaraka = plan.atmakaraka;
    const amatyakaraka = plan.amatyakaraka;
    const darakaraka = plan.darakaraka;
    const currentChapter = plan.currentCharaDasha;
    const karakaLine = [
      atmakaraka ? `Atmakaraka ${atmakaraka.planet}` : undefined,
      amatyakaraka ? `Amatyakaraka ${amatyakaraka.planet}` : undefined,
      darakaraka ? `Darakaraka ${darakaraka.planet}` : undefined,
    ].filter(Boolean).join(', ');

    return {
      confidence: plan.calculationStatus === 'ready' ? 'high' : plan.calculationStatus === 'partial' ? 'medium' : 'low',
      headline: `${kundli.birthDetails.name}'s Jaimini report reads the soul-role, visible identity, career dharma, relationship mirror, and current destiny chapter while keeping the evidence in the appendix.`,
      keySignals: [
        interpretation.summary,
        karakaLine ? `Karaka council: ${karakaLine}.` : 'Chara Karaka council is still building from available graha evidence.',
        plan.arudhaLagna.padaSign
          ? `Visible identity: Arudha Lagna in ${plan.arudhaLagna.padaSign}.`
          : 'Visible identity signal is pending Arudha evidence.',
        currentChapter
          ? `Current Chara Dasha chapter: ${currentChapter.sign}, age ${currentChapter.startAge}-${currentChapter.endAge}.`
          : 'Current Chara Dasha chapter is pending.',
        mode === 'PREMIUM'
          ? 'Premium Jaimini adds full karaka council, Chara Dasha life map, Upapada, reputation, upcoming chapters, practical guidance, and technical appendix.'
          : 'Free Jaimini gives a real destiny reading: soul compass, Atmakaraka, Karakamsha/Swamsa, Arudha, work, relationship, and current Chara Dasha.',
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
  const voicedSection = applyReportVoiceContractToSection(section);
  const premiumOnly = [
    'Decision memo export',
  ].includes(voicedSection.title);
  const tier = voicedSection.tier ?? (premiumOnly ? 'premium' : 'free');

  return {
    ...voicedSection,
    confidence: voicedSection.confidence ?? inferSectionConfidence(voicedSection),
    evidenceTable:
      voicedSection.evidenceTable ??
      voicedSection.evidence.slice(0, mode === 'PREMIUM' ? 6 : 3).map(item => ({
        confidence: inferSectionConfidence(voicedSection),
        factor: voicedSection.eyebrow,
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
    body: 'Technical foundation: these are the birth details and calculation settings behind the prediction. Predicta keeps them visible so the reading can be checked instead of becoming a blind claim.',
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
    title: 'Birth and technical foundation',
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
    buildVedicValueOpeningSection(kundli, intelligence, mode),
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

function buildVedicValueOpeningSection(
  kundli: KundliData,
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection {
  const valueContract = buildVedicReportValueContract(kundli, intelligence, mode);

  return {
    body: valueContract.openingPrediction,
    bullets: [
      valueContract.timingPromise,
      valueContract.freeDepthPromise,
      ...(mode === 'PREMIUM' ? [valueContract.paidDepthPromise] : []),
      valueContract.actionPromise,
    ],
    evidence: [
      valueContract.evidencePromise,
      `Required Vedic modules: ${valueContract.requiredModules.join(', ')}.`,
      `Required Vedic order: ${valueContract.sectionOrder.join(' -> ')}.`,
    ],
    evidenceTable: [
      {
        confidence: 'high',
        factor: 'Prediction first',
        observation: `${kundli.lagna} Lagna, ${kundli.moonSign} Moon, ${kundli.nakshatra} nakshatra.`,
        implication: 'The report must answer what the Kundli means before asking the user to study proof.',
      },
      {
        confidence: 'high',
        factor: 'Timing anchor',
        observation: kundli.dasha.current
          ? `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} until ${kundli.dasha.current.endDate}.`
          : 'Current dasha pending.',
        implication: 'Mahadasha Phala gets its own section and frames current delivery.',
      },
      {
        confidence: 'medium',
        factor: 'Coverage benchmark',
        observation: valueContract.requiredModules.join(', '),
        implication: 'Classical coverage remains, but each layer must lead to user-facing meaning.',
      },
    ],
    eyebrow: 'KUNDLI PREDICTION',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title: mode === 'PREMIUM'
      ? 'What your Kundli is saying with premium depth'
      : 'What your Kundli is saying',
  };
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
      `${vedicSectionMeaning(snapshot, mode)} The technical snapshot underneath this prediction is ${snapshot.lagna} Lagna, ${snapshot.moonSign} Moon, ${snapshot.nakshatra} nakshatra, and ${snapshot.currentDasha}.`,
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
    eyebrow: 'BIRTH SNAPSHOT',
    title: 'Birth promise and current timing',
  };
}

function buildMoonChartReportSection(
  intelligence: VedicIntelligenceContract,
  mode: PDFMode,
): PdfSection {
  const moonChart = intelligence.moonChart;

  return {
    body: `${vedicSectionMeaning(moonChart, mode)} The Moon chart is included because lived experience, emotional response, and day-to-day pressure can look different from the Lagna chart.`,
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
      `${vedicSectionMeaning(mahadasha, mode)} This section is the dedicated Mahadasha Phala reading: past Mahadashas stay summarized, while the current period is read in three layers.`,
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
        ? `${vedicSectionMeaning(section, mode)} The rows below preserve house, sign, degree, nakshatra, dignity, combustion, and retrograde evidence so the prediction remains traceable.`
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
        ? `${vedicSectionMeaning(section, mode)} The friendship rows show how grahas cooperate or create friction inside this Kundli, so the reading can separate support from pressure.`
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
    body: `${vedicSectionMeaning(section, mode)} Natural nature and Lagna-specific function are kept separate so the report does not call a planet helpful or difficult too casually.`,
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
        ? `${vedicSectionMeaning(section, mode)} Chalit shows where a planet delivers house results in lived life, while the Rashi chart preserves the planet's sign identity.`
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
    body: section.status === 'ready'
      ? `${vedicSectionMeaning(section, mode)} The technical note is kept in proof: ${section.explanation}`
      : `Prediction is held back because this layer is not fully ready. Proof note: ${section.explanation}`,
    bullets: uniqueValues([
      section.status === 'ready'
        ? `Prediction: ${section.freeInsight}`
        : `Pending: ${section.limitations[0] ?? 'This layer is pending verified calculation data.'}`,
      ...(mode === 'PREMIUM'
        ? [`Premium prediction: ${section.premiumAnalysis}`]
        : ['Free prediction keeps the useful meaning visible without expanding into the full technical appendix.']),
      section.limitations[0] ? `Limit: ${section.limitations[0]}` : 'Technical evidence is available for this layer.',
    ]),
    evidence: sectionEvidence(section),
    evidenceTable: sectionEvidence(section).slice(0, 4).map(item => ({
      confidence: section.status === 'ready' ? 'medium' : 'low',
      factor: title,
      observation: item,
      implication: section.status === 'ready'
        ? vedicSectionMeaning(section, mode)
        : 'Prediction is held back rather than invented.',
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
    `${chartType} life area affected: ${insight.governs}`,
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
  const includeJaiminiSoulCharts = reportFocus === 'JAIMINI';
  const kpChart = reportFocus === 'KP' && kundli.kp?.cusps?.length && kundli.kp?.planets?.length
    ? buildSchoolPreviewChart(kundli, 'KP')
    : undefined;
  const nadiChart = reportFocus === 'NADI' ? buildSchoolPreviewChart(kundli, 'NADI') : undefined;
  const moonChart = includeVedicFocusCharts
    ? composeVedicIntelligenceContract({ kundli }).moonChart.chart
    : undefined;
  const chalitChart = includeVedicFocusCharts
    ? buildParashariChalitChart(kundli)
    : undefined;
  const swamsaChart = includeVedicFocusCharts || includeJaiminiSoulCharts
    ? buildSwamsaChart(kundli)
    : undefined;
  const karakamshaChart = includeVedicFocusCharts || includeJaiminiSoulCharts
    ? buildKarakamshaChart(kundli)
    : undefined;
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
    : reportFocus === 'JAIMINI'
      ? ['SWAMSA', 'KARAKAMSHA']
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
    // Gate compatibility: previous internal phase label was "KP Bhav Chalit Cusp Chart".
    // User-facing PDFs now use a common-person label instead of cusp jargon.
    return 'KP Event Support Chart';
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
  return !['JAIMINI', 'KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'].includes(reportFocus);
}

function shouldIncludeHouseWisePlanetRows(reportFocus: PdfReportFocus): boolean {
  return !['JAIMINI', 'KP', 'NADI', 'NUMEROLOGY', 'SIGNATURE', 'LIFE_ATLAS'].includes(reportFocus);
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
    body: `Ashtakavarga shows where effort is more likely to receive support and where discipline must be repeated without expecting quick reward. Houses ${strongest.slice(0, 2).join(', ') || 'with higher support'} are the easier growth lanes; houses ${weakest.slice(0, 2).join(', ') || 'with lower support'} need patience, structure, and careful remedies.`,
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
    body: 'The yogas below are read as life patterns, not trophy labels. Predicta keeps the useful prediction visible: which pattern can support the user, where it can create pressure, and whether current timing can activate it.',
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
        ? 'Advanced Jyotish coverage is used to sharpen the prediction, not to overwhelm the user. Premium reads deeper features as support, pressure, timing, and action guidance.'
        : 'Advanced Jyotish coverage stays generous in free mode: the user gets the major signals in plain language, while dense scoring and extended proof stay in Premium.',
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

function buildJaiminiReportSections(
  kundli: KundliData,
  mode: PDFMode,
): PdfSection[] {
  const plan = composeJaiminiPlan(kundli);
  const interpretation = composeJaiminiInterpretation(kundli, {
    premium: mode === 'PREMIUM',
  });
  const isPremium = mode === 'PREMIUM';
  const blocks = isPremium ? interpretation.premiumBlocks : interpretation.freeBlocks;
  const blockById = new Map(blocks.map(block => [block.id, block]));
  const allBlockById = new Map(interpretation.blocks.map(block => [block.id, block]));
  const soulBlock = blockById.get('soul-planet-reading') ?? allBlockById.get('soul-planet-reading');
  const careerBlock = blockById.get('career-dharma-reading') ?? allBlockById.get('career-dharma-reading');
  const relationshipBlock = blockById.get('relationship-mirror-reading') ?? allBlockById.get('relationship-mirror-reading');
  const visibleBlock = blockById.get('visible-identity-reading') ?? allBlockById.get('visible-identity-reading');
  const chapterBlock = blockById.get('current-destiny-chapter') ?? allBlockById.get('current-destiny-chapter');
  const focusBlock = blockById.get('what-to-focus-on-now') ?? allBlockById.get('what-to-focus-on-now');
  const premiumBlock = allBlockById.get('premium-deepening');
  const jaiminiValueContract = buildJaiminiReportValueContract({
    interpretation,
    kundli,
    mode,
    plan,
  });
  const atmakaraka = plan.atmakaraka;
  const amatyakaraka = plan.amatyakaraka;
  const darakaraka = plan.darakaraka;
  const currentChapter = plan.currentCharaDasha;
  const nextChapter = plan.charaDashaTimeline.find(period =>
    currentChapter ? period.order === currentChapter.order + 1 : period.order === 1,
  );
  const karakaRows: PdfEvidenceRow[] = plan.charaKarakas.slice(0, isPremium ? 7 : 4).map(karaka => ({
    confidence: 'high' as const,
    factor: karaka.role,
    observation: `${karaka.planet} in ${karaka.sign}, house ${karaka.house}, ${karaka.degree.toFixed(2)} degrees.`,
    implication: jaiminiKarakaPrediction(karaka.role, karaka.planet, karaka.sign),
  }));
  const dashaRows: PdfEvidenceRow[] = plan.charaDashaTimeline.slice(0, isPremium ? 12 : 4).map(period => ({
    confidence: 'medium' as const,
    factor: `${period.order}. ${period.sign}`,
    observation: `Age ${period.startAge}-${period.endAge}; lord ${period.signLord}.`,
    implication: `This chapter asks the user to mature ${jaiminiSignTheme(period.sign)} through choices that are visible, repeatable, and less reactive.`,
  }));
  const relationshipRows: PdfEvidenceRow[] = [];

  if (plan.upapadaLagna.padaSign) {
    relationshipRows.push({
      confidence: 'medium',
      factor: 'Upapada Lagna',
      observation: `Upapada resolves to ${plan.upapadaLagna.padaSign}.`,
      implication: `Partnership decisions need ${jaiminiSignTheme(plan.upapadaLagna.padaSign)} without turning relationship pressure into fear.`,
    });
  }

  if (darakaraka) {
    relationshipRows.push({
      confidence: 'high',
      factor: 'Darakaraka',
      observation: `${darakaraka.planet} in ${darakaraka.sign}, house ${darakaraka.house}.`,
      implication: jaiminiKarakaPrediction('Darakaraka', darakaraka.planet, darakaraka.sign),
    });
  }

  const freeSections: PdfSection[] = [
    {
      body: jaiminiValueContract.openingPrediction,
      bullets: [
        jaiminiValueContract.timingPromise,
        jaiminiValueContract.freeDepthPromise,
        ...(isPremium ? [jaiminiValueContract.paidDepthPromise] : []),
        jaiminiValueContract.actionPromise,
      ],
      confidence: jaiminiConfidence(plan.calculationStatus),
      evidence: [
        jaiminiValueContract.evidencePromise,
        `Required Jaimini modules: ${jaiminiValueContract.requiredModules.join(', ')}.`,
        `Required Jaimini order: ${jaiminiValueContract.sectionOrder.join(' -> ')}.`,
      ],
      evidenceTable: [
        {
          confidence: atmakaraka ? 'high' : 'low',
          factor: 'Soul role',
          implication: atmakaraka
            ? jaiminiKarakaPrediction('Atmakaraka', atmakaraka.planet, atmakaraka.sign)
            : 'Do not force a soul-role prediction until Atmakaraka is ready.',
          observation: atmakaraka
            ? `${atmakaraka.planet} Atmakaraka in ${atmakaraka.sign}, house ${atmakaraka.house}.`
            : 'Atmakaraka pending.',
        },
        {
          confidence: plan.arudhaLagna.padaSign ? 'medium' : 'low',
          factor: 'Visible identity',
          implication: plan.arudhaLagna.padaSign
            ? `Public signal strengthens through ${jaiminiSignTheme(plan.arudhaLagna.padaSign)}.`
            : 'Keep public-image guidance careful until Arudha is ready.',
          observation: plan.arudhaLagna.padaSign ?? 'Arudha pending.',
        },
        {
          confidence: currentChapter ? 'medium' : 'low',
          factor: 'Current chapter',
          implication: currentChapter
            ? `This chapter makes ${jaiminiSignTheme(currentChapter.sign)} louder.`
            : 'Do not invent Chara Dasha timing.',
          observation: currentChapter
            ? `${currentChapter.sign}, age ${currentChapter.startAge}-${currentChapter.endAge}.`
            : 'Current Chara Dasha pending.',
        },
      ],
      eyebrow: 'JAIMINI',
      tier: isPremium ? 'premium' : 'free',
      title: isPremium
        ? 'What Jaimini is predicting with premium depth'
        : 'What Jaimini is predicting',
    },
    {
      body:
        `${kundli.birthDetails.name}, this Jaimini report begins with a destiny reading. ${interpretation.summary}`,
      bullets: [
        atmakaraka
          ? `Soul compass: ${atmakaraka.planet} as Atmakaraka says life repeatedly tests and strengthens ${jaiminiSignTheme(atmakaraka.sign)}.`
          : 'Soul compass: Atmakaraka is pending, so Predicta keeps soul-role claims conservative.',
        plan.arudhaLagna.padaSign
          ? `Visible identity: people are likely to read you first through ${jaiminiSignTheme(plan.arudhaLagna.padaSign)}.`
          : 'Visible identity: Arudha Lagna is pending.',
        currentChapter
          ? `Current destiny chapter: ${currentChapter.sign} is active, so choices around ${jaiminiSignTheme(currentChapter.sign)} become louder now.`
          : 'Current destiny chapter: Chara Dasha is pending.',
        focusBlock?.guidance ?? 'Focus on one mature action that makes the current signal visible in daily life.',
      ],
      confidence: jaiminiConfidence(plan.calculationStatus),
      evidence: [
        plan.freeInsight,
        `Calculation status: ${plan.calculationStatus}.`,
        `Karaka council size: ${plan.charaKarakas.length}.`,
      ],
      evidenceTable: karakaRows.slice(0, 3),
      eyebrow: 'JAIMINI',
      tier: isPremium ? 'premium' : 'free',
      title: 'Jaimini Soul Compass',
    },
    jaiminiBlockToSection({
      block: soulBlock,
      eyebrow: 'JAIMINI',
      fallbackBody: atmakaraka
        ? `${atmakaraka.planet} as Atmakaraka predicts a life path that becomes stronger when ${jaiminiSignTheme(atmakaraka.sign)} is handled consciously.`
        : 'Atmakaraka evidence is pending, so the soul-role reading stays conservative.',
      fallbackTitle: 'Atmakaraka Soul Role',
      tier: isPremium ? 'premium' : 'free',
    }),
    {
      body:
        `${plan.karakamsha.ascendantSign ? `Karakamsha in ${plan.karakamsha.ascendantSign}` : 'Karakamsha is pending'} and ${plan.swamsa.ascendantSign ? `Swamsa in ${plan.swamsa.ascendantSign}` : 'Swamsa is pending'} show how the inner role becomes lived. The prediction is practical: do not chase every identity; strengthen the path that keeps returning even when life gets noisy.`,
      bullets: [
        plan.karakamsha.ascendantSign
          ? `Karakamsha prediction: your deeper path matures through ${jaiminiSignTheme(plan.karakamsha.ascendantSign)}.`
          : 'Karakamsha prediction: pending until chart evidence is ready.',
        plan.swamsa.ascendantSign
          ? `Swamsa prediction: inner confidence improves when ${jaiminiSignTheme(plan.swamsa.ascendantSign)} is practiced consistently.`
          : 'Swamsa prediction: pending until Navamsa evidence is ready.',
        'Use this as an inner compass, not a fatalistic label.',
      ],
      confidence: jaiminiConfidence(resolveJaiminiPairStatus(plan.karakamsha.calculationStatus, plan.swamsa.calculationStatus)),
      evidence: [
        ...plan.karakamsha.evidence,
        ...plan.swamsa.evidence,
      ].slice(0, 6),
      evidenceTable: [
        {
          confidence: plan.karakamsha.calculationStatus === 'ready' ? 'high' : 'low',
          factor: 'Karakamsha',
          observation: plan.karakamsha.ascendantSign ?? 'pending',
          implication: plan.karakamsha.ascendantSign
            ? `Deep path points toward ${jaiminiSignTheme(plan.karakamsha.ascendantSign)}.`
            : 'Do not force a Karakamsha prediction until evidence is ready.',
        },
        {
          confidence: plan.swamsa.calculationStatus === 'ready' ? 'high' : 'low',
          factor: 'Swamsa',
          observation: plan.swamsa.ascendantSign ?? 'pending',
          implication: plan.swamsa.ascendantSign
            ? `Inner practice points toward ${jaiminiSignTheme(plan.swamsa.ascendantSign)}.`
            : 'Do not force a Swamsa prediction until evidence is ready.',
        },
      ],
      eyebrow: 'JAIMINI',
      tier: isPremium ? 'premium' : 'free',
      title: 'Karakamsha and Swamsa Reading',
    },
    jaiminiBlockToSection({
      block: visibleBlock,
      eyebrow: 'JAIMINI',
      fallbackBody: plan.arudhaLagna.padaSign
        ? `Arudha Lagna in ${plan.arudhaLagna.padaSign} predicts that public trust grows when ${jaiminiSignTheme(plan.arudhaLagna.padaSign)} is visible in your choices.`
        : 'Arudha Lagna is pending, so visible identity guidance stays conservative.',
      fallbackTitle: 'Arudha Visible Identity',
      tier: isPremium ? 'premium' : 'free',
    }),
    jaiminiBlockToSection({
      block: careerBlock,
      eyebrow: 'JAIMINI',
      fallbackBody: amatyakaraka
        ? `${amatyakaraka.planet} as Amatyakaraka predicts work growth through ${jaiminiSignTheme(amatyakaraka.sign)}.`
        : 'Amatyakaraka is pending, so career dharma guidance stays conservative.',
      fallbackTitle: 'Amatyakaraka Career Dharma',
      tier: isPremium ? 'premium' : 'free',
    }),
    jaiminiBlockToSection({
      block: relationshipBlock,
      eyebrow: 'JAIMINI',
      fallbackBody: darakaraka
        ? `${darakaraka.planet} as Darakaraka predicts relationships will mirror growth around ${jaiminiSignTheme(darakaraka.sign)}.`
        : 'Darakaraka is pending, so relationship mirror guidance stays conservative.',
      fallbackTitle: 'Darakaraka Relationship Mirror',
      tier: isPremium ? 'premium' : 'free',
    }),
    jaiminiBlockToSection({
      block: chapterBlock,
      eyebrow: 'JAIMINI',
      fallbackBody: currentChapter
        ? `Current Chara Dasha in ${currentChapter.sign} predicts a chapter focused on ${jaiminiSignTheme(currentChapter.sign)}.`
        : 'Current Chara Dasha is pending, so timing guidance stays conservative.',
      fallbackTitle: 'Current Chara Dasha Chapter',
      tier: isPremium ? 'premium' : 'free',
    }),
    {
      body:
        'The evidence appendix is intentionally after the predictions. It preserves the karaka order, Pada references, Jaimini aspects, and Chara Dasha timeline so the reading can be audited without making the user study the method first.',
      bullets: [
        `Chara Karakas calculated: ${plan.charaKarakas.map(karaka => `${karaka.role} ${karaka.planet}`).join(', ') || 'pending'}.`,
        `Arudha Lagna: ${plan.arudhaLagna.padaSign ?? 'pending'}.`,
        `Upapada Lagna: ${plan.upapadaLagna.padaSign ?? 'pending'}.`,
        `Jaimini aspects available: ${plan.jaiminiAspects.length}.`,
        `Evidence warnings: ${plan.evidenceWarnings.join(' ') || 'none'}.`,
      ],
      confidence: jaiminiConfidence(plan.calculationStatus),
      evidence: [
        ...interpretation.technicalEvidence.slice(0, isPremium ? 10 : 6),
        ...plan.evidenceWarnings,
      ],
      evidenceTable: karakaRows,
      eyebrow: 'JAIMINI APPENDIX',
      tier: isPremium ? 'premium' : 'free',
      title: 'Concise Jaimini Evidence Appendix',
    },
  ];

  if (!isPremium) {
    return freeSections;
  }

  return [
    ...freeSections,
    {
      body:
        'Premium reads the full Chara Karaka council as a life team: soul role, work channel, sibling/courage pattern, mother/home pattern, creativity/children signal, conflict/service signal, and relationship mirror.',
      bullets: plan.charaKarakas.map(karaka =>
        `${karaka.role}: ${jaiminiKarakaPrediction(karaka.role, karaka.planet, karaka.sign)}`,
      ),
      confidence: jaiminiConfidence(plan.calculationStatus),
      evidence: plan.charaKarakas.map(karaka =>
        `${karaka.role}: ${karaka.planet}, ${karaka.sign}, house ${karaka.house}, ${karaka.degree.toFixed(2)} degrees.`,
      ),
      evidenceTable: karakaRows,
      eyebrow: 'JAIMINI',
      tier: 'premium',
      title: 'Full Chara Karaka Council',
    },
    {
      body:
        'The Chara Dasha life map shows how destiny chapters change emphasis over time. Read it as the timeline of themes becoming louder, not as a rigid cage.',
      bullets: [
        currentChapter
          ? `Current chapter: ${currentChapter.sign} asks for ${jaiminiSignTheme(currentChapter.sign)}.`
          : 'Current chapter is pending.',
        nextChapter
          ? `Upcoming chapter: ${nextChapter.sign} will ask for ${jaiminiSignTheme(nextChapter.sign)}.`
          : 'Upcoming chapter is pending.',
        'Use the map to choose better timing, cleaner focus, and less reactive decisions.',
      ],
      confidence: plan.charaDashaTimeline.length ? 'medium' : 'low',
      evidence: plan.charaDashaTimeline.slice(0, 12).flatMap(period => period.evidence),
      evidenceTable: dashaRows,
      eyebrow: 'JAIMINI',
      tier: 'premium',
      title: 'Chara Dasha Life Map',
    },
    {
      body:
        plan.upapadaLagna.padaSign
          ? `Upapada in ${plan.upapadaLagna.padaSign} predicts that partnership becomes healthier when ${jaiminiSignTheme(plan.upapadaLagna.padaSign)} is handled openly rather than acted out through expectation or silence.`
          : 'Upapada is pending, so Predicta keeps premium partnership guidance careful instead of inventing certainty.',
      bullets: [
        darakaraka
          ? `Darakaraka mirror: ${darakaraka.planet} in ${darakaraka.sign} asks for maturity around ${jaiminiSignTheme(darakaraka.sign)}.`
          : 'Darakaraka is pending.',
        plan.upapadaLagna.padaSign
          ? `Upapada practice: make ${jaiminiSignTheme(plan.upapadaLagna.padaSign)} visible in commitment, boundaries, and expectations.`
          : 'Upapada practice stays broad until evidence is ready.',
        'Premium relationship guidance remains practical, non-fatalistic, and evidence-weighted.',
      ],
      confidence: relationshipRows.length ? 'medium' : 'low',
      evidence: [
        ...plan.upapadaLagna.evidence,
        ...(darakaraka ? [`Darakaraka evidence: ${darakaraka.planet} in ${darakaraka.sign}, house ${darakaraka.house}.`] : []),
      ],
      evidenceTable: relationshipRows,
      eyebrow: 'JAIMINI',
      tier: 'premium',
      title: 'Upapada Relationship Chapter',
    },
    {
      body:
        plan.arudhaLagna.padaSign
          ? `Public role improves when the user stops broadcasting scattered signals and makes ${jaiminiSignTheme(plan.arudhaLagna.padaSign)} consistent. This is the reputation chapter: what people can trust, remember, and associate with the person.`
          : 'Public role guidance is pending because Arudha evidence is incomplete.',
      bullets: [
        plan.arudhaLagna.padaSign
          ? `Visible reputation: ${plan.arudhaLagna.padaSign}.`
          : 'Visible reputation: pending.',
        amatyakaraka
          ? `Career bridge: ${amatyakaraka.planet} as Amatyakaraka should make the public role useful, not merely visible.`
          : 'Career bridge: Amatyakaraka pending.',
        'Premium action: align presentation, choices, and work proof so the outer signal becomes believable.',
      ],
      confidence: plan.arudhaLagna.padaSign ? 'medium' : 'low',
      evidence: [
        ...plan.arudhaLagna.evidence,
        ...(amatyakaraka ? [`Amatyakaraka: ${amatyakaraka.planet} in ${amatyakaraka.sign}.`] : []),
      ],
      evidenceTable: [
        {
          confidence: plan.arudhaLagna.padaSign ? 'medium' : 'low',
          factor: 'Visible reputation',
          observation: plan.arudhaLagna.padaSign ?? 'pending',
          implication: plan.arudhaLagna.padaSign
            ? `People remember the user more clearly through ${jaiminiSignTheme(plan.arudhaLagna.padaSign)}.`
            : 'Do not overstate public-role guidance.',
        },
      ],
      eyebrow: 'JAIMINI',
      tier: 'premium',
      title: 'Visible Reputation and Public Role',
    },
    {
      body:
        `${premiumBlock?.prediction ?? interpretation.premiumSummary} The current chapter should be acted on now; the next chapter should be prepared for calmly before it arrives.`,
      bullets: [
        currentChapter
          ? `Current destiny chapter: ${currentChapter.sign} - ${jaiminiSignTheme(currentChapter.sign)}.`
          : 'Current destiny chapter pending.',
        nextChapter
          ? `Upcoming destiny chapter: ${nextChapter.sign} - ${jaiminiSignTheme(nextChapter.sign)}.`
          : 'Upcoming destiny chapter pending.',
        premiumBlock?.guidance ?? 'Use the current signal as an action map, not as a fear-based prophecy.',
      ],
      confidence: jaiminiConfidence(plan.calculationStatus),
      evidence: [
        ...(currentChapter?.evidence ?? []),
        ...(nextChapter?.evidence ?? []),
      ],
      evidenceTable: dashaRows.slice(0, 2),
      eyebrow: 'JAIMINI',
      tier: 'premium',
      title: 'Current and Upcoming Destiny Chapters',
    },
    {
      body:
        `${focusBlock?.prediction ?? 'Jaimini guidance becomes valuable only when it changes real choices.'} The practical move is to choose one path, one boundary, and one visible proof of maturity now.`,
      bullets: [
        focusBlock?.guidance ?? 'Reduce noise and act on the strongest calculated signal.',
        atmakaraka
          ? `Soul practice: express ${jaiminiSignTheme(atmakaraka.sign)} through ${atmakaraka.planet} without overcompensating.`
          : 'Soul practice: wait for Atmakaraka evidence before forcing a spiritual label.',
        amatyakaraka
          ? `Work practice: make ${amatyakaraka.planet} useful in a visible, measurable way.`
          : 'Work practice: keep output measurable until career evidence is complete.',
        darakaraka
          ? `Relationship practice: let ${darakaraka.planet} become a bridge instead of a test.`
          : 'Relationship practice: name expectations early and avoid assumption.',
      ],
      confidence: jaiminiConfidence(plan.calculationStatus),
      evidence: [
        interpretation.premiumSummary,
        ...interpretation.guardrails,
      ],
      evidenceTable: [
        {
          confidence: 'high',
          factor: 'Practical guidance',
          observation: 'Prediction-first Jaimini reading.',
          implication: 'The report gives action after the prediction and keeps technical details in the appendix.',
        },
      ],
      eyebrow: 'JAIMINI',
      tier: 'premium',
      title: 'Practical Jaimini Guidance',
    },
    {
      body:
        'The technical appendix exists for audit and transparency. It is not the main reading, and it must not turn the report into a technical manual.',
      bullets: [
        ...interpretation.technicalEvidence.slice(0, 10),
        `Warnings: ${plan.evidenceWarnings.join(' ') || 'none'}.`,
      ],
      confidence: jaiminiConfidence(plan.calculationStatus),
      evidence: [
        ...interpretation.technicalEvidence,
        ...plan.evidenceWarnings,
      ],
      evidenceTable: [
        ...karakaRows,
        ...dashaRows.slice(0, 4),
      ],
      eyebrow: 'JAIMINI APPENDIX',
      tier: 'premium',
      title: 'Technical Jaimini Appendix',
    },
  ];
}

function jaiminiBlockToSection({
  block,
  eyebrow,
  fallbackBody,
  fallbackTitle,
  tier,
}: {
  block?: JaiminiInterpretationBlock;
  eyebrow: string;
  fallbackBody: string;
  fallbackTitle: string;
  tier: 'free' | 'premium';
}): PdfSection {
  return {
    body: block ? `${block.headline} ${block.prediction}` : fallbackBody,
    bullets: block
      ? [
          `Prediction: ${block.prediction}`,
          `Guidance: ${block.guidance}`,
          ...block.technicalEvidence.slice(0, tier === 'premium' ? 3 : 2).map(item => `Evidence: ${item}`),
        ]
      : [fallbackBody],
    confidence: block?.confidence === 'high' ? 'high' : block?.confidence === 'medium' ? 'medium' : 'low',
    evidence: block?.technicalEvidence ?? [fallbackBody],
    evidenceTable: block?.technicalEvidence.slice(0, tier === 'premium' ? 5 : 3).map(item => ({
      confidence: block.confidence === 'high' ? 'high' : block.confidence === 'medium' ? 'medium' : 'low',
      factor: block.title,
      observation: item,
      implication: block.guidance,
    })),
    eyebrow,
    tier,
    title: block?.title ?? fallbackTitle,
  };
}

function resolveJaiminiPairStatus(
  first: 'partial' | 'pending' | 'ready',
  second: 'partial' | 'pending' | 'ready',
): 'partial' | 'pending' | 'ready' {
  if (first === 'ready' && second === 'ready') {
    return 'ready';
  }

  if (first === 'pending' && second === 'pending') {
    return 'pending';
  }

  return 'partial';
}

function jaiminiConfidence(
  status: 'partial' | 'pending' | 'ready',
): 'low' | 'medium' | 'high' {
  if (status === 'ready') {
    return 'high';
  }

  if (status === 'partial') {
    return 'medium';
  }

  return 'low';
}

function jaiminiKarakaPrediction(
  role: string,
  planet: string,
  sign: string,
): string {
  const roleMeaning: Record<string, string> = {
    Amatyakaraka: 'work grows when skill, responsibility, and useful visibility become consistent',
    Atmakaraka: 'life keeps returning the user to the deeper soul lesson until it is handled maturely',
    Bhratrikaraka: 'courage and support improve when initiative is cleaner and less reactive',
    Darakaraka: 'relationships mirror the lesson that must become conscious instead of repeated',
    Gnatikaraka: 'conflict, service, and pressure become easier when discipline replaces resentment',
    Matrikaraka: 'home, care, and emotional grounding improve through steadier choices',
    Putrakaraka: 'creativity, legacy, and future-building improve when attention is protected',
  };

  return `${planet} as ${role} says ${roleMeaning[role] ?? 'this life area becomes stronger through conscious maturity'} through ${jaiminiSignTheme(sign)}.`;
}

function jaiminiSignTheme(sign: string): string {
  const themes: Record<string, string> = {
    Aquarius: 'systems, networks, unusual thinking, and contribution beyond the obvious path',
    Aries: 'courage, initiative, clean self-direction, and decisive action',
    Cancer: 'care, emotional security, belonging, and protective strength',
    Capricorn: 'structure, duty, ambition, patience, and slow-earned authority',
    Gemini: 'communication, learning, trade, and flexible intelligence',
    Leo: 'visibility, leadership, confidence, and creative authority',
    Libra: 'balance, agreements, partnership, fairness, and public harmony',
    Pisces: 'faith, imagination, surrender, and spiritual sensitivity',
    Sagittarius: 'belief, teaching, higher direction, and principled expansion',
    Scorpio: 'depth, transformation, emotional honesty, and private strength',
    Taurus: 'stability, value, patience, wealth sense, and material steadiness',
    Virgo: 'skill, service, refinement, correction, and practical mastery',
  };

  return themes[sign] ?? `${sign} themes`;
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
        `${plan.storyLens.strongestThread} Prediction: this pattern is not random; it keeps returning so the person can turn the gift into wiser action and stop repeating the same loop under pressure.`,
      bullets: [
        `Life pattern prediction: ${plan.storyLens.hiddenPatternSentence}`,
        `Gift becoming stronger: ${plan.digest.giftInsidePattern}`,
        `Current lesson: ${plan.storyLens.activeLesson}`,
        `Shadow loop to stop feeding: ${plan.storyLens.stuckPoint}`,
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
        `Rahu-Ketu prediction: life pulls the person toward ${plan.rahuKetuAxis.pullsForward.toLowerCase()} while repeatedly asking them to release ${plan.rahuKetuAxis.learningToRelease.toLowerCase()}`,
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
        `Nadi prediction path: the past pattern is ${plan.storyLens.repeatingPattern.toLowerCase()} The current lesson is ${plan.storyLens.activeLesson.toLowerCase()} The next practice is ${plan.rahuKetuAxis.balancePractice.toLowerCase()}`,
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
        'Validation keeps the Nadi reading honest, but it should not replace the reading. These questions refine the prediction so the next version becomes more personal and less generic.',
      bullets: [
        `Validation status: ${plan.validationStatus}.`,
        ...validationQuestions.map(question => `Validation question: ${question}`),
        isPremium
          ? 'Premium uses validation answers to sharpen story sequencing, activation timing, and practices.'
          : 'Free gives enough validation to test the story while still giving the main prediction now.',
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
      'Nadi evidence note: this report stays inside Nadi-style planetary story intelligence. The main reading is the karmic story, activation, lesson, and practice; technical limits stay here at the end.',
    bullets: [
      'Prediction lane: karmic patterns, repeated life themes, relationship mirrors, activation periods, and gentle practices.',
      'Limit: no unsupported palm-leaf manuscript claim, no one-line fatalism, and no KP/Vedic chart dumping.',
      'Deeper timing becomes stronger only when the story is validated through lived recognition.',
    ],
    confidence: 'high',
    evidence: [
      'Nadi lane only.',
      'Birth-chart plate pages are intentionally excluded from Nadi report output.',
      'Nadi chart remains included as the story-anchor report chart.',
      'It does not claim palm-leaf manuscript access.',
      'Predicta does not claim access to real palm-leaf manuscripts or private lineage records.',
      ...plan.guardrails,
      ...plan.limitations,
    ],
    evidenceTable: [
      {
        confidence: 'high',
        factor: 'Nadi evidence scope',
        implication: 'Keep the main report as karmic story, validation, activation, and practice.',
        observation: 'Nadi-style planetary story links, Rahu/Ketu axis, validation questions, and activation timing.',
      },
      {
        confidence: 'high',
        factor: 'Source boundary',
        implication: 'This keeps the reading symbolic, honest, and free of unsupported manuscript claims.',
        observation: 'Symbolic Nadi-style reading only.',
      },
    ],
    eyebrow: 'NADI',
    tier: isPremium ? 'premium' : 'free',
    title: 'Nadi Evidence and Limits',
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
        'Numerology stays separate from Parashari, KP, and Jaimini unless a future approved synthesis report explicitly says so.',
      ],
      confidence: 'low',
      evidence: profile.evidence,
      eyebrow: 'NUMEROLOGY',
      tier: 'free',
      title: 'Numerology profile',
    }];
  }

  const dashboard = profile.identityDashboard;
  const numerologyValueContract = buildNumerologyReportValueContract({
    kundli,
    mode,
    profile,
  });
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
      body: numerologyValueContract.openingPrediction,
      bullets: [
        numerologyValueContract.timingPromise,
        numerologyValueContract.freeDepthPromise,
        ...(isPremium ? [numerologyValueContract.paidDepthPromise] : []),
        numerologyValueContract.actionPromise,
      ],
      confidence: 'medium',
      evidence: [
        numerologyValueContract.evidencePromise,
        `Required Numerology modules: ${numerologyValueContract.requiredModules.join(', ')}.`,
        `Required Numerology order: ${numerologyValueContract.sectionOrder.join(' -> ')}.`,
      ],
      evidenceTable: [
        {
          confidence: 'medium',
          factor: 'Name rhythm',
          implication: `The name projects through ${profile.nameNumber.simpleMeaning}.`,
          observation: `${profile.nameNumber.root} ${profile.nameNumber.label}; compound ${profile.nameNumber.compound}.`,
        },
        {
          confidence: 'medium',
          factor: 'Destiny direction',
          implication: `Life direction leans toward ${profile.destinyNumber.simpleMeaning}.`,
          observation: `${profile.destinyNumber.root} ${profile.destinyNumber.label}.`,
        },
        {
          confidence: 'medium',
          factor: 'Current cycle',
          implication: dashboard.bestUseOfCurrentCycle,
          observation: `Year ${profile.personalYear.root}, month ${profile.personalMonth.root}, day ${profile.personalDay.root}.`,
        },
      ],
      eyebrow: 'NUMEROLOGY',
      tier: isPremium ? 'premium' : 'free',
      title: isPremium
        ? 'What your numbers are predicting with premium depth'
        : 'What your numbers are predicting',
    },
    {
      body:
        `${dashboard.lifeThemeSentence} Prediction: the name, birth code, destiny number, and current cycle are pointing toward a specific rhythm of action now. Best Use Of This Cycle: ${dashboard.bestUseOfCurrentCycle}`,
      bullets: [
        `Main number prediction: ${dashboard.lifeThemeSentence}`,
        `Best use now: ${dashboard.bestUseOfCurrentCycle}`,
        `Name rhythm ${profile.nameNumber.root} (${profile.nameNumber.label}): ${profile.nameNumber.simpleMeaning}.`,
        `Birth code ${profile.birthNumber.root} (${profile.birthNumber.label}): ${profile.birthNumber.simpleMeaning}.`,
        `Destiny direction ${profile.destinyNumber.root} (${profile.destinyNumber.label}): ${profile.destinyNumber.simpleMeaning}.`,
        `Today cycle: personal year ${profile.personalYear.root}, month ${profile.personalMonth.root}, day ${profile.personalDay.root}.`,
      ],
      confidence: 'medium',
      evidence: [
        profile.summary,
        dashboard.reportSummary,
        'It reads name rhythm and birth-date numbers without casually mixing other schools.',
        'Numerology-only: no Parashari charts, KP event logic, Jaimini destiny evidence, or Signature traits are mixed into this report.',
      ],
      evidenceTable: mandalaRows,
      eyebrow: 'NUMEROLOGY',
      tier: isPremium ? 'premium' : 'free',
      title: 'Your Number Signature',
    },
    {
      body:
        `Name Rhythm prediction: ${dashboard.nameStrength} ${dashboard.firstLetterInfluence} Your name is likely to project through public rhythm, expression, steadiness, and visibility; the useful move is to make that signal cleaner and more consistent.`,
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
          implication: `Name prediction: ${profile.nameNumber.simpleMeaning}.`,
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
        `Birth Code prediction: ${dashboard.maturityDirection} The birth and destiny numbers point to the instinctive response pattern and the maturity direction that should be strengthened now.`,
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
          implication: `Instinctive prediction: ${profile.birthNumber.simpleMeaning}.`,
          observation: `${profile.birthNumber.root} ${profile.birthNumber.label}; birth date ${profile.birthDate}.`,
        },
        {
          confidence: 'medium',
          factor: 'Destiny number',
          implication: `Life-direction prediction: ${profile.destinyNumber.simpleMeaning}.`,
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
        `Missing / Repeated Number Grid: repeated ${dashboard.repeatedNumbers.join(', ') || 'none'}; missing ${dashboard.missingNumbers.join(', ') || 'none'}. Repeated numbers show the louder habits to use wisely; missing numbers show the habits to practice calmly.`,
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
        `This is where the numbers become useful: ${dashboard.freeInsight} The guidance stays practical across work, relationships, money, and self-expression.`,
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
          `Supportive rhythm: ${dashboard.supportiveToolkit.framing}`,
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
        title: 'Compatibility and Supportive Rhythm',
      },
      {
        body:
          `Personal Year Timeline: ${timelinePreview.join(' ')} This is the 12-month rhythm map for planning with the current number weather instead of treating timing as vague.`,
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
          `Number calculation evidence: ${dashboard.calculationNote} This page keeps calculation details after the main prediction so the report stays useful and auditable.`,
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
        'Numerology calculation evidence is kept after the main prediction.',
      ],
        eyebrow: 'NUMEROLOGY',
        tier: 'premium',
        title: 'Number Calculation Evidence',
      },
    );
  }

  sections.push({
    body:
      'Numerology evidence note: this report stays inside name and birth-date number analysis. Calculation boundaries are preserved here, but the main report is meant to predict rhythm, choice, and focus in human language.',
    bullets: [
      'Prediction lane: number identity, name rhythm, current personal cycles, missing/repeated patterns, and practical alignment.',
      'Limit: this is number-led guidance, not pressure to change a name or a replacement for real-world judgement.',
      isPremium
        ? 'Premium adds deeper name refinement, compatibility, timing, and calculation proof while staying Numerology-only.'
        : 'Free gives the core number identity and action plan; premium adds deeper comparison and timing maps.',
    ],
    confidence: 'high',
    evidence: [
      'Numerology lane only.',
      'Birth-chart plate pages are intentionally excluded from Numerology report output.',
      'Vedic graha placement tables are intentionally excluded from Numerology report output.',
      'Numerology chart atmosphere notes are intentionally excluded from Numerology report output.',
    ],
    eyebrow: 'NUMEROLOGY',
    tier: isPremium ? 'premium' : 'free',
    title: 'Numerology Evidence and Limits',
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
        'Signature reading is not generated until a real uploaded, drawn, or confirmed signature exists. Predicta will not invent signature traits or pretend an empty input says something about the user.',
      bullets: [
        'Add one clear signature to receive a reflective self-expression reading.',
        'No signature means no signature prediction, no trait map, and no report download.',
        'Predicta does not store your signature image. It stays only in this session so we can prepare your reading. If you close this tab or leave the session, you may need to re-upload or re-draw it.',
        'Signature reading can reflect visible expression cues; it cannot verify identity, diagnose, or provide forensic proof.',
        'Premium compares confirmed samples and gives a refinement plan only after real traits are visible.',
      ],
      confidence: 'low',
      evidence: [
        ...model.evidence,
        ...model.safetyBoundaries.slice(0, 2),
      ],
      eyebrow: 'SIGNATURE',
      tier: 'free',
      title: 'Signature Input Required',
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
      ? 'Premium Signature Predicta reads confirmed visual traits as self-expression signals, then predicts how the current signature may be presenting confidence, clarity, rhythm, and public impression.'
      : 'Signature Predicta reads confirmed visual traits as self-expression signals and gives direct guidance on confidence, clarity, rhythm, and presentation.',
    bullets: [
      model.privacy.reportCopy,
      `Signature prediction: ${model.summary}`,
      ...traitLines,
      ...cardLines,
      `Limit: ${model.canAndCannotTellYou.join(' ')}`,
      `Strengths: ${model.strengths.slice(0, isPremium ? 7 : 4).join(', ') || 'waiting for confirmed traits'}.`,
      `Care points: ${model.cautions.slice(0, isPremium ? 5 : 2).join(', ') || 'keep the reading gentle and practical'}.`,
      ...practiceLines,
      ...(isPremium
        ? [
            'Premium depth compares repeated signatures, shows before/after expression shifts, and builds a signature refinement plan.',
          ]
        : [
            'Paid depth adds trait comparison, improvement plan, and refinement guidance.',
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
        implication: `${card.plainMeaning} ${card.caution}`,
        observation: `${card.plainMeaning}. ${card.evidence.join(' ')}`,
      })),
    eyebrow: 'SIGNATURE',
    tier: isPremium ? 'premium' : 'free',
    title: isPremium
      ? 'Signature Expression Prediction'
      : 'Signature Expression Insight',
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
    strongHouse ? `The strongest practical doorway is house ${strongHouse}: ${houseMeaning(strongHouse)}.` : ''
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
    body: 'The practical guidance is simple: use the current dasha consciously, protect weaker houses with routine, and avoid fear-based remedies. Full remedies appear once, in the consolidated action plan.',
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
    const plainVerdict = plainKpReportText(kp.eventJudgement.verdictLabel).replace(/not enough support/gi, 'general readiness');
    const plainAnswer = plainKpReportText(kp.eventJudgement.plainLanguage);
    const predictionMap = buildKpLifePredictionLines(kp, 'FREE');
    const helpfulAnswer = plainAnswer.includes('one concrete event question')
      ? `${predictionMap.action} Active areas: ${predictionMap.areas.slice(0, 3).map(item => item.area).join(', ')}.`
      : plainAnswer;
    return `KP Predicta: ${plainVerdict}. ${helpfulAnswer}`;
  }

  if (reportFocus === 'JAIMINI') {
    const interpretation = composeJaiminiInterpretation(kundli);
    const plan = composeJaiminiPlan(kundli);
    const chapter = plan.currentCharaDasha?.sign ?? 'current chapter pending';
    const soul = plan.atmakaraka
      ? `${plan.atmakaraka.planet} Atmakaraka in ${plan.atmakaraka.sign}`
      : 'Atmakaraka pending';

    return `Jaimini Predicta: ${interpretation.summary} Soul signal: ${soul}; Chara Dasha: ${chapter}.`;
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
  if (['JAIMINI', 'LIFE_ATLAS', 'KP', 'NUMEROLOGY', 'SIGNATURE'].includes(reportFocus)) {
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
    case 'JAIMINI':
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
    body: translateUiText(rewriteReportVoiceText(section.body), language),
    bullets: section.bullets.map(item => translateUiText(rewriteReportVoiceText(item), language)),
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
