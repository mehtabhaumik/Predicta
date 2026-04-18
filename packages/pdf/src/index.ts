import type { KundliData, PDFMode } from '@pridicta/types';

export type PdfSection = {
  title: string;
  body: string;
};

export type PdfComposition = {
  footer: string;
  mode: PDFMode;
  sections: PdfSection[];
  watermark: string;
};

export function composeReportSections({
  kundli,
  mode,
}: {
  kundli?: KundliData;
  mode: PDFMode;
}): PdfComposition {
  const name = kundli?.birthDetails.name ?? 'Pridicta seeker';
  const depth =
    mode === 'PREMIUM'
      ? 'deeper divisional, dasha, yoga, and guidance coverage'
      : 'focused D1, D9, D10, dasha, and guidance coverage';

  return {
    footer: 'Designed & Engineered by Bhaumik Mehta | Powered by AI | © 2026',
    mode,
    sections: [
      {
        body: `${name}'s report uses ${depth}.`,
        title: 'Report Depth',
      },
      {
        body: 'Every Pridicta PDF keeps the same premium visual quality. Paid access changes depth, not dignity.',
        title: 'Design Promise',
      },
    ],
    watermark: 'PRIDICTA',
  };
}
