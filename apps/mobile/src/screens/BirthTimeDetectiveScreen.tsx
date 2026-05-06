import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { AnimatedHeader, BirthTimeDetectivePanel, Screen } from '../components';
import { composeBirthTimeDetective } from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  loadBirthTimeAnswers,
  saveBirthTimeAnswer,
  type BirthTimeAnswerMap,
} from '../services/rectification/birthTimeAnswerStorage';
import { useAppStore } from '../store/useAppStore';
import type { BirthTimeQuestion } from '../types/astrology';

export function BirthTimeDetectiveScreen({
  navigation,
}: RootScreenProps<typeof routes.BirthTimeDetective>): React.JSX.Element {
  const [answers, setAnswers] = useState<BirthTimeAnswerMap>({});
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const report = useMemo(
    () => composeBirthTimeDetective(kundli, answers),
    [answers, kundli],
  );

  useEffect(() => {
    loadBirthTimeAnswers(kundli?.id)
      .then(setAnswers)
      .catch(() => setAnswers({}));
  }, [kundli?.id]);

  async function saveAnswer(question: BirthTimeQuestion, answer: string) {
    if (!kundli) {
      navigation.navigate(routes.Kundli);
      return;
    }

    const next = await saveBirthTimeAnswer(
      kundli.id,
      answers,
      question.id,
      answer.trim(),
    );
    setAnswers(next);
  }

  function askDetective() {
    setActiveChartContext({
      selectedBirthTimeDetective: true,
      selectedSection: report.askPrompt,
      sourceScreen: 'Birth Time Detective',
    });
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="BIRTH TIME DETECTIVE" title="Confidence check" />
      <View className="mt-7">
        <BirthTimeDetectivePanel
          onAskDetective={kundli ? askDetective : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
          onSaveAnswer={saveAnswer}
          report={report}
        />
      </View>
    </Screen>
  );
}
