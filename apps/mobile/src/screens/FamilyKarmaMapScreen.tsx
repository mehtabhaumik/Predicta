import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  FamilyKarmaMapPanel,
  GlowCard,
  Screen,
} from '../components';
import { composeFamilyKarmaMap } from '@pridicta/astrology';
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
  'parent',
  'child',
  'sibling',
  'partner',
  'grandparent',
  'relative',
  'friend',
  'other',
];

export function FamilyKarmaMapScreen({
  navigation,
}: RootScreenProps<typeof routes.FamilyKarmaMap>): React.JSX.Element {
  const [records, setRecords] = useState<SavedKundliRecord[]>([]);
  const [relationshipById, setRelationshipById] = useState<
    Record<string, FamilyRelationshipLabel>
  >({});
  const activeKundli = useAppStore(state => state.activeKundli);
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
              current[record.summary.id] ?? (index === 0 ? 'self' : 'relative'),
            ]),
          ),
        }));
      })
      .catch(() => undefined);
  }, [activeKundli]);

  const familyMap = useMemo(
    () =>
      composeFamilyKarmaMap(
        records.map((record, index) => ({
          kundli: record.kundliData,
          relationship:
            relationshipById[record.summary.id] ?? (index === 0 ? 'self' : 'relative'),
        })),
      ),
    [records, relationshipById],
  );

  function askFamilyMap() {
    const mapKundli = activeKundli ?? records[0]?.kundliData;

    if (mapKundli) {
      setActiveKundli(mapKundli);
    }

    setActiveChartContext({
      kundliId: mapKundli?.id,
      selectedFamilyKarmaMap: true,
      selectedFamilyMemberCount: familyMap.members.length,
      selectedSection: familyMap.askPrompt,
      sourceScreen: 'Family Karma Map',
    });
    navigation.navigate(routes.Chat);
  }

  function useProfile(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
  }

  function askProfile(record: SavedKundliRecord) {
    setActiveKundli(record.kundliData);
    setActiveChartContext({
      kundliId: record.summary.id,
      purpose: 'family',
      selectedSection: `Use ${record.summary.name}'s saved Kundli as the active family profile and explain the best next family-focused reading for this profile.`,
      sourceScreen: 'Family Profile',
    });
    navigation.navigate(routes.Chat);
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

      <View className="mt-7 gap-4">
        {records.length ? (
          records.map((record, index) => (
            <RelationshipLabelPicker
              key={record.summary.id}
              active={record.summary.id === activeKundli?.id}
              onAskProfile={() => askProfile(record)}
              onSelect={label => setRelationship(record.summary.id, label)}
              onUseProfile={() => useProfile(record)}
              record={record}
              selected={
                relationshipById[record.summary.id] ??
                (index === 0 ? 'self' : 'relative')
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
          onAskMap={familyMap.status === 'ready' ? askFamilyMap : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>
    </Screen>
  );
}

function RelationshipLabelPicker({
  active,
  onAskProfile,
  onSelect,
  onUseProfile,
  record,
  selected,
}: {
  active: boolean;
  onAskProfile: () => void;
  onSelect: (label: FamilyRelationshipLabel) => void;
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
