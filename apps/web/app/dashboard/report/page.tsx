'use client';

import Link from 'next/link';
import { WebDossierPreview } from '../../../components/WebDossierPreview';
import { useLanguagePreference } from '../../../lib/language-preference';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';
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

      <div className="action-row">
        <Link className="button" href="/pricing">
          {copy.premiumCta}
        </Link>
        <Link
          className="button secondary"
          href={buildPredictaChatHref({
            prompt: 'Help me choose the right report from my selected Kundli.',
            sourceScreen: 'Report Marketplace',
          })}
        >
          {copy.askCta}
        </Link>
      </div>
    </section>
  );
}

const reportPageCopy: Record<
  SupportedLanguage,
  {
    askCta: string;
    body: string;
    drawerTitle: string;
    openDetails: string;
    premiumCta: string;
    title: string;
  }
> = {
  en: {
    askCta: 'Ask which report fits',
    body:
      'Start with a useful free preview. Choose paid depth only when the report needs timing windows, remedies, chart proof, or a polished PDF for a real decision.',
    drawerTitle: 'How to choose',
    openDetails: 'Open',
    premiumCta: 'Compare report options',
    title: 'Pick the report you actually need.',
  },
  hi: {
    askCta: 'कौन सी report सही है पूछें',
    body:
      'उपयोगी free preview से शुरू करें. Paid depth तभी चुनें जब real decision के लिए timing windows, remedies, chart proof या polished PDF चाहिए.',
    drawerTitle: 'कैसे चुनें',
    openDetails: 'खोलें',
    premiumCta: 'Report options compare करें',
    title: 'जो रिपोर्ट सच में चाहिए, वही चुनें.',
  },
  gu: {
    askCta: 'કઈ report યોગ્ય છે પૂછો',
    body:
      'ઉપયોગી free preview થી શરૂ કરો. Paid depth ત્યારે પસંદ કરો જ્યારે real decision માટે timing windows, remedies, chart proof અથવા polished PDF જોઈએ.',
    drawerTitle: 'કેવી રીતે પસંદ કરવું',
    openDetails: 'ખોલો',
    premiumCta: 'Report options compare કરો',
    title: 'જે રિપોર્ટ સાચે જોઈએ, તે પસંદ કરો.',
  },
};
