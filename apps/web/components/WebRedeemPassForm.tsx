'use client';

import { useEffect, useState } from 'react';
import { formatPassCode, normalizePassCode } from '@pridicta/access';
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
    text: 'Sign in first, then redeem the pass using the same email used when the pass was created.',
  });
  const [deviceId, setDeviceId] = useState('');
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
        text: 'Please sign in first. Use Google sign-in or create an account with the exact email that was approved for this pass.',
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
          result.status === 'EMAIL_NOT_ALLOWED' && user.email
            ? `This pass is not assigned to ${user.email}. Please sign out and sign in with the exact email address used when this pass was created.`
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
        <h2>Sign in with the approved email first.</h2>
        <p>
          A private pass is tied to one email address. Ask the person who created
          the pass which email was approved, then sign in with that same email
          before entering the code.
        </p>
        <ol>
          <li>Use Google sign-in, or create an account with the approved email.</li>
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
      <div className="field-stack">
        <label className="field-label" htmlFor="pass-email">
          Approved email
        </label>
        <input
          disabled
          id="pass-email"
          placeholder="Sign in to confirm your email"
          type="email"
          value={user?.email ?? ''}
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
    </div>
  );
}

function getBrowserDeviceId(): string {
  return getOrCreateBrowserDeviceId();
}
