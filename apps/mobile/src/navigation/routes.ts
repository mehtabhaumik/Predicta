export const routes = {
  Splash: 'Splash',
  Onboarding: 'Onboarding',
  SecuritySetup: 'SecuritySetup',
  Home: 'Home',
  Chat: 'Chat',
  Kundli: 'Kundli',
  LifeTimeline: 'LifeTimeline',
  Journal: 'Journal',
  Compatibility: 'Compatibility',
  Report: 'Report',
  SavedKundlis: 'SavedKundlis',
  Paywall: 'Paywall',
  Login: 'Login',
  RedeemPassCode: 'RedeemPassCode',
  AdminAccess: 'AdminAccess',
  Founder: 'Founder',
  Settings: 'Settings',
} as const;

export type PaywallRouteParams = {
  suggestedProductId?: string;
  source?: string;
  title?: string;
};

export type RootStackParamList = {
  [routes.Splash]: undefined;
  [routes.Onboarding]: undefined;
  [routes.SecuritySetup]: undefined;
  [routes.Home]: undefined;
  [routes.Chat]: undefined;
  [routes.Kundli]: undefined;
  [routes.LifeTimeline]: undefined;
  [routes.Journal]: undefined;
  [routes.Compatibility]: undefined;
  [routes.Report]: undefined;
  [routes.SavedKundlis]: undefined;
  [routes.Paywall]: PaywallRouteParams | undefined;
  [routes.Login]: undefined;
  [routes.RedeemPassCode]: undefined;
  [routes.AdminAccess]: undefined;
  [routes.Founder]: undefined;
  [routes.Settings]: undefined;
};
