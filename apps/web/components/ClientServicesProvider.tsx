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
import { loadWebAutoSaveMemory } from '../lib/web-auto-save-memory';
import { getOrCreateWebGuestSession } from '../lib/web-guest-session';
import { WebAppTranslationRuntime } from './WebAppTranslationRuntime';

export function ClientServicesProvider(): React.JSX.Element {
  const pathname = usePathname();

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

  useEffect(() => {
    document.title = getPredictaPageTitle(pathname);
  }, [pathname]);

  return <WebAppTranslationRuntime />;
}

function getPredictaPageTitle(pathname: string | null): string {
  const route = pathname ?? '/';
  const titleMap: Record<string, string> = {
    '/': 'Predicta | Holistic Vedic Astrology',
    '/accuracy-method': 'Accuracy and Method | Predicta',
    '/checkout': 'Checkout | Predicta',
    '/dashboard': 'Dashboard | Predicta',
    '/dashboard/admin': 'Admin | Predicta',
    '/dashboard/birth-time': 'Birth Time | Predicta',
    '/dashboard/charts': 'Charts | Predicta',
    '/dashboard/chat': 'Ask Predicta | Predicta',
    '/dashboard/decision': 'Decision Guidance | Predicta',
    '/dashboard/family': 'Family Vault | Predicta',
    '/dashboard/holistic': 'Holistic Guidance | Predicta',
    '/dashboard/kp': 'KP Predicta | Predicta',
    '/dashboard/kp/chat': 'Chat with KP Predicta | Predicta',
    '/dashboard/kundli': 'Create Kundli | Predicta',
    '/dashboard/nadi': 'Nadi Predicta | Predicta',
    '/dashboard/nadi/chat': 'Chat with Nadi Predicta | Predicta',
    '/dashboard/numerology': 'Numerology Predicta | Predicta',
    '/dashboard/numerology/chat': 'Chat with Numerology Predicta | Predicta',
    '/dashboard/premium': 'Premium | Predicta',
    '/dashboard/redeem-pass': 'Redeem Pass | Predicta',
    '/dashboard/relationship': 'Relationship | Predicta',
    '/dashboard/remedies': 'Remedies | Predicta',
    '/dashboard/report': 'Reports | Predicta',
    '/dashboard/saved-kundlis': 'Kundli Library | Predicta',
    '/dashboard/settings': 'Profile Settings | Predicta',
    '/dashboard/signature': 'Signature Predicta | Predicta',
    '/dashboard/signature/chat': 'Chat with Signature Predicta | Predicta',
    '/dashboard/timeline': 'Timeline | Predicta',
    '/dashboard/vedic': 'Vedic Predicta | Predicta',
    '/dashboard/vedic/chat': 'Chat with Vedic Predicta | Predicta',
    '/dashboard/wrapped': 'Wrapped | Predicta',
    '/feedback': 'Feedback | Predicta',
    '/founder': 'Founder Vision | Predicta',
    '/legal': 'Legal | Predicta',
    '/pricing': 'Plans and Passes | Predicta',
    '/safety': 'Safety Promise | Predicta',
  };

  return titleMap[route] ?? 'Predicta | Holistic Vedic Astrology';
}
