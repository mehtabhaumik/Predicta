import type {
  LifeAtlasReport,
  PDFMode,
} from '@pridicta/types';

export const LIFE_ATLAS_FINAL_REPORT_REQUIRED_MODULES = [
  'Life Atlas Flagship Opening',
  'Opening Soul Portrait',
  'Personal Snapshot',
  'Strategic Life Abstract',
  'Why You Came Here',
  'Life Journey Arc',
  'Destiny Pattern',
  'Current Life Chapter',
  'Gifts You Carry',
  'Karmic Lessons',
  'Love Work Money Purpose',
  'The Hidden Thread',
  'What Is Intended For You',
  'Next 12-24 Months',
  'Soul Practices',
  'Final Letter From Predicta',
  'Premium Relationship Mirror',
  'Premium Work Money Mission Blueprint',
  'Premium Shadow-to-Gift Map',
  'Premium Integration Plan',
  'How Predicta Built This Reading Appendix',
] as const;

export const LIFE_ATLAS_FINAL_REPORT_SECTION_ORDER = [
  'life-atlas-flagship-opening',
  'personal-snapshot',
  'opening-soul-portrait',
  'strategic-life-abstract',
  'why-you-came-here',
  'life-journey-arc',
  'destiny-pattern',
  'current-life-chapter',
  'gifts-you-carry',
  'karmic-lessons',
  'love-work-money-purpose',
  'hidden-thread',
  'what-is-intended',
  'next-12-24-months',
  'soul-practices',
  'premium-relationship-mirror',
  'premium-work-money-mission-blueprint',
  'premium-shadow-to-gift-map',
  'premium-integration-plan',
  'final-letter',
  'how-predicta-built-this-reading-appendix',
] as const;

export type LifeAtlasReportValueContract = {
  actionPromise: string;
  appendixPromise: string;
  bannedFailures: string[];
  evidencePromise: string;
  flagshipOpening: string;
  freeDepthPromise: string;
  paidDepthPromise: string;
  requiredModules: readonly string[];
  sectionOrder: readonly string[];
};

export function buildLifeAtlasReportValueContract({
  atlas,
  mode,
}: {
  atlas: LifeAtlasReport;
  mode: PDFMode;
}): LifeAtlasReportValueContract {
  const readyLayers = atlas.evidenceLayers
    .filter(layer => layer.status === 'ready')
    .map(layer => layer.label)
    .join(', ') || 'available life pattern data';

  return {
    actionPromise:
      `Practical Life Atlas action: return to the hidden thread, choose one response that matches ${atlas.currentFocus.toLowerCase()}, and make the next step small enough to repeat.`,
    appendixPromise:
      'Evidence belongs at the end as a calm appendix, so the main Life Atlas remains a personal life reading rather than a calculation dossier.',
    bannedFailures: [
      'Life Atlas as technical proof document',
      'Life Atlas as school lesson',
      'Evidence appendix before soul portrait',
      'Generic synthesis without personal life guidance',
      'Empty or orphan Life Atlas pages',
      'Akashic Records or unsupported mystical source claim',
      'Fixed fate guarantee',
      'Fear-based destiny language',
      'Signature traits invented when no confirmed signature exists',
      'School-specific report content replacing Life Atlas story',
    ],
    evidencePromise:
      `Life Atlas synthesis is powered by ${readyLayers}. The main report translates those layers into life-language: soul portrait, life arc, destiny pattern, current chapter, hidden thread, practices, and closing letter.`,
    flagshipOpening:
      mode === 'PREMIUM'
        ? `${atlas.ownerName}'s Life Atlas is the flagship synthesis: ${atlas.lifeThemeSentence} Premium deepens the hidden thread, current chapter, relationship mirror, work/money mission, shadow-to-gift pattern, and integration plan while keeping agency at the center.`
        : `${atlas.ownerName}'s Life Atlas begins with the pattern underneath the noise: ${atlas.lifeThemeSentence} The useful invitation is ${atlas.currentFocus} This report is a personal mirror for the next honest step, not a worksheet about astrology systems.`,
    freeDepthPromise:
      'Free Life Atlas gives a complete soul portrait, life journey summary, current chapter, top gifts, top lessons, hidden thread, focus-now guidance, practices, and closing letter.',
    paidDepthPromise:
      'Premium Life Atlas adds deeper life journey narrative, relationship mirror, work/money mission blueprint, shadow-to-gift map, integration plan, and a more memorable closing letter.',
    requiredModules: LIFE_ATLAS_FINAL_REPORT_REQUIRED_MODULES,
    sectionOrder: LIFE_ATLAS_FINAL_REPORT_SECTION_ORDER,
  };
}
