import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { GenderValue, formatDisplayDate, useProfile } from '@/profile/ProfileContext';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ConditionChip } from '@/components/ui/ConditionChip';
import { spacing } from '@/constants/spacing';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const CONDITIONS = [
  'No Known Condition',
  'Hypertension',
  'Hypotension',
  'Type 1 Diabetes',
  'Type 2 Diabetes',
  'Coronary Artery Disease',
  'Heart Failure',
  'Arrhythmia',
  'Asthma',
  'COPD',
  'Sleep Apnea',
  'Chronic Hypoxemia',
];
const HEIGHT_VALUES = Array.from({ length: 101 }, (_, index) => 120 + index);
const WEIGHT_VALUES = Array.from({ length: 171 }, (_, index) => 30 + index);
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const YEARS = Array.from({ length: 107 }, (_, index) => 2026 - index);

function paramValue(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function displayGender(value: GenderValue) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function normalizeGender(value: string): GenderValue {
  const lower = value.toLowerCase();
  if (lower === 'female') return 'female';
  if (lower === 'other') return 'other';
  return 'male';
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
    <View style={styles.fieldGroup}>
      <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
        {label}
      </AppText>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.selectRow,
          {
            backgroundColor: colors.surfaceContainerLow,
            borderBottomColor: colors.outlineVariant,
          },
        ]}
      >
        <AppText variant="bodyMd" color={value ? colors.onSurface : colors.outline} style={styles.pickerText}>
          {value || placeholder}
        </AppText>
        <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
      </TouchableOpacity>
    </View>
  );
}

function NumberPickerModal({
  visible,
  title,
  values,
  selectedValue,
  unit,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  values: number[];
  selectedValue: number | null;
  unit: string;
  onSelect: (value: number) => void;
  onClose: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.surfaceCard, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.sheetHandle} />
        <AppText variant="headlineMd" color={colors.onSurface} style={styles.sheetTitle}>
          {title}
        </AppText>
        <FlatList
          data={values}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={Math.max(values.findIndex((item) => item === selectedValue), 0)}
          getItemLayout={(_, index) => ({ length: 48, offset: 48 * index, index })}
          renderItem={({ item }) => {
            const selected = item === selectedValue;
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
                style={[
                  styles.valueOption,
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

export default function EditProfileStepTwoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { profile, saveProfile, isSaving, errorMessage } = useProfile();
  const [gender, setGender] = useState(displayGender(profile.gender));
  const [dob, setDob] = useState(profile.date_of_birth);
  const [height, setHeight] = useState<number | null>(profile.height_cm);
  const [weight, setWeight] = useState<number | null>(profile.weight_kg);
  const [bloodType, setBloodType] = useState(profile.blood_type);
  const [hospital, setHospital] = useState(profile.hospital_name);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(profile.chronic_conditions);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [conditionDraft, setConditionDraft] = useState('');
  const [year, month, day] = dob.split('-').map(Number);
  const [draftDay, setDraftDay] = useState(day || 12);
  const [draftMonth, setDraftMonth] = useState(month || 5);
  const [draftYear, setDraftYear] = useState(year || 1990);

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const appBarHeight = spacing.touchTarget;
  const bottomBarHeight = Platform.OS === 'web' ? 34 + 88 : insets.bottom + 88;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const maxDraftDay = daysInMonth(draftMonth, draftYear);

  React.useEffect(() => {
    setGender(displayGender(profile.gender));
    setDob(profile.date_of_birth);
    setHeight(profile.height_cm);
    setWeight(profile.weight_kg);
    setBloodType(profile.blood_type);
    setHospital(profile.hospital_name);
    setSelectedConditions(profile.chronic_conditions);

    const [nextYear, nextMonth, nextDay] = profile.date_of_birth.split('-').map(Number);
    setDraftDay(nextDay || 12);
    setDraftMonth(nextMonth || 5);
    setDraftYear(nextYear || 1990);
  }, [
    profile.blood_type,
    profile.chronic_conditions,
    profile.date_of_birth,
    profile.gender,
    profile.height_cm,
    profile.hospital_name,
    profile.weight_kg,
  ]);

  function toggleCondition(condition: string) {
    setSelectedConditions((current) =>
      current.includes(condition)
        ? current.filter((item) => item !== condition)
        : [...current, condition]
    );
  }

  function addCondition() {
    const next = conditionDraft.trim();
    if (!next) return;

    setSelectedConditions((current) =>
      current.some((item) => item.toLowerCase() === next.toLowerCase()) ? current : [...current, next]
    );
    setConditionDraft('');
    setAddOpen(false);
  }

  function updateDraftMonth(nextMonth: number) {
    setDraftMonth(nextMonth);
    setDraftDay((current) => Math.min(current, daysInMonth(nextMonth, draftYear)));
  }

  function updateDraftYear(nextYear: number) {
    setDraftYear(nextYear);
    setDraftDay((current) => Math.min(current, daysInMonth(draftMonth, nextYear)));
  }

  function saveDob() {
    const mm = String(draftMonth).padStart(2, '0');
    const dd = String(draftDay).padStart(2, '0');
    setDob(`${draftYear}-${mm}-${dd}`);
    setShowDobPicker(false);
  }

  async function saveChanges() {
    try {
      await saveProfile({
        first_name: paramValue(params.first_name, profile.first_name),
        last_name: paramValue(params.last_name, profile.last_name),
        email: profile.email,
        phone_country_code: paramValue(params.phone_country_code, profile.phone_country_code),
        phone_number: paramValue(params.phone_number, profile.phone_number),
        gender: normalizeGender(gender),
        date_of_birth: dob,
        height_cm: height ?? profile.height_cm,
        weight_kg: weight ?? profile.weight_kg,
        blood_type: bloodType,
        hospital_name: hospital.trim(),
        chronic_conditions: selectedConditions,
      });
      router.replace('/(tabs)/profile');
    } catch {
      // The profile context exposes the user-facing error message.
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.appBar,
          {
            backgroundColor: colors.surface,
            paddingTop: topPadding,
            height: appBarHeight + topPadding,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={24} color={colors.brand} />
        </TouchableOpacity>
        <AppText variant="headlineMd" color={colors.onSurface}>
          Edit Profile
        </AppText>
        <View style={styles.appBarSpacer} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomBarHeight + 24 }]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        <View style={styles.progressSection}>
          <ProgressBar step={2} total={2} />
        </View>

        <View style={styles.hero}>
          <AppText variant="headlineXlMobile" color={colors.onSurface}>
            Health Profile
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.heroSub}>
            Step 2 of 2
          </AppText>
        </View>

        <View style={styles.form}>
          {errorMessage && (
            <View style={[styles.feedbackCard, { backgroundColor: colors.errorColor + '14', borderColor: colors.errorColor + '35' }]}>
              <AppText variant="bodySm" color={colors.errorColor}>
                {errorMessage}
              </AppText>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
              Gender
            </AppText>
            <SegmentedControl options={['Male', 'Female', 'Other']} value={gender} onChange={setGender} />
          </View>

          <SelectField
            label="Date of Birth"
            value={formatDisplayDate(dob)}
            placeholder="DD / MM / YYYY"
            onPress={() => setShowDobPicker(true)}
          />

          <View style={styles.twoCol}>
            <View style={styles.colField}>
              <SelectField
                label="Height (cm)"
                value={height ? `${height} cm` : ''}
                placeholder="175"
                onPress={() => setShowHeightPicker(true)}
              />
            </View>
            <View style={styles.colField}>
              <SelectField
                label="Weight (kg)"
                value={weight ? `${weight} kg` : ''}
                placeholder="70"
                onPress={() => setShowWeightPicker(true)}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
              Blood Type
            </AppText>
            <TouchableOpacity
              onPress={() => setShowBloodTypePicker(true)}
              activeOpacity={0.8}
              style={[
                styles.pickerRow,
                {
                  backgroundColor: colors.surfaceContainerLow,
                  borderBottomColor: colors.outlineVariant,
                },
              ]}
            >
              <AppText variant="bodyMd" color={bloodType ? colors.onSurface : colors.outline} style={styles.pickerText}>
                {bloodType || 'Select Blood Type'}
              </AppText>
              <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          <AppInput
            label="Primary Hospital Name"
            variant="underlined"
            placeholder="e.g. City Medical Center"
            value={hospital}
            onChangeText={setHospital}
          />

          <View style={styles.conditionsGroup}>
            <View>
              <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
                Medical Conditions
              </AppText>
              <AppText variant="bodySm" color={colors.onSurfaceVariant} style={styles.conditionsSub}>
                Select all that apply to your history.
              </AppText>
            </View>
            <View style={styles.chipsWrap}>
              {CONDITIONS.map((condition) => (
                <ConditionChip
                  key={condition}
                  label={condition}
                  selected={selectedConditions.includes(condition)}
                  onPress={() => toggleCondition(condition)}
                />
              ))}
              {selectedConditions
                .filter((condition) => !CONDITIONS.includes(condition))
                .map((condition) => (
                  <ConditionChip
                    key={condition}
                    label={condition}
                    selected
                    onPress={() => toggleCondition(condition)}
                  />
                ))}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setAddOpen(true)}
                style={[styles.addConditionChip, { backgroundColor: colors.outlineVariant + '18' }]}
              >
                <Ionicons name="add" size={16} color={colors.onSurfaceVariant} />
                <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.addConditionText}>
                  Add New
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface + 'F0',
            borderTopColor: colors.outlineVariant + '20',
            paddingBottom: bottomInset + 16,
          },
        ]}
      >
        <AppButton title={isSaving ? 'Saving...' : 'Save Changes'} variant="brand" onPress={saveChanges} style={styles.createBtn} />
      </View>

      <Modal visible={showBloodTypePicker} transparent animationType="slide" onRequestClose={() => setShowBloodTypePicker(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowBloodTypePicker(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.surfaceCard, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.sheetTitle}>
            Select Blood Type
          </AppText>
          <FlatList
            data={BLOOD_TYPES}
            keyExtractor={(item) => item}
            numColumns={2}
            columnWrapperStyle={styles.bloodTypeRow}
            renderItem={({ item }) => {
              const selected = bloodType === item;
              return (
                <TouchableOpacity
                  onPress={() => {
                    setBloodType(item);
                    setShowBloodTypePicker(false);
                  }}
                  activeOpacity={0.8}
                  style={[
                    styles.bloodTypeOption,
                    {
                      backgroundColor: selected ? colors.actionBlueSoft : colors.surfaceContainerLow,
                      borderColor: selected ? colors.actionBlue : 'transparent',
                    },
                  ]}
                >
                  <AppText variant="headlineMd" color={selected ? colors.actionBlue : colors.onSurface} style={styles.bloodTypeLabel}>
                    {item}
                  </AppText>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      <Modal visible={showDobPicker} transparent animationType="slide" onRequestClose={() => setShowDobPicker(false)}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowDobPicker(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.surfaceCard, paddingBottom: insets.bottom + 16 }]}>
          <View style={styles.sheetHandle} />
          <AppText variant="headlineMd" color={colors.onSurface} style={styles.sheetTitle}>
            Select Date of Birth
          </AppText>
          <View style={styles.datePickerRow}>
            <FlatList
              data={Array.from({ length: maxDraftDay }, (_, index) => index + 1)}
              keyExtractor={(item) => `day-${item}`}
              style={styles.dateColumn}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setDraftDay(item)}
                  style={[styles.dateOption, { backgroundColor: item === draftDay ? colors.actionBlueSoft : 'transparent' }]}
                >
                  <AppText variant="labelMd" color={item === draftDay ? colors.actionBlue : colors.onSurface}>
                    {String(item).padStart(2, '0')}
                  </AppText>
                </TouchableOpacity>
              )}
            />
            <FlatList
              data={MONTHS}
              keyExtractor={(item) => item}
              style={styles.dateColumn}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const month = index + 1;
                return (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => updateDraftMonth(month)}
                    style={[styles.dateOption, { backgroundColor: month === draftMonth ? colors.actionBlueSoft : 'transparent' }]}
                  >
                    <AppText variant="labelMd" color={month === draftMonth ? colors.actionBlue : colors.onSurface}>
                      {item.slice(0, 3)}
                    </AppText>
                  </TouchableOpacity>
                );
              }}
            />
            <FlatList
              data={YEARS}
              keyExtractor={(item) => `year-${item}`}
              style={styles.dateColumn}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => updateDraftYear(item)}
                  style={[styles.dateOption, { backgroundColor: item === draftYear ? colors.actionBlueSoft : 'transparent' }]}
                >
                  <AppText variant="labelMd" color={item === draftYear ? colors.actionBlue : colors.onSurface}>
                    {item}
                  </AppText>
                </TouchableOpacity>
              )}
            />
          </View>
          <AppButton title="Use Selected Date" onPress={saveDob} style={styles.dateSaveBtn} />
        </View>
      </Modal>

      <Modal transparent visible={addOpen} animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.centerModalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surfaceCard }]}>
            <AppText variant="headlineMd" color={colors.onSurface} style={styles.modalTitle}>
              Add Condition
            </AppText>
            <TextInput
              value={conditionDraft}
              onChangeText={setConditionDraft}
              placeholder="Condition name"
              placeholderTextColor={colors.onSurfaceVariant}
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.surfaceContainer,
                  color: colors.onSurface,
                  borderColor: colors.outlineVariant + '35',
                },
              ]}
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => {
                  setConditionDraft('');
                  setAddOpen(false);
                }}
                style={[styles.modalButton, { backgroundColor: colors.surfaceContainer }]}
              >
                <AppText variant="labelMd" color={colors.onSurface}>
                  Cancel
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.85} onPress={addCondition} style={[styles.modalButton, { backgroundColor: colors.actionBlue }]}>
                <AppText variant="labelMd" color="#fff">
                  Add
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <NumberPickerModal
        visible={showHeightPicker}
        title="Select Height"
        values={HEIGHT_VALUES}
        selectedValue={height ?? 175}
        unit="cm"
        onSelect={setHeight}
        onClose={() => setShowHeightPicker(false)}
      />
      <NumberPickerModal
        visible={showWeightPicker}
        title="Select Weight"
        values={WEIGHT_VALUES}
        selectedValue={weight ?? 70}
        unit="kg"
        onSelect={setWeight}
        onClose={() => setShowWeightPicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  appBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.safeMargin, paddingBottom: 12 },
  backBtn: { marginRight: spacing.stackMd, padding: 4, marginBottom: -4 },
  appBarSpacer: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: spacing.safeMargin },
  progressSection: { marginTop: spacing.stackLg, marginBottom: spacing.stackLg },
  hero: { marginBottom: spacing.stackLg },
  heroSub: { marginTop: 4 },
  form: { gap: spacing.stackLg },
  feedbackCard: { borderWidth: 1, borderRadius: 12, padding: 12 },
  fieldGroup: { gap: 8 },
  fieldLabel: { paddingLeft: 2 },
  twoCol: { flexDirection: 'row', gap: spacing.gutter },
  colField: { flex: 1 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  pickerText: { flex: 1 },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  conditionsGroup: { gap: spacing.stackMd },
  conditionsSub: { marginTop: 4 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addConditionChip: { minHeight: 36, borderRadius: 999, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 },
  addConditionText: { textTransform: 'none', letterSpacing: 0, fontSize: 13 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.safeMargin,
    paddingTop: 16,
    borderTopWidth: 1,
  },
  createBtn: { width: '100%' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: spacing.safeMargin,
    maxHeight: '60%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: { marginBottom: 16 },
  bloodTypeRow: { gap: 12, marginBottom: 12 },
  bloodTypeOption: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  bloodTypeLabel: { fontSize: 20 },
  valueOption: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerRow: { flexDirection: 'row', gap: 8, height: 220 },
  dateColumn: { flex: 1 },
  dateOption: { minHeight: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  dateSaveBtn: { marginTop: 16 },
  centerModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: spacing.safeMargin },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: 18, padding: 18, gap: 14 },
  modalTitle: { fontSize: 18 },
  modalInput: { height: 46, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 15, fontFamily: 'Inter_500Medium' },
  modalActions: { flexDirection: 'row', gap: 10 },
  modalButton: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
