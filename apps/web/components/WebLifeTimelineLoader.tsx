'use client';

import { useMemo } from 'react';
import {
  composeLifeTimeline,
  composeMahadashaIntelligence,
  composeSadeSatiIntelligence,
  composeTransitGocharIntelligence,
  composeYearlyHoroscopeVarshaphal,
} from '@pridicta/astrology';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';
import { WebLifeTimelinePanel } from './WebLifeTimelinePanel';
import { WebMahadashaIntelligencePanel } from './WebMahadashaIntelligencePanel';
import { WebSadeSatiPanel } from './WebSadeSatiPanel';
import { WebTransitGocharPanel } from './WebTransitGocharPanel';
import { WebYearlyHoroscopePanel } from './WebYearlyHoroscopePanel';

export function WebLifeTimelineLoader(): React.JSX.Element {
  const { activeKundli } = useWebKundliLibrary();
  const presentation = useMemo(
    () => composeLifeTimeline(activeKundli),
    [activeKundli],
  );
  const mahadasha = useMemo(
    () => composeMahadashaIntelligence(activeKundli, { depth: 'FREE' }),
    [activeKundli],
  );
  const sadeSati = useMemo(
    () => composeSadeSatiIntelligence(activeKundli, { depth: 'FREE' }),
    [activeKundli],
  );
  const gochar = useMemo(
    () => composeTransitGocharIntelligence(activeKundli, { depth: 'FREE' }),
    [activeKundli],
  );
  const yearlyHoroscope = useMemo(
    () => composeYearlyHoroscopeVarshaphal(activeKundli, { depth: 'FREE' }),
    [activeKundli],
  );

  return (
    <div className="timeline-stack">
      <WebMahadashaIntelligencePanel intelligence={mahadasha} />
      <WebSadeSatiPanel intelligence={sadeSati} />
      <WebTransitGocharPanel intelligence={gochar} />
      <WebYearlyHoroscopePanel intelligence={yearlyHoroscope} />
      <WebLifeTimelinePanel
        ctaHref="/dashboard/kundli"
        presentation={presentation}
      />
    </div>
  );
}
