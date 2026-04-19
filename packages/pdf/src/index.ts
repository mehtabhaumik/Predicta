import type {
  AppLocale,
  KundliData,
  PDFMode,
  ReportProductType,
  ReportSectionKey,
} from '@pridicta/types';
import { DEFAULT_LOCALE, getPdfLanguageLabel } from '@pridicta/config';
import { getReportProduct } from './reportStudio';

export type PdfSection = {
  title: string;
  body: string;
};

export type PdfComposition = {
  footer: string;
  language: AppLocale;
  languageLabel: string;
  mode: PDFMode;
  sections: PdfSection[];
  watermark: string;
};

export function composeReportSections({
  kundli,
  language = DEFAULT_LOCALE,
  mode,
  reportType = mode === 'PREMIUM'
    ? 'PREMIUM_KUNDLI_REPORT'
    : 'FREE_KUNDLI_SUMMARY',
}: {
  kundli?: KundliData;
  language?: AppLocale;
  mode: PDFMode;
  reportType?: ReportProductType;
}): PdfComposition {
  const name = kundli?.birthDetails.name ?? 'Predicta seeker';
  const reportProduct = getReportProduct(reportType);
  const depth =
    reportProduct.depth === 'DETAILED'
      ? 'handbook-style chart, dasha, timeline, and guidance coverage'
      : mode === 'PREMIUM'
      ? 'deeper divisional, dasha, yoga, and guidance coverage'
      : 'focused D1, D9, D10, dasha, and guidance coverage';

  return {
    footer: 'Designed & Engineered by Bhaumik Mehta | Powered by AI | © 2026',
    language,
    languageLabel: getPdfLanguageLabel(language),
    mode,
    sections: [
      {
        body: `${name}'s ${reportProduct.title.toLowerCase()} uses ${depth}. Language preference: ${getPdfLanguageLabel(language)}.`,
        title: reportProduct.title,
      },
      ...reportProduct.includedSections.map(section =>
        buildSection(section, name, mode),
      ),
      {
        body: 'Every Predicta PDF keeps the same premium visual quality. Paid access changes depth, not dignity.',
        title: 'Design Promise',
      },
    ],
    watermark: 'PREDICTA',
  };
}

function buildSection(
  key: ReportSectionKey,
  name: string,
  mode: PDFMode,
): PdfSection {
  const premiumNote =
    mode === 'PREMIUM'
      ? 'This section expands with deeper chart cross-checks and practical synthesis.'
      : 'The free version keeps this concise while preserving the same premium presentation.';

  switch (key) {
    case 'birth_summary':
      return {
        body: `${name}'s birth profile is introduced with resolved place, chart identity, and calculation metadata.`,
        title: 'Birth Summary',
      };
    case 'core_charts':
      return {
        body: `D1, D9, and D10 remain the foundation for the reading. ${premiumNote}`,
        title: 'Core Charts',
      };
    case 'planetary_depth':
      return {
        body: 'Planetary dignity, house emphasis, nakshatra tone, and retrograde conditions are arranged for a calmer reading.',
        title: 'Planetary Depth',
      };
    case 'dasha':
      return {
        body: `Current dasha timing frames the report so guidance is not detached from the active life period. ${premiumNote}`,
        title: 'Dasha Timing',
      };
    case 'ashtakavarga':
      return {
        body: 'Ashtakavarga strength is summarized through strongest and weakest houses to keep effort practical.',
        title: 'Ashtakavarga Strength',
      };
    case 'yogas':
      return {
        body: 'Yogas are explained in plain language with care around strength and real-world expression.',
        title: 'Yogas',
      };
    case 'predictions':
      return {
        body: 'Predictions are written as reflective guidance, not guarantees, with emphasis on timing and action.',
        title: 'Guidance Windows',
      };
    case 'remedies':
      return {
        body: 'Remedies stay simple, respectful, and practical rather than fear-based or excessive.',
        title: 'Guidance / Remedies',
      };
    case 'timeline':
      return {
        body: 'Life events are mapped against dasha patterns to reveal repeating themes and turning points.',
        title: 'Life Timeline',
      };
    case 'annual_guidance':
      return {
        body: 'A 12-month view organizes focus areas, decision windows, and grounding practices.',
        title: 'Annual Guidance',
      };
    case 'compatibility':
      return {
        body: 'Compatibility report structure is prepared for future matching flows.',
        title: 'Compatibility',
      };
  }
}

export * from './reportStudio';
