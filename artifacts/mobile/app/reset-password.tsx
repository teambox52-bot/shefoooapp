import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { spacing } from '@/constants/spacing';

export default function ResetPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top + 40;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const confirmError =
    confirmPassword.length > 0 && newPassword !== confirmPassword
      ? 'Passwords do not match'
      : undefined;

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/');
    }, 1000);
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.root, { backgroundColor: colors.surfaceBackground }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: topPadding, paddingBottom: bottomPadding },
      ]}
      showsVerticalScrollIndicator={false}
      bottomOffset={20}
    >
      {/* Back */}
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        style={styles.backRow}
      >
        <Ionicons name="chevron-back" size={18} color={colors.actionBlue} />
        <AppText variant="labelMd" color={colors.actionBlue} style={styles.backText}>
          Back
        </AppText>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.actionBlueSoft }]}>
          <Ionicons name="key-outline" size={28} color={colors.actionBlue} />
        </View>
        <AppText variant="headlineXlMobile" color={colors.onSurface}>
          Reset Password
        </AppText>
        <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
          Enter the 6-digit code sent to your email, then choose a new password.
        </AppText>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* OTP code input */}
        <View style={styles.codeGroup}>
          <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.codeLabel}>
            Verification Code
          </AppText>
          <TextInput
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            style={[
              styles.codeInput,
              {
                color: colors.onSurface,
                fontFamily: 'Manrope_700Bold',
                backgroundColor: colors.surfaceContainerLowest,
                borderWidth: 1,
                borderColor: code.length === 6 ? colors.vitalsNormal : 'rgba(207,196,197,0.35)',
                borderRadius: 12,
              },
            ]}
            placeholder="  •  •  •  •  •  •"
            placeholderTextColor={colors.outline}
          />
          <TouchableOpacity activeOpacity={0.7} style={styles.resendRow}>
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              Didn't receive the code?{' '}
            </AppText>
            <AppText variant="bodySm" color={colors.actionBlue} style={styles.boldLink}>
              Resend
            </AppText>
          </TouchableOpacity>
        </View>

        <AppInput
          label="New Password"
          icon="lock-closed-outline"
          variant="underlined"
          placeholder="••••••••"
          value={newPassword}
          onChangeText={setNewPassword}
          isPassword
          autoCapitalize="none"
        />

        <AppInput
          label="Confirm New Password"
          icon="lock-closed-outline"
          variant="underlined"
          placeholder="••••••••"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          autoCapitalize="none"
          error={confirmError}
        />

        <AppButton
          title="Reset Password"
          onPress={handleReset}
          loading={loading}
          icon="checkmark-circle-outline"
          style={styles.resetBtn}
        />

        <View style={styles.signInRow}>
          <AppText variant="bodySm" color={colors.onSurfaceVariant}>
            Remembered it?{' '}
          </AppText>
          <TouchableOpacity onPress={() => router.replace('/')} activeOpacity={0.7}>
            <AppText variant="bodySm" color={colors.actionBlue} style={styles.boldLink}>
              Sign In
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.safeMargin,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.stackLg,
  },
  backText: {
    textTransform: 'none',
    letterSpacing: 0,
  },
  header: {
    marginBottom: spacing.stackLg * 1.5,
    gap: spacing.stackMd,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.stackSm,
  },
  form: {
    gap: spacing.stackMd,
  },
  codeGroup: {
    gap: 8,
  },
  codeLabel: {
    paddingLeft: 2,
  },
  codeInput: {
    height: 56,
    fontSize: 24,
    letterSpacing: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
  },
  resetBtn: { marginTop: spacing.stackSm },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldLink: {
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'none',
    letterSpacing: 0,
  },
});
