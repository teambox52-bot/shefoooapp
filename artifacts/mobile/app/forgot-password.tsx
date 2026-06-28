import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { spacing } from '@/constants/spacing';

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top + 40;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      setTimeout(() => router.push('/reset-password'), 800);
    }, 900);
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
      {/* Back link */}
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
        style={styles.backRow}
      >
        <Ionicons name="chevron-back" size={18} color={colors.actionBlue} />
        <AppText variant="labelMd" color={colors.actionBlue} style={styles.backText}>
          Back to Login
        </AppText>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: colors.actionBlueSoft }]}>
          <Ionicons name="mail-open-outline" size={28} color={colors.actionBlue} />
        </View>
        <AppText variant="headlineXlMobile" color={colors.onSurface} style={styles.title}>
          Forgot Password
        </AppText>
        <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.subtitle}>
          Enter your registered email and we'll send you a reset code.
        </AppText>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <AppInput
          label="Email Address"
          icon="mail-outline"
          variant="underlined"
          placeholder="name@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {sent && (
          <View style={[styles.successBanner, { backgroundColor: colors.vitalsNormal + '18', borderColor: colors.vitalsNormal + '30' }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={colors.vitalsNormal} />
            <AppText variant="bodySm" color={colors.vitalsNormal} style={styles.successText}>
              Reset code sent! Redirecting…
            </AppText>
          </View>
        )}

        <AppButton
          title="Send Reset Code"
          onPress={handleSend}
          loading={loading}
          icon="send-outline"
          style={styles.sendBtn}
        />

        <View style={styles.signInRow}>
          <AppText variant="bodySm" color={colors.onSurfaceVariant}>
            Remember your password?{' '}
          </AppText>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
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
  title: {},
  subtitle: {
    lineHeight: 24,
  },
  form: {
    gap: spacing.stackMd,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  successText: {
    flex: 1,
    textTransform: 'none',
    letterSpacing: 0,
  },
  sendBtn: {},
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.stackSm,
  },
  boldLink: {
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'none',
    letterSpacing: 0,
  },
});
