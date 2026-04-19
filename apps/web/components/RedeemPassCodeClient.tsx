'use client';

import { formatPassCode, normalizePassCode } from '@pridicta/access';
import type { RedeemedGuestPass } from '@pridicta/types';
import { useState } from 'react';
import { AuthDialog } from './AuthDialog';
import { getCurrentWebAuthUser, getWebBackendAuthorityClient } from '../lib/backendAuthorityClient';

const example = formatPassCode(normalizePassCode('predicta vip example'));

export function RedeemPassCodeClient(): React.JSX.Element {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [redeemedPass, setRedeemedPass] = useState<RedeemedGuestPass | null>(
    null,
  );

  async function redeemPass() {
    if (!normalizePassCode(code)) {
      setMessage('Enter the guest pass code you received.');
      return;
    }

    if (!getCurrentWebAuthUser()) {
      setMessage('Sign in first so this pass can be protected on your account.');
      return;
    }

    try {
      setBusy(true);
      setMessage('');
      const pass = await getWebBackendAuthorityClient().redeemPassCode({
        code,
        deviceId: getBrowserDeviceId(),
      });
      setRedeemedPass(pass);
      setCode('');
      setMessage(`${pass.label} is now active on this account.`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'This pass could not be redeemed right now.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card-content spacious">
      <div className="field-stack">
        <label className="field-label" htmlFor="pass-code">
          Pass code
        </label>
        <input
          autoCapitalize="characters"
          autoComplete="off"
          id="pass-code"
          onChange={event => setCode(event.target.value)}
          placeholder={example}
          type="text"
          value={code}
        />
      </div>

      <p>
        If the code cannot be used, Predicta will explain what to do next.
      </p>

      {redeemedPass ? (
        <div className="admin-summary-grid">
          <span>{redeemedPass.accessLevel} active</span>
          <span>{redeemedPass.usageLimits.questionsTotal} questions</span>
          <span>{redeemedPass.usageLimits.deepReadingsTotal} deep readings</span>
          <span>{redeemedPass.usageLimits.premiumPdfsTotal} PDFs</span>
        </div>
      ) : null}

      {message ? <p className="dialog-message">{message}</p> : null}

      <div className="dialog-actions redeem-actions">
        <button className="button" disabled={busy} onClick={redeemPass} type="button">
          {busy ? 'Checking...' : 'Redeem Pass'}
        </button>
        <AuthDialog />
      </div>
    </div>
  );
}

function getBrowserDeviceId(): string {
  const storageKey = 'predicta.web.deviceId';
  const existing = window.localStorage.getItem(storageKey);

  if (existing) {
    return existing;
  }

  const next =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(storageKey, next);
  return next;
}
