import React from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { InteractiveLineChart } from '@/components/InteractiveLineChart';
import { AppText } from '@/components/ui/AppText';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/spacing';
import { fetchVitals } from '@/services/vitalsService';
import type { BackendVital, BackendVitalType } from '@/types/vitals';
import { average, buildChartPoints, formatVitalDateTime, getVitalDisplayValue, getVitalNumericValue, statusLabel } from '@/lib/vitals';
import { useAuth } from '@/auth/AuthProvider';

type VitalDetailScreenProps = {
  title: string;
  type: BackendVitalType;
  manualType: 'blood-pressure' | 'heart-rate' | 'blood-oxygen' | 'blood-glucose';
  icon: keyof typeof Ionicons.glyphMap;
  unit: string;
  accentKey: 'brand' | 'vitalsNormal' | 'vitalsInfo' | 'vitalsElevated';
  normalRange: string;
  chartLabel: string;
  recommendation: string;
};

export function VitalDetailScreen({
  title,
  type,
  manualType,
  icon,
  unit,
  accentKey,
  normalRange,
  chartLabel,
  recommendation,
}: VitalDetailScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  const [items, setItems] = React.useState<BackendVital[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const botPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;
  const accent = colors[accentKey];
  const latest = items[0] ?? null;
  const latestDate = formatVitalDateTime(latest?.measured_at ?? latest?.created_at);
  const chartPoints = buildChartPoints(items, type);

  const loadVitals = React.useCallback(async () => {
    if (status === 'loading') return;

    if (status !== 'authenticated') {
      setItems([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetchVitals(type);
      setItems(response.items);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load readings.');
    } finally {
      setLoading(false);
    }
  }, [status, type]);

  React.useEffect(() => {
    void loadVitals();
  }, [loadVitals]);

  useFocusEffect(
    React.useCallback(() => {
      void loadVitals();
    }, [loadVitals])
  );

  const avg = React.useMemo(() => {
    if (!items.length) return '--';

    if (type === 'blood_pressure') {
      const systolic = average(items.map((item) => Number(item.systolic ?? 0)).filter(Boolean));
      const diastolic = average(items.map((item) => Number(item.diastolic ?? 0)).filter(Boolean));
      return systolic && diastolic ? `${systolic}/${diastolic}` : '--';
    }

    const value = average(items.map(getVitalNumericValue).filter(Boolean));
    return value ? `${value} ${unit}` : '--';
  }, [items, type, unit]);

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceBackground }]}>
      <View style={[styles.appBar, { paddingTop: topPad, height: 56 + topPad, backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={24} color={colors.brand} />
        </TouchableOpacity>
        <AppText variant="headlineMd" color={colors.onSurface}>{title}</AppText>
        <TouchableOpacity onPress={() => router.push(`/manual-reading?type=${manualType}`)} activeOpacity={0.8} style={[styles.addBtn, { backgroundColor: colors.actionBlue }]}>
          <Ionicons name="add" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: botPad }]} showsVerticalScrollIndicator={false}>
        {(loading || error) && (
          <View style={[styles.stateCard, { backgroundColor: colors.surfaceCard, borderColor: error ? colors.errorColor + '35' : colors.outlineVariant + '22' }]}>
            <AppText variant="bodySm" color={error ? colors.errorColor : colors.onSurfaceVariant}>
              {error || `Loading ${title.toLowerCase()} readings from backend...`}
            </AppText>
          </View>
        )}

        <View style={[styles.currentCard, { backgroundColor: accent }]}>
          <View style={styles.currentTop}>
            <View style={[styles.currentIconBg, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
              <Ionicons name={icon} size={20} color="#fff" />
            </View>
            <AppText style={[styles.currentLabel, { color: 'rgba(255,255,255,0.7)' }]}>CURRENT READING</AppText>
          </View>
          <View style={styles.currentValueRow}>
            <AppText variant="vitalsDisplay" style={styles.currentValue}>{latest ? getVitalDisplayValue(latest) : '--'}</AppText>
            <AppText variant="headlineMd" style={styles.currentUnit}>{unit}</AppText>
          </View>
          <View style={styles.currentBottom}>
            <StatusBadge status={latest?.status ?? 'info'} label={latest ? statusLabel(latest.status) : 'No Data'} />
            <AppText style={[styles.currentTime, { color: 'rgba(255,255,255,0.65)' }]}>{latest ? latestDate.fullDateTime : 'No backend reading yet'}</AppText>
          </View>
        </View>

        <View style={[styles.infoRow, { backgroundColor: colors.surfaceCard }]}>
          <View style={styles.infoItem}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.infoItemLabel}>Normal Range</AppText>
            <AppText variant="bodyMd" color={colors.onSurface}>{normalRange}</AppText>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.outlineVariant + '30' }]} />
          <View style={styles.infoItem}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.infoItemLabel}>Backend Avg</AppText>
            <AppText variant="bodyMd" color={colors.onSurface}>{avg}</AppText>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.outlineVariant + '30' }]} />
          <View style={styles.infoItem}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.infoItemLabel}>Readings</AppText>
            <AppText variant="bodyMd" color={colors.onSurface}>{items.length} total</AppText>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceCard }]}>
          <View style={styles.sectionHeader}>
            <AppText variant="headlineMd" color={colors.onSurface} style={styles.sectionTitle}>7-Day Trend</AppText>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.sectionSub}>{chartLabel}</AppText>
          </View>
          <InteractiveLineChart
            data={chartPoints}
            color={accent}
            unit={unit}
            getValue={(item) => item.value}
            formatTooltip={(item) => type === 'blood_pressure'
              ? `${item.day} • ${item.systolic}/${item.diastolic} mmHg`
              : `${item.day} • ${item.value} ${unit}`}
          />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surfaceCard }]}>
          <AppText variant="headlineMd" color={colors.onSurface} style={[styles.sectionTitle, { marginBottom: 12 }]}>Reading History</AppText>
          {!items.length && !loading && (
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              No backend readings yet.
            </AppText>
          )}
          {items.slice(0, 10).map((reading, index) => {
            const dateTime = formatVitalDateTime(reading.measured_at ?? reading.created_at);
            return (
              <View key={reading.id} style={[styles.historyRow, index < items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant + '22' }]}>
                <View>
                  <AppText variant="bodyMd" color={colors.onSurface}>{getVitalDisplayValue(reading)} {unit}</AppText>
                  <AppText variant="bodySm" color={colors.onSurfaceVariant}>{dateTime.fullDateTime}</AppText>
                </View>
                <StatusBadge status={reading.status} />
              </View>
            );
          })}
        </View>

        <View style={[styles.recoCard, { backgroundColor: accent + '12', borderColor: accent + '25' }]}>
          <Ionicons name="information-circle-outline" size={18} color={accent} />
          <AppText variant="bodySm" color={colors.onSurface} style={styles.recoText}>
            {recommendation}
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  appBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.safeMargin, paddingBottom: 12 },
  backBtn: { marginRight: spacing.stackMd, padding: 4, marginBottom: -4 },
  addBtn: { marginLeft: 'auto', width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: spacing.safeMargin, paddingTop: spacing.stackMd, gap: spacing.stackMd },
  stateCard: { borderWidth: 1, borderRadius: 14, padding: 14 },
  currentCard: { borderRadius: 20, padding: 20, gap: 12 },
  currentTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  currentIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  currentLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.6 },
  currentValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  currentValue: { color: '#fff', fontSize: 48, lineHeight: 52, letterSpacing: -1.5 },
  currentUnit: { color: 'rgba(255,255,255,0.7)', marginBottom: 8, fontSize: 18 },
  currentBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  currentTime: { flex: 1, textAlign: 'right', fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.4 },
  infoRow: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden' },
  infoItem: { flex: 1, alignItems: 'center', paddingVertical: 14, gap: 4 },
  infoItemLabel: { textTransform: 'none', letterSpacing: 0, fontSize: 11 },
  infoDivider: { width: 1, marginVertical: 14 },
  section: { borderRadius: 16, padding: 16, gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16 },
  sectionSub: { textTransform: 'none', letterSpacing: 0, fontSize: 11 },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  recoCard: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1 },
  recoText: { flex: 1, lineHeight: 20 },
});
