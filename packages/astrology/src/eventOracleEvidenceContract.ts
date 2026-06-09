import type {
  EventQuestionEvidenceRoom,
  EventQuestionRefinement,
} from './eventOracleQuestions';

export type EventOracleEvidenceLayerId =
  | EventQuestionEvidenceRoom
  | 'lifeAtlas';

export type EventOracleEvidenceAvailability =
  | 'missing'
  | 'partial'
  | 'ready';

export type EventOracleEvidenceStance =
  | 'blocks'
  | 'mixed'
  | 'neutral'
  | 'supports';

export type EventOracleEvidenceConfidence =
  | 'moderate'
  | 'strong'
  | 'weak';

export type EventOracleEvidenceInputLayer = {
  availability: EventOracleEvidenceAvailability;
  confidence?: EventOracleEvidenceConfidence;
  missingReason?: string;
  stance?: EventOracleEvidenceStance;
  summary?: string;
  technicalPoints?: string[];
};

export type EventOracleEvidenceContractInput = {
  layers?: Partial<Record<EventOracleEvidenceLayerId, EventOracleEvidenceInputLayer>>;
  refinement: EventQuestionRefinement;
};

export type EventOracleMissingEvidenceFlag = {
  layerId: EventOracleEvidenceLayerId;
  optional: boolean;
  reason: string;
};

export type EventOracleEvidenceLayer = {
  availability: EventOracleEvidenceAvailability;
  boundary: string;
  confidence: EventOracleEvidenceConfidence;
  isOptional: boolean;
  label: string;
  layerId: EventOracleEvidenceLayerId;
  missingReason?: string;
  sourceAware: true;
  stance: EventOracleEvidenceStance;
  summary: string;
  technicalPoints: string[];
};

export type EventOracleEvidenceConfidenceSummary = {
  downgradedBy: string[];
  explanation: string;
  level: 'high' | 'low' | 'medium' | 'not_enough_evidence';
};

export type EventOracleEvidenceContractStatus =
  | 'conflicted'
  | 'not_enough_evidence'
  | 'partial'
  | 'ready';

export type EventOracleEvidenceContract = {
  aiMayFillMissingEvidence: false;
  agreementScore: number;
  categoryId: EventQuestionRefinement['categoryId'];
  confidence: EventOracleEvidenceConfidenceSummary;
  conflictScore: number;
  contractVersion: 'event-oracle-evidence-phase-3-v1';
  deterministic: true;
  evidenceSourceLabels: Record<EventOracleEvidenceLayerId, string>;
  layers: EventOracleEvidenceLayer[];
  methodBoundaries: Record<EventOracleEvidenceLayerId, string>;
  missingEvidenceFlags: EventOracleMissingEvidenceFlag[];
  notEnoughEvidence: boolean;
  requiredLayerIds: EventOracleEvidenceLayerId[];
  sourceAware: true;
  status: EventOracleEvidenceContractStatus;
};

const EVIDENCE_SOURCE_LABELS: Record<EventOracleEvidenceLayerId, string> = {
  jaimini: 'Jaimini destiny evidence',
  kp: 'KP event-timing evidence',
  kundliKarma: 'Kundli Karma pressure/support evidence',
  lifeAtlas: 'Life Atlas synthesis context',
  numerology: 'Numerology timing color',
  signature: 'Signature expression evidence',
  vedic: 'Vedic chart and dasha evidence',
};

const METHOD_BOUNDARIES: Record<EventOracleEvidenceLayerId, string> = {
  jaimini:
    'Jaimini contributes karakas, Arudha, Karakamsha, Upapada, Chara Dasha, and rashi drishti only where calculated.',
  kp:
    'KP contributes relevant houses, cusps, star lord, sub lord, significators, ruling planets, promise/block, and timing readiness.',
  kundliKarma:
    'Kundli Karma contributes Dosh, Shrap, Yog, Lal Kitab, friction, and remedy context without fear-selling.',
  lifeAtlas:
    'Life Atlas is synthesis context only after source evidence exists; it must not replace source proof.',
  numerology:
    'Numerology contributes personal year/month/day, name rhythm, and timing color as secondary evidence.',
  signature:
    'Signature evidence is optional and can only use confirmed visible traits; it must never be invented.',
  vedic:
    'Vedic contributes dasha, antardasha, pratyantardasha, transit, house lords, D1, Moon, D9, D10, Chalit, yogas, Dosh, Shrap, Yog, and Lal Kitab.',
};

const OPTIONAL_LAYERS = new Set<EventOracleEvidenceLayerId>([
  'lifeAtlas',
  'signature',
]);

function isOptionalLayer(layerId: EventOracleEvidenceLayerId): boolean {
  return OPTIONAL_LAYERS.has(layerId);
}

function uniqueLayerIds(layerIds: EventOracleEvidenceLayerId[]): EventOracleEvidenceLayerId[] {
  return Array.from(new Set(layerIds));
}

function defaultMissingReason(layerId: EventOracleEvidenceLayerId): string {
  if (layerId === 'signature') {
    return 'Signature layer is optional and no confirmed signature traits are available.';
  }
  if (layerId === 'lifeAtlas') {
    return 'Life Atlas synthesis waits until source evidence layers are ready.';
  }
  return `${EVIDENCE_SOURCE_LABELS[layerId]} is not available yet for this event question.`;
}

function normalizeInputLayer(
  layerId: EventOracleEvidenceLayerId,
  input?: EventOracleEvidenceInputLayer,
): EventOracleEvidenceLayer {
  const availability = input?.availability ?? 'missing';
  const missingReason =
    availability === 'missing'
      ? input?.missingReason ?? defaultMissingReason(layerId)
      : undefined;

  return {
    availability,
    boundary: METHOD_BOUNDARIES[layerId],
    confidence: input?.confidence ?? (availability === 'ready' ? 'moderate' : 'weak'),
    isOptional: isOptionalLayer(layerId),
    label: EVIDENCE_SOURCE_LABELS[layerId],
    layerId,
    missingReason,
    sourceAware: true,
    stance: availability === 'missing' ? 'neutral' : input?.stance ?? 'neutral',
    summary:
      input?.summary ??
      (availability === 'missing'
        ? missingReason ?? defaultMissingReason(layerId)
        : `${EVIDENCE_SOURCE_LABELS[layerId]} is available but awaits event-specific scoring.`),
    technicalPoints: input?.technicalPoints ?? [],
  };
}

function scoreLayer(layer: EventOracleEvidenceLayer): number {
  if (layer.availability === 'missing') return 0;
  const availabilityWeight = layer.availability === 'ready' ? 1 : 0.58;
  const confidenceWeight =
    layer.confidence === 'strong' ? 1 : layer.confidence === 'moderate' ? 0.74 : 0.46;
  return availabilityWeight * confidenceWeight;
}

function buildScores(layers: EventOracleEvidenceLayer[]): {
  agreementScore: number;
  conflictScore: number;
} {
  const requiredLayers = layers.filter(layer => !layer.isOptional);
  const denominator = requiredLayers.length || 1;
  let agreement = 0;
  let conflict = 0;

  for (const layer of requiredLayers) {
    const score = scoreLayer(layer);
    if (layer.stance === 'supports') agreement += score;
    if (layer.stance === 'blocks') conflict += score;
    if (layer.stance === 'mixed') {
      agreement += score * 0.45;
      conflict += score * 0.55;
    }
  }

  return {
    agreementScore: Math.round((agreement / denominator) * 100),
    conflictScore: Math.round((conflict / denominator) * 100),
  };
}

function buildMissingFlags(
  layers: EventOracleEvidenceLayer[],
): EventOracleMissingEvidenceFlag[] {
  return layers
    .filter(layer => layer.availability === 'missing')
    .map(layer => ({
      layerId: layer.layerId,
      optional: layer.isOptional,
      reason: layer.missingReason ?? defaultMissingReason(layer.layerId),
    }));
}

function buildStatus({
  conflictScore,
  layers,
}: {
  conflictScore: number;
  layers: EventOracleEvidenceLayer[];
}): EventOracleEvidenceContractStatus {
  const required = layers.filter(layer => !layer.isOptional);
  const readyOrPartial = required.filter(layer => layer.availability !== 'missing');

  if (!readyOrPartial.length) return 'not_enough_evidence';
  if (conflictScore >= 34) return 'conflicted';
  if (readyOrPartial.length < required.length) return 'partial';
  return 'ready';
}

function buildConfidence({
  agreementScore,
  conflictScore,
  layers,
  status,
}: {
  agreementScore: number;
  conflictScore: number;
  layers: EventOracleEvidenceLayer[];
  status: EventOracleEvidenceContractStatus;
}): EventOracleEvidenceConfidenceSummary {
  const downgradedBy: string[] = [];
  const requiredMissing = layers.filter(
    layer => !layer.isOptional && layer.availability === 'missing',
  );

  if (requiredMissing.length) {
    downgradedBy.push(
      `Missing required evidence: ${requiredMissing.map(layer => layer.label).join(', ')}`,
    );
  }
  if (conflictScore > 0) {
    downgradedBy.push('Some evidence blocks or conflicts with the event promise.');
  }
  if (status === 'not_enough_evidence') {
    return {
      downgradedBy,
      explanation:
        'Predicta cannot responsibly answer yet because the required source evidence is not available.',
      level: 'not_enough_evidence',
    };
  }
  if (conflictScore >= 34 || agreementScore < 25) {
    return {
      downgradedBy,
      explanation:
        'Confidence is low because support is weak or contradicted by source evidence.',
      level: 'low',
    };
  }
  if (agreementScore >= 60 && conflictScore <= 12 && !requiredMissing.length) {
    return {
      downgradedBy,
      explanation:
        'Confidence is high because multiple required evidence rooms agree and conflict is low.',
      level: 'high',
    };
  }
  return {
    downgradedBy,
    explanation:
      'Confidence is medium because useful evidence exists, but some layers are partial, missing, or mixed.',
    level: 'medium',
  };
}

export function buildEventOracleEvidenceContract(
  input: EventOracleEvidenceContractInput,
): EventOracleEvidenceContract {
  const expectedLayerIds = uniqueLayerIds([
    ...input.refinement.downstream.evidenceRooms,
    'lifeAtlas',
  ]);
  const requiredLayerIds = expectedLayerIds.filter(layerId => !isOptionalLayer(layerId));
  const layers = expectedLayerIds.map(layerId =>
    normalizeInputLayer(layerId, input.layers?.[layerId]),
  );
  const { agreementScore, conflictScore } = buildScores(layers);
  const status = buildStatus({ conflictScore, layers });
  const missingEvidenceFlags = buildMissingFlags(layers);

  return {
    aiMayFillMissingEvidence: false,
    agreementScore,
    categoryId: input.refinement.categoryId,
    confidence: buildConfidence({ agreementScore, conflictScore, layers, status }),
    conflictScore,
    contractVersion: 'event-oracle-evidence-phase-3-v1',
    deterministic: true,
    evidenceSourceLabels: EVIDENCE_SOURCE_LABELS,
    layers,
    methodBoundaries: METHOD_BOUNDARIES,
    missingEvidenceFlags,
    notEnoughEvidence: status === 'not_enough_evidence',
    requiredLayerIds,
    sourceAware: true,
    status,
  };
}

export function createReadySupportLayer(
  stance: EventOracleEvidenceStance = 'supports',
  summary = 'Evidence supports this event question.',
): EventOracleEvidenceInputLayer {
  return {
    availability: 'ready',
    confidence: 'strong',
    stance,
    summary,
    technicalPoints: ['Source evidence is deterministic and source-aware.'],
  };
}
