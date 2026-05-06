'use client';

import type { PredictaWrappedActivity } from '@pridicta/types';

const WEB_CHAT_MEMORY_KEY = 'predicta.webChatMemory.v4';

type StoredWebChatMessage = {
  role?: string;
  text?: string;
  blocks?: unknown[];
};

type StoredWebChatMemory = {
  messages?: StoredWebChatMessage[];
};

export function loadWebWrappedActivity(): PredictaWrappedActivity {
  const messages = loadChatMessages();
  const userMessages = messages.filter(message => message.role === 'user');
  const deepReadings = messages.filter(
    message => Array.isArray(message.blocks) && message.blocks.length > 0,
  ).length;

  return {
    deepReadings,
    questionsAsked: userMessages.length,
    reportsGenerated: 0,
    savedQuestions: userMessages
      .map(message => message.text?.trim())
      .filter((text): text is string => Boolean(text))
      .slice(-3),
  };
}

function loadChatMessages(): StoredWebChatMessage[] {
  try {
    const raw = window.localStorage.getItem(WEB_CHAT_MEMORY_KEY);
    const memory = raw ? (JSON.parse(raw) as StoredWebChatMemory) : undefined;

    return Array.isArray(memory?.messages) ? memory.messages : [];
  } catch {
    return [];
  }
}
