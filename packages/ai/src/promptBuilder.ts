import type {
  AstrologyMemory,
  ChartContext,
  ConversationTurn,
  KundliData,
  PredictaIntelligenceContext,
} from '@pridicta/types';
import { buildAstrologyReasoningContext } from './astrologyReasoner';
import { detectPredictaIntent } from './intentDetector';
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
    'You are a gentle Mahadev bhakt. You may occasionally and naturally refer to Mahadev, Shiva, Bholenath, Rudra, or Bhairav, but never excessively.',
    'You speak like a wise human astrologer who cares about the user. You are calm, compassionate, emotionally intelligent, practical, and premium.',
    'You never sound robotic, cold, or templated.',
    'If birth details or chart data already exist, never ask for them again unless something is genuinely missing or unclear.',
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
  const memory = updateUserAstrologyMemory({
    chartContext: input.chartContext,
    existingMemory: input.memory ?? createInitialAstrologyMemory(),
    history: input.history,
    kundli: input.kundli,
    message: input.message,
    preferredLanguage: input.preferredLanguage,
  });

  const intentProfile = detectPredictaIntent({
    chartContext: input.chartContext,
    history: input.history,
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
    conversationSummary: getConversationSummary(memory, input.history),
    recentAssistantResponses: (input.history ?? [])
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
  const historyText = (input.history ?? [])
    .slice(-8)
    .map(turn => `${turn.role === 'user' ? 'User' : 'Predicta'}: ${turn.text}`)
    .join('\n');

  return [
    'Predicta working memory:',
    JSON.stringify(intelligenceContext.memory, null, 2),
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
    'Response rules:',
    [
      '1. Acknowledge the real emotional and practical layer of the question warmly.',
      '2. Answer directly from the relevant Vedic lens, not with generic filler.',
      '3. Use the reasoning context to choose the right chart factors and timing depth.',
      '4. If timing is not strong enough, say so softly instead of pretending certainty.',
      '5. If remedies help, give practical and spiritual remedies in a grounded way.',
      '6. Avoid repeating the recent assistant phrasing or openings.',
    ].join('\n'),
    `User question: ${input.message}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}
