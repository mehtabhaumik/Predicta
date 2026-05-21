'use client';

import {
  PREMIUM_FEATURE_STORY,
  getOneTimeProducts,
  getPricingPlans,
} from '@pridicta/config/pricing';
import type { SupportedLanguage } from '@pridicta/types';
import Link from 'next/link';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { useLanguagePreference } from '../../lib/language-preference';

export default function PricingPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = pricingPageCopy[language] ?? pricingPageCopy.en;
  const plans = getPricingPlans();
  const products = getOneTimeProducts();

  return (
    <>
      <WebHeader />
      <main className="pricing-page">
        <div className="page-heading pricing-heading">
          <StatusPill label={copy.pill} tone="quiet" />
          <h1 className="gradient-text">{copy.title}</h1>
          <p>{copy.body}</p>
        </div>

        <section className="pricing-difference-panel glass-panel">
          <div>
            <div className="section-title">{copy.choiceEyebrow}</div>
            <h2>{copy.choiceTitle}</h2>
          </div>
          <div className="pricing-difference-grid">
            {copy.choiceCards.map(card => (
              <article key={card.title}>
                <span>{card.label}</span>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <Link className="button secondary" href={card.href}>
                  {card.cta}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <div className="pricing-grid" id="subscriptions">
          {plans.map(plan => (
          <Card
              className={plan.recommended ? 'glass-panel plan-card recommended' : 'plan-card'}
              key={plan.id}
            >
              <div className="card-content spacious">
                <div className="section-title">
                  {getLocalizedPlanCopy(plan.id, language).label}
                </div>
                <h2>{plan.displayPrice}</h2>
                <p>{getLocalizedPlanCopy(plan.id, language).billingCopy}</p>
                {plan.monthlyEquivalent ? (
                  <span>
                    {plan.monthlyEquivalent}{' '}
                    {getLocalizedPlanCopy(plan.id, language).monthlyEquivalent ?? ''}
                  </span>
                ) : null}
                {plan.badge ? (
                  <StatusPill
                    label={getLocalizedPlanCopy(plan.id, language).badge ?? plan.badge}
                    tone="premium"
                  />
                ) : null}
                <ul className="pricing-feature-list">
                  {copy.planFeatures.map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link
                  className="button"
                  href={`/checkout?productId=${encodeURIComponent(plan.productId)}`}
                >
                  {copy.selectPrefix} {getLocalizedPlanCopy(plan.id, language).label}
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <section className="one-time-section" id="one-time">
          <div>
            <h2>{copy.oneTimeTitle}</h2>
            <p>{copy.oneTimeBody}</p>
          </div>
          <div className="one-time-grid">
            {products.map(product => (
              <Card key={product.id}>
                <div className="card-content">
                  <div className="section-title">
                    {getLocalizedOneTimeProductCopy(product.id, language).label}
                  </div>
                  <h3>{product.displayPrice}</h3>
                  <p>{getLocalizedOneTimeProductCopy(product.id, language).description}</p>
                  <Link
                    className="button secondary"
                    href={`/checkout?productId=${encodeURIComponent(product.productId)}`}
                  >
                    {copy.selectPrefix} {getLocalizedOneTimeProductCopy(product.id, language).label}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="pricing-difference-panel glass-panel">
          <div>
            <div className="section-title">{copy.differenceEyebrow}</div>
            <h2>{copy.differenceTitle}</h2>
          </div>
          <div className="pricing-difference-grid">
            {copy.differenceCards.map(card => (
              <article key={card.title}>
                <span>{card.title}</span>
                <p>{card.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="premium-feature-story glass-panel">
          <div>
            <div className="section-title">{copy.storyEyebrow}</div>
            <h2>{copy.storyTitle}</h2>
            <p>{copy.storyBody}</p>
          </div>
          <div className="premium-feature-grid">
            {getLocalizedPremiumFeatureStory(language).map(feature => (
              <article key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="pricing-legal-note">
          <h2>{copy.legalTitle}</h2>
          <p>{copy.legalBody}</p>
          <Link className="button secondary" href="/legal">
            {copy.readPolicies}
          </Link>
        </section>
        <Link className="button secondary" href="/">
          {copy.back}
        </Link>
      </main>
      <WebFooter />
    </>
  );
}

const pricingPageCopy: Record<
  SupportedLanguage,
  {
    back: string;
    body: string;
    choiceCards: Array<{
      body: string;
      cta: string;
      href: string;
      label: string;
      title: string;
    }>;
    choiceEyebrow: string;
    choiceTitle: string;
    differenceCards: Array<{ body: string; title: string }>;
    differenceEyebrow: string;
    differenceTitle: string;
    legalBody: string;
    legalTitle: string;
    oneTimeBody: string;
    oneTimeTitle: string;
    pill: string;
    planFeatures: string[];
    readPolicies: string;
    selectPrefix: string;
    storyBody: string;
    storyEyebrow: string;
    storyTitle: string;
    title: string;
  }
> = {
  en: {
    back: 'Back to Predicta',
    body: 'Choose the paid option only when Predicta has already helped and you want clearer timing, a prepared report, family context, or more guided depth.',
    choiceCards: [
      {
        body: 'Best when you want ongoing Predicta guidance, monthly timing, remedies, saved chats, and family profiles.',
        cta: 'See plans',
        href: '#subscriptions',
        label: 'Subscription',
        title: 'I want guidance every month',
      },
      {
        body: 'Best when you want one polished Kundli, career, wealth, marriage, Sade Sati, or compatibility PDF.',
        cta: 'Choose one report',
        href: '#one-time',
        label: 'One report',
        title: 'I need one answer prepared well',
      },
      {
        body: 'Best when friends or family want to test Premium depth for one day before committing.',
        cta: 'Try Day Pass',
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: '24-hour trial',
        title: 'I want to try everything today',
      },
    ],
    choiceEyebrow: 'Choose by need',
    choiceTitle: 'Do not buy a plan. Pick the outcome you want.',
    differenceCards: [
      {
        body: 'Create Kundli, see charts, ask limited questions, and download a useful report preview.',
        title: 'Free',
      },
      {
        body: 'Use Premium for monthly timing, chart synthesis, remedies, saved memory, family context, and detailed PDFs.',
        title: 'Premium',
      },
      {
        body: 'Use a Day Pass or one report when you need depth for a specific moment without subscribing.',
        title: 'One-time',
      },
    ],
    differenceEyebrow: 'What changes',
    differenceTitle: 'Free gives clarity. Premium gives depth.',
    legalBody:
      'Predicta Premium is deeper astrology guidance, not medical, legal, financial, or emergency advice. Subscriptions and one-time reports should stay clear before purchase.',
    legalTitle: 'Clear limits, no fear selling.',
    oneTimeBody: 'Use these when one clear life question needs a prepared answer without a subscription.',
    oneTimeTitle: 'One-time purchases',
    pill: 'No unlimited claims',
    planFeatures: [
      'Deeper Predicta answers with chart proof',
      'Life Calendar and timing windows',
      'Detailed PDFs for serious questions',
      'Family profiles, saved chats, and continuity',
    ],
    readPolicies: 'Read Policies',
    selectPrefix: 'Choose',
    storyBody: 'Premium is for users who want Predicta to prepare, remember, compare, and explain more deeply.',
    storyEyebrow: 'Premium story',
    storyTitle: 'Create your Kundli. Understand your life. Ask better questions. Get beautiful reports.',
    title: 'Pay only when you know what you need.',
  },
  hi: {
    back: 'प्रेडिक्टा पर वापस',
    body: 'भुगतान वाला विकल्प तभी चुनें जब प्रेडिक्टा मदद कर चुकी हो और आपको समय, तैयार रिपोर्ट, परिवार संदर्भ या ज्यादा गहराई चाहिए.',
    choiceCards: [
      {
        body: 'जब हर महीने प्रेडिक्टा मार्गदर्शन, समय, उपाय, सेव चैट और परिवार प्रोफाइल चाहिए.',
        cta: 'सदस्यता देखें',
        href: '#subscriptions',
        label: 'सदस्यता',
        title: 'मुझे हर महीने मार्गदर्शन चाहिए',
      },
      {
        body: 'जब कुंडली, करियर, धन, विवाह, साढ़े साती या अनुकूलता की एक सुंदर PDF चाहिए.',
        cta: 'एक रिपोर्ट चुनें',
        href: '#one-time',
        label: 'एक रिपोर्ट',
        title: 'मुझे एक जवाब अच्छे से तैयार चाहिए',
      },
      {
        body: 'जब दोस्त या परिवार निर्णय से पहले एक दिन प्रीमियम गहराई आजमाना चाहें.',
        cta: 'दिन पास आजमाएं',
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: '24 घंटे परीक्षण',
        title: 'मुझे आज सब आजमाना है',
      },
    ],
    choiceEyebrow: 'जरूरत से चुनें',
    choiceTitle: 'योजना मत खरीदें. जो परिणाम चाहिए, वह चुनें.',
    differenceCards: [
      {
        body: 'कुंडली बनाएं, चार्ट देखें, सीमित सवाल पूछें, और उपयोगी रिपोर्ट झलक डाउनलोड करें.',
        title: 'मुफ्त',
      },
      {
        body: 'मासिक समय, चार्ट सार, उपाय, सेव स्मृति, परिवार संदर्भ और विस्तृत PDF के लिए प्रीमियम लें.',
        title: 'प्रीमियम',
      },
      {
        body: 'सदस्यता नहीं चाहिए तो specific moment के लिए Day Pass या एक रिपोर्ट लें.',
        title: 'एक बार खरीदें',
      },
    ],
    differenceEyebrow: 'क्या बदलता है',
    differenceTitle: 'मुफ्त स्पष्टता देता है. प्रीमियम गहराई देता है.',
    legalBody:
      'प्रेडिक्टा प्रीमियम गहरा ज्योतिष मार्गदर्शन है, डॉक्टर, वकील, वित्तीय सलाहकार या आपात मदद का विकल्प नहीं. खरीदारी से पहले सदस्यता और एक बार की रिपोर्ट साफ समझ में आनी चाहिए.',
    legalTitle: 'साफ सीमाएं, डर बेचने वाला तरीका नहीं.',
    oneTimeBody: 'जब एक life question का prepared answer चाहिए और subscription नहीं चाहिए.',
    oneTimeTitle: 'एक बार की खरीदारी',
    pill: 'असीमित दावे नहीं',
    planFeatures: [
      'चार्ट प्रमाण के साथ गहरे प्रेडिक्टा जवाब',
      'Life Calendar और timing windows',
      'Serious questions के लिए detailed PDFs',
      'Family profiles, saved chats और continuity',
    ],
    readPolicies: 'नीतियां पढ़ें',
    selectPrefix: 'चुनें',
    storyBody: 'प्रीमियम उन उपयोगकर्ताओं के लिए है जिन्हें प्रेडिक्टा से तैयारी, स्मृति, तुलना और गहरी व्याख्या चाहिए.',
    storyEyebrow: 'प्रीमियम कहानी',
    storyTitle: 'कुंडली बनाएं. जीवन समझें. बेहतर सवाल पूछें. सुंदर रिपोर्ट पाएं.',
    title: 'तभी भुगतान करें जब जरूरत साफ हो.',
  },
  gu: {
    back: 'પ્રેડિક્ટા પર પાછા',
    body: 'ચુકવણીવાળો વિકલ્પ ત્યારે પસંદ કરો જ્યારે પ્રેડિક્ટા મદદ કરી ચૂકી હોય અને તમને સમય, તૈયાર રિપોર્ટ, પરિવાર સંદર્ભ અથવા વધુ ઊંડાઈ જોઈએ.',
    choiceCards: [
      {
        body: 'જ્યારે દર મહિને પ્રેડિક્ટા માર્ગદર્શન, સમય, ઉપાયો, સેવ ચેટ અને પરિવાર પ્રોફાઇલ જોઈએ.',
        cta: 'સભ્યપદ જુઓ',
        href: '#subscriptions',
        label: 'સભ્યપદ',
        title: 'મારે દર મહિને માર્ગદર્શન જોઈએ',
      },
      {
        body: 'જ્યારે કુંડળી, કારકિર્દી, ધન, લગ્ન, સાડેસાતી અથવા અનુકૂળતા માટે એક સુંદર PDF જોઈએ.',
        cta: 'એક રિપોર્ટ પસંદ કરો',
        href: '#one-time',
        label: 'એક રિપોર્ટ',
        title: 'મારે એક જવાબ સારી રીતે તૈયાર જોઈએ',
      },
      {
        body: 'જ્યારે મિત્રો અથવા પરિવાર નિર્ણય પહેલાં એક દિવસ પ્રીમિયમ ઊંડાઈ અજમાવવા માંગે.',
        cta: 'દિવસ પાસ અજમાવો',
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: '24 કલાક પરીક્ષણ',
        title: 'મારે આજે બધું અજમાવવું છે',
      },
    ],
    choiceEyebrow: 'જરૂર મુજબ પસંદ કરો',
    choiceTitle: 'યોજના ન ખરીદો. જે પરિણામ જોઈએ તે પસંદ કરો.',
    differenceCards: [
      {
        body: 'કુંડળી બનાવો, ચાર્ટ જુઓ, મર્યાદિત પ્રશ્નો પૂછો, અને ઉપયોગી રિપોર્ટ ઝલક ડાઉનલોડ કરો.',
        title: 'મફત',
      },
      {
        body: 'માસિક સમય, ચાર્ટ સાર, ઉપાયો, સેવ સ્મૃતિ, પરિવાર સંદર્ભ અને વિગતવાર PDF માટે પ્રીમિયમ લો.',
        title: 'પ્રીમિયમ',
      },
      {
        body: 'સભ્યપદ ન જોઈએ તો ખાસ સમય માટે દિવસ પાસ અથવા એક રિપોર્ટ લો.',
        title: 'એક વાર ખરીદો',
      },
    ],
    differenceEyebrow: 'શું બદલાય છે',
    differenceTitle: 'મફત સ્પષ્ટતા આપે છે. પ્રીમિયમ ઊંડાઈ આપે છે.',
    legalBody:
      'પ્રેડિક્ટા પ્રીમિયમ ઊંડું જ્યોતિષ માર્ગદર્શન છે, ડૉક્ટર, વકીલ, નાણાકીય સલાહકાર અથવા આપાત મદદનો વિકલ્પ નથી. ખરીદી પહેલાં સભ્યતા અને એક વારની રિપોર્ટ સ્પષ્ટ સમજાય તે જરૂરી છે.',
    legalTitle: 'સ્પષ્ટ મર્યાદા, ડર વેચવાનું નહીં.',
    oneTimeBody: 'જ્યારે એક life question નો prepared answer જોઈએ અને subscription ન જોઈએ.',
    oneTimeTitle: 'એક વારની ખરીદી',
    pill: 'અસીમ દાવા નહીં',
    planFeatures: [
      'ચાર્ટ પુરાવા સાથે ઊંડા પ્રેડિક્ટા જવાબ',
      'Life Calendar અને timing windows',
      'Serious questions માટે detailed PDFs',
      'Family profiles, saved chats અને continuity',
    ],
    readPolicies: 'નીતિઓ વાંચો',
    selectPrefix: 'પસંદ કરો',
    storyBody: 'પ્રીમિયમ એ ઉપયોગકર્તાઓ માટે છે જેને પ્રેડિક્ટા પાસેથી તૈયારી, સ્મૃતિ, તુલના અને ઊંડી સમજ જોઈએ.',
    storyEyebrow: 'પ્રીમિયમ વાર્તા',
    storyTitle: 'કુંડળી બનાવો. જીવન સમજો. સારા પ્રશ્નો પૂછો. સુંદર રિપોર્ટ્સ મેળવો.',
    title: 'જરૂર સ્પષ્ટ હોય ત્યારે જ ચૂકવણી કરો.',
  },
};

function getLocalizedPlanCopy(
  id: string,
  language: SupportedLanguage,
): {
  badge?: string;
  billingCopy: string;
  label: string;
  monthlyEquivalent?: string;
} {
  if (language === 'hi') {
    const map: Record<string, { badge?: string; billingCopy: string; label: string; monthlyEquivalent?: string }> = {
      WEEKLY: { billingCopy: 'प्रति सप्ताह', label: 'साप्ताहिक' },
      MONTHLY: { billingCopy: 'प्रति माह', label: 'मासिक' },
      QUARTERLY: {
        billingCopy: 'हर 3 महीने',
        label: 'त्रैमासिक',
        monthlyEquivalent: 'लगभग प्रति माह',
      },
      YEARLY: {
        badge: 'संस्थापक मूल्य',
        billingCopy: 'प्रति वर्ष',
        label: 'वार्षिक',
        monthlyEquivalent: 'लगभग प्रति माह',
      },
    };

    return map[id] ?? { billingCopy: '', label: id };
  }

  if (language === 'gu') {
    const map: Record<string, { badge?: string; billingCopy: string; label: string; monthlyEquivalent?: string }> = {
      WEEKLY: { billingCopy: 'દર અઠવાડિયે', label: 'સાપ્તાહિક' },
      MONTHLY: { billingCopy: 'દર મહિને', label: 'માસિક' },
      QUARTERLY: {
        billingCopy: 'દર 3 મહિને',
        label: 'ત્રિમાસિક',
        monthlyEquivalent: 'લગભગ દર મહિને',
      },
      YEARLY: {
        badge: 'સ્થાપક મૂલ્ય',
        billingCopy: 'દર વર્ષે',
        label: 'વાર્ષિક',
        monthlyEquivalent: 'લગભગ દર મહિને',
      },
    };

    return map[id] ?? { billingCopy: '', label: id };
  }

  return {
    badge: id === 'YEARLY' ? 'Founder price' : undefined,
    billingCopy:
      id === 'WEEKLY'
        ? '/ week'
        : id === 'MONTHLY'
          ? '/ month'
          : id === 'QUARTERLY'
            ? '/ 3 months'
            : '/ year',
    label:
      id === 'WEEKLY'
        ? 'Weekly'
        : id === 'MONTHLY'
          ? 'Monthly'
          : id === 'QUARTERLY'
            ? 'Quarterly'
            : 'Yearly',
  };
}

function getLocalizedOneTimeProductCopy(
  id: string,
  language: SupportedLanguage,
): { description: string; label: string } {
  if (language === 'hi') {
    const map: Record<string, { description: string; label: string }> = {
      DAY_PASS: {
        description: 'सदस्यता के बिना एक दिन के लिए प्रीमियम गहराई आजमाएं.',
        label: 'डे पास',
      },
      DETAILED_KUNDLI_REPORT: {
        description: 'सक्रिय कुंडली के लिए एक गहरी कुंडली रिपोर्ट बनाएं.',
        label: 'विस्तृत कुंडली रिपोर्ट',
      },
      FIVE_QUESTIONS: {
        description: 'जब ज्यादा मार्गदर्शन चाहिए तब 5 प्रेडिक्टा सवाल जोड़ें.',
        label: '5 प्रेडिक्टा सवाल',
      },
      MARRIAGE_COMPATIBILITY_REPORT: {
        description: 'दो चार्ट के रिश्ते और विवाह समय पर केंद्रित रिपोर्ट.',
        label: 'विवाह मिलान रिपोर्ट',
      },
      PREMIUM_PDF: {
        description: 'सक्रिय कुंडली के लिए एक प्रीमियम गहराई वाली पीडीएफ खोलें.',
        label: 'प्रीमियम पीडीएफ',
      },
    };

    return map[id] ?? { description: '', label: id };
  }

  if (language === 'gu') {
    const map: Record<string, { description: string; label: string }> = {
      DAY_PASS: {
        description: 'સભ્યતા વગર એક દિવસ માટે પ્રીમિયમ ઊંડાઈ અજમાવો.',
        label: 'ડે પાસ',
      },
      DETAILED_KUNDLI_REPORT: {
        description: 'સક્રિય કુંડળી માટે ઊંડી કુંડળી રિપોર્ટ બનાવો.',
        label: 'વિગતવાર કુંડળી રિપોર્ટ',
      },
      FIVE_QUESTIONS: {
        description: 'જ્યારે વધુ માર્ગદર્શન જોઈએ ત્યારે 5 પ્રેડિક્ટા પ્રશ્નો ઉમેરો.',
        label: '5 પ્રેડિક્ટા પ્રશ્નો',
      },
      MARRIAGE_COMPATIBILITY_REPORT: {
        description: 'બે ચાર્ટના સંબંધ અને લગ્ન સમય પર કેન્દ્રિત રિપોર્ટ.',
        label: 'લગ્ન મિલાન રિપોર્ટ',
      },
      PREMIUM_PDF: {
        description: 'સક્રિય કુંડળી માટે પ્રીમિયમ ઊંડાઈવાળી પીડીએફ ખોલો.',
        label: 'પ્રીમિયમ પીડીએફ',
      },
    };

    return map[id] ?? { description: '', label: id };
  }

  return {
    description:
      id === 'DAY_PASS'
        ? 'Try Premium depth for one day without a subscription.'
        : id === 'FIVE_QUESTIONS'
          ? 'Add 5 Predicta questions when you need more guidance.'
          : id === 'PREMIUM_PDF'
            ? 'Unlock one premium-depth PDF for the active kundli.'
            : id === 'DETAILED_KUNDLI_REPORT'
              ? 'Generate one deeper kundli dossier for the active kundli.'
              : 'Focused two-chart relationship and marriage timing report.',
    label:
      id === 'DAY_PASS'
        ? 'Day Pass'
        : id === 'FIVE_QUESTIONS'
          ? '5 Predicta Questions'
          : id === 'PREMIUM_PDF'
            ? 'Premium PDF'
            : id === 'DETAILED_KUNDLI_REPORT'
              ? 'Detailed Kundli Report'
              : 'Marriage Compatibility Report',
  };
}

function getLocalizedPremiumFeatureStory(
  language: SupportedLanguage,
): Array<{ body: string; title: string }> {
  if (language === 'hi') {
    return [
      {
        body: 'प्रीमियम जवाब चार्ट कारण, भरोसा स्तर और समय संदर्भ दिखाते हैं.',
        title: 'प्रमाण के साथ पूछें',
      },
      {
        body: 'दशा और गोचर का महीने-दर-महीने जीवन कैलेंडर.',
        title: 'जीवन कैलेंडर',
      },
      {
        body: 'कई पारिवारिक कुंडलियां निजी रूप से सेव और तुलना करें.',
        title: 'परिवार वॉल्ट',
      },
      {
        body: 'कुंडली, करियर, विवाह, धन, संतान और उपाय के केंद्रित पैक.',
        title: 'प्रीमियम रिपोर्ट पैक',
      },
      {
        body: 'वर्ग चार्ट, दशा, गोचर, अष्टकवर्ग और प्रमाण तालिकाएं देखें.',
        title: 'गंभीर ज्योतिष मोड',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        body: 'પ્રીમિયમ જવાબ ચાર્ટ કારણો, વિશ્વાસ સ્તર અને સમય સંદર્ભ બતાવે છે.',
        title: 'પુરાવા સાથે પૂછો',
      },
      {
        body: 'દશા અને ગોચરનું મહિના પ્રમાણે જીવન કેલેન્ડર.',
        title: 'જીવન કેલેન્ડર',
      },
      {
        body: 'ઘણી પરિવાર કુંડળીઓ ખાનગી રીતે સેવ અને સરખાવો.',
        title: 'પરિવાર વોલ્ટ',
      },
      {
        body: 'કુંડળી, કારકિર્દી, લગ્ન, ધન, સંતાન અને ઉપાયો માટે કેન્દ્રિત પેક.',
        title: 'પ્રીમિયમ રિપોર્ટ પેક',
      },
      {
        body: 'વર્ગ ચાર્ટ, દશા, ગોચર, અષ્ટકવર્ગ અને પુરાવા કોષ્ટકો જુઓ.',
        title: 'ગંભીર જ્યોતિષ મોડ',
      },
    ];
  }

  return [...PREMIUM_FEATURE_STORY];
}
