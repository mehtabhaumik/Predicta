'use client';

import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { FinalCTASection } from '../components/FinalCTASection';
import { HeroSection } from '../components/HeroSection';
import { LandingIntroOverlay } from '../components/LandingIntroOverlay';
import { PremiumSectionWrapper } from '../components/PremiumSectionWrapper';
import { PricingTeaser } from '../components/PricingTeaser';
import { TestimonialTrustLoop } from '../components/TestimonialTrustLoop';
import { WebGrowthAdvantage } from '../components/WebGrowthAdvantage';
import { WebFooter } from '../components/WebFooter';
import { WebHeader } from '../components/WebHeader';
import { useLanguagePreference } from '../lib/language-preference';

export default function LandingPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = landingCopy[language] ?? landingCopy.en;

  return (
    <>
      <LandingIntroOverlay />
      <WebHeader />
      <main className="landing-main">
        <HeroSection />

        <PremiumSectionWrapper
          eyebrow={copy.capabilityEyebrow}
          intro={copy.capabilityIntro}
          title={copy.capabilityTitle}
          variant="wide"
        >
          <div className="capability-grid">
            {copy.capabilities.map(item => (
              <article className="soft-panel" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </PremiumSectionWrapper>

        <PremiumSectionWrapper
          eyebrow={copy.intelligenceEyebrow}
          id="intelligence"
          intro={copy.intelligenceIntro}
          title={copy.intelligenceTitle}
          variant="split"
        >
          <div className="intelligence-panel glass-panel">
            <div>
              <h3>{copy.intelligencePanelTitle}</h3>
              <p>{copy.intelligencePanelBody}</p>
            </div>
            <ul>
              {copy.intelligenceItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </PremiumSectionWrapper>

        <PremiumSectionWrapper
          eyebrow={copy.reportsEyebrow}
          id="reports"
          intro={copy.reportsIntro}
          title={copy.reportsTitle}
          variant="wide"
        >
          <div className="report-preview">
            <div className="report-cover glass-panel">
              <span>PREDICTA DOSSIER</span>
              <h3>{copy.reportCoverTitle}</h3>
              <p>{copy.reportCoverBody}</p>
            </div>
            <div className="report-copy">
              <h3>{copy.reportCopyTitle}</h3>
              <p>{copy.reportCopyBody}</p>
              <Link className="button secondary" href="/dashboard/report">
                {copy.previewReport}
              </Link>
            </div>
          </div>
        </PremiumSectionWrapper>

        <TestimonialTrustLoop />

        <WebGrowthAdvantage />

        <PremiumSectionWrapper
          eyebrow={copy.plansEyebrow}
          intro={copy.plansIntro}
          title={copy.plansTitle}
        >
          <PricingTeaser />
        </PremiumSectionWrapper>

        <FinalCTASection />
      </main>
      <WebFooter />
    </>
  );
}

const landingCopy: Record<
  SupportedLanguage,
  {
    capabilities: Array<{ body: string; title: string }>;
    capabilityEyebrow: string;
    capabilityIntro: string;
    capabilityTitle: string;
    intelligenceEyebrow: string;
    intelligenceIntro: string;
    intelligenceItems: string[];
    intelligencePanelBody: string;
    intelligencePanelTitle: string;
    intelligenceTitle: string;
    plansEyebrow: string;
    plansIntro: string;
    plansTitle: string;
    previewReport: string;
    reportCopyBody: string;
    reportCopyTitle: string;
    reportCoverBody: string;
    reportCoverTitle: string;
    reportsEyebrow: string;
    reportsIntro: string;
    reportsTitle: string;
  }
> = {
  en: {
    capabilities: [
      {
        body: 'Create Kundlis and keep the reading anchored to real chart proof.',
        title: 'Kundli creation',
      },
      {
        body: 'Move from D1 to D9, D10, dasha, yogas, karma, and remedies.',
        title: 'Holistic interpretation',
      },
      {
        body: 'Ask from a chart, report, or saved profile.',
        title: 'Predicta chat',
      },
      {
        body: 'Create polished free previews and deeper premium reports.',
        title: 'Report depth',
      },
    ],
    capabilityEyebrow: 'What Predicta does',
    capabilityIntro: 'Create, read, save, and discuss a Kundli through a holistic astrology lens.',
    capabilityTitle: 'A complete astrology experience with room to breathe.',
    intelligenceEyebrow: 'Core intelligence',
    intelligenceIntro: 'Predicta keeps advanced Vedic depth available while explaining only what helps.',
    intelligenceItems: [
      'Holistic astrology synthesis',
      'Divisional chart awareness',
      'Vimshottari dasha timing',
      'Karma-based remedy paths',
      'Yoga and Ashtakavarga summaries',
    ],
    intelligencePanelBody:
      'Predicta reads dasha, placements, chart areas, Panchang, Purushartha, and remedy context without making the reading heavy.',
    intelligencePanelTitle: 'Professional chart awareness, presented clearly.',
    intelligenceTitle: 'Depth without noise.',
    plansEyebrow: 'Plans',
    plansIntro: 'Start free, try a Day Pass, or move into Premium when deeper report and guidance limits matter.',
    plansTitle: 'Premium access without pressure.',
    previewReport: 'Preview Report',
    reportCopyBody:
      'Summaries, predictions, and guidance stay polished in both short and deeper reports.',
    reportCopyTitle: 'Designed to feel personal and calm.',
    reportCoverBody:
      'Free and Premium reports share the same visual quality. Premium adds depth, not dignity.',
    reportCoverTitle: 'Birth Details · D1 · D9 · D10 · Dasha · Guidance',
    reportsEyebrow: 'Premium reports',
    reportsIntro: 'Reports should feel personal, polished, and easy to read.',
    reportsTitle: 'Share-worthy reports, even in free mode.',
  },
  hi: {
    capabilities: [
      {
        body: 'कुंडली बनाएं और reading को असली चार्ट प्रमाण से जोड़े रखें.',
        title: 'कुंडली बनाना',
      },
      {
        body: 'D1 से D9, D10, दशा, योग, कर्म और उपाय तक जाएं.',
        title: 'होलिस्टिक समझ',
      },
      {
        body: 'चार्ट, रिपोर्ट या सेव profile से सीधे पूछें.',
        title: 'Predicta चैट',
      },
      {
        body: 'सुंदर मुफ्त प्रीव्यू और गहरी प्रीमियम रिपोर्ट बनाएं.',
        title: 'रिपोर्ट गहराई',
      },
    ],
    capabilityEyebrow: 'Predicta क्या करती है',
    capabilityIntro: 'होलिस्टिक ज्योतिष से कुंडली बनाएं, पढ़ें, सेव करें और समझें.',
    capabilityTitle: 'एक पूरा ज्योतिष अनुभव, बिना भ्रम.',
    intelligenceEyebrow: 'मुख्य बुद्धि',
    intelligenceIntro: 'Predicta गहरी वैदिक जानकारी रखती है, पर सिर्फ काम की बात समझाती है.',
    intelligenceItems: [
      'होलिस्टिक ज्योतिष synthesis',
      'विभाजन चार्ट की समझ',
      'विंशोत्तरी दशा timing',
      'कर्म-आधारित उपाय मार्ग',
      'योग और अष्टकवर्ग सारांश',
    ],
    intelligencePanelBody:
      'Predicta दशा, ग्रह स्थिति, चार्ट क्षेत्र, पंचांग, पुरुषार्थ और उपाय संदर्भ पढ़ती है, लेकिन reading भारी नहीं बनाती.',
    intelligencePanelTitle: 'पेशेवर चार्ट समझ, साफ भाषा में.',
    intelligenceTitle: 'गहराई, शोर नहीं.',
    plansEyebrow: 'प्लान',
    plansIntro: 'मुफ्त शुरू करें, Day Pass आजमाएं, या गहरी रिपोर्ट और guidance limit चाहिए तो प्रीमियम लें.',
    plansTitle: 'बिना दबाव प्रीमियम access.',
    previewReport: 'रिपोर्ट प्रीव्यू करें',
    reportCopyBody:
      'सारांश, prediction और guidance छोटी और गहरी दोनों रिपोर्ट में सुंदर रहती है.',
    reportCopyTitle: 'व्यक्तिगत और शांत अनुभव के लिए बनाया गया.',
    reportCoverBody:
      'मुफ्त और प्रीमियम रिपोर्ट की visual quality समान रहती है. प्रीमियम गरिमा नहीं, गहराई जोड़ता है.',
    reportCoverTitle: 'जन्म विवरण · D1 · D9 · D10 · दशा · मार्गदर्शन',
    reportsEyebrow: 'प्रीमियम रिपोर्ट',
    reportsIntro: 'रिपोर्ट व्यक्तिगत, सुंदर और पढ़ने में आसान लगनी चाहिए.',
    reportsTitle: 'मुफ्त mode में भी share-worthy रिपोर्ट.',
  },
  gu: {
    capabilities: [
      {
        body: 'કુંડળી બનાવો અને reading ને સાચા ચાર્ટ પુરાવા સાથે જોડેલી રાખો.',
        title: 'કુંડળી બનાવવી',
      },
      {
        body: 'D1 થી D9, D10, દશા, યોગ, કર્મ અને ઉપાયો સુધી જાઓ.',
        title: 'હોલિસ્ટિક સમજ',
      },
      {
        body: 'ચાર્ટ, રિપોર્ટ અથવા સેવ profile પરથી સીધું પૂછો.',
        title: 'Predicta ચેટ',
      },
      {
        body: 'સુંદર મફત પ્રીવ્યૂ અને ઊંડા પ્રીમિયમ રિપોર્ટ્સ બનાવો.',
        title: 'રિપોર્ટ ઊંડાઈ',
      },
    ],
    capabilityEyebrow: 'Predicta શું કરે છે',
    capabilityIntro: 'હોલિસ્ટિક જ્યોતિષથી કુંડળી બનાવો, વાંચો, સેવ કરો અને સમજો.',
    capabilityTitle: 'સંપૂર્ણ જ્યોતિષ અનુભવ, ગૂંચવણ વગર.',
    intelligenceEyebrow: 'મુખ્ય બુદ્ધિ',
    intelligenceIntro: 'Predicta ઊંડી વૈદિક માહિતી રાખે છે, પણ કામની વાતો જ સમજાવે છે.',
    intelligenceItems: [
      'હોલિસ્ટિક જ્યોતિષ synthesis',
      'વિભાગીય ચાર્ટની સમજ',
      'વિંશોત્તરી દશા timing',
      'કર્મ આધારિત ઉપાય માર્ગ',
      'યોગ અને અષ્ટકવર્ગ સારાંશ',
    ],
    intelligencePanelBody:
      'Predicta દશા, ગ્રહ સ્થિતિ, ચાર્ટ ક્ષેત્ર, પંચાંગ, પુરુષાર્થ અને ઉપાય સંદર્ભ વાંચે છે, પણ reading ભારે નથી બનાવતી.',
    intelligencePanelTitle: 'પેશાદાર ચાર્ટ સમજ, સરળ ભાષામાં.',
    intelligenceTitle: 'ઊંડાઈ, અવાજ નહીં.',
    plansEyebrow: 'પ્લાન',
    plansIntro: 'મફત શરૂ કરો, Day Pass અજમાવો, અથવા ઊંડી રિપોર્ટ અને guidance limit જોઈએ ત્યારે પ્રીમિયમ લો.',
    plansTitle: 'દબાણ વગર પ્રીમિયમ access.',
    previewReport: 'રિપોર્ટ પ્રીવ્યૂ કરો',
    reportCopyBody:
      'સારાંશ, prediction અને guidance ટૂંકા અને ઊંડા બંને રિપોર્ટ્સમાં સુંદર રહે છે.',
    reportCopyTitle: 'વ્યક્તિગત અને શાંત અનુભવ માટે બનાવ્યું.',
    reportCoverBody:
      'મફત અને પ્રીમિયમ રિપોર્ટ્સની visual quality સમાન રહે છે. પ્રીમિયમ ગૌરવ નહીં, ઊંડાઈ ઉમેરે છે.',
    reportCoverTitle: 'જન્મ વિગતો · D1 · D9 · D10 · દશા · માર્ગદર્શન',
    reportsEyebrow: 'પ્રીમિયમ રિપોર્ટ્સ',
    reportsIntro: 'રિપોર્ટ્સ વ્યક્તિગત, સુંદર અને વાંચવામાં સરળ લાગવી જોઈએ.',
    reportsTitle: 'મફત mode માં પણ share-worthy રિપોર્ટ્સ.',
  },
};
