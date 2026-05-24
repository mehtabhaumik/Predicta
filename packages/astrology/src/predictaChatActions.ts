import type {
  KundliData,
  PredictaSchool,
  SavedKundliRecord,
  SignatureTraitKey,
  SignatureTraitValue,
  SupportedLanguage,
} from '@pridicta/types';
import { composeAdvancedJyotishCoverage } from './advancedJyotishEngine';
import { composeBirthTimeDetective } from './birthTimeDetective';
import { composeChalitBhavKpFoundation } from './chalitBhavKpFoundation';
import { composeDailyBriefing } from './dailyBriefing';
import { composeDestinyPassport } from './destinyPassport';
import { composeFamilyKarmaMap } from './familyKarmaMap';
import { composeHolisticDailyGuidance } from './holisticDailyGuidance';
import { composeHolisticDecisionTimingSynthesis } from './holisticDecisionTimingSynthesis';
import { composeHolisticFoundationModel } from './holisticFoundationModel';
import { composeHolisticReadingRooms } from './holisticReadingRooms';
import { composeLifeAtlasReport } from './lifeAtlasReport';
import { composeLifeTimeline } from './lifeTimeline';
import { composeMahadashaIntelligence } from './mahadashaIntelligence';
import { composeNadiJyotishPlan } from './nadiJyotishPlan';
import { composeNumerologyFoundationModel } from './numerologyFoundationModel';
import { composePersonalPanchangLayer } from './personalPanchangLayer';
import { composePredictaWrapped } from './predictaWrapped';
import { composePurusharthaLifeBalance } from './purusharthaLifeBalance';
import { composeRemedyCoach } from './remedyCoach';
import { composeRelationshipMirror } from './relationshipMirror';
import { composeSadhanaRemedyPath } from './sadhanaRemedyPath';
import { composeSadeSatiIntelligence } from './sadeSatiIntelligence';
import {
  SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES,
  composeSignatureAnalysisModel,
} from './signatureAnalysisModel';
import { composeTransitGocharIntelligence } from './transitGocharIntelligence';
import { composeYearlyHoroscopeVarshaphal } from './yearlyHoroscopeVarshaphal';

export type PredictaAppActionId =
  | 'advanced-jyotish'
  | 'birth-time'
  | 'chart'
  | 'bhav-chalit'
  | 'concierge'
  | 'daily-briefing'
  | 'decision-timing'
  | 'destiny-passport'
  | 'family-map'
  | 'holistic-daily-guidance'
  | 'kp-handoff'
  | 'kp-predicta'
  | 'life-timeline'
  | 'mahadasha'
  | 'nadi-handoff'
  | 'nadi-predicta'
  | 'numerology-handoff'
  | 'numerology-predicta'
  | 'signature-handoff'
  | 'signature-predicta'
  | 'holistic-reading-rooms'
  | 'personal-panchang'
  | 'pricing'
  | 'purushartha'
  | 'relationship'
  | 'remedies'
  | 'report'
  | 'sadhana-remedy-path'
  | 'saved-kundlis'
  | 'sade-sati'
  | 'transit-gochar'
  | 'yearly-horoscope'
  | 'vedic-handoff'
  | 'wow-radar'
  | 'wrapped';

export type PredictaInteractionMemory = {
  actionCounts: Partial<Record<PredictaAppActionId, number>>;
  chartSignatures: string[];
  firstSeenAt: string;
  lastAction?: PredictaAppActionId;
  preferredLanguageStyle?: SupportedLanguage;
  lastSeenAt: string;
  learnedThemes: string[];
  totalTurns: number;
};

export type PredictaActionRequest = {
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  memory?: PredictaInteractionMemory;
  predictaSchool?: PredictaSchool;
  savedKundlis?: KundliData[];
  text: string;
};

export type PredictaActionReply = {
  action?: PredictaAppActionId;
  handled: boolean;
  memory: PredictaInteractionMemory;
  text?: string;
};

export type PredictaLanguageContext = {
  acknowledgement?: string;
  dominantLanguage: SupportedLanguage;
  normalizedText: string;
  responseLanguage: SupportedLanguage;
};

export type PredictaEnglishSwitchDecision = 'approve' | 'none' | 'reject';

const ACTION_PATTERNS: Array<{
  id: PredictaAppActionId;
  pattern: RegExp;
}> = [
  {
    id: 'destiny-passport',
    pattern:
      /\b(passport|pasport|paspot|destiny\s*passport|identity\s*card|profile\s*card)\b/i,
  },
  {
    id: 'decision-timing',
    pattern:
      /\b(decision|decide|should\s+i|should\s+we|whether\s+i|whether\s+we|is\s+it\s+a\s+good\s+time|right\s+time|good\s+time\s+to|timing\s+for|karu\s+ke\s+nahi|karvu\s+ke\s+nahi|kya\s*karu|shu\s*karu)\b/i,
  },
  {
    id: 'wow-radar',
    pattern:
      /\b(wow|surprise\s*me|insane|what\s*do\s*you\s*notice|what\s*stands\s*out|hidden\s*pattern|hidden\s*strength|strongest\s*signal|pattern\s*radar|predicta\s*radar|tell\s*me\s*something\s*interesting|kuch\s*interesting|kuch\s*alag|kaik\s*interesting|kai\s*alag)\b/i,
  },
  {
    id: 'mahadasha',
    pattern:
      /\b(mahadasha|maha\s*dasha|antardasha|antar\s*dasha|pratyantardasha|pratyantar|vimshottari|dasha\s*analysis|current\s*dasha|life\s*chapter|dasa|mhdasha)\b/i,
  },
  {
    id: 'holistic-daily-guidance',
    pattern:
      /\b(holistic\s*daily|daily\s*guidance|today'?s\s*guidance|what\s*should\s*i\s*do\s*today|what\s*to\s*do\s*today|morning\s*practice|daily\s*sadhana|aaj\s*kya\s*karu|aaj\s*kya\s*karna|aaje\s*shu\s*karu|aaje\s*su\s*karu|aajnu\s*guidance)\b/i,
  },
  {
    id: 'personal-panchang',
    pattern:
      /\b(personal\s*panchang|panchang|panchange|panchangam|muhurta|muhurat|tithi|paksha|nakshatra\s*today|today'?s\s*moon|day\s*lord|shubh\s*samay|good\s*time|auspicious\s*time|aaj\s*ka\s*panchang|aajnu\s*panchang|shubh\s*muhurat)\b/i,
  },
  {
    id: 'holistic-reading-rooms',
    pattern:
      /\b(holistic\s*room|reading\s*room|reading\s*rooms|holistic\s*reading|karma\s*room|today\s*room|timing\s*room|dharma\s*room|artha\s*room|kama\s*room|moksha\s*room)\b/i,
  },
  {
    id: 'sadhana-remedy-path',
    pattern:
      /\b(sadhana\s*path|sadhana\s*remedy|remedy\s*path|upay\s*path|upaay\s*path|spiritual\s*practice\s*path|practice\s*path|seva\s*path|mantra\s*path)\b/i,
  },
  {
    id: 'advanced-jyotish',
    pattern:
      /\b(advanced\s*jyotish|advanced\s*mode|ashtakavarga|nakshatra|birth\s*star|yoga|dosha|manglik|kaal\s*sarp|kemadruma|panchang|muhurta|prashna|horary|lal\s*kitab|technical\s*table)\b/i,
  },
  {
    id: 'sade-sati',
    pattern:
      /\b(sade\s*sati|sadesati|saturn\s*transit|shani|shani\s*sade|saturn\s*period|saturn\s*pressure|dhaiya|kantaka\s*shani)\b/i,
  },
  {
    id: 'transit-gochar',
    pattern:
      /\b(gochar|gocar|gocahr|transit|transits|planetary\s*weather|current\s*planet|monthly\s*transit|jupiter\s*transit|rahu\s*transit|ketu\s*transit|mars\s*transit)\b/i,
  },
  {
    id: 'bhav-chalit',
    pattern:
      /\b(chalit|bhav\s*chalit|bhava\s*chalit|bhav\s*chart|house\s*cusp|cusp\s*chart)\b/i,
  },
  {
    id: 'kp-predicta',
    pattern:
      /\b(kp\s*predicta|kp\s*section|kp\s*world|in\s+kp|from\s+kp)\b/i,
  },
  {
    id: 'kp-handoff',
    pattern:
      /\b(kp|krishnamurti|krishnamurthy|paddhati|cuspal\s*sub|sub\s*lord|sublord|significator|ruling\s*planet|249)\b/i,
  },
  {
    id: 'nadi-handoff',
    pattern: /\b(nadi|naadi|palm\s*leaf|agastya|nadi\s*jyotish)\b/i,
  },
  {
    id: 'nadi-predicta',
    pattern: /\b(nadi\s*predicta|nadi\s*room|nadi\s*world|in\s+nadi|from\s+nadi)\b/i,
  },
  {
    id: 'numerology-predicta',
    pattern:
      /\b(numerology\s*predicta|numerology\s*room|ank\s*jyotish|ankjyotish|name\s*number|birth\s*number|destiny\s*number|life\s*path|personal\s*(year|month|day)|moolank|mulank|bhagyank|naam\s*ank|ank\s*shastra)\b/i,
  },
  {
    id: 'numerology-handoff',
    pattern:
      /\b(numerology|ank\s*jyotish|ankjyotish|number\s*reading|name\s*vibration|name\s*correction)\b/i,
  },
  {
    id: 'signature-predicta',
    pattern:
      /\b(signature\s*predicta|signature\s*room|signature\s*analysis|signature\s*reading|read\s*my\s*signature|analyse\s*my\s*signature|analyze\s*my\s*signature|signature\s*improvement|signature\s*change|hastakshar\s*analysis|sahi\s*analysis)\b/i,
  },
  {
    id: 'signature-handoff',
    pattern:
      /\b(signature|autograph|hastakshar|sahi|handwriting\s*signature)\b/i,
  },
  {
    id: 'life-timeline',
    pattern:
      /\b(timeline|life\s*calendar|calendar|calender|dasha\s*timeline|transit\s*timeline|life\s*map|next\s*12\s*months|aavta\s*varas|agla\s*saal)\b/i,
  },
  {
    id: 'yearly-horoscope',
    pattern:
      /\b(yearly\s*horoscope|annual\s*horoscope|varsha\s*phal|varshaphal|varsha\s*kundli|solar\s*return|muntha|tajika|this\s*year|year\s*ahead|next\s*year\s*prediction|aavtu\s*varas|agla\s*saal)\b/i,
  },
  {
    id: 'daily-briefing',
    pattern:
      /\b(daily|today|aaj|briefing|cosmic\s*weather|day\s*reading|aaj\s*ka|aajnu)\b/i,
  },
  {
    id: 'purushartha',
    pattern:
      /\b(purushartha|dharma|artha|kama|moksha|life\s*balance|life\s*aim|what\s*should\s*i\s*focus|focus\s*now)\b/i,
  },
  {
    id: 'remedies',
    pattern:
      /\b(remedy|remedies|upay|upaay|coach|practice|mantra|daan|seva|karma|karmic|sadhana)\b/i,
  },
  {
    id: 'birth-time',
    pattern:
      /\b(birth\s*time|rectification|detective|time\s*confidence|time\s*unknown)\b/i,
  },
  {
    id: 'wrapped',
    pattern: /\b(wrapped|yearly\s*recap|recap|share\s*card|year\s*review)\b/i,
  },
  {
    id: 'report',
    pattern:
      /\b(report|riport|ripot|pdf|dossier|bundle|career\s*report|marriage\s*report|wealth\s*report|report\s*bana|pdf\s*bana)\b/i,
  },
  {
    id: 'relationship',
    pattern:
      /\b(relationship|compatibility|marriage|shaadi|couple|partner|match|synastry|rishta|vivah)\b/i,
  },
  {
    id: 'family-map',
    pattern:
      /\b(family|karma\s*map|household|parents|children|vault|ghar|parivar|kutumb)\b/i,
  },
  {
    id: 'chart',
    pattern:
      /\b(show|open|display|preview|snapshot|see|view|render)\b[\s\w-]*\b(chart|kundli|kundly|kundali|kundaly|janam\s*kundli|north\s*indian)\b|\b(chart|kundli|kundly|kundali|kundaly|janam\s*kundli|north\s*indian)\b[\s\w-]*\b(show|open|display|preview|snapshot|see|view|render)\b/i,
  },
  {
    id: 'pricing',
    pattern:
      /\b(price|pricing|premium|subscription|plan|day\s*pass|purchase|buy|unlock)\b/i,
  },
  {
    id: 'saved-kundlis',
    pattern: /\b(saved|save|store|profiles|family\s*member|members)\b/i,
  },
  {
    id: 'concierge',
    pattern:
      /\b(help|what\s*can\s*you\s*do|show\s*me|guide\s*me|surprise\s*me|what\s*next|kya\s*kar\s*sakti|su\s*kari\s*sake|shu\s*kari\s*sake)\b/i,
  },
];

export function preparePredictaLanguageContext({
  selectedLanguage,
  text,
  memory,
}: {
  memory?: PredictaInteractionMemory;
  selectedLanguage: SupportedLanguage;
  text: string;
}): PredictaLanguageContext {
  const explicitLanguage = detectExplicitPredictaReplyLanguage(text);
  const dominantLanguage = detectDominantPredictaLanguage(text);
  const responseLanguage = explicitLanguage ?? dominantLanguage;
  const shouldAcknowledge =
    explicitLanguage !== undefined &&
    explicitLanguage !== selectedLanguage &&
    memory?.preferredLanguageStyle !== explicitLanguage;

  return {
    acknowledgement: shouldAcknowledge
      ? buildExplicitLanguageSwitchAcknowledgement(responseLanguage)
      : undefined,
    dominantLanguage,
    normalizedText: normalizePredictaIntentText(text),
    responseLanguage,
  };
}

export function shouldAutoSwitchToRegionalLanguage({
  context,
  selectedLanguage,
}: {
  context: PredictaLanguageContext;
  selectedLanguage: SupportedLanguage;
}): boolean {
  return (
    selectedLanguage === 'en' &&
    (context.responseLanguage === 'hi' || context.responseLanguage === 'gu')
  );
}

export function shouldAskBeforeSwitchingToEnglish({
  context,
  selectedLanguage,
}: {
  context: PredictaLanguageContext;
  selectedLanguage: SupportedLanguage;
}): boolean {
  return false;
}

export function detectEnglishSwitchDecision(
  text: string,
): PredictaEnglishSwitchDecision {
  const normalized = normalizePredictaIntentText(text);

  if (
    /\b(switch|change|english|yes|yeah|yep|ok|okay|sure|haan|ha|ha ji|kar do|kardo|english mein|english ma)\b/i.test(
      normalized,
    )
  ) {
    return 'approve';
  }

  if (
    /\b(no|nope|stay|continue|same|keep|nahin|nahi|mat|hindi|hinglish|gujarati|gujju|gujarati ma|hindi mein)\b/i.test(
      normalized,
    )
  ) {
    return 'reject';
  }

  return 'none';
}

export function buildEnglishSwitchPrompt(
  currentLanguage: SupportedLanguage,
): string {
  if (currentLanguage === 'gu') {
    return 'I will continue in English. The app language can stay separate.';
  }

  return 'I will continue in English. The app language can stay separate.';
}

export function buildEnglishSwitchDecisionReply({
  currentLanguage,
  decision,
}: {
  currentLanguage: SupportedLanguage;
  decision: Exclude<PredictaEnglishSwitchDecision, 'none'>;
}): string {
  if (decision === 'approve') {
    return 'Okay. I will continue in English now.';
  }

  if (currentLanguage === 'gu') {
    return 'ઠીક છે. હું ગુજરાતી માં જ જવાબ આપતી રહીશ.';
  }

  return 'ठीक है. मैं हिंदी में ही जवाब देती रहूंगी.';
}

function detectExplicitPredictaReplyLanguage(
  text: string,
): SupportedLanguage | undefined {
  const normalized = normalizePredictaIntentText(text);

  if (
    /(?:\b(?:switch|change|answer|reply|respond|continue|speak|talk|write|keep)\b[\s\S]{0,24}\benglish\b)|(?:\bin english\b)|(?:\benglish please\b)|(?:^english$)/i.test(
      normalized,
    )
  ) {
    return 'en';
  }

  if (
    /(?:\b(?:switch|change|answer|reply|respond|continue|speak|talk|write|keep)\b[\s\S]{0,24}\b(?:hindi|hindii|devanagari)\b)|(?:\bin hindi\b)|(?:\bhindi me\b)|(?:\bhindi mein\b)|(?:\bhindi please\b)|(?:हिंदी)|(?:हिन्दी)/i.test(
      text,
    )
  ) {
    return 'hi';
  }

  if (
    /(?:\b(?:switch|change|answer|reply|respond|continue|speak|talk|write|keep)\b[\s\S]{0,24}\bgujarati\b)|(?:\bin gujarati\b)|(?:\bgujarati ma\b)|(?:\bgujarati please\b)|ગુજરાતી/i.test(
      text,
    )
  ) {
    return 'gu';
  }

  return undefined;
}

export function normalizePredictaIntentText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectDominantPredictaLanguage(
  text: string,
): SupportedLanguage {
  const hasGujaratiScript = /[\u0A80-\u0AFF]/.test(text);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  if (hasGujaratiScript) {
    return 'gu';
  }
  if (hasDevanagari) {
    return 'hi';
  }
  return 'en';
}

export function buildPredictaActionReply({
  hasPremiumAccess = false,
  kundli,
  language,
  memory,
  predictaSchool,
  savedKundlis = [],
  text,
}: PredictaActionRequest): PredictaActionReply {
  const languageContext = preparePredictaLanguageContext({
    memory,
    selectedLanguage: language,
    text,
  });
  const action = resolveSchoolAwareAction(
    detectPredictaAppAction(languageContext.normalizedText),
    predictaSchool,
  );
  const responseLanguage = shouldPreferNumerologyRoomLanguage({
    action,
    explicitLanguage: detectExplicitPredictaReplyLanguage(text),
    predictaSchool,
    selectedLanguage: language,
  })
    ? language
    : languageContext.responseLanguage;
  const nextMemory = learnPredictaInteraction(
    memory,
    text,
    action,
    kundli,
    responseLanguage,
  );

  if (!action) {
    return {
      handled: false,
      memory: nextMemory,
    };
  }

  if (!kundli && actionRequiresKundli(action)) {
    return {
      action,
      handled: true,
      memory: nextMemory,
      text: withLanguageAcknowledgement(
        languageContext,
        buildNeedsKundliReply(responseLanguage, action),
      ),
    };
  }

  return {
    action,
    handled: true,
    memory: nextMemory,
      text: withLanguageAcknowledgement(
        languageContext,
        buildActionText({
          action,
          hasPremiumAccess,
          kundli,
          language: responseLanguage,
          memory: nextMemory,
          savedKundlis,
          text,
        }),
      ),
  };
}

export function buildPredictaLearningSuggestion({
  hasPremiumAccess = false,
  kundli,
  language,
  memory,
  savedKundlis = [],
}: Omit<PredictaActionRequest, 'text'>): string {
  const next = pickNextSuggestion(
    memory,
    kundli,
    savedKundlis,
    hasPremiumAccess,
  );
  const insight = buildMemoryInsight(language, memory, kundli, savedKundlis);

  if (language === 'hi') {
    return [
      insight,
      `मेरी तरफ़ से next smart step: ${next}. कहिए तो मैं यहीं chat में start कर दूंगी.`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      insight,
      `મારી તરફથી next smart step: ${next}. કહેશો તો હું અહીં chat માં start કરી દઈશ.`,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    insight,
    `My smart next move: ${next}. Say the word and I will start it here in chat.`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function learnPredictaInteraction(
  memory: PredictaInteractionMemory | undefined,
  text: string,
  action?: PredictaAppActionId,
  kundli?: KundliData,
  responseLanguage?: SupportedLanguage,
): PredictaInteractionMemory {
  const now = new Date().toISOString();
  const current = memory ?? {
    actionCounts: {},
    chartSignatures: [],
    firstSeenAt: now,
    lastSeenAt: now,
    learnedThemes: [],
    totalTurns: 0,
  };
  const learnedThemes = mergeUnique(
    current.learnedThemes,
    inferThemes(text, action),
    8,
  );
  const chartSignatures = kundli
    ? mergeUnique(current.chartSignatures, [chartSignature(kundli)], 8)
    : current.chartSignatures;

  return {
    ...current,
    actionCounts: action
      ? {
          ...current.actionCounts,
          [action]: (current.actionCounts[action] ?? 0) + 1,
        }
      : current.actionCounts,
    chartSignatures,
    lastAction: action ?? current.lastAction,
    lastSeenAt: now,
    learnedThemes,
    preferredLanguageStyle:
      responseLanguage ?? current.preferredLanguageStyle,
    totalTurns: current.totalTurns + 1,
  };
}

function detectPredictaAppAction(
  text: string,
): PredictaAppActionId | undefined {
  const normalized = text.trim();

  if (!normalized) {
    return undefined;
  }

  const match = ACTION_PATTERNS.find(item => item.pattern.test(normalized));

  if (match) {
    return match.id;
  }

  return undefined;
}

function resolveSchoolAwareAction(
  action: PredictaAppActionId | undefined,
  predictaSchool: PredictaSchool | undefined,
): PredictaAppActionId | undefined {
  if (
    predictaSchool === 'KP' &&
    (action === 'kp-handoff' || action === 'kp-predicta')
  ) {
    return 'kp-predicta';
  }

  if (predictaSchool !== 'KP' && action === 'kp-predicta') {
    return 'kp-handoff';
  }

  if (
    predictaSchool === 'NADI' &&
    (action === 'nadi-handoff' || action === 'nadi-predicta')
  ) {
    return 'nadi-predicta';
  }

  if (predictaSchool !== 'NADI' && action === 'nadi-predicta') {
    return 'nadi-handoff';
  }

  if (
    predictaSchool === 'NUMEROLOGY' &&
    (action === 'numerology-handoff' || action === 'numerology-predicta')
  ) {
    return 'numerology-predicta';
  }

  if (
    predictaSchool !== 'NUMEROLOGY' &&
    action === 'numerology-predicta'
  ) {
    return 'numerology-handoff';
  }

  if (
    predictaSchool === 'SIGNATURE' &&
    (action === 'signature-handoff' || action === 'signature-predicta')
  ) {
    return 'signature-predicta';
  }

  if (
    predictaSchool !== 'SIGNATURE' &&
    action === 'signature-predicta'
  ) {
    return 'signature-handoff';
  }

  if (!action || predictaSchool === 'PARASHARI' || !predictaSchool) {
    return action;
  }

  if (isParashariRoomAction(action)) {
    return 'vedic-handoff';
  }

  return action;
}

const PARASHARI_ROOM_ACTIONS = new Set<PredictaAppActionId>([
  'advanced-jyotish',
  'birth-time',
  'bhav-chalit',
  'chart',
  'daily-briefing',
  'decision-timing',
  'destiny-passport',
  'family-map',
  'holistic-daily-guidance',
  'holistic-reading-rooms',
  'life-timeline',
  'mahadasha',
  'personal-panchang',
  'purushartha',
  'relationship',
  'remedies',
  'report',
  'sadhana-remedy-path',
  'sade-sati',
  'transit-gochar',
  'wow-radar',
  'wrapped',
  'yearly-horoscope',
]);

function isParashariRoomAction(action: PredictaAppActionId): boolean {
  return PARASHARI_ROOM_ACTIONS.has(action);
}

function actionRequiresKundli(action: PredictaAppActionId): boolean {
  return ![
    'concierge',
    'kp-handoff',
    'nadi-handoff',
    'numerology-handoff',
    'numerology-predicta',
    'signature-handoff',
    'signature-predicta',
    'vedic-handoff',
    'pricing',
    'saved-kundlis',
  ].includes(action);
}

function buildActionText({
  action,
  hasPremiumAccess,
  kundli,
  language,
  memory,
  savedKundlis,
  text,
}: Required<
  Pick<PredictaActionRequest, 'language' | 'savedKundlis' | 'text'>
> & {
  action: PredictaAppActionId;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  memory: PredictaInteractionMemory;
}): string {
  const intro = actionIntro(language);
  const insight = buildMemoryInsight(language, memory, kundli, savedKundlis);
  const upsell = buildUpsell(language, action, hasPremiumAccess);

  if (action === 'concierge') {
    return joinSections([
      intro,
      conciergeMenu(language, Boolean(kundli), hasPremiumAccess),
      insight,
      upsell,
    ]);
  }

  if (action === 'pricing') {
    return joinSections([
      intro,
      pricingReply(language, hasPremiumAccess),
      insight,
    ]);
  }

  if (action === 'wow-radar') {
    if (!kundli) {
      return buildNeedsKundliReply(language, action);
    }

    return joinSections([
      intro,
      buildWowRadarReply({
        kundli,
        language,
        memory,
        savedKundlis,
      }),
      insight,
      buildUpsell(language, 'wow-radar', hasPremiumAccess),
    ]);
  }

  if (action === 'saved-kundlis') {
    return joinSections([
      intro,
      savedKundlisReply(language, savedKundlis),
      insight,
      upsell,
    ]);
  }

  if (action === 'kp-handoff') {
    return joinSections([
      intro,
      kpHandoffReply(language),
      insight,
    ]);
  }

  if (action === 'nadi-handoff') {
    return joinSections([
      intro,
      nadiHandoffReply(language),
      insight,
    ]);
  }

  if (action === 'nadi-predicta') {
    return joinSections([
      intro,
      buildNadiPredictaReply(language, kundli, hasPremiumAccess),
      insight,
      buildUpsell(language, 'nadi-predicta', hasPremiumAccess),
    ]);
  }

  if (action === 'numerology-handoff') {
    return joinSections([
      intro,
      numerologyHandoffReply(language),
      insight,
    ]);
  }

  if (action === 'numerology-predicta') {
    return joinSections([
      intro,
      buildNumerologyPredictaReply(language, kundli, hasPremiumAccess),
      insight,
      buildUpsell(language, 'numerology-predicta', hasPremiumAccess),
    ]);
  }

  if (action === 'signature-handoff') {
    return joinSections([
      intro,
      signatureHandoffReply(language),
      insight,
    ]);
  }

  if (action === 'signature-predicta') {
    return joinSections([
      intro,
      buildSignaturePredictaReply(language, text, hasPremiumAccess),
      insight,
      buildUpsell(language, 'signature-predicta', hasPremiumAccess),
    ]);
  }

  if (action === 'vedic-handoff') {
    return joinSections([
      intro,
      vedicHandoffReply(language),
      insight,
    ]);
  }

  if (!kundli) {
    return buildNeedsKundliReply(language, action);
  }

  if (action === 'destiny-passport') {
    const passport = composeDestinyPassport(kundli);
    return joinSections([
      intro,
      [
        `${passport.name}'s Destiny Passport`,
        `Lagna: ${passport.lagna}`,
        `Moon: ${passport.moonSign} | Nakshatra: ${passport.nakshatra}`,
        `Current timing: ${passport.currentDasha}`,
        `Life theme: ${passport.lifeTheme}`,
        `Watch carefully: ${passport.currentCaution}`,
        `Action: ${passport.recommendedAction}`,
        `Proof: ${passport.evidence.slice(0, 3).join(' | ')}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'life-timeline') {
    const timeline = composeLifeTimeline(kundli);
    const nowEvents = timeline.sections
      .flatMap(section => section.events)
      .slice(0, 3)
      .map(event => `${event.title}: ${event.dateWindow}`)
      .join('\n');
    return joinSections([
      intro,
      [
        timeline.title,
        `Current: ${timeline.currentPeriod}`,
        `Upcoming: ${timeline.upcomingPeriod}`,
        nowEvents ? `Top windows:\n${nowEvents}` : timeline.subtitle,
        timeline.caution ? `Caution: ${timeline.caution}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'decision-timing') {
    const synthesis = composeHolisticDecisionTimingSynthesis({
      kundli,
      language,
      question: text,
    });
    const proof = synthesis.signals
      .slice(0, hasPremiumAccess ? 5 : 3)
      .map(signal => `- ${signal.label}: ${signal.headline}`)
      .join('\n');
    return joinSections([
      intro,
      [
        synthesis.headline,
        `Timing: ${synthesis.timingWindow}`,
        `Guidance: ${synthesis.decisionGuidance}`,
        `Next step: ${synthesis.practicalStep}`,
        `Life balance: ${synthesis.purusharthaLens}`,
        `Karma support: ${synthesis.sadhanaSupport}`,
        proof ? `Proof:\n${proof}` : '',
        `Boundary: ${synthesis.guardrails[0]}`,
      ]
        .filter(Boolean)
        .join('\n'),
      insight,
      buildUpsell(language, 'decision-timing', hasPremiumAccess),
    ]);
  }

  if (action === 'mahadasha') {
    const dasha = composeMahadashaIntelligence(kundli, {
      depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    });
    return joinSections([
      intro,
      buildMahadashaReply(language, dasha, hasPremiumAccess),
      insight,
      upsell,
    ]);
  }

  if (action === 'advanced-jyotish') {
    const coverage = composeAdvancedJyotishCoverage(kundli, {
      depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    });
    return joinSections([
      intro,
      buildAdvancedJyotishReply(language, coverage, hasPremiumAccess),
      insight,
      buildUpsell(language, 'advanced-jyotish', hasPremiumAccess),
    ]);
  }

  if (action === 'sade-sati') {
    const sadeSati = composeSadeSatiIntelligence(kundli, {
      depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    });
    return joinSections([
      intro,
      buildSadeSatiReply(language, sadeSati, hasPremiumAccess),
      insight,
      upsell,
    ]);
  }

  if (action === 'transit-gochar') {
    const gochar = composeTransitGocharIntelligence(kundli, {
      depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    });
    return joinSections([
      intro,
      buildTransitGocharReply(language, gochar, hasPremiumAccess),
      insight,
      upsell,
    ]);
  }

  if (action === 'yearly-horoscope') {
    const yearly = composeYearlyHoroscopeVarshaphal(kundli, {
      depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    });
    return joinSections([
      intro,
      buildYearlyHoroscopeReply(language, yearly, hasPremiumAccess),
      insight,
      buildUpsell(language, 'yearly-horoscope', hasPremiumAccess),
    ]);
  }

  if (action === 'bhav-chalit') {
    const foundation = composeChalitBhavKpFoundation(kundli, {
      depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    });
    return joinSections([
      intro,
      buildBhavChalitReply(language, foundation, hasPremiumAccess),
      insight,
      buildUpsell(language, 'bhav-chalit', hasPremiumAccess),
    ]);
  }

  if (action === 'kp-predicta') {
    const foundation = composeChalitBhavKpFoundation(kundli, {
      depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    });
    return joinSections([
      intro,
      buildKpPredictaReply(language, foundation, hasPremiumAccess),
      insight,
      buildUpsell(language, 'kp-predicta', hasPremiumAccess),
    ]);
  }

  if (action === 'daily-briefing') {
    const briefing = composeDailyBriefing(kundli, { language });
    return joinSections([
      intro,
      [
        briefing.title,
        briefing.todayTheme,
        `Best action: ${briefing.bestAction}`,
        `Avoid: ${briefing.avoidAction}`,
        `Micro-remedy: ${briefing.remedyMicroAction}`,
        `Proof: ${briefing.evidence.slice(0, 2).join(' | ')}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'holistic-daily-guidance') {
    const guidance = composeHolisticDailyGuidance(kundli, { language });
    return joinSections([
      intro,
      [
        guidance.title,
        guidance.headline,
        `Morning: ${guidance.morningPractice}`,
        `Midday: ${guidance.middayCheck}`,
        `Evening: ${guidance.eveningReview}`,
        `Best action: ${guidance.bestAction}`,
        `Avoid: ${guidance.avoidAction}`,
        `Sadhana: ${guidance.sadhanaStep}`,
        `Proof: ${guidance.evidence.slice(0, 3).join(' | ')}`,
      ].join('\n'),
      insight,
      buildUpsell(language, 'holistic-daily-guidance', hasPremiumAccess),
    ]);
  }

  if (action === 'purushartha') {
    const balance = composePurusharthaLifeBalance(kundli);
    return joinSections([
      intro,
      [
        balance.title,
        balance.summary,
        `Leading now: ${balance.dominant.label} (${balance.dominant.score}%). ${balance.dominant.currentEmphasis}`,
        `Needs care: ${balance.needsCare.label} (${balance.needsCare.score}%). ${balance.needsCare.practicalGuidance}`,
        `Proof: ${balance.dominant.chartEvidence.slice(0, 2).join(' | ')}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'personal-panchang') {
    const panchang = composePersonalPanchangLayer(kundli);
    return joinSections([
      intro,
      [
        panchang.title,
        panchang.todayFocus,
        `Day lord: ${panchang.weekdayLord} (${panchang.weekday})`,
        `Tithi: ${panchang.tithi}`,
        `Moon rhythm: ${panchang.moonSign}, ${panchang.moonNakshatra}`,
        `Best for: ${panchang.bestFor.slice(0, 3).join(', ')}`,
        `Avoid: ${panchang.avoidFor.slice(0, 3).join(', ')}`,
        `Remedy: ${panchang.personalRemedy}`,
        `Proof: ${panchang.evidence.slice(0, 2).join(' | ')}`,
      ].join('\n'),
      insight,
      buildUpsell(language, 'personal-panchang', hasPremiumAccess),
    ]);
  }

  if (action === 'holistic-reading-rooms') {
    const rooms = composeHolisticReadingRooms(kundli);
    const featured = rooms.featuredRoom;
    return joinSections([
      intro,
      [
        rooms.title,
        rooms.subtitle,
        `Start here: ${featured.title}. ${featured.primaryFocus}`,
        `Practice: ${featured.practice}`,
        `Remedy: ${featured.remedy}`,
        `Proof: ${featured.proofChips.slice(0, 4).join(' | ')}`,
        `Available rooms: ${rooms.rooms.map(room => room.title).join(', ')}`,
      ].join('\n'),
      insight,
      buildUpsell(language, 'holistic-reading-rooms', hasPremiumAccess),
    ]);
  }

  if (action === 'sadhana-remedy-path') {
    const path = composeSadhanaRemedyPath(kundli);
    const activeStage =
      path.stages.find(stage => stage.status === 'active' || stage.status === 'review') ??
      path.stages[0] ??
      {
        cadence: 'Daily',
        caution: 'Keep the practice simple and safe.',
        completionTarget: 'Do one clean action today.',
        id: 'conduct' as const,
        label: 'Conduct',
        practice: 'Correct one behavior before adding any ritual.',
        sequence: 1,
        status: 'active' as const,
        whyItWorks: 'Daily conduct keeps remedies grounded.',
      };
    return joinSections([
      intro,
      [
        path.title,
        path.weeklyIntention,
        `Planet focus: ${path.planet ?? 'Chart-based practice'}`,
        `Why: ${path.planetReason}`,
        `Start with: ${activeStage.label}. ${activeStage.practice}`,
        `Cadence: ${activeStage.cadence}`,
        `Review: ${path.reviewQuestions[0]}`,
        `Boundary: ${path.guardrails[0]}`,
      ].join('\n'),
      insight,
      buildUpsell(language, 'sadhana-remedy-path', hasPremiumAccess),
    ]);
  }

  if (action === 'remedies') {
    const plan = composeRemedyCoach(kundli);
    const holistic = composeHolisticFoundationModel(kundli);
    const top = plan.items[0];
    const focus = holistic.activePlanetFocus[0];
    return joinSections([
      intro,
      top
        ? [
            plan.title,
            focus
              ? `Planet involved: ${focus.planet}. ${focus.whyItMatters}`
              : '',
            top.karmicPattern ? `Karmic pattern: ${top.karmicPattern}` : '',
            `${top.title}: ${top.practice}`,
            top.practicalAction ? `Practical action: ${top.practicalAction}` : '',
            top.mantraDevotion ? `Prayer option: ${top.mantraDevotion}` : '',
            `Cadence: ${top.cadence}`,
            `Why: ${top.rationale}`,
            `Caution: ${top.caution}`,
          ]
            .filter(Boolean)
            .join('\n')
        : `${plan.title}\nNo remedy item is available yet, so I would keep the practice simple: one steady routine, no fear, no paid ritual pressure.`,
      insight,
      upsell,
    ]);
  }

  if (action === 'birth-time') {
    const report = composeBirthTimeDetective(kundli);
    return joinSections([
      intro,
      [
        report.title,
        `Confidence: ${report.confidenceLabel} (${report.confidenceScore}/100)`,
        report.summary,
        `Safe: ${report.safeJudgments.slice(0, 2).join(' | ')}`,
        `Next: ${report.nextAction}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'wrapped') {
    const wrapped = composePredictaWrapped({ kundli });
    return joinSections([
      intro,
      [
        wrapped.title,
        `Year theme: ${wrapped.yearTheme}`,
        `Growth area: ${wrapped.growthArea}`,
        `Hard lesson: ${wrapped.hardLesson}`,
        `Best window: ${wrapped.bestWindow}`,
        `Share-safe: ${
          wrapped.privacyCheck.excludesExactBirthTime &&
          wrapped.privacyCheck.excludesBirthPlace
            ? 'yes'
            : 'needs review'
        }`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'relationship') {
    const other = savedKundlis.find(item => item.id !== kundli.id);
    const mirror = composeRelationshipMirror(kundli, other);
    return joinSections([
      intro,
      other
        ? [
            mirror.headline,
            mirror.overview,
            `Talk this week: ${mirror.howToTalkThisWeek}`,
            `Timing overlap: ${mirror.timingOverlap}`,
          ].join('\n')
        : 'I can build Relationship Mirror here, but I need one more saved Kundli in your vault. Add or create the other person in chat, then say “compare relationship”.',
      insight,
      upsell,
    ]);
  }

  if (action === 'family-map') {
    const family = composeFamilyKarmaMap(
      [kundli, ...savedKundlis.filter(item => item.id !== kundli.id)]
        .slice(0, 5)
        .map((item, index) => ({
          kundli: item,
          relationship: index === 0 ? 'self' : 'other',
        })),
    );
    return joinSections([
      intro,
      [
        family.title,
        family.subtitle,
        family.repeatedThemes[0]
          ? `Repeated theme: ${family.repeatedThemes[0].title} - ${family.repeatedThemes[0].summary}`
          : 'Add one more saved Kundli and I can compare repeated family patterns without blame.',
        family.privacyNote,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'chart') {
    return joinSections([
      intro,
      [
        `${kundli.birthDetails.name}'s chart snapshot`,
        `Lagna: ${kundli.lagna}`,
        `Moon: ${kundli.moonSign} in ${kundli.nakshatra}`,
        `Current dasha: ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
        `Strong houses: ${kundli.ashtakavarga.strongestHouses
          .slice(0, 3)
          .join(', ')}`,
        `Pressure houses: ${kundli.ashtakavarga.weakestHouses
          .slice(0, 3)
          .join(', ')}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'report') {
    const guidance = composeHolisticDailyGuidance(kundli, { language });
    const balance = composePurusharthaLifeBalance(kundli);
    const path = composeSadhanaRemedyPath(kundli);
    const lifeAtlas = composeLifeAtlasReport(kundli, {
      depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    });
    const activeStage =
      path.stages.find(stage => stage.status === 'active' || stage.status === 'review') ??
      path.stages[0];
    return joinSections([
      intro,
      [
        `I staged the report brief for ${kundli.birthDetails.name}.`,
        `Executive signal: ${kundli.lagna} Lagna, ${kundli.moonSign} Moon, ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} timing.`,
        `Holistic spine: ${guidance.headline}`,
        `Daily rhythm: morning - ${guidance.morningPractice}; midday - ${guidance.middayCheck}; evening - ${guidance.eveningReview}`,
        `Life balance: ${balance.dominant.label} leads now; ${balance.needsCare.label} needs steadier care.`,
        `Sadhana: ${activeStage.label} - ${activeStage.practice}`,
        `Life Atlas: ${lifeAtlas.name} is the separate synthesis report. Hidden thread: ${lifeAtlas.hiddenThread}`,
        `Life Atlas signature rule: ${lifeAtlas.signatureNote}`,
        `Life Atlas boundary: it is not placed inside Vedic, KP, Nadi, Numerology, or Signature reports.`,
        `Free report: all charts, dasha, Gochar, Sade Sati, KP/Nadi sections, holistic synthesis, and useful insight.`,
        `Premium PDF bundle: detailed chart synthesis, timing windows, remedies, evidence tables, and report-ready depth.`,
        `Ask “prepare premium PDF bundle” when you want me to deepen it.`,
      ].join('\n'),
      insight,
      buildUpsell(language, 'report', hasPremiumAccess),
    ]);
  }

  return joinSections([
    intro,
    `I understood this as: ${text}. I can keep it inside Predicta and turn it into the right chart-backed workflow.`,
    insight,
    upsell,
  ]);
}

function buildNeedsKundliReply(
  language: SupportedLanguage,
  action: PredictaAppActionId,
): string {
  const actionLabel = labelAction(action);

  if (language === 'hi') {
    return [
      `हाँ, मैं ${actionLabel} यहीं chat में कर सकती हूं.`,
      'पहले आपकी Kundli चाहिए. DOB, birth time और birth place भेज दीजिए; मैं Kundli बनाकर इसी काम को आगे बढ़ाऊंगी.',
      'अगर सिर्फ DOB पता है, वही भेजिए. बाकी मैं आराम से पूछ लूंगी.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      `હા, હું ${actionLabel} અહીં chat માં કરી શકું છું.`,
      'પહેલા તમારી Kundli જોઈએ. DOB, birth time અને birth place મોકલો; હું Kundli બનાવીને આ કામ આગળ વધારીશ.',
      'ફક્ત DOB ખબર હોય તો એ મોકલો. બાકી હું શાંતિથી પૂછી લઈશ.',
    ].join('\n\n');
  }

  return [
    `Yes, I can do ${actionLabel} right here in chat.`,
    'First I need your Kundli. Send date of birth, birth time, and birth place; I will create the Kundli and continue the work here.',
    'If you only know the DOB, send that first. I will ask for the rest gently.',
  ].join('\n\n');
}

function actionIntro(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'हाँ. यह मैं यहीं कर देती हूं.';
  }
  if (language === 'gu') {
    return 'હા. આ હું અહીં જ કરી દઉં છું.';
  }
  return 'Yes. I can do that right here.';
}

function conciergeMenu(
  language: SupportedLanguage,
  hasKundli: boolean,
  hasPremiumAccess: boolean,
): string {
  const premiumLine = hasPremiumAccess
    ? 'Premium is active, so I can go deeper with reports, timing windows, and evidence tables.'
    : 'Premium path: deeper AI, Life Calendar, report bundles, compatibility, and richer proof.';

  if (!hasKundli) {
    return [
      'Start by sending DOB, birth time, and birth place. I will create the Kundli here.',
      'After that I can build Destiny Passport, Mahadasha Intelligence, Life Timeline, Daily Briefing, remedies, Wrapped, Relationship Mirror, Family Karma Map, and PDF report briefs.',
      premiumLine,
    ].join('\n');
  }

  return [
    'I can build your Destiny Passport, Mahadasha Intelligence, Life Timeline, Daily Briefing, Remedy Coach, Birth Time Detective, Wrapped, chart snapshot, report brief, relationship comparison, and family map.',
    premiumLine,
    'My recommendation: start with Destiny Passport, then Life Timeline, then Premium PDF bundle.',
  ].join('\n');
}

function pricingReply(
  language: SupportedLanguage,
  hasPremiumAccess: boolean,
): string {
  if (hasPremiumAccess) {
    return 'Premium is already active. Use it for deeper AI answers, timelines, remedies, report bundles, compatibility, and evidence-heavy readings.';
  }

  if (language === 'hi') {
    return 'Premium का साफ़ रास्ता: Monthly/Yearly deeper AI, timelines, remedies और reports के लिए. One-time PDF अलग purchase के लिए. Day Pass trial के लिए. Compatibility/Marriage report अलग high-intent purchase रहनी चाहिए.';
  }
  if (language === 'gu') {
    return 'Premium નો સાફ રસ્તો: Monthly/Yearly deeper AI, timelines, remedies અને reports માટે. One-time PDF અલગ purchase માટે. Day Pass trial માટે. Compatibility/Marriage report અલગ high-intent purchase રહેવી જોઈએ.';
  }
  return 'Premium path: Monthly/Yearly for deeper AI, Life Calendar, remedies, and reports. One-time Premium PDF for impulse purchase. Day Pass for trial. Compatibility/Marriage report as a separate high-intent purchase.';
}

function buildWowRadarReply({
  kundli,
  language,
  memory,
  savedKundlis,
}: {
  kundli: KundliData;
  language: SupportedLanguage;
  memory: PredictaInteractionMemory;
  savedKundlis: KundliData[];
}): string {
  const current = kundli.dasha.current;
  const strongestHouse = kundli.ashtakavarga.strongestHouses[0];
  const pressureHouse = kundli.ashtakavarga.weakestHouses[0];
  const crowdedHouse = findMostOccupiedHouse(kundli);
  const dashaPlanet = findPlanetByName(kundli, current.mahadasha);
  const antardashaPlanet = findPlanetByName(kundli, current.antardasha);
  const similar = findSimilarSavedKundli(kundli, savedKundlis);
  const themeLine = memory.learnedThemes.length
    ? memory.learnedThemes.slice(0, 3).join(', ')
    : undefined;
  const standoutSignals = [
    `${current.mahadasha}/${current.antardasha} is the active life chapter until ${formatShortDate(
      current.endDate,
    )}.`,
    strongestHouse
      ? `House ${strongestHouse} is one of the strongest support zones.`
      : undefined,
    pressureHouse
      ? `House ${pressureHouse} needs cleaner routines and less impulsive pressure.`
      : undefined,
    crowdedHouse
      ? `House ${crowdedHouse.house} is visually loud because ${crowdedHouse.planets.join(
          ', ',
        )} sit there.`
      : undefined,
    dashaPlanet
      ? `${current.mahadasha} is in house ${dashaPlanet.house}, so its lesson is active through that life area.`
      : undefined,
    antardashaPlanet
      ? `${current.antardasha} adds a sub-theme from house ${antardashaPlanet.house}.`
      : undefined,
  ].filter(Boolean);
  const comparison = similar
    ? `I found a close saved-profile echo: ${similar.kundli.birthDetails.name} shares ${similar.matches.join(
        ', ',
      )}. Not identical, but worth comparing timing gently.`
    : savedKundlis.length > 1
      ? 'I did not find a close duplicate pattern in saved profiles yet, so this chart should be read on its own terms.'
      : 'Add one more family Kundli later and I can compare repeated family patterns instead of reading this chart in isolation.';

  if (language === 'hi') {
    return [
      'Predicta Radar: यह quick “what stands out” scan है, final fate statement नहीं.',
      `Strongest signal: ${current.mahadasha}/${current.antardasha} timing chapter इस chart को अभी drive कर रहा है.`,
      themeLine
        ? `आपके recent questions से pattern दिखता है: ${themeLine}. इसलिए मैं जवाब practical और timing-focused रखूंगी.`
        : 'अभी मैं saved chart और current timing से pattern read कर रही हूं.',
      `Chart proof:\n${standoutSignals.map(signal => `- ${signal}`).join('\n')}`,
      `Memory check: ${comparison}`,
      'Wow move: पूछिए “इस pattern का daily action क्या है?” मैं इसे Gochar, Mahadasha और remedy के साथ simple weekly plan में बदल दूंगी.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'Predicta Radar: આ quick “what stands out” scan છે, final fate statement નથી.',
      `Strongest signal: ${current.mahadasha}/${current.antardasha} timing chapter આ chart ને અત્યારે drive કરે છે.`,
      themeLine
        ? `તમારા recent questions થી pattern દેખાય છે: ${themeLine}. એટલે હું જવાબ practical અને timing-focused રાખીશ.`
        : 'અત્યારે હું saved chart અને current timing થી pattern read કરું છું.',
      `Chart proof:\n${standoutSignals.map(signal => `- ${signal}`).join('\n')}`,
      `Memory check: ${comparison}`,
      'Wow move: પૂછો “આ pattern નું daily action શું છે?” હું તેને Gochar, Mahadasha અને remedy સાથે simple weekly plan માં બદલી દઈશ.',
    ].join('\n\n');
  }

  return [
    'Predicta Radar: this is a quick “what stands out” scan, not a final fate statement.',
    `Strongest signal: the ${current.mahadasha}/${current.antardasha} timing chapter is driving this chart right now.`,
    themeLine
      ? `From your recent questions, I see a pattern: ${themeLine}. I will keep guidance practical and timing-focused.`
      : 'Right now I am reading the saved chart and current timing pattern.',
    `Chart proof:\n${standoutSignals.map(signal => `- ${signal}`).join('\n')}`,
    `Memory check: ${comparison}`,
    'Wow move: ask me “what daily action fits this pattern?” and I will turn this into a simple weekly plan using Gochar, Mahadasha, and remedies.',
  ].join('\n\n');
}

function savedKundlisReply(
  language: SupportedLanguage,
  savedKundlis: KundliData[],
): string {
  const count = savedKundlis.length;
  const names = savedKundlis
    .slice(0, 5)
    .map(kundli => kundli.birthDetails.name)
    .join(', ');

  if (language === 'hi') {
    return count
      ? `आपके पास ${count} saved Kundli profile हैं: ${names}. मैं इन्हें relationship, family map और pattern comparison के लिए use कर सकती हूं.`
      : 'अभी saved Kundli नहीं दिख रही. आप chat में किसी family member की birth details भेजिए, मैं profile बना सकती हूं.';
  }
  if (language === 'gu') {
    return count
      ? `તમારી પાસે ${count} saved Kundli profile છે: ${names}. હું relationship, family map અને pattern comparison માટે તેનો use કરી શકું છું.`
      : 'હજુ saved Kundli દેખાતી નથી. Family member ની birth details chat માં મોકલો, હું profile બનાવી શકું છું.';
  }
  return count
    ? `You have ${count} saved Kundli profile${
        count === 1 ? '' : 's'
      }: ${names}. I can use them for relationship, family map, and pattern comparison.`
    : 'I do not see saved Kundlis yet. Send a family member’s birth details in chat and I can create the profile.';
}

function buildMahadashaReply(
  language: SupportedLanguage,
  dasha: ReturnType<typeof composeMahadashaIntelligence>,
  hasPremiumAccess: boolean,
): string {
  const evidence = dasha.current.evidence
    .slice(0, hasPremiumAccess ? 4 : 3)
    .map(item => `- ${item.title}: ${item.observation}`)
    .join('\n');
  const windows = dasha.timingWindows
    .slice(0, hasPremiumAccess ? 4 : 2)
    .map(item => `- ${item.title}: ${item.timing}`)
    .join('\n');
  const premiumLine = hasPremiumAccess
    ? dasha.current.premiumSynthesis
    : dasha.premiumUnlock;

  if (language === 'hi') {
    return [
      `मैं ${dasha.current.mahadasha}/${dasha.current.antardasha} को dasha timing layer से पढ़ रही हूं.`,
      dasha.current.freeInsight,
      `Confidence: ${dasha.current.confidence}`,
      evidence ? `Proof:\n${evidence}` : '',
      windows ? `Timing windows:\n${windows}` : '',
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `હું ${dasha.current.mahadasha}/${dasha.current.antardasha} ને dasha timing layer થી જોઈ રહી છું.`,
      dasha.current.freeInsight,
      `Confidence: ${dasha.current.confidence}`,
      evidence ? `Proof:\n${evidence}` : '',
      windows ? `Timing windows:\n${windows}` : '',
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `I am reading your ${dasha.current.mahadasha}/${dasha.current.antardasha} from the dasha timing layer.`,
    dasha.current.freeInsight,
    `Confidence: ${dasha.current.confidence}`,
    evidence ? `Proof:\n${evidence}` : '',
    windows ? `Timing windows:\n${windows}` : '',
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildAdvancedJyotishReply(
  language: SupportedLanguage,
  coverage: ReturnType<typeof composeAdvancedJyotishCoverage>,
  hasPremiumAccess: boolean,
): string {
  const modules = coverage.moduleRegistry
    .slice(0, hasPremiumAccess ? 8 : 5)
    .map(item => `- ${item.simpleName}: ${item.freeAccess}`)
    .join('\n');
  const patterns = coverage.yogaDoshaInsights
    .slice(0, hasPremiumAccess ? 5 : 3)
    .map(item => `- ${item.name} (${item.strength}): ${item.summary}`)
    .join('\n');
  const ashtaka = coverage.ashtakavargaDetail
    .slice(0, hasPremiumAccess ? 6 : 3)
    .map(item => `- House ${item.house}: ${item.score} bindus, ${item.tone} - ${item.guidance}`)
    .join('\n');
  const premiumLine = hasPremiumAccess
    ? coverage.premiumPolicy
    : coverage.premiumUnlock;

  if (language === 'hi') {
    return [
      'मैं advanced Jyotish को simple language में रखूंगी, ताकि deeper details confuse न करें.',
      `Birth star: ${coverage.nakshatraInsight.moonNakshatra} pada ${coverage.nakshatraInsight.pada}, lord ${coverage.nakshatraInsight.lord}.`,
      coverage.nakshatraInsight.simpleInsight,
      modules ? `What I am checking:\n${modules}` : '',
      patterns ? `Yogas/care patterns:\n${patterns}` : '',
      ashtaka ? `Ashtakavarga highlights:\n${ashtaka}` : '',
      `Panchang/Muhurta: ${coverage.panchangMuhurta.simpleGuidance}`,
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      'હું advanced Jyotish ને simple language માં રાખીશ, જેથી deeper details confuse ન કરે.',
      `Birth star: ${coverage.nakshatraInsight.moonNakshatra} pada ${coverage.nakshatraInsight.pada}, lord ${coverage.nakshatraInsight.lord}.`,
      coverage.nakshatraInsight.simpleInsight,
      modules ? `હું આ જોઈ રહી છું:\n${modules}` : '',
      patterns ? `Yogas/care patterns:\n${patterns}` : '',
      ashtaka ? `Ashtakavarga highlights:\n${ashtaka}` : '',
      `Panchang/Muhurta: ${coverage.panchangMuhurta.simpleGuidance}`,
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    'I will keep advanced Jyotish simple to understand, with deeper details available when you want them.',
    `Birth star: ${coverage.nakshatraInsight.moonNakshatra} pada ${coverage.nakshatraInsight.pada}, lord ${coverage.nakshatraInsight.lord}.`,
    coverage.nakshatraInsight.simpleInsight,
    modules ? `What I am checking:\n${modules}` : '',
    patterns ? `Yogas/care patterns:\n${patterns}` : '',
    ashtaka ? `Ashtakavarga highlights:\n${ashtaka}` : '',
    `Panchang/Muhurta: ${coverage.panchangMuhurta.simpleGuidance}`,
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildSadeSatiReply(
  language: SupportedLanguage,
  sadeSati: ReturnType<typeof composeSadeSatiIntelligence>,
  hasPremiumAccess: boolean,
): string {
  const evidence = sadeSati.evidence
    .slice(0, hasPremiumAccess ? 4 : 3)
    .map(item => `- ${item.title}: ${item.observation}`)
    .join('\n');
  const windows = sadeSati.windows
    .filter(item => item.status === 'current' || item.status === 'upcoming')
    .slice(0, hasPremiumAccess ? 3 : 1)
    .map(
      item =>
        `- ${item.title}: ${formatShortDate(item.startDate)} to ${formatShortDate(
          item.endDate,
        )}`,
    )
    .join('\n');
  const premiumLine = hasPremiumAccess
    ? sadeSati.premiumSynthesis
    : sadeSati.premiumUnlock;

  if (language === 'hi') {
    return [
      `मैं Saturn को Moon से check कर रही हूं. Status: ${sadeSati.phaseLabel}.`,
      sadeSati.freeInsight,
      `Confidence: ${sadeSati.confidence}`,
      evidence ? `Proof:\n${evidence}` : '',
      windows ? `Timing windows:\n${windows}` : '',
      `Remedy tone: ${sadeSati.remedies[0] ?? 'discipline, seva, and clean commitments.'}`,
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `હું Saturn ને Moon થી check કરી રહી છું. Status: ${sadeSati.phaseLabel}.`,
      sadeSati.freeInsight,
      `Confidence: ${sadeSati.confidence}`,
      evidence ? `Proof:\n${evidence}` : '',
      windows ? `Timing windows:\n${windows}` : '',
      `Remedy tone: ${sadeSati.remedies[0] ?? 'discipline, seva ane clean commitments.'}`,
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `I checked Saturn from your Moon sign. Status: ${sadeSati.phaseLabel}.`,
    sadeSati.freeInsight,
    `Confidence: ${sadeSati.confidence}`,
    evidence ? `Proof:\n${evidence}` : '',
    windows ? `Timing windows:\n${windows}` : '',
    `Remedy tone: ${sadeSati.remedies[0] ?? 'discipline, service, and clean commitments.'}`,
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildTransitGocharReply(
  language: SupportedLanguage,
  gochar: ReturnType<typeof composeTransitGocharIntelligence>,
  hasPremiumAccess: boolean,
): string {
  const opportunities = gochar.topOpportunities
    .slice(0, hasPremiumAccess ? 4 : 2)
    .map(item => `- ${item.headline}: ${item.practicalGuidance}`)
    .join('\n');
  const cautions = gochar.cautionSignals
    .slice(0, hasPremiumAccess ? 4 : 2)
    .map(item => `- ${item.headline}: ${item.practicalGuidance}`)
    .join('\n');
  const cards = gochar.monthlyCards
    .slice(0, hasPremiumAccess ? 4 : 2)
    .map(item => `- ${item.monthLabel}: ${item.title}`)
    .join('\n');
  const premiumLine = hasPremiumAccess
    ? gochar.dashaOverlay
    : gochar.premiumUnlock;

  if (language === 'hi') {
    return [
      `मैं current Gochar को Lagna और Moon दोनों से पढ़ रही हूं. Overall tone: ${gochar.dominantWeight}.`,
      gochar.snapshotSummary,
      opportunities ? `Support signals:\n${opportunities}` : '',
      cautions ? `Caution signals:\n${cautions}` : '',
      cards ? `Planning cards:\n${cards}` : '',
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `હું current Gochar ને Lagna અને Moon બંનેથી જોઈ રહી છું. Overall tone: ${gochar.dominantWeight}.`,
      gochar.snapshotSummary,
      opportunities ? `Support signals:\n${opportunities}` : '',
      cautions ? `Caution signals:\n${cautions}` : '',
      cards ? `Planning cards:\n${cards}` : '',
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `I am reading current Gochar from both Lagna and Moon. Overall tone: ${gochar.dominantWeight}.`,
    gochar.snapshotSummary,
    opportunities ? `Support signals:\n${opportunities}` : '',
    cautions ? `Caution signals:\n${cautions}` : '',
    cards ? `Planning cards:\n${cards}` : '',
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildYearlyHoroscopeReply(
  language: SupportedLanguage,
  yearly: ReturnType<typeof composeYearlyHoroscopeVarshaphal>,
  hasPremiumAccess: boolean,
): string {
  const signals = [
    ...yearly.supportSignals.slice(0, hasPremiumAccess ? 3 : 2),
    ...yearly.cautionSignals.slice(0, hasPremiumAccess ? 3 : 1),
  ]
    .map(item => `- ${item.title}: ${item.interpretation}`)
    .join('\n');
  const cards = yearly.monthlyCards
    .slice(0, hasPremiumAccess ? 4 : 2)
    .map(item => `- ${item.monthLabel}: ${item.title} - ${item.guidance}`)
    .join('\n');
  const premiumLine = hasPremiumAccess
    ? yearly.premiumSynthesis
    : yearly.premiumUnlock;

  if (language === 'hi') {
    return [
      `मैं Varshaphal को D1, dasha और current Gochar के साथ anchor करके पढ़ रही हूं.`,
      `Solar year: ${yearly.yearLabel}. Varsha Lagna: ${yearly.varshaLagna}. Muntha: house ${yearly.munthaHouse} in ${yearly.munthaSign}.`,
      yearly.freeInsight,
      signals ? `Chart proof:\n${signals}` : '',
      cards ? `Yearly planning cards:\n${cards}` : '',
      yearly.dashaOverlay,
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `હું Varshaphal ને D1, dasha અને current Gochar સાથે anchor કરીને જોઈ રહી છું.`,
      `Solar year: ${yearly.yearLabel}. Varsha Lagna: ${yearly.varshaLagna}. Muntha: house ${yearly.munthaHouse} in ${yearly.munthaSign}.`,
      yearly.freeInsight,
      signals ? `Chart proof:\n${signals}` : '',
      cards ? `Yearly planning cards:\n${cards}` : '',
      yearly.dashaOverlay,
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `I am reading Varshaphal anchored to D1, dasha, and current Gochar.`,
    `Solar year: ${yearly.yearLabel}. Varsha Lagna: ${yearly.varshaLagna}. Muntha: house ${yearly.munthaHouse} in ${yearly.munthaSign}.`,
    yearly.freeInsight,
    signals ? `Chart proof:\n${signals}` : '',
    cards ? `Yearly planning cards:\n${cards}` : '',
    yearly.dashaOverlay,
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function kpHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'यह KP Predicta का काम है. मैं regular Parashari Predicta हूं, इसलिए KP को D1/Varga reading के साथ mix नहीं करूंगी.',
      'नीचे “KP Predicta खोलें” दबाइए. मैं आपका original question और active birth profile KP Predicta को दे दूंगी.',
      'वहां KP Predicta अपनी KP Kundli से cusps, star lords, sub lords, significators, ruling planets और event-focused judgment में answer करेगी.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'આ KP Predicta નું કામ છે. હું regular Parashari Predicta છું, એટલે KP ને D1/Varga reading સાથે mix નહીં કરું.',
      'નીચે “KP Predicta ખોલો” દબાવો. હું તમારો original question અને active birth profile KP Predicta ને આપી દઈશ.',
      'ત્યાં KP Predicta પોતાની KP Kundli થી cusps, star lords, sub lords, significators, ruling planets અને event-focused judgment માં જવાબ આપશે.',
    ].join('\n\n');
  }

  return [
    'That belongs to KP Predicta. I am regular Parashari Predicta here, so I will not mix KP with D1/Varga interpretation.',
    'Use “Open KP Predicta” below. I will carry your original question and active birth profile into KP Predicta.',
    'KP Predicta will use the KP Kundli and answer from cusps, star lords, sub lords, significators, ruling planets, and event-focused judgment.',
  ].join('\n\n');
}

function buildBhavChalitReply(
  language: SupportedLanguage,
  foundation: ReturnType<typeof composeChalitBhavKpFoundation>,
  hasPremiumAccess: boolean,
): string {
  const bhav = foundation.bhavChalit;
  const shifts = bhav.shifts
    .slice(0, hasPremiumAccess ? 6 : 3)
    .map(item => {
      const targetHouse = 'chalitHouse' in item ? item.chalitHouse : item.bhavHouse;
      return `- ${item.planet}: D1 house ${item.rashiHouse} to Chalit house ${targetHouse}`;
    })
    .join('\n');
  const synthesis = hasPremiumAccess
    ? bhav.premiumSynthesis ?? bhav.freeInsight
    : bhav.freeInsight;

  if (language === 'hi') {
    return [
      'Chalit Parashari house refinement है. यह KP cusp/sub-lord judgement नहीं है, और D1 Rashi को replace नहीं करता.',
      synthesis,
      shifts ? `House shifts:\n${shifts}` : 'House shifts: no major shift is available in this Kundli yet.',
      foundation.premiumUnlock,
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'Chalit Parashari house refinement છે. આ KP cusp/sub-lord judgement નથી, અને D1 Rashi ને replace નથી કરતું.',
      synthesis,
      shifts ? `House shifts:\n${shifts}` : 'House shifts: આ Kundli માં હજુ major shift available નથી.',
      foundation.premiumUnlock,
    ].join('\n\n');
  }

  return [
    'Chalit is a Parashari house-refinement layer. It is separate from KP cusp/sub-lord judgement, and it does not replace D1 Rashi.',
    synthesis,
    shifts ? `House shifts:\n${shifts}` : 'House shifts: no major shift is available in this Kundli yet.',
    foundation.premiumUnlock,
  ].join('\n\n');
}

function buildKpPredictaReply(
  language: SupportedLanguage,
  foundation: ReturnType<typeof composeChalitBhavKpFoundation>,
  hasPremiumAccess: boolean,
): string {
  const kp = foundation.kp;
  const significators = kp.significators
    .slice(0, hasPremiumAccess ? 6 : 3)
    .map(item => `- ${item.planet}: houses ${item.signifiesHouses.join(', ') || 'pending'} (${item.strength})`)
    .join('\n');
  const cuspLine = kp.cusps
    .slice(0, 3)
    .map(cusp => `Cusp ${cusp.house}: ${cusp.lordChain.starLord}/${cusp.lordChain.subLord}`)
    .join(' | ');
  const ruling = kp.rulingPlanets
    ? `Ruling planets: day ${kp.rulingPlanets.dayLord}, Moon star ${kp.rulingPlanets.moonStarLord}, Lagna sub ${kp.rulingPlanets.lagnaSubLord}.`
    : '';

  if (language === 'hi') {
    return [
      'KP Predicta mode: मैं सिर्फ KP cusps, star lords, sub lords, significators और ruling planets से बोलूंगी.',
      `Event verdict: ${kp.eventJudgement.verdictLabel}. ${kp.eventJudgement.plainLanguage}`,
      kp.freeInsight,
      cuspLine ? `Cusps:\n${cuspLine}` : '',
      significators ? `Significators:\n${significators}` : '',
      ruling,
      hasPremiumAccess ? kp.premiumSynthesis : foundation.premiumUnlock,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      'KP Predicta mode: હું ફક્ત KP cusps, star lords, sub lords, significators અને ruling planets થી બોલીશ.',
      `Event verdict: ${kp.eventJudgement.verdictLabel}. ${kp.eventJudgement.plainLanguage}`,
      kp.freeInsight,
      cuspLine ? `Cusps:\n${cuspLine}` : '',
      significators ? `Significators:\n${significators}` : '',
      ruling,
      hasPremiumAccess ? kp.premiumSynthesis : foundation.premiumUnlock,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    'KP Predicta mode: I will answer only from KP cusps, star lords, sub lords, significators, and ruling planets.',
    `Event verdict: ${kp.eventJudgement.verdictLabel}. ${kp.eventJudgement.plainLanguage}`,
    kp.freeInsight,
    cuspLine ? `Cusps:\n${cuspLine}` : '',
    significators ? `Significators:\n${significators}` : '',
    ruling,
    hasPremiumAccess ? kp.premiumSynthesis : foundation.premiumUnlock,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function nadiHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'यह Nadi Predicta का अलग premium world है. मैं इसे Parashari या KP के साथ mix करके overconfident answer नहीं दूंगी.',
      'नीचे “Nadi Predicta खोलें” दबाइए. मैं आपका question और birth profile Nadi reading room में ले जाऊंगी.',
      'Nadi Predicta planetary story links, karaka themes, validation questions और timing activation से काम करेगी. मैं real manuscript access का claim नहीं करूंगी.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'આ Nadi Predicta નું અલગ premium world છે. હું તેને Parashari કે KP સાથે mix કરીને overconfident answer નહીં આપું.',
      'નીચે “Nadi Predicta ખોલો” દબાવો. હું તમારો question અને birth profile Nadi reading room માં લઈ જઈશ.',
      'Nadi Predicta planetary story links, karaka themes, validation questions અને timing activation થી કામ કરશે. હું real manuscript access નો claim નહીં કરું.',
    ].join('\n\n');
  }

  return [
    'That belongs to Nadi Predicta, a separate premium school. I will not mix it into Parashari or KP or sound more certain than the chart allows.',
    'Use “Open Nadi Predicta” below. I will carry your question and active birth profile into the Nadi reading room.',
    'Nadi Predicta works through planetary story links, karaka themes, validation questions, and timing activation. It does not claim real palm-leaf manuscript access.',
  ].join('\n\n');
}

function buildNadiPredictaReply(
  language: SupportedLanguage,
  kundli: KundliData | undefined,
  hasPremiumAccess: boolean,
): string {
  const plan = composeNadiJyotishPlan(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    language,
  });
  const topPattern = plan.patterns[0];
  const activation = plan.activations[0];
  const validations = plan.validationQuestions.slice(0, hasPremiumAccess ? 3 : 2);
  const limitations = plan.limitations.slice(0, 2);
  const premiumLine = hasPremiumAccess
    ? 'Premium Nadi depth is active: I can sequence the strongest planet links, ask validation questions, and keep timing cautious.'
    : plan.premiumUnlock;

  if (language === 'hi') {
    return [
      'Nadi Predicta mode: मैं planet-to-planet story links, karaka themes, validation questions और timing activation से पढ़ूंगी.',
      `Hidden pattern: ${plan.storyLens.hiddenPatternSentence}`,
      plan.freePreview,
      topPattern
        ? `Strong pattern: ${topPattern.title}. ${topPattern.freeInsight}`
        : undefined,
      activation
        ? `Timing activation: ${activation.title}. ${activation.timing}`
        : undefined,
      validations.length ? `Validation questions:\n${validations.map(item => `- ${item}`).join('\n')}` : undefined,
      limitations.length ? `Boundary:\n${limitations.map(item => `- ${item}`).join('\n')}` : undefined,
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      'Nadi Predicta mode: હું planet-to-planet story links, karaka themes, validation questions અને timing activation થી વાંચીશ.',
      `Hidden pattern: ${plan.storyLens.hiddenPatternSentence}`,
      plan.freePreview,
      topPattern
        ? `Strong pattern: ${topPattern.title}. ${topPattern.freeInsight}`
        : undefined,
      activation
        ? `Timing activation: ${activation.title}. ${activation.timing}`
        : undefined,
      validations.length ? `Validation questions:\n${validations.map(item => `- ${item}`).join('\n')}` : undefined,
      limitations.length ? `Boundary:\n${limitations.map(item => `- ${item}`).join('\n')}` : undefined,
      premiumLine,
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
      'Nadi Predicta mode: I will read through planet-to-planet story links, karaka themes, validation questions, and timing activation.',
      `Hidden pattern: ${plan.storyLens.hiddenPatternSentence}`,
      plan.freePreview,
    topPattern
      ? `Strong pattern: ${topPattern.title}. ${topPattern.freeInsight}`
      : undefined,
    activation
      ? `Timing activation: ${activation.title}. ${activation.timing}`
      : undefined,
    validations.length ? `Validation questions:\n${validations.map(item => `- ${item}`).join('\n')}` : undefined,
    limitations.length ? `Boundary:\n${limitations.map(item => `- ${item}`).join('\n')}` : undefined,
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function numerologyHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'यह Numerology Predicta का काम है. मैं इसे Parashari, KP या Nadi के साथ casually mix नहीं करूंगी.',
      'नीचे “Numerology Predicta खोलें” दबाइए. मैं आपका question और active birth profile वहां ले जाऊंगी.',
      'Numerology Predicta name number, birth number, destiny number, personal year/month/day और name spelling rhythm से answer करेगी.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'આ Numerology Predicta નું કામ છે. હું તેને Parashari, KP કે Nadi સાથે casually mix નહીં કરું.',
      'નીચે “Numerology Predicta ખોલો” દબાવો. હું તમારો question અને active birth profile ત્યાં લઈ જઈશ.',
      'Numerology Predicta name number, birth number, destiny number, personal year/month/day અને name spelling rhythm થી જવાબ આપશે.',
    ].join('\n\n');
  }

  return [
    'That belongs to Numerology Predicta. I will not casually mix it with Parashari, KP, or Nadi methods.',
    'Use “Open Numerology Predicta” below. I will carry your question and active birth profile into the numerology room.',
    'Numerology Predicta reads name number, birth number, destiny number, personal year/month/day, and name spelling rhythm.',
  ].join('\n\n');
}

function buildNumerologyPredictaReply(
  language: SupportedLanguage,
  kundli: KundliData | undefined,
  hasPremiumAccess: boolean,
): string {
  const profile = composeNumerologyFoundationModel(
    kundli?.birthDetails,
    language,
  );

  if (profile.status !== 'ready') {
    if (language === 'hi') {
      return [
        'अंक प्रेडिक्टा तैयार है, लेकिन मुझे पहले नाम और जन्म तिथि चाहिए.',
        'कृपया पूरा नाम और जन्म तिथि भेजें. उसके बाद मैं नाम अंक, जन्म अंक, भाग्य अंक और वर्तमान निजी समय लय निकाल दूंगी.',
      ].join('\n\n');
    }
    if (language === 'gu') {
      return [
        'અંક પ્રેડિક્ટા તૈયાર છે, પરંતુ પહેલાં મને નામ અને જન્મ તારીખ જોઈએ.',
        'કૃપા કરીને પૂરું નામ અને જન્મ તારીખ મોકલો. પછી હું નામ અંક, જન્મ અંક, ભાગ્ય અંક અને વર્તમાન વ્યક્તિગત સમય લય કાઢી દઈશ.',
      ].join('\n\n');
    }
    return [
      'Numerology Predicta is ready, but I need a name and birth date first.',
      'Send the full name and date of birth. Then I can calculate name number, birth number, destiny number, and the current personal timing rhythm.',
    ].join('\n\n');
  }

  const proof = profile.evidence
    .slice(0, hasPremiumAccess ? 4 : 3)
    .map(item => `- ${item}`)
    .join('\n');
  const strengths = profile.strengths.slice(0, 4).join(', ');
  const cautions = profile.cautions.slice(0, 3).join(', ');
  const premiumLine = hasPremiumAccess
    ? 'Premium depth is active: I can compare spelling options, monthly timing, compatibility numbers, and report-ready synthesis.'
    : 'Free insight stays useful. Premium adds spelling comparison, yearly/monthly timing, compatibility numbers, and a polished numerology report.';
  const hindiProof = [
    `- नाम अंक ${profile.nameNumber.root} ${profile.method.nameNumber} पद्धति से "${profile.normalizedName}" पर निकला है.`,
    `- जन्म अंक ${profile.birthNumber.root} जन्म दिन ${profile.birthDate} से निकला है.`,
    `- भाग्य अंक ${profile.destinyNumber.root} पूरी जन्म तिथि ${profile.birthDate} से निकला है.`,
    hasPremiumAccess
      ? `- निजी वर्ष/महीना/दिन ${profile.targetDate} के लिए निकाले गए हैं.`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const gujaratiProof = [
    `- નામ અંક ${profile.nameNumber.root} ${profile.method.nameNumber} પદ્ધતિથી "${profile.normalizedName}" પરથી નીકળ્યો છે.`,
    `- જન્મ અંક ${profile.birthNumber.root} જન્મ દિવસ ${profile.birthDate} પરથી નીકળ્યો છે.`,
    `- ભાગ્ય અંક ${profile.destinyNumber.root} આખી જન્મ તારીખ ${profile.birthDate} પરથી નીકળ્યો છે.`,
    hasPremiumAccess
      ? `- વ્યક્તિગત વર્ષ/મહિનો/દિવસ ${profile.targetDate} માટે કાઢવામાં આવ્યા છે.`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  if (language === 'hi') {
    return [
      'अंक प्रेडिक्टा मोड: मैं नाम और जन्म-तिथि अंकों से पढ़ूंगी. जब तक आप संयुक्त सार न मांगें, वैदिक, KP या नाड़ी तर्क नहीं मिलाऊंगी.',
      `${profile.name}: नाम अंक ${profile.nameNumber.root} (${profile.nameNumber.label}), जन्म अंक ${profile.birthNumber.root} (${profile.birthNumber.label}), भाग्य अंक ${profile.destinyNumber.root} (${profile.destinyNumber.label}).`,
      `वर्तमान लय: निजी वर्ष ${profile.personalYear.root}, महीना ${profile.personalMonth.root}, दिन ${profile.personalDay.root}.`,
      `उपयोगी समझ: ${profile.name} में ${numerologyNativeKeyword(
        'hi',
        profile.nameNumber.root,
      )}, ${numerologyNativeKeyword(
        'hi',
        profile.birthNumber.root,
      )} और ${numerologyNativeKeyword(
        'hi',
        profile.destinyNumber.root,
      )} की संयुक्त लय दिखती है. आज निजी दिन ${profile.personalDay.root} की दिशा में चल रहा है.`,
      `ताकतें: ${[
        numerologyNativeKeyword('hi', profile.nameNumber.root),
        numerologyNativeKeyword('hi', profile.birthNumber.root),
        numerologyNativeKeyword('hi', profile.destinyNumber.root),
      ].join(', ')}`,
      `ध्यान बिंदु: ${[
        numerologyNativeCaution('hi', profile.nameNumber.root),
        numerologyNativeCaution('hi', profile.personalYear.root),
      ].join(', ')}`,
      `अंक प्रमाण:\n${hindiProof}`,
      hasPremiumAccess
        ? 'प्रीमियम गहराई सक्रिय है: मैं नाम की अलग-अलग वर्तनी, मासिक समय, संगतता अंक और रिपोर्ट-तैयार सार की तुलना कर सकती हूं.'
        : 'मुफ्त समझ उपयोगी रहेगी. प्रीमियम में नाम-वर्तनी तुलना, वार्षिक/मासिक समय, संगतता अंक और सुंदर अंक-रिपोर्ट मिलती है.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      'અંક પ્રેડિક્ટા મોડ: હું નામ અને જન્મ-તારીખના અંકો પરથી વાંચીશ. જ્યાં સુધી તમે સંયુક્ત સાર ન માગો, ત્યાં સુધી વૈદિક, KP કે નાડી તર્ક ભેળવીશ નહીં.',
      `${profile.name}: નામ અંક ${profile.nameNumber.root} (${profile.nameNumber.label}), જન્મ અંક ${profile.birthNumber.root} (${profile.birthNumber.label}), ભાગ્ય અંક ${profile.destinyNumber.root} (${profile.destinyNumber.label}).`,
      `વર્તમાન લય: વ્યક્તિગત વર્ષ ${profile.personalYear.root}, મહિનો ${profile.personalMonth.root}, દિવસ ${profile.personalDay.root}.`,
      `ઉપયોગી સમજ: ${profile.name} માં ${numerologyNativeKeyword(
        'gu',
        profile.nameNumber.root,
      )}, ${numerologyNativeKeyword(
        'gu',
        profile.birthNumber.root,
      )} અને ${numerologyNativeKeyword(
        'gu',
        profile.destinyNumber.root,
      )} ની સંયુક્ત લય દેખાય છે. આજે વ્યક્તિગત દિવસ ${profile.personalDay.root} ની દિશામાં ચાલે છે.`,
      `તાકાતો: ${[
        numerologyNativeKeyword('gu', profile.nameNumber.root),
        numerologyNativeKeyword('gu', profile.birthNumber.root),
        numerologyNativeKeyword('gu', profile.destinyNumber.root),
      ].join(', ')}`,
      `ધ્યાન રાખવાના મુદ્દા: ${[
        numerologyNativeCaution('gu', profile.nameNumber.root),
        numerologyNativeCaution('gu', profile.personalYear.root),
      ].join(', ')}`,
      `અંક આધાર:\n${gujaratiProof}`,
      hasPremiumAccess
        ? 'પ્રીમિયમ ઊંડાણ સક્રિય છે: હું નામની જુદી-જુદી જોડણી, માસિક સમય, સુસંગતતા અંક અને રિપોર્ટ-તૈયાર સારની તુલના કરી શકું છું.'
        : 'મફત સમજ ઉપયોગી રહેશે. પ્રીમિયમમાં નામ-જોડણી તુલના, વાર્ષિક/માસિક સમય, સુસંગતતા અંક અને સુંદર અંક-રિપોર્ટ મળે છે.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    'Numerology Predicta mode: I will read from name and DOB numbers, not Parashari, KP, or Nadi logic unless you ask for synthesis.',
    `${profile.name}: name number ${profile.nameNumber.root} (${profile.nameNumber.label}), birth number ${profile.birthNumber.root} (${profile.birthNumber.label}), destiny number ${profile.destinyNumber.root} (${profile.destinyNumber.label}).`,
    `Current rhythm: personal year ${profile.personalYear.root}, month ${profile.personalMonth.root}, day ${profile.personalDay.root}.`,
    `Useful insight: ${profile.summary}`,
    strengths ? `Strengths: ${strengths}` : '',
    cautions ? `Care points: ${cautions}` : '',
    proof ? `Number proof:\n${proof}` : '',
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function shouldPreferNumerologyRoomLanguage({
  action,
  explicitLanguage,
  predictaSchool,
  selectedLanguage,
}: {
  action: PredictaAppActionId | undefined;
  explicitLanguage: SupportedLanguage | undefined;
  predictaSchool: PredictaSchool | undefined;
  selectedLanguage: SupportedLanguage;
}): boolean {
  return (
    (action === 'numerology-predicta' || action === 'signature-predicta') &&
    (predictaSchool === 'NUMEROLOGY' || predictaSchool === 'SIGNATURE') &&
    explicitLanguage === undefined &&
    (selectedLanguage === 'hi' || selectedLanguage === 'gu')
  );
}

function numerologyNativeKeyword(
  language: SupportedLanguage,
  root: number,
): string {
  const hindi: Record<number, string> = {
    1: 'नेतृत्व और नई शुरुआत',
    2: 'सहयोग और भावनात्मक समझ',
    3: 'अभिव्यक्ति और रचनात्मकता',
    4: 'व्यवस्था और अनुशासन',
    5: 'बदलाव और अनुकूलन',
    6: 'जिम्मेदारी और परिवार-भाव',
    7: 'गहराई और खोज',
    8: 'प्रबंधन और कर्म-फल',
    9: 'सेवा और पूर्णता',
  };
  const gujarati: Record<number, string> = {
    1: 'નેતૃત્વ અને નવી શરૂઆત',
    2: 'સહકાર અને ભાવનાત્મક સમજ',
    3: 'અભિવ્યક્તિ અને સર્જનાત્મકતા',
    4: 'વ્યવસ્થા અને અનુશાસન',
    5: 'બદલાવ અને અનુકૂલન',
    6: 'જવાબદારી અને પરિવારભાવ',
    7: 'ઊંડાણ અને શોધ',
    8: 'વ્યવસ્થાપન અને કર્મફળ',
    9: 'સેવા અને પૂર્ણતા',
  };

  return language === 'gu'
    ? gujarati[root] ?? gujarati[1]
    : hindi[root] ?? hindi[1];
}

function numerologyNativeCaution(
  language: SupportedLanguage,
  root: number,
): string {
  const hindi: Record<number, string> = {
    1: 'अहंकार या जल्दीबाज़ी से बचें',
    2: 'अति-संवेदनशीलता से बचें',
    3: 'बिखरे फोकस से बचें',
    4: 'कठोरता और अति-मेहनत से बचें',
    5: 'बेचैनी और जल्दबाज़ फैसलों से बचें',
    6: 'अति-जिम्मेदारी से बचें',
    7: 'अति-विश्लेषण और अलगाव से बचें',
    8: 'नियंत्रण और धन-दबाव से बचें',
    9: 'भावनात्मक अतिरेक से बचें',
  };
  const gujarati: Record<number, string> = {
    1: 'અહંકાર અથવા ઉતાવળથી બચો',
    2: 'અતિ-સંવેદનશીલતાથી બચો',
    3: 'વિખરાયેલા ધ્યાનથી બચો',
    4: 'કઠોરતા અને અતિ-મહેનતથી બચો',
    5: 'બેચેની અને ઉતાવળિયા નિર્ણયથી બચો',
    6: 'અતિ-જવાબદારીથી બચો',
    7: 'અતિ-વિશ્લેષણ અને અલગાવથી બચો',
    8: 'નિયંત્રણ અને નાણાંના દબાણથી બચો',
    9: 'ભાવનાત્મક અતિરેકથી બચો',
  };

  return language === 'gu'
    ? gujarati[root] ?? gujarati[1]
    : hindi[root] ?? hindi[1];
}

function signatureHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'यह Signature Predicta का काम है. मैं इसे Kundli, KP, Nadi या Numerology के साथ casually mix नहीं करूंगी.',
      'नीचे “Signature Predicta खोलें” दबाइए. मैं आपका question वहां ले जाऊंगी.',
      'Signature Predicta confirmed visual traits, self-expression pattern और practical improvement suggestions से answer करेगी. यह identity verification, handwriting forensics, legal proof, medical diagnosis, hiring advice या guaranteed prediction नहीं है.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'આ Signature Predicta નું કામ છે. હું તેને Kundli, KP, Nadi કે Numerology સાથે casually mix નહીં કરું.',
      'નીચે “Signature Predicta ખોલો” દબાવો. હું તમારો question ત્યાં લઈ જઈશ.',
      'Signature Predicta confirmed visual traits, self-expression pattern અને practical improvement suggestions થી જવાબ આપશે. આ identity verification, handwriting forensics, legal proof, medical diagnosis, hiring advice કે guaranteed prediction નથી.',
    ].join('\n\n');
  }

  return [
    'That belongs to Signature Predicta. I will not casually mix it with Kundli, KP, Nadi, or Numerology methods.',
    'Use “Open Signature Predicta” below. I will carry your question into the signature room.',
    'Signature Predicta reads confirmed visual traits, self-expression patterns, and practical improvement suggestions. It is not identity verification, handwriting forensics, legal proof, medical diagnosis, hiring advice, or a guaranteed prediction.',
  ].join('\n\n');
}

function vedicHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'यह Vedic Predicta का chart-reading question है. मैं इसे KP, Nadi, Numerology या Signature method के अंदर mix करके answer नहीं दूंगी.',
      'नीचे “Vedic Predicta खोलें” दबाइए. मैं आपका question और active Kundli Vedic room में ले जाऊंगी.',
      'Vedic Predicta D1/Rashi, Vargas, dasha, gochar, Parashari Chalit, yogas, remedies, aur holistic timing se answer karegi.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'આ Vedic Predicta નો chart-reading question છે. હું તેને KP, Nadi, Numerology કે Signature method માં mix કરીને answer નહીં આપું.',
      'નીચે “Vedic Predicta ખોલો” દબાવો. હું તમારો question અને active Kundli Vedic room માં લઈ જઈશ.',
      'Vedic Predicta D1/Rashi, Vargas, dasha, gochar, Parashari Chalit, yogas, remedies અને holistic timing થી જવાબ આપશે.',
    ].join('\n\n');
  }

  return [
    'That belongs to Vedic Predicta. I will not answer a D1, varga, dasha, gochar, or Parashari chart question from the wrong specialist room.',
    'Use “Open Vedic Predicta” below. I will carry your question and active Kundli into the Vedic room.',
    'Vedic Predicta reads D1/Rashi, Vargas, dasha, gochar, Parashari Chalit, yogas, remedies, and holistic timing.',
  ].join('\n\n');
}

function buildSignaturePredictaReply(
  language: SupportedLanguage,
  text: string,
  hasPremiumAccess: boolean,
): string {
  const analysis = composeSignatureAnalysisModel({
    inputSource: 'manual-observation',
    observedTraits: extractSignatureTraitsFromPromptText(text),
  });
  const promptHasConfirmedTraits = /signature\s*predicta\s*context|observed\s*traits|confirmed\s*signature\s*traits/i.test(
    text,
  );
  const premiumLine = hasPremiumAccess
    ? 'Premium depth is active: I can compare repeated signature samples, name rhythm, numerology, and Kundli context only when you explicitly ask for synthesis.'
    : 'Free insight stays useful. Premium adds deeper comparison, name rhythm, optional numerology/Kundli synthesis, and a polished signature report.';

  if (language === 'hi') {
    if (analysis.status === 'ready') {
      return [
        'हस्ताक्षर प्रेडिक्टा मोड: मैं केवल पक्के दिखने वाले हस्ताक्षर संकेतों से पढ़ूंगी, अनुमान नहीं लगाऊंगी.',
        `देखे गए संकेत: ${analysis.observedTraits.map(trait => `${trait.label} ${trait.value}`).join(', ')}.`,
        `लिखने की लय: ${analysis.rhythm.summary}`,
        `आत्मविश्वास की अभिव्यक्ति: ${analysis.confidenceExpression.summary}`,
        `स्थिरता: ${analysis.consistency.summary}`,
        `सुधार योजना: ${analysis.improvementPlan.slice(0, 3).join(' ')}`,
        analysis.synthesisReadiness.rule,
        buildSignatureSafetyReply(language),
        hasPremiumAccess
          ? 'प्रीमियम गहराई सक्रिय है: मैं दोहराए गए हस्ताक्षर नमूने, नाम-लय, अंक और Kundli context की तुलना तभी करूंगी जब आप संयुक्त सार मांगें.'
          : 'मुफ्त समझ उपयोगी रहेगी. प्रीमियम में गहरी तुलना, नाम-लय, वैकल्पिक numerology/Kundli synthesis और polished signature report मिलती है.',
      ].join('\n\n');
    }
    return [
      'हस्ताक्षर प्रेडिक्टा मोड: मैं हस्ताक्षर को आत्म-अभिव्यक्ति और निजी लय की परत की तरह पढ़ूंगी.',
      promptHasConfirmedTraits
        ? 'आपके पक्के हस्ताक्षर संकेत मिल गए हैं. मैं उन्हीं संकेतों से पढ़ूंगी, अनुमान नहीं लगाऊंगी.'
        : 'पहले हस्ताक्षर upload/draw करें या दिखने वाले संकेत confirm करें: आकार, झुकाव, दबाव, दूरी, आधार-रेखा, पढ़ने की साफगोई, सजावट और underline.',
      'मैं सुधार सुझाव दे सकती हूं: साफ readability, steady baseline, balanced size, calm spacing और confidence-friendly rhythm.',
      buildSignatureSafetyReply(language),
      hasPremiumAccess
        ? 'प्रीमियम गहराई सक्रिय है: मैं दोहराए गए हस्ताक्षर नमूने, नाम-लय, अंक और Kundli context की तुलना तभी करूंगी जब आप संयुक्त सार मांगें.'
        : 'मुफ्त समझ उपयोगी रहेगी. प्रीमियम में गहरी तुलना, नाम-लय, वैकल्पिक numerology/Kundli synthesis और polished signature report मिलती है.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    if (analysis.status === 'ready') {
      return [
        'હસ્તાક્ષર પ્રેડિક્ટા મોડ: હું માત્ર પક્કા દેખાતા હસ્તાક્ષર સંકેતોથી વાંચીશ, અંદાજ નહીં લગાવું.',
        `જોવાયેલા સંકેતો: ${analysis.observedTraits.map(trait => `${trait.label} ${trait.value}`).join(', ')}.`,
        `લખવાની લય: ${analysis.rhythm.summary}`,
        `આત્મવિશ્વાસની અભિવ્યક્તિ: ${analysis.confidenceExpression.summary}`,
        `સ્થિરતા: ${analysis.consistency.summary}`,
        `સુધાર યોજના: ${analysis.improvementPlan.slice(0, 3).join(' ')}`,
        analysis.synthesisReadiness.rule,
        buildSignatureSafetyReply(language),
        hasPremiumAccess
          ? 'પ્રીમિયમ ઊંડાણ સક્રિય છે: હું વારંવારના હસ્તાક્ષર નમૂનાઓ, નામ-લય, અંક અને Kundli context ની તુલના ત્યારે જ કરીશ જ્યારે તમે સંયુક્ત સાર માગો.'
          : 'મફત સમજ ઉપયોગી રહેશે. પ્રીમિયમમાં ઊંડી તુલના, નામ-લય, વૈકલ્પિક numerology/Kundli synthesis અને polished signature report મળે છે.',
      ].join('\n\n');
    }
    return [
      'હસ્તાક્ષર પ્રેડિક્ટા મોડ: હું હસ્તાક્ષરને સ્વ-અભિવ્યક્તિ અને વ્યક્તિગત લયની પરત તરીકે વાંચીશ.',
      promptHasConfirmedTraits
        ? 'તમારા પક્કા હસ્તાક્ષર સંકેતો મળી ગયા છે. હું એ સંકેતો પરથી વાંચીશ, અંદાજ નહીં લગાવું.'
        : 'પહેલા હસ્તાક્ષર upload/draw કરો અથવા દેખાતા સંકેતો confirm કરો: કદ, ઝુકાવ, દબાણ, અંતર, આધાર-રેખા, વાંચવાની સ્પષ્ટતા, શણગાર અને underline.',
      'હું સુધાર સૂચનો આપી શકું છું: સ્પષ્ટ readability, steady baseline, balanced size, calm spacing અને confidence-friendly rhythm.',
      buildSignatureSafetyReply(language),
      hasPremiumAccess
        ? 'પ્રીમિયમ ઊંડાણ સક્રિય છે: હું વારંવારના હસ્તાક્ષર નમૂનાઓ, નામ-લય, અંક અને Kundli context ની તુલના ત્યારે જ કરીશ જ્યારે તમે સંયુક્ત સાર માગો.'
        : 'મફત સમજ ઉપયોગી રહેશે. પ્રીમિયમમાં ઊંડી તુલના, નામ-લય, વૈકલ્પિક numerology/Kundli synthesis અને polished signature report મળે છે.',
    ].join('\n\n');
  }

  if (analysis.status === 'ready') {
    return [
      'Signature Predicta mode: I will read only from the confirmed signature traits, not hidden identity or document authenticity.',
      `Observed traits: ${analysis.observedTraits.map(trait => `${trait.label} ${trait.value}`).join(', ')}.`,
      `Writing rhythm: ${analysis.rhythm.summary}`,
      `Confidence expression: ${analysis.confidenceExpression.summary}`,
      `Consistency: ${analysis.consistency.summary}`,
      `Improvement plan: ${analysis.improvementPlan.slice(0, 4).join(' ')}`,
      analysis.synthesisReadiness.rule,
      analysis.safetyBoundaries.join(' '),
      premiumLine,
    ].join('\n\n');
  }

  return [
    'Signature Predicta mode: I will read the signature as a self-expression and personal rhythm layer.',
    promptHasConfirmedTraits
      ? 'I have the confirmed signature traits. I will read only from those traits, not guess from hidden identity or document authenticity.'
      : 'First upload/draw a signature or confirm visible traits: size, slant, pressure, spacing, baseline, legibility, flourish, and underline.',
    'I can suggest improvements for clearer readability, steadier baseline, balanced size, calmer spacing, and more confident visual rhythm.',
    analysis.safetyBoundaries.join(' '),
    premiumLine,
  ].join('\n\n');
}

function buildSignatureSafetyReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'हस्ताक्षर प्रेडिक्टा केवल चिंतन और आत्म-समझ के लिए है.',
      'यह पहचान सत्यापन, फॉरेंसिक लिखावट जांच, कानूनी प्रमाण, नियुक्ति सलाह, चिकित्सा निदान या मानसिक-स्वास्थ्य निदान नहीं है.',
      'हर अर्थ को नरम संकेत मानें, चरित्र या भविष्य की पक्की बात नहीं.',
      'कच्ची हस्ताक्षर छवि संग्रहित नहीं होती; सत्र बंद होने पर फिर से अपलोड या ड्रॉ करना पड़ सकता है.',
    ].join(' ');
  }

  if (language === 'gu') {
    return [
      'હસ્તાક્ષર પ્રેડિક્ટા માત્ર વિચાર અને સ્વ-સમજ માટે છે.',
      'આ ઓળખ ચકાસણી, ફોરેન્સિક લખાણ તપાસ, કાનૂની પુરાવો, ભરતી સલાહ, તબીબી નિદાન અથવા માનસિક-આરોગ્ય નિદાન નથી.',
      'દરેક અર્થને નરમ સંકેત માનો, સ્વભાવ કે ભવિષ્યની પક્કી વાત નહીં.',
      'કાચી સહીની છબી સંગ્રહિત થતી નથી; સત્ર બંધ થાય તો ફરી અપલોડ અથવા ડ્રૉ કરવાની જરૂર પડી શકે.',
    ].join(' ');
  }

  return SIGNATURE_ANALYSIS_SAFETY_BOUNDARIES.join(' ');
}

function extractSignatureTraitsFromPromptText(
  text: string,
): Partial<Record<SignatureTraitKey, SignatureTraitValue>> {
  const normalized = text.toLowerCase();
  const controls: Array<{
    key: SignatureTraitKey;
    labels: string[];
    values: SignatureTraitValue[];
  }> = [
    {
      key: 'baseline',
      labels: ['baseline'],
      values: ['upward', 'steady', 'mixed', 'downward'],
    },
    {
      key: 'capital-emphasis',
      labels: ['capital emphasis', 'capital'],
      values: ['high', 'medium', 'low'],
    },
    {
      key: 'flourish',
      labels: ['flourish'],
      values: ['expansive', 'moderate', 'none'],
    },
    {
      key: 'legibility',
      labels: ['legibility', 'readability'],
      values: ['clear', 'partial', 'abstract'],
    },
    {
      key: 'letter-connection',
      labels: ['letter connection', 'connection', 'letters'],
      values: ['connected', 'mixed', 'disconnected'],
    },
    {
      key: 'margin-use',
      labels: ['space use', 'margin use', 'margin'],
      values: ['balanced', 'compact', 'expansive'],
    },
    {
      key: 'pressure',
      labels: ['pressure'],
      values: ['heavy', 'medium', 'light'],
    },
    {
      key: 'signature-size',
      labels: ['signature size', 'size'],
      values: ['large', 'medium', 'small'],
    },
    {
      key: 'slant',
      labels: ['slant'],
      values: ['right', 'steady', 'mixed', 'left'],
    },
    {
      key: 'spacing',
      labels: ['spacing'],
      values: ['balanced', 'tight', 'wide'],
    },
    {
      key: 'speed',
      labels: ['writing rhythm', 'speed', 'rhythm'],
      values: ['fast', 'moderate', 'slow'],
    },
    {
      key: 'underline',
      labels: ['underline'],
      values: ['high', 'single', 'none'],
    },
  ];
  const traits: Partial<Record<SignatureTraitKey, SignatureTraitValue>> = {};

  for (const control of controls) {
    const labelPattern = control.labels
      .map(label => label.replace(/\s+/g, '\\s+'))
      .join('|');
    for (const value of control.values) {
      const valuePattern = value.replace(/\s+/g, '\\s+');
      const directPattern = new RegExp(
        `(?:${labelPattern})\\s*[:=-]?\\s*${valuePattern}\\b`,
        'i',
      );
      const reversePattern = new RegExp(
        `${valuePattern}\\s+(?:${labelPattern})\\b`,
        'i',
      );
      if (directPattern.test(normalized) || reversePattern.test(normalized)) {
        traits[control.key] = value;
        break;
      }
    }
  }

  return traits;
}

function buildMemoryInsight(
  language: SupportedLanguage,
  memory: PredictaInteractionMemory | undefined,
  kundli: KundliData | undefined,
  savedKundlis: KundliData[],
): string {
  if (!kundli) {
    if (!memory?.learnedThemes.length) {
      return '';
    }
    const themes = memory.learnedThemes.slice(0, 3).join(', ');
    if (language === 'hi') {
      return `मैं आपका pattern learn कर रही हूं: ${themes}.`;
    }
    if (language === 'gu') {
      return `હું તમારો pattern learn કરી રહી છું: ${themes}.`;
    }
    return `I am learning your pattern: ${themes}.`;
  }

  const similar = findSimilarSavedKundli(kundli, savedKundlis);

  if (similar) {
    const line = `I noticed a close chart pattern in saved profiles: ${
      similar.kundli.birthDetails.name
    } shares ${similar.matches.join(
      ', ',
    )} with this Kundli. Not identical, but close enough that I would compare timing carefully.`;

    if (language === 'hi') {
      return `मेरी local memory में एक close chart pattern दिखा: ${
        similar.kundli.birthDetails.name
      } में ${similar.matches.join(
        ', ',
      )} similar है. Identical नहीं, लेकिन comparison useful रहेगा.`;
    }
    if (language === 'gu') {
      return `મારી local memory માં close chart pattern દેખાયું: ${
        similar.kundli.birthDetails.name
      } માં ${similar.matches.join(
        ', ',
      )} similar છે. Identical નથી, પણ comparison useful રહેશે.`;
    }
    return line;
  }

  if (memory?.chartSignatures.includes(chartSignature(kundli))) {
    if (language === 'hi') {
      return `मुझे अब यह chart signature याद है: ${chartSignature(
        kundli,
      )}. जैसे-जैसे और Kundlis vault में आएंगी, मैं pattern comparison automatically करूंगी.`;
    }
    if (language === 'gu') {
      return `મને આ chart signature હવે યાદ છે: ${chartSignature(
        kundli,
      )}. જેમ-જેમ વધુ Kundlis vault માં આવશે, હું pattern comparison automatically કરીશ.`;
    }
    return `I remember this chart signature now: ${chartSignature(
      kundli,
    )}. As more Kundlis enter your vault, I will compare this pattern automatically.`;
  }

  if (language === 'hi') {
    return `मैं इस chart signature को memory में add कर रही हूं: ${chartSignature(
      kundli,
    )}.`;
  }
  if (language === 'gu') {
    return `હું આ chart signature memory માં add કરી રહી છું: ${chartSignature(
      kundli,
    )}.`;
  }
  return `I am adding this chart signature to memory: ${chartSignature(
    kundli,
  )}.`;
}

function buildUpsell(
  language: SupportedLanguage,
  action: PredictaAppActionId,
  hasPremiumAccess: boolean,
): string {
  if (hasPremiumAccess) {
    return 'Since Premium is active, I can deepen this with evidence tables, timing windows, and a report-ready synthesis.';
  }

  const suggestion =
    action === 'report'
      ? 'Turn this into a polished PDF when you want the full version.'
      : action === 'advanced-jyotish'
      ? 'Advanced Mode adds deeper yoga/dosha scoring, nakshatra depth, Ashtakavarga tables, muhurta planning, compatibility synthesis, Prashna workflow, and safe remedy schedules.'
      : action === 'mahadasha'
      ? 'Turn this into a Dasha Life Map when you want Antardasha/Pratyantardasha detail, dasha-transit overlap, remedies, and timing windows.'
      : action === 'sade-sati'
      ? 'Turn this into a Sade Sati plan when you want Saturn phase windows, Ashtakavarga support, monthly planning, remedies, and report-grade guidance.'
      : action === 'transit-gochar'
      ? 'Turn this into a 12-month Gochar calendar when you want all-planet synthesis, dasha overlay, remedies, and timing notes.'
      : action === 'yearly-horoscope'
      ? 'Turn this into a yearly horoscope map when you want 12-month Varshaphal planning, dasha-Gochar overlap, remedies, and annual guidance.'
      : action === 'bhav-chalit'
      ? 'Turn this into a deeper Chalit reading when you want house delivery, shifted planet analysis, dasha relevance, and report-grade proof.'
      : action === 'kp-predicta'
      ? 'Turn this into a KP event reading when you want cusp-by-cusp sub-lord judgment, significator strength, ruling-planet checks, dasha support, and event-focused report depth.'
      : action === 'nadi-predicta'
      ? 'Turn this into a Nadi pattern reading when you want planet-to-planet story sequencing, validation questions, timing activation, remedies, and a separate Nadi report.'
      : action === 'numerology-predicta'
      ? 'Turn this into a numerology life map when you want name spelling comparison, personal year/month/day planning, compatibility numbers, and a polished report.'
      : action === 'signature-predicta'
      ? 'Turn this into a signature expression report when you want deeper trait comparison, improvement practices, name rhythm, and optional Kundli or numerology synthesis.'
      : action === 'life-timeline'
      ? 'Turn this into a Life Calendar when you want monthly dasha/transit cards with reminders.'
      : action === 'holistic-daily-guidance'
      ? 'Turn this daily rhythm into a Life Calendar when you want reminders, deeper dasha-Gochar overlap, remedy tracking, and daily planning.'
      : action === 'purushartha'
      ? 'Turn this life balance into monthly Dharma, Artha, Kama, and Moksha guidance with remedies and timing windows.'
      : action === 'personal-panchang'
      ? 'Turn this into a personal muhurta planner when you want daily Panchang, dasha, Gochar, reminders, and timing notes.'
      : action === 'holistic-reading-rooms'
      ? 'Turn these rooms into guided monthly rooms with deeper chart proof, remedy tracking, and synthesis.'
      : action === 'sadhana-remedy-path'
      ? 'Turn this into a guided sadhana calendar with reminders, review points, and deeper planet-by-planet remedy tracking.'
      : action === 'relationship'
      ? 'Compatibility/Marriage report is a high-value separate purchase for this.'
      : 'Turn this into a deeper map when you want proof, timing confidence, and report-grade synthesis.';

  if (language === 'hi') {
    return `Go deeper option: ${suggestion} पहले free answer useful रहेगा; detailed map चाहिए तब Premium, Day Pass या one-time report choose करें.`;
  }
  if (language === 'gu') {
    return `Go deeper option: ${suggestion} પહેલા free answer useful રહેશે; detailed map જોઈએ ત્યારે Premium, Day Pass અથવા one-time report choose કરો.`;
  }
  return `Go deeper option: ${suggestion} The free answer stays useful first; choose Premium, a Day Pass, or a one-time report only when you want the detailed map.`;
}

function pickNextSuggestion(
  memory: PredictaInteractionMemory | undefined,
  kundli: KundliData | undefined,
  savedKundlis: KundliData[],
  hasPremiumAccess: boolean,
): string {
  if (!kundli) {
    return 'create your Kundli from birth details';
  }

  const counts = memory?.actionCounts ?? {};

  if (!counts['destiny-passport']) {
    return 'create your Destiny Passport';
  }
  if (!counts['wow-radar']) {
    return 'run Predicta Radar and show what stands out first';
  }
  if (!counts['life-timeline']) {
    return 'build your Life Timeline';
  }
  if (!counts.remedies) {
    return 'start Remedy Coach';
  }
  if (savedKundlis.length > 1 && !counts.relationship) {
    return 'compare a relationship or family pattern';
  }
  if (!hasPremiumAccess) {
    return 'preview the Premium PDF bundle';
  }
  return 'turn this into an astrologer-grade advanced reading';
}

function inferThemes(text: string, action?: PredictaAppActionId): string[] {
  const normalized = text.toLowerCase();
  const themes: string[] = [];

  if (action) {
    themes.push(labelAction(action));
  }
  if (/\b(wow|surprise|hidden\s*pattern|hidden\s*strength|what\s*stands\s*out|what\s*do\s*you\s*notice|radar)\b/i.test(normalized)) {
    themes.push('pattern radar');
  }
  if (/\b(career|job|work|business)\b/i.test(normalized)) {
    themes.push('career');
  }
  if (/\b(marriage|relationship|partner|love)\b/i.test(normalized)) {
    themes.push('relationship');
  }
  if (/\b(money|wealth|finance|income)\b/i.test(normalized)) {
    themes.push('wealth');
  }
  if (/\b(remedy|mantra|practice|upay)\b/i.test(normalized)) {
    themes.push('remedies');
  }
  if (/\b(purushartha|dharma|artha|kama|moksha|life\s*balance)\b/i.test(normalized)) {
    themes.push('life balance');
  }
  if (/\b(panchang|muhurta|muhurat|tithi|paksha|shubh\s*samay|good\s*time)\b/i.test(normalized)) {
    themes.push('personal panchang');
  }
  if (/\b(holistic|reading\s*room|karma\s*room|today\s*room|timing\s*room)\b/i.test(normalized)) {
    themes.push('holistic rooms');
  }
  if (/\b(daily\s*guidance|morning\s*practice|daily\s*sadhana|what\s*should\s*i\s*do\s*today|aaj\s*kya\s*karu|aaje\s*shu\s*karu)\b/i.test(normalized)) {
    themes.push('daily guidance');
  }
  if (/\b(sadhana|remedy\s*path|upay\s*path|seva\s*path|mantra\s*path|practice\s*path)\b/i.test(normalized)) {
    themes.push('sadhana path');
  }
  if (/\b(numerology|name\s*number|birth\s*number|destiny\s*number|life\s*path|personal\s*(year|month|day)|ank\s*jyotish|moolank|mulank|bhagyank)\b/i.test(normalized)) {
    themes.push('numerology');
  }
  if (/\b(signature|autograph|hastakshar|sahi|handwriting\s*signature)\b/i.test(normalized)) {
    themes.push('signature');
  }
  if (/\b(timing|when|dasha|transit|calendar)\b/i.test(normalized)) {
    themes.push('timing');
  }

  return themes;
}

function findSimilarSavedKundli(
  kundli: KundliData,
  savedKundlis: KundliData[],
):
  | {
      kundli: KundliData;
      matches: string[];
      score: number;
    }
  | undefined {
  return savedKundlis
    .filter(item => item.id !== kundli.id)
    .map(item => {
      const matches = [
        item.lagna === kundli.lagna ? `${kundli.lagna} Lagna` : '',
        item.moonSign === kundli.moonSign ? `${kundli.moonSign} Moon` : '',
        item.nakshatra === kundli.nakshatra
          ? `${kundli.nakshatra} Nakshatra`
          : '',
        item.dasha.current.mahadasha === kundli.dasha.current.mahadasha
          ? `${kundli.dasha.current.mahadasha} Mahadasha`
          : '',
      ].filter(Boolean);

      return {
        kundli: item,
        matches,
        score: matches.length,
      };
    })
    .filter(item => item.score >= 2)
    .sort((a, b) => b.score - a.score)[0];
}

function chartSignature(kundli: KundliData): string {
  return `${kundli.lagna} Lagna / ${kundli.moonSign} Moon / ${kundli.nakshatra} / ${kundli.dasha.current.mahadasha}-${kundli.dasha.current.antardasha}`;
}

function findMostOccupiedHouse(
  kundli: KundliData,
): { house: number; planets: string[] } | undefined {
  return kundli.houses
    .filter(house => house.planets.length > 0)
    .map(house => ({
      house: house.house,
      planets: house.planets,
    }))
    .sort((a, b) => b.planets.length - a.planets.length)[0];
}

function findPlanetByName(kundli: KundliData, name: string) {
  return kundli.planets.find(
    planet => planet.name.toLowerCase() === name.toLowerCase(),
  );
}

function labelAction(action: PredictaAppActionId): string {
  return action
    .split('-')
    .map(word => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function mergeUnique(
  current: string[],
  next: string[],
  limit: number,
): string[] {
  return [...new Set([...next, ...current].filter(Boolean))].slice(0, limit);
}

function joinSections(sections: Array<string | undefined>): string {
  return sections.filter(Boolean).join('\n\n');
}

function formatShortDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  });
}

function buildExplicitLanguageSwitchAcknowledgement(
  responseLanguage: SupportedLanguage,
): string | undefined {
  if (responseLanguage === 'hi') {
    return 'ठीक है. मैं आगे हिंदी में जवाब दूंगी.';
  }
  if (responseLanguage === 'gu') {
    return 'ઠીક છે. હવે હું ગુજરાતી માં જવાબ આપીશ.';
  }
  if (responseLanguage === 'en') {
    return 'Okay. I will continue in English.';
  }
  return undefined;
}

function withLanguageAcknowledgement(
  context: PredictaLanguageContext,
  text: string,
): string {
  return [context.acknowledgement, text].filter(Boolean).join('\n\n');
}
