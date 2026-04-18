import type { AccessLevel } from '../types/access';

export const ADMIN_EMAIL_WHITELIST = [
  'ui.bhaumik@gmail.com',
  'bvmehta1980@gmail.com',
  'mehtabhaumik.2007@gmail.com',
] as const;

export const FULL_ACCESS_EMAIL_WHITELIST = [
  'sonali.jetly@gmail.com',
  'sonalimehta.shilpan@gmail.com',
] as const;

export const WHITELIST_ACCESS_COPY: Record<
  Extract<AccessLevel, 'ADMIN' | 'FULL_ACCESS'>,
  string
> = {
  ADMIN: 'Admin access active',
  FULL_ACCESS: 'Full access active',
};

// Production note: client-side whitelists are a fast local cache only. Firebase
// Remote Config, Firestore, or a backend entitlement service should remain the
// authority before exposing admin tools or server-side unrestricted usage.
