'use client';

import { useEffect, useMemo, useState } from 'react';

const DISMISS_KEY = 'predicta-pwa-install-dismissed-v1';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
};

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function PwaInstallPrompt(): React.JSX.Element | null {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setDismissed(window.localStorage.getItem(DISMISS_KEY) === 'true');
    setInstalled(isStandaloneMode());

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      window.localStorage.removeItem(DISMISS_KEY);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const visible = useMemo(
    () => Boolean(deferredPrompt) && !dismissed && !installed,
    [deferredPrompt, dismissed, installed],
  );

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    setInstalling(true);

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } finally {
      setInstalling(false);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(DISMISS_KEY, 'true');
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <aside className="pwa-install-card glass-panel" aria-label="Install Predicta">
      <div className="pwa-install-copy">
        <strong>Install Predicta</strong>
        <p>Open it like an app with a cleaner full-screen experience.</p>
      </div>
      <div className="pwa-install-actions">
        <button
          className="button"
          disabled={installing}
          onClick={() => {
            void handleInstall();
          }}
          type="button"
        >
          {installing ? 'Opening...' : 'Install'}
        </button>
        <button className="button secondary" onClick={handleDismiss} type="button">
          Later
        </button>
      </div>
    </aside>
  );
}
