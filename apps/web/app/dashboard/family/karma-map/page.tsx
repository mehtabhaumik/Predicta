'use client';

import type { SupportedLanguage } from '@pridicta/types';
import { WebFamilyKarmaMap } from '../../../../components/WebFamilyKarmaMap';
import { demoAccess } from '../../../../lib/demo-state';
import { useLanguagePreference } from '../../../../lib/language-preference';

const COPY: Record<SupportedLanguage, { body: string; eyebrow: string; title: string }> = {
  en: {
    body:
      'Read the household as a living system. Predicta tracks repeated karma patterns, dharma repair paths, and which pairings calm or strain the home.',
    eyebrow: 'FAMILY KARMA MAP',
    title: 'See how the household shapes itself.',
  },
  hi: {
    body:
      'पूरे परिवार को एक जीवित तंत्र की तरह पढ़ें. प्रेडिक्टा देखती है कि कौन से कर्म संकेत दोहरते हैं, कौन सा धर्म सुधार मार्ग है, और कौन सी जोड़ी घर को शांत या तनावपूर्ण बनाती है.',
    eyebrow: 'परिवार कर्म नक्शा',
    title: 'देखें कि घर खुद को कैसे आकार देता है.',
  },
  gu: {
    body:
      'આખા પરિવારને જીવંત તંત્ર તરીકે વાંચો. પ્રેડિક્ટા જુએ છે કે કયા કર્મ સંકેતો ફરી આવે છે, કયો ધર્મ સુધાર માર્ગ છે, અને કઈ જોડીઓ ઘરને શાંત કે તંગ બનાવે છે.',
    eyebrow: 'પરિવાર કર્મ નકશો',
    title: 'જોવો કે ઘર પોતાને કેવી રીતે ઘડે છે.',
  },
};

export default function FamilyKarmaMapPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = COPY[language] ?? COPY.en;

  return (
    <section className="dashboard-page">
      <div className="page-heading compact family-page-heading">
        <div>
          <div className="section-title">{copy.eyebrow}</div>
          <h1 className="gradient-text">{copy.title}</h1>
          <p>{copy.body}</p>
        </div>
      </div>
      <WebFamilyKarmaMap hasPremiumAccess={demoAccess.hasPremiumAccess} />
    </section>
  );
}
