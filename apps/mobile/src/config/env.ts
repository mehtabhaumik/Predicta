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
  enableMockBilling: runtimeEnv.PRIDICTA_ENABLE_MOCK_BILLING === 'true',
};
