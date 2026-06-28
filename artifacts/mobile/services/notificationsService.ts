import { apiRequest } from '@/lib/apiClient';
import type { MarkNotificationReadResponse, NotificationsResponse } from '@/types/notifications';

export function fetchNotifications() {
  return apiRequest<NotificationsResponse>('/notifications');
}

export function markNotificationRead(id: number) {
  return apiRequest<MarkNotificationReadResponse>(`/notifications/${id}/read`, {
    method: 'POST',
  });
}
