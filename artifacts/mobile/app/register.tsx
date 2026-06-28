import React, { useState } from 'react';
import {
  FlatList,
  Modal,
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
import { ProgressBar } from '@/components/ui/ProgressBar';
import { spacing } from '@/constants/spacing';

const countryCodes = [
  { name: 'Egypt', code: '+20', flag: '🇪🇬' },
  { name: 'United Arab Emirates', code: '+971', flag: '🇦🇪' },
  { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
  { name: 'Kuwait', code: '+965', flag: '🇰🇼' },
  { name: 'Qatar', code: '+974', flag: '🇶🇦' },
  { name: 'Bahrain', code: '+973', flag: '🇧🇭' },
  { name: 'Oman', code: '+968', flag: '🇴🇲' },
  { name: 'Jordan', code: '+962', flag: '🇯🇴' },
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
];

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState(countryCodes[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const confirmError =
    confirmPassword.length > 0 && password !== confirmPassword
      ? 'Passwords do not match'
      : undefined;
  const canContinue =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    phone.trim() &&
    password &&
    confirmPassword &&
    !confirmError;

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const appBarHeight = spacing.touchTarget;
  const bottomPadding = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceBackground }]}>
      {/* AppBar */}
      <View
        style={[
          styles.appBar,
          {
            backgroundColor: colors.surface,
            paddingTop: topPadding,
            height: appBarHeight + topPadding,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.brand} />
        </TouchableOpacity>
        <AppText variant="headlineMd" color={colors.onSurface}>
          Create Account
        </AppText>
        <View style={styles.appBarSpacer} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar step={1} total={2} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* First + Last Name */}
          <View style={styles.nameRow}>
            <View style={styles.nameField}>
              <AppInput
                label="First Name"
                placeholder="e.g. John"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.nameField}>
              <AppInput
                label="Last Name"
                placeholder="e.g. Doe"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <AppInput
            label="Email Address"
            icon="mail-outline"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          {/* Phone */}
          <View style={styles.phoneGroup}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.phoneLabel}>
              Phone Number
            </AppText>
            <View style={styles.phoneRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setShowCountryPicker(true)}
                style={[
                  styles.countryCodeBtn,
                  {
                    backgroundColor: colors.surfaceContainerLowest,
                    borderWidth: 1,
                    borderColor: 'rgba(207, 196, 197, 0.35)',
                    borderRadius: 12,
                  },
                ]}
              >
                <Ionicons name="globe-outline" size={16} color={colors.onSurfaceVariant} />
                <AppText
                  variant="bodyMd"
                  color={colors.onSurface}
                  style={styles.countryCodeText}
                >
                  {countryCode.code}
                </AppText>
                <Ionicons name="chevron-down" size={14} color={colors.onSurfaceVariant} />
              </TouchableOpacity>
              <View style={styles.phoneInput}>
                <AppInput
                  placeholder="50 123 4567"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </View>

          {/* Password */}
          <AppInput
            label="Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoCapitalize="none"
          />

          {/* Confirm Password */}
          <AppInput
            label="Confirm Password"
            icon="lock-closed-outline"
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            isPassword
            autoCapitalize="none"
            error={confirmError}
          />

          {/* Continue */}
          <AppButton
            title="Continue"
            onPress={() => {
              if (!canContinue) return;

              router.push({
                pathname: '/register-profile',
                params: {
                  firstName: firstName.trim(),
                  lastName: lastName.trim(),
                  email: email.trim(),
                  phoneCountryCode: countryCode.code,
                  phoneNumber: phone.replace(/\D/g, ''),
                  password,
                  passwordConfirmation: confirmPassword,
                },
              });
            }}
            disabled={!canContinue}
            icon="arrow-forward"
            style={styles.continueBtn}
          />

          {/* Sign In link */}
          <View style={styles.signInRow}>
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              Already have an account?{' '}
            </AppText>
            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
              <AppText variant="bodySm" color={colors.actionBlue} style={styles.boldLink}>
                Sign In
              </AppText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>

      <Modal
        visible={showCountryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceCard,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.sheetTitle}>
            Select Country Code
          </AppText>
          <FlatList
            data={countryCodes}
            keyExtractor={(item) => item.code}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item.code === countryCode.code;
              return (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    setCountryCode(item);
                    setShowCountryPicker(false);
                  }}
                  style={[
                    styles.countryOption,
                    {
                      backgroundColor: selected ? colors.actionBlueSoft : colors.surfaceContainerLow,
                      borderColor: selected ? colors.actionBlue : 'transparent',
                    },
                  ]}
                >
                  <AppText variant="headlineMd" color={colors.onSurface} style={styles.countryFlag}>
                    {item.flag}
                  </AppText>
                  <View style={styles.countryMeta}>
                    <AppText variant="bodyMd" color={colors.onSurface}>
                      {item.name}
                    </AppText>
                    <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                      {item.code}
                    </AppText>
                  </View>
                  {selected && <Ionicons name="checkmark-circle" size={20} color={colors.actionBlue} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  appBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.safeMargin,
    paddingBottom: 12,
  },
  backBtn: {
    marginRight: spacing.stackMd,
    padding: 4,
    marginBottom: -4,
  },
  appBarSpacer: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.safeMargin,
  },
  progressSection: {
    marginTop: spacing.stackLg,
    marginBottom: spacing.stackLg,
  },
  form: {
    gap: spacing.stackMd,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.gutter,
  },
  nameField: { flex: 1 },
  phoneGroup: {
    gap: 6,
  },
  phoneLabel: {
    paddingLeft: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    gap: spacing.stackSm,
    alignItems: 'stretch',
  },
  countryCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 48,
    width: 96,
  },
  countryCodeText: {
    flex: 1,
    fontSize: 15,
  },
  phoneInput: { flex: 1 },
  continueBtn: { marginTop: spacing.stackSm },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: spacing.safeMargin,
    maxHeight: '68%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    marginBottom: 16,
  },
  countryOption: {
    minHeight: 58,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countryFlag: {
    fontSize: 22,
  },
  countryMeta: {
    flex: 1,
    gap: 2,
  },
});
