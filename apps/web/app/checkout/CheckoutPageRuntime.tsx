'use client';

import {
  formatNativeCopy,
  getMonetizationProductCopy,
  getMonetizationReportRequirementCopy,
  getNativeCopy,
} from '@pridicta/config';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import {
  getOneTimeProducts,
  getPricingPlans,
} from '@pridicta/config/pricing';
import {
  createPaymentWorkflowIntent,
  transitionPaymentWorkflowIntent,
  type PaymentWorkflowIntent,
} from '@pridicta/monetization';
import type { SupportedLanguage } from '@pridicta/types';
import { StatusPill } from '../../components/StatusPill';
import { LandingLightFooter } from '../../components/LandingLightFooter';
import { LandingLightHeader } from '../../components/LandingLightHeader';
import { useLanguagePreference } from '../../lib/language-preference';

const SUPPORT_EMAIL = 'support@predicta.app';
const PAYMENT_INTENT_STORAGE_KEY = 'predicta.payment.intent.v1';

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
  const plans = useMemo(() => getPricingPlans(), []);
  const products = useMemo(() => getOneTimeProducts(), []);
  const selectedPlan = useMemo(
    () => plans.find(plan => plan.productId === productId),
    [plans, productId],
  );
  const selectedProduct = useMemo(
    () => products.find(product => product.productId === productId),
    [products, productId],
  );
  const selected = selectedPlan ?? selectedProduct;
  const gatewayReady = process.env.NEXT_PUBLIC_PREDICTA_RAZORPAY_ENABLED === 'true';
  const paymentIntent = useMemo<PaymentWorkflowIntent | undefined>(() => {
    if (!selected) {
      return undefined;
    }

    return createPaymentWorkflowIntent({
      amountInr: selected.priceInr,
      kind: selectedPlan ? 'SUBSCRIPTION' : 'ONE_TIME',
      period: selectedPlan?.id,
      productId: selected.productId,
      productType: selectedProduct?.id,
      state: gatewayReady ? 'gateway_ready' : 'gateway_disabled',
    });
  }, [gatewayReady, selected, selectedPlan, selectedProduct]);
  const [visibleIntent, setVisibleIntent] = useState(paymentIntent);
  const selectedLabel = selected
    ? getLocalizedAccessLabel(selected.label, selected.productId, language)
    : undefined;
  const supportHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
    selectedLabel ? `${copy.supportSubject}: ${selectedLabel}` : copy.supportSubject,
  )}&body=${encodeURIComponent(
    visibleIntent
      ? `${copy.supportBody}\n\nPayment intent: ${visibleIntent.id}\nProduct: ${visibleIntent.productId}\nStatus: ${visibleIntent.state}`
      : copy.supportBody,
  )}`;

  useEffect(() => {
    setVisibleIntent(paymentIntent);
  }, [paymentIntent]);

  useEffect(() => {
    if (!visibleIntent) {
      return;
    }

    try {
      window.localStorage?.setItem(
        PAYMENT_INTENT_STORAGE_KEY,
        JSON.stringify(visibleIntent),
      );
    } catch {
      // Some embedded browsers disable storage; checkout must still be safe.
    }
  }, [visibleIntent]);

  function requestManualSupport() {
    if (!visibleIntent) {
      return;
    }

    setVisibleIntent(
      transitionPaymentWorkflowIntent(visibleIntent, {
        state: 'manual_support_requested',
        supportRequestedAt: new Date().toISOString(),
      }),
    );
  }

  return (
    <>
      <LandingLightHeader />
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
              {selectedProduct ? (
                <p>{getProductBankCheckoutCopy(selectedProduct.id, language)}</p>
              ) : null}
            </div>
          ) : null}

          {visibleIntent ? (
            <div
              className="checkout-gateway-card"
              data-payment-gateway-state={visibleIntent.state}
            >
              <span>{copy.gatewayStateLabel}</span>
              <h2>
                {gatewayReady
                  ? copy.gatewayReadyTitle
                  : copy.gatewayDisabledTitle}
              </h2>
              <p>
                {gatewayReady
                  ? copy.gatewayReadyBody
                  : copy.gatewayDisabledBody}
              </p>
              <small>
                {copy.intentStatus}: {visibleIntent.state}
              </small>
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
            <a
              className="button secondary"
              href={supportHref}
              onClick={requestManualSupport}
            >
              {copy.emailSupport}
            </a>
            <Link
              className="button secondary"
              href="/feedback?source=checkout&area=billing&from=payment-disabled"
              onClick={requestManualSupport}
            >
              {copy.supportTicket}
            </Link>
            <Link className="button secondary" href="/pricing">
              {copy.change}
            </Link>
          </div>
          <p className="checkout-note">{copy.note}</p>
        </section>
      </main>
      <LandingLightFooter />
    </>
  );
}

function CheckoutFallback(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = CHECKOUT_COPY[language] ?? CHECKOUT_COPY.en;

  return (
    <>
      <LandingLightHeader />
      <main className="checkout-page">
        <section className="checkout-panel glass-panel">
          <StatusPill label={copy.pill} tone="premium" />
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
        </section>
      </main>
      <LandingLightFooter />
    </>
  );
}

function getProductBankCheckoutCopy(
  productType: string,
  language: SupportedLanguage,
): string {
  switch (productType) {
    case 'AI_QUESTIONS_10':
      return getMonetizationReportRequirementCopy(
        'checkoutAiQuestions10',
        language,
      );
    case 'AI_QUESTIONS_25':
      return getMonetizationReportRequirementCopy(
        'checkoutAiQuestions25',
        language,
      );
    case 'AI_QUESTIONS_100':
      return getMonetizationReportRequirementCopy(
        'checkoutAiQuestions100',
        language,
      );
    case 'REPORT_SINGLE':
      return getMonetizationReportRequirementCopy(
        'checkoutReportSingle',
        language,
      );
    case 'REPORT_BUNDLE':
      return getMonetizationReportRequirementCopy(
        'checkoutReportBundle',
        language,
      );
    case 'PRECISION_READING':
      return getMonetizationReportRequirementCopy(
        'checkoutPrecisionReading',
        language,
      );
    case 'PRECISION_FOLLOW_UP_PACK':
      return getMonetizationReportRequirementCopy(
        'checkoutPrecisionFollowUpPack',
        language,
      );
    case 'DAY_PASS':
      return getMonetizationReportRequirementCopy('checkoutDayPass', language);
    case 'HUMAN_ASTROLOGER_REVIEW':
      return getMonetizationReportRequirementCopy(
        'checkoutHumanAstrologerReview',
        language,
      );
    default:
      return getMonetizationReportRequirementCopy(
        'checkoutVerifiedOnly',
        language,
      );
  }
}

const CHECKOUT_COPY: Record<
  SupportedLanguage,
  {
    body: string;
    change: string;
    emailSupport: string;
    gatewayDisabledBody: string;
    gatewayDisabledTitle: string;
    gatewayReadyBody: string;
    gatewayReadyTitle: string;
    gatewayStateLabel: string;
    intentStatus: string;
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
    supportBody: string;
    supportSubject: string;
    supportTicket: string;
    title: string;
  }
> = {
  en: {
    body: 'Choose a subscription, Day Pass, or one-time report from pricing, then keep that access tied to the right account.',
    change: 'Change selection',
    emailSupport: 'Email support',
    gatewayDisabledBody: getMonetizationReportRequirementCopy(
      'checkoutRazorpayDisabled',
      'en',
    ),
    gatewayDisabledTitle: 'Secure checkout is being connected',
    gatewayReadyBody:
      'This checkout contract is ready for Razorpay order creation, signature verification, retries, cancellation, and entitlement activation.',
    gatewayReadyTitle: 'Secure checkout ready',
    gatewayStateLabel: 'Gateway state',
    intentStatus: 'Payment status',
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
    supportBody:
      'Please help me complete Predicta access while secure checkout is being connected.',
    supportSubject: 'Predicta access review',
    supportTicket: 'Open support ticket',
    title: 'Prepare your Predicta access',
  },
  hi: {
    body: getNativeCopy("native.apps.web.app.checkout.page.tsx.d02d649ff9"),
    change: getNativeCopy("native.apps.web.app.checkout.page.tsx.df2ec9b391"),
    emailSupport: getNativeCopy("native.apps.web.app.checkout.page.tsx.a739cb4d32"),
    gatewayDisabledBody: getNativeCopy("native.apps.web.app.checkout.page.tsx.41f657f05a"),
    gatewayDisabledTitle: getNativeCopy("native.apps.web.app.checkout.page.tsx.c3500f68d0"),
    gatewayReadyBody: getNativeCopy("native.apps.web.app.checkout.page.tsx.30f93c5b81"),
    gatewayReadyTitle: getNativeCopy("native.apps.web.app.checkout.page.tsx.39b0466aac"),
    gatewayStateLabel: getNativeCopy("native.apps.web.app.checkout.page.tsx.76165de86f"),
    intentStatus: getNativeCopy("native.apps.web.app.checkout.page.tsx.381ad17fb4"),
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
    supportBody: getNativeCopy("native.apps.web.app.checkout.page.tsx.b2cc0a1a27"),
    supportSubject: getNativeCopy("native.apps.web.app.checkout.page.tsx.e95c68286c"),
    supportTicket: getNativeCopy("native.apps.web.app.checkout.page.tsx.5cf8f3b297"),
    title: getNativeCopy("native.apps.web.app.checkout.page.tsx.7d3065db46"),
  },
  gu: {
    body: getNativeCopy("native.apps.web.app.checkout.page.tsx.e4cafcc2bf"),
    change: getNativeCopy("native.apps.web.app.checkout.page.tsx.f056cefb0f"),
    emailSupport: getNativeCopy("native.apps.web.app.checkout.page.tsx.940fa58c03"),
    gatewayDisabledBody: getNativeCopy("native.apps.web.app.checkout.page.tsx.bde26162c6"),
    gatewayDisabledTitle: getNativeCopy("native.apps.web.app.checkout.page.tsx.3c08c719f0"),
    gatewayReadyBody: getNativeCopy("native.apps.web.app.checkout.page.tsx.6ac4c6f782"),
    gatewayReadyTitle: getNativeCopy("native.apps.web.app.checkout.page.tsx.a55f225edc"),
    gatewayStateLabel: getNativeCopy("native.apps.web.app.checkout.page.tsx.0c435a052d"),
    intentStatus: getNativeCopy("native.apps.web.app.checkout.page.tsx.5c0ea23fda"),
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
    supportBody: getNativeCopy("native.apps.web.app.checkout.page.tsx.b6773b8c13"),
    supportSubject: getNativeCopy("native.apps.web.app.checkout.page.tsx.2c8ddf450a"),
    supportTicket: getNativeCopy("native.apps.web.app.checkout.page.tsx.06aeb72d19"),
    title: getNativeCopy("native.apps.web.app.checkout.page.tsx.da63c0f6b1"),
  },
};

function getLocalizedAccessLabel(
  label: string,
  productId: string | undefined,
  language: SupportedLanguage,
): string {
  if (!productId) {
    return label;
  }

  const productType = mapCheckoutProductIdToProductType(productId);
  if (productType) {
    const productCopy = getMonetizationProductCopy(productType, language);
    return productCopy.label || label;
  }

  if (language === 'en') {
    return label;
  }

  const map: Record<string, Record<Exclude<SupportedLanguage, 'en'>, string>> = {
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

function mapCheckoutProductIdToProductType(productId: string): string | undefined {
  switch (productId) {
    case 'pridicta_day_pass_24h':
      return 'DAY_PASS';
    case 'pridicta_five_questions':
      return 'FIVE_QUESTIONS';
    case 'pridicta_human_astrologer_review':
      return 'HUMAN_ASTROLOGER_REVIEW';
    case 'pridicta_10_questions':
      return 'AI_QUESTIONS_10';
    case 'pridicta_25_questions':
      return 'AI_QUESTIONS_25';
    case 'pridicta_100_questions':
      return 'AI_QUESTIONS_100';
    case 'pridicta_premium_pdf':
      return 'PREMIUM_PDF';
    case 'pridicta_precision_reading':
      return 'PRECISION_READING';
    case 'pridicta_precision_follow_up_pack':
      return 'PRECISION_FOLLOW_UP_PACK';
    case 'pridicta_single_report':
      return 'REPORT_SINGLE';
    case 'pridicta_report_bundle':
      return 'REPORT_BUNDLE';
    case 'pridicta_detailed_kundli_report':
      return 'DETAILED_KUNDLI_REPORT';
    case 'pridicta_marriage_compatibility_report':
      return 'MARRIAGE_COMPATIBILITY_REPORT';
    default:
      return undefined;
  }
}
