import { env } from '../../../config/env';
import { AI_CONTEXT_LIMITS } from '../../../config/aiModels';

type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

type OpenAIResponseInput = {
  model: string;
  messages: OpenAIMessage[];
  maxOutputTokens?: number;
};

function extractOutputText(response: unknown): string {
  const candidate = response as {
    output_text?: string;
    output?: Array<{
      content?: Array<{
        text?: string;
        type?: string;
      }>;
    }>;
  };

  if (candidate.output_text) {
    return candidate.output_text;
  }

  return (
    candidate.output
      ?.flatMap(item => item.content ?? [])
      .map(content => content.text)
      .filter(Boolean)
      .join('\n')
      .trim() ?? ''
  );
}

export function isOpenAIConfigured(): boolean {
  return env.allowDirectMobileAiCalls && env.openAiApiKey.length > 0;
}

export async function generateOpenAIResponse({
  maxOutputTokens = AI_CONTEXT_LIMITS.FREE_MAX_OUTPUT_TOKENS,
  messages,
  model,
}: OpenAIResponseInput): Promise<string | null> {
  if (!isOpenAIConfigured()) {
    return null;
  }

  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({
    apiKey: env.openAiApiKey,
    dangerouslyAllowBrowser: true,
  });

  const response = await client.responses.create({
    input: messages.map(message => ({
      content: message.content,
      role: message.role,
    })),
    max_output_tokens: maxOutputTokens,
    model,
  });

  return extractOutputText(response);
}
