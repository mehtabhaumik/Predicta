'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCompetitorResponseCopy } from '@pridicta/config';
import { PREDICTA_OUTCOME_ENTRIES } from '@pridicta/config/predictaUx';
import { translateUiText } from '@pridicta/config/uiTranslations';
import {
  composeDailyBriefing,
  composeDestinyPassport,
  composeHolisticDailyGuidance,
  composeNumerologyFoundationModel,
  composePersonalPanchangLayer,
  composePurusharthaLifeBalance,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
} from '@pridicta/astrology';
import { Card } from '../../components/Card';
import { WebDashboardAstrologyCockpit } from '../../components/WebDashboardAstrologyCockpit';
import { WebDailyBriefingCard } from '../../components/WebDailyBriefingCard';
import { WebDestinyPassportCard } from '../../components/WebDestinyPassportCard';
import { WebGocharSynopsisCard } from '../../components/WebGocharSynopsisCard';
import { WebYearlySynopsisCard } from '../../components/WebYearlySynopsisCard';
import { WebActiveKundliActions } from '../../components/WebActiveKundliActions';
import { WebHookRetentionMoments } from '../../components/WebHookRetentionMoments';
import { useLanguagePreference } from '../../lib/language-preference';
import { buildPredictaChatHref } from '../../lib/predicta-chat-cta';
import { useWebKundliLibrary } from '../../lib/use-web-kundli-library';

export default function DashboardPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const competitorCopy = getCompetitorResponseCopy(language).dashboard;
  const t = (value: string) => translateUiText(value, language);
  const { activeKundli } = useWebKundliLibrary();
  const [isFamilyFriendsVisit, setIsFamilyFriendsVisit] = useState(false);

  useEffect(() => {
    setIsFamilyFriendsVisit(
      new URLSearchParams(window.location.search).get('source') ===
        'family-friends',
    );
  }, []);

  if (!activeKundli) {
    return (
      <section className="dashboard-page">
        {isFamilyFriendsVisit ? (
          <FriendsFamilyWelcome hasKundli={false} />
        ) : null}
        <div className="page-heading">
          <h1 className="gradient-text">{competitorCopy.emptyTitle}</h1>
          <p>{competitorCopy.emptyBody}</p>
        </div>

        <section className="kundli-empty-state glass-panel">
          <div>
            <div className="section-title">{competitorCopy.firstStepEyebrow}</div>
            <h2>{competitorCopy.firstStepTitle}</h2>
            <p>{competitorCopy.firstStepBody}</p>
            <div className="kundli-empty-actions">
              <Link className="button" href="/dashboard/kundli">
                {t('Create Kundli')}
              </Link>
              <Link
                className="button secondary"
                href={buildPredictaChatHref({
                  prompt:
                    'Create my Kundli from chat. Ask me for any missing birth details one by one.',
                  sourceScreen: 'Dashboard',
                })}
              >
                {t('Let Predicta create it')}
              </Link>
            </div>
          </div>
          <details className="info-drawer kundli-empty-note">
            <summary>
              <span>{t('What happens next')}</span>
              <strong>{t('See next steps')}</strong>
            </summary>
            <p>
              {t(
                'After the Kundli is ready, Predicta will suggest today’s Gochar, today’s guidance, charts, reports, remedies, and the best next question.',
              )}
            </p>
          </details>
        </section>

        <section className="kundli-unlock-preview">
          <div className="section-heading compact-left">
            <div className="section-title">
              {competitorCopy.kundliUnlocksEyebrow}
            </div>
            <h2>{competitorCopy.kundliUnlocksTitle}</h2>
            <details className="info-drawer">
              <summary>
                <span>{competitorCopy.kundliUnlocksCompactTitle}</span>
                <strong>{competitorCopy.kundliUnlocksCompactCta}</strong>
              </summary>
              <p>{competitorCopy.kundliUnlocksCompactBody}</p>
            </details>
          </div>
          <div className="kundli-unlock-grid">
            {competitorCopy.kundliUnlocks.map(item => (
              <article className="kundli-unlock-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <Card className="save-restore-card">
          <div className="card-content spacious">
            <div className="section-title">{t('SAVED SAFELY')}</div>
            <h2>{t('Your Kundli stays protected.')}</h2>
            <details className="info-drawer">
              <summary>
                <span>{t('How your Kundli stays with you')}</span>
                <strong>{t('Open')}</strong>
              </summary>
              <p>
                {t(
                  'Predicta keeps your work ready here. Sign in when you want your Kundlis, reports, and chats with you on every device.',
                )}
              </p>
            </details>
            <div className="action-row compact">
              <Link className="button secondary" href="/dashboard/redeem-pass">
                {t('Redeem Guest Pass')}
              </Link>
              <Link className="button secondary" href="/dashboard/settings">
                {t('Privacy Settings')}
              </Link>
            </div>
          </div>
        </Card>
      </section>
    );
  }

  const dailyBriefing = composeDailyBriefing(activeKundli);
  const destinyPassport = composeDestinyPassport(activeKundli);
  const gochar = composeTransitGocharIntelligence(activeKundli, {
    depth: 'FREE',
  });
  const yearlyHoroscope = composeYearlyHoroscopeVarshaphal(activeKundli, {
    depth: 'FREE',
  });
  const purushartha = composePurusharthaLifeBalance(activeKundli);
  const personalPanchang = composePersonalPanchangLayer(activeKundli);
  const holisticDailyGuidance = composeHolisticDailyGuidance(activeKundli);
  const numerology = composeNumerologyFoundationModel(activeKundli.birthDetails);

  return (
    <section className="dashboard-page">
      {isFamilyFriendsVisit ? (
        <FriendsFamilyWelcome hasKundli />
      ) : null}
      <div className="page-heading">
        <h1 className="gradient-text">{competitorCopy.readyTitle}</h1>
        <p>{competitorCopy.readyBody}</p>
      </div>

      <section className="primary-predicta-panel glass-panel">
        <div className="primary-predicta-copy">
          <div className="section-title">
            {competitorCopy.primaryPredictaEyebrow}
          </div>
          <h2>{competitorCopy.primaryPredictaTitle}</h2>
          <p>{competitorCopy.primaryPredictaBody}</p>
          <span>{competitorCopy.primaryPredictaProof}</span>
        </div>
        <div className="primary-predicta-actions">
          <Link
            className="button"
            href={buildPredictaChatHref({
              kundli: activeKundli,
              prompt:
                'Help me ask the most useful question from my Kundli and choose the right evidence rooms.',
              sourceScreen: 'Dashboard Primary Predicta',
            })}
          >
            {competitorCopy.primaryPredictaPrimary}
          </Link>
          <Link className="button secondary" href="/dashboard/vedic">
            {competitorCopy.primaryPredictaSecondary}
          </Link>
        </div>
      </section>

      <WebActiveKundliActions
        kundli={activeKundli}
        sourceScreen="Dashboard"
      />

      <WebDashboardAstrologyCockpit
        dailyBriefing={dailyBriefing}
        gochar={gochar}
        kundli={activeKundli}
        numerology={numerology}
        personalPanchang={personalPanchang}
        purushartha={purushartha}
        yearlyHoroscope={yearlyHoroscope}
      />

      <WebHookRetentionMoments kundli={activeKundli} />

      <WebDailyBriefingCard
        briefing={dailyBriefing}
        ctaHref="/dashboard/kundli"
        holisticGuidance={holisticDailyGuidance}
      />

      <section className="outcome-entry-panel glass-panel">
        <div className="outcome-entry-head">
          <div>
            <div className="section-title">{competitorCopy.outcomeEyebrow}</div>
            <h2>{competitorCopy.outcomeTitle}</h2>
            <details className="info-drawer">
              <summary>
                <span>{competitorCopy.outcomeDrawerTitle}</span>
                <strong>{competitorCopy.outcomeDrawerCta}</strong>
              </summary>
              <p>{competitorCopy.outcomeDrawerBody}</p>
            </details>
          </div>
        </div>
        <div className="outcome-entry-grid">
          {PREDICTA_OUTCOME_ENTRIES.map(entry => (
            <Link
              className="outcome-entry-card"
              href={buildPredictaChatHref({
                kundli: activeKundli,
                prompt: entry.prompt,
                purpose: entry.id,
                selectedSection: entry.title,
                sourceScreen: 'Dashboard Outcome Entry',
              })}
              key={entry.id}
            >
              <div>
                <span className="section-title">{entry.proof}</span>
                <h3>{entry.title}</h3>
                <p>{entry.body}</p>
              </div>
              <strong>{entry.cta}</strong>
            </Link>
          ))}
        </div>
      </section>

      <div className="dashboard-synopsis-grid">
        <WebGocharSynopsisCard intelligence={gochar} />
        <WebYearlySynopsisCard intelligence={yearlyHoroscope} />
      </div>

      <WebDestinyPassportCard
        ctaHref="/dashboard/kundli"
        passport={destinyPassport}
      />

      <Card className="save-restore-card dashboard-saved-work-card">
        <div className="card-content spacious">
          <div>
            <div className="section-title">{competitorCopy.savedEyebrow}</div>
            <h2>{competitorCopy.savedTitle}</h2>
            <details className="info-drawer">
              <summary>
                <span>{competitorCopy.savedDrawerTitle}</span>
                <strong>{competitorCopy.savedDrawerCta}</strong>
              </summary>
              <p>{competitorCopy.savedDrawerBody}</p>
            </details>
          </div>
          <div className="action-row compact">
            <Link className="button secondary" href="/dashboard/saved-kundlis">
              Saved Kundlis
            </Link>
            <Link className="button secondary" href="/dashboard/family">
              Family Vault
            </Link>
            <Link className="button secondary" href="/dashboard/settings">
              Privacy Settings
            </Link>
          </div>
        </div>
      </Card>

      <section className="smart-monetization-panel glass-panel">
        <div>
          <div className="section-title">{competitorCopy.depthEyebrow}</div>
          <h2>{competitorCopy.depthTitle}</h2>
          <details className="info-drawer">
            <summary>
              <span>{competitorCopy.depthDrawerTitle}</span>
              <strong>{competitorCopy.depthDrawerCta}</strong>
            </summary>
            <p>{competitorCopy.depthDrawerBody}</p>
          </details>
        </div>
        <div className="smart-monetization-grid">
          <Link href="/dashboard/premium">
            <span>{competitorCopy.depthCards[0]?.eyebrow}</span>
            <strong>{competitorCopy.depthCards[0]?.title}</strong>
            <small>{competitorCopy.depthCards[0]?.body}</small>
          </Link>
          <Link href="/dashboard/report">
            <span>{competitorCopy.depthCards[1]?.eyebrow}</span>
            <strong>{competitorCopy.depthCards[1]?.title}</strong>
            <small>{competitorCopy.depthCards[1]?.body}</small>
          </Link>
          <Link href="/checkout?productId=pridicta_day_pass_24h">
            <span>{competitorCopy.depthCards[2]?.eyebrow}</span>
            <strong>{competitorCopy.depthCards[2]?.title}</strong>
            <small>{competitorCopy.depthCards[2]?.body}</small>
          </Link>
        </div>
      </section>
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
              ? '/dashboard/chat?sourceScreen=Private+Preview&prompt=Show+me+what+I+should+try+first+from+my+Kundli.'
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
