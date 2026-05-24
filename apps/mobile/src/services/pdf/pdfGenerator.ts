import RNFS from 'react-native-fs';

import type { PdfReportFocus } from '@pridicta/pdf';
import type { SignatureAnalysisModel } from '@pridicta/types';

import { env } from '../../config/env';
import type {
  KundliData,
  PDFMode,
  SupportedLanguage,
} from '../../types/astrology';

export type HoroscopePdfResult = {
  filePath: string;
  generatedAt: string;
  mode: PDFMode;
};

type GenerateHoroscopePdfInput = {
  kundli: KundliData;
  language?: SupportedLanguage;
  mode: PDFMode;
  reportFocus?: PdfReportFocus;
  sectionKeys?: string[];
  signatureAnalysis?: SignatureAnalysisModel;
};

type PdfGenerationRequest = {
  kundli: KundliData;
  language?: SupportedLanguage;
  mode: PDFMode;
  reportFocus?: PdfReportFocus;
  sectionKeys?: string[];
  signatureAnalysis?: SignatureAnalysisModel;
};

export function buildMobileReportPdfPayload({
  kundli,
  language = 'en',
  mode,
  reportFocus,
  sectionKeys,
  signatureAnalysis,
}: GenerateHoroscopePdfInput): PdfGenerationRequest {
  return {
    kundli,
    language,
    mode,
    reportFocus,
    sectionKeys,
    signatureAnalysis,
  };
}

export async function generateHoroscopePdf({
  kundli,
  language = 'en',
  mode,
  reportFocus,
  sectionKeys,
  signatureAnalysis,
}: GenerateHoroscopePdfInput): Promise<HoroscopePdfResult> {
  const generatedAt = new Date().toISOString();
  const payload = buildMobileReportPdfPayload({
    kundli,
    language,
    mode,
    reportFocus,
    sectionKeys,
    signatureAnalysis,
  });
  const response = await fetch(env.reportPdfApiUrl, {
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error(
      await readReportPdfError(
        response,
        'Predicta could not prepare the document-grade PDF right now.',
      ),
    );
  }

  const pdfBytes = await response.arrayBuffer();
  const filename =
    parseDownloadFilename(response.headers.get('Content-Disposition')) ??
    `predicta-${sanitizeFilename(kundli.birthDetails.name)}-${(
      reportFocus ?? 'kundli'
    ).toLowerCase()}-${mode.toLowerCase()}-${Date.now()}.pdf`;
  const filePath = `${RNFS.DocumentDirectoryPath}/${filename}`;

  await RNFS.writeFile(filePath, arrayBufferToBase64(pdfBytes), 'base64');

  return {
    filePath,
    generatedAt,
    mode,
  };
}

async function readReportPdfError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const payload = (await response.json()) as { detail?: unknown; error?: unknown };
    return typeof payload.error === 'string'
      ? payload.error
      : typeof payload.detail === 'string'
        ? payload.detail
        : fallback;
  } catch {
    return fallback;
  }
}

function parseDownloadFilename(value: string | null): string | undefined {
  const match = value?.match(/filename="?([^";]+)"?/i);
  return match?.[1] ? sanitizeFilename(match[1], true) : undefined;
}

function sanitizeFilename(value: string, preserveExtension = false): string {
  const extension = preserveExtension && value.toLowerCase().endsWith('.pdf')
    ? '.pdf'
    : '';
  const base = value
    .replace(/\.pdf$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);

  return `${base || 'predicta-report'}${extension}`;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return encodeBinaryToBase64(binary);
}

function encodeBinaryToBase64(binary: string): string {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';

  for (let index = 0; index < binary.length; index += 3) {
    const first = binary.charCodeAt(index);
    const second = binary.charCodeAt(index + 1);
    const third = binary.charCodeAt(index + 2);
    const encodedFirst = first >> 2;
    const encodedSecond = ((first & 3) << 4) | (second >> 4);
    const encodedThird = Number.isNaN(second)
      ? 64
      : ((second & 15) << 2) | (third >> 6);
    const encodedFourth = Number.isNaN(third) ? 64 : third & 63;

    output +=
      alphabet.charAt(encodedFirst) +
      alphabet.charAt(encodedSecond) +
      alphabet.charAt(encodedThird) +
      alphabet.charAt(encodedFourth);
  }

  return output;
}
