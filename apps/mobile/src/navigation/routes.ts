export const routes = {
  Splash: 'Splash',
  Onboarding: 'Onboarding',
  SecuritySetup: 'SecuritySetup',
  Home: 'Home',
  Chat: 'Chat',
  Kundli: 'Kundli',
  Report: 'Report',
  SavedKundlis: 'SavedKundlis',
  Paywall: 'Paywall',
  Login: 'Login',
  RedeemPassCode: 'RedeemPassCode',
  AdminAccess: 'AdminAccess',
  Settings: 'Settings',
} as const;

export type RootStackParamList = {
  [routes.Splash]: undefined;
  [routes.Onboarding]: undefined;
  [routes.SecuritySetup]: undefined;
  [routes.Home]: undefined;
  [routes.Chat]: undefined;
  [routes.Kundli]: undefined;
  [routes.Report]: undefined;
  [routes.SavedKundlis]: undefined;
  [routes.Paywall]: undefined;
  [routes.Login]: undefined;
  [routes.RedeemPassCode]: undefined;
  [routes.AdminAccess]: undefined;
  [routes.Settings]: undefined;
};
