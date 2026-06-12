'use client';

let predictaChatRuntimePreload: Promise<unknown> | undefined;

export function preloadAskPredictaRuntime(): void {
  predictaChatRuntimePreload ??= import('../components/WebPridictaChat');
}
