import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  FamilyKarmaMapPanel,
  GlowCard,
  Screen,
  SignInRequiredPanel,
} from '../components';
import {
  FAMILY_COMPARISON_MAX_KUNDLIS,
  FAMILY_COMPARISON_MIN_KUNDLIS,
  composeFamilyKarmaMap,
  evaluateFamilyComparisonEligibility,
  getFamilyComparisonEligibilityMessage,
} from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { listSavedKundlis } from '../services/kundli/kundliRepository';
import { useAppStore } from '../store/useAppStore';
import type {
  FamilyRelationshipLabel,
  SavedKundliRecord,
} from '../types/astrology';

const relationshipLabels: FamilyRelationshipLabel[] = [
  'self',
  'spouse',
  'partner',
  'mother',
  'father',
  'son',
  'daughter',
  'brother',
  'sister',
  'cousin',
  'friend',
  'co-worker',
  'other',
];

export function FamilyKarmaMapScreen({
  navigation,
}: RootScreenProps<typeof routes.FamilyKarmaMap>): React.JSX.Element {
  const [records, setRecords] = useState<SavedKundliRecord[]>([]);
  const [relationshipById, setRelationshipById] = useState<
    Record<string, FamilyRelationshipLabel>
  >({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const activeKundli = useAppStore(state => state.activeKundli);
  const auth = useAppStore(state => state.auth);
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );

  useEffect(() => {
    listSavedKundlis()
      .then(saved => {
        const merged = activeKundli
          ? [
              {
                kundliData: activeKundli,
                summary: {
                  birthDate: activeKundli.birthDetails.date,
                  birthPlace: activeKundli.birthDetails.place,
                  birthTime: activeKundli.birthDetails.time,
                  createdAt: activeKundli.calculationMeta.calculatedAt,
                  id: activeKundli.id,
                  lagna: activeKundli.lagna,
                  moonSign: activeKundli.moonSign,
                  nakshatra: activeKundli.nakshatra,
                  name: activeKundli.birthDetails.name,
                  syncStatus: 'LOCAL_ONLY' as const,
                  updatedAt: activeKundli.calculationMeta.calculatedAt,
                },
              },
              ...saved.filter(item => item.summary.id !== activeKundli.id),
            ]
          : saved;
        setRecords(merged);
        setRelationshipById(current => ({
          ...Object.fromEntries(
            merged.map((record, index) => [
              record.summary.id,
              current[record.summary.id] ?? (index === 0 ? 'self' : 'other'),
            ]),
          ),
        }));
        setSelectedIds(current => {
          const valid = current.filter(id =>
            merged.some(record => record.summary.id === id),
          );
          if (valid.length >= FAMILY_COMPARISON_MIN_KUNDLIS) {
            return valid.slice(0, FAMILY_COMPARISON_MAX_KUNDLIS);
          }
          return merged
            .slice(0, Math.min(FAMILY_COMPARISON_MIN_KUNDLIS, merged.length))
            .map(record => record.summary.id);
        });
      })
      .catch(() => undefined);
  }, [activeKundli]);

  const selectedRecords = useMemo(() => {
    const selectedSet = new Set(selectedIds);
    return records.filter(record => selectedSet.has(record.summary.id));
  }, [records, selectedIds]);
  const familyEligibility = evaluateFamilyComparisonEligibility(selectedRecords.length);
  const familyEligibilityMessage =
    getFamilyComparisonEligibilityMessage(familyEligibility);
  const familyMap = useMemo(
    () =>
      composeFamilyKarmaMap(
        selectedRecords.map((record, index) => ({
          kundli: record.kundliData,
          relationship:
            relationshipById[record.summary.id] ?? (index === 0 ? 'self' : 'other'),
        })),
      ),
    [relationshipById, selectedRecords],
  );

  function askFamilyMap() {
    if (!auth.isLoggedIn) {
      navigation.navigate(routes.Login);
      return;
    }

    const mapKundli = activeKundli ?? records[0]?.kundliData;

    if (mapKundli) {
      setActiveKundli(mapKundli);
    }

    setActiveChartContext({
      kundliId: mapKundli?.id,
      selectedFamilyKarmaMap: true,
      selectedFamilyMemberCount: selectedRecords.length,
      selectedSection: familyMap.askPrompt,
      sourceScreen: 'Family Karma Map',
    });
    navigation.navigate(routes.Chat);
  }

  function useProfile(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
  }

  function toggleSelection(recordId: string): void {
    setSelectedIds(current => {
      if (current.includes(recordId)) {
        return current.filter(id => id !== recordId);
      }

      if (current.length >= FAMILY_COMPARISON_MAX_KUNDLIS) {
        return current;
      }

      return [...current, recordId];
    });
  }

  function askProfile(record: SavedKundliRecord) {
    if (!auth.isLoggedIn) {
      navigation.navigate(routes.Login);
      return;
    }

    setActiveKundli(record.kundliData);
    setActiveChartContext({
      kundliId: record.summary.id,
      purpose: 'family',
      selectedSection: `Use ${record.summary.name}'s saved Kundli as the active family profile and explain the best next family-focused reading for this profile.`,
      sourceScreen: 'Family Profile',
    });
    navigation.navigate(routes.Chat);
  }

  if (!auth.isLoggedIn) {
    return (
      <Screen>
        <SignInRequiredPanel
          body="Sign in before using Family Vault so family profiles, comparisons, and shared patterns stay private."
          navigation={navigation}
          title="Sign in to open Family Vault."
        />
      </Screen>
    );
  }

  function setRelationship(
    recordId: string,
    relationship: FamilyRelationshipLabel,
  ) {
    setRelationshipById(current => ({
      ...current,
      [recordId]: relationship,
    }));
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="FAMILY KARMA MAP" title="Household patterns" />
      <AppText className="mt-4" tone="secondary">
        Select relationship labels for saved kundlis. Predicta looks for
        repeated patterns and support zones without blaming anyone.
      </AppText>
      <GlowCard className="mt-5">
        <AppText variant="subtitle">
          {selectedRecords.length} selected for Family Vault comparison
        </AppText>
        <AppText className="mt-2" tone="secondary">
          {familyEligibilityMessage}
        </AppText>
      </GlowCard>

      <View className="mt-7 gap-4">
        {records.length ? (
          records.map((record, index) => (
            <RelationshipLabelPicker
              key={record.summary.id}
              active={record.summary.id === activeKundli?.id}
              comparisonLocked={
                !selectedIds.includes(record.summary.id) &&
                selectedIds.length >= FAMILY_COMPARISON_MAX_KUNDLIS
              }
              included={selectedIds.includes(record.summary.id)}
              onAskProfile={() => askProfile(record)}
              onSelect={label => setRelationship(record.summary.id, label)}
              onToggleIncluded={() => toggleSelection(record.summary.id)}
              onUseProfile={() => useProfile(record)}
              record={record}
              selected={
                relationshipById[record.summary.id] ??
                (index === 0 ? 'self' : 'other')
              }
            />
          ))
        ) : (
          <GlowCard>
            <AppText variant="subtitle">No saved family profiles yet</AppText>
            <AppText className="mt-2" tone="secondary">
              Create or save kundlis to start mapping repeated family themes.
            </AppText>
          </GlowCard>
        )}
      </View>

      <View className="mt-7">
        <FamilyKarmaMapPanel
          map={familyMap}
          onAskMap={
            familyEligibility.allowed && familyMap.status === 'ready'
              ? askFamilyMap
              : undefined
          }
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>
    </Screen>
  );
}

function RelationshipLabelPicker({
  active,
  comparisonLocked,
  included,
  onAskProfile,
  onSelect,
  onToggleIncluded,
  onUseProfile,
  record,
  selected,
}: {
  active: boolean;
  comparisonLocked: boolean;
  included: boolean;
  onAskProfile: () => void;
  onSelect: (label: FamilyRelationshipLabel) => void;
  onToggleIncluded: () => void;
  onUseProfile: () => void;
  record: SavedKundliRecord;
  selected: FamilyRelationshipLabel;
}): React.JSX.Element {
  return (
    <GlowCard>
      <AppText tone="secondary" variant="caption">
        {active ? 'ACTIVE PROFILE' : 'SAVED PROFILE'}
      </AppText>
      <AppText variant="subtitle">{record.summary.name}</AppText>
      <AppText className="mt-1" tone="secondary" variant="caption">
        {record.summary.moonSign} Moon · {record.summary.nakshatra}
      </AppText>
      <Pressable
        accessibilityRole="button"
        className={`mt-4 rounded-full border px-4 py-3 ${
          included
            ? 'border-[#4DAFFF] bg-[#172233]'
            : 'border-[#252533] bg-[#191923]'
        } ${comparisonLocked ? 'opacity-60' : ''}`}
        disabled={comparisonLocked}
        onPress={onToggleIncluded}
      >
        <AppText variant="caption">
          {included
            ? 'Included in comparison'
            : comparisonLocked
              ? 'Limit is 4 Kundlis'
              : 'Include in comparison'}
        </AppText>
      </Pressable>
      <View className="mt-4 flex-row flex-wrap gap-2">
        {relationshipLabels.map(label => (
          <Pressable
            accessibilityRole="button"
            className={`rounded-full border px-3 py-2 ${
              selected === label
                ? 'border-[#4DAFFF] bg-[#172233]'
                : 'border-[#252533] bg-[#191923]'
            }`}
            key={label}
            onPress={() => onSelect(label)}
          >
            <AppText variant="caption">{formatLabel(label)}</AppText>
          </Pressable>
        ))}
      </View>
      <View className="mt-4 flex-row flex-wrap gap-3">
        {!active ? (
          <Pressable
            accessibilityRole="button"
            className="rounded-full border border-[#252533] bg-[#191923] px-4 py-3"
            onPress={onUseProfile}
          >
            <AppText variant="caption">Use as active</AppText>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          className="rounded-full border border-[#4DAFFF] bg-[#172233] px-4 py-3"
          onPress={onAskProfile}
        >
          <AppText variant="caption">Ask Predicta</AppText>
        </Pressable>
      </View>
    </GlowCard>
  );
}

function formatLabel(label: string): string {
  return label
    .split('-')
    .map(part => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');
}
