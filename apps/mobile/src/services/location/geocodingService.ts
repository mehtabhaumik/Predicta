import type { ResolvedBirthPlace } from '../../types/astrology';

export async function resolvePlaceWithBackend(
  _query: string,
): Promise<ResolvedBirthPlace[] | null> {
  // Production geocoding belongs behind a backend endpoint so provider keys,
  // rate limits, and audit logs never live in the mobile app.
  return null;
}
