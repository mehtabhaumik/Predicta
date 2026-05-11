import React, { useState } from 'react';
import { TextInput, View } from 'react-native';

import {
  AnimatedHeader,
  AppText,
  DecisionMemoCard,
  GlowButton,
  Screen,
} from '../components';
import {
  composeDecisionMemo,
  composeHolisticDecisionTimingSynthesis,
} from '@pridicta/astrology';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { DecisionMemo, HolisticDecisionTimingSynthesis } from '../types/astrology';

const examples = [
  'Should I change jobs in the next 3 months?',
  'Should I move abroad this year?',
  'Is this a good time to commit to marriage?',
];

export function DecisionOracleScreen({
  navigation,
}: RootScreenProps<typeof routes.DecisionOracle>): React.JSX.Element {
  const [question, setQuestion] = useState('');
  const [memo, setMemo] = useState<DecisionMemo | undefined>();
  const [synthesis, setSynthesis] = useState<
    HolisticDecisionTimingSynthesis | undefined
  >();
  const kundli = useAppStore(state => state.activeKundli);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );

  function runOracle(nextQuestion = question) {
    const cleanQuestion = nextQuestion.trim();

    if (!cleanQuestion) {
      return;
    }

    setQuestion(cleanQuestion);
    setMemo(composeDecisionMemo({ kundli, question: cleanQuestion }));
    setSynthesis(
      composeHolisticDecisionTimingSynthesis({
        kundli,
        question: cleanQuestion,
      }),
    );
  }

  function askFromMemo(nextMemo: DecisionMemo) {
    setActiveChartContext({
      selectedDecisionArea: nextMemo.area,
      selectedDecisionQuestion: nextMemo.question,
      selectedDecisionState: nextMemo.state,
      selectedSection: nextMemo.aiPrompt,
      sourceScreen: 'Decision Oracle',
    });
    navigation.navigate(routes.Chat);
  }

  return (
    <Screen>
      <AnimatedHeader eyebrow="DECISION ORACLE" title="Decision memo" />

      <View className="mt-7 rounded-xl border border-[#252533] bg-[#12121A] p-4">
        <AppText variant="subtitle">What choice are you facing?</AppText>
        <AppText className="mt-2" tone="secondary">
          Ask one clear decision. Predicta will classify it, check chart timing,
          show risk, and give one next step.
        </AppText>
        <TextInput
          multiline
          onChangeText={setQuestion}
          placeholder="Example: Should I change jobs in the next 3 months?"
          placeholderTextColor={colors.secondaryText}
          textAlignVertical="top"
          value={question}
          className="mt-5 min-h-28 rounded-xl border border-[#252533] bg-[#0A0A0F] p-4 text-base text-text-primary"
        />
        <View className="mt-5">
          <GlowButton
            disabled={!question.trim()}
            label="Create Decision Memo"
            onPress={() => runOracle()}
          />
        </View>
      </View>

      <View className="mt-5 gap-3">
        {examples.map(example => (
          <GlowButton
            key={example}
            label={example}
            onPress={() => runOracle(example)}
          />
        ))}
      </View>

      {memo ? (
        <View className="mt-7">
          <DecisionMemoCard
            memo={memo}
            onAskMemo={kundli ? () => askFromMemo(memo) : undefined}
            synthesis={synthesis}
          />
        </View>
      ) : null}

      {!kundli ? (
        <View className="mt-5">
          <GlowButton
            label="Create Kundli First"
            onPress={() => navigation.navigate(routes.Kundli)}
          />
        </View>
      ) : null}
    </Screen>
  );
}
