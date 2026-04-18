import type { PDFMode } from '../../types/astrology';
import { pdfDocument, serverTimestamp } from './dbService';

export async function savePdfMetadata({
  fileUrl,
  kundliId,
  mode,
  pdfId,
  userId,
}: {
  fileUrl: string;
  kundliId: string;
  mode: PDFMode;
  pdfId: string;
  userId: string;
}): Promise<void> {
  await pdfDocument(pdfId).set(
    {
      createdAt: serverTimestamp(),
      fileUrl,
      kundliId,
      mode,
      userId,
    },
    { merge: true },
  );
}
