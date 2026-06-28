import { VitalDetailScreen } from '@/components/VitalDetailScreen';

export default function BloodGlucoseScreen() {
  return (
    <VitalDetailScreen
      title="Blood Glucose"
      type="blood_sugar"
      manualType="blood-glucose"
      icon="flask-outline"
      unit="mg/dL"
      accentKey="vitalsNormal"
      normalRange="70–130"
      chartLabel="mg/dL"
      recommendation="Blood glucose remains in mg/dL and is loaded from backend history. Add readings over time for a stronger trend."
    />
  );
}
