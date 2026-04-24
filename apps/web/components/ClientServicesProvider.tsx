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

    const registerServiceWorker = () => {
      void navigator.serviceWorker.register('/sw.js');
    };

    if (document.readyState === 'complete') {
      registerServiceWorker();
      return;
    }

    window.addEventListener('load', registerServiceWorker, { once: true });

    return () => {
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  return null;
}
