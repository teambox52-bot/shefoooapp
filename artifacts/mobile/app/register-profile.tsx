import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { AppText } from '@/components/ui/AppText';
import { AppInput } from '@/components/ui/AppInput';
import { AppButton } from '@/components/ui/AppButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ConditionChip } from '@/components/ui/ConditionChip';
import { spacing } from '@/constants/spacing';
import { useAuth } from '@/auth/AuthProvider';
import { getApiErrorMessage } from '@/lib/apiClient';

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

const CONDITION_TO_BACKEND_CODE: Record<string, string> = {
  'No Known Condition': 'none',
  Hypertension: 'hypertension',
  Hypotension: 'hypotension',
  'Type 1 Diabetes': 'diabetes_type_1',
  'Type 2 Diabetes': 'diabetes_type_2',
  'Coronary Artery Disease': 'coronary_artery_disease',
  'Heart Failure': 'heart_failure',
  Arrhythmia: 'arrhythmia',
  Asthma: 'asthma',
  COPD: 'copd',
  'Sleep Apnea': 'sleep_apnea',
  'Chronic Hypoxemia': 'chronic_hypoxemia',
};

function formatDateValue(value: string) {
  if (!value) return '';

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return value;

  return `${day} ${MONTHS[month - 1].slice(0, 3)} ${year}`;
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
        <AppText
          variant="bodyMd"
          color={value ? colors.onSurface : colors.outline}
          style={styles.pickerText}
        >
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

export default function RegisterProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneCountryCode?: string;
    phoneNumber?: string;
    password?: string;
    passwordConfirmation?: string;
  }>();
  const { signUp } = useAuth();

  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');
  const [height, setHeight] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [bloodType, setBloodType] = useState('');
  const [hospital, setHospital] = useState("St. Mark's");
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Type 1 Diabetes']);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [showWeightPicker, setShowWeightPicker] = useState(false);
  const [draftDay, setDraftDay] = useState(12);
  const [draftMonth, setDraftMonth] = useState(5);
  const [draftYear, setDraftYear] = useState(1990);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const toggleCondition = (condition: string) => {
    setSelectedConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const topPadding = Platform.OS === 'web' ? 67 : insets.top;
  const appBarHeight = spacing.touchTarget;
  const bottomBarHeight = Platform.OS === 'web' ? 34 + 88 : insets.bottom + 88;
  const bottomInset = Platform.OS === 'web' ? 34 : insets.bottom;
  const dobDisplay = formatDateValue(dob);
  const maxDraftDay = daysInMonth(draftMonth, draftYear);

  function updateDraftMonth(month: number) {
    setDraftMonth(month);
    setDraftDay((current) => Math.min(current, daysInMonth(month, draftYear)));
  }

  function updateDraftYear(year: number) {
    setDraftYear(year);
    setDraftDay((current) => Math.min(current, daysInMonth(draftMonth, year)));
  }

  function saveDob() {
    const mm = String(draftMonth).padStart(2, '0');
    const dd = String(draftDay).padStart(2, '0');
    setDob(`${draftYear}-${mm}-${dd}`);
    setShowDobPicker(false);
  }

  function genderToBackend(value: string): 'male' | 'female' | 'other' {
    if (value === 'Female') return 'female';
    if (value === 'Other') return 'other';
    return 'male';
  }

  function conditionsToBackend(values: string[]) {
    const codes = values
      .map((value) => CONDITION_TO_BACKEND_CODE[value])
      .filter((value): value is string => !!value);

    if (codes.includes('none')) return ['none'];
    return codes.length ? codes : ['none'];
  }

  async function handleCreateAccount() {
    setSubmitting(true);
    setApiError(null);

    try {
      const firstName = String(params.firstName ?? '').trim();
      const lastName = String(params.lastName ?? '').trim();
      const name = `${firstName} ${lastName}`.trim();

      await signUp({
        name,
        email: String(params.email ?? '').trim(),
        password: String(params.password ?? ''),
        password_confirmation: String(params.passwordConfirmation ?? ''),
        phone_country_code: String(params.phoneCountryCode ?? ''),
        phone_number: String(params.phoneNumber ?? ''),
        date_of_birth: dob || undefined,
        gender: genderToBackend(gender),
        chronic_conditions: conditionsToBackend(selectedConditions),
      });
    } catch (requestError) {
      setApiError(getApiErrorMessage(requestError, 'Unable to create the account.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]}>
      {/* AppBar */}
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
          Create Account
        </AppText>
        <View style={styles.appBarSpacer} />
      </View>

      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: bottomBarHeight + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar step={2} total={2} />
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <AppText variant="headlineXlMobile" color={colors.onSurface}>
            Health Profile
          </AppText>
          <AppText variant="bodyMd" color={colors.onSurfaceVariant} style={styles.heroSub}>
            Help us personalize your experience.
          </AppText>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Gender */}
          <View style={styles.fieldGroup}>
            <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.fieldLabel}>
              Gender
            </AppText>
            <SegmentedControl
              options={['Male', 'Female', 'Other']}
              value={gender}
              onChange={setGender}
            />
          </View>

          {/* Date of Birth */}
          <SelectField
            label="Date of Birth"
            value={dobDisplay}
            placeholder="DD / MM / YYYY"
            onPress={() => setShowDobPicker(true)}
          />

          {/* Height + Weight */}
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

          {/* Blood Type */}
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
                  borderBottomWidth: 2,
                  borderBottomColor: colors.outlineVariant,
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                },
              ]}
            >
              <AppText
                variant="bodyMd"
                color={bloodType ? colors.onSurface : colors.outline}
                style={styles.pickerText}
              >
                {bloodType || 'Select Blood Type'}
              </AppText>
              <Ionicons name="chevron-down" size={20} color={colors.onSurfaceVariant} />
            </TouchableOpacity>
          </View>

          {/* Hospital */}
          <AppInput
            label="Primary Hospital Name"
            variant="underlined"
            placeholder="e.g. City Medical Center"
            value={hospital}
            onChangeText={setHospital}
          />

          {/* Medical Conditions */}
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
            </View>
          </View>
        </View>
      </KeyboardAwareScrollViewCompat>

      {/* Fixed Bottom Bar */}
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
        <AppButton
          title={submitting ? 'Creating Account...' : 'Create Account'}
          variant="brand"
          onPress={handleCreateAccount}
          loading={submitting}
          style={styles.createBtn}
        />
        {apiError && (
          <AppText variant="bodySm" color={colors.errorColor} style={styles.apiError}>
            {apiError}
          </AppText>
        )}
        <AppText variant="labelMd" color={colors.onSurfaceVariant} style={styles.privacyText}>
          By tapping "Create Account" you agree to our{' '}
          <AppText variant="labelMd" color={colors.actionBlue} style={styles.privacyLink}>
            Health Privacy Policy
          </AppText>
          .
        </AppText>
      </View>

      {/* Blood Type Picker Modal */}
      <Modal
        visible={showBloodTypePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBloodTypePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowBloodTypePicker(false)}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceCard,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
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
                      backgroundColor: selected
                        ? colors.actionBlueSoft
                        : colors.surfaceContainerLow,
                      borderColor: selected
                        ? colors.actionBlue
                        : 'transparent',
                    },
                  ]}
                >
                  <AppText
                    variant="headlineMd"
                    color={selected ? colors.actionBlue : colors.onSurface}
                    style={styles.bloodTypeLabel}
                  >
                    {item}
                  </AppText>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>

      <Modal
        visible={showDobPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDobPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowDobPicker(false)}
        />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceCard,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
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
                  style={[
                    styles.dateOption,
                    { backgroundColor: item === draftDay ? colors.actionBlueSoft : 'transparent' },
                  ]}
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
                    style={[
                      styles.dateOption,
                      { backgroundColor: month === draftMonth ? colors.actionBlueSoft : 'transparent' },
                    ]}
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
                  style={[
                    styles.dateOption,
                    { backgroundColor: item === draftYear ? colors.actionBlueSoft : 'transparent' },
                  ]}
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
  appBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.safeMargin,
    paddingBottom: 12,
  },
  backBtn: {
    marginRight: spacing.stackMd,
    padding: 4,
    marginBottom: -4,
  },
  appBarSpacer: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: spacing.safeMargin,
  },
  progressSection: {
    marginTop: spacing.stackLg,
    marginBottom: spacing.stackLg,
  },
  hero: {
    marginBottom: spacing.stackLg,
  },
  heroSub: {
    marginTop: 4,
  },
  form: {
    gap: spacing.stackLg,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    paddingLeft: 2,
  },
  twoCol: {
    flexDirection: 'row',
    gap: spacing.gutter,
  },
  colField: { flex: 1 },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
  },
  pickerText: {
    flex: 1,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  conditionsGroup: {
    gap: spacing.stackMd,
  },
  conditionsSub: {
    marginTop: 4,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.safeMargin,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  createBtn: {
    width: '100%',
  },
  apiError: {
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
  },
  privacyText: {
    textAlign: 'center',
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 11,
  },
  privacyLink: {
    textTransform: 'none',
    letterSpacing: 0,
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
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
  sheetTitle: {
    marginBottom: 16,
  },
  bloodTypeRow: {
    gap: 12,
    marginBottom: 12,
  },
  bloodTypeOption: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  bloodTypeLabel: {
    fontSize: 20,
  },
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
  datePickerRow: {
    flexDirection: 'row',
    gap: 8,
    height: 220,
  },
  dateColumn: {
    flex: 1,
  },
  dateOption: {
    minHeight: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  dateSaveBtn: {
    marginTop: 16,
  },
});
