'use client';

import { onAuthStateChanged, type User } from 'firebase/auth';
import { type ReactNode, useEffect, useState } from 'react';
import { getFirebaseWebAuth } from '../lib/firebase/client';
import { AuthDialog } from './AuthDialog';

type WebAuthRequiredProps = {
  body: string;
  children: ReactNode;
  eyebrow?: string;
  title: string;
};

export function WebAuthRequired({
  body,
  children,
  eyebrow = 'ACCOUNT REQUIRED',
  title,
}: WebAuthRequiredProps): React.JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseWebAuth(), nextUser => {
        setUser(nextUser);
        setReady(true);
      });
    } catch {
      setReady(true);
      return undefined;
    }
  }, []);

  if (!ready) {
    return (
      <section className="glass-panel auth-required-panel" aria-live="polite">
        <div className="section-title">{eyebrow}</div>
        <h2>Checking your account...</h2>
        <p>Predicta is confirming sign-in before opening this private area.</p>
      </section>
    );
  }

  if (!user?.uid) {
    return (
      <section className="glass-panel auth-required-panel">
        <div className="section-title">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{body}</p>
        <AuthDialog />
      </section>
    );
  }

  return <>{children}</>;
}
