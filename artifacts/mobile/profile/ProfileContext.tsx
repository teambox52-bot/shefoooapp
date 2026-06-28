import React from 'react';
import { useAuth } from '@/auth/AuthProvider';
import { getApiErrorMessage } from '@/lib/apiClient';
import { fetchProfile, updateProfile as updateProfileRequest } from '@/services/profileService';
import type { BackendUser } from '@/types/auth';

export type GenderValue = 'male' | 'female' | 'other';

export type ProfileData = {
  first_name: string;
  last_name: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  gender: GenderValue;
  date_of_birth: string;
  height_cm: number | null;
  weight_kg: number | null;
  blood_type: string;
  hospital_name: string;
  chronic_conditions: string[];
};

const DEFAULT_PROFILE: ProfileData = {
  first_name: 'Johnathan',
  last_name: 'Doe',
  email: 'john.doe@example.com',
  phone_country_code: '+971',
  phone_number: '50 123 4567',
  gender: 'male',
  date_of_birth: '1990-05-12',
  height_cm: 182,
  weight_kg: 78,
  blood_type: 'A+',
  hospital_name: 'City Central Medical',
  chronic_conditions: ['Type 2 Diabetes', 'Hypertension'],
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type ProfileContextValue = {
  profile: ProfileData;
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  successMessage: string | null;
  updateProfile: (next: ProfileData) => void;
  refreshProfile: () => Promise<void>;
  saveProfile: (next: ProfileData) => Promise<void>;
  clearProfileStatus: () => void;
};

const ProfileContext = React.createContext<ProfileContextValue | undefined>(undefined);

const CONDITION_TO_LABEL: Record<string, string> = {
  none: 'No Known Condition',
  hypertension: 'Hypertension',
  hypotension: 'Hypotension',
  diabetes_type_1: 'Type 1 Diabetes',
  diabetes_type_2: 'Type 2 Diabetes',
  coronary_artery_disease: 'Coronary Artery Disease',
  heart_failure: 'Heart Failure',
  arrhythmia: 'Arrhythmia',
  asthma: 'Asthma',
  copd: 'COPD',
  sleep_apnea: 'Sleep Apnea',
  chronic_hypoxemia: 'Chronic Hypoxemia',
};

const LABEL_TO_CONDITION = Object.entries(CONDITION_TO_LABEL).reduce<Record<string, string>>(
  (carry, [code, label]) => {
    carry[label.toLowerCase()] = code;
    return carry;
  },
  {}
);

function splitName(name: string | null | undefined) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  return {
    first_name: parts[0] || '',
    last_name: parts.slice(1).join(' '),
  };
}

function normalizeDate(value: string | null | undefined) {
  if (!value) return '';
  return value.slice(0, 10);
}

function normalizeGender(value: BackendUser['gender']): GenderValue {
  if (value === 'female' || value === 'other') return value;
  return 'male';
}

function backendConditionsToDisplay(conditions: string[] | null | undefined) {
  return (conditions ?? [])
    .map((condition) => CONDITION_TO_LABEL[condition] ?? condition)
    .filter((condition) => condition && condition !== 'No Known Condition');
}

function displayConditionsToBackend(conditions: string[]) {
  const mapped = conditions
    .map((condition) => LABEL_TO_CONDITION[condition.toLowerCase()] ?? condition)
    .filter(Boolean);

  return Array.from(new Set(mapped));
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, '');
}

function profileFromBackendUser(user: BackendUser): ProfileData {
  const names = splitName(user.name);

  return {
    first_name: names.first_name,
    last_name: names.last_name,
    email: user.email,
    phone_country_code: user.phone_country_code || DEFAULT_PROFILE.phone_country_code,
    phone_number: user.phone_number || '',
    gender: normalizeGender(user.gender),
    date_of_birth: normalizeDate(user.date_of_birth),
    height_cm: user.height_cm ?? null,
    weight_kg: user.weight_kg ?? null,
    blood_type: user.blood_type || '',
    hospital_name: user.hospital_name || '',
    chronic_conditions: backendConditionsToDisplay(user.chronic_conditions),
  };
}

function buildBackendPayload(profile: ProfileData) {
  const phoneNumber = digitsOnly(profile.phone_number);

  return {
    name: getFullName(profile),
    phone_country_code: profile.phone_country_code || null,
    phone_number: phoneNumber || null,
    date_of_birth: profile.date_of_birth || null,
    gender: profile.gender,
    chronic_conditions: displayConditionsToBackend(profile.chronic_conditions),
    height_cm: profile.height_cm,
    weight_kg: profile.weight_kg,
    blood_type: profile.blood_type || null,
    hospital_name: profile.hospital_name.trim() || null,
  };
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const [profile, setProfile] = React.useState(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const clearProfileStatus = React.useCallback(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (status !== 'authenticated') return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetchProfile();
      setProfile(profileFromBackendUser(response.user));
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to load profile from the backend.'));
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  const saveProfile = React.useCallback(async (next: ProfileData) => {
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const response = await updateProfileRequest(buildBackendPayload(next));
      setProfile(profileFromBackendUser(response.user));
      setSuccessMessage(response.message || 'Profile updated successfully.');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to save profile changes.'));
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, []);

  React.useEffect(() => {
    if (status === 'authenticated') {
      void refreshProfile();
      return;
    }

    if (status === 'unauthenticated') {
      setProfile(DEFAULT_PROFILE);
      clearProfileStatus();
    }
  }, [clearProfileStatus, refreshProfile, status]);

  const value = React.useMemo(
    () => ({
      profile,
      isLoading,
      isSaving,
      errorMessage,
      successMessage,
      updateProfile: setProfile,
      refreshProfile,
      saveProfile,
      clearProfileStatus,
    }),
    [clearProfileStatus, errorMessage, isLoading, isSaving, profile, refreshProfile, saveProfile, successMessage]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = React.useContext(ProfileContext);

  if (!value) {
    return {
      profile: DEFAULT_PROFILE,
      isLoading: false,
      isSaving: false,
      errorMessage: null,
      successMessage: null,
      updateProfile: () => undefined,
      refreshProfile: async () => undefined,
      saveProfile: async () => undefined,
      clearProfileStatus: () => undefined,
    };
  }

  return value;
}

export function getFullName(profile: ProfileData) {
  return `${profile.first_name} ${profile.last_name}`.trim();
}

export function getInitials(profile: ProfileData) {
  const first = profile.first_name.trim().charAt(0);
  const last = profile.last_name.trim().charAt(0);
  return `${first}${last}`.toUpperCase() || 'HS';
}

export function getAge(profile: ProfileData) {
  if (!profile.date_of_birth) return '--';
  const birthDate = new Date(`${profile.date_of_birth}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return '--';

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return String(age);
}

export function formatDisplayDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value || '--';

  return `${day} ${MONTHS[month - 1]} ${year}`;
}
