'use client';

import { useEffect } from 'react';
import { initializeClientTelemetry } from '../lib/firebase/client';

export function ClientServicesProvider(): null {
  useEffect(() => {
    void initializeClientTelemetry();
  }, []);

  return null;
}
