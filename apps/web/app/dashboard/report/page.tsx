'use client';

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
      'पहले जीवन परिणाम चुनें, चाहें तो पीडीएफ को थोड़ा ट्यून करें, और फिर लंबी पढ़ने वाली पेज में फंसे बिना रिपोर्ट डाउनलोड करें.',
    drawerTitle: 'कैसे चुनें',
    openDetails: 'खोलें',
    title: 'वही रिपोर्ट चुनें जिसकी सच में जरूरत है.',
  },
  gu: {
    body:
      'પહેલાં જીવન પરિણામ પસંદ કરો, ઇચ્છો તો પીડીએફને થોડું ટ્યુન કરો, અને પછી લાંબી વાંચન પેજમાં અટવાયા વગર રિપોર્ટ ડાઉનલોડ કરો.',
    drawerTitle: 'કેવી રીતે પસંદ કરવું',
    openDetails: 'ખોલો',
    title: 'જે રિપોર્ટની ખરેખર જરૂર છે, તે પસંદ કરો.',
  },
};
