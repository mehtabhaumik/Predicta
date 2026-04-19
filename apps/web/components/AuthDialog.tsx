'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  GoogleAuthProvider,
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

  function signInWithGoogleProvider() {
    const authProvider = new GoogleAuthProvider();
    authProvider.setCustomParameters({
      prompt: 'select_account',
    });

    return runAuth(
      () => signInWithPopup(getFirebaseWebAuth(), authProvider),
      'Signed in with Google. Your account is ready.',
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
                        className="button secondary provider-button"
                        disabled={busy}
                        onClick={signInWithGoogleProvider}
                        type="button"
                      >
                        <GoogleIcon />
                        Continue with Google
                      </button>
                      <button
                        aria-disabled="true"
                        className="button secondary provider-button provider-button-disabled"
                        disabled
                        type="button"
                      >
                        <AppleIcon />
                        <span className="provider-button-copy">
                          Continue with Apple
                          <span className="coming-soon-pill">Coming soon</span>
                        </span>
                      </button>
                      <button
                        aria-disabled="true"
                        className="button secondary provider-button provider-button-disabled"
                        disabled
                        type="button"
                      >
                        <MicrosoftIcon />
                        <span className="provider-button-copy">
                          Continue with Microsoft
                          <span className="coming-soon-pill">Coming soon</span>
                        </span>
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

function GoogleIcon(): React.JSX.Element {
  return (
    <span className="provider-icon" aria-hidden>
      <svg viewBox="0 0 24 24" role="img">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.29h6.47c-.28 1.5-1.13 2.77-2.41 3.62v3h3.9c2.28-2.1 3.53-5.2 3.53-8.64z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.08 7.95-2.93l-3.9-3c-1.08.72-2.46 1.15-4.05 1.15-3.13 0-5.78-2.11-6.73-4.96H1.24v3.09C3.22 21.28 7.28 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.27 14.26c-.24-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.65H1.24C.45 8.22 0 10.06 0 12s.45 3.78 1.24 5.35l4.03-3.09z"
        />
        <path
          fill="#EA4335"
          d="M12 4.78c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.2 15.23 0 12 0 7.28 0 3.22 2.72 1.24 6.65l4.03 3.09C6.22 6.89 8.87 4.78 12 4.78z"
        />
      </svg>
    </span>
  );
}

function AppleIcon(): React.JSX.Element {
  return (
    <span className="provider-icon" aria-hidden>
      <svg viewBox="0 0 24 24" role="img">
        <path
          fill="currentColor"
          d="M19.67 13.56c-.03-2.57 2.1-3.81 2.19-3.87-1.2-1.75-3.06-1.99-3.73-2.02-1.59-.16-3.1.93-3.9.93-.81 0-2.05-.91-3.37-.88-1.74.02-3.34 1.01-4.23 2.56-1.81 3.13-.46 7.76 1.3 10.3.86 1.24 1.89 2.64 3.23 2.59 1.3-.05 1.79-.84 3.35-.84 1.57 0 2.01.84 3.38.81 1.39-.02 2.28-1.26 3.13-2.51.99-1.45 1.4-2.85 1.42-2.92-.03-.01-2.72-1.04-2.77-4.15zM17.09 6c.72-.87 1.2-2.07 1.07-3.27-1.03.04-2.28.69-3.02 1.55-.66.77-1.24 1.99-1.08 3.16 1.15.09 2.32-.58 3.03-1.44z"
        />
      </svg>
    </span>
  );
}

function MicrosoftIcon(): React.JSX.Element {
  return (
    <span className="provider-icon" aria-hidden>
      <svg viewBox="0 0 24 24" role="img">
        <path fill="#F25022" d="M2 2h9.5v9.5H2z" />
        <path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
        <path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
        <path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
      </svg>
    </span>
  );
}
