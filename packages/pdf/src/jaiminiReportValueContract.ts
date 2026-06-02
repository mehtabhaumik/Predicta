import type {
  JaiminiInterpretation,
  JaiminiPlan,
  KundliData,
  PDFMode,
} from '@pridicta/types';

export const JAIMINI_FINAL_REPORT_REQUIRED_MODULES = [
  'Jaimini Prediction Opening',
  'Swamsa Chart',
  'Karakamsha Chart',
  'Atmakaraka Soul Role',
  'Amatyakaraka Work Direction',
  'Darakaraka Relationship Mirror',
  'Chara Karaka Council',
  'Arudha Visible Identity',
  'Upapada Relationship Lens',
  'Rashi Drishti',
  'Current Chara Dasha Chapter',
  'Practical Jaimini Guidance',
  'Jaimini Proof Appendix',
] as const;

export const JAIMINI_FINAL_REPORT_SECTION_ORDER = [
  'jaimini-prediction-opening',
  'swamsa-karakamsha-chart-evidence',
  'atmakaraka-soul-role',
  'arudha-visible-identity',
  'amatyakaraka-work-direction',
  'darakaraka-relationship-mirror',
  'current-chara-dasha',
  'premium-karaka-and-dasha-depth',
  'practical-action',
  'proof-appendix',
] as const;

export type JaiminiReportValueContract = {
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

export function buildJaiminiReportValueContract({
  interpretation,
  kundli,
  mode,
  plan,
}: {
  interpretation: JaiminiInterpretation;
  kundli: KundliData;
  mode: PDFMode;
  plan: JaiminiPlan;
}): JaiminiReportValueContract {
  const atmakaraka = plan.atmakaraka;
  const amatyakaraka = plan.amatyakaraka;
  const currentChapter = plan.currentCharaDasha;
  const arudha = plan.arudhaLagna.padaSign;
  const soulSignal = atmakaraka
    ? `${atmakaraka.planet} Atmakaraka in ${atmakaraka.sign}`
    : 'Atmakaraka pending';
  const workSignal = amatyakaraka
    ? `${amatyakaraka.planet} Amatyakaraka in ${amatyakaraka.sign}`
    : 'Amatyakaraka pending';
  const chapterSignal = currentChapter
    ? `${currentChapter.sign} Chara Dasha`
    : 'current Chara Dasha pending';

  return {
    actionPromise:
      'The report must end with one practical Jaimini action: a role to strengthen, a public signal to clarify, a relationship mirror to handle maturely, and a current chapter response.',
    bannedFailures: [
      'Jaimini report as renamed Vedic report',
      'Jaimini report as KP event report',
      'D1 or D9 Parashari chart as the Jaimini chart surface',
      'Atmakaraka as a vague soul label without prediction',
      'Chara Dasha as fatalistic timing',
      'Karaka list without user-facing implication',
      'Technical proof before destiny guidance',
    ],
    evidencePromise:
      'Jaimini technical knowledge is preserved through Swamsa, Karakamsha, Atmakaraka, Amatyakaraka, Darakaraka, Chara Karakas, Arudha, Upapada, Rashi Drishti, Chara Dasha, and proof appendix.',
    freeDepthPromise:
      'Free Jaimini gives a real destiny-role reading: soul role, visible identity, work direction, relationship mirror, current chapter, and one practical action.',
    openingPrediction:
      mode === 'PREMIUM'
        ? `${kundli.birthDetails.name}'s Jaimini report reads destiny role through ${soulSignal}, public signal through ${arudha ?? 'Arudha pending'}, work direction through ${workSignal}, and timing through ${chapterSignal}. Premium must turn these into life-role prediction, contradiction handling, timing chapter guidance, and practical action.`
        : `${kundli.birthDetails.name}'s Jaimini report opens with destiny-role prediction. ${interpretation.summary} The clearest signals are ${soulSignal}, ${arudha ? `${arudha} Arudha` : 'Arudha pending'}, and ${chapterSignal}; the reading should tell what role is maturing and what action makes that role visible now.`,
    paidDepthPromise:
      'Premium Jaimini adds the full Chara Karaka council, Arudha/Upapada depth, Swamsa/Karakamsha evidence, Rashi Drishti support, current and upcoming Chara Dasha chapters, contradiction handling, and practical destiny guidance.',
    requiredModules: JAIMINI_FINAL_REPORT_REQUIRED_MODULES,
    sectionOrder: JAIMINI_FINAL_REPORT_SECTION_ORDER,
    timingPromise:
      currentChapter
        ? `Timing is anchored in the current ${currentChapter.sign} Chara Dasha chapter from age ${currentChapter.startAge} to ${currentChapter.endAge}; the chapter shows what life is making louder, not a fixed fate cage.`
        : 'Timing stays broad until current Chara Dasha evidence is ready; Predicta must not invent chapter certainty.',
  };
}
