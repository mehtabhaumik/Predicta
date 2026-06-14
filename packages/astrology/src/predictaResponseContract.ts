export type PredictaResponseMode =
  | 'app_action'
  | 'chart_report_explanation'
  | 'event_prediction'
  | 'missing_data'
  | 'quick_answer'
  | 'remedy_guidance'
  | 'safety_sensitive';

export type PredictaResponseContractSection =
  | 'direct_answer'
  | 'timing_or_trigger'
  | 'meaning_for_user'
  | 'action_or_remedy'
  | 'confidence_and_caution'
  | 'evidence_after_value';

export type PredictaResponseContractIssue = {
  code:
    | 'definition_first'
    | 'evidence_first'
    | 'internal_system_copy'
    | 'missing_direct_answer'
    | 'premium_before_value'
    | 'toolkit_or_lesson';
  message: string;
  severity: 'critical' | 'major';
};

export type PredictaResponseContractCheck = {
  isGreen: boolean;
  issues: PredictaResponseContractIssue[];
};

export const PREDICTA_MASTER_RESPONSE_SEQUENCE: PredictaResponseContractSection[] =
  [
    'direct_answer',
    'timing_or_trigger',
    'meaning_for_user',
    'action_or_remedy',
    'confidence_and_caution',
    'evidence_after_value',
  ];

export const PREDICTA_RESPONSE_MODES: Record<PredictaResponseMode, string> = {
  app_action:
    'Complete or stage the app action first, then explain the next useful step.',
  chart_report_explanation:
    'Explain what the chart or report section means for the user before giving proof.',
  event_prediction:
    'Give verdict, timing, trigger, delay/support factors, and next action before technical proof.',
  missing_data:
    'Ask only for the minimum missing data needed to answer responsibly.',
  quick_answer:
    'Give the direct answer in one calm paragraph, then offer one useful follow-up.',
  remedy_guidance:
    'State the pressure pattern, the practical correction, safety boundary, and optional ritual depth last.',
  safety_sensitive:
    'Stay calm, bounded, non-fatalistic, and practical; no guarantees or professional replacement.',
};

export const PREDICTA_DIRECT_ANSWER_OPENERS = [
  'Direct answer',
  'Likely',
  'Delayed',
  'Blocked',
  'Mixed',
  'Possible',
  'Needs clarity',
  'Yes',
  'No',
  'Not yet',
  'The strongest signal',
  'Your current phase',
  'This points to',
  'I can start',
] as const;

export const PREDICTA_NO_SCHOOLING_OPENING_PATTERNS: Array<{
  code: PredictaResponseContractIssue['code'];
  pattern: RegExp;
}> = [
  { code: 'definition_first', pattern: /\bthis house represents\b/i },
  { code: 'definition_first', pattern: /\bthis chart governs\b/i },
  { code: 'definition_first', pattern: /\bthis section helps you understand\b/i },
  { code: 'toolkit_or_lesson', pattern: /\bhow to read\b/i },
  { code: 'toolkit_or_lesson', pattern: /\btoolkit\b/i },
  { code: 'toolkit_or_lesson', pattern: /\bkp uses\b/i },
  { code: 'toolkit_or_lesson', pattern: /\bjaimini uses\b/i },
  {
    code: 'toolkit_or_lesson',
    pattern: /\bnumerology shows how the name projects\b/i,
  },
  {
    code: 'toolkit_or_lesson',
    pattern: /\bsignature analysis is reflective guidance\b/i,
  },
  { code: 'internal_system_copy', pattern: /\bprovider decision\b/i },
  { code: 'internal_system_copy', pattern: /\blocal_memory_answer\b/i },
  { code: 'internal_system_copy', pattern: /\breport memory enforcement\b/i },
  { code: 'internal_system_copy', pattern: /\broom contract enforcement\b/i },
  { code: 'evidence_first', pattern: /^chart evidence\b/i },
  { code: 'evidence_first', pattern: /^proof\b/i },
  { code: 'premium_before_value', pattern: /^premium adds\b/i },
];

export function buildPredictaResponseContractInstruction(): string {
  return [
    'Predicta master response contract:',
    '1. Give the direct answer first.',
    '2. Add timing or real-world trigger when evidence supports it.',
    '3. Say what it means for this user in practical life language.',
    '4. Give one action, remedy, or next step.',
    '5. Add confidence, uncertainty, and safety boundaries.',
    '6. Put chart, report, KP, Jaimini, Numerology, Signature, or Kundli Karma evidence after the user has received value.',
    'Never open with definitions, method lessons, report architecture, toolkit copy, provider-decision labels, or premium upsell.',
  ].join(' ');
}

export function validatePredictaMasterResponse(
  text: string,
): PredictaResponseContractCheck {
  const normalized = text.trim();
  const opening = normalized.slice(0, 360);
  const issues: PredictaResponseContractIssue[] = [];

  if (!normalized) {
    issues.push({
      code: 'missing_direct_answer',
      message: 'Response is empty.',
      severity: 'critical',
    });
    return { isGreen: false, issues };
  }

  for (const item of PREDICTA_NO_SCHOOLING_OPENING_PATTERNS) {
    if (item.pattern.test(opening)) {
      issues.push({
        code: item.code,
        message: `Forbidden opening pattern matched: ${item.pattern}`,
        severity: item.code === 'internal_system_copy' ? 'critical' : 'major',
      });
    }
  }

  if (!hasDirectAnswerSignal(opening)) {
    issues.push({
      code: 'missing_direct_answer',
      message:
        'Opening does not carry a direct-answer signal before explanation or evidence.',
      severity: 'major',
    });
  }

  return { isGreen: issues.length === 0, issues };
}

export function hasDirectAnswerSignal(text: string): boolean {
  const normalized = text.trim();

  if (!normalized) {
    return false;
  }

  return PREDICTA_DIRECT_ANSWER_OPENERS.some(opener =>
    normalized.toLowerCase().startsWith(opener.toLowerCase()),
  );
}

