import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { AppText } from './AppText';

type StatusType = 'normal' | 'info' | 'elevated' | 'critical' | 'error';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  style?: ViewStyle;
}

export function StatusBadge({ status, label, style }: StatusBadgeProps) {
  const colors = useColors();

  const config: Record<StatusType, { color: string; bg: string; defaultLabel: string }> = {
    normal: { color: colors.vitalsNormal, bg: colors.vitalsNormal + '22', defaultLabel: 'Normal' },
    info: { color: colors.vitalsInfo, bg: colors.vitalsInfo + '22', defaultLabel: 'Info' },
    elevated: { color: colors.vitalsElevated, bg: colors.vitalsElevated + '22', defaultLabel: 'Elevated' },
    critical: { color: colors.vitalsCritical, bg: colors.vitalsCritical + '22', defaultLabel: 'Critical' },
    error: { color: colors.errorColor, bg: colors.errorContainer, defaultLabel: 'Error' },
  };

  const { color, bg, defaultLabel } = config[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <AppText variant="labelMd" color={color} style={styles.text}>
        {label ?? defaultLabel}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
