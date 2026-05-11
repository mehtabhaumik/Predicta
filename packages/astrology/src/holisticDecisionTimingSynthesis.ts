import type {
  DecisionArea,
  DecisionMemo,
  DecisionState,
  HolisticDecisionTimingSignal,
  HolisticDecisionTimingSynthesis,
  KundliData,
  SupportedLanguage,
} from '@pridicta/types';
import { composeDecisionMemo } from './decisionOracle';
import { composeHolisticDailyGuidance } from './holisticDailyGuidance';
import { composeLifeTimeline } from './lifeTimeline';
import { composeMahadashaIntelligence } from './mahadashaIntelligence';
import { composePurusharthaLifeBalance } from './purusharthaLifeBalance';
import { composeSadhanaRemedyPath } from './sadhanaRemedyPath';
import { composeTransitGocharIntelligence } from './transitGocharIntelligence';

const AREA_LABELS: Record<DecisionArea, string> = {
  career: 'Career',
  education: 'Education',
  general: 'General',
  legal: 'Legal',
  relocation: 'Relocation',
  relationship: 'Relationship',
  wealth: 'Wealth',
  wellbeing: 'Wellbeing',
};

export function composeHolisticDecisionTimingSynthesis({
  kundli,
  language = 'en',
  nowIso,
  question,
}: {
  kundli?: KundliData;
  language?: SupportedLanguage;
  nowIso?: string;
  question: string;
}): HolisticDecisionTimingSynthesis {
  const memo = composeDecisionMemo({ kundli, question });

  if (!kundli) {
    return buildPendingSynthesis(memo);
  }

  const dasha = composeMahadashaIntelligence(kundli, {
    depth: 'FREE',
    nowIso,
  });
  const gochar = composeTransitGocharIntelligence(kundli, {
    depth: 'FREE',
    nowIso,
  });
  const purushartha = composePurusharthaLifeBalance(kundli);
  const sadhana = composeSadhanaRemedyPath(kundli);
  const daily = composeHolisticDailyGuidance(kundli, { language, nowIso });
  const timeline = composeLifeTimeline(kundli, nowIso);
  const activeStage =
    sadhana.stages.find(stage => stage.status === 'active' || stage.status === 'review') ??
    sadhana.stages[0];
  const timelineSignal =
    timeline.sections.find(section => section.id === 'now')?.events[0] ??
    timeline.sections.find(section => section.id === 'next')?.events[0];
  const primaryGochar =
    gochar.topOpportunities[0] ?? gochar.cautionSignals[0] ?? gochar.planetInsights[0];
  const decisionGuidance = buildDecisionGuidance(memo);
  const practicalStep = memo.clarifyingQuestions[0] ?? memo.nextAction;
  const riskBoundary =
    memo.safetyNote ??
    `${memo.risk} Use chart timing as planning support, not as a forced outcome.`;
  const sadhanaSupport = activeStage
    ? `${activeStage.label}: ${activeStage.practice}`
    : sadhana.weeklyIntention;
  const purusharthaLens = `${purushartha.dominant.label} leads now. ${purushartha.needsCare.label} needs steadier care.`;
  const dailyAnchor = `Today: ${daily.bestAction} Avoid: ${daily.avoidAction}`;
  const signals: HolisticDecisionTimingSignal[] = [
    {
      body: memo.shortAnswer,
      evidence: memo.evidence.slice(0, 2).map(item => item.observation),
      headline: labelDecisionState(memo.state),
      id: 'decision-state',
      label: 'Decision posture',
      tone: toneFromDecisionState(memo.state),
    },
    {
      body: dasha.current.freeInsight,
      evidence: dasha.current.evidence.slice(0, 2).map(item => item.observation),
      headline: `${dasha.current.mahadasha}/${dasha.current.antardasha}`,
      id: 'dasha',
      label: 'Dasha timing',
      tone: dasha.current.confidence === 'low' ? 'careful' : 'steady',
    },
    {
      body: primaryGochar?.practicalGuidance ?? gochar.snapshotSummary,
      evidence: gochar.evidence.slice(0, 2).map(item => item.observation),
      headline: primaryGochar
        ? `${primaryGochar.planet} Gochar is ${primaryGochar.weight}`
        : 'Current Gochar snapshot',
      id: 'gochar',
      label: 'Gochar weather',
      tone: gochar.dominantWeight === 'challenging' ? 'careful' : 'steady',
    },
    {
      body: purushartha.summary,
      evidence: purushartha.dominant.chartEvidence.slice(0, 2),
      headline: purusharthaLens,
      id: 'purushartha',
      label: 'Life balance',
      tone: purushartha.dominant.tone,
    },
    {
      body: sadhana.karmicTheme,
      evidence: [sadhana.planetReason, sadhana.weeklyIntention],
      headline: sadhanaSupport,
      id: 'sadhana',
      label: 'Karma remedy',
      tone: 'steady',
    },
  ];

  if (timelineSignal) {
    signals.push({
      body: timelineSignal.summary,
      evidence: timelineSignal.evidence.slice(0, 2),
      headline: timelineSignal.dateWindow,
      id: 'timeline',
      label: 'Timeline',
      tone: timelineSignal.confidence === 'low' ? 'careful' : 'steady',
    });
  }

  if (memo.safetyNote || memo.state === 'wait' || memo.state === 'red') {
    signals.push({
      body: riskBoundary,
      evidence: memo.evidence
        .filter(item => item.source === 'safety')
        .map(item => item.observation),
      headline: 'Keep the final call grounded.',
      id: 'safety',
      label: 'Boundary',
      tone: 'careful',
    });
  }

  return {
    area: memo.area,
    askPrompt: [
      `Explain my holistic decision and timing synthesis for: "${memo.question}".`,
      `Use Decision Oracle, dasha, Gochar, Purushartha, sadhana, daily guidance, and timeline proof.`,
      'Give a clear posture, timing window, one practical step, one karma-based support, confidence, and safety boundary.',
    ].join(' '),
    dailyAnchor,
    decisionGuidance,
    evidence: [
      ...memo.evidence.map(item => `${item.title}: ${item.observation}`),
      `Dasha: ${dasha.current.mahadasha}/${dasha.current.antardasha} until ${dasha.current.endDate}.`,
      gochar.snapshotSummary,
      `Purushartha: ${purushartha.dominant.label} leads; ${purushartha.needsCare.label} needs care.`,
      `Sadhana: ${sadhana.weeklyIntention}`,
    ].slice(0, 8),
    guardrails: [
      'Use this as reflective timing and planning support, not a guaranteed outcome.',
      'High-stakes medical, legal, financial, safety, abuse, or emergency choices need qualified human guidance.',
      'Prefer small reversible steps before irreversible commitments.',
      'Remedies should stay respectful, affordable, and practical.',
    ],
    headline: `${AREA_LABELS[memo.area]} timing: ${memo.shortAnswer}`,
    practicalStep,
    purusharthaLens,
    question: memo.question,
    riskBoundary,
    sadhanaSupport,
    signals,
    state: memo.state,
    status: 'ready',
    subtitle:
      'Decision Oracle combined with dasha, Gochar, Purushartha, daily rhythm, and karma-based remedy support.',
    timingWindow: memo.timing,
    title: `${kundli.birthDetails.name}'s decision timing synthesis`,
  };
}

function buildPendingSynthesis(
  memo: DecisionMemo,
): HolisticDecisionTimingSynthesis {
  return {
    area: memo.area,
    askPrompt: memo.aiPrompt,
    dailyAnchor: 'Create or select a Kundli first.',
    decisionGuidance:
      'The question can be framed now, but personal timing needs an active Kundli.',
    evidence: memo.evidence.map(item => `${item.title}: ${item.observation}`),
    guardrails: [
      'A personal timing answer needs birth details and a calculated chart.',
      'Do not use broad astrology as the final authority for high-stakes choices.',
    ],
    headline: memo.shortAnswer,
    practicalStep: memo.nextAction,
    purusharthaLens: 'Life balance needs chart proof.',
    question: memo.question,
    riskBoundary: memo.risk,
    sadhanaSupport: 'Karma remedy support needs an active chart.',
    signals: [
      {
        body: memo.shortAnswer,
        evidence: memo.evidence.map(item => item.observation),
        headline: 'Kundli needed',
        id: 'safety',
        label: 'Boundary',
        tone: 'careful',
      },
    ],
    state: memo.state,
    status: 'pending',
    subtitle: 'Create or select a Kundli to combine decision timing with chart proof.',
    timingWindow: memo.timing,
    title: 'Decision timing synthesis is waiting.',
  };
}

function buildDecisionGuidance(memo: DecisionMemo): string {
  if (memo.state === 'green') {
    return 'The timing supports a careful move, but keep it testable and reversible first.';
  }
  if (memo.state === 'yellow') {
    return 'Explore the choice through one small step, then review the result before expanding.';
  }
  if (memo.state === 'red') {
    return 'Pause, reduce downside, and redesign the choice before acting.';
  }
  if (memo.state === 'wait') {
    return 'Do not rush this. Let facts, timing, and qualified guidance become clearer first.';
  }
  return 'The question needs one missing detail before the timing can be trusted.';
}

function labelDecisionState(state: DecisionState): string {
  if (state === 'green') {
    return 'Careful support';
  }
  if (state === 'yellow') {
    return 'Explore slowly';
  }
  if (state === 'red') {
    return 'Redesign first';
  }
  if (state === 'wait') {
    return 'Wait for clarity';
  }
  return 'Need more detail';
}

function toneFromDecisionState(
  state: DecisionState,
): HolisticDecisionTimingSignal['tone'] {
  if (state === 'green') {
    return 'supportive';
  }
  if (state === 'yellow') {
    return 'steady';
  }
  return 'careful';
}
