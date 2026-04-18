import React, { type PropsWithChildren } from 'react';
import { type ViewProps } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type FadeInViewProps = PropsWithChildren<
  ViewProps & {
    delay?: number;
    duration?: number;
  }
>;

export function FadeInView({
  children,
  delay = 0,
  duration = 620,
  ...props
}: FadeInViewProps): React.JSX.Element {
  return (
    <Animated.View
      entering={FadeInUp.duration(duration).delay(delay)}
      {...props}
    >
      {children}
    </Animated.View>
  );
}
