export type BackendVitalType = 'blood_pressure' | 'heart_rate' | 'oxygen' | 'blood_sugar';
export type MobileVitalType = 'blood-pressure' | 'heart-rate' | 'blood-oxygen' | 'blood-glucose';
export type VitalStatus = 'normal' | 'elevated' | 'critical';

export type BackendVital = {
  id: number;
  type: BackendVitalType;
  display_type?: string;
  value: string;
  numeric_value: number | string | null;
  systolic: number | null;
  diastolic: number | null;
  status: VitalStatus;
  source: 'manual' | 'device' | string;
  measured_at: string | null;
  created_at: string | null;
};

export type VitalsResponse = {
  items: BackendVital[];
  current: BackendVital[];
};

export type CreateVitalPayload = {
  type: BackendVitalType;
  value?: number;
  systolic?: number;
  diastolic?: number;
  status?: VitalStatus;
  measured_at?: string;
  source?: 'manual' | 'device';
};

export type CreateVitalResponse = {
  message: string;
  data: BackendVital;
  recommendation: string;
  alert_created: boolean;
};

export type VitalListItem = {
  id: string;
  type: MobileVitalType;
  backendType: BackendVitalType;
  label: string;
  value: string;
  unit: string;
  status: VitalStatus;
  date: string;
  time: string;
  fullDateTime: string;
  icon: 'heart-outline' | 'pulse-outline' | 'water-outline' | 'flask-outline';
  route: '/vitals/blood-pressure' | '/vitals/heart-rate' | '/vitals/blood-oxygen' | '/vitals/blood-glucose';
  raw: BackendVital;
};

export type ChartPoint = {
  day: string;
  value: number;
  systolic?: number;
  diastolic?: number;
  item: BackendVital;
};
