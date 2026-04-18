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
