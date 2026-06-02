import { NextResponse } from 'next/server';
import type { ReportCreditType, ServerEntitlementOperation } from '@pridicta/monetization';
import { requireFirebaseUser } from '../../../../lib/firebase/server-auth';
import {
  commitServerEntitlementOperation,
  readServerEntitlementLedger,
} from '../../../../lib/firebase/server-entitlement-ledger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  const auth = await requireFirebaseUser(request);
  if (!auth.ok) {
    return auth.response;
  }

  const ledger = await readServerEntitlementLedger(auth.user);
  return NextResponse.json({ ledger });
}

export async function POST(request: Request): Promise<Response> {
  const auth = await requireFirebaseUser(request);
  if (!auth.ok) {
    return auth.response;
  }

  const writeAuth = requireEntitlementWriteAuthorization(request);
  if (writeAuth) {
    return writeAuth;
  }

  let payload: { operation?: unknown };
  try {
    payload = (await request.json()) as { operation?: unknown };
  } catch {
    return NextResponse.json(
      { error: 'Entitlement operation payload is invalid.' },
      { status: 400 },
    );
  }

  const operation = normalizeOperation(payload.operation);
  if (!operation) {
    return NextResponse.json(
      { error: 'Entitlement operation is not allowed.' },
      { status: 400 },
    );
  }

  const result = await commitServerEntitlementOperation({
    operation,
    user: auth.user,
  });

  return NextResponse.json(result);
}

function requireEntitlementWriteAuthorization(request: Request): Response | undefined {
  const secret = process.env.PREDICTA_ENTITLEMENT_OPERATION_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'Entitlement mutation is not configured.' },
      { status: 503 },
    );
  }

  if (request.headers.get('x-predicta-entitlement-operation-secret') !== secret) {
    return NextResponse.json(
      { error: 'Entitlement mutation is not allowed from this client.' },
      { status: 403 },
    );
  }

  return undefined;
}

function normalizeOperation(value: unknown): ServerEntitlementOperation | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const operation = value as Record<string, unknown>;
  if (typeof operation.idempotencyKey !== 'string' || !operation.idempotencyKey.trim()) {
    return undefined;
  }

  switch (operation.kind) {
    case 'record_successful_free_ai_answer':
      return {
        idempotencyKey: operation.idempotencyKey,
        kind: operation.kind,
      };

    case 'grant_paid_ai_questions':
      return {
        idempotencyKey: operation.idempotencyKey,
        kind: operation.kind,
        quantity: Number(operation.quantity ?? 0),
      };

    case 'record_successful_paid_ai_answer':
      if (operation.source !== 'personal' && operation.source !== 'family_bank') {
        return undefined;
      }
      return {
        idempotencyKey: operation.idempotencyKey,
        kind: operation.kind,
        source: operation.source,
      };

    case 'record_successful_day_pass_ai_answer':
      return {
        idempotencyKey: operation.idempotencyKey,
        kind: operation.kind,
      };

    case 'grant_report_credit':
      if (typeof operation.reportType !== 'string') {
        return undefined;
      }
      return {
        idempotencyKey: operation.idempotencyKey,
        kind: operation.kind,
        quantity: Number(operation.quantity ?? 0),
        reportType: operation.reportType as ReportCreditType,
      } as ServerEntitlementOperation;

    case 'consume_report_credit':
      if (
        typeof operation.reportType !== 'string' ||
        (operation.source !== 'personal' && operation.source !== 'family_bank')
      ) {
        return undefined;
      }
      return {
        idempotencyKey: operation.idempotencyKey,
        kind: operation.kind,
        reportType: operation.reportType as ReportCreditType,
        source: operation.source,
      } as ServerEntitlementOperation;

    case 'consume_day_pass_report_pdf':
      return {
        idempotencyKey: operation.idempotencyKey,
        kind: operation.kind,
      };

    case 'sync_saved_kundli_count':
      return {
        idempotencyKey: operation.idempotencyKey,
        kind: operation.kind,
        savedKundliCount: Number(operation.savedKundliCount ?? 0),
      };

    case 'activate_premium':
      if (!operation.entitlement || typeof operation.entitlement !== 'object') {
        return undefined;
      }
      return operation as ServerEntitlementOperation;

    case 'activate_day_pass':
      if (!operation.dayPass || typeof operation.dayPass !== 'object') {
        return undefined;
      }
      return operation as ServerEntitlementOperation;

    case 'configure_family_bank':
      if (!operation.familyBank || typeof operation.familyBank !== 'object') {
        return undefined;
      }
      return operation as ServerEntitlementOperation;

    default:
      return undefined;
  }
}
