import {
  buildStableCacheKey,
  createPerformanceTimer,
  stableSerialize,
  TimeoutError,
  TtlMemoryCache,
  withTimeout,
} from '@pridicta/utils';

describe('shared performance utilities', () => {
  it('serializes objects with stable key ordering', () => {
    const first = stableSerialize({
      chart: 'D10',
      nested: { b: 2, a: 1 },
      question: 'career',
    });
    const second = stableSerialize({
      question: 'career',
      nested: { a: 1, b: 2 },
      chart: 'D10',
    });

    expect(first).toBe(second);
    expect(buildStableCacheKey({ b: 2, a: 1 }, 'ai-response')).toBe(
      buildStableCacheKey({ a: 1, b: 2 }, 'ai-response'),
    );
  });

  it('expires memory cache entries using ttl', () => {
    let now = 1000;
    const cache = new TtlMemoryCache<string>({
      now: () => now,
      ttlMs: 100,
    });

    cache.set('kundli', 'cached');

    expect(cache.get('kundli')).toBe('cached');

    now = 1100;

    expect(cache.get('kundli')).toBeNull();
    expect(cache.size).toBe(0);
  });

  it('keeps memory cache within the max entry limit', () => {
    let now = 1000;
    const cache = new TtlMemoryCache<string>({
      maxEntries: 2,
      now: () => now,
      ttlMs: 1000,
    });

    cache.set('first', '1');
    now += 1;
    cache.set('second', '2');
    now += 1;
    cache.set('third', '3');

    expect(cache.get('first')).toBeNull();
    expect(cache.get('second')).toBe('2');
    expect(cache.get('third')).toBe('3');
  });

  it('resolves work before timeout and rejects slow work cleanly', async () => {
    await expect(withTimeout(Promise.resolve('done'), 50)).resolves.toBe('done');

    await expect(
      withTimeout<string>(
        () => new Promise(resolve => setTimeout(() => resolve('late'), 25)),
        1,
      ),
    ).rejects.toThrow(TimeoutError);
  });

  it('reports performance timer duration without platform APIs', () => {
    let now = 500;
    const timer = createPerformanceTimer('kundli-cache', () => now);

    now = 542;

    expect(timer.elapsedMs()).toBe(42);
    expect(timer.end({ cacheHit: true })).toEqual({
      durationMs: 42,
      endedAt: 542,
      metadata: { cacheHit: true },
      name: 'kundli-cache',
      startedAt: 500,
    });
  });
});
