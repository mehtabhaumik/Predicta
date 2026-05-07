'use client';

import { useEffect, useState } from 'react';
import { demoAccess } from '../lib/demo-state';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { WebKpPredictaPanel } from './WebKpPredictaPanel';

export function WebKpPredictaLoader(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const [handoffQuestion, setHandoffQuestion] = useState<string>();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setHandoffQuestion(params.get('handoffQuestion') ?? undefined);
  }, []);

  return (
    <WebKpPredictaPanel
      handoffQuestion={handoffQuestion}
      hasPremiumAccess={demoAccess.hasPremiumAccess}
      kundli={activeKundli}
    />
  );
}
