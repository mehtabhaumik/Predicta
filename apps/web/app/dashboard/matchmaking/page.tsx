'use client';

import type { SupportedLanguage } from '@pridicta/types';
import { WebMatchmakingPanel } from '../../../components/WebMatchmakingPanel';
import { demoAccess } from '../../../lib/demo-state';
import { useLanguagePreference } from '../../../lib/language-preference';

const COPY: Record<SupportedLanguage, { body: string; eyebrow: string; title: string }> = {
  en: {
    body:
      'Use one boy Kundli and one girl Kundli for a dedicated Vedic marriage read with score, strengths, caution areas, and practical conclusion.',
    eyebrow: 'MATCHMAKING',
    title: 'Marriage evaluation should not feel like a generic compatibility widget.',
  },
  hi: {
    body:
      'एक लड़के और एक लड़की की कुंडली चुनें और स्कोर, मजबूत पक्ष, सावधानी क्षेत्र और व्यावहारिक निष्कर्ष के साथ समर्पित वैदिक विवाह रीडिंग पाएं.',
    eyebrow: 'विवाह मिलान',
    title: 'विवाह मूल्यांकन किसी साधारण मिलान उपकरण जैसा नहीं लगना चाहिए.',
  },
  gu: {
    body:
      'એક છોકરા અને એક છોકરીની કુંડળી પસંદ કરો અને સ્કોર, મજબૂત પક્ષ, સાવચેતી ક્ષેત્રો અને પ્રાયોગિક નિષ્કર્ષ સાથે સમર્પિત વૈદિક લગ્ન વાંચન મેળવો.',
    eyebrow: 'લગ્ન મિલાન',
    title: 'લગ્ન મૂલ્યાંકન કોઈ સામાન્ય મેળ સાધન જેવું લાગવું જોઈએ નહીં.',
  },
};

export default function MatchmakingPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = COPY[language] ?? COPY.en;

  return (
    <section className="dashboard-page">
      <div className="page-heading compact family-page-heading">
        <div>
          <div className="section-title">{copy.eyebrow}</div>
          <h1 className="gradient-text">{copy.title}</h1>
          <p>{copy.body}</p>
        </div>
      </div>
      <WebMatchmakingPanel hasPremiumAccess={demoAccess.hasPremiumAccess} />
    </section>
  );
}
