import type {
  BirthTimeAnswer,
  BirthTimeConfidenceLabel,
  BirthTimeDetectiveReport,
  BirthTimeQuestion,
  KundliData,
} from '@pridicta/types';

export type BirthTimeAnswerMap = Record<string, BirthTimeAnswer>;

export function composeBirthTimeDetective(
  kundli?: KundliData,
  answers: BirthTimeAnswerMap = {},
): BirthTimeDetectiveReport {
  if (!kundli) {
    return {
      answeredCount: 0,
      askPrompt:
        'Explain how birth time confidence will be checked after my kundli is generated.',
      cautiousJudgments: [],
      confidenceLabel: 'unreliable',
      confidenceScore: 0,
      evidence: ['No kundli is active yet.'],
      nextAction: 'Create a real kundli before checking birth time confidence.',
      questions: [],
      reasons: ['No birth chart calculation is available.'],
      safeJudgments: [],
      status: 'pending',
      subtitle: 'Generate a kundli to unlock birth-time confidence checks.',
      summary: 'Birth time confidence cannot be judged without chart calculation.',
      title: 'Birth Time Detective is waiting.',
      unsafeJudgments: ['D1, divisional charts, dasha timing, and D60 are unavailable.'],
    };
  }

  const rectification = kundli.rectification;
  const confidenceLabel = resolveConfidenceLabel(kundli);
  const questions = buildQuestions(kundli, answers);
  const answeredCount = questions.filter(question => question.answer).length;
  const confidenceScore = scoreConfidence(confidenceLabel, answeredCount, questions.length);

  return {
    answeredCount,
    askPrompt: [
      'Explain my Birth Time Detective report.',
      `Confidence: ${confidenceLabel}.`,
      'Explain which chart judgments are safe, cautious, or unsafe, and what answers are still needed.',
    ].join(' '),
    cautiousJudgments: buildCautiousJudgments(confidenceLabel),
    confidenceLabel,
    confidenceScore,
    evidence: [
      `Birth time approximate: ${kundli.birthDetails.isTimeApproximate ? 'yes' : 'no'}.`,
      rectification
        ? `Ascendant degree inside sign: ${rectification.ascendantDegree}.`
        : 'No rectification diagnostics available.',
      rectification
        ? `Rectification confidence: ${rectification.confidence}.`
        : 'Confidence is unavailable.',
      `Answered detective questions: ${answeredCount}/${questions.length}.`,
    ],
    nextAction: buildNextAction(confidenceLabel, answeredCount, questions.length),
    questions,
    reasons: rectification?.reasons ?? ['No rectification diagnostics available.'],
    safeJudgments: buildSafeJudgments(confidenceLabel),
    status: 'ready',
    subtitle:
      'A confidence check for how much precision Predicta should use with your chart.',
    summary: buildSummary(confidenceLabel, answeredCount, questions.length),
    title: `${kundli.birthDetails.name}'s Birth Time Detective`,
    unsafeJudgments: buildUnsafeJudgments(confidenceLabel),
  };
}

function buildQuestions(
  kundli: KundliData,
  answers: BirthTimeAnswerMap,
): BirthTimeQuestion[] {
  const baseQuestions =
    kundli.rectification?.questions?.length
      ? kundli.rectification.questions
      : [
          'Was the recorded birth time taken from a document, hospital memory, or family recollection?',
        ];

  return baseQuestions.map((question, index) => {
    const id = `birth-time-${index + 1}`;

    return {
      answer: answers[id],
      helper: helperForQuestion(question),
      id,
      question,
    };
  });
}

function resolveConfidenceLabel(kundli: KundliData): BirthTimeConfidenceLabel {
  const rectification = kundli.rectification;

  if (!rectification) {
    return 'unreliable';
  }

  if (kundli.birthDetails.isTimeApproximate && rectification.confidence === 'low') {
    return 'unreliable';
  }

  if (rectification.needsRectification || rectification.confidence !== 'high') {
    return 'needs-checking';
  }

  return 'stable';
}

function scoreConfidence(
  label: BirthTimeConfidenceLabel,
  answeredCount: number,
  totalQuestions: number,
): number {
  const base = label === 'stable' ? 82 : label === 'needs-checking' ? 52 : 24;
  const answerBoost = totalQuestions ? Math.round((answeredCount / totalQuestions) * 12) : 0;

  return Math.min(95, base + answerBoost);
}

function buildSummary(
  label: BirthTimeConfidenceLabel,
  answeredCount: number,
  totalQuestions: number,
): string {
  if (label === 'stable') {
    return 'Birth time looks stable for normal D1 and core divisional reading, while fine timing still needs humility.';
  }

  if (label === 'needs-checking') {
    return `Birth time needs checking before fine timing. ${answeredCount}/${totalQuestions} Detective questions are answered.`;
  }

  return `Birth time is unreliable for fine prediction right now. ${answeredCount}/${totalQuestions} Detective questions are answered.`;
}

function buildSafeJudgments(label: BirthTimeConfidenceLabel): string[] {
  if (label === 'unreliable') {
    return ['Broad personality themes from signs and visible planet patterns.'];
  }

  return [
    'D1 sign-based identity and broad house themes.',
    'Current dasha themes at a chapter level.',
    'Transit weather as supportive context, not exact event timing.',
  ];
}

function buildCautiousJudgments(label: BirthTimeConfidenceLabel): string[] {
  if (label === 'stable') {
    return ['Fine divisional timing should still be checked against real life events.'];
  }

  return [
    'D9 and D10 interpretation where minutes can shift divisional placement.',
    'House cusps, exact event timing, and relationship/career micro-predictions.',
    'Any claim that depends on a narrow birth-time window.',
  ];
}

function buildUnsafeJudgments(label: BirthTimeConfidenceLabel): string[] {
  if (label === 'stable') {
    return ['D60 should remain unavailable or untrusted unless the engine supports validated precision.'];
  }

  return [
    'D60 judgments.',
    'Exact marriage, career, health, or relocation dates.',
    'Claims that a few minutes of birth time cannot change the reading.',
  ];
}

function buildNextAction(
  label: BirthTimeConfidenceLabel,
  answeredCount: number,
  totalQuestions: number,
): string {
  if (label === 'stable') {
    return 'Keep the recorded source noted. Use Detective again if major life events do not match timing.';
  }

  if (answeredCount < totalQuestions) {
    return 'Answer the remaining Detective questions before relying on fine timing.';
  }

  return 'Review the answers with chart timing before upgrading confidence.';
}

function helperForQuestion(question: string): string {
  const lower = question.toLowerCase();

  if (lower.includes('document') || lower.includes('family')) {
    return 'Write the source and whether the time was exact, rounded, or remembered later.';
  }

  if (lower.includes('career')) {
    return 'Mention dated job changes, promotions, business starts, or major responsibility shifts.';
  }

  if (lower.includes('partnership')) {
    return 'Mention dated commitments, breakups, marriage talks, or relationship turning points.';
  }

  return 'Answer with simple dated life events. Approximate month/year is still useful.';
}
