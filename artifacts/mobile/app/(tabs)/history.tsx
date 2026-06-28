import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppText } from '@/components/ui/AppText';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/spacing';
import { fetchVitals } from '@/services/vitalsService';
import { MOBILE_TO_BACKEND_TYPE, mapVitalToListItem } from '@/lib/vitals';
import type { VitalListItem } from '@/types/vitals';
import { useAuth } from '@/auth/AuthProvider';

type VitalType = 'all' | 'blood-pressure' | 'heart-rate' | 'blood-oxygen' | 'blood-glucose';

const FILTERS: { key: VitalType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'blood-pressure', label: 'Blood Pressure' },
  { key: 'heart-rate', label: 'Heart Rate' },
  { key: 'blood-oxygen', label: 'Blood Oxygen' },
  { key: 'blood-glucose', label: 'Blood Glucose' },
];

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { status } = useAuth();
  const [filter, setFilter] = useState<VitalType>('all');
  const [readings, setReadings] = useState<VitalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 16;
  const botPad = Platform.OS === 'web' ? 100 : insets.bottom + 88;

  const loadHistory = React.useCallback(async () => {
    if (status !== 'authenticated') return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetchVitals(filter === 'all' ? undefined : MOBILE_TO_BACKEND_TYPE[filter]);
      setReadings(response.items.map(mapVitalToListItem));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load readings history.');
    } finally {
      setLoading(false);
    }
  }, [filter, status]);

  useFocusEffect(
    React.useCallback(() => {
      void loadHistory();
    }, [loadHistory])
  );

  const filtered = readings;

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r);
    return acc;
  }, {});

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceBackground }]}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: topPad, backgroundColor: colors.surfaceBackground }]}>
        <AppText variant="headlineLg" color={colors.onSurface}>
          Health History
        </AppText>
        <TouchableOpacity
          onPress={() => router.push('/manual-reading')}
          activeOpacity={0.8}
          style={[styles.addBtn, { backgroundColor: colors.actionBlue }]}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterRail}
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.actionBlue : colors.surfaceCard,
                  borderColor: active ? colors.actionBlue : colors.outlineVariant + '40',
                },
              ]}
            >
              <AppText
                variant="labelMd"
                color={active ? '#ffffff' : colors.onSurfaceVariant}
                style={styles.chipLabel}
              >
                {f.label}
              </AppText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Readings list */}
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {(loading || error || filtered.length === 0) && (
          <View style={[styles.stateCard, { backgroundColor: colors.surfaceCard, borderColor: error ? colors.errorColor + '35' : colors.outlineVariant + '22' }]}>
            <AppText variant="bodySm" color={error ? colors.errorColor : colors.onSurfaceVariant}>
              {error || (loading ? 'Loading backend readings...' : 'No backend readings yet. Add a manual reading to start history.')}
            </AppText>
          </View>
        )}

        {Object.entries(grouped).map(([date, items]) => (
          <View key={date} style={styles.dateGroup}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.dateLabel}>
              {date}
            </AppText>
            <View style={[styles.groupCard, { backgroundColor: colors.surfaceCard }]}>
              {items.map((r, i) => (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => router.push(r.route)}
                  activeOpacity={0.8}
                  style={[
                    styles.readingRow,
                    i < items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.outlineVariant + '22',
                    },
                  ]}
                >
                  <View style={[styles.iconCircle, { backgroundColor: colors.actionBlueSoft }]}>
                    <Ionicons name={r.icon} size={17} color={colors.actionBlue} />
                  </View>
                  <View style={styles.readingMeta}>
                    <AppText variant="bodyMd" color={colors.onSurface}>{r.label}</AppText>
                    <AppText variant="bodySm" color={colors.onSurfaceVariant}>{r.time}</AppText>
                  </View>
                  <View style={styles.readingRight}>
                    <AppText variant="headlineMd" color={colors.onSurface} style={styles.readingValue}>
                      {r.value}
                    </AppText>
                    <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.readingUnit}>
                      {r.unit}
                    </AppText>
                  </View>
                  <StatusBadge status={r.status} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.safeMargin,
    paddingBottom: spacing.stackMd,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    paddingHorizontal: spacing.safeMargin,
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center',
  },
  filterRail: {
    flexGrow: 0,
    minHeight: 52,
    maxHeight: 52,
  },
  chip: {
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { textTransform: 'none', letterSpacing: 0, fontSize: 13, lineHeight: 16 },
  list: { paddingHorizontal: spacing.safeMargin, paddingTop: spacing.stackMd },
  stateCard: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: spacing.stackMd },
  dateGroup: { marginBottom: spacing.stackMd },
  dateLabel: { textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8, paddingLeft: 2 },
  groupCard: { borderRadius: 16, overflow: 'hidden' },
  readingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 },
  iconCircle: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  readingMeta: { flex: 1 },
  readingRight: { alignItems: 'flex-end', marginRight: 8 },
  readingValue: { fontSize: 16 },
  readingUnit: { textTransform: 'none', letterSpacing: 0, fontSize: 10 },
});
