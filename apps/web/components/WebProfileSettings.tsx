'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { SupportedLanguage } from '@pridicta/types';
import { buildUsageDisplay } from '@pridicta/monetization';
import { translateUiText } from '@pridicta/config/uiTranslations';
import { SUPPORTED_LANGUAGE_OPTIONS } from '@pridicta/config/language';
import { AuthDialog } from './AuthDialog';
import { Card } from './Card';
import { StatusPill } from './StatusPill';
import { useLanguagePreference } from '../lib/language-preference';
import { getFirebaseWebAuth } from '../lib/firebase/client';
import { demoAccess, demoMonetization } from '../lib/demo-state';
import { loadWebKundliStore } from '../lib/web-kundli-storage';
import { loadWebAutoSaveMemory } from '../lib/web-auto-save-memory';
import {
  readWebAccountMergeState,
  WEB_ACCOUNT_MERGED_EVENT,
} from '../lib/web-account-merge';

type SettingsSnapshot = {
  accountSyncStatus?: string;
  lastReportLanguage?: SupportedLanguage;
  savedKundliCount: number;
};

export function WebProfileSettings(): React.JSX.Element {
  const {
    chartLanguage,
    language,
    predictaReplyLanguage,
    reportLanguage,
    setChartLanguage,
    setLanguage,
    setPredictaReplyLanguage,
    setReportLanguage,
  } = useLanguagePreference();
  const [user, setUser] = useState<User | null>(null);
  const [snapshot, setSnapshot] = useState<SettingsSnapshot>({
    savedKundliCount: 0,
  });
  const [busy, setBusy] = useState(false);
  const t = (value: string) => translateUiText(value, language);
  const usage = buildUsageDisplay({
    monetization: demoMonetization,
    resolvedAccess: demoAccess,
    usage: {
      dayKey: '2026-04-18',
      deepCallsToday: 0,
      monthKey: '2026-04',
      pdfsThisMonth: 0,
      questionsToday: 0,
    },
    userPlan: 'FREE',
  });

  useEffect(() => {
    refreshSnapshot();

    function handleRefresh() {
      refreshSnapshot();
    }

    window.addEventListener(WEB_ACCOUNT_MERGED_EVENT, handleRefresh);
    window.addEventListener('pridicta:web-kundli-updated', handleRefresh);
    window.addEventListener('pridicta:web-auto-save-memory-updated', handleRefresh);

    let unsubscribe: (() => void) | undefined;
    try {
      unsubscribe = onAuthStateChanged(getFirebaseWebAuth(), nextUser => {
        setUser(nextUser);
        refreshSnapshot();
      });
    } catch {
      unsubscribe = undefined;
    }

    return () => {
      window.removeEventListener(WEB_ACCOUNT_MERGED_EVENT, handleRefresh);
      window.removeEventListener('pridicta:web-kundli-updated', handleRefresh);
      window.removeEventListener(
        'pridicta:web-auto-save-memory-updated',
        handleRefresh,
      );
      unsubscribe?.();
    };
  }, []);

  function refreshSnapshot(): void {
    const kundliStore = loadWebKundliStore();
    const memory = loadWebAutoSaveMemory();
    const mergeState = readWebAccountMergeState();

    setSnapshot({
      accountSyncStatus: mergeState?.accountSyncStatus,
      lastReportLanguage: memory.report?.reportLanguage,
      savedKundliCount: kundliStore.savedKundlis.length,
    });
  }

  async function handleSignOut(): Promise<void> {
    try {
      setBusy(true);
      await signOut(getFirebaseWebAuth());
      setUser(null);
      refreshSnapshot();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="dashboard-page">
      <div className="page-heading compact">
        <StatusPill label={usage.statusText} tone="quiet" />
        <h1 className="gradient-text">{t('Profile and settings')}</h1>
        <details className="info-drawer">
          <summary>
            <span>{t('What you can manage')}</span>
            <strong>{t('Open')}</strong>
          </summary>
          <p>
            {t(
              'Manage sign-in, saved Kundlis, language, reports, passes, privacy, and comfort settings from one place.',
            )}
          </p>
        </details>
      </div>

      <div className="settings-layout">
        <Card className="glass-panel settings-card">
          <div className="card-content spacious">
            <div className="section-title">{t('ACCOUNT')}</div>
            <h2>{user ? t('Signed in profile') : t('Guest profile')}</h2>
            <p>
              {user
                ? t('Your Kundli work can stay connected with this account.')
                : t('You can start as a guest. Sign in when you want more saved Kundlis and safer restore later.')}
            </p>
            <div className="settings-stack">
              <div className="setting-row">
                <div>
                  <strong>{t('Email')}</strong>
                  <span>{user?.email ?? t('Not signed in yet')}</span>
                </div>
                {user ? (
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={handleSignOut}
                    type="button"
                  >
                    {busy ? t('Please wait...') : t('Sign Out')}
                  </button>
                ) : (
                  <AuthDialog />
                )}
              </div>
              <div className="setting-row">
                <div>
                  <strong>{t('Kundli Library')}</strong>
                  <span>
                    {user
                      ? t('Multiple Kundlis are available for this account.')
                      : t('Guest access keeps one Kundli safe here.')}
                  </span>
                </div>
                <StatusPill
                  label={`${snapshot.savedKundliCount} ${t('saved')}`}
                  tone="quiet"
                />
              </div>
              <div className="setting-row">
                <div>
                  <strong>{t('Account continuity')}</strong>
                  <span>
                    {user
                      ? getSyncCopy(snapshot.accountSyncStatus, t)
                      : t('Sign in to keep Kundlis, choices, and chats with your account.')}
                  </span>
                </div>
                <Link className="button secondary" href="/dashboard/saved-kundlis">
                  {t('Open Library')}
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">{t('LANGUAGE')}</div>
            <h2>{t('Choose how Predicta speaks and displays charts.')}</h2>
            <p>
              {t(
                'App language, chart language, report language, and chat reply language stay separate.',
              )}
            </p>
            <div className="settings-stack">
              <LanguageSettingRow
                label={t('App language')}
                selected={language}
                onSelect={setLanguage}
              />
              <LanguageSettingRow
                label={t('Chart language')}
                selected={chartLanguage}
                onSelect={setChartLanguage}
              />
              <LanguageSettingRow
                label={t('Report language')}
                selected={reportLanguage}
                onSelect={setReportLanguage}
              />
              <LanguageSettingRow
                label={t('Predicta reply language')}
                selected={predictaReplyLanguage}
                onSelect={setPredictaReplyLanguage}
              />
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">{t('ACCESS')}</div>
            <h2>{usage.statusText}</h2>
            <p>
              {usage.questionsText}. {usage.pdfText}. {usage.deepReadingsText}.
            </p>
            <div className="settings-stack">
              <div className="setting-row">
                <div>
                  <strong>{t('Premium')}</strong>
                  <span>{t('Review subscriptions and one-time report options.')}</span>
                </div>
                <Link className="button secondary" href="/dashboard/premium">
                  {t('View Premium')}
                </Link>
              </div>
              <div className="setting-row">
                <div>
                  <strong>{t('Guest pass')}</strong>
                  <span>{t('Redeem a private invite using the approved email.')}</span>
                </div>
                <Link className="button" href="/dashboard/redeem-pass">
                  {t('Redeem')}
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">{t('PRIVACY')}</div>
            <h2>{t('Private by default')}</h2>
            <p>
              {t(
                'Your saved Kundli, report choices, and language choices stay ready here and move into your account after sign-in.',
              )}
            </p>
            <div className="settings-stack">
              <div className="setting-row">
                <div>
                  <strong>{t('Report preference')}</strong>
                  <span>
                    {snapshot.lastReportLanguage
                      ? `${t('Last report language')}: ${getLanguageName(snapshot.lastReportLanguage)}`
                      : t('No report preference saved yet.')}
                  </span>
                </div>
                <Link className="button secondary" href="/dashboard/report">
                  {t('Reports')}
                </Link>
              </div>
              <div className="setting-row">
                <div>
                  <strong>{t('Chat sessions')}</strong>
                  <span>
                    {user
                      ? t('Multiple chat sessions are available from your account.')
                      : t('Guests use one active chat. Sign in for multiple sessions.')}
                  </span>
                </div>
                <Link className="button secondary" href="/dashboard/chat">
                  {t('Open Chat')}
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function LanguageSettingRow({
  label,
  onSelect,
  selected,
}: {
  label: string;
  onSelect: (language: SupportedLanguage) => void;
  selected: SupportedLanguage;
}): React.JSX.Element {
  return (
    <div className="setting-row language-setting-row profile-language-row">
      <div>
        <strong>{label}</strong>
        <span>{getLanguageName(selected)}</span>
      </div>
      <div className="language-options compact-language-options">
        {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
          <button
            className={selected === option.code ? 'selected' : ''}
            key={option.code}
            onClick={() => onSelect(option.code)}
            type="button"
          >
            {option.nativeName}
          </button>
        ))}
      </div>
    </div>
  );
}

function getLanguageName(language: SupportedLanguage): string {
  return (
    SUPPORTED_LANGUAGE_OPTIONS.find(option => option.code === language)
      ?.nativeName ?? 'English'
  );
}

function getSyncCopy(
  status: string | undefined,
  t: (value: string) => string,
): string {
  if (status === 'ACCOUNT_SYNCED') {
    return t('Your guest Kundli has been connected with this account.');
  }
  if (status === 'ACCOUNT_SYNC_FAILED') {
    return t('Your Kundli is safe here. Account restore will retry later.');
  }
  return t('Your guest Kundli is ready for this account.');
}
