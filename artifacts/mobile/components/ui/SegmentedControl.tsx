import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { AppText } from './AppText';

interface SegmentedControlProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainer }]}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            activeOpacity={0.8}
            style={[
              styles.option,
              selected && {
                backgroundColor: colors.surfaceCard,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.06,
                shadowRadius: 3,
                elevation: 2,
              },
            ]}
          >
            <AppText
              variant="labelMd"
              color={selected ? colors.onSurface : colors.onSurfaceVariant}
              style={styles.optionText}
            >
              {option}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  optionText: {
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 13,
  },
});
