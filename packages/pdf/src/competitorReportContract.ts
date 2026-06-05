import type { PDFMode } from '@pridicta/types';

import type { ReportArchitectureFocus } from './reportArchitecture';

export const PREDICTA_COMPETITOR_REPORT_POSITION =
  'Predicta reports must feel like premium evidence-backed astrology intelligence: prediction-first, emotionally useful, technically grounded, calm, and never fear/fluff/per-minute-pressure.';

export const PREDICTA_COMPETITOR_REPORT_COMPETITORS = [
  'AskSoma',
  'YastroTalk',
  'Nebula',
] as const;

export const PREDICTA_COMPETITOR_REPORT_REQUIRED_QUALITIES = [
  'prediction-first opening',
  'emotional usefulness',
  'evidence-backed confidence',
  'timing/current relevance',
  'direct practical guidance',
  'free value',
  'paid depth',
  'no fear/fluff/per-minute-pressure tone',
  'no psychic/advisor confusion',
  'no method mixing',
] as const;

export const PREDICTA_COMPETITOR_REPORT_BANNED_TONE = [
  'report as toolkit',
  'report as astrology lesson',
  'internal system contract',
  'method-boundary page as main reading',
  'generic definition instead of prediction',
  'technical proof before user meaning',
  'fear-selling remedy language',
  'psychic certainty or advisor pressure',
  'per-minute astrologer pressure',
  'preview promises more than PDF delivers',
] as const;

export const PREDICTA_COMPETITOR_REPORT_MEMORY_REQUIREMENTS = [
  'Predicta answers report questions from generatedReportContext before generic AI.',
  'Predicta starts with meaning, prediction, timing, or guidance before evidence.',
  'Predicta names the active report lane and keeps school boundaries intact.',
  'Predicta explains free versus paid depth respectfully without shaming free users.',
  'Predicta uses deterministic report memory before spending AI credits when the local answer is enough.',
] as const;

export const PREDICTA_COMPETITOR_REPORT_PREVIEW_REQUIREMENTS = [
  'Report previews must say what the user will learn, not only what sections are included.',
  'Report previews must not become full report walls.',
  'Report previews must not promise a section that the generated artifact cannot explain.',
  'The selected report CTA must remain immediately visible after selection.',
] as const;

export const PREDICTA_COMPETITOR_REPORT_ARTIFACT_REQUIREMENTS = [
  'Every affected report lane must generate or verify free and paid artifacts.',
  'Extracted text audits must reject generic, overtechnical, toolkit-like, or emotionally flat output.',
  'School-boundary audits must reject Vedic/KP/Jaimini/Numerology/Signature mixing except in Life Atlas.',
  'Report memory gates must prove Predicta can answer section questions from generated report context.',
] as const;

export type CompetitorReportContractLane = {
  artifactProof: string;
  bannedMixing: string;
  freeValue: string;
  memoryAnswer: string;
  paidDepth: string;
  predictionOpening: string;
  previewPromise: string;
  schoolBoundary: string;
};

export type CompetitorReportArchitectureContract = {
  artifactRequirements: readonly string[];
  bannedTone: readonly string[];
  competitors: readonly string[];
  freePaidBoundary: string;
  lane: CompetitorReportContractLane;
  marketPosition: string;
  memoryRequirements: readonly string[];
  mode: PDFMode;
  previewRequirements: readonly string[];
  requiredQualities: readonly string[];
};

export function buildCompetitorReportArchitectureContract({
  mode,
  reportFocus,
}: {
  mode: PDFMode;
  reportFocus: ReportArchitectureFocus;
}): CompetitorReportArchitectureContract {
  const lane = buildCompetitorReportLaneContract(reportFocus);

  return {
    artifactRequirements: PREDICTA_COMPETITOR_REPORT_ARTIFACT_REQUIREMENTS,
    bannedTone: PREDICTA_COMPETITOR_REPORT_BANNED_TONE,
    competitors: PREDICTA_COMPETITOR_REPORT_COMPETITORS,
    freePaidBoundary:
      mode === 'PREMIUM'
        ? 'Premium must add deeper prediction, evidence, timing, contradictions, and practical guidance without padding pages.'
        : 'Free must deliver useful prediction, key evidence, current relevance, and one next step without hidden AI spend or hollow teaser language.',
    lane,
    marketPosition: PREDICTA_COMPETITOR_REPORT_POSITION,
    memoryRequirements: PREDICTA_COMPETITOR_REPORT_MEMORY_REQUIREMENTS,
    mode,
    previewRequirements: PREDICTA_COMPETITOR_REPORT_PREVIEW_REQUIREMENTS,
    requiredQualities: PREDICTA_COMPETITOR_REPORT_REQUIRED_QUALITIES,
  };
}

function buildCompetitorReportLaneContract(
  reportFocus: ReportArchitectureFocus,
): CompetitorReportContractLane {
  switch (reportFocus) {
    case 'KP':
      return {
        artifactProof:
          'KP artifacts must include a KP chart, verdict, promise, block, timing readiness, relevant houses, cusp/sub-lord/significator proof, and practical decision guidance.',
        bannedMixing:
          'KP reports must not render D1/D9 Parashari chart pages or become Vedic personality readings.',
        freeValue:
          'Free KP must still answer what is likely, delayed, blocked, or unclear with one support signal, one block signal, and one practical next step.',
        memoryAnswer:
          'Predicta must explain KP report sections through event verdict, promise/block, timing readiness, and cusp proof before generic chat.',
        paidDepth:
          'Paid KP adds full proof chain, contradiction handling, watch windows, ruling planets, dasha/transit support, and grounded action.',
        predictionOpening:
          'Open with the KP answer in common language before technical proof.',
        previewPromise:
          'Preview must promise the answer, timing readiness, and proof path only if the generated KP artifact carries them.',
        schoolBoundary: 'KP-only: cusps, sub-lords, significators, ruling planets, dasha support, and timing readiness.',
      };
    case 'JAIMINI':
      return {
        artifactProof:
          'Jaimini artifacts must include Swamsa/Karakamsha, Atmakaraka, Chara Karakas, Arudha/Upapada, Rashi Drishti, Chara Dasha where available, and destiny-role guidance.',
        bannedMixing:
          'Jaimini reports must not become renamed Vedic, KP, Numerology, Signature, or Nadi reports.',
        freeValue:
          'Free Jaimini must give a destiny-role prediction, visible identity signal, relationship mirror, current chapter cue, and one practical action.',
        memoryAnswer:
          'Predicta must explain Jaimini sections through soul role, destiny direction, visible identity, relationship mirror, and Chara Dasha before generic chat.',
        paidDepth:
          'Paid Jaimini adds full karaka council, Arudha/Upapada nuance, Chara Dasha timing, contradictions, and practical destiny guidance.',
        predictionOpening:
          'Open with the destiny role and current chapter before listing karakas.',
        previewPromise:
          'Preview must promise role, public signal, relationship mirror, and chapter depth only if the Jaimini artifact carries them.',
        schoolBoundary: 'Jaimini-only: Atmakaraka, Chara Karakas, Swamsa, Karakamsha, Arudha, Upapada, Rashi Drishti, and Chara Dasha.',
      };
    case 'NUMEROLOGY':
      return {
        artifactProof:
          'Numerology artifacts must include number signature, name rhythm, birth code, current cycle, missing/repeated pattern where available, and practical focus.',
        bannedMixing:
          'Numerology reports must not include Kundli charts, KP proof, Jaimini proof, or Signature traits unless the user chooses Life Atlas.',
        freeValue:
          'Free Numerology must give core number identity, current cycle meaning, strongest gift, strongest caution, and one next action.',
        memoryAnswer:
          'Predicta must explain Numerology sections through name rhythm, birth code, destiny/life path, and current cycle before generic chat.',
        paidDepth:
          'Paid Numerology adds name scanner, name fit, number-grid tension, compatibility/name-refinement where available, and cycle timeline.',
        predictionOpening:
          'Open with the number identity and current cycle, not a calculation lesson.',
        previewPromise:
          'Preview must promise number identity and timing-cycle value only if the Numerology artifact carries them.',
        schoolBoundary: 'Numerology-only: name number, birth number, destiny/life path, personal cycle, and number pattern.',
      };
    case 'SIGNATURE':
      return {
        artifactProof:
          'Signature artifacts must include confirmed visible traits, confidence labels, privacy note, safety limits, and self-expression guidance only when a real signature sample exists.',
        bannedMixing:
          'Signature reports must not generate from an empty sample or make forensic, medical, legal, hiring, fixed-personality, or destiny claims.',
        freeValue:
          'Free Signature must reflect confirmed visible self-expression traits and one practical refinement without hard prediction.',
        memoryAnswer:
          'Predicta must explain Signature sections only from confirmed traits and must say not assessed when evidence is missing.',
        paidDepth:
          'Paid Signature adds deeper trait synthesis, optional comparison/refinement plan, and privacy-safe expression guidance.',
        predictionOpening:
          'Open with reflective self-expression meaning, not forensic authority.',
        previewPromise:
          'Preview must block report promises until confirmed visible traits exist.',
        schoolBoundary: 'Signature-only: confirmed visible traits, confidence labels, privacy, and reflective expression guidance.',
      };
    case 'LIFE_ATLAS':
      return {
        artifactProof:
          'Life Atlas artifacts must include soul portrait, life arc, destiny pattern, current chapter, hidden thread, next steps, practices, and closing letter.',
        bannedMixing:
          'Life Atlas is the only synthesis lane; evidence may combine schools internally, but the main report must remain non-technical and human.',
        freeValue:
          'Free Life Atlas must feel like a real life mirror with a useful soul portrait, gifts, lessons, current chapter, and next step.',
        memoryAnswer:
          'Predicta must explain Life Atlas sections as life meaning first, then quiet evidence layers only when useful.',
        paidDepth:
          'Paid Life Atlas adds deeper life journey, contradictions, love/work/money/purpose guidance, integration practices, and a memorable closing letter.',
        predictionOpening:
          'Open with the human life mirror, not a synthesis boundary note.',
        previewPromise:
          'Preview must promise emotional and practical life value that the generated Life Atlas artifact actually delivers.',
        schoolBoundary: 'Synthesis-only: Life Atlas may use Vedic, KP, Jaimini, Numerology, and optional confirmed Signature evidence.',
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
        artifactProof:
          'Vedic artifacts must include chart-backed prediction, key evidence, timing/current relevance, contradictions where available, and one consolidated remedy/action plan.',
        bannedMixing:
          'Vedic reports must not smuggle KP, Jaimini, Numerology, or Signature methods unless the user chooses Life Atlas.',
        freeValue:
          'Free Vedic must give chart-backed prediction, key strengths, key blocks, timing cue where supported, and one next step.',
        memoryAnswer:
          'Predicta must explain Vedic report sections through prediction, chart/dasha/Kundli Karma evidence, and practical guidance before generic chat.',
        paidDepth:
          'Paid Vedic adds deeper varga, Mahadasha, Dosh, Shrap, Yog, Lal Kitab, contradictions, timing windows, and remedy detail from shared engines.',
        predictionOpening:
          'Open with direct Kundli prediction before dense tables.',
        previewPromise:
          'Preview must promise chart-backed life guidance that generated Vedic artifacts can explain.',
        schoolBoundary: 'Vedic-only: Parashari/Vedic chart, house, planet, dasha, varga, Panchang, Kundli Karma, and remedy evidence.',
      };
  }
}
