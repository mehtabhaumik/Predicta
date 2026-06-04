'use client';

import {
  formatNativeCopy,
  getMonetizationReportRequirementCopy,
  getNativeCopy,
} from '@pridicta/config';
import Link from 'next/link';
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
  buildPredictaLearningSuggestion,
  composeChatChartBlock,
  detectChatChartIntent,
  shouldBypassLocalChartShortcuts,
  detectKundliChatCommand,
  detectKundliCommandDecision,
  findKundliBySpokenName,
  getChartReadingNote,
  findHouseCell,
  learnPredictaInteraction,
  NORTH_INDIAN_HOUSE_POLYGONS,
  preparePredictaLanguageContext,
  shouldUseStandardHouseMeaning,
  attachKundliEditHistory,
  type KundliKarmaIntelligence,
  type KundliChatCommand,
  type KundliEditField,
  type PredictaInteractionMemory,
} from '@pridicta/astrology';
import {
  getLanguageLabels,
  getLanguageOption,
} from '@pridicta/config/language';
import { translateUiText } from '@pridicta/config/uiTranslations';
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
  loadWebFreeAiBalance,
  loadWebProductBankBalance,
} from '../lib/pridicta-ai';
import {
  hydrateWebSpecialistContextSync,
  saveWebAutoSaveMemory,
  saveWebSpecialistPredictaContext,
} from '../lib/web-auto-save-memory';
import {
  canCreateAdditionalWebKundli,
  generateKundliFromWeb,
  deleteWebKundli,
  loadWebKundliStore,
  resolveWebKundliForContext,
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
import { recordWebZeroCreditDeterministicAction } from '../lib/zero-credit-telemetry';

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
  school: 'JAIMINI' | 'KP' | 'NADI' | 'NUMEROLOGY' | 'SIGNATURE' | 'PARASHARI';
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
  school: 'JAIMINI' | 'KP' | 'NADI' | 'NUMEROLOGY' | 'SIGNATURE' | 'PARASHARI';
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
  school?: 'JAIMINI' | 'KP' | 'NADI' | 'NUMEROLOGY' | 'SIGNATURE' | 'PARASHARI';
  selectedChart?: string;
  selectedHouse?: number;
  title: string;
  updatedAt: string;
};

type WebChatSessionStore = {
  activeSessionId?: string;
  sessions: WebChatSession[];
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
    predictaStylePreference,
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
  const [pendingKundliCommand, setPendingKundliCommand] =
    useState<PendingKundliCommand>();
  const [chatLanguage, setChatLanguage] =
    useState<SupportedLanguage>(predictaReplyLanguage);
  const [activeChartContext, setActiveChartContext] = useState<ChartContext>();
  const [messages, setMessages] = useState<WebMessage[]>(() =>
    buildInitialMessages(predictaReplyLanguage, room),
  );
  const [copiedMessageId, setCopiedMessageId] = useState<string>();
  const [chatAccount, setChatAccount] = useState<
    { email?: string | null; uid: string } | undefined
  >();
  const [chatAuthReady, setChatAuthReady] = useState(false);
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

  async function refreshFreeAiBalance(): Promise<void> {
    const [balance, productBank] = await Promise.all([
      loadWebFreeAiBalance(),
      loadWebProductBankBalance(),
    ]);
    if (!balance) {
      return;
    }

    const bankLine = productBank
      ? getMonetizationReportRequirementCopy(
          'productBankLineTemplate',
          language,
          {
            questions: productBank.paidQuestionCredits,
            reports: productBank.reportCredits,
          },
        )
      : '';

    setPassCostDisplay({
      body:
        balance.remaining > 0
          ? `${getMonetizationReportRequirementCopy(
              'starterRemainingTemplate',
              language,
              {
                remaining: balance.remaining,
                total: balance.total,
              },
            )}${bankLine}`
          : `${getMonetizationReportRequirementCopy(
              'starterUsedBody',
              language,
            )}${bankLine}`,
      kind: 'free',
      title: productBank
        ? getMonetizationReportRequirementCopy(
            'starterWithProductBankLabel',
            language,
          )
        : getMonetizationReportRequirementCopy('starterAiLabel', language),
      tone: balance.remaining > 0 ? 'steady' : 'careful',
    });
  }

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
        setChatAuthReady(true);
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

        const roomSeedContext = buildRoomSeedContext(
          room,
          loadWebKundliStore().activeKundli,
          loadWebKundliStore().activeChartContext,
        );
        const sessionState = ensureWebChatSessionStore(account.uid, {
          activeChartContext: roomSeedContext ?? activeChartContext,
          birthMemory: stored?.birthMemory,
          chatLanguage: stored?.chatLanguage ?? predictaReplyLanguage,
          kundliId: roomSeedContext?.kundliId ?? kundli?.id,
          messages: stored?.messages.length
            ? stored.messages.map(sanitizeStoredMessage)
            : buildInitialMessages(predictaReplyLanguage, room),
          predictaMemory: stored?.predictaMemory,
          replyLanguage: predictaReplyLanguage,
        });
        const nextSessionState =
          room && !resolvePreferredRoomSession(sessionState, room)
            ? createWebChatSession(account.uid, {
                activeChartContext: roomSeedContext ?? activeChartContext,
                chatLanguage: stored?.chatLanguage ?? predictaReplyLanguage,
                kundliId: roomSeedContext?.kundliId ?? kundli?.id,
                replyLanguage: predictaReplyLanguage,
              })
            : sessionState;
        const preferredSession = resolvePreferredRoomSession(nextSessionState, room);

        setChatSessions(filterRoomSessions(nextSessionState.sessions, room));
        setActiveChatSessionId(
          preferredSession?.id ?? nextSessionState.activeSessionId,
        );
        if (preferredSession) {
          setBirthMemory(preferredSession.birthMemory);
          setChatLanguage(preferredSession.chatLanguage);
          setPredictaMemory(preferredSession.predictaMemory);
          setActiveChartContext(current => {
            if (current) {
              return current;
            }

            return resolveSharedWebKundliContext(
              preferredSession.activeChartContext,
            ).chartContext;
          });
          if (!room) {
            setMessages(preferredSession.messages.map(sanitizeStoredMessage));
          }
        }
      });

    } catch {
      setChatAuthReady(true);
    }

    void refreshFreeAiBalance();

    didLoadMemory.current = true;

    return () => {
      window.removeEventListener('storage', refreshKundlis);
      window.removeEventListener(WEB_KUNDLI_UPDATED_EVENT, refreshKundlis);
      unsubscribeAuth?.();
    };
  }, []);

  useEffect(() => {
    void refreshFreeAiBalance();
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

    const synced = syncSpecialistContext(activeChartContext, kundli);
    const recoveredKundli = synced.kundli;
    const nextContext = synced.context ?? activeChartContext;
    if (recoveredKundli) {
      if (recoveredKundli.id !== kundli?.id) {
        setKundli(recoveredKundli);
      }
      setSavedKundlis(loadWebKundliStore().savedKundlis);
    }
    if (
      nextContext.kundliId !== activeChartContext.kundliId ||
      nextContext.specialistContexts?.length !==
        activeChartContext.specialistContexts?.length
    ) {
      setActiveChartContext(nextContext);
    }
    saveWebActiveChartContext(nextContext);
    saveWebSpecialistPredictaContext(nextContext, recoveredKundli);
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
        ? buildInitialMessages(chatLanguage, room, Boolean(kundli))
        : current,
    );
  }, [chatLanguage, kundli, room]);

  function recoverActiveKundli(
    context = activeChartContext,
  ): KundliData | undefined {
    const shared = resolveSharedWebKundliContext(
      normalizeContextForRoom(context),
      kundli,
    );
    const recovered = shared.kundli;
    const syncedContext = hydrateWebSpecialistContextSync(
      shared.chartContext,
      recovered,
    );

    if (recovered && recovered.id !== kundli?.id) {
      setKundli(recovered);
    }
    if (
      syncedContext &&
      syncedContext.kundliId &&
      syncedContext.kundliId !== context?.kundliId
    ) {
      persistActiveChatContext(syncedContext, recovered);
    }

    return recovered;
  }

  function normalizeContextForRoom(
    context: ChartContext | undefined,
  ): ChartContext | undefined {
    if (!context || !room?.school) {
      return context;
    }

    const handoffFrom =
      context.predictaSchool && context.predictaSchool !== room.school
        ? context.predictaSchool
        : context.handoffFrom;

    return {
      ...context,
      handoffFrom,
      predictaSchool: room.school,
      sourceScreen: context.sourceScreen ?? room.sourceScreen,
    };
  }

  function syncSpecialistContext(
    context: ChartContext | undefined,
    preferredKundli?: KundliData,
  ): {
    context?: ChartContext;
    kundli?: KundliData;
  } {
    const shared = resolveSharedWebKundliContext(
      normalizeContextForRoom(context),
      preferredKundli ?? kundli,
    );
    const syncedContext = hydrateWebSpecialistContextSync(
      shared.chartContext,
      shared.kundli,
    );

    return {
      context: syncedContext,
      kundli: shared.kundli,
    };
  }

  function persistActiveChatContext(
    context: ChartContext,
    preferredKundli?: KundliData,
  ): ChartContext {
    const synced = syncSpecialistContext(context, preferredKundli);
    const nextContext = synced.context ?? context;

    setActiveChartContext(nextContext);
    saveWebActiveChartContext(nextContext);
    saveWebSpecialistPredictaContext(nextContext, synced.kundli);

    return nextContext;
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
        const entryLanguage =
          ctaContext.selectedLanguage ??
          preparePredictaLanguageContext({
            memory: predictaMemory,
            selectedLanguage: chatLanguage,
            text: selectedSection,
          }).responseLanguage;
        const baseContext = {
          ...ctaContext,
          selectedSection,
        };
        const synced = syncSpecialistContext(baseContext, kundli);
        const nextContext = synced.context ?? baseContext;
        const contextKundli =
          synced.kundli ?? resolveWebKundliForContext(nextContext);

        if (contextKundli) {
          setKundli(contextKundli);
        }

        setChatLanguage(entryLanguage);
        persistPredictaReplyLanguage(entryLanguage);

        const contextReply = createPridictaReply(
          nextContext.predictaSchool
            ? buildSchoolContextIntro(nextContext, entryLanguage)
            : nextContext.chartType
              ? buildChartContextIntro(nextContext, entryLanguage)
              : buildCtaContextIntro(nextContext, entryLanguage),
          entryLanguage,
          {
            context: nextContext,
            kundli: contextKundli ?? kundli,
            lastText: selectedSection,
          },
        );

        setActiveChartContext(nextContext);
        saveWebActiveChartContext(nextContext);
        saveWebSpecialistPredictaContext(nextContext, contextKundli);
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
      if (languageContext.responseLanguage !== chatLanguage) {
        setChatLanguage(languageContext.responseLanguage);
        persistPredictaReplyLanguage(languageContext.responseLanguage);
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
        recordWebZeroCreditDeterministicAction('kundli_command');
        setMessages(current => [
          ...current,
          createPridictaReply(
            labelDeterministicChatReply(kundliCommandReply),
            languageContext.responseLanguage,
            {
              context: activeChartContext,
              kundli: recoverActiveKundli(),
              lastText: text,
            },
          ),
        ]);
        return;
      }

      const chartIntentKundli = recoverActiveKundli();
      const hasKundliKarmaContext = Boolean(
        activeChartContext?.selectedKundliKarmaItemId ||
          activeChartContext?.selectedKundliKarmaRuleId ||
          activeChartContext?.selectedKundliKarmaModule,
      );
      const wantsDeepChartAnswer =
        !hasKundliKarmaContext && shouldBypassLocalChartShortcuts(text);
      if (
        chartIntentKundli &&
        (detectChatChartIntent(text) || wantsDeepChartAnswer) &&
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

      const chartReply = wantsDeepChartAnswer
        ? undefined
        : resolveChatChartReply(
            text,
            languageContext.responseLanguage,
          );

      if (chartReply) {
        recordWebZeroCreditDeterministicAction('chart_snapshot');
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
    const baseQuestionChartContext = resolveChartContextForQuestion(text);
    const synced = syncSpecialistContext(
      baseQuestionChartContext,
      activeKundli,
    );
    const questionChartContext =
      synced.context ?? baseQuestionChartContext;

    const nextMemory = learnPredictaInteraction(
      predictaMemory,
      text,
      undefined,
      activeKundli,
      responseLanguage,
    );
    setPredictaMemory(nextMemory);
    if (questionChartContext && questionChartContext !== activeChartContext) {
      persistActiveChatContext(questionChartContext, activeKundli);
    }
    const response = await askPridictaFromWeb({
      history: messages.slice(-MAX_AI_HISTORY_MESSAGES).map(message => ({
        role: message.role,
        text: message.text,
      })),
      chartContext: questionChartContext,
      kundli: activeKundli,
      language: responseLanguage,
      message: text,
      predictaStylePreference,
      userPlan: 'FREE',
    });
    void refreshFreeAiBalance();
    if (response.freeAiUpsell?.blocked) {
      passCostSuggestionsRef.current = buildFreeAiUpsellSuggestions(
        response.freeAiUpsell.purchaseOptions,
      );
    }
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
      recordWebZeroCreditDeterministicAction('friendly_greeting');
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
    const hasKundliKarmaContext = Boolean(
      activeChartContext?.selectedKundliKarmaItemId ||
        activeChartContext?.selectedKundliKarmaRuleId ||
        activeChartContext?.selectedKundliKarmaModule,
    );
    const wantsDeepChartAnswer =
      !hasKundliKarmaContext && shouldBypassLocalChartShortcuts(text);

    if (activeKundli && isBirthTimeConfirmationRequest(text)) {
      return confirmEnteredBirthTimeFromChat(
        activeKundli,
        responseLanguage,
        languageContext.acknowledgement,
      );
    }

    if (looksLikeBirthDetails(text)) {
      recordWebZeroCreditDeterministicAction('birth_intake');
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

    if (activeKundli && wantsDeepChartAnswer) {
      return askWithProof(
        text,
        activeKundli,
        responseLanguage,
        languageContext.acknowledgement,
      );
    }

    const actionReply = buildPredictaActionReply({
      chartContext: activeChartContext,
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
      recordWebZeroCreditDeterministicAction(
        actionReply.providerDecision ?? actionReply.action ?? 'app_action',
      );
      return labelDeterministicChatReply(actionReply.text);
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
        labelDeterministicChatReply(createKundliFirstReply(responseLanguage, text)),
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
      syncSpecialistContext(baseContext, activeKundli).context ??
      baseContext;
    const nextMemory = learnPredictaInteraction(
      predictaMemory,
      text,
      'chart',
      activeKundli,
      responseLanguage,
    );
    setPredictaMemory(nextMemory);
    persistActiveChatContext(context, activeKundli);

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
        text: labelDeterministicChatReply(
          buildChatChartReplyText({ block, language: responseLanguage }),
        ),
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
        const gate = canCreateAdditionalWebKundli();
        setPendingKundliCommand(undefined);
        return buildKundliLimitReply(responseLanguage, gate.reason);
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
        return buildKundliLimitReply(responseLanguage, saveResult.reason);
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
    const creationGate = canCreateAdditionalWebKundli();
    if (!creationGate.allowed) {
      return [
        acknowledgement,
        buildKundliLimitReply(responseLanguage, creationGate.reason),
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
    recordWebZeroCreditDeterministicAction('kundli_created_from_chat');
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
      labelDeterministicChatReply(buildKundliCreatedReply(responseLanguage, nextKundli)),
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
    const roomSeedContext = buildRoomSeedContext(room, kundli, activeChartContext);
    const nextWelcome = buildInitialMessages(chatLanguage, room, Boolean(kundli));

    if (chatAccount?.uid) {
      const sessionState = createWebChatSession(chatAccount.uid, {
        activeChartContext: roomSeedContext ?? activeChartContext,
        chatLanguage,
        kundliId: roomSeedContext?.kundliId ?? kundli?.id,
        replyLanguage: chatLanguage,
      });
      const activeSession = getActiveWebChatSession(sessionState);

      setActiveChatSessionId(sessionState.activeSessionId);
      setChatSessions(filterRoomSessions(sessionState.sessions, room));
      setBirthMemory(undefined);
      setPredictaMemory(undefined);
      setMessages(
        room
          ? nextWelcome
          : activeSession?.messages ?? buildInitialMessages(chatLanguage),
      );
      setInput('');
      return;
    }

    setBirthMemory(undefined);
    setPredictaMemory(undefined);
    setMessages(nextWelcome);
    setInput('');
  }

  function switchChatSession(sessionId: string) {
    if (!chatAccount?.uid) {
      return;
    }

    const sessionState = activateWebChatSession(chatAccount.uid, sessionId);
    const activeSession = getActiveWebChatSession(sessionState);

    if (!activeSession || !isSessionCompatibleWithRoom(activeSession, room)) {
      return;
    }

    setActiveChatSessionId(sessionId);
    setChatSessions(filterRoomSessions(sessionState.sessions, room));
    setBirthMemory(activeSession.birthMemory);
    setChatLanguage(activeSession.chatLanguage);
    persistPredictaReplyLanguage(activeSession.replyLanguage);
    setPredictaMemory(activeSession.predictaMemory);
    setActiveChartContext(
      syncSpecialistContext(activeSession.activeChartContext, kundli).context,
    );
    setMessages(activeSession.messages.map(sanitizeStoredMessage));
    setInput('');
  }

  const chatExportCopy = getChatExportCopy(chatLanguage);
  const t = (value: string) => translateUiText(value, language);
  const roomTitle = t(room?.title ?? 'Predicta chat');
  const roomSource = t(room?.sourceScreen ?? 'Predicta');
  const roomBody =
    t(
      room?.body ??
        'Ask with your Kundli context, chart proof, and calm follow-up guidance.',
    );

  if (!chatAuthReady) {
    return (
      <section className="glass-panel auth-required-panel" aria-live="polite">
        <div className="section-title">ACCOUNT CHECK</div>
        <h2>Checking your Predicta account...</h2>
        <p>Predicta is confirming sign-in before opening private chat.</p>
      </section>
    );
  }

  if (!chatAccount?.uid) {
    return (
      <section className="glass-panel auth-required-panel">
        <div className="section-title">ACCOUNT REQUIRED</div>
        <h2>Sign in before chatting with Predicta.</h2>
        <p>
          AI chat, saved Kundlis, reports, and Family Vault now stay attached to
          your private account.
        </p>
        <AuthDialog />
      </section>
    );
  }

  return (
    <div
      className="chat-workspace"
      data-chat-school={(room?.school ?? 'PARASHARI').toLowerCase()}
    >
      <div className="card chat-panel">
        <div className="chat-shell-header">
          <div className="chat-shell-title-block">
            <span className="chat-room-chip">{roomSource}</span>
            <strong>{roomTitle}</strong>
            <p>{roomBody}</p>
          </div>
          <details className="chat-utility-menu">
            <summary aria-label={chatExportCopy.tools}>
              <span>{chatExportCopy.tools}</span>
            </summary>
            <div
              className="chat-utility-menu-panel"
              aria-label={chatExportCopy.conversationActions}
            >
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
          language={language}
          onNewSession={startNewChat}
          room={room}
          onSwitchSession={switchChatSession}
          sessions={filterRoomSessions(chatSessions, room)}
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
        {!kundli && room ? (
          <WebChatRoomRecoveryCard language={language} room={room} />
        ) : null}
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
                  language={chatLanguage}
                  onUsePrompt={prompt => {
                    if (block.type === 'chart') {
                      const baseContext = chartContextFromChatBlock(block, 'Chat');
                      const context =
                        syncSpecialistContext(baseContext, kundli).context ??
                        baseContext;
                      persistActiveChatContext(context, kundli);
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
                        syncSpecialistContext(suggestion.context, kundli).context ??
                        suggestion.context;
                      persistActiveChatContext(sharedContext, kundli);
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

function buildRoomSeedContext(
  room: WebPredictaChatRoom | undefined,
  kundli?: KundliData,
  context?: ChartContext,
): ChartContext | undefined {
  if (!room) {
    return context;
  }

  return {
    ...context,
    handoffBirthSummary:
      context?.handoffBirthSummary ??
      (kundli ? buildKundliBirthSummaryForChat(kundli) : undefined),
    handoffFrom:
      context?.predictaSchool && context.predictaSchool !== room.school
        ? context.predictaSchool
        : context?.handoffFrom,
    handoffQuestion: context?.handoffQuestion ?? room.prompt,
    kundliId: context?.kundliId ?? kundli?.id,
    predictaSchool: room.school,
    selectedSection: context?.selectedSection ?? room.prompt,
    sourceScreen: room.sourceScreen,
  };
}

function isSessionCompatibleWithRoom(
  session: WebChatSession,
  room?: WebPredictaChatRoom,
): boolean {
  if (!room) {
    return true;
  }

  const sessionSchool =
    session.school ?? parsePredictaSchool(session.activeChartContext?.predictaSchool ?? null);

  return room.school === 'PARASHARI'
    ? sessionSchool === undefined || sessionSchool === 'PARASHARI'
    : sessionSchool === room.school;
}

function filterRoomSessions(
  sessions: WebChatSession[],
  room?: WebPredictaChatRoom,
): WebChatSession[] {
  return room ? sessions.filter(session => isSessionCompatibleWithRoom(session, room)) : sessions;
}

function resolvePreferredRoomSession(
  store: WebChatSessionStore,
  room?: WebPredictaChatRoom,
): WebChatSession | undefined {
  const activeSession = getActiveWebChatSession(store);

  if (!room) {
    return activeSession;
  }

  if (activeSession && isSessionCompatibleWithRoom(activeSession, room)) {
    return activeSession;
  }

  return store.sessions.find(session => isSessionCompatibleWithRoom(session, room));
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
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a9ee5e8abd");
  }
  if (language === 'gu') {
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.741ab6c9e1");
  }
  return 'Yes. I can create a new Kundli right here in chat. Send name, DOB, birth time, and birth place. If you only know the DOB, send that first.';
}

function buildNoKundliForCommandReply(language: SupportedLanguage): string {
  if (language === 'hi') {
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.029e3bfa57");
  }
  if (language === 'gu') {
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.cf6e5775f3");
  }
  return 'I do not see a saved Kundli yet. Send birth details first; then I can edit, delete, or switch Kundlis for you.';
}

function buildKundliLimitReply(
  language: SupportedLanguage,
  reason?: ReturnType<typeof canCreateAdditionalWebKundli>['reason'],
): string {
  if (reason === 'FREE_KUNDLI_LIMIT_REACHED') {
    if (language === 'hi') {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.03b5e54f17");
    }
    if (language === 'gu') {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.bf5953710d");
    }
    return 'You have saved 4 Kundlis on the free plan. I kept your birth details in this chat. Upgrade to save another Kundli, or open an existing saved Kundli.';
  }

  if (reason === 'PREMIUM_KUNDLI_DAILY_SOFT_LIMIT_REACHED') {
    return 'You have created many Kundlis today. Existing Kundlis still open normally; please pause and try another new Kundli later.';
  }

  if (language === 'hi') {
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.03b5e54f17");
  }
  if (language === 'gu') {
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.bf5953710d");
  }
  return 'Your first Kundli is safe. Please sign in before saving another Kundli, so family profiles and saved charts stay protected for later.';
}

function buildKundliSetActiveReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.ec58a9861a", [kundli.birthDetails.name]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.e68cd7848a", [kundli.birthDetails.name]);
  }
  return `${kundli.birthDetails.name}'s Kundli is now active. I will answer from this chart.`;
}

function buildKundliDeleteConfirmReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7af29eabee", [kundli.birthDetails.name]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.151cbc3ffa", [kundli.birthDetails.name]);
  }
  return `You are about to delete ${kundli.birthDetails.name}'s Kundli from your library. Reply "delete Kundli" to confirm, or "cancel" to stop.`;
}

function buildKundliGenericEditReply(
  language: SupportedLanguage,
  kundli: KundliData,
): string {
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.8b799ecbe6", [kundli.birthDetails.name]);
  }
  if (language === 'gu') {
    return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.dac0fdb5e6", [kundli.birthDetails.name]);
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
        ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.c1c05856b2")
        : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.f26d1825e4");
  }

  return language === 'en'
    ? 'I need the exact value before editing the Kundli. Please send it once more clearly.'
    : language === 'hi'
      ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.e84f244bdf")
      : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.dbbfb263de");
}

function buildKundliEditConfirmReply(
  language: SupportedLanguage,
  kundli: KundliData,
  command: Extract<KundliChatCommand, { kind: 'edit-field' }>,
  nextBirthDetails: BirthDetails,
): string {
  const changeLine = formatKundliChange(command.field, nextBirthDetails);
  if (language === 'hi') {
    return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.9d29c9a076", [kundli.birthDetails.name, changeLine]);
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
      ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a2218ff58f")
      : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.1cdf2f9772");
}

function buildKundliEditConfirmReminder(language: SupportedLanguage): string {
  return language === 'en'
    ? 'Please reply "update existing", "save as new", or "cancel".'
    : language === 'hi'
      ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.9054956606")
      : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.70bf2b9c9c");
}

function buildKundliCommandCancelledReply(language: SupportedLanguage): string {
  return language === 'en'
    ? 'Done. I did not change the Kundli.'
    : language === 'hi'
      ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.cedbdafd34")
      : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.0816b566f7");
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
      ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.84cda36140", [nextActive.birthDetails.name])
      : '';
    return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.603784e73c", [deletedName, nextLine]);
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

  if (context?.predictaSchool === 'JAIMINI') {
    return 'JAIMINI';
  }

  if (context?.predictaSchool === 'NADI') {
    return 'JAIMINI';
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
  conversationActions: string;
  copyConversation: string;
  copyMessage: string;
  newChat: string;
  newSavedChat: string;
  savePdf: string;
  tools: string;
} {
  if (language === 'hi') {
    return {
      copied: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.d6758a813a"),
      conversationActions: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.9f47b903ab"),
      copyConversation: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.d38f7c0170"),
      copyMessage: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.4b4214b9f4"),
      newChat: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.ab78000705"),
      newSavedChat: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a93d8505ea"),
      savePdf: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.76162615d9"),
      tools: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.47ac995da2"),
    };
  }

  if (language === 'gu') {
    return {
      copied: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.2e020f4ba5"),
      conversationActions: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.14e99900d3"),
      copyConversation: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.67cc3d4e3c"),
      copyMessage: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.fe09de18e7"),
      newChat: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.c01be190c1"),
      newSavedChat: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.53837aa568"),
      savePdf: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.1963597f21"),
      tools: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.96924835e5"),
    };
  }

  return {
    copied: 'Copied',
    conversationActions: 'Conversation actions',
    copyConversation: 'Copy full chat',
    copyMessage: 'Copy',
    newChat: 'New chat',
    newSavedChat: 'New saved chat',
    savePdf: 'Save chat PDF',
    tools: 'Tools',
  };
}

function getChatSessionCopy(
  language: SupportedLanguage,
  room?: WebPredictaChatRoom,
): {
  guestBody: string;
  guestTitle: string;
  newChat: string;
  newSavedChat: string;
  savedBody: string;
  savedTitle: string;
} {
  const roomLabel = room ? getPredictaSchoolLabel(room.school) : 'Predicta';

  if (language === 'hi') {
    return {
      guestBody:
        room
          ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.0160cbd35d", [roomLabel])
          : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a65875a7e5"),
      guestTitle: room ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a7b3c35f3f", [roomLabel]) : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.e73be1f0bd"),
      newChat: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.ab78000705"),
      newSavedChat: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a93d8505ea"),
      savedBody: room
        ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.724e81b107", [roomLabel])
        : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.8c79466cc2"),
      savedTitle: room ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.85dc83245c", [roomLabel]) : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7265266ae8"),
    };
  }

  if (language === 'gu') {
    return {
      guestBody:
        room
          ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.776cd72c96", [roomLabel])
          : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.54aba28e1b"),
      guestTitle: room ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.ff9af9d419", [roomLabel]) : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.72846bc15b"),
      newChat: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.c01be190c1"),
      newSavedChat: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.53837aa568"),
      savedBody: room
        ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.03f443901d", [roomLabel])
        : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a7efa14459"),
      savedTitle: room ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.48e7af1a1c", [roomLabel]) : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.e770e1ae22"),
    };
  }

  return {
    guestBody: room
      ? `Start ${roomLabel} from one selected Kundli. Sign in to keep separate saved chats and family readings.`
      : 'Sign in to keep saved chats and separate family readings.',
    guestTitle: room ? `${roomLabel} guest chat` : 'Guest chat',
    newChat: 'New chat',
    newSavedChat: 'New saved chat',
    savedBody: room
      ? `Return to earlier ${roomLabel} conversations without mixing the room context.`
      : 'Return to earlier conversations without losing context.',
    savedTitle: room ? `${roomLabel} saved chats` : 'Saved chats',
  };
}

function WebChatRoomRecoveryCard({
  language,
  room,
}: {
  language: SupportedLanguage;
  room: WebPredictaChatRoom;
}): React.JSX.Element {
  const copy = getRoomRecoveryCopy(language, room);

  return (
    <section className="chat-room-recovery glass-panel">
      <div className="chat-room-recovery-copy">
        <span className="section-title">{copy.eyebrow}</span>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
        <small>{copy.footnote}</small>
      </div>
      <div className="chat-room-recovery-actions" aria-label={copy.actionsLabel}>
        <Link className="button secondary" href="/dashboard/saved-kundlis">
          {copy.openLibrary}
        </Link>
        <Link className="button" href="/dashboard/kundli">
          {copy.createKundli}
        </Link>
      </div>
    </section>
  );
}

function WebChatSessionSwitcher({
  activeSessionId,
  isSignedIn,
  language,
  onNewSession,
  onSwitchSession,
  room,
  sessions,
}: {
  activeSessionId?: string;
  isSignedIn: boolean;
  language: SupportedLanguage;
  onNewSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  room?: WebPredictaChatRoom;
  sessions: WebChatSession[];
}): React.JSX.Element {
  const copy = getChatSessionCopy(language, room);

  if (!isSignedIn) {
    return (
      <div className="chat-session-strip guest">
        <div>
          <strong>{copy.guestTitle}</strong>
          <span>{copy.guestBody}</span>
        </div>
        <div className="chat-session-actions">
          <AuthDialog />
          <button className="chat-export-button" onClick={onNewSession} type="button">
            {copy.newChat}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-session-strip">
      <div>
        <strong>{copy.savedTitle}</strong>
        <span>{copy.savedBody}</span>
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
          {copy.newSavedChat}
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
  language,
  onUsePrompt,
}: {
  birthDetails?: BirthDetails;
  block: ChatMessageBlock;
  language: SupportedLanguage;
  onUsePrompt: (prompt: string) => void;
}): React.JSX.Element {
  if (block.type === 'chart') {
    return (
      <WebChatChartBlock
        birthDetails={birthDetails}
        block={block}
        language={language}
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
  language,
  onUsePrompt,
}: {
  birthDetails?: BirthDetails;
  block: ChatChartBlock;
  language: SupportedLanguage;
  onUsePrompt: (prompt: string) => void;
}): React.JSX.Element {
  const renderModel = buildChartRenderModel({
    birthDetails,
    chart: block.chart,
    presentation: 'chat',
  });
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
          data-chart-presentation={renderModel.presentation}
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
                onUsePrompt(
                  `Tell me what House ${cell.house} in my ${block.chartType} chart is saying, why it matters, what timing activates it, and what practical next step it suggests. Keep D1 as the anchor and use chart proof instead of jargon.`,
                );
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
          {cells.map((cell, index) => {
            const visiblePlanets = cell.renderPlanets.slice(0, cell.maxVisiblePlanets);
            return (
            <div
              className={`north-house-label north-house-label-${cell.house} ${
                selectedHouse === cell.house ? 'selected' : ''
              } ${cell.renderPlanets.length > 2 ? 'north-house-label-stacked' : ''}`}
              data-density={cell.labelDensity}
              data-kundli-animation-part="signs"
              key={`label-${cell.key}`}
              style={{
                ...getKundliAnimationStyle(index, 'signs', 'chat'),
                ['--house-x' as string]: `${cell.x}%`,
                ['--house-y' as string]: `${cell.y}%`,
              } as CSSProperties}
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
                  {visiblePlanets.map((planet, planetIndex) => (
                    <PlanetGlyph
                      animationIndex={planetIndex}
                      animationSurface="chat"
                      key={planet.key}
                      moonPhase={renderModel.moonPhase}
                      planet={planet}
                      showDegree={cell.showPlanetDegrees}
                      showSign={cell.showPlanetSign}
                      showStatusMarks={cell.showPlanetStatusMarks}
                      size={cell.planetGlyphSize}
                    />
                  ))}
                  {cell.hiddenPlanetCount ? (
                    <span className="chart-overflow-counter">+{cell.hiddenPlanetCount}</span>
                  ) : null}
                </span>
              ) : null}
            </div>
            );
          })}
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

          <div className="chat-chart-hierarchy-grid">
            {[
              ['Prediction', block.reportHierarchy.meaning],
              ['Key insight', block.reportHierarchy.keyInsight],
              ['Free understanding', block.reportHierarchy.freeUnderstanding],
              ['Premium depth', block.reportHierarchy.premiumDepth],
              ['Evidence appendix', block.reportHierarchy.technicalAppendix],
            ].map(([label, value]) => (
              <article className="chat-chart-hierarchy-block" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>

          <div className="chat-chart-story-grid">
            <article className="chat-chart-story-block">
              <span>{translateUiText('What this points to now', language)}</span>
              <strong>{block.insight.governs}</strong>
            </article>
            <article className="chat-chart-story-block">
              <span>{translateUiText('Main strength', language)}</span>
              <strong>{block.insight.mainStrength}</strong>
            </article>
            <article className="chat-chart-story-block">
              <span>{translateUiText('Main challenge', language)}</span>
              <strong>{block.insight.mainChallenge}</strong>
            </article>
            <article className="chat-chart-story-block">
              <span>{translateUiText('Current guidance', language)}</span>
              <strong>{block.insight.currentGuidance}</strong>
            </article>
          </div>

          <p>{block.insight.whatItSays}</p>
          <ul className="chat-chart-insights">
            {block.insight.freeInsights.slice(0, 4).map(bullet => (
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

function buildInitialMessages(
  language: SupportedLanguage,
  room?: WebPredictaChatRoom,
  hasSelectedKundli = false,
): WebMessage[] {
  return [
    {
      id: 'welcome',
      role: 'pridicta',
      text: room
        ? buildRoomWelcomeReply(language, room, hasSelectedKundli)
        : getBirthIntakeWelcome(language),
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

function buildFreeAiUpsellSuggestions(
  purchaseOptions: Array<'10 questions' | '25 questions' | '100 questions' | 'Premium'>,
): ChatSuggestedCta[] {
  const checkoutHref: Record<string, string> = {
    '10 questions': '/pricing?focus=ai-questions-10',
    '25 questions': '/pricing?focus=ai-questions-25',
    '100 questions': '/pricing?focus=ai-questions-100',
    Premium: '/pricing?focus=premium',
  };

  return [
    ...purchaseOptions.map(option => ({
      href: checkoutHref[option] ?? '/pricing',
      id: `free-ai-upsell-${option.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      label: option,
      prompt: `Continue my preserved Predicta question after I unlock ${option}.`,
      targetScreen: 'Pricing',
    })),
    {
      href: '/dashboard/kundli',
      id: 'free-ai-zero-credit-kundli',
      label: 'Create Kundli',
      prompt: 'Create Kundli without AI credit.',
      targetScreen: 'Kundli',
    },
    {
      href: '/dashboard/charts',
      id: 'free-ai-zero-credit-charts',
      label: 'Open charts',
      prompt: 'Open charts without AI credit.',
      targetScreen: 'Charts',
    },
    {
      href: '/dashboard/report',
      id: 'free-ai-zero-credit-report',
      label: 'Free report',
      prompt: 'Generate free report without AI credit.',
      targetScreen: 'Reports',
    },
  ];
}

function labelDeterministicChatReply(text: string): string {
  return text.startsWith('Calculation-engine reply:')
    ? text
    : `Calculation-engine reply:\n\n${text}`;
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
      formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.c4ae433afe", [name, enteredTime]),
      restoredFromRectified
        ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7bfce54406", [enteredTime])
        : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.cf527a59c0"),
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.155e3da570"),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.2923797bfd", [name, enteredTime]),
      restoredFromRectified
        ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.81de3e3bdf", [enteredTime])
        : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.03bbfe6cdd"),
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.1e231b6275"),
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
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.29211c271c");
  }

  if (language === 'gu') {
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.797905672f");
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
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.cac2fe6595"),
      formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.1a0f27032f", [kundli.birthDetails.name, timeText]),
      `Reason: ${reason}.`,
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.e5558dc633"),
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.f2b497986c"),
    ].join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.5aaeb161ac"),
      formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.405642e0f3", [kundli.birthDetails.name, timeText]),
      `Reason: ${reason}.`,
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.35d79bb2c8"),
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.1265e2e7de"),
    ].join('\n\n');
  }

  return [
    'Birth time check first.',
    `I have ${kundli.birthDetails.name}'s Kundli, but the birth time ${timeText} needs confirmation before deep prediction. Even 10-15 minutes can change houses, divisional charts, and timing.`,
    `Reason: ${reason}.`,
    'I can still give broad guidance, but I will not do exact timing, marriage/career/finance prediction, D9/D10/KP/Jaimini depth, or report-grade analysis until the time is confirmed.',
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
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.02240d2df7"),
      knownDetails ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.82da83a710", [knownDetails]) : undefined,
      `Missing: ${missing.join(', ')}.`,
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.57be3900cb"),
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7393a99250"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.6bb83ed98f"),
      knownDetails ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.117972b0d2", [knownDetails]) : undefined,
      `Missing: ${missing.join(', ')}.`,
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.eb4a3e3999"),
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.436ebbe0d4"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    'I will not start deep prediction from half details.',
    knownDetails ? `So far I have:\n${knownDetails}` : undefined,
    `Missing: ${missing.join(', ')}.`,
    'DOB can support broad guidance, but a real Kundli, houses, dasha, timing, KP/Jaimini, and reports need birth time and birth place.',
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
        label: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.22499a41ff"),
        prompt:
          getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.58edc91733"),
      },
      {
        id: 'birth-confidence-rectify',
        label: 'Time re-check karo',
        prompt:
          getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7e96dc5da7"),
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
        label: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7a1292c011"),
        prompt:
          getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.8b2a88f05c"),
      },
      {
        id: 'birth-confidence-rectify',
        label: 'Time re-check karo',
        prompt:
          getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.ec48b89375"),
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
  const reportContext = reportContextFromParams(params);

  if (school) {
    return {
      chartName: params.get('chartName') ?? chartType ?? undefined,
      chartType: chartType ?? undefined,
      handoffFrom: fromSchool ?? (school !== 'PARASHARI' ? 'PARASHARI' : undefined),
      handoffQuestion: handoffQuestion ?? params.get('prompt') ?? undefined,
      kundliId,
      predictaSchool: school,
      purpose: params.get('purpose') ?? undefined,
      reportMode: parseReportMode(params.get('reportMode')),
      selectedHouse: selectedHouse ? Number(selectedHouse) : undefined,
      selectedKundliKarmaEvidenceSummary:
        params.get('selectedKundliKarmaEvidenceSummary') ?? undefined,
      selectedKundliKarmaItemId: params.get('selectedKundliKarmaItemId') ?? undefined,
      selectedKundliKarmaModule:
        (params.get('selectedKundliKarmaModule') as ChartContext['selectedKundliKarmaModule']) ??
        undefined,
      selectedKundliKarmaRuleId: params.get('selectedKundliKarmaRuleId') ?? undefined,
      selectedLanguage:
        (params.get('selectedLanguage') as ChartContext['selectedLanguage']) ?? undefined,
      selectedPlanet: params.get('selectedPlanet') ?? undefined,
      selectedSection:
        params.get('prompt') ??
        params.get('selectedSection') ??
        (handoffQuestion
          ? `${school} Predicta handoff question: ${handoffQuestion}`
          : undefined),
      ...reportContext,
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
    reportMode: parseReportMode(params.get('reportMode')),
    selectedHouse: selectedHouse ? Number(selectedHouse) : undefined,
    selectedKundliKarmaEvidenceSummary:
      params.get('selectedKundliKarmaEvidenceSummary') ?? undefined,
    selectedKundliKarmaItemId: params.get('selectedKundliKarmaItemId') ?? undefined,
    selectedKundliKarmaModule:
      (params.get('selectedKundliKarmaModule') as ChartContext['selectedKundliKarmaModule']) ??
      undefined,
    selectedKundliKarmaRuleId: params.get('selectedKundliKarmaRuleId') ?? undefined,
    selectedLanguage:
      (params.get('selectedLanguage') as ChartContext['selectedLanguage']) ?? undefined,
    selectedPlanet: params.get('selectedPlanet') ?? undefined,
    selectedSection: params.get('prompt') ?? undefined,
    ...reportContext,
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
    reportMode: parseReportMode(params.get('reportMode')),
    selectedKundliKarmaEvidenceSummary:
      params.get('selectedKundliKarmaEvidenceSummary') ?? undefined,
    selectedKundliKarmaItemId: params.get('selectedKundliKarmaItemId') ?? undefined,
    selectedKundliKarmaModule:
      (params.get('selectedKundliKarmaModule') as ChartContext['selectedKundliKarmaModule']) ??
      undefined,
    selectedKundliKarmaRuleId: params.get('selectedKundliKarmaRuleId') ?? undefined,
    selectedLanguage:
      (params.get('selectedLanguage') as ChartContext['selectedLanguage']) ?? undefined,
    selectedPredictaWrapped: params.get('selectedPredictaWrapped') === 'true',
    selectedPredictaWrappedYear: parseOptionalNumber(
      params.get('selectedPredictaWrappedYear'),
    ),
    selectedRelationshipMirror: params.get('selectedRelationshipMirror') === 'true',
    selectedRelationshipNames: params.get('selectedRelationshipNames') ?? undefined,
    selectedRemedyId: params.get('remedyId') ?? undefined,
    selectedRemedyTitle: params.get('remedyTitle') ?? undefined,
    selectedSection: prompt,
    selectedTimelineEventId: params.get('selectedTimelineEventId') ?? undefined,
    selectedTimelineEventKind:
      (params.get('selectedTimelineEventKind') as ChartContext['selectedTimelineEventKind']) ??
      undefined,
    selectedTimelineEventTitle: params.get('selectedTimelineEventTitle') ?? undefined,
    selectedTimelineEventWindow: params.get('selectedTimelineEventWindow') ?? undefined,
    ...reportContextFromParams(params),
    sourceScreen: sourceScreen ?? 'Predicta',
  };
}

function reportContextFromParams(
  params: URLSearchParams,
): Partial<ChartContext> {
  const reportFocus = params.get('reportFocus') ?? undefined;

  if (!reportFocus) {
    return {};
  }

  return {
    reportAvailableSections: parseListParam(params.get('reportAvailableSections')),
    reportFocus,
    reportGeneratedAt: params.get('reportGeneratedAt') ?? undefined,
    reportMode:
      params.get('reportMode') === 'PREMIUM' ? 'PREMIUM' : 'FREE',
    reportSchoolLane: parseReportSchoolLane(params.get('reportSchoolLane')),
    reportSectionId: params.get('reportSectionId') ?? undefined,
    reportSectionPrompt: params.get('reportSectionPrompt') ?? undefined,
    reportSectionTitle: params.get('reportSectionTitle') ?? undefined,
    reportSelectedSections: parseListParam(params.get('reportSelectedSections')),
    reportSubjectName: params.get('reportSubjectName') ?? undefined,
    reportType: params.get('reportType') ?? undefined,
  };
}

function parseReportSchoolLane(
  value: string | null,
): ChartContext['reportSchoolLane'] {
  if (
    value === 'VEDIC' ||
    value === 'KP' ||
    value === 'JAIMINI' ||
    value === 'NADI' ||
    value === 'NUMEROLOGY' ||
    value === 'SIGNATURE' ||
    value === 'SYNTHESIS'
  ) {
    return value;
  }

  return undefined;
}

function parseReportMode(value: string | null): ChartContext['reportMode'] {
  if (value === 'FREE' || value === 'PREMIUM') {
    return value;
  }

  return undefined;
}

function parseListParam(value: string | null): string[] | undefined {
  const items = value
    ?.split('||')
    .map(item => item.trim())
    .filter(Boolean);

  return items?.length ? items : undefined;
}

function parsePredictaSchool(value: string | null): PredictaSchool | undefined {
  if (
    value === 'PARASHARI' ||
    value === 'KP' ||
    value === 'JAIMINI' ||
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
    context.reportSectionPrompt ??
    context.selectedDecisionQuestion ??
    context.selectedRemedyTitle ??
    context.selectedTimelineEventTitle ??
    context.reportSectionTitle ??
    context.reportType ??
    context.selectedSection ??
    context.handoffQuestion;
  const reportLine = formatReportContextLine(context);

  if (language === 'hi') {
    return [
      formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.8032a9a72c", [source]),
      reportLine ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.c5aaf9219b", [reportLine]) : undefined,
      focus ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.36be1ac62b", [focus]) : undefined,
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.38cf8c714b"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.34e51ee93f", [source]),
      reportLine ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.41fb305196", [reportLine]) : undefined,
      focus ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.1fc67b025d", [focus]) : undefined,
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.2bed0de907"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `I brought this over from ${source}.`,
    reportLine ? `Report context: ${reportLine}` : undefined,
    focus ? `Focus: ${focus}` : undefined,
    'I will answer from your selected Kundli here.',
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

function formatReportContextLine(context: ChartContext): string | undefined {
  if (!context.reportFocus) {
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
  const reportLine = formatReportContextLine(context);

  if (language === 'hi') {
    return [
      formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7eaafbc010", [school]),
      fromSchool
        ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.73cbb528ba", [fromSchool])
        : undefined,
      chartFocus ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.9dd2573f6e", [chartFocus]) : undefined,
      reportLine ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.9972f8632b", [reportLine]) : undefined,
      question ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.fa565f3c2b", [question]) : undefined,
      context.predictaSchool === 'KP'
        ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7de5e77289")
      : context.predictaSchool === 'JAIMINI' || context.predictaSchool === 'NADI'
          ? getNativeCopy('chat.jaimini.contextLine.hi')
      : context.predictaSchool === 'NUMEROLOGY'
          ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.b93160df27")
      : context.predictaSchool === 'SIGNATURE'
          ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.fb37f54845")
          : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.500da5904c"),
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.ddee9ee7be"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.e9cdf280b7", [school]),
      fromSchool
        ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.b03477faf7", [fromSchool])
        : undefined,
      chartFocus ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.9acd846583", [chartFocus]) : undefined,
      reportLine ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.2d33397be8", [reportLine]) : undefined,
      question ? formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.2a64d28f73", [question]) : undefined,
      context.predictaSchool === 'KP'
        ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.626c67ff92")
      : context.predictaSchool === 'JAIMINI' || context.predictaSchool === 'NADI'
          ? getNativeCopy('chat.jaimini.contextLine.gu')
      : context.predictaSchool === 'NUMEROLOGY'
          ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.bd7eb2446b")
      : context.predictaSchool === 'SIGNATURE'
          ? getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.13dcc7333b")
          : getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.6611907f49"),
      getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.186fb7a2a7"),
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  return [
    `${school} is ready.`,
    fromSchool
      ? `Context was carried from ${fromSchool}. The method will not be mixed. I already have your chart context and question, so I will answer inside this room's method.`
      : undefined,
    chartFocus ? `Chart in focus: ${chartFocus}.` : undefined,
    reportLine ? `Report context: ${reportLine}.` : undefined,
    question ? `You asked: ${question}` : undefined,
    context.predictaSchool === 'KP'
      ? 'I will read this through KP cusps, star lords, sub lords, significators, and ruling planets.'
    : context.predictaSchool === 'JAIMINI' || context.predictaSchool === 'NADI'
        ? 'I will keep this inside Jaimini: soul role, visible identity, career dharma, relationship mirror, and destiny chapters when calculated evidence is available.'
    : context.predictaSchool === 'NUMEROLOGY'
        ? 'I will answer through name number, birth number, destiny number, personal timing, and name rhythm.'
    : context.predictaSchool === 'SIGNATURE'
        ? 'I will stay grounded in confirmed signature traits, self-expression patterns, improvement suggestions, and safe reflection. It is not identity verification, handwriting forensics, legal proof, or diagnosis.'
        : 'I will read this through Vedic Parashari Jyotish.',
    'I will answer from here, directly and clearly.',
  ]
    .filter(Boolean)
    .join('\n\n');
}

function getPredictaSchoolLabel(school: PredictaSchool | undefined): string {
  if (school === 'KP') {
    return 'KP Predicta';
  }

  if (school === 'JAIMINI' || school === 'NADI') {
    return 'Jaimini Predicta';
  }

  if (school === 'NUMEROLOGY') {
    return 'Numerology Predicta';
  }

  if (school === 'SIGNATURE') {
    return 'Signature Predicta';
  }

  return 'Vedic Predicta';
}

function buildRoomWelcomeReply(
  language: SupportedLanguage,
  room: WebPredictaChatRoom,
  hasSelectedKundli: boolean,
): string {
  const roomLabel = getPredictaSchoolLabel(room.school);
  const methodLine = getRoomMethodLine(language, room.school);

  if (language === 'hi') {
    return hasSelectedKundli
      ? [
          formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.9c880b5d6e", [roomLabel]),
          methodLine,
          getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.57eb44c0f8"),
        ].join('\n\n')
      : [
          formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a42a479c7d", [roomLabel]),
          methodLine,
          getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.51b0988382"),
        ].join('\n\n');
  }

  if (language === 'gu') {
    return hasSelectedKundli
      ? [
          formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.24d76f387e", [roomLabel]),
          methodLine,
          getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.09a8bc6db7"),
        ].join('\n\n')
      : [
          formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.b090500505", [roomLabel]),
          methodLine,
          getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.39f98b7049"),
        ].join('\n\n');
  }

  return hasSelectedKundli
    ? [
        `${roomLabel} is ready with your selected Kundli.`,
        methodLine,
        'Ask one clear question and I will stay inside this room.',
      ].join('\n\n')
    : [
        `${roomLabel} reads from a selected Kundli.`,
        methodLine,
        'If you do not have one open yet, choose a saved Kundli, create one, or paste birth details here.',
      ].join('\n\n');
}

function getRoomMethodLine(
  language: SupportedLanguage,
  school: PredictaSchool,
): string {
  if (language === 'hi') {
    if (school === 'KP') {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.d88e5f2875");
    }
    if (school === 'JAIMINI' || school === 'NADI') {
      return getNativeCopy('chat.jaimini.roomBoundary.hi');
    }
    if (school === 'NUMEROLOGY') {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.378129e024");
    }
    if (school === 'SIGNATURE') {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.ffdb93e54a");
    }
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.6323365e9b");
  }

  if (language === 'gu') {
    if (school === 'KP') {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.e5c580817f");
    }
    if (school === 'JAIMINI' || school === 'NADI') {
      return getNativeCopy('chat.jaimini.roomBoundary.gu');
    }
    if (school === 'NUMEROLOGY') {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.bc8bf3e3fe");
    }
    if (school === 'SIGNATURE') {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.bced7aa7d2");
    }
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.b9b9ec2a66");
  }

  if (school === 'KP') {
    return 'This room stays with cusps, star lords, sub lords, significators, and ruling planets.';
  }
  if (school === 'JAIMINI' || school === 'NADI') {
    return 'This room stays with soul role, visible identity, career dharma, relationship mirror, and destiny chapters.';
  }
  if (school === 'NUMEROLOGY') {
    return 'This room stays with name number, birth number, destiny number, and personal timing.';
  }
  if (school === 'SIGNATURE') {
    return 'This room stays with confirmed signature traits, self-expression patterns, and safe reflection.';
  }
  return 'This room stays with D1, varga support, dasha, gochar, remedies, and holistic context.';
}

function getRoomRecoveryCopy(
  language: SupportedLanguage,
  room: WebPredictaChatRoom,
): {
  actionsLabel: string;
  body: string;
  createKundli: string;
  eyebrow: string;
  footnote: string;
  openLibrary: string;
  title: string;
} {
  const roomLabel = getPredictaSchoolLabel(room.school);

  if (language === 'hi') {
    return {
      actionsLabel: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.f6013f4342"),
      body: formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a4a1077c8c", [roomLabel]),
      createKundli: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.36dd98b386"),
      eyebrow: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.a60f4cb5e4"),
      footnote:
        getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.5e87d520a6"),
      openLibrary: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.5e6f70db49"),
      title: formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.4525b1b50b", [roomLabel]),
    };
  }

  if (language === 'gu') {
    return {
      actionsLabel: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.82dddd860f"),
      body: formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.f9ac7c373e", [roomLabel]),
      createKundli: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.46e90ece90"),
      eyebrow: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.4bdf642357"),
      footnote:
        getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.7f46fb8168"),
      openLibrary: getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.c34be9a780"),
      title: formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.97bc447a05", [roomLabel]),
    };
  }

  return {
    actionsLabel: 'Kundli recovery actions',
    body: `${roomLabel} will not start a deep reading without a selected Kundli. Choose the right chart first, or create it here.`,
    createKundli: 'Create Kundli',
    eyebrow: 'Selected Kundli needed',
    footnote:
      'If you already have the birth details, paste them directly into this chat and I will create the chart here.',
    openLibrary: 'Choose saved Kundli',
    title: `Bring a chart into ${roomLabel}`,
  };
}

function buildKundliBirthSummaryForChat(kundli: KundliData): string {
  return [
    kundli.birthDetails.name,
    kundli.birthDetails.date,
    kundli.birthDetails.time,
    kundli.birthDetails.place,
  ]
    .filter(Boolean)
    .join(' | ');
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
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.4352c37f50");
    }
    if (remedyTitle) {
      return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.e36bde5a81", [remedyTitle]);
    }
    if (decisionQuestion) {
      return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.0d30b2b6d4", [decisionArea, decisionState]);
    }
    if (briefingDate) {
      return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.b4d517c31b", [briefingDate]);
    }
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.f92b63c069");
  }

  if (language === 'gu') {
    if (birthTimeDetective) {
      return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.ba59597dd0");
    }
    if (remedyTitle) {
      return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.fb7ff71acc", [remedyTitle]);
    }
    if (decisionQuestion) {
      return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.78ba85bbc5", [decisionArea, decisionState]);
    }
    if (briefingDate) {
      return formatNativeCopy("native.apps.web.components.WebPridictaChat.tsx.071b812126", [briefingDate]);
    }
    return getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.bbe8e5468f");
  }

  if (birthTimeDetective) {
    return 'Your Birth Time Detective summary is here. Ask when you want the confidence limits explained carefully.';
  }
  if (remedyTitle) {
    return `Your Remedy Coach practice is here: ${remedyTitle}. Ask when you want it explained from chart evidence.`;
  }
  if (decisionQuestion) {
    return `Your Decision Oracle memo is here: ${decisionArea} / ${decisionState}. Ask when you want it explained from chart evidence.`;
  }
  if (briefingDate) {
    return `Your daily briefing for ${briefingDate} is here. Ask when you want it explained from chart evidence.`;
  }
  return 'Your timeline event is here. Ask when you want it explained from chart evidence.';
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

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return { sessions: [] };
    }

    const sessions = Array.isArray(parsed.sessions)
      ? parsed.sessions
          .map((session, index) => sanitizeStoredChatSession(session, index))
          .filter(isDefinedChatSession)
      : [];
    const activeSessionId =
      typeof parsed.activeSessionId === 'string' &&
      sessions.some(session => session.id === parsed.activeSessionId)
        ? parsed.activeSessionId
        : sessions[0]?.id;

    return {
      activeSessionId,
      sessions,
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
  if (context?.predictaSchool === 'JAIMINI') {
    return 'JAIMINI';
  }
  if (context?.predictaSchool === 'NADI') {
    return 'JAIMINI';
  }
  if (context?.predictaSchool === 'NUMEROLOGY') {
    return 'NUMEROLOGY';
  }
  if (context?.predictaSchool === 'SIGNATURE') {
    return 'SIGNATURE';
  }
  return 'PARASHARI';
}

function sanitizeStoredChatSession(
  value: unknown,
  index: number,
): WebChatSession | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const activeChartContext = sanitizeStoredChartContext(value.activeChartContext);
  const chatLanguage = isSupportedLanguageValue(value.chatLanguage)
    ? value.chatLanguage
    : 'en';
  const replyLanguage = isSupportedLanguageValue(value.replyLanguage)
    ? value.replyLanguage
    : chatLanguage;
  const messages = sanitizeStoredMessages(value.messages);
  const id =
    typeof value.id === 'string' && value.id.trim()
      ? value.id
      : `recovered-chat-${index}`;
  const now = new Date().toISOString();

  return {
    activeChartContext,
    birthMemory: isRecord(value.birthMemory)
      ? (value.birthMemory as PredictaBirthMemory)
      : undefined,
    chatLanguage,
    createdAt:
      typeof value.createdAt === 'string' && value.createdAt.trim()
        ? value.createdAt
        : now,
    id,
    kundliId: typeof value.kundliId === 'string' ? value.kundliId : undefined,
    messages: messages.length ? messages : buildInitialMessages(chatLanguage),
    predictaMemory: isRecord(value.predictaMemory)
      ? (value.predictaMemory as PredictaInteractionMemory)
      : undefined,
    replyLanguage,
    school: getSchoolFromContext(activeChartContext),
    selectedChart: activeChartContext?.chartType,
    selectedHouse: activeChartContext?.selectedHouse,
    title:
      typeof value.title === 'string' && value.title.trim()
        ? value.title
        : buildWebChatSessionTitle(messages, activeChartContext, 'Predicta chat'),
    updatedAt:
      typeof value.updatedAt === 'string' && value.updatedAt.trim()
        ? value.updatedAt
        : now,
  };
}

function sanitizeStoredChartContext(
  value: unknown,
): ChartContext | undefined {
  return isRecord(value) ? (value as ChartContext) : undefined;
}

function sanitizeStoredMessages(value: unknown): WebMessage[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(message => sanitizeStoredMessageCandidate(message))
    .filter(isDefinedWebMessage);
}

function sanitizeStoredMessageCandidate(
  value: unknown,
): WebMessage | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const role = value.role === 'user' || value.role === 'pridicta' ? value.role : undefined;
  const text = typeof value.text === 'string' ? sanitizeChatCopy(value.text) : undefined;
  if (!role || !text) {
    return undefined;
  }

  return {
    blocks: Array.isArray(value.blocks)
      ? (value.blocks as ChatMessageBlock[])
      : undefined,
    context: sanitizeStoredChartContext(value.context),
    id:
      typeof value.id === 'string' && value.id.trim()
        ? value.id
        : `${role}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    role,
    safety: isRecord(value.safety) ? (value.safety as ChatSafetyMeta) : undefined,
    suggestions: Array.isArray(value.suggestions)
      ? (value.suggestions as ChatSuggestedCta[])
      : undefined,
    text,
  };
}

function isSupportedLanguageValue(
  value: unknown,
): value is SupportedLanguage {
  return value === 'en' || value === 'hi' || value === 'gu';
}

function isDefinedChatSession(
  value: WebChatSession | undefined,
): value is WebChatSession {
  return Boolean(value);
}

function isDefinedWebMessage(
  value: WebMessage | undefined,
): value is WebMessage {
  return Boolean(value);
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

function loadWebChatMemory(): WebChatMemory | undefined {
  try {
    const raw = window.localStorage.getItem(WEB_CHAT_MEMORY_KEY);
    if (!raw) {
      return undefined;
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!isRecord(parsed)) {
      return undefined;
    }

    return {
      birthMemory: isRecord(parsed.birthMemory)
        ? (parsed.birthMemory as PredictaBirthMemory)
        : undefined,
      chatLanguage: isSupportedLanguageValue(parsed.chatLanguage)
        ? parsed.chatLanguage
        : undefined,
      messages: sanitizeStoredMessages(parsed.messages),
      predictaMemory: isRecord(parsed.predictaMemory)
        ? (parsed.predictaMemory as PredictaInteractionMemory)
        : undefined,
    };
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
    .replace(oldHindiContextLine, getNativeCopy("native.apps.web.components.WebPridictaChat.tsx.616b4154a4"))
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
