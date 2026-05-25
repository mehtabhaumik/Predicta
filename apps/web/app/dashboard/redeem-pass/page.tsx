'use client';

import { getNativeCopy } from '@pridicta/config';
import { Card } from '../../../components/Card';
import { WebRedeemPassForm } from '../../../components/WebRedeemPassForm';
import type { SupportedLanguage } from '@pridicta/types';
import { useLanguagePreference } from '../../../lib/language-preference';

export default function RedeemPassPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = REDEEM_PASS_PAGE_COPY[language] ?? REDEEM_PASS_PAGE_COPY.en;

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <h1 className="gradient-text">{copy.title}</h1>
        <details className="info-drawer">
          <summary>
            <span>{copy.drawerTitle}</span>
            <strong>{copy.openLabel}</strong>
          </summary>
          <p>{copy.drawerBody}</p>
        </details>
      </div>

      <section className="redeem-preview-steps">
        <article>
          <span>1</span>
          <h2>{copy.steps[0]?.title}</h2>
          <p>{copy.steps[0]?.body}</p>
        </article>
        <article>
          <span>2</span>
          <h2>{copy.steps[1]?.title}</h2>
          <p>{copy.steps[1]?.body}</p>
        </article>
        <article>
          <span>3</span>
          <h2>{copy.steps[2]?.title}</h2>
          <p>{copy.steps[2]?.body}</p>
        </article>
      </section>

      <Card className="glass-panel redeem-card">
        <WebRedeemPassForm />
      </Card>
    </section>
  );
}

const REDEEM_PASS_PAGE_COPY: Record<
  SupportedLanguage,
  {
    drawerBody: string;
    drawerTitle: string;
    openLabel: string;
    steps: Array<{ body: string; title: string }>;
    title: string;
  }
> = {
  en: {
    drawerBody:
      'Your pass works only with the email used when it was created. If you remember that email, sign in with it. If you are not sure, contact the Predicta admin or the person who invited you.',
    drawerTitle: 'Before you redeem',
    openLabel: 'Open',
    steps: [
      {
        body: 'Google sign-in or email sign-up both work. Predicta checks the email automatically.',
        title: 'Use the pass email.',
      },
      {
        body: 'Enter the code exactly as shared. Predicta will confirm the active pass.',
        title: 'Redeem the pass.',
      },
      {
        body: 'Create your chart, then try chat, Gochar, reports, KP, or Nadi.',
        title: 'Start with Kundli.',
      },
    ],
    title: 'Private access starts here.',
  },
  hi: {
    drawerBody:
      getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.c326680c2a"),
    drawerTitle: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.c69d1c9e06"),
    openLabel: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.901879c422"),
    steps: [
      {
        body: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.251e208bf5"),
        title: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.2e4eb7634a"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.60663553b4"),
        title: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.1e0e63d843"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.faaea785c9"),
        title: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.7df627648f"),
      },
    ],
    title: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.d2188a872c"),
  },
  gu: {
    drawerBody:
      getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.02c384ca87"),
    drawerTitle: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.8ac8ad6087"),
    openLabel: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.e0185a82d6"),
    steps: [
      {
        body: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.44647a1703"),
        title: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.5301b77e78"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.5547ebf379"),
        title: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.d5127639c8"),
      },
      {
        body: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.6fbbeead37"),
        title: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.2087ba9876"),
      },
    ],
    title: getNativeCopy("native.apps.web.app.dashboard.redeem.pass.page.tsx.96813a34ec"),
  },
};
