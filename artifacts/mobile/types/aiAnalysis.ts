export interface AIAnalysisCard {
  key: string;
  title: string | { en?: string; ar?: string };
  level: string;
  pct: number;
  insights: string[] | { en?: string[]; ar?: string[] };
}

export interface AIAnalysisResponse {
  health_score?: number;
  healthScore?: number;
  risk_level?: string | { en?: string; ar?: string } | null;
  model_prediction?: string | null;
  confidence?: number | null;
  probabilities?: Record<string, number>;
  summary?: string | { en?: string; ar?: string };
  localized_summary?: { en?: string; ar?: string };
  recommendations?: string[] | { en?: string[]; ar?: string[] };
  localized_recommendations?: { en?: string[]; ar?: string[] };
  explanation?: string | { en?: string; ar?: string };
  localized_explanation?: { en?: string; ar?: string };
  cards?: AIAnalysisCard[];
  has_real_analysis?: boolean;
  is_real_analysis?: boolean;
  is_stale?: boolean;
}
