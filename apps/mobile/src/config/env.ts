type RuntimeProcess = {
  env?: Record<string, string | undefined>;
};

const runtime = globalThis as typeof globalThis & {
  process?: RuntimeProcess;
};

const runtimeEnv = runtime.process?.env ?? {};

export const env = {
  astrologyApiUrl: runtimeEnv.PRIDICTA_ASTRO_API_URL ?? 'http://10.0.2.2:8000',
  googleWebClientId: runtimeEnv.GOOGLE_WEB_CLIENT_ID ?? '',
  openAiApiKey: runtimeEnv.OPENAI_API_KEY ?? '',
  googleGenAiApiKey:
    runtimeEnv.GOOGLE_GENAI_API_KEY ?? runtimeEnv.GEMINI_API_KEY ?? '',
  allowDirectMobileAiCalls:
    runtimeEnv.PRIDICTA_ALLOW_DIRECT_MOBILE_AI === 'true',
  enableMockBilling: runtimeEnv.PRIDICTA_ENABLE_MOCK_BILLING === 'true',
};

export const isAiRuntimeConfigured =
  env.allowDirectMobileAiCalls && env.openAiApiKey.length > 0;
