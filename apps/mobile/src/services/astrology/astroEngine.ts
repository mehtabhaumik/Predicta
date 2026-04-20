import { withTimeout, TimeoutError } from '@pridicta/utils';

import { ASTROLOGY_ENGINE } from '../../config/astrologyConfig';
import type { BirthDetails, KundliData } from '../../types/astrology';
import { validateBirthDetails } from '../../utils/validateBirthDetails';
import { getCachedKundli, setCachedKundli } from './astroCache';
import { generateSwissEphemerisKundli } from './providers/swissEphemerisProvider';

export async function generateKundli(
  birthDetails: BirthDetails,
): Promise<KundliData> {
  const validation = validateBirthDetails(birthDetails);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const cached = getCachedKundli(birthDetails);

  if (cached) {
    return cached;
  }

  try {
    const kundli = await withTimeout(
      signal => generateSwissEphemerisKundli(birthDetails, signal),
      ASTROLOGY_ENGINE.timeoutMs,
      { message: 'Astrology calculation timed out. Please try again.' },
    );
    setCachedKundli(kundli);
    return kundli;
  } catch (error) {
    if (
      error instanceof TimeoutError ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      throw new Error('Astrology calculation timed out. Please try again.');
    }
    throw error;
  }
}
