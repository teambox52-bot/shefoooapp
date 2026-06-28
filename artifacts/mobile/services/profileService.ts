import { apiRequest } from '@/lib/apiClient';
import type { ProfileResponse, ProfileUpdatePayload, ProfileUpdateResponse } from '@/types/profile';

export function fetchProfile() {
  return apiRequest<ProfileResponse>('/profile');
}

export function updateProfile(payload: ProfileUpdatePayload) {
  return apiRequest<ProfileUpdateResponse>('/profile', {
    method: 'PATCH',
    body: payload,
  });
}
