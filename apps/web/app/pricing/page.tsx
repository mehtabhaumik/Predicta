'use client';

import { getNativeCopy } from '@pridicta/config';
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
    back: getNativeCopy("native.apps.web.app.pricing.page.tsx.c6be9647f0"),
    body: getNativeCopy("native.apps.web.app.pricing.page.tsx.ec1deae9ad"),
    choiceCards: [
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.8fad7b9aed"),
        cta: getNativeCopy("native.apps.web.app.pricing.page.tsx.83c6b66c84"),
        href: '#subscriptions',
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.597355aef3"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.265ca6864f"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.423e6dc7dd"),
        cta: getNativeCopy("native.apps.web.app.pricing.page.tsx.37bac83a8d"),
        href: '#one-time',
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.a47be277a9"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.93ce110a50"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.8429bea137"),
        cta: getNativeCopy("native.apps.web.app.pricing.page.tsx.2041cc8192"),
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.be935cf75e"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.0d654f407f"),
      },
    ],
    choiceEyebrow: getNativeCopy("native.apps.web.app.pricing.page.tsx.f3d6aa53a8"),
    choiceTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.03cce45a41"),
    differenceCards: [
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.c497d6b9a2"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.835e9402fb"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.f1e747ac96"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.b552bca1c9"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.0465e2864e"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.75bd25236b"),
      },
    ],
    differenceEyebrow: getNativeCopy("native.apps.web.app.pricing.page.tsx.f424566b28"),
    differenceTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.d6615c7997"),
    legalBody:
      getNativeCopy("native.apps.web.app.pricing.page.tsx.dc28bded86"),
    legalTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.fc0240f0f8"),
    oneTimeBody: getNativeCopy("native.apps.web.app.pricing.page.tsx.c7af4104d2"),
    oneTimeTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.2027a14703"),
    pill: getNativeCopy("native.apps.web.app.pricing.page.tsx.20a0f0e3e8"),
    planFeatures: [
      getNativeCopy("native.apps.web.app.pricing.page.tsx.49d897ef5d"),
      getNativeCopy("native.apps.web.app.pricing.page.tsx.4a408981da"),
      getNativeCopy("native.apps.web.app.pricing.page.tsx.8fc7dae347"),
      getNativeCopy("native.apps.web.app.pricing.page.tsx.ae3bbfbce3"),
    ],
    readPolicies: getNativeCopy("native.apps.web.app.pricing.page.tsx.e9003ca9b9"),
    selectPrefix: getNativeCopy("native.apps.web.app.pricing.page.tsx.d9b97570b7"),
    storyBody: getNativeCopy("native.apps.web.app.pricing.page.tsx.6fc238a336"),
    storyEyebrow: getNativeCopy("native.apps.web.app.pricing.page.tsx.fd027a6cab"),
    storyTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.81e2a0d0b2"),
    title: getNativeCopy("native.apps.web.app.pricing.page.tsx.20eb2b83b9"),
  },
  gu: {
    back: getNativeCopy("native.apps.web.app.pricing.page.tsx.1ccba119f2"),
    body: getNativeCopy("native.apps.web.app.pricing.page.tsx.e7c287823b"),
    choiceCards: [
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.1827c232f8"),
        cta: getNativeCopy("native.apps.web.app.pricing.page.tsx.d20d4680a8"),
        href: '#subscriptions',
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.da938ec36c"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.5ba388bc38"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.840a3e434e"),
        cta: getNativeCopy("native.apps.web.app.pricing.page.tsx.72eedd6de0"),
        href: '#one-time',
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.71ad46e28e"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.ab3cad5253"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.295b03fa35"),
        cta: getNativeCopy("native.apps.web.app.pricing.page.tsx.76b757b9d9"),
        href: '/checkout?productId=pridicta_day_pass_24h',
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.8a2a6fe085"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.d0390e6dac"),
      },
    ],
    choiceEyebrow: getNativeCopy("native.apps.web.app.pricing.page.tsx.a857a20139"),
    choiceTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.524542179c"),
    differenceCards: [
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.a9eda8b937"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.11494ad2d1"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.2097251d20"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.81ee678383"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.4185f2e0b6"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.333023f9c7"),
      },
    ],
    differenceEyebrow: getNativeCopy("native.apps.web.app.pricing.page.tsx.6bb307aeb0"),
    differenceTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.1ea5102755"),
    legalBody:
      getNativeCopy("native.apps.web.app.pricing.page.tsx.206d854986"),
    legalTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.1fe53c0e5d"),
    oneTimeBody: getNativeCopy("native.apps.web.app.pricing.page.tsx.c58000dd6e"),
    oneTimeTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.06a467df6d"),
    pill: getNativeCopy("native.apps.web.app.pricing.page.tsx.0e01479583"),
    planFeatures: [
      getNativeCopy("native.apps.web.app.pricing.page.tsx.93c2ec5a8d"),
      getNativeCopy("native.apps.web.app.pricing.page.tsx.210f9a95f1"),
      getNativeCopy("native.apps.web.app.pricing.page.tsx.af7515e4f9"),
      getNativeCopy("native.apps.web.app.pricing.page.tsx.59050e1152"),
    ],
    readPolicies: getNativeCopy("native.apps.web.app.pricing.page.tsx.60f826fa78"),
    selectPrefix: getNativeCopy("native.apps.web.app.pricing.page.tsx.1619f196ef"),
    storyBody: getNativeCopy("native.apps.web.app.pricing.page.tsx.e722c2451d"),
    storyEyebrow: getNativeCopy("native.apps.web.app.pricing.page.tsx.86ff854935"),
    storyTitle: getNativeCopy("native.apps.web.app.pricing.page.tsx.84aafda299"),
    title: getNativeCopy("native.apps.web.app.pricing.page.tsx.6a29b2f183"),
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
      WEEKLY: { billingCopy: getNativeCopy("native.apps.web.app.pricing.page.tsx.964f5e544f"), label: getNativeCopy("native.apps.web.app.pricing.page.tsx.47d5bb4f4c") },
      MONTHLY: { billingCopy: getNativeCopy("native.apps.web.app.pricing.page.tsx.fe11c7096b"), label: getNativeCopy("native.apps.web.app.pricing.page.tsx.57dc4243a2") },
      QUARTERLY: {
        billingCopy: getNativeCopy("native.apps.web.app.pricing.page.tsx.40c8c7b448"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.d64cb5865a"),
        monthlyEquivalent: getNativeCopy("native.apps.web.app.pricing.page.tsx.31d1f61931"),
      },
      YEARLY: {
        badge: getNativeCopy("native.apps.web.app.pricing.page.tsx.da1fc8f483"),
        billingCopy: getNativeCopy("native.apps.web.app.pricing.page.tsx.d22bdbff0b"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.9b81fb55ef"),
        monthlyEquivalent: getNativeCopy("native.apps.web.app.pricing.page.tsx.31d1f61931"),
      },
    };

    return map[id] ?? { billingCopy: '', label: id };
  }

  if (language === 'gu') {
    const map: Record<string, { badge?: string; billingCopy: string; label: string; monthlyEquivalent?: string }> = {
      WEEKLY: { billingCopy: getNativeCopy("native.apps.web.app.pricing.page.tsx.dae0aacb66"), label: getNativeCopy("native.apps.web.app.pricing.page.tsx.146383f56e") },
      MONTHLY: { billingCopy: getNativeCopy("native.apps.web.app.pricing.page.tsx.072202297b"), label: getNativeCopy("native.apps.web.app.pricing.page.tsx.2681c30f73") },
      QUARTERLY: {
        billingCopy: getNativeCopy("native.apps.web.app.pricing.page.tsx.2060330fec"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.2fd463f085"),
        monthlyEquivalent: getNativeCopy("native.apps.web.app.pricing.page.tsx.dc43c28d53"),
      },
      YEARLY: {
        badge: getNativeCopy("native.apps.web.app.pricing.page.tsx.caf0d6ca05"),
        billingCopy: getNativeCopy("native.apps.web.app.pricing.page.tsx.48d22808b0"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.5a1cce3f9b"),
        monthlyEquivalent: getNativeCopy("native.apps.web.app.pricing.page.tsx.dc43c28d53"),
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
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.132402e0c4"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.ec32113b0b"),
      },
      DETAILED_KUNDLI_REPORT: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.2b9fe8fbd2"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.8106a328fe"),
      },
      FIVE_QUESTIONS: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.2dcc46afb6"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.e3687de986"),
      },
      JAIMINI_REPORT: {
        description: getNativeCopy('report.jaimini.purchaseHint.hi'),
        label: 'Jaimini Report Credit',
      },
      MARRIAGE_COMPATIBILITY_REPORT: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.6c2a86e4af"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.41971490fb"),
      },
      PREMIUM_PDF: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.dd6621dfa2"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.31641beaac"),
      },
    };

    return map[id] ?? { description: '', label: id };
  }

  if (language === 'gu') {
    const map: Record<string, { description: string; label: string }> = {
      DAY_PASS: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.15479dc7d6"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.039eabd9e9"),
      },
      DETAILED_KUNDLI_REPORT: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.68ec0fea87"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.2836b2970a"),
      },
      FIVE_QUESTIONS: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.59dd1df18c"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.74e3e3be71"),
      },
      JAIMINI_REPORT: {
        description: getNativeCopy('report.jaimini.purchaseHint.gu'),
        label: 'Jaimini Report Credit',
      },
      MARRIAGE_COMPATIBILITY_REPORT: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.5ba901e904"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.ef78467017"),
      },
      PREMIUM_PDF: {
        description: getNativeCopy("native.apps.web.app.pricing.page.tsx.72d90e9880"),
        label: getNativeCopy("native.apps.web.app.pricing.page.tsx.d7ca86dc4e"),
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
              : id === 'JAIMINI_REPORT'
                ? 'Unlock one premium-depth Jaimini destiny report for the active Kundli.'
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
              : id === 'JAIMINI_REPORT'
                ? 'Jaimini Report Credit'
                : 'Marriage Compatibility Report',
  };
}

function getLocalizedPremiumFeatureStory(
  language: SupportedLanguage,
): Array<{ body: string; title: string }> {
  if (language === 'hi') {
    return [
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.71e5b79033"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.2579e0387b"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.1ab7856c18"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.a8de3e503c"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.35248cb9ba"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.dc49ce1d21"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.44b4290b1d"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.08ee4f4e5a"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.00933ab14e"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.df5538cc3e"),
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.6246178a2a"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.70c99740d9"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.18b106ea08"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.f1bbb59092"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.8719c9e199"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.dde3029f16"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.11392f9f8a"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.31b3b61838"),
      },
      {
        body: getNativeCopy("native.apps.web.app.pricing.page.tsx.068ec4ecda"),
        title: getNativeCopy("native.apps.web.app.pricing.page.tsx.34ba619053"),
      },
    ];
  }

  return [...PREMIUM_FEATURE_STORY];
}
