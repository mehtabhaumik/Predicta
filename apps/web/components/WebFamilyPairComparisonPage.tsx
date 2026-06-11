'use client';

import { getNativeCopy } from '@pridicta/config';
import type { SupportedLanguage } from '@pridicta/types';
import { WebAuthRequired } from './WebAuthRequired';
import { WebFamilyPairComparisonLoader } from './WebFamilyPairComparisonLoader';
import { useLanguagePreference } from '../lib/language-preference';

const COPY: Record<
  SupportedLanguage,
  {
    auth: { body: string; title: string };
    body: string;
    eyebrow: string;
    title: string;
  }
> = {
  en: {
    auth: {
      body:
        'Sign in before comparing two Kundlis so relationship insights stay private and attached to your account.',
      title: 'Sign in to run Pair Comparison.',
    },
    body:
      'Compare exactly two saved profiles for support, friction, karma, dharma, and practical next steps. This is for couples, relatives, friends, co-workers, and any real bond.',
    eyebrow: 'PAIR COMPARISON',
    title: 'Two charts. One honest relationship read.',
  },
  hi: {
    auth: {
      body: getNativeCopy('native.apps.web.components.WebFamilyPairComparisonPage.authBody.hi'),
      title: getNativeCopy('native.apps.web.components.WebFamilyPairComparisonPage.authTitle.hi'),
    },
    body:
      getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.6d33d25b8d"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.458bfa4431"),
    title: getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.e18a3a9f23"),
  },
  gu: {
    auth: {
      body: getNativeCopy('native.apps.web.components.WebFamilyPairComparisonPage.authBody.gu'),
      title: getNativeCopy('native.apps.web.components.WebFamilyPairComparisonPage.authTitle.gu'),
    },
    body:
      getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.eeb309ea0b"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.24cb3a63db"),
    title: getNativeCopy("native.apps.web.app.dashboard.family.compare.page.tsx.26c15ff7b0"),
  },
};

export function WebFamilyPairComparisonPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = COPY[language] ?? COPY.en;

  return (
    <section className="dashboard-page">
      <WebAuthRequired
        body={copy.auth.body}
        title={copy.auth.title}
      >
        <div className="page-heading compact family-page-heading">
          <div>
            <div className="section-title">{copy.eyebrow}</div>
            <h1 className="gradient-text">{copy.title}</h1>
            <p>{copy.body}</p>
          </div>
        </div>
        <WebFamilyPairComparisonLoader />
      </WebAuthRequired>
    </section>
  );
}
