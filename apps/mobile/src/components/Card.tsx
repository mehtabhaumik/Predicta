import React, { type PropsWithChildren } from 'react';
import { View, type ViewProps } from 'react-native';

type CardProps = PropsWithChildren<ViewProps>;

export function Card({
  children,
  className = '',
  ...props
}: CardProps): React.JSX.Element {
  return (
    <View
      className={`rounded-lg border border-[#252533] bg-app-card p-5 ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}
