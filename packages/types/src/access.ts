export type AccessLevel =
  | 'FREE'
  | 'GUEST'
  | 'VIP_GUEST'
  | 'FULL_ACCESS'
  | 'ADMIN';

export type PassCodeType =
  | 'GUEST_TRIAL'
  | 'VIP_REVIEW'
  | 'INVESTOR_PASS'
  | 'FAMILY_PASS'
  | 'INTERNAL_TEST';

export type GuestUsageLimits = {
  questionsTotal: number;
  deepReadingsTotal: number;
  premiumPdfsTotal: number;
};

export type GuestPassCode = {
  codeId: string;
  codeHash: string;
  label: string;
  type: PassCodeType;
  accessLevel: Extract<AccessLevel, 'GUEST' | 'VIP_GUEST' | 'FULL_ACCESS'>;
  maxRedemptions: number;
  redeemedByUserIds: string[];
  redeemedDeviceIds?: string[];
  allowedEmails?: string[];
  expiresAt: string;
  usageLimits: GuestUsageLimits;
  deviceLimit: number;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  revokedAt?: string;
  revokeReason?: string;
};

export type AdminActionType =
  | 'pass_created'
  | 'pass_revoked'
  | 'user_access_updated'
  | 'feature_flag_updated';

export type AdminAuditLog = {
  actionId: string;
  actionType: AdminActionType;
  actorUserId: string;
  actorEmail?: string;
  targetUserId?: string;
  targetEmail?: string;
  targetResourceId?: string;
  message: string;
  metadata?: Record<string, string | number | boolean | null>;
  createdAt: string;
};

export type GuestPassUsageSummary = {
  codeId: string;
  label: string;
  type: PassCodeType;
  accessLevel: GuestPassCode['accessLevel'];
  isActive: boolean;
  expiresAt: string;
  revokedAt?: string;
  maxRedemptions: number;
  redemptionCount: number;
  remainingRedemptions: number;
  deviceLimit: number;
  deviceCount: number;
  allowedEmailCount: number;
  usageLimits: GuestUsageLimits;
};

export type RedeemedGuestPass = {
  passCodeId: string;
  type: PassCodeType;
  accessLevel: Extract<AccessLevel, 'GUEST' | 'VIP_GUEST' | 'FULL_ACCESS'>;
  label: string;
  redeemedAt: string;
  expiresAt: string;
  questionsUsed: number;
  deepReadingsUsed: number;
  premiumPdfsUsed: number;
  usageLimits: GuestUsageLimits;
};

export type AccessSource =
  | 'admin_whitelist'
  | 'full_access_whitelist'
  | 'subscription'
  | 'day_pass'
  | 'guest_pass'
  | 'one_time'
  | 'free';

export type ResolvedAccess = {
  accessLevel: AccessLevel;
  isAdmin: boolean;
  hasPremiumAccess: boolean;
  hasUnrestrictedAppAccess: boolean;
  source: AccessSource;
  activeGuestPass?: RedeemedGuestPass;
};

export type PassRedemptionRequest = {
  code: string;
  userId: string;
  email?: string;
  deviceId: string;
  now?: Date;
};

export type PassRedemptionResult =
  | {
      redeemedPass: RedeemedGuestPass;
      status: 'SUCCESS';
      updatedPassCode: GuestPassCode;
    }
  | {
      message: string;
      status:
        | 'INVALID'
        | 'INACTIVE'
        | 'EXPIRED'
        | 'MAX_REDEMPTIONS'
        | 'EMAIL_NOT_ALLOWED'
        | 'ALREADY_REDEEMED'
        | 'DEVICE_LIMIT'
        | 'RATE_LIMITED'
        | 'NETWORK_ERROR';
    };

export type GuestQuotaKind = 'question' | 'deep_reading' | 'premium_pdf';

export type CreateGuestPassCodeInput = {
  accessLevel: GuestPassCode['accessLevel'];
  allowedEmails?: string[];
  code: string;
  codeId: string;
  createdAt?: string;
  createdBy: string;
  expiresAt?: string;
  label: string;
  maxRedemptions: number;
  type: PassCodeType;
};

export type RevokeGuestPassCodeInput = {
  actorEmail?: string;
  actorUserId: string;
  now?: string;
  passCode: GuestPassCode;
  reason: string;
};
