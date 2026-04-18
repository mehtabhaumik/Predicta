export const OPENAI_MODELS = {
  FREE_REASONING: 'gpt-5.4-mini',
  PREMIUM_DEEP_ANALYSIS: 'gpt-5.2',
} as const;

export const GEMINI_MODELS = {
  FLASH_HELPER: 'gemini-2.5-flash',
  PRO_FUTURE: 'gemini-2.5-pro',
} as const;

export const AI_ENV_KEYS = {
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  GOOGLE_GENAI_API_KEY: 'GOOGLE_GENAI_API_KEY',
  ALLOW_DIRECT_MOBILE_AI: 'PRIDICTA_ALLOW_DIRECT_MOBILE_AI',
} as const;

export const AI_CONTEXT_LIMITS = {
  MAX_HISTORY_TURNS: 8,
  FREE_MAX_OUTPUT_TOKENS: 420,
  PREMIUM_MAX_OUTPUT_TOKENS: 720,
} as const;

// OpenAI is the primary Pridicta brain because final user-facing astrology
// guidance needs one consistent persona, reasoning style, and safety posture.
// Gemini remains isolated as a helper layer for compact formatting or metadata
// shaping, and must never control Pridicta's final tone.
export const AI_PROVIDER_STRATEGY =
  'OpenAI authoritative response generator; Gemini optional utility helper.';
