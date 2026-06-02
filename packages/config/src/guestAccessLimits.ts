import type { GuestUsageLimits, PassCodeType } from '@pridicta/types';

export type GuestAccessLimitConfig = {
  durationDays: number;
  usageLimits: GuestUsageLimits;
  deviceLimit: number;
};

export const GUEST_ACCESS_LIMITS: Record<PassCodeType, GuestAccessLimitConfig> =
  {
    FAMILY_PASS: {
      deviceLimit: 4,
      durationDays: 180,
      usageLimits: {
        deepReadingsTotal: 10,
        premiumPdfsTotal: 4,
        questionsTotal: 60,
      },
    },
    GUEST_TRIAL: {
      deviceLimit: 1,
      durationDays: 7,
      usageLimits: {
        deepReadingsTotal: 1,
        premiumPdfsTotal: 1,
        questionsTotal: 5,
      },
    },
    INTERNAL_TEST: {
      deviceLimit: 3,
      durationDays: 90,
      usageLimits: {
        deepReadingsTotal: 20,
        premiumPdfsTotal: 6,
        questionsTotal: 120,
      },
    },
    INVESTOR_PASS: {
      deviceLimit: 3,
      durationDays: 60,
      usageLimits: {
        deepReadingsTotal: 8,
        premiumPdfsTotal: 3,
        questionsTotal: 50,
      },
    },
    VIP_REVIEW: {
      deviceLimit: 2,
      durationDays: 30,
      usageLimits: {
        deepReadingsTotal: 4,
        premiumPdfsTotal: 2,
        questionsTotal: 20,
      },
    },
  };
