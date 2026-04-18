import { env } from '../../../config/env';
import { GEMINI_MODELS } from '../../../config/aiModels';

export function isGeminiConfigured(): boolean {
  return env.allowDirectMobileAiCalls && env.googleGenAiApiKey.length > 0;
}

export async function summarizeWithGemini(
  prompt: string,
  model = GEMINI_MODELS.FLASH_HELPER,
): Promise<string | null> {
  if (!isGeminiConfigured()) {
    return null;
  }

  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: env.googleGenAiApiKey });
  const response = await ai.models.generateContent({
    contents: prompt,
    model,
  });

  return response.text?.trim() ?? null;
}
