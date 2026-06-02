'use client';

import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatPassCode, normalizePassCode } from '@pridicta/access';
import type { RedeemedGuestPass } from '@pridicta/types';
import type { SupportedLanguage } from '@pridicta/types';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseWebAuth } from '../lib/firebase/client';
import { useLanguagePreference } from '../lib/language-preference';
import {
  getOrCreateBrowserDeviceId,
} from '../lib/web-guest-session';
import { PASS_USAGE_UPDATED_EVENT } from '../lib/web-pass-cost-guardrails';
import { AuthDialog } from './AuthDialog';

type RedemptionStatus = {
  tone: 'error' | 'success' | 'idle';
  text: string;
};

export function WebRedeemPassForm(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = REDEEM_PASS_FORM_COPY[language] ?? REDEEM_PASS_FORM_COPY.en;
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<RedemptionStatus>({
    tone: 'idle',
    text: copy.initialStatus,
  });
  const [deviceId, setDeviceId] = useState('');
  const [redeemedPass, setRedeemedPass] = useState<RedeemedGuestPass>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setDeviceId(getBrowserDeviceId());

    try {
      return onAuthStateChanged(getFirebaseWebAuth(), setUser);
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    setStatus(current =>
      current.tone === 'idle'
        ? {
            tone: 'idle',
            text: copy.initialStatus,
          }
        : current,
    );
  }, [copy.initialStatus]);

  async function redeem() {
    const normalized = normalizePassCode(code);

    if (!normalized) {
      setStatus({ tone: 'error', text: copy.status.enterCode });
      return;
    }

    if (!user?.email) {
      setStatus({
        tone: 'error',
        text: copy.status.signInFirst,
      });
      return;
    }

    const resolvedDeviceId = deviceId || getBrowserDeviceId();

    try {
      setBusy(true);
      const response = await fetch('/api/access/redeem-pass', {
        body: JSON.stringify({
          code,
          deviceId: resolvedDeviceId,
          email: user.email,
          userId: user.uid,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok || result.status !== 'SUCCESS') {
        const detail =
          result.status === 'EMAIL_NOT_ALLOWED'
            ? copy.status.emailNotAllowed
            : result.detail ?? result.message ?? copy.status.couldNotRedeem;
        setStatus({
          tone: 'error',
          text: detail,
        });
        return;
      }

      window.localStorage.setItem(
        'pridicta.redeemedGuestPass.v1',
        JSON.stringify(result.redeemedPass),
      );
      window.dispatchEvent(new CustomEvent(PASS_USAGE_UPDATED_EVENT));
      setRedeemedPass(result.redeemedPass);
      setCode('');
      setStatus({
        tone: 'success',
        text: copy.status.activeFor(result.redeemedPass.label, user.email),
      });
    } catch {
      setStatus({
        tone: 'error',
        text: copy.status.tryAgain,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-content spacious">
      <div className="redeem-guidance">
        <div className="section-title">{copy.guidance.eyebrow}</div>
        <h2>{copy.guidance.title}</h2>
        <p>{copy.guidance.body}</p>
        <ol>
          {copy.guidance.steps.map(step => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <div className="redeem-account-status">
          <span>{copy.account.eyebrow}</span>
          <strong>
            {user?.email
              ? copy.account.signedInAs(user.email)
              : copy.account.signInToContinue}
          </strong>
          <p>{copy.account.body}</p>
          <div className="redeem-auth-row">
            {user?.email ? (
              <Link className="button secondary" href="/dashboard/settings">
                {language === 'hi'
                  ? getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.de781e7886")
                  : language === 'gu'
                    ? getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.b98a22f015")
                    : 'Open account'}
              </Link>
            ) : (
              <AuthDialog />
            )}
            <span>
              {user?.email
                ? copy.account.signedInAs(user.email)
                : copy.account.notSignedIn}
            </span>
          </div>
        </div>
      </div>
      <div className="field-stack">
        <label className="field-label" htmlFor="pass-code">
          {copy.fieldLabel}
        </label>
        <input
          id="pass-code"
          onChange={event => setCode(event.target.value)}
          placeholder={formatPassCode(normalizePassCode(copy.placeholderSeed))}
          type="text"
          value={code}
        />
      </div>
      <p className={`form-status ${status.tone}`}>{status.text}</p>
      <button
        className="button"
        disabled={busy || !user?.email}
        onClick={redeem}
        type="button"
      >
        {busy ? copy.busyLabel : copy.submitLabel}
      </button>
      {redeemedPass ? (
        <div className="redeem-next-steps">
          <div className="section-title">{copy.nextSteps.eyebrow}</div>
          <h2>{copy.nextSteps.title}</h2>
          <p>{copy.nextSteps.body}</p>
          <div className="redeem-pass-inclusion-card">
            <span>{copy.nextSteps.includes}</span>
            <strong>
              {redeemedPass.usageLimits.questionsTotal} AI ·{' '}
              {redeemedPass.usageLimits.deepReadingsTotal} deep ·{' '}
              {redeemedPass.usageLimits.premiumPdfsTotal} PDFs
            </strong>
            <p>
              {copy.nextSteps.expires}{' '}
              {new Date(redeemedPass.expiresAt).toLocaleDateString()}
            </p>
          </div>
          <div className="redeem-next-step-grid">
            <Link className="button" href="/dashboard/kundli">
              {copy.nextSteps.createKundli}
            </Link>
            <Link
              className="button secondary"
              href={`/dashboard/vedic/chat?sourceScreen=Private+Pass&prompt=${encodeURIComponent(copy.nextSteps.askPrompt)}`}
            >
              {copy.nextSteps.askPredicta}
            </Link>
            <Link className="button secondary" href="/dashboard/report">
              {copy.nextSteps.previewReport}
            </Link>
            <Link
              className="button secondary"
              href="/feedback?source=family-friends&area=general&from=redeem-pass"
            >
              {copy.nextSteps.giveFeedback}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function getBrowserDeviceId(): string {
  return getOrCreateBrowserDeviceId();
}

const REDEEM_PASS_FORM_COPY: Record<
  SupportedLanguage,
  {
    account: {
      body: string;
      eyebrow: string;
      notSignedIn: string;
      signInToContinue: string;
      signedInAs: (email: string) => string;
    };
    busyLabel: string;
    fieldLabel: string;
    guidance: {
      body: string;
      eyebrow: string;
      steps: string[];
      title: string;
    };
    initialStatus: string;
    nextSteps: {
      askPredicta: string;
      askPrompt: string;
      body: string;
      createKundli: string;
      eyebrow: string;
      expires: string;
      giveFeedback: string;
      includes: string;
      previewReport: string;
      title: string;
    };
    placeholderSeed: string;
    status: {
      activeFor: (label: string, email: string) => string;
      couldNotRedeem: string;
      emailNotAllowed: string;
      enterCode: string;
      signInFirst: string;
      tryAgain: string;
    };
    submitLabel: string;
  }
> = {
  en: {
    account: {
      body:
        'Predicta automatically checks your signed-in email against the pass. You never need to type your email on this page.',
      eyebrow: 'Account check',
      notSignedIn: 'Not signed in yet',
      signInToContinue: 'Sign in to continue',
      signedInAs: email => `Signed in as ${email}`,
    },
    busyLabel: 'Checking...',
    fieldLabel: 'Pass code',
    guidance: {
      body:
        'A private pass is tied to one approved email address. If you remember the email used for your pass, sign in with it. If you are not sure, contact the Predicta admin or pass creator.',
      eyebrow: 'HOW TO REDEEM',
      steps: [
        'Use Google sign-in, or create an account with the pass email.',
        'Enter the private pass code exactly as shared.',
        'If the email does not match, Predicta will not redeem the pass.',
      ],
      title: 'Sign in with the pass email first.',
    },
    initialStatus: 'Sign in first with the email used for your pass, then enter the code.',
    nextSteps: {
      askPredicta: 'Ask Predicta',
      askPrompt: 'Help me start with my Kundli.',
      body:
        'Your private preview is active. The fastest path is to create your Kundli, ask Predicta one real question, then try a report preview.',
      createKundli: 'Create Kundli',
      eyebrow: 'PASS ACTIVE',
      expires: 'Expires on',
      giveFeedback: 'Give Feedback',
      includes: 'Included balance',
      previewReport: 'Preview Report',
      title: 'Start with these three steps.',
    },
    placeholderSeed: 'pridicta vip example',
    status: {
      activeFor: (label, email) => `${label} is active for ${email}.`,
      couldNotRedeem: 'This pass could not be redeemed.',
      emailNotAllowed:
        'This pass is tied to a different approved email. Please sign out and use the email shared with the pass. If you are not sure, contact the Predicta admin or pass creator.',
      enterCode: 'Enter the guest pass code first.',
      signInFirst:
        'Please sign in first. Use Google sign-in or create an account with the email used for your pass. If you are not sure, contact the Predicta admin or pass creator.',
      tryAgain:
        'We could not check this private pass right now. Please try again in a moment.',
    },
    submitLabel: 'Redeem Pass',
  },
  hi: {
    account: {
      body:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.00d3752d37"),
      eyebrow: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.97c4c6db87"),
      notSignedIn: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.ee7b30a0c4"),
      signInToContinue: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.486fcc5015"),
      signedInAs: email => formatNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.9bc3624836", [email]),
    },
    busyLabel: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.0e1a31a572"),
    fieldLabel: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.d7bfe6491c"),
    guidance: {
      body:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.f466855c66"),
      eyebrow: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.aa1bfedc7c"),
      steps: [
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.b57e0ad8f0"),
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.4ed7bd7751"),
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.9d090801c7"),
      ],
      title: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.0ac266cfd4"),
    },
    initialStatus: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.89f665c471"),
    nextSteps: {
      askPredicta: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.c6b9045108"),
      askPrompt: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.1e652917d8"),
      body:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.73431e9bf1"),
      createKundli: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.7cacfebde9"),
      eyebrow: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.3f475f88dc"),
      expires: 'Expires on',
      giveFeedback: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.5d32b685d5"),
      includes: 'Included balance',
      previewReport: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.30cd3ddf6a"),
      title: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.3bfd1a297f"),
    },
    placeholderSeed: 'pridicta vip udaharan',
    status: {
      activeFor: (label, email) => formatNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.04611b4e00", [label, email]),
      couldNotRedeem: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.b8a6d4b6f9"),
      emailNotAllowed:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.e37bcc99d9"),
      enterCode: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.65ba8b2f4d"),
      signInFirst:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.b2c1e0f6fb"),
      tryAgain:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.d5e8d1f538"),
    },
    submitLabel: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.14a25015c5"),
  },
  gu: {
    account: {
      body:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.83665b12ac"),
      eyebrow: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.535308edba"),
      notSignedIn: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.57259beda0"),
      signInToContinue: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.6ba83e3216"),
      signedInAs: email => formatNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.16ad325f26", [email]),
    },
    busyLabel: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.f3051d15a3"),
    fieldLabel: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.851c44c016"),
    guidance: {
      body:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.48dfac935f"),
      eyebrow: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.5ebe3b56d3"),
      steps: [
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.cbe4e32ec8"),
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.e101ba4ae6"),
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.bc50820ebf"),
      ],
      title: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.87af632065"),
    },
    initialStatus: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.e35eefead4"),
    nextSteps: {
      askPredicta: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.5b9053b229"),
      askPrompt: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.5b33e68a45"),
      body:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.362c2072d6"),
      createKundli: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.c0e4dc5abd"),
      eyebrow: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.4af50473c1"),
      expires: 'Expires on',
      giveFeedback: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.18feda7507"),
      includes: 'Included balance',
      previewReport: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.3227033f83"),
      title: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.1c312c341f"),
    },
    placeholderSeed: 'pridicta vip udaharan',
    status: {
      activeFor: (label, email) => formatNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.35ee31ee38", [label, email]),
      couldNotRedeem: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.dd365bf982"),
      emailNotAllowed:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.17b5ea407c"),
      enterCode: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.cc2f86688d"),
      signInFirst:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.b78e35b2c8"),
      tryAgain:
        getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.878fa65b8d"),
    },
    submitLabel: getNativeCopy("native.apps.web.components.WebRedeemPassForm.tsx.f1ef3ce5ab"),
  },
};
