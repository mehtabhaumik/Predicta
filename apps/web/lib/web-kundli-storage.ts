'use client';

import type {
  BirthDetails,
  ChartContext,
  FamilyRelationshipLabel,
  KundliData,
} from '@pridicta/types';
import {
  evaluateKundliLibraryEntitlement,
  type KundliLibraryEntitlementReason,
} from '@pridicta/monetization';
import {
  getOrCreateWebGuestSession,
  type WebGuestSession,
} from './web-guest-session';
import { getFirebaseWebAuth } from './firebase/client';
import { getWebAuthHeaders } from './firebase/auth-token';
import {
  buildFamilyProfileMetadata,
  getFamilyRelationshipColorToken,
} from './family-relationships';
import { readWebKundliEntitlementSnapshot } from './web-kundli-entitlement-snapshot';

const ACTIVE_KUNDLI_KEY = 'pridicta.activeKundli.v1';
const SAVED_KUNDLIS_KEY = 'pridicta.savedKundlis.v1';
const WEB_KUNDLI_STORE_KEY = 'pridicta.webKundliStore.v1';
const GOCHAR_REFRESH_PREFIX = 'pridicta.gocharRefreshAttempt.v1';
const PREMIUM_KUNDLI_GENERATION_DAY_KEY =
  'pridicta.premiumKundliGenerationDay.v1';
export const WEB_KUNDLI_UPDATED_EVENT = 'pridicta:web-kundli-updated';

const gocharRefreshes = new Map<string, Promise<KundliData | undefined>>();

export type WebKundliStore = {
  activeChartContext?: ChartContext;
  activeKundli?: KundliData;
  activeKundliId?: string;
  guestSession?: WebGuestSession;
  savedKundlis: KundliData[];
  updatedAt?: string;
};

export const WEB_GUEST_KUNDLI_LIMIT = 1;

export type WebKundliStorageGate = {
  allowed: boolean;
  existingKundli?: KundliData;
  reason?: KundliLibraryEntitlementReason;
  remaining: number | 'unlimited';
  savedCount: number;
  signedIn: boolean;
};

export type SharedWebKundliContextResolution = {
  chartContext?: ChartContext;
  kundli?: KundliData;
  source:
    | 'active-kundli'
    | 'birth-summary'
    | 'explicit-kundli-id'
    | 'preferred-kundli'
    | 'saved-kundli'
    | 'none';
};

type GenerateKundliOptions = {
  save?: boolean;
};

type SaveKundliOptions = {
  relationshipToOwner?: FamilyRelationshipLabel;
};

export async function generateKundliFromWeb(
  details: BirthDetails,
  options: GenerateKundliOptions = {},
): Promise<KundliData> {
  const authHeaders = await getWebAuthHeaders();
  const response = await fetch('/api/generate-kundli', {
    body: JSON.stringify(details),
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  const kundli = (await response.json()) as KundliData;
  kundli.birthDetails = {
    ...kundli.birthDetails,
    ...details,
  };
  if (options.save ?? true) {
    saveWebKundli(kundli);
  }

  return kundli;
}

export function loadWebKundli(): KundliData | undefined {
  return loadWebKundliStore().activeKundli;
}

export function loadWebKundlis(): KundliData[] {
  return loadWebKundliStore().savedKundlis;
}

export function loadWebActiveChartContext(): ChartContext | undefined {
  return loadWebKundliStore().activeChartContext;
}

export function loadWebKundliStore(): WebKundliStore {
  const stored = readStore();
  const legacyActive = readLegacyActiveKundli();
  const legacySaved = readLegacySavedKundlis();
  const savedKundlis = dedupeKundlis([
    ...(stored?.activeKundli ? [stored.activeKundli] : []),
    ...(stored?.savedKundlis ?? []),
    ...legacySaved,
    ...(legacyActive ? [legacyActive] : []),
  ]);
  const activeKundliId =
    stored?.activeKundliId ?? legacyActive?.id ?? savedKundlis[0]?.id;
  const activeKundli =
    savedKundlis.find(item => item.id === activeKundliId) ??
    stored?.activeKundli ??
    legacyActive ??
    savedKundlis[0];
  const activeChartContext =
    stored?.activeChartContext && activeKundli
      ? {
          ...stored.activeChartContext,
          handoffBirthSummary:
            stored.activeChartContext.handoffBirthSummary ??
            buildWebKundliBirthSummary(activeKundli),
          kundliId: stored.activeChartContext.kundliId ?? activeKundli.id,
        }
      : stored?.activeChartContext;

  return {
    activeChartContext,
    activeKundli,
    activeKundliId: activeKundli?.id,
    guestSession: stored?.guestSession ?? getOrCreateWebGuestSession(),
    savedKundlis,
    updatedAt: stored?.updatedAt,
  };
}

export function saveWebKundli(
  kundli: KundliData,
  options: SaveKundliOptions = {},
): WebKundliStorageGate {
  const current = loadWebKundliStore();
  const gate = canSaveWebKundli(kundli, current);

  if (!gate.allowed) {
    return gate;
  }

  const nextKundliBase =
    gate.existingKundli && gate.existingKundli.id !== kundli.id
      ? {
          ...kundli,
          editHistory: kundli.editHistory ?? gate.existingKundli.editHistory,
          id: gate.existingKundli.id,
        }
      : kundli;
  const nextKundli = applyFamilyProfileMetadata(
    nextKundliBase,
    current,
    options.relationshipToOwner,
    gate.existingKundli,
  );

  saveWebKundliStore({
    ...current,
    activeKundli: nextKundli,
    activeKundliId: nextKundli.id,
    savedKundlis: dedupeKundlis([nextKundli, ...current.savedKundlis]),
  });
  if (!gate.existingKundli && hasWebPremiumKundliAccess()) {
    incrementPremiumKundliGenerationDayCount();
  }

  return {
    ...gate,
    allowed: true,
  };
}

export function setActiveWebKundli(kundli: KundliData): void {
  const current = loadWebKundliStore();
  saveWebKundliStore({
    ...current,
    activeKundli: applyFamilyProfileMetadata(kundli, current),
    activeKundliId: kundli.id,
    savedKundlis: dedupeKundlis([kundli, ...current.savedKundlis]),
  });
}

export function updateWebKundliFamilyRelationship(
  kundliId: string,
  relationshipToOwner: FamilyRelationshipLabel,
): WebKundliStore {
  const current = loadWebKundliStore();
  const updated = current.savedKundlis.map((kundli, index) => {
    if (kundli.id !== kundliId) {
      return normalizeStoredFamilyProfile(kundli, current, index);
    }
    if (kundli.isOwnerProfile) {
      return applyFamilyProfileMetadata(kundli, current, 'self', kundli);
    }
    return applyFamilyProfileMetadata(
      kundli,
      current,
      relationshipToOwner,
      kundli,
    );
  });
  const activeKundli = updated.find(item => item.id === current.activeKundliId) ?? updated[0];
  saveWebKundliStore({
    ...current,
    activeKundli,
    activeKundliId: activeKundli?.id,
    savedKundlis: updated,
  });
  return loadWebKundliStore();
}

export function canCreateAdditionalWebKundli(options: {
  isUpdate?: boolean;
} = {}): WebKundliStorageGate {
  const current = loadWebKundliStore();
  const signedIn = isWebUserSignedIn();
  const decision = evaluateKundliLibraryEntitlement({
    generatedKundlisToday: readPremiumKundliGenerationDayCount(),
    hasPremiumAccess: hasWebPremiumKundliAccess(),
    isUpdate: options.isUpdate,
    savedKundliCount: current.savedKundlis.length,
    signedIn,
  });

  return {
    allowed: decision.allowed,
    reason: decision.reason,
    remaining: decision.remaining,
    savedCount: current.savedKundlis.length,
    signedIn,
  };
}

export function canSaveWebKundli(
  kundli: KundliData,
  store: WebKundliStore = loadWebKundliStore(),
): WebKundliStorageGate {
  const signedIn = isWebUserSignedIn();
  const existingKundli = store.savedKundlis.find(
    item => item.id === kundli.id || haveSameBirthSignature(item, kundli),
  );
  const decision = evaluateKundliLibraryEntitlement({
    existingKundli: Boolean(existingKundli),
    generatedKundlisToday: readPremiumKundliGenerationDayCount(),
    hasPremiumAccess: hasWebPremiumKundliAccess(),
    savedKundliCount: store.savedKundlis.length,
    signedIn,
  });

  if (
    decision.allowed ||
    (!signedIn && existingKundli) ||
    (!signedIn && store.savedKundlis.length < WEB_GUEST_KUNDLI_LIMIT)
  ) {
    return {
      allowed: true,
      existingKundli,
      remaining: decision.remaining,
      savedCount: store.savedKundlis.length,
      signedIn,
    };
  }

  return {
    allowed: false,
    reason: decision.reason,
    remaining: decision.remaining,
    savedCount: store.savedKundlis.length,
    signedIn,
  };
}

export function deleteWebKundli(kundliId: string): WebKundliStore {
  const current = loadWebKundliStore();
  const savedKundlis = current.savedKundlis.filter(
    kundli => kundli.id !== kundliId,
  );
  const activeKundli =
    current.activeKundliId === kundliId
      ? savedKundlis[0]
      : savedKundlis.find(kundli => kundli.id === current.activeKundliId) ??
        savedKundlis[0];
  const next: WebKundliStore = {
    ...current,
    activeChartContext:
      current.activeChartContext?.kundliId === kundliId
        ? undefined
        : current.activeChartContext,
    activeKundli,
    activeKundliId: activeKundli?.id,
    savedKundlis,
  };

  saveWebKundliStore(next);

  return loadWebKundliStore();
}

export async function refreshWebKundliGocharIfNeeded(
  kundli?: KundliData,
): Promise<KundliData | undefined> {
  if (!kundli || isKundliGocharFreshToday(kundli)) {
    return kundli;
  }

  const refreshKey = `${kundli.id}:${getLocalDateKey()}`;
  const existing = gocharRefreshes.get(refreshKey);

  if (existing) {
    return existing;
  }

  if (wasGocharRefreshAttemptedRecently(refreshKey)) {
    return kundli;
  }

  const refresh = generateKundliFromWeb(kundli.birthDetails)
    .then(nextKundli => {
      markGocharRefreshAttempt(refreshKey);
      return nextKundli;
    })
    .catch(() => {
      markGocharRefreshAttempt(refreshKey);
      return kundli;
    })
    .finally(() => {
      gocharRefreshes.delete(refreshKey);
    });

  gocharRefreshes.set(refreshKey, refresh);

  return refresh;
}

export function isKundliGocharFreshToday(kundli: KundliData): boolean {
  const calculatedAt =
    kundli.transits?.[0]?.calculatedAt ?? kundli.calculationMeta?.calculatedAt;

  return calculatedAt ? getLocalDateKey(calculatedAt) === getLocalDateKey() : false;
}

export function saveWebActiveChartContext(
  activeChartContext: ChartContext | undefined,
): void {
  const current = loadWebKundliStore();
  saveWebKundliStore({
    ...current,
    activeChartContext,
  });
}

export function resolveWebKundliForContext(
  context?: ChartContext,
): KundliData | undefined {
  const store = loadWebKundliStore();

  if (context?.kundliId) {
    const byId = store.savedKundlis.find(item => item.id === context.kundliId);

    if (byId) {
      return byId;
    }
  }

  if (context?.handoffBirthSummary) {
    const byBirthSummary = store.savedKundlis.find(item =>
      context.handoffBirthSummary?.includes(item.birthDetails.name),
    );

    if (byBirthSummary) {
      return byBirthSummary;
    }
  }

  return store.activeKundli ?? store.savedKundlis[0];
}

export function resolveSharedWebKundliContext(
  context?: ChartContext,
  preferredKundli?: KundliData,
): SharedWebKundliContextResolution {
  const store = loadWebKundliStore();
  const byExplicitId = context?.kundliId
    ? store.savedKundlis.find(item => item.id === context.kundliId)
    : undefined;
  const byPreferred =
    preferredKundli && store.savedKundlis.find(item => item.id === preferredKundli.id)
      ? preferredKundli
      : undefined;
  const byContext = byExplicitId
    ? undefined
    : context
      ? resolveWebKundliForContext(context)
      : undefined;
  const kundli =
    byExplicitId ??
    byPreferred ??
    byContext ??
    store.activeKundli ??
    store.savedKundlis[0];
  const source = byExplicitId
    ? 'explicit-kundli-id'
    : byPreferred
      ? 'preferred-kundli'
      : byContext && context?.handoffBirthSummary
        ? 'birth-summary'
        : byContext
          ? 'saved-kundli'
          : store.activeKundli
            ? 'active-kundli'
            : store.savedKundlis[0]
              ? 'saved-kundli'
              : 'none';

  return {
    chartContext:
      context && kundli
        ? {
            ...context,
            handoffBirthSummary:
              context.handoffBirthSummary ?? buildWebKundliBirthSummary(kundli),
            kundliId: kundli.id,
          }
        : context,
    kundli,
    source,
  };
}

export function buildWebKundliBirthSummary(kundli: KundliData): string {
  return [
    kundli.birthDetails.name,
    kundli.birthDetails.date,
    kundli.birthDetails.time,
    kundli.birthDetails.place,
  ]
    .filter(Boolean)
    .join(' | ');
}

function saveWebKundliStore(store: WebKundliStore): void {
  const activeKundli =
    store.activeKundli ??
    store.savedKundlis.find(item => item.id === store.activeKundliId) ??
    store.savedKundlis[0];
  const normalizedSavedKundlis = dedupeKundlis([
    ...(activeKundli ? [activeKundli] : []),
    ...store.savedKundlis,
  ]).map((kundli, index) => normalizeStoredFamilyProfile(kundli, store, index));
  const normalizedActiveKundli =
    normalizedSavedKundlis.find(item => item.id === activeKundli?.id) ??
    normalizedSavedKundlis[0];
  const next: WebKundliStore = {
    activeChartContext:
      store.activeChartContext && normalizedActiveKundli
        ? {
            ...store.activeChartContext,
            handoffBirthSummary:
              store.activeChartContext.handoffBirthSummary ??
              buildWebKundliBirthSummary(normalizedActiveKundli),
            kundliId: store.activeChartContext.kundliId ?? normalizedActiveKundli.id,
          }
        : store.activeChartContext,
    activeKundli: normalizedActiveKundli,
    activeKundliId: normalizedActiveKundli?.id,
    guestSession: store.guestSession ?? getOrCreateWebGuestSession(),
    savedKundlis: normalizedSavedKundlis,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(WEB_KUNDLI_STORE_KEY, JSON.stringify(next));
    if (next.activeKundli) {
      localStorage.setItem(ACTIVE_KUNDLI_KEY, JSON.stringify(next.activeKundli));
    } else {
      localStorage.removeItem(ACTIVE_KUNDLI_KEY);
    }
    localStorage.setItem(SAVED_KUNDLIS_KEY, JSON.stringify(next.savedKundlis));
  } catch {
    // The UI still keeps in-memory state if browser storage is unavailable.
  }

  notifyWebKundliUpdated();
}

function readStore(): WebKundliStore | undefined {
  try {
    const raw = localStorage.getItem(WEB_KUNDLI_STORE_KEY);

    if (!raw) {
      return undefined;
    }

    return sanitizeStoredWebKundliStore(JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
}

function readLegacyActiveKundli(): KundliData | undefined {
  try {
    const raw = localStorage.getItem(ACTIVE_KUNDLI_KEY);

    if (!raw) {
      return undefined;
    }

    return sanitizeStoredKundli(JSON.parse(raw) as unknown);
  } catch {
    return undefined;
  }
}

function readLegacySavedKundlis(): KundliData[] {
  try {
    const raw = localStorage.getItem(SAVED_KUNDLIS_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.map(item => sanitizeStoredKundli(item)).filter(isDefinedKundli)
      : [];
  } catch {
    return [];
  }
}

function dedupeKundlis(kundlis: KundliData[]): KundliData[] {
  const seen = new Set<string>();
  const result: KundliData[] = [];

  for (const kundli of kundlis) {
    if (!kundli?.birthDetails) {
      continue;
    }
    const key = kundli.id || kundli.calculationMeta?.inputHash;
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(kundli);
  }

  return result;
}

function haveSameBirthSignature(first: KundliData, second: KundliData): boolean {
  return birthSignature(first.birthDetails) === birthSignature(second.birthDetails);
}

function birthSignature(details: BirthDetails): string {
  return [
    details.name.trim().toLowerCase(),
    details.date,
    details.time,
    details.place.trim().toLowerCase(),
    details.timezone,
  ].join('|');
}

function isWebUserSignedIn(): boolean {
  try {
    return Boolean(getFirebaseWebAuth().currentUser?.uid);
  } catch {
    return false;
  }
}

function hasWebPremiumKundliAccess(): boolean {
  try {
    const uid = getFirebaseWebAuth().currentUser?.uid;
    return Boolean(readWebKundliEntitlementSnapshot(uid)?.hasPremiumAccess);
  } catch {
    return false;
  }
}

function readPremiumKundliGenerationDayCount(): number {
  try {
    const raw = localStorage.getItem(PREMIUM_KUNDLI_GENERATION_DAY_KEY);
    const parsed = raw
      ? (JSON.parse(raw) as { count?: number; dayKey?: string })
      : undefined;

    return parsed?.dayKey === getLocalDateKey()
      ? Math.max(0, parsed.count ?? 0)
      : 0;
  } catch {
    return 0;
  }
}

function incrementPremiumKundliGenerationDayCount(): void {
  try {
    localStorage.setItem(
      PREMIUM_KUNDLI_GENERATION_DAY_KEY,
      JSON.stringify({
        count: readPremiumKundliGenerationDayCount() + 1,
        dayKey: getLocalDateKey(),
      }),
    );
  } catch {
    // Soft-limit telemetry must never break a successful Kundli save.
  }
}

function getLocalDateKey(value?: string): string {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    return getLocalDateKey();
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function wasGocharRefreshAttemptedRecently(refreshKey: string): boolean {
  try {
    const raw = localStorage.getItem(`${GOCHAR_REFRESH_PREFIX}:${refreshKey}`);
    const timestamp = raw ? Number(raw) : 0;

    return timestamp > 0 && Date.now() - timestamp < 5 * 60 * 1000;
  } catch {
    return false;
  }
}

function markGocharRefreshAttempt(refreshKey: string): void {
  try {
    localStorage.setItem(
      `${GOCHAR_REFRESH_PREFIX}:${refreshKey}`,
      String(Date.now()),
    );
  } catch {
    // Daily Gochar still works in memory if browser storage is unavailable.
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown };

    return typeof payload.detail === 'string'
      ? payload.detail
      : 'Kundli calculation failed. Please check the birth details.';
  } catch {
    return 'Kundli calculation failed. Please check the birth details.';
  }
}

function notifyWebKundliUpdated(): void {
  try {
    window.dispatchEvent(new Event(WEB_KUNDLI_UPDATED_EVENT));
  } catch {
    // Storage still succeeds if same-tab listeners cannot be notified.
  }
}

function sanitizeStoredWebKundliStore(
  value: unknown,
): WebKundliStore | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const activeKundli = sanitizeStoredKundli(value.activeKundli);
  const savedKundlis = Array.isArray(value.savedKundlis)
    ? value.savedKundlis
        .map(item => sanitizeStoredKundli(item))
        .filter(isDefinedKundli)
    : [];

  return {
    activeChartContext: isRecord(value.activeChartContext)
      ? (value.activeChartContext as ChartContext)
      : undefined,
    activeKundli,
    activeKundliId:
      typeof value.activeKundliId === 'string'
        ? value.activeKundliId
        : activeKundli?.id,
    guestSession: isRecord(value.guestSession)
      ? (value.guestSession as WebGuestSession)
      : undefined,
    savedKundlis,
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : undefined,
  };
}

function sanitizeStoredKundli(value: unknown): KundliData | undefined {
  if (!isRecord(value) || !isRecord(value.birthDetails)) {
    return undefined;
  }

  const birthDetails = value.birthDetails as BirthDetails;
  if (
    typeof birthDetails.name !== 'string' ||
    typeof birthDetails.date !== 'string' ||
    typeof birthDetails.place !== 'string' ||
    typeof birthDetails.time !== 'string'
  ) {
    return undefined;
  }

  return value as KundliData;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null;
}

function isDefinedKundli(value: KundliData | undefined): value is KundliData {
  return Boolean(value);
}

function applyFamilyProfileMetadata(
  kundli: KundliData,
  store: WebKundliStore,
  requestedRelationship?: FamilyRelationshipLabel,
  existingKundli?: KundliData,
): KundliData {
  const existing = existingKundli ?? store.savedKundlis.find(item => item.id === kundli.id);
  const existingOwner = store.savedKundlis.find(item => item.isOwnerProfile);
  const isFirstProfile = store.savedKundlis.length === 0;
  const isOwnerProfile = existing?.isOwnerProfile ?? (!existingOwner && isFirstProfile);
  const relationshipToOwner =
    isOwnerProfile
      ? 'self'
      : requestedRelationship ??
        existing?.relationshipToOwner ??
        'other';
  const metadata = buildFamilyProfileMetadata(
    relationshipToOwner,
    isOwnerProfile,
  );

  return {
    ...existing,
    ...kundli,
    ...metadata,
  };
}

function normalizeStoredFamilyProfile(
  kundli: KundliData,
  store: WebKundliStore,
  index: number,
): KundliData {
  const hasOwnerProfile = store.savedKundlis.some(item => item.isOwnerProfile);
  const isOwnerProfile = kundli.isOwnerProfile ?? (!hasOwnerProfile && index === 0);
  const relationshipToOwner = isOwnerProfile
    ? 'self'
    : kundli.relationshipToOwner ?? 'other';
  return {
    ...kundli,
    ...buildFamilyProfileMetadata(relationshipToOwner, isOwnerProfile),
    relationshipColorToken:
      kundli.relationshipColorToken ??
      getFamilyRelationshipColorToken(relationshipToOwner),
  };
}
