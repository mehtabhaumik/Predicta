'use client';

import { getAppShellLabels, getCompetitorResponseCopy } from '@pridicta/config';
import Link from 'next/link';
import { useLanguagePreference } from '../lib/language-preference';

export function AskPredictaLeanHeader(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const labels = getAppShellLabels(language);
  const responseCopy = getCompetitorResponseCopy(language);

  return (
    <header className="ask-lean-header">
      <Link aria-label={labels.nav.home} className="ask-lean-brand" href="/">
        <img alt="" height={44} src="/predicta-logo.png" width={44} />
        <span>
          <strong>{labels.groups.predicta}</strong>
          <small>{responseCopy.headerTagline}</small>
        </span>
      </Link>

      <nav aria-label={labels.groups.sections} className="ask-lean-nav">
        <Link href="/dashboard">{labels.nav.dashboard}</Link>
        <Link href="/dashboard/report">{labels.nav.reports}</Link>
        <Link href="/pricing">{labels.nav.premium}</Link>
      </nav>
    </header>
  );
}
