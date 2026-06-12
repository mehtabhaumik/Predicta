'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  getLightweightAppShellLabels,
  getLightweightCompetitorResponseCopy,
} from '../lib/lightweight-public-copy';
import { useLightweightLanguagePreference } from '../lib/use-lightweight-language-preference';
import { useLightweightSpeechInput } from '../lib/use-lightweight-speech-input';

const DEFAULT_ASK_PROMPT =
  'Help me create my Kundli first, then answer my astrology question clearly.';

function buildAskPredictaHref(prompt: string, mode: 'text' | 'voice' = 'text'): string {
  const resolvedPrompt = prompt.trim() || DEFAULT_ASK_PROMPT;
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
  const worldLinks = [
    { href: '/dashboard/vedic', label: labels.nav.vedic },
    { href: '/dashboard/kp', label: labels.nav.kp },
    { href: '/dashboard/jaimini', label: labels.nav.jaimini },
    { href: '/dashboard/numerology', label: labels.nav.numerology },
    { href: '/dashboard/signature', label: labels.nav.signature },
    { href: '/dashboard/report', label: labels.nav.reports },
  ];

  function openAskPredicta(prompt: string, mode: 'text' | 'voice' = 'text') {
    router.push(buildAskPredictaHref(prompt, mode));
  }

  function startVoiceCapture(): void {
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
          onSubmit={event => {
            event.preventDefault();
            openAskPredicta(question);
          }}
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
                href={buildAskPredictaHref(item)}
                key={item}
              >
                {item}
              </Link>
            ))}
          </div>

          <div className="landing-ask-actions">
            <Link className="button" href={buildAskPredictaHref(question)}>
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

      <nav
        aria-label={labels.groups.worlds}
        className="landing-world-links"
        id="predicta-worlds"
      >
        {worldLinks.map(link => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>

      <section className="landing-simple-section">
        <div className="section-heading">
          <div className="section-title">{landing.capabilityEyebrow}</div>
          <h2>{landing.capabilityTitle}</h2>
          <p>{landing.capabilityIntro}</p>
        </div>
        <div className="landing-simple-grid">
          {landing.capabilities.map(item => (
            <article className="soft-panel" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-simple-section landing-intelligence-summary">
        <div className="section-heading">
          <div className="section-title">{landing.intelligenceEyebrow}</div>
          <h2>{landing.intelligenceTitle}</h2>
          <p>{landing.intelligenceIntro}</p>
        </div>
        <div className="landing-intelligence-panel glass-panel">
          <div>
            <h3>{landing.intelligencePanelTitle}</h3>
            <p>{landing.intelligencePanelBody}</p>
          </div>
          <ul>
            {landing.intelligenceItems.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="landing-simple-section landing-report-summary">
        <div className="landing-report-card glass-panel">
          <span>{landing.reportsEyebrow}</span>
          <h2>{landing.reportsTitle}</h2>
          <p>{landing.reportsIntro}</p>
          <strong>{landing.reportCoverTitle}</strong>
          <p>{landing.reportCopyBody}</p>
          <Link className="button secondary" href="/dashboard/report">
            {landing.previewReport}
          </Link>
        </div>
      </section>

      <section className="final-cta glass-panel landing-final-cta">
        <div>
          <div className="section-title">{landing.plansEyebrow}</div>
          <h2>{landing.plansTitle}</h2>
          <p>{landing.plansIntro}</p>
        </div>
        <Link className="button" href="/pricing">
          {copy.hero.primary}
        </Link>
      </section>
    </main>
  );
}
