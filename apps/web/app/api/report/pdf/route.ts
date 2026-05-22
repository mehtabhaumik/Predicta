import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

import type { PdfGenerationRequest } from '@pridicta/pdf/reportDocument';
import {
  buildPredictaPdfResult,
  createPredictaReportPdfElement,
} from '@pridicta/pdf/reportDocument';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
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

  const result = buildPredictaPdfResult(payload);
  const pdfBuffer = await renderToBuffer(
    createPredictaReportPdfElement(result, {
      logoSrc: await loadPredictaLogoDataUri(),
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
  const fileUrl = new URL('../../../../public/predicta-logo.png', import.meta.url);
  const buffer = await readFile(fileURLToPath(fileUrl));
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

function sanitizeFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'predicta';
}
