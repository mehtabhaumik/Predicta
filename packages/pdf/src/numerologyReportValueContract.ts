import type {
  KundliData,
  NumerologyFoundationProfile,
  PDFMode,
} from '@pridicta/types';

export const NUMEROLOGY_FINAL_REPORT_REQUIRED_MODULES = [
  'Numerology Prediction Opening',
  'Personal Number Mandala',
  'Name Rhythm',
  'Name Energy Scanner',
  'Birth Code',
  'Destiny Direction',
  'Current Cycle Action Plan',
  'Missing / Repeated Number Grid',
  'Strengths and Cautions',
  'Work Relationship Money Self-expression Guidance',
  'Name Fit Score',
  'Name Refinement',
  'Compatibility Lens',
  'Personal Year Timeline',
  'Supportive Toolkit',
  'Number Calculation Appendix',
] as const;

export const NUMEROLOGY_FINAL_REPORT_SECTION_ORDER = [
  'numerology-prediction-opening',
  'personal-number-mandala',
  'name-rhythm-energy-scanner',
  'birth-code-destiny-direction',
  'current-cycle-action-plan',
  'missing-repeated-number-grid',
  'strengths-cautions-life-areas',
  'premium-name-fit-refinement',
  'premium-compatibility-supportive-rhythm',
  'premium-personal-year-timeline',
  'calculation-appendix',
] as const;

export type NumerologyReportValueContract = {
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

export function buildNumerologyReportValueContract({
  kundli,
  mode,
  profile,
}: {
  kundli: KundliData;
  mode: PDFMode;
  profile: NumerologyFoundationProfile;
}): NumerologyReportValueContract {
  const dashboard = profile.identityDashboard;
  const nameRoot = profile.nameNumber.root;
  const birthRoot = profile.birthNumber.root;
  const destinyRoot = profile.destinyNumber.root;
  const yearRoot = profile.personalYear.root;
  const missing = dashboard.missingNumbers.join(', ') || 'none';
  const repeated = dashboard.repeatedNumbers.join(', ') || 'none';
  const strongestNow = dashboard.currentCycleLeanInto.toLowerCase();
  const avoidNow = dashboard.currentCycleAvoid.toLowerCase();

  return {
    actionPromise:
      `Practical number-led action: use ${strongestNow}, avoid ${avoidNow}, strengthen repeated patterns without ego, and practice missing numbers calmly.`,
    bannedFailures: [
      'Numerology report as renamed Kundli report',
      'D1 or D9 Parashari chart in Numerology report',
      'Vedic graha table in Numerology report',
      'Sunrise chart note in Numerology report',
      'Number definitions without user-facing guidance',
      'Fear-based missing number language',
      'Name change pressure or guaranteed success claim',
      'Compatibility certainty without another confirmed input',
      'Technical calculation proof before number prediction',
    ],
    evidencePromise:
      'Numerology technical knowledge is preserved through number mandala, name rhythm, name scanner, birth code, destiny direction, current cycle, missing/repeated grid, name fit, compatibility lens, personal year timeline, supportive toolkit, and calculation appendix.',
    freeDepthPromise:
      'Free Numerology gives a real number identity reading: core numbers, current cycle, strengths, cautions, missing/repeated pattern, and one practical action.',
    openingPrediction:
      mode === 'PREMIUM'
        ? `${kundli.birthDetails.name}'s Numerology report reads name rhythm ${nameRoot}, birth code ${birthRoot}, destiny direction ${destinyRoot}, and personal year ${yearRoot}. Premium turns this into name projection, life rhythm, cycle timing, missing/repeated pattern guidance, compatibility/refinement where available, and a practical action plan.`
        : `${kundli.birthDetails.name}'s Numerology report points to this number rhythm now: ${dashboard.lifeThemeSentence} The strongest current use is ${dashboard.bestUseOfCurrentCycle}. Repeated numbers: ${repeated}. Missing numbers: ${missing}. The useful focus is what to use, what to soften, and what small action brings the number pattern into daily life.`,
    paidDepthPromise:
      'Premium Numerology adds a deeper name scanner, name fit score, name refinement, compatibility lens, supportive toolkit, full personal year timeline, and calculation proof while staying Numerology-only.',
    requiredModules: NUMEROLOGY_FINAL_REPORT_REQUIRED_MODULES,
    sectionOrder: NUMEROLOGY_FINAL_REPORT_SECTION_ORDER,
    timingPromise:
      `Timing is anchored in personal year ${profile.personalYear.root}, month ${profile.personalMonth.root}, and day ${profile.personalDay.root}; the cycle suggests how to use the period, not a fixed guarantee.`,
  };
}
