'use client';

import {
  PREMIUM_FEATURE_STORY,
  getDayPassProduct,
  getOneTimeProducts,
  getPricingPlans,
} from '@pridicta/config/pricing';
import type { SupportedLanguage } from '@pridicta/types';
import Link from 'next/link';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';
import { useLanguagePreference } from '../../../lib/language-preference';

export default function DashboardPremiumPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = PREMIUM_PAGE_COPY[language] ?? PREMIUM_PAGE_COPY.en;
  const plans = getPricingPlans();
  const dayPass = getDayPassProduct();
  const products = getOneTimeProducts().filter(product =>
    ['PREMIUM_PDF', 'MARRIAGE_COMPATIBILITY_REPORT'].includes(product.id),
  );

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label={copy.pill} tone="quiet" />
        <h1 className="gradient-text">{copy.title}</h1>
        <details className="info-drawer">
          <summary>
            <span>{copy.drawerEyebrow}</span>
            <strong>{copy.drawerAction}</strong>
          </summary>
          <p>{copy.drawerBody}</p>
        </details>
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

      <div className="pricing-grid" id="subscriptions">
        {plans.map(plan => {
          const localizedPlan = getLocalizedPlanCopy(plan.id, language);

          return (
            <Card
              className={
                plan.recommended
                  ? 'glass-panel plan-card recommended'
                  : 'plan-card'
              }
              key={plan.id}
            >
              <div className="card-content spacious">
                <div className="section-title">{localizedPlan.label}</div>
                <h2>{plan.displayPrice}</h2>
                <p>{localizedPlan.billingCopy}</p>
                {plan.monthlyEquivalent ? (
                  <span>
                    {plan.monthlyEquivalent}{' '}
                    {localizedPlan.monthlyEquivalent ?? ''}
                  </span>
                ) : null}
                {plan.badge ? (
                  <StatusPill
                    label={localizedPlan.badge ?? plan.badge}
                    tone="premium"
                  />
                ) : null}
                <Link
                  className="button"
                  href={`/checkout?productId=${encodeURIComponent(plan.productId)}`}
                >
                  {copy.choosePrefix} {localizedPlan.label}
                </Link>
              </div>
            </Card>
          );
        })}
      </div>

      <section className="one-time-section" id="one-time">
        <div>
          <h2>{copy.oneTimeTitle}</h2>
          <p>{copy.oneTimeBody}</p>
          <Link
            className="button"
            href={`/checkout?productId=${encodeURIComponent(dayPass.productId)}`}
          >
            {copy.dayPassCta(dayPass.label, dayPass.displayPrice)}
          </Link>
        </div>
        <div className="one-time-grid">
          {products.map(product => {
            const localizedProduct = getLocalizedOneTimeProductCopy(
              product.id,
              language,
            );

            return (
              <Card key={product.id}>
                <div className="card-content">
                  <div className="section-title">{localizedProduct.label}</div>
                  <h3>{product.displayPrice}</h3>
                  <p>{localizedProduct.description}</p>
                  <Link
                    className="button secondary"
                    href={`/checkout?productId=${encodeURIComponent(
                      product.productId,
                    )}`}
                  >
                    {copy.choosePrefix} {localizedProduct.label}
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function getLocalizedPremiumFeatureStory(
  language: SupportedLanguage,
): Array<{ body: string; title: string }> {
  if (language === 'hi') {
    return [
      {
        body: 'गंभीर सवाल को चार्ट प्रमाण, भरोसा, समय संदर्भ और अगले कदम में बदलें.',
        title: 'गहरा उत्तर लें',
      },
      {
        body: 'मौजूदा जीवन चरण के पीछे महीने-दर-महीने दशा और गोचर खिड़कियां देखें.',
        title: 'समय साफ देखें',
      },
      {
        body: 'परिवार की कुंडलियां साथ रखें, पैटर्न तुलना करें, और सही प्रोफाइल के साथ प्रेडिक्टा से पूछें.',
        title: 'परिवार चार्ट समझें',
      },
      {
        body: 'कुंडली, करियर, विवाह, धन, संतान और उपाय के लिए तैयार पीडीएफ बनाएं.',
        title: 'सुंदर रिपोर्ट बनाएं',
      },
      {
        body: 'जब पूरी वजह चाहिए, तब वर्ग, दशा, गोचर, अष्टकवर्ग और प्रमाण तालिकाएं खोलें.',
        title: 'गहरा प्रमाण देखें',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        body: 'ગંભીર પ્રશ્નને ચાર્ટ પુરાવો, વિશ્વાસ, સમય સંદર્ભ અને આગળના પગલામાં ફેરવો.',
        title: 'ઊંડો જવાબ મેળવો',
      },
      {
        body: 'મૌજૂદા જીવન ચરણ પાછળની મહિનો-દર-મહિનો દશા અને ગોચર વિન્ડોઝ જુઓ.',
        title: 'સમય સ્પષ્ટ જુઓ',
      },
      {
        body: 'પરિવારની કુંડળીઓ સાથે રાખો, પેટર્ન સરખાવો, અને સાચી પ્રોફાઇલ સાથે પ્રેડિક્ટાને પૂછો.',
        title: 'પરિવાર ચાર્ટ સમજો',
      },
      {
        body: 'કુંડળી, કારકિર્દી, લગ્ન, ધન, સંતાન અને ઉપાયો માટે તૈયાર પીડીએફ બનાવો.',
        title: 'સુંદર રિપોર્ટ બનાવો',
      },
      {
        body: 'જ્યારે સંપૂર્ણ કારણ જોઈએ ત્યારે વર્ગ, દશા, ગોચર, અષ્ટકવર્ગ અને પુરાવા કોષ્ટકો ખોલો.',
        title: 'ઊંડો પુરાવો જુઓ',
      },
    ];
  }

  return PREMIUM_FEATURE_STORY.map(feature => ({ ...feature }));
}

function getLocalizedPlanCopy(
  planId: string,
  language: SupportedLanguage,
): {
  badge?: string;
  billingCopy: string;
  label: string;
  monthlyEquivalent?: string;
} {
  const copy = PLAN_COPY[language] ?? PLAN_COPY.en;
  return copy[planId] ?? copy.MONTHLY;
}

function getLocalizedOneTimeProductCopy(
  productId: string,
  language: SupportedLanguage,
): {
  description: string;
  label: string;
} {
  const copy = ONE_TIME_COPY[language] ?? ONE_TIME_COPY.en;
  return copy[productId] ?? copy.PREMIUM_PDF;
}

const PREMIUM_PAGE_COPY: Record<
  SupportedLanguage,
  {
    choiceCards: Array<{
      body: string;
      cta: string;
      href: string;
      label: string;
      title: string;
    }>;
    choiceEyebrow: string;
    choiceTitle: string;
    choosePrefix: string;
    dayPassCta: (label: string, price: string) => string;
    drawerAction: string;
    drawerBody: string;
    drawerEyebrow: string;
    oneTimeBody: string;
    oneTimeTitle: string;
    pill: string;
    storyBody: string;
    storyEyebrow: string;
    storyTitle: string;
    title: string;
  }
> = {
  en: {
    choiceCards: [
      {
        body: 'Best when you want Predicta with you each month for timing, remedies, saved chats, and continuity.',
        cta: 'See subscriptions',
        href: '#subscriptions',
        label: 'Monthly guidance',
        title: 'I want Predicta with me every month',
      },
      {
        body: 'Best when one life question needs a prepared answer and a clean PDF you can keep or share.',
        cta: 'Choose one report',
        href: '#one-time',
        label: 'One prepared answer',
        title: 'I need one polished report',
      },
      {
        body: 'Best when you want one day of deeper access before deciding on anything longer.',
        cta: 'Try Day Pass',
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: 'Trial depth',
        title: 'I want to test full depth today',
      },
    ],
    choiceEyebrow: 'Choose by outcome',
    choiceTitle: 'Pay for depth only when the question justifies it.',
    choosePrefix: 'Choose',
    dayPassCta: (label, price) => `${label} · ${price}`,
    drawerAction: 'Open',
    drawerBody:
      'Free should be useful first. Paid depth is for clearer timing, deeper synthesis, family context, and prepared reports worth keeping.',
    drawerEyebrow: 'How to choose',
    oneTimeBody:
      'Use Day Pass or one report when you want a focused answer without a subscription.',
    oneTimeTitle: 'One-time access',
    pill: 'Trust before purchase',
    storyBody:
      'Premium is for users who want Predicta to prepare, remember, compare, and explain with more evidence.',
    storyEyebrow: 'What changes',
    storyTitle: 'Premium adds preparation, timing, memory, and proof.',
    title: 'Choose more depth only when it helps.',
  },
  hi: {
    choiceCards: [
      {
        body: 'जब आपको हर महीने समय, उपाय, सेव चैट और निरंतरता के साथ प्रेडिक्टा चाहिए.',
        cta: 'सदस्यता देखें',
        href: '#subscriptions',
        label: 'मासिक मार्गदर्शन',
        title: 'मुझे हर महीने प्रेडिक्टा चाहिए',
      },
      {
        body: 'जब एक जीवन सवाल के लिए तैयार जवाब और सुंदर पीडीएफ चाहिए जिसे आप रख सकें या साझा कर सकें.',
        cta: 'एक रिपोर्ट चुनें',
        href: '#one-time',
        label: 'एक तैयार जवाब',
        title: 'मुझे एक सधी हुई रिपोर्ट चाहिए',
      },
      {
        body: 'जब लंबी प्रतिबद्धता से पहले एक दिन की पूरी गहराई आजमानी हो.',
        cta: 'डे पास आजमाएं',
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: 'ट्रायल गहराई',
        title: 'मैं आज पूरी गहराई आजमाना चाहता/चाहती हूं',
      },
    ],
    choiceEyebrow: 'जरूरत से चुनें',
    choiceTitle: 'भुगतान तभी करें जब सवाल सच में ज्यादा गहराई मांगता हो.',
    choosePrefix: 'चुनें',
    dayPassCta: (label, price) => `${label} · ${price}`,
    drawerAction: 'खोलें',
    drawerBody:
      'पहले मुफ्त उपयोगी होना चाहिए. भुगतान वाली गहराई तब लें जब ज्यादा साफ समय, गहरा सार, परिवार संदर्भ या तैयार रिपोर्ट चाहिए.',
    drawerEyebrow: 'कैसे चुनें',
    oneTimeBody:
      'डे पास या एक रिपोर्ट तब लें जब सदस्यता के बिना एक केंद्रित जवाब चाहिए.',
    oneTimeTitle: 'एक बार का प्रवेश',
    pill: 'भरोसा पहले',
    storyBody:
      'प्रीमियम उन लोगों के लिए है जो चाहते हैं कि प्रेडिक्टा ज्यादा तैयारी करे, याद रखे, तुलना करे और प्रमाण के साथ समझाए.',
    storyEyebrow: 'क्या बदलता है',
    storyTitle: 'प्रीमियम तैयारी, समय, स्मृति और प्रमाण बढ़ाता है.',
    title: 'ज्यादा गहराई तभी चुनें जब उससे मदद मिले.',
  },
  gu: {
    choiceCards: [
      {
        body: 'જ્યારે દર મહિને સમય, ઉપાયો, સેવ ચેટ અને સતતતા સાથે પ્રેડિક્ટા જોઈએ.',
        cta: 'સભ્યપદ જુઓ',
        href: '#subscriptions',
        label: 'માસિક માર્ગદર્શન',
        title: 'મારે દર મહિને પ્રેડિક્ટા જોઈએ',
      },
      {
        body: 'જ્યારે એક જીવન પ્રશ્ન માટે તૈયાર જવાબ અને સુંદર પીડીએફ જોઈએ જેને તમે રાખી અથવા શેર કરી શકો.',
        cta: 'એક રિપોર્ટ પસંદ કરો',
        href: '#one-time',
        label: 'એક તૈયાર જવાબ',
        title: 'મારે એક સધી રિપોર્ટ જોઈએ',
      },
      {
        body: 'જ્યારે લાંબી પ્રતિબદ્ધતા પહેલાં એક દિવસની સંપૂર્ણ ઊંડાઈ અજમાવવી હોય.',
        cta: 'ડે પાસ અજમાવો',
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: 'ટ્રાયલ ઊંડાઈ',
        title: 'હું આજે સંપૂર્ણ ઊંડાઈ અજમાવવા માગું છું',
      },
    ],
    choiceEyebrow: 'જરૂર પ્રમાણે પસંદ કરો',
    choiceTitle: 'ચુકવણી ત્યારે જ કરો જ્યારે પ્રશ્ન ખરેખર વધુ ઊંડાઈ માંગે.',
    choosePrefix: 'પસંદ કરો',
    dayPassCta: (label, price) => `${label} · ${price}`,
    drawerAction: 'ખોલો',
    drawerBody:
      'પહેલાં મફત ઉપયોગી હોવું જોઈએ. ચૂકવેલી ઊંડાઈ ત્યારે લો જ્યારે વધારે સ્પષ્ટ સમય, ઊંડો સાર, પરિવાર સંદર્ભ અથવા તૈયાર રિપોર્ટ જોઈએ.',
    drawerEyebrow: 'કેવી રીતે પસંદ કરવું',
    oneTimeBody:
      'ડે પાસ અથવા એક રિપોર્ટ ત્યારે લો જ્યારે સભ્યપદ વગર એક કેન્દ્રિત જવાબ જોઈએ.',
    oneTimeTitle: 'એક વખતનો પ્રવેશ',
    pill: 'ભરોસો પહેલાં',
    storyBody:
      'પ્રીમિયમ તે વપરાશકર્તાઓ માટે છે જેઓ ઇચ્છે છે કે પ્રેડિક્ટા વધુ તૈયારી કરે, યાદ રાખે, સરખાવે અને પુરાવા સાથે સમજાવે.',
    storyEyebrow: 'શું બદલાય છે',
    storyTitle: 'પ્રીમિયમ તૈયારી, સમય, સ્મૃતિ અને પુરાવો વધારે છે.',
    title: 'વધુ ઊંડાઈ ત્યારે જ પસંદ કરો જ્યારે તે મદદ કરે.',
  },
};

const PLAN_COPY: Record<
  SupportedLanguage,
  Record<
    string,
    { badge?: string; billingCopy: string; label: string; monthlyEquivalent?: string }
  >
> = {
  en: {
    WEEKLY: {
      billingCopy: 'One week of deeper Predicta guidance.',
      label: 'Weekly',
    },
    MONTHLY: {
      badge: 'Most practical',
      billingCopy: 'Monthly Predicta depth for ongoing questions, timing, and saved continuity.',
      label: 'Monthly',
    },
    QUARTERLY: {
      badge: 'Better value',
      billingCopy: 'Quarterly access for users who want seasonal timing and steadier follow-through.',
      label: 'Quarterly',
    },
    YEARLY: {
      badge: 'Deepest value',
      billingCopy: 'Year-round access for users who want Predicta as a regular spiritual timing system.',
      label: 'Yearly',
      monthlyEquivalent: 'effective per month',
    },
  },
  hi: {
    WEEKLY: {
      billingCopy: 'एक सप्ताह की गहरी प्रेडिक्टा मार्गदर्शन.',
      label: 'साप्ताहिक',
    },
    MONTHLY: {
      badge: 'सबसे व्यावहारिक',
      billingCopy: 'लगातार सवाल, समय और सेव निरंतरता के लिए मासिक प्रेडिक्टा गहराई.',
      label: 'मासिक',
    },
    QUARTERLY: {
      badge: 'बेहतर मूल्य',
      billingCopy: 'मौसमी समय और स्थिर फॉलो-थ्रू चाहने वालों के लिए तिमाही प्रवेश.',
      label: 'त्रैमासिक',
    },
    YEARLY: {
      badge: 'सबसे गहरा मूल्य',
      billingCopy: 'उन लोगों के लिए पूरे वर्ष का प्रवेश जो प्रेडिक्टा को नियमित जीवन-समय प्रणाली की तरह इस्तेमाल करना चाहते हैं.',
      label: 'वार्षिक',
      monthlyEquivalent: 'प्रति माह के बराबर',
    },
  },
  gu: {
    WEEKLY: {
      billingCopy: 'એક અઠવાડિયાની ઊંડી પ્રેડિક્ટા માર્ગદર્શન.',
      label: 'સાપ્તાહિક',
    },
    MONTHLY: {
      badge: 'સૌથી વ્યવહારુ',
      billingCopy: 'ચાલુ પ્રશ્નો, સમય અને સેવ સતતતા માટે માસિક પ્રેડિક્ટા ઊંડાઈ.',
      label: 'માસિક',
    },
    QUARTERLY: {
      badge: 'વધારે સારું મૂલ્ય',
      billingCopy: 'મોસમી સમય અને વધુ સ્થિર અનુસરણ ઇચ્છતા વપરાશકર્તાઓ માટે ત્રિમાસિક પ્રવેશ.',
      label: 'ત્રિમાસિક',
    },
    YEARLY: {
      badge: 'સૌથી ઊંડું મૂલ્ય',
      billingCopy: 'જે વપરાશકર્તાઓ પ્રેડિક્ટાને નિયમિત જીવન-સમય સિસ્ટમ તરીકે ઉપયોગ કરવા માંગે છે તેમના માટે આખા વર્ષની પ્રવેશ.',
      label: 'વાર્ષિક',
      monthlyEquivalent: 'દર મહિને અસરકારક',
    },
  },
};

const ONE_TIME_COPY: Record<
  SupportedLanguage,
  Record<string, { description: string; label: string }>
> = {
  en: {
    MARRIAGE_COMPATIBILITY_REPORT: {
      description: 'Prepared compatibility reading for marriage or family discussion.',
      label: 'Compatibility report',
    },
    PREMIUM_PDF: {
      description: 'One polished report when a specific question needs a prepared answer.',
      label: 'Premium PDF',
    },
  },
  hi: {
    MARRIAGE_COMPATIBILITY_REPORT: {
      description: 'विवाह या परिवार चर्चा के लिए तैयार मिलान रिपोर्ट.',
      label: 'कम्पैटिबिलिटी रिपोर्ट',
    },
    PREMIUM_PDF: {
      description: 'जब किसी खास सवाल के लिए तैयार जवाब चाहिए तब एक सुंदर रिपोर्ट.',
      label: 'प्रीमियम पीडीएफ',
    },
  },
  gu: {
    MARRIAGE_COMPATIBILITY_REPORT: {
      description: 'લગ્ન અથવા પરિવાર ચર્ચા માટે તૈયાર મિલાન રિપોર્ટ.',
      label: 'કમ્પેટિબિલિટી રિપોર્ટ',
    },
    PREMIUM_PDF: {
      description: 'જ્યારે ખાસ પ્રશ્ન માટે તૈયાર જવાબ જોઈએ ત્યારે એક સુંદર રિપોર્ટ.',
      label: 'પ્રીમિયમ પીડીએફ',
    },
  },
};
