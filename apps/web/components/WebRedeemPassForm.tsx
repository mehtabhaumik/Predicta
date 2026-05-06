'use client';

import { useEffect, useState } from 'react';
import { formatPassCode, normalizePassCode } from '@pridicta/access';

type RedemptionStatus = {
  tone: 'error' | 'success' | 'idle';
  text: string;
};

export function WebRedeemPassForm(): React.JSX.Element {
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<RedemptionStatus>({
    tone: 'idle',
    text: 'Backend authority checks the code, redemption count, expiry, and device limit.',
  });
  const [deviceId, setDeviceId] = useState('');
  const [userId, setUserId] = useState('');

  useEffect(() => {
    setDeviceId(getBrowserDeviceId());
    setUserId(getBrowserUserId());
  }, []);

  async function redeem() {
    const normalized = normalizePassCode(code);

    if (!normalized) {
      setStatus({ tone: 'error', text: 'Enter the guest pass code first.' });
      return;
    }

    const resolvedDeviceId = deviceId || getBrowserDeviceId();
    const resolvedUserId = userId || getBrowserUserId();

    try {
      setBusy(true);
      const response = await fetch('/api/access/redeem-pass', {
        body: JSON.stringify({
          code,
          deviceId: resolvedDeviceId,
          email: email.trim() || undefined,
          userId: resolvedUserId,
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok || result.status !== 'SUCCESS') {
        setStatus({
          tone: 'error',
          text: result.detail ?? result.message ?? 'This pass could not be redeemed.',
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
        text: `${result.redeemedPass.label} is active on this browser profile.`,
      });
    } catch {
      setStatus({
        tone: 'error',
        text: 'Backend pass authority is not reachable. Please try again later.',
      });
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
          id="pass-code"
          onChange={event => setCode(event.target.value)}
          placeholder={formatPassCode(normalizePassCode('pridicta vip example'))}
          type="text"
          value={code}
        />
      </div>
      <div className="field-stack">
        <label className="field-label" htmlFor="pass-email">
          Email, if the invite is email-restricted
        </label>
        <input
          id="pass-email"
          onChange={event => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
      </div>
      <p className={`form-status ${status.tone}`}>{status.text}</p>
      <button className="button" disabled={busy} onClick={redeem} type="button">
        {busy ? 'Checking...' : 'Redeem Pass'}
      </button>
    </div>
  );
}

function getBrowserUserId(): string {
  return getOrCreateLocalId('pridicta.webUserId.v1', 'web-user');
}

function getBrowserDeviceId(): string {
  return getOrCreateLocalId('pridicta.webDeviceId.v1', 'web-device');
}

function getOrCreateLocalId(key: string, prefix: string): string {
  const current = window.localStorage.getItem(key);

  if (current) {
    return current;
  }

  const next = `${prefix}-${crypto.randomUUID()}`;
  window.localStorage.setItem(key, next);
  return next;
}
