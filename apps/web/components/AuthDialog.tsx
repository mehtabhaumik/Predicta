'use client';

import { useState } from 'react';
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

  async function runAuth(action: () => Promise<unknown>, success: string) {
    try {
      setBusy(true);
      setMessage('');
      await action();
      setMessageTone('success');
      setMessage(success);
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
    );
  }

  function emailSubmit() {
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
        <div aria-modal="true" className="auth-dialog-backdrop" role="dialog">
          <section className="auth-dialog glass-panel">
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
              <h2>
                {mode === 'register'
                  ? copy.registerTitle
                  : mode === 'reset'
                    ? copy.resetTitle
                    : copy.signInTitle}
              </h2>
              <p>{copy.body}</p>
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
                onClick={() => setMode('sign-in')}
                type="button"
              >
                {copy.signInTab}
              </button>
              <button
                className={mode === 'register' ? 'active' : ''}
                onClick={() => setMode('register')}
                type="button"
              >
                {copy.registerTab}
              </button>
            </div>

            <div className="field-stack">
              <label className="field-label" htmlFor="auth-email">
                {copy.emailLabel}
              </label>
              <input
                autoComplete="email"
                id="auth-email"
                onChange={event => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
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
              <p className={`dialog-message ${messageTone}`}>{message}</p>
            ) : null}

            <div className="dialog-actions">
              {mode === 'reset' ? (
                <>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={resetPassword}
                    type="button"
                  >
                    {busy ? copy.sending : copy.sendReset}
                  </button>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => setMode('sign-in')}
                    type="button"
                  >
                    {copy.backToSignIn}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="button"
                    disabled={busy}
                    onClick={emailSubmit}
                    type="button"
                  >
                    {busy
                      ? copy.wait
                      : mode === 'register'
                        ? copy.registerAction
                        : copy.signInAction}
                  </button>
                  <button
                    className="button secondary"
                    disabled={busy}
                    onClick={() => setMode('reset')}
                    type="button"
                  >
                    {copy.forgotPassword}
                  </button>
                </>
              )}
            </div>
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
  registerTab: string;
  registerTitle: string;
  accountCreatedSuccess: string;
  resetTitle: string;
  resetSentSuccess: string;
  sendReset: string;
  sending: string;
  signInAction: string;
  signInTab: string;
  signInTitle: string;
  signedInSuccess: string;
  setupError: string;
  trigger: string;
  wait: string;
};

const AUTH_COPY: Record<SupportedLanguage, AuthCopy> = {
  en: {
    backToSignIn: 'Back to sign in',
    body:
      'Keep your Kundlis, report choices, family profiles, and saved chats with your account. You can still keep one Kundli on this device without signing in.',
    closeLabel: 'Close sign-in dialog',
    confirmPasswordLabel: 'Confirm password',
    confirmPasswordPlaceholder: 'Re-enter password',
    emailLabel: 'Email',
    emailPassword: 'Email and password',
    emailExists:
      'An account already exists for this email. Please sign in or reset the password.',
    enterEmailForReset: 'Enter your email before requesting a reset link.',
    enterEmailPassword: 'Enter your email and password first.',
    eyebrow: 'PRIVATE ACCOUNT',
    forgotPassword: 'Forgot password?',
    genericError: 'Sign-in could not be completed. Please try again.',
    google: 'Continue with Google',
    invalidCredential:
      'The email or password is not correct. Please try again or use reset password.',
    passwordHint: 'Use at least 6 characters.',
    passwordLabel: 'Password',
    passwordMismatch: 'Both password fields must match.',
    passwordPlaceholder: 'Enter password',
    registerAction: 'Create account',
    registerTab: 'Create account',
    registerTitle: 'Create your Predicta account',
    accountCreatedSuccess:
      'Account created. Your saved Kundli, reports, and chats stay with this account.',
    resetTitle: 'Reset your password',
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
    wait: 'Please wait...',
  },
  hi: {
    backToSignIn: 'साइन इन पर लौटें',
    body:
      'अपनी कुंडलियां, रिपोर्ट पसंद, परिवार प्रोफाइल और सेव चैट अपने खाते में सुरक्षित रखें. साइन इन किए बिना भी इस डिवाइस पर एक कुंडली रख सकते हैं.',
    closeLabel: 'साइन इन विंडो बंद करें',
    confirmPasswordLabel: 'पासवर्ड की पुष्टि करें',
    confirmPasswordPlaceholder: 'पासवर्ड दोबारा लिखें',
    emailLabel: 'ईमेल',
    emailPassword: 'ईमेल और पासवर्ड',
    emailExists:
      'इस ईमेल से खाता पहले से मौजूद है. कृपया साइन इन करें या पासवर्ड रीसेट करें.',
    enterEmailForReset: 'रीसेट लिंक मांगने से पहले ईमेल लिखें.',
    enterEmailPassword: 'पहले ईमेल और पासवर्ड लिखें.',
    eyebrow: 'निजी खाता',
    forgotPassword: 'पासवर्ड भूल गए?',
    genericError: 'साइन इन पूरा नहीं हो सका. कृपया दोबारा कोशिश करें.',
    google: 'Google से जारी रखें',
    invalidCredential:
      'ईमेल या पासवर्ड सही नहीं है. कृपया दोबारा कोशिश करें या पासवर्ड रीसेट करें.',
    passwordHint: 'कम से कम 6 अक्षर रखें.',
    passwordLabel: 'पासवर्ड',
    passwordMismatch: 'दोनों पासवर्ड एक जैसे होने चाहिए.',
    passwordPlaceholder: 'पासवर्ड लिखें',
    registerAction: 'खाता बनाएं',
    registerTab: 'खाता बनाएं',
    registerTitle: 'अपना प्रेडिक्टा खाता बनाएं',
    accountCreatedSuccess:
      'खाता बन गया. आपकी सेव कुंडली, रिपोर्ट और चैट इसी खाते में रहेंगी.',
    resetTitle: 'पासवर्ड रीसेट करें',
    resetSentSuccess:
      'पासवर्ड रीसेट लिंक भेज दिया गया है. ईमेल देखें और फिर साइन इन करें.',
    sendReset: 'रीसेट लिंक भेजें',
    sending: 'भेज रहे हैं...',
    signInAction: 'साइन इन करें',
    signInTab: 'साइन इन',
    signInTitle: 'प्रेडिक्टा में साइन इन करें',
    signedInSuccess:
      'साइन इन हो गया. आपकी सेव कुंडली, रिपोर्ट और चैट इसी खाते में रहेंगी.',
    setupError: 'यहां साइन इन अभी तैयार नहीं है.',
    trigger: 'साइन इन करें',
    wait: 'कृपया प्रतीक्षा करें...',
  },
  gu: {
    backToSignIn: 'સાઇન ઇન પર પાછા જાઓ',
    body:
      'તમારી કુંડળીઓ, રિપોર્ટ પસંદગીઓ, પરિવાર પ્રોફાઇલ અને સેવ કરેલી ચેટ તમારા ખાતા સાથે સુરક્ષિત રાખો. સાઇન ઇન કર્યા વગર પણ આ ડિવાઇસ પર એક કુંડળી રાખી શકો છો.',
    closeLabel: 'સાઇન ઇન વિન્ડો બંધ કરો',
    confirmPasswordLabel: 'પાસવર્ડની પુષ્ટિ કરો',
    confirmPasswordPlaceholder: 'પાસવર્ડ ફરીથી લખો',
    emailLabel: 'ઇમેઇલ',
    emailPassword: 'ઇમેઇલ અને પાસવર્ડ',
    emailExists:
      'આ ઇમેઇલથી ખાતું પહેલેથી છે. કૃપા કરીને સાઇન ઇન કરો અથવા પાસવર્ડ રીસેટ કરો.',
    enterEmailForReset: 'રીસેટ લિંક માગતા પહેલાં ઇમેઇલ લખો.',
    enterEmailPassword: 'પહેલાં ઇમેઇલ અને પાસવર્ડ લખો.',
    eyebrow: 'ખાનગી ખાતું',
    forgotPassword: 'પાસવર્ડ ભૂલી ગયા?',
    genericError: 'સાઇન ઇન પૂર્ણ થઈ શક્યું નહીં. કૃપા કરીને ફરી પ્રયાસ કરો.',
    google: 'Google થી આગળ વધો',
    invalidCredential:
      'ઇમેઇલ અથવા પાસવર્ડ સાચો નથી. કૃપા કરીને ફરી પ્રયાસ કરો અથવા પાસવર્ડ રીસેટ કરો.',
    passwordHint: 'ઓછામાં ઓછા 6 અક્ષર રાખો.',
    passwordLabel: 'પાસવર્ડ',
    passwordMismatch: 'બંને પાસવર્ડ એકસરખા હોવા જોઈએ.',
    passwordPlaceholder: 'પાસવર્ડ લખો',
    registerAction: 'ખાતું બનાવો',
    registerTab: 'ખાતું બનાવો',
    registerTitle: 'તમારું પ્રેડિક્ટા ખાતું બનાવો',
    accountCreatedSuccess:
      'ખાતું બની ગયું. તમારી સેવ કુંડળી, રિપોર્ટ અને ચેટ આ ખાતા સાથે રહેશે.',
    resetTitle: 'પાસવર્ડ રીસેટ કરો',
    resetSentSuccess:
      'પાસવર્ડ રીસેટ લિંક મોકલી છે. ઇમેઇલ જુઓ અને પછી સાઇન ઇન કરો.',
    sendReset: 'રીસેટ લિંક મોકલો',
    sending: 'મોકલી રહ્યા છીએ...',
    signInAction: 'સાઇન ઇન કરો',
    signInTab: 'સાઇન ઇન',
    signInTitle: 'પ્રેડિક્ટામાં સાઇન ઇન કરો',
    signedInSuccess:
      'સાઇન ઇન થઈ ગયું. તમારી સેવ કુંડળી, રિપોર્ટ અને ચેટ આ ખાતા સાથે રહેશે.',
    setupError: 'અહીં સાઇન ઇન હજી તૈયાર નથી.',
    trigger: 'સાઇન ઇન કરો',
    wait: 'કૃપા કરીને રાહ જુઓ...',
  },
};
