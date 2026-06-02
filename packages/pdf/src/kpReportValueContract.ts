import type {
  ChalitBhavKpFoundation,
  KundliData,
  PDFMode,
} from '@pridicta/types';

export const KP_FINAL_REPORT_REQUIRED_MODULES = [
  'KP Prediction Opening',
  'KP Event Support Chart',
  'Verdict',
  'Promise',
  'Block',
  'Timing Readiness',
  'Relevant Houses',
  'Cusps and Lord Chains',
  'Significator Hierarchy',
  'Ruling Planets',
  'Dasha Support',
  'Practical Action',
  'Proof Appendix',
] as const;

export const KP_FINAL_REPORT_SECTION_ORDER = [
  'kp-prediction-opening',
  'kp-event-support-chart',
  'verdict-promise-block',
  'timing-readiness',
  'life-area-predictions',
  'practical-action',
  'premium-proof-depth',
  'proof-appendix',
] as const;

export type KpReportValueContract = {
  actionPromise: string;
  bannedFailures: string[];
  evidencePromise: string;
  freeDepthPromise: string;
  openingPrediction: string;
  paidDepthPromise: string;
  requiredModules: readonly string[];
  sectionOrder: readonly string[];
  timingPromise: string;
};

export function buildKpReportValueContract({
  activeAreas,
  foundation,
  kundli,
  mode,
  strongestSignals,
}: {
  activeAreas: string[];
  foundation: ChalitBhavKpFoundation;
  kundli: KundliData;
  mode: PDFMode;
  strongestSignals: string;
}): KpReportValueContract {
  const kp = foundation.kp;
  const judgement = kp.eventJudgement;
  const areas = activeAreas.length
    ? activeAreas.slice(0, 4).join(', ')
    : 'career, gains, daily work, and practical decisions';
  const currentDasha = `${kundli.dasha.current.mahadasha}/${kundli.dasha.current.antardasha}`;

  return {
    actionPromise:
      'The report ends with direct action: where to move, where to wait, what to verify, and what not to fear.',
    bannedFailures: [
      'KP report as toolkit',
      'KP report as astrology lesson',
      'Repeated demand for a user question',
      'D1 or D9 Parashari chart in KP report',
      'Vedic personality reading inside KP',
      'Technical proof before practical answer',
      'Timing certainty without KP support',
    ],
    evidencePromise:
      'KP technical knowledge is preserved through the KP chart, relevant houses, cusps and lord chains, significators, ruling planets, dasha support, timing readiness, and proof appendix.',
    freeDepthPromise:
      'Free KP gives the main event/outcome prediction, visible support, visible block, timing mood, active life areas, and a practical next step.',
    openingPrediction:
      mode === 'PREMIUM'
        ? `${kundli.birthDetails.name}'s KP report reads the strongest visible outcomes through ${areas}. The current ${currentDasha} period is treated as timing background, while ${strongestSignals} show which planets are carrying the result. The premium reading must say what is likely to move, what is delayed or conditional, what proof supports it, and what action protects the user.`
        : `${kundli.birthDetails.name}'s KP report is not a lesson in cusps. It reads the strongest visible outcomes through ${areas}. The current message is ${judgement.verdictLabel.toLowerCase()}: move where support is visible, slow down where timing is unclear, and do not accept fear-based certainty.`,
    paidDepthPromise:
      'Premium KP adds complete verdict depth, support/block contradiction handling, cusp and lord-chain proof, significator hierarchy, ruling-planet timing checks, dasha/transit support, and practical decision guidance.',
    requiredModules: KP_FINAL_REPORT_REQUIRED_MODULES,
    sectionOrder: KP_FINAL_REPORT_SECTION_ORDER,
    timingPromise:
      `Timing is anchored in KP timing readiness (${judgement.timingReadinessState}) and the current ${currentDasha} period. Strong timing requires repeated support from event houses, significators, ruling planets, and real-world readiness.`,
  };
}
