import {
  DarkTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { canSeeAdminRoute, resolveAccess } from '@pridicta/access';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import { routes, type RootStackParamList } from './routes';
import type { RootScreenProps } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
type ScreenComponent<RouteName extends keyof RootStackParamList> =
  React.ComponentType<RootScreenProps<RouteName>>;

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    border: colors.border,
    card: colors.background,
    notification: colors.gradient[2],
    primary: colors.gradient[0],
    text: colors.primaryText,
  },
};

const getSplashScreen = () =>
  require('../screens/SplashScreen').SplashScreen as ScreenComponent<
    typeof routes.Splash
  >;
const getOnboardingScreen = () =>
  require('../screens/OnboardingScreen').OnboardingScreen as ScreenComponent<
    typeof routes.Onboarding
  >;
const getSecuritySetupScreen = () =>
  require('../screens/SecuritySetupScreen').SecuritySetupScreen as ScreenComponent<
    typeof routes.SecuritySetup
  >;
const getHomeScreen = () =>
  require('../screens/HomeScreen').HomeScreen as ScreenComponent<
    typeof routes.Home
  >;
const getChatScreen = () =>
  require('../screens/ChatScreen').ChatScreen as ScreenComponent<
    typeof routes.Chat
  >;
const getKundliScreen = () =>
  require('../screens/KundliScreen').KundliScreen as ScreenComponent<
    typeof routes.Kundli
  >;
const getLifeTimelineScreen = () =>
  require('../screens/LifeTimelineScreen').LifeTimelineScreen as ScreenComponent<
    typeof routes.LifeTimeline
  >;
const getJournalScreen = () =>
  require('../screens/JournalScreen').JournalScreen as ScreenComponent<
    typeof routes.Journal
  >;
const getCompatibilityScreen = () =>
  require('../screens/CompatibilityScreen').CompatibilityScreen as ScreenComponent<
    typeof routes.Compatibility
  >;
const getReportScreen = () =>
  require('../screens/ReportScreen').ReportScreen as ScreenComponent<
    typeof routes.Report
  >;
const getSavedKundlisScreen = () =>
  require('../screens/SavedKundlisScreen').SavedKundlisScreen as ScreenComponent<
    typeof routes.SavedKundlis
  >;
const getPaywallScreen = () =>
  require('../screens/PaywallScreen').PaywallScreen as ScreenComponent<
    typeof routes.Paywall
  >;
const getLoginScreen = () =>
  require('../screens/LoginScreen').LoginScreen as ScreenComponent<
    typeof routes.Login
  >;
const getRedeemPassCodeScreen = () =>
  require('../screens/RedeemPassCodeScreen').RedeemPassCodeScreen as ScreenComponent<
    typeof routes.RedeemPassCode
  >;
const getAdminAccessScreen = () =>
  require('../screens/AdminAccessScreen').AdminAccessScreen as ScreenComponent<
    typeof routes.AdminAccess
  >;
const getFounderScreen = () =>
  require('../screens/FounderScreen').FounderScreen as ScreenComponent<
    typeof routes.Founder
  >;
const getSettingsScreen = () =>
  require('../screens/SettingsScreen').SettingsScreen as ScreenComponent<
    typeof routes.Settings
  >;

export function RootNavigator(): React.JSX.Element {
  const auth = useAppStore(state => state.auth);
  const monetization = useAppStore(state => state.monetization);
  const redeemedGuestPass = useAppStore(state => state.redeemedGuestPass);
  const showAdminRoute = canSeeAdminRoute(
    resolveAccess({ auth, monetization, redeemedGuestPass }),
  );

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName={routes.Splash}
        screenOptions={{
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: 'Back',
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryText,
          headerTitleStyle: { fontWeight: '700' },
        }}
      >
        <Stack.Screen
          name={routes.Splash}
          getComponent={getSplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={routes.Onboarding}
          getComponent={getOnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={routes.SecuritySetup}
          getComponent={getSecuritySetupScreen}
          options={{ title: 'Security' }}
        />
        <Stack.Screen
          name={routes.Home}
          getComponent={getHomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={routes.Chat}
          getComponent={getChatScreen}
          options={{ title: 'Chat' }}
        />
        <Stack.Screen
          name={routes.Kundli}
          getComponent={getKundliScreen}
          options={{ title: 'Kundli' }}
        />
        <Stack.Screen
          name={routes.LifeTimeline}
          getComponent={getLifeTimelineScreen}
          options={{ title: 'Life Timeline' }}
        />
        <Stack.Screen
          name={routes.Journal}
          getComponent={getJournalScreen}
          options={{ title: 'Journal' }}
        />
        <Stack.Screen
          name={routes.Compatibility}
          getComponent={getCompatibilityScreen}
          options={{ title: 'Compatibility' }}
        />
        <Stack.Screen
          name={routes.Report}
          getComponent={getReportScreen}
          options={{ title: 'Report' }}
        />
        <Stack.Screen
          name={routes.SavedKundlis}
          getComponent={getSavedKundlisScreen}
          options={{ title: 'Saved Kundlis' }}
        />
        <Stack.Screen
          name={routes.Paywall}
          getComponent={getPaywallScreen}
          options={{ title: 'Premium' }}
        />
        <Stack.Screen
          name={routes.Login}
          getComponent={getLoginScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen
          name={routes.RedeemPassCode}
          getComponent={getRedeemPassCodeScreen}
          options={{ title: 'Guest Pass' }}
        />
        {showAdminRoute ? (
          <Stack.Screen
            name={routes.AdminAccess}
            getComponent={getAdminAccessScreen}
            options={{ title: 'Admin' }}
          />
        ) : null}
        <Stack.Screen
          name={routes.Founder}
          getComponent={getFounderScreen}
          options={{ title: 'Founder' }}
        />
        <Stack.Screen
          name={routes.Settings}
          getComponent={getSettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
