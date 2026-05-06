import { resolveAccess } from '@pridicta/access';
import { createInitialMonetizationState } from '@pridicta/monetization';
import type { AuthState } from '@pridicta/types';

export const demoAuth: AuthState = {
  email: 'guest@pridicta.app',
  isLoggedIn: false,
  provider: null,
  userId: 'local-web-preview',
};

export const demoAdminAuth: AuthState = {
  email: 'admin@example.invalid',
  isLoggedIn: true,
  provider: 'google',
  userId: 'admin-web-preview',
};

export const demoMonetization = createInitialMonetizationState();

export const demoAccess = resolveAccess({
  auth: demoAuth,
  monetization: demoMonetization,
});

export const demoAdminAccess = resolveAccess({
  auth: demoAdminAuth,
  monetization: demoMonetization,
});
