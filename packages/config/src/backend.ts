export const PREDICTA_PROTECTED_BACKEND_URL =
  'https://api.predicta.rudraix.com';

export const PREDICTA_LOCAL_WEB_BACKEND_URL = 'http://localhost:8000';

export const PREDICTA_LOCAL_ANDROID_BACKEND_URL = 'http://10.0.2.2:8000';

export function resolveBackendUrl(
  value: string | undefined,
  fallback = PREDICTA_PROTECTED_BACKEND_URL,
): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed.replace(/\/+$/, '') : fallback;
}
