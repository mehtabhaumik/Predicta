import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import {
  buildBirthDetailsFromResolvedPlace,
  listCitiesForState,
  listCountries,
  listStatesForCountry,
  resolveBirthPlace,
} from '../../services/location/locationService';
import { colors } from '../../theme/colors';
import type {
  BirthDetails,
  BirthDetailsDraft,
  ResolvedBirthPlace,
} from '../../types/astrology';
import { AppText } from '../AppText';
import { GlowCard } from '../GlowCard';

type BirthDetailsFormProps = {
  initialDraft?: BirthDetailsDraft;
  onChange: (birthDetails: BirthDetails | null) => void;
};

export function BirthDetailsForm({
  initialDraft,
  onChange,
}: BirthDetailsFormProps): React.JSX.Element {
  const [name, setName] = useState(initialDraft?.name ?? '');
  const [date, setDate] = useState(initialDraft?.date ?? '');
  const [time, setTime] = useState(initialDraft?.time ?? '');
  const [isTimeApproximate, setIsTimeApproximate] = useState(
    Boolean(initialDraft?.isTimeApproximate),
  );
  const [country, setCountry] = useState(initialDraft?.country ?? '');
  const [state, setState] = useState(initialDraft?.state ?? '');
  const [city, setCity] = useState(initialDraft?.city ?? '');
  const [showCalculationDetails, setShowCalculationDetails] = useState(false);

  const countries = useMemo(() => listCountries(), []);
  const states = useMemo(() => listStatesForCountry(country), [country]);
  const cities = useMemo(
    () => listCitiesForState(country, state),
    [country, state],
  );
  const resolvedPlace = useMemo(
    () => resolveBirthPlace({ city, country, state }),
    [city, country, state],
  );

  useEffect(() => {
    if (!resolvedPlace || !name.trim() || !date.trim() || !time.trim()) {
      onChange(null);
      return;
    }

    onChange(
      buildBirthDetailsFromResolvedPlace({
        date: date.trim(),
        isTimeApproximate,
        name: name.trim(),
        originalPlaceText: initialDraft?.placeText,
        resolvedPlace,
        time: time.trim(),
      }),
    );
  }, [
    date,
    initialDraft?.placeText,
    isTimeApproximate,
    name,
    onChange,
    resolvedPlace,
    time,
  ]);

  function chooseCountry(nextCountry: string) {
    setCountry(nextCountry);
    setState('');
    setCity('');
  }

  function chooseState(nextState: string) {
    setState(nextState);
    setCity('');
  }

  return (
    <View style={styles.formStack}>
      <Input
        label="Name"
        onChangeText={setName}
        placeholder="Enter full name"
        value={name}
      />
      <Input
        label="Date of birth"
        onChangeText={setDate}
        placeholder="YYYY-MM-DD"
        value={date}
      />
      <Input
        label="Birth time"
        onChangeText={setTime}
        placeholder="HH:mm, 24-hour"
        value={time}
      />

      <Selector
        label="Country"
        onSelect={chooseCountry}
        options={countries}
        placeholder="Select country"
        value={country}
      />
      <Selector
        disabled={!country}
        label="State / province"
        onSelect={chooseState}
        options={states}
        placeholder="Select state or province"
        value={state}
      />
      <Selector
        disabled={!country || !state}
        label="City"
        onSelect={setCity}
        options={cities}
        placeholder="Select city"
        value={city}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsTimeApproximate(value => !value)}
        style={styles.approximateRow}
      >
        <View
          style={[
            styles.checkbox,
            isTimeApproximate ? styles.checkboxChecked : undefined,
          ]}
        />
        <AppText tone="secondary">Birth time is approximate</AppText>
      </Pressable>

      {resolvedPlace ? (
        <GlowCard delay={80}>
          <AppText variant="subtitle">Resolved birth place</AppText>
          <AppText style={styles.helperText} tone="secondary">
            {formatResolvedPlace(resolvedPlace)}
          </AppText>
          <AppText tone="secondary">Timezone: {resolvedPlace.timezone}</AppText>
          {isTimeApproximate ? (
            <AppText style={styles.helperText} tone="secondary">
              Approximate time will be marked across chart, chat, and PDF.
            </AppText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={() => setShowCalculationDetails(value => !value)}
            style={styles.detailsButton}
          >
            <AppText variant="caption">
              {showCalculationDetails
                ? 'Hide calculation details'
                : 'Show calculation details'}
            </AppText>
          </Pressable>

          {showCalculationDetails ? (
            <AppText style={styles.helperText} tone="secondary" variant="caption">
              {resolvedPlace.latitude}, {resolvedPlace.longitude} •{' '}
              {resolvedPlace.source}
            </AppText>
          ) : null}
        </GlowCard>
      ) : (
        <AppText tone="secondary">
          Choose country, state or province, and city so Predicta can resolve
          the correct timezone internally.
        </AppText>
      )}
    </View>
  );
}

function Input({
  label,
  onChangeText,
  placeholder,
  value,
}: {
  label: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <AppText style={styles.label} tone="secondary" variant="caption">
        {label}
      </AppText>
      <TextInput
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
        style={styles.input}
        value={value}
      />
    </View>
  );
}

function Selector({
  disabled = false,
  label,
  onSelect,
  options,
  placeholder,
  value,
}: {
  disabled?: boolean;
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <AppText style={styles.label} tone="secondary" variant="caption">
        {label}
      </AppText>
      <View
        style={[styles.selector, disabled ? styles.selectorDisabled : undefined]}
      >
        <AppText tone={value ? 'primary' : 'secondary'}>
          {value || placeholder}
        </AppText>
        {!disabled && options.length > 0 ? (
          <View style={styles.optionWrap}>
            {options.map(option => (
              <Pressable
                accessibilityRole="button"
                key={option}
                onPress={() => onSelect(option)}
                style={[
                  styles.optionChip,
                  option === value ? styles.optionChipSelected : undefined,
                ]}
              >
                <AppText variant="caption">{option}</AppText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function formatResolvedPlace(place: ResolvedBirthPlace): string {
  return [place.city, place.state, place.country].filter(Boolean).join(', ');
}

const styles = StyleSheet.create({
  approximateRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  checkbox: {
    borderColor: colors.borderGlow,
    borderRadius: 6,
    borderWidth: 1,
    height: 20,
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: colors.gradient[0],
  },
  detailsButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  fieldBlock: {
    gap: 10,
  },
  formStack: {
    gap: 22,
  },
  helperText: {
    marginTop: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderColor: colors.borderSoft,
    borderRadius: 14,
    borderWidth: 1,
    color: colors.primaryText,
    fontSize: 16,
    minHeight: 56,
    paddingHorizontal: 16,
  },
  label: {
    textTransform: 'uppercase',
  },
  optionChip: {
    borderColor: colors.borderGlow,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  optionChipSelected: {
    backgroundColor: colors.glassWash,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  selector: {
    backgroundColor: 'rgba(255,255,255,0.045)',
    borderColor: colors.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  selectorDisabled: {
    opacity: 0.52,
  },
});
