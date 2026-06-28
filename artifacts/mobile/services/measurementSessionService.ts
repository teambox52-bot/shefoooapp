import { apiRequest } from '@/lib/apiClient';
import type {
  CreateMeasurementSessionPayload,
  MeasurementResultResponse,
  MeasurementSessionResponse,
  SubmitLocalMeasurementPayload,
} from '@/types/measurementSession';

export function createMeasurementSession(payload: CreateMeasurementSessionPayload) {
  return apiRequest<MeasurementSessionResponse>('/measurement-sessions', {
    method: 'POST',
    body: payload,
  });
}

export function fetchMeasurementSession(id: number) {
  return apiRequest<MeasurementSessionResponse>(`/measurement-sessions/${id}`);
}

export function cancelMeasurementSession(id: number) {
  return apiRequest<MeasurementSessionResponse>(`/measurement-sessions/${id}/cancel`, {
    method: 'POST',
  });
}

export function submitLocalMeasurementResult(id: number, payload: SubmitLocalMeasurementPayload) {
  return apiRequest<MeasurementResultResponse>(`/measurement-sessions/${id}/submit-local-result`, {
    method: 'POST',
    body: payload,
  });
}
