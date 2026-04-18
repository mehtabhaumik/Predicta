import Link from 'next/link';
import { getDayPassProduct, getPricingPlans } from '@pridicta/config/pricing';

export function PricingTeaser(): React.JSX.Element {
  const yearly = getPricingPlans().find(plan => plan.id === 'YEARLY');
  const monthly = getPricingPlans().find(plan => plan.id === 'MONTHLY');
  const dayPass = getDayPassProduct();

  return (
    <div className="pricing-teaser">
      <article className="pricing-path">
        <span>Free</span>
        <strong>Start calmly</strong>
        <p>Core kundli, saved profiles, and a premium-looking free report.</p>
      </article>
      <article className="pricing-path glass-panel featured">
        <span>Premium</span>
        <strong>{yearly?.displayPrice ?? '₹1,999'} / year</strong>
        <p>Deeper report depth, expanded guidance, and richer chart insight.</p>
      </article>
      <article className="pricing-path">
        <span>Day Pass</span>
        <strong>{dayPass.displayPrice}</strong>
        <p>Try Premium depth for 24 hours without a subscription.</p>
      </article>
      <div className="pricing-note">
        <p>
          Monthly access begins at {monthly?.displayPrice ?? '₹299'}. Premium
          increases depth and convenience; it never promises guaranteed outcomes.
        </p>
        <Link className="button secondary" href="/pricing">
          View Pricing
        </Link>
      </div>
    </div>
  );
}
