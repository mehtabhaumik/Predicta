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
  const landingCopy = responseCopy.landing;

  return (
    <header className="ask-lean-header">
      <Link aria-label={labels.nav.home} className="ask-lean-brand" href="/">
        <img alt="" height={44} src="/predicta-logo.png" width={44} />
        <span>
          <strong>{labels.groups.predicta}</strong>
          <small>{responseCopy.headerTagline}</small>
        </span>
      </Link>

      <div className="ask-lean-header-actions">
        <div className="ask-lean-status">
          <span>{landingCopy.askHeaderNote}</span>
        </div>
      </div>
    </header>
  );
}
