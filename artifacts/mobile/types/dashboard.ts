import type { BackendUser } from '@/types/auth';
import type { BackendVital } from '@/types/vitals';

export type LocalizedText = string | { en?: string; ar?: string } | null;
export type LocalizedList = string[] | { en?: string[]; ar?: string[] } | null;

export type DashboardAnalysisPreview = {
  health_score?: number | null;
  health_message?: LocalizedText;
  summary?: LocalizedText;
  risk_level?: LocalizedText;
  recommendations?: LocalizedList;
};

export type DashboardResponse = {
  user: BackendUser;
  current_vitals: BackendVital[];
  recent_vitals: BackendVital[];
  latest_analysis: unknown;
  analysis_preview: DashboardAnalysisPreview | null;
  notifications_count: number;
  recent_notifications: unknown[];
};
