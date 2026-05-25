'use client';

import { getNativeCopy } from '@pridicta/config';
import type { SupportedLanguage } from '@pridicta/types';
import { WebMatchmakingPanel } from '../../../components/WebMatchmakingPanel';
import { demoAccess } from '../../../lib/demo-state';
import { useLanguagePreference } from '../../../lib/language-preference';

const COPY: Record<SupportedLanguage, { body: string; eyebrow: string; title: string }> = {
  en: {
    body:
      'Use one boy Kundli and one girl Kundli for a dedicated Vedic marriage read with score, strengths, caution areas, and practical conclusion.',
    eyebrow: 'MATCHMAKING',
    title: 'Marriage evaluation should not feel like a generic compatibility widget.',
  },
  hi: {
    body:
      getNativeCopy("native.apps.web.app.dashboard.matchmaking.page.tsx.5b3f996ae5"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.matchmaking.page.tsx.1952f57972"),
    title: getNativeCopy("native.apps.web.app.dashboard.matchmaking.page.tsx.885326b9c2"),
  },
  gu: {
    body:
      getNativeCopy("native.apps.web.app.dashboard.matchmaking.page.tsx.153866cc64"),
    eyebrow: getNativeCopy("native.apps.web.app.dashboard.matchmaking.page.tsx.a2ef635763"),
    title: getNativeCopy("native.apps.web.app.dashboard.matchmaking.page.tsx.309382e1ec"),
  },
};

export default function MatchmakingPage(): React.JSX.Element {
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
      <WebMatchmakingPanel hasPremiumAccess={demoAccess.hasPremiumAccess} />
    </section>
  );
}
