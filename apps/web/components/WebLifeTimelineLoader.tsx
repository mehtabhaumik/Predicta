'use client';

import { useMemo } from 'react';
import { composeLifeTimeline } from '@pridicta/astrology';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { WebLifeTimelinePanel } from './WebLifeTimelinePanel';

export function WebLifeTimelineLoader(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const presentation = useMemo(
    () => composeLifeTimeline(activeKundli),
    [activeKundli],
  );

  return (
    <WebLifeTimelinePanel
      ctaHref="/dashboard/kundli"
      presentation={presentation}
    />
  );
}
