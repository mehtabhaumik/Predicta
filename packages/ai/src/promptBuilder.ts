import type {
  AstrologyMemory,
  ChartContext,
  ConversationTurn,
  KundliData,
  PredictaIntelligenceContext,
} from '@pridicta/types';
import { buildAstrologyReasoningContext } from './astrologyReasoner';
import { detectPredictaIntent } from './intentDetector';
import { resolveKundliState, summarizeKnownBirthDetails } from './kundliStateResolver';
import {
  createInitialAstrologyMemory,
  getConversationSummary,
  updateUserAstrologyMemory,
} from './memoryService';

export function buildPredictaSystemIdentity(preferredLanguage?: string): string {
  const language =
    preferredLanguage === 'hi' || preferredLanguage === 'gu' || preferredLanguage === 'en'
      ? preferredLanguage
      : 'en';

  return [
    'You are Predicta, a warm, affectionate, deeply experienced Vedic astrologer with 30 years of Jyotish practice.',
    'You read through Vedic astrology only: kundli, dasha, gochar, yogas, varga charts, houses, lords, nakshatra, and planetary dignity.',
    'You are not a life coach, motivational speaker, generic therapist, or vague clarity bot.',
    'You are a gentle Mahadev bhakt. You may occasionally and naturally refer to Mahadev, Shiva, Bholenath, Rudra, or Bhairav, but never excessively.',
    'You speak like a wise human astrologer who cares about the user. You are calm, compassionate, emotionally intelligent, practical, and premium.',
    'You never sound robotic, cold, or templated.',
    'If birth details or chart data already exist, never ask for them again unless something is genuinely missing or unclear.',
    'If kundli data exists, you must use astrology. Generic advice without astrology is incorrect.',
    'You understand follow-up questions from context and answer them directly.',
    'You do not guarantee outcomes. You explain patterns, timing, and remedies with humility and clarity.',
    'When appropriate, you offer both spiritual and non-religious remedies. Spiritual references should feel natural, not performative.',
    'Do not overuse disclaimers, do not repeat stock openings, and do not sound like customer support.',
    `Respond in ${language} when practical, while keeping the tone natural and human.`,
  ].join('\n');
}

export function buildPredictaIntelligenceContext(input: {
  message: string;
  history?: ConversationTurn[];
  kundli?: KundliData;
  chartContext?: ChartContext;
  preferredLanguage?: string;
  memory?: AstrologyMemory;
}): PredictaIntelligenceContext {
  const lastTurn = input.history?.[input.history.length - 1];
  const historyAlreadyIncludesMessage =
    lastTurn?.role === 'user' &&
    lastTurn.text.trim() === input.message.trim();
  const historyForContext =
    input.message && !historyAlreadyIncludesMessage
      ? [...(input.history ?? []), { role: 'user' as const, text: input.message }]
      : input.history;
  const memory = updateUserAstrologyMemory({
    chartContext: input.chartContext,
    existingMemory: input.memory ?? createInitialAstrologyMemory(),
    history: historyForContext,
    kundli: input.kundli,
    message: input.message,
    preferredLanguage: input.preferredLanguage,
  });

  const intentProfile = detectPredictaIntent({
    chartContext: input.chartContext,
    history: historyForContext,
    memory,
    message: input.message,
  });

  const reasoningContext = buildAstrologyReasoningContext({
    chartContext: input.chartContext,
    intentProfile,
    memory,
  });

  return {
    memory: {
      ...memory,
      emotionalTone: intentProfile.emotionalTone,
      lastIntent: intentProfile.primaryIntent,
    },
    intentProfile,
    reasoningContext,
    conversationSummary: getConversationSummary(memory, historyForContext),
    recentAssistantResponses: (historyForContext ?? [])
      .filter(turn => turn.role === 'pridicta')
      .slice(-3)
      .map(turn => turn.text),
  };
}

export function buildPredictaUserPrompt(input: {
  message: string;
  intelligenceContext: PredictaIntelligenceContext;
  compactContext?: string | null;
  history?: ConversationTurn[];
}): string {
  const { intelligenceContext } = input;
  const kundliState = resolveKundliState({
    chartContext: intelligenceContext.memory.lastChartContext,
    kundli: undefined,
    memory: intelligenceContext.memory,
  });
  const historyText = (input.history ?? [])
    .slice(-8)
    .map(turn => `${turn.role === 'user' ? 'User' : 'Predicta'}: ${turn.text}`)
    .join('\n');

  return [
    'Predicta working memory:',
    JSON.stringify(intelligenceContext.memory, null, 2),
    'STRICT KUNDLI STATE:',
    JSON.stringify(
      {
        knownBirthDetails: summarizeKnownBirthDetails(
          intelligenceContext.memory.birthDetails,
        ),
        kundliReady: kundliState.kundliReady,
        missingBirthFields: kundliState.missingBirthFields,
        shouldGenerateKundli: kundliState.shouldGenerateKundli,
      },
      null,
      2,
    ),
    'Intent and emotional reading:',
    JSON.stringify(intelligenceContext.intentProfile, null, 2),
    'Astrology reasoning context:',
    JSON.stringify(intelligenceContext.reasoningContext, null, 2),
    'Conversation summary:',
    intelligenceContext.conversationSummary || 'No previous summary.',
    'Recent assistant responses to avoid repeating:',
    intelligenceContext.recentAssistantResponses.join('\n') || 'None.',
    input.compactContext ? 'Compressed kundli context:' : '',
    input.compactContext ?? '',
    'Recent conversation:',
    historyText || 'No previous conversation.',
    'STRICT RULES:',
    [
      '1. Memory is authoritative. If birth details exist, never ask for them again.',
      '2. If kundliReady is true, you must answer through astrology. Generic advice is invalid.',
      '3. Use the astrology reasoning context explicitly. Choose charts, houses, planets, and dasha from it.',
      '4. You are not a life coach. Do not drift into philosophy without Jyotish grounding.',
      '5. If timing is not strong enough, say so softly instead of pretending certainty.',
      '6. If remedies help, give practical and spiritual remedies in a grounded way.',
      '7. If the user is asking a follow-up, continue the thread directly and do not reset the conversation.',
      '8. Avoid repeating recent assistant phrasing or stock openings.',
      '9. Do not use banned filler such as "we can begin without pretending", "say it in one plain sentence", or "based on the provided data".',
    ].join('\n'),
    `User question: ${input.message}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}
