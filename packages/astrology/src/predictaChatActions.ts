import {
  formatNativeCopy,
  getPredictaChatLabel,
  getPredictaChatPhrase,
  getNativeCopy,
  getPredictaMicroMessage,
  getPredictaResponseOpening,
  predictaProviderDecisionForAction,
} from '@pridicta/config';
import type {
  ChartContext,
  KundliData,
  KundliKarmaIntelligence,
  KundliKarmaItem,
  KundliKarmaRankedCondition,
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
import {
  evaluateFamilyComparisonEligibility,
  getFamilyComparisonEligibilityMessage,
} from './familyVaultComparisonLimits';
import { composeHolisticDailyGuidance } from './holisticDailyGuidance';
import { composeHolisticDecisionTimingSynthesis } from './holisticDecisionTimingSynthesis';
import { composeHolisticFoundationModel } from './holisticFoundationModel';
import { composeHolisticReadingRooms } from './holisticReadingRooms';
import { composeLifeAtlasReport } from './lifeAtlasReport';
import { composeLifeTimeline } from './lifeTimeline';
import { composeMahadashaIntelligence } from './mahadashaIntelligence';
import { composeJaiminiInterpretation } from './jaiminiInterpretation';
import { composeKundliKarmaDoshIntelligence } from './kundliKarmaDoshEngine';
import { composeKundliKarmaLalKitabIntelligence } from './kundliKarmaLalKitabEngine';
import { composeKundliKarmaShrapIntelligence } from './kundliKarmaShrapEngine';
import { composeKundliKarmaSnapshot } from './kundliKarmaSnapshotEngine';
import { composeKundliKarmaYogIntelligence } from './kundliKarmaYogEngine';
import { composeNumerologyFoundationModel } from './numerologyFoundationModel';
import { composePersonalPanchangLayer } from './personalPanchangLayer';
import {
  composePredictaMultiSchoolConsultation,
  isPredictaMultiSchoolQuestion,
} from './predictaMultiSchoolConsultation';
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
  | 'account-settings'
  | 'advanced-jyotish'
  | 'birth-time'
  | 'chart'
  | 'bhav-chalit'
  | 'concierge'
  | 'create-kundli'
  | 'daily-briefing'
  | 'decision-timing'
  | 'destiny-passport'
  | 'family-map'
  | 'holistic-daily-guidance'
  | 'jaimini-handoff'
  | 'jaimini-predicta'
  | 'kundli-karma'
  | 'kp-handoff'
  | 'kp-predicta'
  | 'life-timeline'
  | 'mahadasha'
  | 'multi-school-consultation'
  | 'nadi-handoff'
  | 'nadi-predicta'
  | 'numerology-handoff'
  | 'numerology-predicta'
  | 'signature-handoff'
  | 'signature-predicta'
  | 'support-help'
  | 'holistic-reading-rooms'
  | 'personal-panchang'
  | 'pass-redemption'
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

export type PredictaProviderDecisionLabel =
  | 'local_memory_answer'
  | 'deterministic_action'
  | 'missing_data_question'
  | 'ai_required'
  | 'blocked_needs_credit';

export type PredictaInteractionMemory = {
  actionCounts: Partial<Record<PredictaAppActionId, number>>;
  activeContext?: PredictaActiveConversationContext;
  chartSignatures: string[];
  firstSeenAt: string;
  lastAction?: PredictaAppActionId;
  lastUserGoal?: string;
  preferredLanguageStyle?: SupportedLanguage;
  lastSeenAt: string;
  learnedThemes: string[];
  recentOpenings?: string[];
  recentResponsePatterns?: string[];
  recentUpsellActions?: PredictaAppActionId[];
  totalTurns: number;
};

export type PredictaActiveConversationContext = {
  eventQuestion?: string;
  kundliSignature?: string;
  lastUserGoal?: string;
  passState?: 'active' | 'careful' | 'exhausted' | 'unknown';
  reportContext?: string;
  school?: PredictaSchool;
  selectedChart?: string;
  selectedHouse?: number;
  selectedPlanet?: string;
  signatureReady?: boolean;
};

export type PredictaActionRequest = {
  aiCreditsExhausted?: boolean;
  chartContext?: ChartContext;
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  memory?: PredictaInteractionMemory;
  predictaSchool?: PredictaSchool;
  savedKundlis?: KundliData[];
  text: string;
};

export type PredictaAppFunctionHandoff = {
  context: {
    action: PredictaAppActionId;
    originalQuestion: string;
    requiresEntitlement?: boolean;
    requiresKundli?: boolean;
    requiresSignIn?: boolean;
  };
  href: string;
  label: string;
  preserveDraftIntent: boolean;
  reason: string;
  targetScreen: string;
};

export type PredictaActionReply = {
  action?: PredictaAppActionId;
  handoff?: PredictaAppFunctionHandoff;
  handled: boolean;
  localMemoryUsed?: boolean;
  memory: PredictaInteractionMemory;
  providerDecision: PredictaProviderDecisionLabel;
  text?: string;
};

export type PredictaRouterDecisionReason =
  | 'deterministic_action_available'
  | 'empty_input'
  | 'local_memory_available'
  | 'missing_kundli'
  | 'open_ended_ai_required'
  | 'open_ended_blocked_needs_credit';

export type PredictaRouterDecision = {
  action?: PredictaAppActionId;
  canAnswerWithoutKundli: boolean;
  normalizedText: string;
  providerDecision: PredictaProviderDecisionLabel;
  reason: PredictaRouterDecisionReason;
  shouldCallProvider: boolean;
};

export type PredictaLanguageContext = {
  acknowledgement?: string;
  dominantLanguage: SupportedLanguage;
  normalizedText: string;
  responseLanguage: SupportedLanguage;
};

export type PredictaEnglishSwitchDecision = 'approve' | 'none' | 'reject';

function isNativeChatLanguage(language: SupportedLanguage): boolean {
  return language === 'hi' || language === 'gu';
}

function chatLine(
  language: SupportedLanguage,
  labelId: Parameters<typeof getPredictaChatLabel>[1],
  value: string,
): string {
  return `${getPredictaChatLabel(language, labelId)}: ${value}`;
}

function chatPhrase(
  language: SupportedLanguage,
  phraseId: Parameters<typeof getPredictaChatPhrase>[1],
): string {
  return getPredictaChatPhrase(language, phraseId);
}

function localizedConfidence(
  language: SupportedLanguage,
  confidence: string,
): string {
  if (language === 'hi') {
    if (/high|clear/i.test(confidence)) return 'उच्च';
    if (/low|weak|uncertain/i.test(confidence)) return 'कम';
    return 'मध्यम';
  }
  if (language === 'gu') {
    if (/high|clear/i.test(confidence)) return 'ઉચ્ચ';
    if (/low|weak|uncertain/i.test(confidence)) return 'ઓછો';
    return 'મધ્યમ';
  }
  return confidence;
}

function localizedKpVerdict(
  language: SupportedLanguage,
  verdict: string,
): string {
  const normalized = verdict.toLowerCase();
  if (language === 'hi') {
    if (normalized.includes('likely')) return 'संभावना मजबूत';
    if (normalized.includes('delayed')) return 'देरी दिखती है';
    if (normalized.includes('blocked')) return 'रुकावट मजबूत';
    if (normalized.includes('clarity')) return 'एक साफ़ सवाल चाहिए';
    if (normalized.includes('proof')) return 'प्रमाण अभी पूरा नहीं';
    return 'मिश्रित संकेत';
  }
  if (language === 'gu') {
    if (normalized.includes('likely')) return 'સંભાવના મજબૂત';
    if (normalized.includes('delayed')) return 'વિલંબ દેખાય છે';
    if (normalized.includes('blocked')) return 'અવરોધ મજબૂત';
    if (normalized.includes('clarity')) return 'એક સ્પષ્ટ સવાલ જોઈએ';
    if (normalized.includes('proof')) return 'પુરાવો હજુ પૂરતો નથી';
    return 'મિશ્ર સંકેત';
  }
  return verdict;
}

function nativePremiumLine(
  language: SupportedLanguage,
  hasPremiumAccess: boolean,
): string {
  return chatPhrase(language, hasPremiumAccess ? 'premiumDepth' : 'freeDepth');
}

function nativeSignatureTraitList(
  language: SupportedLanguage,
  traits: Array<{ label: string; value: string }>,
): string {
  const labelMap: Record<string, { hi: string; gu: string }> = {
    baseline: { hi: 'आधार रेखा', gu: 'આધાર રેખા' },
    flourish: { hi: 'सजावट', gu: 'સજાવટ' },
    legibility: { hi: 'स्पष्टता', gu: 'સ્પષ્ટતા' },
    pressure: { hi: 'दबाव', gu: 'દબાણ' },
    size: { hi: 'आकार', gu: 'કદ' },
    slant: { hi: 'झुकाव', gu: 'ઝુકાવ' },
    spacing: { hi: 'अंतर', gu: 'અંતર' },
    speed: { hi: 'लय', gu: 'લય' },
    'writing rhythm': { hi: 'लय', gu: 'લય' },
    underline: { hi: 'रेखांकन', gu: 'રેખાંકન' },
  };
  const valueMap: Record<string, { hi: string; gu: string }> = {
    balanced: { hi: 'संतुलित', gu: 'સંતુલિત' },
    clear: { hi: 'साफ़', gu: 'સ્પષ્ટ' },
    flowing: { hi: 'प्रवाही', gu: 'પ્રવાહી' },
    high: { hi: 'उच्च', gu: 'ઉચ્ચ' },
    low: { hi: 'कम', gu: 'ઓછું' },
    medium: { hi: 'मध्यम', gu: 'મધ્યમ' },
    moderate: { hi: 'मध्यम', gu: 'મધ્યમ' },
    partial: { hi: 'आंशिक', gu: 'આંશિક' },
    right: { hi: 'दाईं ओर', gu: 'જમણી તરફ' },
    upward: { hi: 'ऊपर की ओर', gu: 'ઉપર તરફ' },
  };
  const target = language === 'gu' ? 'gu' : 'hi';
  return traits
    .map(trait => {
      const label =
        labelMap[trait.label.toLowerCase()]?.[target] ?? trait.label;
      const value =
        valueMap[trait.value.toLowerCase()]?.[target] ?? trait.value;
      return `${label} ${value}`;
    })
    .join(', ');
}

function kundliKarmaModuleTerm(item: KundliKarmaItem): string {
  if (item.module === 'DOSH') return 'Dosh';
  if (item.module === 'SHRAP') return 'Shrap';
  if (item.module === 'LAL_KITAB') return 'Lal Kitab';
  return 'Yog';
}

const ACTION_PATTERNS: Array<{
  id: PredictaAppActionId;
  pattern: RegExp;
}> = [
  {
    id: 'account-settings',
    pattern:
      /\b(account|settings|profile|login|log\s*in|sign\s*in|signin|google\s*sign\s*in|google\s*login|manage\s*account|my\s*account)\b/i,
  },
  {
    id: 'support-help',
    pattern:
      /\b(contact\s*support|support\s*team|help\s*team|customer\s*support|report\s*a\s*bug|bug\s*report|feedback|complaint|email\s*team|talk\s*to\s*team)\b/i,
  },
  {
    id: 'pass-redemption',
    pattern:
      /\b(redeem|coupon|coupon\s*code|pass\s*code|redeem\s*pass|family\s*pass|friend\s*pass|promo\s*code|credits?\s*left|ai\s*credits?|question\s*credits?|question\s*pack|pass\s*limit|limit\s*left)\b/i,
  },
  {
    id: 'create-kundli',
    pattern:
      /\b(create|make|generate|build|prepare|new)\b[\s\w-]{0,40}\b(kundli|kundali|janam\s*kundli|birth\s*chart|chart)\b|\b(kundli|kundali|janam\s*kundli|birth\s*chart)\b[\s\w-]{0,40}\b(create|make|generate|build|prepare|new)\b/i,
  },
  {
    id: 'saved-kundlis',
    pattern:
      /\b(saved|save|store|profiles|family\s*member|members|switch\s*kundli|change\s*kundli|edit\s*kundli|kundli\s*library|saved\s*kundlis|saved\s*profiles)\b/i,
  },
  {
    id: 'jaimini-handoff',
    pattern:
      /\b(gemini\s*jyotish|gemini\s*astrology|gemini\s*karaka|gemini\s*chara|gemini\s*predicta)\b/i,
  },
  {
    id: 'kundli-karma',
    pattern:
      /\b(kundli\s*karma|dosh|dosha|manglik|kuja|kaal\s*sarp|pitra|shrapit|guru\s*chandal|grahan|kemadruma|vish|angarak|daridra|paap\s*kartari|arishta|balarishta|shrap|shrapa|pitru|matru|sarpa|naga|preta|bhratri|bandhu|stree|patni|deva|brahma|yog|yoga|raja\s*yog|dhana\s*yog|gajakesari|panch\s*mahapurush|neecha\s*bhanga|vipareeta|budhaditya|chandra\s*mangal|lakshmi|saraswati|adhi\s*yog|dharma\s*karmadhipati|parivartana|shakata|lal\s*kitab|rin|upay|upaay|karma\s*debt|karmic\s*debt)\b/i,
  },
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
    id: 'jaimini-predicta',
    pattern:
      /\b(jaimini\s*predicta|jaimini\s*room|jaimini\s*world|in\s+jaimini|from\s+jaimini)\b/i,
  },
  {
    id: 'jaimini-handoff',
    pattern:
      /\b(jaimini|jaimini\s*jyotish|atmakaraka|amatyakaraka|darakaraka|karakamsha|karakamsa|swamsa|arudha|upapada|chara\s*dasha|nadi|naadi|palm\s*leaf|agastya|nadi\s*jyotish)\b/i,
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
    id: 'multi-school-consultation',
    pattern:
      /\b(will|when|should|likely|possible|chance|predict|prediction|timing|trigger|delay)\b[\s\w'’,-]{0,90}\b(career|job|promotion|foreign|abroad|overseas|visa|pr|relocation|marriage|relationship|love|property|money|business|education|court|legal|family|child|matching|health|wellness)\b|\b(career|job|promotion|foreign|abroad|overseas|visa|pr|relocation|marriage|relationship|love|property|money|business|education|court|legal|family|child|matching|health|wellness)\b[\s\w'’,-]{0,90}\b(will|when|should|likely|possible|chance|predict|prediction|timing|trigger|delay)\b|\b(no\s*(specific\s*)?question|what\s*should\s*i\s*ask)\b/i,
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
    return getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.8a126c2382");
  }

  return getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.b23bb91b02");
}

function detectExplicitPredictaReplyLanguage(
  text: string,
): SupportedLanguage | undefined {
  const normalized = normalizePredictaIntentText(text);
  const hasHindiNativeAlias = [
    getNativeCopy('native.localization.language.hindiNameModern'),
    getNativeCopy('native.localization.language.hindiNameTraditional'),
  ].some(alias => text.includes(alias));
  const hasGujaratiNativeAlias = text.includes(
    getNativeCopy('native.localization.language.gujaratiName'),
  );

  if (
    /(?:\b(?:switch|change|answer|reply|respond|continue|speak|talk|write|keep)\b[\s\S]{0,24}\benglish\b)|(?:\bin english\b)|(?:\benglish please\b)|(?:^english$)/i.test(
      normalized,
    )
  ) {
    return 'en';
  }

  if (
    /(?:\b(?:switch|change|answer|reply|respond|continue|speak|talk|write|keep)\b[\s\S]{0,24}\b(?:hindi|hindii|devanagari)\b)|(?:\bin hindi\b)|(?:\bhindi me\b)|(?:\bhindi mein\b)|(?:\bhindi please\b)/i.test(
      normalized,
    ) ||
    hasHindiNativeAlias
  ) {
    return 'hi';
  }

  if (
    /(?:\b(?:switch|change|answer|reply|respond|continue|speak|talk|write|keep)\b[\s\S]{0,24}\bgujarati\b)|(?:\bin gujarati\b)|(?:\bgujarati ma\b)|(?:\bgujarati please\b)/i.test(
      normalized,
    ) ||
    hasGujaratiNativeAlias
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
  aiCreditsExhausted = false,
  chartContext,
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
  const detectedAction =
    detectPredictaAppAction(languageContext.normalizedText) ??
    (isPredictaMultiSchoolQuestion(languageContext.normalizedText)
      ? 'multi-school-consultation'
      : undefined);
  const action = resolveSchoolAwareAction(detectedAction, predictaSchool);
  const routerDecision = classifyPredictaRouterDecision({
    action,
    aiCreditsExhausted,
    kundli,
    normalizedText: languageContext.normalizedText,
  });
  const responseLanguage = shouldPreferNumerologyRoomLanguage({
    action: routerDecision.action,
    explicitLanguage: detectExplicitPredictaReplyLanguage(text),
    predictaSchool,
    selectedLanguage: language,
  })
    ? language
    : languageContext.responseLanguage;
  const nextMemory = learnPredictaInteraction(
    memory,
    text,
    routerDecision.action,
    kundli,
    responseLanguage,
    {
      chartContext,
      predictaSchool,
    },
  );

  if (!routerDecision.action) {
    return {
      handled: false,
      memory: nextMemory,
      providerDecision: routerDecision.providerDecision,
    };
  }

  if (routerDecision.providerDecision === 'missing_data_question') {
    return {
      action: routerDecision.action,
      handoff: buildPredictaAppFunctionHandoff(
        routerDecision.action,
        text,
        routerDecision,
      ),
      handled: true,
      memory: nextMemory,
      providerDecision: routerDecision.providerDecision,
      text: withLanguageAcknowledgement(
        languageContext,
        buildNeedsKundliReply(responseLanguage, routerDecision.action),
      ),
    };
  }

  return {
    action: routerDecision.action,
    handoff: buildPredictaAppFunctionHandoff(
      routerDecision.action,
      text,
      routerDecision,
    ),
    handled: true,
    localMemoryUsed: routerDecision.providerDecision === 'local_memory_answer',
    memory: nextMemory,
    providerDecision: routerDecision.providerDecision,
    text: withLanguageAcknowledgement(
      languageContext,
      buildActionText({
        action: routerDecision.action,
        chartContext,
        hasPremiumAccess,
        kundli,
        language: responseLanguage,
        memory: nextMemory,
        predictaSchool,
        savedKundlis,
        text,
      }),
    ),
  };
}

export function classifyPredictaRouterDecision({
  action,
  aiCreditsExhausted = false,
  kundli,
  normalizedText,
}: {
  action?: PredictaAppActionId;
  aiCreditsExhausted?: boolean;
  kundli?: KundliData;
  normalizedText: string;
}): PredictaRouterDecision {
  if (!normalizedText.trim()) {
    return {
      action,
      canAnswerWithoutKundli: false,
      normalizedText,
      providerDecision: 'missing_data_question',
      reason: 'empty_input',
      shouldCallProvider: false,
    };
  }

  if (!action) {
    const providerDecision = aiCreditsExhausted
      ? 'blocked_needs_credit'
      : 'ai_required';
    return {
      action,
      canAnswerWithoutKundli: false,
      normalizedText,
      providerDecision,
      reason: aiCreditsExhausted
        ? 'open_ended_blocked_needs_credit'
        : 'open_ended_ai_required',
      shouldCallProvider: providerDecision === 'ai_required',
    };
  }

  const canAnswerWithoutKundli =
    action === 'kundli-karma' &&
    isKundliKarmaDefinitionQuestion(normalizedText);

  if (!kundli && actionRequiresKundli(action) && !canAnswerWithoutKundli) {
    return {
      action,
      canAnswerWithoutKundli,
      normalizedText,
      providerDecision: 'missing_data_question',
      reason: 'missing_kundli',
      shouldCallProvider: false,
    };
  }

  const providerDecision = classifyProviderDecision(action);

  return {
    action,
    canAnswerWithoutKundli,
    normalizedText,
    providerDecision,
    reason:
      providerDecision === 'local_memory_answer'
        ? 'local_memory_available'
        : 'deterministic_action_available',
    shouldCallProvider: false,
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
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.8e2ca76b22", [next]),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      insight,
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.054feee388", [next]),
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
  context: {
    chartContext?: ChartContext;
    passState?: PredictaActiveConversationContext['passState'];
    predictaSchool?: PredictaSchool;
    reportContext?: string;
    signatureReady?: boolean;
  } = {},
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
  const nextActionCount = action ? (current.actionCounts[action] ?? 0) + 1 : 0;
  const activeContext = buildActiveConversationContext({
    action,
    chartContext: context.chartContext,
    current: current.activeContext,
    kundli,
    passState: context.passState,
    predictaSchool: context.predictaSchool,
    reportContext: context.reportContext,
    signatureReady: context.signatureReady,
    text,
  });
  const lastUserGoal = inferLastUserGoal(text, action) ?? current.lastUserGoal;

  return {
    ...current,
    actionCounts: action
      ? {
          ...current.actionCounts,
          [action]: nextActionCount,
        }
      : current.actionCounts,
    activeContext,
    chartSignatures,
    lastAction: action ?? current.lastAction,
    lastUserGoal,
    lastSeenAt: now,
    learnedThemes,
    preferredLanguageStyle:
      responseLanguage ?? current.preferredLanguageStyle,
    recentOpenings: action
      ? mergeUnique(
          current.recentOpenings ?? [],
          [buildOpeningPatternId(action, nextActionCount)],
          6,
        )
      : current.recentOpenings,
    recentResponsePatterns: mergeUnique(
      current.recentResponsePatterns ?? [],
      buildResponsePatternIds(action, text),
      10,
    ),
    recentUpsellActions: action
      ? mergeUnique(current.recentUpsellActions ?? [], [action], 6)
      : current.recentUpsellActions,
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
    (predictaSchool === 'JAIMINI' || predictaSchool === 'NADI') &&
    (action === 'jaimini-handoff' ||
      action === 'jaimini-predicta' ||
      action === 'nadi-handoff' ||
      action === 'nadi-predicta')
  ) {
    return 'jaimini-predicta';
  }

  if (
    predictaSchool !== 'JAIMINI' &&
    predictaSchool !== 'NADI' &&
    (action === 'jaimini-predicta' || action === 'nadi-predicta')
  ) {
    return 'jaimini-handoff';
  }

  if (action === 'nadi-handoff') {
    return 'jaimini-handoff';
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
  'kundli-karma',
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
    'account-settings',
    'concierge',
    'create-kundli',
    'family-map',
    'kp-handoff',
    'jaimini-handoff',
    'multi-school-consultation',
    'nadi-handoff',
    'numerology-handoff',
    'numerology-predicta',
    'signature-handoff',
    'signature-predicta',
    'vedic-handoff',
    'pass-redemption',
    'pricing',
    'report',
    'saved-kundlis',
    'support-help',
  ].includes(action);
}

function buildPredictaAppFunctionHandoff(
  action: PredictaAppActionId,
  originalQuestion: string,
  decision: PredictaRouterDecision,
): PredictaAppFunctionHandoff | undefined {
  const route = appActionRoute(action);

  if (!route) {
    return undefined;
  }

  const params = new URLSearchParams();
  params.set('predictaAction', action);
  params.set('from', 'predicta-chat');
  params.set('intent', originalQuestion);

  if (decision.reason === 'missing_kundli') {
    params.set('needs', 'kundli');
  }

  return {
    context: {
      action,
      originalQuestion,
      requiresEntitlement:
        action === 'pricing' ||
        action === 'pass-redemption' ||
        decision.providerDecision === 'blocked_needs_credit',
      requiresKundli: actionRequiresKundli(action),
      requiresSignIn: signInRecommendedForAction(action),
    },
    href: `${route.href}?${params.toString()}`,
    label: route.label,
    preserveDraftIntent: true,
    reason: route.reason,
    targetScreen: route.targetScreen,
  };
}

function appActionRoute(
  action: PredictaAppActionId,
):
  | {
      href: string;
      label: string;
      reason: string;
      targetScreen: string;
    }
  | undefined {
  switch (action) {
    case 'account-settings':
      return {
        href: '/dashboard/account',
        label: 'Open account',
        reason: 'Account and settings actions need the user identity surface.',
        targetScreen: 'Settings',
      };
    case 'family-map':
      return {
        href: '/dashboard/family',
        label: 'Open Family Vault',
        reason: 'Family assignment and comparison rules belong in Family Vault.',
        targetScreen: 'FamilyKarmaMap',
      };
    case 'pass-redemption':
      return {
        href: '/dashboard/redeem-pass',
        label: 'Redeem pass',
        reason: 'Pass redemption must happen in the signed-in redemption flow.',
        targetScreen: 'RedeemPassCode',
      };
    case 'pricing':
      return {
        href: '/pricing',
        label: 'See plans',
        reason: 'Entitlements, premium, question packs, and report packs belong on pricing.',
        targetScreen: 'Paywall',
      };
    case 'report':
      return {
        href: '/dashboard/report',
        label: 'Open report composer',
        reason: 'Report selection, section choices, and download actions belong in the composer.',
        targetScreen: 'Report',
      };
    case 'saved-kundlis':
      return {
        href: '/dashboard/saved-kundlis',
        label: 'Open saved Kundlis',
        reason: 'Editing, switching, and assigning Kundlis starts from the saved Kundli library.',
        targetScreen: 'SavedKundlis',
      };
    case 'signature-handoff':
    case 'signature-predicta':
      return {
        href: '/dashboard/signature',
        label: 'Open Signature Predicta',
        reason: 'Signature upload, drawing, scanning, and confirmed traits belong in Signature Predicta.',
        targetScreen: 'SignaturePredicta',
      };
    case 'support-help':
      return {
        href: '/feedback',
        label: 'Contact Predicta',
        reason: 'Support, bug reports, and team contact belong in the feedback surface.',
        targetScreen: 'SafetyPromise',
      };
    case 'chart':
      return {
        href: '/dashboard/charts',
        label: 'Open charts',
        reason: 'Chart viewing and selectable Vargas belong in the chart surface.',
        targetScreen: 'Charts',
      };
    case 'multi-school-consultation':
      return {
        href: '/dashboard/chat',
        label: 'Ask main Predicta',
        reason: 'All-school event synthesis belongs in main Predicta, not a specialist room.',
        targetScreen: 'Chat',
      };
    case 'create-kundli':
      return {
        href: '/dashboard/kundli',
        label: 'Create Kundli',
        reason: 'Kundli creation starts from birth details and stays deterministic before AI is needed.',
        targetScreen: 'Kundli',
      };
    case 'kp-handoff':
    case 'kp-predicta':
      return {
        href: '/dashboard/kp',
        label: 'Open KP Predicta',
        reason: 'KP event questions belong in the KP room.',
        targetScreen: 'KpPredicta',
      };
    case 'jaimini-handoff':
    case 'jaimini-predicta':
    case 'nadi-handoff':
    case 'nadi-predicta':
      return {
        href: '/dashboard/jaimini',
        label: 'Open Jaimini Predicta',
        reason: 'Jaimini destiny and karaka questions belong in the Jaimini room.',
        targetScreen: 'JaiminiPredicta',
      };
    case 'numerology-handoff':
    case 'numerology-predicta':
      return {
        href: '/dashboard/numerology',
        label: 'Open Numerology Predicta',
        reason: 'Number, name, and cycle questions belong in Numerology Predicta.',
        targetScreen: 'NumerologyPredicta',
      };
    case 'vedic-handoff':
      return {
        href: '/dashboard/vedic',
        label: 'Open Vedic Predicta',
        reason: 'Parashari chart, dasha, Vargas, Gochar, Yog, Dosh, Shrap, and Lal Kitab belong in Vedic Predicta.',
        targetScreen: 'Kundli',
      };
    default:
      return undefined;
  }
}

function signInRecommendedForAction(action: PredictaAppActionId): boolean {
  return [
    'account-settings',
    'create-kundli',
    'family-map',
    'multi-school-consultation',
    'pass-redemption',
    'pricing',
    'report',
    'saved-kundlis',
    'signature-handoff',
    'signature-predicta',
    'support-help',
  ].includes(action);
}

function classifyProviderDecision(
  action: PredictaAppActionId,
): PredictaProviderDecisionLabel {
  return predictaProviderDecisionForAction(action);
}

function buildActionText({
  action,
  chartContext,
  hasPremiumAccess,
  kundli,
  language,
  memory,
  predictaSchool,
  savedKundlis,
  text,
}: Required<
  Pick<PredictaActionRequest, 'language' | 'savedKundlis' | 'text'>
> & {
  action: PredictaAppActionId;
  chartContext?: ChartContext;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  memory: PredictaInteractionMemory;
  predictaSchool?: PredictaSchool;
}): string {
  const intro = joinSections([
    actionIntro(language, memory, action),
    buildMicroPrelude({ action, kundli, language, text }),
  ]);
  const insight = buildMemoryInsight(language, memory, kundli, savedKundlis);
  const upsell = buildUpsell(language, action, hasPremiumAccess, memory);

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

  if (action === 'pass-redemption') {
    return joinSections([
      intro,
      passRedemptionReply(language, hasPremiumAccess),
      insight,
    ]);
  }

  if (action === 'account-settings') {
    return joinSections([
      intro,
      accountSettingsReply(language),
      insight,
    ]);
  }

  if (action === 'support-help') {
    return joinSections([
      intro,
      supportHelpReply(language),
      insight,
    ]);
  }

  if (action === 'create-kundli') {
    return joinSections([
      intro,
      createKundliReply(language),
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
      buildUpsell(language, 'wow-radar', hasPremiumAccess, memory),
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

  if (action === 'jaimini-handoff' || action === 'nadi-handoff') {
    return joinSections([
      intro,
      isGeminiJyotishAlias(text)
        ? geminiJyotishAliasReply(language)
        : jaiminiHandoffReply(language),
      insight,
    ]);
  }

  if (action === 'jaimini-predicta' || action === 'nadi-predicta') {
    return joinSections([
      intro,
      buildJaiminiPredictaReply(language, kundli, hasPremiumAccess),
      insight,
      buildUpsell(language, 'jaimini-predicta', hasPremiumAccess, memory),
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
      buildUpsell(language, 'numerology-predicta', hasPremiumAccess, memory),
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
      buildUpsell(language, 'signature-predicta', hasPremiumAccess, memory),
    ]);
  }

  if (action === 'vedic-handoff') {
    return joinSections([
      intro,
      vedicHandoffReply(language),
      insight,
    ]);
  }

  if (action === 'kundli-karma') {
    return joinSections([
      intro,
      buildKundliKarmaLocalMemoryReply({
        chartContext,
        hasPremiumAccess,
        kundli,
        language,
        text,
      }),
      insight,
      buildUpsell(language, 'kundli-karma', hasPremiumAccess, memory),
    ]);
  }

  if (action === 'multi-school-consultation') {
    return joinSections([
      intro,
      buildMultiSchoolConsultationReply({
        hasPremiumAccess,
        kundli,
        language,
        predictaSchool,
        text,
      }),
      insight,
      buildUpsell(language, 'multi-school-consultation', hasPremiumAccess, memory),
    ]);
  }

  if (action === 'family-map' && !kundli) {
    return joinSections([
      intro,
      familyVaultSetupReply(language, savedKundlis.length),
      insight,
      upsell,
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
    if (isNativeChatLanguage(language)) {
      return joinSections([
        intro,
        [
          chatLine(language, 'directAnswer', chatPhrase(language, 'decisionDirect')),
          chatLine(language, 'timing', chatPhrase(language, 'activeConditionTiming')),
          chatLine(language, 'confidence', chatPhrase(language, 'decisionMediumConfidence')),
          chatLine(language, 'actionRemedy', chatPhrase(language, 'decisionAction')),
          chatLine(language, 'guidance', chatPhrase(language, 'decisionGuidance')),
          chatLine(language, 'lifeBalance', chatPhrase(language, 'decisionLifeBalance')),
          chatLine(language, 'karmaSupport', chatPhrase(language, 'decisionKarmaSupport')),
          chatLine(
            language,
            'evidence',
            chatPhrase(language, 'eventEvidenceGeneric'),
          ),
          chatLine(language, 'boundary', chatPhrase(language, 'nativeSchoolBoundary')),
        ]
          .filter(Boolean)
          .join('\n'),
        insight,
        buildUpsell(language, 'decision-timing', hasPremiumAccess, memory),
      ]);
    }
    const proof = synthesis.signals
      .slice(0, hasPremiumAccess ? 5 : 3)
      .map(signal => `- ${signal.label}: ${signal.headline}`)
      .join('\n');
    return joinSections([
      intro,
      [
        `Direct answer: ${synthesis.headline}`,
        `Timing: ${synthesis.timingWindow}`,
        'Confidence: Medium. This combines decision posture, dasha, Gochar, life balance, and remedy support; treat it as planning guidance, not a forced outcome.',
        `Action/remedy: ${synthesis.practicalStep}. ${synthesis.sadhanaSupport}`,
        `Guidance: ${synthesis.decisionGuidance}`,
        `Next step: ${synthesis.practicalStep}`,
        `Life balance: ${synthesis.purusharthaLens}`,
        `Karma support: ${synthesis.sadhanaSupport}`,
        proof ? `Evidence:\n${proof}` : '',
        `Boundary: ${synthesis.guardrails[0]}`,
      ]
        .filter(Boolean)
        .join('\n'),
      insight,
      buildUpsell(language, 'decision-timing', hasPremiumAccess, memory),
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
      buildUpsell(language, 'advanced-jyotish', hasPremiumAccess, memory),
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
      buildUpsell(language, 'yearly-horoscope', hasPremiumAccess, memory),
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
      buildUpsell(language, 'bhav-chalit', hasPremiumAccess, memory),
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
      buildUpsell(language, 'kp-predicta', hasPremiumAccess, memory),
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
      buildUpsell(language, 'holistic-daily-guidance', hasPremiumAccess, memory),
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
      buildUpsell(language, 'personal-panchang', hasPremiumAccess, memory),
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
      buildUpsell(language, 'holistic-reading-rooms', hasPremiumAccess, memory),
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
      buildUpsell(language, 'sadhana-remedy-path', hasPremiumAccess, memory),
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
    if (!kundli) {
      return joinSections([
        intro,
        familyVaultSetupReply(language, savedKundlis.length),
        insight,
        upsell,
      ]);
    }

    const familyKundlis = [
      kundli,
      ...savedKundlis.filter(item => item.id !== kundli.id),
    ];
    const familyEligibility = evaluateFamilyComparisonEligibility(familyKundlis.length);
    const family = composeFamilyKarmaMap(
      familyKundlis.map((item, index) => ({
        kundli: item,
        relationship: index === 0 ? 'self' : 'other',
      })),
    );
    return joinSections([
      intro,
      [
        getFamilyComparisonEligibilityMessage(familyEligibility),
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
    const strongestHouses = getAshtakavargaHouseList(kundli, 'strongestHouses');
    const weakestHouses = getAshtakavargaHouseList(kundli, 'weakestHouses');
    return joinSections([
      intro,
      [
        `${kundli.birthDetails.name}'s chart snapshot`,
        `Lagna: ${kundli.lagna}`,
        `Moon: ${kundli.moonSign} in ${kundli.nakshatra}`,
        `Current dasha: ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`,
        `Strong houses: ${strongestHouses.slice(0, 3).join(', ') || 'not available yet'}`,
        `Pressure houses: ${weakestHouses.slice(0, 3).join(', ') || 'not available yet'}`,
      ].join('\n'),
      insight,
      upsell,
    ]);
  }

  if (action === 'report') {
    return joinSections([
      intro,
      buildReportBriefText({
        hasPremiumAccess,
        kundli,
        language,
      }),
      insight,
      buildUpsell(language, 'report', hasPremiumAccess, memory),
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
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4d96329497", [actionLabel]),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.898d0b09fa"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ac6be6ea3f"),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.30337fc546", [actionLabel]),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.3f91640cf2"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.c3c23d56da"),
    ].join('\n\n');
  }

  return [
    `Yes, I can do ${actionLabel} right here in chat.`,
    'First I need your Kundli. Send date of birth, birth time, and birth place; I will create the Kundli and continue the work here.',
    'If you only know the DOB, send that first. I will ask for the rest gently.',
  ].join('\n\n');
}

function buildReportBriefText({
  hasPremiumAccess,
  kundli,
  language,
}: {
  hasPremiumAccess: boolean;
  kundli: KundliData;
  language: SupportedLanguage;
}): string {
  const guidance = composeHolisticDailyGuidance(kundli, { language });
  const balance = composePurusharthaLifeBalance(kundli);
  const path = composeSadhanaRemedyPath(kundli);
  const lifeAtlas = composeLifeAtlasReport(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
  });
  const activeStage =
    path.stages.find(stage => stage.status === 'active' || stage.status === 'review') ??
    path.stages[0];
  const reportDepth = hasPremiumAccess
    ? 'Premium will add timing windows, contradictions, remedies, and evidence tables.'
    : 'Free will stay concise and useful; Premium adds deeper timing, proof, and remedies.';

  if (language === 'hi') {
    return [
      chatLine(
        language,
        'directAnswer',
        formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_ready_hi", [
          kundli.birthDetails.name,
        ]),
      ),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_signal_hi", [
        kundli.lagna,
        kundli.moonSign,
        kundli.dasha.current.mahadasha,
        kundli.dasha.current.antardasha,
      ]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_rhythm_hi", [
        guidance.headline,
      ]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_balance_hi", [
        balance.dominant.label,
        balance.needsCare.label,
      ]),
      activeStage
        ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_sadhana_hi", [
            activeStage.label,
            activeStage.practice,
          ])
        : undefined,
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_life_atlas_hi", [
        lifeAtlas.hiddenThread,
      ]),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_school_lane_hi"),
      getNativeCopy(
        hasPremiumAccess
          ? "native.packages.astrology.src.predictaChatActions.ts.report_brief_depth_premium_hi"
          : "native.packages.astrology.src.predictaChatActions.ts.report_brief_depth_free_hi",
      ),
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (language === 'gu') {
    return [
      chatLine(
        language,
        'directAnswer',
        formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_ready_gu", [
          kundli.birthDetails.name,
        ]),
      ),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_signal_gu", [
        kundli.lagna,
        kundli.moonSign,
        kundli.dasha.current.mahadasha,
        kundli.dasha.current.antardasha,
      ]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_rhythm_gu", [
        guidance.headline,
      ]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_balance_gu", [
        balance.dominant.label,
        balance.needsCare.label,
      ]),
      activeStage
        ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_sadhana_gu", [
            activeStage.label,
            activeStage.practice,
          ])
        : undefined,
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_life_atlas_gu", [
        lifeAtlas.hiddenThread,
      ]),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.report_brief_school_lane_gu"),
      getNativeCopy(
        hasPremiumAccess
          ? "native.packages.astrology.src.predictaChatActions.ts.report_brief_depth_premium_gu"
          : "native.packages.astrology.src.predictaChatActions.ts.report_brief_depth_free_gu",
      ),
    ]
      .filter(Boolean)
      .join('\n');
  }

  return [
    chatLine(
      language,
      'directAnswer',
      `I would start ${kundli.birthDetails.name} with the Life Atlas or Vedic report, depending on whether you want life direction or chart proof first.`,
    ),
    `Birth signal: ${kundli.lagna} Lagna, ${kundli.moonSign} Moon, ${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha} timing.`,
    `What this means: ${guidance.headline}`,
    `Life balance: ${balance.dominant.label} is leading; ${balance.needsCare.label} needs steadier care.`,
    activeStage
      ? `Action now: ${activeStage.label} - ${activeStage.practice}`
      : undefined,
    `Life Atlas thread: ${lifeAtlas.hiddenThread}`,
    'Report lanes stay separate: Vedic, KP, Jaimini, Numerology, Signature, and Life Atlas each keep their own purpose.',
    reportDepth,
  ]
    .filter(Boolean)
    .join('\n');
}

function actionIntro(
  language: SupportedLanguage,
  memory: PredictaInteractionMemory,
  _action: PredictaAppActionId,
): string {
  const turnIndex = Math.max(0, memory.totalTurns - 1);
  return getPredictaResponseOpening(language, turnIndex);
}

function buildMicroPrelude({
  action,
  kundli,
  language,
  text,
}: {
  action: PredictaAppActionId;
  kundli?: KundliData;
  language: SupportedLanguage;
  text: string;
}): string | undefined {
  const normalized = text.toLowerCase();
  const messages: string[] = [];

  if (action === 'create-kundli') {
    messages.push(
      getPredictaMicroMessage(language, 'needBirthPlacePrecision'),
      getPredictaMicroMessage(language, 'deterministicModeActive'),
    );
  }

  if (action === 'multi-school-consultation') {
    messages.push(getPredictaMicroMessage(language, 'checkingTimingFirst'));

    if (
      /\b(will|when|likely|possible|chance|timing|trigger|delay)\b/i.test(
        normalized,
      )
    ) {
      messages.push(getPredictaMicroMessage(language, 'kpUsefulEventQuestion'));
    }

    if (/\b(career|job|promotion|work)\b/i.test(normalized)) {
      messages.push(getPredictaMicroMessage(language, 'careerTimingFocus'));
    }
  }

  if (action === 'pass-redemption') {
    messages.push(getPredictaMicroMessage(language, 'passNearingExhaustion'));
  }

  if (action === 'report') {
    messages.push(getPredictaMicroMessage(language, 'reportReady'));
  }

  if (
    kundli &&
    (action === 'chart' ||
      action === 'mahadasha' ||
      action === 'saved-kundlis' ||
      action === 'transit-gochar')
  ) {
    messages.push(getPredictaMicroMessage(language, 'kundliSelected'));
  }

  const uniqueMessages = mergeUnique([], messages, 2);
  return uniqueMessages.length ? uniqueMessages.join('\n') : undefined;
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
    return getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.30314227ea");
  }
  if (language === 'gu') {
    return getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.695bfc2b0c");
  }
  return 'Premium path: Monthly/Yearly for deeper AI, Life Calendar, remedies, and reports. One-time Premium PDF for impulse purchase. Day Pass for trial. Compatibility/Marriage report as a separate high-intent purchase.';
}

function passRedemptionReply(
  language: SupportedLanguage,
  hasPremiumAccess: boolean,
): string {
  const activeLine = hasPremiumAccess
    ? 'Premium is active. Passes can still add report/question packs for family or one-off needs.'
    : 'Passes unlock exact benefits only after sign-in: AI question credits, report credits, Premium access, or family/friend offers.';

  if (language === 'hi') {
    return [
      activeLine,
      'Redeem pass screen par code enter karo. Predicta unfinished question ko preserve rakhegi, isliye pass apply hone ke baad wahi intent continue ho sakta hai.',
      'Cost control rule: deterministic Kundli, charts, dasha, Gochar, saved profiles, and Family Vault help AI credit spend nahi karte.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      activeLine,
      'Redeem pass screen ma code enter karo. Predicta tamaro unfinished question preserve rakhshe, etle pass apply thata j same intent continue thai shake.',
      'Cost control rule: deterministic Kundli, charts, dasha, Gochar, saved profiles, ane Family Vault help AI credit spend nathi karta.',
    ].join('\n\n');
  }

  return [
    activeLine,
    'Open Redeem Pass, enter the code, and I will keep your unfinished question attached so you can continue after the pass is applied.',
    'Cost-control promise: this deterministic help does not spend AI credits, including Kundli creation, saved profiles, charts, dasha, Gochar, and Family Vault rules.',
  ].join('\n\n');
}

function accountSettingsReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'Account aur Settings mein Google sign-in, profile, language, plan, saved access, and trust controls manage hote hain.',
      'Agar action sign-in maangta hai, main aapka current intent preserve rakhungi so you do not have to repeat yourself.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'Account ane Settings ma Google sign-in, profile, language, plan, saved access, ane trust controls manage thay chhe.',
      'Jo action sign-in mange, hu tamaro current intent preserve rakhish so tame farithi repeat na karvu pade.',
    ].join('\n\n');
  }

  return [
    'Account and Settings handle Google sign-in, profile, language, plan access, saved access, and trust controls.',
    'If the next step needs sign-in, I will preserve your current intent so you do not have to repeat the question.',
  ].join('\n\n');
}

function supportHelpReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'Predicta team ko contact kar sakte ho. Report, payment, Kundli, Signature, login, coupon, ya bug issue ho to category clear likho.',
      'Support email mein astrology prediction generate nahi hoti; prediction/report ke liye app ka proper reading flow use hoga.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'Predicta team ne contact kari shako cho. Report, payment, Kundli, Signature, login, coupon, ke bug issue hoy to category clear lakho.',
      'Support email ma astrology prediction generate thati nathi; prediction/report mate app nu proper reading flow use thashe.',
    ].join('\n\n');
  }

  return [
    'You can contact the Predicta team for report, payment, Kundli, Signature, login, coupon, or bug issues. Clear category details help us respond faster.',
    'Support email is not a prediction channel; astrology predictions and reports stay inside the proper Predicta reading flow.',
  ].join('\n\n');
}

function createKundliReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      'Kundli create karne ke liye mujhe name, date of birth, birth time, aur birth place chahiye.',
      'Agar birth time exact nahi hai, approximate time bhejo. Main time-confidence mark karungi aur sensitive predictions mein caution rakhungi.',
      'Ye deterministic flow hai; Kundli creation ke liye AI credit spend nahi hota.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'Kundli create karva mate mane name, date of birth, birth time, ane birth place joiye.',
      'Jo birth time exact na hoy, approximate time moklo. Hu time-confidence mark karish ane sensitive predictions ma caution rakhish.',
      'Aa deterministic flow chhe; Kundli creation mate AI credit spend thato nathi.',
    ].join('\n\n');
  }

  return [
    'To create a Kundli, send name, date of birth, birth time, and birth place.',
    'If the birth time is not exact, send the closest known time. I will mark the confidence and stay careful with sensitive predictions.',
    'This is a deterministic app action, so Kundli creation does not spend an AI credit.',
  ].join('\n\n');
}

function familyVaultSetupReply(
  language: SupportedLanguage,
  savedKundliCount: number,
): string {
  const countLine = `Saved Kundlis available: ${savedKundliCount}.`;

  if (language === 'hi') {
    return [
      countLine,
      'Family Vault mein saved Kundlis assign karo. Family comparison ke liye minimum 2 aur maximum 4 Kundlis ek saath allowed hain.',
      'Agar Kundli missing hai, pehle chat se birth details bhejo; main profile create karke Vault flow continue kar sakti hoon.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      countLine,
      'Family Vault ma saved Kundlis assign karo. Family comparison mate minimum 2 ane maximum 4 Kundlis ek sathe allowed chhe.',
      'Jo Kundli missing hoy, pehla chat ma birth details moklo; hu profile create kari Vault flow continue kari shakish.',
    ].join('\n\n');
  }

  return [
    countLine,
    'Assign saved Kundlis inside Family Vault. Family comparison needs at least 2 Kundlis and allows at most 4 at a time.',
    'If a Kundli is missing, send birth details in chat first; I can create the profile and keep the Family Vault intent alive.',
  ].join('\n\n');
}

function buildMultiSchoolConsultationReply({
  hasPremiumAccess,
  kundli,
  language,
  predictaSchool,
  text,
}: {
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  predictaSchool?: PredictaSchool;
  text: string;
}): string {
  const consultation = composePredictaMultiSchoolConsultation({
    hasPremiumAccess,
    kundli,
    language,
    predictaSchool,
    question: text,
  });

  if (consultation.status === 'room_safe_blocked') {
    return consultation.reply;
  }

  if (consultation.status === 'needs_kundli') {
    return consultation.reply;
  }

  if (language === 'hi') {
    return [
      consultation.reply,
      chatLine(language, 'schoolsConsulted', consultation.consultedSchools.join(', ')),
      chatPhrase(language, 'nativeSchoolBoundary'),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      consultation.reply,
      chatLine(language, 'schoolsConsulted', consultation.consultedSchools.join(', ')),
      chatPhrase(language, 'nativeSchoolBoundary'),
    ].join('\n\n');
  }

  const schoolLine = `Schools consulted: ${consultation.consultedSchools.join(', ')}.`;
  const boundary =
    'I am naming the schools I used instead of silently mixing methods.';

  return [
    consultation.reply,
    schoolLine,
    boundary,
  ].join('\n\n');
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
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.16a1e551e8"),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.7427e3238c", [current.mahadasha, current.antardasha]),
      themeLine
        ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.06c2ee80dc", [themeLine])
        : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.cedff2ba93"),
      `Chart proof:\n${standoutSignals.map(signal => `- ${signal}`).join('\n')}`,
      `Memory check: ${comparison}`,
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ecc7b8bd74"),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.f5bece9007"),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.820bbd6cc8", [current.mahadasha, current.antardasha]),
      themeLine
        ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.01499297b9", [themeLine])
        : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4d3b9c0ae2"),
      `Chart proof:\n${standoutSignals.map(signal => `- ${signal}`).join('\n')}`,
      `Memory check: ${comparison}`,
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.3d7d8c579d"),
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
      ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a1f6dcd421", [count, names])
      : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ec7dacc0d4");
  }
  if (language === 'gu') {
    return count
      ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.caaad35b60", [count, names])
      : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ee5b896b97");
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
      chatLine(
        language,
        'directAnswer',
        formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.16851ef744", [dasha.current.mahadasha, dasha.current.antardasha]),
      ),
      chatLine(language, 'timing', chatPhrase(language, 'activeConditionTiming')),
      chatLine(language, 'confidence', localizedConfidence(language, dasha.current.confidence)),
      chatLine(language, 'proof', chatPhrase(language, 'eventEvidenceGeneric')),
      nativePremiumLine(language, hasPremiumAccess),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      chatLine(
        language,
        'directAnswer',
        formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.8942035854", [dasha.current.mahadasha, dasha.current.antardasha]),
      ),
      chatLine(language, 'timing', chatPhrase(language, 'activeConditionTiming')),
      chatLine(language, 'confidence', localizedConfidence(language, dasha.current.confidence)),
      chatLine(language, 'proof', chatPhrase(language, 'eventEvidenceGeneric')),
      nativePremiumLine(language, hasPremiumAccess),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `Direct answer: I am reading your ${dasha.current.mahadasha}/${dasha.current.antardasha} from the dasha timing layer.`,
    `Timing: ${chatPhrase(language, 'activeConditionTiming')}`,
    dasha.current.freeInsight,
    `Confidence: ${dasha.current.confidence}`,
    evidence ? `Proof:\n${evidence}` : '',
    windows ? `Timing windows:\n${windows}` : '',
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildKundliKarmaLocalMemoryReply({
  chartContext,
  hasPremiumAccess,
  kundli,
  language,
  text,
}: {
  chartContext?: ChartContext;
  hasPremiumAccess: boolean;
  kundli?: KundliData;
  language: SupportedLanguage;
  text: string;
}): string {
  const normalized = normalizeKundliKarmaText(text);

  if (!kundli) {
    return buildKundliKarmaDefinitionReply();
  }

  const packets = buildKundliKarmaPackets(kundli);
  const snapshot = composeKundliKarmaSnapshot(kundli, {
    intelligencePackets: packets,
  });
  const allItems = packets.flatMap(packet => packet.items);
  const selectedItem =
    findContextSelectedKundliKarmaItem(allItems, chartContext) ??
    findTextSelectedKundliKarmaItem(allItems, normalized);
  const selectedCondition =
    selectedItem &&
    snapshot.rankedConditions.find(
      condition => condition.item.id === selectedItem.id,
    );

  if (
    !selectedItem &&
    /\b(top\s*3|three|snapshot|overview|summary|kundli\s*karma)\b/i.test(text)
  ) {
    if (isNativeChatLanguage(language)) {
      const top = snapshot.topThreeActiveConditions
        .map(condition => `- ${kundliKarmaModuleTerm(condition.item)}`)
        .join('\n');
      return [
        chatLine(language, 'directAnswer', chatPhrase(language, 'kundliKarmaSnapshotReady')),
        chatLine(language, 'timing', chatPhrase(language, 'activeConditionTiming')),
        chatLine(language, 'confidence', localizedConfidence(language, 'Medium')),
        top
          ? chatLine(language, 'topActiveConditions', `\n${top}`)
          : chatLine(language, 'topActiveConditions', chatPhrase(language, 'kundliKarmaNoActive')),
        chatLine(
          language,
          'evidence',
          snapshot.rankedConditions
            .slice(0, 3)
            .map(condition => kundliKarmaModuleTerm(condition.item))
            .join(', ') || chatPhrase(language, 'kundliKarmaNoActive'),
        ),
        chatLine(language, 'actionRemedy', chatPhrase(language, 'remedySafeStart')),
        chatPhrase(language, 'shrapSafety'),
        chatPhrase(language, 'calculatedMemoryNoAi'),
      ].join('\n\n');
    }
    const top = snapshot.topThreeActiveConditions
      .map(condition => formatKundliKarmaConditionLine(condition))
      .join('\n');
    return [
      'Direct answer: your Kundli Karma snapshot is ready from calculated Predicta memory. No AI credit is needed.',
      'Timing: active conditions should be judged through their dasha/transit activation, not fear or instant conclusions.',
      'Confidence: Medium. This snapshot ranks deterministic Dosh, Shrap, Yog, and Lal Kitab signals but still keeps remedies proportional.',
      snapshot.summary,
      top ? `Top active conditions:\n${top}` : 'No major active condition is ranked in the implemented deterministic checks.',
      `Evidence: ${snapshot.rankedConditions.slice(0, 3).map(condition => condition.item.displayName).join(', ') || 'No ranked condition is active yet.'}`,
      snapshot.topRemedy
        ? `Start safely with: ${snapshot.topRemedy.title}. ${snapshot.topRemedy.description}`
        : 'Start safely with one simple karma/dharma correction instead of fear-based remedies.',
      'I will never describe Shrap as a curse. I read it as a karmic pressure indicator with evidence, timing, and safe corrective action.',
    ].join('\n\n');
  }

  const condition =
    selectedCondition ??
    resolveRequestedKundliKarmaCondition(snapshot.rankedConditions, normalized);
  const item = selectedItem ?? condition?.item;

  if (!item) {
    if (isNativeChatLanguage(language)) {
      return [
        chatLine(language, 'directAnswer', chatPhrase(language, 'kundliKarmaDefinition')),
        chatLine(language, 'timing', chatPhrase(language, 'kundliKarmaPending')),
        chatLine(language, 'confidence', chatPhrase(language, 'broadConditionLowConfidence')),
        chatLine(
          language,
          'evidence',
          snapshot.rankedConditions
            .slice(0, 3)
            .map(condition => kundliKarmaModuleTerm(condition.item))
            .join(', ') || chatPhrase(language, 'kundliKarmaNoActive'),
        ),
        chatLine(language, 'nextStep', chatPhrase(language, 'kpActionQuestion')),
        chatPhrase(language, 'calculatedMemoryNoAi'),
      ].join('\n\n');
    }
    return [
      'Direct answer: I can read Kundli Karma when the Dosh, Shrap, Yog, or Lal Kitab item is identifiable in your calculated chart. No AI credit is needed.',
      'Timing: pending until a specific active item is selected.',
      'Confidence: Low for this broad request because I need one condition to avoid generic fear-selling.',
      snapshot.summary,
      `Evidence: ${snapshot.rankedConditions.slice(0, 3).map(condition => condition.item.displayName).join(', ') || 'No ranked condition is active yet.'}`,
      'Useful next questions: "explain my strongest Dosh", "why is this Shrap present", "show my supportive Yog", or "give Lal Kitab upay".',
    ].join('\n\n');
  }

  if (item.status === 'not_present' || item.status === 'blocked_context') {
    if (isNativeChatLanguage(language)) {
      return [
        chatLine(
          language,
          'directAnswer',
          `${item.displayName}: ${formatKundliKarmaStatus(item.status)}`,
        ),
        chatLine(language, 'timing', item.activation.summary),
        chatLine(language, 'confidence', localizedConfidence(language, item.confidence)),
        chatLine(language, 'evidence', formatKundliKarmaEvidence(item)),
        chatLine(language, 'guidance', chatPhrase(language, 'remedySafeStart')),
        chatPhrase(language, 'calculatedMemoryNoAi'),
      ].join('\n\n');
    }
    return [
      `Direct answer: ${item.displayName} is ${formatKundliKarmaStatus(item.status)} in this check.`,
      `Timing: ${item.activation.summary}`,
      `Confidence: ${item.confidence}.`,
      `Evidence:\n${formatKundliKarmaEvidence(item)}`,
      item.whyPresent,
      item.meaningForUser,
      item.status === 'blocked_context'
        ? 'Predicta will not force this into a single-person Kundli reading because the required context is different.'
        : 'Because the required combination is not active, I will not create fear or sell a remedy for it.',
      'This answer uses your calculated Predicta memory. No AI credit is needed.',
    ].join('\n\n');
  }

  if (item.status === 'needs_data' || item.status === 'pending_evidence') {
    if (isNativeChatLanguage(language)) {
      return [
        chatLine(
          language,
          'directAnswer',
          `${item.displayName}: ${formatKundliKarmaStatus(item.status)}`,
        ),
        chatLine(language, 'timing', item.activation.summary),
        chatLine(language, 'confidence', localizedConfidence(language, item.confidence)),
        chatLine(
          language,
          'availableEvidence',
          item.evidence.length
            ? formatKundliKarmaEvidence(item)
            : chatPhrase(language, 'kundliKarmaNoActive'),
        ),
        chatPhrase(language, 'kundliKarmaSpecificPending'),
        chatPhrase(language, 'calculatedMemoryNoAi'),
      ].join('\n\n');
    }
    return [
      `Direct answer: ${item.displayName} is ${formatKundliKarmaStatus(item.status)} right now.`,
      `Timing: ${item.activation.summary}`,
      `Confidence: ${item.confidence}.`,
      item.whyPresent,
      item.meaningForUser,
      item.evidence.length
        ? `Available evidence:\n${formatKundliKarmaEvidence(item)}`
        : 'The deterministic engine does not yet have enough clean evidence to activate this item.',
      'I will stay honest here: this should remain pending until the missing data or approved rule evidence is available.',
      'This answer uses your calculated Predicta memory. No AI credit is needed.',
    ].join('\n\n');
  }

  const remedies = item.remedies
    .filter(remedy => hasPremiumAccess || remedy.depth === 'free')
    .slice(0, hasPremiumAccess ? 5 : 2)
    .map(remedy => `- ${remedy.title}: ${remedy.description} Safety: ${remedy.safetyNote}`)
    .join('\n');
  const reductions = item.reductions
    .slice(0, 3)
    .map(reduction => `- ${reduction.description} (${reduction.confidence})`)
    .join('\n');

  return [
    ...(isNativeChatLanguage(language)
      ? [
          chatLine(
            language,
            'directAnswer',
            `${item.displayName}: ${formatKundliKarmaStatus(item.status)}, ${item.strength}`,
          ),
          chatLine(language, 'evidence', formatKundliKarmaEvidence(item)),
          chatLine(language, 'timing', item.activation.summary),
          chatLine(language, 'confidence', localizedConfidence(language, item.confidence)),
          chatLine(
            language,
            'actionRemedy',
            remedies || chatPhrase(language, 'remedySafeStart'),
          ),
          nativePremiumLine(language, hasPremiumAccess),
          chatPhrase(language, 'calculatedMemoryNoAi'),
        ]
      : [
    `Direct answer: ${item.displayName} is ${formatKundliKarmaStatus(item.status)} with ${item.strength} strength and ${item.confidence} confidence.`,
    `Why this appears: ${item.whyPresent}`,
    `Evidence:\n${formatKundliKarmaEvidence(item)}`,
    `What it means for you: ${item.meaningForUser}`,
    `Timing: ${item.activation.summary}`,
    reductions
      ? `What softens or reduces it:\n${reductions}`
      : 'What softens it: no strong cancellation is recorded in this deterministic check, so use the remedy gently and keep the reading proportional.',
    remedies
      ? `${hasPremiumAccess ? 'Premium remedy depth' : 'Free safe remedy'}:\n${remedies}`
      : 'Remedy: keep this to simple karma/dharma correction until a safe remedy is available.',
    hasPremiumAccess
      ? 'Premium depth is active, so I can include deeper remedy timing and cross-chart evidence when the report asks for it.'
      : 'Free depth gives the useful meaning and safe starting action. Premium adds deeper timing, cross-chart evidence, and structured remedies without fear-selling.',
    'This answer uses your calculated Predicta memory. No AI credit is needed.',
        ]),
  ].join('\n\n');
}

function buildKundliKarmaDefinitionReply(): string {
  return [
    'Direct answer: Kundli Karma covers Dosh, Shrap, Yog, and Lal Kitab as calculated chart patterns. No AI credit is needed for the basic explanation.',
    'Dosh means a pressure pattern in the Kundli. Shrap means a karmic pressure indicator, not a curse. Yog means a supportive or challenging planetary pattern. Lal Kitab is a separate remedial language focused on house-wise planet behavior, Rin/debt indicators, practical upay, and do/don’t guidance.',
    'For your own Kundli, I need the active chart first. Then I can explain why a pattern appears, exact evidence, meaning, activation, softening factors, and safe remedies.',
  ].join('\n\n');
}

function buildKundliKarmaPackets(
  kundli: KundliData,
): KundliKarmaIntelligence[] {
  return [
    composeKundliKarmaDoshIntelligence(kundli),
    composeKundliKarmaShrapIntelligence(kundli),
    composeKundliKarmaYogIntelligence(kundli),
    composeKundliKarmaLalKitabIntelligence(kundli),
  ];
}

function resolveRequestedKundliKarmaCondition(
  conditions: KundliKarmaRankedCondition[],
  normalized: string,
): KundliKarmaRankedCondition | undefined {
  if (/\b(shrap|shrapa|rin|debt|pitru|matru|sarpa|naga)\b/i.test(normalized)) {
    return conditions.find(condition => condition.item.module === 'SHRAP') ??
      conditions.find(condition => condition.item.module === 'LAL_KITAB' && /rin|debt/i.test(condition.item.displayName));
  }
  if (/\b(supportive|positive|raja|dhana|gajakesari|lakshmi|saraswati)\b/i.test(normalized)) {
    return conditions.find(condition => condition.item.module === 'SUPPORTIVE_YOG');
  }
  if (/\b(challenging|negative|shakata|grahan|angarak|vish|daridra|kemadruma)\b/i.test(normalized)) {
    return conditions.find(condition => condition.item.module === 'CHALLENGING_YOG');
  }
  if (/\b(lal\s*kitab|upay|upaay|remedy|rin)\b/i.test(normalized)) {
    return conditions.find(condition => condition.item.module === 'LAL_KITAB');
  }
  if (/\b(dosh|dosha|manglik|kaal|pitra|guru\s*chandal)\b/i.test(normalized)) {
    return conditions.find(condition => condition.item.module === 'DOSH');
  }
  return conditions[0];
}

function findContextSelectedKundliKarmaItem(
  items: KundliKarmaItem[],
  chartContext?: ChartContext,
): KundliKarmaItem | undefined {
  if (!chartContext) {
    return undefined;
  }
  return items.find(
    item =>
      item.id === chartContext.selectedKundliKarmaItemId ||
      item.ruleId === chartContext.selectedKundliKarmaRuleId,
  );
}

function findTextSelectedKundliKarmaItem(
  items: KundliKarmaItem[],
  normalized: string,
): KundliKarmaItem | undefined {
  return items.find(item => {
    const display = normalizeKundliKarmaText(item.displayName);
    const rule = normalizeKundliKarmaText(item.ruleId);
    return normalized.includes(display) ||
      display
        .split(/\s+|\/|-/)
        .filter(part => part.length > 3 && !isGenericKundliKarmaToken(part))
        .some(part => normalized.includes(part)) ||
      normalized.includes(rule);
  });
}

function isGenericKundliKarmaToken(token: string): boolean {
  return [
    'dosh',
    'dosha',
    'shrap',
    'shrapa',
    'yog',
    'yoga',
    'lal',
    'kitab',
    'rin',
  ].includes(token);
}

function formatKundliKarmaConditionLine(
  condition: KundliKarmaRankedCondition,
): string {
  return `- #${condition.rank} ${condition.item.displayName}: ${condition.item.summary}`;
}

function formatKundliKarmaEvidence(item: KundliKarmaItem): string {
  const evidence = item.evidence.slice(0, 5);
  if (!evidence.length) {
    return '- Evidence is pending in the deterministic contract.';
  }
  return evidence
    .map(entry => {
      const details = [
        entry.chart ? `chart ${entry.chart}` : '',
        entry.planet ? `planet ${entry.planet}` : '',
        entry.house ? `house ${entry.house}` : '',
        entry.sign ? `sign ${entry.sign}` : '',
        entry.nakshatra ? `nakshatra ${entry.nakshatra}` : '',
      ]
        .filter(Boolean)
        .join(', ');
      return `- ${entry.description}${details ? ` (${details})` : ''}`;
    })
    .join('\n');
}

function formatKundliKarmaStatus(status: KundliKarmaItem['status']): string {
  const labels: Record<KundliKarmaItem['status'], string> = {
    blocked_context: 'blocked for this context',
    cancelled: 'cancelled or strongly softened',
    needs_data: 'pending more data',
    not_present: 'not present',
    pending_evidence: 'pending approved evidence',
    present: 'present',
    weak: 'weak',
  };
  return labels[status];
}

function normalizeKundliKarmaText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s/-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function isKundliKarmaDefinitionQuestion(text: string): boolean {
  return /\b(what\s*is|define|meaning|explain|samjhao|samjavo)\b/i.test(text) &&
    /\b(dosh|dosha|shrap|shrapa|yog|yoga|lal\s*kitab|kundli\s*karma)\b/i.test(text) &&
    !/\b(my|mine|mera|meri|maru|mara|present|kundli|chart)\b/i.test(text.replace(/\bkundli\s*karma\b/i, ''));
}

function isGeminiJyotishAlias(text: string): boolean {
  return /\b(gemini\s*jyotish|gemini\s*astrology|gemini\s*karaka|gemini\s*chara|gemini\s*predicta)\b/i.test(text);
}

function geminiJyotishAliasReply(language: SupportedLanguage): string {
  const reply = [
    'You likely mean Jaimini Jyotish. I will treat "Gemini Jyotish" as a Jaimini Jyotish alias in astrology context.',
    'Gemini remains only AI-provider terminology inside Predicta systems; it is not the astrology school name.',
    'For Jaimini, I can guide you through Atmakaraka, Amatyakaraka, Darakaraka, Arudha, Upapada, Swamsa, Karakamsha, Jaimini aspects, and Chara Dasha without mixing KP or Parashari unless you ask for a synthesis report.',
  ].join('\n\n');
  if (language === 'hi' || language === 'gu') {
    return reply;
  }
  return reply;
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
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.b44e95f49c"),
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
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.7efbde942e"),
      `Birth star: ${coverage.nakshatraInsight.moonNakshatra} pada ${coverage.nakshatraInsight.pada}, lord ${coverage.nakshatraInsight.lord}.`,
      coverage.nakshatraInsight.simpleInsight,
      modules ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.e2d9ec5321", [modules]) : '',
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
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4a82a1e541", [sadeSati.phaseLabel]),
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
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4357a54c27", [sadeSati.phaseLabel]),
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
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ee24336b10", [gochar.dominantWeight]),
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
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a01cfad085", [gochar.dominantWeight]),
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
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.46247ed290"),
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
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.0112c1c649"),
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
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.811aca654d"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.0d02c48913"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.722cf02f48"),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.568e7b29f2"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4e3b0fbfb5"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ceb2e55c91"),
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
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.3cc082dd65"),
      synthesis,
      shifts ? `House shifts:\n${shifts}` : 'House shifts: no major shift is available in this Kundli yet.',
      foundation.premiumUnlock,
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.17d3a30abb"),
      synthesis,
      shifts ? `House shifts:\n${shifts}` : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.55577c28b3"),
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
  const nextAction = kp.eventJudgement.nextQuestion || 'Ask one exact event question so KP can judge promise, block, timing, and proof.';
  const confidenceLabel =
    kp.eventJudgement.confidence === 'clear'
      ? 'High'
      : kp.eventJudgement.confidence === 'partial'
        ? 'Medium'
        : 'Low';

  if (language === 'hi') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.0f0614b58d"),
      chatLine(
        language,
        'eventVerdict',
        localizedKpVerdict(language, kp.eventJudgement.verdictLabel),
      ),
      chatLine(language, 'timing', chatPhrase(language, 'kpTimingGeneric')),
      chatLine(language, 'confidence', localizedConfidence(language, confidenceLabel)),
      chatLine(language, 'actionRemedy', chatPhrase(language, 'kpActionQuestion')),
      chatLine(language, 'evidence', chatPhrase(language, 'kpEvidenceGeneric')),
      nativePremiumLine(language, hasPremiumAccess),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.5aac1f7478"),
      chatLine(
        language,
        'eventVerdict',
        localizedKpVerdict(language, kp.eventJudgement.verdictLabel),
      ),
      chatLine(language, 'timing', chatPhrase(language, 'kpTimingGeneric')),
      chatLine(language, 'confidence', localizedConfidence(language, confidenceLabel)),
      chatLine(language, 'actionRemedy', chatPhrase(language, 'kpActionQuestion')),
      chatLine(language, 'evidence', chatPhrase(language, 'kpEvidenceGeneric')),
      nativePremiumLine(language, hasPremiumAccess),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `Direct answer: ${kp.eventJudgement.verdictLabel}. ${kp.eventJudgement.plainLanguage}`,
    `Timing: ${kp.eventJudgement.timingReadiness}`,
    `Confidence: ${confidenceLabel}. ${kp.eventJudgement.promise}`,
    `Action/remedy: ${nextAction}`,
    kp.freeInsight,
    `Evidence:\n${[
      cuspLine,
      kp.eventJudgement.promise,
      kp.eventJudgement.mainBlock,
    ]
      .filter(Boolean)
      .join(' | ') || 'KP proof is pending richer cusp/sub-lord data.'}`,
    significators ? `Significators:\n${significators}` : '',
    ruling,
    hasPremiumAccess ? kp.premiumSynthesis : foundation.premiumUnlock,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function jaiminiHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      getNativeCopy('astrology.jaimini.handoff.1.hi'),
      getNativeCopy('astrology.jaimini.handoff.2.hi'),
      getNativeCopy('astrology.jaimini.handoff.3.hi'),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy('astrology.jaimini.handoff.1.gu'),
      getNativeCopy('astrology.jaimini.handoff.2.gu'),
      getNativeCopy('astrology.jaimini.handoff.3.gu'),
    ].join('\n\n');
  }

  return [
    'That belongs to Jaimini Predicta. I will not mix it into Parashari or KP or sound more certain than the calculated evidence allows.',
    'Use “Open Jaimini Predicta” below. I will carry your question and active birth profile into the Jaimini room.',
    'Jaimini Predicta works through Atmakaraka, Amatyakaraka, Darakaraka, Karakamsha, Swamsa, Arudha, Upapada, Jaimini aspects, and Chara Dasha. It does not claim unsupported manuscript authority.',
  ].join('\n\n');
}

function buildJaiminiPredictaReply(
  language: SupportedLanguage,
  kundli: KundliData | undefined,
  hasPremiumAccess: boolean,
): string {
  const interpretation = composeJaiminiInterpretation(kundli, {
    premium: hasPremiumAccess,
  });
  const blocks = hasPremiumAccess
    ? interpretation.premiumBlocks.slice(0, 4)
    : interpretation.freeBlocks.slice(0, 3);
  const firstBlock = blocks[0];
  const jaiminiAction = firstBlock?.guidance ?? 'Use the destiny direction as a decision filter before forcing a timing promise.';
  const premiumLine = hasPremiumAccess
    ? 'Premium Jaimini depth is active: I can connect soul role, work role, relationship mirror, visible identity, and timing chapter into one sharper action map.'
    : 'Premium Jaimini adds fuller karaka evidence, visible identity, relationship mirror, Chara Dasha depth, and report-ready synthesis.';

  if (language === 'hi') {
    return [
      getNativeCopy('astrology.jaimini.mode.hi'),
      chatLine(
        language,
        'directAnswer',
        chatPhrase(language, 'jaiminiDirect'),
      ),
      chatLine(language, 'timing', chatPhrase(language, 'jaiminiTiming')),
      chatLine(language, 'confidence', chatPhrase(language, 'jaiminiMediumConfidence')),
      chatLine(language, 'actionRemedy', chatPhrase(language, 'jaiminiAction')),
      chatLine(language, 'evidence', chatPhrase(language, 'jaiminiEvidence')),
      nativePremiumLine(language, hasPremiumAccess),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy('astrology.jaimini.mode.gu'),
      chatLine(
        language,
        'directAnswer',
        chatPhrase(language, 'jaiminiDirect'),
      ),
      chatLine(language, 'timing', chatPhrase(language, 'jaiminiTiming')),
      chatLine(language, 'confidence', chatPhrase(language, 'jaiminiMediumConfidence')),
      chatLine(language, 'actionRemedy', chatPhrase(language, 'jaiminiAction')),
      chatLine(language, 'evidence', chatPhrase(language, 'jaiminiEvidence')),
      nativePremiumLine(language, hasPremiumAccess),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `Direct answer: ${firstBlock?.prediction ?? interpretation.summary}`,
    'Timing: Jaimini gives destiny direction first; exact timing should be confirmed through dasha/KP when the question needs a date window.',
    'Confidence: Medium. This is destiny-direction evidence, not a stand-alone event verdict.',
    `Action/remedy: ${jaiminiAction}`,
    interpretation.technicalEvidence.length
      ? `Evidence:\n${interpretation.technicalEvidence.slice(0, 4).map(item => `- ${item}`).join('\n')}`
      : undefined,
    premiumLine,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function numerologyHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.2e6c562765"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.57074b8834"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.06e36dccc8"),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.47f7deb0f1"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.73f8e51c2c"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.bc765fcd02"),
    ].join('\n\n');
  }

  return [
    'That belongs to Numerology Predicta. I will not casually mix it with Parashari, KP, or Jaimini methods.',
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
        getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a1338e8c1e"),
        getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a69d1a9816"),
      ].join('\n\n');
    }
    if (language === 'gu') {
      return [
        getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.07016ecc9e"),
        getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.6fb34dedaa"),
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
    formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.fb197f9e37", [profile.nameNumber.root, profile.method.nameNumber, profile.normalizedName]),
    formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.d8a399b132", [profile.birthNumber.root, profile.birthDate]),
    formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.fb3c9f9abc", [profile.destinyNumber.root, profile.birthDate]),
    hasPremiumAccess
      ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.474594337d", [profile.targetDate])
      : '',
  ]
    .filter(Boolean)
    .join('\n');
  const gujaratiProof = [
    formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.6733238c4b", [profile.nameNumber.root, profile.method.nameNumber, profile.normalizedName]),
    formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.28a1f16de6", [profile.birthNumber.root, profile.birthDate]),
    formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.792ea5740d", [profile.destinyNumber.root, profile.birthDate]),
    hasPremiumAccess
      ? formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.17986a06f7", [profile.targetDate])
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  if (language === 'hi') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.eb11afe365"),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.3ea05ea292", [profile.name, profile.nameNumber.root, profile.nameNumber.label, profile.birthNumber.root, profile.birthNumber.label, profile.destinyNumber.root, profile.destinyNumber.label]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.609a49b4e5", [profile.personalYear.root, profile.personalMonth.root, profile.personalDay.root]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.7288cc83f2", [profile.name, numerologyNativeKeyword(
        'hi',
        profile.nameNumber.root,
      ), numerologyNativeKeyword(
        'hi',
        profile.birthNumber.root,
      ), numerologyNativeKeyword(
        'hi',
        profile.destinyNumber.root,
      ), profile.personalDay.root]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.d0fe0a77b0", [[
        numerologyNativeKeyword('hi', profile.nameNumber.root),
        numerologyNativeKeyword('hi', profile.birthNumber.root),
        numerologyNativeKeyword('hi', profile.destinyNumber.root),
      ].join(', ')]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.b3cc47c35d", [[
        numerologyNativeCaution('hi', profile.nameNumber.root),
        numerologyNativeCaution('hi', profile.personalYear.root),
      ].join(', ')]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.d0c265886c", [hindiProof]),
      hasPremiumAccess
        ? getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.e101bc5f12")
        : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a8b7b706b7"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.6ce2a63373"),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.cd8c9b66ae", [profile.name, profile.nameNumber.root, profile.nameNumber.label, profile.birthNumber.root, profile.birthNumber.label, profile.destinyNumber.root, profile.destinyNumber.label]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.8bb45d8d96", [profile.personalYear.root, profile.personalMonth.root, profile.personalDay.root]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.2a7b7b313c", [profile.name, numerologyNativeKeyword(
        'gu',
        profile.nameNumber.root,
      ), numerologyNativeKeyword(
        'gu',
        profile.birthNumber.root,
      ), numerologyNativeKeyword(
        'gu',
        profile.destinyNumber.root,
      ), profile.personalDay.root]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.d247dae1fa", [[
        numerologyNativeKeyword('gu', profile.nameNumber.root),
        numerologyNativeKeyword('gu', profile.birthNumber.root),
        numerologyNativeKeyword('gu', profile.destinyNumber.root),
      ].join(', ')]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.67074473a0", [[
        numerologyNativeCaution('gu', profile.nameNumber.root),
        numerologyNativeCaution('gu', profile.personalYear.root),
      ].join(', ')]),
      formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.8b720810fd", [gujaratiProof]),
      hasPremiumAccess
        ? getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ce4c4dec42")
        : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.351fd7bc84"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `Direct answer: ${profile.summary}`,
    `Timing: personal year ${profile.personalYear.root}, month ${profile.personalMonth.root}, day ${profile.personalDay.root}.`,
    'Confidence: Medium. Numerology is a timing-color and name-rhythm layer, not a hard event promise by itself.',
    `Action/remedy: use today as a ${profile.personalDay.label.toLowerCase()} day; keep decisions aligned with the current cycle instead of forcing everything at once.`,
    `${profile.name}: name number ${profile.nameNumber.root} (${profile.nameNumber.label}), birth number ${profile.birthNumber.root} (${profile.birthNumber.label}), destiny number ${profile.destinyNumber.root} (${profile.destinyNumber.label}).`,
    strengths ? `Strengths: ${strengths}` : '',
    cautions ? `Care points: ${cautions}` : '',
    proof ? `Evidence:\n${proof}` : '',
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
    1: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.61bb9d8404"),
    2: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.d9f4c970ff"),
    3: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.5b0ab544ba"),
    4: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.2317a1df9a"),
    5: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.31abd9f988"),
    6: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a4f2b461e2"),
    7: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ef7a9fe575"),
    8: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.721c2d26ed"),
    9: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.389e461a47"),
  };
  const gujarati: Record<number, string> = {
    1: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.5b4700a702"),
    2: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.cffc715e72"),
    3: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.503f2f681b"),
    4: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.150e084f7a"),
    5: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.8ac97d8bda"),
    6: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.0de1f958aa"),
    7: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.c6a25688fe"),
    8: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ed52f2ee40"),
    9: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a4d7b29f43"),
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
    1: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4ed712e274"),
    2: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.9b99bcd40f"),
    3: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.00923834d0"),
    4: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.22e5f31270"),
    5: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.abfb1a57b1"),
    6: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.5d8b6ff207"),
    7: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.10bb1276a5"),
    8: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.9f50f11658"),
    9: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.6e4b318e33"),
  };
  const gujarati: Record<number, string> = {
    1: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.420d29fb33"),
    2: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4cd481c097"),
    3: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.73e8cfebff"),
    4: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.1f2b311f1b"),
    5: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.39f9389dbf"),
    6: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.c600b18eb2"),
    7: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a5e11984c5"),
    8: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.8c234fa6fc"),
    9: getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.10f5958862"),
  };

  return language === 'gu'
    ? gujarati[root] ?? gujarati[1]
    : hindi[root] ?? hindi[1];
}

function signatureHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.286ffab532"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4755072060"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.5411acb244"),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ab9efb65b7"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.5f672c2184"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.c9aa7d40b1"),
    ].join('\n\n');
  }

  return [
    'That belongs to Signature Predicta. I will not casually mix it with Kundli, KP, Jaimini, or Numerology methods.',
    'Use “Open Signature Predicta” below. I will carry your question into the signature room, where you can upload a signature or draw one before analysis.',
    'Signature Predicta reads confirmed traits only after the signature is ready: visual traits, self-expression patterns, and practical improvement suggestions. It is not identity verification, handwriting forensics, legal proof, medical diagnosis, hiring advice, or a guaranteed prediction.',
  ].join('\n\n');
}

function vedicHandoffReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.2d62b07e1c"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.d192f5efaf"),
      'Vedic Predicta D1/Rashi, Vargas, dasha, gochar, Parashari Chalit, yogas, remedies, aur holistic timing se answer karegi.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.d1c42379c4"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.b6871942f8"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.19fbc37793"),
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
        chatLine(language, 'directAnswer', chatPhrase(language, 'signatureReadySummary')),
        chatLine(
          language,
          'observedTraits',
          nativeSignatureTraitList(language, analysis.observedTraits),
        ),
        chatLine(language, 'timing', chatPhrase(language, 'signatureSessionTiming')),
        chatLine(language, 'confidence', chatPhrase(language, 'signatureReflectiveConfidence')),
        chatLine(language, 'evidence', chatPhrase(language, 'signatureTraitEvidence')),
        chatLine(language, 'actionRemedy', chatPhrase(language, 'remedySafeStart')),
        buildSignatureSafetyReply(language),
        nativePremiumLine(language, hasPremiumAccess),
      ].join('\n\n');
    }
    return [
      chatLine(language, 'directAnswer', chatPhrase(language, 'signaturePendingSummary')),
      promptHasConfirmedTraits
        ? getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a2aaa90b2c")
        : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.266e3f0e1c"),
      chatLine(language, 'evidence', chatPhrase(language, 'signatureTraitEvidence')),
      buildSignatureSafetyReply(language),
      nativePremiumLine(language, hasPremiumAccess),
    ].join('\n\n');
  }

  if (language === 'gu') {
    if (analysis.status === 'ready') {
      return [
        chatLine(language, 'directAnswer', chatPhrase(language, 'signatureReadySummary')),
        chatLine(
          language,
          'observedTraits',
          nativeSignatureTraitList(language, analysis.observedTraits),
        ),
        chatLine(language, 'timing', chatPhrase(language, 'signatureSessionTiming')),
        chatLine(language, 'confidence', chatPhrase(language, 'signatureReflectiveConfidence')),
        chatLine(language, 'evidence', chatPhrase(language, 'signatureTraitEvidence')),
        chatLine(language, 'actionRemedy', chatPhrase(language, 'remedySafeStart')),
        buildSignatureSafetyReply(language),
        nativePremiumLine(language, hasPremiumAccess),
      ].join('\n\n');
    }
    return [
      chatLine(language, 'directAnswer', chatPhrase(language, 'signaturePendingSummary')),
      promptHasConfirmedTraits
        ? getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.368254f316")
        : getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.9ea028a5cb"),
      chatLine(language, 'evidence', chatPhrase(language, 'signatureTraitEvidence')),
      buildSignatureSafetyReply(language),
      nativePremiumLine(language, hasPremiumAccess),
    ].join('\n\n');
  }

  if (analysis.status === 'ready') {
    return [
      `Direct answer: ${analysis.summary}`,
      'Timing: this reflects the current signature sample only.',
      'Confidence: Medium reflective confidence. Signature is reflective guidance, not prediction or forensic proof.',
      `Action/remedy: ${analysis.improvementPlan.slice(0, 2).join(' ')}`,
      `Observed traits: ${analysis.observedTraits.map(trait => `${trait.label} ${trait.value}`).join(', ')}.`,
      `Writing rhythm: ${analysis.rhythm.summary}`,
      `Confidence expression: ${analysis.confidenceExpression.summary}`,
      `Evidence: ${analysis.evidence.slice(0, 3).join(' | ')}`,
      premiumLine,
    ].join('\n\n');
  }

  return [
    'Signature Predicta mode: I will read the signature as a self-expression and personal rhythm layer.',
    promptHasConfirmedTraits
      ? 'I have the confirmed signature traits. I will read only from those traits, not guess from hidden identity or document authenticity.'
      : 'First upload/draw a signature or confirm the visible traits. Predicta will only analyze confirmed visible traits: size, slant, pressure, spacing, baseline, legibility, flourish, and underline.',
    'I can suggest improvements for clearer readability, steadier baseline, balanced size, calmer spacing, and more confident visual rhythm.',
    analysis.safetyBoundaries.join(' '),
    premiumLine,
  ].join('\n\n');
}

function buildSignatureSafetyReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.fdca8c608f"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.5d9d22e7c4"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4752020518"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a83cd9cfdb"),
    ].join(' ');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.096b43cf1d"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.5e71456f86"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.3d1ddb88cb"),
      getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.8a7095b2ef"),
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
  const contextSummary =
    language === 'en' ? summarizePredictaConversationContext(memory) : '';

  if (!kundli) {
    if (!memory?.learnedThemes.length) {
      return contextSummary;
    }
    const themes = memory.learnedThemes.slice(0, 3).join(', ');
    if (language === 'hi') {
      return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.d948055616", [themes]);
    }
    if (language === 'gu') {
      return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.736bb3f11e", [themes]);
    }
    return joinSections([
      `I am learning your pattern: ${themes}.`,
      contextSummary,
    ]);
  }

  const similar = findSimilarSavedKundli(kundli, savedKundlis);

  if (similar) {
    const line = `I noticed a close chart pattern in saved profiles: ${
      similar.kundli.birthDetails.name
    } shares ${similar.matches.join(
      ', ',
    )} with this Kundli. Not identical, but close enough that I would compare timing carefully.`;

    if (language === 'hi') {
      return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.3294f30d6e", [similar.kundli.birthDetails.name, similar.matches.join(
        ', ',
      )]);
    }
    if (language === 'gu') {
      return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.37b4225197", [similar.kundli.birthDetails.name, similar.matches.join(
        ', ',
      )]);
    }
    return joinSections([line, contextSummary]);
  }

  if (memory?.chartSignatures.includes(chartSignature(kundli))) {
    if (language === 'hi') {
      return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.471f5e915d", [chartSignature(
        kundli,
      )]);
    }
    if (language === 'gu') {
      return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.59a57bcdff", [chartSignature(
        kundli,
      )]);
    }
    return joinSections([
      `I remember this chart signature now: ${chartSignature(
        kundli,
      )}. As more Kundlis enter your vault, I will compare this pattern automatically.`,
      contextSummary,
    ]);
  }

  if (language === 'hi') {
    return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.57294bc99c", [chartSignature(
      kundli,
    )]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.ca111a330c", [chartSignature(
      kundli,
    )]);
  }
  return joinSections([
    `I am adding this chart signature to memory: ${chartSignature(
      kundli,
    )}.`,
    contextSummary,
  ]);
}

function buildUpsell(
  language: SupportedLanguage,
  action: PredictaAppActionId,
  hasPremiumAccess: boolean,
  memory?: PredictaInteractionMemory,
): string {
  const actionCount = memory?.actionCounts[action] ?? 0;
  if (actionCount > 1) {
    return '';
  }

  if (isNativeChatLanguage(language)) {
    return nativePremiumLine(language, hasPremiumAccess);
  }

  if (hasPremiumAccess) {
    return 'Since Premium is active, I can deepen this with evidence tables, timing windows, and a report-ready synthesis.';
  }

  const suggestion =
    action === 'report'
      ? 'Turn this into a polished PDF when you want the full version.'
      : action === 'multi-school-consultation'
      ? 'Precision Reading adds the full all-school evidence map, contradictions, timing confidence, trigger tracking, and report-ready guidance for one important life question.'
      : action === 'advanced-jyotish'
      ? 'Advanced Mode adds deeper yoga/dosha scoring, nakshatra depth, Ashtakavarga tables, muhurta planning, compatibility synthesis, Prashna workflow, and safe remedy schedules.'
      : action === 'kundli-karma'
      ? 'Premium Kundli Karma adds deeper Dosh/Shrap/Yog/Lal Kitab evidence, activation timing, cross-chart support, and a consolidated remedy plan without fear-selling.'
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
      : action === 'jaimini-predicta' || action === 'nadi-predicta'
      ? 'Turn this into a Jaimini destiny reading when you want karaka depth, Arudha/Upapada evidence, Chara Dasha chapters, relationship mirror, and a separate Jaimini report.'
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
    return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.4fffdcca9c", [suggestion]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.packages.astrology.src.predictaChatActions.ts.62dcb6329d", [suggestion]);
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

function buildActiveConversationContext({
  action,
  chartContext,
  current,
  kundli,
  passState,
  predictaSchool,
  reportContext,
  signatureReady,
  text,
}: {
  action?: PredictaAppActionId;
  chartContext?: ChartContext;
  current?: PredictaActiveConversationContext;
  kundli?: KundliData;
  passState?: PredictaActiveConversationContext['passState'];
  predictaSchool?: PredictaSchool;
  reportContext?: string;
  signatureReady?: boolean;
  text: string;
}): PredictaActiveConversationContext | undefined {
  const eventQuestion =
    action === 'multi-school-consultation'
      ? compactUserGoal(text)
      : chartContext?.handoffQuestion ?? current?.eventQuestion;
  const lastUserGoal = inferLastUserGoal(text, action) ?? current?.lastUserGoal;
  const next: PredictaActiveConversationContext = {
    eventQuestion,
    kundliSignature: kundli ? chartSignature(kundli) : current?.kundliSignature,
    lastUserGoal,
    passState: passState ?? current?.passState,
    reportContext:
      reportContext ??
      chartContext?.generatedReport?.reportTitle ??
      chartContext?.reportFocus ??
      current?.reportContext,
    school: predictaSchool ?? chartContext?.predictaSchool ?? current?.school,
    selectedChart:
      chartContext?.chartName ?? chartContext?.chartType ?? current?.selectedChart,
    selectedHouse: chartContext?.selectedHouse ?? current?.selectedHouse,
    selectedPlanet: chartContext?.selectedPlanet ?? current?.selectedPlanet,
    signatureReady: signatureReady ?? current?.signatureReady,
  };

  return Object.values(next).some(value => value !== undefined) ? next : current;
}

export function summarizePredictaConversationContext(
  memory: PredictaInteractionMemory | undefined,
): string {
  const context = memory?.activeContext;
  if (!context) {
    return '';
  }

  const parts = [
    context.lastUserGoal ? `goal: ${context.lastUserGoal}` : undefined,
    context.eventQuestion ? `event: ${context.eventQuestion}` : undefined,
    context.school ? `school: ${context.school}` : undefined,
    context.selectedChart ? `chart: ${context.selectedChart}` : undefined,
    context.selectedHouse ? `house: ${context.selectedHouse}` : undefined,
    context.selectedPlanet ? `planet: ${context.selectedPlanet}` : undefined,
    context.reportContext ? `report: ${context.reportContext}` : undefined,
    context.signatureReady ? 'signature: ready' : undefined,
    context.passState && context.passState !== 'unknown'
      ? `pass: ${context.passState}`
      : undefined,
  ].filter(Boolean);

  return parts.length ? `Context remembered: ${parts.slice(0, 5).join(' | ')}.` : '';
}

function buildOpeningPatternId(
  action: PredictaAppActionId,
  actionCount: number,
): string {
  return `opening:${action}:${(actionCount - 1) % 3}`;
}

function buildResponsePatternIds(
  action: PredictaAppActionId | undefined,
  text: string,
): string[] {
  const patterns: string[] = [];
  if (action) {
    patterns.push(`action:${action}`);
  }
  if (isPredictaMultiSchoolQuestion(text)) {
    patterns.push('event-question');
  }
  if (/\b(premium|upgrade|paid|pass|credit)\b/i.test(text)) {
    patterns.push('monetization');
  }
  if (/\b(safety|medical|legal|guarantee|guaranteed)\b/i.test(text)) {
    patterns.push('safety-boundary');
  }
  return patterns;
}

function inferLastUserGoal(
  text: string,
  action?: PredictaAppActionId,
): string | undefined {
  const compact = compactUserGoal(text);
  if (compact) {
    return compact;
  }
  return action ? labelAction(action) : undefined;
}

function compactUserGoal(text: string): string | undefined {
  const normalized = text.trim().replace(/\s+/g, ' ');
  if (!normalized) {
    return undefined;
  }
  return normalized.length > 96 ? `${normalized.slice(0, 93)}...` : normalized;
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

function getAshtakavargaHouseList(
  kundli: KundliData,
  key: 'strongestHouses' | 'weakestHouses',
): number[] {
  const ashtakavarga = kundli.ashtakavarga as KundliData['ashtakavarga'] & {
    sav?: Partial<Record<'strongestHouses' | 'weakestHouses', number[]>>;
  };
  const direct = ashtakavarga[key];
  if (Array.isArray(direct)) {
    return direct;
  }
  const sav = ashtakavarga.sav?.[key];
  return Array.isArray(sav) ? sav : [];
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

function mergeUnique<T extends string>(
  current: T[],
  next: T[],
  limit: number,
): T[] {
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
    return getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.a481c7cb5c");
  }
  if (responseLanguage === 'gu') {
    return getNativeCopy("native.packages.astrology.src.predictaChatActions.ts.f736087524");
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
