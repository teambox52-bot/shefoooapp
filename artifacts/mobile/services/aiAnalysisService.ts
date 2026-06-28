import { apiRequest } from '@/lib/apiClient';
import type { AIAnalysisResponse } from '@/types/aiAnalysis';

export function fetchAIAnalysis() {
  return apiRequest<AIAnalysisResponse>('/ai-analysis');
}

export function runAIAnalysis() {
  return apiRequest<AIAnalysisResponse>('/ai/analyze', {
    method: 'POST',
  });
}
