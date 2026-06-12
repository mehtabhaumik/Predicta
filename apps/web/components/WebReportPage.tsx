'use client';

import { getCompetitorResponseCopy } from '@pridicta/config';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLanguagePreference } from '../lib/language-preference';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { preloadAskPredictaRuntime } from '../lib/predicta-chat-runtime-preload';

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
  const [reportQuestion, setReportQuestion] = useState(
    copy.suggestedQuestions[0] ?? '',
  );
  const askReportHref = buildPredictaChatHref({
    prompt: reportQuestion.trim() || copy.questionPlaceholder,
    reportFocus: 'report_selection',
    sourceScreen: 'Reports',
  });

  function prewarmReportAsk(href = askReportHref) {
    preloadAskPredictaRuntime();
    router.prefetch('/ask');
    router.prefetch(href);
  }

  useEffect(() => {
    prewarmReportAsk();
  }, [askReportHref]);

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
        <div className="report-page-quick-actions">
          <Link className="button" href="/dashboard/kundli">
            {copy.createKundliCta}
          </Link>
          <Link
            className="button secondary"
            href={askReportHref}
            onFocus={() => prewarmReportAsk(askReportHref)}
            onPointerEnter={() => prewarmReportAsk(askReportHref)}
            onTouchStart={() => prewarmReportAsk(askReportHref)}
          >
            {copy.askPredictaCta}
          </Link>
        </div>
      </div>

      <section
        className="report-question-panel glass-panel"
        onFocus={() => prewarmReportAsk()}
        onPointerEnter={() => prewarmReportAsk()}
        onTouchStart={() => prewarmReportAsk()}
      >
        <div className="report-question-copy">
          <div className="section-title">{copy.questionEyebrow}</div>
          <h2>{copy.questionTitle}</h2>
          <p>{copy.questionBody}</p>
        </div>
        <div className="report-question-console">
          <label className="landing-ask-field">
            <span>{copy.questionLabel}</span>
            <textarea
              onChange={event => setReportQuestion(event.target.value)}
              placeholder={copy.questionPlaceholder}
              value={reportQuestion}
            />
          </label>
          <div
            aria-label={copy.suggestedQuestionLabel}
            className="landing-question-chips"
          >
            {copy.suggestedQuestions.map(item => (
              <button
                key={item}
                onClick={() => setReportQuestion(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>
          <div className="landing-ask-actions">
            <Link
              className="button"
              href={askReportHref}
              onFocus={() => prewarmReportAsk(askReportHref)}
              onPointerEnter={() => prewarmReportAsk(askReportHref)}
              onTouchStart={() => prewarmReportAsk(askReportHref)}
            >
              {copy.askReportCta}
            </Link>
            <Link className="button secondary" href="#report-builder">
              {copy.openBuilderCta}
            </Link>
          </div>
        </div>
      </section>

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
