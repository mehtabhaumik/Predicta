'use client';

import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { Card } from '../../components/Card';
import { FounderSignature } from '../../components/FounderSignature';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { useLanguagePreference } from '../../lib/language-preference';

const safetyCopy: Record<
  SupportedLanguage,
  {
    checks: string[];
    commitments: Array<{ body: string; title: string }>;
    final: string;
    founderPromise: string;
    hero: {
      body: string;
      eyebrow: string;
      title: string;
    };
    policyCta: string;
    proof: {
      body: string;
      eyebrow: string;
      title: string;
    };
    standard: {
      body: string;
      eyebrow: string;
      title: string;
    };
    checksSection: {
      body: string;
      eyebrow: string;
      title: string;
    };
  }
> = {
  en: {
    checks: [
      'Self-harm and crisis handling',
      'Medical, legal, financial, behavior, abuse, and emergency safeguards',
      'Unsafe instructions and illegal requests',
      'Fear-based and fatalistic predictions',
      'Hindi, Gujarati, English, and mixed-language questions',
      'Clear separation between Regular, KP, and Nadi Predicta',
      'Easy reporting when an answer feels concerning',
      'A clear stop before unsafe changes reach users',
    ],
    checksSection: {
      body: 'Predicta is prepared for crisis language, serious decisions, mixed languages, school confusion, and answers that need a calmer tone.',
      eyebrow: 'WHAT WE PREPARE FOR',
      title: 'Predicta is prepared for risky real-world questions.',
    },
    commitments: [
      {
        body: 'Predicta answers serious astrology questions as reflection, not a replacement for qualified help or real-world judgment.',
        title: 'Guidance, not replacement',
      },
      {
        body: 'If danger appears, care comes first. Any astrology reflection stays gentle, protective, and non-fatalistic.',
        title: 'Crisis comes first',
      },
      {
        body: 'Finance, medical, legal, behavior, and family questions are allowed with clear limits.',
        title: 'Serious topics are allowed with safeguards',
      },
      {
        body: 'Predicta blocks harmful instructions, illegal actions, sexual content involving minors, violent guidance, and other unsafe requests.',
        title: 'Unsafe requests are blocked',
      },
      {
        body: 'No guaranteed death, divorce, illness, bankruptcy, or disaster predictions.',
        title: 'No fear-based predictions',
      },
      {
        body: 'Scary or overconfident answers are softened into calmer guidance.',
        title: 'Unsafe answers are softened',
      },
      {
        body: 'Predicta is prepared for messy language, mixed languages, and difficult real-life questions.',
        title: 'Prepared for difficult questions',
      },
      {
        body: 'Regular Predicta, KP Predicta, and Nadi Predicta are kept separate so each school speaks from its own tradition.',
        title: 'Different astrology schools stay separate',
      },
      {
        body: 'Nadi Predicta is not allowed to falsely claim it found or accessed a real ancient palm-leaf record.',
        title: 'Clear Nadi claims',
      },
      {
        body: 'Users can report a concerning answer from chat.',
        title: 'Users can report concerns',
      },
      {
        body: 'Reports avoid full chat text and exact birth details.',
        title: 'Privacy stays protected',
      },
      {
        body: 'Unsafe changes should not reach users.',
        title: 'Safety comes before public sharing',
      },
    ],
    final:
      'Use Predicta as a spiritual timing lens alongside qualified support for serious decisions.',
    founderPromise:
      'Predicta should stay useful, beautiful, and respectful during uncertain moments. Safety stays non-negotiable.',
    hero: {
      body: 'Ask serious Jyotish questions with calm guidance, chart proof, and clear limits.',
      eyebrow: 'Public safety promise',
      title: 'Predicta is built to guide, not scare.',
    },
    policyCta: 'Read Policies',
    proof: {
      body: 'Guidance should stay calm, responsible, and useful before it reaches anyone.',
      eyebrow: 'Public promise',
      title: 'Safety comes first',
    },
    standard: {
      body: 'Predicta gives guidance without fear, guarantees, or crisis overreach. The goal is care, not unnecessary denial.',
      eyebrow: 'OUR STANDARD',
      title: 'Safety is part of the product, not a footnote.',
    },
  },
  hi: {
    checks: [
      'स्व-हानि और संकट की भाषा',
      'चिकित्सा, कानूनी, आर्थिक, व्यवहार, शोषण और आपात सुरक्षा',
      'हानिकारक निर्देश और गैरकानूनी अनुरोध',
      'डराने वाली या भाग्यवादी भविष्यवाणियां',
      'हिन्दी, गुजराती, अंग्रेजी और मिली-जुली भाषा के सवाल',
      'Regular, KP और नाड़ी Predicta की साफ अलग पहचान',
      'चिंताजनक जवाब रिपोर्ट करने का आसान तरीका',
      'असुरक्षित बदलाव लोगों तक पहुंचने से पहले रोकना',
    ],
    checksSection: {
      body: 'Predicta संकट की भाषा, गंभीर फैसलों, मिली-जुली भाषा, ज्योतिष पद्धति की उलझन और शांत जवाबों के लिए तैयार रहती है.',
      eyebrow: 'हम किसके लिए तैयार हैं',
      title: 'Predicta वास्तविक जीवन के जोखिम भरे सवालों के लिए तैयार है.',
    },
    commitments: [
      {
        body: 'Predicta गंभीर ज्योतिष सवालों का जवाब चिंतन और मार्गदर्शन की तरह देती है, योग्य मदद या वास्तविक निर्णय की जगह नहीं.',
        title: 'मार्गदर्शन, विकल्प नहीं',
      },
      {
        body: 'अगर खतरा दिखता है, तो देखभाल पहले आती है. ज्योतिष मार्गदर्शन नरम, सुरक्षित और गैर-भाग्यवादी रहता है.',
        title: 'Crisis पहले',
      },
      {
        body: 'आर्थिक, चिकित्सा, कानूनी, व्यवहार और परिवार से जुड़े सवाल साफ सीमाओं के साथ पूछे जा सकते हैं.',
        title: 'गंभीर विषय सुरक्षा के साथ पूछे जा सकते हैं',
      },
      {
        body: 'Predicta हानिकारक निर्देश, गैरकानूनी काम, बच्चों से जुड़ी यौन सामग्री, हिंसक मार्गदर्शन और असुरक्षित अनुरोध रोकती है.',
        title: 'असुरक्षित अनुरोध रोके जाते हैं',
      },
      {
        body: 'मृत्यु, तलाक, बीमारी, दिवालियापन या आपदा जैसी पक्की डराने वाली भविष्यवाणियां नहीं.',
        title: 'डर-आधारित भविष्यवाणी नहीं',
      },
      {
        body: 'डराने वाले या बहुत ज्यादा निश्चित जवाबों को शांत मार्गदर्शन में बदला जाता है.',
        title: 'असुरक्षित जवाब शांत किए जाते हैं',
      },
      {
        body: 'Predicta अधूरी भाषा, मिली-जुली भाषा और कठिन वास्तविक जीवन के सवालों के लिए तैयार है.',
        title: 'कठिन सवालों के लिए तैयार',
      },
      {
        body: 'Regular Predicta, KP Predicta और नाड़ी Predicta अलग रखे जाते हैं ताकि हर पद्धति अपनी परंपरा से बोले.',
        title: 'ज्योतिष पद्धतियां अलग रहती हैं',
      },
      {
        body: 'नाड़ी Predicta यह दावा नहीं करेगी कि उसे कोई वास्तविक प्राचीन पांडुलिपि मिली या उसका प्रवेश मिला.',
        title: 'नाड़ी के बढ़ा-चढ़ाकर दावे नहीं',
      },
      {
        body: 'लोग चैट से चिंताजनक जवाब रिपोर्ट कर सकते हैं.',
        title: 'चिंता रिपोर्ट कर सकते हैं',
      },
      {
        body: 'रिपोर्ट में पूरी चैट और सटीक जन्म विवरण से बचा जाता है.',
        title: 'निजता सुरक्षित रहती है',
      },
      {
        body: 'असुरक्षित बदलाव लोगों तक नहीं पहुंचने चाहिए.',
        title: 'सार्वजनिक साझा करने से पहले सुरक्षा',
      },
    ],
    final:
      'गंभीर फैसलों में योग्य सहायता के साथ Predicta को आध्यात्मिक समय-दृष्टि की तरह उपयोग करें.',
    founderPromise:
      'अनिश्चित क्षणों में Predicta उपयोगी, सुंदर और सम्मानजनक रहनी चाहिए. सुरक्षा पर कोई समझौता नहीं.',
    hero: {
      body: 'शांत मार्गदर्शन, चार्ट प्रमाण और साफ सीमाओं के साथ गंभीर ज्योतिष सवाल पूछें.',
      eyebrow: 'सार्वजनिक सुरक्षा वादा',
      title: 'Predicta guide करने के लिए बनी है, डराने के लिए नहीं.',
    },
    policyCta: 'नीतियां पढ़ें',
    proof: {
      body: 'लोगों तक पहुंचने से पहले मार्गदर्शन शांत, जिम्मेदार और उपयोगी रहना चाहिए.',
      eyebrow: 'सार्वजनिक वादा',
      title: 'सुरक्षा पहले आती है',
    },
    standard: {
      body: 'Predicta डर, पक्की गारंटी या संकट में अति-दखल के बिना मार्गदर्शन देती है. लक्ष्य देखभाल है, अनावश्यक इनकार नहीं.',
      eyebrow: 'हमारा मानक',
      title: 'सुरक्षा उत्पाद का हिस्सा है, फुटनोट नहीं.',
    },
  },
  gu: {
    checks: [
      'સ્વ-હાનિ અને સંકટની ભાષા',
      'તબીબી, કાનૂની, આર્થિક, વર્તન, શોષણ અને આપત્તિ સુરક્ષા',
      'હાનિકારક સૂચનાઓ અને ગેરકાયદેસર વિનંતીઓ',
      'ડરાવતી અથવા ભાગ્યવાદી આગાહીઓ',
      'હિન્દી, ગુજરાતી, અંગ્રેજી અને મિશ્ર ભાષાના પ્રશ્નો',
      'Regular, KP અને નાડી Predicta વચ્ચે સ્પષ્ટ અલગતા',
      'ચિંતાજનક જવાબ રિપોર્ટ કરવાની સરળ રીત',
      'અસુરક્ષિત ફેરફારો લોકો સુધી પહોંચે તે પહેલાં રોકવા',
    ],
    checksSection: {
      body: 'Predicta સંકટની ભાષા, ગંભીર નિર્ણયો, મિશ્ર ભાષા, જ્યોતિષ પદ્ધતિની ગૂંચવણ અને શાંત જવાબો માટે તૈયાર રહે છે.',
      eyebrow: 'અમે કઈ બાબતો માટે તૈયાર છીએ',
      title: 'Predicta વાસ્તવિક જીવનના જોખમી પ્રશ્નો માટે તૈયાર છે.',
    },
    commitments: [
      {
        body: 'Predicta ગંભીર જ્યોતિષ પ્રશ્નોના જવાબ વિચાર અને માર્ગદર્શન તરીકે આપે છે, યોગ્ય મદદ અથવા વાસ્તવિક નિર્ણયના વિકલ્પ તરીકે નહીં.',
        title: 'માર્ગદર્શન, વિકલ્પ નહીં',
      },
      {
        body: 'જો જોખમ દેખાય, તો કાળજી પહેલા આવે છે. જ્યોતિષ માર્ગદર્શન નરમ, સુરક્ષિત અને ભાગ્યવાદી નહીં રહે છે.',
        title: 'સંકટ પહેલાં',
      },
      {
        body: 'આર્થિક, તબીબી, કાનૂની, વર્તન અને પરિવારના પ્રશ્નો સ્પષ્ટ મર્યાદા સાથે પૂછી શકાય છે.',
        title: 'ગંભીર વિષયો સુરક્ષા સાથે પૂછાઈ શકે છે',
      },
      {
        body: 'Predicta હાનિકારક સૂચનાઓ, ગેરકાયદેસર કામ, બાળકો સંબંધિત યૌન સામગ્રી, હિંસક માર્ગદર્શન અને અસુરક્ષિત વિનંતીઓ રોકે છે.',
        title: 'અસુરક્ષિત વિનંતીઓ રોકાય છે',
      },
      {
        body: 'મૃત્યુ, છૂટાછેડા, બીમારી, દેવાળું અથવા આપત્તિ જેવી પક્કી ડરાવતી આગાહીઓ નહીં.',
        title: 'ડર આધારિત આગાહી નહીં',
      },
      {
        body: 'ડરાવતા અથવા ખૂબ જ નિશ્ચિત જવાબોને શાંત માર્ગદર્શનમાં બદલી દેવામાં આવે છે.',
        title: 'અસુરક્ષિત જવાબ શાંત થાય છે',
      },
      {
        body: 'Predicta અધૂરી ભાષા, મિશ્ર ભાષા અને મુશ્કેલ વાસ્તવિક જીવનના પ્રશ્નો માટે તૈયાર છે.',
        title: 'મુશ્કેલ પ્રશ્નો માટે તૈયાર',
      },
      {
        body: 'Regular Predicta, KP Predicta અને નાડી Predicta અલગ રહે છે જેથી દરેક પદ્ધતિ પોતાની પરંપરા પ્રમાણે બોલે.',
        title: 'જ્યોતિષ પદ્ધતિઓ અલગ રહે છે',
      },
      {
        body: 'નાડી Predicta એવો દાવો નહીં કરે કે તેને કોઈ વાસ્તવિક પ્રાચીન પાંડુલિપિ મળી અથવા તેનો પ્રવેશ મળ્યો.',
        title: 'નાડીના વધારાના દાવા નહીં',
      },
      {
        body: 'લોકો ચેટમાંથી ચિંતાજનક જવાબ રિપોર્ટ કરી શકે છે.',
        title: 'ચિંતા રિપોર્ટ કરી શકાય છે',
      },
      {
        body: 'રિપોર્ટમાં સંપૂર્ણ ચેટ અને ચોક્કસ જન્મ વિગતો ટાળવામાં આવે છે.',
        title: 'ગોપનીયતા સુરક્ષિત રહે છે',
      },
      {
        body: 'અસુરક્ષિત ફેરફારો લોકો સુધી ન પહોંચવા જોઈએ.',
        title: 'જાહેર શેર કરતા પહેલાં સુરક્ષા',
      },
    ],
    final:
      'ગંભીર નિર્ણયોમાં યોગ્ય સહાય સાથે Predicta ને આધ્યાત્મિક સમય-દૃષ્ટિ તરીકે ઉપયોગ કરો.',
    founderPromise:
      'અનિશ્ચિત ક્ષણોમાં Predicta ઉપયોગી, સુંદર અને સન્માનપૂર્ણ રહેવી જોઈએ. સુરક્ષામાં કોઈ સમજૂતી નથી.',
    hero: {
      body: 'શાંત માર્ગદર્શન, ચાર્ટ પુરાવો અને સ્પષ્ટ મર્યાદા સાથે ગંભીર જ્યોતિષ પ્રશ્નો પૂછો.',
      eyebrow: 'જાહેર સુરક્ષા વચન',
      title: 'Predicta guide કરવા માટે છે, ડરાવવા માટે નહીં.',
    },
    policyCta: 'નીતિઓ વાંચો',
    proof: {
      body: 'લોકો સુધી પહોંચે તે પહેલાં માર્ગદર્શન શાંત, જવાબદાર અને ઉપયોગી રહેવું જોઈએ.',
      eyebrow: 'જાહેર વચન',
      title: 'સુરક્ષા પહેલાં આવે છે',
    },
    standard: {
      body: 'Predicta ડર, પક્કી ખાતરી અથવા સંકટમાં અતિ-દખલ વિના માર્ગદર્શન આપે છે. લક્ષ્ય કાળજી છે, અનાવશ્યક ઇનકાર નહીં.',
      eyebrow: 'અમારો ધોરણ',
      title: 'સુરક્ષા ઉત્પાદનનો ભાગ છે, ફૂટનોટ નહીં.',
    },
  },
};

export default function SafetyPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = safetyCopy[language] ?? safetyCopy.en;

  return (
    <>
      <WebHeader />
      <main className="safety-page">
        <div className="page-heading compact safety-heading">
          <StatusPill label={copy.hero.eyebrow} tone="premium" />
          <h1 className="gradient-text">{copy.hero.title}</h1>
          <p>{copy.hero.body}</p>
        </div>

        <section className="safety-hero glass-panel">
          <div>
            <div className="section-title">{copy.standard.eyebrow}</div>
            <h2>{copy.standard.title}</h2>
            <p>{copy.standard.body}</p>
          </div>
          <div className="safety-proof-card">
            <span>{copy.proof.eyebrow}</span>
            <strong>{copy.proof.title}</strong>
            <p>{copy.proof.body}</p>
          </div>
        </section>

        <section className="safety-commitments">
          {copy.commitments.map((item, index) => (
            <Card className="safety-commitment-card" key={item.title}>
              <div className="card-content">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h2>{item.title}</h2>
                <p>{item.body}</p>
              </div>
            </Card>
          ))}
        </section>

        <section className="safety-checks glass-panel">
          <div>
            <div className="section-title">{copy.checksSection.eyebrow}</div>
            <h2>{copy.checksSection.title}</h2>
            <p>{copy.checksSection.body}</p>
          </div>
          <ul>
            {copy.checks.map(check => (
              <li key={check}>{check}</li>
            ))}
          </ul>
        </section>

        <section className="founder-promise">
          <div className="section-title">FOUNDER PROMISE</div>
          <p>{copy.founderPromise}</p>
          <FounderSignature />
        </section>

        <div className="legal-footer-note">
          <p>{copy.final}</p>
          <Link className="button secondary" href="/legal">
            {copy.policyCta}
          </Link>
        </div>
      </main>
      <WebFooter />
    </>
  );
}
