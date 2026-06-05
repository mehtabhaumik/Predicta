import type { GuestUsageLimits, PassCodeType } from '@pridicta/types';

export type GuestAccessLimitConfig = {
  durationDays: number;
  usageLimits: GuestUsageLimits;
  deviceLimit: number;
};

export const GUEST_ACCESS_LIMITS: Record<PassCodeType, GuestAccessLimitConfig> =
  {
    FAMILY_PASS: {
      deviceLimit: 3,
      durationDays: 90,
      usageLimits: {
        deepReadingsTotal: 2,
        premiumPdfsTotal: 2,
        questionsTotal: 15,
      },
    },
    GUEST_TRIAL: {
      deviceLimit: 1,
      durationDays: 7,
      usageLimits: {
        deepReadingsTotal: 0,
        premiumPdfsTotal: 1,
        questionsTotal: 3,
      },
    },
    INTERNAL_TEST: {
      deviceLimit: 2,
      durationDays: 30,
      usageLimits: {
        deepReadingsTotal: 5,
        premiumPdfsTotal: 3,
        questionsTotal: 25,
      },
    },
    INVESTOR_PASS: {
      deviceLimit: 2,
      durationDays: 30,
      usageLimits: {
        deepReadingsTotal: 2,
        premiumPdfsTotal: 1,
        questionsTotal: 12,
      },
    },
    VIP_REVIEW: {
      deviceLimit: 2,
      durationDays: 14,
      usageLimits: {
        deepReadingsTotal: 1,
        premiumPdfsTotal: 1,
        questionsTotal: 8,
      },
    },
  };
