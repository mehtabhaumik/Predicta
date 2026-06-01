import { formatNativeCopy, getNativeCopy } from '@pridicta/config';
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
  ActiveKundliActions,
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
  buildPredictaLearningSuggestion,
  chartContextFromChatBlock,
  composeChatChartBlock,
  detectChatChartIntent,
  shouldBypassLocalChartShortcuts,
  detectKundliChatCommand,
  detectKundliCommandDecision,
  findKundliBySpokenName,
  getPlanetAbbreviation,
  learnPredictaInteraction,
  preparePredictaLanguageContext,
  shouldAutoSwitchToRegionalLanguage,
  attachKundliEditHistory,
  type KundliChatCommand,
  type KundliEditField,
  type PredictaInteractionMemory,
} from '@pridicta/astrology';
import { detectIntent } from '@pridicta/ai';
import { buildBirthIntakeReply } from '@pridicta/config/predictaMemory';
import {
  getLanguageLabels,
  getLanguageOption,
} from '@pridicta/config/language';
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
  deleteSavedKundli,
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
  BirthDetailsDraft,
  BirthDetails,
  KundliData,
  PredictaSchool,
  SupportedLanguage,
} from '../types/astrology';

const predictaLogo = require('../assets/predicta-logo.png');

type PendingKundliCommand = {
  birthDetails?: BirthDetails;
  field?: KundliEditField;
  kind: 'delete' | 'edit';
  targetKundliId: string;
  targetName: string;
};

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

function ChatSessionPanel({
  activeSessionId,
  isSignedIn,
  onNewSession,
  onSignIn,
  onSwitchSession,
  sessions,
}: {
  activeSessionId?: string;
  isSignedIn: boolean;
  onNewSession: () => void;
  onSignIn: () => void;
  onSwitchSession: (sessionId: string) => void;
  sessions: Array<{ id: string; title: string }>;
}) {
  return (
    <FadeInView className="mt-5 rounded-2xl border border-[#252533] bg-[#12121A] p-4">
      <View className="gap-3">
        <View>
          <AppText variant="subtitle">
            {isSignedIn ? 'Saved chat sessions' : 'One chat for guests'}
          </AppText>
          <AppText className="mt-1" tone="secondary" variant="caption">
            {isSignedIn
              ? 'Keep separate readings for different Kundlis or life questions.'
              : 'Continue here for now. Sign in when you want separate saved chats for family Kundlis or different life questions.'}
          </AppText>
        </View>
        {isSignedIn ? (
          <View className="flex-row flex-wrap gap-2">
            {sessions.slice(0, 6).map(session => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: session.id === activeSessionId }}
                className={`rounded-full border px-3 py-2 ${
                  session.id === activeSessionId
                    ? 'border-[#4DAFFF] bg-[#172233]'
                    : 'border-[#252533] bg-[#191923]'
                }`}
                key={session.id}
                onPress={() => onSwitchSession(session.id)}
              >
                <AppText variant="caption">{session.title}</AppText>
              </Pressable>
            ))}
          </View>
        ) : null}
        {!isSignedIn ? <GlowButton label="Sign In" onPress={onSignIn} /> : null}
        <GlowButton
          label={isSignedIn ? 'New saved chat' : 'New chat'}
          onPress={onNewSession}
        />
      </View>
    </FadeInView>
  );
}

function shouldGateForBirthDetailConfidence(
  text: string,
  kundli: KundliData,
): boolean {
  if (
    !kundli.birthDetails.isTimeApproximate &&
    !kundli.rectification?.needsRectification &&
    kundli.rectification?.confidence !== 'low'
  ) {
    return false;
  }

  if (/\b(birth\s*time|rectification|rectify|recalculate|re-calculate|correct\s+time|time\s+confidence|birth\s*time\s+detective|time\s+unknown)\b/i.test(text)) {
    return false;
  }

  return /\b(predict|prediction|future|timing|when|age|year|month|career|job|business|finance|money|wealth|marriage|relationship|child|children|health|legal|court|case|report|pdf|mahadasha|antardasha|dasha|sade\s*sati|gochar|transit|kundli|chart|house|lagna|ascendant|d[0-9]+|navamsha|dashamsha|kp|nadi|remedy|yoga|dosha|muhurta|decision|passport|timeline)\b/i.test(text);
}

function isBirthTimeConfirmationRequest(text: string): boolean {
  const normalized = text.trim().toLowerCase();

  if (/^(is|kya|su|shu|can|could|please\s+check|tell\s+me)\b/.test(normalized)) {
    return false;
  }

  return (
    /\b(my|mera|meri|maro|mari|entered|provided|given)\b[\s\S]{0,80}\b(birth\s*time|time)\b[\s\S]{0,80}\b(correct|right|accurate|confirmed|confirm|sahi|theek|thik|barabar|chhe|hai)\b/i.test(
      normalized,
    ) ||
    /\b(use|go\s+with|continue\s+with|proceed\s+with|keep)\b[\s\S]{0,80}\b(entered|provided|given|same|original)\b[\s\S]{0,80}\b(time|birth\s*time)\b/i.test(
      normalized,
    ) ||
    /\b(entered|provided|given|original)\b[\s\S]{0,80}\b(time|birth\s*time)\b[\s\S]{0,80}\b(correct|right|sahi|theek|thik|barabar|chhe|hai)\b/i.test(
      normalized,
    )
  );
}

function buildBirthDetailConfidenceGateReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  const timeText = kundli.birthDetails.time || 'not shared';
  const reason = kundli.birthDetails.isTimeApproximate
    ? 'the birth time is marked approximate'
    : kundli.rectification?.reasons[0] ??
      'birth-time confidence needs checking before fine timing';

  if (language === 'hi') {
    return [
      'Birth time check pehle karte hain.',
      `Mere paas ${kundli.birthDetails.name} ki Kundli hai, par birth time ${timeText} ko deep prediction ke liye confirm karna zaroori hai. Even 10-15 minutes houses, divisional charts aur timing ko change kar sakte hain.`,
      `Reason: ${reason}.`,
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.91825d0d48"),
      'Agar time doubtful hai, main simple life-event questions pooch kar probable corrected birth time estimate kar sakti hoon.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'Birth time pehla confirm kariye.',
      `Mare pase ${kundli.birthDetails.name} ni Kundli chhe, pan birth time ${timeText} deep prediction mate confirm karvo jaruri chhe. 10-15 minutes pan houses, divisional charts ane timing badli shake chhe.`,
      `Reason: ${reason}.`,
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.e976f7d8f9"),
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.39fbd464a3"),
    ].join('\n\n');
  }

  return [
    'Birth time check first.',
    `I have ${kundli.birthDetails.name}'s Kundli, but the birth time ${timeText} needs confirmation before deep prediction. Even 10-15 minutes can change houses, divisional charts, and timing.`,
    `Reason: ${reason}.`,
    'I can still give broad guidance, but I will not do exact timing, marriage/career/finance prediction, D9/D10/KP/Jaimini depth, or report-grade analysis until the time is confirmed.',
    'If the time is doubtful, I can ask simple life-event questions and estimate a probable corrected birth time.',
  ].join('\n\n');
}

function buildPartialBirthDetailGateReply(
  language: SupportedLanguage,
  draft?: BirthDetailsDraft,
): string | undefined {
  if (!draft || (!draft.date && !draft.time && !draft.city && !draft.placeText)) {
    return undefined;
  }

  const missing = [
    !draft.date ? 'date of birth' : undefined,
    !draft.time ? 'birth time' : undefined,
    !draft.city && !draft.placeText ? 'birth place' : undefined,
  ].filter(Boolean);

  if (missing.length === 0) {
    return undefined;
  }

  const knownDetails = [
    draft.date ? `Date: ${draft.date}` : undefined,
    draft.time ? `Time: ${draft.time}` : undefined,
    draft.city || draft.placeText
      ? `Place: ${[draft.city ?? draft.placeText, draft.state, draft.country]
          .filter(Boolean)
          .join(', ')}`
      : undefined,
  ]
    .filter(Boolean)
    .join('\n');

  if (language === 'hi') {
    return [
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.02240d2df7"),
      knownDetails ? `Abhi mere paas:\n${knownDetails}` : undefined,
      `Missing: ${missing.join(', ')}.`,
      'Real Kundli, houses, dasha, timing, KP/Jaimini aur reports ke liye birth time aur place zaroori hain.',
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.359d1587f7"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.6bb83ed98f"),
      knownDetails ? `Haal ma mare pase:\n${knownDetails}` : undefined,
      `Missing: ${missing.join(', ')}.`,
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.a9686c9c70"),
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.43a911ed20"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    'I will not start deep prediction from half details.',
    knownDetails ? `So far I have:\n${knownDetails}` : undefined,
    `Missing: ${missing.join(', ')}.`,
    'A real Kundli, houses, dasha, timing, KP/Jaimini, and reports need birth time and birth place.',
    'If the exact birth time is unknown, write “time unknown.” I can ask simple life questions and guide you through birth-time detective mode.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function buildBirthDetailConfidenceSuggestions(
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  if (language === 'hi') {
    return [
      {
        id: 'birth-confidence-confirm-time',
        label: 'Time correct hai',
        prompt:
          'Mera birth time correct hai. Is confidence ke saath reading continue karo, par timing confidence clearly mention karna.',
      },
      {
        id: 'birth-confidence-rectify',
        label: 'Time re-check karo',
        prompt:
          'Mera birth time doubtful hai. Mujhe simple life-event questions pooch kar probable corrected birth time estimate karo.',
      },
      {
        id: 'birth-confidence-detective',
        label: 'Birth Time Detective',
        prompt: 'Open Birth Time Detective',
        targetScreen: routes.BirthTimeDetective,
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        id: 'birth-confidence-confirm-time',
        label: getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.7a1292c011"),
        prompt:
          getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.8b2a88f05c"),
      },
      {
        id: 'birth-confidence-rectify',
        label: 'Time re-check karo',
        prompt:
          getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.ec48b89375"),
      },
      {
        id: 'birth-confidence-detective',
        label: 'Birth Time Detective',
        prompt: 'Open Birth Time Detective',
        targetScreen: routes.BirthTimeDetective,
      },
    ];
  }

  return [
    {
      id: 'birth-confidence-confirm-time',
      label: 'My time is correct',
      prompt:
        'My birth time is correct. Continue the reading, but clearly mention timing confidence.',
    },
    {
      id: 'birth-confidence-rectify',
      label: 'Re-check my time',
      prompt:
        'My birth time is doubtful. Ask me simple life-event questions and estimate a probable corrected birth time.',
    },
    {
      id: 'birth-confidence-detective',
      label: 'Birth Time Detective',
      prompt: 'Open Birth Time Detective',
      targetScreen: routes.BirthTimeDetective,
    },
  ];
}

export function ChatScreen({
  navigation,
}: RootScreenProps<typeof routes.Chat>): React.JSX.Element {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [pendingKundliCommand, setPendingKundliCommand] =
    useState<PendingKundliCommand>();
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
  const activeChatSessionId = useAppStore(state => state.activeChatSessionId);
  const chatSessions = useAppStore(state => state.chatSessions);
  const createChatSession = useAppStore(state => state.createChatSession);
  const switchChatSession = useAppStore(state => state.switchChatSession);
  const chatSoundEnabled = useAppStore(state => state.chatSoundEnabled);
  const languagePreference = useAppStore(state => state.languagePreference);
  const predictaReplyLanguage = useAppStore(
    state => state.predictaReplyLanguage,
  );
  const setPredictaReplyLanguage = useAppStore(
    state => state.setPredictaReplyLanguage,
  );
  const languageLabels = getLanguageLabels(languagePreference.language);
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
  const clearActiveKundli = useAppStore(state => state.clearActiveKundli);
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
    state.activeChatSessionId
      ? state.conversationsByKundli[state.activeChatSessionId] ?? []
      : state.activeKundliId
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
      : activeChartContext?.purpose
      ? activeChartContext.selectedSection
      : undefined;

    if (prompt && timelinePromptSeededRef.current !== prompt) {
      setInput(prompt);
      timelinePromptSeededRef.current = prompt;
      if (activeChartContext) {
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
              : activeChartContext.chartType
                ? buildChartContextIntro(
                  {
                    ...activeChartContext,
                    selectedSection: prompt,
                  },
                  languagePreference.language,
                  )
                : buildMobileCtaContextIntro(
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

  async function confirmEnteredBirthTimeFromChat(
    kundli: KundliData,
    responseLanguage: SupportedLanguage,
  ) {
    const enteredTime =
      kundli.birthDetails.originalTime ?? kundli.birthDetails.time;
    const restoredFromRectified = enteredTime !== kundli.birthDetails.time;
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
      const nextKundli =
        restoredFromRectified
          ? {
              ...(await generateKundli(finalDetails, { ignoreCache: true })),
              birthDetails: finalDetails,
            }
          : {
              ...kundli,
              birthDetails: finalDetails,
              rectification: undefined,
            };

      setActiveKundli(nextKundli);
      const saved = await saveGeneratedKundliLocally(nextKundli, {
        isLoggedIn: auth.isLoggedIn,
      });
      setSavedKundlis(saved);

      streamAssistantResponse(
        buildBirthTimeConfirmedReply(
          responseLanguage,
          nextKundli,
          enteredTime,
          restoredFromRectified,
        ),
      );
    } catch {
      streamAssistantResponse(buildBirthTimeConfirmationFailedReply(responseLanguage));
    }
  }

  async function sendMessage(overrideText?: string) {
    const trimmedInput = (overrideText ?? input).trim();

    if (!trimmedInput || isTyping) {
      return;
    }

    const languageContext = preparePredictaLanguageContext({
      memory: predictaMemory,
      selectedLanguage: predictaReplyLanguage,
      text: trimmedInput,
    });
    const responseLanguage = languageContext.responseLanguage;

    if (
      shouldAutoSwitchToRegionalLanguage({
        context: languageContext,
        selectedLanguage: predictaReplyLanguage,
      })
    ) {
      setPredictaReplyLanguage(responseLanguage);
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

    if (pendingKundliCommand) {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      streamAssistantResponse(
        await resolvePendingKundliCommand(trimmedInput, responseLanguage),
      );
      return;
    }

    const kundliCommandReply = await resolveInitialKundliCommand(
      trimmedInput,
      responseLanguage,
    );

    if (kundliCommandReply) {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      streamAssistantResponse(kundliCommandReply);
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

      const partialBirthReply = buildPartialBirthDetailGateReply(
        responseLanguage,
        pendingBirthDetailsDraft,
      );
      if (partialBirthReply) {
        streamAssistantResponse(
          [languageContext.acknowledgement, partialBirthReply]
            .filter(Boolean)
            .join('\n\n'),
        );
        return;
      }

      const actionReply = buildPredictaActionReply({
        kundli: undefined,
        language: responseLanguage,
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
        const creationBlock = composeChatChartBlock({
          chartType: 'D1',
          hasPremiumAccess: false,
          kundli: nextKundli,
        });

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
        saveGeneratedKundliLocally(nextKundli, {
          isLoggedIn: auth.isLoggedIn,
        })
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
          {
            blocks: creationBlock ? [creationBlock] : undefined,
          },
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
    const wantsDeepChartAnswer =
      shouldBypassLocalChartShortcuts(trimmedInput);

    if (isBirthTimeConfirmationRequest(trimmedInput)) {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      await confirmEnteredBirthTimeFromChat(activeKundli, responseLanguage);
      return;
    }

    if (
      shouldGateForBirthDetailConfidence(trimmedInput, activeKundli) &&
      (Boolean(chartIntent) || wantsDeepChartAnswer)
    ) {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      streamAssistantResponse(
        buildBirthDetailConfidenceGateReply(responseLanguage, activeKundli),
        {
          suggestions: buildBirthDetailConfidenceSuggestions(responseLanguage),
        },
      );
      return;
    }

    if (chartIntent && !wantsDeepChartAnswer) {
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

    let actionMemory = predictaMemory;

    if (!wantsDeepChartAnswer) {
      const actionReply = buildPredictaActionReply({
        hasPremiumAccess: getResolvedAccess().hasPremiumAccess,
        kundli: activeKundli,
        language: responseLanguage,
        memory: predictaMemory,
        savedKundlis,
        text: trimmedInput,
      });
      actionMemory = actionReply.memory;
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
        actionMemory,
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

  async function resolveInitialKundliCommand(
    text: string,
    responseLanguage: SupportedLanguage,
  ): Promise<string | undefined> {
    const command = detectKundliChatCommand(text);

    if (!command) {
      return undefined;
    }

    if (command.kind === 'create-new') {
      setPendingBirthDetailsDraft(undefined);
      return buildKundliCreateFromChatReply(responseLanguage);
    }

    const savedKundlis = savedKundliRecords.map(record => record.kundliData);
    const target =
      command.kind === 'set-active'
        ? findKundliBySpokenName(savedKundlis, command.targetName) ??
          activeKundli
        : findKundliBySpokenName(
            savedKundlis,
            'targetName' in command ? command.targetName : undefined,
          ) ?? activeKundli;

    if (!target) {
      return buildNoKundliForCommandReply(responseLanguage);
    }

    if (command.kind === 'set-active') {
      setActiveKundli(target);
      return buildKundliSetActiveReply(responseLanguage, target);
    }

    if (command.kind === 'delete') {
      setPendingKundliCommand({
        kind: 'delete',
        targetKundliId: target.id,
        targetName: target.birthDetails.name,
      });
      return buildKundliDeleteConfirmReply(responseLanguage, target);
    }

    if (command.kind === 'generic-edit') {
      return buildKundliGenericEditReply(responseLanguage, target);
    }

    const nextBirthDetails = await buildEditedBirthDetails(target, command);

    if (!nextBirthDetails) {
      return buildKundliEditNeedsValueReply(responseLanguage, command);
    }

    setPendingKundliCommand({
      birthDetails: nextBirthDetails,
      field: command.field,
      kind: 'edit',
      targetKundliId: target.id,
      targetName: target.birthDetails.name,
    });

    return buildKundliEditConfirmReply(
      responseLanguage,
      target,
      command,
      nextBirthDetails,
    );
  }

  async function resolvePendingKundliCommand(
    text: string,
    responseLanguage: SupportedLanguage,
  ): Promise<string> {
    const decision = detectKundliCommandDecision(text);

    if (decision === 'cancel') {
      setPendingKundliCommand(undefined);
      return buildKundliCommandCancelledReply(responseLanguage);
    }

    if (pendingKundliCommand?.kind === 'delete') {
      if (decision !== 'delete') {
        return buildKundliDeleteConfirmReminder(responseLanguage);
      }

      const next = await deleteSavedKundli(pendingKundliCommand.targetKundliId);
      setSavedKundlis(next);

      const nextActive = next[0]?.kundliData;
      if (activeKundli?.id === pendingKundliCommand.targetKundliId) {
        if (nextActive) {
          setActiveKundli(nextActive);
        } else {
          clearActiveKundli();
        }
      }

      const deletedName = pendingKundliCommand.targetName;
      setPendingKundliCommand(undefined);
      return buildKundliDeletedReply(responseLanguage, deletedName, nextActive);
    }

    if (pendingKundliCommand?.kind === 'edit') {
      if (decision !== 'save-as-new' && decision !== 'update-existing') {
        return buildKundliEditConfirmReminder(responseLanguage);
      }

      const target = savedKundliRecords
        .map(record => record.kundliData)
        .find(item => item.id === pendingKundliCommand.targetKundliId);

      if (!target || !pendingKundliCommand.birthDetails) {
        setPendingKundliCommand(undefined);
        return buildNoKundliForCommandReply(responseLanguage);
      }

      const editedKundli =
        pendingKundliCommand.field === 'name'
          ? buildRenamedKundli(
              target,
              pendingKundliCommand.birthDetails.name,
              decision === 'update-existing',
            )
          : decision === 'update-existing'
            ? {
                ...(await generateKundli(pendingKundliCommand.birthDetails, {
                  ignoreCache: true,
                })),
                id: pendingKundliCommand.targetKundliId,
              }
            : await generateKundli(pendingKundliCommand.birthDetails, {
                ignoreCache: true,
              });
      const savedKundli = attachKundliEditHistory({
        after: editedKundli,
        before: target,
        mode: decision,
        source: 'chat',
      });

      const next = await saveGeneratedKundliLocally(savedKundli, {
        isLoggedIn: auth.isLoggedIn,
        isUpdate: decision === 'update-existing',
      });
      setSavedKundlis(next);
      setActiveKundli(savedKundli);

      const field = pendingKundliCommand.field;
      setPendingKundliCommand(undefined);
      return buildKundliEditedReply(
        responseLanguage,
        savedKundli,
        field,
        decision,
      );
    }

    setPendingKundliCommand(undefined);
    return buildKundliCommandCancelledReply(responseLanguage);
  }

  async function buildEditedBirthDetails(
    kundli: KundliData,
    command: Extract<KundliChatCommand, { kind: 'edit-field' }>,
  ): Promise<BirthDetails | undefined> {
    if (command.field === 'time') {
      return {
        ...kundli.birthDetails,
        isTimeApproximate: false,
        originalTime: undefined,
        rectificationMethod: undefined,
        rectifiedAt: undefined,
        time: command.value,
        timeConfidence: 'entered',
      };
    }

    if (command.field === 'date') {
      return { ...kundli.birthDetails, date: command.value };
    }

    if (command.field === 'name') {
      return { ...kundli.birthDetails, name: command.value };
    }

    const places = await findBirthPlaceCandidates(command.value);
    const place = places[0];

    if (!place) {
      return undefined;
    }

    const updatedPlaceDetails = buildBirthDetailsFromResolvedPlace({
      date: kundli.birthDetails.date,
      isTimeApproximate: kundli.birthDetails.isTimeApproximate,
      name: kundli.birthDetails.name,
      originalPlaceText: command.value,
      resolvedPlace: place,
      time: kundli.birthDetails.time,
    });

    return {
      ...updatedPlaceDetails,
      originalTime: kundli.birthDetails.originalTime,
      rectificationMethod: kundli.birthDetails.rectificationMethod,
      rectifiedAt: kundli.birthDetails.rectifiedAt,
      timeConfidence: kundli.birthDetails.timeConfidence,
    };
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
      language: predictaReplyLanguage,
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

      <ChatSessionPanel
        activeSessionId={activeChatSessionId}
        isSignedIn={auth.isLoggedIn}
        sessions={chatSessions}
        onNewSession={createChatSession}
        onSignIn={() => navigation.navigate(routes.Login)}
        onSwitchSession={switchChatSession}
      />

      <FadeInView className="mt-5">
        <View style={styles.chatLanguageState}>
          <AppText tone="secondary" variant="caption">
            {languageLabels.chatLanguage}:{' '}
            {getLanguageOption(predictaReplyLanguage).englishName}
          </AppText>
          <AppText tone="secondary" variant="caption">
            {languageLabels.appLanguage}:{' '}
            {getLanguageOption(languagePreference.language).englishName}
          </AppText>
        </View>
      </FadeInView>

      <ActiveKundliActions
        compact
        kundli={activeKundli}
        sourceScreen="Chat"
        title="Active Kundli"
      />

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
                navigation.navigate(routes.JaiminiPredicta);
                return;
              }
              if (suggestion.targetScreen === routes.NumerologyPredicta) {
                navigation.navigate(routes.NumerologyPredicta);
                return;
              }
              if (suggestion.targetScreen === routes.SignaturePredicta) {
                navigation.navigate(routes.SignaturePredicta);
                return;
              }
              if (suggestion.targetScreen === routes.BirthTimeDetective) {
                navigation.navigate(routes.BirthTimeDetective);
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
                getListeningMicrocopy(predictaReplyLanguage),
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

function buildBirthTimeConfirmedReply(
  language: SupportedLanguage,
  kundli: KundliData,
  enteredTime: string,
  restoredFromRectified: boolean,
): string {
  const name = kundli.birthDetails.name;
  const restoreLine = restoredFromRectified
    ? `I restored the originally entered time ${enteredTime} and recalculated the Kundli.`
    : `I marked the entered birth time ${enteredTime} as confirmed.`;

  if (language === 'hi') {
    return [
      `Done. ${name} ke liye entered birth time ${enteredTime} confirm kar diya hai.`,
      restoredFromRectified
        ? `Maine rectified time hata kar original entered time ${enteredTime} se Kundli dobara calculate kar di hai.`
        : 'Ab is Kundli par rectified/probable time label nahi lagega.',
      'Ab main normal chart guidance de sakti hoon. Exact event timing mein phir bhi humility rakhungi, because astrology guidance hai, guarantee nahi.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      `Done. ${name} mate entered birth time ${enteredTime} confirm kari didho chhe.`,
      restoredFromRectified
        ? `Maine rectified time hataavi ne original entered time ${enteredTime} thi Kundli fari calculate kari chhe.`
        : 'Have aa Kundli par rectified/probable time label nahi lage.',
      'Have hu normal chart guidance aapi shaku chhu. Exact event timing ma pan humility rakish, karan ke astrology guidance chhe, guarantee nathi.',
    ].join('\n\n');
  }

  return [
    `Done. ${restoreLine}`,
    `${name}'s Kundli is now treated as entered-time confirmed.`,
    'I can continue with normal chart guidance. For exact event timing, I will still keep the answer careful and not treat astrology as a guarantee.',
  ].join('\n\n');
}

function buildBirthTimeConfirmationFailedReply(
  language: SupportedLanguage,
): string {
  if (language === 'hi') {
    return 'Birth time confirm karte waqt issue aa gaya. Please ek baar Birth Time Detective ya Kundli screen se dobara try karein.';
  }

  if (language === 'gu') {
    return 'Birth time confirm karti vakhat issue aavyo. Please Birth Time Detective athva Kundli screen thi fari try karo.';
  }

  return 'I could not confirm the birth time just now. Please try again from Birth Time Detective or the Kundli screen.';
}

function buildRenamedKundli(
  kundli: KundliData,
  name: string,
  updateExisting: boolean,
): KundliData {
  return {
    ...kundli,
    id: updateExisting
      ? kundli.id
      : `kundli-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    birthDetails: {
      ...kundli.birthDetails,
      name,
    },
  };
}

function buildKundliCreateFromChatReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.da03e43b60");
  }
  if (language === 'gu') {
    return getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.7e7eccff57");
  }
  return 'Yes. I can create a new Kundli right here in chat. Send name, DOB, birth time, and birth place. If you only know the DOB, send that first.';
}

function buildNoKundliForCommandReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.92cf795526");
  }
  if (language === 'gu') {
    return getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.35ced5a3b2");
  }
  return 'I do not see a saved Kundli yet. Send birth details first; then I can edit, delete, or switch Kundlis for you.';
}

function buildKundliSetActiveReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.27070699cf", [kundli.birthDetails.name]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.f5f4c4ea7b", [kundli.birthDetails.name]);
  }
  return `${kundli.birthDetails.name}'s Kundli is now active. I will answer from this chart.`;
}

function buildKundliDeleteConfirmReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.c25665f976", [kundli.birthDetails.name]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.d811c98927", [kundli.birthDetails.name]);
  }
  return `You are about to delete ${kundli.birthDetails.name}'s Kundli from your library. Reply "delete Kundli" to confirm, or "cancel" to stop.`;
}

function buildKundliGenericEditReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return `${kundli.birthDetails.name} ki Kundli edit kar sakti hoon. Bataiye kya badalna hai: birth time, DOB, birth place, ya name. Example: "change birth time to 06:45 AM".`;
  }
  if (language === 'gu') {
    return formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.7bc0843ee9", [kundli.birthDetails.name]);
  }
  return `I can edit ${kundli.birthDetails.name}'s Kundli. Tell me what to change: birth time, DOB, birth place, or name. Example: "change birth time to 06:45 AM".`;
}

function buildKundliEditNeedsValueReply(
  language: SupportedLanguage,
  command: Extract<KundliChatCommand, { kind: 'edit-field' }>,
): string {
  if (command.field === 'place') {
    return language === 'en'
      ? 'I could not identify that birth place. Please send city, state, and country.'
      : 'Birth place clear nahi hua. City, state, aur country bhejiye.';
  }

  return language === 'en'
    ? 'I need the exact value before editing the Kundli. Please send it once more clearly.'
    : 'Kundli edit karne ke liye exact value chahiye. Ek baar clearly bhejiye.';
}

function buildKundliEditConfirmReply(
  language: SupportedLanguage,
  kundli: KundliData,
  command: Extract<KundliChatCommand, { kind: 'edit-field' }>,
  nextBirthDetails: BirthDetails,
): string {
  const changeLine = formatKundliChange(command.field, nextBirthDetails);
  if (language === 'hi') {
    return formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.9dd92a2956", [kundli.birthDetails.name, changeLine]);
  }
  if (language === 'gu') {
    return `Hu ${kundli.birthDetails.name} ni Kundli ma aa change kari shaku chhu:\n${changeLine}\n\nDate, time, ke place badlase to chart fari calculate thashe. Reply karo: "update existing", "save as new", ke "cancel".`;
  }
  return `I can make this change to ${kundli.birthDetails.name}'s Kundli:\n${changeLine}\n\nChanging date, time, or place recalculates the chart. Reply "update existing", "save as new", or "cancel".`;
}

function buildKundliDeleteConfirmReminder(language: SupportedLanguage): string {
  return language === 'en'
    ? 'Please reply "delete Kundli" to confirm deletion, or "cancel" to stop.'
    : language === 'hi'
      ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.79cec946ea")
      : getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.7f113f5916");
}

function buildKundliEditConfirmReminder(language: SupportedLanguage): string {
  return language === 'en'
    ? 'Please reply "update existing", "save as new", or "cancel".'
    : language === 'hi'
      ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.9054956606")
      : getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.70bf2b9c9c");
}

function buildKundliCommandCancelledReply(language: SupportedLanguage): string {
  return language === 'en'
    ? 'Done. I did not change the Kundli.'
    : language === 'hi'
      ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.d6988ddfa1")
      : getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.42086b0be9");
}

function buildKundliDeletedReply(
  language: SupportedLanguage,
  deletedName: string,
  nextActive?: KundliData,
): string {
  if (language === 'hi') {
    const nextLine = nextActive
      ? ` Active Kundli ab ${nextActive.birthDetails.name} hai.`
      : '';
    return `${deletedName} ki Kundli library se delete ho gayi.${nextLine}`;
  }
  if (language === 'gu') {
    const nextLine = nextActive
      ? formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.2c193e176a", [nextActive.birthDetails.name])
      : '';
    return formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.ed7c467cc2", [deletedName, nextLine]);
  }
  const nextLine = nextActive
    ? ` Active Kundli: ${nextActive.birthDetails.name}.`
    : '';
  return `${deletedName}'s Kundli has been deleted from your library.${nextLine}`;
}

function buildKundliEditedReply(
  language: SupportedLanguage,
  kundli: KundliData,
  field: KundliEditField | undefined,
  decision: 'save-as-new' | 'update-existing',
): string {
  const action =
    decision === 'update-existing' ? 'updated' : 'saved as a new Kundli';

  if (language === 'hi') {
    return `${kundli.birthDetails.name} ki Kundli ${action}. ${fieldLabel(field)} change apply ho gaya.`;
  }
  if (language === 'gu') {
    return `${kundli.birthDetails.name} ni Kundli ${action}. ${fieldLabel(field)} change apply thai gayo.`;
  }
  return `${kundli.birthDetails.name}'s Kundli has been ${action}. The ${fieldLabel(field)} change is active.`;
}

function formatKundliChange(
  field: KundliEditField,
  birthDetails: BirthDetails,
): string {
  if (field === 'time') {
    return `Birth time: ${birthDetails.time}`;
  }
  if (field === 'date') {
    return `Date of birth: ${birthDetails.date}`;
  }
  if (field === 'place') {
    return `Birth place: ${birthDetails.place}`;
  }
  return `Name: ${birthDetails.name}`;
}

function fieldLabel(field?: KundliEditField): string {
  if (field === 'time') {
    return 'birth time';
  }
  if (field === 'date') {
    return 'date of birth';
  }
  if (field === 'place') {
    return 'birth place';
  }
  return 'name';
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
          <AppText autoTranslate={false}>{message.text}</AppText>
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
        <AppText autoTranslate={false} variant="caption">
          {safety.title}
        </AppText>
        <AppText autoTranslate={false} className="mt-1" tone="secondary" variant="caption">
          {safety.body}
        </AppText>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={reportState === 'sent'}
        onPress={() => void submitReport()}
        style={styles.chatSafetyReport}
      >
        <AppText autoTranslate={false} variant="caption">
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
  const school = getMobilePredictaSchoolLabel(context?.predictaSchool);
  const fromSchool =
    context?.handoffFrom && context.handoffFrom !== context.predictaSchool
      ? getMobilePredictaSchoolLabel(context.handoffFrom)
      : undefined;
  const question = context?.handoffQuestion ?? context?.selectedSection;
  const chartFocus = context?.chartName ?? context?.chartType;
  const reportLine = formatMobileReportContextLine(context);

  if (language === 'hi') {
    return [
      formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.f83a4b3ad9", [school]),
      fromSchool
        ? formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.440185f06a", [fromSchool])
        : undefined,
      chartFocus ? `Selected chart: ${chartFocus}.` : undefined,
      reportLine ? `Report context: ${reportLine}.` : undefined,
      question ? formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.8e19844ac1", [question]) : undefined,
      context?.predictaSchool === 'KP'
        ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.792f6b537e")
        : context?.predictaSchool === 'NADI'
          ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.24512570b2")
          : context?.predictaSchool === 'NUMEROLOGY'
            ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.b7bf034f4d")
            : context?.predictaSchool === 'SIGNATURE'
              ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.d345cf2a51")
          : getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.8fd7e0b7bf"),
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.fbe92869f3"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.51787e3526", [school]),
      fromSchool
        ? formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.feeeeedde9", [fromSchool])
        : undefined,
      chartFocus ? `Selected chart: ${chartFocus}.` : undefined,
      reportLine ? `Report context: ${reportLine}.` : undefined,
      question ? formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.fb75530093", [question]) : undefined,
      context?.predictaSchool === 'KP'
        ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.9d4073d0c6")
        : context?.predictaSchool === 'NADI'
          ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.f0039683e7")
          : context?.predictaSchool === 'NUMEROLOGY'
            ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.c8c43ccae1")
            : context?.predictaSchool === 'SIGNATURE'
              ? getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.6b2d0bee75")
          : getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.95ce23a1fc"),
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.d015e1ff78"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `${school} is ready.`,
    fromSchool
      ? `Context was carried from ${fromSchool}. The method will not be mixed.`
      : undefined,
    chartFocus ? `Selected chart: ${chartFocus}.` : undefined,
    reportLine ? `Report context: ${reportLine}.` : undefined,
    question ? `Your question: ${question}` : undefined,
    context?.predictaSchool === 'KP'
      ? 'The answer will now stay grounded in KP cusps, star lords, sub lords, significators, and ruling planets.'
      : context?.predictaSchool === 'NADI'
        ? 'Jaimini Predicta is ready. I will read through soul role, visible identity, and destiny chapters when calculated evidence is available.'
        : context?.predictaSchool === 'NUMEROLOGY'
          ? 'The answer will now stay grounded in name number, birth number, destiny number, personal timing, and name rhythm.'
          : context?.predictaSchool === 'SIGNATURE'
            ? 'The answer will now stay grounded in confirmed signature traits, self-expression patterns, improvement suggestions, and safe reflection. It is not identity verification or forensic proof.'
        : 'The answer will now stay in regular Parashari Jyotish.',
    'Press Ask, or type your follow-up.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function getMobilePredictaSchoolLabel(
  school: PredictaSchool | undefined,
): string {
  if (school === 'KP') {
    return 'KP Predicta';
  }

  if (school === 'NADI') {
    return 'Jaimini Predicta';
  }

  if (school === 'NUMEROLOGY') {
    return 'Numerology Predicta';
  }

  if (school === 'SIGNATURE') {
    return 'Signature Predicta';
  }

  return 'Regular Predicta';
}

function buildMobileCtaContextIntro(
  context: ChatMessage['context'],
  language: SupportedLanguage,
): string {
  const source = getMobileFriendlySourceName(context?.sourceScreen);
  const focus =
    context?.reportSectionPrompt ??
    context?.selectedDecisionQuestion ??
    context?.selectedRemedyTitle ??
    context?.selectedTimelineEventTitle ??
    context?.reportSectionTitle ??
    context?.reportType ??
    context?.selectedSection ??
    context?.handoffQuestion;
  const reportLine = formatMobileReportContextLine(context);

  if (language === 'hi') {
    return [
      `${source} se aapka context mil gaya hai.`,
      reportLine ? `Report context: ${reportLine}` : undefined,
      focus ? `Ab main yeh dekh rahi hoon: ${focus}` : undefined,
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.6f813b4d01"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.19cc501786", [source]),
      reportLine ? `Report context: ${reportLine}` : undefined,
      focus ? formatNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.c12e397136", [focus]) : undefined,
      getNativeCopy("native.apps.mobile.src.screens.ChatScreen.tsx.bde8f22400"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `I picked this up from ${source}.`,
    reportLine ? `Report context: ${reportLine}` : undefined,
    focus ? `We are looking at: ${focus}` : undefined,
    'I will use your selected Kundli here. Press Ask or type your follow-up.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function getMobileFriendlySourceName(source?: string): string {
  const normalized = (source || 'Predicta')
    .replace(/\bHeader\b/gi, '')
    .replace(/\bMarketplace\b/gi, 'Reports')
    .replace(/\bQuick Actions\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized || /dashboard/i.test(normalized)) {
    return 'your dashboard';
  }

  return normalized;
}

function formatMobileReportContextLine(
  context: ChatMessage['context'],
): string | undefined {
  if (!context?.reportFocus) {
    return undefined;
  }

  return [
    context.reportType ?? 'Predicta report',
    context.reportMode,
    context.reportSchoolLane ? `${context.reportSchoolLane} lane` : undefined,
    context.reportSubjectName ? `for ${context.reportSubjectName}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');
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
      <AppText autoTranslate={false} tone="secondary" variant="caption">
        Suggested next questions
      </AppText>
      {suggestions.slice(0, 4).map(suggestion => (
        <Pressable
          accessibilityRole="button"
          key={suggestion.id}
          onPress={() => onSuggestionPress(suggestion)}
          style={styles.chatSuggestionChip}
        >
          <AppText autoTranslate={false} variant="caption">{suggestion.label}</AppText>
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
        <AppText autoTranslate={false} key={`${paragraph}-${index}`}>
          {paragraph}
        </AppText>
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
        <AppText autoTranslate={false} variant="caption">
          Ask with proof
        </AppText>
        <View style={styles.mobileProofBadge}>
          <AppText autoTranslate={false} variant="caption">{proof.confidence}</AppText>
        </View>
      </View>
      <AppText autoTranslate={false} className="mt-2" tone="secondary" variant="caption">
        Timing: {proof.timing}
      </AppText>
      <View style={styles.mobileProofChipRow}>
        {proof.chartFactors.map(item => (
          <View key={item} style={styles.mobileProofChip}>
            <AppText autoTranslate={false} tone="secondary" variant="caption">
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
  const planetsByName = block.chart.planetDistribution.reduce(
    (current, planet) => ({
      ...current,
      [planet.name]: planet,
    }),
    {} as Record<string, (typeof block.chart.planetDistribution)[number]>,
  );

  return (
    <View style={styles.chatChartCard}>
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <AppText autoTranslate={false} tone="secondary" variant="caption">
            {block.chartType} · {block.insight.eyebrow}
          </AppText>
          <AppText autoTranslate={false} className="mt-1" variant="subtitle">
            {block.chartName}
          </AppText>
          <AppText autoTranslate={false} className="mt-1" tone="secondary" variant="caption">
            {block.ownerName}'s chart focus
          </AppText>
        </View>
        <View style={styles.chatChartStatus}>
          <AppText autoTranslate={false} variant="caption">
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
                    <AppText autoTranslate={false} tone="secondary" variant="caption">
                      {block.chartType}
                    </AppText>
                    <AppText autoTranslate={false} className="text-center" variant="caption">
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
                <AppText autoTranslate={false} tone="secondary" variant="caption">
                  H{cell.house}
                </AppText>
                <AppText autoTranslate={false} tone="secondary" variant="caption">
                  {cell.signShort}
                </AppText>
              </View>
              <AppText autoTranslate={false} className="mt-1" variant="caption">
                {cell.planets.length
                  ? cell.planets
                      .slice(0, 3)
                      .map(planetName => {
                        const planet = planetsByName[planetName];
                        const degree = planet
                          ? ` ${planet.degree.toFixed(0)}°${
                              planet.retrograde ? ' R' : ''
                            }`
                          : '';
                        return `${getPlanetAbbreviation(planetName)}${degree}`;
                      })
                      .join(' ')
                  : '-'}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.chatEvidenceRow}>
        {block.evidenceChips.map(chip => (
          <View key={chip} style={styles.chatEvidenceChip}>
            <AppText autoTranslate={false} tone="secondary" variant="caption">
              {chip}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.chatChartHierarchy}>
        {[
          ['Prediction', block.reportHierarchy.meaning],
          ['Key insight', block.reportHierarchy.keyInsight],
          ['Free understanding', block.reportHierarchy.freeUnderstanding],
          ['Premium depth', block.reportHierarchy.premiumDepth],
          ['Evidence appendix', block.reportHierarchy.technicalAppendix],
        ].map(([label, value]) => (
          <View key={label} style={styles.chatChartHierarchyBlock}>
            <AppText autoTranslate={false} tone="secondary" variant="caption">
              {label}
            </AppText>
            <AppText autoTranslate={false} className="mt-1" variant="caption">
              {value}
            </AppText>
          </View>
        ))}
      </View>

      <View className="mt-3 gap-2">
        {[
          block.insight.mainStrength,
          block.insight.mainChallenge,
          block.insight.currentGuidance,
          ...block.insight.freeInsights,
        ].slice(0, 4).map(item => (
          <AppText autoTranslate={false} key={item} tone="secondary" variant="caption">
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
            <AppText autoTranslate={false} variant="caption">{cta.label}</AppText>
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
      <AppText autoTranslate={false} className="flex-1" tone="secondary">
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
  chatChartHierarchy: {
    gap: 8,
    marginTop: 12,
  },
  chatChartHierarchyBlock: {
    backgroundColor: 'rgba(40, 210, 171, 0.08)',
    borderColor: 'rgba(40, 210, 171, 0.18)',
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
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
  chatLanguageState: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.055)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
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
