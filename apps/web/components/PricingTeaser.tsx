'use client';

import { getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { getDayPassProduct, getPricingPlans } from '@pridicta/config/pricing';
import { useLanguagePreference } from '../lib/language-preference';

export function PricingTeaser(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const yearly = getPricingPlans().find(plan => plan.id === 'YEARLY');
  const monthly = getPricingPlans().find(plan => plan.id === 'MONTHLY');
  const dayPass = getDayPassProduct();
  const copy = getPricingTeaserCopy(language);

  return (
    <div className="pricing-teaser">
      <article className="pricing-path">
        <span>{copy.free}</span>
        <strong>{copy.freeTitle}</strong>
        <p>{copy.freeBody}</p>
      </article>
      <article className="pricing-path glass-panel featured">
        <span>{copy.premium}</span>
        <strong>
          {yearly?.displayPrice ?? '₹1,999'} {copy.yearlySuffix}
        </strong>
        <p>{copy.premiumBody}</p>
      </article>
      <article className="pricing-path">
        <span>{copy.dayPass}</span>
        <strong>{dayPass.displayPrice}</strong>
        <p>{copy.dayPassBody}</p>
      </article>
      <div className="pricing-note">
        <p>
          {copy.monthlyPrefix} {monthly?.displayPrice ?? '₹299'}.{' '}
          {copy.monthlySuffix}
        </p>
        <Link className="button secondary" href="/pricing">
          {copy.viewPricing}
        </Link>
      </div>
    </div>
  );
}

function getPricingTeaserCopy(language: string): {
  dayPass: string;
  dayPassBody: string;
  free: string;
  freeBody: string;
  freeTitle: string;
  monthlyPrefix: string;
  monthlySuffix: string;
  premium: string;
  premiumBody: string;
  viewPricing: string;
  yearlySuffix: string;
} {
  if (language === 'hi') {
    return {
      dayPass: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.ec32113b0b"),
      dayPassBody: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.e11b9330e8"),
      free: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.835e9402fb"),
      freeBody: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.06de00de0c"),
      freeTitle: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.820b20981f"),
      monthlyPrefix: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.56525f7226"),
      monthlySuffix: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.c307eae826"),
      premium: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.b552bca1c9"),
      premiumBody: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.54c6bcfe69"),
      viewPricing: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.4a29f4c5f7"),
      yearlySuffix: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.449d522e4d"),
    };
  }

  if (language === 'gu') {
    return {
      dayPass: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.039eabd9e9"),
      dayPassBody: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.fe6c9b9ce1"),
      free: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.11494ad2d1"),
      freeBody: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.3440bf2bd0"),
      freeTitle: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.b0f11e9d9a"),
      monthlyPrefix: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.fe7f80250c"),
      monthlySuffix: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.c4174b8c42"),
      premium: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.81ee678383"),
      premiumBody: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.7b3b0fe33a"),
      viewPricing: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.d081b9e07b"),
      yearlySuffix: getNativeCopy("native.apps.web.components.PricingTeaser.tsx.ca16adda5d"),
    };
  }

  return {
    dayPass: 'Day Pass',
    dayPassBody: 'Try Premium depth for 24 hours without a subscription.',
    free: 'Free',
    freeBody: 'Core kundli, saved profiles, and a premium-looking free report.',
    freeTitle: 'Start calmly',
    monthlyPrefix: 'Monthly access begins at',
    monthlySuffix:
      'Premium adds depth and convenience, not guaranteed outcomes.',
    premium: 'Premium',
    premiumBody: 'Deeper report depth, expanded guidance, and richer chart insight.',
    viewPricing: 'View Pricing',
    yearlySuffix: '/ year',
  };
}
