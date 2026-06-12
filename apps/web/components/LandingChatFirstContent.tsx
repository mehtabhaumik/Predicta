'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  getLightweightAppShellLabels,
  getLightweightCompetitorResponseCopy,
} from '../lib/lightweight-public-copy';
import { preloadAskPredictaRuntime } from '../lib/predicta-chat-runtime-preload';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';
import { useLightweightSpeechInput } from '../lib/use-lightweight-speech-input';

function buildAskPredictaHref(
  prompt: string,
  fallbackPrompt: string,
  mode: 'text' | 'voice' = 'text',
): string {
  const resolvedPrompt = prompt.trim() || fallbackPrompt;
  const params = new URLSearchParams({
    sourceScreen: 'Landing',
    prompt: resolvedPrompt,
  });

  if (mode === 'voice') {
    params.set('inputMode', 'voice');
  }

  return `/ask?${params.toString()}`;
}

export function LandingChatFirstContent(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLightweightLanguagePreference();
  const copy = getLightweightCompetitorResponseCopy(language);
  const landing = copy.landing;
  const labels = getLightweightAppShellLabels(language);
  const [question, setQuestion] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<
    'captured' | 'idle' | 'listening' | 'unsupported'
  >('idle');
  const speechInput = useLightweightSpeechInput({
    language,
    onTranscript: transcript => {
      setQuestion(transcript);
      setVoiceStatus('captured');
    },
  });
  const evidenceRooms = [
    { href: '/dashboard/vedic', label: labels.nav.vedic },
    { href: '/dashboard/kp', label: labels.nav.kp },
    { href: '/dashboard/jaimini', label: labels.nav.jaimini },
    { href: '/dashboard/numerology', label: labels.nav.numerology },
    { href: '/dashboard/signature', label: labels.nav.signature },
  ];

  useEffect(() => {
    router.prefetch('/ask');
  }, [router]);

  function openAskPredicta(prompt: string, mode: 'text' | 'voice' = 'text') {
    preloadAskPredictaRuntime();
    router.push(buildAskPredictaHref(prompt, landing.defaultAskPrompt, mode));
  }

  function startVoiceCapture(): void {
    preloadAskPredictaRuntime();
    const started = speechInput.startListening();
    setVoiceStatus(started ? 'listening' : 'unsupported');
  }

  return (
    <main className="landing-main landing-chat-first-main">
      <section className="landing-ask-hero">
        <div className="landing-ask-copy">
          <div className="section-title">{landing.askEyebrow}</div>
          <h1>{landing.askTitle}</h1>
          <p>{landing.askBody}</p>
        </div>

        <form
          className="landing-ask-console glass-panel"
          onFocus={preloadAskPredictaRuntime}
          onPointerEnter={preloadAskPredictaRuntime}
          onSubmit={event => {
            event.preventDefault();
            openAskPredicta(question);
          }}
          onTouchStart={preloadAskPredictaRuntime}
        >
          <label className="landing-ask-field">
            <span>{landing.suggestedQuestionLabel}</span>
            <textarea
              onChange={event => setQuestion(event.target.value)}
              placeholder={landing.askPlaceholder}
              rows={3}
              value={question}
            />
          </label>

          <div className="landing-question-chips" aria-label={landing.suggestedQuestionLabel}>
            {landing.suggestedQuestions.slice(0, 4).map(item => (
              <Link
                href={buildAskPredictaHref(item, landing.defaultAskPrompt)}
                key={item}
                onFocus={preloadAskPredictaRuntime}
                onPointerEnter={preloadAskPredictaRuntime}
                onTouchStart={preloadAskPredictaRuntime}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="landing-ask-actions">
            <Link
              className="button"
              href={buildAskPredictaHref(question, landing.defaultAskPrompt)}
              onFocus={preloadAskPredictaRuntime}
              onPointerEnter={preloadAskPredictaRuntime}
              onTouchStart={preloadAskPredictaRuntime}
            >
              {landing.askSubmit}
            </Link>
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

          <div className="landing-ask-hints">
            <span>{landing.noKundliHint}</span>
            <span>{landing.existingKundliHint}</span>
          </div>
          {voiceStatus !== 'idle' ? (
            <p className="landing-voice-note">
              {voiceStatus === 'unsupported'
                ? landing.voiceUnsupported
                : voiceStatus === 'captured'
                  ? landing.voiceCaptured
                  : landing.voiceListening}
            </p>
          ) : null}
        </form>
      </section>

      <section className="landing-proof-strip" aria-label={landing.benchmarkBar}>
        <span>{landing.benchmarkBar}</span>
      </section>

      <section className="landing-support-drawer" aria-label={landing.worldsTitle}>
        <details className="landing-support-panel glass-panel" id="predicta-worlds">
          <summary>
            <span>
              <small>{landing.worldsEyebrow}</small>
              <strong>{landing.worldsTitle}</strong>
            </span>
            <em>{landing.worldsPrimaryCta}</em>
          </summary>
          <div className="landing-support-panel-body">
            <div className="landing-world-panel-copy">
              <p>{landing.worldsBody}</p>
            </div>
            <div className="landing-world-actions">
              <Link
                className="button"
                href={buildAskPredictaHref(
                  landing.worldsAskPrompt,
                  landing.defaultAskPrompt,
                )}
                onFocus={preloadAskPredictaRuntime}
                onPointerEnter={preloadAskPredictaRuntime}
                onTouchStart={preloadAskPredictaRuntime}
              >
                {landing.worldsPrimaryCta}
              </Link>
              <Link className="button secondary" href="/dashboard">
                {landing.worldsSecondaryCta}
              </Link>
            </div>
            <div aria-label={labels.groups.worlds} className="landing-world-grid">
              {evidenceRooms.map((link, index) => (
                <Link className="landing-world-card" href={link.href} key={link.href}>
                  <strong>{link.label}</strong>
                  <span>{landing.worldEvidenceItems[index] ?? landing.worldsBody}</span>
                </Link>
              ))}
            </div>
          </div>
        </details>

        <details className="landing-support-panel glass-panel">
          <summary>
            <span>
              <small>{landing.capabilityEyebrow}</small>
              <strong>{landing.capabilityTitle}</strong>
            </span>
            <em>{copy.hero.primary}</em>
          </summary>
          <div className="landing-support-panel-body">
            <p>{landing.capabilityIntro}</p>
            <div className="landing-simple-grid">
              {landing.capabilities.map(item => (
                <article className="soft-panel" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </div>
        </details>

        <details className="landing-support-panel glass-panel">
          <summary>
            <span>
              <small>{landing.reportsEyebrow}</small>
              <strong>{landing.reportsTitle}</strong>
            </span>
            <em>{landing.previewReport}</em>
          </summary>
          <div className="landing-support-panel-body landing-report-card">
            <p>{landing.reportsIntro}</p>
            <strong>{landing.reportCoverTitle}</strong>
            <p>{landing.reportCopyBody}</p>
            <Link className="button secondary" href="/dashboard/report">
              {landing.previewReport}
            </Link>
          </div>
        </details>

        <details className="landing-support-panel glass-panel">
          <summary>
            <span>
              <small>{landing.intelligenceEyebrow}</small>
              <strong>{landing.intelligenceTitle}</strong>
            </span>
            <em>{landing.intelligencePanelTitle}</em>
          </summary>
          <div className="landing-support-panel-body landing-intelligence-panel">
            <div>
              <p>{landing.intelligenceIntro}</p>
              <h3>{landing.intelligencePanelTitle}</h3>
              <p>{landing.intelligencePanelBody}</p>
            </div>
            <ul>
              {landing.intelligenceItems.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </details>

        <section className="final-cta glass-panel landing-final-cta">
          <div>
            <div className="section-title">{landing.plansEyebrow}</div>
            <h2>{landing.plansTitle}</h2>
            <p>{landing.plansIntro}</p>
          </div>
          <Link
            className="button"
            href={buildAskPredictaHref('', landing.defaultAskPrompt)}
            onFocus={preloadAskPredictaRuntime}
            onPointerEnter={preloadAskPredictaRuntime}
            onTouchStart={preloadAskPredictaRuntime}
          >
            {copy.hero.primary}
          </Link>
        </section>
      </section>
    </main>
  );
}
