import type {
  AstrologyMemory,
  BirthDetails,
  ChartContext,
  KundliData,
} from '@pridicta/types';

export type KundliStateSnapshot = {
  kundliReady: boolean;
  shouldGenerateKundli: boolean;
  knownBirthDetails: Partial<BirthDetails>;
  missingBirthFields: Array<'date' | 'time' | 'place'>;
  chartContext?: ChartContext;
};

function hasBirthDetailValue(value?: string): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getMissingBirthFields(
  birthDetails?: Partial<BirthDetails>,
): Array<'date' | 'time' | 'place'> {
  const missing: Array<'date' | 'time' | 'place'> = [];

  if (!hasBirthDetailValue(birthDetails?.date)) {
    missing.push('date');
  }
  if (!hasBirthDetailValue(birthDetails?.time)) {
    missing.push('time');
  }
  if (!hasBirthDetailValue(birthDetails?.place)) {
    missing.push('place');
  }

  return missing;
}

export function isBirthDetailsSufficientForKundli(
  birthDetails?: Partial<BirthDetails>,
): boolean {
  return getMissingBirthFields(birthDetails).length === 0;
}

export function resolveKundliState(input: {
  memory?: AstrologyMemory;
  kundli?: KundliData;
  chartContext?: ChartContext;
}): KundliStateSnapshot {
  const knownBirthDetails = input.kundli?.birthDetails ?? input.memory?.birthDetails;
  const missingBirthFields = getMissingBirthFields(knownBirthDetails);
  const kundliReady = Boolean(
    input.kundli ??
      input.memory?.kundliReady ??
      (input.memory?.activeKundliId && isBirthDetailsSufficientForKundli(knownBirthDetails)),
  );

  return {
    chartContext: input.chartContext ?? input.memory?.lastChartContext,
    knownBirthDetails: knownBirthDetails ?? {},
    kundliReady,
    missingBirthFields,
    shouldGenerateKundli: !kundliReady && missingBirthFields.length === 0,
  };
}

export function summarizeKnownBirthDetails(
  birthDetails?: Partial<BirthDetails>,
): string {
  const parts: string[] = [];

  if (hasBirthDetailValue(birthDetails?.date)) {
    parts.push(`date of birth ${birthDetails?.date}`);
  }
  if (hasBirthDetailValue(birthDetails?.time)) {
    parts.push(`birth time ${birthDetails?.time}`);
  }
  if (hasBirthDetailValue(birthDetails?.place)) {
    parts.push(`birth place ${birthDetails?.place}`);
  }

  if (parts.length === 0) {
    return 'none';
  }
  if (parts.length === 1) {
    return parts[0];
  }
  if (parts.length === 2) {
    return `${parts[0]} and ${parts[1]}`;
  }

  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`;
}
