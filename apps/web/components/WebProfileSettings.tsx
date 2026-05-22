'use client';

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
      'इस पेज से साइन इन, सेव कुंडली, रिपोर्ट भाषा, निजी प्रवेश और रिकवरी को शांत और साफ रखें.',
    accessTitle: 'रिपोर्ट और प्रवेश',
    accountContinuity: 'खाता निरंतरता',
    accountReady: 'खाता तैयार',
    accountRestoreFailed:
      'आपकी कुंडली यहां सुरक्षित है. खाता पुनर्स्थापना बाद में फिर कोशिश करेगी.',
    accountSynced: 'आपकी गेस्ट कुंडली इस खाते से जुड़ गई है.',
    accountTitle: 'खाता निरंतरता',
    appLanguage: 'ऐप भाषा',
    chartLanguage: 'चार्ट भाषा',
    chatSessions: 'चैट सत्र',
    chooseDepth: 'ज्यादा गहराई तभी चुनें जब मुफ्त मूल्य साफ हो जाए.',
    currentAccount: 'वर्तमान खाता',
    drawerAction: 'खोलें',
    drawerBody:
      'इस पेज से साइन इन, सेव कुंडली, रिपोर्ट भाषा, निजी प्रवेश और रिकवरी को शांत और साफ रखें.',
    drawerEyebrow: 'यहां क्या रहता है',
    guestChats: 'गेस्ट एक सक्रिय चैट रखते हैं. कई सत्रों के लिए साइन इन करें.',
    guestMode: 'गेस्ट मोड',
    guestModeBody:
      'आप गेस्ट के रूप में एक कुंडली सुरक्षित रख सकते हैं, फिर निरंतरता चाहिए तो साइन इन करें.',
    guestModeLibrary:
      'गेस्ट मोड यहां एक कुंडली सुरक्षित रखता है जब तक आप साइन इन न करें.',
    guestReady: 'आपकी गेस्ट कुंडली इस खाते के लिए तैयार है.',
    guestSignInPrompt:
      'एक बार साइन इन करें ताकि कुंडली, रिपोर्ट पसंद और चैट आपके खाते के साथ रहें.',
    heading: 'खाता, भाषा और प्रवेश',
    keepSeparate: 'ऐप, चार्ट, रिपोर्ट और चैट भाषा अलग रखें.',
    kundliLibrary: 'कुंडली लाइब्रेरी',
    languageControl: 'भाषा नियंत्रण',
    lastReportLanguage: 'पिछली रिपोर्ट भाषा',
    libraryBody:
      'लाइब्रेरी, रिपोर्ट पसंद और मौजूदा चैट निरंतरता इस डिवाइस या खाते से जुड़ी रहती है.',
    multipleChats: 'आपके खाते से कई चैट सत्र उपलब्ध हैं.',
    multipleKundlis: 'इस खाते में कई कुंडलियां रह सकती हैं.',
    noReportPreference: 'अभी कोई रिपोर्ट पसंद सेव नहीं है.',
    notChosenYet: 'अभी नहीं चुना',
    notSignedInYet: 'अभी साइन इन नहीं है',
    oneTimeReports: 'प्रीमियम और एक बार की रिपोर्ट',
    openChat: 'चैट खोलें',
    openLibrary: 'लाइब्रेरी खोलें',
    pageBody:
      'सिर्फ वही सतह बदलें जो चाहिए. प्रेडिक्टा को सब कुछ एक साथ बदलने की जरूरत नहीं है.',
    premiumBody:
      'सदस्यता, डे पास और तैयार रिपोर्ट रास्ते बिना दबाव के देखें.',
    premiumTitle: 'प्रीमियम और एक बार की रिपोर्ट',
    privacyBody:
      'सेव कुंडली, रिपोर्ट पसंद और भाषा पसंद यहां तैयार रहती हैं और साइन इन के बाद आपके खाते में जा सकती हैं.',
    privacyTitle: 'गोपनीयता और पुनर्स्थापना',
    privateByDefault: 'डिफॉल्ट रूप से निजी, और बाद में शांत रिकवरी.',
    privatePass: 'निजी पास',
    privatePassBody:
      'उस पास के लिए स्वीकृत ईमेल से निजी निमंत्रण उपयोग करें.',
    profileState: 'प्रोफाइल स्थिति',
    predictaReplyLanguage: 'प्रेडिक्टा जवाब भाषा',
    predictaStyle: 'प्रेडिक्टा शैली',
    redeem: 'उपयोग करें',
    reportLanguage: 'रिपोर्ट भाषा',
    reportPreference: 'रिपोर्ट पसंद',
    reportStateBody:
      'रिपोर्ट अपनी भाषा अलग रखती हैं और बाकी ऐप नहीं बदलतीं.',
    reports: 'रिपोर्ट',
    reportsAndAccess: 'रिपोर्ट और प्रवेश',
    saved: 'सेव',
    savedWork: 'सेव काम',
    savedWorkBody:
      'लाइब्रेरी, रिपोर्ट पसंद और मौजूदा चैट निरंतरता इस डिवाइस या खाते से जुड़ी रहती है.',
    signOut: 'साइन आउट',
    signOutBusy: 'कृपया प्रतीक्षा करें...',
    signedInBody:
      'आपकी कुंडली, रिपोर्ट पसंद और सेव चैट इसी खाते के साथ रहती हैं.',
    signedInReady: 'साइन इन और तैयार',
    startFree: 'मुफ्त से शुरू करें, फिर काम सुरक्षित रखें',
    styleHelper:
      'डिफॉल्ट शैली एक बार चुनें. फिर भी प्रेडिक्टा मौजूदा संदेश के स्पष्ट संकेत मानेगी.',
    usagePill: 'प्रवेश साफ रखें',
    usageSummary:
      'मुफ्त उपयोग में दैनिक मार्गदर्शन और रिपोर्ट झलक उपयोगी रहती है. प्रीमियम गहरी रीडिंग, सेव निरंतरता और सुंदर रिपोर्ट गहराई जोड़ता है.',
    viewPremium: 'प्रीमियम देखें',
  },
  gu: {
    accessBody:
      'આ પેજ પરથી સાઇન ઇન, સેવ કુંડળી, રિપોર્ટ ભાષા, ખાનગી પ્રવેશ અને રિકવરીને શાંત અને સ્પષ્ટ રાખો.',
    accessTitle: 'રિપોર્ટ અને પ્રવેશ',
    accountContinuity: 'ખાતાની સતતતા',
    accountReady: 'ખાતું તૈયાર',
    accountRestoreFailed:
      'તમારી કુંડળી અહીં સુરક્ષિત છે. ખાતું પુનઃસ્થાપન પછી ફરી પ્રયાસ કરશે.',
    accountSynced: 'તમારી ગેસ્ટ કુંડળી આ ખાતા સાથે જોડાઈ ગઈ છે.',
    accountTitle: 'ખાતાની સતતતા',
    appLanguage: 'એપ ભાષા',
    chartLanguage: 'ચાર્ટ ભાષા',
    chatSessions: 'ચેટ સત્રો',
    chooseDepth: 'વધુ ઊંડાઈ ત્યારે જ પસંદ કરો જ્યારે મફત મૂલ્ય સ્પષ્ટ થઈ જાય.',
    currentAccount: 'વર્તમાન ખાતું',
    drawerAction: 'ખોલો',
    drawerBody:
      'આ પેજ પરથી સાઇન ઇન, સેવ કુંડળી, રિપોર્ટ ભાષા, ખાનગી પ્રવેશ અને રિકવરીને શાંત અને સ્પષ્ટ રાખો.',
    drawerEyebrow: 'અહીં શું રહે છે',
    guestChats: 'ગેસ્ટ એક સક્રિય ચેટ વાપરે છે. અનેક સત્રો માટે સાઇન ઇન કરો.',
    guestMode: 'ગેસ્ટ મોડ',
    guestModeBody:
      'તમે ગેસ્ટ તરીકે એક કુંડળી સુરક્ષિત રાખી શકો છો, પછી સતતતા જોઈએ ત્યારે સાઇન ઇન કરો.',
    guestModeLibrary:
      'ગેસ્ટ મોડ અહીં એક કુંડળી સુરક્ષિત રાખે છે જ્યાં સુધી તમે સાઇન ઇન ન કરો.',
    guestReady: 'તમારી ગેસ્ટ કુંડળી આ ખાતા માટે તૈયાર છે.',
    guestSignInPrompt:
      'એક વાર સાઇન ઇન કરો જેથી કુંડળી, રિપોર્ટ પસંદગીઓ અને ચેટ તમારા ખાતા સાથે રહે.',
    heading: 'ખાતું, ભાષા અને પ્રવેશ',
    keepSeparate: 'એપ, ચાર્ટ, રિપોર્ટ અને ચેટ ભાષા અલગ રાખો.',
    kundliLibrary: 'કુંડળી લાઇબ્રેરી',
    languageControl: 'ભાષા નિયંત્રણ',
    lastReportLanguage: 'છેલ્લી રિપોર્ટ ભાષા',
    libraryBody:
      'લાઇબ્રેરી, રિપોર્ટ પસંદગીઓ અને હાલની ચેટ સતતતા આ ડિવાઇસ અથવા ખાતા સાથે જોડાયેલી રહે છે.',
    multipleChats: 'તમારા ખાતાથી અનેક ચેટ સત્રો ઉપલબ્ધ છે.',
    multipleKundlis: 'આ ખાતા સાથે અનેક કુંડળીઓ રહી શકે છે.',
    noReportPreference: 'હજુ કોઈ રિપોર્ટ પસંદગી સેવ નથી.',
    notChosenYet: 'હજુ પસંદ નથી',
    notSignedInYet: 'હજુ સાઇન ઇન નથી',
    oneTimeReports: 'પ્રીમિયમ અને એક વખતની રિપોર્ટ',
    openChat: 'ચેટ ખોલો',
    openLibrary: 'લાઇબ્રેરી ખોલો',
    pageBody:
      'ફક્ત જે સપાટી બદલવી હોય તે જ બદલો. પ્રેડિક્ટાને બધું એક સાથે બદલવાની જરૂર નથી.',
    premiumBody:
      'સભ્યપદ, ડે પાસ અને તૈયાર રિપોર્ટના રસ્તાઓ દબાણ વગર જુઓ.',
    premiumTitle: 'પ્રીમિયમ અને એક વખતની રિપોર્ટ',
    privacyBody:
      'સેવ કુંડળી, રિપોર્ટ પસંદગીઓ અને ભાષા પસંદગીઓ અહીં તૈયાર રહે છે અને સાઇન ઇન પછી તમારા ખાતામાં જઈ શકે છે.',
    privacyTitle: 'ગોપનીયતા અને પુનઃસ્થાપન',
    privateByDefault: 'ડિફૉલ્ટ રીતે ખાનગી, અને પછી શાંત રિકવરી.',
    privatePass: 'ખાનગી પાસ',
    privatePassBody:
      'તે પાસ માટે મંજૂર ઇમેઇલ સાથે ખાનગી આમંત્રણ રિડીમ કરો.',
    profileState: 'પ્રોફાઇલ સ્થિતિ',
    predictaReplyLanguage: 'પ્રેડિક્ટા જવાબ ભાષા',
    predictaStyle: 'પ્રેડિક્ટા શૈલી',
    redeem: 'રિડીમ કરો',
    reportLanguage: 'રિપોર્ટ ભાષા',
    reportPreference: 'રિપોર્ટ પસંદગી',
    reportStateBody:
      'રિપોર્ટ પોતાની ભાષા અલગ રાખે છે અને બાકી એપ બદલે નહીં.',
    reports: 'રિપોર્ટ્સ',
    reportsAndAccess: 'રિપોર્ટ અને પ્રવેશ',
    saved: 'સેવ',
    savedWork: 'સેવ કામ',
    savedWorkBody:
      'લાઇબ્રેરી, રિપોર્ટ પસંદગીઓ અને હાલની ચેટ સતતતા આ ડિવાઇસ અથવા ખાતા સાથે જોડાયેલી રહે છે.',
    signOut: 'સાઇન આઉટ',
    signOutBusy: 'કૃપા કરીને રાહ જુઓ...',
    signedInBody:
      'તમારી કુંડળી, રિપોર્ટ પસંદગીઓ અને સેવ ચેટ આ જ ખાતા સાથે રહે છે.',
    signedInReady: 'સાઇન ઇન અને તૈયાર',
    startFree: 'મફતથી શરૂ કરો, પછી તમારું કામ સુરક્ષિત રાખો',
    styleHelper:
      'ડિફૉલ્ટ શૈલી એક વાર પસંદ કરો. છતાં પ્રેડિક્ટા હાલના સંદેશના સ્પષ્ટ સંકેતો માને છે.',
    usagePill: 'પ્રવેશ સ્વચ્છ રાખો',
    usageSummary:
      'મફત ઉપયોગમાં દૈનિક માર્ગદર્શન અને રિપોર્ટ ઝલક ઉપયોગી રહે છે. પ્રીમિયમ ઊંડી વાંચન, સેવ સતતતા અને સુંદર રિપોર્ટ ઊંડાઈ ઉમેરે છે.',
    viewPremium: 'પ્રીમિયમ જુઓ',
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
        description: 'गर्म, संतुलित और संकेत-आधारित.',
        label: 'संतुलित',
        value: 'balanced',
      },
      {
        description: 'देवotional संकेत मिलने पर थोड़ा भक्तिपूर्ण स्वर.',
        label: 'भक्तिमय',
        value: 'devotional',
      },
      {
        description: 'ज्यादा तटस्थ, practical और गैर-धार्मिक.',
        label: 'सेक्युलर',
        value: 'secular',
      },
    ];
  }

  if (language === 'gu') {
    return [
      {
        description: 'ઉષ્માભર્યું, સંતુલિત અને સંકેત આધારિત.',
        label: 'સંતુલિત',
        value: 'balanced',
      },
      {
        description: 'સંકેત મળે ત્યારે થોડું ભક્તિપૂર્ણ સ્વર.',
        label: 'ભક્તિમય',
        value: 'devotional',
      },
      {
        description: 'વધુ નિષ્પક્ષ, practical અને અર્ધાર્મિક નહીં.',
        label: 'સેક્યુલર',
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
      return 'अंग्रेजी';
    }
    if (language === 'hi') {
      return 'हिन्दी';
    }
    return 'ગુજરાતી';
  }

  if (uiLanguage === 'gu') {
    if (language === 'en') {
      return 'અંગ્રેજી';
    }
    if (language === 'hi') {
      return 'હિન્દી';
    }
    return 'ગુજરાતી';
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
