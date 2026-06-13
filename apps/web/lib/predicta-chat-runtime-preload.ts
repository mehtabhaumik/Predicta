'use client';

let predictaChatRuntimePreload: Promise<unknown> | undefined;
let predictaChatRuntimePreloadHandle:
  | ReturnType<typeof globalThis.setTimeout>
  | number
  | undefined;

export function preloadAskPredictaRuntime(): void {
  if (predictaChatRuntimePreload || predictaChatRuntimePreloadHandle) {
    return;
  }

  const loadRuntime = () => {
    predictaChatRuntimePreloadHandle = undefined;
    predictaChatRuntimePreload ??= import('../components/WebPridictaChat');
  };

  if ('requestIdleCallback' in window) {
    predictaChatRuntimePreloadHandle = window.requestIdleCallback(loadRuntime, {
      timeout: 1400,
    });
    return;
  }

  predictaChatRuntimePreloadHandle = globalThis.setTimeout(loadRuntime, 250);
}
