import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AppText } from '@/components/ui/AppText';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { spacing } from '@/constants/spacing';
import { getApiErrorMessage } from '@/lib/apiClient';
import { fetchAIAnalysis, runAIAnalysis } from '@/services/aiAnalysisService';
import type { AIAnalysisCard, AIAnalysisResponse } from '@/types/aiAnalysis';

function localizedText(value: string | { en?: string; ar?: string } | undefined, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.en || value.ar || fallback;
}

function localizedList(value: string[] | { en?: string[]; ar?: string[] } | undefined) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.en || value.ar || [];
}

function riskToBadgeStatus(risk?: string | { en?: string; ar?: string } | null): 'normal' | 'elevated' | 'critical' | 'info' {
  const normalized = localizedText(risk ?? undefined).toLowerCase();
  if (normalized === 'high' || normalized === 'danger' || normalized === 'critical') return 'critical';
  if (normalized === 'medium' || normalized === 'warning' || normalized === 'elevated') return 'elevated';
  if (normalized === 'low' || normalized === 'normal') return 'normal';
  return 'info';
}

function cardTitle(card: AIAnalysisCard) {
  return localizedText(card.title, card.key);
}

function cardInsights(card: AIAnalysisCard) {
  return localizedList(card.insights);
}

export default function AIAnalysisScreen() {
  const colors = useColors();
  const { themeMode } = useAppTheme();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top + 16;
  const botPad = Platform.OS === 'web' ? 100 : insets.bottom + 88;
  const isDark = themeMode === 'dark';
  const [analysis, setAnalysis] = useState<AIAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setAnalysis(await fetchAIAnalysis());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load AI analysis.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLatest();
    }, [loadLatest])
  );

  async function handleRunAnalysis() {
    try {
      setRunning(true);
      setError(null);
      setAnalysis(await runAIAnalysis());
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to run AI analysis.'));
    } finally {
      setRunning(false);
    }
  }

  const score = analysis?.healthScore ?? analysis?.health_score ?? 0;
  const hasRealAnalysis = Boolean(analysis?.has_real_analysis ?? analysis?.is_real_analysis ?? analysis?.model_prediction);
  const recommendations = localizedList(analysis?.localized_recommendations ?? analysis?.recommendations);
  const summary = localizedText(analysis?.localized_summary ?? analysis?.summary);
  const explanation = localizedText(analysis?.localized_explanation ?? analysis?.explanation);
  const cards = analysis?.cards ?? [];
  const probabilities = analysis?.probabilities ?? {};
  const riskLabel = localizedText(analysis?.risk_level ?? undefined, analysis?.model_prediction ?? 'No Data');
  const badgeStatus = riskToBadgeStatus(analysis?.risk_level ?? analysis?.model_prediction);

  const scoreCardColors = {
    background: isDark ? '#02070A' : colors.brand,
    border: isDark ? 'rgba(24,224,194,0.18)' : 'transparent',
    label: isDark ? 'rgba(244,250,250,0.66)' : 'rgba(255,255,255,0.55)',
    score: '#ffffff',
    total: isDark ? 'rgba(168,183,194,0.72)' : 'rgba(255,255,255,0.45)',
    track: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.15)',
    footer: isDark ? 'rgba(168,183,194,0.66)' : 'rgba(255,255,255,0.5)',
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.surfaceBackground }]}>
        <ActivityIndicator color={colors.actionBlue} />
        <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.centerText}>
          Loading latest AI analysis...
        </AppText>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceBackground }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad, paddingBottom: botPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={[styles.aiIconBg, { backgroundColor: colors.actionBlue }]}>
            <Ionicons name="sparkles" size={20} color="#fff" />
          </View>
          <View style={styles.headerCopy}>
            <AppText variant="headlineLg" color={colors.onSurface}>AI Analysis</AppText>
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              {hasRealAnalysis ? 'Latest real backend model result' : 'No real analysis yet'}
            </AppText>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleRunAnalysis}
          disabled={running}
          style={[styles.runButton, { backgroundColor: colors.actionBlue, opacity: running ? 0.72 : 1 }]}
        >
          {running ? <ActivityIndicator color="#fff" /> : <Ionicons name="sparkles-outline" size={18} color="#fff" />}
          <AppText variant="bodyMd" style={styles.runButtonText}>
            {running ? 'Running Analysis...' : 'Run New AI Analysis'}
          </AppText>
        </TouchableOpacity>

        {error ? (
          <View style={[styles.messageCard, { backgroundColor: colors.errorColor + '18' }]}>
            <Ionicons name="warning-outline" size={18} color={colors.errorColor} />
            <AppText variant="bodySm" color={colors.errorColor} style={styles.messageText}>{error}</AppText>
          </View>
        ) : null}

        {!hasRealAnalysis ? (
          <View style={[styles.messageCard, { backgroundColor: colors.surfaceCard }]}>
            <Ionicons name="information-circle-outline" size={18} color={colors.actionBlue} />
            <AppText variant="bodySm" color={colors.onSurfaceVariant} style={styles.messageText}>
              {summary || 'Add required vitals, then run a new analysis to display the real model result.'}
            </AppText>
          </View>
        ) : null}

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
            <AppText style={[styles.scoreLabelText, { color: scoreCardColors.label }]}>
              OVERALL HEALTH SCORE
            </AppText>
            <StatusBadge status={badgeStatus} label={riskLabel.replace(/_/g, ' ')} />
          </View>
          <View style={styles.scoreRow}>
            <AppText variant="vitalsDisplay" style={[styles.scoreNum, { color: scoreCardColors.score }]}>{score}</AppText>
            <AppText variant="headlineMd" style={[styles.scoreTotal, { color: scoreCardColors.total }]}>/100</AppText>
          </View>
          <View style={[styles.scoreTrack, { backgroundColor: scoreCardColors.track }]}>
            <View style={[styles.scoreFill, { backgroundColor: colors.vitalsNormal, width: `${score}%` }]} />
          </View>
          <View style={styles.riskRow}>
            <AppText style={[styles.riskLabel, { color: scoreCardColors.footer }]}>MODEL</AppText>
            <View style={[styles.riskBadge, { backgroundColor: colors.vitalsNormal + '30' }]}>
              <AppText style={[styles.riskBadgeText, { color: colors.vitalsNormal }]}>
                {analysis?.model_prediction || 'Not run'}
              </AppText>
            </View>
          </View>
        </View>

        {explanation ? (
          <View style={[styles.explanationCard, { backgroundColor: colors.surfaceCard }]}>
            <AppText variant="headlineMd" color={colors.onSurface}>Model Explanation</AppText>
            <AppText variant="bodySm" color={colors.onSurfaceVariant} style={styles.analysisDetail}>
              {explanation}
            </AppText>
          </View>
        ) : null}

        <AppText variant="headlineMd" color={colors.onSurface} style={styles.sectionTitle}>
          Health Analysis
        </AppText>
        {cards.length > 0 ? cards.map((card) => {
          const status = riskToBadgeStatus(card.level);
          const statusColor = {
            normal: colors.vitalsNormal,
            elevated: colors.vitalsElevated,
            critical: colors.vitalsCritical,
            info: colors.vitalsInfo,
            error: colors.errorColor,
          }[status];
          return (
            <View key={card.key} style={[styles.analysisCard, { backgroundColor: colors.surfaceCard }]}>
              <View style={styles.analysisTop}>
                <View style={[styles.analysisIconBg, { backgroundColor: statusColor + '18' }]}>
                  <Ionicons name="analytics-outline" size={18} color={statusColor} />
                </View>
                <View style={styles.analysisTitleRow}>
                  <AppText variant="bodyMd" color={colors.onSurface}>{cardTitle(card)}</AppText>
                  <StatusBadge status={status} label={card.level} />
                </View>
              </View>
              {cardInsights(card).map((insight, index) => (
                <AppText key={index} variant="bodySm" color={colors.onSurfaceVariant} style={styles.analysisDetail}>
                  {insight}
                </AppText>
              ))}
            </View>
          );
        }) : (
          <View style={[styles.analysisCard, { backgroundColor: colors.surfaceCard }]}>
            <AppText variant="bodySm" color={colors.onSurfaceVariant}>
              Detailed cards will appear after a real AI analysis is available.
            </AppText>
          </View>
        )}

        <AppText variant="headlineMd" color={colors.onSurface} style={styles.sectionTitle}>
          Recommendations
        </AppText>
        <View style={[styles.recoCard, { backgroundColor: colors.surfaceCard }]}>
          {recommendations.length > 0 ? recommendations.map((recommendation, i) => (
            <View
              key={i}
              style={[
                styles.recoRow,
                i < recommendations.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.outlineVariant + '20',
                },
              ]}
            >
              <View style={[styles.recoIconBg, { backgroundColor: colors.actionBlueSoft }]}>
                <Ionicons name="checkmark-circle-outline" size={17} color={colors.actionBlue} />
              </View>
              <AppText variant="bodyMd" color={colors.onSurface} style={styles.recoText}>
                {recommendation}
              </AppText>
            </View>
          )) : (
            <View style={styles.recoRow}>
              <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.recoText}>
                Recommendations will appear after running a real analysis.
              </AppText>
            </View>
          )}
        </View>

        {Object.keys(probabilities).length > 0 ? (
          <View style={[styles.disclaimer, { backgroundColor: colors.surfaceContainer }]}>
            <Ionicons name="stats-chart-outline" size={16} color={colors.onSurfaceVariant} />
            <AppText variant="bodySm" color={colors.onSurfaceVariant} style={styles.disclaimerText}>
              {Object.entries(probabilities).map(([label, value]) => `${label}: ${Math.round(value * 100)}%`).join(' · ')}
            </AppText>
          </View>
        ) : null}

        <View style={[styles.disclaimer, { backgroundColor: colors.surfaceContainer }]}>
          <Ionicons name="information-circle-outline" size={16} color={colors.onSurfaceVariant} />
          <AppText variant="bodySm" color={colors.onSurfaceVariant} style={styles.disclaimerText}>
            AI analysis is for informational purposes only. Always consult a qualified healthcare professional for medical advice.
          </AppText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.safeMargin },
  centerText: { marginTop: 12, textAlign: 'center' },
  content: { paddingHorizontal: spacing.safeMargin },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.stackLg },
  headerCopy: { flex: 1 },
  aiIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  runButton: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginBottom: spacing.stackMd },
  runButtonText: { color: '#fff', fontFamily: 'Inter_700Bold' },
  messageCard: { borderRadius: 14, padding: 14, marginBottom: spacing.stackMd, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  messageText: { flex: 1, lineHeight: 20 },
  scoreCard: { borderRadius: 20, padding: 20, marginBottom: spacing.stackLg, gap: 10, borderWidth: 1, shadowOffset: { width: 0, height: 10 }, shadowRadius: 24, elevation: 2 },
  scoreTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabelText: { fontSize: 10, letterSpacing: 0.8, fontFamily: 'Inter_600SemiBold' },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  scoreNum: { fontSize: 52, lineHeight: 56, letterSpacing: -2 },
  scoreTotal: { marginBottom: 10, fontSize: 22 },
  scoreTrack: { height: 4, borderRadius: 999, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 999 },
  riskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  riskLabel: { fontSize: 10, letterSpacing: 0.8, fontFamily: 'Inter_600SemiBold' },
  riskBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  riskBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  sectionTitle: { fontSize: 18, marginBottom: spacing.stackMd, marginTop: spacing.stackSm },
  explanationCard: { borderRadius: 16, padding: 16, marginBottom: spacing.stackLg, gap: 8 },
  analysisCard: { borderRadius: 16, padding: 16, marginBottom: spacing.stackMd, gap: 10 },
  analysisTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  analysisIconBg: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  analysisTitleRow: { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  analysisDetail: { lineHeight: 20 },
  recoCard: { borderRadius: 16, overflow: 'hidden', marginBottom: spacing.stackLg },
  recoRow: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12 },
  recoIconBg: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  recoText: { flex: 1, lineHeight: 22 },
  disclaimer: { borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start', marginBottom: spacing.stackMd },
  disclaimerText: { flex: 1, lineHeight: 20 },
});
