import type { SupportedLanguage } from '@pridicta/types';
import type { EventOracleEvidenceContract } from './eventOracleEvidenceContract';
import type { EventOraclePredictionObject } from './eventOraclePredictionEngine';
import type {
  EventQuestionCategoryId,
  EventQuestionRefinement,
} from './eventOracleQuestions';

export type HumanAstrologerVerificationStatus =
  | 'verified'
  | 'probation'
  | 'suspended';

export type HumanReviewPacketStatus =
  | 'requested'
  | 'assigned'
  | 'in_review'
  | 'approved'
  | 'refined'
  | 'sent'
  | 'retry_requested'
  | 'refund_eligible'
  | 'expired'
  | 'rejected_safety';

export type HumanReviewMethod =
  | 'VEDIC'
  | 'KP'
  | 'JAIMINI'
  | 'KUNDLI_KARMA'
  | 'NUMEROLOGY'
  | 'LAL_KITAB';

export type HumanAstrologerProfile = {
  categoriesHandled: EventQuestionCategoryId[];
  displayName: string;
  id: string;
  languages: SupportedLanguage[];
  methods: HumanReviewMethod[];
  ratingsByCategory: Partial<Record<EventQuestionCategoryId, number>>;
  responseSlaHours: number;
  verificationStatus: HumanAstrologerVerificationStatus;
};

export type HumanReviewSafetyNote = {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'blocker';
};

export type HumanReviewPacket = {
  assignedAstrologerId?: string;
  auditTrail: HumanReviewAuditEntry[];
  confidence: EventOraclePredictionObject['confidence'];
  conflicts: string[];
  createdAt: string;
  deterministicEvidence: EventOracleEvidenceContract;
  id: string;
  predictaDraft: EventOraclePredictionObject;
  refinedEventQuestion: EventQuestionRefinement;
  refundRetryPolicy: HumanReviewRefundRetryPolicy;
  safetyNotes: HumanReviewSafetyNote[];
  status: HumanReviewPacketStatus;
  userQuestion: string;
};

export type HumanReviewResponse = {
  actionPlan: string[];
  astrologerId: string;
  changedFields: HumanReviewChangedField[];
  evidenceAcknowledgement: string;
  finalAnswer: string;
  reviewerNote: string;
  safetyBoundary: string;
  submittedAt: string;
  timingAndTrigger: string;
};

export type HumanReviewChangedField =
  | 'directAnswer'
  | 'timingWindow'
  | 'trigger'
  | 'confidence'
  | 'actionPlan'
  | 'wordingOnly';

export type HumanReviewAuditEntry = {
  actor: 'predicta' | 'astrologer' | 'admin';
  at: string;
  fromStatus?: HumanReviewPacketStatus;
  kind:
    | 'packet_created'
    | 'assigned'
    | 'human_response_submitted'
    | 'response_sent'
    | 'safety_rejected'
    | 'retry_requested'
    | 'refund_eligible';
  note: string;
  toStatus: HumanReviewPacketStatus;
};

export type HumanReviewRefundRetryPolicy = {
  expiresAt: string;
  refundEligible: boolean;
  retryEligible: boolean;
  slaHours: number;
};

export type HumanReviewDiff = {
  changedFields: HumanReviewChangedField[];
  predictaDraftSummary: string;
  reviewerSummary: string;
};

export type HumanReviewValidationResult = {
  errors: string[];
  safe: boolean;
};

const FORBIDDEN_HUMAN_REVIEW_PATTERNS = [
  /\bguaranteed\b/i,
  /\bdefinitely\b/i,
  /\b100%\b/i,
  /\bcursed\b/i,
  /\bdoomed\b/i,
  /\bmust buy\b/i,
  /\bexpensive puja\b/i,
  /\bpay.*remedy\b/i,
  /\bmedical cure\b/i,
];

export function createHumanReviewPacket({
  deterministicEvidence,
  id,
  nowIso,
  predictaDraft,
  refinedEventQuestion,
  safetyNotes = [],
  slaHours = 24,
  userQuestion,
}: {
  deterministicEvidence: EventOracleEvidenceContract;
  id: string;
  nowIso: string;
  predictaDraft: EventOraclePredictionObject;
  refinedEventQuestion: EventQuestionRefinement;
  safetyNotes?: HumanReviewSafetyNote[];
  slaHours?: number;
  userQuestion: string;
}): HumanReviewPacket {
  return {
    auditTrail: [
      {
        actor: 'predicta',
        at: nowIso,
        kind: 'packet_created',
        note: 'Predicta prepared the deterministic evidence packet before optional human review.',
        toStatus: 'requested',
      },
    ],
    confidence: predictaDraft.confidence,
    conflicts: buildConflictNotes(deterministicEvidence),
    createdAt: nowIso,
    deterministicEvidence,
    id,
    predictaDraft,
    refinedEventQuestion,
    refundRetryPolicy: buildRefundRetryPolicy(nowIso, slaHours),
    safetyNotes,
    status: 'requested',
    userQuestion,
  };
}

export function assignHumanReviewPacket({
  astrologer,
  nowIso,
  packet,
}: {
  astrologer: HumanAstrologerProfile;
  nowIso: string;
  packet: HumanReviewPacket;
}): HumanReviewPacket {
  if (astrologer.verificationStatus !== 'verified') {
    return transitionPacket({
      actor: 'admin',
      kind: 'safety_rejected',
      nextStatus: 'rejected_safety',
      note: 'Only verified astrologers can receive Event Oracle human review packets.',
      nowIso,
      packet,
    });
  }

  if (!astrologer.categoriesHandled.includes(packet.refinedEventQuestion.categoryId)) {
    return transitionPacket({
      actor: 'admin',
      kind: 'safety_rejected',
      nextStatus: 'rejected_safety',
      note: 'Astrologer category coverage does not match the user question.',
      nowIso,
      packet,
    });
  }

  return {
    ...transitionPacket({
      actor: 'admin',
      kind: 'assigned',
      nextStatus: 'assigned',
      note: `Assigned to ${astrologer.displayName} for verified review.`,
      nowIso,
      packet,
    }),
    assignedAstrologerId: astrologer.id,
    refundRetryPolicy: buildRefundRetryPolicy(nowIso, astrologer.responseSlaHours),
  };
}

export function submitHumanReviewResponse({
  nowIso,
  packet,
  response,
}: {
  nowIso: string;
  packet: HumanReviewPacket;
  response: HumanReviewResponse;
}): {
  diff: HumanReviewDiff;
  packet: HumanReviewPacket;
  validation: HumanReviewValidationResult;
} {
  const validation = validateHumanReviewResponse(packet, response);

  if (!validation.safe) {
    return {
      diff: buildHumanReviewDiff(packet.predictaDraft, response),
      packet: transitionPacket({
        actor: 'admin',
        kind: 'safety_rejected',
        nextStatus: 'rejected_safety',
        note: validation.errors.join(' '),
        nowIso,
        packet,
      }),
      validation,
    };
  }

  return {
    diff: buildHumanReviewDiff(packet.predictaDraft, response),
    packet: transitionPacket({
      actor: 'astrologer',
      kind: 'human_response_submitted',
      nextStatus: response.changedFields.includes('wordingOnly')
        ? 'approved'
        : 'refined',
      note: 'Human reviewer submitted an evidence-aware response.',
      nowIso,
      packet,
    }),
    validation,
  };
}

export function markHumanReviewSent({
  nowIso,
  packet,
}: {
  nowIso: string;
  packet: HumanReviewPacket;
}): HumanReviewPacket {
  return transitionPacket({
    actor: 'admin',
    kind: 'response_sent',
    nextStatus: 'sent',
    note: 'Reviewed answer summary and transcript sent to the user.',
    nowIso,
    packet,
  });
}

export function evaluateHumanReviewRefundRetry({
  nowIso,
  packet,
}: {
  nowIso: string;
  packet: HumanReviewPacket;
}): HumanReviewPacket {
  if (
    packet.status === 'sent' ||
    packet.status === 'rejected_safety' ||
    new Date(nowIso).getTime() <= new Date(packet.refundRetryPolicy.expiresAt).getTime()
  ) {
    return packet;
  }

  return transitionPacket({
    actor: 'admin',
    kind: 'refund_eligible',
    nextStatus: 'refund_eligible',
    note: 'Review SLA expired before a reviewed response was sent.',
    nowIso,
    packet: {
      ...packet,
      refundRetryPolicy: {
        ...packet.refundRetryPolicy,
        refundEligible: true,
        retryEligible: true,
      },
    },
  });
}

export function buildHumanReviewTranscript({
  packet,
  response,
}: {
  packet: HumanReviewPacket;
  response: HumanReviewResponse;
}): string {
  return [
    `Question: ${packet.userQuestion}`,
    `Predicta draft: ${packet.predictaDraft.directAnswer}`,
    `Human reviewed answer: ${response.finalAnswer}`,
    `Timing and trigger: ${response.timingAndTrigger}`,
    `Evidence note: ${response.evidenceAcknowledgement}`,
    `Safety boundary: ${response.safetyBoundary}`,
  ].join('\n');
}

export function validateHumanReviewResponse(
  packet: HumanReviewPacket,
  response: HumanReviewResponse,
): HumanReviewValidationResult {
  const errors: string[] = [];
  const combined = [
    response.finalAnswer,
    response.timingAndTrigger,
    response.evidenceAcknowledgement,
    response.reviewerNote,
    response.safetyBoundary,
    ...response.actionPlan,
  ].join('\n');

  for (const pattern of FORBIDDEN_HUMAN_REVIEW_PATTERNS) {
    if (pattern.test(combined)) {
      errors.push(`Human review contains forbidden pattern: ${pattern}`);
    }
  }

  if (!response.evidenceAcknowledgement.trim()) {
    errors.push('Human review must acknowledge the deterministic evidence packet.');
  }

  if (!response.safetyBoundary.trim()) {
    errors.push('Human review must include a safety boundary.');
  }

  if (
    response.changedFields.some(field => field !== 'wordingOnly') &&
    !response.reviewerNote.toLowerCase().includes('evidence')
  ) {
    errors.push('Non-wording changes must explain evidence basis.');
  }

  if (!packet.assignedAstrologerId || packet.assignedAstrologerId !== response.astrologerId) {
    errors.push('Human response must come from the assigned verified astrologer.');
  }

  return {
    errors,
    safe: errors.length === 0,
  };
}

export function buildHumanReviewDiff(
  draft: EventOraclePredictionObject,
  response: HumanReviewResponse,
): HumanReviewDiff {
  return {
    changedFields: [...response.changedFields],
    predictaDraftSummary: `${draft.directAnswer} ${draft.timingWindow.label} ${draft.mostLikelyTrigger.summary}`,
    reviewerSummary: `${response.finalAnswer} ${response.timingAndTrigger}`,
  };
}

function buildRefundRetryPolicy(
  nowIso: string,
  slaHours: number,
): HumanReviewRefundRetryPolicy {
  return {
    expiresAt: new Date(
      new Date(nowIso).getTime() + slaHours * 60 * 60 * 1000,
    ).toISOString(),
    refundEligible: false,
    retryEligible: false,
    slaHours,
  };
}

function buildConflictNotes(contract: EventOracleEvidenceContract): string[] {
  const notes = contract.layers
    .filter(layer => layer.stance === 'blocks' || layer.stance === 'mixed')
    .map(layer => `${contract.evidenceSourceLabels[layer.layerId]}: ${layer.summary}`);

  if (contract.conflictScore > 0 && !notes.length) {
    notes.push(
      `Conflict score ${contract.conflictScore}/100 requires careful human review.`,
    );
  }

  return notes;
}

function transitionPacket({
  actor,
  kind,
  nextStatus,
  note,
  nowIso,
  packet,
}: {
  actor: HumanReviewAuditEntry['actor'];
  kind: HumanReviewAuditEntry['kind'];
  nextStatus: HumanReviewPacketStatus;
  note: string;
  nowIso: string;
  packet: HumanReviewPacket;
}): HumanReviewPacket {
  return {
    ...packet,
    auditTrail: [
      ...packet.auditTrail,
      {
        actor,
        at: nowIso,
        fromStatus: packet.status,
        kind,
        note,
        toStatus: nextStatus,
      },
    ],
    status: nextStatus,
  };
}
