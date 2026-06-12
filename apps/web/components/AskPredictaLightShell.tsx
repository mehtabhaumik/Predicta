'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getLightweightCompetitorResponseCopy } from '../lib/lightweight-public-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';
import { useLightweightSpeechInput } from '../lib/use-lightweight-speech-input';

type FullPredictaChatModule = {
  default: typeof import('./WebPridictaChat').WebPridictaChat;
};

let fullPredictaChatPreload: Promise<FullPredictaChatModule> | undefined;

function loadFullPredictaChat(): Promise<FullPredictaChatModule> {
  fullPredictaChatPreload ??= import('./WebPridictaChat').then(module => ({
    default: module.WebPridictaChat,
  }));

  return fullPredictaChatPreload;
}

function preloadFullPredictaChat(): void {
  void loadFullPredictaChat();
}

const FullPredictaChat = dynamic(
  loadFullPredictaChat,
  {
    loading: () => <AskPredictaLoadingCard />,
    ssr: false,
  },
);

const DEFAULT_ASK_PROMPT =
  'Help me create my Kundli first, then answer my astrology question clearly.';

const CONTEXT_PARAMS = [
  'birthTimeDetective',
  'chartName',
  'chartType',
  'decisionArea',
  'eventOracleHandoff',
  'from',
  'handoffQuestion',
  'kundliId',
  'prompt',
  'reportFocus',
  'school',
  'selectedHouse',
  'selectedKundliKarmaItemId',
  'selectedPlanet',
  'sourceScreen',
];

export function AskPredictaLightShell(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLightweightLanguagePreference();
  const landing = getLightweightCompetitorResponseCopy(language).landing;
  const incomingPrompt = searchParams.get('prompt') ?? '';
  const hasIncomingContext = useMemo(
    () => CONTEXT_PARAMS.some(param => searchParams.has(param)),
    [searchParams],
  );
  const [question, setQuestion] = useState(incomingPrompt);
  const [chatStarted, setChatStarted] = useState(hasIncomingContext);
  const [voiceNotice, setVoiceNotice] = useState(
    searchParams.get('inputMode') === 'voice',
  );
  const [voiceStatus, setVoiceStatus] = useState<
    'captured' | 'idle' | 'listening' | 'unsupported'
  >('idle');
  const speechInput = useLightweightSpeechInput({
    language,
    onTranscript: transcript => {
      setQuestion(transcript);
      setVoiceNotice(true);
      setVoiceStatus('captured');
    },
  });

  useEffect(() => {
    if (incomingPrompt) {
      setQuestion(incomingPrompt);
    }

    if (hasIncomingContext) {
      setChatStarted(true);
      preloadFullPredictaChat();
    }
  }, [hasIncomingContext, incomingPrompt]);

  function startChat(prompt: string, mode: 'text' | 'voice' = 'text'): void {
    const resolvedPrompt = prompt.trim() || DEFAULT_ASK_PROMPT;
    const nextUrl = buildAskHref(resolvedPrompt, mode);

    preloadFullPredictaChat();
    setVoiceNotice(mode === 'voice');
    setQuestion(resolvedPrompt);
    setChatStarted(true);
    router.replace(nextUrl, {
      scroll: false,
    });
  }

  function startVoiceCapture(): void {
    preloadFullPredictaChat();
    setVoiceNotice(true);

    const started = speechInput.startListening();
    setVoiceStatus(started ? 'listening' : 'unsupported');
  }

  function buildAskHref(prompt: string, mode: 'text' | 'voice' = 'text'): string {
    const resolvedPrompt = prompt.trim() || DEFAULT_ASK_PROMPT;
    const params = new URLSearchParams(searchParams.toString());

    params.set('prompt', resolvedPrompt);
    params.set('sourceScreen', params.get('sourceScreen') ?? 'Ask Predicta');
    params.set('autoSend', 'true');

    if (mode === 'voice') {
      params.set('inputMode', 'voice');
    } else {
      params.delete('inputMode');
    }

    return `/ask?${params.toString()}`;
  }

  return (
    <section
      className={
        chatStarted
          ? 'ask-light-shell ask-light-shell-started'
          : 'ask-light-shell'
      }
    >
      <form
        className="ask-light-console glass-panel"
        onFocus={preloadFullPredictaChat}
        onPointerEnter={preloadFullPredictaChat}
        onTouchStart={preloadFullPredictaChat}
        onSubmit={event => {
          event.preventDefault();
          startChat(question);
        }}
      >
        <div className="ask-light-copy">
          <div className="section-title">{landing.askEyebrow}</div>
          <h1>{landing.askTitle}</h1>
        </div>

        <label className="ask-light-field">
          <span>{landing.suggestedQuestionLabel}</span>
          <textarea
            onChange={event => setQuestion(event.target.value)}
            placeholder={landing.askPlaceholder}
            rows={chatStarted ? 2 : 3}
            value={question}
          />
        </label>

        <div className="ask-light-chips" aria-label={landing.suggestedQuestionLabel}>
          {landing.suggestedQuestions.slice(0, 5).map(item => (
            <Link
              href={buildAskHref(item)}
              key={item}
              onPointerEnter={preloadFullPredictaChat}
              onTouchStart={preloadFullPredictaChat}
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="ask-light-actions">
          <button className="button" type="submit">
            {landing.askSubmit}
          </button>
          <button
            className={
              speechInput.isListening
                ? 'button secondary ask-voice-button is-listening'
                : 'button secondary ask-voice-button'
            }
            onClick={startVoiceCapture}
            type="button"
          >
            {landing.voiceLabel}
          </button>
        </div>

        <p className="ask-light-support-copy">{landing.askBody}</p>

        <div className="ask-light-hints">
          <span>{landing.noKundliHint}</span>
          <span>{landing.existingKundliHint}</span>
        </div>
        {voiceNotice ? (
          <p className="ask-light-voice-note">
            {voiceStatus === 'unsupported'
              ? landing.voiceUnsupported
              : voiceStatus === 'captured'
                ? landing.voiceCaptured
                : speechInput.isListening || voiceStatus === 'listening'
                  ? landing.voiceListening
                  : landing.voiceHint}
          </p>
        ) : null}
      </form>

      {chatStarted ? <FullPredictaChat key={searchParams.toString()} /> : null}
    </section>
  );
}

export function AskPredictaLoadingCard(): React.JSX.Element {
  const { language } = useLightweightLanguagePreference();
  const landing = getLightweightCompetitorResponseCopy(language).landing;

  return (
    <article
      aria-live="polite"
      className="card chat-panel predicta-chat-loading"
    >
      <div className="predicta-chat-loading-orb" aria-hidden="true" />
      <div className="predicta-chat-loading-copy">
        <span>{landing.loadingEyebrow}</span>
        <strong>{landing.loadingTitle}</strong>
        <p>{landing.loadingBody}</p>
      </div>
      <div className="predicta-chat-loading-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </div>
    </article>
  );
}
