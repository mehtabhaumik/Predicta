import type {
  KundliData,
  PredictaSchool,
  SignatureAnalysisModel,
} from '@pridicta/types';
import {
  buildEventOracleEvidenceContract,
  createReadySupportLayer,
  type EventOracleEvidenceContract,
  type EventOracleEvidenceInputLayer,
  type EventOracleEvidenceLayerId,
} from './eventOracleEvidenceContract';
import {
  buildEventOraclePredictionObject,
  buildEventOracleReadingDigest,
  type EventOraclePredictionObject,
} from './eventOraclePredictionEngine';
import {
  refineEventQuestion,
  type EventQuestionRefinement,
} from './eventOracleQuestions';
import { composeChalitBhavKpFoundation } from './chalitBhavKpFoundation';
import { composeJaiminiInterpretation } from './jaiminiInterpretation';
import { composeKundliKarmaSnapshot } from './kundliKarmaSnapshotEngine';
import { composeLifeAtlasReport } from './lifeAtlasReport';
import { composeMahadashaIntelligence } from './mahadashaIntelligence';
import { composeNumerologyFoundationModel } from './numerologyFoundationModel';

export type PredictaMultiSchoolConsultationStatus =
  | 'needs_kundli'
  | 'ready'
  | 'room_safe_blocked';

export type PredictaMultiSchoolConsultationInput = {
  hasPremiumAccess?: boolean;
  kundli?: KundliData;
  predictaSchool?: PredictaSchool;
  question: string;
  signatureAnalysis?: SignatureAnalysisModel;
};

export type PredictaMultiSchoolConsultation = {
  confidence: EventOraclePredictionObject['confidence'];
  consultedSchools: EventOracleEvidenceLayerId[];
  directAnswer: string;
  evidenceContract?: EventOracleEvidenceContract;
  evidenceUsed: string[];
  nextAction: string;
  prediction?: EventOraclePredictionObject;
  refinement: EventQuestionRefinement;
  reply: string;
  roomSafeBoundary?: string;
  status: PredictaMultiSchoolConsultationStatus;
};

const ROOM_SAFE_BOUNDARIES: Partial<Record<PredictaSchool, string>> = {
  JAIMINI:
    'You are inside Jaimini Predicta, so I will not silently mix KP, Vedic, Numerology, Signature, or Life Atlas here. Open main Predicta for all-school synthesis.',
  KP:
    'You are inside KP Predicta, so I will not silently mix Vedic, Jaimini, Numerology, Signature, or Life Atlas here. Open main Predicta for all-school synthesis.',
  NADI:
    'Nadi has been replaced by Jaimini in Predicta. Open Jaimini or main Predicta for the right evidence path.',
  NUMEROLOGY:
    'You are inside Numerology Predicta, so I will not silently mix Kundli schools here. Open main Predicta for all-school synthesis.',
  SIGNATURE:
    'You are inside Signature Predicta, so I will not silently mix chart schools here. Open main Predicta for all-school synthesis.',
};

export function isPredictaMultiSchoolQuestion(question: string): boolean {
  const normalized = question.trim().toLowerCase();
  if (!normalized) return false;
  return /\b(will|when|should|likely|possible|chance|predict|prediction|timing|trigger|delay|career|job|promotion|foreign|abroad|visa|pr|relocation|marriage|relationship|love|property|money|business|education|court|legal|family|child|matching|health|wellness|guide me|no question)\b/i.test(
    normalized,
  );
}

export function composePredictaMultiSchoolConsultation({
  hasPremiumAccess = false,
  kundli,
  predictaSchool,
  question,
  signatureAnalysis,
}: PredictaMultiSchoolConsultationInput): PredictaMultiSchoolConsultation {
  const refinement = refineEventQuestion(question);
  const roomSafeBoundary = predictaSchool
    ? ROOM_SAFE_BOUNDARIES[predictaSchool]
    : undefined;

  if (roomSafeBoundary) {
    return {
      confidence: {
        evidenceBacked: true,
        explanation:
          'Room-safe mode prevents silent school mixing. Use main Predicta for all-school consultation.',
        label: 'Not enough evidence',
        level: 'not_enough_evidence',
        score: 0,
      },
      consultedSchools: [],
      directAnswer: 'Open main Predicta for all-school synthesis.',
      evidenceUsed: [],
      nextAction: 'Stay in this specialist room or open main Predicta for synthesis.',
      refinement,
      reply: roomSafeBoundary,
      roomSafeBoundary,
      status: 'room_safe_blocked',
    };
  }

  if (!kundli) {
    return {
      confidence: {
        evidenceBacked: true,
        explanation:
          'Predicta needs a selected Kundli before consulting the astrology schools.',
        label: 'Not enough evidence',
        level: 'not_enough_evidence',
        score: 0,
      },
      consultedSchools: refinement.downstream.evidenceRooms,
      directAnswer: 'Needs Kundli: select or create a Kundli first.',
      evidenceUsed: [],
      nextAction:
        'Send name, date of birth, birth time, and birth place so Predicta can calculate the evidence before predicting.',
      refinement,
      reply: [
        'Needs Kundli: I can consult Vedic, KP, Jaimini, Kundli Karma, Numerology, and optional Signature only after a Kundli is selected.',
        'Next action: send name, date of birth, birth time, and birth place. I will create the Kundli without spending an AI credit, then answer the event question.',
      ].join('\n\n'),
      status: 'needs_kundli',
    };
  }

  const evidenceContract = buildEventOracleEvidenceContract({
    layers: buildEvidenceLayers({
      hasPremiumAccess,
      kundli,
      refinement,
      signatureAnalysis,
    }),
    refinement,
  });
  const prediction = buildEventOraclePredictionObject({
    evidenceContract,
    refinement,
    timing: buildTimingInput(kundli, evidenceContract.layers.map(layer => layer.layerId)),
    trigger: {
      evidenceLayerIds: evidenceContract.layers
        .filter(layer => layer.availability !== 'missing')
        .slice(0, 3)
        .map(layer => layer.layerId),
      label: 'Most likely real-world trigger',
      summary: buildTriggerSummary(refinement.categoryId),
    },
  });
  const digest = buildEventOracleReadingDigest(
    prediction,
    hasPremiumAccess ? 'PAID' : 'FREE',
  );
  const evidenceUsed = prediction.collapsedEvidence
    .filter(item => item.availability !== 'missing')
    .map(item => `${item.label}: ${item.stance}. ${item.summary}`);
  const conflicts = prediction.collapsedEvidence
    .filter(item => item.stance === 'blocks' || item.stance === 'mixed')
    .map(item => `${item.label}: ${item.summary}`);
  const nextAction = prediction.whatToDoNow[0] ?? digest.action[0] ?? 'Ask one sharper event question.';

  return {
    confidence: prediction.confidence,
    consultedSchools: prediction.collapsedEvidence.map(item => item.layerId),
    directAnswer: prediction.directAnswer,
    evidenceContract,
    evidenceUsed,
    nextAction,
    prediction,
    refinement,
    reply: buildReply({
      conflicts,
      evidenceUsed,
      nextAction,
      prediction,
    }),
    status: 'ready',
  };
}

function buildEvidenceLayers({
  hasPremiumAccess,
  kundli,
  refinement,
  signatureAnalysis,
}: {
  hasPremiumAccess: boolean;
  kundli: KundliData;
  refinement: EventQuestionRefinement;
  signatureAnalysis?: SignatureAnalysisModel;
}): Partial<Record<EventOracleEvidenceLayerId, EventOracleEvidenceInputLayer>> {
  const layers: Partial<Record<EventOracleEvidenceLayerId, EventOracleEvidenceInputLayer>> = {};

  for (const layerId of refinement.downstream.evidenceRooms) {
    if (layerId === 'vedic') {
      layers.vedic = safeLayer('vedic', () => buildVedicLayer(kundli));
    }
    if (layerId === 'kp') {
      layers.kp = safeLayer('kp', () => buildKpLayer(kundli));
    }
    if (layerId === 'jaimini') {
      layers.jaimini = safeLayer('jaimini', () =>
        buildJaiminiLayer(kundli, hasPremiumAccess),
      );
    }
    if (layerId === 'kundliKarma') {
      layers.kundliKarma = safeLayer('kundliKarma', () =>
        buildKundliKarmaLayer(kundli),
      );
    }
    if (layerId === 'numerology') {
      layers.numerology = safeLayer('numerology', () => buildNumerologyLayer(kundli));
    }
    if (layerId === 'signature') {
      layers.signature = buildSignatureLayer(signatureAnalysis);
    }
  }

  layers.lifeAtlas = safeLayer('lifeAtlas', () =>
    buildLifeAtlasLayer(kundli, hasPremiumAccess, signatureAnalysis),
  );
  return layers;
}

function safeLayer(
  layerId: EventOracleEvidenceLayerId,
  build: () => EventOracleEvidenceInputLayer,
): EventOracleEvidenceInputLayer {
  try {
    return build();
  } catch (error) {
    return {
      availability: 'partial',
      confidence: 'weak',
      stance: 'mixed',
      summary: `${layerId} evidence is partially available, but one deterministic sub-module needs richer chart data before Predicta can treat it as strong.`,
      technicalPoints: [
        error instanceof Error ? error.message : 'Unknown deterministic layer issue.',
      ],
    };
  }
}

function buildVedicLayer(kundli: KundliData): EventOracleEvidenceInputLayer {
  const dasha = composeMahadashaIntelligence(kundli, { depth: 'FREE' });
  const current = dasha.current;
  return createReadySupportLayer(
    'supports',
    `Vedic timing is active through ${current.mahadasha}/${current.antardasha}; D1, Moon, D9, D10, Chalit, dasha, Yog, Dosh, Shrap, and Lal Kitab remain the foundation before a prediction is finalized.`,
  );
}

function buildKpLayer(kundli: KundliData): EventOracleEvidenceInputLayer {
  const kp = composeChalitBhavKpFoundation(kundli, { depth: 'FREE' }).kp;
  const stance = kp.eventJudgement.confidence === 'uncertain' ? 'mixed' : 'supports';
  const confidence =
    kp.eventJudgement.confidence === 'clear'
      ? 'strong'
      : kp.eventJudgement.confidence === 'partial'
        ? 'moderate'
        : 'weak';
  return {
    availability: kp.eventJudgement.confidence === 'uncertain' ? 'partial' : 'ready',
    confidence,
    stance,
    summary: `KP says: ${kp.eventJudgement.verdictLabel}. ${kp.eventJudgement.plainLanguage}`,
    technicalPoints: [
      kp.eventJudgement.promise,
      kp.eventJudgement.mainBlock,
      kp.eventJudgement.timingReadiness,
    ],
  };
}

function buildJaiminiLayer(
  kundli: KundliData,
  hasPremiumAccess: boolean,
): EventOracleEvidenceInputLayer {
  const jaimini = composeJaiminiInterpretation(kundli, {
    premium: hasPremiumAccess,
  });
  const firstBlock = (hasPremiumAccess ? jaimini.premiumBlocks : jaimini.freeBlocks)[0];
  return createReadySupportLayer(
    'supports',
    firstBlock
      ? `Jaimini says: ${firstBlock.prediction}`
      : `Jaimini says: ${jaimini.summary}`,
  );
}

function buildKundliKarmaLayer(kundli: KundliData): EventOracleEvidenceInputLayer {
  const snapshot = composeKundliKarmaSnapshot(kundli);
  const topCondition = snapshot.topThreeActiveConditions[0];
  const stance = topCondition?.item.module === 'SUPPORTIVE_YOG' ? 'supports' : 'mixed';
  return {
    availability: snapshot.calculationStatus === 'ready' ? 'ready' : 'partial',
    confidence: topCondition?.item.confidence === 'clear' ? 'strong' : 'moderate',
    stance,
    summary: topCondition
      ? `Kundli Karma highlights ${topCondition.item.displayName}: ${topCondition.item.meaningForUser}`
      : snapshot.summary,
    technicalPoints: [
      snapshot.strongestDosh?.item.displayName,
      snapshot.strongestShrapOrRin?.item.displayName,
      snapshot.strongestYog?.item.displayName,
      snapshot.topRemedy?.title,
    ].filter((item): item is string => Boolean(item)),
  };
}

function buildNumerologyLayer(kundli: KundliData): EventOracleEvidenceInputLayer {
  const numerology =
    kundli.numerology ?? composeNumerologyFoundationModel(kundli.birthDetails);
  if (numerology.status !== 'ready') {
    return {
      availability: 'partial',
      confidence: 'weak',
      stance: 'neutral',
      summary:
        'Numerology timing color is pending because name/date number readiness is incomplete.',
    };
  }
  return {
    availability: 'ready',
    confidence: 'moderate',
    stance: 'supports',
    summary: `Numerology timing color: ${numerology.identityDashboard.lifeThemeSentence} Current cycle asks: ${numerology.identityDashboard.bestUseOfCurrentCycle}`,
    technicalPoints: numerology.evidence.slice(0, 4),
  };
}

function buildSignatureLayer(
  signatureAnalysis: SignatureAnalysisModel | undefined,
): EventOracleEvidenceInputLayer {
  if (signatureAnalysis?.status !== 'ready') {
    return {
      availability: 'missing',
      missingReason:
        'Signature evidence is optional and no confirmed visible signature traits are available.',
      stance: 'neutral',
      summary:
        'Signature evidence is optional and was not used because no confirmed signature traits were supplied.',
    };
  }

  return {
    availability: 'ready',
    confidence: 'moderate',
    stance: 'supports',
    summary: `Signature expression layer says: ${signatureAnalysis.summary}`,
    technicalPoints: signatureAnalysis.evidence.slice(0, 4),
  };
}

function buildLifeAtlasLayer(
  kundli: KundliData,
  hasPremiumAccess: boolean,
  signatureAnalysis: SignatureAnalysisModel | undefined,
): EventOracleEvidenceInputLayer {
  const lifeAtlas = composeLifeAtlasReport(kundli, {
    depth: hasPremiumAccess ? 'PREMIUM' : 'FREE',
    signatureAnalysis,
  });
  return {
    availability: 'ready',
    confidence: 'moderate',
    stance: 'supports',
    summary: `Life Atlas context: ${lifeAtlas.hiddenThread}`,
    technicalPoints: lifeAtlas.evidenceLayers
      .filter(layer => layer.status !== 'missing')
      .slice(0, 4)
      .map(layer => `${layer.label}: ${layer.summary}`),
  };
}

function buildTimingInput(
  kundli: KundliData,
  evidenceLayerIds: EventOracleEvidenceLayerId[],
) {
  const current = kundli.dasha.current;
  return {
    basis: `Current Vimshottari timing: ${current.mahadasha}/${current.antardasha}.`,
    endDate: current.endDate,
    evidenceLayerIds: evidenceLayerIds.slice(0, 3),
    label: `${current.mahadasha}/${current.antardasha} active window`,
    precision: 'dasha_window' as const,
    startDate: current.startDate,
  };
}

function buildTriggerSummary(categoryId: EventQuestionRefinement['categoryId']): string {
  switch (categoryId) {
    case 'foreign_travel':
      return 'The trigger may come through employer movement, document progress, client need, senior colleague change, or travel approval.';
    case 'career_move':
    case 'job_change':
    case 'promotion':
      return 'The trigger may come through manager movement, role opening, team restructuring, review cycle, recruiter contact, or visible work success.';
    case 'marriage_timing':
    case 'relationship_outcome':
      return 'The trigger may come through a serious conversation, family involvement, proposal, reconciliation, or commitment decision.';
    case 'money_property':
      return 'The trigger may come through paperwork, loan movement, buyer/seller response, cash-flow clarity, or a practical deadline.';
    default:
      return 'The trigger is likely to appear as a practical opening, conversation, approval, deadline, or responsibility shift tied to the question.';
  }
}

function buildReply({
  conflicts,
  evidenceUsed,
  nextAction,
  prediction,
}: {
  conflicts: string[];
  evidenceUsed: string[];
  nextAction: string;
  prediction: EventOraclePredictionObject;
}): string {
  return [
    prediction.directAnswer,
    `Timing: ${prediction.timingWindow.label}. ${prediction.timingWindow.honestyNote}`,
    `Most likely trigger: ${prediction.mostLikelyTrigger.summary}`,
    `Confidence: ${prediction.confidence.label} (${prediction.confidence.score}/100). ${prediction.confidence.explanation}`,
    evidenceUsed.length
      ? `Evidence used:\n${evidenceUsed.slice(0, 5).map(item => `- ${item}`).join('\n')}`
      : 'Evidence used: not enough source evidence is ready yet.',
    conflicts.length
      ? `Conflicts I am respecting:\n${conflicts.slice(0, 3).map(item => `- ${item}`).join('\n')}`
      : 'Conflicts: no major conflict strong enough to downgrade the answer heavily.',
    `Next action: ${nextAction}`,
  ].join('\n\n');
}
