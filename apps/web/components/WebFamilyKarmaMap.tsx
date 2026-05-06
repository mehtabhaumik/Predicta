'use client';

import Link from 'next/link';
import { useState } from 'react';
import { composeFamilyKarmaMap } from '@pridicta/astrology';

const familySlots = [
  { label: 'Your profile', relation: 'Self' },
  { label: 'Add parent, partner, sibling, or child', relation: 'Family' },
  { label: 'Add another saved kundli', relation: 'Support zone' },
];

export function WebFamilyKarmaMap(): React.JSX.Element {
  const [selectedSlot, setSelectedSlot] = useState(0);
  const map = composeFamilyKarmaMap();

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

      <div className="family-member-grid">
        {familySlots.map((slot, index) => (
          <button
            className={`family-member-slot ${selectedSlot === index ? 'active' : ''}`}
            key={slot.label}
            onClick={() => setSelectedSlot(index)}
            type="button"
          >
            <span>{slot.relation}</span>
            <strong>{slot.label}</strong>
            <p>
              Web profile selection will use calculated saved kundlis. No
              family pattern is invented before real charts are present.
            </p>
          </button>
        ))}
      </div>

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
        <h3>Add two or more calculated profiles</h3>
        <p>
          Family Karma Map is list-based today and structured for a future graph
          view. It stays household-friendly with no blame and no fear labels.
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
