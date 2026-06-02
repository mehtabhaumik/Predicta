export const FAMILY_COMPARISON_MIN_KUNDLIS = 2;
export const FAMILY_COMPARISON_MAX_KUNDLIS = 4;

export type FamilyComparisonEligibility =
  | {
      allowed: true;
      count: number;
      reason: 'ready';
    }
  | {
      allowed: false;
      count: number;
      reason: 'needs_at_least_two' | 'too_many';
    };

export function evaluateFamilyComparisonEligibility(
  selectedCount: number,
): FamilyComparisonEligibility {
  const count = Math.max(0, Math.floor(Number(selectedCount) || 0));

  if (count < FAMILY_COMPARISON_MIN_KUNDLIS) {
    return {
      allowed: false,
      count,
      reason: 'needs_at_least_two',
    };
  }

  if (count > FAMILY_COMPARISON_MAX_KUNDLIS) {
    return {
      allowed: false,
      count,
      reason: 'too_many',
    };
  }

  return {
    allowed: true,
    count,
    reason: 'ready',
  };
}

export function getFamilyComparisonEligibilityMessage(
  eligibility: FamilyComparisonEligibility,
): string {
  if (eligibility.allowed) {
    return `${eligibility.count} Kundlis selected. Predicta can run this family comparison.`;
  }

  if (eligibility.reason === 'too_many') {
    return `Select up to ${FAMILY_COMPARISON_MAX_KUNDLIS} Kundlis at a time. A smaller circle keeps the comparison focused and easier to trust.`;
  }

  return `Select at least ${FAMILY_COMPARISON_MIN_KUNDLIS} saved Kundlis before running family comparison.`;
}
