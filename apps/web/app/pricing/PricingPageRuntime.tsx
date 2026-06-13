'use client';

import {
  getMonetizationProductCopy,
  getPricingPageCopy,
  getPricingPagePlanCopy,
  getPricingPagePremiumFeatureStory,
} from '@pridicta/config';
import {
  getOneTimeProducts,
  getPricingPlans,
} from '@pridicta/config/pricing';
import type { SupportedLanguage } from '@pridicta/types';
import Link from 'next/link';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { LandingLightFooter } from '../../components/LandingLightFooter';
import { LandingLightHeader } from '../../components/LandingLightHeader';
import { useLanguagePreference } from '../../lib/language-preference';

export default function PricingPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getPricingPageCopy(language);
  const plans = getPricingPlans();
  const products = getOneTimeProducts();

  return (
    <>
      <LandingLightHeader />
      <main className="pricing-page">
        <div className="page-heading pricing-heading">
          <StatusPill label={copy.pill} tone="quiet" />
          <h1 className="gradient-text">{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="pricing-heading-actions">
            <Link className="button" href="/checkout?productId=pridicta_10_questions">
              {copy.selectPrefix}{' '}
              {getLocalizedOneTimeProductCopy('AI_QUESTIONS_10', language).label}
            </Link>
            <Link className="button secondary" href="#one-time">
              {copy.oneTimeTitle}
            </Link>
          </div>
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
            {getPricingPagePremiumFeatureStory(language).map(feature => (
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
      <LandingLightFooter />
    </>
  );
}

function getLocalizedPlanCopy(
  id: string,
  language: SupportedLanguage,
) {
  return getPricingPagePlanCopy(id, language);
}

function getLocalizedOneTimeProductCopy(
  id: string,
  language: SupportedLanguage,
): { description: string; label: string } {
  return getMonetizationProductCopy(id, language);
}
