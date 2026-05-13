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
        <StatusPill label="Premium without pressure" tone="premium" />
        <h1 className="gradient-text">Go deeper when the free reading helps.</h1>
        <p>
          Premium turns holistic astrology into deeper timing, richer reports,
          family context, and longer Predicta guidance.
        </p>
      </div>

      <section className="premium-feature-story glass-panel">
        <div>
          <div className="section-title">WHY PREMIUM</div>
          <h2>Predicta becomes your private Jyotish studio.</h2>
          <p>
            Free stays useful. Premium adds depth, memory, timing maps,
            remedies, reports, and higher guidance limits.
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
              <Link className="button secondary" href="/pricing">
                Review Checkout Options
              </Link>
            </div>
          </Card>
        ))}
      </div>

      <section className="one-time-section">
        <div>
          <h2>Try depth before subscribing.</h2>
          <p>{dayPass.description}</p>
          <Link className="button" href="/pricing">
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
              </div>
            </Card>
          ))}
        </div>
      </section>
    </section>
  );
}
