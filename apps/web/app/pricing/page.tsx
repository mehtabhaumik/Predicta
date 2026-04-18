import { getOneTimeProducts, getPricingPlans } from '@pridicta/config/pricing';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { WebHeader } from '../../components/WebHeader';

export const metadata: Metadata = {
  alternates: {
    canonical: '/pricing',
  },
  description:
    'Review Predicta pricing for Free access, Day Pass, Premium plans, question packs, and premium astrology reports.',
  openGraph: {
    description:
      'Choose a calm, flexible Predicta plan for deeper Vedic astrology guidance and premium report depth.',
    title: 'Predicta Pricing',
    url: '/pricing',
  },
  title: 'Predicta Pricing',
};

export default function PricingPage(): React.JSX.Element {
  const plans = getPricingPlans();
  const products = getOneTimeProducts().filter(product =>
    ['DAY_PASS', 'FIVE_QUESTIONS', 'PREMIUM_PDF'].includes(product.id),
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
        <Link className="button secondary" href="/">
          Back to Predicta
        </Link>
      </main>
    </>
  );
}
