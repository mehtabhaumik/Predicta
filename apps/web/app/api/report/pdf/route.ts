import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import type { ReportCreditType, ServerEntitlementLedger } from '@pridicta/monetization';

import type { PdfGenerationRequest } from '@pridicta/pdf/reportDocument';
import {
  buildPredictaPdfResult,
  createPredictaReportPdfElement,
} from '@pridicta/pdf/reportDocument';
import { requireFirebaseUser } from '../../../../lib/firebase/server-auth';
import {
  commitServerEntitlementOperation,
  readServerEntitlementLedger,
} from '../../../../lib/firebase/server-entitlement-ledger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  const auth = await requireFirebaseUser(request);
  if (!auth.ok) {
    return auth.response;
  }

  let payload: PdfGenerationRequest;

  try {
    payload = (await request.json()) as PdfGenerationRequest;
  } catch {
    return NextResponse.json(
      { error: 'Report PDF payload is invalid.' },
      { status: 400 },
    );
  }

  if (!payload?.kundli) {
    return NextResponse.json(
      { error: 'A calculated Kundli is required before creating a PDF.' },
      { status: 400 },
    );
  }

  if (
    payload.reportFocus === 'SIGNATURE' &&
    !hasReadySignatureAnalysis(payload.signatureAnalysis)
  ) {
    return NextResponse.json(
      { error: 'A confirmed signature sample is required before creating a Signature report.' },
      { status: 422 },
    );
  }

  const ledger = await readServerEntitlementLedger(auth.user);
  const paidReportCredit = selectPaidReportCreditSpend(ledger, payload);

  if (payload.mode === 'PREMIUM' && !hasPremiumReportAccess(ledger) && !paidReportCredit) {
    return NextResponse.json(
      { error: 'A Premium subscription, Day Pass, or paid report credit is required before creating this Premium PDF.' },
      { status: 402 },
    );
  }

  const result = buildPredictaPdfResult(payload);
  const pdfBuffer = await renderToBuffer(
    createPredictaReportPdfElement(result, {
      logoSrc: await loadPredictaLogoDataUri(),
      watermarkSrc: await loadPredictaWatermarkDataUri(),
    }),
  );

  if (paidReportCredit) {
    await commitServerEntitlementOperation({
      operation: {
        idempotencyKey: buildReportCreditIdempotencyKey(
          auth.user.uid,
          paidReportCredit.source,
          paidReportCredit.reportType,
          payload,
        ),
        kind: 'consume_report_credit',
        reportType: paidReportCredit.reportType,
        source: paidReportCredit.source,
      },
      user: auth.user,
    });
  }

  const safeName = sanitizeFilename(payload.kundli.birthDetails.name || 'predicta');
  const modeLabel = payload.mode.toLowerCase();
  const focusLabel = (payload.reportFocus ?? 'kundli').toLowerCase();
  const filename = `predicta-${safeName}-${focusLabel}-${modeLabel}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/pdf',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

function hasPremiumReportAccess(ledger: ServerEntitlementLedger): boolean {
  return (
    ledger.premiumEntitlement.status === 'ACTIVE' ||
    ledger.premiumEntitlement.status === 'GRACE_PERIOD' ||
    (ledger.dayPassEntitlement.active && ledger.dayPassEntitlement.pdfsRemaining > 0)
  );
}

function selectPaidReportCreditSpend(
  ledger: ServerEntitlementLedger,
  payload: PdfGenerationRequest,
): { reportType: ReportCreditType; source: 'personal' | 'family_bank' } | undefined {
  if (payload.mode !== 'PREMIUM' || hasPremiumReportAccess(ledger)) {
    return undefined;
  }

  const preferred = mapReportFocusToCreditType(payload.reportFocus);
  const candidates: ReportCreditType[] =
    preferred === 'PREMIUM_PDF' ? ['PREMIUM_PDF'] : [preferred, 'PREMIUM_PDF'];

  for (const reportType of candidates) {
    if ((ledger.reportCreditsByType[reportType] ?? 0) > 0) {
      return { reportType, source: 'personal' };
    }
    if ((ledger.familyBank.sharedReportCreditsByType[reportType] ?? 0) > 0) {
      return { reportType, source: 'family_bank' };
    }
  }

  return undefined;
}

function mapReportFocusToCreditType(
  reportFocus: PdfGenerationRequest['reportFocus'],
): ReportCreditType {
  switch (reportFocus) {
    case 'KP':
      return 'KP';
    case 'JAIMINI':
      return 'JAIMINI';
    case 'NUMEROLOGY':
      return 'NUMEROLOGY';
    case 'SIGNATURE':
      return 'SIGNATURE';
    case 'LIFE_ATLAS':
      return 'LIFE_ATLAS';
    case 'VEDIC':
    case 'KUNDLI':
      return 'VEDIC';
    default:
      return 'PREMIUM_PDF';
  }
}

function buildReportCreditIdempotencyKey(
  uid: string,
  source: 'personal' | 'family_bank',
  reportType: ReportCreditType,
  payload: PdfGenerationRequest,
): string {
  const digest = createHash('sha256')
    .update(
      JSON.stringify({
        at: Date.now(),
        kundliId: payload.kundli?.id,
        mode: payload.mode,
        reportFocus: payload.reportFocus,
        reportType,
        sectionKeys: payload.sectionKeys,
        source,
        uid,
      }),
    )
    .digest('hex')
    .slice(0, 24);
  return `report-pdf:${uid}:${source}:${reportType}:${digest}`;
}

async function loadPredictaLogoDataUri(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), 'public', 'predicta-logo.png'),
    path.join(process.cwd(), 'apps', 'web', 'public', 'predicta-logo.png'),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      const buffer = await readFile(candidate);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    } catch {
      continue;
    }
  }

  throw new Error('Predicta logo asset is missing for PDF generation.');
}

async function loadPredictaWatermarkDataUri(): Promise<string> {
  const candidates = [
    path.join(process.cwd(), 'public', 'predicta-seal-watermark.png'),
    path.join(process.cwd(), 'apps', 'web', 'public', 'predicta-seal-watermark.png'),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      const buffer = await readFile(candidate);
      return `data:image/png;base64,${buffer.toString('base64')}`;
    } catch {
      continue;
    }
  }

  return loadPredictaLogoDataUri();
}

function hasReadySignatureAnalysis(
  signatureAnalysis: PdfGenerationRequest['signatureAnalysis'],
): boolean {
  return Boolean(
    signatureAnalysis?.status === 'ready' &&
      signatureAnalysis.observedTraits.some(
        trait => trait.confirmationState === 'confirmed',
      ),
  );
}

function sanitizeFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'predicta';
}
