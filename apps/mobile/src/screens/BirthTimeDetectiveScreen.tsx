import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';

import { AnimatedHeader, BirthTimeDetectivePanel, Screen } from '../components';
import {
  applyManualBirthTimeEstimate,
  composeBirthTimeDetective,
  estimateManualBirthTimeRectification,
  MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS,
  type ManualBirthTimeRectificationAnswer,
} from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { generateKundli } from '../services/astrology/astroEngine';
import { saveGeneratedKundliLocally } from '../services/kundli/kundliRepository';
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
  const [applying, setApplying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const setSavedKundlis = useAppStore(state => state.setSavedKundlis);
  const report = useMemo(
    () => composeBirthTimeDetective(kundli, answers),
    [answers, kundli],
  );
  const rectificationAnswers = useMemo(
    () =>
      report.questions.reduce<
        Record<string, ManualBirthTimeRectificationAnswer | undefined>
      >((result, question) => {
        const answer = answers[question.id]?.answer;
        result[question.id] =
          answer === 'yes' || answer === 'no' ? answer : undefined;
        return result;
      }, {}),
    [answers, report.questions],
  );
  const rectificationEstimate = useMemo(
    () =>
      kundli
        ? estimateManualBirthTimeRectification({
            answers: rectificationAnswers,
            birthDetails: kundli.birthDetails,
          })
        : undefined,
    [kundli, rectificationAnswers],
  );
  const isEstimateComplete =
    report.questions.length > 0 &&
    report.answeredCount === MANUAL_BIRTH_TIME_RECTIFICATION_QUESTIONS.length;

  useEffect(() => {
    loadBirthTimeAnswers(kundli?.id)
      .then(setAnswers)
      .catch(() => setAnswers({}));
  }, [kundli?.id]);

  async function saveAnswer(
    question: BirthTimeQuestion,
    answer: ManualBirthTimeRectificationAnswer,
  ) {
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
    setStatusMessage('');
  }

  async function keepEnteredTime() {
    if (!kundli) {
      navigation.navigate(routes.Kundli);
      return;
    }

    const enteredTime =
      kundli.birthDetails.originalTime ?? kundli.birthDetails.time;
    const finalDetails = {
      ...kundli.birthDetails,
      isTimeApproximate: false,
      originalTime: undefined,
      rectificationMethod: undefined,
      rectifiedAt: undefined,
      time: enteredTime,
      timeConfidence: 'entered' as const,
    };

    try {
      setApplying(true);
      setStatusMessage('Confirming the entered birth time...');
      const nextKundli =
        enteredTime !== kundli.birthDetails.time
          ? {
              ...(await generateKundli(finalDetails, { ignoreCache: true })),
              birthDetails: finalDetails,
            }
          : {
              ...kundli,
              birthDetails: finalDetails,
            };
      setActiveKundli(nextKundli);
      const saved = await saveGeneratedKundliLocally(nextKundli);
      setSavedKundlis(saved);
      setStatusMessage(
        `Entered birth time ${enteredTime} is now confirmed for this Kundli.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'The confirmation failed. Please try again shortly.',
      );
    } finally {
      setApplying(false);
    }
  }

  async function useProbableTime() {
    if (!kundli || !rectificationEstimate || !isEstimateComplete) {
      return;
    }

    try {
      setApplying(true);
      setStatusMessage('Recalculating the Kundli with the probable rectified time...');
      const finalDetails = applyManualBirthTimeEstimate(
        kundli.birthDetails,
        rectificationEstimate,
      );
      const generated = await generateKundli(finalDetails, { ignoreCache: true });
      const nextKundli = {
        ...generated,
        birthDetails: {
          ...generated.birthDetails,
          ...finalDetails,
        },
      };
      setActiveKundli(nextKundli);
      const saved = await saveGeneratedKundliLocally(nextKundli);
      setSavedKundlis(saved);
      setStatusMessage(
        `Kundli recalculated with probable rectified time ${nextKundli.birthDetails.time}. Original entered time: ${
          nextKundli.birthDetails.originalTime ?? kundli.birthDetails.time
        }.`,
      );
    } catch (error) {
      setStatusMessage(
        error instanceof Error
          ? error.message
          : 'The recalculation failed. Please verify the birth details and try again.',
      );
    } finally {
      setApplying(false);
    }
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
          applying={applying}
          isEstimateComplete={isEstimateComplete}
          onAskDetective={kundli ? askDetective : undefined}
          onCreateKundli={() => navigation.navigate(routes.Kundli)}
          onKeepEnteredTime={kundli ? keepEnteredTime : undefined}
          onSaveAnswer={saveAnswer}
          onUseProbableTime={useProbableTime}
          rectificationEstimate={kundli ? rectificationEstimate : undefined}
          report={report}
          statusMessage={statusMessage}
        />
      </View>
    </Screen>
  );
}
