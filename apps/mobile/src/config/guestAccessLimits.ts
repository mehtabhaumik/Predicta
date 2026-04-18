import type { GuestUsageLimits, PassCodeType } from '../types/access';

export type GuestAccessLimitConfig = {
  durationDays: number;
  usageLimits: GuestUsageLimits;
  deviceLimit: number;
};

export const GUEST_ACCESS_LIMITS: Record<PassCodeType, GuestAccessLimitConfig> =
  {
    FAMILY_PASS: {
      deviceLimit: 2,
      durationDays: 365,
      usageLimits: {
        deepReadingsTotal: 300,
        premiumPdfsTotal: 50,
        questionsTotal: 2000,
      },
    },
    GUEST_TRIAL: {
      deviceLimit: 1,
      durationDays: 7,
      usageLimits: {
        deepReadingsTotal: 5,
        premiumPdfsTotal: 1,
        questionsTotal: 25,
      },
    },
    INTERNAL_TEST: {
      deviceLimit: 3,
      durationDays: 365,
      usageLimits: {
        deepReadingsTotal: 1000,
        premiumPdfsTotal: 100,
        questionsTotal: 5000,
      },
    },
    INVESTOR_PASS: {
      deviceLimit: 3,
      durationDays: 90,
      usageLimits: {
        deepReadingsTotal: 60,
        premiumPdfsTotal: 10,
        questionsTotal: 300,
      },
    },
    VIP_REVIEW: {
      deviceLimit: 2,
      durationDays: 30,
      usageLimits: {
        deepReadingsTotal: 30,
        premiumPdfsTotal: 5,
        questionsTotal: 150,
      },
    },
  };
