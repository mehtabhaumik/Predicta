import { ASTROLOGY_ENGINE } from '../../config/astrologyConfig';
import type { BirthDetails, KundliData } from '../../types/astrology';
import { validateBirthDetails } from '../../utils/validateBirthDetails';
import { getCachedKundli, setCachedKundli } from './astroCache';
import { generateSwissEphemerisKundli } from './providers/swissEphemerisProvider';

export async function generateKundli(
  birthDetails: BirthDetails,
  options: { ignoreCache?: boolean } = {},
): Promise<KundliData> {
  const validation = validateBirthDetails(birthDetails);

  if (!validation.valid) {
    throw new Error(validation.errors.join(' '));
  }

  const cached = options.ignoreCache ? null : getCachedKundli(birthDetails);

  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    ASTROLOGY_ENGINE.timeoutMs,
  );

  try {
    const kundli = await generateSwissEphemerisKundli(
      birthDetails,
      controller.signal,
    );
    setCachedKundli(kundli);
    return kundli;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Astrology calculation timed out. Please try again.');
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
