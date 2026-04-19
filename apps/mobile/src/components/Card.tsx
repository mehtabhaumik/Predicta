import React, { type PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '../theme/colors';

type CardProps = PropsWithChildren<ViewProps>;

export function Card({
  children,
  className = '',
  style,
  ...props
}: CardProps): React.JSX.Element {
  return (
    <View
      className={className}
      style={[styles.card, style]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.glass,
    borderColor: colors.borderSoft,
    borderRadius: 18,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
});
