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
    askCta: 'Ask from report',
    body:
      'Start with a useful free preview. Go deeper only when you want timing, remedies, chart proof, or a polished PDF.',
    drawerTitle: 'How to choose',
    openDetails: 'Open',
    premiumCta: 'See deeper report options',
    title: 'Pick the report you actually need.',
  },
  hi: {
    askCta: 'रिपोर्ट से पूछें',
    body:
      'उपयोगी मुफ्त झलक से शुरू करें. समय, उपाय, चार्ट प्रमाण या सुंदर पीडीएफ चाहिए तो गहरा विकल्प चुनें.',
    drawerTitle: 'कैसे चुनें',
    openDetails: 'खोलें',
    premiumCta: 'गहरे रिपोर्ट विकल्प देखें',
    title: 'जो रिपोर्ट सच में चाहिए, वही चुनें.',
  },
  gu: {
    askCta: 'રિપોર્ટ પરથી પૂછો',
    body:
      'ઉપયોગી મફત ઝલકથી શરૂ કરો. સમય, ઉપાયો, ચાર્ટ પુરાવો અથવા સુંદર પીડીએફ જોઈએ ત્યારે ઊંડો વિકલ્પ પસંદ કરો.',
    drawerTitle: 'કેવી રીતે પસંદ કરવું',
    openDetails: 'ખોલો',
    premiumCta: 'ઊંડા રિપોર્ટ વિકલ્પો જુઓ',
    title: 'જે રિપોર્ટ સાચે જોઈએ, તે પસંદ કરો.',
  },
};
