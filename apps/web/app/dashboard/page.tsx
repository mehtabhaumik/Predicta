'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCompetitorResponseCopy } from '@pridicta/config';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { useLanguagePreference } from '../../lib/language-preference';
import { buildPredictaChatHref } from '../../lib/predicta-chat-cta';
import { useWebKundliLibrary } from '../../lib/use-web-kundli-library';

type LibraryLink = {
  body: string;
  href: string;
  title: string;
};

export default function DashboardPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = getCompetitorResponseCopy(language).dashboard;
  const t = (value: string) => translateUiText(value, language);
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const [isFamilyFriendsVisit, setIsFamilyFriendsVisit] = useState(false);
  const savedCount = savedKundlis.length;
  const askHref = buildPredictaChatHref({
    kundli: activeKundli,
    prompt: activeKundli
      ? copy.libraryAskActivePrompt
      : copy.libraryAskNewPrompt,
    sourceScreen: 'My Astrology Library',
  });

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

      <section className="primary-predicta-panel library-predicta-panel glass-panel">
        <div className="primary-predicta-copy">
          <div className="section-title">
            {copy.primaryPredictaEyebrow}
          </div>
          <h2>{copy.primaryPredictaTitle}</h2>
          <p>{copy.primaryPredictaBody}</p>
          <span>{copy.primaryPredictaProof}</span>
        </div>
        <div className="primary-predicta-actions">
          <Link className="button" href={askHref}>
            {copy.primaryPredictaPrimary}
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
      </section>

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
        <div className="library-status-metrics" aria-label={copy.libraryStatusEyebrow}>
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

      <LibrarySection
        body={copy.librarySavedWorkBody}
        eyebrow={copy.librarySavedWorkEyebrow}
        links={[
          {
            body: copy.librarySavedKundlisBody,
            href: '/dashboard/saved-kundlis',
            title: t('Kundli Library'),
          },
          {
            body: copy.libraryReportsBody,
            href: '/dashboard/report',
            title: t('Reports'),
          },
          {
            body: copy.libraryFamilyBody,
            href: '/dashboard/family',
            title: t('Family Vault'),
          },
          {
            body: copy.libraryPassesBody,
            href: '/dashboard/redeem-pass',
            title: t('Passes'),
          },
          {
            body: copy.libraryAccountBody,
            href: '/dashboard/account',
            title: t('Account'),
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
            title: t('Vedic Evidence'),
          },
          {
            body: copy.libraryKpBody,
            href: '/dashboard/kp',
            title: t('KP Evidence'),
          },
          {
            body: copy.libraryJaiminiBody,
            href: '/dashboard/jaimini',
            title: t('Jaimini Evidence'),
          },
          {
            body: copy.libraryNumerologyBody,
            href: '/dashboard/numerology',
            title: t('Numerology Evidence'),
          },
          {
            body: copy.librarySignatureBody,
            href: '/dashboard/signature',
            title: t('Signature Evidence'),
          },
        ]}
        title={copy.libraryEvidenceRoomsTitle}
      />
    </section>
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
