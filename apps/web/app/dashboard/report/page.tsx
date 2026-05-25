'use client';

import { getNativeCopy } from '@pridicta/config';
import { WebDossierPreview } from '../../../components/WebDossierPreview';
import { useLanguagePreference } from '../../../lib/language-preference';
import type { SupportedLanguage } from '@pridicta/types';

export default function ReportPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = reportPageCopy[language] ?? reportPageCopy.en;

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

const reportPageCopy: Record<
  SupportedLanguage,
  {
    body: string;
    drawerTitle: string;
    openDetails: string;
    title: string;
  }
> = {
  en: {
    body:
      'Choose the life outcome first, tune the PDF only if you want to, and then download the report without getting stuck in a long reading page.',
    drawerTitle: 'How to choose',
    openDetails: 'Open',
    title: 'Pick the report you actually need.',
  },
  hi: {
    body:
      getNativeCopy("native.apps.web.app.dashboard.report.page.tsx.4cb7da7657"),
    drawerTitle: getNativeCopy("native.apps.web.app.dashboard.report.page.tsx.8bc285214f"),
    openDetails: getNativeCopy("native.apps.web.app.dashboard.report.page.tsx.901879c422"),
    title: getNativeCopy("native.apps.web.app.dashboard.report.page.tsx.1060722048"),
  },
  gu: {
    body:
      getNativeCopy("native.apps.web.app.dashboard.report.page.tsx.f425d99c36"),
    drawerTitle: getNativeCopy("native.apps.web.app.dashboard.report.page.tsx.af1eea1bb8"),
    openDetails: getNativeCopy("native.apps.web.app.dashboard.report.page.tsx.e0185a82d6"),
    title: getNativeCopy("native.apps.web.app.dashboard.report.page.tsx.7ccc712909"),
  },
};
