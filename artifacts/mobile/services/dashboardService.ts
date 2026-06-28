import { apiRequest } from '@/lib/apiClient';
import type { DashboardResponse } from '@/types/dashboard';

export function fetchDashboard() {
  return apiRequest<DashboardResponse>('/dashboard');
}
