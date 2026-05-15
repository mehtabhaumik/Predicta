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
        <p>{copy.body}</p>
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
    premiumCta: string;
    title: string;
  }
> = {
  en: {
    askCta: 'Ask from report',
    body:
      'Start with a useful free preview. Go deeper only when you want timing, remedies, chart proof, or a polished PDF.',
    premiumCta: 'See deeper report options',
    title: 'Pick the report you actually need.',
  },
  hi: {
    askCta: 'रिपोर्ट से पूछें',
    body:
      'उपयोगी मुफ्त प्रीव्यू से शुरू करें. समय, उपाय, चार्ट प्रमाण या सुंदर PDF चाहिए तो गहरा विकल्प चुनें.',
    premiumCta: 'गहरे रिपोर्ट विकल्प देखें',
    title: 'जो रिपोर्ट सच में चाहिए, वही चुनें.',
  },
  gu: {
    askCta: 'રિપોર્ટ પરથી પૂછો',
    body:
      'ઉપયોગી મફત પ્રીવ્યૂથી શરૂ કરો. સમય, ઉપાયો, ચાર્ટ પુરાવો અથવા સુંદર PDF જોઈએ ત્યારે ઊંડો વિકલ્પ પસંદ કરો.',
    premiumCta: 'ઊંડા રિપોર્ટ વિકલ્પો જુઓ',
    title: 'જે રિપોર્ટ સાચે જોઈએ, તે પસંદ કરો.',
  },
};
