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
      `${copy.emailBodyLabels.tester}: ${getTesterLabel(copy, draft.testerType)}`,
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
          safetyCategories: ['tester-feedback', draft.area],
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
  const key = 'pridicta.testerFeedback.v1';
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
    tester: string;
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
      tester: 'Tester type',
    },
    emailLabel: 'Your email',
    emailPlaceholder: 'Optional, but useful if we need to reply',
    emailSubject: 'Predicta tester feedback',
    footerBody:
      'Go back to the dashboard, create a Kundli, ask Predicta a real question, then send feedback when something feels unclear.',
    footerTitle: 'Prefer to keep testing?',
    formEyebrow: 'TESTER FEEDBACK',
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
      'Saved. Thank you. We will look at this before the next testing round, and your note is kept in this browser too.',
    savedLocally:
      'Saved in this browser. If you want to send screenshots, use the email button too.',
    send: 'Send Feedback',
    sending: 'Sending...',
    signedInEmailNote:
      'You are signed in, so Predicta will use this email for follow-up. No extra email entry is needed.',
    testerLabel: 'Who is testing?',
    testerOptions: [
      { label: 'Friend or family tester', value: 'friends-family' },
      { label: 'Founder review', value: 'founder-review' },
      { label: 'Investor/demo reviewer', value: 'investor-demo' },
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
    body: 'जो भी Predicta को उपयोग करना मुश्किल बनाता है, बताएं: टूटा button, unclear report, गलत भाषा, कटा हुआ text, confusing prediction या safety concern.',
    cards: [
      {
        body: 'Page name, आपने क्या click किया, क्या हुआ, और आपको क्या उम्मीद थी.',
        title: 'क्या भेजना है',
      },
      {
        body: 'Screenshots, Predicta से पूछा exact question, और आप English, Hindi या Gujarati में थे.',
        title: 'सबसे helpful क्या है',
      },
      {
        body: 'टूटे flows, confusing copy, unsafe answers, chart/report issues, और जहां 10 साल का बच्चा खो जाए.',
        title: 'हम क्या review करते हैं',
      },
    ],
    dashboard: 'डैशबोर्ड खोलें',
    emailBackup: 'Email से भेजें',
    emailBodyLabels: {
      area: 'Area',
      email: 'Email',
      message: 'Message',
      page: 'Page',
      tester: 'Tester type',
    },
    emailLabel: 'आपका email',
    emailPlaceholder: 'Optional, reply चाहिए तो helpful रहेगा',
    emailSubject: 'Predicta tester feedback',
    footerBody:
      'डैशबोर्ड पर जाएं, कुंडली बनाएं, Predicta से असली सवाल पूछें, और जहां unclear लगे वहां feedback भेजें.',
    footerTitle: 'Testing जारी रखना चाहते हैं?',
    formEyebrow: 'TESTER FEEDBACK',
    formTitle: 'साफ बताएं क्या हुआ.',
    messageLabel: 'क्या हुआ?',
    messagePlaceholder:
      'Example: मैंने charts से D9 click किया, chat खुली, पर Predicta को selected chart याद नहीं रहा.',
    messageRequired: 'Send करने से पहले एक साफ note लिखें.',
    notShared: 'Share नहीं किया',
    notSure: 'पक्का नहीं',
    pageLabel: 'Page या screen',
    pagePlaceholder: 'Example: Dashboard, Chat, Report, KP',
    pass: 'Pass redeem करें',
    saved:
      'Saved. Thank you. अगली testing round से पहले हम इसे देखेंगे, और note इस browser में भी रखा गया है.',
    savedLocally:
      'इस browser में saved. Screenshots भेजने हों तो email button भी use करें.',
    send: 'Feedback भेजें',
    sending: 'भेज रहे हैं...',
    signedInEmailNote:
      'आप signed in हैं, इसलिए follow-up के लिए Predicta यही email use करेगी. अलग email डालने की जरूरत नहीं है.',
    testerLabel: 'कौन test कर रहा है?',
    testerOptions: [
      { label: 'Friend या family tester', value: 'friends-family' },
      { label: 'Founder review', value: 'founder-review' },
      { label: 'Investor/demo reviewer', value: 'investor-demo' },
      { label: 'Public visitor', value: 'public' },
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
    body: 'Predicta ઉપયોગ કરવું મુશ્કેલ બને તેવી કોઈ પણ વાત જણાવો: તૂટેલું button, unclear report, ખોટી ભાષા, કપાયેલ text, confusing prediction અથવા safety concern.',
    cards: [
      {
        body: 'Page name, તમે શું click કર્યું, શું થયું, અને શું અપેક્ષા હતી.',
        title: 'શું મોકલવું',
      },
      {
        body: 'Screenshots, Predicta ને પૂછેલો exact question, અને તમે English, Hindi કે Gujarati માં હતા.',
        title: 'સૌથી helpful શું છે',
      },
      {
        body: 'તૂટેલા flows, confusing copy, unsafe answers, chart/report issues, અને જ્યાં 10 વર્ષનું બાળક ખોવાઈ જાય.',
        title: 'અમે શું review કરીએ છીએ',
      },
    ],
    dashboard: 'ડેશબોર્ડ ખોલો',
    emailBackup: 'Email થી મોકલો',
    emailBodyLabels: {
      area: 'Area',
      email: 'Email',
      message: 'Message',
      page: 'Page',
      tester: 'Tester type',
    },
    emailLabel: 'તમારું email',
    emailPlaceholder: 'Optional, reply જોઈએ તો helpful રહેશે',
    emailSubject: 'Predicta tester feedback',
    footerBody:
      'ડેશબોર્ડ પર જાઓ, કુંડળી બનાવો, Predicta ને સાચો પ્રશ્ન પૂછો, અને જ્યાં unclear લાગે ત્યાં feedback મોકલો.',
    footerTitle: 'Testing ચાલુ રાખવી છે?',
    formEyebrow: 'TESTER FEEDBACK',
    formTitle: 'સાફ કહો શું થયું.',
    messageLabel: 'શું થયું?',
    messagePlaceholder:
      'Example: મેં charts માંથી D9 click કર્યું, chat ખુલી, પણ Predicta ને selected chart યાદ ન રહ્યું.',
    messageRequired: 'Send કરતા પહેલા એક clear note લખો.',
    notShared: 'Share નથી કર્યું',
    notSure: 'ખાતરી નથી',
    pageLabel: 'Page અથવા screen',
    pagePlaceholder: 'Example: Dashboard, Chat, Report, KP',
    pass: 'Pass redeem કરો',
    saved:
      'Saved. Thank you. Next testing round પહેલા અમે આ જોશું, અને note આ browser માં પણ રાખ્યું છે.',
    savedLocally:
      'આ browser માં saved. Screenshots મોકલવા હોય તો email button પણ use કરો.',
    send: 'Feedback મોકલો',
    sending: 'મોકલી રહ્યા છીએ...',
    signedInEmailNote:
      'તમે signed in છો, એટલે follow-up માટે Predicta આ email use કરશે. અલગ email નાખવાની જરૂર નથી.',
    testerLabel: 'કોણ test કરી રહ્યું છે?',
    testerOptions: [
      { label: 'Friend અથવા family tester', value: 'friends-family' },
      { label: 'Founder review', value: 'founder-review' },
      { label: 'Investor/demo reviewer', value: 'investor-demo' },
      { label: 'Public visitor', value: 'public' },
    ],
    title: 'જ્યાં confusion લાગ્યું, અમને કહો.',
    writeHere: 'અહીં લખો',
  },
};
