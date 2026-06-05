import type {
  KundliData,
  KundliKarmaConfidence,
  KundliKarmaCrossReference,
  KundliKarmaDepth,
  KundliKarmaIntelligence,
  KundliKarmaItem,
  KundliKarmaItemStatus,
  KundliKarmaModule,
  KundliKarmaRankedCondition,
  KundliKarmaRemedy,
  KundliKarmaRemedyPlanCategory,
  KundliKarmaRemedyPlanItem,
  KundliKarmaSnapshot,
  KundliKarmaStrength,
} from '@pridicta/types';
import {
  KUNDLI_KARMA_CONTRACT_VERSION,
} from './kundliKarmaContract';
import { composeKundliKarmaDoshIntelligence } from './kundliKarmaDoshEngine';
import { composeKundliKarmaLalKitabIntelligence } from './kundliKarmaLalKitabEngine';
import { composeKundliKarmaShrapIntelligence } from './kundliKarmaShrapEngine';
import { composeKundliKarmaYogIntelligence } from './kundliKarmaYogEngine';

export type ComposeKundliKarmaSnapshotOptions = {
  intelligencePackets?: KundliKarmaIntelligence[];
};

type ScoredItem = {
  dedupedWith: KundliKarmaCrossReference[];
  item: KundliKarmaItem;
  score: number;
};

export function composeKundliKarmaSnapshot(
  kundli?: KundliData,
  options: ComposeKundliKarmaSnapshotOptions = {},
): KundliKarmaSnapshot {
  const packets = options.intelligencePackets ?? buildPackets(kundli);
  const subjectName = kundli?.birthDetails.name ?? packets.find(packet => packet.subjectName)?.subjectName ?? 'Pending Kundli';
  const allItems = packets.flatMap(packet => packet.items);
  const activeItems = allItems.filter(item => activeStatus(item.status));
  const deduped = dedupeItems(activeItems);
  const rankedConditions = rankItems(deduped.kept).map((scored, index) => toRankedCondition(scored, index + 1));
  const remedyPlan = buildConsolidatedRemedyPlan(rankedConditions);
  const topThree = rankedConditions.slice(0, 3);
  const strongestDosh = firstByModule(rankedConditions, 'DOSH');
  const strongestYog = rankedConditions.find(condition =>
    condition.item.module === 'SUPPORTIVE_YOG' || condition.item.module === 'CHALLENGING_YOG',
  );
  const strongestShrapOrRin =
    firstByModule(rankedConditions, 'SHRAP') ??
    rankedConditions.find(condition => condition.item.module === 'LAL_KITAB' && /Rin|debt/i.test(condition.item.displayName));

  return {
    calculationStatus: packets.some(packet => packet.calculationStatus === 'needs_data')
      ? 'needs_data'
      : packets.some(packet => packet.calculationStatus === 'partial')
        ? 'partial'
        : 'ready',
    dedupedItemIds: deduped.removed.map(item => item.id),
    generatedBy: 'deterministic_contract',
    missingData: unique(packets.flatMap(packet => packet.missingData)),
    noAiRequiredFor: [
      'show Kundli Karma snapshot',
      'show top 3 active conditions',
      'explain why a condition ranked first',
      'show consolidated remedy plan',
      'explain Dosh/Shrap/Yog/Lal Kitab dedupe',
    ],
    rankedConditions,
    remedyPlan,
    safetyNotes: [
      'Ranking prioritizes clear, strong, currently relevant evidence over severe-sounding weak labels.',
      'Duplicate Dosh, Shrap, Yog, and Lal Kitab readings are cross-referenced instead of repeated.',
      'The remedy plan consolidates repeated remedies and keeps free actions simple, safe, and low-cost.',
    ],
    strongestDosh,
    strongestShrapOrRin,
    strongestYog,
    subjectName,
    summary: topThree.length
      ? `Predicta ranked ${topThree.map(condition => condition.item.displayName).join(', ')} as the top Kundli Karma conditions to review first.`
      : 'Predicta did not find major active Kundli Karma conditions in the current chart evidence.',
    topRemedy: remedyPlan.find(item => item.category === 'free_karma_dharma_action') ?? remedyPlan[0],
    topThreeActiveConditions: topThree,
    version: KUNDLI_KARMA_CONTRACT_VERSION,
  };
}

function buildPackets(kundli?: KundliData): KundliKarmaIntelligence[] {
  return [
    composeKundliKarmaDoshIntelligence(kundli),
    composeKundliKarmaShrapIntelligence(kundli),
    composeKundliKarmaYogIntelligence(kundli),
    composeKundliKarmaLalKitabIntelligence(kundli),
  ];
}

function dedupeItems(items: KundliKarmaItem[]): { kept: ScoredItem[]; removed: KundliKarmaItem[] } {
  const byRule = new Map(items.map(item => [item.ruleId, item]));
  const removed: KundliKarmaItem[] = [];
  const kept: ScoredItem[] = [];
  for (const item of items) {
    const dedupeRefs = item.crossReferences.filter(reference => reference.relationship === 'do_not_duplicate');
    const activeOwnerRefs = dedupeRefs.filter(reference => byRule.has(reference.ruleId));
    if (activeOwnerRefs.length) {
      removed.push(item);
      continue;
    }
    kept.push({
      dedupedWith: dedupeRefs,
      item,
      score: scoreItem(item),
    });
  }
  return { kept, removed };
}

function rankItems(items: ScoredItem[]): ScoredItem[] {
  return [...items].sort((first, second) => second.score - first.score || first.item.displayName.localeCompare(second.item.displayName));
}

function toRankedCondition(scored: ScoredItem, rank: number): KundliKarmaRankedCondition {
  return {
    dedupedWith: scored.dedupedWith,
    item: scored.item,
    rank,
    score: scored.score,
    tooltip: rankingTooltip(scored.item, scored.score),
    whyThisRankedFirst: rankingExplanation(scored.item, scored.score),
  };
}

function scoreItem(item: KundliKarmaItem): number {
  return (
    statusScore(item.status) +
    strengthScore(item.strength) +
    confidenceScore(item.confidence) +
    activationScore(item) +
    moduleRelevanceScore(item.module) -
    severeWeakPenalty(item)
  );
}

function statusScore(status: KundliKarmaItemStatus): number {
  const scores: Record<KundliKarmaItemStatus, number> = {
    blocked_context: 0,
    cancelled: 35,
    needs_data: 0,
    not_present: 0,
    pending_evidence: 10,
    present: 80,
    weak: 42,
  };
  return scores[status];
}

function strengthScore(strength: KundliKarmaStrength): number {
  const scores: Record<KundliKarmaStrength, number> = {
    high: 18,
    low: 4,
    medium: 10,
    none: 0,
    very_high: 24,
  };
  return scores[strength];
}

function confidenceScore(confidence: KundliKarmaConfidence): number {
  const scores: Record<KundliKarmaConfidence, number> = {
    clear: 10,
    partial: 5,
    uncertain: 0,
  };
  return scores[confidence];
}

function activationScore(item: KundliKarmaItem): number {
  return item.activation.confidence === 'clear' ? 18 : item.activation.confidence === 'partial' ? 6 : 0;
}

function moduleRelevanceScore(module: KundliKarmaModule): number {
  const scores: Record<KundliKarmaModule, number> = {
    CHALLENGING_YOG: 7,
    DOSH: 9,
    LAL_KITAB: 4,
    SHRAP: 6,
    SUPPORTIVE_YOG: 8,
  };
  return scores[module];
}

function severeWeakPenalty(item: KundliKarmaItem): number {
  if (item.status !== 'weak') {
    return 0;
  }
  return /Shrap|Kaal Sarp|Arishta|Daridra|Grahan|Vish/i.test(item.displayName) ? 8 : 0;
}

function rankingExplanation(item: KundliKarmaItem, score: number): string {
  return `${item.displayName} ranked here because it is ${item.status}, strength ${item.strength}, confidence ${item.confidence}, with ${item.activation.confidence} timing support and a score of ${score}.`;
}

function rankingTooltip(item: KundliKarmaItem, score: number): string {
  return `Rank uses status, strength, confidence, timing activation, life relevance, and dedupe rules. Severe-sounding weak labels do not automatically outrank clearer stronger evidence. Score: ${score}.`;
}

function firstByModule(
  rankedConditions: KundliKarmaRankedCondition[],
  module: KundliKarmaModule,
): KundliKarmaRankedCondition | undefined {
  return rankedConditions.find(condition => condition.item.module === module);
}

function buildConsolidatedRemedyPlan(rankedConditions: KundliKarmaRankedCondition[]): KundliKarmaRemedyPlanItem[] {
  const plan: KundliKarmaRemedyPlanItem[] = [];
  const seen = new Set<string>();
  for (const condition of rankedConditions.slice(0, 6)) {
    const free = condition.item.remedies.find(remedy => remedy.depth === 'free');
    const premium = condition.item.remedies.find(remedy => remedy.depth === 'premium');
    if (free) {
      pushRemedy(plan, seen, condition, free, 'free_karma_dharma_action');
    }
    if (premium) {
      pushRemedy(plan, seen, condition, premium, 'premium_structured_remedy');
    }
    pushAvoidList(plan, seen, condition);
    pushTimingGuidance(plan, seen, condition);
  }
  return plan;
}

function pushRemedy(
  plan: KundliKarmaRemedyPlanItem[],
  seen: Set<string>,
  condition: KundliKarmaRankedCondition,
  remedy: KundliKarmaRemedy,
  category: KundliKarmaRemedyPlanCategory,
): void {
  const key = normalizeKey(`${category}-${remedy.title}-${remedy.description}`);
  if (seen.has(key)) {
    mergeSource(plan, key, condition);
    return;
  }
  seen.add(key);
  plan.push({
    avoidList: [],
    category,
    depth: remedy.depth,
    description: remedy.description,
    id: key,
    safetyNote: remedy.safetyNote,
    sourceItemIds: [condition.item.id],
    sourceRuleIds: [condition.item.ruleId],
    timingGuidance: condition.item.activation.summary,
    title: remedy.title,
    tradition: remedy.tradition,
  });
}

function pushAvoidList(
  plan: KundliKarmaRemedyPlanItem[],
  seen: Set<string>,
  condition: KundliKarmaRankedCondition,
): void {
  const avoidList = avoidListFor(condition.item);
  if (!avoidList.length) {
    return;
  }
  const key = normalizeKey(`avoid-${avoidList.join('-')}`);
  if (seen.has(key)) {
    mergeSource(plan, key, condition);
    return;
  }
  seen.add(key);
  plan.push({
    avoidList,
    category: 'avoid_list',
    depth: 'free',
    description: `Avoid these while working with ${condition.item.displayName}: ${avoidList.join('; ')}.`,
    id: key,
    safetyNote: 'Avoid-list guidance is behavioral and safe; it is not a fear rule.',
    sourceItemIds: [condition.item.id],
    sourceRuleIds: [condition.item.ruleId],
    timingGuidance: condition.item.activation.summary,
    title: `${condition.item.displayName} avoid-list`,
    tradition: 'karma_dharma',
  });
}

function pushTimingGuidance(
  plan: KundliKarmaRemedyPlanItem[],
  seen: Set<string>,
  condition: KundliKarmaRankedCondition,
): void {
  const key = normalizeKey(`timing-${condition.item.activation.summary}`);
  if (seen.has(key)) {
    mergeSource(plan, key, condition);
    return;
  }
  seen.add(key);
  plan.push({
    avoidList: [],
    category: 'timing_guidance',
    depth: 'free',
    description: condition.item.activation.summary,
    id: key,
    safetyNote: 'Timing guidance is practical attention, not guaranteed outcome.',
    sourceItemIds: [condition.item.id],
    sourceRuleIds: [condition.item.ruleId],
    timingGuidance: condition.item.activation.summary,
    title: `${condition.item.displayName} timing note`,
    tradition: 'karma_dharma',
  });
}

function mergeSource(plan: KundliKarmaRemedyPlanItem[], key: string, condition: KundliKarmaRankedCondition): void {
  const existing = plan.find(item => item.id === key);
  if (!existing) {
    return;
  }
  existing.sourceItemIds = unique([...existing.sourceItemIds, condition.item.id]);
  existing.sourceRuleIds = unique([...existing.sourceRuleIds, condition.item.ruleId]);
}

function avoidListFor(item: KundliKarmaItem): string[] {
  const extracted = item.meaningForUser.match(/Avoid-list:\s*(.+)$/i)?.[1];
  if (extracted) {
    return extracted.split(/[.;]/).map(value => value.trim()).filter(Boolean).slice(0, 3);
  }
  if (item.module === 'LAL_KITAB') {
    return ['Do not mix multiple remedies at once', 'Do not spend under fear', 'Do not expect guaranteed results'];
  }
  if (item.module === 'DOSH' || item.module === 'CHALLENGING_YOG') {
    return ['Do not panic', 'Do not make reactive decisions', 'Do not treat this as fixed fate'];
  }
  if (item.module === 'SHRAP') {
    return ['Do not use blame language', 'Do not carry unhealthy guilt', 'Do not buy fear-based remedies'];
  }
  return ['Do not waste the support through inconsistency'];
}

function activeStatus(status: KundliKarmaItemStatus): boolean {
  return status === 'present' || status === 'weak' || status === 'cancelled';
}

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 140);
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
