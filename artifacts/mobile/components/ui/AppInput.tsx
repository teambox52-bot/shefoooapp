import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppText } from './AppText';

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  variant?: 'outlined' | 'underlined';
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export function AppInput({
  label,
  icon,
  error,
  variant = 'outlined',
  containerStyle,
  isPassword,
  ...props
}: AppInputProps) {
  const colors = useColors();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const hasError = !!error;

  const inputContainerStyle: ViewStyle =
    variant === 'outlined'
      ? {
          backgroundColor: colors.surfaceContainerLowest,
          borderWidth: 1,
          borderColor: hasError
            ? colors.errorColor
            : focused
            ? colors.actionBlue
            : 'rgba(207, 196, 197, 0.35)',
          borderRadius: 12,
        }
      : {
          backgroundColor: colors.surfaceContainer,
          borderBottomWidth: 2,
          borderBottomColor: hasError
            ? colors.errorColor
            : focused
            ? colors.actionBlue
            : colors.outlineVariant,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.label}>
          {label}
        </AppText>
      )}
      <View style={[styles.inputRow, inputContainerStyle]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.actionBlue : colors.onSurfaceVariant}
            style={styles.icon}
          />
        )}
        <TextInput
          {...props}
          style={[
            styles.input,
            {
              color: colors.onSurface,
              fontFamily: 'Inter_400Regular',
              fontSize: 16,
              paddingLeft: icon ? 10 : 14,
            },
          ]}
          placeholderTextColor={colors.outline}
          secureTextEntry={isPassword && !showPassword}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword((v) => !v)}
            style={styles.eyeBtn}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.onSurfaceVariant}
            />
          </TouchableOpacity>
        )}
      </View>
      {hasError && (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={colors.errorColor} />
          <AppText
            variant="bodySm"
            color={colors.errorColor}
            style={styles.errorText}
          >
            {error}
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    paddingLeft: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  icon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    height: 48,
    paddingRight: 14,
  },
  eyeBtn: {
    paddingHorizontal: 14,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingLeft: 2,
  },
  errorText: {
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 12,
  },
});
