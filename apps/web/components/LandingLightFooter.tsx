'use client';

import Link from 'next/link';
import { getLightweightAppShellLabels } from '../lib/lightweight-public-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';

export function LandingLightFooter(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();
  const labels = getLightweightAppShellLabels(language);
  const links = [
    { href: '/accuracy-method', label: labels.nav.accuracyMethod },
    { href: '/safety', label: labels.nav.safetyPromise },
    { href: '/legal', label: labels.nav.legal },
    { href: '/feedback', label: labels.nav.feedback },
  ];

  return (
    <footer className="web-footer web-footer-compact">
      <div className="web-footer-compact-row">
        <div className="web-footer-compact-brand">
          <Link aria-label={labels.nav.home} className="web-footer-logo" href="/">
            PREDICTA
          </Link>
          <span>{labels.groups.support}</span>
        </div>
        <nav
          aria-label={labels.groups.sections}
          className="web-footer-compact-links"
        >
          {links.map(link => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <p>{labels.publicDisclaimer}</p>
    </footer>
  );
}
