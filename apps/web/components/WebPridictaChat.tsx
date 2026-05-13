'use client';

import { useSearchParams } from 'next/navigation';
import { type CSSProperties, useEffect, useRef, useState } from 'react';
import {
  buildChatChartReplyText,
  buildChatFollowUps,
  buildChartContextIntro,
  buildChartSelectionPrompt,
  buildNorthIndianChartCells,
  chartContextFromChatBlock,
  buildPredictaActionReply,
  buildEnglishSwitchDecisionReply,
  buildEnglishSwitchPrompt,
  buildPredictaLearningSuggestion,
  composeChatChartBlock,
  detectChatChartIntent,
  detectEnglishSwitchDecision,
  getPlanetAbbreviation,
  findHouseCell,
  learnPredictaInteraction,
  preparePredictaLanguageContext,
  shouldAskBeforeSwitchingToEnglish,
  shouldAutoSwitchToRegionalLanguage,
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
  generateKundliFromWeb,
  loadWebKundliStore,
  resolveWebKundliForContext,
  saveWebActiveChartContext,
  WEB_KUNDLI_UPDATED_EVENT,
} from '../lib/web-kundli-storage';

const WEB_CHAT_MEMORY_KEY = 'predicta.webChatMemory.v4';

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

type PendingEnglishSwitch = {
  fromLanguage: Exclude<SupportedLanguage, 'en'>;
  requestedAt: string;
};

type ParsedProofReply = {
  body: string[];
  proof?: {
    chartFactors: string[];
    confidence: string;
    timing: string;
  };
};

export function WebPridictaChat(): React.JSX.Element {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { language } = useLanguagePreference();
  const labels = getLanguageLabels(language);
  const appLanguageOption = getLanguageOption(language);
  const loadedQueryPromptRef = useRef('');
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const didLoadMemory = useRef(false);
  const responseSafetyRef = useRef<ChatSafetyMeta | undefined>(undefined);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [savedKundlis, setSavedKundlis] = useState<KundliData[]>([]);
  const [birthMemory, setBirthMemory] = useState<PredictaBirthMemory>();
  const [predictaMemory, setPredictaMemory] =
    useState<PredictaInteractionMemory>();
  const [pendingEnglishSwitch, setPendingEnglishSwitch] =
    useState<PendingEnglishSwitch>();
  const [chatLanguage, setChatLanguage] = useState<SupportedLanguage>(language);
  const [activeChartContext, setActiveChartContext] = useState<ChartContext>();
  const [messages, setMessages] = useState<WebMessage[]>(() =>
    buildInitialMessages(language),
  );
  const lastPredictaMessageId = [...messages]
    .reverse()
    .find(message => message.role === 'pridicta')?.id;

  useEffect(() => {
    function refreshKundlis() {
      const store = loadWebKundliStore();
      const recoveredKundli =
        resolveWebKundliForContext(store.activeChartContext) ?? store.activeKundli;
      setKundli(recoveredKundli);
      setSavedKundlis(store.savedKundlis);
      setActiveChartContext(current => current ?? store.activeChartContext);
    }

    refreshKundlis();
    window.addEventListener('storage', refreshKundlis);
    window.addEventListener(WEB_KUNDLI_UPDATED_EVENT, refreshKundlis);

    const stored = loadWebChatMemory();

    if (stored) {
      const rememberedContext = [...stored.messages]
        .reverse()
        .find(message => message.context)?.context;
      setBirthMemory(stored.birthMemory);
      setChatLanguage(stored.chatLanguage ?? language);
      setPredictaMemory(stored.predictaMemory);
      setActiveChartContext(current => current ?? rememberedContext);
      const recoveredKundli = resolveWebKundliForContext(rememberedContext);
      if (recoveredKundli) {
        setKundli(recoveredKundli);
      }
      setMessages(
        stored.messages.length
          ? stored.messages.map(sanitizeStoredMessage)
          : buildInitialMessages(language),
      );
    }

    didLoadMemory.current = true;

    return () => {
      window.removeEventListener('storage', refreshKundlis);
      window.removeEventListener(WEB_KUNDLI_UPDATED_EVENT, refreshKundlis);
    };
  }, []);

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

    saveWebChatMemory({
      birthMemory,
      chatLanguage,
      messages: messages.map(sanitizeStoredMessage),
      predictaMemory,
    });
  }, [birthMemory, chatLanguage, messages, predictaMemory]);

  useEffect(() => {
    const thread = threadRef.current;

    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }
  }, [messages, isSending]);

  useEffect(() => {
    setMessages(current =>
      current.length === 1 && current[0].id === 'welcome'
        ? buildInitialMessages(language)
        : current,
    );
    setChatLanguage(current =>
      messages.length <= 1 && current !== language ? language : current,
    );
  }, [language]);

  function recoverActiveKundli(
    context = activeChartContext,
  ): KundliData | undefined {
    const recovered = kundli ?? resolveWebKundliForContext(context);

    if (recovered && recovered.id !== kundli?.id) {
      setKundli(recovered);
    }

    return recovered;
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
        const nextContext = {
          ...ctaContext,
          selectedSection,
        };
        setActiveChartContext(nextContext);
        saveWebActiveChartContext(nextContext);
        setInput(selectedSection);
        setMessages(current => [
          ...current,
          createPridictaReply(
            nextContext.predictaSchool
              ? buildSchoolContextIntro(nextContext, language)
              : nextContext.chartType
                ? buildChartContextIntro(nextContext, language)
                : buildCtaContextIntro(nextContext, language),
            language,
            {
              context: nextContext,
              kundli,
              lastText: selectedSection,
            },
          ),
        ]);
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

      const chartReply = resolveChatChartReply(
        text,
        languageContext.responseLanguage,
      );

      if (chartReply) {
        setMessages(current => [...current, chartReply.message]);
        return;
      }

      responseSafetyRef.current = undefined;
      const summary = await resolveSmartReply(text);
      const recoveredKundli = recoverActiveKundli();
      const safeSummary =
        recoveredKundli && hasHighStakesLanguage(text)
          ? `${getSafetyBoundaryCopy(
              languageContext.responseLanguage,
            )}\n\n${summary}`
          : summary;

      setMessages(current => [
        ...current,
          createPridictaReply(safeSummary, languageContext.responseLanguage, {
            context: activeChartContext,
            kundli: recoveredKundli,
            lastText: text,
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
    const nextMemory = learnPredictaInteraction(
      predictaMemory,
      text,
      undefined,
      activeKundli,
      responseLanguage,
    );
    setPredictaMemory(nextMemory);
    const response = await askPridictaFromWeb({
      history: messages.map(message => ({
        role: message.role,
        text: message.text,
      })),
      chartContext: activeChartContext,
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

    if (looksLikeBirthDetails(text)) {
      return handleBirthIntake(
        text,
        responseLanguage,
        languageContext.acknowledgement,
      );
    }

    const activeKundli = recoverActiveKundli();

    const actionReply = buildPredictaActionReply({
      hasPremiumAccess: false,
      kundli: activeKundli,
      language: responseLanguage,
      memory: predictaMemory,
      savedKundlis,
      text,
    });
    setPredictaMemory(actionReply.memory);

    if (actionReply.handled && actionReply.text) {
      return actionReply.text;
    }

    if (!activeKundli) {
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

    const context = chartContextFromChatBlock(block, 'Chat');
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

  return (
    <div className="chat-workspace">
      <div className="card chat-panel">
        <div className="chat-language-state" aria-live="polite">
          <span>{labels.chatLanguage}</span>
          <strong>{getLanguageOption(chatLanguage).englishName}</strong>
          <small>
            {labels.appLanguage}: {appLanguageOption.englishName}
          </small>
        </div>
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
                <WebChatReplyText text={message.text} />
              ) : (
                <p>{message.text}</p>
              )}
              {message.safety ? <WebChatSafetyCard safety={message.safety} /> : null}
              {message.blocks?.map(block => (
                <WebChatMessageBlock
                  block={block}
                  key={`${message.id}-${block.type}-${block.chartType}`}
                  onUsePrompt={prompt => {
                    if (block.type === 'chart') {
                      const context = chartContextFromChatBlock(block, 'Chat');
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
                      setActiveChartContext(suggestion.context);
                      saveWebActiveChartContext(suggestion.context);
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
  block,
  onUsePrompt,
}: {
  block: ChatMessageBlock;
  onUsePrompt: (prompt: string) => void;
}): React.JSX.Element {
  if (block.type === 'chart') {
    return <WebChatChartBlock block={block} onUsePrompt={onUsePrompt} />;
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
      {suggestions.slice(0, 4).map(suggestion => (
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
  block,
  onUsePrompt,
}: {
  block: ChatChartBlock;
  onUsePrompt: (prompt: string) => void;
}): React.JSX.Element {
  const cells = buildNorthIndianChartCells(block.chart);
  const [selectedHouse, setSelectedHouse] = useState<number | undefined>(
    cells[0]?.house,
  );
  const selectedCell =
    findHouseCell(cells, selectedHouse) ?? cells.find(cell => cell.house === 1) ?? cells[0];

  return (
    <div className="chat-chart-card">
      <div className="chat-chart-card-header">
        <div>
          <div className="section-title">{block.chartType} · {block.insight.eyebrow}</div>
          <h3>{block.chartName}</h3>
          <p>{block.ownerName}'s chart focus</p>
        </div>
        <strong>{block.supported ? 'Visible' : 'Under review'}</strong>
      </div>

      <div className="chat-chart-body">
        <div className="chat-mini-chart" aria-label={`${block.chartName} mini chart`}>
          {cells.map((cell, index) => (
            <button
              aria-pressed={selectedCell?.house === cell.house}
              className={selectedCell?.house === cell.house ? 'selected' : ''}
              key={cell.key}
              onClick={() => {
                setSelectedHouse(cell.house);
                onUsePrompt(`Explain House ${cell.house} in my ${block.chartType} chart with D1 proof.`);
              }}
              style={{
                ['--chart-cell-index' as string]: index,
                gridColumn: cell.col + 1,
                gridRow: cell.row + 1,
              } as CSSProperties}
              type="button"
            >
              <span>H{cell.house} {cell.signShort}</span>
              <small>
                {cell.planets.length
                  ? cell.planets.map(getPlanetAbbreviation).join(' ')
                  : '-'}
              </small>
            </button>
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
                  : 'No planet in this house; judge house lord and D1 anchor.'}
              </small>
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
    context?: ChartContext;
    kundli?: KundliData;
    lastText: string;
    safety?: ChatSafetyMeta;
  },
): WebMessage {
  return {
    context: options.context,
    id: `pridicta-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role: 'pridicta',
    suggestions: buildFollowUps({
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
  return buildChatFollowUps({
    context,
    hasKundli: Boolean(kundli),
    hasPremiumAccess: false,
    kundli,
    language,
    lastText,
  });
}

function chartContextFromParams(params: URLSearchParams): ChartContext | undefined {
  const school = params.get('school');
  const handoffQuestion = params.get('handoffQuestion');
  const kundliId = params.get('kundliId') ?? undefined;

  if (school === 'KP' || school === 'NADI' || school === 'PARASHARI') {
    return {
      handoffFrom:
        params.get('from') === 'KP' || params.get('from') === 'NADI'
          ? (params.get('from') as 'KP' | 'NADI')
          : 'PARASHARI',
      handoffQuestion: handoffQuestion ?? params.get('prompt') ?? undefined,
      kundliId,
      predictaSchool: school,
      selectedSection:
        params.get('prompt') ??
        (handoffQuestion
          ? `${school} Predicta handoff question: ${handoffQuestion}`
          : undefined),
      sourceScreen: `${school} Predicta`,
    };
  }

  const chartType = params.get('chartType') as ChartType | null;

  if (!chartType) {
    return undefined;
  }

  const selectedHouse = params.get('selectedHouse');

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
    kundliId: params.get('kundliId') ?? undefined,
    selectedBirthTimeDetective: params.get('birthTimeDetective') === 'true',
    selectedDailyBriefingDate:
      params.get('selectedDailyBriefingDate') ?? params.get('briefingDate') ?? undefined,
    selectedDecisionArea:
      (params.get('decisionArea') as ChartContext['selectedDecisionArea']) ?? undefined,
    selectedDecisionQuestion: params.get('decisionQuestion') ?? undefined,
    selectedDecisionState:
      (params.get('decisionState') as ChartContext['selectedDecisionState']) ?? undefined,
    selectedFamilyKarmaMap: params.get('selectedFamilyKarmaMap') === 'true',
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
      `${source} se aapka sawaal mil gaya hai.`,
      focus ? `Ab hum yeh dekh rahe hain: ${focus}` : undefined,
      'Main aapki selected Kundli se yahin jawab dungi. Aap Ask dabaiye ya apna follow-up likhiye.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `${source} mathi tamaro sawal mali gayo chhe.`,
      focus ? `Havye aapde aa joiye chhiye: ${focus}` : undefined,
      'Hu tamari selected Kundli thi ahi j jawab aapish. Ask dabavo athva follow-up lakho.',
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
  const school =
    context.predictaSchool === 'KP'
      ? 'KP Predicta'
      : context.predictaSchool === 'NADI'
        ? 'Nadi Predicta'
        : 'Regular Predicta';
  const question = context.handoffQuestion ?? context.selectedSection;

  if (language === 'hi') {
    return [
      `${school} ready hai.`,
      question ? `Aapka question: ${question}` : undefined,
      context.predictaSchool === 'KP'
        ? 'Ab answer KP ke cusps, star lords, sub lords, significators aur ruling planets se hi grounded rahega.'
      : context.predictaSchool === 'NADI'
          ? 'Nadi Predicta ready hai. Main planetary story links aur validation questions se padhungi; palm-leaf ka fake claim nahi hoga.'
          : 'Ab answer regular Parashari Jyotish context mein rahega.',
      'Press Ask, ya apna follow-up likhiye.',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  if (language === 'gu') {
    return [
      `${school} ready chhe.`,
      question ? `Tamaro question: ${question}` : undefined,
      context.predictaSchool === 'KP'
        ? 'Have answer KP cusps, star lords, sub lords, significators ane ruling planets par grounded rahe.'
      : context.predictaSchool === 'NADI'
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
    context.predictaSchool === 'KP'
      ? 'The answer will now stay grounded in KP cusps, star lords, sub lords, significators, and ruling planets.'
    : context.predictaSchool === 'NADI'
        ? 'Nadi Predicta is ready. I will read through planetary story links and validation questions, without fake palm-leaf claims.'
        : 'The answer will now stay in regular Parashari Jyotish.',
    'Press Ask, or type your follow-up.',
  ]
    .filter(Boolean)
    .join('\n\n');
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
    /(born|birth|dob|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/.test(
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
    ].join('\n\n');
  }
  if (language === 'gu') {
    return [
      'Thai gayu. Maine Kundli ahi chat ma banaavi didhi chhe ane tene selected rakhi chhe.',
      lines.join('\n'),
      'Have career, marriage, money, health tendencies, remedies, timing athva koi decision vishe poochho. Hu chart proof sathe jawab aapish.',
    ].join('\n\n');
  }
  return [
    'Done. I created your Kundli right here in chat and selected it for this reading.',
    lines.join('\n'),
    'Now ask me about career, marriage, money, health tendencies, remedies, timing, or any decision. I will answer with chart proof.',
  ].join('\n\n');
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
  return text
    .replace(/Dashboard Header context loaded hai\./g, 'I picked this up from your dashboard.')
    .replace(/Dashboard Header context loaded\./g, 'I picked this up from your dashboard.')
    .replace(/Focus: Help me from my active Kundli\./g, 'We are looking at: Help me from my selected Kundli.')
    .replace(/Main isi context aur active Kundli se answer karungi\. Aap Ask dabaiye ya apna follow-up likhiye\./g, 'Main aapki selected Kundli se yahin jawab dungi. Aap Ask dabaiye ya apna follow-up likhiye.')
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
