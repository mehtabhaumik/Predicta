import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildStableCacheKey } from '@pridicta/utils';

import { CACHE_CONFIG } from '../../config/cacheConfig';
import type {
  AIIntent,
  ChartContext,
  DecisionMirrorResponse,
} from '../../types/astrology';

const RESPONSE_CACHE_KEY = 'pridicta.aiResponseCache.v1';

export type AIResponseCacheInput = {
  activeKundliId: string;
  calculationInputHash: string;
  chartContext?: ChartContext;
  intent: AIIntent;
  model: string;
  normalizedQuestion: string;
  userId: string;
};

export type CachedAIResponse = {
  createdAt: string;
  decisionMirror?: DecisionMirrorResponse;
  intent: AIIntent;
  model: string;
  text: string;
};

type CacheStore = Record<string, CachedAIResponse>;

export function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function buildAIResponseCacheKey(input: AIResponseCacheInput): string {
  return buildStableCacheKey(
    {
      activeKundliId: input.activeKundliId,
      calculationInputHash: input.calculationInputHash,
      chartContext: input.chartContext ?? null,
      intent: input.intent,
      model: input.model,
      normalizedQuestion: input.normalizedQuestion,
      userId: input.userId,
    },
    'ai-response',
  );
}

export async function getCachedAIResponse(
  input: AIResponseCacheInput,
): Promise<CachedAIResponse | null> {
  const cache = await loadCache();
  const key = buildAIResponseCacheKey(input);
  const cached = cache[key];

  if (!cached) {
    return null;
  }

  const age = Date.now() - new Date(cached.createdAt).getTime();

  if (age > CACHE_CONFIG.AI_RESPONSE_TTL_MS) {
    delete cache[key];
    await saveCache(cache);
    return null;
  }

  return cached;
}

export async function setCachedAIResponse(
  input: AIResponseCacheInput,
  response: CachedAIResponse,
): Promise<void> {
  const cache = await loadCache();
  cache[buildAIResponseCacheKey(input)] = response;
  await saveCache(cache);
}

async function loadCache(): Promise<CacheStore> {
  const raw = await AsyncStorage.getItem(RESPONSE_CACHE_KEY);
  return raw ? (JSON.parse(raw) as CacheStore) : {};
}

async function saveCache(cache: CacheStore): Promise<void> {
  await AsyncStorage.setItem(RESPONSE_CACHE_KEY, JSON.stringify(cache));
}
