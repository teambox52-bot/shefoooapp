import type { BackendUser } from '@/types/auth';
import type { BackendVital } from '@/types/vitals';

export type DashboardAnalysisPreview = {
  health_score?: number | null;
  health_message?: string | null;
  summary?: string | null;
  risk_level?: string | null;
  recommendations?: string[] | null;
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
