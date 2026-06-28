import { VitalDetailScreen } from '@/components/VitalDetailScreen';

export default function BloodOxygenScreen() {
  return (
    <VitalDetailScreen
      title="Blood Oxygen"
      type="oxygen"
      manualType="blood-oxygen"
      icon="water-outline"
      unit="%"
      accentKey="vitalsInfo"
      normalRange="95–100%"
      chartLabel="% SpO₂"
      recommendation="Blood oxygen readings are loaded from backend history. Seek medical guidance if readings drop below your safe range."
    />
  );
}
