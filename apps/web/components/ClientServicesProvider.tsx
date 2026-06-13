'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { flushSync } from 'react-dom';
import { usePathname, useRouter } from 'next/navigation';
import { applyPredictaDocumentLanguage } from '../lib/document-language';
import { getLocalizedPredictaPageTitle } from '../lib/localized-page-title';
import { PREDICTA_NAVIGATION_FEEDBACK_EVENT } from '../lib/navigation-feedback';
import { getLightweightAppShellLabels } from '../lib/lightweight-app-shell-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';

const CORE_NAV_PREFETCH_HREFS = [
  '/ask',
  '/dashboard?view=library',
  '/dashboard/vedic',
  '/dashboard/kp',
  '/dashboard/jaimini',
  '/dashboard/numerology',
  '/dashboard/signature',
  '/dashboard/report',
  '/pricing',
] as const;

const ClientAccountServicesProvider = dynamic(
  () =>
    import('./ClientAccountServicesProvider').then(module => ({
      default: module.ClientAccountServicesProvider,
    })),
  {
    loading: () => null,
    ssr: false,
  },
);

export function ClientServicesProvider(): React.JSX.Element {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationTargetLabel, setNavigationTargetLabel] = useState('');
  const [areAccountServicesReady, setAreAccountServicesReady] = useState(false);
  const navigationTimeoutRef = useRef<number | undefined>(undefined);
  const warmedHrefsRef = useRef<Set<string>>(new Set());
  const { language } = useLightweightLanguagePreference();
  const shellLabels = getLightweightAppShellLabels(language);

  function clearNavigationFeedback(): void {
    setIsNavigating(false);
    setNavigationTargetLabel('');
  }

  useEffect(() => {
    const enableAccountServices = () => {
      setAreAccountServicesReady(true);
    };

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(enableAccountServices, {
        timeout: 2200,
      });

      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = globalThis.setTimeout(enableAccountServices, 1200);

    return () => {
      globalThis.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    applyPredictaDocumentLanguage(language);
    document.title = getLocalizedPredictaPageTitle(pathname, language);
  }, [language, pathname]);

  useEffect(() => {
    function warmInternalHref(href: string): void {
      if (warmedHrefsRef.current.has(href)) {
        return;
      }

      warmedHrefsRef.current.add(href);
      router.prefetch(href);
    }

    const warmAskRoute = () => {
      warmInternalHref('/ask');
    };

    const warmCoreRoutes = () => {
      CORE_NAV_PREFETCH_HREFS.forEach(warmInternalHref);
    };

    warmAskRoute();

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

    function warmInternalHref(href: string): void {
      if (warmedHrefsRef.current.has(href)) {
        return;
      }

      warmedHrefsRef.current.add(href);
      router.prefetch(href);
    }

    function resolveAnchorLabel(anchor: HTMLAnchorElement): string {
      return anchor.textContent?.replace(/\s+/g, ' ').trim() || shellLabels.groups.predicta;
    }

    function startNavigationFeedback(href: string, targetLabel = shellLabels.groups.predicta): void {
      warmInternalHref(href);

      const nextUrl = new URL(href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isSameLocation =
        nextUrl.pathname === currentUrl.pathname &&
        nextUrl.search === currentUrl.search &&
        nextUrl.hash === currentUrl.hash;

      if (isSameLocation) {
        return;
      }

      flushSync(() => {
        setIsNavigating(true);
        setNavigationTargetLabel(targetLabel);
      });
      window.clearTimeout(navigationTimeoutRef.current);
      navigationTimeoutRef.current = window.setTimeout(() => {
        clearNavigationFeedback();
      }, 2400);
    }

    function warmLink(event: PointerEvent | FocusEvent | TouchEvent) {
      const anchor = resolveInternalAnchor(event.target);

      if (!anchor) {
        return;
      }

      const href = getInternalHref(anchor);

      if (href) {
        if (event.type === 'pointerdown' || event.type === 'touchstart') {
          startNavigationFeedback(href, resolveAnchorLabel(anchor));
          return;
        }

        warmInternalHref(href);
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

      startNavigationFeedback(href, resolveAnchorLabel(anchor));
    }

    function showProgrammaticNavigationFeedback(event: Event): void {
      const href = (event as CustomEvent<{ href?: unknown }>).detail?.href;

      if (typeof href !== 'string' || !href.startsWith('/')) {
        return;
      }

      startNavigationFeedback(href);
    }

    document.addEventListener('pointerover', warmLink, { capture: true, passive: true });
    document.addEventListener('pointerdown', warmLink, { capture: true, passive: true });
    document.addEventListener('focusin', warmLink, { capture: true });
    document.addEventListener('touchstart', warmLink, { capture: true, passive: true });
    document.addEventListener('click', showNavigationFeedback, { capture: true });
    window.addEventListener(
      PREDICTA_NAVIGATION_FEEDBACK_EVENT,
      showProgrammaticNavigationFeedback,
    );

    return () => {
      document.removeEventListener('pointerover', warmLink, { capture: true });
      document.removeEventListener('pointerdown', warmLink, { capture: true });
      document.removeEventListener('focusin', warmLink, { capture: true });
      document.removeEventListener('touchstart', warmLink, { capture: true });
      document.removeEventListener('click', showNavigationFeedback, { capture: true });
      window.removeEventListener(
        PREDICTA_NAVIGATION_FEEDBACK_EVENT,
        showProgrammaticNavigationFeedback,
      );
      window.clearTimeout(navigationTimeoutRef.current);
    };
  }, [router, shellLabels.groups.predicta]);

  useEffect(() => {
    window.clearTimeout(navigationTimeoutRef.current);
    if (!isNavigating) {
      setNavigationTargetLabel('');
      return;
    }

    // Keep the receipt visible briefly after route commit so fast links still
    // feel acknowledged instead of flickering away before users can read it.
    navigationTimeoutRef.current = window.setTimeout(() => {
      clearNavigationFeedback();
    }, 760);
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
      {isNavigating ? (
        <div
          aria-live="polite"
          className="predicta-navigation-receipt is-active"
          role="status"
        >
          <span>{shellLabels.actions.navigationOpeningPrefix}</span>
          <strong>{navigationTargetLabel || shellLabels.groups.predicta}</strong>
          <small>{shellLabels.actions.navigationOpeningBody}</small>
        </div>
      ) : null}
      {areAccountServicesReady ? <ClientAccountServicesProvider /> : null}
    </>
  );
}
