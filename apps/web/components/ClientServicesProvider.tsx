'use client';

import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import {
  getFirebaseWebAuth,
  initializeClientTelemetry,
} from '../lib/firebase/client';
import { mergeGuestSessionIntoAccount } from '../lib/web-account-merge';
import { loadWebServerLedgerState } from '../lib/web-access-state';
import { loadWebAutoSaveMemory } from '../lib/web-auto-save-memory';
import { getOrCreateWebGuestSession } from '../lib/web-guest-session';
import { useLanguagePreference } from '../lib/language-preference';
import { applyPredictaDocumentLanguage } from '../lib/document-language';
import { getLocalizedPredictaPageTitle } from '../lib/localized-page-title';
import { WebAppTranslationRuntime } from './WebAppTranslationRuntime';

export function ClientServicesProvider(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const navigationTimeoutRef = useRef<number | undefined>(undefined);
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
    applyPredictaDocumentLanguage(language);
    document.title = getLocalizedPredictaPageTitle(pathname, language);
  }, [language, pathname]);

  useEffect(() => {
    const warmCoreRoutes = () => {
      router.prefetch('/ask');
    };

    const idleHandle =
      'requestIdleCallback' in window
        ? window.requestIdleCallback(warmCoreRoutes, { timeout: 1800 })
        : undefined;
    const timeoutHandle =
      idleHandle === undefined ? window.setTimeout(warmCoreRoutes, 900) : undefined;

    return () => {
      if (idleHandle !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleHandle);
      }

      if (timeoutHandle !== undefined) {
        window.clearTimeout(timeoutHandle);
      }
    };
  }, [router]);

  useEffect(() => {
    function resolveInternalAnchor(target: EventTarget | null): HTMLAnchorElement | null {
      if (!(target instanceof Element)) {
        return null;
      }

      return target.closest('a[href]');
    }

    function getInternalHref(anchor: HTMLAnchorElement): string | undefined {
      if (
        anchor.target ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('aria-disabled') === 'true'
      ) {
        return undefined;
      }

      const rawHref = anchor.getAttribute('href');

      if (!rawHref || rawHref.startsWith('#')) {
        return undefined;
      }

      let url: URL;

      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return undefined;
      }

      if (url.origin !== window.location.origin) {
        return undefined;
      }

      return `${url.pathname}${url.search}${url.hash}`;
    }

    function warmLink(event: PointerEvent | FocusEvent | TouchEvent) {
      const anchor = resolveInternalAnchor(event.target);

      if (!anchor) {
        return;
      }

      const href = getInternalHref(anchor);

      if (href) {
        router.prefetch(href);
      }
    }

    function showNavigationFeedback(event: MouseEvent) {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = resolveInternalAnchor(event.target);

      if (!anchor) {
        return;
      }

      const href = getInternalHref(anchor);

      if (!href) {
        return;
      }

      const nextUrl = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSameLocation =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash === currentUrl.hash;

      if (isSameLocation) {
        return;
      }

      setIsNavigating(true);
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = window.setTimeout(() => {
        setIsNavigating(false);
      }, 2400);
    }

    document.addEventListener('pointerdown', warmLink, { capture: true, passive: true });
    document.addEventListener('focusin', warmLink, { capture: true });
    document.addEventListener('touchstart', warmLink, { capture: true, passive: true });
    document.addEventListener('click', showNavigationFeedback, { capture: true });

    return () => {
      document.removeEventListener('pointerdown', warmLink, { capture: true });
      document.removeEventListener('focusin', warmLink, { capture: true });
      document.removeEventListener('touchstart', warmLink, { capture: true });
      document.removeEventListener('click', showNavigationFeedback, { capture: true });
      window.clearTimeout(navigationTimeoutRef.current);
    };
  }, [router]);

  useEffect(() => {
    setIsNavigating(false);
    window.clearTimeout(navigationTimeoutRef.current);
  }, [pathname]);

  return (
    <>
      <div
        aria-hidden="true"
        className={
          isNavigating
            ? 'predicta-route-progress is-active'
            : 'predicta-route-progress'
        }
      >
        <span />
      </div>
      <WebAppTranslationRuntime />
    </>
  );
}
