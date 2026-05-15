'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { SupportedLanguage } from '@pridicta/types';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { WebFooter } from '../../components/WebFooter';
import { WebHeader } from '../../components/WebHeader';
import { getFirebaseWebAuth } from '../../lib/firebase/client';
import { useLanguagePreference } from '../../lib/language-preference';

type FeedbackTone = 'idle' | 'success' | 'error';

type FeedbackDraft = {
  area: string;
  email: string;
  message: string;
  page: string;
  testerType: string;
};

export default function FeedbackPage(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = feedbackCopy[language] ?? feedbackCopy.en;
  const [draft, setDraft] = useState<FeedbackDraft>({
    area: 'general',
    email: '',
    message: '',
    page: '',
    testerType: 'friends-family',
  });
  const [status, setStatus] = useState<{ text: string; tone: FeedbackTone }>({
    text: '',
    tone: 'idle',
  });
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDraft(current => ({
      ...current,
      area: params.get('area') ?? current.area,
      page: params.get('from') ?? document.referrer ?? current.page,
      testerType: params.get('source') ?? current.testerType,
    }));

    try {
      return onAuthStateChanged(getFirebaseWebAuth(), setUser);
    } catch {
      return undefined;
    }
  }, []);

  const emailHref = useMemo(() => {
    const resolvedEmail = user?.email ?? draft.email;
    const body = [
      `${copy.emailBodyLabels.area}: ${getAreaLabel(copy, draft.area)}`,
      `${copy.emailBodyLabels.page}: ${draft.page || copy.notSure}`,
      `${copy.emailBodyLabels.userType}: ${getTesterLabel(copy, draft.testerType)}`,
      `${copy.emailBodyLabels.email}: ${resolvedEmail || copy.notShared}`,
      '',
      `${copy.emailBodyLabels.message}:`,
      draft.message || copy.writeHere,
    ].join('\n');

    return `mailto:support@predicta.app?subject=${encodeURIComponent(
      copy.emailSubject,
    )}&body=${encodeURIComponent(body)}`;
  }, [copy, draft, user?.email]);

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.message.trim()) {
      setStatus({ text: copy.messageRequired, tone: 'error' });
      return;
    }

    const savedFeedback = {
      ...draft,
      areaLabel: getAreaLabel(copy, draft.area),
      createdAt: new Date().toISOString(),
      email: user?.email ?? draft.email,
      page:
        draft.page ||
        (typeof window === 'undefined' ? '' : window.location.pathname),
      testerLabel: getTesterLabel(copy, draft.testerType),
    };

    try {
      setSubmitting(true);
      saveFeedbackLocally(savedFeedback);

      const reviewResponse = await fetch('/api/safety/report', {
        body: JSON.stringify({
          reportKind: 'USER_REPORTED',
          route: savedFeedback.page,
          safetyCategories: ['user-feedback', draft.area],
          safetyIdentifier: `${draft.area}:${draft.testerType}:${savedFeedback.createdAt}`,
          sourceSurface: 'web-feedback',
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      }).catch(() => undefined);

      setStatus({
        text: reviewResponse?.ok ? copy.saved : copy.savedLocally,
        tone: 'success',
      });
      setDraft(current => ({ ...current, message: '' }));
    } catch {
      setStatus({ text: copy.savedLocally, tone: 'success' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <WebHeader />
      <main className="feedback-page">
        <section className="page-heading feedback-heading">
          <h1 className="gradient-text">{copy.title}</h1>
          <p>{copy.body}</p>
        </section>

        <form className="feedback-form glass-panel" onSubmit={submitFeedback}>
          <div className="feedback-form-head">
            <div>
              <div className="section-title">{copy.formEyebrow}</div>
              <h2>{copy.formTitle}</h2>
            </div>
            <Link className="button secondary" href="/dashboard">
              {copy.dashboard}
            </Link>
          </div>

          <div className="feedback-form-grid">
            <label className="field-stack">
              <span className="field-label">{copy.areaLabel}</span>
              <select
                onChange={event =>
                  setDraft(current => ({ ...current, area: event.target.value }))
                }
                value={draft.area}
              >
                {copy.areaOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-stack">
              <span className="field-label">{copy.testerLabel}</span>
              <select
                onChange={event =>
                  setDraft(current => ({
                    ...current,
                    testerType: event.target.value,
                  }))
                }
                value={draft.testerType}
              >
                {copy.testerOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field-stack">
              <span className="field-label">{copy.pageLabel}</span>
              <input
                onChange={event =>
                  setDraft(current => ({ ...current, page: event.target.value }))
                }
                placeholder={copy.pagePlaceholder}
                value={draft.page}
              />
            </label>
            {user?.email ? (
              <div className="feedback-account-status">
                <span className="field-label">{copy.emailLabel}</span>
                <strong>{user.email}</strong>
                <p>{copy.signedInEmailNote}</p>
              </div>
            ) : (
              <label className="field-stack">
                <span className="field-label">{copy.emailLabel}</span>
                <input
                  onChange={event =>
                    setDraft(current => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder={copy.emailPlaceholder}
                  type="email"
                  value={draft.email}
                />
              </label>
            )}
          </div>

          <label className="field-stack">
            <span className="field-label">{copy.messageLabel}</span>
            <textarea
              onChange={event =>
                setDraft(current => ({ ...current, message: event.target.value }))
              }
              placeholder={copy.messagePlaceholder}
              rows={7}
              value={draft.message}
            />
          </label>

          {status.text ? (
            <p className={`form-status ${status.tone}`}>{status.text}</p>
          ) : null}

          <div className="feedback-actions">
            <button className="button" disabled={submitting} type="submit">
              {submitting ? copy.sending : copy.send}
            </button>
            <a className="button secondary" href={emailHref}>
              {copy.emailBackup}
            </a>
          </div>
        </form>

        <section className="feedback-grid">
          {copy.cards.map(item => (
            <article className="glass-panel feedback-card" key={item.title}>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
            </article>
          ))}
        </section>

        <section className="feedback-footer-note glass-panel">
          <h2>{copy.footerTitle}</h2>
          <p>{copy.footerBody}</p>
          <Link className="button secondary" href="/dashboard/redeem-pass?source=family-friends">
            {copy.pass}
          </Link>
        </section>
      </main>
      <WebFooter />
    </>
  );
}

function getAreaLabel(
  copy: FeedbackCopy,
  value: string,
): string {
  return copy.areaOptions.find(option => option.value === value)?.label ?? value;
}

function getTesterLabel(
  copy: FeedbackCopy,
  value: string,
): string {
  return (
    copy.testerOptions.find(option => option.value === value)?.label ?? value
  );
}

function saveFeedbackLocally(feedback: Record<string, unknown>) {
  const key = 'pridicta.userFeedback.v1';
  const existing = window.localStorage.getItem(key);
  const parsed = existing ? JSON.parse(existing) : [];
  const list = Array.isArray(parsed) ? parsed : [];
  window.localStorage.setItem(key, JSON.stringify([feedback, ...list].slice(0, 25)));
}

type FeedbackCopy = {
  areaLabel: string;
  areaOptions: Array<{ label: string; value: string }>;
  body: string;
  cards: Array<{ body: string; title: string }>;
  dashboard: string;
  emailBackup: string;
  emailBodyLabels: {
    area: string;
    email: string;
    message: string;
    page: string;
    userType: string;
  };
  emailLabel: string;
  emailPlaceholder: string;
  emailSubject: string;
  footerBody: string;
  footerTitle: string;
  formEyebrow: string;
  formTitle: string;
  messageLabel: string;
  messagePlaceholder: string;
  messageRequired: string;
  notShared: string;
  notSure: string;
  pageLabel: string;
  pagePlaceholder: string;
  pass: string;
  saved: string;
  savedLocally: string;
  send: string;
  sending: string;
  signedInEmailNote: string;
  testerLabel: string;
  testerOptions: Array<{ label: string; value: string }>;
  title: string;
  writeHere: string;
};

const feedbackCopy: Record<SupportedLanguage, FeedbackCopy> = {
  en: {
    areaLabel: 'What should we look at?',
    areaOptions: [
      { label: 'General experience', value: 'general' },
      { label: 'Predicta answer', value: 'chat' },
      { label: 'Kundli or charts', value: 'charts' },
      { label: 'Report or PDF', value: 'report' },
      { label: 'KP or Nadi', value: 'schools' },
      { label: 'Language or translation', value: 'language' },
      { label: 'Safety concern', value: 'safety' },
    ],
    body: 'Share anything that made Predicta hard to use: a broken button, unclear report, wrong language, clipped text, confusing prediction, or a safety concern.',
    cards: [
      {
        body: 'The page name, what you clicked, what happened, and what you expected.',
        title: 'What to send',
      },
      {
        body: 'Screenshots, the exact question you asked Predicta, and whether you were using English, Hindi, or Gujarati.',
        title: 'What helps most',
      },
      {
        body: 'Broken flows, confusing copy, unsafe answers, chart/report issues, and places where a 10-year-old would get lost.',
        title: 'What we review',
      },
    ],
    dashboard: 'Open Dashboard',
    emailBackup: 'Send by Email',
    emailBodyLabels: {
      area: 'Area',
      email: 'Email',
      message: 'Message',
      page: 'Page',
      userType: 'User type',
    },
    emailLabel: 'Your email',
    emailPlaceholder: 'Optional, but useful if we need to reply',
    emailSubject: 'Predicta feedback',
    footerBody:
      'Go back to the dashboard, create a Kundli, ask Predicta a real question, then send feedback when something feels unclear.',
    footerTitle: 'Want to keep exploring?',
    formEyebrow: 'PREDICTA FEEDBACK',
    formTitle: 'Tell us exactly what happened.',
    messageLabel: 'What happened?',
    messagePlaceholder:
      'Example: I clicked D9 from charts, Predicta opened chat, but it did not remember the selected chart.',
    messageRequired: 'Write one clear note before sending.',
    notShared: 'Not shared',
    notSure: 'Not sure',
    pageLabel: 'Page or screen',
    pagePlaceholder: 'Example: Dashboard, Chat, Report, KP',
    pass: 'Redeem Pass',
    saved:
      'Saved. Thank you. We will review this before the next feedback review, and your note is kept in this browser too.',
    savedLocally:
      'Saved in this browser. If you want to send screenshots, use the email button too.',
    send: 'Send Feedback',
    sending: 'Sending...',
    signedInEmailNote:
      'You are signed in, so Predicta will use this email for follow-up. No extra email entry is needed.',
    testerLabel: 'Who is sharing feedback?',
    testerOptions: [
      { label: 'Friend or family', value: 'friends-family' },
      { label: 'Founder review', value: 'founder-review' },
      { label: 'Investor or reviewer', value: 'investor-demo' },
      { label: 'Public visitor', value: 'public' },
    ],
    title: 'Tell us what felt confusing.',
    writeHere: 'Write here',
  },
  hi: {
    areaLabel: 'हमें क्या देखना चाहिए?',
    areaOptions: [
      { label: 'सामान्य अनुभव', value: 'general' },
      { label: 'Predicta का जवाब', value: 'chat' },
      { label: 'कुंडली या charts', value: 'charts' },
      { label: 'Report या PDF', value: 'report' },
      { label: 'KP या Nadi', value: 'schools' },
      { label: 'भाषा या translation', value: 'language' },
      { label: 'Safety concern', value: 'safety' },
    ],
    body: 'जो भी Predicta को उपयोग करना मुश्किल बनाता है, बताएं: टूटा बटन, अस्पष्ट रिपोर्ट, गलत भाषा, कटा हुआ पाठ, भ्रमित करने वाला संकेत या सुरक्षा चिंता.',
    cards: [
      {
        body: 'पेज का नाम, आपने क्या दबाया, क्या हुआ, और आपको क्या उम्मीद थी.',
        title: 'क्या भेजना है',
      },
      {
        body: 'स्क्रीनशॉट, Predicta से पूछा गया सटीक सवाल, और आप English, Hindi या Gujarati में थे.',
        title: 'सबसे helpful क्या है',
      },
      {
        body: 'टूटे रास्ते, भ्रमित भाषा, असुरक्षित जवाब, चार्ट/रिपोर्ट समस्याएं, और जहां 10 साल का बच्चा खो जाए.',
        title: 'हम क्या review करते हैं',
      },
    ],
    dashboard: 'डैशबोर्ड खोलें',
    emailBackup: 'Email से भेजें',
    emailBodyLabels: {
      area: 'क्षेत्र',
      email: 'Email',
      message: 'संदेश',
      page: 'पेज',
      userType: 'व्यक्ति',
    },
    emailLabel: 'आपका email',
    emailPlaceholder: 'वैकल्पिक, जवाब चाहिए तो उपयोगी रहेगा',
    emailSubject: 'Predicta feedback',
    footerBody:
      'डैशबोर्ड पर जाएं, कुंडली बनाएं, Predicta से असली सवाल पूछें, और जहां बात स्पष्ट न लगे वहां सुझाव भेजें.',
    footerTitle: 'और explore करना चाहते हैं?',
    formEyebrow: 'PREDICTA FEEDBACK',
    formTitle: 'साफ बताएं क्या हुआ.',
    messageLabel: 'क्या हुआ?',
    messagePlaceholder:
      'उदाहरण: मैंने चार्ट से D9 दबाया, चैट खुली, पर Predicta को चुना हुआ चार्ट याद नहीं रहा.',
    messageRequired: 'भेजने से पहले एक साफ नोट लिखें.',
    notShared: 'साझा नहीं किया',
    notSure: 'पक्का नहीं',
    pageLabel: 'पेज या स्क्रीन',
    pagePlaceholder: 'उदाहरण: डैशबोर्ड, चैट, रिपोर्ट, KP',
    pass: 'Pass redeem करें',
    saved:
      'Saved. Thank you. अगले feedback review से पहले हम इसे देखेंगे, और note इस browser में भी रखा गया है.',
    savedLocally:
      'इस ब्राउज़र में सेव हो गया. स्क्रीनशॉट भेजने हों तो ईमेल बटन भी उपयोग करें.',
    send: 'Feedback भेजें',
    sending: 'भेज रहे हैं...',
    signedInEmailNote:
      'आप साइन इन हैं, इसलिए आगे संपर्क के लिए Predicta यही ईमेल उपयोग करेगी. अलग ईमेल डालने की जरूरत नहीं है.',
    testerLabel: 'सुझाव कौन साझा कर रहा है?',
    testerOptions: [
      { label: 'दोस्त या परिवार', value: 'friends-family' },
      { label: 'Founder समीक्षा', value: 'founder-review' },
      { label: 'निवेशक या समीक्षक', value: 'investor-demo' },
      { label: 'सार्वजनिक आगंतुक', value: 'public' },
    ],
    title: 'जहां confusion लगा, हमें बताएं.',
    writeHere: 'यहां लिखें',
  },
  gu: {
    areaLabel: 'અમારે શું જોવું જોઈએ?',
    areaOptions: [
      { label: 'સામાન્ય અનુભવ', value: 'general' },
      { label: 'Predicta નો જવાબ', value: 'chat' },
      { label: 'કુંડળી અથવા charts', value: 'charts' },
      { label: 'Report અથવા PDF', value: 'report' },
      { label: 'KP અથવા Nadi', value: 'schools' },
      { label: 'ભાષા અથવા translation', value: 'language' },
      { label: 'Safety concern', value: 'safety' },
    ],
    body: 'Predicta ઉપયોગ કરવું મુશ્કેલ બને તેવી કોઈ પણ વાત જણાવો: તૂટેલું બટન, અસ્પષ્ટ રિપોર્ટ, ખોટી ભાષા, કપાયેલ લખાણ, ગૂંચવતો સંકેત અથવા સુરક્ષા ચિંતા.',
    cards: [
      {
        body: 'પેજનું નામ, તમે શું દબાવ્યું, શું થયું, અને શું અપેક્ષા હતી.',
        title: 'શું મોકલવું',
      },
      {
        body: 'સ્ક્રીનશોટ, Predicta ને પૂછેલો ચોક્કસ પ્રશ્ન, અને તમે English, Hindi કે Gujarati માં હતા.',
        title: 'સૌથી helpful શું છે',
      },
      {
        body: 'તૂટેલા રસ્તા, ગૂંચવતી ભાષા, અસુરક્ષિત જવાબ, ચાર્ટ/રિપોર્ટ સમસ્યાઓ, અને જ્યાં 10 વર્ષનું બાળક ખોવાઈ જાય.',
        title: 'અમે શું review કરીએ છીએ',
      },
    ],
    dashboard: 'ડેશબોર્ડ ખોલો',
    emailBackup: 'Email થી મોકલો',
    emailBodyLabels: {
      area: 'વિભાગ',
      email: 'Email',
      message: 'સંદેશ',
      page: 'પેજ',
      userType: 'વ્યક્તિ',
    },
    emailLabel: 'તમારું email',
    emailPlaceholder: 'વૈકલ્પિક, જવાબ જોઈએ તો ઉપયોગી રહેશે',
    emailSubject: 'Predicta feedback',
    footerBody:
      'ડેશબોર્ડ પર જાઓ, કુંડળી બનાવો, Predicta ને સાચો પ્રશ્ન પૂછો, અને જ્યાં વાત સ્પષ્ટ ન લાગે ત્યાં સૂચન મોકલો.',
    footerTitle: 'હજુ explore કરવું છે?',
    formEyebrow: 'PREDICTA FEEDBACK',
    formTitle: 'સાફ કહો શું થયું.',
    messageLabel: 'શું થયું?',
    messagePlaceholder:
      'ઉદાહરણ: મેં ચાર્ટમાંથી D9 દબાવ્યું, ચેટ ખુલી, પણ Predicta ને પસંદ કરેલો ચાર્ટ યાદ ન રહ્યો.',
    messageRequired: 'મોકલતા પહેલાં એક સ્પષ્ટ નોંધ લખો.',
    notShared: 'સાંઝું કર્યું નથી',
    notSure: 'ખાતરી નથી',
    pageLabel: 'પેજ અથવા સ્ક્રીન',
    pagePlaceholder: 'ઉદાહરણ: ડેશબોર્ડ, ચેટ, રિપોર્ટ, KP',
    pass: 'Pass redeem કરો',
    saved:
      'Saved. Thank you. આગામી feedback review પહેલા અમે આ જોશું, અને note આ browser માં પણ રાખ્યું છે.',
    savedLocally:
      'આ બ્રાઉઝરમાં સેવ થયું. સ્ક્રીનશોટ મોકલવા હોય તો ઈમેલ બટન પણ ઉપયોગ કરો.',
    send: 'Feedback મોકલો',
    sending: 'મોકલી રહ્યા છીએ...',
    signedInEmailNote:
      'તમે સાઇન ઇન છો, એટલે આગળ સંપર્ક માટે Predicta આ ઈમેલ ઉપયોગ કરશે. અલગ ઈમેલ નાખવાની જરૂર નથી.',
    testerLabel: 'સૂચન કોણ શેર કરે છે?',
    testerOptions: [
      { label: 'મિત્ર અથવા પરિવાર', value: 'friends-family' },
      { label: 'Founder સમીક્ષા', value: 'founder-review' },
      { label: 'રોકાણકાર અથવા સમીક્ષક', value: 'investor-demo' },
      { label: 'જાહેર મુલાકાતી', value: 'public' },
    ],
    title: 'જ્યાં confusion લાગ્યું, અમને કહો.',
    writeHere: 'અહીં લખો',
  },
};
