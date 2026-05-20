'use client';

import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { buildPredictaChatHref } from '../../../lib/predicta-chat-cta';
import { useLanguagePreference } from '../../../lib/language-preference';
import { useWebKundliLibrary } from '../../../lib/use-web-kundli-library';

type VedicWorldCopy = {
  actions: {
    birthTime: string;
    chat: string;
    charts: string;
    create: string;
    reports: string;
  };
  report: {
    body: string;
    cta: string;
    title: string;
  };
  cards: Array<{
    body: string;
    title: string;
  }>;
  hero: {
    body: string;
    eyebrow: string;
    title: string;
  };
  note: {
    body: string;
    title: string;
  };
};

const VEDIC_WORLD_COPY: Record<SupportedLanguage, VedicWorldCopy> = {
  en: {
    actions: {
      birthTime: 'Check birth time',
      chat: 'Chat with Vedic Predicta',
      charts: 'Open charts',
      create: 'Create Kundli',
      reports: 'Create report',
    },
    cards: [
      {
        body: 'D1, Chalit, varga charts, dasha, gochar, and house proof stay together.',
        title: 'Chart proof first',
      },
      {
        body: 'Ask about career, money, marriage, health caution, family, timing, and remedies.',
        title: 'Life questions',
      },
      {
        body: 'Karma-based remedies, Purushartha balance, Panchang, and daily guidance stay in this Vedic world.',
        title: 'Holistic support',
      },
    ],
    hero: {
      body:
        'Use this world for the main Vedic reading: Kundli, charts, dasha, gochar, remedies, timing, and report-ready guidance.',
      eyebrow: 'VEDIC WORLD',
      title: 'Your main Vedic Predicta space.',
    },
    note: {
      body:
        'KP, Nadi, Numerology, and Signature now have their own worlds. Vedic Predicta stays focused on the core Jyotish reading.',
      title: 'Separate worlds, shared Kundli',
    },
    report: {
      body:
        'Turn the Vedic reading into a polished Kundli, career, marriage, wealth, remedies, or timing report.',
      cta: 'Build Vedic report',
      title: 'Vedic report path',
    },
  },
  hi: {
    actions: {
      birthTime: 'जन्म समय जांचें',
      chat: 'वैदिक प्रेडिक्टा से चैट करें',
      charts: 'चार्ट खोलें',
      create: 'कुंडली बनाएं',
      reports: 'रिपोर्ट बनाएं',
    },
    cards: [
      {
        body: 'D1, चलित, वर्ग चार्ट, दशा, गोचर और भाव प्रमाण साथ रहते हैं.',
        title: 'पहले चार्ट प्रमाण',
      },
      {
        body: 'करियर, धन, विवाह, स्वास्थ्य सावधानी, परिवार, समय और उपाय पूछें.',
        title: 'जीवन के प्रश्न',
      },
      {
        body: 'कर्म आधारित उपाय, पुरुषार्थ संतुलन, पंचांग और दैनिक मार्गदर्शन इसी वैदिक संसार में रहते हैं.',
        title: 'होलिस्टिक सहारा',
      },
    ],
    hero: {
      body:
        'मुख्य वैदिक रीडिंग के लिए इस संसार का उपयोग करें: कुंडली, चार्ट, दशा, गोचर, उपाय, समय और रिपोर्ट-योग्य मार्गदर्शन.',
      eyebrow: 'वैदिक संसार',
      title: 'आपका मुख्य वैदिक प्रेडिक्टा स्थान.',
    },
    note: {
      body:
        'कृष्णमूर्ति पद्धति, नाड़ी, अंक ज्योतिष और हस्ताक्षर के अपने अलग संसार हैं. वैदिक प्रेडिक्टा मुख्य ज्योतिष वाचन पर केंद्रित रहती है.',
      title: 'अलग संसार, साझा कुंडली',
    },
    report: {
      body:
        'वैदिक रीडिंग को कुंडली, करियर, विवाह, धन, उपाय या समय रिपोर्ट में बदलें.',
      cta: 'वैदिक रिपोर्ट बनाएं',
      title: 'वैदिक रिपोर्ट मार्ग',
    },
  },
  gu: {
    actions: {
      birthTime: 'જન્મ સમય તપાસો',
      chat: 'વેદિક પ્રેડિક્ટા સાથે ચેટ કરો',
      charts: 'ચાર્ટ્સ ખોલો',
      create: 'કુંડળી બનાવો',
      reports: 'રિપોર્ટ બનાવો',
    },
    cards: [
      {
        body: 'D1, ચલિત, વર્ગ ચાર્ટ્સ, દશા, ગોચર અને ભાવ પુરાવો સાથે રહે છે.',
        title: 'પહેલા ચાર્ટ પુરાવો',
      },
      {
        body: 'કરિયર, પૈસા, લગ્ન, સ્વાસ્થ્ય સાવચેતી, પરિવાર, સમય અને ઉપાયો પૂછો.',
        title: 'જીવનના પ્રશ્નો',
      },
      {
        body: 'કર્મ આધારિત ઉપાયો, પુરુષાર્થ સંતુલન, પંચાંગ અને દૈનિક માર્ગદર્શન આ વૈદિક દુનિયામાં રહે છે.',
        title: 'હોલિસ્ટિક સહારો',
      },
    ],
    hero: {
      body:
        'મુખ્ય વૈદિક વાચન માટે આ દુનિયા વાપરો: કુંડળી, ચાર્ટ્સ, દશા, ગોચર, ઉપાયો, સમય અને રિપોર્ટ માટે તૈયાર માર્ગદર્શન.',
      eyebrow: 'વૈદિક દુનિયા',
      title: 'તમારું મુખ્ય વેદિક પ્રેડિક્ટા સ્થાન.',
    },
    note: {
      body:
        'કૃષ્ણમૂર્તિ પદ્ધતિ, નાડી, અંક જ્યોતિષ અને સહીની પોતાની અલગ દુનિયા છે. વૈદિક પ્રેડિક્ટા મુખ્ય જ્યોતિષ વાચન પર કેન્દ્રિત રહે છે.',
      title: 'અલગ દુનિયા, શેર કરેલી કુંડળી',
    },
    report: {
      body:
        'વૈદિક વાચનને કુંડળી, કરિયર, લગ્ન, પૈસા, ઉપાયો અથવા સમય રિપોર્ટમાં બદલો.',
      cta: 'વેદિક રિપોર્ટ બનાવો',
      title: 'વેદિક રિપોર્ટ માર્ગ',
    },
  },
};

export default function VedicPredictaPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const { activeKundli } = useWebKundliLibrary();
  const copy = VEDIC_WORLD_COPY[language] ?? VEDIC_WORLD_COPY.en;
  const chatHref = buildPredictaChatHref({
    kundli: activeKundli,
    kundliId: activeKundli?.id,
    prompt:
      'Read my Vedic chart using D1, varga support, dasha, gochar, remedies, and current life timing.',
    school: 'PARASHARI',
    sourceScreen: 'Vedic Predicta',
  });

  return (
    <section className="dashboard-page">
      <div className="kp-page-stack">
        <section className="glass-panel school-panel-hero">
          <div>
            <p className="section-title">{copy.hero.eyebrow}</p>
            <h1 className="gradient-text">{copy.hero.title}</h1>
            <p>{copy.hero.body}</p>
          </div>
          <div className="world-hero-actions">
            <span className="school-badge premium">{copy.hero.eyebrow}</span>
            <Link className="button primary" href={chatHref}>
              {copy.actions.chat}
            </Link>
            <Link className="button secondary" href="/dashboard/report">
              {copy.report.cta}
            </Link>
          </div>
        </section>

        <section className="school-grid">
          {copy.cards.map(card => (
            <article className="glass-panel" key={card.title}>
              <p className="section-title">{card.title}</p>
              <p>{card.body}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel">
          <div className="section-heading-row">
            <div>
              <p className="section-title">{copy.note.title}</p>
              <p>{copy.note.body}</p>
            </div>
          </div>
          <div className="action-row">
            <Link className="button secondary" href="/dashboard/kundli">
              {copy.actions.create}
            </Link>
            <Link className="button secondary" href="/dashboard/charts">
              {copy.actions.charts}
            </Link>
            <Link className="button secondary" href="/dashboard/birth-time">
              {copy.actions.birthTime}
            </Link>
            <Link className="button secondary" href="/dashboard/report">
              {copy.actions.reports}
            </Link>
          </div>
        </section>

        <section className="glass-panel">
          <div className="section-heading-row">
            <div>
              <p className="section-title">{copy.report.title}</p>
              <h2>{copy.report.title}</h2>
              <p>{copy.report.body}</p>
            </div>
            <Link className="button primary" href="/dashboard/report">
              {copy.report.cta}
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}
