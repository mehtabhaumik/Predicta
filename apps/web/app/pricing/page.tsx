import {
  PREMIUM_FEATURE_STORY,
  getOneTimeProducts,
  getPricingPlans,
} from '@pridicta/config/pricing';
import Link from 'next/link';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';

export default function PricingPage(): React.JSX.Element {
  const plans = getPricingPlans();
  const products = getOneTimeProducts().filter(product =>
    ['DAY_PASS', 'PREMIUM_PDF', 'MARRIAGE_COMPATIBILITY_REPORT'].includes(product.id),
  );

  return (
    <>
      <WebHeader />
      <main className="pricing-page">
        <div className="page-heading pricing-heading">
          <StatusPill label="No unlimited claims" tone="quiet" />
          <h1 className="gradient-text">Premium access without pressure.</h1>
          <p>
            Premium unlocks deeper guidance, higher limits, and richer report
            depth without fear-based promises.
          </p>
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
              </div>
            </Card>
          ))}
        </div>

        <section className="one-time-section">
          <div>
            <h2>One-time paths</h2>
            <p>
              Lower-friction choices for people who want to try depth before a
              subscription.
            </p>
          </div>
          <div className="one-time-grid">
            {products.map(product => (
              <Card key={product.id}>
                <div className="card-content">
                  <div className="section-title">{product.label}</div>
                  <h3>{product.displayPrice}</h3>
                  <p>{product.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
        <section className="premium-feature-story glass-panel">
          <div>
            <div className="section-title">PREMIUM STORY</div>
            <h2>Create your Kundli. Understand your life. Ask better questions. Get beautiful reports.</h2>
            <p>
              Premium should feel like a private Jyotish studio, not a token
              counter. Question packs stay available only as a rescue offer
              after limits are reached.
            </p>
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
          <h2>Clear limits, no fear selling.</h2>
          <p>
            Predicta Premium is deeper astrology guidance, not medical, legal,
            financial, or emergency advice. Subscriptions should be easy to
            cancel, and one-time reports should be clear before purchase.
          </p>
          <Link className="button secondary" href="/legal">
            Read Policies
          </Link>
        </section>
        <Link className="button secondary" href="/">
          Back to Pridicta
        </Link>
      </main>
      <WebFooter />
    </>
  );
}
