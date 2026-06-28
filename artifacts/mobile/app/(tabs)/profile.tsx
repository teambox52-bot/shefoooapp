import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/auth/AuthProvider';
import { formatDisplayDate, getAge, getFullName, getInitials, useProfile } from '@/profile/ProfileContext';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';

const INITIAL_TELEGRAM = {
  connected: true,
  username: '@jdoe_health',
  criticalAlerts: true,
  recommendations: true,
  dailySummary: false,
};

type SegmentOption<T extends string> = {
  label: string;
  value: T;
  icon?: keyof typeof Ionicons.glyphMap;
};

function StatCard() {
  const colors = useColors();
  const { profile } = useProfile();
  const stats = [
    { label: 'Blood', value: profile.blood_type || '--' },
    { label: 'Age', value: getAge(profile) },
    { label: 'H (cm)', value: profile.height_cm ? String(profile.height_cm) : '--' },
    { label: 'W (kg)', value: profile.weight_kg ? String(profile.weight_kg) : '--' },
  ];

  return (
    <View style={[styles.statCard, { backgroundColor: colors.surfaceCard }]}>
      {stats.map((item, index) => (
        <View
          key={item.label}
          style={[
            styles.statItem,
            index < stats.length - 1 && {
              borderRightWidth: 1,
              borderRightColor: colors.outlineVariant + '24',
            },
          ]}
        >
          <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.statLabel}>
            {item.label}
          </AppText>
          <AppText variant="headlineMd" color={colors.actionBlue} style={styles.statValue}>
            {item.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.infoRow,
        !last && {
          borderBottomWidth: 1,
          borderBottomColor: colors.outlineVariant + '22',
        },
      ]}
    >
      <Ionicons name={icon} size={21} color={colors.onSurfaceVariant} />
      <AppText variant="bodyMd" color={colors.onSurface} style={styles.infoLabel}>
        {label}
      </AppText>
      <AppText variant="bodySm" color={colors.onSurfaceVariant} style={styles.infoValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  const colors = useColors();

  return (
    <View style={styles.toggleRow}>
      <AppText variant="bodyMd" color={colors.onSurface}>
        {label}
      </AppText>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onChange(!value)}
        style={[
          styles.switchTrack,
          { backgroundColor: value ? colors.actionBlue : colors.outlineVariant + '35' },
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            { transform: [{ translateX: value ? 20 : 2 }] },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

function SegmentedSetting<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<SegmentOption<T>>;
  value: T;
  onChange: (value: T) => void;
}) {
  const colors = useColors();

  return (
    <View style={[styles.segment, { backgroundColor: colors.surfaceContainer }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.8}
            onPress={() => onChange(option.value)}
            style={[styles.segmentItem, active && { backgroundColor: colors.surfaceCard }]}
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={14}
                color={active ? colors.onSurface : colors.onSurfaceVariant}
              />
            )}
            <AppText
              variant="labelMd"
              color={active ? colors.onSurface : colors.onSurfaceVariant}
              style={styles.segmentLabel}
            >
              {option.label}
            </AppText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { signOut } = useAuth();
  const { profile, isLoading, isSaving, errorMessage, successMessage, saveProfile } = useProfile();
  const { themeMode, setThemeMode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 24 : insets.top;
  const botPad = Platform.OS === 'web' ? 100 : insets.bottom + 96;
  const [addOpen, setAddOpen] = useState(false);
  const [conditionDraft, setConditionDraft] = useState('');
  const [telegram, setTelegram] = useState(INITIAL_TELEGRAM);
  const [languageChoice, setLanguageChoice] = useState<'EN' | 'AR'>('EN');

  const completeLogout = () => {
    void signOut();
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      completeLogout();
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: completeLogout },
    ]);
  };

  function addCondition() {
    const next = conditionDraft.trim();
    if (!next) return;

    if (!profile.chronic_conditions.some((item) => item.toLowerCase() === next.toLowerCase())) {
      void saveProfile({
        ...profile,
        chronic_conditions: [...profile.chronic_conditions, next],
      });
    }
    setConditionDraft('');
    setAddOpen(false);
  }

  function removeCondition(condition: string) {
    void saveProfile({
      ...profile,
      chronic_conditions: profile.chronic_conditions.filter((item) => item !== condition),
    });
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.surfaceBackground }]} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: topPad + spacing.stackMd,
            paddingBottom: botPad,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="headlineLg" color={colors.onSurface} style={styles.headerTitle}>
            HealthSync
          </AppText>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.iconButton, { backgroundColor: colors.surfaceCard }]}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.identity}>
          <View>
            <View style={[styles.avatar, { backgroundColor: colors.actionBlue }]}>
              <AppText variant="headlineLg" color="#fff" style={styles.avatarText}>
                {getInitials(profile)}
              </AppText>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/profile/edit-step-1')}
              style={[styles.editBadge, { backgroundColor: colors.onSurface, borderColor: colors.surfaceBackground }]}
            >
              <Ionicons name="pencil" size={14} color={colors.surfaceCard} />
            </TouchableOpacity>
          </View>
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.name}>
            {getFullName(profile)}
          </AppText>
          <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.profileId}>
            ID: HS-9283-X1
          </AppText>
        </View>

        {(isLoading || isSaving || errorMessage || successMessage) && (
          <View
            style={[
              styles.statusCard,
              {
                backgroundColor: errorMessage ? colors.errorColor + '12' : colors.actionBlueSoft,
                borderColor: errorMessage ? colors.errorColor + '35' : colors.actionBlue + '24',
              },
            ]}
          >
            <AppText variant="bodySm" color={errorMessage ? colors.errorColor : colors.onSurface}>
              {errorMessage || successMessage || (isSaving ? 'Saving profile...' : 'Loading profile...')}
            </AppText>
          </View>
        )}

        <StatCard />

        <View style={styles.sectionHeader}>
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.sectionTitle}>
            Diagnosed Conditions
          </AppText>
        </View>
        <View style={styles.chipsRow}>
          {profile.chronic_conditions.map((condition) => (
            <TouchableOpacity
              key={condition}
              activeOpacity={0.85}
              onLongPress={() => removeCondition(condition)}
              style={[styles.conditionChip, { backgroundColor: colors.actionBlueSoft, borderColor: colors.actionBlue + '35' }]}
            >
              <Ionicons name="checkmark-circle" size={14} color={colors.actionBlue} />
              <AppText variant="labelMd" color={colors.actionBlue} style={styles.conditionText}>
                {condition}
              </AppText>
              <TouchableOpacity
                onPress={() => removeCondition(condition)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={14} color={colors.actionBlue} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setAddOpen(true)}
            style={[styles.addConditionChip, { backgroundColor: colors.outlineVariant + '18' }]}
          >
            <Ionicons name="add" size={16} color={colors.onSurfaceVariant} />
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.conditionText}>
              Add New
            </AppText>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.surfaceCard }]}>
          <InfoRow icon="calendar-outline" label="Date of Birth" value={formatDisplayDate(profile.date_of_birth)} />
          <InfoRow icon="medical-outline" label="Hospital Name" value={profile.hospital_name || '--'} last />
        </View>

        <AppText variant="headlineMd" color={colors.onSurface} style={styles.sectionTitle}>
          Telegram Notifications
        </AppText>
        <View style={[styles.telegramCard, { backgroundColor: colors.surfaceCard }]}>
          <View style={styles.telegramTop}>
            <View style={[styles.telegramIcon, { backgroundColor: colors.actionBlueSoft }]}>
              <Ionicons name="paper-plane-outline" size={22} color={colors.actionBlue} />
            </View>
            <View style={styles.telegramStatus}>
              <AppText variant="bodyMd" color={colors.onSurface}>
                Status
              </AppText>
              <AppText
                variant="bodySm"
                color={telegram.connected ? colors.vitalsNormal : colors.onSurfaceVariant}
                style={styles.telegramStatusText}
              >
                {telegram.connected ? `Connected as\n${telegram.username}` : 'Not connected'}
              </AppText>
            </View>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setTelegram((current) => ({ ...current, connected: !current.connected }))}
              style={[styles.telegramAction, { backgroundColor: colors.surfaceContainer }]}
            >
              <AppText variant="labelMd" color={colors.onSurface} style={styles.telegramActionText}>
                {telegram.connected ? 'Disconnect' : 'Connect'}
              </AppText>
            </TouchableOpacity>
          </View>

          <View style={[styles.telegramDivider, { backgroundColor: colors.outlineVariant + '22' }]} />

          <ToggleRow
            label="Critical Alerts"
            value={telegram.criticalAlerts}
            onChange={(value) => setTelegram((current) => ({ ...current, criticalAlerts: value }))}
          />
          <ToggleRow
            label="Health Recommendations"
            value={telegram.recommendations}
            onChange={(value) => setTelegram((current) => ({ ...current, recommendations: value }))}
          />
          <ToggleRow
            label="Daily Health Summary"
            value={telegram.dailySummary}
            onChange={(value) => setTelegram((current) => ({ ...current, dailySummary: value }))}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.testButton, { backgroundColor: colors.actionBlue }]}
          >
            <Ionicons name="mail-unread-outline" size={18} color="#fff" />
            <AppText variant="bodyMd" color="#fff" style={styles.testButtonText}>
              Send Test Message
            </AppText>
          </TouchableOpacity>
        </View>

        <AppText variant="headlineMd" color={colors.onSurface} style={styles.sectionTitle}>
          General Settings
        </AppText>
        <View style={[styles.settingsCard, { backgroundColor: colors.surfaceCard }]}>
          <View style={[styles.settingRow, { borderBottomColor: colors.outlineVariant + '22' }]}>
            <Ionicons name="moon-outline" size={21} color={colors.onSurfaceVariant} />
            <AppText variant="bodyMd" color={colors.onSurface} style={styles.settingLabel}>
              Theme
            </AppText>
            <SegmentedSetting
              value={themeMode}
              onChange={setThemeMode}
              options={[
                { label: 'Light', value: 'light', icon: 'sunny-outline' },
                { label: 'Dark', value: 'dark', icon: 'moon-outline' },
              ]}
            />
          </View>
          <View style={styles.settingRow}>
            <Ionicons name="globe-outline" size={21} color={colors.onSurfaceVariant} />
            <AppText variant="bodyMd" color={colors.onSurface} style={styles.settingLabel}>
              App Language
            </AppText>
            <SegmentedSetting
              value={languageChoice}
              onChange={setLanguageChoice}
              options={[
                { label: 'EN', value: 'EN' },
                { label: 'AR', value: 'AR' },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.85}
          style={[styles.logoutBtn, { backgroundColor: colors.surfaceCard, borderColor: colors.errorColor + '30' }]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.errorColor} />
          <AppText variant="bodyMd" color={colors.errorColor} style={styles.logoutText}>
            Sign Out
          </AppText>
        </TouchableOpacity>

        <AppText variant="labelMd" color={colors.outlineVariant} style={styles.version}>
          HealthSync v2.4.0 · Mobile Preview
        </AppText>
      </ScrollView>

      <Modal
        transparent
        visible={addOpen}
        animationType="fade"
        onRequestClose={() => setAddOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceCard }]}>
            <AppText variant="headlineMd" color={colors.onSurface} style={styles.modalTitle}>
              Add Condition
            </AppText>
            <TextInput
              value={conditionDraft}
              onChangeText={setConditionDraft}
              placeholder="Condition name"
              placeholderTextColor={colors.onSurfaceVariant}
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.surfaceContainer,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant + '35',
                },
              ]}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setConditionDraft('');
                  setAddOpen(false);
                }}
                style={[styles.modalButton, { backgroundColor: colors.surfaceContainer }]}
              >
                <AppText variant="labelMd" color={colors.onSurface}>
                  Cancel
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={addCondition}
                style={[styles.modalButton, { backgroundColor: colors.actionBlue }]}
              >
                <AppText variant="labelMd" color="#fff">
                  Add
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.safeMargin },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.stackLg },
  headerTitle: { fontSize: 25, letterSpacing: -0.5 },
  iconButton: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  identity: { alignItems: 'center', marginBottom: spacing.stackLg },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', shadowColor: '#0051d5', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.18, shadowRadius: 12, elevation: 5 },
  avatarText: { fontSize: 29 },
  editBadge: { position: 'absolute', right: -3, bottom: -2, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 3 },
  name: { marginTop: 18, fontSize: 21 },
  profileId: { marginTop: 2, textTransform: 'none', letterSpacing: 0, fontSize: 12 },
  statCard: { flexDirection: 'row', borderRadius: 12, paddingVertical: 14, marginBottom: spacing.stackLg, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  statusCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: spacing.stackLg },
  statItem: { flex: 1, alignItems: 'center', gap: 3 },
  statLabel: { textTransform: 'none', letterSpacing: 0, fontSize: 11 },
  statValue: { fontSize: 20, lineHeight: 24 },
  sectionHeader: { marginBottom: spacing.stackSm },
  sectionTitle: { fontSize: 21, marginBottom: spacing.stackMd, marginTop: spacing.stackSm },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.stackLg },
  conditionChip: { minHeight: 38, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: '100%' },
  addConditionChip: { minHeight: 38, borderRadius: 999, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 6 },
  conditionText: { textTransform: 'none', letterSpacing: 0, fontSize: 13 },
  infoCard: { borderRadius: 12, overflow: 'hidden', marginBottom: spacing.stackLg },
  infoRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  infoLabel: { flex: 1 },
  infoValue: { maxWidth: '48%', textAlign: 'right' },
  telegramCard: { borderRadius: 12, padding: 16, marginBottom: spacing.stackLg },
  telegramTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  telegramIcon: { width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  telegramStatus: { flex: 1 },
  telegramStatusText: { lineHeight: 19 },
  telegramAction: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10 },
  telegramActionText: { textTransform: 'none', letterSpacing: 0 },
  telegramDivider: { height: 1, marginVertical: 14 },
  toggleRow: { minHeight: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  switchTrack: { width: 48, height: 28, borderRadius: 999, padding: 2, justifyContent: 'center' },
  switchThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff' },
  testButton: { height: 48, borderRadius: 8, marginTop: spacing.stackMd, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  testButtonText: { fontFamily: 'Inter_600SemiBold' },
  settingsCard: { borderRadius: 12, overflow: 'hidden', marginBottom: spacing.stackLg },
  settingRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, borderBottomWidth: 1 },
  settingLabel: { flex: 1 },
  segment: { flexDirection: 'row', borderRadius: 9, padding: 3, gap: 3 },
  segmentItem: { minWidth: 70, minHeight: 32, borderRadius: 7, paddingHorizontal: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  segmentLabel: { textTransform: 'none', letterSpacing: 0, fontSize: 12 },
  logoutBtn: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 14, borderWidth: 1, marginBottom: spacing.stackMd },
  logoutText: { fontFamily: 'Inter_600SemiBold' },
  version: { textAlign: 'center', fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.stackSm },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: spacing.safeMargin },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: 18, padding: 18, gap: 14 },
  modalTitle: { fontSize: 18 },
  modalInput: { height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: 'Inter_500Medium' },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalButton: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
