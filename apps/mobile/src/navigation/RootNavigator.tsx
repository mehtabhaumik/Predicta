import {
  DarkTheme,
  NavigationContainer,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { canSeeAdminRoute, resolveAccess } from '@pridicta/access';
import { useAppStore } from '../store/useAppStore';
import { AdminAccessScreen } from '../screens/AdminAccessScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { CompatibilityScreen } from '../screens/CompatibilityScreen';
import { FounderScreen } from '../screens/FounderScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { KundliScreen } from '../screens/KundliScreen';
import { JournalScreen } from '../screens/JournalScreen';
import { LifeTimelineScreen } from '../screens/LifeTimelineScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { PaywallScreen } from '../screens/PaywallScreen';
import { RedeemPassCodeScreen } from '../screens/RedeemPassCodeScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SavedKundlisScreen } from '../screens/SavedKundlisScreen';
import { SecuritySetupScreen } from '../screens/SecuritySetupScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { colors } from '../theme/colors';
import { routes, type RootStackParamList } from './routes';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={routes.Onboarding}
          component={OnboardingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={routes.SecuritySetup}
          component={SecuritySetupScreen}
          options={{ title: 'Security' }}
        />
        <Stack.Screen
          name={routes.Home}
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={routes.Chat}
          component={ChatScreen}
          options={{ title: 'Chat' }}
        />
        <Stack.Screen
          name={routes.Kundli}
          component={KundliScreen}
          options={{ title: 'Kundli' }}
        />
        <Stack.Screen
          name={routes.LifeTimeline}
          component={LifeTimelineScreen}
          options={{ title: 'Life Timeline' }}
        />
        <Stack.Screen
          name={routes.Journal}
          component={JournalScreen}
          options={{ title: 'Journal' }}
        />
        <Stack.Screen
          name={routes.Compatibility}
          component={CompatibilityScreen}
          options={{ title: 'Compatibility' }}
        />
        <Stack.Screen
          name={routes.Report}
          component={ReportScreen}
          options={{ title: 'Report' }}
        />
        <Stack.Screen
          name={routes.SavedKundlis}
          component={SavedKundlisScreen}
          options={{ title: 'Saved Kundlis' }}
        />
        <Stack.Screen
          name={routes.Paywall}
          component={PaywallScreen}
          options={{ title: 'Premium' }}
        />
        <Stack.Screen
          name={routes.Login}
          component={LoginScreen}
          options={{ title: 'Sign In' }}
        />
        <Stack.Screen
          name={routes.RedeemPassCode}
          component={RedeemPassCodeScreen}
          options={{ title: 'Guest Pass' }}
        />
        {showAdminRoute ? (
          <Stack.Screen
            name={routes.AdminAccess}
            component={AdminAccessScreen}
            options={{ title: 'Admin' }}
          />
        ) : null}
        <Stack.Screen
          name={routes.Founder}
          component={FounderScreen}
          options={{ title: 'Founder' }}
        />
        <Stack.Screen
          name={routes.Settings}
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
