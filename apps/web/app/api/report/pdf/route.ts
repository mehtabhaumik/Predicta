import { createHash } from 'node:crypto';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import {
  evaluateReportEntitlement,
  type ReportCreditType,
} from '@pridicta/monetization';

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

  const normalizedPayload = normalizeLegacyReportFocus(payload);

  if (
    normalizedPayload.reportFocus === 'SIGNATURE' &&
    !hasReadySignatureAnalysis(normalizedPayload.signatureAnalysis)
  ) {
    return NextResponse.json(
      { error: 'A confirmed signature sample is required before creating a Signature report.' },
      { status: 422 },
    );
  }

  const ledger = await readServerEntitlementLedger(auth.user);
  const reportEntitlement = evaluateReportEntitlement({
    ledger,
    mode: normalizedPayload.mode,
    reportFocus: normalizedPayload.reportFocus,
  });

  if (!reportEntitlement.allowed) {
    return NextResponse.json(
      {
        error:
          'A Premium subscription, Day Pass, Family Bank credit, or paid report credit is required before creating this Premium PDF.',
        requiredCreditType: reportEntitlement.requiredCreditType,
      },
      { status: 402 },
    );
  }

  if (reportEntitlement.allowed && reportEntitlement.paidReportCredit) {
    await commitServerEntitlementOperation({
      operation: {
        idempotencyKey: buildReportCreditIdempotencyKey(
          auth.user.uid,
          reportEntitlement.paidReportCredit.source,
          reportEntitlement.paidReportCredit.reportType,
          normalizedPayload,
        ),
        kind: 'consume_report_credit',
        reportType: reportEntitlement.paidReportCredit.reportType,
        source: reportEntitlement.paidReportCredit.source,
      },
      user: auth.user,
    });
  } else if (reportEntitlement.allowed && reportEntitlement.creditSource === 'day_pass') {
    await commitServerEntitlementOperation({
      operation: {
        idempotencyKey: buildDayPassReportIdempotencyKey(auth.user.uid, normalizedPayload),
        kind: 'consume_day_pass_report_pdf',
      },
      user: auth.user,
    });
  }

  const result = buildPredictaPdfResult(normalizedPayload);
  const pdfBuffer = await renderToBuffer(
    createPredictaReportPdfElement(result, {
      logoSrc: await loadPredictaLogoDataUri(),
      watermarkSrc: await loadPredictaWatermarkDataUri(),
    }),
  );

  const safeName = sanitizeFilename(normalizedPayload.kundli.birthDetails.name || 'predicta');
  const modeLabel = normalizedPayload.mode.toLowerCase();
  const focusLabel = (normalizedPayload.reportFocus ?? 'kundli').toLowerCase();
  const filename = `predicta-${safeName}-${focusLabel}-${modeLabel}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    headers: {
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/pdf',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

function normalizeLegacyReportFocus(payload: PdfGenerationRequest): PdfGenerationRequest {
  const reportFocus =
    String(payload.reportFocus) === 'NADI'
      ? 'JAIMINI'
      : payload.reportFocus;

  return {
    ...payload,
    reportFocus,
  };
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

function buildDayPassReportIdempotencyKey(
  uid: string,
  payload: PdfGenerationRequest,
): string {
  const digest = createHash('sha256')
    .update(
      JSON.stringify({
        at: Date.now(),
        kundliId: payload.kundli?.id,
        mode: payload.mode,
        reportFocus: payload.reportFocus,
        sectionKeys: payload.sectionKeys,
        source: 'day_pass',
        uid,
      }),
    )
    .digest('hex')
    .slice(0, 24);
  return `report-pdf:${uid}:day_pass:${digest}`;
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
