import type { BirthDetails } from '@pridicta/types';

export type BirthDetailsValidation = {
  errors: string[];
  valid: boolean;
};

const timeZoneFormatterCache = new Map<string, Intl.DateTimeFormat>();

export function isValidTimeZone(timezone: string): boolean {
  try {
    if (!timeZoneFormatterCache.has(timezone)) {
      timeZoneFormatterCache.set(
        timezone,
        new Intl.DateTimeFormat('en-US', { timeZone: timezone }),
      );
    }
    return true;
  } catch {
    return false;
  }
}

export function validateBirthDetails(
  birthDetails: Partial<BirthDetails>,
): BirthDetailsValidation {
  const errors: string[] = [];

  if (!birthDetails.name?.trim()) {
    errors.push('Name is required.');
  }

  if (!birthDetails.place?.trim()) {
    errors.push('Birth place is required.');
  }

  if (!birthDetails.date || !/^\d{4}-\d{2}-\d{2}$/.test(birthDetails.date)) {
    errors.push('Date must use YYYY-MM-DD format.');
  } else if (Number.isNaN(Date.parse(`${birthDetails.date}T00:00:00Z`))) {
    errors.push('Date is invalid.');
  }

  if (!birthDetails.time || !/^\d{2}:\d{2}$/.test(birthDetails.time)) {
    errors.push('Time must use 24-hour HH:mm format.');
  } else {
    const [hours, minutes] = birthDetails.time.split(':').map(Number);
    if (hours > 23 || minutes > 59) {
      errors.push('Time is invalid.');
    }
  }

  if (
    typeof birthDetails.latitude !== 'number' ||
    !Number.isFinite(birthDetails.latitude) ||
    birthDetails.latitude < -90 ||
    birthDetails.latitude > 90
  ) {
    errors.push('Latitude must be between -90 and 90.');
  }

  if (
    typeof birthDetails.longitude !== 'number' ||
    !Number.isFinite(birthDetails.longitude) ||
    birthDetails.longitude < -180 ||
    birthDetails.longitude > 180
  ) {
    errors.push('Longitude must be between -180 and 180.');
  }

  if (!birthDetails.timezone || !isValidTimeZone(birthDetails.timezone)) {
    errors.push('A valid IANA timezone is required.');
  }

  return {
    errors,
    valid: errors.length === 0,
  };
}
