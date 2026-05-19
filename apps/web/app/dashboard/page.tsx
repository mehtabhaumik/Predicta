'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { useLanguagePreference } from '../../lib/language-preference';
import { buildPredictaChatHref } from '../../lib/predicta-chat-cta';
import { useWebKundliLibrary } from '../../lib/use-web-kundli-library';

const kundliUnlocks = [
  {
    body: 'Personal Gochar, Panchang, best action, caution, and emotional weather.',
    title: 'Today for you',
  },
  {
    body: 'Dasha, Sade Sati, yearly timing, and the next important window.',
    title: 'Timing map',
  },
  {
    body: 'D1, D9, D10, Chalit, KP, and chart proof explained simply.',
    title: 'Charts',
  },
  {
    body: 'Career, marriage, wealth, remedies, and full Kundli PDF previews.',
    title: 'Reports',
  },
  {
    body: 'Karma-based practices tied to active planets and daily discipline.',
    title: 'Remedies',
  },
  {
    body: 'Saved family profiles, comparison, and shared pattern guidance.',
    title: 'Family Vault',
  },
] as const;

export default function DashboardPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
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
          <h1 className="gradient-text">{t('Start with your Kundli.')}</h1>
          <p>
            {t(
              'Create the chart once. Then Predicta opens personal Gochar, timing, charts, remedies, reports, and chat guidance without making you hunt for features.',
            )}
          </p>
        </div>

        <section className="kundli-empty-state glass-panel">
          <div>
            <div className="section-title">{t('FIRST STEP')}</div>
            <h2>{t('Create your Kundli first.')}</h2>
            <p>
              {t(
                'Use the form if you know the details. Use Predicta chat if you want her to ask for birth details one by one.',
              )}
            </p>
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
            <div className="section-title">{t('AFTER KUNDLI IS READY')}</div>
            <h2>{t('These sections will open with real chart data.')}</h2>
            <details className="info-drawer">
              <summary>
                <span>{t('Why compact?')}</span>
                <strong>{t('Read')}</strong>
              </summary>
              <p>
                {t(
                  'They stay compact for now so the dashboard does not look broken or noisy before birth details are available.',
                )}
              </p>
            </details>
          </div>
          <div className="kundli-unlock-grid">
            {kundliUnlocks.map(item => (
              <article className="kundli-unlock-card" key={item.title}>
                <h3>{t(item.title)}</h3>
                <p>{t(item.body)}</p>
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
        <h1 className="gradient-text">
          {activeKundli
            ? 'Your holistic astrology cockpit.'
            : 'Start with your Kundli.'}
        </h1>
        <p>
          {activeKundli
            ? 'See today, timing, Gochar, remedies, and the best next chart focus.'
            : 'Create the chart, read the summary, then ask one clear question.'}
        </p>
      </div>

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

      <WebDailyBriefingCard
        briefing={dailyBriefing}
        ctaHref="/dashboard/kundli"
        holisticGuidance={holisticDailyGuidance}
      />

      <section className="outcome-entry-panel glass-panel">
        <div className="outcome-entry-head">
          <div>
            <div className="section-title">START WITH LIFE NEED</div>
            <h2>What do you need help with?</h2>
            <details className="info-drawer">
              <summary>
                <span>How this works</span>
                <strong>Open</strong>
              </summary>
              <p>
                Pick a life area. Predicta will use your Kundli when available
                and keep the reading proof-based.
              </p>
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
            <div className="section-title">SAVED WORK</div>
            <h2>Your Kundlis stay under your control.</h2>
            <details className="info-drawer">
              <summary>
                <span>What is saved?</span>
                <strong>Open</strong>
              </summary>
              <p>
                Keep profiles, reports, and family charts organized without
                crowding today’s guidance.
              </p>
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
          <div className="section-title">WHEN YOU WANT MORE DEPTH</div>
          <h2>Upgrade only after the free reading helps.</h2>
          <details className="info-drawer">
            <summary>
              <span>Why upgrade?</span>
              <strong>Open</strong>
            </summary>
            <p>
              Free stays useful. Paid options are for deeper timing, polished
              PDFs, monthly planning, and longer guidance when you actually need
              them.
            </p>
          </details>
        </div>
        <div className="smart-monetization-grid">
          <Link href="/dashboard/premium">
            <span>Ongoing guidance</span>
            <strong>Premium</strong>
            <small>Deeper chat, Life Calendar, remedies, and reports.</small>
          </Link>
          <Link href="/dashboard/report">
            <span>One polished file</span>
            <strong>PDF report</strong>
            <small>Best for Kundli, career, marriage, wealth, or Sade Sati.</small>
          </Link>
          <Link href="/checkout?productId=pridicta_day_pass_24h">
            <span>Try first</span>
            <strong>Day Pass</strong>
            <small>Use premium depth for 24 hours before subscribing.</small>
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
