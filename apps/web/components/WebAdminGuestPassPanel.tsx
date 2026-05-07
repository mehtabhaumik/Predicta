'use client';

import { useState } from 'react';
import type { GuestPassCode, PassCodeType } from '@pridicta/types';

const passTypes: PassCodeType[] = [
  'GUEST_TRIAL',
  'VIP_REVIEW',
  'INVESTOR_PASS',
  'FAMILY_PASS',
  'INTERNAL_TEST',
];

export function WebAdminGuestPassPanel(): React.JSX.Element {
  const [token, setToken] = useState('');
  const [passes, setPasses] = useState<GuestPassCode[]>([]);
  const [message, setMessage] = useState('Enter the owner access token to list or create passes.');
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState({
    accessLevel: 'GUEST',
    code: '',
    codeId: '',
    label: '',
    maxRedemptions: 5,
    type: 'GUEST_TRIAL' as PassCodeType,
  });

  async function loadPasses() {
    try {
      setBusy(true);
      const response = await fetch('/api/access/admin/guest-passes', {
        headers: { 'x-pridicta-admin-token': token },
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'The secure pass service rejected the request.');
        return;
      }

      setPasses(payload);
      setMessage(`${payload.length} secure passes loaded.`);
    } catch {
      setMessage('Secure pass service is not reachable.');
    } finally {
      setBusy(false);
    }
  }

  async function createPass() {
    try {
      setBusy(true);
      const response = await fetch('/api/access/admin/guest-passes', {
        body: JSON.stringify({
          ...draft,
          maxRedemptions: Number(draft.maxRedemptions),
        }),
        headers: {
          'Content-Type': 'application/json',
          'x-pridicta-admin-token': token,
        },
        method: 'POST',
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'Pass creation failed.');
        return;
      }

      setPasses(current => [payload, ...current.filter(item => item.codeId !== payload.codeId)]);
      setDraft(current => ({ ...current, code: '', codeId: '', label: '' }));
      setMessage(`${payload.label} created securely.`);
    } catch {
      setMessage('Secure pass service is not reachable.');
    } finally {
      setBusy(false);
    }
  }

  async function revokePass(codeId: string) {
    try {
      setBusy(true);
      const response = await fetch(
        `/api/access/admin/guest-passes/${encodeURIComponent(codeId)}/revoke`,
        {
          body: JSON.stringify({ reason: 'Revoked from web admin console.' }),
          headers: {
            'Content-Type': 'application/json',
            'x-pridicta-admin-token': token,
          },
          method: 'POST',
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'Pass revocation failed.');
        return;
      }

      setPasses(current =>
        current.map(item => (item.codeId === payload.codeId ? payload : item)),
      );
      setMessage(`${payload.codeId} revoked.`);
    } catch {
      setMessage('Secure pass service is not reachable.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-guest-pass-panel">
      <div className="card glass-panel">
        <div className="card-content spacious">
          <div className="section-title">OWNER ACCESS</div>
          <h2>Secure pass control</h2>
          <p>
            Guest passes are created, listed, and revoked through the secure
            owner service. The browser never decides private pass rules by
            itself.
          </p>
          <div className="field-stack">
            <label className="field-label" htmlFor="admin-token">
              Owner access token
            </label>
            <input
              id="admin-token"
              onChange={event => setToken(event.target.value)}
              placeholder="Enter owner access token"
              type="password"
              value={token}
            />
          </div>
          <p className="form-status idle">{message}</p>
          <button className="button" disabled={busy || !token} onClick={loadPasses} type="button">
            Load Passes
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-content spacious">
          <div className="section-title">CREATE PASS</div>
          <h2>Issue a private invite.</h2>
          <div className="admin-form-grid">
            <input
              aria-label="Code ID"
              onChange={event => setDraft(current => ({ ...current, codeId: event.target.value }))}
              placeholder="code-id"
              value={draft.codeId}
            />
            <input
              aria-label="Private code"
              onChange={event => setDraft(current => ({ ...current, code: event.target.value }))}
              placeholder="private raw code"
              value={draft.code}
            />
            <input
              aria-label="Label"
              onChange={event => setDraft(current => ({ ...current, label: event.target.value }))}
              placeholder="VIP beta pass"
              value={draft.label}
            />
            <select
              aria-label="Pass type"
              onChange={event =>
                setDraft(current => ({ ...current, type: event.target.value as PassCodeType }))
              }
              value={draft.type}
            >
              {passTypes.map(type => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <select
              aria-label="Access level"
              onChange={event => setDraft(current => ({ ...current, accessLevel: event.target.value }))}
              value={draft.accessLevel}
            >
              <option>GUEST</option>
              <option>VIP_GUEST</option>
              <option>FULL_ACCESS</option>
            </select>
            <input
              aria-label="Max redemptions"
              min={1}
              onChange={event =>
                setDraft(current => ({
                  ...current,
                  maxRedemptions: Number(event.target.value),
                }))
              }
              type="number"
              value={draft.maxRedemptions}
            />
          </div>
          <button
            className="button"
            disabled={busy || !token || !draft.code || !draft.codeId || !draft.label}
            onClick={createPass}
            type="button"
          >
            Create Secure Pass
          </button>
        </div>
      </div>

      <div className="admin-pass-list">
        {passes.map(pass => (
          <article className="card" key={pass.codeId}>
            <div className="card-content">
              <div className="section-title">{pass.type}</div>
              <h2>{pass.label}</h2>
              <p>
                {pass.codeId} · {pass.accessLevel} · {pass.redeemedByUserIds.length}/
                {pass.maxRedemptions} used
              </p>
              <button
                className="button secondary"
                disabled={busy || !pass.isActive}
                onClick={() => revokePass(pass.codeId)}
                type="button"
              >
                {pass.isActive ? 'Revoke' : 'Revoked'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
