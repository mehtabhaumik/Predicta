import {
  PREMIUM_FEATURE_STORY,
  getDayPassProduct,
  getOneTimeProducts,
  getPricingPlans,
} from '@pridicta/config/pricing';
import Link from 'next/link';
import { Card } from '../../../components/Card';
import { StatusPill } from '../../../components/StatusPill';

export default function DashboardPremiumPage(): React.JSX.Element {
  const plans = getPricingPlans();
  const dayPass = getDayPassProduct();
  const products = getOneTimeProducts().filter(product =>
    ['PREMIUM_PDF', 'MARRIAGE_COMPATIBILITY_REPORT'].includes(product.id),
  );

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">Choose the next depth only when it helps.</h1>
        <details className="info-drawer">
          <summary>
            <span>How to choose</span>
            <strong>Open</strong>
          </summary>
          <p>
            Start free. Use a Day Pass when you want to test everything today.
            Choose a subscription for monthly guidance. Buy one report when one
            life question needs a polished PDF.
          </p>
        </details>
      </div>

      <section className="pricing-difference-panel glass-panel">
        <div>
          <div className="section-title">CHOOSE BY OUTCOME</div>
          <h2>Pick what you need, not the biggest plan.</h2>
        </div>
        <div className="pricing-difference-grid">
          <article>
            <span>Monthly guidance</span>
            <h3>I want Predicta with me every month.</h3>
            <p>Best for ongoing chat, timing windows, remedies, saved sessions, and family profiles.</p>
            <a className="button secondary" href="#subscriptions">
              See subscriptions
            </a>
          </article>
          <article>
            <span>One prepared answer</span>
            <h3>I need one polished report.</h3>
            <p>Best for Kundli, career, wealth, marriage, compatibility, Sade Sati, or remedies.</p>
            <a className="button secondary" href="#one-time">
              Choose one report
            </a>
          </article>
          <article>
            <span>Trial depth</span>
            <h3>I want to test Premium today.</h3>
            <p>Best for friends and family who want full depth for 24 hours before deciding.</p>
            <Link
              className="button secondary"
              href={`/checkout?productId=${encodeURIComponent(dayPass.productId)}`}
            >
              Try Day Pass
            </Link>
          </article>
        </div>
      </section>

      <section className="premium-feature-story glass-panel">
        <div>
          <div className="section-title">WHAT CHANGES</div>
          <h2>Premium gives more preparation, timing, memory, and proof.</h2>
          <details className="info-drawer">
            <summary>
              <span>What changes after free?</span>
              <strong>Open</strong>
            </summary>
            <p>
              Free stays useful. Premium is for deeper synthesis, monthly
              windows, family context, detailed PDFs, and longer guided
              conversations.
            </p>
          </details>
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

      <div className="pricing-grid" id="subscriptions">
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
              <Link
                className="button secondary"
                href={`/checkout?productId=${encodeURIComponent(plan.productId)}`}
              >
                Choose {plan.label}
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <section className="one-time-section" id="one-time">
        <div>
          <h2>Not ready for a subscription?</h2>
          <p>{dayPass.description}</p>
          <Link
            className="button"
            href={`/checkout?productId=${encodeURIComponent(dayPass.productId)}`}
          >
            {dayPass.label} - {dayPass.displayPrice}
          </Link>
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
                  Choose {product.label}
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </section>
  );
}
