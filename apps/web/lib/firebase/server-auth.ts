import { createVerify } from 'node:crypto';

const FIREBASE_CERT_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

type VerifiedFirebaseUser = {
  email?: string;
  uid: string;
};

type CertCache = {
  certificates: Record<string, string>;
  expiresAt: number;
};

let certCache: CertCache | undefined;

export async function requireFirebaseUser(
  request: Request,
): Promise<
  | { ok: true; user: VerifiedFirebaseUser }
  | { ok: false; response: Response }
> {
  const header = request.headers.get('authorization') ?? '';
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];

  if (!token) {
    return {
      ok: false,
      response: Response.json(
        {
          error: 'Sign in is required before using this Predicta action.',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 },
      ),
    };
  }

  try {
    return {
      ok: true,
      user: await verifyFirebaseIdToken(token),
    };
  } catch {
    return {
      ok: false,
      response: Response.json(
        {
          error: 'Your sign-in session could not be verified. Please sign in again.',
          code: 'AUTH_SESSION_INVALID',
        },
        { status: 401 },
      ),
    };
  }
}

async function verifyFirebaseIdToken(token: string): Promise<VerifiedFirebaseUser> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('Firebase project id is missing.');
  }

  const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
  if (!encodedHeader || !encodedPayload || !encodedSignature) {
    throw new Error('Malformed Firebase token.');
  }

  const header = parseJwtPart<{ alg?: string; kid?: string }>(encodedHeader);
  const payload = parseJwtPart<{
    aud?: string;
    email?: string;
    exp?: number;
    iss?: string;
    sub?: string;
  }>(encodedPayload);

  if (header.alg !== 'RS256' || !header.kid) {
    throw new Error('Unsupported Firebase token header.');
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (
    payload.aud !== projectId ||
    payload.iss !== `https://securetoken.google.com/${projectId}` ||
    !payload.sub ||
    (typeof payload.exp === 'number' && payload.exp <= nowSeconds)
  ) {
    throw new Error('Firebase token claims are not valid.');
  }

  const certificates = await loadFirebaseCertificates();
  const certificate = certificates[header.kid];
  if (!certificate) {
    throw new Error('Firebase signing certificate is unavailable.');
  }

  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${encodedHeader}.${encodedPayload}`);
  verifier.end();

  if (!verifier.verify(certificate, base64UrlToBuffer(encodedSignature))) {
    throw new Error('Firebase token signature is invalid.');
  }

  return {
    email: payload.email,
    uid: payload.sub,
  };
}

async function loadFirebaseCertificates(): Promise<Record<string, string>> {
  const now = Date.now();
  if (certCache && certCache.expiresAt > now) {
    return certCache.certificates;
  }

  const response = await fetch(FIREBASE_CERT_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Firebase signing certificates could not be loaded.');
  }

  const certificates = (await response.json()) as Record<string, string>;
  certCache = {
    certificates,
    expiresAt: now + parseMaxAge(response.headers.get('cache-control')),
  };
  return certificates;
}

function parseMaxAge(cacheControl: string | null): number {
  const seconds = Number(cacheControl?.match(/max-age=(\d+)/i)?.[1] ?? 3600);
  return Math.max(60, seconds) * 1000;
}

function parseJwtPart<T>(value: string): T {
  return JSON.parse(base64UrlToBuffer(value).toString('utf8')) as T;
}

function base64UrlToBuffer(value: string): Buffer {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='), 'base64');
}
