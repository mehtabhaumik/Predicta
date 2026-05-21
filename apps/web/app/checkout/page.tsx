'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  getOneTimeProducts,
  getPricingPlans,
} from '@pridicta/config/pricing';
import type { SupportedLanguage } from '@pridicta/types';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { useLanguagePreference } from '../../lib/language-preference';

const SUPPORT_EMAIL = 'support@predicta.app';

export default function CheckoutPage(): React.JSX.Element {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const { language } = useLanguagePreference();
  const copy = CHECKOUT_COPY[language] ?? CHECKOUT_COPY.en;
  const productId = searchParams.get('productId') ?? undefined;
  const plans = getPricingPlans();
  const products = getOneTimeProducts();
  const selectedPlan = plans.find(plan => plan.productId === productId);
  const selectedProduct = products.find(product => product.productId === productId);
  const selected = selectedPlan ?? selectedProduct;
  const selectedLabel = selected
    ? getLocalizedAccessLabel(selected.label, selected.productId, language)
    : undefined;
  const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    selectedLabel ? `${copy.supportSubject}: ${selectedLabel}` : copy.supportSubject,
  )}`;

  return (
    <>
      <WebHeader />
      <main className="checkout-page">
        <section className="checkout-panel glass-panel">
          <StatusPill label={copy.pill} tone="premium" />
          <h1>{selectedLabel ? copy.reviewTitle(selectedLabel) : copy.title}</h1>
          <p>
            {selected
              ? selectedPlan
                ? copy.planBody(selectedPlan.billingCopy)
                : copy.productBody(selectedProduct?.description ?? '')
              : copy.body}
          </p>

          {selected ? (
            <div className="checkout-summary">
              <span>{copy.selected}</span>
              <strong>{selected.displayPrice}</strong>
              <small>{selectedPlan ? copy.subscription : copy.oneTime}</small>
            </div>
          ) : null}

          <div className="pricing-difference-grid checkout-path-grid">
            {copy.steps.map(step => (
              <article key={step.title}>
                <span>{step.label}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            ))}
          </div>

          <div className="checkout-actions">
            <Link className="button" href="/dashboard/settings">
              {copy.openAccount}
            </Link>
            <Link className="button secondary" href="/dashboard/redeem-pass">
              {copy.redeemPass}
            </Link>
            <a className="button secondary" href={supportHref}>
              {copy.emailSupport}
            </a>
            <Link className="button secondary" href="/pricing">
              {copy.change}
            </Link>
          </div>
          <p className="checkout-note">{copy.note}</p>
        </section>
      </main>
      <WebFooter />
    </>
  );
}

function CheckoutFallback(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = CHECKOUT_COPY[language] ?? CHECKOUT_COPY.en;

  return (
    <>
      <WebHeader />
      <main className="checkout-page">
        <section className="checkout-panel glass-panel">
          <StatusPill label={copy.pill} tone="premium" />
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
        </section>
      </main>
      <WebFooter />
    </>
  );
}

const CHECKOUT_COPY: Record<
  SupportedLanguage,
  {
    body: string;
    change: string;
    emailSupport: string;
    note: string;
    oneTime: string;
    openAccount: string;
    pill: string;
    planBody: (billingCopy: string) => string;
    productBody: (description: string) => string;
    redeemPass: string;
    reviewTitle: (label: string) => string;
    selected: string;
    steps: Array<{ body: string; label: string; title: string }>;
    subscription: string;
    supportSubject: string;
    title: string;
  }
> = {
  en: {
    body: 'Choose a subscription, Day Pass, or one-time report from pricing, then keep that access tied to the right account.',
    change: 'Change selection',
    emailSupport: 'Email support',
    note: 'Predicta keeps access tied to the right email first, so your Kundlis, reports, and passes do not drift across accounts.',
    oneTime: 'One-time access',
    openAccount: 'Open account settings',
    pill: 'Prepare access',
    planBody: billingCopy =>
      `${billingCopy} Use the same account you want tied to your ongoing Predicta guidance.`,
    productBody: description =>
      `${description} Keep this selection tied to the account that will hold the related Kundli and report history.`,
    redeemPass: 'Redeem private pass',
    reviewTitle: label => `Review access for ${label}`,
    selected: 'Selected',
    steps: [
      {
        body: 'Sign in with the email you want tied to your Kundlis, reports, and future restore.',
        label: '1',
        title: 'Use the right account',
      },
      {
        body: 'Keep one clear selection so Predicta does not mix a report purchase path with guest or family access.',
        label: '2',
        title: 'Confirm the access path',
      },
      {
        body: 'If you already have a private invite, redeem it first. Otherwise continue from your account or contact support for help.',
        label: '3',
        title: 'Finish from account continuity',
      },
    ],
    subscription: 'Subscription access',
    supportSubject: 'Predicta access review',
    title: 'Prepare your Predicta access',
  },
  hi: {
    body: 'मूल्य पेज से सदस्यता, डे पास या एक बार वाली रिपोर्ट चुनें, फिर उस प्रवेश को सही खाते से जोड़कर रखें.',
    change: 'चयन बदलें',
    emailSupport: 'सपोर्ट को ईमेल करें',
    note: 'प्रेडिक्टा पहले प्रवेश को सही ईमेल से जोड़ती है ताकि आपकी कुंडली, रिपोर्ट और पास अलग-अलग खातों में न बिखरें.',
    oneTime: 'एक बार का प्रवेश',
    openAccount: 'खाता सेटिंग खोलें',
    pill: 'प्रवेश तैयार करें',
    planBody: billingCopy =>
      `${billingCopy} वही खाता रखें जिसे आप लगातार प्रेडिक्टा मार्गदर्शन से जोड़ना चाहते हैं.`,
    productBody: description =>
      `${description} इस चयन को उसी खाते से जोड़कर रखें जिसमें संबंधित कुंडली और रिपोर्ट इतिहास रहेगा.`,
    redeemPass: 'निजी पास उपयोग करें',
    reviewTitle: label => `${label} के लिए प्रवेश देखें`,
    selected: 'चुना गया',
    steps: [
      {
        body: 'उसी ईमेल से साइन इन करें जिसे आप अपनी कुंडली, रिपोर्ट और बाद की रिकवरी से जोड़ना चाहते हैं.',
        label: '1',
        title: 'सही खाता चुनें',
      },
      {
        body: 'एक साफ चयन रखें ताकि प्रेडिक्टा रिपोर्ट खरीद रास्ते को गेस्ट या परिवार प्रवेश के साथ न मिलाए.',
        label: '2',
        title: 'प्रवेश रास्ता तय करें',
      },
      {
        body: 'अगर आपके पास निजी निमंत्रण है तो पहले उसे उपयोग करें. अन्यथा खाते से आगे बढ़ें या मदद के लिए सपोर्ट से संपर्क करें.',
        label: '3',
        title: 'खाता निरंतरता से पूरा करें',
      },
    ],
    subscription: 'सदस्यता प्रवेश',
    supportSubject: 'Predicta access review',
    title: 'अपना प्रेडिक्टा प्रवेश तैयार करें',
  },
  gu: {
    body: 'કિંમત પેજ પરથી સભ્યપદ, ડે પાસ અથવા એક વખતનો રિપોર્ટ પસંદ કરો, પછી તે પ્રવેશને સાચા ખાતા સાથે જોડીને રાખો.',
    change: 'પસંદગી બદલો',
    emailSupport: 'સપોર્ટને ઇમેઇલ કરો',
    note: 'પ્રેડિક્ટા પહેલે પ્રવેશને સાચા ઇમેઇલ સાથે જોડે છે જેથી તમારી કુંડળી, રિપોર્ટ અને પાસ જુદા ખાતાઓમાં ન ફેલાય.',
    oneTime: 'એક વખતનો પ્રવેશ',
    openAccount: 'ખાતા સેટિંગ્સ ખોલો',
    pill: 'પ્રવેશ તૈયાર કરો',
    planBody: billingCopy =>
      `${billingCopy} એ જ ખાતું રાખો જેને તમે સતત પ્રેડિક્ટા માર્ગદર્શન સાથે જોડવા માંગો છો.`,
    productBody: description =>
      `${description} આ પસંદગીને એ જ ખાતા સાથે જોડેલી રાખો જેમાં સંબંધિત કુંડળી અને રિપોર્ટ ઇતિહાસ રહેશે.`,
    redeemPass: 'ખાનગી પાસ ઉપયોગ કરો',
    reviewTitle: label => `${label} માટે પ્રવેશ જુઓ`,
    selected: 'પસંદ કરેલું',
    steps: [
      {
        body: 'એ જ ઇમેઇલથી સાઇન ઇન કરો જેને તમે તમારી કુંડળી, રિપોર્ટ અને પછીની પુનઃસ્થાપન સાથે જોડવા માંગો છો.',
        label: '1',
        title: 'સાચું ખાતું વાપરો',
      },
      {
        body: 'એક સ્પષ્ટ પસંદગી રાખો જેથી પ્રેડિક્ટા રિપોર્ટ ખરીદીના રસ્તાને ગેસ્ટ અથવા પરિવાર પ્રવેશ સાથે ન ભેળવે.',
        label: '2',
        title: 'પ્રવેશનો રસ્તો નક્કી કરો',
      },
      {
        body: 'જો તમારી પાસે ખાનગી આમંત્રણ છે તો પહેલે તે રિડીમ કરો. નહીંતર તમારા ખાતાથી આગળ વધો અથવા મદદ માટે સપોર્ટનો સંપર્ક કરો.',
        label: '3',
        title: 'ખાતાની સતતતા સાથે પૂર્ણ કરો',
      },
    ],
    subscription: 'સભ્યપદ પ્રવેશ',
    supportSubject: 'Predicta access review',
    title: 'તમારો પ્રેડિક્ટા પ્રવેશ તૈયાર કરો',
  },
};

function getLocalizedAccessLabel(
  label: string,
  productId: string | undefined,
  language: SupportedLanguage,
): string {
  if (language === 'en' || !productId) {
    return label;
  }

  const map: Record<string, Record<Exclude<SupportedLanguage, 'en'>, string>> = {
    pridicta_day_pass_24h: {
      gu: 'ડે પાસ',
      hi: 'डे पास',
    },
    pridicta_five_questions: {
      gu: 'પાંચ પ્રશ્ન',
      hi: 'पांच प्रश्न',
    },
    pridicta_premium_pdf: {
      gu: 'પ્રીમિયમ પીડીએફ',
      hi: 'प्रीमियम पीडीएफ',
    },
    pridicta_detailed_kundli_report: {
      gu: 'વિગતવાર કુંડળી રિપોર્ટ',
      hi: 'विस्तृत कुंडली रिपोर्ट',
    },
    pridicta_marriage_compatibility_report: {
      gu: 'કમ્પેટિબિલિટી રિપોર્ટ',
      hi: 'कम्पैटिबिलिटी रिपोर्ट',
    },
    pridicta_premium_weekly: {
      gu: 'સાપ્તાહિક',
      hi: 'साप्ताहिक',
    },
    pridicta_premium_monthly: {
      gu: 'માસિક',
      hi: 'मासिक',
    },
    pridicta_premium_quarterly: {
      gu: 'ત્રિમાસિક',
      hi: 'त्रैमासिक',
    },
    pridicta_premium_yearly_founder: {
      gu: 'વાર્ષિક',
      hi: 'वार्षिक',
    },
  };

  return map[productId]?.[language] ?? label;
}
