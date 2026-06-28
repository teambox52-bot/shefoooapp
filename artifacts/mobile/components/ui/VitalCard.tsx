import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppText } from './AppText';
import { StatusBadge } from './StatusBadge';

interface VitalCardProps {
  title: string;
  value: string;
  unit: string;
  status: 'normal' | 'elevated' | 'critical' | 'info';
  trend?: string;
  trendUp?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: ViewStyle;
}

export function VitalCard({
  title,
  value,
  unit,
  status,
  trend,
  trendUp,
  icon,
  onPress,
  style,
}: VitalCardProps) {
  const colors = useColors();

  const statusColor = {
    normal: colors.vitalsNormal,
    elevated: colors.vitalsElevated,
    critical: colors.vitalsCritical,
    info: colors.vitalsInfo,
  }[status];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: colors.surfaceCard,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 2,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconBg, { backgroundColor: statusColor + '1a' }]}>
          <Ionicons name={icon} size={15} color={statusColor} />
        </View>
        {trend && (
          <View style={styles.trend}>
            <Ionicons
              name={trendUp ? 'arrow-up-outline' : 'arrow-down-outline'}
              size={10}
              color={trendUp ? colors.vitalsElevated : colors.vitalsNormal}
            />
            <AppText
              variant="labelMd"
              color={trendUp ? colors.vitalsElevated : colors.vitalsNormal}
              style={styles.trendText}
            >
              {trend}
            </AppText>
          </View>
        )}
      </View>

      <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.title}>
        {title}
      </AppText>

      <AppText
        variant="vitalsDisplay"
        color={colors.onSurface}
        style={styles.value}
        numberOfLines={1}
      >
        {value}
      </AppText>

      <View style={styles.footer}>
        <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.unit}>
          {unit}
        </AppText>
        <StatusBadge status={status} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  trendText: {
    fontSize: 10,
    textTransform: 'none',
    letterSpacing: 0,
  },
  title: {
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
  },
  value: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  unit: {
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 11,
  },
});
