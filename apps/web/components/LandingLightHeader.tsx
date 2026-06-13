'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  getLightweightAppShellLabels,
  getLightweightCompetitorResponseCopy,
} from '../lib/lightweight-public-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';
import { LightweightLanguageSelector } from './LightweightLanguageSelector';

export function LandingLightHeader(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const labels = getLightweightAppShellLabels(language);
  const responseCopy = getLightweightCompetitorResponseCopy(language);
  const primaryMenuLinks = [
    { href: '/accuracy-method', label: labels.nav.accuracyMethod },
    { href: '/safety', label: labels.nav.safetyPromise },
    { href: '/pricing', label: labels.nav.premium },
  ];
  const desktopLinks = [
    { href: '/ask', label: labels.actions.askPredicta },
    { href: '/accuracy-method', label: labels.nav.accuracyMethod },
    { href: '/safety', label: labels.nav.safetyPromise },
    { href: '/pricing', label: labels.nav.premium },
  ];

  function prewarmAskPredicta(): void {
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
      <Link aria-label={labels.nav.home} className="brand-lockup" href="/">
        <img
          alt=""
          className="brand-logo"
          height={72}
          src="/predicta-logo.png"
          width={72}
        />
        <span>
          <strong>{labels.groups.predicta}</strong>
          <small>{responseCopy.headerTagline}</small>
        </span>
      </Link>
      <nav aria-label={labels.groups.sections} className="header-nav">
        {desktopLinks.map(link =>
          renderNavLink({
            link,
            onPrewarmAsk: link.href === '/ask' ? prewarmAskPredicta : undefined,
            pathname,
          }),
        )}
      </nav>
      <div className="header-actions">
        <LightweightLanguageSelector compact hideCompactLabel />
      </div>
      <div className="mobile-menu" ref={mobileMenuRef}>
        <button
          aria-expanded={menuOpen}
          aria-label={labels.actions.openMenu}
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
              <nav aria-label={labels.groups.sections}>
                <div className="mobile-menu-nav-group">
                  <Link
                    className="mobile-menu-primary-ask"
                    href="/ask"
                    onClick={() => {
                      prewarmAskPredicta();
                      setMenuOpen(false);
                    }}
                    onFocus={prewarmAskPredicta}
                    onPointerEnter={prewarmAskPredicta}
                    onTouchStart={prewarmAskPredicta}
                  >
                    {labels.actions.askPredicta}
                  </Link>
                  {primaryMenuLinks.map(link =>
                    renderMobileNavLink({
                      link,
                      onClick: () => setMenuOpen(false),
                      pathname,
                    }),
                  )}
                </div>
              </nav>
              <div className="mobile-menu-actions">
                <LightweightLanguageSelector compact />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}

function isPublicNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function renderNavLink({
  link,
  onPrewarmAsk,
  pathname,
}: {
  link: { href: string; label: string };
  onPrewarmAsk?: () => void;
  pathname: string;
}): React.JSX.Element {
  const active = isPublicNavActive(pathname, link.href);

  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={[
        link.href === '/ask' ? 'header-nav-primary' : '',
        active ? 'active' : '',
      ]
        .filter(Boolean)
        .join(' ') || undefined}
      href={link.href}
      key={link.href}
      onFocus={onPrewarmAsk}
      onPointerEnter={onPrewarmAsk}
      onTouchStart={onPrewarmAsk}
    >
      {link.label}
    </Link>
  );
}

function renderMobileNavLink({
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
