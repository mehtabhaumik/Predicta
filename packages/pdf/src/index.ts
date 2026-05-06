import type {
  ChartData,
  ChartType,
  DecisionMemo,
  HouseData,
  KundliData,
  PDFMode,
  PlanetPosition,
  SupportedLanguage,
  TrustProfile,
} from '@pridicta/types';
import { buildTrustProfile } from '@pridicta/config/trust';

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

export type PdfComposition = {
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

const CORE_REPORT_CHARTS: ChartType[] = ['D1', 'D9', 'D10'];
const PREMIUM_REPORT_CHARTS: ChartType[] = [
  'D1',
  'D2',
  'D4',
  'D7',
  'D9',
  'D10',
  'D12',
  'D16',
  'D20',
  'D24',
  'D30',
];

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
}: {
  kundli?: KundliData;
  language?: SupportedLanguage;
  mode: PDFMode;
  decisionMemo?: DecisionMemo;
}): PdfComposition {
  if (!kundli) {
    return composeEmptyReport(mode, language);
  }

  const chartTypes = mode === 'PREMIUM' ? PREMIUM_REPORT_CHARTS : CORE_REPORT_CHARTS;
  const sections = [
    buildExecutiveSummary(kundli, mode),
    buildBirthAndCalculationSection(kundli),
    buildChartSynthesisSection(kundli, chartTypes),
    buildPlanetaryStrengthSection(kundli, mode),
    buildDashaSection(kundli, mode),
    buildTimelineSection(kundli, mode),
    buildTransitSection(kundli, mode),
    buildRectificationSection(kundli),
    buildAshtakavargaSection(kundli),
    buildYogaSection(kundli, mode),
    buildAreaSection(kundli, 'Career', ['D1', 'D10'], [10, 6, 11], ['Saturn', 'Sun', 'Mercury', 'Jupiter']),
    buildAreaSection(kundli, 'Relationship', ['D1', 'D9'], [7, 2, 11], ['Venus', 'Jupiter', 'Moon']),
    buildAreaSection(kundli, 'Wealth', ['D1', 'D2'], [2, 9, 11], ['Jupiter', 'Venus', 'Mercury']),
    ...(mode === 'PREMIUM'
      ? [
          buildAreaSection(kundli, 'Wellbeing', ['D1', 'D30'], [1, 6, 8, 12], ['Moon', 'Saturn', 'Mars']),
          buildAreaSection(kundli, 'Spiritual Practice', ['D1', 'D20'], [9, 12], ['Jupiter', 'Ketu', 'Moon']),
          buildAdvancedChartSection(kundli),
        ]
      : []),
    buildGuidanceSection(kundli, mode),
    ...(decisionMemo ? [buildDecisionMemoSection(decisionMemo)] : []),
    buildRemedySection(kundli),
    buildLimitationsSection(kundli, mode),
  ];

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
    cover: {
      metadata: [
        `${kundli.birthDetails.date} at ${kundli.birthDetails.time}`,
        kundli.birthDetails.place,
        `${kundli.lagna} Lagna | ${kundli.moonSign} Moon | ${kundli.nakshatra}`,
      ],
      subtitle: `Personal Vedic Astrology Dossier for ${kundli.birthDetails.name}`,
      title: 'PRIDICTA',
    },
    dossierVersion: '2.0',
    executiveSummary: localizeExecutiveSummary(
      buildDossierExecutiveSummary(kundli, mode),
      language,
    ),
    footer: 'Designed & Engineered by Bhaumik Mehta | Powered by deterministic Jyotish synthesis + AI | © 2026',
    language,
    mode,
    sections: localizeSections(polishedSections, language),
    summary: buildOneLineSummary(kundli),
    trustProfile,
    watermark: 'PRIDICTA',
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

function composeEmptyReport(mode: PDFMode, language: SupportedLanguage): PdfComposition {
  return {
    cover: {
      metadata: ['Generate a kundli to unlock chart-derived synthesis'],
      subtitle: 'Personal Vedic Astrology Dossier',
      title: 'PRIDICTA',
    },
    dossierVersion: '2.0',
    executiveSummary: localizeExecutiveSummary({
      confidence: 'low',
      headline: 'Generate a kundli to unlock a real intelligence dossier.',
      keySignals: [
        'D1, D9, D10, dasha, transits, remedies, and confidence labels appear after calculation.',
      ],
    }, language),
    footer: 'Designed & Engineered by Bhaumik Mehta | Powered by deterministic Jyotish synthesis + AI | © 2026',
    language,
    mode,
    sections: [
      {
        body: 'A report generated without kundli data can only show the structure. Once a calculated kundli is active, every section is composed from planets, houses, divisional charts, dasha, yogas, and ashtakavarga.',
        bullets: [
          'D1, D9, and D10 are treated as the core free report spine.',
          'Premium expands area analysis, dasha timeline, and advanced chart verification.',
        ],
        evidence: ['No kundli is active in this preview.'],
        confidence: 'low',
        evidenceTable: [
          {
            confidence: 'low',
            factor: 'Kundli payload',
            implication: 'Generate a kundli before reading dossier conclusions.',
            observation: 'No chart data is active.',
          },
        ],
        eyebrow: 'REPORT STRUCTURE',
        tier: 'free',
        title: 'Chart-derived report preview',
      },
    ],
    summary: 'Generate a real kundli before report synthesis.',
    trustProfile: buildTrustProfile({
      evidence: [],
      language,
      limitations: ['No kundli is active, so Predicta cannot produce chart-backed conclusions.'],
      surface: 'report',
    }),
    watermark: 'PRIDICTA',
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
      `${mode === 'PREMIUM' ? 'Premium dossier includes expanded area intelligence, evidence tables, and advanced chart verification.' : 'Free dossier keeps the same polished structure with focused chart depth.'}`,
    ],
  };
}

function enrichSection(section: PdfSection, mode: PDFMode): PdfSection {
  const premiumOnly = [
    'Advanced chart verification',
    'Wellbeing',
    'Spiritual Practice',
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

  return {
    body: `${kundli.birthDetails.name}'s report begins with ${kundli.lagna} Lagna, ${kundli.moonSign} Moon, and ${kundli.nakshatra} nakshatra. The active timing is ${current.mahadasha} Mahadasha with ${current.antardasha} Antardasha, so the report reads both the natal promise and the period currently delivering results.`,
    bullets: [
      `Strongest ashtakavarga support: houses ${strongest}.`,
      `Correction zones: houses ${weakest}.`,
      `${mode === 'PREMIUM' ? 'Premium mode includes expanded area synthesis and advanced chart checks.' : 'Free mode focuses on D1, D9, D10, dasha, yogas, and practical guidance.'}`,
    ],
    evidence: [
      `Lagna: ${kundli.lagna}`,
      `Moon: ${kundli.moonSign}, ${kundli.nakshatra}`,
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
        factor: 'Timing engine',
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

function buildBirthAndCalculationSection(kundli: KundliData): PdfSection {
  return {
    body: 'The calculation uses the stored birth details and Swiss Ephemeris metadata. This matters because Vedic readings are highly sensitive to birth time, timezone, ayanamsa, and node setting.',
    bullets: [
      `Name: ${kundli.birthDetails.name}`,
      `Birth: ${kundli.birthDetails.date} at ${kundli.birthDetails.time}`,
      `Place: ${kundli.birthDetails.place}`,
      `Timezone: ${kundli.birthDetails.timezone}`,
      `Ayanamsa: ${kundli.calculationMeta.ayanamsa}; house system: ${kundli.calculationMeta.houseSystem}; node: ${kundli.calculationMeta.nodeType}`,
    ],
    evidence: [
      `UTC birth time: ${kundli.calculationMeta.utcDateTime}`,
      `Provider: ${kundli.calculationMeta.provider}`,
    ],
    eyebrow: 'FOUNDATION',
    title: 'Birth and calculation foundation',
  };
}

function buildChartSynthesisSection(
  kundli: KundliData,
  chartTypes: ChartType[],
): PdfSection {
  const supported = chartTypes
    .map(chartType => chartSummary(kundli, chartType))
    .filter(Boolean);
  const unsupported = chartTypes
    .filter(chartType => kundli.charts[chartType] && !kundli.charts[chartType].supported)
    .map(chartType => `${chartType}: ${kundli.charts[chartType].unsupportedReason ?? 'not verified'}`);

  return {
    body: 'The report does not treat chart names as decoration. Each chart is included only when the calculation engine has verified support, and each chart is summarized by ascendant, occupied houses, and its role in synthesis.',
    bullets: supported,
    evidence: unsupported.length ? unsupported : ['All requested report charts are supported.'],
    eyebrow: 'CHART SYNTHESIS',
    title: 'D1, divisional charts, and verification',
  };
}

function buildPlanetaryStrengthSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const planets = mode === 'PREMIUM' ? kundli.planets : kundli.planets.slice(0, 7);
  const bullets = planets.map(planet => {
    const dignity = planetDignity(planet);
    return `${planet.name}: ${planet.sign} house ${planet.house}, ${planet.nakshatra} pada ${planet.pada}, ${dignity}${planet.retrograde ? ', retrograde' : ''}.`;
  });

  return {
    body: 'Planetary strength is read through sign, house, nakshatra, dignity, and retrogression. This gives the report concrete reasons before offering advice.',
    bullets,
    evidence: [
      `Supportive dignity count: ${planets.filter(planet => ['exalted', 'own sign'].includes(planetDignity(planet))).length}`,
      `Challenging dignity count: ${planets.filter(planet => planetDignity(planet) === 'debilitated').length}`,
    ],
    eyebrow: 'PLANETS',
    title: 'Planetary condition and strength',
  };
}

function buildDashaSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const current = kundli.dasha.current;
  const maha = findPlanet(kundli, current.mahadasha);
  const antar = findPlanet(kundli, current.antardasha);
  const nextMaha = kundli.dasha.timeline.slice(0, mode === 'PREMIUM' ? 5 : 3);

  return {
    body: `${current.mahadasha}/${current.antardasha} is the active timing engine from ${current.startDate} to ${current.endDate}. The report reads the natal houses of these planets to understand where effort, pressure, and results are likely to concentrate.`,
    bullets: [
      maha ? `${current.mahadasha} Mahadasha lord sits in house ${maha.house} in ${maha.sign}.` : `${current.mahadasha} Mahadasha lord is not in the primary planet list.`,
      antar ? `${current.antardasha} Antardasha lord sits in house ${antar.house} in ${antar.sign}.` : `${current.antardasha} Antardasha lord is not in the primary planet list.`,
      ...nextMaha.map(item => `${item.mahadasha}: ${item.startDate} to ${item.endDate}`),
    ],
    evidence: [
      `Current period: ${current.mahadasha}/${current.antardasha}`,
      `Dasha timeline sections included: ${nextMaha.length}`,
    ],
    decisionWindows: [
      {
        confidence: maha && antar ? 'high' : 'medium',
        evidence: [
          maha ? `${current.mahadasha} in house ${maha.house}.` : `${current.mahadasha} natal placement unavailable.`,
          antar ? `${current.antardasha} in house ${antar.house}.` : `${current.antardasha} natal placement unavailable.`,
        ],
        guidance: 'Make important choices by matching the decision topic to the active dasha lord houses.',
        label: 'Active dasha operating window',
        window: `${current.startDate} to ${current.endDate}`,
      },
    ],
    eyebrow: 'TIMING',
    title: 'Current dasha and timing emphasis',
  };
}

function buildTimelineSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const events = (kundli.lifeTimeline ?? []).slice(0, mode === 'PREMIUM' ? 10 : 5);

  return {
    body: 'The timeline joins dasha periods, important transits, rectification notes, and remedy practices into one planning view.',
    bullets: events.length
      ? events.map(event => `${event.title}: ${event.startDate}${event.endDate ? ` to ${event.endDate}` : ''} - ${event.summary}`)
      : ['Timeline insights will appear after the backend recalculates this kundli.'],
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

  return {
    body: 'Transit insights compare current planetary movement from both Lagna and Moon. This separates visible events from the internal pressure or support felt by the native.',
    bullets: transits.length
      ? transits.map(
          transit =>
            `${transit.planet} in ${transit.sign} house ${transit.houseFromLagna} from Lagna and ${transit.houseFromMoon} from Moon: ${transit.summary}`,
        )
      : ['Transit insights will appear after the backend recalculates this kundli.'],
    evidence: [
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
    title: 'Current transit weather',
  };
}

function buildRectificationSection(kundli: KundliData): PdfSection {
  const rectification = kundli.rectification;

  return {
    body: rectification?.needsRectification
      ? 'Birth time rectification is recommended before relying heavily on fine house timing or divisional chart micro-judgments.'
      : 'Birth time looks stable enough for standard report synthesis, while still deserving normal verification.',
    bullets: [
      ...(rectification?.reasons ?? ['No rectification diagnostics available on this kundli payload.']),
      ...(rectification?.questions ?? []).map(question => `Check: ${question}`),
      rectification?.needsRectification
        ? 'Safe: broad D1 themes and dasha chapters. Cautious: D9/D10 fine timing. Unsafe: D60 or exact event dates.'
        : 'Safe: D1 and core divisional synthesis. Still cautious: exact event dates and unsupported D60 claims.',
    ],
    evidence: rectification
      ? [
          `Ascendant degree: ${rectification.ascendantDegree}.`,
          `Rectification confidence: ${rectification.confidence}.`,
        ]
      : ['Rectification payload missing.'],
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
          : 'Rectification payload missing.',
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
    tier: ['Wellbeing', 'Spiritual Practice'].includes(title) ? 'premium' : 'free',
    title,
  };
}

function buildAdvancedChartSection(kundli: KundliData): PdfSection {
  const supported = PREMIUM_REPORT_CHARTS.filter(
    chartType => kundli.charts[chartType]?.supported,
  );
  const unsupported = PREMIUM_REPORT_CHARTS.filter(
    chartType => kundli.charts[chartType] && !kundli.charts[chartType].supported,
  );

  return {
    body: 'Premium depth expands chart coverage while keeping verification strict. Unsupported vargas are disclosed rather than filled with fake data.',
    bullets: supported.map(chartType => chartSummary(kundli, chartType)).filter(Boolean),
    evidence: [
      `Supported premium charts: ${supported.join(', ')}.`,
      `Not yet verified: ${unsupported.length ? unsupported.join(', ') : 'none in premium set'}.`,
    ],
    eyebrow: 'PREMIUM DEPTH',
    title: 'Advanced chart verification',
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
      mode === 'PREMIUM' ? 'Review the advanced chart section before making irreversible timing decisions.' : 'Upgrade depth is most useful when you need area-by-area timing and advanced chart checks.',
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
      : ['Remedy insights will appear after the backend recalculates this kundli.'],
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
      ? 'Birth time is marked approximate, so house and divisional chart judgments need caution.'
      : 'Birth time is treated as exact because it is not marked approximate.',
    unsupported.length
      ? `Unsupported vargas are disclosed, not interpreted: ${unsupported.join(', ')}.`
      : 'All registered charts in this payload are supported.',
    mode === 'FREE'
      ? 'Free reports keep the synthesis focused and omit premium-only advanced expansion.'
      : 'Premium reports add depth but still avoid guaranteed outcomes.',
  ];

  return {
    body: 'A trustworthy report should name its limits. This protects the user from false certainty and keeps the reading grounded.',
    bullets: limitations,
    evidence: [
      `Input hash: ${kundli.calculationMeta.inputHash}`,
      `Calculated at: ${kundli.calculationMeta.calculatedAt}`,
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
    return `${chartType}: not present in kundli payload.`;
  }
  if (!chart.supported) {
    return `${chartType}: not interpreted because ${chart.unsupportedReason ?? 'the formula is not verified'}.`;
  }

  return `${chartType} ${chart.name}: ${chart.ascendantSign} ascendant; occupied houses ${occupiedHouses(chart)}.`;
}

function occupiedHouses(chart: ChartData): string {
  const occupied = Object.entries(chart.housePlacements)
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
    return `House ${houseNumber}: not present in payload.`;
  }

  const sav = houseSav(kundli, item);
  return `House ${houseNumber}: ${item.sign}, lord ${item.lord}, planets ${item.planets.length ? item.planets.join(', ') : 'none'}${sav === undefined ? '' : `, SAV ${sav}`}; ${houseMeaning(houseNumber)}.`;
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
    body: `${localizedPrefix(language)} ${section.body}`,
    eyebrow: localizeSectionEyebrow(section.eyebrow, language),
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
    headline: `${localizedPrefix(language)} ${summary.headline}`,
    keySignals: summary.keySignals.map(signal => `${localizedSignalLabel(language)} ${signal}`),
  };
}

function localizedPrefix(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'हिंदी मार्गदर्शन:';
  }
  if (language === 'gu') {
    return 'ગુજરાતી માર્ગદર્શન:';
  }
  return '';
}

function localizedSignalLabel(language: SupportedLanguage): string {
  return language === 'hi' ? 'मुख्य संकेत:' : 'મુખ્ય સંકેત:';
}

function localizeSectionTitle(title: string, language: SupportedLanguage): string {
  const titleMap: Record<string, { gu: string; hi: string }> = {
    'Advanced chart verification': {
      gu: 'અદ્યતન ચાર્ટ ચકાસણી',
      hi: 'उन्नत चार्ट सत्यापन',
    },
    'Birth and calculation foundation': {
      gu: 'જન્મ અને ગણતરીનો આધાર',
      hi: 'जन्म और गणना का आधार',
    },
    'Birth time confidence': {
      gu: 'જન્મ સમય વિશ્વાસ',
      hi: 'जन्म समय भरोसा',
    },
    Career: {
      gu: 'કારકિર્દી',
      hi: 'करियर',
    },
    'Chart-derived report preview': {
      gu: 'ચાર્ટ આધારિત રિપોર્ટ પૂર્વાવલોકન',
      hi: 'चार्ट-आधारित रिपोर्ट पूर्वावलोकन',
    },
    'Current dasha and timing emphasis': {
      gu: 'વર્તમાન દશા અને સમય ભાર',
      hi: 'वर्तमान दशा और समय संकेत',
    },
    'Current transit weather': {
      gu: 'વર્તમાન ગોચર વાતાવરણ',
      hi: 'वर्तमान गोचर स्थिति',
    },
    'Executive summary': {
      gu: 'મુખ્ય સારાંશ',
      hi: 'कार्यकारी सारांश',
    },
    'Life timeline and planning windows': {
      gu: 'જીવન સમયરેખા અને આયોજન વિન્ડો',
      hi: 'जीवन समयरेखा और योजना खिड़कियां',
    },
    'Limits and confidence': {
      gu: 'મર્યાદા અને વિશ્વાસ',
      hi: 'सीमाएं और भरोसा',
    },
    'Practical guidance and remedies': {
      gu: 'વ્યવહારુ માર્ગદર્શન અને ઉપાય',
      hi: 'व्यावहारिक मार्गदर्शन और उपाय',
    },
    Relationship: {
      gu: 'સંબંધ',
      hi: 'संबंध',
    },
    'Remedy plan': {
      gu: 'ઉપાય યોજના',
      hi: 'उपाय योजना',
    },
    Wealth: {
      gu: 'ધન',
      hi: 'धन',
    },
    Wellbeing: {
      gu: 'સુખાકારી',
      hi: 'स्वास्थ्य-संतुलन',
    },
  };
  const mapped = titleMap[title];

  return mapped ? (language === 'gu' ? mapped.gu : mapped.hi) : title;
}

function localizeSectionEyebrow(
  eyebrow: string,
  language: SupportedLanguage,
): string {
  const eyebrowMap: Record<string, { gu: string; hi: string }> = {
    ASHTAKAVARGA: { gu: 'અષ્ટકવર્ગ', hi: 'अष्टकवर्ग' },
    CAREER: { gu: 'કારકિર્દી', hi: 'करियर' },
    'CHART SYNTHESIS': { gu: 'ચાર્ટ સંશ્લેષણ', hi: 'चार्ट संश्लेषण' },
    FOUNDATION: { gu: 'આધાર', hi: 'आधार' },
    GUIDANCE: { gu: 'માર્ગદર્શન', hi: 'मार्गदर्शन' },
    PLANETS: { gu: 'ગ્રહો', hi: 'ग्रह' },
    RECTIFICATION: { gu: 'જન્મ સમય તપાસ', hi: 'जन्म समय जांच' },
    REMEDIES: { gu: 'ઉપાય', hi: 'उपाय' },
    SYNTHESIS: { gu: 'સંશ્લેષણ', hi: 'संश्लेषण' },
    TIMELINE: { gu: 'સમયરેખા', hi: 'समयरेखा' },
    TIMING: { gu: 'સમય', hi: 'समय' },
    TRANSITS: { gu: 'ગોચર', hi: 'गोचर' },
    TRUST: { gu: 'વિશ્વાસ', hi: 'भरोसा' },
  };
  const mapped = eyebrowMap[eyebrow];

  return mapped ? (language === 'gu' ? mapped.gu : mapped.hi) : eyebrow;
}
