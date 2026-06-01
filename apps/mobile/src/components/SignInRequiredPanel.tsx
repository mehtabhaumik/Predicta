import React from 'react';
import { View } from 'react-native';

import { routes } from '../navigation/routes';
import type { RootStackParamList } from '../navigation/routes';
import { GlowButton } from './GlowButton';
import { GlowCard } from './GlowCard';
import { AppText } from './AppText';

type NavigationLike = {
  navigate: (route: keyof RootStackParamList) => void;
};

type SignInRequiredPanelProps = {
  body: string;
  navigation: NavigationLike;
  title: string;
};

export function SignInRequiredPanel({
  body,
  navigation,
  title,
}: SignInRequiredPanelProps): React.JSX.Element {
  return (
    <View style={{ gap: 18 }}>
      <GlowCard>
        <AppText variant="caption">ACCOUNT REQUIRED</AppText>
        <AppText variant="title">{title}</AppText>
        <AppText variant="body">{body}</AppText>
      </GlowCard>
      <GlowButton
        label="Continue with Google"
        onPress={() => navigation.navigate(routes.Login)}
      />
    </View>
  );
}
