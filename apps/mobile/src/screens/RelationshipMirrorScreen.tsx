import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  GlowCard,
  RelationshipMirrorPanel,
  Screen,
} from '../components';
import { composeRelationshipMirror } from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { listSavedKundlis } from '../services/kundli/kundliRepository';
import { useAppStore } from '../store/useAppStore';
import type { SavedKundliRecord } from '../types/astrology';

export function RelationshipMirrorScreen({
  navigation,
}: RootScreenProps<typeof routes.RelationshipMirror>): React.JSX.Element {
  const [records, setRecords] = useState<SavedKundliRecord[]>([]);
  const [firstId, setFirstId] = useState<string | undefined>();
  const [secondId, setSecondId] = useState<string | undefined>();
  const activeKundli = useAppStore(state => state.activeKundli);
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
        setFirstId(current => current ?? merged[0]?.summary.id);
        setSecondId(current => current ?? merged[1]?.summary.id);
      })
      .catch(() => undefined);
  }, [activeKundli]);

  const first = records.find(record => record.summary.id === firstId)?.kundliData;
  const second = records.find(record => record.summary.id === secondId)?.kundliData;
  const mirror = useMemo(
    () => composeRelationshipMirror(first, second),
    [first, second],
  );

  function askMirror() {
    setActiveChartContext({
      selectedRelationshipMirror: true,
      selectedRelationshipNames: `${mirror.firstName} + ${mirror.secondName}`,
      selectedSection: mirror.askPrompt,
      sourceScreen: 'Relationship Mirror',
    });
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="RELATIONSHIP MIRROR" title="Two-chart mirror" />
      <AppText className="mt-4" tone="secondary">
        Select two saved kundlis. Predicta compares patterns, not fate.
      </AppText>

      <View className="mt-7 gap-4">
        <ProfilePicker
          label="First person"
          records={records}
          selectedId={firstId}
          onSelect={setFirstId}
        />
        <ProfilePicker
          label="Second person"
          records={records.filter(record => record.summary.id !== firstId)}
          selectedId={secondId}
          onSelect={setSecondId}
        />
      </View>

      <View className="mt-7">
        <RelationshipMirrorPanel
          mirror={mirror}
          onAskMirror={mirror.status === 'ready' ? askMirror : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
        />
      </View>
    </Screen>
  );
}

function ProfilePicker({
  label,
  onSelect,
  records,
  selectedId,
}: {
  label: string;
  onSelect: (id: string) => void;
  records: SavedKundliRecord[];
  selectedId?: string;
}): React.JSX.Element {
  return (
    <GlowCard>
      <AppText tone="secondary" variant="caption">
        {label}
      </AppText>
      <View className="mt-3 gap-3">
        {records.length ? (
          records.map(record => (
            <Pressable
              accessibilityRole="button"
              className={`rounded-xl border p-3 ${
                selectedId === record.summary.id
                  ? 'border-[#4DAFFF] bg-[#172233]'
                  : 'border-[#252533] bg-[#191923]'
              }`}
              key={record.summary.id}
              onPress={() => onSelect(record.summary.id)}
            >
              <AppText variant="subtitle">{record.summary.name}</AppText>
              <AppText className="mt-1" tone="secondary" variant="caption">
                {record.summary.moonSign} Moon · {record.summary.nakshatra}
              </AppText>
            </Pressable>
          ))
        ) : (
          <AppText tone="secondary">
            Save another kundli to compare this relationship.
          </AppText>
        )}
      </View>
    </GlowCard>
  );
}
