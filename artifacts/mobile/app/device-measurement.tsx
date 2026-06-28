import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/spacing';
import { useColors } from '@/hooks/useColors';
import {
  ESP32_LOCAL_BASE_URL,
  extractEsp32Readings,
  fetchEsp32Status,
  startEsp32Measurement,
  startNewEsp32Operation,
} from '@/services/esp32LocalService';
import {
  createMeasurementSession,
  submitLocalMeasurementResult,
} from '@/services/measurementSessionService';
import type { Esp32ExtractedResult, Esp32LocalStatus } from '@/types/esp32Local';
import type { MeasurementResultResponse, MeasurementSession } from '@/types/measurementSession';

type FlowStatus =
  | 'idle'
  | 'detecting'
  | 'detected'
  | 'creating_session'
  | 'starting'
  | 'running'
  | 'submitting'
  | 'success'
  | 'error';

const POLL_INTERVAL_MS = 1000;
const FULL_MEASUREMENT_TIMEOUT_MS = 15 * 60 * 1000;

export default function DeviceMeasurementScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [flowStatus, setFlowStatus] = React.useState<FlowStatus>('idle');
  const [espStatus, setEspStatus] = React.useState<Esp32LocalStatus | null>(null);
  const [extracted, setExtracted] = React.useState<Esp32ExtractedResult | null>(null);
  const [session, setSession] = React.useState<MeasurementSession | null>(null);
  const [result, setResult] = React.useState<MeasurementResultResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const pollRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = React.useRef<number | null>(null);
  const submittingRef = React.useRef(false);

  const stopPolling = React.useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  React.useEffect(() => stopPolling, [stopPolling]);

  const detectDevice = React.useCallback(async () => {
    stopPolling();
    setFlowStatus('detecting');
    setError(null);
    setResult(null);

    try {
      const status = await fetchEsp32Status();
      const readingState = extractEsp32Readings(status);
      setEspStatus(status);
      setExtracted(readingState);
      setFlowStatus('detected');
    } catch (requestError) {
      setFlowStatus('error');
      setError(requestError instanceof Error ? requestError.message : 'Unable to detect ESP32.');
    }
  }, [stopPolling]);

  const submitResult = React.useCallback(
    async (readingState: Esp32ExtractedResult) => {
      if (!session || submittingRef.current) return;
      submittingRef.current = true;
      stopPolling();
      setFlowStatus('submitting');
      setError(null);

      if (!readingState.isComplete) {
        setFlowStatus('error');
        setError(`Measurement is incomplete. Missing: ${readingState.missing.join(', ')}`);
        submittingRef.current = false;
        return;
      }

      try {
        const response = await submitLocalMeasurementResult(session.id, {
          device_id: readingState.device_id,
          source: 'mobile_local_ap_relay',
          readings: readingState.readings,
          quality: readingState.quality,
        });
        setResult(response);
        setSession(response.session);
        setFlowStatus('success');
      } catch (requestError) {
        setFlowStatus('error');
        setError(requestError instanceof Error ? requestError.message : 'Unable to submit measurement.');
      } finally {
        submittingRef.current = false;
      }
    },
    [session, stopPolling]
  );

  const pollStatus = React.useCallback(async () => {
    try {
      if (startedAtRef.current && Date.now() - startedAtRef.current > FULL_MEASUREMENT_TIMEOUT_MS) {
        stopPolling();
        setFlowStatus('error');
        setError('Measurement timed out. Start a new operation and try again.');
        return;
      }

      const status = await fetchEsp32Status();
      const readingState = extractEsp32Readings(status);
      setEspStatus(status);
      setExtracted(readingState);

      if (readingState.isComplete) {
        await submitResult(readingState);
      }
    } catch (requestError) {
      stopPolling();
      setFlowStatus('error');
      setError(requestError instanceof Error ? requestError.message : 'Lost connection to ESP32.');
    }
  }, [stopPolling, submitResult]);

  const startFullMeasurement = React.useCallback(async () => {
    stopPolling();
    submittingRef.current = false;
    setResult(null);
    setError(null);

    try {
      setFlowStatus('detecting');
      const status = await fetchEsp32Status();
      const readingState = extractEsp32Readings(status);
      setEspStatus(status);
      setExtracted(readingState);

      setFlowStatus('creating_session');
      const created = await createMeasurementSession({
        device_id: readingState.device_id,
        mode: 'full',
        source: 'local_ap',
      });
      setSession(created.session);

      setFlowStatus('starting');
      await startNewEsp32Operation();
      await startEsp32Measurement('full');

      startedAtRef.current = Date.now();
      setFlowStatus('running');
      pollRef.current = setInterval(() => {
        void pollStatus();
      }, POLL_INTERVAL_MS);
      void pollStatus();
    } catch (requestError) {
      stopPolling();
      setFlowStatus('error');
      setError(requestError instanceof Error ? requestError.message : 'Unable to start measurement.');
    }
  }, [pollStatus, stopPolling]);

  const statusText = {
    idle: 'Connect your phone to the SHIFO device WiFi, then detect the device.',
    detecting: 'Detecting ESP32 local status...',
    detected: 'Device detected. Ready to create a backend session.',
    creating_session: 'Creating backend measurement session...',
    starting: 'Starting ESP32 full measurement...',
    running: 'Measurement running. Keep the phone connected to the ESP32 AP.',
    submitting: 'Submitting completed readings to backend...',
    success: 'Measurement stored and AI analysis generated.',
    error: 'Action needed before continuing.',
  }[flowStatus];

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceBackground }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.surfaceCard }]}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="chevron-back" size={22} color={colors.onSurface} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <AppText variant="headlineMd" color={colors.onSurface}>
              Device Measurement
            </AppText>
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              Local AP relay · {ESP32_LOCAL_BASE_URL}
            </AppText>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.outlineVariant + '30' }]}>
          <View style={styles.cardTop}>
            <View style={[styles.iconWrap, { backgroundColor: colors.actionBlueSoft }]}>
              <Ionicons name="hardware-chip-outline" size={22} color={colors.actionBlue} />
            </View>
            <StatusBadge
              status={flowStatus === 'success' ? 'normal' : flowStatus === 'error' ? 'error' : 'info'}
              label={flowStatus.replace('_', ' ')}
            />
          </View>
          <AppText variant="bodyMd" color={colors.onSurface}>
            {statusText}
          </AppText>
          <AppText variant="bodySm" color={colors.onSurfaceVariant}>
            This flow uses the existing ESP32 local APIs only. The phone must stay connected to the ESP32 WiFi AP during measurement.
          </AppText>
          <View style={styles.actions}>
            <AppButton
              title="Detect Device"
              onPress={detectDevice}
              loading={flowStatus === 'detecting'}
              disabled={flowStatus === 'running' || flowStatus === 'submitting'}
              icon="search-outline"
              iconPosition="left"
              style={styles.actionButton}
            />
            <AppButton
              title="Start Full Measurement"
              onPress={startFullMeasurement}
              loading={flowStatus === 'creating_session' || flowStatus === 'starting'}
              disabled={flowStatus === 'running' || flowStatus === 'submitting'}
              icon="play-circle-outline"
              iconPosition="left"
              variant="brand"
              style={styles.actionButton}
            />
          </View>
        </View>

        {error && (
          <View style={[styles.card, { backgroundColor: colors.errorContainer, borderColor: colors.errorColor + '30' }]}>
            <AppText variant="headlineMd" color={colors.errorColor}>
              Measurement issue
            </AppText>
            <AppText variant="bodySm" color={colors.errorColor}>
              {error}
            </AppText>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.outlineVariant + '30' }]}>
          <AppText variant="headlineMd" color={colors.onSurface}>
            Session Status
          </AppText>
          <InfoRow label="Device ID" value={extracted?.device_id ?? 'Not detected'} />
          <InfoRow label="ESP32 State" value={String(espStatus?.run_state ?? espStatus?.state ?? espStatus?.status ?? '--')} />
          <InfoRow label="Backend Session" value={session ? `#${session.id} · ${session.status}` : 'Not created'} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surfaceCard, borderColor: colors.outlineVariant + '30' }]}>
          <AppText variant="headlineMd" color={colors.onSurface}>
            Stage Readings
          </AppText>
          <StageRow
            title="Pulse"
            value={`${formatValue(extracted?.readings.hr)} bpm · ${formatValue(extracted?.readings.spo2)}% SpO2`}
            ok={extracted?.quality.pulse_ok}
          />
          <StageRow
            title="Blood Pressure"
            value={`${formatValue(extracted?.readings.sys)}/${formatValue(extracted?.readings.dia)} mmHg · PLU ${formatValue(extracted?.readings.bp_plu)}`}
            ok={extracted?.quality.bp_ok}
          />
          <StageRow
            title="Glucose"
            value={`${formatValue(extracted?.readings.glucose_mg_dl)} mg/dL`}
            ok={extracted?.quality.glucose_ok}
          />
          {extracted && !extracted.isComplete && extracted.missing.length > 0 && (
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              Waiting for: {extracted.missing.join(', ')}
            </AppText>
          )}
        </View>

        {result && (
          <View style={[styles.card, { backgroundColor: colors.actionBlueSoft, borderColor: colors.actionBlue + '25' }]}>
            <AppText variant="headlineMd" color={colors.onSurface}>
              Backend AI Result
            </AppText>
            <InfoRow label="Session" value={`#${result.session.id} · ${result.session.status}`} />
            <InfoRow label="Health Score" value={String(result.analysis.health_score ?? '--')} />
            <InfoRow label="Risk Level" value={String(result.analysis.risk_level ?? '--')} />
            {result.stored_vitals && result.stored_vitals.length > 0 && (
              <View style={styles.storedReadings}>
                <AppText variant="headlineMd" color={colors.onSurface}>
                  Stored Readings
                </AppText>
                {result.stored_vitals.map((vital) => (
                  <InfoRow
                    key={vital.id}
                    label={vital.type.replace(/_/g, ' ')}
                    value={vital.type === 'blood_pressure'
                      ? `${vital.systolic ?? '--'}/${vital.diastolic ?? '--'} mmHg`
                      : String(vital.value ?? '--')}
                  />
                ))}
              </View>
            )}
            {result.recommendations && result.recommendations.length > 0 && (
              <AppText variant="bodySm" color={colors.onSurfaceVariant}>
                Latest recommendation: {result.latest_recommendation ?? result.recommendations[result.recommendations.length - 1]}
              </AppText>
            )}
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              Vitals were submitted to the backend under the logged-in user. The backend runs the real AI model and returns the stored analysis response.
            </AppText>
            <View style={styles.actions}>
              <AppButton
                title="Go to Dashboard"
                onPress={() => router.push('/(tabs)')}
                icon="home-outline"
                iconPosition="left"
                style={styles.actionButton}
              />
              <AppButton
                title="View History"
                onPress={() => router.push('/(tabs)/history')}
                icon="time-outline"
                iconPosition="left"
                variant="brand"
                style={styles.actionButton}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function formatValue(value?: number) {
  return value === undefined ? '--' : String(value);
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();

  return (
    <View style={styles.infoRow}>
      <AppText variant="bodySm" color={colors.onSurfaceVariant}>
        {label}
      </AppText>
      <AppText variant="bodyMd" color={colors.onSurface} style={styles.infoValue}>
        {value}
      </AppText>
    </View>
  );
}

function StageRow({ title, value, ok }: { title: string; value: string; ok?: boolean }) {
  const colors = useColors();

  return (
    <View style={[styles.stageRow, { borderBottomColor: colors.outlineVariant + '25' }]}>
      <View style={styles.stageText}>
        <AppText variant="bodyMd" color={colors.onSurface}>
          {title}
        </AppText>
        <AppText variant="bodySm" color={colors.onSurfaceVariant}>
          {value}
        </AppText>
      </View>
      <StatusBadge status={ok ? 'normal' : 'info'} label={ok ? 'Done' : 'Waiting'} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingHorizontal: spacing.safeMargin, gap: spacing.stackMd },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconWrap: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  actions: { gap: spacing.stackSm },
  actionButton: { width: '100%' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  infoValue: { flex: 1, textAlign: 'right' },
  stageRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  stageText: { flex: 1 },
  storedReadings: { gap: 8 },
});
