'use client';

import { useEffect, useState } from 'react';
import type { ChartContext, KundliData } from '@pridicta/types';
import {
  loadWebKundliStore,
  WEB_KUNDLI_UPDATED_EVENT,
} from './web-kundli-storage';
import type { WebGuestSession } from './web-guest-session';

type WebKundliLibrary = {
  activeChartContext?: ChartContext;
  activeKundli?: KundliData;
  activeKundliId?: string;
  guestSession?: WebGuestSession;
  savedKundlis: KundliData[];
};

export function useWebKundliLibrary(): WebKundliLibrary {
  const [library, setLibrary] = useState<WebKundliLibrary>({
    activeChartContext: undefined,
    activeKundli: undefined,
    activeKundliId: undefined,
    guestSession: undefined,
    savedKundlis: [],
  });

  useEffect(() => {
    function refresh() {
      const store = loadWebKundliStore();
      setLibrary({
        activeChartContext: store.activeChartContext,
        activeKundli: store.activeKundli,
        activeKundliId: store.activeKundliId,
        guestSession: store.guestSession,
        savedKundlis: store.savedKundlis,
      });
    }

    refresh();
    window.addEventListener('storage', refresh);
    window.addEventListener(WEB_KUNDLI_UPDATED_EVENT, refresh);

    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener(WEB_KUNDLI_UPDATED_EVENT, refresh);
    };
  }, []);

  return library;
}
