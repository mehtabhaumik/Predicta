import type {
  AstrologyMemory,
  ConversationTurn,
  IntentDetectionResult,
} from '@pridicta/types';

const BANNED_OPENINGS = [
  /^based on your chart[,:\s-]*/i,
  /^according to vedic astrology[,:\s-]*/i,
  /^your birth chart shows[,:\s-]*/i,
  /^as a vedic astrologer[,:\s-]*/i,
];

const OPENING_VARIANTS = {
  anxious: [
    'I understand why this is weighing on you.',
    'Let me hold this carefully with you.',
  ],
  sad: [
    'I can feel the heaviness behind this question.',
    'Let me stay with this gently.',
  ],
  hopeful: [
    'There is something real worth listening to here.',
    'Let me read this with steadiness, not hurry.',
  ],
  neutral: [
    'Let me read this directly.',
    'There are a couple of clear layers here.',
  ],
};

function normalize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function jaccardSimilarity(a: string, b: string): number {
  const left = new Set(normalize(a));
  const right = new Set(normalize(b));
  if (left.size === 0 || right.size === 0) {
    return 0;
  }
  const intersection = [...left].filter(value => right.has(value)).length;
  const union = new Set([...left, ...right]).size;
  return intersection / union;
}

function rewriteOpening(text: string, replacement: string): string {
  const trimmed = text.trim();
  for (const pattern of BANNED_OPENINGS) {
    if (pattern.test(trimmed)) {
      return trimmed.replace(pattern, `${replacement} `).trim();
    }
  }

  const sentenceBoundary = trimmed.indexOf(' ');
  if (sentenceBoundary > 0 && sentenceBoundary < 40) {
    return `${replacement} ${trimmed}`;
  }

  return `${replacement} ${trimmed}`;
}

function chooseOpening(
  tone: IntentDetectionResult['emotionalTone'] | undefined,
  text: string,
): string {
  const pool =
    OPENING_VARIANTS[tone === 'anxious' || tone === 'sad' || tone === 'hopeful' ? tone : 'neutral'];
  const index = Math.abs(text.length) % pool.length;
  return pool[index];
}

export function guardPredictaResponse(input: {
  text: string;
  history?: ConversationTurn[];
  memory?: AstrologyMemory;
  intentProfile?: IntentDetectionResult;
}): string {
  let guarded = input.text.trim();
  const recentAssistantResponses = (input.history ?? [])
    .filter(turn => turn.role === 'pridicta')
    .slice(-3)
    .map(turn => turn.text.trim());

  const hasBannedOpening = BANNED_OPENINGS.some(pattern => pattern.test(guarded));
  const isTooSimilar = recentAssistantResponses.some(
    previous => previous && jaccardSimilarity(previous, guarded) >= 0.72,
  );

  if (hasBannedOpening || isTooSimilar) {
    guarded = rewriteOpening(
      guarded,
      chooseOpening(
        input.intentProfile?.emotionalTone ?? input.memory?.emotionalTone,
        guarded,
      ),
    );
  }

  if (
    input.intentProfile?.isFollowUp &&
    input.memory?.lastIntent &&
    !guarded.toLowerCase().includes(input.memory.lastIntent.replace(/_/g, ' '))
  ) {
    guarded = `${guarded} I am staying with the ${input.memory.lastIntent.replace(/_/g, ' ')} thread you opened.`;
  }

  return guarded.replace(/\s+/g, ' ').trim();
}
