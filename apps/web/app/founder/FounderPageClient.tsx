'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { Card } from '../../components/Card';
import { FounderSignature } from '../../components/FounderSignature';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { useLanguagePreference } from '../../lib/language-preference';

const founderCopy: Record<
  SupportedLanguage,
  {
    actions: {
      dashboard: string;
      safety: string;
      start: string;
    };
    hero: {
      body: string;
      eyebrow: string;
      title: string;
    };
    letter: {
      body: string[];
      eyebrow: string;
      title: string;
    };
    portrait: string;
    principles: Array<{ copy: string; title: string }>;
    principlesHeader: {
      eyebrow: string;
      title: string;
    };
    vision: {
      eyebrow: string;
      points: string[];
      title: string;
    };
    final: string;
  }
> = {
  en: {
    actions: {
      dashboard: 'Enter Predicta',
      safety: 'Read Safety Promise',
      start: 'Begin with Predicta',
    },
    final:
      'Predicta is for people who want spiritual guidance to feel useful, safe, premium, and respectful.',
    hero: {
      body: 'I built Predicta to make Vedic astrology precise, private, calm, and useful.',
      eyebrow: 'Founder vision',
      title: 'Building Predicta for people who want clarity without noise.',
    },
    letter: {
      body: [
        'Deep chart wisdom should not feel confusing, intimidating, or cheaply packaged. A Kundli carries personal context and deserves a thoughtful experience.',
        'The goal is to honor tradition with a calmer voice, clearer structure, and confident chart exploration.',
        'Predicta is chart-backed, safety-aware, mobile-first, and careful with every answer.',
      ],
      eyebrow: 'Why Predicta exists',
      title:
        'Astrology should feel grounded enough to trust and simple enough to use.',
    },
    portrait:
      'Predicta should feel intelligent, polished, private, and human. That standard applies everywhere.',
    principles: [
      {
        copy: 'Birth details, saved Kundlis, and personal guidance must be handled with restraint, clarity, and respect.',
        title: 'Privacy by temperament',
      },
      {
        copy: 'Predicta should explain chart patterns calmly. It should not sell fear, certainty, or dependency.',
        title: 'Guidance without pressure',
      },
      {
        copy: 'Regular Predicta, KP Predicta, and Nadi Predicta should stay clear in method, purpose, and safety boundaries.',
        title: 'Clear astrology schools',
      },
      {
        copy: 'The product must be easy enough for a new user while keeping serious Jyotish depth in the background.',
        title: 'Depth without confusion',
      },
    ],
    principlesHeader: {
      eyebrow: 'Product principles',
      title: 'Calm technology for a deeply personal subject.',
    },
    vision: {
      eyebrow: 'The vision',
      points: [
        'Respect Vedic tradition while using modern engineering to make it easier to understand.',
        'Build a calmer alternative to noisy astrology apps, with premium design and clear user control.',
        'Keep public safety visible and protected before Predicta reaches more people.',
        'Grow across mobile and web without losing the same personal, careful product signature.',
      ],
      title: 'A trusted astrology companion across mobile and web.',
    },
  },
  hi: {
    actions: {
      dashboard: 'प्रेडिक्टा खोलें',
      safety: 'सुरक्षा वादा पढ़ें',
      start: 'प्रेडिक्टा से शुरू करें',
    },
    final:
      'प्रेडिक्टा उन लोगों के लिए है जो आध्यात्मिक मार्गदर्शन को उपयोगी, सुरक्षित, प्रीमियम और सम्मानजनक महसूस करना चाहते हैं.',
    hero: {
      body: 'मैंने प्रेडिक्टा इसलिए बनाया कि वैदिक ज्योतिष सटीक, निजी, शांत और उपयोगी लगे.',
      eyebrow: 'संस्थापक दृष्टि',
      title: 'प्रेडिक्टा उन लोगों के लिए बन रहा है जो शोर के बिना स्पष्टता चाहते हैं.',
    },
    letter: {
      body: [
        'गहरी चार्ट बुद्धि भ्रमित, डराने वाली या सस्ती पैकेजिंग जैसी नहीं लगनी चाहिए. कुंडली निजी संदर्भ रखती है और विचारशील अनुभव की हकदार है.',
        'लक्ष्य परंपरा को शांत आवाज, साफ संरचना और भरोसेमंद चार्ट खोज के साथ सम्मान देना है.',
        'प्रेडिक्टा चार्ट-आधारित, सुरक्षा-सचेत, मोबाइल-अनुकूल और हर जवाब में सावधान है.',
      ],
      eyebrow: 'प्रेडिक्टा क्यों मौजूद है',
      title:
        'ज्योतिष भरोसे लायक, जमीन से जुड़ा और उपयोग में सरल लगना चाहिए.',
    },
    portrait:
      'प्रेडिक्टा बुद्धिमान, सुंदर, निजी और मानवीय लगनी चाहिए. यही मानक हर जगह लागू है.',
    principles: [
      {
        copy: 'जन्म विवरण, सेव कुंडलियां और निजी मार्गदर्शन संयम, स्पष्टता और सम्मान के साथ संभलना चाहिए.',
        title: 'स्वभाव से निजी',
      },
      {
        copy: 'प्रेडिक्टा चार्ट पैटर्न शांत तरीके से समझाए. डर, पक्की गारंटी या निर्भरता न बेचे.',
        title: 'बिना दबाव मार्गदर्शन',
      },
      {
        copy: 'वैदिक प्रेडिक्टा, कृष्णमूर्ति पद्धति प्रेडिक्टा और नाड़ी प्रेडिक्टा विधि, उद्देश्य और सुरक्षा सीमाओं में साफ रहें.',
        title: 'साफ ज्योतिष पद्धतियां',
      },
      {
        copy: 'उत्पाद नए उपयोगकर्ता के लिए आसान रहे, और गंभीर ज्योतिष गहराई भीतर बनी रहे.',
        title: 'बिना भ्रम गहराई',
      },
    ],
    principlesHeader: {
      eyebrow: 'उत्पाद सिद्धांत',
      title: 'एक गहरे निजी विषय के लिए शांत तकनीक.',
    },
    vision: {
      eyebrow: 'दृष्टि',
      points: [
        'वैदिक परंपरा का सम्मान करते हुए आधुनिक तकनीक से उसे समझना आसान बनाना.',
        'शोर भरे ज्योतिष ऐप्स का शांत विकल्प बनाना, प्रीमियम डिजाइन और साफ उपयोगकर्ता नियंत्रण के साथ.',
        'प्रेडिक्टा ज्यादा लोगों तक पहुंचे उससे पहले सार्वजनिक सुरक्षा साफ और सुरक्षित रखना.',
        'मोबाइल और वेब पर वही निजी, सावधान उत्पाद पहचान बनाए रखना.',
      ],
      title: 'मोबाइल और वेब पर भरोसेमंद ज्योतिष साथी.',
    },
  },
  gu: {
    actions: {
      dashboard: 'પ્રેડિક્ટા ખોલો',
      safety: 'સુરક્ષા વચન વાંચો',
      start: 'પ્રેડિક્ટા થી શરૂ કરો',
    },
    final:
      'પ્રેડિક્ટા એવા લોકો માટે છે જેમને આધ્યાત્મિક માર્ગદર્શન ઉપયોગી, સુરક્ષિત, પ્રીમિયમ અને સન્માનજનક લાગવું જોઈએ.',
    hero: {
      body: 'મેં પ્રેડિક્ટા એ માટે બનાવ્યું કે વૈદિક જ્યોતિષ ચોક્કસ, ખાનગી, શાંત અને ઉપયોગી લાગે.',
      eyebrow: 'સ્થાપક દૃષ્ટિ',
      title: 'પ્રેડિક્ટા એવા લોકો માટે બની રહ્યું છે જેમને અવાજ વગર સ્પષ્ટતા જોઈએ છે.',
    },
    letter: {
      body: [
        'ઊંડી ચાર્ટ બુદ્ધિ ગૂંચવતી, ડરાવતી અથવા સસ્તી પેકેજિંગ જેવી ન લાગવી જોઈએ. કુંડળી ખાનગી સંદર્ભ ધરાવે છે અને વિચારશીલ અનુભવને પાત્ર છે.',
        'લક્ષ્ય પરંપરાને શાંત અવાજ, સ્પષ્ટ રચના અને વિશ્વાસભર્યા ચાર્ટ અન્વેષણ સાથે સન્માન કરવાનો છે.',
        'પ્રેડિક્ટા ચાર્ટ-આધારિત, સુરક્ષા-સચેત, મોબાઇલ-અનુકૂળ અને દરેક જવાબમાં કાળજીપૂર્વક છે.',
      ],
      eyebrow: 'પ્રેડિક્ટા કેમ છે',
      title:
        'જ્યોતિષ ભરોસાપાત્ર, જમીનથી જોડાયેલ અને ઉપયોગમાં સરળ લાગવું જોઈએ.',
    },
    portrait:
      'પ્રેડિક્ટા બુદ્ધિશાળી, સુંદર, ખાનગી અને માનવીય લાગવી જોઈએ. આ ધોરણ દરેક જગ્યાએ લાગુ પડે છે.',
    principles: [
      {
        copy: 'જન્મ વિગતો, સેવ કુંડળીઓ અને ખાનગી માર્ગદર્શન સંયમ, સ્પષ્ટતા અને સન્માન સાથે સંભાળવા જોઈએ.',
        title: 'સ્વભાવથી ખાનગી',
      },
      {
        copy: 'પ્રેડિક્ટા ચાર્ટ પેટર્ન શાંત રીતે સમજાવે. ડર, પાક્કી ગેરંટી અથવા નિર્ભરતા ન વેચે.',
        title: 'દબાણ વગર માર્ગદર્શન',
      },
      {
        copy: 'વૈદિક પ્રેડિક્ટા, કૃષ્ણમૂર્તિ પદ્ધતિ પ્રેડિક્ટા અને નાડી પ્રેડિક્ટા રીત, હેતુ અને સુરક્ષા મર્યાદામાં સ્પષ્ટ રહે.',
        title: 'સ્પષ્ટ જ્યોતિષ પદ્ધતિઓ',
      },
      {
        copy: 'ઉત્પાદન નવા ઉપયોગકર્તા માટે સરળ રહે, અને ગંભીર જ્યોતિષ ઊંડાઈ અંદર જળવાય.',
        title: 'ગૂંચવણ વગર ઊંડાઈ',
      },
    ],
    principlesHeader: {
      eyebrow: 'ઉત્પાદન સિદ્ધાંતો',
      title: 'ઊંડા ખાનગી વિષય માટે શાંત તકનીક.',
    },
    vision: {
      eyebrow: 'દૃષ્ટિ',
      points: [
        'વૈદિક પરંપરાનું સન્માન કરીને આધુનિક તકનીકથી સમજવું સરળ બનાવવું.',
        'અવાજભર્યા જ્યોતિષ એપ્સનો શાંત વિકલ્પ બનાવવો, પ્રીમિયમ ડિઝાઇન અને સ્પષ્ટ ઉપયોગકર્તા નિયંત્રણ સાથે.',
        'પ્રેડિક્ટા વધારે લોકો સુધી પહોંચે તે પહેલાં જાહેર સુરક્ષા સ્પષ્ટ અને સુરક્ષિત રાખવી.',
        'મોબાઇલ અને વેબ પર એ જ ખાનગી, કાળજીપૂર્વક ઉત્પાદન ઓળખ જાળવવી.',
      ],
      title: 'મોબાઇલ અને વેબ પર ભરોસાપાત્ર જ્યોતિષ સાથી.',
    },
  },
};

export function FounderPageClient(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = founderCopy[language] ?? founderCopy.en;

  return (
    <>
      <WebHeader />
      <main className="founder-page">
        <section className="founder-hero" aria-labelledby="founder-title">
          <div className="founder-copy">
            <StatusPill label={copy.hero.eyebrow} tone="premium" />
            <h1 id="founder-title" className="gradient-text">
              {copy.hero.title}
            </h1>
            <p className="founder-lede">{copy.hero.body}</p>
            <div className="founder-actions">
              <Link className="button" href="/dashboard">
                {copy.actions.dashboard}
              </Link>
              <Link className="button secondary" href="/safety">
                {copy.actions.safety}
              </Link>
            </div>
          </div>

          <div className="founder-portrait-card glass-panel">
            <div className="founder-portrait-frame">
              <Image
                alt="Bhaumik Mehta"
                fill
                priority
                sizes="(max-width: 820px) 78vw, 420px"
                src="/founder-bhaumik-mehta.png"
              />
            </div>
            <div className="founder-portrait-copy">
              <p>{copy.portrait}</p>
            </div>
          </div>
        </section>

        <section className="founder-section founder-letter glass-panel">
          <div className="founder-letter-grid">
            <div className="founder-letter-heading">
              <span className="section-title">{copy.letter.eyebrow}</span>
              <h2>{copy.letter.title}</h2>
            </div>
            <div className="founder-letter-copy">
              {copy.letter.body.map(paragraph => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="founder-section founder-principles">
          <div className="founder-section-heading">
            <span className="section-title">
              {copy.principlesHeader.eyebrow}
            </span>
            <h2>{copy.principlesHeader.title}</h2>
          </div>
          <div className="founder-principle-grid">
            {copy.principles.map(principle => (
              <Card className="founder-principle" key={principle.title}>
                <div className="card-content">
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="founder-section founder-vision glass-panel">
          <div>
            <span className="section-title">{copy.vision.eyebrow}</span>
            <h2>{copy.vision.title}</h2>
          </div>
          <div className="founder-vision-list">
            {copy.vision.points.map(point => (
              <div className="founder-vision-item" key={point}>
                <span aria-hidden="true" />
                <p>{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="founder-final">
          <p>{copy.final}</p>
          <FounderSignature />
          <Link className="button" href="/dashboard">
            {copy.actions.start}
          </Link>
        </section>
      </main>
      <WebFooter />
    </>
  );
}
