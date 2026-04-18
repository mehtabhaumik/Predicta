'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  GoogleAuthProvider,
  OAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from 'firebase/auth';
import { getFirebaseWebAuth } from '../lib/firebase/client';

type AuthMode = 'sign-in' | 'register';

export function AuthDialog(): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.body.classList.add('modal-open');
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.classList.remove('modal-open');
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function runAuth(action: () => Promise<unknown>, success: string) {
    try {
      setBusy(true);
      setMessage('');
      await action();
      setMessage(success);
    } catch (error) {
      setMessage(getFriendlyAuthError(error));
    } finally {
      setBusy(false);
    }
  }

  function providerSignIn(provider: 'google' | 'apple' | 'microsoft') {
    const authProvider =
      provider === 'google'
        ? new GoogleAuthProvider()
        : provider === 'apple'
        ? new OAuthProvider('apple.com')
        : new OAuthProvider('microsoft.com');

    return runAuth(
      () => signInWithPopup(getFirebaseWebAuth(), authProvider),
      'Signed in. Your account is ready.',
    );
  }

  function emailSubmit() {
    if (!email.trim() || !password) {
      setMessage('Enter your email and password first.');
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
      mode === 'register' ? 'Account created.' : 'Signed in.',
    );
  }

  function resetPassword() {
    if (!email.trim()) {
      setMessage('Enter your email before requesting a reset link.');
      return;
    }

    return runAuth(
      () => sendPasswordResetEmail(getFirebaseWebAuth(), email.trim()),
      'Password reset link sent.',
    );
  }

  return (
    <>
      <button className="button" onClick={() => setOpen(true)} type="button">
        Sign in
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  className="auth-dialog-backdrop"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.12 : 0.22 }}
                  onClick={() => setOpen(false)}
                >
                  <motion.section
                    aria-labelledby="auth-dialog-title"
                    aria-modal="true"
                    className="auth-dialog glass-panel"
                    initial={
                      reduceMotion ? false : { opacity: 0, scale: 0.96, y: 18 }
                    }
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.975, y: 10 }
                    }
                    role="dialog"
                    transition={{
                      duration: reduceMotion ? 0.12 : 0.28,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    onClick={event => event.stopPropagation()}
                  >
                    <button
                      aria-label="Close sign-in dialog"
                      className="dialog-close"
                      onClick={() => setOpen(false)}
                      type="button"
                    >
                      Close
                    </button>
                    <div className="section-title">ACCOUNT ACCESS</div>
                    <h2 id="auth-dialog-title">Sign in to Predicta</h2>
                    <p>
                      Use a social account or email password access. Local use
                      remains available when you continue without signing in.
                    </p>

                    <div className="auth-provider-grid">
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() => providerSignIn('google')}
                        type="button"
                      >
                        <span className="provider-icon google-icon" aria-hidden>
                          G
                        </span>
                        Continue with Google
                      </button>
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() => providerSignIn('apple')}
                        type="button"
                      >
                        <span
                          className="provider-icon apple-icon"
                          aria-hidden
                        />
                        Continue with Apple
                      </button>
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={() => providerSignIn('microsoft')}
                        type="button"
                      >
                        <span
                          className="provider-icon microsoft-icon"
                          aria-hidden
                        >
                          <i />
                          <i />
                          <i />
                          <i />
                        </span>
                        Continue with Microsoft
                      </button>
                    </div>

                    <div className="auth-mode-tabs">
                      <button
                        className={mode === 'sign-in' ? 'active' : ''}
                        onClick={() => setMode('sign-in')}
                        type="button"
                      >
                        Sign in
                      </button>
                      <button
                        className={mode === 'register' ? 'active' : ''}
                        onClick={() => setMode('register')}
                        type="button"
                      >
                        Register
                      </button>
                    </div>

                    <div className="field-stack">
                      <label className="field-label" htmlFor="auth-email">
                        Email
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

                    <div className="field-stack">
                      <label className="field-label" htmlFor="auth-password">
                        Password
                      </label>
                      <input
                        autoComplete={
                          mode === 'register'
                            ? 'new-password'
                            : 'current-password'
                        }
                        id="auth-password"
                        onChange={event => setPassword(event.target.value)}
                        placeholder="Enter password"
                        type="password"
                        value={password}
                      />
                    </div>

                    {message ? (
                      <p className="dialog-message">{message}</p>
                    ) : null}

                    <div className="dialog-actions">
                      <button
                        className="button"
                        disabled={busy}
                        onClick={emailSubmit}
                        type="button"
                      >
                        {busy
                          ? 'Please wait...'
                          : mode === 'register'
                          ? 'Create Account'
                          : 'Sign In'}
                      </button>
                      <button
                        className="button secondary"
                        disabled={busy}
                        onClick={resetPassword}
                        type="button"
                      >
                        Reset Password
                      </button>
                    </div>
                  </motion.section>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

function getFriendlyAuthError(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'Sign-in could not be completed. Please try again.';
  }

  if (error.message.includes('incomplete')) {
    return 'Sign-in is not configured for this environment yet.';
  }

  return error.message
    .replace(/^Firebase:\s*/i, '')
    .replace(/\s*\(auth\/.*\)\.?$/, '.');
}
