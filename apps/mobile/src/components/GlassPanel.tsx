import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';
import { FadeInView } from './FadeInView';

type GlassPanelProps = PropsWithChildren<
  ViewProps & {
    delay?: number;
  }
>;

export function GlassPanel({
  children,
  className = '',
  delay = 0,
  style,
  ...props
}: GlassPanelProps): React.JSX.Element {
  return (
    <FadeInView className={className} delay={delay} style={style}>
      <View style={styles.panel} {...props}>
        <LinearGradient
          colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    </FadeInView>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(18, 18, 26, 0.72)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 22,
    shadowColor: colors.gradient[1],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
  },
});
