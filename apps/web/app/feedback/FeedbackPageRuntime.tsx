'use client';

import { getNativeCopy } from '@pridicta/config';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { SupportedLanguage } from '@pridicta/types';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { LandingLightFooter } from '../../components/LandingLightFooter';
import { LandingLightHeader } from '../../components/LandingLightHeader';
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
      <LandingLightHeader />
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
            <Link className="button secondary" href="/ask">
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
      <LandingLightFooter />
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
      { label: 'KP or Jaimini', value: 'schools' },
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
    dashboard: 'Open Predicta',
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
      'Open Predicta, create a Kundli, ask one real question, then send feedback when something feels unclear.',
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
      'Saved. Thank you. We will review this before the next feedback review, and your note stays available here too.',
    savedLocally:
      'Saved here. If you want to send screenshots, use the email button too.',
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
    areaLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.ad294c91ce"),
    areaOptions: [
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.907026c635"), value: 'general' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.54875283e6"), value: 'chat' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.8f1a2f35b2"), value: 'charts' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.455e457ff1"), value: 'report' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.1c82fdc324"), value: 'schools' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.b589efaf21"), value: 'language' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.1869d44380"), value: 'safety' },
    ],
    body: getNativeCopy("native.apps.web.app.feedback.page.tsx.434d86a63c"),
    cards: [
      {
        body: getNativeCopy("native.apps.web.app.feedback.page.tsx.e63c2bcf5b"),
        title: getNativeCopy("native.apps.web.app.feedback.page.tsx.29e30236f2"),
      },
      {
        body: getNativeCopy("native.apps.web.app.feedback.page.tsx.a6b2b1cda8"),
        title: getNativeCopy("native.apps.web.app.feedback.page.tsx.4f723a1936"),
      },
      {
        body: getNativeCopy("native.apps.web.app.feedback.page.tsx.eba279552a"),
        title: getNativeCopy("native.apps.web.app.feedback.page.tsx.73543ffb57"),
      },
    ],
    dashboard: getNativeCopy("native.apps.web.app.feedback.page.tsx.5d7a2973b7"),
    emailBackup: getNativeCopy("native.apps.web.app.feedback.page.tsx.7129aa712f"),
    emailBodyLabels: {
      area: getNativeCopy("native.apps.web.app.feedback.page.tsx.16de472f9f"),
      email: getNativeCopy("native.apps.web.app.feedback.page.tsx.d463d51545"),
      message: getNativeCopy("native.apps.web.app.feedback.page.tsx.89e6450a01"),
      page: getNativeCopy("native.apps.web.app.feedback.page.tsx.2896d95c44"),
      userType: getNativeCopy("native.apps.web.app.feedback.page.tsx.36fcec1b98"),
    },
    emailLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.e62efe1116"),
    emailPlaceholder: getNativeCopy("native.apps.web.app.feedback.page.tsx.ba74c99ef5"),
    emailSubject: getNativeCopy("native.apps.web.app.feedback.page.tsx.1b38fc5048"),
    footerBody:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.089a4a8b8e"),
    footerTitle: getNativeCopy("native.apps.web.app.feedback.page.tsx.2597a82731"),
    formEyebrow: getNativeCopy("native.apps.web.app.feedback.page.tsx.d405c7d2b7"),
    formTitle: getNativeCopy("native.apps.web.app.feedback.page.tsx.28a89ccb05"),
    messageLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.e7d0f17bd1"),
    messagePlaceholder:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.0a3237362d"),
    messageRequired: getNativeCopy("native.apps.web.app.feedback.page.tsx.e8cc1cac23"),
    notShared: getNativeCopy("native.apps.web.app.feedback.page.tsx.a85c3ae10b"),
    notSure: getNativeCopy("native.apps.web.app.feedback.page.tsx.58d4f3c7ae"),
    pageLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.8aa282f6a6"),
    pagePlaceholder: getNativeCopy("native.apps.web.app.feedback.page.tsx.d12d042739"),
    pass: getNativeCopy("native.apps.web.app.feedback.page.tsx.14a25015c5"),
    saved:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.f7d0237cbe"),
    savedLocally:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.24695b3751"),
    send: getNativeCopy("native.apps.web.app.feedback.page.tsx.5d32b685d5"),
    sending: getNativeCopy("native.apps.web.app.feedback.page.tsx.d15a856f65"),
    signedInEmailNote:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.3da6d30540"),
    testerLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.5655feeaa3"),
    testerOptions: [
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.fb3a6c91f0"), value: 'friends-family' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.f15c23c3c4"), value: 'founder-review' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.feaff45387"), value: 'investor-demo' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.5e4b3429e9"), value: 'public' },
    ],
    title: getNativeCopy("native.apps.web.app.feedback.page.tsx.c50d877b71"),
    writeHere: getNativeCopy("native.apps.web.app.feedback.page.tsx.d644ef3a01"),
  },
  gu: {
    areaLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.ad93d9c03d"),
    areaOptions: [
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.d5c836c168"), value: 'general' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.3ea3967ddd"), value: 'chat' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.a2a547620f"), value: 'charts' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.faf6145e41"), value: 'report' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.7acadffa2e"), value: 'schools' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.1aed2b9335"), value: 'language' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.52a46f8243"), value: 'safety' },
    ],
    body: getNativeCopy("native.apps.web.app.feedback.page.tsx.fdc32b3fd2"),
    cards: [
      {
        body: getNativeCopy("native.apps.web.app.feedback.page.tsx.ed6fb5b0de"),
        title: getNativeCopy("native.apps.web.app.feedback.page.tsx.3a7a3de314"),
      },
      {
        body: getNativeCopy("native.apps.web.app.feedback.page.tsx.4593229d66"),
        title: getNativeCopy("native.apps.web.app.feedback.page.tsx.e538450b9e"),
      },
      {
        body: getNativeCopy("native.apps.web.app.feedback.page.tsx.593bcd725a"),
        title: getNativeCopy("native.apps.web.app.feedback.page.tsx.01034f92c0"),
      },
    ],
    dashboard: getNativeCopy("native.apps.web.app.feedback.page.tsx.d6157e75b1"),
    emailBackup: getNativeCopy("native.apps.web.app.feedback.page.tsx.6b8892165d"),
    emailBodyLabels: {
      area: getNativeCopy("native.apps.web.app.feedback.page.tsx.3a0c413736"),
      email: getNativeCopy("native.apps.web.app.feedback.page.tsx.44c1cf4c2e"),
      message: getNativeCopy("native.apps.web.app.feedback.page.tsx.45e6ec70ce"),
      page: getNativeCopy("native.apps.web.app.feedback.page.tsx.95fdeeaf17"),
      userType: getNativeCopy("native.apps.web.app.feedback.page.tsx.ae2dbf2e77"),
    },
    emailLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.2e3361c554"),
    emailPlaceholder: getNativeCopy("native.apps.web.app.feedback.page.tsx.a6071c1132"),
    emailSubject: getNativeCopy("native.apps.web.app.feedback.page.tsx.ace36542f0"),
    footerBody:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.e20009b45a"),
    footerTitle: getNativeCopy("native.apps.web.app.feedback.page.tsx.723f1e8e9a"),
    formEyebrow: getNativeCopy("native.apps.web.app.feedback.page.tsx.49c6de1196"),
    formTitle: getNativeCopy("native.apps.web.app.feedback.page.tsx.32a8987856"),
    messageLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.a4017c963f"),
    messagePlaceholder:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.ac69ccfa8b"),
    messageRequired: getNativeCopy("native.apps.web.app.feedback.page.tsx.7bc4c96e8f"),
    notShared: getNativeCopy("native.apps.web.app.feedback.page.tsx.cb34664827"),
    notSure: getNativeCopy("native.apps.web.app.feedback.page.tsx.cdca3a87cf"),
    pageLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.04e0cfd6a5"),
    pagePlaceholder: getNativeCopy("native.apps.web.app.feedback.page.tsx.c1c25a3b9c"),
    pass: getNativeCopy("native.apps.web.app.feedback.page.tsx.1702bf49c2"),
    saved:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.58de69376b"),
    savedLocally:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.32c8d39fbb"),
    send: getNativeCopy("native.apps.web.app.feedback.page.tsx.18feda7507"),
    sending: getNativeCopy("native.apps.web.app.feedback.page.tsx.7c2e5ced5f"),
    signedInEmailNote:
      getNativeCopy("native.apps.web.app.feedback.page.tsx.587c91e105"),
    testerLabel: getNativeCopy("native.apps.web.app.feedback.page.tsx.d106ac8857"),
    testerOptions: [
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.dd0ecde0be"), value: 'friends-family' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.0190242084"), value: 'founder-review' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.952ed052dc"), value: 'investor-demo' },
      { label: getNativeCopy("native.apps.web.app.feedback.page.tsx.ff63116b02"), value: 'public' },
    ],
    title: getNativeCopy("native.apps.web.app.feedback.page.tsx.ef93dfdc81"),
    writeHere: getNativeCopy("native.apps.web.app.feedback.page.tsx.b8bc2153ca"),
  },
};
