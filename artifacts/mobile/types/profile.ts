import type { BackendUser } from '@/types/auth';

export type ProfileUpdatePayload = {
  name?: string;
  phone_country_code?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  chronic_conditions?: string[];
  height_cm?: number | null;
  weight_kg?: number | null;
  blood_type?: string | null;
  hospital_name?: string | null;
  avatar?: string | null;
};

export type ProfileResponse = {
  user: BackendUser;
};

export type ProfileUpdateResponse = {
  message: string;
  user: BackendUser;
};
