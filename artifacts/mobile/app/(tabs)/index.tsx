import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AppText } from '@/components/ui/AppText';
import { AppButton } from '@/components/ui/AppButton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { VitalCard } from '@/components/ui/VitalCard';
import { spacing } from '@/constants/spacing';
import { fetchDashboard } from '@/services/dashboardService';
import type { DashboardResponse } from '@/types/dashboard';
import type { BackendVital, BackendVitalType } from '@/types/vitals';
import { VITAL_TYPE_META, getVitalUnit, latestOfType, mapVitalToListItem } from '@/lib/vitals';
import { useAuth } from '@/auth/AuthProvider';

const VITAL_ORDER: BackendVitalType[] = ['blood_pressure', 'heart_rate', 'oxygen', 'blood_sugar'];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const TODAY = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

export default function DashboardScreen() {
  const colors = useColors();
  const { themeMode } = useAppTheme();
  const { status } = useAuth();
  const insets = useSafeAreaInsets();
  const [dashboard, setDashboard] = React.useState<DashboardResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 16;
  const botPad = Platform.OS === 'web' ? 100 : insets.bottom + 88;
  const isDark = themeMode === 'dark';
  const currentVitals = dashboard?.current_vitals ?? [];
  const recentVitals = dashboard?.recent_vitals ?? [];
  const recentList = recentVitals.slice(0, 5).map(mapVitalToListItem);
  const healthScore = dashboard?.analysis_preview?.health_score ?? null;
  const recommendation = dashboard?.analysis_preview?.recommendations?.[0]
    ?? dashboard?.analysis_preview?.summary
    ?? dashboard?.analysis_preview?.health_message
    ?? 'Log readings to generate backend health recommendations.';
  const displayName = dashboard?.user?.name || 'HealthSync User';
  const scoreCardColors = {
    background: isDark ? '#02070A' : colors.brand,
    border: isDark ? 'rgba(24,224,194,0.18)' : 'transparent',
    label: isDark ? 'rgba(244,250,250,0.66)' : 'rgba(255,255,255,0.55)',
    score: '#ffffff',
    total: isDark ? 'rgba(168,183,194,0.72)' : 'rgba(255,255,255,0.45)',
    track: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.15)',
    footer: isDark ? 'rgba(168,183,194,0.66)' : 'rgba(255,255,255,0.4)',
  };

  const loadDashboard = React.useCallback(async () => {
    if (status !== 'authenticated') return;

    setLoading(true);
    setError(null);
    try {
      setDashboard(await fetchDashboard());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load dashboard.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useFocusEffect(
    React.useCallback(() => {
      void loadDashboard();
    }, [loadDashboard])
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceBackground }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>{greeting()}, 👋</AppText>
            <AppText variant="headlineLg" color={colors.onSurface}>{displayName}</AppText>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.dateLabel}>
              {TODAY}
            </AppText>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: colors.surfaceCard }]}
            onPress={() => router.navigate('/(tabs)/alerts')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.onSurface} />
            <View style={[styles.notifDot, { backgroundColor: colors.vitalsCritical }]} />
          </TouchableOpacity>
        </View>

        {(loading || error) && (
          <View style={[styles.stateCard, { backgroundColor: colors.surfaceCard, borderColor: error ? colors.errorColor + '35' : colors.actionBlue + '20' }]}>
            <AppText variant="bodySm" color={error ? colors.errorColor : colors.onSurfaceVariant}>
              {error || 'Loading dashboard from backend...'}
            </AppText>
          </View>
        )}

        {/* Health Score Card */}
        <View
          style={[
            styles.scoreCard,
            {
              backgroundColor: scoreCardColors.background,
              borderColor: scoreCardColors.border,
              shadowColor: isDark ? colors.vitalsNormal : '#000',
              shadowOpacity: isDark ? 0.16 : 0,
            },
          ]}
        >
          <View style={styles.scoreTop}>
            <AppText variant="labelMd" style={[styles.scoreLabelText, { color: scoreCardColors.label }]}>
              OVERALL HEALTH SCORE
            </AppText>
            <StatusBadge status={healthScore === null ? 'info' : healthScore >= 70 ? 'normal' : 'elevated'} label={dashboard?.analysis_preview?.risk_level || (healthScore === null ? 'No Data' : healthScore >= 70 ? 'Good' : 'Review')} />
          </View>
          <View style={styles.scoreRow}>
            <AppText variant="vitalsDisplay" style={[styles.scoreNum, { color: scoreCardColors.score }]}>{healthScore ?? '--'}</AppText>
            <AppText variant="headlineMd" style={[styles.scoreTotal, { color: scoreCardColors.total }]}>/100</AppText>
          </View>
          <View style={[styles.scoreTrack, { backgroundColor: scoreCardColors.track }]}>
            <View style={[styles.scoreFill, { width: `${healthScore ?? 0}%`, backgroundColor: colors.vitalsNormal }]} />
          </View>
          <AppText variant="labelMd" style={[styles.scoreFooterText, { color: scoreCardColors.footer }]}>
            {dashboard?.analysis_preview?.health_message || 'Last assessed from backend dashboard'}
          </AppText>
        </View>

        {/* Vitals Grid */}
        <View style={styles.section}>
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.sectionTitle}>
            Current Vitals
          </AppText>
          <View style={styles.grid}>
            <View style={styles.gridRow}>
              {VITAL_ORDER.slice(0, 2).map((type) => renderVitalCard(type, currentVitals))}
            </View>
            <View style={styles.gridRow}>
              {VITAL_ORDER.slice(2).map((type) => renderVitalCard(type, currentVitals))}
            </View>
          </View>
        </View>

        {/* Recent Readings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText variant="headlineMd" color={colors.onSurface} style={styles.sectionTitle}>
              Recent Readings
            </AppText>
            <TouchableOpacity onPress={() => router.navigate('/(tabs)/history')} activeOpacity={0.7}>
              <AppText variant="labelMd" color={colors.actionBlue} style={styles.seeAll}>
                See All
              </AppText>
            </TouchableOpacity>
          </View>
          <View style={[styles.card, { backgroundColor: colors.surfaceCard }]}>
            {recentList.length === 0 && (
              <View style={styles.emptyState}>
                <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                  No backend readings yet. Add a manual reading to populate history.
                </AppText>
              </View>
            )}
            {recentList.map((r, i) => (
              <TouchableOpacity
                key={r.id}
                onPress={() => router.push(r.route)}
                activeOpacity={0.8}
                style={[
                  styles.readingRow,
                  i < recentList.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.outlineVariant + '25',
                  },
                ]}
              >
                <View style={[styles.readingIcon, { backgroundColor: colors.actionBlueSoft }]}>
                  <Ionicons name={r.icon} size={17} color={colors.actionBlue} />
                </View>
                <View style={styles.readingMeta}>
                  <AppText variant="bodyMd" color={colors.onSurface}>{r.label}</AppText>
                  <AppText variant="bodySm" color={colors.onSurfaceVariant}>{r.fullDateTime}</AppText>
                </View>
                <View style={styles.readingValueCol}>
                  <AppText variant="headlineMd" color={colors.onSurface} style={styles.readingValueText}>
                    {r.value}
                  </AppText>
                  <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.readingUnitText}>
                    {r.unit}
                  </AppText>
                </View>
                <StatusBadge status={r.status} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* AI Recommendation */}
        <View style={styles.section}>
          <View style={[styles.aiCard, { backgroundColor: colors.actionBlueSoft, borderColor: colors.actionBlue + '22' }]}>
            <View style={styles.aiTop}>
              <View style={[styles.aiIconBg, { backgroundColor: colors.actionBlue }]}>
                <Ionicons name="sparkles" size={15} color="#fff" />
              </View>
              <AppText variant="labelMd" color={colors.actionBlue} style={styles.aiChipLabel}>
                AI Recommendation
              </AppText>
            </View>
            <AppText variant="bodyMd" color={colors.onSurface}>
              {recommendation}
            </AppText>
            <TouchableOpacity onPress={() => router.navigate('/(tabs)/ai-analysis')} activeOpacity={0.7}>
              <AppText variant="labelMd" color={colors.actionBlue} style={styles.aiLink}>
                View Full Analysis →
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Manual Reading */}
        <AppButton
          title="Add Manual Reading"
          onPress={() => router.push('/manual-reading')}
          icon="add-circle-outline"
          iconPosition="left"
        />
        <AppButton
          title="Start Device Measurement"
          onPress={() => router.push('/device-measurement')}
          icon="hardware-chip-outline"
          iconPosition="left"
          variant="brand"
          style={styles.deviceButton}
        />
      </ScrollView>
    </View>
  );
}

function renderVitalCard(type: BackendVitalType, currentVitals: BackendVital[]) {
  const meta = VITAL_TYPE_META[type];
  const vital = latestOfType(currentVitals, type);

  return (
    <VitalCard
      key={type}
      title={meta.label}
      value={vital ? mapVitalToListItem(vital).value : '--'}
      unit={getVitalUnit(type)}
      status={vital?.status ?? 'info'}
      icon={meta.icon}
      onPress={() => router.push(meta.route)}
      style={styles.gridCell}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.safeMargin },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.stackLg },
  headerText: { flex: 1 },
  dateLabel: { marginTop: 4, textTransform: 'none', letterSpacing: 0, fontSize: 12 },
  notifBtn: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  notifDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: '#fff' },
  scoreCard: { borderRadius: 20, padding: 20, marginBottom: spacing.stackLg, gap: 10, borderWidth: 1, shadowOffset: { width: 0, height: 10 }, shadowRadius: 24, elevation: 2 },
  stateCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: spacing.stackMd },
  scoreTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabelText: { fontSize: 10, letterSpacing: 0.8 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  scoreNum: { fontSize: 52, lineHeight: 56, letterSpacing: -2 },
  scoreTotal: { marginBottom: 10, fontSize: 22 },
  scoreTrack: { height: 4, borderRadius: 999, overflow: 'hidden' },
  scoreFill: { height: '100%', width: '78%', borderRadius: 999 },
  scoreFooterText: { fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' },
  section: { marginBottom: spacing.stackLg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.stackMd },
  sectionTitle: { fontSize: 18, marginBottom: spacing.stackMd },
  seeAll: { textTransform: 'none', letterSpacing: 0 },
  grid: { gap: spacing.stackMd },
  gridRow: { flexDirection: 'row', gap: spacing.stackMd },
  gridCell: { flex: 1 },
  card: { borderRadius: 16, overflow: 'hidden' },
  emptyState: { padding: 16 },
  readingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  readingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  readingMeta: { flex: 1 },
  readingValueCol: { alignItems: 'flex-end', marginRight: 8 },
  readingValueText: { fontSize: 16 },
  readingUnitText: { textTransform: 'none', letterSpacing: 0, fontSize: 10 },
  aiCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  aiTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiIconBg: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  aiChipLabel: { textTransform: 'none', letterSpacing: 0, fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  aiLink: { textTransform: 'none', letterSpacing: 0, fontFamily: 'Inter_600SemiBold' },
  deviceButton: { marginTop: spacing.stackSm },
});
