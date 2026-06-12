'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import {
  getLightweightAppShellLabels,
  getLightweightCompetitorResponseCopy,
} from '../../lib/lightweight-public-copy';
import { buildPredictaChatHref } from '../../lib/predicta-chat-cta';
import { useLightweightKundliSnapshot } from '../../lib/use-lightweight-kundli-snapshot';
import { useLightweightLanguagePreference } from '../../lib/use-lightweight-language-preference';

type LibraryLink = {
  body: string;
  href: string;
  title: string;
};

export default function DashboardPage(): React.JSX.Element {
  const router = useRouter();
  const { language } = useLightweightLanguagePreference();
  const copy = getLightweightCompetitorResponseCopy(language).dashboard;
  const labels = getLightweightAppShellLabels(language);
  const { activeKundli, savedCount } = useLightweightKundliSnapshot();
  const [isFamilyFriendsVisit, setIsFamilyFriendsVisit] = useState(false);
  const hasSavedKundli = Boolean(activeKundli) || savedCount > 0;
  const askHref = buildPredictaChatHref({
    kundliId: activeKundli?.id,
    prompt: activeKundli
      ? copy.libraryAskActivePrompt
      : copy.libraryAskNewPrompt,
    sourceScreen: 'My Kundlis',
  });

  function handleQuestionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawQuestion = data.get('question');
    const prompt =
      typeof rawQuestion === 'string' && rawQuestion.trim()
        ? rawQuestion.trim()
        : activeKundli
          ? copy.libraryAskActivePrompt
          : copy.libraryAskNewPrompt;
    router.push(
      buildPredictaChatHref({
        kundliId: activeKundli?.id,
        prompt,
        sourceScreen: 'My Kundlis',
      }),
    );
  }

  useEffect(() => {
    setIsFamilyFriendsVisit(
      new URLSearchParams(window.location.search).get('source') ===
        'family-friends',
    );
  }, []);

  return (
    <section className="dashboard-page library-dashboard-page">
      {isFamilyFriendsVisit ? (
        <FriendsFamilyWelcome hasKundli={Boolean(activeKundli)} />
      ) : null}

      <div className="page-heading library-dashboard-heading">
        <div className="section-title">{copy.libraryEyebrow}</div>
        <h1 className="gradient-text">
          {activeKundli ? copy.libraryReadyTitle : copy.libraryEmptyTitle}
        </h1>
        <p>{activeKundli ? copy.libraryReadyBody : copy.libraryEmptyBody}</p>
      </div>

      <form
        className="primary-predicta-panel library-predicta-panel glass-panel"
        onSubmit={handleQuestionSubmit}
      >
        <div className="primary-predicta-copy">
          <div className="section-title">
            {copy.primaryPredictaEyebrow}
          </div>
          <h2>{copy.primaryPredictaTitle}</h2>
          <label className="library-question-composer">
            <span>{copy.libraryQuestionLabel}</span>
            <textarea
              name="question"
              placeholder={copy.libraryQuestionPlaceholder}
              rows={3}
            />
          </label>
          <details className="library-proof-drawer">
            <summary>
              <span>{copy.libraryProofDrawerTitle}</span>
              <strong>{copy.libraryProofDrawerCta}</strong>
            </summary>
            <p>{copy.primaryPredictaBody}</p>
            <p>{copy.primaryPredictaProof}</p>
          </details>
        </div>
        <div className="primary-predicta-actions">
          <button className="button" type="submit">
            {copy.primaryPredictaPrimary}
          </button>
          <Link className="button secondary" href={askHref}>
            {copy.libraryAskHelpCta}
          </Link>
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
      </form>

      <section className="library-outcome-panel glass-panel">
        <div className="library-outcome-head">
          <div>
            <div className="section-title">{copy.outcomeEyebrow}</div>
            <h2>{copy.outcomeTitle}</h2>
          </div>
          <details className="library-outcome-help">
            <summary>
              <span>{copy.outcomeDrawerTitle}</span>
              <strong>{copy.outcomeDrawerCta}</strong>
            </summary>
            <p>{copy.outcomeDrawerBody}</p>
          </details>
        </div>
        <div className="library-outcome-grid">
          {copy.outcomeQuestions.map(question => (
            <Link
              className="library-outcome-card"
              href={buildPredictaChatHref({
                kundliId: activeKundli?.id,
                prompt: question.prompt,
                sourceScreen: 'My Kundlis',
              })}
              key={question.title}
            >
              <strong>{question.title}</strong>
              <span>{question.body}</span>
            </Link>
          ))}
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
  hasKundli,
}: {
  hasKundli: boolean;
}): React.JSX.Element {
  return (
    <section className="friends-family-welcome glass-panel">
      <div>
        <div className="section-title">PRIVATE PREVIEW</div>
        <h2>Start here. No hunting around.</h2>
        <details className="info-drawer">
          <summary>
            <span>Pass instructions</span>
            <strong>Open</strong>
          </summary>
          <p>
            Redeem your pass with the email used for it, create your Kundli, then
            ask Predicta one question you actually care about. If you are not
            sure which email was used, contact the Predicta admin or the person
            who invited you.
          </p>
        </details>
      </div>
      <div className="friends-family-actions">
        <Link className="button" href="/dashboard/redeem-pass?source=family-friends">
          Redeem Pass
        </Link>
        <Link
          className="button secondary"
          href={
            hasKundli
              ? '/ask?sourceScreen=Private+Preview&prompt=Show+me+what+I+should+try+first+from+my+Kundli.'
              : '/dashboard/kundli'
          }
        >
          {hasKundli ? 'Ask Predicta' : 'Create Kundli'}
        </Link>
        <Link
          className="button secondary"
          href="/feedback?source=family-friends&area=general&from=dashboard"
        >
          Give Feedback
        </Link>
      </div>
    </section>
  );
}
