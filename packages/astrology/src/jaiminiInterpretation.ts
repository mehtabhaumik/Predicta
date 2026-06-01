import type {
  JaiminiInterpretation,
  JaiminiInterpretationBlock,
  JaiminiPlan,
  KundliData,
} from '@pridicta/types';
import { composeJaiminiPlan } from './jaiminiPlan';

export type ComposeJaiminiInterpretationOptions = {
  asOfDate?: string;
  premium?: boolean;
};

export function composeJaiminiInterpretation(
  kundli?: KundliData,
  options: ComposeJaiminiInterpretationOptions = {},
): JaiminiInterpretation {
  const plan = composeJaiminiPlan(kundli, { asOfDate: options.asOfDate });
  const blocks = [
    buildSoulPlanetReading(plan),
    buildCareerDharmaReading(plan),
    buildRelationshipMirrorReading(plan),
    buildVisibleIdentityReading(plan),
    buildCurrentDestinyChapter(plan),
    buildFocusNowReading(plan),
    buildPremiumDeepening(plan),
    buildTechnicalEvidenceBlock(plan),
  ];
  const freeBlocks = blocks.filter(block => !block.premiumOnly && block.id !== 'technical-evidence');
  const premiumBlocks = blocks.filter(block => block.id !== 'technical-evidence');

  return {
    blocks,
    calculationStatus: plan.calculationStatus,
    freeBlocks,
    guardrails: [
      'Start with prediction and guidance before technical evidence.',
      'Do not teach Jaimini as a classroom in the main reading.',
      'Do not guarantee fate, marriage, money, career, health, legal, or death outcomes.',
      'Use only calculated Jaimini evidence supplied by composeJaiminiPlan.',
      'Keep technical evidence in detail drawers, proof sections, or appendices.',
    ],
    premiumBlocks,
    premiumSummary: buildPremiumSummary(plan),
    summary: buildSummary(plan),
    technicalEvidence: buildTechnicalEvidence(plan),
  };
}

function buildSoulPlanetReading(plan: JaiminiPlan): JaiminiInterpretationBlock {
  const ak = plan.atmakaraka;

  if (!ak) {
    return pendingBlock(
      'soul-planet-reading',
      'Soul Planet Reading',
      'Your deeper role is waiting for verified karaka evidence.',
      'Create or select a Kundli so Predicta can calculate the Atmakaraka before giving soul-role guidance.',
      'Do not accept a vague soul-purpose label until the Atmakaraka is calculated.',
      plan.evidenceWarnings,
    );
  }

  return {
    confidence: confidenceFor(plan),
    guidance: `Choose the steadier expression of ${planetGift(ak.planet)} this season. The lesson is not to become someone else; it is to mature the part of you that already keeps returning through ${ak.sign}.`,
    headline: `Your life keeps asking you to master ${signTheme(ak.sign)} through ${planetGift(ak.planet)}.`,
    id: 'soul-planet-reading',
    prediction: `The deeper pattern is that responsibility, desire, and turning points will repeatedly push you back toward ${signTheme(ak.sign)}. When you avoid that lane, life can feel scattered; when you accept it, your decisions become cleaner and your confidence becomes less dependent on applause.`,
    technicalEvidence: [
      `${ak.planet} is Atmakaraka.`,
      `${ak.planet} occupies ${ak.sign}, house ${ak.house}, ${ak.degree} degrees.`,
      `Nakshatra evidence: ${ak.nakshatra} pada ${ak.pada}.`,
      `Dignity: ${ak.dignity}.`,
    ],
    title: 'Soul Planet Reading',
  };
}

function buildCareerDharmaReading(plan: JaiminiPlan): JaiminiInterpretationBlock {
  const amk = plan.amatyakaraka;
  const visible = plan.arudhaLagna.padaSign;

  if (!amk) {
    return pendingBlock(
      'career-dharma-reading',
      'Career Dharma Reading',
      'Your work direction is waiting for the career-karaka evidence.',
      'Predicta needs the Amatyakaraka before it can safely describe Jaimini career dharma.',
      'Avoid career certainty until Amatyakaraka evidence is present.',
      plan.evidenceWarnings,
    );
  }

  return {
    confidence: confidenceFor(plan),
    guidance: `Act like your work is being judged by consistency, not just effort. Make the next career move that strengthens ${planetGift(amk.planet)} and makes your public signal easier to trust.`,
    headline: `Your work grows when ${planetGift(amk.planet)} is made visible and useful.`,
    id: 'career-dharma-reading',
    prediction: `Career momentum is likely to improve when you stop scattering your authority and make one visible lane stronger. ${visible ? `The Arudha signal through ${visible} suggests people notice the version of you that carries ${signTheme(visible)} clearly. ` : ''}If work feels slow, the correction is not panic; it is sharper positioning and more consistent proof of competence.`,
    technicalEvidence: [
      `${amk.planet} is Amatyakaraka.`,
      `${amk.planet} occupies ${amk.sign}, house ${amk.house}, ${amk.degree} degrees.`,
      visible ? `Arudha Lagna resolves to ${visible}.` : 'Arudha Lagna is pending.',
    ],
    title: 'Career Dharma Reading',
  };
}

function buildRelationshipMirrorReading(plan: JaiminiPlan): JaiminiInterpretationBlock {
  const dk = plan.darakaraka;
  const upapada = plan.upapadaLagna.padaSign;

  if (!dk) {
    return pendingBlock(
      'relationship-mirror-reading',
      'Relationship Mirror Reading',
      'Your relationship mirror is waiting for Darakaraka evidence.',
      'Predicta needs the Darakaraka before it can safely describe partnership patterns.',
      'Keep relationship guidance broad until Darakaraka evidence is present.',
      plan.evidenceWarnings,
    );
  }

  return {
    confidence: confidenceFor(plan),
    guidance: `In close relationships, respond slower and name expectations earlier. The healthier path is to let ${planetGift(dk.planet)} become a bridge instead of a test.`,
    headline: `Relationships mirror your unfinished lesson around ${planetGift(dk.planet)}.`,
    id: 'relationship-mirror-reading',
    prediction: `The repeating relationship pattern is not random: partners and close mirrors are likely to bring out the exact place where you must mature your expectations, boundaries, and emotional honesty. ${upapada ? `Upapada in ${upapada} adds a partnership lens of ${signTheme(upapada)}. ` : ''}When this pattern is handled consciously, relationships become a refinement path rather than a battlefield.`,
    technicalEvidence: [
      `${dk.planet} is Darakaraka.`,
      `${dk.planet} occupies ${dk.sign}, house ${dk.house}, ${dk.degree} degrees.`,
      upapada ? `Upapada Lagna resolves to ${upapada}.` : 'Upapada Lagna is pending.',
    ],
    title: 'Relationship Mirror Reading',
  };
}

function buildVisibleIdentityReading(plan: JaiminiPlan): JaiminiInterpretationBlock {
  const arudha = plan.arudhaLagna.padaSign;

  if (!arudha) {
    return pendingBlock(
      'visible-identity-reading',
      'Visible Identity Reading',
      'Your public image signal is waiting for Arudha evidence.',
      'Predicta needs Arudha Lagna before describing how the world reads your path.',
      'Do not force branding or visibility claims until Arudha is calculated.',
      plan.arudhaLagna.evidence,
    );
  }

  return {
    confidence: confidenceFor(plan),
    guidance: `Make your outer presentation match ${signTheme(arudha)}. The more your public choices feel scattered, the harder it becomes for others to understand your value.`,
    headline: `People are likely to notice you through ${arudha} qualities first.`,
    id: 'visible-identity-reading',
    prediction: `Your visible identity improves when your work, language, and decisions consistently project ${signTheme(arudha)}. This does not mean pretending; it means making the part of you that others already sense more deliberate, polished, and easier to trust.`,
    technicalEvidence: [
      `Arudha Lagna resolves to ${arudha}.`,
      ...plan.arudhaLagna.evidence,
    ],
    title: 'Visible Identity Reading',
  };
}

function buildCurrentDestinyChapter(plan: JaiminiPlan): JaiminiInterpretationBlock {
  const chapter = plan.currentCharaDasha;

  if (!chapter) {
    return pendingBlock(
      'current-destiny-chapter',
      'Current Destiny Chapter',
      'Your current Jaimini timing chapter is still pending.',
      'Predicta needs birth-date and Chara Dasha timeline evidence before describing the active chapter.',
      'Use broad guidance until the current Chara Dasha period is calculated.',
      plan.evidenceWarnings,
    );
  }

  return {
    confidence: confidenceFor(plan),
    guidance: `Treat this as a chapter for ${signTheme(chapter.sign)}. Build one habit, one decision, and one boundary that make that theme practical now.`,
    headline: `Your current destiny chapter is asking for ${signTheme(chapter.sign)}.`,
    id: 'current-destiny-chapter',
    prediction: `The active period is likely to make ${chapter.sign} matters louder: identity, decisions, relationships, and work choices will keep circling back to that theme until it is handled with more maturity. Treat it as a timing chapter that shows where life is pressing for a cleaner response.`,
    technicalEvidence: [
      `Current baseline Chara Dasha: ${chapter.sign}.`,
      `Age window: ${chapter.startAge}-${chapter.endAge}.`,
      `Sign lord: ${chapter.signLord}.`,
      chapter.calculationRule,
    ],
    title: 'Current Destiny Chapter',
  };
}

function buildFocusNowReading(plan: JaiminiPlan): JaiminiInterpretationBlock {
  const ak = plan.atmakaraka;
  const chapter = plan.currentCharaDasha;
  const focusTheme = chapter?.sign ?? ak?.sign;

  if (!focusTheme) {
    return pendingBlock(
      'what-to-focus-on-now',
      'What to Focus on Now',
      'Your next focus is waiting for enough Jaimini evidence.',
      'Create or select a Kundli so Predicta can calculate the focus signal.',
      'Start with a stable routine until the chart evidence is ready.',
      plan.evidenceWarnings,
    );
  }

  return {
    confidence: confidenceFor(plan),
    guidance: `For the next step, reduce noise and choose one action that strengthens ${signTheme(focusTheme)}. Do it visibly enough that life can respond to the new pattern.`,
    headline: `Focus now on making ${signTheme(focusTheme)} real in daily decisions.`,
    id: 'what-to-focus-on-now',
    prediction: `The chart is not asking you to chase every possibility. It is asking you to make the current signal concrete: fewer vague intentions, more visible commitment, and a cleaner standard for what deserves your time.`,
    technicalEvidence: [
      chapter ? `Focus derived from current Chara Dasha ${chapter.sign}.` : 'Current Chara Dasha is pending.',
      ak ? `Atmakaraka support: ${ak.planet} in ${ak.sign}.` : 'Atmakaraka is pending.',
    ],
    title: 'What to Focus on Now',
  };
}

function buildPremiumDeepening(plan: JaiminiPlan): JaiminiInterpretationBlock {
  const ak = plan.atmakaraka;
  const amk = plan.amatyakaraka;
  const dk = plan.darakaraka;
  const chapter = plan.currentCharaDasha;

  return {
    confidence: confidenceFor(plan),
    guidance: 'Premium connects the soul-role, work-role, relationship mirror, visible identity, and timing chapter into one grounded action map.',
    headline: 'Premium turns the signals into a sharper life-direction map.',
    id: 'premium-deepening',
    premiumOnly: true,
    prediction: [
      ak ? `${ak.planet} shows the deeper role.` : 'Soul-role evidence is pending.',
      amk ? `${amk.planet} shows the work channel.` : 'Career dharma evidence is pending.',
      dk ? `${dk.planet} shows the relationship mirror.` : 'Relationship mirror evidence is pending.',
      chapter ? `${chapter.sign} shows the current chapter.` : 'Current timing chapter is pending.',
    ].join(' '),
    technicalEvidence: buildTechnicalEvidence(plan),
    title: 'Premium Deepening',
  };
}

function buildTechnicalEvidenceBlock(plan: JaiminiPlan): JaiminiInterpretationBlock {
  return {
    confidence: confidenceFor(plan),
    guidance: 'Use this evidence after the reading, not before it.',
    headline: 'Technical proof is available for audit and premium appendices.',
    id: 'technical-evidence',
    prediction: 'The main reading should stay prediction-first. This block preserves the evidence trail for drawers, detail rows, and report appendices.',
    technicalEvidence: buildTechnicalEvidence(plan),
    title: 'Technical Evidence',
  };
}

function buildSummary(plan: JaiminiPlan): string {
  const block = buildSoulPlanetReading(plan);
  return `${block.headline} ${block.guidance}`;
}

function buildPremiumSummary(plan: JaiminiPlan): string {
  const ak = plan.atmakaraka;
  const amk = plan.amatyakaraka;
  const dk = plan.darakaraka;
  const chapter = plan.currentCharaDasha;

  if (!ak) {
    return 'Premium Jaimini reading is pending until the Chara Karaka order is calculated.';
  }

  return `Premium connects ${ak.planet} Atmakaraka, ${amk?.planet ?? 'pending'} Amatyakaraka, ${dk?.planet ?? 'pending'} Darakaraka, Arudha ${plan.arudhaLagna.padaSign ?? 'pending'}, Upapada ${plan.upapadaLagna.padaSign ?? 'pending'}, and ${chapter?.sign ?? 'pending'} Chara Dasha as one life-direction map.`;
}

function buildTechnicalEvidence(plan: JaiminiPlan): string[] {
  return [
    ...plan.charaKarakas.map(karaka =>
      `${karaka.role}: ${karaka.planet} in ${karaka.sign}, house ${karaka.house}, ${karaka.degree} degrees.`,
    ),
    plan.karakamsha.ascendantSign
      ? `Karakamsha ascendant: ${plan.karakamsha.ascendantSign}.`
      : 'Karakamsha pending.',
    plan.swamsa.ascendantSign ? `Swamsa ascendant: ${plan.swamsa.ascendantSign}.` : 'Swamsa pending.',
    plan.arudhaLagna.padaSign ? `Arudha Lagna: ${plan.arudhaLagna.padaSign}.` : 'Arudha Lagna pending.',
    plan.upapadaLagna.padaSign ? `Upapada Lagna: ${plan.upapadaLagna.padaSign}.` : 'Upapada Lagna pending.',
    plan.currentCharaDasha
      ? `Current Chara Dasha: ${plan.currentCharaDasha.sign}, age ${plan.currentCharaDasha.startAge}-${plan.currentCharaDasha.endAge}.`
      : 'Current Chara Dasha pending.',
    ...plan.evidenceWarnings,
  ];
}

function pendingBlock(
  id: JaiminiInterpretationBlock['id'],
  title: string,
  headline: string,
  prediction: string,
  guidance: string,
  evidence: string[],
): JaiminiInterpretationBlock {
  return {
    confidence: 'pending',
    guidance,
    headline,
    id,
    prediction,
    technicalEvidence: evidence,
    title,
  };
}

function confidenceFor(plan: JaiminiPlan): JaiminiInterpretationBlock['confidence'] {
  if (plan.calculationStatus === 'ready') {
    return 'high';
  }

  if (plan.calculationStatus === 'partial') {
    return 'medium';
  }

  return 'pending';
}

function planetGift(planet: string): string {
  const gifts: Record<string, string> = {
    Jupiter: 'wisdom, guidance, and principled growth',
    Mars: 'courage, decisive action, and disciplined force',
    Mercury: 'clear thinking, skill, language, and adaptability',
    Moon: 'emotional intelligence, care, and inner steadiness',
    Saturn: 'patience, responsibility, and long-term mastery',
    Sun: 'authority, self-respect, and clean leadership',
    Venus: 'harmony, value, refinement, and relationship intelligence',
  };

  return gifts[planet] ?? `${planet} qualities`;
}

function signTheme(sign: string): string {
  const themes: Record<string, string> = {
    Aries: 'courage, initiative, and clean self-direction',
    Taurus: 'stability, value, patience, and material steadiness',
    Gemini: 'communication, learning, trade, and flexible intelligence',
    Cancer: 'emotional security, care, belonging, and protective strength',
    Leo: 'visibility, leadership, confidence, and creative authority',
    Virgo: 'skill, service, refinement, and practical correction',
    Libra: 'balance, agreements, partnership, and public fairness',
    Scorpio: 'depth, transformation, secrecy, and emotional honesty',
    Sagittarius: 'belief, teaching, higher direction, and principled expansion',
    Capricorn: 'structure, duty, ambition, and slow-earned authority',
    Aquarius: 'systems, networks, unusual paths, and social contribution',
    Pisces: 'faith, surrender, imagination, and spiritual sensitivity',
  };

  return themes[sign] ?? `${sign} themes`;
}
