import {
  ASSISTANT_STREAM_INTERVAL_MS,
  estimateAssistantStreamTicks,
  getAssistantStreamChunkSize,
} from '../src/utils/chatStreaming';

describe('chat streaming performance helpers', () => {
  it('uses larger chunks for longer answers to avoid excessive renders', () => {
    expect(getAssistantStreamChunkSize(120)).toBe(5);
    expect(getAssistantStreamChunkSize(600)).toBe(8);
    expect(getAssistantStreamChunkSize(1200)).toBe(12);
    expect(getAssistantStreamChunkSize(2200)).toBe(18);
  });

  it('keeps long assistant responses within a bounded render count', () => {
    expect(estimateAssistantStreamTicks(2400)).toBeLessThanOrEqual(134);
    expect(ASSISTANT_STREAM_INTERVAL_MS).toBeGreaterThanOrEqual(24);
  });
});
