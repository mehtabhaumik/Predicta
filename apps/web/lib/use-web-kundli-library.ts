'use client';

import { useEffect, useState } from 'react';
import type { KundliData } from '@pridicta/types';
import {
  loadWebKundli,
  loadWebKundlis,
  WEB_KUNDLI_UPDATED_EVENT,
} from './web-kundli-storage';

type WebKundliLibrary = {
  activeKundli?: KundliData;
  savedKundlis: KundliData[];
};

export function useWebKundliLibrary(): WebKundliLibrary {
  const [library, setLibrary] = useState<WebKundliLibrary>({
    activeKundli: undefined,
    savedKundlis: [],
  });

  useEffect(() => {
    function refresh() {
      setLibrary({
        activeKundli: loadWebKundli(),
        savedKundlis: loadWebKundlis(),
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
