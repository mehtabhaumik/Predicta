export type EventOracleReportAlignmentFocus =
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

export type EventOracleReportAlignmentMode = 'FREE' | 'PREMIUM';

export type EventOracleReportLaneAlignment = {
  focus: EventOracleReportAlignmentFocus;
  title: string;
  eyebrow: string;
  directPromise: string;
  timingPromise: string;
  userWillLearn: string[];
  evidencePosition: 'after-answer';
  evidencePromise: string;
  freeDepth: string;
  premiumDepth: string;
  actionPromise: string;
  noToolkitRule: string;
  noClassroomRule: string;
  remedyDedupingRule: string;
};

const VEDIC_ALIGNMENT: EventOracleReportLaneAlignment = {
  actionPromise:
    'The reading closes with one consolidated direction, so remedies and actions do not repeat as filler.',
  directPromise:
    'Predicta starts with what the chart is saying about life direction, pressure, support, and timing before it asks you to study the chart proof.',
  evidencePosition: 'after-answer',
  evidencePromise:
    'D1, Moon, D9, D10, Chalit, dasha, gochar, yog, dosh, shrap, and Lal Kitab evidence is preserved after the prediction, not above it.',
  eyebrow: 'PREDICTION FIRST',
  focus: 'VEDIC',
  freeDepth:
    'Free Vedic reports give useful predictions, core timing, and safe karma/dharma guidance without becoming a long classroom.',
  noClassroomRule:
    'Do not turn this into a classroom. Say what the chart means for this user and keep definitions short.',
  noToolkitRule:
    'Do not turn this into a toolkit. Give the reading before any navigation or reading instructions.',
  premiumDepth:
    'Premium Vedic reports add sharper timing windows, contradictions, varga depth, and detailed evidence-backed guidance.',
  remedyDedupingRule:
    'One remedy/action plan owns repeated remedies; sections may reference it but must not duplicate it.',
  timingPromise:
    'Current dasha, Antardasha, transit pressure, and relevant event windows are translated into practical timing language.',
  title: 'What This Report Will Tell You',
  userWillLearn: [
    'what is opening, delaying, or asking for discipline now',
    'which life areas have the strongest support or pressure',
    'what timing should be used carefully before taking action',
  ],
};

const KP_ALIGNMENT: EventOracleReportLaneAlignment = {
  actionPromise:
    'The user gets the next practical move before the cusp and significator appendix.',
  directPromise:
    'KP gives the event answer first: likely, delayed, blocked, or needs clarity, with plain timing and trigger language.',
  evidencePosition: 'after-answer',
  evidencePromise:
    'KP cusps, sub-lords, significators, ruling planets, dasha support, and trigger windows stay in a proof appendix second.',
  eyebrow: 'KP EVENT ANSWER',
  focus: 'KP',
  freeDepth:
    'Free KP reports give the event direction, timing readiness, main promise/block, and one grounded next step.',
  noClassroomRule:
    'Do not turn KP into a classroom before answering the question. Explain only the proof that supports the answer.',
  noToolkitRule:
    'Do not turn KP into a toolkit or questionnaire in the report. The report must answer and guide.',
  premiumDepth:
    'Premium KP reports add the full cusp chain, significator hierarchy, ruling-planet checks, contradictions, and trigger windows.',
  remedyDedupingRule:
    'KP action guidance must not duplicate Vedic remedy text; it stays event-specific.',
  timingPromise:
    'Timing is expressed as readiness, trigger pattern, and window strength instead of overconfident date claims.',
  title: 'Your KP Answer Comes First',
  userWillLearn: [
    'the event direction and confidence',
    'what can trigger or delay the event',
    'which proof points support the answer if the user wants evidence',
  ],
};

const JAIMINI_ALIGNMENT: EventOracleReportLaneAlignment = {
  actionPromise:
    'The report turns destiny direction into one clear role action, not abstract philosophy.',
  directPromise:
    'Jaimini starts with the destiny chapter, soul role, visible identity, and role prediction before technical karaka proof.',
  evidencePosition: 'after-answer',
  evidencePromise:
    'Atmakaraka, Amatyakaraka, Darakaraka, Arudha, Upapada, Karakamsha, Swamsa, and Chara Dasha evidence follows the destiny reading.',
  eyebrow: 'JAIMINI DESTINY',
  focus: 'JAIMINI',
  freeDepth:
    'Free Jaimini reports give the main soul-role prediction, current destiny chapter, and practical role guidance.',
  noClassroomRule:
    'Do not turn Jaimini into a classroom or syllabus. Tell the user what the karakas are asking them to become.',
  noToolkitRule:
    'Do not turn Jaimini into a toolkit or karaka glossary before the life-role reading.',
  premiumDepth:
    'Premium Jaimini reports add role contradictions, Arudha/Upapada depth, Chara Dasha timing, and cross-chart maturity guidance.',
  remedyDedupingRule:
    'Jaimini role actions should complement the consolidated remedy plan instead of repeating it.',
  timingPromise:
    'Current Chara Dasha and role indicators are converted into destiny direction and timing emphasis.',
  title: 'Your Destiny Chapter Opens Here',
  userWillLearn: [
    'what role life is asking the user to grow into',
    'how public identity and relationships mirror the destiny path',
    'which current chapter needs attention now',
  ],
};

const NUMEROLOGY_ALIGNMENT: EventOracleReportLaneAlignment = {
  actionPromise:
    'The report turns the current cycle into a small set of practical choices instead of lucky-number filler.',
  directPromise:
    'Numerology starts with the current cycle, name rhythm, and life-path tone so the user knows what to do with the numbers.',
  evidencePosition: 'after-answer',
  evidencePromise:
    'Name number, compound/root number, birth number, destiny number, personal year/month/day, and missing/repeated patterns follow the guidance.',
  eyebrow: 'NUMBER TIMING',
  focus: 'NUMEROLOGY',
  freeDepth:
    'Free Numerology reports give the number identity, current cycle, strengths, cautions, and immediate action rhythm.',
  noClassroomRule:
    'Do not turn Numerology into a classroom or course. Say what the number rhythm is asking the user to do now.',
  noToolkitRule:
    'Do not turn Numerology into a toolkit or calculator manual before the number reading.',
  premiumDepth:
    'Premium Numerology reports add name fit, timeline depth, compatibility, refinement options, and supportive practices.',
  remedyDedupingRule:
    'Number guidance stays separate from Vedic remedies unless a synthesis report explicitly asks for it.',
  timingPromise:
    'Personal year, month, and day are translated into the best use of this cycle.',
  title: 'Your Number Cycle Leads The Reading',
  userWillLearn: [
    'how the name rhythm is projecting now',
    'what the current personal cycle supports',
    'which repeated or missing number pattern needs attention',
  ],
};

const SIGNATURE_ALIGNMENT: EventOracleReportLaneAlignment = {
  actionPromise:
    'The report gives expression practices only after confirmed visible traits, never from an empty or guessed signature.',
  directPromise:
    'Signature reports stay reflective as expression guidance only: they describe expression rhythm, confidence, consistency, and practice direction with no hard prediction.',
  evidencePosition: 'after-answer',
  evidencePromise:
    'Confirmed visible traits, confidence chips, privacy status, and safety boundaries follow the reflection.',
  eyebrow: 'REFLECTIVE EXPRESSION',
  focus: 'SIGNATURE',
  freeDepth:
    'Free Signature reports give confirmed traits, a gentle expression reading, and a safe practice focus.',
  noClassroomRule:
    'Do not turn Signature into a classroom about graphology or claim forensic truth. Keep the reading reflective and visibly evidenced.',
  noToolkitRule:
    'Do not turn Signature into a toolkit that asks the user to self-diagnose traits before the confirmed trait map.',
  premiumDepth:
    'Premium Signature reports add deeper confirmed-trait comparison, refinement planning, and practice progression.',
  remedyDedupingRule:
    'Signature practices stay expression-focused and must not repeat astrology remedies.',
  timingPromise:
    'Signature timing is not predictive; any timing language must be practice rhythm only.',
  title: 'Your Expression Guidance Stays Reflective',
  userWillLearn: [
    'what the confirmed visible traits may reflect',
    'how expression and confidence rhythm can improve',
    'what the signature report cannot and will not claim',
  ],
};

const LIFE_ATLAS_ALIGNMENT: EventOracleReportLaneAlignment = {
  actionPromise:
    'The report closes with an honest next step and a personal letter instead of technical proof overload.',
  directPromise:
    'Life Atlas starts with life path synthesis, destiny direction, current chapter, and practical timing before any evidence appendix.',
  evidencePosition: 'after-answer',
  evidencePromise:
    'Vedic, KP, Jaimini, Kundli Karma, Numerology, and optional Signature evidence appears as a late appendix only after the life story is complete.',
  eyebrow: 'LIFE DIRECTION',
  focus: 'LIFE_ATLAS',
  freeDepth:
    'Free Life Atlas gives a real soul portrait, hidden thread, current chapter, gifts, lessons, and immediate life guidance.',
  noClassroomRule:
    'Do not turn Life Atlas into a classroom about schools before the life story. Translate evidence into human life language.',
  noToolkitRule:
    'Do not turn Life Atlas into a toolkit or synthesis manual. It must feel like a personal destiny dossier.',
  premiumDepth:
    'Premium Life Atlas adds deeper life arc, contradictions, practical timing, destiny direction, and integration practices.',
  remedyDedupingRule:
    'Life Atlas may reference practices but must not duplicate the full remedy/action plan.',
  timingPromise:
    'Current chapter, dasha/cycle tone, and event readiness are translated into practical timing and destiny direction.',
  title: 'Your Life Direction Comes First',
  userWillLearn: [
    'what life pattern is loudest now',
    'what destiny direction is asking for maturity',
    'which practical timing should guide the next step',
  ],
};

function normalizeFocus(focus: EventOracleReportAlignmentFocus): EventOracleReportAlignmentFocus {
  if (
    focus === 'CAREER' ||
    focus === 'COMPATIBILITY' ||
    focus === 'DASHA' ||
    focus === 'KUNDLI' ||
    focus === 'MARRIAGE' ||
    focus === 'REMEDIES' ||
    focus === 'SADESATI' ||
    focus === 'WEALTH'
  ) {
    return 'VEDIC';
  }

  return focus;
}

export function buildEventOracleReportAlignment(
  focus: EventOracleReportAlignmentFocus,
  mode: EventOracleReportAlignmentMode,
): EventOracleReportLaneAlignment {
  const normalizedFocus = normalizeFocus(focus);
  const base =
    normalizedFocus === 'KP'
      ? KP_ALIGNMENT
      : normalizedFocus === 'JAIMINI'
        ? JAIMINI_ALIGNMENT
        : normalizedFocus === 'NUMEROLOGY'
          ? NUMEROLOGY_ALIGNMENT
          : normalizedFocus === 'SIGNATURE'
            ? SIGNATURE_ALIGNMENT
            : normalizedFocus === 'LIFE_ATLAS'
              ? LIFE_ATLAS_ALIGNMENT
              : VEDIC_ALIGNMENT;

  return {
    ...base,
    directPromise:
      mode === 'PREMIUM'
        ? `${base.directPromise} Premium adds depth, not classroom weight.`
        : base.directPromise,
    focus,
  };
}
