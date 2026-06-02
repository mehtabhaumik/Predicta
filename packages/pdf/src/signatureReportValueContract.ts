import type {
  PDFMode,
  SignatureAnalysisModel,
} from '@pridicta/types';

export const SIGNATURE_FINAL_REPORT_REQUIRED_MODULES = [
  'Signature Input Readiness',
  'Confirmed Visible Trait Map',
  'Privacy and Session Handling',
  'Expression Reflection Opening',
  'Confidence Expression',
  'Writing Rhythm',
  'Consistency Profile',
  'Strengths and Care Points',
  'Improvement Practices',
  'Premium Refinement Plan',
  'Premium Multi-sample Comparison Readiness',
  'What This Can and Cannot Tell You',
] as const;

export const SIGNATURE_FINAL_REPORT_SECTION_ORDER = [
  'signature-input-readiness',
  'signature-expression-opening',
  'confirmed-visible-trait-map',
  'expression-signals',
  'strengths-care-practices',
  'premium-refinement-plan',
  'can-and-cannot-tell-you',
] as const;

export type SignatureReportValueContract = {
  actionPromise: string;
  bannedFailures: string[];
  evidencePromise: string;
  freeDepthPromise: string;
  openingReflection: string;
  paidDepthPromise: string;
  requiredModules: readonly string[];
  sectionOrder: readonly string[];
};

export function buildSignatureReportValueContract({
  mode,
  model,
}: {
  mode: PDFMode;
  model: SignatureAnalysisModel;
}): SignatureReportValueContract {
  const traitCount = model.observedTraits.length;
  const traitNames = model.observedTraits
    .slice(0, 5)
    .map(trait => trait.label)
    .join(', ') || 'confirmed traits pending';
  const rhythm = model.rhythm.summary.toLowerCase();
  const confidence = model.confidenceExpression.summary.toLowerCase();
  const consistency = model.consistency.summary.toLowerCase();

  return {
    actionPromise:
      'Practical signature action: choose one natural improvement, practice it gently, and keep the signature authentic instead of forcing a new identity.',
    bannedFailures: [
      'Signature report without confirmed visible traits',
      'Empty signature accepted as ready',
      'Raw signature image embedded by default',
      'Raw signature image stored in report output',
      'Hard personality certainty',
      'Future prediction from signature traits',
      'Forensic handwriting analysis claim',
      'Identity verification claim',
      'Legal, hiring, medical, or mental-health judgement',
      'Numerology, Vedic, KP, or Jaimini synthesis inside Signature report',
      'Trait claims without visible evidence',
    ],
    evidencePromise:
      'Signature technical knowledge is preserved through confirmed visible trait map, privacy/session handling, confidence expression, writing rhythm, consistency profile, strengths, care points, improvement practices, and can/cannot-tell-you boundaries.',
    freeDepthPromise:
      'Free Signature gives reflective expression guidance from confirmed visible traits: trait map, confidence expression, rhythm, consistency, strengths, care points, and one practice.',
    openingReflection:
      mode === 'PREMIUM'
        ? `This Signature report uses ${traitCount} confirmed visible trait${traitCount === 1 ? '' : 's'} (${traitNames}) to reflect current self-expression. Premium connects ${rhythm}, ${confidence}, and ${consistency} into a refinement plan while staying privacy-safe and non-forensic.`
        : `This Signature report uses ${traitCount} confirmed visible trait${traitCount === 1 ? '' : 's'} (${traitNames}) to reflect current self-expression. The main signals are ${rhythm}, ${confidence}, and ${consistency}; the useful next step is a small authentic practice, not a forced personality change.`,
    paidDepthPromise:
      'Premium Signature adds a refinement plan, before/after comparison readiness, deeper practice prompts, and stronger presentation guidance only from confirmed traits.',
    requiredModules: SIGNATURE_FINAL_REPORT_REQUIRED_MODULES,
    sectionOrder: SIGNATURE_FINAL_REPORT_SECTION_ORDER,
  };
}
