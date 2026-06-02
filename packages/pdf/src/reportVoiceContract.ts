import type { PdfSection } from './index';

export const REPORT_VOICE_SEQUENCE = [
  'technical evidence',
  'plain prediction',
  'timing / current relevance',
  'what helps',
  'what blocks',
  'what to do next',
  'confidence / caution',
] as const;

const TOOLKIT_LANGUAGE_REWRITES: Array<[RegExp, string]> = [
  [/\bstructured decision memo\b/gi, 'decision guidance'],
  [/\btechnical classroom\b/gi, 'technical appendix'],
  [/\bbefore showing the technical evidence\b/gi, 'while keeping the evidence in the appendix'],
  [/\btechnical evidence appears only\b/gi, 'technical support stays only'],
  [/\btechnical evidence block\b/gi, 'evidence appendix'],
  [/\btechnical evidence\b/gi, 'supporting evidence'],
  [/\bmethod lesson\b/gi, 'supporting appendix'],
  [/\btoolkit\b/gi, 'guided reading'],
  [/\bhow to read this report\b/gi, 'what this means for you'],
  [/\bchart-backed notes\b/gi, 'chart-backed prediction'],
  [/\bmeaningful insight\b/gi, 'specific prediction and guidance'],
  [/\bsubstantial report\b/gi, 'useful report'],
  [/\bthis chart governs\b/gi, 'this chart is affecting'],
  [/\bevidence anchor\b/gi, 'life area affected'],
  [/\bevidence appendix appears after chart preparation\b/gi, 'supporting detail appears after the main prediction'],
  [/\braw evidence replace the reading\b/gi, 'technical detail replace the prediction'],
];

const INTERNAL_CONTRACT_REWRITES: Array<[RegExp, string]> = [
  [/\bPDF composition rules\b/gi, 'report guidance'],
  [/\breport architecture\b/gi, 'report flow'],
  [/\bcalculation limits\b/gi, 'confidence limits'],
  [/\bsource map\b/gi, 'supporting map'],
  [/\bmethod boundaries\b/gi, 'school boundaries'],
  [/\bQA\b/gi, 'quality'],
];

export function rewriteReportVoiceText(value: string): string {
  return [...TOOLKIT_LANGUAGE_REWRITES, ...INTERNAL_CONTRACT_REWRITES].reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value,
  );
}

export function applyReportVoiceContractToSection(section: PdfSection): PdfSection {
  const body = rewriteReportVoiceText(section.body);
  const bullets = section.bullets
    .map(item => rewriteReportVoiceText(item))
    .filter(Boolean);

  return {
    ...section,
    body,
    bullets,
  };
}

export function hasPredictionFirstSignal(section: PdfSection): boolean {
  const text = `${section.title} ${section.body} ${section.bullets.join(' ')}`.toLowerCase();
  return /\b(prediction|predicts|verdict|timing|what is opening|what needs care|next action|practical action|best next move|current chapter|life theme|guidance)\b/.test(text);
}

export function hasSchoolingFirstRisk(section: PdfSection): boolean {
  const firstText = `${section.body} ${section.bullets.slice(0, 2).join(' ')}`.toLowerCase();
  return /\b(represents|governs|how to read|method lesson|toolkit|technical classroom|internal system|qa artifact)\b/.test(firstText);
}
