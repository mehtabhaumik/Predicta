import React, { type PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
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
  const paddingStyle = {
    paddingBottom: Math.max(insets.bottom, 24),
    paddingTop: Math.max(insets.top, 24),
  };
  const contentClassName = withHorizontalPadding ? 'px-5' : undefined;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-app-bg"
    >
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={contentClassName}
          contentContainerStyle={paddingStyle}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          className={`flex-1 ${contentClassName ?? ''}`}
          style={paddingStyle}
        >
          {children}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
