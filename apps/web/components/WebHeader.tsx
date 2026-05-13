'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
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
      { href: '/#intelligence', label: 'Intelligence' },
      { href: '/#reports', label: 'Reports' },
      { href: '/safety', label: 'Safety' },
      { href: '/founder', label: 'Founder' },
      { href: '/pricing', label: 'Pricing' },
      { href: '/legal', label: 'Legal' },
    ],
    menu: 'Open navigation menu',
    tagline: 'Holistic astrology',
  },
  hi: {
    dashboard: 'डैशबोर्ड खोलें',
    links: [
      { href: '/#intelligence', label: 'इंटेलिजेंस' },
      { href: '/#reports', label: 'रिपोर्ट' },
      { href: '/safety', label: 'सुरक्षा' },
      { href: '/founder', label: 'फाउंडर' },
      { href: '/pricing', label: 'प्राइसिंग' },
      { href: '/legal', label: 'कानूनी' },
    ],
    menu: 'नेविगेशन मेनू खोलें',
    tagline: 'होलिस्टिक ज्योतिष',
  },
  gu: {
    dashboard: 'ડેશબોર્ડ ખોલો',
    links: [
      { href: '/#intelligence', label: 'ઇન્ટેલિજન્સ' },
      { href: '/#reports', label: 'રિપોર્ટ્સ' },
      { href: '/safety', label: 'સેફ્ટી' },
      { href: '/founder', label: 'ફાઉન્ડર' },
      { href: '/pricing', label: 'પ્રાઇસિંગ' },
      { href: '/legal', label: 'કાનૂની' },
    ],
    menu: 'નેવિગેશન મેનૂ ખોલો',
    tagline: 'હોલિસ્ટિક જ્યોતિષ',
  },
};

export function WebHeader(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const [menuOpen, setMenuOpen] = useState(false);
  const copy = publicHeaderCopy[language] ?? publicHeaderCopy.en;

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
        {copy.links.map(link => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        <WebLanguageSelector compact />
        <AuthDialog />
        <Link className="button secondary header-cta" href="/dashboard">
          {copy.dashboard}
        </Link>
      </div>
      <div className="mobile-menu">
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
          <div
            className="mobile-menu-scrim"
            onClick={() => setMenuOpen(false)}
            role="presentation"
          >
            <div
              className="mobile-menu-panel"
              onClick={event => event.stopPropagation()}
            >
              <nav aria-label="Mobile navigation">
                {copy.links.map(link => (
                  <Link
                    href={link.href}
                    key={link.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
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
          </div>
        ) : null}
      </div>
    </header>
  );
}
