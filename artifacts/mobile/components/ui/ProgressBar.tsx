import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { AppText } from './AppText';

interface ProgressBarProps {
  step: number;
  total?: number;
}

export function ProgressBar({ step, total = 2 }: ProgressBarProps) {
  const colors = useColors();
  const percent = Math.round((step / total) * 100);
  const fillWidth = `${percent}%` as const;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <AppText variant="labelMd" color={colors.actionBlue}>
          Step {step} of {total}
        </AppText>
        <AppText variant="labelMd" color={colors.onSurfaceVariant}>
          {percent}% Complete
        </AppText>
      </View>
      <View style={[styles.track, { backgroundColor: colors.surfaceContainer }]}>
        <View
          style={[
            styles.fill,
            { width: fillWidth, backgroundColor: colors.actionBlue },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
