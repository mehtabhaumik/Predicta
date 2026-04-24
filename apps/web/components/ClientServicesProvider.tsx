'use client';

import { useEffect } from 'react';
import { initializeClientTelemetry } from '../lib/firebase/client';

export function ClientServicesProvider(): null {
  useEffect(() => {
    void initializeClientTelemetry();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('/sw.js');
    });
  }, []);

  return null;
}
