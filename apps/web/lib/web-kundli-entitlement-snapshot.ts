'use client';

import {
  hasPremiumAccess,
  mapServerLedgerToMonetizationState,
  type ServerEntitlementLedger,
} from '@pridicta/monetization';

const WEB_KUNDLI_ENTITLEMENT_SNAPSHOT_KEY =
  'pridicta.webKundliEntitlementSnapshot.v1';

export type WebKundliEntitlementSnapshot = {
  hasPremiumAccess: boolean;
  refreshedAt: string;
  savedKundliCount: number;
  uid: string;
};

export function writeWebKundliEntitlementSnapshotFromLedger(
  ledger: ServerEntitlementLedger,
): void {
  writeWebKundliEntitlementSnapshot({
    hasPremiumAccess: hasPremiumAccess(mapServerLedgerToMonetizationState(ledger)),
    refreshedAt: new Date().toISOString(),
    savedKundliCount: ledger.savedKundliCount,
    uid: ledger.uid,
  });
}

export function readWebKundliEntitlementSnapshot(
  uid?: string,
): WebKundliEntitlementSnapshot | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(WEB_KUNDLI_ENTITLEMENT_SNAPSHOT_KEY);
    const snapshot = raw
      ? (JSON.parse(raw) as WebKundliEntitlementSnapshot)
      : undefined;

    if (!snapshot || (uid && snapshot.uid !== uid)) {
      return undefined;
    }

    return snapshot;
  } catch {
    return undefined;
  }
}

function writeWebKundliEntitlementSnapshot(
  snapshot: WebKundliEntitlementSnapshot,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      WEB_KUNDLI_ENTITLEMENT_SNAPSHOT_KEY,
      JSON.stringify(snapshot),
    );
  } catch {
    // Kundli gating falls back to free signed-in limits if the snapshot cannot persist.
  }
}
