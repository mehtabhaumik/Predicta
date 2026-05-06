import type { AccessLevel } from '@pridicta/types';

export const ADMIN_EMAIL_WHITELIST = [] as const;

export const FULL_ACCESS_EMAIL_WHITELIST = [] as const;

export const WHITELIST_ACCESS_COPY: Record<
  Extract<AccessLevel, 'ADMIN' | 'FULL_ACCESS'>,
  string
> = {
  ADMIN: 'Admin access active',
  FULL_ACCESS: 'Full access active',
};

// Admin and full-access authority lives on the backend. These arrays stay empty
// so browser and mobile bundles do not expose privileged account identifiers.
