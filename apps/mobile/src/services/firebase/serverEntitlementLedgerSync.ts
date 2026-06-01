import firestore from '@react-native-firebase/firestore';
import {
  applyServerEntitlementOperation,
  createDefaultServerEntitlementLedger,
  normalizeServerEntitlementLedger,
  type ServerEntitlementLedger,
  type ServerEntitlementOperation,
  type ServerEntitlementOperationResult,
} from '@pridicta/monetization';

import { userDocument } from './dbService';

export async function loadServerEntitlementLedgerFromFirebase(
  userId: string,
): Promise<ServerEntitlementLedger> {
  const snapshot = await userDocument(userId)
    .collection('entitlementLedger')
    .doc('current')
    .get();

  return normalizeServerEntitlementLedger(
    userId,
    snapshot.exists() ? (snapshot.data() as Partial<ServerEntitlementLedger>) : undefined,
  );
}

export async function commitServerEntitlementOperationToFirebase({
  operation,
  userId,
}: {
  operation: ServerEntitlementOperation;
  userId: string;
}): Promise<ServerEntitlementOperationResult & { duplicate: boolean }> {
  const operationId = sanitizeOperationId(operation.idempotencyKey);
  const ledgerRef = userDocument(userId).collection('entitlementLedger').doc('current');
  const operationRef = userDocument(userId)
    .collection('entitlementOperations')
    .doc(operationId);

  return firestore().runTransaction(async transaction => {
    const existingOperation = await transaction.get(operationRef);
    if (existingOperation.exists()) {
      const ledgerSnapshot = await transaction.get(ledgerRef);
      return {
        changed: false,
        duplicate: true,
        ledger: normalizeServerEntitlementLedger(
          userId,
          ledgerSnapshot.exists()
            ? (ledgerSnapshot.data() as Partial<ServerEntitlementLedger>)
            : undefined,
        ),
      };
    }

    const ledgerSnapshot = await transaction.get(ledgerRef);
    const currentLedger = ledgerSnapshot.exists()
      ? normalizeServerEntitlementLedger(
          userId,
          ledgerSnapshot.data() as Partial<ServerEntitlementLedger>,
        )
      : createDefaultServerEntitlementLedger(userId);
    const result = applyServerEntitlementOperation({
      ledger: currentLedger,
      operation,
    });

    if (result.changed) {
      transaction.set(operationRef, {
        createdAt: new Date().toISOString(),
        kind: operation.kind,
        operation,
        uid: userId,
      });
      transaction.set(ledgerRef, result.ledger);
    }

    return {
      ...result,
      duplicate: false,
    };
  });
}

function sanitizeOperationId(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(0, 120) || 'operation';
}
