import React from 'react';
import {
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppText } from './AppText';

interface AppButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'brand' | 'text';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  iconPosition = 'right',
  style,
}: AppButtonProps) {
  const colors = useColors();
  const isDisabled = disabled || loading;

  const bgColor =
    variant === 'primary'
      ? colors.actionBlue
      : variant === 'brand'
      ? colors.brand
      : 'transparent';

  const fgColor =
    variant === 'primary'
      ? colors.actionBlueForeground
      : variant === 'brand'
      ? colors.brandForeground
      : colors.actionBlue;

  const shadowColor =
    variant === 'primary'
      ? colors.actionBlue
      : variant === 'brand'
      ? '#000000'
      : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderRadius: 12,
          opacity: isDisabled ? 0.6 : 1,
          shadowColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: variant !== 'text' ? 0.25 : 0,
          shadowRadius: 16,
          elevation: variant !== 'text' ? 4 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fgColor} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons name={icon} size={20} color={fgColor} />
          )}
          <AppText variant="headlineMd" color={fgColor} style={styles.label}>
            {title}
          </AppText>
          {icon && iconPosition === 'right' && (
            <Ionicons name={icon} size={20} color={fgColor} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
  },
});
