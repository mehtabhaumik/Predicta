import React, { type PropsWithChildren } from 'react';
import { type ViewProps, type ViewStyle } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

type FadeInViewProps = PropsWithChildren<
  ViewProps & {
    delay?: number;
    duration?: number;
  }
>;

export function FadeInView({
  children,
  className = '',
  delay = 0,
  duration = 620,
  style,
  ...props
}: FadeInViewProps): React.JSX.Element {
  return (
    <Animated.View
      entering={FadeInUp.duration(duration).delay(delay)}
      className={className}
      style={[getUtilityFallbackStyle(className), style]}
      {...props}
    >
      {children}
    </Animated.View>
  );
}

function getUtilityFallbackStyle(className: string): ViewStyle | undefined {
  if (!className) {
    return undefined;
  }

  const fallbackStyle: ViewStyle = {};

  if (className.includes('flex-row')) {
    fallbackStyle.flexDirection = 'row';
  }

  if (className.includes('flex-1')) {
    fallbackStyle.flex = 1;
  }

  if (className.includes('items-center')) {
    fallbackStyle.alignItems = 'center';
  } else if (className.includes('items-start')) {
    fallbackStyle.alignItems = 'flex-start';
  } else if (className.includes('items-end')) {
    fallbackStyle.alignItems = 'flex-end';
  }

  if (className.includes('justify-between')) {
    fallbackStyle.justifyContent = 'space-between';
  } else if (className.includes('justify-center')) {
    fallbackStyle.justifyContent = 'center';
  }

  if (className.includes('self-end')) {
    fallbackStyle.alignSelf = 'flex-end';
  } else if (className.includes('self-start')) {
    fallbackStyle.alignSelf = 'flex-start';
  }

  if (className.includes('max-w-[88%]')) {
    fallbackStyle.maxWidth = '88%';
  }

  if (className.includes('gap-2')) {
    fallbackStyle.gap = 8;
  } else if (className.includes('gap-3')) {
    fallbackStyle.gap = 12;
  } else if (className.includes('gap-4')) {
    fallbackStyle.gap = 16;
  } else if (className.includes('gap-5')) {
    fallbackStyle.gap = 20;
  } else if (className.includes('gap-6')) {
    fallbackStyle.gap = 24;
  }

  if (className.includes('mt-4')) {
    fallbackStyle.marginTop = 16;
  } else if (className.includes('mt-5')) {
    fallbackStyle.marginTop = 20;
  } else if (className.includes('mt-6')) {
    fallbackStyle.marginTop = 24;
  } else if (className.includes('mt-7')) {
    fallbackStyle.marginTop = 28;
  } else if (className.includes('mt-8')) {
    fallbackStyle.marginTop = 32;
  }

  return Object.keys(fallbackStyle).length ? fallbackStyle : undefined;
}
