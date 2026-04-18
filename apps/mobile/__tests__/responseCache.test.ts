import {
  buildAIResponseCacheKey,
  normalizeQuestion,
} from '../src/services/cache/responseCache';

const baseInput = {
  activeKundliId: 'kundli-1',
  calculationInputHash: 'hash-1',
  chartContext: { chartType: 'D9' as const, sourceScreen: 'Kundli' },
  intent: 'moderate' as const,
  model: 'gpt-5.4-mini',
  normalizedQuestion: normalizeQuestion('  Tell me about marriage  '),
  userId: 'local-user',
};

describe('responseCache', () => {
  it('normalizes repeated questions and changes when kundli hash changes', () => {
    expect(baseInput.normalizedQuestion).toBe('tell me about marriage');
    expect(buildAIResponseCacheKey(baseInput)).toBe(
      buildAIResponseCacheKey({ ...baseInput }),
    );
    expect(buildAIResponseCacheKey(baseInput)).not.toBe(
      buildAIResponseCacheKey({
        ...baseInput,
        calculationInputHash: 'hash-2',
      }),
    );
  });
});
