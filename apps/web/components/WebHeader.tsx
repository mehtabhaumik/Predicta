'use client';

import { getAppShellLabels, getCompetitorResponseCopy } from '@pridicta/config';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useLanguagePreference } from '../lib/language-preference';
import { preloadAskPredictaRuntime } from '../lib/predicta-chat-runtime-preload';
import { AuthDialog } from './AuthDialog';
import { PredictaMediaAsset } from './ui/DesignSystemPrimitives';
import { WebLanguageSelector } from './WebLanguageSelector';

export function WebHeader(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const shellLabels = getAppShellLabels(language);
  const copy = buildPublicHeaderCopy(shellLabels);
  const responseCopy = getCompetitorResponseCopy(language);

  function prewarmAskPredicta(): void {
    preloadAskPredictaRuntime();
    router.prefetch('/ask');
  }

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        mobileMenuRef.current?.contains(target)
      ) {
        return;
      }

      setMenuOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="web-header">
      <Link aria-label={shellLabels.nav.home} className="brand-lockup" href="/">
        <PredictaMediaAsset
          alt=""
          className="brand-logo"
          height={72}
          kind="logo"
          priority
          src="/predicta-logo.png"
          width={72}
        />
        <span>
          <strong>{copy.brand}</strong>
          <small>{responseCopy.headerTagline}</small>
        </span>
      </Link>
      <nav aria-label={shellLabels.groups.sections} className="header-nav">
        {copy.links.map(link => renderPublicNavLink({ link, pathname }))}
      </nav>
      <div className="header-actions">
        <WebLanguageSelector compact hideCompactLabel />
        <AuthDialog />
        <Link
          className="button secondary header-cta"
          href="/ask"
          onFocus={prewarmAskPredicta}
          onPointerEnter={prewarmAskPredicta}
          onTouchStart={prewarmAskPredicta}
        >
          {shellLabels.actions.askPredicta}
        </Link>
      </div>
      <div className="mobile-menu" ref={mobileMenuRef}>
        <button
          aria-expanded={menuOpen}
          aria-label={copy.menu}
          className="mobile-menu-button"
          onClick={() => setMenuOpen(current => !current)}
          type="button"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
        {menuOpen ? (
          <>
            <div
              className="mobile-menu-scrim"
              onClick={() => setMenuOpen(false)}
              role="presentation"
            />
            <div className="mobile-menu-panel">
              <nav aria-label={shellLabels.groups.sections}>
                <div className="mobile-menu-nav-group">
                  {copy.links.map(link =>
                    renderPublicMobileLink({
                      link,
                      onClick: () => setMenuOpen(false),
                      pathname,
                    }),
                  )}
                </div>
                <div className="mobile-menu-nav-group">
                  <span className="mobile-menu-nav-title">
                    {copy.supportTitle}
                  </span>
                  {copy.supportLinks.map(link =>
                    renderPublicMobileLink({
                      link,
                      onClick: () => setMenuOpen(false),
                      pathname,
                    }),
                  )}
                </div>
              </nav>
              <div className="mobile-menu-actions">
                <WebLanguageSelector compact />
                <AuthDialog />
                <Link
                  className="button secondary"
                  href="/ask"
                  onClick={() => {
                    prewarmAskPredicta();
                    setMenuOpen(false);
                  }}
                  onFocus={prewarmAskPredicta}
                  onPointerEnter={prewarmAskPredicta}
                  onTouchStart={prewarmAskPredicta}
                >
                  {shellLabels.actions.askPredicta}
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}

function buildPublicHeaderCopy(labels: ReturnType<typeof getAppShellLabels>): {
  brand: string;
  links: Array<{ href: string; label: string }>;
  menu: string;
  supportLinks: Array<{ href: string; label: string }>;
  supportTitle: string;
} {
  return {
    brand: labels.groups.predicta,
    links: [
      { href: '/accuracy-method', label: labels.nav.accuracyMethod },
      { href: '/safety', label: labels.nav.safetyPromise },
      { href: '/pricing', label: labels.nav.premium },
    ],
    menu: labels.actions.openMenu,
    supportLinks: [
      { href: '/safety', label: labels.nav.safetyPromise },
      { href: '/founder', label: labels.nav.founderVision },
      { href: '/feedback', label: labels.nav.feedback },
      { href: '/legal', label: labels.nav.legal },
    ],
    supportTitle: labels.groups.support,
  };
}

function isPublicNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function renderPublicNavLink({
  link,
  pathname,
}: {
  link: { href: string; label: string };
  pathname: string;
}): React.JSX.Element {
  const active = isPublicNavActive(pathname, link.href);

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={active ? 'active' : undefined}
      href={link.href}
      key={link.href}
    >
      {link.label}
    </Link>
  );
}

function renderPublicMobileLink({
  link,
  onClick,
  pathname,
}: {
  link: { href: string; label: string };
  onClick: () => void;
  pathname: string;
}): React.JSX.Element {
  const active = isPublicNavActive(pathname, link.href);

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={active ? 'active' : undefined}
      href={link.href}
      key={link.href}
      onClick={onClick}
    >
      {link.label}
    </Link>
  );
}
