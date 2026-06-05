'use client';

import { getCompetitorResponseCopy } from '@pridicta/config';
import { WebDossierPreview } from '../../../components/WebDossierPreview';
import { useLanguagePreference } from '../../../lib/language-preference';

export default function ReportPage(): React.JSX.Element {
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
