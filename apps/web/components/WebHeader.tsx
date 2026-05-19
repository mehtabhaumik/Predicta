'use client';

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
    dashboard: string;
    links: Array<{ href: string; label: string }>;
    menu: string;
    tagline: string;
  }
> = {
  en: {
    dashboard: 'Open Dashboard',
    links: [
      { href: '/dashboard/vedic', label: 'Vedic' },
      { href: '/dashboard/kp', label: 'KP' },
      { href: '/dashboard/nadi', label: 'Nadi' },
      { href: '/dashboard/numerology', label: 'Numerology' },
      { href: '/dashboard/signature', label: 'Signature' },
      { href: '/dashboard/report', label: 'Reports' },
      { href: '/accuracy-method', label: 'Method' },
      { href: '/safety', label: 'Safety' },
      { href: '/pricing', label: 'Pricing' },
    ],
    menu: 'Open navigation menu',
    tagline: 'Holistic astrology',
  },
  hi: {
    dashboard: 'डैशबोर्ड खोलें',
    links: [
      { href: '/dashboard/vedic', label: 'वैदिक' },
      { href: '/dashboard/kp', label: 'KP' },
      { href: '/dashboard/nadi', label: 'नाड़ी' },
      { href: '/dashboard/numerology', label: 'अंक ज्योतिष' },
      { href: '/dashboard/signature', label: 'हस्ताक्षर' },
      { href: '/dashboard/report', label: 'रिपोर्ट' },
      { href: '/accuracy-method', label: 'विधि' },
      { href: '/safety', label: 'सुरक्षा' },
      { href: '/pricing', label: 'प्राइसिंग' },
    ],
    menu: 'नेविगेशन मेनू खोलें',
    tagline: 'होलिस्टिक ज्योतिष',
  },
  gu: {
    dashboard: 'ડેશબોર્ડ ખોલો',
    links: [
      { href: '/dashboard/vedic', label: 'વેદિક' },
      { href: '/dashboard/kp', label: 'KP' },
      { href: '/dashboard/nadi', label: 'નાડી' },
      { href: '/dashboard/numerology', label: 'અંક જ્યોતિષ' },
      { href: '/dashboard/signature', label: 'સહી' },
      { href: '/dashboard/report', label: 'રિપોર્ટ્સ' },
      { href: '/accuracy-method', label: 'પદ્ધતિ' },
      { href: '/safety', label: 'સેફ્ટી' },
      { href: '/pricing', label: 'પ્રાઇસિંગ' },
    ],
    menu: 'નેવિગેશન મેનૂ ખોલો',
    tagline: 'હોલિસ્ટિક જ્યોતિષ',
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
          <strong>PREDICTA</strong>
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
        <WebLanguageSelector compact />
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
                    <Link
                      href={link.href}
                      key={link.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
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
  return pathname === href || pathname.startsWith(`${href}/`);
}
