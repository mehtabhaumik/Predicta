import type { CSSProperties } from 'react';

export type KundliAnimationSurface = 'chat' | 'creation' | 'landing' | 'standard';

export type KundliAnimationPart =
  | 'frame'
  | 'legend'
  | 'lines'
  | 'markers'
  | 'planet'
  | 'planets'
  | 'signs';

export const KUNDLI_ANIMATION_PHASES = [
  'frame',
  'lines',
  'signs',
  'planet',
  'markers',
  'legend',
] as const satisfies readonly KundliAnimationPart[];

const SURFACE_TIMING: Record<
  KundliAnimationSurface,
  {
    lineDraw: number;
    lineStagger: number;
    markerDelay: number;
    planetDelay: number;
    planetStagger: number;
    signDelay: number;
    signStagger: number;
  }
> = {
  chat: {
    lineDraw: 420,
    lineStagger: 24,
    markerDelay: 420,
    planetDelay: 360,
    planetStagger: 28,
    signDelay: 190,
    signStagger: 18,
  },
  creation: {
    lineDraw: 760,
    lineStagger: 58,
    markerDelay: 920,
    planetDelay: 800,
    planetStagger: 58,
    signDelay: 620,
    signStagger: 52,
  },
  landing: {
    lineDraw: 700,
    lineStagger: 46,
    markerDelay: 880,
    planetDelay: 840,
    planetStagger: 44,
    signDelay: 520,
    signStagger: 42,
  },
  standard: {
    lineDraw: 620,
    lineStagger: 38,
    markerDelay: 720,
    planetDelay: 620,
    planetStagger: 42,
    signDelay: 420,
    signStagger: 34,
  },
};

export function getKundliAnimationSurfaceProps(surface: KundliAnimationSurface): {
  'data-kundli-animation': 'true';
  'data-kundli-animation-surface': KundliAnimationSurface;
  style: CSSProperties;
} {
  const timing = SURFACE_TIMING[surface];

  return {
    'data-kundli-animation': 'true',
    'data-kundli-animation-surface': surface,
    style: {
      '--kundli-line-draw-duration': `${timing.lineDraw}ms`,
      '--kundli-line-stagger': `${timing.lineStagger}ms`,
      '--kundli-marker-delay': `${timing.markerDelay}ms`,
      '--kundli-planet-delay': `${timing.planetDelay}ms`,
      '--kundli-planet-stagger': `${timing.planetStagger}ms`,
      '--kundli-sign-delay': `${timing.signDelay}ms`,
      '--kundli-sign-stagger': `${timing.signStagger}ms`,
    } as CSSProperties,
  };
}

export function getKundliAnimationPartProps(
  part: KundliAnimationPart,
  index = 0,
): {
  'data-kundli-animation-part': KundliAnimationPart;
  style: CSSProperties;
} {
  return {
    'data-kundli-animation-part': part,
    style: getKundliAnimationStyle(index, part),
  };
}

export function getKundliAnimationStyle(
  index = 0,
  part: KundliAnimationPart = 'signs',
  surface?: KundliAnimationSurface,
): CSSProperties {
  const property =
    part === 'lines'
      ? '--kundli-line-index'
      : part === 'planet'
        ? '--kundli-planet-index'
        : '--kundli-cell-index';
  const style = {
    [property]: index,
  } as CSSProperties;

  if (!surface) {
    return style;
  }

  const timing = SURFACE_TIMING[surface];

  if (part === 'lines') {
    return {
      ...style,
      '--kundli-line-reveal-delay': `${index * timing.lineStagger}ms`,
    } as CSSProperties;
  }

  if (part === 'planet') {
    return {
      ...style,
      '--kundli-planet-reveal-delay': `${
        timing.planetDelay + index * timing.planetStagger
      }ms`,
    } as CSSProperties;
  }

  return {
    ...style,
    '--kundli-sign-reveal-delay': `${
      timing.signDelay + index * timing.signStagger
    }ms`,
  } as CSSProperties;
}
