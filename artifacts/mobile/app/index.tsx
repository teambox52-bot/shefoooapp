import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
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
import { useAuth } from '@/auth/AuthProvider';
import { getApiErrorMessage } from '@/lib/apiClient';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      await signIn({
        email: email.trim(),
        password,
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in.'));
    } finally {
      setLoading(false);
    }
  };

  const topPadding = Platform.OS === 'web' ? 67 : insets.top + 40;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 24;

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
      {/* Brand Header */}
      <View style={styles.brandSection}>
        <View style={[styles.logoContainer, { backgroundColor: colors.brand }]}>
          <Ionicons name="pulse" size={32} color={colors.brandForeground} />
        </View>
        <AppText variant="headlineXlMobile" color={colors.brand} style={styles.brandTitle}>
          HealthSync
        </AppText>
        <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.brandSubtitle}>
          Securely manage your vital diagnostics.
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

        <View style={styles.passwordBlock}>
          <View style={styles.passwordLabelRow}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant}>
              Password
            </AppText>
            <TouchableOpacity onPress={() => router.push('/forgot-password')} activeOpacity={0.7}>
              <AppText variant="labelMd" color={colors.actionBlue} style={styles.forgotLink}>
                Forgot password?
              </AppText>
            </TouchableOpacity>
          </View>
          <AppInput
            icon="lock-closed-outline"
            variant="underlined"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
          />
        </View>

        <AppButton
          title="Sign In"
          onPress={handleSignIn}
          loading={loading}
          icon="log-in-outline"
          style={styles.signInBtn}
        />

        {error && (
          <AppText variant="bodySm" color={colors.errorColor} style={styles.errorText}>
            {error}
          </AppText>
        )}

        <View style={styles.registerRow}>
          <AppText variant="bodySm" color={colors.onSurfaceVariant}>
            {'Don\'t have an account? '}
          </AppText>
          <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
            <AppText variant="bodySm" color={colors.actionBlue} style={styles.boldLink}>
              Create account
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.diagnosticBtn,
            {
              backgroundColor: colors.surfaceContainerLow,
              borderColor: colors.outlineVariant,
            },
          ]}
          activeOpacity={0.8}
        >
          <Ionicons name="terminal-outline" size={14} color={colors.onSurfaceVariant} />
          <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.diagnosticText}>
            Run API Diagnostic
          </AppText>
        </TouchableOpacity>
        <AppText
          variant="labelMd"
          color={colors.outlineVariant}
          style={styles.versionText}
        >
          BUILD 2.4.0 • ENTERPRISE EDITION
        </AppText>
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
  brandSection: {
    alignItems: 'center',
    marginBottom: spacing.stackLg,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.stackMd,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  brandTitle: {
    marginBottom: 6,
  },
  brandSubtitle: {
    textAlign: 'center',
  },
  form: {
    flex: 1,
    gap: spacing.stackMd,
    justifyContent: 'center',
  },
  passwordBlock: {
    gap: 0,
  },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  forgotLink: {
    textTransform: 'none',
    letterSpacing: 0,
  },
  signInBtn: {
    marginTop: spacing.stackSm,
  },
  errorText: {
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boldLink: {
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'none',
    letterSpacing: 0,
  },
  footer: {
    marginTop: spacing.stackLg,
    alignItems: 'center',
    gap: spacing.stackMd,
  },
  diagnosticBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  diagnosticText: {
    textTransform: 'none',
    letterSpacing: 0,
  },
  versionText: {
    fontSize: 10,
    letterSpacing: 1.6,
  },
});
