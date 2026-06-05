'use client';

import { useEffect } from 'react';
import type React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { usePathname } from 'next/navigation';
import {
  getFirebaseWebAuth,
  initializeClientTelemetry,
} from '../lib/firebase/client';
import { mergeGuestSessionIntoAccount } from '../lib/web-account-merge';
import { loadWebServerLedgerState } from '../lib/web-access-state';
import { loadWebAutoSaveMemory } from '../lib/web-auto-save-memory';
import { getOrCreateWebGuestSession } from '../lib/web-guest-session';
import { useLanguagePreference } from '../lib/language-preference';
import { getLocalizedPredictaPageTitle } from '../lib/localized-page-title';
import { WebAppTranslationRuntime } from './WebAppTranslationRuntime';

export function ClientServicesProvider(): React.JSX.Element {
  const pathname = usePathname();
  const { language } = useLanguagePreference();

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
        void loadWebServerLedgerState();
      });
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    document.title = getLocalizedPredictaPageTitle(pathname, language);
  }, [language, pathname]);

  return <WebAppTranslationRuntime />;
}
