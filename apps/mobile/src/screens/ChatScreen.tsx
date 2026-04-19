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
import { detectIntent } from '@pridicta/ai';
import { getProductUpgradePrompt } from '@pridicta/monetization';
import { extractBirthDetailsFromText } from '../services/ai/birthDetailsExtractor';
import { askPridicta } from '../services/ai/pridictaService';
import { playReplyChime } from '../services/audio/replyChime';
import { trackAnalyticsEvent } from '../services/analytics/analyticsService';
import { syncRedeemedGuestPassToUser } from '../services/firebase/passCodePersistence';
import { useAppStore } from '../store/useAppStore';
import { colors } from '../theme/colors';
import type {
  BirthDetailsDraft,
  ChatMessage,
  DecisionMirrorResponse,
} from '../types/astrology';

const predictaLogo = require('../assets/predicta-logo.png');

function createMessage(
  role: ChatMessage['role'],
  text: string,
  context?: ChatMessage['context'],
  decisionMirror?: DecisionMirrorResponse,
): ChatMessage {
  return {
    context,
    createdAt: new Date().toISOString(),
    decisionMirror,
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
  const [streamingText, setStreamingText] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeChartContext = useAppStore(state => state.activeChartContext);
  const activeKundli = useAppStore(state => state.activeKundli);
  const auth = useAppStore(state => state.auth);
  const chatSoundEnabled = useAppStore(state => state.chatSoundEnabled);
  const userPlan = useAppStore(state => state.userPlan);
  const pendingBirthDetailsDraft = useAppStore(
    state => state.pendingBirthDetailsDraft,
  );
  const preferredLanguage = useAppStore(state => state.preferredLanguage);
  const setPendingBirthDetailsDraft = useAppStore(
    state => state.setPendingBirthDetailsDraft,
  );
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
  const messages = useAppStore(state =>
    state.activeKundliId
      ? state.conversationsByKundli[state.activeKundliId] ?? []
      : [],
  );
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  function streamAssistantResponse(
    text: string,
    decisionMirror?: DecisionMirrorResponse,
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
          createMessage('pridicta', text, activeChartContext, decisionMirror),
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

    if (!activeKundli) {
      appendConversationMessage(
        createMessage('user', trimmedInput, activeChartContext),
      );
      setInput('');
      setIsTyping(true);
      setStreamingText('');

      try {
        const result = await extractBirthDetailsFromText(trimmedInput);
        const mergedDraft = mergeBirthDetailsDraft(
          pendingBirthDetailsDraft,
          result.extracted,
          trimmedInput,
        );
        setPendingBirthDetailsDraft(mergedDraft);
        streamAssistantResponse(
          buildBirthIntakeResponse(mergedDraft, result, () => {
            navigation.navigate(routes.Kundli);
          }),
        );
      } catch {
        streamAssistantResponse(
          'I can help create the kundli, but I need the birth date, birth time, and birth place in a clear format. You can write something like: 16 August 1994, 6:42 AM, Mumbai.',
        );
      }
      return;
    }

    const freeQuestionAvailable = canAskQuestion();
    const paidQuestionAvailable = hasPaidQuestionCredits();

    if (!freeQuestionAvailable && !paidQuestionAvailable) {
      const questionPrompt = getProductUpgradePrompt('FIVE_QUESTIONS');
      appendConversationMessage(
        createMessage(
          'pridicta',
          "You've reached today's guidance limit. Your reading is saved. You can continue tomorrow, add a few questions, or unlock more Predicta guidance today.",
          activeChartContext,
        ),
      );
      trackAnalyticsEvent({
        eventName: 'limit_reached',
        metadata: {
          limit: 'questions',
          productId: questionPrompt.productId ?? null,
        },
        userId: auth.userId,
      });
      navigation.navigate(routes.Paywall, {
        source: 'chat_limit',
        suggestedProductId: questionPrompt.productId,
        title: questionPrompt.title,
      });
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
        message: trimmedInput,
        preferredLanguage,
        userPlan: effectivePlan,
      });

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

      streamAssistantResponse(response.text, response.decisionMirror);
    } catch {
      streamAssistantResponse(
        'I could not complete the reading right now. Please try again with one focused question.',
      );
    }
  }

  return (
    <Screen>
      <FadeInView style={styles.header}>
        <View style={styles.logoShell}>
          <Image
            accessibilityIgnoresInvertColors
            source={predictaLogo}
            style={styles.logo}
          />
        </View>
        <View style={styles.headerCopy}>
          <AppText tone="secondary" variant="caption">
            PRIVATE READING
          </AppText>
          <GradientText variant="title">Chat with Predicta</GradientText>
        </View>
      </FadeInView>

      <View style={styles.thread}>
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
              text: streamingText || 'Predicta is listening...',
            }}
            typing={!streamingText}
          />
        ) : null}
      </View>

      <FadeInView delay={320}>
        <TextInput
          multiline
          onChangeText={setInput}
          placeholder="Ask Predicta anything about your chart..."
          placeholderTextColor={colors.secondaryText}
          textAlignVertical="top"
          value={input}
          style={styles.input}
        />
      </FadeInView>

      <View style={styles.sendButton}>
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

function syncGuestPassUsage(userId?: string): void {
  const pass = useAppStore.getState().redeemedGuestPass;

  if (!userId || !pass) {
    return;
  }

  syncRedeemedGuestPassToUser(userId, pass).catch(() => undefined);
}

function mergeBirthDetailsDraft(
  current: BirthDetailsDraft | undefined,
  extracted: BirthDetailsDraft,
  rawInput: string,
): BirthDetailsDraft {
  const merged = {
    ...current,
    ...Object.fromEntries(
      Object.entries(extracted).filter(([, value]) => value !== undefined),
    ),
  } as BirthDetailsDraft;
  const meridiem = rawInput.match(/\b(am|pm|morning|evening|night)\b/i)?.[1];

  if (merged.time && meridiem) {
    merged.time = applyMeridiemToTime(merged.time, meridiem);
    merged.meridiem =
      meridiem.toLowerCase() === 'am' || meridiem.toLowerCase() === 'morning'
        ? 'AM'
        : 'PM';
  }

  return merged;
}

function applyMeridiemToTime(time: string, meridiem: string): string {
  const [hourText, minuteText] = time.split(':');
  let hour = Number(hourText);
  const normalized = meridiem.toLowerCase();

  if (
    (normalized === 'pm' ||
      normalized === 'evening' ||
      normalized === 'night') &&
    hour < 12
  ) {
    hour += 12;
  }

  if ((normalized === 'am' || normalized === 'morning') && hour === 12) {
    hour = 0;
  }

  return `${String(hour).padStart(2, '0')}:${minuteText}`;
}

function buildBirthIntakeResponse(
  draft: BirthDetailsDraft,
  result: Awaited<ReturnType<typeof extractBirthDetailsFromText>>,
  onReady: () => void,
): string {
  const missing = result.missingFields.filter(field => {
    if (field === 'birth_place') {
      return !draft.city;
    }

    if (field === 'am_pm') {
      return !draft.meridiem;
    }

    return !draft[field as keyof BirthDetailsDraft];
  });

  if (result.ambiguities.length > 0) {
    const first = result.ambiguities[0];
    return [
      'I found most of the birth details, but one part needs confirmation before I can prepare the kundli.',
      first.issue,
      first.options?.length ? `Options: ${first.options.join(' / ')}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (missing.length > 0) {
    return [
      'I found:',
      formatDraftSummary(draft),
      `Please share the missing detail: ${missing
        .map(formatMissingField)
        .join(', ')}.`,
    ].join('\n\n');
  }

  onReady();

  return [
    'Thank you. I found the details needed for a kundli.',
    formatDraftSummary(draft),
    'I opened the Kundli screen so you can verify the birth place and timezone before Predicta calculates anything.',
  ].join('\n\n');
}

function formatDraftSummary(draft: BirthDetailsDraft): string {
  return [
    draft.name ? `Name: ${draft.name}` : '',
    draft.date ? `Date: ${draft.date}` : '',
    draft.time ? `Time: ${draft.time}` : '',
    draft.city
      ? `Birth place: ${[draft.city, draft.state, draft.country]
          .filter(Boolean)
          .join(', ')}`
      : draft.placeText
      ? `Birth place: ${draft.placeText}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');
}

function formatMissingField(field: string): string {
  const labels: Record<string, string> = {
    am_pm: 'AM or PM',
    birth_place: 'birth place',
    city: 'city',
    country: 'country',
    date: 'date of birth',
    name: 'name',
    state: 'state or province',
    time: 'birth time',
  };

  return labels[field] ?? field;
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
      delay={delay}
      style={[
        styles.bubbleWrap,
        isUser ? styles.userBubbleWrap : styles.pridictaBubbleWrap,
      ]}
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
            <TypingPulse />
          ) : message.decisionMirror ? (
            <DecisionMirrorCard mirror={message.decisionMirror} />
          ) : (
            <AppText>{message.text}</AppText>
          )}
        </LinearGradient>
      )}
    </FadeInView>
  );
}

function DecisionMirrorCard({
  mirror,
}: {
  mirror: DecisionMirrorResponse;
}): React.JSX.Element {
  return (
    <View>
      <AppText tone="secondary" variant="caption">
        DECISION MIRROR
      </AppText>
      <AppText style={styles.mirrorSummary}>{mirror.decisionSummary}</AppText>
      <MirrorSection
        items={mirror.supportiveChartFactors}
        title="Supportive chart factors"
      />
      <MirrorSection items={mirror.cautionFactors} title="Caution factors" />
      <MirrorSection
        items={mirror.timingWindows.map(
          window => `${window.label}: ${window.focus}`,
        )}
        title="Timing windows"
      />
      <View style={styles.mirrorCallout}>
        <AppText variant="caption">NEXT STEP</AppText>
        <AppText style={styles.mirrorCalloutText}>
          {mirror.practicalNextStep}
        </AppText>
      </View>
      <AppText style={styles.mirrorSmall} tone="secondary">
        {mirror.emotionalBiasCheck}
      </AppText>
      <AppText style={styles.mirrorSmall} tone="secondary">
        {mirror.revisitLater}
      </AppText>
      <AppText style={styles.mirrorDisclaimer} tone="secondary" variant="caption">
        {mirror.disclaimer}
      </AppText>
    </View>
  );
}

function MirrorSection({
  items,
  title,
}: {
  items: string[];
  title: string;
}): React.JSX.Element {
  return (
    <View style={styles.mirrorSection}>
      <AppText variant="caption">{title}</AppText>
      {items.map(item => (
        <AppText key={item} style={styles.mirrorBullet} tone="secondary">
          {`- ${item}`}
        </AppText>
      ))}
    </View>
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
    <Animated.View style={[styles.typingPulse, animatedStyle]}>
      <View style={styles.typingDot} />
      <View style={styles.typingDot} />
      <View style={styles.typingDot} />
      <AppText style={styles.typingText} tone="secondary">
        Predicta is reading the pattern
      </AppText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bubbleWrap: {
    maxWidth: '88%',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  input: {
    backgroundColor: colors.glass,
    borderColor: colors.borderSoft,
    borderRadius: 20,
    borderWidth: 1,
    color: colors.primaryText,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 32,
    minHeight: 132,
    padding: 18,
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
  mirrorBullet: {
    marginTop: 8,
  },
  mirrorCallout: {
    backgroundColor: colors.glassWash,
    borderColor: colors.borderSoft,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 16,
    padding: 14,
  },
  mirrorCalloutText: {
    marginTop: 8,
  },
  mirrorDisclaimer: {
    marginTop: 16,
  },
  mirrorSection: {
    marginTop: 16,
  },
  mirrorSmall: {
    marginTop: 12,
  },
  mirrorSummary: {
    marginTop: 10,
  },
  pridictaBubble: {
    borderColor: colors.borderGlow,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    padding: 18,
    shadowColor: colors.gradient[0],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  pridictaBubbleWrap: {
    alignSelf: 'flex-start',
  },
  sendButton: {
    marginTop: 20,
  },
  thread: {
    gap: 16,
    marginTop: 28,
  },
  userBubble: {
    backgroundColor: colors.bubbleUser,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  userBubbleWrap: {
    alignSelf: 'flex-end',
  },
  typingDot: {
    backgroundColor: colors.gradient[1],
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  typingPulse: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  typingText: {
    marginLeft: 8,
  },
});
