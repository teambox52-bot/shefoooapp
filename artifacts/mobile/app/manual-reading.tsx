import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { spacing } from '@/constants/spacing';
import { createVital } from '@/services/vitalsService';
import { MOBILE_TO_BACKEND_TYPE } from '@/lib/vitals';

type VitalType = 'blood-pressure' | 'heart-rate' | 'blood-oxygen' | 'blood-glucose';

const TYPE_OPTIONS: { key: VitalType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'blood-pressure', label: 'Blood\nPressure', icon: 'heart-outline' },
  { key: 'heart-rate', label: 'Heart\nRate', icon: 'pulse-outline' },
  { key: 'blood-oxygen', label: 'Blood\nOxygen', icon: 'water-outline' },
  { key: 'blood-glucose', label: 'Blood\nGlucose', icon: 'flask-outline' },
];

const SYSTOLIC_VALUES = Array.from({ length: 181 }, (_, index) => 70 + index);
const DIASTOLIC_VALUES = Array.from({ length: 111 }, (_, index) => 40 + index);
const HEART_RATE_VALUES = Array.from({ length: 181 }, (_, index) => 40 + index);
const OXYGEN_VALUES = Array.from({ length: 31 }, (_, index) => 70 + index);
const GLUCOSE_VALUES = Array.from({ length: 461 }, (_, index) => 40 + index);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 6 }, (_, index) => new Date().getFullYear() - index);
const HOURS = Array.from({ length: 24 }, (_, index) => index);
const MINUTES = Array.from({ length: 60 }, (_, index) => index);

function formatDateDisplay(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return '';
  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function daysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function SelectField({
  label,
  value,
  placeholder,
  onPress,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
}) {
  const colors = useColors();

  return (
    <View style={styles.selectGroup}>
      <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.selectLabel}>
        {label}
      </AppText>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={[
          styles.selectRow,
          {
            backgroundColor: colors.surfaceContainerLowest,
            borderColor: colors.outlineVariant + '55',
          },
        ]}
      >
        <AppText variant="bodyMd" color={value ? colors.onSurface : colors.outline} style={styles.selectText}>
          {value || placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={18} color={colors.onSurfaceVariant} />
      </TouchableOpacity>
    </View>
  );
}

function ValuePickerModal({
  visible,
  title,
  values,
  selectedValue,
  fallbackValue,
  unit,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  values: number[];
  selectedValue: number | null;
  fallbackValue: number;
  unit: string;
  onSelect: (value: number) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const activeValue = selectedValue ?? fallbackValue;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surfaceCard, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.sheetTitle}>
            {title}
          </AppText>
          <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={[styles.sheetClose, { backgroundColor: colors.surfaceContainer }]}>
            <Ionicons name="close" size={16} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        <FlatList
          data={values}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={Math.max(values.findIndex((item) => item === activeValue), 0)}
          getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
          renderItem={({ item }) => {
            const selected = item === activeValue;
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                style={[
                  styles.optionRow,
                  {
                    backgroundColor: selected ? colors.actionBlueSoft : colors.surfaceContainerLow,
                    borderColor: selected ? colors.actionBlue : 'transparent',
                  },
                ]}
              >
                <AppText variant="bodyMd" color={selected ? colors.actionBlue : colors.onSurface}>
                  {item} {unit}
                </AppText>
                {selected && <Ionicons name="checkmark-circle" size={20} color={colors.actionBlue} />}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </Modal>
  );
}

function DatePickerModal({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const today = new Date();
  const [yearPart, monthPart, dayPart] = value.split('-').map(Number);
  const [draftYear, setDraftYear] = useState(yearPart || today.getFullYear());
  const [draftMonth, setDraftMonth] = useState(monthPart || today.getMonth() + 1);
  const [draftDay, setDraftDay] = useState(dayPart || today.getDate());
  const maxDraftDay = daysInMonth(draftMonth, draftYear);

  function updateMonth(nextMonth: number) {
    setDraftMonth(nextMonth);
    setDraftDay((current) => Math.min(current, daysInMonth(nextMonth, draftYear)));
  }

  function updateYear(nextYear: number) {
    setDraftYear(nextYear);
    setDraftDay((current) => Math.min(current, daysInMonth(draftMonth, nextYear)));
  }

  function saveDate() {
    onSelect(`${draftYear}-${String(draftMonth).padStart(2, '0')}-${String(draftDay).padStart(2, '0')}`);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surfaceCard, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.sheetTitle}>
            Select Date
          </AppText>
          <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={[styles.sheetClose, { backgroundColor: colors.surfaceContainer }]}>
            <Ionicons name="close" size={16} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.pickerColumns}>
          <FlatList
            data={Array.from({ length: maxDraftDay }, (_, index) => index + 1)}
            keyExtractor={(item) => `day-${item}`}
            style={styles.pickerColumn}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PickerOption label={String(item).padStart(2, '0')} selected={item === draftDay} onPress={() => setDraftDay(item)} />
            )}
          />
          <FlatList
            data={MONTHS}
            keyExtractor={(item) => item}
            style={styles.pickerColumn}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const month = index + 1;
              return <PickerOption label={item} selected={month === draftMonth} onPress={() => updateMonth(month)} />;
            }}
          />
          <FlatList
            data={YEARS}
            keyExtractor={(item) => `year-${item}`}
            style={styles.pickerColumn}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PickerOption label={String(item)} selected={item === draftYear} onPress={() => updateYear(item)} />
            )}
          />
        </View>
        <AppButton title="Use Selected Date" onPress={saveDate} style={styles.sheetAction} />
      </View>
    </Modal>
  );
}

function TimePickerModal({
  visible,
  value,
  onSelect,
  onClose,
}: {
  visible: boolean;
  value: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [hourPart, minutePart] = value.split(':').map(Number);
  const [draftHour, setDraftHour] = useState(Number.isFinite(hourPart) ? hourPart : now.getHours());
  const [draftMinute, setDraftMinute] = useState(Number.isFinite(minutePart) ? minutePart : now.getMinutes());

  function saveTime() {
    onSelect(`${String(draftHour).padStart(2, '0')}:${String(draftMinute).padStart(2, '0')}`);
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surfaceCard, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.sheetTitle}>
            Select Time
          </AppText>
          <TouchableOpacity onPress={onClose} activeOpacity={0.75} style={[styles.sheetClose, { backgroundColor: colors.surfaceContainer }]}>
            <Ionicons name="close" size={16} color={colors.onSurface} />
          </TouchableOpacity>
        </View>
        <View style={styles.pickerColumns}>
          <FlatList
            data={HOURS}
            keyExtractor={(item) => `hour-${item}`}
            style={styles.pickerColumn}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={draftHour}
            getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
            renderItem={({ item }) => (
              <PickerOption label={String(item).padStart(2, '0')} selected={item === draftHour} onPress={() => setDraftHour(item)} />
            )}
          />
          <FlatList
            data={MINUTES}
            keyExtractor={(item) => `minute-${item}`}
            style={styles.pickerColumn}
            showsVerticalScrollIndicator={false}
            initialScrollIndex={draftMinute}
            getItemLayout={(_, index) => ({ length: 40, offset: 40 * index, index })}
            renderItem={({ item }) => (
              <PickerOption label={String(item).padStart(2, '0')} selected={item === draftMinute} onPress={() => setDraftMinute(item)} />
            )}
          />
        </View>
        <AppButton title="Use Selected Time" onPress={saveTime} style={styles.sheetAction} />
      </View>
    </Modal>
  );
}

function PickerOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.pickerOption,
        { backgroundColor: selected ? colors.actionBlueSoft : 'transparent' },
      ]}
    >
      <AppText variant="labelMd" color={selected ? colors.actionBlue : colors.onSurface}>
        {label}
      </AppText>
    </TouchableOpacity>
  );
}

export default function ManualReadingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string }>();

  const initialType = (params.type ?? 'blood-pressure') as VitalType;
  const [type, setType] = useState<VitalType>(initialType);

  const [systolic, setSystolic] = useState<number | null>(null);
  const [diastolic, setDiastolic] = useState<number | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [spO2, setSpO2] = useState<number | null>(null);
  const [glucose, setGlucose] = useState<number | null>(null);
  const [glucoseType, setGlucoseType] = useState('Fasting');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState<
    | null
    | 'systolic'
    | 'diastolic'
    | 'heart-rate'
    | 'oxygen'
    | 'glucose'
    | 'date'
    | 'time'
  >(null);

  const botPad = Platform.OS === 'web' ? 34 : insets.bottom + 16;
  const bpInvalid = type === 'blood-pressure' && systolic !== null && diastolic !== null && diastolic >= systolic;

  function measuredAtValue() {
    if (!date && !time) return new Date().toISOString();

    const safeDate = date || new Date().toISOString().slice(0, 10);
    const safeTime = time || new Date().toTimeString().slice(0, 5);
    return new Date(`${safeDate}T${safeTime}:00`).toISOString();
  }

  function validateReading() {
    if (bpInvalid) return 'Diastolic must be lower than systolic.';

    if (type === 'blood-pressure' && (systolic === null || diastolic === null)) {
      return 'Select systolic and diastolic values.';
    }

    if (type === 'heart-rate' && heartRate === null) return 'Select a heart rate value.';
    if (type === 'blood-oxygen' && spO2 === null) return 'Select a blood oxygen value.';
    if (type === 'blood-glucose' && glucose === null) return 'Select a blood glucose value.';

    return null;
  }

  const handleSave = async () => {
    const validationMessage = validateReading();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const backendType = MOBILE_TO_BACKEND_TYPE[type];
      const payload =
        type === 'blood-pressure'
          ? {
              type: backendType,
              systolic: systolic ?? undefined,
              diastolic: diastolic ?? undefined,
              measured_at: measuredAtValue(),
              source: 'manual' as const,
            }
          : {
              type: backendType,
              value: type === 'heart-rate' ? heartRate ?? undefined : type === 'blood-oxygen' ? spO2 ?? undefined : glucose ?? undefined,
              measured_at: measuredAtValue(),
              source: 'manual' as const,
            };

      await createVital(payload);
      router.replace('/(tabs)/history');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to save reading.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.surfaceCard }]}>
      <View style={styles.handleBar}>
        <View style={[styles.handle, { backgroundColor: colors.outlineVariant }]} />
      </View>

      <View style={[styles.header, { borderBottomColor: colors.outlineVariant + '22' }]}>
        <AppText variant="headlineMd" color={colors.onSurface}>Manual Reading</AppText>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={[styles.closeBtn, { backgroundColor: colors.surfaceContainer }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={colors.onSurface} />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: botPad + 80 }]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <View style={styles.typeSelectorWrap}>
          {TYPE_OPTIONS.map((opt) => {
            const active = type === opt.key;
            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setType(opt.key)}
                activeOpacity={0.8}
                style={[
                  styles.typeOption,
                  {
                    backgroundColor: active ? colors.actionBlueSoft : colors.surfaceContainerLow,
                    borderColor: active ? colors.actionBlue : 'transparent',
                  },
                ]}
              >
                <Ionicons
                  name={opt.icon}
                  size={20}
                  color={active ? colors.actionBlue : colors.onSurfaceVariant}
                />
                <AppText
                  variant="labelMd"
                  color={active ? colors.actionBlue : colors.onSurfaceVariant}
                  style={styles.typeLabel}
                  numberOfLines={2}
                >
                  {opt.label}
                </AppText>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.form}>
          {type === 'blood-pressure' && (
            <>
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.groupLabel}>
                Blood Pressure Reading
              </AppText>
              <View style={styles.twoCol}>
                <View style={styles.colField}>
                  <SelectField
                    label="Systolic"
                    placeholder="e.g. 120"
                    value={systolic ? String(systolic) : ''}
                    onPress={() => setPicker('systolic')}
                  />
                </View>
                <View style={styles.separator}>
                  <AppText variant="headlineLg" color={colors.outlineVariant}>/</AppText>
                </View>
                <View style={styles.colField}>
                  <SelectField
                    label="Diastolic"
                    placeholder="e.g. 80"
                    value={diastolic ? String(diastolic) : ''}
                    onPress={() => setPicker('diastolic')}
                  />
                </View>
              </View>
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.unitHint}>
                mmHg · Millimetres of mercury
              </AppText>
              {bpInvalid && (
                <AppText variant="bodySm" color={colors.errorColor} style={styles.validationText}>
                  Diastolic must be lower than systolic.
                </AppText>
              )}
            </>
          )}

          {error && (
            <View style={[styles.errorCard, { backgroundColor: colors.errorColor + '12', borderColor: colors.errorColor + '35' }]}>
              <AppText variant="bodySm" color={colors.errorColor}>
                {error}
              </AppText>
            </View>
          )}

          {type === 'heart-rate' && (
            <>
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.groupLabel}>
                Heart Rate Reading
              </AppText>
              <SelectField
                label="Heart Rate"
                placeholder="e.g. 72"
                value={heartRate ? String(heartRate) : ''}
                onPress={() => setPicker('heart-rate')}
              />
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.unitHint}>
                bpm · Beats per minute
              </AppText>
            </>
          )}

          {type === 'blood-oxygen' && (
            <>
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.groupLabel}>
                Blood Oxygen Reading
              </AppText>
              <SelectField
                label="SpO₂"
                placeholder="e.g. 97"
                value={spO2 ? String(spO2) : ''}
                onPress={() => setPicker('oxygen')}
              />
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.unitHint}>
                % · Peripheral oxygen saturation
              </AppText>
            </>
          )}

          {type === 'blood-glucose' && (
            <>
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.groupLabel}>
                Blood Glucose Reading
              </AppText>
              <SelectField
                label="Blood Glucose"
                placeholder="e.g. 104"
                value={glucose ? String(glucose) : ''}
                onPress={() => setPicker('glucose')}
              />
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.unitHint}>
                mg/dL · Milligrams per deciliter
              </AppText>
              <View style={styles.glucoseTypeGroup}>
                <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.groupLabel}>
                  Reading Type
                </AppText>
                <SegmentedControl
                  options={['Fasting', 'Random', 'Post-meal']}
                  value={glucoseType}
                  onChange={setGlucoseType}
                />
              </View>
            </>
          )}

          <View style={[styles.divider, { backgroundColor: colors.outlineVariant + '20' }]} />
          <View style={styles.twoCol}>
            <View style={styles.colField}>
              <SelectField
                label="Date"
                placeholder="DD/MM/YYYY"
                value={formatDateDisplay(date)}
                onPress={() => setPicker('date')}
              />
            </View>
            <View style={styles.colField}>
              <SelectField
                label="Time"
                placeholder="HH:MM"
                value={time}
                onPress={() => setPicker('time')}
              />
            </View>
          </View>

          <AppInput
            label="Notes (Optional)"
            placeholder="e.g. After exercise, fasting..."
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>
      </KeyboardAwareScrollViewCompat>

      <View style={[styles.bottomBar, { paddingBottom: botPad, borderTopColor: colors.outlineVariant + '20', backgroundColor: colors.surfaceCard }]}>
        <AppButton
          title="Save Reading"
          onPress={handleSave}
          loading={saving}
          disabled={bpInvalid}
          icon="checkmark-circle-outline"
          style={styles.saveBtn}
        />
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.cancelText}>
            Cancel
          </AppText>
        </TouchableOpacity>
      </View>

      <ValuePickerModal
        visible={picker === 'systolic'}
        title="Select Systolic"
        values={SYSTOLIC_VALUES}
        selectedValue={systolic}
        fallbackValue={120}
        unit="mmHg"
        onSelect={setSystolic}
        onClose={() => setPicker(null)}
      />
      <ValuePickerModal
        visible={picker === 'diastolic'}
        title="Select Diastolic"
        values={DIASTOLIC_VALUES}
        selectedValue={diastolic}
        fallbackValue={80}
        unit="mmHg"
        onSelect={setDiastolic}
        onClose={() => setPicker(null)}
      />
      <ValuePickerModal
        visible={picker === 'heart-rate'}
        title="Select Heart Rate"
        values={HEART_RATE_VALUES}
        selectedValue={heartRate}
        fallbackValue={72}
        unit="bpm"
        onSelect={setHeartRate}
        onClose={() => setPicker(null)}
      />
      <ValuePickerModal
        visible={picker === 'oxygen'}
        title="Select Blood Oxygen"
        values={OXYGEN_VALUES}
        selectedValue={spO2}
        fallbackValue={97}
        unit="%"
        onSelect={setSpO2}
        onClose={() => setPicker(null)}
      />
      <ValuePickerModal
        visible={picker === 'glucose'}
        title="Select Blood Glucose"
        values={GLUCOSE_VALUES}
        selectedValue={glucose}
        fallbackValue={104}
        unit="mg/dL"
        onSelect={setGlucose}
        onClose={() => setPicker(null)}
      />
      <DatePickerModal
        visible={picker === 'date'}
        value={date}
        onSelect={setDate}
        onClose={() => setPicker(null)}
      />
      <TimePickerModal
        visible={picker === 'time'}
        value={time}
        onSelect={setTime}
        onClose={() => setPicker(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  handleBar: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handle: { width: 36, height: 4, borderRadius: 2 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.safeMargin,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeBtn: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.safeMargin, paddingTop: spacing.stackLg },
  typeSelectorWrap: { flexDirection: 'row', gap: 8, marginBottom: spacing.stackLg },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
  },
  typeLabel: { textTransform: 'none', letterSpacing: 0, fontSize: 10, textAlign: 'center' },
  form: { gap: spacing.stackMd },
  groupLabel: { paddingLeft: 2, marginBottom: -8 },
  selectGroup: { gap: 6 },
  selectLabel: { paddingLeft: 2 },
  selectRow: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectText: { flex: 1 },
  twoCol: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  colField: { flex: 1 },
  separator: { alignItems: 'center', marginTop: 20 },
  unitHint: { textTransform: 'none', letterSpacing: 0, fontSize: 11, paddingLeft: 2, marginTop: -8 },
  validationText: { paddingLeft: 2, marginTop: -6 },
  errorCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
  glucoseTypeGroup: { gap: 8 },
  divider: { height: 1, marginVertical: spacing.stackSm },
  bottomBar: {
    paddingHorizontal: spacing.safeMargin,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 10,
    alignItems: 'center',
  },
  saveBtn: { width: '100%' },
  cancelText: { textTransform: 'none', letterSpacing: 0, paddingVertical: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: spacing.safeMargin,
    maxHeight: '62%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sheetTitle: { flex: 1 },
  sheetClose: { width: 32, height: 32, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  optionRow: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerColumns: { flexDirection: 'row', gap: 8, height: 220 },
  pickerColumn: { flex: 1 },
  pickerOption: {
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  sheetAction: { marginTop: 16 },
});
