export type BackendUser = {
  id: number;
  name: string;
  email: string;
  phone_country_code?: string | null;
  phone_number?: string | null;
  date_of_birth?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  chronic_conditions?: string[] | null;
  blood_type?: string | null;
  hospital_name?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  avatar?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type AuthPayload = {
  message?: string;
  access_token: string;
  token_type: string;
  user: BackendUser;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone_country_code?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  chronic_conditions?: string[];
};

export type MePayload = {
  user: BackendUser;
};
