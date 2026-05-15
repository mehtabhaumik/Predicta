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
    note: 'Private testers can use a guest pass for now. Paid checkout will open when payment access is ready.',
    oneTime: 'One-time access',
    pill: 'Choose access',
    selected: 'Selected',
    signIn: 'Sign in before purchase',
    subscription: 'Subscription access',
    title: 'Choose your Predicta access',
  },
  hi: {
    body: 'Pricing से subscription, Day Pass या one-time report चुनें.',
    change: 'चयन बदलें',
    note: 'Private testers अभी guest pass उपयोग कर सकते हैं. Paid checkout payment ready होने पर खुलेगा.',
    oneTime: 'एक बार का access',
    pill: 'Access चुनें',
    selected: 'चुना गया',
    signIn: 'खरीदारी से पहले sign in करें',
    subscription: 'Subscription access',
    title: 'अपना Predicta access चुनें',
  },
  gu: {
    body: 'Pricing માંથી subscription, Day Pass અથવા one-time report પસંદ કરો.',
    change: 'પસંદગી બદલો',
    note: 'Private testers હમણાં guest pass ઉપયોગ કરી શકે છે. Paid checkout payment ready થયા પછી ખુલશે.',
    oneTime: 'એક વારનો access',
    pill: 'Access પસંદ કરો',
    selected: 'પસંદ કરેલું',
    signIn: 'ખરીદી પહેલાં sign in કરો',
    subscription: 'Subscription access',
    title: 'તમારો Predicta access પસંદ કરો',
  },
};
