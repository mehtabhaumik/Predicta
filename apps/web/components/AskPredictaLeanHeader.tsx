'use client';

import Link from 'next/link';
import {
  getLightweightAppShellLabels,
  getLightweightCompetitorResponseCopy,
} from '../lib/lightweight-public-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';

export function AskPredictaLeanHeader(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();
  const labels = getLightweightAppShellLabels(language);
  const responseCopy = getLightweightCompetitorResponseCopy(language);

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
