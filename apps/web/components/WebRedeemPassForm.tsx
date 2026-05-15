'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { formatPassCode, normalizePassCode } from '@pridicta/access';
import type { RedeemedGuestPass } from '@pridicta/types';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseWebAuth } from '../lib/firebase/client';
import {
  getOrCreateBrowserDeviceId,
} from '../lib/web-guest-session';
import { AuthDialog } from './AuthDialog';

type RedemptionStatus = {
  tone: 'error' | 'success' | 'idle';
  text: string;
};

export function WebRedeemPassForm(): React.JSX.Element {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<RedemptionStatus>({
    tone: 'idle',
    text: 'Sign in first with the email used for your pass, then enter the code.',
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

  async function redeem() {
    const normalized = normalizePassCode(code);

    if (!normalized) {
      setStatus({ tone: 'error', text: 'Enter the guest pass code first.' });
      return;
    }

    if (!user?.email) {
      setStatus({
        tone: 'error',
        text: 'Please sign in first. Use Google sign-in or create an account with the email used for your pass. If you are not sure, contact the Predicta admin or the person who invited you.',
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
            ? 'This pass is not available for the email currently signed in. Please sign out and sign in with the email used when your pass was created. If you are not sure, contact the Predicta admin or the person who invited you.'
            : result.detail ?? result.message ?? 'This pass could not be redeemed.';
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
      setRedeemedPass(result.redeemedPass);
      setCode('');
      setStatus({
        tone: 'success',
        text: `${result.redeemedPass.label} is active for ${user.email}.`,
      });
    } catch {
      setStatus({
        tone: 'error',
        text: 'Private pass check is not available right now. Please try again later.',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-content spacious">
      <div className="redeem-guidance">
        <div className="section-title">HOW TO REDEEM</div>
        <h2>Sign in with the pass email first.</h2>
        <p>
          A private pass is tied to one email address. If you remember the email
          used for your pass, sign in with it. If you are not sure, contact the
          Predicta admin or the person who invited you.
        </p>
        <ol>
          <li>Use Google sign-in, or create an account with the pass email.</li>
          <li>Enter the private pass code exactly as shared.</li>
          <li>If the email does not match, Predicta will not redeem the pass.</li>
        </ol>
        <div className="redeem-auth-row">
          <AuthDialog />
          <span>
            {user?.email
              ? `Signed in as ${user.email}`
              : 'Not signed in yet'}
          </span>
        </div>
      </div>
      <div className="redeem-account-status">
        <span>Account check</span>
        <strong>
          {user?.email ? `Signed in as ${user.email}` : 'Sign in to continue'}
        </strong>
        <p>
          Predicta automatically checks your signed-in email against the pass.
          You never need to type your email on this page.
        </p>
      </div>
      <div className="field-stack">
        <label className="field-label" htmlFor="pass-code">
          Pass code
        </label>
        <input
          id="pass-code"
          onChange={event => setCode(event.target.value)}
          placeholder={formatPassCode(normalizePassCode('pridicta vip example'))}
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
        {busy ? 'Checking...' : 'Redeem Pass'}
      </button>
      {redeemedPass ? (
        <div className="redeem-next-steps">
          <div className="section-title">PASS ACTIVE</div>
          <h2>Start with these three steps.</h2>
          <p>
            Your private preview is active. The fastest path is to create your
            Kundli, ask Predicta one real question, then try a report preview.
          </p>
          <div className="redeem-next-step-grid">
            <Link className="button" href="/dashboard/kundli">
              Create Kundli
            </Link>
            <Link
              className="button secondary"
              href="/dashboard/chat?sourceScreen=Private+Pass&prompt=Help+me+start+with+my+Kundli."
            >
              Ask Predicta
            </Link>
            <Link className="button secondary" href="/dashboard/report">
              Preview Report
            </Link>
            <Link
              className="button secondary"
              href="/feedback?source=family-friends&area=general&from=redeem-pass"
            >
              Give Feedback
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
