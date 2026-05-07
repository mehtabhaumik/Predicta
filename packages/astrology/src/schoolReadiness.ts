import type { KundliData } from '@pridicta/types';

export type PredictaSchoolReadiness = 'KP' | 'NADI';

export function hasBirthDetailsForSchoolCalculation(
  kundli?: KundliData,
): kundli is KundliData {
  const details = kundli?.birthDetails;

  return Boolean(
    details?.date &&
      details.time &&
      details.place &&
      Number.isFinite(details.latitude) &&
      Number.isFinite(details.longitude) &&
      details.timezone,
  );
}

export function needsPredictaSchoolCalculation(
  kundli: KundliData | undefined,
  school: PredictaSchoolReadiness,
): boolean {
  if (!hasBirthDetailsForSchoolCalculation(kundli)) {
    return false;
  }

  if (school === 'KP') {
    return (
      !kundli.bhavChalit?.cusps?.length ||
      !kundli.kp?.cusps?.length ||
      !kundli.kp?.planets?.length ||
      !kundli.kp?.significators?.length
    );
  }

  return !kundli.planets?.length || kundli.planets.length < 2;
}
