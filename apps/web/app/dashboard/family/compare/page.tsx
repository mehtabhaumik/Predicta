'use client';

import { getNativeCopy } from '@pridicta/config';
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
      getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.6d33d25b8d"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.458bfa4431"),
    title: getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.e18a3a9f23"),
  },
  gu: {
    body:
      getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.eeb309ea0b"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.24cb3a63db"),
    title: getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.26c15ff7b0"),
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
