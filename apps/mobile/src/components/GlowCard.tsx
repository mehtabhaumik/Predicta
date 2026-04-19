import React, { type PropsWithChildren } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';
import { FadeInView } from './FadeInView';

type GlowCardProps = PropsWithChildren<
  ViewProps & {
    contentStyle?: StyleProp<ViewStyle>;
    contentClassName?: string;
    delay?: number;
  }
>;

export function GlowCard({
  children,
  className = '',
  contentClassName = '',
  contentStyle,
  delay = 0,
  style,
  ...props
}: GlowCardProps): React.JSX.Element {
  return (
    <FadeInView className={className} delay={delay} style={style}>
      <View style={styles.shadow}>
        <LinearGradient
          colors={colors.gradientSoft}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.border}
        >
          <View
            className={contentClassName}
            style={[styles.card, contentStyle]}
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
    borderRadius: 20,
    padding: 1,
  },
  card: {
    backgroundColor: colors.glass,
    borderRadius: 19,
    minHeight: 1,
    overflow: 'hidden',
    padding: 22,
  },
  innerGlow: {
    height: 120,
    opacity: 0.2,
    position: 'absolute',
    right: -50,
    top: -50,
    width: 180,
  },
  shadow: {
    borderRadius: 20,
    elevation: 12,
    shadowColor: colors.gradient[0],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 26,
  },
});
