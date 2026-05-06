'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { composeFamilyKarmaMap } from '@pridicta/astrology';
import type { FamilyRelationshipLabel } from '@pridicta/types';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

const relationshipLabels: FamilyRelationshipLabel[] = [
  'self',
  'partner',
  'parent',
  'sibling',
  'child',
  'relative',
  'friend',
];

export function WebFamilyKarmaMap(): React.JSX.Element {
  const [relationships, setRelationships] = useState<
    Record<string, FamilyRelationshipLabel>
  >({});
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const profiles = useMemo(() => {
    const activeFirst = activeKundli
      ? [activeKundli, ...savedKundlis.filter(item => item.id !== activeKundli.id)]
      : savedKundlis;

    return activeFirst.slice(0, 8);
  }, [activeKundli, savedKundlis]);
  const map = useMemo(
    () =>
      composeFamilyKarmaMap(
        profiles.map((kundli, index) => ({
          kundli,
          relationship:
            relationships[kundli.id] ?? (index === 0 ? 'self' : 'relative'),
        })),
      ),
    [profiles, relationships],
  );

  return (
    <section className="family-karma-map glass-panel">
      <div className="family-header">
        <div>
          <div className="section-title">FAMILY KARMA MAP</div>
          <h2>{map.title}</h2>
          <p>{map.subtitle}</p>
        </div>
      </div>

      <div className="family-privacy-panel">
        <span>Privacy-first rule</span>
        <p>{map.privacyNote}</p>
      </div>

      {profiles.length ? (
        <div className="family-member-grid">
          {profiles.map((kundli, index) => (
            <div className="family-member-slot active" key={kundli.id}>
              <span>{index === 0 && kundli.id === activeKundli?.id ? 'Active profile' : 'Saved profile'}</span>
              <strong>{kundli.birthDetails.name}</strong>
              <p>
                {kundli.lagna} Lagna · {kundli.moonSign} Moon ·{' '}
                {kundli.nakshatra}
              </p>
              <select
                aria-label={`Relationship for ${kundli.birthDetails.name}`}
                onChange={event =>
                  setRelationships(current => ({
                    ...current,
                    [kundli.id]: event.target.value as FamilyRelationshipLabel,
                  }))
                }
                value={relationships[kundli.id] ?? (index === 0 ? 'self' : 'relative')}
              >
                {relationshipLabels.map(label => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      ) : null}

      <div className="family-guidance-grid">
        <div className="family-guidance-card">
          <span>Repeated themes</span>
          <p>
            Shared Moon, nakshatra, dasha, and ashtakavarga patterns become
            gentle family themes with evidence.
          </p>
        </div>
        <div className="family-guidance-card">
          <span>Support zones</span>
          <p>
            Stronger house overlaps become practical places for cooperation,
            rituals, routines, and repair.
          </p>
        </div>
        <div className="family-guidance-card">
          <span>Relationship cards</span>
          <p>
            Each pair gets emotional pattern, support pattern, and one
            non-blaming next step.
          </p>
        </div>
      </div>

      <div className="family-empty">
        <h3>
          {profiles.length >= 2
            ? `${profiles.length} profiles linked`
            : 'Add two or more calculated profiles'}
        </h3>
        <p>
          {profiles.length >= 2
            ? 'Predicta is using your saved Kundlis to compare repeated themes and support zones without blame or fear labels.'
            : 'Family Karma Map needs saved Kundlis before it can compare real household patterns.'}
        </p>
        <div className="action-row">
          <Link className="button" href="/dashboard/kundli">
            Add Profile
          </Link>
          <Link className="button secondary" href="/dashboard/saved-kundlis">
            Saved Kundlis
          </Link>
        </div>
      </div>
    </section>
  );
}
