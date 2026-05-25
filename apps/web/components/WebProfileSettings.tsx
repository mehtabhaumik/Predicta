'use client';

import { getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type {
  PredictaStylePreference,
  SupportedLanguage,
} from '@pridicta/types';
import { SUPPORTED_LANGUAGE_OPTIONS } from '@pridicta/config/language';
import { AuthDialog } from './AuthDialog';
import { Card } from './Card';
import { StatusPill } from './StatusPill';
import { useLanguagePreference } from '../lib/language-preference';
import { getFirebaseWebAuth } from '../lib/firebase/client';
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

type SettingsCopy = {
  accessBody: string;
  accessTitle: string;
  accountContinuity: string;
  accountReady: string;
  accountRestoreFailed: string;
  accountSynced: string;
  accountTitle: string;
  appLanguage: string;
  chartLanguage: string;
  chatSessions: string;
  chooseDepth: string;
  currentAccount: string;
  drawerAction: string;
  drawerBody: string;
  drawerEyebrow: string;
  guestChats: string;
  guestMode: string;
  guestModeBody: string;
  guestModeLibrary: string;
  guestReady: string;
  guestSignInPrompt: string;
  heading: string;
  keepSeparate: string;
  kundliLibrary: string;
  languageControl: string;
  lastReportLanguage: string;
  libraryBody: string;
  multipleChats: string;
  multipleKundlis: string;
  noReportPreference: string;
  notChosenYet: string;
  notSignedInYet: string;
  oneTimeReports: string;
  openChat: string;
  openLibrary: string;
  pageBody: string;
  premiumBody: string;
  premiumTitle: string;
  privacyBody: string;
  privacyTitle: string;
  privateByDefault: string;
  privatePass: string;
  privatePassBody: string;
  profileState: string;
  predictaReplyLanguage: string;
  predictaStyle: string;
  redeem: string;
  reportLanguage: string;
  reportPreference: string;
  reportStateBody: string;
  reports: string;
  reportsAndAccess: string;
  saved: string;
  savedWork: string;
  savedWorkBody: string;
  signOut: string;
  signOutBusy: string;
  signedInBody: string;
  signedInReady: string;
  startFree: string;
  styleHelper: string;
  usagePill: string;
  usageSummary: string;
  viewPremium: string;
};

const SETTINGS_COPY: Record<SupportedLanguage, SettingsCopy> = {
  en: {
    accessBody:
      'Use this page to keep sign-in, saved Kundlis, report language, private access, and recovery choices calm and clear.',
    accessTitle: 'Reports and access',
    accountContinuity: 'Account continuity',
    accountReady: 'Account ready',
    accountRestoreFailed: 'Your Kundli is safe here. Account restore will retry later.',
    accountSynced: 'Your guest Kundli has been connected with this account.',
    accountTitle: 'Account continuity',
    appLanguage: 'App language',
    chartLanguage: 'Chart language',
    chatSessions: 'Chat sessions',
    chooseDepth: 'Choose more depth only after free value is clear.',
    currentAccount: 'Current account',
    drawerAction: 'Open',
    drawerBody:
      'Use this page to keep sign-in, saved Kundlis, report language, private access, and recovery choices calm and clear.',
    drawerEyebrow: 'What stays here',
    guestChats: 'Guests use one active chat. Sign in for multiple sessions.',
    guestMode: 'Guest mode',
    guestModeBody:
      'You can keep one Kundli safely as a guest, then sign in when you want continuity.',
    guestModeLibrary: 'Guest mode keeps one Kundli safe here until you sign in.',
    guestReady: 'Your guest Kundli is ready for this account.',
    guestSignInPrompt:
      'Sign in once to keep Kundlis, report choices, and chats with your account.',
    heading: 'Account, language, and access',
    keepSeparate: 'Keep app, chart, report, and chat language separate.',
    kundliLibrary: 'Kundli Library',
    languageControl: 'Language control',
    lastReportLanguage: 'Last report language',
    libraryBody:
      'Library, report choices, and current chat continuity stay attached to this device or account.',
    multipleChats: 'Multiple chat sessions are available from your account.',
    multipleKundlis: 'Multiple Kundlis can stay with this account.',
    noReportPreference: 'No report preference saved yet.',
    notChosenYet: 'Not chosen yet',
    notSignedInYet: 'Not signed in yet',
    oneTimeReports: 'Premium and one-time reports',
    openChat: 'Open Chat',
    openLibrary: 'Open Library',
    pageBody:
      'Change only the surface you want. Predicta does not have to change everything at once.',
    premiumBody:
      'Review subscriptions, Day Pass, and polished report paths without pressure.',
    premiumTitle: 'Premium and one-time reports',
    privacyBody:
      'Saved Kundlis, report choices, and language preferences stay ready here and can move into your account after sign-in.',
    privacyTitle: 'Privacy and restore',
    privateByDefault: 'Private by default, with calm recovery later.',
    privatePass: 'Private pass',
    privatePassBody:
      'Redeem a private invite with the approved email used for that pass.',
    profileState: 'Profile state',
    predictaReplyLanguage: 'Predicta reply language',
    predictaStyle: 'Predicta tone style',
    redeem: 'Redeem',
    reportLanguage: 'Report language',
    reportPreference: 'Report preference',
    reportStateBody:
      'Reports keep their own language without changing the rest of the app.',
    reports: 'Reports',
    reportsAndAccess: 'Reports and access',
    saved: 'saved',
    savedWork: 'Saved work',
    savedWorkBody:
      'Library, report choices, and current chat continuity stay attached to this device or account.',
    signOut: 'Sign Out',
    signOutBusy: 'Please wait...',
    signedInBody:
      'Your Kundli work, report choices, and saved chats stay with this account.',
    signedInReady: 'Signed in and ready',
    startFree: 'Start free, then protect your work',
    styleHelper:
      'Set the default tone once. Predicta still obeys explicit signals in the current message.',
    usagePill: 'Keep access clean',
    usageSummary:
      'Free keeps daily guidance and report preview useful. Premium adds deeper readings, saved continuity, and polished report depth.',
    viewPremium: 'View Premium',
  },
  hi: {
    accessBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.a6731daf97"),
    accessTitle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.474e2f3753"),
    accountContinuity: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.39ef6af708"),
    accountReady: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.ff5a69fb24"),
    accountRestoreFailed:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.ace4d6dc56"),
    accountSynced: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.bb8e689e0f"),
    accountTitle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.39ef6af708"),
    appLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.f4a7c54c92"),
    chartLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.099ec5792c"),
    chatSessions: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.e4b700040d"),
    chooseDepth: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.eb80765af2"),
    currentAccount: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.6bea6d3b30"),
    drawerAction: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.901879c422"),
    drawerBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.a6731daf97"),
    drawerEyebrow: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.b0ed0feaf4"),
    guestChats: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.320004b3d4"),
    guestMode: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.6c634c5814"),
    guestModeBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.10b7b4be85"),
    guestModeLibrary:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.c8e17f677c"),
    guestReady: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.bf2170a819"),
    guestSignInPrompt:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.1b819f55d9"),
    heading: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.641778ac5e"),
    keepSeparate: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.092ce017d5"),
    kundliLibrary: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.66249ce6af"),
    languageControl: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.e501da6b0b"),
    lastReportLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.9e39747025"),
    libraryBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.431c914859"),
    multipleChats: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.7289e7f56d"),
    multipleKundlis: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.14161d7add"),
    noReportPreference: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.fafa0cfda0"),
    notChosenYet: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.dc33c4aca3"),
    notSignedInYet: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.ee7b30a0c4"),
    oneTimeReports: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.81aa8e9828"),
    openChat: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.6cc0093632"),
    openLibrary: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.5528c606cb"),
    pageBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.a13c29f892"),
    premiumBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.0464e90ccc"),
    premiumTitle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.81aa8e9828"),
    privacyBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.fe90d7a33d"),
    privacyTitle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.27913d923f"),
    privateByDefault: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.2e53feefa3"),
    privatePass: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.b6895c451d"),
    privatePassBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.4db17f4d2e"),
    profileState: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.193d989a4d"),
    predictaReplyLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.4339b4a3a2"),
    predictaStyle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.3de5541fb3"),
    redeem: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.2f9782442e"),
    reportLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.593dbb24c0"),
    reportPreference: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.338f69faf8"),
    reportStateBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.7acf5b9815"),
    reports: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.89a0ae86a5"),
    reportsAndAccess: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.474e2f3753"),
    saved: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.6dcff641a7"),
    savedWork: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.05fd9fe16d"),
    savedWorkBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.431c914859"),
    signOut: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.6fe87913b6"),
    signOutBusy: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.77a27046c4"),
    signedInBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.e8a6377473"),
    signedInReady: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.45058603d3"),
    startFree: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.8f6f9926be"),
    styleHelper:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.df6d9a5415"),
    usagePill: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.c525975fea"),
    usageSummary:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.a6d7ed9ee9"),
    viewPremium: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.58c75c2e00"),
  },
  gu: {
    accessBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.3e71aa3215"),
    accessTitle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.dbb559e5d0"),
    accountContinuity: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.dd6487c135"),
    accountReady: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.e31ed1876c"),
    accountRestoreFailed:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.0406e143ef"),
    accountSynced: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.6e669b9a2e"),
    accountTitle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.dd6487c135"),
    appLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.f516a47baa"),
    chartLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.61f1e652e0"),
    chatSessions: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.0dcd277a88"),
    chooseDepth: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.43c6d99d2e"),
    currentAccount: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.4b14dd69b9"),
    drawerAction: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.e0185a82d6"),
    drawerBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.3e71aa3215"),
    drawerEyebrow: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.53aa633e34"),
    guestChats: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.912c227374"),
    guestMode: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.bbc4a0fd8a"),
    guestModeBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.e5108ae8ac"),
    guestModeLibrary:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.c477c42101"),
    guestReady: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.777a802df0"),
    guestSignInPrompt:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.6ea3d93578"),
    heading: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.d0bc2c284b"),
    keepSeparate: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.dcb3d3e318"),
    kundliLibrary: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.69e24edda7"),
    languageControl: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.17e102819e"),
    lastReportLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.14f8152a05"),
    libraryBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.0e8cdcc38b"),
    multipleChats: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.2b404d6ec1"),
    multipleKundlis: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.0001faea76"),
    noReportPreference: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.db2a766847"),
    notChosenYet: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.1c08ffd7d1"),
    notSignedInYet: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.57259beda0"),
    oneTimeReports: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.048f43cdff"),
    openChat: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.9648eba94c"),
    openLibrary: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.c621b91547"),
    pageBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.dd4016a58d"),
    premiumBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.1913a7b334"),
    premiumTitle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.048f43cdff"),
    privacyBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.5ed8f3e42a"),
    privacyTitle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.8180cd0189"),
    privateByDefault: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.2aa7b86ffd"),
    privatePass: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.f73b66205c"),
    privatePassBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.75299cc037"),
    profileState: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.839aa44de2"),
    predictaReplyLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.118174aeb5"),
    predictaStyle: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.467673ba10"),
    redeem: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.5efa721933"),
    reportLanguage: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.8d40c699f7"),
    reportPreference: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.912f16de9b"),
    reportStateBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.06122c721d"),
    reports: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.d6aa714c20"),
    reportsAndAccess: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.dbb559e5d0"),
    saved: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.f2547c79fb"),
    savedWork: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.b8973d03a4"),
    savedWorkBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.0e8cdcc38b"),
    signOut: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.ed53d0da2a"),
    signOutBusy: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.2dd10567cd"),
    signedInBody:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.08743b257d"),
    signedInReady: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.9b9c58dbf1"),
    startFree: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.faf51f6847"),
    styleHelper:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.8e04d8aff9"),
    usagePill: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.4cc03e8647"),
    usageSummary:
      getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.0c70efadd0"),
    viewPremium: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.23df8c32af"),
  },
};

export function WebProfileSettings(): React.JSX.Element {
  const {
    chartLanguage,
    language,
    predictaReplyLanguage,
    predictaStylePreference,
    reportLanguage,
    setChartLanguage,
    setLanguage,
    setPredictaReplyLanguage,
    setPredictaStylePreference,
    setReportLanguage,
  } = useLanguagePreference();
  const copy = SETTINGS_COPY[language] ?? SETTINGS_COPY.en;
  const [user, setUser] = useState<User | null>(null);
  const [snapshot, setSnapshot] = useState<SettingsSnapshot>({
    savedKundliCount: 0,
  });
  const [busy, setBusy] = useState(false);
  const accountStateLabel = user ? copy.accountReady : copy.guestMode;
  const lastReportLanguageLabel = snapshot.lastReportLanguage
    ? getLanguageName(snapshot.lastReportLanguage, language)
    : copy.notChosenYet;

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
        <StatusPill label={copy.usagePill} tone="quiet" />
        <h1 className="gradient-text">{copy.heading}</h1>
        <details className="info-drawer">
          <summary>
            <span>{copy.drawerEyebrow}</span>
            <strong>{copy.drawerAction}</strong>
          </summary>
          <p>{copy.drawerBody}</p>
        </details>
      </div>

      <section className="glass-panel settings-overview-panel">
        <div className="settings-overview-card">
          <span>{copy.profileState}</span>
          <strong>{accountStateLabel}</strong>
          <p>{user ? copy.signedInBody : copy.guestModeBody}</p>
        </div>
        <div className="settings-overview-card">
          <span>{copy.reportLanguage}</span>
          <strong>{lastReportLanguageLabel}</strong>
          <p>{copy.reportStateBody}</p>
        </div>
        <div className="settings-overview-card">
          <span>{copy.savedWork}</span>
          <strong>{`${snapshot.savedKundliCount} ${copy.saved}`}</strong>
          <p>{copy.savedWorkBody}</p>
        </div>
      </section>

      <div className="settings-layout">
        <Card className="glass-panel settings-card">
          <div className="card-content spacious">
            <div className="section-title">{copy.accountTitle}</div>
            <h2>{user ? copy.signedInReady : copy.startFree}</h2>
            <p>{user ? copy.signedInBody : copy.guestModeBody}</p>
            <div className="settings-stack">
              <div className="setting-row">
                <div>
                  <strong>{copy.currentAccount}</strong>
                  <span>{user?.email ?? copy.notSignedInYet}</span>
                </div>
                {user ? (
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={handleSignOut}
                    type="button"
                  >
                    {busy ? copy.signOutBusy : copy.signOut}
                  </button>
                ) : (
                  <AuthDialog />
                )}
              </div>
              <div className="setting-row">
                <div>
                  <strong>{copy.kundliLibrary}</strong>
                  <span>{user ? copy.multipleKundlis : copy.guestModeLibrary}</span>
                </div>
                <StatusPill
                  label={`${snapshot.savedKundliCount} ${copy.saved}`}
                  tone="quiet"
                />
              </div>
              <div className="setting-row">
                <div>
                  <strong>{copy.accountContinuity}</strong>
                  <span>
                    {user
                      ? getSyncCopy(snapshot.accountSyncStatus, copy)
                      : copy.guestSignInPrompt}
                  </span>
                </div>
                <Link className="button secondary" href="/dashboard/saved-kundlis">
                  {copy.openLibrary}
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">{copy.languageControl}</div>
            <h2>{copy.keepSeparate}</h2>
            <p>{copy.pageBody}</p>
            <div className="settings-stack">
              <LanguageSettingRow
                label={copy.appLanguage}
                onSelect={setLanguage}
                selected={language}
                uiLanguage={language}
              />
              <LanguageSettingRow
                label={copy.chartLanguage}
                onSelect={setChartLanguage}
                selected={chartLanguage}
                uiLanguage={language}
              />
              <LanguageSettingRow
                label={copy.reportLanguage}
                onSelect={setReportLanguage}
                selected={reportLanguage}
                uiLanguage={language}
              />
              <LanguageSettingRow
                label={copy.predictaReplyLanguage}
                onSelect={setPredictaReplyLanguage}
                selected={predictaReplyLanguage}
                uiLanguage={language}
              />
              <PredictaStyleSettingRow
                helper={copy.styleHelper}
                label={copy.predictaStyle}
                onSelect={setPredictaStylePreference}
                selected={predictaStylePreference}
                uiLanguage={language}
              />
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">{copy.reportsAndAccess}</div>
            <h2>{copy.chooseDepth}</h2>
            <p>{copy.usageSummary}</p>
            <div className="settings-stack">
              <div className="setting-row">
                <div>
                  <strong>{copy.oneTimeReports}</strong>
                  <span>{copy.premiumBody}</span>
                </div>
                <Link className="button secondary" href="/dashboard/premium">
                  {copy.viewPremium}
                </Link>
              </div>
              <div className="setting-row">
                <div>
                  <strong>{copy.privatePass}</strong>
                  <span>{copy.privatePassBody}</span>
                </div>
                <Link className="button" href="/dashboard/redeem-pass">
                  {copy.redeem}
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <Card className="settings-card">
          <div className="card-content spacious">
            <div className="section-title">{copy.privacyTitle}</div>
            <h2>{copy.privateByDefault}</h2>
            <p>{copy.privacyBody}</p>
            <div className="settings-stack">
              <div className="setting-row">
                <div>
                  <strong>{copy.reportPreference}</strong>
                  <span>
                    {snapshot.lastReportLanguage
                      ? `${copy.lastReportLanguage}: ${getLanguageName(snapshot.lastReportLanguage, language)}`
                      : copy.noReportPreference}
                  </span>
                </div>
                <Link className="button secondary" href="/dashboard/report">
                  {copy.reports}
                </Link>
              </div>
              <div className="setting-row">
                <div>
                  <strong>{copy.chatSessions}</strong>
                  <span>{user ? copy.multipleChats : copy.guestChats}</span>
                </div>
                <Link className="button secondary" href="/dashboard/vedic/chat">
                  {copy.openChat}
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
  uiLanguage,
}: {
  label: string;
  onSelect: (language: SupportedLanguage) => void;
  selected: SupportedLanguage;
  uiLanguage: SupportedLanguage;
}): React.JSX.Element {
  return (
    <div className="setting-row language-setting-row profile-language-row">
      <div>
        <strong>{label}</strong>
        <span>{getLanguageName(selected, uiLanguage)}</span>
      </div>
      <div className="language-options compact-language-options">
        {SUPPORTED_LANGUAGE_OPTIONS.map(option => (
          <button
            className={selected === option.code ? 'selected' : ''}
            key={option.code}
            onClick={() => onSelect(option.code)}
            type="button"
          >
            {getLanguageName(option.code, uiLanguage)}
          </button>
        ))}
      </div>
    </div>
  );
}

function PredictaStyleSettingRow({
  helper,
  label,
  onSelect,
  selected,
  uiLanguage,
}: {
  helper: string;
  label: string;
  onSelect: (style: PredictaStylePreference) => void;
  selected: PredictaStylePreference;
  uiLanguage: SupportedLanguage;
}): React.JSX.Element {
  const options = getPredictaStyleOptions(uiLanguage);
  const selectedOption =
    options.find(option => option.value === selected) ?? options[0];

  return (
    <div className="setting-row language-setting-row profile-language-row">
      <div>
        <strong>{label}</strong>
        <span>{selectedOption.description}</span>
      </div>
      <div className="language-options compact-language-options">
        {options.map(option => (
          <button
            className={selected === option.value ? 'selected' : ''}
            key={option.value}
            onClick={() => onSelect(option.value)}
            type="button"
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
      <small>{helper}</small>
    </div>
  );
}

function getPredictaStyleOptions(
  language: SupportedLanguage,
): Array<{
  description: string;
  label: string;
  value: PredictaStylePreference;
}> {
  if (language === 'hi') {
    return [
      {
        description: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.aa0444ea5e"),
        label: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.f7c78e24a3"),
        value: 'balanced',
      },
      {
        description: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.79d086e204"),
        label: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.9ef8604c00"),
        value: 'devotional',
      },
      {
        description: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.9d76245605"),
        label: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.1d93c53c90"),
        value: 'secular',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        description: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.45863ce969"),
        label: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.368f2e1772"),
        value: 'balanced',
      },
      {
        description: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.7b23b4e0c7"),
        label: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.19b08e4fc8"),
        value: 'devotional',
      },
      {
        description: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.761c78cf89"),
        label: getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.0ec3b79272"),
        value: 'secular',
      },
    ];
  }

  return [
    {
      description: 'Warm, balanced, and signal-based.',
      label: 'Balanced',
      value: 'balanced',
    },
    {
      description: 'More devotional when the user welcomes it.',
      label: 'Devotional',
      value: 'devotional',
    },
    {
      description: 'More neutral, practical, and non-religious.',
      label: 'Secular',
      value: 'secular',
    },
  ];
}

function getLanguageName(
  language: SupportedLanguage,
  uiLanguage: SupportedLanguage,
): string {
  if (uiLanguage === 'hi') {
    if (language === 'en') {
      return getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.3a7369a641");
    }
    if (language === 'hi') {
      return getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.cff4c47628");
    }
    return getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.073960263e");
  }

  if (uiLanguage === 'gu') {
    if (language === 'en') {
      return getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.e8831dd929");
    }
    if (language === 'hi') {
      return getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.a123b8bbf1");
    }
    return getNativeCopy("native.apps.web.components.WebProfileSettings.tsx.073960263e");
  }

  const option = SUPPORTED_LANGUAGE_OPTIONS.find(item => item.code === language);

  return option?.nativeName ?? 'English';
}

function getSyncCopy(
  status: string | undefined,
  copy: SettingsCopy,
): string {
  if (status === 'ACCOUNT_SYNCED') {
    return copy.accountSynced;
  }
  if (status === 'ACCOUNT_SYNC_FAILED') {
    return copy.accountRestoreFailed;
  }
  return copy.guestReady;
}
