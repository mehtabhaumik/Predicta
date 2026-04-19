import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import { colors } from '../theme/colors';
import { FadeInView } from './FadeInView';

type GradientOutlineCardProps = PropsWithChildren<
  ViewProps & {
    delay?: number;
  }
>;

export function GradientOutlineCard({
  children,
  className = '',
  delay = 0,
  style,
  ...props
}: GradientOutlineCardProps): React.JSX.Element {
  return (
    <FadeInView className={className} delay={delay} style={style}>
      <LinearGradient
        colors={colors.gradient}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.border}
      >
        <View style={styles.card} {...props}>
          {children}
        </View>
      </LinearGradient>
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
    padding: 22,
  },
});
