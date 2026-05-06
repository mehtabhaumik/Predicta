import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import {
  AppText,
  FadeInView,
  GlowButton,
  GradientText,
  Screen,
} from '../components';
import { routes } from '../navigation/routes';
import type { RootScreenProps } from '../navigation/types';
import {
  buildPredictaActionReply,
  buildPredictaLearningSuggestion,
  learnPredictaInteraction,
  preparePredictaLanguageContext,
  type PredictaInteractionMemory,
} from '@pridicta/astrology';
import { detectIntent } from '@pridicta/ai';
import { buildBirthIntakeReply } from '@pridicta/config/predictaMemory';
import {
  getBirthExtractionFailureReply,
  getFriendlyGreetingReply,
  getListeningMicrocopy,
  isSimpleGreeting,
} from '@pridicta/config/predictaUx';
import { formatAskWithProof } from '@pridicta/config/proof';
import {
  getSafetyBoundaryCopy,
  hasHighStakesLanguage,
} from '@pridicta/config/trust';
import { extractBirthDetailsFromText } from '../services/ai/birthDetailsExtractor';
import { askPridicta } from '../services/ai/pridictaService';
import { generateKundli } from '../services/astrology/astroEngine';
import { playReplyChime } from '../services/audio/replyChime';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { syncRedeemedGuestPassToUser } from '../services/firebase/passCodePersistence';
import {
  listSavedKundlis,
  saveGeneratedKundliLocally,
} from '../services/kundli/kundliRepository';
import {
  buildBirthDetailsFromResolvedPlace,
  findBirthPlaceCandidates,
} from '../services/location/locationService';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type { ChatMessage, KundliData } from '../types/astrology';

const predictaLogo = require('../assets/predicta-logo.png');

function createMessage(
  role: ChatMessage['role'],
  text: string,
  context?: ChatMessage['context'],
): ChatMessage {
  return {
    context,
    createdAt: new Date().toISOString(),
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
  };
}

export function ChatScreen({
  navigation,
}: RootScreenProps<typeof routes.Chat>): React.JSX.Element {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [predictaMemory, setPredictaMemory] =
    useState<PredictaInteractionMemory>();
  const [streamingText, setStreamingText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeChartContext = useAppStore(state => state.activeChartContext);
  const activeKundli = useAppStore(state => state.activeKundli);
  const auth = useAppStore(state => state.auth);
  const chatSoundEnabled = useAppStore(state => state.chatSoundEnabled);
  const languagePreference = useAppStore(state => state.languagePreference);
  const userPlan = useAppStore(state => state.userPlan);
  const pendingBirthDetailsDraft = useAppStore(
    state => state.pendingBirthDetailsDraft,
  );
  const setPendingBirthDetailsDraft = useAppStore(
    state => state.setPendingBirthDetailsDraft,
  );
  const clearPendingBirthDetailsDraft = useAppStore(
    state => state.clearPendingBirthDetailsDraft,
  );
  const setActiveKundli = useAppStore(state => state.setActiveKundli);
  const setSavedKundlis = useAppStore(state => state.setSavedKundlis);
  const appendConversationMessage = useAppStore(
    state => state.appendConversationMessage,
  );
  const canAskQuestion = useAppStore(state => state.canAskQuestion);
  const canUseDeepCall = useAppStore(state => state.canUseDeepCall);
  const consumeGuestDeepQuota = useAppStore(
    state => state.consumeGuestDeepQuota,
  );
  const consumeGuestQuestionQuota = useAppStore(
    state => state.consumeGuestQuestionQuota,
  );
  const getResolvedAccess = useAppStore(state => state.getResolvedAccess);
  const hasPaidQuestionCredits = useAppStore(
    state => state.hasPaidQuestionCredits,
  );
  const consumePaidQuestionCredit = useAppStore(
    state => state.consumePaidQuestionCredit,
  );
  const recordQuestion = useAppStore(state => state.recordQuestion);
  const recordDeepCall = useAppStore(state => state.recordDeepCall);
  const savedKundliRecords = useAppStore(state => state.savedKundlis);
  const messages = useAppStore(state =>
    state.activeKundliId
      ? state.conversationsByKundli[state.activeKundliId] ?? []
      : [],
  );
  const timelinePromptSeededRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const prompt = activeChartContext?.selectedTimelineEventId
      ? activeChartContext.selectedSection
      : activeChartContext?.selectedDailyBriefingDate
      ? activeChartContext.selectedSection
      : activeChartContext?.selectedDecisionQuestion
      ? activeChartContext.selectedSection
      : activeChartContext?.selectedRemedyId
      ? activeChartContext.selectedSection
      : activeChartContext?.selectedBirthTimeDetective
      ? activeChartContext.selectedSection
      : activeChartContext?.selectedRelationshipMirror
      ? activeChartContext.selectedSection
      : activeChartContext?.selectedFamilyKarmaMap
      ? activeChartContext.selectedSection
      : activeChartContext?.selectedPredictaWrapped
      ? activeChartContext.selectedSection
      : undefined;

    if (prompt && timelinePromptSeededRef.current !== prompt) {
      setInput(prompt);
      timelinePromptSeededRef.current = prompt;
    }
  }, [activeChartContext]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  function streamAssistantResponse(text: string) {
    let cursor = 0;

    setIsTyping(true);
    setStreamingText('');

    intervalRef.current = setInterval(() => {
      cursor += 2;
      const nextText = text.slice(0, cursor);
      setStreamingText(nextText);

      if (cursor >= text.length) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        appendConversationMessage(
          createMessage('pridicta', text, activeChartContext),
        );
        playReplyChime(chatSoundEnabled);
        setStreamingText('');
        setIsTyping(false);
      }
    }, 18);
  }

  async function sendMessage() {
    const trimmedInput = input.trim();

    if (!trimmedInput || isTyping) {
      return;
    }

    const languageContext = preparePredictaLanguageContext({
      memory: predictaMemory,
      selectedLanguage: languagePreference.language,
      text: trimmedInput,
    });
    const responseLanguage = languageContext.responseLanguage;

    if (isSimpleGreeting(trimmedInput)) {
      const savedKundlis = savedKundliRecords.map(record => record.kundliData);
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      streamAssistantResponse(
        [
          languageContext.acknowledgement,
          getFriendlyGreetingReply(responseLanguage),
          buildPredictaLearningSuggestion({
            kundli: activeKundli,
            language: responseLanguage,
            memory: predictaMemory,
            savedKundlis,
          }),
        ].join('\n\n'),
      );
      return;
    }

    if (!activeKundli) {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      setIsTyping(true);
      setStreamingText('');

      if (hasHighStakesLanguage(trimmedInput)) {
        streamAssistantResponse(
          `${getSafetyBoundaryCopy(
            responseLanguage,
          )}\n\nI am with you. Create your Kundli first if you want reflective timing support, but do not delay urgent or professional help.`,
        );
        return;
      }

      const actionReply = buildPredictaActionReply({
        kundli: undefined,
        language: languagePreference.language,
        memory: predictaMemory,
        savedKundlis: savedKundliRecords.map(record => record.kundliData),
        text: trimmedInput,
      });
      setPredictaMemory(actionReply.memory);

      if (actionReply.handled && actionReply.text) {
        streamAssistantResponse(actionReply.text);
        return;
      }

      try {
        const result = await extractBirthDetailsFromText(trimmedInput);
        const reply = buildBirthIntakeReply({
          language: responseLanguage,
          memory: { draft: pendingBirthDetailsDraft },
          rawInput: trimmedInput,
          result,
        });
        setPendingBirthDetailsDraft(reply.draft);

        if (!reply.isReady) {
          streamAssistantResponse(
            [languageContext.acknowledgement, reply.text]
              .filter(Boolean)
              .join('\n\n'),
          );
          return;
        }

        const placeQuery =
          [reply.draft.city, reply.draft.state, reply.draft.country]
            .filter(Boolean)
            .join(', ') ||
          reply.draft.placeText ||
          '';
        const places = await findBirthPlaceCandidates(placeQuery);

        if (places.length !== 1 || !reply.draft.date || !reply.draft.time) {
          streamAssistantResponse(
            buildMobilePlaceClarificationReply(
              responseLanguage,
              [languageContext.acknowledgement, reply.text]
                .filter(Boolean)
                .join('\n\n'),
              places,
            ),
          );
          return;
        }

        const birthDetails = buildBirthDetailsFromResolvedPlace({
          date: reply.draft.date,
          isTimeApproximate: reply.draft.isTimeApproximate,
          name: reply.draft.name?.trim() || 'Predicta Seeker',
          originalPlaceText: reply.draft.placeText,
          resolvedPlace: places[0],
          time: reply.draft.time,
        });
        const nextKundli = await generateKundli(birthDetails);

        setActiveKundli(nextKundli);
        clearPendingBirthDetailsDraft();
        const nextMemory = learnPredictaInteraction(
          predictaMemory,
          trimmedInput,
          'chart',
          nextKundli,
          responseLanguage,
        );
        setPredictaMemory(nextMemory);
        saveGeneratedKundliLocally(nextKundli)
          .then(setSavedKundlis)
          .catch(() =>
            listSavedKundlis()
              .then(setSavedKundlis)
              .catch(() => undefined),
          );
        streamAssistantResponse(
          [
            languageContext.acknowledgement,
            buildMobileKundliCreatedReply(responseLanguage, nextKundli),
            buildPredictaLearningSuggestion({
              kundli: nextKundli,
              language: responseLanguage,
              memory: nextMemory,
              savedKundlis: [nextKundli],
            }),
          ].join('\n\n'),
        );
      } catch {
        streamAssistantResponse(
          [
            languageContext.acknowledgement,
            getBirthExtractionFailureReply(responseLanguage),
          ]
            .filter(Boolean)
            .join('\n\n'),
        );
      }
      return;
    }

    const savedKundlis = savedKundliRecords.map(record => record.kundliData);
    const actionReply = buildPredictaActionReply({
      kundli: activeKundli,
      language: languagePreference.language,
      memory: predictaMemory,
      savedKundlis,
      text: trimmedInput,
    });
    setPredictaMemory(actionReply.memory);

    if (actionReply.handled && actionReply.text) {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      streamAssistantResponse(actionReply.text);
      return;
    }

    const freeQuestionAvailable = canAskQuestion();
    const paidQuestionAvailable = hasPaidQuestionCredits();

    if (!freeQuestionAvailable && !paidQuestionAvailable) {
      appendConversationMessage(
        createMessage(
          'pridicta',
          "You've reached today's guidance limit. Your reading is saved. You can continue tomorrow, add a few questions, or unlock more Pridicta guidance today.",
          activeChartContext,
        ),
      );
      trackAnalyticsEvent({
        eventName: 'limit_reached',
        metadata: { limit: 'questions' },
        userId: auth.userId,
      });
      navigation.navigate(routes.Paywall);
      return;
    }

    const history = messages.map(message => ({
      role: message.role,
      text: message.text,
    }));

    appendConversationMessage(
      createMessage('user', trimmedInput, activeChartContext),
    );
    setInput('');
    setIsTyping(true);
    setStreamingText('');

    try {
      const access = getResolvedAccess();
      const intent = detectIntent(trimmedInput, activeChartContext);
      const deepAllowed = intent !== 'deep' || canUseDeepCall();
      const effectivePlan =
        access.hasPremiumAccess && deepAllowed ? 'PREMIUM' : userPlan;
      const response = await askPridicta({
        chartContext: activeChartContext,
        history,
        kundli: activeKundli,
        language: responseLanguage,
        message: trimmedInput,
        userPlan: effectivePlan,
      });
      const nextMemory = learnPredictaInteraction(
        actionReply.memory,
        trimmedInput,
        undefined,
        activeKundli,
        responseLanguage,
      );
      setPredictaMemory(nextMemory);
      const answerText = hasHighStakesLanguage(trimmedInput)
        ? `${getSafetyBoundaryCopy(
            responseLanguage,
          )}\n\n${formatAskWithProof(response.text, response.jyotishAnalysis)}`
        : formatAskWithProof(response.text, response.jyotishAnalysis);

      if (!response.cached) {
        if (
          access.source === 'guest_pass' &&
          !access.hasUnrestrictedAppAccess
        ) {
          consumeGuestQuestionQuota();
          syncGuestPassUsage(auth.userId);
        } else if (!access.hasUnrestrictedAppAccess && freeQuestionAvailable) {
          recordQuestion();
        } else if (consumePaidQuestionCredit()) {
          trackAnalyticsEvent({
            eventName: 'question_pack_used',
            userId: auth.userId,
          });
        }

        if (response.usedDeepModel) {
          if (
            access.source === 'guest_pass' &&
            !access.hasUnrestrictedAppAccess
          ) {
            consumeGuestDeepQuota();
            syncGuestPassUsage(auth.userId);
          } else if (!access.hasUnrestrictedAppAccess) {
            recordDeepCall();
          }
        }
      }

      streamAssistantResponse(
        [
          languageContext.acknowledgement,
          answerText,
          buildPredictaLearningSuggestion({
            kundli: activeKundli,
            language: responseLanguage,
            memory: nextMemory,
            savedKundlis,
          }),
        ].join('\n\n'),
      );
    } catch (error) {
      streamAssistantResponse(
        error instanceof Error
          ? `I could not complete the reading because ${error.message}. Please try again with one focused question.`
          : 'I could not complete the reading right now. Please try again with one focused question.',
      );
    }
  }

  return (
    <Screen>
      <FadeInView className="flex-row items-center gap-4">
        <View style={styles.logoShell}>
          <Image
            accessibilityIgnoresInvertColors
            source={predictaLogo}
            style={styles.logo}
          />
        </View>
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            PRIVATE READING
          </AppText>
          <GradientText variant="title">Chat with Predicta</GradientText>
        </View>
      </FadeInView>

      {activeChartContext?.selectedTimelineEventTitle ? (
        <FadeInView className="mt-5 rounded-xl border border-[#252533] bg-[#12121A] p-4">
          <AppText tone="secondary" variant="caption">
            TIMELINE EVENT
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {activeChartContext.selectedTimelineEventTitle}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            {activeChartContext.selectedTimelineEventKind} ·{' '}
            {activeChartContext.selectedTimelineEventWindow}
          </AppText>
        </FadeInView>
      ) : null}

      {activeChartContext?.selectedDailyBriefingDate ? (
        <FadeInView className="mt-5 rounded-xl border border-[#252533] bg-[#12121A] p-4">
          <AppText tone="secondary" variant="caption">
            DAILY BRIEFING
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            Today's chart weather
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            {activeChartContext.selectedDailyBriefingDate}
          </AppText>
        </FadeInView>
      ) : null}

      {activeChartContext?.selectedDecisionQuestion ? (
        <FadeInView className="mt-5 rounded-xl border border-[#252533] bg-[#12121A] p-4">
          <AppText tone="secondary" variant="caption">
            DECISION ORACLE
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {activeChartContext.selectedDecisionArea} ·{' '}
            {activeChartContext.selectedDecisionState}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            {activeChartContext.selectedDecisionQuestion}
          </AppText>
        </FadeInView>
      ) : null}

      {activeChartContext?.selectedRemedyTitle ? (
        <FadeInView className="mt-5 rounded-xl border border-[#252533] bg-[#12121A] p-4">
          <AppText tone="secondary" variant="caption">
            REMEDY COACH
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {activeChartContext.selectedRemedyTitle}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            Practice explanation with chart proof
          </AppText>
        </FadeInView>
      ) : null}

      {activeChartContext?.selectedBirthTimeDetective ? (
        <FadeInView className="mt-5 rounded-xl border border-[#252533] bg-[#12121A] p-4">
          <AppText tone="secondary" variant="caption">
            BIRTH TIME DETECTIVE
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            Confidence and safe timing limits
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            Ask with no false precision
          </AppText>
        </FadeInView>
      ) : null}

      {activeChartContext?.selectedRelationshipMirror ? (
        <FadeInView className="mt-5 rounded-xl border border-[#252533] bg-[#12121A] p-4">
          <AppText tone="secondary" variant="caption">
            RELATIONSHIP MIRROR
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {activeChartContext.selectedRelationshipNames}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            Pattern comparison, not fate
          </AppText>
        </FadeInView>
      ) : null}

      {activeChartContext?.selectedFamilyKarmaMap ? (
        <FadeInView className="mt-5 rounded-xl border border-[#252533] bg-[#12121A] p-4">
          <AppText tone="secondary" variant="caption">
            FAMILY KARMA MAP
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {activeChartContext.selectedFamilyMemberCount ?? 0} family members
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            Repeated patterns, support zones, no blame
          </AppText>
        </FadeInView>
      ) : null}

      {activeChartContext?.selectedPredictaWrapped ? (
        <FadeInView className="mt-5 rounded-xl border border-[#252533] bg-[#12121A] p-4">
          <AppText tone="secondary" variant="caption">
            PREDICTA WRAPPED
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {activeChartContext.selectedPredictaWrappedYear} yearly recap
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            Share-safe recap, timing windows, next-year preview
          </AppText>
        </FadeInView>
      ) : null}

      <View className="mt-7 gap-4">
        {messages.map((message, index) => (
          <ChatBubble
            delay={180 + index * 70}
            key={message.id}
            message={message}
          />
        ))}

        {isTyping ? (
          <ChatBubble
            delay={80}
            message={{
              createdAt: new Date().toISOString(),
              context: activeChartContext,
              id: 'streaming',
              role: 'pridicta',
              text:
                streamingText ||
                getListeningMicrocopy(languagePreference.language),
            }}
            typing={!streamingText}
          />
        ) : null}
      </View>

      <FadeInView delay={320}>
        <TextInput
          multiline
          onChangeText={setInput}
          placeholder="Share birth details or ask Predicta anything..."
          placeholderTextColor={colors.secondaryText}
          textAlignVertical="top"
          value={input}
          className="mt-8 min-h-32 rounded-2xl border border-[#252533] bg-app-card p-4 text-base text-text-primary"
        />
      </FadeInView>

      <View className="mt-5">
        <GlowButton
          delay={390}
          disabled={!input.trim() || isTyping}
          label={isTyping ? 'Reading...' : 'Send'}
          onPress={sendMessage}
        />
      </View>
    </Screen>
  );
}

function buildMobilePlaceClarificationReply(
  language: 'en' | 'hi' | 'gu',
  readyText: string,
  places: Array<{ city: string; state?: string; country: string }>,
): string {
  const options = places
    .slice(0, 4)
    .map(place =>
      [place.city, place.state, place.country].filter(Boolean).join(', '),
    )
    .join('\n');

  if (language === 'hi') {
    return [
      readyText,
      options
        ? `Main Kundli yahin banaungi. Birth place ke liye inme se exact option likh dein:\n${options}`
        : 'Main Kundli yahin banaungi. Bas birth place thoda aur clear chahiye: city, state, country likh dein.',
    ].join('\n\n');
  }
  if (language === 'gu') {
    return [
      readyText,
      options
        ? `Hu Kundli ahi j banaish. Birth place mate aama thi exact option lakho:\n${options}`
        : 'Hu Kundli ahi j banaish. Fakat birth place thodu vadhu clear joye: city, state, country lakho.',
    ].join('\n\n');
  }

  return [
    readyText,
    options
      ? `I will create the Kundli right here. For birth place, write the exact option:\n${options}`
      : 'I will create the Kundli right here. I just need the birth place a little clearer: city, state, country.',
  ].join('\n\n');
}

function buildMobileKundliCreatedReply(
  language: 'en' | 'hi' | 'gu',
  kundli: KundliData,
): string {
  const lines = [
    `Lagna: ${kundli.lagna}`,
    `Moon: ${kundli.moonSign}`,
    `Nakshatra: ${kundli.nakshatra}`,
    `Current dasha: ${kundli.dasha.current.mahadasha} / ${kundli.dasha.current.antardasha}`,
  ];

  if (language === 'hi') {
    return [
      'Ho gaya. Maine Kundli yahin chat mein bana di hai aur ise active rakh liya hai.',
      lines.join('\n'),
      'Ab career, marriage, money, health tendencies, remedies, timing, ya kisi decision par poochiye. Main answer chart proof ke saath dungi.',
    ].join('\n\n');
  }
  if (language === 'gu') {
    return [
      'Thai gayu. Maine Kundli ahi chat ma banaavi didhi chhe ane tene active rakhi chhe.',
      lines.join('\n'),
      'Have career, marriage, money, health tendencies, remedies, timing athva koi decision vishe poochho. Hu chart proof sathe jawab aapish.',
    ].join('\n\n');
  }

  return [
    'Done. I created your Kundli right here in chat and made it the active chart.',
    lines.join('\n'),
    'Now ask me about career, marriage, money, health tendencies, remedies, timing, or any decision. I will answer with chart proof.',
  ].join('\n\n');
}

function syncGuestPassUsage(userId?: string): void {
  const pass = useAppStore.getState().redeemedGuestPass;

  if (!userId || !pass) {
    return;
  }

  syncRedeemedGuestPassToUser(userId, pass).catch(() => undefined);
}

function ChatBubble({
  delay,
  message,
  typing = false,
}: {
  delay: number;
  message: ChatMessage;
  typing?: boolean;
}): React.JSX.Element {
  const isUser = message.role === 'user';

  return (
    <FadeInView
      className={`max-w-[88%] ${isUser ? 'self-end' : 'self-start'}`}
      delay={delay}
    >
      {isUser ? (
        <View style={styles.userBubble}>
          <AppText>{message.text}</AppText>
        </View>
      ) : (
        <LinearGradient
          colors={colors.gradientMuted}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.pridictaBubble}
        >
          {typing ? <TypingPulse /> : <AppText>{message.text}</AppText>}
        </LinearGradient>
      )}
    </FadeInView>
  );
}

function TypingPulse(): React.JSX.Element {
  const opacity = useSharedValue(0.42);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 760 }),
        withTiming(0.42, { duration: 760 }),
      ),
      -1,
      true,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      className="flex-row items-center gap-2"
      style={animatedStyle}
    >
      <View style={styles.typingDot} />
      <View style={styles.typingDot} />
      <View style={styles.typingDot} />
      <AppText className="ml-2" tone="secondary">
        Predicta is reading the pattern
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  logo: {
    borderRadius: 12,
    height: 42,
    width: 42,
  },
  logoShell: {
    borderColor: colors.borderGlow,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 8,
    padding: 3,
    shadowColor: colors.gradient[0],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 16,
  },
  pridictaBubble: {
    borderColor: colors.borderGlow,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 8,
    padding: 16,
    shadowColor: colors.gradient[0],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.bubbleUser,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  typingDot: {
    backgroundColor: colors.gradient[1],
    borderRadius: 4,
    height: 8,
    width: 8,
  },
});
