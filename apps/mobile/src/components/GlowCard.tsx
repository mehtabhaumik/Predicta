import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';
import { FadeInView } from './FadeInView';

type GlowCardProps = PropsWithChildren<
  ViewProps & {
    contentClassName?: string;
    delay?: number;
  }
>;

export function GlowCard({
  children,
  className = '',
  contentClassName = '',
  delay = 0,
  style,
  ...props
}: GlowCardProps): React.JSX.Element {
  return (
    <FadeInView className={className} delay={delay} style={style}>
      <View style={styles.shadow}>
        <LinearGradient
          colors={colors.gradient}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.border}
        >
          <View
            className={`overflow-hidden rounded-2xl bg-app-card p-5 ${contentClassName}`}
            {...props}
          >
            <LinearGradient
              colors={colors.gradientMuted}
              end={{ x: 1, y: 1 }}
              pointerEvents="none"
              start={{ x: 0, y: 0 }}
              style={styles.innerGlow}
            />
            {children}
          </View>
        </LinearGradient>
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  border: {
    borderRadius: 16,
    padding: 1,
  },
  innerGlow: {
    height: 120,
    opacity: 0.18,
    position: 'absolute',
    right: -50,
    top: -50,
    width: 180,
  },
  shadow: {
    borderRadius: 16,
    elevation: 12,
    shadowColor: colors.gradient[0],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
  },
});
