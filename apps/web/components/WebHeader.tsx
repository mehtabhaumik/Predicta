'use client';

import { getNativeCopy } from '@pridicta/config';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';
import { AuthDialog } from './AuthDialog';
import { WebLanguageSelector } from './WebLanguageSelector';

const publicHeaderCopy: Record<
  SupportedLanguage,
  {
    brand: string;
    dashboard: string;
    links: Array<{ href: string; label: string }>;
    menu: string;
    supportLinks: Array<{ href: string; label: string }>;
    supportTitle: string;
    tagline: string;
  }
> = {
  en: {
    brand: 'PREDICTA',
    dashboard: 'Open Dashboard',
    links: [
      { href: '/dashboard/vedic', label: 'Vedic' },
      { href: '/dashboard/kp', label: 'KP' },
      { href: '/dashboard/nadi', label: 'Nadi' },
      { href: '/dashboard/numerology', label: 'Numerology' },
      { href: '/dashboard/signature', label: 'Signature' },
      { href: '/dashboard/report', label: 'Reports' },
      { href: '/pricing', label: 'Pricing' },
    ],
    supportLinks: [
      { href: '/accuracy-method', label: 'Method' },
      { href: '/safety', label: 'Safety' },
      { href: '/founder', label: 'Founder' },
      { href: '/feedback', label: 'Feedback' },
      { href: '/legal', label: 'Legal' },
    ],
    supportTitle: 'Support',
    menu: 'Open navigation menu',
    tagline: 'Holistic astrology',
  },
  hi: {
    brand: getNativeCopy("native.apps.web.components.WebHeader.tsx.0ecc6125f2"),
    dashboard: getNativeCopy("native.apps.web.components.WebHeader.tsx.5d7a2973b7"),
    links: [
      { href: '/dashboard/vedic', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.0a41d55d52") },
      { href: '/dashboard/kp', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.16640e70b1") },
      { href: '/dashboard/nadi', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.1849d6330d") },
      { href: '/dashboard/numerology', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.922f2ff605") },
      { href: '/dashboard/signature', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.3bd079967d") },
      { href: '/dashboard/report', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.89a0ae86a5") },
      { href: '/pricing', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.fa3bc33bf1") },
    ],
    supportLinks: [
      { href: '/accuracy-method', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.a83c03a71e") },
      { href: '/safety', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.cb4800046a") },
      { href: '/founder', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.85b1ba97f6") },
      { href: '/feedback', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.c874f33caa") },
      { href: '/legal', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.1a14c904bf") },
    ],
    supportTitle: getNativeCopy("native.apps.web.components.WebHeader.tsx.3e5041d01a"),
    menu: getNativeCopy("native.apps.web.components.WebHeader.tsx.c1356a8fac"),
    tagline: getNativeCopy("native.apps.web.components.WebHeader.tsx.43feb99488"),
  },
  gu: {
    brand: getNativeCopy("native.apps.web.components.WebHeader.tsx.dbf56cabf7"),
    dashboard: getNativeCopy("native.apps.web.components.WebHeader.tsx.d6157e75b1"),
    links: [
      { href: '/dashboard/vedic', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.c60c32f61e") },
      { href: '/dashboard/kp', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.88220f0e9b") },
      { href: '/dashboard/nadi', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.d653d63a61") },
      { href: '/dashboard/numerology', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.cf14f25c86") },
      { href: '/dashboard/signature', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.7a41efa981") },
      { href: '/dashboard/report', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.d6aa714c20") },
      { href: '/pricing', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.f69dde00c0") },
    ],
    supportLinks: [
      { href: '/accuracy-method', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.0b99007136") },
      { href: '/safety', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.12f0933f1b") },
      { href: '/founder', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.a6e886fbe0") },
      { href: '/feedback', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.ccc4bb654d") },
      { href: '/legal', label: getNativeCopy("native.apps.web.components.WebHeader.tsx.a987e56694") },
    ],
    supportTitle: getNativeCopy("native.apps.web.components.WebHeader.tsx.57c3bc288b"),
    menu: getNativeCopy("native.apps.web.components.WebHeader.tsx.7bc11484f8"),
    tagline: getNativeCopy("native.apps.web.components.WebHeader.tsx.52f80fb3aa"),
  },
};

export function WebHeader(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const copy = publicHeaderCopy[language] ?? publicHeaderCopy.en;

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
      <Link aria-label="Predicta home" className="brand-lockup" href="/">
        <Image
          alt=""
          className="brand-logo"
          height={72}
          priority
          src="/predicta-logo.png"
          width={72}
        />
        <span>
          <strong>{copy.brand}</strong>
          <small>{copy.tagline}</small>
        </span>
      </Link>
      <nav aria-label="Primary navigation" className="header-nav">
        {copy.links.map(link => {
          const active = isPublicNavActive(pathname, link.href);

          return active ? (
            <span
              aria-current="page"
              aria-disabled="true"
              className="active disabled"
              key={link.href}
            >
              {link.label}
            </span>
          ) : (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="header-actions">
        <WebLanguageSelector compact hideCompactLabel />
        <AuthDialog />
        <Link className="button secondary header-cta" href="/dashboard">
          {copy.dashboard}
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
              <nav aria-label="Mobile navigation">
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
                  href="/dashboard"
                  onClick={() => setMenuOpen(false)}
                >
                  {copy.dashboard}
                </Link>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}

function isPublicNavActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
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

  return active ? (
    <span
      aria-current="page"
      aria-disabled="true"
      className="active disabled"
      key={link.href}
    >
      {link.label}
    </span>
  ) : (
    <Link href={link.href} key={link.href} onClick={onClick}>
      {link.label}
    </Link>
  );
}
