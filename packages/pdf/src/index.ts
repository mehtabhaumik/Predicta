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
import {
  composeChartInsight,
  composeChalitBhavKpFoundation,
  composeAdvancedJyotishCoverage,
  composeMahadashaIntelligence,
  composeNadiJyotishPlan,
  composeSadeSatiIntelligence,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
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

  const chartTypes = getReportChartTypes(kundli);
  const sections = [
    buildExecutiveSummary(kundli, mode),
    buildBirthAndCalculationSection(kundli),
    buildChartSynthesisSection(kundli, chartTypes, mode),
    buildBhavChalitSection(kundli, mode),
    buildKpFoundationSection(kundli, mode),
    buildNadiJyotishPlanSection(kundli, mode),
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
      title: 'PREDICTA',
    },
    dossierVersion: '2.0',
    executiveSummary: localizeExecutiveSummary(
      buildDossierExecutiveSummary(kundli, mode),
      language,
    ),
    footer: 'Designed & Engineered by Bhaumik Mehta | Powered by chart-backed Jyotish synthesis + AI | © 2026',
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

function buildBhavChalitSection(kundli: KundliData, mode: PDFMode): PdfSection {
  const foundation = composeChalitBhavKpFoundation(kundli, { depth: mode });
  const bhav = foundation.bhavChalit;

  return {
    body:
      'Bhav Chalit is included as a Parashari house-refinement layer. It changes house delivery when exact cusps move a planet into another bhav, but it does not replace the D1 Rashi chart.',
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
            `${item.planet}: D1 house ${item.rashiHouse} to Bhav house ${item.bhavHouse}.`,
        ),
    ],
    evidence: bhav.evidence,
    evidenceTable: bhav.shifts.slice(0, mode === 'PREMIUM' ? 9 : 4).map(item => ({
      confidence: 'medium',
      factor: `${item.planet} Chalit shift`,
      implication: `House emphasis moves toward Bhav house ${item.bhavHouse}; sign dignity remains ${item.rashiSign}.`,
      observation: `D1 house ${item.rashiHouse} to Bhav house ${item.bhavHouse}.`,
    })),
    eyebrow: 'BHAV CHALIT',
    tier: mode === 'PREMIUM' ? 'premium' : 'free',
    title:
      mode === 'PREMIUM'
        ? 'Bhav Chalit cusp and house refinement'
        : 'Bhav Chalit useful insight',
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
    footer: 'Designed & Engineered by Bhaumik Mehta | Powered by chart-backed Jyotish synthesis + AI | © 2026',
    language,
    mode,
    sections: [
      {
        body: 'A report generated without kundli data can only show the structure. Once a calculated kundli is active, every section is composed from planets, houses, divisional charts, dasha, yogas, and ashtakavarga.',
        bullets: [
          'Free reports include every available chart with useful, simple insight.',
          'Premium reports keep the same chart coverage and add detailed synthesis, timing, remedies, and evidence tables.',
        ],
        evidence: ['No kundli is active in this preview.'],
        confidence: 'low',
        evidenceTable: [
          {
            confidence: 'low',
            factor: 'Kundli details',
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
      `${mode === 'PREMIUM' ? 'Premium dossier includes detailed area intelligence, evidence tables, timing, and remedies.' : 'Free dossier includes every available chart with useful insight and honest limits.'}`,
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

  return {
    body: `${kundli.birthDetails.name}'s report begins with ${kundli.lagna} Lagna, ${kundli.moonSign} Moon, and ${kundli.nakshatra} nakshatra. The active timing is ${current.mahadasha} Mahadasha with ${current.antardasha} Antardasha, so the report reads both the natal promise and the period currently delivering results.`,
    bullets: [
      `Strongest ashtakavarga support: houses ${strongest}.`,
      `Correction zones: houses ${weakest}.`,
      `${mode === 'PREMIUM' ? 'Premium mode adds detailed synthesis, timing windows, remedies, and evidence tables.' : 'Free mode includes all available charts with useful insight instead of hiding charts.'}`,
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
  mode: PDFMode,
): PdfSection {
  const hasPremiumAccess = mode === 'PREMIUM';
  const supported = chartTypes.flatMap(chartType => {
    const chart = kundli.charts[chartType];
    if (!chart) {
      return [`${chartType}: not present in this Kundli.`];
    }
    const insight = composeChartInsight({ chart, hasPremiumAccess });
    return [
      `${chartType} ${insight.title}: ${insight.summary}`,
      ...insight.bullets.slice(0, hasPremiumAccess ? 3 : 2).map(bullet => `${chartType}: ${bullet}`),
    ];
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
      ? 'Every available chart is included, and premium depth turns the chart list into detailed synthesis anchored to D1, timing, confidence, and remedies.'
      : 'Every available chart is included for free. Free depth explains what the chart is for and gives useful placement insight without pretending to be a full astrologer-grade analysis.',
    bullets: supported,
    evidence: [
      `Charts included in this report: ${chartTypes.join(', ')}.`,
      unsupported.length
        ? `Charts still under review: ${unsupported.join(' ')}`
        : 'All charts present in this Kundli are supported.',
    ],
    eyebrow: 'CHART SYNTHESIS',
    title: mode === 'PREMIUM'
      ? 'All charts with premium depth'
      : 'All charts with useful insight',
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
      ...(rectification?.reasons ?? ['No birth-time confidence details are available on this Kundli.']),
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
      : ['Birth-time confidence details are not available yet.'],
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
          : 'Birth-time confidence details are not available yet.',
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

  return {
    body:
      mode === 'PREMIUM'
        ? 'Advanced coverage keeps every major Jyotish feature available while turning the technical layers into useful synthesis, tables, and planning guidance.'
        : 'Advanced coverage is generous in free mode: users see the major Jyotish surfaces with simple insight, while detailed scoring and tables stay in Premium.',
    bullets: [
      `Modules covered: ${coverage.moduleRegistry.map(item => item.simpleName).join(', ')}.`,
      `Nakshatra: ${coverage.nakshatraInsight.moonNakshatra} pada ${coverage.nakshatraInsight.pada}, lord ${coverage.nakshatraInsight.lord}.`,
      coverage.nakshatraInsight.simpleInsight,
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
  const chartTypes = getReportChartTypes(kundli);
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
      ? 'Premium does not unlock hidden charts; it unlocks deeper reading of the same Jyotish surface with timing, cross-checking, and evidence tables.'
      : 'Free reports do not hide the astrology surface. Predicta shows what is available, explains it simply, and names anything not yet calculated instead of faking it.',
    bullets: [
      `Available charts included: ${chartTypes.join(', ')}.`,
      `Mahadasha/Antardasha included: ${dasha.mahadasha}/${dasha.antardasha} from ${dasha.startDate} to ${dasha.endDate}.`,
      `Ashtakavarga included: total SAV ${kundli.ashtakavarga.totalScore}, strongest houses ${kundli.ashtakavarga.strongestHouses.join(', ')}.`,
      `Transits included: ${(kundli.transits ?? []).length ? `${kundli.transits?.length} current transit records.` : 'not yet included.'}`,
      `Yearly horoscope: ${kundli.yearlyHoroscope ? `${kundli.yearlyHoroscope.yearLabel} Varshaphal foundation included.` : 'not yet included.'}`,
      `Yogas/doshas included: ${kundli.yogas.length ? `${kundli.yogas.length} recognized patterns.` : 'no recognized patterns in this Kundli.'}`,
      `Remedies included: ${(kundli.remedies ?? []).length ? `${kundli.remedies?.length} remedy practices.` : 'not yet included.'}`,
      `Sade Sati: derived from Saturn transit and Moon sign (${sadeSati.phaseLabel}).`,
      `Bhav/Chalit: ${hasBhav || hasChalit ? 'included.' : 'not yet calculated.'}`,
      `KP horoscope: ${hasKp ? 'included.' : 'not yet calculated.'}`,
    ],
    evidence: [
      `Ready charts: ${supported.join(', ') || 'none'}.`,
      `Charts still under review: ${unsupported.length ? unsupported.join(', ') : 'none'}.`,
      'Predicta clearly marks anything it is not ready to use for guidance.',
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
      ? 'Birth time is marked approximate, so house and divisional chart judgments need caution.'
      : 'Birth time is treated as exact because it is not marked approximate.',
    unsupported.length
      ? `Unsupported vargas are disclosed, not interpreted: ${unsupported.join(', ')}.`
      : 'All registered charts in this Kundli are supported.',
    mode === 'FREE'
      ? 'Free reports include every available chart with useful insight, while premium adds detailed synthesis and timing.'
      : 'Premium reports add depth, timing, and evidence tables but still avoid guaranteed outcomes.',
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
    return `${chartType}: not present in this Kundli.`;
  }
  if (!chart.supported) {
    return `${chartType}: not interpreted because ${
      chart.unsupportedReason ??
      'Predicta is still reviewing this chart before using it for guidance'
    }.`;
  }

  return `${chartType} ${chart.name}: ${chart.ascendantSign} ascendant; occupied houses ${occupiedHouses(chart)}.`;
}

function getReportChartTypes(kundli: KundliData): ChartType[] {
  return (Object.keys(kundli.charts) as ChartType[]).sort(compareChartType);
}

function compareChartType(a: ChartType, b: ChartType): number {
  return chartTypeNumber(a) - chartTypeNumber(b);
}

function chartTypeNumber(chartType: ChartType): number {
  return Number(chartType.replace('D', '')) || 0;
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
    return `House ${houseNumber}: not present in this Kundli.`;
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
    'Current transit weather and Sade Sati': {
      gu: 'વર્તમાન ગોચર અને સાડે સાથી',
      hi: 'वर्तमान गोचर और साढ़े साती',
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
