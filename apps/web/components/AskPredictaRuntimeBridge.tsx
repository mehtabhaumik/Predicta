'use client';

import type { ComponentType } from 'react';

type PredictaRuntimeModule = {
  default: ComponentType;
};

let predictaRuntimePreload: Promise<PredictaRuntimeModule> | undefined;
let predictaRuntimePreloadHandle:
  | ReturnType<typeof globalThis.setTimeout>
  | number
  | undefined;

export function loadPredictaRuntime(): Promise<PredictaRuntimeModule> {
  predictaRuntimePreload ??= import('./WebPridictaChat').then(module => ({
    default: module.WebPridictaChat,
  }));

  return predictaRuntimePreload;
}

export function preloadPredictaRuntime(): void {
  if (predictaRuntimePreload || predictaRuntimePreloadHandle) {
    return;
  }

  const loadRuntime = () => {
    predictaRuntimePreloadHandle = undefined;
    void loadPredictaRuntime();
  };

  if ('requestIdleCallback' in window) {
    predictaRuntimePreloadHandle = window.requestIdleCallback(loadRuntime, {
      timeout: 1400,
    });
    return;
  }

  predictaRuntimePreloadHandle = globalThis.setTimeout(loadRuntime, 250);
}
