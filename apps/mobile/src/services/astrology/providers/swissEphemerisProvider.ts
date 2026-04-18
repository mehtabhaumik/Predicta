import { env } from '../../../config/env';
import type { BirthDetails, KundliData } from '../../../types/astrology';

export async function generateSwissEphemerisKundli(
  birthDetails: BirthDetails,
  signal?: AbortSignal,
): Promise<KundliData> {
  const response = await fetch(`${env.astrologyApiUrl}/generate-kundli`, {
    body: JSON.stringify(birthDetails),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    signal,
  });

  if (!response.ok) {
    let message = 'Astrology calculation failed.';
    try {
      const payload = await response.json();
      if (typeof payload.detail === 'string') {
        message = payload.detail;
      }
    } catch {
      // Keep the safe default message.
    }
    throw new Error(message);
  }

  return response.json() as Promise<KundliData>;
}
