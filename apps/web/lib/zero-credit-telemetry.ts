'use client';

const ZERO_CREDIT_EVENT_KEY = 'predicta.zeroCreditDeterministicEvents.v1';
const MAX_EVENTS = 50;

export type WebZeroCreditDeterministicEvent = {
  action: string;
  createdAt: string;
  surface: 'web-chat';
};

export function recordWebZeroCreditDeterministicAction(action: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const event: WebZeroCreditDeterministicEvent = {
    action,
    createdAt: new Date().toISOString(),
    surface: 'web-chat',
  };

  try {
    const existing = JSON.parse(
      window.localStorage.getItem(ZERO_CREDIT_EVENT_KEY) ?? '[]',
    ) as WebZeroCreditDeterministicEvent[];
    window.localStorage.setItem(
      ZERO_CREDIT_EVENT_KEY,
      JSON.stringify([event, ...existing].slice(0, MAX_EVENTS)),
    );
    window.dispatchEvent(
      new CustomEvent('predicta:zero-credit-deterministic-action', {
        detail: event,
      }),
    );
  } catch {
    // Telemetry must never block deterministic chat actions.
  }
}
