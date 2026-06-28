import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppText } from './AppText';

interface ConditionChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function ConditionChip({ label, selected, onPress }: ConditionChipProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.chip,
        {
          borderColor: selected ? colors.actionBlue : colors.outlineVariant,
          backgroundColor: selected ? colors.actionBlueSoft : 'transparent',
        },
      ]}
    >
      {selected && (
        <Ionicons
          name="checkmark"
          size={13}
          color={colors.actionBlue}
          style={{ marginRight: 4 }}
        />
      )}
      <AppText
        variant="labelMd"
        color={selected ? colors.actionBlue : colors.onSurfaceVariant}
        style={styles.label}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 999,
    borderWidth: 1,
  },
  label: {
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 13,
  },
});
