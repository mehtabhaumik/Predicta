'use client';

import { useEffect, useMemo, useState } from 'react';

const DISMISS_KEY = 'predicta-pwa-install-dismissed-at-v2';
const DISMISS_WINDOW_MS = 5 * 24 * 60 * 60 * 1000;

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
  const [isMobileViewer, setIsMobileViewer] = useState(false);
  const [showManualHint, setShowManualHint] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const dismissedAtRaw = window.localStorage.getItem(DISMISS_KEY);
    const dismissedAt = dismissedAtRaw ? Number(dismissedAtRaw) : 0;
    const dismissalActive = Number.isFinite(dismissedAt) && dismissedAt > 0
      ? Date.now() - dismissedAt < DISMISS_WINDOW_MS
      : false;

    setDismissed(dismissalActive);
    setInstalled(isStandaloneMode());
    setIsMobileViewer(window.matchMedia('(max-width: 820px)').matches);
    setShowManualHint(
      /iphone|ipad|ipod|android/i.test(window.navigator.userAgent) &&
        !isStandaloneMode(),
    );

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    function handleAppInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
      window.localStorage.removeItem(DISMISS_KEY);
    }

    function handleViewportChange() {
      setIsMobileViewer(window.matchMedia('(max-width: 820px)').matches);
      setInstalled(isStandaloneMode());
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('resize', handleViewportChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('resize', handleViewportChange);
    };
  }, []);

  const visible = useMemo(
    () => !dismissed && !installed && isMobileViewer && (Boolean(deferredPrompt) || showManualHint),
    [deferredPrompt, dismissed, installed, isMobileViewer, showManualHint],
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
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
  }

  if (!visible) {
    return null;
  }

  return (
    <aside className="pwa-install-card glass-panel" aria-label="Install Predicta">
      <div className="pwa-install-copy">
        <strong>Download the app</strong>
        <p>
          Open Predicta in a cleaner full-screen app view on this device.
          {!deferredPrompt && showManualHint ? ' Use your browser menu to add it to your Home Screen.' : ''}
        </p>
      </div>
      <div className="pwa-install-actions">
        {deferredPrompt ? (
          <button
            className="button"
            disabled={installing}
            onClick={() => {
              void handleInstall();
            }}
            type="button"
          >
            {installing ? 'Opening...' : 'Get app'}
          </button>
        ) : null}
        <button className="button secondary" onClick={handleDismiss} type="button">
          Later
        </button>
      </div>
    </aside>
  );
}
