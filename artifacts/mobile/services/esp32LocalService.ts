import type {
  Esp32ExtractedReadings,
  Esp32ExtractedResult,
  Esp32LocalStatus,
  Esp32StageStatus,
} from '@/types/esp32Local';

export const ESP32_LOCAL_BASE_URL = 'http://192.168.4.1';

type Esp32RequestOptions = {
  method?: 'GET' | 'POST';
  timeoutMs?: number;
};

async function requestEsp32<T>(path: string, options: Esp32RequestOptions = {}): Promise<T> {
  const { method = 'GET', timeoutMs = 8000 } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${ESP32_LOCAL_BASE_URL}${path}`, {
      method,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`ESP32 request failed with HTTP ${response.status}`);
    }

    const text = await response.text();
    return (text ? JSON.parse(text) : {}) as T;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Cannot reach ESP32. Connect to the SHIFO device WiFi and try again.');
    }

    throw error instanceof Error
      ? error
      : new Error('Unable to communicate with ESP32.');
  } finally {
    clearTimeout(timeout);
  }
}

export function fetchEsp32Status() {
  return requestEsp32<Esp32LocalStatus>('/api/status');
}

export function fetchEsp32Logs() {
  return requestEsp32<unknown>('/api/logs');
}

export function startNewEsp32Operation() {
  return requestEsp32<unknown>('/api/control?action=new', { method: 'POST' });
}

export function startEsp32Measurement(mode: 'full' | 'bp' | 'glucose' = 'full') {
  return requestEsp32<unknown>(`/api/start?mode=${mode}`, { method: 'POST' });
}

function getStage(status: Esp32LocalStatus, key: 'pulse' | 'bp' | 'glucose'): Esp32StageStatus {
  const nested = status.stages?.[key];
  const flat = status[key];
  return nested ?? flat ?? {};
}

function numeric(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function isDone(stage: Esp32StageStatus) {
  const status = `${stage.status ?? stage.state ?? ''}`.toUpperCase();
  return Boolean(stage.ok) || status === 'DONE' || status === 'FINISHED' || status === 'COMPLETE';
}

export function extractEsp32Readings(status: Esp32LocalStatus): Esp32ExtractedResult {
  const pulse = getStage(status, 'pulse');
  const bp = getStage(status, 'bp');
  const glucose = getStage(status, 'glucose');
  const readings: Esp32ExtractedReadings = {
    hr: numeric(pulse.hr),
    spo2: numeric(pulse.spo2),
    sys: numeric(bp.sys),
    dia: numeric(bp.dia),
    bp_plu: numeric(bp.plu),
    glucose_mg_dl: numeric(glucose.value),
  };

  const required: Array<keyof Esp32ExtractedReadings> = ['hr', 'spo2', 'sys', 'dia', 'glucose_mg_dl'];
  const missing = required.filter((key) => readings[key] === undefined);
  const runState = `${status.run_state ?? status.state ?? status.status ?? ''}`.toUpperCase();
  const statusComplete =
    runState === 'FINISHED' ||
    runState === 'DONE' ||
    (isDone(pulse) && isDone(bp) && isDone(glucose));

  return {
    device_id: status.device_id,
    readings,
    quality: {
      pulse_ok: isDone(pulse),
      bp_ok: isDone(bp),
      glucose_ok: isDone(glucose),
    },
    isComplete: statusComplete && missing.length === 0,
    missing,
  };
}
