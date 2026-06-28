import { VitalDetailScreen } from '@/components/VitalDetailScreen';

export default function HeartRateScreen() {
  return (
    <VitalDetailScreen
      title="Heart Rate"
      type="heart_rate"
      manualType="heart-rate"
      icon="pulse-outline"
      unit="bpm"
      accentKey="vitalsNormal"
      normalRange="60–100"
      chartLabel="bpm"
      recommendation="Heart-rate readings are loaded from backend history. Keep tracking consistently to see a reliable trend."
    />
  );
}
