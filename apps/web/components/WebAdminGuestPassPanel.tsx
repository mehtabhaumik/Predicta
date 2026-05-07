'use client';

import { useState } from 'react';
import type {
  GuestPassCode,
  PassCodeType,
  ReleaseReadinessReport,
  SafetyAuditEvent,
} from '@pridicta/types';

const passTypes: PassCodeType[] = [
  'GUEST_TRIAL',
  'VIP_REVIEW',
  'INVESTOR_PASS',
  'FAMILY_PASS',
  'INTERNAL_TEST',
];

const readinessCopy: Record<string, string> = {
  'Model and prompt pins': 'Answer style is approved',
  'Prompt safety contract': 'Safety promise is present',
  'Red-team evals': 'Difficult-question practice passed',
};

export function WebAdminGuestPassPanel(): React.JSX.Element {
  const [token, setToken] = useState('');
  const [passes, setPasses] = useState<GuestPassCode[]>([]);
  const [releaseReadiness, setReleaseReadiness] =
    useState<ReleaseReadinessReport>();
  const [safetyReports, setSafetyReports] = useState<SafetyAuditEvent[]>([]);
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

  async function loadSafetyReports() {
    try {
      setBusy(true);
      const response = await fetch('/api/safety/admin/reports', {
        headers: { 'x-pridicta-admin-token': token },
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'Safety review queue could not be opened.');
        return;
      }

      setSafetyReports(payload);
      setMessage(`${payload.length} safety reports loaded.`);
    } catch {
      setMessage('Safety review queue is not reachable.');
    } finally {
      setBusy(false);
    }
  }

  async function reviewSafetyReport(
    eventId: string,
    reviewStatus: SafetyAuditEvent['reviewStatus'],
  ) {
    try {
      setBusy(true);
      const response = await fetch(
        `/api/safety/admin/reports/${encodeURIComponent(eventId)}/review`,
        {
          body: JSON.stringify({
            reviewNote:
              reviewStatus === 'RESOLVED'
                ? 'Reviewed and resolved from owner console.'
                : 'Reviewed and dismissed from owner console.',
            reviewStatus,
            reviewedBy: 'owner-console',
          }),
          headers: {
            'Content-Type': 'application/json',
            'x-pridicta-admin-token': token,
          },
          method: 'POST',
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'Safety report could not be updated.');
        return;
      }

      setSafetyReports(current =>
        current.map(item => (item.id === payload.id ? payload : item)),
      );
      setMessage(`${payload.id} marked ${payload.reviewStatus.toLowerCase()}.`);
    } catch {
      setMessage('Safety review queue is not reachable.');
    } finally {
      setBusy(false);
    }
  }

  async function loadReleaseReadiness() {
    try {
      setBusy(true);
      const response = await fetch('/api/safety/admin/release-readiness', {
        headers: { 'x-pridicta-admin-token': token },
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.detail ?? 'Release readiness could not be checked.');
        return;
      }

      setReleaseReadiness(payload);
      setMessage(
        payload.releaseStatus === 'READY'
          ? 'Release readiness is clear.'
          : 'Release readiness is blocked.',
      );
    } catch {
      setMessage('Release readiness could not be checked.');
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
            owner service. Private pass rules are checked before access is
            granted.
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

      <div className="card glass-panel">
        <div className="card-content spacious">
          <div className="section-title">PUBLIC SAFETY</div>
          <h2>Ready to share.</h2>
          <p>
            Confirm Predicta is calm, responsible, and safe enough before it is
            shared more widely.
          </p>
          <button
            className="button secondary"
            disabled={busy || !token}
            onClick={loadReleaseReadiness}
            type="button"
          >
            Check Readiness
          </button>
          {releaseReadiness ? (
            <div className="release-readiness-panel">
              <strong>{releaseReadiness.releaseStatus}</strong>
              {releaseReadiness.checks.map(check => (
                <p key={check.name}>
                  {check.status}: {readinessCopy[check.name] ?? check.name}
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="card glass-panel">
        <div className="card-content spacious">
          <div className="section-title">SAFETY REVIEW</div>
          <h2>Review reported guidance.</h2>
          <p>
            Each report keeps only safety labels, answer source, review status,
            and a protected identifier. Private birth details and full chat text
            are not stored here.
          </p>
          <button
            className="button secondary"
            disabled={busy || !token}
            onClick={loadSafetyReports}
            type="button"
          >
            Load Safety Reports
          </button>
        </div>
      </div>

      <div className="admin-pass-list">
        {safetyReports.map(report => (
          <article className="card" key={report.id}>
            <div className="card-content">
              <div className="section-title">{report.reportKind}</div>
              <h2>{report.reviewStatus}</h2>
              <p>
                {report.createdAt} · {report.route} · answer source saved
              </p>
              <p>{report.safetyCategories.join(', ') || 'No category label'}</p>
              <div className="admin-action-row">
                <button
                  className="button secondary"
                  disabled={busy || report.reviewStatus === 'RESOLVED'}
                  onClick={() => reviewSafetyReport(report.id, 'RESOLVED')}
                  type="button"
                >
                  Resolve
                </button>
                <button
                  className="button secondary"
                  disabled={busy || report.reviewStatus === 'DISMISSED'}
                  onClick={() => reviewSafetyReport(report.id, 'DISMISSED')}
                  type="button"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
