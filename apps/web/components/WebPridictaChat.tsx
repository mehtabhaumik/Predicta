'use client';

import { useSearchParams } from 'next/navigation';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  buildChatChartReplyText,
  buildChatFollowUps,
  buildChartContextIntro,
  buildChartRenderModel,
  buildChartSelectionPrompt,
  chartContextFromChatBlock,
  buildPredictaActionReply,
  buildEnglishSwitchDecisionReply,
  buildEnglishSwitchPrompt,
  buildPredictaLearningSuggestion,
  composeChatChartBlock,
  detectChatChartIntent,
  detectEnglishSwitchDecision,
  detectKundliChatCommand,
  detectKundliCommandDecision,
  findKundliBySpokenName,
  getChartReadingNote,
  findHouseCell,
  learnPredictaInteraction,
  NORTH_INDIAN_HOUSE_POLYGONS,
  preparePredictaLanguageContext,
  shouldUseStandardHouseMeaning,
  shouldAskBeforeSwitchingToEnglish,
  shouldAutoSwitchToRegionalLanguage,
  attachKundliEditHistory,
  type KundliChatCommand,
  type KundliEditField,
  type PredictaInteractionMemory,
} from '@pridicta/astrology';
import {
  getLanguageLabels,
  getLanguageOption,
} from '@pridicta/config/language';
import {
  buildBirthIntakeReply,
  type PredictaBirthMemory,
} from '@pridicta/config/predictaMemory';
import {
  getBirthExtractionFailureReply,
  getBirthIntakeWelcome,
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
import type {
  BirthDetails,
  ChartContext,
  ChatChartBlock,
  ChatMessageBlock,
  ChatSafetyMeta,
  ChatSuggestedCta,
  ChartType,
  KundliData,
  PredictaSchool,
  SupportedLanguage,
} from '@pridicta/types';
import { findWebBirthPlace } from '../lib/birth-places';
import { useLanguagePreference } from '../lib/language-preference';
import {
  askPridictaFromWeb,
  extractBirthDetailsFromWeb,
  getWebSafetyIdentifier,
} from '../lib/pridicta-ai';
import { saveWebAutoSaveMemory } from '../lib/web-auto-save-memory';
import {
  canCreateAdditionalWebKundli,
  generateKundliFromWeb,
  deleteWebKundli,
  loadWebKundliStore,
  resolveSharedWebKundliContext,
  saveWebKundli,
  saveWebActiveChartContext,
  setActiveWebKundli,
  WEB_KUNDLI_UPDATED_EVENT,
} from '../lib/web-kundli-storage';
import {
  formatWebChatTranscript,
  loadWebChatTranscript,
  openPrintableWebChatTranscript,
  sanitizeTranscriptCopy,
} from '../lib/web-chat-export';
import {
  buildPassCostGuardrailReply,
  buildPassCostGuardrailSuggestions,
  consumeWebAiBudget,
  getWebPassCostDisplay,
  type WebPassCostDisplay,
} from '../lib/web-pass-cost-guardrails';
import {
  getKundliAnimationStyle,
  getKundliAnimationSurfaceProps,
} from '../lib/kundli-animation-contract';
import { WebActiveKundliActions } from './WebActiveKundliActions';
import { AuthDialog } from './AuthDialog';
import { PlanetGlyph } from './PlanetGlyph';
import { ChartLegend, NorthIndianChartLines } from './WebKundliChart';
import { getFirebaseWebAuth } from '../lib/firebase/client';
import {
  getOrCreateBrowserDeviceId,
  getOrCreateWebGuestSession,
} from '../lib/web-guest-session';

const WEB_CHAT_MEMORY_KEY = 'predicta.webChatMemory.v4';
const WEB_CHAT_SESSIONS_KEY_PREFIX = 'predicta.webChatSessions.v1';
const WEB_REPLY_FEEDBACK_KEY = 'pridicta.replyFeedbackSignals.v1';
const WEB_REPLY_FEEDBACK_SESSION_KEY = 'pridicta.replyFeedbackSession.v1';
const WEB_REDEEMED_PASS_KEY = 'pridicta.redeemedGuestPass.v1';
const WEB_STAR_RATING_KEY = 'pridicta.starRatingMoments.v1';
const WEB_STAR_RATING_LAST_ASKED_KEY = 'pridicta.starRatingLastAskedAt.v1';
const WEB_STAR_RATING_SESSION_DONE_KEY =
  'pridicta.starRatingSessionDone.v1';
const MAX_AI_HISTORY_MESSAGES = 8;
const MAX_STORED_REPLY_FEEDBACK = 250;
const MAX_STORED_STAR_RATINGS = 100;

type ReplyFeedbackAction = 'copy' | 'down' | 'up';

type ReplyFeedbackSignal = {
  action: ReplyFeedbackAction;
  appLanguage: SupportedLanguage;
  chatLanguage: SupportedLanguage;
  createdAt: string;
  deviceId?: string;
  familyContext?: {
    selectedFamilyKarmaMap?: boolean;
    selectedFamilyMemberCount?: number;
  };
  guestPassId?: string;
  guestProfileId?: string;
  kundliId?: string;
  messageHash: string;
  messageId: string;
  route: string;
  school: 'KP' | 'NADI' | 'NUMEROLOGY' | 'SIGNATURE' | 'PARASHARI';
  selectedChart?: string;
  selectedHouse?: number;
  selectedPlanet?: string;
  sessionId: string;
  sourceScreen?: string;
  userEmail?: string;
  userId?: string;
};

type StarRatingMoment = {
  messageId?: string;
  replyCount: number;
  trigger: 'periodic' | 'smoke';
};

type StarRatingSignal = {
  appLanguage: SupportedLanguage;
  chatLanguage: SupportedLanguage;
  createdAt: string;
  deviceId?: string;
  guestPassId?: string;
  guestProfileId?: string;
  kundliId?: string;
  messageId?: string;
  rating: number;
  replyCount: number;
  route: string;
  school: 'KP' | 'NADI' | 'NUMEROLOGY' | 'SIGNATURE' | 'PARASHARI';
  selectedChart?: string;
  selectedHouse?: number;
  selectedPlanet?: string;
  sessionId: string;
  sourceScreen?: string;
  trigger: StarRatingMoment['trigger'];
  userEmail?: string;
  userId?: string;
};

type WebMessage = {
  id: string;
  role: 'user' | 'pridicta';
  text: string;
  blocks?: ChatMessageBlock[];
  context?: ChartContext;
  suggestions?: ChatSuggestedCta[];
  safety?: ChatSafetyMeta;
};

type WebChatMemory = {
  birthMemory?: PredictaBirthMemory;
  chatLanguage?: SupportedLanguage;
  messages: WebMessage[];
  predictaMemory?: PredictaInteractionMemory;
};

type WebChatSession = {
  activeChartContext?: ChartContext;
  birthMemory?: PredictaBirthMemory;
  chatLanguage: SupportedLanguage;
  createdAt: string;
  id: string;
  kundliId?: string;
  messages: WebMessage[];
  predictaMemory?: PredictaInteractionMemory;
  replyLanguage: SupportedLanguage;
  school?: 'KP' | 'NADI' | 'NUMEROLOGY' | 'SIGNATURE' | 'PARASHARI';
  selectedChart?: string;
  selectedHouse?: number;
  title: string;
  updatedAt: string;
};

type WebChatSessionStore = {
  activeSessionId?: string;
  sessions: WebChatSession[];
};

type PendingEnglishSwitch = {
  fromLanguage: Exclude<SupportedLanguage, 'en'>;
  requestedAt: string;
};

type PendingKundliCommand = {
  birthDetails?: BirthDetails;
  field?: KundliEditField;
  kind: 'delete' | 'edit';
  targetKundliId: string;
  targetName: string;
  value?: string;
};

type ParsedProofReply = {
  body: string[];
  proof?: {
    chartFactors: string[];
    confidence: string;
    timing: string;
  };
};

export type WebPredictaChatRoom = {
  body: string;
  prompt: string;
  school: PredictaSchool;
  sourceScreen: string;
  title: string;
};

export function WebPridictaChat({
  room,
}: {
  room?: WebPredictaChatRoom;
} = {}): React.JSX.Element {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const {
    language,
    predictaReplyLanguage,
    setPredictaReplyLanguage: persistPredictaReplyLanguage,
  } = useLanguagePreference();
  const labels = getLanguageLabels(language);
  const appLanguageOption = getLanguageOption(language);
  const loadedQueryPromptRef = useRef('');
  const searchParams = useSearchParams();
  const queryString = buildRoomQueryString(searchParams.toString(), room);
  const didLoadMemory = useRef(false);
  const responseSafetyRef = useRef<ChatSafetyMeta | undefined>(undefined);
  const pendingRichBlocksRef = useRef<ChatMessageBlock[] | undefined>(
    undefined,
  );
  const starRatingForceShownRef = useRef(false);
  const passCostSuggestionsRef = useRef<ChatSuggestedCta[] | undefined>(
    undefined,
  );
  const threadRef = useRef<HTMLDivElement | null>(null);
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [savedKundlis, setSavedKundlis] = useState<KundliData[]>([]);
  const [birthMemory, setBirthMemory] = useState<PredictaBirthMemory>();
  const [predictaMemory, setPredictaMemory] =
    useState<PredictaInteractionMemory>();
  const [passCostDisplay, setPassCostDisplay] = useState<
    WebPassCostDisplay | undefined
  >();
  const [pendingEnglishSwitch, setPendingEnglishSwitch] =
    useState<PendingEnglishSwitch>();
  const [pendingKundliCommand, setPendingKundliCommand] =
    useState<PendingKundliCommand>();
  const [chatLanguage, setChatLanguage] =
    useState<SupportedLanguage>(predictaReplyLanguage);
  const [activeChartContext, setActiveChartContext] = useState<ChartContext>();
  const [messages, setMessages] = useState<WebMessage[]>(() =>
    buildInitialMessages(predictaReplyLanguage),
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string>();
  const [chatAccount, setChatAccount] = useState<
    { email?: string | null; uid: string } | undefined
  >();
  const [activeChatSessionId, setActiveChatSessionId] = useState<string>();
  const [chatSessions, setChatSessions] = useState<WebChatSession[]>([]);
  const replyFeedbackSessionIdRef = useRef<string | undefined>(undefined);
  const [replyFeedbackState, setReplyFeedbackState] = useState<
    Record<string, ReplyFeedbackAction>
  >({});
  const [starRatingMoment, setStarRatingMoment] =
    useState<StarRatingMoment | null>(null);
  const [submittedStarRating, setSubmittedStarRating] = useState<number>();
  const [conversationCopyState, setConversationCopyState] = useState<
    'idle' | 'copied'
  >('idle');
  const lastPredictaMessageId = [...messages]
    .reverse()
    .find(message => message.role === 'pridicta')?.id;

  useEffect(() => {
    function refreshKundlis() {
      const store = loadWebKundliStore();
      const shared = resolveSharedWebKundliContext(
        store.activeChartContext,
        store.activeKundli,
      );
      setKundli(shared.kundli);
      setSavedKundlis(store.savedKundlis);
      setActiveChartContext(current => current ?? shared.chartContext);
    }

    refreshKundlis();
    window.addEventListener('storage', refreshKundlis);
    window.addEventListener(WEB_KUNDLI_UPDATED_EVENT, refreshKundlis);

    const stored = loadWebChatMemory();

    if (stored) {
      const rememberedContext = [...stored.messages]
        .reverse()
        .find(message => message.context)?.context;
      const rememberedShared = resolveSharedWebKundliContext(rememberedContext);
      setBirthMemory(stored.birthMemory);
      setChatLanguage(stored.chatLanguage ?? predictaReplyLanguage);
      setPredictaMemory(stored.predictaMemory);
      setActiveChartContext(current => current ?? rememberedShared.chartContext);
      if (rememberedShared.kundli) {
        setKundli(rememberedShared.kundli);
      }
      if (!room) {
        setMessages(
          stored.messages.length
            ? stored.messages.map(sanitizeStoredMessage)
            : buildInitialMessages(predictaReplyLanguage),
        );
      }
    }

    let unsubscribeAuth: (() => void) | undefined;
    try {
      unsubscribeAuth = onAuthStateChanged(getFirebaseWebAuth(), user => {
        const account = user?.uid
          ? {
              email: user.email,
              uid: user.uid,
            }
          : undefined;
        setChatAccount(account);

        if (!account) {
          setActiveChatSessionId(undefined);
          setChatSessions([]);
          return;
        }

        const sessionState = ensureWebChatSessionStore(account.uid, {
          activeChartContext,
          birthMemory: stored?.birthMemory,
          chatLanguage: stored?.chatLanguage ?? predictaReplyLanguage,
          kundliId: kundli?.id,
          messages: stored?.messages.length
            ? stored.messages.map(sanitizeStoredMessage)
            : buildInitialMessages(predictaReplyLanguage),
          predictaMemory: stored?.predictaMemory,
          replyLanguage: predictaReplyLanguage,
        });
        const activeSession = getActiveWebChatSession(sessionState);

        setChatSessions(sessionState.sessions);
        setActiveChatSessionId(sessionState.activeSessionId);
        if (activeSession) {
          setBirthMemory(activeSession.birthMemory);
          setChatLanguage(activeSession.chatLanguage);
          setPredictaMemory(activeSession.predictaMemory);
          setActiveChartContext(current => {
            if (current) {
              return current;
            }

            return resolveSharedWebKundliContext(
              activeSession.activeChartContext,
            ).chartContext;
          });
          if (!room) {
            setMessages(activeSession.messages.map(sanitizeStoredMessage));
          }
        }
      });

    } catch {
      // Chat still works as a single guest thread if sign-in is unavailable.
    }

    setPassCostDisplay(getWebPassCostDisplay(language));

    didLoadMemory.current = true;

    return () => {
      window.removeEventListener('storage', refreshKundlis);
      window.removeEventListener(WEB_KUNDLI_UPDATED_EVENT, refreshKundlis);
      unsubscribeAuth?.();
    };
  }, []);

  useEffect(() => {
    setPassCostDisplay(getWebPassCostDisplay(language));
  }, [language]);

  useEffect(() => {
    if (activeChatSessionId) {
      replyFeedbackSessionIdRef.current = activeChatSessionId;
    }
  }, [activeChatSessionId]);

  useEffect(() => {
    if (!didLoadMemory.current || !activeChartContext) {
      return;
    }

    const recoveredKundli = recoverActiveKundli(activeChartContext);
    if (recoveredKundli) {
      setSavedKundlis(loadWebKundliStore().savedKundlis);
    }
    saveWebActiveChartContext(activeChartContext);
  }, [activeChartContext, kundli?.id]);

  useEffect(() => {
    if (!didLoadMemory.current) {
      return;
    }

    const sanitizedMessages = messages.map(sanitizeStoredMessage);
    saveWebChatMemory({
      birthMemory,
      chatLanguage,
      messages: sanitizedMessages,
      predictaMemory,
    });

    if (chatAccount?.uid && activeChatSessionId) {
      const sessionState = upsertWebChatSession(chatAccount.uid, {
        activeChartContext,
        birthMemory,
        chatLanguage,
        id: activeChatSessionId,
        kundliId: kundli?.id,
        messages: sanitizedMessages,
        predictaMemory,
        replyLanguage: chatLanguage,
      });
      setChatSessions(sessionState.sessions);
    }
  }, [
    activeChartContext,
    activeChatSessionId,
    birthMemory,
    chatAccount?.uid,
    chatLanguage,
    kundli?.id,
    messages,
    predictaMemory,
  ]);

  useEffect(() => {
    const thread = threadRef.current;

    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }
  }, [messages, isSending]);

  useEffect(() => {
    if (isSending || starRatingMoment || submittedStarRating) {
      return;
    }

    const predictaReplies = messages.filter(
      message => message.role === 'pridicta',
    );
    const replyCount = predictaReplies.length;
    const forceMoment = new URLSearchParams(queryString).has(
      'star-rating-smoke',
    );

    if (forceMoment && starRatingForceShownRef.current) {
      return;
    }

    if (
      !shouldOfferStarRatingMoment({
        force: forceMoment,
        replyCount,
      })
    ) {
      return;
    }

    const lastReply = predictaReplies[predictaReplies.length - 1];
    setStarRatingMoment({
      messageId: lastReply?.id,
      replyCount,
      trigger: forceMoment ? 'smoke' : 'periodic',
    });
    if (forceMoment) {
      starRatingForceShownRef.current = true;
    }
    if (!forceMoment) {
      markStarRatingAsked();
    }
  }, [
    isSending,
    messages,
    queryString,
    starRatingMoment,
    submittedStarRating,
  ]);

  useEffect(() => {
    setMessages(current =>
      current.length === 1 && current[0].id === 'welcome'
        ? buildInitialMessages(chatLanguage)
        : current,
    );
  }, [chatLanguage]);

  function recoverActiveKundli(
    context = activeChartContext,
  ): KundliData | undefined {
    const shared = resolveSharedWebKundliContext(context, kundli);
    const recovered = shared.kundli;

    if (recovered && recovered.id !== kundli?.id) {
      setKundli(recovered);
    }
    if (
      shared.chartContext &&
      shared.chartContext.kundliId &&
      shared.chartContext.kundliId !== context?.kundliId
    ) {
      setActiveChartContext(shared.chartContext);
      saveWebActiveChartContext(shared.chartContext);
    }

    return recovered;
  }

  async function handleReplyFeedback(
    message: WebMessage,
    action: ReplyFeedbackAction,
  ): Promise<void> {
    if (message.role !== 'pridicta') {
      return;
    }

    if (action === 'copy') {
      try {
        await copyChatMessage(message, setCopiedMessageId);
      } catch {
        setCopiedMessageId(message.id);
        window.setTimeout(() => setCopiedMessageId(undefined), 1600);
      }
    }

    setReplyFeedbackState(current => ({
      ...current,
      [message.id]: action,
    }));

    replyFeedbackSessionIdRef.current ??=
      activeChatSessionId ?? getOrCreateReplyFeedbackSessionId();

    captureReplyFeedbackSignal({
      action,
      appLanguage: language,
      chatLanguage,
      context: message.context ?? activeChartContext,
      kundli,
      message,
      sessionId: replyFeedbackSessionIdRef.current,
    });
  }

  function submitStarRating(rating: number): void {
    if (!starRatingMoment) {
      return;
    }

    replyFeedbackSessionIdRef.current ??=
      activeChatSessionId ?? getOrCreateReplyFeedbackSessionId();
    const ratedMessage = starRatingMoment.messageId
      ? messages.find(message => message.id === starRatingMoment.messageId)
      : undefined;
    const context = ratedMessage?.context ?? activeChartContext;

    captureStarRatingSignal({
      appLanguage: language,
      chatLanguage,
      context,
      kundli,
      messageId: starRatingMoment.messageId,
      rating,
      replyCount: starRatingMoment.replyCount,
      sessionId: replyFeedbackSessionIdRef.current,
      trigger: starRatingMoment.trigger,
    });

    setSubmittedStarRating(rating);
    window.setTimeout(() => {
      setStarRatingMoment(null);
      setSubmittedStarRating(undefined);
    }, 1400);
  }

  function dismissStarRating(): void {
    markStarRatingSessionDone();
    setStarRatingMoment(null);
  }

  useEffect(() => {
    if (!queryString || loadedQueryPromptRef.current === queryString) {
      return;
    }

    const params = new URLSearchParams(queryString);
    const prompt = params.get('prompt');
    const chartContext = chartContextFromParams(params);
    const ctaContext = chartContext ?? ctaContextFromParams(params);

    if (prompt || ctaContext) {
      loadedQueryPromptRef.current = queryString;
      if (ctaContext) {
        const selectedSection =
          prompt ||
          ctaContext.selectedSection ||
          (ctaContext.chartType
            ? buildChartSelectionPrompt(ctaContext)
            : ctaContext.handoffQuestion) ||
          `Help me with ${getFriendlySourceName(ctaContext.sourceScreen).toLowerCase()}.`;
        const baseContext = {
          ...ctaContext,
          selectedSection,
        };
        const shared = resolveSharedWebKundliContext(baseContext, kundli);
        const nextContext = shared.chartContext ?? baseContext;
        const contextKundli = shared.kundli;

        if (contextKundli) {
          setKundli(contextKundli);
        }

        const contextReply = createPridictaReply(
          nextContext.predictaSchool
            ? buildSchoolContextIntro(nextContext, language)
            : nextContext.chartType
              ? buildChartContextIntro(nextContext, language)
              : buildCtaContextIntro(nextContext, language),
          language,
          {
            context: nextContext,
            kundli: contextKundli ?? kundli,
            lastText: selectedSection,
          },
        );

        setActiveChartContext(nextContext);
        saveWebActiveChartContext(nextContext);
        setInput(selectedSection);
        setMessages(current =>
          current.length === 1 && current[0].id === 'welcome'
            ? [contextReply]
            : [...current, contextReply],
        );
        return;
      }

      const briefingDate = params.get('briefingDate');
      const decisionQuestion = params.get('decisionQuestion');
      const decisionArea = params.get('decisionArea');
      const decisionState = params.get('decisionState');
      const remedyTitle = params.get('remedyTitle');
      const birthTimeDetective = params.get('birthTimeDetective');
      setInput(prompt ?? '');
      setMessages(current => [
        ...current,
        createPridictaReply(
          buildContextMessage({
            birthTimeDetective: Boolean(birthTimeDetective),
            briefingDate,
            decisionArea,
            decisionQuestion: Boolean(decisionQuestion),
            decisionState,
            language,
            remedyTitle,
          }),
          language,
          {
            context: activeChartContext,
            kundli,
            lastText: prompt ?? '',
          },
        ),
      ]);
    }
  }, [activeChartContext, kundli, language, queryString]);

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();

    if (!text || isSending) {
      return;
    }

    if (!overrideText) {
      setInput('');
    } else {
      setInput('');
    }
    setIsSending(true);
    setMessages(current => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', text },
    ]);

    try {
      const languageContext = preparePredictaLanguageContext({
        memory: predictaMemory,
        selectedLanguage: chatLanguage,
        text,
      });
      const switchDecision = pendingEnglishSwitch
        ? detectEnglishSwitchDecision(text)
        : 'none';

      if (pendingEnglishSwitch && switchDecision !== 'none') {
        if (switchDecision === 'approve') {
          setChatLanguage('en');
          persistPredictaReplyLanguage('en');
        }
        setPendingEnglishSwitch(undefined);
        setMessages(current => [
          ...current,
          createPridictaReply(
            buildEnglishSwitchDecisionReply({
              currentLanguage: pendingEnglishSwitch.fromLanguage,
              decision: switchDecision,
            }),
            switchDecision === 'approve' ? 'en' : pendingEnglishSwitch.fromLanguage,
            { context: activeChartContext, kundli, lastText: text },
          ),
        ]);
        return;
      }

      if (pendingEnglishSwitch && switchDecision === 'none') {
        setMessages(current => [
          ...current,
          createPridictaReply(
            buildEnglishSwitchPrompt(pendingEnglishSwitch.fromLanguage),
            pendingEnglishSwitch.fromLanguage,
            { context: activeChartContext, kundli, lastText: text },
          ),
        ]);
        return;
      }

      if (
        shouldAutoSwitchToRegionalLanguage({
          context: languageContext,
          selectedLanguage: chatLanguage,
        })
      ) {
        setChatLanguage(languageContext.responseLanguage);
        persistPredictaReplyLanguage(languageContext.responseLanguage);
      }

      if (
        shouldAskBeforeSwitchingToEnglish({
          context: languageContext,
          selectedLanguage: chatLanguage,
        })
      ) {
        const fromLanguage = chatLanguage as Exclude<SupportedLanguage, 'en'>;
        setPendingEnglishSwitch({
          fromLanguage,
          requestedAt: new Date().toISOString(),
        });
        setMessages(current => [
          ...current,
          createPridictaReply(
            buildEnglishSwitchPrompt(fromLanguage),
            fromLanguage,
            { context: activeChartContext, kundli, lastText: text },
          ),
        ]);
        return;
      }

      const localSafety = detectChatSafetyMeta(
        text,
        languageContext.responseLanguage,
      );
      if (localSafety?.kind === 'crisis') {
        setMessages(current => [
          ...current,
          createPridictaReply(
            getCrisisSupportReply(languageContext.responseLanguage),
            languageContext.responseLanguage,
            {
              context: activeChartContext,
              kundli,
              lastText: text,
              safety: localSafety,
            },
          ),
        ]);
        return;
      }

      if (pendingKundliCommand) {
        const commandReply = await resolvePendingKundliCommand(
          text,
          languageContext.responseLanguage,
        );
        setMessages(current => [
          ...current,
          createPridictaReply(commandReply, languageContext.responseLanguage, {
            context: activeChartContext,
            kundli: recoverActiveKundli(),
            lastText: text,
          }),
        ]);
        return;
      }

      const kundliCommandReply = await resolveInitialKundliCommand(
        text,
        languageContext.responseLanguage,
      );

      if (kundliCommandReply) {
        setMessages(current => [
          ...current,
          createPridictaReply(kundliCommandReply, languageContext.responseLanguage, {
            context: activeChartContext,
            kundli: recoverActiveKundli(),
            lastText: text,
          }),
        ]);
        return;
      }

      const chartIntentKundli = recoverActiveKundli();
      if (
        chartIntentKundli &&
        detectChatChartIntent(text) &&
        shouldGateForBirthDetailConfidence(text, chartIntentKundli)
      ) {
        setMessages(current => [
          ...current,
          createPridictaReply(
            buildBirthDetailConfidenceGateReply(
              languageContext.responseLanguage,
              chartIntentKundli,
            ),
            languageContext.responseLanguage,
            {
              context: activeChartContext,
              kundli: chartIntentKundli,
              lastText: text,
              suggestions: buildBirthDetailConfidenceSuggestions(
                languageContext.responseLanguage,
              ),
            },
          ),
        ]);
        return;
      }

      const chartReply = resolveChatChartReply(
        text,
        languageContext.responseLanguage,
      );

      if (chartReply) {
        setMessages(current => [...current, chartReply.message]);
        return;
      }

      responseSafetyRef.current = undefined;
      pendingRichBlocksRef.current = undefined;
      const summary = await resolveSmartReply(text);
      const recoveredKundli = recoverActiveKundli();
      const safeSummary =
        recoveredKundli && hasHighStakesLanguage(text)
          ? `${getSafetyBoundaryCopy(
              languageContext.responseLanguage,
            )}\n\n${summary}`
          : summary;
      const passCostSuggestions = passCostSuggestionsRef.current;
      const richBlocks = pendingRichBlocksRef.current;
      passCostSuggestionsRef.current = undefined;
      pendingRichBlocksRef.current = undefined;

      setMessages(current => [
        ...current,
          createPridictaReply(safeSummary, languageContext.responseLanguage, {
            blocks: richBlocks,
            context: activeChartContext,
            kundli: recoveredKundli,
            lastText: safeSummary,
            suggestions: passCostSuggestions,
            safety:
              responseSafetyRef.current ??
              detectChatSafetyMeta(text, languageContext.responseLanguage),
          }),
        ]);
    } catch {
      const fallbackText = looksLikeBirthDetails(text)
        ? getBirthExtractionFailureReply(chatLanguage)
        : 'I could not complete that reading just now. I am still here with you; please try again with one focused question.';
      setMessages(current => [
        ...current,
          createPridictaReply(fallbackText, chatLanguage, {
            context: activeChartContext,
            kundli,
            lastText: text,
          }),
        ]);
    } finally {
      setIsSending(false);
    }
  }

  async function askWithProof(
    text: string,
    activeKundli: KundliData,
    responseLanguage: SupportedLanguage,
    acknowledgement?: string,
  ) {
    const questionChartContext = resolveChartContextForQuestion(text);
    const shared = resolveSharedWebKundliContext(
      questionChartContext,
      activeKundli,
    );
    const nextQuestionChartContext =
      shared.chartContext ?? questionChartContext;
    const budgetDecision = consumeWebAiBudget('deep_reading', responseLanguage);
    setPassCostDisplay(getWebPassCostDisplay(responseLanguage));

    if (!budgetDecision.allowed) {
      passCostSuggestionsRef.current = buildPassCostGuardrailSuggestions(
        true,
        responseLanguage,
      );
      return [
        acknowledgement,
        buildPassCostGuardrailReply({
          decision: budgetDecision,
          kundli: activeKundli,
          language: responseLanguage,
        }),
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    const nextMemory = learnPredictaInteraction(
      predictaMemory,
      text,
      undefined,
      activeKundli,
      responseLanguage,
    );
    setPredictaMemory(nextMemory);
    if (nextQuestionChartContext !== activeChartContext) {
      setActiveChartContext(nextQuestionChartContext);
      if (nextQuestionChartContext) {
        saveWebActiveChartContext(nextQuestionChartContext);
      }
    }
    const response = await askPridictaFromWeb({
      history: messages.slice(-MAX_AI_HISTORY_MESSAGES).map(message => ({
        role: message.role,
        text: message.text,
      })),
      chartContext: nextQuestionChartContext,
      kundli: activeKundli,
      language: responseLanguage,
      message: text,
      userPlan: 'FREE',
    });
    responseSafetyRef.current = detectChatSafetyMeta(
      text,
      responseLanguage,
      response,
    );

    return [
      acknowledgement,
      response.safetyBlocked
        ? response.text
        : formatAskWithProof(response.text, response.jyotishAnalysis),
      buildPredictaLearningSuggestion({
        hasPremiumAccess: false,
        kundli: activeKundli,
        language: responseLanguage,
        memory: nextMemory,
        savedKundlis,
      }),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  function resolveChartContextForQuestion(text: string): ChartContext | undefined {
    const explicitHouses = extractHouseNumbersFromText(text);
    const activeKundli = recoverActiveKundli();

    if (!explicitHouses.length) {
      return resolveSharedWebKundliContext(
        activeChartContext,
        activeKundli,
      ).chartContext;
    }

    const nextContext: ChartContext = {
      ...(activeChartContext ?? { sourceScreen: 'Predicta chat' }),
      kundliId: activeKundli?.id ?? activeChartContext?.kundliId,
      selectedHouse: explicitHouses.length === 1 ? explicitHouses[0] : undefined,
      selectedSection: text,
      sourceScreen: activeChartContext?.sourceScreen ?? 'Predicta chat',
    };

    return resolveSharedWebKundliContext(nextContext, activeKundli).chartContext;
  }

  async function resolveSmartReply(text: string): Promise<string> {
    const languageContext = preparePredictaLanguageContext({
      memory: predictaMemory,
      selectedLanguage: chatLanguage,
      text,
    });
    const responseLanguage = languageContext.responseLanguage;

    if (isSimpleGreeting(text)) {
      return [
        languageContext.acknowledgement,
        getFriendlyGreetingReply(responseLanguage),
        buildPredictaLearningSuggestion({
          hasPremiumAccess: false,
          kundli,
          language: responseLanguage,
          memory: predictaMemory,
          savedKundlis,
        }),
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    const activeKundli = recoverActiveKundli();

    if (activeKundli && isBirthTimeConfirmationRequest(text)) {
      return confirmEnteredBirthTimeFromChat(
        activeKundli,
        responseLanguage,
        languageContext.acknowledgement,
      );
    }

    if (looksLikeBirthDetails(text)) {
      return handleBirthIntake(
        text,
        responseLanguage,
        languageContext.acknowledgement,
      );
    }

    if (
      activeKundli &&
      shouldGateForBirthDetailConfidence(text, activeKundli)
    ) {
      return [
        languageContext.acknowledgement,
        buildBirthDetailConfidenceGateReply(responseLanguage, activeKundli),
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    const actionReply = buildPredictaActionReply({
      hasPremiumAccess: false,
      kundli: activeKundli,
      language: responseLanguage,
      memory: predictaMemory,
      predictaSchool: activeChartContext?.predictaSchool,
      savedKundlis,
      text,
    });
    setPredictaMemory(actionReply.memory);

    if (actionReply.handled && actionReply.text) {
      return actionReply.text;
    }

    if (!activeKundli) {
      const partialBirthReply = buildPartialBirthDetailGateReply(
        responseLanguage,
        birthMemory,
      );
      if (partialBirthReply) {
        return [languageContext.acknowledgement, partialBirthReply]
          .filter(Boolean)
          .join('\n\n');
      }

      return [
        languageContext.acknowledgement,
        createKundliFirstReply(responseLanguage, text),
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    return askWithProof(
      text,
      activeKundli,
      responseLanguage,
      languageContext.acknowledgement,
    );
  }

  function resolveChatChartReply(
    text: string,
    responseLanguage: SupportedLanguage,
  ): { message: WebMessage } | undefined {
    const activeKundli = recoverActiveKundli();

    if (!activeKundli) {
      return undefined;
    }

    const intent = detectChatChartIntent(text);

    if (!intent) {
      return undefined;
    }

    const block = composeChatChartBlock({
      chartType: intent.chartType,
      hasPremiumAccess: false,
      kundli: activeKundli,
    });

    if (!block) {
      return undefined;
    }

    const baseContext = chartContextFromChatBlock(block, 'Chat');
    const context =
      resolveSharedWebKundliContext(baseContext, activeKundli).chartContext ??
      baseContext;
    const nextMemory = learnPredictaInteraction(
      predictaMemory,
      text,
      'chart',
      activeKundli,
      responseLanguage,
    );
    setPredictaMemory(nextMemory);
    setActiveChartContext(context);
    saveWebActiveChartContext(context);

    return {
      message: {
        blocks: [block],
        context,
        id: `pridicta-chart-${Date.now()}`,
        role: 'pridicta',
        suggestions: buildFollowUps({
          context,
          kundli: activeKundli,
          language: responseLanguage,
          lastText: text,
        }),
        text: buildChatChartReplyText({ block, language: responseLanguage }),
      },
    };
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
      setBirthMemory(undefined);
      return buildKundliCreateFromChatReply(responseLanguage);
    }

    const store = loadWebKundliStore();
    const target =
      command.kind === 'set-active'
        ? findKundliBySpokenName(store.savedKundlis, command.targetName) ??
          store.activeKundli
        : findKundliBySpokenName(
            store.savedKundlis,
            'targetName' in command ? command.targetName : undefined,
          ) ??
          recoverActiveKundli() ??
          store.activeKundli;

    if (!target) {
      return buildNoKundliForCommandReply(responseLanguage);
    }

    if (command.kind === 'set-active') {
      setActiveWebKundli(target);
      setKundli(target);
      setSavedKundlis(loadWebKundliStore().savedKundlis);
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

    const nextBirthDetails = buildEditedBirthDetails(target, command);

    if (!nextBirthDetails) {
      return buildKundliEditNeedsValueReply(responseLanguage, command);
    }

    setPendingKundliCommand({
      birthDetails: nextBirthDetails,
      field: command.field,
      kind: 'edit',
      targetKundliId: target.id,
      targetName: target.birthDetails.name,
      value: command.value,
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

      const nextStore = deleteWebKundli(pendingKundliCommand.targetKundliId);
      setPendingKundliCommand(undefined);
      setKundli(nextStore.activeKundli);
      setSavedKundlis(nextStore.savedKundlis);
      return buildKundliDeletedReply(
        responseLanguage,
        pendingKundliCommand.targetName,
        nextStore.activeKundli,
      );
    }

    if (pendingKundliCommand?.kind === 'edit') {
      if (decision !== 'save-as-new' && decision !== 'update-existing') {
        return buildKundliEditConfirmReminder(responseLanguage);
      }

      if (
        decision === 'save-as-new' &&
        !canCreateAdditionalWebKundli().allowed
      ) {
        setPendingKundliCommand(undefined);
        return buildGuestKundliLimitReply(responseLanguage);
      }

      const store = loadWebKundliStore();
      const target = store.savedKundlis.find(
        item => item.id === pendingKundliCommand.targetKundliId,
      );

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
                ...(await generateKundliFromWeb(
                  pendingKundliCommand.birthDetails,
                  { save: false },
                )),
                id: pendingKundliCommand.targetKundliId,
              }
            : await generateKundliFromWeb(pendingKundliCommand.birthDetails, {
                save: false,
              });
      const savedKundli = attachKundliEditHistory({
        after: editedKundli,
        before: target,
        mode: decision,
        source: 'chat',
      });

      const saveResult = saveWebKundli(savedKundli);
      if (!saveResult.allowed) {
        setPendingKundliCommand(undefined);
        return buildGuestKundliLimitReply(responseLanguage);
      }

      setPendingKundliCommand(undefined);
      setKundli(savedKundli);
      setSavedKundlis(loadWebKundliStore().savedKundlis);

      return buildKundliEditedReply(
        responseLanguage,
        savedKundli,
        pendingKundliCommand.field,
        decision,
      );
    }

    setPendingKundliCommand(undefined);
    return buildKundliCommandCancelledReply(responseLanguage);
  }

  async function confirmEnteredBirthTimeFromChat(
    activeKundli: KundliData,
    responseLanguage: SupportedLanguage,
    acknowledgement?: string,
  ): Promise<string> {
    const enteredTime =
      activeKundli.birthDetails.originalTime ?? activeKundli.birthDetails.time;
    const restoredFromRectified =
      enteredTime !== activeKundli.birthDetails.time;
    const finalDetails: BirthDetails = {
      ...activeKundli.birthDetails,
      isTimeApproximate: false,
      originalTime: undefined,
      rectificationMethod: undefined,
      rectifiedAt: undefined,
      time: enteredTime,
      timeConfidence: 'entered',
    };

    try {
      const nextKundli = restoredFromRectified
        ? await generateKundliFromWeb(finalDetails)
        : {
            ...activeKundli,
            birthDetails: finalDetails,
            rectification: undefined,
          };

      if (!restoredFromRectified) {
        saveWebKundli(nextKundli);
      }

      setKundli(nextKundli);
      setSavedKundlis(loadWebKundliStore().savedKundlis);

      return [
        acknowledgement,
        buildBirthTimeConfirmedReply(
          responseLanguage,
          nextKundli,
          enteredTime,
          restoredFromRectified,
        ),
      ]
        .filter(Boolean)
        .join('\n\n');
    } catch {
      return [
        acknowledgement,
        buildBirthTimeConfirmationFailedReply(responseLanguage),
      ]
        .filter(Boolean)
        .join('\n\n');
    }
  }

  async function handleBirthIntake(
    text: string,
    responseLanguage: SupportedLanguage,
    acknowledgement?: string,
  ): Promise<string> {
    const budgetDecision = consumeWebAiBudget('question', responseLanguage);
    setPassCostDisplay(getWebPassCostDisplay(responseLanguage));

    if (!budgetDecision.allowed) {
      passCostSuggestionsRef.current = buildPassCostGuardrailSuggestions(
        Boolean(kundli),
        responseLanguage,
      );
      return [
        acknowledgement,
        buildPassCostGuardrailReply({
          decision: budgetDecision,
          kundli,
          language: responseLanguage,
        }),
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    const result = await extractBirthDetailsFromWeb(text);
    const reply = buildBirthIntakeReply({
      language: responseLanguage,
      memory: birthMemory,
      rawInput: text,
      result,
    });

    setBirthMemory({
      draft: reply.draft,
      updatedAt: new Date().toISOString(),
    });

    if (!reply.isReady) {
      return [acknowledgement, reply.text].filter(Boolean).join('\n\n');
    }

    const place =
      findWebBirthPlace(reply.draft.city) ??
      findWebBirthPlace(reply.draft.placeText) ??
      findWebBirthPlace(
        [reply.draft.city, reply.draft.state, reply.draft.country]
          .filter(Boolean)
          .join(', '),
      );

    if (!place || !reply.draft.date || !reply.draft.time) {
      return [
        acknowledgement,
        buildPlaceClarificationReply(responseLanguage, reply.text),
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    const placeParts = place.place.split(',').map(part => part.trim());
    if (!canCreateAdditionalWebKundli().allowed) {
      return [
        acknowledgement,
        buildGuestKundliLimitReply(responseLanguage),
      ]
        .filter(Boolean)
        .join('\n\n');
    }

    const birthDetails: BirthDetails = {
      date: reply.draft.date,
      isTimeApproximate: reply.draft.isTimeApproximate,
      latitude: place.latitude,
      longitude: place.longitude,
      name: reply.draft.name?.trim() || 'Predicta Seeker',
      originalPlaceText: reply.draft.placeText,
      place: place.place,
      resolvedBirthPlace: {
        city: placeParts[0] || place.label,
        country: placeParts[placeParts.length - 1] || 'India',
        latitude: place.latitude,
        longitude: place.longitude,
        source: 'local-dataset',
        state: placeParts[1],
        timezone: place.timezone,
      },
      time: reply.draft.time,
      timezone: place.timezone,
    };
    const nextKundli = await generateKundliFromWeb(birthDetails);
    setKundli(nextKundli);
    const nextSavedKundlis = loadWebKundliStore().savedKundlis;
    setSavedKundlis(nextSavedKundlis);
    const creationBlock = composeChatChartBlock({
      chartType: 'D1',
      hasPremiumAccess: false,
      kundli: nextKundli,
    });
    pendingRichBlocksRef.current = creationBlock ? [creationBlock] : undefined;
    setBirthMemory(undefined);
    const nextMemory = learnPredictaInteraction(
      predictaMemory,
      text,
      'chart',
      nextKundli,
      responseLanguage,
    );
    setPredictaMemory(nextMemory);

    return [
      acknowledgement,
      buildKundliCreatedReply(responseLanguage, nextKundli),
      buildPredictaLearningSuggestion({
        hasPremiumAccess: false,
        kundli: nextKundli,
        language: responseLanguage,
        memory: nextMemory,
        savedKundlis: nextSavedKundlis,
      }),
    ].join('\n\n');
  }

  function startNewChat() {
    if (chatAccount?.uid) {
      const sessionState = createWebChatSession(chatAccount.uid, {
        activeChartContext,
        chatLanguage,
        kundliId: kundli?.id,
        replyLanguage: chatLanguage,
      });
      const activeSession = getActiveWebChatSession(sessionState);

      setActiveChatSessionId(sessionState.activeSessionId);
      setChatSessions(sessionState.sessions);
      setBirthMemory(undefined);
      setPendingEnglishSwitch(undefined);
      setPredictaMemory(undefined);
      setMessages(activeSession?.messages ?? buildInitialMessages(chatLanguage));
      setInput('');
      return;
    }

    setBirthMemory(undefined);
    setPendingEnglishSwitch(undefined);
    setMessages(buildInitialMessages(chatLanguage));
    setInput('');
  }

  function switchChatSession(sessionId: string) {
    if (!chatAccount?.uid) {
      return;
    }

    const sessionState = activateWebChatSession(chatAccount.uid, sessionId);
    const activeSession = getActiveWebChatSession(sessionState);

    if (!activeSession) {
      return;
    }

    setActiveChatSessionId(sessionId);
    setChatSessions(sessionState.sessions);
    setBirthMemory(activeSession.birthMemory);
    setChatLanguage(activeSession.chatLanguage);
    persistPredictaReplyLanguage(activeSession.replyLanguage);
    setPredictaMemory(activeSession.predictaMemory);
    setActiveChartContext(
      resolveSharedWebKundliContext(activeSession.activeChartContext, kundli)
        .chartContext,
    );
    setMessages(activeSession.messages.map(sanitizeStoredMessage));
    setInput('');
  }

  const chatExportCopy = getChatExportCopy(chatLanguage);
  const roomTitle = room?.title ?? 'Predicta chat';
  const roomSource = room?.sourceScreen ?? 'Predicta';
  const roomBody =
    room?.body ??
    'Ask with your Kundli context, chart proof, and calm follow-up guidance.';

  return (
    <div className="chat-workspace">
      <div className="card chat-panel">
        <div className="chat-shell-header">
          <div className="chat-shell-title-block">
            <span className="chat-room-chip">{roomSource}</span>
            <strong>{roomTitle}</strong>
            <p>{roomBody}</p>
          </div>
          <details className="chat-utility-menu">
            <summary aria-label="Chat tools">
              <span>Tools</span>
            </summary>
            <div className="chat-utility-menu-panel" aria-label="Conversation actions">
              <button
                className="chat-export-button"
                onClick={() => {
                  void copyConversationTranscript(setConversationCopyState);
                }}
                type="button"
              >
                {conversationCopyState === 'copied'
                  ? chatExportCopy.copied
                  : chatExportCopy.copyConversation}
              </button>
              <button
                className="chat-export-button"
                onClick={openPrintableWebChatTranscript}
                type="button"
              >
                {chatExportCopy.savePdf}
              </button>
              <button
                className="chat-export-button"
                onClick={startNewChat}
                type="button"
              >
                {chatExportCopy.newChat}
              </button>
            </div>
          </details>
        </div>
        <WebChatSessionSwitcher
          activeSessionId={activeChatSessionId}
          isSignedIn={Boolean(chatAccount?.uid)}
          sessions={chatSessions}
          onNewSession={startNewChat}
          onSwitchSession={switchChatSession}
        />
        <div className="chat-language-state" aria-live="polite">
          <span>{labels.chatLanguage}</span>
          <strong>{getLanguageOption(chatLanguage).englishName}</strong>
          <small>
            {labels.appLanguage}: {appLanguageOption.englishName}
          </small>
          {kundli?.birthDetails.timeConfidence === 'rectified' ? (
            <small className="chat-rectified-time-label">
              Rectified time: {kundli.birthDetails.time}
            </small>
          ) : null}
        </div>
        <WebActiveKundliActions
          chatContext
          compact
          kundli={kundli}
          sourceScreen="Chat"
          title="Using Kundli"
        />
        {passCostDisplay ? (
          <div className={`pass-cost-meter ${passCostDisplay.tone}`}>
            <span>{passCostDisplay.title}</span>
            <p>{passCostDisplay.body}</p>
          </div>
        ) : null}
        <div aria-live="polite" className="chat-thread" ref={threadRef}>
          {messages.map(message => (
            <div
              className={`message ${message.role} ${
                message.blocks?.length ? 'rich-message' : ''
              }`}
              key={message.id}
            >
              <span>{message.role === 'user' ? 'You' : 'Predicta'}</span>
              {message.role === 'pridicta' ? (
                <>
                  <WebChatReplyText text={message.text} />
                  <WebChatReplyActions
                    copied={copiedMessageId === message.id}
                    language={chatLanguage}
                    selectedAction={replyFeedbackState[message.id]}
                    onUseAction={action => {
                      void handleReplyFeedback(message, action);
                    }}
                  />
                </>
              ) : (
                <p>{message.text}</p>
              )}
              {message.safety ? <WebChatSafetyCard safety={message.safety} /> : null}
              {message.blocks?.map(block => (
                <WebChatMessageBlock
                  block={block}
                  birthDetails={kundli?.birthDetails}
                  key={`${message.id}-${block.type}-${block.chartType}`}
                  onUsePrompt={prompt => {
                    if (block.type === 'chart') {
                      const baseContext = chartContextFromChatBlock(block, 'Chat');
                      const context =
                        resolveSharedWebKundliContext(baseContext, kundli)
                          .chartContext ?? baseContext;
                      setActiveChartContext(context);
                      saveWebActiveChartContext(context);
                    }
                    setInput(prompt);
                  }}
                />
              ))}
              {message.role === 'pridicta' &&
              message.id === lastPredictaMessageId &&
              !isSending ? (
                <WebChatSuggestions
                  onUseSuggestion={suggestion => {
                    if (suggestion.context) {
                      const sharedContext =
                        resolveSharedWebKundliContext(suggestion.context, kundli)
                          .chartContext ?? suggestion.context;
                      setActiveChartContext(sharedContext);
                      saveWebActiveChartContext(sharedContext);
                    }
                    if (suggestion.href) {
                      window.location.assign(suggestion.href);
                      return;
                    }
                    void sendMessage(suggestion.prompt);
                  }}
                  suggestions={
                    message.suggestions ??
                    buildFollowUps({
                      context: message.context ?? activeChartContext,
                      kundli,
                      language: chatLanguage,
                      lastText: message.text,
                    })
                  }
                />
              ) : null}
            </div>
          ))}
          {starRatingMoment ? (
            <WebStarRatingMoment
              language={chatLanguage}
              selectedRating={submittedStarRating}
              onDismiss={dismissStarRating}
              onRate={submitStarRating}
            />
          ) : null}
          {isSending ? (
            <WebPredictaThinking language={chatLanguage} />
          ) : null}
        </div>
        <div className="chat-input-row">
          <textarea
            aria-label="Ask Predicta"
            disabled={isSending}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.ctrlKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder={chatPlaceholder(language)}
            rows={3}
            value={input}
          />
          <button
            className="button"
            disabled={isSending || !input.trim()}
            onClick={() => void sendMessage()}
            type="button"
          >
            {isSending ? labels.reading : labels.askPridicta}
          </button>
        </div>
      </div>
    </div>
  );
}

function buildRoomQueryString(
  rawQueryString: string,
  room: WebPredictaChatRoom | undefined,
): string {
  if (!room) {
    return rawQueryString;
  }

  const params = new URLSearchParams(rawQueryString);

  if (!params.has('school')) {
    params.set('school', room.school);
  }

  if (!params.has('sourceScreen')) {
    params.set('sourceScreen', room.sourceScreen);
  }

  if (
    !params.has('prompt') &&
    !params.has('selectedSection') &&
    !params.has('handoffQuestion')
  ) {
    params.set('prompt', room.prompt);
  }

  return params.toString();
}

function buildEditedBirthDetails(
  kundli: KundliData,
  command: Extract<KundliChatCommand, { kind: 'edit-field' }>,
): BirthDetails | undefined {
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
    return {
      ...kundli.birthDetails,
      date: command.value,
    };
  }

  if (command.field === 'name') {
    return {
      ...kundli.birthDetails,
      name: command.value,
    };
  }

  const place = findWebBirthPlace(command.value);

  if (!place) {
    return undefined;
  }

  const placeParts = place.place.split(',').map(part => part.trim());

  return {
    ...kundli.birthDetails,
    latitude: place.latitude,
    longitude: place.longitude,
    place: place.place,
    resolvedBirthPlace: {
      city: placeParts[0] || place.label,
      country: placeParts[placeParts.length - 1] || 'India',
      latitude: place.latitude,
      longitude: place.longitude,
      source: 'local-dataset',
      state: placeParts[1],
      timezone: place.timezone,
    },
    timezone: place.timezone,
  };
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
    return 'बिल्कुल. नई Kundli यहीं chat में बना देते हैं. Name, DOB, birth time और birth place भेज दीजिए. अगर सिर्फ DOB पता है, पहले वही भेज दीजिए.';
  }
  if (language === 'gu') {
    return 'હા. નવી Kundli અહીં chat માં બનાવી દઉં. Name, DOB, birth time અને birth place મોકલો. ફક્ત DOB ખબર હોય તો પહેલા એ મોકલો.';
  }
  return 'Yes. I can create a new Kundli right here in chat. Send name, DOB, birth time, and birth place. If you only know the DOB, send that first.';
}

function buildNoKundliForCommandReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'मुझे अभी कोई saved Kundli नहीं मिल रही. पहले birth details भेजिए, मैं Kundli बनाकर फिर edit, delete या switch कर दूंगी.';
  }
  if (language === 'gu') {
    return 'મને હજુ saved Kundli મળી નથી. પહેલા birth details મોકલો, પછી હું edit, delete કે switch કરી દઈશ.';
  }
  return 'I do not see a saved Kundli yet. Send birth details first; then I can edit, delete, or switch Kundlis for you.';
}

function buildGuestKundliLimitReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'आपकी पहली Kundli safe है. एक और Kundli save करने के लिए sign in करें, ताकि family profiles और saved charts बाद में भी मिल सकें.';
  }
  if (language === 'gu') {
    return 'તમારી પહેલી Kundli safe છે. બીજી Kundli save કરવા માટે sign in કરો, જેથી family profiles અને saved charts પછી પણ મળી શકે.';
  }
  return 'Your first Kundli is safe. Please sign in before saving another Kundli, so family profiles and saved charts stay protected for later.';
}

function buildKundliSetActiveReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return `${kundli.birthDetails.name} की Kundli active कर दी. अब मैं इसी chart से जवाब दूंगी.`;
  }
  if (language === 'gu') {
    return `${kundli.birthDetails.name} ની Kundli active કરી દીધી. હવે હું આ chart થી જવાબ આપીશ.`;
  }
  return `${kundli.birthDetails.name}'s Kundli is now active. I will answer from this chart.`;
}

function buildKundliDeleteConfirmReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return `आप ${kundli.birthDetails.name} की Kundli delete करना चाहते हैं. यह library से हट जाएगी. Confirm करने के लिए "delete Kundli" लिखिए, या "cancel" लिखिए.`;
  }
  if (language === 'gu') {
    return `તમે ${kundli.birthDetails.name} ની Kundli delete કરવા માંગો છો. આ library માંથી હટી જશે. Confirm કરવા "delete Kundli" લખો, અથવા "cancel" લખો.`;
  }
  return `You are about to delete ${kundli.birthDetails.name}'s Kundli from your library. Reply "delete Kundli" to confirm, or "cancel" to stop.`;
}

function buildKundliGenericEditReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return `${kundli.birthDetails.name} की Kundli edit कर सकती हूं. बताइए क्या बदलना है: birth time, DOB, birth place या name. Example: "change birth time to 06:45 AM".`;
  }
  if (language === 'gu') {
    return `${kundli.birthDetails.name} ની Kundli edit કરી શકું છું. શું બદલવું છે: birth time, DOB, birth place કે name? Example: "change birth time to 06:45 AM".`;
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
      : language === 'hi'
        ? 'Birth place clear नहीं हुआ. City, state और country भेजिए.'
        : 'Birth place clear નથી થયું. City, state અને country મોકલો.';
  }

  return language === 'en'
    ? 'I need the exact value before editing the Kundli. Please send it once more clearly.'
    : language === 'hi'
      ? 'Kundli edit करने के लिए exact value चाहिए. एक बार clearly भेजिए.'
      : 'Kundli edit કરવા માટે exact value જોઈએ. એક વાર clearly મોકલો.';
}

function buildKundliEditConfirmReply(
  language: SupportedLanguage,
  kundli: KundliData,
  command: Extract<KundliChatCommand, { kind: 'edit-field' }>,
  nextBirthDetails: BirthDetails,
): string {
  const changeLine = formatKundliChange(command.field, nextBirthDetails);
  if (language === 'hi') {
    return `मैं ${kundli.birthDetails.name} की Kundli में यह change कर सकती हूं:\n${changeLine}\n\nDate, time या place बदलने से chart दोबारा calculate होता है. Reply करें: "update existing", "save as new" या "cancel".`;
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
      ? 'Delete confirm करने के लिए "delete Kundli" लिखिए, या रोकने के लिए "cancel" लिखिए.'
      : 'Delete confirm કરવા માટે "delete Kundli" લખો, અથવા રોકવા માટે "cancel" લખો.';
}

function buildKundliEditConfirmReminder(language: SupportedLanguage): string {
  return language === 'en'
    ? 'Please reply "update existing", "save as new", or "cancel".'
    : language === 'hi'
      ? 'Please "update existing", "save as new" या "cancel" लिखिए.'
      : 'Please "update existing", "save as new" અથવા "cancel" લખો.';
}

function buildKundliCommandCancelledReply(language: SupportedLanguage): string {
  return language === 'en'
    ? 'Done. I did not change the Kundli.'
    : language === 'hi'
      ? 'ठीक है. मैंने Kundli में कोई change नहीं किया.'
      : 'ઠીક છે. મેં Kundli માં કોઈ change કર્યું નથી.';
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
      ? ` Active Kundli હવે ${nextActive.birthDetails.name} છે.`
      : '';
    return `${deletedName} ની Kundli library માંથી delete થઈ ગઈ.${nextLine}`;
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

async function copyChatMessage(
  message: WebMessage,
  setCopiedMessageId: (messageId: string | undefined) => void,
): Promise<void> {
  const speaker = message.role === 'user' ? 'You' : 'Predicta';

  await navigator.clipboard.writeText(
    `${speaker}\n${sanitizeTranscriptCopy(message.text).trim()}`,
  );
  setCopiedMessageId(message.id);
  window.setTimeout(() => setCopiedMessageId(undefined), 1600);
}

async function copyConversationTranscript(
  setConversationCopyState: (state: 'idle' | 'copied') => void,
): Promise<void> {
  await navigator.clipboard.writeText(
    formatWebChatTranscript(loadWebChatTranscript()),
  );
  setConversationCopyState('copied');
  window.setTimeout(() => setConversationCopyState('idle'), 1600);
}

function captureReplyFeedbackSignal({
  action,
  appLanguage,
  chatLanguage,
  context,
  kundli,
  message,
  sessionId,
}: {
  action: ReplyFeedbackAction;
  appLanguage: SupportedLanguage;
  chatLanguage: SupportedLanguage;
  context?: ChartContext;
  kundli?: KundliData;
  message: WebMessage;
  sessionId: string;
}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const guestSession = safeGetGuestSession();
  const currentUser = safeGetCurrentUser();
  const signal: ReplyFeedbackSignal = {
    action,
    appLanguage,
    chatLanguage,
    createdAt: new Date().toISOString(),
    deviceId: guestSession?.deviceId ?? safeGetBrowserDeviceId(),
    familyContext: buildReplyFeedbackFamilyContext(context),
    guestPassId: readRedeemedGuestPassId(),
    guestProfileId: guestSession?.guestProfileId,
    kundliId: context?.kundliId ?? kundli?.id,
    messageHash: hashReplyFeedbackText(message.text),
    messageId: message.id,
    route: `${window.location.pathname}${window.location.search}`,
    school: getReplyFeedbackSchool(context),
    selectedChart: context?.chartName ?? context?.chartType,
    selectedHouse: context?.selectedHouse,
    selectedPlanet: context?.selectedPlanet,
    sessionId,
    sourceScreen: context?.sourceScreen,
    userEmail: currentUser?.email ?? undefined,
    userId: currentUser?.uid,
  };

  try {
    const existing = window.localStorage.getItem(WEB_REPLY_FEEDBACK_KEY);
    const parsed = existing
      ? (JSON.parse(existing) as ReplyFeedbackSignal[])
      : [];
    const next = [...parsed, signal].slice(-MAX_STORED_REPLY_FEEDBACK);
    window.localStorage.setItem(WEB_REPLY_FEEDBACK_KEY, JSON.stringify(next));
    window.dispatchEvent(
      new CustomEvent('pridicta:reply-feedback-signal', {
        detail: signal,
      }),
    );
  } catch {
    // Feedback capture should never interrupt the chat.
  }
}

function captureStarRatingSignal({
  appLanguage,
  chatLanguage,
  context,
  kundli,
  messageId,
  rating,
  replyCount,
  sessionId,
  trigger,
}: {
  appLanguage: SupportedLanguage;
  chatLanguage: SupportedLanguage;
  context?: ChartContext;
  kundli?: KundliData;
  messageId?: string;
  rating: number;
  replyCount: number;
  sessionId: string;
  trigger: StarRatingMoment['trigger'];
}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const guestSession = safeGetGuestSession();
  const currentUser = safeGetCurrentUser();
  const signal: StarRatingSignal = {
    appLanguage,
    chatLanguage,
    createdAt: new Date().toISOString(),
    deviceId: guestSession?.deviceId ?? safeGetBrowserDeviceId(),
    guestPassId: readRedeemedGuestPassId(),
    guestProfileId: guestSession?.guestProfileId,
    kundliId: context?.kundliId ?? kundli?.id,
    messageId,
    rating: clampStarRating(rating),
    replyCount,
    route: `${window.location.pathname}${window.location.search}`,
    school: getReplyFeedbackSchool(context),
    selectedChart: context?.chartName ?? context?.chartType,
    selectedHouse: context?.selectedHouse,
    selectedPlanet: context?.selectedPlanet,
    sessionId,
    sourceScreen: context?.sourceScreen,
    trigger,
    userEmail: currentUser?.email ?? undefined,
    userId: currentUser?.uid,
  };

  try {
    const existing = window.localStorage.getItem(WEB_STAR_RATING_KEY);
    const parsed = existing ? (JSON.parse(existing) as StarRatingSignal[]) : [];
    const next = [...parsed, signal].slice(-MAX_STORED_STAR_RATINGS);
    window.localStorage.setItem(WEB_STAR_RATING_KEY, JSON.stringify(next));
    markStarRatingSessionDone();
    window.dispatchEvent(
      new CustomEvent('pridicta:star-rating-signal', {
        detail: signal,
      }),
    );
  } catch {
    // Rating capture should never interrupt the chat.
  }
}

function shouldOfferStarRatingMoment({
  force,
  replyCount,
}: {
  force: boolean;
  replyCount: number;
}): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  if (force) {
    return true;
  }

  if (hasStarRatingSessionDone()) {
    return false;
  }

  if (replyCount < 4 || replyCount % 4 !== 0) {
    return false;
  }

  const lastAskedAt = readStoredDate(WEB_STAR_RATING_LAST_ASKED_KEY);
  if (!lastAskedAt) {
    return true;
  }

  return Date.now() - lastAskedAt.getTime() > 3 * 24 * 60 * 60 * 1000;
}

function markStarRatingAsked(): void {
  try {
    window.localStorage.setItem(
      WEB_STAR_RATING_LAST_ASKED_KEY,
      new Date().toISOString(),
    );
  } catch {
    // Best-effort prompt pacing.
  }
}

function markStarRatingSessionDone(): void {
  try {
    window.sessionStorage.setItem(WEB_STAR_RATING_SESSION_DONE_KEY, 'true');
  } catch {
    // Best-effort prompt pacing.
  }
}

function hasStarRatingSessionDone(): boolean {
  try {
    return window.sessionStorage.getItem(WEB_STAR_RATING_SESSION_DONE_KEY) === 'true';
  } catch {
    return false;
  }
}

function readStoredDate(key: string): Date | undefined {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return undefined;
    }

    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  } catch {
    return undefined;
  }
}

function clampStarRating(rating: number): number {
  return Math.min(5, Math.max(1, Math.round(rating)));
}

function getOrCreateReplyFeedbackSessionId(): string {
  if (typeof window === 'undefined') {
    return `session-${Date.now()}`;
  }

  try {
    const existing = window.sessionStorage.getItem(WEB_REPLY_FEEDBACK_SESSION_KEY);
    if (existing) {
      return existing;
    }

    const next = createReplyFeedbackId('session');
    window.sessionStorage.setItem(WEB_REPLY_FEEDBACK_SESSION_KEY, next);
    return next;
  } catch {
    return createReplyFeedbackId('session');
  }
}

function buildReplyFeedbackFamilyContext(
  context?: ChartContext,
): ReplyFeedbackSignal['familyContext'] | undefined {
  if (
    !context?.selectedFamilyKarmaMap &&
    !context?.selectedFamilyMemberCount
  ) {
    return undefined;
  }

  return {
    selectedFamilyKarmaMap: context.selectedFamilyKarmaMap,
    selectedFamilyMemberCount: context.selectedFamilyMemberCount,
  };
}

function getReplyFeedbackSchool(
  context?: ChartContext,
): ReplyFeedbackSignal['school'] {
  if (context?.predictaSchool === 'KP') {
    return 'KP';
  }

  if (context?.predictaSchool === 'NADI') {
    return 'NADI';
  }

  if (context?.predictaSchool === 'NUMEROLOGY') {
    return 'NUMEROLOGY';
  }

  if (context?.predictaSchool === 'SIGNATURE') {
    return 'SIGNATURE';
  }

  return 'PARASHARI';
}

function readRedeemedGuestPassId(): string | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_REDEEMED_PASS_KEY);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as { passCodeId?: string };
    return parsed.passCodeId;
  } catch {
    return undefined;
  }
}

function safeGetGuestSession(): ReturnType<typeof getOrCreateWebGuestSession> | undefined {
  try {
    return getOrCreateWebGuestSession();
  } catch {
    return undefined;
  }
}

function safeGetBrowserDeviceId(): string | undefined {
  try {
    return getOrCreateBrowserDeviceId();
  } catch {
    return undefined;
  }
}

function safeGetCurrentUser():
  | { email: string | null; uid: string }
  | undefined {
  try {
    return getFirebaseWebAuth().currentUser ?? undefined;
  } catch {
    return undefined;
  }
}

function hashReplyFeedbackText(text: string): string {
  let hash = 5381;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33) ^ text.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function createReplyFeedbackId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `${prefix}-${random}`;
}

function getChatExportCopy(language: SupportedLanguage): {
  copied: string;
  copyConversation: string;
  copyMessage: string;
  newChat: string;
  savePdf: string;
} {
  if (language === 'hi') {
    return {
      copied: 'कॉपी हो गया',
      copyConversation: 'पूरी चैट कॉपी करें',
      copyMessage: 'कॉपी',
      newChat: 'नई चैट',
      savePdf: 'चैट पीडीएफ सेव करें',
    };
  }

  if (language === 'gu') {
    return {
      copied: 'કૉપી થઈ ગયું',
      copyConversation: 'પૂરી ચેટ કૉપી કરો',
      copyMessage: 'કૉપી',
      newChat: 'નવી ચેટ',
      savePdf: 'ચેટ પીડીએફ સેવ કરો',
    };
  }

  return {
    copied: 'Copied',
    copyConversation: 'Copy full chat',
    copyMessage: 'Copy',
    newChat: 'New chat',
    savePdf: 'Save chat PDF',
  };
}

function WebChatSessionSwitcher({
  activeSessionId,
  isSignedIn,
  onNewSession,
  onSwitchSession,
  sessions,
}: {
  activeSessionId?: string;
  isSignedIn: boolean;
  onNewSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  sessions: WebChatSession[];
}): React.JSX.Element {
  if (!isSignedIn) {
    return (
      <div className="chat-session-strip guest">
        <div>
          <strong>Guest chat</strong>
          <span>
            Sign in for saved chat history and separate family readings.
          </span>
        </div>
        <div className="chat-session-actions">
          <AuthDialog />
          <button className="chat-export-button" onClick={onNewSession} type="button">
            New chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-session-strip">
      <div>
        <strong>Saved chats</strong>
        <span>Switch readings without losing context.</span>
      </div>
      <div className="chat-session-actions">
        {sessions.slice(0, 6).map(session => (
          <button
            aria-pressed={session.id === activeSessionId}
            className={`chat-session-pill ${
              session.id === activeSessionId ? 'active' : ''
            }`}
            key={session.id}
            onClick={() => onSwitchSession(session.id)}
            type="button"
          >
            {session.title}
          </button>
        ))}
        <button className="chat-export-button" onClick={onNewSession} type="button">
          New saved chat
        </button>
      </div>
    </div>
  );
}

function WebStarRatingMoment({
  language,
  onDismiss,
  onRate,
  selectedRating,
}: {
  language: SupportedLanguage;
  onDismiss: () => void;
  onRate: (rating: number) => void;
  selectedRating?: number;
}): React.JSX.Element {
  const copy = getStarRatingCopy(language);

  return (
    <div className="message pridicta star-rating-message">
      <span>Predicta</span>
      <div className="chat-star-rating-card">
        <div>
          <strong>{copy.title}</strong>
          <p>{selectedRating ? copy.thanks : copy.body}</p>
        </div>
        <div aria-label={copy.groupLabel} className="chat-star-row">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              aria-label={copy.ratingLabel(rating)}
              aria-pressed={selectedRating === rating}
              className={`chat-star-button ${
                selectedRating && rating <= selectedRating ? 'active' : ''
              }`}
              disabled={Boolean(selectedRating)}
              key={rating}
              onClick={() => onRate(rating)}
              title={copy.ratingLabel(rating)}
              type="button"
            >
              <StarRatingIcon />
            </button>
          ))}
        </div>
        {!selectedRating ? (
          <button
            className="chat-star-dismiss"
            onClick={onDismiss}
            type="button"
          >
            {copy.later}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function getStarRatingCopy(language: SupportedLanguage): {
  body: string;
  groupLabel: string;
  later: string;
  ratingLabel: (rating: number) => string;
  thanks: string;
  title: string;
} {
  if (language === 'hi') {
    return {
      body: 'Ek quick rating se mujhe samajh aayega ki reply useful tha ya nahi. Typing ki zaroorat nahi.',
      groupLabel: 'Predicta reply rating',
      later: 'Baad mein',
      ratingLabel: rating => `${rating} star rating dein`,
      thanks: 'Thank you. Is session ke liye rating save ho gayi.',
      title: 'Yeh answer kaisa laga?',
    };
  }

  if (language === 'gu') {
    return {
      body: 'Ek quick rating thi mane samajh padse ke reply useful hato ke nahi. Typing ni jaroor nathi.',
      groupLabel: 'Predicta reply rating',
      later: 'Pachhi',
      ratingLabel: rating => `${rating} star rating aapo`,
      thanks: 'Thank you. Aa session mate rating save thai gayi.',
      title: 'Aa answer kevo lagyo?',
    };
  }

  return {
    body: 'One quick rating helps Predicta improve. No extra typing needed.',
    groupLabel: 'Predicta reply rating',
    later: 'Later',
    ratingLabel: rating => `Rate ${rating} stars`,
    thanks: 'Thank you. I saved this rating for this session.',
    title: 'How was this answer?',
  };
}

function StarRatingIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}

function WebChatReplyActions({
  copied,
  language,
  onUseAction,
  selectedAction,
}: {
  copied: boolean;
  language: SupportedLanguage;
  onUseAction: (action: ReplyFeedbackAction) => void;
  selectedAction?: ReplyFeedbackAction;
}): React.JSX.Element {
  const copy = getReplyFeedbackCopy(language);

  return (
    <div aria-label={copy.groupLabel} className="chat-reply-actions">
      <button
        aria-label={copy.copyLabel}
        className={`chat-reply-action ${copied ? 'success' : ''}`}
        onClick={() => onUseAction('copy')}
        title={copy.copyLabel}
        type="button"
      >
        <CopyReplyIcon />
        <span className="sr-only">{copied ? copy.copiedLabel : copy.copyLabel}</span>
      </button>
      <button
        aria-label={copy.helpfulLabel}
        aria-pressed={selectedAction === 'up'}
        className={`chat-reply-action ${selectedAction === 'up' ? 'active' : ''}`}
        onClick={() => onUseAction('up')}
        title={copy.helpfulLabel}
        type="button"
      >
        <ThumbUpIcon />
        <span className="sr-only">{copy.helpfulLabel}</span>
      </button>
      <button
        aria-label={copy.notHelpfulLabel}
        aria-pressed={selectedAction === 'down'}
        className={`chat-reply-action ${selectedAction === 'down' ? 'active' : ''}`}
        onClick={() => onUseAction('down')}
        title={copy.notHelpfulLabel}
        type="button"
      >
        <ThumbDownIcon />
        <span className="sr-only">{copy.notHelpfulLabel}</span>
      </button>
    </div>
  );
}

function getReplyFeedbackCopy(language: SupportedLanguage): {
  copiedLabel: string;
  copyLabel: string;
  groupLabel: string;
  helpfulLabel: string;
  notHelpfulLabel: string;
} {
  if (language === 'hi') {
    return {
      copiedLabel: 'Copy ho gaya',
      copyLabel: 'Predicta reply copy karein',
      groupLabel: 'Predicta reply ke actions',
      helpfulLabel: 'Yeh reply helpful tha',
      notHelpfulLabel: 'Yeh reply helpful nahi tha',
    };
  }

  if (language === 'gu') {
    return {
      copiedLabel: 'Copy thai gayu',
      copyLabel: 'Predicta reply copy karo',
      groupLabel: 'Predicta reply actions',
      helpfulLabel: 'Aa reply helpful hato',
      notHelpfulLabel: 'Aa reply helpful n hato',
    };
  }

  return {
    copiedLabel: 'Copied',
    copyLabel: 'Copy Predicta reply',
    groupLabel: 'Predicta reply actions',
    helpfulLabel: 'Mark reply helpful',
    notHelpfulLabel: 'Mark reply not helpful',
  };
}

function CopyReplyIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="12" rx="2" width="12" x="8" y="8" />
      <path d="M4 16V6a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function ThumbUpIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M7 11v9" />
      <path d="M3 11h4v9H3z" />
      <path d="M7 11l4-8 1.5 1.5c.4.4.6 1 .5 1.6L12.5 9H19a2 2 0 0 1 2 2.3l-1 6A2 2 0 0 1 18 19H7" />
    </svg>
  );
}

function ThumbDownIcon(): React.JSX.Element {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M17 13V4" />
      <path d="M21 13h-4V4h4z" />
      <path d="M17 13l-4 8-1.5-1.5c-.4-.4-.6-1-.5-1.6l.5-2.9H5a2 2 0 0 1-2-2.3l1-6A2 2 0 0 1 6 5h11" />
    </svg>
  );
}

function WebPredictaThinking({
  language,
}: {
  language: SupportedLanguage;
}): React.JSX.Element {
  const [copy, setCopy] = useState(() => getListeningMicrocopy(language));

  useEffect(() => {
    setCopy(getListeningMicrocopy(language));
    const timer = window.setInterval(() => {
      setCopy(getListeningMicrocopy(language));
    }, 1800);

    return () => window.clearInterval(timer);
  }, [language]);

  return (
    <div className="message pridicta thinking-message" key="predicta-listening">
      <span>Predicta</span>
      <div className="predicta-thinking-row">
        <div className="predicta-thinking-mark" aria-hidden>
          <i />
          <i />
          <i />
        </div>
        <p>{copy}</p>
      </div>
    </div>
  );
}

function WebChatReplyText({ text }: { text: string }): React.JSX.Element {
  const parsed = parseProofReply(text);

  return (
    <div className="chat-reply-stack">
      {parsed.body.map((paragraph, index) => (
        <p
          className="chat-reply-paragraph"
          key={`${paragraph}-${index}`}
          style={{ animationDelay: `${index * 80}ms` }}
        >
          {paragraph}
        </p>
      ))}
      {parsed.proof ? <WebChatProofCard proof={parsed.proof} /> : null}
    </div>
  );
}

function WebChatProofCard({
  proof,
}: {
  proof: NonNullable<ParsedProofReply['proof']>;
}): React.JSX.Element {
  return (
    <details className="chat-proof-card" open>
      <summary>
        <span>Ask with proof</span>
        <strong>{proof.confidence}</strong>
      </summary>
      <div className="chat-proof-timing">
        <span>Timing</span>
        <p>{proof.timing}</p>
      </div>
      <div className="chat-proof-chip-row">
        {proof.chartFactors.map(item => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </details>
  );
}

function parseProofReply(text: string): ParsedProofReply {
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
  const confidence =
    proofParts
      .find(part => /^Confidence:/i.test(part))
      ?.replace(/^Confidence:\s*/i, 'Confidence: ') ?? 'Confidence: medium';
  const timing =
    proofParts
      .find(part => /^Timing context:/i.test(part))
      ?.replace(/^Timing context:\s*/i, '') ??
    'No precise timing window was strong enough to claim.';
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
      confidence,
      timing,
    },
  };
}

function WebChatSafetyCard({
  safety,
}: {
  safety: ChatSafetyMeta;
}): React.JSX.Element {
  const [reportState, setReportState] = useState<'idle' | 'sent' | 'error'>('idle');

  async function submitReport() {
    try {
      const response = await fetch('/api/safety/report', {
        body: JSON.stringify({
          reportKind: 'USER_REPORTED',
          route: window.location.pathname,
          safetyCategories: safety.categories ?? [safety.kind],
          safetyIdentifier: getWebSafetyIdentifier(),
          sourceSurface: 'web-chat',
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });

      setReportState(response.ok ? 'sent' : 'error');
    } catch {
      setReportState('error');
    }
  }

  return (
    <div className={`chat-safety-card ${safety.kind}`}>
      <div>
        <strong>{safety.title}</strong>
        <p>{safety.body}</p>
      </div>
      <button
        className="chat-safety-report"
        disabled={reportState === 'sent'}
        onClick={() => void submitReport()}
        type="button"
      >
        {reportState === 'sent'
          ? 'Sent for review'
          : reportState === 'error'
            ? 'Try again'
            : safety.reportLabel}
      </button>
    </div>
  );
}

function WebChatMessageBlock({
  birthDetails,
  block,
  onUsePrompt,
}: {
  birthDetails?: BirthDetails;
  block: ChatMessageBlock;
  onUsePrompt: (prompt: string) => void;
}): React.JSX.Element {
  if (block.type === 'chart') {
    return (
      <WebChatChartBlock
        birthDetails={birthDetails}
        block={block}
        onUsePrompt={onUsePrompt}
      />
    );
  }

  return <></>;
}

function WebChatSuggestions({
  onUseSuggestion,
  suggestions,
}: {
  onUseSuggestion: (suggestion: ChatSuggestedCta) => void;
  suggestions: ChatSuggestedCta[];
}): React.JSX.Element {
  if (!suggestions.length) {
    return <></>;
  }

  return (
    <div className="chat-suggestion-row" aria-label="Suggested follow-up questions">
      {suggestions.slice(0, 5).map(suggestion => (
        <button
          key={suggestion.id}
          onClick={() => onUseSuggestion(suggestion)}
          type="button"
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}

function WebChatChartBlock({
  birthDetails,
  block,
  onUsePrompt,
}: {
  birthDetails?: BirthDetails;
  block: ChatChartBlock;
  onUsePrompt: (prompt: string) => void;
}): React.JSX.Element {
  const renderModel = buildChartRenderModel({ birthDetails, chart: block.chart });
  const cells = renderModel.cells;
  const [hoveredHouse, setHoveredHouse] = useState<number>();
  const [selectedHouse, setSelectedHouse] = useState<number>();
  const selectedCell = selectedHouse ? findHouseCell(cells, selectedHouse) : undefined;
  const useStandardHouseMeaning = shouldUseStandardHouseMeaning(block.chartType);

  return (
    <div className="chat-chart-card" data-chat-kundli-reveal="true">
      <div className="chat-chart-card-header">
        <div>
          <div className="section-title">{block.chartType} · {block.insight.eyebrow}</div>
          <h3>{block.chartName}</h3>
          <p>{block.ownerName}'s chart focus</p>
        </div>
        <strong>{block.supported ? 'Visible' : 'Under review'}</strong>
      </div>

      <div className="chat-chart-body">
        <div
          className="chat-mini-chart"
          data-chart-school={renderModel.school.toLowerCase()}
          data-chart-theme={renderModel.theme}
          {...getKundliAnimationSurfaceProps('chat')}
          aria-label={`${block.chartName} mini chart`}
        >
          <NorthIndianChartLines surface="chat" />
          <svg
            aria-hidden="true"
            className="north-house-state-map chat-house-state-map"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {cells.map(cell => (
              <polygon
                className={`north-house-state ${
                  hoveredHouse === cell.house ? 'hovered' : ''
                } ${selectedHouse === cell.house ? 'selected' : ''}`}
                key={`state-${cell.key}`}
                points={getChatHousePolygonPoints(cell.house ?? 0)}
              />
            ))}
          </svg>
          {cells.map((cell, index) => (
            <button
              aria-pressed={selectedHouse === cell.house}
              aria-label={cell.ariaLabel}
              className={`north-house north-house-${cell.house} ${
                selectedHouse === cell.house ? 'selected' : ''
              }`}
              data-house={cell.house}
              key={cell.key}
              onBlur={() => setHoveredHouse(undefined)}
              onClick={() => {
                setSelectedHouse(cell.house);
                onUsePrompt(`Explain House ${cell.house} in my ${block.chartType} chart with D1 proof.`);
              }}
              onFocus={() => setHoveredHouse(cell.house)}
              onMouseEnter={() => setHoveredHouse(cell.house)}
              onMouseLeave={() => setHoveredHouse(undefined)}
              style={{
                ['--chart-cell-index' as string]: index,
                ['--house-x' as string]: `${cell.x}%`,
                ['--house-y' as string]: `${cell.y}%`,
              } as CSSProperties}
              type="button"
            />
          ))}
          {cells.map((cell, index) => (
            <div
              className={`north-house-label north-house-label-${cell.house} ${
                selectedHouse === cell.house ? 'selected' : ''
              } ${cell.renderPlanets.length > 2 ? 'north-house-label-stacked' : ''}`}
              data-kundli-animation-part="signs"
              key={`label-${cell.key}`}
              style={getKundliAnimationStyle(index, 'signs', 'chat')}
            >
              <span className="north-house-meta">
                <span className="north-house-number">{cell.house}</span>
                <span className="north-sign-name">{cell.sign}</span>
                <span className="north-sign-symbol" aria-hidden>{cell.signGlyph}</span>
                <span className="north-sign-number">{cell.signNumber}</span>
              </span>
              {cell.renderPlanets.length ? (
                <span
                  className="chat-mini-planet-row north-planet-stack"
                  data-kundli-animation-part="planets"
                >
                  {cell.renderPlanets.slice(0, 4).map((planet, planetIndex) => (
                    <PlanetGlyph
                      animationIndex={planetIndex}
                      animationSurface="chat"
                      key={planet.key}
                      moonPhase={renderModel.moonPhase}
                      planet={planet}
                      showDegree
                      showSign={false}
                      size="full"
                    />
                  ))}
                  {cell.renderPlanets.length > 4 ? (
                    <em>+{cell.renderPlanets.length - 4}</em>
                  ) : null}
                </span>
              ) : null}
            </div>
          ))}
          <div className="chat-mini-chart-center">
            <span>{block.chartType}</span>
            <strong>D1 anchor</strong>
          </div>
        </div>

        <div className="chat-chart-proof-panel">
          {selectedCell ? (
            <div className="chat-chart-focus-note">
              <span>Selected</span>
              <strong>
                House {selectedCell.house} · {selectedCell.sign}
              </strong>
              <small>
                {selectedCell.planets.length
                  ? `Planets: ${selectedCell.planets.join(', ')}`
                  : useStandardHouseMeaning
                    ? 'No planet in this house; judge house lord and D1 anchor.'
                    : 'No planet in this varga house; use this chart only as focused D1 confirmation.'}
              </small>
            </div>
          ) : null}
          {!useStandardHouseMeaning ? (
            <div className="chat-chart-focus-note">
              <span>Varga reading rule</span>
              <small>{getChartReadingNote(block.chartType)}</small>
            </div>
          ) : null}

          <div className="chat-evidence-chips">
            {block.evidenceChips.map(chip => (
              <span key={chip}>{chip}</span>
            ))}
          </div>

          <p>{block.insight.summary}</p>
          <ul className="chat-chart-insights">
            {block.insight.bullets.slice(0, 4).map(bullet => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      </div>

      <ChartLegend animationSurface="chat" compact items={renderModel.legend} />
      {renderModel.moonNakshatraPada ? (
        <div className="chat-moon-rhythm-note">
          <span>{renderModel.moonNakshatraPada.moonPhaseLabel}</span>
          <strong>
            {renderModel.moonNakshatraPada.moonNakshatra}
            {renderModel.moonNakshatraPada.pada
              ? ` pada ${renderModel.moonNakshatraPada.pada}`
              : ''}
          </strong>
        </div>
      ) : null}

      <div className="chat-chart-actions">
        {block.ctas.map(cta => (
          <button
            className="button secondary"
            key={cta.id}
            onClick={() => onUsePrompt(cta.prompt)}
            type="button"
          >
            {cta.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function extractHouseNumbersFromText(text: string): number[] {
  const matches = text.matchAll(/\b(?:house\s*)?(\d{1,2})(?:st|nd|rd|th)?\s+houses?\b/gi);
  const houses = Array.from(matches)
    .map(match => Number(match[1]))
    .filter(house => Number.isInteger(house) && house >= 1 && house <= 12);

  return [...new Set(houses)];
}

function getChatHousePolygonPoints(house: number): string {
  return (NORTH_INDIAN_HOUSE_POLYGONS[house] ?? [])
    .map(point => point.join(','))
    .join(' ');
}

function buildInitialMessages(language: SupportedLanguage): WebMessage[] {
  return [
    {
      id: 'welcome',
      role: 'pridicta',
      text: getBirthIntakeWelcome(language),
    },
  ];
}

function createPridictaReply(
  text: string,
  language: SupportedLanguage,
  options: {
    blocks?: ChatMessageBlock[];
    context?: ChartContext;
    kundli?: KundliData;
    lastText: string;
    safety?: ChatSafetyMeta;
    suggestions?: ChatSuggestedCta[];
  },
): WebMessage {
  return {
    blocks: options.blocks,
    context: options.context,
    id: `pridicta-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'pridicta',
    suggestions:
      options.suggestions ??
      buildFollowUps({
        context: options.context,
        kundli: options.kundli,
        language,
        lastText: options.lastText,
      }),
    safety: options.safety,
    text,
  };
}

function buildFollowUps({
  context,
  kundli,
  language,
  lastText,
}: {
  context?: ChartContext;
  kundli?: KundliData;
  language: SupportedLanguage;
  lastText: string;
}): ChatSuggestedCta[] {
  if (
    lastText.includes('Birth time check') ||
    lastText.includes('Birth-time confidence') ||
    lastText.includes('birth time pehle confirm') ||
    lastText.includes('birth time pehla confirm')
  ) {
    return buildBirthDetailConfidenceSuggestions(language);
  }

  if (kundli && lastText.includes('Predicta Radar:')) {
    return buildWowRadarSuggestions(language);
  }

  if (kundli && hasSmartMonetizationMoment(lastText)) {
    return buildSmartMonetizationSuggestions(language, lastText);
  }

  if (
    kundli &&
    (looksLikeBirthDetails(lastText) || context?.sourceScreen === 'Kundli Created')
  ) {
    return buildPostKundliCreatedSuggestions(language);
  }

  return buildChatFollowUps({
    context,
    hasKundli: Boolean(kundli),
    hasPremiumAccess: false,
    kundli,
    language,
    lastText,
  });
}

function buildPostKundliCreatedSuggestions(
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  if (language === 'hi') {
    return [
      {
        id: 'today-after-kundli',
        label: 'Aaj ka guidance',
        prompt:
          'Meri newly created Kundli se aaj ka Gochar, best action, caution aur emotional weather batao.',
      },
      {
        id: 'gochar-after-kundli',
        label: 'Gochar dekho',
        prompt:
          'Meri Kundli se current Gochar ka useful reading do: opportunities, cautions, timing aur proof.',
      },
      {
        id: 'dasha-after-kundli',
        label: 'Mahadasha samjhao',
        prompt:
          'Meri current Mahadasha and Antardasha simple language mein chart proof ke saath samjhao.',
      },
      {
        id: 'report-after-kundli',
        label: 'Report banao',
        prompt:
          'Meri Kundli se ek useful free report preview banao aur batao premium report mein kya deeper milega.',
      },
      {
        href: '/dashboard',
        id: 'dashboard-after-kundli',
        label: 'Dashboard kholo',
        prompt: 'Open dashboard',
        targetScreen: 'Dashboard',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        id: 'today-after-kundli',
        label: 'Aaj nu guidance',
        prompt:
          'Mari newly created Kundli thi aaj no Gochar, best action, caution ane emotional weather kaho.',
      },
      {
        id: 'gochar-after-kundli',
        label: 'Gochar juo',
        prompt:
          'Mari Kundli thi current Gochar nu useful reading aapo: opportunities, cautions, timing ane proof.',
      },
      {
        id: 'dasha-after-kundli',
        label: 'Mahadasha samjhao',
        prompt:
          'Mari current Mahadasha ane Antardasha simple language ma chart proof sathe samjhao.',
      },
      {
        id: 'report-after-kundli',
        label: 'Report banao',
        prompt:
          'Mari Kundli thi ek useful free report preview banao ane premium report ma shu deeper male te kaho.',
      },
      {
        href: '/dashboard',
        id: 'dashboard-after-kundli',
        label: 'Dashboard kholo',
        prompt: 'Open dashboard',
        targetScreen: 'Dashboard',
      },
    ];
  }

  return [
    {
      id: 'today-after-kundli',
      label: "Today's guidance",
      prompt:
        "Use my newly created Kundli and show today's Gochar, best action, caution, and emotional weather.",
    },
    {
      id: 'gochar-after-kundli',
      label: 'Show Gochar',
      prompt:
        'Use my Kundli and give me a useful current Gochar reading with opportunities, cautions, timing, and proof.',
    },
    {
      id: 'dasha-after-kundli',
      label: 'Explain Mahadasha',
      prompt:
        'Explain my current Mahadasha and Antardasha simply with chart proof.',
    },
    {
      id: 'report-after-kundli',
      label: 'Create report',
      prompt:
        'Create a useful free report preview from my Kundli and explain what Premium would add.',
    },
    {
      href: '/dashboard',
      id: 'dashboard-after-kundli',
      label: 'Open dashboard',
      prompt: 'Open dashboard',
      targetScreen: 'Dashboard',
    },
  ];
}

function shouldGateForBirthDetailConfidence(
  text: string,
  kundli: KundliData,
): boolean {
  if (!hasBirthTimeConfidenceRisk(kundli)) {
    return false;
  }

  if (isBirthTimeRectificationRequest(text)) {
    return false;
  }

  return isDeepBirthTimeSensitiveRequest(text);
}

function hasBirthTimeConfidenceRisk(kundli: KundliData): boolean {
  return Boolean(
    kundli.birthDetails.isTimeApproximate ||
      kundli.rectification?.needsRectification ||
      kundli.rectification?.confidence === 'low',
  );
}

function isBirthTimeRectificationRequest(text: string): boolean {
  return /\b(birth\s*time|rectification|rectify|recalculate|re-calculate|correct\s+time|time\s+confidence|birth\s*time\s+detective|time\s+unknown)\b/i.test(
    text,
  );
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

function isDeepBirthTimeSensitiveRequest(text: string): boolean {
  return /\b(predict|prediction|future|timing|when|age|year|month|career|job|business|finance|money|wealth|marriage|relationship|child|children|health|legal|court|case|report|pdf|mahadasha|antardasha|dasha|sade\s*sati|gochar|transit|kundli|chart|house|lagna|ascendant|d[0-9]+|navamsha|dashamsha|kp|nadi|remedy|yoga|dosha|muhurta|decision|passport|timeline)\b/i.test(
    text,
  );
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
      `Done. ${name} के लिए entered birth time ${enteredTime} confirm कर दिया है.`,
      restoredFromRectified
        ? `मैंने rectified time हटाकर original entered time ${enteredTime} से Kundli दोबारा calculate कर दी है.`
        : 'अब इस Kundli पर rectified/probable time label नहीं लगेगा.',
      'अब मैं normal chart guidance दे सकती हूं. Exact event timing में फिर भी सावधानी रखूंगी, क्योंकि astrology guidance है, guarantee नहीं.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      `Done. ${name} માટે entered birth time ${enteredTime} confirm કરી દીધો છે.`,
      restoredFromRectified
        ? `મેં rectified time હટાવીને original entered time ${enteredTime} થી Kundli ફરી calculate કરી છે.`
        : 'હવે આ Kundli પર rectified/probable time label નહીં લાગે.',
      'હવે હું normal chart guidance આપી શકું છું. Exact event timing માં પણ સાવચેતી રાખીશ, કારણ કે astrology guidance છે, guarantee નથી.',
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
    return 'Birth time confirm करते समय issue आ गया. Please एक बार Birth Time Detective या Kundli page से दोबारा try करें.';
  }

  if (language === 'gu') {
    return 'Birth time confirm કરતી વખતે issue આવ્યો. Please Birth Time Detective અથવા Kundli page થી ફરી try કરો.';
  }

  return 'I could not confirm the birth time just now. Please try again from Birth Time Detective or the Kundli page.';
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
      'Birth time check पहले करते हैं.',
      `मेरे पास ${kundli.birthDetails.name} की Kundli है, पर birth time ${timeText} को deep prediction के लिए confirm करना ज़रूरी है. Even 10-15 minutes houses, divisional charts और timing को change कर सकते हैं.`,
      `Reason: ${reason}.`,
      'मैं अभी broad guidance दे सकती हूं, लेकिन exact timing, marriage/career/finance prediction, D9/D10/KP/Nadi depth या report-grade answer से पहले time confirm करूंगी.',
      'अगर time doubtful है, मैं simple life-event questions पूछकर probable corrected birth time estimate कर सकती हूं. इससे reading safer और ज़्यादा honest रहेगी.',
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      'Birth time પહેલા confirm કરીએ.',
      `મારી પાસે ${kundli.birthDetails.name} ની Kundli છે, પણ birth time ${timeText} deep prediction માટે confirm કરવો જરૂરી છે. 10-15 minutes પણ houses, divisional charts અને timing બદલી શકે છે.`,
      `Reason: ${reason}.`,
      'હું હાલ broad guidance આપી શકું છું, પણ exact timing, marriage/career/finance prediction, D9/D10/KP/Nadi depth અથવા report-grade answer પહેલાં time confirm કરીશ.',
      'જો time doubtful હોય, હું simple life-event questions પૂછીને probable corrected birth time estimate કરી શકું છું. આ reading ને safer અને honest બનાવે છે.',
    ].join('\n\n');
  }

  return [
    'Birth time check first.',
    `I have ${kundli.birthDetails.name}'s Kundli, but the birth time ${timeText} needs confirmation before deep prediction. Even 10-15 minutes can change houses, divisional charts, and timing.`,
    `Reason: ${reason}.`,
    'I can still give broad guidance, but I will not do exact timing, marriage/career/finance prediction, D9/D10/KP/Nadi depth, or report-grade analysis until the time is confirmed.',
    'If the time is doubtful, I can ask simple life-event questions and estimate a probable corrected birth time. That keeps the reading safer and more honest.',
  ].join('\n\n');
}

function buildPartialBirthDetailGateReply(
  language: SupportedLanguage,
  memory?: PredictaBirthMemory,
): string | undefined {
  const draft = memory?.draft;
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
      'मैं half details पर deep prediction start नहीं करूंगी.',
      knownDetails ? `अभी मेरे पास:\n${knownDetails}` : undefined,
      `Missing: ${missing.join(', ')}.`,
      'DOB से broad बात हो सकती है, लेकिन real Kundli, houses, dasha, timing, KP/Nadi और reports के लिए birth time और place ज़रूरी हैं.',
      'अगर birth time exact नहीं पता, “time unknown” लिख दीजिए. मैं simple life questions पूछकर birth-time detective mode से guide करूंगी.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      'હું half details પર deep prediction start નહીં કરું.',
      knownDetails ? `હાલમાં મારી પાસે:\n${knownDetails}` : undefined,
      `Missing: ${missing.join(', ')}.`,
      'DOB થી broad વાત થઈ શકે, પણ real Kundli, houses, dasha, timing, KP/Nadi અને reports માટે birth time અને place જરૂરી છે.',
      'જો birth time exact ખબર નથી, “time unknown” લખો. હું simple life questions પૂછીને birth-time detective mode થી guide કરીશ.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    'I will not start deep prediction from half details.',
    knownDetails ? `So far I have:\n${knownDetails}` : undefined,
    `Missing: ${missing.join(', ')}.`,
    'DOB can support broad guidance, but a real Kundli, houses, dasha, timing, KP/Nadi, and reports need birth time and birth place.',
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
        label: 'Time correct है',
        prompt:
          'मेरा birth time correct है. इस confidence के साथ reading continue करो, पर timing confidence clearly mention करना.',
      },
      {
        id: 'birth-confidence-rectify',
        label: 'Time re-check karo',
        prompt:
          'मेरा birth time doubtful है. मुझे simple life-event questions पूछकर probable corrected birth time estimate करो.',
      },
      {
        href: '/dashboard/birth-time',
        id: 'birth-confidence-detective',
        label: 'Birth Time Detective',
        prompt: 'Open Birth Time Detective',
        targetScreen: 'Birth Time',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        id: 'birth-confidence-confirm-time',
        label: 'Time correct છે',
        prompt:
          'મારો birth time correct છે. આ confidence સાથે reading continue કરો, પણ timing confidence clearly mention કરજો.',
      },
      {
        id: 'birth-confidence-rectify',
        label: 'Time re-check karo',
        prompt:
          'મારો birth time doubtful છે. મને simple life-event questions પૂછીને probable corrected birth time estimate કરો.',
      },
      {
        href: '/dashboard/birth-time',
        id: 'birth-confidence-detective',
        label: 'Birth Time Detective',
        prompt: 'Open Birth Time Detective',
        targetScreen: 'Birth Time',
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
      href: '/dashboard/birth-time',
      id: 'birth-confidence-detective',
      label: 'Birth Time Detective',
      prompt: 'Open Birth Time Detective',
      targetScreen: 'Birth Time',
    },
  ];
}

function hasSmartMonetizationMoment(text: string): boolean {
  return (
    text.includes('Go deeper option:') ||
    text.includes('Premium nudge:') ||
    /\b(12-month|Life Calendar|Premium PDF|one-time report|detailed map|report-grade|Compatibility\/Marriage report|Dasha Life Map|Sade Sati plan)\b/i.test(
      text,
    )
  );
}

function buildSmartMonetizationSuggestions(
  language: SupportedLanguage,
  lastText: string,
): ChatSuggestedCta[] {
  const reportFocused =
    /\b(report|pdf|marriage|compatibility|kundli dossier)\b/i.test(lastText);
  const timingFocused =
    /\b(12-month|calendar|timing|dasha|gochar|sade sati|yearly)\b/i.test(
      lastText,
    );

  if (language === 'hi') {
    return [
      {
        id: 'smart-free-preview',
        label: 'Free preview pehle',
        prompt:
          'Pehle useful free preview do. Phir simple language mein batao paid depth kya extra add karega.',
      },
      reportFocused
        ? {
            href: '/dashboard/report',
            id: 'smart-report',
            label: 'Report options',
            prompt: 'Open report options',
            targetScreen: 'Report',
          }
        : {
            href: '/dashboard/premium',
            id: 'smart-premium',
            label: 'Choose paid depth',
            prompt: 'Open premium options',
            targetScreen: 'Premium',
          },
      timingFocused
        ? {
            href: '/dashboard/timeline',
            id: 'smart-calendar',
            label: 'Life Calendar',
            prompt: 'Open life calendar',
            targetScreen: 'Timeline',
          }
        : {
            href: '/checkout?productId=pridicta_day_pass_24h',
            id: 'smart-day-pass',
            label: '24h depth try karo',
            prompt: 'Try Day Pass',
            targetScreen: 'Checkout',
          },
      {
        href: '/pricing',
        id: 'smart-compare',
        label: 'Need ke hisaab se choose',
        prompt: 'Compare options',
        targetScreen: 'Pricing',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        id: 'smart-free-preview',
        label: 'Free preview pehla',
        prompt:
          'Pehla useful free preview aapo. Pachhi simple language ma kaho paid depth shu extra add karse.',
      },
      reportFocused
        ? {
            href: '/dashboard/report',
            id: 'smart-report',
            label: 'Report options',
            prompt: 'Open report options',
            targetScreen: 'Report',
          }
        : {
            href: '/dashboard/premium',
            id: 'smart-premium',
            label: 'Paid depth choose karo',
            prompt: 'Open premium options',
            targetScreen: 'Premium',
          },
      timingFocused
        ? {
            href: '/dashboard/timeline',
            id: 'smart-calendar',
            label: 'Life Calendar',
            prompt: 'Open life calendar',
            targetScreen: 'Timeline',
          }
        : {
            href: '/checkout?productId=pridicta_day_pass_24h',
            id: 'smart-day-pass',
            label: '24h depth try karo',
            prompt: 'Try Day Pass',
            targetScreen: 'Checkout',
          },
      {
        href: '/pricing',
        id: 'smart-compare',
        label: 'Need pramane choose karo',
        prompt: 'Compare options',
        targetScreen: 'Pricing',
      },
    ];
  }

  return [
    {
      id: 'smart-free-preview',
      label: 'Show free preview first',
      prompt:
        'Show me the useful free preview first, then explain what the paid depth would add.',
    },
    reportFocused
      ? {
          href: '/dashboard/report',
          id: 'smart-report',
          label: 'Choose report',
          prompt: 'Open report options',
          targetScreen: 'Report',
        }
      : {
          href: '/dashboard/premium',
          id: 'smart-premium',
          label: 'Choose paid depth',
          prompt: 'Open premium options',
          targetScreen: 'Premium',
        },
    timingFocused
      ? {
          href: '/dashboard/timeline',
          id: 'smart-calendar',
          label: 'Open Life Calendar',
          prompt: 'Open life calendar',
          targetScreen: 'Timeline',
        }
      : {
          href: '/checkout?productId=pridicta_day_pass_24h',
          id: 'smart-day-pass',
          label: 'Try 24-hour depth',
          prompt: 'Try Day Pass',
          targetScreen: 'Checkout',
        },
    {
      href: '/pricing',
      id: 'smart-compare',
      label: 'Choose by need',
      prompt: 'Compare options',
      targetScreen: 'Pricing',
    },
  ];
}

function buildWowRadarSuggestions(
  language: SupportedLanguage,
): ChatSuggestedCta[] {
  if (language === 'hi') {
    return [
      {
        id: 'radar-daily-action',
        label: 'Daily action banao',
        prompt:
          'Is Predicta Radar pattern ka daily action kya hai? Gochar, Mahadasha aur remedy ke saath simple weekly plan banao.',
      },
      {
        id: 'radar-gochar',
        label: 'Gochar se check karo',
        prompt:
          'Is Radar pattern ko current Gochar ke saath compare karo aur batao aaj kya useful hai.',
      },
      {
        href: '/dashboard/charts',
        id: 'radar-open-charts',
        label: 'Charts kholo',
        prompt: 'Open charts',
        targetScreen: 'Charts',
      },
      {
        href: '/dashboard/report',
        id: 'radar-create-report',
        label: 'Report banao',
        prompt: 'Create report',
        targetScreen: 'Report',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        id: 'radar-daily-action',
        label: 'Daily action banao',
        prompt:
          'Aa Predicta Radar pattern nu daily action shu chhe? Gochar, Mahadasha ane remedy sathe simple weekly plan banao.',
      },
      {
        id: 'radar-gochar',
        label: 'Gochar thi check karo',
        prompt:
          'Aa Radar pattern ne current Gochar sathe compare karo ane aaje shu useful chhe te kaho.',
      },
      {
        href: '/dashboard/charts',
        id: 'radar-open-charts',
        label: 'Charts kholo',
        prompt: 'Open charts',
        targetScreen: 'Charts',
      },
      {
        href: '/dashboard/report',
        id: 'radar-create-report',
        label: 'Report banao',
        prompt: 'Create report',
        targetScreen: 'Report',
      },
    ];
  }

  return [
    {
      id: 'radar-daily-action',
      label: 'Make daily action',
      prompt:
        'What daily action fits this Predicta Radar pattern? Use Gochar, Mahadasha, and remedies to make a simple weekly plan.',
    },
    {
      id: 'radar-gochar',
      label: 'Check with Gochar',
      prompt:
        'Compare this Radar pattern with current Gochar and tell me what is useful today.',
    },
    {
      href: '/dashboard/charts',
      id: 'radar-open-charts',
      label: 'Open charts',
      prompt: 'Open charts',
      targetScreen: 'Charts',
    },
    {
      href: '/dashboard/report',
      id: 'radar-create-report',
      label: 'Create report',
      prompt: 'Create report',
      targetScreen: 'Report',
    },
  ];
}

function chartContextFromParams(params: URLSearchParams): ChartContext | undefined {
  const school = parsePredictaSchool(params.get('school'));
  const fromSchool = parsePredictaSchool(params.get('from'));
  const handoffQuestion = params.get('handoffQuestion');
  const kundliId = params.get('kundliId') ?? undefined;
  const chartType = params.get('chartType') as ChartType | null;
  const selectedHouse = params.get('selectedHouse');

  if (school) {
    return {
      chartName: params.get('chartName') ?? chartType ?? undefined,
      chartType: chartType ?? undefined,
      handoffFrom: fromSchool ?? (school !== 'PARASHARI' ? 'PARASHARI' : undefined),
      handoffQuestion: handoffQuestion ?? params.get('prompt') ?? undefined,
      kundliId,
      predictaSchool: school,
      purpose: params.get('purpose') ?? undefined,
      selectedHouse: selectedHouse ? Number(selectedHouse) : undefined,
      selectedPlanet: params.get('selectedPlanet') ?? undefined,
      selectedSection:
        params.get('prompt') ??
        params.get('selectedSection') ??
        (handoffQuestion
          ? `${school} Predicta handoff question: ${handoffQuestion}`
          : undefined),
      sourceScreen: params.get('sourceScreen') ?? `${school} Predicta`,
    };
  }

  if (!chartType) {
    return undefined;
  }

  return {
    chartName: params.get('chartName') ?? chartType,
    chartType,
    kundliId,
    purpose: params.get('purpose') ?? undefined,
    selectedHouse: selectedHouse ? Number(selectedHouse) : undefined,
    selectedPlanet: params.get('selectedPlanet') ?? undefined,
    selectedSection: params.get('prompt') ?? undefined,
    sourceScreen: params.get('sourceScreen') ?? 'Charts',
  };
}

function ctaContextFromParams(params: URLSearchParams): ChartContext | undefined {
  const sourceScreen = params.get('sourceScreen');
  const prompt = params.get('prompt') ?? params.get('selectedSection') ?? undefined;

  if (!sourceScreen && !prompt && !params.get('kundliId')) {
    return undefined;
  }

  return {
    handoffQuestion: params.get('handoffQuestion') ?? undefined,
    handoffFrom: parsePredictaSchool(params.get('from')),
    kundliId: params.get('kundliId') ?? undefined,
    predictaSchool: parsePredictaSchool(params.get('school')),
    selectedBirthTimeDetective: params.get('birthTimeDetective') === 'true',
    selectedDailyBriefingDate:
      params.get('selectedDailyBriefingDate') ?? params.get('briefingDate') ?? undefined,
    selectedDecisionArea:
      (params.get('decisionArea') as ChartContext['selectedDecisionArea']) ?? undefined,
    selectedDecisionQuestion: params.get('decisionQuestion') ?? undefined,
    selectedDecisionState:
      (params.get('decisionState') as ChartContext['selectedDecisionState']) ?? undefined,
    selectedFamilyKarmaMap: params.get('selectedFamilyKarmaMap') === 'true',
    selectedFamilyMemberCount: parseOptionalNumber(
      params.get('selectedFamilyMemberCount'),
    ),
    selectedPredictaWrapped: params.get('selectedPredictaWrapped') === 'true',
    selectedPredictaWrappedYear: parseOptionalNumber(
      params.get('selectedPredictaWrappedYear'),
    ),
    selectedRelationshipMirror: params.get('selectedRelationshipMirror') === 'true',
    selectedRemedyId: params.get('remedyId') ?? undefined,
    selectedRemedyTitle: params.get('remedyTitle') ?? undefined,
    selectedSection: prompt,
    selectedTimelineEventId: params.get('selectedTimelineEventId') ?? undefined,
    selectedTimelineEventKind:
      (params.get('selectedTimelineEventKind') as ChartContext['selectedTimelineEventKind']) ??
      undefined,
    selectedTimelineEventTitle: params.get('selectedTimelineEventTitle') ?? undefined,
    selectedTimelineEventWindow: params.get('selectedTimelineEventWindow') ?? undefined,
    sourceScreen: sourceScreen ?? 'Predicta',
  };
}

function parsePredictaSchool(value: string | null): PredictaSchool | undefined {
  if (
    value === 'PARASHARI' ||
    value === 'KP' ||
    value === 'NADI' ||
    value === 'NUMEROLOGY' ||
    value === 'SIGNATURE'
  ) {
    return value;
  }

  return undefined;
}

function parseOptionalNumber(value: string | null): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildCtaContextIntro(
  context: ChartContext,
  language: SupportedLanguage,
): string {
  const source = getFriendlySourceName(context.sourceScreen);
  const focus =
    context.selectedDecisionQuestion ??
    context.selectedRemedyTitle ??
    context.selectedTimelineEventTitle ??
    context.selectedSection ??
    context.handoffQuestion;

  if (language === 'hi') {
    return [
      `${source} से आपका सवाल मिल गया है.`,
      focus ? `अब हम यह देख रहे हैं: ${focus}` : undefined,
      'मैं आपकी selected Kundli से यहीं जवाब दूंगी. आप Ask दबाइए या अपना follow-up लिखिए.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `${source} માંથી તમારો સવાલ મળી ગયો છે.`,
      focus ? `હવે આપણે આ જોઈ રહ્યા છીએ: ${focus}` : undefined,
      'હું તમારી selected Kundli થી અહીં જ જવાબ આપીશ. Ask દબાવો અથવા follow-up લખો.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `I picked this up from ${source}.`,
    focus ? `We are looking at: ${focus}` : undefined,
    'I will use your selected Kundli here. Press Ask or type your follow-up.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function getFriendlySourceName(source?: string): string {
  const normalized = (source || 'Predicta')
    .replace(/\bHeader\b/gi, '')
    .replace(/\bMarketplace\b/gi, 'Reports')
    .replace(/\bJourney\b/gi, '')
    .replace(/\bQuick Actions\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalized || normalized === 'Dashboard') {
    return 'your dashboard';
  }

  if (/dashboard/i.test(normalized)) {
    return 'your dashboard';
  }

  return normalized;
}

function buildSchoolContextIntro(
  context: ChartContext,
  language: SupportedLanguage,
): string {
  const school = getPredictaSchoolLabel(context.predictaSchool);
  const fromSchool =
    context.handoffFrom && context.handoffFrom !== context.predictaSchool
      ? getPredictaSchoolLabel(context.handoffFrom)
      : undefined;
  const question = context.handoffQuestion ?? context.selectedSection;
  const chartFocus = context.chartName ?? context.chartType;

  if (language === 'hi') {
    return [
      `${school} ready है.`,
      fromSchool
        ? `${fromSchool} से context आ गया है. Method mix नहीं होगा.`
        : undefined,
      chartFocus ? `Selected chart: ${chartFocus}.` : undefined,
      question ? `आपका question: ${question}` : undefined,
      context.predictaSchool === 'KP'
        ? 'अब answer KP के cusps, star lords, sub lords, significators और ruling planets से ही grounded रहेगा.'
      : context.predictaSchool === 'NADI'
          ? 'Nadi Predicta ready है. मैं planetary story links और validation questions से पढ़ूंगी; ancient palm-leaf access का दावा नहीं करूंगी.'
      : context.predictaSchool === 'NUMEROLOGY'
          ? 'अब answer name number, birth number, destiny number, personal timing और name rhythm पर grounded रहेगा.'
      : context.predictaSchool === 'SIGNATURE'
          ? 'अब answer confirmed signature traits, self-expression patterns, improvement suggestions और safe reflection पर grounded रहेगा. यह identity verification, handwriting forensics, legal proof या diagnosis नहीं है.'
          : 'अब answer Vedic Parashari Jyotish context में रहेगा.',
      'Press Ask या अपना follow-up लिखिए.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `${school} ready છે.`,
      fromSchool
        ? `${fromSchool} થી context આવી ગયો છે. Method mix નહીં થાય.`
        : undefined,
      chartFocus ? `Selected chart: ${chartFocus}.` : undefined,
      question ? `તમારો question: ${question}` : undefined,
      context.predictaSchool === 'KP'
        ? 'હવે answer KP cusps, star lords, sub lords, significators અને ruling planets પર grounded રહેશે.'
      : context.predictaSchool === 'NADI'
          ? 'Nadi Predicta ready છે. હું planetary story links અને validation questions થી વાંચીશ; ancient palm-leaf access નો દાવો નહીં કરું.'
      : context.predictaSchool === 'NUMEROLOGY'
          ? 'હવે answer name number, birth number, destiny number, personal timing અને name rhythm પર grounded રહેશે.'
      : context.predictaSchool === 'SIGNATURE'
          ? 'હવે answer confirmed signature traits, self-expression patterns, improvement suggestions અને safe reflection પર grounded રહેશે. આ identity verification, handwriting forensics, legal proof કે diagnosis નથી.'
          : 'હવે answer Vedic Parashari Jyotish context માં રહેશે.',
      'Ask દબાવો અથવા તમારો follow-up લખો.',
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
    question ? `Your question: ${question}` : undefined,
    context.predictaSchool === 'KP'
      ? 'The answer will now stay grounded in KP cusps, star lords, sub lords, significators, and ruling planets.'
    : context.predictaSchool === 'NADI'
        ? 'Nadi Predicta is ready. I will read through planetary story links and validation questions, without claiming access to an ancient palm-leaf record.'
    : context.predictaSchool === 'NUMEROLOGY'
        ? 'The answer will now stay grounded in name number, birth number, destiny number, personal timing, and name rhythm.'
    : context.predictaSchool === 'SIGNATURE'
        ? 'The answer will now stay grounded in confirmed signature traits, self-expression patterns, improvement suggestions, and safe reflection. It is not identity verification, handwriting forensics, legal proof, or diagnosis.'
        : 'The answer will now stay in Vedic Parashari Jyotish.',
    'Press Ask, or type your follow-up.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function getPredictaSchoolLabel(school: PredictaSchool | undefined): string {
  if (school === 'KP') {
    return 'KP Predicta';
  }

  if (school === 'NADI') {
    return 'Nadi Predicta';
  }

  if (school === 'NUMEROLOGY') {
    return 'Numerology Predicta';
  }

  if (school === 'SIGNATURE') {
    return 'Signature Predicta';
  }

  return 'Vedic Predicta';
}

function buildContextMessage({
  birthTimeDetective,
  briefingDate,
  decisionArea,
  decisionQuestion,
  decisionState,
  language,
  remedyTitle,
}: {
  birthTimeDetective: boolean;
  briefingDate: string | null;
  decisionArea: string | null;
  decisionQuestion: boolean;
  decisionState: string | null;
  language: SupportedLanguage;
  remedyTitle: string | null;
}): string {
  if (language === 'hi') {
    if (birthTimeDetective) {
      return 'Birth Time Detective report loaded hai. Confidence aur safe timing limits samjhane ke liye poochiye.';
    }
    if (remedyTitle) {
      return `Remedy Coach practice loaded hai: ${remedyTitle}. Chart evidence se samjhane ke liye poochiye.`;
    }
    if (decisionQuestion) {
      return `Decision Oracle memo loaded hai: ${decisionArea} / ${decisionState}. Chart evidence se samjhane ke liye poochiye.`;
    }
    if (briefingDate) {
      return `${briefingDate} ki daily briefing loaded hai. Chart evidence se samjhane ke liye poochiye.`;
    }
    return 'Timeline event loaded hai. Chart evidence se samjhane ke liye poochiye.';
  }

  if (language === 'gu') {
    if (birthTimeDetective) {
      return 'Birth Time Detective report loaded chhe. Confidence ane safe timing limits samjhava poochho.';
    }
    if (remedyTitle) {
      return `Remedy Coach practice loaded chhe: ${remedyTitle}. Chart evidence thi samjhava poochho.`;
    }
    if (decisionQuestion) {
      return `Decision Oracle memo loaded chhe: ${decisionArea} / ${decisionState}. Chart evidence thi samjhava poochho.`;
    }
    if (briefingDate) {
      return `${briefingDate} ni daily briefing loaded chhe. Chart evidence thi samjhava poochho.`;
    }
    return 'Timeline event loaded chhe. Chart evidence thi samjhava poochho.';
  }

  if (birthTimeDetective) {
    return 'I loaded your Birth Time Detective report. Press Ask when you want me to explain confidence and safe timing limits.';
  }
  if (remedyTitle) {
    return `I loaded your Remedy Coach practice: ${remedyTitle}. Press Ask when you want me to explain it from chart evidence.`;
  }
  if (decisionQuestion) {
    return `I loaded your Decision Oracle memo: ${decisionArea} / ${decisionState}. Press Ask when you want me to explain it from chart evidence.`;
  }
  if (briefingDate) {
    return `I loaded your daily briefing for ${briefingDate}. Press Ask when you want me to explain it from chart evidence.`;
  }
  return 'I loaded your timeline event. Press Ask when you want me to explain it from chart evidence.';
}

function chatPlaceholder(language: SupportedLanguage): string {
  if (language === 'hi') {
    return 'Birth details likhein ya calculated Kundli se poochhein...';
  }
  if (language === 'gu') {
    return 'Birth details lakho ya calculated Kundli parthi poochho...';
  }
  return 'Share birth details or ask from a calculated kundli...';
}

function looksLikeBirthDetails(text: string): boolean {
  const normalized = text.toLowerCase();

  return (
    /\b\d{1,2}[:.]\d{2}\b/.test(normalized) ||
    /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(normalized) ||
    /\b(born|birth|dob|jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)\b/.test(
      normalized,
    )
  );
}

function createKundliFirstReply(
  language: SupportedLanguage,
  text: string,
): string {
  const safety = hasHighStakesLanguage(text)
    ? `${getSafetyBoundaryCopy(language)}\n\n`
    : '';

  if (language === 'hi') {
    return `${safety}Main aapke saath hoon. Is sawal ka sahi chart-based jawab dene ke liye pehle Kundli chahiye. Yahin chat mein apni birth date, birth time aur birth place bhej dein. Main Kundli yahin bana dungi.`;
  }
  if (language === 'gu') {
    return `${safety}Hu tamari sathe chhu. Aa sawal no sacho chart-based jawab aapva mate pehla Kundli joye. Ahi chat ma birth date, birth time ane birth place moklo. Hu Kundli ahi j banaavi daish.`;
  }
  return `${safety}I am with you. To answer this from your real chart, I need your Kundli first. Share your date of birth, birth time, and birth place right here, and I will create the Kundli inside this chat.`;
}

function buildPlaceClarificationReply(
  language: SupportedLanguage,
  readyText: string,
): string {
  if (language === 'hi') {
    return [
      readyText,
      'Main Kundli yahin banaungi. Bas birth place thoda aur clear chahiye: city, state, country likh dein.',
    ].join('\n\n');
  }
  if (language === 'gu') {
    return [
      readyText,
      'Hu Kundli ahi j banaish. Fakat birth place thodu vadhu clear joye: city, state, country lakho.',
    ].join('\n\n');
  }
  return [
    readyText,
    'I will create the Kundli right here. I just need the birth place a little clearer: city, state, country.',
  ].join('\n\n');
}

function buildKundliCreatedReply(
  language: SupportedLanguage,
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
      'Ho gaya. Maine Kundli yahin chat mein bana di hai aur ise selected rakh liya hai.',
      lines.join('\n'),
      'Ab career, marriage, money, health tendencies, remedies, timing, ya kisi decision par poochiye. Main answer chart proof ke saath dungi.',
      'Neeche quick options diye hain: aaj ka guidance chat mein padh sakte hain, Gochar dekh sakte hain, Mahadasha samajh sakte hain, report bana sakte hain, ya dashboard khol sakte hain.',
    ].join('\n\n');
  }
  if (language === 'gu') {
    return [
      'Thai gayu. Maine Kundli ahi chat ma banaavi didhi chhe ane tene selected rakhi chhe.',
      lines.join('\n'),
      'Have career, marriage, money, health tendencies, remedies, timing athva koi decision vishe poochho. Hu chart proof sathe jawab aapish.',
      'Niche quick options chhe: aaj nu guidance chat ma vanchi shako, Gochar joi shako, Mahadasha samjhi shako, report banaavi shako, athva dashboard kholo.',
    ].join('\n\n');
  }
  return [
    'Done. I created your Kundli right here in chat and selected it for this reading.',
    lines.join('\n'),
    'Now ask me about career, marriage, money, health tendencies, remedies, timing, or any decision. I will answer with chart proof.',
    "Use the quick options below to read today's guidance here, see Gochar, understand Mahadasha, create a report, or open the dashboard.",
  ].join('\n\n');
}

function ensureWebChatSessionStore(
  uid: string,
  fallback: {
    activeChartContext?: ChartContext;
    birthMemory?: PredictaBirthMemory;
    chatLanguage: SupportedLanguage;
    kundliId?: string;
    messages: WebMessage[];
    predictaMemory?: PredictaInteractionMemory;
    replyLanguage: SupportedLanguage;
  },
): WebChatSessionStore {
  const stored = loadWebChatSessionStore(uid);

  if (stored.sessions.length > 0) {
    const activeSessionId = stored.activeSessionId ?? stored.sessions[0]?.id;
    const normalized = {
      activeSessionId,
      sessions: stored.sessions,
    };
    saveWebChatSessionStore(uid, normalized);
    return normalized;
  }

  return createWebChatSession(uid, fallback);
}

function createWebChatSession(
  uid: string,
  seed: {
    activeChartContext?: ChartContext;
    chatLanguage: SupportedLanguage;
    kundliId?: string;
    replyLanguage: SupportedLanguage;
  },
): WebChatSessionStore {
  const now = new Date().toISOString();
  const session: WebChatSession = {
    activeChartContext: seed.activeChartContext,
    chatLanguage: seed.chatLanguage,
    createdAt: now,
    id: createWebChatSessionId(),
    kundliId: seed.kundliId,
    messages: buildInitialMessages(seed.chatLanguage),
    replyLanguage: seed.replyLanguage,
    school: getSchoolFromContext(seed.activeChartContext),
    selectedChart: seed.activeChartContext?.chartType,
    selectedHouse: seed.activeChartContext?.selectedHouse,
    title: seed.activeChartContext?.sourceScreen
      ? `${seed.activeChartContext.sourceScreen} chat`
      : 'New Predicta chat',
    updatedAt: now,
  };
  const current = loadWebChatSessionStore(uid);
  const next = {
    activeSessionId: session.id,
    sessions: [session, ...current.sessions].slice(0, 30),
  };

  saveWebChatSessionStore(uid, next);
  return next;
}

function upsertWebChatSession(
  uid: string,
  sessionPatch: {
    activeChartContext?: ChartContext;
    birthMemory?: PredictaBirthMemory;
    chatLanguage: SupportedLanguage;
    id: string;
    kundliId?: string;
    messages: WebMessage[];
    predictaMemory?: PredictaInteractionMemory;
    replyLanguage: SupportedLanguage;
  },
): WebChatSessionStore {
  const current = loadWebChatSessionStore(uid);
  const now = new Date().toISOString();
  const existing = current.sessions.find(session => session.id === sessionPatch.id);
  const nextSession: WebChatSession = {
    activeChartContext: sessionPatch.activeChartContext,
    birthMemory: sessionPatch.birthMemory,
    chatLanguage: sessionPatch.chatLanguage,
    createdAt: existing?.createdAt ?? now,
    id: sessionPatch.id,
    kundliId: sessionPatch.kundliId,
    messages: sessionPatch.messages.slice(-36),
    predictaMemory: sessionPatch.predictaMemory,
    replyLanguage: sessionPatch.replyLanguage,
    school: getSchoolFromContext(sessionPatch.activeChartContext),
    selectedChart: sessionPatch.activeChartContext?.chartType,
    selectedHouse: sessionPatch.activeChartContext?.selectedHouse,
    title: buildWebChatSessionTitle(
      sessionPatch.messages,
      sessionPatch.activeChartContext,
      existing?.title,
    ),
    updatedAt: now,
  };
  const next = {
    activeSessionId: sessionPatch.id,
    sessions: [
      nextSession,
      ...current.sessions.filter(session => session.id !== sessionPatch.id),
    ].slice(0, 30),
  };

  saveWebChatSessionStore(uid, next);
  return next;
}

function activateWebChatSession(
  uid: string,
  sessionId: string,
): WebChatSessionStore {
  const current = loadWebChatSessionStore(uid);
  const next = {
    ...current,
    activeSessionId: sessionId,
  };

  saveWebChatSessionStore(uid, next);
  return next;
}

function getActiveWebChatSession(
  store: WebChatSessionStore,
): WebChatSession | undefined {
  return (
    store.sessions.find(session => session.id === store.activeSessionId) ??
    store.sessions[0]
  );
}

function loadWebChatSessionStore(uid: string): WebChatSessionStore {
  try {
    const raw = window.localStorage.getItem(getWebChatSessionKey(uid));
    if (!raw) {
      return { sessions: [] };
    }

    const parsed = JSON.parse(raw) as WebChatSessionStore;
    return {
      activeSessionId: parsed.activeSessionId,
      sessions: Array.isArray(parsed.sessions)
        ? parsed.sessions.map(session => ({
            ...session,
            messages: session.messages.map(sanitizeStoredMessage),
          }))
        : [],
    };
  } catch {
    return { sessions: [] };
  }
}

function saveWebChatSessionStore(
  uid: string,
  store: WebChatSessionStore,
): void {
  try {
    window.localStorage.setItem(getWebChatSessionKey(uid), JSON.stringify(store));
  } catch {
    // Saved chat sessions are a convenience; the current chat remains usable.
  }
}

function getWebChatSessionKey(uid: string): string {
  return `${WEB_CHAT_SESSIONS_KEY_PREFIX}.${encodeURIComponent(uid)}`;
}

function createWebChatSessionId(): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  return `chat-${random}`;
}

function buildWebChatSessionTitle(
  messages: WebMessage[],
  context?: ChartContext,
  existingTitle?: string,
): string {
  const firstUserMessage = messages.find(message => message.role === 'user')?.text;
  const fromContext =
    context?.sourceScreen ??
    context?.selectedSection ??
    context?.chartType ??
    context?.predictaSchool;
  const base = firstUserMessage ?? fromContext ?? existingTitle ?? 'Predicta chat';
  const compact = base.replace(/\s+/g, ' ').trim();

  return compact.length > 34 ? `${compact.slice(0, 31)}...` : compact;
}

function getSchoolFromContext(
  context?: ChartContext,
): WebChatSession['school'] {
  if (context?.predictaSchool === 'KP') {
    return 'KP';
  }
  if (context?.predictaSchool === 'NADI') {
    return 'NADI';
  }
  if (context?.predictaSchool === 'NUMEROLOGY') {
    return 'NUMEROLOGY';
  }
  if (context?.predictaSchool === 'SIGNATURE') {
    return 'SIGNATURE';
  }
  return 'PARASHARI';
}

function loadWebChatMemory(): WebChatMemory | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_CHAT_MEMORY_KEY);
    return raw ? (JSON.parse(raw) as WebChatMemory) : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeStoredMessage(message: WebMessage): WebMessage {
  return {
    ...message,
    text: sanitizeChatCopy(message.text),
  };
}

function sanitizeChatCopy(text: string): string {
  const oldHindiContextLine = new RegExp(
    [
      'Main isi context aur active Kundli se answer karungi\\.',
      'Aap Ask d',
      'abaiye ya apna follow-up likhiye\\.',
    ].join(' '),
    'g',
  );
  return text
    .replace(/Dashboard Header context loaded hai\./g, 'I picked this up from your dashboard.')
    .replace(/Dashboard Header context loaded\./g, 'I picked this up from your dashboard.')
    .replace(/Focus: Help me from my active Kundli\./g, 'We are looking at: Help me from my selected Kundli.')
    .replace(oldHindiContextLine, 'मैं आपकी selected Kundli से यहीं जवाब दूंगी. आप Ask दबाइए या अपना follow-up लिखिए.')
    .replace(/I will answer from this context and your active Kundli\. Press Ask or type your follow-up\./g, 'I will use your selected Kundli here. Press Ask or type your follow-up.')
    .replace(/\bactive Kundli\b/g, 'selected Kundli')
    .replace(/\bactive chart\b/g, 'selected chart')
    .replace(/\bcontext loaded\b/gi, 'ready');
}

function saveWebChatMemory(memory: WebChatMemory): void {
  try {
    const messages = memory.messages.slice(-24);
    window.localStorage.setItem(
      WEB_CHAT_MEMORY_KEY,
      JSON.stringify({
        birthMemory: memory.birthMemory,
        chatLanguage: memory.chatLanguage,
        messages,
        predictaMemory: memory.predictaMemory,
      }),
    );
    saveWebAutoSaveMemory({
      chat: {
        lastMessageAt: new Date().toISOString(),
        messageCount: messages.length,
      },
    });
  } catch {
    // Local chat memory is a convenience; Predicta can still work without it.
  }
}
