export type LegalDocumentSlug =
  | 'disclaimer'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'age-guidance';

export type LegalSection = {
  body: string[];
  heading: string;
};

export type LegalDocument = {
  effectiveDate: string;
  intro: string;
  slug: LegalDocumentSlug;
  title: string;
  sections: LegalSection[];
};

export const LEGAL_LAST_UPDATED = 'May 6, 2026';

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    effectiveDate: LEGAL_LAST_UPDATED,
    intro:
      'Predicta provides Vedic astrology guidance for reflection, planning, and self-understanding. It is not a professional advice service.',
    slug: 'disclaimer',
    title: 'Safety and Advice Disclaimer',
    sections: [
      {
        heading: 'Astrology is reflective guidance',
        body: [
          'Predicta uses birth details, chart calculations, Jyotish rules, and careful language to generate guidance. Answers are interpretations, not guaranteed facts or predictions.',
          'Do not use Predicta as the only basis for important decisions. Treat confidence labels, proof notes, and timing windows as context, not certainty.',
        ],
      },
      {
        heading: 'Medical, legal, financial, and emergency limits',
        body: [
          'Predicta does not provide medical diagnosis, treatment, prescriptions, legal advice, tax advice, investment advice, credit advice, or emergency assistance.',
          'For health symptoms, pregnancy, medication, surgery, mental health crisis, abuse, self-harm, legal disputes, contracts, police matters, taxes, loans, investments, insurance, or safety concerns, contact a qualified professional or emergency service.',
          'No remedy, mantra, ritual, gemstone, donation, fasting practice, or timing suggestion should delay urgent care or replace professional help.',
        ],
      },
      {
        heading: 'No fear-based claims',
        body: [
          'Predicta should not make fatalistic claims about death, divorce, illness, bankruptcy, violence, or guaranteed outcomes.',
          'If any generated response sounds absolute, threatening, or unsafe, ignore that portion and contact support so it can be reviewed.',
        ],
      },
      {
        heading: 'Report unsafe behavior',
        body: [
          'Users can report unsafe, offensive, incorrect, or confusing answers through support@predicta.app. Serious reports should be looked at by a human.',
          'Safety reports may be used to make Predicta calmer, clearer, and more responsible.',
        ],
      },
    ],
  },
  {
    effectiveDate: LEGAL_LAST_UPDATED,
    intro:
      'This Privacy Policy explains what Predicta collects, why it is used, and how users can control their information.',
    slug: 'privacy',
    title: 'Privacy Policy',
    sections: [
      {
        heading: 'Information we collect',
        body: [
          'Birth profile data: name or label, birth date, birth time, birth place, timezone, latitude, longitude, approximate-time flag, calculated charts, saved Kundlis, reports, and user-selected family or relationship labels.',
          'Account and access data: email, login provider, user ID, subscription status, guest-pass redemption status, purchase/usage counters, and support messages.',
          'Product usage data: app interactions, feature usage, limits reached, reliability information, and basic device or browser information.',
        ],
      },
      {
        heading: 'How we use information',
        body: [
          'To calculate Kundlis, generate chart explanations, answer questions, create reports, save profiles, enforce plan limits, process guest passes, improve reliability, and keep the service safe.',
          'We do not sell birth details. We do not use exact birth time or birth place in shareable Wrapped text unless the user explicitly writes that information into a shared message.',
        ],
      },
      {
        heading: 'Storage and sharing',
        body: [
          'Records may stay on the device or browser profile. On web, signing in can keep saved Kundlis available across devices.',
          'Account records, guest-pass status, and subscription state may be handled by trusted providers that help Predicta run, protect accounts, process payments, and answer questions.',
          'We may disclose information when required by law, to protect users or the service, to prevent fraud or abuse, or during a business transfer with appropriate safeguards.',
        ],
      },
      {
        heading: 'User choices',
        body: [
          'Users may create, edit, delete, or stop using saved profiles. Account users may request deletion, export, correction, or withdrawal of consent by contacting support.',
          'Marketing emails, if introduced, must include an unsubscribe option. Essential service notices may still be sent.',
        ],
      },
      {
        heading: 'Security and retention',
        body: [
          'Predicta uses reasonable privacy and access safeguards for AI answers, guest passes, saved records, and account access.',
          'Data is kept only as long as needed for service, legal, security, billing, dispute, audit, or backup purposes, unless a longer retention period is required by law.',
        ],
      },
    ],
  },
  {
    effectiveDate: LEGAL_LAST_UPDATED,
    intro:
      'These Terms explain the rules for using Predicta. By using Predicta, users agree to these terms.',
    slug: 'terms',
    title: 'Terms of Use',
    sections: [
      {
        heading: 'Eligibility and account responsibility',
        body: [
          'Predicta is intended for users who are old enough to consent to digital services in their location. Users under 18 should use Predicta only with parent or guardian involvement.',
          'Users are responsible for keeping account credentials, guest passes, and shared device access secure. A family member using the same login can see saved Kundlis and chat context available in that account.',
        ],
      },
      {
        heading: 'Acceptable use',
        body: [
          'Do not use Predicta to harass, threaten, exploit, defame, discriminate, make unsafe instructions, impersonate others, violate privacy, or bypass access controls.',
          'Do not upload someone else’s birth details unless you have permission or a legitimate family/personal reason consistent with privacy expectations.',
        ],
      },
      {
        heading: 'AI and astrology outputs',
        body: [
          'Predicta answers may be incomplete, inaccurate, or unsuitable for a particular situation. Users should verify important information independently.',
          'Predicta may update calculations, features, prices, limits, and policy text over time.',
        ],
      },
      {
        heading: 'Subscriptions and paid products',
        body: [
          'Paid features may include Premium subscriptions, Day Passes, Premium PDF reports, bundle reports, compatibility reports, and other one-time purchases.',
          'Recurring subscriptions renew automatically unless cancelled before renewal through the billing provider or account management flow shown at purchase.',
        ],
      },
      {
        heading: 'Limitation of liability',
        body: [
          'Predicta is provided “as is” and “as available.” To the maximum extent allowed by law, Predicta is not liable for decisions, losses, distress, disputes, missed opportunities, or outcomes based on astrology or AI guidance.',
          'Nothing in these Terms limits rights that cannot legally be limited.',
        ],
      },
    ],
  },
  {
    effectiveDate: LEGAL_LAST_UPDATED,
    intro:
      'This Refund Policy explains how payments, renewals, cancellations, and refund requests are handled.',
    slug: 'refund',
    title: 'Refund Policy',
    sections: [
      {
        heading: 'Subscriptions',
        body: [
          'Subscriptions can be cancelled through the same billing channel used to purchase. Cancellation stops future renewal but does not automatically refund the current paid period.',
          'Predicta should make cancellation and subscription management easy to find from Settings and Pricing.',
        ],
      },
      {
        heading: 'One-time purchases',
        body: [
          'Day Passes, Premium PDFs, report bundles, compatibility reports, and other one-time digital purchases are generally non-refundable after access is delivered or the report is generated, unless required by law or the purchase failed because of Predicta.',
          'If a paid report cannot be generated because of a Predicta issue, the user should receive a retry, credit, or refund review.',
        ],
      },
      {
        heading: 'Duplicate, accidental, or unauthorized charges',
        body: [
          'Users should contact support with the purchase email, date, amount, and receipt ID. Predicta will review duplicate or failed-delivery charges in good faith.',
          'For card, app-store, or payment-provider disputes, users may also use the refund or dispute tools provided by the payment provider.',
        ],
      },
    ],
  },
  {
    effectiveDate: LEGAL_LAST_UPDATED,
    intro:
      'Predicta is not designed for children. Astrology can feel emotionally intense, so age and family guidance matters.',
    slug: 'age-guidance',
    title: 'Age Guidance',
    sections: [
      {
        heading: 'Minimum age',
        body: [
          'Predicta is intended for users 13 and older. Users under 13 should not create an account or submit personal information.',
          'Teen users should use Predicta with parent or guardian awareness, especially for relationship, health, financial, or emotional topics.',
        ],
      },
      {
        heading: 'Parent and family use',
        body: [
          'A parent or guardian may create and manage Kundlis for family members when they have permission or appropriate family authority.',
          'Family Vault and shared-login use should be treated like a private household notebook: only add profiles that the account owner is allowed to store, and avoid using readings to label or blame a family member.',
        ],
      },
      {
        heading: 'Emotional safety',
        body: [
          'Predicta should not be used to frighten children, control another person, decide marriage or education outcomes for someone else, or replace professional support.',
          'If a child or teen is upset by a reading, stop using the app and speak with a trusted adult or qualified professional.',
        ],
      },
    ],
  },
];

export function getLegalDocument(slug: LegalDocumentSlug): LegalDocument {
  const document = LEGAL_DOCUMENTS.find(item => item.slug === slug);

  if (!document) {
    throw new Error(`Unknown legal document: ${slug}`);
  }

  return document;
}
