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
  const copy = checkoutCopy[language] ?? checkoutCopy.en;
  const productId = searchParams.get('productId') ?? undefined;
  const plans = getPricingPlans();
  const products = getOneTimeProducts();
  const selectedPlan = plans.find(plan => plan.productId === productId);
  const selectedProduct = products.find(product => product.productId === productId);
  const selected = selectedPlan ?? selectedProduct;

  return (
    <>
      <WebHeader />
      <main className="checkout-page">
        <section className="checkout-panel glass-panel">
          <StatusPill label={copy.pill} tone="premium" />
          <h1>{selected ? selected.label : copy.title}</h1>
          <p>
            {selected
              ? selectedPlan
                ? selectedPlan.billingCopy
                : selectedProduct?.description
              : copy.body}
          </p>
          {selected ? (
            <div className="checkout-summary">
              <span>{copy.selected}</span>
              <strong>{selected.displayPrice}</strong>
              <small>{selectedPlan ? copy.subscription : copy.oneTime}</small>
            </div>
          ) : null}
          <div className="checkout-actions">
            <Link className="button" href="/dashboard/settings">
              {copy.signIn}
            </Link>
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
  return (
    <>
      <WebHeader />
      <main className="checkout-page">
        <section className="checkout-panel glass-panel">
          <StatusPill label="Choose access" tone="premium" />
          <h1>Choose your Predicta access</h1>
          <p>Preparing your selected access option.</p>
        </section>
      </main>
      <WebFooter />
    </>
  );
}

const checkoutCopy: Record<
  SupportedLanguage,
  {
    body: string;
    change: string;
    note: string;
    oneTime: string;
    pill: string;
    selected: string;
    signIn: string;
    subscription: string;
    title: string;
  }
> = {
  en: {
    body: 'Select a subscription, Day Pass, or one-time report from pricing.',
    change: 'Change selection',
    note: 'Friends and family can use a guest pass for now. Paid checkout will open when purchases are ready.',
    oneTime: 'One-time access',
    pill: 'Choose access',
    selected: 'Selected',
    signIn: 'Sign in before purchase',
    subscription: 'Subscription access',
    title: 'Choose your Predicta access',
  },
  hi: {
    body: 'मूल्य पेज से सदस्यता, डे पास या एक बार वाली रिपोर्ट चुनें.',
    change: 'चयन बदलें',
    note: 'दोस्त और परिवार अभी अतिथि पास उपयोग कर सकते हैं. खरीदारी शुरू होने पर भुगतान पेज खुलेगा.',
    oneTime: 'एक बार का प्रवेश',
    pill: 'प्रवेश चुनें',
    selected: 'चुना गया',
    signIn: 'खरीदारी से पहले साइन इन करें',
    subscription: 'सदस्यता प्रवेश',
    title: 'अपना Predicta प्रवेश चुनें',
  },
  gu: {
    body: 'કિંમત પેજમાંથી સભ્યપદ, ડે પાસ અથવા એક વખતનો રિપોર્ટ પસંદ કરો.',
    change: 'પસંદગી બદલો',
    note: 'મિત્રો અને પરિવાર અત્યારે મહેમાન પાસ ઉપયોગ કરી શકે છે. ખરીદી શરૂ થયા પછી ચુકવણી પેજ ખુલશે.',
    oneTime: 'એક વખતનો પ્રવેશ',
    pill: 'પ્રવેશ પસંદ કરો',
    selected: 'પસંદ કરેલું',
    signIn: 'ખરીદી પહેલાં સાઇન ઇન કરો',
    subscription: 'સભ્યપદ પ્રવેશ',
    title: 'તમારો Predicta પ્રવેશ પસંદ કરો',
  },
};
