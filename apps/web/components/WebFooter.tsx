'use client';

import { getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';

const footerCopy: Record<
  SupportedLanguage,
  {
    bottom: string;
    compactLead: string;
    compactLinks: Array<{ href: string; label: string }>;
    copyright: string;
    sections: Array<{
      heading: string;
      links: Array<{ href: string; label: string }>;
    }>;
    tagline: string;
    trust: string;
  }
> = {
  en: {
    bottom:
      'For reflection and self-understanding only. Not medical, legal, financial, emergency, or guaranteed prediction advice.',
    compactLead: 'Quiet exit',
    compactLinks: [
      { href: '/accuracy-method', label: 'Method' },
      { href: '/safety', label: 'Safety' },
      { href: '/legal', label: 'Legal' },
      { href: '/feedback', label: 'Feedback' },
    ],
    copyright: '© 2026 Predicta. All rights reserved.',
    sections: [
      {
        heading: 'Start',
        links: [
          { href: '/dashboard/kundli', label: 'Create Kundli' },
          { href: '/dashboard/charts', label: 'View Charts' },
          { href: '/dashboard/vedic/chat', label: 'Ask Vedic Predicta' },
          { href: '/dashboard/saved-kundlis', label: 'Kundli Library' },
          { href: '/dashboard/family', label: 'Family Vault' },
        ],
      },
      {
        heading: 'Premium',
        links: [
          { href: '/pricing', label: 'Plans and Passes' },
          { href: '/dashboard/timeline', label: 'Life Calendar' },
          { href: '/dashboard/report', label: 'PDF Reports' },
          { href: '/dashboard/matchmaking', label: 'Matchmaking' },
        ],
      },
      {
        heading: 'Trust',
        links: [
          { href: '/legal#privacy', label: 'Privacy Policy' },
          { href: '/legal#terms', label: 'Terms of Use' },
          { href: '/legal#refund', label: 'Refund Policy' },
          { href: '/legal#disclaimer', label: 'Disclaimer' },
          { href: '/legal#age-guidance', label: 'Age Guidance' },
          { href: '/accuracy-method', label: 'Accuracy & Method' },
          { href: '/safety', label: 'Safety Promise' },
          { href: '/founder', label: 'Founder Vision' },
          { href: '/feedback', label: 'Feedback' },
          {
            href: 'mailto:support@predicta.app?subject=Predicta%20Safety%20Report',
            label: 'Report an Issue',
          },
        ],
      },
    ],
    tagline:
      'Create your Kundli. Understand your life through holistic astrology. Ask better questions. Get beautiful reports.',
    trust:
      'Vedic astrology guidance with chart proof, karma-based remedies, saved Kundlis, privacy choices, and clear safety limits.',
  },
  hi: {
    bottom:
      getNativeCopy("native.apps.web.components.WebFooter.tsx.33b099b60d"),
    compactLead: getNativeCopy("native.apps.web.components.WebFooter.tsx.5075bc4b49"),
    compactLinks: [
      { href: '/accuracy-method', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.a83c03a71e") },
      { href: '/safety', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.cb4800046a") },
      { href: '/legal', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.1a14c904bf") },
      { href: '/feedback', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.c874f33caa") },
    ],
    copyright: getNativeCopy("native.apps.web.components.WebFooter.tsx.fb643b2aa6"),
    sections: [
      {
        heading: getNativeCopy("native.apps.web.components.WebFooter.tsx.3b3fc90088"),
        links: [
          { href: '/dashboard/kundli', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.7cacfebde9") },
          { href: '/dashboard/charts', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.15dca593bd") },
          { href: '/dashboard/vedic/chat', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.9d80e60dc8") },
          { href: '/dashboard/saved-kundlis', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.66249ce6af") },
          { href: '/dashboard/family', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.dc49ce1d21") },
        ],
      },
      {
        heading: getNativeCopy("native.apps.web.components.WebFooter.tsx.b552bca1c9"),
        links: [
          { href: '/pricing', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.cd48221509") },
          { href: '/dashboard/timeline', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.e9cddcb045") },
          { href: '/dashboard/report', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.317d6fcb6e") },
          { href: '/dashboard/matchmaking', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.1952f57972") },
        ],
      },
      {
        heading: getNativeCopy("native.apps.web.components.WebFooter.tsx.4da58ca099"),
        links: [
          { href: '/legal#privacy', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.92fe1e293c") },
          { href: '/legal#terms', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.2fc975ec58") },
          { href: '/legal#refund', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.f77138b547") },
          { href: '/legal#disclaimer', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.afa2530bc9") },
          { href: '/legal#age-guidance', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.470ec9393a") },
          { href: '/accuracy-method', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.3fdb3ca074") },
          { href: '/safety', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.372b8a25c1") },
          { href: '/founder', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.c9261d9894") },
          { href: '/feedback', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.c874f33caa") },
          {
            href: 'mailto:support@predicta.app?subject=Predicta%20Safety%20Report',
            label: getNativeCopy("native.apps.web.components.WebFooter.tsx.10bc01d775"),
          },
        ],
      },
    ],
    tagline:
      getNativeCopy("native.apps.web.components.WebFooter.tsx.3a3194eba4"),
    trust:
      getNativeCopy("native.apps.web.components.WebFooter.tsx.bd090d736b"),
  },
  gu: {
    bottom:
      getNativeCopy("native.apps.web.components.WebFooter.tsx.ce42af2a0a"),
    compactLead: getNativeCopy("native.apps.web.components.WebFooter.tsx.63f752a915"),
    compactLinks: [
      { href: '/accuracy-method', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.0b99007136") },
      { href: '/safety', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.8c1ae6f5ea") },
      { href: '/legal', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.a987e56694") },
      { href: '/feedback', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.ccc4bb654d") },
    ],
    copyright: getNativeCopy("native.apps.web.components.WebFooter.tsx.1da1875585"),
    sections: [
      {
        heading: getNativeCopy("native.apps.web.components.WebFooter.tsx.a45a75d31d"),
        links: [
          { href: '/dashboard/kundli', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.c0e4dc5abd") },
          { href: '/dashboard/charts', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.077280e1d9") },
          { href: '/dashboard/vedic/chat', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.335a17db38") },
          { href: '/dashboard/saved-kundlis', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.69e24edda7") },
          { href: '/dashboard/family', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.dde3029f16") },
        ],
      },
      {
        heading: getNativeCopy("native.apps.web.components.WebFooter.tsx.81ee678383"),
        links: [
          { href: '/pricing', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.2fe7ebb270") },
          { href: '/dashboard/timeline', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.40f90b2816") },
          { href: '/dashboard/report', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.2cb8f33c5e") },
          { href: '/dashboard/matchmaking', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.a2ef635763") },
        ],
      },
      {
        heading: getNativeCopy("native.apps.web.components.WebFooter.tsx.41648cb969"),
        links: [
          { href: '/legal#privacy', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.39601af9d2") },
          { href: '/legal#terms', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.4902bb041c") },
          { href: '/legal#refund', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.446f06d549") },
          { href: '/legal#disclaimer', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.5dc2ffd764") },
          { href: '/legal#age-guidance', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.ee8fa80135") },
          { href: '/accuracy-method', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.2c0b9ee372") },
          { href: '/safety', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.604da01c8c") },
          { href: '/founder', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.1f7291f95a") },
          { href: '/feedback', label: getNativeCopy("native.apps.web.components.WebFooter.tsx.ccc4bb654d") },
          {
            href: 'mailto:support@predicta.app?subject=Predicta%20Safety%20Report',
            label: getNativeCopy("native.apps.web.components.WebFooter.tsx.d1bc9bfa58"),
          },
        ],
      },
    ],
    tagline:
      getNativeCopy("native.apps.web.components.WebFooter.tsx.cff17c8c8b"),
    trust:
      getNativeCopy("native.apps.web.components.WebFooter.tsx.3d18426098"),
  },
};

export function WebFooter({
  className = '',
  variant = 'public',
}: {
  className?: string;
  variant?: 'dashboard' | 'public';
}): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = footerCopy[language] ?? footerCopy.en;

  if (variant === 'dashboard') {
    return (
      <footer className={`web-footer web-footer-compact ${className}`.trim()}>
        <div className="web-footer-compact-row">
          <div className="web-footer-compact-brand">
            <Link aria-label="Predicta home" className="web-footer-logo" href="/">
              PREDICTA
            </Link>
            <span>{copy.compactLead}</span>
          </div>
          <nav aria-label="Dashboard footer navigation" className="web-footer-compact-links">
            {copy.compactLinks.map(link => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="web-footer-bottom compact">
          <span>{copy.copyright}</span>
          <span>{copy.bottom}</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`web-footer ${className}`.trim()}>
      <div className="web-footer-inner">
        <div className="web-footer-brand">
          <Link aria-label="Predicta home" className="web-footer-logo" href="/">
            PREDICTA
          </Link>
          <p className="web-footer-tagline">
            {copy.tagline}
          </p>
          <p className="web-footer-trust">
            {copy.trust}
          </p>
        </div>

        <nav aria-label="Footer navigation" className="web-footer-grid">
          {copy.sections.map(section => (
            <div className="web-footer-column" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.links.map(link => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="web-footer-bottom">
        <span>{copy.copyright}</span>
        <span>{copy.bottom}</span>
      </div>
    </footer>
  );
}
