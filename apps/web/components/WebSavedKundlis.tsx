'use client';

import { useEffect, useState } from 'react';
import type { KundliData } from '@pridicta/types';
import {
  loadWebKundli,
  loadWebKundlis,
  setActiveWebKundli,
} from '../lib/web-kundli-storage';
import { Card } from './Card';
import { StatusPill } from './StatusPill';

export function WebSavedKundlis(): React.JSX.Element {
  const [kundli, setKundli] = useState<KundliData | undefined>();
  const [savedKundlis, setSavedKundlis] = useState<KundliData[]>([]);

  useEffect(() => {
    setKundli(loadWebKundli());
    setSavedKundlis(loadWebKundlis());
  }, []);

  if (!kundli && savedKundlis.length === 0) {
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
      {savedKundlis.map(record => {
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
                <StatusPill
                  label={active ? 'Used for chat' : 'Ready to activate'}
                  tone={active ? 'premium' : 'quiet'}
                />
                {!active ? (
                  <button
                    className="button secondary"
                    onClick={() => {
                      setActiveWebKundli(record);
                      setKundli(record);
                    }}
                    type="button"
                  >
                    Use for Chat
                  </button>
                ) : null}
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
          Store multiple Kundlis and keep each chart clearly separated.
        </p>
        <StatusPill label="Family access" tone="quiet" />
      </div>
    </Card>
  );
}
