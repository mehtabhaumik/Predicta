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
      dayPassBody: 'सदस्यता के बिना 24 घंटे के लिए प्रीमियम गहराई आजमाएं.',
      free: 'मुफ्त',
      freeBody: 'मुख्य कुंडली, सेव प्रोफाइल और सुंदर मुफ्त रिपोर्ट.',
      freeTitle: 'शांत शुरुआत करें',
      monthlyPrefix: 'मासिक प्रवेश शुरू होता है',
      monthlySuffix: 'प्रीमियम गहराई और सुविधा देता है, पक्के परिणाम नहीं.',
      premium: 'प्रीमियम',
      premiumBody: 'गहरी रिपोर्ट, ज्यादा मार्गदर्शन और बेहतर चार्ट समझ.',
      viewPricing: 'मूल्य देखें',
      yearlySuffix: '/ वर्ष',
    };
  }

  if (language === 'gu') {
    return {
      dayPass: 'ડે પાસ',
      dayPassBody: 'સભ્યતા વગર 24 કલાક માટે પ્રીમિયમ ઊંડાઈ અજમાવો.',
      free: 'મફત',
      freeBody: 'મુખ્ય કુંડળી, સેવ પ્રોફાઇલ અને સુંદર મફત રિપોર્ટ.',
      freeTitle: 'શાંતિથી શરૂઆત કરો',
      monthlyPrefix: 'માસિક પ્રવેશ શરૂ થાય છે',
      monthlySuffix: 'પ્રીમિયમ ઊંડાઈ અને સુવિધા આપે છે, પાક્કા પરિણામ નહીં.',
      premium: 'પ્રીમિયમ',
      premiumBody: 'ઊંડી રિપોર્ટ, વધુ માર્ગદર્શન અને સારી ચાર્ટ સમજ.',
      viewPricing: 'કિંમત જુઓ',
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
