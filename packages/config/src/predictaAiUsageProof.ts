export const PREDICTA_AI_USAGE_PROOF_VERSION =
  'predicta-intelligence-ai-usage-proof-v1';

export const PREDICTA_LOCAL_MEMORY_ACTIONS = ['kundli-karma'] as const;

export const PREDICTA_DETERMINISTIC_ACTIONS = [
  'account-settings',
  'advanced-jyotish',
  'birth-time',
  'bhav-chalit',
  'chart',
  'concierge',
  'create-kundli',
  'daily-briefing',
  'decision-timing',
  'destiny-passport',
  'family-map',
  'holistic-daily-guidance',
  'holistic-reading-rooms',
  'jaimini-handoff',
  'jaimini-predicta',
  'kp-handoff',
  'kp-predicta',
  'life-timeline',
  'mahadasha',
  'multi-school-consultation',
  'nadi-handoff',
  'nadi-predicta',
  'numerology-handoff',
  'numerology-predicta',
  'pass-redemption',
  'personal-panchang',
  'pricing',
  'purushartha',
  'relationship',
  'remedies',
  'report',
  'sadhana-remedy-path',
  'sade-sati',
  'saved-kundlis',
  'signature-handoff',
  'signature-predicta',
  'support-help',
  'transit-gochar',
  'vedic-handoff',
  'wow-radar',
  'wrapped',
  'yearly-horoscope',
] as const;

export const PREDICTA_AI_ALLOWED_INTENT_CATEGORIES = [
  'open_ended_personal_synthesis',
  'premium_report_writing',
  'nuanced_follow_up',
  'paid_precision_reading',
] as const;

export const PREDICTA_ZERO_CREDIT_CAPABILITIES = [
  'birth_detail_parsing',
  'kundli_creation',
  'saved_kundli_actions',
  'chart_snapshot',
  'mahadasha_summary',
  'gochar_summary',
  'panchang',
  'kundli_karma_definition',
  'dosh_shrap_yog_lal_kitab_snapshot',
  'jaimini_room_handoff',
  'kp_room_handoff',
  'numerology_room_handoff',
  'signature_room_handoff',
  'report_navigation',
  'family_vault_navigation',
  'pass_redemption_help',
] as const;

export const PREDICTA_EXHAUSTED_CREDIT_BEHAVIOR = {
  preserveQuestion: true,
  provider: 'deterministic',
  replyIncludesDeterministicMenu: true,
  upgradeOptions: ['10 questions', '25 questions', '100 questions', 'Premium'],
} as const;

export type PredictaAiUsageProviderDecision =
  | 'local_memory_answer'
  | 'deterministic_action'
  | 'missing_data_question'
  | 'ai_required'
  | 'blocked_needs_credit';

export function isPredictaLocalMemoryAction(action: string): boolean {
  return (PREDICTA_LOCAL_MEMORY_ACTIONS as readonly string[]).includes(action);
}

export function isPredictaDeterministicAction(action: string): boolean {
  return (PREDICTA_DETERMINISTIC_ACTIONS as readonly string[]).includes(action);
}

export function predictaProviderDecisionForAction(
  action: string,
): PredictaAiUsageProviderDecision {
  if (isPredictaLocalMemoryAction(action)) {
    return 'local_memory_answer';
  }

  if (isPredictaDeterministicAction(action)) {
    return 'deterministic_action';
  }

  return 'ai_required';
}
