'use client';

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
      dayPass: 'डे पास',
      dayPassBody: 'Subscription के बिना 24 घंटे के लिए प्रीमियम depth try करें.',
      free: 'मुफ्त',
      freeBody: 'मुख्य कुंडली, सेव profile और प्रीमियम जैसी मुफ्त report.',
      freeTitle: 'शांत शुरुआत करें',
      monthlyPrefix: 'Monthly access शुरू होता है',
      monthlySuffix: 'प्रीमियम depth और सुविधा देता है, guaranteed result नहीं.',
      premium: 'प्रीमियम',
      premiumBody: 'गहरी report, ज्यादा guidance और बेहतर chart insight.',
      viewPricing: 'Pricing देखें',
      yearlySuffix: '/ वर्ष',
    };
  }

  if (language === 'gu') {
    return {
      dayPass: 'ડે પાસ',
      dayPassBody: 'Subscription વિના 24 કલાક માટે પ્રીમિયમ depth try કરો.',
      free: 'મફત',
      freeBody: 'મુખ્ય કુંડળી, સેવ profile અને પ્રીમિયમ જેવી મફત report.',
      freeTitle: 'શાંતિથી શરૂઆત કરો',
      monthlyPrefix: 'Monthly access શરૂ થાય છે',
      monthlySuffix: 'પ્રીમિયમ depth અને સુવિધા આપે છે, guaranteed result નહીં.',
      premium: 'પ્રીમિયમ',
      premiumBody: 'ઊંડી report, વધુ guidance અને સારી chart insight.',
      viewPricing: 'Pricing જુઓ',
      yearlySuffix: '/ વર્ષ',
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
