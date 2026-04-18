import type { AIIntent, UserPlan } from '../types/astrology';

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
  deepCallsPerPass: 3,
  durationHours: 24,
  pdfsPerPass: 1,
  questionsPerPass: 10,
};

export function getUsageLimits(plan: UserPlan): PlanUsageLimits {
  return USAGE_LIMITS[plan];
}

export function isDeepIntent(intent: AIIntent): boolean {
  return intent === 'deep';
}
