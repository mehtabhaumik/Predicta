import type {
  EventQuestionCategoryId,
  EventQuestionRefinement,
} from './eventOracleQuestions';
import type {
  EventOracleEvidenceContract,
  EventOracleEvidenceLayer,
  EventOracleEvidenceLayerId,
} from './eventOracleEvidenceContract';

export type EventOracleTimingPrecision =
  | 'dasha_window'
  | 'exact_date'
  | 'month_range'
  | 'not_precise_yet'
  | 'quarter';

export type EventOraclePredictionOutcome =
  | 'blocked'
  | 'delayed'
  | 'likely'
  | 'mixed'
  | 'needs_evidence'
  | 'possible';

export type EventOracleTimingInput = {
  basis: string;
  endDate?: string;
  evidenceLayerIds: EventOracleEvidenceLayerId[];
  exactDateSupported?: boolean;
  label: string;
  precision: EventOracleTimingPrecision;
  startDate?: string;
};

export type EventOracleTriggerInput = {
  evidenceLayerIds: EventOracleEvidenceLayerId[];
  label: string;
  summary: string;
};

export type EventOraclePredictionConfidence = {
  evidenceBacked: true;
  explanation: string;
  label: 'High' | 'Low' | 'Medium' | 'Not enough evidence';
  level: EventOracleEvidenceContract['confidence']['level'];
  score: number;
};

export type EventOracleTimingWindow = {
  basis: string;
  endDate?: string;
  honestyNote: string;
  label: string;
  precision: EventOracleTimingPrecision;
  sourceLayerIds: EventOracleEvidenceLayerId[];
  startDate?: string;
};

export type EventOracleMostLikelyTrigger = {
  sourceLayerIds: EventOracleEvidenceLayerId[];
  summary: string;
  title: string;
};

export type EventOracleCollapsedEvidenceItem = {
  availability: EventOracleEvidenceLayer['availability'];
  label: string;
  layerId: EventOracleEvidenceLayerId;
  sourceAware: true;
  stance: EventOracleEvidenceLayer['stance'];
  summary: string;
};

export type EventOraclePredictionObject = {
  collapsedEvidence: EventOracleCollapsedEvidenceItem[];
  confidence: EventOraclePredictionConfidence;
  contractVersion: 'event-oracle-prediction-phase-4-v1';
  deterministic: true;
  directAnswer: string;
  evidenceContractVersion: EventOracleEvidenceContract['contractVersion'];
  mostLikelyTrigger: EventOracleMostLikelyTrigger;
  noGuaranteedOutcome: true;
  outcome: EventOraclePredictionOutcome;
  question: {
    categoryId: EventQuestionCategoryId;
    original: string;
    refined: string;
  };
  timingWindow: EventOracleTimingWindow;
  whatCanDelayIt: string[];
  whatCanStrengthenIt: string[];
  whatToDoNow: string[];
};

export type EventOraclePredictionInput = {
  evidenceContract: EventOracleEvidenceContract;
  refinement: EventQuestionRefinement;
  timing?: EventOracleTimingInput;
  trigger?: EventOracleTriggerInput;
};

type CategoryPredictionTemplate = {
  action: string;
  delay: string;
  likely: string;
  possible: string;
  strengthen: string;
  trigger: string;
};

const CATEGORY_TEMPLATES: Record<EventQuestionCategoryId, CategoryPredictionTemplate> = {
  business_growth: {
    action: 'Focus on one measurable growth channel before expanding into a second bet.',
    delay: 'Scattered offers, unclear partner terms, or cash-flow pressure can slow growth.',
    likely: 'Business growth looks more likely than not when the active evidence supports clients, execution, and timing together.',
    possible: 'Business growth is possible, but the current proof still needs cleaner timing before Predicta should call it strong.',
    strengthen: 'Clean pricing, written agreements, and disciplined follow-through strengthen the business promise.',
    trigger: 'The trigger is likely to come through a client opening, partnership conversation, visibility push, or a repeatable sales channel.',
  },
  career_move: {
    action: 'Prepare a focused role story, update proof of work, and watch internal openings as well as external approaches.',
    delay: 'Unclear role direction, weak timing carriers, or mixed senior support can delay the move.',
    likely: 'A meaningful career move looks more likely than not when role-change evidence and timing support agree.',
    possible: 'A career move is possible, but the evidence is not yet clean enough to call it strongly open.',
    strengthen: 'Sharper role positioning and visible ownership of current work strengthen the career-move promise.',
    trigger: 'The trigger may come through a manager shift, team restructuring, recruiter contact, or a role opened by someone leaving.',
  },
  court_litigation: {
    action: 'Keep documentation tight, avoid emotional escalation, and treat legal advice as the practical authority.',
    delay: 'Weak settlement indicators, procedural delay, or conflicting timing evidence can stretch the matter.',
    likely: 'A constructive legal step is more likely when settlement, documentation, and timing evidence support each other.',
    possible: 'Movement is possible, but Predicta needs cleaner evidence before calling the outcome strong.',
    strengthen: 'Clear paperwork, calm negotiation, and realistic settlement terms strengthen the path.',
    trigger: 'The trigger is likely to be a filing, notice, hearing date, settlement proposal, or procedural deadline.',
  },
  education_study_stream: {
    action: 'Choose the path where aptitude, consistency, and opportunity all overlap instead of chasing prestige alone.',
    delay: 'Confusion between interest and discipline, exam pressure, or family expectations can delay clarity.',
    likely: 'A better-supported study direction becomes clearer when education indicators and timing agree.',
    possible: 'A study direction is visible, but the proof needs stronger timing or aptitude evidence before a firm call.',
    strengthen: 'Trial projects, exam routine, and mentor feedback strengthen the choice.',
    trigger: 'The trigger is likely to come through exam results, admission windows, mentor advice, or a course opportunity.',
  },
  family_child_matching: {
    action: 'Keep expectations simple, document practical needs, and avoid forcing a decision before emotional clarity appears.',
    delay: 'Family pressure, mismatched expectations, or unresolved past tension can slow the matter.',
    likely: 'Family or matching progress looks stronger when emotional support and timing evidence agree.',
    possible: 'Progress is possible, but the evidence asks for patience and one more layer of clarity.',
    strengthen: 'Honest conversations, realistic timelines, and elder support strengthen the outcome.',
    trigger: 'The trigger may come through a family conversation, proposal, medical/planning milestone, or matching discussion.',
  },
  foreign_travel: {
    action: 'Keep documents, manager conversations, and opportunity readiness prepared before the window opens.',
    delay: 'Documentation gaps, weak institutional support, or timing conflict can delay foreign movement.',
    likely: 'Foreign movement looks more likely than not when work/travel houses, timing, and event proof agree.',
    possible: 'Foreign movement is possible, but Predicta needs cleaner timing before calling it a strong opening.',
    strengthen: 'A clear work case, updated documents, and proactive communication strengthen the foreign-travel promise.',
    trigger: 'The trigger may come through your existing company, a senior colleague, team restructuring, client need, visa process, or a role opened by someone leaving.',
  },
  guide_me: {
    action: 'Start with the area where pressure, timing, and decision urgency are strongest.',
    delay: 'A broad question delays the answer because the evidence cannot be judged against one clear event.',
    likely: 'Predicta can guide the first question once the strongest life area has enough evidence.',
    possible: 'A useful first direction is visible, but one sharper area will make the answer much stronger.',
    strengthen: 'Pick one life area and one timeframe so the evidence can become event-specific.',
    trigger: 'The trigger is likely to be the life area currently showing the strongest timing pressure.',
  },
  job_change: {
    action: 'Apply selectively, protect your current stability, and compare offers against long-term role fit.',
    delay: 'Weak offer quality, unclear interviews, or fear of leaving stability can delay the job change.',
    likely: 'A job change looks more likely when job-change proof, timing, and external triggers agree.',
    possible: 'A job change is possible, but the current proof is not strong enough for a confident window.',
    strengthen: 'Better interview preparation, clearer salary boundaries, and network follow-ups strengthen the path.',
    trigger: 'The trigger may be an interview call, manager change, project closure, new team need, or offer from an existing contact.',
  },
  marriage_timing: {
    action: 'Keep the process sincere but practical: family alignment, emotional readiness, and timing all matter.',
    delay: 'Family disagreement, emotional uncertainty, or weak commitment indicators can delay marriage.',
    likely: 'Marriage timing looks stronger when relationship, family, and timing evidence agree.',
    possible: 'Marriage is possible, but Predicta needs cleaner commitment and timing proof before calling a strong window.',
    strengthen: 'Clear expectations, family communication, and mature proposal handling strengthen the path.',
    trigger: 'The trigger may be a proposal, family conversation, introduction, reconciliation, or formal commitment discussion.',
  },
  money_property: {
    action: 'Check paperwork, cash-flow safety, and timing before locking a major money or property decision.',
    delay: 'Loan friction, documentation gaps, emotional urgency, or mixed property timing can delay progress.',
    likely: 'A money or property step looks more likely when financial support and timing evidence agree.',
    possible: 'A money/property move is possible, but the evidence is asking for one more practical check.',
    strengthen: 'Due diligence, conservative budgeting, and clean agreements strengthen the outcome.',
    trigger: 'The trigger may come through a loan update, seller/buyer response, paperwork clearance, or investment opening.',
  },
  promotion: {
    action: 'Make your impact visible, document wins, and align with decision-makers before the review window.',
    delay: 'Invisible work, senior-level hesitation, or delayed review cycles can slow recognition.',
    likely: 'Promotion or recognition looks more likely when authority, performance, and timing evidence agree.',
    possible: 'Recognition is possible, but the proof still needs stronger support from authority/timing indicators.',
    strengthen: 'Visible ownership, clear metrics, and senior trust strengthen the promotion promise.',
    trigger: 'The trigger may be a review cycle, senior leader change, project success, or an opening above you.',
  },
  relationship_outcome: {
    action: 'Ask for clarity without pressure and watch whether actions match promises.',
    delay: 'Mixed emotional signals, unresolved past patterns, or weak commitment proof can delay the outcome.',
    likely: 'The relationship direction looks more constructive when commitment, timing, and emotional evidence agree.',
    possible: 'A positive direction is possible, but the evidence is mixed enough to avoid a hard promise.',
    strengthen: 'Direct conversation, emotional steadiness, and consistent behavior strengthen the relationship path.',
    trigger: 'The trigger may be a serious conversation, family involvement, distance/change in routine, or a decision about commitment.',
  },
  relocation: {
    action: 'Plan the move around practical stability: role, housing, family needs, and timing.',
    delay: 'Family resistance, paperwork gaps, weak housing/job support, or timing conflict can delay relocation.',
    likely: 'Relocation looks more likely when movement, stability, and timing evidence agree.',
    possible: 'Relocation is possible, but the evidence does not yet show a clean push or support window.',
    strengthen: 'Clear logistics, financial buffer, and practical support strengthen relocation.',
    trigger: 'The trigger may be a transfer, housing decision, family need, job shift, or personal reset window.',
  },
  visa_pr: {
    action: 'Keep documents precise, avoid rushed submissions, and track official deadlines carefully.',
    delay: 'Paperwork gaps, institutional delay, or mixed approval indicators can slow visa/PR progress.',
    likely: 'Visa or PR progress looks more likely when document, foreign, and timing evidence agree.',
    possible: 'Visa/PR progress is possible, but Predicta needs cleaner approval evidence before a strong call.',
    strengthen: 'Accurate documents, timely filing, and professional process discipline strengthen approval chances.',
    trigger: 'The trigger may be a document request, employer/sponsor update, embassy/immigration response, or application milestone.',
  },
  wellness_caution: {
    action: 'Use this as routine guidance only, and speak to a qualified medical professional for diagnosis or urgent symptoms.',
    delay: 'Stress, irregular routine, or ignored recovery signals can prolong the pressure.',
    likely: 'A wellness caution is visible when stress and routine indicators are active together.',
    possible: 'A mild caution is possible, but this is not medical proof or diagnosis.',
    strengthen: 'Sleep rhythm, hydration, movement, and professional care where needed strengthen wellbeing.',
    trigger: 'The trigger may be workload pressure, sleep disruption, travel, family stress, or routine imbalance.',
  },
};

const CONFIDENCE_LABELS: Record<EventOraclePredictionConfidence['level'], EventOraclePredictionConfidence['label']> = {
  high: 'High',
  low: 'Low',
  medium: 'Medium',
  not_enough_evidence: 'Not enough evidence',
};

function layerNames(layers: EventOracleEvidenceLayer[]): string {
  return layers.map(layer => layer.label).join(', ');
}

function supportingLayers(contract: EventOracleEvidenceContract): EventOracleEvidenceLayer[] {
  return contract.layers.filter(
    layer => !layer.isOptional && layer.availability !== 'missing' && layer.stance === 'supports',
  );
}

function blockingLayers(contract: EventOracleEvidenceContract): EventOracleEvidenceLayer[] {
  return contract.layers.filter(
    layer =>
      !layer.isOptional &&
      layer.availability !== 'missing' &&
      (layer.stance === 'blocks' || layer.stance === 'mixed'),
  );
}

function determineOutcome(contract: EventOracleEvidenceContract): EventOraclePredictionOutcome {
  if (contract.notEnoughEvidence) return 'needs_evidence';
  if (contract.conflictScore >= 45 && contract.conflictScore > contract.agreementScore) return 'blocked';
  if (contract.status === 'conflicted') return 'mixed';
  if (contract.conflictScore > 0) return 'delayed';
  if (contract.confidence.level === 'high') return 'likely';
  return 'possible';
}

function normalizeTimingWindow(
  contract: EventOracleEvidenceContract,
  timing?: EventOracleTimingInput,
): EventOracleTimingWindow {
  if (!timing || contract.notEnoughEvidence) {
    return {
      basis: contract.notEnoughEvidence
        ? 'Required source evidence is missing.'
        : 'Evidence exists, but no deterministic timing window has been supplied yet.',
      honestyNote:
        'Predicta is not giving an exact date because the current evidence does not support one.',
      label: 'Not precise yet',
      precision: 'not_precise_yet',
      sourceLayerIds: [],
    };
  }

  if (timing.precision === 'exact_date' && (!timing.exactDateSupported || !timing.startDate)) {
    return {
      basis: timing.basis,
      honestyNote:
        'An exact date was requested, but the supplied evidence does not prove exact-date precision, so Predicta downgraded it.',
      label: 'Not precise yet',
      precision: 'not_precise_yet',
      sourceLayerIds: timing.evidenceLayerIds,
    };
  }

  return {
    basis: timing.basis,
    endDate: timing.endDate,
    honestyNote:
      timing.precision === 'exact_date'
        ? 'Exact date is allowed only because deterministic evidence explicitly supports it.'
        : 'This is a practical timing window, not a guaranteed date.',
    label: timing.label,
    precision: timing.precision,
    sourceLayerIds: timing.evidenceLayerIds,
    startDate: timing.startDate,
  };
}

function buildDirectAnswer(
  outcome: EventOraclePredictionOutcome,
  template: CategoryPredictionTemplate,
  contract: EventOracleEvidenceContract,
): string {
  if (outcome === 'needs_evidence') {
    return 'Predicta cannot responsibly answer this yet because the required evidence is missing.';
  }
  if (outcome === 'blocked') {
    return `This looks blocked or not ready right now. Support exists at ${contract.agreementScore}/100, but conflict is stronger at ${contract.conflictScore}/100.`;
  }
  if (outcome === 'mixed') {
    return `This is mixed. Some evidence supports the event, but conflicting proof lowers confidence, so Predicta would not promise it yet.`;
  }
  if (outcome === 'delayed') {
    return `${template.possible} Conflicting evidence suggests delay, so treat this as possible but not smooth yet.`;
  }
  if (outcome === 'likely') return template.likely;
  return template.possible;
}

function buildTrigger(
  categoryId: EventQuestionCategoryId,
  contract: EventOracleEvidenceContract,
  trigger?: EventOracleTriggerInput,
): EventOracleMostLikelyTrigger {
  if (trigger && !contract.notEnoughEvidence) {
    return {
      sourceLayerIds: trigger.evidenceLayerIds,
      summary: trigger.summary,
      title: trigger.label,
    };
  }

  return {
    sourceLayerIds: supportingLayers(contract).map(layer => layer.layerId),
    summary: CATEGORY_TEMPLATES[categoryId].trigger,
    title: contract.notEnoughEvidence ? 'Trigger not reliable yet' : 'Most likely trigger to watch',
  };
}

function buildDelayFactors(
  categoryId: EventQuestionCategoryId,
  contract: EventOracleEvidenceContract,
): string[] {
  const factors = [CATEGORY_TEMPLATES[categoryId].delay];
  const blockers = blockingLayers(contract);
  const requiredMissing = contract.missingEvidenceFlags.filter(flag => !flag.optional);
  if (blockers.length) {
    factors.push(`Evidence conflict from ${layerNames(blockers)} can delay or weaken the event.`);
  }
  if (requiredMissing.length) {
    factors.push(
      `Missing required evidence (${requiredMissing.map(flag => flag.layerId).join(', ')}) prevents a stronger answer.`,
    );
  }
  return factors;
}

function buildStrengthFactors(
  categoryId: EventQuestionCategoryId,
  contract: EventOracleEvidenceContract,
): string[] {
  const factors = [CATEGORY_TEMPLATES[categoryId].strengthen];
  const supporters = supportingLayers(contract);
  if (supporters.length) {
    factors.push(`Supportive proof is currently coming from ${layerNames(supporters)}.`);
  }
  if (contract.confidence.level === 'high') {
    factors.push('Multiple required evidence rooms agree, so Predicta can speak with stronger confidence.');
  }
  return factors;
}

function buildActions(categoryId: EventQuestionCategoryId, contract: EventOracleEvidenceContract): string[] {
  const actions = [CATEGORY_TEMPLATES[categoryId].action];
  if (contract.notEnoughEvidence) {
    actions.push('Prepare the missing source evidence before asking for a precise timing answer.');
  } else if (contract.status === 'conflicted') {
    actions.push('Do not force the decision yet; watch for the conflict layer to soften before acting aggressively.');
  } else {
    actions.push('Track the trigger window and keep practical readiness high, but avoid treating astrology as a guarantee.');
  }
  return actions;
}

function buildCollapsedEvidence(
  contract: EventOracleEvidenceContract,
): EventOracleCollapsedEvidenceItem[] {
  return contract.layers.map(layer => ({
    availability: layer.availability,
    label: layer.label,
    layerId: layer.layerId,
    sourceAware: true,
    stance: layer.stance,
    summary: layer.summary,
  }));
}

function buildConfidence(contract: EventOracleEvidenceContract): EventOraclePredictionConfidence {
  const rawScore = Math.max(0, contract.agreementScore - Math.round(contract.conflictScore * 0.85));
  const missingPenalty = contract.missingEvidenceFlags.filter(flag => !flag.optional).length * 8;
  const score =
    contract.confidence.level === 'not_enough_evidence'
      ? 0
      : Math.max(1, Math.min(100, rawScore - missingPenalty));

  return {
    evidenceBacked: true,
    explanation: contract.confidence.explanation,
    label: CONFIDENCE_LABELS[contract.confidence.level],
    level: contract.confidence.level,
    score,
  };
}

export function buildEventOraclePredictionObject(
  input: EventOraclePredictionInput,
): EventOraclePredictionObject {
  const { evidenceContract, refinement } = input;
  const template = CATEGORY_TEMPLATES[refinement.categoryId];
  const outcome = determineOutcome(evidenceContract);
  return {
    collapsedEvidence: buildCollapsedEvidence(evidenceContract),
    confidence: buildConfidence(evidenceContract),
    contractVersion: 'event-oracle-prediction-phase-4-v1',
    deterministic: true,
    directAnswer: buildDirectAnswer(outcome, template, evidenceContract),
    evidenceContractVersion: evidenceContract.contractVersion,
    mostLikelyTrigger: buildTrigger(refinement.categoryId, evidenceContract, input.trigger),
    noGuaranteedOutcome: true,
    outcome,
    question: {
      categoryId: refinement.categoryId,
      original: refinement.originalQuestion,
      refined: refinement.refinedQuestion,
    },
    timingWindow: normalizeTimingWindow(evidenceContract, input.timing),
    whatCanDelayIt: buildDelayFactors(refinement.categoryId, evidenceContract),
    whatCanStrengthenIt: buildStrengthFactors(refinement.categoryId, evidenceContract),
    whatToDoNow: buildActions(refinement.categoryId, evidenceContract),
  };
}
