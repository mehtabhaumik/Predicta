'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { composeRelationshipMirror } from '@pridicta/astrology';
import { useWebKundliLibrary } from '../lib/use-web-kundli-library';

export function WebRelationshipMirror(): React.JSX.Element {
  const { activeKundli, savedKundlis } = useWebKundliLibrary();
  const profiles = useMemo(() => {
    const activeFirst = activeKundli
      ? [activeKundli, ...savedKundlis.filter(item => item.id !== activeKundli.id)]
      : savedKundlis;

    return activeFirst;
  }, [activeKundli, savedKundlis]);
  const [firstId, setFirstId] = useState<string | undefined>();
  const [secondId, setSecondId] = useState<string | undefined>();
  const first = profiles.find(item => item.id === (firstId ?? activeKundli?.id));
  const second = profiles.find(
    item => item.id === secondId && item.id !== first?.id,
  );
  const mirror = useMemo(
    () => composeRelationshipMirror(first, second),
    [first, second],
  );

  return (
    <section className="relationship-mirror glass-panel">
      <div className="relationship-header">
        <div>
          <div className="section-title">RELATIONSHIP MIRROR</div>
          <h2>{mirror.headline}</h2>
          <p>{mirror.overview}</p>
        </div>
      </div>

      <div className="relationship-selector-grid">
        <ProfileSelect
          label="First person"
          onChange={setFirstId}
          profiles={profiles}
          value={first?.id}
        />
        <ProfileSelect
          disabledId={first?.id}
          label="Second person"
          onChange={setSecondId}
          profiles={profiles}
          value={second?.id}
        />
      </div>

      <div className="relationship-talk-panel">
        <span>How to talk this week</span>
        <p>{mirror.howToTalkThisWeek}</p>
      </div>

      <div className="relationship-timing-panel">
        <span>Timing overlap</span>
        <p>{mirror.timingOverlap}</p>
      </div>

      <div className="relationship-empty">
        <h3>
          {first && second
            ? `${first.birthDetails.name} + ${second.birthDetails.name}`
            : 'Add two calculated profiles'}
        </h3>
        <p>
          {first && second
            ? 'Predicta is comparing both saved Kundlis through Moon, Mercury, Venus, Mars, dasha timing, and chart evidence.'
            : 'Relationship Mirror needs two saved Kundlis before it can compare real relationship evidence.'}
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

function ProfileSelect({
  disabledId,
  label,
  onChange,
  profiles,
  value,
}: {
  disabledId?: string;
  label: string;
  onChange: (id: string) => void;
  profiles: ReturnType<typeof useWebKundliLibrary>['savedKundlis'];
  value?: string;
}): React.JSX.Element {
  const selected = profiles.find(profile => profile.id === value);

  return (
    <label className={`relationship-profile-slot ${selected ? 'active' : ''}`}>
      <span>{label}</span>
      <strong>{selected?.birthDetails.name ?? 'Select saved Kundli'}</strong>
      <p>
        {selected
          ? `${selected.lagna} Lagna · ${selected.moonSign} Moon · ${selected.nakshatra}`
          : 'Choose a saved chart. Predicta will not invent compatibility before both charts exist.'}
      </p>
      <select
        aria-label={label}
        onChange={event => onChange(event.target.value)}
        value={value ?? ''}
      >
        <option value="">Select profile</option>
        {profiles.map(profile => (
          <option
            disabled={profile.id === disabledId}
            key={profile.id}
            value={profile.id}
          >
            {profile.birthDetails.name}
          </option>
        ))}
      </select>
    </label>
  );
}
