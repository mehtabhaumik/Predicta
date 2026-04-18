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
  email: 'ui.bhaumik@gmail.com',
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

export const kundliSummary = {
  birthPlace: 'Mumbai, Maharashtra, India',
  calculatedAt: 'Swiss Ephemeris contract ready',
  dasha: 'Saturn / Mercury',
  lagna: 'Leo',
  moonSign: 'Taurus',
  nakshatra: 'Rohini',
  name: 'Pridicta Seeker',
};
