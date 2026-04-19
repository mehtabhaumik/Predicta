import React, { type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme/colors';

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  withHorizontalPadding?: boolean;
}>;

export function Screen({
  children,
  scroll = true,
  withHorizontalPadding = true,
}: ScreenProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const paddingStyle = {
    paddingBottom: Math.max(insets.bottom, 24),
    paddingTop: Math.max(insets.top, 24),
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      {scroll ? (
        <ScrollView
          style={styles.root}
          contentContainerStyle={[
            styles.scrollContent,
            withHorizontalPadding ? styles.horizontalPadding : null,
            paddingStyle,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[
            styles.content,
            withHorizontalPadding ? styles.horizontalPadding : null,
            paddingStyle,
          ]}
        >
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    flex: 1,
  },
  horizontalPadding: {
    paddingHorizontal: 22,
  },
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scrollContent: {
    backgroundColor: colors.background,
    flexGrow: 1,
  },
});
