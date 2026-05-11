import type {
  HolisticDailyGuidance,
  HolisticDailyGuidanceBlock,
  KundliData,
  SupportedLanguage,
} from '@pridicta/types';
import { composeDailyBriefing } from './dailyBriefing';
import { composeHolisticFoundationModel } from './holisticFoundationModel';
import { composePersonalPanchangLayer } from './personalPanchangLayer';
import { composePurusharthaLifeBalance } from './purusharthaLifeBalance';
import { composeSadhanaRemedyPath } from './sadhanaRemedyPath';
import { composeTransitGocharIntelligence } from './transitGocharIntelligence';

export function composeHolisticDailyGuidance(
  kundli?: KundliData,
  options: {
    language?: SupportedLanguage;
    nowIso?: string;
  } = {},
): HolisticDailyGuidance {
  const language = options.language ?? 'en';
  const date = formatIsoDate(options.nowIso ?? new Date().toISOString());

  if (!kundli) {
    return buildPendingGuidance(date);
  }

  const daily = composeDailyBriefing(kundli, { language, nowIso: options.nowIso });
  const panchang = composePersonalPanchangLayer(kundli, {
    nowIso: options.nowIso,
  });
  const sadhana = composeSadhanaRemedyPath(kundli);
  const purushartha = composePurusharthaLifeBalance(kundli);
  const gochar = composeTransitGocharIntelligence(kundli, {
    depth: 'FREE',
    nowIso: options.nowIso,
  });
  const holistic = composeHolisticFoundationModel(kundli);
  const activeStage =
    sadhana.stages.find(stage => stage.status === 'active' || stage.status === 'review') ??
    sadhana.stages[0];
  const topPlanetFocus = holistic.activePlanetFocus[0];
  const primaryGochar =
    gochar.topOpportunities[0] ?? gochar.cautionSignals[0] ?? gochar.planetInsights[0];
  const timingNote = [
    `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} is the larger timing background.`,
    primaryGochar
      ? `${primaryGochar.planet} Gochar is ${primaryGochar.weight} for ${primaryGochar.area}.`
      : gochar.snapshotSummary,
  ].join(' ');
  const headline = `Today: ${panchang.weekdayLord} day with ${purushartha.dominant.label} emphasis.`;
  const sadhanaStep =
    activeStage?.practice ??
    topPlanetFocus?.practicalAction ??
    'Choose one clean action and keep the practice small.';
  const remedy = topPlanetFocus?.simpleRemedy ?? panchang.personalRemedy;
  const blocks: HolisticDailyGuidanceBlock[] = [
    {
      body: panchang.todayFocus,
      headline: `${panchang.weekdayLord} sets the daily tone.`,
      id: 'today-focus',
      label: 'Today focus',
      proofChips: [panchang.weekdayLord, panchang.tithi, panchang.moonNakshatra],
      tone: toneFromPanchang(panchang.signals.some(signal => signal.tone === 'careful')),
    },
    {
      body: daily.bestAction,
      headline: 'Do one useful thing first.',
      id: 'best-action',
      label: 'Best action',
      proofChips: [kundli.dasha.current.mahadasha, kundli.dasha.current.antardasha],
      tone: 'supportive',
    },
    {
      body: daily.avoidAction,
      headline: 'Keep one pressure area simple.',
      id: 'avoid',
      label: 'Avoid',
      proofChips: [`House ${kundli.ashtakavarga.weakestHouses[0] ?? '-'}`],
      tone: 'careful',
    },
    {
      body: sadhanaStep,
      headline: activeStage ? `${activeStage.label} is the active practice.` : 'Practice stays practical.',
      id: 'sadhana',
      label: 'Sadhana',
      proofChips: [sadhana.planet ?? kundli.dasha.current.mahadasha, 'Karma remedy'],
      tone: 'steady',
    },
    {
      body: purushartha.summary,
      headline: `${purushartha.dominant.label} leads, ${purushartha.needsCare.label} needs care.`,
      id: 'balance',
      label: 'Life balance',
      proofChips: [
        `${purushartha.dominant.label} ${purushartha.dominant.score}%`,
        `${purushartha.needsCare.label} ${purushartha.needsCare.score}%`,
      ],
      tone: purushartha.dominant.tone,
    },
    {
      body: timingNote,
      headline: 'Use timing as planning, not fear.',
      id: 'timing',
      label: 'Timing',
      proofChips: [
        `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
        gochar.dominantWeight,
      ],
      tone: gochar.dominantWeight === 'challenging' ? 'careful' : 'steady',
    },
  ];

  return {
    askPrompt:
      'Give me holistic daily guidance for today. Include morning practice, midday check, evening review, Panchang, dasha, Gochar, Purushartha, karma remedy, proof, and safe boundaries.',
    avoidAction: daily.avoidAction,
    bestAction: daily.bestAction,
    blocks,
    dailyFocus: panchang.todayFocus,
    date,
    eveningReview:
      sadhana.reviewQuestions[0] ??
      'Before sleep, ask whether the day made your choices calmer, cleaner, and more responsible.',
    evidence: [
      `${panchang.weekday} is ruled by ${panchang.weekdayLord}.`,
      `Personal Panchang: ${panchang.tithi}, Moon rhythm ${panchang.moonNakshatra}.`,
      `Current dasha: ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
      `Purushartha: ${purushartha.dominant.label} leads; ${purushartha.needsCare.label} needs care.`,
      primaryGochar
        ? `Gochar: ${primaryGochar.planet} is ${primaryGochar.weight} from Lagna house ${primaryGochar.houseFromLagna}.`
        : gochar.snapshotSummary,
    ],
    guardrails: [
      'Use this as daily reflection and planning, not a guaranteed outcome.',
      'High-stakes medical, legal, financial, travel, or safety decisions still need qualified human guidance.',
      'Remedies should stay respectful, affordable, and practical.',
    ],
    headline,
    middayCheck:
      panchang.bestFor[0] ??
      "Check whether today's main action is still simple, useful, and realistic.",
    morningPractice: panchang.personalRemedy,
    purusharthaFocus: `${purushartha.dominant.label}: ${purushartha.dominant.practicalGuidance}`,
    remedy,
    sadhanaStep,
    status: 'ready',
    subtitle:
      'A practical daily rhythm from Panchang, dasha, Gochar, Purushartha, and karma-based remedies.',
    timingNote,
    title: `${kundli.birthDetails.name}'s holistic daily guidance`,
  };
}

function buildPendingGuidance(date: string): HolisticDailyGuidance {
  return {
    askPrompt:
      'Create my Kundli, then give me holistic daily guidance with Panchang, dasha, Gochar, Purushartha, and remedy.',
    avoidAction: 'Avoid making this personal until the Kundli is calculated.',
    bestAction: 'Create your Kundli first.',
    blocks: [
      {
        body: 'Once the Kundli is ready, Predicta will combine today, timing, life balance, and remedy into one simple daily guide.',
        headline: 'Daily guidance is waiting for chart proof.',
        id: 'today-focus',
        label: 'Waiting',
        proofChips: ['Kundli needed'],
        tone: 'steady',
      },
    ],
    dailyFocus: 'Create your Kundli first.',
    date,
    eveningReview: 'Review birth details before expecting a personal reading.',
    evidence: ['No active Kundli is available yet.'],
    guardrails: [
      'A personal daily guide needs birth date, birth time, and birth place.',
      'Until then, only broad day-lord guidance can be shown.',
    ],
    headline: 'Create your Kundli to unlock personal daily guidance.',
    middayCheck: 'Keep questions simple until the chart is ready.',
    morningPractice: 'Share birth details or open Kundli creation.',
    purusharthaFocus: 'Waiting for chart proof.',
    remedy: 'No personal remedy selected yet.',
    sadhanaStep: 'Create your Kundli first.',
    status: 'pending',
    subtitle: 'Panchang, dasha, Gochar, life balance, and remedies need a Kundli.',
    timingNote: 'Timing is pending until dasha and Gochar can be anchored to the chart.',
    title: 'Holistic daily guidance is waiting.',
  };
}

function formatIsoDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value.slice(0, 10) : date.toISOString().slice(0, 10);
}

function toneFromPanchang(hasCarefulSignal: boolean): HolisticDailyGuidanceBlock['tone'] {
  return hasCarefulSignal ? 'careful' : 'steady';
}
