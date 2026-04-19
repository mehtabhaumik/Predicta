import type {
  AccessLevel,
  GuestPassUsageSummary,
  PassCodeType,
  RedeemedGuestPass,
} from '@pridicta/types';

type FetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
  text: () => Promise<string>;
};

type FetchImpl = (
  input: string,
  init?: {
    body?: string;
    headers?: Record<string, string>;
    method?: string;
  },
) => Promise<FetchResponse>;

export type BackendAuthorityClientOptions = {
  baseUrl: string;
  fetchImpl?: FetchImpl;
  getIdToken: () => Promise<string | undefined>;
};

export type BackendGuestPassCreateInput = {
  accessLevel: Extract<AccessLevel, 'GUEST' | 'VIP_GUEST' | 'FULL_ACCESS'>;
  allowedEmails?: string[];
  codeId?: string;
  expiresAt?: string;
  label: string;
  maxRedemptions: number;
  rawCode?: string;
  type: PassCodeType;
};

export type BackendGuestPassCreateResult = {
  formattedCode: string;
  rawCode: string;
  passCode: GuestPassUsageSummary;
};

export type BackendAccessGrantInput = {
  accessLevel: Extract<AccessLevel, 'FREE' | 'FULL_ACCESS' | 'ADMIN'>;
  email?: string;
  reason: string;
  userId?: string;
};

export type BackendAccessGrantResult = {
  admin: boolean;
  email?: string;
  fullAccess: boolean;
  updatedAt: string;
  userId: string;
};

export class BackendAuthorityError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'BackendAuthorityError';
    this.status = status;
  }
}

export function createBackendAuthorityClient({
  baseUrl,
  fetchImpl = globalThis.fetch as FetchImpl | undefined,
  getIdToken,
}: BackendAuthorityClientOptions) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  async function request<T>(
    path: string,
    options: { body?: unknown; method?: string } = {},
  ): Promise<T> {
    if (!normalizedBaseUrl) {
      throw new BackendAuthorityError(
        'Secure access service is not ready yet.',
      );
    }

    if (!fetchImpl) {
      throw new BackendAuthorityError(
        'Network requests are not available in this runtime.',
      );
    }

    const token = await getIdToken();
    if (!token) {
      throw new BackendAuthorityError('Sign in is required for this action.', 401);
    }

    const response = await fetchImpl(`${normalizedBaseUrl}${path}`, {
      body: options.body ? JSON.stringify(options.body) : undefined,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      method: options.method ?? 'GET',
    });

    if (!response.ok) {
      throw new BackendAuthorityError(
        await readBackendError(response),
        response.status,
      );
    }

    return (await response.json()) as T;
  }

  return {
    createGuestPassCode(input: BackendGuestPassCreateInput) {
      return request<BackendGuestPassCreateResult>('/admin/pass-codes', {
        body: input,
        method: 'POST',
      });
    },

    grantAccess(input: BackendAccessGrantInput) {
      return request<BackendAccessGrantResult>('/admin/access-grants', {
        body: input,
        method: 'POST',
      });
    },

    listGuestPassCodes() {
      return request<GuestPassUsageSummary[]>('/admin/pass-codes');
    },

    redeemPassCode(input: { code: string; deviceId: string }) {
      return request<RedeemedGuestPass>('/access/pass-codes/redeem', {
        body: input,
        method: 'POST',
      });
    },

    revokeGuestPassCode(codeId: string, reason: string) {
      return request<GuestPassUsageSummary>(
        `/admin/pass-codes/${encodeURIComponent(codeId)}/revoke`,
        {
          body: { reason },
          method: 'POST',
        },
      );
    },
  };
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.trim().replace(/\/+$/, '');
}

async function readBackendError(response: FetchResponse): Promise<string> {
  try {
    const payload = await response.json();
    if (
      payload &&
      typeof payload === 'object' &&
      'detail' in payload &&
      typeof payload.detail === 'string'
    ) {
      return payload.detail;
    }
  } catch {
    // Fall back to text below.
  }

  try {
    const text = await response.text();
    return text || 'Secure access service request failed.';
  } catch {
    return 'Secure access service request failed.';
  }
}
