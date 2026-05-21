'use client';

import Link from 'next/link';
import type { SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../lib/language-preference';

const footerCopy: Record<
  SupportedLanguage,
  {
    bottom: string;
    compactLead: string;
    compactLinks: Array<{ href: string; label: string }>;
    copyright: string;
    sections: Array<{
      heading: string;
      links: Array<{ href: string; label: string }>;
    }>;
    tagline: string;
    trust: string;
  }
> = {
  en: {
    bottom:
      'For reflection and self-understanding only. Not medical, legal, financial, emergency, or guaranteed prediction advice.',
    compactLead: 'Quiet exit',
    compactLinks: [
      { href: '/accuracy-method', label: 'Method' },
      { href: '/safety', label: 'Safety' },
      { href: '/legal', label: 'Legal' },
      { href: '/feedback', label: 'Feedback' },
    ],
    copyright: '© 2026 Predicta. All rights reserved.',
    sections: [
      {
        heading: 'Start',
        links: [
          { href: '/dashboard/kundli', label: 'Create Kundli' },
          { href: '/dashboard/charts', label: 'View Charts' },
          { href: '/dashboard/vedic/chat', label: 'Ask Vedic Predicta' },
          { href: '/dashboard/saved-kundlis', label: 'Kundli Library' },
          { href: '/dashboard/family', label: 'Family Vault' },
        ],
      },
      {
        heading: 'Premium',
        links: [
          { href: '/pricing', label: 'Plans and Passes' },
          { href: '/dashboard/timeline', label: 'Life Calendar' },
          { href: '/dashboard/report', label: 'PDF Reports' },
          { href: '/dashboard/matchmaking', label: 'Matchmaking' },
        ],
      },
      {
        heading: 'Trust',
        links: [
          { href: '/legal#privacy', label: 'Privacy Policy' },
          { href: '/legal#terms', label: 'Terms of Use' },
          { href: '/legal#refund', label: 'Refund Policy' },
          { href: '/legal#disclaimer', label: 'Disclaimer' },
          { href: '/legal#age-guidance', label: 'Age Guidance' },
          { href: '/accuracy-method', label: 'Accuracy & Method' },
          { href: '/safety', label: 'Safety Promise' },
          { href: '/founder', label: 'Founder Vision' },
          { href: '/feedback', label: 'Feedback' },
          {
            href: 'mailto:support@predicta.app?subject=Predicta%20Safety%20Report',
            label: 'Report an Issue',
          },
        ],
      },
    ],
    tagline:
      'Create your Kundli. Understand your life through holistic astrology. Ask better questions. Get beautiful reports.',
    trust:
      'Vedic astrology guidance with chart proof, karma-based remedies, saved Kundlis, privacy choices, and clear safety limits.',
  },
  hi: {
    bottom:
      'यह आत्म-समझ और चिंतन के लिए है. यह चिकित्सकीय, कानूनी, आर्थिक, आपातकालीन या पक्की भविष्यवाणी सलाह नहीं है.',
    compactLead: 'शांत समापन',
    compactLinks: [
      { href: '/accuracy-method', label: 'विधि' },
      { href: '/safety', label: 'सुरक्षा' },
      { href: '/legal', label: 'कानूनी' },
      { href: '/feedback', label: 'फीडबैक' },
    ],
    copyright: '© 2026 प्रेडिक्टा. सर्वाधिकार सुरक्षित.',
    sections: [
      {
        heading: 'शुरू करें',
        links: [
          { href: '/dashboard/kundli', label: 'कुंडली बनाएं' },
          { href: '/dashboard/charts', label: 'चार्ट देखें' },
          { href: '/dashboard/vedic/chat', label: 'वैदिक प्रेडिक्टा से पूछें' },
          { href: '/dashboard/saved-kundlis', label: 'कुंडली लाइब्रेरी' },
          { href: '/dashboard/family', label: 'परिवार वॉल्ट' },
        ],
      },
      {
        heading: 'प्रीमियम',
        links: [
          { href: '/pricing', label: 'प्लान और पास' },
          { href: '/dashboard/timeline', label: 'लाइफ कैलेंडर' },
          { href: '/dashboard/report', label: 'PDF रिपोर्ट' },
          { href: '/dashboard/matchmaking', label: 'विवाह मिलान' },
        ],
      },
      {
        heading: 'भरोसा',
        links: [
          { href: '/legal#privacy', label: 'प्राइवेसी पॉलिसी' },
          { href: '/legal#terms', label: 'टर्म्स ऑफ यूज' },
          { href: '/legal#refund', label: 'रिफंड पॉलिसी' },
          { href: '/legal#disclaimer', label: 'डिस्क्लेमर' },
          { href: '/legal#age-guidance', label: 'उम्र मार्गदर्शन' },
          { href: '/accuracy-method', label: 'सटीकता और विधि' },
          { href: '/safety', label: 'सुरक्षा वादा' },
          { href: '/founder', label: 'फाउंडर विजन' },
          { href: '/feedback', label: 'फीडबैक' },
          {
            href: 'mailto:support@predicta.app?subject=Predicta%20Safety%20Report',
            label: 'समस्या रिपोर्ट करें',
          },
        ],
      },
    ],
    tagline:
      'अपनी कुंडली बनाएं. होलिस्टिक ज्योतिष से जीवन समझें. बेहतर सवाल पूछें. सुंदर रिपोर्ट पाएं.',
    trust:
      'चार्ट प्रमाण, कर्म-आधारित उपाय, सेव कुंडली, निजी पसंद और साफ सुरक्षा सीमाओं के साथ वैदिक ज्योतिष मार्गदर्शन.',
  },
  gu: {
    bottom:
      'આ આત્મસમજ અને વિચાર માટે છે. આ તબીબી, કાનૂની, આર્થિક, આપાતકાલીન અથવા પાક્કી આગાહી સલાહ નથી.',
    compactLead: 'શાંત અંત',
    compactLinks: [
      { href: '/accuracy-method', label: 'પદ્ધતિ' },
      { href: '/safety', label: 'સુરક્ષા' },
      { href: '/legal', label: 'કાનૂની' },
      { href: '/feedback', label: 'ફીડબેક' },
    ],
    copyright: '© 2026 પ્રેડિક્ટા. સર્વ અધિકાર સુરક્ષિત.',
    sections: [
      {
        heading: 'શરૂ કરો',
        links: [
          { href: '/dashboard/kundli', label: 'કુંડળી બનાવો' },
          { href: '/dashboard/charts', label: 'ચાર્ટ્સ જુઓ' },
          { href: '/dashboard/vedic/chat', label: 'વેદિક પ્રેડિક્ટા ને પૂછો' },
          { href: '/dashboard/saved-kundlis', label: 'કુંડળી લાઇબ્રેરી' },
          { href: '/dashboard/family', label: 'પરિવાર વોલ્ટ' },
        ],
      },
      {
        heading: 'પ્રીમિયમ',
        links: [
          { href: '/pricing', label: 'પ્લાન અને પાસ' },
          { href: '/dashboard/timeline', label: 'લાઇફ કેલેન્ડર' },
          { href: '/dashboard/report', label: 'PDF રિપોર્ટ્સ' },
          { href: '/dashboard/matchmaking', label: 'લગ્ન મિલાન' },
        ],
      },
      {
        heading: 'ભરોસો',
        links: [
          { href: '/legal#privacy', label: 'પ્રાઇવસી પોલિસી' },
          { href: '/legal#terms', label: 'ટર્મ્સ ઓફ યુઝ' },
          { href: '/legal#refund', label: 'રિફંડ પોલિસી' },
          { href: '/legal#disclaimer', label: 'ડિસ્ક્લેમર' },
          { href: '/legal#age-guidance', label: 'ઉંમર માર્ગદર્શન' },
          { href: '/accuracy-method', label: 'ચોકસાઈ અને પદ્ધતિ' },
          { href: '/safety', label: 'સેફ્ટી પ્રોમિસ' },
          { href: '/founder', label: 'ફાઉન્ડર વિઝન' },
          { href: '/feedback', label: 'ફીડબેક' },
          {
            href: 'mailto:support@predicta.app?subject=Predicta%20Safety%20Report',
            label: 'સમસ્યા રિપોર્ટ કરો',
          },
        ],
      },
    ],
    tagline:
      'તમારી કુંડળી બનાવો. હોલિસ્ટિક જ્યોતિષથી જીવન સમજો. સારા પ્રશ્નો પૂછો. સુંદર રિપોર્ટ્સ મેળવો.',
    trust:
      'ચાર્ટ પુરાવા, કર્મ આધારિત ઉપાયો, સેવ કુંડળી, ખાનગી પસંદગીઓ અને સ્પષ્ટ સુરક્ષા મર્યાદાઓ સાથે વૈદિક જ્યોતિષ માર્ગદર્શન.',
  },
};

export function WebFooter({
  className = '',
  variant = 'public',
}: {
  className?: string;
  variant?: 'dashboard' | 'public';
}): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = footerCopy[language] ?? footerCopy.en;

  if (variant === 'dashboard') {
    return (
      <footer className={`web-footer web-footer-compact ${className}`.trim()}>
        <div className="web-footer-compact-row">
          <div className="web-footer-compact-brand">
            <Link aria-label="Predicta home" className="web-footer-logo" href="/">
              PREDICTA
            </Link>
            <span>{copy.compactLead}</span>
          </div>
          <nav aria-label="Dashboard footer navigation" className="web-footer-compact-links">
            {copy.compactLinks.map(link => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="web-footer-bottom compact">
          <span>{copy.copyright}</span>
          <span>{copy.bottom}</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className={`web-footer ${className}`.trim()}>
      <div className="web-footer-inner">
        <div className="web-footer-brand">
          <Link aria-label="Predicta home" className="web-footer-logo" href="/">
            PREDICTA
          </Link>
          <p className="web-footer-tagline">
            {copy.tagline}
          </p>
          <p className="web-footer-trust">
            {copy.trust}
          </p>
        </div>

        <nav aria-label="Footer navigation" className="web-footer-grid">
          {copy.sections.map(section => (
            <div className="web-footer-column" key={section.heading}>
              <h2>{section.heading}</h2>
              {section.links.map(link => (
                <Link href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div className="web-footer-bottom">
        <span>{copy.copyright}</span>
        <span>{copy.bottom}</span>
      </div>
    </footer>
  );
}
