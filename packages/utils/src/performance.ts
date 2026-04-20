import { sha256 } from './sha256';

export type CacheKeyPrefix =
  | 'ai-response'
  | 'astro'
  | 'compatibility'
  | 'daily-intelligence'
  | 'decision-mirror'
  | 'journal'
  | 'report'
  | 'weekly-intelligence'
  | (string & {});

export function stableSerialize(value: unknown): string {
  return serialize(value, new Set());
}

export function buildStableCacheKey(
  value: unknown,
  prefix: CacheKeyPrefix = 'cache',
): string {
  return `${prefix}:${sha256(stableSerialize(value))}`;
}

export class TimeoutError extends Error {
  constructor(message = 'Operation timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export type TimeoutFactory<T> = (signal: AbortSignal) => Promise<T>;

export async function withTimeout<T>(
  promiseOrFactory: Promise<T> | TimeoutFactory<T>,
  timeoutMs: number,
  options: { message?: string } = {},
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new TimeoutError(options.message);
  }

  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(options.message));
    }, timeoutMs);
  });

  try {
    const promise =
      typeof promiseOrFactory === 'function'
        ? promiseOrFactory(controller.signal)
        : promiseOrFactory;

    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

export type TtlMemoryCacheOptions = {
  maxEntries?: number;
  now?: () => number;
  ttlMs: number;
};

type CacheEntry<T> = {
  expiresAt: number;
  updatedAt: number;
  value: T;
};

export class TtlMemoryCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();
  private readonly maxEntries: number;
  private readonly now: () => number;
  private readonly ttlMs: number;

  constructor({ maxEntries = 100, now = Date.now, ttlMs }: TtlMemoryCacheOptions) {
    this.maxEntries = Math.max(1, Math.floor(maxEntries));
    this.now = now;
    this.ttlMs = ttlMs;
  }

  get size(): number {
    this.pruneExpired();
    return this.entries.size;
  }

  clear(): void {
    this.entries.clear();
  }

  delete(key: string): boolean {
    return this.entries.delete(key);
  }

  get(key: string): T | null {
    const entry = this.entries.get(key);

    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= this.now()) {
      this.entries.delete(key);
      return null;
    }

    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  set(key: string, value: T): void {
    const updatedAt = this.now();
    this.entries.set(key, {
      expiresAt: updatedAt + this.ttlMs,
      updatedAt,
      value,
    });
    this.pruneExpired();
    this.pruneToMaxEntries();
  }

  private pruneExpired(): void {
    const now = this.now();

    for (const [key, entry] of this.entries) {
      if (entry.expiresAt <= now) {
        this.entries.delete(key);
      }
    }
  }

  private pruneToMaxEntries(): void {
    if (this.entries.size <= this.maxEntries) {
      return;
    }

    const sorted = [...this.entries.entries()].sort(
      ([, first], [, second]) => first.updatedAt - second.updatedAt,
    );

    for (const [key] of sorted.slice(0, this.entries.size - this.maxEntries)) {
      this.entries.delete(key);
    }
  }
}

export type PerformanceTimerResult<TMetadata = Record<string, unknown>> = {
  durationMs: number;
  endedAt: number;
  metadata?: TMetadata;
  name: string;
  startedAt: number;
};

export function createPerformanceTimer(
  name: string,
  now: () => number = Date.now,
): {
  elapsedMs: () => number;
  end: <TMetadata = Record<string, unknown>>(
    metadata?: TMetadata,
  ) => PerformanceTimerResult<TMetadata>;
  name: string;
  startedAt: number;
} {
  const startedAt = now();

  return {
    elapsedMs: () => now() - startedAt,
    end: metadata => {
      const endedAt = now();

      return {
        durationMs: endedAt - startedAt,
        endedAt,
        metadata,
        name,
        startedAt,
      };
    },
    name,
    startedAt,
  };
}

function serialize(value: unknown, seen: Set<object>): string {
  if (value === null) {
    return 'null';
  }

  if (value === undefined) {
    return '"__undefined__"';
  }

  if (value instanceof Date) {
    return JSON.stringify(value.toISOString());
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      throw new Error('Cannot stableSerialize circular arrays.');
    }

    seen.add(value);
    const output = `[${value.map(item => serialize(item, seen)).join(',')}]`;
    seen.delete(value);
    return output;
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      throw new Error('Cannot stableSerialize circular objects.');
    }

    seen.add(value);
    const record = value as Record<string, unknown>;
    const output = `{${Object.keys(record)
      .sort()
      .map(key => `${JSON.stringify(key)}:${serialize(record[key], seen)}`)
      .join(',')}}`;
    seen.delete(value);
    return output;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : JSON.stringify(String(value));
  }

  return JSON.stringify(value);
}
