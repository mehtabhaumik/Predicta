import {
  ADMIN_EMAIL_WHITELIST,
  FULL_ACCESS_EMAIL_WHITELIST,
} from '@pridicta/config/accessControl';
import type { AccessLevel } from '@pridicta/types';

export function normalizeEmail(email?: string | null): string | undefined {
  const normalized = email?.trim().toLowerCase();
  return normalized || undefined;
}

export function isAdminEmail(email?: string | null): boolean {
  const normalized = normalizeEmail(email);
  return normalized
    ? ADMIN_EMAIL_WHITELIST.includes(
        normalized as (typeof ADMIN_EMAIL_WHITELIST)[number],
      )
    : false;
}

export function isFullAccessEmail(email?: string | null): boolean {
  const normalized = normalizeEmail(email);
  return normalized
    ? FULL_ACCESS_EMAIL_WHITELIST.includes(
        normalized as (typeof FULL_ACCESS_EMAIL_WHITELIST)[number],
      )
    : false;
}

export function getWhitelistedAccessLevel(
  email?: string | null,
): Extract<AccessLevel, 'ADMIN' | 'FULL_ACCESS'> | undefined {
  if (isAdminEmail(email)) {
    return 'ADMIN';
  }

  if (isFullAccessEmail(email)) {
    return 'FULL_ACCESS';
  }

  return undefined;
}
