import type {
  KundliData,
  SadeSatiEvidenceItem,
  SadeSatiInsightDepth,
  SadeSatiIntelligence,
  SadeSatiPhase,
  SadeSatiWindow,
  TransitInsight,
} from '@pridicta/types';

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
] as const;

const PHASE_COPY: Record<
  SadeSatiPhase,
  { label: string; summary: string; guidance: string }
> = {
  'final-phase': {
    guidance:
      'Close loops around money, family responsibility, speech, self-worth, and stored emotional weight.',
    label: 'Final phase',
    summary:
      'Saturn is 2nd from Moon, so Sade Sati is in its closing phase. It often tests values, speech, family duties, savings, and emotional maturity.',
  },
  'first-phase': {
    guidance:
      'Simplify expenses, sleep, private worries, foreign/isolated work, and emotional cleanup before pressure peaks.',
    label: 'First phase',
    summary:
      'Saturn is 12th from Moon, so Sade Sati has begun. It often asks for release, rest discipline, expense control, and inner cleanup.',
  },
  'not-active': {
    guidance:
      'Use Saturn as normal transit weather. Keep discipline, but do not label every delay as Sade Sati.',
    label: 'Not active',
    summary:
      'Saturn is not currently 12th, 1st, or 2nd from Moon, so classical Sade Sati is not active.',
  },
  'peak-phase': {
    guidance:
      'Protect emotional regulation, health routines, responsibility boundaries, and decision pace. Do not panic; structure wins here.',
    label: 'Peak phase',
    summary:
      'Saturn is transiting over the Moon sign, so this is the central Sade Sati phase. It can feel heavier emotionally, but it is also a maturity-building window.',
  },
};

const HOUSE_MEANINGS: Record<number, string> = {
  1: 'identity, health, emotional stamina, and self-direction',
  2: 'money, speech, family duties, food habits, and savings',
  3: 'effort, courage, communication, siblings, and skill-building',
  4: 'home, property, mother, emotional peace, and inner safety',
  5: 'children, creativity, learning, romance, and merit',
  6: 'work pressure, debts, disease, service, and discipline',
  7: 'marriage, partnerships, clients, contracts, and public dealing',
  8: 'sudden change, research, fear, vulnerability, and transformation',
  9: 'faith, teachers, father, travel, fortune, and higher guidance',
  10: 'career, duty, status, authority, and public responsibility',
  11: 'income, gains, networks, hopes, and fulfillment',
  12: 'expenses, sleep, isolation, foreign lands, retreat, and release',
};

export function composeSadeSatiIntelligence(
  kundli?: KundliData,
  options: {
    depth?: SadeSatiInsightDepth;
    nowIso?: string;
  } = {},
): SadeSatiIntelligence {
  const depth = options.depth ?? 'FREE';
  const nowIso = options.nowIso ?? new Date().toISOString();

  if (!kundli) {
    return buildPendingSadeSati(depth);
  }

  const saturnTransit = findSaturnTransit(kundli.transits ?? []);
  const houseFromMoon = saturnTransit?.houseFromMoon ?? 0;
  const phase = resolveSadeSatiPhase(houseFromMoon);
  const active = phase !== 'not-active';
  const phaseCopy = PHASE_COPY[phase];
  const saturnBav = resolveSaturnBav(kundli, houseFromMoon);
  const sav = resolveSav(kundli, saturnTransit?.houseFromLagna);
  const windows = buildSadeSatiWindows(kundli, saturnTransit, nowIso);
  const evidence = buildSadeSatiEvidence({
    active,
    kundli,
    saturnBav,
    saturnTransit,
    sav,
  });
  const confidence = saturnTransit ? 'high' : 'medium';
  const freeInsight = buildFreeInsight({
    active,
    houseFromMoon,
    phaseCopy,
    saturnTransit,
  });
  const premiumSynthesis =
    depth === 'PREMIUM'
      ? buildPremiumSynthesis({
          kundli,
          phaseCopy,
          saturnBav,
          saturnTransit,
          sav,
          windows,
        })
      : undefined;

  return {
    active,
    askPrompt:
      'Analyze my Sade Sati and Saturn transit with Moon sign proof, Ashtakavarga support, remedies, timing, and practical guidance.',
    confidence,
    ctas: buildSadeSatiCtas(active),
    depth,
    evidence,
    freeInsight,
    houseFromLagna: saturnTransit?.houseFromLagna ?? 0,
    houseFromMoon,
    limitations: buildLimitations(depth, Boolean(saturnTransit)),
    moonSign: kundli.moonSign,
    ownerName: kundli.birthDetails.name,
    phase,
    phaseLabel: phaseCopy.label,
    premiumSynthesis,
    premiumUnlock:
      'Premium Sade Sati adds phase-by-phase Saturn timing, Ashtakavarga support, remedies, monthly planning cues, and report-ready evidence.',
    remedies: buildSaturnRemedies(kundli, active),
    saturnSign: saturnTransit?.sign ?? 'Pending',
    status: 'ready',
    subtitle:
      depth === 'PREMIUM'
        ? 'Saturn transit read from Moon, Lagna, Ashtakavarga, remedies, and planning windows.'
        : 'A clear Sade Sati status check with useful Saturn guidance for free users.',
    summary: phaseCopy.summary,
    title: `${kundli.birthDetails.name}'s Sade Sati and Saturn report`,
    windows,
  };
}

function buildPendingSadeSati(
  depth: SadeSatiInsightDepth,
): SadeSatiIntelligence {
  return {
    active: false,
    askPrompt:
      'Create my Kundli, then check Sade Sati and Saturn transit from my Moon sign.',
    confidence: 'low',
    ctas: [
      {
        id: 'create-kundli',
        label: 'Create Kundli',
        prompt:
          'Create my Kundli first, then check Sade Sati and Saturn transit.',
      },
    ],
    depth,
    evidence: [],
    freeInsight:
      'Create a Kundli to compare Saturn transit against the Moon sign. Sade Sati is checked from Saturn being 12th, 1st, or 2nd from Moon.',
    houseFromLagna: 0,
    houseFromMoon: 0,
    limitations: ['Sade Sati needs Moon sign and current Saturn transit.'],
    moonSign: 'Pending',
    ownerName: 'You',
    phase: 'not-active',
    phaseLabel: 'Pending',
    premiumUnlock:
      'Premium adds phase detail, Saturn windows, Ashtakavarga support, remedies, and report-ready planning.',
    remedies: [],
    saturnSign: 'Pending',
    status: 'pending',
    subtitle:
      'Send birth details so Predicta can calculate Moon sign and current Saturn transit.',
    summary: 'Waiting for calculated Kundli.',
    title: 'Sade Sati and Saturn report is waiting.',
    windows: [],
  };
}

function buildSadeSatiEvidence({
  active,
  kundli,
  saturnBav,
  saturnTransit,
  sav,
}: {
  active: boolean;
  kundli: KundliData;
  saturnBav?: number;
  saturnTransit?: TransitInsight;
  sav?: number;
}): SadeSatiEvidenceItem[] {
  return [
    {
      id: 'moon-sign-rule',
      interpretation:
        'Sade Sati is judged from Saturn transiting 12th, 1st, or 2nd from the natal Moon sign.',
      observation: `${kundli.moonSign} Moon is the emotional timing anchor.`,
      title: 'Moon sign anchor',
      weight: 'neutral',
    },
    saturnTransit
      ? {
          id: 'saturn-transit',
          interpretation: active
            ? 'This position qualifies as Sade Sati by the classical Moon-sign rule.'
            : 'This position does not qualify as Sade Sati by the classical Moon-sign rule.',
          observation: `Saturn is in ${saturnTransit.sign}, house ${saturnTransit.houseFromMoon} from Moon and house ${saturnTransit.houseFromLagna} from Lagna.`,
          title: 'Current Saturn transit',
          weight: active ? 'challenging' : saturnTransit.weight,
        }
      : {
          id: 'saturn-transit-missing',
          interpretation:
            'Predicta can explain the rule, but current status needs Saturn transit data.',
          observation: 'Saturn transit is not available in this Kundli yet.',
          title: 'Current Saturn transit',
          weight: 'neutral',
        },
    {
      id: 'ashtakavarga-support',
      interpretation:
        'Higher support can make Saturn pressure more workable; lower support asks for stricter pacing.',
      observation: `Saturn BAV support: ${saturnBav ?? 'pending'}; SAV house support: ${sav ?? 'pending'}.`,
      title: 'Ashtakavarga support',
      weight:
        typeof saturnBav === 'number' && saturnBav >= 4
          ? 'supportive'
          : typeof saturnBav === 'number' && saturnBav <= 2
          ? 'challenging'
          : 'mixed',
    },
    {
      id: 'dasha-cross-check',
      interpretation:
        'Saturn feels stronger when Saturn is active by Mahadasha/Antardasha or when dasha topics overlap Saturn houses.',
      observation: `Current dasha is ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}.`,
      title: 'Dasha cross-check',
      weight:
        kundli.dasha.current.mahadasha === 'Saturn' ||
        kundli.dasha.current.antardasha === 'Saturn'
          ? 'challenging'
          : 'neutral',
    },
  ];
}

function buildSadeSatiWindows(
  kundli: KundliData,
  saturnTransit: TransitInsight | undefined,
  nowIso: string,
): SadeSatiWindow[] {
  if (!saturnTransit) {
    return [];
  }

  const now = parseTime(nowIso);
  const signMs = 1000 * 60 * 60 * 24 * 365.25 * 2.5;
  const moonIndex = SIGN_ORDER.findIndex(sign => sign === kundli.moonSign);
  const saturnIndex = SIGN_ORDER.findIndex(sign => sign === saturnTransit.sign);

  if (moonIndex < 0 || saturnIndex < 0) {
    return [];
  }

  const firstIndex = (moonIndex + 11) % 12;
  const peakIndex = moonIndex;
  const finalIndex = (moonIndex + 1) % 12;
  const signsToFirst = (firstIndex - saturnIndex + 12) % 12;
  const firstStart = now + signsToFirst * signMs;
  const activePhaseOffset =
    saturnIndex === firstIndex ? 0 : saturnIndex === peakIndex ? -1 : saturnIndex === finalIndex ? -2 : 0;
  const baseStart =
    saturnIndex === firstIndex || saturnIndex === peakIndex || saturnIndex === finalIndex
      ? now + activePhaseOffset * signMs
      : firstStart;

  return [
    buildWindow({
      confidence: 'medium',
      end: baseStart + signMs,
      guidance: PHASE_COPY['first-phase'].guidance,
      id: 'sade-sati-first',
      now,
      start: baseStart,
      summary: PHASE_COPY['first-phase'].summary,
      title: 'First phase: Saturn 12th from Moon',
    }),
    buildWindow({
      confidence: 'medium',
      end: baseStart + signMs * 2,
      guidance: PHASE_COPY['peak-phase'].guidance,
      id: 'sade-sati-peak',
      now,
      start: baseStart + signMs,
      summary: PHASE_COPY['peak-phase'].summary,
      title: 'Peak phase: Saturn over Moon sign',
    }),
    buildWindow({
      confidence: 'medium',
      end: baseStart + signMs * 3,
      guidance: PHASE_COPY['final-phase'].guidance,
      id: 'sade-sati-final',
      now,
      start: baseStart + signMs * 2,
      summary: PHASE_COPY['final-phase'].summary,
      title: 'Final phase: Saturn 2nd from Moon',
    }),
  ];
}

function buildWindow({
  confidence,
  end,
  guidance,
  id,
  now,
  start,
  summary,
  title,
}: {
  confidence: SadeSatiWindow['confidence'];
  end: number;
  guidance: string;
  id: string;
  now: number;
  start: number;
  summary: string;
  title: string;
}): SadeSatiWindow {
  return {
    confidence,
    endDate: new Date(end).toISOString(),
    guidance,
    id,
    startDate: new Date(start).toISOString(),
    status: start <= now && now <= end ? 'current' : now < start ? 'upcoming' : 'past',
    summary,
    title,
  };
}

function buildFreeInsight({
  active,
  houseFromMoon,
  phaseCopy,
  saturnTransit,
}: {
  active: boolean;
  houseFromMoon: number;
  phaseCopy: (typeof PHASE_COPY)[SadeSatiPhase];
  saturnTransit?: TransitInsight;
}): string {
  if (!saturnTransit) {
    return 'Useful insight: Saturn transit is not available yet, so Sade Sati status cannot be confirmed from this Kundli.';
  }

  if (!active) {
    return `Useful insight: Sade Sati is not active because Saturn is ${houseFromMoon} from Moon. Still, Saturn in ${saturnTransit.sign} should be handled with steady routines and realistic commitments.`;
  }

  return `Useful insight: Sade Sati is active in the ${phaseCopy.label.toLowerCase()}. The main work is ${HOUSE_MEANINGS[houseFromMoon]}; keep structure, sleep, speech, money, and emotional reactions clean.`;
}

function buildPremiumSynthesis({
  kundli,
  phaseCopy,
  saturnBav,
  saturnTransit,
  sav,
  windows,
}: {
  kundli: KundliData;
  phaseCopy: (typeof PHASE_COPY)[SadeSatiPhase];
  saturnBav?: number;
  saturnTransit?: TransitInsight;
  sav?: number;
  windows: SadeSatiWindow[];
}): string {
  const currentWindow = windows.find(item => item.status === 'current');
  const dasha = kundli.dasha.current;

  return [
    `Premium synthesis: ${phaseCopy.summary}`,
    saturnTransit
      ? `Saturn is operating from ${saturnTransit.sign}, house ${saturnTransit.houseFromMoon} from Moon and house ${saturnTransit.houseFromLagna} from Lagna.`
      : 'Saturn transit is missing, so this stays rule-based.',
    `Ashtakavarga check: Saturn BAV ${saturnBav ?? 'pending'}, SAV ${sav ?? 'pending'}.`,
    `Dasha check: ${dasha.mahadasha}/${dasha.antardasha} runs until ${dasha.endDate}; Saturn pressure becomes more personal if dasha topics overlap Saturn houses.`,
    currentWindow
      ? `Planning window: ${currentWindow.title} is marked current with medium timing confidence.`
      : 'Planning window: use the nearest Saturn phase as a broad planning marker, not an exact event date.',
  ].join(' ');
}

function buildSaturnRemedies(kundli: KundliData, active: boolean): string[] {
  const remedies = kundli.remedies
    ?.filter(
      item =>
        item.linkedPlanets.includes('Saturn') &&
        /saturn|shani/i.test(`${item.title} ${item.practice} ${item.rationale}`),
    )
    .slice(0, 2)
    .map(item => `${item.title}: ${item.practice}`);

  if (remedies?.length) {
    return remedies;
  }

  return [
    'Keep Saturday simple: clean one neglected responsibility, avoid harsh speech, and serve without showing off.',
    active
      ? 'Track sleep, spending, and emotional reactions weekly; Sade Sati improves when routines become honest.'
      : 'Use Saturn discipline without fear: slow commitments, clean deadlines, and steady accountability.',
  ];
}

function buildLimitations(
  depth: SadeSatiInsightDepth,
  hasSaturnTransit: boolean,
): string[] {
  const limitations = [
    'Sade Sati is a Saturn transit pressure period, not a doom label.',
    'This layer uses Moon sign, Saturn transit, dasha, and Ashtakavarga support; exact event outcomes are not guaranteed.',
  ];

  if (!hasSaturnTransit) {
    limitations.push('Current Saturn transit is missing, so status cannot be confirmed.');
  }

  if (depth === 'FREE') {
    limitations.push(
      'Free insight stays useful and concise; Premium adds phase windows, remedies, and planning detail.',
    );
  }

  return limitations;
}

function buildSadeSatiCtas(
  active: boolean,
): SadeSatiIntelligence['ctas'] {
  return [
    {
      id: 'ask-sade-sati',
      label: active ? 'Explain my phase' : 'Check Saturn impact',
      prompt:
        'Explain my Sade Sati or Saturn transit phase with Moon sign proof, Ashtakavarga support, and practical guidance.',
    },
    {
      id: 'ask-saturn-remedies',
      label: 'Saturn remedies',
      prompt:
        'Give me simple Saturn remedies for my current chart without fear or expensive rituals.',
    },
    {
      id: 'ask-saturn-timing',
      label: 'Timing windows',
      prompt:
        'Show my Saturn timing windows and explain what I should do in each phase.',
    },
  ];
}

function resolveSadeSatiPhase(houseFromMoon: number): SadeSatiPhase {
  if (houseFromMoon === 12) {
    return 'first-phase';
  }
  if (houseFromMoon === 1) {
    return 'peak-phase';
  }
  if (houseFromMoon === 2) {
    return 'final-phase';
  }
  return 'not-active';
}

function findSaturnTransit(
  transits: TransitInsight[],
): TransitInsight | undefined {
  return transits.find(item => item.planet === 'Saturn');
}

function resolveSaturnBav(
  kundli: KundliData,
  houseFromMoon: number,
): number | undefined {
  const scores = kundli.ashtakavarga.bav.Saturn;
  return scores?.[Math.max(0, houseFromMoon - 1)];
}

function resolveSav(
  kundli: KundliData,
  houseFromLagna?: number,
): number | undefined {
  if (!houseFromLagna) {
    return undefined;
  }
  return kundli.ashtakavarga.sav[houseFromLagna - 1];
}

function parseTime(value: string): number {
  const time = new Date(value).getTime();

  return Number.isNaN(time) ? Date.now() : time;
}
