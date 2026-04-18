import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

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
    <View className="gap-5">
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
        className="flex-row items-center gap-3"
        onPress={() => setIsTimeApproximate(value => !value)}
      >
        <View
          className={`h-5 w-5 rounded border ${
            isTimeApproximate ? 'bg-[#7B61FF]' : 'bg-transparent'
          }`}
          style={{ borderColor: colors.borderGlow }}
        />
        <AppText tone="secondary">Birth time is approximate</AppText>
      </Pressable>

      {resolvedPlace ? (
        <GlowCard delay={80}>
          <AppText variant="subtitle">Resolved birth place</AppText>
          <AppText className="mt-2" tone="secondary">
            {formatResolvedPlace(resolvedPlace)}
          </AppText>
          <AppText tone="secondary">Timezone: {resolvedPlace.timezone}</AppText>
          {isTimeApproximate ? (
            <AppText className="mt-2" tone="secondary">
              Approximate time will be marked across chart, chat, and PDF.
            </AppText>
          ) : null}

          <Pressable
            accessibilityRole="button"
            className="mt-4"
            onPress={() => setShowCalculationDetails(value => !value)}
          >
            <AppText variant="caption">
              {showCalculationDetails
                ? 'Hide calculation details'
                : 'Show calculation details'}
            </AppText>
          </Pressable>

          {showCalculationDetails ? (
            <AppText className="mt-2" tone="secondary" variant="caption">
              {resolvedPlace.latitude}, {resolvedPlace.longitude} •{' '}
              {resolvedPlace.source}
            </AppText>
          ) : null}
        </GlowCard>
      ) : (
        <AppText tone="secondary">
          Choose country, state or province, and city so Pridicta can resolve
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
    <View>
      <AppText className="mb-2" tone="secondary" variant="caption">
        {label}
      </AppText>
      <TextInput
        className="h-14 rounded-lg border border-[#252533] px-4 text-base text-text-primary"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.secondaryText}
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
    <View>
      <AppText className="mb-2" tone="secondary" variant="caption">
        {label}
      </AppText>
      <View
        className={`rounded-xl border p-4 ${
          disabled ? 'opacity-50' : 'opacity-100'
        }`}
        style={{ borderColor: colors.border }}
      >
        <AppText tone={value ? 'primary' : 'secondary'}>
          {value || placeholder}
        </AppText>
        {!disabled && options.length > 0 ? (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {options.map(option => (
              <Pressable
                accessibilityRole="button"
                className={`rounded-lg border px-3 py-2 ${
                  option === value ? 'bg-[#252533]' : 'bg-transparent'
                }`}
                key={option}
                onPress={() => onSelect(option)}
                style={{ borderColor: colors.borderGlow }}
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
