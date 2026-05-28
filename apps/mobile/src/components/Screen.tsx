import React, { type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const { width } = useWindowDimensions();
  const horizontalPadding = withHorizontalPadding
    ? Math.max(insets.left, width >= 768 ? 32 : 20)
    : Math.max(insets.left, 0);
  const horizontalEndPadding = withHorizontalPadding
    ? Math.max(insets.right, width >= 768 ? 32 : 20)
    : Math.max(insets.right, 0);
  const paddingStyle = {
    paddingBottom: Math.max(insets.bottom, 24),
    paddingLeft: horizontalPadding,
    paddingRight: horizontalEndPadding,
    paddingTop: Math.max(insets.top, 24),
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-app-bg"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={paddingStyle}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          className="flex-1"
          style={paddingStyle}
        >
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
