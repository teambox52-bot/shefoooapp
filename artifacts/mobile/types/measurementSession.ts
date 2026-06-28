export type MeasurementMode = 'full' | 'bp' | 'glucose' | 'pulse';
export type MeasurementSessionStatus = 'pending' | 'running' | 'completed' | 'expired' | 'cancelled';
export type MeasurementSessionSource = 'backend_wifi' | 'local_ap' | 'mobile_relay' | 'mobile_local_ap_relay';

export type MeasurementSession = {
  id: number;
  user_id: number;
  hardware_device_id?: number | null;
  device_id?: string | null;
  esp_session_id?: string | null;
  status: MeasurementSessionStatus;
  mode?: MeasurementMode | null;
  source?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  expires_at: string;
};

export type LocalDeviceInstructions = {
  base_url: string;
  start_path: string;
  status_path: string;
  logs_path: string;
};

export type CreateMeasurementSessionPayload = {
  device_id?: string;
  mode?: MeasurementMode;
  source?: Extract<MeasurementSessionSource, 'backend_wifi' | 'local_ap' | 'mobile_relay'>;
};

export type MeasurementReadingsPayload = {
  hr?: number;
  spo2?: number;
  sys?: number;
  dia?: number;
  bp_plu?: number;
  glucose_mg_dl?: number;
};

export type SubmitLocalMeasurementPayload = {
  device_id?: string;
  source?: 'mobile_local_ap_relay';
  readings: MeasurementReadingsPayload;
  quality?: {
    pulse_ok?: boolean;
    bp_ok?: boolean;
    glucose_ok?: boolean;
  };
};

export type MeasurementSessionResponse = {
  session: MeasurementSession;
  local_device?: LocalDeviceInstructions;
};

export type MeasurementResultResponse = {
  session: MeasurementSession;
  stored_vitals?: Array<{
    id: number;
    type: string;
    value?: number | string | null;
    systolic?: number | null;
    diastolic?: number | null;
    status?: string | null;
    source?: string | null;
    measured_at?: string | null;
  }>;
  notifications?: Array<Record<string, unknown>>;
  recommendations?: string[];
  latest_recommendation?: string | null;
  analysis: Record<string, unknown>;
};
