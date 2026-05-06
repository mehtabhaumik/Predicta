'use client';

import Link from 'next/link';
import { useState } from 'react';
import { composeRelationshipMirror } from '@pridicta/astrology';

const profileSlots = [
  'Select first saved kundli',
  'Select second saved kundli',
];

export function WebRelationshipMirror(): React.JSX.Element {
  const [selectedSlot, setSelectedSlot] = useState(0);
  const mirror = composeRelationshipMirror();

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
        {profileSlots.map((label, index) => (
          <button
            className={`relationship-profile-slot ${selectedSlot === index ? 'active' : ''}`}
            key={label}
            onClick={() => setSelectedSlot(index)}
            type="button"
          >
            <span>{index === 0 ? 'First person' : 'Second person'}</span>
            <strong>{label}</strong>
            <p>
              Web kundli selection will use calculated saved profiles. No fake
              compatibility is shown before both charts exist.
            </p>
          </button>
        ))}
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
        <h3>Add two calculated profiles</h3>
        <p>
          Relationship Mirror compares Moon, Mercury, Venus, Mars, dasha timing,
          and chart evidence from both people. It avoids deterministic claims
          like "will fail" or "guaranteed match."
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
