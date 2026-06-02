import type { PDFMode } from '@pridicta/types';

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

export type PdfReportArchitecture = {
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
    id: 'method-evidence',
    label: 'Method-specific evidence',
    purpose: 'Show the school-specific calculations that support the reading without mixing schools.',
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
