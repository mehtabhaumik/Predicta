import {
  assertCanUseAdminTools,
  buildPassCreatedAuditLog,
  buildPassRevokedAuditLog,
  canManageGuestPasses,
  createEmailBoundGuestPassCode,
  revokeGuestPassCode,
  summarizeGuestPassCode,
  validateGuestPassCode,
} from '@pridicta/access';
import { createFreeEntitlement } from '../src/types/subscription';
import type { MonetizationState } from '../src/types/subscription';
import { resolveAccess } from '../src/services/access/accessResolver';

const RAW_CODE = 'PRED-ADMIN-TEST-2026';

function monetization(): MonetizationState {
  return {
    entitlement: createFreeEntitlement('local'),
    oneTimeEntitlements: [],
  };
}

describe('admin control center helpers', () => {
  it('allows only admin access to manage guest passes', () => {
    const admin = resolveAccess({
      auth: { email: 'ui.bhaumik@gmail.com', userId: 'admin-user' },
      monetization: monetization(),
    });
    const fullAccess = resolveAccess({
      auth: { email: 'sonali.jetly@gmail.com', userId: 'full-user' },
      monetization: monetization(),
    });

    expect(canManageGuestPasses(admin)).toBe(true);
    expect(canManageGuestPasses(fullAccess)).toBe(false);
    expect(() => assertCanUseAdminTools(fullAccess)).toThrow(
      'Admin access is required',
    );
  });

  it('creates strict email-bound passes and uses generic restricted errors', () => {
    const pass = createEmailBoundGuestPassCode({
      accessLevel: 'VIP_GUEST',
      allowedEmails: [' Investor@Example.com ', 'investor@example.com'],
      code: RAW_CODE,
      codeId: 'investor-email-bound',
      createdAt: '2026-04-18T00:00:00.000Z',
      createdBy: 'admin-user',
      expiresAt: '2026-08-01T00:00:00.000Z',
      label: 'Investor review pass',
      maxRedemptions: 4,
      type: 'INVESTOR_PASS',
    });

    expect(pass.allowedEmails).toEqual(['investor@example.com']);
    expect(pass.maxRedemptions).toBe(1);

    const blocked = validateGuestPassCode(pass, {
      code: RAW_CODE,
      deviceId: 'device-1',
      email: 'other@example.com',
      now: new Date('2026-04-20T00:00:00.000Z'),
      userId: 'user-1',
    });

    expect(blocked.status).toBe('EMAIL_NOT_ALLOWED');
    if (blocked.status !== 'SUCCESS') {
      expect(blocked.message).toBe(
        'This pass code could not be redeemed. Please check the code or ask the person who shared it with you.',
      );
    }
  });

  it('summarizes, revokes, and audits pass operations', () => {
    const pass = createEmailBoundGuestPassCode({
      accessLevel: 'FULL_ACCESS',
      allowedEmails: ['family@example.com'],
      code: RAW_CODE,
      codeId: 'family-email-bound',
      createdAt: '2026-04-18T00:00:00.000Z',
      createdBy: 'admin-user',
      expiresAt: '2027-04-18T00:00:00.000Z',
      label: 'Family full-access pass',
      maxRedemptions: 1,
      type: 'FAMILY_PASS',
    });

    const summary = summarizeGuestPassCode(pass);
    expect(summary.remainingRedemptions).toBe(1);
    expect(summary.allowedEmailCount).toBe(1);

    const createdAudit = buildPassCreatedAuditLog({
      actorEmail: 'UI.BHAUMIK@gmail.com',
      actorUserId: 'admin-user',
      passCode: pass,
    });
    expect(createdAudit.actionType).toBe('pass_created');
    expect(createdAudit.actorEmail).toBe('ui.bhaumik@gmail.com');
    expect(createdAudit.targetEmail).toBe('family@example.com');

    const revoked = revokeGuestPassCode({
      actorEmail: 'ui.bhaumik@gmail.com',
      actorUserId: 'admin-user',
      now: '2026-04-21T00:00:00.000Z',
      passCode: pass,
      reason: 'Investor review ended',
    });
    expect(revoked.isActive).toBe(false);
    expect(revoked.revokedAt).toBe('2026-04-21T00:00:00.000Z');

    const revokedAudit = buildPassRevokedAuditLog({
      actorEmail: 'ui.bhaumik@gmail.com',
      actorUserId: 'admin-user',
      passCode: pass,
      reason: revoked.revokeReason ?? 'Revoked',
      revokedAt: revoked.revokedAt ?? '2026-04-21T00:00:00.000Z',
    });
    expect(revokedAudit.actionType).toBe('pass_revoked');
    expect(revokedAudit.targetResourceId).toBe('family-email-bound');
  });
});
