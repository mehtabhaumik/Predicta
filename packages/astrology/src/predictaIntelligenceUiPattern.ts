export type PredictaIntelligenceSchool =
  | 'JAIMINI'
  | 'KP'
  | 'LIFE_ATLAS'
  | 'NADI'
  | 'NUMEROLOGY'
  | 'SIGNATURE'
  | 'VEDIC';

export type PredictaIntelligencePatternStep =
  | 'prediction'
  | 'evidence'
  | 'action'
  | 'safety';

export type PredictaSchoolIntelligencePattern = {
  action: string;
  evidence: string;
  forbidden: string;
  label: string;
  prediction: string;
  safety: string;
  school: PredictaIntelligenceSchool;
  startsWith: string;
};

export const PREDICTA_INTELLIGENCE_UI_RHYTHM: Array<{
  id: PredictaIntelligencePatternStep;
  label: string;
}> = [
  { id: 'prediction', label: 'Prediction first' },
  { id: 'evidence', label: 'Evidence second' },
  { id: 'action', label: 'Action and guidance third' },
  { id: 'safety', label: 'Safety and limits last' },
];

export const PREDICTA_SCHOOL_INTELLIGENCE_PATTERN: Record<
  PredictaIntelligenceSchool,
  PredictaSchoolIntelligencePattern
> = {
  KP: {
    action: 'Tell the user what to do next around the event, timing, and risk.',
    evidence: 'Preserve cusps, star lord, sub lord, significators, ruling planets, and dasha support after the answer.',
    forbidden: 'Do not turn KP into a D1/D9 Parashari chart lesson or a questionnaire-only toolkit.',
    label: 'KP Predicta',
    prediction: 'Give the event verdict, likely direction, timing mood, and direct answer before proof.',
    safety: 'Use confidence, timing readiness, and limits without fear or exact-date overclaiming.',
    school: 'KP',
    startsWith: 'user question or refined event, verdict, timing, and proof',
  },
  JAIMINI: {
    action: 'Give one calm next focus around soul maturity, visibility, career dharma, or relationship mirror.',
    evidence: 'Preserve Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Arudha, Upapada, Jaimini aspects, and Chara Dasha after the guidance.',
    forbidden: 'Do not turn Jaimini into Nadi story language, KP cusp judgement, or a dense technical classroom.',
    label: 'Jaimini Predicta',
    prediction: 'Start with soul role, visible identity, destiny pattern, and the active life chapter.',
    safety: 'Keep agency and calculation readiness clear; do not overstate destiny as fixed fate.',
    school: 'JAIMINI',
    startsWith: 'soul role, visible identity, destiny pattern, and active life chapter',
  },
  LIFE_ATLAS: {
    action: 'Give the current chapter focus, next practice, and grounded integration path.',
    evidence: 'Use available Vedic, KP, Jaimini, Numerology, and optional confirmed Signature layers as quiet synthesis support.',
    forbidden: 'Do not expose school-by-school proof as the main reading or pretend to access Akashic records.',
    label: 'Life Atlas',
    prediction: 'Start with the life journey, destiny pattern, current chapter, and soul-purpose synthesis.',
    safety: 'Keep agency, hope, and grounded language visible; avoid guaranteed fate.',
    school: 'LIFE_ATLAS',
    startsWith: 'life journey, destiny pattern, current chapter, and soul-purpose synthesis',
  },
  NADI: {
    action: 'Give the practice, validation question, and next life-pattern move.',
    evidence: 'Preserve planetary story links, Rahu/Ketu axis, validation status, and activation windows after the story.',
    forbidden: 'Do not claim palm-leaf access or mix KP cusp judgement into Nadi.',
    label: 'Nadi Predicta',
    prediction: 'Start with the strongest karmic story, hidden pattern, activation, and lesson.',
    safety: 'Validate before strong event statements and keep the source boundary clear.',
    school: 'NADI',
    startsWith: 'karmic story, validation, activation, and practice',
  },
  NUMEROLOGY: {
    action: 'Give the best use of the current cycle, name-rhythm guidance, and practical choices.',
    evidence: 'Preserve name number, birth number, destiny number, personal cycle, and missing/repeated number map after the guidance.',
    forbidden: 'Do not mix Kundli proof into Numerology or make fear-based name-change claims.',
    label: 'Numerology Predicta',
    prediction: 'Start with number identity, current cycle, name rhythm, and life-theme sentence.',
    safety: 'Frame numbers as supportive patterns, not fixed destiny or guaranteed success.',
    school: 'NUMEROLOGY',
    startsWith: 'number identity, cycle, rhythm, and practical guidance',
  },
  SIGNATURE: {
    action: 'Give confidence, presentation, rhythm, and refinement guidance from confirmed visible traits.',
    evidence: 'Preserve baseline, slant, pressure, spacing, legibility, rhythm, and confidence only when visible and confirmed.',
    forbidden: 'Do not read an empty signature, store raw signature images, or use forensic/personality certainty.',
    label: 'Signature Predicta',
    prediction: 'Start with confirmed visible traits and reflective self-expression guidance.',
    safety: 'Keep privacy, not-stored messaging, and reflective-only boundaries visible.',
    school: 'SIGNATURE',
    startsWith: 'confirmed visible traits, reflective guidance, and safety boundaries',
  },
  VEDIC: {
    action: 'Give the practical next step, timing focus, and remedy/action guidance after the prediction.',
    evidence: 'Preserve charts, graha, houses, degrees, dasha, Chalit, varga, Panchang, and classical tables after the life meaning.',
    forbidden: 'Do not lead with generic chart definitions or school the user before giving a life prediction.',
    label: 'Vedic Predicta',
    prediction: 'Start with charts and direct life prediction from graha and house evidence.',
    safety: 'Keep chart confidence, calculation limits, and non-fatalistic language last.',
    school: 'VEDIC',
    startsWith: 'charts, graha/house evidence, then direct life prediction',
  },
};

export function getPredictaSchoolIntelligencePattern(
  school: PredictaIntelligenceSchool,
): PredictaSchoolIntelligencePattern {
  return PREDICTA_SCHOOL_INTELLIGENCE_PATTERN[school];
}
