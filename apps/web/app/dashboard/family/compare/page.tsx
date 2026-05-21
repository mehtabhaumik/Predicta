'use client';

import type { SupportedLanguage } from '@pridicta/types';
import { WebFamilyPairComparison } from '../../../../components/WebFamilyPairComparison';
import { demoAccess } from '../../../../lib/demo-state';
import { useLanguagePreference } from '../../../../lib/language-preference';

const COPY: Record<SupportedLanguage, { body: string; eyebrow: string; title: string }> = {
  en: {
    body:
      'Compare exactly two saved profiles for support, friction, karma, dharma, and practical next steps. This is for couples, relatives, friends, co-workers, and any real bond.',
    eyebrow: 'PAIR COMPARISON',
    title: 'Two charts. One honest relationship read.',
  },
  hi: {
    body:
      'ठीक दो सेव प्रोफाइल की तुलना करें और सहारा, घर्षण, कर्म, धर्म और व्यावहारिक अगला कदम देखें. यह केवल दंपति के लिए नहीं, किसी भी वास्तविक संबंध के लिए है.',
    eyebrow: 'जोड़ेदार तुलना',
    title: 'दो चार्ट. एक ईमानदार संबंध रीडिंग.',
  },
  gu: {
    body:
      'ચોક્કસ બે સાચવેલી પ્રોફાઇલની તુલના કરો અને સહારો, ઘર્ષણ, કર્મ, ધર્મ અને આગળનું પ્રાયોગિક પગલું જુઓ. આ ફક્ત દંપતિ માટે નહીં, કોઈપણ સાચા સંબંધ માટે છે.',
    eyebrow: 'જોડી તુલના',
    title: 'બે ચાર્ટ. એક સચ્ચી સંબંધ વાંચન.',
  },
};

export default function FamilyComparePage(): React.JSX.Element {
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
      <WebFamilyPairComparison hasPremiumAccess={demoAccess.hasPremiumAccess} />
    </section>
  );
}
