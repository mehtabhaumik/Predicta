export const OPENAI_MODELS = {
  FREE_REASONING: 'gpt-5.4-mini',
  PREMIUM_DEEP_ANALYSIS: 'gpt-5.5',
} as const;

export const GEMINI_MODELS = {
  FLASH_HELPER: 'gemini-2.5-flash',
  PRO_FUTURE: 'gemini-2.5-pro',
} as const;

export const AI_ENV_KEYS = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  GEMINI_API_KEY: 'GEMINI_API_KEY',
  FREE_MODEL: 'PRIDICTA_OPENAI_FREE_MODEL',
  PREMIUM_MODEL: 'PRIDICTA_OPENAI_PREMIUM_MODEL',
  GEMINI_FREE_MODEL: 'PRIDICTA_GEMINI_FREE_MODEL',
  GEMINI_PREMIUM_MODEL: 'PRIDICTA_GEMINI_PREMIUM_MODEL',
} as const;

export const AI_CONTEXT_LIMITS = {
  MAX_HISTORY_TURNS: 8,
  FREE_MAX_OUTPUT_TOKENS: 420,
  PREMIUM_MAX_OUTPUT_TOKENS: 720,
} as const;

// OpenAI is the primary Pridicta brain and Gemini is the server-side fallback.
// Mobile and web clients consume the same backend AI contract so API keys and
// final prompt orchestration never live inside client bundles.
export const AI_PROVIDER_STRATEGY =
  'Predicta uses the best available answer path and a backup path when needed.';
