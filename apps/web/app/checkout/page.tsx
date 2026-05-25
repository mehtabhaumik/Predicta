'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
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
    body: getNativeCopy("native.apps.web.app.checkout.page.tsx.d02d649ff9"),
    change: getNativeCopy("native.apps.web.app.checkout.page.tsx.df2ec9b391"),
    emailSupport: getNativeCopy("native.apps.web.app.checkout.page.tsx.a739cb4d32"),
    note: getNativeCopy("native.apps.web.app.checkout.page.tsx.81cb946fbb"),
    oneTime: getNativeCopy("native.apps.web.app.checkout.page.tsx.633b350da2"),
    openAccount: getNativeCopy("native.apps.web.app.checkout.page.tsx.7ab9674a9f"),
    pill: getNativeCopy("native.apps.web.app.checkout.page.tsx.ba9b006fa1"),
    planBody: billingCopy =>
      formatNativeCopy("native.apps.web.app.checkout.page.tsx.aa7e9c428f", [billingCopy]),
    productBody: description =>
      formatNativeCopy("native.apps.web.app.checkout.page.tsx.5a046dc018", [description]),
    redeemPass: getNativeCopy("native.apps.web.app.checkout.page.tsx.5a061d44a5"),
    reviewTitle: label => formatNativeCopy("native.apps.web.app.checkout.page.tsx.6139944ca0", [label]),
    selected: getNativeCopy("native.apps.web.app.checkout.page.tsx.0593802992"),
    steps: [
      {
        body: getNativeCopy("native.apps.web.app.checkout.page.tsx.a7e5a1e057"),
        label: '1',
        title: getNativeCopy("native.apps.web.app.checkout.page.tsx.42f1f3e3ee"),
      },
      {
        body: getNativeCopy("native.apps.web.app.checkout.page.tsx.a00e28e59c"),
        label: '2',
        title: getNativeCopy("native.apps.web.app.checkout.page.tsx.5e02f3f637"),
      },
      {
        body: getNativeCopy("native.apps.web.app.checkout.page.tsx.ccebc8e9b1"),
        label: '3',
        title: getNativeCopy("native.apps.web.app.checkout.page.tsx.f4e7896234"),
      },
    ],
    subscription: getNativeCopy("native.apps.web.app.checkout.page.tsx.1a2647f494"),
    supportSubject: 'Predicta access review',
    title: getNativeCopy("native.apps.web.app.checkout.page.tsx.7d3065db46"),
  },
  gu: {
    body: getNativeCopy("native.apps.web.app.checkout.page.tsx.e4cafcc2bf"),
    change: getNativeCopy("native.apps.web.app.checkout.page.tsx.f056cefb0f"),
    emailSupport: getNativeCopy("native.apps.web.app.checkout.page.tsx.940fa58c03"),
    note: getNativeCopy("native.apps.web.app.checkout.page.tsx.69b2b3be9b"),
    oneTime: getNativeCopy("native.apps.web.app.checkout.page.tsx.226398a7ac"),
    openAccount: getNativeCopy("native.apps.web.app.checkout.page.tsx.8ee7771be8"),
    pill: getNativeCopy("native.apps.web.app.checkout.page.tsx.52bc465b20"),
    planBody: billingCopy =>
      formatNativeCopy("native.apps.web.app.checkout.page.tsx.b94f395bd8", [billingCopy]),
    productBody: description =>
      formatNativeCopy("native.apps.web.app.checkout.page.tsx.10999e0021", [description]),
    redeemPass: getNativeCopy("native.apps.web.app.checkout.page.tsx.4351cd8e77"),
    reviewTitle: label => formatNativeCopy("native.apps.web.app.checkout.page.tsx.14943c66d0", [label]),
    selected: getNativeCopy("native.apps.web.app.checkout.page.tsx.14cd4f3b08"),
    steps: [
      {
        body: getNativeCopy("native.apps.web.app.checkout.page.tsx.4c9048569e"),
        label: '1',
        title: getNativeCopy("native.apps.web.app.checkout.page.tsx.00978c4325"),
      },
      {
        body: getNativeCopy("native.apps.web.app.checkout.page.tsx.292b902f4d"),
        label: '2',
        title: getNativeCopy("native.apps.web.app.checkout.page.tsx.9828d3d5c6"),
      },
      {
        body: getNativeCopy("native.apps.web.app.checkout.page.tsx.2ade3f7cdb"),
        label: '3',
        title: getNativeCopy("native.apps.web.app.checkout.page.tsx.b4baa199df"),
      },
    ],
    subscription: getNativeCopy("native.apps.web.app.checkout.page.tsx.4d8971912c"),
    supportSubject: 'Predicta access review',
    title: getNativeCopy("native.apps.web.app.checkout.page.tsx.da63c0f6b1"),
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
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.039eabd9e9"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.ec32113b0b"),
    },
    pridicta_five_questions: {
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.4c4ad26d1b"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.95856bffbb"),
    },
    pridicta_premium_pdf: {
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.d7ca86dc4e"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.31641beaac"),
    },
    pridicta_detailed_kundli_report: {
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.2836b2970a"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.8106a328fe"),
    },
    pridicta_marriage_compatibility_report: {
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.79ba9fc513"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.d8fb1adccb"),
    },
    pridicta_premium_weekly: {
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.146383f56e"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.47d5bb4f4c"),
    },
    pridicta_premium_monthly: {
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.2681c30f73"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.57dc4243a2"),
    },
    pridicta_premium_quarterly: {
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.2fd463f085"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.d64cb5865a"),
    },
    pridicta_premium_yearly_founder: {
      gu: getNativeCopy("native.apps.web.app.checkout.page.tsx.5a1cce3f9b"),
      hi: getNativeCopy("native.apps.web.app.checkout.page.tsx.9b81fb55ef"),
    },
  };

  return map[productId]?.[language] ?? label;
}
