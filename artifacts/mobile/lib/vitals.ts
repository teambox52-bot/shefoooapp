import type { BackendVital, BackendVitalType, ChartPoint, MobileVitalType, VitalListItem, VitalStatus } from '@/types/vitals';

export const VITAL_TYPE_META: Record<BackendVitalType, Omit<VitalListItem, 'id' | 'value' | 'status' | 'date' | 'time' | 'fullDateTime' | 'raw' | 'backendType'>> = {
  blood_pressure: {
    type: 'blood-pressure',
    label: 'Blood Pressure',
    unit: 'mmHg',
    icon: 'heart-outline',
    route: '/vitals/blood-pressure',
  },
  heart_rate: {
    type: 'heart-rate',
    label: 'Heart Rate',
    unit: 'bpm',
    icon: 'pulse-outline',
    route: '/vitals/heart-rate',
  },
  oxygen: {
    type: 'blood-oxygen',
    label: 'Blood Oxygen',
    unit: '%',
    icon: 'water-outline',
    route: '/vitals/blood-oxygen',
  },
  blood_sugar: {
    type: 'blood-glucose',
    label: 'Blood Glucose',
    unit: 'mg/dL',
    icon: 'flask-outline',
    route: '/vitals/blood-glucose',
  },
};

export const MOBILE_TO_BACKEND_TYPE: Record<MobileVitalType, BackendVitalType> = {
  'blood-pressure': 'blood_pressure',
  'heart-rate': 'heart_rate',
  'blood-oxygen': 'oxygen',
  'blood-glucose': 'blood_sugar',
};

export function normalizeBackendVitalType(type: string): BackendVitalType {
  if (type === 'blood_pressure' || type === 'heart_rate' || type === 'oxygen' || type === 'blood_sugar') {
    return type;
  }

  if (type === 'blood-oxygen') return 'oxygen';
  if (type === 'blood-glucose') return 'blood_sugar';
  if (type === 'blood-pressure') return 'blood_pressure';
  if (type === 'heart-rate') return 'heart_rate';

  return 'heart_rate';
}

export function getVitalNumericValue(vital: BackendVital) {
  if (vital.type === 'blood_pressure') {
    return Number(vital.systolic ?? 0);
  }

  return Number(vital.numeric_value ?? vital.value ?? 0);
}

export function getVitalDisplayValue(vital: BackendVital) {
  if (vital.type === 'blood_pressure') {
    return `${vital.systolic ?? '--'}/${vital.diastolic ?? '--'}`;
  }

  const value = Number(vital.numeric_value ?? vital.value);
  if (!Number.isFinite(value)) return String(vital.value ?? '--');
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function getVitalUnit(type: BackendVitalType) {
  return VITAL_TYPE_META[type].unit;
}

export function formatVitalDateTime(timestamp: string | null | undefined) {
  if (!timestamp) {
    return { date: '--', time: '--', fullDateTime: '--' };
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return { date: '--', time: '--', fullDateTime: '--' };
  }

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const sameDay = (left: Date, right: Date) =>
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate();

  const dateLabel = sameDay(date, today)
    ? 'Today'
    : sameDay(date, yesterday)
    ? 'Yesterday'
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return {
    date: dateLabel,
    time,
    fullDateTime: `${dateLabel}, ${time}`,
  };
}

export function mapVitalToListItem(vital: BackendVital): VitalListItem {
  const type = normalizeBackendVitalType(vital.type);
  const meta = VITAL_TYPE_META[type];
  const dateTime = formatVitalDateTime(vital.measured_at ?? vital.created_at);

  return {
    id: String(vital.id),
    backendType: type,
    ...meta,
    value: getVitalDisplayValue(vital),
    status: vital.status,
    ...dateTime,
    raw: vital,
  };
}

export function statusLabel(status: VitalStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function buildChartPoints(items: BackendVital[], type: BackendVitalType): ChartPoint[] {
  return items
    .slice(0, 7)
    .reverse()
    .map((item) => {
      const measured = new Date(item.measured_at ?? item.created_at ?? '');
      const day = Number.isNaN(measured.getTime())
        ? '--'
        : measured.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        day,
        value: type === 'blood_pressure' ? Number(item.systolic ?? 0) : getVitalNumericValue(item),
        systolic: item.systolic ?? undefined,
        diastolic: item.diastolic ?? undefined,
        item,
      };
    });
}

export function average(values: number[]) {
  if (!values.length) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function latestOfType(items: BackendVital[], type: BackendVitalType) {
  return items.find((item) => normalizeBackendVitalType(item.type) === type) ?? null;
}

export function normalizeVitalStatus(status: string | undefined): VitalStatus {
  if (status === 'elevated' || status === 'critical') return status;
  return 'normal';
}
