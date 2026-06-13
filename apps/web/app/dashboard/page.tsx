'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  getLightweightAppShellLabels,
  getLightweightCompetitorResponseCopy,
} from '../../lib/lightweight-public-copy';
import { buildPredictaChatHref } from '../../lib/predicta-chat-cta';
import { useLightweightKundliSnapshot } from '../../lib/use-lightweight-kundli-snapshot';
import { useLightweightLanguagePreference } from '../../lib/use-lightweight-language-preference';
import { useLightweightSpeechInput } from '../../lib/use-lightweight-speech-input';
import { prewarmPredictaRuntime } from '../../components/AskPredictaRuntimeBridge';

type LibraryLink = {
  body: string;
  href: string;
  title: string;
};

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const voiceAutoStartedRef = useRef(false);
  const { language } = useLightweightLanguagePreference();
  const competitorCopy = getLightweightCompetitorResponseCopy(language);
  const copy = competitorCopy.dashboard;
  const voiceCopy = competitorCopy.landing;
  const labels = getLightweightAppShellLabels(language);
  const { activeKundli, savedCount } = useLightweightKundliSnapshot();
  const [isFamilyFriendsVisit, setIsFamilyFriendsVisit] = useState(false);
  const [questionDraft, setQuestionDraft] = useState('');
  const [voiceStatus, setVoiceStatus] = useState<
    'captured' | 'idle' | 'listening' | 'unsupported'
  >('idle');
  const hasSavedKundli = Boolean(activeKundli) || savedCount > 0;
  const askHref = buildPredictaChatHref({
    kundliId: activeKundli?.id,
    prompt: activeKundli
      ? copy.libraryAskActivePrompt
      : copy.libraryAskNewPrompt,
    sourceScreen: 'My Kundlis',
  });

  function prefetchDashboardAsk(href = askHref) {
    router.prefetch('/ask');
    router.prefetch(href);
    prewarmPredictaRuntime();
  }

  function buildDashboardQuestionHref(
    question?: string,
    mode: 'text' | 'voice' = 'text',
  ): string {
    const prompt = question?.trim()
      ? question.trim()
      : activeKundli
        ? copy.libraryAskActivePrompt
        : copy.libraryAskNewPrompt;

    return buildPredictaChatHref({
      kundliId: activeKundli?.id,
      inputMode: mode,
      prompt,
      sourceScreen: 'My Kundlis',
    });
  }

  function submitDashboardQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const href = buildDashboardQuestionHref(questionDraft);
    prefetchDashboardAsk(href);
    router.push(href);
  }

  function startDashboardVoiceCapture(): void {
    voiceAutoStartedRef.current = false;

    const started = speechInput.startListening();
    setVoiceStatus(started ? 'listening' : 'unsupported');
  }

  const speechInput = useLightweightSpeechInput({
    language,
    onFinalTranscript: transcript => {
      if (voiceAutoStartedRef.current) {
        return;
      }

      voiceAutoStartedRef.current = true;
      setVoiceStatus('captured');
      const href = buildDashboardQuestionHref(transcript, 'voice');
      prefetchDashboardAsk(href);
      router.push(href);
    },
    onTranscript: transcript => {
      setQuestionDraft(transcript);
      setVoiceStatus('captured');
    },
  });

  useEffect(() => {
    prefetchDashboardAsk();
    setIsFamilyFriendsVisit(
      new URLSearchParams(window.location.search).get('source') ===
        'family-friends',
    );
  }, [askHref]);

  return (
    <section className="dashboard-page library-dashboard-page">
      {isFamilyFriendsVisit ? (
        <FriendsFamilyWelcome copy={copy} hasKundli={Boolean(activeKundli)} />
      ) : null}

      <section
        className="primary-predicta-panel library-predicta-panel glass-panel"
        onFocus={() => prefetchDashboardAsk()}
        onPointerEnter={() => prefetchDashboardAsk()}
        onTouchStart={() => prefetchDashboardAsk()}
      >
        <div className="primary-predicta-copy">
          <div className="section-title">
            {copy.primaryPredictaEyebrow}
          </div>
          <h2>{copy.primaryPredictaTitle}</h2>
          <form
            className="library-question-composer"
            onSubmit={submitDashboardQuestion}
          >
            <span>{copy.libraryQuestionLabel}</span>
            <textarea
              aria-label={copy.libraryQuestionLabel}
              onChange={event => setQuestionDraft(event.target.value)}
              onFocus={() => prefetchDashboardAsk(buildDashboardQuestionHref(questionDraft))}
              onPointerEnter={() =>
                prefetchDashboardAsk(buildDashboardQuestionHref(questionDraft))
              }
              placeholder={copy.libraryQuestionPlaceholder}
              rows={3}
              value={questionDraft}
            />
            <div
              aria-label={copy.outcomeTitle}
              className="library-question-shortcuts"
            >
              {copy.outcomeQuestions.slice(0, 6).map(question => {
                const href = buildPredictaChatHref({
                  kundliId: activeKundli?.id,
                  prompt: question.prompt,
                  sourceScreen: 'My Kundlis',
                });

                return (
                  <Link
                    className="library-question-chip"
                    href={href}
                    key={question.title}
                    onFocus={() => prefetchDashboardAsk(href)}
                    onPointerEnter={() => prefetchDashboardAsk(href)}
                    onTouchStart={() => prefetchDashboardAsk(href)}
                  >
                    {question.title}
                  </Link>
                );
              })}
            </div>
            <div className="library-question-composer-actions">
              <button className="button" type="submit">
                {copy.primaryPredictaPrimary}
              </button>
              <button
                className={
                  speechInput.isListening
                    ? 'button secondary ask-voice-button is-listening'
                    : 'button secondary ask-voice-button'
                }
                onClick={startDashboardVoiceCapture}
                type="button"
              >
                {voiceCopy.voiceLabel}
              </button>
            </div>
          </form>
          {voiceStatus !== 'idle' ? (
            <p className="library-voice-note">
              {voiceStatus === 'unsupported'
                ? voiceCopy.voiceUnsupported
                : voiceStatus === 'captured'
                  ? voiceCopy.voiceCaptured
                  : voiceCopy.voiceListening}
            </p>
          ) : null}
          <details className="library-proof-drawer">
            <summary>
              <span>{copy.primaryPredictaProof}</span>
              <strong>{copy.outcomeDrawerCta}</strong>
            </summary>
            <p>{copy.primaryPredictaBody}</p>
          </details>
        </div>
        <div className="primary-predicta-actions">
          {!activeKundli ? (
            <Link className="button secondary" href="/dashboard/kundli">
              {copy.libraryCreateKundli}
            </Link>
          ) : (
            <Link className="button secondary" href="/dashboard/saved-kundlis">
              {copy.libraryOpenSavedWork}
            </Link>
          )}
        </div>
      </section>

      <section className="library-quick-strip glass-panel">
        <div>
          <div className="section-title">{copy.libraryEyebrow}</div>
          <h2>{activeKundli ? copy.libraryReadyTitle : copy.libraryEmptyTitle}</h2>
          <p>{activeKundli ? copy.libraryReadyBody : copy.libraryEmptyBody}</p>
        </div>
        <div className="library-quick-strip-actions">
          <Link
            className="button secondary"
            href={activeKundli ? '/dashboard/saved-kundlis' : '/dashboard/kundli'}
          >
            {activeKundli ? copy.libraryOpenSavedWork : copy.libraryCreateKundli}
          </Link>
          <Link className="button secondary" href="/dashboard/report">
            {labels.nav.reports}
          </Link>
        </div>
      </section>

      {hasSavedKundli ? (
        <section className="library-status-panel glass-panel">
          <div>
            <div className="section-title">{copy.libraryStatusEyebrow}</div>
            <h2>
              {activeKundli
                ? copy.libraryActiveProfileTitle.replace(
                    '{name}',
                    activeKundli.birthDetails.name,
                  )
                : copy.libraryNoActiveProfileTitle}
            </h2>
            <p>
              {activeKundli
                ? copy.libraryActiveProfileBody.replace(
                    '{place}',
                    activeKundli.birthDetails.place,
                  )
                : copy.libraryNoActiveProfileBody}
            </p>
          </div>
          <div
            aria-label={copy.libraryStatusEyebrow}
            className="library-status-metrics"
          >
            <span>
              <strong>{savedCount}</strong>
              <small>{copy.librarySavedCountLabel}</small>
            </span>
            <span>
              <strong>{activeKundli ? '1' : '0'}</strong>
              <small>{copy.libraryActiveCountLabel}</small>
            </span>
          </div>
        </section>
      ) : null}

      <details className="library-secondary-drawer glass-panel">
        <summary>
          <span>{copy.librarySavedWorkEyebrow}</span>
          <strong>{copy.librarySecondaryDrawerTitle}</strong>
          <small>{copy.librarySecondaryDrawerCta}</small>
        </summary>
        <p>{copy.librarySecondaryDrawerBody}</p>
        <div className="library-secondary-stack">
          <DashboardLibrarySections copy={copy} labels={labels} />
        </div>
      </details>
    </section>
  );
}

function DashboardLibrarySections({
  copy,
  labels,
}: {
  copy: ReturnType<typeof getLightweightCompetitorResponseCopy>['dashboard'];
  labels: ReturnType<typeof getLightweightAppShellLabels>;
}): React.JSX.Element {
  return (
    <>
      <LibrarySection
        body={copy.librarySavedWorkBody}
        eyebrow={copy.librarySavedWorkEyebrow}
        links={[
          {
            body: copy.librarySavedKundlisBody,
            href: '/dashboard/saved-kundlis',
            title: labels.nav.savedKundlis,
          },
          {
            body: copy.libraryReportsBody,
            href: '/dashboard/report',
            title: labels.nav.reports,
          },
          {
            body: copy.libraryFamilyBody,
            href: '/dashboard/family',
            title: labels.nav.family,
          },
          {
            body: copy.libraryPassesBody,
            href: '/dashboard/redeem-pass',
            title: labels.nav.redeemPass,
          },
          {
            body: copy.libraryAccountBody,
            href: '/dashboard/account',
            title: labels.nav.account,
          },
        ]}
        title={copy.librarySavedWorkTitle}
      />

      <LibrarySection
        body={copy.libraryEvidenceRoomsBody}
        eyebrow={copy.libraryEvidenceRoomsEyebrow}
        links={[
          {
            body: copy.libraryVedicBody,
            href: '/dashboard/vedic',
            title: labels.nav.vedicEvidence,
          },
          {
            body: copy.libraryKpBody,
            href: '/dashboard/kp',
            title: labels.nav.kpEvidence,
          },
          {
            body: copy.libraryJaiminiBody,
            href: '/dashboard/jaimini',
            title: labels.nav.jaiminiEvidence,
          },
          {
            body: copy.libraryNumerologyBody,
            href: '/dashboard/numerology',
            title: labels.nav.numerologyEvidence,
          },
          {
            body: copy.librarySignatureBody,
            href: '/dashboard/signature',
            title: labels.nav.signatureEvidence,
          },
        ]}
        title={copy.libraryEvidenceRoomsTitle}
      />
    </>
  );
}

function LibrarySection({
  body,
  eyebrow,
  links,
  title,
}: {
  body: string;
  eyebrow: string;
  links: LibraryLink[];
  title: string;
}): React.JSX.Element {
  return (
    <section className="library-section-panel glass-panel">
      <div className="library-section-head">
        <div>
          <div className="section-title">{eyebrow}</div>
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
      </div>
      <div className="library-action-grid">
        {links.map(link => (
          <Link className="library-action-card" href={link.href} key={link.href}>
            <strong>{link.title}</strong>
            <span>{link.body}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function FriendsFamilyWelcome({
  copy,
  hasKundli,
}: {
  copy: ReturnType<typeof getLightweightCompetitorResponseCopy>['dashboard'];
  hasKundli: boolean;
}): React.JSX.Element {
  const askPreviewHref = buildPredictaChatHref({
    prompt: copy.familyFriendsAskPrompt,
    sourceScreen: copy.familyFriendsSourceScreen,
  });

  return (
    <section className="friends-family-welcome glass-panel">
      <div>
        <div className="section-title">{copy.familyFriendsEyebrow}</div>
        <h2>{copy.familyFriendsTitle}</h2>
        <details className="info-drawer">
          <summary>
            <span>{copy.familyFriendsInstructionsTitle}</span>
            <strong>{copy.familyFriendsInstructionsCta}</strong>
          </summary>
          <p>{copy.familyFriendsInstructionsBody}</p>
        </details>
      </div>
      <div className="friends-family-actions">
        <Link className="button" href="/dashboard/redeem-pass?source=family-friends">
          {copy.familyFriendsRedeemCta}
        </Link>
        <Link
          className="button secondary"
          href={hasKundli ? askPreviewHref : '/dashboard/kundli'}
        >
          {hasKundli ? copy.familyFriendsAskCta : copy.familyFriendsCreateCta}
        </Link>
        <Link
          className="button secondary"
          href="/feedback?source=family-friends&area=general&from=dashboard"
        >
          {copy.familyFriendsFeedbackCta}
        </Link>
      </div>
    </section>
  );
}
