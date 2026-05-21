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
            prompt: copy.askPrompt,
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
    askPrompt: string;
    body: string;
    drawerTitle: string;
    openDetails: string;
    premiumCta: string;
    title: string;
  }
> = {
  en: {
    askCta: 'Ask which report fits',
    askPrompt: 'Help me choose the right report from my selected Kundli.',
    body:
      'Start with a useful free preview. Choose paid depth only when the report needs timing windows, remedies, chart proof, or a polished PDF for a real decision.',
    drawerTitle: 'How to choose',
    openDetails: 'Open',
    premiumCta: 'Compare report options',
    title: 'Pick the report you actually need.',
  },
  hi: {
    askCta: 'पूछें कौन सी रिपोर्ट सही रहेगी',
    askPrompt: 'मेरी चुनी हुई कुंडली के लिए सही रिपोर्ट चुनने में मदद करें.',
    body:
      'उपयोगी मुफ्त झलक से शुरू करें. गहराई वाला सशुल्क विकल्प तभी चुनें जब किसी गंभीर निर्णय के लिए समय-खिड़कियां, उपाय, चार्ट प्रमाण या संभालकर रखने योग्य सजी हुई पीडीएफ चाहिए.',
    drawerTitle: 'कैसे चुनें',
    openDetails: 'खोलें',
    premiumCta: 'रिपोर्ट विकल्प देखें',
    title: 'वही रिपोर्ट चुनें जिसकी सच में जरूरत है.',
  },
  gu: {
    askCta: 'પૂછો કઈ રિપોર્ટ યોગ્ય રહેશે',
    askPrompt: 'મારી પસંદ કરેલી કુંડળી માટે યોગ્ય રિપોર્ટ પસંદ કરવામાં મદદ કરો.',
    body:
      'ઉપયોગી મફત ઝલકથી શરૂ કરો. વધુ ઊંડાઈવાળો સશુલ્ક વિકલ્પ ત્યારે જ પસંદ કરો જ્યારે કોઈ ગંભીર નિર્ણય માટે સમયની ખિડકીઓ, ઉપાયો, ચાર્ટ પુરાવો અથવા સાચવી રાખવા જેવી સજ્જ પીડીએફ જોઈએ.',
    drawerTitle: 'કેવી રીતે પસંદ કરવું',
    openDetails: 'ખોલો',
    premiumCta: 'રિપોર્ટ વિકલ્પો જુઓ',
    title: 'જે રિપોર્ટની ખરેખર જરૂર છે, તે પસંદ કરો.',
  },
};
