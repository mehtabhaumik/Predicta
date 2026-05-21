'use client';

import { type FormEvent, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import type { SupportedLanguage } from '@pridicta/types';
import { getFirebaseWebAuth } from '../lib/firebase/client';
import { useLanguagePreference } from '../lib/language-preference';
import { useDialogFocusTrap } from '../lib/use-dialog-focus-trap';

type AuthMode = 'sign-in' | 'register' | 'reset';
type AuthMessageTone = 'error' | 'success';

export function AuthDialog(): React.JSX.Element {
  const { language } = useLanguagePreference();
  const copy = AUTH_COPY[language];
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageTone, setMessageTone] = useState<AuthMessageTone>('success');
  const [busy, setBusy] = useState(false);
  const dialogRef = useRef<HTMLElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useDialogFocusTrap(dialogRef, {
    active: open,
    initialFocusRef: emailInputRef,
    onClose: () => setOpen(false),
  });

  async function runAuth(
    action: () => Promise<unknown>,
    success: string,
    options?: { closeOnSuccess?: boolean },
  ) {
    try {
      setBusy(true);
      setMessage('');
      await action();
      setMessageTone('success');
      setMessage(success);
      if (options?.closeOnSuccess) {
        window.setTimeout(() => setOpen(false), 700);
      }
    } catch (error) {
      setMessageTone('error');
      setMessage(getFriendlyAuthError(error, copy));
    } finally {
      setBusy(false);
    }
  }

  function googleSignIn() {
    return runAuth(
      () => signInWithPopup(getFirebaseWebAuth(), new GoogleAuthProvider()),
      copy.signedInSuccess,
      { closeOnSuccess: true },
    );
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage('');
    setConfirmPassword('');
  }

  function emailSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();

    if (mode === 'reset') {
      return resetPassword();
    }

    if (!email.trim() || !password) {
      setMessageTone('error');
      setMessage(copy.enterEmailPassword);
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setMessageTone('error');
      setMessage(copy.passwordHint);
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setMessageTone('error');
      setMessage(copy.passwordMismatch);
      return;
    }

    return runAuth(
      () =>
        mode === 'register'
          ? createUserWithEmailAndPassword(
              getFirebaseWebAuth(),
              email.trim(),
              password,
            )
          : signInWithEmailAndPassword(
              getFirebaseWebAuth(),
              email.trim(),
              password,
            ),
      mode === 'register'
        ? copy.accountCreatedSuccess
        : copy.signedInSuccess,
      { closeOnSuccess: true },
    );
  }

  function resetPassword() {
    if (!email.trim()) {
      setMessageTone('error');
      setMessage(copy.enterEmailForReset);
      return;
    }

    return runAuth(
      () => sendPasswordResetEmail(getFirebaseWebAuth(), email.trim()),
      copy.resetSentSuccess,
    );
  }

  return (
    <>
      <button className="button" onClick={() => setOpen(true)} type="button">
        {copy.trigger}
      </button>

      {open ? (
        <div
          className="auth-dialog-backdrop"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setOpen(false);
            }
          }}
        >
          <section
            aria-describedby="auth-dialog-body"
            aria-labelledby="auth-dialog-title"
            aria-modal="true"
            className="auth-dialog glass-panel"
            ref={dialogRef}
            role="dialog"
            tabIndex={-1}
          >
            <button
              aria-label={copy.closeLabel}
              className="dialog-close"
              onClick={() => setOpen(false)}
              type="button"
            >
              ×
            </button>

            <div className="auth-dialog-hero">
              <div className="section-title">{copy.eyebrow}</div>
              <h2 id="auth-dialog-title">
                {mode === 'register'
                  ? copy.registerTitle
                  : mode === 'reset'
                    ? copy.resetTitle
                    : copy.signInTitle}
              </h2>
              <p id="auth-dialog-body">
                {mode === 'register'
                  ? copy.registerBody
                  : mode === 'reset'
                    ? copy.resetBody
                    : copy.body}
              </p>
            </div>

            <div className="auth-trust-strip" aria-label={copy.trustStripLabel}>
              {copy.trustPoints.map(point => (
                <span key={point}>{point}</span>
              ))}
            </div>

            <button
              className="auth-google-button"
              disabled={busy}
              onClick={googleSignIn}
              type="button"
            >
              <span className="provider-icon google-icon" aria-hidden>
                G
              </span>
              {copy.google}
            </button>

            <div className="auth-divider">
              <span>{copy.emailPassword}</span>
            </div>

            <div className="auth-mode-tabs">
              <button
                className={mode === 'sign-in' ? 'active' : ''}
                onClick={() => switchMode('sign-in')}
                type="button"
              >
                {copy.signInTab}
              </button>
              <button
                className={mode === 'register' ? 'active' : ''}
                onClick={() => switchMode('register')}
                type="button"
              >
                {copy.registerTab}
              </button>
            </div>

            <form className="auth-email-form" onSubmit={emailSubmit}>
              <div className="field-stack">
                <label className="field-label" htmlFor="auth-email">
                  {copy.emailLabel}
                </label>
                <input
                  autoComplete="email"
                  id="auth-email"
                  onChange={event => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  ref={emailInputRef}
                  type="email"
                  value={email}
                />
                {mode === 'register' ? (
                  <small className="field-hint">{copy.emailPassHint}</small>
                ) : null}
              </div>

              {mode !== 'reset' ? (
                <div className="field-stack">
                  <label className="field-label" htmlFor="auth-password">
                    {copy.passwordLabel}
                  </label>
                  <input
                    autoComplete={
                      mode === 'register' ? 'new-password' : 'current-password'
                    }
                    id="auth-password"
                    onChange={event => setPassword(event.target.value)}
                    placeholder={copy.passwordPlaceholder}
                    type="password"
                    value={password}
                  />
                  {mode === 'register' ? (
                    <small className="field-hint">{copy.passwordHint}</small>
                  ) : null}
                </div>
              ) : null}

              {mode === 'register' ? (
                <div className="field-stack">
                  <label className="field-label" htmlFor="auth-confirm-password">
                    {copy.confirmPasswordLabel}
                  </label>
                  <input
                    autoComplete="new-password"
                    id="auth-confirm-password"
                    onChange={event => setConfirmPassword(event.target.value)}
                    placeholder={copy.confirmPasswordPlaceholder}
                    type="password"
                    value={confirmPassword}
                  />
                </div>
              ) : null}

              {message ? (
                <p aria-live="polite" className={`dialog-message ${messageTone}`}>
                  {message}
                </p>
              ) : null}

              <div className="dialog-actions">
                {mode === 'reset' ? (
                  <>
                    <button className="button" disabled={busy} type="submit">
                      {busy ? copy.sending : copy.sendReset}
                    </button>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() => switchMode('sign-in')}
                      type="button"
                    >
                      {copy.backToSignIn}
                    </button>
                  </>
                ) : (
                  <>
                    <button className="button" disabled={busy} type="submit">
                      {busy
                        ? copy.wait
                        : mode === 'register'
                          ? copy.registerAction
                          : copy.signInAction}
                    </button>
                    <button
                      className="button secondary"
                      disabled={busy}
                      onClick={() => switchMode('reset')}
                      type="button"
                    >
                      {copy.forgotPassword}
                    </button>
                  </>
                )}
              </div>
            </form>

            <p className="auth-legal-note">
              {copy.legalNote} <a href="/legal">{copy.legalLink}</a>
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}

function getFriendlyAuthError(error: unknown, copy: AuthCopy): string {
  if (!(error instanceof Error)) {
    return copy.genericError;
  }

  if (error.message.includes('incomplete')) {
    return copy.setupError;
  }

  if (/email-already-in-use/i.test(error.message)) {
    return copy.emailExists;
  }

  if (/invalid-credential|wrong-password|user-not-found/i.test(error.message)) {
    return copy.invalidCredential;
  }

  if (/weak-password/i.test(error.message)) {
    return copy.passwordHint;
  }

  return copy.genericError;
}

type AuthCopy = {
  backToSignIn: string;
  body: string;
  closeLabel: string;
  confirmPasswordLabel: string;
  confirmPasswordPlaceholder: string;
  emailLabel: string;
  emailPassword: string;
  emailPassHint: string;
  emailExists: string;
  enterEmailForReset: string;
  enterEmailPassword: string;
  eyebrow: string;
  forgotPassword: string;
  genericError: string;
  google: string;
  invalidCredential: string;
  passwordHint: string;
  passwordLabel: string;
  passwordMismatch: string;
  passwordPlaceholder: string;
  registerAction: string;
  registerBody: string;
  registerTab: string;
  registerTitle: string;
  accountCreatedSuccess: string;
  resetTitle: string;
  resetBody: string;
  resetSentSuccess: string;
  sendReset: string;
  sending: string;
  signInAction: string;
  signInTab: string;
  signInTitle: string;
  signedInSuccess: string;
  setupError: string;
  trigger: string;
  trustPoints: string[];
  trustStripLabel: string;
  legalNote: string;
  legalLink: string;
  wait: string;
};

const AUTH_COPY: Record<SupportedLanguage, AuthCopy> = {
  en: {
    backToSignIn: 'Back to sign in',
    body:
      'Keep your Kundlis, report choices, family profiles, and saved chats with one calm account.',
    closeLabel: 'Close sign-in dialog',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordPlaceholder: 'Re-enter password',
    emailLabel: 'Email',
    emailPassword: 'Email and password',
    emailPassHint:
      'Use the same email you want tied to your Kundlis, reports, or private pass.',
    emailExists:
      'An account already exists for this email. Please sign in or reset the password.',
    enterEmailForReset: 'Enter your email before requesting a reset link.',
    enterEmailPassword: 'Enter your email and password first.',
    eyebrow: 'ACCOUNT ACCESS',
    forgotPassword: 'Forgot password?',
    genericError: 'Sign-in could not be completed. Please try again.',
    google: 'Continue with Google',
    invalidCredential:
      'The email or password is not correct. Please try again or use reset password.',
    legalLink: 'terms and privacy',
    legalNote: 'By continuing, you agree to Predicta’s',
    passwordHint: 'Use at least 6 characters.',
    passwordLabel: 'Password',
    passwordMismatch: 'Both password fields must match.',
    passwordPlaceholder: 'Enter password',
    registerAction: 'Create account',
    registerBody:
      'Create an account with Google or email/password so your Kundlis, reports, passes, and chats stay with you everywhere.',
    registerTab: 'Create account',
    registerTitle: 'Create your Predicta account',
    accountCreatedSuccess:
      'Account created. Your saved Kundli, reports, and chats stay with this account.',
    resetTitle: 'Reset your password',
    resetBody:
      'Enter your account email. Predicta will send a reset link if that email has an account.',
    resetSentSuccess:
      'Password reset link sent. Check your email and then return to sign in.',
    sendReset: 'Send reset link',
    sending: 'Sending...',
    signInAction: 'Sign in',
    signInTab: 'Sign in',
    signInTitle: 'Sign in to Predicta',
    signedInSuccess:
      'Signed in. Your saved Kundli, reports, and chats stay with this account.',
    setupError: 'Sign-in could not be opened here. Please try again in a moment.',
    trigger: 'Sign in',
    trustPoints: ['Your saved work stays with one account', 'Private passes stay tied to the approved email', 'Password reset is available any time'],
    trustStripLabel: 'Account safety notes',
    wait: 'Please wait...',
  },
  hi: {
    backToSignIn: 'साइन इन पर लौटें',
    body:
      'अपनी कुंडलियां, रिपोर्ट पसंद, परिवार प्रोफाइल और सेव चैट एक ही सुरक्षित खाते में रखें.',
    closeLabel: 'साइन इन विंडो बंद करें',
    confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'पासवर्ड दोबारा लिखें',
    emailLabel: 'ईमेल',
    emailPassword: 'ईमेल और पासवर्ड',
    emailPassHint:
      'वही ईमेल रखें जिसे आप अपनी कुंडली, रिपोर्ट या निजी पास के साथ जोड़ना चाहते हैं.',
    emailExists:
      'इस ईमेल से खाता पहले से मौजूद है. कृपया साइन इन करें या पासवर्ड रीसेट करें.',
    enterEmailForReset: 'रीसेट लिंक मांगने से पहले ईमेल लिखें.',
    enterEmailPassword: 'पहले ईमेल और पासवर्ड लिखें.',
    eyebrow: 'खाता प्रवेश',
    forgotPassword: 'पासवर्ड भूल गए?',
    genericError: 'साइन इन पूरा नहीं हो सका. कृपया दोबारा कोशिश करें.',
    google: 'Google से जारी रखें',
    invalidCredential:
      'ईमेल या पासवर्ड सही नहीं है. कृपया दोबारा कोशिश करें या पासवर्ड रीसेट करें.',
    legalLink: 'नियम और गोपनीयता',
    legalNote: 'आगे बढ़कर आप प्रेडिक्टा के',
    passwordHint: 'कम से कम 6 अक्षर रखें.',
    passwordLabel: 'पासवर्ड',
    passwordMismatch: 'दोनों पासवर्ड एक जैसे होने चाहिए.',
    passwordPlaceholder: 'पासवर्ड लिखें',
    registerAction: 'खाता बनाएं',
    registerBody:
      'Google या ईमेल/पासवर्ड से खाता बनाएं ताकि आपकी कुंडलियां, रिपोर्ट, पास और चैट आपके साथ सुरक्षित रहें.',
    registerTab: 'खाता बनाएं',
    registerTitle: 'अपना प्रेडिक्टा खाता बनाएं',
    accountCreatedSuccess:
      'खाता बन गया. आपकी सेव कुंडली, रिपोर्ट और चैट इसी खाते में रहेंगी.',
    resetTitle: 'पासवर्ड रीसेट करें',
    resetBody:
      'अपने खाते का ईमेल लिखें. अगर उस ईमेल से खाता है, तो रीसेट लिंक भेजा जाएगा.',
    resetSentSuccess:
      'पासवर्ड रीसेट लिंक भेज दिया गया है. ईमेल देखें और फिर साइन इन करें.',
    sendReset: 'रीसेट लिंक भेजें',
    sending: 'भेज रहे हैं...',
    signInAction: 'साइन इन करें',
    signInTab: 'साइन इन',
    signInTitle: 'प्रेडिक्टा में साइन इन करें',
    signedInSuccess:
      'साइन इन हो गया. आपकी सेव कुंडली, रिपोर्ट और चैट इसी खाते में रहेंगी.',
    setupError: 'यहां साइन इन अभी नहीं खुल सका. कृपया थोड़ी देर बाद फिर कोशिश करें.',
    trigger: 'साइन इन करें',
    trustPoints: ['आपका सेव काम एक ही खाते में रहता है', 'निजी पास स्वीकृत ईमेल से जुड़ा रहता है', 'पासवर्ड कभी भी रीसेट किया जा सकता है'],
    trustStripLabel: 'खाता सुरक्षा नोट',
    wait: 'कृपया प्रतीक्षा करें...',
  },
  gu: {
    backToSignIn: 'સાઇન ઇન પર પાછા જાઓ',
    body:
      'તમારી કુંડળીઓ, રિપોર્ટ પસંદગીઓ, પરિવાર પ્રોફાઇલ અને સેવ કરેલી ચેટ એક જ સુરક્ષિત ખાતા સાથે રાખો.',
    closeLabel: 'સાઇન ઇન વિન્ડો બંધ કરો',
    confirmPasswordLabel: 'પાસવર્ડની પુષ્ટિ કરો',
    confirmPasswordPlaceholder: 'પાસવર્ડ ફરીથી લખો',
    emailLabel: 'ઇમેઇલ',
    emailPassword: 'ઇમેઇલ અને પાસવર્ડ',
    emailPassHint:
      'એ જ ઇમેઇલ રાખો જેને તમે તમારી કુંડળી, રિપોર્ટ અથવા ખાનગી પાસ સાથે જોડવા માંગો છો.',
    emailExists:
      'આ ઇમેઇલથી ખાતું પહેલેથી છે. કૃપા કરીને સાઇન ઇન કરો અથવા પાસવર્ડ રીસેટ કરો.',
    enterEmailForReset: 'રીસેટ લિંક માગતા પહેલાં ઇમેઇલ લખો.',
    enterEmailPassword: 'પહેલાં ઇમેઇલ અને પાસવર્ડ લખો.',
    eyebrow: 'ખાતા પ્રવેશ',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
    genericError: 'સાઇન ઇન પૂર્ણ થઈ શક્યું નહીં. કૃપા કરીને ફરી પ્રયાસ કરો.',
    google: 'Google થી આગળ વધો',
    invalidCredential:
      'ઇમેઇલ અથવા પાસવર્ડ સાચો નથી. કૃપા કરીને ફરી પ્રયાસ કરો અથવા પાસવર્ડ રીસેટ કરો.',
    legalLink: 'નિયમો અને ગોપનીયતા',
    legalNote: 'આગળ વધીને તમે પ્રેડિક્ટાના',
    passwordHint: 'ઓછામાં ઓછા 6 અક્ષર રાખો.',
    passwordLabel: 'પાસવર્ડ',
    passwordMismatch: 'બંને પાસવર્ડ એકસરખા હોવા જોઈએ.',
    passwordPlaceholder: 'પાસવર્ડ લખો',
    registerAction: 'ખાતું બનાવો',
    registerBody:
      'Google અથવા ઇમેઇલ/પાસવર્ડથી ખાતું બનાવો જેથી તમારી કુંડળી, રિપોર્ટ, પાસ અને ચેટ તમારી સાથે સુરક્ષિત રહે.',
    registerTab: 'ખાતું બનાવો',
    registerTitle: 'તમારું પ્રેડિક્ટા ખાતું બનાવો',
    accountCreatedSuccess:
      'ખાતું બની ગયું. તમારી સેવ કુંડળી, રિપોર્ટ અને ચેટ આ ખાતા સાથે રહેશે.',
    resetTitle: 'પાસવર્ડ રીસેટ કરો',
    resetBody:
      'તમારા ખાતાનું ઇમેઇલ લખો. જો તે ઇમેઇલથી ખાતું હશે, તો રીસેટ લિંક મોકલાશે.',
    resetSentSuccess:
      'પાસવર્ડ રીસેટ લિંક મોકલી છે. ઇમેઇલ જુઓ અને પછી સાઇન ઇન કરો.',
    sendReset: 'રીસેટ લિંક મોકલો',
    sending: 'મોકલી રહ્યા છીએ...',
    signInAction: 'સાઇન ઇન કરો',
    signInTab: 'સાઇન ઇન',
    signInTitle: 'પ્રેડિક્ટામાં સાઇન ઇન કરો',
    signedInSuccess:
      'સાઇન ઇન થઈ ગયું. તમારી સેવ કુંડળી, રિપોર્ટ અને ચેટ આ ખાતા સાથે રહેશે.',
    setupError: 'અહીં સાઇન ઇન હમણાં ખૂલ્યું નથી. કૃપા કરીને થોડા સમય પછી ફરી પ્રયાસ કરો.',
    trigger: 'સાઇન ઇન કરો',
    trustPoints: ['તમારું સેવ કામ એક જ ખાતા સાથે રહે છે', 'ખાનગી પાસ મંજૂર ઇમેઇલ સાથે જોડાયેલ રહે છે', 'પાસવર્ડ ક્યારેય પણ રીસેટ કરી શકો છો'],
    trustStripLabel: 'ખાતા સુરક્ષા નોંધ',
    wait: 'કૃપા કરીને રાહ જુઓ...',
  },
};
