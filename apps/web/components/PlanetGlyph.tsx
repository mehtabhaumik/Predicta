import type { PlanetPosition } from '@pridicta/types';
import {
  getPlanetAbbreviation,
  type ChartRenderMoonPhase,
  type ChartRenderPlanet,
} from '@pridicta/astrology';

type PlanetGlyphProps = {
  moonPhase?: ChartRenderMoonPhase;
  planet: ChartRenderPlanet | PlanetPosition | string;
  showIcon?: boolean;
  showDegree?: boolean;
  showSign?: boolean;
  size?: 'compact' | 'full';
};

export function PlanetGlyph({
  moonPhase = 'unknown',
  planet,
  showIcon = true,
  showDegree = true,
  showSign = true,
  size = 'full',
}: PlanetGlyphProps): React.JSX.Element {
  const position =
    typeof planet === 'string'
      ? undefined
      : 'position' in planet
        ? planet.position
        : planet;
  const name = typeof planet === 'string' ? planet : planet.name;
  const displayName =
    typeof planet === 'string'
      ? planet
      : 'displayName' in planet
        ? planet.displayName
        : planet.name;
  const displaySign =
    typeof planet === 'string'
      ? undefined
      : 'displaySign' in planet
        ? planet.displaySign
        : position?.sign;
  const degree = position?.degree;
  const nakshatra = position?.nakshatra;
  const pada = position?.pada;
  const sign = position?.sign;
  const retrograde =
    typeof planet === 'string'
      ? false
      : 'status' in planet
        ? planet.status.retrograde
        : planet.retrograde;
  const status =
    typeof planet === 'string' || !('status' in planet)
      ? {
          combust: false,
          debilitated: false,
          exalted: false,
          retrograde,
        }
      : planet.status;
  const visual = getPlanetVisual(name, moonPhase);
  const copyName =
    size === 'compact'
      ? typeof planet !== 'string' && 'displayAbbreviation' in planet
        ? planet.displayAbbreviation
        : getPlanetAbbreviation(name)
      : displayName;
  const statusLabels = [
    status.retrograde ? 'retrograde' : undefined,
    status.exalted ? 'exalted' : undefined,
    status.debilitated ? 'debilitated' : undefined,
    status.combust ? 'combust' : undefined,
  ].filter(Boolean);
  const title = [
    `${name}${degree === undefined ? '' : ` ${degree.toFixed(1)}°`}`,
    nakshatra ? `${nakshatra}${pada ? ` pada ${pada}` : ''}` : undefined,
    statusLabels.length ? statusLabels.join(', ') : undefined,
  ].filter(Boolean).join(' · ');

  return (
    <span
      className={`planet-glyph planet-${visual.slug} ${size}${
        visual.kind === 'moon' ? ` moon-phase-${moonPhase}` : ''
      } ${
        status.retrograde ? 'retrograde' : ''
      }`}
      title={title}
    >
      {showIcon ? (
        <span className="planet-glyph-mark" aria-hidden>
          {visual.kind === 'rahu' ? <RahuMark /> : null}
          {visual.kind === 'ketu' ? <KetuMark /> : null}
          {visual.kind === 'moon' ? (
            <span className={`moon-mark ${moonPhase}`} />
          ) : null}
          {visual.kind === 'text' ? visual.mark : null}
        </span>
      ) : null}
      <span className="planet-glyph-copy">
        <strong>{copyName}</strong>
        {(showSign && sign) || (showDegree && degree !== undefined) ? (
          <em>
            {showSign && sign ? `${displaySign ?? sign} ` : ''}
            {showDegree && degree !== undefined ? `${degree.toFixed(1)}°` : ''}
          </em>
        ) : null}
      </span>
      {status.retrograde || status.exalted || status.debilitated || status.combust ? (
        <span className="planet-status-marks" aria-hidden>
          {status.retrograde ? (
            <b className="planet-status-mark retrograde">R</b>
          ) : null}
          {status.exalted ? (
            <b className="planet-status-mark exalted">E</b>
          ) : null}
          {status.debilitated ? (
            <b className="planet-status-mark debilitated">D</b>
          ) : null}
          {status.combust ? (
            <b className="planet-status-mark combust">C</b>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

function getPlanetVisual(
  planet: string,
  moonPhase: ChartRenderMoonPhase,
): { kind: 'ketu' | 'moon' | 'rahu' | 'text'; mark: string; slug: string } {
  if (planet === 'Moon') {
    return { kind: 'moon', mark: moonPhase === 'waning' ? '☾' : '☽', slug: 'moon' };
  }

  const symbols: Record<string, { mark: string; slug: string }> = {
    Dhuma: { mark: 'Dh', slug: 'dhuma' },
    Gulika: { mark: 'Gu', slug: 'gulika' },
    Indrachapa: { mark: 'In', slug: 'indrachapa' },
    Jupiter: { mark: '♃', slug: 'jupiter' },
    Mandi: { mark: 'Mn', slug: 'mandi' },
    Mars: { mark: '♂', slug: 'mars' },
    Mercury: { mark: '☿', slug: 'mercury' },
    Neptune: { mark: '♆', slug: 'neptune' },
    Parivesha: { mark: 'Pa', slug: 'parivesha' },
    Pluto: { mark: '♇', slug: 'pluto' },
    Saturn: { mark: '♄', slug: 'saturn' },
    Sun: { mark: '☉', slug: 'sun' },
    Upaketu: { mark: 'Uk', slug: 'upaketu' },
    Uranus: { mark: '♅', slug: 'uranus' },
    Venus: { mark: '♀', slug: 'venus' },
    Vyatipata: { mark: 'Vy', slug: 'vyatipata' },
  };

  if (planet === 'Rahu') {
    return { kind: 'rahu', mark: '', slug: 'rahu' };
  }

  if (planet === 'Ketu') {
    return { kind: 'ketu', mark: '', slug: 'ketu' };
  }

  return { kind: 'text', mark: symbols[planet]?.mark ?? getPlanetAbbreviation(planet), slug: symbols[planet]?.slug ?? 'generic' };
}

function RahuMark(): React.JSX.Element {
  return (
    <svg aria-hidden viewBox="0 0 32 32">
      <path
        d="M9 18c0-6 4-10 8-10 5 0 8 4 8 9 0 5-4 8-8 8-3 0-6-2-6-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M22 8c2 1 4 3 5 6M19 9c2 2 3 4 3 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <circle cx="18" cy="15" fill="currentColor" r="1.7" />
    </svg>
  );
}

function KetuMark(): React.JSX.Element {
  return (
    <svg aria-hidden viewBox="0 0 32 32">
      <path
        d="M7 17c6-8 14-8 20 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M9 21c5 5 13 5 18 0M16 11c-1-3-1-5 1-7M20 12c2-2 4-3 7-3"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}
