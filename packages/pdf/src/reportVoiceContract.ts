import type { PdfSection } from './index';

export const REPORT_VOICE_SEQUENCE = [
  'plain prediction',
  'timing / current relevance',
  'what helps',
  'what blocks',
  'what to do next',
  'confidence / caution',
  'supporting evidence / appendix',
] as const;

const TOOLKIT_LANGUAGE_REWRITES: Array<[RegExp, string]> = [
  [/\bstructured decision memo\b/gi, 'decision guidance'],
  [/\btechnical classroom\b/gi, 'technical appendix'],
  [/\breport as toolkit\b/gi, 'report as guided reading'],
  [/\bastrology lesson\b/gi, 'astrology guidance'],
  [/\bmethod-boundary page\b/gi, 'short school note'],
  [/\bbefore showing the technical evidence\b/gi, 'while keeping the evidence in the appendix'],
  [/\btechnical evidence appears only\b/gi, 'technical support stays only'],
  [/\btechnical evidence block\b/gi, 'evidence appendix'],
  [/\btechnical evidence\b/gi, 'supporting evidence'],
  [/\btechnical proof before user meaning\b/gi, 'supporting proof after user meaning'],
  [/\bmethod lesson\b/gi, 'supporting appendix'],
  [/\btoolkit\b/gi, 'guided reading'],
  [/\bsupportive toolkit\b/gi, 'supportive rhythm guide'],
  [/\bhow to use this report\b/gi, 'what this report is saying'],
  [/\bhow to read this report\b/gi, 'what this means for you'],
  [/\byou will learn\b/gi, 'Predicta will answer'],
  [/\buse this report as a starting point\b/gi, 'use this prediction as grounded guidance'],
  [/\bchart-backed notes\b/gi, 'chart-backed prediction'],
  [/\bmeaningful insight\b/gi, 'specific prediction and guidance'],
  [/\bsubstantial report\b/gi, 'useful report'],
  [/\bthis chart governs\b/gi, 'this chart is affecting'],
  [/\bevidence anchor\b/gi, 'life area affected'],
  [/\bevidence appendix appears after chart preparation\b/gi, 'supporting detail appears after the main prediction'],
  [/\braw evidence replace the reading\b/gi, 'technical detail replace the prediction'],
];

const INTERNAL_CONTRACT_REWRITES: Array<[RegExp, string]> = [
  [/\binternal system contract\b/gi, 'short confidence note'],
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
  return /\b(prediction|predicts|verdict|likely|delayed|opening|timing|current relevance|what this means|what is opening|what needs care|next action|practical action|best next move|current chapter|life theme|guidance|support|block|watch window|soul portrait|number identity|destiny role)\b/.test(text);
}

export function hasSchoolingFirstRisk(section: PdfSection): boolean {
  const firstText = `${section.body} ${section.bullets.slice(0, 2).join(' ')}`.toLowerCase();
  return /\b(represents|governs|you will learn|how to read|how to use this report|method lesson|toolkit|technical classroom|internal system|internal contract|qa artifact|starting point|method-boundary page|technical proof before user meaning)\b/.test(firstText);
}
