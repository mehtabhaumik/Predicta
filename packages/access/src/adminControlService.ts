import type {
  AdminActionType,
  AdminAuditLog,
  GuestPassCode,
  GuestPassUsageSummary,
  ResolvedAccess,
} from '@pridicta/types';
import { canSeeAdminRoute } from './accessResolver';
import { normalizeEmail } from './accessControlService';

export function assertCanUseAdminTools(access: ResolvedAccess): void {
  if (!canSeeAdminRoute(access)) {
    throw new Error('Admin access is required for this operation.');
  }
}

export function canManageGuestPasses(access: ResolvedAccess): boolean {
  return canSeeAdminRoute(access);
}

export function summarizeGuestPassCode(
  passCode: GuestPassCode,
): GuestPassUsageSummary {
  const redeemedDeviceIds = passCode.redeemedDeviceIds ?? [];
  const remainingRedemptions = Math.max(
    passCode.maxRedemptions - passCode.redeemedByUserIds.length,
    0,
  );

  return {
    accessLevel: passCode.accessLevel,
    allowedEmailCount: passCode.allowedEmails?.length ?? 0,
    codeId: passCode.codeId,
    deviceCount: redeemedDeviceIds.length,
    deviceLimit: passCode.deviceLimit,
    expiresAt: passCode.expiresAt,
    isActive: passCode.isActive && !passCode.revokedAt,
    label: passCode.label,
    maxRedemptions: passCode.maxRedemptions,
    redemptionCount: passCode.redeemedByUserIds.length,
    remainingRedemptions,
    revokedAt: passCode.revokedAt,
    type: passCode.type,
    usageLimits: passCode.usageLimits,
  };
}

export function createAdminAuditLog({
  actionId,
  actionType,
  actorEmail,
  actorUserId,
  createdAt = new Date().toISOString(),
  message,
  metadata,
  targetEmail,
  targetResourceId,
  targetUserId,
}: {
  actionId: string;
  actionType: AdminActionType;
  actorEmail?: string;
  actorUserId: string;
  createdAt?: string;
  message: string;
  metadata?: AdminAuditLog['metadata'];
  targetEmail?: string;
  targetResourceId?: string;
  targetUserId?: string;
}): AdminAuditLog {
  return {
    actionId,
    actionType,
    actorEmail: normalizeEmail(actorEmail),
    actorUserId,
    createdAt,
    message,
    metadata,
    targetEmail: normalizeEmail(targetEmail),
    targetResourceId,
    targetUserId,
  };
}

export function buildPassCreatedAuditLog({
  actorEmail,
  actorUserId,
  createdAt,
  passCode,
}: {
  actorEmail?: string;
  actorUserId: string;
  createdAt?: string;
  passCode: GuestPassCode;
}): AdminAuditLog {
  return createAdminAuditLog({
    actionId: `pass-created-${passCode.codeId}-${createdAt ?? passCode.createdAt}`,
    actionType: 'pass_created',
    actorEmail,
    actorUserId,
    createdAt: createdAt ?? passCode.createdAt,
    message: `Created ${passCode.label}.`,
    metadata: {
      accessLevel: passCode.accessLevel,
      allowedEmailCount: passCode.allowedEmails?.length ?? 0,
      maxRedemptions: passCode.maxRedemptions,
      type: passCode.type,
    },
    targetEmail: passCode.allowedEmails?.length === 1 ? passCode.allowedEmails[0] : undefined,
    targetResourceId: passCode.codeId,
  });
}

export function buildPassRevokedAuditLog({
  actorEmail,
  actorUserId,
  passCode,
  reason,
  revokedAt,
}: {
  actorEmail?: string;
  actorUserId: string;
  passCode: GuestPassCode;
  reason: string;
  revokedAt: string;
}): AdminAuditLog {
  return createAdminAuditLog({
    actionId: `pass-revoked-${passCode.codeId}-${revokedAt}`,
    actionType: 'pass_revoked',
    actorEmail,
    actorUserId,
    createdAt: revokedAt,
    message: `Revoked ${passCode.label}.`,
    metadata: {
      reason,
      redemptionCount: passCode.redeemedByUserIds.length,
      type: passCode.type,
    },
    targetResourceId: passCode.codeId,
  });
}
