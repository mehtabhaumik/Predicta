import type { PDFMode } from '@pridicta/types';

import {
  buildCompetitorReportArchitectureContract,
  type CompetitorReportArchitectureContract,
} from './competitorReportContract';

export type ReportArchitectureFocus =
  | 'CAREER'
  | 'COMPATIBILITY'
  | 'DASHA'
  | 'JAIMINI'
  | 'KP'
  | 'KUNDLI'
  | 'LIFE_ATLAS'
  | 'MARRIAGE'
  | 'NUMEROLOGY'
  | 'REMEDIES'
  | 'SADESATI'
  | 'SIGNATURE'
  | 'VEDIC'
  | 'WEALTH';

export type ReportArchitectureStageId =
  | 'personal-opening'
  | 'method-evidence'
  | 'prediction-chapters'
  | 'timing-relevance'
  | 'action-plan'
  | 'appendix-proof';

export type ReportArchitectureStage = {
  id: ReportArchitectureStageId;
  label: string;
  purpose: string;
  required: boolean;
};

export type ReportDepthModeContract = {
  mode: PDFMode;
  promise: string;
  predictionMinimum: string;
  evidenceMinimum: string;
  timingMinimum: string;
  actionMinimum: string;
  proofMinimum: string;
};

export type ReportDepthContract = {
  active: ReportDepthModeContract;
  free: ReportDepthModeContract;
  paid: ReportDepthModeContract;
  laneDepthPromise: string;
  upgradeBoundary: string;
  bannedDepthFailures: string[];
};

export type PdfReportArchitecture = {
  competitorResponseContract: CompetitorReportArchitectureContract;
  depthContract: ReportDepthContract;
  focus: ReportArchitectureFocus;
  mode: PDFMode;
  reportPromise: string;
  schoolBoundary: string;
  stages: ReportArchitectureStage[];
};

export function toFinalReportArchitectureFocus(
  reportFocus: ReportArchitectureFocus | string,
): ReportArchitectureFocus {
  if (reportFocus === 'NADI') {
    return 'JAIMINI';
  }

  if (isReportArchitectureFocus(reportFocus)) {
    return reportFocus;
  }

  return 'KUNDLI';
}

const BASE_STAGES: ReportArchitectureStage[] = [
  {
    id: 'personal-opening',
    label: 'Personal opening',
    purpose: 'Start with the subject, report promise, and the clearest personal prediction.',
    required: true,
  },
  {
    id: 'prediction-chapters',
    label: 'Prediction chapters',
    purpose: 'Translate the evidence into direct life prediction and guidance.',
    required: true,
  },
  {
    id: 'timing-relevance',
    label: 'Timing or current relevance',
    purpose: 'Explain what is active now, what is opening, and what needs patience.',
    required: true,
  },
  {
    id: 'action-plan',
    label: 'Action plan',
    purpose: 'End the main reading with practical next steps, remedies, or behavior guidance.',
    required: true,
  },
  {
    id: 'method-evidence',
    label: 'Method-specific evidence',
    purpose: 'Show the school-specific calculations that support the reading without mixing schools.',
    required: true,
  },
  {
    id: 'appendix-proof',
    label: 'Appendix and proof',
    purpose: 'Keep deeper tables, proof rows, boundaries, and calculation details after the reading.',
    required: true,
  },
];

export function buildReportArchitecture({
  mode,
  reportFocus,
}: {
  mode: PDFMode;
  reportFocus: ReportArchitectureFocus;
}): PdfReportArchitecture {
  const config = getReportArchitectureConfig(reportFocus, mode);

  return {
    competitorResponseContract: buildCompetitorReportArchitectureContract({
      mode,
      reportFocus,
    }),
    depthContract: buildReportDepthContract(reportFocus, mode),
    focus: reportFocus,
    mode,
    reportPromise: config.reportPromise,
    schoolBoundary: config.schoolBoundary,
    stages: BASE_STAGES.map(stage => ({
      ...stage,
      purpose: config.stagePurpose[stage.id] ?? stage.purpose,
    })),
  };
}

export function buildReportDepthContract(
  reportFocus: ReportArchitectureFocus,
  mode: PDFMode,
): ReportDepthContract {
  const lane = getLaneDepthConfig(reportFocus);
  const free = buildFreeDepthContract(lane);
  const paid = buildPaidDepthContract(lane);

  return {
    active: mode === 'PREMIUM' ? paid : free,
    free,
    paid,
    laneDepthPromise: lane.depthPromise,
    upgradeBoundary:
      'Paid reports add diagnosis, contradictions, timing windows, proof depth, and practical guidance. Paid reports must not merely add pages, repeated definitions, or internal method notes.',
    bannedDepthFailures: [
      'Free report as hollow teaser',
      'Paid report as page-count padding',
      'Technical evidence without plain prediction',
      'More tables without stronger guidance',
      'Repeated remedies or repeated boundaries',
      'Schooling the user instead of answering the user',
    ],
  };
}

function getReportArchitectureConfig(
  reportFocus: ReportArchitectureFocus,
  mode: PDFMode,
): {
  reportPromise: string;
  schoolBoundary: string;
  stagePurpose: Partial<Record<ReportArchitectureStageId, string>>;
} {
  const paidDepth =
    mode === 'PREMIUM'
      ? 'Premium adds contradictions, timing, deeper proof, and practical guidance.'
      : 'Free gives useful prediction and key evidence without becoming a teaser.';

  switch (reportFocus) {
    case 'KP':
      return {
        reportPromise: `KP answers event readiness and life outcomes through question, verdict, timing, support, block, and next action. ${paidDepth}`,
        schoolBoundary: 'KP stays cusp, sub-lord, significator, ruling-planet, dasha, and transit oriented. It must not become a Parashari D1/D9 personality report.',
        stagePurpose: {
          'method-evidence': 'Show relevant houses, cusps, sub-lords, significators, ruling planets, and timing support only as proof for the answer.',
          'prediction-chapters': 'Give the plain verdict first: likely, delayed, blocked, or needs clarity, then explain support and block.',
          'timing-relevance': 'Name timing readiness and watch windows without pretending certainty.',
          'action-plan': 'Tell the user what to do next around the event, risk, and decision timing.',
        },
      };
    case 'JAIMINI':
      return {
        reportPromise: `Jaimini reads destiny role, soul direction, visible identity, relationship mirror, and current life chapter. ${paidDepth}`,
        schoolBoundary: 'Jaimini stays Atmakaraka, Chara Karaka, Karakamsha, Swamsa, Arudha, Upapada, Rashi Drishti, and Chara Dasha oriented.',
        stagePurpose: {
          'method-evidence': 'Show Jaimini evidence as the destiny-role proof layer, not as KP or Parashari logic.',
          'prediction-chapters': 'Translate Jaimini signals into role, calling, public image, relationship, and life-direction guidance.',
          'timing-relevance': 'Use Chara Dasha and active chapters where available.',
        },
      };
    case 'NUMEROLOGY':
      return {
        reportPromise: `Numerology reads number identity, name rhythm, birth code, current cycle, repeated/missing numbers, and practical focus. ${paidDepth}`,
        schoolBoundary: 'Numerology stays number-led and does not borrow Kundli, KP, Jaimini, or Signature claims unless the user chooses Life Atlas.',
        stagePurpose: {
          'method-evidence': 'Show name number, birth number, destiny/life path, personal cycle, and number grid as number evidence.',
          'prediction-chapters': 'Translate number patterns into identity, strengths, cautions, work, relationship, money, and self-expression guidance.',
          'timing-relevance': 'Use personal year, month, and day as cycle guidance.',
        },
      };
    case 'SIGNATURE':
      return {
        reportPromise: `Signature reads confirmed visible expression traits as reflective guidance, not prediction or forensic proof. ${paidDepth}`,
        schoolBoundary: 'Signature stays limited to confirmed visible traits and must not make identity, legal, medical, hiring, destiny, or personality-certainty claims.',
        stagePurpose: {
          'method-evidence': 'Show only confirmed traits with confidence labels and no invented observations.',
          'prediction-chapters': 'Translate visible traits into reflective self-expression guidance, not fate prediction.',
          'action-plan': 'Give practical signature and presentation refinement suggestions.',
        },
      };
    case 'LIFE_ATLAS':
      return {
        reportPromise: `Life Atlas is the flagship synthesis: soul portrait, life arc, destiny pattern, current chapter, hidden thread, next steps, and closing letter. ${paidDepth}`,
        schoolBoundary: 'Life Atlas is the only approved synthesis lane. It may use Vedic, KP, Jaimini, Numerology, and optional Signature evidence internally while staying non-technical in the main reading.',
        stagePurpose: {
          'personal-opening': 'Open with a personal soul portrait and life mirror, not a technical method note.',
          'method-evidence': 'Keep synthesis evidence quiet in the main reading and detailed in the optional appendix.',
          'prediction-chapters': 'Describe life journey, purpose, gifts, lessons, destiny pattern, and hidden thread in human language.',
          'timing-relevance': 'Explain current chapter and next 12-24 months without overclaiming certainty.',
          'action-plan': 'Close with practices, integration, and a personal letter.',
        },
      };
    case 'CAREER':
    case 'COMPATIBILITY':
    case 'DASHA':
    case 'KUNDLI':
    case 'MARRIAGE':
    case 'REMEDIES':
    case 'SADESATI':
    case 'VEDIC':
    case 'WEALTH':
    default:
      return {
        reportPromise: `Vedic reports read Kundli evidence, charts, Panchang, dasha, vargas, houses, yogas, timing, and remedies as practical life guidance. ${paidDepth}`,
        schoolBoundary: 'Vedic reports stay Parashari/Vedic and do not silently mix KP, Jaimini, Numerology, or Signature methods.',
        stagePurpose: {
          'method-evidence': 'Show D1, Moon, D9, D10, Chalit, Panchang, houses, planets, dasha, varga, and classical tables where relevant.',
          'prediction-chapters': 'Turn chart evidence into direct life-area predictions across self, career, relationships, wealth, timing, and remedies.',
          'timing-relevance': 'Use Mahadasha, Antardasha, transit, Sade Sati, yearly, or current-cycle signals as available.',
          'action-plan': 'Use one consolidated remedy/action plan instead of repeated remedies.',
        },
      };
  }
}

function buildFreeDepthContract(lane: ReturnType<typeof getLaneDepthConfig>): ReportDepthModeContract {
  return {
    mode: 'FREE',
    promise: `Free gives a specific useful ${lane.userFacingName} prediction with the key evidence needed to trust it.`,
    predictionMinimum: lane.freePredictionMinimum,
    evidenceMinimum: `Show the key ${lane.evidenceName} signals only; enough to ground the reading without turning it into a lesson.`,
    timingMinimum: lane.freeTimingMinimum,
    actionMinimum: 'Give at least one clear next step, support habit, or watch-out that a normal user can apply.',
    proofMinimum: 'Keep proof short, readable, and after the prediction; free proof must support value, not replace it.',
  };
}

function buildPaidDepthContract(lane: ReturnType<typeof getLaneDepthConfig>): ReportDepthModeContract {
  return {
    mode: 'PREMIUM',
    promise: `Paid gives the complete ${lane.userFacingName} diagnosis: deeper prediction, contradictions, timing windows, proof depth, and practical guidance.`,
    predictionMinimum: lane.paidPredictionMinimum,
    evidenceMinimum: `Show deeper ${lane.evidenceName} proof, including supporting and conflicting signals, without making the main reading technical-heavy.`,
    timingMinimum: lane.paidTimingMinimum,
    actionMinimum: 'Give a practical plan that separates what to do now, what to prepare, what to avoid, and what to revisit later.',
    proofMinimum: 'Move extended calculations, tables, boundaries, and method proof into appendix/proof pages after the main reading.',
  };
}

function getLaneDepthConfig(reportFocus: ReportArchitectureFocus): {
  depthPromise: string;
  evidenceName: string;
  freePredictionMinimum: string;
  freeTimingMinimum: string;
  paidPredictionMinimum: string;
  paidTimingMinimum: string;
  userFacingName: string;
} {
  switch (reportFocus) {
    case 'KP':
      return {
        depthPromise: 'KP depth is measured by answer clarity, event proof, timing readiness, and decision guidance.',
        evidenceName: 'KP cusp, sub-lord, significator, ruling-planet, dasha, and transit',
        freePredictionMinimum: 'Give the event or life-outcome verdict in plain language, then name the main support and main block.',
        freeTimingMinimum: 'Give timing readiness or a watch period only when the KP evidence supports it; otherwise say what is still unclear.',
        paidPredictionMinimum: 'Give verdict, promise, block, contradiction, timing readiness, and decision guidance with the proof chain translated for a common user.',
        paidTimingMinimum: 'Give supported watch windows, dasha/transit triggers, confidence, and the condition that could change the outcome.',
        userFacingName: 'KP event answer',
      };
    case 'JAIMINI':
      return {
        depthPromise: 'Jaimini depth is measured by destiny role, soul direction, public image, relationship mirror, and active chapter guidance.',
        evidenceName: 'Jaimini karaka, Karakamsha, Swamsa, Arudha, Upapada, Rashi Drishti, and Chara Dasha',
        freePredictionMinimum: 'Give the clearest destiny-role or life-direction prediction and one practical way to live it now.',
        freeTimingMinimum: 'Name the active life chapter when available; otherwise keep timing honest and chapter-based.',
        paidPredictionMinimum: 'Connect role, calling, public image, partnership mirror, contradictions, and next maturation path.',
        paidTimingMinimum: 'Use Chara Dasha or active chapter evidence to show what is opening, delayed, or asking for maturity.',
        userFacingName: 'Jaimini destiny reading',
      };
    case 'NUMEROLOGY':
      return {
        depthPromise: 'Numerology depth is measured by number identity, name rhythm, current cycle, pattern tension, and usable alignment guidance.',
        evidenceName: 'name number, birth number, destiny/life path, cycle, and number-grid',
        freePredictionMinimum: 'Give the core number identity, current cycle meaning, strongest gift, strongest caution, and next action.',
        freeTimingMinimum: 'Use personal year, month, or day as practical cycle guidance without guarantees.',
        paidPredictionMinimum: 'Give full name rhythm, compound/root reading, number-grid pattern, compatibility or name-refinement insight where available, and detailed cycle guidance.',
        paidTimingMinimum: 'Give a fuller personal-year/month timeline with support, caution, and action themes.',
        userFacingName: 'Numerology number identity',
      };
    case 'SIGNATURE':
      return {
        depthPromise: 'Signature depth is measured by confirmed visible traits, confidence labels, self-expression guidance, and safe reflection.',
        evidenceName: 'confirmed visible signature-trait',
        freePredictionMinimum: 'Give reflective self-expression insight only from confirmed visible traits, never from an empty or unconfirmed sample.',
        freeTimingMinimum: 'Do not invent timing; connect the traits to current presentation and one practical refinement.',
        paidPredictionMinimum: 'Give deeper trait synthesis, confidence labels, comparison or refinement plan when available, and clear limits.',
        paidTimingMinimum: 'Use before/after or multi-sample comparison only when real samples exist; otherwise avoid timing claims.',
        userFacingName: 'Signature expression',
      };
    case 'LIFE_ATLAS':
      return {
        depthPromise: 'Life Atlas depth is measured by emotional specificity, life arc, hidden thread, current chapter, and practical integration.',
        evidenceName: 'synthesis',
        freePredictionMinimum: 'Give a real soul portrait, life arc summary, hidden thread, current chapter, gifts, lessons, and next step.',
        freeTimingMinimum: 'Give current chapter guidance and a near-term focus without overclaiming certainty.',
        paidPredictionMinimum: 'Give a deeper soul portrait, full life journey, destiny pattern, contradictions, love/work/money/purpose guidance, integration practices, and closing letter.',
        paidTimingMinimum: 'Give next 12-24 month chapter guidance with support, friction, and preparation themes.',
        userFacingName: 'Life Atlas',
      };
    case 'CAREER':
    case 'COMPATIBILITY':
    case 'DASHA':
    case 'KUNDLI':
    case 'MARRIAGE':
    case 'REMEDIES':
    case 'SADESATI':
    case 'VEDIC':
    case 'WEALTH':
    default:
      return {
        depthPromise: 'Vedic depth is measured by chart-backed prediction, timing, contradiction handling, and one consolidated action plan.',
        evidenceName: 'Kundli, chart, house, planet, dasha, varga, yoga, Panchang, and classical-table',
        freePredictionMinimum: 'Give direct chart-backed prediction for the selected focus, key strengths, key blocks, and one useful next step.',
        freeTimingMinimum: 'Name the active dasha, transit, Sade Sati, yearly, or current signal when available; otherwise keep timing careful.',
        paidPredictionMinimum: 'Give full chart-backed diagnosis, contradictions, timing windows, varga/house evidence, Mahadasha depth, and practical guidance.',
        paidTimingMinimum: 'Connect Mahadasha, Antardasha, transits, vargas, and watch windows with confidence/caution.',
        userFacingName: 'Vedic Kundli',
      };
  }
}

function isReportArchitectureFocus(value: string): value is ReportArchitectureFocus {
  return [
    'CAREER',
    'COMPATIBILITY',
    'DASHA',
    'JAIMINI',
    'KP',
    'KUNDLI',
    'LIFE_ATLAS',
    'MARRIAGE',
    'NUMEROLOGY',
    'REMEDIES',
    'SADESATI',
    'SIGNATURE',
    'VEDIC',
    'WEALTH',
  ].includes(value);
}
