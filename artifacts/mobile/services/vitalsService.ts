import { apiRequest } from '@/lib/apiClient';
import type { BackendVitalType, CreateVitalPayload, CreateVitalResponse, VitalsResponse } from '@/types/vitals';

export function fetchVitals(type?: BackendVitalType) {
  const query = type ? `?type=${encodeURIComponent(type)}` : '';
  return apiRequest<VitalsResponse>(`/vitals${query}`);
}

export function createVital(payload: CreateVitalPayload) {
  return apiRequest<CreateVitalResponse>('/vitals', {
    method: 'POST',
    body: payload,
  });
}

export function fetchLatestRecommendation() {
  return apiRequest<{ data: { recommendation: string | null; connected_to_telegram: boolean } }>('/recommendations/latest');
}
