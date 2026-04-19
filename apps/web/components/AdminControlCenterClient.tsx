'use client';

import type { AccessLevel, GuestPassUsageSummary, PassCodeType } from '@pridicta/types';
import { useState } from 'react';
import { AuthDialog } from './AuthDialog';
import { Card } from './Card';
import { StatusPill } from './StatusPill';
import { getCurrentWebAuthUser, getWebBackendAuthorityClient } from '../lib/backendAuthorityClient';

const passTypes: PassCodeType[] = [
  'GUEST_TRIAL',
  'VIP_REVIEW',
  'INVESTOR_PASS',
  'FAMILY_PASS',
  'INTERNAL_TEST',
];

const accessLevels: Extract<AccessLevel, 'GUEST' | 'VIP_GUEST' | 'FULL_ACCESS'>[] = [
  'GUEST',
  'VIP_GUEST',
  'FULL_ACCESS',
];

const grantLevels: Extract<AccessLevel, 'FREE' | 'FULL_ACCESS' | 'ADMIN'>[] = [
  'FREE',
  'FULL_ACCESS',
  'ADMIN',
];

export function AdminControlCenterClient(): React.JSX.Element {
  const [allowedEmail, setAllowedEmail] = useState('');
  const [accessLevel, setAccessLevel] =
    useState<Extract<AccessLevel, 'GUEST' | 'VIP_GUEST' | 'FULL_ACCESS'>>(
      'VIP_GUEST',
    );
  const [busy, setBusy] = useState(false);
  const [grantEmail, setGrantEmail] = useState('');
  const [grantLevel, setGrantLevel] =
    useState<Extract<AccessLevel, 'FREE' | 'FULL_ACCESS' | 'ADMIN'>>(
      'FULL_ACCESS',
    );
  const [label, setLabel] = useState('Private Predicta Pass');
  const [maxRedemptions, setMaxRedemptions] = useState('1');
  const [message, setMessage] = useState('');
  const [passType, setPassType] = useState<PassCodeType>('VIP_REVIEW');
  const [revokeCodeId, setRevokeCodeId] = useState('');
  const [revokeReason, setRevokeReason] = useState('Revoked by admin');
  const [passes, setPasses] = useState<GuestPassUsageSummary[]>([]);
  const [createdCode, setCreatedCode] = useState('');

  async function requireSignedInAdminAction(action: () => Promise<void>) {
    if (!getCurrentWebAuthUser()) {
      setMessage('Sign in with an admin account before using these controls.');
      return;
    }

    try {
      setBusy(true);
      setMessage('');
      await action();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'This admin action could not be completed right now.',
      );
    } finally {
      setBusy(false);
    }
  }

  function createPass() {
    return requireSignedInAdminAction(async () => {
      const result = await getWebBackendAuthorityClient().createGuestPassCode({
        accessLevel,
        allowedEmails: allowedEmail
          .split(',')
          .map(email => email.trim())
          .filter(Boolean),
        label,
        maxRedemptions: Number(maxRedemptions) || 1,
        type: passType,
      });
      setCreatedCode(result.formattedCode);
      setMessage('Guest pass created. Copy the code now; it is shown only once.');
      await refreshPasses();
    });
  }

  function grantAccess() {
    return requireSignedInAdminAction(async () => {
      const result = await getWebBackendAuthorityClient().grantAccess({
        accessLevel: grantLevel,
        email: grantEmail.trim(),
        reason: `Admin web grant: ${grantLevel}`,
      });
      setMessage(
        `${result.email ?? result.userId} updated to ${
          result.admin ? 'Admin' : result.fullAccess ? 'Full access' : 'Free'
        }.`,
      );
    });
  }

  function revokePass() {
    return requireSignedInAdminAction(async () => {
      await getWebBackendAuthorityClient().revokeGuestPassCode(
        revokeCodeId.trim(),
        revokeReason.trim() || 'Revoked by admin',
      );
      setMessage('Guest pass revoked.');
      await refreshPasses();
    });
  }

  function refreshPasses() {
    return requireSignedInAdminAction(async () => {
      setPasses(await getWebBackendAuthorityClient().listGuestPassCodes());
    });
  }

  return (
    <div className="admin-command-grid">
      <Card className="glass-panel admin-command-primary">
        <div className="card-content spacious">
          <StatusPill label="Invitation access" tone="premium" />
          <h2>Create email-bound guest pass</h2>
          <p>
            Create a pass for a specific guest. The code appears once so you can
            share it with the right person.
          </p>
          <div className="admin-form-preview">
            <label>
              Label
              <input value={label} onChange={event => setLabel(event.target.value)} />
            </label>
            <label>
              Allowed email
              <input
                placeholder="investor@example.com"
                value={allowedEmail}
                onChange={event => setAllowedEmail(event.target.value)}
              />
            </label>
            <label>
              Pass type
              <select
                value={passType}
                onChange={event => setPassType(event.target.value as PassCodeType)}
              >
                {passTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Access level
              <select
                value={accessLevel}
                onChange={event =>
                  setAccessLevel(event.target.value as typeof accessLevel)
                }
              >
                {accessLevels.map(level => (
                  <option key={level} value={level}>
                    {level.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Max redemptions
              <input
                min="1"
                type="number"
                value={maxRedemptions}
                onChange={event => setMaxRedemptions(event.target.value)}
              />
            </label>
            <button className="button" disabled={busy} onClick={createPass} type="button">
              {busy ? 'Working...' : 'Create Guest Pass'}
            </button>
          </div>

          {createdCode ? (
            <div className="dialog-message">
              <strong>Copy now:</strong> {createdCode}
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <h2>Admin access grant</h2>
          <p>
            Grant approved people admin or full-access status.
          </p>
          <div className="admin-form-preview">
            <label>
              User email
              <input
                placeholder="approved@example.com"
                value={grantEmail}
                onChange={event => setGrantEmail(event.target.value)}
              />
            </label>
            <label>
              Access grant
              <select
                value={grantLevel}
                onChange={event => setGrantLevel(event.target.value as typeof grantLevel)}
              >
                {grantLevels.map(level => (
                  <option key={level} value={level}>
                    {level.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>
            <button className="button secondary" disabled={busy} onClick={grantAccess} type="button">
              Apply Access
            </button>
          </div>
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <h2>Pass inventory</h2>
          <p>Review active passes, redemption counts, and guest access levels.</p>
          <div className="dialog-actions">
            <button className="button secondary" disabled={busy} onClick={refreshPasses} type="button">
              Refresh Passes
            </button>
            <AuthDialog />
          </div>
          <div className="admin-table">
            {passes.map(pass => (
              <div className="admin-table-row" key={pass.codeId}>
                <div>
                  <strong>{pass.label}</strong>
                  <span>{pass.codeId}</span>
                </div>
                <span>{pass.type}</span>
                <span>{pass.accessLevel}</span>
                <span>{pass.redemptionCount}/{pass.maxRedemptions}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="glass-panel">
        <div className="card-content spacious">
          <h2>Revoke guest pass</h2>
          <p>Disable a pass immediately when access should be removed.</p>
          <div className="admin-form-preview">
            <label>
              Code ID
              <input
                placeholder="pass_..."
                value={revokeCodeId}
                onChange={event => setRevokeCodeId(event.target.value)}
              />
            </label>
            <label>
              Reason
              <input
                value={revokeReason}
                onChange={event => setRevokeReason(event.target.value)}
              />
            </label>
            <button className="button secondary" disabled={busy} onClick={revokePass} type="button">
              Revoke Pass
            </button>
          </div>
        </div>
      </Card>

      {message ? <p className="dialog-message admin-client-message">{message}</p> : null}
    </div>
  );
}
