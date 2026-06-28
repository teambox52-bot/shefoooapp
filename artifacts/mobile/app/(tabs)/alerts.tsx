import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';
import { useAuth } from '@/auth/AuthProvider';
import { fetchNotifications, markNotificationRead } from '@/services/notificationsService';
import type { BackendNotification } from '@/types/notifications';

type AlertLevel = 'critical' | 'warning' | 'info';

interface AlertItem {
  id: string;
  backendId: number;
  level: AlertLevel;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const LEVEL_CONFIG: Record<AlertLevel, { icon: keyof typeof Ionicons.glyphMap; iconFilled: keyof typeof Ionicons.glyphMap; bgColor: string }> = {
  critical: { icon: 'alert-circle-outline', iconFilled: 'alert-circle', bgColor: '#EF444415' },
  warning: { icon: 'warning-outline', iconFilled: 'warning', bgColor: '#F59E0B15' },
  info: { icon: 'information-circle-outline', iconFilled: 'information-circle', bgColor: '#3B82F615' },
};

function levelColor(level: AlertLevel, colors: ReturnType<typeof useColors>) {
  return { critical: colors.vitalsCritical, warning: colors.vitalsElevated, info: colors.vitalsInfo }[level];
}

function mapNotificationLevel(notification: BackendNotification): AlertLevel {
  if (notification.type === 'critical' || notification.action_required) return 'critical';
  if (notification.type === 'reminder') return 'warning';
  return 'info';
}

function formatNotificationTime(value?: string | null) {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const itemDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((today - itemDay) / 86400000);
  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (dayDiff === 0) return `Today, ${time}`;
  if (dayDiff === 1) return `Yesterday, ${time}`;
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff} days ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function mapNotification(notification: BackendNotification): AlertItem {
  return {
    id: String(notification.id),
    backendId: notification.id,
    level: mapNotificationLevel(notification),
    title: notification.title,
    message: notification.message,
    time: formatNotificationTime(notification.created_at),
    read: Boolean(notification.read),
  };
}

export default function AlertsScreen() {
  const colors = useColors();
  const { status } = useAuth();
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = React.useState<AlertItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = React.useState<Set<string>>(() => new Set());

  const topPad = Platform.OS === 'web' ? 67 : insets.top + 16;
  const botPad = Platform.OS === 'web' ? 100 : insets.bottom + 88;

  const unread = alerts.filter((a) => !a.read).length;

  const loadAlerts = React.useCallback(async () => {
    if (status !== 'authenticated') return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchNotifications();
      setAlerts((response.items ?? []).map(mapNotification));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load notifications.');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useFocusEffect(
    React.useCallback(() => {
      void loadAlerts();
    }, [loadAlerts])
  );

  const markRead = React.useCallback(async (id: string) => {
    const target = alerts.find((alert) => alert.id === id);
    if (!target || target.read || updatingIds.has(id)) return;

    setUpdatingIds((prev) => new Set(prev).add(id));
    setError(null);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));

    try {
      await markNotificationRead(target.backendId);
    } catch (err) {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: false } : a)));
      setError(err instanceof Error ? err.message : 'Unable to mark notification as read.');
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [alerts, updatingIds]);

  const markAllRead = React.useCallback(async () => {
    const unreadAlerts = alerts.filter((alert) => !alert.read);
    if (unreadAlerts.length === 0) return;

    setError(null);
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));

    try {
      await Promise.all(unreadAlerts.map((alert) => markNotificationRead(alert.backendId)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to mark all notifications as read.');
      await loadAlerts();
    }
  }, [alerts, loadAlerts]);

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceBackground }]}>
      {/* Header */}
      <View style={[styles.topBar, { paddingTop: topPad, backgroundColor: colors.surfaceBackground }]}>
        <View style={styles.titleRow}>
          <AppText variant="headlineLg" color={colors.onSurface}>Alerts</AppText>
          {unread > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.vitalsCritical }]}>
              <AppText variant="labelMd" style={styles.badgeText}>{unread}</AppText>
            </View>
          )}
        </View>
        {unread > 0 && (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
            <AppText variant="labelMd" color={colors.actionBlue} style={styles.markAllText}>
              Mark all read
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={[styles.stateCard, { backgroundColor: colors.surfaceCard }]}>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant}>
              Loading notifications...
            </AppText>
          </View>
        )}

        {error && (
          <View style={[styles.stateCard, { backgroundColor: colors.surfaceCard }]}>
            <AppText variant="bodyMd" color={colors.vitalsCritical}>
              {error}
            </AppText>
            <TouchableOpacity onPress={() => void loadAlerts()} activeOpacity={0.75}>
              <AppText variant="labelMd" color={colors.actionBlue} style={styles.retryText}>
                Try again
              </AppText>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceContainer }]}>
              <Ionicons name="checkmark-circle-outline" size={36} color={colors.vitalsNormal} />
            </View>
            <AppText variant="headlineMd" color={colors.onSurface} style={styles.emptyTitle}>
              All caught up!
            </AppText>
            <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.emptyMsg}>
              No alerts at the moment. Keep monitoring your vitals regularly.
            </AppText>
          </View>
        ) : !loading && !error ? (
          alerts.map((alert) => {
            const cfg = LEVEL_CONFIG[alert.level];
            const color = levelColor(alert.level, colors);
            const updating = updatingIds.has(alert.id);
            return (
              <TouchableOpacity
                key={alert.id}
                onPress={() => void markRead(alert.id)}
                activeOpacity={0.85}
                style={[
                  styles.alertCard,
                  {
                    backgroundColor: alert.read ? colors.surfaceCard : cfg.bgColor,
                    borderLeftColor: color,
                  },
                ]}
              >
                <View style={styles.alertTop}>
                  <View style={[styles.alertIconBg, { backgroundColor: color + '20' }]}>
                    <Ionicons name={alert.read ? cfg.icon : cfg.iconFilled} size={20} color={color} />
                  </View>
                  <View style={styles.alertTitleRow}>
                    <AppText variant="bodyMd" color={colors.onSurface} style={styles.alertTitle}>
                      {alert.title}
                    </AppText>
                    {!alert.read && (
                      <View style={[styles.unreadDot, { backgroundColor: color }]} />
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => void markRead(alert.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    activeOpacity={0.7}
                    disabled={alert.read || updating}
                  >
                    <Ionicons
                      name={alert.read ? 'checkmark-circle-outline' : 'checkmark-done-outline'}
                      size={18}
                      color={alert.read ? colors.outlineVariant : color}
                    />
                  </TouchableOpacity>
                </View>
                <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.alertMsg}>
                  {alert.message}
                </AppText>
                <AppText variant="labelMd" color={colors.outlineVariant} style={styles.alertTime}>
                  {updating ? 'Updating...' : alert.time}
                </AppText>
              </TouchableOpacity>
            );
          })
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.safeMargin,
    paddingBottom: spacing.stackMd,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontSize: 11, textTransform: 'none', letterSpacing: 0 },
  markAllText: { textTransform: 'none', letterSpacing: 0 },
  list: { paddingHorizontal: spacing.safeMargin, paddingTop: spacing.stackSm, gap: spacing.stackMd },
  alertCard: {
    borderRadius: 16,
    borderLeftWidth: 3,
    padding: 16,
    gap: 8,
  },
  alertTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  alertTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { flex: 1, fontFamily: 'Inter_600SemiBold' },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  alertMsg: { lineHeight: 22, paddingLeft: 46 },
  alertTime: { paddingLeft: 46, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.4 },
  stateCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  retryText: { textTransform: 'none', letterSpacing: 0 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { textAlign: 'center' },
  emptyMsg: { textAlign: 'center', paddingHorizontal: 32, lineHeight: 22 },
});
