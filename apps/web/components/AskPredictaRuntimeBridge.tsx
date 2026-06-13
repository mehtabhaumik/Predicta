'use client';

import type { ComponentType } from 'react';

type PredictaRuntimeModule = {
  default: ComponentType;
};

let predictaRuntimePreload: Promise<PredictaRuntimeModule> | undefined;

export function loadPredictaRuntime(): Promise<PredictaRuntimeModule> {
  predictaRuntimePreload ??= import('./WebPridictaChat').then(module => ({
    default: module.WebPridictaChat,
  }));

  return predictaRuntimePreload;
}

export function prewarmPredictaRuntime(): void {
  void loadPredictaRuntime();
}
