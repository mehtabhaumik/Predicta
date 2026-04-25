import {
  createInitialAstrologyMemory,
  getConversationSummary as buildConversationSummary,
  getUserAstrologyMemory as deriveUserAstrologyMemory,
  updateConversationSummary as syncConversationSummary,
  updateUserAstrologyMemory as mergeUserAstrologyMemory,
} from '@pridicta/ai';
import type { AstrologyMemory, ChartContext, ConversationTurn, KundliData } from '../../types/astrology';
import { useAppStore } from '../../store/useAppStore';

type MemoryUpdateInput = {
  message?: string;
  history?: ConversationTurn[];
  kundli?: KundliData;
  chartContext?: ChartContext;
  assistantResponse?: string;
};

export function getUserAstrologyMemory(): AstrologyMemory {
  return useAppStore.getState().getAstrologyMemory();
}

export function updateUserAstrologyMemory(
  input: MemoryUpdateInput = {},
): AstrologyMemory {
  const state = useAppStore.getState();
  const existingMemory = state.getAstrologyMemory() ?? createInitialAstrologyMemory();
  const nextHistory =
    input.assistantResponse && input.history
      ? [...input.history, { role: 'pridicta' as const, text: input.assistantResponse }]
      : input.history;

  const nextMemory = mergeUserAstrologyMemory({
    chartContext: input.chartContext,
    existingMemory,
    history: nextHistory,
    kundli: input.kundli,
    message: input.message,
    preferredLanguage: state.preferredLanguage,
  });

  state.setAstrologyMemory(nextMemory);
  return nextMemory;
}

export function getConversationSummary(): string {
  const state = useAppStore.getState();
  return buildConversationSummary(state.getAstrologyMemory(), state.getActiveConversation());
}

export function updateConversationSummary(): AstrologyMemory {
  const state = useAppStore.getState();
  const nextMemory = syncConversationSummary(
    state.getAstrologyMemory(),
    state.getActiveConversation(),
  );
  state.setAstrologyMemory(nextMemory);
  return nextMemory;
}

export function deriveAstrologyMemoryForRequest(input: MemoryUpdateInput = {}): AstrologyMemory {
  const state = useAppStore.getState();
  return deriveUserAstrologyMemory({
    chartContext: input.chartContext,
    existingMemory: state.getAstrologyMemory(),
    history: input.history,
    kundli: input.kundli,
    message: input.message,
    preferredLanguage: state.preferredLanguage,
  });
}
