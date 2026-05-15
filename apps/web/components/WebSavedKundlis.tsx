'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { KundliData } from '@pridicta/types';
import {
  loadWebKundli,
  loadWebKundlis,
  setActiveWebKundli,
} from '../lib/web-kundli-storage';
import { buildPredictaChatHref } from '../lib/predicta-chat-cta';
import { Card } from './Card';

export function WebSavedKundlis(): React.JSX.Element {
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [savedKundlis, setSavedKundlis] = useState<KundliData[]>([]);

  useEffect(() => {
    setKundli(loadWebKundli());
    setSavedKundlis(loadWebKundlis());
  }, []);
  const profiles = useMemo(() => {
    if (!kundli) {
      return savedKundlis;
    }

    return [kundli, ...savedKundlis.filter(record => record.id !== kundli.id)];
  }, [kundli, savedKundlis]);

  function activateProfile(record: KundliData): void {
    setActiveWebKundli(record);
    setKundli(record);
    setSavedKundlis(loadWebKundlis());
  }

  if (!kundli && profiles.length === 0) {
    return (
      <div className="saved-kundli-grid">
        <Card className="glass-panel">
          <div className="card-content spacious">
            <div className="section-title">NO SAVED KUNDLI YET</div>
            <h2>Create your first Kundli.</h2>
            <p>
              Saved and restored Kundlis will appear here.
            </p>
          </div>
        </Card>
        <FamilyVaultCard />
      </div>
    );
  }

  return (
    <div className="saved-kundli-grid">
      {profiles.map(record => {
        const active = record.id === kundli?.id;

        return (
          <Card className={active ? 'glass-panel' : ''} key={record.id}>
            <div className="card-content spacious">
              <div className="section-title">
                {active ? 'Active family profile' : 'Saved family profile'}
              </div>
              <h2>{record.birthDetails.name}</h2>
              <p>
                {record.birthDetails.place} · Rising sign {record.lagna} ·
                Birth star {record.nakshatra}
              </p>
              <div className="action-row">
                {!active ? (
                  <button
                    className="button secondary"
                    onClick={() => {
                      activateProfile(record);
                    }}
                    type="button"
                  >
                    Use for Chat
                  </button>
                ) : null}
                <Link
                  className="button secondary"
                  href={buildPredictaChatHref({
                    kundli: record,
                    kundliId: record.id,
                    prompt: `Use ${record.birthDetails.name}'s saved Kundli and tell me the most useful next reading.`,
                    purpose: 'family',
                    selectedSection: `Saved profile: ${record.birthDetails.name}`,
                    sourceScreen: 'Saved Kundlis',
                  })}
                  onClick={() => activateProfile(record)}
                >
                  Ask Predicta
                </Link>
                <Link
                  className="button secondary"
                  href="/dashboard/family"
                  onClick={() => activateProfile(record)}
                >
                  Family Map
                </Link>
              </div>
            </div>
          </Card>
        );
      })}
      <FamilyVaultCard />
    </div>
  );
}

function FamilyVaultCard(): React.JSX.Element {
  return (
    <Card>
      <div className="card-content spacious">
        <div className="section-title">FAMILY VAULT</div>
        <h2>Keep family Kundlis together.</h2>
        <p>
          Create a profile for each person, choose who Predicta should read,
          and compare family patterns without mixing charts.
        </p>
        <div className="action-row compact">
          <Link className="button secondary" href="/dashboard/kundli">
            Add Profile
          </Link>
          <Link className="button secondary" href="/dashboard/family">
            Open Family Map
          </Link>
        </div>
      </div>
    </Card>
  );
}
