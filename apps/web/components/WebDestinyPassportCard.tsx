'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { DestinyPassport } from '@pridicta/types';

type WebDestinyPassportCardProps = {
  ctaHref?: string;
  passport: DestinyPassport;
};

export function WebDestinyPassportCard({
  ctaHref,
  passport,
}: WebDestinyPassportCardProps): React.JSX.Element {
  const [showProof, setShowProof] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'done'>('idle');
  const ready = passport.status === 'ready';

  async function sharePassport() {
    const title = `${passport.name} Destiny Passport`;
    const webNavigator = navigator as Navigator & {
      clipboard?: { writeText: (text: string) => Promise<void> };
      share?: (data: { text: string; title: string }) => Promise<void>;
    };

    try {
      if (typeof webNavigator.share === 'function') {
        await webNavigator.share({ text: passport.shareSummary, title });
      } else if (webNavigator.clipboard) {
        await webNavigator.clipboard.writeText(passport.shareSummary);
      }
      setShareState('done');
      window.setTimeout(() => setShareState('idle'), 1800);
    } catch {
      setShareState('idle');
    }
  }

  return (
    <section className={`destiny-passport glass-panel ${ready ? 'ready' : 'pending'}`}>
      <div className="destiny-passport-header">
        <div>
          <div className="section-title">DESTINY PASSPORT</div>
          <h2>{passport.name}</h2>
        </div>
        <div className="destiny-passport-badge">
          <span>Time</span>
          <strong>{passport.birthTimeConfidence.label}</strong>
        </div>
      </div>

      <p className="destiny-passport-theme">{passport.lifeTheme}</p>

      <div className="destiny-passport-metrics">
        <PassportMetric label="Rising sign (Lagna)" value={passport.lagna} />
        <PassportMetric label="Mind sign (Moon)" value={passport.moonSign} />
        <PassportMetric label="Birth star" value={passport.nakshatra} />
        <PassportMetric label="Life chapter" value={passport.currentDasha} />
      </div>

      <div className="destiny-passport-focus">
        <div>
          <span>Strong</span>
          <strong>
            {passport.strongestHouses.length
              ? `Houses ${passport.strongestHouses.join(', ')}`
              : 'Pending'}
          </strong>
        </div>
        <div>
          <span>Care</span>
          <strong>
            {passport.weakestHouses.length
              ? `Houses ${passport.weakestHouses.join(', ')}`
              : 'Pending'}
          </strong>
        </div>
      </div>

      <div className="destiny-passport-guidance">
        <div>
          <span>Current caution</span>
          <p>{passport.currentCaution}</p>
        </div>
        <div>
          <span>Do this now</span>
          <p>{passport.recommendedAction}</p>
        </div>
      </div>

      <div className="destiny-passport-confidence">
        <span>Birth time confidence</span>
        <strong>
          {passport.birthTimeConfidence.label} ·{' '}
          {passport.birthTimeConfidence.confidence}
        </strong>
        <p>{passport.birthTimeConfidence.reason}</p>
      </div>

      <div className="destiny-passport-actions">
        <button className="button" onClick={sharePassport} type="button">
          {shareState === 'done' ? 'Copied' : 'Share Passport'}
        </button>
        <button
          className="button secondary"
          onClick={() => setShowProof(value => !value)}
          type="button"
        >
          {showProof ? 'Hide chart proof' : 'Why? Show chart proof'}
        </button>
        {!ready && ctaHref ? (
          <Link className="button secondary" href={ctaHref}>
            Create Kundli
          </Link>
        ) : null}
      </div>

      {showProof ? (
        <div className="destiny-passport-proof">
          <ul>
            {passport.evidence.slice(0, 3).map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="destiny-passport-share-safe">
            <span>Share-safe summary</span>
            <p>{passport.shareSummary}</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PassportMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.JSX.Element {
  return (
    <div className="destiny-passport-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
