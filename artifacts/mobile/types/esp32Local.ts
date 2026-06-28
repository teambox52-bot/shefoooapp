export type Esp32StageStatus = {
  ok?: boolean;
  status?: string;
  state?: string;
  hr?: number;
  spo2?: number;
  sys?: number;
  dia?: number;
  plu?: number;
  value?: number;
};

export type Esp32LocalStatus = {
  device_id?: string;
  run_state?: string;
  state?: string;
  status?: string;
  session_id?: string;
  stages?: {
    pulse?: Esp32StageStatus;
    bp?: Esp32StageStatus;
    glucose?: Esp32StageStatus;
  };
  pulse?: Esp32StageStatus;
  bp?: Esp32StageStatus;
  glucose?: Esp32StageStatus;
  [key: string]: unknown;
};

export type Esp32ExtractedReadings = {
  hr?: number;
  spo2?: number;
  sys?: number;
  dia?: number;
  bp_plu?: number;
  glucose_mg_dl?: number;
};

export type Esp32Quality = {
  pulse_ok?: boolean;
  bp_ok?: boolean;
  glucose_ok?: boolean;
};

export type Esp32ExtractedResult = {
  device_id?: string;
  readings: Esp32ExtractedReadings;
  quality: Esp32Quality;
  isComplete: boolean;
  missing: string[];
};
