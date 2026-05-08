import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
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
  buildChatChartReplyText,
  buildChatFollowUps,
  buildChartContextIntro,
  buildChartSelectionPrompt,
  buildPredictaActionReply,
  buildNorthIndianChartCells,
  buildEnglishSwitchDecisionReply,
  buildEnglishSwitchPrompt,
  buildPredictaLearningSuggestion,
  chartContextFromChatBlock,
  composeChatChartBlock,
  detectChatChartIntent,
  detectEnglishSwitchDecision,
  getPlanetAbbreviation,
  learnPredictaInteraction,
  preparePredictaLanguageContext,
  shouldAskBeforeSwitchingToEnglish,
  shouldAutoSwitchToRegionalLanguage,
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
  detectChatSafetyMeta,
  getCrisisSupportReply,
} from '@pridicta/config/safetyUx';
import {
  getSafetyBoundaryCopy,
  hasHighStakesLanguage,
} from '@pridicta/config/trust';
import { extractBirthDetailsFromText } from '../services/ai/birthDetailsExtractor';
import { askPredicta } from '../services/ai/pridictaService';
import { reportSafetyIssue } from '../services/ai/safetyAuditService';
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
import type {
  ChatChartBlock,
  ChatMessage,
  ChatMessageBlock,
  ChatSafetyMeta,
  ChatSuggestedCta,
  KundliData,
  SupportedLanguage,
} from '../types/astrology';

const predictaLogo = require('../assets/predicta-logo.png');

function createMessage(
  role: ChatMessage['role'],
  text: string,
  context?: ChatMessage['context'],
  blocks?: ChatMessageBlock[],
  suggestions?: ChatSuggestedCta[],
  safety?: ChatSafetyMeta,
): ChatMessage {
  return {
    blocks,
    context,
    createdAt: new Date().toISOString(),
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    safety,
    suggestions,
    text,
  };
}

export function ChatScreen({
  navigation,
}: RootScreenProps<typeof routes.Chat>): React.JSX.Element {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingEnglishSwitch, setPendingEnglishSwitch] =
    useState<'gu' | 'hi'>();
  const [predictaMemory, setPredictaMemory] =
    useState<PredictaInteractionMemory>();
  const [streamingText, setStreamingText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeChartContext = useAppStore(state => state.activeChartContext);
  const setActiveChartContext = useAppStore(
    state => state.setActiveChartContext,
  );
  const activeKundli = useAppStore(state => state.activeKundli);
  const auth = useAppStore(state => state.auth);
  const chatSoundEnabled = useAppStore(state => state.chatSoundEnabled);
  const languagePreference = useAppStore(state => state.languagePreference);
  const setLanguagePreference = useAppStore(
    state => state.setLanguagePreference,
  );
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
  const lastPredictaMessageId = [...messages]
    .reverse()
    .find(message => message.role === 'pridicta')?.id;

  useEffect(() => {
    const prompt = activeChartContext?.predictaSchool
      ? activeChartContext.selectedSection
      : activeChartContext?.chartType
      ? activeChartContext.selectedSection ??
        buildChartSelectionPrompt(activeChartContext)
      : activeChartContext?.selectedTimelineEventId
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
      if (activeChartContext?.chartType || activeChartContext?.predictaSchool) {
        appendConversationMessage(
          createMessage(
            'pridicta',
            activeChartContext.predictaSchool
              ? buildMobileSchoolContextIntro(
                  {
                    ...activeChartContext,
                    selectedSection: prompt,
                  },
                  languagePreference.language,
                )
              : buildChartContextIntro(
                  {
                    ...activeChartContext,
                    selectedSection: prompt,
                  },
                  languagePreference.language,
                ),
            activeChartContext,
            undefined,
            buildMobileFollowUps({
              context: activeChartContext,
              kundli: activeKundli,
              lastText: prompt,
            }),
          ),
        );
      }
    }
  }, [
    activeChartContext,
    activeKundli,
    appendConversationMessage,
    languagePreference.language,
  ]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  function streamAssistantResponse(
    text: string,
    options?: {
      blocks?: ChatMessageBlock[];
      context?: ChatMessage['context'];
      safety?: ChatSafetyMeta;
      suggestions?: ChatSuggestedCta[];
    },
  ) {
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
          createMessage(
            'pridicta',
            text,
            options?.context ?? activeChartContext,
            options?.blocks,
            options?.suggestions ??
              buildMobileFollowUps({
                context: options?.context ?? activeChartContext,
                kundli: activeKundli,
                lastText: text,
              }),
            options?.safety,
          ),
        );
        playReplyChime(chatSoundEnabled);
        setStreamingText('');
        setIsTyping(false);
      }
    }, 18);
  }

  async function sendMessage(overrideText?: string) {
    const trimmedInput = (overrideText ?? input).trim();

    if (!trimmedInput || isTyping) {
      return;
    }

    const languageContext = preparePredictaLanguageContext({
      memory: predictaMemory,
      selectedLanguage: languagePreference.language,
      text: trimmedInput,
    });
    const responseLanguage = languageContext.responseLanguage;
    const switchDecision = pendingEnglishSwitch
      ? detectEnglishSwitchDecision(trimmedInput)
      : 'none';

    if (pendingEnglishSwitch && switchDecision !== 'none') {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      if (switchDecision === 'approve') {
        setLanguagePreference('en');
      }
      streamAssistantResponse(
        buildEnglishSwitchDecisionReply({
          currentLanguage: pendingEnglishSwitch,
          decision: switchDecision,
        }),
      );
      setPendingEnglishSwitch(undefined);
      return;
    }

    if (pendingEnglishSwitch && switchDecision === 'none') {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      streamAssistantResponse(buildEnglishSwitchPrompt(pendingEnglishSwitch));
      return;
    }

    if (
      shouldAutoSwitchToRegionalLanguage({
        context: languageContext,
        selectedLanguage: languagePreference.language,
      })
    ) {
      setLanguagePreference(responseLanguage);
    }

    if (
      shouldAskBeforeSwitchingToEnglish({
        context: languageContext,
        selectedLanguage: languagePreference.language,
      })
    ) {
      const fromLanguage = languagePreference.language as 'gu' | 'hi';
      setPendingEnglishSwitch(fromLanguage);
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      streamAssistantResponse(buildEnglishSwitchPrompt(fromLanguage));
      return;
    }

    const localSafety = detectChatSafetyMeta(trimmedInput, responseLanguage);
    if (localSafety?.kind === 'crisis') {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      streamAssistantResponse(getCrisisSupportReply(responseLanguage), {
        safety: localSafety,
      });
      return;
    }

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
          {
            safety: detectChatSafetyMeta(trimmedInput, responseLanguage),
          },
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
        streamAssistantResponse(actionReply.text, {
          suggestions: buildMobileFollowUps({
            context: activeChartContext,
            kundli: activeKundli,
            lastText: trimmedInput,
          }),
        });
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
    const chartIntent = detectChatChartIntent(trimmedInput);

    if (chartIntent) {
      const access = getResolvedAccess();
      const block = composeChatChartBlock({
        chartType: chartIntent.chartType,
        hasPremiumAccess: access.hasPremiumAccess,
        kundli: activeKundli,
      });

      if (block) {
        const context = chartContextFromChatBlock(block, 'Chat');
        const nextMemory = learnPredictaInteraction(
          predictaMemory,
          trimmedInput,
          'chart',
          activeKundli,
          responseLanguage,
        );
        setPredictaMemory(nextMemory);
        setActiveChartContext(context);
        appendConversationMessage(
          createMessage('user', trimmedInput, activeChartContext),
        );
        setInput('');
        streamAssistantResponse(
          buildChatChartReplyText({ block, language: responseLanguage }),
          {
            blocks: [block],
            context,
          },
        );
        return;
      }
    }

    const actionReply = buildPredictaActionReply({
      hasPremiumAccess: getResolvedAccess().hasPremiumAccess,
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
      streamAssistantResponse(actionReply.text, {
        suggestions: buildMobileFollowUps({
          context: activeChartContext,
          kundli: activeKundli,
          lastText: trimmedInput,
        }),
      });
      return;
    }

    const freeQuestionAvailable = canAskQuestion();
    const paidQuestionAvailable = hasPaidQuestionCredits();

    if (!freeQuestionAvailable && !paidQuestionAvailable) {
      appendConversationMessage(
        createMessage(
          'pridicta',
          "You've reached today's guidance limit. Your reading is saved. You can continue tomorrow, add a few questions, or unlock more Predicta guidance today.",
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
      const response = await askPredicta({
        chartContext: activeChartContext,
        history,
        kundli: activeKundli,
        language: responseLanguage,
        message: trimmedInput,
        userPlan: effectivePlan,
      });
      const safety = detectChatSafetyMeta(
        trimmedInput,
        responseLanguage,
        response,
      );
      const nextMemory = learnPredictaInteraction(
        actionReply.memory,
        trimmedInput,
        undefined,
        activeKundli,
        responseLanguage,
      );
      setPredictaMemory(nextMemory);
      const answerText = response.safetyBlocked
        ? response.text
        : hasHighStakesLanguage(trimmedInput)
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
        {
          safety,
        },
      );
    } catch (error) {
      streamAssistantResponse(
        error instanceof Error
          ? `I could not complete the reading because ${error.message}. Please try again with one focused question.`
          : 'I could not complete the reading right now. Please try again with one focused question.',
      );
    }
  }

  function buildMobileFollowUps({
    context,
    kundli,
    lastText,
  }: {
    context?: ChatMessage['context'];
    kundli?: KundliData;
    lastText: string;
  }): ChatSuggestedCta[] {
    return buildChatFollowUps({
      context,
      hasKundli: Boolean(kundli),
      hasPremiumAccess: getResolvedAccess().hasPremiumAccess,
      kundli,
      language: languagePreference.language,
      lastText,
    });
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
            onSuggestionPress={suggestion => {
              if (suggestion.context) {
                setActiveChartContext(suggestion.context);
              }
              if (suggestion.targetScreen === routes.KpPredicta) {
                navigation.navigate(routes.KpPredicta);
                return;
              }
              if (suggestion.targetScreen === routes.NadiPredicta) {
                navigation.navigate(routes.NadiPredicta);
                return;
              }
              void sendMessage(suggestion.prompt);
            }}
            onUsePrompt={(prompt, block) => {
              if (block) {
                setActiveChartContext(chartContextFromChatBlock(block, 'Chat'));
              }
              setInput(prompt);
            }}
            showSuggestions={
              message.role === 'pridicta' &&
              message.id === lastPredictaMessageId &&
              !isTyping
            }
            suggestions={
              message.suggestions ??
              buildMobileFollowUps({
                context: message.context ?? activeChartContext,
                kundli: activeKundli,
                lastText: message.text,
              })
            }
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
            onUsePrompt={(prompt, block) => {
              if (block) {
                setActiveChartContext(chartContextFromChatBlock(block, 'Chat'));
              }
              setInput(prompt);
            }}
            onSuggestionPress={prompt => {
              void sendMessage(prompt.prompt);
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
          onPress={() => {
            void sendMessage();
          }}
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
  onSuggestionPress,
  onUsePrompt,
  showSuggestions = false,
  suggestions = [],
  typing = false,
}: {
  delay: number;
  message: ChatMessage;
  onSuggestionPress: (suggestion: ChatSuggestedCta) => void;
  onUsePrompt: (prompt: string, block?: ChatChartBlock) => void;
  showSuggestions?: boolean;
  suggestions?: ChatSuggestedCta[];
  typing?: boolean;
}): React.JSX.Element {
  const isUser = message.role === 'user';
  const hasBlocks = Boolean(message.blocks?.length);

  return (
    <FadeInView
      className={`${hasBlocks ? 'max-w-[96%]' : 'max-w-[88%]'} ${
        isUser ? 'self-end' : 'self-start'
      }`}
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
              {typing ? (
                <TypingPulse text={message.text} />
              ) : (
                <>
                  <MobileChatReplyText text={message.text} />
                  {message.blocks?.map(block => (
                <MobileChatMessageBlock
                  block={block}
                  key={`${message.id}-${block.type}-${block.chartType}`}
                  onUsePrompt={onUsePrompt}
                />
              ))}
              {message.safety ? (
                <MobileChatSafetyCard safety={message.safety} />
              ) : null}
              {showSuggestions && suggestions.length ? (
                <MobileChatSuggestions
                  onSuggestionPress={onSuggestionPress}
                  suggestions={suggestions}
                />
              ) : null}
            </>
          )}
        </LinearGradient>
      )}
    </FadeInView>
  );
}

function MobileChatSafetyCard({
  safety,
}: {
  safety: ChatSafetyMeta;
}): React.JSX.Element {
  const [reportState, setReportState] = useState<'idle' | 'sent' | 'error'>('idle');

  async function submitReport() {
    try {
      await reportSafetyIssue({
        reportKind: 'USER_REPORTED',
        route: 'mobile-chat',
        safetyCategories: safety.categories ?? [safety.kind],
        sourceSurface: 'mobile-chat',
      });
      setReportState('sent');
    } catch {
      setReportState('error');
    }
  }

  return (
    <View style={[styles.chatSafetyCard, getMobileSafetyStyle(safety.kind)]}>
      <View className="flex-1">
        <AppText variant="caption">{safety.title}</AppText>
        <AppText className="mt-1" tone="secondary" variant="caption">
          {safety.body}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={reportState === 'sent'}
        onPress={() => void submitReport()}
        style={styles.chatSafetyReport}
      >
        <AppText variant="caption">
          {reportState === 'sent'
            ? 'Sent for review'
            : reportState === 'error'
              ? 'Try again'
              : safety.reportLabel}
        </AppText>
      </Pressable>
    </View>
  );
}

function getMobileSafetyStyle(kind: ChatSafetyMeta['kind']) {
  if (kind === 'crisis') {
    return styles.chatSafetyCrisis;
  }

  if (kind === 'blocked') {
    return styles.chatSafetyBlocked;
  }

  return styles.chatSafetyHighStakes;
}

function buildMobileSchoolContextIntro(
  context: ChatMessage['context'],
  language: SupportedLanguage,
): string {
  const school =
    context?.predictaSchool === 'KP'
      ? 'KP Predicta'
      : context?.predictaSchool === 'NADI'
        ? 'Nadi Predicta'
        : 'Regular Predicta';
  const question = context?.handoffQuestion ?? context?.selectedSection;

  if (language === 'hi') {
    return [
      `${school} ready hai.`,
      question ? `Aapka question: ${question}` : undefined,
      context?.predictaSchool === 'KP'
        ? 'Ab answer KP ke cusps, star lords, sub lords, significators aur ruling planets se hi grounded rahega.'
        : context?.predictaSchool === 'NADI'
          ? 'Nadi Predicta ready hai. Main planetary story links aur validation questions se padhungi; palm-leaf ka fake claim nahi hoga.'
          : 'Ab answer regular Parashari Jyotish context mein rahega.',
      'Ask dabaiye, ya apna follow-up likhiye.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `${school} ready chhe.`,
      question ? `Tamaro question: ${question}` : undefined,
      context?.predictaSchool === 'KP'
        ? 'Have answer KP cusps, star lords, sub lords, significators ane ruling planets par grounded rahe.'
        : context?.predictaSchool === 'NADI'
          ? 'Nadi Predicta ready chhe. Hu planetary story links ane validation questions thi padhish; palm-leaf no fake claim nahi hoy.'
          : 'Have answer regular Parashari Jyotish context ma rahe.',
      'Ask dabavo, athva tamaro follow-up lakho.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `${school} is ready.`,
    question ? `Your question: ${question}` : undefined,
    context?.predictaSchool === 'KP'
      ? 'The answer will now stay grounded in KP cusps, star lords, sub lords, significators, and ruling planets.'
      : context?.predictaSchool === 'NADI'
        ? 'Nadi Predicta is ready. I will read through planetary story links and validation questions, without fake palm-leaf claims.'
        : 'The answer will now stay in regular Parashari Jyotish.',
    'Press Ask, or type your follow-up.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function MobileChatSuggestions({
  onSuggestionPress,
  suggestions,
}: {
  onSuggestionPress: (suggestion: ChatSuggestedCta) => void;
  suggestions: ChatSuggestedCta[];
}): React.JSX.Element {
  return (
    <View style={styles.chatSuggestionRow}>
      <AppText tone="secondary" variant="caption">
        Suggested next questions
      </AppText>
      {suggestions.slice(0, 4).map(suggestion => (
        <Pressable
          accessibilityRole="button"
          key={suggestion.id}
          onPress={() => onSuggestionPress(suggestion)}
          style={styles.chatSuggestionChip}
        >
          <AppText variant="caption">{suggestion.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

type ParsedMobileProofReply = {
  body: string[];
  proof?: {
    chartFactors: string[];
    confidence: string;
    timing: string;
  };
};

function MobileChatReplyText({ text }: { text: string }): React.JSX.Element {
  const parsed = parseMobileProofReply(text);

  return (
    <View style={styles.mobileReplyStack}>
      {parsed.body.map((paragraph, index) => (
        <AppText key={`${paragraph}-${index}`}>{paragraph}</AppText>
      ))}
      {parsed.proof ? <MobileProofCard proof={parsed.proof} /> : null}
    </View>
  );
}

function MobileProofCard({
  proof,
}: {
  proof: NonNullable<ParsedMobileProofReply['proof']>;
}): React.JSX.Element {
  return (
    <View style={styles.mobileProofCard}>
      <View style={styles.mobileProofTopline}>
        <AppText variant="caption">Ask with proof</AppText>
        <View style={styles.mobileProofBadge}>
          <AppText variant="caption">{proof.confidence}</AppText>
        </View>
      </View>
      <AppText className="mt-2" tone="secondary" variant="caption">
        Timing: {proof.timing}
      </AppText>
      <View style={styles.mobileProofChipRow}>
        {proof.chartFactors.map(item => (
          <View key={item} style={styles.mobileProofChip}>
            <AppText tone="secondary" variant="caption">
              {item}
            </AppText>
          </View>
        ))}
      </View>
    </View>
  );
}

function parseMobileProofReply(text: string): ParsedMobileProofReply {
  const parts = text
    .split(/\n{2,}/)
    .map(part => part.trim())
    .filter(Boolean);
  const proofIndex = parts.findIndex(part => /^Ask with proof$/i.test(part));

  if (proofIndex === -1) {
    return {
      body: parts.length ? parts : [text],
    };
  }

  const proofParts = parts.slice(proofIndex + 1);
  const chartFactorsIndex = proofParts.findIndex(part =>
    /^Chart factors:/i.test(part),
  );
  const chartFactorBlock =
    chartFactorsIndex === -1 ? '' : proofParts[chartFactorsIndex + 1] ?? '';
  const chartFactors = chartFactorBlock
    .split('\n')
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 4);

  return {
    body: parts.slice(0, proofIndex),
    proof: {
      chartFactors: chartFactors.length
        ? chartFactors
        : ['Evidence was limited for this question.'],
      confidence:
        proofParts
          .find(part => /^Confidence:/i.test(part))
          ?.replace(/^Confidence:\s*/i, 'Confidence: ') ?? 'Confidence: medium',
      timing:
        proofParts
          .find(part => /^Timing context:/i.test(part))
          ?.replace(/^Timing context:\s*/i, '') ??
        'No precise timing window was strong enough to claim.',
    },
  };
}

function MobileChatMessageBlock({
  block,
  onUsePrompt,
}: {
  block: ChatMessageBlock;
  onUsePrompt: (prompt: string, block?: ChatChartBlock) => void;
}): React.JSX.Element {
  if (block.type === 'chart') {
    return <MobileChatChartBlock block={block} onUsePrompt={onUsePrompt} />;
  }

  return <></>;
}

function MobileChatChartBlock({
  block,
  onUsePrompt,
}: {
  block: ChatChartBlock;
  onUsePrompt: (prompt: string, block?: ChatChartBlock) => void;
}): React.JSX.Element {
  const cells = buildNorthIndianChartCells(block.chart);

  return (
    <View style={styles.chatChartCard}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText tone="secondary" variant="caption">
            {block.chartType} · {block.insight.eyebrow}
          </AppText>
          <AppText className="mt-1" variant="subtitle">
            {block.chartName}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            {block.ownerName}'s chart focus
          </AppText>
        </View>
        <View style={styles.chatChartStatus}>
          <AppText variant="caption">
            {block.supported ? 'Visible' : 'Unverified'}
          </AppText>
        </View>
      </View>

      <View style={styles.chatMiniChart}>
        {Array.from({ length: 25 }, (_, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;
          const cell = cells.find(item => item.row === row && item.col === col);

          if (!cell) {
            return (
              <View key={`center-${row}-${col}`} style={styles.chatMiniCenterCell}>
                {row === 2 && col === 2 ? (
                  <>
                    <AppText tone="secondary" variant="caption">
                      {block.chartType}
                    </AppText>
                    <AppText className="text-center" variant="caption">
                      D1 anchor
                    </AppText>
                  </>
                ) : null}
              </View>
            );
          }

          return (
            <Pressable
              accessibilityRole="button"
              key={cell.key}
              onPress={() =>
                onUsePrompt(
                  `Explain House ${cell.house} in my ${block.chartType} chart with D1 proof.`,
                  block,
                )
              }
              style={styles.chatMiniHouse}
            >
              <View className="flex-row items-center justify-between">
                <AppText tone="secondary" variant="caption">
                  H{cell.house}
                </AppText>
                <AppText tone="secondary" variant="caption">
                  {cell.signShort}
                </AppText>
              </View>
              <AppText className="mt-1" variant="caption">
                {cell.planets.length
                  ? cell.planets.map(getPlanetAbbreviation).join(' ')
                  : '-'}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chatEvidenceRow}>
        {block.evidenceChips.map(chip => (
          <View key={chip} style={styles.chatEvidenceChip}>
            <AppText tone="secondary" variant="caption">
              {chip}
            </AppText>
          </View>
        ))}
      </View>

      <View className="mt-3 gap-2">
        {block.insight.bullets.slice(0, 4).map(item => (
          <AppText key={item} tone="secondary" variant="caption">
            - {item}
          </AppText>
        ))}
      </View>

      <View style={styles.chatChartActionRow}>
        {block.ctas.map(cta => (
          <Pressable
            accessibilityRole="button"
            key={cta.id}
            onPress={() => onUsePrompt(cta.prompt, block)}
            style={styles.chatChartAction}
          >
            <AppText variant="caption">{cta.label}</AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function TypingPulse({ text }: { text: string }): React.JSX.Element {
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
      className="flex-row items-center gap-3"
      style={animatedStyle}
    >
      <View style={styles.thinkingMark}>
        <View style={styles.thinkingDiamond} />
      </View>
      <AppText className="flex-1" tone="secondary">
        {text}
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  chatChartAction: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chatChartActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chatChartCard: {
    backgroundColor: 'rgba(10, 10, 15, 0.52)',
    borderColor: 'rgba(77, 175, 255, 0.22)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  chatChartStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chatEvidenceChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  chatEvidenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  chatMiniCenterCell: {
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.82)',
    borderColor: colors.border,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    width: '20%',
  },
  chatMiniChart: {
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    overflow: 'hidden',
    width: '100%',
  },
  chatMiniHouse: {
    backgroundColor: 'rgba(18, 18, 26, 0.88)',
    borderColor: colors.border,
    borderWidth: 1,
    minHeight: 44,
    padding: 6,
    width: '20%',
  },
  chatSafetyBlocked: {
    backgroundColor: 'rgba(255, 195, 77, 0.1)',
    borderColor: 'rgba(255, 195, 77, 0.38)',
  },
  chatSafetyCard: {
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    padding: 12,
  },
  chatSafetyCrisis: {
    backgroundColor: 'rgba(255, 77, 106, 0.1)',
    borderColor: 'rgba(255, 77, 106, 0.38)',
  },
  chatSafetyHighStakes: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 195, 77, 0.3)',
  },
  chatSafetyReport: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  chatSuggestionChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chatSuggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  mobileProofBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  mobileProofCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(77, 175, 255, 0.24)',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    padding: 12,
  },
  mobileProofChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  mobileProofChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  mobileProofTopline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  mobileReplyStack: {
    gap: 12,
  },
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
  thinkingDiamond: {
    borderColor: 'rgba(255, 195, 77, 0.45)',
    borderRadius: 5,
    borderWidth: 1,
    height: 18,
    transform: [{ rotate: '45deg' }],
    width: 18,
  },
  thinkingMark: {
    alignItems: 'center',
    borderColor: 'rgba(77, 175, 255, 0.32)',
    borderRadius: 4,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
});
