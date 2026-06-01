'use client';

import { getNativeCopy } from '@pridicta/config';
import type { SupportedLanguage } from '@pridicta/types';
import { WebAuthRequired } from '../../../../components/WebAuthRequired';
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
      getNativeCopy("native.apps.web.app.dashboard.family.karma.map.page.tsx.e4c683cdd9"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.family.karma.map.page.tsx.541b1bf91a"),
    title: getNativeCopy("native.apps.web.app.dashboard.family.karma.map.page.tsx.e7e0bd1ede"),
  },
  gu: {
    body:
      getNativeCopy("native.apps.web.app.dashboard.family.karma.map.page.tsx.ddfd3834a8"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.family.karma.map.page.tsx.f42a117fe6"),
    title: getNativeCopy("native.apps.web.app.dashboard.family.karma.map.page.tsx.96c1cea58e"),
  },
};

export default function FamilyKarmaMapPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = COPY[language] ?? COPY.en;

  return (
    <section className="dashboard-page">
      <WebAuthRequired
        body="Sign in before running household comparison so Family Vault uses only your saved private Kundlis."
        title="Sign in to open Family Karma Map."
      >
        <div className="page-heading compact family-page-heading">
          <div>
            <div className="section-title">{copy.eyebrow}</div>
            <h1 className="gradient-text">{copy.title}</h1>
            <p>{copy.body}</p>
          </div>
        </div>
        <WebFamilyKarmaMap hasPremiumAccess={demoAccess.hasPremiumAccess} />
      </WebAuthRequired>
    </section>
  );
}
