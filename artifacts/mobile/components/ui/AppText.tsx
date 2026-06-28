import React from 'react';
import { Text, TextStyle } from 'react-native';
import { typography } from '@/constants/typography';
import { useColors } from '@/hooks/useColors';

type TypographyVariant = keyof typeof typography;

interface AppTextProps {
  variant?: TypographyVariant;
  color?: string;
  style?: TextStyle | TextStyle[];
  children: React.ReactNode;
  numberOfLines?: number;
}

export function AppText({
  variant = 'bodyMd',
  color,
  style,
  children,
  numberOfLines,
}: AppTextProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography[variant], { color: color ?? colors.onSurface }, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}
