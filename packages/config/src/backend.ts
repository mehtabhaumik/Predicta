export const PREDICTA_PROTECTED_BACKEND_URL_RUDRAIX =
  'https://api.predicta.rudraix.com';

export const PREDICTA_PROTECTED_BACKEND_URL_BHAUMIKMEHTA =
  'https://api.predicta.bhaumikmehta.com';

export const PREDICTA_PROTECTED_BACKEND_URL =
  PREDICTA_PROTECTED_BACKEND_URL_RUDRAIX;

export const PREDICTA_LOCAL_WEB_BACKEND_URL = 'http://localhost:8000';

export const PREDICTA_LOCAL_ANDROID_BACKEND_URL = 'http://10.0.2.2:8000';

const PREDICTA_PRODUCTION_BACKEND_URLS = new Set([
  PREDICTA_PROTECTED_BACKEND_URL_RUDRAIX,
  PREDICTA_PROTECTED_BACKEND_URL_BHAUMIKMEHTA,
]);

function normalizeBackendUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function resolveBackendUrl(
  value: string | undefined,
  fallback = PREDICTA_PROTECTED_BACKEND_URL,
): string {
  const trimmed = value?.trim();
  return trimmed ? normalizeBackendUrl(trimmed) : fallback;
}

export function resolvePredictaWebBackendUrl({
  configuredUrl,
  hostname,
  fallback = PREDICTA_PROTECTED_BACKEND_URL,
}: {
  configuredUrl?: string;
  hostname?: string;
  fallback?: string;
} = {}): string {
  const resolvedConfiguredUrl = resolveBackendUrl(configuredUrl, fallback);

  if (
    configuredUrl &&
    !PREDICTA_PRODUCTION_BACKEND_URLS.has(resolvedConfiguredUrl)
  ) {
    return resolvedConfiguredUrl;
  }

  const currentHostname =
    hostname?.trim().toLowerCase() ??
    (typeof window !== 'undefined'
      ? window.location.hostname.trim().toLowerCase()
      : undefined);

  if (currentHostname?.endsWith('predicta.bhaumikmehta.com')) {
    return PREDICTA_PROTECTED_BACKEND_URL_BHAUMIKMEHTA;
  }

  if (currentHostname?.endsWith('predicta.rudraix.com')) {
    return PREDICTA_PROTECTED_BACKEND_URL_RUDRAIX;
  }

  return resolvedConfiguredUrl;
}
