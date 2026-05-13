'use client';

import { useEffect } from 'react';
import type React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  getFirebaseWebAuth,
  initializeClientTelemetry,
} from '../lib/firebase/client';
import { mergeGuestSessionIntoAccount } from '../lib/web-account-merge';
import { loadWebAutoSaveMemory } from '../lib/web-auto-save-memory';
import { getOrCreateWebGuestSession } from '../lib/web-guest-session';
import { WebAppTranslationRuntime } from './WebAppTranslationRuntime';

export function ClientServicesProvider(): React.JSX.Element {
  useEffect(() => {
    getOrCreateWebGuestSession();
    loadWebAutoSaveMemory();
    void initializeClientTelemetry();

    try {
      return onAuthStateChanged(getFirebaseWebAuth(), user => {
        if (!user) {
          return;
        }

        mergeGuestSessionIntoAccount({
          displayName: user.displayName,
          email: user.email,
          providerId: user.providerData[0]?.providerId,
          uid: user.uid,
        });
      });
    } catch {
      return undefined;
    }
  }, []);

  return <WebAppTranslationRuntime />;
}
