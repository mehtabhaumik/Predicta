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

        <div className="pricing-grid">
          {plans.map(plan => (
            <Card
              className={plan.recommended ? 'glass-panel plan-card recommended' : 'plan-card'}
              key={plan.id}
            >
              <div className="card-content spacious">
                <div className="section-title">{plan.label}</div>
                <h2>{plan.displayPrice}</h2>
                <p>{plan.billingCopy}</p>
                {plan.monthlyEquivalent ? <span>{plan.monthlyEquivalent}</span> : null}
                {plan.badge ? <StatusPill label={plan.badge} tone="premium" /> : null}
                <ul className="pricing-feature-list">
                  {copy.planFeatures.map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <Link
                  className="button"
                  href={`/checkout?productId=${encodeURIComponent(plan.productId)}`}
                >
                  {copy.selectPrefix} {plan.label}
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <section className="one-time-section">
          <div>
            <h2>{copy.oneTimeTitle}</h2>
            <p>{copy.oneTimeBody}</p>
          </div>
          <div className="one-time-grid">
            {products.map(product => (
              <Card key={product.id}>
                <div className="card-content">
                  <div className="section-title">{product.label}</div>
                  <h3>{product.displayPrice}</h3>
                  <p>{product.description}</p>
                  <Link
                    className="button secondary"
                    href={`/checkout?productId=${encodeURIComponent(product.productId)}`}
                  >
                    {copy.selectPrefix} {product.label}
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
            {PREMIUM_FEATURE_STORY.map(feature => (
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
    body: 'Premium unlocks deeper guidance, higher limits, and richer report depth without fear-based promises.',
    differenceCards: [
      {
        body: 'Create Kundli, see charts, ask limited questions, and download a useful free report.',
        title: 'Free',
      },
      {
        body: 'Go deeper with chart synthesis, timing maps, remedies, longer chat, family context, and detailed PDFs.',
        title: 'Premium',
      },
      {
        body: 'Buy a Day Pass or one polished report when you do not want a subscription.',
        title: 'One-time',
      },
    ],
    differenceEyebrow: 'What changes',
    differenceTitle: 'Free gives clarity. Premium gives depth.',
    legalBody:
      'Predicta Premium is deeper astrology guidance, not medical, legal, financial, or emergency advice. Subscriptions and one-time reports should stay clear before purchase.',
    legalTitle: 'Clear limits, no fear selling.',
    oneTimeBody: 'Use these when you want one clear unlock without a subscription.',
    oneTimeTitle: 'One-time purchases',
    pill: 'No unlimited claims',
    planFeatures: [
      'Deeper Predicta answers with proof',
      'Life Calendar and timing windows',
      'Premium report depth',
      'Family profiles and saved guidance',
    ],
    readPolicies: 'Read Policies',
    selectPrefix: 'Select',
    storyBody: 'Premium should feel like a private Jyotish studio, not a meter running in the background.',
    storyEyebrow: 'Premium story',
    storyTitle: 'Create your Kundli. Understand your life. Ask better questions. Get beautiful reports.',
    title: 'Premium access without pressure.',
  },
  hi: {
    back: 'Predicta पर वापस',
    body: 'प्रीमियम गहरा मार्गदर्शन, ज्यादा limits और बेहतर रिपोर्ट depth देता है, डराने वाले promises नहीं.',
    differenceCards: [
      {
        body: 'कुंडली बनाएं, चार्ट देखें, सीमित सवाल पूछें, और उपयोगी मुफ्त रिपोर्ट download करें.',
        title: 'मुफ्त',
      },
      {
        body: 'चार्ट synthesis, समय map, उपाय, लंबी chat, family context और detailed PDFs में गहराई पाएं.',
        title: 'प्रीमियम',
      },
      {
        body: 'Subscription नहीं चाहिए तो Day Pass या एक सुंदर report लें.',
        title: 'एक बार खरीदें',
      },
    ],
    differenceEyebrow: 'क्या बदलता है',
    differenceTitle: 'मुफ्त clarity देता है. प्रीमियम depth देता है.',
    legalBody:
      'Predicta Premium गहरा ज्योतिष मार्गदर्शन है, medical, legal, financial या emergency advice नहीं. Purchase से पहले subscriptions और one-time reports साफ रहने चाहिए.',
    legalTitle: 'साफ limits, डर बेचने वाला तरीका नहीं.',
    oneTimeBody: 'जब subscription नहीं चाहिए और एक clear unlock चाहिए तब उपयोग करें.',
    oneTimeTitle: 'एक बार की खरीदारी',
    pill: 'Unlimited claims नहीं',
    planFeatures: [
      'प्रमाण के साथ गहरे Predicta जवाब',
      'Life Calendar और समय windows',
      'प्रीमियम रिपोर्ट depth',
      'Family profiles और saved guidance',
    ],
    readPolicies: 'नीतियां पढ़ें',
    selectPrefix: 'चुनें',
    storyBody: 'प्रीमियम को निजी ज्योतिष studio जैसा feel होना चाहिए, background meter जैसा नहीं.',
    storyEyebrow: 'प्रीमियम story',
    storyTitle: 'कुंडली बनाएं. जीवन समझें. बेहतर सवाल पूछें. सुंदर रिपोर्ट पाएं.',
    title: 'बिना दबाव प्रीमियम access.',
  },
  gu: {
    back: 'Predicta પર પાછા',
    body: 'પ્રીમિયમ ઊંડું માર્ગદર્શન, વધુ limits અને સારી report depth આપે છે, ડરાવનારા promises નહીં.',
    differenceCards: [
      {
        body: 'કુંડળી બનાવો, ચાર્ટ્સ જુઓ, મર્યાદિત પ્રશ્નો પૂછો, અને ઉપયોગી મફત રિપોર્ટ download કરો.',
        title: 'મફત',
      },
      {
        body: 'ચાર્ટ synthesis, સમય map, ઉપાયો, લાંબી chat, family context અને detailed PDFs માં ઊંડાઈ મેળવો.',
        title: 'પ્રીમિયમ',
      },
      {
        body: 'Subscription ન જોઈએ તો Day Pass અથવા એક સુંદર report લો.',
        title: 'એક વાર ખરીદો',
      },
    ],
    differenceEyebrow: 'શું બદલાય છે',
    differenceTitle: 'મફત clarity આપે છે. પ્રીમિયમ depth આપે છે.',
    legalBody:
      'Predicta Premium ઊંડું જ્યોતિષ માર્ગદર્શન છે, medical, legal, financial અથવા emergency advice નથી. Purchase પહેલાં subscriptions અને one-time reports સ્પષ્ટ રહેવા જોઈએ.',
    legalTitle: 'સ્પષ્ટ limits, ડર વેચવાનું નહીં.',
    oneTimeBody: 'Subscription વગર એક clear unlock જોઈએ ત્યારે ઉપયોગ કરો.',
    oneTimeTitle: 'એક વારની ખરીદી',
    pill: 'Unlimited claims નહીં',
    planFeatures: [
      'પુરાવા સાથે ઊંડા Predicta જવાબ',
      'Life Calendar અને સમય windows',
      'પ્રીમિયમ report depth',
      'Family profiles અને saved guidance',
    ],
    readPolicies: 'નીતિઓ વાંચો',
    selectPrefix: 'પસંદ કરો',
    storyBody: 'પ્રીમિયમ private Jyotish studio જેવું feel થવું જોઈએ, background meter જેવું નહીં.',
    storyEyebrow: 'પ્રીમિયમ story',
    storyTitle: 'કુંડળી બનાવો. જીવન સમજો. સારા પ્રશ્નો પૂછો. સુંદર રિપોર્ટ્સ મેળવો.',
    title: 'દબાણ વગર પ્રીમિયમ access.',
  },
};
