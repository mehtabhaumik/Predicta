'use client';

import { getCompetitorResponseCopy } from '@pridicta/config';
import dynamic from 'next/dynamic';
import { useLanguagePreference } from '../lib/language-preference';

const WebDossierPreview = dynamic(
  () =>
    import('./WebDossierPreview').then(module => ({
      default: module.WebDossierPreview,
    })),
  {
    loading: () => <ReportComposerLoading />,
    ssr: false,
  },
);

export function WebReportPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getCompetitorResponseCopy(language).reportPage;

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">{copy.title}</h1>
        <details className="info-drawer">
          <summary>
            <span>{copy.drawerTitle}</span>
            <strong>{copy.openDetails}</strong>
          </summary>
          <p>{copy.body}</p>
        </details>
      </div>

      <WebDossierPreview />
    </section>
  );
}

function ReportComposerLoading(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getCompetitorResponseCopy(language).reportPage;

  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="report-composer-loading"
    >
      <div>
        <span>{copy.loadingEyebrow}</span>
        <strong>{copy.loadingTitle}</strong>
        <p>{copy.loadingBody}</p>
      </div>
      <div className="report-composer-loading-grid" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}
