export type EventQuestionCategoryId =
  | 'business_growth'
  | 'career_move'
  | 'court_litigation'
  | 'education_study_stream'
  | 'family_child_matching'
  | 'foreign_travel'
  | 'guide_me'
  | 'job_change'
  | 'marriage_timing'
  | 'money_property'
  | 'promotion'
  | 'relationship_outcome'
  | 'relocation'
  | 'visa_pr'
  | 'wellness_caution';

export type EventQuestionClarity =
  | 'clear'
  | 'guide-me'
  | 'needs-one-clarifier';

export type EventQuestionEvidenceRoom =
  | 'jaimini'
  | 'kp'
  | 'kundliKarma'
  | 'numerology'
  | 'signature'
  | 'vedic';

export type EventQuestionCategory = {
  id: EventQuestionCategoryId;
  defaultQuestion: string;
  evidenceRooms: EventQuestionEvidenceRoom[];
  keywords: string[];
  oneClarifier: string;
  refinementFrame: string;
  safetyNote?: string;
};

export type EventQuestionChip = {
  categoryId: EventQuestionCategoryId;
  id: string;
  question: string;
};

export type EventQuestionRefinement = {
  categoryId: EventQuestionCategoryId;
  clarity: EventQuestionClarity;
  clarifyingQuestion?: string;
  deterministic: true;
  downstream: {
    evidenceRooms: EventQuestionEvidenceRoom[];
    needsMedicalDisclaimer: boolean;
    preserveOriginalQuestion: string;
    refinementReadyForEvidence: boolean;
    shouldSpendAiCredit: false;
  };
  entitlement: {
    free: string;
    paid: string;
  };
  interactionPlan: string[];
  originalQuestion: string;
  refinedQuestion: string;
  suggestedPhrasing: string;
};

export const EVENT_QUESTION_CATEGORIES: EventQuestionCategory[] = [
  {
    id: 'career_move',
    defaultQuestion: 'Is a meaningful career move likely for me soon?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology'],
    keywords: ['career', 'work', 'role', 'office', 'profession', 'move'],
    oneClarifier: 'Is this about changing role, changing company, promotion, or direction confusion?',
    refinementFrame: 'Judge whether a meaningful career move is opening, what may trigger it, and what can delay it.',
  },
  {
    id: 'promotion',
    defaultQuestion: 'Is promotion or recognition likely in my current role?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'numerology'],
    keywords: ['promotion', 'raise', 'recognition', 'manager', 'senior', 'title'],
    oneClarifier: 'Is the promotion expected inside your current company or through a new opportunity?',
    refinementFrame: 'Judge promotion promise, recognition timing, support from seniors, and likely delay factors.',
  },
  {
    id: 'job_change',
    defaultQuestion: 'Should I expect a job change, and when is it more likely?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology'],
    keywords: ['job', 'switch', 'change company', 'new job', 'resign', 'interview'],
    oneClarifier: 'Are you actively interviewing, waiting for an offer, or only wondering if change will come?',
    refinementFrame: 'Judge job-change promise, likely window, external trigger, and whether staying is stronger.',
  },
  {
    id: 'foreign_travel',
    defaultQuestion: 'Is foreign travel likely for me, and what may trigger it?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'numerology'],
    keywords: ['foreign', 'abroad', 'overseas', 'uk', 'usa', 'travel', 'international'],
    oneClarifier: 'Is this about work travel, study, family visit, or permanent settlement?',
    refinementFrame: 'Judge foreign-travel promise, timing window, trigger source, and whether it looks temporary or long-term.',
  },
  {
    id: 'relocation',
    defaultQuestion: 'Is relocation likely for me, and will it help?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology'],
    keywords: ['relocation', 'shift', 'move city', 'move home', 'settle', 'transfer'],
    oneClarifier: 'Is the relocation for job, family, education, marriage, or personal reset?',
    refinementFrame: 'Judge relocation support, whether it improves life stability, and what may force or delay the move.',
  },
  {
    id: 'visa_pr',
    defaultQuestion: 'Is visa or PR progress likely for me?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'numerology'],
    keywords: ['visa', 'pr', 'immigration', 'passport', 'permit', 'green card'],
    oneClarifier: 'Is this a first visa, renewal, work permit, study visa, or PR application?',
    refinementFrame: 'Judge document approval support, timing readiness, blockers, and practical caution points.',
  },
  {
    id: 'marriage_timing',
    defaultQuestion: 'When is marriage more likely for me?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology'],
    keywords: ['marriage', 'shaadi', 'wedding', 'spouse', 'partner', 'proposal'],
    oneClarifier: 'Is this about finding someone, fixing marriage timing, or a current proposal?',
    refinementFrame: 'Judge marriage timing, relationship readiness, family support, and delay factors.',
  },
  {
    id: 'relationship_outcome',
    defaultQuestion: 'Where is this relationship likely to go?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology', 'signature'],
    keywords: ['relationship', 'love', 'breakup', 'ex', 'partner', 'compatibility'],
    oneClarifier: 'Is this about commitment, breakup, reconciliation, or compatibility?',
    refinementFrame: 'Judge relationship direction, emotional friction, commitment support, and what needs clarity.',
  },
  {
    id: 'money_property',
    defaultQuestion: 'Is this a good time for money or property decisions?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology'],
    keywords: ['money', 'property', 'house', 'home', 'flat', 'investment', 'loan', 'finance'],
    oneClarifier: 'Is this about buying property, selling, loan, investment, debt, or cash flow?',
    refinementFrame: 'Judge property or money support, risk window, delay factors, and practical next step.',
  },
  {
    id: 'business_growth',
    defaultQuestion: 'Will my business grow in the next phase?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology'],
    keywords: ['business', 'startup', 'client', 'sales', 'growth', 'partnership'],
    oneClarifier: 'Is this about starting, scaling, clients, partnership, funding, or survival?',
    refinementFrame: 'Judge business growth support, strongest trigger, revenue caution, and timing readiness.',
  },
  {
    id: 'education_study_stream',
    defaultQuestion: 'Which study direction is better supported for me?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'numerology'],
    keywords: ['education', 'study', 'course', 'college', 'exam', 'stream', 'degree'],
    oneClarifier: 'Is this about choosing a stream, exam result, admission, or foreign study?',
    refinementFrame: 'Judge study direction, exam/admission timing, and the stream that has stronger support.',
  },
  {
    id: 'court_litigation',
    defaultQuestion: 'How should I read the timing and risk around this legal matter?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma'],
    keywords: ['court', 'case', 'legal', 'litigation', 'dispute', 'lawyer'],
    oneClarifier: 'Is this about filing, settlement, judgment, delay, or risk reduction?',
    refinementFrame: 'Judge dispute pressure, settlement support, delay risk, and safer action timing.',
  },
  {
    id: 'family_child_matching',
    defaultQuestion: 'What should I understand about family, child, or matching matters?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology'],
    keywords: ['family', 'child', 'children', 'matching', 'parents', 'relative'],
    oneClarifier: 'Is this about child planning, family tension, matchmaking, or a specific family decision?',
    refinementFrame: 'Judge family or matching support, emotional pressure, timing, and practical next step.',
  },
  {
    id: 'wellness_caution',
    defaultQuestion: 'What wellness caution should I be mindful of right now?',
    evidenceRooms: ['vedic', 'kundliKarma', 'numerology'],
    keywords: ['health', 'wellness', 'stress', 'illness', 'medical', 'body', 'anxiety'],
    oneClarifier: 'Is this about stress, routine, recovery support, or a medical concern already being treated?',
    refinementFrame: 'Give non-medical wellness timing caution, stress pattern, and safe routine guidance.',
    safetyNote: 'This is wellness reflection only, never medical diagnosis or emergency advice.',
  },
  {
    id: 'guide_me',
    defaultQuestion: 'I do not have one question. What should I ask first from my Kundli?',
    evidenceRooms: ['vedic', 'kp', 'jaimini', 'kundliKarma', 'numerology'],
    keywords: ['guide me', 'no question', 'not sure', 'confused', 'what should i ask'],
    oneClarifier: 'Which area feels most urgent right now: career, relationship, money, family, travel, or inner direction?',
    refinementFrame: 'Find the highest-value first question from the user’s current life context without forcing a school choice.',
  },
];

export const EVENT_QUESTION_CHIPS: EventQuestionChip[] = [
  { id: 'career-move-soon', categoryId: 'career_move', question: 'Is a meaningful career move likely for me soon?' },
  { id: 'foreign-work-travel', categoryId: 'foreign_travel', question: 'Is foreign work travel or relocation likely for me?' },
  { id: 'marriage-window', categoryId: 'marriage_timing', question: 'When is marriage more likely for me?' },
  { id: 'relationship-direction', categoryId: 'relationship_outcome', question: 'Where is this relationship likely to go?' },
  { id: 'property-money-decision', categoryId: 'money_property', question: 'Is this a good time for a money or property decision?' },
  { id: 'business-growth-next', categoryId: 'business_growth', question: 'Will my business grow in the next phase?' },
  { id: 'education-direction', categoryId: 'education_study_stream', question: 'Which study direction is better supported for me?' },
  { id: 'guide-me-first', categoryId: 'guide_me', question: 'I have no specific question. Guide me first.' },
];

const CATEGORY_BY_ID = new Map(EVENT_QUESTION_CATEGORIES.map(category => [category.id, category]));

const GENERIC_VAGUE_PATTERNS = [
  /\b(future|life|tell me|anything|everything|general|overall)\b/i,
  /^(career|job|marriage|relationship|money|business|health|family)$/i,
];

const HIGH_SPECIFICITY_CATEGORY_PATTERNS: Array<{
  categoryId: EventQuestionCategoryId;
  pattern: RegExp;
}> = [
  { categoryId: 'visa_pr', pattern: /\b(visa|pr|immigration|passport|permit|green card)\b/i },
  { categoryId: 'foreign_travel', pattern: /\b(foreign|abroad|overseas|uk|usa|international)\b/i },
  { categoryId: 'court_litigation', pattern: /\b(court|case|legal|litigation|lawyer|settlement)\b/i },
  { categoryId: 'marriage_timing', pattern: /\b(marriage|shaadi|wedding|spouse|proposal)\b/i },
  { categoryId: 'relationship_outcome', pattern: /\b(relationship|love|breakup|ex|partner)\b/i },
  { categoryId: 'money_property', pattern: /\b(property|house|home|flat|loan|investment|debt)\b/i },
  { categoryId: 'wellness_caution', pattern: /\b(health|wellness|stress|illness|medical|anxiety)\b/i },
];

export function getEventQuestionCategory(
  categoryId: EventQuestionCategoryId,
): EventQuestionCategory {
  const category = CATEGORY_BY_ID.get(categoryId);
  if (!category) {
    throw new Error(`Unknown event question category: ${categoryId}`);
  }
  return category;
}

export function getEventQuestionCategories(): EventQuestionCategory[] {
  return EVENT_QUESTION_CATEGORIES;
}

export function getEventQuestionChips(): EventQuestionChip[] {
  return EVENT_QUESTION_CHIPS;
}

export function detectEventQuestionCategory(
  question: string,
): EventQuestionCategoryId {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return 'guide_me';

  const specific = HIGH_SPECIFICITY_CATEGORY_PATTERNS.find(({ pattern }) =>
    pattern.test(normalized),
  );
  if (specific) return specific.categoryId;

  const scored = EVENT_QUESTION_CATEGORIES
    .map(category => ({
      category,
      score: category.keywords.filter(keyword => normalized.includes(keyword)).length,
    }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.score ? scored[0].category.id : 'guide_me';
}

export function refineEventQuestion(
  question: string,
  selectedCategoryId?: EventQuestionCategoryId,
): EventQuestionRefinement {
  const originalQuestion = question.trim();
  const categoryId = selectedCategoryId ?? detectEventQuestionCategory(originalQuestion);
  const category = getEventQuestionCategory(categoryId);
  const isGuideMe =
    categoryId === 'guide_me' ||
    !originalQuestion ||
    /no specific question|guide me|not sure|confused/i.test(originalQuestion);
  const isVague =
    isGuideMe ||
    originalQuestion.length < 18 ||
    GENERIC_VAGUE_PATTERNS.some(pattern => pattern.test(originalQuestion));
  const clarity: EventQuestionClarity = isGuideMe
    ? 'guide-me'
    : isVague
      ? 'needs-one-clarifier'
      : 'clear';
  const refinedQuestion =
    clarity === 'clear'
      ? originalQuestion
      : category.defaultQuestion;
  const suggestedPhrasing =
    clarity === 'clear'
      ? `${category.refinementFrame} Original wording: ${originalQuestion}`
      : `${refinedQuestion} ${category.refinementFrame}`;

  return {
    categoryId,
    clarity,
    clarifyingQuestion: clarity === 'clear' ? undefined : category.oneClarifier,
    deterministic: true,
    downstream: {
      evidenceRooms: category.evidenceRooms,
      needsMedicalDisclaimer: categoryId === 'wellness_caution',
      preserveOriginalQuestion: originalQuestion,
      refinementReadyForEvidence: clarity === 'clear',
      shouldSpendAiCredit: false,
    },
    entitlement: {
      free: 'Free users get a short answer, one timing clue, and one practical next step.',
      paid: 'Paid Precision Reading adds multi-school evidence, timing windows, trigger map, contradictions, and deeper guidance.',
    },
    interactionPlan:
      clarity === 'clear'
        ? ['Confirm question', 'Read evidence', 'Answer directly']
        : ['Choose event area', 'Answer one clarifier', 'Confirm refined question'],
    originalQuestion,
    refinedQuestion,
    suggestedPhrasing,
  };
}
