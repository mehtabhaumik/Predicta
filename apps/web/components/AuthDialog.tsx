'use client';

import { getNativeCopy } from '@pridicta/config';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
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

  useEffect(() => {
    try {
      getRedirectResult(getFirebaseWebAuth())
        .then(result => {
          if (result?.user) {
            setMessageTone('success');
            setMessage(copy.signedInSuccess);
            window.setTimeout(() => setOpen(false), 700);
          }
        })
        .catch(error => {
          setMessageTone('error');
          setMessage(getFriendlyAuthError(error, copy));
        });
    } catch (error) {
      if (open) {
        setMessageTone('error');
        setMessage(getFriendlyAuthError(error, copy));
      }
    }
  }, [copy, open]);

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
      async () => {
        const auth = getFirebaseWebAuth();
        const provider = new GoogleAuthProvider();
        try {
          await signInWithPopup(auth, provider);
        } catch (error) {
          if (isPopupBlockedAuthError(error)) {
            await signInWithRedirect(auth, provider);
            return;
          }
          throw error;
        }
      },
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

function isPopupBlockedAuthError(error: unknown): boolean {
  return (
    error instanceof Error &&
    /popup-blocked|cancelled-popup-request/i.test(
      error.message,
    )
  );
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
    backToSignIn: getNativeCopy("native.apps.web.components.AuthDialog.tsx.93d52255a4"),
    body:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.6616e97cb0"),
    closeLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.6c27bf1f71"),
    confirmPasswordLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.d81587292b"),
    confirmPasswordPlaceholder: getNativeCopy("native.apps.web.components.AuthDialog.tsx.5b71f26da1"),
    emailLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.d463d51545"),
    emailPassword: getNativeCopy("native.apps.web.components.AuthDialog.tsx.909db95360"),
    emailPassHint:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.2b81ea9574"),
    emailExists:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.b584e17ae3"),
    enterEmailForReset: getNativeCopy("native.apps.web.components.AuthDialog.tsx.e20e85bee0"),
    enterEmailPassword: getNativeCopy("native.apps.web.components.AuthDialog.tsx.a7fabb92fa"),
    eyebrow: getNativeCopy("native.apps.web.components.AuthDialog.tsx.5617d8b8fc"),
    forgotPassword: getNativeCopy("native.apps.web.components.AuthDialog.tsx.aeef434a27"),
    genericError: getNativeCopy("native.apps.web.components.AuthDialog.tsx.554fa32229"),
    google: getNativeCopy("native.apps.web.components.AuthDialog.tsx.9caf19475d"),
    invalidCredential:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.66ea52cd37"),
    legalLink: getNativeCopy("native.apps.web.components.AuthDialog.tsx.4e14909380"),
    legalNote: getNativeCopy("native.apps.web.components.AuthDialog.tsx.32b1e8b26d"),
    passwordHint: getNativeCopy("native.apps.web.components.AuthDialog.tsx.1a783cda37"),
    passwordLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.f97a3845c2"),
    passwordMismatch: getNativeCopy("native.apps.web.components.AuthDialog.tsx.19e1820118"),
    passwordPlaceholder: getNativeCopy("native.apps.web.components.AuthDialog.tsx.570477adb6"),
    registerAction: getNativeCopy("native.apps.web.components.AuthDialog.tsx.9790fec04f"),
    registerBody:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.93a94b6461"),
    registerTab: getNativeCopy("native.apps.web.components.AuthDialog.tsx.9790fec04f"),
    registerTitle: getNativeCopy("native.apps.web.components.AuthDialog.tsx.eb7cc1cf77"),
    accountCreatedSuccess:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.c681d6dbcd"),
    resetTitle: getNativeCopy("native.apps.web.components.AuthDialog.tsx.65dd3a50b6"),
    resetBody:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.cbe66ecac3"),
    resetSentSuccess:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.3159eafe25"),
    sendReset: getNativeCopy("native.apps.web.components.AuthDialog.tsx.ceb4efa8d3"),
    sending: getNativeCopy("native.apps.web.components.AuthDialog.tsx.d15a856f65"),
    signInAction: getNativeCopy("native.apps.web.components.AuthDialog.tsx.f2f9ae6729"),
    signInTab: getNativeCopy("native.apps.web.components.AuthDialog.tsx.978919bf0d"),
    signInTitle: getNativeCopy("native.apps.web.components.AuthDialog.tsx.052747fd89"),
    signedInSuccess:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.f0c92a63d9"),
    setupError: getNativeCopy("native.apps.web.components.AuthDialog.tsx.be5a9ab270"),
    trigger: getNativeCopy("native.apps.web.components.AuthDialog.tsx.f2f9ae6729"),
    trustPoints: [getNativeCopy("native.apps.web.components.AuthDialog.tsx.f74f59c4e0"), getNativeCopy("native.apps.web.components.AuthDialog.tsx.0acae5c818"), getNativeCopy("native.apps.web.components.AuthDialog.tsx.aaf033774b")],
    trustStripLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.5389beba46"),
    wait: getNativeCopy("native.apps.web.components.AuthDialog.tsx.77a27046c4"),
  },
  gu: {
    backToSignIn: getNativeCopy("native.apps.web.components.AuthDialog.tsx.5d6c4b8aca"),
    body:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.5b8d0922d5"),
    closeLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.7e972a7890"),
    confirmPasswordLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.9cb29c10ad"),
    confirmPasswordPlaceholder: getNativeCopy("native.apps.web.components.AuthDialog.tsx.05671193bd"),
    emailLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.e759cb3355"),
    emailPassword: getNativeCopy("native.apps.web.components.AuthDialog.tsx.e91c4136e0"),
    emailPassHint:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.4b9649557a"),
    emailExists:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.b47c4cb032"),
    enterEmailForReset: getNativeCopy("native.apps.web.components.AuthDialog.tsx.8a222ed8d9"),
    enterEmailPassword: getNativeCopy("native.apps.web.components.AuthDialog.tsx.a47d4051d9"),
    eyebrow: getNativeCopy("native.apps.web.components.AuthDialog.tsx.de8287c251"),
    forgotPassword: getNativeCopy("native.apps.web.components.AuthDialog.tsx.9ab93be2b0"),
    genericError: getNativeCopy("native.apps.web.components.AuthDialog.tsx.8bd36f51d3"),
    google: getNativeCopy("native.apps.web.components.AuthDialog.tsx.d4393da35a"),
    invalidCredential:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.dcd32363f8"),
    legalLink: getNativeCopy("native.apps.web.components.AuthDialog.tsx.2ac5666a93"),
    legalNote: getNativeCopy("native.apps.web.components.AuthDialog.tsx.6c71b99c4c"),
    passwordHint: getNativeCopy("native.apps.web.components.AuthDialog.tsx.115270d916"),
    passwordLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.5c25680b39"),
    passwordMismatch: getNativeCopy("native.apps.web.components.AuthDialog.tsx.5ba536e935"),
    passwordPlaceholder: getNativeCopy("native.apps.web.components.AuthDialog.tsx.b0643d5384"),
    registerAction: getNativeCopy("native.apps.web.components.AuthDialog.tsx.e64866a2ab"),
    registerBody:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.5902fa7f1b"),
    registerTab: getNativeCopy("native.apps.web.components.AuthDialog.tsx.e64866a2ab"),
    registerTitle: getNativeCopy("native.apps.web.components.AuthDialog.tsx.89fba5be38"),
    accountCreatedSuccess:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.78b51c0ef0"),
    resetTitle: getNativeCopy("native.apps.web.components.AuthDialog.tsx.c7288d14ba"),
    resetBody:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.b7007ae36d"),
    resetSentSuccess:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.ad7f57f43f"),
    sendReset: getNativeCopy("native.apps.web.components.AuthDialog.tsx.6b25769235"),
    sending: getNativeCopy("native.apps.web.components.AuthDialog.tsx.7c2e5ced5f"),
    signInAction: getNativeCopy("native.apps.web.components.AuthDialog.tsx.c4c4c411d7"),
    signInTab: getNativeCopy("native.apps.web.components.AuthDialog.tsx.bee0e724a7"),
    signInTitle: getNativeCopy("native.apps.web.components.AuthDialog.tsx.a56e3acc3b"),
    signedInSuccess:
      getNativeCopy("native.apps.web.components.AuthDialog.tsx.a4c384b31c"),
    setupError: getNativeCopy("native.apps.web.components.AuthDialog.tsx.a1e124e0f0"),
    trigger: getNativeCopy("native.apps.web.components.AuthDialog.tsx.c4c4c411d7"),
    trustPoints: [getNativeCopy("native.apps.web.components.AuthDialog.tsx.b94be19cc5"), getNativeCopy("native.apps.web.components.AuthDialog.tsx.c543f9e91e"), getNativeCopy("native.apps.web.components.AuthDialog.tsx.3d375a20b3")],
    trustStripLabel: getNativeCopy("native.apps.web.components.AuthDialog.tsx.8673d9aea5"),
    wait: getNativeCopy("native.apps.web.components.AuthDialog.tsx.2dd10567cd"),
  },
};
