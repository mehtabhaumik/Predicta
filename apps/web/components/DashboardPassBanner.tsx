'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { RedeemedGuestPass } from '@pridicta/types';
import { getLightweightAppShellLabels } from '../lib/lightweight-app-shell-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';
import { PASS_USAGE_UPDATED_EVENT } from '../lib/web-pass-cost-guardrails';

function loadDashboardGuestPass(): RedeemedGuestPass | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem('pridicta.redeemedGuestPass.v1');
    const pass = raw ? (JSON.parse(raw) as RedeemedGuestPass) : undefined;

    return pass && new Date(pass.expiresAt).getTime() > Date.now()
      ? pass
      : undefined;
  } catch {
    return undefined;
  }
}

function buildDashboardPassCopy(
  pass: RedeemedGuestPass,
  copy: ReturnType<typeof getLightweightAppShellLabels>['passBanner'],
): {
  body: string;
  tone: 'steady' | 'careful';
} {
  const questionsRemaining = Math.max(
    0,
    pass.usageLimits.questionsTotal - pass.questionsUsed,
  );
  const deepRemaining = Math.max(
    0,
    pass.usageLimits.deepReadingsTotal - pass.deepReadingsUsed,
  );
  const pdfRemaining = Math.max(
    0,
    pass.usageLimits.premiumPdfsTotal - pass.premiumPdfsUsed,
  );
  const careful =
    questionsRemaining <= 3 || deepRemaining <= 1 || pdfRemaining <= 1;
  const included = `${pass.usageLimits.questionsTotal} ${copy.questionsLabel}, ${pass.usageLimits.deepReadingsTotal} ${copy.deepReadingsLabel}, ${pass.usageLimits.premiumPdfsTotal} ${copy.pdfsLabel}`;
  const remaining = `${questionsRemaining} ${copy.aiRemainingLabel}, ${deepRemaining} ${copy.deepReadingsLabel}, ${pdfRemaining} ${copy.pdfsLabel}`;
  const template = careful ? copy.bodyCareful : copy.bodySteady;

  return {
    body: template
      .replace('{label}', pass.label)
      .replace('{included}', included)
      .replace('{remaining}', remaining),
    tone: careful ? 'careful' : 'steady',
  };
}

export function DashboardPassBanner({
  initialPass,
}: {
  initialPass?: RedeemedGuestPass;
}): React.JSX.Element | null {
  const [dashboardGuestPass, setDashboardGuestPass] = useState<
    RedeemedGuestPass | undefined
  >(initialPass);
  const { language } = useLightweightLanguagePreference();
  const copy = getLightweightAppShellLabels(language).passBanner;

  useEffect(() => {
    function refreshPass() {
      setDashboardGuestPass(loadDashboardGuestPass() ?? initialPass);
    }

    refreshPass();
    window.addEventListener(PASS_USAGE_UPDATED_EVENT, refreshPass);
    window.addEventListener('focus', refreshPass);
    window.addEventListener('storage', refreshPass);
    document.addEventListener('visibilitychange', refreshPass);

    return () => {
      window.removeEventListener(PASS_USAGE_UPDATED_EVENT, refreshPass);
      window.removeEventListener('focus', refreshPass);
      window.removeEventListener('storage', refreshPass);
      document.removeEventListener('visibilitychange', refreshPass);
    };
  }, [initialPass]);

  if (!dashboardGuestPass) {
    return null;
  }

  const dashboardPassCopy = buildDashboardPassCopy(dashboardGuestPass, copy);

  return (
    <div
      aria-live="polite"
      className={`dashboard-pass-banner ${dashboardPassCopy.tone}`}
    >
      <div>
        <span>{copy.active}</span>
        <strong>{dashboardGuestPass.label}</strong>
        <p>{dashboardPassCopy.body}</p>
      </div>
      <Link className="button secondary" href="/dashboard/redeem-pass">
        {copy.manage}
      </Link>
    </div>
  );
}
