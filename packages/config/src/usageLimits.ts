import type { AIIntent, UserPlan } from '@pridicta/types';

export type PlanUsageLimits = {
  questionsPerDay: number;
  deepCallsPerDay: number;
  pdfsPerMonth: number;
};

export type DayPassUsageLimits = {
  questionsPerPass: number;
  deepCallsPerPass: number;
  pdfsPerPass: number;
  durationHours: number;
};

export const USAGE_LIMITS: Record<UserPlan, PlanUsageLimits> = {
  FREE: {
    deepCallsPerDay: 0,
    pdfsPerMonth: 1,
    questionsPerDay: 3,
  },
  PREMIUM: {
    deepCallsPerDay: 10,
    pdfsPerMonth: 5,
    questionsPerDay: 50,
  },
};

export const DAY_PASS_LIMITS: DayPassUsageLimits = {
  deepCallsPerPass: 1,
  durationHours: 24,
  pdfsPerPass: 1,
  questionsPerPass: 5,
};

export function getUsageLimits(plan: UserPlan): PlanUsageLimits {
  return USAGE_LIMITS[plan];
}

export function isDeepIntent(intent: AIIntent): boolean {
  return intent === 'deep';
}
