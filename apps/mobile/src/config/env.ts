import {
  PREDICTA_PROTECTED_BACKEND_URL,
  resolveBackendUrl,
} from '@pridicta/config';

type RuntimeProcess = {
  env?: Record<string, string | undefined>;
};

const runtime = globalThis as typeof globalThis & {
  process?: RuntimeProcess;
};

const runtimeEnv = runtime.process?.env ?? {};

const firebaseWebClientId =
  '759876006782-ec13l7kaucdpoul4eo5mqgtqj76h4dat.apps.googleusercontent.com';

export const env = {
  astrologyApiUrl: resolveBackendUrl(runtimeEnv.PRIDICTA_ASTRO_API_URL),
  backendAuthorityUrl: resolveBackendUrl(
    runtimeEnv.PRIDICTA_BACKEND_AUTHORITY_URL ??
      runtimeEnv.PRIDICTA_ASTRO_API_URL,
    PREDICTA_PROTECTED_BACKEND_URL,
  ),
  googleWebClientId: runtimeEnv.GOOGLE_WEB_CLIENT_ID ?? firebaseWebClientId,
  openAiApiKey: runtimeEnv.OPENAI_API_KEY ?? '',
  googleGenAiApiKey:
    runtimeEnv.GOOGLE_GENAI_API_KEY ?? runtimeEnv.GEMINI_API_KEY ?? '',
  allowDirectMobileAiCalls:
    runtimeEnv.PRIDICTA_ALLOW_DIRECT_MOBILE_AI === 'true',
  enableMockBilling: runtimeEnv.PRIDICTA_ENABLE_MOCK_BILLING === 'true',
};

export const isAiRuntimeConfigured =
  env.allowDirectMobileAiCalls && env.openAiApiKey.length > 0;
