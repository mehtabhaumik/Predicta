import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import type { PdfGenerationRequest } from '@pridicta/pdf/reportDocument';
import {
  buildPredictaPdfResult,
  createPredictaReportPdfElement,
} from '@pridicta/pdf/reportDocument';
import { requireFirebaseUser } from '../../../../lib/firebase/server-auth';

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

  const result = buildPredictaPdfResult(payload);
  const pdfBuffer = await renderToBuffer(
    createPredictaReportPdfElement(result, {
      logoSrc: await loadPredictaLogoDataUri(),
      watermarkSrc: await loadPredictaWatermarkDataUri(),
    }),
  );

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
