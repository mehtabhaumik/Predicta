import {
  applyServerEntitlementOperation,
  createDefaultServerEntitlementLedger,
  normalizeServerEntitlementLedger,
  type ServerEntitlementLedger,
  type ServerEntitlementOperation,
  type ServerEntitlementOperationResult,
} from '@pridicta/monetization';

type VerifiedUserWithToken = {
  email?: string;
  token: string;
  uid: string;
};

type FirestoreDocument = {
  createTime?: string;
  fields?: Record<string, FirestoreValue>;
  name: string;
  updateTime?: string;
};

type FirestoreValue =
  | { arrayValue: { values?: FirestoreValue[] } }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { nullValue: null }
  | { stringValue: string };

type LedgerRead = {
  ledger: ServerEntitlementLedger;
  updateTime?: string;
};

const MAX_COMMIT_RETRIES = 3;

export async function readServerEntitlementLedger(
  user: VerifiedUserWithToken,
): Promise<ServerEntitlementLedger> {
  return (await readLedgerDocument(user)).ledger;
}

export async function commitServerEntitlementOperation({
  operation,
  user,
}: {
  operation: ServerEntitlementOperation;
  user: VerifiedUserWithToken;
}): Promise<ServerEntitlementOperationResult & { duplicate: boolean }> {
  const operationId = sanitizeOperationId(operation.idempotencyKey);

  for (let attempt = 0; attempt < MAX_COMMIT_RETRIES; attempt += 1) {
    const current = await readLedgerDocument(user);
    const result = applyServerEntitlementOperation({
      ledger: current.ledger,
      operation,
    });

    if (!result.changed) {
      return {
        ...result,
        duplicate: false,
      };
    }

    const commit = await firestoreFetch(user, ':commit', {
      body: JSON.stringify({
        writes: [
          {
            currentDocument: {
              exists: false,
            },
            update: {
              fields: toFirestoreFields({
                createdAt: new Date().toISOString(),
                kind: operation.kind,
                operation,
                uid: user.uid,
              }),
              name: operationDocumentPath(user.uid, operationId),
            },
          },
          {
            currentDocument: current.updateTime
              ? { updateTime: current.updateTime }
              : { exists: false },
            update: {
              fields: toFirestoreFields(result.ledger),
              name: ledgerDocumentPath(user.uid),
            },
          },
        ],
      }),
      method: 'POST',
    });

    if (commit.ok) {
      return {
        ...result,
        duplicate: false,
      };
    }

    if (commit.status === 400 || commit.status === 409) {
      const duplicate = await readOperationDocument(user, operationId);
      if (duplicate) {
        return {
          changed: false,
          duplicate: true,
          ledger: (await readLedgerDocument(user)).ledger,
        };
      }
      continue;
    }

    throw new Error(`Entitlement ledger commit failed with HTTP ${commit.status}.`);
  }

  throw new Error('Entitlement ledger commit could not be completed safely.');
}

async function readLedgerDocument(user: VerifiedUserWithToken): Promise<LedgerRead> {
  const response = await firestoreFetch(user, `/users/${encodePath(user.uid)}/entitlementLedger/current`);

  if (response.status === 404) {
    return {
      ledger: createDefaultServerEntitlementLedger(user.uid),
    };
  }

  if (!response.ok) {
    throw new Error(`Entitlement ledger read failed with HTTP ${response.status}.`);
  }

  const document = (await response.json()) as FirestoreDocument;
  return {
    ledger: normalizeServerEntitlementLedger(
      user.uid,
      fromFirestoreFields(document.fields ?? {}) as Partial<ServerEntitlementLedger>,
    ),
    updateTime: document.updateTime,
  };
}

async function readOperationDocument(
  user: VerifiedUserWithToken,
  operationId: string,
): Promise<boolean> {
  const response = await firestoreFetch(
    user,
    `/users/${encodePath(user.uid)}/entitlementOperations/${encodePath(operationId)}`,
  );
  return response.ok;
}

async function firestoreFetch(
  user: VerifiedUserWithToken,
  documentPathOrSuffix: string,
  init: RequestInit = {},
): Promise<Response> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('Firebase project id is missing.');
  }

  const url = documentPathOrSuffix.startsWith(':')
    ? `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents${documentPathOrSuffix}`
    : `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents${documentPathOrSuffix}`;

  return fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${user.token}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

function ledgerDocumentPath(uid: string): string {
  return `projects/${projectId()}/databases/(default)/documents/users/${encodePath(uid)}/entitlementLedger/current`;
}

function operationDocumentPath(uid: string, operationId: string): string {
  return `projects/${projectId()}/databases/(default)/documents/users/${encodePath(uid)}/entitlementOperations/${encodePath(operationId)}`;
}

function projectId(): string {
  const value = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!value) {
    throw new Error('Firebase project id is missing.');
  }
  return value;
}

function encodePath(value: string): string {
  return encodeURIComponent(value).replace(/%2F/gi, '_');
}

function sanitizeOperationId(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'operation';
}

function toFirestoreFields(value: unknown): Record<string, FirestoreValue> {
  const encoded = toFirestoreValue(value);
  if (!('mapValue' in encoded)) {
    return {};
  }
  return encoded.mapValue.fields ?? {};
}

function toFirestoreValue(value: unknown): FirestoreValue {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }

  if (typeof value === 'string') {
    return { stringValue: value };
  }

  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }

  if (typeof value === 'number') {
    return { integerValue: String(Math.trunc(value)) };
  }

  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(item => toFirestoreValue(item)),
      },
    };
  }

  if (typeof value === 'object') {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value as Record<string, unknown>).map(([key, item]) => [
            key,
            toFirestoreValue(item),
          ]),
        ),
      },
    };
  }

  return { stringValue: String(value) };
}

function fromFirestoreFields(fields: Record<string, FirestoreValue>): unknown {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, fromFirestoreValue(value)]),
  );
}

function fromFirestoreValue(value: FirestoreValue): unknown {
  if ('stringValue' in value) {
    return value.stringValue;
  }
  if ('integerValue' in value) {
    return Number(value.integerValue);
  }
  if ('booleanValue' in value) {
    return value.booleanValue;
  }
  if ('arrayValue' in value) {
    return (value.arrayValue.values ?? []).map(item => fromFirestoreValue(item));
  }
  if ('mapValue' in value) {
    return fromFirestoreFields(value.mapValue.fields ?? {});
  }
  return null;
}
