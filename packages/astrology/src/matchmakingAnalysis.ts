import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import type {
  KundliData,
  MatchmakingAnalysis,
  MatchmakingCategoryId,
  MatchmakingDepth,
  MatchmakingDetailSection,
  MatchmakingScoreBand,
  MatchmakingScoreBreakdown,
  PlanetPosition,
  SupportedLanguage,
} from '@pridicta/types';

type MatchmakingOptions = {
  depth?: MatchmakingDepth;
  language?: SupportedLanguage;
};

type Copy = {
  bandLabels: Record<MatchmakingScoreBand, string>;
  pending: {
    askPrompt: string;
    baseline: string;
    conclusion: string;
    familyRisk: string;
    premiumUnlock: string;
    support: string;
    subtitle: string;
    timing: string;
    title: string;
  };
  titles: Record<MatchmakingCategoryId, string>;
  sectionTitles: {
    familyBlending: string;
    practicalAdvice: string;
    pressurePoints: string;
    scoreLogic: string;
    supportPotential: string;
    timing: string;
  };
  sentences: {
    askPrompt: (boy: string, girl: string) => string;
    baseline: string;
    conclusion: Record<MatchmakingScoreBand, string>;
    emotionalStrong: string;
    emotionalWeak: string;
    familyStrong: string;
    familyWeak: string;
    premiumUnlock: string;
    scoreBandExplanation: Record<MatchmakingScoreBand, string>;
    subtitle: string;
    supportPotential: string;
    timing: string;
    traditional: string;
  };
};

const ZODIAC = [
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

const FIRE_SIGNS = new Set(['Aries', 'Leo', 'Sagittarius']);
const EARTH_SIGNS = new Set(['Taurus', 'Virgo', 'Capricorn']);
const AIR_SIGNS = new Set(['Gemini', 'Libra', 'Aquarius']);
const WATER_SIGNS = new Set(['Cancer', 'Scorpio', 'Pisces']);
const MANGLIK_HOUSES = new Set([1, 4, 7, 8, 12]);
const SUPPORTIVE_HOUSES = new Set([1, 4, 5, 7, 9, 10, 11]);
const CHALLENGING_HOUSES = new Set([6, 8, 12]);
const SUPPORTIVE_ELEMENT_PAIRS = new Set([
  'fire-air',
  'air-fire',
  'earth-water',
  'water-earth',
]);

const COPY: Record<SupportedLanguage, Copy> = {
  en: {
    bandLabels: {
      'difficult-serious-alignment': 'Difficult without serious alignment',
      'mixed-workable': 'Mixed, workable with maturity',
      'strong-manageable': 'Strong with manageable friction',
      'structurally-strained': 'Structurally strained',
      'unusually-strong': 'Unusually strong',
    },
    pending: {
      askPrompt:
        'Explain what Matchmaking will compare once one boy Kundli and one girl Kundli are selected. Keep it humane, Vedic, and non-fatalistic.',
      baseline:
        'Predicta will explain the traditional baseline once both charts are selected.',
      conclusion:
        'Pick one boy Kundli and one girl Kundli before asking for a marriage or long-term partnership read.',
      familyRisk:
        'Family blending and pressure signals appear after both charts are selected.',
      premiumUnlock:
        'Premium depth adds score logic, pressure points, support potential, family blending guidance, and timing-sensitive advice.',
      support:
        'Support potential appears after both charts are selected.',
      subtitle:
        'Choose one boy profile and one girl profile for a dedicated Vedic matchmaking read.',
      timing:
        'Timing notes appear after both charts are selected.',
      title: 'Choose a boy Kundli and a girl Kundli.',
    },
    titles: {
      'conflict-recovery': 'Conflict recovery',
      'dharma-alignment': 'Dharma alignment',
      'emotional-compatibility': 'Emotional compatibility',
      'family-adaptation': 'Family adaptation',
      'long-term-stability': 'Long-term stability',
      'traditional-foundation': 'Traditional foundation',
    },
    sectionTitles: {
      familyBlending: 'Family blending risk',
      practicalAdvice: 'Practical advice',
      pressurePoints: 'Marriage pressure points',
      scoreLogic: 'Why the score looks like this',
      supportPotential: 'Support potential',
      timing: 'Timing notes',
    },
    sentences: {
      askPrompt: (boy, girl) =>
        `Evaluate the matchmaking between ${boy} and ${girl} using traditional Vedic compatibility, D1, D9, Venus, Jupiter, Mars balance, dasha timing, family blending, and practical marriage guidance.`,
      baseline:
        'This score blends a traditional compatibility baseline with emotional, dharma, family, conflict, and long-term stability overlays.',
      conclusion: {
        'difficult-serious-alignment':
          'This match is not impossible, but it needs very sober expectation-setting before commitment.',
        'mixed-workable':
          'This match is workable when both people have emotional maturity and do not expect effortless harmony.',
        'strong-manageable':
          'This match has enough support to move forward carefully, provided the known friction points are handled early.',
        'structurally-strained':
          'This match carries structural strain. It should not be rushed or romanticized.',
        'unusually-strong':
          'This match shows rare steadiness across attraction, family adjustment, and long-term growth.',
      },
      emotionalStrong:
        'The emotional and affection rhythm shows enough warmth to keep repair possible after disagreement.',
      emotionalWeak:
        'The emotional rhythm needs more translation, patience, and reassurance than either person may assume at first.',
      familyStrong:
        'Family adjustment looks more manageable because the home, speech, and duty indicators do not all pull in opposite directions.',
      familyWeak:
        'Family adjustment may be a real test here, especially around expectation, household tone, and invisible duty load.',
      premiumUnlock:
        'Premium depth adds score logic, pressure points, support potential, family blending guidance, and timing-sensitive advice.',
      scoreBandExplanation: {
        'difficult-serious-alignment':
          'The marriage promise exists, but strain shows up faster unless both people enter it with discipline and clarity.',
        'mixed-workable':
          'There is enough substance here, but maturity matters more than chemistry.',
        'strong-manageable':
          'The charts show support, but not the kind that excuses poor communication or weak boundaries.',
        'structurally-strained':
          'Too many core rhythms are pulling apart at once. A number alone should not hide that.',
        'unusually-strong':
          'Several foundational layers support each other instead of cancelling each other out.',
      },
      subtitle:
        'Classical Vedic matching with karma, dharma, family pressure, and life-impact interpretation.',
      supportPotential:
        'Support potential is strongest when the couple actively uses the steadier chart layers instead of testing each other through silence.',
      timing:
        'Current dasha timing is not destiny, but it does tell you whether the charts are carrying similar lessons or very different pressure at the same time.',
      traditional:
        'Traditional matching looks at the Moon, the 7th house path, Mars balance, and marriage-supporting chart layers before making any conclusion.',
    },
  },
  hi: {
    bandLabels: {
      'difficult-serious-alignment': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.1b852e6afb"),
      'mixed-workable': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.5f78868a3b"),
      'strong-manageable': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.1c3410e06c"),
      'structurally-strained': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.9e476e7696"),
      'unusually-strong': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.1e94c6e523"),
    },
    pending: {
      askPrompt:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.a80e400231"),
      baseline:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.d307afde65"),
      conclusion:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.fbc7eb89b1"),
      familyRisk:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.f9bec83903"),
      premiumUnlock:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.e2f27b491d"),
      support:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.ea68415b2a"),
      subtitle:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.c1b360e210"),
      timing:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.cfbe95ec08"),
      title: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.c1fbba29d8"),
    },
    titles: {
      'conflict-recovery': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.4d53f61079"),
      'dharma-alignment': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.112d7854c5"),
      'emotional-compatibility': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.77b1c80895"),
      'family-adaptation': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.2cdebef51f"),
      'long-term-stability': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.2b8bceeded"),
      'traditional-foundation': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.2adacaeba7"),
    },
    sectionTitles: {
      familyBlending: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.fc9c5eb0b1"),
      practicalAdvice: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.f8cb56e342"),
      pressurePoints: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.55dc1d453f"),
      scoreLogic: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.d9af55c2c4"),
      supportPotential: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.c15f4a9584"),
      timing: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.8416675807"),
    },
    sentences: {
      askPrompt: (boy, girl) =>
        formatNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.226278a555", [boy, girl]),
      baseline:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.a373a24066"),
      conclusion: {
        'difficult-serious-alignment':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.73f44c56fa"),
        'mixed-workable':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.5f76bcfe4f"),
        'strong-manageable':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.b939715b20"),
        'structurally-strained':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.d1160192b4"),
        'unusually-strong':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.b5743ec529"),
      },
      emotionalStrong:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.dbfce4a4c3"),
      emotionalWeak:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.5acdd168ed"),
      familyStrong:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.43356e3415"),
      familyWeak:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.30dcf58cd8"),
      premiumUnlock:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.e2f27b491d"),
      scoreBandExplanation: {
        'difficult-serious-alignment':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.e8db723190"),
        'mixed-workable':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.faf7b5ced6"),
        'strong-manageable':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.de7ef39316"),
        'structurally-strained':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.d7bff8b149"),
        'unusually-strong':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.830f57f851"),
      },
      subtitle:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.f0d9571126"),
      supportPotential:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.225f6c101b"),
      timing:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.1954742557"),
      traditional:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.e78922087a"),
    },
  },
  gu: {
    bandLabels: {
      'difficult-serious-alignment': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.7d316ee200"),
      'mixed-workable': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.e8a69ac308"),
      'strong-manageable': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.9e3fe7f528"),
      'structurally-strained': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.c19f7d6cb3"),
      'unusually-strong': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.789e6a7654"),
    },
    pending: {
      askPrompt:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.114c57b138"),
      baseline:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.cd51e3c6a7"),
      conclusion:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.43ca8aa945"),
      familyRisk:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.eb40ffc72c"),
      premiumUnlock:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.6593ab3d76"),
      support:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.331d72226b"),
      subtitle:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.17690ad9f9"),
      timing:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.7e07b1660e"),
      title: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.ad923fe95d"),
    },
    titles: {
      'conflict-recovery': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.17a6fc8cff"),
      'dharma-alignment': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.87f41b5eb0"),
      'emotional-compatibility': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.075d432e13"),
      'family-adaptation': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.f9ef445eb8"),
      'long-term-stability': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.1b5cc0fdcc"),
      'traditional-foundation': getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.2699667d9c"),
    },
    sectionTitles: {
      familyBlending: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.3453895efd"),
      practicalAdvice: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.420d120c80"),
      pressurePoints: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.2b146b9ef7"),
      scoreLogic: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.373be93591"),
      supportPotential: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.ae27dbd14e"),
      timing: getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.7e18f2b3b9"),
    },
    sentences: {
      askPrompt: (boy, girl) =>
        formatNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.d1a5a866a8", [boy, girl]),
      baseline:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.a825d05f41"),
      conclusion: {
        'difficult-serious-alignment':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.876e4b9f8b"),
        'mixed-workable':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.10e968b02f"),
        'strong-manageable':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.0dd89670b4"),
        'structurally-strained':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.2955f72f25"),
        'unusually-strong':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.16c8f643e0"),
      },
      emotionalStrong:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.fe7ed28a3e"),
      emotionalWeak:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.3ed2ac0b45"),
      familyStrong:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.4daa6103bd"),
      familyWeak:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.9b84cd7d14"),
      premiumUnlock:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.6593ab3d76"),
      scoreBandExplanation: {
        'difficult-serious-alignment':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.647f691dd9"),
        'mixed-workable':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.3e20fd95f2"),
        'strong-manageable':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.cbdd8aa609"),
        'structurally-strained':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.0c2e9e6f22"),
        'unusually-strong':
          getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.efd3447862"),
      },
      subtitle:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.d6b5d4a9dc"),
      supportPotential:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.6f520c2d00"),
      timing:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.806549bec5"),
      traditional:
        getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.6d9127c4ac"),
    },
  },
};

export function composeMatchmakingAnalysis(
  boy?: KundliData,
  girl?: KundliData,
  options: MatchmakingOptions = {},
): MatchmakingAnalysis {
  const language = options.language ?? 'en';
  const copy = COPY[language] ?? COPY.en;
  const depth = options.depth ?? 'FREE';

  if (!boy || !girl) {
    return {
      askPrompt: copy.pending.askPrompt,
      boyName: boy?.birthDetails.name ?? pendingName(language, 'boy'),
      cautionAreas: [],
      familyBlendingRisk: copy.pending.familyRisk,
      girlName: girl?.birthDetails.name ?? pendingName(language, 'girl'),
      overallConclusion: copy.pending.conclusion,
      overallScore: 0,
      practicalAdvice: [],
      premiumSections: [],
      premiumUnlock: copy.pending.premiumUnlock,
      scoreBand: 'mixed-workable',
      scoreBandExplanation: copy.pending.premiumUnlock,
      scoreBandLabel: copy.bandLabels['mixed-workable'],
      scoreBreakdown: [],
      shareSummary: copy.pending.title,
      status: 'pending',
      strengths: [],
      subtitle: copy.pending.subtitle,
      supportPotential: copy.pending.support,
      timingNote: copy.pending.timing,
      title: copy.pending.title,
      traditionalBaseline: copy.pending.baseline,
    };
  }

  const breakdown = buildScoreBreakdown(boy, girl, language);
  const overallScore = breakdown.reduce((sum, item) => sum + item.score, 0);
  const scoreBand = resolveScoreBand(overallScore);
  const strengths = breakdown
    .slice()
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map(item => `${item.title}: ${item.summary}`);
  const cautionAreas = breakdown
    .slice()
    .sort((left, right) => left.score - right.score)
    .slice(0, 3)
    .map(item => `${item.title}: ${item.summary}`);
  const premiumSections = buildPremiumSections(
    boy,
    girl,
    breakdown,
    scoreBand,
    language,
  );

  return {
    askPrompt: copy.sentences.askPrompt(
      boy.birthDetails.name,
      girl.birthDetails.name,
    ),
    boyName: boy.birthDetails.name,
    cautionAreas,
    familyBlendingRisk:
      categoryById(breakdown, 'family-adaptation').score >= 10
        ? copy.sentences.familyStrong
        : copy.sentences.familyWeak,
    girlName: girl.birthDetails.name,
    overallConclusion: copy.sentences.conclusion[scoreBand],
    overallScore,
    practicalAdvice: buildPracticalAdvice(breakdown, language),
    premiumSections:
      depth === 'PREMIUM'
        ? premiumSections
        : premiumSections.slice(0, 3),
    premiumUnlock: copy.sentences.premiumUnlock,
    scoreBand,
    scoreBandExplanation: copy.sentences.scoreBandExplanation[scoreBand],
    scoreBandLabel: copy.bandLabels[scoreBand],
    scoreBreakdown: breakdown,
    shareSummary: [
      `${boy.birthDetails.name} + ${girl.birthDetails.name}`,
      `${copy.bandLabels[scoreBand]} · ${overallScore}/100`,
      copy.sentences.conclusion[scoreBand],
    ].join('\n'),
    status: 'ready',
    strengths,
    subtitle: copy.sentences.subtitle,
    supportPotential:
      categoryById(breakdown, 'emotional-compatibility').score >= 10
        ? copy.sentences.emotionalStrong
        : copy.sentences.emotionalWeak,
    timingNote: copy.sentences.timing,
    title:
      language === 'hi'
        ? formatNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.2e487d2a6f", [boy.birthDetails.name, girl.birthDetails.name])
        : language === 'gu'
          ? formatNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.3179c08339", [boy.birthDetails.name, girl.birthDetails.name])
          : `${boy.birthDetails.name} and ${girl.birthDetails.name} Matchmaking`,
    traditionalBaseline: copy.sentences.traditional,
  };
}

function buildScoreBreakdown(
  boy: KundliData,
  girl: KundliData,
  language: SupportedLanguage,
): MatchmakingScoreBreakdown[] {
  const copy = COPY[language] ?? COPY.en;
  return [
    scoreTraditionalFoundation(boy, girl, copy),
    scoreEmotionalCompatibility(boy, girl, copy),
    scoreDharmaAlignment(boy, girl, copy),
    scoreFamilyAdaptation(boy, girl, copy),
    scoreConflictRecovery(boy, girl, copy),
    scoreLongTermStability(boy, girl, copy),
  ];
}

function scoreTraditionalFoundation(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const moonScore = elementCompatibilityScore(boy.moonSign, girl.moonSign, 8);
  const seventhScore =
    Math.round(
      ((seventhLordSupport(boy) + seventhLordSupport(girl)) / 2) * 10,
    ) / 10;
  const manglikScore = marsBalanceScore(boy, girl);
  const score = clampScore(Math.round(moonScore + seventhScore + manglikScore), 20);
  return {
    evidence: [
      `${boy.birthDetails.name}: ${boy.moonSign} Moon, ${seventhLordEvidence(boy)}.`,
      `${girl.birthDetails.name}: ${girl.moonSign} Moon, ${seventhLordEvidence(girl)}.`,
      manglikEvidence(boy, girl),
    ],
    id: 'traditional-foundation',
    maxScore: 20,
    score,
    summary:
      score >= 15
        ? copy.sentences.baseline
        : copy.sentences.traditional,
    title: copy.titles['traditional-foundation'],
  };
}

function scoreEmotionalCompatibility(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const moon = elementCompatibilityScore(boy.moonSign, girl.moonSign, 6);
  const venus = planetElementScore(boy, girl, 'Venus', 5);
  const mercury = planetElementScore(boy, girl, 'Mercury', 4);
  const score = clampScore(Math.round(moon + venus + mercury), 15);
  return {
    evidence: [
      `${boy.birthDetails.name}: ${boy.moonSign} Moon and ${planetLine(boy, 'Venus')}.`,
      `${girl.birthDetails.name}: ${girl.moonSign} Moon and ${planetLine(girl, 'Venus')}.`,
      `Mercury rhythm: ${planetLine(boy, 'Mercury')} / ${planetLine(girl, 'Mercury')}.`,
    ],
    id: 'emotional-compatibility',
    maxScore: 15,
    score,
    summary: score >= 10 ? copy.sentences.emotionalStrong : copy.sentences.emotionalWeak,
    title: copy.titles['emotional-compatibility'],
  };
}

function scoreDharmaAlignment(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const d9Asc = elementCompatibilityScore(
    boy.charts.D9?.ascendantSign ?? boy.lagna,
    girl.charts.D9?.ascendantSign ?? girl.lagna,
    6,
  );
  const jupiter = planetElementScore(boy, girl, 'Jupiter', 5);
  const dasha = dashaHarmonyScore(boy, girl, 4);
  const score = clampScore(Math.round(d9Asc + jupiter + dasha), 15);
  return {
    evidence: [
      `${boy.birthDetails.name}: D9 ${boy.charts.D9?.ascendantSign ?? boy.lagna}, ${planetLine(boy, 'Jupiter')}.`,
      `${girl.birthDetails.name}: D9 ${girl.charts.D9?.ascendantSign ?? girl.lagna}, ${planetLine(girl, 'Jupiter')}.`,
      `Current dasha timing: ${boy.dasha.current.mahadasha}/${boy.dasha.current.antardasha} and ${girl.dasha.current.mahadasha}/${girl.dasha.current.antardasha}.`,
    ],
    id: 'dharma-alignment',
    maxScore: 15,
    score,
    summary:
      score >= 10
        ? supportiveSentence(copy, 'dharma')
        : cautionSentence(copy, 'dharma'),
    title: copy.titles['dharma-alignment'],
  };
}

function scoreFamilyAdaptation(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const familySupport =
    houseSupportScore(boy, [2, 4, 11], 7) +
    houseSupportScore(girl, [2, 4, 11], 7);
  const moonBlend = elementCompatibilityScore(boy.moonSign, girl.moonSign, 4);
  const score = clampScore(Math.round(familySupport / 2 + moonBlend), 15);
  return {
    evidence: [
      `${boy.birthDetails.name}: strongest houses ${boy.ashtakavarga.strongestHouses.join(', ')}, weakest houses ${boy.ashtakavarga.weakestHouses.join(', ')}.`,
      `${girl.birthDetails.name}: strongest houses ${girl.ashtakavarga.strongestHouses.join(', ')}, weakest houses ${girl.ashtakavarga.weakestHouses.join(', ')}.`,
      `Family tone leans on houses 2, 4, and 11 for speech, home, and support network stability.`,
    ],
    id: 'family-adaptation',
    maxScore: 15,
    score,
    summary: score >= 10 ? copy.sentences.familyStrong : copy.sentences.familyWeak,
    title: copy.titles['family-adaptation'],
  };
}

function scoreConflictRecovery(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const mars = planetElementScore(boy, girl, 'Mars', 7);
  const mercury = planetElementScore(boy, girl, 'Mercury', 4);
  const dasha = dashaHarmonyScore(boy, girl, 4);
  const score = clampScore(Math.round(mars + mercury + dasha), 15);
  return {
    evidence: [
      `Mars pattern: ${planetLine(boy, 'Mars')} / ${planetLine(girl, 'Mars')}.`,
      `Mercury pattern: ${planetLine(boy, 'Mercury')} / ${planetLine(girl, 'Mercury')}.`,
      `Dasha pressure: ${boy.dasha.current.mahadasha} vs ${girl.dasha.current.mahadasha}.`,
    ],
    id: 'conflict-recovery',
    maxScore: 15,
    score,
    summary:
      score >= 10
        ? supportiveSentence(copy, 'conflict')
        : cautionSentence(copy, 'conflict'),
    title: copy.titles['conflict-recovery'],
  };
}

function scoreLongTermStability(
  boy: KundliData,
  girl: KundliData,
  copy: Copy,
): MatchmakingScoreBreakdown {
  const seventh = seventhLordSupport(boy) + seventhLordSupport(girl);
  const d9 = d9MarriageSupport(boy) + d9MarriageSupport(girl);
  const jupiterVenus =
    planetElementScore(boy, girl, 'Venus', 5) +
    planetElementScore(boy, girl, 'Jupiter', 5);
  const score = clampScore(
    Math.round(seventh + d9 + jupiterVenus / 2),
    20,
  );
  return {
    evidence: [
      `${boy.birthDetails.name}: ${seventhLordEvidence(boy)} and D9 ${d9Evidence(boy)}.`,
      `${girl.birthDetails.name}: ${seventhLordEvidence(girl)} and D9 ${d9Evidence(girl)}.`,
      `Venus/Jupiter support: ${planetLine(boy, 'Venus')} / ${planetLine(girl, 'Jupiter')}.`,
    ],
    id: 'long-term-stability',
    maxScore: 20,
    score,
    summary:
      score >= 14
        ? supportiveSentence(copy, 'stability')
        : cautionSentence(copy, 'stability'),
    title: copy.titles['long-term-stability'],
  };
}

function buildPremiumSections(
  boy: KundliData,
  girl: KundliData,
  breakdown: MatchmakingScoreBreakdown[],
  scoreBand: MatchmakingScoreBand,
  language: SupportedLanguage,
): MatchmakingDetailSection[] {
  const copy = COPY[language] ?? COPY.en;
  return [
    {
      evidence: breakdown.flatMap(item => item.evidence).slice(0, 5),
      guidance:
        scoreBand === 'structurally-strained'
          ? cautionSentence(copy, 'commitment')
          : supportiveSentence(copy, 'commitment'),
      id: 'score-logic',
      summary: breakdown
        .map(item => `${item.title}: ${item.score}/${item.maxScore}`)
        .join(' · '),
      title: copy.sectionTitles.scoreLogic,
    },
    {
      evidence: categoryById(breakdown, 'family-adaptation').evidence,
      guidance: copy.sentences.familyStrong,
      id: 'family-blending',
      summary:
        categoryById(breakdown, 'family-adaptation').score >= 10
          ? copy.sentences.familyStrong
          : copy.sentences.familyWeak,
      title: copy.sectionTitles.familyBlending,
    },
    {
      evidence: categoryById(breakdown, 'conflict-recovery').evidence,
      guidance: cautionSentence(copy, 'conflict'),
      id: 'pressure-points',
      summary:
        `${boy.birthDetails.name} and ${girl.birthDetails.name} should name conflict speed, silence patterns, and family expectation load before taking promises as understood.`,
      title: copy.sectionTitles.pressurePoints,
    },
    {
      evidence: categoryById(breakdown, 'emotional-compatibility').evidence,
      guidance: supportiveSentence(copy, 'repair'),
      id: 'support-potential',
      summary: copy.sentences.supportPotential,
      title: copy.sectionTitles.supportPotential,
    },
    {
      evidence: categoryById(breakdown, 'dharma-alignment').evidence,
      guidance: copy.sentences.timing,
      id: 'timing',
      summary:
        `The present dasha sequence is ${boy.dasha.current.mahadasha}/${boy.dasha.current.antardasha} for ${boy.birthDetails.name} and ${girl.dasha.current.mahadasha}/${girl.dasha.current.antardasha} for ${girl.birthDetails.name}.`,
      title: copy.sectionTitles.timing,
    },
    {
      evidence: breakdown
        .slice()
        .sort((left, right) => right.score - left.score)
        .slice(0, 3)
        .map(item => `${item.title}: ${item.summary}`),
      guidance: buildPracticalAdvice(breakdown, language).join(' '),
      id: 'practical-advice',
      summary: buildPracticalAdvice(breakdown, language).join(' '),
      title: copy.sectionTitles.practicalAdvice,
    },
  ];
}

function buildPracticalAdvice(
  breakdown: MatchmakingScoreBreakdown[],
  language: SupportedLanguage,
): string[] {
  const copy = COPY[language] ?? COPY.en;
  const lowest = breakdown
    .slice()
    .sort((left, right) => left.score - right.score)
    .slice(0, 2)
    .map(item => item.id);
  const notes: string[] = [];

  if (lowest.includes('family-adaptation')) {
    notes.push(
      language === 'hi'
        ? getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.85289bda63")
        : language === 'gu'
          ? getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.f21375e4db")
          : 'Before progressing, speak clearly about family expectations, living style, and invisible duty load.',
    );
  }

  if (lowest.includes('conflict-recovery')) {
    notes.push(
      language === 'hi'
        ? getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.9115c81924")
        : language === 'gu'
          ? getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.5d2541406a")
          : 'Before commitment, test how both people repair after disagreement instead of how they behave on good days.',
    );
  }

  if (!notes.length) {
    notes.push(
      copy.sentences.supportPotential,
      copy.sentences.timing,
    );
  }

  return notes.slice(0, 3);
}

function resolveScoreBand(score: number): MatchmakingScoreBand {
  if (score >= 85) {
    return 'unusually-strong';
  }
  if (score >= 70) {
    return 'strong-manageable';
  }
  if (score >= 55) {
    return 'mixed-workable';
  }
  if (score >= 40) {
    return 'difficult-serious-alignment';
  }
  return 'structurally-strained';
}

function categoryById(
  breakdown: MatchmakingScoreBreakdown[],
  id: MatchmakingCategoryId,
): MatchmakingScoreBreakdown {
  return breakdown.find(item => item.id === id) ?? breakdown[0];
}

function supportiveSentence(copy: Copy, area: 'commitment' | 'conflict' | 'dharma' | 'repair' | 'stability'): string {
  if (area === 'commitment') {
    return copy.sentences.supportPotential;
  }
  if (area === 'conflict') {
    return copy.sentences.emotionalStrong;
  }
  if (area === 'dharma') {
    return copy.sentences.baseline;
  }
  if (area === 'repair') {
    return copy.sentences.emotionalStrong;
  }
  return copy.sentences.supportPotential;
}

function cautionSentence(copy: Copy, area: 'commitment' | 'conflict' | 'dharma' | 'stability'): string {
  if (area === 'commitment') {
    return copy.sentences.familyWeak;
  }
  if (area === 'conflict') {
    return copy.sentences.emotionalWeak;
  }
  if (area === 'dharma') {
    return copy.sentences.timing;
  }
  return copy.sentences.familyWeak;
}

function pendingName(language: SupportedLanguage, role: 'boy' | 'girl'): string {
  if (language === 'hi') {
    return role === 'boy' ? getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.1e93c1c22e") : getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.400185e418");
  }
  if (language === 'gu') {
    return role === 'boy' ? getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.e34b6123fc") : getNativeCopy("native.packages.astrology.src.matchmakingAnalysis.ts.eab6a83879");
  }
  return role === 'boy' ? 'Boy' : 'Girl';
}

function seventhLordSupport(kundli: KundliData): number {
  const seventhHouse = kundli.houses.find(item => item.house === 7);
  const lord = seventhHouse?.lord;
  const placement = lord ? findPlanet(kundli, lord) : undefined;
  if (!placement) {
    return 2;
  }
  if (SUPPORTIVE_HOUSES.has(placement.house)) {
    return 6;
  }
  if (CHALLENGING_HOUSES.has(placement.house)) {
    return 2;
  }
  return 4;
}

function seventhLordEvidence(kundli: KundliData): string {
  const seventhHouse = kundli.houses.find(item => item.house === 7);
  if (!seventhHouse) {
    return '7th house support is pending';
  }
  const placement = findPlanet(kundli, seventhHouse.lord);
  return placement
    ? `7th lord ${placement.name} in house ${placement.house}`
    : `7th lord ${seventhHouse.lord} needs chart review`;
}

function marsBalanceScore(boy: KundliData, girl: KundliData): number {
  const boyMars = findPlanet(boy, 'Mars');
  const girlMars = findPlanet(girl, 'Mars');
  const boyManglik = Boolean(boyMars && MANGLIK_HOUSES.has(boyMars.house));
  const girlManglik = Boolean(girlMars && MANGLIK_HOUSES.has(girlMars.house));
  if (boyManglik === girlManglik) {
    return 6;
  }
  return 3;
}

function manglikEvidence(boy: KundliData, girl: KundliData): string {
  const boyMars = findPlanet(boy, 'Mars');
  const girlMars = findPlanet(girl, 'Mars');
  const boyFlag = boyMars && MANGLIK_HOUSES.has(boyMars.house) ? 'sensitive' : 'balanced';
  const girlFlag = girlMars && MANGLIK_HOUSES.has(girlMars.house) ? 'sensitive' : 'balanced';
  return `Mars balance: ${boy.birthDetails.name} is ${boyFlag}; ${girl.birthDetails.name} is ${girlFlag}.`;
}

function d9MarriageSupport(kundli: KundliData): number {
  const d9 = kundli.charts.D9;
  if (!d9?.planetDistribution?.length) {
    return 3;
  }
  const venus = findPlanetInDistribution(d9.planetDistribution, 'Venus');
  const jupiter = findPlanetInDistribution(d9.planetDistribution, 'Jupiter');
  let score = 2;
  if (venus && SUPPORTIVE_HOUSES.has(venus.house)) {
    score += 2;
  }
  if (jupiter && SUPPORTIVE_HOUSES.has(jupiter.house)) {
    score += 2;
  }
  return score;
}

function d9Evidence(kundli: KundliData): string {
  const d9 = kundli.charts.D9;
  if (!d9) {
    return 'D9 support pending';
  }
  return `${d9.ascendantSign} D9 ascendant with ${d9.planetDistribution.length} tracked placements`;
}

function dashaHarmonyScore(
  first: KundliData,
  second: KundliData,
  maxScore: number,
): number {
  if (first.dasha.current.mahadasha === second.dasha.current.mahadasha) {
    return maxScore;
  }
  if (
    elementOfPlanet(first.dasha.current.mahadasha) ===
    elementOfPlanet(second.dasha.current.mahadasha)
  ) {
    return Math.max(2, maxScore - 1);
  }
  return Math.max(1, maxScore - 3);
}

function houseSupportScore(
  kundli: KundliData,
  houses: number[],
  maxScore: number,
): number {
  const strongHits = kundli.ashtakavarga.strongestHouses.filter(house =>
    houses.includes(house),
  ).length;
  const weakHits = kundli.ashtakavarga.weakestHouses.filter(house =>
    houses.includes(house),
  ).length;
  return clampRange(maxScore / 2 + strongHits * 1.5 - weakHits * 1.2, 1, maxScore);
}

function planetElementScore(
  first: KundliData,
  second: KundliData,
  planetName: string,
  maxScore: number,
): number {
  const firstPlanet = findPlanet(first, planetName);
  const secondPlanet = findPlanet(second, planetName);
  if (!firstPlanet || !secondPlanet) {
    return Math.round(maxScore / 2);
  }
  return elementCompatibilityScore(firstPlanet.sign, secondPlanet.sign, maxScore);
}

function elementCompatibilityScore(
  firstSign: string,
  secondSign: string,
  maxScore: number,
): number {
  const firstElement = signElement(firstSign);
  const secondElement = signElement(secondSign);
  if (!firstElement || !secondElement) {
    return Math.round(maxScore / 2);
  }
  if (firstElement === secondElement) {
    return maxScore - 1;
  }
  if (SUPPORTIVE_ELEMENT_PAIRS.has(`${firstElement}-${secondElement}`)) {
    return maxScore;
  }
  const distance = zodiacDistance(firstSign, secondSign);
  if (distance === 3 || distance === 7 || distance === 9) {
    return Math.max(2, maxScore - 2);
  }
  return Math.max(1, Math.round(maxScore * 0.45));
}

function signElement(sign: string): 'air' | 'earth' | 'fire' | 'water' | undefined {
  if (FIRE_SIGNS.has(sign)) return 'fire';
  if (EARTH_SIGNS.has(sign)) return 'earth';
  if (AIR_SIGNS.has(sign)) return 'air';
  if (WATER_SIGNS.has(sign)) return 'water';
  return undefined;
}

function zodiacDistance(firstSign: string, secondSign: string): number {
  const firstIndex = ZODIAC.indexOf(firstSign as (typeof ZODIAC)[number]);
  const secondIndex = ZODIAC.indexOf(secondSign as (typeof ZODIAC)[number]);
  if (firstIndex < 0 || secondIndex < 0) {
    return 0;
  }
  const raw = Math.abs(firstIndex - secondIndex);
  return Math.min(raw, 12 - raw);
}

function elementOfPlanet(planet: string): 'air' | 'earth' | 'fire' | 'water' | 'mixed' {
  if (planet === 'Sun' || planet === 'Mars' || planet === 'Ketu') return 'fire';
  if (planet === 'Mercury' || planet === 'Saturn' || planet === 'Rahu') return 'air';
  if (planet === 'Venus') return 'earth';
  if (planet === 'Moon' || planet === 'Jupiter') return 'water';
  return 'mixed';
}

function findPlanet(kundli: KundliData, name: string): PlanetPosition | undefined {
  return kundli.planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}

function findPlanetInDistribution(
  planets: PlanetPosition[],
  name: string,
): PlanetPosition | undefined {
  return planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}

function planetLine(kundli: KundliData, name: string): string {
  const placement = findPlanet(kundli, name);
  if (!placement) {
    return `${name} pending`;
  }
  return `${name} in ${placement.sign}, house ${placement.house}`;
}

function clampScore(score: number, maxScore: number): number {
  return Math.max(0, Math.min(maxScore, score));
}

function clampRange(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
