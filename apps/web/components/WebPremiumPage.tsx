'use client';

import { getMonetizationProductCopy, getNativeCopy } from '@pridicta/config';
import {
  PREMIUM_FEATURE_STORY,
  getDayPassProduct,
  getOneTimeProducts,
  getPricingPlans,
} from '@pridicta/config/pricing';
import type { SupportedLanguage } from '@pridicta/types';
import Link from 'next/link';
import { Card } from './Card';
import { StatusPill } from './StatusPill';
import { useLanguagePreference } from '../lib/language-preference';

export function WebPremiumPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = PREMIUM_PAGE_COPY[language] ?? PREMIUM_PAGE_COPY.en;
  const plans = getPricingPlans();
  const dayPass = getDayPassProduct();
  const products = getOneTimeProducts().filter(product =>
    [
      'AI_QUESTIONS_10',
      'AI_QUESTIONS_25',
      'REPORT_SINGLE',
      'REPORT_BUNDLE',
      'JAIMINI_REPORT',
      'MARRIAGE_COMPATIBILITY_REPORT',
    ].includes(product.id),
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
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.393e08ea2f"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.475ac9df85"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.15cae29ede"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.fd641e3266"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.366e9e6e0b"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.7e54da53ba"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.aa01b42dec"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.630c2bd5be"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.3149dca624"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.952ae20151"),
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.8a66c368a5"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.eb88453a93"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.4abaa377f9"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.59424338c5"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.48336b64ea"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.5d259cf525"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.9f94102175"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.a2dcade661"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.9ca43b0fda"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.e2d2cbb1d2"),
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
  const copy = getMonetizationProductCopy(productId, language);
  return copy.description ? copy : getMonetizationProductCopy('PREMIUM_PDF', language);
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
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.db904975ab"),
        cta: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.83c6b66c84"),
        href: '#subscriptions',
        label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.c342cc070d"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.20f2c97d55"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.d8d766cc24"),
        cta: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.37bac83a8d"),
        href: '#one-time',
        label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.33db074726"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.00de0b3230"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.80a2b585ab"),
        cta: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.bfe67ba47e"),
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.2d093df33b"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.4cae53716a"),
      },
    ],
    choiceEyebrow: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.f3d6aa53a8"),
    choiceTitle: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.67b420336f"),
    choosePrefix: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.d9b97570b7"),
    dayPassCta: (label, price) => `${label} · ${price}`,
    drawerAction: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.901879c422"),
    drawerBody:
      getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.c5b44c78d7"),
    drawerEyebrow: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.8bc285214f"),
    oneTimeBody:
      getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.c9abc115a9"),
    oneTimeTitle: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.633b350da2"),
    pill: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.210e0e04a6"),
    storyBody:
      getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.673bb905a9"),
    storyEyebrow: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.f424566b28"),
    storyTitle: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.4d739608fa"),
    title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.0ac0f9839d"),
  },
  gu: {
    choiceCards: [
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.5aa8285438"),
        cta: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.d20d4680a8"),
        href: '#subscriptions',
        label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.4b39572687"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.6f99fdefc9"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.226f444f6f"),
        cta: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.72eedd6de0"),
        href: '#one-time',
        label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.9a4076573b"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.4e43b0f16f"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.30072351a5"),
        cta: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.95ea9365f4"),
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.37c8856e06"),
        title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.64cc31b4a0"),
      },
    ],
    choiceEyebrow: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.6fba8c84e7"),
    choiceTitle: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.917fc87109"),
    choosePrefix: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.1619f196ef"),
    dayPassCta: (label, price) => `${label} · ${price}`,
    drawerAction: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.e0185a82d6"),
    drawerBody:
      getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.509da289a6"),
    drawerEyebrow: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.af1eea1bb8"),
    oneTimeBody:
      getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.19e7ee6f26"),
    oneTimeTitle: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.226398a7ac"),
    pill: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.61effb6106"),
    storyBody:
      getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.365e494df3"),
    storyEyebrow: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.6bb307aeb0"),
    storyTitle: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.9d176377f3"),
    title: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.f24b4d18e0"),
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
      billingCopy: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.f4b33f844d"),
      label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.47d5bb4f4c"),
    },
    MONTHLY: {
      badge: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.9b310aebb3"),
      billingCopy: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.3d00426e52"),
      label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.57dc4243a2"),
    },
    QUARTERLY: {
      badge: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.2d3e3e05c3"),
      billingCopy: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.94d6a51330"),
      label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.d64cb5865a"),
    },
    YEARLY: {
      badge: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.35e1534f49"),
      billingCopy: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.055d2ae6bf"),
      label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.9b81fb55ef"),
      monthlyEquivalent: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.01b6dcd6ec"),
    },
  },
  gu: {
    WEEKLY: {
      billingCopy: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.7c822ac7f9"),
      label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.146383f56e"),
    },
    MONTHLY: {
      badge: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.55becf64b1"),
      billingCopy: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.5ae853ab7b"),
      label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.2681c30f73"),
    },
    QUARTERLY: {
      badge: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.1a4c157aef"),
      billingCopy: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.1873c72834"),
      label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.2fd463f085"),
    },
    YEARLY: {
      badge: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.fa5b15d9ec"),
      billingCopy: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.ec028dfa86"),
      label: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.5a1cce3f9b"),
      monthlyEquivalent: getNativeCopy("native.apps.web.app.dashboard.premium.page.tsx.cbce027d33"),
    },
  },
};
