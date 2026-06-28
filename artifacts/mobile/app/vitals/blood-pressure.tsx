import { VitalDetailScreen } from '@/components/VitalDetailScreen';

export default function BloodPressureScreen() {
  return (
    <VitalDetailScreen
      title="Blood Pressure"
      type="blood_pressure"
      manualType="blood-pressure"
      icon="heart-outline"
      unit="mmHg"
      accentKey="vitalsElevated"
      normalRange="Below 120/80"
      chartLabel="Systolic · mmHg"
      recommendation="Blood pressure readings are loaded from backend history. Elevated values should be reviewed with your physician if they persist."
    />
  );
}
