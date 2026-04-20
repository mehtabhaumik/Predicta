export const ASSISTANT_STREAM_INTERVAL_MS = 28;

export function getAssistantStreamChunkSize(textLength: number): number {
  if (textLength > 1800) {
    return 18;
  }
  if (textLength > 900) {
    return 12;
  }
  if (textLength > 420) {
    return 8;
  }
  return 5;
}

export function estimateAssistantStreamTicks(textLength: number): number {
  return Math.ceil(Math.max(textLength, 0) / getAssistantStreamChunkSize(textLength));
}
