'use client';

import { getCompetitorResponseCopy } from '@pridicta/config';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';

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
  const router = useRouter();
  const { language } = useLanguagePreference();
  const copy = getCompetitorResponseCopy(language).reportPage;
  const askReportHref = buildPredictaChatHref({
    prompt: copy.questionPlaceholder,
    reportFocus: 'report_selection',
    sourceScreen: 'Reports',
  });

  function prefetchReportAsk(href = askReportHref) {
    router.prefetch('/ask');
    router.prefetch(href);
  }

  useEffect(() => {
    router.prefetch('/ask');
    router.prefetch(askReportHref);
  }, [askReportHref, router]);

  return (
    <section className="dashboard-page">
      <div className="page-heading compact report-page-heading">
        <h1 className="gradient-text">{copy.title}</h1>
        <details className="info-drawer">
          <summary>
            <span>{copy.drawerTitle}</span>
            <strong>{copy.openDetails}</strong>
          </summary>
          <p>{copy.body}</p>
        </details>
        <div className="report-page-quick-actions">
          <Link className="button" href="/dashboard/kundli">
            {copy.createKundliCta}
          </Link>
          <Link
            className="button secondary"
            href={askReportHref}
            onFocus={() => prefetchReportAsk(askReportHref)}
            onPointerEnter={() => prefetchReportAsk(askReportHref)}
            onTouchStart={() => prefetchReportAsk(askReportHref)}
          >
            {copy.askPredictaCta}
          </Link>
        </div>
      </div>

      <div id="report-builder">
        <WebDossierPreview />
      </div>
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
        <div className="report-composer-loading-actions">
          <Link className="button" href="/dashboard/kundli">
            {copy.createKundliCta}
          </Link>
          <Link className="button secondary" href="/ask?sourceScreen=Reports">
            {copy.askPredictaCta}
          </Link>
        </div>
      </div>
      <div className="report-composer-loading-grid" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </section>
  );
}
